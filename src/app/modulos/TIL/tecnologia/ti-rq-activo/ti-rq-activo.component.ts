import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormControlName, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import { ActivoAsignacionTableTIDTO } from '../api/models/activoAsignacionTITDO';
import { ActivoDTO } from '../api/models/activoDTO';
import { ActivoAsignacionService } from '../api/services/activo-asignacion.service';
import { ActivoService } from '../api/services/activo.service';

@Component({
  selector: 'app-ti-rq-activo',
  templateUrl: './ti-rq-activo.component.html',
  styleUrls: ['./ti-rq-activo.component.css'],
  animations: [asistenciapAnimations]
})
export class TiRqActivoComponent implements OnInit {

  //   2526	Pendiente (TI)
  // 2527	En proceso
  // 2528	Atendido
  // 2615	Terminado
  // 2665	Solicitado
  // 2666	Rechazado presupuesto
  // 2667	Devuelto presupuesto

  opciones: { nNumero: number, sDescripcion: string }[] =
    [
      { nNumero: 2665, sDescripcion: 'Solicitado' },
      { nNumero: 2526, sDescripcion: 'Pendientes' },
      { nNumero: 2527, sDescripcion: 'En proceso' },
      { nNumero: 2615, sDescripcion: 'Terminado' },
      { nNumero: 0, sDescripcion: 'Todos' },
    ];

  rbEstado = new FormControl();

  // Variables de ayuda
  estaCargado: boolean = false;// Flag para ver cuando la pagina este completamente cargada

  // Formulario
  formAtencionRequerimiento: FormGroup;

  // Mat-Table
  dataSource: MatTableDataSource<ActivoAsignacionTableTIDTO>;
  listaAtencion: ActivoAsignacionTableTIDTO[] = [];
  displayedColumns: string[] = ["opcion", "sEmpresa", "sPresupuesto", "sCodRQ", "sNombreSolicitante", "sDocumento", "sNombreComercial", "sCargoSolicitante",
    "nCantMovil", "nCantPC", "nCantCorreo", "dFechaSolicitud", "dFechaAtencion", "sEstado"];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  txtFiltro = new FormControl(); // Filtro de busqueda de la tabla

  // Botones
  tsLista = 'inactive';
  fbLista = [
    { icon: 'add', tool: 'Crear Requerimiento', state: true }
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto
  constructor(
    private spinner: NgxSpinnerService,
    private route: Router,
    private _activoAsignacionService: ActivoAsignacionService,
  ) {

    this.dataSource = new MatTableDataSource(this.listaAtencion);
  }

  async ngOnInit(): Promise<void> {
    this.spinner.show();

    this.onToggleFab(1, -1);

    this.estaCargado = true;
    this.rbEstado.setValue(2526);
    await this.GetAll(2526);
    this.spinner.hide();
  }

  async GetAll(nIdEstado: number) {
    this.spinner.show();
    let response = await this._activoAsignacionService.GetAll(nIdEstado)
    this.dataSource = new MatTableDataSource(response.response.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fnFiltrar();
    this.spinner.hide();

  }

  //#region Botones

  // Metodo para abrir/cerrar menu de botones
  onToggleFab(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;
  }

  // Metodo para utilizar las funciones del menu de botones
  async clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnCrearDetalle();
        break;
      default:
        break;
    }
  }

  // Metodo para actualizar el estado de los botones
  fnControlFab() {
    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#region Detalle Simcard

  fnCrearDetalle() {

    this.route.navigate(['til/tecnologia/ti-RqActivo-detalle']);

  }

  fnVerDetalle(row: ActivoAsignacionTableTIDTO) {
    this.route.navigate(['til/tecnologia/ti-RqActivo-detalle', row.nIdActivoAsigna]);
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
}
