import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import Swal from "sweetalert2";
import { E_Reporte7Niveles } from "../models/rentabilidad-niveles.model";
import { Listas_Rentabilidad } from "../models/rentabilidadPresupuesto.model";
import { RentabilidadPresupuestoService } from "../rentabilidad-presupuesto.service";
import { RentabilidadDetalleComponent } from "./rentabilidad-detalle/rentabilidad-detalle.component";

@Component({
  selector: "app-rentabilidad-niveles",
  templateUrl: "./rentabilidad-niveles.component.html",
  styleUrls: ["./rentabilidad-niveles.component.css"],
  animations: [asistenciapAnimations]
})
export class RentabilidadNivelesComponent implements OnInit {

  // Botones
  tsLista = "inactive";
  fbLista = [
    { icon: "search", tool: "Buscar", state: true },
    { icon: "cloud_download", tool: "Generar Excel", state: true }
  ];
  abLista = [];
  mostrarBotones = true;

  // Combobox
  cbMeses: Listas_Rentabilidad[] = [];
  cbAnhos: Listas_Rentabilidad[] = [];
  cbClientes = [];
  cbEjecutivos = [];
  cbDirectores = [];
  cbDirectoresGenerales = [];
  cbServicios = [];
  cbCargos = [];
  cbCiudades = [];

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual
  datos: any;

  // Formulario
  formRentabilidadNiveles: FormGroup;

  // Tabla
  dataSource: MatTableDataSource<E_Reporte7Niveles>;
  lTablaRentabilidadNiveles: E_Reporte7Niveles[] = [];
  displayedColumns: string[] = ["opciones", "sCliente", "sEjecutivo1", "sDirCuenta", "sDirGeneral", "sServicio", "sSucursal", "sPartida",
    "nCantidad", "nIngresos", "nEgresos", "nRentabilidad", "nPorcentaje"];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  txtFiltro = new FormControl(); // Filtro de busqueda de la tabla


  constructor(private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
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
    await this.fnListarMeses();
    await this.fnListarAnios();
    this.spinner.hide();

    this.fnValoresIniciales();
  }

  fnValoresIniciales() {
    if (this.cbAnhos.length > 0) {
      let anioUltimo = this.cbAnhos[this.cbAnhos.length - 1].sDescripcion;
      this.formRentabilidadNiveles.controls.anhoProceso.setValue(anioUltimo);
    }
    if (this.cbMeses.length > 0) {

      let mesActual = moment().month() + 1;
      this.formRentabilidadNiveles.controls.mesProceso.setValue(mesActual);
    }
  }

  //#region Listados
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

  async fnVaciarTabla() {
    this.lTablaRentabilidadNiveles = [];
    await this.fnGenerarTabla();
  }

  async fnTraerTabla() {
    if (this.formRentabilidadNiveles.invalid) {
      Swal.fire('¡Verificar!', 'Llene todos los campos para poder buscar.', 'warning');
      this.formRentabilidadNiveles.markAllAsTouched();
      return;
    }

    var vDatos = this.formRentabilidadNiveles.value;
    var mes = Number(vDatos.mesProceso);
    var anho = Number(vDatos.anhoProceso);
    this.datos = vDatos

    var pEntidad = 2;
    var pOpcion = 1;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;

    pParametro.push(this.idEmp);
    pParametro.push(mes);
    pParametro.push(anho);
    pParametro.push(vDatos.filtroTablaReporte);

    this.spinner.show();

    try {
      const response = await this.rentabilidadService.fnReporteRentabilidad(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      this.lTablaRentabilidadNiveles = response;

    } catch (error) {
      console.log(error);
      this.lTablaRentabilidadNiveles = [];
    }

    this.spinner.hide();
    await this.fnGenerarTabla();
  }

  //#region Reportes Excel
  async fnGenerarExcel() {
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

    var vDatos = this.formRentabilidadNiveles.value;
    var mes = Number(vDatos.mesProceso);
    var anho = Number(vDatos.anhoProceso);

    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;

    pParametro.push(this.idEmp);
    pParametro.push(mes);
    pParametro.push(anho);
    pParametro.push(vDatos.filtroTablaReporte);

    this.spinner.show();

    const response = await this.rentabilidadService.fnDescargarExcel7Niveles(
      pTipo,
      pParametro,
      this.url
    );
    this.spinner.hide();

    // Descargar el Excel
    const data = response;
    const fileName = `Reporte Rentabilidad 7 niveles.xlsx`;
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

  fnGenerarTabla(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dataSource = new MatTableDataSource(this.lTablaRentabilidadNiveles);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      resolve();
    });
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
        this.fnTraerTabla();
        break;
      case 1:
        this.fnGenerarExcel();
        break;
      default:
        break;
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
    return this.dataSource.data.reduce((sum, current) => sum + current.nIngresos, 0);
  }

  get fnGastoTotal() {
    if (this.dataSource == null) {
      return 0;
    }
    return this.dataSource.data.reduce((sum, current) => sum + current.nEgresos, 0);
  }

  get fnMargenTotal() {
    if (this.dataSource == null) {
      return 0;
    }
    return this.dataSource.data.reduce((sum, current) => sum + current.nRentabilidad, 0);
  }

  get fnRentabilidadTotal() {
    if (this.dataSource == null) {
      return 0;
    }
    if (this.dataSource.data.length == 0) {
      return 0;
    }
    let vTotal = this.dataSource.data.reduce((sum, current) => sum + current.nPorcentaje, 0);
    return vTotal / this.dataSource.data.length
  }
  //#endregion

  //#region Creacion del formulario

  fnCrearFormulario(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.formRentabilidadNiveles = this.fb.group({
        anhoProceso: [null, Validators.required],
        mesProceso: [null, Validators.required],
        cliente: null,
        ejecutivo: null,
        director: null,
        directorGeneral: null,
        servicio: null,
        cargo: null,
        ciudad: null,
        filtroTablaReporte: "0"
      })
      resolve();
    })
  }

  //#endregion

  rentabilidadDetalle(element) {

    const dialogConfig = new MatDialogConfig()
    var data = this.datos

    dialogConfig.data = { element, data }
    dialogConfig.maxWidth = '90vw'
    dialogConfig.width = '900px'
    dialogConfig.disableClose = true

    const dialogReg = this.dialog.open(RentabilidadDetalleComponent, dialogConfig)
  }

}
