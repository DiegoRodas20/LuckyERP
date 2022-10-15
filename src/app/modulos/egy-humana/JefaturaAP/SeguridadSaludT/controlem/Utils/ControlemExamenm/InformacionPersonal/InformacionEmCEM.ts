import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  ICitaExamenPersonal,
  IInformacionPersonal,
} from "src/app/modulos/egy-humana/JefaturaAP/Model/Icontrolem";
import { ControlemExamenmComponent } from "../../../Modals/controlem-examenm/controlem-examenm.component";
import CitasSinExamenPersonalServicio from "../../Comandos/Combo/CitasSinExamenPersonalComboServicio";
import ComboComando from "../../Comandos/Combo/ComboComando";
import { IComandoCEM } from "../../Comandos/IComandoCem";
import InformacionPersonalServicio from "../../Comandos/Personal/InformacionPersonalServicio";
import PersonalComando from "../../Comandos/Personal/PersonalComando";
import * as moment from "moment";

export default class InformacionEmCEM {
  _fb: FormBuilder = new FormBuilder();
  form: FormGroup = this._fb.group({
    sNombres: [{ value: "", disabled: true }],
    sCodPlla: [{ value: "", disabled: true }],
    sTipo: [{ value: "", disabled: true }],
    sDocumento: [{ value: "", disabled: true }],
    nIdCitaEm: [null, [Validators.required]],
    sResponsable: [{ value: "", disabled: true }],
    dFechIniEm: [{ value: null, disabled: true }, [Validators.required]],
    dFechFinEm: [{ value: null, disabled: true }],
    nIdPerlab: 0,
  });
  comando: IComandoCEM = new PersonalComando();
  comandoCombo: IComandoCEM = new ComboComando();

  listaCitasSinExamen: ICitaExamenPersonal[] = [];

  constructor(private componente: ControlemExamenmComponent) {}

  public async cargarInformacionServicio() {
    this.comando.setServicio(
      new InformacionPersonalServicio(
        this.componente.service,
        this.componente.nIdPersonal
      )
    );
    const data: IInformacionPersonal = await this.comando.ejecutar();
    this._reemplazarData(data);
  }

  private _reemplazarData(data: IInformacionPersonal) {
    this.form.patchValue({
      sNombres: data.sNombres,
      sCodPlla: data.sCodPlla,
      sTipo: data.sDscTipo,
      sDocumento: data.sDocumento,
      sResponsable: this.componente.sNombresResp,
      nIdPerlab: data.nIdPerlab,
    });
  }

  public getValorCampo(nombreCampo: string): any {
    return this.form.controls[nombreCampo].value;
  }

  desactivarFechaIni = (date: Date) => {
    var nIdCita: number = this.form.controls["nIdCitaEm"].value;

    var cita: ICitaExamenPersonal = this.listaCitasSinExamen.find(
      (v) => v.nIdCitaEm === nIdCita
    );
    if (cita === undefined || cita === null) {
      return true;
    }

    return date >= new Date(cita.dFecha);
  };
  activarFechaFin() {
    this.form.controls["dFechIniEm"].patchValue(null);
    this.form.controls["dFechIniEm"].enable();
  }

  public async cargarCitasSinExamenPersonal() {
    const servicio = new CitasSinExamenPersonalServicio(
      this.componente.service
    );
    servicio.setData(this.form.controls.nIdPerlab.value);
    this.comandoCombo.setServicio(servicio);
    this.listaCitasSinExamen = await this.comandoCombo.ejecutar();
  }

  private _calcularFechaDeFin(fechaInicio: Date): Date {
    var fechaFin = moment(fechaInicio).add(2, "y").subtract(1, "d").toDate();
    return fechaFin;
  }

  public nuevaFechaInicioSeleccionada(date: any) {
    this.form.controls["dFechFinEm"].patchValue(
      this._calcularFechaDeFin(date.value)
    );
  }
}
