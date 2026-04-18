import hashlib
import zipfile
import struct
import os
from datetime import datetime


def format_size(size_bytes: int) -> str:
    """Format bytes to human-readable string."""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} TB"


def compute_hashes(file_path: str) -> dict:
    """Compute MD5, SHA1, SHA256 hashes of a file."""
    md5 = hashlib.md5()
    sha1 = hashlib.sha1()
    sha256 = hashlib.sha256()
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            md5.update(chunk)
            sha1.update(chunk)
            sha256.update(chunk)
    return {
        "md5": md5.hexdigest(),
        "sha1": sha1.hexdigest(),
        "sha256": sha256.hexdigest()
    }


def get_dex_timestamp(dex_data: bytes) -> str:
    """Extract compilation timestamp from DEX header if available."""
    try:
        # DEX header: magic (8 bytes) + checksum (4) + SHA-1 (20) + file_size (4) + header_size (4) + ...
        # There's no standard timestamp in DEX, but we can try to parse the checksum area
        # Some tools embed timestamps in DEX comments — return empty if not found
        if len(dex_data) < 8:
            return ""
        magic = dex_data[:8]
        if magic[:4] == b'dex\n':
            # Return version string as pseudo-info
            version = dex_data[4:8].decode('ascii', errors='ignore').strip('\x00')
            return f"DEX version {version}"
    except Exception:
        pass
    return ""


def extract_metadata(apk_path: str, original_filename: str) -> dict:
    """Extract comprehensive metadata from an APK file."""
    result = {
        "filename": original_filename,
        "file_size": 0,
        "file_size_human": "0 B",
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

    # File size and hashes
    try:
        file_size = os.path.getsize(apk_path)
        result["file_size"] = file_size
        result["file_size_human"] = format_size(file_size)
        result["hashes"] = compute_hashes(apk_path)
    except Exception as e:
        result["hashes"] = {"md5": "error", "sha1": "error", "sha256": str(e)}

    # ZIP analysis
    try:
        with zipfile.ZipFile(apk_path, 'r') as zf:
            result["is_valid_zip"] = True
            all_files = zf.namelist()
            result["total_files"] = len(all_files)

            dex_files = [f for f in all_files if f.endswith('.dex')]
            result["dex_count"] = len(dex_files)

            native_libs = [f for f in all_files if f.endswith('.so')]
            result["native_libs"] = native_libs
            result["has_native_libs"] = len(native_libs) > 0

            assets = [f for f in all_files if f.startswith('assets/')]
            result["assets_count"] = len(assets)

            # Get DEX compilation info
            if dex_files:
                try:
                    dex_data = zf.read(dex_files[0])
                    result["compilation_timestamp"] = get_dex_timestamp(dex_data)
                except Exception:
                    pass

    except zipfile.BadZipFile:
        result["is_valid_zip"] = False
    except Exception as e:
        result["is_valid_zip"] = False

    # Try androguard for APK metadata
    try:
        from androguard.core.bytecodes.apk import APK
        a = APK(apk_path)

        pkg = a.get_package()
        if pkg:
            result["package_name"] = pkg

        app_name = a.get_app_name()
        if app_name:
            result["app_name"] = app_name

        version_name = a.get_androidversion_name()
        if version_name:
            result["version_name"] = version_name

        version_code = a.get_androidversion_code()
        if version_code:
            result["version_code"] = str(version_code)

        min_sdk = a.get_min_sdk_version()
        if min_sdk:
            result["min_sdk"] = str(min_sdk)

        target_sdk = a.get_target_sdk_version()
        if target_sdk:
            result["target_sdk"] = str(target_sdk)

    except Exception:
        # Fallback: try to parse AndroidManifest.xml from ZIP directly
        try:
            with zipfile.ZipFile(apk_path, 'r') as zf:
                if 'AndroidManifest.xml' in zf.namelist():
                    manifest_data = zf.read('AndroidManifest.xml')
                    # Binary manifest — try basic string extraction
                    content = manifest_data.decode('utf-8', errors='ignore')
                    # Look for package name pattern in decoded content
                    import re
                    pkg_match = re.search(r'package["\s=]+([a-z][a-z0-9_.]+)', content, re.IGNORECASE)
                    if pkg_match:
                        result["package_name"] = pkg_match.group(1)
        except Exception:
            pass

    return result
