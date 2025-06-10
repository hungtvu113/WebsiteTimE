# 🐳 Hướng dẫn chạy QLTime với Docker

## 📋 Yêu cầu hệ thống

- Docker 20.10+
- Docker Compose 2.0+
- Git

## 🚀 Cách chạy nhanh (Production)

### 1. Clone repository
```bash
git clone https://github.com/hungtvu113/WebsiteTimE.git
cd WebsiteTimE
```

### 2. Cấu hình environment variables
```bash
# Sao chép file .env mẫu
cp .env.example .env

# Chỉnh sửa file .env và điền các giá trị thực tế
# Đặc biệt quan trọng: GEMINI_API_KEY
```

### 3. Khởi động tất cả services
```bash
# Build và chạy tất cả containers
docker-compose up -d

# Xem logs
docker-compose logs -f
```

### 4. Truy cập ứng dụng
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **MongoDB**: localhost:27017

## 🛠️ Development Mode

Để phát triển với hot reload:

```bash
# Chạy ở chế độ development
docker-compose -f docker-compose.dev.yml up -d

# Xem logs
docker-compose -f docker-compose.dev.yml logs -f
```

## 📊 Quản lý containers

### Xem trạng thái containers
```bash
docker-compose ps
```

### Dừng tất cả services
```bash
docker-compose down
```

### Dừng và xóa volumes (xóa dữ liệu)
```bash
docker-compose down -v
```

### Rebuild containers
```bash
# Rebuild tất cả
docker-compose build --no-cache

# Rebuild service cụ thể
docker-compose build --no-cache backend
docker-compose build --no-cache frontend
```

### Xem logs của service cụ thể
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

## 🔧 Troubleshooting

### 1. Port đã được sử dụng
Nếu gặp lỗi port đã được sử dụng, thay đổi ports trong `docker-compose.yml`:
```yaml
services:
  frontend:
    ports:
      - "3001:3000"  # Thay đổi port bên trái
  backend:
    ports:
      - "3002:3001"  # Thay đổi port bên trái
```

### 2. MongoDB connection issues
Kiểm tra MongoDB container:
```bash
# Vào MongoDB container
docker-compose exec mongodb mongosh

# Kiểm tra databases
show dbs
use qltime
show collections
```

### 3. Backend không kết nối được MongoDB
Kiểm tra logs:
```bash
docker-compose logs backend
```

### 4. Frontend không kết nối được Backend
Kiểm tra biến môi trường `NEXT_PUBLIC_API_URL` trong `.env`

### 5. Xóa tất cả và bắt đầu lại
```bash
# Dừng và xóa containers, networks, volumes
docker-compose down -v --remove-orphans

# Xóa images (tùy chọn)
docker rmi $(docker images -q qltime*)

# Rebuild và chạy lại
docker-compose up -d --build
```

## 📁 Cấu trúc Docker

```
WebsiteTimE/
├── docker-compose.yml          # Production setup
├── docker-compose.dev.yml      # Development setup
├── .env.example               # Environment variables template
├── mongo-init.js              # MongoDB initialization script
├── KTMNJS/
│   ├── Dockerfile             # Production frontend image
│   ├── Dockerfile.dev         # Development frontend image
│   └── .dockerignore
└── qltimebe/
    ├── Dockerfile             # Production backend image
    ├── Dockerfile.dev         # Development backend image
    └── .dockerignore
```

## 🔐 Bảo mật Production

Khi deploy production, hãy thay đổi:

1. **JWT_SECRET**: Tạo secret key mạnh
2. **MongoDB credentials**: Thay đổi username/password
3. **GEMINI_API_KEY**: Sử dụng API key thực tế
4. **Firewall**: Chỉ expose ports cần thiết

## 📈 Monitoring

### Xem resource usage
```bash
docker stats
```

### Backup MongoDB
```bash
# Backup
docker-compose exec mongodb mongodump --out /data/backup

# Restore
docker-compose exec mongodb mongorestore /data/backup
```

## 🆘 Hỗ trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra logs: `docker-compose logs`
2. Kiểm tra trạng thái containers: `docker-compose ps`
3. Kiểm tra file `.env`
4. Tạo issue trên GitHub repository
