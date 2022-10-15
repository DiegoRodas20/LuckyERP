import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDatepicker } from "@angular/material/datepicker";
import { MatPaginator } from "@angular/material/paginator";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";

import { adminpAnimations } from "../../Animations/adminp.animations";
import {
  HistoricoDepositoDetallePersonal,
  IDepositoProvis,
  IDevengueCombo,
  IEstadoCombo,
  IPersonalDetalleDeposito,
  IPlanilla,
  IPlanillaCombo,
  ITipoCombo,
} from "../../Model/Icontrolpa";
import { ControlpaService } from "../../Services/controlpa.service";
import { ControlpaDepositoComponent } from "./Modals/controlpa-deposito/controlpa-deposito.component";
import { ControlpaDetailComponent } from "./Modals/controlpa-detail/controlpa-detail.component";
import { ControlpaDetailpComponent } from "./Modals/controlpa-detailp/controlpa-detailp.component";

@Component({
  selector: "app-controlpa",
  templateUrl: "./controlpa.component.html",
  styleUrls: ["./controlpa.component.css", "./controlpa.component.scss"],
  animations: [adminpAnimations],
})
export class ControlpaComponent implements OnInit {
  //#region FB
  private _animacionFb: string = "inactive";
  private _opcionesFb: any[] = [];
  private _generarDepositoFb: any[] = [
    {
      icon: "savings",
      tool: "Generar depósito",
    },
  ];

  public get opcionesFb(): any[] {
    return this._opcionesFb;
  }
  public set opcionesFb(value: any[]) {
    this._opcionesFb = value;
  }

  public get animacionFb(): string {
    return this._animacionFb;
  }
  public set animacionFb(value: string) {
    this._animacionFb = value;
  }

  public get generarDepositoFb(): any[] {
    return this._generarDepositoFb;
  }
  public set generarDepositoFb(value: any[]) {
    this._generarDepositoFb = value;
  }
  //#endregion

  //#region PLANILLA SELECCION
  private _comboPlanillaSeleccion: IPlanilla[] = [];

  public get comboPlanillaSeleccion(): IPlanilla[] {
    return this._comboPlanillaSeleccion;
  }
  public set comboPlanillaSeleccion(value: IPlanilla[]) {
    this._comboPlanillaSeleccion = value;
  }
  //#endregion

  //#region FILTRO
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

  private _devengueCombo: IDevengueCombo[] = [];
  private _planillaCombo: IPlanillaCombo[] = [];
  private _tipoCombo: ITipoCombo[] = [];
  private _estadoCombo: IEstadoCombo[] = [];

  private _filtro: FormGroup = this.formBuilder.group({
    nombreDoc: null,
    planilla: null,
    devengue: null,
    tipo: null,
    estado: null,
  });

  public get filtro(): FormGroup {
    return this._filtro;
  }
  public set filtro(value: FormGroup) {
    this._filtro = value;
  }

  public get devengueCombo(): IDevengueCombo[] {
    return this._devengueCombo;
  }
  public set devengueCombo(value: IDevengueCombo[]) {
    this._devengueCombo = value;
  }
  public get planillaCombo(): IPlanillaCombo[] {
    return this._planillaCombo;
  }
  public set planillaCombo(value: IPlanillaCombo[]) {
    this._planillaCombo = value;
  }

  public get tipoCombo(): ITipoCombo[] {
    return this._tipoCombo;
  }
  public set tipoCombo(value: ITipoCombo[]) {
    this._tipoCombo = value;
  }
  public get estadoCombo(): IEstadoCombo[] {
    return this._estadoCombo;
  }
  public set estadoCombo(value: IEstadoCombo[]) {
    this._estadoCombo = value;
  }

  //#endregion

  //#region TABLA DEPOSITOS
  expandedMore: IDepositoProvis | null;

  private _tablaDC = [
    "action",
    "devengue",
    "planilla",
    "tipo",
    "fechaHora",
    "usuario",
    "total",
    "estado",
    "more",
  ];
  private _tablaDS: MatTableDataSource<IDepositoProvis> =
    new MatTableDataSource<IDepositoProvis>([]);
  @ViewChild("pagTabla", { static: true })
  private _pagTabla: MatPaginator;

  public get tablaDC() {
    return this._tablaDC;
  }
  public set tablaDC(value) {
    this._tablaDC = value;
  }
  public get tablaDS() {
    return this._tablaDS;
  }
  public set tablaDS(value) {
    this._tablaDS = value;
  }
  public get pagTabla(): MatPaginator {
    return this._pagTabla;
  }
  public set pagTabla(value: MatPaginator) {
    this._pagTabla = value;
  }
  //#endregion

  //#region SUBTABLA
  @ViewChild("mtExpanded", { static: false })
  mtExpanded: MatTable<IPersonalDetalleDeposito>;
  private _subTablaDC = [
    "action",
    "sNombres",
    "planilla",
    "tipo",
    "documento",
    "ingreso",
    "cese",
    "importe",
  ];
  private _subTablaDS: MatTableDataSource<IPersonalDetalleDeposito> =
    new MatTableDataSource<IPersonalDetalleDeposito>([]);
  @ViewChild("pagSubTabla", { static: false })
  private _pagSubTabla: MatPaginator;

  public get subTablaDC() {
    return this._subTablaDC;
  }
  public set subTablaDC(value) {
    this._subTablaDC = value;
  }
  public get subTablaDS(): MatTableDataSource<IPersonalDetalleDeposito> {
    return this._subTablaDS;
  }
  public set subTablaDS(value: MatTableDataSource<IPersonalDetalleDeposito>) {
    this._subTablaDS = value;
  }
  public get pagSubTabla(): MatPaginator {
    return this._pagSubTabla;
  }
  public set pagSubTabla(value: MatPaginator) {
    this._pagSubTabla = value;
  }
  //#endregion

  //#region MODAL
  private _ngbModalOptionsDetalleDeposito: NgbModalOptions = {
    size: "xl",
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: "static",
    windowClass: "modal-holder",
  };
  public get ngbModalOptionsDetalleDeposito(): NgbModalOptions {
    return this._ngbModalOptionsDetalleDeposito;
  }
  public set ngbModalOptionsDetalleDeposito(value: NgbModalOptions) {
    this._ngbModalOptionsDetalleDeposito = value;
  }

  private _ngbModalOptionsDetallePersonal: NgbModalOptions = {
    size: "xl",
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: "static",
    windowClass: "modal-holder",
  };
  public get ngbModalOptionsDetallePersonal(): NgbModalOptions {
    return this._ngbModalOptionsDetallePersonal;
  }
  public set ngbModalOptionsDetallePersonal(value: NgbModalOptions) {
    this._ngbModalOptionsDetallePersonal = value;
  }

  //#endregion

  constructor(
    private formBuilder: FormBuilder,
    private servicio: ControlpaService,
    private spi: NgxSpinnerService,
    private modalService: NgbModal
  ) {}

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_main_controlpa");
    await this._devengueComboServicio();
    await this._planillaComboServicio();
    await this._tipoComboServicio();
    await this._estadoComboServicio();

    await this._comboPlanillaSeleccionServicio();

    await this._tablaServicio();
    this.spi.hide("spi_main_controlpa");
  }

  //#region FB
  public clickGrupoFb() {
    if (this.animacionFb === "inactive") {
      this.animacionFb = "active";
      this.opcionesFb = this.generarDepositoFb;
    } else {
      this.animacionFb = "inactive";
      this.opcionesFb = [];
    }
  }

  public clickOpcionFb(indice: number) {
    if (indice === 0) {
      this._seleccionarPlanillaSwal();
    }
  }
  //#endregion

  //#region PLANILLA SELECCION
  private async _comboPlanillaSeleccionServicio() {
    const params = [];
    params.push("0¡PLLA.nIdEmp!1");
    params.push("0¡PLLA.bEstado!1");
    params.push("1¡PLLA.sCodPlla!1,2,7");
    this.comboPlanillaSeleccion = await this.servicio._loadSP(2, params);
  }

  private _seleccionarPlanillaSwal() {
    Swal.fire({
      title: "Planilla",
      icon: "info",
      text: "Seleccione la planilla con la cual se generara el deposito.",
      input: "select",
      inputOptions: this._generandoInputSwalConPlanillas(),
      inputPlaceholder: "Seleccionar",
      showCancelButton: true,
      confirmButtonText: "Seleccionar",
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (value === undefined || value === "") {
          return "Selección no válida.";
        }
      },
    }).then(async (resultado) => {
      if (resultado.isConfirmed) {
        const planilla: IPlanilla = this._obtenerPlanillaPorId(
          +resultado.value
        );
        this._abrirModalGenerarDeposito(planilla);
      }
    });
  }

  private _generandoInputSwalConPlanillas(): any {
    const map = {};

    this.comboPlanillaSeleccion.forEach((planilla) => {
      map[planilla.nIdPlla] = planilla.sCodPlla + " - " + planilla.sDesc;
    });

    return map;
  }

  private _obtenerPlanillaPorId(nIdPlla: number): IPlanilla {
    return this.comboPlanillaSeleccion.find((v) => v.nIdPlla === nIdPlla);
  }
  //#endregion

  //#region FILTRO
  private async _devengueComboServicio() {
    const params = [];
    params.push("0¡nIdEmp!1");
    this.devengueCombo = await this.servicio._loadSP(1, params);
  }

  private async _planillaComboServicio() {
    const params = [];
    params.push("0¡PLLA.nIdEmp!1");
    params.push("0¡PLLA.bEstado!1");
    this.planillaCombo = await this.servicio._loadSP(2, params);
  }

  private async _tipoComboServicio() {
    this.tipoCombo = [
      {
        nIdTipEle: 1,
        sDesc: "Nuevo",
      },
      {
        nIdTipEle: 2,
        sDesc: "Renovacion",
      },
    ];
  }

  private async _estadoComboServicio() {
    const params = [];
    params.push("0¡nEleCodDad!2356");
    params.push("0¡bStatus!1");
    this.estadoCombo = await this.servicio._loadSP(8, params);
  }

  public filtrar() {
    this.tablaDS.filterPredicate = ((data: IDepositoProvis, filter: any) => {
      const a = !filter.planilla || data.nIdPlla === filter.planilla;
      const b =
        !filter.devengue || this._filtroPorDevengue(data, filter.devengue);
      const c =
        !filter.nombreDoc ||
        this._filtroNombreUsuarioNombrePersonal(filter.nombreDoc, data);
      const d =
        !filter.tipo || this._filtroTipoDeposito(filter.tipo === 2, data);
      const e = !filter.estado || this._filtroEstado(filter.estado, data);

      return a && b && c && d && e;
    }) as (IDepositoProvis, string) => boolean;

    this.tablaDS.filter = this.filtro.value;

    if (this.tablaDS.paginator) {
      this.tablaDS.paginator.firstPage();
    }

    //---------------------------------------

    this.subTablaDS.filterPredicate = ((
      data: IPersonalDetalleDeposito,
      filter: any
    ) => {
      const a =
        !filter.nombreDoc ||
        data.sNombres.toLocaleLowerCase().includes(filter.nombreDoc) ||
        data.sDocumento.toLocaleLowerCase().includes(filter.nombreDoc);

      return a;
    }) as (IPersonalDetalleDeposito, string) => boolean;

    this.subTablaDS.filter = this.filtro.value;

    if (this.subTablaDS.paginator) {
      this.subTablaDS.paginator.firstPage();
    }
  }

  private _filtroNombreUsuarioNombrePersonal(
    val: string,
    data: IDepositoProvis
  ): boolean {
    val = val.toLocaleLowerCase();
    return data.personal.some(
      (p) =>
        p.sNombres.toLocaleLowerCase().includes(val) ||
        p.sDocumento.toLocaleLowerCase().includes(val)
    ) /*||
      data.sNombresUser.toLocaleLowerCase().includes(val)*/;
  }

  private _filtroTipoDeposito(val: boolean, data: IDepositoProvis): boolean {
    return data.bTipoDeposito === val;
  }

  private _filtroEstado(val: number, data: IDepositoProvis) {
    return data.nIdEstadoDeposito === val;
  }

  private _filtroPorDevengue(data: IDepositoProvis, fecha: Date) {
    return (
      data.nEjercicio === fecha.getFullYear() &&
      data.nMes === fecha.getMonth() + 1
    );
  }

  public nombreDelDevengueComboFiltro(devengue: IDevengueCombo): string {
    return this.meses[devengue.nMes] + " del " + devengue.nEjercicio;
  }

  public limpiarNombreDocIngresado() {
    this.filtro.controls["nombreDoc"].patchValue(null);
    this.filtrar();
  }

  public limpiarFechaDevengue() {
    if (this.filtro.controls["devengue"].value === null) {
      this.filtrar();
    }
  }

  public chosenMonthHandler(
    normalizedMonth: any,
    datepicker: MatDatepicker<any>
  ) {
    this.filtro.controls["devengue"].patchValue(new Date(normalizedMonth));
    datepicker.close();
    this.filtrar();
  }
  //#endregion

  //#region TABLA DEPOSITOS
  private async _tablaServicio() {
    const params = [];
    const data: HistoricoDepositoDetallePersonal[] =
      await this.servicio._loadSP(9, params);

    const resp = this._obtenerDataDepositosProvis(data);
    this.tablaDS = new MatTableDataSource(resp);
    this.tablaDS.paginator = this.pagTabla;
  }

  private _obtenerDataDepositosProvis(
    data: HistoricoDepositoDetallePersonal[]
  ): IDepositoProvis[] {
    var depositos: IDepositoProvis[] = [];

    data.forEach((item) => {
      var deposito: IDepositoProvis = {
        nIdDP: item.nIdDP,
        nIdDDP: item.nIdDDP,
        nIdPersonalUser: item.nIdPersonalUser,
        sNombresUser: item.sNombresUser,
        bTipoDeposito: item.bTipoDeposito,
        dtRegDeposito: item.dtRegDeposito,
        nIdEstadoDeposito: item.nIdEstadoDeposito,
        sEstadoDeposito: item.sEstadoDeposito,
        nIdDevengue: item.nIdDevengue,
        nMes: item.nMes,
        nEjercicio: item.nEjercicio,
        nIdPlla: item.nIdPlla,
        sCodPlla: item.sCodPlla,
        sDescPlla: item.sDescPlla,
        nTotal: 0,
        personal: [],
      };

      if (!depositos.some((v) => v.nIdDP === item.nIdDP)) {
        var personal: IPersonalDetalleDeposito[] =
          this._obtenerDataPersonalDeposito(item.nIdDP, data);
        deposito.nTotal = personal.reduce(
          (sum, item) => sum + item.nImporte,
          0
        );
        deposito.personal = personal;
        depositos.push(deposito);
      }
    });

    depositos = depositos.sort((a, b) =>
      new Date(a.nEjercicio, a.nMes - 1, 1) >
      new Date(b.nEjercicio, b.nMes - 1, 1)
        ? -1
        : 1
    );

    return depositos;
  }

  private _obtenerDataPersonalDeposito(
    nIdDP: number,
    data: HistoricoDepositoDetallePersonal[]
  ): IPersonalDetalleDeposito[] {
    var personas: IPersonalDetalleDeposito[] = [];
    data.forEach((item) => {
      if (item.nIdDP === nIdDP) {
        var persona: IPersonalDetalleDeposito = {
          nIdDP: item.nIdDP,
          nIdDDP: item.nIdDDP,
          nIdPersonal: item.nIdPersonal,
          sNombres: item.sNombres,
          sCodPlla: item.sCodPlla,
          dFechIni: item.dFechIni,
          dFechFin: item.dFechFin,
          nImporte: item.nImporte,
          sDocumento: item.sDocumento,
          sDscTipo: item.sDscTipo,
          sTipoDoc: item.sTipo,
          sFileSustento: item.sFileSustento,
        };
        personas.push(persona);
      }
    });
    return personas;
  }

  public mostrarDevengueTabla(historico: IDepositoProvis): string {
    return this.meses[historico.nMes] + " del " + historico.nEjercicio;
  }

  public abrirModalVerDatalle(item: IDepositoProvis) {
    const modal = this.modalService.open(
      ControlpaDetailComponent,
      this.ngbModalOptionsDetalleDeposito
    );
    modal.componentInstance.nIdDP = item.nIdDP;
    modal.componentInstance.personal = item.personal;

    modal.result.then(async (result) => {
      if (result.recargar) {
        this._tablaServicio();
      }
    });
  }
  //#endregion

  //#region SUBTABLA
  public async clickExpanded(item: IDepositoProvis) {
    this.expandedMore = this.expandedMore === item ? null : item;

    if (this.expandedMore !== null) {
      this.subTablaDS = new MatTableDataSource(item.personal);
      this.subTablaDS.paginator = this.pagSubTabla;
      this.mtExpanded.renderRows();
      this.filtrar();
    }
  }

  public abrirModalDetallePersonal(personal: IPersonalDetalleDeposito) {
    const modal = this.modalService.open(
      ControlpaDetailpComponent,
      this.ngbModalOptionsDetallePersonal
    );

    modal.componentInstance.nIdPersonal = personal.nIdPersonal;
    modal.componentInstance.nIdDp = personal.nIdDP;
  }
  //#endregion

  //#region MODAL
  private _abrirModalGenerarDeposito(planilla: IPlanilla) {
    const modal = this.modalService.open(
      ControlpaDepositoComponent,
      this.ngbModalOptionsDetalleDeposito
    );
    modal.componentInstance.planilla = planilla;

    modal.result.then(async (result) => {
      if (result.recargar) {
        this._tablaServicio();
      }
    });
  }
  //#endregion
}
