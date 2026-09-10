import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN?.split(",") ?? "http://localhost:3001",
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000, "0.0.0.0");
  console.log(`API listening on http://0.0.0.0:${process.env.PORT || 3000}`);

  // Graceful shutdown
  const gracefulShutdown = () => {
    console.log('Shutting down gracefully...');
    app.close().then(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}
bootstrap();
