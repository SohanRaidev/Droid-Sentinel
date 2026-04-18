"""Play Store reputation analyzer.

Performs a live lookup of the APK's package name against the Google Play Store
and cross-validates the app's identity, developer, and signing certificate
organization against the live store listing.
"""

from __future__ import annotations

import json
import os
import re
import html
from typing import Any, Optional
from urllib.parse import quote

import httpx
from bs4 import BeautifulSoup

try:
    from google_play_scraper import app as gplay_app
    from google_play_scraper.exceptions import NotFoundError as GPlayNotFound
    HAS_GPLAY = True
except ImportError:
    HAS_GPLAY = False
    GPlayNotFound = Exception


PLAY_URL = "https://play.google.com/store/apps/details?id={pkg}&hl=en&gl=US"
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)


def _empty_result(package_name: str, reason: str = "") -> dict:
    return {
        "package_name": package_name,
        "play_store": {
            "listed": False,
            "checked": True,
            "title": None,
            "developer": None,
            "developer_id": None,
            "developer_email": None,
            "developer_website": None,
            "installs": None,
            "score": None,
            "ratings": None,
            "price": None,
            "free": None,
            "category": None,
            "updated": None,
            "icon": None,
            "url": f"https://play.google.com/store/apps/details?id={package_name}",
            "content_rating": None,
            "description_short": None,
        },
        "mismatches": [],
        "findings": [],
        "risk_delta": 0,
        "reason": reason,
    }


def _extract_org_from_subject(subject: str) -> str:
    """Pull the O=... / Organization: ... value out of a cert subject string."""
    if not subject:
        return ""
    # androguard human_friendly format: "Common Name: Foo, Organization: Bar, ..."
    m = re.search(r"Organization:\s*([^,]+)", subject, re.IGNORECASE)
    if m:
        return m.group(1).strip()
    # Standard X.500 DN format: "O=Bar, CN=Foo, ..."
    m = re.search(r"\bO=([^,]+)", subject)
    if m:
        return m.group(1).strip()
    m = re.search(r"Common Name:\s*([^,]+)", subject, re.IGNORECASE)
    if m:
        return m.group(1).strip()
    m = re.search(r"\bCN=([^,]+)", subject)
    if m:
        return m.group(1).strip()
    return ""


def _normalize(s: str) -> str:
    """Normalize a string for fuzzy comparison: lowercase, alpha only."""
    if not s:
        return ""
    return re.sub(r"[^a-z0-9]", "", s.lower())


def _names_match(a: str, b: str) -> bool:
    """Compare two organization names with tolerance for suffixes like Inc/LLC."""
    na, nb = _normalize(a), _normalize(b)
    if not na or not nb:
        return False
    for suffix in ("inc", "llc", "ltd", "limited", "gmbh", "corp", "corporation", "co"):
        if na.endswith(suffix):
            na = na[: -len(suffix)]
        if nb.endswith(suffix):
            nb = nb[: -len(suffix)]
    return na == nb or na in nb or nb in na


def _load_known_cert_org(package_name: str) -> str:
    """Return the expected cert org for a known package from the local database."""
    try:
        data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'known_apps.json')
        with open(data_path) as f:
            known = json.load(f)
        return known.get(package_name, {}).get("expected_cert_org", "")
    except Exception:
        return ""


def _fetch_via_scraper(package_name: str) -> dict | None:
    if not HAS_GPLAY:
        return None
    try:
        result = gplay_app(package_name, lang="en", country="us")
        return {
            "title": result.get("title"),
            "developer": result.get("developer"),
            "developer_id": result.get("developerId"),
            "developer_email": result.get("developerEmail"),
            "developer_website": result.get("developerWebsite"),
            "installs": result.get("installs"),
            "score": result.get("score"),
            "ratings": result.get("ratings"),
            "price": result.get("price"),
            "free": result.get("free"),
            "category": result.get("genre"),
            "updated": result.get("updated"),
            "icon": result.get("icon"),
            "content_rating": result.get("contentRating"),
            "description_short": (result.get("summary") or "")[:240],
        }
    except GPlayNotFound:
        return {"__not_found__": True}
    except Exception:
        return None


def _fetch_via_http(package_name: str) -> dict | None:
    """Fallback: scrape the Play Store HTML page directly."""
    try:
        with httpx.Client(timeout=8.0, follow_redirects=True) as client:
            r = client.get(
                PLAY_URL.format(pkg=quote(package_name)),
                headers={"User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.9"},
            )
            if r.status_code == 404:
                return {"__not_found__": True}
            if r.status_code != 200:
                return None
            soup = BeautifulSoup(r.text, "html.parser")

            title = None
            t = soup.find("h1", itemprop="name") or soup.find("h1")
            if t:
                title = html.unescape(t.get_text(strip=True))

            developer = None
            dev_href = None
            dev_link = soup.find("a", href=re.compile(r"/store/apps/dev"))
            if dev_link:
                developer = html.unescape(dev_link.get_text(strip=True))
                dev_href = dev_link.get("href")

            icon = None
            icon_img = soup.find("img", alt=re.compile(r"[Ii]con"))
            if icon_img and icon_img.get("src"):
                icon = icon_img["src"]

            return {
                "title": title,
                "developer": developer,
                "developer_id": dev_href.split("=")[-1] if dev_href else None,
                "developer_email": None,
                "developer_website": None,
                "installs": None,
                "score": None,
                "ratings": None,
                "price": None,
                "free": None,
                "category": None,
                "updated": None,
                "icon": icon,
                "content_rating": None,
                "description_short": None,
            }
    except Exception:
        return None


def check_reputation(metadata: dict, certificate: dict, manifest: dict) -> dict:
    """Cross-validate the APK against its live Play Store listing."""
    package_name = (
        metadata.get("package_name")
        or manifest.get("package_name")
        or ""
    ).strip()

    if not package_name or package_name == "unknown":
        return _empty_result(package_name, reason="No package name available to query")

    store_data = _fetch_via_scraper(package_name)
    if store_data is None:
        store_data = _fetch_via_http(package_name)

    result = _empty_result(package_name)

    if store_data is None:
        # Network or parse failure — don't penalize.
        result["play_store"]["checked"] = False
        result["reason"] = "Play Store lookup unavailable (network or rate-limited)"
        return result

    if store_data.get("__not_found__"):
        # 404: package is not on the Play Store at all.
        result["play_store"]["listed"] = False
        result["risk_delta"] = 18
        result["findings"].append({
            "severity": "high",
            "title": "Not listed on Google Play",
            "description": (
                f"Package '{package_name}' is not published on the official Google Play Store. "
                f"Sideloaded apps that claim legitimate branding but have no Play listing are "
                f"a common delivery vector for malware."
            ),
        })
        return result

    # Listed — fill in data.
    result["play_store"]["listed"] = True
    for k, v in store_data.items():
        if k in result["play_store"]:
            result["play_store"][k] = v

    app_label = metadata.get("app_name") or manifest.get("app_name") or ""
    app_label_norm = app_label.strip().lower()
    play_title = store_data.get("title") or ""
    play_developer = store_data.get("developer") or ""

    cert_subject = ""
    if certificate.get("certificates"):
        cert_subject = certificate["certificates"][0].get("subject", "")
    cert_org = _extract_org_from_subject(cert_subject)

    # --- Developer vs cert org ---
    # Check if the cert org matches the expected org for this known package (e.g. Facebook Mobile
    # for Meta Platforms apps — the company rebranded but still uses the old cert org name).
    expected_cert_org = _load_known_cert_org(package_name)
    cert_matches_known = bool(
        expected_cert_org and cert_org and (
            expected_cert_org.lower() in cert_org.lower()
            or cert_org.lower() in expected_cert_org.lower()
        )
    )
    if play_developer and cert_org and not _names_match(play_developer, cert_org) and not cert_matches_known:
        result["mismatches"].append({
            "field": "developer_vs_certificate",
            "expected": play_developer,
            "found": cert_org,
        })
        result["risk_delta"] += 40
        result["findings"].append({
            "severity": "critical",
            "title": "Developer mismatch vs. Play Store",
            "description": (
                f"Play Store lists the developer as '{play_developer}', but this APK is signed "
                f"by '{cert_org}'. A legitimate release would be signed by the listed developer. "
                f"This strongly indicates a repackaged or counterfeit build."
            ),
        })

    # --- App title vs manifest label ---
    if play_title and app_label and app_label_norm not in ("unknown", "n/a", "null", "none") and not _names_match(play_title, app_label):
        result["mismatches"].append({
            "field": "title_vs_label",
            "expected": play_title,
            "found": app_label,
        })
        result["risk_delta"] += 12
        result["findings"].append({
            "severity": "high",
            "title": "App title mismatch",
            "description": (
                f"Play Store title is '{play_title}' but the APK's internal label is '{app_label}'. "
                f"Label tampering is often used to disguise repackaged apps."
            ),
        })

    # --- Unsigned for a listed app ---
    if not certificate.get("found") and play_developer:
        result["risk_delta"] += 35
        result["findings"].append({
            "severity": "critical",
            "title": "Unsigned APK impersonates a listed app",
            "description": (
                f"The package name is published on Google Play, but this file has no valid "
                f"signature. This is a definitive repackaging indicator."
            ),
        })

    return result
