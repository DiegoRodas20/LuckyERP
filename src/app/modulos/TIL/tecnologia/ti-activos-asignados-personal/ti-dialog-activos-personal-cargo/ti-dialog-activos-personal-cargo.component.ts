import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { ActivosPersonalDTO, PersonalCargoDTO } from '../../api/models/activoAsignadoPersonalDTO';
import { ActivoAsignadoPersonalService } from '../../api/services/activo-asignado-personal.service';
import { TiDialogActivosAsignadosPersonalComponent } from '../ti-dialog-activos-asignados-personal/ti-dialog-activos-asignados-personal.component';

@Component({
  selector: 'app-ti-dialog-activos-personal-cargo',
  templateUrl: './ti-dialog-activos-personal-cargo.component.html',
  styleUrls: ['./ti-dialog-activos-personal-cargo.component.css']
})
export class TiDialogActivosPersonalCargoComponent implements OnInit {

  //Mat-table para Activos
  dataSourceActivo: MatTableDataSource<ActivosPersonalDTO>;
  @ViewChild('paginatorActivo', { static: true }) paginatorActivo: MatPaginator;
  @ViewChild('sortActivo', { static: true }) sortActivo: MatSort;
  @ViewChild('matActivo') matActivo: MatExpansionPanel;
  displayedColumnsActivo: string[] = ['opcion', 'sTipoActivo', 'sActivo', 'sArticulo', 'dFechaEntrega',
    'sEstado'];
  txtFiltroActivo = new FormControl();

  storageData: SecurityErp;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PersonalCargoDTO,
    public dialogRef: MatDialogRef<TiDialogActivosPersonalCargoComponent>,
    public dialog: MatDialog,
    private _activoAsignadoPersonalService: ActivoAsignadoPersonalService,
    private spinner: NgxSpinnerService,
    private overlayContainer: OverlayContainer
  ) {
    this.overlayContainer.getContainerElement().classList.add("multiDialog");
  }

  ngOnDestroy() {
    this.overlayContainer.getContainerElement().classList.remove("multiDialog");
  }

  ngOnInit(): void {
    this.storageData = new SecurityErp();
  }

  async ngAfterViewInit() {
    setTimeout(async () => {

      //Para que no haya error de ngAfterContentChecked
      this.spinner.show();
      await this.GetActivosByPersonal()
      this.spinner.hide();

    });
  }

  async GetActivosByPersonal() {
    let response = await this._activoAsignadoPersonalService.GetActivosByPersonal(Number(this.storageData.getUsuarioId()), this.data.nIdPersonal)
    this.dataSourceActivo = new MatTableDataSource(response.response.data);
    this.dataSourceActivo.paginator = this.paginatorActivo;
    this.dataSourceActivo.sort = this.sortActivo;
    this.fnFiltrarActivo();
  }

  fnVerDetalleActivo(row: ActivosPersonalDTO) {
    const dialog = this.dialog.open(TiDialogActivosAsignadosPersonalComponent, {
      data: {
        activo: row,
        idSucursalPersonal: this.data.nIdSucursal,
        idCargoPersonal: this.data.nIdCargo,
        sSucursal: this.data.sSucursal
      },
      disableClose: true,
      backdropClass: 'backdropBackground',
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
}
