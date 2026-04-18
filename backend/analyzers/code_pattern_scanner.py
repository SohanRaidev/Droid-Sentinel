import zipfile


SUSPICIOUS_PATTERNS = [
    {
        "name": "Dynamic Code Loading",
        "patterns": ["DexClassLoader", "PathClassLoader", "loadClass", "dalvik.system.DexFile"],
        "severity": "high",
        "category": "evasion",
        "description": "Loads executable code at runtime, common in malware to evade static analysis"
    },
    {
        "name": "Root Access Attempt",
        "patterns": ["/system/bin/su", "/system/xbin/su", "Superuser.apk", "eu.chainfire.supersu", "com.topjohnwu.magisk"],
        "severity": "critical",
        "category": "privilege_escalation",
        "description": "Attempts to access root/superuser privileges on the device"
    },
    {
        "name": "SMS Monitoring",
        "patterns": ["getMessageBody", "SmsMessage", "SMS_RECEIVED", "android.provider.Telephony.SMS"],
        "severity": "critical",
        "category": "data_theft",
        "description": "Reads and potentially exfiltrates SMS messages including OTPs"
    },
    {
        "name": "Screen Recording/Capture",
        "patterns": ["MediaProjectionManager", "createVirtualDisplay", "ImageReader.acquireLatestImage"],
        "severity": "critical",
        "category": "surveillance",
        "description": "Captures device screen content without user awareness"
    },
    {
        "name": "Keylogging via Accessibility",
        "patterns": ["AccessibilityService", "onAccessibilityEvent", "TYPE_VIEW_TEXT_CHANGED"],
        "severity": "critical",
        "category": "keylogging",
        "description": "Uses Accessibility API to capture keystrokes and screen content"
    },
    {
        "name": "Anti-Analysis / Debugger Detection",
        "patterns": ["isDebuggerConnected", "android.os.Debug.isDebuggerConnected", "ptrace", "TracerPid"],
        "severity": "high",
        "category": "evasion",
        "description": "Detects debugging or analysis tools, common in obfuscated malware"
    },
    {
        "name": "Cryptocurrency Mining",
        "patterns": ["xmrig", "monero", "mining", "stratum+tcp", "nanopool", "minergate"],
        "severity": "critical",
        "category": "cryptomining",
        "description": "Contains cryptocurrency mining code that drains device battery and CPU"
    },
    {
        "name": "Camera Access Without UI",
        "patterns": ["Camera2", "CameraManager.openCamera", "SurfaceTexture(0)"],
        "severity": "high",
        "category": "surveillance",
        "description": "Accesses camera in background without visible camera preview"
    },
    {
        "name": "Device Admin Abuse",
        "patterns": ["DevicePolicyManager", "removeActiveAdmin", "lockNow", "wipeData"],
        "severity": "critical",
        "category": "device_control",
        "description": "Attempts to use device administrator APIs for unauthorized control"
    },
    {
        "name": "Native Code Injection",
        "patterns": ["System.loadLibrary", "Runtime.exec", "ProcessBuilder"],
        "severity": "high",
        "category": "evasion",
        "description": "Executes native code or shell commands that bypass Java security model"
    },
    {
        "name": "Data Exfiltration via HTTP",
        "patterns": ["HttpURLConnection", "OkHttpClient", "Volley"],
        "severity": "medium",
        "category": "data_theft",
        "description": "Uses HTTP POST to send data to remote servers (context-dependent)"
    },
    {
        "name": "Clipboard Hijacking",
        "patterns": ["ClipboardManager", "getPrimaryClip", "setPrimaryClip"],
        "severity": "medium",
        "category": "data_theft",
        "description": "Reads or modifies clipboard content, can steal copied passwords/addresses"
    },
    {
        "name": "Location Tracking",
        "patterns": ["LocationManager", "FusedLocationProviderClient", "getLastKnownLocation"],
        "severity": "medium",
        "category": "surveillance",
        "description": "Continuously tracks device GPS location"
    },
    {
        "name": "Certificate Pinning Bypass",
        "patterns": ["TrustAllCerts", "X509TrustManager", "checkClientTrusted", "SSLSocketFactory"],
        "severity": "high",
        "category": "network",
        "description": "Bypasses SSL/TLS certificate validation, enabling MITM attacks"
    },
    {
        "name": "Obfuscated Strings (Base64)",
        "patterns": ["Base64.decode", "new String(Base64"],
        "severity": "medium",
        "category": "evasion",
        "description": "Uses Base64-encoded strings to hide malicious payloads from static analysis"
    },
    {
        "name": "Contact/Account Harvesting",
        "patterns": ["ContactsContract", "AccountManager.getAccounts", "getAllAccounts"],
        "severity": "high",
        "category": "data_theft",
        "description": "Enumerates all accounts and contacts stored on device"
    },
]


def extract_strings_from_binary(data: bytes, min_len: int = 5) -> list:
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


def scan_code_patterns(apk_path: str) -> dict:
    """Scan APK DEX and native libraries for suspicious code patterns."""
    result = {
        "patterns": [],
        "high_severity_count": 0,
        "critical_severity_count": 0,
        "total_findings": 0,
        "categories": [],
        "warnings": []
    }

    # Collect all strings from DEX and .so files
    file_strings = {}  # filename -> set of strings

    try:
        with zipfile.ZipFile(apk_path, 'r') as zf:
            for file_name in zf.namelist():
                is_binary = file_name.endswith('.dex') or file_name.endswith('.so')
                if not is_binary:
                    continue
                try:
                    data = zf.read(file_name)
                    strings = extract_strings_from_binary(data)
                    file_strings[file_name] = strings
                except Exception:
                    continue
    except zipfile.BadZipFile:
        result["warnings"].append("Could not open APK as ZIP for code scanning")
        return result
    except Exception as e:
        result["warnings"].append(f"Code pattern scan error: {str(e)}")
        return result

    # Check each suspicious pattern against all extracted strings
    findings = []
    categories_found = set()

    for pattern_def in SUSPICIOUS_PATTERNS:
        matched_evidence = []
        matched_locations = []

        for file_name, strings in file_strings.items():
            # Build a text blob for fast searching
            text_blob = '\n'.join(strings)

            for pattern_str in pattern_def["patterns"]:
                # Case-sensitive search in extracted strings
                if pattern_str in text_blob:
                    if pattern_str not in matched_evidence:
                        matched_evidence.append(pattern_str)
                    if file_name not in matched_locations:
                        matched_locations.append(file_name)

        if matched_evidence:
            finding = {
                "name": pattern_def["name"],
                "severity": pattern_def["severity"],
                "category": pattern_def["category"],
                "description": pattern_def["description"],
                "evidence": matched_evidence[:10],  # Limit evidence items
                "locations": matched_locations[:5]   # Limit location items
            }
            findings.append(finding)
            categories_found.add(pattern_def["category"])

    # Sort by severity
    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    findings.sort(key=lambda x: severity_order.get(x["severity"], 4))

    result["patterns"] = findings
    result["total_findings"] = len(findings)
    result["high_severity_count"] = sum(1 for f in findings if f["severity"] == "high")
    result["critical_severity_count"] = sum(1 for f in findings if f["severity"] == "critical")
    result["categories"] = list(categories_found)

    # Generate warnings for dangerous combinations
    pattern_names = [f["name"] for f in findings]
    category_names = [f["category"] for f in findings]

    if "SMS Monitoring" in pattern_names:
        result["warnings"].append(
            "SMS monitoring code detected alongside SMS permissions — high confidence data theft"
        )

    if "Keylogging via Accessibility" in pattern_names:
        result["warnings"].append(
            "Keylogger code detected alongside Accessibility permission — active keylogging capability"
        )

    if "Root Access Attempt" in pattern_names:
        result["warnings"].append(
            "Root access code detected — application attempts privilege escalation"
        )

    if "Cryptocurrency Mining" in pattern_names:
        result["warnings"].append(
            "Cryptominer code detected — device CPU/battery will be drained without consent"
        )

    if "Screen Recording/Capture" in pattern_names:
        result["warnings"].append(
            "Screen capture code detected — application may record screen without user knowledge"
        )

    return result
