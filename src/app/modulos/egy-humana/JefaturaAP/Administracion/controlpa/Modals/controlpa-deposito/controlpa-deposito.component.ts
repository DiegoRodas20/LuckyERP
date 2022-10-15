import { StepperSelectionEvent } from "@angular/cdk/stepper";
import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatStepper } from "@angular/material/stepper";
import { MatTableDataSource } from "@angular/material/table";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";

import { adminpAnimations } from "../../../../Animations/adminp.animations";
import {
  IDevengue,
  IInfoEmpresa,
  IOpcionComboIncierto,
  IOpcionFb,
  IPersonalGenerarDeposito,
  IPersonalGenerarDepositoInciertoSelect,
  IPlanilla,
} from "../../../../Model/Icontrolpa";
import { ControlpaService } from "../../../../Services/controlpa.service";

enum EstadosFb {
  nuevo = 0,
  renovacion = 1,
  inciertoDescarga = 2,
  inciertoEditar = 3,
  inciertoGuardar = 4,
}

class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: "app-controlpa-deposito",
  templateUrl: "./controlpa-deposito.component.html",
  styleUrls: [
    "./controlpa-deposito.component.css",
    "controlpa-deposito.component.scss",
  ],
  animations: [adminpAnimations],
})
export class ControlpaDepositoComponent implements OnInit {
  //#region INPUT
  @Input() planilla: IPlanilla;
  //#endregion

  //#region GENERAL
  tabsDesactivado = false;
  stepperDesactivado = false;
  matcher = new MyErrorStateMatcher();
  recargarPadre = false;
  //#endregion

  //#region FB
  private _estadoFb = EstadosFb.nuevo;
  private _animacionFb: string = "inactive";
  private _opcionesFb: IOpcionFb[] = [];
  private _stepNuevoFb: IOpcionFb[] = [
    {
      icon: "save",
      tool: "Generar depósito",
      disabled: false,
    },
    {
      icon: "close",
      tool: "Cancelar",
      disabled: false,
    },
  ];
  private _stepRenovacionFb: IOpcionFb[] = [
    {
      icon: "save",
      tool: "Generar depósito",
      disabled: false,
    },
    {
      icon: "close",
      tool: "Cancelar",
      disabled: false,
    },
  ];
  private _stepInciertoDescargarFb: IOpcionFb[] = [
    {
      icon: "get_app",
      tool: "Descargar",
      disabled: false,
    },
  ];

  private _stepInciertoEditarCancelarFb: IOpcionFb[] = [
    {
      icon: "edit",
      tool: "Editar",
      disabled: false,
    },
    {
      icon: "close",
      tool: "Editar",
      disabled: false,
    },
  ];

  private _stepInciertoGuardarCancelarFb: IOpcionFb[] = [
    {
      icon: "save",
      tool: "Guardar",
      disabled: false,
    },
    {
      icon: "close",
      tool: "Editar",
      disabled: false,
    },
  ];

  public get stepInciertoDescargarFb(): IOpcionFb[] {
    return this._stepInciertoDescargarFb;
  }
  public set stepInciertoDescargarFb(value: IOpcionFb[]) {
    this._stepInciertoDescargarFb = value;
  }
  public get stepInciertoEditarCancelarFb(): IOpcionFb[] {
    return this._stepInciertoEditarCancelarFb;
  }
  public set stepInciertoEditarCancelarFb(value: IOpcionFb[]) {
    this._stepInciertoEditarCancelarFb = value;
  }

  public get stepInciertoGuardarCancelarFb(): IOpcionFb[] {
    return this._stepInciertoGuardarCancelarFb;
  }
  public set stepInciertoGuardarCancelarFb(value: IOpcionFb[]) {
    this._stepInciertoGuardarCancelarFb = value;
  }

  public get estadoFb() {
    return this._estadoFb;
  }
  public set estadoFb(value) {
    this._estadoFb = value;
  }

  public get opcionesFb(): IOpcionFb[] {
    return this._opcionesFb;
  }
  public set opcionesFb(value: IOpcionFb[]) {
    this._opcionesFb = value;
  }

  public get animacionFb(): string {
    return this._animacionFb;
  }
  public set animacionFb(value: string) {
    this._animacionFb = value;
  }

  public get stepNuevoFb(): IOpcionFb[] {
    return this._stepNuevoFb;
  }
  public set stepNuevoFb(value: IOpcionFb[]) {
    this._stepNuevoFb = value;
  }
  public get stepRenovacionFb(): IOpcionFb[] {
    return this._stepRenovacionFb;
  }
  public set stepRenovacionFb(value: IOpcionFb[]) {
    this._stepRenovacionFb = value;
  }

  //#endregion

  //#region TABLA PERSONAL - NUEVO
  private _tablaNuevoDC = [
    "sNombres",
    "planilla",
    "tipo",
    "documento",
    "ingreso",
    "cese",
    "importe",
  ];

  private _tablaNuevoDS: MatTableDataSource<IPersonalGenerarDeposito> =
    new MatTableDataSource<IPersonalGenerarDeposito>([]);

  @ViewChild("pagTablaNuevo", { static: true })
  private _pagTablaNuevo: MatPaginator;

  public get tablaNuevoDC() {
    return this._tablaNuevoDC;
  }
  public set tablaNuevoDC(value) {
    this._tablaNuevoDC = value;
  }

  public get tablaNuevoDS(): MatTableDataSource<IPersonalGenerarDeposito> {
    return this._tablaNuevoDS;
  }
  public set tablaNuevoDS(value: MatTableDataSource<IPersonalGenerarDeposito>) {
    this._tablaNuevoDS = value;
  }

  public get pagTablaNuevo(): MatPaginator {
    return this._pagTablaNuevo;
  }
  public set pagTablaNuevo(value: MatPaginator) {
    this._pagTablaNuevo = value;
  }
  //#endregion

  //#region TABLA PERSONAL - RENOVACION
  private _tablaRenovacionDC = [
    "sNombres",
    "planilla",
    "tipo",
    "documento",
    "ingreso",
    "cese",
    "importe",
  ];

  private _tablaRenovacionDS: MatTableDataSource<IPersonalGenerarDeposito> =
    new MatTableDataSource<IPersonalGenerarDeposito>([]);

  @ViewChild("pagTablaRenovacion", { static: true })
  private _pagTablaRenovacion: MatPaginator;

  public get tablaRenovacionDC() {
    return this._tablaRenovacionDC;
  }
  public set tablaRenovacionDC(value) {
    this._tablaRenovacionDC = value;
  }

  public get tablaRenovacionDS(): MatTableDataSource<IPersonalGenerarDeposito> {
    return this._tablaRenovacionDS;
  }
  public set tablaRenovacionDS(
    value: MatTableDataSource<IPersonalGenerarDeposito>
  ) {
    this._tablaRenovacionDS = value;
  }
  public get pagTablaRenovacion(): MatPaginator {
    return this._pagTablaRenovacion;
  }
  public set pagTablaRenovacion(value: MatPaginator) {
    this._pagTablaRenovacion = value;
  }
  //#endregion

  //#region TABLA PERSONAL - INCIERTO

  public opcionesInciertoCombo: IOpcionComboIncierto[] = [
    {
      valor: 0,
      nombre: "Nuevo",
    },
    {
      valor: 1,
      nombre: "Renovacion",
    },
  ];

  private _contadorTipoInciertos = 0;
  private _tipoInciertoSeleccionado = -1;
  private _desactivarAlerta = false;
  public get desactivarAlerta() {
    return this._desactivarAlerta;
  }
  public set desactivarAlerta(value) {
    this._desactivarAlerta = value;
  }

  public get tipoInciertoSeleccionado() {
    return this._tipoInciertoSeleccionado;
  }
  public set tipoInciertoSeleccionado(value) {
    this._tipoInciertoSeleccionado = value;
  }

  public get contadorTipoInciertos() {
    return this._contadorTipoInciertos;
  }
  public set contadorTipoInciertos(value) {
    this._contadorTipoInciertos = value;
  }
  private _tablaInciertoDC = [
    "sNombres",
    "planilla",
    "tipo",
    "documento",
    "ingreso",
    "cese",
    "importe",
  ];

  private _tablaInciertoDS: MatTableDataSource<IPersonalGenerarDeposito> =
    new MatTableDataSource<IPersonalGenerarDeposito>([]);
  @ViewChild("pagTablaIncierto", { static: true })
  private _pagTablaIncierto: MatPaginator;

  public get tablaInciertoDC() {
    return this._tablaInciertoDC;
  }
  public set tablaInciertoDC(value) {
    this._tablaInciertoDC = value;
  }

  public get tablaInciertoDS(): MatTableDataSource<IPersonalGenerarDeposito> {
    return this._tablaInciertoDS;
  }
  public set tablaInciertoDS(
    value: MatTableDataSource<IPersonalGenerarDeposito>
  ) {
    this._tablaInciertoDS = value;
  }
  public get pagTablaIncierto(): MatPaginator {
    return this._pagTablaIncierto;
  }
  public set pagTablaIncierto(value: MatPaginator) {
    this._pagTablaIncierto = value;
  }
  //#endregion

  //#region TABLA INCIERTO EDITAR
  private _tablaInciertoEditarDC = [
    "sNombres",
    "planilla",
    "tipo",
    "documento",
    "ingreso",
    "cese",
    "importe",
    "seleccionar",
  ];

  private _tablaInciertoEditarDS: MatTableDataSource<IPersonalGenerarDepositoInciertoSelect> =
    new MatTableDataSource<IPersonalGenerarDepositoInciertoSelect>([]);
  @ViewChild("pagTablaInciertoEditar", { static: true })
  private _pagTablaInciertoEditar: MatPaginator;

  public get tablaInciertoEditarDC() {
    return this._tablaInciertoEditarDC;
  }
  public set tablaInciertoEditarDC(value) {
    this._tablaInciertoEditarDC = value;
  }

  public get tablaInciertoEditarDS(): MatTableDataSource<IPersonalGenerarDepositoInciertoSelect> {
    return this._tablaInciertoEditarDS;
  }
  public set tablaInciertoEditarDS(
    value: MatTableDataSource<IPersonalGenerarDepositoInciertoSelect>
  ) {
    this._tablaInciertoEditarDS = value;
  }
  public get pagTablaInciertoEditar(): MatPaginator {
    return this._pagTablaInciertoEditar;
  }
  public set pagTablaInciertoEditar(value: MatPaginator) {
    this._pagTablaInciertoEditar = value;
  }
  //#endregion

  //#region DEVENGUE ACTUAL
  devengueActual: IDevengue = {
    nIdEstado: 0,
    nIdDevengue: 0,
    nEjercicio: null,
    nMes: null,
  };
  private _meses = {
    1: "Enero",
    2: "Febrero",
    3: "Marzo",
    4: "Abril",
    5: "Mayo",
    6: "Junio",
    7: "Julio",
    8: "Agosto",
    9: "Septiembre",
    10: "Octubre",
    11: "Noviembre",
    12: "Diciembre",
  };
  public get meses() {
    return this._meses;
  }
  public set meses(value) {
    this._meses = value;
  }
  //#endregion

  //#region STEPPER
  @ViewChild("stepperIncierto")
  private _stepperIncierto: MatStepper;
  public get stepperIncierto(): MatStepper {
    return this._stepperIncierto;
  }
  public set stepperIncierto(value: MatStepper) {
    this._stepperIncierto = value;
  }

  //#endregion

  constructor(
    private formBuilder: FormBuilder,
    private servicio: ControlpaService,
    private spi: NgxSpinnerService,
    public activeModal: NgbActiveModal
  ) {}

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_modal_controlpa_deposito");
    await this._devengueActualServicio();

    await this._tablasServicio();
    this.spi.hide("spi_modal_controlpa_deposito");

    this.animacionFb = "active";
    this.opcionesFb = this.stepNuevoFb;
  }

  //#region FB
  public clickGrupoFb() {
    if (this.estadoFb === EstadosFb.nuevo) {
      if (this.animacionFb === "inactive") {
        this.animacionFb = "active";
        this.opcionesFb = this.stepNuevoFb;
      } else {
        this.animacionFb = "inactive";
        this.opcionesFb = [];
      }
      return;
    }

    if (this.estadoFb === EstadosFb.renovacion) {
      if (this.animacionFb === "inactive") {
        this.animacionFb = "active";
        this.opcionesFb = this.stepRenovacionFb;
      } else {
        this.animacionFb = "inactive";
        this.opcionesFb = [];
      }
      return;
    }

    if (this.estadoFb === EstadosFb.inciertoDescarga) {
      if (this.animacionFb === "inactive") {
        this.animacionFb = "active";
        this.opcionesFb = this.stepInciertoDescargarFb;
      } else {
        this.animacionFb = "inactive";
        this.opcionesFb = [];
      }
      return;
    }

    if (this.estadoFb === EstadosFb.inciertoEditar) {
      if (this.animacionFb === "inactive") {
        this.animacionFb = "active";
        this.opcionesFb = this.stepInciertoEditarCancelarFb;
      } else {
        this.animacionFb = "inactive";
        this.opcionesFb = [];
      }
      return;
    }

    if (this.estadoFb === EstadosFb.inciertoGuardar) {
      if (this.animacionFb === "inactive") {
        this.animacionFb = "active";
        this.opcionesFb = this.stepInciertoGuardarCancelarFb;
      } else {
        this.animacionFb = "inactive";
        this.opcionesFb = [];
      }
      return;
    }
  }

  public async clickOpcionFb(indice: number) {
    if (this.estadoFb === EstadosFb.nuevo) {
      if (indice === 0) {
        if (this.tablaNuevoDS.data.length === 0) {
          Swal.fire({
            title: "Atención!",
            text: "La tabla no contiene registros de tipo nuevo",
            icon: "warning",
            confirmButtonText: "Aceptar",
          });
          return;
        }

        if (
          await this._swalConfirm(
            "¿Esta seguro de guardar?",
            "Se genera deposito para tesoreria",
            "Guardar"
          )
        ) {
          this.spi.show("spi_modal_controlpa_deposito");
          await this._guardarPersonalNuevo();
          this.spi.hide("spi_modal_controlpa_deposito");
        }
        return;
      }

      if (indice === 1) {
        this.cerrarModal();
      }

      return;
    }

    if (this.estadoFb === EstadosFb.renovacion) {
      if (indice === 0) {
        if (this.tablaNuevoDS.data.length === 0) {
          Swal.fire({
            title: "Atención!",
            text: "La tabla no contiene registros de tipo renovación",
            icon: "warning",
            confirmButtonText: "Aceptar",
          });
          return;
        }

        if (
          await this._swalConfirm(
            "¿Esta seguro de guardar?",
            "Se genera deposito para tesoreria",
            "Guardar"
          )
        ) {
          this.spi.show("spi_modal_controlpa_deposito");
          await this._guardarPersonalRenovacion();
          this.spi.hide("spi_modal_controlpa_deposito");
        }
        return;
      }

      if (indice === 1) {
        this.cerrarModal();
      }
      return;
    }

    if (this.estadoFb === EstadosFb.inciertoDescarga) {
      if (indice === 0) {
        this.spi.show("spi_modal_controlpa_deposito");
        await this._descargarTxt();
        this.spi.hide("spi_modal_controlpa_deposito");

        this.opcionesFb = [];
        this.delay(250).then(() => {
          this.estadoFb = EstadosFb.inciertoEditar;
          this.opcionesFb = this.stepInciertoEditarCancelarFb;
          this.stepperIncierto.next();
        });
        return;
      }
      return;
    }

    if (this.estadoFb === EstadosFb.inciertoEditar) {
      if (indice === 0) {
        this.opcionesFb = [];
        this.delay(250).then(() => {
          this.estadoFb = EstadosFb.inciertoGuardar;
          this.opcionesFb = this.stepInciertoGuardarCancelarFb;
          this.tabsDesactivado = true;
          this.stepperDesactivado = true;
          this._habilitarCampoSelectInciertos();
        });

        return;
      }

      if (indice === 1) {
        this.opcionesFb = [];
        this.delay(250).then(() => {
          this.estadoFb = EstadosFb.inciertoDescarga;
          this.opcionesFb = this.stepInciertoDescargarFb;
          this.stepperIncierto.previous();
        });
        return;
      }
    }

    if (this.estadoFb === EstadosFb.inciertoGuardar) {
      if (indice === 0) {
        if (this.tablaInciertoDS.data.length === 0) {
          Swal.fire({
            title: "Atención!",
            text: "La tabla no contiene registros de tipo inciertos",
            icon: "warning",
            confirmButtonText: "Aceptar",
          });
          return;
        }

        if (this._validacionTodosCamposSeleccionados()) {
          Swal.fire({
            title: "Atención!",
            text: "Te faltó seleccionar algunos campos",
            icon: "warning",
            confirmButtonText: "Aceptar",
          });
          return;
        }
        if (
          await this._swalConfirm(
            "¿Esta seguro de guardar?",
            "Una vez guardado no podra deshacer esta accion",
            "Guardar"
          )
        ) {
          this.spi.show("spi_modal_controlpa_deposito");
          await this._guardarDepositoIncierto();
          this.estadoFb = EstadosFb.inciertoDescarga;
          this.opcionesFb = this.stepInciertoDescargarFb;
          this.tabsDesactivado = false;
          this.stepperDesactivado = false;
          this._deshabilitarCampoSelectInciertos();
          this.stepperIncierto.previous();
          this.spi.hide("spi_modal_controlpa_deposito");
        }
        return;
      }

      if (indice === 1) {
        this.contadorTipoInciertos = -1;
        this.estadoFb = EstadosFb.inciertoEditar;
        this.opcionesFb = this.stepInciertoEditarCancelarFb;
        this.tabsDesactivado = false;
        this.stepperDesactivado = false;
        this._deshabilitarCampoSelectInciertos();
        return;
      }
    }
  }
  //#endregion

  //#region TABLAS
  private async _tablasServicio() {
    const params = [];

    const sFechaDevengue = moment(
      new Date(this.devengueActual.nEjercicio, this.devengueActual.nMes - 1, 1)
    ).format("MM/DD/YYYY");

    var param1 = "6¡spFechDevengue!02/01/2021-";
    param1 = param1 + "0¡nIdDevengue!7-" + "0¡PC.nIdDevengue!7-";
    param1 = param1 + "0¡A.nIdEmp!1";

    params.push(param1);
    params.push("0¡sCodPlla!" + this.planilla.sCodPlla);

    const data: IPersonalGenerarDeposito[] = await this.servicio._loadSP(
      3,
      params
    );

    this._obtenerPersonalNuevo(data);
    this._obtenerPersonalRenovacion(data);
    this._obtenerPersonalIncierto(data);
    this._deshabilitarBotonesSiNoTienenData();
  }

  private _deshabilitarBotonesSiNoTienenData() {
    if (!this.stepNuevoFb[0].disabled && this.tablaNuevoDS.data.length === 0) {
      this.stepNuevoFb[0].disabled = true;
    }

    if (
      !this.stepRenovacionFb[0].disabled &&
      this.tablaRenovacionDS.data.length === 0
    ) {
      this.stepRenovacionFb[0].disabled = true;
    }
  }

  // btipo: 0:nuevo - 1:renovacion
  private async _guardarDeposito(bTipo: number): Promise<number> {
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

    const params = [];

    params.push("T1¡nIdDevengue!" + this.devengueActual.nIdDevengue);
    params.push("T1¡nIdPlla!" + this.planilla.nIdPlla);
    params.push("T1¡bTipo!" + bTipo);
    params.push("T1¡nIdRegUser!" + uid);
    params.push("T1¡dtReg!GETDATE()");

    const data: any = await this.servicio._crudCPA(7, params);
    const nIdDepositoProvis: number = +data[0].split("!")[1];
    return nIdDepositoProvis;
  }

  private async _guardarDetalleDeposito(
    nIdDP: number,
    personal: IPersonalGenerarDeposito[]
  ) {
    const params = [];
    var sParam = "";

    params.push("T1¡nIdDP!" + nIdDP);

    personal.forEach((persona) => {
      sParam = "";
      sParam = sParam + "T1¡nIdPersonal!" + persona.nIdPersonal + "-";
      sParam = sParam + "T1¡nImporte!" + persona.nImporte;
      params.push(sParam);
    });
    const data: any = await this.servicio._crudCPA(14, params);
  }

  private async _guardarHistoricoDeposito(nIdDP: number) {
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

    const params = [];
    params.push("T1¡nIdFK!" + nIdDP);
    params.push("T1¡nIdDireccion!1128");
    params.push("T1¡nIdArea!1137");
    params.push("T1¡nIdTipoDeposito!1372");
    params.push("T1¡nIdEstado!2357");
    params.push("T1¡nIdRegUser!" + uid);
    params.push("T1¡dtReg!GETDATE()");

    const data: any = await this.servicio._crudCPA(1, params);
  }

  //#endregion

  //#region TABLA PERSONAL - NUEVO
  // Las personas no existen en el historico de depositos
  private _obtenerPersonalNuevo(data: IPersonalGenerarDeposito[]) {
    const personal: IPersonalGenerarDeposito[] = [];
    data.forEach((persona) => {
      if (
        persona.nImporte > 0 &&
        (persona.nIdDP === 0 ||
          (persona.nIdIncidenciap !== 0 &&
            !persona.bTipoInci &&
            persona.nImporteDDP < persona.nImporte))
      ) {
        personal.push(persona);
      }
    });

    this.tablaNuevoDS = new MatTableDataSource(personal);
    this.tablaNuevoDS.paginator = this.pagTablaNuevo;
  }

  private async _guardarPersonalNuevo() {
    const nIdDP: number = await this._guardarDeposito(0);
    await this._guardarDetalleDeposito(nIdDP, this.tablaNuevoDS.data);
    await this._guardarHistoricoDeposito(nIdDP);
    await this._tablasServicio();
    this.recargarPadre = true;
    this._swalSucces("Guardado", "Deposito nuevo guardado.");
  }

  //#endregion

  //#region TABLA PERSONAL - RENOVACION
  // Tiene deposito dentro de los ultimos 6 meses
  private _obtenerPersonalRenovacion(data: IPersonalGenerarDeposito[]) {
    var fechaDevenguePersona: Date;
    var fechaDevengueHaceSeisMeses = moment(
      new Date(this.devengueActual.nEjercicio, this.devengueActual.nMes - 1, 1)
    )
      .subtract(6, "month")
      .toDate();
    fechaDevengueHaceSeisMeses = new Date(fechaDevengueHaceSeisMeses);

    const personal: IPersonalGenerarDeposito[] = [];
    data.forEach((persona) => {
      fechaDevenguePersona = new Date(persona.nEjercicio, persona.nMes - 1, 1);
      if (
        persona.nImporte > 0 &&
        ((persona.nIdDP !== 0 &&
          fechaDevenguePersona > fechaDevengueHaceSeisMeses &&
          persona.nIdDevengue !== this.devengueActual.nIdDevengue) ||
          (persona.nIdIncidenciap !== 0 &&
            persona.bTipoInci &&
            persona.nImporteDDP < persona.nImporte))
      ) {
        personal.push(persona);
      }
    });

    this.tablaRenovacionDS = new MatTableDataSource(personal);
    this.tablaRenovacionDS.paginator = this.pagTablaRenovacion;
  }

  private async _guardarPersonalRenovacion() {
    const nIdDP: number = await this._guardarDeposito(1);
    await this._guardarDetalleDeposito(nIdDP, this.tablaRenovacionDS.data);
    await this._guardarHistoricoDeposito(nIdDP);
    await this._tablasServicio();
    this.recargarPadre = true;
    this._swalSucces("Guardado", "Deposito nuevo guardado.");
  }

  //#endregion

  //#region TABLA PERSONAL - INCIERTO
  // Ultimos 6 meses no presenta deposito
  private _obtenerPersonalIncierto(data: IPersonalGenerarDeposito[]) {
    var fechaDevenguePersona: Date;
    var fechaDevengueHaceSeisMeses = moment(
      new Date(this.devengueActual.nEjercicio, this.devengueActual.nMes - 1, 1)
    )
      .subtract(6, "month")
      .toDate();
    fechaDevengueHaceSeisMeses = new Date(fechaDevengueHaceSeisMeses);

    const personal: IPersonalGenerarDeposito[] = [];
    const personalSelect: IPersonalGenerarDepositoInciertoSelect[] = [];
    data.forEach((persona) => {
      fechaDevenguePersona = new Date(persona.nEjercicio, persona.nMes - 1, 1);
      if (
        persona.nImporte > 0 &&
        persona.nIdDP !== 0 &&
        fechaDevenguePersona <= fechaDevengueHaceSeisMeses &&
        persona.nIdIncidenciap === 0
      ) {
        personal.push(persona);
        personalSelect.push({
          nIdPersonal: persona.nIdPersonal,
          nIdPerlab: persona.nIdPerlab,
          sNombres: persona.sNombres,
          sCodPlla: persona.sCodPlla,
          sTipo: persona.sTipo,
          sDscTipo: persona.sDscTipo,
          sDocumento: persona.sDocumento,
          dFechIni: persona.dFechIni,
          dFechFin: persona.dFechFin,
          sCiudad: persona.sCiudad,
          nIdResp: persona.nIdResp,
          nIdCentroCosto: persona.nIdCentroCosto,
          nIdTipoCC: persona.nIdTipoCC,
          nIdOrganizacion: persona.nIdOrganizacion,
          nIdContacto: persona.nIdContacto,
          nIdDP: persona.nIdDP,
          nIdDDP: persona.nIdDDP,
          nIdDevengue: persona.nIdDevengue,
          nEjercicio: persona.nEjercicio,
          nMes: persona.nMes,
          nImporte: persona.nImporte,
          nIdIncidenciap: persona.nIdIncidenciap,
          nIdDevengueInci: persona.nIdDevengueInci,
          bTipoInici: persona.bTipoInci,
          nTipo: new FormControl(null, Validators.required),
        });
      }
    });

    this.tablaInciertoDS = new MatTableDataSource(personal);
    this.tablaInciertoDS.paginator = this.pagTablaIncierto;

    this.tablaInciertoEditarDS = new MatTableDataSource(personalSelect);
    this.tablaInciertoEditarDS.paginator = this.pagTablaInciertoEditar;

    this._desactivarOpcionesSiTieneInciertos();
    this._deshabilitarCampoSelectInciertos();
  }

  private async _descargarTxt() {
    const params = [];

    const nIdEmp = JSON.parse(localStorage.getItem("Empresa"));
    params.push("0¡nIdEmp!" + nIdEmp);
    const infoEmpresa: IInfoEmpresa = await this.servicio._loadSP(15, params);

    console.log(infoEmpresa);

    var codigo: string = moment().format("YYMMDD") + "00";
    var cabecera: string =
      "0" +
      moment().format("YYMMDD") +
      "00" +
      infoEmpresa.sRuc +
      "\t" +
      this._cantidadRegistrosFormatoTxt() +
      "0" +
      moment().format("YYYYMMDD") +
      this._totalImporteRegistrosFormatoTxt();

    this.dyanmicDownloadByHtmlTag({
      fileName: codigo,
      text: this._generarData(cabecera, codigo),
    });
  }

  private dyanmicDownloadByHtmlTag(arg: { fileName: string; text: string }) {
    const element = document.createElement("a");
    const fileType =
      arg.fileName.indexOf(".json") > -1 ? "text/json" : "text/plain";
    element.setAttribute(
      "href",
      `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`
    );
    element.setAttribute("download", arg.fileName);

    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  }

  private _generarData(cabecera: string, codigo: string): string {
    var resp: string = "";
    const data = this.tablaInciertoEditarDS.data;
    if (data.length !== 0) {
      resp = resp + cabecera;
      data.forEach((item) => {
        resp =
          resp +
          "\n" +
          codigo +
          item.sDocumento +
          "\t" +
          this._importeFormatoTxt(item.nImporte);
      });
    }

    return resp;
  }

  private _cantidadRegistrosFormatoTxt() {
    var res = this.tablaInciertoDS.data.length.toString();
    const tamRes = res.length;
    for (let index = tamRes; index < 5; index++) {
      res = "0" + res;
    }
    return res;
  }

  private _importeFormatoTxt(importe: number): string {
    var res = (importe * 100).toString();
    const tamRes = res.length;
    for (let index = tamRes; index < 18; index++) {
      res = "0" + res;
    }
    return res;
  }

  private _totalImporteRegistrosFormatoTxt(): string {
    var data: IPersonalGenerarDeposito[] = this.tablaInciertoDS.data;

    var total = (
      data.reduce((sum, current) => sum + current.nImporte, 0) * 100
    ).toString();

    const tamRes = total.length;
    for (let index = tamRes; index < 18; index++) {
      total = "0" + total;
    }

    return total;
  }

  //#endregion

  //#region TABLA PERSONAL - INCIERTO

  private _validacionTodosCamposSeleccionados(): boolean {
    const data = this.tablaInciertoEditarDS.data;
    const index = data.findIndex((v) => v.nTipo.invalid);
    if (index === -1) return false;

    const pagSize = this.pagTablaInciertoEditar.pageSize;
    var numBloques = Math.ceil((index + 1) / pagSize);

    this.tablaInciertoEditarDS.paginator.firstPage();
    for (let i = 1; i < numBloques; i++) {
      this.tablaInciertoEditarDS.paginator.nextPage();
    }

    return true;
  }

  private async _guardarDepositoIncierto() {
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

    const personal = this.tablaInciertoEditarDS.data;
    const params = [];
    var sParam = "";

    params.push("T1¡nIdDevengue!" + this.devengueActual.nIdDevengue);

    personal.forEach((persona) => {
      sParam = "";
      sParam = sParam + "T1¡nIdPersonal!" + persona.nIdPersonal + "-";
      sParam = sParam + "T1¡bTipo!" + persona.nTipo.value + "-";

      sParam = sParam + "T1¡nIdRegUser!" + uid + "-";
      sParam = sParam + "T1¡dtReg!GETDATE()";
      params.push(sParam);
    });

    await this.servicio._crudCPA(20, params);

    const numNuevos = personal.filter((v) => v.nTipo.value === 0).length;
    const numRenovacion = personal.filter((v) => v.nTipo.value === 1).length;
    this.recargarPadre = true;
    Swal.fire({
      title: "Inciertos guardados",
      text:
        "Se generaron  nuevos (" +
        numNuevos +
        ") y renovaciones (" +
        numRenovacion +
        ")",
      icon: "success",
      confirmButtonText: "Aceptar",
    });
    await this._tablasServicio();
  }

  public async seleccionarTipoIncierto(evento) {
    if (this.desactivarAlerta) return;

    if (evento.value !== this.tipoInciertoSeleccionado) {
      this.tipoInciertoSeleccionado = evento.value;
      this.contadorTipoInciertos = 0;
    } else {
      this.contadorTipoInciertos = this.contadorTipoInciertos + 1;
    }

    if (this.contadorTipoInciertos === 2) {
      const tipo = this.tipoInciertoSeleccionado === 0 ? "Nuevo" : "Renovación";
      const pregunta: string =
        "¿ Deseas seleccionar los demas con " + tipo + " ?";

      if (await this._swalConfirm("Atencion!", pregunta, "Aceptar")) {
        this.seleccionadoLosVaciosDeInciertos(this.tipoInciertoSeleccionado);
      }
      this.contadorTipoInciertos = 0;
    }
  }

  private seleccionadoLosVaciosDeInciertos(tipo: number) {
    const data: IPersonalGenerarDepositoInciertoSelect[] =
      this.tablaInciertoEditarDS.data.map((item) => {
        if (item.nTipo.value === null) {
          item.nTipo.patchValue(tipo);
        }
        return item;
      });
    this.tablaInciertoEditarDS = new MatTableDataSource(data);
    this.tablaInciertoEditarDS.paginator = this.pagTablaInciertoEditar;
    this.desactivarAlerta = true;
  }

  private _deshabilitarCampoSelectInciertos() {
    const data = this.tablaInciertoEditarDS.data.map((item) => {
      item.nTipo.disable();
      return item;
    });
    this.tablaInciertoEditarDS = new MatTableDataSource(data);
    this.tablaInciertoEditarDS.paginator = this.pagTablaInciertoEditar;
  }

  private _habilitarCampoSelectInciertos() {
    const data = this.tablaInciertoEditarDS.data.map((item) => {
      item.nTipo.enable();
      return item;
    });
    this.tablaInciertoEditarDS = new MatTableDataSource(data);
    this.tablaInciertoEditarDS.paginator = this.pagTablaInciertoEditar;
  }

  //#endregion

  //#region MODAL
  public cerrarModal() {
    const oReturn = new Object();
    oReturn["recargar"] = this.recargarPadre;
    this.activeModal.close(oReturn);
  }
  //#endregion

  //#region DEVENGUE ACTUAL
  private async _devengueActualServicio() {
    const params = [];
    params.push("0¡nIdEmp!1");
    params.push("2¡nIdEstado!2");
    this.devengueActual = await this.servicio._loadSP(7, params);
  }

  public nombreDevengueActual(): string {
    return (
      this.meses[this.devengueActual.nMes] +
      " del " +
      this.devengueActual.nEjercicio
    );
  }
  //#endregion

  //#region STEP
  public nombreStep(nombre: string, tabla: MatTableDataSource<any>) {
    return nombre + "   (" + this._cantidadPersonasPorTabla(tabla) + ")";
  }

  public cambioDeStepEstado(index: number) {
    var estado = index;

    this.estadoFb = estado;
    this.animacionFb = "active";

    if (estado === EstadosFb.nuevo) {
      this.opcionesFb = [];
      this.delay(250).then(() => {
        this.opcionesFb = this.stepNuevoFb;
      });
      return;
    }

    if (estado === EstadosFb.renovacion) {
      this.opcionesFb = [];
      this.delay(250).then(() => {
        this.opcionesFb = this.stepRenovacionFb;
      });
      return;
    }

    if (estado === EstadosFb.inciertoDescarga) {
      this.stepperIncierto.reset();
      this.opcionesFb = [];
      this.delay(250).then(() => {
        this.opcionesFb = this.stepInciertoDescargarFb;
      });
      return;
    }
  }

  stepperSeleccionado(evento: StepperSelectionEvent) {
    if (evento.selectedIndex === 0) {
      this.opcionesFb = [];
      this.delay(250).then(() => {
        this.estadoFb = EstadosFb.inciertoDescarga;
        this.opcionesFb = this.stepInciertoDescargarFb;
      });
      return;
    }
    if (evento.selectedIndex === 1) {
      this.opcionesFb = [];
      this.delay(250).then(() => {
        this.estadoFb = EstadosFb.inciertoEditar;
        this.opcionesFb = this.stepInciertoEditarCancelarFb;
      });
      return;
    }
  }

  deshabilitarStepper() {}
  //#endregion

  //#region COMUNES
  private _cantidadPersonasPorTabla(tabla: MatTableDataSource<any>): number {
    return tabla.data.length;
  }

  private _desactivarOpcionesSiTieneInciertos() {
    const disabled = this._cantidadPersonasPorTabla(this.tablaInciertoDS) !== 0;
    this.stepNuevoFb[0].disabled = disabled;
    this.stepRenovacionFb[0].disabled = disabled;
  }

  private _swalSucces(title: string, msg: string) {
    Swal.fire({
      title: title,
      text: msg,
      icon: "success",
      confirmButtonText: "Aceptar",
    });
  }

  private async _swalConfirm(
    title: string,
    msg: string,
    confirmText: string
  ): Promise<boolean> {
    const resp = await Swal.fire({
      title: title,
      text: msg,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ff4081",
      confirmButtonText: confirmText,
      cancelButtonText: "Cancelar",
      allowOutsideClick: false,
    });

    return resp.isConfirmed;
  }

  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }
  //#endregion
}
