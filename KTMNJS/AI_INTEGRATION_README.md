# Tích hợp AI với Gemini API - QLTime

## Tổng quan

Dự án QLTime đã được tích hợp với Google Gemini AI để cung cấp các tính năng AI thông minh:

### Tính năng AI
1. **AI Assistant (Dr.AITime)** - Phân tích và tóm tắt công việc
2. **AI Chatbox** - Chat trực tiếp với AI về quản lý thời gian
3. **Smart Suggestions** - Gợi ý độ ưu tiên và ngày hoàn thành cho công việc

## Cấu hình

### 1. Lấy API Key từ Google AI Studio

1. Truy cập [Google AI Studio](https://ai.google.dev/)
2. Đăng nhập bằng tài khoản Google
3. Tạo API key mới
4. Sao chép API key

### 2. Cấu hình Frontend (KTMNJS)

Thêm API key vào file `.env.local`:

```env
# Gemini AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

### 3. Cấu hình Backend (qltimebe)

Thêm API key vào file `.env`:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your_api_key_here
```

## Cách sử dụng

### 1. Cấu hình trong ứng dụng

1. Đăng nhập vào QLTime
2. Vào **Settings** (Cài đặt)
3. Tìm phần **Cấu hình AI**
4. Nhập API key và nhấn **Lưu**

### 2. Sử dụng AI Assistant

- Nhấn vào biểu tượng **Brain** ở góc phải màn hình
- Chọn tab **Phân tích** để xem tóm tắt công việc
- AI sẽ phân tích và đưa ra đánh giá về tiến độ công việc

### 3. Sử dụng AI Chatbox

- Nhấn vào biểu tượng **Chat** ở góc trái màn hình
- Gõ câu hỏi về quản lý thời gian
- AI sẽ trả lời và đưa ra lời khuyên

### 4. Smart Suggestions cho công việc

- Khi tạo công việc mới, nhấn nút **AI Suggestions**
- AI sẽ tự động gợi ý:
  - Độ ưu tiên (High/Medium/Low)
  - Ngày hoàn thành phù hợp

## Kiến trúc

### Frontend (Client-side)
- **AI Service** (`/src/lib/services/ai-service.ts`)
- **AI Assistant** (`/src/components/ai/ai-assistant.tsx`)
- **AI Chatbox** (`/src/components/ai/ai-chatbox.tsx`)
- **AI Settings** (`/src/components/ai/ai-settings.tsx`)

### Backend (Server-side)
- **AI Module** (`/src/modules/ai/`)
- **AI Controller** - REST API endpoints
- **AI Service** - Business logic với Genkit
- **Chat History Schema** - Lưu trữ lịch sử chat

### API Endpoints

```
POST /api/ai/chat
POST /api/ai/suggest-priority
POST /api/ai/suggest-due-date
GET /api/ai/chat-history
DELETE /api/ai/chat-history
```

## Fallback Strategy

Hệ thống có cơ chế fallback thông minh:

1. **Ưu tiên Backend**: Sử dụng API backend trước
2. **Fallback Client**: Nếu backend lỗi, chuyển sang client-side
3. **Fallback Logic**: Nếu AI không khả dụng, sử dụng logic từ khóa

## Bảo mật

- API key được lưu trữ cục bộ trên browser
- Không gửi API key lên server
- Sử dụng JWT token để xác thực API calls
- Chat history được lưu trữ an toàn trong database

## Troubleshooting

### Lỗi thường gặp

1. **"AI hiện không khả dụng"**
   - Kiểm tra API key đã được cấu hình chưa
   - Đảm bảo API key hợp lệ

2. **"Phiên đăng nhập đã hết hạn"**
   - Đăng nhập lại vào ứng dụng

3. **Chat không hoạt động**
   - Kiểm tra kết nối internet
   - Kiểm tra backend server đang chạy

### Debug

Mở Developer Tools (F12) và kiểm tra:
- Console logs
- Network requests
- Local storage cho API key

## Phát triển tiếp

### Tính năng có thể thêm

1. **Streaming Chat** - Chat real-time với Server-Sent Events
2. **Voice Chat** - Tích hợp Speech-to-Text
3. **Smart Calendar** - AI gợi ý lịch trình tối ưu
4. **Task Analytics** - Phân tích sâu về hiệu suất làm việc
5. **Team AI** - AI cho nhóm làm việc

### Cải thiện hiệu suất

1. Caching responses
2. Rate limiting
3. Response compression
4. Background processing

## Liên hệ

Nếu có vấn đề hoặc đề xuất, vui lòng tạo issue trong repository.
