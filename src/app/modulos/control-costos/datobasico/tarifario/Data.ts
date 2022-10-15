export interface UserData {
  pIdTarifario : string;
  pIdEmpresa: string; 
  pRazonSocial: string;
  pIdCliente: string;
  pClienteDsc : string ; 
  pIdPartidaBase : string ;
  pCodPartida : string ;  
  pDesc : string ;
  pIdCategoria : string ; 
  pCategoriaDesc : string ;
  pIdCanal : string ; 
  pCanalDesc : string ; 
  pIdMoneda : string ; 
  pVersion : string ;
  pEsVigente : string ; 
  pVigente : string ; 
  pSueldoBase : string ; 
  pDiaBase : string ;
  pDiaSueldo : string ; 
  pTotalRemunera : string;
  pDiaTotaRemunera : string;
  pObservacion : string;
  pIdUsrRegistro : string;
  pUsrRegistro : string;
  pFechaRegistro : string;
  pIdUsrModifico : string;
  pUsrModifico : string;
  pFechaModifico : string;
  pIdEstado : string;
  pEstado: string;
  }

  export interface TarifaDetalles {
    pIdDetTarifario  : string;
    pIdTarifario : string;
    pIdPartida: string; 
    pCodPartida: string;
    pDesc : string ;
    pImpMes : string ; 
    pDiaBase : string ;
    pImpDia : string ;
  }


    // nIdDetTarifario	nIdTarifario	nIdPartida	sCodPartida	sDesc	nImpMes	nDiaBase	nImpDia