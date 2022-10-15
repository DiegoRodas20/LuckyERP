import { Component, OnInit, Injectable, Inject, ElementRef, ViewChild,ChangeDetectorRef  } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner'; 
import Swal from 'sweetalert2';
import { SerPresupuestoService } from './../serpresupuesto.service';  

@Component({
  selector: 'app-digcontinuacion',
  templateUrl: './digcontinuacion.component.html',
  styleUrls: ['./digcontinuacion.component.css']
})
export class DigcontinuacionComponent implements OnInit {
  local_data:any;
  Val: boolean=true;
  Mensaje: string='';
  //#region declaracion variable del sistema
  id:number; 
  url: string;  
  pais: string; 
  Empresa:string;  
  //#endregion

  txtControl  = new FormControl();

  lCboPresupuesto:any;

  constructor(
    private spinner: NgxSpinnerService, 
    private vSerPresupuesto: SerPresupuestoService,
    public dialogRef: MatDialogRef<DigcontinuacionComponent>,
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
    this.fnCombo();
  }

  async fnCombo(){
    const param = [];
    param.push(this.id)
    param.push(this.Empresa)
    await this.vSerPresupuesto.fnPresupuesto(32, param, this.url).then((value: any) => {  
      this.lCboPresupuesto = value
    });
  }

  async onNoClick(){ 
    this.dialogRef.close();
  }

  async fnSeleccionar(){ 
    let pre = this.txtControl.value
    const param = [];
    param.push(this.id)
    param.push(this.Empresa)
    param.push(pre);
    param.push(this.pais);  
    await this.vSerPresupuesto.fnPresupuesto(33, param, this.url).then((value: any) => {   
      this.dialogRef.close({data: value.cod});
    }); 
  }

}
