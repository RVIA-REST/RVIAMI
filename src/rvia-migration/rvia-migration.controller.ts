import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFile, BadRequestException, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';
import * as fs from 'fs';

import { RviaMigrationService } from './rvia-migration.service';
import { CreateAppGitMigrationDto, CreateAppMigrationDto, StartProcessDto } from './dto';
import { fileFilterZip, fileNameZip,  } from '../helpers/ZIP';
import { ValidationInterceptor } from '../interceptors/validation-file/validation-file.interceptor';
import { envs } from '../config';
import { ApplicationsService } from '../applications/applications.service';

@Controller('rviami')
export class RviaMigrationController {
  constructor(
    private readonly rviaMigrationService: RviaMigrationService,
    private readonly appService: ApplicationsService
  ) {}

  @Post('new-app')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilterZip,
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = envs.projects_path;
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: fileNameZip
    })
  }),
  new ValidationInterceptor((dto: CreateAppMigrationDto) => {
    return true;
  }))
  createAppFiles(
    @Body() createMigrationDto: CreateAppMigrationDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if(!file) throw new BadRequestException('No se agrego archivo .zip o 7z');
    
    return this.rviaMigrationService.createAppFiles(createMigrationDto,file);
  }

  @Post('new-app-git')
  createAppGit( @Body() createAppGitMigrationDto: CreateAppGitMigrationDto ) {
    
    return this.rviaMigrationService.createAppGit(createAppGitMigrationDto);
  }

  @Get('7z/:idu_proyecto')
  async downloadProject(
    @Res() res: Response,
    @Param('idu_proyecto') idu_proyecto: number
  ) {
    await this.appService.getStaticFile7z(idu_proyecto, res);
  }

  @Post('start-process')
  async startProcess(@Body() startProcess: StartProcessDto) {
    return this.rviaMigrationService.startProcess(startProcess);
  }

  @Get()
  async getMigrationApps(){
    return await this.appService.getMigrationApps();
  }
}
