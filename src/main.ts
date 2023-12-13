import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { RolesGuard } from './common/guards/roles.guard';
import 'dotenv/config';

async function bootstrap(): Promise<any> {
  const PORT: string = process.env.PORT || '5000';
  const app: INestApplication = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalGuards(new RolesGuard(app.get(Reflector)));
  const config: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
    .setTitle('Cars Shop')
    .setDescription('The Cars Shop API description')
    .setVersion('1.0')
    .addBearerAuth({ type: 'apiKey', in: '1 hour' }, 'access_token')
    .addBearerAuth({ type: 'apiKey', in: '1 week' }, 'refresh_token')
    .addSecurityRequirements('bearer')
    .build();
  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(PORT, () =>
    console.log(`Server started on  port = ${PORT}`),
  );
}

bootstrap();
