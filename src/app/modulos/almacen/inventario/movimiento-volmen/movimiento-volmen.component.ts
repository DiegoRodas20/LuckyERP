import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { MatExpansionPanel } from "@angular/material/expansion";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import Swal from "sweetalert2";
import { InventarioService } from "../inventario.service";

@Component({
  selector: "app-movimiento-volmen",
  templateUrl: "./movimiento-volmen.component.html",
  styleUrls: ["./movimiento-volmen.component.css"],
  animations: [asistenciapAnimations],
})
export class MovimientoVolmenComponent implements OnInit {
  // Variables de sesion (LocalStorage)
  idEmpresa;
  idUsuario;
  idPais;
  estaCargado: boolean = false; // Variable para ver cuando la pagina este completamente cargada

  // Botones
  tsLista = "inactive";
  fbLista = [
    { icon: "search", tool: "Buscar", state: true },
    { icon: "text_snippet", tool: "Generar Excel", state: true },
  ];
  abLista = [];
  mostrarBotones = true;

  // Combobox
  cbClientes: any[] = [];
  cbPresupuestos: any[] = [];
  cbTipoAlmacenes: any[] = [];
  cbAlmacenes: any[] = [];

  cbAnhos = [];
  cbMeses = [];

  // Formulario
  formMovimientoVolumen: FormGroup;
  formMovimientoVolumenTotales: FormGroup;

  // Tabla
  displayedColumns: string[] = [
    "sEmpresa",
    "sAlmacenBase",
    "sTipoOperacion",
    "sTipoAlmacen",
    "dFechatraslado",
    "sGuia",
    "nOperLogNumero",
    "sUsuarioMov",
    "dFechaMovo",
    "sHoraMovo",
    "sCliente",
    "sCodCentroCosto",
    "sCentroCosto",
    "sSolicitante",
    "nCantidad",
    "nPesoTotal",
    "nVolumenTotal",
  ];
  dataSource: any;
  listaMovimientoVolumen: any[] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator; // Paginador de la tabla
  @ViewChild(MatSort) sort: MatSort; // Orden de las columnas de la tabla
  txtFiltro = new FormControl(); // Filtro de busqueda de la tabla

  // Expansion Panels
  @ViewChild("movimientoVolumenTablePanel")
  movimientoVolumenTablePanel: MatExpansionPanel;
  @ViewChild("movimientoVolumenFiltersPanel")
  movimientoVolumenFiltersPanel: MatExpansionPanel;

  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService,
    @Inject("BASE_URL") private baseUrl: string,
    private spinner: NgxSpinnerService,
    protected _changeDetectorRef: ChangeDetectorRef
  ) {
    // Configuracion de formulario
    this.crearFormulario();
  }

  async ngOnInit(): Promise<void> {
    this.spinner.show();

    // Inicializando variables de sesion
    this.idEmpresa = localStorage.getItem("Empresa");
    const currentUserBase64 = localStorage.getItem("currentUser");
    this.idUsuario = JSON.parse(
      window.atob(currentUserBase64.split(".")[1])
    ).uid;
    this.idPais = localStorage.getItem("Pais");

    this.onToggleFab(1, -1);

    // Llenado de controles
    await this.fnLlenarComboboxCliente();
    await this.fnLlenarComboboxPresupuesto();
    await this.fnLlenarComboboxTipoAlmacen();

    await this.llenarComboboxMeses();
    await this.llenarComboboxAnhos();

    await this.actualizarFiltroFechas();

    this.spinner.hide();

    this.estaCargado = true; // Mostrar todos los elementos al cargar todo
  }

  //#region Botones
  onToggleFab(fab: number, stat: number) {
    stat = stat === -1 ? (this.abLista.length > 0 ? 0 : 1) : stat;
    this.tsLista = stat === 0 ? "inactive" : "active";
    this.abLista = stat === 0 ? [] : this.fbLista;
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnListarReporteMovimientoVolumen();
        break;
      case 1:
        this.fnExportarExcelReporteMovimientoVolumen();
      default:
        break;
    }
  }
  //#endregion

  //#region

  // Formulario de filtrado
  crearFormulario() {
    this.formMovimientoVolumen = this.fb.group(
      {
        cliente: null,
        presupuesto: null,
        almacen: [null, Validators.compose([Validators.required])],
        tipoAlmacen: null,
        metodoMovimiento: "1",
        tipoMovimiento: "0",
        fechasController: "0", // Radio button para el filtrado por fechas
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

    this.formMovimientoVolumenTotales = this.fb.group({
      almacen: null,
      pesoTotal: 0,
      volumenTotal: 0,
    });
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
        } else {
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

  //#region Llenado de controles

  async fnLlenarComboboxCliente() {
    const pEntidad = 1;
    const pOpcion = 2;
    const pParametro = []; //Parametros de campos
    const pTipo = 2;

    pParametro.push(this.idPais); // Asignar pais de la empresa

    this.cbClientes = await this.inventarioService.fnVolumenMovimiento(
      pEntidad,
      pOpcion,
      pParametro,
      pTipo,
      this.baseUrl
    );

    console.log(this.cbClientes);
  }

  async fnLlenarComboboxPresupuesto() {
    const pEntidad = 1;
    const pOpcion = 2;
    const pParametro = []; //Parametros de campos
    const pTipo = 3;

    pParametro.push(this.idEmpresa); // Asignar pais de la empresa

    this.cbPresupuestos = await this.inventarioService.fnVolumenMovimiento(
      pEntidad,
      pOpcion,
      pParametro,
      pTipo,
      this.baseUrl
    );

    console.log(this.cbPresupuestos);
  }

  async fnLlenarComboboxTipoAlmacen() {
    const pEntidad = 1;
    const pOpcion = 2;
    const pParametro = []; //Parametros de campos
    const pTipo = 4;

    this.cbTipoAlmacenes = await this.inventarioService.fnVolumenMovimiento(
      pEntidad,
      pOpcion,
      pParametro,
      pTipo,
      this.baseUrl
    );

    console.log(this.cbTipoAlmacenes);

    // Asignar en el combobox la empresa actual como primer valor
    setTimeout(async () => {
      this.formMovimientoVolumen
        .get("tipoAlmacen")
        .setValue(this.cbTipoAlmacenes[0].nId);
      await this.fnLlenarComboboxAlmacen();
    });
  }

  async fnLlenarComboboxAlmacen() {
    const pEntidad = 1;
    const pOpcion = 2;
    const pParametro = []; //Parametros de campos
    const pTipo = 5;

    pParametro.push(this.formMovimientoVolumen.get("tipoAlmacen").value); // Asignar el tipo de almacen seleccionado

    this.cbAlmacenes = await this.inventarioService.fnVolumenMovimiento(
      pEntidad,
      pOpcion,
      pParametro,
      pTipo,
      this.baseUrl
    );

    console.log(this.cbAlmacenes);
  }

  async llenarComboboxMeses() {
    let tipo = 10;
    let parametro = "";
    this.cbMeses = await this.inventarioService.llenarComboboxKardex(
      tipo,
      parametro
    );
  }

  async llenarComboboxAnhos() {
    let hoy = new Date();
    for (let i = hoy.getFullYear() - 21; i <= hoy.getFullYear(); i++) {
      this.cbAnhos.push({ nId: i, sDescripcion: i });
    }
  }

  actualizarFiltroFechas() {
    // Extraemos los datos del dia de hoy
    let hoy = new Date();
    let diaActual = hoy.getDate();
    let mesActual = hoy.getMonth();
    let mesArreglo = this.cbMeses[mesActual].nId;
    let anhoActual = hoy.getFullYear();

    // Declaramos los combobox y datepickers en base a el dia actual
    this.formMovimientoVolumen.patchValue({
      rangoFechasFechaInicio: new Date(anhoActual, mesActual, diaActual),
      rangoFechasFechaFin: new Date(anhoActual, mesActual, diaActual),
      rangoMesMesInicio: mesArreglo,
      rangoMesAnhoInicio: anhoActual,
      rangoMesMesFin: mesArreglo,
      rangoMesAnhoFin: anhoActual,
    });
  }

  //#endregion

  //#region Listar

  async fnListarReporteMovimientoVolumen() {
    if (this.formMovimientoVolumen.valid) {
      this.spinner.show();

      const pEntidad = 1;
      const pOpcion = 2;
      const pParametro = []; //Parametros de campos
      const pTipo = 1;

      const {
        cliente,
        presupuesto,
        almacen,
        metodoMovimiento,
        tipoMovimiento,
        fechasController,
        rangoFechasFechaInicio,
        rangoFechasFechaFin,
        rangoMesMesInicio,
        rangoMesAnhoInicio,
        rangoMesMesFin,
        rangoMesAnhoFin,
      } = this.formMovimientoVolumen.value;

      pParametro.push(this.idEmpresa);
      pParametro.push(cliente || 0); // Asignar el cliente, de no tener se manda 0
      pParametro.push(presupuesto || 0); // Asignar el presupuesto, de no tener se manda 0
      pParametro.push(almacen || 0); // Asignar el almacen, de no tener se manda 0
      pParametro.push(metodoMovimiento || 0); // Asignar el metodo de movimiento
      pParametro.push(tipoMovimiento || 0); // Asignar el tipo de movimiento

      pParametro.push(fechasController);

      if (fechasController == "1") {
        // Obtener meses de los combobox
        const mesInicio = this.cbMeses
          .map((mes) => mes.nId)
          .indexOf(rangoMesMesInicio);
        const mesFin = this.cbMeses
          .map((mes) => mes.nId)
          .indexOf(rangoMesMesFin);

        // Formatear dia de los combobox por meses
        const fechaInicio = moment(
          new Date(rangoMesAnhoInicio, mesInicio, 1)
        ).format("YYYY-MM-DD");
        const fechaFin = moment(new Date(rangoMesAnhoFin, mesFin, 1)).format(
          "YYYY-MM-DD"
        );
        pParametro.push(fechaInicio), pParametro.push(fechaFin);
      } else {
        pParametro.push(moment(rangoFechasFechaInicio).format("YYYY-MM-DD"));
        pParametro.push(moment(rangoFechasFechaFin).format("YYYY-MM-DD"));
      }

      this.listaMovimientoVolumen =
        await this.inventarioService.fnVolumenMovimiento(
          pEntidad,
          pOpcion,
          pParametro,
          pTipo,
          this.baseUrl
        );

      // Generar lista
      this.dataSource = new MatTableDataSource(this.listaMovimientoVolumen);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.spinner.hide();

      // Agregar peso y volumen total
      let pesoTotal = 0;
      let volumenTotal = 0;
      this.listaMovimientoVolumen.map((movimiento) => {
        pesoTotal += movimiento.nPesoTotal;
        volumenTotal += movimiento.nVolumenTotal;
      });

      const nombreAlmacen = this.cbAlmacenes.find(
        (almacen) =>
          almacen.nId == this.formMovimientoVolumen.get("almacen").value
      ).sDescripcion;

      this.formMovimientoVolumenTotales.patchValue({
        almacen: nombreAlmacen,
        pesoTotal: pesoTotal.toFixed(2),
        volumenTotal: volumenTotal.toFixed(6),
      });

      // Abir panel si hay elementos
      if (this.listaMovimientoVolumen.length > 0) {
        this.movimientoVolumenTablePanel.open();
      } else {
        this.movimientoVolumenFiltersPanel.open();
      }
    } else {
      this.formMovimientoVolumen.markAllAsTouched();
    }
  }

  async fnExportarExcelReporteMovimientoVolumen() {
    if (this.formMovimientoVolumen.valid) {
      const pEntidad = 1;
      const pOpcion = 2;
      const pParametro = []; //Parametros de campos
      const pTipo = 6;

      const {
        cliente,
        presupuesto,
        almacen,
        metodoMovimiento,
        tipoMovimiento,
        fechasController,
        rangoFechasFechaInicio,
        rangoFechasFechaFin,
        rangoMesMesInicio,
        rangoMesAnhoInicio,
        rangoMesMesFin,
        rangoMesAnhoFin,
      } = this.formMovimientoVolumen.value;

      pParametro.push(this.idEmpresa);
      pParametro.push(cliente || 0); // Asignar el cliente, de no tener se manda 0
      pParametro.push(presupuesto || 0); // Asignar el presupuesto, de no tener se manda 0
      pParametro.push(almacen || 0); // Asignar el almacen, de no tener se manda 0
      pParametro.push(metodoMovimiento || 0); // Asignar el metodo de movimiento
      pParametro.push(tipoMovimiento || 0); // Asignar el tipo de movimiento

      pParametro.push(fechasController);

      if (fechasController == "1") {
        // Obtener meses de los combobox
        const mesInicio = this.cbMeses
          .map((mes) => mes.nId)
          .indexOf(rangoMesMesInicio);
        const mesFin = this.cbMeses
          .map((mes) => mes.nId)
          .indexOf(rangoMesMesFin);

        // Formatear dia de los combobox por meses
        const fechaInicio = moment(
          new Date(rangoMesAnhoInicio, mesInicio, 1)
        ).format("YYYY-MM-DD");
        const fechaFin = moment(new Date(rangoMesAnhoFin, mesFin, 1)).format(
          "YYYY-MM-DD"
        );
        pParametro.push(fechaInicio), pParametro.push(fechaFin);
      } else {
        pParametro.push(moment(rangoFechasFechaInicio).format("YYYY-MM-DD"));
        pParametro.push(moment(rangoFechasFechaFin).format("YYYY-MM-DD"));
      }

      const response = await this.inventarioService.fnVolumenMovimientoExcel(
        pEntidad,
        pOpcion,
        pParametro,
        pTipo,
        this.baseUrl
      );

      // Descargar el Excel
      const data = response;
      const fileName = `Reporte Volumen Movimiento.xlsx`;
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(data, fileName);
        return;
      }
      const objectUrl = window.URL.createObjectURL(data);
      var link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      // Trigger de descarga
      link.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );

      Swal.fire({
        title: "El Excel ha sido generado",
        html: `Si su descarga no ha comenzado, puede descargarlo <a href='${objectUrl}' download="${fileName}">aquí</a>`,
        icon: "success",
        showCloseButton: true,
      });

      this.listaMovimientoVolumen = [];

      // Abrir panel de controles
      this.movimientoVolumenFiltersPanel.open();
    } else {
      this.formMovimientoVolumen.markAllAsTouched();
    }
  }

  //#endregion
}
