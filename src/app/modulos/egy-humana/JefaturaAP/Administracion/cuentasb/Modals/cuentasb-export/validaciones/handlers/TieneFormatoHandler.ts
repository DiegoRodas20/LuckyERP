import ValidacionEnvioData from "../ValidacionEnvioData";

export default class TieneFormatoHandler extends ValidacionEnvioData {
  public handle(): string {
    if (this.data as boolean) {
      return "El banco no posee un formato.";
    }
    return super.handle();
  }
}
