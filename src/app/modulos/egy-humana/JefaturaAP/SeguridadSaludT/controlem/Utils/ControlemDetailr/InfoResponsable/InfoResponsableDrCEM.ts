import { FormBuilder, FormGroup } from "@angular/forms";
import { IInformacionResponsable } from "src/app/modulos/egy-humana/JefaturaAP/Model/Icontrolem";
import { ControlemService } from "src/app/modulos/egy-humana/JefaturaAP/Services/controlem.service";
import { IComandoCEM } from "../../Comandos/IComandoCem";
import InformacionResponsableServicio from "../../Comandos/Responsable/InformacionResponsableServicio";
import ResponsableComando from "../../Comandos/Responsable/ResponsableComando";

export default class InfoResponsableDrCEM {
  fb: FormBuilder = new FormBuilder();
  form: FormGroup = this.fb.group({
    sNombres: [{ value: "", disabled: true }],
    sCodPlla: [{ value: "?", disabled: true }],
    sTipo: [{ value: "", disabled: true }],
    sDocumento: [{ value: "", disabled: true }],
    dFechIni: [{ value: null, disabled: true }],
    dFechFin: [{ value: null, disabled: true }],
    sCiudad: [{ value: "", disabled: true }],
  });
  comando: IComandoCEM = new ResponsableComando();

  constructor(private servicio: ControlemService) {}

  public async cargarInformacionServicio(nIdResposanble: number) {
    this.comando.setServicio(
      new InformacionResponsableServicio(this.servicio, nIdResposanble)
    );
    const data: IInformacionResponsable = await this.comando.ejecutar();
    this._reemplazarData(data);
  }

  private _reemplazarData(data: IInformacionResponsable) {
    this.form.patchValue({
      sNombres: data.sNombres,
      sCodPlla: data.sCodPlla,
      sTipo: data.sDscTipo,
      sDocumento: data.sDocumento,
      dFechIni: data.dFechIni,
      dFechFin: data.dFechFin,
      sCiudad: data.sCiudad,
    });
  }

  public getValorCampo(nombreCampo: string): any {
    return this.form.controls[nombreCampo].value;
  }
}
