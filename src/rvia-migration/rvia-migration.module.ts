import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RviaMigrationController } from './rvia-migration.controller';
import { RviaMigrationService } from './rvia-migration.service';
import { Aplicacion, Sourcecode } from '../applications/entities';
import { CommonModule } from '../common/common.module';
import { LanguagesModule } from '../languages/languages.module';
import { RviaModule } from '../rvia/rvia.module';
import { ApplicationsModule } from 'src/applications/applications.module';

@Module({
  controllers: [ RviaMigrationController ],
  providers: [ RviaMigrationService ],
  imports: [
    ApplicationsModule,
    CommonModule,
    LanguagesModule,
    forwardRef(() => RviaModule),
  ]
})
export class RviaMigrationModule {}
