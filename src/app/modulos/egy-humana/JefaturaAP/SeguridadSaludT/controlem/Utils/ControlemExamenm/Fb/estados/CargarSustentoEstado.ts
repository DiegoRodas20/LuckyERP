import { ControlemExamenmComponent } from "../../../../Modals/controlem-examenm/controlem-examenm.component";
import DocumentoComando from "../../../Comandos/Documentos/DocumentoComando";
import EnviarPDFServicio from "../../../Comandos/Documentos/EnviarPdfServicio";
import { IComandoCEM } from "../../../Comandos/IComandoCem";
import { IEstadoFb } from "../IEstadoFb";

export default class CargarSustentoEstado implements IEstadoFb {
  comandoDocumentos: IComandoCEM = new DocumentoComando();
  animacion = "active";
  opciones: any[] = [];
  cargar: any[] = [
    {
      icon: "file_upload",
      tool: "Cargar sustento",
    },
  ];

  constructor(private componente: ControlemExamenmComponent) {
    this._mostrarOpciones();
  }
  getAnimacion() {
    return this.animacion;
  }
  getOpciones() {
    return this.opciones;
  }
  opcionesMostrarOcultar() {
    if (this.animacion === "active") {
      this._ocultarOpciones();
      return;
    }

    if (this.animacion === "inactive") {
      this._mostrarOpciones();
      return;
    }
  }

  private _mostrarOpciones() {
    this.delay(250).then((any) => {
      this.animacion = "active";
      this.opciones = this.cargar;
    });
  }

  private _ocultarOpciones() {
    this.animacion = "inactive";
    this.opciones = [];
  }
  ejecutar(index: number) {
    if (index === 0) {
      this._cargarSustento();
      return;
    }
  }

  private async _cargarSustento() {
    var x = document.createElement("input");
    x.setAttribute("type", "file");
    x.accept = ".pdf";
    x.click();

    x.addEventListener(
      "change",
      async () => {
        this.componente.spi.show("spi_nuevo_examen_medico");
        await this._enviarPdf(x.files[0]);
        this.componente.fb.cambiarEstado(0);
        this.componente.spi.hide("spi_nuevo_examen_medico");
      },
      false
    );
  }

  private async _enviarPdf(urlFile: File) {
    const sFile = await this.getStringFromFile(urlFile);
    const iFile = sFile.indexOf(",") + 1;
    const sFileSustento = sFile.substring(iFile, sFile.length);

    const servicio = new EnviarPDFServicio(this.componente.service);
    servicio.setData(sFileSustento, 8, "examen_medico");
    this.comandoDocumentos.setServicio(servicio);
    const urlarchivoGuardado = await this.comandoDocumentos.ejecutar();
    this.componente.urlDocumento = urlarchivoGuardado;
  }

  async getStringFromFile(fSustento: File) {
    return new Promise<any>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(fSustento);
      reader.onload = () => {
        resolve(reader.result);
      };
    });
  }
  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }
}
