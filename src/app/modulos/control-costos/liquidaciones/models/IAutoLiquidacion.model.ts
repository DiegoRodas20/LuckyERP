export namespace nsAutoLiquidacion {
    export interface I_anio {
        sYear: number; 
        lmes?:I_mes[];
    }

    export interface I_mes {
        nMes: string; 
        sMes: string; 
        lquincena?:I_quincena[];
    }

    export interface I_quincena {
        nQuincena: number; 
        sQuincena: string; 
    }

    export interface I_Opcion {
        nOpcion: number; 
        sOpcion: string; 
    }

    export interface I_Result {
        pOpcion: number; 
        pMensaje: string; 
    }
}
                                                                 
    
                            
