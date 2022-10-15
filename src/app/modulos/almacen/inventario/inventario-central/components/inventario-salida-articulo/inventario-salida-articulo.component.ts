import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RegistroCantidadArticuloComponent } from '../registro-cantidad-articulo/registro-cantidad-articulo.component';
import Swal from 'sweetalert2';
import { InventarioService } from '../../../inventario.service';

@Component({
  selector: 'app-salida-articulo',
  templateUrl: './inventario-salida-articulo.component.html',
  styleUrls: ['./inventario-salida-articulo.component.css','../../inventario-central.component.css'],
  animations: [asistenciapAnimations],
})
export class InventarioSalidaArticuloComponent implements OnInit {
  abLista = [];
  tsLista = 'inactive'; 
  isEditar: boolean = true;
  displayedColumns: string[] = ['trasladar','saldo','sRazonSocial', 'cliente','codigoPresupuesto', 
  'sCodAlmacen', 'codigoArticulo','sLote', 'nombreArticulo','fechaIngreso','fechaVencimiento',
  'sObservacion','nMerma','nMarcado'];
  fbLista = [
    {icon: 'save', tool: 'Crear'}
  ];
  dataSource: MatTableDataSource<any>;
  idUser: any;
  listaArticulosSeleccionados: any;
  
  @ViewChild('paginatorSalida', {static:true}) paginator: MatPaginator
  @ViewChild('msSalida', {static:true}) sort: MatSort;
  // @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  // @ViewChild(MatSort, { static: false }) sort: MatSort;
  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<InventarioSalidaArticuloComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private inventarioService: InventarioService
    ) { }

  ngOnInit(): void {
    let user = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.listaArticulosSeleccionados = this.addNewValueList(this.data.listaArticulos);
    this.llenarTablaArticulo(this.listaArticulosSeleccionados);
    this.onToggleFab(1, -1)
  }

  llenarTablaArticulo(listaArticulo) {
    this.dataSource = new MatTableDataSource(listaArticulo);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  addNewValueList(lista: any[]) {
    // Usamos este metodo para agregar el campo cantidadTraslado en la tabla
    lista.forEach(item => {
      item.cantidadTraslado = 0;
    });
    return lista;
  }

  agregarCantidadSalida(articulo) {
    const dialogRefAñadir = this.dialog.open(RegistroCantidadArticuloComponent, {
      width: '300px',
      height: '300px',
      data: {
        'cantidadMaxima': (articulo.saldo),
        'titulo': 'Salida'
      },
      autoFocus: false,
      disableClose: true
    });
    dialogRefAñadir.afterClosed().subscribe(async result => {
      if(result) {
        this.listaArticulosSeleccionados.map(item => {
          if(item.nIdUbicaArticulo === articulo.nIdUbicaArticulo){
            item.cantidadTraslado = result;
          }
          return item;
        })
      }
    })
  }

  async salidaArticulos() {
    //Recorremos la lista para ver que todos sean mayor a uno
    const validarListaPalletsVacios = this.validarListaPallets(this.listaArticulosSeleccionados);
    if(validarListaPalletsVacios) {
      return Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'Todos los articulos tienen que tener una cantidad mínima de 1 para trasladar',
        showConfirmButton: false,
        timer: 1500
      });
    }

    const ubicacionAntiguo = this.data.ubicacionId;
    await this.retirarElementosBD(ubicacionAntiguo);
    this.dialogRef.close(1);
  }

  async retirarElementosBD(ubicacionAntiguo: string) {
    const tipoOperacion = 0;
    const merma = 0;
    const marcado = 0;
    for(const element of this.listaArticulosSeleccionados){
      let parametro = `${ubicacionAntiguo}|${element.nIdAlmacen}|${element.nIdCentroCosto}|${element.nIdArticulo}|${element.sLote}|${element.fechaIngreso}|${element.fechaVencimiento}|${element.sObservacion}|0|${element.cantidadTraslado}|${this.idUser}|${tipoOperacion}|${merma}|${marcado}`;
      const resp = await this.inventarioService.insertOrUpdateArticuloInventario(1,parametro);
    }
    
  }

  validarListaPallets(listaArticulos: any[]): boolean {
    let cantidad = 0;
    listaArticulos.forEach(item => {
      if(item.cantidadTraslado === 0) {
        cantidad++;
      }
    })
    return cantidad > 0 ? true : false;
  }

  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }

  salir() {
    this.dialogRef.close();
  }

  cambioSalida(cantidadSalida, articulo: any) {
    let cantidad = Number.parseInt(cantidadSalida);
    if(cantidad <= 0) {
      return Swal.fire({
        title: '¡Atención!',
        text: 'La cantidad tiene que ser mayor a 0',
        icon: 'warning',
        //timer: 1500
      })
    }
    if(articulo.saldo < cantidad) {
      return Swal.fire({
        title: '¡Atención!',
        text: 'No hay suficiente cantidad para retirar, revisar',    
        icon: 'warning',
      })
    }
    if(cantidadSalida !== '') {
      this.listaArticulosSeleccionados.map(item => {
        if(item.nIdUbicaArticulo === articulo.nIdUbicaArticulo){
          item.cantidadTraslado = cantidad;
        }
        return item;
      })
      //console.log('LISTA ARTICULOS', this.listaArticulosSeleccionados);
    }
  }

}
