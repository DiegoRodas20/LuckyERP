import { FormBuilder, FormGroup } from "@angular/forms";
import {
  ICiudadCombo,
  IDireccionClienteCombo,
  IEstadoExamenCombo,
  IPlanillaCombo,
  ITipoCombo,
} from "src/app/modulos/egy-humana/JefaturaAP/Model/Icontrolem";
import CiudadComboServicio from "../../Comandos/Combo/CiudadComboServicio";
import ComboComando from "../../Comandos/Combo/ComboComando";
import DireccionClienteComboServicio from "../../Comandos/Combo/DireccionClienteComboServicio";
import EstadoExamenComboServicio from "../../Comandos/Combo/EstadoExamenComboServicio";
import PlanillaComboServicio from "../../Comandos/Combo/PlanillaComboServicio";
import TipoComboServicio from "../../Comandos/Combo/TipoComboServicio";
import { IComandoCEM } from "../../Comandos/IComandoCem";
import { IPersonalDelResponsableDataTablaCEM } from "./IPersonalDelResponsableDataTablaCEM";
import PersonalDelResponsableTablaCEM from "./PersonalDelResponsableTablaCEM";

export default class FiltroPersonalDelResponsableTablaCEM {
  private _comandoCombo: IComandoCEM = new ComboComando();

  fb: FormBuilder = new FormBuilder();
  filtroForm: FormGroup = this.fb.group({
    sNombreDoc: "",
    sCodPlla: "",
    sCiudad: "",
    nEstado: "",
    sTipo: 0,
    sDireccionCliente: [{ value: 0, disabled: true }],
  });

  comboPlanilla: IPlanillaCombo[] = [];
  comboCiudad: ICiudadCombo[] = [];
  comboEstadoEm: IEstadoExamenCombo[] = [];
  comboTipo: ITipoCombo[] = [];
  comboDireccionCliente: IDireccionClienteCombo[] = [];

  constructor(private tabla: PersonalDelResponsableTablaCEM) {}

  public filtrar() {
    this.tabla.dataSource.filterPredicate = ((
      data: IPersonalDelResponsableDataTablaCEM,
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

      // Filtrando por ciudad
      const c =
        !filter.sCiudad ||
        data.sCiudad.toLowerCase().includes(filter.sCiudad.toLowerCase());

      // Filtrando por estado
      const d = !filter.nEstado || data.nEstado === filter.nEstado;

      // Filtrando por Direccion / Cliente
      const e =
        !filter.sDireccionCliente ||
        data.nIdOrganizacion === filter.sDireccionCliente;

      return a && b && c && d && e;
    }) as (IPersonalDelResponsableDataTablaCEM, string) => boolean;

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
      new PlanillaComboServicio(this.tabla.component.service)
    );
    this.comboPlanilla = await this._comandoCombo.ejecutar();

    this._comandoCombo.setServicio(
      new CiudadComboServicio(this.tabla.component.service)
    );
    this.comboCiudad = await this._comandoCombo.ejecutar();

    this._comandoCombo.setServicio(
      new EstadoExamenComboServicio(this.tabla.component.service)
    );
    this.comboEstadoEm = await this._comandoCombo.ejecutar();

    this._comandoCombo.setServicio(
      new TipoComboServicio(this.tabla.component.service)
    );
    this.comboTipo = await this._comandoCombo.ejecutar();

    const servicioDireccionCliente = new DireccionClienteComboServicio(
      this.tabla.component.service
    );
    servicioDireccionCliente.setData(this._obtenerIdsCentroCostoDelPersonal());
    this._comandoCombo.setServicio(servicioDireccionCliente);
    this.comboDireccionCliente = await this._comandoCombo.ejecutar();
  }

  private _obtenerIdsCentroCostoDelPersonal(): number[] {
    var listaIdsRepetidos = this.tabla
      .getData()
      .map((item) => item.nIdCentroCosto);

    var listaIdsSinRepetir = listaIdsRepetidos.filter(function (value, index) {
      return listaIdsRepetidos.indexOf(value) == index;
    });

    return listaIdsSinRepetir;
  }

  public tipoComboSeleccionado() {
    var tipo: number = this.filtroForm.controls.sTipo.value;
    tipo = tipo === undefined ? 0 : tipo;

    if (tipo === 0) {
      this.filtroForm.controls.sDireccionCliente.disable();
    }

    if (tipo !== 0) {
      this.filtroForm.controls.sDireccionCliente.enable();
    }
    this.filtroForm.controls.sDireccionCliente.patchValue(0);
    this.filtrar();
  }

  public dataFiltradaDireccionClienteCombo(): IDireccionClienteCombo[] {
    var tipo: number = this.filtroForm.controls.sTipo.value;
    tipo = tipo === undefined ? 0 : tipo;
    return this.comboDireccionCliente.filter((v) => v.nIdTipoCC === tipo);
  }
}
