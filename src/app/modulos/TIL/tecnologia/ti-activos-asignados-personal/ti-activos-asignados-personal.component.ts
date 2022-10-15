import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import { ActivosPersonalDTO, PersonalCargoDTO } from '../api/models/activoAsignadoPersonalDTO';
import { PersonalRqHerramientaDTO } from '../api/models/requerimientoHerramienta.model';
import { toggleFab } from '../api/models/toggleFab';
import { ActivoAsignadoPersonalService } from '../api/services/activo-asignado-personal.service';
import { RequerimientoHerramientaService } from '../api/services/requerimiento-herramienta.service';
import { TicketService } from '../api/services/ticket.service';
import { TiDialogActivosAsignadosPersonalComponent } from './ti-dialog-activos-asignados-personal/ti-dialog-activos-asignados-personal.component';
import { TiDialogActivosPersonalCargoComponent } from './ti-dialog-activos-personal-cargo/ti-dialog-activos-personal-cargo.component';
import { TiDialogSolicitudTicketComponent } from './ti-dialog-solicitud-ticket/ti-dialog-solicitud-ticket.component';
import { TiDialogTicketUsuarioComponent } from './ti-dialog-ticket-usuario/ti-dialog-ticket-usuario.component';

@Component({
  selector: 'app-ti-activos-asignados-personal',
  templateUrl: './ti-activos-asignados-personal.component.html',
  styleUrls: ['./ti-activos-asignados-personal.component.css'],
  animations: [asistenciapAnimations],
})
export class TiActivosAsignadosPersonalComponent implements OnInit {

  // Variables auxiliares
  estaCargado: boolean = false; // Flag para ver cuando la pagina este completamente cargada

  //Botones
  tsLista = 'inactive';
  fbLista: toggleFab[] = [
    { icon: 'playlist_add', tool: 'Solicitud', state: '', color: 'secondary', functionName: 'fnSolicitud', matBadge: null, matBadgeColor: null },
    { icon: 'receipt', tool: 'Tickets Solicitados', state: '', color: 'secondary', functionName: 'fnTicket', matBadge: null, matBadgeColor: "warn"}
  ];
  //receipt
  abLista: toggleFab[] = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  //Mat-table para Activos
  dataSourceActivo: MatTableDataSource<ActivosPersonalDTO>;
  @ViewChild('paginatorActivo', { static: true }) paginatorActivo: MatPaginator;
  @ViewChild('sortActivo', { static: true }) sortActivo: MatSort;
  @ViewChild('matActivo') matActivo: MatExpansionPanel;
  displayedColumnsActivo: string[] = ['opcion', 'sTipoActivo', 'sActivo', 'sArticulo', 'dFechaEntrega', 'dFechaDevolucion',
    'sEstado'];
  txtFiltroActivo = new FormControl();

  storageData: SecurityErp;

  //Mat-table para Personal
  displayedColumnsPersonal: string[] = ['opcion', 'sSucursal', 'sTipoDoc', 'sDocumento', 'sNombreCompleto',
    'sPlanilla', 'sCargo', 'nCantActivos'];
  dataSourcePersonal: MatTableDataSource<PersonalCargoDTO>;
  @ViewChild('paginatorPersonal', { static: true }) paginatorPersonal: MatPaginator;
  @ViewChild('sortPersonal', { static: true }) sortPersonal: MatSort;
  @ViewChild('matPersonal') matPersonal: MatExpansionPanel;
  txtFiltroPersonal = new FormControl();

  personalActual: PersonalRqHerramientaDTO;

  // Flags
  bExistePrestamoActivo: boolean = false;

  constructor(
    public dialog: MatDialog,
    private _activoAsignadoPersonalService: ActivoAsignadoPersonalService,
    private _requerimientoHerramientaService: RequerimientoHerramientaService,
    private _ticketService: TicketService,
    private spinner: NgxSpinnerService,
    private overlayContainer: OverlayContainer
  ) {
    this.overlayContainer.getContainerElement().classList.add("multiDialog");
  }

  ngOnDestroy() {
    this.overlayContainer.getContainerElement().classList.remove("multiDialog");
  }

  async ngOnInit(): Promise<void> {

    this.onToggleFab(1, -1)

    this.storageData = new SecurityErp();
    this.estaCargado = true;

    this.spinner.show();
    await this.GetActivosByPersonal();
    await this.GetPersonalCargo();
    await this.GetPersonalActual();

    await this.fnRecuperarCantidadTicketsNoRevisados();

    this.spinner.hide()

  }

  ngAfterViewInit() {
    setTimeout(() => {

      //Para que no haya error de ngAfterContentChecked
      this.matActivo.open();

    });
  }

  async GetPersonalActual() {
    let response = await this._requerimientoHerramientaService.GetPersonalActual(
      Number(this.storageData.getUsuarioId()))
    this.personalActual = response.response.data[0];
  }

  async GetActivosByPersonal() {
    let response = await this._activoAsignadoPersonalService.GetActivosByPersonal(Number(this.storageData.getUsuarioId()))

    // Buscamos si algun activo tiene una fecha de devolucion (Si es un prestamo de activo)
    for(let i = 0; i < response.response.data.length; i++){
      if(response.response.data[i].dFechaDevolucion != null){
        this.bExistePrestamoActivo = true;
        break;
      }
    }

    this.dataSourceActivo = new MatTableDataSource(response.response.data);
    this.dataSourceActivo.paginator = this.paginatorActivo;
    this.dataSourceActivo.sort = this.sortActivo;
    this.fnFiltrarActivo();
  }

  async GetPersonalCargo() {
    let response = await this._activoAsignadoPersonalService.GetPersonalCargo(Number(this.storageData.getUsuarioId()), Number(this.storageData.getEmpresa()))
    this.dataSourcePersonal = new MatTableDataSource(response.response.data);
    this.dataSourcePersonal.paginator = this.paginatorPersonal;
    this.dataSourcePersonal.sort = this.sortPersonal;
    this.fnFiltrarPersonal();
  }

  fnVerDetalleActivo(row: ActivosPersonalDTO) {
    this.mostrarBotones = false;

    const dialog = this.dialog.open(TiDialogActivosAsignadosPersonalComponent, {
      // width: '850px',
      // maxWidth: '90vw',
      data: {
        activo: row,
        idSucursalPersonal: this.personalActual.nIdSucursal,
        sSucursal: this.personalActual.sSucursal,
        idCargoPersonal: this.personalActual.nIdCargo
      },
      disableClose: true,
      backdropClass: 'backdropBackground',
    }).afterClosed().subscribe(data => {
      this.mostrarBotones = true;
    })
  }

  fnVerActivosPersonal(row: PersonalCargoDTO) {
    this.mostrarBotones = false;

    const dialog = this.dialog.open(TiDialogActivosPersonalCargoComponent, {
      data: row,
      disableClose: true,
      backdropClass: 'backdropBackground',
    }).afterClosed().subscribe(data => {
      this.mostrarBotones = true;
    })
  }

  fnFiltrarActivo() {
    let filtro = '';

    if (this.txtFiltroActivo.value == null) {
      return;
    }
    filtro = this.txtFiltroActivo.value.trim();
    filtro = filtro.toLowerCase();
    this.dataSourceActivo.filter = filtro;
  }

  fnFiltrarPersonal() {
    let filtro = '';

    if (this.txtFiltroPersonal.value == null) {
      return;
    }
    filtro = this.txtFiltroPersonal.value.trim();
    filtro = filtro.toLowerCase();
    this.dataSourcePersonal.filter = filtro;
  }

  onToggleFab(fab: number, stat: number) {
    stat = stat === -1 ? (this.abLista.length > 0 ? 0 : 1) : stat;
    this.tsLista = stat === 0 ? "inactive" : "active";
    this.abLista = stat === 0 ? [] : this.fbLista;
  }

  clickFab(nombreFuncion: string) {
    if (this[nombreFuncion]) {
      this[nombreFuncion]();
    }
  }

  fnSolicitud() {
    this.mostrarBotones = false;

    const dialog = this.dialog.open(TiDialogSolicitudTicketComponent, {
      width: '900px',
      maxWidth: '90vw',
      disableClose: true
    }).afterClosed().subscribe(data => {
      this.mostrarBotones = true;
    })
  }

  fnTicket() {
    this.mostrarBotones = false;

    const dialog = this.dialog.open(TiDialogTicketUsuarioComponent, {
      // width: '900px',
      // maxWidth: '90vw',
      disableClose: true,
      data: {
        idPersonal: this.personalActual.nIdPersonal
      }
    }).afterClosed().subscribe(async data => {
      this.mostrarBotones = true;
      await this.fnRecuperarCantidadTicketsNoRevisados();
    })
  }

  async fnRecuperarCantidadTicketsNoRevisados(){

    const result = await this._ticketService.GetCantidadTicketsRevisar(this.personalActual.nIdPersonal);
    if(result.success){

      const cantidad = result.response.data[0];

      this.fbLista[1].matBadge = cantidad != 0 ? result.response.data[0].toString() : null;
    }

  }
}
