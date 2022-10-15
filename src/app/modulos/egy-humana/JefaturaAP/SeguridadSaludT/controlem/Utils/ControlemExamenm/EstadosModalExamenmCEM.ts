import moment from "moment";
import { IExamenMedicoInfo } from "../../../../Model/Icontrolem";
import { ControlemExamenmComponent } from "../../Modals/controlem-examenm/controlem-examenm.component";
import ExamenMedicoComando from "../Comandos/ExamenMedico/ExamenMedicoComando";
import InformacionExamenMedicoServicio from "../Comandos/ExamenMedico/InformacionExamenMedicoServicio";
import { IComandoCEM } from "../Comandos/IComandoCem";
import CargarSustentoEstado from "./Fb/estados/CargarSustentoEstado";
import EditarEliminarExamenEstado from "./Fb/estados/EditarEliminarExamenEstado";
import { EstadosFbExamenmEnumCEM } from "./Fb/EstadosFbExamenmEnumCEM";

export default class EstadosModalExamenmCEM {
  estadosEnum = EstadosFbExamenmEnumCEM;
  comandoExamen: IComandoCEM = new ExamenMedicoComando();

  constructor(private componente: ControlemExamenmComponent) {}

  public async ejecutar(nIdEstadoModal: number) {
    if (nIdEstadoModal === 0) {
      await this._estadoCrearNuevoExamenMedico();
      return;
    }

    if (nIdEstadoModal === 1) {
      await this._estadoEditarExamenMedicoCreado();
      return;
    }
  }

  private async _estadoCrearNuevoExamenMedico() {
    this.componente.fb.setEstado(
      new CargarSustentoEstado(this.componente),
      this.estadosEnum.nuevoExamenSinSustento
    );

    this.componente.spi.show("spi_nuevo_examen_medico");
    await this.componente.infoPersonal.cargarInformacionServicio();
    await this.componente.infoPersonal.cargarCitasSinExamenPersonal();
    this.componente.spi.hide("spi_nuevo_examen_medico");
  }

  private async _estadoEditarExamenMedicoCreado() {
    this.componente.fb.setEstado(
      new EditarEliminarExamenEstado(this.componente),
      this.estadosEnum.editarEliminarExamen
    );

    this.componente.spi.show("spi_nuevo_examen_medico");
    await this.componente.infoPersonal.cargarInformacionServicio();
    await this.componente.infoPersonal.cargarCitasSinExamenPersonal();
    await this._cargarInformacionExamen();
    this.componente.spi.hide("spi_nuevo_examen_medico");
  }

  private async _cargarInformacionExamen() {
    const servicio = new InformacionExamenMedicoServicio(
      this.componente.service
    );
    servicio.setData(this.componente.nIdExamenMedico);
    this.comandoExamen.setServicio(servicio);
    const examen: IExamenMedicoInfo = await this.comandoExamen.ejecutar();
    this._configurandoInfoExamen(examen);
  }

  private _configurandoInfoExamen(examen: IExamenMedicoInfo) {
    this.componente.urlDocumento = examen.sFileSustento;
    this.componente.infoPersonal.listaCitasSinExamen.push({
      nIdCitaEm: examen.nIdCitaEM,
      dFecha: examen.dFechCita,
      nIdPerLab: examen.nIdPerlab,
      nIdRangoEM: 0,
    });

    this.componente.infoPersonal.form.controls.nIdCitaEm.patchValue(
      examen.nIdCitaEM
    );

    this.componente.infoPersonal.form.controls.nIdCitaEm.disable();

    this.componente.infoPersonal.form.controls.dFechIniEm.patchValue(
      examen.dFechIni
    );
    this.componente.infoPersonal.form.controls.dFechFinEm.patchValue(
      examen.dFechFin
    );

    this.componente.infoPersonal.form.controls.dFechIniEm.disable();
  }
}
