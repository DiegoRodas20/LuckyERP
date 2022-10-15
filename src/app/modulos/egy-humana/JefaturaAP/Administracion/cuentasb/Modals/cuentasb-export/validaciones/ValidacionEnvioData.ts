import Handler from "./Handler";

export default abstract class ValidacionEnvioData implements Handler {
  private nextHandler: Handler;
  data: any;

  constructor(data: any) {
    this.data = data;
  }

  setNext(handler: Handler): Handler {
    this.nextHandler = handler;
    return handler;
  }

  handle(): string {
    if (this.nextHandler) {
      return this.nextHandler.handle();
    }
    return null;
  }
}
