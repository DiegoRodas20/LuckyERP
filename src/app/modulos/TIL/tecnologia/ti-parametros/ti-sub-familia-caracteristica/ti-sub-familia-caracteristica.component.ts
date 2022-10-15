import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers/securityErp.Entity';
import { SubFamiliaTIDto } from '../../api/models/tipoElementoDTO';
import { PerfilEquipoService } from '../../api/services/perfil-equipo.service';
import { SubFamiliaCaracteristicaService } from '../../api/services/sub-familia-caracteristica.service';

@Component({
  selector: 'app-ti-sub-familia-caracteristica',
  templateUrl: './ti-sub-familia-caracteristica.component.html',
  styleUrls: ['./ti-sub-familia-caracteristica.component.css']
})
export class TiSubFamiliaCaracteristicaComponent implements OnInit {

  txtFiltro = new FormControl();

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<SubFamiliaTIDto>;
  displayedColumns = ['opcion', 'codigo', 'descripcion', 'countCaracteristica', 'countTipoDisp', 'sEstado'];

  title: string;

  pMostrar: number;

  matcher = new ErrorStateMatcher();

  storageData: SecurityErp;

  subFamiliaSeleccionada: SubFamiliaTIDto;

  constructor(
    private _subFamiliaCaracteristicaService: SubFamiliaCaracteristicaService,
    private spinner: NgxSpinnerService,
  ) {
    this.pMostrar = 0;
  }

  async ngOnInit(): Promise<void> {
    this.storageData = new SecurityErp()
    this.spinner.show();
    await this.GetAllSubFamilias();
    this.spinner.hide()
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

  fnSeleccionarCaracteristicas(row: SubFamiliaTIDto) {
    this.subFamiliaSeleccionada = row;
    this.pMostrar = 1;
  }

  fnSeleccionarTipos(row: SubFamiliaTIDto) {
    this.subFamiliaSeleccionada = row;
    this.pMostrar = 2;
  }

  async fnOcultar(p: number) {
    this.pMostrar = p;
    await this.GetAllSubFamilias();
  }

  async GetAllSubFamilias() {
    let response = await this._subFamiliaCaracteristicaService.GetAllSubFamilias(this.storageData.getPais())
    this.dataSource = new MatTableDataSource(response.response.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fnFiltrar();
  }

}
