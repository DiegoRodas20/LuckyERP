
export interface IExpanded {
    nIdAfpNet: number;
    nIdPerLab: number;
    nIdPersonal: number;
    nIdRegPen: number;
    sNombres: string;
    scodplla: string;
    sDescplla: string;
    sdescAFP?: string;
    sDescTipoDocumento: string;
    sDocumento: string;
    nMonto: number;
    dFechIni: string;
    dFechFin: string;
  }

  export interface ListaPersonal {
    nIdAfpNet: number;
    nIdRegPen: number;
    nMes: number;
    nEjercicio: number;
    nombreAFP: string;
    prima: number;
    seguro: number;
    comision: number;
    nroPersonas: number;
    sFileSustento: string;
  }