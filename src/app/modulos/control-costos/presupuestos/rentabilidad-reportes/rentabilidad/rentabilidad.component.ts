import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import Swal from "sweetalert2";
import { Listas_Rentabilidad, PresupuestoRentabilidad } from "../models/rentabilidadPresupuesto.model";
import { RentabilidadPresupuestoService } from "../rentabilidad-presupuesto.service";

@Component({
  selector: "app-rentabilidad",
  templateUrl: "./rentabilidad.component.html",
  styleUrls: ["./rentabilidad.component.css"],
  animations: [asistenciapAnimations],
})
export class RentabilidadComponent implements OnInit {

  // Botones
  tsLista = "inactive";
  fbLista = [
    { icon: "search", tool: "Buscar", state: true, enabled: true },
    { icon: "cloud_download", tool: "Generar Excel", state: true, enabled: true },
    { icon: "cloud_download", tool: "Generar Excel Total", state: false, enabled: true }
  ];
  abLista = [];
  mostrarBotones = true;

  // Combobox
  cbMeses: Listas_Rentabilidad[] = [];
  cbAnhos: Listas_Rentabilidad[] = [];
  cbTiposReporte: Listas_Rentabilidad[] = [];

  // Formulario
  formRentabilidad: FormGroup;

  sCodigo: string;
  sDescripcion: string;
  nCantidad: number;
  nCostoBase: number;
  nGasto: number;
  nMargen: number;
  nRentabilidad: number;

  // Tabla
  dataSource: MatTableDataSource<PresupuestoRentabilidad>;
  lTablaRentabilidad: PresupuestoRentabilidad[] = [];
  displayedColumns: string[] = ["sCodigo", "sDescripcion", "nCantidad", "nCostoBase", "nGasto", "nMargen", "nRentabilidad"];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  txtFiltro = new FormControl(); // Filtro de busqueda de la tabla


  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  bMostrarOpcion: boolean = false;

  constructor(private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    protected _changeDetectorRef: ChangeDetectorRef,
    private rentabilidadService: RentabilidadPresupuestoService,
    @Inject('BASE_URL') baseUrl: string,
  ) {
    this.url = baseUrl;
  }

  async ngOnInit(): Promise<void> {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.spinner.show();

    this.onToggleFab(1, -1);

    // Creacion de formulario
    await this.fnCrearFormulario();

    // Llenado de combobox

    // Llenado de la tabla
    setTimeout(async () => {
      await this.fnGenerarTabla();
    });

    await this.fnListarTipoReporte();
    await this.fnListarMeses();
    await this.fnListarAnios();
    this.spinner.hide();

    this.fnValoresIniciales()
  }

  fnValoresIniciales() {
    if (this.cbAnhos.length > 0) {
      let anioUltimo = this.cbAnhos[this.cbAnhos.length - 1].sDescripcion;
      this.formRentabilidad.controls.anhoInicio.setValue(anioUltimo);
    }
    if (this.cbMeses.length > 0) {

      let mesActual = moment().month() + 1;
      this.formRentabilidad.controls.mesInicio.setValue(mesActual);
      this.formRentabilidad.controls.mesFin.setValue(mesActual);
    }
  }
  //#region Listados
  async fnListarTipoReporte() {

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    try {
      const registro = await this.rentabilidadService.fnReporteRentabilidad(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      this.cbTiposReporte = registro;

    } catch (error) {
      console.log(error);
    }
  }

  async fnListarMeses() {

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;

    try {
      const registro = await this.rentabilidadService.fnReporteRentabilidad(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      this.cbMeses = registro;
    } catch (error) {
      console.log(error);
    }
  }

  async fnListarAnios() {

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;

    pParametro.push(this.idEmp);

    try {
      const response = await this.rentabilidadService.fnReporteRentabilidad(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      this.cbAnhos = response;
    } catch (error) {
      console.log(error);
    }
  }
  //#endregion

  //#region Totales
  get fnCantidadTotal() {
    if (this.dataSource == null) {
      return 0;
    }
    return this.dataSource.data.reduce((sum, current) => sum + current.nCantidad, 0);
  }

  get fnCostoBaseTotal() {
    if (this.dataSource == null) {
      return 0;
    }
    return this.dataSource.data.reduce((sum, current) => sum + current.nCostoBase, 0);
  }

  get fnGastoTotal() {
    if (this.dataSource == null) {
      return 0;
    }
    return this.dataSource.data.reduce((sum, current) => sum + current.nGasto, 0);
  }

  get fnMargenTotal() {
    if (this.dataSource == null) {
      return 0;
    }
    return this.dataSource.data.reduce((sum, current) => sum + current.nMargen, 0);
  }

  get fnRentabilidadTotal() {
    if (this.dataSource == null) {
      return 0;
    }
    if (this.dataSource.data.length == 0) {
      return 0;
    }
    let vTotal = this.dataSource.data.reduce((sum, current) => sum + current.nRentabilidad, 0);
    return vTotal / this.dataSource.data.length
  }
  //#endregion

  //#region Botones
  onToggleFab(fab: number, stat: number) {
    stat = stat === -1 ? (this.abLista.length > 0 ? 0 : 1) : stat;
    this.tsLista = stat === 0 ? "inactive" : "active";
    this.abLista = stat === 0 ? [] : this.fbLista;
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnLlenarTabla();
        break;
      case 1:
        this.fnGenerarExcelBase();
        break;
      case 2:
        this.fnGenerarExcelRentabilidadTotal();
        break;
      default:
        break;
    }
  }

  fnMostrarBotonTotal(nId: number) {
    //nId==2420 Cliente, solo cuando es cliente mostramos el excel para rentabilidad total por meses
    // y la columna para descargar
    if (nId == 2420) {
      this.fbLista[2].state = true;
      this.displayedColumns.splice(0, 0, 'opcion');
    } else {
      this.fbLista[2].state = false;

      if (this.displayedColumns.find(item => item == 'opcion') != null) {
        this.displayedColumns.splice(0, 1);
      }
    }
  }
  //#endregion

  //#region Creacion del formulario

  fnCrearFormulario(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.formRentabilidad = this.fb.group({
        mesInicio: [null, Validators.required],
        anhoInicio: [null, Validators.required],
        mesFin: [null, Validators.required],
        tipoReporte: [null, Validators.required],
        filtroTablaReporte: "0"
      })
      resolve();
    })
  }

  //#endregion

  //#region Tabla

  // Lista la tabla para su creacion aplicando los filtros correspondientes
  async fnLlenarTabla() {

    if (this.formRentabilidad.invalid) {
      Swal.fire('¡Verificar!', 'Llene todos los campos para poder buscar.', 'warning');
      this.formRentabilidad.markAllAsTouched();
      return;
    }

    var vDatos = this.formRentabilidad.value;
    var mesInicio = Number(vDatos.mesInicio);
    var anhoInicio = Number(vDatos.anhoInicio);
    var mesFin = Number(vDatos.mesFin);

    if (mesInicio > mesFin) {
      Swal.fire('¡Verificar!', 'La fecha de inicio no puede ser mayor que la fecha fin.', 'warning');
      this.formRentabilidad.markAllAsTouched();
      return;
    }

    var pEntidad = 1;
    var pOpcion = 1;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;

    pParametro.push(this.idEmp);
    pParametro.push(this.formRentabilidad.controls.tipoReporte.value);
    pParametro.push(mesInicio);
    pParametro.push(anhoInicio);
    pParametro.push(mesFin);
    pParametro.push(anhoInicio);
    pParametro.push(vDatos.filtroTablaReporte);
    this.spinner.show();

    try {
      const response = await this.rentabilidadService.fnReporteRentabilidad(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      this.lTablaRentabilidad = response;

    } catch (error) {
      console.log(error);
      this.lTablaRentabilidad = [];
    }

    this.spinner.hide();
    await this.fnGenerarTabla();

  }

  async fnVaciarTabla() {
    this.lTablaRentabilidad = [];
    await this.fnGenerarTabla();
  }
  fnGenerarTabla(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dataSource = new MatTableDataSource(this.lTablaRentabilidad);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      resolve();
    });
  }
  //#endregion

  //#region Reportes Excel
  async fnGenerarExcelBase() {
    if (this.dataSource == null) {
      Swal.fire('¡Verificar!', 'No hay registros para los filtros indicados.', 'warning');
      return;
    }
    if (this.dataSource.data.length == 0) {
      Swal.fire('¡Verificar!', 'No hay registros para los filtros indicados.', 'warning');
      return;
    }

    var pTipo = 1
    var pParametro = []; //Parametros de campos vacios

    var vDatos = this.formRentabilidad.value;
    var mesInicio = Number(vDatos.mesInicio);
    var anhoInicio = Number(vDatos.anhoInicio);
    var mesFin = Number(vDatos.mesFin);

    pParametro.push(this.idEmp);
    pParametro.push(this.formRentabilidad.controls.tipoReporte.value);
    pParametro.push(mesInicio);
    pParametro.push(anhoInicio);
    pParametro.push(mesFin);
    pParametro.push(anhoInicio);
    pParametro.push(vDatos.filtroTablaReporte);
    const response = await this.rentabilidadService.fnDescargarExcel(
      pTipo,
      pParametro,
      this.url
    );

    // Descargar el Excel
    const data = response;
    const fileName = `Reporte Rentabilidad Base.xlsx`;
    if (window.navigator && window.navigator['msSaveOrOpenBlob']) {
      window.navigator['msSaveOrOpenBlob'](data, fileName);
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
  }

  async fnGenerarExcelRentabilidadTotal() {
    if (this.dataSource == null) {
      Swal.fire('¡Verificar!', 'No hay registros para los filtros indicados.', 'warning');
      return;
    }
    if (this.dataSource.data.length == 0) {
      Swal.fire('¡Verificar!', 'No hay registros para los filtros indicados.', 'warning');
      return;
    }

    var pTipo = 2
    var pParametro = []; //Parametros de campos vacios

    var vDatos = this.formRentabilidad.value;
    var mesInicio = Number(vDatos.mesInicio);
    var anhoInicio = Number(vDatos.anhoInicio);
    var mesFin = Number(vDatos.mesFin);

    pParametro.push(this.idEmp);
    pParametro.push(mesInicio);
    pParametro.push(anhoInicio);
    pParametro.push(mesFin);
    pParametro.push(anhoInicio);
    pParametro.push(vDatos.filtroTablaReporte);

    const response = await this.rentabilidadService.fnDescargarExcel(
      pTipo,
      pParametro,
      this.url
    );

    // Descargar el Excel
    const data = response;
    const fileName = `Reporte Rentabilidad Total.xlsx`;
    if (window.navigator && window.navigator['msSaveOrOpenBlob']) {
      window.navigator['msSaveOrOpenBlob'](data, fileName);
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
  }

  async fnDescargarExcelIndividual(cliente) {
    //console.log('CLIENTE', cliente);
    this.spinner.show();
    var parametro = [];
    var vDatos = this.formRentabilidad.value;
    var mesInicio = Number(vDatos.mesInicio);
    var cliente = cliente.nId;
    var anhoInicio = Number(vDatos.anhoInicio);
    var mesFin = Number(vDatos.mesFin);

    parametro.push(this.idEmp);
    parametro.push(cliente);
    parametro.push(mesInicio);
    parametro.push(anhoInicio);
    parametro.push(mesFin);
    parametro.push(anhoInicio);
    parametro.push(vDatos.filtroTablaReporte);
    const response = await this.rentabilidadService.fnDescargarExcelRentabilidadIndividual(0, parametro, this.url);
    this.spinner.hide();
    this.descargarExcel(response, 'Rentabilidad Individual');
  }

  descargarExcel(response: any, nombreArchivo: string): void {
    // Descargar el Excel
    const data = response;
    const fileName = `${nombreArchivo}.xlsx`;
    if (window.navigator && window.navigator['msSaveOrOpenBlob']) {
      window.navigator['msSaveOrOpenBlob'](data, fileName);
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
  }

  //#endregion
}
