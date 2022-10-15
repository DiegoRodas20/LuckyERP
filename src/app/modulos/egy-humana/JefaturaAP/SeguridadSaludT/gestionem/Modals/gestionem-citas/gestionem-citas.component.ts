import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import {
  CalendarDateFormatter,
  CalendarEvent,
  CalendarView,
  DAYS_OF_WEEK,
} from "angular-calendar";
import { Subject } from "rxjs";
import Swal from "sweetalert2";
import moment from "moment";

import { adminpAnimations } from "../../../../Animations/adminp.animations";
import PersonaComando from "../../Comandos/PersonaComando";
import BuscadorPersonaCitaMedica from "../../Comandos/Persona/BuscadorPersonaCitaMedica";
import { GestionemService } from "../../../../Services/gestionem.service";
import {
  IBuscadorPersonaCitaMedica,
  IPersonaAsignadaCitaMedica,
  IRangoPersonasCantidad,
} from "../../../../Model/Igestionem";
import PersonasAsignadasCitaMedica from "../../Comandos/Persona/PersonasAsignadasCitaMedica";
import GeneralComando from "../../Comandos/GeneralComando";
import GuardarCitaMedicaServicio from "../../Comandos/General/GuardarCitaMedicaServicio";
import EliminarCitaMedicaServicio from "../../Comandos/General/EliminarCitaMedicaServicio";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import fabButtonConfig from "../../Clases/GestionEmCitas/FabButtonConfig";
import CalendarConfig from "../../Clases/GestionEmCitas/CalendarConfig";
import AgregarPersonaCita from "../../Clases/GestionEmCitas/AgregarPersonaCita";
import EliminarPersonaCita from "../../Clases/GestionEmCitas/EliminarPersonaCita";
import CalcularCambiosCalendarioPorDia from "../../Clases/GestionEmCitas/CalcularCambiosCalendarioPorDia";
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import FabButtonBuscadorConfig from "../../Clases/GestionEmCitas/FabButtonBuscadorConfig";
import FiltroPersonasAsignadas from "../../Clases/GestionEmCitas/FiltroPersonasAsignadas";
import { NgxSpinnerService } from "ngx-spinner";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-gestionem-citas",
  templateUrl: "./gestionem-citas.component.html",
  styleUrls: [
    "./gestionem-citas.component.css",
    "./gestionem-citas.component.scss",
  ],
  providers: [{ provide: CalendarDateFormatter }],
  animations: [adminpAnimations],
})
export class GestionemCitasComponent implements OnInit {
  //#region INPUT
  @Input() estadoModal: number;
  @Input() idResponsable: string = "";
  @Input() eventoDiaSeleccionado: CalendarEvent;
  @Input() fechaSeleccionada: string = null;
  @Input() eventosCalendario: CalendarEvent[] = [];
  @Input() mapCantidadPersonasPorDia: {
    [nIdRangoEM: string]: IRangoPersonasCantidad[];
  };
  //#endregion

  //#region GENERAL
  deshabilitarBtnEliminar: boolean = false;
  controlPanelExpanded: boolean;
  personaComando: PersonaComando = new PersonaComando();
  //#endregion

  //#region CALENDARIO
  calendar: CalendarConfig = new CalendarConfig();
  //#endregion

  //#region FB
  fbButton: fabButtonConfig = new fabButtonConfig(0, "active");
  generalComando: GeneralComando = new GeneralComando();
  //#endregion

  //#region MODAL
  pbDetail = false;
  //#endregion

  //#region LISTA PERSONAS ASIGNADAS
  listaDeEliminados: IPersonaAsignadaCitaMedica[] = [];
  filtroPersonasAsignadas: FiltroPersonasAsignadas =
    new FiltroPersonasAsignadas(this, this.fb);
  personaSeleccionadaAgregar: IPersonaAsignadaCitaMedica;
  historialExamenMedicoColumnas: string[] = [
    "foto",
    "sNombres",
    "sCodPlla",
    "sAbrev",
    "sDocumento",
    "eliminar",
  ];

  historialExamenMedicoDataSource =
    new MatTableDataSource<IPersonaAsignadaCitaMedica>([]);

  @ViewChild("pagHistorialExamenMedico", { static: true })
  pagHistorialExamenMedico: MatPaginator;
  //#endregion

  //#region BUSCADOR
  fabButtonBuscadorConfig: FabButtonBuscadorConfig =
    new FabButtonBuscadorConfig();
  buscarPersonaFormControl = new FormControl();
  buscadorData: IBuscadorPersonaCitaMedica[] = [];
  valoresFiltradosBuscador: Observable<IBuscadorPersonaCitaMedica[]>;

  personaSeleccionadaForm = this.fb.group({
    nIdPersonal: 0,
    nIdPerLab: 0,
    sNombres: [{ value: "", disabled: true }],
    sCiudad: [{ value: "", disabled: true }],
    sCodPlla: [{ value: "?", disabled: true }],
    sTipo: [{ value: "", disabled: true }],
    sDocumento: [{ value: "", disabled: true }],
    dFechIni: null,
    dFechFin: null,
    dFechIniEm: null,
    dFechFinEm: null,
    nIdCitaEM: 0,
    nIdExamenM: 0,
    nEleCodEstado: 0,
    cEleNamEstado: [{ value: "", disabled: true }],
  });
  //#endregion

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private service: GestionemService,
    public spi: NgxSpinnerService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_modal_gem_citas");
    this.configuracionModal();
    await this._initFiltroBuscador();
    this.spi.hide("spi_modal_gem_citas");
  }

  ngAfterViewInit() {
    this.historialExamenMedicoDataSource.paginator =
      this.pagHistorialExamenMedico;
  }
  //#region GENERAL
  public configuracionModal(): void {
    switch (this.estadoModal) {
      case 0:
        this._configuracionDiaNoEditable();
        break;
      case 1:
        this._configuracionDiaLleno();
        break;
      case 2:
        this._configuracionDiaDisponible();
        break;
      case 3:
        this._configuracionCalendarioSinSeleccionar();
        break;
      default:
        break;
    }
  }

  private _configuracionDiaNoEditable() {
    this.fbButton.verOpcionesDiaNoEditable();
    this.buscarPersonaFormControl.disable();
    this.controlPanelExpanded = false;
    this.deshabilitarBtnEliminar = true;
    this.calendar.eventMain = this.eventosCalendario;
    this.obtenerListaPersonasAsignadasData(
      +this.eventoDiaSeleccionado.id,
      this.eventoDiaSeleccionado.start
    );
  }

  private _configuracionDiaLleno() {
    this.fbButton.verOpcionesEditarDiaLleno();
    this.buscarPersonaFormControl.disable();
    this.controlPanelExpanded = true;
    this.deshabilitarBtnEliminar = true;
    this.obtenerListaPersonasAsignadasData(
      +this.eventoDiaSeleccionado.id,
      this.eventoDiaSeleccionado.start
    );
  }

  private _configuracionDiaDisponible() {
    this.fbButton.verOpcionesEditarDiaDisponible();
    this.controlPanelExpanded = true;
    this.deshabilitarBtnEliminar = true;
    this.buscarPersonaFormControl.disable();
    this.obtenerListaPersonasAsignadasData(
      +this.eventoDiaSeleccionado.id,
      this.eventoDiaSeleccionado.start
    );
  }

  private _configuracionCalendarioSinSeleccionar() {
    this.fbButton.verOpcionesCalendarioSinSeleccionarDia();
    this.controlPanelExpanded = false;
    this.calendar.eventMain = this.eventosCalendario;
  }

  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }
  //#endregion

  //#region CALENDARIO
  public diaSeleccionadoCalendario({
    date,
    events,
  }: {
    date: Date;
    events: CalendarEvent[];
  }): void {
    if (events.length <= 0) return;
    this.eventoDiaSeleccionado = events[0];

    this._cambiarOpcionesFabPorDiaTipoDeEvento(events);
    this.fechaSeleccionada = moment(date).format("DD/MM/YYYY");

    this.deshabilitarBtnEliminar = true;
    this.obtenerListaPersonasAsignadasData(+events[0].id, date);
  }

  private _cambiarOpcionesFabPorDiaTipoDeEvento(events: CalendarEvent[]) {
    if (events[0].title === "No Disponible") {
      this.fbButton.verOpcionesDiaNoEditableCalendario();
    }

    if (events[0].title === "Disponible") {
      this.fbButton.verOpcionesEditarDiaDisponibleCalendario();
    }

    if (events[0].title === "Lleno") {
      this.fbButton.verOpcionesEditarDiaLlenoCalendario();
    }
  }

  public recalcularEventosCalendario() {
    var calc = new CalcularCambiosCalendarioPorDia();
    calc.ejecutar(
      this.eventoDiaSeleccionado,
      this.historialExamenMedicoDataSource.data,
      this.eventosCalendario,
      this.mapCantidadPersonasPorDia
    );
    this.cargarDataTablaPersonasAsignadas(calc.listaPersonas);
    this.eventosCalendario = calc.eventosCalendario;
    this.calendar.eventMain = calc.eventosCalendario;
    this.mapCantidadPersonasPorDia = calc.mapCantidadPersonasPorDia;
    this.eventoDiaSeleccionado = calc.eventoSeleccionado;
  }

  //#endregion

  //#region BUSCADOR

  public clickResp(index: number) {
    this.fabButtonBuscadorConfig.ejecutarOpciones(this, index);
  }

  private async _initFiltroBuscador() {
    if (this.estadoModal !== 3) {
      await this._cargarDataBuscador();
    }
    this._escucharCambiosEnElBuscador();
  }

  private _escucharCambiosEnElBuscador() {
    this.valoresFiltradosBuscador =
      this.buscarPersonaFormControl.valueChanges.pipe(
        startWith(""),
        map((value) => this._filtrarBuscador(value))
      );
  }

  private _filtrarBuscador(entrada: any): IBuscadorPersonaCitaMedica[] {
    if (entrada !== null && entrada.sNombres !== undefined) return;

    const valor = entrada?.toLocaleLowerCase();
    return this.buscadorData.filter(
      (item) =>
        item.sNombres.toLowerCase().indexOf(valor) === 0 &&
        this._seEncuentraDentroDeLaTabla(item)
    );
  }

  private _seEncuentraDentroDeLaTabla(persona: IBuscadorPersonaCitaMedica) {
    const data = this.historialExamenMedicoDataSource.data;
    const res = data.find((item) => item.nIdPerlab === persona.nIdPerLab);
    return res === undefined;
  }

  public async _cargarDataBuscador() {
    this.personaComando.setServicio(
      new BuscadorPersonaCitaMedica(
        this.service,
        this.idResponsable,
        +this.eventoDiaSeleccionado.id
      )
    );
    this.buscadorData = await this.personaComando.ejecutar();
    this._escucharCambiosEnElBuscador();
  }

  public _personaSeleccionadaBuscador(data: MatAutocompleteSelectedEvent) {
    this.fabButtonBuscadorConfig.mostrarOpciones();
    var personaSeleccionada: IBuscadorPersonaCitaMedica = data.option.value;
    var persona: IBuscadorPersonaCitaMedica = personaSeleccionada;
    data.option.value;
    this.personaSeleccionadaAgregar = {
      nIdExamenM: personaSeleccionada.nIdExamenM,
      nIdPerlab: personaSeleccionada.nIdPerLab,
      nIdCitaEM: 0,
      sNombres: personaSeleccionada.sNombres,
      sCodPlla: personaSeleccionada.sCodPlla,
      sDocumento: personaSeleccionada.sDocumento,
      sAbrev: personaSeleccionada.sTipo,
      nIdTipoDoc: 0,
      eliminado: false,
    };
    this.personaSeleccionadaForm.patchValue({
      nIdPersonal: persona.nIdPersonal,
      nIdPerLab: persona.nIdPerLab,
      sNombres: persona.sNombres,
      sCiudad: persona.sCiudad,
      sCodPlla: persona.sCodPlla,
      sTipo: persona.sDscTipo,
      sDocumento: persona.sDocumento,
      dFechIni: persona.dFechIni,
      dFechFin: persona.dFechFin,
      dFechIniEm: persona.dFechIniEm,
      dFechFinEm: persona.dFechFinEm,
      nIdCitaEM: persona.nIdCitaEM,
      nIdExamenM: persona.nIdExamenM,
      nEleCodEstado: persona.nEleCodEstado,
      cEleNamEstado: persona.cEleNamEstado,
    });
  }

  public limpiarPersonaAsignada() {
    this.personaSeleccionadaForm.reset();
    this.personaSeleccionadaForm.patchValue({
      sCodPlla: "?",
    });
    this.fabButtonBuscadorConfig.ocultarOpciones();
    this.buscarPersonaFormControl.setValue("");
  }

  getOptionText(option) {
    if (option === null) return null;
    return option.sNombres;
  }
  //#endregion

  //#region FB
  public onToggleFab(): void {
    this.fbButton.cambiarOpcionesMostrarOcultar(this.fechaSeleccionada);
  }

  public clickFab(index: number): void {
    this.fbButton.ejecutar(this, index);
  }

  public async guardarFbAccion(): Promise<boolean> {
    const data = this.historialExamenMedicoDataSource.data;
    var accion = false;

    await Swal.fire({
      title: "¿ Guardar ?",
      text: "Se agregaran estas personas a la cita",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ff4081",
      confirmButtonText: "Confirmar !",
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        accion = true;
        this.generalComando.setServicio(
          new GuardarCitaMedicaServicio(
            this.service,
            data,
            this.eventoDiaSeleccionado
          )
        );
        this.spi.show("spi_modal_gem_citas");
        await this.generalComando.ejecutar();
        this.spi.hide("spi_modal_gem_citas");
        this.listaDeEliminados = [];
        Swal.fire({
          title: "Guardado",
          text: "Citas registradas.",
          icon: "success",
        });
      }
    });
    return accion;
  }

  public cancelarfbAccion() {
    this.controlPanelExpanded = false;
  }

  public editarFbAccion() {
    this.fbButton.estadoFb = 0;
    this.controlPanelExpanded = true;
    this.fbButton.fbAnimacion = "active";

    this.fbButton.fbOpcionesActivas = [];
    this.delay(250).then((any) => {
      this.fbButton.fbOpcionesActivas = this.fbButton.fbPrimeraOpcion;
    });
  }
  //#endregion

  //#region MODAL
  public closeModal() {
    this.volverAgregarLasPersonasEliminadas();
    if (this.eventoDiaSeleccionado !== null) this.recalcularEventosCalendario();
    const oReturn = new Object();
    oReturn["status"] = true;
    oReturn["eventMain"] = this.calendar.eventMain;
    oReturn["cantidadPersonasRangoFecha"] = this.mapCantidadPersonasPorDia;
    this.activeModal.close(oReturn);
  }

  //#endregion

  //#region  LISTA PERSONAS ASIGNADAS
  public async obtenerListaPersonasAsignadasData(
    nIdRangoEM: number,
    diaSeleccionado: Date
  ) {
    this.personaComando.setServicio(
      new PersonasAsignadasCitaMedica(this.service, nIdRangoEM, diaSeleccionado)
    );

    const data = await this.personaComando.ejecutar();
    this.cargarDataTablaPersonasAsignadas(data);
  }

  //#region AGREGAR PERSONA A LA TABLA
  public agregarPersonaALaTabla() {
    this.personaSeleccionadaForm.reset();
    this.personaSeleccionadaForm.patchValue({
      sCodPlla: "?",
    });
    this.fabButtonBuscadorConfig.ocultarOpciones();

    var data = this.historialExamenMedicoDataSource.data;
    var agregarPersonaCita: AgregarPersonaCita = new AgregarPersonaCita();
    agregarPersonaCita.config(
      this.estadoModal,
      +this.eventoDiaSeleccionado.id,
      this.eventoDiaSeleccionado.start,
      data,
      this.eventosCalendario,
      this.mapCantidadPersonasPorDia
    );

    const res = agregarPersonaCita.agregar(this.personaSeleccionadaAgregar);
    if (res) this._configuracionDiaAcabaSerLlenado();
    this.cargarDataTablaPersonasAsignadas(agregarPersonaCita.listaPersonas);
    this.eventosCalendario = agregarPersonaCita.eventosCalendario;
    this.calendar.eventMain = agregarPersonaCita.eventosCalendario;
    this.mapCantidadPersonasPorDia =
      agregarPersonaCita.mapCantidadPersonasPorDia;

    this.buscarPersonaFormControl.setValue("");
  }

  private _configuracionDiaAcabaSerLlenado() {
    this.buscarPersonaFormControl.disable();
    this.personaSeleccionadaForm.reset();
    this.personaSeleccionadaForm.disable();
    this.personaSeleccionadaForm.patchValue({
      sCodPlla: "?",
    });
  }
  //#endregion

  //#region ELIMINR PERSONA DE LA TABLA
  public async eliminarPersonaTabla(
    personaEliminar: IPersonaAsignadaCitaMedica
  ) {
    if (personaEliminar.nIdCitaEM !== 0) {
      if (personaEliminar.nIdExamenM !== 0) {
        this.snackBar.open(
          "Esta cita contiene un examen, no se puede eliminar",
          "Cerrar",
          {
            duration: 1000,
            horizontalPosition: "right",
            verticalPosition: "top",
          }
        );
        return;
      }

      this.generalComando.setServicio(
        new EliminarCitaMedicaServicio(this.service, personaEliminar.nIdCitaEM)
      );
      await this.generalComando.ejecutar();
    }

    var data = this.historialExamenMedicoDataSource.data;
    var eliminarPersonaCita: EliminarPersonaCita = new EliminarPersonaCita();
    eliminarPersonaCita.config(
      this.estadoModal,
      +this.eventoDiaSeleccionado.id,
      this.eventoDiaSeleccionado.start,
      data,
      this.eventosCalendario,
      this.mapCantidadPersonasPorDia
    );
    eliminarPersonaCita.eliminar(personaEliminar);
    this._configuracionDiaAcabaEstarDisponible();
    this.cargarDataTablaPersonasAsignadas(eliminarPersonaCita.listaPersonas);
    this.eventosCalendario = eliminarPersonaCita.eventosCalendario;
    this.mapCantidadPersonasPorDia =
      eliminarPersonaCita.mapCantidadPersonasPorDia;

    if (
      this.estadoModal === 1 &&
      this.historialExamenMedicoDataSource.data.length < 10
    ) {
      this.estadoModal = 2;
      this.fbButton.verOpcionesEdicionDiaDisponible();
      this.controlPanelExpanded = true;
      this.obtenerListaPersonasAsignadasData(
        +this.eventoDiaSeleccionado.id,
        this.eventoDiaSeleccionado.start
      );
    }

    if (
      this.estadoModal === 3 &&
      this.historialExamenMedicoDataSource.data.length < 10
    ) {
      this.fbButton.verOpcionesGuardarEdicionDiaDisponibleCalendario(false);
    }

    if (personaEliminar.nIdCitaEM !== 0) {
      this.listaDeEliminados.push(personaEliminar);
    }
  }

  private async _configuracionDiaAcabaEstarDisponible() {
    this.buscarPersonaFormControl.enable();
    await this._cargarDataBuscador();
  }
  //#endregion

  public cargarDataTablaPersonasAsignadas(data: IPersonaAsignadaCitaMedica[]) {
    this.historialExamenMedicoDataSource =
      new MatTableDataSource<IPersonaAsignadaCitaMedica>(data);
    this.historialExamenMedicoDataSource.paginator =
      this.pagHistorialExamenMedico;
  }

  public async volverAgregarLasPersonasEliminadas() {
    if (this.listaDeEliminados.length === 0) {
      return;
    }
    this.listaDeEliminados = this.listaDeEliminados.map((v) => {
      v.nIdCitaEM = 0;
      return v;
    });
    this.generalComando.setServicio(
      new GuardarCitaMedicaServicio(
        this.service,
        this.listaDeEliminados,
        this.eventoDiaSeleccionado
      )
    );
    await this.generalComando.ejecutar();
    await this.obtenerListaPersonasAsignadasData(
      +this.eventoDiaSeleccionado.id,
      this.eventoDiaSeleccionado.start
    );
    this.listaDeEliminados = [];
    this.recalcularEventosCalendario();
  }
  //#endregion
}
