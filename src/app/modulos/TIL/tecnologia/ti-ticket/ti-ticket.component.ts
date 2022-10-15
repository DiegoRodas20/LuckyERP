import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import { TicketSelectItemPrioridadDTO, TicketTableDTO } from '../api/models/ticketDTO';
import { TicketService } from '../api/services/ticket.service';

@Component({
  selector: 'app-ti-ticket',
  templateUrl: './ti-ticket.component.html',
  styleUrls: ['./ti-ticket.component.css'],
  animations: [asistenciapAnimations]
})
export class TiTicketComponent implements OnInit {

  opciones: { nNumero: number, sDescripcion: string }[] =
    [
      { nNumero: 2599, sDescripcion: 'Pendientes' },
      { nNumero: 2600, sDescripcion: 'En proceso' },
      { nNumero: 2602, sDescripcion: 'Atendido' },
      { nNumero: 0, sDescripcion: 'Todos' },
    ];

  // Controles
  rbEstado = new FormControl();
  cbPrioridad = new FormControl();

  // Combobox
  listaPrioridadTicket: TicketSelectItemPrioridadDTO[] = [];

  // Variables de ayuda
  estaCargado: boolean = false;// Flag para ver cuando la pagina este completamente cargada

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'add', tool: 'Crear Ticket', state: true},
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  // Mat-Table
  dataSource: MatTableDataSource<TicketTableDTO>;
  listaAtencion: TicketTableDTO[] = [];
  displayedColumns: string[] = ["opcion", "sEmpresa", "sTipoTicket", "sNumero", "sPersonalSolicitante", "sArea", "sCargo", "dFechaCrea", "sEstado", "sPrioridad", "sTicketAsignado", "sDetalle", "sReposicion"];

  nIdTicket: number;
  sEmpresa: string;
  sTipoTicket: string;
  sPersonalSolicitante: string;
  sArea: string;
  sTelfSolicitante: string;
  dFechaCrea: Date | string | null;
  sTicketAsignado: string;
  sCargo: string;
  sReposicion: string;
  sDetalle: string;
  nIdEstado: number;
  sEstado: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  txtFiltro = new FormControl(); // Filtro de busqueda de la tabla

  constructor(
    private spinner: NgxSpinnerService,
    private route: Router,
    private _ticketService: TicketService,
  ) {

    this.dataSource = new MatTableDataSource(this.listaAtencion);
  }

  async ngOnInit(): Promise<void> {

    this.onToggleFab(1, -1);

    await this.fnLlenarComboboxPrioridad();

    this.estaCargado = true;
    this.rbEstado.setValue(2599);
    this.GetAll();
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
        this.fnCrearTicket();
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

  //#region Tabla

  async GetAll() {
    this.spinner.show();

    const nIdPrioridad = Number(this.cbPrioridad.value);
    const nIdEstado = Number(this.rbEstado.value);

    let response = await this._ticketService.GetAll(nIdEstado, nIdPrioridad || 0)

    this.spinner.hide();

    this.dataSource = new MatTableDataSource(response.response.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  fnFiltrar(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  //#endregion

  //#region Controles
  async fnLlenarComboboxPrioridad(){

    const result = await this._ticketService.GetAllPrioridadesTicket();
    if(result.success){
      this.listaPrioridadTicket = result.response.data;
    }
    else{
      this.listaPrioridadTicket = [];
    }
  }
  //#endregion
  
  //#region Acciones

  fnCrearTicket(){
    this.route.navigate(['til/tecnologia/ti-Ticket/detalle']);  
  }

  fnVerDetalle(row: TicketTableDTO) {
    this.route.navigate(['til/tecnologia/ti-Ticket/detalle', row.nIdTicket]);  
  }

  //#endregion

}
