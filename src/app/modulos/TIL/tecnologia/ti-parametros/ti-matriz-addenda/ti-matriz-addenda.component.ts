import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { DispositivoMatrizDTO } from '../../api/models/dispositivoMatrizDTO';
import { SubFamiliaCaracteristicaService } from '../../api/services/sub-familia-caracteristica.service';
import { TiDialogMatrizAddendaComponent } from './ti-dialog-matriz-addenda/ti-dialog-matriz-addenda.component';

@Component({
  selector: 'app-ti-matriz-addenda',
  templateUrl: './ti-matriz-addenda.component.html',
  styleUrls: ['./ti-matriz-addenda.component.css']
})
export class TiMatrizAddendaComponent implements OnInit {


  txtFiltro = new FormControl();
  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<DispositivoMatrizDTO>;
  displayedColumns = ['opcion', 'sDispositivo', 'sDispositivoParte', 'sOpcional', 'sAplicaDescuento', 'sEstado'];
  @Output() pMostrar = new EventEmitter<number>();


  constructor(
    private _subFamiliaTipoDispositivoService: SubFamiliaCaracteristicaService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
  ) { }

  async ngOnInit(): Promise<void> {
    this.spinner.show();
    await this.GetAllMatrizAddenda();

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

  async GetAllMatrizAddenda(){

    let response = await this._subFamiliaTipoDispositivoService.GetAllMatriz()
    this.dataSource = new MatTableDataSource(response.response.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fnFiltrar();
  }

  fnAgregarRegistro(){
    this.dialog.open(TiDialogMatrizAddendaComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: null,
      disableClose: true
    }).afterClosed().subscribe(async data => {
      await this.GetAllMatrizAddenda();
    });
  }

  fnSeleccionarRegistro(row: DispositivoMatrizDTO){
    this.dialog.open(TiDialogMatrizAddendaComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: row,
      disableClose: true
    }).afterClosed().subscribe(async data => {
      await this.GetAllMatrizAddenda();
    });
  }

}
