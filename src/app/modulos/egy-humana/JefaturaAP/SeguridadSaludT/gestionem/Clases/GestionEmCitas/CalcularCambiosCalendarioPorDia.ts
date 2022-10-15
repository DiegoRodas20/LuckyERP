import { CalendarEvent } from "angular-calendar";
import {
  IPersonaAsignadaCitaMedica,
  IRangoPersonasCantidad,
} from "../../../../Model/Igestionem";

export default class CalcularCambiosCalendarioPorDia {
  eventoSeleccionado: CalendarEvent;
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

  public ejecutar(
    eventoSeleccionado: CalendarEvent,
    listaPersonas: IPersonaAsignadaCitaMedica[],
    eventosCalendario: CalendarEvent[],
    mapCantidadPersonasPorDia: {
      [nIdRangoEM: string]: IRangoPersonasCantidad[];
    }
  ) {
    this.eventoSeleccionado = eventoSeleccionado;
    this.listaPersonas = listaPersonas;
    this.eventosCalendario = eventosCalendario;
    this.mapCantidadPersonasPorDia = mapCantidadPersonasPorDia;

    this._limpiarListaPersonas();
    this._establecerCantidadPersonasPorDia();
    this._modificarLosEventosCalendario();
  }

  private _limpiarListaPersonas() {
    this.listaPersonas = this.listaPersonas.filter(
      (persona) => persona.nIdCitaEM !== 0
    );
  }

  private _establecerCantidadPersonasPorDia() {
    this.mapCantidadPersonasPorDia[
      this.eventoSeleccionado.id
    ] = this.mapCantidadPersonasPorDia[this.eventoSeleccionado.id].map(
      (item) => {
        if (
          item.dFecha.toLocaleString() ===
          this.eventoSeleccionado.start.toLocaleString()
        ) {
          item.nCantidad = this.listaPersonas.length;
        }
        return item;
      }
    );
  }

  private _modificarLosEventosCalendario() {
    this.eventosCalendario = this.eventosCalendario.map((evento) => {
      if (
        evento.start.toLocaleString() ===
        this.eventoSeleccionado.start.toLocaleString()
      ) {
        evento.title = this.listaPersonas.length < 10 ? "Disponible" : "Lleno";
        evento.color =
          this.listaPersonas.length < 10 ? this.colors.green : this.colors.red;
      }
      return evento;
    });
  }
}
