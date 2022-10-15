import Swal from "sweetalert2";

import { GestionemCitasComponent } from "../../Modals/gestionem-citas/gestionem-citas.component";
import CalcularCambiosCalendarioPorDia from "./CalcularCambiosCalendarioPorDia";

export default class fabButtonConfig {
  estadoFb = 0;
  fbAnimacion = "inactive";

  fbOpcionesActivas = [];

  //#region LISTA DE OPCIONES
  fbPrimeraOpcion: any[] = [
    {
      icon: "save",
      tool: "Guardar",
      active: true,
    },
  ];

  fbSegundaOpcion: any[] = [
    {
      icon: "edit",
      tool: "Editar",
      active: true,
    },
  ];

  fbTerceraOpcion: any[] = [
    {
      icon: "save",
      tool: "Guardar",
      active: true,
    },
    {
      icon: "close",
      tool: "Cancelar",
      active: true,
    },
  ];

  fbCuartaOpcion: any[] = [
    {
      icon: "close",
      tool: "Cancelar",
      active: true,
    },
  ];

  diaNoEditable: any[] = [
    {
      icon: "edit",
      tool: "Editar",
      active: false,
    },
  ];
  //#endregion

  constructor(estadoFb: number, fbAnimacion: string) {
    this.estadoFb = estadoFb;
    this.fbAnimacion = fbAnimacion;
    this._init();
  }

  private _init() {
    switch (this.estadoFb) {
      case 0:
        if (this.fbAnimacion === "active") {
          this.fbOpcionesActivas = [];
        }

        if (this.fbAnimacion === "inactive") {
          this.fbOpcionesActivas = [];
        }
        break;
      default:
        break;
    }
  }

  //#region CAMBIO ENTRE ESTADO
  public verOpcionesDiaNoEditable() {
    this.estadoFb = 0;
    this.fbAnimacion = "inactive";
    this.fbOpcionesActivas = [];
  }

  public verOpcionesEditarDiaLleno() {
    this.estadoFb = 1;
    this.fbAnimacion = "active";
    this.fbOpcionesActivas = [];
    this.delay(500).then((any) => {
      this.fbOpcionesActivas = this.fbSegundaOpcion;
    });
  }

  public verOpcionesEditarDiaDisponible() {
    this.estadoFb = 2;
    this.fbAnimacion = "active";
    this.fbOpcionesActivas = [];
    this.delay(500).then((any) => {
      this.fbOpcionesActivas = this.fbSegundaOpcion;
    });
  }

  public verOpcionesCalendarioSinSeleccionarDia() {
    this.estadoFb = 3;
    this.fbAnimacion = "inactive";
    this.fbOpcionesActivas = [];
    this.delay(500).then((any) => {
      this.fbOpcionesActivas = [];
    });
  }

  public verOpcionesEditarDia() {
    this.estadoFb = 4;
    this.fbAnimacion = "active";
    this.fbOpcionesActivas = [];
    this.delay(500).then((any) => {
      this.fbOpcionesActivas = this.fbSegundaOpcion;
    });
  }

  public verOpcionesEditarDiaDisponibleCalendario() {
    this.estadoFb = 5;
    this.fbAnimacion = "active";
    this.fbOpcionesActivas = [];
    this.delay(250).then((any) => {
      this.fbOpcionesActivas = this.fbSegundaOpcion;
    });
  }

  public verOpcionesEditarDiaLlenoCalendario() {
    this.estadoFb = 6;
    this.fbAnimacion = "active";
    this.fbOpcionesActivas = [];
    this.delay(250).then((any) => {
      this.fbOpcionesActivas = this.fbSegundaOpcion;
    });
  }

  public verOpcionesGuardarEdicionDiaDisponibleCalendario(animar = true) {
    this.estadoFb = 7;
    this.fbAnimacion = "active";

    if (animar) {
      this.fbOpcionesActivas = [];
      this.delay(250).then((any) => {
        this.fbOpcionesActivas = this.fbTerceraOpcion;
      });
    } else {
      this.fbOpcionesActivas = this.fbTerceraOpcion;
    }
  }

  public verOpcionesGuardarEdicionDiaLlenoCalendario() {
    this.estadoFb = 8;
    this.fbAnimacion = "active";
    this.fbOpcionesActivas = [];
    this.delay(250).then((any) => {
      this.fbOpcionesActivas = this.fbCuartaOpcion;
    });
  }

  public verOpcionesDiaNoEditableCalendario() {
    this.estadoFb = 9;
    this.fbAnimacion = "active";
    this.fbOpcionesActivas = this.diaNoEditable;
  }

  public verOpcionesEdicionDiaDisponible() {
    this.estadoFb = 10;
    this.fbAnimacion = "active";
    this.fbOpcionesActivas = [];
    this.delay(500).then((any) => {
      this.fbOpcionesActivas = this.fbTerceraOpcion;
    });
  }

  public verOpcionesEdicionDiaLleno() {
    this.estadoFb = 11;
    this.fbAnimacion = "active";
    this.fbOpcionesActivas = [];
    this.delay(250).then((any) => {
      this.fbOpcionesActivas = this.fbCuartaOpcion;
    });
  }

  //#endregion

  //#region MOSTRAR Y OCULTAR OPCIONES
  public cambiarOpcionesMostrarOcultar(fechaSeleccionada: string) {
    switch (this.estadoFb) {
      case 0:
        this._opcionesDiaNoEditable();
        break;
      case 1:
        this._opcionesEditarDiaLleno();
        break;
      case 2:
        this._opcionesEditarDiaDisponible();
        break;
      case 3:
        this._opcionesCalendarioSinSeleccionarDia();
        break;
      case 4:
        this._opcionesEditarDia();
        break;
      case 5:
        this._opcionesEditarDiaDisponibleCalendario();
        break;
      case 6:
        this._opcionesEditarDiaLlenoCalendario();
        break;
      case 7:
        this._opcionesGuardarEdicionDiaDisponibleCalendario();
        break;
      case 8:
        this._opcionesGuardarEdicionDiaLlenoCalendario();
        break;
      case 9:
        this._opcionesDiaNoEditableCalendario();
        break;
      case 10:
        this._opcionesEdicionDiaDisponible();
        break;
      case 11:
        this._opcionesEdicionDiaLleno();
        break;
      default:
        break;
    }
  }

  private _opcionesDiaNoEditable() {
    if (this.fbAnimacion === "active") {
      this.fbAnimacion = "inactive";
      this.fbOpcionesActivas = [];
    } else if (this.fbAnimacion === "inactive") {
      this.fbAnimacion = "active";
      this.fbOpcionesActivas = [];
    }
  }

  private _opcionesEditarDiaLleno() {
    if (this.fbAnimacion === "active") {
      this.fbAnimacion = "inactive";
      this.fbOpcionesActivas = [];
    } else if (this.fbAnimacion === "inactive") {
      this.fbAnimacion = "active";
      this.fbOpcionesActivas = this.fbSegundaOpcion;
    }
  }

  private _opcionesEditarDiaDisponible() {
    if (this.fbAnimacion === "active") {
      this.fbAnimacion = "inactive";
      this.fbOpcionesActivas = [];
    } else if (this.fbAnimacion === "inactive") {
      this.fbAnimacion = "active";
      this.fbOpcionesActivas = this.fbCuartaOpcion;
    }
  }

  private _opcionesCalendarioSinSeleccionarDia() {
    if (this.fbAnimacion === "active") {
      this.fbAnimacion = "inactive";
      this.fbOpcionesActivas = [];
    } else if (this.fbAnimacion === "inactive") {
      this.fbAnimacion = "active";
      this.fbOpcionesActivas = [];
    }
  }

  private _opcionesEditarDia() {
    if (this.fbAnimacion === "active") {
      this.fbAnimacion = "inactive";
      this.fbOpcionesActivas = [];
    } else if (this.fbAnimacion === "inactive") {
      this.fbAnimacion = "active";
      this.fbOpcionesActivas = this.fbSegundaOpcion;
    }
  }

  private _opcionesEditarDiaDisponibleCalendario() {
    if (this.fbAnimacion === "active") {
      this.fbAnimacion = "inactive";
      this.fbOpcionesActivas = [];
    } else if (this.fbAnimacion === "inactive") {
      this.fbAnimacion = "active";
      this.fbOpcionesActivas = this.fbSegundaOpcion;
    }
  }

  private _opcionesEditarDiaLlenoCalendario() {
    if (this.fbAnimacion === "active") {
      this.fbAnimacion = "inactive";
      this.fbOpcionesActivas = [];
    } else if (this.fbAnimacion === "inactive") {
      this.fbAnimacion = "active";
      this.fbOpcionesActivas = this.fbSegundaOpcion;
    }
  }

  private _opcionesGuardarEdicionDiaDisponibleCalendario() {
    if (this.fbAnimacion === "active") {
      this.fbAnimacion = "inactive";
      this.fbOpcionesActivas = [];
    } else if (this.fbAnimacion === "inactive") {
      this.fbAnimacion = "active";
      this.fbOpcionesActivas = this.fbTerceraOpcion;
    }
  }

  public _opcionesGuardarEdicionDiaLlenoCalendario() {
    if (this.fbAnimacion === "active") {
      this.fbAnimacion = "inactive";
      this.fbOpcionesActivas = [];
    } else if (this.fbAnimacion === "inactive") {
      this.fbAnimacion = "active";
      this.fbOpcionesActivas = this.fbCuartaOpcion;
    }
  }

  public _opcionesDiaNoEditableCalendario() {
    if (this.fbAnimacion === "active") {
      this.fbAnimacion = "inactive";
      this.fbOpcionesActivas = [];
    } else if (this.fbAnimacion === "inactive") {
      this.fbAnimacion = "active";
      this.fbOpcionesActivas = this.fbSegundaOpcion;
    }
  }

  public _opcionesEdicionDiaDisponible() {
    if (this.fbAnimacion === "active") {
      this.fbAnimacion = "inactive";
      this.fbOpcionesActivas = [];
    } else if (this.fbAnimacion === "inactive") {
      this.fbAnimacion = "active";
      this.fbOpcionesActivas = this.fbTerceraOpcion;
    }
  }

  public _opcionesEdicionDiaLleno() {
    if (this.fbAnimacion === "active") {
      this.fbAnimacion = "inactive";
      this.fbOpcionesActivas = [];
    } else if (this.fbAnimacion === "inactive") {
      this.fbAnimacion = "active";
      this.fbOpcionesActivas = this.fbCuartaOpcion;
    }
  }
  //#endregion

  //#region EJECUCION DE METODOS
  public ejecutar(gestion: GestionemCitasComponent, index: number) {
    switch (this.estadoFb) {
      case 1:
        this._accionesEditarDiaLleno(gestion, index);
        break;
      case 2:
        this._accionesEditarDiaDisponible(gestion, index);
        break;
      case 5:
        this._accionesEditarDiaDisponibleCalendario(gestion, index);
        break;
      case 6:
        this._accionesEditarDiaLlenoCalendario(gestion, index);
        break;
      case 7:
        this._accionesGuardarEdicionDiaDisponibleCalendario(gestion, index);
        break;
      case 8:
        this._accionesGuardarEdicionDiaLlenoCalendario(gestion, index);
        break;
      case 10:
        this._accionesEdicionDiaDisponible(gestion, index);
        break;
      case 11:
        this._accionesEdicionDiaLleno(gestion, index);
        break;
      default:
        break;
    }
  }

  private async _accionesEditarDiaLleno(
    gestion: GestionemCitasComponent,
    index: number
  ) {
    if (index === 0) {
      await Swal.fire({
        title: "Atencion!",
        text: "¿ Seguro que desea editar ?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#ff4081",
        confirmButtonText: "Si",
        allowOutsideClick: false,
      }).then(async (result) => {
        if (result.isConfirmed) {
          gestion.deshabilitarBtnEliminar = false;
          this.verOpcionesEdicionDiaLleno();
        }
      });
    }
  }

  private _accionesEdicionDiaLleno(
    gestion: GestionemCitasComponent,
    index: number
  ) {
    if (index === 0) {
      gestion.deshabilitarBtnEliminar = true;
      this.verOpcionesEditarDiaLleno();
    }
  }

  private async _accionesEditarDiaDisponible(
    gestion: GestionemCitasComponent,
    index: number
  ) {
    if (index === 0) {
      await Swal.fire({
        title: "Atencion!",
        text: "¿ Seguro que desea editar ?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#ff4081",
        confirmButtonText: "Si",
        allowOutsideClick: false,
      }).then(async (result) => {
        if (result.isConfirmed) {
          gestion.deshabilitarBtnEliminar = false;
          gestion.buscarPersonaFormControl.enable();
          this.verOpcionesEdicionDiaDisponible();
        }
      });
    }
  }

  private async _accionesEdicionDiaDisponible(
    gestion: GestionemCitasComponent,
    index: number
  ) {
    if (index === 0) {
      const res = await gestion.guardarFbAccion();
      if (res)
        await gestion.obtenerListaPersonasAsignadasData(
          +gestion.eventoDiaSeleccionado.id,
          gestion.eventoDiaSeleccionado.start
        );
      await gestion._cargarDataBuscador();
      if (
        gestion.estadoModal === 2 &&
        gestion.historialExamenMedicoDataSource.data.length >= 10
      ) {
        gestion.estadoModal = 1;
        gestion.configuracionModal();
      }

      if (res) {
        gestion.closeModal();
      }
    }

    if (index === 1) {
      await gestion.volverAgregarLasPersonasEliminadas();
      await gestion.obtenerListaPersonasAsignadasData(
        +gestion.eventoDiaSeleccionado.id,
        gestion.eventoDiaSeleccionado.start
      );
      gestion.deshabilitarBtnEliminar = true;
      gestion.buscarPersonaFormControl.disable();
      if (gestion.historialExamenMedicoDataSource.data.length < 10) {
        this.verOpcionesEditarDiaDisponible();
      } else {
        gestion.estadoModal = 1;
        this.verOpcionesEditarDiaLleno();
      }
    }
  }

  private async _accionesEditarDiaDisponibleCalendario(
    gestion: GestionemCitasComponent,
    index: number
  ) {
    if (index === 0) {
      await Swal.fire({
        title: "Atencion!",
        text: "¿ Seguro que desea editar ?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#ff4081",
        confirmButtonText: "Si",
        allowOutsideClick: false,
      }).then(async (result) => {
        if (result.isConfirmed) {
          gestion.controlPanelExpanded = true;
          gestion.deshabilitarBtnEliminar = false;
          gestion.buscarPersonaFormControl.enable();
          await gestion._cargarDataBuscador();

          if (gestion.historialExamenMedicoDataSource.data.length >= 10) {
            gestion.buscarPersonaFormControl.disable();
            this.verOpcionesGuardarEdicionDiaLlenoCalendario();
          } else {
            this.verOpcionesGuardarEdicionDiaDisponibleCalendario();
          }
        }
      });
    }
  }

  private async _accionesGuardarEdicionDiaDisponibleCalendario(
    gestion: GestionemCitasComponent,
    index: number
  ) {
    if (index === 0) {
      const res = await gestion.guardarFbAccion();
      if (res)
        await gestion.obtenerListaPersonasAsignadasData(
          +gestion.eventoDiaSeleccionado.id,
          gestion.eventoDiaSeleccionado.start
        );

      if (res) {
        gestion.controlPanelExpanded = false;
        gestion.deshabilitarBtnEliminar = true;
        gestion.recalcularEventosCalendario();
        this.verOpcionesEditarDiaDisponibleCalendario();
      }
    }

    if (index === 1) {
      await gestion.volverAgregarLasPersonasEliminadas();
      await gestion.obtenerListaPersonasAsignadasData(
        +gestion.eventoDiaSeleccionado.id,
        gestion.eventoDiaSeleccionado.start
      );
      gestion.controlPanelExpanded = false;
      gestion.deshabilitarBtnEliminar = true;
      gestion.recalcularEventosCalendario();
      this.verOpcionesEditarDiaDisponibleCalendario();
    }
  }

  private async _accionesEditarDiaLlenoCalendario(
    gestion: GestionemCitasComponent,
    index: number
  ) {
    if (index === 0) {
      await Swal.fire({
        title: "Atencion!",
        text: "¿ Seguro que desea editar ?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#ff4081",
        confirmButtonText: "Si",
        allowOutsideClick: false,
      }).then(async (result) => {
        if (result.isConfirmed) {
          gestion.controlPanelExpanded = true;
          gestion.deshabilitarBtnEliminar = false;
          gestion.buscarPersonaFormControl.disable();
          this.verOpcionesGuardarEdicionDiaLlenoCalendario();
        }
      });
    }
  }

  private _accionesGuardarEdicionDiaLlenoCalendario(
    gestion: GestionemCitasComponent,
    index: number
  ) {
    if (index === 0) {
      gestion.controlPanelExpanded = false;
      gestion.deshabilitarBtnEliminar = true;
      this.verOpcionesEditarDiaLlenoCalendario();
    }
  }
  //#endregion

  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }
}
