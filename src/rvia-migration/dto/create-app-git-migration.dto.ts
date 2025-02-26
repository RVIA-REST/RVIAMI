import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, MinLength } from "class-validator";

export class CreateAppGitMigrationDto {

    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    @IsNotEmpty({ message: 'opc_lenguaje es obligatorio' })
    opc_lenguaje: number;
    
    @IsString()
    @MinLength(1)
    @IsNotEmpty({ message: 'url es obligatorio' })
    url: string;
}
