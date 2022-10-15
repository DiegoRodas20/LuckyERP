import { FormBuilder, FormGroup } from "@angular/forms";
import {
  ICiudadCombo,
  IEstadoExamenCombo,
  IPlanillaCombo,
} from "src/app/modulos/egy-humana/JefaturaAP/Model/Icontrolem";
import CiudadComboServicio from "../../Comandos/Combo/CiudadComboServicio";
import ComboComando from "../../Comandos/Combo/ComboComando";
import EstadoExamenComboServicio from "../../Comandos/Combo/EstadoExamenComboServicio";
import PlanillaComboServicio from "../../Comandos/Combo/PlanillaComboServicio";
import { IComandoCEM } from "../../Comandos/IComandoCem";
import IPersonalDelResponsableDataTablaDrCEM from "./IPersonalDelResponsableDataTablaDrCEM";
import PersonalDelResponsableTablaDrCEM from "./PersonalDelResponsableTablaDrCEM";

export default class FiltroPersonalDelResponsableTablaDrCEM {
  private _comandoCombo: IComandoCEM = new ComboComando();

  fb: FormBuilder = new FormBuilder();
  filtroForm: FormGroup = this.fb.group({
    sNombreDoc: "",
    sCodPlla: "",
    nEstado: 0,
    sCiudad: "",
  });

  comboPlanilla: IPlanillaCombo[] = [];
  comboCiudad: ICiudadCombo[] = [];
  comboEstadoEm: IEstadoExamenCombo[] = [];

  constructor(private tabla: PersonalDelResponsableTablaDrCEM) {}

  public filtrar() {
    this.tabla.dataSource.filterPredicate = ((
      data: IPersonalDelResponsableDataTablaDrCEM,
      filter: any
    ) => {
      // tslint:disable-next-line: max-line-length
      // Filtrando por nombre o numero de documento
      const a =
        !filter.sNombreDoc ||
        data.sNombres.toLowerCase().includes(filter.sNombreDoc.toLowerCase()) ||
        data.sDocumento.toLowerCase().includes(filter.sNombreDoc.toLowerCase());

      // Filtrando por planilla
      const b =
        !filter.sCodPlla ||
        data.sCodPlla.toLowerCase().includes(filter.sCodPlla.toLowerCase());

      // Filtrando por planilla
      const c =
        !filter.sCiudad ||
        data.sCiudad.toLowerCase().includes(filter.sCiudad.toLowerCase());

      // Filtrando por Estado de examen
      const d = !filter.nEstado || data.nEstado === filter.nEstado;

      return a && b && c && d;
    }) as (IPersonalDelResponsableDataTablaDrCEM, string) => boolean;

    this.tabla.dataSource.filter = this.filtroForm.value;

    if (this.tabla.dataSource.paginator) {
      this.tabla.dataSource.paginator.firstPage();
    }
  }

  public getValorCampo(nombreCampo: string): any {
    return this.filtroForm.controls[nombreCampo].value;
  }

  public setValorCampo(nombreCampo: string, nuevoValor: any): any {
    this.filtroForm.controls[nombreCampo].patchValue(nuevoValor);
  }

  public limpiarFiltro() {
    this.filtroForm.controls.sNombreDoc.patchValue("");
    this.filtrar();
  }

  public async cargarCombos() {
    this._comandoCombo.setServicio(
      new PlanillaComboServicio(this.tabla.component.servicio)
    );
    this.comboPlanilla = await this._comandoCombo.ejecutar();

    this._comandoCombo.setServicio(
      new CiudadComboServicio(this.tabla.component.servicio)
    );
    this.comboCiudad = await this._comandoCombo.ejecutar();

    this._comandoCombo.setServicio(
      new EstadoExamenComboServicio(this.tabla.component.servicio)
    );
    this.comboEstadoEm = await this._comandoCombo.ejecutar();
  }
}
