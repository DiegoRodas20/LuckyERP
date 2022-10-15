import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { NotaHistorialComponent } from '../../nota-historial/nota-historial.component';
import { AppDateAdapter, APP_DATE_FORMATS } from './../../../../../../shared/services/AppDateAdapter';
import { NotasLogisticaService } from './../../notas-logistica.service';

// Validaciones
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}


@Component({
  selector: 'app-nota-ingreso-detalle',
  templateUrl: './nota-ingreso-detalle.component.html',
  styleUrls: ['./nota-ingreso-detalle.component.css'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ],
  animations: [asistenciapAnimations]
})
export class NotaIngresoDetalleComponent implements OnInit {
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
  dFechaHoy = new Date();
   
  //Formularios
  notaForm: FormGroup;
  detalleForm: FormGroup;

  //Variables Formulario
  nIdOperMov:number
  dFechaOperMov:any 
  nIdCentroCosto:number
 
  nEstadoNota:number

  //Combos de Formulario
  cboPresupuesto=[]
  cboEntidades=[]

  //Combos Detalle
  cboArticulo=[] 
  listaDetalle=[]
  listaArticulos=[]
  
  //Variables Detalle  
  sArticulo:string  
  sRutaImagen:string
  bEditarDetalle:boolean = false;
  nFilaEditada:number

  //Variables de estado de botones
  vModifica:boolean = true;
  vbtnGuardar:boolean   = false;
  vbtnModificar:boolean = false;
  vbtnCancelar:boolean  = false;
  vbtnAprobar:boolean   = false;
  vbtnDevolver:boolean  = false; 
  vbtnEnviar:boolean  = false; 

  //Material Table
  detNotaTableData: MatTableDataSource<any>;
  @ViewChild(MatPaginator) detNotaPaginator: MatPaginator;
  @ViewChild(MatSort) detNotaSort: MatSort;
  DetNotaColumns: string[] = 
  ['pEstado','sArticulo', 'nCantidad', 'sObservacionDet'];

  @ViewChild('modalArticulo') modalArticulo: ElementRef;
  @ViewChild('modalImagen') modalImagen: ElementRef;

  matcher = new MyErrorStateMatcher();
    
  //#endregion

  constructor(
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    @Inject('BASE_URL') baseUrl: string,
    private notasLogisticaService: NotasLogisticaService, 
    public dialog: MatDialog
  ) { 
    this.url = baseUrl; 
    this.newEvent = new EventEmitter();
  }

  ngOnInit(): void {
 //Inicializar variables del sistema
    this.sPais = localStorage.getItem('Pais');
    this.nIdEmpresa = localStorage.getItem('Empresa');
    const user = localStorage.getItem('currentUser');
    this.nIdUsuario = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.sNombreUsuario = JSON.parse(window.atob(user.split(".")[1])).uno;


    this.notaForm = this.formBuilder.group({    

    txtSolicitante: [''],                   
    txtPresupuesto: ['',Validators.required],  
    txtDirector: [''],     
    txtCanal: [''],     
    txtEjecutivo: [''],     
    txtServicios: [''],     
    txtCliente: [''],     
    txtFechaInicio: [''],     
    txtFechaFin: [''],     
    txtTotalUnidades: [''],
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

    if(this.pOpcion==1){
      this.vbtnGuardar=true
      this.notaForm.controls['txtCreado'].setValue(this.sNombreUsuario);    
      this.notaForm.controls['txtEstado'].setValue('Incompleto');
      this.fnFechaCreacion();
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

      txtNombreArticuloIngreso:[''],   
      txtCantidad:[''],  
      txtObservacionDetalle:[''],    
  
      })
    
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
          
    //#region Evento Cambiar Presupuesto
    fnEventPresupuesto(nIdCentroCosto){
      this.fnLimpiarDatos();
      this.nIdCentroCosto=nIdCentroCosto;       
    
      if(this.cboPresupuesto.length>0){  
        for (let i = 0; i < this.cboPresupuesto.length; i++) {  
          if(nIdCentroCosto==this.cboPresupuesto[i].nId){
            //this.notaForm.controls['txtPresupuestoOrigen'].setValue(this.cboPresupuesto[i].nIdServicio); 
            this.notaForm.controls['txtServicios'].setValue(this.cboPresupuesto[i].sServicio);           
            this.notaForm.controls['txtCanal'].setValue(this.cboPresupuesto[i].sSubCanal);         
            this.notaForm.controls['txtCliente'].setValue(this.cboPresupuesto[i].sNombreComercial);   
            this.notaForm.controls['txtFechaInicio'].setValue(this.cboPresupuesto[i].sFechaIni);   
            this.notaForm.controls['txtFechaFin'].setValue(this.cboPresupuesto[i].sFechaFin);   
            this.notaForm.controls['txtDirector'].setValue(this.cboPresupuesto[i].sDirector);   
            this.notaForm.controls['txtEjecutivo'].setValue(this.cboPresupuesto[i].sEjecutivo); 
          }
        }
      }

    }
    //#endregion Evento Cambiar Presupuesto

    //#region Limpiar Datos
    fnLimpiarDatos(){
      this.notaForm.controls['txtServicios'].setValue('');           
      this.notaForm.controls['txtCanal'].setValue('');         
      this.notaForm.controls['txtCliente'].setValue('');   
      this.notaForm.controls['txtFechaInicio'].setValue('');   
      this.notaForm.controls['txtFechaFin'].setValue('');   
      this.notaForm.controls['txtDirector'].setValue('');   
      this.notaForm.controls['txtEjecutivo'].setValue(''); 
    }
    //#endregion

    //#region Fecha
      fnFechaCreacion(){
      let sDia, sMes, sAnio, sFechaActual;
            
      sDia=this.dFechaHoy.getDate()
      sMes=this.dFechaHoy.getMonth()+1
      sAnio=this.dFechaHoy.getFullYear()

      if(sDia<10){sDia='0'+sDia}
      if(sMes<10){sMes='0'+sMes}

      sFechaActual= sDia+"/"+sMes+"/"+sAnio

      this.notaForm.controls.txtFechaCreado.setValue(sFechaActual)

      }
      //#endregion

  //#endregion

  //#region Obtener Solicitante
  async fnObtenerSolicitante(){
    let sSolicitante;
    const pParametro = [];
    pParametro.push(this.nIdUsuario);
    const pParametroDet = [];
        
    sSolicitante = await this.notasLogisticaService.fnControlNotaIngreso( 1, 2, pParametro, 2 , pParametroDet, this.url)

    this.notaForm.controls['txtSolicitante'].setValue(sSolicitante.datos);

  }
  //#endregion Obtener Solicitante

  //#region Obtener Presupuestos
  async fnObtenerPresupuestos(){
    let comboPresupuesto;
    const pParametro = [];
    pParametro.push(this.nIdUsuario);
    pParametro.push(this.nIdEmpresa);
    pParametro.push(this.vbtnGuardar==true ? 0: this.nIdCentroCosto);
    
    const pParametroDet = [];
        
    comboPresupuesto = await this.notasLogisticaService.fnControlNotaIngreso( 1, 2, pParametro, 3 , pParametroDet, this.url)
    this.cboPresupuesto=comboPresupuesto;
    
    if(this.vbtnGuardar==false){      
      this.notaForm.controls['txtPresupuesto'].setValue(this.nIdCentroCosto);     
      this.fnEventPresupuesto(this.nIdCentroCosto);  
    }

  }
  //#endregion Obtener Presupuestos
   
  //#region Validaciones

    //#region Validar Abrir Modal
    fnValidarAbrirModal(){
      if(this.notaForm.get('txtPresupuesto').hasError('required')==true){
        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: 'Elegir Presupuesto antes de agregar artículos.' 
        });
        return false;
      }
    }
    //#endregion

    //#region Validar Modal
    fnValidarModal(){
              
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
    //#endregion

    //#region Validar Registro
    fnValidarRegistro(){
    
     if(this.notaForm.invalid){        
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
    }
    //#endregion

    //#region Validar Decimales a Enteros
    fnRedondear(formControlName: string, form: FormGroup) { 
      var valor: number = form.get(formControlName).value;
      if (valor == null) return;
      form.get(formControlName).setValue(Math.round(valor));   
    }
    //#endregion
    
  //#endregion

  //#region  Detalle Modal
    
    //#region Abrir Modal Nuevo
    btnAgregarLineaDetalle(){    
      this.bEditarDetalle=false;
      if(this.fnValidarAbrirModal()!=false){
      
        this.fnIniciarFormDetalle();       
       
        this.modalArticulo.nativeElement.click();
      }
    }
  //#endregion

    //#region Agregar Detalle modal
    async fnAgregarListaDetalle(){    
    
      var nCantidadDetalle;
            
      if(this.fnValidarModal()!=false ){
      
        nCantidadDetalle=this.detalleForm.get('txtCantidad').value
      
            
          this.listaDetalle.push(
            { sArticulo:         this.detalleForm.get('txtNombreArticuloIngreso').value,             
              sObservacionDet:   this.detalleForm.get('txtObservacionDetalle').value,                                 
              nCantidad:         nCantidadDetalle
          });
        
            
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
     
      this.detalleForm.controls['txtNombreArticuloIngreso'].setValue(row.sArticulo);      
      this.detalleForm.controls['txtCantidad'].setValue(row.nCantidad);    
      this.detalleForm.controls['txtObservacionDetalle'].setValue(row.sObservacionDet);    
      
    }
    //#endregion

    //#region Editar Detalle
    async fnEditarListaDetalle(){
      let i;
      var nCantidadDetalle

      i=this.nFilaEditada;


      if(this.fnValidarModal()!=false ){
      
      nCantidadDetalle=this.detalleForm.get('txtCantidad').value;
        
            this.listaDetalle[i].sArticulo=               this.detalleForm.get('txtNombreArticuloIngreso').value  
            this.listaDetalle[i].nCantidad=               nCantidadDetalle  
            this.listaDetalle[i].sObservacionDet=         this.detalleForm.get('txtObservacionDetalle').value
  

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
             
        listaTemporal.push( this.listaDetalle[i].sArticulo,                                                             
                            this.listaDetalle[i].nCantidad,
                            this.listaDetalle[i].sObservacionDet
                          )
        
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

  //#endregion
  
  //#region Calcular Totales
  fnCalcularTotales(){
      
    var nTotalUnidades=0
    
    if(this.listaDetalle.length>0){  
      for (let i = 0; i < this.listaDetalle.length; i++) {
        nTotalUnidades= nTotalUnidades+this.listaDetalle[i].nCantidad; 
      }
    }
    else{
      nTotalUnidades=0
    }
    this.notaForm.controls.txtTotalUnidades.setValue(nTotalUnidades);     

  }
  //#endregion Calcular Totales
  
  //#region Guardar Formulario
  async fnGuardarFormulario(){
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
    
    if(this.fnValidarRegistro()!=false ){
    
      this.vbtnCancelar=false;
      let sObservacionNota;
                             
        this.nIdCentroCosto=this.notaForm.get('txtPresupuesto').value          
        sObservacionNota=this.notaForm.get('txtObservacion').value
             
      this.fnConfirmarLineas();

      const pParametro = [];

      pParametro.push(this.sPais);
      pParametro.push(this.nIdUsuario);
      pParametro.push(this.nIdCentroCosto);      
      pParametro.push(sObservacionNota);      
      pParametro.push(this.nIdOperMov);

      var pParametroDet = [];
      pParametroDet=this.listaArticulos;
      
      this.notasLogisticaService.
      fnControlNotaIngreso( 1, this.pOpcion, pParametro, 1 , pParametroDet, this.url)
      .then(res => {
        
        if(res[0]==0){
          Swal.fire({
            icon: 'error',
            title: 'No se pudo guardar.'
          });
          return false;          
        }

        else {
        Swal.fire({
          icon: 'success',
          title: 'Se guardó correctamente.',
          timer:3000
        });

        this.nIdOperMov=res[0];
        
        
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

  //#region Cargar Cabecera y Detalle
  async fnCargarCabecera(){
    this.vbtnGuardar=false;    
    
    const pParametro = [];
    pParametro.push(this.nIdOperMov);           
          
    const pParametroDet = [];

    this.notasLogisticaService.
    fnControlNotaIngreso( 1, 2, pParametro, 4 , pParametroDet, this.url)
    .then((data: any) => {    
      
      this.nEstadoNota=data[0].nEstadoNota;
      if(this.nEstadoNota==2225 || this.nEstadoNota==2230){
        this.vbtnModificar=true;
        this.vbtnEnviar=true
      }
      else{
        this.vbtnModificar=false;
        this.vbtnEnviar=false;
      }
          
      this.nIdCentroCosto=data[0].nIdCentroCosto
     
      this.fnObtenerPresupuestos();
      
      this.notaForm.controls.txtSolicitante.setValue(data[0].sSolicitante);    
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
    fnControlNotaIngreso( 1, 2, pParametro, 5 , pParametroDet, this.url)
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
    this.notaForm.get('txtPresupuesto').disable();    
    this.notaForm.get('txtObservacion').disable();
  }

  fnHabilitarControles(){    
    this.notaForm.get('txtPresupuesto').enable();  
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
            
      const pParametroDet = [];

      this.notasLogisticaService.
      fnControlNotaIngreso( 1, 3, pParametro, 2 , pParametroDet, this.url)
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
  //#endregion Enviar
 
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
      //console.log('VEAMOS SE CERRO');
      
    })
  }
  //#endregion Abrir visor de historial

  // Funcionalidad de los botones laterales
  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? 0 : 3;

  }
}
