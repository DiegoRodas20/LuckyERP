import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { TipoTicketArticuloDTO } from '../../api/models/tipoTicketArticuloDTO';
import { SubFamiliaCaracteristicaService } from '../../api/services/sub-familia-caracteristica.service';
import { TiDialogTipoTicketArticuloComponent } from './ti-dialog-tipo-ticket-articulo/ti-dialog-tipo-ticket-articulo.component';

@Component({
  selector: 'app-ti-tipo-ticket-articulo',
  templateUrl: './ti-tipo-ticket-articulo.component.html',
  styleUrls: ['./ti-tipo-ticket-articulo.component.css']
})
export class TiTipoTicketArticuloComponent implements OnInit {

  txtFiltro = new FormControl();
  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<TipoTicketArticuloDTO>;
  displayedColumns = ['opcion', 'sTipoTicket', 'sArticulo', 'imagen', 'sEstado'];


  constructor(
    private _subFamiliaTipoDispositivoService: SubFamiliaCaracteristicaService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
  ) { }

  async ngOnInit(): Promise<void> {
    this.spinner.show();
    await this.GetAllTipoTicketArticulo();

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

  async GetAllTipoTicketArticulo() {

    let response = await this._subFamiliaTipoDispositivoService.GetAllTipoTicketArticulo()
    this.dataSource = new MatTableDataSource(response.response.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fnFiltrar();
  }

  fnSeleccionarRegistro(row: TipoTicketArticuloDTO) {
    this.dialog.open(TiDialogTipoTicketArticuloComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: row,
      disableClose: true
    }).afterClosed().subscribe(async data => {
      await this.GetAllTipoTicketArticulo();
    });
  }

  fnAgregarRegistro() {
    this.dialog.open(TiDialogTipoTicketArticuloComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: null,
      disableClose: true
    }).afterClosed().subscribe(async data => {
      await this.GetAllTipoTicketArticulo();
    });
  }

  fnVerImagen(sArticulo: string, sRutaArchivo: string) {

    if (sRutaArchivo != '' && sRutaArchivo != null) {
      Swal.fire({
        title: sArticulo.substring(0, 6),
        text: sArticulo.substring(9, 120),
        imageUrl: sRutaArchivo,
        imageWidth: 250,
        imageHeight: 250,
      })
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Este artículo no contiene una imagen',
        showConfirmButton: false,
        timer: 1500
      });
    }
  }
}

