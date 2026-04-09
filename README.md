# BookStore

Ứng dụng quản lý cửa hàng sách với backend Node.js/Express và giao diện admin + client.

## Công nghệ chính

- Node.js
- Express
- MongoDB / Mongoose
- Pug
- Joi (backend validation)
- Cloudinary
- JWT
- Nodemon

## Cài đặt

1. Mở terminal tại thư mục `bookStore`
2. Chạy:

```bash
yarn install
```

3. Sao chép file cấu hình môi trường:

```bash
cp .env.example .env
```

4. Cập nhật các biến môi trường trong `.env`

## Chạy dự án

```bash
npm start
```

Ứng dụng sẽ chạy tại `http://localhost:3033` (mặc định).

## Cấu trúc chính

- `index.js` - entrypoint ứng dụng
- `router/` - định tuyến admin và client
- `controllers/` - logic xử lý request
- `models/` - định nghĩa schema MongoDB
- `validates/` - Joi validation cho backend
- `views/` - template Pug
- `public/` - tài nguyên front-end


## Lưu ý

- Đảm bảo `DATABASE` trong `.env` kết nối đến MongoDB hợp lệ.
- Cấu hình Cloudinary và email nếu sử dụng upload ảnh và gửi OTP.
