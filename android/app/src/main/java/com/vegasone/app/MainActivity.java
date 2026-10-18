package com.vegasone.app;

import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Ensure webview never draws under status bar or over navigation keys
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().setStatusBarColor(Color.parseColor("#070514"));
            getWindow().setNavigationBarColor(Color.parseColor("#070514"));
        }

        handleAuthIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleAuthIntent(intent);
    }

    private void handleAuthIntent(Intent intent) {
        if (intent == null || intent.getData() == null) return;
        Uri data = intent.getData();
        if ("vegasone".equalsIgnoreCase(data.getScheme())) {
            String token = data.getQueryParameter("token");
            if (token != null && !token.trim().isEmpty()) {
                final String safeToken = token.trim();
                if (getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().post(new Runnable() {
                        @Override
                        public void run() {
                            getBridge().getWebView().loadUrl("https://vegasone.games/?auth_token=" + safeToken);
                        }
                    });
                }
            }
        }
    }
}

