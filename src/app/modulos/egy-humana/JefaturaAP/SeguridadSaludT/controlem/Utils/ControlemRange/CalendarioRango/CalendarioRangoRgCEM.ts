import { CalendarEvent, CalendarView, DAYS_OF_WEEK } from "angular-calendar";
import {
  addDays,
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns";
import moment from "moment";
import { Subject } from "rxjs";
import { ControlemRangeComponent } from "../../../Modals/controlem-range/controlem-range.component";
import { IComandoCEM } from "../../Comandos/IComandoCem";
import RangoComando from "../../Comandos/Rango/RangoComando";
import RangoDeResposablePorRangoFechaServicioRgCEM from "../../Comandos/Rango/RangoDeResposablePorRangoFechaServicioRgCEM";
import { IResponsableDataTablaRgCEM } from "../ResponsablesTabla/IResponsableDataTablaRgCEM";
import { IRangoDeResposablePorRangoFechaRgCEM } from "./IRangoDeResposablePorRangoFechaRgCEM";

const colors: any = {
  nuevoRango: {
    primary: "#e3bc08",
    secondary: "#FDF1BA",
  },
  responsableSeleccionado: {
    primary: "#ff4081cc",
    secondary: "#ff40816b",
  },
  misRangos: {
    primary: "#b8b9ba",
    secondary: "#b8b9ba9c",
  },
};

export default class CalendarioRangoRgCEM {
  // Calendar properties
  locale = "es";
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.MONDAY, DAYS_OF_WEEK.SUNDAY];
  view: CalendarView = CalendarView.Month;
  events: CalendarEvent[] = [];

  // Calendar setup
  viewDate: Date = new Date();
  eventMain: CalendarEvent[] = [];
  refresh: Subject<any> = new Subject();

  subDate: Date = new Date();
  eventSub: CalendarEvent[] = [];
  refreshSub: Subject<any> = new Subject();

  comando: IComandoCEM = new RangoComando();

  constructor(private component: ControlemRangeComponent) {}

  public async misRangosServicio() {
    const servicio = new RangoDeResposablePorRangoFechaServicioRgCEM(
      this.component.service
    );
    servicio.setData(
      this.component.nIdResponsable,
      startOfMonth(new Date()),
      endOfMonth(new Date())
    );

    this.comando.setServicio(servicio);
    const resp = await this.comando.ejecutar();

    const eventos = CalendarioEventos.misRangos(resp);
    this.eventMain = [...eventos];
  }

  public mostrarNuevoRangoFechasSeleccionada(
    fechaInicio: Date,
    fechaFin: Date
  ) {
    if (fechaInicio !== null && fechaFin !== null) {
      this.eliminarRangosDelResposable(0);
      this.eliminarRangoResponsableSeleccionado(
        this.component.resposablesTabla.seleccionado
      );
      this.component.resposablesTabla.resetSeleccionado();

      const eventos = CalendarioEventos.nuevoRango(
        new Date(fechaInicio),
        new Date(fechaFin)
      );
      this.eventMain = [...this.eventMain, ...eventos];
    }
  }

  public async mostrarRangoDeResponsableSeleccionado(
    responsable: IResponsableDataTablaRgCEM
  ) {
    const formFechIni =
      this.component.nuevoRango.form.controls["dFechIni"].value;
    const formFechFin =
      this.component.nuevoRango.form.controls["dFechFin"].value;

    if (formFechIni !== null && formFechFin !== null) {
      const dFechIni = new Date(formFechIni);
      const dFechFin = new Date(formFechFin);

      this.component.spi.show("spi_reject");
      const rangos = await this._obtenerRangosResponsable(
        responsable.nIdPersonal,
        dFechIni,
        dFechFin
      );

      const eventosResponsable =
        CalendarioEventos.rangoResposableSeleccionado(rangos);
      this.eventMain = [...this.eventMain, ...eventosResponsable];
      this.component.spi.hide("spi_reject");
    }
  }

  public eliminarRangoResponsableSeleccionado(
    responsable: IResponsableDataTablaRgCEM
  ) {
    this.eliminarRangosDelResposable(responsable.nIdPersonal);
  }

  private async _obtenerRangosResponsable(
    nIdResp: number,
    dFechaIni: Date,
    dFechaFin: Date
  ): Promise<IRangoDeResposablePorRangoFechaRgCEM[]> {
    const servicio = new RangoDeResposablePorRangoFechaServicioRgCEM(
      this.component.service
    );
    servicio.setData(nIdResp, dFechaIni, dFechaFin);
    this.comando.setServicio(servicio);
    const data: IRangoDeResposablePorRangoFechaRgCEM[] =
      await this.comando.ejecutar();
    return data;
  }

  public eliminarRangosDelResposable(nIdResposable: number) {
    this.eventMain = this.eventMain.filter((v) => v.id !== nIdResposable);
  }
}

class CalendarioEventos {
  constructor(private calendar: CalendarioRangoRgCEM) {}

  public static nuevoRango(fechaInicio: Date, fechaFin: Date): CalendarEvent[] {
    var eventos: CalendarEvent[] = [];

    //for (
    //  let fecha = fechaInicio;
    //  fecha <= fechaFin;
    //  fecha = addDays(fecha, 1)
    //) {
    //  eventos.push({
    //    id: 0,
    //    start: startOfDay(fecha),
    //    title: "Nuevo rango",
    //    color: colors.nuevoRango,
    //  });
    //}

    eventos.push({
      start: fechaInicio,
      end: fechaFin,
      color: colors.nuevoRango,
      title:
        "Inicio : " +
        moment(fechaInicio).format("DD/MM/YYYY") +
        " - Termino : " +
        moment(fechaFin).format("DD/MM/YYYY"),
      allDay: true,
      draggable: false,
    });
    return eventos;
  }

  public static misRangos(
    listaRangos: IRangoDeResposablePorRangoFechaRgCEM[]
  ): CalendarEvent[] {
    var eventos: CalendarEvent[] = [];

    listaRangos.forEach((rango) => {
      //for (
      //  let fecha = new Date(rango.dFechIni);
      //  fecha <= new Date(rango.dFechFin);
      //  fecha = addDays(fecha, 1)
      //) {
      //  eventos.push({
      //    id: rango.nIdResp,
      //    start: startOfDay(fecha),
      //    title: "Mi rango",
      //    color: colors.misRangos,
      //  });
      //}

      eventos.push({
        id: rango.nIdResp,
        start: new Date(rango.dFechIni),
        end: new Date(rango.dFechFin),
        color: colors.misRangos,
        title:
          "Inicio : " +
          moment(new Date(rango.dFechIni)).format("DD/MM/YYYY") +
          " - Termino : " +
          moment(new Date(rango.dFechFin)).format("DD/MM/YYYY"),
        allDay: true,
        draggable: false,
      });
    });

    return eventos;
  }

  public static rangoResposableSeleccionado(
    listaRangos: IRangoDeResposablePorRangoFechaRgCEM[]
  ): CalendarEvent[] {
    var eventos: CalendarEvent[] = [];

    listaRangos.forEach((rango) => {
      //for (
      //  let fecha = new Date(rango.dFechIni);
      //  fecha <= new Date(rango.dFechFin);
      //  fecha = addDays(fecha, 1)
      //) {
      //  eventos.push({
      //    id: rango.nIdResp,
      //    start: startOfDay(fecha),
      //    title: "Resposable seleccionado",
      //    color: colors.responsableSeleccionado,
      //  });
      //}

      eventos.push({
        id: rango.nIdResp,
        start: new Date(rango.dFechIni),
        end: new Date(rango.dFechFin),
        color: colors.responsableSeleccionado,
        title:
          "Inicio : " +
          moment(new Date(rango.dFechIni)).format("DD/MM/YYYY") +
          " - Termino : " +
          moment(new Date(rango.dFechFin)).format("DD/MM/YYYY"),
        allDay: true,
        draggable: false,
      });
    });

    return eventos;
  }
}
