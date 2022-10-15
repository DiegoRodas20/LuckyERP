import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatAutocomplete, MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { MatExpansionPanel } from "@angular/material/expansion";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { NgxSpinnerService } from "ngx-spinner";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import Swal from "sweetalert2";
import { InventarioService } from "../../inventario.service";

@Component({
  selector: "app-saldos",
  templateUrl: "./saldos.component.html",
  styleUrls: ["./saldos.component.css"],
})
export class SaldosComponent implements OnInit {

  // Variables de sesion (LocalStorage)
  idEmpresa;
  idUsuario;
  idPais;

  // Formulario
  formSaldos: FormGroup;

  @Input()
  formContainer
  @Output() formSaldosContainer = new EventEmitter();

  // Declaracion de variables (Combobox)
  clientes = [];
  presupuestos = [];
  articulos = [];

  // Variables del chip (Almacenes)
  elementsAlmacen = [];
  chipElements = [];
  almacen = null;
  almacenEliminar = null;
  resetearFiltros = false;
  filteredAlmacen: Observable<any[]>;
  @ViewChild("almacenesInput") almacenesInput: ElementRef<HTMLInputElement>;
  @ViewChild("auto") matAutocomplete: MatAutocomplete;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  // Tabla
  displayedColumns: string[] = [
    "sEmpresa",
    "sCliente",
    "sCodAlmacen",
    "sEjecutivo",
    "sCentroCosto",
    "sCodArticulo",
    "sArticuloDescripcion",
    "sLote",
    "dFechaIngreso",
    "dFechaVence",
    "nSaldo",
    "sRutaArchivo"
  ];
  dataSource: any;
  listaSaldos: [] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator; // Paginador de la tabla
  @ViewChild(MatSort) sort: MatSort; // Orden de las columnas de la tabla
  txtFiltro = new FormControl(); // Filtro de busqueda de la tabla

  // Expansion Panels
  @ViewChild("saldosTablePanel") saldosTablePanel: MatExpansionPanel;
  @ViewChild("saldosFiltersPanel") saldosFiltersPanel: MatExpansionPanel;

  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService,
    private spinner: NgxSpinnerService
  ) {
    // Configuracion de formulario
    this.crearFormulario();
  }

  async ngOnInit(): Promise<void> {

    // Inicializando variables de sesion
    this.idEmpresa = localStorage.getItem("Empresa");
    const currentUserBase64 = localStorage.getItem("currentUser");
    this.idUsuario = JSON.parse(window.atob(currentUserBase64.split(".")[1])).uid;
    this.idPais = localStorage.getItem("Pais");

    await this.llenarChipAlmacenes();
    await this.llenarComboboxCliente();
    await this.llenarComboboxPresupuesto();
    await this.llenarComboboxArticulos();

    // Enviar valores del formulario saldos a kardex
    this.formSaldos.valueChanges.subscribe(
      result => {
        const {cliente, presupuesto, articulo, lote} = this.formSaldos.value;
        this.formSaldosContainer.emit({cliente, presupuesto, articulo, lote, almacen: this.almacen, almacenEliminar: this.almacenEliminar, resetearFiltros: this.resetearFiltros});
        if(this.almacen){
          this.almacen = null;
        }
        if(this.almacenEliminar){
          this.almacenEliminar = null;
        }
        if(this.resetearFiltros){
          this.resetearFiltros = false;
        }
      }
    );

    this.filterAlmacenPipe();
  }

  ngOnChanges(changes: SimpleChanges){
    const values = changes.formContainer.currentValue;
    if(values){
      this.formSaldos.patchValue({
        cliente: values.cliente,
        presupuesto: values.presupuesto,
        articulo: values.articulo,
        lote: values.lote
      });
      if(values.almacen){
        this.chipElements.push(values.almacen);
        console.log(this.chipElements);
      } else if(values.almacenEliminar){
        this.fnEliminarAlmacen(values.almacenEliminar);
      }
      if(values.resetearFiltros){
        setTimeout(() => {
          this.chipElements = [];
        });
      }
    }
  }

  //#region Configuracion del formulario

  // Formulario de filtrado
  crearFormulario() {
    this.formSaldos = this.fb.group(
      {
        cliente: null,
        presupuesto: null,
        articulo: null,
        lote: [
          "",
          Validators.compose([
            Validators.minLength(8),
            Validators.maxLength(8),
          ]),
        ],
        almacenes: "",
        hayLoteYFechaDeVencimiento: false,
        isImagen: false
      }
    );
  }

  filterAlmacenPipe() {
    this.filteredAlmacen = this.formSaldos.get("almacenes").valueChanges.pipe(
      startWith(""),
      map((value) => (typeof value === "string" ? value : value?.sDescripcion)),
      map((presupuesto) =>
        presupuesto ? this._filter(presupuesto) : this.elementsAlmacen.slice()
      )
    );
  }

  fnAgregarAlmacen(event): void {
    const input = event.input;
    const value = event.value;

    // Agregamos si es que tiene un Id
    if (value.nId) {
      // Validamos que el presupuesto no se haya agregado
      if (this.chipElements.findIndex((item) => item.nId == value.nId) == -1) {
        this.chipElements.push(value);
      }
    }

    // Reseteamos el input
    if (input) {
      input.value = "";
    }
    this.formSaldos.patchValue({ almacenes: "" });
  }

  fnDisplayAlmacen(almacen): string {
    return almacen && almacen.sDescripcion ? almacen.sDescripcion : "";
  }

  fnEliminarAlmacen(chipElement): void {
    this.chipElements = this.chipElements.filter(
      (item) => item.nId != chipElement.nId
    );
    if(!this.almacenEliminar){
      this.almacenEliminar = chipElement;
    }
  }

  fnSeleccionarAlmacen(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value;
    if (value.nId) {
      //Validamos que el presupuesto no se haya agregado
      if (this.chipElements.findIndex((item) => item.nId == value.nId) == -1) {
        this.chipElements.push(value);
        this.almacen = value;
      }
    }
    this.almacenesInput.nativeElement.value = "";
    this.formSaldos.patchValue({ almacenes: "" });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.elementsAlmacen.filter((presupuesto) =>
      presupuesto.sDescripcion.toLowerCase().includes(filterValue)
    );
  }
  //#endregion

  //#region Filtros de la tabla
  async llenarComboboxCliente() {
    let pais = localStorage.getItem("Pais");
    let tipo = 1;
    this.clientes = await this.inventarioService.llenarComboboxKardex(
      tipo,
      pais
    );
  }

  async llenarComboboxPresupuesto() {
    let empresa = localStorage.getItem("Empresa");
    let tipo = 2;
    this.presupuestos = await this.inventarioService.llenarComboboxKardex(
      tipo,
      empresa
    );
  }

  async llenarComboboxArticulos() {
    let pais = localStorage.getItem("Pais");
    let tipo = 3;
    this.articulos = await this.inventarioService.llenarComboboxKardex(
      tipo,
      pais
    );
  }

  async llenarChipAlmacenes() {
    let tipo = 4;

    let pais = localStorage.getItem("Pais");
    let currentUserBase64 = localStorage.getItem("currentUser");
    let idUsuario = JSON.parse(window.atob(currentUserBase64.split(".")[1]))
      .uid;
    let parametro = `${idUsuario}|${pais}`;

    this.elementsAlmacen = await this.inventarioService.llenarComboboxKardex(
      tipo,
      parametro
    );
  }

  reiniciarFiltros(){
    this.almacen = null;
    this.almacenEliminar = null;
    this.chipElements = [];
    this.formSaldos.patchValue({
      cliente: null,
        presupuesto: null,
        articulo: null,
        lote: null,
        almacenes: "",
        hayLoteYFechaDeVencimiento: false,
        isImagen: false
    });
    this.resetearFiltros = true;
  }
  //#endregion

  //#region Llenado de Lista

  // Seleccionar que tipo de listado desea realizar el usuario
  async fnOpcionListar(){
    const result = await Swal.fire({
      title: '¿Cómo desea listar?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: `Generar Excel`,
      denyButtonText: `Listar`,
      cancelButtonText: `Cancelar`,
      icon: 'question',
      showCloseButton: true,
    })

    if (result.isConfirmed) {
      await this.descargarExcel();
    } else if (result.isDenied) {
      await this.fnLlenarTabla();
    }

    if(this.listaSaldos.length > 0){
      this.saldosTablePanel.open();
    }
    else{
      this.saldosFiltersPanel.open();
    }
  }

  // Llenar los parametros del listado (Para Excel)
  async llenarParametros() {
    // Parametros
    let empresa = localStorage.getItem("Empresa");

    // Recuperar valores del formulario
    const {
      cliente,
      presupuesto,
      articulo,
      lote,
      hayLoteYFechaDeVencimiento,
      isImagen
    } = this.formSaldos.value;

    // Separar los almacenes en comas para el parametro
    let almacenes = this.chipElements.map((almacen) => almacen.nId);
    let almacenesParametro = almacenes.join(",");

    // Parametro de filtros
    let parametro = `${empresa}|${cliente || 0}|${presupuesto || 0}|${almacenesParametro || ""}|${articulo || 0}|${lote || ""}|${hayLoteYFechaDeVencimiento ? 1 : 0}|${isImagen ? 1 : 0}|${this.idUsuario}`;

    return parametro;
  }

  // Llenar la Mat-Table
  async fnLlenarTabla() {
    this.spinner.show();
    const tipo = 1;
    const parametro = await this.llenarParametros();

    this.listaSaldos = await this.inventarioService.listarSaldo(
      tipo,
      parametro
    );

    if(this.listaSaldos.length == 0){

      Swal.fire({
        title: 'No se encontró registros',
        text: 'No se encontró registros en base a los filtros seleccionados',
        icon: 'warning',
        showCloseButton: true
      })
    }

    this.dataSource = new MatTableDataSource(this.listaSaldos);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.spinner.hide();

    if(this.listaSaldos.length > 0){
      this.saldosTablePanel.open();
    }
    else{
      this.saldosFiltersPanel.open();
    }
  }

  async verificarCantidadElementosSaldos() {
    const tipo = 1;
    const parametro = await this.llenarParametros();

    const elementos = await this.inventarioService.listarSaldo(
      tipo,
      parametro
    );

    if (elementos.length == 0) {
      return false;
    }
    return true;
  }

  async descargarExcel() {
    const result = await Swal.fire({
      title: '¿Desea generar el Excel?',
      showCancelButton: true,
      confirmButtonText: `Generar`,
      cancelButtonText: `Cancelar`,
      cancelButtonColor: '#d33',
      icon: 'question',
      showCloseButton: true,
    })

    if (result.isConfirmed) {
      this.spinner.show();
      if(!this.formSaldos.valid){
        Swal.fire({
          title: 'Hay errores en el formulario',
          icon: 'warning',
          showCloseButton: true
        })
      }
      else{
        if (await this.verificarCantidadElementosSaldos()) {
          const tipo = 2;
          const parametro = await this.llenarParametros();

          let empresa = localStorage.getItem("Empresa");
          let listaEmpresa = localStorage.getItem("ListaEmpresa");
          let nEmpresa = JSON.parse(listaEmpresa).find(
            (emp) => emp.nIdEmp == empresa
          );

          // Respuesta con el blob del Excel
          const response = await this.inventarioService.descargarExcelSaldo(
            tipo,
            parametro,
            nEmpresa.sDespEmp
          );

          // Descargar el Excel
          const data = response;
          const fileName = `Reporte Saldos.xlsx`;
          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(data, fileName);
            return;
          }
          const objectUrl = window.URL.createObjectURL(data);
          var link = document.createElement('a');
          link.href = objectUrl;
          link.download = fileName;
          // Trigger de descarga
          link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

          Swal.fire({
            title: 'El Excel ha sido generado',
            html: `Si su descarga no ha comenzado, puede descargarlo <a href='${objectUrl}' download="${fileName}">aquí</a>`,
            icon: 'success',
            showCloseButton: true
          })
        } else {
          Swal.fire({
            title: 'No se encontró registros. Aplique otros filtros',
            icon: 'warning',
            showCloseButton: true
          })
        }
      }
      this.listaSaldos = [];
      this.spinner.hide();
      this.saldosFiltersPanel.open();
    }
  }

  // Filtrado de la tabla
  fnFiltrar(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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

  //#endregion
}
