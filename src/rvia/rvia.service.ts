import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ErrorRVIA } from './helpers/errors-rvia';
import { Aplicacion } from '../applications/entities';
import { CommonService } from '../common/common.service';
import { RviaCoreProcess } from './interfaces';

const addon = require(process.env.RVIA_PATH);

@Injectable()
export class RviaService {

  private readonly logger = new Logger("CORE-Service");
  private readonly crviaEnvironment: number;

  constructor( 
    private readonly configService: ConfigService,
    private readonly encryptionService: CommonService,
  ) {
    this.crviaEnvironment = Number(this.configService.get('RVIA_ENVIRONMENT'));
  }

  async getVersion() {

    const obj = new addon.CRvia(this.crviaEnvironment);
    return await obj.getVersionAddons();
  }

  async applicationInitProcess(aplicacion: Aplicacion, core: any, conIA: number = 1): Promise<RviaCoreProcess> {
    let isValidProcess = true;
    let messageRVIA = '';

    //  -------------------------------- Parámetros de Entrada --------------------------------
    const lID = aplicacion.idu_proyecto;
    const lEmployee = aplicacion['user'].num_empleado;
    const ruta_proyecto = this.encryptionService.decrypt(aplicacion.sourcecode.nom_directorio);
    const tipo_proyecto = 3;
    const iConIA = conIA;
    // const Bd = 1 = Producion 2 = Desarrollo
  
    const bConDoc   = false;
    const bConCod   = false;
    const bConTest  = false;
    const bCalifica = false;

    const initProcessResult = await core.initProcess( lID, lEmployee, ruta_proyecto, tipo_proyecto, iConIA, bConDoc, bConCod, bConTest, bCalifica);
    const resultType = typeof initProcessResult;

    if (resultType === 'number') {
      this.logger.debug('Mensaje del RVIA (int):', initProcessResult);
    } else if (resultType === 'string') {
      this.logger.debug('Mensaje del RVIA (string):', initProcessResult);
    } else {
      this.logger.debug('Mensaje del RVIA (otro tipo):', initProcessResult);
    }

    if( initProcessResult == 1){
      messageRVIA = "Proceso IA Iniciado Correctamente";
    }else{
      isValidProcess = false;
      messageRVIA = ErrorRVIA[initProcessResult];
    }

    return { isValidProcess, messageRVIA };
  }

}
