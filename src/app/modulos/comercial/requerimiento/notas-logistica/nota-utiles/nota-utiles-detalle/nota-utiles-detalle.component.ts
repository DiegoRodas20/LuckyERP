import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
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

// Validacion Error
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
  selector: 'app-nota-utiles-detalle',
  templateUrl: './nota-utiles-detalle.component.html',
  styleUrls: ['./nota-utiles-detalle.component.css'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ],
  animations: [asistenciapAnimations]
})
export class NotaUtilesDetalleComponent implements OnInit {
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

  //Variables del Formulario
  nIdOperMov:number
  dFechaOperMov:any
  nIdCentroCosto:number         //Presupuesto de Notas Utiles
  nIdCentroCostoDestino:number  //Presupuesto en Pantalla
  nEstadoNota:number
  nIdCentroCostoAnterior:number

  //Combos de Formulario
  cboHoras:any
  cboPresupuesto=[]
  cboParamFecha=[]

  //Variables Detalle
  sRutaImagen:string
  sArticulo:string
  nPesoDetalle:number
  nVolumenDetalle:number
  nFilaEditada:number
  bEditarDetalle:boolean = false;
 
  //Combos Detalle
  cboArticulo=[]
  cboPesoVol=[]
  listaDetalle=[]
  listaArticulos=[]
  listaDatosArt=[]
  cboPresupestoPermitidos=[]
  listaDetalleSeleccion:any

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

  //Variables de estado de botones
  vModifica:boolean = true;
  vbtnGuardar:boolean   = false;
  vbtnModificar:boolean = false;
  vbtnCancelar:boolean  = false;
  vbtnAprobar:boolean   = false;
  vbtnDevolver:boolean  = false; 
  vbtnEnviar:boolean  = false; 
  vbtnDuplicar:boolean  = false; 
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
  ['pEstado','sArticulo','sPartida', 'sMedida', 'sLote', 'sFechaVence','nStockActual', 'nCantidad', 'nPesoDetalle', 'nVolumenDetalle', 'sObservacionDet'];

  @ViewChild('modalArticulo') modalArticulo: ElementRef;

  @ViewChild('modalImagen') modalImagen: ElementRef;

  matcher = new MyErrorStateMatcher();
  disableDateList: Array<any> = [];


  //#endregion

  //Variable que almacena y pusheaa a la lista de CC, al guardar se validara si el CC esta activo
  vCentroCostoDestino;
  
  //Variable para que setee la fecha solo la primera vez que crea
  bCreaPrimera: boolean = false;

  //Variable para ver si en el paise que esta el usuario se permite crear salidas en automatico en base a una NU
  bNuEnvioAuto: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    @Inject('BASE_URL') baseUrl: string,
    private notasLogisticaService: NotasLogisticaService, 
    public dialog: MatDialog,
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

  async ngOnInit(): Promise<void> {
   
    //Inicializar variables del sistema
    this.sPais = localStorage.getItem('Pais');
    this.nIdEmpresa = localStorage.getItem('Empresa');
    const user = localStorage.getItem('currentUser');
    this.nIdUsuario = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.sNombreUsuario = JSON.parse(window.atob(user.split(".")[1])).uno;

    this.notaForm = this.formBuilder.group({      
      txtSolicitante: [''],         
      txtPresupuestoDestino:['',Validators.required],
      btnTraslado :[false],  
      txtFechaEntrega: ['',Validators.required],      
      btnTodoDia:[false],
      opcHora: [''],
      txtObservacion: [''],
      txtTotalUnidades: [''],
      txtTotalPeso: [''],
      txtTotalVolumen: [''],
        
      //Auditoria
      txtDocumento: [''],
      txtEstado: [''],
      txtCreado: [''],
      txtFechaCreado: ['']

    }); 
    this.onToggleFab(1, -1)

    this.fnIniciarFormDetalle();

    this.spinner.show('spiDialog');
    await this.fnObtenerFechaActual(); 
    
    this.fnPresupuestoNU();
    this.fnObtenerPresupuestos();
    

    if(this.pOpcion==1){
      this.vbtnGuardar=true
      this.bCreaPrimera=true
      this.notaForm.controls['txtCreado'].setValue(this.sNombreUsuario);    
      this.notaForm.controls['txtEstado'].setValue('Incompleto');
      this.fnObtenerSolicitante();
      if(!this.bNotaMismoDia){
        this.notaForm.controls['btnTraslado'].setValue(true);
        this.notaForm.controls['btnTraslado'].disable();
        
      }
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
      txtArticulo:['',Validators.required],
      txtTipoLote:[''],
      nIdControlLote:['',Validators.required],
      nIdPartida:[''],    
      txtCodPartida:[''],
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

  //#endregion

  //#region Obtener solicitante
  async fnObtenerSolicitante(){
    let sSolicitante;
    const pParametro = [];
    pParametro.push(this.nIdUsuario);
    const pParametroDet = [];
        
    sSolicitante = await this.notasLogisticaService.fnControlNotaUtiles( 1, 2, pParametro, 2 , pParametroDet, this.url)

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
        
    comboPresupuesto = await this.notasLogisticaService.fnControlNotaUtiles( 1, 2, pParametro, 3 , pParametroDet, this.url)
    this.cboPresupuesto=comboPresupuesto;
   
    if(this.vbtnGuardar==false){
      //Si no esta activo el presupuesto de la cabecera lo agregamos a la lista
      if(this.cboPresupuesto.findIndex(item=> item.nId==this.vCentroCostoDestino?.nId)==-1 && this.vCentroCostoDestino!=null){
        this.cboPresupuesto.push(this.vCentroCostoDestino);
      }
      this.notaForm.controls['txtPresupuestoDestino'].setValue(this.nIdCentroCostoDestino);     
    }

  }
  //#endregion Obtener Presupuestos
  
  //#region Obtener Presupuesto Nota Util
   async fnPresupuestoNU(){
    let nIdCentroCosto;
    const pParametro = [];
    pParametro.push(this.nIdEmpresa);
    const pParametroDet = [];
        
    nIdCentroCosto = await this.notasLogisticaService.fnControlNotaUtiles( 1, 2, pParametro, 4 , pParametroDet, this.url)
    this.nIdCentroCosto=nIdCentroCosto.datos
    
  }
  //#endregion Obtener Presupuesto Nota Util
  
  //#region Obtener Articulos
  async fnObtenerArticulos(){
    let comboArticulo;    
    
    const pParametro = [];    
    pParametro.push(this.sPais);
    const pParametroDet = [];

    comboArticulo = await this.notasLogisticaService.fnControlNotaUtiles( 1, 2, pParametro, 7 , pParametroDet, this.url)
    this.cboArticulo=comboArticulo;
    
  }
  //#endregion Obtener Articulo

  //#region Obtener Data de Artículos

    //#region Datos Generales del Artículo
    fnObtenerDatoArticulo(nParametro){
      let nIdArticulo, nIdTipoLote;

      if(this.cboArticulo.length>0){  
        for (let i = 0; i < this.cboArticulo.length; i++) {        
          if(this.cboArticulo[i].nIdArticulo==nParametro){        
            this.sArticulo=this.cboArticulo[i].sDescripcion;         
            this.detalleForm.controls.nIdControlLote.setValue(this.cboArticulo[i].nIdControlLote);
            this.detalleForm.controls.txtTipoLote.setValue(this.cboArticulo[i].sControlLote);
            this.detalleForm.controls.nIdPartida.setValue(this.cboArticulo[i].nIdPartida);
            this.detalleForm.controls.txtCodPartida.setValue(this.cboArticulo[i].sCodigoPartida);
            this.detalleForm.controls.txtUnidadMedida.setValue(this.cboArticulo[i].sCodUndMedida);             
            this.sRutaImagen=this.cboArticulo[i].sRutaArchivo

          }
        }
      }
      
      this.detalleForm.get('txtCantidad').enable();
        
      nIdArticulo = this.detalleForm.get('txtArticulo').value;
      nIdTipoLote = this.detalleForm.get('nIdControlLote').value;
      
      const pParametro = [];
      
      pParametro.push(this.nIdCentroCosto);
      pParametro.push('');//(this.nIdAlmacen);
      pParametro.push(nIdArticulo);
      pParametro.push(nIdTipoLote);
        
      const pParametroDet = [];
      
      this.notasLogisticaService.
      fnControlNotaUtiles( 1, 2, pParametro, 8 , pParametroDet, this.url)
      .then((data: any) => {
      
        const stock = data;
        var vArticuloStock, sMensajeFV;
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
                Swal.fire('¡Verificar!', `El artículo seleccionado no tiene saldo disponible`, 'warning')
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
              if(lArticuloStock[i].sFechaVence.length>0){sMensajeFV=' y vencimiento: '+ lArticuloStock[i].sFechaVence}
              else {sMensajeFV=''}
              Swal.fire('¡Verificar!', 
                        `El artículo seleccionado con lote: ${lArticuloStock[i].sLote}${sMensajeFV}
                        , ya se encuentra registrado,
                        favor de retirar todas las unidades, antes de sacar otro lote.`,
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
          Swal.fire('¡Verificar!', `El artículo seleccionado no tiene saldo disponible`, 'warning').then(() => {
            this.fnIniciarFormDetalle();
          });          
        }
              
      }, error => {
        console.log(error);
      });

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

      comboPesoVolumen = await this.notasLogisticaService.fnControlNotaUtiles( 1, 2, pParametro, 9 , pParametroDet, this.url)
      this.cboPesoVol = comboPesoVolumen; 
      
      this.nPesoDetalle=this.cboPesoVol[0].nPesoDetalle
      this.nVolumenDetalle=this.cboPesoVol[0].nVolumenDetalle
      
    }
    //#endregion Obtener Peso y Volumen

  //#endregion Obtener Data de Artículos

  //#region Validaciones

    //#region Validacion Hora
    fnValidarHoraEntrega(){
      
      if(this.notaForm.get('btnTodoDia').value==true){
        this.notaForm.controls['opcHora'].setValue('T.Dia'); 
      }
      
      if(this.notaForm.get('btnTodoDia').value==false  &&
        (this.notaForm.get('opcHora').value=='' || this.notaForm.get('opcHora').value==0 ))
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
          text: 'Elegir cantidad menor a Stock Actual.' 
        });
        this.spinner.hide()
        return false;
      }
    }
    //#endregion Validar Saldo

    //#region Validar Abrir Modal
    fnValidarAbrirModal(){
      if(this.notaForm.get('txtPresupuestoDestino').hasError('required')==true){
        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: 'Elegir Presupuesto antes de agregar artículos.' 
        });
        return false;
      }     
    }
    //#endregion

    //#region Validar Registro
    fnValidarRegistro(){
    
      let bCondicionFecha=true;

      //recorrer las fechas bloqueadas
      //Si this.dFechaOperMov = Alguna de las fechas bloqueadas -> false
      
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
      else if(this.notaForm.invalid){        
        Swal.fire({
         icon: 'warning',
         title: '¡Verificar!',
         text: 'Existen datos obligatorios para agregar en el detalle.' 
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

    //#region Validar Fecha al Enviar
    fnValidarFechaEnvio(){      
      let dFechaEntrega, dFechaMinima, dFechaHoy;
      let bCondicionFecha=true;

      dFechaEntrega= new Date(this.notaForm.get('txtFechaEntrega').value)


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
      }
     
      
      if(dFechaEntrega<dFechaMinima){        
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

      sDatoFecha = await this.notasLogisticaService.fnControlNotaUtiles( 1, 2, pParametro, 5 , pParametroDet, this.url)
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
               
        if(this.notaForm.get('txtPresupuestoDestino').value!=''){    
          this.eventFechaPresupuestos(this.notaForm.get('txtPresupuestoDestino').value)
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
      fnControlNotaRecojo( 1, 2, pParametro, 13 , pParametroDet, this.url)
      this.cboParamFecha=this.valorParamFecha

          
        this.disableDateList=[]
        this.bNotaMismoDia=this.cboParamFecha[0].bNotaMismoDia
        this.bCierreAutomatico=this.cboParamFecha[0].bCierreAutomatico

        this.bNuEnvioAuto=this.cboParamFecha[0].bNuEnvioAuto

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
    
  //#region  Detalle Modal
    
    //#region Abrir Modal Nuevo
      btnAgregarLineaDetalle(){    
        this.bEditarDetalle=false;        
        if(this.fnValidarAbrirModal()!=false){
          this.fnObtenerArticulos();

          this.fnIniciarFormDetalle();
         
          this.modalArticulo.nativeElement.click();
        }
      }
    //#endregion

    //#region Agregar Detalle modal
    async fnAgregarListaDetalle(){    
      this.spinner.show()

      var nCantidadDetalle;
      
      await this.fnObtenerPesoVol();

      if(this.fnValidarModal()!=false && this.fnValidarStock()!=false &&
        await this.fnValidarSaldoAgregar()!=false ){

        nCantidadDetalle=this.detalleForm.get('txtCantidad').value

        var vCantidadTope =  await this.fnValidarTopeSolicitud(this.detalleForm.get('txtArticulo').value);
        var nCantidadArticulo = nCantidadDetalle;
        this.listaDetalle.forEach(item=>{
          if(item.nArticulo==this.detalleForm.get('txtArticulo').value){
            nCantidadArticulo+=item.nCantidad;
          }
        })

        if(vCantidadTope.nCantidadTope!=-1 && nCantidadArticulo>(vCantidadTope.nCantidadTope-vCantidadTope.nCantidadSolicitada)){
          Swal.fire('¡Verificar!', `El artículo supera la cantidad máxima en el mes y año seleccionado con el cliente: ${vCantidadTope.sCliente},
                                    Cantidad maxíma por mes: ${vCantidadTope.nCantidadTope},
                                    Cantidad solicitada: ${vCantidadTope.nCantidadSolicitada}.`, 'warning');
          this.spinner.hide()
          return;   
        }
      
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
              sObservacionDet:this.detalleForm.get('txtObservacionDetalle').value,
              nIdPartida     :this.detalleForm.get('nIdPartida').value,
              sPartida       :this.detalleForm.get('txtCodPartida').value});

        this.tablaDetalle(this.listaDetalle)
        this.fnCalcularTotales();
        this.fnIniciarFormDetalle();

        this.spinner.hide()
      }  
    }

    tablaDetalle(listaDetalle: any[]) {
        this.detNotaTableData = new MatTableDataSource(listaDetalle);
        this.detNotaTableData.paginator = this.detNotaPaginator; 
        this.detNotaTableData.sort = this.detNotaSort;
    }

    //#endregion

    //#region Abrir Modal Edición
    async btnEditarDetalle(i, row){
      
      if(await this.fnValidarFifoEditar(row)!=false){

        this.modalArticulo.nativeElement.click();

        this.bEditarDetalle=true;
        this.listaDetalleSeleccion=row;       

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
        this.detalleForm.controls.nIdPartida.setValue(row.nIdPartida);                        
   
        this.detalleForm.controls['txtCantidad'].setValue(row.nCantidad);   
        this.detalleForm.get('txtCantidad').enable();
        this.detalleForm.get('txtArticulo').disable();
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
      var nCantidadDetalle

      i=this.nFilaEditada;

      await this.fnObtenerPesoVol();

      if(this.fnValidarModal()!=false && this.fnValidarStock()!=false &&
        await this.fnValidarSaldoAgregar()!=false){
      
      nCantidadDetalle=this.detalleForm.get('txtCantidad').value;
      
      
      var vCantidadTope =  await this.fnValidarTopeSolicitud(this.detalleForm.get('txtArticulo').value);
      var nCantidadArticulo = nCantidadDetalle - this.listaDetalle[i].nCantidad;
      this.listaDetalle.forEach(item=>{
        if(item.nArticulo==this.detalleForm.get('txtArticulo').value){
          nCantidadArticulo+=item.nCantidad;
        }
      })

      if(vCantidadTope.nCantidadTope!=-1 && nCantidadArticulo>(vCantidadTope.nCantidadTope-vCantidadTope.nCantidadSolicitada)){
        Swal.fire('¡Verificar!', `El artículo supera la cantidad máxima en el mes y año seleccionado con el cliente: ${vCantidadTope.sCliente},
                                  Cantidad maxíma por mes: ${vCantidadTope.nCantidadTope},
                                  Cantidad solicitada: ${vCantidadTope.nCantidadSolicitada}.`, 'warning');
        return;   
      }
            this.listaDetalle[i].sArticulo=      this.sArticulo
            this.listaDetalle[i].nArticulo=      this.detalleForm.get('txtArticulo').value
            this.listaDetalle[i].sMedida=        this.detalleForm.get('txtUnidadMedida').value
            this.listaDetalle[i].sLote=          this.detalleForm.get('txtLote').value
            this.listaDetalle[i].nIdTipoLote=     this.detalleForm.get('nIdControlLote').value
            this.listaDetalle[i].sFechaIngreso=  this.detalleForm.get('txtFechaIngreso').value
            this.listaDetalle[i].sFechaVence=    this.detalleForm.get('txtFechaVencimiento').value
            this.listaDetalle[i].nStockActual=   this.detalleForm.get('txtStockActual').value
            this.listaDetalle[i].nPrecioUnidad=  this.detalleForm.get('txtPrecioUnidad').value
            this.listaDetalle[i].nCantidad=      Math.round(nCantidadDetalle)
            this.listaDetalle[i].nPesoDetalle=   this.nPesoDetalle
            this.listaDetalle[i].nVolumenDetalle=this.nVolumenDetalle
            this.listaDetalle[i].sObservacionDet=this.detalleForm.get('txtObservacionDetalle').value;
            this.listaDetalle[i].nIdPartida     =this.detalleForm.get('nIdPartida').value;
            this.listaDetalle[i].sPartida       =this.detalleForm.get('txtCodPartida').value;

      this.detNotaTableData = new MatTableDataSource(this.listaDetalle);
      this.detNotaTableData.paginator = this.detNotaPaginator; 
      this.detNotaTableData.sort = this.detNotaSort; 

      this.fnCalcularTotales();

      //this.modalArticulo.nativeElement.click();
      this.fnIniciarFormDetalle();
      }
    }
    //#endregion

    //#region Confirmar Detalle-Modal
    fnConfirmarLineas(){
      
      for (let i = 0; i < this.listaDetalle.length; i++) {
        let listaTemporal=[]
        let sFechaIngreso, sFechaVence;
        
        sFechaIngreso=this.fnConvertirFecha(this.listaDetalle[i].sFechaIngreso,3)
        sFechaVence=this.fnConvertirFecha(this.listaDetalle[i].sFechaVence,3)

        listaTemporal.push( this.listaDetalle[i].nArticulo, 
                            this.listaDetalle[i].sLote,
                            sFechaIngreso,
                            sFechaVence,
                            this.listaDetalle[i].nCantidad,
                            this.listaDetalle[i].nPrecioUnidad,
                            this.listaDetalle[i].nStockActual,
                            this.listaDetalle[i].sObservacionDet,
                            this.listaDetalle[i].nIdPartida )
    
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
    async btnEliminarLineaDetalle(index,Obj){
      if(this.vbtnGuardar==true){
      
        var resp = await Swal.fire({
          title: '¿Desea continuar?',
          text: "Se eliminará el artículo seleccionado y sus lotes posteriores para mantener el orden de las fechas.",
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
        this.detNotaTableData = new MatTableDataSource(this.listaDetalle);
        this.detNotaTableData.paginator = this.detNotaPaginator; 
        this.detNotaTableData.sort = this.detNotaSort;
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
  
  //#region Guardar Formulario
  async fnGuardarFormulario(){
    let sMensaje, bPermitidos=true;
    this.bEstadoNuevo=false

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
  
    
    sMensaje='¿Desea guardar el documento?'
       
    if(await this.fnEvaluarPresPermitidos()==false ){      
      bPermitidos=false
      Swal.fire('¡Verificar!', `El presupuesto seleccionado no está disponible.`, 'warning')     
      return false;
    }
    
    if(this.fnValidarRegistro()!=false && this.fnValidarHoraEntrega()!=false  && bPermitidos==true &&
      await this.fnValidarSaldoGuardar()!=false && await this.fnValidarTopeGuardar()!=false){

      var resp = await Swal.fire({        
        title: sMensaje,
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

      let bSoloTraslado, dFechaOperMov, bTodoDia, sHora, 
          sObservacionNota, nIdUsrRegNota;
          
          this.nIdCentroCostoDestino=this.notaForm.get('txtPresupuestoDestino').value
          dFechaOperMov=this.dFechaOperMov 
          
          bSoloTraslado=this.notaForm.get('btnTraslado').value
          bTodoDia=this.notaForm.get('btnTodoDia').value
          sHora=this.notaForm.get('opcHora').value

          sObservacionNota=this.notaForm.get('txtObservacion').value
          nIdUsrRegNota=this.nIdUsuario
     
      this.fnConfirmarLineas();

      const pParametro = [];

      pParametro.push(this.sPais,this.nIdUsuario);
      pParametro.push(this.nIdCentroCosto);
      pParametro.push(this.nIdCentroCostoDestino);
      //pParametro.push(this.nIdAlmacen);
      pParametro.push(dFechaOperMov,bTodoDia,sHora);     
      pParametro.push(sObservacionNota,nIdUsrRegNota);
      pParametro.push(bSoloTraslado);
      pParametro.push(this.nIdOperMov)

      var pParametroDet = [];
      pParametroDet=this.listaArticulos;
      
      this.notasLogisticaService.
      fnControlNotaUtiles( 1, this.pOpcion, pParametro, 1 , pParametroDet, this.url)
      .then(res => {
        
        if(res[0]==0){
          Swal.fire({
            icon: 'error',
            title: 'No se pudo guardar.'
          });          
          return false
        }

        else {
        Swal.fire({
          icon: 'success',
          title: 'Se guardó correctamente.',
          timer:3000
        });

        this.nIdOperMov=res[0];
        this.vbtnDuplicar = false;

        this.fnCargarCabecera();
          if(this.pOpcion==1){
            this.pOpcion=3
          }
        }
  
              
      }, error => {
        console.log(error);
      });
    }
    
  }
  //#endregion Guardar Formulario

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
  fnCargarCabecera(){
    this.vbtnGuardar=false;    
    this.vbtnModificar=true;
    this.vbtnEnviar=true
  
    const pParametro = [];
    pParametro.push(this.nIdOperMov);           
          
    const pParametroDet = [];

    this.notasLogisticaService.
    fnControlNotaUtiles( 1, 2, pParametro, 10 , pParametroDet, this.url)
    .then((data: any) => {    
      
  
      this.nEstadoNota=data[0].nEstadoNota;
      if(this.nEstadoNota!= 2225)
      {
        this.vbtnDuplicar = true;
      }
      if(this.nEstadoNota==2226){
        this.vbtnModificar=false;
        this.vbtnEnviar=false;
      }
      
      this.nIdCentroCostoDestino=data[0].nIdCentroCostoDestino
      //this.nIdAlmacen=data[0].nIdAlmacen
      this.vCentroCostoDestino = {
        nId:data[0].nIdCentroCostoDestino,
        sDescripcion: data[0].sCentroCostoDestino,
      }
      this.notaForm.controls.txtFechaEntrega.setValue(data[0].dFechaOperMov);  
      this.dFechaOperMov=this.fnConvertirFecha(data[0].dFechaOperMov,1)
      
      this.notaForm.controls.txtSolicitante.setValue(data[0].sSolicitante);
      this.notaForm.controls.btnTraslado.setValue(data[0].bSoloTraslado);
      this.notaForm.controls.opcHora.setValue(data[0].sHora);  
      this.notaForm.controls.btnTodoDia.setValue(data[0].bTodoDia); 
           
      this.fnObtenerPresupuestos();
         
      this.notaForm.controls.txtObservacion.setValue(data[0].sObservacionNota);

      this.notaForm.controls.txtDocumento.setValue(data[0].sDocumento);        
      this.notaForm.controls.txtCreado.setValue(data[0].sNombreCreador);  
      this.notaForm.controls.txtFechaCreado.setValue(data[0].sFechaCreado);
      this.notaForm.controls.txtEstado.setValue(data[0].sEstadoNota);  
            
      this.fnDeshabilitarControles();

      this.fnObtenerArticulos();

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
    fnControlNotaUtiles( 1, 2, pParametro, 11 , pParametroDet, this.url)
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
    this.notaForm.get('txtPresupuestoDestino').disable();
    this.notaForm.get('txtFechaEntrega').disable();
    this.notaForm.get('btnTraslado').disable();
    this.notaForm.get('btnTodoDia').disable();
    this.notaForm.get('opcHora').disable(); 
    this.notaForm.get('txtObservacion').disable();
  }


  fnHabilitarControles(){
    
    this.notaForm.get('txtFechaEntrega').enable();   
    this.notaForm.get('btnTraslado').enable();   
    if(this.notaForm.get('btnTodoDia').value==true){      
      this.notaForm.get('btnTodoDia').enable();
    }    
    else{
      this.notaForm.get('opcHora').enable();
    }

    if(!this.bNuEnvioAuto){
      this.notaForm.get('btnTraslado').disable(); 
    }
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

    let bPermitidos=true
    this.bEstadoNuevo=false

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

    if(this.fnValidarFechaEnvio()!=false && bPermitidos==true && 
      await this.fnValidarSaldoGuardar()!=false && await this.fnValidarTopeGuardar()!=false){
      
      let sMensaje;
      if(this.notaForm.get('btnTraslado').value){
        sMensaje='¿Desea enviar la nota a Logística?'
      }
      else{      
        sMensaje='Esta mercaderia llegará a central de Lucky de forma automática'
      }

      var resp = await Swal.fire({        
        title: sMensaje,
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
            
      const pParametroDet = [];

      this.notasLogisticaService.
      fnControlNotaUtiles( 1, 3, pParametro, 2 , pParametroDet, this.url)
      .then(res=> {
        
        if(res[0]==0){
          Swal.fire({
            icon: 'error',
            title: 'No se pudo enviar.'
          });          
          return false
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

        //Cuenta Regresiva
        if(ts.value<0){
          this.bCountdown=true;   
        }
        //Si el contador está subiendo     
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
        
    comboPresupuestoPerm = await this.notasLogisticaService.fnControlNotaUtiles( 1, 2, pParametro, 12 , pParametroDet, this.url)
    this.cboPresupestoPermitidos=comboPresupuestoPerm;
  
  }
  //#endregion Obtener Presupuestos

  //#region Evaluar Presupuestos Permitidos
  async fnEvaluarPresPermitidos(){
    let bCondicion=false, nIdCentroCosto;
    let bCondicionFecha=false;
    nIdCentroCosto=this.notaForm.get('txtPresupuestoDestino').value;

    if( (this.bNotaMismoDia==true && this.dFechaOperMov==this.sFechaHoy)  ||
    (this.bCierreAutomatico==true && this.dFechaOperMov==this.sFechaManiana) )
    {
      bCondicionFecha=true
    }
    
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

  //#region Evento Elegir Presupuestos desde Fecha
  async eventFechaPresupuestos(nIdCentroCostoDestino){
    let bCondicionFecha=false;

    this.nIdCentroCostoDestino=nIdCentroCostoDestino
   
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
            this.notaForm.controls.txtPresupuestoDestino.setValue(this.nIdCentroCostoAnterior);  
          }          
          
          return;
        }

        await this.fnInicializarDetalle();     
        this.notaForm.controls.txtPresupuestoDestino.setValue('');               
        
        if(this.pOpcion==3){
          this.notaForm.get('txtPresupuestoDestino').enable();
        }   
        
      }

    }
             
    this.nIdCentroCostoAnterior=nIdCentroCostoDestino
       
  }
  //#endregion

  //#region Limpiar Articulos
  async fnLimpiarArticulos(nIdParametro){
    
    this.nIdCentroCostoDestino=nIdParametro

    let bCondicionFecha=false;
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
        
        this.notaForm.controls.txtPresupuestoDestino.setValue(this.nIdCentroCostoAnterior);
                      
        return;
      }

      this.fnInicializarDetalle(); 
        
    }
    
      this.nIdCentroCostoAnterior=nIdParametro

      if(bCondicionFecha){
        if(await this.fnEvaluarPresPermitidos()==false){
          this.notaForm.controls.txtPresupuestoDestino.setValue('');
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

  //#region Validar Saldo al Agregar
  async fnValidarSaldoAgregar(){
    let valorSaldo;
    let sMensajeError;
    let sNombrePresupuesto
    var nIdPartida = this.detalleForm.get('nIdPartida').value;
    var nCantidadDetalle=this.detalleForm.get('txtCantidad').value;


    this.cboPresupuesto.forEach(item=>{
      if(item.nId==this.nIdCentroCostoDestino){
        sNombrePresupuesto=item.sDescripcion;
      }      
    })

    //Validar    
    var gastoPartida = this.detalleForm.get('txtPrecioUnidad').value*nCantidadDetalle;

    var precioResguardo = gastoPartida;

    this.listaDetalle.forEach(item=>{
      if(item.nIdPartida==nIdPartida){
        gastoPartida+=item.nPrecioUnidad*item.nCantidad
      }
      precioResguardo+=item.nPrecioUnidad*item.nCantidad;
    })

    
    if(this.bEditarDetalle==true){
      gastoPartida=gastoPartida-(this.listaDetalleSeleccion.nPrecioUnidad*this.listaDetalleSeleccion.nCantidad)
      precioResguardo=precioResguardo-(this.listaDetalleSeleccion.nPrecioUnidad*this.listaDetalleSeleccion.nCantidad)  
    }
 
    //Recuperar saldo con funcion
    const pParametro = [];    
    pParametro.push(this.nIdCentroCostoDestino);
    pParametro.push(this.dFechaOperMov);
    pParametro.push(nIdPartida);
    const pParametroDet = [];
        
    //Saldo y Mensaje
    valorSaldo = await this.notasLogisticaService.fnControlNotaUtiles( 1, 2, pParametro, 13 , pParametroDet, this.url)
    
    // console.log('--')
    // console.log(valorSaldo)
    // console.log(gastoPartida)
    // console.log(precioResguardo)
    // console.log(valorSaldo[0].nSaldo-gastoPartida)
    // console.log('--')

    //saldo-gastopartida<0 =>mensaje de advertencia que no hay saldo   
    if(valorSaldo[0].sMensaje!=''){
      sMensajeError=valorSaldo[0].sMensaje
      Swal.fire('¡Verificar!', sMensajeError , 'warning')
      this.spinner.hide()
      return false
    }
    //Si el CC es de tipo presupuesto cliente validamos el resguardo
    else if ((valorSaldo[0].nSaldoResguardo - precioResguardo < 0) && valorSaldo[0].nIdTipoCC == 2034) {
      Swal.fire('Advertencia', 'No hay suficiente saldo en el presupuesto: '+ valorSaldo[0].sCentroCosto +'.\n' +
        'Saldo disponible: ' + (valorSaldo[0].nSaldoResguardo).toFixed(4) + ',\n' +
        'Gasto requerido: ' + (precioResguardo).toFixed(4), 'warning');
      this.spinner.hide()
      return false;
    }  
    else if(valorSaldo[0].nSaldo-gastoPartida<0){      
      Swal.fire('¡Verificar!',
      `No hay saldo suficiente en el presupuesto: ${valorSaldo[0].sCentroCosto}, en la sucursal ${valorSaldo[0].sSucursal}, 
        y partida: ${valorSaldo[0].sPartida}, Saldo disponible: ${(valorSaldo[0].nSaldo).toFixed(4)},
        Gasto requerido: ${(gastoPartida).toFixed(4)}`, 
      'warning')
      this.spinner.hide()
      return false
    }
    else{
      return true
    }
  
  }
  //#endregion

  //#region Validar Saldo a Guardar/Enviar
  async fnValidarSaldoGuardar(){
    let valorSaldo;
    let listaTodasPartidas=[];//id partidas [2,5,12]
    let nombrePartida, sMensajeError, bResultado;
    
    if(this.listaDetalle.length>0){
      //Listar Todas las Partidas
      for (let i = 0; i < this.listaDetalle.length; i++) { 
        listaTodasPartidas.push(this.listaDetalle[i].nIdPartida)        
      }
      //Listar Partidas sin repetir
      var listaPartidas=listaTodasPartidas.filter((item, index) => listaTodasPartidas.indexOf(item) === index)
    
      for (let i = 0; i < listaPartidas.length; i++) { 
        var nIdPartida =listaPartidas[i];
        var gastoPartida = 0
        var precioResguardo = 0;
        this.listaDetalle.forEach(item=>{
          if(item.nIdPartida==nIdPartida){
            gastoPartida+=item.nPrecioUnidad*item.nCantidad
            nombrePartida=item.sPartida
          }
          precioResguardo+=item.nPrecioUnidad*item.nCantidad;
        })
    
        //console.log(gastoPartida)

        const pParametro = [];    
        pParametro.push(this.nIdCentroCostoDestino);
        pParametro.push(this.dFechaOperMov);
        pParametro.push(nIdPartida);
        const pParametroDet = [];
         
        valorSaldo = await this.notasLogisticaService.fnControlNotaUtiles( 1, 2, pParametro, 13 , pParametroDet, this.url)
        
        //Si el CC es de tipo presupuesto cliente validamos el resguardo
        if ((valorSaldo[0].nSaldoResguardo - precioResguardo < 0) && valorSaldo[0].nIdTipoCC == 2034) {
          Swal.fire('Advertencia', 'No hay suficiente saldo en el presupuesto: '+ valorSaldo[0].sCentroCosto +'.\n' +
            'Saldo disponible: ' + (valorSaldo[0].nSaldoResguardo).toFixed(4) + ',\n' +
            'Gasto requerido: ' + (precioResguardo).toFixed(4), 'warning');
          bResultado=false;
          break;
        }  
        //saldo-gastopartida<0 =>mensaje de advertencia que no hay saldo       
        else if(valorSaldo[0].sMensaje!=''){
          sMensajeError=valorSaldo[0].sMensaje
          Swal.fire('¡Verificar!', sMensajeError , 'warning')
          bResultado=false;
          break;
        }
        else if(valorSaldo[0].nSaldo-gastoPartida<0){         
          Swal.fire('¡Verificar!', 
          `No hay saldo suficiente en el presupuesto: ${valorSaldo[0].sCentroCosto}, en la sucursal ${valorSaldo[0].sSucursal}, 
          y partida: ${valorSaldo[0].sPartida}, Saldo disponible: ${(valorSaldo[0].nSaldo).toFixed(4)},
          Gasto requerido: ${(gastoPartida).toFixed(4)}`, 
          'warning')
          bResultado=false
          break;
        }
        else{
          bResultado=true
        }

      }
     
    }

    return bResultado;
   
  }
  //#endregion

  //#region Validar Cantidad Tope Guardar/Enviar
  async fnValidarTopeGuardar(){
    let listaArticulos=[];//id partidas [2,5,12]
    let nombreArticulo, bResultado;
    
    if(this.listaDetalle.length>0){
      //Listar Todas las Partidas
      for (let i = 0; i < this.listaDetalle.length; i++) { 
        listaArticulos.push(this.listaDetalle[i].nArticulo)        
      }
      //Listar Partidas sin repetir
      var listaArticulosUnicos=listaArticulos.filter((item, index) => listaArticulos.indexOf(item) === index)
    
      for (let i = 0; i < listaArticulosUnicos.length; i++) { 
        var nIdArticulo =listaArticulosUnicos[i];
        var cantidadArticulo = 0
        this.listaDetalle.forEach(item=>{
          if(item.nArticulo==nIdArticulo){
            cantidadArticulo+=item.nCantidad
            nombreArticulo=item.sArticulo
          }
        })
    
         
        var vCantidadTope =  await this.fnValidarTopeSolicitud(nIdArticulo);
        
        //Si el CC es de tipo presupuesto cliente validamos el resguardo
        if(vCantidadTope.nCantidadTope!=-1 && cantidadArticulo>(vCantidadTope.nCantidadTope-vCantidadTope.nCantidadSolicitada)){
          Swal.fire('¡Verificar!', `El artículo: ${nombreArticulo} supera la cantidad máxima en el mes y año seleccionado con el cliente: ${vCantidadTope.sCliente},
                                    Cantidad maxíma por mes: ${vCantidadTope.nCantidadTope},
                                    Cantidad solicitada: ${vCantidadTope.nCantidadSolicitada}.`, 'warning');
          bResultado=false
          break;   
        }
        else{
          bResultado=true
        }

      }
     
    }

    return bResultado;
   
  }
  //#endregion

  //#region Validar FIFO Editar
  async fnValidarFifoEditar(row){

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
 

  if(this.notaForm.get('btnTodoDia').value==true){      
    this.notaForm.get('btnTodoDia').enable();
  }    
  else{
    this.notaForm.get('opcHora').enable();
  }  

  this.notaForm.get('txtPresupuestoDestino').enable();
  this.vbtnGuardar=true; 
  this.notaForm.controls.txtCreado.setValue(this.sNombreUsuario);
  this.notaForm.controls.txtEstado.setValue('Incompleto') 
  this.notaForm.controls.txtDocumento.setValue('') 
  this.fnListarDetalleDuplicar();
}
//#endregion Duplicar Nota

//#region Validar que el presupuesto este activo
async fnValidarPresupuestoActivo(){
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

//#region Generar Detalle para duplicar
async fnListarDetalleDuplicar(){
  try{
    this.spinner.show();
    const pParametro = [];
    pParametro.push(this.nIdOperMov);           
          
    const pParametroDet = [];
    var resultado:any = await this.notasLogisticaService.fnControlNotaUtiles( 1, 2, pParametro, 15 , pParametroDet, this.url)
    this.listaDetalle=resultado;
    this.detNotaTableData = new MatTableDataSource(this.listaDetalle);
    this.detNotaTableData.paginator = this.detNotaPaginator; 
    this.spinner.hide();

    this.fnCalcularTotales();     
    }catch(err){
      this.spinner.hide();
    }
}
//#region  

//#region Validar tope de solicitud de articulos por Cliente
async fnValidarTopeSolicitud(nIdArticulo: number){
  try{
    const pParametro = [];
    pParametro.push(this.nIdCentroCostoDestino);  
    pParametro.push(nIdArticulo);  
    pParametro.push(this.sPais);  
    pParametro.push(this.dFechaOperMov);  
            
    const pParametroDet = [];
    var resultado:any = await this.notasLogisticaService.fnControlNotaUtiles( 1, 2, pParametro, 16 , pParametroDet, this.url)
    var topeSolicitud =  resultado[0];
    return topeSolicitud
    }catch(err){
      return null;
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
