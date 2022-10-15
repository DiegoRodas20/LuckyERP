import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { E_Reporte_Cabecera_Movilidad } from "../../../../models/reporte-cabecera-movilidad.model";
import { E_Reporte_Detalle_Movilidad, E_Reporte_Deta_Punto_Movilidad } from "../../../../models/reporte-detalle-movilidad-model";

@Component({
  selector: "app-reporte-carga-movilidad",
  templateUrl: "./reporte-carga-movilidad.component.html",
  styleUrls: ["./reporte-carga-movilidad.component.css"],
})
export class ReporteCargaMovilidadComponent implements OnChanges {
  idEmp: string;
  @Input() cabecera: E_Reporte_Cabecera_Movilidad;
  @Input() detaPunto: E_Reporte_Deta_Punto_Movilidad[];
  @Input() detalle: E_Reporte_Detalle_Movilidad[];

  /* #region   Asignación nombres de campos y columnas*/
  cols: any[] = [
    { header: 'EMP'       , field: 'sCodEmp'          , align: 'center' , porc: 5  },
    { header: 'NOTA'      , field: 'sNota'            , align: 'center' , porc: 15 },
    { header: 'GUÍA'      , field: 'sGuia'            , align: 'center' , porc: 15 },
    { header: 'HORA'      , field: 'sHora'            , align: 'center' , porc: 10 },
    { header: 'ALMACÉN'   , field: 'sCodAlmacen'      , align: 'left'   , porc: 10 },
    { header: 'DIRECCIÓN' , field: 'sDireccionDestino', align: 'left'   , porc: 45 }
  ];
  /* #endregion */

  constructor() {
    this.idEmp = localStorage.getItem("Empresa");
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.cabecera && this.cabecera){
      
      this.detaPunto = this.detaPunto.map((item) => {
        const auxLNotas = this.detalle.filter(x => x.nPunto == item.nPunto);
        return {
          ...item,
          nPeso: auxLNotas.reduce((acc, item) => acc + item.nPeso, 0),
          nVolumen: auxLNotas.reduce((acc, item) => acc + item.nVolumen, 0),
          lNotas: auxLNotas
        }
      });

      const nVolumenCargado = this.detaPunto.reduce((acc,item)=> acc + item.nVolumen,0);
      const nPesoCargado = this.detaPunto.reduce((acc,item)=> acc + item.nPeso,0);
      this.cabecera = {
        ...this.cabecera,
        nCantPunto: this.detaPunto.length,
        nVolumenCargado: nVolumenCargado,
        nVolumenRestante: this.cabecera.nVolumen - nVolumenCargado,
        nPesoCargado:  nPesoCargado,
        nPesoRestante: this.cabecera.nPeso - nPesoCargado
      }
    }
  }
}
