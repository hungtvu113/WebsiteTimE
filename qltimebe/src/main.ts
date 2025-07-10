import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  try {
    console.log('Đang khởi động ứng dụng...');

<<<<<<< HEAD
  // Cấu hình CORS
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://your-frontend-domain.com'] // Thay thế bằng domain frontend thực tế
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
=======
    // Sử dụng Fastify thay vì Express
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter(),
    );
>>>>>>> a002e90100a3dbec44fc76fa0094c7459ea32db1

    console.log('Đã tạo ứng dụng NestJS');

    // Cấu hình CORS
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://frontend:3000', // Cho phép từ Docker container
        process.env.FRONTEND_URL || 'http://localhost:3000'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });

<<<<<<< HEAD
  // Khởi động server
  const port = process.env.PORT || 3001;
  const host = '0.0.0.0';

  await app.listen(port, host);
  console.log(`Ứng dụng đang chạy tại: http://${host}:${port}`);
  console.log(`Swagger API docs: http://${host}:${port}/api/docs`);
=======
    console.log('Đã cấu hình CORS');

    // Cấu hình global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }));

    console.log('Đã cấu hình validation pipe');

    // Cấu hình Swagger
    const config = new DocumentBuilder()
      .setTitle('QLTime API')
      .setDescription('API cho ứng dụng quản lý thời gian QLTime')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    console.log('Đã cấu hình Swagger');

    // Khởi động server
    const port = process.env.PORT || 3001;
    console.log(`Đang khởi động server trên port ${port}...`);

    await app.listen(port, '0.0.0.0');
    console.log(`Ứng dụng đang chạy tại: ${await app.getUrl()}`);
  } catch (error) {
    console.error('Lỗi khi khởi động ứng dụng:', error);
    process.exit(1);
  }
>>>>>>> a002e90100a3dbec44fc76fa0094c7459ea32db1
}
bootstrap();
