export interface Sucursal {
    pId: string;
    pCod: string;
    pNombre: string; 
    pEstado:number; 
    pAction:number;
  }
//pruebaaaa
//testtest

  export interface PreCliente {
    pId?: string;
    pCod?: string;
    pNombre?: string;
    pEstado?:number;
  }

  export interface PreEquipo {
    pIdSuc?: string;
    pSucursal?: string;
    pId?: number;
    pCod?: string;
    pNombre?: string;
    pEstado?:number;
  }

  export interface PreSucEqui {
    pId?: string;
    pCod?: string;
    pNombre?: string;
    pEstado?:number;
    lPersonal?:PreEquipo[];
  }

  export interface ControlSucu {
    lSucursal?:PreCliente[];
  }
  export interface Resultado {
    value?:any[];
    dismiss?:any[];
  }

  export interface Presupuesto {
    pnIdCC?:string;
    pCodCC?:string;
    pDescCC?:string;
    pestado?:string;
    pidCanal?:string;
    pFecIni?:string;
    pFecFin?:string;
  }

  export interface PrePrincipal {
    pPartidaGen?: string;
    pPartidaEsp?: number;
    pParitdaMargen?:string;
    pTotal?: number;
    estado?:number; 
    lPersonal?:any;
    lsucursal?:any;
  }

  export interface ListaPartida {
    estado?: number;
    registro?:number; 
    pPartidaGen?: string;
    pPartidaEsp?: string;
    pParitdaMargen?: number; 
    pTotal?:number;
    psTotal?:string;
    lsucursal?:any;
    lPersonal:any;
    ptipo:number;
  }