# Sử dụng Node.js 18 Alpine image
FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài đặt dependencies
COPY package.json ./
RUN npm install

# Sao chép source code
COPY . .

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Build ứng dụng
RUN npm run build

# Expose port
EXPOSE 3000

# Tạo user non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Chuyển ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Khởi động ứng dụng
CMD ["npm", "start"]
