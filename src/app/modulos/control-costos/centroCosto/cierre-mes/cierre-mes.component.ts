import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { CentroCostoService } from '../centroCosto.service';
import { Anio } from '../Models/asignar/IAsignar';
import { Empresa } from '../Models/centroCostos/ICentroCosto';
export interface CierreMes {
  sAnio: string;
  nIdMes: number;
  nEstado: number;
}
// Importante para las validaciones
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}
@Component({
  selector: 'app-cierre-mes',
  templateUrl: './cierre-mes.component.html',
  styleUrls: ['./cierre-mes.component.css']
})
export class CierreMesComponent implements OnInit {

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  formSaldo: FormGroup;
  cboAnio = new FormControl();
  lAnio: Anio[];

  lMesId = [
    1456,//Enero
    1457,
    1458,
    1459,
    1460,
    1461,
    1462,
    1463,
    1464,
    1465,
    1466,
    1467 //Diciembre
  ]

  lCierreMes: CierreMes[] = [];
  vAnioActual;
  vMesActual;
  vEmpresa: Empresa;

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vCentroCostoService: CentroCostoService,
    private cdr: ChangeDetectorRef,

    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; }

  ngOnInit(): void {

    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.vAnioActual = new Date().getFullYear().toString();
    this.vMesActual = (new Date().getMonth() + 1).toString();

    // st = slide toggle, Angular material component
    this.formSaldo = this.formBuilder.group({
      stEnero: [true],
      stFebrero: [true],
      stMarzo: [true],
      stAbril: [true],
      stMayo: [true],
      stJunio: [true],
      stJulio: [true],
      stAgosto: [true],
      stSeptiembre: [true],
      stOctubre: [true],
      stNoviembre: [true],
      stDiciembre: [true],
    })

    this.fnListarEmpresa();
    this.fnListarAnios();
    this.fnInsertarAnios();
  }

  //Funciones para listar
  fnListarAnios = function () {

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;

    pParametro.push(this.idEmp);

    this.vCentroCostoService.fnCierreMes(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lAnio = res
        if (this.lAnio.length != 0) {
          if (this.lAnio.findIndex(item => item.sAnio == this.vAnioActual) == -1) {
            this.fnListarEstadosMeses(this.lAnio[this.lAnio.length - 1]?.sAnio);
            this.cboAnio.setValue(this.lAnio[this.lAnio.length - 1]?.sAnio)
            this.fnInactivarST(this.lAnio[this.lAnio.length - 1]?.sAnio)
          } else {
            this.fnListarEstadosMeses(this.vAnioActual);
            this.fnInactivarST(this.vAnioActual)
            this.cboAnio.setValue(this.vAnioActual);
          }
        }
      },
      err => {
        console.log(err);
      },
      () => {
      }
    );
  }

  fnListarEmpresa = function () {
    //this.spinner.show();

    var pEntidad = 2; //Cabecera
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.idEmp);
    this.vCentroCostoService.fnCierreMes(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.vEmpresa = res[0];
      },
      err => {
        console.log(err);
      },
      () => {
        //this.spinner.hide();
      }
    );
  }

  fnListarEstadosMeses = function (sAnio: string) {
    var pEntidad = 3; //Cabecera
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(sAnio);
    pParametro.push(this.idEmp);

    this.spinner.show();
    this.vCentroCostoService.fnCierreMes(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lCierreMes = res;
        this.fnPartirMes(this.lCierreMes);
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  //Funcion para insertar
  fnInsertarAnios = function () {

    var pEntidad = 3; //Cabecera
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

    pParametro.push(this.vAnioActual);
    pParametro.push(this.idEmp);

    this.spinner.show();

    this.vCentroCostoService.fnCierreMes(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }
  //Funciones de actualizacion
  fnCambioMes = function (mes: number) {
    let bEstado = this.fnEstadoMes(mes)

    var pEntidad = 1; //Cabecera
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

    pParametro.push(bEstado);
    pParametro.push(this.idEmp);
    pParametro.push(this.cboAnio.value);
    pParametro.push(mes);
    pParametro.push(this.idUser);
    pParametro.push(this.pPais);
    this.spinner.show();

    this.vCentroCostoService.fnCierreMes(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res == 0) {
          Swal.fire(
            'Error', //Titulo
            'No se pudo realizar la actualizacion: Verifique su conexion a Internet', //Mensaje html
            'error' //Tipo de mensaje
          )
        } else {
          Swal.fire('Correcto', 'Se actualizaron ' + res + ' registro(s) al estado de ' + (bEstado == 1 ? 'activo' : 'inactivo'), 'success')

        }
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnCambioCierreMes = function (mes: number) {
    let bEstado = this.fnEstadoMes(mes)

    var pEntidad = 3; //Cabecera
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

    pParametro.push(this.cboAnio.value);
    pParametro.push(mes);
    pParametro.push(bEstado);
    pParametro.push(this.idEmp);

    this.spinner.show();

    this.vCentroCostoService.fnCierreMes(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  //Funciones de interaccion
  fnPartirMes(lCierreMes: CierreMes[]) {
    lCierreMes.forEach(mes => {
      switch (mes.nIdMes) {
        case this.lMesId[0]: {
          this.formSaldo.controls.stEnero.setValue(mes.nEstado == 1 ? true : false)
        }
        case this.lMesId[1]: {
          this.formSaldo.controls.stFebrero.setValue(mes.nEstado == 1 ? true : false)
        }
        case this.lMesId[2]: {
          this.formSaldo.controls.stMarzo.setValue(mes.nEstado == 1 ? true : false)
        }
        case this.lMesId[3]: {
          this.formSaldo.controls.stAbril.setValue(mes.nEstado == 1 ? true : false)
        }
        case this.lMesId[4]: {
          this.formSaldo.controls.stMayo.setValue(mes.nEstado == 1 ? true : false)
        }
        case this.lMesId[5]: {
          this.formSaldo.controls.stJunio.setValue(mes.nEstado == 1 ? true : false)
        }
        case this.lMesId[6]: {
          this.formSaldo.controls.stJulio.setValue(mes.nEstado == 1 ? true : false)

        }
        case this.lMesId[7]: {
          this.formSaldo.controls.stAgosto.setValue(mes.nEstado == 1 ? true : false)
        }
        case this.lMesId[8]: {
          this.formSaldo.controls.stSeptiembre.setValue(mes.nEstado == 1 ? true : false)
        }
        case this.lMesId[9]: {
          this.formSaldo.controls.stOctubre.setValue(mes.nEstado == 1 ? true : false)
        }
        case this.lMesId[10]: {
          this.formSaldo.controls.stNoviembre.setValue(mes.nEstado == 1 ? true : false)
        }
        case this.lMesId[11]: {
          this.formSaldo.controls.stDiciembre.setValue(mes.nEstado == 1 ? true : false)
        }
      }
    });
  }

  fnEstadoMes(mes: number) {
    switch (mes) {
      case this.lMesId[0]: {
        return this.formSaldo.controls.stEnero.value == false ? 0 : 1
      }
      case this.lMesId[1]: {
        return this.formSaldo.controls.stFebrero.value == false ? 0 : 1
      }
      case this.lMesId[2]: {
        return this.formSaldo.controls.stMarzo.value == false ? 0 : 1
      }
      case this.lMesId[3]: {
        return this.formSaldo.controls.stAbril.value == false ? 0 : 1
      }
      case this.lMesId[4]: {
        return this.formSaldo.controls.stMayo.value == false ? 0 : 1
      }
      case this.lMesId[5]: {
        return this.formSaldo.controls.stJunio.value == false ? 0 : 1
      }
      case this.lMesId[6]: {
        return this.formSaldo.controls.stJulio.value == false ? 0 : 1
      }
      case this.lMesId[7]: {
        return this.formSaldo.controls.stAgosto.value == false ? 0 : 1
      }
      case this.lMesId[8]: {
        return this.formSaldo.controls.stSeptiembre.value == false ? 0 : 1
      }
      case this.lMesId[9]: {
        return this.formSaldo.controls.stOctubre.value == false ? 0 : 1
      }
      case this.lMesId[10]: {
        return this.formSaldo.controls.stNoviembre.value == false ? 0 : 1
      }
      case this.lMesId[11]: {
        return this.formSaldo.controls.stDiciembre.value == false ? 0 : 1
      }
    }
  }

  fnInactivarST(sAnio: string) {
    var nAnio: number = + sAnio;
    var nAnioActual: number = + this.vAnioActual;
    if (nAnio > nAnioActual) {
      this.formSaldo.controls.stEnero.disable()
      this.formSaldo.controls.stFebrero.disable()
      this.formSaldo.controls.stMarzo.disable()
      this.formSaldo.controls.stAbril.disable()
      this.formSaldo.controls.stMayo.disable()
      this.formSaldo.controls.stJunio.disable()
      this.formSaldo.controls.stJulio.disable()
      this.formSaldo.controls.stAgosto.disable()
      this.formSaldo.controls.stSeptiembre.disable()
      this.formSaldo.controls.stOctubre.disable()
      this.formSaldo.controls.stNoviembre.disable()
      this.formSaldo.controls.stDiciembre.disable()
      return;
    }

    var nMesActual = + this.vMesActual;
    if (nAnio == nAnioActual) {
      if (nMesActual < 12) { this.formSaldo.controls.stDiciembre.disable() }
      if (nMesActual < 11) { this.formSaldo.controls.stNoviembre.disable() }
      if (nMesActual < 10) { this.formSaldo.controls.stOctubre.disable() }
      if (nMesActual < 9) { this.formSaldo.controls.stSeptiembre.disable() }
      if (nMesActual < 8) { this.formSaldo.controls.stAgosto.disable() }
      if (nMesActual < 7) { this.formSaldo.controls.stJulio.disable() }
      if (nMesActual < 6) { this.formSaldo.controls.stJunio.disable() }
      if (nMesActual < 5) { this.formSaldo.controls.stMayo.disable() }
      if (nMesActual < 4) { this.formSaldo.controls.stAbril.disable() }
      if (nMesActual < 3) { this.formSaldo.controls.stMarzo.disable() }
      if (nMesActual < 2) { this.formSaldo.controls.stFebrero.disable() }
      return;
    }

    if (nAnio < nAnioActual) {
      this.formSaldo.controls.stEnero.enable()
      this.formSaldo.controls.stFebrero.enable()
      this.formSaldo.controls.stMarzo.enable()
      this.formSaldo.controls.stAbril.enable()
      this.formSaldo.controls.stMayo.enable()
      this.formSaldo.controls.stJunio.enable()
      this.formSaldo.controls.stJulio.enable()
      this.formSaldo.controls.stAgosto.enable()
      this.formSaldo.controls.stSeptiembre.enable()
      this.formSaldo.controls.stOctubre.enable()
      this.formSaldo.controls.stNoviembre.enable()
      this.formSaldo.controls.stDiciembre.enable()
      return;
    }
  }
}