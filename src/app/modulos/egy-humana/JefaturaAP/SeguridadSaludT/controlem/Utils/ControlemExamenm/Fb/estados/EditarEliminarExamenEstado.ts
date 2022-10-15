import Swal from "sweetalert2";

import { ControlemExamenmComponent } from "../../../../Modals/controlem-examenm/controlem-examenm.component";
import DocumentoComando from "../../../Comandos/Documentos/DocumentoComando";
import EliminarPDFServicio from "../../../Comandos/Documentos/EliminarPDFServicio";
import EliminarExamenMedicoServicio from "../../../Comandos/ExamenMedico/EliminarExamenMedicoServicio";
import ExamenMedicoComando from "../../../Comandos/ExamenMedico/ExamenMedicoComando";
import { IComandoCEM } from "../../../Comandos/IComandoCem";
import ValidacionEliminarExamen from "../../Validaciones/handlers/ValidacionEliminarExamen";
import { EstadosFbExamenmEnumCEM } from "../EstadosFbExamenmEnumCEM";
import { IEstadoFb } from "../IEstadoFb";

export default class EditarEliminarExamenEstado implements IEstadoFb {
  estadosEnum = EstadosFbExamenmEnumCEM;
  comandoDocumento: IComandoCEM = new DocumentoComando();
  comandoExamenMedico: IComandoCEM = new ExamenMedicoComando();

  animacion = "active";
  opciones: any[] = [];
  editar_eliminar: any[] = [
    {
      icon: "edit",
      tool: "Editar examen",
    },
    {
      icon: "delete",
      tool: "Eliminar examen",
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
      this.opciones = this.editar_eliminar;
    });
  }

  private _ocultarOpciones() {
    this.animacion = "inactive";
    this.opciones = [];
  }
  public ejecutar(index: number) {
    if (index === 0) {
      this._mostrarOpcionesDeEdicion(index);
      return;
    }

    if (index === 1) {
      this._validacionConfirmacionEliminarExamen();
      return;
    }
  }

  private _mostrarOpcionesDeEdicion(index: number) {
    Swal.fire({
      title: "Editar",
      text: "¿ Estas seguro(a) de editar este examen ? ",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ff4081",
      confirmButtonText: "Si, editar",
      cancelButtonText: "Cancelar",
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.componente.fb.cambiarEstado(index);
      }
    });
  }

  //#region ELIMINAR EXAMEN
  private async _validacionConfirmacionEliminarExamen() {
    const res = await this._validacionEliminarExamenMedico();
    if (res) {
      this._confirmacionEliminarExamenMedico();
    }
  }

  private async _validacionEliminarExamenMedico(): Promise<boolean> {
    var validacionEliminar = new ValidacionEliminarExamen(
      this.componente.examenSeleccionado
    );
    var resp = await validacionEliminar.handle();
    if (resp !== null) {
      this.componente.snackBar.open(resp, "Cerrar", {
        duration: 1000,
        horizontalPosition: "right",
        verticalPosition: "top",
      });
    }
    return resp === null;
  }

  private _confirmacionEliminarExamenMedico() {
    Swal.fire({
      title: "¿ Eliminar ?",
      text: "Una vez eliminado no se podra recuperar ",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ff4081",
      confirmButtonText: "Si, eliminar",
      cancelButtonText: "Cancelar",
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this._eliminarExamen();
        Swal.fire({
          title: "Eliminado",
          text: "El examen fue eliminado satisfactoriamente",
          icon: "success",
        });
        this.componente.recargarCerrarMadal = true;
        this.componente.closeModal();
      }
    });
  }

  private async _eliminarExamen() {
    await this._eliminarDocumentoDelExamen();
    const servicioExamenMedico = new EliminarExamenMedicoServicio(
      this.componente.service
    );
    servicioExamenMedico.setData(this.componente.nIdExamenMedico);
    this.comandoExamenMedico.setServicio(servicioExamenMedico);
    await this.comandoExamenMedico.ejecutar();
  }

  private async _eliminarDocumentoDelExamen() {
    if (this.componente.urlDocumento !== "") {
      const urlSplit = this.componente.urlDocumento.split("/");
      const nombre = urlSplit[urlSplit.length - 1];

      const servicioDocumento = new EliminarPDFServicio(
        this.componente.service
      );
      servicioDocumento.setData(nombre, 8);
      this.comandoDocumento.setServicio(servicioDocumento);
      await this.comandoDocumento.ejecutar();
    }
  }

  //#endregion

  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }
}
