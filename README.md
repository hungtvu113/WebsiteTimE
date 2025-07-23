# 🕐 WebsiteTimE - Hệ thống Quản lý Thời gian Thông minh

## 📋 Giới thiệu

**WebsiteTimE** là một hệ thống quản lý thời gian toàn diện được xây dựng với kiến trúc fullstack hiện đại. Dự án được tổ chức theo mô hình **monorepo** với pnpm workspace, bao gồm ứng dụng web frontend và API backend mạnh mẽ, tích hợp AI để cung cấp trải nghiệm quản lý thời gian thông minh và hiệu quả.

## 🏗️ Kiến trúc Monorepo

Dự án được tổ chức theo cấu trúc monorepo với pnpm workspace:

```
WebsiteTimE/
├── frontend/           # @website-time/frontend
├── backend/            # @website-time/backend
├── packages/           # Shared packages (future)
├── package.json        # Root package.json
├── pnpm-workspace.yaml # Workspace configuration
└── pnpm-lock.yaml      # Lock file
```

### Frontend - @website-time/frontend
- **Framework**: Next.js 15 với React 19
- **UI Library**: Shadcn UI + Tailwind CSS
- **Language**: TypeScript
- **State Management**: React Hooks
- **Storage**: LocalStorage + API Integration

### Backend - @website-time/backend
- **Framework**: NestJS với Fastify
- **Database**: MongoDB với Mongoose ODM
- **Authentication**: JWT + Passport
- **API Documentation**: Swagger/OpenAPI
- **AI Integration**: Google Gemini AI với Genkit

## ✨ Tính năng Chính

### 📝 Quản lý Công việc (Tasks)
- ✅ Tạo, chỉnh sửa và xóa công việc
- 🎯 Phân loại theo mức độ ưu tiên (thấp, trung bình, cao)
- 🏷️ Gán nhãn và danh mục cho công việc
- 📊 Theo dõi trạng thái Scrum (backlog, todo, doing, done)
- ⏰ Thiết lập hạn hoàn thành và nhắc nhở

### 📁 Quản lý Dự án (Projects)
- 📂 Tạo và quản lý nhiều dự án
- 📈 Theo dõi tiến độ dự án
- 🔗 Phân loại công việc theo dự án

### 📅 Lịch và Khung giờ (Calendar & Time Blocks)
- 📆 Xem lịch theo ngày/tuần/tháng
- ⏱️ Tạo khung giờ cụ thể cho từng công việc
- 📊 Thống kê nhanh về khối thời gian trong ngày
- 📋 Hiển thị danh sách công việc đến hạn
- 🔢 Hiển thị số lượng công việc cho mỗi ngày

### 📊 Thống kê và Báo cáo
- 📈 Theo dõi hiệu suất công việc
- ⏳ Phân tích thời gian sử dụng
- 📉 Báo cáo tiến độ dự án

### 🤖 Tích hợp AI (Dr.AITime)
- 🧠 **AI Assistant**: Phân tích và tóm tắt công việc
- 💬 **AI Chatbox**: Chat trực tiếp về quản lý thời gian
- 💡 **Smart Suggestions**: Gợi ý độ ưu tiên và ngày hoàn thành
- 📝 **Lưu trữ lịch sử chat**: Theo dõi các cuộc hội thoại với AI

### ⚙️ Cá nhân hóa
- 🌓 Chế độ sáng/tối/hệ thống
- 📅 Tùy chỉnh ngày bắt đầu tuần
- ✅ Tùy chỉnh hiển thị công việc đã hoàn thành
- 🔧 Cấu hình AI và các tùy chọn khác

## 🚀 Cài đặt và Chạy Dự án

### 🐳 Chạy với Docker (Khuyến nghị)

**Yêu cầu:**
- Docker 20.10+
- Docker Compose 2.0+

**Cách chạy nhanh:**
```bash
# Clone repository
git clone https://github.com/hungtvu113/WebsiteTimE.git
cd WebsiteTimE

# Thiết lập environment
cp .env.example .env
# Chỉnh sửa .env và điền GEMINI_API_KEY

# Khởi động tất cả services
docker-compose up -d

# Hoặc sử dụng script tiện ích
chmod +x docker-scripts.sh
./docker-scripts.sh setup
./docker-scripts.sh start
```

**Truy cập:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

📖 **Xem hướng dẫn chi tiết:** [README-DOCKER.md](README-DOCKER.md)

---

### 💻 Chạy Local Development với pnpm

**Yêu cầu hệ thống:**
- Node.js 18+
- pnpm 8+
- MongoDB 6+

### 1. Clone Repository và Cài đặt Dependencies
```bash
git clone https://github.com/hungtvu113/WebsiteTimE.git
cd WebsiteTimE

# Cài đặt pnpm (nếu chưa có)
npm install -g pnpm

# Cài đặt tất cả dependencies trong workspace
pnpm install
```

### 2. Cấu hình Environment Variables

**Backend (.env):**
```bash
cd backend
cp .env.example .env
# Cấu hình các biến môi trường trong .env:
# MONGODB_URI=mongodb://localhost:27017/qltime
# JWT_SECRET=your_jwt_secret_here
# GEMINI_API_KEY=your_gemini_api_key_here
```

**Frontend (.env.local):**
```bash
cd ../frontend
cp .env.local.example .env.local
# Cấu hình:
# NEXT_PUBLIC_API_URL=http://localhost:3001
# NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Chạy Development Servers

**Chạy tất cả services:**
```bash
# Từ root directory
pnpm dev
```

**Hoặc chạy riêng từng service:**
```bash
# Chạy backend
pnpm backend:dev

# Chạy frontend (terminal khác)
pnpm frontend:dev
```

**Truy cập:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

### 4. Các Scripts Hữu ích

```bash
# Build tất cả packages
pnpm build

# Chạy tests
pnpm test

# Lint code
pnpm lint

# Clean build artifacts
pnpm clean
```

## 🔧 Cấu hình AI (Google Gemini)

### 1. Lấy API Key
1. Truy cập [Google AI Studio](https://ai.google.dev/)
2. Đăng nhập bằng tài khoản Google
3. Tạo API key mới
4. Sao chép API key

### 2. Cấu hình Backend
Thêm vào file `qltimebe/.env`:
```env
GEMINI_API_KEY=your_api_key_here
```

### 3. Cấu hình Frontend
Thêm vào file `KTMNJS/.env.local`:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

## 📚 API Documentation

Backend cung cấp RESTful API với các endpoint chính:

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Làm mới token

### Tasks
- `GET /api/tasks` - Lấy danh sách công việc
- `POST /api/tasks` - Tạo công việc mới
- `PUT /api/tasks/:id` - Cập nhật công việc
- `DELETE /api/tasks/:id` - Xóa công việc

### Projects
- `GET /api/projects` - Lấy danh sách dự án
- `POST /api/projects` - Tạo dự án mới
- `PUT /api/projects/:id` - Cập nhật dự án

### AI Features
- `POST /api/ai/chat` - Chat với AI
- `POST /api/ai/suggest-priority` - Gợi ý độ ưu tiên
- `POST /api/ai/suggest-due-date` - Gợi ý ngày hoàn thành
- `GET /api/ai/chat-history` - Lấy lịch sử chat

Chi tiết đầy đủ tại: `http://localhost:3001/api/docs`

## 🛠️ Công nghệ Sử dụng

### Frontend Stack
- **Next.js 15**: React framework với App Router
- **React 19**: UI library mới nhất
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: Component library
- **Framer Motion**: Animation library
- **React Hook Form**: Form management
- **Zod**: Schema validation

### Backend Stack
- **NestJS**: Progressive Node.js framework
- **Fastify**: Fast web framework (thay vì Express)
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication
- **Swagger**: API documentation
- **Google Gemini AI**: AI integration
- **Genkit**: AI development framework

## 🔒 Bảo mật

- 🔐 JWT Authentication với refresh token
- 🛡️ Validation và sanitization dữ liệu đầu vào
- 🔒 CORS configuration
- 🔑 API key được lưu trữ an toàn
- 👤 User authorization cho tất cả resources

## 📱 Responsive Design

Ứng dụng được thiết kế responsive, hoạt động tốt trên:
- 💻 Desktop
- 📱 Mobile
- 📟 Tablet

## 🚀 Triển khai

### Frontend (Vercel)
```bash
cd KTMNJS
npm run build
# Deploy to Vercel
```

### Backend (Railway/Heroku)
```bash
cd qltimebe
npm run build
npm run start:prod
```

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này được phân phối dưới MIT License. Xem file `LICENSE` để biết thêm chi tiết.

## 👨‍💻 Tác giả

- **hungtvu113** - *Initial work* - [GitHub](https://github.com/hungtvu113)
- **Các thành viên trong nhóm (chưa thêm vào)** 

## 🙏 Acknowledgments

- Cảm ơn cộng đồng Next.js và NestJS
- Cảm ơn Google AI team cho Gemini API
- Cảm ơn Shadcn cho component library tuyệt vời
