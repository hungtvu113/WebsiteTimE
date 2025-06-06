# QLTime - Ứng dụng Quản lý Thời gian Hiệu quả

## Giới thiệu

QLTime là ứng dụng quản lý thời gian hiệu quả được xây dựng bằng Next.js và Shadcn UI. Ứng dụng giúp người dùng sắp xếp công việc, lên lịch hợp lý và đạt được hiệu suất cao nhất trong cuộc sống hàng ngày.

## Tính năng chính

### 1. Quản lý Công việc (Tasks)
- Tạo, chỉnh sửa và xóa công việc
- Phân loại công việc theo mức độ ưu tiên (thấp, trung bình, cao)
- Gán nhãn và danh mục cho công việc
- Theo dõi trạng thái hoàn thành của công việc
- Hỗ trợ trạng thái Scrum (backlog, todo, doing, done)

### 2. Quản lý Dự án (Projects)
- Tạo và quản lý nhiều dự án
- Phân loại công việc theo dự án
- Theo dõi tiến độ dự án

### 3. Lịch và Khung giờ (Calendar & Time Blocks)
- Xem lịch theo ngày hoặc tuần
- Tạo khung giờ cụ thể cho từng công việc
- Hiển thị thống kê nhanh về khối thời gian và công việc trong ngày
- Hiển thị danh sách công việc đến hạn cho ngày được chọn
- Hiển thị số lượng công việc cho mỗi ngày trong chế độ xem tuần

### 4. Thống kê (Statistics)
- Theo dõi hiệu suất công việc
- Phân tích thời gian sử dụng

### 5. Cá nhân hóa
- Chế độ sáng/tối/hệ thống
- Tùy chỉnh ngày bắt đầu tuần
- Tùy chỉnh hiển thị công việc đã hoàn thành

## Công nghệ sử dụng

- **Frontend**: Next.js, React, TypeScript
- **UI Components**: Shadcn UI, Tailwind CSS
- **State Management**: React Hooks
- **Lưu trữ dữ liệu**: LocalStorage
- **Thư viện bổ sung**: date-fns, uuid, lucide-react

## Cấu trúc dự án

```
src/
├── app/                  # Các trang chính của ứng dụng
│   ├── calendar/        # Trang lịch
│   ├── projects/        # Trang dự án
│   ├── statistics/      # Trang thống kê
│   ├── tasks/           # Trang quản lý công việc
│   └── settings/        # Trang cài đặt
├── components/          # Các thành phần UI
│   ├── calendar/        # Components liên quan đến lịch
│   ├── layout/          # Layout chung
│   ├── project/         # Components liên quan đến dự án
│   ├── statistics/      # Components thống kê
│   ├── task/            # Components liên quan đến công việc
│   ├── timeblock/       # Components khối thời gian
│   └── ui/              # Các components UI cơ bản (Shadcn)
└── lib/                 # Thư viện và tiện ích
    ├── services/        # Các service xử lý dữ liệu
    └── types.ts         # Định nghĩa kiểu dữ liệu
```

## Bắt đầu

### Cài đặt

```bash
# Cài đặt các dependencies
npm install

# Chạy môi trường phát triển
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt để xem kết quả.

## Cải tiến gần đây

- Tích hợp trang lịch với thống kê và công việc
- Thêm thống kê nhanh về khối thời gian và công việc trong ngày
- Hiển thị danh sách công việc đến hạn cho ngày được chọn
- Hiển thị số lượng công việc cho mỗi ngày trong chế độ xem tuần
- Tạo component Badge để hiển thị mức độ ưu tiên của công việc

## Triển khai

Ứng dụng có thể được triển khai dễ dàng trên Vercel:

```bash
npm run build
```

Hoặc sử dụng nền tảng [Vercel](https://vercel.com) để triển khai tự động từ repository.
