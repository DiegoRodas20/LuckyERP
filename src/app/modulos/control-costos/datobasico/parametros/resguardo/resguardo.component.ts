
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { PresupuestosService } from '../../../presupuestos/presupuestos.service';

export interface Ppto{
  nIdPpto: number;
}

@Component({
  selector: 'app-resguardo',
  templateUrl: './resguardo.component.html',
  styleUrls: ['./resguardo.component.css']
})
export class ResguardoComponent implements OnInit {
  
  //Tabla material PPto
  dsPresupuesto: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginatorPpto: MatPaginator;
  @ViewChild(MatSort) sortPpto: MatSort;
  displayedColumnsPpto: string[] = ['nIdPpto', 'sPresupuesto', 'sCliente', 'sEjecutivo', 'sServicio', 'sMoneda', 'nResguardo', 'sEstado'];
  txtFiltro= new FormControl();

  url: string;
  idUser :number; // id del usuario
  pNom:string;    // Nombre Usr
  idEmp: string;  // id de la empresa del grupo Actual
  pPais: string;  // Codigo del Pais de la empresa Actual
  pOpcion: number // variable para el cambio de pantalla

  vPrincipal: boolean = true;
  vSecundario: boolean = false;
  vPpto: Ppto;

  constructor(
    private spinner: NgxSpinnerService, 
    private vPresupuestosService: PresupuestosService, 
    @Inject('BASE_URL') baseUrl: string, 
    public dialog: MatDialog,
    private route:Router){this.url = baseUrl; }
    

  ngOnInit(): void {
    //Obtener Variables Generales del proyecto .
    let user    = localStorage.getItem('currentUser'); 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid; 
    this.pNom   = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp  = localStorage.getItem('Empresa'); 
    this.pPais  = localStorage.getItem('Pais');   
 
   this.fnListarPpto()  
  }

  fnListarPpto = function(){
    this.spinner.show('spiDialog');
    let vFiltro: any  = ''; 
    var pParametro = []; //Parametros de campos vacios

    vFiltro = this.txtFiltro.value
    pParametro.push(this.idEmp);
    pParametro.push(vFiltro);

    // console.log('URL: '+this.url)
    
    this.vPresupuestosService.fnMargenGeneral(1, 2, pParametro, 1, this.url).subscribe(
        res => {
          // console.log(res)
          this.dsPresupuesto = new MatTableDataSource(res);
          this.dsPresupuesto.paginator = this.paginatorPpto;
          this.dsPresupuesto.sort = this.sortPpto;  

          this.spinner.hide('spiDialog'); 
      },
      err => {
          this.spinner.hide('spiDialog');
          console.log(err);
      },
      () => {
          this.spinner.hide('spiDialog');
      }
    );

  }

  fnFiltrar(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsPresupuesto.filter = filterValue.trim().toLowerCase();

    if (this.dsPresupuesto.paginator) {
      this.dsPresupuesto.paginator.firstPage();
    }
  }

  fnNuevo = function(){
    this.vSecundario = true;
    this.vOpcion = 2; //Añadir partida
    this.pOpcion = 2  // envia al hijo que se esta aplicando una nueva factura
    this.vPpto = 0;
    this.vPrincipal = false;
  }

  fnVerDetalle = function(nPpto){
    this.vPrincipal = false
    this.vSecundario = true;
    this.vPpto = nPpto
    this.pOpcion = 1; //Opcion ver detalle
  }

  eventTempF(resp){
    if(resp == 1){
      this.vSecundario = false;
      this.vPrincipal = true;
      this.fnListarPpto();
    }
  }

}
