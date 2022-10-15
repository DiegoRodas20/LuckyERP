import { FormBuilder, FormGroup } from "@angular/forms";
import ExamenMedicoTablaDpCEM from "./ExamenMedicoTablaDpCEM";
import { IExamenMedicoTablaDpCEM } from "./IExamenMedicoTablaDpCEM";

export default class {
  fb: FormBuilder = new FormBuilder();
  filtroForm: FormGroup = this.fb.group({
    dFechIniEm: null,
    dFechFinEm: null,
  });

  constructor(private tabla: ExamenMedicoTablaDpCEM) {}

  public filtrar() {
    this.tabla.dataSource.filterPredicate = ((
      data: IExamenMedicoTablaDpCEM,
      filter: any
    ) => {
      // tslint:disable-next-line: max-line-length
      // Filtrando por fecha inicio
      const a =
        !filter.dFechIniEm ||
        new Date(data.dFechIniEm) >= new Date(filter.dFechIniEm);

      // Filtrando por fecha de fin
      const b =
        !filter.dFechFinEm ||
        new Date(data.dFechFinEm) <= new Date(filter.dFechFinEm);

      return a && b;
    }) as (IExamenMedicoTablaDpCEM, string) => boolean;

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
}
