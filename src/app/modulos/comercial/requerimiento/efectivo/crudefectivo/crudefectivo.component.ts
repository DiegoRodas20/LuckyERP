import { Component, OnInit, Input, Inject, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { SerEfectivoService } from './../ser-efectivo.service';
import { SergeneralService } from './../../../../../shared/services/sergeneral.service';
import { PersonalBanco, Estado } from './../../model/IEfectivo';

import { EstadoefectivoComponent } from './../estadoefectivo/estadoefectivo.component';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../../../shared/services/AppDateAdapter';
import * as moment from 'moment';

import { asistenciapAnimations } from './../../../Asistencia/asistenciap/asistenciap.animations';
import { type } from 'jquery';

@Component({
  selector: 'app-crudefectivo',
  templateUrl: './crudefectivo.component.html',
  styleUrls: ['./crudefectivo.component.css'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ],
  animations: [asistenciapAnimations]
})
export class CrudefectivoComponent implements OnInit {
  //#region declaracion variable del sistema
  id: number;
  url: string;
  pais: string;
  Empresa: string;
  lPar: number;
  //#endregion 

  MesEnero = 1
  MesFeb = 3

  listaMesesNoPerm: any

  //#region declaracion variable del sistema 
  desCargo: string;
  idCargo: string;
  monto: number;
  sincontrol: number;
  //#endregion

  @Input() pEfectivo: any;

  DatosFormGroup: FormGroup;
  PPTOFormGroup: FormGroup;
  RQFormGroup: FormGroup;
  TotalFormGroup: FormGroup;

  sPermiso: string = '';
  nEstado: number;

  idTipo: number;

  nCambio: number = 0;


  sPPTO: string = '';
  zona: string = '';
  lCboModena: any;
  lCboTipoCambio: any;
  lcboSucursal: any;
  listaCiudadesTotal: any;

  arrayPartida = new Object();
  arrayPersonal = new Object();
  arrayPersonalTotal = new Object();
  arrayCiudad: any = [];

  nCreador: number = 1;
  nCalVal: number = 1;
  BVal: boolean = false;
  validacion: boolean = false;
  BtnNuevo: boolean = false;
  BtnModificar: boolean = false;
  Btn: boolean = false;

  BtnDueno: boolean = false;
  BtnEquipo: boolean = false;

  bValidoAval: boolean = false;

  BtnPresupuesto: boolean = true;
  BtnCentroCosto: boolean = false;

  tGestor = new Array<any>();
  tGestorDC: string[] = ['estado', 'ciudad', 'partida', 'depositario', 'banco'
    , 'cantidad', 'precio', 'total'];
  tGestorDS: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  //#region validando la fecha
  fecVal: number;
  fecIniVal: Date;
  fecFinVal: Date;
  fecIni: Date;
  fecFin: Date;
  //#endregion

  //#region validando la fecha 
  IdtipoCambio: number;
  TipoCambio: string = '';
  //#endregion

  //#region Meses
  nMesEne: number
  nMesFeb: number
  nMesMar: number
  nMesAbr: number

  nMesMay: number
  nMesJun: number
  nMesJul: number
  nMesAgo: number

  nMesSep: number
  nMesOct: number
  nMesNov: number
  nMesDic: number
  //#endregion


  @Output()
  enviar: EventEmitter<string> = new EventEmitter<string>();

  abLista = [];
  tsLista = 'inactive';
  fbLista = [
    { icon: 'person_add', tool: 'Nuevo personal' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private vSerEfectivo: SerEfectivoService,
    private vSerGeneral: SergeneralService,
    public dialog: MatDialog,
    @Inject('BASE_URL') baseUrl: string
  ) {
    this.url = baseUrl;
  }

  async ngOnInit(): Promise<void> {
    this.monto = this.pEfectivo.monto;
    this.idCargo = this.pEfectivo.idCargo;
    this.sincontrol = this.pEfectivo.sinControl;
    this.pais = localStorage.getItem('Pais');
    this.Empresa = localStorage.getItem('Empresa');
    const user = localStorage.getItem('currentUser');

    this.id = JSON.parse(window.atob(user.split('.')[1])).uid;
    console.log(this.pEfectivo);


    this.fnGetDinero();

    this.PPTOFormGroup = this.formBuilder.group({
      idPPTO: [{ value: '', disabled: false }, Validators.required],
      NroPPTO: [{ value: '', disabled: false }, Validators.required],
      PPTO: [{ value: '', disabled: true }],
      Director: [{ value: '', disabled: true }],
      Area: [{ value: '', disabled: true }],
      IniPPTO: [{ value: '', disabled: true }],
      FinPPTO: [{ value: '', disabled: true }],
      idCliente: [{ value: '', disabled: true }],
      NroCliente: [{ value: '', disabled: true }],
      Cliente: [{ value: '', disabled: true }],
      EstadoPPTO: [{ value: '', disabled: true }],
      // NroDir: [{value: '', disabled: true}, Validators.required],
      Marca: [{ value: '', disabled: true }],
      // NroEje: [{value: '', disabled: true}, Validators.required],
      NombreDir: [{ value: '', disabled: true }],
      NombreGer: [{ value: '', disabled: true }],
      NombreEje: [{ value: '', disabled: true }],
      idMoneda: [{ value: '', disabled: true }],
      Moneda: [{ value: '', disabled: true }],
    });

    this.TotalFormGroup = this.formBuilder.group({
      numtotal: ['', Validators.required],
      txtTotal: [{ value: '', disabled: true }],
    });

    if (typeof this.pEfectivo.List === "undefined" || this.pEfectivo.List === "") {
      this.DatosFormGroup = this.formBuilder.group({
        NroRQ: [{ value: '', disabled: true }, Validators.required],
        Titulo: ['', Validators.required],
        Estado: [{ value: '', disabled: true }, Validators.required],
        NroDoc: [{ value: '', disabled: true }, Validators.required],
        Nombre: [{ value: '', disabled: true }, Validators.required],
        IdBanco: [{ value: '', disabled: true }],
        IdDetBanco: [''],
        Banco: [{ value: '', disabled: true }],
        Cuenta: [{ value: '', disabled: true }],
      });
      this.fnGetSolicitante();

      this.RQFormGroup = this.formBuilder.group({
        idGasto: [''],
        MonedaRQ: [{ value: '', disabled: this.BVal }, Validators.required],
        TipCam: [{ value: '', disabled: true }, Validators.required],
        zona: [{ value: '', disabled: true }, Validators.required],
        Ini: [{ value: '', disabled: this.BVal }, Validators.required],
        Fin: [{ value: '', disabled: this.BVal }, Validators.required],
      });
      this.nEstado = 0;
      this.BtnNuevo = true;

      this.fnGetTipoCambio();
    }
    else {

      this.BVal = true;
      this.nCreador = this.pEfectivo.List.creador

      this.DatosFormGroup = this.formBuilder.group({
        NroRQ: [{ value: this.pEfectivo.List.psCodRQ, disabled: true }, Validators.required],
        Titulo: [{ value: this.pEfectivo.List.psTitulo, disabled: this.BVal }, Validators.required],
        Estado: [{ value: this.pEfectivo.List.psEstado, disabled: true }, Validators.required],
        NroDoc: [{ value: this.pEfectivo.List.pdniSol, disabled: true }, Validators.required],
        Nombre: [{ value: this.pEfectivo.List.pnombreSol, disabled: true }, Validators.required],
        IdBanco: [{ value: this.pEfectivo.List.pidBancoSol, disabled: true }, Validators.required],
        IdDetBanco: [''],
        Banco: [{ value: this.pEfectivo.List.psBancoSol, disabled: true }, Validators.required],
        Cuenta: [{ value: this.pEfectivo.List.pnroCuentaSol, disabled: true }, Validators.required],
      });

      this.PPTOFormGroup.controls.NroPPTO.setValue(this.pEfectivo.List.psCodCC);
      this.sPPTO = this.pEfectivo.List.psCodCC;
      this.nEstado = this.pEfectivo.List.pnEstado;
      this.PPTOFormGroup.get('NroPPTO').disable();
      let moneda: string = this.pEfectivo.List.pnIdMoneda

      let fei = this.convertUTCDateToLocalDate(new Date(this.pEfectivo.List.pdFechaIni));
      let fef = this.convertUTCDateToLocalDate(new Date(this.pEfectivo.List.pdFechaFin));

      this.RQFormGroup = this.formBuilder.group({
        idGasto: [this.pEfectivo.List.pnIdGastoCosto, Validators.required],
        MonedaRQ: [{ value: moneda.toString(), disabled: this.BVal }, Validators.required],
        TipCam: [{ value: this.pEfectivo.List.pnVenta, disabled: true }, Validators.required],
        zona: [{ value: this.pEfectivo.List.zona, disabled: true }, Validators.required],
        Ini: [{ value: fei, disabled: this.BVal }, Validators.required],
        Fin: [{ value: fef, disabled: this.BVal }, Validators.required],
      });

      this.zona = this.pEfectivo.List.zona

      await this.fnGetPPTO(0);

      this.pEfectivo.List.lDet.forEach(async (ele, i) => {

        if (i === 0) {
          this.fnGetPersonalxZona(0, ele.pnIdBanco);
        }
        this.tGestor.push(
          {
            estado: '',
            ciudad: ele.pnIdSucursal,
            partida: ele.pnIdPartida,
            depositario: ele.pidPersonal,
            detBanco: ele.pnIdDetBanco,
            banco: ele.psBanco,
            cantidad: ele.pnCantidad,
            precio: ele.pnPrecio,
            total: ele.pnTotal
          }
        )
      });


      this.tGestorDS = new MatTableDataSource(this.tGestor);
      this.fnTotal();
    }


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

  fnSalir() {
    this.enviar.emit('salir');
  }

  fnGetTipoCambio = function () {
    this.vSerGeneral.fnSystemElements(3, '', '1', 'nElecod,cElenam', this.pais, this.url).subscribe(
      res => {
        this.lCboTipoCambio = res;

        this.lCboTipoCambio.forEach(element => {
          this.IdtipoCambio = element.codigo
          this.TipoCambio = element.valor
          return;
        });

        this.RQFormGroup.controls.TipCam.setValue(this.TipoCambio);
      },
      err => {
        console.log(err);
      },
      () => {
        // this.spinner.hide();

      }

    )
  }

  fnGetDinero = function () {
    this.vSerGeneral.fnSystemElements(2, '442', '1', 'nElecod,cElenam', this.pais, this.url).subscribe(
      res => {
        this.lCboModena = res;
        //this.RQFormGroup.controls.MonedaRQ.setValue("443");
        //this.RQFormGroup.controls.MonedaRQ.disable();
      },
      err => {
        console.log(err);
      },
      () => {
        // this.spinner.hide();

      }

    )
  }

  fnfecha(op, fecha, fechaVal) {
    let vRQ = this.RQFormGroup.value;

    if (op === 0) {
      this.fecIni = fecha;
    }
    else {
      this.fecFin = fecha;
    }

    if (vRQ.Ini === '' || vRQ.Fin === '') {
      this.fecVal = 0
      return;
    }

    this.fnValfecha(this.fecIni, this.fecFin, this.fecIniVal);

  }

  async fnGetSolicitante() {
    let pParametro = [];
    pParametro.push(this.id);
    pParametro.push(this.pais);

    await this.vSerEfectivo.fnEfectivo(0, pParametro, this.url).then((value: PersonalBanco) => {
      this.fecIniVal = this.convertUTCDateToLocalDate(new Date(value.inicio))
      this.fecIniVal.setHours(0);
      this.DatosFormGroup.controls.NroDoc.setValue(value.sDni);
      this.DatosFormGroup.controls.Nombre.setValue(value.sNombres);
      this.DatosFormGroup.controls.IdBanco.setValue(value.idBanco);
      this.DatosFormGroup.controls.IdDetBanco.setValue(value.nIdDetBanco);
      this.DatosFormGroup.controls.Banco.setValue(value.sBanco);
      this.DatosFormGroup.controls.Cuenta.setValue(value.snrocuenta);

    }, error => {
      console.log(error);
    });
  }

  async fnGetPPTO(control) {
    let vPPTO = this.PPTOFormGroup.value;
    let pParametro = [];
    pParametro.push(this.id);
    pParametro.push(this.Empresa);

    if (control === 1) {
      this.RQFormGroup.controls.zona.setValue('');
      this.tGestor = [];
      this.tGestorDS = new MatTableDataSource(this.tGestor);
      pParametro.push(vPPTO.NroPPTO);
    }
    else {
      pParametro.push(this.sPPTO);
    }

    let val: string;
    let mensaje: string;
    let Tipo;

    this.spinner.show();
    await this.vSerEfectivo.fnEfectivo(9, pParametro, this.url).then((value: any) => {

      val = value[0];
      let Obj = value[1].split('-');
      mensaje = Obj[0]
      Tipo = Obj[1];
      this.sPermiso = mensaje;
      this.idTipo = +Tipo
    }, error => {
      console.log(error);
    });
    if (val === "1") {
      let op
      if (Tipo.toString() === '2033') {
        op = 11
      }
      else {
        op = 1
      }
      this.spinner.show();
      await this.vSerEfectivo.fnEfectivo(op, pParametro, this.url).then((value: any) => {

        // this.PPTOFormGroup.get('NroPPTO').disable();  
        if (this.nEstado === 0) {//Devuelto Comercial
          this.RQFormGroup.get('zona').enable();
        }
        else if (this.nCreador === 1) {
          if (mensaje === "dueño") {
            if (this.nEstado === 2100) {//Devuelto Presupuestos
              this.fnMostrar(false)
              this.BtnModificar = true;
            }
            //////////////////////////
            else if (this.nEstado === 2054) {//Devuelto Comercial
              this.fnMostrar(false)
              this.BtnModificar = true;
            }
            else if (this.nEstado === 0) {//Devuelto Comercial
              this.RQFormGroup.get('zona').enable();
            }
            ///////////////////////
          }
          else {//equipo
            if (this.nEstado === 2054) {//Devuelto Comercial
              this.fnMostrar(false)
              this.BtnModificar = true;
            }
            if (this.nEstado === 2100) {//Devuelto Comercial
              this.fnMostrar(false)
              this.BtnModificar = true;
            }
            else if (this.nEstado === 2051) {
              this.fnMostrar(false)
              this.BtnModificar = true;
              this.BtnEquipo = true;
            }
          }
        }
        else {
          if (mensaje === "dueño") {
            if (this.nEstado === 2052) {//Enviado
              this.BtnDueno = true; // puede validar
            }
            if (this.nEstado === 2100) {//Devuelto Presupuestos
              this.BtnDueno = true;
            }
          }
          else {//equipo 
          }
        }

        this.fnLLenar(op, value);

      }, error => {
        console.log(error);
      });
      this.spinner.hide();
    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: mensaje
      });
      this.PPTOFormGroup.controls.idPPTO.setValue('');
      this.PPTOFormGroup.controls.NroPPTO.setValue('');
      this.PPTOFormGroup.controls.PPTO.setValue('');
      this.PPTOFormGroup.controls.Director.setValue('');
      this.PPTOFormGroup.controls.Area.setValue('');
      this.PPTOFormGroup.controls.idCliente.setValue('');
      this.PPTOFormGroup.controls.NroCliente.setValue('');
      this.PPTOFormGroup.controls.Cliente.setValue('');
      this.PPTOFormGroup.controls.NombreDir.setValue('');
      this.PPTOFormGroup.controls.NombreGer.setValue('');
      this.PPTOFormGroup.controls.NombreEje.setValue('');
      this.PPTOFormGroup.controls.Marca.setValue('');
      this.PPTOFormGroup.controls.Moneda.setValue('');
      this.PPTOFormGroup.controls.IniPPTO.setValue('');
      this.PPTOFormGroup.controls.FinPPTO.setValue('');
      this.PPTOFormGroup.controls.EstadoPPTO.setValue('');
      this.RQFormGroup.controls.zona.setValue('');
      this.RQFormGroup.get('zona').disable();

      this.lcboSucursal = [];
      this.arrayPartida = [];
      this.tGestor = [];
      this.tGestorDS = new MatTableDataSource(this.tGestor);


    }
    this.spinner.hide();

  }

  async fnGetPersonalxZona(control, banco) {
    let vPPTO = this.PPTOFormGroup.value;
    let vRQ = this.RQFormGroup.value;
    let pParametro = [];

    if (control === 1) {
      this.zona = vRQ.zona;
    }

    pParametro.push(vPPTO.idPPTO);
    pParametro.push(this.pais);
    pParametro.push(this.zona);
    pParametro.push(this.id);
    pParametro.push(vRQ.idGasto);
    pParametro.push(banco);//codigobanco

    this.spinner.show();
    await this.vSerEfectivo.fnEfectivo(2, pParametro, this.url).then((value: any) => {

      value.forEach(element => {
        this.arrayCiudad.push(element.nSucCod);
        this.arrayPersonal[element.nSucCod] = element.lPersonal
        this.arrayPersonalTotal[element.nSucCod] = element.lPersonal
      });
      this.fnCambio(this.zona, control);
    }, error => {
      console.log(error);
    });
    this.spinner.hide();

  }

  async fnChangeBanco(fila, Suc, Per) {
    let error = false;
    error = await this.fnGetValidacion(Per);

    if (!error) {
      this.tGestorDS.data[fila].depositario = ''
      this.tGestorDS.data[fila].banco = ''
      this.tGestorDS.data[fila].nIdDetBanco = ''
      this.tGestorDS.data[fila].cantidad = ''
      this.tGestorDS.data[fila].precio = ''
      this.tGestorDS.data[fila].total = ''
      return;
    }
    else if (fila === 0) {
      this.arrayPersonal[Suc].forEach(async element => {

        if (element.idPersonal == Per) {

          this.tGestorDS.data[fila].banco = element.sBanco;
          this.tGestorDS.data[fila].detBanco = element.nIdDetBanco;
          await this.fnGetPersonalxZona(0, element.idBanco);
        }
      });

      // this.fnUnico(1,banco)
    }
    else {
      let cui = this.tGestorDS.data[fila].ciudad
      let dep = this.tGestorDS.data[fila].depositario
      let par = this.tGestorDS.data[fila].partida
      let va = 1;

      this.tGestorDS.data.forEach((ele, i) => {

        if (i != fila) {
          if (ele.ciudad === cui && ele.depositario === dep && ele.partida === par) {
            return va = 0;
          }
        }

      });

      if (va === 0) {
        this.tGestorDS.data[fila].depositario = ''
        this.tGestorDS.data[fila].banco = ''
        this.tGestorDS.data[fila].nIdDetBanco = ''
        this.tGestorDS.data[fila].cantidad = ''
        this.tGestorDS.data[fila].precio = ''
        this.tGestorDS.data[fila].total = ''
        return Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'La persona que ha indicado ya se encuentra registrada en la lista, por favor verifíque.'
        });
      }
      else {
        this.arrayPersonal[Suc].forEach(element => {

          if (element.idPersonal == Per) {
            this.tGestorDS.data[fila].banco = element.sBanco;
            this.tGestorDS.data[fila].detBanco = element.nIdDetBanco;
          }
        });
      }


    }
  }

  fnLLenar(op: number, Obj) {
    //Centro Costo
    if (op === 11) {
      this.BtnPresupuesto = false;
      this.BtnCentroCosto = true;
      this.fnValidarFechaInicio();
      this.PPTOFormGroup.controls.idPPTO.setValue(Obj.pidCC);
      this.PPTOFormGroup.controls.NroPPTO.setValue(Obj.psCodCC);
      this.PPTOFormGroup.controls.PPTO.setValue(Obj.psDescCC);
      this.PPTOFormGroup.controls.Director.setValue(Obj.psDirector);
      this.PPTOFormGroup.controls.Area.setValue(Obj.psArea);
    }
    //Presupuesto
    else {
      this.BtnPresupuesto = true;
      this.BtnCentroCosto = false;
      this.fnCleanDate();

      this.PPTOFormGroup.controls.idPPTO.setValue(Obj.pidCC);
      this.PPTOFormGroup.controls.NroPPTO.setValue(Obj.psCodCC);
      this.PPTOFormGroup.controls.PPTO.setValue(Obj.psDescCC);
      this.PPTOFormGroup.controls.idCliente.setValue(Obj.pnIdCliente);
      this.PPTOFormGroup.controls.NroCliente.setValue(Obj.psRuc);
      this.PPTOFormGroup.controls.Cliente.setValue(Obj.psNombreComercial);
      // this.PPTOFormGroup.controls.NroDir.setValue(Obj.pDocDirGen);  
      // this.PPTOFormGroup.controls.NroEje.setValue(Obj.pDocEje);
      this.PPTOFormGroup.controls.NombreDir.setValue(Obj.pDirGen);
      this.PPTOFormGroup.controls.NombreGer.setValue(Obj.pGenCue);
      this.PPTOFormGroup.controls.NombreEje.setValue(Obj.pEje);
      this.PPTOFormGroup.controls.Marca.setValue(Obj.pdesMar);
      this.PPTOFormGroup.controls.Moneda.setValue(Obj.psMoneda);
      this.PPTOFormGroup.controls.IniPPTO.setValue(Obj.pdFecIni);
      this.PPTOFormGroup.controls.FinPPTO.setValue(Obj.pdFecFin);
      this.PPTOFormGroup.controls.EstadoPPTO.setValue(Obj.psEstado);
    }


    this.listaCiudadesTotal = Obj.lSucursal

    this.arrayPartida[0] = '';
    this.listaCiudadesTotal.forEach(element => {
      this.arrayPartida[element.pidSuc] = element.lPartida;
    });


  }


  btnNuevoTGestor() {
    let val = 1;

    if (this.DatosFormGroup.invalid) {
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar datos'
      });
    }
    if (this.RQFormGroup.invalid) {
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar datos'
      });
    }
    if (this.PPTOFormGroup.invalid) {
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar datos'
      });
    }

    this.tGestor.forEach(element => {
      if (element.total == 0) {
        val = 0
        return;
      }
    });

    if (val == 1) {
      this.tGestor.push(
        {
          estado: '', ciudad: '', partida: '', depositario: '', detBanco: '', banco: '', cantidad: 0, precio: 0, total: 0
        }
      )
      this.tGestorDS = new MatTableDataSource(this.tGestor);
    }
  }

  /* private async fnGetValidacion(persona) {
    let vRQ = this.RQFormGroup.value;
    var flag: boolean = false;
    var params = [];
    params.push(persona);
    params.push(vRQ.idGasto);
    params.push(this.Empresa);
    this.spinner.show();
    await this.vSerEfectivo.fnEfectivo(13, params, this.url).then((value: any) => {
      let codigo = value[0];

      if (codigo === '0') {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: value[1]
        });
      }
      else {
        flag = true;
      }
    }, error => {
      console.log(error);
    });

    this.spinner.hide();
    return flag;
  } */


  //#region Validar Numero de req pendientes
  private async fnGetValidacion(persona) {
    let vRQ = this.RQFormGroup.value;
    var flag: boolean = false;
    var params = [];
    params.push(this.Empresa);
    params.push(persona);
    this.spinner.show();
    await this.vSerEfectivo.fnEfectivo(16, params, this.url).then((value: any) => {
      let codigo = value[0];

      if (codigo === '0') {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: value[1]
        });
      }
      else {
        flag = true;
      }
    }, error => {
      console.log(error);
    });

    this.spinner.hide();
    return flag;
  }
  //#endregion


  private async validacionAgregarEditarPersonal(ciudad, partida, TotalgastoPS, spartida) {
    var params = [];
    let vPPTO = this.PPTOFormGroup.value;
    let vRQ = this.RQFormGroup.value;
    var flag: boolean = false;

    params.push(this.idTipo);
    params.push(vPPTO.idPPTO);
    params.push(ciudad);
    params.push(partida);
    params.push(moment(vRQ.Ini, 'MM-DD-YYYY HH:mm:ss', true).format("YYYY-MM-DD"));

    this.spinner.show();
    await this.vSerEfectivo.fnEfectivo(12, params, this.url).then((value: any) => {
      let codigo = value[0];
      let precio: number = +value[1];

      if (codigo === '-1') {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'el mes'
        });
      }

      if (TotalgastoPS > +precio) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'la partida ' + spartida + ' no tiene saldo suficiente'
        });
      }
      else {
        flag = true;
      }



    }, error => {
      console.log(error);
    });

    this.spinner.hide();
    return flag;
  }



  btnElimnarTGestor(Obj) {

    this.tGestor = this.tGestor.filter(filtro => filtro != Obj);
    this.tGestorDS = new MatTableDataSource(this.tGestor);
    if (this.tGestor.length === 0) {
      // this.fnUnico(0,'')
    }


    this.fnTotal();

  }

  fnChangeCiudad(i) {

    this.tGestorDS.data[i].partida = '';
    this.tGestorDS.data[i].depositario = '';
    this.tGestorDS.data[i].detBanco = '';
    this.tGestorDS.data[i].banco = '';
    this.tGestorDS.data[i].cantidad = 0;
    this.tGestorDS.data[i].precio = 0;
    this.tGestorDS.data[i].total = 0;

  }

  //#region Calcular Total de Linea
  async fnCalculo(i, op, Obj, ciudad, partida) {
    //this.TipoCambio



    let rq = this.RQFormGroup.value;

    let pre = this.tGestorDS.data[i].precio
    let can = this.tGestorDS.data[i].cantidad
    let total = this.tGestorDS.data[i].total

    if (can == null) can = 0;
    if (total == null) total = 0;
    if (pre == null) pre = 0;

    let cant = parseInt(can);
    let precio = parseFloat(pre).toFixed(2);
    let tot = parseFloat(total).toFixed(2);
    let preval: number
    let totval: number
    let gasto: number
    let spartida: string
    let valgasto: number
    let Totalgasto: number = 0
    let TotalgastoPS: number = 0

    //Validar Negativos
    if (can < 0 || pre < 0) {
      this.tGestorDS.data[i].precio = 0;
      this.tGestorDS.data[i].cantidad = 0;
      this.tGestorDS.data[i].total = 0
      return Swal.fire({
        icon: 'warning',
        title: 'No estan permitidos negativos, por favor corrija.'
      });

    }

    //Seguir
    if (op == 0) {
      if (pre != 0) {
        totval = +precio * cant;
        preval = +precio;
      }
      else {
        totval = +tot;
        preval = +tot / cant;
      }
    }
    else if (op == 1) {
      preval = +precio;
      totval = +precio * cant;
    }
    else if (op == 2) {
      preval = +tot / cant;
      totval = +tot;
    }



    Obj.forEach(ele => {
      if (ele.pnIdPartida === partida) {
        gasto = ele.psSaldo
        spartida = ele.pCodEsp + ' - ' + ele.pdesEsp
      }
    });


    this.tGestorDS.data.forEach((ele, ii) => {

      if (ciudad === ele.ciudad) {
        if (partida === ele.partida) {
          if (rq.MonedaRQ === '443') {
            if (ii === i) {
              TotalgastoPS += (ele.cantidad * ele.precio)
            }
            else {
              TotalgastoPS = +ele.total
            }
          }
          else {
            if (ii === i) {
              TotalgastoPS += (ele.cantidad * ele.precio) * +this.TipoCambio
            }
            else {
              TotalgastoPS = +ele.total * +this.TipoCambio
            }
          }
        }
      }
    });

    console.log(TotalgastoPS)

    //Validar si la Partida tiene saldo
    if (TotalgastoPS === 0 || totval === 0) return;
    await this.validacionAgregarEditarPersonal(ciudad, partida, TotalgastoPS, spartida).then((valor) => {

      if (valor) {
        this.tGestorDS.data[i].total = totval.toFixed(2);
        this.fnTotal();
      }
      else {
        this.tGestorDS.data[i].total = 0;
        return
      }
    });

    if (this.tGestorDS.data[i].total > 0) {
      //Validar si el requerimiento de efectivo es menor que parametro
      if ((await this.fnValidarMontoDepositario(i)) == false) {
        this.tGestorDS.data[i].total = 0;

      }

    }

    //this.fnTotal();

  }
  //#endregion



  fnTotal() {
    let Totalgasto = 0
    this.tGestorDS.data.forEach(ele => {
      Totalgasto = Totalgasto + (+ele.total)
    });

    this.TotalFormGroup.controls.numtotal.setValue(Totalgasto);
    this.TotalFormGroup.controls.txtTotal.setValue(Totalgasto);

  }

  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;

  }


  async fnAction(val, op) {
    let vDatos = this.DatosFormGroup.value;
    let vRQ = this.RQFormGroup.value;
    let vPPTO = this.PPTOFormGroup.value;
    let Total = this.TotalFormGroup.value;

    //#region  validacion
    if (this.DatosFormGroup.invalid) {
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar datos'
      });
    }
    if (this.RQFormGroup.invalid) {
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar datos'
      });
    }
    if (this.PPTOFormGroup.invalid) {
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar datos'
      });
    }

    if (this.TotalFormGroup.invalid) {
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar a los depositarios'
      });
    }

    if (await this.fnValidarLineas() == false) {
      return
    }

    if (this.fecVal === 0) {
      this.fnValfecha(this.fecIni, this.fecFin, this.fecIniVal);
      return;
    }

    //#endregion


    let pParametro = [];
    pParametro.push(this.Empresa);
    pParametro.push(this.pais);
    pParametro.push(this.id);
    pParametro.push(vDatos.IdDetBanco);
    pParametro.push(vPPTO.idPPTO);
    pParametro.push(vRQ.idGasto);
    pParametro.push(vRQ.MonedaRQ);
    pParametro.push(this.IdtipoCambio);
    pParametro.push(moment(vRQ.Ini, 'MM-DD-YYYY HH:mm:ss', true).format("YYYY-MM-DD"));
    pParametro.push(moment(vRQ.Fin, 'MM-DD-YYYY HH:mm:ss', true).format("YYYY-MM-DD"));
    pParametro.push(vDatos.Titulo);
    pParametro.push(vRQ.zona);

    let Detalle = [];
    this.tGestorDS.data.forEach(element => {
      let Fila = [];

      Fila.push(element.ciudad);
      Fila.push(element.partida);
      Fila.push(element.depositario);
      Fila.push(element.detBanco);
      Fila.push(element.cantidad);
      Fila.push(element.precio);

      if (element.precio === 0) {
        this.nCalVal = 0
      }
      Detalle.push(Fila.join(','));
    });

    if (this.nCalVal === 0) {
      this.nCalVal = 1;
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hay una persona con importe 0 - cero, no se puede grabar así, corrija por favor.'
      });
    }

    pParametro.push(Detalle.join('/'));


    if (this.sPermiso === "dueño") {
      if (this.idTipo === 2033) {

      }
      else if (Total.numtotal > this.monto) {
        return Swal.fire({
          title: '¿Desea enviar RQ de Efectivo?',
          showCancelButton: true,
          confirmButtonText: `Si`,
          cancelButtonText: `No`,
        }).then((result) => {
          if (result.isConfirmed) {
            this.sPermiso = 'enviado'
            pParametro.push(this.sPermiso);
            this.fnGuardar(6, val, pParametro);
          } else {
          }
        })
      }

    }

    if (!this.BtnModificar) {
      Swal.fire({
        title: '¿Desea enviar RQ de Efectivo?',
        showCancelButton: true,
        confirmButtonText: `Si`,
        cancelButtonText: `No`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          if (this.sPermiso === "equipo") {
            this.sPermiso = 'enviado'
          }
          pParametro.push(this.sPermiso);
          this.fnGuardar(6, val, pParametro);
        } else {
          if (this.sPermiso === "equipo") {
            this.fnGuardar(6, val, pParametro);
          }
        }
      })
    }
    else {
      Swal.fire({
        title: '¿Desea reenviar RQ de Efectivo?',
        showCancelButton: true,
        confirmButtonText: `Si`,
        cancelButtonText: `No`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          if (this.sPermiso === "equipo") {
            this.sPermiso = 'enviado'
          }
          pParametro.push(this.sPermiso);
          this.fnGuardar(6, val, pParametro);
        } else {
        }
      })
    }

  }

  async fnValidacion(estado) {
    let pParametro = [];
    let mensaje;

    let vRQ = this.RQFormGroup.value;

    pParametro.push(vRQ.idGasto);
    pParametro.push(this.pais);
    pParametro.push(this.id);


    if (estado === 2054) {
      mensaje = '¿Desea devolver RQ de Efectivo?';
    }
    else if (estado === 2095) {
      mensaje = '¿Desea rechazar RQ de Efectivo?';
    }
    else if (estado === 2053) {
      mensaje = '¿Desea aprobar RQ de Efectivo?';
    }
    else {
      mensaje = '¿Desea enviar RQ de Efectivo?';
    }


    let Total = this.TotalFormGroup.value;


    if (this.sPermiso === "dueño") {
      if (this.idTipo === 2033) {
      }
      else if (Total.numtotal > this.monto) {
        return Swal.fire({
          title: '¿Desea enviar RQ de Efectivo?',
          showCancelButton: true,
          confirmButtonText: `Si`,
          cancelButtonText: `No`,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            this.sPermiso = 'enviado'
            pParametro.push(estado);
            pParametro.push(this.sPermiso);
            pParametro.push('');
            this.fnGuardar(7, 2, pParametro);
          } else {
          }
        })
      }

    }

    if (estado === 2054 || estado === 2095) {
      Swal.fire({
        title: mensaje,
        input: 'text',
        inputAttributes: {
          autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: `Si`,
        cancelButtonText: `No`,
        showLoaderOnConfirm: true,
        preConfirm: (rest) => {
          return this.validacionText(rest).then(val => {
            if (val) {
              return rest
            }
            else {
              throw new Error()
            }

          }).catch(error => {
            Swal.showValidationMessage(
              `El motivo es obligatorio`
            )
          })
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.isConfirmed) {
          pParametro.push(estado);
          pParametro.push('');
          pParametro.push(result.value);
          this.fnGuardar(7, 2, pParametro);

        }
        else {
        }
      })
    }
    else {
      Swal.fire({
        title: mensaje,
        showCancelButton: true,
        confirmButtonText: `Si`,
        cancelButtonText: `No`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          pParametro.push(estado);
          pParametro.push('');
          pParametro.push('');
          this.fnGuardar(7, 2, pParametro);
        } else {
        }
      })
    }


  }


  private async validacionText(valor) {
    var flag: boolean = false;
    if (valor.length != 0) {
      flag = true;
    }
    return flag;
  }


  async fnGuardar(a, val, pParametro) {
    this.spinner.show();

    await this.vSerEfectivo.fnEfectivo(a, pParametro, this.url).then((value: any) => {

      let Result = value[0].split("-");;
      if (val === 0) {

        if (Result.length > 1) {
          this.RQFormGroup.controls.idGasto.setValue(Result[0]);
          this.DatosFormGroup.controls.NroRQ.setValue(Result[1]);
          this.DatosFormGroup.controls.Estado.setValue(Result[2]);
          this.BtnNuevo = false;
          this.fnVAlidar(Result[2]);
          this.PPTOFormGroup.get('NroPPTO').disable();
        }
      }
      else if (val === 1) {
        if (Result.length > 1) {
          this.DatosFormGroup.controls.Estado.setValue(Result[1]);
          this.fnVAlidar(Result[1]);
        }
      }
      else {
        if (Result.length > 1) {
          this.DatosFormGroup.controls.Estado.setValue(Result[1]);
          this.BtnDueno = false;
          this.fnVAlidar(Result[1]);
        }
      }

      let estadoFinal = pParametro[3];

      if (estadoFinal == 2054 || estadoFinal == 2095) {
        this.fnEnviarCorreo();
      }

    }, error => {
      console.log(error);
    });
    this.spinner.hide();
  }

  fnVAlidar(estado) {

    if (this.sPermiso === "equipo" || this.sPermiso === "enviado") {
      if (estado === "Pendiente") {
        this.BtnEquipo = true;
        this.BtnModificar = true;
      }
      else if (estado === "Devuelto Comercial") {
        this.fnMostrar(false);
      }
      else {
        this.BtnModificar = false;
        this.BtnEquipo = false;
        this.fnMostrar(true);
      }
    }
    else {
      if (estado === "Enviado") {
        this.BtnDueno = true;
        this.BtnModificar = false;
      }
      else {
        this.fnMostrar(true);
      }
    }

  }



  fnMostrar(bol) {

    if (!bol) {
      this.BVal = false;
      this.DatosFormGroup.get('Titulo').enable();
      this.RQFormGroup.get('MonedaRQ').enable();
      this.RQFormGroup.get('Ini').enable();
      this.RQFormGroup.get('Fin').enable();
      this.RQFormGroup.get('zona').enable();
    }
    else {
      this.BVal = true;
      this.DatosFormGroup.get('Titulo').disable();
      this.RQFormGroup.get('MonedaRQ').disable();
      this.RQFormGroup.get('Ini').disable();
      this.RQFormGroup.get('Fin').disable();
      this.RQFormGroup.get('zona').disable();
    }
  }

  fnValfecha(ini: Date, fin: Date, iniVal: Date) {
    let fini = moment(ini, 'MM-DD-YYYY HH:mm:ss', true).format("YYYY-MM-DD");
    let obj = fini.split('-');
    let dia = parseInt(obj[2]);
    let mes = parseInt(obj[1]);
    let año = parseInt(obj[0]);

    if (mes === 12) {
      año++;
      mes = 1;
    }
    else {
      mes++;
    }

    let finVal = new Date(año + '-' + mes + '-' + dia)

    if (ini < iniVal) {
      this.fecVal = 0
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La fecha de inicio es muy antigua, verifique, el tope es:' + moment(iniVal, 'MM-DD-YYYY HH:mm:ss', true).format("DD/MM/YYYY")
      });
    }
    else if (ini > fin) {
      this.fecVal = 0

      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La fecha de inicio del RE es mayor a la de fin, CORRIJA.'
      });
    }
    else if (fin > finVal) {
      this.fecVal = 0

      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El periodo de duracion del RE es muy largo, lo máximo permitido es 1 mes. Fecha máxima permitida: ' + moment(finVal, 'MM-DD-YYYY HH:mm:ss', true).format("DD/MM/YYYY")
      });
    }
    else {
      this.fecVal = 1
    }
  }

  async fnVerEstado() {
    let vRQ = this.RQFormGroup.value;
    let pParametro = [];
    pParametro.push(vRQ.idGasto);

    if (vRQ.idGasto != '') {
      this.spinner.show();
      await this.vSerEfectivo.fnEfectivo(10, pParametro, this.url).then((value: Estado[]) => {

        const dialogRef = this.dialog.open(EstadoefectivoComponent, {
          width: '620px',
          data: value,
        });

        dialogRef.afterClosed().subscribe(result => {
        });
      }, error => {
        console.log(error);
      });
      this.spinner.hide();
    }


  }

  public fnCambio(evento, control) {
    if (evento === 1) {
      this.lcboSucursal = this.listaCiudadesTotal.filter((e) => e.psCod === "001")
    }
    else {
      this.lcboSucursal = this.listaCiudadesTotal.filter((e) => e.psCod !== "001")
    }

    if (control === 1) {
      this.tGestor = [];
      this.tGestorDS = new MatTableDataSource(this.tGestor);
    }


  }


  async fnValidarMontoDepositario(i) {

    let nDepositario = this.tGestorDS.data[i].depositario
    let total: number = 0

    //Encontrar Suma total del depositario
    if (this.tGestorDS.data.length > 0) {
      for (let j = 0; j < this.tGestorDS.data.length; j++) {
        if (this.tGestorDS.data[j].depositario == nDepositario) {
          total = total + parseFloat(this.tGestorDS.data[j].total)
        }
      }
    }
    else {
      total = this.tGestorDS.data[i].total
    }



    this.bValidoAval = false;


    var params = [];
    params.push(this.Empresa);
    params.push(nDepositario);
    params.push(total);

    await this.vSerEfectivo.fnEfectivo(15, params, this.url).then((value: any) => {
      let codigo = value[0];
      let mensaje = value[1];

      if (codigo == "1") {
        this.bValidoAval = true;
      }
      else if (codigo == "0") {
        this.bValidoAval = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensaje
        });
      }


    }, error => {
      console.log(error);
    });

    return this.bValidoAval;

  }

  async fnValidarLineas() {
    let bValido: boolean = true;

    if (this.tGestorDS.data.length > 0) {
      for (let i = 0; i < this.tGestorDS.data.length; i++) {
        if (this.tGestorDS.data[i].total == 0) {
          bValido = false
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Los depositarios no pueden tener total 0'
          });
        }
      }
    }
    else {
      bValido = false
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar a los depositarios'
      });
    }

    return bValido;
  }

  //#region Enviar Correo
  async fnEnviarCorreo() {

    let nIdGastoCosto = this.RQFormGroup.controls.idGasto.value

    let pParametro = [];

    pParametro.push(this.pais);
    pParametro.push(this.Empresa);
    pParametro.push(this.id)
    pParametro.push(nIdGastoCosto)

    await this.vSerEfectivo.fnEfectivo(17, pParametro, this.url).then((value: any) => {


    }, error => {
      console.log(error);
    });

  }
  //#endregion

  //#region Validar Fecha de Inicio
  async fnValidarFechaInicio() {

    let pParametro = [];

    pParametro.push(this.pais);

    this.listaMesesNoPerm = await this.vSerEfectivo.fnEfectivo(18, pParametro, this.url)


    for (let i = 0; i < this.listaMesesNoPerm.length; i++) {
      this.listaMesesNoPerm[i].nMes == 0 ? this.nMesEne = 0 : ''
      this.listaMesesNoPerm[i].nMes == 1 ? this.nMesFeb = 1 : ''
      this.listaMesesNoPerm[i].nMes == 2 ? this.nMesMar = 2 : ''
      this.listaMesesNoPerm[i].nMes == 3 ? this.nMesAbr = 3 : ''
      this.listaMesesNoPerm[i].nMes == 4 ? this.nMesMay = 4 : ''
      this.listaMesesNoPerm[i].nMes == 5 ? this.nMesJun = 5 : ''
      this.listaMesesNoPerm[i].nMes == 6 ? this.nMesJul = 6 : ''
      this.listaMesesNoPerm[i].nMes == 7 ? this.nMesAgo = 7 : ''
      this.listaMesesNoPerm[i].nMes == 8 ? this.nMesSep = 8 : ''
      this.listaMesesNoPerm[i].nMes == 9 ? this.nMesOct = 9 : ''
      this.listaMesesNoPerm[i].nMes == 10 ? this.nMesNov = 10 : ''
      this.listaMesesNoPerm[i].nMes == 11 ? this.nMesDic = 11 : ''
    }

  }
  //#endregion


  //#region Limpiar Fechas
  fnCleanDate() {
    this.listaMesesNoPerm = []

    this.nMesEne = null
    this.nMesFeb = null
    this.nMesMar = null
    this.nMesAbr = null
    this.nMesMay = null
    this.nMesJun = null
    this.nMesJul = null
    this.nMesAgo = null
    this.nMesSep = null
    this.nMesOct = null
    this.nMesNov = null
    this.nMesDic = null
  }
  //#endregion


  //#region Filtrar Fechas
  filtroFecha = (d: Date | null): boolean => {
    const month = (d || new Date()).getMonth();

    return month !== this.nMesEne &&
      month !== this.nMesFeb &&
      month !== this.nMesMar &&
      month !== this.nMesAbr &&
      month !== this.nMesMay &&
      month !== this.nMesJun &&
      month !== this.nMesJul &&
      month !== this.nMesAgo &&
      month !== this.nMesSep &&
      month !== this.nMesOct &&
      month !== this.nMesNov &&
      month !== this.nMesDic

  }
  //#endregion Filtrar Fechas



}
