import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";
import { join } from "path";
import { createReadStream, existsSync } from "fs";

import { Aplicacion, Sourcecode } from "./entities";
import { CommonService } from "../common/common.service";
import { envs } from "../config";
import { MigrationApps } from "./interfaces";

@Injectable()
export class ApplicationsService {

    private readonly logger = new Logger('RVIAMI-service');
    private readonly downloadPath: string = envs.projects_path;
    
    constructor(
        @InjectRepository(Aplicacion)
        private readonly appRepository: Repository<Aplicacion>,
        @InjectRepository(Sourcecode)
        private readonly sourceCodeRepository: Repository<Sourcecode>,
        private readonly encryptionService: CommonService,
    ){  }
  

    async saveAppBD(opc_lenguaje: number, idu_proyecto: string, appName: string,nom_dir: string, idu_usuario: number): Promise<Aplicacion> {

        const sourcecode = this.sourceCodeRepository.create({
            nom_codigo_fuente: this.encryptionService.encrypt(appName),
            nom_directorio: this.encryptionService.encrypt(nom_dir),
        });
        
        try { 
            await this.sourceCodeRepository.save(sourcecode);

        }catch(error) {
            this.handleError(
                'saveAppBD',
                new InternalServerErrorException(`Error al guardar el código fuente: ${error.message}`) 
            );
        }

        const aplicacion = new Aplicacion();

        try {
            aplicacion.nom_aplicacion = this.encryptionService.encrypt(appName);
            aplicacion.idu_proyecto = idu_proyecto;
            aplicacion.num_accion = 3;
            aplicacion.opc_arquitectura = { "1": false, "2": false, "3": false, "4": false };
            aplicacion.opc_lenguaje = opc_lenguaje;
            aplicacion.opc_estatus_doc = 0;
            aplicacion.opc_estatus_doc_code = 0;
            aplicacion.opc_estatus_caso = 0;
            aplicacion.opc_estatus_calificar = 0;
            aplicacion.clv_estatus = 2;
            aplicacion.sourcecode = sourcecode;
            aplicacion.idu_usuario = idu_usuario;
            
            await this.appRepository.save(aplicacion);

        }catch(error) {
            this.handleError(
                'saveAppBD', 
                new InternalServerErrorException(`Error al guardar la aplicación: ${error.message}`)
            );
        } 

        return aplicacion;
    }

    
    async getStaticFile7z(idu_proyecto:number, response): Promise<void> {
        const application = await this.appRepository.findOne({
            where: { idu_proyecto: `${idu_proyecto}` },
        });

        if (!application) 
            throw new NotFoundException(`Aplicación con idu_proyecto ${idu_proyecto} no encontrada`);
    
        const decryptedAppName = this.encryptionService.decrypt(application.nom_aplicacion);
        const filePath = join(this.downloadPath, `${application.idu_proyecto}_${decryptedAppName}.7z`);
        
        if (!existsSync(filePath)) 
            throw new BadRequestException(`No se encontró el archivo ${application.idu_proyecto}_${decryptedAppName}.7z`);
    
        response.setHeader('Content-Type', 'application/x-7z-compressed');
        response.setHeader('Content-Disposition', `attachment; filename="${application.idu_proyecto}_${decryptedAppName}.7z"; filename*=UTF-8''${encodeURIComponent(application.idu_proyecto + '_' + decryptedAppName)}.7z`);

        const readStream = createReadStream(filePath);
        readStream.pipe(response);
    
        readStream.on('error', (err) => {
            throw new BadRequestException(`Error al leer el archivo: ${err.message}`);
        });
    }

    async getMigrationApps(): Promise<MigrationApps> {
        try {
            const apps = await this.appRepository.createQueryBuilder('application')
                .where("application.num_accion = :value", { value: 3 })
                .getMany();
            
            if(!apps) return { applications: [], total: 0 };

            const applications = apps.map( app => {
                app.nom_aplicacion = this.encryptionService.decrypt(app.nom_aplicacion);
                return app;
            })

            return { applications, total: applications.length };
            
        } catch (error) {
            this.handleError('getMigrationApps', error);
        }
    }

    async getApplicationById(idu_proyecto: string): Promise<Aplicacion> {
        let application = await this.appRepository.findOneBy({ idu_proyecto });

        if (!application)
          throw new NotFoundException(`Aplicación con idu_proyecto: ${idu_proyecto} no encontrada.`);

        return application;
    }

    private handleError(method:string, error: any): void {
    
        this.logger.error(`[rviami.${ method }]`,error);
        if (error.code === '23505') throw new BadRequestException(error.detail);
        if (error.response) throw new BadRequestException(error.message);
    
        this.logger.error(error);
        throw new InternalServerErrorException('Error en el servidor revisar logs.');
    }
}