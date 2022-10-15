import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as countdown from 'countdown';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { NotaHistorialComponent } from '../../nota-historial/nota-historial.component';
import { AppDateAdapter, APP_DATE_FORMATS } from './../../../../../../shared/services/AppDateAdapter';
import { ArticuloImagenComponent } from './../../articulo-modal/articulo-imagen/articulo-imagen.component';
import { NotasLogisticaService } from './../../notas-logistica.service';

// Validaciones
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

interface Time{
  hours: number,
  minutes: number,
  seconds:number
}

export interface EntityBase {
  pId: number;
  sDescripcion:string;
  sParametro: string;
}

@Component({
  selector: 'app-nota-salida-detalle',
  templateUrl: './nota-salida-detalle.component.html',
  styleUrls: ['./nota-salida-detalle.component.css'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ],
  animations: [asistenciapAnimations]
})

export class NotaSalidaDetalleComponent implements OnInit {
  tsLista = 'active';  // Inicia la lista abierta
  abLista = 0;

  //Variables que viene desde el Padre
  @Input() pOpcion: number; 
  @Input() nIdNotaSalida: number; 
 
  //Variables que van al padre
  @Output() newEvent: EventEmitter<any>;
  objNotaBase = [];
  @ViewChild('expUbicacion') expUbicacion: MatExpansionPanel;
  //Variables del sistema
  url: string;
  sPais: string;  
  nIdEmpresa:string;
  sNombreEmpresa:string
  nIdUsuario:number;
  sNombreUsuario:string;
  nIdOperMov:number 
  sSinImagen:string
  dFechaActual:any;
  sFechaActual:any
  sFechaHoy:any
  sFechaManiana:any
  sFechaPasado:any
  sFechaTraspasado:any
  sHora:any
  sMinutos:any
  nDiaSabado:number
  nDiaDomingo:number
  

  //Formularios
  salidaForm: FormGroup;
  detalleForm: FormGroup;

  //Variables Tipo combo Cabecera  
  cboDocumento:[]
  cboAlmacen=[]
  cboParamFecha=[]
  cboDestino=[]
  cboPresupuesto=[]
  cboEntidad=[]    
    
  //Variables de la Nota
  nIdCentroCosto:number
  nIdAlmacen:number
  dFechaOperMov:any
  nEstadoNota:number
  nIdMovil:number
  nIdTipoEnvio:number

  nIdDestinatario:number
  nIdPuntoLlegada:number
  nIdDireccion:number
  valorParamFecha:any
  valorPesoVol:any
  nTaxiPeso:number
  nTaxiVolumen:number
  nIdCentroCostoAnterior:number  
  nIdAlmacenAnterior:number
  nIdTipoCourier:number
  dFechaAnterior:any
  nIdTipoVehiculo: number = 0;  
  nIdGastoCosto: number= 0; 
  //Combos
  cboDestinatario:[]  
  cboPuntoLlegada:[]
  cboEntidades:[]
  cboSucursal:[]
  cboMovil:any
  cboHoras:any
  cboTipoMovil=[]  
  cboPresupestoPermitidos=[]
  cboAlmacenPermitidos=[]
  cboValorSaldo=[]
  
  //Variables Detalle Modal  
  cboArticulo=[] 
  cboUnidadMedida:[]
  cboLote:[]
  cboFechaVenc:[]
  cboSaldoActual:[]
  cboCantidadDetalle:[]
  cboPesoDetalle:[]
  cboVolumenDetalle:[]
  cboObservaciones:[]
  cboPesoVol=[]
  

  sArticulo:string
  nPesoDetalle:number
  nVolumenDetalle:number
  sRutaImagen:string
  nFilaEditada
  bEditarDetalle:boolean = false;

  //Listas para Detalle
  listaDetalle=[]
  listaArticulos=[]

  //Variables de Transporte
  sUbigeoOrigen:string
  sUbigeoDestino:string
  nIdSucursalGasto:number
  nIdPartidaGasto:number
  nPrecioEstandar:number=0;
  sMensajeError:string
      
  //Variables de autocompletables
  sDescripcion:string
  sUbicacion:string
  bOpcDia:number

  //Variables de estado de botones
  vModifica:boolean = true;
  vbtnGuardar:boolean   = false;
  vbtnModificar:boolean = false;
  vbtnCancelar:boolean  = false;
  vbtnAprobar:boolean   = false;
  vbtnDevolver:boolean  = false; 
  vbtnEnviar:boolean    = false; 
  vbtnDuplicar:boolean  = false; 
  minDate = new Date();

  //Variables Tiempo
  time: Time=null;
  timerId:number=null;
  bCountdown : boolean  = false;
  bEstadoNuevo : boolean  = true;
  bNotaMismoDia:boolean
  bCierreAutomatico:boolean

  //Material Table
  detNotaSalidaTableData: MatTableDataSource<any>;
  @ViewChild(MatPaginator) detNotaSalidaPaginator: MatPaginator;
  @ViewChild(MatSort) detNotaSalidaSort: MatSort;
  DetNotaSalidaColumns: string[] = 
  ['pEstado','sArticulo', 'sMedida', 'sLote', 'sFechaVence','nStockActual', 'nCantidad', 'nPesoDetalle', 'nVolumenDetalle', 'sObservacionDet'];

  @ViewChild('modalArticulo') modalArticulo: ElementRef;
  @ViewChild('modalImagen') modalImagen: ElementRef;

  matcher = new MyErrorStateMatcher();
  disableDateList: Array<any> = [];

  vNotaSalida:boolean = true;
  vNotaRecojo:boolean = false;

  //Variable para que setee la fecha solo la primera vez que crea
  bCreaPrimera: boolean = false;

  //Variable que almacena y pusheaa a la lista de CC, al guardar se validara si el CC esta activo
  vCentroCosto;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router, 
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    @Inject('BASE_URL') baseUrl: string,
    private notasLogisticaService: NotasLogisticaService,
    public dialog: MatDialog
    ) {
    this.url = baseUrl; 
    this.newEvent = new EventEmitter();
    
    this.cboHoras = [      
      {sHora: '09:00'},
      {sHora: '10:00'},
      {sHora: '11:00'},
      {sHora: '12:00'},
      {sHora: '13:00'},
      {sHora: '14:00'},
      {sHora: '15:00'},
      {sHora: '16:00'},
      {sHora: '17:00'},      
      {sHora: '18:00'},
      
    ];

    this.sSinImagen='/assets/img/SinImagen.jpg'

   }

  ngOnInit(): void {

    //Inicializar variables del sistema
    this.sPais = localStorage.getItem('Pais');
    this.nIdEmpresa = localStorage.getItem('Empresa');
    this.sNombreEmpresa = localStorage.getItem('NomEmpresa');
    const user = localStorage.getItem('currentUser');
    this.nIdUsuario = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.sNombreUsuario = JSON.parse(window.atob(user.split(".")[1])).uno;


    this.salidaForm = this.formBuilder.group({      
      txtSolicitante: [''],         
      txtPresupuesto:['',Validators.required],
      opcAlmacen: ['',Validators.required],      
      txtFechaEntrega: ['',Validators.required],      
      btnTodoDia:[false],
      opcHora: [''],
      txtDestinatario: ['',Validators.required],
      txtEntidadDestino: ['',Validators.required],      
      txtPuntoDestino: ['',Validators.required],
      txtUbicacion: [''],
      txtDireccionDestino: [''],      
      opcMovil: ['',Validators.required],
      opcTipoMovil: ['',Validators.required],
      txtObservacion: [''],
      txtTotalUnidades: [''],
      txtTotalPeso: [''],
      txtTotalVolumen: [''],
        
      //Auditoria
      txtDocumento: [''],
      txtEstado: [''],
      txtCreado: [''],
      txtFechaCreado: [''],
      txtGuiaSalida: ['']
   
    }); 
    this.onToggleFab(1, -1)

    this.fnIniciarFormDetalle();
    this.fnCrearMovil();
    this.fnObtenerFechaActual(); 
    

    if(this.pOpcion==1){
      this.bCreaPrimera=true;
      this.fnNuevo();
      this.salidaForm.get('opcMovil').disable();
      this.salidaForm.get('opcTipoMovil').disable();
      this.fnObtenerSolicitante();
    }

    else if(this.pOpcion==3){     
      this.nIdOperMov=this.nIdNotaSalida
      this.fnCargarCabecera();
    
    }

    this.spinner.show('spiDialog');

    this.spinner.hide('spiDialog');

  }

  //#region Iniciar Form Detalle
  fnIniciarFormDetalle(){
    this.detalleForm = this.formBuilder.group({     
      txtArticulo:['',Validators.required],
      txtTipoLote:[''],
      nIdControlLote:['',Validators.required],    
      txtUnidadMedida:[''],
      txtFechaIngreso:[''],
      txtFechaVencimiento:[''],
      txtLote:[''],
      txtStockActual:[''],
      txtCantidad:['',Validators.required],
      txtObservacionDetalle:[''],
      
      txtCantidadDetalle:[''],
      txtPesoDetalle:[''],
      txtVolumenDetalle:[''],  
      txtPrecioUnidad:['']  
    })

    this.detalleForm.get('txtCantidad').disable();
    this.nPesoDetalle=0
    this.nVolumenDetalle=0    
    this.sRutaImagen=this.sSinImagen
  }
  //#endregion

  //#region Nueva Nota
  fnNuevo(){
    this.vbtnGuardar=true; 
    this.listaDetalle=[];   
    this.fnObtenerPresupuestos();
    this.fnObtenerEntidad();
    this.salidaForm.controls.txtCreado.setValue(this.sNombreUsuario);
    this.salidaForm.controls.txtEstado.setValue('Incompleto') 
  }
  //#endregion

  //#region Crear Movil
  fnCrearMovil(){
    this.cboMovil = [
      {nIdMovil: 1, sOpcMovil: 'Si'},
      {nIdMovil: 2, sOpcMovil: 'No'}      
    ];
  }
  //#endregion

  //#region Salir
  fnSalir(){        
    this.newEvent.emit(1);    
  }
  //#endregion

  //#region Eventos 
  
    //#region Evento Hora de Entrega
    fnCambiarHoraEntrega(event){        
      if(event.checked==true){
        this.salidaForm.controls['opcHora'].setValue('');
        this.salidaForm.get('opcHora').disable(); 
      }
      else if(event.checked==false){
        this.salidaForm.get('opcHora').enable();
      }
    }
    //#endregion

    //#region Evento elegir Courier
    fnEventCourier(event){        
      this.nIdTipoEnvio=event.value;
      if(event.value==2209 ){
        this.nIdTipoCourier=1        
      }
      else if(event.value==2210){
        this.nIdTipoCourier=2
      }
      else{
        this.nIdTipoCourier=0
      }
    }
    //#endregion

    //#region Evento Cambiar Movil
    fnEventMovil(event){      
        this.nIdMovil=event.value     
    }
    //#endregion
    
  //#endregion
  
  //#region Obtener Solicitante
  async fnObtenerSolicitante(){

    const pParametro = [];
    pParametro.push(this.nIdUsuario);

    const pParametroDet = [];
        
    await this.notasLogisticaService.
    fnControlNotaSalida( 1, 2, pParametro, 2 , pParametroDet, this.url)
    .then((data: any) => {
      
      this.salidaForm.controls['txtSolicitante'].setValue(data.datos);      
            
    }, error => {
      console.log(error);
    });

  }
  //#endregion Obtener Solicitante

  //#region Obtener Presupuestos
  async fnObtenerPresupuestos(){
    
    const pParametro = [];
    pParametro.push(this.nIdUsuario);
    pParametro.push(this.nIdEmpresa);          
          
    const pParametroDet = [];

    await this.notasLogisticaService.
    fnControlNotaSalida( 1, 2, pParametro, 3 , pParametroDet, this.url)
    .then((data: any) => {
      
      this.cboPresupuesto=data;   
      
      if(this.vbtnGuardar==false){
        //Si no esta activo el presupuesto de la cabecera lo agregamos a la lista
        if(this.cboPresupuesto.findIndex(item=> item.nId==this.vCentroCosto.nId)==-1){
          this.cboPresupuesto.push(this.vCentroCosto);
        }

        this.salidaForm.controls.txtPresupuesto.setValue(this.nIdCentroCosto);
        this.fnObtenerAlmacen(this.nIdCentroCosto);        
      }
            
    }, error => {
      console.log(error);
    });
  }
  //#endregion Obtener Presupuestos
  
  //#region Obtener Almacen
  async fnObtenerAlmacen(nIdCentroCosto){
    this.nIdCentroCosto=nIdCentroCosto
    
    const pParametro = [];
    pParametro.push(this.nIdUsuario);           
    pParametro.push(this.nIdCentroCosto);
      
    const pParametroDet = [];

    await this.notasLogisticaService.
    fnControlNotaSalida( 1, 2, pParametro, 4 , pParametroDet, this.url)
    .then((data: any) => {
      
      this.cboAlmacen=data;   
     
      //En caso el presupuesto seleccionado no tenga ningun almacen mostramos una alerta
      if(this.cboAlmacen.length==0){
        Swal.fire('¡Verificar!', `El presupuesto seleccionado no tiene stock disponible en ningún almacén.`, 'warning')
      }
      if(this.vbtnGuardar==false ){
        this.salidaForm.controls.opcAlmacen.setValue(this.nIdAlmacen);  
        this.fnObtenerArticulo();
      }
      else{
        this.nIdAlmacen=0
        this.salidaForm.controls.opcAlmacen.setValue('');
      }

    }, error => {
      console.log(error);
    });

  }
  //#endregion Obtener Almacen

  //#region  Obtener Entidades
  fnObtenerEntidad(){
    
    const pParametro = [];
    pParametro.push(this.sPais);           
          
    const pParametroDet = [];

    this.notasLogisticaService.
    fnControlNotaSalida( 1, 2, pParametro, 5 , pParametroDet, this.url)
    .then((data: any) => {
    
      this.cboEntidades=data;   

      if(this.pOpcion==3){
        this.salidaForm.controls.txtDestinatario.setValue(this.nIdDestinatario);
        this.salidaForm.controls.txtEntidadDestino.setValue(this.nIdPuntoLlegada);        
        this.fnObtenerDestino(this.nIdPuntoLlegada);
      }
            
    }, error => {
      console.log(error);
    });
  }
  //#endregion  Obtener Entidades

  //#region Obtener Destinos
  fnObtenerDestino(nIdEntidad){    
    
    if(this.nIdCentroCosto == 0 || this.nIdCentroCosto == null){
      Swal.fire('¡Verificar!', `Seleccione un presupuesto para poder continuar.`, 'warning')
      return;
    }
  
    const pParametro = [];
    pParametro.push(nIdEntidad);        
    pParametro.push(this.nIdCentroCosto);          
    
    const pParametroDet = [];

    this.notasLogisticaService.
    fnControlNotaSalida( 1, 2, pParametro, 6 , pParametroDet, this.url)
    .then((data: any) => {
      
      this.cboDestino=data;   
      
      if(this.vbtnModificar==true || this.nEstadoNota==2226 || this.pOpcion == 3){
        this.salidaForm.controls.txtPuntoDestino.setValue(this.nIdDireccion);
        this.fnObtenerUbicacion(this.nIdDireccion)
      }

    }, error => {
      console.log(error);
    });    

  }
  //#endregion Obtener Destinos

  //#region Obtener Ubicacion y Direccion
  async fnObtenerUbicacion(nIdDestino){

    this.nIdDireccion=nIdDestino


    if(this.vbtnGuardar==true){
      let validarDireccion = await this.fnValidarDireccionNota();

      if(validarDireccion[0].sDescripcion!=''){
        var resp = await Swal.fire({
          title: '¿Desea continuar?',
          html: validarDireccion[0].sDescripcion,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Aceptar',
          cancelButtonText: 'Cancelar',
        })
    
        if (!resp.isConfirmed) {
          this.salidaForm.controls.txtPuntoDestino.setValue('');
          this.salidaForm.controls.txtUbicacion.setValue('');
          this.salidaForm.controls.txtDireccionDestino.setValue('');
          this.salidaForm.controls.opcMovil.setValue(''); 
          this.salidaForm.controls.opcTipoMovil.setValue('');     
          return;
        }
      }
      this.salidaForm.controls.opcMovil.setValue(''); 
      this.salidaForm.controls.opcTipoMovil.setValue(''); 
    }


    if(this.cboDestino.length>0){  
      for (let i = 0; i < this.cboDestino.length; i++) {        
        if(nIdDestino==this.cboDestino[i].nIdDireccion){                           
          this.salidaForm.controls.txtUbicacion.setValue(this.cboDestino[i].sDepartamento+', '+this.cboDestino[i].sProvincia+', '
                                                    +this.cboDestino[i].sDistrito+' - '+this.cboDestino[i].sTipoZona);
          this.salidaForm.controls.txtDireccionDestino.setValue(this.cboDestino[i].sDireccion);
          this.sUbigeoDestino=this.cboDestino[i].sUbicacion
          //Estado
          if(this.vbtnGuardar==true){         
          this.salidaForm.get('opcMovil').enable();
          this.salidaForm.get('opcTipoMovil').enable();
          this.fnValidarMovil();
          }
        }
      }
    }

    if(this.vbtnGuardar==false){
      this.fnObtenerMovilidad();
    }


  }
  //#endregion Obtener Ubicacion y Direccion

  //#region Validar si es que hay notas el mismo dia
  async fnValidarDireccionNota(){
    let valorDireccion;
            
    const pParametro = []
    pParametro.push(this.nIdAlmacen ?? 0)       
    pParametro.push(this.nIdCentroCosto ?? 0)
    pParametro.push(this.nIdDireccion ?? 0)
    pParametro.push(this.dFechaOperMov)
    const pParametroDet = [];
                  
    valorDireccion = await this.notasLogisticaService.fnControlNotaSalida( 1, 2, pParametro, 22 , pParametroDet, this.url) 
    return valorDireccion
  }
  //#endregion

  //#region Obtener Movilidad
  async fnObtenerMovilidad(){
    
    const pParametro = [];    
    pParametro.push(this.nIdMovil);
      
    const pParametroDet = [];

    await this.notasLogisticaService.
    fnControlNotaSalida( 1, 2, pParametro, 7 , pParametroDet, this.url)
    .then((data: any) => {
      
      this.cboTipoMovil=data;
       
          this.fnValidarMovil();   
                    
    }, error => {
      console.log(error);
    });

  }
  //#endregion Obtener Movilidad

  //#region Detalle Modal
  
    //#region Abrir Modal Nuevo
    btnAgregarLineaDetalle(){    
      this.bEditarDetalle=false;
      if(this.fnValidarAbrirModal()!=false){
        this.fnObtenerArticulo();

        this.fnIniciarFormDetalle();
       
        this.modalArticulo.nativeElement.click();
      }
    }
    //#endregion

    //#region Inicializar Detalle
    fnInicializarDetalle(){ 
      this.detNotaSalidaTableData = new MatTableDataSource();
      this.detNotaSalidaTableData.paginator = this.detNotaSalidaPaginator;

      this.listaDetalle=[]
      this.listaArticulos=[]             
    
    }
    //#endregion
  
    //#region Agregar Detalle modal
    async fnAgregarListaDetalle(){  
      this.spinner.show()
      await this.fnObtenerPesoVol();
    
      if(this.fnValidarModal()!=false && this.fnValidarStock()!=false ){
        var nCantidadDetalle
        nCantidadDetalle=this.detalleForm.get('txtCantidad').value
      
        this.listaDetalle.push(
              {sArticulo:     this.sArticulo, 
              nArticulo:      this.detalleForm.get('txtArticulo').value, 
              sMedida:        this.detalleForm.get('txtUnidadMedida').value, 
              sLote:          this.detalleForm.get('txtLote').value,
              nIdTipoLote:    this.detalleForm.get('nIdControlLote').value,
              sFechaIngreso:  this.detalleForm.get('txtFechaIngreso').value,
              sFechaVence:    this.detalleForm.get('txtFechaVencimiento').value, 
              nStockActual:   this.detalleForm.get('txtStockActual').value, 
              nPrecioUnidad:  this.detalleForm.get('txtPrecioUnidad').value, 
              nCantidad:      Math.round(nCantidadDetalle),
              nPesoDetalle:   this.nPesoDetalle,
              nVolumenDetalle:this.nVolumenDetalle,
              sObservacionDet:this.detalleForm.get('txtObservacionDetalle').value});

      
        this.detNotaSalidaTableData = new MatTableDataSource(this.listaDetalle);
        this.detNotaSalidaTableData.paginator = this.detNotaSalidaPaginator; 
        this.detNotaSalidaTableData.sort = this.detNotaSalidaSort; 

        this.fnCalcularTotales();

        //this.modalArticulo.nativeElement.click();
        this.fnIniciarFormDetalle();
        this.spinner.hide()        
      }  
    }
    //#endregion

    //#region Abrir Modal Edición
    async btnEditarDetalle(i, row){
 
      if(await this.fnValidarFifoEditar(row)!=false){

        this.modalArticulo.nativeElement.click();
        this.bEditarDetalle=true;
        this.nFilaEditada= i;
        this.detalleForm.controls['txtArticulo'].setValue(row.nArticulo); 
        
  
        this.sArticulo=row.sArticulo
        for (let i = 0; i < this.cboArticulo.length; i++) { 
          if(this.cboArticulo[i].nIdArticulo==row.nArticulo){      
            this.detalleForm.controls.txtTipoLote.setValue(this.cboArticulo[i].sControlLote);                       
            this.sRutaImagen=this.cboArticulo[i].sRutaArchivo
          }
        }
        this.detalleForm.controls.nIdControlLote.setValue(row.nIdTipoLote);
        this.detalleForm.controls.txtUnidadMedida.setValue(row.sMedida); 
        this.detalleForm.controls.txtFechaIngreso.setValue(row.sFechaIngreso);  
        this.detalleForm.controls.txtFechaVencimiento.setValue(row.sFechaVence);  
        this.detalleForm.controls.txtPrecioUnidad.setValue(row.nPrecioUnidad);      
        this.detalleForm.controls.txtLote.setValue(row.sLote); 
        this.detalleForm.controls.txtStockActual.setValue(row.nStockActual);                        
        
        this.detalleForm.controls['txtCantidad'].setValue(row.nCantidad);   
        this.detalleForm.get('txtArticulo').disable();
        this.detalleForm.get('txtCantidad').enable();   
        this.detalleForm.controls['txtObservacionDetalle'].setValue(row.sObservacionDet); 
      }
      
    }
    //#endregion

    //#region Abrir Imagen Modal
    btnVerImagen(i, row) {

      let bRuta;
      bRuta=false;
                      
      this.bEditarDetalle=true;
              
      this.detalleForm.controls['txtArticulo'].setValue(row.nArticulo);    
      
      if(this.cboArticulo.length>0){  
  
        for (let j = 0; j < this.cboArticulo.length; j++) {        
          if(this.cboArticulo[j].nIdArticulo==row.nArticulo){
            
            this.sArticulo=this.cboArticulo[j].sDescripcion           
            this.sRutaImagen=this.cboArticulo[j].sRutaArchivo  
                  
            bRuta=true       
          }
          else if(bRuta==false){
            this.sRutaImagen=this.sSinImagen
          }
        }
      }

      if(row.nArticulo==0){
       
        this.sRutaImagen=this.sSinImagen               
      }

      
      this.dialog.open(ArticuloImagenComponent, {
        width: '25rem',
        maxWidth: '90vw',
        data: {
          url: this.sRutaImagen,
          sArticulo: this.sArticulo
        }
      })
    }
    //#endregion

    //#region Editar Detalle
    async fnEditarListaDetalle(){
      let i;
      i=this.nFilaEditada;

      await this.fnObtenerPesoVol();

      if(this.fnValidarModal()!=false && this.fnValidarStock()!=false ){
    
      var nCantidadDetalle
      nCantidadDetalle=this.detalleForm.get('txtCantidad').value;
        
            this.listaDetalle[i].sArticulo=       this.sArticulo
            this.listaDetalle[i].nArticulo=       this.detalleForm.get('txtArticulo').value
            this.listaDetalle[i].sMedida=         this.detalleForm.get('txtUnidadMedida').value
            this.listaDetalle[i].sLote=           this.detalleForm.get('txtLote').value
            this.listaDetalle[i].nIdTipoLote=     this.detalleForm.get('nIdControlLote').value
            this.listaDetalle[i].sFechaIngreso=   this.detalleForm.get('txtFechaIngreso').value
            this.listaDetalle[i].sFechaVence=     this.detalleForm.get('txtFechaVencimiento').value
            this.listaDetalle[i].nStockActual=    this.detalleForm.get('txtStockActual').value
            this.listaDetalle[i].nPrecioUnidad=   this.detalleForm.get('txtPrecioUnidad').value
            this.listaDetalle[i].nCantidad=       Math.round(nCantidadDetalle)
            this.listaDetalle[i].nPesoDetalle=    this.nPesoDetalle
            this.listaDetalle[i].nVolumenDetalle= this.nVolumenDetalle
            this.listaDetalle[i].sObservacionDet= this.detalleForm.get('txtObservacionDetalle').value;


      this.detNotaSalidaTableData = new MatTableDataSource(this.listaDetalle);
      this.detNotaSalidaTableData.paginator = this.detNotaSalidaPaginator; 
      this.detNotaSalidaTableData.sort = this.detNotaSalidaSort; 

      this.fnCalcularTotales();

      //this.modalArticulo.nativeElement.click();
      this.fnIniciarFormDetalle();
      
      }
    }
    //#endregion

    //#region Confirmar Detalle Modal
    fnConfirmarLineas(){
    
      for (let i = 0; i < this.listaDetalle.length; i++) {
        let listaTemporal=[]
        let sFechaIngreso, sFechaVence;
        
        //Conversion Slash-Guion
        sFechaIngreso=this.fnConvertirFecha(this.listaDetalle[i].sFechaIngreso,3)
        sFechaVence=this.fnConvertirFecha(this.listaDetalle[i].sFechaVence,3)

        listaTemporal.push( this.listaDetalle[i].nArticulo, 
                            this.listaDetalle[i].sLote,
                            sFechaIngreso,
                            sFechaVence,
                            this.listaDetalle[i].nCantidad,
                            this.listaDetalle[i].nPrecioUnidad,
                            this.listaDetalle[i].nStockActual,
                            this.listaDetalle[i].sObservacionDet )
    
      this.listaArticulos[i]=listaTemporal.join('|');      
      }

    }
   
  //#endregion 

    //#region Eliminar Detalle
    async btnEliminarLineaDetalle(index,Obj){

      if(this.vbtnGuardar==true){

        var resp = await Swal.fire({
          title: '¿Desea continuar?',
          text: "Se eliminará el articulo seleccionado y sus lotes posteriores para mantener el orden de las fechas.",
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Aceptar',
          cancelButtonText:'Cancelar'
        })
     
        if (!resp.isConfirmed) {
          return;
        }
     

        //Traemos el index del articulo
        var arrayOfDetalle = [];
        var indexItem =  this.listaDetalle.findIndex(item=>(item.nArticulo == Obj.nArticulo) && (Obj.sLote == item.sLote) && (item.sFechaIngreso == Obj.sFechaIngreso) && (item.sFechaVence== Obj.sFechaVence))
        if(indexItem==-1){
          return;
        }

        //Buscamos los lotes posteriores del articulo
        for (var i = indexItem; i < this.listaDetalle.length; i++) {
          if (this.listaDetalle[i].nArticulo == Obj.nArticulo) {
            arrayOfDetalle.push(this.listaDetalle[i]);
          }
        }

        //Eliminamos los articulos posteriores
        for(var j=0; j<arrayOfDetalle.length;j++){
          var indexItemEliminar =  this.listaDetalle.findIndex(item=>(item.nArticulo == arrayOfDetalle[j].nArticulo) && (arrayOfDetalle[j].sLote == item.sLote) && (item.sFechaIngreso == arrayOfDetalle[j].sFechaIngreso) && (item.sFechaVence== arrayOfDetalle[j].sFechaVence))
          if(indexItemEliminar==-1){
            continue;
          }
          this.listaDetalle.splice(indexItemEliminar, 1);
        }
        this.detNotaSalidaTableData = new MatTableDataSource(this.listaDetalle);
        this.detNotaSalidaTableData.paginator = this.detNotaSalidaPaginator; 
        this.detNotaSalidaTableData.sort = this.detNotaSalidaSort;
        
        this.fnCalcularTotales();
      }
    }
    //#endregion Eliminar Detalle

  //#endregion Detalle Modal

  //#region Obtener Articulo
  fnObtenerArticulo(){
    this.nIdAlmacen = this.salidaForm.get('opcAlmacen').value;
    const pParametro = [];
    pParametro.push(this.nIdCentroCosto);
    pParametro.push(this.nIdAlmacen);
      
    const pParametroDet = [];

    this.notasLogisticaService.
    fnControlNotaSalida( 1, 2, pParametro, 8 , pParametroDet, this.url)
    .then((data: any) => {
      
      this.cboArticulo=data;

    }, error => {
      console.log(error);
    });

  }
  //#endregion Obtener Articulo

  //#region Obtener Data de Artículos
  fnObtenerDatoArticulo(nParametro){

    if(this.cboArticulo.length>0){  
      for (let i = 0; i < this.cboArticulo.length; i++) {        
        if(this.cboArticulo[i].nIdArticulo==nParametro){        
          this.sArticulo=this.cboArticulo[i].sDescripcion;         
          this.detalleForm.controls.nIdControlLote.setValue(this.cboArticulo[i].nIdControlLote);
          this.detalleForm.controls.txtTipoLote.setValue(this.cboArticulo[i].sControlLote);
          this.detalleForm.controls.txtUnidadMedida.setValue(this.cboArticulo[i].sCodUndMedida);                   
          this.sRutaImagen=this.cboArticulo[i].sRutaArchivo

        }
      }
    }

    this.detalleForm.get('txtCantidad').enable();
            
      let nIdArticulo, nIdTipoLote;
      nIdArticulo = this.detalleForm.get('txtArticulo').value;
      nIdTipoLote = this.detalleForm.get('nIdControlLote').value;
    
      const pParametro = [];
      const pParametroDet = [];

      pParametro.push(this.nIdCentroCosto);
      pParametro.push(this.nIdAlmacen);
      pParametro.push(nIdArticulo);
      pParametro.push(nIdTipoLote);
      
      this.notasLogisticaService.fnControlNotaSalida( 1, 2, pParametro, 9 , pParametroDet, this.url)
      .then((data: any) => {
      
        const stock = data;
        var vArticuloStock;
      
          if (stock.length > 0) {

            //Recogemos el stock separado del articulo en memoria
            var stockSeparado = 0;
            this.listaDetalle.forEach(item => {
              if (item.nArticulo == nIdArticulo) {
                stockSeparado += item.nCantidad;
              }
            })

            var lArticuloStock: any[] = stock;

            for (var i = 0; i < lArticuloStock.length; i++) {
              if (stockSeparado == 0) {
                //Si es el primer articulo que se va a agregar se recoge el primero
                vArticuloStock = stock[0];
                break;
              }

              stockSeparado = stockSeparado - lArticuloStock[i].nStock;

              //Si la cantidad es 0 le mostramos el siguiente articulo
              if (stockSeparado == 0) {
                //Validando que haya un siguiente articulo
                if ((i + 1) < lArticuloStock.length) {
                  vArticuloStock = lArticuloStock[i + 1];
                  break;
                } else {
                  vArticuloStock = null;
                  Swal.fire('¡Verificar!', `El articulo seleccionado no tiene saldo disponible`, 'warning')
                  .then(() => {
                    this.fnIniciarFormDetalle();                
                  });           
                  break;
                }
              } else if (stockSeparado > 0) {
                //si aun hay stock separado pasamos al siguiente lote con fecha de vencimiento
                continue;
              } else {
                //si es negativo significa que aun hay stock en el articulo
                let sMensajeFV;
                if(lArticuloStock[i].sFechaVence.length>0){sMensajeFV=' y vencimiento: '+ lArticuloStock[i].sFechaVence}
                else {sMensajeFV=''}

                Swal.fire('¡Verificar!', 
                          `El articulo seleccionado con lote ${lArticuloStock[i].sLote}${sMensajeFV}
                          , ya se encuentra registrado, favor de retirar todas las unidades, antes de sacar otro lote.`,
                          'warning').then(() => {
                            this.fnIniciarFormDetalle();
                          });           
                break;
              }

            }

            if (vArticuloStock != null) {
              this.detalleForm.controls.txtFechaIngreso.setValue(vArticuloStock.sFechaIngreso);  
              this.detalleForm.controls.txtFechaVencimiento.setValue(vArticuloStock.sFechaVence);  
              this.detalleForm.controls.txtPrecioUnidad.setValue(vArticuloStock.nPrecioUnidad);
              this.detalleForm.controls.txtStockActual.setValue(vArticuloStock.nStock);
              this.detalleForm.controls.txtLote.setValue(vArticuloStock.sLote);     
            }

          }
          else{
            Swal.fire('¡Verificar!', `El articulo seleccionado no tiene saldo disponible`, 'warning').then(() => {
              this.fnIniciarFormDetalle();
            }); 
          
          }
     
              
      }, error => {
        console.log(error);
      });
    
    
  }
//#endregion Obtener Data de Artículos
  
  //#region Calcular Totales
  fnCalcularTotales(){
    
    var nTotalUnidades=0, nTotalPeso=0, nTotalVolumen=0   
    
    if(this.listaDetalle.length>0){  
      for (let i = 0; i < this.listaDetalle.length; i++) {
        nTotalUnidades= nTotalUnidades+this.listaDetalle[i].nCantidad;
        nTotalPeso=     nTotalPeso+this.listaDetalle[i].nPesoDetalle;
        nTotalVolumen=  nTotalVolumen+parseFloat(this.listaDetalle[i].nVolumenDetalle);
      }
    }
    else{
      nTotalUnidades=0
      nTotalPeso=0
      nTotalVolumen=0
    }
    this.salidaForm.controls.txtTotalUnidades.setValue(nTotalUnidades);   
    this.salidaForm.controls.txtTotalPeso.setValue(nTotalPeso.toFixed(2));   
    this.salidaForm.controls.txtTotalVolumen.setValue(nTotalVolumen.toFixed(6));   

  }
  //#endregion Calcular Totales

  //#region  Validaciones

    //#region Validar Guardar Formulario
    fnValidarRegistro(){
      let bCondicionFecha=true;

      //recorrer las fechas bloqueadas
      //Si this.dFechaOperMov = Alguna de las fechas bloqueadas -> false
      
      if(this.disableDateList.length>0){
        for (let i = 0; i < this.disableDateList.length; i++) {  
          if(this.dFechaOperMov==this.disableDateList[i]){
            bCondicionFecha=false
            /* console.log(i)
            console.log(this.disableDateList)
            console.log(this.dFechaOperMov) */
          }
        }
      }
      if(!this.salidaForm.get('txtFechaEntrega').valid){   
        Swal.fire({
         icon: 'warning',
         title: '¡Verificar!',
         text: 'La fecha de entrega es obligatoria y debe estar dentro del tiempo establecido.' 
       });
       return false;
      }
      else if(bCondicionFecha==false){        
        Swal.fire({
         icon: 'warning',
         title: '¡Verificar!',
         text: 'La fecha de entrega está fuera de rango.' 
       });
       return false;
      }  
      else if(this.salidaForm.controls.txtDestinatario.invalid || this.salidaForm.controls.txtEntidadDestino.invalid
        || this.salidaForm.controls.txtPuntoDestino.invalid || this.salidaForm.controls.opcMovil.invalid
        || this.salidaForm.controls.opcTipoMovil.invalid){
        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: 'Los datos de ubicación de entrega son obligatorios para guardar la nota.' 
        });
        this.expUbicacion.open();
        return false;
      }
      else if(this.salidaForm.invalid){        
        Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'Existen datos obligatorios para guardar la nota.' 
      });
      return false;
      } 
      else if(this.listaDetalle.length==0){
        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: 'No se ha solicitado artículos.' 
        });
        return false;
      }
      else if(this.listaDetalle.length>26){
        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: 'Ha excedido el máximo de 26 artículos.' 
        });
        return false;
      }
    }
    //#endregion
   
    //#region Validar Abrir Modal
    fnValidarAbrirModal(){
      if(this.salidaForm.get('txtPresupuesto').hasError('required')==true){
        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: 'Elegir Presupuesto antes de agregar artículos.' 
        });
        return false;
      }
      else if(this.salidaForm.get('opcAlmacen').hasError('required')==true){
        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: 'Elegir Almacen antes de agregar artículos.' 
        });
        return false;
      }
    }
    //#endregion

    //#region Validar Modal
     fnValidarModal(){
      if(this.detalleForm.invalid){        
        Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'Existen datos obligatorios para agregar en el detalle.' 
      });
      this.spinner.hide()
      return false;
      } 
    }
    //#endregion
  
    //#region Validar Stock
    fnValidarStock(){
      let nStockActual, nCantidadDetalle
      nStockActual=this.detalleForm.get('txtStockActual').value
      nCantidadDetalle=this.detalleForm.get('txtCantidad').value
      if(nStockActual-nCantidadDetalle<0){
        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: 'Elegir Cantidad menor a Stock Actual.' 
        });
        this.spinner.hide()
        return false;
      }
    }
    //#endregion

    //#region Validacion Hora Entrega
    fnValidarHoraEntrega(){
        
      if(this.salidaForm.get('btnTodoDia').value==true){
        this.salidaForm.controls['opcHora'].setValue('T.Dia'); 
      }

      if(this.salidaForm.get('btnTodoDia').value==false  && (this.salidaForm.get('opcHora').value==''||this.salidaForm.get('opcHora').value==undefined))
      {
        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: 'Elegir Hora de Entrega.' 
        });
        return false;
      }
    }
    //#endregion
    
    //#region Validar Entidades
    fnValidarEntidades(){
      
      this.salidaForm.controls.txtPuntoDestino.setValue(''); 
      this.cboDestino=[];
      this.salidaForm.controls.txtUbicacion.setValue(''); 
      this.salidaForm.controls.txtDireccionDestino.setValue(''); 

      this.salidaForm.controls.opcMovil.setValue(''); 
      this.salidaForm.controls.opcTipoMovil.setValue(''); 
      this.salidaForm.get('opcMovil').disable();
      this.salidaForm.get('opcTipoMovil').disable();
               
    }
    //#endregion

    //#region Validar Movil Disponible
    fnValidarMovil(){
      let sUbicacionAlmacen, sUbicacionPuntoLlegada, sUbicacionDiferente, 
      sCodSucursalAlmacen, sCodSucursalDireccion, vAlmacen, vDireccion;

      //Buscamos la sucursal del almacen y direccion
      vAlmacen = this.cboAlmacen.find(item=>item.nId==this.nIdAlmacen);
      vDireccion = this.cboDestino.find(item=>item.nIdDireccion==this.nIdDireccion);
      
      sCodSucursalAlmacen=vAlmacen.sCodSucursal;
      sCodSucursalDireccion=vDireccion.sCodSucursal;

      // sUbicacionPuntoLlegada=this.sUbigeoDestino.substring(0,7);  
      // sUbicacionDiferente=this.sUbigeoDestino.substring(3,5)       
      this.fnCrearMovil()

      //Si estos coinciden no se muestra los envios courier
      if(sCodSucursalAlmacen==sCodSucursalDireccion){
        if(this.cboTipoMovil.length>0){  
          for (let j = 0; j < this.cboTipoMovil.length; j++) {        
            if(this.cboTipoMovil[j].nId==2209){
              this.cboTipoMovil.splice(j,1)
            }        
            if(this.cboTipoMovil[j].nId==2210){
              this.cboTipoMovil.splice(j,1)
            } 
          }
        }
      }

      // //Si no coinciden se muestra los envios courier
      if(sCodSucursalAlmacen!=sCodSucursalDireccion){
        //if(sUbicacionDiferente!=sUbicacionAlmacen.substring(3,5)){
          this.cboMovil.splice(0,1)
          if(this.cboTipoMovil.length>0){  
            for (let j = 0; j < this.cboTipoMovil.length; j++) {        
              if(this.cboTipoMovil[j].nId==2211){
                this.cboTipoMovil.splice(j,1)
              }        
              if(this.cboTipoMovil[j].nId==2212){
                this.cboTipoMovil.splice(j,1)
              } 
            }
          }

      }

      // if(this.cboAlmacen.length>0){  
      //   for (let i = 0; i < this.cboAlmacen.length; i++) {        
      //     if(this.cboAlmacen[i].nId==this.nIdAlmacen){
      //       sUbicacionAlmacen=this.cboAlmacen[i].sCodUbicacion.substring(0,7)
      //       if(sUbicacionAlmacen==sUbicacionPuntoLlegada){
      //         if(this.cboTipoMovil.length>0){  
      //           for (let j = 0; j < this.cboTipoMovil.length; j++) {        
      //             if(this.cboTipoMovil[j].nId==2209){
      //               this.cboTipoMovil.splice(j,1)
      //             }        
      //             if(this.cboTipoMovil[j].nId==2210){
      //               this.cboTipoMovil.splice(j,1)
      //             } 
      //           }
      //         }
      //       }
      //       if(sUbicacionPuntoLlegada!=sUbicacionAlmacen){
      //       //if(sUbicacionDiferente!=sUbicacionAlmacen.substring(3,5)){
      //         this.cboMovil.splice(0,1)
      //         if(this.cboTipoMovil.length>0){  
      //           for (let j = 0; j < this.cboTipoMovil.length; j++) {        
      //             if(this.cboTipoMovil[j].nId==2211){
      //               this.cboTipoMovil.splice(j,1)
      //             }        
      //             if(this.cboTipoMovil[j].nId==2212){
      //               this.cboTipoMovil.splice(j,1)
      //             } 
      //           }
      //         }

      //       }

      //     }        
      //   }
      // }    

       if(this.vbtnGuardar==false){          
          this.salidaForm.controls.opcMovil.setValue(this.nIdMovil);
          this.salidaForm.controls.opcTipoMovil.setValue(this.nIdTipoEnvio);
        }
    }
    //#endregion

    //#region Validar Repetición de Artículos
    fnValidarLotes(){
      let sLote;
      sLote=this.detalleForm.get('txtLote').value
      if(this.listaDetalle.length>0){  
        for (let i = 0; i < this.listaDetalle.length; i++) {        
          if(this.bEditarDetalle==true ){
            if(this.nFilaEditada!=i){
              if(sLote==this.listaDetalle[i].sLote){
                Swal.fire({
                  icon: 'warning',
                  title: '¡Verificar!',
                  text: 'No puede agregar dos artículos iguales del mismo lote.' 
                });
                return false
              }
            }                                
          }
          else if(sLote==this.listaDetalle[i].sLote){
            Swal.fire({
              icon: 'warning',
              title: '¡Verificar!',
              text: 'No puede agregar dos artículos iguales del mismo lote.' 
            });
            return false
          }        
        }
      }
    }
    //#endregion
    
    //#region Validar Taxi
    fnValidarTaxi(){
      let nVolTotal, nPesoTotal;
      var nIdTipoEnvio

      nIdTipoEnvio=this.salidaForm.get('opcTipoMovil').value
      nPesoTotal=this.salidaForm.get('txtTotalPeso').value
      nVolTotal=this.salidaForm.get('txtTotalVolumen').value
      
      let sMetrocub=String.fromCharCode(179)

      if(nIdTipoEnvio==2212){
        if(nPesoTotal>this.nTaxiPeso){
          Swal.fire({
            icon: 'warning',
            title: '¡Verificar!',
            text: 'El peso total permitido en taxi es de ' + this.nTaxiPeso + 'kg'
          });
          return false;
        }
        if(nVolTotal>this.nTaxiVolumen){
          Swal.fire({
            icon: 'warning',
            title: '¡Verificar!',
            text: 'El volumen total permitido en taxi es de ' + this.nTaxiVolumen + 'm'+sMetrocub
          });
          return false;
        }

      }
      else{
        return true;
      }

    }
    //#endregion Validar Taxi
 
    //#region Validar Saldo
    async fnValidarSaldo(){
      let nTipoMovil;
      nTipoMovil=this.nIdTipoEnvio
      
      //Validar Saldo Courier
      //2209 =Courier Aereo | 2210 = courier terrestre
      if(nTipoMovil==2209 || nTipoMovil==2210){
        return await this.fnValidarSaldoCourier();
      }
      //Validar Saldo Distribucion
      else if(nTipoMovil==2214){
        return await this.fnValidarSaldoDistribucion();
      }
      else{
        return true;
      } 

    }

    async fnValidarSaldoFinal(){
      //Para enviar y guardar, se considera peso y volumen
      let nTipoMovil;
      nTipoMovil=this.nIdTipoEnvio
      
      //Validar Saldo Courier
      //2209 =Courier Aereo | 2210 = courier terrestre
      if(nTipoMovil==2209 || nTipoMovil==2210){
        return await this.fnValidarSaldoCourier();
      }
      //Validar Saldo Distribucion
      else if(nTipoMovil==2214){
        return await this.fnValidarSaldoDistribucionPesoVolumen();
      }
      else{
        return true;
      } 

    }
    //#endregion

    //#region Validar Saldo Courier
    async fnValidarSaldoCourier(){
      //Saldo - Precio minimo por Sucursal
      let valorSaldo;   
      let bCondicion ;
     
      if(this.cboAlmacen.length>0){  
        for (let i = 0; i < this.cboAlmacen.length; i++) {        
          if(this.cboAlmacen[i].nId==this.nIdAlmacen){
            this.sUbigeoOrigen=this.cboAlmacen[i].sCodUbicacion
          }
        }
      }
      
      const pParametro = []
      pParametro.push(this.sPais)
      pParametro.push(this.sUbigeoOrigen);
      pParametro.push(this.sUbigeoDestino);
      pParametro.push(this.nIdCentroCosto)
      pParametro.push(this.nIdTipoCourier)
      pParametro.push(this.dFechaOperMov)
      const pParametroDet = [];
              
      valorSaldo = await this.notasLogisticaService.fnControlNotaSalida( 1, 2, pParametro, 15 , pParametroDet, this.url)
      this.cboValorSaldo=valorSaldo;

      this.nIdSucursalGasto = this.cboValorSaldo[0].nIdSucursalGasto
      this.nIdPartidaGasto  = this.cboValorSaldo[0].nIdPartidaGasto
      this.nPrecioEstandar  = this.cboValorSaldo[0].nPrecioEstandar
      this.sMensajeError	  = this.cboValorSaldo[0].sMensaje
      this.nIdTipoVehiculo  = 0
      this.nIdGastoCosto    = 0

      if(valorSaldo[0].nSaldo<0){
        if(this.vbtnGuardar==false){
          this.salidaForm.controls['opcTipoMovil'].setValue('');
        }
        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: this.sMensajeError
        });
        bCondicion=false;
      }
      else{
        bCondicion=true
      }
      
      return bCondicion
    
    }
    //#endregion

    //#region Validar Saldo de Distribución
    async fnValidarSaldoDistribucion(){ 
      //Saldo - Precio minimo por Sucursal
      let valorSaldo, bCondicion=true;
            
      const pParametro = []
      pParametro.push(this.sPais)       
      pParametro.push(this.nIdCentroCosto)
      pParametro.push(this.nIdDireccion)
      pParametro.push(this.dFechaOperMov)
      const pParametroDet = [];
                    
      valorSaldo = await this.notasLogisticaService.fnControlNotaSalida( 1, 2, pParametro, 18 , pParametroDet, this.url) 
      this.nIdSucursalGasto = valorSaldo[0].nIdSucursalGasto
      this.nIdPartidaGasto  = valorSaldo[0].nIdPartidaGasto
      this.nPrecioEstandar  = valorSaldo[0].nPrecioEstandar
      this.sMensajeError	  = valorSaldo[0].sMensaje
      this.nIdTipoVehiculo  = valorSaldo[0].nIdTipoVehiculo
      this.nIdGastoCosto  = valorSaldo[0].nIdGastoCosto

      if(valorSaldo[0].nSaldo<0){
        if(this.vbtnGuardar==true){
          this.salidaForm.controls['opcTipoMovil'].setValue('');
        }          

        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: this.sMensajeError
        });
        bCondicion=false;
      }
      else{
        bCondicion=true
      }
      
      return bCondicion
    
    }

    async fnValidarSaldoDistribucionPesoVolumen(){ 
      //Saldo - Precio minimo por Sucursal
      let valorSaldo, bCondicion=true;
      //this.dataSourcePartidas.data.reduce((sum, current) => sum + current.nFebrero, 0)
      const pParametro = []
      const nPeso = this.listaDetalle.reduce((sum, current) => sum + current.nPesoDetalle, 0);
      const nVolumen = this.listaDetalle.reduce((sum, current) => sum + current.nVolumenDetalle, 0);
      
      pParametro.push(this.sPais)       
      pParametro.push(this.nIdCentroCosto)
      pParametro.push(this.nIdDireccion)
      pParametro.push(this.dFechaOperMov)
      pParametro.push(nPeso)
      pParametro.push(nVolumen)

      const pParametroDet = [];

      this.spinner.show();

      valorSaldo = await this.notasLogisticaService.fnControlNotaSalida( 1, 2, pParametro, 21 , pParametroDet, this.url) 
      this.nIdSucursalGasto = valorSaldo[0].nIdSucursalGasto
      this.nIdPartidaGasto  = valorSaldo[0].nIdPartidaGasto
      this.nPrecioEstandar  = valorSaldo[0].nPrecioEstandar
      this.sMensajeError	  = valorSaldo[0].sMensaje
      this.nIdTipoVehiculo  = valorSaldo[0].nIdTipoVehiculo
      this.nIdGastoCosto    = valorSaldo[0].nIdGastoCosto
      this.spinner.hide();

      if(valorSaldo[0].nSaldo<0){
        if(this.vbtnGuardar==true){
          this.salidaForm.controls['opcTipoMovil'].setValue('');
        }          

        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: this.sMensajeError
        });
        bCondicion=false;
      }
      else{
        bCondicion=true
      }
      
      return bCondicion
    
    }
    //#endregion

    //#region Validar Fecha al Enviar
    fnValidarFechaEnvio(){      
      let dFechaEntrega, dFechaMinima, dFechaHoy;
      let bCondicionFecha=true

      dFechaEntrega= new Date(this.salidaForm.get('txtFechaEntrega').value)

      if(this.disableDateList.length>0){
        for (let i = 0; i < this.disableDateList.length; i++) {       
          if(this.dFechaOperMov==this.disableDateList[i]){
            bCondicionFecha=false
          }          
          if(i>0)
          {
            if(new Date(this.disableDateList[i-1])<new Date(this.disableDateList[i]))
            {
              dFechaMinima=new Date(this.disableDateList[i])
            }
          }
          else if(i==0){
            dFechaMinima=new Date(this.fnConvertirFecha(this.disableDateList[i],4))
          }          
        }
       
        if(dFechaEntrega<=dFechaMinima){        
          Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: 'No es coherente la Fecha de Entrega.' 
        });
        return false;
        } 
        else if(bCondicionFecha==false){        
          Swal.fire({
           icon: 'warning',
           title: '¡Verificar!',
           text: 'La fecha de entrega está fuera de rango.' 
         });
         return false;
        }  
      }      
      else if(this.disableDateList.length==0){
        dFechaMinima=this.minDate;
        dFechaHoy=new Date(this.fnConvertirFecha(this.sFechaHoy,4))
        
        if(dFechaEntrega<dFechaMinima && this.dFechaOperMov!=this.sFechaHoy ){                 
            Swal.fire({
            icon: 'warning',
            title: '¡Verificar!',
            text: 'No es coherente la Fecha de Entrega.' 
          });
          return false;
        } 
      }    
  
  }
  //#endregion

    //#region Validar Decimales a Enteros
    fnRedondear(formControlName: string, form: FormGroup) { 
      var valor: number = form.get(formControlName).value;
      if (valor == null) return;
      form.get(formControlName).setValue(Math.round(valor));   
    }
    //#endregion

  //#endregion Validaciones

  //#region Fechas

      //#region Obtener Fecha Actual
      async fnObtenerFechaActual(){
        let sDatoFecha;    
        var sCadenaHora, sSegundos
      
        const pParametro = [];
        pParametro.push(this.sPais);           
              
        const pParametroDet = [];

        sDatoFecha = await this.notasLogisticaService.fnControlNotaSalida( 1, 2, pParametro, 12 , pParametroDet, this.url)
        this.dFechaActual = sDatoFecha.datos; 
        
        //Obtener Hora Actual
        sCadenaHora=this.dFechaActual.split(':', 3);
        this.sHora=sCadenaHora[0].substr(-2,2)
        this.sMinutos=sCadenaHora[1]
        sSegundos=sCadenaHora[2]

        //Validar Fechas
        await this.fnValidarFechaActual();    
             
        
      }
      //#endregion Obtener Fecha Actual

      //#region Comparar Horas
      fnCompararHoras(paramHora, paramMinuto){    
          
      //True:  Si la hora actual es menor  
      //False: Si la hora actual es mayor
        if(this.sHora<paramHora){          
            return true     
        }
        else if(this.sHora=paramHora){
          if(this.sMinutos<paramMinuto){
            return true
          }
          else{
            return false
          }
        }
        else{
          return false
        }
      }
      //#endregion Comparar Horas

      //#region Convertir Fechas

        //#region Cambiar Fecha Entrega
        async fnCambiarFechaEntrega(event){    
            
          let sDia, sMes, sAnio, sFecha
          if(event.value.getDate()<10){
            sDia="0"+event.value.getDate()  
          }else{
          sDia=event.value.getDate()
          }
          if((event.value.getMonth()+1)<10){
            sMes="0"+(event.value.getMonth()+1)
          }
          else{
            sMes=event.value.getMonth()+1
          }
          sAnio=event.value.getFullYear()    
          this.dFechaOperMov=sAnio+'-'+sMes+'-'+sDia
          
          
          if(this.salidaForm.get('txtPresupuesto').value!=''){                       
            this.eventFechaPresupuestos(this.salidaForm.get('txtPresupuesto').value)
          }

        }
        //#endregion Cambiar Fecha Entrega

        //#region Conversión de Fechas
        fnConvertirFecha(FechaParametro,nTipo){

          let sDia, sMes, sAnio, sFecha
          var sCadena

          //#region 1: Datetime a String(YYYY-mm-dd)
          if(nTipo==1){
          
            if (FechaParametro!=''){
              
            sCadena = FechaParametro.split('-', 3);
            
            sDia=sCadena[2].substring(0,2)
            sMes=sCadena[1]
            sAnio=sCadena[0]
            
            sFecha=sAnio+'-'+sMes+'-'+sDia
            
            return sFecha
            }
            else{
              return ''
            }  
          }
          //#endregion
          
          //#region 2: String (YYYY-mm-dd) a String(dd/mm/YYYY)
          if(nTipo==2){
          
            if (FechaParametro!=''){
            
            sCadena = FechaParametro.split('-', 3);
            
            sDia=sCadena[2].substring(0,2)
            sMes=sCadena[1]
            sAnio=sCadena[0]
    
            sFecha=sDia+'/'+sMes+'/'+sAnio
            
            return sFecha
            }
            else{
              return ''
            }  
          }
          //#endregion

          //#region 3: String (dd/mm/YYYY) a String(YYYY-mm-dd)
          else if(nTipo==3){

            if (FechaParametro!=''){
                  
              sCadena = FechaParametro.split('/', 3);
              
              sDia=sCadena[0]
              sMes=sCadena[1]
              sAnio=sCadena[2]
              
              sFecha=sAnio+'-'+sMes+'-'+sDia
              
              return sFecha
              }
              else{
                return ''
              }
            }
          //#endregion 
        
          //#region 4: String (YYYY-mm-dd) a String(mm/dd/YYYY)
          if(nTipo==4){
          
            if (FechaParametro!=''){
            
            sCadena = FechaParametro.split('-', 3);
            
            sDia=sCadena[2].substring(0,2)
            sMes=sCadena[1]
            sAnio=sCadena[0]
            
            sFecha=sMes+'/'+sDia+'/'+sAnio
            
            return sFecha
            }
            else{
              return ''
            }  
          }
          //#endregion
        }
        //#endregion
        
        //#region de String(yyyy-mm-dd) a Date
        fnFechaStringToDate(Parametro){
          return new Date(Parametro)
        }
        //#endregion

      //#endregion
    
      //#region Validar Fecha Actual
      async fnValidarFechaActual(){
        let sDia, sMes, sAnio, sMesSig, sFechaCreado,dFechaEntrega;    
        var sCadenaFecha
        let dDateNow
        
          dDateNow= new Date(this.dFechaActual) 
            
          sCadenaFecha = this.dFechaActual.split('-', 3);
          
          sDia=parseInt(sCadenaFecha[2].substring(0,2))        
          sMes=sCadenaFecha[1]
          sAnio=sCadenaFecha[0]
                  
          this.sFechaHoy=sAnio+'-'+sMes+'-'+sDia
          this.sFechaManiana=sAnio+'-'+sMes+'-'+(sDia+1)
          this.sFechaPasado=sAnio+'-'+sMes+'-'+(sDia+2)
          this.sFechaTraspasado=sAnio+'-'+sMes+'-'+(sDia+3)

          if(sDia<10){this.sFechaHoy=sAnio+'-'+sMes+'-0'+sDia }
          if(sDia+1<10){this.sFechaManiana=sAnio+'-'+sMes+'-0'+(sDia+1)    }
          if(sDia+2<10){this.sFechaPasado=sAnio+'-'+sMes+'-0'+(sDia+2)     }
          if(sDia+3<10){this.sFechaTraspasado=sAnio+'-'+sMes+'-0'+(sDia+3) }
                    
          //Meses con 31 dias
          if(sMes=='01'||sMes=='03'||sMes=='05'||sMes=='07'||sMes=='08'||sMes=='10'||sMes=='12'){
            sMesSig=parseInt(sMes)+1
            if(sMesSig<10){sMesSig='0'+sMesSig.toString()}
            if(sDia==29){                          
              this.sFechaTraspasado=sAnio+'-'+sMesSig+'-01'
            }
            if(sDia==30){              
              this.sFechaPasado=sAnio+'-'+sMesSig+'-01'   
              this.sFechaTraspasado=sAnio+'-'+sMesSig+'-02'
            }
            if(sDia==31){              
              this.sFechaManiana=sAnio+'-'+sMesSig+'-01'  
              this.sFechaPasado=sAnio+'-'+sMesSig+'-02'   
              this.sFechaTraspasado=sAnio+'-'+sMesSig+'-03'
            }
          }

          //Meses con 30 dias
          if(sMes=='04'||sMes=='06'||sMes=='09'||sMes=='11'){
            sMesSig=parseInt(sMes)+1
            if(sMesSig<10){sMesSig='0'+sMesSig.toString()}
            if(sDia==28){                          
              this.sFechaTraspasado=sAnio+'-'+sMesSig+'-01'
            }
            if(sDia==29){              
              this.sFechaPasado=sAnio+'-'+sMesSig+'-01'   
              this.sFechaTraspasado=sAnio+'-'+sMesSig+'-02'
            }
            if(sDia==30){              
              this.sFechaManiana=sAnio+'-'+sMesSig+'-01'  
              this.sFechaPasado=sAnio+'-'+sMesSig+'-02'   
              this.sFechaTraspasado=sAnio+'-'+sMesSig+'-03'
            }
          }

          //Febrero
          if(sMes =='02'){
            if(sAnio%4==0){
              if(sDia==28){
                this.sFechaPasado=sAnio+'-03-01'
                this.sFechaTraspasado=sAnio+'-03-02'
              }
              else if(sDia==29){
                this.sFechaManiana=sAnio+'-03-01'
                this.sFechaPasado=sAnio+'-03-02'
                this.sFechaTraspasado=sAnio+'-03-03'
              }
            }
            else{
              if(sDia==27){
                this.sFechaPasado=sAnio+'-03-01'
                this.sFechaTraspasado=sAnio+'-03-02'
              }
              else if(sDia==28){
                this.sFechaManiana=sAnio+'-03-01'
                this.sFechaPasado=sAnio+'-03-02'
                this.sFechaTraspasado=sAnio+'-03-03'
              }
            }            
          }
         
          if(this.dFechaOperMov==undefined){                              
            this.salidaForm.controls.txtFechaEntrega.setValue(this.sFechaPasado); 
            this.dFechaOperMov=(this.sFechaManiana)
            if(dDateNow.getDay()==6 || dDateNow.getDay()==0){            
              this.salidaForm.controls.txtFechaEntrega.setValue(this.sFechaTraspasado);
            
            }

            sFechaCreado=this.fnConvertirFecha(this.sFechaHoy,2)
            this.salidaForm.controls.txtFechaCreado.setValue(sFechaCreado)
          }
          
        await this.fnValidarFechas();

      }
      //#endregion Validar Fecha Actual

      //#region Validar Fecha por Parametros
      async fnValidarFechas(){
        let sCadenaBloqueoDia,sCadenaHora;
        let dDateNow, dTiempoTermino;        
        dDateNow= new Date(this.dFechaActual)      
        const pParametro = [];
        pParametro.push(this.sPais);           
              
        const pParametroDet = [];

        // fnControlNotaSalida( 1, 2, pParametro, 13 , pParametroDet, this.url) Refrescar parametros fuer de contador

        //evaluamos si ya estamos contando
        this.valorParamFecha = await this.notasLogisticaService.fnControlNotaSalida( 1, 2, pParametro, 13 , pParametroDet, this.url)
        
        this.cboParamFecha=this.valorParamFecha
              
        this.disableDateList=[]
        this.bNotaMismoDia=this.cboParamFecha[0].bNotaMismoDia
        this.bCierreAutomatico=this.cboParamFecha[0].bCierreAutomatico

          //#region Caso 1 Cuando se puede el mismo dia excepto sabados y domingos
          if(this.cboParamFecha[0].bNotaMismoDia==false && dDateNow.getDay()!=0  && dDateNow.getDay()!=6){
            this.disableDateList.push(this.sFechaHoy);                
          }
          else{                 
            this.fnPresupuestosPermitidos();
            this.fnAlmacenesPermitidos();
            for (let i = 0; i < this.disableDateList.length; i++) {        
              if(this.disableDateList[i]==this.sFechaHoy){        
                this.disableDateList.splice(i,1)
              }
            }
          }
          //#endregion   
                        
          //#region Caso 2 --Cuando hay hora de bloqueo en dia de semana        
          if(dDateNow.getDay()<6 && dDateNow.getDay()!=0){
            if(this.cboParamFecha[0].bHoraBloqueoDia==true){
              sCadenaBloqueoDia=this.cboParamFecha[0].sHoraTopeDia.split(':', 2)
              if(this.fnCompararHoras(sCadenaBloqueoDia[0],sCadenaBloqueoDia[1])==false){                
                this.disableDateList.push(this.sFechaHoy,this.sFechaManiana)
                if(this.dFechaOperMov==this.sFechaManiana){                  
                  if(this.bEstadoNuevo){
                    this.salidaForm.controls.txtFechaEntrega.setValue(this.sFechaTraspasado);
                    this.dFechaOperMov=this.sFechaPasado;
                  }   
                }
              }                        
            }
            else{
              for (let i = 0; i < this.disableDateList.length; i++) {        
                if(this.disableDateList[i]==this.sFechaHoy){        
                  this.disableDateList.splice(i,1)
                }
                if(this.disableDateList[i]==this.sFechaManiana){        
                  this.disableDateList.splice(i,1)
                }
              }
            }         
          }
          //#endregion
        
          //#region Caso 3 --Cuando no se puede Sabado
          if(this.cboParamFecha[0].bNotaSabado==false){    
            this.nDiaSabado=6;
            //Obtener la fecha -> Jueves o Viernes 
            //Cuando es viernes -> Pasar a domingo 
           /*  if(dDateNow.getDay()==5){
              if(this.bEstadoNuevo){
                this.salidaForm.controls.txtFechaEntrega.setValue(this.sFechaTraspasado);
                this.dFechaOperMov=this.sFechaPasado;
              }  
            } */
          }
          else{
            this.nDiaSabado=null;
          }
          //#endregion
          
          //#region Caso 4 -- Cuando es Sábado
          if(dDateNow.getDay()==6){          
            if(this.cboParamFecha[0].bHoraBloqueoSabado==true){
              sCadenaBloqueoDia=this.cboParamFecha[0].sHoraTopeSabado.split(':', 2)
              if(this.fnCompararHoras(sCadenaBloqueoDia[0],sCadenaBloqueoDia[1])==false){   
                this.disableDateList.push(this.sFechaHoy)
                this.nDiaSabado=6;                   
              }else{
                this.nDiaSabado=null;
              }
            }
          }
          //#endregion
          
          //#region Caso 5 -- Cuando no se puede Domingo
          if(this.cboParamFecha[0].bNotaDomingo==false){
            this.nDiaDomingo=0;
          }
          else{
            this.nDiaDomingo=null;
          }
          //#endregion
          
          //#region Caso 6 -- Cuando es Domingo
          if(dDateNow.getDay()==0){   
            if(this.cboParamFecha[0].bHoraBloqueoDomingo==true){
              sCadenaBloqueoDia=this.cboParamFecha[0].sHoraTopeDomingo.split(':', 2)
              if(this.fnCompararHoras(sCadenaBloqueoDia[0],sCadenaBloqueoDia[1])==false){   
                this.disableDateList.push(this.sFechaHoy)  
                this.nDiaDomingo=0;                 
              }else{
                this.nDiaDomingo=null;
              }
            }         
              //this.disableDateList.push(this.sFechaHoy,this.sFechaManiana)
          }
          //#endregion
          
          //#region Caso 7 -- Cuando dan minutos para cierre
          if(this.cboParamFecha[0].bCierreAutomatico==true){ 
                       
            var sHoraCierre = this.cboParamFecha[0].dInicioCierreAuto.substring(11);
            sCadenaHora=sHoraCierre.split(':', 2)     

            //Si ya pase por aca me aguanto hasta que acabe mi tiempo actual, si estoy vacio lo vuelvo a cargar
            var sHora=parseInt(sCadenaHora[0]);            
            var sMinutos= parseInt(sCadenaHora[1])+parseInt(this.cboParamFecha[0].nCierreAutoTiempo)
            
            if(sMinutos>60) {sHora=sHora+1; sMinutos=sMinutos-60}
            
            if(this.fnCompararHoras(sHora,sMinutos)==true){
              this.fnPresupuestosPermitidos();
              this.fnAlmacenesPermitidos();
              dTiempoTermino= new Date(
                dDateNow.getFullYear(),dDateNow.getMonth(),dDateNow.getDate(),     //Fecha Hoy 
                sHora,sMinutos,0)   //Hora Cierre
                            
              await this.fnTiempoCierre(dDateNow,dTiempoTermino);
              for (let i = 0; i < this.disableDateList.length; i++) {        
                if(this.disableDateList[i]==this.sFechaHoy){                                     
                  this.disableDateList=[]
                }
              }
              if(this.bNotaMismoDia==false){
                this.disableDateList.push(this.sFechaHoy);                
              }
            }
            //Si al comparar los tiempos está fuera de rango
            else{        
              this.bCountdown=false;
              this.fnCambiarCierreAutomatico();
            }
          }
          //Si lo cierran 
          else{
            this.bCountdown=false;
            this.fnCambiarCierreAutomatico();
          }
          
          //#endregion
        
          //Cuando es la primera vez movemos la fecha hasta el dia que esta disponible
          var fechaTras =  new Date(this.salidaForm.get('txtFechaEntrega').value);

          if(this.bCreaPrimera){
            if(fechaTras.getDay()==6 && this.nDiaSabado==6){
              fechaTras.setDate(fechaTras.getDate() + 1);
              this.salidaForm.get('txtFechaEntrega').setValue(fechaTras)

            }
            if(fechaTras.getDay()==0 && this.nDiaDomingo==0){
              fechaTras.setDate(fechaTras.getDate() + 1);
              this.salidaForm.get('txtFechaEntrega').setValue(fechaTras)
            }
            this.bCreaPrimera = false;
            this.fnCambiarFechaEntrega({value:fechaTras});
          }

        this.dFechaAnterior=this.dFechaOperMov
      }
      //#endregion Validar Fecha por Parametros

      //#region Filtrar Fechas
      filtroFecha = (d: Date): boolean => {

        let sDia: any;
        let sMes: any;

        if (d.getDate().toString().length < 2) {
          sDia = '0' + d.getDate().toString()
        } else {
          sDia = d.getDate().toString()
        }

        if ((d.getMonth() + 1).toString().length < 2) {
          sMes = '0' + (d.getMonth() + 1).toString()
        } else {
          sMes = (d.getMonth() + 1).toString()
        }
        const sDiaFinSem=d.getDay();
        const day = d.getFullYear().toString() + "-" + sMes + "-" + sDia;

        return !this.disableDateList.includes(day) && sDiaFinSem!==this.nDiaSabado && sDiaFinSem!==this.nDiaDomingo;
      }
      //#endregion Filtrar Fechas

    //#endregion Fechas

  //#region Guardar Formulario
  async fnGuardarFormulario(){
    let dFechaOperMov, bTodoDia, sHora, nIdDestinatario, nIdPuntoLlegada,
    nIdDestino, nIdTipoEnvio, sObservacionNota, nIdUsrRegNota;
    let sTextoContinuar, sTextoGuardado;
    let bPermitidos=true;

    this.bEstadoNuevo=false;

    sTextoContinuar='¿Desea guardar el documento?'
    sTextoGuardado='Se guardó correctamente.'
    
    this.spinner.show();

    //Obtiene la fecha actual y los parametros      
    await this.fnObtenerFechaActual();

    this.spinner.hide();
    
    //Validamos que sabado y domingo no se encuentre bloqueado
    if(this.fnValidarDomingo()){
      Swal.fire('¡Verificar!', `El día domingo se encuentra bloqueado.`, 'warning')     
      return false;
    }

    if(this.fnValidarSabado()){
      Swal.fire('¡Verificar!', `El día sábado se encuentra bloqueado.`, 'warning')     
      return false;
    }
  
    //Validar si el presupuesto esta activo
    var validar = await this.fnValidarPresupuestoActivo()
    if(!validar){
      return;
    }

    if(await this.fnEvaluarPresPermitidos()==false ){      
      bPermitidos=false
      Swal.fire('¡Verificar!', `El presupuesto seleccionado no está disponible.`, 'warning')     
      return false;
    }
    if(await this.fnEvaluarAlmacenesPermitidos()==false){
      bPermitidos=false
      Swal.fire('¡Verificar!', `El almacen seleccionado no está disponible.`, 'warning')
      return false;
    }
   
    if(this.fnValidarRegistro()!=false && this.fnValidarHoraEntrega()!=false && this.fnValidarTaxi()!=false &&
      await this.fnValidarSaldoFinal()!=false && bPermitidos==true ){

      nIdTipoEnvio=this.salidaForm.get('opcTipoMovil').value

      var resp = await Swal.fire({       
        title: sTextoContinuar,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText:'Cancelar'
      })

      if (!resp.isConfirmed) {        
        return;
      }

          dFechaOperMov=this.dFechaOperMov 
          
          bTodoDia=this.salidaForm.get('btnTodoDia').value
          sHora=this.salidaForm.get('opcHora').value

          nIdDestinatario=this.salidaForm.get('txtDestinatario').value
          nIdPuntoLlegada=this.salidaForm.get('txtEntidadDestino').value
          nIdDestino=this.salidaForm.get('txtPuntoDestino').value

          sObservacionNota=this.salidaForm.get('txtObservacion').value
          nIdUsrRegNota=this.nIdUsuario
     

      this.fnConfirmarLineas();

      const pParametro = [];

      pParametro.push(this.sPais,this.nIdUsuario);
      pParametro.push(this.nIdCentroCosto,this.nIdAlmacen);
      pParametro.push(dFechaOperMov,bTodoDia,sHora);
      pParametro.push(nIdDestinatario,nIdPuntoLlegada,nIdDestino);
      pParametro.push(nIdTipoEnvio,sObservacionNota,nIdUsrRegNota);
      if(this.pOpcion==3){
        pParametro.push(this.nIdOperMov)
      }
         
      //Transporte
      if(this.nIdTipoEnvio==2209||this.nIdTipoEnvio==2210 ||this.nIdTipoEnvio==2214){
        pParametro.push(this.nIdSucursalGasto)
        pParametro.push(this.nIdPartidaGasto) 
        pParametro.push(this.nPrecioEstandar) 
        pParametro.push(this.sMensajeError)	 
        pParametro.push(this.nIdTipoVehiculo) 
        pParametro.push(this.nIdGastoCosto)	 
      }
      
      

      var pParametroDet = [];
      pParametroDet=this.listaArticulos;

      this.notasLogisticaService.
      fnControlNotaSalida( 1, this.pOpcion, pParametro, 1 , pParametroDet, this.url)
      .then(res => {
        
        if(res[0]>0) {
        Swal.fire({
          icon: 'success',
          title: sTextoGuardado,
          timer:3000
        });
        this.nIdOperMov = res[0];
        this.vbtnCancelar = false;
        this.vbtnDuplicar = false;

        this.fnCargarCabecera();
          if(this.pOpcion == 1){
            this.pOpcion = 3;
          }
        }

        else if(res[0]!=''){
          Swal.fire({
            icon: 'warning',
            title: res[0]
          });
          return false          
        }

        else if(res[0]==''){
          Swal.fire({
            icon: 'warning',
            title: 'No se pudo Guardar'
          });   
          return false       
        }


              
      }, error => {
        console.log(error);
      });
    }
    

  }
  //#endregion Guardar Formulario
  
  fnValidarSabado(){
    var dFechaEntrega= new Date(this.salidaForm.get('txtFechaEntrega').value)
    if(dFechaEntrega.getDay()==6 && this.nDiaSabado!=null){
      return true;
    }
    return false;
  }

  fnValidarDomingo(){
    var dFechaEntrega= new Date(this.salidaForm.get('txtFechaEntrega').value)
    if(dFechaEntrega.getDay()==0 && this.nDiaDomingo!=null){
      return true;
    }
    return false;
  }

  //#region Modificar
  fnActivarModificar(){
    this.vbtnModificar=false;  
    this.vbtnEnviar=false;
    this.vbtnGuardar=true;
    this.vbtnCancelar=true;
    this.fnHabilitarControles();
  }
  //#endregion Modificar

  //#region Cargar Cabecera y Detalle
  fnCargarCabecera(){
    this.vbtnGuardar   = false; 
    this.vbtnModificar = true;
    this.vbtnEnviar    = true;
   
    const pParametro = [];
    pParametro.push(this.nIdOperMov);           
          
    const pParametroDet = [];

    this.spinner.show()
    this.notasLogisticaService.fnControlNotaSalida( 1, 2, pParametro, 10 , pParametroDet, this.url)
    .then((data: any) => {
      
      this.nEstadoNota=data[0].nEstadoNota;
      //Sin Enviar
      if(this.nEstadoNota!= 2225)
      {
        this.vbtnDuplicar = true;
      }
      //2226 =>	Enviado //2227 =>	Cargar Peso Costo // 2228 =>	Cargado Logística //2229 =>	Recibido Logística //2267 =>Rechazado 
      if(this.nEstadoNota == 2226 || this.nEstadoNota == 2227 || this.nEstadoNota == 2228 || this.nEstadoNota ==  2229 || this.nEstadoNota == 2267) 
      {
        this.vbtnModificar = false;
        this.vbtnEnviar    = false;
        this.vbtnCancelar  = false;
      }
      else if(this.nEstadoNota == 2230) // 2230 Devuelto Logistica
      {
        this.vbtnModificar = true;
        this.vbtnEnviar    = false;
        this.vbtnCancelar  = false;
      }

      this.nIdCentroCosto=data[0].nIdCentroCosto
      this.nIdAlmacen=data[0].nIdAlmacen
      this.vCentroCosto = {
        nId:data[0].nIdCentroCosto,
        sDescripcion: data[0].sCentroCosto,
      }
      this.salidaForm.controls.txtSolicitante.setValue(data[0].sSolicitante);      
      this.salidaForm.controls.txtFechaEntrega.setValue(data[0].dFechaOperMov);      
      this.dFechaOperMov=this.fnConvertirFecha(data[0].dFechaOperMov,1)
      this.salidaForm.controls.btnTodoDia.setValue(data[0].bTodoDia);  
      this.salidaForm.controls.opcHora.setValue(data[0].sHora);  
      this.nIdDestinatario=data[0].nIdDestinatario
      this.nIdPuntoLlegada=data[0].nIdPuntoLlegada
      this.nIdDireccion=data[0].nIdDireccion
      
      this.fnObtenerPresupuestos();
      this.fnObtenerEntidad();

      this.salidaForm.controls.opcMovil.setValue(data[0].nIdMovil);
      this.nIdMovil=data[0].nIdMovil;
      this.nIdTipoEnvio=data[0].nIdTipoEnvio;
      
      //this.fnObtenerMovilidad();
   
      this.salidaForm.controls.txtObservacion.setValue(data[0].sObservacionNota);
      this.salidaForm.controls.txtDocumento.setValue(data[0].sDocumento);        
      this.salidaForm.controls.txtCreado.setValue(data[0].sNombreCreador);  
      this.salidaForm.controls.txtFechaCreado.setValue(data[0].sFechaCreado);
      this.salidaForm.controls.txtEstado.setValue(data[0].sEstadoNota);  
      this.salidaForm.controls.txtGuiaSalida.setValue(data[0].sGuiaSalida);  
      
      this.fnDeshabilitarControles();

      this.fnCargarLineas();
      
      this.spinner.hide()
    }, error => {
      console.log(error);
      this.spinner.hide()
    });

  }


  fnCargarLineas(){
    
    const pParametro = [];
    pParametro.push(this.nIdOperMov);           
          
    const pParametroDet = [];

    this.notasLogisticaService.
    fnControlNotaSalida( 1, 2, pParametro, 11 , pParametroDet, this.url)
    .then((data: any) => {
          
      this.listaDetalle=data;
      
      this.detNotaSalidaTableData = new MatTableDataSource(this.listaDetalle);
      this.detNotaSalidaTableData.paginator = this.detNotaSalidaPaginator; 

      this.fnCalcularTotales();     
            
    }, error => {
      console.log(error);
    });
   

  }
  //#endregion Cargar Cabecera y Detalle
 
  //#region Controles
  fnDeshabilitarControles(){
    this.salidaForm.get('txtPresupuesto').disable();
    this.salidaForm.get('opcAlmacen').disable();

    this.salidaForm.get('txtFechaEntrega').disable();
    this.salidaForm.get('btnTodoDia').disable();
    this.salidaForm.get('opcHora').disable();
    this.salidaForm.get('txtDestinatario').disable();
    this.salidaForm.get('txtEntidadDestino').disable();
    this.salidaForm.get('txtPuntoDestino').disable();
    this.salidaForm.get('opcMovil').disable();
    this.salidaForm.get('opcTipoMovil').disable();
    this.salidaForm.get('txtObservacion').disable();
  }


  fnHabilitarControles(){
    
    this.salidaForm.get('txtFechaEntrega').enable();
    if(this.salidaForm.get('btnTodoDia').value==true){      
      this.salidaForm.get('btnTodoDia').enable();
    }    
    else{
      this.salidaForm.get('opcHora').enable();
    }    
    this.salidaForm.get('txtDestinatario').enable();
    this.salidaForm.get('txtEntidadDestino').enable();
    this.salidaForm.get('txtPuntoDestino').enable();
    this.salidaForm.get('opcMovil').enable();
    this.salidaForm.get('opcTipoMovil').enable();
    this.salidaForm.get('txtObservacion').enable();
  }
  //#endregion Controles

  //#region Cancelar
  async fnCancelar(){
    var resp = await Swal.fire({
      title: '¿Desea cancelar?',
      text: "Se perderán los datos que modificó.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText:'Cancelar'
    })

    if (!resp.isConfirmed) {
      return;
    }

    this.vbtnCancelar=false;
    this.fnCargarCabecera();
  }
  //#endregion Cancelar

  //#region Enviar
  async fnEnviar(){
    let bPermitidos=true;

    this.bEstadoNuevo=false;
    this.spinner.show();

    //Obtiene la fecha actual y los parametros      
    await this.fnObtenerFechaActual();

    this.spinner.hide();
    
    //Validamos que sabado y domingo no se encuentre bloqueado
    if(this.fnValidarDomingo()){
      Swal.fire('¡Verificar!', `El día domingo se encuentra bloqueado.`, 'warning')     
      return false;
    }

    if(this.fnValidarSabado()){
      Swal.fire('¡Verificar!', `El día sábado se encuentra bloqueado.`, 'warning')     
      return false;
    }

    //Validar si el presupuesto esta activo
    var validar = await this.fnValidarPresupuestoActivo()
    if(!validar){
      return;
    }

    if(await this.fnEvaluarPresPermitidos()==false){      
      bPermitidos=false
      Swal.fire('¡Verificar!', `El presupuesto seleccionado no está disponible.`, 'warning')     
      return false;
    }
    if(await this.fnEvaluarAlmacenesPermitidos()==false){
      bPermitidos=false
      Swal.fire('¡Verificar!', `El almacen seleccionado no está disponible.`, 'warning')
      return false;
    }

    if(this.fnValidarFechaEnvio()!=false && await this.fnValidarSaldoFinal()!=false  && bPermitidos==true ){

      let nTipoEnvio = this.salidaForm.controls.opcTipoMovil.value
      let sTipoEnvio = '¿Desea enviar la nota a Logística?';

      var resp = await Swal.fire({        
        title: sTipoEnvio,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText:'Cancelar'
      })

      if (!resp.isConfirmed) {
        return;
      }

      const pParametro = [];
      const pParametroDet = [];

      pParametro.push(this.nIdOperMov); 
      pParametro.push(this.nIdUsuario);
      pParametro.push(this.sPais);
      pParametro.push(this.nIdGastoCosto);
      pParametro.push(this.nPrecioEstandar);
      pParametro.push(this.nIdTipoVehiculo); 
      pParametro.push(this.sNombreEmpresa); 
    
      this.notasLogisticaService.fnControlNotaSalida( 1, 3, pParametro, 2 , pParametroDet, this.url)
      .then(res=> {
        
        if(res[0]==0){
          Swal.fire({
            icon: 'warning',
            title: 'No se pudo enviar.'
          }); 
          return false;         
        }

        else {
          Swal.fire({
            icon: 'success',            
            title: 'Se envió correctamente.',
            timer:3000
          }
          ).then( () => {
            this.fnCrearNotaRecojo();
          });
      
        }
        
        this.nIdOperMov=res[0];
        this.fnCargarCabecera();
        
              
      }, error => {
        console.log(error);
      });
    }
  }
  //#endregion Enviar
  
  //#region Cierre Automático
  async fnTiempoCierre(dTiempoInicio, dTiempoTermino){

    if(this.timerId!=null){
      clearInterval(this.timerId);     
      clearTimeout(this.timerId);  
    }

    this.timerId=countdown( dTiempoTermino,
      (ts)=>{
        ts.start=dTiempoInicio
       
        this.time=ts;  

        if(ts.value<0){
          this.bCountdown=true;   
        }
        
        //if(ts.minutes==0 && ts.seconds==0){      
         if(ts.value>0){
        
          this.bCountdown=false;
        
          //setTimeout(this.fnCambiarCierreAutomatico,2000);
          
          this.fnCambiarCierreAutomatico();

        }
      },countdown.MINUTES |
        countdown.SECONDS
    )
    
  }

  async fnCambiarCierreAutomatico(){

    if(this.timerId!=null){

      await this.fnValidarFechaActual();

      if(this.bCountdown==false){
        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: 'Terminó el tiempo de cierre automático.' 
        });            
      }     
    }    
    
    if(this.bCountdown==false){
      //Detiene Tiempos      
      clearInterval(this.timerId);     
      clearTimeout(this.timerId);      
      //Limpia Tiempos
      this.timerId=null;   
      this.time=null 

      const pParametro = [];    
      pParametro.push(this.sPais);
      const pParametroDet = [];
          
      await this.notasLogisticaService.fnControlNotaRecojo( 1, 3, pParametro, 3 , pParametroDet, this.url)
      
      this.bCountdown=false;  
      
    }
  
  }

  ngOnDestroy(){    
    if(this.timerId){
      clearInterval(this.timerId);
    }
  }
  //#endregion

  //#region Obtener Peso y Volumen
  async fnObtenerPesoVol(){
    let nCantidad, nIdArticulo
    nCantidad=this.detalleForm.get('txtCantidad').value
    nIdArticulo=this.detalleForm.get('txtArticulo').value

    const pParametro = [];
    pParametro.push(nIdArticulo);
    pParametro.push(nCantidad);

    const pParametroDet = [];

    this.valorPesoVol = await this.notasLogisticaService.fnControlNotaSalida( 1, 2, pParametro, 14 , pParametroDet, this.url)
    this.cboPesoVol = this.valorPesoVol; 
    
    this.nPesoDetalle=this.cboPesoVol[0].nPesoDetalle
    this.nVolumenDetalle=this.cboPesoVol[0].nVolumenDetalle
    
  }
  //#endregion Obtener Peso y Volumen

  //#region Abrir visor de historial
  fnAbrirVisorHistorialNota(): void  {
    const dialogRef = this.dialog.open(NotaHistorialComponent, {
      width: '80%',
      data: {
        'idNota': this.nIdNotaSalida
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
           
    })
  }
  //#endregion Abrir visor de historial

  //#region Obtener Presupuestos Permitidos por Parametros
  async fnPresupuestosPermitidos(){
    let comboPresupuestoPerm;
    const pParametro = [];    
    pParametro.push(this.nIdEmpresa);
    const pParametroDet = [];
        
    comboPresupuestoPerm = await this.notasLogisticaService.fnControlNotaSalida( 1, 2, pParametro, 16 , pParametroDet, this.url)
    this.cboPresupestoPermitidos=comboPresupuestoPerm;
  
  }
  //#endregion Obtener Presupuestos
  
  //#region Obtener Almacenes Permitidos por Parametros
  async fnAlmacenesPermitidos(){
    
    let comboAlmacenPerm;

    const pParametro = [];
    pParametro.push(this.nIdEmpresa);        
    
    const pParametroDet = [];

    comboAlmacenPerm = await this.notasLogisticaService.fnControlNotaSalida( 1, 2, pParametro, 17 , pParametroDet, this.url)
    this.cboAlmacenPermitidos=comboAlmacenPerm;
 
  }
  //#endregion Obtener Almacen

  //#region Evaluar Presupuestos Permitidos
  async fnEvaluarPresPermitidos(){
    let bCondicion=false, nIdCentroCosto;    
    let bCondicionFecha=false;

    if( (this.bNotaMismoDia==true && this.dFechaOperMov==this.sFechaHoy)  ||
        (this.bCierreAutomatico==true && this.dFechaOperMov==this.sFechaManiana) )
    {
      bCondicionFecha=true
    }

    nIdCentroCosto=this.salidaForm.get('txtPresupuesto').value;

    if(bCondicionFecha){          
      //Comparar el Presupuesto Actual con los permitidos    
      if(this.cboPresupestoPermitidos.length>0){
        for (let i = 0; i < this.cboPresupestoPermitidos.length; i++) {  

          if(this.cboPresupestoPermitidos[i].nIdCentroCosto!=nIdCentroCosto && bCondicion==false){ 
            bCondicion=false
          }
          if(this.cboPresupestoPermitidos[i].nIdCentroCosto==nIdCentroCosto){ 
            bCondicion=true
          }

        }
      }
      else{
        bCondicion=true
      }
    }
    else{
      bCondicion=true
    }

    //bCondicion=false  es porque no está permitido
    //bCondicion=true   es porque está permitido
    return bCondicion;
    
  }
  //#endregion

  //#region Evaluar Almacenes Permitidos
  async fnEvaluarAlmacenesPermitidos(){
    let bCondicion=false, nIdAlmacen;    
    let bCondicionFecha=false;

    if( (this.bNotaMismoDia==true && this.dFechaOperMov==this.sFechaHoy)  ||
        (this.bCierreAutomatico==true && this.dFechaOperMov==this.sFechaManiana) )
    {
      bCondicionFecha=true
    }
    
    nIdAlmacen=this.salidaForm.get('opcAlmacen').value;

    //Validar los almacenes
    if(bCondicionFecha){  
      if(this.cboAlmacenPermitidos.length>0){
        for (let i = 0; i < this.cboAlmacenPermitidos.length; i++) {    

          if(this.cboAlmacenPermitidos[i].nIdAlmacen!=nIdAlmacen && bCondicion==false)
          { 
            bCondicion=false
          }
          if(this.cboAlmacenPermitidos[i].nIdAlmacen==nIdAlmacen)
          {
            bCondicion=true
          }
        }      
      }
      else{
        bCondicion=true
      }
    }
    else{
      bCondicion=true
    }

    //bCondicion=false  es porque no está permitido
    //bCondicion=true   es porque está permitido
    return bCondicion;
    
  }
  //#endregion

  //#region Evento Elegir Presupuestos desde Fecha
   async eventFechaPresupuestos(nIdCentroCosto){
    let nIdAlmacen;
    let bCondicionFecha=false;

    this.nIdCentroCosto=nIdCentroCosto
    nIdAlmacen=this.salidaForm.get('opcAlmacen').value
    
    
    if( (this.bNotaMismoDia==true && this.dFechaOperMov==this.sFechaHoy)  ||
        (this.bCierreAutomatico==true && this.dFechaOperMov==this.sFechaManiana) )
    {
      bCondicionFecha=true
    }

    if(bCondicionFecha){
      
      //Si es que no esta permitido
      if(await this.fnEvaluarPresPermitidos()==false){

        var resp = await Swal.fire({
          title: '¿Desea continuar?',
          text: "El presupuesto actual no se encuentra en la lista permitida para la fecha seleccionada, si acepta se reiniciará dicho campo",
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Aceptar',
          cancelButtonText:'Cancelar'
        })
    
        if (!resp.isConfirmed) {              
          this.dFechaOperMov=this.sFechaPasado;
          this.salidaForm.controls.txtFechaEntrega.setValue(this.sFechaTraspasado);
          //this.dFechaOperMov=this.sFechaManiana;
          //this.salidaForm.controls.txtFechaEntrega.setValue(this.sFechaPasado);
          if(this.pOpcion==1){
            this.salidaForm.controls.txtPresupuesto.setValue(this.nIdCentroCostoAnterior);  
            this.salidaForm.controls.opcAlmacen.setValue(this.nIdAlmacenAnterior); 
          }
          
          return;
        }

        await this.fnInicializarDetalle();     
        this.salidaForm.controls.txtPresupuesto.setValue('');               
        this.salidaForm.controls.opcAlmacen.setValue('');                       
        this.cboAlmacen=[];     
        
        if(this.pOpcion==3){
          this.salidaForm.get('txtPresupuesto').enable();
          this.salidaForm.get('opcAlmacen').enable();
        }

      }

    }

    nIdAlmacen=this.salidaForm.get('opcAlmacen').value
    if(this.salidaForm.get('opcAlmacen').value==undefined){
      nIdAlmacen=''
    }
    if(nIdAlmacen!=''){
      this.eventAlmacenes();    
    }
             
    this.nIdCentroCostoAnterior=nIdCentroCosto
       
  }
  //#endregion

  //#region Evento Elegir Almacenes
  async eventAlmacenes(){
    let bCondicionFecha=false;
    if( (this.bNotaMismoDia==true && this.dFechaOperMov==this.sFechaHoy)  ||
        (this.bCierreAutomatico==true && this.dFechaOperMov==this.sFechaManiana) )
    {
      bCondicionFecha=true
    }


    if(bCondicionFecha){
    
      if(await this.fnEvaluarAlmacenesPermitidos()==false){

        var resp = await Swal.fire({
          title: '¿Desea continuar?',
          text: "El almacen actual no se encuentra en la lista permitida para la fecha seleccionada, si acepta se reiniciará dicho campo",
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Aceptar',
          cancelButtonText:'Cancelar'
        })

        if (!resp.isConfirmed) {                     
          this.salidaForm.controls.opcAlmacen.setValue(this.nIdAlmacenAnterior);  
          return;
        }
     
        await this.fnInicializarDetalle();     
        this.salidaForm.controls.opcAlmacen.setValue('');                            

      }
    }
    
  }
  //#endregion
  
  //#region Limpiar Articulos
  async fnLimpiarArticulos(nIdParametro, nTipo){
    let sTipo;
    if(nTipo==1){
      sTipo='presupuesto'
    }
    else if(nTipo==2){
      this.nIdAlmacen = this.salidaForm.get('opcAlmacen').value;
      sTipo='almacen'
    }
    
    if(this.listaDetalle.length>0){
      var resp = await Swal.fire({
        title: '¿Desea continuar?',
        text: 'Si cambia de '+sTipo+', se reiniciara la lista de artículos.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText:'Cancelar'
      })
  
      if (!resp.isConfirmed) {      
        if(nTipo==1){
          this.salidaForm.controls.txtPresupuesto.setValue(this.nIdCentroCostoAnterior);
          this.salidaForm.controls.opcAlmacen.setValue(this.nIdAlmacenAnterior); 
        }
        else if(nTipo==2){
          this.salidaForm.controls.opcAlmacen.setValue(this.nIdAlmacenAnterior); 
        }                 
        return;
      }

      this.fnInicializarDetalle(); 
        
    }

    let bCondicionFecha=false;
    if( (this.bNotaMismoDia==true && this.dFechaOperMov==this.sFechaHoy)  ||
        (this.bCierreAutomatico==true && this.dFechaOperMov==this.sFechaManiana) )
    {
      bCondicionFecha=true
    }
 

    if(bCondicionFecha){
      if(nTipo==1){
        this.nIdCentroCostoAnterior=nIdParametro
        if(await this.fnEvaluarPresPermitidos()==false){
          this.salidaForm.controls.txtPresupuesto.setValue('');
          this.salidaForm.controls.opcAlmacen.setValue(''); 
                   
          Swal.fire('¡Verificar!','El presupuesto seleccionado no está disponible.','warning').then(() => 
            {this.cboAlmacen=[];    
            });          
          return false;
        }
      }
      else if(nTipo==2){
        
        if(await this.fnEvaluarAlmacenesPermitidos()==false){
          this.salidaForm.controls.opcAlmacen.setValue(''); 
          Swal.fire({
            icon: 'warning',
            title: '¡Verificar!',
            text: 'El almacen seleccionado no está disponible.'
          });
          return false;
        }
      }    
    }

    if(nTipo==2){
      this.nIdAlmacenAnterior=nIdParametro
    }
    
  }
  //#endregion

  //#region Duplicar Nota
   async fnDuplicarNota(){
    let sTextoGuardado, sTextoContinuar, sTituloContinuar;

    if(this.vbtnDuplicar)
    {
      sTituloContinuar='¿Desea duplicar el documento?'
      sTextoContinuar='Los artículos que no tengan saldo no se duplicarán.'
      sTextoGuardado='Se duplicó correctamente.'
    }

    var validar = await this.fnValidarPresupuestoActivo()
    if(!validar){
      return;
    }

    var resp = await Swal.fire({      
      title: sTituloContinuar,
      text: sTextoContinuar,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText:'Cancelar'
    })

    if (!resp.isConfirmed) {        
      return;
    }

    this.pOpcion=1;    
    this.nEstadoNota=0;
    this.vbtnDuplicar=false;
    this.fnHabilitarControles();
    this.fnInicializarDetalle();
   
    this.fnNuevo();

    this.salidaForm.controls.txtDestinatario.setValue('') 
    this.salidaForm.controls.txtEntidadDestino.setValue('')    
    this.salidaForm.controls.txtPuntoDestino.setValue('') 
    this.cboDestino=[]
    this.salidaForm.controls.txtUbicacion.setValue('') 
    this.salidaForm.controls.txtDireccionDestino.setValue('')
    this.salidaForm.controls.opcMovil.setValue('') 
    this.salidaForm.controls.opcTipoMovil.setValue('')

    if(this.salidaForm.get('btnTodoDia').value==true){      
      this.salidaForm.get('btnTodoDia').enable();
    }    
    else{
      this.salidaForm.get('opcHora').enable();
    }  

    this.salidaForm.get('txtPresupuesto').enable();
    this.salidaForm.get('opcAlmacen').enable();
    this.salidaForm.get('opcMovil').disable();
    this.salidaForm.get('opcTipoMovil').disable();
        
    this.salidaForm.controls.txtDocumento.setValue('') 
    this.salidaForm.controls.txtGuiaSalida.setValue('') 
    this.fnListarDetalleDuplicar();

    // Swal.fire({
    //   icon: 'success',
    //   title: sTextoGuardado
    // });

    //this.fnGuardarFormulario(); 
  }
  //#endregion Duplicar Nota

  //#region Validar que el presupuesto este activo
  async fnValidarPresupuestoActivo(){
    try{
      this.spinner.show();
      const pParametro = [];
      pParametro.push(this.salidaForm.get('txtPresupuesto').value);           
            
      const pParametroDet = [];
      const resultado = await this.notasLogisticaService.fnControlNotaSalida( 1, 2, pParametro, 19 , pParametroDet, this.url)
      this.spinner.hide();
      //Si el nId es 0 el presupuesto ya no esta activo 
      if(resultado[0].nId==0){
        Swal.fire('¡Verificar!', `${resultado[0].sDescripcion}`, 'warning')
        return false; 
      }else{
        return true;
      }
      }catch(err){
        this.spinner.hide();
        console.log(err);
        return false; 
      }
  }
  //#endregion

  //#region Generar Detalle para duplicar
  async fnListarDetalleDuplicar(){
    try{
      this.spinner.show();
      const pParametro = [];
      pParametro.push(this.nIdOperMov);           
            
      const pParametroDet = [];
      var resultado:any = await this.notasLogisticaService.fnControlNotaSalida( 1, 2, pParametro, 20 , pParametroDet, this.url)
      this.listaDetalle=resultado;
      this.detNotaSalidaTableData = new MatTableDataSource(this.listaDetalle);
      this.detNotaSalidaTableData.paginator = this.detNotaSalidaPaginator; 
      this.spinner.hide();

      this.fnCalcularTotales();     
      }catch(err){
        this.spinner.hide();
      }
  }
  //#region 

  //#region Crear Nota Recojo
  async fnCrearNotaRecojo(){

    if(this.nIdMovil==1 && this.nIdTipoEnvio==2214){
    
      var resp = await Swal.fire({
        title:'¿Desea continuar?',
        text: 'Se generará una Nota de Recojo en base a la Nota de Salida.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText:'Cancelar'
      })

      if (!resp.isConfirmed) {      
        return;
      }

      this.pOpcion  = 5;

      this.objNotaBase = [
        { nIdPresupuesto: this.salidaForm.get('txtPresupuesto').value,
          nIdAlmacen: this.salidaForm.get('opcAlmacen').value,
          nIdContacto: this.salidaForm.get('txtDestinatario').value,
          nIdEntidadRecojo: this.salidaForm.get('txtEntidadDestino').value,
          nIdSucursalRecojo: this.salidaForm.get('txtPuntoDestino').value,
          listaDetalle:this.listaDetalle}        
      ];
      
      this.vNotaSalida  = false
      this.vNotaRecojo  = true;    
    }
  }

  //#endregion

  //#region Validar FIFO Editar
  async fnValidarFifoMod(nArticulo, nFilaEditada){


    let listaArticulosDet=[];

    //Listar los artículos del mismo Código
    for (let i = 0; i < this.listaDetalle.length; i++) { 
      if(this.listaDetalle[i].nArticulo==nArticulo){
        listaArticulosDet.push(i)
      }      
    }
    [1,3,5]
        
    //Hallar el mayor 
    var mayor = 0;
    for(let i = 0; i < listaArticulosDet.length; i++){
      if (listaArticulosDet[i] > mayor)
      {
          mayor = listaArticulosDet[i];
      }
    }

    //Si la fila a modificar es menor
    if(nFilaEditada<mayor){
      Swal.fire('¡Verificar!', `El articulo no se puede modificar porque existe otro lote`, 'warning')
      
      return false;               
             
    }
    
  }
  //#endregion

  fnValidarFifoEditar(row){
    var cantidadArticulo = 0;
    var indexArticulo = 0;
    var indexMayorArticulo = 0;
    
    for (var i = 0; i < this.listaDetalle.length; i++) {
      if (this.listaDetalle[i].nArticulo == row.nArticulo) {
        cantidadArticulo++;
        if (indexMayorArticulo < i) {
          indexMayorArticulo = i;
        }
      }
 
      if ((this.listaDetalle[i].nArticulo == row.nArticulo) && (row.sLote == this.listaDetalle[i].sLote) && 
          (this.listaDetalle[i].sFechaIngreso == row.sFechaIngreso) && (this.listaDetalle[i].sFechaVence== row.sFechaVence)) {
        indexArticulo = i;
      }
    }
 
    if (cantidadArticulo > 1) {
      if (indexArticulo < indexMayorArticulo) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia!',
          text: 'El artículo con lote seleccionado no se puede modificar debido a que es de un' +
            ' lote menor al último lote agregado de este artículo.',          
        });
        return false;
      }
    }
  }

  //#region Valor en controles duplicados
  fnDarValor(form: FormGroup, formControlName: string, event) {
    const valor = (event.target as HTMLInputElement).value;
    form.get(formControlName).setValue(valor);
  }
  //#endregion

  // Funcionalidad de los botones laterales
  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? 0 : 3;

  }
}
