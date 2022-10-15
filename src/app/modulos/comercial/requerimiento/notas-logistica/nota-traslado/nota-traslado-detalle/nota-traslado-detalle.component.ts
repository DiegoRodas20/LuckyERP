import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
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

@Component({
  selector: 'app-nota-traslado-detalle',
  templateUrl: './nota-traslado-detalle.component.html',
  styleUrls: ['./nota-traslado-detalle.component.css'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ],
  animations: [asistenciapAnimations]
})
export class NotaTrasladoDetalleComponent implements OnInit {
  
  @ViewChild('expUbicacionOrigen') expUbicacionOrigen: MatExpansionPanel;
  @ViewChild('expUbicacionDestino') expUbicacionDestino: MatExpansionPanel;

  tsLista = 'active';  // Inicia la lista abierta
  abLista = 0;

  //#region Variables
  //Variables que viene desde el Padre
  @Input() pOpcion: number; 
  @Input() nIdNota: number; 
  
  //Variables que van al padre
  @Output() newEvent: EventEmitter<any>;
    
  //Variables del sistema
  url: string;
  sPais: string;  
  nIdEmpresa:string;
  nIdUsuario:number;
  sNombreUsuario:string;
  sFechaActual:string;
  minDate = new Date();
  sSinImagen:string

  //Formularios
  notaForm: FormGroup;
  detalleForm: FormGroup;

  //Variables Formulario
  nIdOperMov:number
  dFechaOperMov:any 
  nIdCentroCosto:number
  nIdCentroCostoDestino:number
  
  nIdPuntoRecojo:number
  nIdPuntoRecuperacion:number

  nIdPuntoLlegada:number
  nIdDestino:number

  nIdTipoEnvio:number
  nIdDestinatario:number
  nEstadoNota:number
  nIdCentroCostoAnterior:number
  nIdDireccionOrigen:number
  nIdDireccionDestino:number
  nIdTipoVehiculo: number = 0;  
  nIdGastoCosto: number= 0; 

  //Combos de Formulario
  cboPresupuesto=[]
  cboEntidades=[]
  cboHoras:any 
  cboAlmacen=[]
  cboRecuperacion=[]      
  cboDestino=[]
  cboMovil=[]
  cboTipoMovil=[]
  cboDestinatario=[]    
  cboParamFecha=[]
  cboPresupestoPermitidos=[]

  //Variables Detalle  
  sArticulo:string
  bOpcionArticulo:boolean=true;
  sRutaImagen:string
  nPesoDetalle:number
  nVolumenDetalle:number
  bEditarDetalle:boolean = false;
  nFilaEditada:number
  

  //Combos Detalle
  cboArticulo=[]
  cboPesoVol=[]
  cboUnidadMedida=[]
  listaDetalle=[]
  listaArticulos=[]

  //Fechas
  dFechaActual:any
  sHora:any
  sMinutos:any
  sFechaHoy:any
  sFechaManiana:any
  sFechaPasado:any
  sFechaTraspasado:any
  valorParamFecha
  nDiaSabado:number
  nDiaDomingo:number
  dFechaAnterior:any

  //Variables de Transporte
  sUbigeoOrigen:string
  sUbigeoDestino:string
  nIdSucursalGasto:number
  nIdPartidaGasto:number
  nPrecioEstandar:number
  sMensajeError:string

  //Variables de estado de botones
  vModifica:boolean = true;
  vbtnGuardar:boolean   = false;
  vbtnModificar:boolean = false;
  vbtnCancelar:boolean  = false;
  vbtnAprobar:boolean   = false;
  vbtnDevolver:boolean  = false; 
  vbtnEnviar:boolean  = false; 
  
  //Variables Tiempo
  time: Time=null;
  timerId:number=null;
  bCountdown : boolean  = false;
  bEstadoNuevo : boolean  = true;
  bNotaMismoDia:boolean
  bCierreAutomatico:boolean

  //Material Table
  detNotaTableData: MatTableDataSource<any>;
  @ViewChild(MatPaginator) detNotaPaginator: MatPaginator;
  @ViewChild(MatSort) detNotaSort: MatSort;
  DetNotaColumns: string[] = 
  ['pEstado','sArticulo', 'sMedida', 'sFechaVence', 'nCantidad', 'sObservacionDet'];

  @ViewChild('modalArticulo') modalArticulo: ElementRef;
  @ViewChild('modalImagen') modalImagen: ElementRef;

  matcher = new MyErrorStateMatcher();  
  disableDateList: Array<any> = [];
  
  //#endregion

  //Variable que almacena y pusheaa a la lista de CC, al guardar se validara si el CC esta activo
  vCentroCosto;
  vCentroCostoDestino;

  constructor(
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    @Inject('BASE_URL') baseUrl: string,
    private notasLogisticaService: NotasLogisticaService, 
    public dialog: MatDialog
    ) 
  { 
    this.url = baseUrl; 
    this.newEvent = new EventEmitter();
      
    this.cboMovil = [
      {nIdMovil: 1, sOpcMovil: 'Si'},
      {nIdMovil: 2, sOpcMovil: 'No'}      
    ];

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

  bCreaPrimera = false;
  ngOnInit(): void {
    //Inicializar variables del sistema
    this.sPais = localStorage.getItem('Pais');
    this.nIdEmpresa = localStorage.getItem('Empresa');
    const user = localStorage.getItem('currentUser');
    this.nIdUsuario = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.sNombreUsuario = JSON.parse(window.atob(user.split(".")[1])).uno;
  
  
    this.notaForm = this.formBuilder.group({    

      txtSolicitante: [''],                 
      txtFechaEntrega: ['',Validators.required],      
      btnTodoDia:[false],
      opcHora: [''],
  
      txtPresupuestoOrigen: ['',Validators.required],  
      txtPuntoRecojo: ['',Validators.required], 
      txtPuntoRecuperacion: ['',Validators.required], 
      txtDireccionOrigen:[''],
      txtUbicacionOrigen:[''],
  
      txtPresupuestoDestino: ['',Validators.required],  
      txtPuntoLlegada: ['',Validators.required], 
      txtDestino: ['',Validators.required], 
      txtUbicacionDestino:[''],
      txtDireccionLlegada:[''],
  
      opcMovil: ['',Validators.required],
      opcTipoMovil: ['',Validators.required],
      txtDestinatario: ['',Validators.required],

      txtTotalUnidades: [''],
      txtTotalPeso: [''],
      txtTotalVolumen: [''],
      txtObservacion: [''],
        
      //Auditoria
      txtDocumento: [''],
      txtEstado: [''],
      txtCreado: [''],
      txtFechaCreado: ['']
  
    }); 
    this.onToggleFab(1, -1)

    this.fnIniciarFormDetalle();

    this.spinner.show('spiDialog');

    this.fnObtenerPresupuestos();
    this.fnObtenerEntidad();
    this.fnObtenerMovilidad();
    this.fnObtenerUnidadMedida();
    this.fnObtenerFechaActual(); 
    
    if(this.pOpcion==1){
      this.vbtnGuardar=true
      this.bCreaPrimera=true;
      this.notaForm.controls['txtCreado'].setValue(this.sNombreUsuario);    
      this.notaForm.controls['txtEstado'].setValue('Incompleto');
      this.fnObtenerSolicitante();  
    }
    else if(this.pOpcion==3){      
      this.nIdOperMov=this.nIdNota;
      this.fnCargarCabecera();   
    }
  
    this.spinner.hide('spiDialog');

  }
  
  //#region Iniciar Form Detalle
  fnIniciarFormDetalle(){
    this.detalleForm = this.formBuilder.group({

      txtArticulo:[''],  
      txtUnidadMedida:[''],
      numUnidadMedida:[''],
      txtCantidad:[''],  
      txtObservacionDetalle:[''],
      txtNombreArticuloIngreso:[''],
      opcArticulo:[true],
      
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

  //#region Salir
  fnSalir = function(){
    this.newEvent.emit(1);        
  }
  //#endregion Salir

  //#region Eventos 

    //#region Evento Hora de Entrega
    fnCambiarHoraEntrega(event){        
      if(event.checked==true){
        this.notaForm.controls['opcHora'].setValue('');
        this.notaForm.get('opcHora').disable(); 
      }
      else if(event.checked==false){
        this.notaForm.controls['opcHora'].setValue('');
        this.notaForm.get('opcHora').enable();
      }
     }
    //#endregion

    //#region Evento Toggle
    fnCambiarOpcArticulo(event){
      this.bOpcionArticulo=event.checked
        
        this.detalleForm.controls['txtArticulo'].setValue('');         
        this.detalleForm.controls['txtUnidadMedida'].setValue('');                
        this.detalleForm.controls['numUnidadMedida'].setValue('');
        this.detalleForm.controls['txtCantidad'].setValue('');
        this.detalleForm.controls['txtObservacionDetalle'].setValue('');
        this.detalleForm.controls['txtNombreArticuloIngreso'].setValue('');
        this.sRutaImagen=this.sSinImagen
        this.detalleForm.get('txtCantidad').enable();

    }
    //#endregion Evento Toggle
   
  //#endregion

  //#region Obtener Solicitante
  async fnObtenerSolicitante(){
    let sSolicitante;
    const pParametro = [];
    pParametro.push(this.nIdUsuario);
    const pParametroDet = [];
        
    sSolicitante = await this.notasLogisticaService.fnControlNotaTraslado( 1, 2, pParametro, 2 , pParametroDet, this.url)

    this.notaForm.controls['txtSolicitante'].setValue(sSolicitante.datos);

  }
  //#endregion Obtener Solicitante

  //#region Obtener Presupuestos
   async fnObtenerPresupuestos(){
    let comboPresupuesto;
    const pParametro = [];
    pParametro.push(this.nIdUsuario);
    pParametro.push(this.nIdEmpresa);
    const pParametroDet = [];
        
    comboPresupuesto = await this.notasLogisticaService.fnControlNotaTraslado( 1, 2, pParametro, 3 , pParametroDet, this.url)
    this.cboPresupuesto=comboPresupuesto;
   
    if(this.vbtnGuardar==false){
      //Si no esta activo el presupuesto de la cabecera lo agregamos a la lista
      if(this.cboPresupuesto.findIndex(item=> item.nId==this.vCentroCosto?.nId)==-1 && this.vCentroCosto!=null){
        this.cboPresupuesto.push(this.vCentroCosto);
      }

      if(this.cboPresupuesto.findIndex(item=> item.nId==this.vCentroCostoDestino?.nId)==-1 && this.vCentroCostoDestino!=null){
        this.cboPresupuesto.push(this.vCentroCostoDestino);
      }

      this.notaForm.controls['txtPresupuestoOrigen'].setValue(this.nIdCentroCosto);      
      this.notaForm.controls['txtPresupuestoDestino'].setValue(this.nIdCentroCostoDestino);            
    }

  }
  //#endregion Obtener Presupuestos

  //#region Obtener Entidades
  async fnObtenerEntidad(){
    let comboEntidades;
    const pParametro = [];
    pParametro.push(this.sPais);           
          
    const pParametroDet = [];

    comboEntidades = await this.notasLogisticaService.fnControlNotaTraslado( 1, 2, pParametro, 5 , pParametroDet, this.url)
    this.cboEntidades=comboEntidades;

      if(this.vbtnGuardar==false){
        this.notaForm.controls.txtDestinatario.setValue(this.nIdDestinatario);
        this.notaForm.controls.txtPuntoRecojo.setValue(this.nIdPuntoRecojo);
        this.notaForm.controls.txtPuntoLlegada.setValue(this.nIdPuntoLlegada);
        this.fnObtenerRecuperacion(this.nIdPuntoRecojo);        
        this.fnObtenerDestino(this.nIdPuntoLlegada);        
      
      }

  }
  //#endregion  Obtener Entidades

  //#region Obtener Punto de Recuperacion
   async fnObtenerRecuperacion(nIdEntidad){    
    let comboPuntoRec
    
    const pParametro = [];
    pParametro.push(nIdEntidad);  
    pParametro.push(this.nIdUsuario);                                  
    const pParametroDet = [];

    comboPuntoRec = await this.notasLogisticaService.fnControlNotaTraslado( 1, 2, pParametro, 6 , pParametroDet, this.url)
    this.cboRecuperacion=comboPuntoRec;
      
      if(this.vbtnGuardar==false){

        this.notaForm.controls.txtPuntoRecuperacion.setValue(this.nIdPuntoRecuperacion);
        this.fnObtenerUbicacion(this.nIdPuntoRecuperacion,1)
      }

  }
  //#endregion Obtener Destinos
  
  //#region Obtener Destinos
  async fnObtenerDestino(nIdEntidad){    
    let comboDestino
    
    const pParametro = [];
    pParametro.push(nIdEntidad);  
    pParametro.push(this.nIdUsuario);                     
    const pParametroDet = [];

    comboDestino = await this.notasLogisticaService.fnControlNotaTraslado( 1, 2, pParametro, 6 , pParametroDet, this.url)
    this.cboDestino=comboDestino;
      
      if(this.vbtnGuardar==false){
        this.notaForm.controls.txtDestino.setValue(this.nIdDestino);
        this.fnObtenerUbicacion(this.nIdDestino,2)
      }

  }
  //#endregion Obtener Destinos

  //#region Obtener Ubicacion y Direccion
  fnObtenerUbicacion(nIdDireccion, nTipo){
    
    

    if(nTipo==1){ //Origen
      this.nIdDireccionOrigen=nIdDireccion;
      if(this.cboRecuperacion.length>0){  
        for (let i = 0; i < this.cboRecuperacion.length; i++) {        
          if(nIdDireccion==this.cboRecuperacion[i].nIdDireccion){                           
            this.notaForm.controls.txtUbicacionOrigen.setValue(this.cboRecuperacion[i].sDepartamento+', '+this.cboRecuperacion[i].sProvincia+', '
                                                        +this.cboRecuperacion[i].sDistrito+' - '+this.cboRecuperacion[i].sTipoZona);
            this.notaForm.controls.txtDireccionOrigen.setValue(this.cboRecuperacion[i].sDireccion);
          }
        }
      }
    }
    else if(nTipo==2){ //Destino
      this.nIdDireccionDestino=nIdDireccion;
      if(this.cboDestino.length>0){  
        for (let i = 0; i < this.cboDestino.length; i++) {        
          if(nIdDireccion==this.cboDestino[i].nIdDireccion){                           
            this.notaForm.controls.txtUbicacionDestino.setValue(this.cboDestino[i].sDepartamento+', '+this.cboDestino[i].sProvincia+', '
                                                        +this.cboDestino[i].sDistrito+' - '+this.cboDestino[i].sTipoZona);
            this.notaForm.controls.txtDireccionLlegada.setValue(this.cboDestino[i].sDireccion);
          }
        }
      }
    } 
    
  }
  //#endregion Obtener Ubicacion y Direccion

  //#region Obtener Movilidad
  async fnObtenerMovilidad(){
    let comboTipoMovil;

    this.notaForm.controls['opcMovil'].setValue(1);    
    this.notaForm.get('opcMovil').disable();

    const pParametro = [];
    pParametro.push(this.notaForm.get('opcMovil').value);
      
    const pParametroDet = [];

    comboTipoMovil = await this.notasLogisticaService.fnControlNotaTraslado( 1, 2, pParametro, 7 , pParametroDet, this.url)
    this.cboTipoMovil=comboTipoMovil;
      
    this.notaForm.controls.opcTipoMovil.setValue(2214);

    if(this.vbtnGuardar==false){
        this.notaForm.controls.opcTipoMovil.setValue(this.nIdTipoEnvio);      
    }
    
    this.notaForm.get('opcTipoMovil').disable();

  }
  //#endregion Obtener Movilidad

  //#region Obtener Articulo
  async fnObtenerArticulos(){
    let comboArticulo, nIdDireccionOrigen, nIdCentroCosto;
    nIdDireccionOrigen=this.notaForm.get('txtPuntoRecuperacion').value
    nIdCentroCosto=this.notaForm.get('txtPresupuestoOrigen').value
    
    const pParametro = [];
    pParametro.push(this.sPais);
    pParametro.push(nIdDireccionOrigen)
    pParametro.push(nIdCentroCosto);
    
    const pParametroDet = [];

    comboArticulo = await this.notasLogisticaService.fnControlNotaTraslado( 1, 2, pParametro, 8 , pParametroDet, this.url)
    this.cboArticulo=comboArticulo;
    
  }
  //#endregion Obtener Articulo

  //#region Obtener Data de Artículos

    //#region Datos Generales del Artículo
    fnObtenerDatoArticulo(nParametro){
      
      if(this.cboArticulo.length>0){  
        for (let i = 0; i < this.cboArticulo.length; i++) {        
          if(this.cboArticulo[i].nIdArticulo==nParametro){        
            this.sArticulo=this.cboArticulo[i].sDescripcion;           
            this.detalleForm.controls.txtUnidadMedida.setValue(this.cboArticulo[i].sCodUndMedida);             
            this.sRutaImagen=this.cboArticulo[i].sRutaArchivo
          }
        }
      }
      this.detalleForm.get('txtCantidad').enable();
    }
    //#endregion

    //#region Obtener Peso y Volumen
    async fnObtenerPesoVol(){
      let nIdArticulo, nCantidad, comboPesoVolumen;
      nIdArticulo=this.detalleForm.get('txtArticulo').value
      nCantidad=this.detalleForm.get('txtCantidad').value
      
      const pParametro = [];
      pParametro.push(nIdArticulo);
      pParametro.push(nCantidad);

      const pParametroDet = [];

      comboPesoVolumen = await this.notasLogisticaService.fnControlNotaTraslado( 1, 2, pParametro, 14 , pParametroDet, this.url)
      this.cboPesoVol = comboPesoVolumen; 
      
      this.nPesoDetalle=this.cboPesoVol[0].nPesoDetalle
      this.nVolumenDetalle=this.cboPesoVol[0].nVolumenDetalle
      
    }
    //#endregion Obtener Peso y Volumen

  //#endregion Obtener Data de Artículos

  //#region Obtener Unidad de Medida
  async fnObtenerUnidadMedida(){
    let comboUnidadMedida;
    
    const pParametro = [];    
    const pParametroDet = [];

    comboUnidadMedida = await this.notasLogisticaService.fnControlNotaTraslado( 1, 2, pParametro, 15 , pParametroDet, this.url)
    this.cboUnidadMedida=comboUnidadMedida;
      
  }  
  //#endregion Obtener Unidad de Medida

  //#region Validaciones

    //#region Validacion Hora Entrega
    fnValidarHoraEntrega(){
      
      if(this.notaForm.get('btnTodoDia').value==true){
        this.notaForm.controls['opcHora'].setValue('T.Dia'); 
      }

      if(this.notaForm.get('btnTodoDia').value==false  && (this.notaForm.get('opcHora').value==''||this.notaForm.get('opcHora').value==undefined))
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
    
    //#region Validar Modal
    fnValidarModal(){
    
      if(this.bOpcionArticulo==true){
        if( this.detalleForm.get('txtArticulo').value=='' ||
            this.detalleForm.get('txtCantidad').value=='' ||
            this.detalleForm.get('txtCantidad').value==0 ){
              Swal.fire({
                icon: 'warning',
                title: '¡Verificar!',
                text: 'Existen datos obligatorios para agregar en el detalle.' 
              });
              return false;
        }  
      }
      else if(this.bOpcionArticulo==false){
        if( this.detalleForm.get('txtNombreArticuloIngreso').value=='' ||
            this.detalleForm.get('txtCantidad').value=='' ||
            this.detalleForm.get('txtCantidad').value==0 ){
              Swal.fire({
                icon: 'warning',
                title: '¡Verificar!',
                text: 'Existen datos obligatorios para agregar en el detalle.' 
              });
              return false;
        }
      }

    }
    //#endregion
   
    //#region Validar Abrir Modal
    fnValidarAbrirModal(){
      if(this.notaForm.get('txtPresupuestoOrigen').hasError('required')==true){
        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: 'Elegir Presupuesto Origen antes de agregar artículos.' 
        });
        return false;
      }
      else if(this.notaForm.get('txtPresupuestoDestino').hasError('required')==true){
        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: 'Elegir Presupuesto Destino antes de agregar artículos.' 
        });
        return false;
      } 
      else if(this.notaForm.get('txtPuntoRecuperacion').hasError('required')==true){
        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: 'Elegir Punto de Recuperación antes de agregar artículos.' 
        });
        return false;
      }     
    }
    //#endregion

    //#region Validar Repeticion de Articulos
    fnValidarLotes(){
      let nArticulo;
      if(this.detalleForm.get('opcArticulo').value==true){
        nArticulo=this.detalleForm.get('txtArticulo').value
        if(this.listaDetalle.length>0){  
          for (let i = 0; i < this.listaDetalle.length; i++) {        
            if(this.bEditarDetalle==true ){
              if(this.nFilaEditada!=i){
                if(nArticulo==this.listaDetalle[i].nArticulo ){
                  Swal.fire({
                    icon: 'warning',
                    title: '¡Verificar!',
                    text: 'No puede agregar dos artículos iguales.' 
                  });
                  return false
                }
              }                                
            }
            else if(nArticulo==this.listaDetalle[i].nArticulo ){

              Swal.fire({
                icon: 'warning',
                title: '¡Verificar!',
                text: 'No puede agregar dos artículos iguales.' 
              });
              return false
            }        
          }
        }
      }
    }
    //#endregion Validar Repeticion de Articulos

    //#region Validar Registro
    fnValidarRegistro(){
      let bCondicionFecha=true;

      if(this.disableDateList.length>0){
        for (let i = 0; i < this.disableDateList.length; i++) {  
          if(this.dFechaOperMov==this.disableDateList[i]){
            bCondicionFecha=false
          }
        }
      }

      if(this.notaForm.get('txtFechaEntrega').invalid){        
        Swal.fire({
         icon: 'warning',
         title: '¡Verificar!',
         text: 'La fecha de entrega es obligatoria y debe ser coherente.' 
       });
       return false;
      } 
      else if(this.notaForm.controls.txtPresupuestoOrigen.invalid || this.notaForm.controls.txtPuntoRecojo.invalid
        || this.notaForm.controls.txtPuntoRecuperacion.invalid){
        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: 'Los datos de origen son obligatorios para guardar la nota.' 
        });
        this.expUbicacionOrigen.open();
        return false;
      }
      else if(this.notaForm.controls.txtPresupuestoDestino.invalid || this.notaForm.controls.txtPuntoLlegada.invalid
        || this.notaForm.controls.txtDestino.invalid){
        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: 'Los datos de destino son obligatorios para guardar la nota.' 
        });
        this.expUbicacionDestino.open();
        return false;
      }
      else if(this.notaForm.invalid){        
        Swal.fire({
         icon: 'warning',
         title: '¡Verificar!',
         text: 'Existen datos obligatorios para agregar en la Cabecera.' 
       });
       return false;
      } 
      else if(this.notaForm.get('txtPuntoRecuperacion').value==this.notaForm.get('txtDestino').value){
        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: 'El punto origen y el punto destino no pueden ser iguales.' 
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
      else if(this.listaDetalle.length>30){
        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: 'Ha excedido el máximo de 30 artículos.' 
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
    //#endregion

    //#region Validar Entidades
    fnValidarEntidades(nTipo){
      if(nTipo==1){
        this.notaForm.controls.txtPuntoRecuperacion.setValue(''); 
        this.notaForm.controls.txtUbicacionOrigen.setValue(''); 
        this.notaForm.controls.txtDireccionOrigen.setValue('');  
      }  
      else if(nTipo==2){
        this.notaForm.controls.txtDestino.setValue(''); 
        this.notaForm.controls.txtUbicacionDestino.setValue(''); 
        this.notaForm.controls.txtDireccionLlegada.setValue('');  
      }              
    }
    //#endregion

    //#region Validar Fecha al Enviar
    fnValidarFechaEnvio(){      
      let dFechaEntrega, dFechaMinima;

      dFechaEntrega= new Date(this.notaForm.get('txtFechaEntrega').value)


      if(this.disableDateList.length>0){
        for (let i = 0; i < this.disableDateList.length; i++) {       
          if(i>0)
          {
            if(new Date(this.disableDateList[i-1])<new Date(this.disableDateList[i]))
            {
              dFechaMinima=new Date(this.disableDateList[i])
            }
          }
          else if(i==0){
            dFechaMinima=new Date(this.disableDateList[i])
          }          
        }
      }
      else if(this.disableDateList.length==0){
        dFechaMinima=this.minDate;
      }

      if(dFechaEntrega<dFechaMinima){        
        Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'No es coherente la Fecha de Entrega.' 
      });
      return false;
      } 
 
    }
    //#endregion

    //#region Validar Saldo de Distribución
    async fnValidarSaldoDistribucion(){ 
      //Saldo - Precio minimo por Sucursal
      let valorSaldo, bCondicion=true;
            
      const pParametro = []
      pParametro.push(this.sPais)       
      pParametro.push(this.nIdCentroCosto)
      pParametro.push(this.nIdDireccionDestino)
      pParametro.push(this.dFechaOperMov)
      const pParametroDet = [];
                    
      valorSaldo = await this.notasLogisticaService.fnControlNotaTraslado( 1, 2, pParametro, 17 , pParametroDet, this.url)
            
      this.nIdSucursalGasto = valorSaldo[0].nIdSucursalGasto
      this.nIdPartidaGasto  = valorSaldo[0].nIdPartidaGasto
      this.nPrecioEstandar  = valorSaldo[0].nPrecioEstandar
      this.sMensajeError	  = valorSaldo[0].sMensaje
      this.nIdTipoVehiculo  = valorSaldo[0].nIdTipoVehiculo
      this.nIdGastoCosto  = valorSaldo[0].nIdGastoCosto

      if(valorSaldo[0].nSaldo<0){
  
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
      const pParametro = []
      
      const nPeso = this.listaDetalle.reduce((sum, current) => sum + current.nPesoDetalle, 0);
      const nVolumen = this.listaDetalle.reduce((sum, current) => sum + current.nVolumenDetalle, 0);
      
      pParametro.push(this.sPais)       
      pParametro.push(this.nIdCentroCosto)
      pParametro.push(this.nIdDireccionDestino)
      pParametro.push(this.dFechaOperMov)
      pParametro.push(nPeso)
      pParametro.push(nVolumen)

      const pParametroDet = [];

      this.spinner.show();

      valorSaldo = await this.notasLogisticaService.fnControlNotaTraslado( 1, 2, pParametro, 21 , pParametroDet, this.url) 
      this.nIdSucursalGasto = valorSaldo[0].nIdSucursalGasto
      this.nIdPartidaGasto  = valorSaldo[0].nIdPartidaGasto
      this.nPrecioEstandar  = valorSaldo[0].nPrecioEstandar
      this.sMensajeError	  = valorSaldo[0].sMensaje
      this.nIdTipoVehiculo  = valorSaldo[0].nIdTipoVehiculo
      this.nIdGastoCosto    = valorSaldo[0].nIdGastoCosto
      this.spinner.hide();

      if(valorSaldo[0].nSaldo<0){
       

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

    //#region Validar Decimales a Enteros
    fnRedondear(formControlName: string, form: FormGroup) { 
      var valor: number = form.get(formControlName).value;
      if (valor == null) return;
      form.get(formControlName).setValue(Math.round(valor));   
    }
    //#endregion

  //#endregion Validaciones
  
  //#region  Detalle Modal
    
    //#region Abrir Modal Nuevo
    btnAgregarLineaDetalle(){    
      this.bEditarDetalle=false;
      if(this.fnValidarAbrirModal()!=false){
        this.fnObtenerArticulos();
        
        this.fnIniciarFormDetalle();
        this.bOpcionArticulo=true;    
          
        this.modalArticulo.nativeElement.click();
      }
    }
  //#endregion

    //#region Agregar Detalle modal
    async fnAgregarListaDetalle(){    
    
      var nCantidadDetalle;
      
      await this.fnObtenerPesoVol();

      if(this.fnValidarModal()!=false && this.fnValidarLotes()!=false ){
      
        nCantidadDetalle=this.detalleForm.get('txtCantidad').value
      
        if(this.detalleForm.get('opcArticulo').value==true){        
          this.listaDetalle.push(
            { sArticulo:             this.sArticulo, 
              nArticulo:              this.detalleForm.get('txtArticulo').value,                
              sMedida:                this.detalleForm.get('txtUnidadMedida').value,
              nMedida:                0,
              sObservacionDet:        this.detalleForm.get('txtObservacionDetalle').value,
              bOpcionArticulo:        this.detalleForm.get('opcArticulo').value,                               
              nCantidad:              nCantidadDetalle,           
              nPesoDetalle:           this.nPesoDetalle,
              nVolumenDetalle:        this.nVolumenDetalle
          });
        }
        else if(this.detalleForm.get('opcArticulo').value==false){        
          
            for (let i = 0; i < this.cboUnidadMedida.length; i++) {        
              if(this.cboUnidadMedida[i].nIdUndMedida==this.detalleForm.get('numUnidadMedida').value){        
                this.detalleForm.controls['txtUnidadMedida'].setValue(this.cboUnidadMedida[i].sDescripcion) 
              }
            }
         
          this.listaDetalle.push(
            {sArticulo:             this.detalleForm.get('txtNombreArticuloIngreso').value, 
            nArticulo:              0,                
            sMedida:                this.detalleForm.get('txtUnidadMedida').value,
            nMedida:                this.detalleForm.get('numUnidadMedida').value,
            sObservacionDet:        this.detalleForm.get('txtObservacionDetalle').value,
            bOpcionArticulo:        this.detalleForm.get('opcArticulo').value,                                      
            nCantidad:              nCantidadDetalle,           
            nPesoDetalle:           0,
            nVolumenDetalle:        0
          });      
        }
      
        this.detNotaTableData = new MatTableDataSource(this.listaDetalle);
        this.detNotaTableData.paginator = this.detNotaPaginator; 
        this.detNotaTableData.sort = this.detNotaSort;

        this.fnCalcularTotales();

        this.fnIniciarFormDetalle();

        //this.modalArticulo.nativeElement.click();
      }  
    }
    //#endregion

    //#region Abrir Modal Edicion
    async btnEditarDetalle(i, row){
      
      this.modalArticulo.nativeElement.click();
      this.bEditarDetalle=true;
      this.nFilaEditada= i;
      this.detalleForm.controls['opcArticulo'].setValue(row.bOpcionArticulo)
      this.bOpcionArticulo=row.bOpcionArticulo

      if(row.bOpcionArticulo==true){
        this.detalleForm.controls['txtArticulo'].setValue(row.nArticulo);    
        this.fnObtenerDatoArticulo(row.nArticulo);        
      }
      else if(row.bOpcionArticulo==false){
        this.detalleForm.controls['txtNombreArticuloIngreso'].setValue(row.sArticulo); 
        this.detalleForm.get('txtCantidad').enable();
        await this.fnObtenerUnidadMedida();
        this.detalleForm.controls['numUnidadMedida'].setValue(row.nMedida)
      }
     
      this.detalleForm.controls['txtCantidad'].setValue(row.nCantidad);    
      this.detalleForm.controls['txtObservacionDetalle'].setValue(row.sObservacionDet);    
      
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
        this.sArticulo=row.sArticulo
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
      var nCantidadDetalle

      i=this.nFilaEditada;

      await this.fnObtenerPesoVol();

      if(this.fnValidarModal()!=false && this.fnValidarLotes()!=false){
      
      nCantidadDetalle=this.detalleForm.get('txtCantidad').value;
        
            this.listaDetalle[i].sArticulo=               this.sArticulo
            this.listaDetalle[i].nArticulo=               this.detalleForm.get('txtArticulo').value            
            this.listaDetalle[i].sMedida=                 this.detalleForm.get('txtUnidadMedida').value            
            this.listaDetalle[i].sObservacionDet=         this.detalleForm.get('txtObservacionDetalle').value
            this.listaDetalle[i].bOpcionArticulo=         this.detalleForm.get('opcArticulo').value
            this.listaDetalle[i].sNombreArticuloIngreso=  this.detalleForm.get('txtNombreArticuloIngreso').value                        
            this.listaDetalle[i].nCantidad=               nCantidadDetalle         
            this.listaDetalle[i].nPesoDetalle=            this.nPesoDetalle
            this.listaDetalle[i].nVolumenDetalle=         this.nVolumenDetalle
            

      this.detNotaTableData = new MatTableDataSource(this.listaDetalle);
      this.detNotaTableData.paginator = this.detNotaPaginator; 
      this.detNotaTableData.sort = this.detNotaSort;
      
      this.fnCalcularTotales();

      this.fnIniciarFormDetalle();
      //this.modalArticulo.nativeElement.click();
      }
    }
    //#endregion

    //#region Confirmar Detalle-Modal
    fnConfirmarLineas(){
      
      for (let i = 0; i < this.listaDetalle.length; i++) {
        let listaTemporal=[]
        if(this.listaDetalle[i].bOpcionArticulo==true){       
          listaTemporal.push( this.listaDetalle[i].nArticulo,                                                                            
                              this.listaDetalle[i].nCantidad,
                              this.listaDetalle[i].sObservacionDet,
                              this.listaDetalle[i].bOpcionArticulo,
                              null,
                              null
                            )
        }
        else if(this.listaDetalle[i].bOpcionArticulo==false){       
          listaTemporal.push( null,                                                                            
                              this.listaDetalle[i].nCantidad,
                              this.listaDetalle[i].sObservacionDet,
                              this.listaDetalle[i].bOpcionArticulo,
                              this.listaDetalle[i].sArticulo,
                              this.listaDetalle[i].nMedida,
                            )
        }

    
      this.listaArticulos[i]=listaTemporal.join('|');      
      }

    }
    //#endregion Confirmar Detalle-Modal

    //#region Inicializar Detalle
    fnInicializarDetalle(){ 
      this.detNotaTableData = new MatTableDataSource();
      this.detNotaTableData.paginator = this.detNotaPaginator;

      this.listaDetalle=[]
      this.listaArticulos=[]             
    
    }
    //#endregion

    //#region Eliminar Detalle
    btnEliminarLineaDetalle(i,Obj){
      if(this.vbtnGuardar==true){
      
        let vOb = this.detNotaTableData.data
        vOb = vOb.filter(filtro => filtro != Obj);
        this.detNotaTableData = new MatTableDataSource(vOb);
        this.detNotaTableData.paginator = this.detNotaPaginator;

        this.listaDetalle.splice(i,1)
        this.fnCalcularTotales();
      }
    }
    //#endregion Eliminar Detalle

  //#endregion Detalle-Modal

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
    this.notaForm.controls.txtTotalUnidades.setValue(nTotalUnidades);   
    this.notaForm.controls.txtTotalPeso.setValue(nTotalPeso.toFixed(2));   
    this.notaForm.controls.txtTotalVolumen.setValue(nTotalVolumen.toFixed(6));   

  }
  //#endregion Calcular Totales
  
  //#region Fechas

    //#region Obtener Fecha Actual
    async fnObtenerFechaActual(){
      let sDatoFecha;    
      var sCadenaHora, sSegundos
    
      const pParametro = [];
      pParametro.push(this.sPais);           
            
      const pParametroDet = [];

      sDatoFecha = await this.notasLogisticaService.fnControlNotaTraslado( 1, 2, pParametro, 12 , pParametroDet, this.url)
      this.dFechaActual = sDatoFecha.datos; 
      
      //Obtener Hora Actual      
      sCadenaHora=this.dFechaActual.split(':', 3);
      this.sHora=sCadenaHora[0].substr(-2,2)
      this.sMinutos=sCadenaHora[1]
      sSegundos=sCadenaHora[2]

      await this.fnValidarFechaActual();    
      
    }
    //#endregion Obtener Fecha Actual

    //#region Comparar Horas
    fnCompararHoras(paramHora, paramMinuto){    
    
      
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
               
        if(this.notaForm.get('txtPresupuestoOrigen').value!=''){          
          this.eventFechaPresupuestos(this.notaForm.get('txtPresupuestoOrigen').value)
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
      let sDia, sMes, sAnio, sMesSig, sFechaCreado;    
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
        if(sDia+1<10){this.sFechaManiana=sAnio+'-'+sMes+'-0'+(sDia+1) }
        if(sDia+2<10){ this.sFechaPasado=sAnio+'-'+sMes+'-0'+(sDia+2) }
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
          this.notaForm.controls.txtFechaEntrega.setValue(this.sFechaPasado); 
          this.dFechaOperMov=(this.sFechaManiana)
          if(dDateNow.getDay()==6 || dDateNow.getDay()==0){            
            this.notaForm.controls.txtFechaEntrega.setValue(this.sFechaTraspasado);
           
          }

          sFechaCreado=this.fnConvertirFecha(this.sFechaHoy,2)
          this.notaForm.controls.txtFechaCreado.setValue(sFechaCreado)
        }
        
      await this.fnValidarFechas();

    }
    //#endregion Validar Fecha Actual

    //#region Validar Fecha por Parametros
    async fnValidarFechas(){
      let sCadenaBloqueoDia, sCadenaHora;
      let dDateNow, dTiempoTermino;
      dDateNow= new Date(this.dFechaActual)      
      const pParametro = [];
      pParametro.push(this.sPais);           
            
      const pParametroDet = [];

      this.valorParamFecha = await this.notasLogisticaService.
      fnControlNotaTraslado( 1, 2, pParametro, 13 , pParametroDet, this.url)
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
                  this.notaForm.controls.txtFechaEntrega.setValue(this.sFechaTraspasado);
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
              this.disableDateList.push(this.sFechaHoy,this.sFechaManiana)                   
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
        }
        //#endregion
        
        //#region Caso 7 -- Cuando dan minutos para cierre
        if(this.cboParamFecha[0].bCierreAutomatico==true){ 
                       
          var sHoraCierre = this.cboParamFecha[0].dInicioCierreAuto.substring(11);
          sCadenaHora=sHoraCierre.split(':', 2)           
          var sHora=parseInt(sCadenaHora[0]);            
          var sMinutos= parseInt(sCadenaHora[1])+parseInt(this.cboParamFecha[0].nCierreAutoTiempo)
          if(sMinutos>60) {sHora=sHora+1; sMinutos=sMinutos-60}
       
          if(this.fnCompararHoras(sHora,sMinutos)==true){
            this.fnPresupuestosPermitidos();         
            dTiempoTermino= new Date(
              dDateNow.getFullYear(),dDateNow.getMonth(),dDateNow.getDate(),     //Fecha Hoy 
              sHora,sMinutos,0)   //Hora Cierre
              
            this.fnTiempoCierre(dDateNow,dTiempoTermino);
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
        var fechaTras =  new Date(this.notaForm.get('txtFechaEntrega').value);

        if(this.bCreaPrimera){
          if(fechaTras.getDay()==6 && this.nDiaSabado==6){
            fechaTras.setDate(fechaTras.getDate() + 1);
            this.notaForm.get('txtFechaEntrega').setValue(fechaTras)
  
          }
          if(fechaTras.getDay()==0 && this.nDiaDomingo==0){
            fechaTras.setDate(fechaTras.getDate() + 1);
            this.notaForm.get('txtFechaEntrega').setValue(fechaTras)
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
    let dFechaOperMov, bTodoDia, sHora, nIdDestinatario, nIdTipoEnvio, 
    sObservacionNota, nIdUsrRegNota;
    let nIdPuntoRecojo,nIdPuntoRecuperacion, nIdPuntoLlegada, nIdDestino
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
  
    if(await this.fnEvaluarPresPermitidos()==false ){      
      bPermitidos=false
      Swal.fire('¡Verificar!', `El presupuesto seleccionado no está disponible.`, 'warning')     
      return false;
    }

    if(this.fnValidarRegistro()!=false && this.fnValidarHoraEntrega()!=false && bPermitidos==true &&
    await this.fnValidarSaldoDistribucionPesoVolumen()!=false ){
    
      const res = await this.fnValidarPresupuestoCliente();
      if(res.nEsCorrecto==0){
        Swal.fire('¡Verificar!', res.sMensaje, 'warning')     
        return;
      }

      //Validando cada presupuesto
      var validar = await this.fnValidarPresupuestoActivo()
      if(!validar){
        return;
      }

      //Validando cada presupuesto
      var validarDestino = await this.fnValidarPresupuestoDestinoActivo()
      if(!validarDestino){
        return;
      }
      
      //if(await !this.fnValidarSaldoDistribucionPesoVolumen()){ return; }

      var resp = await Swal.fire({      
        title: "¿Desea guardar el documento?",
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
                    
        this.nIdCentroCosto=this.notaForm.get('txtPresupuestoOrigen').value
        this.nIdCentroCostoDestino=this.notaForm.get('txtPresupuestoDestino').value
        
        dFechaOperMov=this.dFechaOperMov
        bTodoDia=this.notaForm.get('btnTodoDia').value
        sHora=this.notaForm.get('opcHora').value

        nIdPuntoRecojo=this.notaForm.get('txtPuntoRecojo').value
        nIdPuntoRecuperacion=this.notaForm.get('txtPuntoRecuperacion').value
        
        nIdPuntoLlegada=this.notaForm.get('txtPuntoLlegada').value
        nIdDestino=this.notaForm.get('txtDestino').value

        nIdDestinatario=this.notaForm.get('txtDestinatario').value

        nIdTipoEnvio=this.notaForm.get('opcTipoMovil').value
        sObservacionNota=this.notaForm.get('txtObservacion').value
        sObservacionNota=this.notaForm.get('txtObservacion').value
        nIdUsrRegNota=this.nIdUsuario
     
      this.fnConfirmarLineas();

      const pParametro = [];

      pParametro.push(this.sPais,this.nIdUsuario);
      pParametro.push(this.nIdCentroCosto);
      pParametro.push(this.nIdCentroCostoDestino);      
      pParametro.push(dFechaOperMov,bTodoDia,sHora);
      pParametro.push(nIdPuntoRecojo,nIdPuntoRecuperacion);
      pParametro.push(nIdPuntoLlegada,nIdDestino); 
      pParametro.push(nIdDestinatario); 
      pParametro.push(nIdTipoEnvio,sObservacionNota);                  
      pParametro.push(this.nIdSucursalGasto)
      pParametro.push(this.nIdPartidaGasto) 
      pParametro.push(this.nPrecioEstandar) 
      pParametro.push(this.sMensajeError)	 
      pParametro.push(this.nIdOperMov)
      pParametro.push(this.nIdTipoVehiculo) 
      pParametro.push(this.nIdGastoCosto)	
      
      var pParametroDet = [];
      pParametroDet=this.listaArticulos;
      
      this.notasLogisticaService.
      fnControlNotaTraslado( 1, this.pOpcion, pParametro, 1 , pParametroDet, this.url)
      .then(res => {
        
        if(res[0]>0) {
          Swal.fire({
            icon: 'success',
            title: 'Se guardó correctamente.',
            timer:3000
          });
          this.nIdOperMov = res[0];
          this.vbtnCancelar = false;
          if(this.pOpcion == 1){
            this.pOpcion = 3;
          }            
          this.fnCargarCabecera();
           
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

  //Validar que los clientes de los presupuestos sean los mismos
  async fnValidarPresupuestoCliente(){
    try{
    this.spinner.show();
    const pParametro = [];
    pParametro.push(this.notaForm.get('txtPresupuestoOrigen').value);           
    pParametro.push(this.notaForm.get('txtPresupuestoDestino').value);           
          
    const pParametroDet = [];
    const resultado = await this.notasLogisticaService.fnControlNotaTraslado( 1, 2, pParametro, 18 , pParametroDet, this.url)
    this.spinner.hide();
    return resultado[0];
    }catch(err){
      this.spinner.hide();
      throw err;
    }
  }

  fnValidarSabado(){
    var dFechaEntrega= new Date(this.notaForm.get('txtFechaEntrega').value)
    if(dFechaEntrega.getDay()==6 && this.nDiaSabado!=null){
      return true;
    }
    return false;
  }

  fnValidarDomingo(){
    var dFechaEntrega= new Date(this.notaForm.get('txtFechaEntrega').value)
    if(dFechaEntrega.getDay()==0 && this.nDiaDomingo!=null){
      return true;
    }
    return false;
  }
  
  //#region Cargar Cabecera y Detalle
  async fnCargarCabecera(){
    this.vbtnGuardar=false;    
    this.vbtnModificar=true;
    this.vbtnEnviar=true

    const pParametro = [];
    pParametro.push(this.nIdOperMov);           
          
    const pParametroDet = [];

    this.notasLogisticaService.
    fnControlNotaTraslado( 1, 2, pParametro, 10 , pParametroDet, this.url)
    .then((data: any) => {    
      
      
      this.nEstadoNota=data[0].nEstadoNota;
      if(this.nEstadoNota==2226){
        this.vbtnModificar=false;
        this.vbtnEnviar=false;
      }
      
      this.nIdCentroCosto=data[0].nIdCentroCosto
      this.nIdCentroCostoDestino=data[0].nIdCentroCostoDestino
      
      this.notaForm.controls.txtSolicitante.setValue(data[0].sSolicitante);
      this.notaForm.controls.txtFechaEntrega.setValue(data[0].dFechaOperMov);  
      this.dFechaOperMov=this.fnConvertirFecha(data[0].dFechaOperMov,1)
            
      this.notaForm.controls.opcHora.setValue(data[0].sHora);  
      this.notaForm.controls.btnTodoDia.setValue(data[0].bTodoDia); 

      
      this.nIdPuntoRecojo=data[0].nIdPuntoRecojo
      this.nIdPuntoRecuperacion=data[0].nIdPuntoRecuperacion

      this.nIdPuntoLlegada=data[0].nIdPuntoLlegada
      this.nIdDestino=data[0].nIdDestino
     
      this.nIdDestinatario=data[0].nIdDestinatario
 
      this.vCentroCosto = {
        nId:data[0].nIdCentroCosto,
        sDescripcion: data[0].sCentroCosto,
      }

      this.vCentroCostoDestino = {
        nId:data[0].nIdCentroCostoDestino,
        sDescripcion: data[0].sCentroCostoDestino,
      }

      this.fnObtenerPresupuestos();
      
      this.fnObtenerEntidad();
      this.notaForm.controls.opcMovil.setValue(data[0].nIdMovil);
      this.nIdTipoEnvio=data[0].nIdTipoEnvio;
      
      this.fnObtenerMovilidad();
      
      this.notaForm.controls.txtObservacion.setValue(data[0].sObservacionNota);

      this.notaForm.controls.txtDocumento.setValue(data[0].sDocumento);        
      this.notaForm.controls.txtCreado.setValue(data[0].sNombreCreador);  
      this.notaForm.controls.txtFechaCreado.setValue(data[0].sFechaCreado);
      this.notaForm.controls.txtEstado.setValue(data[0].sEstadoNota);  
            
      this.fnDeshabilitarControles();

      this.fnCargarLineas();
            
    }, error => {
      console.log(error);
    });

  }


  fnCargarLineas(){
    
    const pParametro = [];
    pParametro.push(this.nIdOperMov);           
          
    const pParametroDet = [];

    this.notasLogisticaService.
    fnControlNotaTraslado( 1, 2, pParametro, 11 , pParametroDet, this.url)
    .then((data: any) => {
      
      
      this.listaDetalle=data;
      
      this.detNotaTableData = new MatTableDataSource(this.listaDetalle);
      this.detNotaTableData.paginator = this.detNotaPaginator; 

      this.fnCalcularTotales();     
            
    }, error => {
      console.log(error);
    });


  }
  //#endregion Cargar Cabecera y Detalle

  //#region Controles
  fnDeshabilitarControles(){
    this.notaForm.get('txtPresupuestoOrigen').disable();
    this.notaForm.get('txtPresupuestoDestino').disable();
    this.notaForm.get('txtFechaEntrega').disable();
    this.notaForm.get('btnTodoDia').disable();
    this.notaForm.get('opcHora').disable(); 

    this.notaForm.get('txtPuntoRecojo').disable();
    this.notaForm.get('txtPuntoRecuperacion').disable();
    this.notaForm.get('txtPuntoLlegada').disable();    
    this.notaForm.get('txtDestino').disable();

    this.notaForm.get('txtDestinatario').disable();

    this.notaForm.get('opcMovil').disable();
    this.notaForm.get('opcTipoMovil').disable();
    this.notaForm.get('txtObservacion').disable();
  }


  fnHabilitarControles(){
    
    this.notaForm.get('txtFechaEntrega').enable();
    if(this.notaForm.get('btnTodoDia').value==true){      
      this.notaForm.get('btnTodoDia').enable();
    }    
    else{
      this.notaForm.get('opcHora').enable();
    }         

    this.notaForm.get('txtPuntoRecojo').enable();
    this.notaForm.get('txtPuntoRecuperacion').enable();
    this.notaForm.get('txtPuntoLlegada').enable();    
    this.notaForm.get('txtDestino').enable();
    this.notaForm.get('txtPresupuestoDestino').enable();
    this.notaForm.get('txtDestinatario').enable(); 
    this.notaForm.get('txtObservacion').enable();
  }
  //#endregion Controles

  //#region Modificar
  fnActivarModificar(){
    this.vbtnModificar=false;  
    this.vbtnEnviar=false;
    this.vbtnGuardar=true;
    this.vbtnCancelar=true;
    this.fnHabilitarControles();
  }
  //#endregion Modificar

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

    if(await this.fnEvaluarPresPermitidos()==false){      
      bPermitidos=false
      Swal.fire('¡Verificar!', `El presupuesto seleccionado no está disponible.`, 'warning')     
      return false;
    }
    
    if(this.fnValidarFechaEnvio()!=false && bPermitidos==true &&
    await this.fnValidarSaldoDistribucionPesoVolumen()!=false){

      const res = await this.fnValidarPresupuestoCliente();
      if(res.nEsCorrecto==0){
        Swal.fire('¡Verificar!', res.sMensaje, 'warning')     
        return;
      }
      
      //Validando cada presupuesto
      var validar = await this.fnValidarPresupuestoActivo()
      if(!validar){
        return;
      }

      //Validando cada presupuesto
      var validarDestino = await this.fnValidarPresupuestoDestinoActivo()
      if(!validarDestino){
        return;
      }

      //if(await !this.fnValidarSaldoDistribucionPesoVolumen()){ return; }

      var resp = await Swal.fire({
        
        title: "¿Desea enviar la nota a Logística?",
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
      pParametro.push(this.nIdOperMov); 
      pParametro.push(this.nIdUsuario); 
      pParametro.push(this.sPais);           
      pParametro.push(this.nIdGastoCosto);
      pParametro.push(this.nPrecioEstandar);
      pParametro.push(this.nIdTipoVehiculo); 
  
      const pParametroDet = [];

      this.notasLogisticaService.
      fnControlNotaTraslado( 1, 3, pParametro, 2 , pParametroDet, this.url)
      .then(res=> {
        
        if(res[0]==0){
          Swal.fire({
            icon: 'error',
            title: 'No se pudo enviar.'
          });
          return false;
        }

        else {
          Swal.fire({
            icon: 'success',
            title: 'Se envió correctamente.',
            timer:3000
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
          
         if(ts.value>0){        
          this.bCountdown=false;    
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

  //#region Abrir visor de historial
  fnAbrirVisorHistorialNota(): void  {
    const dialogRef = this.dialog.open(NotaHistorialComponent, {
      width: '80%',
      data: {
        'idNota': this.nIdNota
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
        
    comboPresupuestoPerm = await this.notasLogisticaService.fnControlNotaTraslado( 1, 2, pParametro, 16 , pParametroDet, this.url)
    this.cboPresupestoPermitidos=comboPresupuestoPerm;
  

  }
  //#endregion Obtener Presupuestos

  //#region Evento Elegir Presupuestos desde Fecha
  async eventFechaPresupuestos(nIdCentroCostoOrigen){
    let bCondicionFecha=false;

    this.nIdCentroCosto=nIdCentroCostoOrigen
  
    if( (this.bNotaMismoDia==true && this.dFechaOperMov==this.sFechaHoy)  ||
        (this.bCierreAutomatico==true && this.dFechaOperMov==this.sFechaManiana) )
    {
      bCondicionFecha=true
    }

    //Al crear o Modificar
    //Caso : Si es el mismo dia

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
          this.dFechaOperMov=this.sFechaManiana;
          this.notaForm.controls.txtFechaEntrega.setValue(this.sFechaPasado);
          if(this.pOpcion==1){
          this.notaForm.controls.txtPresupuestoOrigen.setValue(this.nIdCentroCostoAnterior);  
          }
          return;
        }

        await this.fnInicializarDetalle();     
        this.notaForm.controls.txtPresupuestoOrigen.setValue('');  
        if(this.pOpcion==3){
          this.notaForm.get('txtPresupuestoOrigen').enable();
        }             
                  
      }

    }
            
    this.nIdCentroCostoAnterior=nIdCentroCostoOrigen
      
  }
  //#endregion

  //#region Evaluar Presupuestos Permitidos
  async fnEvaluarPresPermitidos(){
    let bCondicion=false, nIdCentroCosto;    
    let bCondicionFecha=false;

    if( (this.bNotaMismoDia==true && this.dFechaOperMov==this.sFechaHoy)  ||
        (this.bCierreAutomatico==true && this.dFechaOperMov==this.sFechaManiana) )
    {
      bCondicionFecha=true
    }

    nIdCentroCosto=this.notaForm.get('txtPresupuestoOrigen').value;

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

  //#region Limpiar Articulos
  async fnLimpiarArticulos(nIdParametro){
    let bCondicionFecha=false;

    this.nIdCentroCosto=nIdParametro

    if( (this.bNotaMismoDia==true && this.dFechaOperMov==this.sFechaHoy)  ||
        (this.bCierreAutomatico==true && this.dFechaOperMov==this.sFechaManiana) )
    {
      bCondicionFecha=true
    }

    if(this.listaDetalle.length>0){
      var resp = await Swal.fire({
        title: '¿Desea continuar?',
        text: 'Si cambia de presupuesto se reiniciará la lista de artículos.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText:'Cancelar'
      })
  
      if (!resp.isConfirmed) {      
        
        this.notaForm.controls.txtPresupuestoOrigen.setValue(this.nIdCentroCostoAnterior);
                      
        return;
      }

      this.fnInicializarDetalle(); 
        
    }
    
      this.nIdCentroCostoAnterior=nIdParametro

      if(bCondicionFecha){
        if(await this.fnEvaluarPresPermitidos()==false){
          this.notaForm.controls.txtPresupuestoOrigen.setValue('');
          Swal.fire({
            icon: 'warning',
            title: '¡Verificar!',
            text: 'El presupuesto seleccionado no está disponible.'
          });
          return false;
        }
      }

  }
  //#endregion

  //#region Traer Tipo CC
  async fnTraerTipoCC(nIdCentroCosto){
    try{
      const pParametro = [];
      pParametro.push(nIdCentroCosto);           
            
      const pParametroDet = [];
      const resultado = await this.notasLogisticaService.fnControlNotaTraslado( 1, 2, pParametro, 19 , pParametroDet, this.url)
      var res = resultado[0];
      //Si es un costo fijo se bloquea el presupuesto destino y se pone el mismo centro costo
      if(res.nIdTipoCC==2033){
        this.notaForm.controls.txtPresupuestoDestino.setValue(nIdCentroCosto);
        this.notaForm.controls.txtPresupuestoDestino.disable();   
      }else{
        this.notaForm.controls.txtPresupuestoDestino.enable();  
      }
      }catch(err){
        throw err;
      }
  }
  //#endregion

  //#region Validar que el presupuesto este activo
  async fnValidarPresupuestoActivo(){
    try{
      this.spinner.show();
      const pParametro = [];
      pParametro.push(this.notaForm.get('txtPresupuestoOrigen').value);           
            
      const pParametroDet = [];
      const resultado = await this.notasLogisticaService.fnControlNotaUtiles( 1, 2, pParametro, 14 , pParametroDet, this.url)
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
        return false; 
      }
  }

  async fnValidarPresupuestoDestinoActivo(){
    try{
      this.spinner.show();
      const pParametro = [];
      pParametro.push(this.notaForm.get('txtPresupuestoDestino').value);           
            
      const pParametroDet = [];
      const resultado = await this.notasLogisticaService.fnControlNotaUtiles( 1, 2, pParametro, 14 , pParametroDet, this.url)
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
        return false; 
      }
  }
  //#endregion

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
