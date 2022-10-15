import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { TicketTiempoAtencionDTO } from '../../../api/models/ticketDTO';
import { TicketService } from '../../../api/services/ticket.service';

@Component({
  selector: 'app-ti-ticket-tiempo-atencion',
  templateUrl: './ti-ticket-tiempo-atencion.component.html',
  styleUrls: ['./ti-ticket-tiempo-atencion.component.css']
})
export class TiTicketTiempoAtencionComponent implements OnInit {

  // Mat-Table
  dataSource: MatTableDataSource<TicketTiempoAtencionDTO>;
  listaActivos: TicketTiempoAtencionDTO[] = [];
  displayedColumns: string[] = ["sUsuarioInicio", "sFechaInicio", "sUsuarioFin", "sFechaFin", "nCantidadDias"];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  txtFiltro = new FormControl(); // Filtro de busqueda de la tabla
  pipeTable: DatePipe;

  // Activo
  nIdTicket: Number;

  constructor(
    private spinner: NgxSpinnerService,
    public dialogRef: MatDialogRef<TiTicketTiempoAtencionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog, // Declaracion del Dialog
    private _ticketService: TicketService
  ) {
    // Inicializar tabla
    this.dataSource = new MatTableDataSource(this.listaActivos);

    // Guardamos el id del activo
    this.nIdTicket = data.nIdTicket;
  }

  async ngOnInit(): Promise<void> {

    await this.fnLlenarTabla();

    this.spinner.hide();
  }

  // Filtrado de la tabla
  async fnLlenarTabla(){

    try{
      const result = await this._ticketService.GetAllTiempoAtencion(this.nIdTicket);
      this.listaActivos = result.response.data;
      this.dataSource.data = this.listaActivos;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      // Primera pagina
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
    catch(err){
      console.log(err);
    }
  }

  fnFiltrar(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async fnReiniciarFiltro(){
    this.spinner.show();

    // Limpiar el filtro
    this.txtFiltro.setValue('');
    this.dataSource.filter = '';

    // Llenar nuevamente la tabla
    await this.fnLlenarTabla();

    this.spinner.hide();
  }

  fnSalir(){
    this.dialogRef.close();
  }

}
