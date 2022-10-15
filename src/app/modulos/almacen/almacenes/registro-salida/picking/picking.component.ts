import { SelectionModel } from '@angular/cdk/collections';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, timer } from 'rxjs';
import { map, startWith, take } from 'rxjs/operators';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { Listas_RS } from '../models/listasSalida.model';
import { Picking_RS, Reporte_Picking } from '../models/picking.model';
import { RegistroSalidaService } from '../registro-salida.service';

@Component({
  selector: 'app-picking',
  templateUrl: './picking.component.html',
  styleUrls: ['./picking.component.css'],
  animations: [asistenciapAnimations]
})
export class PickingComponent implements OnInit {

  tsLista = 'active';  // Inicia la lista abierta
  abLista = 0;

  lAlmacen: Listas_RS[] = [];
  registrosSeleccionados = new SelectionModel<Picking_RS>(true, []);
  @ViewChild('buttonReporte') buttonReporte: ElementRef;

  //Variables para mandar al componente para imprimir
  lArticuloPicking: Reporte_Picking[] = [];
  sGuias: string;
  bMostrarReporteComponent = false;

  //Variables para presupuesto chips con autocomplete
  filteredPresupuesto: Observable<Listas_RS[]>;
  lPresupuesto: Listas_RS[] = [];
  chipsPresupuesto: Listas_RS[] = []; //Esta lista almacena todos los items seleccionados
  @ViewChild('presupuestoInput') presupuestoInput: ElementRef<HTMLInputElement>;
  @ViewChild('autoPresupuesto') autoPresupuesto: MatAutocomplete;


  //Variables para articulos chips con autocomplete
  filteredArticulo: Observable<Listas_RS[]>;
  lArticulo: Listas_RS[] = [];
  chipsArticulo: Listas_RS[] = []; //Esta lista almacena todos los items seleccionados
  @ViewChild('articuloInput') articuloInput: ElementRef<HTMLInputElement>;


  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Picking_RS>;
  displayedColumns = ['seleccion', 'sGuia', 'sCentroCosto', 'sAlmacen', 'sNota', 'sDestino', 'sEstado'];
  lRegistro: Picking_RS[] = [];


  @Output() pMostrar = new EventEmitter<number>();
  formPicking: FormGroup;

  separatorKeysCodes: number[] = [ENTER, COMMA];


  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual
  lEmpresas;
  vEmpresaActual;

  sFechaPicking: string = '';

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vRegSalida: RegistroSalidaService,
    private cdr: ChangeDetectorRef,
    @Inject('BASE_URL') baseUrl: string,
  ) { this.url = baseUrl; }

  async ngOnInit(): Promise<void> {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');
    this.lEmpresas = JSON.parse(localStorage.getItem('ListaEmpresa'));

    this.vEmpresaActual = this.lEmpresas.find(item => item.nIdEmp == this.idEmp)

    this.lRegistro = []
    this.registrosSeleccionados.clear();
    this.dataSource = new MatTableDataSource(this.lRegistro);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.formPicking = this.formBuilder.group({
      cboAlmacen: ['', Validators.required],
      cboFecha: [moment(), Validators.required],
      cboPresupuesto: [''],
      cboArticulo: [''],
      stGuiasAnuladas: [false],
      rbOrden: [0]
    })

    this.onToggleFab(1, -1)

    await this.fnListarAlmacen();
    await this.fnListarPresupuesto(moment());
    await this.fnListarArticulo(moment());

    this.filteredPresupuesto = this.formPicking.controls.cboPresupuesto.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.sDescripcion),
      map((presupuesto) => presupuesto ? this._filterPresupuesto(presupuesto) : this.lPresupuesto.slice()));

    this.filteredArticulo = this.formPicking.controls.cboArticulo.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.sDescripcion),
      map((articulo) => articulo ? this._filterArticulo(articulo) : this.lArticulo.slice()));
  }

  //#region Listados para los combos
  async fnListarAlmacen() {

    this.spinner.show();

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;

    pParametro.push(this.idUser);

    try {
      this.lAlmacen = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.formPicking.controls.cboPresupuesto.setValue(null);
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarPresupuesto(fecha: moment.Moment) {
    this.chipsPresupuesto = [];
    this.spinner.show();

    this.sFechaPicking = fecha.format('DD/MM/YYYY');

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;

    pParametro.push(this.idEmp);
    pParametro.push(fecha.format('DD/MM/YYYY'));
    try {
      this.lPresupuesto = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.formPicking.controls.cboPresupuesto.setValue('a');
      this.formPicking.controls.cboPresupuesto.setValue('');

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarArticulo(fecha: moment.Moment) {
    this.chipsArticulo = [];

    this.spinner.show();

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;

    pParametro.push(this.pPais);
    pParametro.push(fecha.format('DD/MM/YYYY'));
    try {
      this.lArticulo = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.formPicking.controls.cboArticulo.setValue('a');
      this.formPicking.controls.cboArticulo.setValue('');

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnBuscarRegistros() {

    if (this.formPicking.invalid) {
      this.formPicking.markAllAsTouched();
      Swal.fire('¡Verificar!', 'La fecha y almacén son obligatorios para poder buscar', 'warning');
      return;
    }

    this.spinner.show();

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 4;
    var sPresupuesto = '';
    var pPresupuesto = [];
    var sArticulo = '';
    var pArticulo = [];

    this.chipsPresupuesto.forEach(item => {
      pPresupuesto.push(item.nId);
    })
    sPresupuesto = pPresupuesto.join('?');

    this.chipsArticulo.forEach(item => {
      pArticulo.push(item.nId);
    })
    sArticulo = pArticulo.join('?');

    var vDatos = this.formPicking.value;
    pParametro.push(vDatos.cboFecha.format('DD/MM/YYYY'));
    pParametro.push(vDatos.cboAlmacen);
    pParametro.push(this.idEmp);
    pParametro.push(sPresupuesto);
    pParametro.push(sArticulo);
    pParametro.push(vDatos.stGuiasAnuladas == true ? 2232 : 2231);

    try {
      this.lRegistro = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.registrosSeleccionados.clear();
      this.dataSource = new MatTableDataSource(this.lRegistro);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }
  //#endregion

  //#region Chips Presupuesto
  fnEliminarPresupuesto(presupuesto: Listas_RS) {
    this.chipsPresupuesto = this.chipsPresupuesto.filter(item => item.nId != presupuesto.nId)
  }

  fnAgregarPresupuesto(event) {
    const input = event.input;
    const value = event.value;

    //Agregamos si es que tiene un Id
    if (value.nId) {
      //Validamos que el presupuesto no se haya agregado
      if (this.chipsPresupuesto.findIndex(item => item.nId == value.nId) == -1) {
        this.chipsPresupuesto.push(value);
      }
    }

    //Reseteamos el input
    if (input) {
      input.value = '';
    }

    this.formPicking.controls.cboPresupuesto.setValue('');
  }

  fnSeleccionarPresupuesto(event) {
    const value = event.option.value;
    if (value.nId) {
      //Validamos que el presupuesto no se haya agregado
      if (this.chipsPresupuesto.findIndex(item => item.nId == value.nId) == -1) {
        this.chipsPresupuesto.push(value);
      }
    }
    this.formPicking.controls.cboPresupuesto.setValue('a');
    this.formPicking.controls.cboPresupuesto.setValue('');
    this.presupuestoInput.nativeElement.value = '';
  }

  private _filterPresupuesto(value): Listas_RS[] {
    const filterValue = value.toLowerCase();

    return this.lPresupuesto.filter(presupuesto => presupuesto.sDescripcion.toLowerCase().includes(filterValue));
  }

  fnDisplayPrespuesto(presupuesto: Listas_RS): string {
    return presupuesto && presupuesto.sDescripcion ? presupuesto.sDescripcion : '';
  }
  //#endregion

  //#region Chips Articulos
  fnEliminarArticulo(articulo: Listas_RS) {
    this.chipsArticulo = this.chipsArticulo.filter(item => item.nId != articulo.nId)
  }

  fnAgregarArticulo(event) {
    const input = event.input;
    const value = event.value;

    //Agregamos si es que tiene un Id
    if (value.nId) {
      //Validamos que el articulo no se haya agregado
      if (this.chipsArticulo.findIndex(item => item.nId == value.nId) == -1) {
        this.chipsArticulo.push(value);
      }
    }

    //Reseteamos el input
    if (input) {
      input.value = '';
    }

    this.formPicking.controls.cboArticulo.setValue('');
  }

  fnSeleccionarArticulo(event) {
    const value = event.option.value;
    if (value.nId) {
      //Validamos que el Articulo no se haya agregado
      if (this.chipsArticulo.findIndex(item => item.nId == value.nId) == -1) {
        this.chipsArticulo.push(value);
      }
    }
    this.formPicking.controls.cboArticulo.setValue('a');
    this.formPicking.controls.cboArticulo.setValue('');
    this.articuloInput.nativeElement.value = '';
  }

  private _filterArticulo(value): Listas_RS[] {
    const filterValue = value.toLowerCase();

    return this.lArticulo.filter(articulo => articulo.sDescripcion.toLowerCase().includes(filterValue));
  }

  fnDisplayArticulo(articulo: Listas_RS): string {
    return articulo && articulo.sDescripcion ? articulo.sDescripcion : '';
  }
  //#endregion

  //#region Select Mat Table
  fnMarcarTodos() {
    this.fnEstanTodosSeleccionados() ?
      this.registrosSeleccionados.clear() :
      this.dataSource.data.forEach(row => this.registrosSeleccionados.select(row));
  }

  fnEstanTodosSeleccionados() {
    const numSeleccionados = this.registrosSeleccionados.selected.length;
    if (numSeleccionados > 0) {
      const numFilas = this.dataSource.data.length;
      return numSeleccionados === numFilas;
    }
  }

  checkboxLabel(row?: Picking_RS): string {
    if (!row) {
      return `${this.fnEstanTodosSeleccionados() ? 'select' : 'deselect'} all`;
    }
    return `${this.registrosSeleccionados.isSelected(row) ? 'deselect' : 'select'} row ${row.nId + 1}`;
  }

  //#endregion

  fnLimpiarTabla() {
    this.lRegistro = []
    this.registrosSeleccionados.clear();
    this.dataSource = new MatTableDataSource(this.lRegistro);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async fnImprimir() {

    this.bMostrarReporteComponent = false;

    this.spinner.show();

    const lRegistros = this.registrosSeleccionados.selected;
    var vDatos = this.formPicking.getRawValue();

    var lGuias = [];

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 5;
    var pDetalle = [];
    var sDetalle = '';

    pParametro.push(vDatos.rbOrden);

    lRegistros.forEach(item => {
      pDetalle.push(item.nId);
      lGuias.push(item.sGuia);
    })
    this.sGuias = lGuias.join('/ ')
    sDetalle = pDetalle.join('?');

    try {
      const lArticulo = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, sDetalle, this.url).toPromise();
      this.lArticuloPicking = lArticulo
      this.bMostrarReporteComponent = true;
      this.spinner.hide();
      await timer(500).pipe(take(1)).toPromise(); //timer para renderize el componente
      await this.fnImprimirPicking();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }


  }

  vVerReportePicking = false;
  //Imprimir guia de salida 
  async fnImprimirPicking() {
    this.vVerReportePicking = true;
    // Agregar nombre al documento
    const tempTitle = document.title;
    document.title = 'Reporte Picking';
    // Impresion
    setTimeout(() => {
      window.print();
      this.vVerReportePicking = false;
    })
    document.title = tempTitle;
    return;
  }
  //#endregion

  //Interaccion entre componentes
  fnRegresar() {
    this.pMostrar.emit(0);
  }

  // Funcionalidad de los botones laterales
  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? 0 : 3;

  }

}
