import { Component, OnInit, Injectable, Inject, ElementRef, ViewChild,ChangeDetectorRef  } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner'; 
import {SerPresupuestoService} from './../serpresupuesto.service';   
import Swal from 'sweetalert2';


import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table'; 

@Component({
  selector: 'app-dig-facturacion',
  templateUrl: './dig-facturacion.component.html',
  styleUrls: ['./dig-facturacion.component.css']
})
export class DigFacturacionComponent implements OnInit {
  local_data:any;  

  //#region declaracion variable del sistema
  id:number; 
  url: string;  
  pais: string; 
  Empresa:string;  
  //#endregion

  Total:string;  
  cant:string;  
  TotalFacPor:string;  
  TotalFac:string;  
  
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = [ 'sTipo', 'sSerie','sDoc','sFecha','estado','porcentaje', 'nTotalFinal'];
  @ViewChild('TableSort', {static: true}) tableSort: MatSort;  


  constructor(
    private spinner: NgxSpinnerService, 
    private vSerPresupuesto: SerPresupuestoService,
    public dialogRef: MatDialogRef<DigFacturacionComponent>,
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
    
    this.Total = this.local_data.total
    this.cant = this.local_data.cant
    this.TotalFac = this.local_data.totalFacturado
    this.TotalFacPor = this.local_data.sPor
    this.dataSource = new MatTableDataSource(this.local_data.listaDet );  
    this.dataSource.sort  = this.tableSort; 
  }


  async onNoClick(){ 
    this.dialogRef.close();
  }  
 
}
