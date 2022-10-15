import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { adminpAnimations } from "../../Animations/adminp.animations";
import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import {
  CalendarDateFormatter,
  CalendarEvent,
  CalendarEventAction,
  CalendarView,
  DAYS_OF_WEEK,
} from "angular-calendar";
import moment from "moment";

import {
  IEstadoCombo,
  IInfoPersona,
  IPlanillaCombo,
  IRangoFechasCita,
  IRangoPersonasCantidad,
  ITrabajador,
} from "../../Model/Igestionem";
import { GestionemService } from "../../Services/gestionem.service";
import ComboComando from "./Comandos/ComboComando";
import EstadoComboServicio from "./Comandos/Combos/EstadoComboServicio";
import PlanillaComboServicio from "./Comandos/Combos/PlanillaComboServicio";
import AGeneralServicio from "./Comandos/General/IGeneralServicio";
import EquipoTrabajoActualServicio from "./Comandos/General/EquipoTrabajoActualServicio";
import GeneralComando from "./Comandos/GeneralComando";
import PersonaSesionServicio from "./Comandos/Persona/PersonaSesionServicio";
import PersonaComando from "./Comandos/PersonaComando";
import { GestionemDetailComponent } from "./Modals/gestionem-detail/gestionem-detail.component";
import { GestionemCitasComponent } from "./Modals/gestionem-citas/gestionem-citas.component";
import FabButtonConfig from "./Clases/GestionEM/FabButtonConfig";
import CalendarConfig from "./Clases/GestionEM/CalendarConfig";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: "app-gestionem",
  templateUrl: "./gestionem.component.html",
  styleUrls: ["./gestionem.component.css", "./gestionem.component.scss"],
  providers: [{ provide: CalendarDateFormatter }],
  animations: [adminpAnimations],
})
export class GestionemComponent implements OnInit {
  //#region CALENDARIO
  calendar: CalendarConfig = new CalendarConfig();
  //#endregion

  //#region EQUIPO TRABAJO
  ngbModalOptions: NgbModalOptions = {
    size: "xl",
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: "static",
    windowClass: "modal-holder",
  };

  generalComando: GeneralComando = new GeneralComando();
  equipoTrabajoColumnas: string[] = [
    "action",
    "sNombres",
    "sCodPlla",
    "sTipo",
    "sDocumento",
    "cEleNamEstado",
  ];

  equipoTrabajoData: ITrabajador[] = [];
  equipoTrabajoDataSource = new MatTableDataSource<ITrabajador>(
    this.equipoTrabajoData
  );

  @ViewChild("pagEquipoTrabajo", { static: true })
  pagEquipoTrabajo: MatPaginator;
  //#endregion

  //#region FB
  fabButton: FabButtonConfig = new FabButtonConfig(0, "active");
  //#endregion

  //#region FILTROS
  comboComando: ComboComando = new ComboComando();
  filtroPrincipalForm: FormGroup = this.fb.group({
    sNombreDoc: "",
    sCodPlla: "",
    nEstado: 0,
  });

  estadoDataCombo: IEstadoCombo[] = [];
  planillaDataCombo: IPlanillaCombo[] = [];
  //#endregion

  //#region INFORMACION PERSONA
  personaComando: PersonaComando = new PersonaComando();
  infoPersonaForm: FormGroup = this.fb.group({
    nIdPersonal: 0,
    sNombres: "",
    sTipo: "",
    sDocumento: "",
  });
  //#endregion

  constructor(
    private fb: FormBuilder,
    private service: GestionemService,
    private modalService: NgbModal,
    public spi: NgxSpinnerService
  ) {}

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_main_gestion_em");
    await this._obtenerDataPersona();
    await this._obtenerDataPlanillaCombo();
    await this._obtenerDataEstadoCombo();
    await this._obtenerDataEquipoTrabajo();
    await this._obtenerRangoFechasCitas();
    this.spi.hide("spi_main_gestion_em");
  }

  ngAfterViewInit() {
    this.equipoTrabajoDataSource.paginator = this.pagEquipoTrabajo;
  }

  //#region CALENDARIO

  private async _obtenerRangoFechasCitas(): Promise<void> {
    this.calendar.obtenerRangoFechasCitas(this.service);
  }

  public dayClicked({
    date,
    events,
  }: {
    date: Date;
    events: CalendarEvent[];
  }): void {
    if (events.length <= 0) {
      return;
    }
    this._abrirModalEnBaseTipoDeEvento(events[0]);
  }

  private _abrirModalEnBaseTipoDeEvento(evento: CalendarEvent) {
    const nIdResponsable = this.infoPersonaForm.controls["nIdPersonal"].value;

    if (evento.title === "No Disponible") {
      this._abrirModalGestionCitas(
        0,
        nIdResponsable,
        evento,
        moment(evento.start).format("DD/MM/YYYY"),
        this.calendar.eventMain,
        this.calendar.cantidadPersonasRangoFecha
      );
    }

    if (evento.title === "Lleno") {
      this._abrirModalGestionCitas(
        1,
        nIdResponsable,
        evento,
        moment(evento.start).format("DD/MM/YYYY"),
        [],
        this.calendar.cantidadPersonasRangoFecha
      );
    }

    if (evento.title === "Disponible") {
      this._abrirModalGestionCitas(
        2,
        nIdResponsable,
        evento,
        moment(evento.start).format("DD/MM/YYYY"),
        [],
        this.calendar.cantidadPersonasRangoFecha
      );
    }
  }
  //#endregion

  //#region MODAL
  private _abrirModalGestionCitas(
    estadoModal: number,
    nIdResponsable: string,
    events: CalendarEvent,
    fechaSeleccionada: string,
    eventos: CalendarEvent[],
    mapCantidadPersonasPorDia: {
      [nIdRangoEM: string]: IRangoPersonasCantidad[];
    }
  ) {
    const modal = this.modalService.open(
      GestionemCitasComponent,
      this.ngbModalOptions
    );
    modal.componentInstance.estadoModal = estadoModal;
    modal.componentInstance.idResponsable = nIdResponsable;
    modal.componentInstance.eventoDiaSeleccionado = events;
    modal.componentInstance.fechaSeleccionada = fechaSeleccionada;
    modal.componentInstance.eventosCalendario = eventos;
    modal.componentInstance.mapCantidadPersonasPorDia = mapCantidadPersonasPorDia;

    modal.result.then(
      async (result) => {
        if (result.status) {
          this._obtenerRangoFechasCitas();
        }
      },
      (reason) => {}
    );
  }
  //#endregion

  //#region EQUIPO TRABAJO
  private async _obtenerDataEquipoTrabajo(): Promise<void> {
    var servicio: AGeneralServicio = new EquipoTrabajoActualServicio(
      this.service,
      this.infoPersonaForm.controls["nIdPersonal"].value
    );
    this.generalComando.setServicio(servicio);
    this.equipoTrabajoData = await this.generalComando.ejecutar();

    this.equipoTrabajoDataSource = new MatTableDataSource(
      this.equipoTrabajoData
    );
    this.equipoTrabajoDataSource.paginator = this.pagEquipoTrabajo;
  }

  public verDetalle(item: ITrabajador): void {
    const modalRefImport = this.modalService.open(
      GestionemDetailComponent,
      this.ngbModalOptions
    );
    modalRefImport.componentInstance.infoPersonalData = item;
    modalRefImport.componentInstance.nIdResp = this.infoPersonaForm.controls[
      "nIdPersonal"
    ].value;
  }

  public getDescEstado(item: any): string {
    return "Nombre del estado";
  }
  //#endregion

  //#region FB
  public onToggleFab(): void {
    this.fabButton.cambiarOpcionesMostrarOcultar();
  }

  public clickFab(index: number): void {
    this.fabButton.ejecutar(this, index);
  }

  public agregarCita(): void {
    const nIdResponsable = this.infoPersonaForm.controls["nIdPersonal"].value;
    this._abrirModalGestionCitas(
      3,
      nIdResponsable,
      null,
      null,
      this.calendar.eventMain,
      this.calendar.cantidadPersonasRangoFecha
    );
  }
  //#endregion

  //#region DATA INFORMACION PERSONA
  private async _obtenerDataPersona() {
    this.personaComando.setServicio(new PersonaSesionServicio(this.service));
    const res: IInfoPersona = await this.personaComando.ejecutar();
    this._cargarDataInfoPersonaForm(res);
  }

  private _cargarDataInfoPersonaForm(data: IInfoPersona) {
    this.infoPersonaForm.patchValue({
      nIdPersonal: data.nIdPersonal,
      sNombres: data.sNombres,
      sTipo: data.sTipo,
      sDocumento: data.sDocumento,
    });
  }
  //#endregion

  //#region FILTROS
  private async _obtenerDataPlanillaCombo() {
    this.comboComando.setServicio(new PlanillaComboServicio(this.service));
    this.planillaDataCombo = await this.comboComando.ejecutar();
  }

  private async _obtenerDataEstadoCombo() {
    this.comboComando.setServicio(new EstadoComboServicio(this.service));
    this.estadoDataCombo = await this.comboComando.ejecutar();
  }

  public filtrarEquipoTrabajoData(): void {
    this.equipoTrabajoDataSource.filterPredicate = ((
      data: ITrabajador,
      filter: any
    ) => {
      // tslint:disable-next-line: max-line-length
      // Filtrando por nombre o numero de documento
      const a =
        !filter.sNombreDoc ||
        data.sNombres.toLowerCase().includes(filter.sNombreDoc.toLowerCase()) ||
        data.sDocumento.toLowerCase().includes(filter.sNombreDoc.toLowerCase());

      // Filtrando por planilla
      const b =
        !filter.sCodPlla ||
        data.sCodPlla.toLowerCase().includes(filter.sCodPlla.toLowerCase());

      // Filtrando por estado
      const c = !filter.nEstado || data.nEleCodEstado === filter.nEstado;

      return a && b && c;
    }) as (ITrabajador, string) => boolean;

    this.equipoTrabajoDataSource.filter = this.filtroPrincipalForm.value;

    if (this.equipoTrabajoDataSource.paginator) {
      this.equipoTrabajoDataSource.paginator.firstPage();
    }
  }
  //#endregion
}
