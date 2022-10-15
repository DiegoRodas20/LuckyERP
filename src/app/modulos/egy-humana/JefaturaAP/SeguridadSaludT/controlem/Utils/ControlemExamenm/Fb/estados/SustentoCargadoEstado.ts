import * as moment from "moment";

import { ControlemExamenmComponent } from "../../../../Modals/controlem-examenm/controlem-examenm.component";
import DocumentoComando from "../../../Comandos/Documentos/DocumentoComando";
import EliminarPDFServicio from "../../../Comandos/Documentos/EliminarPDFServicio";
import ExamenMedicoComando from "../../../Comandos/ExamenMedico/ExamenMedicoComando";
import GuardarExamenMedicoServicio from "../../../Comandos/ExamenMedico/GuardarExamenMedicoServicio";
import { IComandoCEM } from "../../../Comandos/IComandoCem";
import { IEstadoFb } from "../IEstadoFb";
import Swal from "sweetalert2";
import ValidacionFormulario from "../../Validaciones/handlers/ValidacionFormulario";
export default class SustentoCargadoEstado implements IEstadoFb {
  comandoDocumento: IComandoCEM = new DocumentoComando();
  comandoExamenM: IComandoCEM = new ExamenMedicoComando();

  animacion = "inactive";
  opciones: any[] = [];
  guardar_cancelar_limpiar: any[] = [
    {
      icon: "save",
      tool: "Guardar",
    },
    {
      icon: "close",
      tool: "Cancelar",
    },
    {
      icon: "cleaning_services",
      tool: "Limpiar",
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
      this.opciones = this.guardar_cancelar_limpiar;
    });
  }

  private _ocultarOpciones() {
    this.animacion = "inactive";
    this.opciones = [];
  }
  ejecutar(index: number) {
    if (index === 0) {
      this._validacionConfirmacionGuardarExamenMedico();
      return;
    }
    if (index === 1) {
      this._cancelarSustento();
      return;
    }
    if (index === 2) {
      this._limpiarSustento();
      return;
    }
  }

  private async _validacionConfirmacionGuardarExamenMedico() {
    const res = await this._validacionGuardarExamenMedico();
    if (res) {
      this._confirmacionGuardarExamenMedico();
    }
  }

  private async _validacionGuardarExamenMedico(): Promise<boolean> {
    const formularioLleno = new ValidacionFormulario(
      this.componente.infoPersonal.form
    );
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

  private _confirmacionGuardarExamenMedico() {
    Swal.fire({
      title: "¿ Guardar ?",
      text:
        "Se creara un nuevo examen medico para : " +
        this.componente.infoPersonal.getValorCampo("sNombres"),
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ff4081",
      confirmButtonText: "Si, guardar",
      cancelButtonText: "Cancelar",
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this._guardarSustento();
        Swal.fire({
          title: "Guardado",
          text: "Examen creado satisfactoriamente",
          icon: "success",
        });
        this.componente.recargarCerrarMadal = true;
        this.componente.closeModal();
      }
    });
  }

  private async _guardarSustento() {
    const dataForm = this.componente.infoPersonal.form.getRawValue();
    const sFechIniEm: string = moment(dataForm.dFechIniEm).format("MM/DD/YYYY");
    const sFechFinEm: string = moment(dataForm.dFechFinEm).format("MM/DD/YYYY");
    const servicio = new GuardarExamenMedicoServicio(this.componente.service);
    servicio.setData(
      dataForm.nIdCitaEm,
      dataForm.nIdPerlab,
      sFechIniEm,
      sFechFinEm,
      this.componente.urlDocumento
    );
    this.comandoExamenM.setServicio(servicio);

    this.componente.spi.show("spi_nuevo_examen_medico");
    await this.comandoExamenM.ejecutar();
    this.componente.spi.hide("spi_nuevo_examen_medico");
  }

  private async _cancelarSustento() {
    this.componente.spi.show("spi_nuevo_examen_medico");
    await this._eliminarDocumento();
    this.componente.spi.hide("spi_nuevo_examen_medico");
    this.componente.closeModal();
  }

  private async _limpiarSustento() {
    this.componente.spi.show("spi_nuevo_examen_medico");
    await this._eliminarDocumento();
    this.componente.spi.hide("spi_nuevo_examen_medico");
    this.componente.fb.cambiarEstado(2);
  }

  private async _eliminarDocumento() {
    if (this.componente.urlDocumento !== "") {
      const urlSplit = this.componente.urlDocumento.split("/");
      const nombre = urlSplit[urlSplit.length - 1];

      const servicio = new EliminarPDFServicio(this.componente.service);
      servicio.setData(nombre, 8);
      this.comandoDocumento.setServicio(servicio);
      await this.comandoDocumento.ejecutar();
      this.componente.urlDocumento = "";
    }
  }

  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }
}
