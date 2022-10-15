import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators,} from "@angular/forms";
import { MatAutocomplete, MatAutocompleteSelectedEvent,} from "@angular/material/autocomplete";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { InventarioService } from "../inventario.service";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from "moment";
import Swal from 'sweetalert2';
import { MatTab } from "@angular/material/tabs";
import { MatExpansionPanel } from "@angular/material/expansion";
import { MatSort } from "@angular/material/sort";

@Component({
  selector: "app-kardex",
  templateUrl: "./kardex.component.html",
  styleUrls: ["./kardex.component.css"],
})
export class KardexComponent implements OnInit {

  // Variables de sesion (LocalStorage)
  idEmpresa;
  idUsuario;
  idPais;

  // Formulario
  form: FormGroup;
  filtroFecha = true;

  // Declaracion de variables (Combobox)
  clientes = [];
  presupuestos = [];
  articulos = [];
  operadoresLogicos = [];
  destinos = [];
  direcciones = [];
  meses = [];
  anhos = [];

  // Contenido del formulario
  formContenido;

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

  // Direccion y ubicacion del movimiento
  ubicacion: string;
  direccion: string;

  // Tabla
  displayedColumns: string[] = [
    "sCodOperLog",
    "sUsuarioMovo",
    "dFechaOperMov",
    "sCodAlmacenOrigen",
    "sEjecutivo",
    "sCentroCostoOrigen",
    "sCodAlmacenDestino",
    "sCentroCostoDestino",
    "sEntidadMovimiento",
    "sDireccionMovimiento",
    "sCodArticulo",
    "sArticuloDescripcion",
    "sLote",
    "nPrecioUnidad",
    "dFechaVence",
    "nStockAnterior",
    "nCantidadIngreso",
    "nCantidadSalida",
    "nStockActual",
    "sGuiaReferencia",
  ];
  dataSource: any;
  listaKardex: [] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator; // Paginador de la tabla
  @ViewChild(MatSort) sort: MatSort; // Orden de las columnas de la tabla
  txtFiltro = new FormControl(); // Filtro de busqueda de la tabla

  encapsulation: ViewEncapsulation.None

  // Expansion Panels
  @ViewChild("kardexTablePanel") kardexTablePanel: MatExpansionPanel;
  @ViewChild("kardexFiltersPanel") kardexFiltersPanel: MatExpansionPanel;

  // Cabecera del panel
  @ViewChild('tabs', {static: false}) tabs;

  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService,
    private spinner: NgxSpinnerService,
    private cdRef:ChangeDetectorRef
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

    // Llenado de datos
    this.spinner.show();
    await this.llenarChipAlmacenes();
    await this.llenarChipOperLog();
    await this.llenarComboboxCliente();
    await this.llenarComboboxPresupuesto();
    await this.llenarComboboxArticulos();
    await this.llenarComboboxOperadoresLogicos();
    await this.llenarComboboxDestino();
    await this.llenarComboboxMeses();
    await this.llenarComboboxAnhos();

    await this.actualizarFiltroFechas();

    this.filterAlmacenPipe();
    this.filterOperLogPipe();

    // Enviar valores del formulario kardex a saldos
    this.form.valueChanges.subscribe(
      result => {
        const {cliente, presupuesto, articulo, lote} = this.form.value;
        this.formContenido = {cliente, presupuesto, articulo, lote, almacen: this.almacen, almacenEliminar: this.almacenEliminar, resetearFiltros: this.resetearFiltros};
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

    this.spinner.hide();
  }

  //#region Configuracion de formulario

  // Formulario de filtrado
  crearFormulario() {
    this.form = this.fb.group(
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
        operLogs: "",
        operLog: null,
        traslado: false,
        actualizado: false,
        puntoLlegada: null,
        destino: null,
        ubicacion: null,
        direccion: null,
        fechasController: true, // Radio button para el filtrado por fechas
        rangoFechasFechaInicio: [
          null,
          Validators.compose([Validators.required]),
        ], // Filtrado por fechas - Inicio
        rangoFechasFechaFin: [null, Validators.compose([Validators.required])], // Filtrado por fechas - Fin
        rangoMesMesInicio: null,
        rangoMesAnhoInicio: null,
        rangoMesMesFin: null,
        rangoMesAnhoFin: null,
      },
      {
        validator: [
          this.dateRangeValidator(
            "rangoFechasFechaInicio",
            "rangoFechasFechaFin"
          ),
          this.monthRangeValidator(
            "rangoMesMesInicio",
            "rangoMesAnhoInicio",
            "rangoMesMesFin",
            "rangoMesAnhoFin"
          ),
        ],
      }
    );
  }

  filterAlmacenPipe() {
    this.filteredAlmacen = this.form.get("almacenes").valueChanges.pipe(
      startWith(""),
      map((value) => (typeof value === "string" ? value : value?.sDescripcion)),
      map((presupuesto) =>
        presupuesto ? this._filter(presupuesto) : this.elementsAlmacen.slice()
      )
    );
  }

  filterOperLogPipe() {
    this.filteredOperLog = this.form.get("operLogs").valueChanges.pipe(
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
    this.form.patchValue({ almacenes: "" });
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
    this.form.patchValue({ operLogs: "" });
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
    this.form.patchValue({ almacenes: "" });
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
    this.form.patchValue({ operLogs: "" });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    console.log(filterValue);
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

  async llenarChipOperLog() {
    let tipo = 5;

    let pais = localStorage.getItem("Pais");
    let currentUserBase64 = localStorage.getItem("currentUser");
    let idUsuario = JSON.parse(window.atob(currentUserBase64.split(".")[1]))
      .uid;
    let parametro = `${idUsuario}|${pais}`;

    this.elementsOperLog = await this.inventarioService.llenarComboboxKardex(
      tipo,
      parametro
    );

  }

  async llenarComboboxOperadoresLogicos() {
    let tipo = 5;
    let parametro = "";
    this.operadoresLogicos = await this.inventarioService.llenarComboboxKardex(
      tipo,
      parametro
    );
  }

  async llenarComboboxDestino() {
    let pais = localStorage.getItem("Pais");
    let tipo = 7;
    this.destinos = await this.inventarioService.llenarComboboxKardex(
      tipo,
      pais
    );
  }

  async llenarComboboxDireccion(idEntidad) {
    let tipo = 6;
    if(idEntidad != null){
      let parametro = idEntidad.toString();
      this.direcciones = await this.inventarioService.llenarComboboxKardex(
        tipo,
        parametro
      );
    }
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

  actualizarComboboxDireccion() {
    let idEntidad = this.form.get("destino").value;
    this.llenarComboboxDireccion(idEntidad);

    // Limpiar combobox de punto de llegada e inputs ubicacion y direccion
    this.form.patchValue({
      puntoLlegada: null,
      ubicacion: null,
      direccion: null,
    });
  }

  actualizarInputUbicacionDireccion() {
    let idPuntoLlegada = this.form.get("puntoLlegada").value;
    // Limpiar ubicacion y direccion
    let obj = this.direcciones.find((o) => o.nId === idPuntoLlegada);
    this.form.patchValue({
      ubicacion: obj.sUbicacion,
      direccion: obj.sDireccion,
    });
  }

  mostrarFiltroFechas() {
    this.filtroFecha = this.form.get("fechasController").value;
  }

  actualizarFiltroFechas() {
    // Extraemos los datos del dia de hoy
    let hoy = new Date();
    let diaActual = hoy.getDate();
    let mesActual = hoy.getMonth();
    let mesArreglo = this.meses[mesActual].nId;
    let anhoActual = hoy.getFullYear();

    // Declaramos los combobox y datepickers en base a el dia actual
    this.form.patchValue({
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
    this.chipElementsOper = [];
    this.form.patchValue({
      cliente: null,
      presupuesto: null,
      articulo: null,
      lote: "",
      almacenes: "",
      operLogs: "",
      operLog: null,
      traslado: false,
      actualizado: false,
      puntoLlegada: null,
      destino: null,
      ubicacion: null,
      direccion: null,
      fechasController: true,
    });
    this.actualizarFiltroFechas();
    this.chipElements = [];
    this.chipElementsOper = [];
    this.filtroFecha = true;
    this.resetearFiltros = true;
  }

  //#endregion

  //#region Llenado de Lista

  // Llenar los parametros del listado (Para Mat-Table o Excel)
  async llenarParametros() {
    // Parametros
    let empresa = localStorage.getItem("Empresa");

    // Recuperar valores del formulario
    const {
      cliente,
      presupuesto,
      articulo,
      lote,
      puntoLlegada,
      traslado,
      actualizado,
      fechasController,
      rangoFechasFechaInicio,
      rangoFechasFechaFin,
      rangoMesMesInicio,
      rangoMesAnhoInicio,
      rangoMesMesFin,
      rangoMesAnhoFin,
      operLog
    } = this.form.value;

    // Separar los almacenes en comas para el parametro
    let almacenes = this.chipElements.map((almacen) => almacen.nId);
    let almacenesParametro = almacenes.join(",");

    // Separar los almacenes en comas para el parametro
    let operadores = this.chipElementsOper.map((operador) => operador.nId);
    let operadorParametro = operadores.join(",");

    // Parametro de filtros
    let parametro = `${empresa}|${cliente || 0}|${presupuesto || 0}|${
      almacenesParametro || ""
    }|${articulo || 0}|${lote || ""}|${puntoLlegada || 0}|${
      actualizado ? 0 : 2231
    }|${traslado ? 1 : 0}|${fechasController ? 1 : 2}`;

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

    parametro += `|${operadorParametro || ""}|${this.idUsuario}`;

    return parametro;
  }

  // Llenar la Mat-Table
  async fnLlenarTabla() {
    this.spinner.show();
    const tipo = 9;
    const parametro = await this.llenarParametros();

    this.listaKardex = await this.inventarioService.listarKardex(
      tipo,
      parametro
    );

    if(this.listaKardex.length == 0){

      // Mensaje de error
      let texto;

      // Si es por rango de meses
      if(this.form.value.fechasController){

        // Meses
        const mesInicio = this.meses.find( mes => mes.nId == this.form.value.rangoMesMesInicio);
        const anhoInicio = this.anhos.find( anho => anho.nId == this.form.value.rangoMesAnhoInicio);
        const mesFin = this.meses.find( mes => mes.nId == this.form.value.rangoMesMesFin);
        const anhoFin = this.anhos.find( anho => anho.nId == this.form.value.rangoMesAnhoFin);

        // Si es el mismo mes
        if(mesInicio.sDescripcion == mesFin.sDescripcion && anhoInicio.sDescripcion == anhoFin.sDescripcion){
          texto = `No se encontró registros en  ${mesInicio.sDescripcion} del ${anhoInicio.sDescripcion} en base a estos filtros. Aplique otros filtros`
        }

        // Si es un mes diferente
        else{
          texto = `No se encontró registros entre ${mesInicio.sDescripcion} del ${anhoInicio.sDescripcion} al ${mesFin.sDescripcion} del ${anhoFin.sDescripcion} en base a estos filtros. Aplique otros filtros`
        }
      }
      else{

        // Fechas
        const fechaInicio = this.form.value.rangoFechasFechaInicio;
        const fechaFin = this.form.value.rangoFechasFechaFin;

        texto = `No se encontró registros entre el ${moment(fechaInicio).format("DD/MM/YYYY")} al ${moment(fechaFin).format("DD/MM/YYYY")} en base a estos filtros. Aplique otros filtros`
      }

      Swal.fire({
        title: 'No se encontró registros',
        text: texto,
        icon: 'warning',
        showCloseButton: true
      })
    }

    this.dataSource = new MatTableDataSource(this.listaKardex);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.spinner.hide();

    if(this.listaKardex.length > 0){
      this.kardexTablePanel.open();
    }
    else{
      this.kardexFiltersPanel.open();
    }
  }

  // Verificar la cantidad de elementos en el Kardex antes de generar el Excel
  async verificarCantidadElementosKardex() {
    const tipo = 9;
    const parametro = await this.llenarParametros();

    const elementos = await this.inventarioService.listarKardex(
      tipo,
      parametro
    );

    if (elementos.length == 0) {
      return false;
    }
    return true;
  }

  // Descargar el excel generado
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
      if(!this.form.valid){
        Swal.fire({
          title: 'Hay errores en el formulario',
          icon: 'warning',
          showCloseButton: true
        })
      }
      else{
        if (await this.verificarCantidadElementosKardex()) {
          const tipo = 8;
          const parametro = await this.llenarParametros();

          let empresa = localStorage.getItem("Empresa");
          let listaEmpresa = localStorage.getItem("ListaEmpresa");
          let nEmpresa = JSON.parse(listaEmpresa).find(
            (emp) => emp.nIdEmp == empresa
          );

          // Respuesta con el blob del Excel
          const response = await this.inventarioService.descargarExcelKardex(
            tipo,
            parametro,
            nEmpresa.sDespEmp
          );

          // Descargar el Excel
          const data = response;
          const fileName = `Reporte Kardex.xlsx`;
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

          // Mensaje de error
          let texto;

          // Si es por rango de meses
          if(this.form.value.fechasController){

            // Meses
            const mesInicio = this.meses.find( mes => mes.nId == this.form.value.rangoMesMesInicio);
            const anhoInicio = this.anhos.find( anho => anho.nId == this.form.value.rangoMesAnhoInicio);
            const mesFin = this.meses.find( mes => mes.nId == this.form.value.rangoMesMesFin);
            const anhoFin = this.anhos.find( anho => anho.nId == this.form.value.rangoMesAnhoFin);

            // Si es el mismo mes
            if(mesInicio.sDescripcion == mesFin.sDescripcion && anhoInicio.sDescripcion == anhoFin.sDescripcion){
              texto = `No se encontró registros en  ${mesInicio.sDescripcion} del ${anhoInicio.sDescripcion} en base a estos filtros. Aplique otros filtros`
            }

            // Si es un mes diferente
            else{
              texto = `No se encontró registros entre ${mesInicio.sDescripcion} del ${anhoInicio.sDescripcion} al ${mesFin.sDescripcion} del ${anhoFin.sDescripcion} en base a estos filtros. Aplique otros filtros`
            }
          }
          else{

            // Fechas
            const fechaInicio = this.form.value.rangoFechasFechaInicio;
            const fechaFin = this.form.value.rangoFechasFechaFin;

            texto = `No se encontró registros entre el ${moment(fechaInicio).format("DD/MM/YYYY")} al ${moment(fechaFin).format("DD/MM/YYYY")} en base a estos filtros. Aplique otros filtros`
          }

          Swal.fire({
            title: 'No se encontró registros',
            text: texto,
            icon: 'warning',
            showCloseButton: true
          })
        }
      }
      this.listaKardex = [];
      this.spinner.hide();

      this.kardexFiltersPanel.open();
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


  //#endregion

  //#region Validaciones personalizadas

  dateRangeValidator(fechaMinima: string, fechaMaxima: string): ValidatorFn {
    return (formGroup: FormGroup) => {
      let fMin = formGroup.controls[fechaMinima];
      let tMax = formGroup.controls[fechaMaxima];
      if (fMin.value != null && tMax.value != null) {
        if (moment(fMin.value).toDate() > moment(tMax.value).toDate()) {
          fMin.setErrors({ dateRangeValidator: true });
          tMax.setErrors({ dateRangeValidator: true });
        }
        else{
          fMin.setErrors(null);
          tMax.setErrors(null);
        }
      }
      return {};
    };
  }

  monthRangeValidator(
    mesInicio: string,
    anhoInicio: string,
    mesFin: string,
    anhoFin: string
  ) {
    return (formGroup: FormGroup) => {
      let mMin = formGroup.controls[mesInicio];
      let aMin = formGroup.controls[anhoInicio];
      let mMax = formGroup.controls[mesFin];
      let aMax = formGroup.controls[anhoFin];

      aMin.setErrors(null);
      aMax.setErrors(null);
      mMin.setErrors(null);
      mMax.setErrors(null);

      if (aMin.value != null && aMax.value != null) {
        if (aMin.value > aMax.value) {
          aMin.setErrors({ monthRangeValidator: true });
          aMax.setErrors({ monthRangeValidator: true });
          mMin.setErrors(null);
          mMax.setErrors(null);
        } else {
          if (mMin.value != null && mMax.value != null) {
            if (mMin.value > mMax.value) {
              mMin.setErrors({ monthRangeValidator: true });
              mMax.setErrors({ monthRangeValidator: true });
            }
          }
        }
      }
      return {};
    };
  }

  //#endregion

  //#region Comunicacion entre ambos formularios
  actualizarFormKardex (event){
    if(event){
      this.form.patchValue({
        cliente: event.cliente,
        presupuesto: event.presupuesto,
        articulo: event.articulo,
        lote: event.lote
      });
      if(event.almacen){
        this.chipElements.push(event.almacen);
        console.log(this.chipElements);
      } else if(event.almacenEliminar){
        this.fnEliminarAlmacen(event.almacenEliminar);
      }
      if(event.resetearFiltros){
        setTimeout(() => {
          this.chipElements = [];
        });
      }
    }
  }
  //#endregion
}
