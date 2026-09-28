# Ngủ ngon nha bà — Mây hồng và chữ chạy

Bản làm lại theo bố cục video mẫu: nền đen, mây hồng neon, thanh chữ phát sáng ngay dưới mây, chữ lướt từ phải sang trái, các trái tim nhiều màu rơi liên tục và xoay dưới mây.

## Mở web

Giải nén toàn bộ thư mục, rồi mở `index.html` trong trình duyệt trên máy tính. Mở thư mục bằng VS Code nếu muốn sửa. Không cần cài npm hoặc thư viện; giữ nguyên thư mục `assets` bên cạnh ba tệp HTML/CSS/JS.

Mở web sẽ có đồng hồ chờ ngắn rồi tự chạy cảnh. Chạm vào cảnh để bật bài hát từ video mới `1000000129.mp4` do người dùng gửi. Hai biểu tượng nhỏ ở góc dưới cho phép tạm dừng và bật/tắt nhạc. Trình duyệt điện thoại cần thao tác chạm trước khi phát âm thanh.

## Sửa lời chúc

Mở `app.js`, sửa `MESSAGE` ở đầu tệp. Chữ sẽ chạy trong thanh nằm ngay dưới đám mây.

- `TEXT_SPEED`: tốc độ chữ. Mặc định 104 pixel/giây trên khung chuẩn 720 × 1280. Số nhỏ hơn sẽ chạy chậm hơn.
- `colors`: màu các trái tim.
- `prepareCloud()`: màu và ánh sáng của mây và thanh chữ.

Hình mây và trái tim được vẽ bằng Canvas; chuyển động được tạo bằng JavaScript. Bản này không dùng mây ảnh của bản trước, không có giấy ghi muộn phiền, thao tác giữ để xả hay màn kết thúc riêng.

## Tệp đi kèm

- `index.html`, `styles.css`, `app.js`: trang web và chuyển động.
- `assets/Lobster-Regular.ttf`: phông chữ hỗ trợ tiếng Việt.
- `assets/Lobster-OFL.txt`: giấy phép SIL Open Font License của phông Lobster.
- `assets/nhac-ngu-ngon.m4a`: toàn bộ âm thanh 62,9 giây từ video mới, giữ nguyên dữ liệu âm thanh gốc, phát lặp lại.

Phần tim rơi giữ theo mẫu; không sử dụng các ảnh chân dung người lạ xuất hiện trong video.

## GitHub Pages

Tải các tệp và cả thư mục `assets` lên cùng thư mục gốc của repo. Bật GitHub Pages cho nhánh đó. Mọi đường dẫn đều tương đối và không phụ thuộc địa chỉ Sites.

## Kiểm tra

Đã kiểm tra cú pháp, tài nguyên đi kèm, vòng chạy chữ và trạng thái điều khiển trong mô phỏng, đồng thời xuất khung Canvas để đối chiếu bố cục video. Chưa kiểm tra trình duyệt trên điện thoại thật. Khi thiết bị bật chế độ giảm chuyển động, lời chúc hiển thị tĩnh để dễ đọc.
