import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { TransporteService } from '../../../../transporte.service';
import { Vehiculo_Empresa } from '../../../models/Vehiculo.model';
import { LogDialogAgregarVehiculoComponent } from './log-dialog-agregar-vehiculos/log-dialog-agregar-vehiculo.component';
import { VehiculoArchivoComponent } from './vehiculo-archivo/vehiculo-archivo.component';



export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}
@Component({
  selector: 'app-vehiculo',
  templateUrl: './vehiculo.component.html',
  styleUrls: ['./vehiculo.component.css']
})
export class VehiculoComponent implements OnInit {

  @Input() pIdEmpresaTransporte: number;
  @Input() isNew: boolean;
  pVehiculoSeleccionado: Vehiculo_Empresa;

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  txtFiltro = new FormControl();
  lVehiculo: Vehiculo_Empresa[] = [];

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Vehiculo_Empresa>;
  displayedColumns = ['nId', 'sPlaca', 'sDescripcion', 'sModelo', 'sTipoVehiculo', 'sLucky', 'sEstado'];

  matcher = new ErrorStateMatcher();

  pMostrar: number;

  constructor(
    private spinner: NgxSpinnerService,
    private vTransporteService: TransporteService,
    public dialog: MatDialog,
    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; this.pMostrar = 0 }

  ngOnInit(): void {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');
    if (this.isNew) {
      this.fnAbrirDetalle();
    } else {
      this.fnListarVehiculo(true);
    }
  }

  fnListarVehiculo(show: boolean) {
    if (show) { this.spinner.show() }
    const pEntidad = 4;
    const pOpcion = 2;  //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 1;       //Listar todos los registros de la tabla
    pParametro.push(this.pIdEmpresaTransporte);
    this.vTransporteService.fnEmpresaTransporte(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lVehiculo = res;
        this.dataSource = new MatTableDataSource(this.lVehiculo);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.fnFiltrar();
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnFiltrar() {
    var filtro = "";

    if (this.txtFiltro.value == null) {
      return;
    }
    filtro = this.txtFiltro.value.trim(); // Remove whitespace
    filtro = filtro.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filtro;
  }

  fnAbrirDetalle() {
    this.pVehiculoSeleccionado = null;
    this.pMostrar = 1;
  }

  fnVerDetalleVehiculo(row: Vehiculo_Empresa) {
    this.pVehiculoSeleccionado = row;
    this.pMostrar = 1;
  }

  fnArchivo(row: Vehiculo_Empresa) {
    this.dialog.open(VehiculoArchivoComponent, {
      width: '80%',
      data: row
    });
  }

  fnOcultar(p: number) {
    this.pMostrar = p;
    this.fnListarVehiculo(true);
  }

  fnOpenSelector(): void {
    this.spinner.show();
    const pParametro = [];
    pParametro.push(this.pIdEmpresaTransporte);
    this.vTransporteService.fnEmpresaTransporte(4, 2, pParametro, 2, this.url).subscribe(
      (res: Vehiculo_Empresa[]) => {
        this.spinner.hide();
        this.dialog.open(LogDialogAgregarVehiculoComponent,
          {
            disableClose: true, autoFocus: false, width: '850px',
            maxWidth: '90vw', height: 'auto', data: { 'list': res ? res : [] }
          }
        ).afterClosed().subscribe((result: number) => {
          if (result) {
            this.fnAgregarVehiculo(result);
          }
        });
      }, () => { this.spinner.hide() }
    );
  }

  fnAgregarVehiculo(vehiculoId: number): void {
    const pParametro = [];
    pParametro.push(vehiculoId);
    pParametro.push(this.pIdEmpresaTransporte);
    this.spinner.show();
    this.vTransporteService.fnEmpresaTransporte(4, 1, pParametro, 0, this.url).subscribe(
      (res) => {
        if (res.result == 0) {
          Swal.fire({ title: 'Hubo un error en el registro', icon: 'error', timer: 2000 });
        } else {
          Swal.fire({ title: 'Se ha registrado de manera exitosa', icon: 'success', timer: 2000 });
          this.fnListarVehiculo(false);
        }
      }, () => { this.spinner.hide() }
    );
  }
}
