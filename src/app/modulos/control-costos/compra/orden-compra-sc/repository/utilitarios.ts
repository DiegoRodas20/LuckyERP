export class Utilitarios {
  public totalfilas: string;
  public pOpcion: number;
  public perfil: number;
  public pParametro = [];
  public abLista = [];


  public editarDireccion: boolean;
  public codigoPartida: number;
  public codigoSucursal: number;
  public codigoArticulo: number;
  public codigoCentroCosto: number;
  public nombreImpuesto: string;
  public codigoTipoCambio: number;
  public codigoGastoCosto: number;
  public codigoSolicitante: number;
  public codigoCotizacion: number;
  public codigoEstado: number;
  public codigoIgvImpuesto: number;
  public codigoServicioImpuesto: number;
  
  
  public tsLista = 'inactive';
  private fbLista = [{ icon: 'person_add', tool: 'Nuevo' }];
  onToggleFab(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;
  }

  obtenerNombreColumna(valor: string): string {
    switch (valor) {
      case 'sucursal':
        return 'Sucursal';
      case 'partida':
        return 'Partida';
      case 'articuloServicio':
        return 'Articulo/Servicio';
      case 'precio':
        return 'Precio';
      case 'cantidad':
        return 'Cantidad';
      case 'total':
        return 'Total';


      case 'precioProv':
        return 'Precio Prov';
      case 'precioLucky':
        return 'Precio Lucky';

      case 'totalProv':
        return 'Total Prov';

      case 'totalLucky':
        return 'Total Lucky';

      case 'editable':
        return '';
    }
  }

  cssTablaGeneral(): boolean {
    const th = Array.from(document.getElementsByTagName('th'));
    th[0].style.textAlign = 'left';
    th[1].style.textAlign = 'left';
    th[2].style.textAlign = 'left';

    th[3].style.textAlign = 'center';
    th[4].style.textAlign = 'center';
    th[5].style.textAlign = 'center';

    return true;
  }

  public displayedColumns: string[] = ['sucursal', 'partida', 'articuloServicio', 'cantidad', 'precio', 'total', 'editable'];

  public displayedColumnsAud: string[] = ['sucursal', 'partida', 'articuloServicio', 'cantidad',
    'precioProv', 'precioLucky', 'totalProv', 'totalLucky', 'editable'];

  public displayedColumnsList: string[] = ['codigoGastoCosto', 'anio', 'presupuesto', 'numeroDocumento', 'titulo', 'cotizacion',
    'fechaRegistro', 'fechaEntrega', 'proveedor', 'totalUnidades', 'totalPrecio', 'moneda',
    'tipoCompra', 'estado', 'vb', 'pdf', 'subTipoDoc'];

    public displayedColumnsRpt: string[] = ['fecha', 'ppto', 'documento', 'correlativo',
    'ruc', 'razonSocial', 'totalLucky', 'totalProv', 'notaCredito', 'diferencia'];
}



export const DD_MM_YYYY_Format = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};



