import { GestionemComponent } from "../../gestionem.component";

interface IFbItemOpcion {
  icon: string;
  tool: string;
}

export default class FabButtonConfig {
  estadoFb: number;
  fbAnimacion: string;
  fbOpcionesActivas: IFbItemOpcion[] = [];

  fbPrimeraOpcion: IFbItemOpcion[] = [
    {
      icon: "today",
      tool: "Agendar cita",
    },
  ];

  constructor(estadoFb: number, fbAnimacion: string) {
    this.estadoFb = estadoFb;
    this.fbAnimacion = fbAnimacion;
    this._init();
  }

  private _init() {
    switch (this.estadoFb) {
      case 0:
        if (this.fbAnimacion === "active") {
          this.fbOpcionesActivas = this.fbPrimeraOpcion;
        }

        if (this.fbAnimacion === "inactive") {
          this.fbOpcionesActivas = [];
        }
        break;
      default:
        break;
    }
  }

  public cambiarOpcionesMostrarOcultar() {
    if (this.fbAnimacion === "active") {
      this.fbAnimacion = "inactive";
      this.fbOpcionesActivas = [];
    } else if (this.fbAnimacion === "inactive") {
      this.fbAnimacion = "active";
      this.fbOpcionesActivas = this.fbPrimeraOpcion;
    }
  }

  public ejecutar(gestion: GestionemComponent, index: number) {
    switch (this.estadoFb) {
      case 0:
        if (index === 0) {
          gestion.agregarCita();
        }
        break;
      default:
        break;
    }
  }
}
