import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers/securityErp.Entity';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { PerfilEquipoTableTIDTO } from '../api/models/perfilEquipoTIDTO';
import { PerfilEquipoService } from '../api/services/perfil-equipo.service';

@Component({
  selector: 'app-ti-perfil-equipo',
  templateUrl: './ti-perfil-equipo.component.html',
  styleUrls: ['./ti-perfil-equipo.component.css'],
  animations: [asistenciapAnimations]
})
export class TiPerfilEquipoComponent implements OnInit {

  txtFiltro = new FormControl();

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<PerfilEquipoTableTIDTO>;
  displayedColumns = ['opcion', 'sSubFamilia', 'sNombrePerfil', 'sNombreProducto', 'sCargos', 'nCosto', 'sTiempoGarantia', 'sEstado'];

  title: string;

  pMostrar: number;

  matcher = new ErrorStateMatcher();

  storageData: SecurityErp;

  pIdRegistro: number = 0;

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'post_add', tool: 'Crear perfil', state: true, color: 'secondary'}
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  constructor(
    private _perfilEquipoService: PerfilEquipoService,
    private spinner: NgxSpinnerService,
  ) {
    this.pMostrar = 0;
  }

  async ngOnInit(): Promise<void> {
    this.storageData = new SecurityErp()

    this.spinner.show();

    this.onToggleFab(1, -1);

    await this.GetAll();

    this.fnControlFab();

    this.spinner.hide()
  }

  //#region Botones

  // Metodo para abrir/cerrar menu de botones
  onToggleFab(fab: number, stat: number) {
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
  }

  // Metodo para utilizar las funciones del menu de botones
  async clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnAgregarRegistro();
        break;
      default:
        break;
    }
  }

  // Metodo para actualizar el estado de los botones
  fnControlFab(){

    this.fbLista[0].state = true;

    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion

  async GetAll() {
    let response = await this._perfilEquipoService.GetAll(this.storageData.getPais())
    this.dataSource = new MatTableDataSource(response.response.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fnFiltrar();
  }

  fnAgregarRegistro() {
    this.pMostrar = 1
    this.pIdRegistro = 0;
  }

  fnSeleccionarRegistro(row: PerfilEquipoTableTIDTO) {
    this.pMostrar = 1
    this.pIdRegistro = row.nIdPerfilEquipo;
  }

  fnFiltrar() {
    let filtro = '';

    if (this.txtFiltro.value == null) {
      return;
    }
    filtro = this.txtFiltro.value.trim();
    filtro = filtro.toLowerCase();
    this.dataSource.filter = filtro;
  }

  async fnOcultar(p: number) {
    this.pMostrar = p;
    await this.GetAll();
  }
}
