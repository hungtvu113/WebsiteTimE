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
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Cho phép frontend từ port 3000
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
  await app.listen(port, '0.0.0.0');
  console.log(`Ứng dụng đang chạy tại: ${await app.getUrl()}`);
}
bootstrap();
