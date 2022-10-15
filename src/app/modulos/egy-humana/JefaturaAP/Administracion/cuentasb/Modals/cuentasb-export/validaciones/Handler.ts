export default interface Handler {
  setNext(handler: Handler): Handler;

  handle(): string;
}
