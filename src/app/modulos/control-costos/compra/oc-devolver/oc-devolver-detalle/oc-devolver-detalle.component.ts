import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { CompraService } from '../../compra.service';
import { DialogOrdenCompraHistorialEstadosComponent } from '../../orden-compra/orden-compra-crear/dialog-orden-compra-historial-estados/dialog-orden-compra-historial-estados.component';

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
  sDireccionEmp: string;
  sEstado: string;
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
}

@Component({
  selector: 'app-oc-devolver-detalle',
  templateUrl: './oc-devolver-detalle.component.html',
  styleUrls: ['./oc-devolver-detalle.component.css'],
  animations: [asistenciapAnimations],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
    { provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_Format },
    DatePipe
  ]
})
export class OcDevolverDetalleComponent implements OnInit {
  dataSource: MatTableDataSource<DetalleOC>;
  @ViewChild('modalDetalle') modalDetalle: ElementRef;
  @ViewChild('botonCerrar') botonCerrar: ElementRef;

  ///===================
  pEntidad = 1; //Cabecera del movimiento
  pOpcion = 2;  //CRUD -> Listar
  pParametro = []; //Parametros de campos vacios
  pTipo = 1;       //Listar Solo Guias de ingreso
  pDetalle = []//Parametros de campos vacios
  //========================

  // Asigancion para Paginar y ordedar las columnas de mi tabla
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  displayedColumns = ['sSucursal', 'sDescPartida', 'sArticulo',
    'nCantidad', 'nPrecio', 'nTotal'
  ];

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

  @Input() idGastoCosto: string;

  @Output() pMostrar = new EventEmitter<number>();

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
  txtTotalCompra = new FormControl;
  txtTotalFinalCompra = new FormControl;

  lFiltro = [];
  lCampana = [];
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
  matcher = new ErrorStateMatcher();
  lTipoOrden = []
  cblEstado: any[] = []
  lEntrega = []
  //*detalle
  oDetalle = [];
  oDetalleEliminado = [];
  sSucursal: string;
  sucursal;
  sCodigoPartida: string
  spartida: string
  sArticulo: string
  contador: number = 0
  lMoneda
  nIdCambio
  validarCampanio: boolean = false
  validarbanco: boolean = false
  validarsucursal: boolean = false
  validarPartida: boolean = false
  validarArticulo: boolean = false
  disabled_seccion_uno: boolean = true;
  editarDireccion = true;

  // Historial de estados (Lista para el Dialog)
  historialDeEstados = [];

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'reply', tool: 'Devolver', state: true, color: "secondary"},
    {icon: 'block', tool: 'Rechazar', state: true, color: "secondary"},
    {icon: 'assignment', tool: 'Ver Historial', state: true, color: "secondary"},
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
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) {
    this.url = baseUrl;
    /* buscar */

  }

  ngOnInit(): void {

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    //Cuando pTipo=1 se muestra el boton para modificar
    //Cuando pTipo=2 se muestra el boton para guardar
    this.pTipo = 1;

    let user = localStorage.getItem('currentUser'); //encriptacion del usuario
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');


    this.formOrdenCompra = this.formBuilder.group({
      txtSolicitante: ['', Validators.required],
      txtCampana: ['', Validators.required],
      cboTipoOrden: ['', Validators.required],
      txtCliente: ['', Validators.required],
      txtCodigo: [''],

      txtEstado: ['', Validators.required],
      txtAnio: [''],
      txtComprador: [''],
      FechaCreacion: [''],
      //============================
      cbFechaSolicitud: [''],
      nId_Proveedor: ['', Validators.required],
      txtNumReq: ['', Validators.required],
      txtContacto: ['', Validators.required],

      cboMoneda: ['', Validators.required],
      txtTipoCambio: [''],
      txtCredito: ['', Validators.required],
      txtTitulo: ['', Validators.required],
      cboBanco: ['', Validators.required],

      txtCantidad: [''],
      txtPrecio: [''],
      txtTotal: [''],
      txtPorc: [''],
      Dolares: [''],
      Soles: ['']
    })

    this.formDetracciones = this.formBuilder.group({
      txtPorcentaje: [0, [Validators.min(0), Validators.max(1)]],
      txtSoles: [0],
      txtDolares: [0],
    })

    this.formInformacion = this.formBuilder.group({
      cbFechaEntrega: ['', Validators.required],
      cboLugarEntrega: ['', Validators.required],
      txtDireccion: [''],
      cbServicio: [false],
      cbIGV: [true],
      txtIGV: [0],
      txtSerivicio: [0, [Validators.min(0), Validators.max(1)]],
      txtSoles: [0],
      txtTotalSoles: [0],
      txtSolesServicio: [0],
      txtSolesIGV: [0],
      txtDolares: [0],
      txtTotalDolares: [0],
      txtDolaresIGV: [0],
      txtDolaresServicio: [0],
    })

    this.fnListarOC();

    this.onToggleFab(1,-1);
  }
  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }
  //=========================================

  //#region Botones

  onToggleFab(fab: number, stat: number) {

    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
  }

  async clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnDevolver();
        break;
      case 1:
        this.fnRechazar();
        break;
      case 2:
        this.fnAbrirDialogHistorialEstados();
        break;
      case 3:
        this.fnSalir();
        break;
      default:
        break;
    }
  }

  //listado del detalle
  fnListarDetalle() {
    this.pParametro = []

    this.pEntidad = 1
    this.pOpcion = 2
    this.pTipo = 3;
    this.pParametro.push(this.idGastoCosto)

    this.service.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {
      this.oDetalle = data;

      this.dataSource = new MatTableDataSource(this.oDetalle);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.calcularTotales();
      this.fnCalcularDetracciones();
    })
  }

  //listado para modificar
  fnListarOC() {
    this.pParametro = []

    this.pEntidad = 1
    this.pOpcion = 2
    this.pTipo = 2;
    this.pParametro.push(this.idGastoCosto)

    this.service.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: OrdenCompra[]) => {
      this.gastoCostoSeleccionado = data[0];
      this.fnListarDetalle();
      this.fnVerDetalle(this.gastoCostoSeleccionado);

    })
  }

  fnVerDetalle(p: OrdenCompra) {
    this.formOrdenCompra.controls.txtCampana.setValue(p.sCampana);
    this.formOrdenCompra.controls.txtSolicitante.setValue(p.sSolic);
    this.formOrdenCompra.controls.txtContacto.setValue(p.sContacto);
    this.formOrdenCompra.controls.txtCredito.setValue(p.nPlazoPago);

    this.formOrdenCompra.controls.cboTipoOrden.setValue(p.sTipoOC);
    this.formOrdenCompra.controls.txtCliente.setValue(p.sCliente);
    this.formOrdenCompra.controls.txtTitulo.setValue(p.sTitulo)
    this.formOrdenCompra.controls.txtAnio.setValue(p.anio)
    this.formOrdenCompra.controls.txtCodigo.setValue(p.sDocumento)
    this.formOrdenCompra.controls.txtComprador.setValue(p.sComprador)
    this.formOrdenCompra.controls.FechaCreacion.setValue(p.sFechaRegistro)
    this.formOrdenCompra.controls.txtTipoCambio.setValue(p.nTipoCambio)
    this.formOrdenCompra.controls.txtNumReq.setValue(p.sReq)
    this.formOrdenCompra.controls.cboMoneda.setValue(p.sMoneda)
    this.formOrdenCompra.controls.txtEstado.setValue(p.sEstado)

    this.formOrdenCompra.controls.cbFechaSolicitud.setValue(p.sFechaSoli);

    this.formDetracciones.controls.txtPorcentaje.setValue(p.nDetraccion);
    this.fnCalcularDetracciones();

    this.formOrdenCompra.controls.nId_Proveedor.setValue(p.sProveedor)
    this.formOrdenCompra.controls.cboBanco.setValue(p.sBanco)

    this.sTipoCambio = p.nTipoCambio;


    this.formInformacion.controls.cbFechaEntrega.setValue(this.gastoCostoSeleccionado.sFecha);

    var IGV = Number(this.gastoCostoSeleccionado.nIgv)
    this.formInformacion.controls.cbIGV.setValue((IGV == 0) ? false : true);
    this.formInformacion.controls.cbIGV.disable();
    var servicio = Number(this.gastoCostoSeleccionado.nServicio)
    this.formInformacion.controls.cbServicio.setValue((servicio == 0) ? false : true);
    this.formInformacion.controls.txtSerivicio.setValue(servicio);
    this.formInformacion.controls.cbServicio.disable();

    this.formInformacion.controls.cboLugarEntrega.setValue(this.gastoCostoSeleccionado.sDireccionEmp);
    this.formInformacion.controls.txtDireccion.setValue(this.gastoCostoSeleccionado.sdireccion);
    this.calcularTotales();
    this.fnCalcularDetracciones();


    //Porcentaje
    this.formInformacion.controls.txtIGV.setValue(IGV * 100);
    this.formInformacion.controls.txtSerivicio.setValue(servicio * 100);

  }

  async fnAbrirDialogHistorialEstados() {

    this.spinner.show();

    await this.fnHistorialDeEstados(this.idGastoCosto);

    const dialogRef = this.dialog.open(DialogOrdenCompraHistorialEstadosComponent, {
      width: '950px',
      data: {
        historial: this.historialDeEstados,
        titulo: this.formOrdenCompra.get("txtCodigo").value
      }
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

    if (this.formInformacion.controls.txtSerivicio.invalid) {
      return;
    }

    let monedaId = this.gastoCostoSeleccionado.nIdMoneda;
    let tipoCambio = parseFloat(this.sTipoCambio)

    let pPieParametros = this.formInformacion.getRawValue();
    let bServicio = pPieParametros.cbServicio;
    let bIGV = pPieParametros.cbIGV;

    let servicio = parseFloat(pPieParametros.txtSerivicio == null ? 0 : pPieParametros.txtSerivicio)
    let igv = parseFloat(pPieParametros.txtIGV) / 100;

    //Para soles
    let subTotalSoles: number = 0, totalSoles: number = 0, solesIGV: number = 0, solesServicio: number = 0;

    //Para los dolares
    let subTotalDolares: number = 0, totalDolares: number = 0, DolaresIGV: number = 0, DolaresServicio: number = 0;

    //Cuando esta en soles
    if (monedaId == 443) {
      this.oDetalle.forEach((value, index) => {
        subTotalSoles += value.precio * value.cantidad
      })

      subTotalSoles = this.fnRedondear(subTotalSoles);
      if (bServicio == true) {
        solesServicio = subTotalSoles * servicio;
        solesServicio = this.fnRedondear(solesServicio);
      }

      if (bIGV == true) {
        solesIGV = subTotalSoles * igv;
        solesIGV = this.fnRedondear(solesIGV);
      }
      totalSoles = this.fnRedondear(solesIGV + solesServicio + subTotalSoles);

      //Convertir a dolares
      subTotalDolares = this.fnRedondear(subTotalSoles / tipoCambio);
      DolaresServicio = this.fnRedondear(solesServicio / tipoCambio)
      DolaresIGV = this.fnRedondear(solesIGV / tipoCambio)
      totalDolares = this.fnRedondear(totalSoles / tipoCambio)
    }
    //cuando esta en dolares
    else {
      this.oDetalle.forEach((value, index) => {
        subTotalDolares += value.precio * value.cantidad
      })

      subTotalDolares = this.fnRedondear(subTotalDolares);
      if (bServicio == true) {
        DolaresServicio = subTotalDolares * servicio;
        DolaresServicio = this.fnRedondear(DolaresServicio);
      }

      if (bIGV == true) {
        DolaresIGV = subTotalDolares * igv;
        DolaresIGV = this.fnRedondear(DolaresIGV);
      }
      totalDolares = this.fnRedondear(DolaresIGV + DolaresServicio + subTotalDolares);

      //Convertir a dolares
      subTotalSoles = this.fnRedondear(subTotalDolares * tipoCambio);
      solesServicio = this.fnRedondear(DolaresServicio * tipoCambio)
      solesIGV = this.fnRedondear(DolaresIGV * tipoCambio)
      totalSoles = this.fnRedondear(totalDolares * tipoCambio)
    }

    //Asignacion a los textBox
    // debugger;
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

    let monedaId = this.gastoCostoSeleccionado.nIdMoneda;
    let tipoCambio = parseFloat(this.sTipoCambio)

    let subTotalSoles: number = 0;
    let subTotalDolares: number = 0;

    let pPieParametros = this.formDetracciones.value;
    let detraccion = pPieParametros.txtPorcentaje;

    if (monedaId == 443) {
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
    this.pMostrar.emit(0);
  }

  fnRedondear(num) {
    var pow = Math.pow(10, 2);
    return Math.round(num * pow) / pow;
  }

  async fnRechazar() {

    const confirma = await Swal.fire({
      title: '¿Desea Continuar?',
      text: 'Se rechazará la orden de compra',
      input: 'textarea',
      inputPlaceholder: "Escriba un mensaje con la razón del rechazo (opcional)",
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

    this.spinner.show();
    this.pParametro = []

    this.pEntidad = 4;
    this.pOpcion = 3;
    this.pTipo = 2;
    this.pParametro.push(this.idGastoCosto);
    this.pParametro.push(this.idUser);
    this.pParametro.push(this.pPais);
    this.pParametro.push(mensaje);


    this.service.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe(
      res => {
        this.fnSalir();
      },
      err => {
        this.spinner.hide();
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );

  }

  async fnDevolver() {

    const confirma = await Swal.fire({
      title: '¿Desea Continuar?',
      text: 'Se devolverá la orden de compra',
      input: 'textarea',
      inputPlaceholder: "Escriba un mensaje con la razón de la devolución (opcional)",
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

    this.spinner.show();
    this.pParametro = []

    this.pEntidad = 4;
    this.pOpcion = 3;
    this.pTipo = 1;
    this.pParametro.push(this.idGastoCosto);
    this.pParametro.push(this.idUser);
    this.pParametro.push(this.pPais);
    this.pParametro.push(mensaje);

    this.service.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe(
      res => {
        this.fnSalir();
      },
      err => {
        this.spinner.hide();
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }


}
