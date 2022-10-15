import { Component, Input } from "@angular/core";
import { E_Cabecera_Reporte_Ruta } from "../../../../models/reporte-cabecera-rutas.model";
import { E_Detalle_Reporte_Transportista } from "../../../../models/reporte-detalle-rutas.model";

@Component({
  selector: "app-reporte-ruta-transporte",
  templateUrl: "./reporte-ruta-transporte.component.html",
  styleUrls: ["./reporte-ruta-transporte.component.css"],
})
export class ReporteRutaTransporteComponent {
  idEmp: string;
  @Input() cabecera: E_Cabecera_Reporte_Ruta;
  @Input() detalle: E_Detalle_Reporte_Transportista[];

  /* #region   Asignación nombres de campos y columnas*/
  cols: any[] = [
    { header: 'N° PUNTO'        , field: 'nNumPuntos'       , type: null      , align: 'center' , porc: 4  },
    { header: 'OPERACIONES'     , field: 'sOperaciones'     , type: null      , align: 'center' , porc: 8  },
    { header: 'GUÍA REM'        , field: 'sGuia'            , type: null      , align: 'center' , porc: 8  },
    { header: 'DIRECCIÓN ORIGEN', field: 'sDireccionOrigen' , type: null      , align: 'left'   , porc: 8  },
    { header: 'DISTRITO ORIGEN' , field: 'sDistritoOrigen'  , type: null      , align: 'left'   , porc: 8  },
    { header: 'DESTINATARIO'    , field: 'sDestinatario'    , type: null      , align: 'left'   , porc: 13 },
    { header: 'PTO. LLEGADA'    , field: 'sPuntoLlegada'    , type: null      , align: 'left'   , porc: 10 },
    { header: 'TIENDA SUCURSAL' , field: 'sSucursalDestino' , type: null      , align: 'left'   , porc: 8  },
    { header: 'DISTRITO'        , field: 'sDistrito'        , type: null      , align: 'left'   , porc: 7  },
    { header: 'UND.'            , field: 'nUnidad'          , type: null      , align: 'right'  , porc: 3  },
    { header: 'VOL.'            , field: 'nVolumen'         , type: 'decimal6', align: 'right'  , porc: 7  },
    { header: 'PESO'            , field: 'nPeso'            , type: 'decimal2', align: 'right'  , porc: 5  },
    { header: 'SUPERVISOR'      , field: 'sSupervisor'      , type: null      , align: 'left'   , porc: 11 }
  ];
  /* #endregion */

  constructor() {
    this.idEmp = localStorage.getItem("Empresa");
    //const lst = this.cols.reduce((acc, num)=> acc.porc + num.porc,0)
  }
}
