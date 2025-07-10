import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // Sử dụng Fastify thay vì Express
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

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

  // Cấu hình global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('QLTime API')
    .setDescription('API cho ứng dụng quản lý thời gian QLTime')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Khởi động server
  const port = process.env.PORT || 3001;
  const host = '0.0.0.0';

  await app.listen(port, host);
  console.log(`Ứng dụng đang chạy tại: http://${host}:${port}`);
  console.log(`Swagger API docs: http://${host}:${port}/api/docs`);
}
bootstrap();
