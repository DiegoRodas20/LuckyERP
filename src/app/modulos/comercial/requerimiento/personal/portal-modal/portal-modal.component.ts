import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, } from "@angular/material/dialog";
import { PersonalService } from '../personal.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/shared/services/AppDateAdapter';
import Swal from "sweetalert2";
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-portal-modal',
  templateUrl: './portal-modal.component.html',
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ],
  styleUrls: ['./portal-modal.component.css']
})

export class PortalModalComponent implements OnInit {

  url: string;
  sPais: string;
  nIdUsuario: number;
  nIdEmpresa: number;
  nOpcionModal: number;
  nIdDetSucursal: number;

  nIdPuesto: number;
  sPuesto: string;

  nLugarTrabajo: number;
  sLugarTrabajo: string

  dFechaActual: any
  dFechaPub: any;
  sFechaPub: string;
  dFechaFinPub: any;
  sFechaFinPub: string;
  dFechaFinMin: any;

  sTipoPuesto: string;
  nTipoPuesto: number;

  nTiempoLaboral = new FormControl();
  fFechaPicker = new FormControl();
  sArea: string

  cGeoLocCod: string;

  listaTiempoLaboral = []
  listaRequisitos = []
  listaFunciones = []
  listaBeneficios = []


  constructor(
    public dialogRef: MatDialogRef<PortalModalComponent>,
    private fb: FormBuilder,
    private vPersonalService: PersonalService,
    private router: Router,
    private spinner: NgxSpinnerService,

    @Inject("BASE_URL") baseUrl: string,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.spinner.show()
    this.url = baseUrl;
  }

  ngOnInit(): void {
    this.sPais = localStorage.getItem("Pais");
    this.nIdEmpresa = parseInt(localStorage.getItem("Empresa"));
    const user = localStorage.getItem("currentUser");
    this.nIdUsuario = JSON.parse(window.atob(user.split(".")[1])).uid;

    this.fnListarTiempoLaboral();
    this.nIdPuesto = this.data.nIdPuesto;
    this.nIdDetSucursal = this.data.nIdDetSucursal;
    this.fnObtenerFechaActual();
    this.fnIniciarListado();
  }

  //#region Inicializacion
  async fnIniciarListado() {
    this.fnListarPuesto();
    this.fnListarRequisitos();
    this.fnListarFunciones();
    this.fnListarBeneficios();
    this.fnListarLugar();
  }
  //#endregion

  //#region Listar Tiempo Laboral
  async fnListarTiempoLaboral() {
    let pParametro = [];

    await this.vPersonalService.fnRequerimientoPersonal(15, pParametro, this.url).then((value: any) => {

      this.listaTiempoLaboral = value;

    }, error => {
      console.log(error);
    });
  }
  //#endregion

  //#region Listar Puesto
  async fnListarPuesto() {
    let pParametro = [];
    pParametro.push(this.nIdPuesto)

    await this.vPersonalService.fnRequerimientoPersonal(17, pParametro, this.url).then((value: any) => {

      this.sPuesto = value[0].sPuesto;
      this.sTipoPuesto = value[0].sTipoPuesto;
      this.sArea = value[0].sArea;

    }, error => {
      console.log(error);
    });
  }
  //#endregion

  //#region Listar Requisitos
  async fnListarRequisitos() {
    let pParametro = [];
    pParametro.push(this.nIdPuesto)

    await this.vPersonalService.fnRequerimientoPersonal(18, pParametro, this.url).then((value: any) => {

      this.listaRequisitos = value;

    }, error => {
      console.log(error);
    });
  }
  //#endregion

  //#region Listar Funciones
  async fnListarFunciones() {
    let pParametro = [];
    pParametro.push(this.nIdPuesto)

    await this.vPersonalService.fnRequerimientoPersonal(19, pParametro, this.url).then((value: any) => {

      this.listaFunciones = value;

    }, error => {
      console.log(error);
    });
  }
  //#endregion

  //#region Listar Beneficios
  async fnListarBeneficios() {
    let pParametro = [];
    pParametro.push(this.nIdPuesto)

    await this.vPersonalService.fnRequerimientoPersonal(20, pParametro, this.url).then((value: any) => {

      this.listaBeneficios = value;

    }, error => {
      console.log(error);
    });
  }
  //#endregion

  //#region Listar Lugar de Trabajo
  async fnListarLugar() {
    let pParametro = [];
    pParametro.push(this.nIdDetSucursal)
    pParametro.push(this.sPais);

    await this.vPersonalService.fnRequerimientoPersonal(21, pParametro, this.url).then((value: any) => {

      this.cGeoLocCod = value[0].cGeoLocCod;
      this.sLugarTrabajo = value[0].sLugarTrabajo;
      this.spinner.hide()
    }, error => {
      console.log(error);
    });
  }
  //#endregion

  //#region Fechas

  //#region Obtener Fecha Actual
  async fnObtenerFechaActual() {
    let sDatoFecha;

    const pParametro = [];
    pParametro.push(this.sPais);

    sDatoFecha = await this.vPersonalService.fnRequerimientoPersonal(16, pParametro, this.url)

    this.dFechaActual = sDatoFecha.datos;

    //Validar Fechas
    await this.fnValidarFechaActual();

  }
  //#endregion Obtener Fecha Actual

  //#region FechaActual
  fnValidarFechaActual() {
    let dDateNow, sCadenaFecha, sDia, sMes, sAnio
    dDateNow = new Date(this.dFechaActual)

    sCadenaFecha = this.dFechaActual.split('-', 3);

    sDia = parseInt(sCadenaFecha[2].substring(0, 2))
    sMes = sCadenaFecha[1]
    sAnio = sCadenaFecha[0]

    this.sFechaPub = sDia + '/' + sMes + '/' + sAnio

    this.dFechaFinMin = new Date();
  }
  //#endregion

  //#region Obtener Fecha Minima
  async fnObtenerFechaMinima() {
    
    let dFechaMinima
    dFechaMinima = new Date(this.sFechaPub)
   

    this.dFechaFinMin = new Date();
  }
  //#endregion


  //#region Cambiar Fecha Entrega
  async fnCambiarFechaPicker(event) {

    let sDia, sMes, sAnio, sFecha
    if (event.value.getDate() < 10) {
      sDia = "0" + event.value.getDate()
    } else {
      sDia = event.value.getDate()
    }
    if ((event.value.getMonth() + 1) < 10) {
      sMes = "0" + (event.value.getMonth() + 1)
    }
    else {
      sMes = event.value.getMonth() + 1
    }
    sAnio = event.value.getFullYear()
    this.dFechaFinPub = sAnio + '-' + sMes + '-' + sDia

  }
  //#endregion Cambiar Fecha Entrega

  //#endregion

  //#region Publicar
  async fnPublicar() {

    if (await this.fnValidarForm() != false) {

      let sTextoContinuar, sTextoGuardado;

      sTextoContinuar = '¿Desea publicar en el Portal?'
      sTextoGuardado = 'Se publicó correctamente.'

      var resp = await Swal.fire({
        title: sTextoContinuar,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar'
      })

      if (!resp.isConfirmed) {
        return;
      }

      const pParametro = [];

      pParametro.push(this.sPais);
      pParametro.push(this.nIdUsuario);
      pParametro.push(this.nIdPuesto);
      pParametro.push(this.dFechaFinPub);
      pParametro.push(this.cGeoLocCod);
      pParametro.push(this.nTiempoLaboral.value);
    
      this.vPersonalService.fnRequerimientoPersonal(22, pParametro, this.url).then((res: any) => {

        if (res.cod == 1) {
          Swal.fire({
            icon: 'success',
            title: res.mensaje,
            timer: 5000
          }).then(() => {
            this.fnCerrarModal();
          });
        }
        else {
          Swal.fire({
            icon: 'error',
            title: res.mensaje,
            timer: 4000
          });
        }

      }, error => {
        console.log(error);
      });
    }
  }
  //#endregion Publicar

  //#region Validar Formulario
  async fnValidarForm() {
    let bValidacion: boolean;
    if (this.dFechaFinPub == undefined) {
      Swal.fire({
        icon: 'error',
        title: 'Seleccione una fecha de Fin de Publicación',
        timer: 3000
      });
      bValidacion = false
    }
    else if (this.nTiempoLaboral.value == null) {
      Swal.fire({
        icon: 'error',
        title: 'Seleccione el Tiempo Laboral.',
        timer: 3000
      });
      bValidacion = false
    }
    else {
      bValidacion = true;
    }

    return bValidacion;
  }
  //#endregion

  fnIrReqBenFun() {
    this.fnCerrarModal();
    window.open('https://erp.lucky.com.pe/eyh/atracciontalento/datos-basicos/atc-matriz-puesto-rfb')
  }

  async fnCerrarModal() {
    this.dialogRef.close();
  }

}


export interface DialogData {
  nIdPuesto: number;
  nIdDetSucursal: number
}
