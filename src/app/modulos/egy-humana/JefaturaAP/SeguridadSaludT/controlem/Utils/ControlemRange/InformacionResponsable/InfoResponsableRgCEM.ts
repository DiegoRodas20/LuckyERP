import { FormBuilder, FormGroup } from "@angular/forms";
import { IInformacionResponsable } from "src/app/modulos/egy-humana/JefaturaAP/Model/Icontrolem";
import { ControlemRangeComponent } from "../../../Modals/controlem-range/controlem-range.component";
import { IComandoCEM } from "../../Comandos/IComandoCem";
import InformacionResponsableServicio from "../../Comandos/Responsable/InformacionResponsableServicio";
import ResponsableComando from "../../Comandos/Responsable/ResponsableComando";

export default class InfoResponsableRgCEM {
  fb: FormBuilder = new FormBuilder();
  form: FormGroup = this.fb.group({
    sNombres: [{ value: "", disabled: true }],
    sCodPlla: [{ value: "", disabled: true }],
    sTipo: [{ value: "", disabled: true }],
    sDocumento: [{ value: "", disabled: true }],
    dFechIni: [{ value: null, disabled: true }],
    dFechFin: [{ value: null, disabled: true }],
    sCiudad: [{ value: "", disabled: true }],
  });
  comando: IComandoCEM = new ResponsableComando();

  constructor(private componente: ControlemRangeComponent) {}

  public async cargarInformacionServicio() {
    this.comando.setServicio(
      new InformacionResponsableServicio(
        this.componente.service,
        this.componente.nIdResponsable
      )
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
