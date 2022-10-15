import {
  CalendarDateFormatter,
  CalendarEvent,
  CalendarEventAction,
  CalendarView,
  DAYS_OF_WEEK,
} from "angular-calendar";
import {
  addDays,
  addHours,
  endOfDay,
  endOfMonth,
  startOfDay,
  subDays,
} from "date-fns";
import { Subject } from "rxjs";
import * as moment from "moment";

import {
  IRangoFechasCita,
  IRangoPersonasCantidad,
} from "../../../../Model/Igestionem";
import { GestionemService } from "../../../../Services/gestionem.service";
import CantidadPersonasRangoCitasServicio from "../../Comandos/General/CantidadPersonasRangoCitasServicio";
import RangoFechasCitasServicio from "../../Comandos/General/RangoFechasCitasServicio";
import GeneralComando from "../../Comandos/GeneralComando";

export default class CalendarConfig {
  generalComando: GeneralComando = new GeneralComando();

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

  locale = "es";
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.MONDAY, DAYS_OF_WEEK.SUNDAY];
  view: CalendarView = CalendarView.Month;
  events: CalendarEvent[] = [];
  viewDate: Date = new Date();
  eventMain: CalendarEvent[] = [];
  rangoFechasCitas: IRangoFechasCita[];
  cantidadPersonasRangoFecha: {
    [nIdRangoEM: string]: IRangoPersonasCantidad[];
  } = {};

  refresh: Subject<any> = new Subject();

  subDate: Date = new Date();
  eventSub: CalendarEvent[] = [];
  refreshSub: Subject<any> = new Subject();

  constructor() {}

  public async obtenerRangoFechasCitas(
    service: GestionemService
  ): Promise<void> {
    this.generalComando.setServicio(new RangoFechasCitasServicio(service));
    this.rangoFechasCitas = await this.generalComando.ejecutar();

    await Promise.all(
      this.rangoFechasCitas.map(async (rangoFecha) => {
        this.generalComando.setServicio(
          new CantidadPersonasRangoCitasServicio(service, rangoFecha.nIdRangoEM)
        );

        var fechasCantidad = await this.generalComando.ejecutar();
        this._rangoDisponibilidadCalendario(rangoFecha, fechasCantidad);
      })
    );
  }

  private _rangoDisponibilidadCalendario(
    rango: IRangoFechasCita,
    cantidadPersonasEnRango: IRangoPersonasCantidad[]
  ): void {
    this._agregarCantidadPersonasPorDia(rango, cantidadPersonasEnRango);
    this._crearEventosCalendario();
  }

  private _agregarCantidadPersonasPorDia(
    rango: IRangoFechasCita,
    cantidadPersonasEnRango: IRangoPersonasCantidad[]
  ) {
    var listaCantidadPersona: IRangoPersonasCantidad[] = [];
    for (
      let fecha = new Date(rango.dFechIni);
      fecha <= new Date(rango.dFechFin);
      fecha = addDays(fecha, 1)
    ) {
      var aux = cantidadPersonasEnRango.find((item) => {
        var aux = new Date(item.dFecha);
        if (
          moment(aux).format("DD/MM/YY") === moment(fecha).format("DD/MM/YY")
        ) {
          return true;
        }
      });
      listaCantidadPersona.push({
        dFecha: fecha,
        nCantidad: aux === undefined ? 0 : aux.nCantidad,
      });
    }

    this.cantidadPersonasRangoFecha[rango.nIdRangoEM] = listaCantidadPersona;
  }

  private _crearEventosCalendario() {
    var eventosAux = [];
    this.rangoFechasCitas.forEach((rango) => {
      var listaDiasRango = this.cantidadPersonasRangoFecha[rango.nIdRangoEM];

      if (listaDiasRango !== undefined)
        listaDiasRango.forEach((dia) => {
          eventosAux.push(this._obtenerEstadoEvento(dia.dFecha, rango, dia));
        });
    });

    this.eventMain = [...eventosAux];
  }

  private _obtenerEstadoEvento(
    fecha: Date,
    rango: IRangoFechasCita,
    dia: IRangoPersonasCantidad
  ) {
    if (this._validarEstadoPerteneceDiaPasado(dia)) {
      return {
        id: rango.nIdRangoEM,
        start: startOfDay(fecha),
        end: startOfDay(fecha),
        title: "No Disponible",
        color: this.colors.gray,
        allDay: true,
        draggable: false,
      };
    }

    if (this._validarSiTieneElLimitePersonasPorDia(dia)) {
      return {
        id: rango.nIdRangoEM,
        start: startOfDay(fecha),
        end: startOfDay(fecha),
        title: "Lleno",
        color: this.colors.red,
        allDay: true,
        draggable: false,
      };
    }

    if (this._validarSiEstaDisponibleElEvento(dia)) {
      return {
        id: rango.nIdRangoEM,
        start: startOfDay(fecha),
        end: startOfDay(fecha),
        title: "Disponible",
        color: this.colors.green,
        allDay: true,
        draggable: false,
      };
    }
  }

  private _validarEstadoPerteneceDiaPasado(
    dia: IRangoPersonasCantidad
  ): boolean {
    var fechaManiana = addDays(new Date(), 1);
    return dia.dFecha <= fechaManiana;
  }

  private _validarSiTieneElLimitePersonasPorDia(
    dia: IRangoPersonasCantidad
  ): boolean {
    return dia.nCantidad >= 10;
  }

  private _validarSiEstaDisponibleElEvento(
    dia: IRangoPersonasCantidad
  ): boolean {
    return true;
  }
}
