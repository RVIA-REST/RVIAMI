import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CommonService } from './common.service';

@Module({
  imports:[ ConfigModule.forRoot() ],
  controllers: [],
  providers: [ CommonService ],
  exports: [ CommonService ],
})
export class CommonModule {}