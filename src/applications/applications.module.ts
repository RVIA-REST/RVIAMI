import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationsService } from './applications.service';
import { Aplicacion, Sourcecode } from './entities';
import { CommonModule } from '../common/common.module';
import { LanguagesModule } from '../languages/languages.module';

@Module({
  providers: [ ApplicationsService ],
  exports: [ ApplicationsService ],
  imports: [
    TypeOrmModule.forFeature([ 
      Aplicacion, 
      Sourcecode,
    ]),
    CommonModule,
    LanguagesModule
  ]
})
export class ApplicationsModule {}
