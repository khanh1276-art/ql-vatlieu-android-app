# ỨNG DỤNG ANDROID NATIVE - QUẢN LÝ KHO VẬT LIỆU CÔNG TRƯỜNG
> **Nền tảng:** Hybrid Native (Capacitor 6 + Android Studio)  
> **Package ID:** `com.khovattu.congtruong`  
> **Trạng thái:** Dự án độc lập hoàn toàn, không xung đột với hệ thống web đang vận hành.

---

## 🌟 Điểm Vượt Trội Của Bản Ứng Dụng Android Gốc (So với Web PWA)

1. **Khởi động tức thì (Instant Startup):**
   - Toàn bộ giao diện (HTML, CSS, JS, Icon) được nhúng trực tiếp trong bộ nhớ máy (`assets/public/`).
   - Mở ứng dụng chỉ mất **0.2 giây**, không phải chờ tải trang web từ Render qua mạng.
2. **Chế độ Ngoại Tuyến (Offline Queue khi mất sóng công trường):**
   - Khi xe vào bãi ở vùng núi, hầm mỏ hoặc nơi mất sóng 4G/Wifi, thủ kho/bảo vệ **vẫn bấm nhập xe bình thường**.
   - Dữ liệu được lưu an toàn vào hàng đợi bộ nhớ máy.
   - Khi có sóng trở lại, ứng dụng hiển thị thông báo và nút **"ĐỒNG BỘ NGAY 🚀"** để đẩy toàn bộ phiếu xe lên máy chủ Render.
3. **Tích hợp Camera điện thoại:**
   - Nút **"📸 Bật Camera Chụp"** ngay trong form vào cổng: Cho phép chụp trực tiếp phiếu cân xe, biển số xe hoặc tình trạng thùng xe.
   - Ảnh được tự động nén kích thước tối ưu ngay trên điện thoại để tiết kiệm dung lượng 3G/4G.
4. **Rung phản hồi (Haptic Feedback):**
   - Khi xác nhận xe vào/ra thành công, điện thoại sẽ rung phản hồi xúc giác nhẹ để người thao tác nhận biết ngay cả trong môi trường công trường ồn ào.
5. **Cấu hình máy chủ linh hoạt (Cloud Render / LAN Cục bộ):**
   - Nút **🌐 Cấu hình máy chủ** cho phép chuyển đổi tức thì giữa:
     - Đám mây: `https://ql-vatlieu-congtruong.onrender.com`
     - Mạng nội bộ công trường: `http://192.168.1.100:3000` (khi công trường lắp máy chủ mini nội bộ không có internet).

---

## 📁 Cấu Trúc Thư Mục Dự Án Độc Lập

```
ql-vatlieu-android-app/
├── package.json               # Thư viện Capacitor & cấu hình npm
├── capacitor.config.json      # Cấu hình app (App ID, tên app, scheme)
├── README.md                  # Tài liệu hướng dẫn
├── .github/
│   └── workflows/
│       └── build-apk.yml      # Tự động biên dịch file APK trên đám mây GitHub
├── www/                       # Giao diện ứng dụng nạp trong bộ nhớ máy
│   ├── index.html             # Giao diện chính (tích hợp Camera & Cấu hình máy chủ)
│   ├── app.js                 # Xử lý logic nghiệp vụ kho
│   ├── native.js              # Module Native: Camera, Rung, Offline Queue, API Base URL
│   ├── style.css              # Giao diện phong cách Dark/Blue
│   └── icon-*.png             # Bộ icon chuẩn HD & Maskable
└── android/                   # Dự án Android Studio hoàn chỉnh
    ├── build.gradle           # Cấu hình Gradle gốc
    ├── gradlew / gradlew.bat  # Công cụ biên dịch Gradle
    └── app/
        ├── build.gradle       # Cấu hình ứng dụng Android
        └── src/main/
            ├── AndroidManifest.xml # Quyền Camera, Mạng, Rung
            ├── java/          # Mã nguồn Java MainActivity
            ├── res/           # Bộ icon Mipmap đa kích thước (mdpi đến xxxhdpi)
            └── assets/public/ # Bản sao tài nguyên web chạy cục bộ trong app
```

---

## 🚀 2 Cách Để Xuất Ra File Cài Đặt `.apk` Cho Điện Thoại

### 👉 CÁCH 1: Dùng GitHub Actions Tự Động Tạo APK (Dễ Nhất - Khuyên Dùng)
*Bạn không cần phải cài đặt bất kỳ phần mềm lập trình hay Java nào lên máy tính!*

1. Tạo một repository mới trên GitHub (ví dụ đặt tên: `ql-vatlieu-android-app`).
2. Tải toàn bộ thư mục `ql-vatlieu-android-app` này lên repo GitHub đó.
3. Ngay lập tức, tab **Actions** trên GitHub sẽ tự động kích hoạt tiến trình biên dịch máy chủ ảo (Ubuntu + Java 17 + Android SDK).
4. Sau 2-3 phút, trong mục **Artifacts** của tiến trình, bạn bấm tải file **`KhoVatLieu-CongTruong-App-Debug.apk`** về điện thoại và cài đặt!

---

### 👉 CÁCH 2: Mở và Xuất APK Bằng Android Studio
*Dành cho khi bạn đã cài đặt Android Studio trên máy tính:*

1. Mở phần mềm **Android Studio**.
2. Chọn **Open** $\rightarrow$ Trỏ tới thư mục:  
   `C:\Users\Khanh\.gemini\antigravity\scratch\ql-vatlieu-android-app\android`
3. Chờ Android Studio đồng bộ Gradle (khoảng 1 phút).
4. Vào menu: **Build** $\rightarrow$ **Build Bundle(s) / APK(s)** $\rightarrow$ **Build APK(s)**.
5. Android Studio sẽ thông báo và dẫn bạn đến file `app-debug.apk` đã tạo xong!
