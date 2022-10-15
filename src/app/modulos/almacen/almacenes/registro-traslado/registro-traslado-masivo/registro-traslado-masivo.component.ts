import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { Almacen_RI, Presupuesto_Almacen, TipoCambio_RI } from '../../registro-ingreso/models/listasIngreso.model';
import { Listas_RT } from '../models/listasTraslado.model';
import { Registro_Traslado_Detalle } from '../models/registroTraslado.model';
import { RegistroTrasladoService } from '../registro-traslado.service';


@Component({
  selector: 'app-registro-traslado-masivo',
  templateUrl: './registro-traslado-masivo.component.html',
  styleUrls: ['./registro-traslado-masivo.component.css'],
  providers: [DecimalPipe]
})
export class RegistroTrasladoMasivoComponent implements OnInit {

  formTraslado: FormGroup;

  bRegistrado: boolean = false;
  //Listas para llenar los combos 
  lSolicitante: Listas_RT[] = [];
  lPresupuesto: Presupuesto_Almacen[] = [];
  lAlmacen: Almacen_RI[] = [];
  lPresupuestoDestino: Presupuesto_Almacen[] = [];
  lOpLogistica: Listas_RT[] = [];

  vMoneda: Listas_RT;
  vTipoCambio: TipoCambio_RI;

  nIdRegistro: number;
  vRegistroDetalle: Registro_Traslado_Detalle;

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  matcher = new ErrorStateMatcher();

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vRegTraslado: RegistroTrasladoService,
    private cdr: ChangeDetectorRef,
    private decimalPipe: DecimalPipe,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<RegistroTrasladoMasivoComponent>,
    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; }

  async ngOnInit(): Promise<void> {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formTraslado = this.formBuilder.group({
      cboSolicitante: ['', Validators.required],
      cboPresupuesto: ['', Validators.required],
      cboPresupuestoDestino: ['', Validators.required],
      txtCliente: [''],

      cboAlmacen: ['', Validators.required],
      cboOperacionLogistica: ['', Validators.required],

      txtEstado: [''],
      txtAlmacenDestino: [''],
      txtFecha: [moment().format('DD/MM/YYYY')],
      txtNumDoc: ['']
    })

  }

  ngAfterViewInit() {
    setTimeout(async () => {

      //Para que no haya error de ngAfterContentChecked
      await this.fnListarSolicitante();
      await this.fnListarAlmacen();
      await this.fnListarMoneda();
      await this.fnListarTipoCambio();
    });
  }

  //#region Listados para los combos

  async fnListarSolicitante() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;

    pParametro.push(this.idEmp);

    try {
      this.lSolicitante = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarPresupuesto(pSolicitante: Listas_RT) {

    //Vaciando los controles que dependen del solicitante
    this.formTraslado.controls.cboPresupuesto.setValue('');
    this.formTraslado.controls.txtCliente.setValue('');
    this.formTraslado.controls.cboPresupuestoDestino.setValue('');

    this.spinner.show();

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;

    pParametro.push(pSolicitante.nId);

    try {
      this.lPresupuesto = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarPresupuestoDestino(pPres: Presupuesto_Almacen) {
    //Vaciando los controles que dependen del solicitante
    this.formTraslado.controls.cboPresupuestoDestino.setValue('');

    this.spinner.show();

    var vDatos = this.formTraslado.value;

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;

    pParametro.push(vDatos.cboSolicitante.nId);
    pParametro.push(pPres.nId);

    try {
      this.lPresupuestoDestino = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }
  async fnListarAlmacen() {

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;

    pParametro.push(this.idUser)
    pParametro.push(this.pPais);

    try {
      this.lAlmacen = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarOpLogistica(pAlmacen: Almacen_RI) {

    this.formTraslado.controls.cboOperacionLogistica.setValue('');

    this.spinner.show();

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;
    pParametro.push(pAlmacen.nId);

    try {
      this.lOpLogistica = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      if (this.lOpLogistica.length > 0) { this.formTraslado.controls.cboOperacionLogistica.setValue(this.lOpLogistica[0].nId); }

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarMoneda() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 6;

    pParametro.push(this.pPais);

    try {
      var lMoneda = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      if (lMoneda.length > 0) { this.vMoneda = lMoneda[0] }

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarTipoCambio() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 7;

    pParametro.push(this.pPais);
    pParametro.push(moment().format('YYYY-MM-DD'))    //2021-01-27

    try {
      var lTipo = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      if (lTipo.length > 0) { this.vTipoCambio = lTipo[0] }

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }
  //#endregion

  //#region Llenado de inputs
  fnLLenarCliente(p: Presupuesto_Almacen) {
    if (p == null) { return; }
    this.formTraslado.controls.txtCliente.setValue(p.sCliente);
  }

  fnLlenarAlmacenDestino(p: Almacen_RI) {
    if (p == null) { return; }
    this.formTraslado.controls.txtAlmacenDestino.setValue(p.sDescripcion);
  }
  //#endregion

  //#region  Agregar registro
  async fnGuardar() {
    if (this.formTraslado.invalid) {
      this.formTraslado.markAllAsTouched();
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning');
      return;
    }

    var vDatos = this.formTraslado.getRawValue();

    if (vDatos.cboPresupuesto.nId == vDatos.cboPresupuestoDestino.nId) {
      Swal.fire('¡Verificar!', 'El presupuesto origen y presupuesto destino no pueden ser iguales!', 'warning')
      return;
    }

    //Consultamos si el usuario va a hacer picking en ubicacion o no
    var nSinPicking: boolean, mensajePregunta: string;
    mensajePregunta = 'Una vez que se agregue el registro no se podrán realizar cambios'

    try {
      nSinPicking = await this.fnSinPicking(vDatos.cboAlmacen.nId, this.idUser)
    } catch (err) {
      return;
    }

    if (nSinPicking) {
      mensajePregunta += ', Nota: <br>';
    }

    if (nSinPicking) {
      mensajePregunta += `No se va a alterar ubicación en el almacén indicado.`
    }

    var resp = await Swal.fire({
      title: '¿Desea continuar?',
      html: mensajePregunta,
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

    this.spinner.show();
    const bHaySaldo = await this.fnValidarSaldo(vDatos.cboPresupuesto.nId, vDatos.cboAlmacen.nId)

    //Si no hay saldo retornamos 
    if (!bHaySaldo) {
      Swal.fire('¡Verificar!', 'No hay saldo en el presupuesto de origen y almacen origen seleccionados', 'warning')
      this.spinner.hide();
      return;
    }

    var pEntidad = 2;
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(this.pPais);
    pParametro.push(vDatos.cboOperacionLogistica);
    pParametro.push(vDatos.cboAlmacen.nId);
    pParametro.push(vDatos.cboPresupuesto.nId);
    pParametro.push(vDatos.cboAlmacen.nId);
    pParametro.push(vDatos.cboPresupuestoDestino.nId);
    pParametro.push(moment().format('MM/DD/YYYY'));
    pParametro.push(vDatos.cboSolicitante.nId);

    pParametro.push(this.vMoneda.nId);
    pParametro.push(this.vTipoCambio.nId);

    pParametro.push('');
    pParametro.push(this.idUser);

    try {
      var { result } = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      if (Number(result) == 0) {
        Swal.fire('Error', 'No se pudo realizar el registro: Verifique su conexion a Internet', 'error');
        this.spinner.hide();
        return;
      }

      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se guardo el registro',
        showConfirmButton: false,
        timer: 1500
      });

      this.nIdRegistro = result;
      this.formTraslado.controls.cboSolicitante.disable();
      this.formTraslado.controls.cboPresupuesto.disable();
      this.formTraslado.controls.cboAlmacen.disable();
      this.formTraslado.controls.cboOperacionLogistica.disable();
      this.formTraslado.controls.cboPresupuestoDestino.disable();
      this.bRegistrado = true;
      await this.fnListarRegistroDetalle(this.nIdRegistro);

      this.spinner.hide();

    } catch (err) {
      console.log(err);
      this.spinner.hide();
    }
  }
  //#endregion

  async fnValidarSaldo(nIdCentroCosto: number, nIdAlmacen: number): Promise<boolean> {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 8;

    pParametro.push(nIdCentroCosto);
    pParametro.push(nIdAlmacen);

    try {
      const lArticulo = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
      if (lArticulo.length > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      this.spinner.hide();
      return false;
    }
  }

  async fnListarRegistroDetalle(nId: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 12;

    pParametro.push(nId);

    try {
      const lRegistro = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.vRegistroDetalle = lRegistro[0];

      this.formTraslado.controls.txtNumDoc.setValue(this.vRegistroDetalle.sOperacion.split('-')[0].trim() + '-' + this.vRegistroDetalle.sNumeroDoc);

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  //#region Funcion de validacion


  async fnTraerSaldo(valor: any, tipo: string) {
    var vCentroCosto: Presupuesto_Almacen, vAlmacen: Almacen_RI;
    if (tipo == 'ALM') {
      //Si esta en el ng-select del almacen validamos que haya valor en el CC
      vCentroCosto = this.formTraslado.controls.cboPresupuesto.value;
      if ((vCentroCosto as any) == '') {
        return;
      }
      vAlmacen = valor;

      var bHaySaldo = await this.fnValidarSaldo(vCentroCosto.nId, vAlmacen.nId)
      if (!bHaySaldo) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia!',
          text: `El presupuesto: ${vCentroCosto.sDescripcion}, y el almacén: ${vAlmacen.sDescripcion}, no cuentan con saldo disponible.`,
        });
      }


    } else if (tipo == 'CC') {
      //Si esta en el ng-select del CC validamos que haya valor en el almacen
      vAlmacen = this.formTraslado.controls.cboAlmacen.value;

      if ((vAlmacen as any) == '') {
        return;
      }
      vCentroCosto = valor;

      var bHaySaldo = await this.fnValidarSaldo(vCentroCosto.nId, vAlmacen.nId)
      if (!bHaySaldo) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia!',
          text: `El presupuesto: ${vCentroCosto.sDescripcion}, y el almacén: ${vAlmacen.sDescripcion}, no cuentan con saldo disponible.`,
        });
      }
    }
  }

  //#endregion

  //#region Preguntar si el usuario hace picking o no
  async fnSinPicking(nIdAlmacen: number, nIdUsuario): Promise<boolean> {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 20;

    pParametro.push(nIdAlmacen);
    pParametro.push(nIdUsuario);

    try {
      const { nSinPicking } = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
      if (nSinPicking == 1) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.spinner.hide();
      console.log(error);
      throw error;
    }
  }
  //#endregion
}
