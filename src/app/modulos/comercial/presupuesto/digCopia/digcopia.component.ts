import { Component, OnInit, Injectable, Inject, ElementRef, ViewChild,ChangeDetectorRef  } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner'; 
import Swal from 'sweetalert2';
import { SerPresupuestoService } from './../serpresupuesto.service';  
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../../shared/services/AppDateAdapter'; 
import * as moment from 'moment';  


@Component({
  selector: 'app-digcopia',
  templateUrl: './digcopia.component.html',
  styleUrls: ['./digcopia.component.css'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ] 
})
export class DigcopiaComponent implements OnInit {
  local_data:any;
  fecha:Date; 
  idPresupuesto:number;  
  PrimeraFormGroup: FormGroup;
  Val: boolean=true;
  Mensaje: string='';

  //#region declaracion variable del sistema
  id:number; 
  url: string;  
  pais: string; 
  Empresa:string;  
  //#endregion

  //#region validando la fecha 
  fecIni: string;
  fecFin: string;
  //#endregion

  constructor( 
    private spinner: NgxSpinnerService, 
    private vSerPresupuesto: SerPresupuestoService,
    public dialogRef: MatDialogRef<DigcopiaComponent>,
    private formBuilder: FormBuilder, 
    @Inject(MAT_DIALOG_DATA) public data: any,  
    @Inject('BASE_URL') baseUrl: string
  ) {  
    this.url = baseUrl;  
    this.local_data = {...data};
    this.fecha = this.convertUTCDateToLocalDate(new Date(this.local_data.fecha));   
    this.idPresupuesto= this.local_data.idPresupuesto; 
  }

  ngOnInit(): void {    
    
    //#region llenado dato del sistema
    this.pais = localStorage.getItem('Pais'); 
    this.Empresa = localStorage.getItem('Empresa');
    const user = localStorage.getItem('currentUser');
    this.id = JSON.parse(window.atob(user.split('.')[1])).uid; 
    //#endregion
    
    this.fnfecha(0,this.fecha )
     
    this.PrimeraFormGroup = this.formBuilder.group({ 
      FechaInicio: [this.fecha , Validators.required],
      FechaFin: ['', Validators.required], 
    });
  }

  convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;   
  }
   

  onNoClick(){ 
    this.dialogRef.close();
  }

  fnfecha(op:number,fecha ){
    if(op==0){
      this.fecIni = fecha
    }
    else{
      this.fecFin = fecha
    }  

    if (this.fecIni==''||this.fecFin=='' || (this.fecIni>this.fecFin)) {
      this.Val = true;
      this.Mensaje = 'Ingrese El rango de fecha';
      return;
    }else{ 
      this.Val = false;
    } 
  }
  

  fnSeleccionar(op){
    let paramentro = [];

    var ObjUbi = new Object();  
    let vValidacionPri = this.PrimeraFormGroup.value;

    if(this.PrimeraFormGroup.invalid   ){  
      return Swal.fire({
        icon: 'error',
        title: 'error',
        text: 'Falta ingresar el rango de fecha' 
      });
    }  

    if(this.Val == false){  
    }
    else{
      Swal.fire({
        icon: 'error', 
        title: 'error',
        text: 'Ingrese El rango de fecha', 
      })
      this.Val = true;
      return;
    } 

    if(vValidacionPri.FechaInicio < this.fecha){
      return Swal.fire({
        icon: 'error',
        title: 'error',
        text: 'La fecha de inicio tiene que ser mayor que '+moment( this.fecha , 'MM-DD-YYYY HH:mm:ss',true).format("DD/MM/YYYY") 
      });
    }

    paramentro.push(moment( vValidacionPri.FechaInicio , 'MM-DD-YYYY HH:mm:ss',true).format("YYYY-MM-DD"));
    paramentro.push(moment( vValidacionPri.FechaFin , 'MM-DD-YYYY HH:mm:ss',true).format("YYYY-MM-DD"));
    paramentro.push(this.idPresupuesto);
    paramentro.push(this.id);
    paramentro.push(this.Empresa);
    paramentro.push(this.pais);
  

    this.spinner.show();
    this.vSerPresupuesto.fnPresupuestoCrud(op, paramentro, this.url).subscribe(
       res => {  
         let Result = res.cod.split("-");  
         if(Result.length > 1){
          ObjUbi["id"] = Result[0] ;
          ObjUbi["cod"] = Result[1] ; 
        } 

         Swal.fire({
           title: res.mensaje,
           showCancelButton: true,
           confirmButtonText: `Ok`,
         }).then((result) => {
            this.dialogRef.close({data: ObjUbi});
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

  
 

}
