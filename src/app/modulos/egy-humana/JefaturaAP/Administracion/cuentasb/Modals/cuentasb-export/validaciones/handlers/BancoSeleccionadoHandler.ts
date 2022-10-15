import ValidacionEnvioData from "../ValidacionEnvioData";

export default class BancoSeleccionadoHandler extends ValidacionEnvioData {
  public handle(): string {
    if ((this.data as number) === 0) {
      return "Seleccionar una banco por favor.";
    }
    return super.handle();
  }
}
