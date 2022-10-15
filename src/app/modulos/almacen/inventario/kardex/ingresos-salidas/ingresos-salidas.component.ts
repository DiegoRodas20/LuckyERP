import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatAutocomplete, MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { MatRadioChange } from "@angular/material/radio";
import { NgxSpinnerService } from "ngx-spinner";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import * as moment from "moment";
import Swal from "sweetalert2";
import { InventarioService } from "../../inventario.service";
import { MatExpansionPanel } from "@angular/material/expansion";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";

@Component({
  selector: 'app-ingresos-salidas',
  templateUrl: './ingresos-salidas.component.html',
  styleUrls: ['./ingresos-salidas.component.css']
})
export class IngresosSalidasComponent implements OnInit {

  // Formulario
  formIngresosSalidas: FormGroup;
  filtroFecha = true;
  selectedRadio = 1;
  disabledDestino = true;
  @Input() destinoFTraslado = false;

  @Input()
  formContainer
  @Output() formIngresosSalidasContainer = new EventEmitter();

  // Declaracion de variables (Combobox)
  clientes = [];
  presupuestos = [];
  articulos = [];
  meses = [];
  anhos = [];

  // Variables del chip (Almacenes)
  elementsAlmacen = [];
  chipElements = [];
  almacen = null;
  operadoresLogicos = [];
  almacenEliminar = null;
  resetearFiltros = false;
  filteredAlmacen: Observable<any[]>;
  @ViewChild("almacenesInput") almacenesInput: ElementRef<HTMLInputElement>;
  @ViewChild("auto") matAutocomplete: MatAutocomplete;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  // Variables del chip (OperLog)
  elementsOperLog = [];
  chipElementsOper = [];
  operLogChips = null;
  operLogEliminar = null;
  resetearFiltrosOper = false;
  filteredOperLog: Observable<any[]>;
  @ViewChild("OperLogInput") OperLogInput: ElementRef<HTMLInputElement>;
  @ViewChild("autoOper") matAutocompleteOper: MatAutocomplete;
  separatorKeysCodesOper: number[] = [ENTER, COMMA];

  // Tabla
  displayedColumnsIngresos: string[] = [
    "sCodAlmacen",
    "dFechaCreadDoc",
    "dFechaTraslado",
    "sGuia",
    "sUsuarioMovo",
    "dFechaMovo",
    "sCliente",
    "sCodCentroCosto",
    "sCodArticulo",
    "sDescripcion",
    "sCodUndMedida",
    "sLote",
    "dFechaVence",
    "nCantidad",
    "sSolicitante"
  ];

  displayedColumnsSalidas: string[] = [
    "sCodAlmacen",
    "dFechaCreadDoc",
    "dFechaTraslado",
    "sGuia",
    "nNumeroOper",
    "sUsuarioMovo",
    "dFechaMovo",
    "sCliente",
    "sCodCentroCosto",
    "sCodArticulo",
    "sArticulo",
    "sCodUndMedida",
    "sLote",
    "dFechaVence",
    "nCantidad",
    "sSolicitante",
    "sDestinatario",
    "sEntidadDestinatario",
    "sSucursal"
  ];

  dataSourceIngresos: MatTableDataSource<any>;
  dataSourceSalidas: MatTableDataSource<any>;
  listaIngresos: [] = [];
  listaSalidas: [] = [];
  @ViewChild("paginatorIngresos") paginatorIngresos: MatPaginator; // Paginador de la tabla ingresos
  @ViewChild("paginatorSalidas") paginatorSalidas: MatPaginator; // Paginador de la tabla salidas
  @ViewChild("matSortSalidas") sortSalidas: MatSort; // Orden de las columnas de la tabla ingresos
  @ViewChild("matSortIngresos") sortIngresos: MatSort; // Orden de las columnas de la tabla salidas
  txtFiltroIngresos = new FormControl(); // Filtro de busqueda de la tabla
  txtFiltroSalidas = new FormControl(); // Filtro de busqueda de la tabla

  // Expansion Panels
  @ViewChild("ingresosSalidasTablePanel") ingresosSalidasTablePanel: MatExpansionPanel;
  @ViewChild("ingresosSalidasFiltersPanel") ingresosSalidasFiltersPanel: MatExpansionPanel;

  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService,
    private spinner: NgxSpinnerService
  ) {
    // Configuracion de formulario
    this.crearFormulario();
    this.dataSourceIngresos = new MatTableDataSource(this.listaIngresos);
    this.dataSourceSalidas = new MatTableDataSource(this.listaSalidas);
  }

  async ngOnInit(): Promise<void> {
    await this.llenarChipAlmacenes();
    await this.llenarChipOperLog(this.selectedRadio);
    await this.llenarComboboxCliente();
    await this.llenarComboboxPresupuesto();
    await this.llenarComboboxArticulos();
    await this.llenarComboboxMeses();
    await this.llenarComboboxAnhos();

    await this.actualizarFiltroFechas();

    // Enviar valores del formulario saldos a kardex
    this.formIngresosSalidas.valueChanges.subscribe(
      result => {
        const {cliente, presupuesto, articulo, lote} = this.formIngresosSalidas.value;
        this.formIngresosSalidasContainer.emit({cliente, presupuesto, articulo, lote, almacen: this.almacen, almacenEliminar: this.almacenEliminar, resetearFiltros: this.resetearFiltros});
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
    this.formIngresosSalidas.controls.destino.disable();
    this.formIngresosSalidas.controls.txtFechaTraslado.disable();
  }

  ngOnChanges(changes: SimpleChanges){
    const values = changes.formContainer.currentValue;
    if(values){
      this.formIngresosSalidas.patchValue({
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
    this.formIngresosSalidas = this.fb.group(
      {
        cliente: null,
        presupuesto: null,
        articulo: null,
        operLog: null,
        tipoReporte: null,
        destino: 1,
        lote: [
          "",
          Validators.compose([
            Validators.minLength(8),
            Validators.maxLength(8),
          ]),
        ],
        txtFechaTraslado: [''],
        almacenes: "",
        operLogs: "",
        fechasController: true, // Radio button para el filtrado por fechas
        rangoFechasFechaInicio: [
          null,
          Validators.compose([Validators.required]),
        ],
        // Filtrado por fechas - Inicio
        rangoFechasFechaFin: [null, Validators.compose([Validators.required])], // Filtrado por fechas - Fin
        rangoMesMesInicio: null,
        rangoMesAnhoInicio: null,
        rangoMesMesFin: null,
        rangoMesAnhoFin: null,
        hayLoteYFechaDeVencimiento: false,
      }
    );
  }

  mostrarFiltroFechas() {
    this.filtroFecha = this.formIngresosSalidas.get("fechasController").value;
  }

  filterAlmacenPipe() {
    this.filteredAlmacen = this.formIngresosSalidas.get("almacenes").valueChanges.pipe(
      startWith(""),
      map((value) => (typeof value === "string" ? value : value?.sDescripcion)),
      map((presupuesto) =>
        presupuesto ? this._filter(presupuesto) : this.elementsAlmacen.slice()
      )
    );
  }

  filterOperLogPipe() {
    this.filteredOperLog = this.formIngresosSalidas.get("operLogs").valueChanges.pipe(
      startWith(""),
      map((value) => (typeof value === "string" ? value : value?.sDescripcion)),
      map((presupuesto) =>
      presupuesto ? this._filterOperLog(presupuesto) : this.elementsOperLog.slice()
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
    this.formIngresosSalidas.patchValue({ almacenes: "" });
  }

  fnAgregarOperLog(event): void {
    const input = event.input;
    const value = event.value;
    // Agregamos si es que tiene un Id
    if (value.nId) {
      // Validamos que el presupuesto no se haya agregado
      if (this.chipElementsOper.findIndex((item) => item.nId == value.nId) == -1) {
        this.chipElementsOper.push(value);
      }
    }

    // Reseteamos el input
    if (input) {
      input.value = "";
    }
    this.formIngresosSalidas.patchValue({ operLogs: "" });
  }

  fnDisplayAlmacen(almacen): string {
    return almacen && almacen.sDescripcion ? almacen.sDescripcion : "";
  }

  fnDisplayOper(operLog): string {
    return operLog && operLog.sDescripcion ? operLog.sDescripcion : "";
  }

  fnEliminarAlmacen(chipElement): void {
    this.chipElements = this.chipElements.filter(
      (item) => item.nId != chipElement.nId
    );
    if(!this.almacenEliminar){
      this.almacenEliminar = chipElement;
    }
  }

  fnEliminarOperLog(chipElement): void {
    this.chipElementsOper = this.chipElementsOper.filter(
      (item) => item.nId != chipElement.nId
    );
    if(!this.operLogEliminar){
      this.operLogEliminar = chipElement;
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
    this.formIngresosSalidas.patchValue({ almacenes: "" });
  }

  fnSeleccionarOperLog(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value;
    if (value.nId) {
      //Validamos que el presupuesto no se haya agregado
      if (this.chipElementsOper.findIndex((item) => item.nId == value.nId) == -1) {
        this.chipElementsOper.push(value);
        this.operLogChips = value;
      }
    }
    this.OperLogInput.nativeElement.value = "";
    this.formIngresosSalidas.patchValue({ operLogs: "" });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.elementsAlmacen.filter((presupuesto) =>
      presupuesto.sDescripcion.toLowerCase().includes(filterValue)
    );
  }

  private _filterOperLog(value: string): string[] {
    const filterValue = value.toLowerCase();
    console.log(filterValue);

    return this.elementsOperLog.filter((presupuesto) =>
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

  async llenarChipOperLog(opcion: number) {
    let tipo = 5;

    let pais = localStorage.getItem("Pais");
    let currentUserBase64 = localStorage.getItem("currentUser");
    let idUsuario = JSON.parse(window.atob(currentUserBase64.split(".")[1]))
      .uid;
    let tipoReporte = opcion.toString();
    let parametro = `${idUsuario}|${pais}|${tipoReporte}`;
    this.elementsOperLog = await this.inventarioService.llenarComboboxKardex(
      tipo,
      parametro
    );
    this.filterOperLogPipe();
  }

  actualizarFiltroFechas() {
    // Extraemos los datos del dia de hoy
    let hoy = new Date();
    let diaActual = hoy.getDate();
    let mesActual = hoy.getMonth();
    let mesArreglo = this.meses[mesActual].nId;
    let anhoActual = hoy.getFullYear();
    /* console.log([hoy,diaActual,mesActual]); */


    // Declaramos los combobox y datepickers en base a el dia actual
    this.formIngresosSalidas.patchValue({
      rangoFechasFechaInicio: new Date(anhoActual, mesActual, diaActual),
      rangoFechasFechaFin: new Date(anhoActual, mesActual, diaActual),
      rangoMesMesInicio: mesArreglo,
      rangoMesAnhoInicio: anhoActual,
      rangoMesMesFin: mesArreglo,
      rangoMesAnhoFin: anhoActual,
    });
  }

  reiniciarFiltros(){
    this.almacen = null;
    this.almacenEliminar = null;
    this.chipElements = [];

    this.formIngresosSalidas.patchValue({
      cliente: null,
        presupuesto: null,
        articulo: null,
        lote: null,
        almacenes: "",
        operLog: null,
        hayLoteYFechaDeVencimiento: false,
        fechasController: true,
    });
    this.actualizarFiltroFechas();
    this.resetearFiltros = true;
  }
  //#endregion

  //#region Llenado de Lista

  /* async llenarParametros() {
    // Parametros
    let empresa = localStorage.getItem("Empresa");

    // Recuperar valores del formulario
    const {
      cliente,
      presupuesto,
      articulo,
      lote,
      operLog,
      hayLoteYFechaDeVencimiento
    } = this.formIngresosSalidas.value;

    // Separar los almacenes en comas para el parametro
    let almacenes = this.chipElements.map((almacen) => almacen.nId);
    let almacenesParametro = almacenes.join(",");

    // Parametro de filtros
    let parametro = `${empresa}|${cliente || 0}|${presupuesto || 0}|${almacenesParametro || ""}|${articulo || 0}|${lote || ""}|${hayLoteYFechaDeVencimiento ? 1 : 0}`;
    parametro += `|${operLog || 0}`;
    console.log(parametro);
    return parametro;
  } */

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

    if(this.listaSalidas.length > 0 || this.listaIngresos.length > 0){
      this.ingresosSalidasTablePanel.open();
    }
    else{
      this.ingresosSalidasFiltersPanel.open();
    }
  }

  async llenarParametros() {
    // Parametros
    let empresa = localStorage.getItem("Empresa");
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario
    let idUser = JSON.parse(window.atob(user.split('.')[1])).uid;

    // Recuperar valores del formulario
    const {
      cliente,
      presupuesto,
      articulo,
      destino,
      fechasController,
      rangoFechasFechaInicio,
      rangoFechasFechaFin,
      rangoMesMesInicio,
      rangoMesAnhoInicio,
      rangoMesMesFin,
      rangoMesAnhoFin,
      txtFechaTraslado,
      operLog
    } = this.formIngresosSalidas.value;

    // Separar los almacenes en comas para el parametro
    let almacenes = this.chipElements.map((almacen) => almacen.nId);
    let almacenesParametro = almacenes.join(",");

    // Separar las operaciones en comas para el parametro
    let operadores = this.chipElementsOper.map((operador) => operador.nId);
    let operadorParametro = operadores.join(",");

    // Parametro de filtros
    let parametro = "";
    parametro = `${empresa}|${cliente || 0}|${presupuesto || 0}|${
      almacenesParametro || ""
    }|${fechasController ? 1 : 2}`;

    // Agregar filtro de fechas
    if (fechasController) {
      // Obtener meses de los combobox
      const mesInicio = this.meses
        .map((mes) => mes.nId)
        .indexOf(rangoMesMesInicio);
      const mesFin = this.meses.map((mes) => mes.nId).indexOf(rangoMesMesFin);

      // Formatear dia de los combobox por meses
      const fechaInicio = moment(
        new Date(rangoMesAnhoInicio, mesInicio, 1)
      ).format("YYYY-MM-DD");
      const fechaFin = moment(new Date(rangoMesAnhoFin, mesFin, 1)).format(
        "YYYY-MM-DD"
      );

      parametro += `|${fechaInicio}|${fechaFin}`;
    } else {
      parametro += `|${moment(rangoFechasFechaInicio).format("YYYY-MM-DD")}|${moment(rangoFechasFechaFin).format("YYYY-MM-DD")}`;
    }

    parametro += `|${operadorParametro || ""}`;
    if (this.selectedRadio == 1) {
      parametro += `|`;
    }else{
      parametro += `|${destino || ""}`;
    }

    parametro += `|${txtFechaTraslado == null || txtFechaTraslado == '' ? '' : moment(txtFechaTraslado).format("YYYY-MM-DD")}`;//FechaTraslado
    parametro += `|${this.selectedRadio}`;
    parametro += `|${idUser}`;

    //console.log(parametro)
    return parametro;
  }

  // Llenar la Mat-Table
  async fnLlenarTabla() {
    this.spinner.show();
    const tipo = 1;
    const parametro = await this.llenarParametros();

    const tipoReporte = this.formIngresosSalidas.get("tipoReporte").value;

    if(tipoReporte == 1){
      this.listaIngresos = await this.inventarioService.listarIngresosSalidas(
        tipo,
        parametro
      );
      this.listaSalidas = [];

      if(this.listaIngresos.length == 0){

        Swal.fire({
          title: 'No se encontró registros',
          text: 'No se encontró registros en base a los filtros seleccionados',
          icon: 'warning',
          showCloseButton: true
        })
      }

      this.dataSourceIngresos.data = this.listaIngresos;
      this.dataSourceIngresos.paginator = this.paginatorIngresos;
      this.dataSourceIngresos.sort = this.sortIngresos;
    }
    else if(tipoReporte == 2){
      this.listaSalidas = await this.inventarioService.listarIngresosSalidas(
        tipo,
        parametro
      );
      this.listaIngresos = [];

      console.log(this.listaSalidas);
      console.log(this.listaSalidas.length);

      if(this.listaSalidas.length == 0){

        Swal.fire({
          title: 'No se encontró registros',
          text: 'No se encontró registros en base a los filtros seleccionados',
          icon: 'warning',
          showCloseButton: true
        })
      }

      this.dataSourceSalidas.data = this.listaSalidas;
      this.dataSourceSalidas.paginator = this.paginatorSalidas;
      this.dataSourceSalidas.sort = this.sortSalidas;
    }

    if(this.listaSalidas.length > 0 || this.listaIngresos.length > 0){
      this.ingresosSalidasTablePanel.open();
    }
    else{
      this.ingresosSalidasFiltersPanel.open();
    }

    this.spinner.hide();
  }

  async verificarCantidadElementosIngresosSalidas() {
    const tipo = 1;
    const parametro = await this.llenarParametros();

    const elementos = await this.inventarioService.listarIngresosSalidas(
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
      if(!this.formIngresosSalidas.valid){
        Swal.fire({
          title: 'Hay errores en el formulario',
          icon: 'warning',
          showCloseButton: true
        })
      }
      else{
        if (await this.verificarCantidadElementosIngresosSalidas()) {
          const tipo = 2;
          const parametro = await this.llenarParametros();

          let empresa = localStorage.getItem("Empresa");
          let listaEmpresa = localStorage.getItem("ListaEmpresa");
          let nEmpresa = JSON.parse(listaEmpresa).find(
            (emp) => emp.nIdEmp == empresa
          );

          // Respuesta con el blob del Excel
          const response = await this.inventarioService.descargarExcelIS(
            tipo,
            parametro,
            nEmpresa.sDespEmp
          );

          // Descargar el Excel
          const data = response;
          // En el nombre verificamos si es un ingreso o una salida
          const fileName = this.formIngresosSalidas.get("tipoReporte").value == 1 ? `Reporte Ingreso.xlsx` : `Reporte Salidas.xlsx`;
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
      this.listaIngresos = [];
      this.listaSalidas = [];
      this.spinner.hide();
      this.ingresosSalidasFiltersPanel.open();
    }
  }

  // Filtrado de la tabla
  fnFiltrarIngresos(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceIngresos.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceIngresos.paginator) {
      this.dataSourceIngresos.paginator.firstPage();
    }
  }

  // Filtrado de la tabla
  fnFiltrarSalidas(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceSalidas.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceSalidas.paginator) {
      this.dataSourceSalidas.paginator.firstPage();
    }
  }

  //#endregion

  async llenarComboboxOperadoresLogicos(opcion: number) {
    let tipo = 5;
    let parametro = opcion.toString();
    this.operadoresLogicos = await this.inventarioService.llenarComboboxKardex(
      tipo,
      parametro
    );
  }

  radioChange($event: MatRadioChange) {
    this.chipElementsOper = [];
    this.selectedRadio = $event.value;
    if (this.selectedRadio == 2) {
      this.destinoFTraslado = true;
      this.formIngresosSalidas.controls.destino.enable();
      this.formIngresosSalidas.controls.txtFechaTraslado.enable();
      this.formIngresosSalidas.controls.txtFechaTraslado.setValue('');

    }else{
      this.destinoFTraslado = false;
      this.formIngresosSalidas.controls.destino.disable();
      this.formIngresosSalidas.controls.txtFechaTraslado.disable();
      this.formIngresosSalidas.controls.txtFechaTraslado.setValue('');
    }

    this.llenarChipOperLog(this.selectedRadio);
}

  async llenarComboboxMeses() {
    let tipo = 10;
    let parametro = "";
    this.meses = await this.inventarioService.llenarComboboxKardex(
      tipo,
      parametro
    );
  }

  async llenarComboboxAnhos() {
    let hoy = new Date();
    for (let i = hoy.getFullYear() - 21; i <= hoy.getFullYear(); i++) {
      this.anhos.push({ nId: i, sDescripcion: i });
    }
  }

}
