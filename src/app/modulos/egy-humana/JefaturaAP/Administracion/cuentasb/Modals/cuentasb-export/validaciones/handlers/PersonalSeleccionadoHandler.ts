import ValidacionEnvioData from "../ValidacionEnvioData";

export default class PersonalSeleccionadoHandler extends ValidacionEnvioData {
  public handle(): string {
    if (this.data.length <= 0) {
      return "Seleccione uno o mas trabajadores porfavor.";
    }
    return super.handle();
  }
}
