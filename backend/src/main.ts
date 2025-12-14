import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  // HTTPS options for LAN testing (only when USE_HTTPS=true, ngrok handles HTTPS itself)
  const useHttps = process.env.USE_HTTPS === 'true';
  const httpsOptions = useHttps && fs.existsSync(path.join(__dirname, '..', 'certs', '152.168.1.34+2-key.pem'))
    ? {
      key: fs.readFileSync(path.join(__dirname, '..', 'certs', '152.168.1.34+2-key.pem')),
      cert: fs.readFileSync(path.join(__dirname, '..', 'certs', '152.168.1.34+2.pem')),
    }
    : undefined;

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  app.use(cookieParser());
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://localhost:3000',
        'https://127.0.0.1:3000',
        'https://152.168.1.34:3000', // LAN HTTPS
      ];
      // Allow ngrok domains
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.ngrok-free.app') || origin.endsWith('.ngrok.io')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all for development - be more restrictive in production
      }
    },
    credentials: true,
  });
  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
  }));

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Server running on ${httpsOptions ? 'https' : 'http'}://0.0.0.0:${port}`);
}
bootstrap();



