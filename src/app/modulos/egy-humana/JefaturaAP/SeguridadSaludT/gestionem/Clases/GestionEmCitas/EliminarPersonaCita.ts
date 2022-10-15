import { CalendarEvent } from "angular-calendar";
import moment from "moment";
import {
  IPersonaAsignadaCitaMedica,
  IRangoPersonasCantidad,
} from "../../../../Model/Igestionem";

export default class EliminarPersonaCita {
  estadoModal: number;
  nIdRangoEM: number;
  fechaSeleccionada: Date;
  listaPersonas: IPersonaAsignadaCitaMedica[];
  eventosCalendario: CalendarEvent[];
  mapCantidadPersonasPorDia: {
    [nIdRangoEM: string]: IRangoPersonasCantidad[];
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

  public eliminar(eliminarPersona: IPersonaAsignadaCitaMedica) {
    if (
      this.estadoModal === 0 ||
      this.estadoModal === 1 ||
      this.estadoModal === 2
    ) {
      this._modalSeleccionarDia(eliminarPersona);
    }

    if (this.estadoModal === 3) {
      this._modalSeleccionarCalendario(eliminarPersona);
    }
  }

  private _modalSeleccionarDia(eliminarPersona: IPersonaAsignadaCitaMedica) {
    this.listaPersonas = this.listaPersonas.filter(
      (persona) => persona.nIdPerlab !== eliminarPersona.nIdPerlab
    );

    this._disminuirCantidadDePersonasPorDia();
    this._recalcularLosEventos();
  }

  private _modalSeleccionarCalendario(
    eliminarPersona: IPersonaAsignadaCitaMedica
  ) {
    this.listaPersonas = this.listaPersonas.filter(
      (persona) => persona.nIdPerlab !== eliminarPersona.nIdPerlab
    );

    this._disminuirCantidadDePersonasPorDia();
    this._recalcularLosEventos();
  }

  private _disminuirCantidadDePersonasPorDia() {
    this.mapCantidadPersonasPorDia[
      this.nIdRangoEM
    ] = this.mapCantidadPersonasPorDia[this.nIdRangoEM].map((item) => {
      if (
        item.dFecha.toLocaleString() === this.fechaSeleccionada.toLocaleString()
      ) {
        item.nCantidad = item.nCantidad - 1;
      }
      return item;
    });
  }

  private _recalcularLosEventos() {
    this.eventosCalendario = this.eventosCalendario.map((evento) => {
      if (
        evento.start.toLocaleString() ===
        this.fechaSeleccionada.toLocaleString()
      ) {
        evento.title = "Disponible";
      }
      return evento;
    });
  }
}
