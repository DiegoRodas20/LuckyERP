import * as moment from "moment";
import { ICitaPorResposablePersonalDetalle } from "../../../../Model/Igestionem";
import { GestionemService } from "../../../../Services/gestionem.service";
import IGeneralServicio from "./IGeneralServicio";

export default class CitasPorResposablePersonalDetalleServicio
  implements IGeneralServicio {
  nIdResp: number;
  nIdPerLab: number;
  constructor(
    private service: GestionemService,
    nIdResp: number,
    nIdPerLab: number
  ) {
    this.nIdResp = nIdResp;
    this.nIdPerLab = nIdPerLab;
  }

  async obtenerData(): Promise<ICitaPorResposablePersonalDetalle[]> {
    var data: any;
    const param = [];
    param.push("0¡RANG.nIdResp!" + this.nIdResp);
    param.push("0¡CITA.nIdPerLab!" + this.nIdPerLab);

    data = await this.service._loadSP(9, param);
    data = EstadoDelExamenMedico.agregarEstadoExamenData(data);
    return data;
  }
}

class EstadoDelExamenMedico {
  public static agregarEstadoExamenData(
    data: any
  ): ICitaPorResposablePersonalDetalle[] {
    data = data.map((persona) => {
      return this._calcularEstadoPersona(persona);
    });

    return data;
  }

  private static _calcularEstadoPersona(
    persona: ICitaPorResposablePersonalDetalle
  ): ICitaPorResposablePersonalDetalle {
    if (this._sinExamenMedico(persona) !== null) {
      persona = this._sinExamenMedico(persona);
      return persona;
    }

    if (this._vigente(persona) !== null) {
      persona = this._vigente(persona);
      return persona;
    }

    if (this._porVencer(persona) !== null) {
      persona = this._porVencer(persona);
      return persona;
    }

    if (this._vencido(persona) !== null) {
      persona = this._vencido(persona);
      return persona;
    }

    return persona;
  }

  private static _sinExamenMedico(
    persona: ICitaPorResposablePersonalDetalle
  ): ICitaPorResposablePersonalDetalle {
    if (persona.nIdExamenM === 0) {
      persona.sEstado = "Sin exámen médico";
      persona.nEstado = 2318;
      return persona;
    }
    return null;
  }

  // VIGENTE - esta dentro de los 2 años y antes de 3 meses por vencer
  private static _vigente(
    persona: ICitaPorResposablePersonalDetalle
  ): ICitaPorResposablePersonalDetalle {
    var fechaFinalTresMesesAntes: Date = moment(persona.dFechFin)
      .subtract(3, "M")
      .toDate();
    var fechaActual = new Date();

    if (fechaActual < new Date(fechaFinalTresMesesAntes)) {
      persona.sEstado = "Vigente";
      persona.nEstado = 2317;
      return persona;
    }
    return null;
  }

  // POR VENCER - dentro de los ultimos 3 meses
  private static _porVencer(
    persona: ICitaPorResposablePersonalDetalle
  ): ICitaPorResposablePersonalDetalle {
    var fechaInicioTresMesesAntes: Date = moment(persona.dFechFin)
      .subtract(3, "M")
      .toDate();
    var fechaActual = new Date();

    if (
      new Date(fechaInicioTresMesesAntes) <= fechaActual &&
      fechaActual <= new Date(persona.dFechFin)
    ) {
      persona.sEstado = "Por vencer";
      persona.nEstado = 2319;
      return persona;
    }
    return null;
  }

  // VENCIDO - sobrepaso la fecha de fin
  private static _vencido(
    persona: ICitaPorResposablePersonalDetalle
  ): ICitaPorResposablePersonalDetalle {
    var fechaActual = new Date();
    if (new Date(persona.dFechFin) < fechaActual) {
      persona.sEstado = "Vencido";
      persona.nEstado = 2320;
      return persona;
    }
    return null;
  }
}
