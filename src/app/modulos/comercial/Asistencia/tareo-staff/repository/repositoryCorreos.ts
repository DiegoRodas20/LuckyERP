export class RepositoryCorreos {
  private p1: string = 'Lucky';
  private p2: string = 'TAREO DE STAFF';
  private p3: string = 'ENVIADO POR COMERCIAL';
  private p5: string = '#E07171';
  private p6: string = '';
  private p7: string = '';
  private p8: string = 'Se ha registrado un nuevo tareo de staff.';
  private p9: string = '';
  private p10: string = '';
  private p12: string = 'ENVIADO';
  private p15: string = '604';
  private p16: string = '1';
  private fechaEnvio: string = new Date().toLocaleString('medium');
  private destinatario: string = "fenco@lucky.com";
  // private destinatario: string = "fenco@lucky.com.pe;jgutierrezp@bbox.com.pe";
  public correlativo: string;
  public responsable: string;
  public personal: string;
  public login: string;

  // P04
  NumeroTareo() {
    return `TS -${this.correlativo}`;
  }

  // P11
  Registrado() {
    return `${this.responsable}  registró un tareo de staff del personal ${this.personal}`;
  }

  // P13
  Login() {
    return `${this.login}`;
  }

  // P14
  FechaEnvio() {
    return `${this.fechaEnvio}`;
  }

  // P17
  Destinatario() {
    return `${this.destinatario}`;
  }

  //P18
  Asunto() {
    return `Asunto Tareo de Staff enviado por Comercial TS - ${this.correlativo}`;
  }

  envioCorreo() {
    let pParametro = [];
    let list = [this.p1, this.p2, this.p3,
    this.NumeroTareo(), this.p5, this.p6,
    this.p7, this.Registrado(), this.p9, this.p10, this.p8,
    this.p12, this.responsable, this.FechaEnvio(),
    this.p15, this.p16, this.Destinatario(), this.Asunto()]

    for (let i of list) {
      pParametro.push(i);
    }

    return pParametro;
  }
}
