import { Component, OnInit, ViewChild, Input, Inject, ElementRef, EventEmitter, Output  } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms'; 
import { SerPresupuestoService } from './../serpresupuesto.service';   

import { EstadoefectivoComponent } from './../../requerimiento/efectivo/estadoefectivo/estadoefectivo.component';  
import { DigCambioEstadoComponent } from './../dig-cambio-estado/dig-cambio-estado.component';  
import { DigFacturacionComponent } from './../dig-facturacion/dig-facturacion.component';  

import { Estado } from './../../requerimiento/model/IEfectivo';   
import { MatDialog } from '@angular/material/dialog'; 
import Swal from 'sweetalert2';
 
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table'; 

import { NgxSpinnerService } from 'ngx-spinner'; 

import { PreCliente,PreEquipo,Resultado } from '../../Models/Ipresupuesto';   
import { SergeneralService} from '../../../../shared/services/sergeneral.service'; 
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../../shared/services/AppDateAdapter'; 

import * as moment from 'moment';   
import { DigcomentarioaprobacionComponent } from './../digcomentarioaprobacion/digcomentarioaprobacion.component';
import { comercialAnimations } from '../../Animations/comercial.animations';  
import { saveAs } from 'file-saver';
import { map, type } from 'jquery';
  
@Component({
  selector: 'app-crearpresupuesto',
  templateUrl: './crearpresupuesto.component.html',
  styleUrls: ['./crearpresupuesto.component.css'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ] , 
  animations: [ comercialAnimations]
})

export class CrearpresupuestoComponent implements OnInit {
  //#region declaracion variable del sistema
  id:number; 
  url: string;  
  pais: string; 
  Empresa:string; 
  menu:string; 
  lPar:number; 
  //#endregion

  
  @Input() pPresupuesto: any;

  //#region declaracion variable del sistema
  idPresupuesto:number; 
  Tipo: String;  
  Perfil: number; 
  permiso: number; 
  control: number; 
  EstadoPresupuestoCC: String;    
  pOpcion: number; 
  nomPre: String;  
  nomPresupuesto: String;  
  titulo: String= 'Detalle '; 
  //#endregion

  //#region true and false to div 
  divCreate: boolean = false;
  divCrePre: boolean = true;
  divCrePrePartida: boolean = false;
  BtnArmar: boolean = true; 
  BtnCreacion: boolean = false; 
  BtnPresupuesto: boolean = true; 
  divValidacion: boolean = true; 
  divVal : boolean = true; 
  divValT : boolean = false;  
  BtnCopiar: boolean = false; 
  BtnNuevo: boolean = true; 
  BtnMarca: boolean = false; 
  BtnFactura: boolean = false; 
  BtnModificar: boolean = false;  
  //#endregion

   //declarando la instacia de un componente
   @ViewChild('stepper') Stepper: ElementRef;

   //#region validando la fecha 
   fecIni: string ='';
   fecFin: string='';
   //#endregion

  //#region validando la fecha 
  IdtipoCambio: number;
  TipoCambio: string='';
  //#endregion

  //#region filtros para la tabla de partidas con ofivina
  listPersonal:PreEquipo[]=[];   
  clsColumnaOpc: any[]=[];  
  ColumnaPartida: any;
  lblLista:any[] = [];
  //#endregion

  //#region  array para los combos
  lCboTipoCambio:any;
  lCboCotizacion:any;
  lCboTipo:any;
  lCboCanal:any;
  lCboSubCanal:any;
  lCboOrdenante:any;
  lCboModena:any;
  lCboMarca:any;
  lCboServicio:any;  
  lCboPartidaGenerica:any; 
  lCboPartidaEspeficia:any; 
  lCboCanalCliente:any; 
  lCboPersonaDirGen:any;
  lCboPersonaDirCue:any;
  lCboPersonaGerCue:any;
  lCboPersonaEje:any;
  lCboPersona:any = [];
  lCboCliente:any; 
  //#endregion

  
  pIdSur:string ='';   
  pNomSur:string;   
  pMargen:string; 
  pIdCC:number;   
  pPermisoDescarga:number = 0;   

   
  vtotalPer:number; 
  vtotalres:number;  
 
  lCboSucursal: PreCliente[];     

  chkSeg:boolean = false;
  chkTer:boolean = false;

   
  abLista = [];
  tsLista = 'inactive'; 
  fbLista = [
    {icon: 'person_add', tool: 'Nuevo personal'}
  ];

  arrayPartida = new Object();  
  vDetPartida = new Object();

  /* tabla lista de sucursal */
  dataSourceSuc: MatTableDataSource<PreCliente>;
  displayedColumnsSuc: string[] = [ 'ojo', 'pNombre','pEstado'];
  @ViewChild('TableSucPaginator', {static: true}) tableSucPaginator: MatPaginator;
  @ViewChild('TableSucSort', {static: true}) tableSucSort: MatSort; 
  
  /* tabla lista de equipo */
  dataSourceEquipo: MatTableDataSource<PreEquipo>;
  displayedColumnsEquipo: string[] = [ 'pSucursal','pNombre','pEstado','pCod'];
  @ViewChild('TableEquipoPaginator', {static: true}) tableEquipoPaginator: MatPaginator;
  @ViewChild('TableEquipoSort', {static: true}) tableEquipoSort: MatSort;
 
  dataSourcePrePar: MatTableDataSource<any>;
  displayedColumnsPrePar: string[] = []//['estado','pPartidaGen','pPartidaEsp','pParitdaMargen','pTotal']; 

  
  PrimeraFormGroup: FormGroup;
  PresupuestoFormGroup: FormGroup;
  DetalleFormGroup: FormGroup;
  DirectorFormGroup: FormGroup;
  EjecutivoFormGroup: FormGroup; 
  myFormSucursal: FormGroup;
  myFormPersonal: FormGroup; 
  GestionFormGroup: FormGroup;  

  @Output()
  enviar: EventEmitter<string> = new EventEmitter<string>();

  constructor(   
    private spinner: NgxSpinnerService, 
    private formBuilder: FormBuilder, 
    private vSerGeneral: SergeneralService, 
    private vSerPresupuesto: SerPresupuestoService,
    private dialog: MatDialog,
    @Inject('BASE_URL') baseUrl: string
    ) { 
      this.url = baseUrl; 
    }

  ngOnInit(): void { 
    
    //#region llenado dato del sistema
    this.pais = localStorage.getItem('Pais'); 
    this.Empresa = localStorage.getItem('Empresa');
    this.menu = localStorage.getItem('Menu');
    const user = localStorage.getItem('currentUser');
    this.id = JSON.parse(window.atob(user.split('.')[1])).uid;  
 
    //#endregion 
    
    this.idPresupuesto = this.pPresupuesto.idPresupuesto;
    this.Tipo = this.pPresupuesto.idtipo;
    this.Perfil = this.pPresupuesto.perfil;
    this.permiso = this.pPresupuesto.permiso;
    this.control = this.pPresupuesto.control;
    let obj = this.pPresupuesto.obj;   
    
    if(this.permiso == 1 && this.idPresupuesto === 0){
      this.divValidacion =false;
      this.EstadoPresupuestoCC = "";
      this.PrimeraFormGroup = this.formBuilder.group({
        IdPre: [''],
        NumPresupuesto: ['' , Validators.required],
        DescPresupuesto: ['', Validators.required],
        EstPresupuesto: ['' , Validators.required], 
      });
  
      this.PresupuestoFormGroup = this.formBuilder.group({ 
        FechaInicio: ['' , Validators.required],
        sFechaFin: ['' , Validators.required], 
        FechaFin: ['' , Validators.required], 
        continuacion: [{value: '', disabled: true}] ,
        IdNroCliente: ['' , Validators.required] , 
        NroCliente: ['' , Validators.required] , 
        StatusCoti: ['' , Validators.required] , 
        Aprobacion: [{value: '', disabled: true}] , 
        nroeasywin: [''] , 
        idStatusPre: ['', Validators.required] ,  
        StatusPre: [{value: '', disabled: true} , Validators.required] 
      });
  
      this.DetalleFormGroup = this.formBuilder.group({ 
        Canal: ['' , Validators.required],
        SubCanal: ['' , Validators.required],
        Ordenante: ['' , Validators.required],
        Servicio: ['' , Validators.required],
        Marca: ['' , Validators.required],
        Modena: ['' , Validators.required],
        CanalCli: ['' , Validators.required],
        Contacto: ['' , Validators.required]
      });
  
      this.DirectorFormGroup = this.formBuilder.group({ 
        NroDirGeneral: ['' , Validators.required],  
        NroDirCuentas: [''] , 
        NroGerCuentas: ['', Validators.required]  ,
        NroEjecUno: ['' , Validators.required],
        ProEjecUno: ['' , Validators.required],
        NroEjecdos: ['', Validators.required] ,
        ProEjecdos: ['' , Validators.required],
        NroEjecTres: ['', Validators.required] ,
        ProEjecTres: ['' , Validators.required],
      });  
      
      const lsucursal: PreCliente[] = []; 
      this.dataSourceSuc = new MatTableDataSource(lsucursal);   
      const lpersonal: PreEquipo[] = [];
      this.dataSourceEquipo = new MatTableDataSource(lpersonal);   
      this.fnCliente();
    }
    else{
      let lPresupuesto =  ['625','2278','2153'];
      
      this.BtnArmar = false;
      this.BtnNuevo = false;
      this.BtnModificar = true;   
      
      if(this.control == 1 && obj.paprob == "Aprobado"){  
        this.BtnMarca=true; 
      }
      else{ 
        this.BtnMarca=false;  
      }

      if(obj.pestado === "Cerrado" || 
      obj.pestado === "Anulado" ||
      obj.pestado === "Cancelada"){
        this.divValT = true;   
        this.divVal = true;  
        this.divValidacion = true;  
        this.BtnModificar = false;
        this.BtnCreacion = false;  
      }
      else if(this.permiso == 1  && lPresupuesto.includes(this.Perfil.toString()) != true){
        this.divVal = false; 
        this.divValidacion = false;  
        if(obj.pTipo === 2034)
        {
          this.divValT = true;   
        }  
      }
      else{   
        if(lPresupuesto.includes(this.Perfil.toString()) == true){ 
          this.divValT = false;   
          this.divVal = false;  
          this.divValidacion = false;  
          this.BtnModificar = true;   
        }
        else{ 
          this.divValT = true;   
          this.divVal = true;  
          this.divValidacion = true;  
          this.BtnModificar = false;
          this.BtnCreacion = false;  
        }
 
      } 
      let error = false;

      this.TipoCambio = obj.pnVenta;
      
      let fei  = this.convertUTCDateToLocalDate(new Date(obj.pFecIni.toString()));
      let fef  = this.convertUTCDateToLocalDate(new Date(obj.pFecFin.toString())); 
      
      this.fnGetSubCanal(obj.pidCanal) 
      this.PrimeraFormGroup = this.formBuilder.group({
        IdPre: [obj.pnIdCC.toString() , Validators.required],
        NumPresupuesto: [{value: obj.pCodCC.toString(), disabled: this.divVal} , Validators.required],
        DescPresupuesto: [{value: obj.pDescCC.toString(), disabled: this.divVal}, Validators.required],
        EstPresupuesto: [{value: obj.pestado.toString(), disabled: this.divVal} , Validators.required], 
      });

      this.nomPre = obj.pCodCC.toString() +' '+ obj.pDescCC.toString()

      this.EstadoPresupuestoCC = obj.paprob

      if(this.EstadoPresupuestoCC === "Aprobado"){

        if(lPresupuesto.includes(this.Perfil.toString()) == true){ 
          error  = false
        }
        else{
          error  = true
        }
        this.BtnFactura=true; 
      }
      else{ 
        this.BtnFactura=false; 
      }

      this.PresupuestoFormGroup = this.formBuilder.group({ 
        FechaInicio: [{value: fei, disabled: this.divVal} , Validators.required],
        sFechaFin: [fef, Validators.required], 
        FechaFin: [{value: fef, disabled: (this.divVal== true? true: error)} , Validators.required], 
        continuacion: [{value: obj.psContinuacion, disabled: true}] , 
        IdNroCliente: [ obj.pIdCliente , Validators.required] , 
        NroCliente: [{value: obj.pIdCliente, disabled: (this.divVal== true? true: (this.EstadoPresupuestoCC === "Aprobado"? true:false ) ) } , Validators.required] ,  
        StatusCoti: [{value: obj.pIdStatusCotiz, disabled: this.divValT} , Validators.required] , 
        nroeasywin: [ obj.psCCostoeasywin ] , 
        Aprobacion: [{value: obj.paprob, disabled: true}] , 
        idStatusPre: [{value: obj.pTipo, disabled: this.divVal}, Validators.required] ,  
        StatusPre: [{value: obj.pTipo, disabled: true} , Validators.required] 
      });

      

      if(obj.pTipo.toString() == '2078' )
      { 
        this.nomPresupuesto ='de la Cotización' 
        this.PresupuestoFormGroup.get('StatusCoti').enable(); 
      }
      else if(obj.pTipo.toString() == '2034' ){
        this.PresupuestoFormGroup.get('StatusCoti').disable(); 
        this.nomPresupuesto ='del Presupuesto'  
      }

      this.DetalleFormGroup = this.formBuilder.group({ 
        Canal: [{value: obj.pidCanal, disabled: this.divVal} , Validators.required],
        SubCanal: [{value: obj.pidSubCanal, disabled: this.divVal}, Validators.required],
        Ordenante: [{value: obj.pIdOrdenando, disabled: this.divVal} , Validators.required],
        Servicio: [{value: obj.pIdServicio, disabled: this.divVal} , Validators.required],
        Marca: [{value: obj.pIdMarca, disabled: this.divVal} , Validators.required],
        Modena: [{value: obj.pIdMoneda, disabled: this.divVal} , Validators.required],
        CanalCli: [{value: obj.pIdCanalCLi, disabled: this.divVal}, Validators.required],
        Contacto: [{value: obj.pContacCli.toString(), disabled: this.divVal} , Validators.required]
      });

      this.DirectorFormGroup = this.formBuilder.group({ 
        NroDirGeneral: [{value: '', disabled: this.divVal} , Validators.required],  
        NroDirCuentas: [{value: '', disabled: this.divVal}] , 
        NroGerCuentas: [{value: '', disabled: this.divVal}, Validators.required]  ,
        NroEjecUno: [{value: '', disabled: this.divVal} , Validators.required],
        ProEjecUno: [{value: '', disabled: this.divVal} , Validators.required],
        NroEjecdos: [{value: '', disabled: this.divVal}, Validators.required] ,
        ProEjecdos: [{value: '', disabled: this.divVal} , Validators.required],
        NroEjecTres: [{value: '', disabled: this.divVal}, Validators.required] ,
        ProEjecTres: [{value: '', disabled: this.divVal} , Validators.required],
      }); 
 
      this.fnCliente();
      this.fnTipo() ;

      let NroDirGeneral ;  
      let NroDirCuentas ;  
      let NroGerCuentas ; 

      let NroEjecUno ; 
      let EstEjecUno ; 
      let NroEjecDos ; 
      let EstEjecDos ; 
      let NroEjecTres ; 
      let EstEjectres ;

      let cont = 0;
      obj.lNivel.forEach(element => {  
        if(element.pEstado == '2043'){
          NroDirGeneral  = element.pId  
        }
        else if(element.pEstado == '2044'){
          NroDirCuentas  = (element.pId==0? null :  element.pId)
        }
        else if(element.pEstado == '2045'){
          NroGerCuentas  =  element.pId 
        }  
        else{ 
          if(cont == 0){
            NroEjecUno  =  element.pId 
            EstEjecUno =  element.pEstado.toString() 
          } 
          else if(cont == 1){ 
            this.chkSeg = true;
            this.setAll(true,0)
            NroEjecDos  =  element.pId 
            EstEjecDos =  element.pEstado.toString()    
          }  
          else  if(cont == 2){ 
            this.chkTer = true;
            this.setAll(true,1)
            NroEjecTres  =  element.pId 
            EstEjectres =  element.pEstado.toString() 
          }
          cont++;
        }

      });   

      this.DirectorFormGroup.controls.NroDirGeneral.setValue(NroDirGeneral); 
      this.DirectorFormGroup.controls.NroDirCuentas.setValue(NroDirCuentas);  
      this.DirectorFormGroup.controls.NroGerCuentas.setValue(NroGerCuentas);  
      
      this.DirectorFormGroup.controls.NroEjecUno.setValue(NroEjecUno);  
      this.DirectorFormGroup.controls.ProEjecUno.setValue(EstEjecUno);  
      this.DirectorFormGroup.controls.NroEjecdos.setValue(NroEjecDos);  
      this.DirectorFormGroup.controls.ProEjecdos.setValue(EstEjecDos);  
      this.DirectorFormGroup.controls.NroEjecTres.setValue(NroEjecTres);  
      this.DirectorFormGroup.controls.ProEjecTres.setValue(EstEjectres);    
     
      if(typeof NroEjecDos === "undefined")
      {
        this.setAll(false,0)
      }
      if(typeof NroEjecTres === "undefined")
      {
        this.setAll(false,1) 
      }

      obj.lSucursal.forEach(element => {  
        element.lPersonal.forEach(elementa => { 
          this.listPersonal.push(elementa) 
        });
  
      });

      this.dataSourceSuc = new MatTableDataSource(obj.lSucursal);  
      this.dataSourceSuc.sort  = this.tableSucSort
      const lpersonal: PreEquipo[] = [];
      this.dataSourceEquipo = new MatTableDataSource(lpersonal); 
  
      
    } 

    if(this.idPresupuesto === 0){   

      this.PrimeraFormGroup.get('NumPresupuesto').disable(); 
      this.PrimeraFormGroup.get('EstPresupuesto').disable();  
      this.DetalleFormGroup.get('CanalCli').disable(); 

      this.BtnArmar = true;
      this.divValidacion = false;

      this.PresupuestoFormGroup.controls.idStatusPre.setValue(this.Tipo); 
      this.PresupuestoFormGroup.controls.StatusPre.setValue(this.Tipo); 
      
      if(this.Tipo.toString() == '2078' )
      { 
        this.nomPresupuesto ='de la Cotización'
        this.PresupuestoFormGroup.get('StatusCoti').enable();  
        this.PresupuestoFormGroup.controls.StatusCoti.setValue(2138); 
      }
      else if(this.Tipo.toString() == '2034' ){
        this.nomPresupuesto ='del Presupuesto' 
        this.PresupuestoFormGroup.get('StatusCoti').disable(); 
      }
      this.fnCliente();
      
      this.setAll(false,0) 
      this.setAll(false,1)
    }
    else{  
      this.PrimeraFormGroup.get('NumPresupuesto').disable(); 
      this.PrimeraFormGroup.get('EstPresupuesto').disable();  
    } 

    this.fnGetSucursal(); 
    this.fnGetTipo();
    this.fnController(2,'060');
    this.fnController(2,'022');
    this.fnController(2,'025');
    this.fnController(2,'072'); 
    this.fnGetCanal();
    this.fnGetOrdenante();
    this.fnGetDinero();
    this.fnGetServicio();
    this.fnGetPartidaGenerica();
    this.fnGetCanalCliente();
    this.fnGetCotizacion();
    this.fngetGen();  
    this.fnGetTipoCambio();

   

  }

  fnSalir(){  
    this.enviar.emit('salir');
  } 

  
  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }


  
   //#region lista de inicio (sucursal,ppto,cliente,director general, gerente cuenta, ejevutivo, canal, subcanal, marca, moneda,etc..)
      
   async getPosts(op,val){  
    let pParametro= [];
    let lError = false;
    let vPer = this.PresupuestoFormGroup.value;   
    let vPri = this.PrimeraFormGroup.value;   
    
    pParametro.push(this.pais);  
    pParametro.push(vPer.IdNroCliente); 
    pParametro.push(vPri.IdPre);   
    if(val === 1){
      lError = await this.fnValidarPartida(pParametro); 
      
      if(lError){
        this.PresupuestoFormGroup.controls.NroCliente.setValue(vPer.IdNroCliente);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No puede cambiar al cliente, debido a que el presupuesto contiene partida de personal'
        });
        this.spinner.hide(); 
        return;
      }
    }
    
    pParametro = [];
    if(typeof vPer.NroCliente != "undefined"){ 
      this.PresupuestoFormGroup.controls.IdNroCliente.setValue(vPer.NroCliente);
    }
    vPer = this.PresupuestoFormGroup.value;  
    pParametro.push(this.pais);  
    pParametro.push(vPer.IdNroCliente); 
    pParametro.push(vPri.IdPre);    
    
    

    

    if(!vPer.IdNroCliente)
    {
      this.lCboMarca = [];
      this.DetalleFormGroup.controls.Marca.setValue('');
      this.spinner.hide(); 
      return;
    }
    if(this.permiso == 1){
      if(vPer.IdNroCliente == 38){
        this.DetalleFormGroup.get('CanalCli').enable();   
      }
      else{ 
        this.DetalleFormGroup.get('CanalCli').disable();  
      }
    }
    else{ 
      this.DetalleFormGroup.get('CanalCli').disable();  
    }
    
    this.lCboCliente.map((ele)=>{
      if(+ele.pId === +vPer.IdNroCliente){
        this.pPermisoDescarga = ele.nPermiso
      }
    })
     
    await this.vSerPresupuesto.fnPresupuesto( 1, pParametro, this.url).then( async (value: any[]) => {
       
      this.lCboMarca = value;  
      if(op==1){
        this.DetalleFormGroup.controls.Marca.setValue(''); 
        this.DetalleFormGroup.controls.CanalCli.setValue('');

        if(vPer.nroeasywin != '')
        {
          await this.getEasywin()
        }

      } 
      
      if(this.lCboMarca.length == 0){
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'El cliente no tiene asignado ninguna marca'
        });
      }  
    }, error => {
      console.log(error); 
    });  
    this.spinner.hide(); 
  }

  async fnGetSucursal() {
    let pParametro= [];
    pParametro.push(this.pais); 
    pParametro.push(1); 
    pParametro.push(1); 
    await this.vSerPresupuesto.fnPresupuesto( 3, pParametro, this.url).then( (value: any[]) => {
       
      this.lCboSucursal = value;  
      if(this.idPresupuesto > 0){   
        this.fnDisableSucursal();
      }
      
    }, error => {
      console.log(error); 
    }); 
  }
 
  
  async fnCliente() {
    let pParametro= [];
    pParametro.push(this.pais); 
    await this.vSerPresupuesto.fnPresupuesto( 0, pParametro, this.url).then( (value: any[]) => { 
      this.lCboCliente = value;  
      this.getPosts(0,0) ;
    }, error => {
      console.log(error); 
    }); 
  }

  async fnController(op,a:string) {
    let pParametro= [];
    pParametro.push(this.pais);  
    pParametro.push(a); 
    pParametro.push(op);    
    
    await this.vSerPresupuesto.fnPresupuesto( 2, pParametro, this.url).then( (value: any[]) => {
      
      if(a == '060' && op == 2){
        this.lCboPersonaDirGen = value;
      }
      else if(a == '022'&& op == 2){
        this.lCboPersonaDirCue = value;
      } 
      else if(a == '025'&& op == 2){
        this.lCboPersonaGerCue = value;
      }
      else if(a == '072'&& op == 2){
        this.lCboPersonaEje = value;
      }
      else{ 
        this.lCboPersona =value;  
        this.fnLimpiarSucursal(a)
        
      } 
  
    }, error => {
      console.log(error); 
    }); 
  }

  fnGetTipo= function () { 
    if(this.idPresupuesto === 0) this.spinner.show();
     
    this.vSerGeneral.fnElementos(1, '2032', '', '1', 'asc', this.url).subscribe(
        res => {  
          this.lCboTipo = res; 
          this.lCboTipo = this.lCboTipo.filter(filtro => filtro.nIdEle != 2033);  
        },
        err => {
            console.log(err);
        },
        () => {
            this.spinner.hide();

        }

    )
  }
  
  fnGetPartidaGenerica= function () {  
    this.vSerGeneral.fnSystemElements(2, '122', '1', 'nElecod,cElenam', this.pais, this.url).subscribe(
        res => {  
            this.lCboPartidaGenerica = res;
        },
        err => {
            console.log(err);
        },
        () => {
            // this.spinner.hide();

        } 
    )
  }

  fnGetCanalCliente= function () {  
    this.vSerGeneral.fnElementos(2, '965', this.pais, '1', 'asc', this.url).subscribe(
        res => {  
            this.lCboCanalCliente = res;
        },
        err => {
            console.log(err);
        },
        () => {
            // this.spinner.hide();

        }

    )
  }

  async fngetGen(){  
    let pParametro= []; 
     
    await this.vSerPresupuesto.fnPresupuesto( 8, pParametro, this.url).then( (value: any[]) => { 
      this.arrayPartida = []
      this.arrayPartida[0]= '';
      value.forEach((ele, i) => { 
        this.arrayPartida[ele.pId]=ele.l_Detalle
      });   
    }, error => {
      console.log(error); 
    });   
  } 

  fnGetCotizacion= function () {  
    this.vSerGeneral.fnElementos(1, '2137', '', '1', 'asc', this.url).subscribe(
        res => { 
            this.lCboCotizacion = res;
        },
        err => {
            console.log(err);
        },
        () => {
            // this.spinner.hide();

        }

    )
  }

  fnGetDinero= function () {  
    this.vSerGeneral.fnElementos(2, '442', this.pais, '1', 'asc', this.url).subscribe(
        res => { 
            this.lCboModena = res;
        },
        err => {
            console.log(err);
        },
        () => {
            // this.spinner.hide();

        }

    )
  }

  fnGetTipoCambio= function () {  
    this.vSerGeneral.fnSystemElements(3, '', '1',  'nElecod,cElenam', this.pais, this.url).subscribe(
        res => {  
            this.lCboTipoCambio = res;  
            this.lCboTipoCambio.forEach(element => {
              this.IdtipoCambio = element.codigo
              this.TipoCambio = element.valor
              return ;
            }); 
        },
        err => {
            console.log(err);
        },
        () => {
            // this.spinner.hide();

        }

    )
  }

  fnGetServicio= function () {  
    this.vSerGeneral.fnElementos(2, '741',  this.pais, '1', 'asc', this.url).subscribe(
        res => { 
            this.lCboServicio = res;
        },
        err => {
            console.log(err);
        },
        () => {
            // this.spinner.hide();

        }

    )
  }

  fnGetOrdenante= function () {  
    this.vSerGeneral.fnElementos(1, '2035',  this.pais, '1', 'asc', this.url).subscribe(
        res => { 
            this.lCboOrdenante = res;
        },
        err => {
            console.log(err);
        },
        () => {
            // this.spinner.hide();

        }

    )
  }

  fnGetCanal= function () {  
    this.vSerGeneral.fnElementos(1, '427',  this.pais, '1', 'asc', this.url).subscribe(
        res => { 
            this.lCboCanal = res;
        },
        err => {
            console.log(err);
        },
        () => {
            // this.spinner.hide();

        }

    )
  }
 
  fnGetSubCanal= function (Dad) {   
    this.spinner.show(); 
    this.vSerGeneral.fnElementos(1, Dad, this.pais, '1', 'asc', this.url).subscribe(
        res => {  
            this.lCboSubCanal = res;
        },
        err => {
            console.log(err);
        },
        () => {
            this.spinner.hide();

        }

    )
  }

  changePartida= function (a,i) { 
    this.vSerGeneral.fnSystemElements(2, a, '1', 'nElecod,cElenam', this.pais, this.url).subscribe(
      res => { 
        this.lCboPartidaEspeficia = res;
      },
      err => {
          console.log(err);
      },
      () => {
          // this.spinner.hide();

      } 
    )
  }


  //#endregion
  
  
  fnChange = function (op:number){ 
    if( op == 2){ 
      this.titulo ='Detalle ' 
      this.fngetGen();
      this.divCrePrePartida = false;
      this.divCrePre = true; 
      this.BtnArmar = false; 
      this.BtnModificar = true;
      this.BtnCreacion = false;
      if(this.EstadoPresupuestoCC != "Aprobado")
      {
        this.PresupuestoFormGroup.get('NroCliente').enable(); 
      } 
    } 
    if( op == 1){
      this.divCrePrePartida = true;
      this.divCrePre = false; 
    } 
  }



  //#region Primer registro
fnAction(a,op){
  let paramentro = [];
  let paraSuc = [];
  let paraCont= [];
  let vValidacionPri = this.PrimeraFormGroup.value; 
  let vValidacionPre = this.PresupuestoFormGroup.value; 
  let vValidacionDeta = this.DetalleFormGroup.value; 
  let vValidacionDir = this.DirectorFormGroup.value;  
  
  this.Empresa = localStorage.getItem('Empresa');  

  if(this.PrimeraFormGroup.invalid   ){  
    return Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Falta ingresar datos del presupuesto' 
    });
  }  
  else if(this.PresupuestoFormGroup.invalid ){
    return Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Falta ingresar datos del presupuesto' 
    });
  }
  else if(this.DetalleFormGroup.invalid ){
    return Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Falta ingresar datos en el detalle del presupuesto' 
    });
  }
  else if(this.DirectorFormGroup.invalid ){ 
    return Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Falta ingresar datos en la asignacion de directores' 
    });
  }  

  let valor= 0;
   
  
  let paraSucursal = [];  
  let psucursal = [];  
  let sinRepetidos = [...new Set(this.listPersonal)];
  sinRepetidos.forEach(function (value){  
    let paraEquipo = []; 
    let vEstado  ;  
    if(!value.pEstado){
      vEstado = 0;
    }
    else{
      vEstado = 1;
    } 
    
    paraEquipo.push(value.pIdSuc)  
    paraEquipo.push(value.pId)  
    paraEquipo.push(vEstado)
    paraSucursal.push(paraEquipo.join(','))   
    if(!value.pId && value.pIdSuc != ''){
      valor= 1
    }else{
      psucursal.push(value.pIdSuc)
    }
  })    

  if(valor == 1){
    return Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Falta asignar un equipo de trabajo' 
    });
  }

  let sinRepSuc = [...new Set(psucursal)];
 
  if(this.dataSourceSuc.data.length == 0){
    return Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Falta asignar una sucursal' 
    });
  } 

  this.dataSourceSuc.data.forEach(function (value){  
    let paraEquipo = [];   
    if(!value.pId){
      valor= 1
    }else{
      if(sinRepSuc.includes(value.pId) == false){ 
        paraEquipo.push(value.pId)   
        paraSucursal.push(paraEquipo.join(','))   
      } 
    }
  })    

  if(valor == 1){
    return Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Falta asignar una sucursal' 
    });
  }
 
  


  
  paramentro.push(this.Empresa);
  paramentro.push(this.id);
  paramentro.push(vValidacionPri.IdPre);
  paramentro.push(vValidacionPri.DescPresupuesto);
  paramentro.push(moment( vValidacionPre.FechaInicio , 'MM-DD-YYYY HH:mm:ss',true).format("YYYY-MM-DD"));
  paramentro.push(moment( vValidacionPre.sFechaFin , 'MM-DD-YYYY HH:mm:ss',true).format("YYYY-MM-DD"));
  paramentro.push(vValidacionPre.IdNroCliente); 
  //detalle
  paramentro.push(vValidacionDeta.SubCanal); 
  paramentro.push(vValidacionDeta.Ordenante); 
  paramentro.push(vValidacionDeta.Servicio); 
  paramentro.push(vValidacionDeta.Marca); // 10
  paramentro.push(vValidacionDeta.Modena); 
  paramentro.push(typeof vValidacionDeta.CanalCli=="undefined"?  '':vValidacionDeta.CanalCli); 
  paramentro.push(vValidacionDeta.Contacto);  
  //director
  paramentro.push(vValidacionDir.NroDirGeneral); 
  paramentro.push(vValidacionDir.NroDirCuentas); 
  paramentro.push(vValidacionDir.NroGerCuentas); 

  //Ejecutivo
  let cal = 0
  paraCont.push(vValidacionDir.NroEjecUno+','+vValidacionDir.ProEjecUno); 
  cal = vValidacionDir.ProEjecUno
  if(typeof vValidacionDir.NroEjecdos !="undefined"){
    paraCont.push(vValidacionDir.NroEjecdos+','+vValidacionDir.ProEjecdos);  
    cal += vValidacionDir.ProEjecdos
  }
  if(typeof vValidacionDir.NroEjecTres !="undefined"){
    paraCont.push(vValidacionDir.NroEjecTres+','+vValidacionDir.ProEjecTres);  
    cal += vValidacionDir.ProEjecTres
  }  
  
  if(cal != 100 ){
    return Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Falta asignar el porcentaje de responsabilidad del ejecutivo' 
    });
  }
 

  paramentro.push(paraCont.join('/'));  
  paramentro.push(paraSucursal.join('/'));  
  paramentro.push(vValidacionPre.idStatusPre);  
  paramentro.push(vValidacionPre.StatusCoti);  
  paramentro.push(vValidacionPre.nroeasywin);  
 
  
  Swal.fire({
    title: '¿Desea Guardar?', 
    showCancelButton: true,
    confirmButtonText: `Si`, 
    cancelButtonText: `No`,
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      this.fnGuardar(a,op,paramentro);
    } else{ 
    }
  })
   
  
  
}

fnGuardar(a,op,paramentro){
  let vValidacionPri = this.PrimeraFormGroup.value; 
  this.spinner.show();
  this.vSerPresupuesto.fnPresupuestoCrud(op, paramentro, this.url).subscribe(
     res => {   
       
       let Result = res.cod.split("-");   
        if(a === 0){
          this.BtnNuevo = false;
          this.BtnModificar = true;
          this.BtnArmar = false; 
          this.PrimeraFormGroup.controls.IdPre.setValue(Result[0]); 
          this.PrimeraFormGroup.controls.NumPresupuesto.setValue(Result[1]); 
          this.PrimeraFormGroup.controls.EstPresupuesto.setValue(Result[2]);  
          this.PresupuestoFormGroup.controls.Aprobacion.setValue(Result[3]);   
          this.EstadoPresupuestoCC = Result[3];
          this.nomPre = Result[1]+ ' '+ vValidacionPri.DescPresupuesto
          if(this.control == 1 && this.EstadoPresupuestoCC == "Aprobado"){  
            this.BtnMarca=true; 
          }
          else{ 
            this.BtnMarca=false;  
          }
          if(this.EstadoPresupuestoCC === "Aprobado"){
            this.BtnFactura=true; 
          }
          else{ 
            this.BtnFactura=false; 
          }
        
          if(Result[4] == '1')
          { 
            this.PresupuestoFormGroup.controls.idStatusPre.setValue(2034);   
            this.PresupuestoFormGroup.controls.StatusPre.setValue(2034);  
            this.fnValTipo(2034);
          }
        }
        else if (a === 1){
          if(Result[1] == '1')
          {  
            this.PresupuestoFormGroup.controls.idStatusPre.setValue(2034);   
            this.PresupuestoFormGroup.controls.StatusPre.setValue(2034);
            this.fnValTipo(2034);  
          }
          this.PrimeraFormGroup.controls.EstPresupuesto.setValue(Result[2]);  
        }

       Swal.fire({
         title: res.mensaje,
         showCancelButton: true,
         confirmButtonText: `Ok`,
       }).then((result) => {

          // btn.reset(); 
          // this.limpiar();
          // this.fnChange(0);
       })

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
//#endregion
  
  fnValTipo= function (op:number){  
    if(op == 2034)
    { 
      this.nomPresupuesto ='del Presupuesto' 
      this.PresupuestoFormGroup.get('StatusCoti').disable();   
    }
    else{
      this.nomPresupuesto ='de la Cotización'
      this.PresupuestoFormGroup.get('StatusCoti').enable();   
    }
    

  }

  
 

  
  //#region validador de fecha
  convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;   
  }
  //#endregion

  //#region validacion
  fnfecha(op:number,fecha ){
    if(op==0){
      this.fecIni = fecha
    }
    else{
      this.PresupuestoFormGroup.controls.sFechaFin.setValue(fecha);   
      this.fecFin = fecha
    } 

    if ( this.fecIni>this.fecFin ) {  
      ;
    }else{  
    } 
  } 

   //#region para agregar los ejecutivos
   setAll(val,op){  
    if(op == 0)
    {
      if(!val){
        this.DirectorFormGroup.controls.NroEjecdos.setValue("");  
        this.DirectorFormGroup.controls.ProEjecdos.setValue("");  
        this.DirectorFormGroup.get('NroEjecdos').disable();  
        this.DirectorFormGroup.get('ProEjecdos').disable(); 
      }
      else{
        this.DirectorFormGroup.get('NroEjecdos').enable();
        this.DirectorFormGroup.get('ProEjecdos').enable();  
      }
    }
    else{
      if(!val){
        this.DirectorFormGroup.controls.NroEjecTres.setValue("");  
        this.DirectorFormGroup.controls.ProEjecTres.setValue("");  
        this.DirectorFormGroup.get('NroEjecTres').disable(); 
        this.DirectorFormGroup.get('ProEjecTres').disable();    
      }
      else{
        this.DirectorFormGroup.get('NroEjecTres').enable(); 
        this.DirectorFormGroup.get('ProEjecTres').enable();  
      }
    }
    
  }
  //#endregion


  

  //#endregion

  

  fnTipo(){
    let vPer = this.PresupuestoFormGroup.value;  
    let vPri = this.PrimeraFormGroup.value;  
 
    if(vPer.idStatusPre === 2034)
    {
      this.PresupuestoFormGroup.get('StatusPre').disable();   
    }

  } 
  
  //#region editador de campaña 
  //#region sucursal (agregar , eliminar, listar personal)
  btnAgregarTSucursal(){
    let vOb = this.dataSourceSuc.data;
    let v = 0; 
    
    if(vOb.length === 0){
      Swal.fire({
        title: '¿Desea agregar todas las ciudades?', 
        showCancelButton: true,
        confirmButtonText: `Si`, 
        cancelButtonText: `No`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          this.lCboSucursal.map((ele)=>{
            vOb.push({ pNombre: '',pId:ele.pId });  
          })
          
          this.dataSourceSuc = new MatTableDataSource(vOb);  
          this.dataSourceSuc.sort  = this.tableSucSort  
        } else{ 
          vOb.push({ pNombre: '' });     
          this.dataSourceSuc = new MatTableDataSource(vOb);  
          this.dataSourceSuc.sort  = this.tableSucSort 
        }
      }) 
    }
    else{
      vOb.push({ pNombre: '' });     
      this.dataSourceSuc = new MatTableDataSource(vOb);  
      this.dataSourceSuc.sort  = this.tableSucSort 
    }
     
  }

  btnEliminarTSucursal(i,Obj){
    this.pIdSur = '';
    let vOb = this.dataSourceSuc.data
    vOb = vOb.filter(filtro => filtro != Obj);
    this.dataSourceSuc = new MatTableDataSource(vOb);   
    this.dataSourceSuc.sort  = this.tableSucSort  ; 

    const lpersonal: PreEquipo[] = [];
    this.dataSourceEquipo = new MatTableDataSource(lpersonal); 

    this.listPersonal = this.listPersonal.filter(filtro => filtro.pIdSuc != Obj.pId);  

    this.fnDisableSucursal();
     
  }

  changeEliminarTSucursal(i,Obj){
    this.pIdSur = ''; 

    const lpersonal: PreEquipo[] = [];
    this.dataSourceEquipo = new MatTableDataSource(lpersonal); 

    this.listPersonal = this.listPersonal.filter(filtro => filtro.pIdSuc != Obj.pId);  

    this.fnDisableSucursal();
     
  }

  fnLimpiarSucursal(id){   

    this.pIdSur =id;      
    
    if(id == "")  {
      const lpersonal: PreEquipo[] = [];
      this.dataSourceEquipo = new MatTableDataSource(lpersonal); 
    }
    else{ 
      
      this.dataSourceEquipo = new MatTableDataSource(
        this.listPersonal.filter(gestor => gestor.pIdSuc == id  )
      );    
       
    this.dataSourceEquipo.sort = this.tableEquipoSort;
    }
    
    this.fnDisablePersonal()

    
  }

  fnDisableEjecutivo(){
    let vValidacionDir = this.DirectorFormGroup.value; 
    let vPer = [ 
      vValidacionDir.NroEjecUno,
      vValidacionDir.NroEjecdos,
      vValidacionDir.NroEjecTres,
    ]; 

    this.lCboPersonaEje.forEach(element => {
      if(vPer.includes(element.pId) == true){
        element.pEstado = 0
      }
      else{
        element.pEstado = 1
      }
    });  

  }

  fnDisablePersonal(){
    let vValidacionDir = this.DirectorFormGroup.value;  
    let vPer = [
      vValidacionDir.NroDirGeneral,
      vValidacionDir.NroDirCuentas,
      vValidacionDir.NroGerCuentas,
      vValidacionDir.NroEjecUno,
      vValidacionDir.NroEjecdos,
      vValidacionDir.NroEjecTres,
    ]; 

    this.listPersonal.forEach(element => {
      vPer.push(element.pId) 
    });
 

    this.lCboPersona.forEach(element => {
      if(vPer.includes(element.pId) == true){
        element.pEstado = 0
      }
      else{
        element.pEstado = 1
      }
    });  
    
  }

  fnDisableSucursal(){
    let vSu = []; 

    this.dataSourceSuc.data.forEach(element => {
      vSu.push(element.pId) 
    });
 
    
    this.lCboSucursal.forEach(element => {
      if(vSu.includes(element.pId) == true){
        element.pEstado = 0
      }
      else{
        element.pEstado = 1
      }
    });   
    this.fnDisablePersonal()
  }
  //#endregion

  //#region opcion del equipo de la sucursal
  
  openPersonal(){      
    
    let Sucursal = this.lCboSucursal.filter(gestor => gestor.pId == this.pIdSur  );
    
    if(this.pIdSur == ''){ 
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta seleccionar una sucursal' 
      });
    }
    this.listPersonal.push({pSucursal:Sucursal[0].pNombre,pIdSuc:this.pIdSur});   
    
    this.dataSourceEquipo = new MatTableDataSource(
      this.listPersonal.filter(gestor => gestor.pIdSuc == this.pIdSur  )
    ); 
    this.dataSourceEquipo.sort = this.tableEquipoSort;
 
  } 
  
  deleteRowDataPer(i,Obj){
    let vOb = this.dataSourceEquipo.data
    vOb = vOb.filter(filtro => filtro != Obj);
    this.dataSourceEquipo = new MatTableDataSource(vOb);   
    this.dataSourceEquipo.sort  = this.tableSucSort  ; 
    this.listPersonal = this.listPersonal.filter(filtro => filtro.pIdSuc != Obj.pIdSuc);  

    
  } 

  //#endregion

  
   
  //#endregion
  
 
  //#region presupuesto con partidas
  async fnArmarPre(){
    let pParametro= []; 
    let vValidacionPri = this.PrimeraFormGroup.value;   
    let vValidacionPre = this.PresupuestoFormGroup.value;   
    let fecha = new Date(vValidacionPre.sFechaFin); 
    fecha.setDate(fecha.getDate() + 1)
    fecha = new Date(fecha) 

    pParametro.push(vValidacionPri.IdPre); 
    pParametro.push(this.id);
    pParametro.push(this.Empresa); 
    this.pIdCC = vValidacionPri.IdPre
    if(vValidacionPri.IdPre == ''){
      return;
    } 
     
    
    this.spinner.show();
    await this.vSerPresupuesto.fnPresupuesto( 7, pParametro, this.url).then( (value: any[]) => {    
       
      this.titulo ='Armado ' 
      this.pMargen = value["pMargen"]; 
      
      let partida: any [] = value["lPartida"]; 
      let sucursal: any [] = value["lsucursal"];  
      this.ColumnaPartida = sucursal;

      this.BtnArmar =true;
      this.BtnModificar = false;
      this.BtnCreacion = true; 
      this.vDetPartida['data'] = value;
      this.vDetPartida['lPartida'] = this.arrayPartida;
      this.vDetPartida['IdtipoCambio'] = this.IdtipoCambio;
      this.vDetPartida['TipoCambio'] = this.TipoCambio;
      this.vDetPartida['lPartidaGenerica'] = this.lCboPartidaGenerica;
      this.vDetPartida['Validacion'] = this.divValidacion;
      this.vDetPartida['Perfil'] = this.Perfil;
      this.vDetPartida['fecha'] = fecha;
      this.vDetPartida['nombre'] = this.nomPre ;
      this.vDetPartida['pPermisoDescarga'] = this.pPermisoDescarga ;


      if(sucursal.length == 0){
        return Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'falta asignar ciudad y equipo' 
        });
      }
      else
      { 
        this.PresupuestoFormGroup.get('NroCliente').disable(); 
        this.divCrePre =false;
        this.divCrePrePartida =true;  
      } 
 
      
    }, error => {
      console.log(error); 
    }); 
    this.spinner.hide();  
    
  }
  //#endregion
  

  fnGuardarPPTO(op,pParametro){ 
    this.spinner.show();
    this.vSerPresupuesto.fnPresupuestoCrud( op, pParametro, this.url).subscribe(
      res => {   
        let Result = res.cod.split("-");  
        if(Result.length > 1){ 
         this.PrimeraFormGroup.controls.EstPresupuesto.setValue(Result[2]); 
         this.BtnCopiar = true;   
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

  fnAprobacion(op){ 
    let pParametro =[];
    let vValidacionPri = this.PrimeraFormGroup.value;  

    if(op == 15){
      
    pParametro.push(this.id);
    pParametro.push(this.pais); 
    pParametro.push(vValidacionPri.IdPre);

    Swal.fire({
      title: '¿Desea aprobar el presupuesto?', 
      showCancelButton: true,
      confirmButtonText: `Si`, 
      cancelButtonText: `No`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.fnGuardarApro(op,pParametro);
      } else{ 
      }
    }) 
    
    }
    else{
      var vData = new Object();
      vData["idPresupuesto"] = vValidacionPri.IdPre;
      vData["estado"] = vValidacionPri.IdPre;
      vData["perfil"] = this.Perfil;

      const dialogRef = this.dialog.open(DigcomentarioaprobacionComponent, {
        width: '650px',
        height: '420px',
        data: vData ,
      });

      dialogRef.afterClosed().subscribe(result => {    
           
          if(!result){ 
            return;
          }  
          if(!result.data){ 
            return;
          }
          this.PresupuestoFormGroup.controls.Aprobacion.setValue(result.data);   
          this.EstadoPresupuestoCC = result.data

          if(this.control == 1 && this.EstadoPresupuestoCC == "Aprobado"){  
            this.BtnMarca=true; 
          }
          else{ 
            this.BtnMarca=false;  
          }
          if(this.EstadoPresupuestoCC === "Aprobado"){
            this.BtnFactura=true; 
          }
          else{ 
            this.BtnFactura=false; 
          }
      }); 
    }

 
  }

  fnGuardarApro(op, paramentro){
    this.spinner.show();
    this.vSerPresupuesto.fnPresupuestoCrud( op, paramentro, this.url).subscribe(
      res => {    
         let Result = res.cod.split("-");  
         this.PresupuestoFormGroup.controls.Aprobacion.setValue(Result[1]);  
         this.EstadoPresupuestoCC = Result[1]
         if(this.control == 1 && this.EstadoPresupuestoCC == "Aprobado"){  
          this.BtnMarca=true; 
        }
        else{ 
          this.BtnMarca=false;  
        }
         if(this.EstadoPresupuestoCC === "Aprobado"){
          this.BtnFactura=true; 
        }
        else{ 
          this.BtnFactura=false; 
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

  //#region  descarga
  fnDescargar  = function() { 
    let vValidacionPri = this.PrimeraFormGroup.value;   
    let para = [];
    let op = '17'

    if(this.PrimeraFormGroup.invalid ){ 
      return;
    } 
    para.push(this.id);
    para.push(this.Empresa);
    para.push(vValidacionPri.IdPre);

    if(this.pPermisoDescarga === 0){
      Swal.fire({
        title: '¿Deseas descargar?', 
        showCancelButton: true,
        confirmButtonText: `Ok`, 
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */  
          if (result.isConfirmed) {   
            para.push(0);
            this.fnGetDescarga(op,para) 
          }  
      }) 
    }
    else{
      Swal.fire({
        title: '¿Descargar XLS con tarifa por día o mensual?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: `Día`,
        denyButtonText: `Mensual`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */  
          if (result.isConfirmed) {   
            para.push(0);
            this.fnGetDescarga(op,para)
              
          } else if (result.isDenied) { 
            para.push(1);
            this.fnGetDescarga(op,para)
          } 
      }) 
    } 
   

  }

  fnGetDescarga(op,para){
    this.spinner.show(); 
    this.vSerPresupuesto.fnExcelDownload(op,para,this.url).subscribe(
      (res: any) => {  
        this.downloadFile(res); 
      },
      err => {
        console.log(err);
        this.spinner.hide();

      },
      () => { 
      }
    )
  }

  public downloadFile(response: any) { 
    
    // let name =  vValidacionPri.NumPresupuesto +' ' + vValidacionPri.DescPresupuesto
    let name = this.nomPre; 

    var blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    saveAs(blob, name + '.xlsx');
    this.spinner.hide(); 
     
  } 

  //#endregion
  

  //#region  ver estado del presupuesto
  async fnVerEstado(){
    let vRQ  = this.PrimeraFormGroup.value;  
    let pParametro= [];
    pParametro.push(vRQ.IdPre); 

    if(vRQ.IdPre != ''){
      this.spinner.show(); 
      await this.vSerPresupuesto.fnPresupuesto( 18, pParametro, this.url).then( (value: Estado[]) => {  
         
        const dialogRef = this.dialog.open(EstadoefectivoComponent, {
          width: '620px',
          data: value ,
        });
    
        dialogRef.afterClosed().subscribe(result => { 
        }); 
      }, error => {
        console.log(error); 
      }); 
      this.spinner.hide(); 
    }
    
    
  }

  async fnCambioEstado(){
    let vRQ  = this.PrimeraFormGroup.value; 
    const dialogRef = this.dialog.open(DigCambioEstadoComponent, {
      width: '400px',
      disableClose: true ,
      data: {id:vRQ.IdPre} ,
    });

    dialogRef.afterClosed().subscribe(result => { 
      if(typeof result.data.cod === "undefined"){
        return;
      }
      else if(result.data.cod === '0')
      {
        return;
      }
      else{  
        this.PrimeraFormGroup.controls.EstPresupuesto.setValue(result.data.mensaje);
        if(result.data.mensaje === "Cerrado" || 
        result.data.mensaje === "Anulado" ||
        result.data.mensaje === "Cancelada"){
          this.divValT = true;   
          this.divVal = true;  
          this.divValidacion = true;  
          this.BtnModificar = false;
          this.BtnCreacion = false; 
          
          this.PrimeraFormGroup.disable();
          this.PresupuestoFormGroup.disable();
          this.DetalleFormGroup.disable();
          this.DirectorFormGroup.disable();
          this.DirectorFormGroup.disable();
        }
        else{
          this.divValT = true;   
          this.divVal = true;  
          this.divValidacion = false;  
          this.BtnModificar = true;  
          
          this.PrimeraFormGroup.get('IdPre').enable(); 
          this.PrimeraFormGroup.get('DescPresupuesto').enable(); 

          this.PresupuestoFormGroup.get('FechaInicio').enable(); 
          this.PresupuestoFormGroup.get('FechaFin').enable(); 
          this.PresupuestoFormGroup.get('NroCliente').enable(); 
          this.PresupuestoFormGroup.get('idStatusPre').enable(); 
          // this.PresupuestoFormGroup.get('StatusCoti').enable(); 

          
          this.DetalleFormGroup.get('Canal').enable(); 
          this.DetalleFormGroup.get('SubCanal').enable(); 
          this.DetalleFormGroup.get('Ordenante').enable(); 
          this.DetalleFormGroup.get('Servicio').enable(); 
          this.DetalleFormGroup.get('Marca').enable(); 
          this.DetalleFormGroup.get('Modena').enable();   
          this.DetalleFormGroup.get('Contacto').enable();

          let vPer = this.PresupuestoFormGroup.value;  
          if(vPer.NroCliente == 38){
            this.DetalleFormGroup.get('CanalCli').enable();   
          }
          else{ 
            this.DetalleFormGroup.get('CanalCli').disable();  
          }
          
          this.DirectorFormGroup.get('NroDirGeneral').enable(); 
          this.DirectorFormGroup.get('NroDirCuentas').enable(); 
          this.DirectorFormGroup.get('NroGerCuentas').enable(); 
          this.DirectorFormGroup.get('NroEjecUno').enable(); 
          this.DirectorFormGroup.get('ProEjecUno').enable(); 
          
        }

      } 
      
    }); 
  }
  //#endregion


  async fnVerfactura(){
    
    let vRQ  = this.PrimeraFormGroup.value;  
    let pParametro= [];
    pParametro.push(vRQ.IdPre);    
    
    if(vRQ.IdPre != ''){
      this.spinner.show(); 
      await this.vSerPresupuesto.fnPresupuesto( 37, pParametro, this.url).then( (value:any) => {  
         
        const dialogRef = this.dialog.open(DigFacturacionComponent, {
          width: '620px',
          data: value ,
        });
    
        dialogRef.afterClosed().subscribe(result => { 
        }); 
      }, error => {
        console.log(error); 
      }); 
      this.spinner.hide(); 
    }
  } 

  //#endregion
  
  recibirMensaje(mensaje:string){ 
    let Result = mensaje.split("|");  

    if(Result[0] === "2"){
      this.fnChange(2);
    }
    else if(Result[0] === "3"){ 
      this.PrimeraFormGroup.controls.EstPresupuesto.setValue(Result[1]);  
    }
    else if(Result[0] === "4"){ 
      this.PresupuestoFormGroup.controls.Aprobacion.setValue(Result[2]);  
      this.EstadoPresupuestoCC =  Result[2]
      if(this.control == 1 && this.EstadoPresupuestoCC == "Aprobado"){  
        this.BtnMarca=true; 
      }
      else{ 
        this.BtnMarca=false;  
      }

      if(this.EstadoPresupuestoCC === "Aprobado"){
        this.BtnFactura=true; 
      }
      else{ 
        this.BtnFactura=false; 
      }
    } 
    
  }
  

  async fnValidarPartida(pParametro){
    let bReturn = false;
    this.spinner.show(); 
    await this.vSerPresupuesto.fnPresupuesto(38, pParametro, this.url).then((value: any) => {
      if(value.cod === "1"){
        bReturn = true;
      } 
    }); 
    return bReturn; 
  }
  
  async getEasywin(){
    let vValidacionPre = this.PresupuestoFormGroup.value;  
    let error = false ; 
    let errorNumerico = false ; 
    let param =[];
    
    errorNumerico = await this.validarNumero(vValidacionPre.nroeasywin);
     
    if(errorNumerico){
      this.PresupuestoFormGroup.controls.nroeasywin.setValue('');
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'el nro de PPTO del EasyWin debe ser numérico'
      });
    } 
    
    if(vValidacionPre.NroCliente == ''){
      this.PresupuestoFormGroup.controls.nroeasywin.setValue('');
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe seleccionar el cliente'
      });
    } 
    param.push(this.PresupuestoFormGroup.get('NroCliente').value)
    param.push(vValidacionPre.nroeasywin)
    
    this.spinner.show();  
    error = await this.validarPPTO(param);
    this.spinner.hide();   

    if(!error){ 
      this.PresupuestoFormGroup.controls.nroeasywin.setValue('');
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El cliente del presupuesto EasyWin ' + vValidacionPre.nroeasywin + ' no coincide con este cliente.'
      });
    }
    

  }

  private async  validarPPTO(param) {
    var flag: boolean = false; 

    await this.vSerPresupuesto.fnPresupuesto( 39, param, this.url).then( (value: any) => { 
      console.log(value);
      if(value.cod === '1'){
        flag =true;
      }
    }, error => {
      console.log(error); 
    });    

    return flag;
  }

  
  private async  validarNumero(valor) {
    var flag: boolean = false; 
    if( isNaN(valor) ) { // Sino es número devuelve true, si es false 
      flag = true; 
    }
    return flag;
  }


}
