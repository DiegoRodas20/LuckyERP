import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { CompraService } from '../compra.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-compras-dialog',
  templateUrl: './compras-dialog.component.html',
  styleUrls: ['./compras-dialog.component.css']
})
export class ComprasDialogComponent implements OnInit {

  // Parametros iniciales
  url: string; // URL base
  idUser: number; // Id del usuario
  pNom: string;    // Nombre del Usuario
  idEmp: string;  // Id de la empresa del grupo Actual
  pPais: string;  // Codigo del Pais de la empresa Actual

  // Tabla
  displayedColumns = ['sCodArticulo', 'sArticulo', 'sRutaImagen','nCantMin', 'nStockActual']; // Definicion de columnas de la tabla
  dataSource: MatTableDataSource<any>; // Data de la tabla
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator; // Paginacion para la tabla
  @ViewChild(MatSort, { static: false }) sort: MatSort; // Order para la tabla
  txtFiltro = new FormControl(); // Filtro para la tabla
  rbFiltro = new FormControl();

  constructor(
    private spinner: NgxSpinnerService,
    @Inject('BASE_URL') baseUrl: string,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private ref: ChangeDetectorRef,
    public dialogRef: MatDialogRef<ComprasDialogComponent>,
    public dialog: MatDialog,
    public ordenCompraService: CompraService,

  ) {
    this.url = baseUrl;
    dialogRef.disableClose = true;
  }

  async ngOnInit(): Promise<void> {
    this.rbFiltro.setValue(1) // Poner para que la tabla filtre por todos los valores
    await this.fnCrearTablaArticulosStockMinimo();
    this.spinner.hide();
  }

  ngAfterContentChecked() {
    this.ref.detectChanges();
  }

  // Metodo para crear la tabla. Esta tambien aplica los filtros
  fnCrearTablaArticulosStockMinimo(){

    // Definir el contenido de la mat table dependiendo del valor del radiobutton
    if(this.rbFiltro.value == 1){
      this.dataSource = new MatTableDataSource(this.data);
    }
    else if(this.rbFiltro.value == 2){
      const dataFiltrada = this.data.filter((articulo) => articulo.nStockActual < articulo.nCantMin )
      this.dataSource = new MatTableDataSource(dataFiltrada);
    }

    setTimeout(() => this.dataSource.paginator = this.paginator);
    setTimeout(() => this.dataSource.sort = this.sort);
  }

  // Metodo para filtrar en la tabla
  fnFiltrarPresupuestos(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Metodo para ver la imagen
  verImagen(imagenArticulo){
    // Si tiene imagen muestra la imagen en un SweetAlert
    if(imagenArticulo != '' && imagenArticulo != null) {
      Swal.fire({
        imageUrl: imagenArticulo,
        imageWidth: 250,
        imageHeight: 250,
      })
    }
    // Si no tiene imagen muestra la imagen por defecto en un SweetAlert
    else {
      Swal.fire({
        imageUrl: '/assets/img/SinImagen.jpg',
        imageWidth: 250,
        imageHeight: 250,
      })
    }
  }

  fnCerrarDialog(){

    /*
    // Revisar si ya se ha visto y existe el elemento en el localstorage
    const dialogVisto = localStorage.getItem('alertaComprasVisto');

    // Seleccionar el tiempo en el que demorara mostrar nuevamente el mensaje
    const fecha = new Date(); // Obtenemos el dia de hoy
    const minutosEspera = 1; // Declaramos la cantidad de minutos a esperar para mostrar nuevamente el mensaje
    fecha.setMinutes(fecha.getMinutes() + minutosEspera); // Le sumamos ese tiempo

    // Si no existe el elemento
    if(!dialogVisto){

      // Agregamos el nuevo estado del mensaje
      const nuevoDialogVistoJSON = {
        visto: true,
        tiempoEspera: fecha,
      }

      localStorage.setItem('alertaComprasVisto', JSON.stringify(nuevoDialogVistoJSON));
    }

    // Si existe, modificar elemento
    else{
      const editarDialogVistoJSON = JSON.parse(dialogVisto);

      // Actualizar tiempo hasta que se muestre nuevamente el mensaje
      editarDialogVistoJSON.tiempoEspera = fecha;
      localStorage.setItem('alertaComprasVisto', JSON.stringify(editarDialogVistoJSON));
    }
    */

    this.dialogRef.close();
  }

}
