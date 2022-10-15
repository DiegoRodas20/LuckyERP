import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { CaracteristicaArticuloTIDTO } from '../../../api/models/elementoTIDTO';
import { SubFamiliaTIDto } from '../../../api/models/tipoElementoDTO';
import { SubFamiliaCaracteristicaService } from '../../../api/services/sub-familia-caracteristica.service';
import { TiDialogSubFamiliCaracteristicaComponent } from '../ti-dialog-sub-famili-caracteristica/ti-dialog-sub-famili-caracteristica.component';


@Component({
  selector: 'app-ti-caracteristica',
  templateUrl: './ti-caracteristica.component.html',
  styleUrls: ['./ti-caracteristica.component.css']
})
export class TiCaracteristicaComponent implements OnInit {

  txtFiltro = new FormControl();
  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<CaracteristicaArticuloTIDTO>;
  displayedColumns = ['opcion', 'nombre', 'sEstado'];
  @Input() subFamilia: SubFamiliaTIDto;
  @Output() pMostrar = new EventEmitter<number>();


  constructor(
    private _subFamiliaCaracteristicaService: SubFamiliaCaracteristicaService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
  ) { }

  async ngOnInit(): Promise<void> {
    this.spinner.show();
  
    await this.GetAllCaracteristica();
  
    this.spinner.hide();
  }

  async GetAllCaracteristica() {
    let response = await this._subFamiliaCaracteristicaService.GetAllCaracteristicas(this.subFamilia.tipoElementoId)
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
      caracteristica: null,
      idSubFamilia: this.subFamilia.tipoElementoId
    }

    this.dialog.open(TiDialogSubFamiliCaracteristicaComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: data,
      disableClose: true
    }).afterClosed().subscribe(async data => {
      await this.GetAllCaracteristica();
    });
  }

  fnSeleccionarRegistro(row: CaracteristicaArticuloTIDTO) {
    let data = {
      caracteristica: row,
      idSubFamilia: this.subFamilia.tipoElementoId
    }

    this.dialog.open(TiDialogSubFamiliCaracteristicaComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: data,
      disableClose: true
    }).afterClosed().subscribe(async data => {
      await this.GetAllCaracteristica();
    });
  }

  //#region Funcion de interaccion con componentes
  fnRegresar() {
    this.pMostrar.emit(0);
  }


}
