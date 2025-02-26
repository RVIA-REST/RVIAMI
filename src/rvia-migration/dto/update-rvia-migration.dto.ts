import { PartialType } from '@nestjs/mapped-types';
import { CreateAppMigrationDto } from './create-app-migration.dto';

export class UpdateRviaMigrationDto extends PartialType(CreateAppMigrationDto) {}
