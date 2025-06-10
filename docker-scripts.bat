@echo off
REM Script quản lý Docker cho QLTime trên Windows
REM Sử dụng: docker-scripts.bat [command]

setlocal enabledelayedexpansion

if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="--help" goto help
if "%1"=="-h" goto help
if "%1"=="setup" goto setup
if "%1"=="start" goto start
if "%1"=="start-dev" goto start_dev
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="logs" goto logs
if "%1"=="logs-f" goto logs_follow
if "%1"=="status" goto status
if "%1"=="clean" goto clean
if "%1"=="rebuild" goto rebuild
if "%1"=="backup" goto backup
if "%1"=="restore" goto restore

echo Command không hợp lệ: %1
echo.
goto help

:help
echo QLTime Docker Management Script
echo.
echo Sử dụng: docker-scripts.bat [command]
echo.
echo Commands:
echo   setup       - Thiết lập ban đầu (tạo .env từ .env.example)
echo   start       - Khởi động tất cả services (production)
echo   start-dev   - Khởi động ở chế độ development
echo   stop        - Dừng tất cả services
echo   restart     - Khởi động lại tất cả services
echo   logs        - Xem logs của tất cả services
echo   logs-f      - Xem logs realtime
echo   status      - Xem trạng thái containers
echo   clean       - Dừng và xóa tất cả containers, volumes
echo   rebuild     - Rebuild tất cả images
echo   backup      - Backup MongoDB
echo   restore     - Restore MongoDB từ backup
echo   help        - Hiển thị help này
goto end

:setup
echo Thiết lập QLTime Docker...
if not exist .env (
    copy .env.example .env
    echo ✓ Đã tạo file .env từ .env.example
    echo ⚠️  Vui lòng chỉnh sửa file .env và điền GEMINI_API_KEY
) else (
    echo File .env đã tồn tại
)

REM Tạo thư mục uploads nếu chưa có
if not exist qltimebe\uploads mkdir qltimebe\uploads
echo ✓ Đã tạo thư mục uploads
goto end

:start
echo Khởi động QLTime (Production)...
docker-compose up -d
echo ✓ Đã khởi động tất cả services
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3001
echo API Docs: http://localhost:3001/api/docs
goto end

:start_dev
echo Khởi động QLTime (Development)...
docker-compose -f docker-compose.dev.yml up -d
echo ✓ Đã khởi động tất cả services (dev mode)
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3001
goto end

:stop
echo Dừng tất cả services...
docker-compose down
docker-compose -f docker-compose.dev.yml down 2>nul
echo ✓ Đã dừng tất cả services
goto end

:restart
echo Khởi động lại services...
call :stop
call :start
goto end

:logs
docker-compose logs
goto end

:logs_follow
docker-compose logs -f
goto end

:status
echo Trạng thái containers:
docker-compose ps
echo.
echo Resource usage:
docker stats --no-stream
goto end

:clean
echo ⚠️  Điều này sẽ xóa tất cả containers và dữ liệu!
set /p confirm="Bạn có chắc chắn? (y/N): "
if /i "%confirm%"=="y" (
    echo Xóa tất cả containers và volumes...
    docker-compose down -v --remove-orphans
    docker-compose -f docker-compose.dev.yml down -v --remove-orphans 2>nul
    echo ✓ Đã xóa tất cả
) else (
    echo Đã hủy
)
goto end

:rebuild
echo Rebuild tất cả images...
docker-compose build --no-cache
echo ✓ Đã rebuild tất cả images
goto end

:backup
echo Backup MongoDB...
if not exist backups mkdir backups
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "datestamp=%YYYY%%MM%%DD%-%HH%%Min%%Sec%"
docker-compose exec -T mongodb mongodump --archive > backups\qltime-backup-%datestamp%.archive
echo ✓ Backup hoàn thành
goto end

:restore
echo Restore MongoDB...
echo Các file backup có sẵn:
dir /b backups\*.archive 2>nul || echo Không có backup nào
set /p backup_file="Nhập tên file backup: "
if exist "%backup_file%" (
    docker-compose exec -T mongodb mongorestore --archive < "%backup_file%"
    echo ✓ Restore hoàn thành
) else (
    echo File backup không tồn tại
)
goto end

:end
endlocal
