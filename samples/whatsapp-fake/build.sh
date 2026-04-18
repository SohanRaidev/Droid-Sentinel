#!/usr/bin/env bash
# Build the fake-WhatsApp demo APK. Triggers Droid Sentinel's clone-detection
# pipeline end-to-end. For security-demo use only — never distribute.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ANDROID_SDK="${ANDROID_SDK:-$HOME/Library/Android/sdk}"
BUILD_TOOLS="$ANDROID_SDK/build-tools/36.1.0"
PLATFORM_JAR="$ANDROID_SDK/platforms/android-34/android.jar"
JAVA_HOME="${JAVA_HOME:-/Applications/Android Studio.app/Contents/jbr/Contents/Home}"
export JAVA_HOME
export PATH="$JAVA_HOME/bin:$BUILD_TOOLS:$PATH"

OUT_DIR="$SCRIPT_DIR/build"
APK_OUT="$SCRIPT_DIR/../WhatsApp_Fake_v2.22.apk"
KEYSTORE="$SCRIPT_DIR/build/demo.keystore"
KEY_ALIAS="mobilesoft"
KEY_PASS="droidsentinel"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR/compiled" "$OUT_DIR/classes"

echo "==> compiling Java"
javac -source 1.8 -target 1.8 -d "$OUT_DIR/classes" \
  src/com/whatsapp/MainActivity.java

echo "==> d8 -> classes.dex"
"$BUILD_TOOLS/d8" --release --output "$OUT_DIR" \
  "$OUT_DIR/classes/com/whatsapp/MainActivity.class"

echo "==> aapt2 compile resources"
"$BUILD_TOOLS/aapt2" compile --dir res -o "$OUT_DIR/compiled/res.zip"

echo "==> aapt2 link"
"$BUILD_TOOLS/aapt2" link \
  -I "$PLATFORM_JAR" \
  --manifest AndroidManifest.xml \
  -o "$OUT_DIR/app-unsigned.apk" \
  "$OUT_DIR/compiled/res.zip"

echo "==> add classes.dex to APK"
cd "$OUT_DIR"
cp app-unsigned.apk app-with-dex.apk
zip -q app-with-dex.apk classes.dex
cd "$SCRIPT_DIR"

echo "==> zipalign"
"$BUILD_TOOLS/zipalign" -f -p 4 \
  "$OUT_DIR/app-with-dex.apk" "$OUT_DIR/app-aligned.apk"

echo "==> generate signing key (O=MobileSoft Solutions Ltd)"
if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair -v \
    -keystore "$KEYSTORE" \
    -alias "$KEY_ALIAS" \
    -keyalg RSA -keysize 2048 -validity 3650 \
    -storepass "$KEY_PASS" -keypass "$KEY_PASS" \
    -dname "CN=MobileSoft, O=MobileSoft Solutions Ltd, OU=Android Dev, L=San Jose, ST=California, C=US"
fi

echo "==> apksigner sign (v1+v2)"
"$BUILD_TOOLS/apksigner" sign \
  --ks "$KEYSTORE" \
  --ks-key-alias "$KEY_ALIAS" \
  --ks-pass "pass:$KEY_PASS" \
  --key-pass "pass:$KEY_PASS" \
  --v1-signing-enabled true \
  --v2-signing-enabled true \
  --out "$APK_OUT" \
  "$OUT_DIR/app-aligned.apk"

echo "==> verify"
"$BUILD_TOOLS/apksigner" verify --print-certs "$APK_OUT" | head -20

echo
echo "OK -> $APK_OUT"
ls -lh "$APK_OUT"
