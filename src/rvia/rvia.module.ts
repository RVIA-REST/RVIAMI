import { forwardRef, Module } from '@nestjs/common';
import { RviaService } from './rvia.service';
import { RviaController } from './rvia.controller';
import { CommonModule } from '../common/common.module';
import { RviaMigrationModule } from '../rvia-migration/rvia-migration.module';
import { ApplicationsModule } from 'src/applications/applications.module';

@Module({
  controllers: [ RviaController ],
  providers: [ RviaService ],
  imports:[
    ApplicationsModule,
    CommonModule,
    forwardRef(() => RviaMigrationModule),
  ],
  exports:[ RviaService ]
})
export class RviaModule {}
