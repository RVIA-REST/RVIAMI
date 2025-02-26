import { RviaCoreProcess } from "../../rvia/interfaces";
import { Aplicacion } from "../../applications/entities";

export interface StartProcessCore {
    application: Aplicacion;
    rviaProcess: RviaCoreProcess
}