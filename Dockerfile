# Sử dụng image node chính thức làm base image
FROM node:16

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt các dependencies
RUN npm install

# Copy toàn bộ mã nguồn vào thư mục làm việc
COPY . .

# Mở cổng ứng dụng (ví dụ 3000)
EXPOSE 3000

# Lệnh khởi động ứng dụng
CMD ["npm", "start"]
