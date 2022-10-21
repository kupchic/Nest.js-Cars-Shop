import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';

async function bootstrap(): Promise<any> {
  const PORT: string = process.env.PORT || '5000';
  const app: INestApplication = await NestFactory.create(AppModule);
  app.useGlobalGuards();
  app.enableCors();
  const config: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
    .setTitle('Cars Shop')
    .setDescription('The Cars Shop API description')
    .setVersion('1.0')
    .build();
  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(PORT, () =>
    console.log(`Server started on  port = ${PORT}`),
  );
}

bootstrap();
