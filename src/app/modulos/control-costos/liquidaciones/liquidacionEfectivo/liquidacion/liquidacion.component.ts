import { Component, ComponentFactoryResolver, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatStepper } from '@angular/material/stepper';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { LiquidacionesService } from '../../liquidaciones.service';
import * as moment from 'moment';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';

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

@Component({
  selector: 'app-liquidacion',
  templateUrl: './liquidacion.component.html',
  styleUrls: ['./liquidacion.component.css'],
  animations: [asistenciapAnimations],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'es-PE'},
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},

    {provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_Format }, DatePipe
  ],
})

export class LiquidacionComponent implements OnInit {
  url: string;
  idUser :number; //id del usuario
  pNom:string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  nLiquidacion: number = 0;
  nIdGasto: number = 0;
  nIdCCosto: number = 0;
  nIdSucursal: number = 0;
  nIdDepositario: number = 0;
  nIdDetalle: number = 0;
  nIdGastoRR: number = 0;
  nPorReparado: number = 0;

  sSucursal: string = '';
  sCCosto: string = '';
  nTipoPresupuesto: number = 0;

  nMontoReem: number = 0;
  vTotalLiq: number = 0;
  lisLiqado = [];
  lBanco = [];
  lPartidas = [];

  vTipoDesc: string = '';
  vUnaPartidaDesc: string = '';
  vTipoAccion: number = 0;

  //Listas de documentos Liquidación
  lDespositoBanco: any= [];
  lDespositoCaja = [];
  lDescuentoPersonal = [];
  lReembolsable = [];
  lGastoReparado = [];
  lDetLiqPartidas = [];
  lCentroCostoReembolso = []

  ldetalleAjustes = []; //lista para todos los casos de los documentos

  // Progress Bar
  pbMain: boolean;

  //Tabla material
  dataSource: MatTableDataSource<any>;
  dataSource2: MatTableDataSource<any>;
  dataSource3: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['nId','sNroDocumento','sFechaDoc', 'sMonto', 'sUsuarioLiq', 'sFechaReg'];
  displayedColumns2: string[] = ['nId','sPartida','sDescripcion', 'sMonto',];
  @ViewChild('modalPartidas') modalPartidas: ElementRef;
  @ViewChild('modalDetalle') modalDetalle: ElementRef;

  // vModifica: boolean = true;
  vModifica: boolean = false;
  // vModifica2: boolean = true;
  vModifica2: boolean = false;
  vPorBanco: boolean = true;
  vUnaPartida: boolean = true;
  vVerReporte: boolean = false;
  vVerReporteRR: boolean = false;
  vVerReporteSM: boolean = false;
  vVerDetalleLiq: boolean = false;

  efectivoForm: FormGroup;
  liquidaForm: FormGroup;
  partidaForm: FormGroup;
  liquidaDetForm : FormGroup;

  //variable para mostrar boton imprimir dscto cuando el valor sea mayor a 0
  valorImpresion: number = 0;
  guardarReembolso = false;

  diferencia: number = 0;
  cCosto = '';

  //Booleanos de impresion
  vImpresionReporte = false;
  vImpresionReporteRR = false;
  vImpresionReporteSM = false;

  @ViewChild('stepper') private myStepper: MatStepper;
  @Input() pLiquidacion: any; // Variables que viene desde el padre

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'edit', tool: 'Editar Liquidación', state: true, disabled: false},
    {icon: 'save', tool: 'Guardar Liquidación', state: true, disabled: false},
    {icon: 'clear', tool: 'Cancelar Edición', state: true, disabled: false},
    {icon: 'print', tool: 'Rq. Efectivo', state: true, disabled: false},
    {icon: 'print', tool: 'Rq. Efectivo', state: true, disabled: false}, // Impresión del celular
    {icon: 'print', tool: 'Rq. Reembolso', state: true, disabled: false},
    {icon: 'print', tool: 'Rq. Reembolso', state: true, disabled: false}, // Impresión del celular
    {icon: 'print', tool: 'S. Movilidad', state: true, disabled: false},
    {icon: 'print', tool: 'S. Movilidad', state: true, disabled: false}, // Impresión del celular
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  // Booleano para ver si se esta usando en celular
  vDispEsCelular = false;

  // Booleano para activar / desactivar boton de guardado
  bGuardar = true;

  constructor(
    private spinner: NgxSpinnerService,
    private vLiquidacionesService: LiquidacionesService ,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute ,
    private datePipe: DatePipe,
    @Inject('BASE_URL') baseUrl: string,)
    { this.url = baseUrl;}

  ngOnInit(): void {

    // Detectamos el dispositivo (Mobile o PC)
    this.fnDetectarDispositivo();

    let user    = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom   = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp  = localStorage.getItem('Empresa');
    this.pPais  = localStorage.getItem('Pais');

    this.efectivoForm  = this.formBuilder.group({
      txtPresupuesto: [''],
      txtDeposito: [''],
      txtCliente: [''],
      txtBanco: [''],
      txtCuenta: [''],
      txtEjecutivo: [''],
      txtSolicitante: [''],
      txtInicio: [''],
      txtFin: [''],
      txtConcepto: [''],
      txtFechaDeposito: [''],
      txtFechaLimite: [''],
      txtNumero: [''],
      txtTotalLiquidado: [''],
      txtTotalSaldo: [''],
      txtEstado: [''],
      txtDebe: ['']
    })

    this.liquidaForm  = this.formBuilder.group({
      nIdDepositario: [0],
      nIdCCReembolso: [0],
      txtVaucher: [''],
      txtOperacion: [''],
      txtFechaOper: [''],
      txtMontoDevolucion: ['',[Validators.required, Validators.min(0)]],
      txtDocDescuento: [''],
      txtMontoDescuento: ['',[Validators.required, Validators.min(0)]],
      txtMontoReembolsable: ['',[Validators.required, Validators.min(0)]],
      txtCCReembolso: [null],
      txtRQReembolso: [''],
      txtGastoReparado: ['',[Validators.required, Validators.min(0)]],
      txtCreditoFiscal: ['',[Validators.required, Validators.min(0)]],
      txtMontoDevolBanco: ['',[Validators.required, Validators.min(0)]],
      txtRegistro: [''],
      txtModifico: [''],
      cboBanco: ['']
    })

    this.partidaForm = this.formBuilder.group({
      cboPartidas: [''],
      txtMonto: [0]
    })

    this.liquidaDetForm = this.formBuilder.group({
      txtNumeroLiq: ['', Validators.required],
      txtMontoLiq: [0, Validators.required],
      txtFechaLiq: [moment(), Validators.required],
      cboPartidas: [''],
      txtPendiente: [0],
      txtMonto: [0]
    })

    this.onToggleFab(1, -1);

    this.fnBuscarLiquidacion(this.pLiquidacion)
  }

  get formLiq_1() {
    return this.liquidaForm.get('txtMontoDevolucion').invalid;
  }

  get formLiq_2() {
    return this.liquidaForm.get('txtMontoDevolBanco').invalid;
  }

  get formLiq_3() {
    return this.liquidaForm.get('txtMontoDescuento').invalid;
  }

  get formLiq_4() {
    return this.liquidaForm.get('txtCreditoFiscal').invalid;
  }

  get formLiq_5() {
    return this.liquidaForm.get('txtMontoReembolsable').invalid;
  }

  get formLiq_6() {
    return this.liquidaForm.get('txtGastoReparado').invalid;
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
        this.fnGuardar();
        break;
      case 2:
        this.fnCancelar();
        break;
      case 3:
        this.fnImprimirReporteRQ();
        break;
      case 4:
        await this.fnImprimirReporteCelularRQ();
        break;
      case 5:
        await this.fnImprimirReporteRR();
        break;
      case 6:
        await this.fnImprimirReporteCelularRR();
        break;
      case 7:
        await this.fnImprimirReporteSM();
        break;
      case 8:
        await this.fnImprimirReporteCelularSM();
        break;
      default:
        break;
    }
  }

  fnControlFab(){

    // Visualizacion
    this.fbLista[0].state = this.vModifica; // Editar liquidacion
    this.fbLista[1].state = !this.vModifica; // Guardar liquidacion
    this.fbLista[2].state = !this.vModifica; // Cancelar edicion
    this.fbLista[3].state = !this.vDispEsCelular; // Impresion Rq. Efectivo
    this.fbLista[4].state = this.vDispEsCelular; // Impresion Rq. Efectivo Celular
    this.fbLista[5].state = this.vVerReporteRR && !this.vDispEsCelular; // Impresion Rq. Reembolso
    this.fbLista[6].state = this.vVerReporteRR && this.vDispEsCelular; // Impresion Rq. Reembolso Celular
    this.fbLista[7].state = this.vVerReporteSM && !this.vDispEsCelular; // Impresion S. Movilidad
    this.fbLista[8].state = this.vVerReporteSM && this.vDispEsCelular; // Impresion S. Movilidad Celular

    // Deshabilitacion
    this.fbLista[1].disabled = !this.bGuardar;

    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion


  fnBuscarLiquidacion = function (vLiq) {
    //console.log(vLiq);
    this.spinner.show();
    var pParametro = []; //Parametros de campos vacios
    var pParametroDet = []
    this.nLiquidacion = vLiq.liquidacion;

    pParametro.push(vLiq.liquidacion);
    pParametro.push(vLiq.gastoCosto);
    pParametro.push(vLiq.sucursal);
    pParametro.push(vLiq.depositario);
    pParametro.push(this.pPais);

    this.vLiquidacionesService.fnLiquidaEfectivo(1, 2, pParametro, 2, 0, pParametroDet, this.url).subscribe(
      res => {

          if(res.length > 0)
          {
            this.fnMostrarInformacion(res);
          }

          this.valorImpresion = res[0].nDescuento

          //Para mostrar el detalle de la liquidacion
          this.fnDetalleLiquidacion(vLiq.liquidacion);

          this.fnControlFab();

          this.spinner.hide();
      },
      err => {
          this.spinner.hide();
          console.log(err);
      },
      () => {
          this.spinner.hide();
      }
    );

    this.spinner.show();
    var pParametro = [];
    var pParametroDet = [];
    pParametro.push(this.idEmp);

    this.vLiquidacionesService.fnLiquidaEfectivo(1, 2, pParametro, 4, 0, pParametroDet, this.url).subscribe(
      res => {

        this.lBanco = res
        this.spinner.hide();
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

  fnEditandoControlValidacion(){
    this.bGuardar = !this.bGuardar;

    // Actualizamos la visiblidad de los botones del menu
    this.fnControlFab();
  }

  fnDetalleLiquidacion = function(vLiquidacion){
     //Para mostrar el detalle de la liquidacion
     var pParametro2 = []; //Parametros de campos vacios
     var pParametroDet = [];
     pParametro2.push(vLiquidacion);

     this.vLiquidacionesService.fnLiquidaEfectivo(2, 2, pParametro2, 1, 0, pParametroDet, this.url).subscribe(
       res => {

           this.lisLiqado = res
           this.dataSource = new MatTableDataSource(res);

           let vTotal: number = 0;
           for (let index = 0; index < this.lisLiqado.length; index++) {
             vTotal = vTotal + this.lisLiqado[index].nMonto;
           }

           this.vTotalLiq = vTotal;

           this.fnControlFab()
           this.spinner.hide()
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

  fnMostrarInformacion = function(vLiqui) {
    //console.log(vLiqui)
    this.spinner.show();
    this.nIdGasto = vLiqui[0].nIdGastoCosto;
    this.nTipoPresupuesto = vLiqui[0].nIdTipoCC;
    //console.log(this.nTipoPresupuesto)

    //Cuado ya se tiene el id del gasto RE habilitamos para mostrar el reporte
    this.fnMostrarRE();

    //Solo si es una SM se mostrara el reporte de sustento de fechas de la Solicitud de Movilidad
    if(vLiqui[0].sTipoDoc=='SM')
    {
      this.fnMostrarSM();
    }
    //Verificamos si cuenta con un Reembolso para preparar el formato de impresion
    if(vLiqui[0].nIdReembolso>0)
    {
      this.nIdGastoRR = vLiqui[0].nIdReembolso;
      this.fnMostrarRR()
    }

    this.nIdSucursal  = vLiqui[0].nIdSucursal;
    this.nIdDepositario = vLiqui[0].nIdDepositario;
    this.nMontoReem     = vLiqui[0].nReembolsable;
    this.nIdCCosto      = vLiqui[0].nIdCentroCosto;
    this.nPorReparado   = vLiqui[0].nPorGastoReparado;

    this.sSucursal = vLiqui[0].sSucursal;
    this.sCCosto = vLiqui[0].sCentroCosto;

    // Datos de la solicitud y estado de liquidacion
    this.efectivoForm.controls.txtPresupuesto.setValue(vLiqui[0].sCentroCosto);
    this.efectivoForm.controls.txtCliente.setValue(vLiqui[0].sCliente);
    this.efectivoForm.controls.txtEjecutivo.setValue(vLiqui[0].sNombreEjecutivo);
    this.efectivoForm.controls.txtSolicitante.setValue(vLiqui[0].sNombreCompletoDepositario);
    this.efectivoForm.controls.txtDeposito.setValue(vLiqui[0].nDepositado.toFixed(2));
    this.efectivoForm.controls.txtBanco.setValue(vLiqui[0].sBanco);
    this.efectivoForm.controls.txtCuenta.setValue(vLiqui[0].sCuenta);
    this.efectivoForm.controls.txtConcepto.setValue(vLiqui[0].sTitulo);
    this.efectivoForm.controls.txtInicio.setValue(vLiqui[0].sFechaIni);
    this.efectivoForm.controls.txtFin.setValue(vLiqui[0].sFechaFin);
    this.efectivoForm.controls.txtFechaDeposito.setValue(vLiqui[0].sFechaDeposito);
    this.efectivoForm.controls.txtFechaLimite.setValue(vLiqui[0].sFechaLimite);
    this.efectivoForm.controls.txtNumero.setValue(vLiqui[0].sNroRqNew);

    //Campos de Resumen
    let nDebeCab, nTotalLIqCab, nReemCab
    nDebeCab = vLiqui[0].nDepositado - vLiqui[0].nTotalLiq - vLiqui[0].nDescuento - vLiqui[0].nDevolucionBanco - vLiqui[0].nDevolucion + vLiqui[0].nReembolsable;
    nTotalLIqCab = vLiqui[0].nTotalLiq + vLiqui[0].nDescuento + vLiqui[0].nDevolucionBanco + vLiqui[0].nDevolucion;
    nReemCab = vLiqui[0].nReembolsable;
    this.efectivoForm.controls.txtDebe.setValue(nDebeCab < 0 ? 0 : nDebeCab.toFixed(2));
    this.efectivoForm.controls.txtTotalLiquidado.setValue(nTotalLIqCab.toFixed(2));
    this.efectivoForm.controls.txtTotalSaldo.setValue(nReemCab.toFixed(2));
    this.efectivoForm.controls.txtEstado.setValue(vLiqui[0].sEstadoLiquidacion);

    // Datos de la Liquidacion
    this.liquidaForm.controls.nIdDepositario.setValue(vLiqui[0].nIdDepositario);
    this.liquidaForm.controls.txtVaucher.setValue(vLiqui[0].sNumVoucher);
    this.liquidaForm.controls.txtOperacion.setValue(vLiqui[0].sDocDevolucion);
    this.liquidaForm.controls.txtFechaOper.setValue(vLiqui[0].sFechaVoucher);
    this.liquidaForm.controls.txtMontoDevolBanco.setValue(vLiqui[0].nDevolucionBanco);

    this.liquidaForm.controls.txtMontoDevolucion.setValue(vLiqui[0].nDevolucion);
    this.liquidaForm.controls.txtDocDescuento.setValue(vLiqui[0].sDocDescuento);
    this.liquidaForm.controls.txtMontoDescuento.setValue(vLiqui[0].nDescuento);
    this.liquidaForm.controls.txtMontoReembolsable.setValue(vLiqui[0].nReembolsable);
    this.liquidaForm.controls.txtCCReembolso.setValue(vLiqui[0].nIdCentroCostoRR == 0 ? null : vLiqui[0].nIdCentroCostoRR);
    this.liquidaForm.controls.txtRQReembolso.setValue(vLiqui[0].sReembolso);
    this.liquidaForm.controls.txtGastoReparado.setValue(vLiqui[0].nGastoReparado);
    this.liquidaForm.controls.txtRegistro.setValue(vLiqui[0].sUsuarioCreacion +' - '+ vLiqui[0].sFechaCreacion);
    this.liquidaForm.controls.txtModifico.setValue(vLiqui[0].sUsuarioModificacion +' - '+ vLiqui[0].sFechaModificado);

    this.liquidaForm.controls.cboBanco.setValue(vLiqui[0].nIdBanco);
    this.liquidaForm.controls.txtCreditoFiscal.setValue(vLiqui[0].nCreditoFiscal);
    this.spinner.hide();

    //Tener en cuenta cuantas partidas tiene el detalle
    this.vUnaPartida = vLiqui[0].nCantPartida == 1 ? true : false;
    this.vUnaPartidaDesc = '';


    this.vModifica2 = false; //Muestra por defecto habilitado el campo para ingresar el monto directo
    if(!this.vUnaPartida)
    {
      this.vUnaPartidaDesc = 'El Rq base cuenta con varias partidas, debe indicarlas en cada regularización.';
      this.vModifica2 = true;
    }

    let pParametro = [];
    let pParametroDet = [];
    pParametro.push(vLiqui[0].nIdGastoCosto);
    pParametro.push(vLiqui[0].nIdSucursal);
    pParametro.push(vLiqui[0].nIdDepositario);

    this.vLiquidacionesService.fnLiquidaEfectivo(1, 2, pParametro, 3, 0, pParametroDet, this.url).subscribe(
      res => {
        this.lPartidas = res;
      },
      err => {
          this.spinner.hide();
          console.log(err);
      },
      () => {
          this.spinner.hide();
      }
    );

    //debugger;
    pParametro = [];
    pParametroDet = [];
    pParametro.push(this.nLiquidacion);
    //Buscamos las partidas de los documentos de ajustes para poder cargar las listas correspondientes
    this.vLiquidacionesService.fnLiquidaEfectivo(2, 2, pParametro, 3, 0, pParametroDet, this.url).subscribe(
      res => {
        this.ldetalleAjustes = res;

        //Limpiando las listas de repositorio
        this.lDespositoBanco = [];
        this.lDespositoCaja = [];
        this.lDescuentoPersonal = [];
        this.lGastoReparado = [];

        //Asiganando las nuevas Listas al repositorio
        for (let index = 0; index < this.ldetalleAjustes.length; index++) {

          if(this.ldetalleAjustes[index].nTipo == 1) //Banco
          {
            this.lDespositoBanco.push(this.ldetalleAjustes[index]);
          }

          if(this.ldetalleAjustes[index].nTipo == 2) //Caja chica
          {
            this.lDespositoCaja.push(this.ldetalleAjustes[index]);
          }

          if(this.ldetalleAjustes[index].nTipo == 3) //Descuento al Personal
          {
            this.lDescuentoPersonal.push(this.ldetalleAjustes[index]);
          }

          if(this.ldetalleAjustes[index].nTipo == 5) //Gasto Reparado
          {
            this.lGastoReparado.push(this.ldetalleAjustes[index]);
          }
        }

        this.ldetalleAjustes = [];
        // console.log(this.ldetalleAjustes);
      },
      err => {
          this.spinner.hide();
          console.log(err);
      },
      () => {
          this.spinner.hide();
      }
    );

    this.fnPresupuestos(vLiqui[0].nIdGastoCosto);
  }

  fnModificar = function(){
    this.vModifica  = false;
    // this.vModifica2 = false;
    this.vModifica2 = true;
    if(!this.vUnaPartida)
    {
      this.vModifica2 = true;
    }

    // Actualizamos los botones del menu
    this.fnControlFab();
  }

  fnCalcularLiq = function() {

    let vMontoDepos = this.efectivoForm.controls.value.txtFechaDeposito
    let vTotalLiq   = this.efectivoForm.controls.value.txtTotalLiquidado
    let vMontoDev   = this.liquidaForm.controls.value.txtMontoDevolucion
    let vMontoRee   = this.liquidaForm.controls.value.txtMontoReembolsable
    let vMontoDes   = this.liquidaForm.controls.value.txtMontoDescuento

    let vSaldo = vMontoDepos - vTotalLiq - vMontoDev + vMontoRee - vMontoDes
    // console.log(vMontoDepos, vTotalLiq, vMontoDev, vMontoRee, vMontoDes)
    // console.log(vSaldo)
  }

  fnCambiarDescuento = function(vTipo){
    if(vTipo == 1){
      this.vPorBanco = true;
    }
    else
    {
      this.vPorBanco = false;
    }
  }

  fnAgregarDetalle = function(){
    this.nIdDetalle = 0;
    this.lDetLiqPartidas = [];
    this.dataSource3 = new MatTableDataSource(this.lDetLiqPartidas);

    this.vVerDetalleLiq =  false;
    this.liquidaDetForm.controls.txtNumeroLiq.setValue('');
    // this.liquidaDetForm.controls.txtFechaLiq.setValue('');
    this.liquidaDetForm.controls.txtMontoLiq.setValue(0);
    this.liquidaDetForm.controls.txtPendiente.setValue(0);

    this.modalDetalle.nativeElement.click();
  }

  fnNuevoDocumento = function(vTipo){
    this.vTipoAccion = vTipo;

    this.partidaForm.controls.txtMonto.setValue(0);
    this.partidaForm.controls.cboPartidas.setValue('');

    if(vTipo == 1)
    {
      this.vTipoDesc = 'Depósito Bancario'
      this.dataSource2 = new MatTableDataSource(this.lDespositoBanco);
    }
    if(vTipo == 2)
    {
      this.vTipoDesc = 'Despósito Caja Chica'
      this.dataSource2 = new MatTableDataSource(this.lDespositoCaja);
    }
    if(vTipo == 3)
    {
      this.vTipoDesc = 'Descuento al personal'
      this.dataSource2 = new MatTableDataSource(this.lDescuentoPersonal);
    }
    if(vTipo == 4)
    {
      this.vTipoDesc = 'Reembolsable'
      this.dataSource2 = new MatTableDataSource(this.lReembolsable);
    }
    if(vTipo == 5)
    {
      this.vTipoDesc = 'Gasto Reparado aplica '+ this.nPorReparado.toFixed(2) +'%'
      this.dataSource2 = new MatTableDataSource(this.lGastoReparado);
    }

    // console.log(this.lPartidas)
    this.modalPartidas.nativeElement.click();

  }

  fnAgregarPartida = function(){

    let vPartida = this.partidaForm.value.cboPartidas
    let vMonto   = this.partidaForm.value.txtMonto
    let sDescrip
    let sCodPartida
    let nSaldo, nTotal = 0;

    if(vPartida == "" || vMonto ==0)
    {
      Swal.fire('¡Verificar!','Debe indicar la partida y monto a considerar en la relación de partidas, favor de verificar','warning')
      return;
    }

    for (let index = 0; index < this.lPartidas.length; index++) {
      if( vPartida == this.lPartidas[index].nId)
      {
        sCodPartida =  this.lPartidas[index].sPartida
        sDescrip    =  this.lPartidas[index].sDescripcion
      }
    }

    //Bloque de codigo para saber que documento esta Validando
    if(this.vTipoAccion == 1) //Deposito Banco
    {

      for (let index = 0; index < this.lDespositoBanco.length; index++) {
        if( vPartida == this.lDespositoBanco[index].nId)
        {
          Swal.fire('¡Verificar!','La partida indicada ya esta considerada en el depósito bancario, favor de verificar','warning')
          return;
        }
      }

      //Agregando a la lista y mat table
      this.lDespositoBanco.push({nTipo: 1, nId: vPartida, sPartida: sCodPartida, sDescripcion: sDescrip , nMonto: vMonto})
      this.dataSource2 = new MatTableDataSource(this.lDespositoBanco);

      for (let index = 0; index < this.lDespositoBanco.length; index++) {
        nTotal = nTotal + this.lDespositoBanco[index].nMonto
      }
      this.liquidaForm.controls.txtMontoDevolBanco.setValue(nTotal);

    }
    if(this.vTipoAccion == 2) //Desposito Caja Chica
    {

      for (let index = 0; index < this.lDespositoCaja.length; index++) {
        if( vPartida == this.lDespositoCaja[index].nId)
        {
          Swal.fire('¡Verificar!','La partida indicada ya esta considerada en el depósito por caja chica, favor de verificar','warning')
          return;
        }
      }

      //Agregando a la lista y mat table
      this.lDespositoCaja.push({nTipo: 2, nId: vPartida, sPartida: sCodPartida, sDescripcion: sDescrip , nMonto: vMonto})
      this.dataSource2 = new MatTableDataSource(this.lDespositoCaja);

      for (let index = 0; index < this.lDespositoCaja.length; index++) {
        nTotal = nTotal + this.lDespositoCaja[index].nMonto
      }
      this.liquidaForm.controls.txtMontoDevolucion.setValue(nTotal);

    }
    if(this.vTipoAccion == 3) //Descuento al Personal
    {

      for (let index = 0; index < this.lDescuentoPersonal.length; index++) {
        if( vPartida == this.lDescuentoPersonal[index].nId)
        {
          Swal.fire('¡Verificar!','La partida indicada ya esta considerada en el descuento al Personal, favor de verificar','warning')
          return;
        }
      }

      //Agregando a la lista y mat table
      this.lDescuentoPersonal.push({nTipo: 3, nId: vPartida, sPartida: sCodPartida, sDescripcion: sDescrip , nMonto: vMonto})
      this.dataSource2 = new MatTableDataSource(this.lDescuentoPersonal);

      for (let index = 0; index < this.lDescuentoPersonal.length; index++) {
        nTotal = nTotal + this.lDescuentoPersonal[index].nMonto
      }
      this.liquidaForm.controls.txtMontoDescuento.setValue(nTotal);

    }
    if(this.vTipoAccion == 4) //Reembolsable
    {

      for (let index = 0; index < this.lReembolsable.length; index++) {
        if( vPartida == this.lReembolsable[index].nId)
        {
          Swal.fire('¡Verificar!','La partida indicada ya esta considerada en el Reembolso, favor de verificar','warning')
          return;
        }
      }

      //Validando que el Presupuesto/Sucursal/partida tenga Saldo
      let nTotal = 0, nTotal2 = 0

      let pParametro = [];
      let pParametroDet = [];
      pParametro.push(this.nIdCCosto);
      pParametro.push(this.nIdSucursal);
      pParametro.push(vPartida);
      // console.log(pParametro)

      this.vLiquidacionesService.fnLiquidaEfectivo(2, 1, pParametro, 2, 0, pParametroDet, this.url).subscribe(
        res => {

            nTotal = res
            nSaldo = nTotal - vMonto
            if(nSaldo < 0)
            {
              Swal.fire('¡Atencion!','La partida indicada no tiene saldo suficiente para cubrir el monto de: '+vMonto+', solo tiene saldo de: '+nTotal+', favor de verificar','warning')
              return;
            }
            else
            {
              //Agregando a la lista y mat table
              this.lReembolsable.push({nTipo: 4, nId: vPartida, sPartida: sCodPartida, sDescripcion: sDescrip , nMonto: vMonto})
              this.dataSource2 = new MatTableDataSource(this.lReembolsable);

              for (let index = 0; index < this.lReembolsable.length; index++) {
                nTotal2 = nTotal2 + this.lReembolsable[index].nMonto
              }
              this.liquidaForm.controls.txtMontoReembolsable.setValue(nTotal2);
            }

            this.spinner.hide()
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
    if(this.vTipoAccion == 5) //Gasto Reparado
    {

      for (let index = 0; index < this.lGastoReparado.length; index++) {
        if( vPartida == this.lGastoReparado[index].nId)
        {
          Swal.fire('¡Verificar!','La partida indicada ya esta considerada en el Gasto Reparado, favor de verificar','warning')
          return;
        }
      }

      //Validando que el Prsupuesto/Sucursal/partida tenga Saldo
      let nTotal = 0, nTotal2 = 0;
      let fecha = this.efectivoForm.controls.txtFin.value;

      let pParametro = [];
      let pParametroDet = [];
      pParametro.push(this.nIdCCosto);
      pParametro.push(this.nIdSucursal);
      pParametro.push(vPartida);
      pParametro.push(this.nTipoPresupuesto);
      pParametro.push(fecha);

      let vGasto = (vMonto * this.nPorReparado)/100
      //console.log(pParametro)

      this.vLiquidacionesService.fnLiquidaEfectivo(1, 2, pParametro, 11, 0, pParametroDet, this.url).subscribe(
        res => {
            nTotal = res
            nSaldo = nTotal - vGasto
            if(nSaldo < 0)
            {
              Swal.fire('¡Atencion!','La partida indicada no tiene saldo suficiente para cubrir el porcentaje de resguardo '+this.nPorReparado.toFixed(2) +'% del monto de: '+vGasto.toFixed(2)+', solo tiene saldo de: '+nTotal.toFixed(2)+', favor de verificar','warning')
              return;
            }
            else
            {
              //Agregando a la lista y mat table
              this.lGastoReparado.push({nTipo: 5, nId: vPartida, sPartida: sCodPartida, sDescripcion: sDescrip , nMonto: vMonto})
              this.dataSource2 = new MatTableDataSource(this.lGastoReparado);

              for (let index = 0; index < this.lGastoReparado.length; index++) {
                nTotal2 = nTotal2 + this.lGastoReparado[index].nMonto
              }
              this.liquidaForm.controls.txtGastoReparado.setValue(nTotal2);
            }

            this.spinner.hide()
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

    this.partidaForm.controls.cboPartidas.setValue('');
    this.partidaForm.controls.txtMonto.setValue(0);

  }

  fnAgregarLiquidacion  = function(){
    //debugger;
    let vPartida   = this.liquidaDetForm.value.cboPartidas
    let vMonto     = this.liquidaDetForm.value.txtMonto
    let vPendiente = Number(this.liquidaDetForm.value.txtPendiente)
    let sDescrip
    let sCodPartida
    let nTotal = 0;

    if(vPartida == "" || vMonto ==0)
    {
      Swal.fire('¡Verificar!','Debe indicar la partida y monto a considerar en el detalle de la liquidación, favor de verificar','warning')
      return;
    }

    for (let index = 0; index < this.lPartidas.length; index++) {
      if( vPartida == this.lPartidas[index].nId)
      {
        sCodPartida =  this.lPartidas[index].sPartida
        sDescrip    =  this.lPartidas[index].sDescripcion
      }
    }

    for (let index = 0; index < this.lDetLiqPartidas.length; index++) {
      if( vPartida == this.lDetLiqPartidas[index].nId)
      {
        Swal.fire('¡Verificar!','La partida indicada ya esta considerada e documento de liquidiación actual, favor de verificar','warning')
        return;
      }
    }

    //Antes de registrar debemos validar que elmonto que se esta considerando no sea superior al monto por liquidar de la partida
    if(vPendiente < vMonto)
    {
     // Swal.fire('¡Verificar!','El monto a liquidar: '+vMonto.toFixed(2)+', no puede ser mayor al monto pendiente por liquidar: '+vPendiente.toFixed(2)+', favor de verificar','warning')
    }

    //Agregando a la lista y mat table para las partidas del detalle
    this.lDetLiqPartidas.push({nTipo: 6, nId: vPartida, sPartida: sCodPartida, sDescripcion: sDescrip , nMonto: vMonto})
    this.dataSource3 = new MatTableDataSource(this.lDetLiqPartidas);

    for (let index = 0; index < this.lDetLiqPartidas.length; index++) {
      nTotal = nTotal + this.lDetLiqPartidas[index].nMonto
    }

    this.liquidaDetForm.controls.txtMontoLiq.setValue(nTotal.toFixed(2));
    this.liquidaDetForm.controls.cboPartidas.setValue('');
    this.liquidaDetForm.controls.txtPendiente.setValue('')
    this.liquidaDetForm.controls.txtMonto.setValue('');

    //this.dataSource = new MatTableDataSource(this.lisLiqado);
  }

  fnGuardarDetalle = function(){
    //debugger;
    let valorSaldoActual : string;
    let vDocum = this.liquidaDetForm.value.txtNumeroLiq
    let vFecha = this.liquidaDetForm.value.txtFechaLiq
    let nTotal = this.liquidaDetForm.value.txtMontoLiq
    let vDatosLiqDet = this.liquidaDetForm.value;

    if (this.liquidaDetForm.invalid) {
      //Si aun hay datos Obligatorios muestra mensaje y corta el proceso

      Swal.fire('¡Verificar!','Existen datos obligatorios para guardar el documento de liquidación.','warning')
      return;
    }

    if (this.lDetLiqPartidas.length == 0) {
      //Si aun no hay Registros en el detalle de partida, cuando el RQ base cuenta con mas de 1 partida
      Swal.fire('¡Verificar!','Aún no ha indicado las partidas para el detalle de la liquidación.','warning')
      return;
    }

    let pParametroDet =[]
    let pParametro = []

    //Bloque para grabar el detalle independientemente de la cabecera
    //**************************************************************************************************************************************
    //debugger;
    //Datos de la cabecera
    pParametro.push(this.nLiquidacion); //1
    pParametro.push(this.nIdGasto);     //2
    pParametro.push(this.nIdSucursal);  //3
    pParametro.push(this.nIdDepositario);//4
    pParametro.push(this.vUnaPartida == true ? 1 : 2);//5
    pParametro.push(this.idUser);       //6
    pParametro.push(this.pPais);        //7
    pParametro.push(this.nIdDetalle);   //8

    //Datos del Detalle de Liquidacion selecionado
    pParametroDet.push(vDocum);
    pParametroDet.push(nTotal);

    if(vDatosLiqDet.txtFechaLiq != ''){
      pParametroDet.push(this.datePipe.transform(vDatosLiqDet.txtFechaLiq, 'dd/MM/yyyy'));}
    else{
      pParametroDet.push(vDatosLiqDet.txtFechaLiq);}

    pParametroDet.push(this.idUser);

    // console.log(pParametro);
    // console.log(pParametroDet);
    // console.log(this.lDetLiqPartidas);

    let Op = this.nLiquidacion == 0 ? 1 : 3
    this.vLiquidacionesService.fnLiquidaEfectivo(2, Op, pParametro, 1, this.lDetLiqPartidas, pParametroDet, this.url).subscribe(
      res => {

            if(res == 0)
            {
              Swal.fire('¡Error!','Hubo un problema a la hora de registrar la liquidación, favor de verificar su conexion a internet','error')
              return;
            }
            else
            {
              // Traemos los datos del detalle para la mat-table, de la liquidacion efectuada
              if(this.nLiquidacion == 0)
              {
                this.nLiquidacion = res;
                this.pLiquidacion.liquidacion = res;
              }

              //Actualizamos detalle
              this.fnDetalleLiquidacion(this.nLiquidacion);
              //Actualizamos datos de la cabecera
              this.fnBuscarLiquidacion(this.pLiquidacion);

              //22/04/2021
              valorSaldoActual = this.efectivoForm.controls.txtDebe.value;
              valorSaldoActual = valorSaldoActual.split('.')[0];
              this.fnActualizarReembolso(valorSaldoActual, nTotal);

            }
      },
      err => {
          this.spinner.hide();
          console.log(err);
      },
      () => {
          this.spinner.hide();
      }
    );

    this.modalDetalle.nativeElement.click();
  }

  fnActualizarReembolso(saldo: number, reembolso: number){

    const txtMontoReembolsable = this.liquidaForm.controls.txtMontoReembolsable.value;

    this.diferencia = reembolso - saldo;
    this.diferencia = this.diferencia + txtMontoReembolsable;

    if (this.diferencia > 0) {

      this.liquidaForm.controls.txtMontoReembolsable.setValue(this.diferencia);
      this.cCosto = this.efectivoForm.controls.txtPresupuesto.value;

      this.lCentroCostoReembolso.forEach(valor => {

        if (valor.sDescripcion === this.cCosto) {
          this.liquidaForm.controls.txtCCReembolso.setValue(valor.nId);
        }

      });
      this.guardarReembolso = true;
      this.fnGuardar();

    }

  }

  async fnGuardar (){

    this.spinner.show();

    if(!await this.fnValidarSaldo(1)){this.fnControlFab(); return false;};
    if(!await this.fnValidarSaldo(2)){this.fnControlFab(); return false;};

    if(!await this.fnValidarDocumentoExistente()){return false;}
    let vDatosLiq = this.liquidaForm.value; //todos los campos de la liquidacion
    //Zona de Validación
    if( !this.ValidarDoc_Ajustes(1) ){this.fnControlFab(); return false;} //Devolucion Deposito Bancario
    if( !this.ValidarDoc_Ajustes(2) ){this.fnControlFab(); return false;} //Devolucion Caja Chica
    if( !this.ValidarDoc_Ajustes(3) ){this.fnControlFab(); return false;} //Descuento al Personal
    if( !this.ValidarDoc_Ajustes(4) ){this.fnControlFab(); return false;} //Reembolso
    if( !this.ValidarDoc_Ajustes(5) ){this.fnControlFab();return false;} //Gasto Reparado

    if( !this.ValidarDect_Reem() ){this.fnControlFab(); return false;}    //Validamos si cuenta con descuento y reembolso a la vez

    // Agrupar todas las listas de documentos en una Sola Lista
    if( !this.AgruparLista() ){this.fnControlFab(); return false;}


    // console.log(this.ldetalleAjustes);

    var pParametro = []; //Parametros de campos vacios
    var pParametroDet = []
    //console.log(vDatosLiq.txtFechaOper);

    pParametro.push(this.nLiquidacion);           //1
    pParametro.push(this.nIdGasto);               //2
    pParametro.push(this.nIdSucursal);            //3
    pParametro.push(vDatosLiq.nIdDepositario);    //4
    pParametro.push(vDatosLiq.txtVaucher);        //5

    if(vDatosLiq.txtFechaOper != ''){
      pParametro.push(this.datePipe.transform(vDatosLiq.txtFechaOper, 'dd/MM/yyyy'));}   //6
    else{
      pParametro.push(vDatosLiq.txtFechaOper);}     //6

    pParametro.push(vDatosLiq.cboBanco);            //7
    pParametro.push(vDatosLiq.txtMontoDevolBanco);  //8
    pParametro.push(vDatosLiq.txtOperacion);        //9
    pParametro.push(vDatosLiq.txtMontoDevolucion);  //10
    pParametro.push(vDatosLiq.txtDocDescuento);     //11
    pParametro.push(vDatosLiq.txtMontoDescuento);   //12
    pParametro.push(vDatosLiq.txtMontoReembolsable);//13
    pParametro.push(vDatosLiq.txtCCReembolso || 0); //14  nIdCCReembolso
    pParametro.push(vDatosLiq.txtGastoReparado);    //15
    pParametro.push(vDatosLiq.txtCreditoFiscal);    //16
    pParametro.push(this.idUser);                   //17
    pParametro.push(this.pPais);                    //18
    pParametro.push(this.vUnaPartida ? 1 : 2 );     //19
    pParametro.push(this.nIdGastoRR);               //20

    this.spinner.hide();

    //console.log(pParametro);

     //Zona de confirmacion de guardado
     if (this.guardarReembolso) {
       //Ejedutando los cambios a BD
       let Op = this.nLiquidacion == 0 ? 1 : 3
       this.vLiquidacionesService.fnLiquidaEfectivo(1, Op, pParametro, 0, this.ldetalleAjustes, pParametroDet, this.url).subscribe(
         res => {
             // console.log('Verificardo por edu: ' + res)
             // debugger;
             if(Op ==1) //Cuando es un nuevo regitro
             {
               //console.log(this.pLiquidacion)
               this.pLiquidacion.liquidacion = res;
             }
             //console.log(this.valorImpresion)

             // this.vModifica = true;
             this.vModifica = false;
             this.fnBuscarLiquidacion(this.pLiquidacion);

         },
         err => {
             this.spinner.hide();
             console.log(err);
         },
         () => {
             this.spinner.hide();
         }
       );
       this.guardarReembolso = false;
     } else {

       Swal.fire({
        title: '¿Desea guardar la Liquidación?',
        text: "Se guardarán las modificaciones realizadas",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          //Ejedutando los cambios a BD
          let Op = this.nLiquidacion == 0 ? 1 : 3
          this.vLiquidacionesService.fnLiquidaEfectivo(1, Op, pParametro, 0, this.ldetalleAjustes, pParametroDet, this.url).subscribe(
            res => {
                // console.log('Verificardo por edu: ' + res)
                // debugger;
                if(Op ==1) //Cuando es un nuevo regitro
                {
                  //console.log(this.pLiquidacion)
                  this.pLiquidacion.liquidacion = res;
                }
                //console.log(this.valorImpresion)

                // this.vModifica = true;
                this.vModifica = false;

                console.log(res);
                Swal.fire('¡Correcto!','Los cambios se guardaron correctamente','success');

                if(this.liquidaForm.get("txtMontoReembolsable").value == 0){
                  this.nIdGastoRR = 0;
                }

                this.fnBuscarLiquidacion(this.pLiquidacion);

            },
            err => {
                Swal.fire('¡Alerta!','Los cambios no pudieron ser guardados','error');
                this.spinner.hide();
                console.log(err);
            },
            () => {
                this.spinner.hide();
            }
          );
        }
      })

     }
  }

  public ValidarDoc_Ajustes(vTipo: number):boolean{
    //debugger;

    let vDatosLiq = this.liquidaForm.value; //todos los campos de la liquidacion
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    if (vTipo == 1) //Deposito Bancario
    {
      let banco = vDatosLiq.cboBanco==undefined ? 0 : vDatosLiq.cboBanco

      if(vDatosLiq.txtMontoDevolBanco > 0 && ( vDatosLiq.txtVaucher=='' || vDatosLiq.txtFechaOper == '' || banco == 0)  )
      {
        Swal.fire('¡Verificar!','Esta considerado un monto para devolución de tipo Deposito Bancario, debe ingresar Vaucher, Fecha, Banco, favor de verificar','warning')
        this.spinner.hide();
        return false;
      }

      if(vDatosLiq.txtMontoDevolBanco == 0 && ( vDatosLiq.txtVaucher != '' || vDatosLiq.txtFechaOper != '' || banco != 0)  )
      {
        Swal.fire('¡Verificar!','Esta considerado datos para devolución de tipo Deposito Bancario, debe ingresar el monto de la devolución','warning')
        this.spinner.hide();
        return false;
      }

      if(vDatosLiq.txtMontoDevolBanco < 0)
      {
        Swal.fire('¡Verificar!','El monto para devolución de tipo Deposito Bancario no debe ser menor a cero','warning')
        this.spinner.hide();
        return false;
      }
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    if (vTipo == 2) //Deposito Caja Chica
    {
      if(vDatosLiq.txtMontoDevolucion > 0 && vDatosLiq.txtOperacion == '')
      {
        Swal.fire('¡Verificar!','Esta considerado un monto para devolución de tipo Caja Chica, debe ingresar el número de comprobante, favor de verificar','warning')
        this.spinner.hide();
        return false;
      }

      if(vDatosLiq.txtMontoDevolucion == 0 && vDatosLiq.txtOperacion != '')
      {
        Swal.fire('¡Verificar!','Esta considerado el número de comprobante de tipo Caja Chica, debe ingresar wl monto para devolución, favor de verificar','warning')
        this.spinner.hide();
        return false;
      }

      if(vDatosLiq.txtMontoDevolucion < 0 )
      {
        Swal.fire('¡Verificar!','El monto para devolución de tipo Caja Chica no debe ser menor a cero','warning')
        this.spinner.hide();
        return false;
      }
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    if (vTipo == 3) //Descuento al Personal
    {
      if(vDatosLiq.txtMontoDescuento > 0 && vDatosLiq.txtDocDescuento == '')
      {
        Swal.fire('¡Verificar!','Esta considerado un monto por descuento al personal, debe ingresar el número de comprobante, favor de verificar','warning')
        this.spinner.hide();
        return false;
      }

      if(vDatosLiq.txtMontoDescuento == 0 && vDatosLiq.txtDocDescuento != '')
      {
        Swal.fire('¡Verificar!','Esta considerado el número de comprobante por descuento al personal, debe ingresar un monto del descuento, favor de verificar','warning')
        this.spinner.hide();
        return false;
      }

      if(vDatosLiq.txtMontoDescuento < 0 )
      {
        Swal.fire('¡Verificar!','El monto por descuento al personal, no debe ser menor a cero','warning')
        this.spinner.hide();
        return false;
      }
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    if (vTipo == 4) //Reembolso
    {
      if(vDatosLiq.txtMontoReembolsable < 0 )
      {
        Swal.fire('¡Verificar!','El monto de reembolso no puede ser menor a cero, favor de verificar','warning')
        this.spinner.hide();
        return false;
      }

      //console.log('txtCCReembolso: '+vDatosLiq.txtCCReembolso)
      //debugger
      //Evitamos el valor no definido
      var nIdCCReem: number = 0;
      nIdCCReem = vDatosLiq.txtCCReembolso==undefined ? 0 : vDatosLiq.txtCCReembolso

      if(vDatosLiq.txtMontoReembolsable > 0 && nIdCCReem == 0 )
      {
        Swal.fire('¡Verificar!','Debe indicar el presupuesto para el reembolso, puede ser el mismo del gasto base o seleccionar otro que cuente con saldo','warning')
        this.spinner.hide();
        return false;
      }
      else if(vDatosLiq.txtMontoReembolsable <= 0 && nIdCCReem != 0 )
      {
        Swal.fire('¡Verificar!','No hay un reembolso ingresado, por lo cual no debe seleccionar un presupuesto','warning');
        this.liquidaForm.get("txtCCReembolso").setValue(null);
        this.spinner.hide();
        return false;
      }

    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    if (vTipo == 5) //Gasto Reparado
    {
      if(vDatosLiq.txtGastoReparado < 0 )
      {
        Swal.fire('¡Verificar!','El monto de Gasto Reparado, no puede ser menor a cero, favor de verificar','warning')
        this.spinner.hide();
        return false;
      }

    }

    return true;
  }

  public ValidarDect_Reem():boolean{

    var vDatosLiq = this.liquidaForm.value; //todos los campos de la liquidacion
    var egreso = 0 , ingreso = 0

    // Identificamos si esta indicando algun tipo de Egreso [deposito a la empresa o descuento al trabajador ]
    if(vDatosLiq.txtMontoDevolBanco > 0 || vDatosLiq.txtVaucher != '' || vDatosLiq.txtFechaOper != '' || vDatosLiq.cboBanco != 0)
    {
      egreso = 1;
    }

    if(vDatosLiq.txtMontoDevolucion > 0 || vDatosLiq.txtOperacion != '')
    {
      egreso = 1;
    }

    if(vDatosLiq.txtMontoDescuento > 0 || vDatosLiq.txtDocDescuento != '')
    {
      egreso = 1;
    }

    if(vDatosLiq.txtMontoReembolsable > 0 || vDatosLiq.txtCCReembolso >0)
    {
      ingreso = 1;
    }

    if(ingreso > 0 && egreso > 0)
    {
      Swal.fire('¡Verificar!','No se puede hacer devolución o descuento junto con un reembolso, favor de verificar','warning')
      this.spinner.hide();
      return false;
    }
    this.spinner.hide();
    return true;
  }

  public AgruparLista(): boolean {
    // Agrupar todas las listas de documentos en una Sola (Devolución Banco, Devolución Caja, Descuento, Reembolso, Gasto Reparado)
    this.ldetalleAjustes = [] //Limpiamos nuestra lista contenedor
    // debugger;
    //Recorriendo las listas de las partidas de los documentos
    for (let index = 0; index < this.lDespositoBanco.length; index++) {
      this.ldetalleAjustes.push( this.lDespositoBanco[index]);
    }

    for (let index = 0; index < this.lDespositoCaja.length; index++) {
      this.ldetalleAjustes.push(this.lDespositoCaja[index])
    }

    for (let index = 0; index < this.lDescuentoPersonal.length; index++) {
      this.ldetalleAjustes.push(this.lDescuentoPersonal[index]);
    }

    // for (let index = 0; index < this.lReembolsable.length; index++) {
    //   this.ldetalleAjustes.push(this.lReembolsable[index])
    // }

    for (let index = 0; index < this.lGastoReparado.length; index++) {
      this.ldetalleAjustes.push(this.lGastoReparado[index])
    }

    let vDatosLiq = this.liquidaForm.value; //todos los campos de la liquidacion
    if(this.ldetalleAjustes.length == 0 && !this.vUnaPartida && (vDatosLiq.txtMontoDevolBanco > 0 || vDatosLiq.txtMontoDevolucion > 0 || vDatosLiq.txtMontoDescuento > 0 || vDatosLiq.txtGastoReparado > 0))
    {
      Swal.fire('¡Verificar!','EL Rq base tiene más de una partida debe verificar que esten las partidas correctamente inidicadas, veriricar','warning')
      this.spinner.hide();
      return false;
    }
    return true;
  }

  public async fnValidarResguardoGeneral(nId: any, nTipo: number, gasto: number): Promise<boolean> {
    var pParametro = [];
    var pParametroDet = [];
    var saldo = 0, resultado = 0;

    pParametro.push(nId); //id del Presupuesto a validar el Margen de resguardo
    const res = await this.vLiquidacionesService.fnLiquidaEfectivo(1, 2, pParametro, 10, this.ldetalleAjustes, pParametroDet, this.url).toPromise()

    // Calculamos la diferencia entre el saldo y el gasto
    saldo = Number(res);
    resultado = saldo - gasto;

    if(resultado < 0)
    {
      // Falta de resguardo en en monto de reembolso
      if( nTipo == 1 )
      {
        Swal.fire('¡Verificar!','El monto del Reembolso: <b>' + gasto + '</b>, supera el saldo con margen de resguardo general de: <b>' + saldo + '</b>, del presupuesto seleccionado, selecionar otro presupuesto','warning')
        this.liquidaForm.get("txtCCReembolso").setValue(null);
      }
      // Falta de resguardo en gasto reparado
      else
      {
        Swal.fire('¡Verificar!','El monto aplicado el % del Gasto Reparado: <b>' + gasto + '</b>, supera el saldo con margen de resguardo general de: <b>' + saldo + '</b>, del presupuesto seleccionado','warning');
        this.liquidaForm.get("txtGastoReparado").setValue(0);
      }
      this.spinner.hide();
      return false;
    }
    this.spinner.hide();
    return true;
  }

  async fnValidarSaldo (nTipo){

    this.bGuardar = false;
    this.fnControlFab();

    let nIdPresupuesto = 0;
    let gasto = 0;

    if(nTipo == 1) //Cuando es un Reembolso
    {
      // Desactivar el control mientras valida
      this.liquidaForm.get("txtMontoReembolsable").disable();

      nIdPresupuesto = this.liquidaForm.controls.txtCCReembolso.value;
      gasto =   this.liquidaForm.controls.txtMontoReembolsable.value;

      if(!this.fnValidarMontoReembolsable()){
        // Activar nuevamente los controles luego de validar
        this.liquidaForm.get("txtMontoReembolsable").enable();
        this.liquidaForm.get("txtGastoReparado").enable();
        this.spinner.hide();
        this.bGuardar = true;
        this.fnControlFab();
        return false;
      }
    }
    else if(nTipo == 2) //Cuando es un gasto reparado
    {
      // Desactivar el control mientras valida
      this.liquidaForm.get("txtGastoReparado").disable();

      nIdPresupuesto = this.nIdCCosto;
      gasto = this.liquidaForm.controls.txtGastoReparado.value;
      gasto = (gasto * this.nPorReparado)/100
    }

    // Valor minimos para revisar el saldo de Resguardo General de Presupuesto
    // 2033 => costo fijo ||2034 => Presupuesto cliente
    if(gasto > 0 && nIdPresupuesto > 0 && this.nTipoPresupuesto == 2034)
    {
      if(!await this.fnValidarResguardoGeneral(nIdPresupuesto, nTipo, gasto)){
        // Activar nuevamente los controles luego de validar
        this.liquidaForm.get("txtMontoReembolsable").enable();
        this.liquidaForm.get("txtGastoReparado").enable();
        this.spinner.hide();
        this.bGuardar = true;
        this.fnControlFab();
        return false;
      }
    }

    // Solo cuado es gasto reparado validamos el saldo por partida
    if(nTipo == 2)
    {
      let fecha = this.efectivoForm.controls.txtFin.value;
      if(this.vUnaPartida) //Cuando es una sola partida va directo a la consulta
      {
        //this.lPartidas
        let vPartidaDesc: string = this.lPartidas[0].sPartida +' '+this.lPartidas[0].sDescripcion ;
        let vnIdPartida: number = this.lPartidas[0].nId

        if(!await this.fnValidarSaldoPartida(nIdPresupuesto, this.nIdSucursal, vnIdPartida, gasto, fecha, vPartidaDesc)){
          // Activar nuevamente los controles luego de validar
          this.liquidaForm.get("txtMontoReembolsable").enable();
          this.liquidaForm.get("txtGastoReparado").enable();
          this.spinner.hide();
          this.bGuardar = true;
          this.fnControlFab();
          return false;
        }
      }
    }

    // Activar nuevamente los controles luego de validar
    this.liquidaForm.get("txtMontoReembolsable").enable();
    this.liquidaForm.get("txtGastoReparado").enable();
    this.spinner.hide();
    this.bGuardar = true;
    this.fnControlFab();
    return true;
  }

  public async fnValidarSaldoPartida(nIdCC: number, nIdSuc: number, nIdPartida: number, gasto: number, fecha: any, vPatida: any): Promise<boolean> {
    var pParametro = [];
    var pParametroDet = [];
    var saldo = 0, resultado = 0;

    pParametro.push(nIdCC);
    pParametro.push(nIdSuc);
    pParametro.push(nIdPartida);
    pParametro.push(this.nTipoPresupuesto);
    pParametro.push(fecha);

    const res = await this.vLiquidacionesService.fnLiquidaEfectivo(1, 2, pParametro, 11, this.ldetalleAjustes, pParametroDet, this.url).toPromise()

    //debugger
    saldo = Number(res);

    resultado = saldo - gasto;
    if(resultado < 0)
    {
      Swal.fire('¡Verificar!','El monto aplicado de: <b>' + this.nPorReparado.toFixed(2) + '%</b> del Gasto Reparado: <b>' + gasto.toFixed(2) + '</b>, supera el saldo: <b>' + saldo.toFixed(2) + '</b> de la partida: <b>' + vPatida + '</b>, del presupuesto actual','warning');
      this.liquidaForm.get("txtGastoReparado").setValue(0);
      return false;
    }

    return true;
  }

  fnCancelar (){
    // this.vModifica = true;
    this.vModifica = false;
    this.fnBuscarLiquidacion(this.pLiquidacion);

    // Actualizar visibilidad botones del menu
    this.fnControlFab();
  }

  fnCerrarModal = function(){
    this.liquidaDetForm.controls.txtMontoLiq.setValue(0);
    this.liquidaDetForm.controls.cboPartidas.setValue('');
    this.liquidaDetForm.controls.txtMonto.setValue(0);
    //this.liquidaDetForm.controls.txtFechaLiq.setValue('');
    this.liquidaDetForm.controls.txtNumeroLiq.setValue('');

  }

  fnDetallePartidas = function(vTipo , vId){
    let pParametro = [];
    let pParametroDet = [];
    let montoReembolso = 0;
    this.vVerDetalleLiq =  false;

    if(vTipo == 1) //Ver detalle Liq (partidas de la liquidación)
    {
      this.nIdDetalle = vId.nIdDetLiquidacion;
      pParametro.push(vId.nIdDetLiquidacion);
      this.vLiquidacionesService.fnLiquidaEfectivo(2, 2, pParametro, 2, this.ldetalleAjustes, pParametroDet, this.url).subscribe(
        res => {
          this.lDetLiqPartidas = res;
          this.dataSource3 = new MatTableDataSource(res);
        },
        err => {
            this.spinner.hide();
            console.log(err);
        },
        () => {
            this.spinner.hide();
        }
      );

      // console.log(vId)
      //debugger;
      this.vVerDetalleLiq =  true;
      this.liquidaDetForm.controls.txtNumeroLiq.setValue(vId.sDocumento);
      this.liquidaDetForm.controls.txtFechaLiq.setValue(vId.sFechaDocPick);
      this.liquidaDetForm.controls.txtMontoLiq.setValue(vId.nMonto);
      this.liquidaDetForm.controls.txtPendiente.setValue(0);
      this.modalDetalle.nativeElement.click();

    }
    else if(vTipo == 2) // Eliminar Detalle Liq junto con partidas relacionadas en caso si tuviera
    {
      Swal.fire({
        title: '¿Desea eliminar?',
        text: 'Se eliminara permanentente el registro seleccionado de la liquidación',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {

          let pParametro = [];
          pParametro.push(this.nLiquidacion);
          pParametro.push(vId.nIdDetLiquidacion);
          pParametro.push(this.nIdGasto);
          pParametro.push(this.nIdSucursal);
          pParametro.push(this.nIdDepositario);

          //console.log(pParametro);
          this.vLiquidacionesService.fnLiquidaEfectivo(2, 4, pParametro, 1, this.ldetalleAjustes, pParametroDet, this.url).subscribe(
            res => {
              if(res == 1)
              {
                Swal.fire({position: 'center',icon: 'success',title: 'Se elimino correctamente.',showConfirmButton: false,timer: 1500})
                //Actualizamos la tabla de detalle
                this.fnDetalleLiquidacion(this.nLiquidacion);
                //Actualizamos la informacion de la cabecera
                this.fnBuscarLiquidacion(this.pLiquidacion);
                //Reset a valores en Monto Reembolso
                montoReembolso = this.liquidaForm.controls.txtMontoReembolsable.value;
                montoReembolso = montoReembolso - vId.nMonto;

                if (montoReembolso < 0) {
                  this.liquidaForm.controls.txtMontoReembolsable.setValue(0);
                  this.liquidaForm.controls.txtCCReembolso.setValue(null);
                  this.guardarReembolso = true;
                  this.fnGuardar();
                }else{
                  this.liquidaForm.controls.txtMontoReembolsable.setValue(montoReembolso)
                  this.guardarReembolso = true;
                  this.fnGuardar();
                }

              }
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
      })

     // Swal.fire('¿Desea eliminar?','Se eliminara permanentente el registro seleccionado de la liquidación','question')


    }
  }

  fnEliminarPartida = function(vIndex){
    //debugger;
    let nTotal: number = 0;

    this.lDetLiqPartidas.splice(vIndex, 1)
    this.dataSource3 = new MatTableDataSource(this.lDetLiqPartidas);

    for (let index = 0; index < this.lDetLiqPartidas.length; index++) {
      nTotal = nTotal + this.lDetLiqPartidas[index].nMonto
    }

    this.liquidaDetForm.controls.txtMontoLiq.setValue(nTotal);

  }

  fnPendienteLiq_Partida = function(){
    //debugger;
    let vPartida = this.liquidaDetForm.value.cboPartidas
    let vPendiente: number = 0;
    let nLiquidado: number = 0;
    let pParametro = [];
    let pParametroDet = [];

    //console.log(this.lPartidas);

    for (let index = 0; index < this.lPartidas.length; index++) {
      if( vPartida == this.lPartidas[index].nId)
        vPendiente = this.lPartidas[index].nMonto
    }

    pParametro.push(this.nLiquidacion);
    pParametro.push(vPartida);
    //console.log(pParametro);

    //Traemos el monto ya liquidado por partida
    this.vLiquidacionesService.fnLiquidaEfectivo(2, 5, pParametro, 1, this.lDetLiqPartidas, pParametroDet, this.url).subscribe(
      res => {
        //Actualizar el monto pendiente a revisar
        vPendiente = vPendiente - res ;

        for (let index = 0; index < this.lDetLiqPartidas.length; index++) {
          if(vPartida == this.lDetLiqPartidas[index].nId)
          {
            nLiquidado = this.lDetLiqPartidas[index].nMonto;
          }
        }

        vPendiente = vPendiente - (this.vVerDetalleLiq == true ? 0 : nLiquidado);
        this.liquidaDetForm.controls.txtPendiente.setValue(vPendiente.toFixed(2));
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

  fnMostrarRE = function() {
    this.vVerReporte = true;
  }

  fnMostrarRR = function() {
    //console.log(this.nIdGastoRR);
    this.vVerReporteRR = true;
  }

  fnMostrarSM = function() {
    this.vVerReporteSM = true;
  }

  fnPresupuestos = function(vGasto) {

    let pParametro = [];
    let pParametroDet = [];
    pParametro.push(vGasto);

    this.vLiquidacionesService.fnLiquidaEfectivo(1, 2, pParametro, 9, 0, pParametroDet, this.url).subscribe(
      res => {
        this.lCentroCostoReembolso = res;
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

  fnEvitarNegativos(vTipo: any) {
    var repartir: any

    if(vTipo == 1 ) //Devolucion Caja Chica
    {
      repartir = this.liquidaForm.controls.txtMontoDevolucion.value;
      repartir = Math.abs(repartir);
      this.liquidaForm.controls.txtMontoDevolucion.setValue(repartir);

    }

    if(vTipo == 2 ) //Devolucion Bancaria
    {
      repartir = this.liquidaForm.controls.txtMontoDevolBanco.value;
      repartir = Math.abs(repartir);
      this.liquidaForm.controls.txtMontoDevolBanco.setValue(repartir);
    }

    if(vTipo == 3 ) //Descuento al personal
    {
      repartir = this.liquidaForm.controls.txtMontoDescuento.value;
      repartir = Math.abs(repartir);
      this.liquidaForm.controls.txtMontoDescuento.setValue(repartir);
    }

    if(vTipo == 4 ) //Credifo Fiscal
    {
      repartir = this.liquidaForm.controls.txtCreditoFiscal.value;
      repartir = Math.abs(repartir);
      this.liquidaForm.controls.txtCreditoFiscal.setValue(repartir);
    }

    if(vTipo == 5 ) //Reembolsable
    {
      repartir = this.liquidaForm.controls.txtMontoReembolsable.value;
      repartir = Math.abs(repartir);
      this.liquidaForm.controls.txtMontoReembolsable.setValue(repartir);

      let centroCosto = Number(this.liquidaForm.controls.txtCCReembolso.value);
      //console.log(centroCosto);
      if(repartir>0 && centroCosto==0)
      {
        this.liquidaForm.controls.txtCCReembolso.setValue(this.nIdCCosto);
      }
      if(repartir==0)
      {
        this.liquidaForm.controls.txtCCReembolso.setValue(null);
      }

    }

    if(vTipo == 6 ) //Gasto Reparado
    {
      repartir = this.liquidaForm.controls.txtGastoReparado.value;
      repartir = Math.abs(repartir);
      this.liquidaForm.controls.txtGastoReparado.setValue(repartir);
    }

    if(vTipo == 7 ) //Monto por partida
    {
      repartir = this.partidaForm.controls.txtMonto.value;
      repartir = Math.abs(repartir);
      this.partidaForm.controls.txtMonto.setValue(repartir);
    }

    if(vTipo == 8 ) //Monto para Detalle
    {
      repartir = this.liquidaDetForm.controls.txtMonto.value;
      repartir = Math.abs(repartir);
      this.liquidaDetForm.controls.txtMonto.setValue(repartir);
    }
  }

  async fnValidarDocumentoExistente(){
    const pParametro = [];
    const pParametroDet = [];

    const nombreDocumento = this.liquidaForm.get("txtDocDescuento").value;

    console.log(nombreDocumento)

    // Validar solo si se ha ingresado un documento
    if(nombreDocumento != '' || nombreDocumento){

      pParametro.push(this.nIdDepositario); // Id del depositario
      pParametro.push(nombreDocumento); // Documento ingresado
      const res = await this.vLiquidacionesService.fnLiquidaEfectivo(1, 2, pParametro, 14, this.ldetalleAjustes, pParametroDet, this.url).toPromise()

      console.log(res)

      // Si no devuelve ningun valor, significa que el documento no existe o ya ha sido utilizado
      if(!res){
        Swal.fire('¡Verificar!',`El documento ${nombreDocumento} no existe`,'warning');
        this.liquidaForm.get("txtDocDescuento").setValue('');
      }

      return false;
    }
    return true;
  }

  fnEliminaPartidaDocumento = function(vIndex: any){
    //console.log(vIndex);

     //debugger;
     let nTotal: number = 0;

    if(this.vTipoAccion == 1) //Deposito Banco
    {
      this.lDespositoBanco.splice(vIndex, 1)
      this.dataSource2 = new MatTableDataSource(this.lDespositoBanco);

      for (let index = 0; index < this.lDespositoBanco.length; index++) {
        nTotal = nTotal + this.lDespositoBanco[index].nMonto
      }
      this.liquidaForm.controls.txtMontoDevolBanco.setValue(nTotal);
    }
    if(this.vTipoAccion == 2) //Desposito Caja Chica
    {
      this.lDespositoCaja.splice(vIndex, 1)
      this.dataSource2 = new MatTableDataSource(this.lDespositoCaja);

      for (let index = 0; index < this.lDespositoCaja.length; index++) {
        nTotal = nTotal + this.lDespositoCaja[index].nMonto
      }
      this.liquidaForm.controls.txtMontoDevolucion.setValue(nTotal);
    }
    if(this.vTipoAccion == 3) //Descuento al Personal
    {
      this.lDescuentoPersonal.splice(vIndex, 1)
      this.dataSource2 = new MatTableDataSource(this.lDescuentoPersonal);

      for (let index = 0; index < this.lDescuentoPersonal.length; index++) {
        nTotal = nTotal + this.lDescuentoPersonal[index].nMonto
      }
      this.liquidaForm.controls.txtMontoDescuento.setValue(nTotal);
    }
    if(this.vTipoAccion == 4) //Reembolsable
    {

    }
    if(this.vTipoAccion == 5) //Gasto Reparado
    {
      this.lGastoReparado.splice(vIndex, 1)
      this.dataSource2 = new MatTableDataSource(this.lGastoReparado);

      for (let index = 0; index < this.lGastoReparado.length; index++) {
        nTotal = nTotal + this.lGastoReparado[index].nMonto
      }
      this.liquidaForm.controls.txtGastoReparado.setValue(nTotal);
    }
  }

  fnValidarMontoReembolsable(){
    const monto = Number(this.liquidaForm.controls.txtMontoReembolsable.value);
    const gastoActual = Number(this.efectivoForm.get("txtTotalLiquidado").value);
    const deposito = Number(this.efectivoForm.get("txtDeposito").value);

    // Validar que el monto ingresado no supere a la diferencia de gasto tope menos gasto actual
    if(this.fnExisteReembolso()){
      if(monto > gastoActual - deposito){
        Swal.fire('¡Verificar!','El monto reembolsable ingresado de <b>' + monto.toFixed(2) + '</b> supera al monto máximo reembolsable de <b>' + (gastoActual - deposito).toFixed(2) + '</b>','warning');
        this.liquidaForm.get("txtMontoReembolsable").setValue(gastoActual - deposito);
        return false;
      }
    }
    return true;
  }

  fnExisteReembolso(){
    const gastoActual = Number(this.efectivoForm.get("txtTotalLiquidado").value);
    const deposito = Number(this.efectivoForm.get("txtDeposito").value);
    if(gastoActual - deposito > 0){
      return true;
    }
    return false;
  }

  printDoc() {
    const pdfFrame = document.getElementById('pdf-frameLiq') as HTMLIFrameElement;
    if ( pdfFrame.src !== '' ) {
      this.pbMain = false;
      pdfFrame.contentWindow.print();
    }
  }

  valorDsctos(): boolean{

    if( this.valorImpresion > 0) return true;

  }

  // async fnImprimirliq() {

  //   console.log(this.nLiquidacion);


  //   var pParametro = this.pLiquidacion;
  //   pParametro.nDescuento = this.liquidaForm.controls.txtMontoDescuento.value// + '.00'

  //   var params = [];
  //   params.push(this.nLiquidacion + '|' + this.idEmp);
  //   console.log(params);

  //   await this.vLiquidacionesService.print(4, 2, params, 1, this.url).then( (result: any) => {
  //     console.log(result)
  //     let objectURL: any = URL.createObjectURL(result);
  //     const pdfFrame = document.getElementById('pdf-frameLiq') as HTMLIFrameElement;
  //     pdfFrame.src = '';
  //     pdfFrame.src = objectURL;
  //     objectURL = URL.revokeObjectURL(result);
  //   });
  //   //this.aParam = [];
  // }

  //#region Impresion

  /*
  fnImprimirRQ (){
    this.vImpresionReporte = true;
    // Agregar nombre al documento
    const tempTitle = document.title;
    document.title = 'Reporte Requerimiento';
    // Impresion
    setTimeout(()=>{
      window.print();
      this.vImpresionReporte = false;
    })
    document.title = tempTitle;
    return;
  }

  fnImprimirRR (){
    this.vImpresionReporteRR = true;
    // Agregar nombre al documento
    const tempTitle = document.title;
    document.title = 'Reporte Reembolso';
    // Impresion
    setTimeout(()=>{
      window.print();
      this.vImpresionReporteRR = false;
    })
    document.title = tempTitle;
    return;
  }

  fnImprimirSM (){
    this.vImpresionReporteSM = true;
    // Agregar nombre al documento
    const tempTitle = document.title;
    document.title = 'Solicitud Movilidad';
    // Impresion
    setTimeout(()=>{
      window.print();
      this.vImpresionReporteSM = false;
    })
    document.title = tempTitle;
    return;
  }
  */

  fnImprimirReporteRQ (){
    const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;
    const reporte = document.getElementById('print-reporte-rq').innerHTML;
    pdfFrame.contentWindow.document.open();
    pdfFrame.contentWindow.document.write(reporte);
    pdfFrame.contentWindow.document.close();
    pdfFrame.contentWindow.print();
  }

  fnImprimirReporteRR (){
    const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;
    const reporte = document.getElementById('print-reporte-rr').innerHTML;
    pdfFrame.contentWindow.document.open();
    pdfFrame.contentWindow.document.write(reporte);
    pdfFrame.contentWindow.document.close();
    pdfFrame.contentWindow.print();
  }

  fnImprimirReporteSM (){
    const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;
    const reporte = document.getElementById('print-reporte-sm').innerHTML;
    pdfFrame.contentWindow.document.open();
    pdfFrame.contentWindow.document.write(reporte);
    pdfFrame.contentWindow.document.close();
    pdfFrame.contentWindow.print();
  }

  fnImprimirReporteCelularRQ (){
    const divText = document.getElementById("print-reporte-rq").outerHTML;
    const myWindow = window.open('','','width=985,height=1394');
    const doc = myWindow.document;
    doc.open();
    doc.write(divText);
    doc.close();
    doc.body.innerHTML = doc.body.innerHTML +`
    <style>
    .rompePaginas{
      background-color: red
    }
    @media print {
      .rompePaginas {page-break-after: always;}
    }
    </style>`;
    doc.title = 'Reporte Requerimiento';
  }

  fnImprimirReporteCelularRR (){
    const divText = document.getElementById("print-reporte-rr").outerHTML;
    const myWindow = window.open('','','width=985,height=1394');
    const doc = myWindow.document;
    doc.open();
    doc.write(divText);
    doc.close();
    doc.body.innerHTML = doc.body.innerHTML +`
    <style>
    .rompePaginas{
      background-color: red
    }
    @media print {
      .rompePaginas {page-break-after: always;}
    }
    </style>`;
    doc.title = 'Reporte Requerimiento';
  }

  fnImprimirReporteCelularSM (){
    const divText = document.getElementById("print-reporte-sm").outerHTML;
    const myWindow = window.open('','','width=985,height=1394');
    const doc = myWindow.document;
    doc.open();
    doc.write(divText);
    doc.close();
    doc.title = 'Solicitud Movilidad';
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

}
