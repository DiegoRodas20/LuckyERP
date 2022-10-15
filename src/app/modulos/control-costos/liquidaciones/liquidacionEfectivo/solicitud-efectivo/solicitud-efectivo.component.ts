import { Component, OnInit, Inject, Input, Output, ViewChild, EventEmitter} from '@angular/core';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute } from '@angular/router';
import { LiquidacionesService } from '../../liquidaciones.service';
//import { Filtro } from '../../liquidacionEfectivo/liquidacionEfectivo.component';


@Component({
  selector: 'app-solicitud-efectivo',
  templateUrl: './solicitud-efectivo.component.html',
  styleUrls: ['./solicitud-efectivo.component.css']
})

export class SolicitudEfectivoComponent implements OnInit {

  //Tabla material
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Output() newEvent: EventEmitter<any>;
  // Variables que viene desde el padre
  //@Input() pFiltro: Filtro;
  
  displayedColumns: string[] = ['nIdGastoCosto','sNumero', 'sCentroCosto', 'sSucursal',// 'sDocDepositario', 
  'sNombreCompletoDepositario','nTotal','sTitulo','sMoneda','sEstadoRq'];

  url: string;
  idUser :number; //id del usuario
  pNom:string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  constructor(
    private spinner: NgxSpinnerService,
    private vLiquidacionesService: LiquidacionesService, 
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    @Inject('BASE_URL') baseUrl: string,)
    // @Inject(MAT_DIALOG_DATA) public xFiltro: any,)
  { this.url = baseUrl; this.newEvent = new EventEmitter(); }

  ngOnInit(): void {

    let user    = localStorage.getItem('currentUser'); 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid; 
    this.pNom   = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp  = localStorage.getItem('Empresa'); 
    this.pPais  = localStorage.getItem('Pais');  
    // console.log(this.pFiltro)
    // this.fnListarSolicitud(this.pFiltro) 
  }

  fnListarSolicitud = function(vfiltro){
    var pParametro = []; //Parametros de campos vacios
    if(vfiltro == undefined || isNaN(vfiltro))
    {
      pParametro.push(1);
      pParametro.push(2);
    }
    else
    {
      pParametro.push(vfiltro.Sucursal);
      pParametro.push(vfiltro.CentroCosto);
      pParametro.push(vfiltro.Depositario);
      pParametro.push(vfiltro.Anio);
      pParametro.push(vfiltro.Tipo);
    }
    console.log(vfiltro)
    console.log(pParametro)

    this.vLiquidacionesService.fnLiquidaEfectivo(1, 2, pParametro, 1, 0, this.url).subscribe(
        res => {
            console.log(res)
            this.dataSource = new MatTableDataSource(res);
            this.spinner.hide()
        },
        err => {
            this.spinner.hide();
            console.log(err);
        },
        () => {
            this.spinner.hide();
        }
    );

  }

}
