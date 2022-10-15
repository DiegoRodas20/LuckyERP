 
  export interface Reclutamiento {
    pCodPostulacion : number;
    pCodPostulante : number;
    pTipDoc : string;
    pNumDoc : string;
    pNom : string;
    pNumCelular : string;
    pCorreo : string;
    pPuesto : string;
    pNacionalidad : string;
    pDistrito : string;
    pFechaCita : string;
    pHoraCita : string;
    pTurno : string;
    pFuentePostu : string;
    pFuenteCont : string;
    pCitado : string;
    pContactado : string;
    pMedioContacto : string;
    pMotNoCita : string;
    pMotNoCont : string;
    pUltEstCont : string;
    pOpcional : string;
    pNumCelularOpc : string;
    pTextOpc : string;
    pPuestoCon	: string;
    pEvaluador	: string;
    pEstadoFidelizador	: string;
    pFirmo  : string;
    dFechaPostulacion: string;
  }
  export interface DetalleReclutamiento {
    pCodPostulacion : number;
    pPuesto : string;
    pContactado : string;
    dFechaPostulacion: string;
  }  
  export interface Combo{ 
    id : string ; 
    valor : string ;   
    checked : boolean;
  }

  export interface Resultado{ 
    cod : string ; 
    mensaje : string ;   
  }

  export interface DialogData {
    animal: string;
    name: string;
  }


  export interface Ficha { 
    lCarnetS :{ 
      ncod : number;
      nOp : string; 
    };
    lDatos:{
      pfecha : string;
      pNom : string;
      pFuentePostu : string;
      pNacionalidad : string;
      pNumCelular : string;
      pCorreo : string;
      pEstCiv : string;
      pnHijo : string;
      pcHijo : string;
      pTipDoc : string;
      pNumDoc : string;
      pGenero : string;
      pdia : number;
      pmes : number;
      panio : number;
      pdireccion : string;
      pDistrito : string;
      page : number;
      pPuesto  : string; 
      };
    lPuesto:{ 
      nEmpresa : string;
      nPuesto : string;
      nArea : string;
      nInicio : string;
      nFin : string;
      nSalario : string; 
    };
  }
    
  export interface Datos { 
    pfecha : string;
    pNom : string;
    pFuentePostu : string;
    pNacionalidad : string;
    pNumCelular : string;
    pCorreo : string;
    pEstCiv : string;
    pnHijo : string;
    pcHijo : string;
    pTipDoc : string;
    pNumDoc : string;
    pGenero : string;
    pdia : number;
    pmes : number;
    panio : number;
    pdireccion : string;
    pDistrito : string;
    page : number;
    pPuesto  : string; 
  }

  export interface Puesto { 
    nEmpresa : string;
    nPuesto : string;
    nArea : string;
    nInicio : string;
    nFin : string;
    nSalario : string; 
  }

  export interface Carnet { 
    ncod : number;
    nOp : string; 
  }


  export interface ValDocumento{
    pid_TipDoc : number;
    psDescDoc : string;
    prequerido : number;
    pvalidador : string;
    pextension : string;
    pnomfile : string;
    pextfile : string;
    nFileError :number;
    nIdPostulacion:number;
    bDocumentosValidos:boolean;
  }
 
  export interface EnviarFirmar{
    sUsuario:string;
    sDocumentosValidados:string;
    bEnviar:boolean;
    
  }