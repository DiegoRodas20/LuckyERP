import { Component, OnInit, Injectable, Inject, ElementRef, ViewChild,ChangeDetectorRef  } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner'; 
import Swal from 'sweetalert2';

import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';  
@Component({
  selector: 'app-digpartida',
  templateUrl: './digpartida.component.html',
  styleUrls: ['./digpartida.component.css']
})
export class DigpartidaComponent implements OnInit {
  local_data:any;
  ciudad:string;
  lcboCategoria:any;
  lpersonal:any;
  lpersonalValidador:any;
  index:string;
  validacion:boolean;
  tGestor = new Array<any>();
  arrayCategoria = new Object();  


  tGestorDC: string[] = [ 'action','categoria','canal', 'NPer' ,'diasPla', 'totalDias', 
  'diasCotiz', 'remunDia', 'total', 'implem', 'planilla3', 'totalNeto'];
  tGestorDS: MatTableDataSource<any>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;  

  constructor( 
    public dialogRef: MatDialogRef<DigpartidaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
  ) {  
    this.local_data = {...data};
    this.ciudad = this.local_data.ciudad;
    this.lcboCategoria= this.local_data.categoria;
    this.lpersonal = this.local_data.lPersonal;
    this.index = this.local_data.index;
    this.validacion = this.local_data.validacion;
  }

  ngOnInit(): void {  
    
    this.arrayCategoria[0]= '';
    this.lcboCategoria.forEach(element => {
      this.arrayCategoria[element.pId] = element.l_Detalle_canal;
    });  
  

    if(typeof this.lpersonal[this.index] ==="undefined"){ 
      return;
    } 

    if(this.lpersonal[this.index] ==''){ 
      this.tGestor.push(
        {
          categoria:'',canal:'',NPer:0,diasPla:0,totalDias:0,diasCotiz:0,
          remunDia:0,total:0,implem:0,planilla3:'',totalNeto:0,
          ParTar: '' , IdTar: ''
        }); 
    } 
    else{ 
      
      this.lpersonal[this.index].forEach(element => {
        let total = 0;
        let totaldias = 0;
        let totalneto = 0; 
        let des = 0;
        let par,tar;
        totaldias = +element.pCantPersonal * +element.pdiaPla;
        total = +element.pCantPersonal * +element.pdiaCot * +element.pRemxDia;
        des = total *(+element.pResguardo)/100
        totalneto= total -  des  
 
        this.arrayCategoria[element.pIdCategoria].forEach(ele => {
          if(ele.pId == element.pIdCanal){
            par = ele.l_Detalle_Partidas;
            tar = ele.pIdTarifario;
          }
        }); 
 

        this.tGestor.push(
          {
            categoria:element.pIdCategoria,
            canal:element.pIdCanal,
            NPer:element.pCantPersonal,
            diasPla:element.pdiaPla,
            totalDias:totaldias,
            diasCotiz:element.pdiaCot,
            remunDia:element.pRemxDia,
            total:total.toFixed(2),
            implem:element.pResguardo,
            planilla3:'',
            totalNeto:totalneto.toFixed(2),
            ParTar:par,
            IdTar:tar
          }
       ) 
      });   
    }
     

    
    this.tGestorDS =  new MatTableDataSource(this.tGestor);  
    this.fnDisableTarifario(); 

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
          categoria:'',canal:'',NPer:0,diasPla:0,totalDias:0,diasCotiz:0,
          remunDia:0,total:0,implem:0,planilla3:'',totalNeto:0,
          ParTar: '' , IdTar: ''
        }
      )
      this.tGestorDS =  new MatTableDataSource(this.tGestor);   
    }
  }

  fnCalPersona(element){  
    let total = 0;
    let totaldias = 0;
    let totalneto = 0; 
    let des = 0;

    totaldias = +element.NPer * +element.diasPla;
    total = +element.NPer * +element.diasCotiz * +element.remunDia;
    des = total *(+element.implem)/100
    totalneto= total -  des 

    element.totalDias = totaldias
    element.total = total.toFixed(2)
    element.totalNeto=totalneto.toFixed(2);
 
    
  }

  onNoClick(){ 
    this.dialogRef.close();
  }


  fnCanal(Obj,i){
    

    let personal = this.tGestorDS.data[i]

    let canal = personal.canal
    

    Obj.forEach(element => { 
      if(element.pId == canal){ 
        
        this.tGestorDS.data[i].remunDia  =element.pDiaSueldo;
        this.tGestorDS.data[i].implem  =element.pResguardo;  
        this.tGestorDS.data[i].ParTar  =element.l_Detalle_Partidas;  
        this.tGestorDS.data[i].IdTar  =element.pIdTarifario;    
      }
    });
 
    this.fnDisableTarifario();


  }

  fnDisableTarifario(){
 
    this.tGestorDS.data.forEach(element => {  
      
      if(element.categoria == '')
        return;
      else{
        if(!element.canal){ 
        }
        else{  
          this.arrayCategoria[element.categoria].forEach(eleCat => {
            if(eleCat.pId == element.canal){
              eleCat.estado = 1
            }
            else{
              element.estado = 0
            } 
          });
        }
        
      }
    }); 
  }

  fnSeleccionar(){
    var ObjUbi = new Object(); 
    let lbl : any = [];
    let val = 1;
    
    
    this.tGestorDS.data.forEach(element => { 
      if(element.total == 0){
        val=0
        return Swal.fire({
          icon: 'error',
          title: 'error',
          text: 'Falta llenar los campos' 
        });
      }
      
      lbl.push(
        {
          categoria:element.categoria,
          canal:element.canal,
          NPer:element.NPer,
          diasPla:element.diasPla, 
          diasCotiz:element.diasCotiz,
          remunDia:element.remunDia, 
          implem:element.implem,
          planilla3:element.planilla3,
          ParTar:element.ParTar,
          IdTar: element.IdTar
        }
      )
    }); 

    if(val == 0){
      return;
    } 
    
    ObjUbi["partidaPersonal"]=lbl ;
    ObjUbi["sur"]=this.index ; 

    this.dialogRef.close({data: ObjUbi});
    
  }

  btnElimnarTGestor(obj){ 
    this.tGestor = this.tGestorDS.data 
    this.tGestor = this.tGestor.filter(filtro => filtro != obj);
    this.tGestorDS = new MatTableDataSource(this.tGestor);  
  }

}
