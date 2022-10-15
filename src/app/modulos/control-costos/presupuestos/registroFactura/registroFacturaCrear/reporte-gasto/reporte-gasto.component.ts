import { Component, Inject, Input, OnInit } from '@angular/core';
import { PresupuestosService } from '../../../presupuestos.service';

@Component({
  selector: 'app-reporte-gasto',
  templateUrl: './reporte-gasto.component.html',
  styleUrls: ['./reporte-gasto.component.css']
})
export class ReporteGastoComponent implements OnInit {

  url: string;
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual
  pNom: string;

  listaCabecera; // Prueba Para el reporte de cabecera
  listaDetalle = []; // Prueba Para el reporte de detalle

  @Input() variablesImpresion: any; // Variables que viene desde el padre

  constructor(
    @Inject('BASE_URL') baseUrl: string,
    private vPresupuestosService: PresupuestosService,
    ) {
    this.url = baseUrl;
   }

  ngOnInit(): void {
    let user    = localStorage.getItem('currentUser');
    this.idEmp  = localStorage.getItem('Empresa');
    this.pPais  = localStorage.getItem('Pais');
    this.pNom   = JSON.parse(window.atob(user.split('.')[1])).uno;

    this.listaCabecera = {
      empresa: "",
      empDireccion: "",
      empRuc: '',
      campana: '',
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
    if(this.variablesImpresion.nIdGastoCosto != 0){
      this.fnDetalleRq();
    }
  }

  fnDetalleRq (){

    var pParametro = []; //Parametros de campos vacios
    pParametro.push(this.variablesImpresion.nIdGastoCosto);
    pParametro.push(this.variablesImpresion.nIdCentroCosto);

    //console.log(pParametro)
    // this.spinner.show()
    this.vPresupuestosService.fnPresupuesto(4, 2, pParametro, 1, 0, this.url).subscribe(
        res => {
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
            this.vPresupuestosService.fnPresupuesto(4, 2, pParametro, 2, 0, this.url).subscribe(
              res => {
                  this.listaDetalle = res;

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
