import { FormBuilder, FormGroup } from "@angular/forms";
import { IInformacionPersonal } from "src/app/modulos/egy-humana/JefaturaAP/Model/Icontrolem";
import { ControlemDetailpComponent } from "../../../Modals/controlem-detailp/controlem-detailp.component";
import { IComandoCEM } from "../../Comandos/IComandoCem";
import InformacionPersonalServicio from "../../Comandos/Personal/InformacionPersonalServicio";
import PersonalComando from "../../Comandos/Personal/PersonalComando";

export default class InfoPersonalDpCEM {
  _fb: FormBuilder = new FormBuilder();
  form: FormGroup = this._fb.group({
    sNombres: [{ value: "", disabled: true }],
    sCodPlla: [{ value: "", disabled: true }],
    sTipo: [{ value: "", disabled: true }],
    sDocumento: [{ value: "", disabled: true }],
    dFechIni: [{ value: null, disabled: true }],
    dFechFin: [{ value: null, disabled: true }],
    sCiudad: [{ value: "", disabled: true }],
    nIdPerlab: 0,
  });
  comando: IComandoCEM = new PersonalComando();

  constructor(private componente: ControlemDetailpComponent) {}

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
      dFechIni: data.dFechIni,
      dFechFin: data.dFechFin,
      sCiudad: data.sCiudad,
      nIdPerlab: data.nIdPerlab,
    });
  }

  public getValorCampo(nombreCampo: string): any {
    return this.form.controls[nombreCampo].value;
  }
}
