import { Component, OnInit, Input, Inject, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { SctrService } from './../sctr.service';
import { SerEfectivoService } from './../../efectivo/ser-efectivo.service';
import { SergeneralService } from './../../../../../shared/services/sergeneral.service';

import Swal from 'sweetalert2';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EstadoefectivoComponent } from './../../efectivo/estadoefectivo/estadoefectivo.component';

import { PersonalBanco, Estado } from './../../model/IEfectivo';

import { cboMes, Parametria, UsuarioNivel } from './../../model/Isctr';

import { comercialAnimations } from './../../../Animations/comercial.animations';
import { DialogPdfComponent } from '../dialog-pdf/dialog-pdf.component';


@Component({
  selector: 'app-detsctr',
  templateUrl: './detsctr.component.html',
  styleUrls: ['./detsctr.component.css'],
  animations: [comercialAnimations]
})
export class DetsctrComponent implements OnInit {
  //#region declaracion variable del sistema
  id: number;
  url: string;
  pais: string = localStorage.getItem('Pais');
  Empresa: string = localStorage.getItem('Empresa');
  lPar: number;
  nPerfil: number;
  //#endregion 

  //#region declaracion variable tipo cambio
  IdtipoCambio: number;
  TipoCambio: string;
  //#endregion 

  //#region declaracion variable del sistema 
  desCargo: string;
  idCargo: string;
  monto: number;
  sincontrol: number;
  titulo: string;
  //#endregion

  Validar: number;
  sPPTO: string = '';
  sPermiso: string = '';
  nCreador: number;
  nEstado: number = 0;
  MesAnterior: any

  parametria: Parametria = { nIdPara: 0 };


  mes = new Array<cboMes>();
  zona = new Array<cboMes>();
  arrayCiudad: any = [];
  bPerfilTes: boolean = false;
  lcboSucursal: any;
  lcboSucursalTotal: any;
  arrayPartida = new Object();
  arrayPersonal = new Object();
  arrayPersonalTotal = new Object();
  PersonalRepetido: any
  sListaPersonalRep: string;

  //#region Botones
  btnGuardar: boolean = true;
  btnValidar: boolean = true;
  btnHistorico: boolean = true;
  btnExcel: boolean = false;
  btnTesoreria: boolean = false;
  btnPDFTesoreria: boolean = false;
  btnPDFComercial: boolean = false;
  btnDet: boolean = true;
  //#endregion


  //#region form
  DatosFormGroup: FormGroup;
  PPTOFormGroup: FormGroup;
  RQFormGroup: FormGroup;
  //#endregion

  tGestor = new Array<any>();
  tGestorDC: string[] = ['estado', 'ciudad', 'partida', 'depositario', 'costo'];
  tGestorDS: MatTableDataSource<any>;

  abLista = [];
  tsLista = 'inactive';
  fbLista = [
    { icon: 'person_add', tool: 'Nuevo personal' }
  ];

  @Input() pSctr: any;

  @Output()
  enviar: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    @Inject('BASE_URL') baseUrl: string,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    public service: SctrService,
    private vSerGeneral: SergeneralService,
    private vSerEfectivo: SerEfectivoService,
    private spinner: NgxSpinnerService
  ) {
    this.url = baseUrl;
    const user = localStorage.getItem('currentUser');
    this.url = baseUrl;
    this.id = JSON.parse(window.atob(user.split('.')[1])).uid;

  }

  ngOnInit(): void {

    this.titulo = this.pSctr.titulo;
    this.monto = this.pSctr.monto;
    this.idCargo = this.pSctr.idCargo;

    this.PPTOFormGroup = this.formBuilder.group({
      idPPTO: [{ value: '', disabled: false }, Validators.required],
      NroPPTO: [{ value: '', disabled: false }, Validators.required],
      PPTO: [{ value: '', disabled: true }, Validators.required],
      IniPPTO: [{ value: '', disabled: true }, Validators.required],
      FinPPTO: [{ value: '', disabled: true }, Validators.required],
      idCliente: [{ value: '', disabled: true }, Validators.required],
      NroCliente: [{ value: '', disabled: true }, Validators.required],
      Cliente: [{ value: '', disabled: true }, Validators.required],
      EstadoPPTO: [{ value: '', disabled: true }, Validators.required],
      // NroDir: [{value: '', disabled: true}, Validators.required],
      Marca: [{ value: '', disabled: true }, Validators.required],
      // NroEje: [{value: '', disabled: true}, Validators.required],
      NombreDir: [{ value: '', disabled: true }, Validators.required],
      NombreGer: [{ value: '', disabled: true }, Validators.required],
      NombreEje: [{ value: '', disabled: true }, Validators.required],
      idMoneda: [{ value: '', disabled: true }, Validators.required],
      Moneda: [{ value: '', disabled: true }, Validators.required],
    });

    this.RQFormGroup = this.formBuilder.group({
      Proveedor: [{ value: '', disabled: true }, Validators.required],
      Mes: [{ value: '', disabled: false }, Validators.required],
      Cambio: [{ value: '', disabled: true }, Validators.required],
      zona: [{ value: '', disabled: true }, Validators.required]
    });

    this.fnGetTipoCambio();
    this.fnGetPerfil();
    //this.fnGetPersonal();
    this.fnCargarMeses();

    //Nuevo
    if (typeof this.pSctr.List === "undefined" || this.pSctr.List === "") {
      this.listTParametria(0);
      this.nCreador = 1
      this.Validar = 0;
      this.DatosFormGroup = this.formBuilder.group({
        idRQ: [{ value: '', disabled: false }],
        NroRQ: [{ value: '', disabled: true }, Validators.required],
        Titulo: ['REQUERIMIENTO DE SCTR', Validators.required],
        Estado: [{ value: '', disabled: true }, Validators.required],
        NroDoc: [{ value: '', disabled: true }, Validators.required],
        Nombre: [{ value: '', disabled: true }, Validators.required],
      });
      this.fnGetSolicitante(this.id);
      this.fnChangeButton();

    }

    //Cargar por Id
    else {
      let lista = this.pSctr.List
      this.Validar = 1;

      this.nCreador = (+lista.usuario == this.id ? 1 : 0)
      this.nEstado = lista.nEstado;
      this.fnGetSolicitante(lista.usuario);
      this.listTParametria(lista.idAseg)
      this.sPPTO = lista.sCodCC

      this.PPTOFormGroup.controls.NroPPTO.setValue(lista.sCodCC);

      this.DatosFormGroup = this.formBuilder.group({
        idRQ: [{ value: lista.nIdGastoCosto, disabled: false }],
        NroRQ: [{ value: lista.numero, disabled: true }, Validators.required],
        Titulo: [lista.sTitulo, Validators.required],
        Estado: [{ value: lista.sEstado, disabled: true }, Validators.required],
        NroDoc: [{ value: '', disabled: true }, Validators.required],
        Nombre: [{ value: '', disabled: true }, Validators.required],
      });
      this.fnGetPPTO();

      let mes: string;
      let zona: string = '' + lista.sZona;

      if (lista.mes < 10) {
        mes = '0' + lista.mes
      }
      else {
        mes = '' + lista.mes
      }


      this.MesAnterior = mes;
      this.RQFormGroup.controls.Mes.setValue(mes);

      this.RQFormGroup.controls.zona.setValue(zona);


      lista.lDet.map((det) => {
        this.tGestor.push(
          det
        )
        this.tGestorDS = new MatTableDataSource(this.tGestor);
      })



    }
  }


  //#region Cambiar Botones
  async fnChangeButton() {

    if (typeof (this.nEstado) == 'string') {
      this.nEstado = parseInt(this.nEstado);
    }


    if (this.nCreador === 1) {//Si es creador del RQ

      if (this.sPermiso === '') {//Nuevo
        this.btnGuardar = true;
        this.btnValidar = false;

        this.btnDet = false;
      }
      else if (this.sPermiso === 'dueño') {//es dueño y creador
        if (this.nEstado === 0) {
          this.btnGuardar = true;
          this.btnValidar = false;

          this.btnDet = false;
        }
        else if (this.nEstado === 2051 || this.nEstado === 2054 || this.nEstado === 2100) { // pendiente, devuelto por comercial y presupuesto
          this.btnGuardar = true;
          this.btnValidar = false;

          this.btnDet = false;
          //Probar deshabilitar
          //this.fnDisabled();
        }
        else if (this.nEstado === 2052 || this.nEstado === 2053 || this.nEstado === 2055
          || this.nEstado === 2056 || this.nEstado === 2057 || this.nEstado === 2095) { // enviado | Aprobado Comercial | 2055
          // Rechazado Presupuestos | Terminado Finalizado | Rechazado Comercial 
          this.btnGuardar = false;
          this.btnValidar = false;
          this.btnHistorico = true;
          this.btnDet = true;
          this.DatosFormGroup.disable();

          this.PPTOFormGroup.disable();
        }
      }

      else {// equipo
        if (this.nEstado === 0) {
          this.btnGuardar = true;
          this.btnValidar = false;
          this.btnDet = false;
        }
        else if (this.nEstado === 2051 || this.nEstado === 2054 || this.nEstado == 2361) {
          // Pendiente, Devuelto por comercial, Devuelto por tesoreria
          this.btnGuardar = true;
          this.btnValidar = false;
          this.btnDet = false;
          this.DatosFormGroup.disable();
          this.PPTOFormGroup.disable();

        }
        else if (this.nEstado === 2052 || this.nEstado === 2053 || this.nEstado === 2055 || this.nEstado === 2100
          || this.nEstado === 2056 || this.nEstado === 2057 || this.nEstado === 2095) { // enviado | Aprobado Comercial | 2055 | Devuelto Presupuestos
          // Rechazado Presupuestos | Terminado Finalizado | Rechazado Comercial 
          this.btnGuardar = false;
          this.btnValidar = false;
          this.btnDet = true;
          this.DatosFormGroup.disable();
          this.PPTOFormGroup.disable();
        }
      }
    }

    //Si evalua el RQ
    else {
      if (this.sPermiso === 'dueño') {//es dueño y valida
        if (this.nEstado === 2052 || this.nEstado === 2100) {
          // Enviado | Devuelto Presupuestos | 2055
          this.btnGuardar = false;
          this.btnValidar = true;
          this.btnDet = true;
          this.DatosFormGroup.disable();
          this.RQFormGroup.disable();
          this.PPTOFormGroup.disable();
        }
        else {
          this.btnGuardar = false;
          this.btnValidar = false;
          this.btnDet = true;
          this.DatosFormGroup.disable();
          this.RQFormGroup.disable();
          this.PPTOFormGroup.disable();
        }
      }
      else {// equipo 
        this.btnGuardar = false;
        this.btnValidar = false;
        this.btnDet = true;
        this.DatosFormGroup.disable();
        this.RQFormGroup.disable();
        this.PPTOFormGroup.disable();
      }
    }


    //En estado Aprobado o Finalizado
    if (this.nEstado == 2055 || this.nEstado == 2057) {

      //Si tiene perfil de tesorería
      if (this.bPerfilTes) {
        this.btnPDFTesoreria = true;
        this.btnExcel = true;
      }
      else {//Si tiene perfil Comercial
        this.btnPDFComercial = true;
      }
    }

    //Estado Aprobado / Perfil Tesoreria
    if (this.nEstado == 2055 && this.bPerfilTes) {
      this.btnTesoreria = true;
    }
    else {
      this.btnTesoreria = false;
    }

    //Histórico
    if (this.nEstado == 0) {
      this.btnHistorico = false;
    }
    else {
      this.btnHistorico = true;
    }


    //2051:Pendiente | 2054:Devuelto Comercial | 2361:Devuelto Tesoreria
    if (this.nEstado == 0 || this.nEstado == undefined || this.nEstado == null || this.nEstado == 2051 || this.nEstado == 2054 || this.nEstado == 2361) {
      this.RQFormGroup.controls.Mes.enable();
    }
    else {
      this.RQFormGroup.disable();
    }


    if (this.nEstado == 2361 || this.nEstado == 2362) {
      this.btnExcel = false;
      this.btnPDFTesoreria = false;
    }


  }
  //#endregion


  //#region  Obtener informacion de los combos


  //#region Obtener Datos del Solicitante
  async fnGetSolicitante(id) {
    let pParametro = [];
    pParametro.push(id);
    pParametro.push(this.pais);

    await this.vSerEfectivo.fnEfectivo(0, pParametro, this.url).then((value: any) => {

      this.DatosFormGroup.controls.NroDoc.setValue(value.sDni);
      this.DatosFormGroup.controls.Nombre.setValue(value.sNombres);
    }, error => {
      console.log(error);
    });
  }
  //#endregion


  //#region Obtener Parametros
  async listTParametria(id) {
    var today = new Date();
    const param = [];
    param.push(id);
    param.push(this.pais);
    this.service.fnSctr(34, param, this.url).subscribe((value: Parametria[]) => {

      if (value.length != 0) {
        this.parametria = value[0];
        this.RQFormGroup.controls.Proveedor.setValue(this.parametria.snombreComercial);

      } else {
        Swal.fire('No se cargo el Proveedor, verifique parámetros de SCTR')
      }

    });
  }
  //#endregion


  //#region Obtener Tipo de Cambio
  fnGetTipoCambio = function () {
    this.vSerGeneral.fnSystemElements(3, '', '1', 'nElecod,cElenam', this.pais, this.url).subscribe(
      res => {
        this.lCboTipoCambio = res;

        this.lCboTipoCambio.forEach(element => {
          this.IdtipoCambio = element.codigo
          this.TipoCambio = element.valor
          return;
        });

        this.RQFormGroup.controls.Cambio.setValue(this.TipoCambio);
      },
      err => {
        console.log(err);
      },
      () => {
        // this.spinner.hide();

      }

    )
  }

  //#endregion


  //#region Obtener Personal
  async fnGetPersonal() {
    let pParametro = [];
    pParametro.push(this.pais);

    await this.service.fnSctrV2(20, pParametro, this.url).then((value: any) => {

      value.forEach(element => {
        this.arrayCiudad.push(element.sucursal_id);
        this.arrayPersonal[element.sucursal_id] = element.lPersonal
        this.arrayPersonalTotal[element.sucursal_id] = element.lPersonal
      });

    }, error => {
      console.log(error);
    });

  }
  //#endregion

  //#endregion


  //#region Validación y Obtener Info de Presupuesto
  async fnGetPPTO() {
    let vPPTO = this.PPTOFormGroup.value;
    let pParametro = [];
    pParametro.push(this.id);
    pParametro.push(this.Empresa);
    pParametro.push(vPPTO.NroPPTO);

    let val: string;
    let mensaje: string;


    this.spinner.show();

    if (!this.bPerfilTes) {
      await this.fnGetPerfil();
    }

    //Si es de Tesorería
    if (this.bPerfilTes) {
      await this.service.fnSctrV2(33, pParametro, this.url).then((value: any) => {

        this.fnLLenar(value);

      }, error => {
        this.fnLimpiarForm();

        console.log(error);
      });
      this.spinner.hide();

    }

    //Otros Perfiles -> Validar 
    else {
      await this.service.fnSctrV2(27, pParametro, this.url).then((value: any) => {

        val = value[0];
        mensaje = value[1];
        this.RQFormGroup.get('zona').disable();
        this.sPermiso = mensaje;
      }, error => {
        console.log(error);
      });

      if (val === "1") {

        this.spinner.show();
        await this.service.fnSctrV2(28, pParametro, this.url).then((value: any) => {

          this.fnLLenar(value);


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

        this.fnLimpiarForm();

      }
      this.spinner.hide();
    }

  }
  //#endregion


  //#region Llenar Datos de Presupuesto
  async fnLLenar(Obj) {

    if (await this.fnValidarPresupuesto(1, Obj.nAprobacionPre, '') == false) {
      this.sPermiso = ''
      this.fnLimpiarForm();
      return;
    }
    if (await this.fnValidarPresupuesto(2, Obj.nEstado, Obj.psEstado) == false) {
      this.sPermiso = ''
      this.fnLimpiarForm();
      return;
    }


    this.PPTOFormGroup.controls.idPPTO.setValue(Obj.pidCC);
    this.PPTOFormGroup.controls.NroPPTO.setValue(Obj.psCodCC);
    this.PPTOFormGroup.controls.PPTO.setValue(Obj.psDescCC);
    this.PPTOFormGroup.controls.idCliente.setValue(Obj.pnIdCliente);
    this.PPTOFormGroup.controls.NroCliente.setValue(Obj.psRuc);
    this.PPTOFormGroup.controls.Cliente.setValue(Obj.psNombreComercial);
    this.PPTOFormGroup.controls.NombreDir.setValue(Obj.pDirGen);
    this.PPTOFormGroup.controls.NombreGer.setValue(Obj.pGenCue);
    this.PPTOFormGroup.controls.NombreEje.setValue(Obj.pEje);
    this.PPTOFormGroup.controls.Marca.setValue(Obj.pdesMar);
    this.PPTOFormGroup.controls.Moneda.setValue(Obj.psMoneda);
    this.PPTOFormGroup.controls.IniPPTO.setValue(Obj.pdFecIni);
    this.PPTOFormGroup.controls.FinPPTO.setValue(Obj.pdFecFin);
    this.PPTOFormGroup.controls.EstadoPPTO.setValue(Obj.psEstado);

    this.lcboSucursal = Obj.lSucursal
    this.lcboSucursalTotal = Obj.lSucursal


    this.arrayPartida[0] = '';

    if (this.lcboSucursal != null) {
      this.lcboSucursal.forEach(element => {
        this.arrayPartida[element.pidSuc] = element.lPartida;
      });
    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El número de presupuesto que ha indicado no existe'
      });
      this.fnLimpiarForm();
      return
    }

    if (this.sPPTO != Obj.psCodCC) {
      this.RQFormGroup.controls.Mes.setValue('');
      this.RQFormGroup.controls.zona.setValue('');
      this.sPPTO = Obj.psCodCC;
      this.tGestor = [];
      this.tGestorDS = new MatTableDataSource(this.tGestor);
    }

    this.RQFormGroup.get('zona').enable();
    let rq = this.RQFormGroup.value;


    this.fnZona(rq.zona)
    this.fnChangeButton();

  }
  //#endregion


  //#region Limpiar Formulario
  async fnLimpiarForm() {
    this.PPTOFormGroup.controls.idPPTO.setValue('');
    this.PPTOFormGroup.controls.NroPPTO.setValue('');
    this.PPTOFormGroup.controls.PPTO.setValue('');
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

    this.lcboSucursal = [];
    this.lcboSucursalTotal = [];

    this.arrayPartida = [];
    this.tGestor = [];
    this.tGestorDS = new MatTableDataSource(this.tGestor);
  }
  //#endregion


  //#region Accion de la tabla
  btnElimnarTGestor(Obj) {

    this.tGestor = this.tGestor.filter(filtro => filtro != Obj);
    this.tGestorDS = new MatTableDataSource(this.tGestor);

    this.fnDisabled();

  }

  btnNuevoTGestor() {
    let val = 1;

    if (this.DatosFormGroup.invalid) {
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar titulo'
      });
    }
    if (this.PPTOFormGroup.invalid) {
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar PPTO'
      });
    }
    if (this.RQFormGroup.invalid) {
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar el mes o de donde son'
      });
    }


    this.tGestor.forEach(element => {
      if (element.costo === 0) {
        val = 0
        return;
      }
      else if (element.costo === '') {
        val = 0
        return;
      }
    });

    if (val == 1) {
      this.tGestor.push(
        {
          estado: '', ciudad: '', partida: '', depositario: '', costo: ''
        }
      )
      this.tGestorDS = new MatTableDataSource(this.tGestor);
    }
  }


  public fnZona(op: number) {

    if (op === 1) {
      this.lcboSucursal = this.lcboSucursalTotal.filter((e) => e.psCod === "001")
    }
    else if (op === 0) {
      this.lcboSucursal = this.lcboSucursalTotal.filter((e) => e.psCod !== "001")
    }

    this.fnGetPersonalFilter();

  }

  public fncontrol(evento) {

    if (evento.value === '1') {
      this.lcboSucursal = this.lcboSucursalTotal.filter((e) => e.psCod === "001")
    }
    else {
      this.lcboSucursal = this.lcboSucursalTotal.filter((e) => e.psCod !== "001")
    }

    if (this.lcboSucursal.length == 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No hay saldo para la zona elegida.',
      }).then(() => {
        this.RQFormGroup.controls.zona.setValue('');
      })
    } else {
      this.fnGetPersonalFilter();
    }

    this.tGestor = [];
    this.tGestorDS = new MatTableDataSource(this.tGestor);

  }

  //#endregion


  //#region Cambiar: Elegir Mes
  async fnChangeMes() {
    let rq = this.RQFormGroup.value;

    let hoy: Date = new Date();
    let mesActual: number = hoy.getMonth() + 1;
    let anio: number = hoy.getFullYear();

    if (Number(rq.Mes) < mesActual) {
      anio = anio + 1;
    }

    if (Number(rq.Mes) < mesActual) {
      await Swal.fire({
        icon: 'warning',
        title: 'El mes que ha elegido ya ha pasado.',
      }).then(() => {
        if (this.nEstado == 0) {
          this.RQFormGroup.controls.Mes.setValue('');
        }
        else {
          this.RQFormGroup.controls.Mes.setValue(this.MesAnterior)
        }

      })
    }

    if (this.tGestorDS.data.length > 0) {

      await this.fnListarPersonalRepetido();

      if (this.PersonalRepetido.length > 0) {

        var resp = await Swal.fire({
          title: `<strong>Las siguientes personas ya están registradas en ese mes.</strong>`,
          icon: 'question',
          html:
            `${this.sListaPersonalRep}` +
            `<b>Si continua, se borraran las personas que ya estan en ese mes.¿Desea continuar?</b>`
          ,
          showCloseButton: true,
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Si',
          cancelButtonText: 'No'
        })

        if (!resp.isConfirmed) {
          this.RQFormGroup.controls.Mes.setValue(this.MesAnterior);
          return;
        }
      }

      this.fnValidarDepChangeMes();

    }


    /* if (Number(rq.Mes) > (mesActual+1)) {
      Swal.fire({
        icon: 'warning',
        title: 'El mes que ha elegido no está permitido aún.',
      }).then(() => {
        this.RQFormGroup.controls.Mes.setValue('');
      })
    } */
    this.MesAnterior = this.RQFormGroup.controls.Mes.value;

  }
  //#endregion


  //#region Listar Personal
  async fnGetPersonalFilter() {
    let pParametro = [];
    let paramCod = [], sCod: string;

    if (this.lcboSucursal.length > 0) {
      for (let i = 0; i < this.lcboSucursal.length; i++) {
        paramCod.push(this.lcboSucursal[i].pidSuc)
      }
    }
    sCod = paramCod.join(',')

    pParametro.push(this.pais);
    pParametro.push(sCod)



    await this.service.fnSctrV2(40, pParametro, this.url).then((value: any) => {

      value.forEach(element => {
        this.arrayCiudad.push(element.sucursal_id);
        this.arrayPersonal[element.sucursal_id] = element.lPersonal
        this.arrayPersonalTotal[element.sucursal_id] = element.lPersonal
      });


    }, error => {
      console.log(error);
    });

  }
  //#endregion


  //#region cambios de lo controladores de la tablas
  fnChangeCiudad(index) {
    this.tGestorDS.data[index].partida = ''
    this.tGestorDS.data[index].depositario = ''
    this.tGestorDS.data[index].costo = ''
    this.tGestorDS.data[index].importe = ''
  }

  fnChangeCosto(index, ciudad, persona) {
    let imp = 0;
    let costo = 0;
    let mes = this.RQFormGroup.controls.Mes.value

    this.arrayPersonal[ciudad].map((e) => {
      if (e.personal_id === persona) {
        imp = e.importe;
      }
    });

    this.fnDisabled();

    costo = this.calcularPrecio(imp)

    if (mes == '06' || mes == '12') {
      this.tGestorDS.data[index].costo = 2 * (parseFloat(costo.toFixed(2)));
      this.tGestorDS.data[index].importe = imp
    }
    else {
      this.tGestorDS.data[index].costo = parseFloat(costo.toFixed(2));
      this.tGestorDS.data[index].importe = imp
    }


  }

  fnDisabled() {
    let lValidacion = [];
    let lParGen = [];
    let lPar = [];

    this.tGestorDS.data.forEach(element => {
      if (element.ciudad != '' && element.depositario != '') {
        lPar.push({
          ciudad: element.ciudad,
          depositario: element.depositario,
        })
      }
    });

    lPar.map((e) => {

      lParGen.push({
        ciudad: e.ciudad,
      })
    })

    lPar = [...new Set(lPar)];

    lPar.map((eCC) => {
      let lCa = [];
      lPar.map((e) => {
        if (eCC.ciudad === e.ciudad) {
          lCa.push(e.depositario)
        }
      })

      lValidacion.push({
        codigo: eCC.ciudad,
        lista: lCa
      })
    })


    lValidacion = [...new Set(lValidacion)];

    lValidacion.map((e) => {
      let num: number = e.codigo
      let lista = []
      lista = e.lista
      this.arrayPersonal[num].forEach(eleCat => {
        if (lista.includes(eleCat.personal_id) == true) {
          eleCat.estado = 1;
        }
        else {
          eleCat.estado = 0;
        }
      });
    })

    if (lValidacion.length === 0) {
      this.arrayCiudad.map((ci) => {
        this.arrayPersonal[ci].forEach(eleCat => {
          eleCat.estado = 0;
        });
      })
    }

  }
  //#endregion


  //#region total
  public Cantidad(): string {
    let num: number = 0;

    if (typeof this.tGestorDS === "undefined") {

    }
    else {
      this.tGestorDS.data.forEach(element => {
        if (element.costo != '') {
          num++;
        }
      });
    }
    return '' + num;
  }


  public Total(): number {
    let num: number = 0;

    if (typeof this.tGestorDS === "undefined") {

    }
    else {
      this.tGestorDS.data.forEach(element => {
        num += +element.costo
      });
    }

    return num;
  }

  public Precio(): string {
    let num: number = 0;

    if (typeof this.tGestorDS === "undefined") {

    }
    else {
      this.tGestorDS.data.forEach(element => {
        num += +element.costo
      });
    }

    let final = num.toFixed(2);


    //let final = this.fnDecimal(num);

    return final;
  }

  public fnDecimal(num: number): string {
    let anuncio: string = ''
    let numfin = +num.toFixed(2)
    anuncio = numfin.toLocaleString();
    let result = anuncio.split(',')
    let re = /\./gi;
    let numero: string = result[0].replace(re, ',')
    let decimal: string = (typeof result[1] === 'undefined' ? '00' : result[1])

    let final = numero + '.' + decimal

    return final;
  }

  calcularPrecio(nImporte: number): number {
    var salud: number, pension: number, especial: number;
    salud = Math.round(nImporte * this.parametria.mPorcSalud) / 100
    pension = Math.round(nImporte * this.parametria.mPorcPencion) / 100
    especial = Math.round(pension * this.parametria.mTasaEspecial) / 100

    return salud + pension + especial;
  }


  //#endregion


  //#region  guardar y validar la info del SCTR
  async fnValidacion(estado) {
    let pParametro = [];
    let mensaje;

    let vRQ = this.DatosFormGroup.value;

    pParametro.push(vRQ.idRQ);
    pParametro.push(this.pais);
    pParametro.push(this.id);


    if (estado === 2054 || estado === 2361) {
      mensaje = '¿Desea devolver el SCTR?';
    }
    else if (estado === 2095 || estado === 2362) {
      mensaje = '¿Desea rechazar el SCTR?';
    }
    else if (estado === 2053) {
      //estado = 2055
      mensaje = '¿Desea aprobar el SCTR?';
    }
    else {
      mensaje = '¿Desea enviar el SCTR?';
    }


    let Total = this.Total();

    if (this.sPermiso === "dueño") {
      if (Total > this.monto) {
        return Swal.fire({
          title: 'El total del SCTR excede el máximo permitido para su cargo. Por favor que su superior lo apruebe',
          confirmButtonText: `Ok`,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
          } else {
          }
        })
      }
    }

    //Si está en estado Devuelto Comercial o Rechazado Comercial
    if (estado === 2054 || estado === 2095 || estado === 2361 || estado === 2362) {
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
          this.SerGuardar(32, pParametro);
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
          this.SerGuardar(32, pParametro);
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


  async guardarSCTR() {

    if (this.DatosFormGroup.invalid) {
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar titulo'
      });
    }

    if (this.PPTOFormGroup.invalid) {
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar PPTO'
      });
    }

    if (this.RQFormGroup.invalid) {
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar el mes o de donde son'
      });
    }


    let can = this.Cantidad();

    if (can == '0') {
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar el beneficiario'
      });
    }

    if ((await this.fnValidarFilas()) == false) {
      return
    }


    let Total = this.Total();
    if (this.sPermiso === "dueño") {
      if (Total > this.monto) {
        Swal.fire({
          title: 'El total del SCTR excede el máximo permitido para su cargo. ¿Desea enviar el SCTR?',
          showCancelButton: true,
          confirmButtonText: `Si`,
          cancelButtonText: `No`,
        }).then((result) => {
          if (result.isConfirmed) {
            this.nEstado = 2052
          } else {
            this.nEstado = 2051
          }
          this.Validarguardar();
        })
      }
      else {
        Swal.fire({
          title: '¿Desea guardar y enviar el SCTR?',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: `Si`,
          denyButtonText: `Solo Guardar`,
          cancelButtonText: `No`,
        }).then((result) => {
          if (result.isConfirmed) {
            //this.nEstado = 2053
            this.nEstado = 2055
            this.btnGuardar = false;
          } else if (result.isDenied) {
            this.nEstado = 2051
          }
          else {
            return;
          }
          this.Validarguardar();
        })
      }
    }
    else {
      Swal.fire({
        title: '¿Desea guardar y enviar el SCTR?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: `Si`,
        denyButtonText: `Solo Guardar`,
        cancelButtonText: `No`,
      }).then((result) => {
        if (result.isConfirmed) {
          this.nEstado = 2052
          // this.fnGuardar(6,val,pParametro);
        } else if (result.isDenied) {
          this.nEstado = 2051
        }
        else {
          return;
        }
        this.Validarguardar();
      })
    }


  }


  Validarguardar() {
    let datos = this.DatosFormGroup.value;
    let PPTO = this.PPTOFormGroup.value;
    let Res = this.RQFormGroup.value;
    let param = [];

    param.push(datos.idRQ);
    param.push(this.Empresa);
    param.push(PPTO.idPPTO);
    param.push(this.id);
    param.push('RS');
    param.push(datos.Titulo);
    param.push(this.nEstado);
    param.push(this.parametria.nIdAseg);
    param.push(Res.Mes);
    param.push(Res.zona);
    param.push(this.pais);
    param.push(this.IdtipoCambio);

    let pLista = [];
    let lValidacion = [];
    let lCiuPar = [];
    let lParV = [];

    this.tGestorDS.data.forEach(element => {
      let pDetalle = [];
      lParV.push({
        ciudad: element.ciudad,
        partida: element.partida,
        costo: element.costo
      });
      pDetalle.push(element.ciudad);
      pDetalle.push(element.partida);
      pDetalle.push(element.depositario);
      pDetalle.push(element.costo);
      pDetalle.push(element.importe);
      if (element.costo === '') {

        return Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Falta ingresar el beneficiario'
        });
      }

      pLista.push(pDetalle.join(',')) //nIdGastoDet,nIdGastoCosto,nIdSucursal,etc
    });

    param.push(pLista.join('/'))

    //#region validar
    lParV.map((e) => {
      lCiuPar.push({
        ciudad: e.ciudad,
        partida: e.partida
      })
    })

    var hash = {};
    lCiuPar = lCiuPar.filter(function (current) {
      let go = String(current.ciudad) + String(current.partida);

      let exists = !hash[go] || false;

      hash[go] = true;

      return exists;
    });

    lCiuPar.map((eCC) => {

      let mon = 0;
      if (eCC.ciudad != "") {
        lParV.map((e) => {
          if (eCC.ciudad === e.ciudad && eCC.partida === e.partida) {
            mon += +e.costo
          }
        })

        lValidacion.push({
          ciudad: eCC.ciudad,
          partida: eCC.partida,
          costoTotal: mon
        })
      }
    })

    let params = [];
    let paramsDet = [];
    params.push(PPTO.idPPTO);
    params.push(Res.zon);
    lValidacion.map((e) => {
      let paramsLis = [];
      paramsLis.push(e.ciudad);
      paramsLis.push(e.partida);
      paramsLis.push(e.costoTotal);
      paramsDet.push(paramsLis.join(','))

    })
    params.push(paramsDet.join('/'))

    //#endregion

    this.spinner.show();
    this.validacionPorCIUDADPARTIDA(params).then((valor: boolean) => {
      if (valor) {
        this.SerGuardar(30, param);
      }
      else {
        this.spinner.hide();
        return Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'La partida SCTR no tiene  saldo suficiente'
        });
      }
    });


  }

  //#region Validar Por Ciudad-Partida
  private async validacionPorCIUDADPARTIDA(params) {
    var flag: boolean = false;

    await this.service.fnSctrV2(29, params, this.url).then((value: any) => {
      if (value[0] === '1') {
        flag = true
      }
    }, error => {
      this.spinner.hide();
      console.log(error);
    });

    return flag;

  }
  //#endregion


  //#region Servicio Guardar
  private async SerGuardar(op: number, params) {

    await this.service.fnSctrV2(op, params, this.url).then((value: any) => {

      let a = value[0];
      let mensaje = value[1];
      let ParCod = a.split('-');
      if (op === 30) {

        if (ParCod[0] === '1') {
          this.DatosFormGroup.controls.idRQ.setValue(ParCod[1]);
          this.DatosFormGroup.controls.NroRQ.setValue(ParCod[2]);
          this.nEstado = ParCod[3]
          this.DatosFormGroup.controls.Estado.setValue(ParCod[4]);

          this.fnEnviarCorreo();

        }
        else if (ParCod[0] === '2') {
        }
        else {

        }
        Swal.fire({
          icon: 'success',
          text: mensaje
        });
      }
      else {

        this.nEstado = ParCod[1]
        this.DatosFormGroup.controls.Estado.setValue(ParCod[2]);
        this.fnEnviarCorreo();

        Swal.fire({
          icon: 'success',
          text: mensaje
        });
      }

      this.fnChangeButton();

    }, error => {
      this.spinner.hide();
      console.log(error);
    });
    this.spinner.hide();


  }
  //#endregion


  //#endregion


  //#region Historico de Estado
  async fnVerEstado() {
    let vRQ = this.DatosFormGroup.value;
    let pParametro = [];
    pParametro.push(vRQ.idRQ);

    if (vRQ.idGasto != '') {
      this.spinner.show();
      await this.vSerEfectivo.fnEfectivo(10, pParametro, this.url).then((value: Estado[]) => {

        const dialogRef = this.dialog.open(EstadoefectivoComponent, {
          width: '50rem',
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
  //#endregion


  //#region Salir
  salir() {
    this.enviar.emit('');
  }
  //#endregion


  //#region Descargar Excel
  async fnDescargarExcel() {

    let pParametro = [];
    let nIdGastoCosto = this.DatosFormGroup.controls.idRQ.value
    pParametro.push(nIdGastoCosto);
    pParametro.push(this.id);
    pParametro.push(this.pais);

    this.service.fnDescargarExcelBrocker(35, pParametro, this.url).subscribe(
      data => {

        if (data.size == 14) {
          Swal.fire('Atención', 'No se encontraron reportes', 'warning')
          this.spinner.hide()
          return
        }
        else {
          this.downloadFile(data)
        }
      }
    )
  }

  public downloadFile(response: any) {
    let name = 'XLS Broker';
    var blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, name + '.xlsx')
    this.spinner.hide();
  }
  //#endregion


  //#region Abrir Modal PDF
  async fnAbrirModalPDF(nTipo) {
    let NroRQ
    //nTipo : 1->Tesoreria, 2->Comercial

    let nIdGastoCosto = this.DatosFormGroup.controls.idRQ.value
    NroRQ = this.DatosFormGroup.controls.NroRQ.value
    let NroPPTO = this.PPTOFormGroup.controls.NroPPTO.value


    NroRQ = NroRQ.slice(NroRQ.length - 5, NroRQ.length);

    const dialogRef = this.dialog.open(DialogPdfComponent, {
      width: '50rem',
      data: {
        nIdGastoCosto: nIdGastoCosto, //0:Nuevo , 1:Editar
        NroRQ: NroRQ,
        nTipo: nTipo,
        NroPPTO: NroPPTO
      },
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }
  //#endregion


  //#region Listar Perfiles
  async fnGetPerfil() {
    let pParametro = [];

    pParametro.push(this.Empresa);
    pParametro.push(this.id)

    await this.service.fnSctrV2(38, pParametro, this.url).then((value: any) => {

      if (value.length > 0) {
        for (let i = 0; i < value.length; i++) {
          if (value[i].nIdPerfil == 2631 || value[i].nIdPerfil == 2632) {
            this.bPerfilTes = true;
            break;
          }
        }
      }

    }, error => {
      console.log(error);
    });

  }
  //#endregion


  //#region Enviar Correo
  async fnEnviarCorreo() {

    let nIdGastoCosto = this.DatosFormGroup.controls.idRQ.value

    let pParametro = [];

    pParametro.push(this.pais);
    pParametro.push(this.Empresa);
    pParametro.push(this.id)
    pParametro.push(nIdGastoCosto)

    await this.service.fnSctrV2(41, pParametro, this.url).then((value: any) => {


    }, error => {
      console.log(error);
    });

  }
  //#endregion


  //#region Validación Presupuestos
  async fnValidarPresupuesto(nTipoValidacion, nParam, sParam) {
    let bValidar: boolean;

    //nTipoValidación -> 1:Aprobado | 2:Modificable/Facturado
    if (nTipoValidacion == 1) {
      if (nParam == 2127) {
        bValidar = true
      }
      else {
        bValidar = false
        Swal.fire({
          icon: 'warning',
          title: 'El ppto indicado no está aprobado por control de costos.'
        });
      }
    }
    else if (nTipoValidacion == 2) {
      if (nParam == 2073 || nParam == 2076) {
        bValidar = true
      }
      else {
        bValidar = false
        Swal.fire({
          icon: 'warning',
          title: `No puede utilizar el ppto porque tiene estado: ${sParam}`
        });
      }
    }

    return bValidar
  }


  //#endregion


  //#region Validar Filas Completas 
  async fnValidarFilas() {
    let bValidar: boolean = true;
    let tamanio: number;

    tamanio = this.tGestorDS.data.length
    let lista = this.tGestorDS.data

    if (tamanio > 0) {
      for (let i = 0; i < lista.length; i++) {
        if ((lista[i].ciudad == null || lista[i].ciudad == "") || (lista[i].partida == null || lista[i].partida == "") ||
          (lista[i].depositario == null || lista[i].depositario == "") || (lista[i].depositario == null || lista[i].depositario == "")) {
          bValidar = false;
          Swal.fire({
            title: 'Complete toda la información de las filas creadas',
            icon: 'warning'
          })
          break;
        }

      }
    }

    return bValidar
  }
  //#endregion


  //#region Validar Depositario
  async fnValidarDepositario(index, ciudad, depositario, tipo) {
    //Tipo 0 : Desde depositario , Tipo 1: Desde mes

    let pParametro = [];

    pParametro.push(depositario);
    pParametro.push(this.RQFormGroup.controls.Mes.value);

    await this.service.fnSctrV2(44, pParametro, this.url).then((value: any) => {

      if (value[0] == 0) {
        if (tipo == 0) {
          Swal.fire({
            icon: 'warning',
            title: value[1]
          })

          this.tGestorDS.data[index].depositario = ""
          this.tGestorDS.data[index].costo = ""
          this.tGestorDS.data[index].importe = ""
        }
        else if (tipo == 1) {
          this.btnEliminarPorIndex(index);
        }

      }
      else if (value[0] == 1) {
        this.fnChangeCosto(index, ciudad, depositario)
      }

    }, error => {
      console.log(error);
    });
  }

  //#endregion


  //#region Meses
  fnCargarMeses() {
    let pParametro = [];

    this.service.fnSctrV2(45, pParametro, this.url).then((value: any) => {

      this.mes = value;

      this.zona.push({ cod: '1', mes: 'Central', activo: 0 })
      this.zona.push({ cod: '0', mes: 'Provincia', activo: 0 })

    }, error => {
      console.log(error);
    });

  }
  //#endregion


  //#region Validar Despues de Cambio de Mes
  async fnValidarDepChangeMes() {

    let tamanio: number;

    tamanio = this.tGestorDS.data.length
    let lista = this.tGestorDS.data

    if (tamanio > 0) {
      for (let i = 0; i < lista.length; i++) {
        this.fnValidarDepositario(i, lista[i].ciudad, lista[i].depositario, 1)
      }
    }

  }
  //#endregion


  //#region Listar Personal Repetido
  async fnListarPersonalRepetido() {
    let pParametro = [];
    let lista = this.tGestorDS.data
    this.PersonalRepetido = []
    this.sListaPersonalRep = ''
    let nIdGastoCosto = this.DatosFormGroup.controls.idRQ.value

    pParametro.push(this.RQFormGroup.controls.Mes.value);
    pParametro.push(nIdGastoCosto);

    await this.service.fnSctrV2(46, pParametro, this.url).then((value: any) => {

      for (let i = 0; i < value.length; i++) {
        for (let j = 0; j < lista.length; j++) {
          if (value[i].nIdDepositario == lista[j].depositario) {
            this.PersonalRepetido.push(lista[j].depositario);
            this.sListaPersonalRep = value[i].sNombreDepositario + '</br>'
          }

        }
      }


    }, error => {
      console.log(error);
    });

  }
  //#endregion


  //#region Eliminar Fila por Index
  btnEliminarPorIndex(index) {
    this.tGestor = this.tGestor.filter(filtro => filtro != this.tGestorDS.data[index]);
    this.tGestorDS = new MatTableDataSource(this.tGestor);
  }
  //#endregion


}
