import { CalendarEvent } from "angular-calendar";
import moment from "moment";
import {
  IPersonaAsignadaCitaMedica,
  IRangoPersonasCantidad,
} from "../../../../Model/Igestionem";

export default class AgregarPersonaCita {
  estadoModal: number;
  nIdRangoEM: number;
  fechaSeleccionada: Date;
  listaPersonas: IPersonaAsignadaCitaMedica[];
  eventosCalendario: CalendarEvent[];
  mapCantidadPersonasPorDia: {
    [nIdRangoEM: string]: IRangoPersonasCantidad[];
  };

  colors: any = {
    red: {
      primary: "#ad2121",
      secondary: "#ffa3a3",
    },
    green: {
      primary: "#0ba800",
      secondary: "#95ff5c",
    },
    gray: {
      primary: "#686868",
      secondary: "#a9a9a9",
    },
  };

  public config(
    estadoModal: number,
    nIdRangoEM: number,
    fechaSeleccionada: Date,
    listaPersonas: IPersonaAsignadaCitaMedica[],
    eventosCalendario: CalendarEvent[],
    mapCantidadPersonasPorDia: {
      [nIdRangoEM: string]: IRangoPersonasCantidad[];
    }
  ) {
    this.estadoModal = estadoModal;
    this.nIdRangoEM = nIdRangoEM;
    this.fechaSeleccionada = fechaSeleccionada;
    this.listaPersonas = listaPersonas;
    this.eventosCalendario = eventosCalendario;
    this.mapCantidadPersonasPorDia = mapCantidadPersonasPorDia;
  }

  public agregar(nuevaPersona: IPersonaAsignadaCitaMedica): boolean {
    if (
      this.estadoModal === 0 ||
      this.estadoModal === 1 ||
      this.estadoModal === 2
    ) {
      return this._modalSeleccionarDia(nuevaPersona);
    }

    if (this.estadoModal === 3) {
      return this._modalSeleccionarCalendario(nuevaPersona);
    }

    return false;
  }

  private _modalSeleccionarDia(
    nuevaPersona: IPersonaAsignadaCitaMedica
  ): boolean {
    this.listaPersonas = [nuevaPersona, ...this.listaPersonas];
    const diaLleno = this._aumentarCantidadDePersonasPorDia();
    if (diaLleno) this._recalcularLosEventos();
    return diaLleno;
  }

  private _modalSeleccionarCalendario(
    nuevaPersona: IPersonaAsignadaCitaMedica
  ): boolean {
    this.listaPersonas = [nuevaPersona, ...this.listaPersonas];
    const diaLleno = this._aumentarCantidadDePersonasPorDia();
    if (diaLleno) this._recalcularLosEventos();
    return diaLleno;
  }

  private _aumentarCantidadDePersonasPorDia(): boolean {
    var flag = false;
    this.mapCantidadPersonasPorDia[
      this.nIdRangoEM
    ] = this.mapCantidadPersonasPorDia[this.nIdRangoEM].map((item) => {
      if (
        item.dFecha.toLocaleString() === this.fechaSeleccionada.toLocaleString()
      ) {
        item.nCantidad = item.nCantidad + 1;
        flag = item.nCantidad === 10;
      }
      return item;
    });
    return flag;
  }

  private _recalcularLosEventos() {
    this.eventosCalendario = this.eventosCalendario.map((evento) => {
      if (
        evento.start.toLocaleString() ===
        this.fechaSeleccionada.toLocaleString()
      ) {
        evento.title = "Lleno";
        evento.color = this.colors.red;
      }
      return evento;
    });
  }
}
