export class RepositoryMensajes {
  private error: string = `ATENCION NO PODRA CONTINUAR`;
  private observaciones: string = `Las siguientes campañas tienen observaciones : `;
  private guardar: string = `Tareo guardado correctamente.`;
  private enviar: string = ` Tareo, enviado a RR.HH. Correctamente.`;
  private sinTareo: string = `No se encontraron mas registros, ninguna campaña cumple
                              las condiciones requeridas,por favor coordine con su ejecutiva(o)`;

  mensajeGuardar() {
    return this.guardar;
  }

  mensajeEnviar() {
    return this.enviar;
  }
  mensajeSinTareos() {
    return this.sinTareo;
  }
  mensajeObservaciones(campania1: string, campania2: string,) {
    return this.observaciones + `${campania1} - ${campania2}`;
  }
  mensajeError() {
    return this.error;
  }
  mensajePregunta(opcion: string) {
    return `¿Desea ${opcion} el tareo?`;
  }
  
}