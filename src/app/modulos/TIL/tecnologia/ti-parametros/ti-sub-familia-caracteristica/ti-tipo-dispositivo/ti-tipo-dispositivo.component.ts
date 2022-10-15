import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { TipoDispositivoTIDTO } from '../../../api/models/elementoTIDTO';
import { SubFamiliaTIDto } from '../../../api/models/tipoElementoDTO';
import { SubFamiliaCaracteristicaService } from '../../../api/services/sub-familia-caracteristica.service';
import { TiDialogTipoDispositivoComponent } from '../ti-dialog-tipo-dispositivo/ti-dialog-tipo-dispositivo.component';

@Component({
  selector: 'app-ti-tipo-dispositivo',
  templateUrl: './ti-tipo-dispositivo.component.html',
  styleUrls: ['./ti-tipo-dispositivo.component.css']
})
export class TiTipoDispositivoComponent implements OnInit {

  txtFiltro = new FormControl();
  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<TipoDispositivoTIDTO>;
  displayedColumns = ['opcion', 'nombre', 'bPartNumber', 'sEstado'];
  @Input() subFamilia: SubFamiliaTIDto;
  @Output() pMostrar = new EventEmitter<number>();


  constructor(
    private _subFamiliaTipoDispositivoService: SubFamiliaCaracteristicaService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
  ) { }

  async ngOnInit(): Promise<void> {
    this.spinner.show();
    await this.GetAllTipoDispositivo();

    this.spinner.hide();
  }

  async GetAllTipoDispositivo() {
    let response = await this._subFamiliaTipoDispositivoService.GetAllTipoDispositivos(this.subFamilia.tipoElementoId)
    this.dataSource = new MatTableDataSource(response.response.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fnFiltrar();
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

  fnAgregarRegistro() {
    let data = {
      tipoDispositivo: null,
      idSubFamilia: this.subFamilia.tipoElementoId
    }

    this.dialog.open(TiDialogTipoDispositivoComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: data,
      disableClose: true
    }).afterClosed().subscribe(async data => {
      await this.GetAllTipoDispositivo();
    });
  }

  fnSeleccionarRegistro(row: TipoDispositivoTIDTO) {
    let data = {
      tipoDispositivo: row,
      idSubFamilia: this.subFamilia.tipoElementoId
    }

    this.dialog.open(TiDialogTipoDispositivoComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: data,
      disableClose: true
    }).afterClosed().subscribe(async data => {
      await this.GetAllTipoDispositivo();
    });
  }

  //#region Funcion de interaccion con componentes
  fnRegresar() {
    this.pMostrar.emit(0);
  }


}
