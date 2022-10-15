import * as moment from "moment";

import { ITrabajador } from "../../../../Model/Igestionem";
import { GestionemService } from "../../../../Services/gestionem.service";
import IGeneralServicio from "./IGeneralServicio";

export default class EquipoTrabajoActualServicio implements IGeneralServicio {
  nIdPersonal: string;
  constructor(private service: GestionemService, nIdPersonal: string) {
    this.nIdPersonal = nIdPersonal;
  }

  async obtenerData(): Promise<ITrabajador[]> {
    var data: any;
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem("Empresa"));

    param.push(
      "0¡nIdEmp!" +
        nIdEmp +
        "-0¡K.nIdResp!" +
        this.nIdPersonal +
        "-0¡PER.nIdResp!" +
        this.nIdPersonal +
        "-0¡PER.nIdEmp!" +
        nIdEmp
    );
    data = await this.service._loadSP(2, param);
    data = EstadoDelExamenMedico.agregarEstadoExamenData(data);
    return data;
  }
}
class EstadoDelExamenMedico {
  public static agregarEstadoExamenData(data: any): ITrabajador[] {
    data = data.map((persona) => {
      return this._calcularEstadoPersona(persona);
    });

    return data;
  }

  private static _calcularEstadoPersona(persona: ITrabajador): ITrabajador {
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

  private static _sinExamenMedico(persona: ITrabajador): ITrabajador {
    if (persona.nIdExamenM === 0) {
      persona.cEleNamEstado = "Sin exámen médico";
      persona.nEleCodEstado = 2318;
      return persona;
    }
    return null;
  }

  // VIGENTE - esta dentro de los 2 años y antes de 3 meses por vencer
  private static _vigente(persona: ITrabajador): ITrabajador {
    var fechaFinalTresMesesAntes: Date = moment(persona.dFechFinEm)
      .subtract(3, "M")
      .toDate();
    var fechaActual = new Date();

    if (fechaActual < new Date(fechaFinalTresMesesAntes)) {
      persona.cEleNamEstado = "Vigente";
      persona.nEleCodEstado = 2317;
      return persona;
    }
    return null;
  }

  // POR VENCER - dentro de los ultimos 3 meses
  private static _porVencer(persona: ITrabajador): ITrabajador {
    var fechaInicioTresMesesAntes: Date = moment(persona.dFechFinEm)
      .subtract(3, "M")
      .toDate();
    var fechaActual = new Date();

    if (
      new Date(fechaInicioTresMesesAntes) <= fechaActual &&
      fechaActual <= new Date(persona.dFechFinEm)
    ) {
      persona.cEleNamEstado = "Por vencer";
      persona.nEleCodEstado = 2319;
      return persona;
    }
    return null;
  }

  // VENCIDO - sobrepaso la fecha de fin
  private static _vencido(persona: ITrabajador): ITrabajador {
    var fechaActual = new Date();
    if (new Date(persona.dFechFinEm) < fechaActual) {
      persona.cEleNamEstado = "Vencido";
      persona.nEleCodEstado = 2320;
      return persona;
    }
    return null;
  }
}
