import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { Registro_Salida_Detalle } from '../../registro-salida/models/registroSalida.model';
import { RegistroSalidaService } from '../../registro-salida/registro-salida.service';
import { RegistroTrasladoService } from '../../registro-traslado/registro-traslado.service';
import { GuiaIngresoFileComponent } from '../guia-ingreso-file/guia-ingreso-file.component';
import { Almacen_RI, Articulo_RI, Direccion_Proveedor, Lista_Registro_Ingreso, Presupuesto_Almacen, TipoCambio_RI } from '../models/listasIngreso.model';
import { Detalle_Articulo, Registro_Ingreso_Detalle, Ubicacion_Articulo } from '../models/registroIngreso.models';
import { RegistroIngresoService } from '../registro-ingreso.service';
import { ArticuloModalDetalleComponent } from './articulo-modal-detalle/articulo-modal-detalle.component';
import { ArticuloModalNotaComponent } from './articulo-modal-nota/articulo-modal-nota.component';
import { ArticuloModalComponent } from './articulo-modal/articulo-modal.component';
import { ArticuloUbicacionComponent } from './articulo-ubicacion/articulo-ubicacion.component';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}
@Component({
  selector: 'app-registro-ingreso-detalle',
  templateUrl: './registro-ingreso-detalle.component.html',
  styleUrls: ['./registro-ingreso-detalle.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    DecimalPipe
  ],
  animations: [asistenciapAnimations]
})
export class RegistroIngresoDetalleComponent implements OnInit {

  tsLista = 'active';  // Inicia la lista abierta
  abLista = 0;

  //Variables para cerrar y abrir acordeon
  @ViewChild('matExpUbicacion') matExpUbicacion: MatExpansionPanel;
  @ViewChild('matExpUbicacionDetalle') matExpUbicacionDetalle: MatExpansionPanel;
  @ViewChild('matExpUbicacionNota') matExpUbicacionNota: MatExpansionPanel;

  formIngreso: FormGroup;
  formIngresoDetalle: FormGroup;
  formNotaIngreso: FormGroup;

  sTitulo = 'Ingreso de Mercadería al Almacén'
  //Listas para llenar los combos 
  lSolicitante: Presupuesto_Almacen[] = [];
  lPresupuesto: Presupuesto_Almacen[] = [];
  lAlmacen: Almacen_RI[] = [];
  lOpLogistica: Lista_Registro_Ingreso[] = [];
  lProveedor: Lista_Registro_Ingreso[] = [];
  lPuntoRecup: Direccion_Proveedor[] = [];
  lTipoGuia: Lista_Registro_Ingreso[] = [];
  lDocGuia: Lista_Registro_Ingreso[] = [];
  lDetalle: Detalle_Articulo[] = [];
  lUbicacionArticulo: Ubicacion_Articulo[] = [];
  lUbicacionesAlmacen: Lista_Registro_Ingreso[] = [];
  vEmpresaActual: Lista_Registro_Ingreso;
  vMoneda: Lista_Registro_Ingreso;
  vTipoCambio: TipoCambio_RI;
  lArticulosOC: Articulo_RI[] = [];//Para listar los articulos cuando sea una OC

  vRegistroDetalle: Registro_Ingreso_Detalle;

  vRegistroSalida: Registro_Salida_Detalle;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Detalle_Articulo>;
  displayedColumns = ['opcion', 'sArticulo', 'sLote', 'sFechaExpira', 'sUndMedida', 'nStock', 'nUnidades',
    'sZona', 'nCostoUnit', 'nCostoTotal'];

  //Variables para interaccion entre componentes
  @Input() pIdRegistro: number;
  @Input() bEsGuiaSalida: boolean;
  @Input() bEsOrdenCompra: boolean;
  @Input() bEsGuiaLucky: boolean;
  @Input() bEsNotaIngreso: boolean;
  @Input() bEsNotaRecojo: boolean;
  @Input() bEsNotaDetalle: boolean;
  @Output() pMostrar = new EventEmitter<number>();

  bDuplicar: boolean = false;

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  matcher = new ErrorStateMatcher();

  bMostrarUbicacion: boolean = true;

  bEsLogisticoSatelite = false;

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vRegIngreso: RegistroIngresoService,
    private vRegSalida: RegistroSalidaService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private vRegTraslado: RegistroTrasladoService,
    @Inject('BASE_URL') baseUrl: string,
    private decimalPipe: DecimalPipe,
  ) { this.url = baseUrl; }

  async ngOnInit(): Promise<void> {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formIngreso = this.formBuilder.group({
      cboSolicitante: ['', Validators.required],
      cboPresupuesto: ['', Validators.required],
      txtCliente: [''],
      cboAlmacen: ['', Validators.required],
      cboOperacionLogistica: ['', Validators.required],
      cboFechaIngreso: [moment(), Validators.required],
      cboProveedor: ['', Validators.required],
      cboPuntoRecup: ['', Validators.required],
      txtUbicación: [''],
      txtDireccion: [''],

      //Guia de referencia
      cboTipoGuia: ['', Validators.required],
      txtNumGuia1: ['', [Validators.required, Validators.pattern(/^[0-9]\d*$/)]],
      txtNumGuia2: ['', [Validators.required, Validators.pattern(/^[0-9]\d*$/)]],

      //2do doc de referencia
      cboDocGuia: ['', Validators.required],
      txtDocGuia1: ['', Validators.pattern(/^[0-9]\d*$/)],
      txtDocGuia2: ['', Validators.pattern(/^[0-9]\d*$/)],

      //Campos varios
      txtObservacion: ['', this.caracterValidator],
      txtTotalUnd: [0],
      txtTotalPeso: [0],
      txtTotalVolumen: [0],
      txtTotalPrecio: [0],

      //Campos de auditoria
      txtNumero: [''],
      txtEstado: [''],
      txtDocRef: [''],
      txtRegistro: [''],
      txtFechaRegistro: [''],
    })

    this.formIngresoDetalle = this.formBuilder.group({
      txtSolicitante: [''],
      txtPresupuesto: [''],
      txtCliente: [''],
      txtAlmacen: [''],
      txtOperacionLogistica: [''],
      txtFechaIngreso: [''],
      txtProveedor: [''],
      txtPuntoRecup: [''],
      txtUbicación: [''],
      txtDireccion: [''],
      txtGuiaRef: [''],
      txtFactRef: [''],

      //Campos varios
      txtObservacion: ['', this.caracterValidator],
      txtObservacionDocRef: [''],
      txtTotalUnd: [0],
      txtTotalPeso: [0],
      txtTotalVolumen: [0],
      txtTotalPrecio: [0],

      //Campos de auditoria
      txtNumero: [''],
      txtEstado: [''],
      txtDocRef: [''],
      txtRegistro: [''],
      txtFechaRegistro: [''],

      cboOperacionLogistica: ['', Validators.required],
      cboFechaIngreso: [moment(), Validators.required],
      cboAlmacen: ['', Validators.required],
      cboPuntoRecup: ['', Validators.required],
      //Guia de referencia
      cboTipoGuia: ['', Validators.required],
      txtNumGuia1: ['', [Validators.required, Validators.pattern(/^[0-9]\d*$/)]],
      txtNumGuia2: ['', [Validators.required, Validators.pattern(/^[0-9]\d*$/)]],

      //2do doc de referencia
      cboDocGuia: ['', Validators.required],
      txtDocGuia1: ['', Validators.pattern(/^[0-9]\d*$/)],
      txtDocGuia2: ['', Validators.pattern(/^[0-9]\d*$/)],
    })

    this.formNotaIngreso = this.formBuilder.group({
      txtSolicitante: [''],
      txtPresupuesto: [''],
      txtCliente: [''],
      txtAlmacen: [''],
      cboOperacionLogistica: ['', Validators.required],
      txtFechaIngreso: [''],
      cboProveedor: ['', Validators.required],
      cboPuntoRecup: ['', Validators.required],
      txtUbicación: [''],
      txtDireccion: [''],

      //Guia de referencia
      cboTipoGuia: ['', Validators.required],
      txtNumGuia1: ['', [Validators.required, Validators.pattern(/^[0-9]\d*$/)]],
      txtNumGuia2: ['', [Validators.required, Validators.pattern(/^[0-9]\d*$/)]],

      //2do doc de referencia
      cboDocGuia: ['', Validators.required],
      txtDocGuia1: ['', Validators.pattern(/^[0-9]\d*$/)],
      txtDocGuia2: ['', Validators.pattern(/^[0-9]\d*$/)],

      //Campos varios
      txtObservacion: ['', this.caracterValidator],
      txtObservacionDocRef: [''],
      txtTotalUnd: [0],
      txtTotalPeso: [0],
      txtTotalVolumen: [0],
      txtTotalPrecio: [0],

      //Campos de auditoria
      txtNumero: [''],
      txtEstado: [''],
      txtDocRef: [''],
      txtRegistro: [''],
      txtFechaRegistro: [''],
    });

    this.onToggleFab(1, -1);
    await this.fnEvaluarDocumento()
    await this.fnRevisarTipoUsuario();
  }


  //#region Evaluar documento
  async fnEvaluarDocumento() {
    if (this.bEsGuiaSalida) {
      //cuando se va a anular una guia de salida
      this.sTitulo = 'Ingreso de Mercadería al Almacén por anulación'
      await this.fnListarRegistroSalidaDetalle(this.pIdRegistro);
      await this.fnListarArticulosDetalle(this.pIdRegistro);
      await this.fnListarUbicacionArticuloRS(this.pIdRegistro);
      await this.fnListarMoneda();
      await this.fnListarTipoCambio();
    } else if (this.bEsOrdenCompra) {
      //cuando se va a procesar una OC 
      await this.fnListarOrdenCompra(this.pIdRegistro);
      await this.fnListarAlmacen();
      await this.fnListarDireccion({ nId: this.vRegistroDetalle.nIdProveedor, sDescripcion: '' });
      await this.fnListarTipoDocGR();
      await this.fnListarTipoDocFV();
      await this.fnTraerEmpresaActual();
      this.formIngresoDetalle.controls.cboTipoGuia.setValue(this.lTipoGuia[0].nId);
      this.formIngresoDetalle.controls.cboDocGuia.setValue(this.lDocGuia[0].nId);
      await this.fnListarArticulosOC(this.pIdRegistro)
      await this.fnListarTipoCambio()
      await this.fnListarMoneda()

    } else if (this.bEsGuiaLucky) {

      await this.fnListarRegistroGuiaLuckyDetalle(this.pIdRegistro);
      await this.fnListarAlmacenGuiaLucky();
      await this.fnListarMoneda();
      await this.fnListarTipoCambio();
      await this.fnListarTipoDocFV();
      this.formIngresoDetalle.controls.cboDocGuia.setValue(this.lDocGuia[0].nId);
      await this.fnTraerEmpresaActual();

      if (this.lAlmacen.length > 0) {
        var vAlmacen = this.lAlmacen[0];
        this.formIngresoDetalle.controls.cboAlmacen.setValue(vAlmacen);
        this.fnMostrarUbicacion(vAlmacen);
        await this.fnListarOpLogistica(vAlmacen)
        if (this.lOpLogistica.length > 0) {
          var vOpLog = this.lOpLogistica[0];
          this.formIngresoDetalle.controls.cboOperacionLogistica.setValue(vOpLog.nId);

        }
      }
    } else if (this.bEsNotaIngreso) {
      await this.fnListarRegistroNotaDetalle(this.pIdRegistro);
      await this.fnListarProveedor();
      await this.fnListarMoneda();
      await this.fnListarTipoCambio();
      await this.fnListarTipoDocGR();
      await this.fnListarTipoDocFV();
      this.formNotaIngreso.controls.cboTipoGuia.setValue(this.lTipoGuia[0].nId);
      this.formNotaIngreso.controls.cboDocGuia.setValue(this.lDocGuia[0].nId);
      await this.fnTraerEmpresaActual();
      await this.fnListarOpLogistica({ nId: this.vRegistroDetalle.nIdAlmacen, sDescripcion: '' })

    } else if (this.bEsNotaRecojo) {
      await this.fnListarRegistroNotaRecojoDetalle(this.pIdRegistro);
      await this.fnListarArticulosNotaRecojo(this.pIdRegistro);
      await this.fnListarProveedor();
      await this.fnListarMoneda();
      await this.fnListarTipoCambio();
      await this.fnListarTipoDocGR();
      await this.fnListarTipoDocFV();
      this.formNotaIngreso.controls.cboTipoGuia.setValue(this.lTipoGuia[0].nId);
      this.formNotaIngreso.controls.cboDocGuia.setValue(this.lDocGuia[0].nId);
      await this.fnTraerEmpresaActual();
      await this.fnListarOpLogistica({ nId: this.vRegistroDetalle.nIdAlmacen, sDescripcion: '' })
      await this.fnListarUbicacion(this.vRegistroDetalle.nIdAlmacen)

    } else if (this.bEsNotaDetalle) {
      // Detalle Notas Rechazadas y Devuelta
      await this.fnListarNotaDetalle(this.pIdRegistro);
      await this.fnListarNotaArticulosDetalle(this.pIdRegistro);
    } else {
      if (this.pIdRegistro != 0) {
        //Cuando se va a ver detalle se llenan los datos
        await this.fnListarRegistroDetalle(this.pIdRegistro);
        await this.fnListarArticulosDetalle(this.pIdRegistro);
        await this.fnListarUbicacionArticulo(this.pIdRegistro);
      } else {
        //Cuando se va a registrar
        await this.fnListarPresupuesto();
        await this.fnListarAlmacen();
        await this.fnListarProveedor();
        await this.fnListarTipoDocGR();
        await this.fnListarTipoDocFV();
        await this.fnListarMoneda();
        await this.fnListarTipoCambio();
        await this.fnTraerEmpresaActual();
        this.formIngreso.controls.txtFechaRegistro.setValue(moment().format('DD/MM/YYYY'))
        this.formIngreso.controls.txtEstado.setValue('Pendiente')
        this.formIngreso.controls.txtRegistro.setValue(this.pNom)
      }
    }
  }
  //#endregion

  //#region Listados para combos
  async fnListarPresupuesto() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;
    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);

    try {
      this.lPresupuesto = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
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
    var pTipo = 4;

    pParametro.push(this.idUser);
    pParametro.push(this.pPais);

    try {
      this.lAlmacen = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();

      //Si es orden de compra solo acepta los alm. valorados
      if (this.bEsOrdenCompra) {
        this.lAlmacen = this.lAlmacen.filter(item => item.nTipoAlmacen == 1851)
      }
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarProveedor() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 6;

    pParametro.push(this.pPais);
    pParametro.push(this.idUser);

    try {
      this.lProveedor = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarSolicitante(p: Presupuesto_Almacen) {

    this.formIngreso.controls.cboSolicitante.setValue('');

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 5;
    pParametro.push(p.nId);

    try {
      this.lSolicitante = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarOpLogistica(pAlmacen: Lista_Registro_Ingreso) {

    this.formIngreso.controls.cboOperacionLogistica.setValue('');
    this.formIngresoDetalle.controls.cboOperacionLogistica.setValue('');

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;
    pParametro.push(pAlmacen.nId);
    pParametro.push(this.bEsGuiaSalida ? 2270 : 1965);

    try {
      this.lOpLogistica = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarDireccion(pProveedor: Lista_Registro_Ingreso) {
    this.formIngreso.controls.cboPuntoRecup.setValue('');
    this.formIngreso.controls.txtDireccion.setValue('');
    this.formIngreso.controls.txtUbicación.setValue('');

    this.formNotaIngreso.controls.cboPuntoRecup.setValue('');
    this.formNotaIngreso.controls.txtDireccion.setValue('');
    this.formNotaIngreso.controls.txtUbicación.setValue('');

    this.spinner.show();
    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 11;
    pParametro.push(pProveedor.nId);
    pParametro.push(this.idUser);

    try {
      this.lPuntoRecup = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarTipoDocGR() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 14;

    try {
      this.lTipoGuia = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.formIngreso.controls.cboTipoGuia.setValue(this.lTipoGuia[0].nId);

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarTipoDocFV() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 13;

    try {
      this.lDocGuia = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.formIngreso.controls.cboDocGuia.setValue(this.lDocGuia[0].nId);
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
    var pTipo = 12;

    pParametro.push(this.pPais);

    try {
      var lMoneda = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
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
    var pTipo = 9;

    pParametro.push(this.pPais);
    pParametro.push(moment().format('YYYY-MM-DD'))    //2021-01-27

    try {
      var lTipo = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      if (lTipo.length > 0) { this.vTipoCambio = lTipo[0] }

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnTraerEmpresaActual() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 19;
    pParametro.push(this.idEmp);

    try {
      const lEmpresa = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      if (lEmpresa.length > 0) { this.vEmpresaActual = lEmpresa[0] }

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  //#endregion

  //#region Funcion para añadir el registro
  async fnGuardar() {
    if (this.formIngreso.invalid) {
      this.formIngreso.markAllAsTouched();
      this.matExpUbicacion.open();
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    var vDatos = this.formIngreso.getRawValue();
    var txtDocGuia1 = vDatos.txtDocGuia1 ?? '';
    var txtDocGuia2 = vDatos.txtDocGuia1 ?? '';

    if (txtDocGuia1 != 0 || txtDocGuia2 != 0) {
      if (txtDocGuia1 == 0 || txtDocGuia2 == 0) {
        Swal.fire('¡Verificar!', 'Indique los datos de la FV', 'warning')
        return;
      }
    }

    if (this.lDetalle.length <= 0) {
      Swal.fire('¡Verificar!', 'Ingrese por lo menos un articulo al registro', 'warning')
      return;
    }

    //Validando que los articulos tengan lote y fecha ingreso
    let msjArticulo = '';

    for (let detalle of this.lDetalle) {
      if (detalle.sLote == '') {
        msjArticulo = `El artículo: ${detalle.sArticulo}, no tiene lote!`
        break;
      }
    }
    if (msjArticulo != '') {
      Swal.fire('¡Verificar!', msjArticulo, 'warning')
      return;
    }

    if (this.bMostrarUbicacion) {
      //Validando que todos los articulos esten ubicados, solo si el almacen lo requiere
      let msjDetalle = '';

      for (let detalle of this.lDetalle) {
        if (detalle.nPorUbicar > 0) {
          msjDetalle = `El artículo: ${detalle.sArticulo}, tiene ${detalle.nPorUbicar} unidades por ubicar!`
          break;
        }
      }
      if (msjDetalle != '') {
        Swal.fire('¡Verificar!', msjDetalle, 'warning')
        return;
      }
    }

    //Consultamos si el usuario va a hacer picking en ubicacion o no
    var nSinPicking: boolean, mensajePregunta: string;
    mensajePregunta = 'Una vez que se agregue el registro no se podrán realizar cambios'

    if (this.bMostrarUbicacion) { //solo si el almacen lo requiere preguntamos si hace picking
      try {
        nSinPicking = await this.fnSinPicking(vDatos.cboAlmacen.nId, this.idUser)
      } catch (err) {
        return;
      }

      if (nSinPicking) {
        mensajePregunta += ', Nota: <br>No se va a alterar ubicación en el almacén indicado';
      }
    }

    if (!this.bMostrarUbicacion) {//Si no muestra ubicacion vaciamos la lista de ubicaciones en caso se haya agregado una
      this.lUbicacionArticulo = [];
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

    var pEntidad = 1;
    var pOpcion = 1;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;
    var pParametroDet = [];
    var pParametroUbic = [];
    var strParametroDet = '';
    var strParametroUbic = '';


    pParametro.push(this.pPais);
    pParametro.push(vDatos.cboOperacionLogistica);
    pParametro.push(vDatos.cboAlmacen.nId);
    pParametro.push(vDatos.cboPresupuesto.nId);
    pParametro.push(vDatos.cboFechaIngreso.format('MM/DD/YYYY'));
    pParametro.push(vDatos.cboSolicitante);
    pParametro.push(vDatos.cboProveedor.nId);
    pParametro.push(vDatos.cboPuntoRecup.nId);
    pParametro.push(this.vMoneda.nId);
    pParametro.push(this.vTipoCambio.nId);

    pParametro.push(vDatos.cboTipoGuia);
    pParametro.push(vDatos.txtNumGuia1);
    pParametro.push(Number(vDatos.txtNumGuia2));

    pParametro.push(vDatos.cboDocGuia);
    pParametro.push((vDatos.txtDocGuia1) == null ? '' : (vDatos.txtDocGuia1));
    pParametro.push((vDatos.txtDocGuia2 == '' || vDatos.txtDocGuia2 == null) ? '' : Number(vDatos.txtDocGuia2));

    pParametro.push((vDatos.txtObservacion == null) ? '' : vDatos.txtObservacion.trim());

    pParametro.push(this.idUser);
    pParametro.push(0);

    this.lDetalle.forEach(item => {
      var pParam = [];
      pParam.push(item.nIdArticulo);
      pParam.push(item.sLote);
      pParam.push(moment(item.sFechaIngreso, 'DD/MM/YYYY').format('MM-DD-YYYY'));
      pParam.push(item.sFechaExpira == '' ? '' : moment(item.sFechaExpira, 'DD/MM/YYYY').format('MM-DD-YYYY'));
      pParam.push(0); //idPartida
      pParam.push(item.nUnidades);
      pParam.push(item.nCostoUnit);
      pParam.push(item.sObservacion);
      pParam.push(item.nId);  //Id temporal
      pParametroDet.push(pParam.join('|'))
    })

    strParametroDet = pParametroDet.join('/');

    this.lUbicacionArticulo.forEach(item => {
      var pParam = [];
      pParam.push(item.nIdDetalleArticulo);  //Id temporal
      pParam.push(item.nIdUbicacion);
      pParam.push(item.nIngreso);
      pParametroUbic.push(pParam.join('|'))
    })

    strParametroUbic = pParametroUbic.join('/');

    try {
      var nId = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, strParametroDet, strParametroUbic, this.url).toPromise();
      if (Number(nId) == 0) {
        this.spinner.hide();
        Swal.fire('Error', 'No se pudo realizar el ingreso: Verifique su conexion a Internet', 'error');
        return;
      }
      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se guardo el registro',
        showConfirmButton: false,
        timer: 1500
      });
      this.pIdRegistro = nId;
      this.matExpUbicacion.close();
      await this.fnListarRegistroDetalle(this.pIdRegistro);
      await this.fnListarArticulosDetalle(this.pIdRegistro);
      await this.fnListarUbicacionArticulo(this.pIdRegistro);
      this.formIngreso.controls.cboPresupuesto.enable();
      this.formIngreso.controls.cboAlmacen.enable();
      this.formIngreso.controls.cboFechaIngreso.enable();

      this.bMostrarUbicacion = true;
      this.spinner.hide();

    } catch (err) {
      this.spinner.hide();
      console.log(err);
    }

    this.bDuplicar = false;

  }
  //#endregion

  //#region funciones de llenado de inputs

  fnLLenarCerosAdelante(formControlName: string, formGroup: FormGroup, caracteres: number) {
    var valor: string = formGroup.get(formControlName).value;
    if (valor == '' || valor == null) return;
    var ceros: string = '';
    for (var i = 0; i < caracteres; i++)ceros += '0'

    var strValor: string = ceros + valor;
    strValor = strValor.substr(strValor.length - caracteres, caracteres);
    formGroup.get(formControlName).setValue(strValor);
  }

  fnSetCliente(p: Presupuesto_Almacen) {
    this.formIngreso.controls.txtCliente.setValue(p.sCliente);
  }

  get fnUbicacion() {
    const puntoRecup = this.formIngreso.controls.cboPuntoRecup.value;
    if (puntoRecup == '') { return '' }
    return `${puntoRecup?.sDepartamento}, ${puntoRecup?.sProvincia}, ${puntoRecup?.sDistrito}`;
  }

  get fnDireccion() {
    const puntoRecup = this.formIngreso.controls.cboPuntoRecup.value;
    if (puntoRecup == '') { return '' }
    return puntoRecup?.sDireccion;
  }

  //Para el form de registro
  fnLLenarTotales() {
    let totalUnd = 0, totalPeso = 0, totalVolumen = 0, totalPrecio = 0;
    this.lDetalle.forEach(item => {
      totalUnd += item.nUnidades;
      totalPeso += item.nPesoTotal;
      totalVolumen += item.nVolumenTotal;
      totalPrecio += item.nCostoTotal;
    })
    this.formIngreso.controls.txtTotalUnd.setValue(totalUnd);
    this.formIngreso.controls.txtTotalPeso.setValue(this.decimalPipe.transform(totalPeso, '1.2-2'));
    this.formIngreso.controls.txtTotalVolumen.setValue(this.decimalPipe.transform(totalVolumen, '1.6-6'));
    this.formIngreso.controls.txtTotalPrecio.setValue(this.decimalPipe.transform(totalPrecio, '1.4-4'));
  }

  //Para el form de detalle
  fnLLenarTotalesDetalle() {
    let totalUnd = 0, totalPeso = 0, totalVolumen = 0, totalPrecio = 0;
    this.lDetalle.forEach(item => {
      totalUnd += item.nUnidades;
      totalPeso += item.nPesoTotal;
      totalVolumen += item.nVolumenTotal;
      totalPrecio += item.nCostoTotal;
    })
    this.formIngresoDetalle.controls.txtTotalUnd.setValue(totalUnd);
    this.formIngresoDetalle.controls.txtTotalPeso.setValue(this.decimalPipe.transform(totalPeso, '1.2-2'));
    this.formIngresoDetalle.controls.txtTotalVolumen.setValue(this.decimalPipe.transform(totalVolumen, '1.6-6'));
    this.formIngresoDetalle.controls.txtTotalPrecio.setValue(this.decimalPipe.transform(totalPrecio, '1.4-4'));
  }

  //Para el form de notas
  fnLLenarTotalesNota() {
    let totalUnd = 0, totalPeso = 0, totalVolumen = 0, totalPrecio = 0;
    this.lDetalle.forEach(item => {
      totalUnd += item.nUnidades;
      totalPeso += item.nPesoTotal;
      totalVolumen += item.nVolumenTotal;
      totalPrecio += item.nCostoTotal;
    })
    this.formNotaIngreso.controls.txtTotalUnd.setValue(totalUnd);
    this.formNotaIngreso.controls.txtTotalPeso.setValue(this.decimalPipe.transform(totalPeso, '1.2-2'));
    this.formNotaIngreso.controls.txtTotalVolumen.setValue(this.decimalPipe.transform(totalVolumen, '1.6-6'));
    this.formNotaIngreso.controls.txtTotalPrecio.setValue(this.decimalPipe.transform(totalPrecio, '1.4-4'));
  }
  //#endregion

  //#region Articulos 
  async fnAgregarArticulo() {
    if (this.formIngreso.controls.cboFechaIngreso.invalid ||
      this.formIngreso.controls.cboPresupuesto.invalid ||
      this.formIngreso.controls.cboAlmacen.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados para ingresar artículos', 'warning')
      return;
    }

    var fechaIngreso = this.formIngreso.controls.cboFechaIngreso.value;
    var centroCosto = this.formIngreso.controls.cboPresupuesto.value;
    var almacen = this.formIngreso.controls.cboAlmacen.value;

    if (!this.formIngreso.controls.cboFechaIngreso.disabled) {
      var resp = await Swal.fire({
        title: '¿Desea continuar?',
        text: "Una vez que agregue un artículo, no se podrá realizar cambios en el presupuesto, almacén y fecha de ingreso",
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
    }

    const dialog = this.dialog.open(ArticuloModalComponent, {
      width: '850px',
      maxWidth: '90vw',
      disableClose: true,
      data: {
        dFechaIngreso: fechaIngreso,
        vCentroCosto: centroCosto,
        vAlmacen: almacen,
        lDetalle: this.lDetalle, //Para validar que no se agregue un articulo existente
        bEsOrdenCompra: false,
        bEsLogisticoSatelite: this.bEsLogisticoSatelite
      }
    })

    var componentSubscribe = dialog.componentInstance.agregarArticulo.subscribe(async (detalle: Detalle_Articulo) => {
      if (detalle != null) {
        this.formIngreso.controls.cboFechaIngreso.disable();
        this.formIngreso.controls.cboPresupuesto.disable();
        this.formIngreso.controls.cboAlmacen.disable();

        this.lDetalle.push(detalle);
        this.dataSource = new MatTableDataSource(this.lDetalle);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        //Si se agrego un detalle listamos las ubicaciones del almacen una sola vez
        if (this.lDetalle.length == 1 || this.bDuplicar) {
          await this.fnListarUbicacion(almacen.nId)
        }

        this.fnLLenarTotales()
      }
    });

    dialog.afterClosed().subscribe(data => {
      componentSubscribe.unsubscribe();
    })

  }

  async fnEliminarArticulo(row: Detalle_Articulo) {
    var resp = await Swal.fire({
      title: '¿Desea continuar?',
      text: "¿Desea eliminar el artículo seleccionado? Se eliminarán las ubicaciones agregadas",
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

    this.lDetalle = this.lDetalle.filter(item => item.nId != row.nId)
    this.lUbicacionArticulo = this.lUbicacionArticulo.filter(item => item.nIdDetalleArticulo != row.nId);

    this.dataSource = new MatTableDataSource(this.lDetalle);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fnLLenarTotales()
  }

  //#endregion

  //#region Ubicacion de articulos
  async fnModalUbicacionArticulo(row: Detalle_Articulo) {

    if (this.bEsGuiaLucky && this.formIngresoDetalle.controls.cboAlmacen.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados para ingresar ubicaciones', 'warning')
      return;
    }

    var cliente = this.formIngreso.controls.txtCliente.value;
    var almacen = this.formIngreso.controls.cboAlmacen.value;

    if (cliente == '') {
      cliente = this.formIngresoDetalle.controls.txtCliente.value;
    }

    if (almacen == '') {
      almacen = this.formIngresoDetalle.controls.cboAlmacen.value
    }

    if (this.bEsNotaIngreso || this.bEsNotaRecojo) {
      cliente = this.vRegistroDetalle.sCliente;
      almacen = {
        nId: this.vRegistroDetalle.nIdAlmacen,
        sDescripcion: this.vRegistroDetalle.sAlmacen,
        nTipoAlmacen: this.vRegistroDetalle.nTipoAlmacen,
        sTipoAlmacen: ''
      };
    }

    var lUbicacion = this.lUbicacionArticulo.filter(item => item.nIdDetalleArticulo == row.nId)

    if (this.bEsGuiaLucky && this.lUbicacionArticulo.length == 0) {
      await this.fnListarUbicacion(almacen.nId)
    }

    this.dialog.open(ArticuloUbicacionComponent, {
      minWidth: '80vW',
      maxWidth: '90vw',
      disableClose: true,
      data: {
        vArticuloDetalle: row,
        sCliente: cliente,
        nIdAlmacen: almacen.nId,
        lUbicacion: lUbicacion,
        bRegistrando: (this.pIdRegistro == 0 || this.bEsOrdenCompra || this.bEsGuiaLucky || this.bEsNotaIngreso || this.bEsNotaRecojo) ? true : false,
        lUbicacionesAlmacen: this.lUbicacionesAlmacen,
        vEmpresaActual: this.vEmpresaActual
      }
    }).afterClosed().subscribe(data => {
      if (data != null) {
        this.formIngresoDetalle.controls.cboFechaIngreso.disable();
        this.formIngresoDetalle.controls.cboAlmacen.disable();

        /*Se eliminan y se agregan todas las ubicaciones del detalle para que no se vuelvan a agregar
        o en caso se haya eliminado alguna */

        //Eliminando las ubicaciones del detalle
        this.lUbicacionArticulo = this.lUbicacionArticulo.filter(item => item.nIdDetalleArticulo != row.nId);

        //Agregando las ubicaciones de detalle 
        this.lUbicacionArticulo.push(...data.lUbicacion);

        //Actualizando la cantidad por ubicar
        var index = this.lDetalle.findIndex(item => item.nId == row.nId);
        this.lDetalle[index].nPorUbicar = data.nPorUbicar
        this.lDetalle[index].sZona = data.nPorUbicar == 0 ? 'Si' : `No - Faltan ${data.nPorUbicar}`
      }
    })
  }

  async fnListarUbicacion(nIdAlmacen: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 18;
    pParametro.push(nIdAlmacen);

    try {
      var lUbicacion = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.spinner.hide();
      this.lUbicacionesAlmacen = lUbicacion;
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  //#endregion

  //#region Funcion de interaccion con componentes
  fnRegresar() {
    this.pMostrar.emit(0);
  }

  fnVerImagen(row: Detalle_Articulo) {
    if (row.sRutaArchivo != '') {
      Swal.fire({
        text: row.sArticulo,
        imageUrl: row.sRutaArchivo,
        imageWidth: 250,
        imageHeight: 250,
      })
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Este artículo no contiene una imagen',
        showConfirmButton: false,
        timer: 1500
      });
    }
  }

  //#endregion

  //#region Cuando se va a ver detalle
  async fnListarRegistroDetalle(nId: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 16;

    pParametro.push(nId);

    try {
      const lRegistro = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.vRegistroDetalle = lRegistro[0];

      this.fnLlenarFormDetalle(this.vRegistroDetalle)
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarArticulosDetalle(nId: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 17;

    pParametro.push(nId);

    try {
      const lArticulo = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.lDetalle = lArticulo;
      this.dataSource = new MatTableDataSource(this.lDetalle);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.fnLLenarTotalesDetalle();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarUbicacionArticulo(nId: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 20;

    pParametro.push(nId);

    try {
      const lUbicacion = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.lUbicacionArticulo = lUbicacion;
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  fnLlenarFormDetalle(vRegistro: Registro_Ingreso_Detalle) {
    this.formIngresoDetalle.controls.txtPresupuesto.setValue(vRegistro.sCentroCosto)
    this.formIngresoDetalle.controls.txtSolicitante.setValue(vRegistro.sSolicitante)
    this.formIngresoDetalle.controls.txtCliente.setValue(vRegistro.sCliente)
    this.formIngresoDetalle.controls.txtAlmacen.setValue(vRegistro.sAlmacen)
    this.formIngresoDetalle.controls.txtOperacionLogistica.setValue(vRegistro.sOperacion)
    this.formIngresoDetalle.controls.txtFechaIngreso.setValue(vRegistro.sFecha)
    this.formIngresoDetalle.controls.txtProveedor.setValue(vRegistro.sProveedor)
    this.formIngresoDetalle.controls.txtPuntoRecup.setValue(vRegistro.sPuntoRecup)
    this.formIngresoDetalle.controls.txtUbicación.setValue(vRegistro.sUbicacion)
    this.formIngresoDetalle.controls.txtDireccion.setValue(vRegistro.sDireccion)
    this.formIngresoDetalle.controls.txtGuiaRef.setValue(vRegistro.sGuiaRef)
    this.formIngresoDetalle.controls.txtFactRef.setValue(vRegistro.sFactRef)
    this.formIngresoDetalle.controls.txtObservacion.setValue(vRegistro.sObservacion)
    this.formIngresoDetalle.controls.txtObservacionDocRef.setValue(vRegistro.sObservacionDocRef)
    this.formIngresoDetalle.controls.txtNumero.setValue(vRegistro.sNumeroDoc)
    this.formIngresoDetalle.controls.txtDocRef.setValue(vRegistro.sDocRef)
    this.formIngresoDetalle.controls.txtEstado.setValue(vRegistro.sEstado)
    this.formIngresoDetalle.controls.txtRegistro.setValue(vRegistro.sUserReg)
    this.formIngresoDetalle.controls.txtFechaRegistro.setValue(vRegistro.sFechaReg)
  }
  //#endregion

  //#region Anular guia salida
  async fnListarRegistroSalidaDetalle(nId: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 16;

    pParametro.push(nId);

    try {
      const lRegistro = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.vRegistroSalida = lRegistro[0];

      await this.fnListarOpLogistica({ nId: this.vRegistroSalida.nIdAlmacen, sDescripcion: '' })

      this.fnLlenarFormSalidaDetalle(this.vRegistroSalida)
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  fnLlenarFormSalidaDetalle(vRegistro: Registro_Salida_Detalle) {
    this.formIngresoDetalle.controls.txtPresupuesto.setValue(vRegistro.sCentroCosto)
    this.formIngresoDetalle.controls.txtSolicitante.setValue(vRegistro.sSolicitante)
    this.formIngresoDetalle.controls.txtCliente.setValue(vRegistro.sCliente)
    this.formIngresoDetalle.controls.txtAlmacen.setValue(vRegistro.sAlmacen)
    this.formIngresoDetalle.controls.txtOperacionLogistica.setValue(vRegistro.sOperacion)
    this.formIngresoDetalle.controls.txtFechaIngreso.setValue(vRegistro.sFecha)
    this.formIngresoDetalle.controls.txtProveedor.setValue(vRegistro.sEntidad)
    this.formIngresoDetalle.controls.txtPuntoRecup.setValue(vRegistro.sPuntoRecup)
    this.formIngresoDetalle.controls.txtUbicación.setValue(vRegistro.sUbicacion)
    this.formIngresoDetalle.controls.txtDireccion.setValue(vRegistro.sDireccion)
    this.formIngresoDetalle.controls.txtGuiaRef.setValue(vRegistro.sGuia)
    this.formIngresoDetalle.controls.txtFactRef.setValue('')
    this.formIngresoDetalle.controls.txtObservacion.setValue('')
    this.formIngresoDetalle.controls.txtObservacionDocRef.setValue(vRegistro.sObservacion)
    this.formIngresoDetalle.controls.txtDocRef.setValue(vRegistro.sGuia)
    this.formIngresoDetalle.controls.txtEstado.setValue('Pendiente')
    this.formIngresoDetalle.controls.txtRegistro.setValue(this.pNom)
    this.formIngresoDetalle.controls.txtFechaRegistro.setValue(moment().format('DD/MM/YYYY'))
  }

  async fnListarUbicacionArticuloRS(nId: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 22;

    pParametro.push(nId);

    try {
      const lUbicacion = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.lUbicacionArticulo = lUbicacion;
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnGuardarGuiaAnulada() {
    if (this.formIngresoDetalle.controls.cboOperacionLogistica.invalid || this.formIngresoDetalle.controls.cboFechaIngreso.invalid
      || this.formIngresoDetalle.controls.txtObservacion.invalid) {
      this.formIngresoDetalle.markAllAsTouched();
      this.matExpUbicacionDetalle.open();
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados para ingresar la guía', 'warning');
      return;
    }

    var vDatos = this.formIngresoDetalle.getRawValue();

    if (this.lDetalle.length <= 0) {
      Swal.fire('¡Verificar!', 'Ingrese por lo menos un articulo al registro', 'warning')
      return;
    }


    var resp = await Swal.fire({
      title: '¿Desea continuar?',
      text: "Una vez que se agregue el registro no se podrán realizar cambios",
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

    var pEntidad = 3;
    var pOpcion = 3;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(this.vRegistroSalida.nId);
    pParametro.push(vDatos.cboOperacionLogistica);
    pParametro.push(vDatos.cboFechaIngreso.format('MM/DD/YYYY'));
    pParametro.push(vDatos.txtObservacion.trim());
    pParametro.push(this.vMoneda.nId);
    pParametro.push(this.vTipoCambio.nId);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);
    pParametro.push(0);

    try {
      var { result } = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      if (Number(result) == 0) {
        Swal.fire('Error', 'No se pudo realizar el ingreso: Verifique su conexion a Internet', 'error');
        this.spinner.hide();
        return;
      }

      this.matExpUbicacionDetalle.close();
      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se guardo el registro',
        showConfirmButton: false,
        timer: 1500
      });
      this.pIdRegistro = result;
      this.bEsGuiaSalida = false;
      await this.fnListarRegistroDetalle(this.pIdRegistro);
      await this.fnListarArticulosDetalle(this.pIdRegistro);
      await this.fnListarUbicacionArticulo(this.pIdRegistro);

      this.spinner.hide();

    } catch (err) {
      console.log(err);
      this.spinner.hide();
    }
  }
  //#endregion

  //#region Procesar Orden de Compra
  async fnListarOrdenCompra(nId: number) {
    this.spinner.show();

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;

    pParametro.push(nId);

    try {
      const lRegistro = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.vRegistroDetalle = lRegistro[0];

      this.fnLlenarFormOCDetalle(this.vRegistroDetalle)
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  fnLlenarFormOCDetalle(vRegistro: Registro_Ingreso_Detalle) {
    this.formIngresoDetalle.controls.txtPresupuesto.setValue(vRegistro.sCentroCosto)
    this.formIngresoDetalle.controls.txtSolicitante.setValue(vRegistro.sSolicitante)
    this.formIngresoDetalle.controls.txtCliente.setValue(vRegistro.sCliente)
    this.formIngresoDetalle.controls.txtOperacionLogistica.setValue(vRegistro.sOperacion)
    this.formIngresoDetalle.controls.txtFechaIngreso.setValue(vRegistro.sFecha)
    this.formIngresoDetalle.controls.txtProveedor.setValue(vRegistro.sProveedor)
    this.formIngresoDetalle.controls.txtObservacionDocRef.setValue(vRegistro.sObservacionDocRef)
    this.formIngresoDetalle.controls.txtDocRef.setValue(vRegistro.sDocRef)
    this.formIngresoDetalle.controls.txtEstado.setValue(vRegistro.sEstado)
    this.formIngresoDetalle.controls.txtRegistro.setValue(this.pNom)
    this.formIngresoDetalle.controls.txtFechaRegistro.setValue(moment().format('DD/MM/YYYY'))
  }

  fnLLenarPuntoRecup(puntoRecup: Direccion_Proveedor) {
    if (puntoRecup == null) { return; }
    const txtpuntoRecup = `${puntoRecup?.sDepartamento}, ${puntoRecup?.sProvincia}, ${puntoRecup?.sDistrito}`
    this.formIngresoDetalle.controls.txtUbicación.setValue(txtpuntoRecup);
    this.formIngresoDetalle.controls.txtDireccion.setValue(puntoRecup.sDireccion);
  }

  async fnListarArticulosOC(nId: number) {
    this.spinner.show();

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;

    pParametro.push(this.pPais);
    pParametro.push(nId);

    try {
      const lArticulo = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.lArticulosOC = lArticulo
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnAgregarArticuloOC() {
    if (this.formIngresoDetalle.controls.cboAlmacen.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados para ingresar artículos', 'warning')
      return;
    }

    var fechaIngreso = moment(this.vRegistroDetalle.sFecha, 'DD/MM/YYYY')
    var centroCosto: Presupuesto_Almacen = {
      nId: this.vRegistroDetalle.nIdCentroCosto,
      sDescripcion: this.vRegistroDetalle.sCentroCosto,
      sCliente: this.vRegistroDetalle.sCliente,
    };

    var almacen = this.formIngresoDetalle.controls.cboAlmacen.value;

    if (!this.formIngreso.controls.cboFechaIngreso.disabled) {
      var resp = await Swal.fire({
        title: '¿Desea continuar?',
        text: "Una vez que agregue un artículo, no se podrá realizar cambios en el almacén.",
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
    }

    const dialog = this.dialog.open(ArticuloModalComponent, {
      width: '850px',
      maxWidth: '90vw',
      disableClose: true,
      data: {
        dFechaIngreso: fechaIngreso,
        vCentroCosto: centroCosto,
        vAlmacen: almacen,
        lDetalle: this.lDetalle, //Para validar que no se agregue un articulo existente,
        bEsOrdenCompra: true,
        lArticuloOC: this.lArticulosOC,
        bEsLogisticoSatelite: this.bEsLogisticoSatelite
      }
    })

    var componentSubscribe = dialog.componentInstance.agregarArticuloOC.subscribe(async (data) => {
      if (data != null) {
        this.formIngresoDetalle.controls.cboAlmacen.disable();
        this.lDetalle.push(data.vDetalle);
        this.lArticulosOC = data.lArticuloOC;
        this.dataSource = new MatTableDataSource(this.lDetalle);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        //Si se agrego un detalle listamos las ubicaciones del almacen una sola vez
        if (this.lDetalle.length == 1) {
          await this.fnListarUbicacion(almacen.nId)
        }

        this.fnLLenarTotalesDetalle();
      }
    });

    dialog.afterClosed().subscribe(data => {
      componentSubscribe.unsubscribe();
    })

  }

  async fnEliminarArticuloOC(row: Detalle_Articulo) {
    var resp = await Swal.fire({
      title: '¿Desea continuar?',
      text: "¿Desea eliminar el artículo seleccionado? Se eliminarán las ubicaciones agregadas",
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

    //Agregando las unidades eliminadas al articulo
    this.lArticulosOC.forEach(item => {
      if (item.nIdArticulo == row.nIdArticulo) {
        item.nCantidadOc += row.nUnidades;
      }
    })

    this.lDetalle = this.lDetalle.filter(item => item.nId != row.nId)
    this.lUbicacionArticulo = this.lUbicacionArticulo.filter(item => item.nIdDetalleArticulo != row.nId);

    this.dataSource = new MatTableDataSource(this.lDetalle);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fnLLenarTotalesDetalle();
  }

  async fnGuardarOC() {
    if (this.formIngresoDetalle.controls.cboAlmacen.invalid || this.formIngresoDetalle.controls.cboOperacionLogistica.invalid
      || this.formIngresoDetalle.controls.cboTipoGuia.invalid || this.formIngresoDetalle.controls.txtNumGuia1.invalid
      || this.formIngresoDetalle.controls.txtNumGuia2.invalid || this.formIngresoDetalle.controls.cboDocGuia.invalid
      || this.formIngresoDetalle.controls.txtDocGuia1.invalid || this.formIngresoDetalle.controls.txtDocGuia2.invalid
      || this.formIngresoDetalle.controls.cboPuntoRecup.invalid || this.formIngresoDetalle.controls.txtObservacion.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      this.formIngresoDetalle.markAllAsTouched();
      this.matExpUbicacionDetalle.open();
      return;
    }

    var vDatos = this.formIngresoDetalle.getRawValue();
    if (vDatos.txtDocGuia1.length != 0 || vDatos.txtDocGuia2.length != 0) {
      if (vDatos.txtDocGuia1.length == 0 || vDatos.txtDocGuia2.length == 0) {
        Swal.fire('¡Verificar!', 'Indique los datos de la FV', 'warning')
        return;
      }
    }

    if (this.lDetalle.length <= 0) {
      Swal.fire('¡Verificar!', 'Ingrese por lo menos un articulo al registro', 'warning')
      return;
    }

    //Validando que todos los articulos esten ubicados
    let msjDetalle = '';

    for (let detalle of this.lDetalle) {
      if (detalle.nPorUbicar > 0) {
        msjDetalle = `El artículo: ${detalle.sArticulo}, tiene ${detalle.nPorUbicar} unidades por ubicar!`
        break;
      }
    }
    if (msjDetalle != '') {
      Swal.fire('¡Verificar!', msjDetalle, 'warning')
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
      mensajePregunta += ', Nota: <br>No se va a alterar ubicación en el almacén indicado';
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

    var pEntidad = 2;
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;
    var pParametroDet = [];
    var pParametroUbic = [];
    var strParametroDet = '';
    var strParametroUbic = '';


    pParametro.push(this.vRegistroDetalle.nId);
    pParametro.push(this.pPais);
    pParametro.push(vDatos.cboOperacionLogistica);
    pParametro.push(vDatos.cboAlmacen.nId);
    pParametro.push(vDatos.cboPuntoRecup.nId);
    pParametro.push(this.vMoneda.nId);
    pParametro.push(this.vTipoCambio.nId);

    pParametro.push(vDatos.cboTipoGuia);
    pParametro.push(vDatos.txtNumGuia1);
    pParametro.push(Number(vDatos.txtNumGuia2));

    pParametro.push(vDatos.cboDocGuia);
    pParametro.push(vDatos.txtDocGuia1);
    pParametro.push(vDatos.txtDocGuia2 == '' ? '' : Number(vDatos.txtDocGuia2));

    pParametro.push(vDatos.txtObservacion.trim());
    pParametro.push(this.idUser);
    pParametro.push(0);

    this.lDetalle.forEach(item => {
      var pParam = [];
      pParam.push(item.nIdArticulo);
      pParam.push(item.sLote);
      pParam.push(moment(item.sFechaIngreso, 'DD/MM/YYYY').format('MM-DD-YYYY'));
      pParam.push(item.sFechaExpira == '' ? '' : moment(item.sFechaExpira, 'DD/MM/YYYY').format('MM-DD-YYYY'));
      pParam.push(0); //idPartida
      pParam.push(item.nUnidades);
      pParam.push(item.nCostoUnit);
      pParam.push(item.sObservacion);
      pParam.push(item.nId);  //Id temporal
      pParametroDet.push(pParam.join('|'))
    })

    strParametroDet = pParametroDet.join('/');

    this.lUbicacionArticulo.forEach(item => {
      var pParam = [];
      pParam.push(item.nIdDetalleArticulo);  //Id temporal
      pParam.push(item.nIdUbicacion);
      pParam.push(item.nIngreso);
      pParametroUbic.push(pParam.join('|'))
    })

    strParametroUbic = pParametroUbic.join('/');

    try {
      var nId = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, strParametroDet, strParametroUbic, this.url).toPromise();
      if (Number(nId) == 0) {
        this.spinner.hide();
        Swal.fire('Error', 'No se pudo realizar el ingreso: Verifique su conexion a Internet', 'error');
        return;
      }

      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se guardo el registro',
        showConfirmButton: false,
        timer: 1500
      });

      this.pIdRegistro = nId;
      this.matExpUbicacionDetalle.close();
      this.bEsGuiaSalida = false;
      this.bEsOrdenCompra = false;
      this.bEsGuiaLucky = false;

      await this.fnListarRegistroDetalle(this.pIdRegistro);
      await this.fnListarArticulosDetalle(this.pIdRegistro);
      await this.fnListarUbicacionArticulo(this.pIdRegistro);
      this.spinner.hide();

    } catch (err) {
      this.spinner.hide();
      console.log(err);
    }

  }
  //#endregion

  //#region Procesar Guia de ingreso de Lucky
  async fnListarRegistroGuiaLuckyDetalle(nId: number) {
    this.spinner.show();

    var pEntidad = 3;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;

    pParametro.push(nId);

    try {
      const lRegistro = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.vRegistroSalida = lRegistro[0];

      this.fnLlenarFormGuiaLuckyDetalle(this.vRegistroSalida)
      this.fnListarArticulosDetalleGuiaLucky(this.vRegistroSalida.nId)
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarArticulosDetalleGuiaLucky(nId: number) {
    this.spinner.show();

    var pEntidad = 3;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;

    pParametro.push(nId);

    try {
      const lArticulo = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.lDetalle = lArticulo;
      this.dataSource = new MatTableDataSource(this.lDetalle);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.fnLLenarTotalesDetalle();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarAlmacenGuiaLucky() {
    this.spinner.show();

    var pEntidad = 3;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 4;

    pParametro.push(this.idUser);
    pParametro.push(this.pPais);
    pParametro.push(this.pIdRegistro);

    try {
      this.lAlmacen = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  fnLlenarFormGuiaLuckyDetalle(vRegistro: Registro_Salida_Detalle) {
    this.formIngresoDetalle.controls.txtPresupuesto.setValue(vRegistro.sCentroCosto)
    this.formIngresoDetalle.controls.txtSolicitante.setValue(vRegistro.sSolicitante)
    this.formIngresoDetalle.controls.txtCliente.setValue(vRegistro.sCliente)
    this.formIngresoDetalle.controls.txtOperacionLogistica.setValue(vRegistro.sOperacion)
    this.formIngresoDetalle.controls.txtProveedor.setValue(vRegistro.sEntidad)
    this.formIngresoDetalle.controls.txtPuntoRecup.setValue(vRegistro.sPuntoRecup)
    this.formIngresoDetalle.controls.txtUbicación.setValue(vRegistro.sUbicacion)
    this.formIngresoDetalle.controls.txtDireccion.setValue(vRegistro.sDireccion)
    this.formIngresoDetalle.controls.txtGuiaRef.setValue(vRegistro.sGuia)
    this.formIngresoDetalle.controls.txtFactRef.setValue('')
    this.formIngresoDetalle.controls.txtObservacion.setValue('')
    this.formIngresoDetalle.controls.txtObservacionDocRef.setValue(vRegistro.sObservacion)
    this.formIngresoDetalle.controls.txtDocRef.setValue('')
    this.formIngresoDetalle.controls.txtEstado.setValue('Pendiente')
    this.formIngresoDetalle.controls.txtRegistro.setValue(this.pNom)
    this.formIngresoDetalle.controls.txtFechaRegistro.setValue(moment().format('DD/MM/YYYY'))
  }

  async fnModificarArticuloGuiaLucky(row: Detalle_Articulo) {
    if (this.formIngresoDetalle.controls.cboFechaIngreso.invalid ||
      this.formIngresoDetalle.controls.cboAlmacen.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados para modificar artículos', 'warning')
      return;
    }

    var almacen = this.formIngresoDetalle.controls.cboAlmacen.value;

    if (!this.formIngresoDetalle.controls.cboAlmacen.disabled) {
      var resp = await Swal.fire({
        title: '¿Desea continuar?',
        text: "Una vez que modifique un artículo, no se podrá realizar cambios en el almacén y fecha de ingreso",
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
    }

    this.dialog.open(ArticuloModalDetalleComponent, {
      width: '850px',
      maxWidth: '90vw',
      disableClose: true,
      data: {
        nIdCentroCosto: this.vRegistroSalida.nIdCentroCosto,
        vArticulo: row,
        vAlmacen: almacen,
        bEsLogisticoSatelite: this.bEsLogisticoSatelite
      }
    }).afterClosed().subscribe(async data => {
      if (data != null) {
        this.formIngresoDetalle.controls.cboFechaIngreso.disable();
        this.formIngresoDetalle.controls.cboAlmacen.disable();

        this.lDetalle.forEach(item => {
          if (item.nId == data.nId) {
            item = data;
          }
        })

        this.dataSource = new MatTableDataSource(this.lDetalle);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.fnLLenarTotales()
      }
    })
  }

  async fnGuardarGuiaLucky() {
    if (this.formIngresoDetalle.controls.cboAlmacen.invalid || this.formIngresoDetalle.controls.cboOperacionLogistica.invalid
      || this.formIngresoDetalle.controls.cboDocGuia.invalid || this.formIngresoDetalle.controls.txtDocGuia1.invalid
      || this.formIngresoDetalle.controls.txtDocGuia2.invalid || this.formIngresoDetalle.controls.txtObservacion.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      this.formIngresoDetalle.markAllAsTouched();
      this.matExpUbicacionDetalle.open();
      return;
    }

    var vDatos = this.formIngresoDetalle.getRawValue();
    if (vDatos.txtDocGuia1.length != 0 || vDatos.txtDocGuia2.length != 0) {
      if (vDatos.txtDocGuia1.length == 0 || vDatos.txtDocGuia2.length == 0) {
        Swal.fire('¡Verificar!', 'Indique los datos de la FV', 'warning')
        return;
      }
    }

    if (this.lDetalle.length <= 0) {
      Swal.fire('¡Verificar!', 'Ingrese por lo menos un articulo al registro', 'warning')
      return;
    }


    if (this.bMostrarUbicacion) {
      //Validando que todos los articulos esten ubicados
      let msjDetalle = '';

      for (let detalle of this.lDetalle) {
        if (detalle.nPorUbicar > 0) {
          msjDetalle = `El artículo: ${detalle.sArticulo}, tiene ${detalle.nPorUbicar} unidades por ubicar!`
          break;
        }
      }
      if (msjDetalle != '') {
        Swal.fire('¡Verificar!', msjDetalle, 'warning')
        return;
      }
    }

    if (!this.bMostrarUbicacion) {//Si no muestra ubicacion vaciamos la lista de ubicaciones en caso se haya agregado una
      this.lUbicacionArticulo = [];
    }


    //Consultamos si el usuario va a hacer picking en ubicacion o no
    var nSinPicking: boolean, mensajePregunta: string;
    mensajePregunta = 'Una vez que se agregue el registro no se podrán realizar cambios'

    if (this.bMostrarUbicacion) {
      try {
        nSinPicking = await this.fnSinPicking(vDatos.cboAlmacen.nId, this.idUser)
      } catch (err) {
        return;
      }

      if (nSinPicking) {
        mensajePregunta += ', Nota: <br>No se va a alterar ubicación en el almacén indicado';
      }
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

    var pEntidad = 3;
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;
    var pParametroDet = [];
    var pParametroUbic = [];
    var strParametroDet = '';
    var strParametroUbic = '';


    pParametro.push(this.vRegistroSalida.nId);
    pParametro.push(this.pPais);
    pParametro.push(vDatos.cboOperacionLogistica);
    pParametro.push(vDatos.cboAlmacen.nId);
    pParametro.push(vDatos.cboFechaIngreso.format('MM/DD/YYYY'));

    pParametro.push(this.vMoneda.nId);
    pParametro.push(this.vTipoCambio.nId);

    pParametro.push(vDatos.cboDocGuia);
    pParametro.push(vDatos.txtDocGuia1);
    pParametro.push(vDatos.txtDocGuia2 == '' ? '' : Number(vDatos.txtDocGuia2));

    pParametro.push(vDatos.txtObservacion.trim());
    pParametro.push(this.idUser);
    pParametro.push(0);

    this.lDetalle.forEach(item => {
      var pParam = [];
      pParam.push(item.nIdArticulo);
      pParam.push(item.sLote);
      pParam.push(moment(item.sFechaIngreso, 'DD/MM/YYYY').format('MM-DD-YYYY'));
      pParam.push(item.sFechaExpira == '' ? '' : moment(item.sFechaExpira, 'DD/MM/YYYY').format('MM-DD-YYYY'));
      pParam.push(0); //idPartida
      pParam.push(item.nUnidades);
      pParam.push(item.nCostoUnit);
      pParam.push(item.sObservacion);
      pParam.push(item.nId);  //Id temporal
      pParametroDet.push(pParam.join('|'))
    })

    strParametroDet = pParametroDet.join('/');

    this.lUbicacionArticulo.forEach(item => {
      var pParam = [];
      pParam.push(item.nIdDetalleArticulo);  //Id temporal
      pParam.push(item.nIdUbicacion);
      pParam.push(item.nIngreso);
      pParametroUbic.push(pParam.join('|'))
    })

    strParametroUbic = pParametroUbic.join('/');

    try {
      var nId = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, strParametroDet, strParametroUbic, this.url).toPromise();
      if (Number(nId) == 0) {
        this.spinner.hide();
        Swal.fire('Error', 'No se pudo realizar el ingreso: Verifique su conexion a Internet', 'error');
        return;
      }
      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se guardo el registro',
        showConfirmButton: false,
        timer: 1500
      });
      this.pIdRegistro = nId;
      this.matExpUbicacionDetalle.close();
      this.bEsGuiaSalida = false;
      this.bEsOrdenCompra = false;
      this.bEsGuiaLucky = false;

      await this.fnListarRegistroDetalle(this.pIdRegistro);
      await this.fnListarArticulosDetalle(this.pIdRegistro);
      await this.fnListarUbicacionArticulo(this.pIdRegistro);
      this.spinner.hide();

    } catch (err) {
      this.spinner.hide();
      console.log(err);
    }

  }
  //#endregion

  //#region Procesar Nota ingreso
  async fnListarRegistroNotaDetalle(nId: number) {
    this.spinner.show();

    var pEntidad = 4;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 4;

    pParametro.push(nId);

    try {
      const lRegistro = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.vRegistroDetalle = lRegistro[0];

      this.fnLlenarFormNota(this.vRegistroDetalle);
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  fnLlenarFormNota(vRegistro: Registro_Ingreso_Detalle) {
    this.formNotaIngreso.controls.txtPresupuesto.setValue(vRegistro.sCentroCosto)
    this.formNotaIngreso.controls.txtSolicitante.setValue(vRegistro.sSolicitante)
    this.formNotaIngreso.controls.txtCliente.setValue(vRegistro.sCliente)
    this.formNotaIngreso.controls.txtAlmacen.setValue(vRegistro.sAlmacen)
    this.formNotaIngreso.controls.txtFechaIngreso.setValue(vRegistro.sFecha)
    this.formNotaIngreso.controls.txtObservacion.setValue('')
    this.formNotaIngreso.controls.txtObservacionDocRef.setValue(vRegistro.sObservacionDocRef)
    this.formNotaIngreso.controls.txtDocRef.setValue(vRegistro.sDocRef)
    this.formNotaIngreso.controls.txtEstado.setValue('Pendiente')
    this.formNotaIngreso.controls.txtRegistro.setValue(this.pNom)
    this.formNotaIngreso.controls.txtFechaRegistro.setValue(moment().format('DD/MM/YYYY'))
  }

  async fnAgregarArticuloNI() {

    var fechaIngreso = moment(this.vRegistroDetalle.sFecha, 'DD/MM/YYYY');
    var centroCosto: Presupuesto_Almacen = {
      nId: this.vRegistroDetalle.nIdCentroCosto,
      sDescripcion: this.vRegistroDetalle.sCentroCosto,
      sCliente: this.vRegistroDetalle.sCliente
    };

    var almacen: Almacen_RI = {
      nId: this.vRegistroDetalle.nIdAlmacen,
      sDescripcion: this.vRegistroDetalle.sAlmacen,
      nTipoAlmacen: this.vRegistroDetalle.nTipoAlmacen,
      sTipoAlmacen: '',
      nNoUbica: 0
    };

    const dialog = this.dialog.open(ArticuloModalComponent, {
      width: '850px',
      maxWidth: '90vw',
      disableClose: true,
      data: {
        dFechaIngreso: fechaIngreso,
        vCentroCosto: centroCosto,
        vAlmacen: almacen,
        lDetalle: this.lDetalle, //Para validar que no se agregue un articulo existente
        bEsOrdenCompra: false,
        bEsLogisticoSatelite: this.bEsLogisticoSatelite
      }
    })

    var componentSubscribe = dialog.componentInstance.agregarArticulo.subscribe(async (detalle: Detalle_Articulo) => {
      if (detalle != null) {
        this.formIngreso.controls.cboFechaIngreso.disable();
        this.formIngreso.controls.cboPresupuesto.disable();
        this.formIngreso.controls.cboAlmacen.disable();

        this.lDetalle.push(detalle);
        this.dataSource = new MatTableDataSource(this.lDetalle);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        //Si se agrego un detalle listamos las ubicaciones del almacen una sola vez
        if (this.lDetalle.length == 1) {
          await this.fnListarUbicacion(almacen.nId)
        }

        this.fnLLenarTotalesNota()
      }
    });

    dialog.afterClosed().subscribe(data => {
      componentSubscribe.unsubscribe();
    })
  }

  async fnEliminarArticuloNota(row: Detalle_Articulo) {
    var resp = await Swal.fire({
      title: '¿Desea continuar?',
      text: "¿Desea eliminar el artículo seleccionado? Se eliminarán las ubicaciones agregadas",
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

    this.lDetalle = this.lDetalle.filter(item => item.nId != row.nId)
    this.lUbicacionArticulo = this.lUbicacionArticulo.filter(item => item.nIdDetalleArticulo != row.nId);

    this.dataSource = new MatTableDataSource(this.lDetalle);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fnLLenarTotalesNota();
  }

  fnLLenarPuntoRecupNota(puntoRecup: Direccion_Proveedor) {
    if (puntoRecup == null) { return; }
    const txtpuntoRecup = `${puntoRecup?.sDepartamento}, ${puntoRecup?.sProvincia}, ${puntoRecup?.sDistrito}`
    this.formNotaIngreso.controls.txtUbicación.setValue(txtpuntoRecup);
    this.formNotaIngreso.controls.txtDireccion.setValue(puntoRecup.sDireccion);
  }

  async fnGuardarNotaIngreso() {
    if (this.formNotaIngreso.invalid) {
      this.formNotaIngreso.markAllAsTouched();
      this.matExpUbicacionNota.open();
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    var vDatos = this.formNotaIngreso.getRawValue();
    if (vDatos.txtDocGuia1.length != 0 || vDatos.txtDocGuia2.length != 0) {
      if (vDatos.txtDocGuia1.length == 0 || vDatos.txtDocGuia2.length == 0) {
        Swal.fire('¡Verificar!', 'Indique los datos de la FV', 'warning')
        return;
      }
    }

    if (this.lDetalle.length <= 0) {
      Swal.fire('¡Verificar!', 'Ingrese por lo menos un articulo al registro', 'warning')
      return;
    }

    //Validando que todos los articulos esten ubicados
    let msjDetalle = '';

    for (let detalle of this.lDetalle) {
      if (detalle.nPorUbicar > 0) {
        msjDetalle = `El artículo: ${detalle.sArticulo}, tiene ${detalle.nPorUbicar} unidades por ubicar!`
        break;
      }
    }
    if (msjDetalle != '') {
      Swal.fire('¡Verificar!', msjDetalle, 'warning')
      return;
    }

    //Consultamos si el usuario va a hacer picking en ubicacion o no
    var nSinPicking: boolean, mensajePregunta: string;
    mensajePregunta = 'Una vez que se agregue el registro no se podrán realizar cambios'

    try {
      nSinPicking = await this.fnSinPicking(this.vRegistroDetalle.nIdAlmacen, this.idUser)
    } catch (err) {
      return;
    }

    if (nSinPicking) {
      mensajePregunta += ', Nota: <br>No se va a alterar ubicación en el almacén indicado';
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

    var pEntidad = 4;
    var pOpcion = 3;  //CRUD -> Procesar NI
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;
    var pParametroDet = [];
    var pParametroUbic = [];
    var strParametroDet = '';
    var strParametroUbic = '';

    pParametro.push(this.vRegistroDetalle.nId);
    pParametro.push(this.pPais);
    pParametro.push(vDatos.cboOperacionLogistica);
    pParametro.push(vDatos.cboProveedor.nId);
    pParametro.push(vDatos.cboPuntoRecup.nId);

    pParametro.push(vDatos.cboTipoGuia);
    pParametro.push(vDatos.txtNumGuia1);
    pParametro.push(Number(vDatos.txtNumGuia2));

    pParametro.push(vDatos.cboDocGuia);
    pParametro.push(vDatos.txtDocGuia1);
    pParametro.push(vDatos.txtDocGuia2 == '' ? '' : Number(vDatos.txtDocGuia2));
    pParametro.push(vDatos.txtObservacion.trim());
    pParametro.push(this.idUser);

    this.lDetalle.forEach(item => {
      var pParam = [];
      pParam.push(item.nIdArticulo);
      pParam.push(item.sLote);
      pParam.push(moment(item.sFechaIngreso, 'DD/MM/YYYY').format('MM-DD-YYYY'));
      pParam.push(item.sFechaExpira == '' ? '' : moment(item.sFechaExpira, 'DD/MM/YYYY').format('MM-DD-YYYY'));
      pParam.push(0); //idPartida
      pParam.push(item.nUnidades);
      pParam.push(item.nCostoUnit);
      pParam.push(item.sObservacion);
      pParam.push(item.nId);  //Id temporal
      pParametroDet.push(pParam.join('|'))
    })

    strParametroDet = pParametroDet.join('/');

    this.lUbicacionArticulo.forEach(item => {
      var pParam = [];
      pParam.push(item.nIdDetalleArticulo);  //Id temporal
      pParam.push(item.nIdUbicacion);
      pParam.push(item.nIngreso);
      pParametroUbic.push(pParam.join('|'))
    })

    strParametroUbic = pParametroUbic.join('/');

    try {
      var nId = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, strParametroDet, strParametroUbic, this.url).toPromise();
      if (Number(nId) == 0) {
        this.spinner.hide();
        Swal.fire('Error', 'No se pudo realizar el ingreso: Verifique su conexion a Internet', 'error');
        return;
      }

      this.bEsNotaIngreso = false;
      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se guardo el registro',
        showConfirmButton: false,
        timer: 1500
      });
      this.pIdRegistro = nId;
      this.matExpUbicacionNota.close();
      await this.fnListarRegistroDetalle(this.pIdRegistro);
      await this.fnListarArticulosDetalle(this.pIdRegistro);
      await this.fnListarUbicacionArticulo(this.pIdRegistro);

      this.spinner.hide();

    } catch (err) {
      this.spinner.hide();
      console.log(err);
    }

  }
  //#endregion

  //#region Procesar Nota Recojo
  async fnListarRegistroNotaRecojoDetalle(nId: number) {
    this.spinner.show();

    var pEntidad = 5;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;

    pParametro.push(nId);

    try {
      const lRegistro = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.vRegistroDetalle = lRegistro[0];

      this.fnLlenarFormNotaRecojo(this.vRegistroDetalle);
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  fnLlenarFormNotaRecojo(vRegistro: Registro_Ingreso_Detalle) {
    this.formNotaIngreso.controls.txtPresupuesto.setValue(vRegistro.sCentroCosto)
    this.formNotaIngreso.controls.txtSolicitante.setValue(vRegistro.sSolicitante)
    this.formNotaIngreso.controls.txtCliente.setValue(vRegistro.sCliente)
    this.formNotaIngreso.controls.txtAlmacen.setValue(vRegistro.sAlmacen)
    this.formNotaIngreso.controls.txtFechaIngreso.setValue(vRegistro.sFecha)
    this.formNotaIngreso.controls.txtObservacion.setValue('')
    this.formNotaIngreso.controls.txtObservacionDocRef.setValue(vRegistro.sObservacionDocRef)
    this.formNotaIngreso.controls.txtDocRef.setValue(vRegistro.sDocRef)
    this.formNotaIngreso.controls.txtEstado.setValue('Pendiente')
    this.formNotaIngreso.controls.txtRegistro.setValue(this.pNom)
    this.formNotaIngreso.controls.txtFechaRegistro.setValue(moment().format('DD/MM/YYYY'))
  }

  async fnListarArticulosNotaRecojo(nId: number) {
    this.spinner.show();

    var pEntidad = 5;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;

    pParametro.push(nId);

    try {
      const lArticulo = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.lDetalle = lArticulo;
      this.dataSource = new MatTableDataSource(this.lDetalle);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.fnLLenarTotalesNota();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnModificarArticuloNR(row: Detalle_Articulo) {

    var almacen: Almacen_RI = {
      nId: this.vRegistroDetalle.nIdAlmacen,
      sDescripcion: this.vRegistroDetalle.sAlmacen,
      nTipoAlmacen: this.vRegistroDetalle.nTipoAlmacen,
      sTipoAlmacen: '',
      nNoUbica: 0
    };

    this.dialog.open(ArticuloModalNotaComponent, {
      width: '850px',
      maxWidth: '90vw',
      disableClose: true,
      data: {
        nIdCentroCosto: this.vRegistroDetalle.nIdCentroCosto,
        vArticulo: row,
        vAlmacen: almacen,
        lDetalle: this.lDetalle,
        vFechaIngreso: moment(this.vRegistroDetalle.sFecha, 'DD/MM/YYYY'),
        bEsLogisticoSatelite: this.bEsLogisticoSatelite
      }
    }).afterClosed().subscribe(async data => {
      if (data != null) {

        this.lDetalle.forEach((item, index) => {
          if (item.nId == row.nId) {
            this.lDetalle[index] = data;
          }
        })

        this.dataSource = new MatTableDataSource(this.lDetalle);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.fnLLenarTotalesNota()
      }
    })
  }

  async fnAgregarArticuloNR(row: Detalle_Articulo) {
    //Cuando es un articulo que solo vino con descripcion

    var fechaIngreso = moment(this.vRegistroDetalle.sFecha, 'DD/MM/YYYY');
    var centroCosto: Presupuesto_Almacen = {
      nId: this.vRegistroDetalle.nIdCentroCosto,
      sDescripcion: this.vRegistroDetalle.sCentroCosto,
      sCliente: this.vRegistroDetalle.sCliente
    };

    var almacen: Almacen_RI = {
      nId: this.vRegistroDetalle.nIdAlmacen,
      sDescripcion: this.vRegistroDetalle.sAlmacen,
      nTipoAlmacen: this.vRegistroDetalle.nTipoAlmacen,
      sTipoAlmacen: '',
      nNoUbica: 0
    };

    const dialog = this.dialog.open(ArticuloModalComponent, {
      width: '850px',
      maxWidth: '90vw',
      disableClose: true,
      data: {
        dFechaIngreso: fechaIngreso,
        vCentroCosto: centroCosto,
        vAlmacen: almacen,
        lDetalle: this.lDetalle, //Para validar que no se agregue un articulo existente
        bEsOrdenCompra: false,
        vDetalle: row,
        bEsLogisticoSatelite: this.bEsLogisticoSatelite
      }
    })

    var componentSubscribe = dialog.componentInstance.agregarArticulo.subscribe(async (detalle: Detalle_Articulo) => {
      if (detalle != null) {
        //El nuevo item que se agregue va a reemplazar al articulo que no tenia datos
        this.lDetalle.forEach((item, index) => {
          if (item.nId == row.nId) {
            this.lDetalle[index] = detalle;
          }
        })

        this.dataSource = new MatTableDataSource(this.lDetalle);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.fnLLenarTotalesNota()
        dialog.close();
      }
    });

    dialog.afterClosed().subscribe(data => {
      componentSubscribe.unsubscribe();
    })
  }

  async fnGuardarNotaRecojo() {
    if (this.formNotaIngreso.invalid) {
      this.formNotaIngreso.markAllAsTouched();
      this.matExpUbicacionNota.open();
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    var vDatos = this.formNotaIngreso.getRawValue();
    if (vDatos.txtDocGuia1.length != 0 || vDatos.txtDocGuia2.length != 0) {
      if (vDatos.txtDocGuia1.length == 0 || vDatos.txtDocGuia2.length == 0) {
        Swal.fire('¡Verificar!', 'Indique los datos de la FV', 'warning')
        return;
      }
    }

    if (this.lDetalle.length <= 0) {
      Swal.fire('¡Verificar!', 'Ingrese por lo menos un articulo al registro', 'warning')
      return;
    }

    //Validando que todos los articulos tengan asignado uno del catalago
    let msjCatalogo = '';

    for (let detalle of this.lDetalle) {
      if (detalle.nIdArticulo == 0) {
        msjCatalogo = `El artículo: ${detalle.sArticulo}, no tiene un articulo asignado!`
        break;
      }
    }
    if (msjCatalogo != '') {
      Swal.fire('¡Verificar!', msjCatalogo, 'warning')
      return;
    }

    //Validando que los articulos tengan lote y fecha ingreso
    let msjArticulo = '';

    for (let detalle of this.lDetalle) {
      if (detalle.sLote == '') {
        msjArticulo = `El artículo: ${detalle.sArticulo}, no tiene lote!`
        break;
      }
    }
    if (msjArticulo != '') {
      Swal.fire('¡Verificar!', msjArticulo, 'warning')
      return;
    }

    //Validando que todos los articulos esten ubicados
    let msjDetalle = '';

    for (let detalle of this.lDetalle) {
      if (detalle.nPorUbicar > 0) {
        msjDetalle = `El artículo: ${detalle.sArticulo}, tiene ${detalle.nPorUbicar} unidades por ubicar!`
        break;
      }
    }
    if (msjDetalle != '') {
      Swal.fire('¡Verificar!', msjDetalle, 'warning')
      return;
    }

    //Consultamos si el usuario va a hacer picking en ubicacion o no
    var nSinPicking: boolean, mensajePregunta: string;
    mensajePregunta = 'Una vez que se agregue el registro no se podrán realizar cambios'

    try {
      nSinPicking = await this.fnSinPicking(this.vRegistroDetalle.nIdAlmacen, this.idUser)
    } catch (err) {
      return;
    }

    if (nSinPicking) {
      mensajePregunta += ', Nota: <br>No se va a alterar ubicación en el almacén indicado';
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

    var pEntidad = 5;
    var pOpcion = 1;  //CRUD -> Procesar NR
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;
    var pParametroDet = [];
    var pParametroUbic = [];
    var strParametroDet = '';
    var strParametroUbic = '';

    pParametro.push(this.vRegistroDetalle.nId);
    pParametro.push(this.pPais);
    pParametro.push(vDatos.cboOperacionLogistica);
    pParametro.push(vDatos.cboProveedor.nId);
    pParametro.push(vDatos.cboPuntoRecup.nId);

    pParametro.push(vDatos.cboTipoGuia);
    pParametro.push(vDatos.txtNumGuia1);
    pParametro.push(Number(vDatos.txtNumGuia2));

    pParametro.push(vDatos.cboDocGuia);
    pParametro.push(vDatos.txtDocGuia1);
    pParametro.push(vDatos.txtDocGuia2 == '' ? '' : Number(vDatos.txtDocGuia2));
    pParametro.push(vDatos.txtObservacion.trim());
    pParametro.push(this.idUser);

    this.lDetalle.forEach(item => {
      var pParam = [];
      pParam.push(item.nIdArticulo);
      pParam.push(item.sLote);
      pParam.push(moment(item.sFechaIngreso, 'DD/MM/YYYY').format('MM-DD-YYYY'));
      pParam.push(item.sFechaExpira == '' ? '' : moment(item.sFechaExpira, 'DD/MM/YYYY').format('MM-DD-YYYY'));
      pParam.push(0); //idPartida
      pParam.push(item.nUnidades);
      pParam.push(item.nCostoUnit);
      pParam.push(item.sObservacion);
      pParam.push(item.nId);  //Id temporal
      pParametroDet.push(pParam.join('|'))
    })

    strParametroDet = pParametroDet.join('/');

    this.lUbicacionArticulo.forEach(item => {
      var pParam = [];
      pParam.push(item.nIdDetalleArticulo);  //Id temporal
      pParam.push(item.nIdUbicacion);
      pParam.push(item.nIngreso);
      pParametroUbic.push(pParam.join('|'))
    })

    strParametroUbic = pParametroUbic.join('/');

    try {
      var nId = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, strParametroDet, strParametroUbic, this.url).toPromise();
      if (Number(nId) == 0) {
        this.spinner.hide();
        Swal.fire('Error', 'No se pudo realizar el ingreso: Verifique su conexion a Internet', 'error');
        return;
      }

      this.bEsNotaRecojo = false;
      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se guardo el registro',
        showConfirmButton: false,
        timer: 1500
      });

      this.pIdRegistro = nId;
      this.matExpUbicacionNota.close();
      await this.fnListarRegistroDetalle(this.pIdRegistro);
      await this.fnListarArticulosDetalle(this.pIdRegistro);
      await this.fnListarUbicacionArticulo(this.pIdRegistro);

      this.spinner.hide();

    } catch (err) {
      this.spinner.hide();
      console.log(err);
    }

  }
  //#endregion

  //#region Actualizar datos 
  async fnActualizar() {
    if (this.pIdRegistro == 0 && this.formIngreso.controls.cboPresupuesto.enabled) {
      await this.fnActualizarRegistro();
    } else if (this.pIdRegistro == 0 && this.formIngreso.controls.cboPresupuesto.disabled) {
      await this.fnActualizarRegistroRestantes();
    } else if (this.bEsOrdenCompra) {
      await this.fnActualizarOrdenCompra();
    } else if (this.bEsGuiaSalida) {
      await this.fnActualizarGuiaSalida();
    } else if (this.bEsGuiaLucky) {
      await this.fnActualizarGuiaLucky();
    } else if (this.bEsNotaIngreso || this.bEsNotaRecojo) {
      await this.fnActualizarNI();
    }
  }

  async fnActualizarRegistro() {
    var vDatos = this.formIngreso.getRawValue();

    var solicitante = vDatos.cboSolicitante;
    var presupuesto = vDatos.cboPresupuesto;
    var almacen = vDatos.cboAlmacen;
    var opLogistica = vDatos.cboOperacionLogistica;
    var proveedor = vDatos.cboProveedor;
    var puntoRecup = vDatos.cboPuntoRecup;

    await this.fnListarPresupuesto();
    var presupuestoEncontrado = this.lPresupuesto.find(item => item.nId == presupuesto.nId)
    this.formIngreso.controls.cboPresupuesto.setValue(presupuestoEncontrado ?? '');

    if (presupuesto != '') {
      await this.fnListarSolicitante(presupuesto);
      this.formIngreso.controls.cboSolicitante.setValue(solicitante ?? '');
    }

    await this.fnListarAlmacen();
    var almacenEncontrado = this.lAlmacen.find(item => item.nId == almacen.nId)
    this.formIngreso.controls.cboAlmacen.setValue(almacenEncontrado ?? '');

    if (almacen != '') {
      await this.fnListarOpLogistica(almacen);
      await this.formIngreso.controls.cboOperacionLogistica.setValue(opLogistica ?? '')
    }

    await this.fnListarProveedor();
    var proveedorEncontrado = this.lProveedor.find(item => item.nId == proveedor.nId)
    this.formIngreso.controls.cboProveedor.setValue(proveedorEncontrado ?? '');

    if (proveedor != '') {
      await this.fnListarDireccion(proveedor);
      var direccionEncontrada = this.lPuntoRecup.find(item => item.nId == puntoRecup.nId)
      if (direccionEncontrada != null) {
        this.formIngreso.controls.cboPuntoRecup.setValue(direccionEncontrada ?? '');
        this.formIngreso.controls.txtUbicación.setValue(this.fnUbicacion);
        this.formIngreso.controls.txtDireccion.setValue(this.fnDireccion);
      } else {
        this.formIngreso.controls.cboPuntoRecup.setValue('');
        this.formIngreso.controls.txtUbicación.setValue('');
        this.formIngreso.controls.txtDireccion.setValue('');
      }
    }

  }

  async fnActualizarRegistroRestantes() {
    var vDatos = this.formIngreso.getRawValue();

    var solicitante = vDatos.cboSolicitante;
    var presupuesto = vDatos.cboPresupuesto;
    var almacen = vDatos.cboAlmacen;
    var opLogistica = vDatos.cboOperacionLogistica;
    var proveedor = vDatos.cboProveedor;
    var puntoRecup = vDatos.cboPuntoRecup;

    if (presupuesto != '') {
      await this.fnListarSolicitante(presupuesto);
      this.formIngreso.controls.cboSolicitante.setValue(solicitante ?? '');
    }

    if (almacen != '') {
      await this.fnListarOpLogistica(almacen);
      await this.formIngreso.controls.cboOperacionLogistica.setValue(opLogistica ?? '')
    }

    await this.fnListarProveedor();
    var proveedorEncontrado = this.lProveedor.find(item => item.nId == proveedor.nId)
    this.formIngreso.controls.cboProveedor.setValue(proveedorEncontrado ?? '');

    if (proveedor != '') {
      await this.fnListarDireccion(proveedor);
      var direccionEncontrada = this.lPuntoRecup.find(item => item.nId == puntoRecup.nId)
      if (direccionEncontrada != null) {
        this.formIngreso.controls.cboPuntoRecup.setValue(direccionEncontrada ?? '');
        this.formIngreso.controls.txtUbicación.setValue(this.fnUbicacion);
        this.formIngreso.controls.txtDireccion.setValue(this.fnDireccion);
      } else {
        this.formIngreso.controls.cboPuntoRecup.setValue('');
        this.formIngreso.controls.txtUbicación.setValue('');
        this.formIngreso.controls.txtDireccion.setValue('');
      }
    }
  }

  async fnActualizarOrdenCompra() {
    var vDatos = this.formIngresoDetalle.getRawValue();

    var almacen = vDatos.cboAlmacen;
    var opLogistica = vDatos.cboOperacionLogistica;
    var puntoRecup = vDatos.cboPuntoRecup;

    await this.fnListarAlmacen();
    var almacenEncontrado = this.lAlmacen.find(item => item.nId == almacen.nId)
    this.formIngresoDetalle.controls.cboAlmacen.setValue(almacenEncontrado ?? '');

    if (almacen != '') {
      await this.fnListarOpLogistica(almacen);
      await this.formIngresoDetalle.controls.cboOperacionLogistica.setValue(opLogistica ?? '')
    }


    await this.fnListarDireccion({ nId: this.vRegistroDetalle.nIdProveedor, sDescripcion: '' });
    var direccionEncontrada = this.lPuntoRecup.find(item => item.nId == puntoRecup.nId)
    if (direccionEncontrada != null) {
      this.formIngresoDetalle.controls.cboPuntoRecup.setValue(direccionEncontrada ?? '');
      this.fnLLenarPuntoRecup(direccionEncontrada)
    } else {
      this.formIngresoDetalle.controls.cboPuntoRecup.setValue('');
      this.formIngresoDetalle.controls.txtUbicación.setValue('');
      this.formIngresoDetalle.controls.txtDireccion.setValue('');
    }

  }

  async fnActualizarGuiaSalida() {
    var vDatos = this.formIngresoDetalle.getRawValue();

    var opLogistica = vDatos.cboOperacionLogistica;

    await this.fnListarOpLogistica({ nId: this.vRegistroSalida.nIdAlmacen, sDescripcion: '' })
    this.formIngresoDetalle.controls.cboOperacionLogistica.setValue(opLogistica ?? '')
  }

  async fnActualizarGuiaLucky() {
    var vDatos = this.formIngresoDetalle.getRawValue();

    var almacen = vDatos.cboAlmacen;
    var opLogistica = vDatos.cboOperacionLogistica;

    await this.fnListarAlmacen();
    var almacenEncontrado = this.lAlmacen.find(item => item.nId == almacen.nId)
    this.formIngresoDetalle.controls.cboAlmacen.setValue(almacenEncontrado ?? '');

    if (almacen != '') {
      await this.fnListarOpLogistica(almacen);
      await this.formIngresoDetalle.controls.cboOperacionLogistica.setValue(opLogistica ?? '')
    }
  }

  async fnActualizarNI() {
    var vDatos = this.formNotaIngreso.getRawValue();

    var opLogistica = vDatos.cboOperacionLogistica;
    var proveedor = vDatos.cboProveedor;
    var puntoRecup = vDatos.cboPuntoRecup;

    await this.fnListarOpLogistica({ nId: this.vRegistroDetalle.nIdAlmacen, sDescripcion: '' })
    await this.formNotaIngreso.controls.cboOperacionLogistica.setValue(opLogistica ?? '')

    await this.fnListarProveedor();
    var proveedorEncontrado = this.lProveedor.find(item => item.nId == proveedor.nId)
    this.formNotaIngreso.controls.cboProveedor.setValue(proveedorEncontrado ?? '');

    if (proveedor != '') {
      await this.fnListarDireccion(proveedor);
      var direccionEncontrada = this.lPuntoRecup.find(item => item.nId == puntoRecup.nId)
      if (direccionEncontrada != null) {
        this.formNotaIngreso.controls.cboPuntoRecup.setValue(direccionEncontrada ?? '');
        this.fnLLenarPuntoRecupNota(direccionEncontrada)
      } else {
        this.formNotaIngreso.controls.cboPuntoRecup.setValue('');
        this.formNotaIngreso.controls.txtUbicación.setValue('');
        this.formNotaIngreso.controls.txtDireccion.setValue('');
      }
    }
  }
  //#endregion


  //#region Funcion de validacion
  caracterValidator(control: AbstractControl): ValidationErrors | null {
    const caracteres = /^[^|?/]*$/;   // /[^|?/]/
    const valid = caracteres.test(control.value);
    return !valid ? { caracterValidator: 'El texto no debe contener: "/", "|", "?"' } : null;
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

  //#region Devolver /Rechazar Nota
  async fnDevolverNota() {
    var resp = await Swal.fire({
      title: '¿Desea devolver la nota: ' + this.vRegistroDetalle.sDocRef + '?',
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

    const { value: observacion } = await Swal.fire({
      title: this.vRegistroDetalle.sDocRef,
      text: 'Ingrese el mensaje',
      input: 'textarea',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Continuar',
      inputValidator: (value) => {
        if (!value) {
          return 'El mensaje es obligatorio';
        }

        if (value.trim() == '') {
          return 'El mensaje es obligatorio';
        }

        if (value.includes('|')) {
          return "El mensaje no puede contener '|'";
        }
      }
    })

    if (!observacion) {
      return;
    }

    this.spinner.show();

    var pEntidad = 6;  //Para actualizar
    var pOpcion = 3;
    var pParametro = [];
    var pTipo = 1;

    pParametro.push(this.vRegistroDetalle.nId);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);
    pParametro.push(observacion);

    try {
      var result = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise()
      if (Number(result) == 1) {
        Swal.fire({
          icon: 'success',
          title: ('Se devolvió de manera correcta la nota: ' + this.vRegistroDetalle.sDocRef),
          showConfirmButton: false,
          timer: 1500
        });
        this.fnRegresar();

      } else {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo realizar la actualización, !Revise su conexión a internet!',
          showConfirmButton: false,
          timer: 1500
        });
      }
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnRechazarNota() {

    var resp = await Swal.fire({
      title: '¿Desea rechazar la nota: ' + this.vRegistroDetalle.sDocRef + '?',
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

    const { value: observacion } = await Swal.fire({
      title: this.vRegistroDetalle.sDocRef,
      text: 'Ingrese el mensaje',
      input: 'textarea',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Continuar',
      inputValidator: (value) => {
        if (!value) {
          return 'El mensaje es obligatorio';
        }

        if (value.trim() == '') {
          return 'El mensaje es obligatorio';
        }

        if (value.includes('|')) {
          return "El mensaje no puede contener '|'";
        }
      }
    })

    if (!observacion) {
      return;
    }


    this.spinner.show();

    var pEntidad = 6;  //Para actualizar
    var pOpcion = 3;
    var pParametro = [];
    var pTipo = 2;

    pParametro.push(this.vRegistroDetalle.nId);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);
    pParametro.push(observacion);

    try {
      var result = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise()
      if (Number(result) == 1) {
        Swal.fire({
          icon: 'success',
          title: ('Se rechazó de manera correcta la nota: ' + this.vRegistroDetalle.sDocRef),
          showConfirmButton: false,
          timer: 1500
        });

        this.fnRegresar();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo realizar la actualización, !Revise su conexión a internet!',
          showConfirmButton: false,
          timer: 1500
        });
      }
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }
  //#endregion

  //#region Detalle Notas Rechazadas y Devuelta
  async fnListarNotaDetalle(nId: number) {
    this.spinner.show();

    var pEntidad = 6;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;

    pParametro.push(nId);

    try {
      const lRegistro = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.vRegistroDetalle = lRegistro[0];

      this.fnLlenarFormNotaDetalle(this.vRegistroDetalle)
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarNotaArticulosDetalle(nId: number) {
    this.spinner.show();

    var pEntidad = 6;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;

    pParametro.push(nId);

    try {
      const lArticulo = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.lDetalle = lArticulo;
      this.dataSource = new MatTableDataSource(this.lDetalle);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.fnLLenarTotalesDetalle();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  fnLlenarFormNotaDetalle(vRegistro: Registro_Ingreso_Detalle) {
    this.formIngresoDetalle.controls.txtPresupuesto.setValue(vRegistro.sCentroCosto)
    this.formIngresoDetalle.controls.txtSolicitante.setValue(vRegistro.sSolicitante)
    this.formIngresoDetalle.controls.txtCliente.setValue(vRegistro.sCliente)
    this.formIngresoDetalle.controls.txtAlmacen.setValue(vRegistro.sAlmacen)
    this.formIngresoDetalle.controls.txtOperacionLogistica.setValue(vRegistro.sOperacion)
    this.formIngresoDetalle.controls.txtFechaIngreso.setValue(vRegistro.sFecha)
    this.formIngresoDetalle.controls.txtGuiaRef.setValue(vRegistro.sGuiaRef)
    this.formIngresoDetalle.controls.txtFactRef.setValue(vRegistro.sFactRef)
    this.formIngresoDetalle.controls.txtObservacion.setValue(vRegistro.sObservacion)
    this.formIngresoDetalle.controls.txtObservacionDocRef.setValue(vRegistro.sObservacionDocRef)
    this.formIngresoDetalle.controls.txtNumero.setValue(vRegistro.sNumeroDoc)
    this.formIngresoDetalle.controls.txtDocRef.setValue(vRegistro.sDocRef)
    this.formIngresoDetalle.controls.txtEstado.setValue(vRegistro.sEstado)
    this.formIngresoDetalle.controls.txtRegistro.setValue(vRegistro.sUserReg)
    this.formIngresoDetalle.controls.txtFechaRegistro.setValue(vRegistro.sFechaReg)
  }
  //#endregion

  //#region Funciones interaccion
  fnMostrarUbicacion(p: Almacen_RI) {
    if (p.nNoUbica == 1) {
      this.bMostrarUbicacion = false
    } else {
      this.bMostrarUbicacion = true
    }
  }

  // Funcionalidad de los botones laterales
  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? 0 : 3;

  }

  fnArchivo() {
    const vRegistro: Lista_Registro_Ingreso = {
      nId: this.vRegistroDetalle.nId,
      sDescripcion: this.vRegistroDetalle.sOperacion.split('-')[0].trim() + '-' + this.vRegistroDetalle.sNumeroDoc
    }
    this.dialog.open(GuiaIngresoFileComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: vRegistro,
      disableClose: true,
    });

  }

  async fnModificarArticulo(row: Detalle_Articulo) {

    var almacen: Almacen_RI;
    var nIdCC: number;
    var sFecha: string;

    if (this.bEsNotaRecojo || this.bEsOrdenCompra) {
      almacen = this.formIngresoDetalle.controls.cboAlmacen.value;
      nIdCC = this.vRegistroDetalle.nIdCentroCosto;
      sFecha = this.vRegistroDetalle.sFecha;
    }

    if ((this.pIdRegistro == 0)) {
      almacen = this.formIngreso.controls.cboAlmacen.value;
      nIdCC = this.formIngreso.controls.cboPresupuesto.value.nId
      sFecha = this.formIngreso.controls.cboFechaIngreso.value.format('DD/MM/YYYY');
    }

    if (this.bDuplicar) {
      await this.fnListarUbicacion(almacen.nId)
      this.bDuplicar = false;
    }

    this.dialog.open(ArticuloModalNotaComponent, {
      width: '850px',
      maxWidth: '90vw',
      disableClose: true,
      data: {
        nIdCentroCosto: nIdCC,
        vArticulo: row,
        vAlmacen: almacen,
        lDetalle: this.lDetalle,
        vFechaIngreso: moment(sFecha, 'DD/MM/YYYY'),
        bEsLogisticoSatelite: this.bEsLogisticoSatelite
      }
    }).afterClosed().subscribe(async data => {
      if (data != null) {

        this.lDetalle.forEach((item, index) => {
          if (item.nId == row.nId) {
            this.lDetalle[index] = data;
          }
        })


        this.dataSource = new MatTableDataSource(this.lDetalle);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.fnLLenarTotalesNota()
        this.fnLLenarTotales()

        this.formIngreso.controls.cboAlmacen.disable();
        this.formIngreso.controls.cboPresupuesto.disable();
        this.formIngreso.controls.cboFechaIngreso.disable();

      }
    })
  }
  //#endregion

  //#region Duplicar guia
  async fnDuplicarGuia() {
    let nIdCentroCosto = this.vRegistroDetalle.nIdCentroCosto
    let nIdAlmacen = this.vRegistroDetalle.nIdAlmacen
    let nIdSolicitante = this.vRegistroDetalle.nIdSolicitante
    let nIdOperacion = this.vRegistroDetalle.nIdOperacion

    this.formIngreso.reset();
    this.pIdRegistro = 0;
    this.vRegistroDetalle = null;

    //Traer datos para duplicar 
    await this.fnListarProveedor();
    await this.fnListarTipoDocGR();
    await this.fnListarTipoDocFV();
    await this.fnListarMoneda();
    await this.fnListarTipoCambio();
    await this.fnTraerEmpresaActual();
    this.formIngreso.controls.txtFechaRegistro.setValue(moment().format('DD/MM/YYYY'))
    this.formIngreso.controls.txtEstado.setValue('Pendiente')
    this.formIngreso.controls.txtRegistro.setValue(this.pNom)
    this.formIngreso.controls.cboFechaIngreso.setValue(moment());

    await this.fnListarPresupuesto();

    var presEncontrado = this.lPresupuesto.find(item => item.nId == nIdCentroCosto)
    this.formIngreso.controls.cboPresupuesto.setValue(presEncontrado ?? '')

    if (presEncontrado != null) {
      this.fnSetCliente(presEncontrado);

      await this.fnListarSolicitante(presEncontrado)

      var vSolicitante = this.lSolicitante.find(item => item.nId == nIdSolicitante)
      if (vSolicitante != null) {
        this.formIngreso.controls.cboSolicitante.setValue(vSolicitante.nId);
      }
    }

    await this.fnListarAlmacen();
    var vAlmacen = this.lAlmacen.find(item => item.nId == nIdAlmacen);
    this.formIngreso.controls.cboAlmacen.setValue(vAlmacen ?? '');

    if (vAlmacen != null) {

      await this.fnListarOpLogistica(vAlmacen);
      await this.fnMostrarUbicacion(vAlmacen)

      var vOpLog = this.lOpLogistica.find(item => item.nId == nIdOperacion)
      if (vOpLog != null) {
        this.formIngreso.controls.cboOperacionLogistica.setValue(vOpLog.nId);
      }
    }

    this.lDetalle.forEach(item => {
      item.sLote = '';
      item.sFechaExpira = '';
      item.sFechaIngreso = '';
      item.nStock = 0;
      item.nUnidades = 0;
      item.nCostoUnit = 0;
      item.nPesoUnd = 0;
      item.nVolumenUnd = 0;
      item.nCostoTotal = 0;
      item.nPesoTotal = 0;
      item.nVolumenTotal = 0;
      item.sObservacion = '';
      item.sZona = 'No';

      item.nPorUbicar = 0;
    })

    this.dataSource = new MatTableDataSource(this.lDetalle);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fnLLenarTotales()

    this.lUbicacionArticulo = [];

    this.bDuplicar = true;
  }
  //#endregion

  //#region Valor en controles duplicados
  fnDarValor(form: FormGroup, formControlName: string, event) {
    const valor = (event.target as HTMLInputElement).value;
    form.get(formControlName).setValue(valor);
  }
  //#endregion

  //#region Revisar el tipo de usuario
  async fnRevisarTipoUsuario() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 23;

    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);

    try {
      //retorna 1 si es logistico satelite, en caso contrario retorna 0
      const response = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();

      this.bEsLogisticoSatelite = response == 0 ? false : true
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }
  //#endregion
}