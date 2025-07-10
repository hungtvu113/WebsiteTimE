#!/bin/bash

# Script quản lý Docker cho QLTime
# Sử dụng: ./docker-scripts.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_help() {
    echo -e "${BLUE}QLTime Docker Management Script${NC}"
    echo ""
    echo "Sử dụng: ./docker-scripts.sh [command]"
    echo ""
    echo "Commands:"
    echo "  setup       - Thiết lập ban đầu (tạo .env từ .env.example)"
    echo "  start       - Khởi động tất cả services (production)"
    echo "  start-dev   - Khởi động ở chế độ development"
    echo "  stop        - Dừng tất cả services"
    echo "  restart     - Khởi động lại tất cả services"
    echo "  logs        - Xem logs của tất cả services"
    echo "  logs-f      - Xem logs realtime"
    echo "  status      - Xem trạng thái containers"
    echo "  clean       - Dừng và xóa tất cả containers, volumes"
    echo "  rebuild     - Rebuild tất cả images"
    echo "  backup      - Backup MongoDB"
    echo "  restore     - Restore MongoDB từ backup"
    echo "  help        - Hiển thị help này"
}

setup() {
    echo -e "${YELLOW}Thiết lập QLTime Docker...${NC}"
    
    if [ ! -f .env ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Đã tạo file .env từ .env.example${NC}"
        echo -e "${YELLOW}⚠️  Vui lòng chỉnh sửa file .env và điền GEMINI_API_KEY${NC}"
    else
        echo -e "${YELLOW}File .env đã tồn tại${NC}"
    fi
    
    # Tạo thư mục uploads nếu chưa có
    mkdir -p qltimebe/uploads
    echo -e "${GREEN}✓ Đã tạo thư mục uploads${NC}"
}

start() {
    echo -e "${YELLOW}Khởi động QLTime (Production)...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✓ Đã khởi động tất cả services${NC}"
    echo -e "${BLUE}Frontend: http://localhost:3000${NC}"
    echo -e "${BLUE}Backend: http://localhost:3001${NC}"
    echo -e "${BLUE}API Docs: http://localhost:3001/api/docs${NC}"
}

start_dev() {
    echo -e "${YELLOW}Khởi động QLTime (Development)...${NC}"
    docker-compose -f docker-compose.dev.yml up -d
    echo -e "${GREEN}✓ Đã khởi động tất cả services (dev mode)${NC}"
    echo -e "${BLUE}Frontend: http://localhost:3000${NC}"
    echo -e "${BLUE}Backend: http://localhost:3001${NC}"
}

stop() {
    echo -e "${YELLOW}Dừng tất cả services...${NC}"
    docker-compose down
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    echo -e "${GREEN}✓ Đã dừng tất cả services${NC}"
}

restart() {
    echo -e "${YELLOW}Khởi động lại services...${NC}"
    stop
    start
}

logs() {
    docker-compose logs
}

logs_follow() {
    docker-compose logs -f
}

status() {
    echo -e "${BLUE}Trạng thái containers:${NC}"
    docker-compose ps
    echo ""
    echo -e "${BLUE}Resource usage:${NC}"
    docker stats --no-stream
}

clean() {
    echo -e "${RED}⚠️  Điều này sẽ xóa tất cả containers và dữ liệu!${NC}"
    read -p "Bạn có chắc chắn? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Xóa tất cả containers và volumes...${NC}"
        docker-compose down -v --remove-orphans
        docker-compose -f docker-compose.dev.yml down -v --remove-orphans 2>/dev/null || true
        echo -e "${GREEN}✓ Đã xóa tất cả${NC}"
    else
        echo -e "${YELLOW}Đã hủy${NC}"
    fi
}

rebuild() {
    echo -e "${YELLOW}Rebuild tất cả images...${NC}"
    docker-compose build --no-cache
    echo -e "${GREEN}✓ Đã rebuild tất cả images${NC}"
}

backup() {
    echo -e "${YELLOW}Backup MongoDB...${NC}"
    mkdir -p backups
    docker-compose exec -T mongodb mongodump --archive > "backups/qltime-backup-$(date +%Y%m%d-%H%M%S).archive"
    echo -e "${GREEN}✓ Backup hoàn thành${NC}"
}

restore() {
    echo -e "${YELLOW}Restore MongoDB...${NC}"
    echo "Các file backup có sẵn:"
    ls -la backups/*.archive 2>/dev/null || echo "Không có backup nào"
    read -p "Nhập tên file backup: " backup_file
    if [ -f "$backup_file" ]; then
        docker-compose exec -T mongodb mongorestore --archive < "$backup_file"
        echo -e "${GREEN}✓ Restore hoàn thành${NC}"
    else
        echo -e "${RED}File backup không tồn tại${NC}"
    fi
}

# Main script
case "$1" in
    setup)
        setup
        ;;
    start)
        start
        ;;
    start-dev)
        start_dev
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    logs-f)
        logs_follow
        ;;
    status)
        status
        ;;
    clean)
        clean
        ;;
    rebuild)
        rebuild
        ;;
    backup)
        backup
        ;;
    restore)
        restore
        ;;
    help|--help|-h)
        print_help
        ;;
    *)
        echo -e "${RED}Command không hợp lệ: $1${NC}"
        echo ""
        print_help
        exit 1
        ;;
esac
