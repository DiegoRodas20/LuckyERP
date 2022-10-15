import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { CompraService } from '../../compra.service';
import { DialogOrdenCompraHistorialEstadosComponent } from './dialog-orden-compra-historial-estados/dialog-orden-compra-historial-estados.component';
import moment from 'moment';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';

export interface OrdenCompra {
  nId: number;
  sDocumento: string;
  nIdCampana: string;
  sCampana: string;
  nIdSolic: number;
  sSolic: string;
  nIdCliente: number;
  sCliente: string;
  nIdProveedor: number;
  sProveedor: string;
  nPlazoPago: number;
  sContacto: number;
  nIdTipoOC: number;
  sTipoOC: number;
  nEstado: number;
  sReq: string;
  sdireccion: string;
  nIdDireccion: string;
  sFecha: string;
  sFechaRegistro: string;
  sTitulo: string;
  anio: string;
  nTipoCambio: string;
  nDetraccion: string;
  sComprador: string;
  nIdBanco: number;
  sBanco: string;
  nIgv: string;
  nServicio: string;
  nIdBancoProv: number;
  nIdMoneda: number;
  sMoneda: string;
  sTipoCC: string;
  sFechaSoli: string;
}

export interface DetalleOC {
  nIdDetalleOC: number;
  nIdCiudad: number;
  sCodCiudad: string;
  sDescCiudad: string;
  nIdPartida: number;
  sCodPartida: string;
  sDescPartida: string;
  sArticulo: string;
  nPrecio: number;
  nCantidad: number;
  nTotal: number;
  nIdUsrRegistro: number;
  sPais: string;
  imagenArticulo: string;
}

export const DD_MM_YYYY_Format = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export interface Listas {
  nId: number;
  sDescripcion: string;
};

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-orden-compra-crear',
  templateUrl: './orden-compra-crear.component.html',
  styleUrls: ['./orden-compra-crear.component.css'],
  animations: [asistenciapAnimations],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
    { provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_Format },
    DatePipe
  ]
})
export class OrdenCompraCrearComponent implements OnInit {

  dataSource: MatTableDataSource<DetalleOC>;
  dataSource2: MatTableDataSource<any>;

  @ViewChild('modalDetalle') modalDetalle: ElementRef;
  @ViewChild('modalPrecio') modalPrecio: ElementRef;

  @ViewChild('botonCerrar') botonCerrar: ElementRef;
  @ViewChild('botonCerrar2') botonCerrar2: ElementRef;
  @ViewChild('matDetracciones') matDetracciones: MatExpansionPanel;
  @ViewChild('matDetalle') matDetalle: MatExpansionPanel;

  @ViewChild('cboPresupuestoRef') cboPresupuestoRef: NgSelectComponent;

  bModificando: boolean = false;
  ///===================
  pEntidad = 1; //Cabecera del movimiento
  pOpcion = 2;  //CRUD -> Listar
  pParametro = []; //Parametros de campos vacios
  pTipo = 1;       //Listar Solo Guias de ingreso
  pDetalle = []//Parametros de campos vacios
  //========================

  // Asigancion para Paginar y ordedar las columnas de mi tabla
  @ViewChild('MatPaginator1', { static: false }) MatPaginator1: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  @ViewChild('MatPaginator2', { static: false }) MatPaginator2: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort2: MatSort;


  displayedColumns = ['nIdDetalleOC', 'sSucursal', 'sDescPartida', 'sArticulo',
    'nCantidad', 'nPrecio', 'nTotal'];

  displayedColumns2 = ['nIdArticulo', 'sTipo', 'sDescripcion', 'nPrecio', 'sUsuario', 'sFecha'];

  txtFiltroGen = new FormControl();

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  formOrdenCompra: FormGroup;
  formInformacion: FormGroup;
  formDetracciones: FormGroup;
  formDetalleOC: FormGroup;
  formDetalleAct: FormGroup;

  idGastoCosto: string;
  sTipoPresupuesto: string = "";
  fechaHoy;
  //Se va a usar cuando se agrege el primer detalle para que no se pueda modificar la cabecera
  primerAgregado = false;

  //Cuando entramos a modificar una orden de compra
  gastoCostoSeleccionado: OrdenCompra;

  detalleSeleccionado;
  //controles para cuando se modifica
  txtSolicitante = new FormControl();
  txtCampana = new FormControl();
  txtTipoOrden = new FormControl();
  txtCliente = new FormControl();
  txtTotalCompra =  new FormControl;
  txtTotalFinalCompra =  new FormControl;

  lFiltro: Listas[] = [];
  lCampana: Listas[] = [];
  //Para los searchcomboBox
  lCboSolicitante = [];
  lCboCampana = [];
  lCboProveedor = [];
  lCboCliente = [];
  lCboBanco = [];
  lCboMoneda = [];
  lCboPresupuesto = [];
  lCboPartida = [];
  lCboArticulo = [];
  value: any;
  value1: any;
  value2: any;
  sTipoCambio: string
  sIgvPais: string = 'IGV'

  matcher = new ErrorStateMatcher();
  lTipoOrden = []
  cblEstado: any[] = []
  lEntrega = []
  //*detalle
  oDetalle = [];
  oDetalleEliminado = [];

  ListPrecioArticulo = [];
  vLugarEntrega;
  sSucursal: string;
  sucursal;
  tipoCompra;
  sCodigoPartida: string
  spartida: string
  sArticulo: string
  sMoneda;
  contador: number = 0
  lMoneda
  nIdCambio
  validarCampanio: boolean = false
  validarbanco: boolean = false
  validarsucursal: boolean = false
  validarPartida: boolean = false
  validarArticulo: boolean = false
  disabled_seccion_uno: boolean = true;
  editarDireccion: boolean = true;
  valorCambioMoneda: boolean = false; //Variable que nos idicar si debemos mostrar montos convertidos (para Perú)
  vMostrarDetalle: boolean = false;   //Controlamos la visualizacion del container para ingresar item de detalle
  vPrecioProveedor: boolean = false;  //Verificamos si tiene Proveedor y Articulo seleccionado para ver los precios dispomibles por proveedor
  vPrecioArticulo: number = 0;        //Cantidad de Precios del Proveedor
  SolicitanteIDCache: number; // Valor que se utiliza para guardar el id del combo solictante cuando no se quiere cambiar
  PresupuestoIDCache: number; // Valor que se utiliza para
  Titulo: string;

  // Booleano impresion
  vVerReporteImpresionOc = false;

  // Booleano para ver si se esta usando en celular
  vDispEsCelular = false;

  // Historial de estados (Lista para el Dialog)
  historialDeEstados = [];

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'edit', tool: 'Modificar', state: true, color: "secondary"},
    {icon: 'save', tool: 'Grabar', state: true, color: "secondary"},
    {icon: 'clear', tool: 'Cancelar', state: true, color: "secondary"},
    {icon: 'save', tool: 'Grabar', state: true, color: "secondary"},
    {icon: 'assignment', tool: 'Ver Historial', state: true, color: "secondary"},
    {icon: 'print', tool: 'Imprimir', state: true, color: "secondary"},
    {icon: 'print', tool: 'Imprimir', state: true, color: "secondary"},
    {icon: 'exit_to_app', tool: 'Salir', state: true, color: "warn"},
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    //private vOrdenCompraService: Service,          ===Para el service
    private cdr: ChangeDetectorRef,
    private service: CompraService,
    @Inject('BASE_URL') baseUrl: string,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private dateAdapter: DateAdapter<Date>,
    private cdRef: ChangeDetectorRef,
    public dialog: MatDialog
  ) {
    this.url = baseUrl;
    this.dateAdapter.setLocale('es');
    /* buscar */

  }

  ngOnInit(): void {

    this.spinner.show();

    // Detectamos el dispositivo (Mobile o PC)
    this.fnDetectarDispositivo();

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    //Cuando pTipo=1 se muestra el boton para modificar
    //Cuando pTipo=2 se muestra el boton para guardar
    this.pTipo = 1;

    this.fechaHoy = new Date();
    this.idGastoCosto = this.route.snapshot.paramMap.get('id');

    // Actualizar botones
    this.fnControlFab();

    let user = localStorage.getItem('currentUser'); //encriptacion del usuario
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');


    this.formOrdenCompra = this.formBuilder.group({
      txtSolicitante: [null, Validators.required], //
      txtCampana: [null, Validators.required],
      cboTipoOrden: [null, Validators.required], //
      txtCliente: [null, Validators.required],
      txtCodigo: [''],

      txtEstado: ['', Validators.required],
      nIdEstado: [0],
      txtAnio: [''],
      txtComprador: [''],
      FechaCreacion: [''],
      //============================
      nId_Proveedor: [null, Validators.required],
      txtNumReq: [''],
      txtContacto: ['', Validators.required],

      cboMoneda: ['', Validators.required],
      txtTipoCambio: [''],
      txtCredito: ['', Validators.required],
      txtTitulo: ['', Validators.required],
      cbFechaSolicitud: ['', Validators.required],
      cboBanco: ['', Validators.required],

      txtCantidad: [''],
      txtPrecio: [''],
      txtTotal: [''],
      txtPorc: [''],
      Dolares: [''],
      Soles: ['']
    })

    this.formDetalleOC = this.formBuilder.group({
      cboPresupuesto: [null, Validators.required],
      cboPartida: [null, Validators.required],
      cboArticulo: [null, Validators.required],
      txtCantidad: [null, [Validators.required, Validators.min(0)]],
      txtPrecio: [null, [Validators.required, Validators.min(0)]],
      txtTotal: [null, [Validators.required]]
    })

    this.formDetracciones = this.formBuilder.group({
      txtPorcentaje: [0, [Validators.min(0), Validators.max(100)]],
      txtSoles: [0],
      txtDolares: [0],
    })

    this.formDetalleAct = this.formBuilder.group({
      txtPresupuesto: [''],
      txtSucursal: [''],
      txtPartida: [''],
      txtDescripcion: [''],
      txtCantidad: ['', [Validators.required, Validators.min(0)]],
      txtPrecio: ['', [Validators.required, Validators.min(0)]],
      txtTotal: ['']
    })

    this.formInformacion = this.formBuilder.group({
      cbFechaEntrega: ['', Validators.required],
      cboLugarEntrega: ['', Validators.required],
      txtDireccion: [''],
      cbServicio: [false],
      cbIGV: [true],
      txtIGV: [0],
      txtSerivicio: [0, [Validators.min(0), Validators.max(100)]],
      txtSoles: [0],
      txtTotalSoles: [0],
      txtSolesServicio: [0],
      txtSolesIGV: [0],
      txtDolares: [0],
      txtTotalDolares: [0],
      txtDolaresIGV: [0],
      txtDolaresServicio: [0],
    })

    if (this.idGastoCosto != '0') {
      this.fnListarDetalle();
      this.fnListarOC();
      this.vMostrarDetalle = false;
      this.Titulo = 'Detalle de la orden de compra';
    } else {
      /*cargar coombos */
      this.Titulo = 'Detalle de la orden de compra';
      this.vMostrarDetalle = true;
      this.fnCargarTipoCambio();
      this.fnFiltroSolicitante();
      this.fnCargarProveedor(0);
      this.fnCargarLugarEntrega(0);

      this.fnCargarTipoServicio();
      this.fnCargarEstado(0);
      this.fnigvdefault();

      this.dataSource = new MatTableDataSource(this.oDetalle);
      this.dataSource.paginator = this.MatPaginator1;
      this.dataSource.sort = this.sort;

      this.formOrdenCompra.controls['cbFechaSolicitud'].setValue(new Date());
      this.formOrdenCompra.controls['FechaCreacion'].setValue(moment(new Date()).format("DD/MM/YYYY"));
      this.formOrdenCompra.controls['txtComprador'].setValue(this.pNom);
      this.formOrdenCompra.controls['txtAnio'].setValue(this.datePipe.transform(new Date(), 'yyyy'));

    }

    if ( this.pPais == "604" ) {
      this.valorCambioMoneda = true; //Solo cuando es Perú se visualiza ya que cuenta con tipo de cambio por manejar Soles y dolares y se muetsra el Tipo de cambio
      //this.fnCargarTipoCambio();
    }

    // Asignar como activo el boton del menu
    this.tsLista = 'active';

    this.spinner.hide();
  }

  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }

  //#region Botones

  onToggleFab(fab: number, stat: number) {

    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
  }

  async clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnModificar();
        break;
      case 1:
        this.fnGuardarModificacion();
        break;
      case 2:
        this.fnCancelar();
        break;
      case 3:
        this.fnGuardar();
        break;
      case 4:
        this.fnAbrirDialogHistorialEstados();
        break;
      case 5:
        this.fnImprimirReporteOC();
        break;
      case 6:
        this.fnImprimirReporteCelularOC();
        break;
      case 7:
        this.fnSalir();
        break;
      default:
        break;
    }
  }

  // Metodo para controlar la visualizacion de los botones
  fnControlFab(){

    this.fbLista[0].state = this.idGastoCosto != '0' && !this.bModificando && this.gastoCostoSeleccionado?.nEstado==2361; // Modificar
    this.fbLista[1].state = this.idGastoCosto != '0' && this.bModificando; // Guardar modificacion
    this.fbLista[2].state = this.idGastoCosto != '0' && this.bModificando;; // Cancelar
    this.fbLista[3].state = this.idGastoCosto == '0'; // Guardar
    this.fbLista[4].state = this.idGastoCosto != '0'; // Ver Historial
    this.fbLista[5].state = this.idGastoCosto != '0' && !this.bModificando && !this.vDispEsCelular; // Imprimir
    this.fbLista[6].state = this.idGastoCosto != '0' && !this.bModificando && this.vDispEsCelular; // Imprimir Celular
    this.fbLista[7].state = true;

    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion


  //Funciones de listado para llenar los combos
  fnigvdefault() {
    this.pParametro = []
    this.pEntidad = 2
    this.pOpcion = 18
    this.pTipo = 1;
    this.pParametro.push(this.idEmp);
    this.pParametro.push(this.pPais);

    this.service.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {
      //debugger;
      let IGV = data[0]['sDescripcion'];
      IGV = IGV.replace(",", ".");

      //console.log(this.sIgvPais)
      if(this.pPais=='604'){this.sIgvPais = 'IGV'}else{this.sIgvPais = 'IVA'}

      //this.formInformacion.controls['txtIGV'].setValue(Number(parseFloat(IGV) * 100))
      this.formInformacion.controls['txtIGV'].setValue(IGV);

      //console.log(this.sIgvPais);
    })
  }

  fnFiltroSolicitante() {
    this.pParametro = []
    this.pEntidad = 2
    this.pOpcion = 3
    this.pTipo = 1;

    this.pParametro.push(this.idEmp);
    this.service.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {

      this.lFiltro = data;
    })
  }

  fnFiltroCampania(event) {

    if ( this.oDetalle.length > 0 ) {

      Swal.fire({
        title: '¿Desea Cambiar Solicitante?',
        text: "Al cambiar se eliminaran los Articulos/Servicios que estan agregados actualmente",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
      }).then(async (result) => {
        if (result.isConfirmed) {
          this.SolicitanteIDCache = event;
          this.oDetalle = [];

          this.dataSource = new MatTableDataSource(this.oDetalle);
          this.dataSource.paginator = this.MatPaginator1;
          this.dataSource.sort = this.sort;

          this.cboPresupuestoRef.clearModel();
          this.lCboPresupuesto = [];
          this.lCboPartida = [];
          this.lCboArticulo = [];
          this.formOrdenCompra.controls['txtCliente'].setValue(null)
          this.formDetalleOC.patchValue({
            cboPresupuesto: null,
            cboPartida: null,
            cboArticulo: null
          })

          this.pParametro = []
          this.pEntidad = 2
          this.pOpcion = 4
          this.pTipo = 1;
          this.pParametro.push(event)
          this.service.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {

            this.lCampana = data;
            this.calcularTotales();
            if (data.length == 0) {
              this.validarCampanio = true
            } else {
              this.validarCampanio = false
            }
          })


        } else {
          this.formOrdenCompra.controls.txtSolicitante.setValue(this.SolicitanteIDCache);
        }
      })
    }
    else {
      this.SolicitanteIDCache = event;
      this.cboPresupuestoRef.clearModel();
      this.lCboPresupuesto = [];
      this.lCboPartida = [];
      this.lCboArticulo = [];
      this.formOrdenCompra.controls['txtCliente'].setValue('')
      this.formDetalleOC.patchValue({
        cboPresupuesto: null,
        cboPartida: null,
        cboArticulo: null
      })

      this.pParametro = []
      this.pEntidad = 2
      this.pOpcion = 4
      this.pTipo = 1;
      this.pParametro.push(event)
      this.service.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {
        this.lCampana = data;
        this.calcularTotales();
        if (data.length == 0) {
          this.validarCampanio = true;
        }
        else {
          this.validarCampanio = false;
        }
      });
    }
  }

  fnCargarDatosCli(event) {

    if ( this.oDetalle.length > 0 ) {

      Swal.fire({
        title: '¿Desea Cambiar el Presupuesto?',
        text: "Al cambiar se eliminaran los Articulos/Servicios que estan agregados actualmente",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
      }).then(async (result) => {
        if (result.isConfirmed) {
          this.PresupuestoIDCache = event;

          this.oDetalle = [];

          this.dataSource = new MatTableDataSource(this.oDetalle);
          this.dataSource.paginator = this.MatPaginator1;
          this.dataSource.sort = this.sort;

          this.formOrdenCompra.controls['txtCliente'].setValue('')
          this.fnFiltroCliente(event);
          this.fnCargarPresupuesto(event);
          this.calcularTotales();
        } else {
          this.formOrdenCompra.controls.txtCampana.setValue(this.PresupuestoIDCache);
        }
      });
    } else {
      this.PresupuestoIDCache = event;

      this.formOrdenCompra.controls['txtCliente'].setValue('')
      this.fnFiltroCliente(event);
      this.fnCargarPresupuesto(event);
    }

  }

  fnFiltroCliente(event) {

    this.pParametro = []
    this.pEntidad = 2
    this.pOpcion = 5
    this.pTipo = 1;
    this.pParametro.push(event)
    this.service.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {
      this.lCboCliente = data;
      //console.log(data)
      this.formOrdenCompra.controls['txtCliente'].setValue(data[0]?.sDescripcion)
      if(data.length > 0) {this.sTipoPresupuesto = data[0].sNombre;}
      //console.log(this.sTipoPresupuesto)
    })
  }

  fnCargarProveedor(op: number) {
    this.pParametro = []
    this.pEntidad = 2
    this.pOpcion = 6
    this.pTipo = 1;

    this.pParametro.push(this.pPais)
    this.service.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {
      this.lCboProveedor = data;
      if (op == 1) {
        this.lCboProveedor.push({ nId: this.gastoCostoSeleccionado.nIdProveedor, sDescripcion: this.gastoCostoSeleccionado.sProveedor })
      }
      this.lCboProveedor = [...new Map(this.lCboProveedor.map(item => [item.nId, item])).values()];

    })
  }

  fnCargarDatos(evento) {
    this.fnCargarBanco(evento);
    this.fnCargarConactoCredito(evento);
  }

  fnCargarConactoCredito(Evento) {

    this.pParametro = []
    this.pEntidad = 2
    this.pOpcion = 7
    this.pTipo = 1;
    this.pParametro.push(Evento)
    this.service.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {
      this.formOrdenCompra.controls['txtContacto']?.setValue(data[0]['sDescripcion'])
      this.formOrdenCompra.controls['txtCredito']?.setValue(data[0]['nId'])
    })
  }

  fnCargarBanco(event) {

    this.lCboMoneda = [];
    this.formOrdenCompra.controls.cboMoneda.setValue('');
    this.pParametro = []
    this.pEntidad = 2
    this.pOpcion = 8
    this.pTipo = 1;

    var vDatos = this.formOrdenCompra.controls.nId_Proveedor.value;

    this.pParametro.push(event)
    this.lCboBanco = []
    this.service.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {

      if (this.idGastoCosto == '0' || vDatos != this.gastoCostoSeleccionado.nIdProveedor) {
        this.lCboBanco = [...new Map(data.map(item => [item.sDescripcion, item])).values()];
      }
      if (this.idGastoCosto != '0' && vDatos == this.gastoCostoSeleccionado.nIdProveedor) {
        data.forEach(element => {
          this.lCboBanco.push(element);
        });
        this.lCboBanco.push({ nId: this.gastoCostoSeleccionado.nIdBancoProv, sDescripcion: this.gastoCostoSeleccionado.sBanco, sNombre: this.gastoCostoSeleccionado.nIdBanco })

        this.lCboBanco = [...new Map(this.lCboBanco.map(item => [item.sDescripcion, item])).values()];
        this.formOrdenCompra.controls.cboBanco.setValue(this.gastoCostoSeleccionado.nIdBancoProv)
        this.fnCargarMoneda(this.gastoCostoSeleccionado.nIdBanco, 1)
      }

      if (data.length == 0) {
        this.validarbanco = true
      } else {
        this.validarbanco = false
      }
    })
  }

  fnCargarMoneda(event, opcion: number) {

    this.pParametro = []
    this.pEntidad = 2
    this.pOpcion = 9
    this.pTipo = 1;
    var vDatos = this.formOrdenCompra.controls.nId_Proveedor.value;

    this.pParametro.push(event)
    this.pParametro.push(vDatos)
    this.service.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {

      data.forEach(element => {
        this.lCboMoneda.push(element);
      });

      if (opcion == 1 && vDatos == this.gastoCostoSeleccionado.nIdProveedor) {
        this.lCboMoneda.push({ nId: this.gastoCostoSeleccionado.nIdMoneda, sDescripcion: this.gastoCostoSeleccionado.sMoneda, sNombre: this.gastoCostoSeleccionado.nIdBancoProv.toString() })
      }

      this.lCboMoneda = [...new Map(this.lCboMoneda.map(item => [item.nId, item])).values()];
      if (opcion == 1 && vDatos == this.gastoCostoSeleccionado.nIdProveedor) {
        this.formOrdenCompra.controls['cboMoneda'].setValue(this.gastoCostoSeleccionado.nIdMoneda);
        this.fnCapturarMoneda({ nId: this.gastoCostoSeleccionado.nIdMoneda, sDescripcion: this.gastoCostoSeleccionado.sMoneda, sNombre: this.gastoCostoSeleccionado.nIdBancoProv.toString() })
      }
      if (opcion == 0) {
        this.formOrdenCompra.controls['cboMoneda'].setValue(data[0]['nId']);
        this.fnCapturarMoneda(data[0]);
      }

      this.calcularTotales();
      this.fnCalcularDetracciones();
    })
  }

  fnCargarPresupuesto(event) {
    this.formOrdenCompra.controls.txtCampana.setValue(event);
    this.lCboPresupuesto = [];
    this.lCboPartida = [];
    this.lCboArticulo = [];
    this.formDetalleOC.patchValue({
      cboPresupuesto: null,
      cboPartida: null,
      cboArticulo: null
    })

    this.pParametro = []
    this.pEntidad = 2
    this.pOpcion = 10
    this.pTipo = 1;
    this.pParametro.push(event)
    this.service.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {
      this.lCboPresupuesto = data;
      if (data.length == 0) {
        this.validarsucursal = true
      } else {
        this.validarsucursal = false
      }
    })

  }

  fnCargarPartida(evento) {

    this.formDetalleOC.patchValue({
      cboPartida: null,
      cboArticulo: null
    })
    this.lCboArticulo = [];
    this.lCboPartida = [];

    this.pParametro = []
    this.pEntidad = 2
    this.pOpcion = 11
    this.pTipo = 1;
    let formOrden = this.formOrdenCompra.getRawValue();

    // console.log(formOrden);

    // console.log(evento)

    this.pParametro.push(formOrden.txtCampana)
    this.pParametro.push(evento)
    this.service.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {
      // console.log(data);
      this.lCboPartida = data;

      if (data.length == 0) {
        this.validarPartida = true
      } else {
        this.validarPartida = false
      }

    })

  }

  fnCargarArticulo(evento) {

    this.formDetalleOC.controls.cboArticulo.setValue(null);
    this.lCboArticulo = [];

    this.pParametro = []
    this.pEntidad = 2
    this.pOpcion = 12
    this.pTipo = 1;

    var vDatos = this.formOrdenCompra.getRawValue();

    if (this.idGastoCosto == '0') {
      var tipoArticulo = vDatos.cboTipoOrden == 2143 ? 0 : 1;
    }
    if (this.idGastoCosto != '0') {
      var tipoArticulo = this.gastoCostoSeleccionado.nIdTipoOC == 2143 ? 0 : 1;
    }
    this.pParametro.push(evento)
    this.pParametro.push(tipoArticulo)

    this.service.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {

      this.lCboArticulo = data;
      if (data.length == 0 && (this.formDetalleOC.get('cboPartida').value != null || this.formDetalleOC.get('cboPartida').value != '')) {
        this.validarArticulo = true
      } else {
        this.validarArticulo = false
      }
    })
  }

  fnCargarLugarEntrega(op: number) {
    this.pParametro = []
    this.pEntidad = 2
    this.pOpcion = 13
    this.pTipo = 1;

    this.pParametro.push(this.pPais);

    this.service.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {
      this.lEntrega = data;

      if (op == 1) {
        var index = this.lEntrega.findIndex(item => item.nId);
        this.fnCambiarDireccion(this.lEntrega[index]);
        this.formInformacion.controls.cboLugarEntrega.setValue(Number(this.gastoCostoSeleccionado.nIdDireccion));
        this.formInformacion.controls.txtDireccion.setValue(this.gastoCostoSeleccionado.sdireccion);
      }
    })
  }

  fnCargarTipoCambio() {
    this.pParametro = []
    this.pEntidad = 2
    this.pOpcion = 14
    this.pTipo = 1;

    this.pParametro.push(this.pPais);
    if(this.pPais == "604")
    {
      this.service.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {
        this.nIdCambio = data[0]["nId"];

        this.formOrdenCompra.controls['txtTipoCambio'].setValue(data[0]["sDescripcion"])
        this.sTipoCambio = data[0]["sDescripcion"]
      })
    }
  }

  fnCargarTipoServicio() {
    this.pParametro = []
    this.pEntidad = 2
    this.pOpcion = 16
    this.pTipo = 1;

    this.service.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {
      this.lTipoOrden = data;

    })
  }

  fnCargarEstado(op: number) {
    this.pParametro = []
    this.pEntidad = 2
    this.pOpcion = 17
    this.pTipo = 1;

    this.service.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {
      this.cblEstado = data;
      this.formOrdenCompra.controls.txtEstado.setValue('Incompleto'/*this.cblEstado.find(item => item.nId == 2051).sDescripcion*/)
      if (op == 1) {
        var nEstado = this.gastoCostoSeleccionado.nEstado
        this.formOrdenCompra.controls.txtEstado.setValue(this.cblEstado.find(item => item.nId == nEstado).sDescripcion)
      }
    })
  }

  //=========================================

  //listado del detalle
  fnListarDetalle() {
    this.spinner.show();
    this.pParametro = []

    this.pEntidad = 1
    this.pOpcion = 2
    this.pTipo = 3;
    this.pParametro.push(this.idGastoCosto)

    this.service.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {
      this.oDetalle = data;

      this.dataSource = new MatTableDataSource(this.oDetalle);
      this.dataSource.paginator = this.MatPaginator1;
      this.dataSource.sort = this.sort;
      if (this.oDetalle.length > 0) {
        this.oDetalle.forEach((item, index) => {
          this.oDetalle[index].nOriginal = item.nTotal;
          if (item.nId > this.contador) { this.contador = item.nId }
        })
        this.contador++;
      }
      //this.calcularTotales();
      this.fnCalcularDetracciones();
    })

    this.spinner.hide();
  }

  //listado para modificar
  fnListarOC() {
    this.spinner.show();
    this.pParametro = []

    this.pEntidad = 1
    this.pOpcion = 2
    this.pTipo = 2;
    this.pParametro.push(this.idGastoCosto)

    this.service.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: OrdenCompra[]) => {
      if (data.length == 0) {
        this.fnSalir();
      } else {
        this.gastoCostoSeleccionado = data[0];
        this.fnVerDetalle(this.gastoCostoSeleccionado)
        this.fnControlFab();
      }
    })

    this.spinner.hide();
  }

  fnVerDetalle(p: OrdenCompra) {

    this.spinner.show()
    this.txtCampana.setValue(p.sCampana);
    this.sTipoPresupuesto = p.sTipoCC;
    this.txtSolicitante.setValue(p.sSolic);
    this.txtTipoOrden.setValue(p.sTipoOC);
    this.formOrdenCompra.controls.txtSolicitante.setValue(p.sSolic);
    this.formOrdenCompra.controls.cboTipoOrden.setValue(p.sTipoOC);
    this.formOrdenCompra.controls.txtCampana.setValue(p.nIdCampana);
    this.formOrdenCompra.controls.cbFechaSolicitud.setValue(p.sFechaSoli);

    this.formOrdenCompra.controls.txtCliente.setValue(p.sCliente);
    this.formOrdenCompra.controls.txtTitulo.setValue(p.sTitulo)
    this.formOrdenCompra.controls.txtAnio.setValue(p.anio)
    this.formOrdenCompra.controls.txtCodigo.setValue(p.sDocumento)
    this.formOrdenCompra.controls.txtComprador.setValue(p.sComprador)
    this.formOrdenCompra.controls.FechaCreacion.setValue(p.sFechaRegistro)
    this.formOrdenCompra.controls.txtTipoCambio.setValue(p.nTipoCambio)
    this.formOrdenCompra.controls.txtNumReq.setValue(p.sReq)
    this.formOrdenCompra.controls.nIdEstado.setValue(p.nEstado)
    this.formDetracciones.controls.txtPorcentaje.setValue(Number(p.nDetraccion) * 100);
    this.fnCalcularDetracciones();

    this.fnCargarProveedor(1);
    this.fnCargarLugarEntrega(1);
    this.fnCargarEstado(1);
    this.fnCargarPresupuesto(p.nIdCampana);
    this.formOrdenCompra.controls.nId_Proveedor.setValue(p.nIdProveedor)
    this.sTipoCambio = p.nTipoCambio;
    this.fnCargarDatos(this.gastoCostoSeleccionado.nIdProveedor);

    //Convirtiendo la fecha
    var fecha = this.gastoCostoSeleccionado.sFecha.split('/')
    var anio = Number(fecha[2]);
    var mes = Number(fecha[1]) - 1;
    var dia = Number(fecha[0]);

    this.formInformacion.controls.cbFechaEntrega.setValue(new Date(anio, mes, dia));
    var fechaTraida = new Date(anio, mes, dia);
    if (this.fechaHoy > fechaTraida) {
      this.fechaHoy = new Date(anio, mes, dia);
    }

    //let IGV: number = parseFloat(this.gastoCostoSeleccionado.nIgv) * 100;

    let IGVString = p.nIgv.replace(",", ".");
    let IGV: number = parseFloat(IGVString);
    // console.log(IGV);
    this.formInformacion.controls.cbIGV.setValue((IGV == 0) ? false : true);
    this.formInformacion.controls.txtIGV.setValue(IGV * 100);

    //var servicio = Number(this.gastoCostoSeleccionado.nServicio)

    let servicioTXT = p.nServicio.replace(",",".");

    let servicio: number = parseFloat(servicioTXT);

    this.formInformacion.controls.cbServicio.setValue((servicio == 0) ? false : true);
    this.formInformacion.controls.txtSerivicio.setValue(servicio * 100);

    this.formInformacion.controls.txtDireccion.setValue(this.gastoCostoSeleccionado.sdireccion);
    this.calcularTotales();
    //this.fnCalcularDetracciones();

    this.formDetracciones.disable();
    this.formDetalleOC.disable();
    this.formOrdenCompra.controls.nId_Proveedor.disable();
    this.formOrdenCompra.controls.cboBanco.disable();
    this.formOrdenCompra.controls.cboMoneda.disable();
    this.formOrdenCompra.controls.cbFechaSolicitud.disable();

    this.formInformacion.controls.cbFechaEntrega.disable();
    this.formInformacion.controls.cboLugarEntrega.disable();
    this.formInformacion.controls.cbServicio.disable();
    this.formInformacion.controls.cbIGV.disable();
    this.spinner.hide()
  }

  fnCalcularPrecio() {
    if (this.formDetalleOC.controls.txtCantidad.invalid || this.formDetalleOC.controls.txtPrecio.invalid) {
      this.formDetalleOC.controls.txtTotal.setValue(null);
      return;
    }
    this.fnRedondearCantidad();

    let vValidacionDatos = this.formDetalleOC.value;

    let Total = (vValidacionDatos.txtCantidad * vValidacionDatos.txtPrecio)

    this.formDetalleOC.controls.txtTotal.setValue(Total)
  }

  fnCalcularPrecioDetalle() {
    if (this.formDetalleAct.invalid) {
      return;
    }
    this.fnRedondearCantidadAct();
    //debugger;
    let vValidacionDatos = this.formDetalleAct.value;
    let Total = (vValidacionDatos.txtCantidad * vValidacionDatos.txtPrecio)
    this.formDetalleAct.controls.txtTotal.setValue(Total.toFixed(4))
  }

  fnCambiarDireccion(vLugarE) {
    this.formInformacion.controls.txtDireccion.setValue(vLugarE.sNombre);
    this.vLugarEntrega = vLugarE;
    this.editarDireccion = true;
    if (vLugarE.sNombre == "") {
      this.editarDireccion = false;
    }
  }

  fnCapturarArticulo() {

    this.vPrecioProveedor = false;

    var nIdPro = this.formOrdenCompra.controls.nId_Proveedor.value
    var nIdArt = this.formDetalleOC.controls.cboArticulo.value

    //Filtrar los precios que coinciden con el proveedor - Articulo
    this.pParametro = [];
    this.ListPrecioArticulo = [];

    this.pParametro.push(nIdPro);
    this.pParametro.push(nIdArt);

    this.service.fnDatosOrdenCompras(1, 2, this.pParametro, 6, this.url).subscribe((data: any[]) => {

      this.ListPrecioArticulo = data;
      this.vPrecioArticulo = this.ListPrecioArticulo.length; // Actualizando la notificación de cantidad de precios
      if(this.ListPrecioArticulo.length > 0)
      {

        this.dataSource2 = new MatTableDataSource(this.ListPrecioArticulo);
        this.dataSource2.paginator = this.MatPaginator2;
        this.dataSource2.sort = this.sort2;

        this.cdRef.detectChanges();

        //debugger;
        //Evaluamos las variables para poder mostrar el Boton con los precios de Proveedor Articulo
        if(nIdPro > 0 && nIdArt > 0 && this.vPrecioArticulo > 0)
        {
          this.vPrecioProveedor = true;
        }
        else
        {
          this.vPrecioProveedor = false;
        }
      }
    })
  }

  fnCapturarMoneda(moneda) {
    this.sMoneda = moneda;
  }

  async agregarDetalleMas() {

    if ( this.formOrdenCompra.invalid ) {

      Swal.fire({
        icon: 'warning',
        title: 'Revisar',
        text: 'Revise los campos ingresados en la cabecera!',
      })

      this.formOrdenCompra.markAllAsTouched();
      return;
    }

    if (this.formDetalleOC.invalid) {
      Swal.fire({
        title: 'Revisar',
        icon: 'warning',
        text: 'Revisar los campos necesarios para ingresar un detalle'
      });

      this.formDetalleOC.markAllAsTouched();

      return;
    }

    if (parseFloat(this.formDetalleOC.get("txtTotal").value) <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Revisar',
        text: 'El total y/o la cantidad no pueden ser igual o menor a cero',
      })
      return;
    }

    await this.fnAgregarDetalle();
    this.vPrecioProveedor = false;
  }

  async fnAgregarDetalle(){
    this.spinner.show();
    // Recuperamos los datos del formulario de la cabecera y el formulario del detalle
    const cabecera = this.formOrdenCompra.value;
    const detalle = this.formDetalleOC.value;
    let pParametros = []// Para asignar los parametros

    // Verificar si existe el articulo en la tabla. Si existe manda mensaje de articulo repetido
    const nIdArticulo = detalle.cboArticulo
    const existeArticulo =  this.oDetalle.find(element => element.nIdSucursal == detalle.cboPresupuesto && element.nIdPartida == detalle.cboPartida && element.nIdArticulo == nIdArticulo );

    if (existeArticulo) {
      Swal.fire('¡Verificar!', 'Este artículo ya fue agregado!', 'warning')
      // Limpiamos el formulario
      this.formDetalleOC.patchValue({
        txtCantidad: null,
        txtPrecio: null,
        txtTotal: null
      })
      this.formDetalleOC.markAsUntouched();
      this.spinner.hide();
      return;
    }

    // Limpiamos el formulario ya que ya guardamos sus valores
    this.formDetalleOC.patchValue({
      txtCantidad: null,
      txtPrecio: null,
      txtTotal: null
    })
    this.formDetalleOC.markAsUntouched();

    // Validamos el margen de resguardo general del presupuesto
    if(this.sTipoPresupuesto != '2033'){
      const gastoPresupuesto = parseFloat(this.formInformacion.controls.txtSoles.value) + parseFloat(detalle.txtTotal);
      if(!await this.fnMargenGeneral(gastoPresupuesto)){
        this.spinner.hide(); return; }
    }

    //Saldo Actual Presupuesto / Sucursal / Partida
    pParametros = [];
    pParametros.push(cabecera.txtCampana);
    pParametros.push(detalle.cboPresupuesto);
    pParametros.push(detalle.cboPartida);
    pParametros.push(this.sTipoPresupuesto);
    const Fecha = this.datePipe.transform(this.formOrdenCompra.controls.cbFechaSolicitud.value, 'yyyy-MM-dd');
    pParametros.push(Fecha);
    this.service.fnDatosOrdenCompras(2, 19, pParametros, 0, this.url).subscribe( (res: any) => {

      const txtSaldoPartida: string = res.respuesta; // TRAE EL SALDO DISPONIBLE PERO CON "," POR MI CONFIGURACION DE DECIMALES
      const saldoPartida: number = parseFloat(txtSaldoPartida.replace(",", "."));

      // Comparamos el saldo con el gasto total
      if ( saldoPartida > 0 ) {

        // Comenzamos a contabilizar el gasto total desde el gasto ingresado y si hay partidas repetidas
        let gastoTotal: number = parseFloat(detalle.txtTotal);
        let soloHayUnElemento: boolean = true;
        this.oDetalle.forEach( element => {
          if ( element.nIdSucursal == detalle.cboPresupuesto && element.nIdPartida == detalle.cboPartida ) {
            gastoTotal += element.nTotal; // Gasto total en la tabla
            soloHayUnElemento = false;
          }
        });

        // Si el gasto total es superior al saldo de la partida
        if ( gastoTotal > saldoPartida ) {

          // Si solo hay un gasto (El gasto que se ingresa) Solo indica ese gasto
          if ( soloHayUnElemento ) {
            Swal.fire('¡Atención!', 'La partida de la sucursal seleccionada cuenta con un saldo de ' + saldoPartida.toFixed(2) + ' no hay saldo disponible para el monto solicitado actual de ' + gastoTotal.toFixed(2), 'warning')
            this.spinner.hide();
            return;
          }
          // Si hay mas de un gasto (Gastos totales segun partida), se indica la suma de los gastos
          else{
            Swal.fire('¡Atención!', 'La partida de la sucursal seleccionada cuenta con un saldo de ' + saldoPartida.toFixed(2) + '. En esta orden de compra se lleva solicitando en total ' + (gastoTotal - parseFloat(detalle.txtTotal)).toFixed(2) + '. No hay saldo disponible para el monto solicitado actual de ' + parseFloat(detalle.txtTotal).toFixed(2), 'warning')
            this.spinner.hide();
            return;
          }
        }

        this.contador++;

        this.oDetalle.push({
          "cantidad": detalle.txtCantidad,
          "scodigoPartida": null,
          "nId": this.contador,
          "nIdArticulo": detalle.cboArticulo,
          "nIdGsto": Number(this.idGastoCosto),
          "nIdPartida": detalle.cboPartida,
          "nIdSucursal": detalle.cboPresupuesto,
          "nIdUsrRegistro": Number(this.idUser),
          "nOpcion": 2,
          "nOriginal": detalle.txtTotal,
          "nTotal": detalle.txtTotal,
          "precio": detalle.txtPrecio,
          "sArtiruclo":  this.lCboArticulo.find(articulo => articulo.nId == detalle.cboArticulo).sDescripcion,
          "sMoneda": null,
          "sPais": this.pPais ,
          "sPartida": this.lCboPartida.find(partida => partida.nId == detalle.cboPartida).sDescripcion,
          "sSucursal": this.lCboPresupuesto.find(sucursal => sucursal.nId == detalle.cboPresupuesto).sDescripcion,
          "sTitulo": '',
          "codigoPartida": null,
        })

        // Actualizamos la mat-table
        this.dataSource.data = this.oDetalle;

        this.calcularTotales();
        this.spinner.hide();
      }
      else {
        Swal.fire({
          icon: 'warning',
          title: 'Revisar',
          text: 'El saldo se la partida sucursal seleccionada es cero',
        })
        this.spinner.hide();
        return;
      }
    })
  }

  OnChangeOne(event: any) {
    if (event.checked == true) {
      this.pParametro = []
      this.pEntidad = 2
      this.pOpcion = 18
      this.pTipo = 1;

      this.pParametro.push(this.idEmp);
      this.pParametro.push(this.pPais);
      this.service.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {

        let IGVString = data[0]['sDescripcion'].toString().replace(",",".");
        let IGV = parseFloat(IGVString);

        this.formInformacion.controls['txtIGV'].setValue(IGV)

        this.calcularTotales()
      })

    } else {
      this.formInformacion.controls['txtIGV'].setValue(0)
    }
  }

  OnChangeTwo(event: any) {
    this.formInformacion.controls.txtSerivicio.setValue(0);
    if (event.checked == true) {
      this.disabled_seccion_uno = false
    } else {
      this.disabled_seccion_uno = true
    }
  }

  //Funciones para guardar
  async fnGuardar() {

    if (this.formOrdenCompra.invalid) {
      this.formOrdenCompra.markAllAsTouched();
      Swal.fire('¡Verificar!', 'Hay información incompleta en la cabecera orden de compra, vafor de revisar', 'warning')
      return;
    }

    if (this.formInformacion.invalid) {
      this.formInformacion.markAllAsTouched();
      Swal.fire('¡Verificar!', 'Hay información por completar revise la pestaña "Datos de la Compra"', 'warning')
      return;
    }

    if (this.vLugarEntrega.sNombre == '' && (this.formInformacion.controls.txtDireccion.value == '' || this.formInformacion.controls.txtDireccion.value == null)) {
      Swal.fire('¡Verificar!', 'Ingrese una direccion valida', 'warning')
      return;
    }

    if (this.oDetalle.length == 0) {
      Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'Falta ingresar el detalle de la compra',
      })
      return;
    }

    //Aplica la validacion de margen de resguardo solo cuando es un presupuesto cliente
    if(this.sTipoPresupuesto != '2033'){
      if(!await this.fnMargenGeneral(Number(this.formInformacion.controls.txtSoles.value))){
        this.spinner.hide(); return; }
    }

    //Recorrer todos los registros del detalle para validar su saldo actual por item
    let agrupacion = [];
    agrupacion = this.fnAgruparDetalle(this.oDetalle);

    for (let index = 0; index < agrupacion.length; index++) {
      const element = agrupacion[index];
      //console.log(element)

      // llamamos el metodo para la Validacion del saldo en cada Sucursal partida del presupuesto [Cliente y fijo]
      if(! await this.fnSaldoPartida(element)){ return; }
    }

    //debugger
    let pPieParametros = this.formInformacion.value
    let pParametros = this.formOrdenCompra.getRawValue();
    let detraccParametros = this.formDetracciones.value

    const confirma = await Swal.fire({
      title: '¿Desea guardar la Orden de Compra de: ' + this.tipoCompra.sDescripcion+'?',
      text: 'Se aprobará automáticamente la orden de compra.',
      input: 'textarea',
      inputPlaceholder: "Escriba un mensaje con la razón de la aprobación (opcional)",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    });

    const { value: mensaje } = confirma;

    if (!confirma.isConfirmed) {
      return;
    }

    //Cerrando los mat-expansion
    this.fnCerrarDetalle();
    this.fnCerrarDetracciones();

    let servicio = 0, IGV = 0;
    if (pPieParametros.cbServicio == true) {
      servicio = Number((pPieParametros.txtSerivicio == '') ? 0 : pPieParametros.txtSerivicio) //  / 100
    }

    if (pPieParametros.cbIGV == true) {
      IGV = Number(pPieParametros.txtIGV) //  / 100
    }

    this.pParametro = []
    this.pEntidad = 1
    this.pOpcion = 1
    this.pTipo = 1;

    this.pParametro.push(0)                                       //1
    this.pParametro.push(this.idEmp) //empresa                    //2
    this.pParametro.push(pParametros.txtCampana)                  //3
    this.pParametro.push(pParametros.txtSolicitante)              //4
    this.pParametro.push(pParametros.txtTitulo)                   //5
    this.pParametro.push(pParametros.nId_Proveedor)               //6
    this.pParametro.push(this.sMoneda.sNombre)  //Banco proveedor //7
    this.pParametro.push(this.nIdCambio)//idcambio                //8
    this.pParametro.push(pParametros.cboMoneda)                   //9
    this.pParametro.push(pParametros.txtNumReq || '')             //10
    this.pParametro.push(this.idUser)                             //11
    this.pParametro.push(pParametros.nIdEstado)                   //12

    var FechaEntrega = this.datePipe.transform(pPieParametros.cbFechaEntrega, 'yyyy-MM-dd');
    this.pParametro.push(FechaEntrega)                            //13
    this.pParametro.push(pPieParametros.cboLugarEntrega)          //14
    this.pParametro.push(pPieParametros.txtDireccion)             //15
    this.pParametro.push(IGV)                                     //16
    this.pParametro.push(servicio)                                //17
    this.pParametro.push(Number(detraccParametros.txtPorcentaje)/100) //18
    this.pParametro.push(pParametros.cboTipoOrden)                //19
    this.pParametro.push(this.pPais)                              //20
    var Fecha = this.datePipe.transform(pParametros.cbFechaSolicitud, 'yyyy-MM-dd');
    this.pParametro.push(Fecha)                                   //21
    this.pParametro.push(mensaje)                                 //22
    this.spinner.show()

    this.service.fnDatosOrdenComprasDet(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.oDetalle).subscribe((data: any) => {
      if (Number(data) > 0) {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Se registró la Orden de compra y esta cargada a cuenta corriente del presupuesto',
          showConfirmButton: false,
          timer: 1500
        }).then(r => {
          this.router.navigate(['/controlcostos/compra/CrearOC', data])
        })

        this.vMostrarDetalle = true;
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Comuniquese con el area de sistema',
        })
      }
    }, err => {
      console.log(err);
    },
      () => {
        this.spinner.hide();
      }
    )
  }

  async fnMargenGeneral(gastoPresupuesto: number){

    // Recuperamos los datos del formulario de cabecera
    const cabecera = this.formOrdenCompra.getRawValue();

    // Guardamos el id del presupuesto
    let presupuestoId = cabecera.txtCampana

    // Solo aplica si es un presupuesto
    if(this.sTipoPresupuesto != '2033'){

      try {

        // Recuperamos el saldo con margen de resguardo del presupuesto
        let pParametros = [];
        pParametros.push(presupuestoId);
        pParametros.push(gastoPresupuesto);
        const res = await this.service.fnDatosOrdenCompras(2, 20, pParametros, 0, this.url).toPromise();
        const saldoResguardo = parseFloat(res.respuesta)


        if ( saldoResguardo > 0 ) {
          // Si el reguardo es menor al gasto del presupuesto
          if (saldoResguardo < gastoPresupuesto) {
            Swal.fire('¡Verificar!', 'El presupuesto cuenta con margen de resguardo general, teniendo un saldo de  ' + saldoResguardo.toFixed(2) +  '. El gasto total de '+ gastoPresupuesto + ' de la Orden de Compra supera el monto del saldo actual', 'warning')
            return false;
          }

        }
        // Si el reguardo es cero sale una alerta
        else {
          Swal.fire('¡Verificar!', 'El presupuesto cuenta con un margen de resguardo general, el saldo actual del presupuesto es cero. no podra realizar gastos', 'warning');
          return false;

        }
        return true;
      }
      catch (err) {
        console.log(err);
        return false;
      }
    }
  }

  async fnSaldoPartida(element){

    let dentrodelPresupuesto: boolean = true;
    let mensaje: string = '';
    //Revision del Saldo por Item Presupuesto/Sucursal/Partida

    let parametrosDisponibles = [];
    let pParametros = this.formOrdenCompra.getRawValue();
    parametrosDisponibles.push(pParametros.txtCampana);
    parametrosDisponibles.push(element.nIdSucursal);
    parametrosDisponibles.push(element.nIdPartida);
    parametrosDisponibles.push(this.sTipoPresupuesto);
    var Fecha = this.datePipe.transform(this.formOrdenCompra.controls.cbFechaSolicitud.value, 'yyyy-MM-dd');
    parametrosDisponibles.push(Fecha);

    try
    {
      //Trae el saldo actual del Presupuesto/sucursal/partida/ de acuerdo a prepuesto cliente y costo fijo
      var resp = await this.service.fnDatosOrdenCompras(2, 19, parametrosDisponibles, 0, this.url).toPromise();

      // debugger;
      let saldoDisponibleTxT: string = resp.respuesta; // TRAE EL SALDO DISPONIBLE PERO CON "," POR MI CONFIGURACION DE DECIMALES
      let saldoDisponible: number = parseFloat(saldoDisponibleTxT.replace(",", "."));

      //Verificamos en donde [Sucursal/Partida] no cuenta con saldo para poder mostrar en el mensaje  element.nTotal
      if ( element.nTotal > saldoDisponible ) {
        Swal.fire('¡Verificar!', 'No cuenta con saldo disponible en la partida: '+ element.sPartida + ', de la sucursal: '+element.sSucursal+
          ',\n saldo actual: '+saldoDisponible.toFixed(2)+ ', gasto de compra: '+ parseFloat(element.nTotal).toFixed(2), 'warning');
        return false;
      }

    }
    catch (err) {
      console.log(err);
    }

    return true;
  }

  verImagen(imagenArticulo){
    if(imagenArticulo != '' && imagenArticulo != null) {
      Swal.fire({
        imageUrl: imagenArticulo,
        imageWidth: 250,
        imageHeight: 250,
      })
    } else {
      Swal.fire({
        imageUrl: '/assets/img/SinImagen.jpg',
        imageWidth: 250,
        imageHeight: 250,
      })
    }


  }

  async fnGuardarModificacion() {
    if (this.formOrdenCompra.controls.txtTitulo.invalid || this.formOrdenCompra.controls.nId_Proveedor.invalid
      || this.formOrdenCompra.controls.cboBanco.invalid || this.formOrdenCompra.controls.cboMoneda.invalid
      || this.formOrdenCompra.controls.txtNumReq.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Revisar',
        text: 'Revise los campos ingresados en la cabecera!',
      })
      return;
    }

    if (this.vLugarEntrega.sNombre == ''
      && (this.formInformacion.controls.txtDireccion.value == ''
        || this.formInformacion.controls.txtDireccion.value == null)) {
      Swal.fire('¡Verificar!', 'Ingrese una direccion valida', 'warning')
      return;
    }

    if (this.oDetalle.length == 0) {
      Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'Falta ingresar detalle',
      })
      return;
    }

    // debugger
    //Aplica la validacion de margen de resguardo solo cuando es un presupuesto cliente
    if(this.sTipoPresupuesto != '2033'){
      if(!await this.fnMargenGeneral(Number(this.formInformacion.controls.txtSoles.value))){
        this.spinner.hide(); return; }
    }

    //Para recorrer todos los registros del detalle
    let agrupacion = [];
    agrupacion = this.fnAgruparDetalle(this.oDetalle);

    for (let index = 0; index < agrupacion.length; index++) {
      const element = agrupacion[index];

      // Validamos el saldo en cada Sucursal partida del presupuesto [Cliente y fijo]
      if(!await this.fnSaldoPartida(element)){ return; }
    }


    let pPieParametros = this.formInformacion.value
    let pParametros = this.formOrdenCompra.getRawValue();
    let detraccParametros = this.formDetracciones.value

    const confirma = await Swal.fire({
      title: '¿Desea guardar la Orden de Compra de: ' + this.formOrdenCompra.get("cboTipoOrden").value +'?',
      text: 'Se aprobará automáticamente la orden de compra.',
      input: 'textarea',
      inputPlaceholder: 'Escriba un mensaje con la razón de la aprobación (Opcional)',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    });

    const { value: mensaje } = confirma;

    if (!confirma.isConfirmed) {
      return;
    }


    this.oDetalleEliminado.forEach(item => {
      this.oDetalle.push(item);
    })

    //Cerrando los mat-expansion
    this.fnCerrarDetalle();
    this.fnCerrarDetracciones();


    let servicio = 0, IGV = 0;
    if (pPieParametros.cbServicio == true) {
      servicio = Number(pPieParametros.txtSerivicio)//  / 100;
    }

    if (pPieParametros.cbIGV == true) {
      IGV = Number(pPieParametros.txtIGV)//  / 100
    }
    //Para la direccion

    this.pEntidad = 1;
    this.pOpcion = 3;
    this.pTipo = 1;
    var FechaEntrega = this.datePipe.transform(pPieParametros.cbFechaEntrega, 'yyyy-MM-dd');
    //debugger;
    this.pParametro = []
    this.pParametro.push(this.idGastoCosto)                               //1
    this.pParametro.push(pParametros.nId_Proveedor)                       //2
    this.pParametro.push(this.sMoneda.sNombre)                            //3
    this.pParametro.push(pParametros.cboMoneda)                           //4
    this.pParametro.push(2360)                           //5
    this.pParametro.push(pParametros.txtNumReq)                           //6
    this.pParametro.push(Number(detraccParametros.txtPorcentaje)/100)     //7
    this.pParametro.push(pPieParametros.cboLugarEntrega)                  //8
    this.pParametro.push(pPieParametros.txtDireccion)                     //9
    this.pParametro.push(this.pPais)                                      //10
    this.pParametro.push(FechaEntrega)                                    //11
    this.pParametro.push(this.idUser)                                     //12
    this.pParametro.push(pParametros.txtTitulo)                           //13
    this.pParametro.push(IGV)                                             //14
    this.pParametro.push(servicio)                                        //15
    this.pParametro.push(mensaje);                                        //16

    this.spinner.show()

    this.service.fnDatosOrdenComprasDet(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.oDetalle).subscribe((data: any) => {
      if (Number(data) > 0) {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Se guardaron los cambios realizados',
          showConfirmButton: false,
          timer: 1500
        }).then(r => {
          this.router.navigate(['/controlcostos/compra/CrearOC', this.idGastoCosto])
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'comuniquese con el area de sistema',
        })
      }
    }, err => {
      console.log(err);
    },
      () => {
        this.spinner.hide();
      }
    )
  }

  eliminarId(Event) {
    if (Event.nOpcion == 1) {
      Event.nOpcion = 3;
      this.oDetalleEliminado.push(Event);
    }
    this.oDetalle = this.oDetalle.filter(function (rest) {
      return rest.nId !== Event.nId;
    })
    this.dataSource = new MatTableDataSource(this.oDetalle);
    this.dataSource.paginator = this.MatPaginator1;
    this.dataSource.sort = this.sort;
    this.calcularTotales()
    this.fnCalcularDetracciones()
  }

  // Ver el historial de una factura ya existente
  async fnAbrirDialogHistorialEstados() {

    this.spinner.show();

    await this.fnHistorialDeEstados(this.idGastoCosto);

    const dialogRef = this.dialog.open(DialogOrdenCompraHistorialEstadosComponent, {
      width: '950px',
      data: {
        historial: this.historialDeEstados,
        titulo: this.formOrdenCompra.get("txtCodigo").value
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {});
  }

  // Listar historial de estados
  async fnHistorialDeEstados(idGastoCosto){
    const pParametro = [];
    pParametro.push(idGastoCosto);
    this.historialDeEstados = await this.service.fnOrdenCompraHistorialEstados(1, 2, pParametro, 7, this.url);
  }

  calcularTotales() {

    let cabParametros = this.formOrdenCompra.value;

    //let monedaId = cabParametros.cboMoneda;
    let tipoCambio = parseFloat(this.sTipoCambio)

    let pPieParametros = this.formInformacion.getRawValue();

    let bServicio = pPieParametros.cbServicio;
    let bIGV = pPieParametros.cbIGV;

    let servicio = parseFloat(pPieParametros.txtSerivicio == null ? 0 : pPieParametros.txtSerivicio)
    servicio = servicio / 100
    let igv = parseFloat(pPieParametros.txtIGV) / 100

    //Para soles
    let subTotalSoles: number = 0, totalSoles: number = 0, solesIGV: number = 0, solesServicio: number = 0;

    //Para los dolares
    let subTotalDolares: number = 0, totalDolares: number = 0, DolaresIGV: number = 0, DolaresServicio: number = 0;

    //Cuando esta en soles
    if (this.formOrdenCompra.get('cboMoneda').value == 443 ) {
      this.oDetalle.forEach((value, index) => {
        subTotalSoles += value.precio * value.cantidad
      })

      subTotalSoles = subTotalSoles;
      if (bServicio == true) {
        solesServicio = subTotalSoles * servicio;
        solesServicio = solesServicio;
      }

      if (bIGV == true) {
        solesIGV = subTotalSoles * igv;
        solesIGV = solesIGV;
      }
      totalSoles = (solesIGV + solesServicio + subTotalSoles);

      //Convertir a dolares
      subTotalDolares = subTotalSoles / tipoCambio
      DolaresServicio = solesServicio / tipoCambio
      DolaresIGV = solesIGV / tipoCambio
      totalDolares = totalSoles / tipoCambio



    }
    //cuando esta en dolares
    else {
      this.oDetalle.forEach((value, index) => {
        subTotalDolares += value.precio * value.cantidad
      })

      subTotalDolares = subTotalDolares;
      if (bServicio == true) {
        DolaresServicio = subTotalDolares * servicio;
        DolaresServicio = DolaresServicio;
      }

      if (bIGV == true) {
        DolaresIGV = subTotalDolares * igv;
        DolaresIGV = DolaresIGV
      }
      totalDolares = DolaresIGV + DolaresServicio + subTotalDolares

      //Convertir a dolares
      subTotalSoles = subTotalDolares * tipoCambio
      solesServicio = DolaresServicio * tipoCambio
      solesIGV = DolaresIGV * tipoCambio
      totalSoles = totalDolares * tipoCambio
    }

    //Asignacion a los textBox
    this.formInformacion.controls.txtSoles.setValue(subTotalSoles.toFixed(4));
    this.formInformacion.controls.txtDolares.setValue(subTotalDolares.toFixed(4));
    this.formInformacion.controls.txtSolesServicio.setValue(solesServicio.toFixed(4));
    this.formInformacion.controls.txtDolaresServicio.setValue(DolaresServicio.toFixed(4));
    this.formInformacion.controls.txtSolesIGV.setValue(solesIGV.toFixed(4));
    this.formInformacion.controls.txtDolaresIGV.setValue(DolaresIGV.toFixed(4));
    this.formInformacion.controls.txtTotalSoles.setValue(totalSoles.toFixed(4));
    this.formInformacion.controls.txtTotalDolares.setValue(totalDolares.toFixed(4));

    this.txtTotalCompra.setValue(subTotalSoles.toFixed(4));
    this.txtTotalFinalCompra.setValue(totalSoles.toFixed(4));
  }

  fnCalcularDetracciones() {
    if (this.formDetracciones.controls.txtPorcentaje.invalid) {
      return;
    }

    let cabParametros = this.formOrdenCompra.value;
    let monedaId = cabParametros.cboMoneda;
    let tipoCambio = parseFloat(this.sTipoCambio)

    let subTotalSoles: number = 0;
    let subTotalDolares: number = 0;

    let pPieParametros = this.formDetracciones.value;
    let detraccion = pPieParametros.txtPorcentaje / 100;
    if (this.formOrdenCompra.get('cboMoneda').value == 443) {
      this.oDetalle.forEach((value, index) => {
        subTotalSoles += value.precio * value.cantidad
      })

      subTotalSoles = this.fnRedondear(subTotalSoles * detraccion);
      //Convertir a dolares
      subTotalDolares = this.fnRedondear(subTotalSoles / tipoCambio);

    }
    //cuando esta en dolares
    else {
      this.oDetalle.forEach((value, index) => {
        subTotalDolares += value.precio * value.cantidad
      })

      subTotalDolares = this.fnRedondear(subTotalDolares * detraccion);
      subTotalSoles = this.fnRedondear(subTotalDolares * tipoCambio);
    }

    this.formDetracciones.controls.txtSoles.setValue(subTotalSoles);
    this.formDetracciones.controls.txtDolares.setValue(subTotalDolares);
  }

  fnSalir() {
    this.router.navigate(['/controlcostos/compra/orden-compra'])

  }

  fnRedondear(num) {
    var pow = Math.pow(10, 2);
    return Math.round(num * pow) / pow;
  }

  fnCancelar() {

    Swal.fire({
      title: '¿Desea cancelar la edición?',
      text: "Se perderán los cambios realizados ¿Desea contuniar?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/controlcostos/compra/CrearOC', this.idGastoCosto])
      }
    })
  }

  fnAbrirModal(row) {
    // Mostrar en el modal los datos del detalle seleccionado
    this.formDetalleAct.patchValue({
      txtPresupuesto: this.txtCampana.value || this.lCampana.find(campana => campana.nId == this.formOrdenCompra.get('txtCampana').value).sDescripcion,
      txtSucursal: row.sSucursal,
      txtPartida: row.sPartida,
      txtDescripcion: row.sArtiruclo,
      txtCantidad: row.cantidad,
      txtPrecio: row.precio,
    })

    // Estos datos son solo para vista previa y por lo tanto estan desactivados
    this.formDetalleAct.get("txtPresupuesto").disable();
    this.formDetalleAct.get("txtSucursal").disable();
    this.formDetalleAct.get("txtPartida").disable();
    this.formDetalleAct.get("txtDescripcion").disable();

    this.detalleSeleccionado = row;
    this.fnCalcularPrecioDetalle();
  }

  async fnModificarDetalle() {
    if (this.formDetalleAct.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Revisar',
        text: 'Los campos no pueden ser negativos',
      })
      this.formDetalleAct.markAllAsTouched();
      return;
    }
    if (Number(this.formDetalleAct.controls.txtTotal.value) <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Revisar',
        text: 'El total y/o la cantidad no pueden igual o menor a Cero',
      })
      this.formDetalleAct.markAllAsTouched();
      return;
    }

    var pParametros = this.formDetalleAct.value;
    var pParametrosCab = this.formOrdenCompra.getRawValue();

    var presupuestoId;
    if (this.idGastoCosto != "0") {
      presupuestoId = this.gastoCostoSeleccionado.nIdCampana;
    } else {
      presupuestoId = pParametrosCab.txtCampana
    }

    //Validando los gastos por centro de costo, sucursal, partida
    var gasto = Number(pParametros.txtTotal);
    var gastoPresupuesto = Number(pParametros.txtTotal);

    this.oDetalle.forEach(item => {
      if (item.nIdSucursal == this.detalleSeleccionado.nIdSucursal
        && item.nIdPartida == this.detalleSeleccionado.nIdPartida
        && item.nId != this.detalleSeleccionado.nId
        && item.nOpcion == 2) {
        gasto += item.nTotal;
      }
      if (item.nIdSucursal == this.detalleSeleccionado.nIdSucursal
        && item.nIdPartida == this.detalleSeleccionado.nIdPartida
        && item.nId != this.detalleSeleccionado.nId
        && item.nOpcion == 1) {
        gasto += (item.nTotal - item.nOriginal);
      }
    })

    var pParama = [];
    pParama.push(presupuestoId);
    pParama.push(this.detalleSeleccionado.nIdSucursal);
    pParama.push(this.detalleSeleccionado.nIdPartida);
    pParama.push(this.sTipoPresupuesto);
    var Fecha = this.datePipe.transform(this.formOrdenCompra.controls.cbFechaSolicitud.value, 'yyyy-MM-dd');
    pParama.push(Fecha);

    //debugger
    var saldoDisp = await this.service.fnDatosOrdenCompras(2, 19, pParama, 0, this.url).toPromise();
    var saldo = Number(saldoDisp.respuesta)
    var resul = saldo - gasto;

    if ( resul < 0) {
      Swal.fire('¡Verificar!', 'El gasto: '+ gasto.toFixed(2)+' supera el saldo actual '+saldo.toFixed(2)+' en la partida y la sucursal seleccionada', 'warning')
      return;
    }

    //Validando los gastos por centro de costo
    this.oDetalle.forEach(item => {
      //Para los registros de detalle que estan en memoria
      if (item.nId != this.detalleSeleccionado.nId && item.nOpcion == 2) {
        gastoPresupuesto += item.nTotal;
      }
      //Para los registros de detalle que estan en BD
      if (item.nId != this.detalleSeleccionado.nId && item.nOpcion == 1) {
        gastoPresupuesto += (item.nTotal - item.nOriginal);
      }
    })

    //Los eliminados
    this.oDetalleEliminado.forEach(item => {
      gastoPresupuesto -= item.nTotal;
    })


    var pParama1 = [];
    //Aplica la validacion de margen de resguardo solo cuando es un presupuesto cliente
    if(this.sTipoPresupuesto != '2033'){
      pParama1.push(presupuestoId);
      pParama1.push(gastoPresupuesto);

      var saldoDisponiblePresupuesto = await this.service.fnDatosOrdenCompras(5, 2, pParama1, 0, this.url).toPromise();

      if (Number(saldoDisponiblePresupuesto) < 0) {
        Swal.fire('¡Verificar!', 'El presupuesto cuenta con margen de resguardo general, saldo de:  ' + saldoDisponiblePresupuesto.toFixed(2) +  ', EL total de OC supera el monto de saldo actual', 'warning')
        return;
      }
    }

    var index = this.oDetalle.findIndex(item => item.nId == this.detalleSeleccionado.nId);
    this.oDetalle[index].cantidad = pParametros.txtCantidad;
    this.oDetalle[index].precio = pParametros.txtPrecio;
    this.oDetalle[index].nTotal = pParametros.txtTotal;

    this.dataSource = new MatTableDataSource(this.oDetalle);
    this.dataSource.paginator = this.MatPaginator1;
    this.dataSource.sort = this.sort;
    this.botonCerrar.nativeElement.click();
    this.fnCalcularDetracciones();
    this.calcularTotales();
  }

  async fnModificarDetallePrueba(){
    if (this.formDetalleAct.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Revisar',
        text: 'Los campos no pueden ser negativos',
      })
      this.formDetalleAct.markAllAsTouched();
      return;
    }
    if (Number(this.formDetalleAct.controls.txtTotal.value) <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Revisar',
        text: 'El total y/o la cantidad no pueden igual o menor a Cero',
      })
      return;
    }

    // Recuperamos los datos de los formularios de cabecera y detalle actualizacion
    const detalle = this.formDetalleAct.value;
    const cabecera = this.formOrdenCompra.getRawValue();
    let pParametros = []; // Para hacer las consultas a la DB

    // Guardamos el id del presupuesto dependiendo de si estamos modificando o editando
    let presupuestoId;
    if (this.idGastoCosto != "0") {
      presupuestoId = this.gastoCostoSeleccionado.nIdCampana;
    } else {
      presupuestoId = cabecera.txtCampana
    }


    // Verificamos el saldo segun el margen de resguardo
    if(this.sTipoPresupuesto != '2033'){
      const gastoPresupuesto = parseFloat(this.formInformacion.controls.txtSoles.value) - parseFloat(this.detalleSeleccionado.nTotal) + parseFloat(detalle.txtTotal);
      if(!await this.fnMargenGeneral(gastoPresupuesto)){
        this.spinner.hide(); return; }
    }

    // Recuperamos el gasto total de la partida
    let gastoPartida = Number(detalle.txtTotal);

    this.oDetalle.forEach(item => {
      if (item.nIdSucursal == this.detalleSeleccionado.nIdSucursal
        && item.nIdPartida == this.detalleSeleccionado.nIdPartida
        && item.nId != this.detalleSeleccionado.nId
        && item.nOpcion == 2) {
        gastoPartida += item.nTotal;
      }
      if (item.nIdSucursal == this.detalleSeleccionado.nIdSucursal
        && item.nIdPartida == this.detalleSeleccionado.nIdPartida
        && item.nId != this.detalleSeleccionado.nId
        && item.nOpcion == 1) {
        gastoPartida += item.nTotal;
      }
    })

    pParametros = [];
    pParametros.push(presupuestoId);
    pParametros.push(this.detalleSeleccionado.nIdSucursal);
    pParametros.push(this.detalleSeleccionado.nIdPartida);
    pParametros.push(this.sTipoPresupuesto);
    const Fecha = this.datePipe.transform(this.formOrdenCompra.controls.cbFechaSolicitud.value, 'yyyy-MM-dd');
    pParametros.push(Fecha);
    const res = await this.service.fnDatosOrdenCompras(2, 19, pParametros, 0, this.url).toPromise();
    const saldoPartida = parseFloat(res.respuesta)

    if (saldoPartida < gastoPartida) {
      Swal.fire('¡Verificar!', 'El gasto: ' + gastoPartida.toFixed(2) + ' supera el saldo actual ' + saldoPartida.toFixed(2) + ' en la partida y la sucursal seleccionada', 'warning')
      return;
    }

    const index = this.oDetalle.findIndex(item => item.nId == this.detalleSeleccionado.nId);
    this.oDetalle[index].cantidad = detalle.txtCantidad;
    this.oDetalle[index].precio = detalle.txtPrecio;
    this.oDetalle[index].nTotal = parseFloat(detalle.txtTotal);

    this.dataSource = new MatTableDataSource(this.oDetalle);
    this.dataSource.paginator = this.MatPaginator1;
    this.dataSource.sort = this.sort;
    this.botonCerrar.nativeElement.click();
    this.fnCalcularDetracciones();
    this.calcularTotales();
  }

  fnEvitarEspacios() {
    var vDatosCC = this.formOrdenCompra.value;
    var titulo = vDatosCC.txtTitulo;
    var req = vDatosCC.txtNumReq;
    if (titulo != null) {
      this.formOrdenCompra.controls.txtTitulo.setValue(titulo.trimLeft())
    }
    if (req != null) {
      this.formOrdenCompra.controls.txtNumReq.setValue(req.trimLeft())
    }
  }

  fnRedondearCantidad() {
    var cantidad = this.formDetalleOC.controls.txtCantidad.value;
    if (isNaN(cantidad)) {
      return;
    } else {
      this.formDetalleOC.controls.txtCantidad.setValue(Math.round(cantidad))
    }
  }

  fnRedondearCantidadAct() {
    var cantidad = this.formDetalleAct.controls.txtCantidad.value;
    if (isNaN(cantidad)) {
      return;
    } else {
      this.formDetalleAct.controls.txtCantidad.setValue(Math.round(cantidad))
    }
  }

  fnEvitarNegativoPrecio() {
    var precio = this.formDetalleOC.controls.txtPrecio.value;
    if (isNaN(precio)) {
      return;
    } else {
      precio = Math.abs(precio);
      this.formDetalleOC.controls.txtPrecio.setValue(precio);
    }
  }

  fnEvitarNegativoPrecioAct() {
    var precio = this.formDetalleAct.controls.txtPrecio.value;
    if (isNaN(precio))
    {
      return;
    }
    else
    {
      this.formDetalleAct.controls.txtPrecio.setValue(precio)
    }
  }

  fnCapturarTipoCompra(p) {
    this.tipoCompra = p;
  }

  fnModificar() {
    this.formDetracciones.enable();
    this.formDetalleOC.enable();
    this.formOrdenCompra.controls.nId_Proveedor.enable();
    this.formOrdenCompra.controls.cboBanco.enable();
    this.formOrdenCompra.controls.cboMoneda.enable();
    this.formOrdenCompra.controls.cbFechaSolicitud.enable();

    this.formInformacion.controls.cbFechaEntrega.enable();
    this.formInformacion.controls.cboLugarEntrega.enable();
    this.formInformacion.controls.cbServicio.enable();
    this.formInformacion.controls.cbIGV.enable();

    this.bModificando = true;
    this.vMostrarDetalle = true;

    this.fnControlFab();
  }

  fnAgruparDetalle(arr) {
    return [...arr.reduce((r, o) => {
      const key = o.nIdSucursal + '-' + o.nIdPartida;

      const item = r.get(key) || Object.assign({}, o, {
        nTotal: 0,
      });

      item.nTotal += parseFloat(o.nTotal);
      return r.set(key, item);
    }, new Map).values()];
  }

  fnAgruparDetalleAct(arr) {
    return [...arr.reduce((r, o) => {
      const key = o.nIdSucursal + '-' + o.nIdPartida + '-' + o.nOpcion;

      const item = r.get(key) || Object.assign({}, o, {
        nTotal: 0,
      });

      item.nTotal += o.nTotal;
      return r.set(key, item);
    }, new Map).values()];
  }

  fnCerrarDetracciones() {
    this.matDetracciones.close()
  }

  fnCerrarDetalle() {
    this.matDetalle.close()
  }

  fnMostrarMatrizPartidaArticulo = function(){
    window.open('/controlcostos/datobasico/partidaArticulo', '_blank');
  }

  fnListaPreciosProveedor = function(){

    //console.log('preciooo')
  }

  fnUsarPrecio = function(row: any){
    this.formDetalleOC.controls.txtPrecio.setValue(row.nPrecio);
    this.fnCalcularPrecio();
    //this.modalPrecio.nativeElement.click();
    this.botonCerrar2.nativeElement.click();
  }


  //#region Impresion Reporte

  /*fnImprimirOC(){
    this.vVerReporteImpresionOc = true;
    // Agregar nombre al documento
    const tempTitle = document.title;
    document.title = 'Solicitud de Movilidad';
    // Impresion
    setTimeout(()=>{
      window.print();
      this.vVerReporteImpresionOc = false;
    })
    document.title = tempTitle;
    return;
  }*/

  // Impresion desde PC
  fnImprimirReporteOC(){
    const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;
    const reporte = document.getElementById('print-prueba').innerHTML;
    pdfFrame.contentWindow.document.open();
    pdfFrame.contentWindow.document.write(reporte);
    pdfFrame.contentWindow.document.close();
    pdfFrame.contentWindow.print();
  }

  // Impresion desde el celular
  fnImprimirReporteCelularOC(){
    const divText = document.getElementById("print-prueba").outerHTML;
    const myWindow = window.open('','','width=985,height=1394');
    const doc = myWindow.document;
    doc.open();
    doc.write(divText);
    doc.close();
    doc.title = 'Solicitud de Movilidad';
  }

  // Detectar el dispositivo
  fnDetectarDispositivo(){
    const dispositivo = navigator.userAgent;
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(dispositivo)){
      this.vDispEsCelular = true;
    }
    else{
      this.vDispEsCelular = false;
    }
  }

  //#endregion

  //#region Validacion de controles numericos
  fnValidarCaracteresNumericos(event){

    const invalidChars = ["-","+","e"];

    if (invalidChars.includes(event.key)) {
      event.preventDefault();
    }
  }

  fnValidarCaracteresNumericosClipboard(event: ClipboardEvent){

    const invalidChars = ["-","+","e"];

    let clipboardData = event.clipboardData;
    let pastedText = clipboardData.getData('text');
    console.log(clipboardData)
    console.log(pastedText)
    const valor = pastedText.split('')

    invalidChars.map((letra)=>{
      if (valor.includes(letra)) {
        event.preventDefault();
      }
    })
  }
  //#endregion

}
