import { Component, OnInit, Inject, ViewChild, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Ubicacion } from '../../inventario-central.component';
import { startWith, map } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import { InventarioIngresoArticuloComponent } from '../inventario-ingreso-articulo/inventario-ingreso-articulo.component';
import { RegistroCantidadArticuloComponent } from '../registro-cantidad-articulo/registro-cantidad-articulo.component';
import Swal from 'sweetalert2';
import { InventarioService } from '../../../inventario.service';

@Component({
  selector: 'app-traslado-articulo',
  templateUrl: './inventario-traslado-articulo.component.html',
  styleUrls: ['./inventario-traslado-articulo.component.css', '../../inventario-central.component.css'],
  animations: [asistenciapAnimations]
})
export class InventarioTrasladoArticuloComponent implements OnInit {
  abLista = [];
  tsLista = 'inactive';
  isEditar: boolean = true;
  fbLista = [
    { icon: 'save', tool: 'Crear' }
  ];
  ubicacionActual: string;
  idUbicacionAntigua: number;
  formUbicacion: FormGroup;
  listaUbicacionesCompletas: any;
  listaArticulosSeleccionados: any;
  idUser: any;
  filterUbicacion: Observable<Ubicacion[]>;
  displayedColumns: string[] = ['trasladar', 'saldo', 'sRazonSocial', 'cliente', 'codigoPresupuesto', 'sCodAlmacen',
    'codigoArticulo', 'sLote', 'nombreArticulo', 'fechaIngreso', 'fechaVencimiento',
    'sObservacion', 'nMerma', 'nMarcado'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource: any;
  mobile: any;
  public innerWidth: any;
  constructor(
    private inventarioService: InventarioService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    public diaglogRef: MatDialogRef<InventarioTrasladoArticuloComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.crearFormulario();
    let user = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.innerWidth = window.innerWidth;
    if (this.innerWidth <= 768) {
      this.mobile = true;
      this.ubicacionActual = this.data.ubicacionActual.split('-')[0];
    } else {
      this.mobile = false;
      this.ubicacionActual = this.data.ubicacionActual;
    }

    this.idUbicacionAntigua = this.data.ubicacionId;
    this.listaArticulosSeleccionados = this.addNewValueList(this.data.listaArticulos);
    this.listaUbicacionesCompletas = this.data.listaUbicaciones;
    this.llenarTablaArticulo(this.listaArticulosSeleccionados);
    this.filtrarAutocompleteUbicacion();
    this.onToggleFab(1, -1)
  }

  // Lo usamos para detectar cambios en la pantalla
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    if (this.innerWidth <= 768) {
      this.mobile = true;
      this.ubicacionActual = this.data.ubicacionActual.split('-')[0];
    } else {
      this.mobile = false;
      this.ubicacionActual = this.data.ubicacionActual;
    }
  }

  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;

  }

  addNewValueList(lista: any[]) {
    // Usamos este metodo para agrewgar el campo cantidadTraslado en la tabla
    lista.forEach(item => {
      item.cantidadTraslado = 0;
    });
    return lista;
  }

  crearFormulario() {
    this.formUbicacion = this.fb.group({
      'codigo': ['', Validators.required],
      'ubicacion': ['']
    })
  }

  llenarTablaArticulo(listaArticulo) {
    this.dataSource = new MatTableDataSource(listaArticulo);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private filtrarAutocompleteUbicacion() {
    this.filterUbicacion = this.formUbicacion.controls['codigo'].valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.codigo),
      map(codigo => codigo ? this._filterUbicacion(codigo) : this.listaUbicacionesCompletas.slice())
    );
  }

  private _filterUbicacion(codigo: string) {
    const filterValue = codigo.toLocaleLowerCase();
    return this.listaUbicacionesCompletas.filter(option => option.codigo.toLocaleLowerCase().indexOf(filterValue) === 0);
  }

  // Traslado de Artículos
  async trasladarArticulos() {
    // Validar que el campo del capllet no se encuentre vacío
    const codigoUbicacion = this.formUbicacion.get('ubicacion').value;
    const codigoCompletoUbicacion = this.formUbicacion.get('codigo').value;
    if (codigoCompletoUbicacion === this.ubicacionActual) {
      return Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'No se puede trasladar a la misma ubicación',
      });
    }
    if (codigoUbicacion === '') {
      return Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'La ubicación nueva es obligatoria',
      });
    }
    //Recorremos la lista para ver que todos sean mayor a uno
    const validarListaPalletsVacios = this.validarListaPallets(this.listaArticulosSeleccionados);
    if (validarListaPalletsVacios) {
      return Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'Todos los articulos tienen que tener una cantidad mínima de 1 para trasladar y menor igual a la cantida de artículo',
      });
    }

    // Si todo está bien, trasladamos los artículos al nuevo pallet
    // let tipoOperacion = 0;
    // const codigoPallet = this.formUbicacion.get('ubicacion').value;
    // const idNuevo = this.listaUbicacionesCompletas.filter(item => item.codigo ===  codigoPallet)[0].idUbicacion;
    // for(const element of this.listaArticulosSeleccionados){
    //   let parametro = `${this.idUbicacionAntigua}|${element.nIdAlmacen}|${element.nIdCentroCosto}|${element.nIdArticulo}|${element.sLote}|${element.fechaIngreso}|${element.fechaVencimiento}|${element.sObservacion}|0|${element.cantidadTraslado}|${this.idUser}|${tipoOperacion}`;
    //   const resp = await this.inventarioService.insertOrUpdateArticuloInventario(1,parametro);
    // }
    // tipoOperacion = 1;
    // // Ingreso todos 
    // for(const element of this.listaArticulosSeleccionados){
    //   let parametro = `${idNuevo}|${element.nIdAlmacen}|${element.nIdCentroCosto}|${element.nIdArticulo}|${element.sLote}|${element.fechaIngreso}|${element.fechaVencimiento}|${element.sObservacion}|${element.cantidadTraslado}|0|${this.idUser}|${tipoOperacion}`;
    //   const resp = await this.inventarioService.insertOrUpdateArticuloInventario(1,parametro);
    // }
    const codigoPallet = this.formUbicacion.get('ubicacion').value;
    const idNuevo = this.listaUbicacionesCompletas.filter(item => item.codigo === codigoPallet)[0].idUbicacion;
    const merma = 0;
    const marcado = 0;
    for (const element of this.listaArticulosSeleccionados) {

      const ultimoIdArticulo: any = await this.inventarioService.listaInformacionInventario(6, `${this.idUbicacionAntigua}|${element.nIdArticulo}`);;
      // Salida
      let parametroSalida = `${this.idUbicacionAntigua}|${element.nIdAlmacen}|${element.nIdCentroCosto}|${element.nIdArticulo}|${element.sLote}|${element.fechaIngreso}|${element.fechaVencimiento}|${element.sObservacion}|0|${element.cantidadTraslado}|${this.idUser}|${0}|${0}|${merma}|${marcado}`;
      const respSalida = await this.inventarioService.insertOrUpdateArticuloInventario(1, parametroSalida);

      // Ingreso
      let parametroIngreso = `${idNuevo}|${element.nIdAlmacen}|${element.nIdCentroCosto}|${element.nIdArticulo}|${element.sLote}|${element.fechaIngreso}|${element.fechaVencimiento}|${element.sObservacion}|${element.cantidadTraslado}|0|${this.idUser}|${1}|${ultimoIdArticulo.nIdUbicaArticulo}|${merma}|${marcado}`;
      const respIngreso = await this.inventarioService.insertOrUpdateArticuloInventario(1, parametroIngreso);
    }
    this.diaglogRef.close(1);
  }

  validarListaPallets(listaArticulos: any[]): boolean {
    let cantidad = 0;
    listaArticulos.forEach(item => {
      if (item.cantidadTraslado <= 0) {
        cantidad++;
      }
    })
    return cantidad > 0 ? true : false;
  }



  salir() {
    this.diaglogRef.close();
  }

  anadirCantidadTraslado(articulo) {
    const dialogRefAñadir = this.dialog.open(RegistroCantidadArticuloComponent, {
      width: '300px',
      height: '300px',
      data: {
        // 'cantidadMaxima': (articulo.cantidadIngreso - articulo.cantidadSalida),
        'cantidadMaxima': (articulo.saldo),
        'titulo': 'Traslado'
      },
      autoFocus: false,
      disableClose: true
    });
    dialogRefAñadir.afterClosed().subscribe(async result => {
      if (result) {
        this.listaArticulosSeleccionados.map(item => {
          if (item.nIdUbicaArticulo === articulo.nIdUbicaArticulo) {
            item.cantidadTraslado = result;
          }
          return item;
        })
      }
    })
  }

  get validarUbicacionNueva() {
    if (this.formUbicacion.get('codigo').touched) {
      const codigo = this.formUbicacion.get('codigo').value;
      const listaTemp = this.listaUbicacionesCompletas.filter(option => option.nombre === codigo);
      if (listaTemp.length === 0) {
        this.formUbicacion.controls.ubicacion.setValue('');
        return true;
      } else {
        this.formUbicacion.controls.ubicacion.setValue(listaTemp[0].codigo);
        return false;
      }
    }
    return false;
  }

  cambioTraslado(cantidadTraslado, articulo: any) {
    let cantidad = Number.parseInt(cantidadTraslado);
    if (cantidad <= 0) {
      return Swal.fire({
        title: '¡Atención!',
        text: 'La cantidad tiene que ser mayor a 0',
        icon: 'warning',
      })
    }
    if (articulo.saldo < cantidad) {
      return Swal.fire({
        title: '¡Atención!',
        text: 'No hay suficiente cantidad para trasladar, revisar',
        icon: 'warning',
      })
    }
    if (cantidadTraslado !== '') {
      this.listaArticulosSeleccionados.map(item => {
        if (item.nIdUbicaArticulo === articulo.nIdUbicaArticulo) {
          item.cantidadTraslado = cantidad;
        }
        return item;
      })
    }

  }

}
