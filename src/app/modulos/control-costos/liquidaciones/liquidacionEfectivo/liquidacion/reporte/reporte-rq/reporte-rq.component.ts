import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { LiquidacionesService } from '../../../../liquidaciones.service';

export interface CabeceraModel {
  empresa: String;
  empDireccion: string;
  empRuc: string;
  campana: number;
  nombre_campana: string;
  tipoDoc: string;
  numero: string;
  nroRqNew: string;
  estadoRq: string;
  inicio: string;
  fin: string;
  cliente: string;
  estado_campana: string;
  directora_general: string;
  director_cuentas: string;
  ejecutivo: string;
  marca: string;
  dni: string;
  apellidos_nombres: string;
  banco: string;
  cuenta:string;
  usuario:string;
  imprime:string;
  totalLetras: string;
  total: number;
  fechaIni: string;
  fechaFin: string;
  moneda: string;
  fechaEnvio: string;

  //Comercial
  aprobadoEje: string;
  nombreEje: string;
  fechaEje: string;

  aprobadoCtas: string;
  nombreCtas: string;
  fechaCtas: string;

  aprobadoDir: string;
  nombreDir: string;
  fechaDir: string;

  //Adminsitrativo
  aprobadoPpto: string;
  nombrePpto: string;
  fechaPpto: string;

  aprobadoJefe: string;
  nombreJefe: string;
  fechaJefe: string;

  aprobadoAdm: string;
  nombreAdm: string;
  fechaAmd: string;

  aprobadoConta: string;
  nombreConta: string;
  fechaConta: string;
}

export interface DetalleModel {
  nro:number;
  documento:string;
  ciudad:string;
  partida:string;
  descripcion:string;
  abonar:string;
  banco:string;
  cuenta:string;
  total:number;
}

@Component({
  selector: 'app-reporte-rq',
  templateUrl: './reporte-rq.component.html',
  styleUrls: ['./reporte-rq.component.css']
})
export class ReporteRqComponent implements OnInit {
  url: string;
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual
  pNom: string;

  listaCabecera: CabeceraModel; // Prueba Para el reporte de cabecera
  listaDetalle: DetalleModel[] = []; // Prueba Para el reporte de detalle
  horaActual;

  @Input() pGastoCosto: any; // Variables que viene desde el padre
  @Input() nAsiento: any; // Numero del asiento

  @Output() reporteCargado = new EventEmitter(); // Evento para verificar que el reporte este cargado

  constructor(
    private vLiquidacionesService: LiquidacionesService,
    @Inject('BASE_URL') baseUrl: string,
  ) { this.url = baseUrl;}

  async ngOnInit(): Promise<void> {
    let user    = localStorage.getItem('currentUser');
    this.idEmp  = localStorage.getItem('Empresa');
    this.pPais  = localStorage.getItem('Pais');
    this.pNom   = JSON.parse(window.atob(user.split('.')[1])).uno;

    this.listaCabecera = {
      empresa: "",
      empDireccion: "",
      empRuc: '',
      campana: 0,
      nombre_campana: "",
      tipoDoc: "",
      numero: "",
      nroRqNew: "",
      estadoRq: "",
      inicio: "",
      fin: "",
      cliente: "",
      estado_campana: "",
      directora_general: "",
      director_cuentas: "",
      ejecutivo: "",
      marca: "",
      dni: "",
      apellidos_nombres: "",
      banco: "",
      cuenta: "",
      usuario: "",
      imprime: "",
      totalLetras: "",
      total: 0,
      fechaIni: "",
      fechaFin:  "",
      moneda: "",
      fechaEnvio: "",
      //Comercial
      aprobadoEje: "",
      nombreEje:  "",
      fechaEje: "",

      aprobadoCtas: "",
      nombreCtas: "",
      fechaCtas: "",

      aprobadoDir: "",
      nombreDir: "",
      fechaDir: "",

      //Adminsitrativo
      aprobadoPpto: "",
      nombrePpto: "",
      fechaPpto: "",

      aprobadoJefe: "",
      nombreJefe: "",
      fechaJefe: "",

      aprobadoAdm: "",
      nombreAdm: "",
      fechaAmd: "",

      aprobadoConta: "",
      nombreConta: "",
      fechaConta: "",
    }

    //debugger;
    //console.log(this.pGastoCosto);
    if(this.pGastoCosto != 0){
      this.fnDetalleRq(this.pGastoCosto);
    }

  }

  fnDetalleRq =  function(nGasto){

    var pParametro = []; //Parametros de campos vacios
    var pParametrodet = []
    pParametro.push(nGasto);
    pParametro.push(this.pPais);
    pParametro.push(this.idEmp);

    //console.log(pParametro)
    // this.spinner.show()
    this.vLiquidacionesService.fnLiquidaEfectivo(1, 2, pParametro, 5, 0, pParametrodet, this.url).subscribe(
        res => {
          // console.log(res);
          // console.log(res[0].sfechaEnvio);

            this.listaCabecera = {
              empresa: res[0].sRazonSocial,
              empDireccion: res[0].sDireccion,
              empRuc: res[0].sRuc,
              campana: res[0].sNumCentroCosto,
              nombre_campana: res[0].sCentroCosto,
              tipoDoc: res[0].sTipoDoc,
              numero: res[0].sNumero,
              nroRqNew: res[0].sNroRqNew,
              estadoRq: res[0].sEstadoRq,
              inicio: res[0].sFechaIniCC,
              fin: res[0].sFechaFinCC,
              cliente: res[0].sCliente,
              estado_campana: res[0].sEstadoCC,
              directora_general: res[0].sNombreDirectGen,
              director_cuentas: res[0].sNombreDirectCuentas,
              ejecutivo: res[0].sNombreEjecutivo,
              marca: res[0].sMarca,
              dni: res[0].sSolicitanteDocumento,
              apellidos_nombres: res[0].sSolicitanteNombreCompleto,
              banco: res[0].sBanco,
              cuenta: res[0].sCuenta,
              usuario: this.pNom,
              imprime: res[0].sImprime,
              totalLetras: res[0].sTotalLetras,
              total: res[0].nTotal,
              fechaIni: res[0].sFechaIni,
              fechaFin: res[0].sFechaFin,
              moneda: res[0].sMoneda,
              fechaEnvio: res[0].sFechaEnvio,
               //Comercial
              aprobadoEje: res[0].sAprobadoEje,
              nombreEje:  res[0].sNombreEje,
              fechaEje: res[0].sFechaEje,

              aprobadoCtas: res[0].sAprobadoCtas,
              nombreCtas: res[0].sNombreCtas,
              fechaCtas: res[0].sFechaCtas,

              aprobadoDir: res[0].sAprobadoDir,
              nombreDir: res[0].sNombreDir,
              fechaDir: res[0].sFechaDir,

              //Adminsitrativo
              aprobadoPpto: res[0].sAprobadoPpto,
              nombrePpto: res[0].sNombrePpto,
              fechaPpto: res[0].sFechaPpto,

              aprobadoJefe: res[0].sAprobadoJefe,
              nombreJefe: res[0].sNombreJefe,
              fechaJefe: res[0].sFechaJefe,

              aprobadoAdm: res[0].sAprobadoAdm,
              nombreAdm: res[0].sNombreAdm,
              fechaAmd: res[0].sFechaAmd,

              aprobadoConta: res[0].sAprobadoConta,
              nombreConta: res[0].sNombreConta,
              fechaConta: res[0].sFechaConta
            }

            //this.vFechaEnvio = fechaEje
            //Mostrado el detalle
            this.vLiquidacionesService.fnLiquidaEfectivo(1, 2, pParametro, 6, 0, pParametrodet, this.url).subscribe(
              res => {
                  this.listaDetalle = res;
                  this.reporteCargado.emit(true);
              },
              err => {
                  //this.spinner.hide();
                  console.log(err);
              },
              () => {
                  //this.spinner.hide();
              }
          );

            // this.spinner.hide()
        },
        err => {
            //this.spinner.hide();
            console.log(err);
        },
        () => {
            //this.spinner.hide();
        }
    );

  }
}
