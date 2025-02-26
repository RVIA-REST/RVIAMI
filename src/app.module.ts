import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { envs } from './config';
import { RviaMigrationModule } from './rvia-migration/rvia-migration.module';
import { RviaModule } from './rvia/rvia.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type:'postgres',
      host: envs.dbHost,
      port: envs.dbPort,
      database: envs.dbName,
      username: envs.dbUsername,
      password: envs.dbPassword,
      autoLoadEntities: true,
      synchronize:false
    }),
    RviaMigrationModule,
    RviaModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
