export interface ListaUsuario {
    nCodUser?: number;
    cUser?: string;
    nameUser?: string;
    email?: string;
    cPassword?: string;
    status_Mod?: string;
    cEleNam?: string;
    
    nIdPersonal?: number;
    nIdEmp?: number;
    
}

export interface ListaEmpresa {
  nIdEmp?: number;
  sCodEmp?: string;
  sRuc?: string;
  sRazonSocial?: string;
  sAbrev?: string;
  sIdPais?: number;
}

export interface ListaNivel {
  nIdNivel?: number;
  cUser?: string;
  sRazonSocial?: string;
  cEntNamFirst?: string;
  cEleNam?: string;
}

export interface ListaModulo {
  idMod?: number;
  nameMod?: string;
  url_mod?: string;
  DadMod?: number;
  DadNameMod?: string;
  typeMod?: number;
  cEleNam?: string;
  asignado?:boolean;
  status_Mod?: number;
}

export interface ComboPais {
  sIdPais?: string;
  cEntNamFirst?: string;
}

export interface ComboEmpresa {
  nIdEmp?: string;
  sCodEmp?: string;
  sRazonSocial?: string;
}

export interface ComboUsuEmp {
  nIdEmpUser?: number;
  sRazonSocial?: string;
  cEntNamFirst?: string;
}

export interface ComboSysEle {
  nEleCod?: number;
  cEleNam?: string;
}

export class UsuarioEmpresa {
  nIdEmpUser?: number;
  nCodUser?: number;
  nIdEmp?: number;
  nIdEstado?:number;
}


