import { v4 as uuidv4 } from 'uuid';

export const fileNameZip = ( req: Express.Request, file: Express.Multer.File, callback: Function ) => {

    if ( !file ) return callback(new Error('No se agrego archivo .zip o .7z'), false );

    const name = file.originalname.split('.');
    const ext = name.pop();
    const folderName = name.join('.').replace(/\s+/g, '-');
  
    const fileName = `${ uuidv4() }.${ folderName }.${ext}`; 

    callback(null, fileName );
}