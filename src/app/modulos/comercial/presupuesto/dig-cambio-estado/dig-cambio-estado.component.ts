import { Component, OnInit, Injectable, Inject, ElementRef, ViewChild,ChangeDetectorRef  } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner'; 
import {SerPresupuestoService} from './../serpresupuesto.service';   
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dig-cambio-estado',
  templateUrl: './dig-cambio-estado.component.html',
  styleUrls: ['./dig-cambio-estado.component.css']
})
export class DigCambioEstadoComponent implements OnInit {
  local_data:any; 
  local_data_Return:any = {}; 
  //#region declaracion variable del sistema
  id:number; 
  url: string;  
  pais: string; 
  Empresa:string;  
  //#endregion
  constructor(
    private spinner: NgxSpinnerService, 
    private vSerPresupuesto: SerPresupuestoService,
    public dialogRef: MatDialogRef<DigCambioEstadoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,   
    @Inject('BASE_URL') baseUrl: string
    ) {
      this.url = baseUrl;  
      this.local_data = {...data};
      //#region llenado dato del sistema
      this.pais = localStorage.getItem('Pais'); 
      this.Empresa = localStorage.getItem('Empresa');
      const user = localStorage.getItem('currentUser');
      this.id = JSON.parse(window.atob(user.split('.')[1])).uid; 
      //#endregion
    }

  ngOnInit(): void { 
  }

  async onNoClick(){ 
    this.dialogRef.close({data: this.local_data_Return});
  }  
  
  async onCambio(estado){
    let pParametro= [];   

    this.spinner.show(); 
    pParametro.push(this.local_data.id)
    pParametro.push(this.pais)
    pParametro.push(estado) 
    pParametro.push(this.id)
    await this.vSerPresupuesto.fnPresupuesto(36, pParametro, this.url).then((value: any) => {
      this.local_data_Return = value
      if(value.cod === '0')
      {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: value.mensaje
        });
      }
      else{
        Swal.fire({
          icon: 'success',
          title: 'Listo',
          text: 'Se cambio el estado correctamente'
        });
      }
    }); 
    this.spinner.hide();  
  }

}
