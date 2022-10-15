import { Component, OnInit, Injectable, Inject, ElementRef, ViewChild } from '@angular/core';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Combo, Reclutamiento, DialogData } from '../../../Model/IATC';
import { SergeneralService } from "./../../../../../../shared/services/sergeneral.service";
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { SerfidelizacionService } from './../serfidelizacion.service';


import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../../../../shared/services/AppDateAdapter';
import * as moment from 'moment';
@Component({
  selector: 'app-fid-enviar',
  templateUrl: './fid-enviar.component.html',
  styleUrls: ['./fid-enviar.component.css'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ],
})
export class FidEnviarComponent implements OnInit {
  url: string;
  pais: string;
  Empresa: string;
  id: number;

  idFide: number;
  Estado: string;
  sCodRQ: string;
  nPersonasEnviar: number;
  nVacantes:number;
  nVacantesEnviadas: number;

  Valor = [];
  lListaEnviar = [];
  lListaSupervisor: any;
  lListaFide: any;

  Enviar: boolean = false;

  PrimeraFormGroup: FormGroup;


  sltMotivo: any;
  sltContrato: any;

  sltSupervisor: any;
  sltController: any;

  constructor(
    public dialogRef: MatDialogRef<FidEnviarComponent>,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private vSerFidelizacion: SerfidelizacionService,
    @Inject("BASE_URL") baseUrl: string,
    private vSerGeneral: SergeneralService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.url = baseUrl;
  }


  ngOnInit(): void {

    this.pais = localStorage.getItem('Pais');
    this.Empresa = localStorage.getItem('Empresa');
    const user = localStorage.getItem('currentUser');
    this.id = JSON.parse(window.atob(user.split('.')[1])).uid;

    let arrayFide = [];

    let listaData = this.data;

    this.lListaEnviar = this.data;

    this.nPersonasEnviar = this.data.length;

    let Lu = false;
    let Ma = false;
    let Mi = false;
    let Ju = false;
    let Vi = false;
    let Sa = false;
    let Do = false;

    this.sCodRQ = listaData[0].sCodRQ;
    this.Estado = listaData[0].Estado;


    this.idFide = listaData[0].nIdFide;


    for (let i = 0; i < this.lListaEnviar.length; i++) {
      arrayFide.push(this.lListaEnviar[i].nIdFide)
    }

    this.lListaFide = arrayFide.join('/')



    this.fnGetdatos(1760);
    this.fnGetdatos(1708);

    this.PrimeraFormGroup = this.formBuilder.group({
      idRQ: [''],
      NroRQ: [this.sCodRQ, Validators.required],
      Estado: [''],
      Fecha: [''],
      Ciudad: [''],
      Presupuesto: [''],
      Cargo: [''],
      Motivo: ['', Validators.required],
      FecIni: ['', Validators.required],
      LunesChk: [Lu],
      MartesChk: [Ma],
      MiercolesChk: [Mi],
      JuevesChk: [Ju],
      ViernesChk: [Vi],
      SabadoChk: [Sa],
      DomingoChk: [Do],
      Observacion: [],
      Supervisor: ['', Validators.required],
      Controller: [''],
      Contrato: ['', Validators.required],
      Neto: []
    });

    this.onRq();

  }


  //#region validador de fecha
  convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;
  }
  //#endregion

  fnGetdatos = function (dad) {
    //console.log(dad)
    this.vSerGeneral
      .fnSystemElements(1, dad, "1", "nElecod,cElenam", "", this.url)
      .subscribe(
        (res) => {
          if (dad == 1760) {
            this.sltMotivo = res;
          } else if (dad == 1708) {
            this.sltContrato = res;

          }

          //console.log(res);
        },
        (err) => {
          console.log(err);
        },
        () => {
          //  this.spinner.hide();
        }
      );
  };

  async onRq() {
    let pParametro = [];
    let vPri = this.PrimeraFormGroup.value;
    pParametro.push(this.pais);
    pParametro.push(this.Empresa);
    pParametro.push(vPri.NroRQ);
    pParametro.push(this.nPersonasEnviar);


    let val: string;

    this.spinner.show();
    await this.vSerFidelizacion.fnReclutamiento(14, pParametro, this.url).then((value: any) => {


      val = value.cod;

      if (value.cod === '0') {
        this.spinner.hide();
        this.PrimeraFormGroup.controls.idRQ.setValue('');
        return Swal.fire({
          icon: 'error',
          title: 'Error',
          text: value.mensaje
        }).then(() => {
          this.onNoClick();
        });

      }
      else {
        this.PrimeraFormGroup.controls.idRQ.setValue(value.cod);
      }

    }, error => {
      console.log(error);
      this.spinner.hide();
    });

    if (val != "0") {
      await this.vSerFidelizacion.fnReclutamiento(18, pParametro, this.url).then((value: any) => {
        this.fnLLenar(0, value)
      }, error => {
        console.log(error);
      });
      this.spinner.hide();
    }
  }

  async fnGetEnviado() {
    let pParametro = [];
    pParametro.push(this.pais);
    pParametro.push(this.idFide);

    this.spinner.show();
    await this.vSerFidelizacion.fnReclutamiento(15, pParametro, this.url).then((value: any) => {

      this.fnLLenar(1, value)
    }, error => {
      console.log(error);
    });
    this.spinner.hide();
  }

  fnLLenar(op, Ob) {

    let sup = [];
    let conr = [];
    let Lu = false;
    let Ma = false;
    let Mi = false;
    let Ju = false;
    let Vi = false;
    let Sa = false;
    let Do = false;

    let Dias = Ob.sDias.split(',');

    for (let index = 0; index < Dias.length; index++) {
      let d = Dias[index];

      if (d === '1826') Lu = true;
      if (d === '1827') Ma = true;
      if (d === '1828') Mi = true;
      if (d === '1829') Ju = true;
      if (d === '1830') Vi = true;
      if (d === '1831') Sa = true;
      if (d === '1832') Do = true;

    }

    this.PrimeraFormGroup.controls.Estado.setValue(Ob.sRQEstado);
    this.PrimeraFormGroup.controls.Fecha.setValue(Ob.sFecha);
    this.PrimeraFormGroup.controls.Ciudad.setValue(Ob.sCiudad);
    this.PrimeraFormGroup.controls.Presupuesto.setValue(Ob.sDescCC);
    this.PrimeraFormGroup.controls.Cargo.setValue(Ob.sDesPartida);
    this.PrimeraFormGroup.controls.Motivo.setValue(Ob.nIdMotivo.toString());
    if (op === 1) {
      let fei = this.convertUTCDateToLocalDate(new Date(Ob.dFechaInicio));
      this.PrimeraFormGroup.controls.FecIni.setValue(fei);
      this.PrimeraFormGroup.controls.NroRQ.setValue(Ob.sCodRQ);
      this.PrimeraFormGroup.controls.idRQ.setValue(Ob.nIdReqPe);
    }
    if (op === 0) this.PrimeraFormGroup.controls.FecIni.setValue(Ob.dFechaInicio);
    this.PrimeraFormGroup.controls.LunesChk.setValue(Lu);
    this.PrimeraFormGroup.controls.MartesChk.setValue(Ma);
    this.PrimeraFormGroup.controls.MiercolesChk.setValue(Mi);
    this.PrimeraFormGroup.controls.JuevesChk.setValue(Ju);
    this.PrimeraFormGroup.controls.ViernesChk.setValue(Vi);
    this.PrimeraFormGroup.controls.SabadoChk.setValue(Sa);
    this.PrimeraFormGroup.controls.DomingoChk.setValue(Do);
    this.PrimeraFormGroup.controls.Observacion.setValue(Ob.sObservacion);
    this.PrimeraFormGroup.controls.Supervisor.setValue(Ob.nSupervisor.toString());
    this.PrimeraFormGroup.controls.Controller.setValue(Ob.nController.toString());
    this.PrimeraFormGroup.controls.Contrato.setValue(Ob.nTipoContrato.toString());
    this.PrimeraFormGroup.controls.Neto.setValue(Ob.dNeto);

    let datos: any[] = Ob.list_Datos;

    datos.forEach(element => {
      if (element.codCargo === '030') {
        sup.push(element)
      }
      else {
        conr.push(element)
      }
    });

    this.sltSupervisor = sup;
    this.sltController = conr;

    if (this.PrimeraFormGroup.get("Supervisor").value == null || this.PrimeraFormGroup.get("Supervisor").value == '') {
      if (this.sltSupervisor.length > 0) {
        this.PrimeraFormGroup.controls.Supervisor.setValue(this.sltSupervisor[0].id);
      }
    }

    //console.log(this.PrimeraFormGroup)

    //Obtener Supervisor
    //this.fnGetSupervisor();

  }

  async onEnviar() {
    let Primera = this.PrimeraFormGroup.value;
    let pParametro = [];
    let dias: string = '';
    if (this.PrimeraFormGroup.invalid) {
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar datos'
      });
    }

    if (Primera.LunesChk === true) {
      dias += '1826,'
    }
    if (Primera.MartesChk === true) {
      dias += '1827,'
    }
    if (Primera.MiercolesChk === true) {
      dias += '1828,'
    }
    if (Primera.JuevesChk === true) {
      dias += '1829,'
    }
    if (Primera.ViernesChk === true) {
      dias += '1830,'
    } if (Primera.SabadoChk === true) {
      dias += '1831,'
    } if (Primera.DomingoChk === true) {
      dias += '1832,'
    }

    pParametro.push(this.id);
    pParametro.push(this.pais);
    pParametro.push(Primera.Motivo);
    pParametro.push(Primera.FecIni);
    pParametro.push(dias);
    pParametro.push(Primera.Observacion);
    pParametro.push('');
    pParametro.push(Primera.Supervisor);
    pParametro.push(Primera.Controller);
    pParametro.push(Primera.Contrato);
    pParametro.push(Primera.Neto);
    pParametro.push(Primera.idRQ);
    pParametro.push(this.lListaFide);


    this.spinner.show();
    await this.vSerFidelizacion.fnReclutamiento(25, pParametro, this.url).then((value: any) => {
      Swal.fire({
        title: value.mensaje,
        confirmButtonText: `Ok`,
      });
      this.Valor.push('Si')
      this.Valor.push(Primera.NroRQ)
      this.fnGetVacantesEnviadas(Primera.idRQ);

      this.Enviar = true;
    }, error => {
      console.log(error);
    });

    this.spinner.hide();

  }


  async onGuardar() {
    let Primera = this.PrimeraFormGroup.value;
    let pParametro = [];
    let dias: string = '';
    if (this.PrimeraFormGroup.invalid) {
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar datos'
      });
    }

    if (Primera.LunesChk === true) {
      dias += '1826,'
    }
    if (Primera.MartesChk === true) {
      dias += '1827,'
    }
    if (Primera.MiercolesChk === true) {
      dias += '1828,'
    }
    if (Primera.JuevesChk === true) {
      dias += '1829,'
    }
    if (Primera.ViernesChk === true) {
      dias += '1830,'
    } if (Primera.SabadoChk === true) {
      dias += '1831,'
    } if (Primera.DomingoChk === true) {
      dias += '1832,'
    }

    pParametro.push(this.idFide);
    pParametro.push(this.id);
    pParametro.push(this.pais);
    pParametro.push(Primera.Motivo);
    pParametro.push(moment(Primera.FecIni, 'MM-DD-YYYY HH:mm:ss', true).format("YYYY-MM-DD"));
    pParametro.push(dias);
    pParametro.push(Primera.Observacion);
    pParametro.push('');
    pParametro.push(Primera.Supervisor);
    pParametro.push(Primera.Controller);
    pParametro.push(Primera.Contrato);
    pParametro.push(Primera.Neto);
    pParametro.push(Primera.idRQ);


    this.spinner.show();
    await this.vSerFidelizacion.fnReclutamiento(16, pParametro, this.url).then((value: any) => {
      Swal.fire({
        title: value.mensaje,
        confirmButtonText: `Ok`,
      });
      this.Valor.push('Si');
      this.Valor.push(Primera.NroRQ);
      this.fnGetVacantesEnviadas(Primera.idRQ);

      this.Enviar = true;
    }, error => {
      console.log(error);
    });

    this.spinner.hide();


  }

  //#region Obtener Supervisores
  async fnGetSupervisor() {

    let pParametro = [];
    pParametro.push(this.sCodRQ);

    await this.vSerFidelizacion.fnReclutamiento(26, pParametro, this.url).then((value: any) => {

      this.lListaSupervisor = value;

    }, error => {
      console.log(error);
    });

  }
  //#endregion

  //#region Obtener Vacantes Despues de Enviar
  async fnGetVacantesEnviadas(nIdRQ) {

    let pParametro = [];
    pParametro.push(nIdRQ);

    await this.vSerFidelizacion.fnReclutamiento(28, pParametro, this.url)
      .then((value: any) => {

        this.nVacantes = value[0].nVacantes;
        this.nVacantesEnviadas = value[0].nVacantesEnviadas;

        if (this.nVacantesEnviadas <= 0) {
          this.fnActualizarRQ(nIdRQ);
        }
        else {
          this.onNoClick();
        }

      }, error => {
        console.log(error);
      });

  }
  //#endregion

  //#region Obtener Vacantes Despues de Enviar
  async fnActualizarRQ(nIdRQ) {

    let nTotalVacantes = this.nVacantes;

    let sTextoContinuar = `El RQ ${this.sCodRQ} requería ${nTotalVacantes} personas, ya has enviado ${nTotalVacantes} personas a firmar
                           ¿Deseas marcar como terminado el RQ?`;

    var resp = await Swal.fire({
      title: sTextoContinuar,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No'
    })

    if (!resp.isConfirmed) {
      return;
    }

    let pParametro = [];
    pParametro.push(this.pais);
    pParametro.push(this.id);
    pParametro.push(nIdRQ);

    await this.vSerFidelizacion.fnReclutamiento(29, pParametro, this.url)
      .then((value: any) => {

        Swal.fire({
          title: value.mensaje,
          confirmButtonText: `Ok`,
          timer: 3000
        });
        this.onNoClick();

      }, error => {
        console.log(error);
      });

  }
  //#endregion


  //#region Cerrar
  onNoClick(): void {
    this.dialogRef.close({ data: this.Valor });
  }
  //#endregion

}
