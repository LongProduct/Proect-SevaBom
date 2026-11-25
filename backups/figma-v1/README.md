# SEVA — HTML local từ Figma

Triển khai frame `Desktop Demo` (`29978:21810`) từ file Figma Seva Design System bằng HTML, CSS và JavaScript thuần. Logo, avatar, ảnh trang sức và icon được tải về thư mục `assets`; không cần build hay cài dependency.

## Chạy local

Trong thư mục dự án, chạy:

```bash
python3 -m http.server 5173 --bind 127.0.0.1
```

Mở http://127.0.0.1:5173. Có thể mở trực tiếp `index.html` nếu không cần server.

## Chức năng

- Tìm theo mã phiếu hoặc nguồn, lọc trạng thái và khoảng ngày.
- Chuyển tab, phân trang và đổi số dòng mỗi trang.
- Tạo, xem, sửa phiếu nhập; dữ liệu tự lưu trong localStorage của trình duyệt.
- Thu gọn thanh điều hướng, cuộn bảng ngang/dọc, header và cột thao tác cố định.

Figma gốc dùng dữ liệu mẫu `----------`, `[0000] - SEVAGO`, `Text`; bản dựng giữ các nội dung đó. Các trạng thái của dòng mẫu phục vụ thao tác lọc demo. Form tạo/sửa là phần bổ sung để thử tương tác, không có trong frame gốc. Menu bên chỉ phản hồi trong phạm vi demo. Chưa kết nối backend.
