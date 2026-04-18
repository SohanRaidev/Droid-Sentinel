import os
import tempfile
import traceback
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(title="Droid Sentinel API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB


def get_sample_analysis():
    return {
        "success": True,
        "filename": "WhatsApp_Fake_v2.22.apk",
        "metadata": {
            "filename": "WhatsApp_Fake_v2.22.apk",
            "file_size": 58234112,
            "file_size_human": "55.5 MB",
            "hashes": {
                "md5": "a4f3e2d1c8b7a6f5e4d3c2b1a0f9e8d7",
                "sha1": "2b4d6f8a0c2e4f6a8c0e2f4a6c8e0f2a4b6d8f0a",
                "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            },
            "package_name": "com.whatsapp",
            "app_name": "WhatsApp Messenger",
            "version_name": "2.22.20.78",
            "version_code": "222078",
            "min_sdk": "16",
            "target_sdk": "32",
            "dex_count": 3,
            "native_libs": ["lib/armeabi-v7a/libwhatsapp.so", "lib/arm64-v8a/libdatacollect.so"],
            "has_native_libs": True,
            "total_files": 847,
            "assets_count": 124,
            "is_valid_zip": True,
            "compilation_timestamp": "DEX version 035"
        },
        "certificate": {
            "found": True,
            "certificates": [{
                "subject": "C=US, ST=California, L=San Jose, O=MobileSoft Solutions Ltd, OU=Android Dev, CN=MobileSoft",
                "issuer": "C=US, ST=California, L=San Jose, O=MobileSoft Solutions Ltd, OU=Android Dev, CN=MobileSoft",
                "serial_number": "1234567890",
                "sha256_fingerprint": "A1:B2:C3:D4:E5:F6:07:18:29:3A:4B:5C:6D:7E:8F:90:A1:B2:C3:D4:E5:F6:07:18:29:3A:4B:5C:6D:7E:8F:90",
                "sha1_fingerprint": "A1:B2:C3:D4:E5:F6:07:18:29:3A:4B:5C:6D:7E:8F:90:A1:B2:C3:D4",
                "valid_from": "2023-01-15 00:00:00",
                "valid_to": "2028-01-14 23:59:59",
                "is_self_signed": True,
                "signature_algorithm": "SHA256withRSA"
            }],
            "is_expired": False,
            "is_self_signed": True,
            "certificate_count": 1,
            "certificate_files": ["META-INF/CERT.RSA"],
            "warnings": [
                "Certificate is self-signed — not from a trusted CA",
                "CRITICAL: Package name 'com.whatsapp' matches known app but certificate does not match WhatsApp Inc's signing key"
            ]
        },
        "manifest": {
            "package_name": "com.whatsapp",
            "version_name": "2.22.20.78",
            "version_code": "222078",
            "permissions": [
                {"name": "android.permission.READ_SMS", "risk_level": "critical", "description": "Read SMS messages", "protection_level": "dangerous"},
                {"name": "android.permission.RECEIVE_SMS", "risk_level": "critical", "description": "Intercept incoming SMS", "protection_level": "dangerous"},
                {"name": "android.permission.SEND_SMS", "risk_level": "critical", "description": "Send SMS messages", "protection_level": "dangerous"},
                {"name": "android.permission.RECORD_AUDIO", "risk_level": "high", "description": "Record audio/microphone", "protection_level": "dangerous"},
                {"name": "android.permission.READ_CONTACTS", "risk_level": "medium", "description": "Read contact list", "protection_level": "dangerous"},
                {"name": "android.permission.WRITE_CONTACTS", "risk_level": "medium", "description": "Modify contacts", "protection_level": "dangerous"},
                {"name": "android.permission.ACCESS_FINE_LOCATION", "risk_level": "medium", "description": "Precise GPS location", "protection_level": "dangerous"},
                {"name": "android.permission.CAMERA", "risk_level": "medium", "description": "Access camera", "protection_level": "dangerous"},
                {"name": "android.permission.BIND_ACCESSIBILITY_SERVICE", "risk_level": "critical", "description": "Control accessibility - keylogging risk", "protection_level": "signature"},
                {"name": "android.permission.INSTALL_PACKAGES", "risk_level": "critical", "description": "Install other APKs", "protection_level": "signature"},
                {"name": "android.permission.READ_EXTERNAL_STORAGE", "risk_level": "medium", "description": "Read device storage", "protection_level": "dangerous"},
                {"name": "android.permission.WRITE_EXTERNAL_STORAGE", "risk_level": "medium", "description": "Write to device storage", "protection_level": "dangerous"},
                {"name": "android.permission.INTERNET", "risk_level": "low", "description": "Internet access", "protection_level": "normal"},
                {"name": "android.permission.RECEIVE_BOOT_COMPLETED", "risk_level": "low", "description": "Start on device boot", "protection_level": "normal"},
                {"name": "android.permission.FOREGROUND_SERVICE", "risk_level": "low", "description": "Run foreground service", "protection_level": "normal"},
                {"name": "android.permission.VIBRATE", "risk_level": "info", "description": "Control vibration", "protection_level": "normal"},
                {"name": "android.permission.WAKE_LOCK", "risk_level": "info", "description": "Prevent screen sleep", "protection_level": "normal"}
            ],
            "dangerous_permissions": ["READ_SMS", "RECEIVE_SMS", "SEND_SMS", "BIND_ACCESSIBILITY_SERVICE", "INSTALL_PACKAGES"],
            "permission_count": 17,
            "activities": ["com.whatsapp.Main", "com.whatsapp.registration.VerifyPhoneNumber"],
            "services": ["com.whatsapp.messaging.MessagingService", "com.datacollect.BackgroundService"],
            "receivers": ["com.whatsapp.SmsReceiver", "com.whatsapp.BootReceiver"],
            "providers": ["com.whatsapp.provider.contact"],
            "exported_components": ["com.whatsapp.SmsReceiver"],
            "flags": {
                "is_debuggable": True,
                "allows_backup": True,
                "network_security_config": False,
                "uses_cleartext_traffic": True
            },
            "warnings": [
                "App is marked debuggable — security risk in production",
                "SMS read+write permissions together indicate SMS monitoring capability",
                "Accessibility service binding — frequently abused for keylogging",
                "Can install other applications — high malware risk",
                "Cleartext HTTP traffic allowed — MITM attack risk"
            ]
        },
        "urls": {
            "urls": [
                {"url": "http://45.33.32.156:8080/upload", "source_file": "classes2.dex", "risk_level": "critical", "category": "data_exfiltration", "description": "Raw IP address with non-standard port — likely C2 server"},
                {"url": "https://datacollect-api.xyz/v1/sync", "source_file": "classes.dex", "risk_level": "high", "category": "suspicious_domain", "description": "Suspicious .xyz TLD domain for data synchronization"},
                {"url": "http://update.whatsapp-security.tk/check", "source_file": "classes.dex", "risk_level": "critical", "category": "impersonation", "description": "Fake WhatsApp domain with .tk TLD — likely used to impersonate official updates"},
                {"url": "https://api.whatsapp.com/v1/messages", "source_file": "res/values/strings.xml", "risk_level": "info", "category": "legitimate", "description": "Official WhatsApp API endpoint"},
                {"url": "https://fonts.googleapis.com/css2", "source_file": "assets/index.html", "risk_level": "info", "category": "legitimate", "description": "Google Fonts CDN"}
            ],
            "suspicious_urls": [
                "http://45.33.32.156:8080/upload",
                "https://datacollect-api.xyz/v1/sync",
                "http://update.whatsapp-security.tk/check"
            ],
            "ip_addresses": ["http://45.33.32.156:8080/upload"],
            "unique_domains": ["45.33.32.156", "datacollect-api.xyz", "whatsapp-security.tk", "api.whatsapp.com", "fonts.googleapis.com"],
            "total_count": 5,
            "suspicious_count": 3,
            "warnings": [
                "IP address URL found: http://45.33.32.156:8080/upload — possible C2 server",
                "Suspicious domain with .tk TLD found — frequently used in phishing"
            ]
        },
        "code_patterns": {
            "patterns": [
                {
                    "name": "Dynamic Code Loading",
                    "severity": "high",
                    "category": "evasion",
                    "description": "Loads executable code at runtime, common in malware to evade static analysis",
                    "evidence": ["DexClassLoader", "loadClass"],
                    "locations": ["classes2.dex"]
                },
                {
                    "name": "SMS Monitoring",
                    "severity": "critical",
                    "category": "data_theft",
                    "description": "Reads and potentially exfiltrates SMS messages including OTPs",
                    "evidence": ["getMessageBody", "SmsMessage.createFromPdu", "SMS_RECEIVED"],
                    "locations": ["classes.dex"]
                },
                {
                    "name": "Keylogging via Accessibility",
                    "severity": "critical",
                    "category": "keylogging",
                    "description": "Uses Accessibility API to capture keystrokes and screen content",
                    "evidence": ["AccessibilityService", "TYPE_VIEW_TEXT_CHANGED", "onAccessibilityEvent"],
                    "locations": ["classes.dex"]
                },
                {
                    "name": "Anti-Analysis / Debugger Detection",
                    "severity": "high",
                    "category": "evasion",
                    "description": "Detects debugging or analysis tools, common in obfuscated malware",
                    "evidence": ["isDebuggerConnected", "android.os.Debug.isDebuggerConnected"],
                    "locations": ["classes.dex"]
                },
                {
                    "name": "Obfuscated Strings (Base64)",
                    "severity": "medium",
                    "category": "evasion",
                    "description": "Uses Base64-encoded strings to hide malicious payloads from static analysis",
                    "evidence": ["Base64.decode", "new String(Base64.decode"],
                    "locations": ["classes2.dex", "classes3.dex"]
                },
                {
                    "name": "Data Exfiltration via HTTP",
                    "severity": "medium",
                    "category": "data_theft",
                    "description": "Uses HTTP POST to send data to remote servers",
                    "evidence": ["HttpURLConnection", "setRequestMethod(POST)", "DataOutputStream"],
                    "locations": ["classes2.dex"]
                }
            ],
            "high_severity_count": 2,
            "critical_severity_count": 2,
            "total_findings": 6,
            "categories": ["evasion", "data_theft", "keylogging"],
            "warnings": [
                "SMS monitoring code detected alongside SMS permissions — high confidence data theft",
                "Keylogger code detected alongside Accessibility permission — active keylogging capability"
            ]
        },
        "reputation": {
            "package_name": "com.whatsapp",
            "play_store": {
                "listed": True,
                "checked": True,
                "title": "WhatsApp Messenger",
                "developer": "WhatsApp LLC",
                "developer_id": "WhatsApp+LLC",
                "developer_email": "android@support.whatsapp.com",
                "developer_website": "https://www.whatsapp.com/",
                "installs": "5,000,000,000+",
                "score": 4.2,
                "ratings": 198456321,
                "price": 0,
                "free": True,
                "category": "Communication",
                "updated": 1711900800,
                "icon": "https://play-lh.googleusercontent.com/bYtqbOcTYOlgc6gqZ2rwb8lptHuwlNE75zYJu6Bn076-hTmvd96HH-6v7S0YUAAJXoJN",
                "url": "https://play.google.com/store/apps/details?id=com.whatsapp",
                "content_rating": "Everyone",
                "description_short": "Simple. Reliable. Private messaging and calling for everyone around the world."
            },
            "mismatches": [
                {"field": "developer_vs_certificate", "expected": "WhatsApp LLC", "found": "MobileSoft Solutions Ltd"}
            ],
            "findings": [
                {
                    "severity": "critical",
                    "title": "Developer mismatch vs. Play Store",
                    "description": "Play Store lists the developer as 'WhatsApp LLC', but this APK is signed by 'MobileSoft Solutions Ltd'. A legitimate release would be signed by the listed developer."
                },
                {
                    "severity": "critical",
                    "title": "Self-signed cert on a listed app",
                    "description": "'WhatsApp Messenger' is published on Google Play by 'WhatsApp LLC', yet this APK is self-signed. Production Play Store releases are never self-signed."
                }
            ],
            "risk_delta": 70
        },
        "verdict": {
            "level": "MALICIOUS",
            "risk_score": 98,
            "summary": "This APK is a sophisticated trojanized clone of WhatsApp Messenger. The Play Store lists the official publisher as WhatsApp LLC, but this file is signed by 'MobileSoft Solutions Ltd' and contains active keylogging, SMS interception, and data exfiltration routines communicating with suspected C2 servers.",
            "key_findings": [
                {"severity": "critical", "title": "Developer mismatch vs. Play Store", "description": "Play Store lists 'WhatsApp LLC' as publisher, but APK is signed by 'MobileSoft Solutions Ltd'."},
                {"severity": "critical", "title": "Self-signed cert on a listed app", "description": "Production Play Store releases of WhatsApp are never self-signed."},
                {"severity": "critical", "title": "Active Keylogging Capability", "description": "Accessibility Service code captures all keystrokes, passwords, and PIN entries."},
                {"severity": "critical", "title": "SMS Interception Active", "description": "Reads and intercepts all SMS messages including bank OTPs and 2FA codes."},
                {"severity": "high", "title": "C2 Server Communication", "description": "Sends data to raw IP address 45.33.32.156:8080 — typical command & control server pattern."},
                {"severity": "high", "title": "Anti-Analysis Evasion", "description": "Actively detects debuggers and analysis tools to hide malicious behavior."}
            ],
            "evidence_count": {
                "critical": 5,
                "high": 4,
                "medium": 5,
                "low": 2,
                "info": 3
            },
            "indicators": {
                "is_clone_candidate": True,
                "certificate_issue": True,
                "dangerous_permissions": True,
                "suspicious_code": True,
                "suspicious_network": True,
                "play_store_mismatch": True,
                "not_on_play_store": False
            },
            "recommendation": "DO NOT INSTALL. This APK is a confirmed trojanized clone of WhatsApp designed to steal credentials, intercept OTPs, and log keystrokes. Uninstall immediately if already installed and rotate all credentials."
        }
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Droid Sentinel API"}


@app.get("/api/sample")
def get_sample():
    """Return a pre-built sample analysis result for demo purposes."""
    return JSONResponse(content=get_sample_analysis())


@app.post("/api/analyze")
async def analyze_apk(file: UploadFile = File(...)):
    """Analyze an uploaded APK file."""
    if not file.filename.lower().endswith('.apk'):
        raise HTTPException(status_code=400, detail="File must be an APK (.apk extension required)")

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB")

    if len(content) < 100:
        raise HTTPException(status_code=400, detail="File is too small to be a valid APK")

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix='.apk', delete=False) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        original_filename = file.filename or "unknown.apk"
        errors = []

        metadata = {}
        certificate = {}
        manifest = {}
        urls = {}
        code_patterns = {}
        reputation = {}

        try:
            from analyzers.metadata_extractor import extract_metadata
            metadata = extract_metadata(tmp_path, original_filename)
        except Exception as e:
            errors.append(f"Metadata extraction failed: {str(e)}")
            metadata = {
                "filename": original_filename,
                "file_size": len(content),
                "file_size_human": f"{len(content) / (1024*1024):.1f} MB",
                "hashes": {"md5": "", "sha1": "", "sha256": ""},
                "package_name": "unknown",
                "app_name": "Unknown",
                "version_name": "Unknown",
                "version_code": "Unknown",
                "min_sdk": "Unknown",
                "target_sdk": "Unknown",
                "dex_count": 0,
                "native_libs": [],
                "has_native_libs": False,
                "total_files": 0,
                "assets_count": 0,
                "is_valid_zip": False,
                "compilation_timestamp": ""
            }

        try:
            from analyzers.certificate_analyzer import analyze_certificate
            certificate = analyze_certificate(tmp_path)
        except Exception as e:
            errors.append(f"Certificate analysis failed: {str(e)}")
            certificate = {
                "found": False, "certificates": [], "is_expired": False,
                "is_self_signed": False, "certificate_count": 0,
                "certificate_files": [], "warnings": [f"Certificate analysis error: {str(e)}"]
            }

        try:
            from analyzers.manifest_analyzer import analyze_manifest
            manifest = analyze_manifest(tmp_path)
        except Exception as e:
            errors.append(f"Manifest analysis failed: {str(e)}")
            manifest = {
                "package_name": metadata.get("package_name", "unknown"),
                "version_name": "Unknown", "version_code": "Unknown",
                "permissions": [], "dangerous_permissions": [], "permission_count": 0,
                "activities": [], "services": [], "receivers": [],
                "providers": [], "exported_components": [],
                "flags": {"is_debuggable": False, "allows_backup": True, "network_security_config": False, "uses_cleartext_traffic": False},
                "warnings": [f"Manifest analysis error: {str(e)}"]
            }

        try:
            from analyzers.url_extractor import extract_urls
            urls = extract_urls(tmp_path)
        except Exception as e:
            errors.append(f"URL extraction failed: {str(e)}")
            urls = {"urls": [], "suspicious_urls": [], "ip_addresses": [],
                    "unique_domains": [], "total_count": 0, "suspicious_count": 0,
                    "warnings": [f"URL extraction error: {str(e)}"]}

        try:
            from analyzers.code_pattern_scanner import scan_code_patterns
            code_patterns = scan_code_patterns(tmp_path)
        except Exception as e:
            errors.append(f"Code pattern scan failed: {str(e)}")
            code_patterns = {"patterns": [], "high_severity_count": 0,
                             "critical_severity_count": 0, "total_findings": 0,
                             "categories": [], "warnings": [f"Code scan error: {str(e)}"]}

        # Live Play Store reputation cross-check
        try:
            from analyzers.reputation import check_reputation
            reputation = check_reputation(metadata, certificate, manifest)
        except Exception as e:
            errors.append(f"Reputation check failed: {str(e)}")
            reputation = {
                "package_name": metadata.get("package_name", ""),
                "play_store": {"listed": False, "checked": False},
                "mismatches": [], "findings": [], "risk_delta": 0,
                "reason": f"Reputation check error: {str(e)}"
            }

        verdict = {}
        try:
            from analyzers.verdict_engine import compute_verdict
            verdict = compute_verdict(metadata, certificate, manifest, urls, code_patterns, reputation)
        except Exception as e:
            errors.append(f"Verdict computation failed: {str(e)}")
            verdict = {
                "level": "SUSPICIOUS", "risk_score": 50,
                "summary": "Analysis partially completed. Some modules encountered errors.",
                "key_findings": [],
                "evidence_count": {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0},
                "indicators": {
                    "is_clone_candidate": False, "certificate_issue": False,
                    "dangerous_permissions": False, "suspicious_code": False,
                    "suspicious_network": False, "play_store_mismatch": False,
                    "not_on_play_store": False,
                },
                "recommendation": "Analysis incomplete. Please try again or use the demo sample."
            }

        response = {
            "success": True,
            "filename": original_filename,
            "metadata": metadata,
            "certificate": certificate,
            "manifest": manifest,
            "urls": urls,
            "code_patterns": code_patterns,
            "reputation": reputation,
            "verdict": verdict,
        }

        if errors:
            response["warnings"] = errors

        return JSONResponse(content=response)

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except Exception:
                pass
