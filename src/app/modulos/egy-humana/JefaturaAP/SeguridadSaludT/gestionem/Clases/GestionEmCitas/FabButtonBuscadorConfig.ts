import { GestionemCitasComponent } from "../../Modals/gestionem-citas/gestionem-citas.component";

interface IFbItem {
  icon: string;
  tool: string;
}

export default class FabButtonBuscadorConfig {
  fbAnimacion = "inactive";

  fbOpcionesActivas = [];

  fbPrimeraOpcion: IFbItem[] = [
    { icon: "person_add", tool: "Añadir" },
    { icon: "cleaning_services", tool: "Limpiar" },
  ];

  public opcionesVerOcultar() {
    if (this.fbAnimacion === "active") {
      this.ocultarOpciones();
    } else if (this.fbAnimacion === "inactive") {
      this.mostrarOpciones();
    }
  }

  public mostrarOpciones() {
    this.fbAnimacion = "active";
    this.fbOpcionesActivas = this.fbPrimeraOpcion;
  }

  public ocultarOpciones() {
    this.fbAnimacion = "inactive";
    this.fbOpcionesActivas = [];
  }

  public ejecutarOpciones(gestion: GestionemCitasComponent, index: number) {
    if (index === 0) {
      this.agregarPersona(gestion);
    }

    if (index === 1) {
      this.limpiar(gestion);
    }
  }

  public agregarPersona(gestion: GestionemCitasComponent) {
    gestion.agregarPersonaALaTabla();
  }

  public limpiar(gestion: GestionemCitasComponent) {
    gestion.limpiarPersonaAsignada();
  }
}
