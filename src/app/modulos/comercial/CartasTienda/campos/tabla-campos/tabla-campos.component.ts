import { AfterViewInit, Component, ViewChild, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { CartaTiendaService } from '../../service/carta-tienda.service';
import { CampoMostrar } from '../../models/campos/CampoMostrar';

@Component({
  selector: 'app-tabla-campos',
  templateUrl: './tabla-campos.component.html',
  styleUrls: ['./tabla-campos.component.css'],
})
export class TablaCamposComponent implements OnInit {
  //#region Variables para mostrar los campos
  dataMostrar: CampoMostrar[] = [];

  displayedColumns: string[] = [
    'nIdCampo',
    'sNombre',
    'sTipoCampo',
    'Acciones',
  ];
  dataSource = new MatTableDataSource<CampoMostrar>(this.dataMostrar);
  //#endregion

  //#region Variable para la paginacion
  @ViewChild(MatPaginator) paginator: MatPaginator;
  //#endregion

  //#region Contructor
  constructor(private cartaTiendaService: CartaTiendaService) {}
  //#endregion

  //#region CICLO DE VIDA
  ngOnInit() {
    this._cargarData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  //#endregion

  //#region CARGAR DATA DE LA API
  private _cargarData() {
    let param = [];
    this.cartaTiendaService.crudCampo(4, param).then((data: CampoMostrar[]) => {
      this.dataMostrar = data;
      this.dataSource = new MatTableDataSource<CampoMostrar>(this.dataMostrar);
      this.dataSource.paginator = this.paginator;
    });
  }
  //#endregion

  //#region Acciones de la tabla
  public eliminarCampo(campoID: number, tipoCampoId: number) {
    let param = [];
    param.push(campoID);
    param.push(tipoCampoId);

    this.cartaTiendaService.crudCampo(5, param).then((id: number) => {
      this.dataMostrar = this.dataMostrar.filter(
        (item) => item.nIdCampo !== id
      );
      this.dataSource = new MatTableDataSource<CampoMostrar>(this.dataMostrar);
      this.dataSource.paginator = this.paginator;
    });
  }
  //#endregion
}
