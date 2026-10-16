package com.vegasone.app;

import android.graphics.Color;
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
    }
}
