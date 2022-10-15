import { Component, OnInit, Input, Inject, ViewChild, EventEmitter, Output } from '@angular/core'; 
 
import { NgxSpinnerService } from 'ngx-spinner';  

import {SerPresupuestoService} from './../../serpresupuesto.service'; 

import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';   
import Swal from 'sweetalert2';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-detpartidapersonal',
  templateUrl: './detpartidapersonal.component.html',
  styleUrls: ['./detpartidapersonal.component.css'] 
})
export class DetPartidaPersonalComponent implements OnInit {
  //#region declaracion variable del sistema
  id:number; 
  url: string;  
  pais: string; 
  Empresa:string; 
  lPar:number; 
  //#endregion 

   
  nidEliminar:number= 0; 
  nidCentroCosto:number;  
  idPartida:number;   
  sPartida:string;   
  Margen:number;  
  validacion:boolean;
  Perfil:string;

  local_data:any;
  lcboCiudad:any;
  lcboCategoria:any;
  lcboCategoriatwo:any;
  lpersonal:any;
  arrayCiudad = new Object(); 
  arrayCiudadCategoria= new Object(); 
  arrayCategoria = new Object();  
  tGestor = new Array<any>();


  tGestorDC: string[] = [ ];
  tGestorDS: MatTableDataSource<any>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;     

  constructor( 
    private spinner: NgxSpinnerService, 
    public dialogRef: MatDialogRef<DetPartidaPersonalComponent>, 
    private vSerPresupuesto: SerPresupuestoService,
    @Inject('BASE_URL') baseUrl: string,
    @Inject(MAT_DIALOG_DATA) public data: any[]
    ) { 
      this.url = baseUrl;   
      this.local_data = {...data};
      console.log(this.local_data);
      
      this.nidCentroCosto = this.local_data.idCentroCosto;  
      this.validacion = this.local_data.validacion;  
      this.idPartida = this.local_data.idPartida;  
      this.sPartida = this.local_data.sPartida;  
      this.Margen = this.local_data.Margen;  
      this.lcboCategoria= this.local_data.categoria;
      this.lpersonal = this.local_data.lPersonal; 
      this.lcboCiudad = this.local_data.sucursal; 
      this.Perfil  = this.local_data.Perfil;  
      //#region 
      this.pais = localStorage.getItem('Pais'); 
      this.Empresa = localStorage.getItem('Empresa');
      const user = localStorage.getItem('currentUser');
      this.id = JSON.parse(window.atob(user.split('.')[1])).uid; 
      //#endregion 
  }

  ngOnInit(): void {      
    
    this.arrayCiudad[0]= '';
    
    
    this.arrayCategoria[0]= '';
    this.arrayCategoria[0]= '';
    this.lcboCiudad.map((e) =>{
      this.lcboCategoria.forEach(element => { 
        this.arrayCategoria[e.pId+''+element.pId] = element.l_Detalle_canal;
      });  
    });

    this.lcboCiudad.map((e) =>{
      this.arrayCiudad[e.pId]= this.lcboCategoria; 
    }); 

    let lPresupuesto =  ['625','2278','2153']; 
    
    
    if(lPresupuesto.includes(this.Perfil.toString()) == true){
      this.tGestorDC  = [ 'action','ciudad','categoria','canal', 'NPer' ,'diasPla', 'totalDias', 
      'diasCotiz', 'remunDia', 'total', 'implem', 'planilla3']
    }
    else{
      this.tGestorDC  = [ 'action','ciudad','categoria','canal', 'NPer' ,'diasPla', 'totalDias', 
      'diasCotiz', 'remunDia', 'total', 'planilla3']
    }

    if(this.lpersonal.length ===0){ 
      this.tGestor.push(
        {
          ciudad:'',categoria:'',canal:'',NPer:0,diasPla:0,totalDias:0,diasCotiz:0,
          remunDia:0,total:0,implem:0,planilla3:'' ,
          ParTar: '' , IdTar: ''
        }); 
    } 
    else{  
      this.lpersonal.map( (e) => { 
            let total = 0;
            let totaldias = 0; 
            let des = 0;
            let par,tar; 

            totaldias = +e.pCantPersonal * +e.pdiaPla;
            total = +e.pCantPersonal * +e.pdiaCot * +e.pRemxDia;
            des = total *(+e.pResguardo)/100 

            this.arrayCategoria[e.pIdCCS+''+e.pIdCategoria].forEach(ele => {
              if(ele.pId == e.pIdCanal){
                par = ele.l_Detalle_Partidas;
                tar = ele.pIdTarifario;
              }
            }); 

            this.tGestor.push(
              {
                ciudad:e.pIdCCS,
                categoria:e.pIdCategoria,
                canal:e.pIdCanal,
                NPer:e.pCantPersonal,
                diasPla:e.pdiaPla,
                totalDias:totaldias,
                diasCotiz:e.pdiaCot,
                remunDia:e.pRemxDia,
                total:total.toFixed(2),
                implem:e.pResguardo,
                planilla3:'', 
                IdTar:tar
              })

      })  
    }
  
    this.tGestorDS =  new MatTableDataSource(this.tGestor);   
    this.fnDisableTarifario();
     
  }

  onNoClick(): void {
    this.dialogRef.close({data: this.nidEliminar});
  }


  btnNuevoTGestor(){
    let val = 1;

    this.tGestor.forEach(element => {
      if(element.total ==0) {
        val = 0
        return;
      }
    });

    if(val == 1 ){
      this.tGestor.push(
        {
          ciudad:'',
          categoria:'',canal:'',NPer:0,diasPla:0,totalDias:0,diasCotiz:0,
          remunDia:0,total:0,implem:0,planilla3:'', 
          ParTar: '' , IdTar: ''
        }
      )
      this.tGestorDS =  new MatTableDataSource(this.tGestor);   
    }
  }

  //#region cambio de select 
  fnCiudad(ciudad,i){
    
    this.tGestorDS.data[i].categoria  ='';
    this.tGestorDS.data[i].canal  ='';
    this.tGestorDS.data[i].NPer  =0;
    this.tGestorDS.data[i].diasPla  =0;
    this.tGestorDS.data[i].diasCotiz  =0;
    this.tGestorDS.data[i].remunDia  = 0;
    this.tGestorDS.data[i].implem  =0;  
    this.tGestorDS.data[i].ParTar  =null;  
    this.tGestorDS.data[i].IdTar  = null;     
  }

  fnCategoria(ciudad,categoria,i){  
    this.tGestorDS.data[i].canal  ='';
    this.tGestorDS.data[i].NPer  =0;
    this.tGestorDS.data[i].diasPla  =0;
    this.tGestorDS.data[i].diasCotiz  =0;
    this.tGestorDS.data[i].remunDia  = 0;
    this.tGestorDS.data[i].implem  =0;  
    this.tGestorDS.data[i].ParTar  =null;  
    this.tGestorDS.data[i].IdTar  = null;  
    this.fnDisableTarifario()
  }

  fnCanal(Obj,i){
    

    let personal = this.tGestorDS.data[i]

    let canal = personal.canal
     
    
    Obj.forEach(element => { 
      if(element.pId == canal){ 
        
        this.tGestorDS.data[i].NPer  =0;
        this.tGestorDS.data[i].diasPla  =0;
        this.tGestorDS.data[i].diasCotiz  =0;
        this.tGestorDS.data[i].remunDia  =element.pDiaSueldo;
        this.tGestorDS.data[i].implem  =element.pResguardo;  
        this.tGestorDS.data[i].ParTar  =element.l_Detalle_Partidas;  
        this.tGestorDS.data[i].IdTar  =element.pIdTarifario;    
      }
    }); 

    this.fnDisableTarifario();

  }
  //#endregion

  //#region calcular

  fnCalPersona(i,element){  
    let total = 0;
    let totaldias = 0; 
    let des = 0;
 
    if(element.NPer<0){ 
      this.tGestorDS.data[i].NPer = 0 
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Nro. persona no puede ser negativo'
      }); 
    }
    if(element.diasPla<0){
      this.tGestorDS.data[i].diasPla = 0 
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Día planificado no puede ser negativo'
      }); 
    }
    if(element.diasCotiz <0){
      this.tGestorDS.data[i].diasCotiz = 0 
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Día cotizado no puede ser negativo'
      }); 
    }
    if(element.implem<0){
      this.tGestorDS.data[i].implem = 0 
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: '% implementado no puede ser negativo'
      }); 
    }
    

    totaldias = +element.NPer * +element.diasPla;
    total = +element.NPer * +element.diasCotiz * +element.remunDia;
    des = total *(+element.implem)/100 

    element.totalDias = totaldias
    element.total = total.toFixed(2) 
 
    
  }

  //#endregion
  
  //#region quitar duplicado
  fnDisableTarifario(){ 
    let lValidacion=  [];
    let lCiudadCategoria =  [];
    let lCanal =  [];
    this.tGestorDS.data.forEach(element => {   
      lCanal.push({
        ciudad:element.ciudad,
        categoria:element.categoria,
        canal:element.canal
      })  
    });

    lCanal.map((e)=>{
      lCiudadCategoria.push({
        ciudad:e.ciudad,
        categoria:e.categoria  
      }) 
    })

    lCiudadCategoria = [...new Set(lCiudadCategoria)];

    lCiudadCategoria.map((eCC)=>{
      let lCa =[];
      if(eCC.ciudad != ""){
        lCanal.map((e)=>{
          if(eCC.ciudad === e.ciudad && eCC.categoria === e.categoria){
            if(e.canal != ""){ 
              lCa.push(e.canal)
            }
          } 
        })
  
        lValidacion.push({
          codigo:eCC.ciudad+''+eCC.categoria,
          lista:lCa 
        })
      } 
    }) 
    lValidacion = [...new Set(lValidacion)]; 
 
    

    lValidacion.map((e)=>{
      let num:number = e.codigo
      let lista = []
      lista = e.lista 
      this.arrayCategoria[num].forEach(eleCat => { 
        if(lista.includes(eleCat.pId) == true){  
          eleCat.estado = 1; 
        }
        else{ 
          eleCat.estado = 0;  
        } 
      });  
    })  
       
  }
  //#endregion
 

  //#region total
  public Cantidad(): number {
    let num : number = 0;
    this.tGestorDS.data.forEach(element => {
      num++;
    }); 
    return num;
  }
  public Precio(): number {
    let num : number = 0;
    this.tGestorDS.data.forEach(element => {
      num += +element.total 
    }); 
    return num;
  }
  //#endregion
   
  async btnElimnarTGestor(obj){  
    let pParametro= [];   
    pParametro.push(this.nidCentroCosto); 
    pParametro.push(this.idPartida); 
    pParametro.push(obj.ciudad);  
    pParametro.push(obj.categoria);  
    pParametro.push(obj.canal);    
    
    if(obj.canal === '')
    {
      this.tGestor = this.tGestorDS.data 
      this.tGestor = this.tGestor.filter(filtro => filtro != obj);
      this.tGestorDS = new MatTableDataSource(this.tGestor);  
      this.fnDisableTarifario();
      return
    } 
    
    this.spinner.show();
    await this.vSerPresupuesto.fnPresupuesto( 27, pParametro, this.url).then( (value: any) => { 
      if(value.cod === '0'){
        this.spinner.hide();  
        return Swal.fire({
          icon: 'error',
          title: 'Error',
          text: value.mensaje
        });
      } 
      else{
        this.spinner.hide();  
        Swal.fire({
          title: 'Esta Seguro de eliminar?', 
          showCancelButton: true,
          confirmButtonText: `Si`, 
          cancelButtonText: `No`,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) { 
            if(value.cod === '2'){
              this.tGestor = this.tGestorDS.data 
              this.tGestor = this.tGestor.filter(filtro => filtro != obj);
              this.tGestorDS = new MatTableDataSource(this.tGestor);  
            }
            else{ 
              this.fnEliminar(obj,pParametro)
            }
            
          } else{ 

          }
        })
      }
      
    }, error => {
      this.spinner.hide();
      console.log(error); 
    }); 
      
  }


  async fnEliminar(Obj,pParametro){
 
    this.spinner.show();
    await this.vSerPresupuesto.fnPresupuesto( 28, pParametro, this.url).then( (value: any) => { 
      
      this.nidEliminar =1;
      this.tGestor = this.tGestorDS.data 
      this.tGestor = this.tGestor.filter(filtro => filtro != Obj);
      this.tGestorDS = new MatTableDataSource(this.tGestor);
      this.fnDisableTarifario();
      
    }, error => {
      this.spinner.hide();
      console.log(error); 
    }); 
    this.spinner.hide();
  }



  //#region guardar
  ValidarGuardar(){ 
    let pParametro= [];    
    let pDet= [];  
    let val = 1;  
    
    pParametro.push(this.nidCentroCosto);
    pParametro.push(this.id);
    pParametro.push(this.idPartida); 
    pParametro.push(this.Margen); 
    pParametro.push(this.pais); 
    this.tGestorDS.data.map((Det) =>{  
      
      let pParFila= [];    
      pParFila.push(Det.ciudad); 
      pParFila.push(Det.categoria);
      pParFila.push(Det.canal);
      pParFila.push(Det.NPer);
      pParFila.push(Det.diasPla);
      pParFila.push(Det.diasCotiz); 
      pParFila.push(Det.remunDia);  
      pParFila.push(Det.implem);  
      pParFila.push(Det.planilla3);   
      pParFila.push(Det.IdTar); 
      if(Det.total === 0)   
      {
        val = 0;
        return ;
      }
      pDet.push(pParFila.join(','))  
    })
    
    if(val === 0){
      return   Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar datos'
      });  
    }
    else{
      if(pDet.length === 0){
        return   Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Falta ingresar datos'
        });  
      }
      else{ 
        pParametro.push(pDet.join('/'));
        this.Guardar(pParametro)
        console.log(pParametro.join('|'));
        
      }
    }
    
  }

  async Guardar(Parametro){   
    this.spinner.show();
    await this.vSerPresupuesto.fnPresupuesto( 24, Parametro, this.url).then( (value: any) => {   
      if(value.cod== "00"){

      }
      else{
        this.dialogRef.close({data: 1});  
      }
    }, error => {
      console.log(error); 
    }); 
    
    this.spinner.hide();
  }

  //#endregion


  
}
