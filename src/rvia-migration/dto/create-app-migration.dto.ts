import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateAppMigrationDto {

    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    @IsNotEmpty({ message: 'opc_lenguaje es obligatorio' })
    opc_lenguaje: number;
}
