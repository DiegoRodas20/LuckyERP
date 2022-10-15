import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import { DatoBasicoService } from '../datobasico.service';
import { E_PartidaDispositivo } from '../interfaces/tipoDispositovoPartida';
import { PptoDialogPartidaDispositivoComponent } from './ppto-dialog-partida-dispositivo/ppto-dialog-partida-dispositivo.component';

@Component({
  selector: 'app-ppto-partida-dispositivo',
  templateUrl: './ppto-partida-dispositivo.component.html',
  styleUrls: ['./ppto-partida-dispositivo.component.css'],
  animations: [asistenciapAnimations]
})
export class PptoPartidaDispositivoComponent implements OnInit {

  // Botones Flotantes Pantalla 
  tsLista = 'inactive';  // Inicia la lista visible
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'add', tool: 'Nuevo' },
  ];
  abLista = [];

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  txtFiltro = new FormControl();
  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<E_PartidaDispositivo>;
  lTipoDispositivoPartida: E_PartidaDispositivo[] = []
  displayedColumns = ['opcion', 'sCodPartida', 'sPartida', 'sTipoDispositivo', 'sEstado'];

  constructor(
    private _datoBasicoService: DatoBasicoService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    @Inject('BASE_URL') baseUrl: string

  ) { this.url = baseUrl; }

  async ngOnInit(): Promise<void> {
    this.onToggleFab(1, -1);
    
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.spinner.show();
    await this.fnListarTipoDispositivoPartida();

    this.spinner.hide();
  }

  async fnFiltrar() {
    let filtro = '';

    if (this.txtFiltro.value == null) {
      return;
    }
    filtro = this.txtFiltro.value.trim();
    filtro = filtro.toLowerCase();
    this.dataSource.filter = filtro;
  }

  async fnListarTipoDispositivoPartida() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 4;       //Listar todos los registros de la tabla    
    pParametro.push(this.pPais);
    try {
      const registro = await this._datoBasicoService.fnTipoDispositivoPartida(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      this.spinner.hide();

      this.lTipoDispositivoPartida = registro;
      this.dataSource = new MatTableDataSource(this.lTipoDispositivoPartida);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.fnFiltrar();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  fnAgregarRegistro() {
    this.dialog.open(PptoDialogPartidaDispositivoComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: null,
      disableClose: true
    }).afterClosed().subscribe(async data => {
      await this.fnListarTipoDispositivoPartida();
    });
  }

  fnSeleccionarRegistro(row: E_PartidaDispositivo) {
    this.dialog.open(PptoDialogPartidaDispositivoComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: row,
      disableClose: true
    }).afterClosed().subscribe(async data => {
      await this.fnListarTipoDispositivoPartida();
    });
  }

  //Botones Flotantes 
  onToggleFab(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnAgregarRegistro()
        break
      default:
        break
    }
  }
}
