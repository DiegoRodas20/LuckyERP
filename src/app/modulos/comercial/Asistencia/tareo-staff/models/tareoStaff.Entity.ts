export class TareoStaff {
  idTareo: number;
  idPersonal: number;
  idCargo: number;
  nro: string;
  anio: number;
  mes: number;
  personal: string;
  descripcion: string;
  estado: string;
}

export class DetalleTareoStaff {
  nId: number;
  campania: string;
  nombreCampania: string;
  perfil: string;
  canal: string;
  porcentaje: number;
  diasEquivalente: number;
  idCC: number;
  idCanal: number;
  idCategoria: number;
  nImporte: number;
  nDiasMaxPer: number
}


export class PersonalTareo {
  nIdPersonal: number;
  sNombres: string;
  nIdCargo: number;
  nEleCod: number; //idMes
  cEleNam: string; //NombreMes  
}

export class ConsultaCampaniaTareo {

  nIdTareoStaff: number;
  nIdTareoStaffDt: number;
  nPorcentaje: number;
  nDiasPropor: number;
  nIdCentroCosto: number;
  nIdPerfil: number;
  nIdCanal: number;
  nDiasMaxPer: number;
  nSaldoDinero: number;
  sCodCC: string;
  sDescCC: string;
  sPerfil: string;
  sCanal: string;
}

// Select @v_nIdTareoStaff,	        
// 				   T.nIdCentroCosto ,
// 				  T.nIdPerfil ,
// 				  T.nIdCanal,
// 				  T.nSaldoDias,
// 				  T.nSaldoDinero,
// 				  T.nPorcentaje,
// 				  T.nDiasPropor,
// 				  T.nCostoEmpPropor		  
// 		 From #tmpDet_TareoStaff as T 


export class TmpDetalleTareo {

  nId: number;
  nIdCentroCosto: number;
  nIdPerfil: number;
  nIdCanal: number;
  nSaldoDias: number;
  nSaldoDinero: number;
  nPorcentaje: number;
  nDiasPropor: number;
  nCostoEmpPropor: number;
  mensaje:string;
  
}