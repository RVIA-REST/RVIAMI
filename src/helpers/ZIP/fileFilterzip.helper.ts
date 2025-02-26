const validExtensions7z = ['application/octet-stream','application/x-compressed'];
const validExtensions = ['zip', 'x-zip-compressed', 'x-7z-compressed'];

export const fileFilterZip = ( req: Express.Request, file: Express.Multer.File, callback: Function ) => {

    if (!file) return callback(new Error('No se agrego archivo .zip o .7z'), false);

    const name = file.originalname.split('.');
    const ext = name[name.length - 1];

    if(file && ext === '7z' && validExtensions7z.includes(file.mimetype)){
        file.mimetype = 'application/x-7z-compressed';
    }

    const fileExtension = file.mimetype.split('/')[1];    
     
    if (validExtensions.includes(fileExtension)) {
        return callback(null, true);
    }

    callback(null, false);
}
