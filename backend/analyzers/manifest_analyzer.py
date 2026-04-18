import zipfile


PERMISSION_RISKS = {
    "android.permission.READ_SMS": {"risk": "critical", "desc": "Read SMS messages"},
    "android.permission.RECEIVE_SMS": {"risk": "critical", "desc": "Intercept incoming SMS"},
    "android.permission.SEND_SMS": {"risk": "critical", "desc": "Send SMS messages"},
    "android.permission.READ_CALL_LOG": {"risk": "high", "desc": "Read call history"},
    "android.permission.WRITE_CALL_LOG": {"risk": "high", "desc": "Modify call logs"},
    "android.permission.RECORD_AUDIO": {"risk": "high", "desc": "Record audio/microphone"},
    "android.permission.PROCESS_OUTGOING_CALLS": {"risk": "high", "desc": "Intercept outgoing calls"},
    "android.permission.READ_CONTACTS": {"risk": "medium", "desc": "Read contact list"},
    "android.permission.WRITE_CONTACTS": {"risk": "medium", "desc": "Modify contacts"},
    "android.permission.ACCESS_FINE_LOCATION": {"risk": "medium", "desc": "Precise GPS location"},
    "android.permission.CAMERA": {"risk": "medium", "desc": "Access camera"},
    "android.permission.READ_EXTERNAL_STORAGE": {"risk": "medium", "desc": "Read device storage"},
    "android.permission.WRITE_EXTERNAL_STORAGE": {"risk": "medium", "desc": "Write to device storage"},
    "android.permission.READ_PHONE_STATE": {"risk": "medium", "desc": "Read device identifiers"},
    "android.permission.INSTALL_PACKAGES": {"risk": "critical", "desc": "Install other APKs"},
    "android.permission.DELETE_PACKAGES": {"risk": "critical", "desc": "Delete apps"},
    "android.permission.BIND_ACCESSIBILITY_SERVICE": {"risk": "critical", "desc": "Control accessibility - keylogging risk"},
    "android.permission.BIND_DEVICE_ADMIN": {"risk": "critical", "desc": "Device administrator access"},
    "android.permission.BIND_NOTIFICATION_LISTENER_SERVICE": {"risk": "high", "desc": "Read all notifications"},
    "android.permission.RECEIVE_BOOT_COMPLETED": {"risk": "low", "desc": "Start on device boot"},
    "android.permission.INTERNET": {"risk": "low", "desc": "Internet access"},
    "android.permission.ACCESS_WIFI_STATE": {"risk": "low", "desc": "Read WiFi info"},
    "android.permission.ACCESS_NETWORK_STATE": {"risk": "low", "desc": "Read network state"},
    "android.permission.CHANGE_NETWORK_STATE": {"risk": "medium", "desc": "Change network settings"},
    "android.permission.VIBRATE": {"risk": "info", "desc": "Control vibration"},
    "android.permission.WAKE_LOCK": {"risk": "info", "desc": "Prevent screen sleep"},
    "android.permission.FOREGROUND_SERVICE": {"risk": "low", "desc": "Run foreground service"},
    "android.permission.REQUEST_INSTALL_PACKAGES": {"risk": "high", "desc": "Request installing packages"},
    "android.permission.MANAGE_EXTERNAL_STORAGE": {"risk": "high", "desc": "Full storage access"},
    "android.permission.USE_BIOMETRIC": {"risk": "medium", "desc": "Use biometric auth"},
}


def classify_permission(perm_name: str) -> dict:
    """Classify a permission by risk level."""
    if perm_name in PERMISSION_RISKS:
        info = PERMISSION_RISKS[perm_name]
        return {
            "name": perm_name,
            "risk_level": info["risk"],
            "description": info["desc"],
            "protection_level": "dangerous" if info["risk"] in ("critical", "high") else "normal"
        }
    # Unknown permission
    short_name = perm_name.split('.')[-1] if '.' in perm_name else perm_name
    return {
        "name": perm_name,
        "risk_level": "unknown",
        "description": f"Unknown permission: {short_name}",
        "protection_level": "unknown"
    }


def analyze_manifest(apk_path: str) -> dict:
    """Analyze AndroidManifest.xml for permissions, components, and flags."""
    result = {
        "package_name": "unknown",
        "version_name": "Unknown",
        "version_code": "Unknown",
        "permissions": [],
        "dangerous_permissions": [],
        "permission_count": 0,
        "activities": [],
        "services": [],
        "receivers": [],
        "providers": [],
        "exported_components": [],
        "flags": {
            "is_debuggable": False,
            "allows_backup": True,
            "network_security_config": False,
            "uses_cleartext_traffic": False
        },
        "warnings": []
    }

    raw_permissions = []
    activities = []
    services = []
    receivers = []
    providers = []
    is_debuggable = False
    allows_backup = True
    uses_cleartext = False
    has_network_security_config = False

    # Try androguard
    androguard_ok = False
    try:
        from androguard.core.bytecodes.apk import APK
        a = APK(apk_path)

        pkg = a.get_package()
        if pkg:
            result["package_name"] = pkg

        vname = a.get_androidversion_name()
        if vname:
            result["version_name"] = vname

        vcode = a.get_androidversion_code()
        if vcode:
            result["version_code"] = str(vcode)

        raw_permissions = a.get_permissions() or []
        activities = a.get_activities() or []
        services = a.get_services() or []
        receivers = a.get_receivers() or []
        providers = a.get_providers() or []

        # App flags
        try:
            debuggable = a.get_element('application', 'android:debuggable')
            is_debuggable = debuggable == 'true'
        except Exception:
            is_debuggable = False

        try:
            backup = a.get_element('application', 'android:allowBackup')
            allows_backup = backup != 'false'
        except Exception:
            allows_backup = True

        try:
            cleartext = a.get_element('application', 'android:usesCleartextTraffic')
            uses_cleartext = cleartext == 'true'
        except Exception:
            uses_cleartext = False

        try:
            nsc = a.get_element('application', 'android:networkSecurityConfig')
            has_network_security_config = nsc is not None and nsc != ''
        except Exception:
            has_network_security_config = False

        # Exported components
        exported = []
        try:
            for comp_list, comp_type in [(activities, 'activity'), (services, 'service'),
                                         (receivers, 'receiver'), (providers, 'provider')]:
                for comp in comp_list:
                    try:
                        exp_val = a.get_declared_permissions_details()
                    except Exception:
                        pass
                    # Simple check via manifest XML parsing
            # Try to find exported components via manifest directly
            manifest_content = a.get_android_manifest_axml().get_buff()
        except Exception:
            pass

        androguard_ok = True

    except Exception as e:
        # Fallback: basic ZIP parsing
        try:
            with zipfile.ZipFile(apk_path, 'r') as zf:
                if 'AndroidManifest.xml' in zf.namelist():
                    # Binary XML — can only do basic string extraction
                    data = zf.read('AndroidManifest.xml')
                    # Extract permission strings using basic heuristic
                    import re
                    perm_pattern = re.compile(b'android\.permission\.[A-Z_]+')
                    found_perms = perm_pattern.findall(data)
                    raw_permissions = list(set([p.decode('ascii', errors='ignore') for p in found_perms]))
        except Exception:
            pass

    # Build permission objects
    perm_objects = []
    for perm in raw_permissions:
        perm_objects.append(classify_permission(perm))

    result["permissions"] = perm_objects
    result["permission_count"] = len(perm_objects)

    # Dangerous permissions list
    dangerous = [p["name"].split('.')[-1] for p in perm_objects if p["risk_level"] in ("critical", "high")]
    result["dangerous_permissions"] = dangerous

    # Components
    result["activities"] = activities[:50]  # limit for JSON size
    result["services"] = services[:50]
    result["receivers"] = receivers[:50]
    result["providers"] = providers[:50]

    # Flags
    result["flags"]["is_debuggable"] = is_debuggable
    result["flags"]["allows_backup"] = allows_backup
    result["flags"]["network_security_config"] = has_network_security_config
    result["flags"]["uses_cleartext_traffic"] = uses_cleartext

    # Exported components (simple heuristic)
    exported_comps = []
    for comp in receivers:
        # SMS receivers are typically exported
        if 'sms' in comp.lower() or 'boot' in comp.lower() or 'receiver' in comp.lower():
            exported_comps.append(comp)
    result["exported_components"] = exported_comps[:20]

    # Generate warnings
    perm_names = [p["name"] for p in perm_objects]

    if is_debuggable:
        result["warnings"].append("App is marked debuggable — security risk in production")

    if allows_backup:
        result["warnings"].append("App data can be backed up via ADB — data exposure risk")

    if uses_cleartext:
        result["warnings"].append("Cleartext HTTP traffic allowed — MITM attack risk")

    read_sms = "android.permission.READ_SMS" in perm_names
    send_sms = "android.permission.SEND_SMS" in perm_names
    receive_sms = "android.permission.RECEIVE_SMS" in perm_names
    if (read_sms or receive_sms) and send_sms:
        result["warnings"].append("SMS read+write permissions together indicate SMS monitoring capability")

    if "android.permission.BIND_ACCESSIBILITY_SERVICE" in perm_names:
        result["warnings"].append("Accessibility service binding — frequently abused for keylogging")

    if "android.permission.INSTALL_PACKAGES" in perm_names:
        result["warnings"].append("Can install other applications — high malware risk")

    if "android.permission.BIND_DEVICE_ADMIN" in perm_names:
        result["warnings"].append("Device administrator permission — can lock/wipe device")

    return result
