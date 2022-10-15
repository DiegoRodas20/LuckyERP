import { FormBuilder, FormGroup } from "@angular/forms";
import { IPersonaAsignadaCitaMedica } from "../../../../Model/Igestionem";
import { GestionemCitasComponent } from "../../Modals/gestionem-citas/gestionem-citas.component";

export default class FiltroPersonasAsignadas {
  gestion: GestionemCitasComponent;

  filtroForm: FormGroup = this.fb.group({
    sNombreDoc: "",
  });

  constructor(gestion: GestionemCitasComponent, private fb: FormBuilder) {
    this.gestion = gestion;
  }

  public filtrar() {
    this.gestion.historialExamenMedicoDataSource.filterPredicate = ((
      data: IPersonaAsignadaCitaMedica,
      filter: any
    ) => {
      // tslint:disable-next-line: max-line-length
      // Filtrando por nombre o numero de documento
      const a =
        !filter.sNombreDoc ||
        data.sNombres.toLowerCase().includes(filter.sNombreDoc.toLowerCase()) ||
        data.sDocumento.toLowerCase().includes(filter.sNombreDoc.toLowerCase());
      return a;
    }) as (IPersonaAsignadaCitaMedica, string) => boolean;

    this.gestion.historialExamenMedicoDataSource.filter = this.filtroForm.value;

    if (this.gestion.historialExamenMedicoDataSource.paginator) {
      this.gestion.historialExamenMedicoDataSource.paginator.firstPage();
    }
  }

  public limpiarFiltro() {
    this.filtroForm.controls.sNombreDoc.patchValue("");
    this.filtrar();
  }
}
