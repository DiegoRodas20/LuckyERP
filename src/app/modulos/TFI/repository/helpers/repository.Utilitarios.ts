import { SecurityErp } from 'src/app/modulos/AAHelpers/securityErp.Entity';
export class Utilitarios {
  displayedColumns: string[] = ['descripcionEmpresa', 'nombreDocumento', 'numeroSerie', 'anchoNumerador', 'numeradorDocumento', 'estado', 'actions'];

  totalfilas: string;
  descripcionLarga: string;
  numeradorDocumento: string;
  mensajeBoton: string = "Nuevo";
  codigoSerie: number;
  opcion: number;
  comprobanteEstado: number;
  comprobanteCodigo: number;
  mostrarDetracciones: boolean;
  mostrarTablaLineas: any;
  desCodigoDetraccion: string;
  descripcionLargaDetraccion: string;
  porcentaje: number;
  totalDetraccion: number;

  //Texto informativo pagina 02
  descripcionCorta: string;
  sucursal: string;

  estadoDocumento: any[] = [
    { estado: true, descripcion: "Activo" },
    { estado: false, descripcion: "Inactivo" }
  ]

  public abLista = [];
  public tsLista = 'inactive';
  private fbLista = [{ icon: 'person_add', tool: 'Nuevo' }];

  onToggleFab(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;
  }

  securityErp = new SecurityErp();

  detracciones() {
    this.securityErp.getPais() === "604" ? this.mostrarDetracciones = true : this.mostrarDetracciones = false;
  }

  tablaLineas(tipoServicio: number) {

    if (tipoServicio == 2234)
      return this.mostrarTablaLineas = true;
    if (tipoServicio == 2235)
      return this.mostrarTablaLineas = false;
    else
      return this.mostrarTablaLineas = undefined;
  }

  cssTablaGeneral(): boolean {
    const th = Array.from(document.getElementsByTagName('th'));
    th[0].style.textAlign = 'left';
    th[1].style.textAlign = 'left';
    th[2].style.textAlign = 'left';

    th[3].style.textAlign = 'center';
    th[4].style.textAlign = 'center';
    th[5].style.textAlign = 'center';
    th[6].style.textAlign = 'center';

    return true;
  }

  obtenerNombreColumna(valor: string): string {
    switch (valor) {

      case 'pptos':
        return 'PPTO';

      case 'totalPptos':
        return 'Total Ppto';

      case 'aCuenta':
        return 'a Cuenta';

      case 'anadir':
        return 'Añadir';

      case 'valorVenta':
        return 'Sub Total';

      case 'impuesto':
        return 'IGV';

      case 'total':
        return 'Total';

      // columnas tabla Materiales
      case 'cuenta':
        return 'Cuenta';

      case 'articuloServicio':
        return 'Articulo/Servicio';

      case 'detalle':
        return 'Detalle';

      case 'unidadMedida':
        return 'U.Med';

      case 'cantidad':
        return 'Cantidad';

      case 'precioUnitario':
        return 'Pre.Unit';

      case 'subTotal':
        return 'Sub Total';

      case 'igv':
        return 'IGV';

      case 'editable':
        return '';
      case 'cliente':
        return 'Cliente';
    }
  }

  displayedColumnsServicios: string[] = ['add','pptos', 'totalPptos', 'aCuenta', 'anadir', 'valorVenta', 'impuesto', 'total','cliente','editable' ];
  displayedColumnsMateriales: string[] = ['add','cuenta', 'articuloServicio', 'detalle', 'unidadMedida', 'cantidad', 'precioUnitario', 'subTotal', 'igv', 'total', 'editable'];


}