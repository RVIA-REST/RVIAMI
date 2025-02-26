import { Type } from "class-transformer";
import { IsNumber } from "class-validator";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { Sourcecode } from "./sourcecode.entity";

@Entity('mae_aplicaciones')
export class Aplicacion {

    @PrimaryGeneratedColumn('identity')
    idu_aplicacion: number;

    @Column({ type: 'bigint' })
    idu_proyecto: string;

    @Column({type: 'varchar', length:255})
    nom_aplicacion: string;

    @Column()
    @IsNumber()
    @Type(() => Number)
    idu_usuario: number;

    @Column()
    @IsNumber()
    @Type(() => Number)
    num_accion: number;

    @Column({ type: 'jsonb', default: { "1": false, "2": false, "3": false, "4": false } })
    opc_arquitectura: Record<string, boolean>;

    @Column()
    @IsNumber()
    @Type(() => Number)
    clv_estatus: number;

    @Column()
    @IsNumber()
    @Type(() => Number)
    opc_lenguaje: number;

    @Column()
    @IsNumber()
    @Type(() => Number)
    opc_estatus_doc: number;

    @Column()
    @IsNumber()
    @Type(() => Number)
    opc_estatus_doc_code: number;

    @Column()
    @IsNumber()
    @Type(() => Number)
    opc_estatus_caso: number;

    @Column()
    @IsNumber()
    @Type(() => Number)
    opc_estatus_calificar: number;

    @ManyToOne(
        () => Sourcecode, sourcecode => sourcecode.application,
        { eager:true }
    )
    @JoinColumn({ name: 'idu_codigo_fuente' })
    sourcecode: Sourcecode
}