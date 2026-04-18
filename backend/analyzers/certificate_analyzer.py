import hashlib
import zipfile
from datetime import datetime, timezone


def fingerprint_hex(data: bytes, algo: str = 'sha256') -> str:
    """Compute fingerprint as colon-separated hex string."""
    if algo == 'sha256':
        digest = hashlib.sha256(data).hexdigest()
        step = 2
    else:
        digest = hashlib.sha1(data).hexdigest()
        step = 2
    return ':'.join([digest[i:i+step].upper() for i in range(0, len(digest), step)])


def parse_cert_with_cryptography(cert_bytes: bytes) -> list:
    """Parse certificates using cryptography library as fallback."""
    certs_info = []
    try:
        from cryptography.hazmat.primitives.serialization import pkcs7
        from cryptography.hazmat.primitives import hashes
        from cryptography.x509.oid import NameOID

        certs = pkcs7.load_der_pkcs7_certificates(cert_bytes)
        for cert in certs:
            try:
                subject_attrs = []
                for attr in cert.subject:
                    try:
                        subject_attrs.append(f"{attr.oid.dotted_string}={attr.value}")
                    except Exception:
                        subject_attrs.append(str(attr.value))
                subject = ", ".join(subject_attrs)

                issuer_attrs = []
                for attr in cert.issuer:
                    try:
                        issuer_attrs.append(f"{attr.oid.dotted_string}={attr.value}")
                    except Exception:
                        issuer_attrs.append(str(attr.value))
                issuer = ", ".join(issuer_attrs)

                # Try to get friendly names
                try:
                    sub_parts = []
                    for oid, key in [(NameOID.COUNTRY_NAME, 'C'), (NameOID.STATE_OR_PROVINCE_NAME, 'ST'),
                                     (NameOID.LOCALITY_NAME, 'L'), (NameOID.ORGANIZATION_NAME, 'O'),
                                     (NameOID.ORGANIZATIONAL_UNIT_NAME, 'OU'), (NameOID.COMMON_NAME, 'CN')]:
                        attrs = cert.subject.get_attributes_for_oid(oid)
                        if attrs:
                            sub_parts.append(f"{key}={attrs[0].value}")
                    if sub_parts:
                        subject = ", ".join(sub_parts)

                    iss_parts = []
                    for oid, key in [(NameOID.COUNTRY_NAME, 'C'), (NameOID.STATE_OR_PROVINCE_NAME, 'ST'),
                                     (NameOID.LOCALITY_NAME, 'L'), (NameOID.ORGANIZATION_NAME, 'O'),
                                     (NameOID.ORGANIZATIONAL_UNIT_NAME, 'OU'), (NameOID.COMMON_NAME, 'CN')]:
                        attrs = cert.issuer.get_attributes_for_oid(oid)
                        if attrs:
                            iss_parts.append(f"{key}={attrs[0].value}")
                    if iss_parts:
                        issuer = ", ".join(iss_parts)
                except Exception:
                    pass

                der = cert.public_bytes(
                    encoding=__import__('cryptography').hazmat.primitives.serialization.Encoding.DER
                )
                sha256_fp = fingerprint_hex(der, 'sha256')
                sha1_fp = fingerprint_hex(der, 'sha1')

                serial = str(cert.serial_number)
                not_before = cert.not_valid_before_utc if hasattr(cert, 'not_valid_before_utc') else cert.not_valid_before
                not_after = cert.not_valid_after_utc if hasattr(cert, 'not_valid_after_utc') else cert.not_valid_after

                is_self_signed = subject == issuer

                sig_alg = "Unknown"
                try:
                    sig_alg = cert.signature_algorithm_oid.dotted_string
                    # Map common OIDs to friendly names
                    alg_map = {
                        "1.2.840.113549.1.1.11": "SHA256withRSA",
                        "1.2.840.113549.1.1.5": "SHA1withRSA",
                        "1.2.840.113549.1.1.12": "SHA384withRSA",
                        "1.2.840.113549.1.1.13": "SHA512withRSA",
                        "1.2.840.10045.4.3.2": "SHA256withECDSA",
                        "1.2.840.10045.4.3.3": "SHA384withECDSA",
                    }
                    sig_alg = alg_map.get(sig_alg, sig_alg)
                except Exception:
                    pass

                certs_info.append({
                    "subject": subject,
                    "issuer": issuer,
                    "serial_number": serial,
                    "sha256_fingerprint": sha256_fp,
                    "sha1_fingerprint": sha1_fp,
                    "valid_from": str(not_before),
                    "valid_to": str(not_after),
                    "is_self_signed": is_self_signed,
                    "signature_algorithm": sig_alg
                })
            except Exception as ce:
                certs_info.append({
                    "subject": "Parse error",
                    "issuer": "Parse error",
                    "serial_number": "N/A",
                    "sha256_fingerprint": "N/A",
                    "sha1_fingerprint": "N/A",
                    "valid_from": "N/A",
                    "valid_to": "N/A",
                    "is_self_signed": False,
                    "signature_algorithm": "Unknown",
                    "error": str(ce)
                })
    except Exception:
        pass
    return certs_info


def analyze_certificate(apk_path: str) -> dict:
    """Analyze APK signing certificate(s)."""
    result = {
        "found": False,
        "certificates": [],
        "is_expired": False,
        "is_self_signed": False,
        "certificate_count": 0,
        "certificate_files": [],
        "warnings": []
    }

    # Find certificate files in META-INF
    cert_files = []
    cert_data_map = {}
    try:
        with zipfile.ZipFile(apk_path, 'r') as zf:
            for name in zf.namelist():
                lower = name.lower()
                if lower.startswith('meta-inf/') and (
                    lower.endswith('.rsa') or lower.endswith('.dsa') or lower.endswith('.ec')
                ):
                    cert_files.append(name)
                    cert_data_map[name] = zf.read(name)
    except Exception as e:
        result["warnings"].append(f"Could not read APK as ZIP: {str(e)}")
        return result

    result["certificate_files"] = cert_files

    if not cert_files:
        result["warnings"].append("APK is unsigned — no certificate found")
        return result

    result["found"] = True

    # Try androguard first
    certs_parsed = []
    androguard_success = False
    try:
        from androguard.core.bytecodes.apk import APK
        a = APK(apk_path)
        certs = a.get_certificates()
        if certs:
            androguard_success = True
            for cert in certs:
                try:
                    der = cert.dump()
                    subject = cert.subject.human_friendly if hasattr(cert.subject, 'human_friendly') else str(cert.subject)
                    issuer = cert.issuer.human_friendly if hasattr(cert.issuer, 'human_friendly') else str(cert.issuer)

                    sha256_fp = fingerprint_hex(der, 'sha256')
                    sha1_fp = fingerprint_hex(der, 'sha1')

                    serial = str(cert.serial_number)

                    # Get validity dates
                    try:
                        validity = cert['tbs_certificate']['validity']
                        not_before = validity['not_before'].native
                        not_after = validity['not_after'].native
                        valid_from = str(not_before)
                        valid_to = str(not_after)
                        now = datetime.now(timezone.utc)
                        is_expired = not_after < now if hasattr(not_after, 'tzinfo') else False
                    except Exception:
                        valid_from = "Unknown"
                        valid_to = "Unknown"
                        is_expired = False

                    is_self_signed = subject == issuer

                    sig_alg = "Unknown"
                    try:
                        sig_alg = cert['signature_algorithm']['algorithm'].native
                        alg_map = {
                            "sha256_rsa": "SHA256withRSA",
                            "sha1_rsa": "SHA1withRSA",
                            "sha384_rsa": "SHA384withRSA",
                            "sha512_rsa": "SHA512withRSA",
                            "sha256_ecdsa": "SHA256withECDSA",
                        }
                        sig_alg = alg_map.get(sig_alg, sig_alg)
                    except Exception:
                        pass

                    certs_parsed.append({
                        "subject": subject,
                        "issuer": issuer,
                        "serial_number": serial,
                        "sha256_fingerprint": sha256_fp,
                        "sha1_fingerprint": sha1_fp,
                        "valid_from": valid_from,
                        "valid_to": valid_to,
                        "is_self_signed": is_self_signed,
                        "signature_algorithm": sig_alg
                    })
                except Exception:
                    pass
    except Exception:
        pass

    # Fallback to cryptography library
    if not certs_parsed:
        for cert_file, cert_bytes in cert_data_map.items():
            parsed = parse_cert_with_cryptography(cert_bytes)
            certs_parsed.extend(parsed)

    result["certificates"] = certs_parsed
    result["certificate_count"] = len(certs_parsed)

    # Determine aggregate flags
    any_expired = False
    any_self_signed = False
    now = datetime.now(timezone.utc)

    for cert in certs_parsed:
        if cert.get("is_self_signed"):
            any_self_signed = True
        # Check expiry
        try:
            valid_to_str = cert.get("valid_to", "")
            if valid_to_str and valid_to_str not in ("Unknown", "N/A"):
                # Try to parse datetime
                from dateutil import parser as dateparser
                exp_date = dateparser.parse(valid_to_str)
                if exp_date:
                    if exp_date.tzinfo is None:
                        exp_date = exp_date.replace(tzinfo=timezone.utc)
                    if exp_date < now:
                        any_expired = True
        except Exception:
            try:
                for fmt in ["%Y-%m-%d %H:%M:%S%z", "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%d %H:%M:%S"]:
                    try:
                        exp_date = datetime.strptime(valid_to_str[:19], fmt[:19])
                        break
                    except Exception:
                        continue
            except Exception:
                pass

    result["is_expired"] = any_expired
    result["is_self_signed"] = any_self_signed

    # Warnings
    if any_self_signed:
        result["warnings"].append("Certificate is self-signed — not from a trusted CA")
    if any_expired:
        result["warnings"].append("Certificate has expired")
    if len(certs_parsed) > 1:
        result["warnings"].append("Multiple certificates detected")

    return result
