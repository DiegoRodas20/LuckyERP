import * as moment from "moment";

export default class ExamenEstados<T> {
  public agregarEstadoExamenData(data: any): T[] {
    data = data.map((item) => {
      return this._calcularEstadoPersona(item);
    });

    return data;
  }

  private _calcularEstadoPersona(item: T): T {
    if (this._sinExamenMedico(item) !== null) {
      item = this._sinExamenMedico(item);
      return item;
    }

    if (this._vigente(item) !== null) {
      item = this._vigente(item);
      return item;
    }

    if (this._porVencer(item) !== null) {
      item = this._porVencer(item);
      return item;
    }

    if (this._vencido(item) !== null) {
      item = this._vencido(item);
      return item;
    }

    return item;
  }

  private _sinExamenMedico(item: any): T {
    if (item.nIdExamenM === 0) {
      item.sEstado = "Sin exámen médico";
      item.nEstado = 2318;
      return item;
    }
    return null;
  }

  // VIGENTE - esta dentro de los 2 años y antes de 3 meses por vencer
  private _vigente(item: any): T {
    var fechaFinalTresMesesAntes: Date = moment(item.dFechFinEm)
      .subtract(3, "M")
      .toDate();
    var fechaActual = new Date();

    if (fechaActual < fechaFinalTresMesesAntes) {
      item.sEstado = "Vigente";
      item.nEstado = 2317;
      return item;
    }
    return null;
  }

  // POR VENCER - dentro de los ultimos 3 meses
  private _porVencer(item: any): T {
    var fechaInicioTresMesesAntes: Date = moment(item.dFechFinEm)
      .subtract(3, "M")
      .toDate();
    var fechaActual = new Date();

    if (
      fechaInicioTresMesesAntes <= fechaActual &&
      fechaActual <= new Date(item.dFechFinEm)
    ) {
      item.sEstado = "Por vencer";
      item.nEstado = 2319;
      return item;
    }
    return null;
  }

  // VENCIDO - sobrepaso la fecha de fin
  private _vencido(item: any): T {
    var fechaActual = new Date();
    if (new Date(item.dFechFinEm) < fechaActual) {
      item.sEstado = "Vencido";
      item.nEstado = 2320;
      return item;
    }
    return null;
  }
}
