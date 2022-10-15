import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { ArticuloDto } from '../api/models/articuloDTO';
import { ArticuloService } from '../api/services/articulo.service';

@Component({
  selector: 'app-ti-articulo',
  templateUrl: './ti-articulo.component.html',
  styleUrls: ['./ti-articulo.component.scss'],
  animations: [asistenciapAnimations]
})
export class TiArticuloComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource: MatTableDataSource<ArticuloDto>
  displayedColumns: string[];
  storageData: SecurityErp = new SecurityErp();

  /* #region   Asignación nombres de campos y columnas*/
  cols: any[] = [
    { header: 'Opción', field: 'accion', type: 'accion', width: '40', align: 'center' },
    { header: 'Código', field: 'sCodArticulo', type: null, width: '50', align: 'center' },
    { header: 'Descripción', field: 'sArticulo', type: null, width: '300', align: 'left' },
    { header: 'Marca', field: 'sMarca', type: null, width: '100', align: 'left' },
    { header: 'Caracteristicas', field: 'sComponentes', type: null, width: '360', align: 'left' },
    { header: 'Part Number', field: 'sNumeroParte', type: null, width: '90', align: 'left' },
    { header: 'Foto', field: 'sFoto', type: null, width: '50', align: 'left' },
    { header: 'Área creación', field: 'sAreaRegistro', type: null, width: '100', align: 'left' },
    { header: 'Estado', field: 'sEstado', type: null, width: '60', align: 'left' },
  ];
  /* #endregion */

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'add', tool: 'Nuevo Artículo', state: true},
    {icon: 'cloud_download', tool: 'Descargar Excel', state: true}
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  constructor(
    private spinner: NgxSpinnerService,
    private articuloService: ArticuloService,
    private route: Router
  ) {
    this.displayedColumns = this.cols.map(({ field }) => field);
  }

  ngOnInit(): void {
    this.onToggleFab(1, -1);
    this.listarArticulos();
    this.fnControlFab();
  }

  listarArticulos(): void {
    this.spinner.show();
    this.articuloService.getAllSearch(this.storageData.getPais()).then(res => {
      this.dataSource = new MatTableDataSource<ArticuloDto>(res);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.spinner.hide();
    });
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
        this.nuevo();
        break;
      case 1:
        this.fnDescargarExcel();
        break;
      default:
        break;
    }
  }

  // Metodo para actualizar el estado de los botones
  fnControlFab(){
    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion

  /* #region  Método de filtración del listado */
  applyFilter(filterValue: string) { this.dataSource.filter = filterValue.trim().toLowerCase(); if(filterValue == '') this.listarArticulos();}
  /* #endregion */

  /* #region  Método de limpieza del auto filtrado */
  fnClean(): void { 
    this.listarArticulos();
    this.dataSource.filter = '';
  }
  /* #endregion */

  /* #region  Redirección para nuevo artículo */
  nuevo(): void {
    this.route.navigate(['til/tecnologia/ti-articulo-detalle']);
  }
  /* #endregion */

  //#region 

  async fnDescargarExcel(){

    let bTieneImagen: boolean = false;

    const confirma = await Swal.fire({
      title: `¿Desea incluir las imagenes en el excel?`,
      icon: 'question',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Si',
      showDenyButton: true,
      denyButtonText: 'No',
      showCancelButton: true,
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar'
    });

    if (confirma.isDismissed) {
      return;
    }

    if (confirma.isConfirmed) {
      bTieneImagen = true;
    }

    if (confirma.isDenied) {
      bTieneImagen = false;
    }

    this.spinner.show();

    const archivoExcel = await this.articuloService.GenerarExcelListaArticulos(this.storageData.getPais(), bTieneImagen);
    saveAs(archivoExcel, 'Lista de artículos.xlsx');
    this.spinner.hide();
  }

  //#endregion

  /* #region  redirección para ver datos registrados del artículo */
  verDetalle(row: ArticuloDto): void {
    this.route.navigate(['til/tecnologia/ti-articulo-detalle', row.nIdArticulo]);
  }
  /* #endregion */

  /* #region  método de muestra de imagen del artículo */
  verImagen(row: ArticuloDto): void {
    Swal.fire({ title: row.sCodArticulo, text: row.sArticulo, imageUrl: row.sImagen, imageHeight: 250 });
  }
  /* #endregion */

  /* #region  método de validación de existencia de imagen del artículo */
  hasImagen(row: ArticuloDto): boolean {
    return row.sImagen == null || row.sImagen == '' ? false : true;
  }
  /* #endregion */
}
