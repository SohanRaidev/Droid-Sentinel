import re
import zipfile
from urllib.parse import urlparse


URL_PATTERN = re.compile(r'https?://[^\s\'"<>{}|\\^`\[\]]{4,}', re.IGNORECASE)
IP_PATTERN = re.compile(r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?(?:/[^\s]*)?', re.IGNORECASE)

SUSPICIOUS_TLDS = ['.xyz', '.tk', '.cf', '.ga', '.ml', '.pw', '.top', '.club', '.onion']

LEGIT_DOMAINS = [
    'google.com', 'googleapis.com', 'gstatic.com', 'android.com',
    'facebook.com', 'apple.com', 'amazon.com', 'cloudflare.com',
    'microsoft.com', 'azure.com', 'amazonaws.com', 'akamai.com',
    'whatsapp.com', 'whatsapp.net', 'telegram.org', 'mozilla.org',
    'schema.org', 'w3.org', 'ietf.org', 'openssl.org',
    'fonts.googleapis.com', 'fonts.gstatic.com', 'play.google.com',
    'developer.android.com', 'stackoverflow.com', 'github.com',
]


def is_legit_domain(domain: str) -> bool:
    """Check if domain is a known legitimate domain."""
    domain_lower = domain.lower().lstrip('www.')
    for legit in LEGIT_DOMAINS:
        if domain_lower == legit or domain_lower.endswith('.' + legit):
            return True
    return False


def get_domain(url: str) -> str:
    """Extract domain from URL."""
    try:
        parsed = urlparse(url)
        return parsed.netloc.lower()
    except Exception:
        return ""


def classify_url(url: str, source_file: str) -> dict:
    """Classify a URL by risk level and category."""
    domain = get_domain(url)
    parsed = urlparse(url)

    # Check for raw IP
    if IP_PATTERN.match(url):
        return {
            "url": url,
            "source_file": source_file,
            "risk_level": "critical",
            "category": "data_exfiltration",
            "description": "Raw IP address URL — possible C2 server or data exfiltration endpoint"
        }

    # Check for .onion
    if '.onion' in domain:
        return {
            "url": url,
            "source_file": source_file,
            "risk_level": "critical",
            "category": "darknet",
            "description": "Tor .onion hidden service URL — associated with anonymized malicious activity"
        }

    # Legitimate domains
    if is_legit_domain(domain):
        return {
            "url": url,
            "source_file": source_file,
            "risk_level": "info",
            "category": "legitimate",
            "description": f"Known legitimate domain: {domain}"
        }

    # Suspicious TLDs
    for tld in SUSPICIOUS_TLDS:
        if domain.endswith(tld):
            return {
                "url": url,
                "source_file": source_file,
                "risk_level": "high",
                "category": "suspicious_domain",
                "description": f"Suspicious TLD '{tld}' — frequently used in malware and phishing"
            }

    # Non-standard ports
    if parsed.port and parsed.port not in (80, 443, 8080, 8443):
        return {
            "url": url,
            "source_file": source_file,
            "risk_level": "medium",
            "category": "non_standard_port",
            "description": f"Non-standard port {parsed.port} — may indicate C2 communication"
        }

    # HTTP (not HTTPS)
    if url.lower().startswith('http://') and not IP_PATTERN.match(url):
        return {
            "url": url,
            "source_file": source_file,
            "risk_level": "low",
            "category": "insecure_http",
            "description": "Unencrypted HTTP URL — data transmitted in plaintext"
        }

    # Unknown domain over HTTPS
    return {
        "url": url,
        "source_file": source_file,
        "risk_level": "low",
        "category": "unknown",
        "description": f"Unknown domain: {domain}"
    }


def extract_strings_from_binary(data: bytes, min_len: int = 6) -> list:
    """Extract printable ASCII strings from binary data."""
    result = []
    current = []
    for byte in data:
        if 32 <= byte <= 126:
            current.append(chr(byte))
        else:
            if len(current) >= min_len:
                result.append(''.join(current))
            current = []
    if len(current) >= min_len:
        result.append(''.join(current))
    return result


def extract_urls(apk_path: str) -> dict:
    """Extract and classify URLs from APK contents."""
    result = {
        "urls": [],
        "suspicious_urls": [],
        "ip_addresses": [],
        "unique_domains": [],
        "total_count": 0,
        "suspicious_count": 0,
        "warnings": []
    }

    found_urls = {}  # url -> classified dict
    all_domains = set()

    try:
        with zipfile.ZipFile(apk_path, 'r') as zf:
            for file_name in zf.namelist():
                try:
                    data = zf.read(file_name)

                    if file_name.endswith('.dex') or file_name.endswith('.so'):
                        # Binary files: extract strings first
                        strings = extract_strings_from_binary(data)
                        text = '\n'.join(strings)
                    elif any(file_name.endswith(ext) for ext in ['.xml', '.json', '.html', '.js', '.txt', '.properties']):
                        try:
                            text = data.decode('utf-8', errors='ignore')
                        except Exception:
                            text = data.decode('latin-1', errors='ignore')
                    else:
                        # Try as text, skip if not decodable
                        try:
                            text = data.decode('utf-8', errors='ignore')
                        except Exception:
                            continue

                    # Find all URLs
                    matches = URL_PATTERN.findall(text)
                    for url in matches:
                        # Clean up URL (remove trailing punctuation)
                        url = url.rstrip('.,;:)"\'>]')
                        if len(url) > 8 and url not in found_urls:
                            classified = classify_url(url, file_name)
                            found_urls[url] = classified
                            domain = get_domain(url)
                            if domain:
                                all_domains.add(domain)

                except Exception:
                    continue

    except zipfile.BadZipFile:
        result["warnings"].append("Could not open APK as ZIP for URL extraction")
        return result
    except Exception as e:
        result["warnings"].append(f"URL extraction error: {str(e)}")
        return result

    all_classified = list(found_urls.values())

    # Deduplicate by URL
    seen_urls = set()
    unique_classified = []
    for item in all_classified:
        if item["url"] not in seen_urls:
            seen_urls.add(item["url"])
            unique_classified.append(item)

    # Sort by risk level
    risk_order = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}
    unique_classified.sort(key=lambda x: risk_order.get(x["risk_level"], 5))

    result["urls"] = unique_classified[:200]  # Limit for JSON size
    result["total_count"] = len(unique_classified)

    suspicious = [u for u in unique_classified if u["risk_level"] in ("critical", "high")]
    result["suspicious_urls"] = [u["url"] for u in suspicious]
    result["suspicious_count"] = len(suspicious)

    ip_urls = [u["url"] for u in unique_classified if IP_PATTERN.match(u["url"])]
    result["ip_addresses"] = ip_urls

    result["unique_domains"] = list(all_domains)[:100]

    # Warnings
    if ip_urls:
        for ip_url in ip_urls[:3]:
            result["warnings"].append(f"IP address URL found: {ip_url} — possible C2 server")

    for u in unique_classified:
        if u["risk_level"] in ("critical", "high") and "suspicious_domain" in u.get("category", ""):
            domain = get_domain(u["url"])
            for tld in SUSPICIOUS_TLDS:
                if domain.endswith(tld):
                    result["warnings"].append(
                        f"Suspicious domain with {tld} TLD found — frequently used in phishing"
                    )
                    break

    return result
