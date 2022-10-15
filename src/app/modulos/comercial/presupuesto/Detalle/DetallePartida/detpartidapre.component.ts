import { Component, OnInit, Input, Inject, ViewChild, EventEmitter, Output } from '@angular/core'; 
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms'; 
import { NgxSpinnerService } from 'ngx-spinner';  
import Swal from 'sweetalert2';

import { EstadoefectivoComponent } from './../../../requerimiento/efectivo/estadoefectivo/estadoefectivo.component';  
import { Estado } from './../../../requerimiento/model/IEfectivo';   

import { DigcomentarioaprobacionComponent } from './../../digcomentarioaprobacion/digcomentarioaprobacion.component';

import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';    
import { MatDialog } from '@angular/material/dialog'; 
 
import {ListaPartida} from './../../../Models/Ipresupuesto';    
import {SerPresupuestoService} from './../../serpresupuesto.service';    
import {DetPartidaPersonalComponent} from './../DetallePartidaPersonal/detpartidapersonal.component';   
import {DetPartidaGenericaComponent} from './../DetallePartidaGenerica/detpartidagenerica.component';     

import { DigcopiaComponent } from './../../digCopia/digcopia.component';      

import { comercialAnimations } from '../../../Animations/comercial.animations';  

@Component({
  selector: 'app-detpartidapre',
  templateUrl: './detpartidapre.component.html',
  styleUrls: ['./detpartidapre.component.css']  , 
  animations: [ comercialAnimations]
})
export class DetPartidaPreComponent implements OnInit {
  //#region declaracion variable del sistema
  id:number; 
  url: string;  
  pais: string; 
  Empresa:string; 
  lPar:number; 
  //#endregion 

  idestado:number; 
  sEstadoApro:string;
  idCentroCosto:number; 
  nMargenRes:number; 
  NumCentroCosto:string; 
  Perfil:string;
  sEstado:string;
  tamaño:number; 
  divValidacion:boolean;
  fecha:Date; 
  BtnCopiar:boolean;
  BtnCreacion:boolean;
  divValPresupuesto:boolean;
  BtnEstado:boolean = false; 
  divPermiso:boolean;  
  divValPais:boolean = true;
  pPermisoDescarga:number = 0;  

  //#region validando la fecha 
  IdtipoCambio: number;
  TipoCambio: string='';
  nomPre:string;
  //#endregion

  //#region filtros para la tabla de partidas con ofivina 
  clsColumnaOpc: any[]=[];    
  lCboPartidaGenerica:any;
  arrayPartida = new Object();  
  sucursal:any [];
  //#endregion

  displayedColumnsPartida: string[] = [];
  dataSourcePartida: MatTableDataSource<any>; 

  totalFormGroup: FormGroup;  

  abLista = [];
  tsLista = 'inactive'; 
  fbLista = [
    {icon: 'person_add', tool: 'Nuevo personal'}
  ];
  
  lblLista :ListaPartida[] = [];
  
  vFeePer:number; 
  vFeeres:number;  
  vtotalPer:number; 
  vtotalres:number;  

  @Input() pDetPartida: any;
  
  @Output()
  enviar: EventEmitter<string> = new EventEmitter<string>();

  constructor( 
    private spinner: NgxSpinnerService,  
    private vSerPresupuesto: SerPresupuestoService,  
    private dialog: MatDialog,
    private formBuilder: FormBuilder, 
    @Inject('BASE_URL') baseUrl: string, 
    ) { 
      this.url = baseUrl;   
      this.pais = localStorage.getItem('Pais'); 
      this.Empresa = localStorage.getItem('Empresa');
      const user = localStorage.getItem('currentUser');
      if(this.pais === '604'){
        this.divValPais = false;
      }
      this.id = JSON.parse(window.atob(user.split('.')[1])).uid;  
  }

  ngOnInit(): void {   
           
    this.idestado = this.pDetPartida.data.pnEstado
    this.NumCentroCosto = this.pDetPartida.data.pCodCC
    this.idCentroCosto = this.pDetPartida.data.pnIdCC
    this.nMargenRes = this.pDetPartida.data.pMargen
    this.arrayPartida = this.pDetPartida.lPartida
    this.lCboPartidaGenerica = this.pDetPartida.lPartidaGenerica;
    this.divValidacion = this.pDetPartida.Validacion;
    this.sucursal = this.pDetPartida.data.lsucursal;
    this.IdtipoCambio = this.pDetPartida.IdtipoCambio;
    this.TipoCambio = this.pDetPartida.TipoCambio; 
    this.fecha = this.pDetPartida.fecha; 
    this.nomPre = this.pDetPartida.nombre; 
    this.Perfil = this.pDetPartida.Perfil; 
    this.pPermisoDescarga = this.pDetPartida.pPermisoDescarga; 

    let lPresupuesto =  ['625','2278','2153']; 
    
    if(lPresupuesto.includes(this.Perfil.toString()) == true){

      if(this.idestado === 2074 ){
        this.divPermiso = true; 
      }
      else{
        this.divPermiso = false;  
      }

      if(this.idestado === 2074|| this.idestado ===2072 || this.idestado ===2077 ){
        this.divValPresupuesto = false; 
      }
      else{ 
        this.divValPresupuesto = true; 
      }
      this.displayedColumnsPartida = ['estado','pPartidaGen','pPartidaEsp','pParitdaMargen','pTotal']; 
    }
    else{ 
      this.divPermiso = true; 
      this.displayedColumnsPartida = ['estado','pPartidaGen','pPartidaEsp','pTotal']; 
    }

    if(this.idestado === 2074 || this.idestado ===2072 || this.idestado ===2077){
      this.BtnCreacion = false; 
    }
    else{ 
      this.BtnCreacion = true; 
    }

    
    this.totalFormGroup = this.formBuilder.group({ 
      totalPer: [{value: '', disabled: true} , Validators.required],
      FeePer: [{value: '', disabled: this.divPermiso}, Validators.required] ,
      FeePertotal: [{value: '', disabled: true} , Validators.required],
      totalres: [{value: '', disabled: true} , Validators.required],
      Feeres: [{value: '', disabled: this.divPermiso}, Validators.required] ,
      Feerestotal: [{value: '', disabled: true} , Validators.required],
      descuento: [{value: '', disabled:  this.divPermiso}, Validators.required] ,
      totalSol: [{value: '', disabled: true} , Validators.required],
      totalDol: [{value: '', disabled: true} , Validators.required],
    });   


   
    this.fnListaPartida(0,this.pDetPartida.data); 
    
    
  }

  fnEstado(){
    let lPresupuesto =  ['625','2278','2153'];

    if(lPresupuesto.includes(this.Perfil.toString()) == true){

      if(this.idestado === 2074 ){
        this.divPermiso = true; 
      }
      else{
        this.divPermiso = false;  
      }

      if(this.idestado === 2074|| this.idestado ===2072 ){
        this.divValPresupuesto = false; 
      }
      else{ 
        this.divValPresupuesto = true; 
      } 
    }
    else{ 
      this.divPermiso = true;  
    }

    if(this.idestado === 2074){
      this.BtnCreacion = false; 
    }
    else{ 
      this.BtnCreacion = true; 
    }
  }

  fnChange (op:number){
    if(op === 2){
      this.enviar.emit(op+'||'); 
    }
    else if(op === 3){
      this.enviar.emit(op+'|'+this.sEstado+'|');  
    }
    else if(op === 4){
      this.enviar.emit(op+'|'+this.idestado+'|'+this.sEstadoApro);  
    }
  }

  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }


  fnListaPartida(op,data){
    let partida: any = data.lPartida 
    

    let sumaPer=0,sumares=0;  
    this.tamaño= 900;
    var tabla = document.getElementById("tablaPartida"); 

    if(op === 0){
      this.sucursal.forEach(element => {  
        this.tamaño += 100;
        this.displayedColumnsPartida.push(element.pNombre)
        this.clsColumnaOpc.push({id:element.pCod,col:element.pNombre})  
      });
    }
    
    this.lblLista.length = 0;
 
    partida.forEach((ele, i)=> {
      var arraySelects = new Object();
      var arrayPrimera= new Object(); 
         
        
      let suma =0; 
      ele.lSucursal.forEach( (elee, ii)=> {  
        let importe = (typeof elee.pImporte === "undefined" ? 0:elee.pImporte)
        arraySelects[elee.pCod]=  importe  ; 
        arrayPrimera[elee.pCod]=  elee.lPartidaPersonal ;  
      }); 
 
      if(ele.pPartidaGen == 128 || ele.pPartidaGen == 137){
        sumaPer += +ele.total
      }else{
        sumares += +ele.total
      }  
        
      this.lblLista.push({
        registro:ele.pdetalle,
        estado:(ele.pPartidaGen == 128 ? 0:1),
        pPartidaGen:(ele.pPartidaGen == 0 ? '':ele.pPartidaGen.toString()),
        pPartidaEsp:(ele.pPartidaEsp == 0 ? '':ele.pPartidaEsp),
        pParitdaMargen:ele.pParitdaMargen,
        psTotal: ele.sTotal,
        pTotal:ele.total,
        lsucursal:arraySelects,
        lPersonal: null,
        ptipo: ele.ptipo
      })


    });
 
    
    this.dataSourcePartida = new MatTableDataSource(this.lblLista); 
    this.fnDisabledPartida();
    tabla.setAttribute("width", this.tamaño.toString());

    this.totalFormGroup.controls.FeePer.setValue(data["pFeePer"]); 
    this.totalFormGroup.controls.Feeres.setValue(data["pFeeOpe"]); 
    this.totalFormGroup.controls.descuento.setValue(data["pDescuento"]); 
    this.totalFormGroup.controls.totalPer.setValue(this.fnDecimal(sumaPer)); 
    this.totalFormGroup.controls.totalres.setValue(this.fnDecimal(sumares)); 
    this.vFeePer = +data["pFeePer"] ;
    this.vFeeres = +data["pFeeOpe"] ; 
    this.vtotalPer = +sumaPer.toFixed(2) ;
    this.vtotalres = +sumares.toFixed(2) ; 
  
    if(this.lblLista.length > 0){
      this.BtnCopiar = true;
    }
    else{ 
      this.BtnCopiar = false;
    }

    this.fnCalculo();
  } 

  public fnDecimal (num:number): string { 
    let anuncio : string ='' 
    let numfin = +num.toFixed(2)
    anuncio = numfin.toLocaleString();
    let result = anuncio.split(',') 
    let re = /\./gi;
    let numero : string =result[0].replace(re,',')
    let decimal : string = (typeof result[1] === 'undefined'? '00':result[1])
    
    let final = numero+'.'+decimal
    
    return final;
  }
  
  fnAprobacion(op){ 
    let pParametro =[]; 

    if(op == 15){
      
    pParametro.push(this.id);
    pParametro.push(this.pais); 
    pParametro.push(this.idCentroCosto);

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
      vData["idPresupuesto"] = this.idCentroCosto;
      vData["estado"] = this.idCentroCosto;
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
          // this.PresupuestoFormGroup.controls.Aprobacion.setValue(result.data);   
      }); 
    }

 
  }

  fnGuardarApro(op, paramentro){
    this.spinner.show();
    this.vSerPresupuesto.fnPresupuestoCrud( op, paramentro, this.url).subscribe(
      res => {    
         let Result = res.cod.split("-");     
         this.sEstadoApro = Result[1];
         this.fnChange(4)
         this.fnEstado()
        //  fnEstado()
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

   

  fnDisabledPartida(){  
    let lValidacion=  [];
    let lParGen =  [];
    let lPar =  [];
 

    this.dataSourcePartida.data.forEach(element => {   
      lPar.push({
        pPartidaGen:element.pPartidaGen,
        pPartidaEsp:element.pPartidaEsp, 
      })  
    });

    lPar.map((e)=>{
      lParGen.push({
        pPartidaGen:e.pPartidaGen, 
      }) 
    })

    lPar = [...new Set(lPar)];
 
    lPar.map((eCC)=>{
      let lCa =[];
      lPar.map((e)=>{
        if(eCC.pPartidaGen === e.pPartidaGen){
          if(e.canal != ""){ 
            lCa.push(e.pPartidaEsp)
          }
        } 
      })
      lValidacion.push({
        codigo:eCC.pPartidaGen,
        lista:lCa 
      })
    })

    lValidacion = [...new Set(lValidacion)]; 

    lValidacion.map((e)=>{
      let num:number = e.codigo
      let lista = []
      lista = e.lista 
      this.arrayPartida[num].forEach(eleCat => { 
        if(lista.includes(eleCat.pId) == true){  
          eleCat.estado = 0; 
        }
        else{ 
          eleCat.estado = 1;  
        } 
      });  
    })   
  }
  
  fnCalculo(){ 
    let vCal = this.totalFormGroup.value;  
    let FeeTxPer = 0;
    let FeeTxRes = 0;
    let TotalSol = 0;
    let TotalDol = 0;
    
    this.vFeePer = +vCal.FeePer;
    this.vFeeres = +vCal.Feeres;
    FeeTxPer =  this.vtotalPer * (this.vFeePer) / 100 
    FeeTxRes =  this.vtotalres * (this.vFeeres) / 100   
    
    TotalSol = (+this.vtotalPer) + (+this.vtotalres) +FeeTxPer + FeeTxRes - (+vCal.descuento)
    TotalDol = TotalSol / (+this.TipoCambio) 
    
    this.totalFormGroup.controls.FeePertotal.setValue(this.fnDecimal(FeeTxPer));  
    this.totalFormGroup.controls.Feerestotal.setValue(this.fnDecimal(FeeTxRes)); 
    this.totalFormGroup.controls.totalSol.setValue(this.fnDecimal(TotalSol)); 
    this.totalFormGroup.controls.totalDol.setValue(this.fnDecimal(TotalDol)); 
  
  }

  fnCalculoTotal(){ 
    let vCal = this.totalFormGroup.value;  
    let FeeTxPer = 0;
    let FeeTxRes = 0;
    let TotalSol = 0;
    let TotalDol = 0; 

    FeeTxPer =  this.vtotalPer * (+vCal.FeePer) / 100 
    FeeTxRes =  this.vtotalres * (+vCal.Feeres) / 100   
    
    TotalSol = (+this.vtotalPer) + (+this.vtotalres) +FeeTxPer + FeeTxRes - (+vCal.descuento)
    TotalDol = TotalSol / (+this.TipoCambio) 
    
    this.totalFormGroup.controls.FeePertotal.setValue(this.fnDecimal(FeeTxPer));  
    this.totalFormGroup.controls.Feerestotal.setValue(this.fnDecimal(FeeTxRes)); 
    this.totalFormGroup.controls.totalSol.setValue(this.fnDecimal(TotalSol)); 
    this.totalFormGroup.controls.totalDol.setValue(this.fnDecimal(TotalDol)); 
  
  }


  //#region  dialog de articulo y personal

  fnDetalle(Obj,i){ 
    
    if(Obj.pPartidaGen === "128"){
      this.fnDetallePersonal(Obj,i);
    }
    else{
      this.fnDetalleGenerico(Obj,i); 
    } 
  }
  //#region  personal
  async fnDetallePersonal(Obj,index){
    let pParametro= [];  
    pParametro.push(this.Empresa);
    pParametro.push(this.idCentroCosto); 
    pParametro.push(Obj.pPartidaEsp);    
    
    this.spinner.show();
    await this.vSerPresupuesto.fnPresupuesto( 10, pParametro, this.url).then( (value: any[]) => { 
          
      if(value.length == 0){
        this.spinner.hide();
        return Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No tiene tarifario asignado' 
        });
      }  

      this.getPersonal(value,Obj,index );
  
    }, error => {
      console.log(error); 
      this.spinner.hide();
    }); 
     
    
  }

  async getPersonal(cat,Obj, index ){
    var vData = new Object(); 
    let sGenerica
    let sEspecifica 
    this.lCboPartidaGenerica.map((e) =>{
      if(e.codigo === Obj.pPartidaGen)
      {
        sGenerica = e.valor; 
      } 
      
    }) 

    this.arrayPartida[Obj.pPartidaGen].map((e) =>{
      if(e.pId === Obj.pPartidaEsp)
      {
        sEspecifica = sGenerica.substr(0,2) + e.pDesc
      }  
    }) 

    vData["categoria"] = cat;
    vData["idCentroCosto"] = this.idCentroCosto;  
    vData["idPartida"] = Obj.pPartidaEsp; 
    vData["sPartida"] = sEspecifica; 
    vData["Margen"] = Obj.pParitdaMargen; 
    vData["validacion"] = this.divValidacion; 
    vData["sucursal"] = this.sucursal; 
    vData["Perfil"] = this.Perfil; 
    
    let pParametro= [];   
    pParametro.push(this.idCentroCosto); 
    pParametro.push(Obj.pPartidaEsp);    
    await this.vSerPresupuesto.fnPresupuesto( 23, pParametro, this.url).then( (value: any[]) => { 
      vData["lPersonal"] = value;  
       
      this.spinner.hide();
      this.fnDetPersonal(vData); 
  
    }, error => {
      this.spinner.hide();
      console.log(error); 
    }); 

     

  }

  fnDetPersonal(vData){
    const dialogRef = this.dialog.open(DetPartidaPersonalComponent, {
      width: '1150px',
      height: '510px',
      disableClose: true ,
      data: vData ,
    });
    dialogRef.afterClosed().subscribe(result => {  
      if(result.data === 0){
        return;
      }

      this.fnLista();

    });  

  }

  //#endregion

  //#region articulo
  async fnDetalleGenerico(Obj,index){ 
    let pParametro= [];   
    var vData = new Object();  
    let sGenerica
    let sEspecifica 
    this.lCboPartidaGenerica.map((e) =>{
      if(e.codigo === Obj.pPartidaGen)
      {
        sGenerica = e.valor; 
      } 
      
    }) 

    this.arrayPartida[Obj.pPartidaGen].map((e) =>{
      if(e.pId === Obj.pPartidaEsp)
      {
        sEspecifica = sGenerica.substr(0,2) + e.pDesc
      }  
    }) 
 

    vData["idCentroCosto"] = this.idCentroCosto; 
    vData["validacion"] = this.divValidacion; 
    vData["sucursal"] = this.sucursal; 
    vData["idPartida"] = Obj.pPartidaEsp; 
    vData["sPartida"] = sEspecifica; 
    vData["Margen"] = Obj.pParitdaMargen; 

    if(Obj.ptipo === 0) {
      Swal.fire({
        title: '¿Desea agregar el detalle con ciudades de manera horizontal o vertical?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: `Vertical`,
        denyButtonText: `Horizontal`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */ 
        
          if (result.isConfirmed) {     
            vData["tipo"] = 1;   
            pParametro.push(this.idCentroCosto); 
            pParametro.push(Obj.pPartidaEsp);   
            this.fnDetalleGenericoAbrir(pParametro,vData);
            
          } else if (result.isDenied) {
            vData["tipo"] = 2;  
            pParametro.push(this.idCentroCosto); 
            pParametro.push(Obj.pPartidaEsp);   
            this.fnDetalleGenericoAbrir(pParametro,vData);
          } 
      }) 
    }
    else{ 
      vData["tipo"] = Obj.ptipo;  
      pParametro.push(this.idCentroCosto); 
      pParametro.push(Obj.pPartidaEsp);  
      this.fnDetalleGenericoAbrir(pParametro,vData);  
       
    }
     
    
 
  }

  
  async fnDetalleGenericoAbrir(pParametro,vData){    
    this.spinner.show(); 
      await this.vSerPresupuesto.fnPresupuesto( 22, pParametro, this.url).then( (value: any[]) => {  
        
        vData["det"] = value
        this.spinner.hide();
        this.fnDetgenerico(vData);
    
      }, error => {
        console.log(error); 
      }); 
  }



  fnDetgenerico(vData){
    const dialogRef = this.dialog.open(DetPartidaGenericaComponent, {
      width: '1000px',
      height: '510px',
      disableClose: true ,
      data: vData ,
    });
    dialogRef.afterClosed().subscribe(result => {   
      if(result.data === 0){
        return;
      }

      this.fnLista();

    }); 
  }
 
  //#endregion
   
  //#endregion

  async fnLista(){ 
    
    let pParametro= [];   
    pParametro.push(this.idCentroCosto); 
    pParametro.push(this.id);
    pParametro.push(this.Empresa); 
    this.spinner.show();
    await this.vSerPresupuesto.fnPresupuesto( 7, pParametro, this.url).then( (value: any) => {  
      this.sEstado = value.psEstado
      this.fnChange (3) 
      
      this.fnListaPartida(1,value);
    }, error => {
      this.spinner.hide();
      console.log(error); 
    }); 
    this.spinner.hide();
  }

  
  fnCopiar(){
    // PrimeraFormGroup  
    
    
    var vData = new Object();
    vData["fecha"] =  this.fecha
    vData["idPresupuesto"] = this.idCentroCosto;

    const dialogRef = this.dialog.open(DigcopiaComponent, {
      width: '350px',
      height: '320px',
      data: vData ,
    });

    dialogRef.afterClosed().subscribe(result => {    

      if(!result){ 
        return;
      }  
      
      // this.PrimeraFormGroup.controls.IdPre.setValue(result.data.id); 
      // this.PrimeraFormGroup.controls.NumPresupuesto.setValue(result.data.cod); 
       
    });  
  }

  //#region 
    

  fnDescargar  = function() {  
    let para = [];
    let op = '17'
 
    para.push(this.id);
    para.push(this.Empresa);
    para.push(this.idCentroCosto);

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
    let pParametro= [];
    pParametro.push(this.idCentroCosto); 
 
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
  //#endregion

  

  openPartida= function (a,i) {     
    
    this.lblLista = this.dataSourcePartida.data
      
    var arraySelects = new Object();

    this.clsColumnaOpc.forEach(element => {
      arraySelects[element.id] = 0 ; 
    });
  
    let val = 1;

    this.lblLista.forEach(element => {
      if(element.pPartidaEsp =='') {
        val = 0
        return;
      }
    });
   
    
    if(val === 0){  
      return;
    }
    if(val === 1){  
      this.lblLista.push({
        registro: 0,
        estado: 0,
        pPartidaGen:'',
        pPartidaEsp:'',
        pParitdaMargen:0,
        pTotal:0,
        lsucursal:arraySelects,
        lPersonal: null,
        ptipo: 0
      }) 
    } 
    
    this.dataSourcePartida = new MatTableDataSource(this.lblLista);  
    
  }


  fnPartidaGem(i,ParGen){ 
    var arraySelects = new Object();
    let lPresupuesto =  ['128','137']; 
    this.clsColumnaOpc.forEach(element => {
      arraySelects[element.id] = 0 ; 
    });

    console.log(ParGen);
    
    
    this.dataSourcePartida.data[i].pPartidaEsp ='';   
    this.dataSourcePartida.data[i].pTotal = 0; 
    this.dataSourcePartida.data[i].lsucursal =arraySelects; 

    if(lPresupuesto.includes(ParGen) == true){
      console.log('entro');
      this.dataSourcePartida.data[i].pParitdaMargen =0;  
    }
    else{
      console.log('afuera');
      this.dataSourcePartida.data[i].pParitdaMargen = this.nMargenRes;  
    }

    this.fnDisabledPartida();
  } 

   
  

  async fnEliminarTPartida(op,i){   
    let pParametro= [];   
    pParametro.push(this.idCentroCosto); 
    pParametro.push(op.pPartidaEsp); 
    this.spinner.show();
    await this.vSerPresupuesto.fnPresupuesto( 25, pParametro, this.url).then( (value: any) => {  
      let Result = value.cod.split("-");  
      let mensaje = value.mensaje;   
      
      if(Result[0] === "2" )
      {  
        this.spinner.hide();  
        Swal.fire({
          title: mensaje, 
          showCancelButton: true,
          confirmButtonText: `Si`, 
          cancelButtonText: `No`,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) { 
            this.fnEliminar(pParametro)
          } else{ 

          }
        })
      }
      else if(Result[0] === "0")
      {
        this.spinner.hide();  
        return Swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensaje
        });
      }
      else{
        this.lblLista = this.dataSourcePartida.data.filter(filtro => filtro != op)
        this.dataSourcePartida = new MatTableDataSource(this.lblLista);  
        this.spinner.hide(); 
      }
      
    }, error => {
      this.spinner.hide();
      console.log(error); 
    }); 
  }


  async fnEliminar(para){  
    this.spinner.show(); 
    await this.vSerPresupuesto.fnPresupuesto( 26, para, this.url).then( (value: any) => { 
      this.fnLista();
    });   
  }


  fnActionCalculo(op){
    let vCal = this.totalFormGroup.value;  
    let pParametro =[];  
    
    pParametro.push(this.idCentroCosto);
    pParametro.push(this.id);
    pParametro.push(this.pais);
    pParametro.push(+vCal.descuento);
    pParametro.push(+vCal.FeePer);
    pParametro.push(+vCal.Feeres);

    if(this.totalFormGroup.invalid   ){  
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar datos' 
      });
    } 

    
    let pLista =[];

    this.dataSourcePartida.data.map((e)=>{ 
      let valor = 0; 
      let ColumRes: any [] = e["lsucursal"]
      this.clsColumnaOpc.forEach(eleSuc => {   
        let pPartida =[]; 
        let s = eleSuc.id; 
        valor = typeof ColumRes[s] ==="undefined"?  0 : ColumRes[s] ;  
        if(e.pPartidaGen == 128){
           
          //partidas
          pPartida.push(e.pPartidaGen); 
          pPartida.push(e.pPartidaEsp); 
          pPartida.push(e.pParitdaMargen); 
          //total
          pPartida.push(s); 
          pPartida.push(valor); 
          // partida personal     
          
        }
        else{
           //partidas
           pPartida.push(e.pPartidaGen); 
           pPartida.push(e.pPartidaEsp); 
           pPartida.push(e.pParitdaMargen); 
           //total
           pPartida.push(s); 
           pPartida.push(valor);  
           // partida personal  
          
        } 
        
        pLista.push(pPartida.join('!')) 
      });  
    })
    pParametro.push(pLista.join('/')); 
     

    Swal.fire({
      title: '¿Desea Guardar?', 
      showCancelButton: true,
      confirmButtonText: `Si`, 
      cancelButtonText: `No`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.fnGuardar(1,op,pParametro);
      } else{ 
      }
    })

  }

  
fnGuardar(a,op,paramentro){
  // let vValidacionPri = this.PrimeraFormGroup.value; 
  this.spinner.show();
  this.vSerPresupuesto.fnPresupuestoCrud(op, paramentro, this.url).subscribe(
     res => {    
       
       let Result = res.cod.split("-");   
       if(Result[0] === '0')
       {
        return Swal.fire({
          icon: 'error',
          title: 'Error',
          text: res.mensaje 
        });
       }
       else{
        Swal.fire({
          icon: 'success', 
          text: res.mensaje 
        });
        this.fnLista(); 
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

fnValidarMargen(i,obj){ 
  if(obj.pParitdaMargen < 0)
  {
    this.dataSourcePartida.data[i].pParitdaMargen = 0 
    return Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'el margen no puede ser negativo'
    });  
  }
  

  
}
  
}
