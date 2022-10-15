import { Component, OnInit, Inject, ViewChild, Input, ElementRef, Output, EventEmitter } from '@angular/core';
import { PresupuestosService } from '../../presupuestos.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { MatStepper } from '@angular/material/stepper';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Factura } from '../../registroFactura/registroFactura.component';
// import { fchown } from 'fs';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { DialogFacturaHistorialEstadosComponent } from './dialog-factura-historial-estados/dialog-factura-historial-estados.component';

import * as jsPDF from 'jspdf'
import * as html2canvas from 'html2canvas'
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';


@Component({
  selector: 'app-registroFacturaCrear',
  templateUrl: './registroFacturaCrear.component.html',
  styleUrls: ['./registroFacturaCrear.component.css'],
  animations: [asistenciapAnimations]
})
export class RegistroFacturaCrearComponent implements OnInit {

  @Output() newEvent: EventEmitter<any>; // Para enviarle datos al Padre

  // Variables que viene desde el padre
  @Input() pFactura: Factura;
  @Input() pOpcion: number; //variable para interaccion de pantallas
  @Input() idPerfil: number; //variable para interaccion de pantallas

  @ViewChild('stepper') private myStepper: MatStepper;
  @ViewChild('modalGasto') modalGasto: ElementRef;
  @ViewChild('modalGastoClose') modalGastoClose: ElementRef;

  url: string;
  idUser: number; // Id del usuario
  pNom: string;    // Nombre del usuario
  idEmp: string;  // Id de la empresa del grupo actual
  pPais: string;  // Codigo del Pais de la empresa actual
  vFactura: number = 0;
  vTipo_CC: number = 0;

  nIdTCambio: number = 0;
  nTCambio: number = 0;

  // Formularios
  facturaForm: FormGroup;
  partidaForm: FormGroup;
  tablaForm: FormGroup;
  tablaCCForm: FormGroup;

  // Combobox de busqueda

  // Combobox de busqueda obligatorios
  lCboCentroCosto: any[] = []
  lCboServicio: any[] = [];
  lCboProveedor: any[] = []
  lCboTipoDocumento: any[] = [];
  lCboSolicitante: any[] = []
  lCboCliente: any[] = []
  lCboPartidas: any[] = []
  lCboSucursal: any[] = []
  lCboMoneda: any[] = [];

  // Combobox de modal
  nIndexModificar; // Indice del elemento al modificar
  lCentroCosto = [];
  lSucursal = [];
  lPartida = [];
  lDetalle = [];
  lModDetalle = [];
  lPartidasPorDefecto = []; // Partidas que vienen por defecto en el llenado automatico

  vFechaIni: any

  // Chipsets
  separatorKeysCodes: number[] = [ENTER, COMMA];

  // Chipset Clientes
  chipElementsCliente = [];
  filteredChipCliente: Observable<any[]>;
  @ViewChild("clienteListInput") clienteListInput: ElementRef<HTMLInputElement>;
  @ViewChild("auto") matAutocomplete: MatAutocomplete;

  // Chipset Sucursales
  chipElementsSucursales = [];
  filteredChipSucursal: Observable<any[]>;
  @ViewChild("sucursalListInput") sucursalListInput: ElementRef<HTMLInputElement>;
  @ViewChild("autoSucursal") matAutocompleteSucursal: MatAutocomplete;

  // Chipset Partidas
  chipElementsPartidas = [];
  filteredChipPartida: Observable<any[]>;
  @ViewChild("partidaListInput") partidaListInput: ElementRef<HTMLInputElement>;
  @ViewChild("autoPartida") matAutocompletePartida: MatAutocomplete;

  // Controles del gasto total
  txtTotalPpto = new FormControl;
  txtTotalCC = new FormControl;
  txtGastoAsignadoActual = new FormControl; // Para controlar un gasto mal asignado
  txtGastoRegistroTemporal = new FormControl; // Para controlar un gasto mal asignado en el registro
  txtTipoDocumento = new FormControl; // Para controlar un tipo de documento mal asignado (Si hay registros repetidos no puede ser nulo)

  // Flags
  vTCambio: boolean = false; //Controla si muestra el tipo de cambio solo cuando es Perú
  vModifica: boolean = true; // Controla si se modifica la factura

  vTipoDocumento: boolean = false; // Controla si existe una factura por Recibo por honorarios o Incentivos
  vCambioGasto: boolean = true;
  vImprime: boolean = false; // Controla si se va a imprimir o no

  // Actualizar cada dato de la tabla
  ModificaCampoTablaIndice: any = {
    totalPresupuesto: null,
    mensajePresupuesto: null,
    mensajeCostoFijo: null,
    totalCostoFijo: null
  };

  ModificaCampoTabla: any = {
    indice: null,
    tipoCentroCosto: null,
    tipoCampo: null
  }

  agregarDetalle: boolean = true;
  vModifica2: boolean = true;
  valorCambioMoneda: boolean = false;

  // Control del acordeon
  @ViewChild('matExpUbicacion') matExpUbicacion;

  // Tabla material Ppto
  lppDet = [];
  dsPresupuesto: MatTableDataSource<any>;
  displayedColumnsPpto: string[] = ['nIdGastoDet', 'sCentroCosto', 'sTitulo', 'sSucursal', 'sPartida', 'sPartidaDesc', 'nSaldo', 'nTotal'];

  // Tabla material Costo Fijo
  lccDet = [];
  dsCetroCosto: MatTableDataSource<any>;
  displayedColumnsCC: string[] = ['nIdGastoDet', 'sCentroCosto', 'sTitulo', 'sSucursal', 'sPartida', 'sPartidaDesc', 'nSaldo', 'nTotal'];

  // Historial de estados (Lista para el Dialog)
  historialDeEstados = [];

  // Buscadores de la tabla detalle
  txtFiltroPpto = new FormControl();
  txtFiltroCC = new FormControl();

  // Variables para presupuesto chips con autocomplete
  filteredPresupuesto: Observable<any[]>;
  lPresupuesto: any[] = [];
  chipsPresupuesto: any[] = []; //Esta lista almacena todos los items seleccionados
  @ViewChild('presupuestoInput') presupuestoInput: ElementRef<HTMLInputElement>;
  @ViewChild('autoPresupuesto') autoPresupuesto: MatAutocomplete;

  // Variables para impresion
  variablesImpresion = {
    nIdGastoCosto: 0,
    nIdCentroCosto: 0,
    nIdTipoDocumento: 0
  }

  // Booleano para ver la impresion del reporte
  vVerReporteGasto = false;

  // Booleano para ver si se esta usando en celular
  vDispEsCelular = false;

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'save', tool: 'Guardar', state: true, color: "secondary"},
    {icon: 'edit', tool: 'Modificar', state: true, color: "secondary"},
    {icon: 'clear', tool: 'Cancelar', state: true, color: "secondary"},
    {icon: 'check', tool: 'Aprobar', state: true, color: "secondary"},
    {icon: 'reply', tool: 'Devolver', state: true, color: "secondary"},
    {icon: 'assignment', tool: 'Historial', state: true, color: "secondary"},
    {icon: 'print', tool: 'Imprimir reporte', state: true, color: "secondary"},
    {icon: 'print', tool: 'Imprimir reporte', state: true, color: "secondary"},
    {icon: 'exit_to_app', tool: 'Salir', state: true, color: "warn"},
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  constructor(
    private spinner: NgxSpinnerService,
    private vPresupuestosService: PresupuestosService,
    private formBuilder: FormBuilder,
    @Inject('BASE_URL') baseUrl: string,
    public dialog: MatDialog) {

    // Datos basicos
    const user = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');
    this.url = baseUrl;

    this.newEvent = new EventEmitter();
    this.txtGastoAsignadoActual.setValue(0);
  }

  async ngOnInit(): Promise<void> {

    this.spinner.show();

    // Detectamos el dispositivo (Mobile o PC)
    this.fnDetectarDispositivo();

    // Creacion de los formularios
    this.facturaForm = this.formBuilder.group({
      cboProveedor: [''],
      cboServicio: [null, Validators.required],
      cboTipoDocumento: [null],
      cboSolicitante: [null],
      txtTitulo: [null, Validators.required],
      cboMoneda: [null, Validators.required],
      txtTipoCambio: [null, Validators.required],
      txtFecha: [new Date(), Validators.required],
      txtFactura: [null, Validators.required],
      txtTotal: [0],
      txtTotalConver: [0],
      txtNumeroRQ: [''],
      txtNumero: [''],
      txtCreado: [this.pNom],
      txtFechaCreado: [moment(new Date()).format('DD/MM/YYYY HH:mm:ss')],
      txtEstado: ['Incompleto'],
      txtProveedor: [null, Validators.required],
      txtSolicitante: [null, Validators.required],
      txtChipCliente: [''],
      txtChipSucursal: [''],
      txtPartida: [''],
      txtGastoAsignado: [null, Validators.pattern("^[0-9]+\.?[0-9]*$")],
      txtGastoPendiente: [0]
    });

    this.partidaForm = this.formBuilder.group({
      cboCentroCosto: [null, Validators.required],
      txtDescripcion: [null],
      txtDireccion: [null],
      cboSucursal: [null, Validators.required],
      cboPartida: [null, Validators.required],
      txtMensaje: [""],
      txtMonto: [null, Validators.compose([Validators.required, Validators.min(0)])],
    })

    // Inicializando formulario para actualizar campos desde la tabla
    this.tablaForm = this.formBuilder.group({
      txtMensaje: [null],
      txtTotal: [null]
    });

    // Inicializando formulario para actualizar campos desde la costo fijo
    this.tablaCCForm = this.formBuilder.group({
      txtMensaje: [null],
      txtTotal: [null]
    });

    // Declaracion de filtros
    await this.fnController()

    //Esta mostrando una factura existente
    if (this.pOpcion == 1) {
      await this.fnObtenerData(this.pFactura);
      this.vModifica = true;
      // Muestra la tabla detalle que tiene gastos
      if(this.lppDet.length == 0 && this.lccDet.length != 0){
        this.myStepper.next()
      }
    }
    //Esta agregando una nueva factura
    else {
      this.fnControlFab('Nuevo')
      this.vModifica = false

      //Si cuenta con tipo de cambio
      if (this.pPais == '604') {
        this.vTCambio = true;
        this.valorCambioMoneda = true;
        this.fnTipoCambio();
      }

      // Si es un usuario de logistica, desactivamos el tipo de cambio
      if(this.idPerfil == 614 || this.idPerfil == 2324){
        this.facturaForm.get('cboTipoDocumento').disable();
      }

      await this.fnCrearTablaDetallePresupuesto();
      await this.fnCrearTablaDetalleCentroCostos();
    }

    // Lista de elementos del chipset
    this.filterChipClientePipe();
    this.filterChipSucursalPipe();
    this.filterChipPartidaPipe();

    this.llenarPartidasPorDefecto();

    // Asignar como activo el boton del menu
    this.tsLista = 'active';

    this.spinner.hide();
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
        this.fnAccion(1);
        break;
      case 1:
        this.fnAccion(2);
        break;
      case 2:
        this.fnAccion(3);
        break;
      case 3:
        this.fnAccion(4);
        break;
      case 4:
        this.fnAccion(5);
        break;
      case 5:
        this.fnAbrirDialogHistorialEstados();
        break;
      case 6:
        this.fnImprimirReporteGastoDos();
        break;
      case 7:
        this.fnGenerarNuevaVentana();
        break;
      case 8:
        this.fnSalir();
        break;
      default:
        break;
    }
  }

  fnControlFab(vEstado){

    if (vEstado == 'Pendiente') {

      this.fbLista[0].state = false; // Guardar
      this.fbLista[1].state = true; // Modificar
      this.fbLista[2].state = false; // Cancelar
      this.fbLista[3].state = true; // Aprobar
      this.fbLista[4].state = false; // Devolver
      this.fbLista[5].state = true; // Historial
      this.fbLista[6].state = !this.vDispEsCelular; // Imprimir
      this.fbLista[7].state = this.vDispEsCelular; // Imprimir celular
      this.fbLista[8].state = true; // Salir

    }
    else if (vEstado == 'Aprobado Presupuestos') {

      this.fbLista[0].state = false; // Guardar
      this.fbLista[1].state = false; // Modificar
      this.fbLista[2].state = false; // Cancelar
      this.fbLista[3].state = false; // Aprobar

      // Validar el tipo de perfil (Logistica o comercial)
      if(this.idPerfil == 614 || this.idPerfil == 2324){
        this.fbLista[4].state = false; // Devolver
      }
      else{
        this.fbLista[4].state = true; // Devolver
      }
      this.fbLista[5].state = true; // Historial
      this.fbLista[6].state = !this.vDispEsCelular; // Imprimir
      this.fbLista[7].state = this.vDispEsCelular; // Imprimir celular
      this.fbLista[8].state = true; // Salir

    }
    else if (vEstado == 'Aprobado Logística') {

      this.fbLista[0].state = false; // Guardar
      this.fbLista[1].state = false; // Modificar
      this.fbLista[2].state = false; // Cancelar
      this.fbLista[3].state = false; // Aprobar
      this.fbLista[4].state = true; // Devolver
      this.fbLista[5].state = true; // Historial
      this.fbLista[6].state = !this.vDispEsCelular; // Imprimir
      this.fbLista[7].state = this.vDispEsCelular; // Imprimir celular
      this.fbLista[8].state = true; // Salir

    }
    else if (vEstado == 'Devuelto Presupuestos') {

      this.fbLista[0].state = false; // Guardar

      // Validar el tipo de perfil (Logistica o comercial)
      if(this.idPerfil == 614 || this.idPerfil == 2324){
        this.fbLista[1].state = false; // Modificar
      }
      else{
        this.fbLista[1].state = true; // Modificar
      }

      this.fbLista[2].state = false; // Cancelar
      this.fbLista[3].state = false; // Aprobar
      this.fbLista[4].state = false; // Devolver
      this.fbLista[5].state = true; // Historial
      this.fbLista[6].state = !this.vDispEsCelular; // Imprimir
      this.fbLista[7].state = this.vDispEsCelular; // Imprimir celular
      this.fbLista[8].state = true; // Salir
    }
    else if (vEstado == 'Devuelto Logística') {

      this.fbLista[0].state = false; // Guardar
      this.fbLista[1].state = true; // Modificar
      this.fbLista[2].state = false; // Cancelar
      this.fbLista[3].state = false; // Aprobar
      this.fbLista[4].state = false; // Devolver
      this.fbLista[5].state = true; // Historial
      this.fbLista[6].state = !this.vDispEsCelular; // Imprimir
      this.fbLista[7].state = this.vDispEsCelular; // Imprimir celular
      this.fbLista[8].state = true; // Salir

    }
    else if (vEstado == 'Edicion') {

      this.fbLista[0].state = true; // Guardar
      this.fbLista[1].state = false; // Modificar
      this.fbLista[2].state = true; // Cancelar
      this.fbLista[3].state = false; // Aprobar
      this.fbLista[4].state = false; // Devolver
      this.fbLista[5].state = true; // Historial
      this.fbLista[6].state = false; // Imprimir
      this.fbLista[7].state = false; // Imprimir celular
      this.fbLista[8].state = true; // Salir

    }
    else if (vEstado == 'Nuevo') {

      this.fbLista[0].state = true; // Guardar
      this.fbLista[1].state = false; // Modificar
      this.fbLista[2].state = false; // Cancelar
      this.fbLista[3].state = false; // Aprobar
      this.fbLista[4].state = false; // Devolver
      this.fbLista[5].state = false; // Historial
      this.fbLista[6].state = false; // Imprimir
      this.fbLista[7].state = false; // Imprimir celular
      this.fbLista[8].state = true; // Salir

    }

    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion

  //#region Tabla detalle

  // Creacion de la tabla detalle Presupuesto
  fnCrearTablaDetallePresupuesto(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dsPresupuesto = new MatTableDataSource(this.lppDet);
      resolve();
    });
  }

  // Creacion de la tabla detalle Costo Fijo
  fnCrearTablaDetalleCentroCostos(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dsCetroCosto = new MatTableDataSource(this.lccDet);
      resolve();
    });
  }

  // Filtro de busqueda de tablas detalle presupuesto
  fnFiltrarPresupuestos(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsPresupuesto.filter = filterValue.trim().toLowerCase();
  }

  // Filtro de busqueda de tablas detalle costo fijo
  fnFiltrarCentroCostos(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsCetroCosto.filter = filterValue.trim().toLowerCase();
  }

  //#endregion

  //#region Llenado y validacion de los controles

  // Calcular el tipo de cambio de la moneda
  fnTipoCambio = function () {

    var pParametro = [];
    pParametro.push(this.pPais);
    this.vPresupuestosService.fnPresupuesto(1, 2, pParametro, 7, 0, this.url).subscribe(
      res => {
        if (res.length == 0) {
          this.nIdTCambio = 0;
          this.nTCambio = 0;
          this.facturaForm.controls.txtTipoCambio.setValue(0);

          Swal.fire('¡Verificar!', 'No se a registrado el tipo de cambio para el día de hoy', 'warning')
          this.vbtnGuardar = false;
          return;
        }
        else {
          this.nIdTCambio = res[0].nIdTipoCambio;
          this.nTCambio = parseFloat(res[0].nTipoCambio).toFixed(4)
          this.facturaForm.controls.txtTipoCambio.setValue(this.nTCambio)
        }
      },
      err => {
        console.log(err);
        this.spinner.hide();
      },
      () => {
        this.spinner.hide();
      }
    );

  }

  // Llenado de controles para la cabecera del detalle
  async fnController() {

    let pParametro = [];
    pParametro.push(this.pPais);

    //Datos iniciales
    this.facturaForm.controls.txtTotal.setValue(0.00);

    //Recuperar la lista de busqueda sensitiva para Proveedor
    this.lCboProveedor = await this.vPresupuestosService.fnPresupuesto2(1, 2, pParametro, 2, this.url);

    //Recuperar la lista de busqueda sensitiva para Solicitante
    pParametro = [];
    pParametro.push(this.idEmp);
    this.lCboSolicitante = await this.vPresupuestosService.fnPresupuesto2(1, 2, pParametro, 3, this.url);

    //Recuperar la lista de busqueda sensitiva para tipos de documento
    pParametro = [];
    this.lCboTipoDocumento = await this.vPresupuestosService.fnPresupuesto2(1, 2, pParametro, 17, this.url);

    //Recuperar la lista de busqueda por chipset para Clientes
    pParametro = [];
    pParametro.push(this.idEmp)
    this.lCboCliente = await this.vPresupuestosService.fnPresupuesto2(1, 2, pParametro, 10, this.url);

    //Recuperar la lista de busqueda por chipset para Sucursales
    pParametro = [];
    pParametro.push(this.idEmp)
    this.lCboSucursal = await this.vPresupuestosService.fnPresupuesto2(1, 2, pParametro, 11, this.url);

    //Recuperar la lista de busqueda por chipset para Partidas
    pParametro = [];
    pParametro.push(this.pPais)
    this.lCboPartidas = await this.vPresupuestosService.fnPresupuesto2(1, 2, pParametro, 12, this.url);

    //Recuperar la lista de partidas que vienen por defecto en el chipset Partidas
    pParametro = [];
    pParametro.push(this.pPais)
    this.lPartidasPorDefecto = await this.vPresupuestosService.fnPresupuesto2(1, 2, pParametro, 13, this.url);


    //Recuperar lista de busqueda sensitiva de servicios disponibles
    pParametro = [];
    pParametro.push(this.pPais);
    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);
    this.lCboServicio = await this.vPresupuestosService.fnPresupuesto2(1, 2, pParametro, 6, this.url);
    this.facturaForm.get("cboServicio").setValue(this.lCboServicio[0].nId);

    // Metodo que devuele la lista de tipos de monedas registradas disponibles
    pParametro = [];
    pParametro.push(this.pPais);
    this.lCboMoneda = await this.vPresupuestosService.fnPresupuesto2(1, 2, pParametro, 4, this.url);
    let nParam;
    this.lCboMoneda.forEach(element => {
      if (element.nParam > 0) {
        nParam = element.nId;
      }
    });
    this.facturaForm.get('cboMoneda').setValue(nParam);
  }

  // Metodo para recuperar presupuestos del cliente para validacion de llenado automatico de partidas
  async recuperarPresupuestosPorCliente(idCliente: number) {
    let pParametro = [];
    pParametro.push(idCliente);
    return await this.vPresupuestosService.fnPresupuesto2(1, 2, pParametro, 14, this.url);
  }

  // Metodo para guardar tipo de documento al seleccionar combobox
  fnGuardarTipoDocumento() {
    this.txtTipoDocumento.setValue(this.facturaForm.get("cboTipoDocumento").value);
  }

  // Metodo para validar si hay un tipo de documento
  fnVerificarTipoDocumento() {
    const tipoDocumento = this.facturaForm.get("cboTipoDocumento").value;
    if (tipoDocumento != null) {

      // Verificar si hay mas de un presupuesto
      const existenPresupuestosDiferentes = this.lppDet.find((presupuesto) => {
        if(presupuesto.nIdCentroCosto != this.lppDet[0].nIdCentroCosto){
          return presupuesto
        }
      });

      // Verificar si hay mas de un costofijo
      const existenCostoFijosDiferentes = this.lccDet.find((costofijo) => {
        if(costofijo.nIdCentroCosto != this.lccDet[0].nIdCentroCosto){
          return costofijo
        }
      });

      if((this.lppDet.length > 0 && this.lccDet.length > 0) || existenPresupuestosDiferentes || existenCostoFijosDiferentes){
        Swal.fire('¡Verificar!', 'No se puede agregar un tipo de documento si hay más de un presupuesto o costo fijo', 'warning')
        this.facturaForm.get("cboTipoDocumento").setValue(this.txtTipoDocumento.value);
        return;
      }
      this.vTipoDocumento = true;
    }
    else {
      let hayRegistrosRepetidos = false;
      // Buscar si hay registros repetidos en presupuestos
      this.lppDet.map((presupuesto, indexPresupuesto) => {
        const existe = this.lppDet.find((detalle, indexDetalle) => {
          if (indexPresupuesto != indexDetalle) {
            if (presupuesto.nIdCentroCosto == detalle.nIdCentroCosto &&
              presupuesto.nIdSucursal == detalle.nIdSucursal &&
              presupuesto.nIdPartida == detalle.nIdPartida) {
              return detalle;
            }
          }
        });
        if (existe) {
          hayRegistrosRepetidos = true;
        }
      });
      // Buscar si hay registros repetidos en costos fijos
      this.lppDet.map((presupuesto, indexPresupuesto) => {
        const existe = this.lppDet.find((detalle, indexDetalle) => {
          if (indexPresupuesto != indexDetalle) {
            if (presupuesto.nIdCentroCosto == detalle.nIdCentroCosto &&
              presupuesto.nIdSucursal == detalle.nIdSucursal &&
              presupuesto.nIdPartida == detalle.nIdPartida) {
              return detalle;
            }
          }
        });
        if (existe) {
          hayRegistrosRepetidos = true;
        }
      });
      if (hayRegistrosRepetidos) {
        Swal.fire('¡Verificar!', 'Hay dos o mas valores con el mismo presupuesto, partida y/o sucursal en el detalle. Para quitar el tipo de documento, actualice la tabla', 'warning')
        this.facturaForm.get("cboTipoDocumento").setValue(this.txtTipoDocumento.value);
        return;
      }
      this.vTipoDocumento = false;
    }
  }

  // Metodo para validar de que no haya cambios en el gasto asignado
  fnVerificarCambioGastoAsignado() {

    // Recuperar el nuevo saldo tope y gasto total del detalle
    const nuevoGastoAsignado = parseFloat(this.facturaForm.get("txtGastoAsignado").value);
    const total = parseFloat(this.facturaForm.get('txtTotal').value);

    // Si el nuevo gasto es negativo, se regresa
    if(nuevoGastoAsignado < 0){
      Swal.fire('¡Verificar!', 'El nuevo gasto asignado: ' + nuevoGastoAsignado + ' no puede ser negativo', 'warning');

      const actualSaldoTope = this.txtGastoAsignadoActual.value;

      if (actualSaldoTope == 0) {
        this.facturaForm.get("txtGastoAsignado").setValue(null);
      }
      else {
        this.facturaForm.get("txtGastoAsignado").setValue(actualSaldoTope);
      }

      return;
    }

    // Si el total gastado es mayor al saldo tope, salta una alerta y revierte cambios
    if (total > nuevoGastoAsignado) {
      Swal.fire('¡Verificar!', 'El nuevo gasto asignado: ' + nuevoGastoAsignado + ' no cubre el gasto actual del detalle: ' + total, 'warning');

      const actualSaldoTope = this.txtGastoAsignadoActual.value;

      if (actualSaldoTope == 0) {
        this.facturaForm.get("txtGastoAsignado").setValue(null);
      }
      else {
        this.facturaForm.get("txtGastoAsignado").setValue(actualSaldoTope);
      }
    }
    // Si el total es menor, guarda el nuevo saldo tope
    else {
      if (isNaN(nuevoGastoAsignado)) {
        this.txtGastoAsignadoActual.setValue(0);
      }
      else {
        this.facturaForm.get("txtGastoAsignado").setValue(nuevoGastoAsignado.toFixed(4))
        this.txtGastoAsignadoActual.setValue(nuevoGastoAsignado.toFixed(4));
      }
    }

    if (this.facturaForm.get("txtGastoAsignado").value != null || this.facturaForm.get("txtGastoAsignado").value != "") {
      this.facturaForm.get("txtGastoPendiente").setValue(parseFloat(this.txtGastoAsignadoActual.value) - parseFloat(this.facturaForm.get("txtTotal").value))
    }
  }

  //#endregion

  //#region Carga de datos de la factura

  async fnObtenerData (vFactura: any) {
    // Traemos todos los datos de la cabecera de la factura
    var pParametro = [];
    pParametro.push(vFactura);

    const data = await this.vPresupuestosService.fnPresupuesto2(1, 2, pParametro,5,this.url);

    await this.fnCargarControles(data[0])
    //Traer detalle
    await this.fnTablaDetalle(data[0].nIdGastoCosto)

    await this.fnHistorialDeEstados(data[0].nIdGastoCosto)
    //
    await this.fnDeshabilitarControles();
  }

  // Si se esta viendo una factura ya existente, cargar todos los campos
  async fnCargarControles(data) {

    this.vFactura = data.nIdGastoCosto
    this.nIdTCambio = data.nIdTipoCambio
    this.vFechaIni = data.sFecha

    // Monto total calculado
    let vTotalFact = data.nTotalPP + data.nTotalCC

    // Variable de impresion
    this.variablesImpresion.nIdGastoCosto = this.vFactura;

    this.facturaForm.patchValue({
      // Valores de la cabecera
      txtTitulo: data.sTitulo,
      txtProveedor: data.nIdProveedor,
      txtSolicitante: data.nIdSolicitante,
      cboServicio: data.nIdTipoGasto,
      txtTipoCambio: parseFloat(data.nTipoCambio).toFixed(4),
      cboMoneda: data.nIdMoneda,
      txtFactura: data.sFactura,
      txtNumeroRQ: data.sDocFisico,
      cboTipoDocumento: data.nTipoDeposito,
      txtFecha: data.sFecha,
      // Valores totales del detalle
      txtTotalPpto: parseFloat(data.nTotalPP).toFixed(4),
      txtTotalCC: parseFloat(data.nTotalCC).toFixed(4),
      txtTotal: parseFloat(vTotalFact).toFixed(4),
      txtTotalConver: (parseFloat(vTotalFact) / parseFloat(data.nTipoCambio)).toFixed(4),
      txtGastoAsignado: parseFloat(vTotalFact).toFixed(4),
      // Datos de creacion del documento
      txtNumero: data.sNumero,
      txtCreado: data.sUsrRegistro,
      txtFechaCreado: data.sFechaRegistro,
      txtEstado: data.sEstado

    })

    if (this.facturaForm.controls.cboTipoDocumento.value) {
      this.vTipoDocumento = true; // Hay un tipo documento
      this.txtTipoDocumento.setValue(this.facturaForm.controls.cboTipoDocumento.value);
    }

    this.fnControlFab(data.sEstado);
  }

  async fnDeshabilitarControles () {
    // this.facturaForm.get('cboSolicitante').disable();
    this.facturaForm.get('txtGastoAsignado').disable();
    this.facturaForm.get('cboTipoDocumento').disable();
    this.facturaForm.get('txtSolicitante').disable();
    this.facturaForm.get('txtProveedor').disable();
    this.facturaForm.get('txtTitulo').disable();
    this.facturaForm.get('cboServicio').disable();
    this.facturaForm.get('cboProveedor').disable();
    this.facturaForm.get('cboMoneda').disable();
    this.facturaForm.get('txtFactura').disable();
    this.facturaForm.get('txtNumeroRQ').disable();
    this.facturaForm.get('txtFecha').disable();
    this.facturaForm.get('txtTotal').disable();
  }

  // Llenamos las tablas detalle presupuestos y costos fijos
  async fnTablaDetalle(vIdFactura) {

    // Recuperamos detalle de Presupuestos
    let pParametro = [];
    pParametro.push(vIdFactura);
    pParametro.push(2034);//Cuando es Presupuestos Cliente
    this.lppDet = await this.vPresupuestosService.fnPresupuesto2(2, 2, pParametro, 1, this.url)
    await this.fnCrearTablaDetallePresupuesto();

    // Recuperamos detalle de Costos Fijos
    pParametro = [];
    pParametro.push(vIdFactura);
    pParametro.push(2033);//Cuando es Centro de costos
    this.lccDet = await this.vPresupuestosService.fnPresupuesto2(2, 2, pParametro, 1, this.url)
    await this.fnCrearTablaDetalleCentroCostos();

    // Guardamos el presupuesto de tener un tipo documento para impresion
    if (this.facturaForm.get("cboTipoDocumento").value != null) {
      if (this.lppDet.length > 0) {
        this.variablesImpresion.nIdCentroCosto = this.lppDet[0].nIdCentroCosto
      }
      else if (this.lccDet.length > 0){
        this.variablesImpresion.nIdCentroCosto = this.lccDet[0].nIdCentroCosto
      }
      // Guardamos el tipo de documento para la impresion
      this.variablesImpresion.nIdTipoDocumento = this.facturaForm.get("cboTipoDocumento").value;
    }

    // Activamos la posibilidad de impresion
    this.vImprime = true;
  }

  async fnHistorialDeEstados(vIdFactura){
    const pParametro = [];
    pParametro.push(vIdFactura);
    this.historialDeEstados = await this.vPresupuestosService.fnPresupuesto2(2, 2, pParametro, 19, this.url);
  }

  //#endregion

  //#region Chipset de cliente, sucursal y partidas para llenado automatico

  //#region Chipset Cliente

  // Listar los clientes
  filterChipClientePipe() {
    this.filteredChipCliente = this.facturaForm.get("txtChipCliente").valueChanges.pipe(
      startWith(""),
      map((value) => (typeof value === "string" ? value : value?.sDescripcion)),
      map((presupuesto) =>
        presupuesto ? this._filterCliente(presupuesto) : this.lCboCliente.slice()
      )
    );
  }

  // Agregar un cliente en la lista
  fnAgregarChipCliente(event): void {
    const input = event.input;
    const value = event.value;

    // Agregamos si es que tiene un Id
    if (value.nId) {
      // Validamos que el presupuesto no se haya agregado
      if (this.chipElementsCliente.findIndex((item) => item.nId == value.nId) == -1) {
        this.chipElementsCliente.push(value);
      }
    }

    // Reseteamos el input
    if (input) {
      input.value = "";
    }
    this.facturaForm.patchValue({ txtChipCliente: "" });
  }

  fnDisplayChipsetCliente(cliente): string {
    return cliente && cliente.sDescripcion ? cliente.sDescripcion : "";
  }

  // Eliminar cliente de la lista
  fnEliminarChipCliente(chipElement): void {
    this.chipElementsCliente = this.chipElementsCliente.filter(
      (item) => item.nId != chipElement.nId
    );
  }

  // Agregar un cliente por seleccion
  fnSeleccionarChipCliente(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value;
    if (value.nId) {
      //Validamos que el presupuesto no se haya agregado
      if (this.chipElementsCliente.findIndex((item) => item.nId == value.nId) == -1) {
        this.chipElementsCliente.push(value);
      }
    }
    this.clienteListInput.nativeElement.value = "";
    this.facturaForm.patchValue({ txtChipCliente: "" });
  }

  // Filtrar clientes
  private _filterCliente(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.lCboCliente.filter((cliente) =>
      cliente.sDescripcion.toLowerCase().includes(filterValue)
    );
  }

  //#endregion

  //#region Chipset Sucursal
  filterChipSucursalPipe() {
    this.filteredChipSucursal = this.facturaForm.get("txtChipSucursal").valueChanges.pipe(
      startWith(""),
      map((value) => (typeof value === "string" ? value : value?.sDescripcion)),
      map((presupuesto) =>
        presupuesto ? this._filterSucursal(presupuesto) : this.lCboSucursal.slice()
      )
    );
  }

  fnAgregarChipSucursal(event): void {
    const input = event.input;
    const value = event.value;

    // Agregamos si es que tiene un Id
    if (value.nId) {
      // Validamos que el presupuesto no se haya agregado
      if (this.chipElementsSucursales.findIndex((item) => item.nId == value.nId) == -1) {
        this.chipElementsSucursales.push(value);
      }
    }

    // Reseteamos el input
    if (input) {
      input.value = "";
    }
    this.facturaForm.patchValue({ txtChipSucursal: "" });
  }

  fnDisplayChipsetSucursal(sucursal): string {
    return sucursal && sucursal.sDescripcion ? sucursal.sDescripcion : "";
  }

  fnEliminarChipSucursal(chipElement): void {
    this.chipElementsSucursales = this.chipElementsSucursales.filter(
      (item) => item.nId != chipElement.nId
    );
  }

  fnSeleccionarChipSucursal(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value;
    if (value.nId) {
      //Validamos que el presupuesto no se haya agregado
      if (this.chipElementsSucursales.findIndex((item) => item.nId == value.nId) == -1) {
        this.chipElementsSucursales.push(value);
      }
    }
    this.sucursalListInput.nativeElement.value = "";
    this.facturaForm.patchValue({ txtChipSucursal: "" });
  }

  private _filterSucursal(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.lCboSucursal.filter((sucursal) =>
      sucursal.sDescripcion.toLowerCase().includes(filterValue)
    );
  }

  fnAgregarTodasLasSucursales() {
    this.lCboSucursal.map((sucursal) => {
      if (this.chipElementsSucursales.findIndex((item) => item.nId == sucursal.nId) == -1) {
        this.chipElementsSucursales.push(sucursal);
      }
    })
  }

  fnQuitarTodasLasSucursales() {
    if (this.chipElementsSucursales.length > 0) {
      this.chipElementsSucursales = [];
    }
  }
  //#endregion

  //#region Chipset Partida
  filterChipPartidaPipe() {
    this.filteredChipPartida = this.facturaForm.get("txtPartida").valueChanges.pipe(
      startWith(""),
      map((value) => (typeof value === "string" ? value : value?.sDescripcion)),
      map((partida) =>
        partida ? this._filter(partida) : this.lCboPartidas.slice()
      )
    );
  }

  fnAgregarChipPartida(event): void {
    const input = event.input;
    const value = event.value;

    // Agregamos si es que tiene un Id
    if (value.nId) {
      // Validamos que el presupuesto no se haya agregado
      if (this.chipElementsPartidas.findIndex((item) => item.nId == value.nId) == -1) {
        this.chipElementsPartidas.push(value);
      }
    }

    // Reseteamos el input
    if (input) {
      input.value = "";
    }
    this.facturaForm.patchValue({ txtPartida: "" });
  }

  fnDisplayChipsetPartida(partida): string {
    return partida && partida.sDescripcion ? partida.sDescripcion : "";
  }

  fnEliminarChipPartida(chipElement): void {
    this.chipElementsPartidas = this.chipElementsPartidas.filter(
      (item) => item.nId != chipElement.nId
    );
  }

  fnSeleccionarChipPartida(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value;
    if (value.nId) {
      //Validamos que el presupuesto no se haya agregado
      if (this.chipElementsPartidas.findIndex((item) => item.nId == value.nId) == -1) {
        this.chipElementsPartidas.push(value);
      }
    }
    this.partidaListInput.nativeElement.value = "";
    this.facturaForm.patchValue({ txtPartida: "" });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.lCboPartidas.filter((presupuesto) =>
      presupuesto.sDescripcion.toLowerCase().includes(filterValue)
    );
  }

  llenarPartidasPorDefecto() {
    this.lPartidasPorDefecto.map(partida => {
      this.chipElementsPartidas.push(partida);
    })
  }
  //#endregion

  //#endregion

  //#region Modal para agregar y modificar gastos a la factura

  // Modal para agregar o modificar el gasto
  async fnModalGasto(vTipo) {

    this.spinner.show();

    this.nIndexModificar = null; // No hay indice de modificacion, no se modifica nada

    //Si aun hay datos Obligatorios muestra mensaje y corta el proceso
    if (this.facturaForm.invalid) {
      this.facturaForm.markAllAsTouched();
      this.spinner.hide();
      Swal.fire('¡Verificar!', 'Existen datos obligatorios por completar antes de añadir detalle al documento.', 'warning');
      return;
    }

    if(this.vTipoDocumento){
      const tipoDocumento = this.lCboTipoDocumento.find(tipo => tipo.nId == this.facturaForm.get("cboTipoDocumento").value).sDescripcion;
      if (vTipo == 1 && this.lccDet.length > 0) {
        Swal.fire('¡Verificar!', 'Ya hay registrado un costo fijo. Si se está realizando una factura por ' + tipoDocumento + ' solo puede registrar un presupuesto o costo fijo a la vez', 'warning');
        this.spinner.hide();
        return;
      }
      else if (vTipo == 2 && this.lppDet.length > 0){
        Swal.fire('¡Verificar!', 'Ya hay registrado un presupuesto. Si se está realizando una factura por ' + tipoDocumento + ' solo puede registrar un presupuesto o costo fijo a la vez', 'warning');
        this.spinner.hide();
        return;
      }
    }


    let pParametro = [];

    // Si es costos fijos y el mes esta bloqueado, returnar
    if (vTipo != 1) {
      pParametro.push(this.idEmp);
      pParametro.push(moment(this.facturaForm.get("txtFecha").value).format('DD/MM/YYYY'));

      const estadoMes = await this.vPresupuestosService.fnPresupuesto2(2, 2, pParametro, 20, this.url);

      if(parseInt(estadoMes) == 0){
        Swal.fire('¡Verificar!', 'El mes del que se quiere agregar el gasto está cerrado', 'warning')
        return;
      }
    }

    let vTipoCC: number
    //Limpiamos las listas relacionadas
    this.lModDetalle = []
    this.lCentroCosto = []
    this.lSucursal = []
    this.lPartida = []

    // Limpiar formulario
    this.partidaForm.controls.cboCentroCosto.setValue(null);
    this.partidaForm.controls.cboSucursal.setValue(null);
    this.partidaForm.controls.cboPartida.setValue(null);
    this.partidaForm.controls.txtMensaje.setValue(null);
    this.partidaForm.controls.txtMonto.setValue(null);
    this.partidaForm.get('cboCentroCosto').enable();
    this.partidaForm.get('cboSucursal').enable();
    this.partidaForm.get('txtMensaje').enable();
    this.partidaForm.get('cboPartida').enable();
    this.partidaForm.controls['txtMensaje'].setErrors(null);
    this.partidaForm.controls['txtMonto'].setErrors(null);
    this.partidaForm.controls['cboPartida'].setErrors(null);
    this.partidaForm.markAsUntouched();

    if (vTipo == 1) {
      vTipoCC = 2034;
      this.vTipo_CC = 1; // Tipo Ppto
    }
    else {
      vTipoCC = 2033
      this.vTipo_CC = 2; // Tipo CCI
    }

    // Listar presupuestos
    pParametro = [];
    pParametro.push(vTipoCC);
    pParametro.push(this.idEmp);
    this.lCentroCosto = await this.vPresupuestosService.fnPresupuesto2(2, 2, pParametro, 3, this.url);

    // Si hay un tipo de documento, se selecciona el presupuesto por defecto
    if (this.vTipoDocumento) {
      if (this.lppDet.length != 0 && this.vTipo_CC == 1) {
        this.partidaForm.get("cboCentroCosto").setValue(this.lppDet[0].nIdCentroCosto);
        this.fnModalSucursal();
        this.partidaForm.get("cboCentroCosto").disable();
      }
      else if (this.lccDet.length != 0 && this.vTipo_CC == 2) {
        this.partidaForm.get("cboCentroCosto").setValue(this.lccDet[0].nIdCentroCosto);
        this.fnModalSucursal();
        this.partidaForm.get("cboCentroCosto").disable();
        console.log(this.partidaForm.get("cboCentroCosto").value)
      }
    }
    else{
      this.partidaForm.get("cboCentroCosto").enable();
    }

    this.modalGasto.nativeElement.click();//Muestro el modal para asignar el detalle de la factura
    this.spinner.hide();

  }

  // Actualizar la sucursal en base al item de presupuesto / costo fijo
  async fnModalSucursal() {
    this.spinner.show();
    let vCentroCosto = this.partidaForm.value.cboCentroCosto

    //Limpiamos las listas relacionadas
    this.lSucursal = []
    this.lPartida = []
    this.partidaForm.controls.cboSucursal.setValue(null);
    this.partidaForm.controls.cboPartida.setValue(null);

    // Listar sucursales del presupuesto
    var pParametro = [];
    pParametro.push(vCentroCosto);
    this.lSucursal = await this.vPresupuestosService.fnPresupuesto2(2, 2, pParametro, 4, this.url)
    this.spinner.hide();
  }

  // Actualizar la sucursal en base a la partida y al servicio seleccionado en la cabecera
  async fnModalPartida() {

    let vCentroCosto, vSucursal, vServicio

    vCentroCosto = this.partidaForm.get("cboCentroCosto").value
    vSucursal = this.partidaForm.get("cboSucursal").value
    vServicio = this.facturaForm.get("cboServicio").value


    //Limpiamos las listas relacionadas
    this.lPartida = []
    this.partidaForm.controls.cboPartida.setValue(null);

    this.spinner.show();

    // Inicializar parametros
    var pParametro = [];
    pParametro.push(vCentroCosto);
    pParametro.push(vSucursal);
    pParametro.push(vServicio);
    this.lPartida  = await this.vPresupuestosService.fnPresupuesto2(2, 2, pParametro, 5, this.url)
    console.log(this.lPartida);

    // Si hay un tipo de documento, se selecciona la partida por defecto como ayuda al usuario
    if (this.vTipoDocumento) {

      if (this.lppDet.length != 0 && this.vTipo_CC == 1) {
        // Verificar si la partida existe en la sucursal
        const partida = this.lPartida.find(partida => partida.nId == this.lppDet[0].nIdPartida);
        if (partida) {
          this.partidaForm.get("cboPartida").setValue(this.lppDet[0].nIdPartida);
        }
        else {
          this.partidaForm.get("cboPartida").setValue(null);
        }
      }
      else if (this.lccDet.length != 0 && this.vTipo_CC == 2) {
        // Verificar si la partida existe en la sucursal
        const partida = this.lPartida.find(partida => partida.nId == this.lppDet[0].nIdPartida);
        if (partida) {
          this.partidaForm.get("cboPartida").setValue(this.lccDet[0].nIdPartida);
        }
        else {
          this.partidaForm.get("cboPartida").setValue(null);
        }
      }
    }

    this.spinner.hide();
  }

  //#endregion

  //#region Control CRUD del detalle de  la factura
  async fnAgregarListaDetalle() {
    this.spinner.show()

    this.agregarDetalle = false;
    let vCentroCosto: number = 0, vSucursal: number = 0, vPartida: number = 0, vMonto: number, vSaldo: number = 0
    let vCentroCostoDsc: string, vSucursalDsc: string, vPartidaDsc: string, vMsg: string = "", vFecha: any, vMensaje: string;

    vCentroCosto = this.partidaForm.get("cboCentroCosto").value;
    vSucursal = this.partidaForm.value.cboSucursal
    vPartida = this.partidaForm.value.cboPartida
    vMonto = this.partidaForm.value.txtMonto ? this.partidaForm.value.txtMonto : 0;
    vMensaje = this.partidaForm.value.txtMensaje
    vFecha = this.facturaForm.value.txtFecha

    if (this.partidaForm.invalid) {
      this.partidaForm.markAllAsTouched();
      //Si aun hay datos Obligatorios muestra mensaje y corta el proceso
      Swal.fire('¡Verificar!', 'Existen datos obligatorios para agregar en el detalle.', 'warning')
      this.spinner.hide();
      this.agregarDetalle = true;
      return;
    }

    // Verificar que si hay un tipo de documento, el presupuesto o costi fijo sea el mismo
    if(this.vTipoDocumento){
      const tipoDocumento = this.lCboTipoDocumento.find(tipo => tipo.nId == this.facturaForm.get("cboTipoDocumento").value).sDescripcion;
      if(this.lppDet.length > 0){
        if(vCentroCosto != this.lppDet[0].nIdCentroCosto){
          Swal.fire('¡Verificar!', 'Si se está haciendo una factura por ' + tipoDocumento + " es necesario que todos los gastos sean del mismo presupuesto", 'warning')
          this.agregarDetalle = true;
          this.spinner.hide();
          return;
        }
      }
      else if(this.lccDet.length > 0){
        if(vCentroCosto != this.lccDet[0].nIdCentroCosto){
          Swal.fire('¡Verificar!', 'Si se está haciendo una factura por ' + tipoDocumento + " es necesario que todos los gastos sean del mismo costo fijo", 'warning')
          this.agregarDetalle = true;
          this.spinner.hide();
          return;
        }
      }
    }

    // Si el monto es superior al saldo tope
    if (this.facturaForm.get('txtGastoAsignado').value != null || this.facturaForm.get('txtGastoAsignado').value != '') {
      // Si se esta agregando
      if (this.lModDetalle.length == 0) {
        if (parseFloat(this.facturaForm.get('txtGastoAsignado').value) < parseFloat(this.facturaForm.get('txtTotal').value) + vMonto) {
          Swal.fire('¡Verificar!', 'El monto asignado: ' + vMonto + ' hace que el valor total: ' + parseFloat(this.facturaForm.get('txtTotal').value) + ' supere al declarado en el gasto asignado: ' + parseFloat(this.facturaForm.get('txtGastoAsignado').value), 'warning')
          this.agregarDetalle = true;
          this.spinner.hide();
          return;
        }
      }
      // Si se esta modificando
      else {
        if (parseFloat(this.facturaForm.get('txtGastoAsignado').value) < parseFloat(this.facturaForm.get('txtTotal').value) - this.lModDetalle[0].nMonto + vMonto) {
          Swal.fire('¡Verificar!', 'El monto asignado: ' + vMonto + ' hace que el valor total: ' + parseFloat(this.facturaForm.get('txtTotal').value) + ' supere al declarado en el gasto asignado: ' + parseFloat(this.facturaForm.get('txtGastoAsignado').value), 'warning')
          this.agregarDetalle = true;
          this.spinner.hide();
          return;
        }
      }
    }

    if (this.lModDetalle.length == 0) //si no esta modificando entonces entra a la validación
    {

      // funcion que nos indica si ya esta registrado en la lista del mat-table

      if (this.vTipo_CC == 1 && !this.vTipoDocumento) //Ingresando detalle de presupuesto
      {
        // Antes de agregar previamente validamos que no exista el mismo registro
        for (let index = 0; index < this.lppDet.length; index++) {
          if (this.lppDet[index].nIdCentroCosto == vCentroCosto && this.lppDet[index].nIdSucursal == vSucursal && this.lppDet[index].nIdPartida == vPartida) {
            Swal.fire('¡Verificar!', 'Ya existe un registro asignado en el detalle con el mismo presupuesto, sucursal y partida. Seleccione otra partida', 'warning')
            this.partidaForm.controls.txtMonto.setValue('')
            this.agregarDetalle = true;
            this.spinner.hide();
            return;
          }
        }
      }
      else if (this.vTipo_CC == 2 && !this.vTipoDocumento)//Ingresando detalle de Centro de Costo
      {
        // Antes de agregar previamente validamos que no exista el mismo registro
        for (let index = 0; index < this.lccDet.length; index++) {
          if (this.lccDet[index].nIdCentroCosto == vCentroCosto && this.lccDet[index].nIdSucursal == vSucursal && this.lccDet[index].nIdPartida == vPartida) {
            Swal.fire('¡Verificar!', 'Ya existe un registro asignado en el detalle con el mismo centro de costo, sucursal y partida. Seleccione otra partida', 'warning')
            this.partidaForm.controls.txtMonto.setValue('')
            this.agregarDetalle = true;
            this.spinner.hide();
            return;
          }
        }
      }

    }
    else { //traemos los datos de la lista de la partida seleccionada
      vCentroCosto = this.lModDetalle[0].nIdCentroCosto
      vSucursal = this.lModDetalle[0].nIdSucursal
      vPartida = this.lModDetalle[0].nIdPartida
    }

    //Validamos saldo disponible
    let pParametro = [];
    let vDatos = this.facturaForm.value;

    pParametro.push(vCentroCosto);
    pParametro.push(vSucursal);
    pParametro.push(vPartida);

    if (this.pOpcion == 1) { //Factura ya registrada
      if (moment(vDatos.txtFecha).format('DD/MM/YYYY') == this.vFechaIni) {
        pParametro.push(moment(vDatos.txtFecha).format('DD/MM/YYYY'))
        pParametro.push(2)
      }
      else {
        pParametro.push(moment(vDatos.txtFecha).format('DD/MM/YYYY'))
        pParametro.push(1)
      }
    }
    else {
      pParametro.push(moment(vDatos.txtFecha).format('DD/MM/YYYY'))
      pParametro.push(1)
    }

    this.vPresupuestosService.fnPresupuesto(2, 2, pParametro, 8, 0, this.url).subscribe(
      async res => {
        vSaldo = res;

        if(vSaldo == -1){
          Swal.fire('¡Verificar!', 'El mes del que se quiere agregar el gasto está cerrado', 'warning')
          this.partidaForm.controls.txtMonto.setValue('')
          this.spinner.hide();
          this.agregarDetalle = true;
          return;
        }

        if (this.vTipo_CC == 1) // Si es un presupuesto
        {
          // Validar resguardo del presupuesto
          let pParametro = [];
          pParametro.push(vCentroCosto);
          const cantidadResguardo = await this.vPresupuestosService.fnPresupuesto2(2, 2, pParametro, 21, this.url)
          const registro = this.lppDet.find(detalle => detalle.nIdCentroCosto == vCentroCosto);

          // Recuperar gasto general si hay un presupuesto repetido
          let gastoTotalPorPresupuesto = 0;
          this.lppDet.map(detalle => {
            if(detalle.nIdCentroCosto == vCentroCosto){
              gastoTotalPorPresupuesto += detalle.nTotal
            }
          });

          if ((cantidadResguardo - gastoTotalPorPresupuesto) < 0) {
            //Si El resultado del resguardo menos lo que esta solicitando es menor a cero entonces muestro mensaje
            Swal.fire('¡Verificar!', 'Este gasto total de ' + (vMonto * 100 / 100).toFixed(2) + ', supera el límite del resguardo: ' + (cantidadResguardo * 100 / 100).toFixed(2) + ' del presupuesto ' +  registro.sCentroCosto, 'warning')

            return;
          }
        }

        // Recuperamos gasto general por partida repetida
        let gastoTotalPorPartida = 0;
        this.lppDet.map(detalle => {
          if(detalle.nIdCentroCosto == vCentroCosto && detalle.nIdSucursal == vSucursal && detalle.nIdPartida == vPartida){
            gastoTotalPorPartida += detalle.nTotal
          }
        });

        this.lccDet.map(detalle => {
          if(detalle.nIdCentroCosto == vCentroCosto && detalle.nIdSucursal == vSucursal && detalle.nIdPartida == vPartida){
            gastoTotalPorPartida += detalle.nTotal
          }
        });

        if ((vSaldo - (gastoTotalPorPartida + vMonto)) < 0) {
          //Si El resultado del saldo menos lo que esta solicitando es menor a cero entonces muestro mensaje
          Swal.fire('¡Verificar!', 'El monto del gasto ' + (vMonto * 100 / 100).toFixed(2) + ', es superior al saldo actual: ' + (vSaldo * 100 / 100).toFixed(2) + ' de la partida en la sucursal seleccionada ' + vMsg, 'warning')
          this.partidaForm.controls.txtMonto.setValue('')
          this.spinner.hide();
          this.agregarDetalle = true;
          return;
        }
        else {
          //Buscar Descripciones
          for (let index = 0; index < this.lCboPartidas.length; index++) {
            if (this.lCboPartidas[index].nId == vPartida) {
              vPartidaDsc = this.lCboPartidas[index].sDescripcion;
              break;
            }

          }
          for (let index = 0; index < this.lCboSucursal.length; index++) {
            if (this.lCboSucursal[index].nId == vSucursal) {
              vSucursalDsc = this.lCboSucursal[index].sDescripcion;
              break;
            }
          }
          for (let index = 0; index < this.lCentroCosto.length; index++) {
            if (this.lCentroCosto[index].nId == vCentroCosto) {
              vCentroCostoDsc = this.lCentroCosto[index].sDescripcion;
              break;
            }
          }

          let vCod = vPartidaDsc.substr(0, 4);
          vPartidaDsc = vPartidaDsc.substr(7, 60);

          if (this.vTipo_CC == 1) //Ingresando detalle de presupuesto
          {
            //Validamos si existe gasto
            if (this.nIndexModificar !== null) {
              this.lppDet[this.nIndexModificar].nPrecio = vMonto;
              this.lppDet[this.nIndexModificar].nTotal = vMonto;
              this.lppDet[this.nIndexModificar].sTitulo = vMensaje;
            }
            else {
              this.lppDet.push({
                nCantidad: 1, nIdCentroCosto: vCentroCosto, nIdDepositario: 0, nIdGastoCosto: 0,
                nIdGastoDet: 0, nIdPartida: vPartida, nIdSucursal: vSucursal, nPrecio: vMonto, nTotal: vMonto, sCentroCosto: vCentroCostoDsc, sPartida: vCod,
                sPartidaDesc: vPartidaDsc, sSucursal: vSucursalDsc, nSaldo: (vSaldo * 100 / 100), sTitulo: vMensaje
              })
            }
            // Creamos la tabla
            await this.fnCrearTablaDetallePresupuesto();
          }
          else //Ingresando detalle de centro de costo
          {
            //Validamos si existe gasto
            if (this.nIndexModificar) {
              this.lccDet[this.nIndexModificar].nPrecio = vMonto;
              this.lccDet[this.nIndexModificar].nTotal = vMonto;
              this.lccDet[this.nIndexModificar].sTitulo = vMensaje;
            }
            else {
              this.lccDet.push({
                nCantidad: 1, nIdCentroCosto: vCentroCosto, nIdDepositario: 0, nIdGastoCosto: 0,
                nIdGastoDet: 0, nIdPartida: vPartida, nIdSucursal: vSucursal, nPrecio: vMonto, nTotal: vMonto, sCentroCosto: vCentroCostoDsc, sPartida: vCod,
                sPartidaDesc: vPartidaDsc, sSucursal: vSucursalDsc, nSaldo: (vSaldo * 100 / 100), sTitulo: vMensaje
              })
            }
            await this.fnCrearTablaDetalleCentroCostos();
          }

          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Se agregó al detalle',
            showConfirmButton: false,
            timer: 1500
          })

          this.partidaForm.controls.txtMonto.setValue(null)
          this.partidaForm.controls.txtMensaje.setValue(null)
          if (this.vTipoDocumento) {
            this.partidaForm.controls.cboPartida.setValue(vPartida)
          }
          else {
            this.partidaForm.controls.cboPartida.setValue(null)
          }

          // Limpiar errores
          this.partidaForm.controls['txtMonto'].setErrors(null);
          this.partidaForm.controls['cboPartida'].setErrors(null);
          this.partidaForm.controls['txtMensaje'].setErrors(null);
          this.partidaForm.markAsUntouched();

          if (this.nIndexModificar !== null) {
            this.modalGastoClose.nativeElement.click();
          }

          await this.fnCalcularTotales();
        }
      },
      err => {
        console.log(err);
        this.spinner.hide();
      },
      () => {
        this.spinner.hide();
      }
    );
    this.spinner.hide()

    this.agregarDetalle = true;
  }

  // Metodo para agregar a la lista valores automaticamente segun Presupuesto, Sucursal y Partida
  async fnAgregarAutomaticamenteListaDetalle() {

    this.spinner.show();

    // Si aun hay datos obligatorios muestra mensaje de alerta y corta el proceso
    if (this.facturaForm.invalid) {
      this.facturaForm.markAllAsTouched();
      Swal.fire('¡Verificar!', 'Existen datos obligatorios para agregar en el detalle.', 'warning')
      this.spinner.hide();
      return;
    }

    // Convertimos las listas en una cadena separada por comas
    let listaClientes: string[] = [];
    let listaSucursales: string[] = [];
    let listaPartidas: string[] = [];
    this.chipElementsCliente.map(cliente => listaClientes.push(cliente.nId))
    this.chipElementsSucursales.map(sucursales => listaSucursales.push(sucursales.nId))
    this.chipElementsPartidas.map(partidas => listaPartidas.push(partidas.nId))

    // Si una de las listas esta vacia
    if (listaClientes.length === 0 || listaSucursales.length === 0 || listaPartidas.length === 0) {
      Swal.fire('¡Verificar!', 'Se necesita seleccionar aunque sea un cliente, una sucursal y una partida', 'warning')
      this.spinner.hide();
      return;
    }

    const pParametro = [];
    pParametro.push(this.idEmp);
    pParametro.push(listaClientes.join(','));
    pParametro.push(listaSucursales.join(','));
    pParametro.push(listaPartidas.join(','));

    //Metodo que devuelve la lista del detalle generado automaticamente
    const nuevosRegistros = await this.vPresupuestosService.fnPresupuesto2(2, 2, pParametro, 15, this.url);
    const registrosActuales = this.lppDet;
    if(nuevosRegistros.length == 0){
      Swal.fire('¡Verificar!', 'No se encontró ninguna partida en base a esos filtros', 'warning')
      return;
    }

    // Agregar solo si no existen
    nuevosRegistros.map( registro => {
      const existeRegistro = registrosActuales.find(detalle => registro.nIdCentroCosto == detalle.nIdCentroCosto && registro.nIdSucursal == detalle.nIdSucursal && registro.nIdPartida == detalle.nIdPartida)
      if(!existeRegistro){
        this.lppDet.push(registro);
      }
    });

    // Crear la tabla
    await this.fnCrearTablaDetallePresupuesto();

    this.matExpUbicacion.close()

    this.spinner.hide();
  }

  async fnEliminarRegistrosEnCero() {
    Swal.fire({
      title: 'Eliminar registros',
      text: "Se eliminarán todos los registros que tengan valor total cero, ¿Continuar?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {

        let registrosFactura;
        await Promise.all(
          registrosFactura = this.lppDet.filter(presupuesto => presupuesto.nPrecio != 0)
        )
        await Promise.all(
          registrosFactura = registrosFactura.filter(presupuesto => presupuesto.nTotal != 0)
        )

        this.lppDet = registrosFactura;

        await this.fnCrearTablaDetallePresupuesto();
      }
      else {
        return;
      }
    });
  }

  async fnEliminaDetalle(index: number, vTipo: number) {

    if (vTipo == 1) //Para el control de Presupuestos
    {

      Swal.fire({
        title: 'Eliminar detalle:',
        text: "¿Desea eliminar el registro de gasto?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          Swal.fire(
            {
              position: 'center',
              icon: 'success',
              title: 'Se retiro del detalle',
              showConfirmButton: false,
              timer: 1500
            }
          )

          this.lppDet.splice(index, 1)

          // Crear la tabla
          await this.fnCrearTablaDetallePresupuesto();

          await this.fnCalcularTotales();
        }
      })
    }
    else //Para el control de Centros de costo
    {

      Swal.fire({
        title: '¿Desea Eliminar el registro de gasto?',
        text: "¡Favor de confirmar!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          Swal.fire(
            {
              position: 'center',
              icon: 'success',
              title: 'Se retiro del detalle',
              showConfirmButton: false,
              timer: 1500
            }
          )

          // Retiramos los controles
          this.tablaCCForm = this.formBuilder.group({});

          // Retiramos el item del detalle
          this.lccDet.splice(index, 1)

          // Crear tabla detalle
          await this.fnCrearTablaDetalleCentroCostos();

          await this.fnCalcularTotales()
        }
      })

    }

  }

  // Abrir modal para modificar registro
  fnModificaDetalle(index: number, vTipo: number) {

    this.nIndexModificar = index;
    this.lModDetalle = []
    this.lCentroCosto = []
    this.lSucursal = []
    this.lPartida = []

    if (vTipo == 1) //Para el control de Presupuestos
    {
      this.vTipo_CC = 1  //Ingresando detalle de presupuesto
      let vCc: any = { nId: this.lppDet[index].nIdCentroCosto, sDescripcion: this.lppDet[index].sCentroCosto }
      this.lCentroCosto.push(vCc)

      let vSu: any = { nId: this.lppDet[index].nIdSucursal, sDescripcion: this.lppDet[index].sSucursal }
      this.lSucursal.push(vSu)

      let vPa: any = { nId: this.lppDet[index].nIdPartida, sDescripcion: this.lppDet[index].sPartida + ' - ' + this.lppDet[index].sPartidaDesc }
      this.lPartida.push(vPa)

      this.partidaForm.controls.cboCentroCosto.setValue(this.lppDet[index].nIdCentroCosto);
      this.partidaForm.controls.cboSucursal.setValue(this.lppDet[index].nIdSucursal);
      this.partidaForm.controls.cboPartida.setValue(this.lppDet[index].nIdPartida || null);
      this.partidaForm.controls.txtMonto.setValue(this.lppDet[index].nTotal);
      this.partidaForm.controls.txtMensaje.setValue(this.lppDet[index].sTitulo);

      //Cargando la lista que significa que se esta modificando un registro de detalle
      this.lModDetalle.push({ nIdCentroCosto: this.lppDet[index].nIdCentroCosto, nIdSucursal: this.lppDet[index].nIdSucursal, nIdPartida: this.lppDet[index].nIdPartida, nMonto: this.lppDet[index].nTotal })

    }
    else {
      this.vTipo_CC = 2  //Ingresando detalle de Centro Costos

      let vCc: any = { nId: this.lccDet[index].nIdCentroCosto, sDescripcion: this.lccDet[index].sCentroCosto }
      this.lCentroCosto.push(vCc)

      let vSu: any = { nId: this.lccDet[index].nIdSucursal, sDescripcion: this.lccDet[index].sSucursal }
      this.lSucursal.push(vSu)

      let vPa: any = { nId: this.lccDet[index].nIdPartida, sDescripcion: this.lccDet[index].sPartida + ' - ' + this.lccDet[index].sPartidaDesc }
      this.lPartida.push(vPa)

      this.partidaForm.controls.cboCentroCosto.setValue(this.lccDet[index].nIdCentroCosto);
      this.partidaForm.controls.cboSucursal.setValue(this.lccDet[index].nIdSucursal);
      this.partidaForm.controls.cboPartida.setValue(this.lccDet[index].nIdPartida);
      this.partidaForm.controls.txtMonto.setValue(this.lccDet[index].nTotal);

      //Cargando la lista que significa que se esta modificando un registro de detalle
      this.lModDetalle.push({ nIdCentroCosto: this.lccDet[index].nIdCentroCosto, nIdSucursal: this.lccDet[index].nIdSucursal, nIdPartida: this.lccDet[index].nIdPartida, nMonto: this.lccDet[index].nTotal })

    }

    this.partidaForm.get('cboCentroCosto').disable();
    this.partidaForm.get('cboSucursal').disable();
    this.partidaForm.get('cboPartida').disable();

    this.modalGasto.nativeElement.click();//Muestro el modal para asignar el detalle de la factura

  }

  async fnCalcularTotales(): Promise<void> {
    return new Promise((resolve, reject) => {
      let vTotalCC = 0, vTotalPP: number = 0, vTotal: number = 0;

      //Calcular el nuevo total
      for (let index = 0; index < this.lccDet.length; index++) {
        vTotalCC = vTotalCC + parseFloat(this.lccDet[index].nTotal);
      }

      for (let index = 0; index < this.lppDet.length; index++) {
        vTotalPP = vTotalPP + parseFloat(this.lppDet[index].nTotal);;
      }

      let vTipoCambio = this.facturaForm.value.txtTipoCambio

      //Calcular gran total y Asignar valores
      vTotal = vTotalPP + vTotalCC
      this.txtTotalPpto.setValue((vTotalPP).toFixed(4))
      this.txtTotalCC.setValue((vTotalCC).toFixed(4))
      this.facturaForm.controls.txtTotal.setValue((vTotal).toFixed(4))
      this.facturaForm.controls.txtTotalConver.setValue((vTotal * vTipoCambio).toFixed(4))

      if (this.facturaForm.get("txtGastoAsignado").value != null || this.facturaForm.get("txtGastoAsignado").value != "") {
        const gastoPendiente = (parseFloat(this.txtGastoAsignadoActual.value) - parseFloat(this.facturaForm.get("txtTotal").value)).toFixed(4)
        this.facturaForm.get("txtGastoPendiente").setValue(gastoPendiente);
      }

      resolve();
    })
  }

  //#endregion

  //#region Control de la factura

  async fnAccion(vTipo) {

    if (vTipo == 1) //Cuando se esta guardando el registro de factura cebecera//Detalle
    {

      // Si no hay registros muestra mensaje y corta el proceso
      if (this.lppDet.length == 0 && this.lccDet.length == 0) {
        Swal.fire('¡Verificar!', 'Aun no ha registrado ningun detalle del gasto (Presupuesto/Costo Fijo).', 'warning')
        return;
      }

      //Si aun hay datos obligatorios muestra mensaje y corta el proceso
      if (this.facturaForm.invalid) {
        this.facturaForm.markAllAsTouched();
        Swal.fire('¡Verificar!', 'Existen datos obligatorios para guardar el documento.', 'warning')
        return;
      }

      // Si hay un tipo de documento revisamos en las dos tablas para verificar que solo haya un tipo de presupuesto o costo fijo
      if (this.vTipoDocumento){
        const tipoDocumento = this.lCboTipoDocumento.find(tipo => tipo.nId == this.facturaForm.get("cboTipoDocumento").value).sDescripcion;

        if (this.lppDet[0]) {
          const primerRegistroPresupuesto = this.lppDet[0].nIdCentroCosto;
          const existeOtroCostoPresupuesto = this.lppDet.find(detalle => detalle.nIdCentroCosto != primerRegistroPresupuesto);
          // Recorremos presupuestos para ver que todos sean iguales
          if (existeOtroCostoPresupuesto) {
            Swal.fire('¡Verificar!', 'Si se está haciendo una factura por ' + tipoDocumento + " es necesario que todos los gastos sean del mismo presupuesto", 'warning')
            return;
          }
        }
        else if (this.lccDet[0]) {
          const primerRegistroCostoFijo = this.lccDet[0].nIdCentroCosto;
          const existeOtroCostoFijo = this.lccDet.find(detalle => detalle.nIdCentroCosto != primerRegistroCostoFijo);
          // Recorremos costo fijos para ver qur todos sean iguales
          if (existeOtroCostoFijo) {
            Swal.fire('¡Verificar!', 'Si se está haciendo una factura por ' + tipoDocumento + " es necesario que todos los gastos sean del mismo costo fijo", 'warning')
            return;
          }
        }
      }

      //Zona de confirmacion de guardado
      Swal.fire({
        title: '¿Desea guardar la factura?',
        text: "Se guardarán las modificaciones realizadas",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {

          // Buscar si hay registros con valor cero
          let existenTotalesEnCero = false;

          for (let i = 0; i < this.lppDet.length; i++) {
            if (this.lppDet[i].nTotal == 0) {
              existenTotalesEnCero = true;
              break;
            }
          }

          if (existenTotalesEnCero) {
            Swal.fire({
              title: 'Se encontraron registros con totales en cero',
              text: "Se eliminarán todos los registros que tengan valor total cero, ¿Continuar?",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Aceptar',
              cancelButtonText: 'Cancelar'
            }).then(async (result) => {
              if (result.isConfirmed) {

                // Eliminar registros con valor cero
                this.lppDet = this.lppDet.filter(presupuesto => presupuesto.nTotal != 0 || presupuesto.nPrecio != 0);
                await this.fnCrearTablaDetallePresupuesto();
                await this.fnGuardarRegistrosDetalle();
              }
              else {
                return;
              }
            });
          }

          else {
            await this.fnGuardarRegistrosDetalle()
          }
        }
      })
    }
    else if (vTipo == 2) //Cuando queremos modificar se pone en 'edicion' del Documento
    {
      this.vModifica = false
      this.pOpcion = 1;
      this.fnControlFab('Edicion')
      this.fnHabilitaControles()
      // Asignar el gasto asignado
      this.txtGastoAsignadoActual.setValue(parseFloat(this.facturaForm.get('txtTotal').value).toFixed(4));
      this.facturaForm.get('txtGastoAsignado').setValue(parseFloat(this.facturaForm.get('txtTotal').value).toFixed(4));
    }
    else if (vTipo == 3) //Cuando le damos cancelar a la edicion   del Documento
    {

      Swal.fire({
        title: '¿Desea cancelar la edición?',
        text: "Se perderá los cambios realizados",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {

          this.vModifica = true
          this.fnControlFab('Pendiente');
          await this.fnObtenerData(this.pFactura)
          await this.fnDeshabilitarControles()

        }
      })

    }
    else if (vTipo == 4) //Cuando es Aprobar Documento, cambia de estado para que se considere en cuenta corriente
    {

      const confirma = await Swal.fire({
        title: '¿Desea aprobar la Factura?',
        text: 'Cambiará el estado y se ingresará en la cuenta corriente',
        //input: 'textarea',
        //inputPlaceholder: "Escriba un mensaje con la razón de la aprobación (opcional)",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
      });

      //const { value: mensaje } = confirma;

      if (!confirma.isConfirmed) {
        return;
      }

      this.spinner.show();

      // Validar los saldos de todos los registros
      const saldoValido = await this.fnValidarTodosLosSaldosDelDetalle();
      if(!saldoValido){
        return;
      }

      const pParametro = [];
      pParametro.push(this.vFactura);
      pParametro.push(this.idUser);
      pParametro.push(this.vFechaIni)
      pParametro.push(2)
      pParametro.push(this.pPais);
      pParametro.push(''); // Este parametro es para mensajes (Al aprobar, ya no se usa)

      // Si es un perfil logistico, aprobamos por logistica
      if(this.idPerfil == 614 || this.idPerfil == 2324){
        pParametro.push("2344");
      }
      // Si es un perfil de presupuestos, aprobamos por presupuestos
      else{
        pParametro.push("2055");
      }

      this.lDetalle = [] //Limpiamos la lista de todos el detalle

      //Recorriendo las dos tabas para guardar la informacion
      for (let index = 0; index < this.lppDet.length; index++) {
        this.lDetalle.push(this.lppDet[index]);
      }

      for (let index = 0; index < this.lccDet.length; index++) {
        this.lDetalle.push(this.lccDet[index])
      }

      this.vPresupuestosService.fnPresupuesto(1, 5, pParametro, 1, this.lDetalle, this.url).subscribe(
        res => {
          if (res.cod != 1 && res.cod > 0)//cuando devuelve una observacion del saldo de item Partida.
          {
            Swal.fire('¡Atención!', 'Se detecto que no cuenta con saldo disponible en: ' + res.mensaje, 'warning')
            return;
          }
          else if (res.cod = 0) {
            Swal.fire('¡Atención!', 'Problemas para Aprobar el documento, verifique su conexion a internet.', 'error')
            return;
          }
          else //cuando se prueba el registra correctamente
          {
            Swal.fire(
              {
                position: 'center',
                icon: 'success',
                title: 'Se actualizo correctamente',
                showConfirmButton: false,
                timer: 1500
              }
            )

            // Si es un perfil logistico, mostramos aprobado por logistica
            if(this.idPerfil == 614 || this.idPerfil == 2324){
              this.facturaForm.controls.txtEstado.setValue('Aprobado Logística')
              this.fnControlFab('Aprobado Logística')
            }
            // Si es un perfil de presupuestos, mostramos aprobado por presupuestos
            else{
              this.facturaForm.controls.txtEstado.setValue('Aprobado Presupuestos')
              this.fnControlFab('Aprobado Presupuestos')
            }


            this.spinner.hide();
          }

        });
    }
    else if (vTipo == 5) // Cuando es Devolver Documento, sale de cuenta corriente
    {

      const confirma = await Swal.fire({
        title: '¿Desea devolver la Factura?',
        text: 'Cambiara el estado y se retirará en la cuenta corriente',
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

      var pParametro = [];
      pParametro.push(this.vFactura);
      pParametro.push(this.idUser);
      pParametro.push(this.pPais);
      const estado = this.facturaForm.get("txtEstado").value

      if(this.idPerfil == 614 || this.idPerfil == 2324){
        pParametro.push(2364);
      }
      // Si es un perfil de presupuestos, aprobamos por presupuestos
      else{
        pParametro.push(2100);
      }

      pParametro.push(mensaje);

      this.vPresupuestosService.fnPresupuesto(1, 5, pParametro, 2, 0, this.url).subscribe(
        res => {
          if (res == 0)//cuando devuelve error
          {
            Swal.fire('¡Atención!', 'Problemas para Devolver el documento, verifique su conexion a internet.', 'error')
            return;
          }
          else //cuando se prueba el registra correctamente
          {
            Swal.fire(
              {
                position: 'center',
                icon: 'success',
                title: 'Se devolvió la factura',
                showConfirmButton: false,
                timer: 1500
              }
            )

            // Si es un perfil logistico, mostramos aprobado por logistica
            if(this.idPerfil == 614 || this.idPerfil == 2324){
              this.facturaForm.controls.txtEstado.setValue('Devuelto Logística')
              this.fnControlFab('Devuelto Logística')
            }
            // Si es un perfil de presupuestos, mostramos aprobado por presupuestos
            else{
              this.facturaForm.controls.txtEstado.setValue('Devuelto Presupuestos')
              this.fnControlFab('Devuelto Presupuestos')
            }

            this.spinner.hide();
          }
        },
        err => {
          console.log(err);
          this.spinner.hide();
        },
        () => {
          this.spinner.hide();
        }
      );
    }
  }

  async fnGuardarRegistrosDetalle() {

    this.spinner.show();

    // Validar los saldos de todos los registros
    const saldoValido = await this.fnValidarTodosLosSaldosDelDetalle();
    if(!saldoValido){
      this.spinner.hide();
      return;
    }

    if (parseFloat(this.txtGastoAsignadoActual.value) != parseFloat(this.facturaForm.get("txtTotal").value)) {
      Swal.fire('¡Verificar!', 'La factura no cumple con el debido gasto asignado ', 'warning')
      this.spinner.hide();
      return;
    }

    this.lDetalle = [] //Limpiamos nuestra lista contenedor
    //Recorriendo las dos tablas para guardar la informacion
    for (let index = 0; index < this.lppDet.length; index++) {
      this.lDetalle.push(this.lppDet[index]);
    }

    for (let index = 0; index < this.lccDet.length; index++) {
      this.lDetalle.push(this.lccDet[index])
    }

    console.log(this.lDetalle);

    const pParametro = [];
    let vDatos = this.facturaForm.value;

    pParametro.push(vDatos.txtSolicitante);
    pParametro.push('FS');
    pParametro.push(vDatos.txtTitulo);
    pParametro.push(vDatos.txtProveedor);
    pParametro.push(this.nIdTCambio)
    pParametro.push(vDatos.cboMoneda);
    pParametro.push(vDatos.txtFactura);
    pParametro.push(vDatos.txtNumeroRQ);
    pParametro.push(moment(vDatos.txtFecha).format('DD/MM/YYYY'))
    pParametro.push(this.idUser);
    pParametro.push(this.idEmp);
    pParametro.push(vDatos.cboServicio);
    pParametro.push(this.vFactura);
    pParametro.push(this.pPais);
    pParametro.push(vDatos.cboTipoDocumento == 0 ? null : vDatos.cboTipoDocumento);

    let pTipo = this.pOpcion == 1 ? 3 : 1 //Validamos si enviamos a grabar o a modificar el registro

    this.vPresupuestosService.fnPresupuesto(1, pTipo, pParametro, 0, this.lDetalle, this.url).subscribe(
      res => {
        if (res == 0)//cuando devuelve error
        {
          Swal.fire('¡Atención!', 'Problemas para guardar el documento, verifique su conexion a internet.', 'error')
          this.spinner.hide();
          return;
        }
        else //cuando registra correctamente
        {
          Swal.fire(
            {
              position: 'center',
              icon: 'success',
              title: 'Se guardó correctamente',
              showConfirmButton: false,
              timer: 1500
            }
          )

          if (pTipo == 1) {
            this.vFactura = res;
          }
          this.vModifica = true
          this.fnObtenerData(this.vFactura)
        }

      },
      err => {
        console.log(err);
        this.spinner.hide();
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  // Ver el historial de una factura ya existente
  async fnAbrirDialogHistorialEstados() {

    this.spinner.show();

    await this.fnHistorialDeEstados(this.vFactura);

    const dialogRef = this.dialog.open(DialogFacturaHistorialEstadosComponent, {
      width: '950px',
      data: {
        historial: this.historialDeEstados,
        titulo: this.facturaForm.get("txtNumero").value
      }
    });

    dialogRef.afterClosed().subscribe(result => {});
  }

  // Imprimir el reporte de una factura ya existente
  fnImprimirReporte(){
    const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;
    const reporte = document.getElementById('print-reporte-gasto').innerHTML;
    pdfFrame.contentWindow.document.open();
    pdfFrame.contentWindow.document.write(reporte);
    pdfFrame.contentWindow.document.close();
    pdfFrame.contentWindow.print();
  }

  // Metodo para validar todos los saldos del detalle
  async fnValidarTodosLosSaldosDelDetalle(){

    // Listamos Presupuestos, Sucursales y Partidas para enviarlos como parametro
    const lListPresupuesto = [];
    const lListSucursal = [];
    const lListPartidas = [];

    this.lppDet.map( detalle =>{
      if(!lListPresupuesto.includes(detalle.nIdCentroCosto)) lListPresupuesto.push(detalle.nIdCentroCosto)
      if(!lListSucursal.includes(detalle.nIdSucursal)) lListSucursal.push(detalle.nIdSucursal)
      if(!lListPartidas.includes(detalle.nIdPartida)) lListPartidas.push(detalle.nIdPartida)
    })

    this.lccDet.map( detalle =>{
      if(!lListPresupuesto.includes(detalle.nIdCentroCosto)) lListPresupuesto.push(detalle.nIdCentroCosto)
      if(!lListSucursal.includes(detalle.nIdSucursal)) lListSucursal.push(detalle.nIdSucursal)
      if(!lListPartidas.includes(detalle.nIdPartida)) lListPartidas.push(detalle.nIdPartida)
    })

    // Recuperamos los saldos actuales en base a los valores de la tabla (Presupuestos, Sucursales y Partidas)
    const pParametro = []
    pParametro.push(this.idEmp);
    pParametro.push(lListPresupuesto.join(","))
    pParametro.push(lListSucursal.join(","))
    pParametro.push(lListPartidas.join(","))
    pParametro.push(moment(this.facturaForm.value.txtFecha).format('YYYY-MM-DD'))

    const listaSaldosValidar = await this.vPresupuestosService.fnPresupuesto2(2, 2, pParametro, 18, this.url);

    // Validamos los saldos en presupuestos
    for(let i = 0; i < this.lppDet.length; i++){

      // Validar resguardo del presupuesto
      let pParametro = [];
      pParametro.push(this.lppDet[i].nIdCentroCosto);
      const cantidadResguardo = await this.vPresupuestosService.fnPresupuesto2(2, 2, pParametro, 21, this.url)

      // Recuperar gasto general si hay un presupuesto repetido
      let gastoTotalPorPresupuesto = 0;
      this.lppDet.map(detalle => {
        if(detalle.nIdCentroCosto == this.lppDet[i].nIdCentroCosto){
          gastoTotalPorPresupuesto += detalle.nTotal
        }
      });

      if ((cantidadResguardo - gastoTotalPorPresupuesto) < 0) {
        //Si El resultado del resguardo menos lo que esta solicitando es menor a cero entonces muestro mensaje
        Swal.fire('¡Verificar!', 'Este gasto total de ' + (this.lppDet[i].nTotal * 100 / 100).toFixed(2) + ', hace que se supere el límite del resguardo: ' + (cantidadResguardo * 100 / 100).toFixed(2) + ' del presupuesto ' +  this.lppDet[i].sCentroCosto, 'warning')
        return false;
      }

      // Recuperar gasto general si hay una partida repetida
      let gastoTotalPorPartida = 0;
      this.lccDet.map(detalle => {
        if(detalle.nIdCentroCosto == this.lppDet[i].nIdCentroCosto && detalle.nIdSucursal == this.lppDet[i].nIdSucursal && detalle.nIdPartida == this.lppDet[i].nIdPartida){
          gastoTotalPorPartida += detalle.nTotal
        }
      });

      for(let j = 0; j < listaSaldosValidar.length; j++){
        if(this.lppDet[i].nIdCentroCosto == listaSaldosValidar[j].nIdCentroCosto && this.lppDet[i].nIdSucursal == listaSaldosValidar[j].nIdSucursal && this.lppDet[i].nIdPartida == listaSaldosValidar[j].nIdPartida ){
          if(gastoTotalPorPartida > listaSaldosValidar[j].nSaldo){
            Swal.fire('¡Verificar!', 'Hubo cambios en el saldo del campo Presupuesto: '+ this.lppDet[i].nIdCentroCosto + ' Sucursal: '+ this.lppDet[i].nIdCentroCosto + ' Partida: '+ this.lppDet[i].nIdCentroCosto + '. El saldo disminuyó de ' + this.lppDet[i].nSaldo + ' a ' + listaSaldosValidar[j].nSaldo +'. Se requiere actualizar', 'warning')
            this.lppDet[i].nSaldo = listaSaldosValidar[j].nSaldo;
            return false;
          }
        }
      }
    }

    // Validamos los saldos en costos fijos
    for(let i = 0; i < this.lccDet.length; i++){

      // Recuperar gasto general si hay una partida repetida
      let gastoTotalPorPartida = 0;
      this.lccDet.map(detalle => {
        if(detalle.nIdCentroCosto == this.lppDet[i].nIdCentroCosto && detalle.nIdSucursal == this.lppDet[i].nIdSucursal && detalle.nIdPartida == this.lppDet[i].nIdPartida){
          gastoTotalPorPartida += detalle.nTotal
        }
      });

      for(let j = 0; j < listaSaldosValidar.length; j++){
        if(this.lccDet[i].nIdCentroCosto == listaSaldosValidar[j].nIdCentroCosto && this.lccDet[i].nIdSucursal == listaSaldosValidar[j].nIdSucursal && this.lccDet[i].nIdPartida == listaSaldosValidar[j].nIdPartida ){
          if(gastoTotalPorPartida > listaSaldosValidar[j].nSaldo){
            Swal.fire('¡Verificar!', 'Hubo cambios en el saldo del campo Presupuesto: '+ this.lccDet[i].nIdCentroCosto + ' Sucursal: '+ this.lccDet[i].nIdCentroCosto + ' Partida: '+ this.lccDet[i].nIdCentroCosto + '. El saldo disminuyó de ' + this.lccDet[i].nSaldo + ' a ' + listaSaldosValidar[j].nSaldo +'. Se requiere actualizar', 'warning')
            this.lccDet[i].nSaldo = listaSaldosValidar[j].nSaldo;
            return false;
          }
        }
      }
    }

    return true;
  }
  //#endregion

  //#region Control de la interfaz

  fnHabilitaControles = function () {
    this.facturaForm.get('txtGastoAsignado').enable();

    // Habilitar el tipo de documento solo si no es un perfil logistico
    if(this.idPerfil != 614 && this.idPerfil != 2324){
      this.facturaForm.get('cboTipoDocumento').enable();
    }

    this.facturaForm.get('txtSolicitante').enable();
    this.facturaForm.get('txtSolicitante').enable();
    this.facturaForm.get('txtTitulo').enable();
    this.facturaForm.get('cboServicio').enable();
    this.facturaForm.get('txtProveedor').enable();
    this.facturaForm.get('cboMoneda').enable();
    this.facturaForm.get('txtFactura').enable();
    this.facturaForm.get('txtNumeroRQ').enable();
    this.facturaForm.get('txtFecha').enable();
  }

  fnSalir = function () {
    this.newEvent.emit(1);
  }

  fnNegativo = function () {
    var repartir = this.partidaForm.controls.txtMonto.value;
    repartir = Math.abs(repartir);
    this.partidaForm.controls.txtMonto.setValue(repartir);
  }

  //#endregion


  registroAModificar = {
    mensaje: null,
    total: null
  };
  @ViewChild('inputModificaTabla', { static: false }) inputModificaTabla: ElementRef;

  //#region Pruebas
  fnModificarCampo(registro, tipo: number){
    if(!this.vModifica){
      tipo == 1 ? this.registroAModificar.mensaje = registro : null;
      tipo == 2 ? this.registroAModificar.total = registro : null;
      setTimeout(() => this.inputModificaTabla.nativeElement.focus());
    }
  }

  fnGuardarCampoMensaje (registro, valor: string, tipoCentroCosto: number){

    let indice = null;
    const mensaje = valor;

    if(this.registroAModificar.mensaje == registro){
      this.registroAModificar.mensaje = null;
    }

    // Guardar el indice y el valor segun tipo de centro costo
    if (tipoCentroCosto == 1) {
      indice = this.lppDet.indexOf(registro);
      this.lppDet[indice].sTitulo = mensaje;
    }
    else if (tipoCentroCosto == 2) {
      indice = this.lccDet.indexOf(registro);
      this.lccDet[indice].sTitulo = mensaje;
    }

  }

  async fnGuardarCampoTotal (registro, valor: string, tipoCentroCosto: number){

    const gastoAnterior = parseFloat(registro.nTotal);
    const gastoTotal = parseFloat(this.facturaForm.get('txtTotal').value); // El gasto total de todos los elementos
    const gastoAsignado = parseFloat(this.txtGastoAsignadoActual.value) // El gasto asignado en la cabecera
    const gastoNuevo = parseFloat(valor);
    let indice = null;

    if(this.registroAModificar.total == registro){
      this.registroAModificar.total = null;
    }

    // Guardar el indice y el valor segun tipo de centro costo
    if (tipoCentroCosto == 1) {
      indice = this.lppDet.indexOf(registro);
      this.lppDet[indice].nTotal = gastoNuevo;
      this.lppDet[indice].nPrecio = gastoNuevo;
    }
    else if(tipoCentroCosto == 2){
      indice = this.lccDet.indexOf(registro);
      this.lccDet[indice].nTotal = gastoNuevo;
      this.lccDet[indice].nPrecio = gastoNuevo;
    }

    // Validar formato del gasto y valores positivos
    if ((gastoNuevo < 0) || (isNaN(gastoNuevo) || gastoNuevo == null)) {
      if (tipoCentroCosto == 1) {
        this.lppDet[indice].nTotal = gastoAnterior;
        this.lppDet[indice].nPrecio = gastoAnterior;
      }
      else if(tipoCentroCosto == 2){
        this.lccDet[indice].nTotal = gastoAnterior;
        this.lccDet[indice].nPrecio = gastoAnterior;
      }
      return;
    }

    // Validar que el gasto no incumpla con el maximo de gasto asignado
    if (gastoAsignado < (gastoTotal - gastoAnterior + gastoNuevo)) {
      Swal.fire('¡Verificar!', 'El monto asignado es mayor al declarado en el gasto asignado. Aumente el gasto asignado para realizar cambios', 'warning')
      if (tipoCentroCosto == 1) {
        this.lppDet[indice].nTotal = gastoAnterior;
        this.lppDet[indice].nPrecio = gastoAnterior;
      }
      else if(tipoCentroCosto == 2){
        this.lccDet[indice].nTotal = gastoAnterior;
        this.lccDet[indice].nPrecio = gastoAnterior;
      }
      return;
    }

    if (tipoCentroCosto == 1) {

      // Recuperamos los ids
      const { nIdCentroCosto, nIdSucursal, nIdPartida, sCentroCosto } = this.lppDet[indice];

      // Validar resguardo del presupuesto
      let pParametro = [];
      pParametro.push(nIdCentroCosto);
      const cantidadResguardo = await this.vPresupuestosService.fnPresupuesto2(2, 2, pParametro, 21, this.url)

      // Recuperar gasto general por presupuesto repetido
      let gastoTotalPorPresupuesto = 0;
      this.lppDet.map(detalle => {
        if(detalle.nIdCentroCosto == nIdCentroCosto){
          gastoTotalPorPresupuesto += detalle.nTotal
        }
      });

      if ((cantidadResguardo - gastoTotalPorPresupuesto) < 0) {
        //Si El resultado del resguardo menos lo que esta solicitando es menor a cero entonces muestro mensaje
        Swal.fire('¡Verificar!', 'Este gasto total de ' + (gastoNuevo * 100 / 100).toFixed(2) + ', hace que se supere el límite del resguardo: ' + (cantidadResguardo * 100 / 100).toFixed(2) + ' del presupuesto ' +  sCentroCosto, 'warning')
        this.lppDet[indice].nTotal = gastoAnterior;
        this.lppDet[indice].nPrecio = gastoAnterior;
        return;
      }

      // Ingresamos los parametros del presupuesto, la sucursal, la partida y la fecha
      pParametro = [];
      pParametro.push(nIdCentroCosto);
      pParametro.push(nIdSucursal);
      pParametro.push(nIdPartida);
      pParametro.push(moment(this.facturaForm.value.txtFecha).format('DD/MM/YYYY'));
      const saldo = await this.vPresupuestosService.fnPresupuesto2(2, 2, pParametro, 8, this.url)

      // Actualizamos saldo en la tabla
      this.lppDet[indice].nSaldo = saldo;

      // Recuperamos gasto general por partida repetida
      let gastoTotalPorPartida = 0;
      this.lppDet.map(detalle => {
        if(detalle.nIdCentroCosto == nIdCentroCosto && detalle.nIdSucursal == nIdSucursal && detalle.nIdPartida == nIdPartida){
          gastoTotalPorPartida += detalle.nTotal
        }
      });

      // Validar que el gasto sea menor al saldo
      if ((saldo - gastoTotalPorPartida) < 0) {
        //Si El resultado del saldo menos lo que esta solicitando es menor a cero entonces muestro mensaje
        Swal.fire('¡Verificar!', 'Agregar el gasto de ' + (gastoNuevo * 100 / 100).toFixed(2) + ', hace que se supere el saldo actual: ' + (saldo * 100 / 100).toFixed(2) + ' de la partida en la sucursal seleccionada ', 'warning')
        this.lppDet[indice].nTotal = gastoAnterior;
        this.lppDet[indice].nPrecio = gastoAnterior;
        return;
      }
    }
    else if(tipoCentroCosto == 2){

      //Validamos saldo disponible
      const { nIdCentroCosto, nIdSucursal, nIdPartida } = this.lccDet[indice];

      // Ingresamos los parametros del presupuesto, la sucursal, la partida y la fecha
      let pParametro = [];
      pParametro.push(nIdCentroCosto);
      pParametro.push(nIdSucursal);
      pParametro.push(nIdPartida);
      pParametro.push(moment(this.facturaForm.value.txtFecha).format('DD/MM/YYYY'));
      const saldo = await this.vPresupuestosService.fnPresupuesto2(2, 2, pParametro, 8, this.url)

      // Si el mes esta cerrado corta el proceso
      if(saldo == -1){
        Swal.fire('¡Verificar!', 'El mes del que se quiere agregar el gasto está cerrado', 'warning')
        this.lccDet[indice].nTotal = gastoAnterior;
        this.lccDet[indice].nPrecio = gastoAnterior;
        return;
      }

      // Actualizamos saldo en la tabla
      this.lccDet[indice].nSaldo = saldo;

      // Recuperamos gasto general por partida repetida
      let gastoTotalPorPartida = 0;
      this.lccDet.map(detalle => {
        if(detalle.nIdCentroCosto == nIdCentroCosto && detalle.nIdSucursal == nIdSucursal && detalle.nIdPartida == nIdPartida){
          gastoTotalPorPartida += detalle.nTotal
        }
      });

      // Validar que el gasto sea menor al saldo
      if ((saldo - gastoTotalPorPartida) < 0) {
        //Si El resultado del saldo menos lo que esta solicitando es menor a cero entonces muestro mensaje
        Swal.fire('¡Verificar!', 'El monto del gasto ' + (gastoNuevo * 100 / 100).toFixed(2) + ', es superior al saldo actual: ' + (saldo * 100 / 100).toFixed(2) + ' de la partida en la sucursal seleccionada ', 'warning')
        this.lccDet[indice].nTotal = gastoAnterior;
        this.lccDet[indice].nPrecio = gastoAnterior;
        return;
      }
    }

    // Actualizar total general
    await this.fnCalcularTotales();
  }

  async fnImprimirReporteGasto(){
    this.vVerReporteGasto = true;
    // Agregar nombre al documento
    const tempTitle = document.title;
    document.title = 'Reporte Gasto ' + this.facturaForm.get("txtNumero").value;
    // Impresion
    setTimeout(()=>{
      window.print();
      this.vVerReporteGasto = false;
    })
    document.title = tempTitle;
    return;
  }

  fnImprimirReporteGastoDos () {
    const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;
    const reporte = document.getElementById('print-reporte-gasto').outerHTML;
    pdfFrame.contentWindow.document.open();
    pdfFrame.contentWindow.document.write(reporte);
    pdfFrame.contentWindow.document.close();
    pdfFrame.contentWindow.print();
  }

  fnGenerarNuevaVentana(){
    const divText = document.getElementById("print-reporte-gasto").outerHTML;
    const myWindow = window.open('','','width=985,height=1394');
    const doc = myWindow.document;
    doc.open();
    doc.write(divText);
    doc.close();

    doc.title = 'Reporte Gasto ' + this.facturaForm.get("txtNumero").value;
  }

  fnDetectarDispositivo(){
    const dispositivo = navigator.userAgent;
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(dispositivo)){
      this.vDispEsCelular = true;
    }
    else{
      this.vDispEsCelular = false;
    }
  }

  // Metodo para validar que no se ingresen caracteres especiales
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
