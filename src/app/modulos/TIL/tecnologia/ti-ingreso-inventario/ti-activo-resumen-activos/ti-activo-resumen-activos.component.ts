import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { ActivoResumenDTO } from '../../api/models/activoDTO';
import { ActivoService } from '../../api/services/activo.service';

@Component({
  selector: 'app-ti-activo-resumen-activos',
  templateUrl: './ti-activo-resumen-activos.component.html',
  styleUrls: ['./ti-activo-resumen-activos.component.css']
})
export class TiActivoResumenActivosComponent implements OnInit {

  // Mat-Table (Cargas pendientes)
  dataSource: MatTableDataSource<ActivoResumenDTO>;
  listaActivosResumen: ActivoResumenDTO[] = [];
  displayedColumns: string[] = ["sImagen", "sTipoActivo", "sArticulo", "sComponentes", "nGabetaStock", "nStockProvincia", "nGabetaRevision", "nAsignado", "nAsignadoRevision", "nReposicion", "nTotalActivos"];
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) public sort: MatSort;
  txtFiltro = new FormControl(); // Filtro de busqueda de la tabla

  constructor(
    private spinner: NgxSpinnerService,
    private _activoService: ActivoService,
    public dialogRef: MatDialogRef<TiActivoResumenActivosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    // Inicializar tablas
    this.dataSource = new MatTableDataSource(this.listaActivosResumen);
  }

  async ngOnInit(): Promise<void> {

    await this.fnLlenarTabla();

    this.spinner.hide();
  }

  // Llenado de la tabla Activos
  async fnLlenarTabla(){

    try{
      const result = await this._activoService.GetAllResumenActivos();
      this.listaActivosResumen = result.response.data;
      this.dataSource.data = this.listaActivosResumen;
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

  fnVerImagenTabla(row: ActivoResumenDTO){

    if(row.sArticulo != null && row.sArticulo != ''){
      // Obtenemos el codigo y el nombre del articulo
      const descripcionArticulo = row.sArticulo;
      // const codigoArticulo = descripcionArticulo.split(' ')[0];
      // const nombreArticulo = descripcionArticulo.slice(codigoArticulo.length + 2, descripcionArticulo.length);
      const urlImagen = row.sRutaArchivo == '' || row.sRutaArchivo == null ? '/assets/img/SinImagen.jpg' : row.sRutaArchivo
      
      Swal.fire({ text: descripcionArticulo, imageUrl: urlImagen, imageHeight: 250 });
    }
  }

  fnVerCaracteristicas(row: ActivoResumenDTO){
    Swal.fire({ title: 'Caracteristicas', text: row.sComponentes});
  }

}
