import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { AlmacenesService } from '../../almacenes/almacenes.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { InventarioService } from '../inventario.service';
import { MatSort } from '@angular/material/sort';
import { asistenciapAnimations } from '../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { InventarioTrasladoArticuloComponent } from './components/inventario-traslado-articulo/inventario-traslado-articulo.component';
import { InventarioIngresoArticuloComponent } from './components/inventario-ingreso-articulo/inventario-ingreso-articulo.component';
import { InventarioSalidaArticuloComponent } from './components/inventario-salida-articulo/inventario-salida-articulo.component';
import { BusquedaArticuloComponent } from './components/busqueda-articulo/busqueda-articulo.component';
import { RegistroCantidadArticuloComponent } from './components/registro-cantidad-articulo/registro-cantidad-articulo.component';
import { ScannerComponent } from './scanner/scanner.component';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { HistorialUbicacionComponent } from './components/historial-ubicacion/historial-ubicacion.component';
import { ReportExcelComponent } from './components/report-excel/report-excel.component';
import { MatPaginatorModule } from '@angular/material/paginator';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

export interface Ubicacion {
  idUbicacion: number;
  codigo: string;
  nombre: string;
}


@Component({
  selector: 'app-inventario-central',
  templateUrl: './inventario-central.component.html',
  styleUrls: ['./inventario-central.component.css'],
  animations: [asistenciapAnimations]
})

export class InventarioCentralComponent implements OnInit {
  // Variables para la animación de los botones laterales
  tsLista = 'inactive';  // Inicia la lista oculta
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'add', tool: 'Ingreso de Articulo' },
    { icon: 'exit_to_app', tool: 'Salida Artículo' },
    { icon: 'sync', tool: 'Traslado Artículo' },
    { icon: 'search', tool: 'Busqueda de Artículos' },
    { icon: 'article', tool: 'Reporte de Inventario' },
    // {icon: 'article', tool: 'Reporte de Inventario Ubicación'},
    // {icon: 'article', tool: 'Reporte de Inventario Kardex'},
  ];
  abLista = [];

  // Variables para la lógica
  isEditar: boolean = true;
  listaAlmacenBase: any;
  listaPasillo: any;
  listaBloque: any;
  listaColumna: any;
  listaFila: any;
  listaPallet: any;
  listaUbicacionGeneral: any;
  idPais: string;
  idEmpresa: string;
  idUbicacion: number;
  formUbicacion: FormGroup;
  listaUbicacionesCompletas: any;
  txtFiltro = new FormControl();
  listaArticulos: any;
  idUser: any;
  listaAlmacenUsuario: any;
  listaAlmacenBaseUsuario: any;
  // displayedColumns: string[] = ['opciones', 'empresa', 'cliente','presupuesto', 'almacen', 'articulo', 'descripcion','lote' ,'ingreso','vence','observacion','cantidad','merma','marcado','imagen','select'];
  displayedColumns: string[] = [];
  dataSource: any;
  tipoDiseno: number = 1; // Sirve para determinar si se le mostrará ubicación pallet, ubicación general o ambos
  articulosSeleccionados = new SelectionModel<any>(true, []);
  filterUbicacion: Observable<Ubicacion[]>;
  isCamara: boolean = false;
  qrString: string = '';
  mobile: any;
  public innerWidth: any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  bDialogOpen = false;

  constructor(
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private almacenService: AlmacenesService,
    private fb: FormBuilder,
    private inventarioService: InventarioService
  ) {

  }

  async ngOnInit() {
    this.spinner.show();
    this.crearFormulario();

    this.innerWidth = window.innerWidth;
    if (this.innerWidth <= 768) {
      this.mobile = true;
    } else {
      this.mobile = false;
    }
    let user = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.idPais = localStorage.getItem('Pais');
    this.idEmpresa = localStorage.getItem('Empresa');
    // this.listaAlmacenBase = await this.almacenService.listarInformacionAlmacen(1,`${this.idPais}|1`);
    this.listaAlmacenBase = await this.inventarioService.listaInformacionInventario(10, `${this.idPais}|${this.idUser}`);
    //console.log('ALMACEN BASE',this.listaAlmacenBase);
    // Seleccionar las columnas
    this.validarColumnas();
    this.llenarTablaArticulo([]);
    if (this.listaAlmacenBase.length > 0) {
      this.formUbicacion.controls.idDireccion.setValue(this.listaAlmacenBase[0].nIdAlmacenBase);
      const almacen = this.listaAlmacenBase.filter(item => item.nIdAlmacenBase === this.listaAlmacenBase[0].nIdAlmacenBase)[0];
      let idDireccion = almacen.nIdDireccion;
      await this.cambioAlmacenBase();
      await this.validarTipoDiseno(idDireccion);
    }
    this.spinner.hide();
    this.onToggleFab(1, -1);
  }

  // Lo usamos para detectar cambios en la pantalla
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    if (this.innerWidth <= 768) {
      this.mobile = true;
    } else {
      this.mobile = false;
    }
  }


  validarColumnas() {
    const switchTrue = this.formUbicacion.get('vistaPresupuesto').value;
    if (switchTrue) { // Vista con presupuesto
      this.displayedColumns = ['opciones', 'sRazonSocial', 'cliente', 'codigoPresupuesto', 'sCodAlmacen', 'codigoArticulo', 'nombreArticulo', 'sLote', 'fechaIngreso', 'fechaVencimiento', 'sObservacion', 'saldo', 'nMerma', 'nMarcado', 'imagen', 'select'];
    } else { // Vista sin presupuesto
      this.displayedColumns = ['opciones', 'sRazonSocial', 'cliente', 'sCodAlmacen', 'codigoArticulo', 'nombreArticulo', 'sLote', 'fechaIngreso', 'fechaVencimiento', 'sObservacion', 'saldo', 'nMerma', 'nMarcado', 'imagen', 'select'];
    }
  }

  async validarTipoDiseno(idDireccion): Promise<void> {
    const validacionTipo: any = await this.almacenService.validarExistenciaUbicacion(3, `${idDireccion}`);
    this.tipoDiseno = validacionTipo.cantidad;
    if (this.tipoDiseno === 1) {
      this.formUbicacion.controls.tipo.setValue('1');
    } else if (this.tipoDiseno === 2) { // Solo se le mostrará ubicación pallet
      this.formUbicacion.controls.tipo.setValue('1');
    } else if (this.tipoDiseno === 3) { // Solo se le mostrará ubicación general
      this.formUbicacion.controls.tipo.setValue('2');
    } else if (this.tipoDiseno === 0) {
      this.formUbicacion.controls.tipo.setValue('0');
      Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'Este almacén no tiene asignado ninguna ubicación, por favor verificar',
      });
    }
  }

  filtrarLista(listaAlmacenBaseUsuario: any[], listaAlmacenUsuario: any[]) {
    let lista: any[] = [];
    listaAlmacenUsuario.forEach(almacenUsuario => {
      let almacen = listaAlmacenBaseUsuario.filter(item => item.nIdDireccion === almacenUsuario.nIdDireccion);
      if (almacen.length > 0) {
        lista.push(almacen[0]);
      }
    })
    return lista;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  async clean() {
    if (this.dataSource) {
      this.dataSource.filter = '';
    }
    this.txtFiltro.setValue('');
    this.spinner.show();
    const codigoPallet = this.formUbicacion.get('pallet').value;
    if (codigoPallet !== '') {
      await this.listarArticulos(codigoPallet);

    }
    this.spinner.hide();
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

  llenarTablaArticulo(listaArticulo) {
    // if(listaArticulo.length > 0) {
    //   listaArticulo = listaArticulo.filter(item => (item.cantidadIngreso - item.cantidadSalida) > 0);
    // }
    this.dataSource = new MatTableDataSource(listaArticulo);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.paginator._intl.itemsPerPageLabel = "Registro por página";
  }

  crearFormulario() {
    this.formUbicacion = this.fb.group({
      'idDireccion': [],
      'pasillo': [''],
      'bloque': [''],
      'columna': [''],
      'codigo': [null],
      'fila': [''],
      'pallet': [''],
      'idUbicacion': [''],
      'ubicacionGeneral': [''],
      'tipo': ['1'],
      'vistaPresupuesto': [false]
    });
  }

  async cambioUbicacionGeneral(ubicacionGeneral) {
    this.spinner.show()
    const ubicacion = this.listaUbicacionGeneral.filter(item => item.codigo === ubicacionGeneral)[0];
    this.idUbicacion = ubicacion.idUbicacion;
    this.formUbicacion.controls.idUbicacion.setValue(this.idUbicacion);
    this.formUbicacion.controls.codigo.setValue(`${ubicacion.codigo}-${ubicacion.nombre}`);
    this.listaArticulos = await this.inventarioService.listaInformacionInventario(1, `${this.idUbicacion}|`);
    this.llenarTablaArticulo(this.listaArticulos);
    this.spinner.hide();
    if (this.listaArticulos.length === 0) {
      return Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'Esta ubicación no contiene artículos',
      });
    }
  }

  async cambioUbicacion(event) {
    const almacenBase = this.formUbicacion.get('idDireccion').value;
    const almacen = this.listaAlmacenBase.filter(item => item.nIdAlmacenBase === almacenBase)[0];
    let idDireccion = almacen.nIdDireccion;
    this.spinner.show();
    this.limpiarListas(2);
    this.llenarTablaArticulo([]);
    this.formUbicacion.controls.pasillo.setValue('');
    this.formUbicacion.controls.bloque.setValue('');
    this.formUbicacion.controls.columna.setValue('');
    this.formUbicacion.controls.fila.setValue('');
    this.formUbicacion.controls.pallet.setValue('');
    // this.formUbicacion.controls.codigo.setValue('');
    this.formUbicacion.controls.codigo.setValue(null);
    this.formUbicacion.controls.idUbicacion.setValue('');
    this.formUbicacion.controls.ubicacionGeneral.setValue('');
    if (event.value === '2') {
      this.listaUbicacionesCompletas = await this.almacenService.obtenerInformacionUbicacionAlmacen(7, `${idDireccion}|`);
    } else {
      this.listaUbicacionesCompletas = await this.almacenService.obtenerInformacionUbicacionAlmacen(6, `${idDireccion}|`);
    }
    this.spinner.hide();

  }

  async cambioAlmacenBase() {
    this.spinner.show();
    let almacenBase = this.formUbicacion.get('idDireccion').value;
    this.formUbicacion.controls.ubicacionGeneral.setValue('');
    this.formUbicacion.controls.pasillo.setValue('');
    this.formUbicacion.controls.bloque.setValue('');
    this.formUbicacion.controls.columna.setValue('');
    this.formUbicacion.controls.fila.setValue('');
    this.formUbicacion.controls.pallet.setValue('');
    // this.formUbicacion.controls.codigo.setValue('');
    this.formUbicacion.controls.codigo.setValue(null);
    this.limpiarListas(1);
    const almacen = this.listaAlmacenBase.filter(item => item.nIdAlmacenBase === almacenBase)[0];
    let idDireccion = almacen.nIdDireccion;
    await this.validarTipoDiseno(idDireccion);
    let tipo = this.formUbicacion.get('tipo').value;
    if (tipo === '2') {
      this.listaUbicacionesCompletas = await this.almacenService.obtenerInformacionUbicacionAlmacen(7, `${idDireccion}|`);
    } else {
      this.listaUbicacionesCompletas = await this.almacenService.obtenerInformacionUbicacionAlmacen(6, `${idDireccion}|`);
    }
    this.listaUbicacionGeneral = await this.almacenService.obtenemosInformacionUbicacionExtra(1, `${idDireccion}|`);
    this.listaPasillo = await this.almacenService.obtenerInformacionUbicacionAlmacen(1, `${idDireccion}|`);
    this.llenarTablaArticulo([]);
    this.filtrarAutocompleteUbicacion();
    this.spinner.hide();
  }

  async cambioPasillo(idPasillo) {
    const nIdDireccion = this.obtenerIdDireccion();
    this.formUbicacion.controls.bloque.setValue('');
    this.formUbicacion.controls.columna.setValue('');
    this.formUbicacion.controls.fila.setValue('');
    this.formUbicacion.controls.pallet.setValue('');
    // this.formUbicacion.controls.codigo.setValue('');
    this.formUbicacion.controls.codigo.setValue(null);
    this.listaBloque = [];
    this.listaColumna = [];
    this.listaFila = [];
    this.listaPallet = [];
    this.listaBloque = await this.almacenService.obtenerInformacionUbicacionAlmacen(2, `${idPasillo}|${nIdDireccion}`);
    this.llenarTablaArticulo([]);
  }

  async cambioBloque(idBloque) {
    // const nIdDireccion = this.formUbicacion.get('idDireccion').value;
    const nIdDireccion = this.obtenerIdDireccion();
    this.formUbicacion.controls.columna.setValue('');
    this.formUbicacion.controls.fila.setValue('');
    this.formUbicacion.controls.pallet.setValue('');
    // this.formUbicacion.controls.codigo.setValue('');
    this.formUbicacion.controls.codigo.setValue(null);
    this.listaColumna = [];
    this.listaFila = [];
    this.listaPallet = [];
    this.listaColumna = await this.almacenService.obtenerInformacionUbicacionAlmacen(3, `${idBloque}|${nIdDireccion}`);
    this.llenarTablaArticulo([]);
  }

  async cambioColumna(idColumna) {
    // const nIdDireccion = this.formUbicacion.get('idDireccion').value;
    const nIdDireccion = this.obtenerIdDireccion();
    this.formUbicacion.controls.fila.setValue('');
    this.formUbicacion.controls.pallet.setValue('');
    // this.formUbicacion.controls.codigo.setValue('');
    this.formUbicacion.controls.codigo.setValue(null);
    this.listaFila = [];
    this.listaPallet = [];
    this.listaFila = await this.almacenService.obtenerInformacionUbicacionAlmacen(4, `${idColumna}|${nIdDireccion}`);
    this.llenarTablaArticulo([]);
  }

  async cambioFila(idFila) {
    // const nIdDireccion = this.formUbicacion.get('idDireccion').value;
    const nIdDireccion = this.formUbicacion.get('idDireccion').value;
    this.formUbicacion.controls.pallet.setValue('');
    // this.formUbicacion.controls.codigo.setValue('');
    this.formUbicacion.controls.codigo.setValue(null);
    this.listaPallet = [];
    this.listaPallet = await this.almacenService.obtenerInformacionUbicacionAlmacen(5, `${idFila}|${nIdDireccion}`);
    this.llenarTablaArticulo([]);
  }

  async cambioPallet(idPallet) {
    this.spinner.show();
    this.articulosSeleccionados.clear();
    this.idUbicacion = this.listaPallet.filter(item => item.codigo === idPallet)[0].idUbicacion;
    this.formUbicacion.controls.idUbicacion.setValue(this.idUbicacion);
    const codigoUbicacion = this.generarDescripcionCodigoUbicacion(idPallet);
    this.formUbicacion.controls.codigo.setValue(codigoUbicacion);
    // const vistaPresupuestoSwitch = this.formUbicacion.get('vistaPresupuesto').value;
    // if(vistaPresupuestoSwitch) {
    //   this.listaArticulos = await this.inventarioService.listaInformacionInventario(1,'');
    // } else {
    //   this.listaArticulos = await this.inventarioService.listaInformacionInventario(8,'');
    // }
    // this.llenarTablaArticulo(this.listaArticulos);

    await this.listarArticulos(idPallet);
    this.spinner.hide();
    if (this.listaArticulos.length === 0) {
      return Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'Este pallet no contiene artículos',
      });
    }
  }

  generarDescripcionCodigoUbicacion(codigoUbicacion: string): string {
    const nombrePallet = this.listaPallet.filter(item => item.codigo === codigoUbicacion)[0].nombre;
    let resp = `${codigoUbicacion} - Pasillo ${codigoUbicacion.substring(0, 1)}, Bloque ${codigoUbicacion.substring(0, 2)}, `;
    resp += `Columna ${codigoUbicacion.substring(2, 4)}, Fila ${codigoUbicacion.substring(4, 6)}, `;
    resp += `${nombrePallet}`;
    ;
    return resp;
  }

  async endAutocomplete() {
    const value = this.formUbicacion.get('codigo').value;
    const tipo = this.formUbicacion.get('tipo').value;
    this.articulosSeleccionados.clear();
    if (tipo === '1') {
      this.spinner.show();
      this.limpiarCampos();
      this.limpiarListas(2);
      // const idDireccion = this.formUbicacion.get('idDireccion').value;
      const idDireccion = this.obtenerIdDireccion();
      const codigoTotal = value.substring(0, 8);
      const codigoPasillo = value.substring(0, 1);
      const codigoBloque = value.substring(0, 2);
      const codigoColumna = value.substring(0, 4);
      const codigoFila = value.substring(0, 6);
      const codigoPallet = value.substring(0, 8);
      this.listaPasillo = await this.almacenService.obtenerInformacionUbicacionAlmacen(1, `${idDireccion}|`);
      this.listaBloque = await this.almacenService.obtenerInformacionUbicacionAlmacen(2, `${codigoPasillo}|${idDireccion}`);
      this.listaColumna = await this.almacenService.obtenerInformacionUbicacionAlmacen(3, `${codigoBloque}|${idDireccion}`);
      this.listaFila = await this.almacenService.obtenerInformacionUbicacionAlmacen(4, `${codigoColumna}|${idDireccion}`);
      this.listaPallet = await this.almacenService.obtenerInformacionUbicacionAlmacen(5, `${codigoFila}|${idDireccion}`);
      this.formUbicacion.controls.pasillo.setValue(codigoPasillo);
      this.formUbicacion.controls.bloque.setValue(codigoBloque);
      this.formUbicacion.controls.columna.setValue(codigoColumna);
      this.formUbicacion.controls.fila.setValue(codigoFila);
      this.formUbicacion.controls.pallet.setValue(codigoPallet);
      this.idUbicacion = this.listaPallet.filter(item => item.codigo === codigoPallet)[0].idUbicacion;
      this.formUbicacion.controls.idUbicacion.setValue(this.idUbicacion);
      await this.listarArticulos(codigoPallet);
      this.spinner.hide();
      if (this.listaArticulos.length === 0) {
        return Swal.fire({
          icon: 'warning',
          title: '¡Atención!',
          text: 'Esta ubicación no contiene artículos',
        });
      }
    } else {
      this.spinner.show();
      const ubicacion = this.listaUbicacionesCompletas.filter(item => item.nombre === value)[0];
      this.idUbicacion = ubicacion.idUbicacion;
      this.formUbicacion.controls.idUbicacion.setValue(this.idUbicacion);
      this.formUbicacion.controls.ubicacionGeneral.setValue(ubicacion.codigo);
      this.listaArticulos = await this.inventarioService.listaInformacionInventario(1, `${this.idUbicacion}|`);
      this.llenarTablaArticulo(this.listaArticulos);
      this.spinner.hide();
      if (this.listaArticulos.length === 0) {
        return Swal.fire({
          icon: 'warning',
          title: '¡Atención!',
          text: 'Esta ubicación no contiene artículos',
          //showConfirmButton: false,
          //timer: 1500
        });
      }
    }


  }

  async listarArticulos(codigoPallet: any) {
    const idUbicacion = this.listaPallet.filter(item => item.codigo === codigoPallet)[0].idUbicacion;
    const vistaPresupuestoSwitch = this.formUbicacion.get('vistaPresupuesto').value;
    if (vistaPresupuestoSwitch) { // Agrupado
      this.listaArticulos = await this.inventarioService.listaInformacionInventario(1, `${idUbicacion}|0`);
    } else { // No Agrupado
      this.listaArticulos = await this.inventarioService.listaInformacionInventario(1, `${idUbicacion}|1`);
    }
    this.llenarTablaArticulo(this.listaArticulos);
  }

  async llenarListaArticulo() {
    this.idUbicacion = this.formUbicacion.get('idUbicacion').value;
    const vistaPresupuesto = this.formUbicacion.get('vistaPresupuesto').value;
    if (vistaPresupuesto) { // Si es con vista con presupuesto
      this.listaArticulos = await this.inventarioService.listaInformacionInventario(1, `${this.idUbicacion}|0`);
    } else { // Sino tiene presupuesto
      this.listaArticulos = await this.inventarioService.listaInformacionInventario(1, `${this.idUbicacion}|1`);
    }
  }

  // Ingreso de Artículos
  ingresoArticulos() {
    if (this.formUbicacion.get('idUbicacion').value === '') {
      return Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'Por favor escoja una ubicación',
      });
    }
    const idAlmacenBase = this.formUbicacion.get('idDireccion').value;
    // console.log('almacenBase',idAlmacenBase)
    this.bDialogOpen = true
    const dialogRef = this.dialog.open(InventarioIngresoArticuloComponent, {
      width: '850px',
      maxWidth: '90vw',
      //height: '80%',
      data: {
        'ubicacionActual': this.formUbicacion.get('codigo').value,
        'ubicacionId': this.formUbicacion.get('idUbicacion').value,
        'almacenBaseId': this.formUbicacion.get('idDireccion').value
      },
      autoFocus: false,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(async result => {
      this.bDialogOpen = false

      if (result) {
        this.spinner.show();
        let id;
        if (this.formUbicacion.get('pallet').value === '1') {
          id = this.formUbicacion.get('pallet').value;
          await this.listarArticulos(id); // idPallet
        } else {
          id = this.formUbicacion.get('idUbicacion').value;

          // this.listaArticulos = await this.inventarioService.listaInformacionInventario(1,`${id}|`);
          await this.llenarListaArticulo();
          this.llenarTablaArticulo(this.listaArticulos);
        }
        this.spinner.hide();
        this.articulosSeleccionados.clear();
        return Swal.fire({
          icon: 'success',
          title: 'El artículo se registró exitosamente',
          showConfirmButton: false,
          timer: 1500
        });

      }
    })
  }

  salidaArticulo() {

    if (this.formUbicacion.get('idUbicacion').value === '') {
      return Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'Por favor escoja una ubicación',
      });
    }
    if (this.articulosSeleccionados.selected.length === 0) {
      return Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'Por favor escoja al menos un artículo',
      });
    }
    if (this.formUbicacion.get('vistaPresupuesto').value === false) {
      return Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'No puede hacer una salida de artículo con la vista agrupada',
      })
    }
    this.bDialogOpen = true
    const dialogRef = this.dialog.open(InventarioSalidaArticuloComponent, {
      minWidth: '80vW',
      maxWidth: '90vw',
      data: {
        'ubicacionActual': this.formUbicacion.get('codigo').value,
        'ubicacionId': this.formUbicacion.get('idUbicacion').value,
        'listaArticulos': this.articulosSeleccionados.selected,
      },
      autoFocus: false,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(async result => {
      this.bDialogOpen = false

      if (result === 1) {
        this.spinner.show();
        let id;
        if (this.formUbicacion.get('pallet').value === '1') {
          id = this.formUbicacion.get('pallet').value;
          await this.listarArticulos(id); // idPallet
        } else {
          id = this.formUbicacion.get('idUbicacion').value;
          // this.listaArticulos = await this.inventarioService.listaInformacionInventario(1,`${id}|`);
          await this.llenarListaArticulo();
          this.llenarTablaArticulo(this.listaArticulos);
        }
        this.spinner.hide();
        this.articulosSeleccionados.clear()
        return Swal.fire({
          icon: 'success',
          title: 'El retiro de artículo se realizó exitosamente',
          showConfirmButton: false,
          timer: 1500
        });

      }
    })
  }

  trasladoArticulo() {
    if (this.articulosSeleccionados.selected.length === 0) {
      return Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'Por favor escoja al menos un artículo',
      });
    }
    if (this.formUbicacion.get('vistaPresupuesto').value === false) {
      return Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'No puede hacer una salida de artículo con la vista agrupada',
      })
    }
    this.bDialogOpen = true
    const dialogRef = this.dialog.open(InventarioTrasladoArticuloComponent, {
      minWidth: '80vW',
      maxWidth: '90vw',
      data: {
        'ubicacionActual': this.formUbicacion.get('codigo').value,
        'ubicacionId': this.formUbicacion.get('idUbicacion').value,
        'listaUbicaciones': this.listaUbicacionesCompletas,
        'listaArticulos': this.articulosSeleccionados.selected,
      },
      autoFocus: false,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(async result => {
      this.bDialogOpen = false

      if (result === 1) {
        this.spinner.show();
        let id;
        if (this.formUbicacion.get('pallet').value === '1') {
          id = this.formUbicacion.get('pallet').value;
          await this.listarArticulos(id); // idPallet
        } else {
          id = this.formUbicacion.get('idUbicacion').value;
          await this.llenarListaArticulo();
          // this.listaArticulos = await this.inventarioService.listaInformacionInventario(1,`${id}|`);
          this.llenarTablaArticulo(this.listaArticulos);
        }
        this.spinner.hide();
        this.articulosSeleccionados.clear()
        return Swal.fire({
          icon: 'success',
          title: 'El traslado de artículos se realizó exitosamente',
          showConfirmButton: false,
          timer: 1500
        });
      }
    })
  }

  busquedaArticulos() {
    this.bDialogOpen = true
    const dialogRef = this.dialog.open(BusquedaArticuloComponent, {
      width: '90%',
      height: '85%',
      autoFocus: false,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(async result => {
      this.bDialogOpen = false

      if (result) {
        const ubicacionCompleta = this.listaUbicacionesCompletas.filter(item => item.codigo === result.sCodUbicacion)[0];
        this.formUbicacion.controls.codigo.setValue(ubicacionCompleta.nombre);
        await this.endAutocomplete();
      }
    });
  }

  async generarReporteExcel() {
    this.spinner.show();
    let listaPasillo: any[] = [];
    let listaGeneral: any[] = [];
    let listaTotal: any[] = [];
    const idAlmacenBase = this.formUbicacion.get('idDireccion').value;
    const almacenBase = this.listaAlmacenBase.filter(item => item.nIdAlmacenBase === idAlmacenBase)[0];
    const idDireccion = almacenBase.nIdDireccion;
    const nombreAlmacenBase = almacenBase.sDesc;
    const lPasillo = await this.almacenService.obtenerInformacionUbicacionAlmacen(1, `${idDireccion}|`);
    const lGeneral = await this.almacenService.obtenemosInformacionUbicacionExtra(1, `${idDireccion}|`);
    listaPasillo = lPasillo as any[];
    listaGeneral = lGeneral as any[];
    listaTotal.push(...listaPasillo);
    listaTotal.push(...listaGeneral);
    this.spinner.hide();
    this.bDialogOpen = true
    const dialogRefReporte = this.dialog.open(ReportExcelComponent, {
      data: {
        'listaPasillo': listaTotal,
        'nombreAlmacenBase': nombreAlmacenBase,
        'idAlmacenBase': idAlmacenBase
      },
      autoFocus: false,
      disableClose: true
    })
    dialogRefReporte.afterClosed().subscribe(async result => {
      this.bDialogOpen = false

      if (result) {

      }
    })
  }

  async generarReporteDiferenciaUbicacion() {
    this.spinner.show();
    const resp: any = await this.inventarioService.generarReporteUbicacionKardex(1, '', '');
    if (resp === 0) {
      return Swal.fire({
        title: '¡Atención!',
        text: 'No se encuentran registros en el excel',
        icon: 'warning',
      })
    } else {
      const data = resp.filename;
      var link = document.createElement('a');
      link.href = data;
      // Trigger de escarga
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      this.spinner.hide();
      Swal.fire({
        title: 'El Excel ha sido generado',
        html: `Si su descarga no ha comenzado, puede descargarlo <a href='${resp.filename}' download>aquí</a>`,
        icon: 'success',
        showCloseButton: true
      })
    }

  }

  async generarReporteDiferenciaKardex() {
    this.spinner.show();
    const resp: any = await this.inventarioService.generarReporteUbicacionKardex(2, '', '');
    if (resp === 0) {
      this.spinner.hide();
      return Swal.fire({
        title: '¡Atención!',
        text: 'No se encuentran registros en el excel',
        icon: 'warning',
      })
    } else {
      const data = resp.filename;
      var link = document.createElement('a');
      link.href = data;
      // Trigger de escarga
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      this.spinner.hide();
      Swal.fire({
        title: 'El Excel ha sido generado',
        html: `Si su descarga no ha comenzado, puede descargarlo <a href='${resp.filename}' download>aquí</a>`,
        icon: 'success',
        showCloseButton: true
      })
    }

  }

  agregarMarcado(articulo) {
    this.bDialogOpen = true
    const dialogRefAñadir = this.dialog.open(RegistroCantidadArticuloComponent, {
      width: '300px',
      height: '300px',
      data: {
        // 'cantidadMaxima': (articulo.cantidadIngreso - articulo.cantidadSalida),
        'cantidadMaxima': (articulo.saldo),
        'titulo': 'Marcado'
      },
      autoFocus: false,
      disableClose: true
    });
    dialogRefAñadir.afterClosed().subscribe(async result => {
      this.bDialogOpen = false
      if (result) {
        // const cantidadArticulo = (articulo.cantidadIngreso - articulo.cantidadSalida);
        const cantidadArticulo = (articulo.saldo);
        const marcado = 1;
        const merma = articulo.nMerma;
        const cantidadMarcado = result;
        const cantidadSalida = cantidadMarcado;
        const idUbicacion = this.formUbicacion.get('idUbicacion').value;
        // Salida
        let parametroSalida = `${idUbicacion}|${articulo.nIdAlmacen}|${articulo.nIdCentroCosto}|${articulo.nIdArticulo}|${articulo.sLote}|${articulo.fechaIngreso}|${articulo.fechaVencimiento}|${articulo.sObservacion}|0|${cantidadSalida}|${this.idUser}|${0}|${0}|0|0`;
        const respSalida = await this.inventarioService.insertOrUpdateArticuloInventario(1, parametroSalida);
        // Ingreso
        let parametroIngreso = `${idUbicacion}|${articulo.nIdAlmacen}|${articulo.nIdCentroCosto}|${articulo.nIdArticulo}|${articulo.sLote}|${articulo.fechaIngreso}|${articulo.fechaVencimiento}|${articulo.sObservacion}|${cantidadMarcado}|0|${this.idUser}|${0}|${0}|${merma}|${marcado}`;
        const respIngreso = await this.inventarioService.insertOrUpdateArticuloInventario(1, parametroIngreso);
        this.spinner.show();
        // this.listaArticulos = await this.inventarioService.listaInformacionInventario(1,`${idUbicacion}|`);
        await this.llenarListaArticulo();
        this.llenarTablaArticulo(this.listaArticulos);
        Swal.fire({
          icon: 'success',
          title: 'El registró el marcado del artículo correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        this.spinner.hide();
      }
    })
  }

  agregarMerma(articulo) {
    this.bDialogOpen = true
    const dialogRefAñadir = this.dialog.open(RegistroCantidadArticuloComponent, {
      width: '300px',
      height: '300px',
      data: {
        // 'cantidadMaxima': (articulo.cantidadIngreso - articulo.cantidadSalida),
        'cantidadMaxima': (articulo.saldo),
        'titulo': 'Merma'
      },
      autoFocus: false,
      disableClose: true
    });
    dialogRefAñadir.afterClosed().subscribe(async result => {
      this.bDialogOpen = false
      if (result) {
        // const cantidadArticulo = (articulo.cantidadIngreso - articulo.cantidadSalida);
        const cantidadArticulo = (articulo.saldo);
        const marcado = articulo.nMarcado;
        const merma = 1;
        const cantidadMarcado = result;
        const cantidadSalida = cantidadMarcado;
        const idUbicacion = this.formUbicacion.get('idUbicacion').value;
        // Salida
        const estaMarcado = articulo.nMarcado;
        let parametroSalida = '';
        if (estaMarcado === 1) { // Está marcado y se hará una merma
          parametroSalida = `${idUbicacion}|${articulo.nIdAlmacen}|${articulo.nIdCentroCosto}|${articulo.nIdArticulo}|${articulo.sLote}|${articulo.fechaIngreso}|${articulo.fechaVencimiento}|${articulo.sObservacion}|0|${cantidadSalida}|${this.idUser}|${0}|${0}|0|1`;
        } else {
          parametroSalida = `${idUbicacion}|${articulo.nIdAlmacen}|${articulo.nIdCentroCosto}|${articulo.nIdArticulo}|${articulo.sLote}|${articulo.fechaIngreso}|${articulo.fechaVencimiento}|${articulo.sObservacion}|0|${cantidadSalida}|${this.idUser}|${0}|${0}|0|0`;
        }

        const respSalida = await this.inventarioService.insertOrUpdateArticuloInventario(1, parametroSalida);
        // Ingreso

        let parametroIngreso = `${idUbicacion}|${articulo.nIdAlmacen}|${articulo.nIdCentroCosto}|${articulo.nIdArticulo}|${articulo.sLote}|${articulo.fechaIngreso}|${articulo.fechaVencimiento}|${articulo.sObservacion}|${cantidadMarcado}|0|${this.idUser}|${0}|${0}|${merma}|${marcado}`;
        const respIngreso = await this.inventarioService.insertOrUpdateArticuloInventario(1, parametroIngreso);
        this.spinner.show();
        // this.listaArticulos = await this.inventarioService.listaInformacionInventario(1,`${idUbicacion}|`);
        await this.llenarListaArticulo();
        this.llenarTablaArticulo(this.listaArticulos);
        Swal.fire({
          icon: 'success',
          title: 'El registró la merma del artículo correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        this.spinner.hide();
      }
    })
  }

  verImagen(imagenArticulo) {
    if (imagenArticulo) {
      Swal.fire({
        imageUrl: imagenArticulo,
        imageWidth: 250,
        imageHeight: 250,
      })
    } else {
      Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'Este artículo no contiene una imagen',
      });
    }

  }

  async visualizarHistorial(articulo) {
    this.spinner.show();
    const codigo = this.formUbicacion.get('codigo').value;
    const nIdUbicacion = this.formUbicacion.get('idUbicacion').value;
    const parametro = `${nIdUbicacion}|${articulo.nIdAlmacen}|${articulo.nIdArticulo}|${articulo.nIdCentroCosto}|${articulo.sLote}|${articulo.fechaIngreso}|${articulo.fechaVencimiento}`;
    
    const historial = await this.inventarioService.insertOrUpdateArticuloInventario(2, parametro);
    this.spinner.hide();
    this.bDialogOpen = true
    const dialogHistorial = this.dialog.open(HistorialUbicacionComponent, {
      width: '90%',
      height: '90%',
      data: {
        'historial': historial,
        'articulo': articulo,
        'codigoActual': codigo
      },
      autoFocus: false,
      disableClose: true
    });
    dialogHistorial.afterClosed().subscribe(async result => {
      this.bDialogOpen = false

      if (result) {

      }
    });
  }



  // Metodos Extras

  limpiarListas(tipo: number) {
    /*
      1: Pasillo
      2: Bloque
      3: Columna
      4: Fila
      5: Pallet
    */
    switch (tipo) {
      case 1:
        this.listaPasillo = [];
        this.listaBloque = [];
        this.listaColumna = [];
        this.listaFila = [];
        this.listaPallet = [];
        break;
      case 2:
        this.listaBloque = [];
        this.listaColumna = [];
        this.listaFila = [];
        this.listaPallet = [];
        break;
      case 3:
        this.listaColumna = [];
        this.listaFila = [];
        this.listaPallet = [];
        break;
      case 4:
        this.listaFila = [];
        this.listaPallet = [];
        break;
      case 5:
        this.listaPallet = [];
        break;

      default:
        break;
    }

  }

  limpiarCampos() {
    this.formUbicacion.controls.pasillo.setValue('');
    this.formUbicacion.controls.bloque.setValue('');
    this.formUbicacion.controls.columna.setValue('');
    this.formUbicacion.controls.fila.setValue('');
    this.formUbicacion.controls.pallet.setValue('');
  }





  activarCamara() {
    // this.isCamara = !this.isCamara;
    this.bDialogOpen = true
    const dialogRef = this.dialog.open(ScannerComponent, {
      width: '90%',
      height: '90%',
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(async respuesta => {
      this.bDialogOpen = false;

      if (respuesta) {
        if (respuesta === false) {
          return;
        }
        this.qrString = respuesta.toUpperCase();
        if (this.qrString === '' || this.qrString === ' ') {
          this.limpiarListas(1);
          this.limpiarCampos();
          // this.formUbicacion.controls.codigo.setValue('');
          this.formUbicacion.controls.codigo.setValue(null);
          this.formUbicacion.controls.idUbicacion.setValue('');
          return Swal.fire({
            icon: 'warning',
            title: '¡Atención!',
            text: 'El escaneo trajo vacío por favor intentar nuevamente o revisar el código',
          });
        }
        const ubicacionCompleta = this.listaUbicacionesCompletas.filter(item => item.codigo === this.qrString);
        if (ubicacionCompleta.length > 0) {
          let ubicacion = ubicacionCompleta[0];
          this.formUbicacion.controls.codigo.setValue(ubicacion.nombre);
          await this.endAutocomplete();

        } else {
          this.limpiarListas(1);
          this.limpiarCampos();
          // this.formUbicacion.controls.codigo.setValue('');
          this.formUbicacion.controls.codigo.setValue(null);
          this.formUbicacion.controls.idUbicacion.setValue('');
          return Swal.fire({
            icon: 'warning',
            title: '¡Atención!',
            text: 'El código no es una ubicación válida, por favor revisarlo',
          });
        }
      }


    })
  }

  async cambioSlider(event: MatSlideToggleChange) {
    this.spinner.show();
    this.articulosSeleccionados.clear();
    this.llenarTablaArticulo([]);
    this.validarColumnas();
    this.idUbicacion = this.formUbicacion.get('idUbicacion').value;
    if (event.checked === true) { // Si es con vista con presupuesto
      this.listaArticulos = await this.inventarioService.listaInformacionInventario(1, `${this.idUbicacion}|0`);
    } else { // Sino tiene presupuesto
      this.listaArticulos = await this.inventarioService.listaInformacionInventario(1, `${this.idUbicacion}|1`);
    }
    this.llenarTablaArticulo(this.listaArticulos);
    if (this.txtFiltro.value !== '' && this.txtFiltro.value !== null) {
      this.dataSource.filter = this.txtFiltro.value.trim().toLowerCase();
    }
    this.spinner.hide();

  }

  async mostrarRespuesta(respuesta) {
    this.activarCamara();
    if (respuesta === false) {
      return;
    }
    this.qrString = respuesta.toUpperCase();
    if (this.qrString === '' || this.qrString === ' ') {
      this.limpiarListas(1);
      this.limpiarCampos();
      // this.formUbicacion.controls.codigo.setValue('');
      this.formUbicacion.controls.codigo.setValue(null);
      this.formUbicacion.controls.idUbicacion.setValue('');
      return Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'El escaneo trajo vacío por favor intentar nuevamente o revisar el código',
      });
    }
    const ubicacionCompleta = this.listaUbicacionesCompletas.filter(item => item.codigo === this.qrString);
    if (ubicacionCompleta.length > 0) {
      let ubicacion = ubicacionCompleta[0];
      this.formUbicacion.controls.codigo.setValue(ubicacion.nombre);
      await this.endAutocomplete();

    } else {
      this.limpiarListas(1);
      this.limpiarCampos();
      // this.formUbicacion.controls.codigo.setValue('');
      this.formUbicacion.controls.codigo.setValue(null);
      this.formUbicacion.controls.idUbicacion.setValue('');
      return Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'El código no es una ubicación válida, por favor revisarlo',
      });
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.articulosSeleccionados.selected.length;
    if (numSelected > 0) {
      const numRows = this.dataSource.data.length;
      return numSelected === numRows;
    }

  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.articulosSeleccionados.clear() :
      this.dataSource.data.forEach(row => this.articulosSeleccionados.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.articulosSeleccionados.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  marcarTodos() {
    this.masterToggle()
  }


  // Funcionalidad de los botones laterales
  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;

  }

  /*
    Función para darle funcionalida a la lista de botones
    Recibe 1 parametro( index: es el número por orden que se genera en el html y 
      luego enviamos el metodo de cada opción respectivamente )
  */

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.ingresoArticulos();
        break;
      case 1:
        this.salidaArticulo();
        break;
      case 2:
        this.trasladoArticulo();
        break;
      case 3:
        this.busquedaArticulos();
        break;
      case 4:
        this.generarReporteExcel();
        break;
      case 5:
        this.generarReporteDiferenciaUbicacion();
        break;
      case 6:
        this.generarReporteDiferenciaKardex();
        break;
      default:
        break;
    }
  }

  obtenerIdDireccion(): number {
    const idAlmacenBase = this.formUbicacion.get('idDireccion').value;
    const idDireccion = this.listaAlmacenBase.filter(item => item.nIdAlmacenBase === idAlmacenBase)[0].nIdDireccion;
    return idDireccion;
  }


}

