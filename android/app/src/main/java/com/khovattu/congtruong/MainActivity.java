package com.khovattu.congtruong;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Khóa cố định kích thước và tỉ lệ hiển thị chuẩn Native App:
        // 1. Tắt hoàn toàn thao tác phóng to / thu nhỏ (Pinch-to-zoom & Double tap zoom)
        // 2. Tắt các nút điều khiển zoom ảo
        // 3. Khóa cứng tỉ lệ phóng chữ hệ thống ở 100% (tránh vỡ khung khi điện thoại bật font to)
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            settings.setSupportZoom(false);
            settings.setBuiltInZoomControls(false);
            settings.setDisplayZoomControls(false);
            settings.setTextZoom(100);
        }
    }
}
