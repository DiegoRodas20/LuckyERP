import * as moment from "moment";

import { IBuscadorPersonaCitaMedica } from "../../../../Model/Igestionem";
import { GestionemService } from "../../../../Services/gestionem.service";
import { IPersonaServicio } from "./IPersonaServicio";

export default class BuscadorPersonaCitaMedica implements IPersonaServicio {
  nIdPersonal: string;
  nIdRangoEM: number;
  constructor(
    private service: GestionemService,
    nIdPersonal: string,
    nIdRangoEM: number
  ) {
    this.nIdPersonal = nIdPersonal;
    this.nIdRangoEM = nIdRangoEM;
  }
  async obtenerData(): Promise<IBuscadorPersonaCitaMedica[]> {
    var data: any;
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem("Empresa"));
    var sparam = "";
    sparam = sparam + "0¡nIdEmp!" + nIdEmp;
    sparam = sparam + "-0¡K.nIdResp!" + this.nIdPersonal;
    sparam = sparam + "-0¡PER.nIdResp!" + this.nIdPersonal;
    sparam = sparam + "-0¡nIdRangoEM!" + this.nIdRangoEM;
    sparam = sparam + "-0¡PER.nIdEmp!" + nIdEmp;

    param.push(sparam);
    data = await this.service._loadSP(8, param);
    data = this._filtroCitaVigente(data);
    data = this._filtroData(data);
    data = this._asignarDataEstado(data);
    return data;
  }

  //#region FILTRO DE DATA
  // Estado por vencer - vencido - sin examen
  private _filtroData(data: IBuscadorPersonaCitaMedica[]) {
    return data.filter((persona) => this._filtrarPersona(persona));
  }

  private _filtrarPersona(persona: IBuscadorPersonaCitaMedica): boolean {
    if (this._verificarEstadoSinExamen(persona)) return true;
    if (this._verificarEstadoVencido(persona)) return true;
    if (this._verificarEstadoPorVencer(persona)) return true;

    return false;
  }

  private _verificarEstadoSinExamen(
    persona: IBuscadorPersonaCitaMedica
  ): boolean {
    return persona.nIdExamenM === 0;
  }

  private _verificarEstadoVencido(
    persona: IBuscadorPersonaCitaMedica
  ): boolean {
    var fechaActual = new Date();
    return new Date(persona.dFechFinEm) < fechaActual;
  }

  private _verificarEstadoPorVencer(
    persona: IBuscadorPersonaCitaMedica
  ): boolean {
    var fechaActual = new Date();
    var fechaInicioTresMesesAntes: Date = moment(persona.dFechFinEm)
      .subtract(3, "M")
      .toDate();

    return (
      new Date(fechaInicioTresMesesAntes) <= fechaActual &&
      fechaActual <= new Date(persona.dFechFinEm)
    );
  }
  //#endregion

  //#region ASIGNAR ESTADO A LA DATA
  private _asignarDataEstado(
    data: IBuscadorPersonaCitaMedica[]
  ): IBuscadorPersonaCitaMedica[] {
    data = data.map((persona) => {
      return this._calcularEstadoPersona(persona);
    });

    return data;
  }

  private _calcularEstadoPersona(
    persona: IBuscadorPersonaCitaMedica
  ): IBuscadorPersonaCitaMedica {
    if (this._sinExamenMedico(persona) !== null) {
      persona = this._sinExamenMedico(persona);
      return persona;
    }

    if (this._vigente(persona)) {
      persona = this._vigente(persona);
      return persona;
    }

    if (this._porVencer(persona)) {
      persona = this._porVencer(persona);
      return persona;
    }

    if (this._vencido(persona)) {
      persona = this._vencido(persona);
      return persona;
    }

    return persona;
  }
  // SIN EXAMEN MEDICO - No tiene registrado un examen
  private _sinExamenMedico(
    persona: IBuscadorPersonaCitaMedica
  ): IBuscadorPersonaCitaMedica {
    if (persona.nIdExamenM === 0) {
      persona.cEleNamEstado = "Sin exámen médico";
      persona.nEleCodEstado = 2318;
      return persona;
    }
    return null;
  }

  // VIGENTE - esta dentro de los 2 años y antes de 3 meses por vencer
  private _vigente(
    persona: IBuscadorPersonaCitaMedica
  ): IBuscadorPersonaCitaMedica {
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
  private _porVencer(
    persona: IBuscadorPersonaCitaMedica
  ): IBuscadorPersonaCitaMedica {
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
  private _vencido(
    persona: IBuscadorPersonaCitaMedica
  ): IBuscadorPersonaCitaMedica {
    var fechaActual = new Date();
    if (new Date(persona.dFechFinEm) < fechaActual) {
      persona.cEleNamEstado = "Vencido";
      persona.nEleCodEstado = 2320;
      return persona;
    }
    return null;
  }

  //#endregion

  //#region VERIFICAR SI TIENE UNA CITA VIGENTE
  private _filtroCitaVigente(data: IBuscadorPersonaCitaMedica[]) {
    return data.filter((persona) => this._filtrarPersonaCitaVigente(persona));
  }

  private _filtrarPersonaCitaVigente(persona: IBuscadorPersonaCitaMedica) {
    if (persona.nIdCitaEM !== 0) {
      const fechaCita: Date = new Date(persona.dFechCita);
      return fechaCita <= new Date();
    }
    return true;
  }
  //#endregion
}
