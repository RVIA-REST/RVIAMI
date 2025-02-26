import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';
import { CommonModule } from '../common/common.module';
import { Language } from './entities';

@Module({
  controllers: [LanguagesController],
  providers: [LanguagesService],
  imports: [ 
    TypeOrmModule.forFeature([ Language ]),
    CommonModule,
  ],
  exports:[LanguagesService]
})
export class LanguagesModule {}
