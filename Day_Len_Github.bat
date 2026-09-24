@echo off
chcp 65001 > nul
title Đẩy Mã Nguồn Lên GitHub - Kho Vật Liệu Android App
echo ================================================================
echo   ĐẨY DỰ ÁN QL-VATLIEU-ANDROID-APP LÊN GITHUB TỰ ĐỘNG
echo ================================================================
echo.
echo Đang chuẩn bị đẩy lên:
echo https://github.com/khanh1276-art/ql-vatlieu-android-app.git
echo.
echo Khi cửa sổ yêu cầu:
echo   - Username: nhập khanh1276-art
echo   - Password: dán Personal Access Token (PAT) của GitHub
echo.
"C:\Users\Khanh\.gemini\antigravity\scratch\mingit\cmd\git.exe" push -u origin main
echo.
echo ================================================================
echo Đã xử lý xong! Bấm phím bất kỳ để đóng cửa sổ này...
pause > nul
