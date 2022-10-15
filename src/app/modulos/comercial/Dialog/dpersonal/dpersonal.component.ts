
import { Component, Inject , OnInit,ViewChild } from '@angular/core'; 
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';  

import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';  

@Component({
  selector: 'app-dpersonal',
  templateUrl: './dpersonal.component.html',
  styleUrls: ['./dpersonal.component.css']
})
export class DpersonalComponent implements OnInit {
  //#region declaracion variable del sistema
  id:number; 
  url: string;  
  pais: string; 
  Empresa:string; 
  lPar:number; 
  //#endregion 

  displayedColumns: string[] = ['sCodPlla','sDscTipo','sDocumento'
  ,'sNombres','sCargo','sBanco'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;   


  constructor(
    private spinner: NgxSpinnerService, 
    @Inject('BASE_URL') baseUrl: string,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    this.url = baseUrl;   
  }

  ngOnInit(): void {
    console.log(this.data);
    
  }

}
