import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { LiquidacionesService } from '../../../../liquidaciones.service';

@Component({
  selector: 'app-reporte-sm',
  templateUrl: './reporte-sm.component.html',
  styleUrls: ['./reporte-sm.component.css']
})
export class ReporteSmComponent implements OnInit {
  url: string;
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual
  pNom: string;

  cabecera: any;

  //#region TABLA DE PERSONAL
  displayedColumns: string[] = [
    "sDepositario",
    "nPasajeDia","nCantDia","nTotal",
    "bDia1","bDia2","bDia3","bDia4","bDia5","bDia6","bDia7","bDia8","bDia9","bDia10","bDia11","bDia12","bDia13",
    "bDia14","bDia15","bDia16",
  ];

  diasNombres: string[] = ["DO", "LU", "MA", "MI", "JU", "VI", "SA"];
  listaPersonal = [];
  dataSource = [];
  @Input() pGastoCosto: any; // Variables que viene desde el padre
  @Input() nAsiento: any; // Numero del asiento

  @Output() reporteCargado = new EventEmitter(); // Evento para verificar que el reporte este cargado

  constructor(private vLiquidacionesService: LiquidacionesService,
    @Inject('BASE_URL') baseUrl: string,)
    { this.url = baseUrl; }

  ngOnInit(): void {
    let user    = localStorage.getItem('currentUser');
    this.idEmp  = localStorage.getItem('Empresa');
    this.pPais  = localStorage.getItem('Pais');
    this.pNom   = JSON.parse(window.atob(user.split('.')[1])).uno;

    this.cabecera = {
      solicitante: "",
      ciudad: "",
      campania: "",
      fecha_del: "",
      fecha_al: "",
      cargo: "",
      partida: "",
      estado: ""

    }

    this.fnDetalleRq(this.pGastoCosto);
  }

  fnDetalleRq =  function(nGasto){

    var pParametro = []; //Parametros de campos vacios
    var pParametrodet = []
    pParametro.push(nGasto);

    // console.log(pParametro)
    this.vLiquidacionesService.fnLiquidaEfectivo(1, 2, pParametro, 7, 0, pParametrodet, this.url).subscribe(
        res => {
            //this.listaDetalle = res;
            //console.log(res)

            this.cabecera = {
              solicitante: res[0].sSolicitante,
              ciudad: '',
              campania: res[0].sCentroCosto,
              fecha_del: res[0].sFechaIni,
              fecha_al: res[0].sFechaFin,
              cargo: res[0].sCargo,
              partida: res[0].sPartida,
              total: res[0].nTotal,
              estado: res[0].sEstado,
              numero: ''

            }

            // console.log(this.cabecera)

            //Mostrado el detalle
            this.vLiquidacionesService.fnLiquidaEfectivo(1, 2, pParametro, 8, 0, pParametrodet, this.url).subscribe(
              res => {

                  this.listaPersonal = res;
                  this.dataSource  = res;
                  this.reporteCargado.emit(true);
                  //console.log(this.dataSource)
                  // this.spinner.hide()
              },
              err => {
                  //this.spinner.hide();
                  // console.log(err);
              },
              () => {
                  //this.spinner.hide();
              }
          );

            // this.spinner.hide()
        },
        err => {
            //this.spinner.hide();
            // console.log(err);
        },
        () => {
            //this.spinner.hide();
        }
    );

  }

  public redondearDinero(valor: number): number {
    var monto: number = valor;

    var decimal = monto - Math.floor(monto);
    //Si la parte decimal es < 0.5 entonces total a depositar sera el entero anterior
    if (decimal < 0.5) {
      monto = Math.floor(monto);
    }

    //Si la parte decimal es >0.49 entonces el total a depostiar será el entero anterior +0.5
    if (decimal > 0.49 && decimal < 0.99) {
      monto = Math.floor(monto) + 0.5;
    }

    return monto;
  }

  public totalDias(): number {
    var total: number = 0.0;
    this.dataSource.forEach((item) => {
      var dias: number = this.calcularNumeroDias(item);
      total = total + dias;
    });
    return total;
  }

  private calcularNumeroDias(item) {
    var numeroDiasSeleccionados = 0;
    if (item.dia1) numeroDiasSeleccionados++;
    if (item.dia2) numeroDiasSeleccionados++;
    if (item.dia3) numeroDiasSeleccionados++;
    if (item.dia4) numeroDiasSeleccionados++;
    if (item.dia5) numeroDiasSeleccionados++;
    if (item.dia6) numeroDiasSeleccionados++;
    if (item.dia7) numeroDiasSeleccionados++;
    if (item.dia8) numeroDiasSeleccionados++;
    if (item.dia9) numeroDiasSeleccionados++;
    if (item.dia10) numeroDiasSeleccionados++;
    if (item.dia11) numeroDiasSeleccionados++;
    if (item.dia12) numeroDiasSeleccionados++;
    if (item.dia13) numeroDiasSeleccionados++;
    if (item.dia14) numeroDiasSeleccionados++;
    if (item.dia15) numeroDiasSeleccionados++;
    if (item.dia16) numeroDiasSeleccionados++;
    item.dias = numeroDiasSeleccionados;
    return numeroDiasSeleccionados;
  }

  public nombreColumnas(nombre: string): string {
    //debugger;
    // console.log(this.displayedColumns);
    switch (nombre) {
      case "sDepositario":
        return "Nombres y Apellidos";
      case "nPasajeDia":
        return "Pasaje por Dia";
      case "nCantDia":
        return "Dias";
      case "bDia1":
        return this.nombreCamposDia("dia1");
      case "bDia2":
        return this.nombreCamposDia("dia2");
      case "bDia3":
        return this.nombreCamposDia("dia3");
      case "bDia4":
        return this.nombreCamposDia("dia4");
      case "bDia5":
        return this.nombreCamposDia("dia5");
      case "bDia6":
        return this.nombreCamposDia("dia6");
      case "bDia7":
        return this.nombreCamposDia("dia7");
      case "bDia8":
        return this.nombreCamposDia("dia8");
      case "bDia9":
        return this.nombreCamposDia("dia9");
      case "bDia10":
        return this.nombreCamposDia("dia10");
      case "bDia11":
        return this.nombreCamposDia("dia11");
      case "bDia12":
        return this.nombreCamposDia("dia12");
      case "bDia13":
        return this.nombreCamposDia("dia13");
      case "bDia14":
        return this.nombreCamposDia("dia14");
      case "bDia15":
        return this.nombreCamposDia("dia15");
      case "bDia16":
        return this.nombreCamposDia("dia16");
      case "nTotal":
        return "Total Depos.";
      default:
        return nombre;
    }

    //console.log(this.displayedColumns);
  }

  public nombreCamposDia(nombre: string): string {
    if (this.cabecera == null) {
      return "";
    }
    var fechaDiaMesAnio = this.cabecera.fecha_del.split("/");
    //console.log(this.cabecera.fecha_del)
    var numero_dia_columna = +nombre.substr(3);
    var dia_inicial = +fechaDiaMesAnio[0];

    if (dia_inicial > 15) {
      numero_dia_columna = numero_dia_columna + 15;
    }

    var fecha: Date = new Date(
      fechaDiaMesAnio[1] + " " + numero_dia_columna + " " + fechaDiaMesAnio[2]
    );
    var nombre_dia = this.diasNombres[fecha.getDay()];

    return nombre_dia + " " + numero_dia_columna;
  }

  ver =  function(element){
    // console.log(element)
  }
}
