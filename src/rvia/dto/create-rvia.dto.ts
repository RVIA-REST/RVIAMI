import { Transform } from "class-transformer";
import { IsIn, IsNotEmpty, IsNumber } from "class-validator";

export class CreateRviaDto {

    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    @IsNotEmpty({ message: 'idu_proyecto es obligatorio' })
    idu_proyecto: number;

    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    @IsIn([1,2], {
        message: 'Valor inválido para conIA',
    })
    conIA: number;
}
