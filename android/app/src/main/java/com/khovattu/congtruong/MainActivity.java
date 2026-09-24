package com.khovattu.congtruong;

import android.os.Bundle;
import android.view.View;
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
        // 4. Kích hoạt Hardware Layer để triệt tiêu độ trễ khi gõ bàn phím
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
            WebSettings settings = webView.getSettings();
            settings.setSupportZoom(false);
            settings.setBuiltInZoomControls(false);
            settings.setDisplayZoomControls(false);
            settings.setTextZoom(100);
            settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
            settings.setEnableSmoothTransition(true);
        }
    }
}
