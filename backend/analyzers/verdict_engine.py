from __future__ import annotations

import json
import os


SCORING = {
    # Certificate issues
    "cert_missing": 30,
    "cert_expired": 15,
    "cert_self_signed": 20,

    # Per-permission penalties
    "INSTALL_PACKAGES": 25,
    "BIND_ACCESSIBILITY_SERVICE": 20,
    "BIND_DEVICE_ADMIN": 25,
    "READ_SMS": 20,
    "SEND_SMS": 15,
    "RECEIVE_SMS": 20,
    "BIND_NOTIFICATION_LISTENER_SERVICE": 15,
    "PROCESS_OUTGOING_CALLS": 15,
    "RECORD_AUDIO": 10,

    # URL issues
    "ip_address_url": 15,
    "suspicious_domain": 10,

    # Code patterns by severity
    "code_critical": 25,
    "code_high": 15,
    "code_medium": 8,

    # Other
    "is_debuggable": 10,
    "native_libs": 5,
    "multiple_dex": 5,
    "clone_detected": 50,
}


def load_known_apps() -> dict:
    """Load the known apps database."""
    try:
        data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
        known_apps_path = os.path.join(data_dir, 'known_apps.json')
        with open(known_apps_path, 'r') as f:
            return json.load(f)
    except Exception:
        return {}


def compute_verdict(metadata: dict, certificate: dict, manifest: dict, urls: dict, code_patterns: dict, reputation: dict | None = None) -> dict:
    """Compute the overall threat verdict for an APK."""
    risk_score = 0
    key_findings = []
    evidence_count = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
    indicators = {
        "is_clone_candidate": False,
        "certificate_issue": False,
        "dangerous_permissions": False,
        "suspicious_code": False,
        "suspicious_network": False,
        "play_store_mismatch": False,
        "not_on_play_store": False,
    }
    reputation = reputation or {}

    # === Certificate scoring ===
    if not certificate.get("found", False):
        risk_score += SCORING["cert_missing"]
        key_findings.append({
            "severity": "critical",
            "title": "APK is Unsigned",
            "description": "No signing certificate found. Unsigned APKs bypass integrity verification and can be trivially modified."
        })
        evidence_count["critical"] += 1
        indicators["certificate_issue"] = True
    else:
        if certificate.get("is_expired"):
            risk_score += SCORING["cert_expired"]
            key_findings.append({
                "severity": "high",
                "title": "Certificate Has Expired",
                "description": "The signing certificate is past its validity date, indicating the app may be outdated or poorly maintained."
            })
            evidence_count["high"] += 1
            indicators["certificate_issue"] = True

        if certificate.get("is_self_signed"):
            risk_score += SCORING["cert_self_signed"]
            key_findings.append({
                "severity": "high",
                "title": "Self-Signed Certificate",
                "description": "Certificate is self-signed rather than issued by a trusted CA. Common in repackaged/trojanized apps."
            })
            evidence_count["high"] += 1
            indicators["certificate_issue"] = True

    # === Clone detection ===
    known_apps = load_known_apps()
    package_name = metadata.get("package_name", "")

    if package_name in known_apps:
        app_info = known_apps[package_name]
        expected_cert_org = app_info.get("expected_cert_org", "")
        app_name = app_info.get("name", package_name)

        # Check certificate subject for expected organization
        cert_matches = False
        if certificate.get("certificates"):
            for cert in certificate["certificates"]:
                subject = cert.get("subject", "")
                if expected_cert_org.lower() in subject.lower():
                    cert_matches = True
                    break

        if not cert_matches and certificate.get("found"):
            risk_score += SCORING["clone_detected"]
            indicators["is_clone_candidate"] = True
            indicators["certificate_issue"] = True

            cert_subject = "unknown"
            if certificate.get("certificates"):
                cert_subject = certificate["certificates"][0].get("subject", "unknown")

            key_findings.insert(0, {
                "severity": "critical",
                "title": f"CLONE DETECTED: Fake {app_name}",
                "description": (
                    f"Package name '{package_name}' matches official {app_name} but certificate "
                    f"is NOT signed by {expected_cert_org}. Signed by: {cert_subject}. "
                    f"This is a repackaged/trojanized clone of the legitimate app."
                )
            })
            evidence_count["critical"] += 1

        elif not cert_matches and not certificate.get("found"):
            risk_score += SCORING["clone_detected"] // 2
            indicators["is_clone_candidate"] = True
            key_findings.insert(0, {
                "severity": "critical",
                "title": f"POSSIBLE CLONE: Fake {app_name}",
                "description": (
                    f"Package name '{package_name}' matches official {app_name} but APK is unsigned. "
                    f"Official {app_name} is always signed with {expected_cert_org}'s certificate."
                )
            })
            evidence_count["critical"] += 1

    # === Permission scoring ===
    permissions = manifest.get("permissions", [])
    perm_names = [p["name"] for p in permissions]

    high_risk_perms = [
        "INSTALL_PACKAGES", "BIND_ACCESSIBILITY_SERVICE", "BIND_DEVICE_ADMIN",
        "READ_SMS", "SEND_SMS", "RECEIVE_SMS", "BIND_NOTIFICATION_LISTENER_SERVICE",
        "PROCESS_OUTGOING_CALLS", "RECORD_AUDIO"
    ]

    dangerous_found = []
    for perm_short in high_risk_perms:
        full_perm = f"android.permission.{perm_short}"
        if full_perm in perm_names:
            score_add = SCORING.get(perm_short, 0)
            risk_score += score_add
            dangerous_found.append(perm_short)

    if dangerous_found:
        indicators["dangerous_permissions"] = True
        if len(dangerous_found) >= 3:
            key_findings.append({
                "severity": "critical",
                "title": "Multiple Dangerous Permissions",
                "description": f"App requests {len(dangerous_found)} high-risk permissions: {', '.join(dangerous_found[:5])}. This combination is typical of spyware."
            })
            evidence_count["critical"] += 1
        elif len(dangerous_found) >= 1:
            key_findings.append({
                "severity": "high",
                "title": "Dangerous Permissions Requested",
                "description": f"App requests sensitive permissions: {', '.join(dangerous_found)}."
            })
            evidence_count["high"] += 1

    # Debuggable flag
    if manifest.get("flags", {}).get("is_debuggable"):
        risk_score += SCORING["is_debuggable"]
        key_findings.append({
            "severity": "medium",
            "title": "App is Debuggable",
            "description": "App is compiled with debuggable=true. This is a security risk in production and may indicate a tampered/development build."
        })
        evidence_count["medium"] += 1

    # === URL scoring ===
    ip_urls = urls.get("ip_addresses", [])
    if ip_urls:
        # Limit score contribution
        score_add = min(SCORING["ip_address_url"] * len(ip_urls), SCORING["ip_address_url"] * 3)
        risk_score += score_add
        indicators["suspicious_network"] = True
        key_findings.append({
            "severity": "high",
            "title": "C2 Server Communication",
            "description": f"App communicates with {len(ip_urls)} raw IP address(es): {', '.join(ip_urls[:2])}. Typical command & control server pattern."
        })
        evidence_count["high"] += 1

    suspicious_url_count = urls.get("suspicious_count", 0) - len(ip_urls)
    if suspicious_url_count > 0:
        risk_score += min(SCORING["suspicious_domain"] * suspicious_url_count, 30)
        if not indicators["suspicious_network"]:
            indicators["suspicious_network"] = True
            key_findings.append({
                "severity": "medium",
                "title": "Suspicious Network Domains",
                "description": f"{suspicious_url_count} suspicious domain(s) found with high-risk TLDs or patterns."
            })
            evidence_count["medium"] += 1

    # === Code pattern scoring ===
    patterns = code_patterns.get("patterns", [])
    critical_patterns = [p for p in patterns if p["severity"] == "critical"]
    high_patterns = [p for p in patterns if p["severity"] == "high"]
    medium_patterns = [p for p in patterns if p["severity"] == "medium"]

    if critical_patterns:
        score_add = min(SCORING["code_critical"] * len(critical_patterns), SCORING["code_critical"] * 4)
        risk_score += score_add
        indicators["suspicious_code"] = True
        for cp in critical_patterns[:2]:
            key_findings.append({
                "severity": "critical",
                "title": cp["name"],
                "description": cp["description"]
            })
            evidence_count["critical"] += 1

    if high_patterns:
        score_add = min(SCORING["code_high"] * len(high_patterns), SCORING["code_high"] * 3)
        risk_score += score_add
        if not indicators["suspicious_code"]:
            indicators["suspicious_code"] = True
        for hp in high_patterns[:2]:
            key_findings.append({
                "severity": "high",
                "title": hp["name"],
                "description": hp["description"]
            })
            evidence_count["high"] += 1

    if medium_patterns:
        score_add = min(SCORING["code_medium"] * len(medium_patterns), SCORING["code_medium"] * 3)
        risk_score += score_add
        for mp in medium_patterns[:1]:
            key_findings.append({
                "severity": "medium",
                "title": mp["name"],
                "description": mp["description"]
            })
            evidence_count["medium"] += 1

    # === Play Store reputation scoring ===
    rep_findings = reputation.get("findings", []) if reputation else []
    rep_delta = reputation.get("risk_delta", 0) if reputation else 0
    if rep_delta:
        risk_score += min(rep_delta, 60)

    play = reputation.get("play_store", {}) if reputation else {}
    if play.get("checked") and play.get("listed") is False and package_name:
        indicators["not_on_play_store"] = True

    for rf in rep_findings:
        sev = rf.get("severity", "medium")
        key_findings.insert(0 if sev == "critical" else len(key_findings), {
            "severity": sev,
            "title": rf.get("title", "Reputation issue"),
            "description": rf.get("description", ""),
        })
        if sev in evidence_count:
            evidence_count[sev] += 1
        if sev in ("critical", "high"):
            indicators["play_store_mismatch"] = True
            if sev == "critical":
                indicators["is_clone_candidate"] = True

    # === Metadata-based scoring ===
    if metadata.get("has_native_libs"):
        risk_score += SCORING["native_libs"]
        evidence_count["low"] += 1

    if metadata.get("dex_count", 0) > 1:
        risk_score += SCORING["multiple_dex"]
        evidence_count["low"] += 1

    # === Cap risk score at 100 ===
    risk_score = min(risk_score, 100)

    # Low/info evidence from manifest warnings
    for w in manifest.get("warnings", []):
        evidence_count["info"] += 1

    # === Determine verdict level ===
    if risk_score <= 25:
        level = "CLEAN"
        summary_base = "No significant threats detected in this APK. The application appears to behave within normal parameters."
        recommendation = "This APK appears safe to install. Always download apps from official sources like Google Play Store for maximum security."
    elif risk_score <= 55:
        level = "SUSPICIOUS"
        summary_base = "This APK exhibits several suspicious behaviors that warrant caution. It may contain unwanted functionality or privacy-invasive code."
        recommendation = "Exercise caution before installing this application. Verify the source and developer identity. Consider using a sandbox environment for testing."
    else:
        level = "MALICIOUS"
        summary_base = "This APK contains high-confidence malware indicators. It is highly likely to cause harm if installed."
        recommendation = "DO NOT INSTALL this application. If already installed, uninstall immediately, change all passwords, and check for unauthorized account activity. Report to your device security team."

    # Build contextual summary
    context_parts = []
    if indicators["is_clone_candidate"]:
        display_name = (
            play.get("title")
            or known_apps.get(package_name, {}).get("name")
            or package_name
        )
        context_parts.append(
            f"It impersonates {display_name} but is signed by an unauthorized key"
        )
    if indicators["not_on_play_store"] and not indicators["is_clone_candidate"]:
        context_parts.append("is not distributed via the official Google Play Store")
    if indicators["dangerous_permissions"]:
        context_parts.append(f"requests {len(dangerous_found)} high-risk permissions")
    if indicators["suspicious_code"]:
        total_bad = len(critical_patterns) + len(high_patterns)
        context_parts.append(f"contains {total_bad} suspicious code pattern(s)")
    if indicators["suspicious_network"]:
        context_parts.append("communicates with suspicious network endpoints")

    if context_parts:
        summary = f"{summary_base} The APK {', '.join(context_parts)}."
    else:
        summary = summary_base

    # Deduplicate key findings (limit to most important)
    seen_titles = set()
    deduped_findings = []
    for f in key_findings:
        if f["title"] not in seen_titles:
            seen_titles.add(f["title"])
            deduped_findings.append(f)

    deduped_findings = deduped_findings[:8]  # Max 8 key findings

    return {
        "level": level,
        "risk_score": risk_score,
        "summary": summary,
        "key_findings": deduped_findings,
        "evidence_count": evidence_count,
        "indicators": indicators,
        "recommendation": recommendation
    }
