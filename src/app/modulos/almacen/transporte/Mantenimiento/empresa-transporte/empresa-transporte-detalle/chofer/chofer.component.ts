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
import { Chofer_Empresa } from '../../../models/Chofer.model';
import { ChoferArchivoComponent } from './chofer-archivo/chofer-archivo.component';
import { ChoferDetalleComponent } from './chofer-detalle/chofer-detalle.component';
import { LogDialogAgregarChoferComponent } from './log-dialog-agregar-chofer/log-dialog-agregar-chofer.component';

@Component({
  selector: 'app-chofer',
  templateUrl: './chofer.component.html',
  styleUrls: ['./chofer.component.css']
})
export class ChoferComponent implements OnInit {

  @Input() pIdEmpresaTransporte: number;
  @Input() isVehiculo: boolean;
  @Input() isNew: boolean;
  pChoferSeleccionado: Chofer_Empresa;

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  txtFiltro = new FormControl();
  lChofer: Chofer_Empresa[] = [];

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Chofer_Empresa>;
  displayedColumns = ['nId', 'sTipoDoc', 'sNumDocumento', 'sBrevete', 'sNombreCompleto', 'dVence', 'sEstado'];

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
    this.fnListarChofer(true);
  }

  fnListarChofer(show?: boolean) {
    if (show) { this.spinner.show() }

    var pEntidad = 7;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.pIdEmpresaTransporte);

    this.vTransporteService.fnEmpresaTransporte(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (this.isNew && !this.isVehiculo) {
          this.fnAbrirDetalle();
        }
        this.lChofer = res;
        this.dataSource = new MatTableDataSource(this.lChofer);
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

  //funciones para abrir modales
  fnAbrirDetalle() {
    this.dialog.open(ChoferDetalleComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: {
        nIdEmpresaTransporte: this.pIdEmpresaTransporte,
        vChofer: null,
      }
    }).afterClosed().subscribe(data => {
      this.isNew = false;
      if (data) {
        this.fnListarChofer(true);
      }
    });;
  }

  fnVerDetalleChofer(row: Chofer_Empresa) {
    this.dialog.open(ChoferDetalleComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: {
        nIdEmpresaTransporte: this.pIdEmpresaTransporte,
        vChofer: row,
      }
    }).afterClosed().subscribe(data => {
      this.fnListarChofer(true)
    });
  }

  fnArchivo(row: Chofer_Empresa) {
    this.dialog.open(ChoferArchivoComponent, {
      width: '80%',
      data: row
    }).afterClosed().subscribe(data => {
      this.fnListarChofer(true)
    });;
  }

  fnOpenSelector(): void {
    this.spinner.show();
    const pParametro = [];
    pParametro.push(this.pIdEmpresaTransporte);
    this.vTransporteService.fnEmpresaTransporte(7, 2, pParametro, 2, this.url).subscribe(
      (res: Chofer_Empresa[]) => {
        this.spinner.hide();
        this.dialog.open(LogDialogAgregarChoferComponent,
          {
            disableClose: true, autoFocus: false, width: '850px',
            maxWidth: '90vw', height: 'auto', data: { 'list': res ? res : [] }
          }
        ).afterClosed().subscribe((result: number) => {
          if (result) {
            this.fnAgregarChofer(result);
          }
        });
      }, () => { this.spinner.hide() }
    );
  }

  fnAgregarChofer(choferId: number): void {
    const pParametro = [];
    pParametro.push(choferId);
    pParametro.push(this.pIdEmpresaTransporte);
    this.spinner.show();
    this.vTransporteService.fnEmpresaTransporte(7, 1, pParametro, 0, this.url).subscribe(
      (res) => {
        if (res.result == 0) {
          Swal.fire({ title: 'Hubo un error en el registro', icon: 'error', timer: 2000 });
        } else {
          Swal.fire({ title: 'Se ha registrado de manera exitosa', icon: 'success', timer: 2000 });
          this.fnListarChofer();
        }
      }, () => { this.spinner.hide() }
    );
  }
}
