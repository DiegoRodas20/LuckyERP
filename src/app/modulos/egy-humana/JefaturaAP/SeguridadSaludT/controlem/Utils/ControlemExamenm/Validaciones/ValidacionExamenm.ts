import Handler from "./Handler";

export default abstract class ValidacionExamenm implements Handler {
  private nextHandler: Handler;
  data: any;

  constructor(data: any) {
    this.data = data;
  }

  setNext(handler: Handler): Handler {
    this.nextHandler = handler;
    return handler;
  }

  async handle(): Promise<string> {
    if (this.nextHandler) {
      return await this.nextHandler.handle();
    }
    return null;
  }
}
