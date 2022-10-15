import * as moment from "moment";
import Swal from "sweetalert2";

import { ICitaExamenPersonal } from "src/app/modulos/egy-humana/JefaturaAP/Model/Icontrolem";
import { ControlemExamenmComponent } from "../../../../Modals/controlem-examenm/controlem-examenm.component";
import DocumentoComando from "../../../Comandos/Documentos/DocumentoComando";
import EliminarPDFServicio from "../../../Comandos/Documentos/EliminarPDFServicio";
import EnviarPDFServicio from "../../../Comandos/Documentos/EnviarPdfServicio";
import EditarExamenMedicoServicio from "../../../Comandos/ExamenMedico/EditarExamenMedicoServicio";
import { IComandoCEM } from "../../../Comandos/IComandoCem";
import ValidacionFormulario from "../../Validaciones/handlers/ValidacionFormulario";
import ValidacionFormularioModificado from "../../Validaciones/handlers/ValidacionFormularioModificado";
import { IEstadoFb } from "../IEstadoFb";

export default class EdicionExamenEstado implements IEstadoFb {
  documentoAnterior = "";
  fechIniAnterior: Date;
  fechFinAnterior: Date;
  citaAnterior: ICitaExamenPersonal;

  seCargoNuevoDocumento = false;

  comandoDocumento: IComandoCEM = new DocumentoComando();
  animacion = "active";
  opciones: any[] = [];
  cargar_actualizar_cancelar: any[] = [
    {
      icon: "file_upload",
      tool: "Cargar sustento",
    },
    {
      icon: "save",
      tool: "Guardar",
    },
    {
      icon: "close",
      tool: "Cancelar",
    },
  ];

  constructor(private componente: ControlemExamenmComponent) {
    this._mostrarOpciones();
    this.configuracionIniciarEdicion();
  }

  public configuracionIniciarEdicion() {
    this.citaAnterior = this.componente.infoPersonal.listaCitasSinExamen.find(
      (v) => v.nIdRangoEM === 0
    );
    this.fechIniAnterior =
      this.componente.infoPersonal.form.controls.dFechIniEm.value;
    this.fechFinAnterior =
      this.componente.infoPersonal.form.controls.dFechFinEm.value;
    this.documentoAnterior = this.componente.urlDocumento;
    this.componente.infoPersonal.form.controls.nIdCitaEm.enable();
    this.componente.infoPersonal.form.controls.dFechIniEm.enable();
  }

  //#region OPCIONES
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
      this.opciones = this.cargar_actualizar_cancelar;
    });
  }

  private _ocultarOpciones() {
    this.animacion = "inactive";
    this.opciones = [];
  }
  //#endregion

  ejecutar(index: number) {
    if (index === 0) {
      this._cargarSustento();
      return;
    }

    if (index === 1) {
      this._validacionConfirmacionActualizarDocumento();
      return;
    }

    if (index === 2) {
      this._cancelarEdicion(index);
      return;
    }
  }

  //#region SUBIR DOCUMENTO
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
    await this._eliminarDocumento();
    const sFile = await this.getStringFromFile(urlFile);
    const iFile = sFile.indexOf(",") + 1;
    const sFileSustento = sFile.substring(iFile, sFile.length);

    const servicio = new EnviarPDFServicio(this.componente.service);
    servicio.setData(sFileSustento, 8, "examen_medico");
    this.comandoDocumento.setServicio(servicio);
    const urlarchivoGuardado = await this.comandoDocumento.ejecutar();
    this.componente.urlDocumento = urlarchivoGuardado;
    this.seCargoNuevoDocumento = true;
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

  private async _eliminarDocumento() {
    if (this.seCargoNuevoDocumento && this.componente.urlDocumento !== "") {
      const urlSplit = this.componente.urlDocumento.split("/");
      const nombre = urlSplit[urlSplit.length - 1];

      const servicio = new EliminarPDFServicio(this.componente.service);
      servicio.setData(nombre, 8);
      this.comandoDocumento.setServicio(servicio);
      await this.comandoDocumento.ejecutar();
      this.componente.urlDocumento = "";
      this.componente.fb.cambiarEstado(0);
    }
  }
  //#endregion

  //#region ACTUALIZAR DOCUMENTO

  private async _validacionConfirmacionActualizarDocumento() {
    const res = await this._validacionActualizarDocumento();
    if (res) {
      this._confirmacionActualizarDocumento();
    }
  }

  private async _validacionActualizarDocumento(): Promise<boolean> {
    const formularioLleno = new ValidacionFormulario(
      this.componente.infoPersonal.form
    );

    const formulariModificado = new ValidacionFormularioModificado({
      form: this.componente.infoPersonal.form,
      urlOriginalDoc: this.componente.urlDocumento,
      urlRespaldoDoc: this.documentoAnterior,
    });

    formularioLleno.setNext(formulariModificado);

    const resp = await formularioLleno.handle();

    if (resp !== null) {
      this.componente.snackBar.open(resp, "Cerrar", {
        duration: 1000,
        horizontalPosition: "right",
        verticalPosition: "top",
      });
    }

    return resp === null;
  }

  private _confirmacionActualizarDocumento() {
    Swal.fire({
      title: "¿ Actualizar ?",
      text:
        "Se modificara el examen de : " +
        this.componente.infoPersonal.getValorCampo("sNombres"),
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ff4081",
      confirmButtonText: "Si, actualizar",
      cancelButtonText: "Cancelar",
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this._actualizarDocumento(1);
        this.componente.recargarCerrarMadal = true;
        Swal.fire({
          title: "Actualizado",
          text: "Examen se actualizo satisfactoriamente",
          icon: "success",
        });
      }
    });
  }

  private async _actualizarDocumento(index: number) {
    const dataForm = this.componente.infoPersonal.form.getRawValue();
    const sFechIniEm: string = moment(dataForm.dFechIniEm).format("MM/DD/YYYY");
    const sFechFinEm: string = moment(dataForm.dFechFinEm).format("MM/DD/YYYY");

    await this._envioInformacion(
      this.componente.nIdExamenMedico,
      dataForm.nIdCitaEm,
      sFechIniEm,
      sFechFinEm,
      this.componente.urlDocumento
    );
    await this._configuracionActualizarDocumento();
    this.componente.fb.cambiarEstado(index);
  }

  private async _envioInformacion(
    nIdExamenM: number,
    nIdCitaEM: number,
    sFechIni: string,
    sFechFin: string,
    sFileSustento: string
  ) {
    const servicio = new EditarExamenMedicoServicio(this.componente.service);
    servicio.setData(nIdExamenM, nIdCitaEM, sFechIni, sFechFin, sFileSustento);
    this.comandoDocumento.setServicio(servicio);
    await this.comandoDocumento.ejecutar();
  }

  private async _configuracionActualizarDocumento() {
    await this._eliminarDocumentoAnterior();
    this.componente.infoPersonal.form.controls.nIdCitaEm.disable();
    this.componente.infoPersonal.form.controls.dFechIniEm.disable();
  }

  private async _eliminarDocumentoAnterior() {
    if (this.seCargoNuevoDocumento && this.documentoAnterior !== "") {
      const urlSplit = this.documentoAnterior.split("/");
      const nombre = urlSplit[urlSplit.length - 1];

      const servicio = new EliminarPDFServicio(this.componente.service);
      servicio.setData(nombre, 8);
      this.comandoDocumento.setServicio(servicio);
      await this.comandoDocumento.ejecutar();
    }
  }
  //#endregion

  //#region CANCELAR EDICION
  private async _cancelarEdicion(index: number) {
    await this.revirtiendoConfiguracionCancelar();
    this.componente.fb.cambiarEstado(index);
  }

  public async revirtiendoConfiguracionCancelar() {
    await this._eliminarDocumento();

    this.componente.infoPersonal.form.controls.nIdCitaEm.patchValue(
      this.citaAnterior.nIdCitaEm
    );
    this.componente.infoPersonal.form.controls.nIdCitaEm.disable();

    this.componente.infoPersonal.form.controls.dFechIniEm.patchValue(
      this.fechIniAnterior
    );

    this.componente.infoPersonal.form.controls.dFechFinEm.patchValue(
      this.fechFinAnterior
    );
    this.componente.infoPersonal.form.controls.dFechIniEm.disable();

    this.componente.urlDocumento = this.documentoAnterior;

    this.componente.infoPersonal.form.markAsPristine();
  }
  //#endregion

  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }
}
