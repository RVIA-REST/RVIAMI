import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException, UnsupportedMediaTypeException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { join } from 'path';
import * as fsExtra from 'fs-extra';
import * as seven from '7zip-min';
import * as unzipper from 'unzipper'

import { CreateAppGitMigrationDto, CreateAppMigrationDto, StartProcessDto } from './dto';
import { CommonService } from '../common/common.service';
import { envs } from '../config';
import { LanguagesService } from '../languages/languages.service';
import { RviaService } from '../rvia/rvia.service';
import { ApplicationsService } from '../applications/applications.service';
import { StartProcessCore } from './interfaces/startProcessCore.interface';

const addon = require(process.env.RVIA_PATH);

@Injectable()
export class RviaMigrationService {

  private readonly logger = new Logger('RVIAMI-service');
  private readonly crviaEnvironment: number;

  constructor(
    private readonly appService: ApplicationsService, 
    private readonly languageService: LanguagesService,
    private readonly encryptionService: CommonService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => RviaService))
    private readonly rviaService: RviaService
  ){
    this.crviaEnvironment = Number(this.configService.get('RVIA_ENVIRONMENT'));
  }
  
  async createAppFiles({ opc_lenguaje }: CreateAppMigrationDto, zipFile: Express.Multer.File): Promise<StartProcessCore> {

    const obj = new addon.CRvia( this.crviaEnvironment );
    const idu_proyecto = obj.createIDProject();
    const dirName = envs.projects_path;

    let lenguaje = await this.languageService.findOne( opc_lenguaje );  
    if( !lenguaje ){
      this.handleError(
        'saveAppBD', 
        new NotFoundException('Lenguaje no encontrado')
      )
    }

    const appName = zipFile.originalname;
    const fileParts = appName.split('.');
    const fileExtension = fileParts.pop();
    const newAppName = fileParts.join('.').replace(/\s+/g, '-');   
    const appNameWIdu = idu_proyecto + '_' + newAppName ;

    const oldPath = `${dirName}/${zipFile.filename}`; 
    const newPath = `${dirName}/${idu_proyecto}_${appName}`;
    
    try {
      await fsExtra.rename(oldPath, newPath);
    } catch (error) {
      this.handleError(
        'create', 
        new InternalServerErrorException(`Error al renombrar el archivo: ${error.message}`)
      )
    }

    const extractPath = join(dirName, appNameWIdu);
    await fsExtra.mkdirp(extractPath);
    const fileType = zipFile.mimetype;

    try {
      if (fileType === 'application/zip' || fileType === 'application/x-zip-compressed') {
        await fsExtra.createReadStream(newPath)
          .pipe(unzipper.Extract({ path: extractPath }))
          .promise()
          .then(() => {})
          .catch(error => {
            this.handleError(
              'create', 
              new InternalServerErrorException(`Error al descomprimir el archivo .zip: ${error.message}`)
            )
          });
      } else if (fileType === 'application/x-7z-compressed') {
        await new Promise<void>((resolve, reject) => {
          seven.unpack(newPath, extractPath, error => {
            if (error) {
              reject(
                this.handleError(
                  'create', 
                  new InternalServerErrorException(`Error al descomprimir el archivo .7z: ${error.message}`)
                )
              );
            }
            resolve();
          });
        });
      } else {
        this.handleError(
          'create', 
          new UnsupportedMediaTypeException('Formato de archivo no soportado')
        );
      }
    } catch (error) {
      this.handleError(
        'create', 
        new InternalServerErrorException(`Error al descomprimir el archivo: ${error.message}`)
      );
    }

    // TODO - Implementar el usuario
    const user = { idu_usuario: 1, num_empleado: 90000010 };

    // TODO - Registro de la aplicación en la base de datos
    let application = await this.appService.saveAppBD(opc_lenguaje, idu_proyecto, newAppName, extractPath, user.idu_usuario);
    application['user'] = user;

    // TODO - Llamado al CORE para iniciar proceso
    const rviaProcess = await this.rviaService.applicationInitProcess(application, obj);    
    application.nom_aplicacion = this.encryptionService.decrypt(application.nom_aplicacion);
    
    return { application, rviaProcess };
  }

  async startProcess(startProcess: StartProcessDto): Promise<StartProcessCore> {
  
    const { idu_proyecto, conIA } = startProcess;
    const core = new addon.CRvia(this.crviaEnvironment);
    
    let application = await this.appService.getApplicationById( `${idu_proyecto}` );

    // TODO Obtener el usuario
    const user = { idu_usuario: 1, num_empleado: 90000010 };  
    application['user'] = user;

    const rviaProcess = await this.rviaService.applicationInitProcess(application, core, conIA);
    application.nom_aplicacion = this.encryptionService.decrypt(application.nom_aplicacion);

    return { application, rviaProcess };
  }

  async createAppGit({ url, opc_lenguaje}: CreateAppGitMigrationDto){
    return 'Aqui estara la logica para crear una aplicacion desde un repositorio git';
  }

  private handleError(method:string, error: any): void {

    this.logger.error(`[rviami.${ method }]`,error);
    if (error.code === '23505') throw new BadRequestException(error.detail);
    if (error.response) throw new BadRequestException(error.message);

    this.logger.error(error);
    throw new InternalServerErrorException('Error en el servidor revisar logs.');
  }
}
