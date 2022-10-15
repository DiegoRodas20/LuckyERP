import { Component, OnInit, Input, Inject, ViewChild, EventEmitter, Output } from '@angular/core';
 import { SerEfectivoService } from './../ser-efectivo.service';   
 
import { NgxSpinnerService } from 'ngx-spinner';  

import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';  
import { PersonalBanco,Estado } from './../../model/IEfectivo';  
  
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-estadoefectivo',
  templateUrl: './estadoefectivo.component.html',
  styleUrls: ['./estadoefectivo.component.css'] 
})
export class EstadoefectivoComponent implements OnInit {
  //#region declaracion variable del sistema
  id:number; 
  url: string;  
  pais: string; 
  Empresa:string; 
  lPar:number; 
  //#endregion 

   
  displayedColumns: string[] = ['cUser','sEstado','fecha','mensaje'];
  dataSource: MatTableDataSource<Estado>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;   

  constructor( 
    private spinner: NgxSpinnerService, 
    public dialogRef: MatDialogRef<EstadoefectivoComponent>,
    private vSerEfectivo: SerEfectivoService, 
    @Inject('BASE_URL') baseUrl: string,
    @Inject(MAT_DIALOG_DATA) public data: Estado[]
    ) { 
      this.url = baseUrl;   
  }

  ngOnInit(): void {     
    this.dataSource = new MatTableDataSource(this.data);   
    this.dataSource.sort = this.sort;   

  }

  
  onNoClick(): void {
    this.dialogRef.close();
  }
 
   
  
  
}
