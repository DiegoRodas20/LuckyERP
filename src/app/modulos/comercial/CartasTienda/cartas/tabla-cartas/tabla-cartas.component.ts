import {
  AfterViewInit,
  Component,
  ViewChild,
  OnInit,
  Inject,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { CartaTiendaService } from "../../service/carta-tienda.service";
import { NgxSpinnerService } from "ngx-spinner";

//#region  STORE
import { Store, Select, UpdateState } from "@ngxs/store";

//#region  CABECERA DE CARTA
import { CartaTienda } from "../../store/carta_tienda/carta_tienda/carta_tienda.model";
import { ReemplazarCartaTienda } from "../../store/carta_tienda/carta_tienda/carta_tienda.actions";
//#endregion

//#region FORMATOS
import { FormatoCartaTienda } from "../../store/carta_tienda/formato_carta_tienda/formato_carta_tienda.model";
import { ReemplazarFormatoAFormatoCartaTienda } from "../../store/carta_tienda/formato_carta_tienda/formato_carta_tienda.actions";
//#endregion

//#region CAMPOS FORMATO
import { CampoFormatoCartaTienda } from "../../store/carta_tienda/formato_carta_tienda/formato_carta_tienda.model";
import { ReemplazarCampoAFormatoCartaTienda } from "../../store/carta_tienda/campo_carta_tienda/campo_carta_tienda.actions";
//#endregion

//#region PERSONAL
import { PersonalCampoValor } from "../../models/PersonalCampoValor";
import { ReemplazarTodoPersonalFormatoCartaTienda } from "../../store/carta_tienda/personal_carta_tienda/personal_carta_tienda.actions";
//#endregion

//#region CARGAR FORMATOS BUSCADOR
import { CargarFormatoBusqueda } from "../../store/carta_tienda/formato_busqueda/formato_busqueda.actions";
//#endregion

import { ComboCadena } from "../../shared/ComboCadena";

//#endregion
import Swal from "sweetalert2";

export interface Carta {
  pId: number;
  pCadena: number;
  pNroPersonal: number;
  pFechaCreacion: string;
}

interface DialogData {
  cadena_id: number;
}

@Component({
  selector: "app-tabla-cartas",
  templateUrl: "./tabla-cartas.component.html",
  styleUrls: ["./tabla-cartas.component.css"],
})
export class TablaCartasComponent implements OnInit {
  //#region Variable de la tabla cartas
  listaCartas: Carta[] = [];
  displayedColumns: string[] = [
    "pId",
    "pCadena",
    "pNroPersonal",
    "pFechaCreacion",
    "Editar",
    "Eliminar",
  ];
  dataSource = new MatTableDataSource<Carta>(this.listaCartas);

  estadoSpinner = false;
  listaCadenas: ComboCadena[] = [];
  //#endregion

  //#region Variable paginacion
  @ViewChild(MatPaginator) paginator: MatPaginator;
  //#endregion

  //#region Constructor
  constructor(
    private cartaTiendaService: CartaTiendaService,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}
  //#endregion

  //#region Ciclo de vida
  ngOnInit(): void {
    this._cargarDataCadenas();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.cargarTablaData();
      this.dataSource.paginator = this.paginator;
    });
  }
  //#endregion

  //#region CARGAR DATA

  //#region CARGA DATA CADENAS
  private _cargarDataCadenas() {
    var aux1 = new ComboCadena();
    aux1.pId = 1;
    aux1.pNombre = "SUPERMERCADOS PERUANOS S.A. (SPSA)";

    var aux2 = new ComboCadena();
    aux2.pId = 2;
    aux2.pNombre = "Hipermercados Tottus S.A";

    var aux3 = new ComboCadena();
    aux3.pId = 3;
    aux3.pNombre = "CENCOSUD RETAIL PERU S.A";

    this.listaCadenas.push(aux1);
    this.listaCadenas.push(aux2);
    this.listaCadenas.push(aux3);
  }
  //#endregion

  //#region Cargar la data de todas las cartas
  public async cargarTablaData() {
    this.estadoSpinner = true;
    var params = [];
    params.push(this.data.cadena_id);
    await this.cartaTiendaService
      .crudCarta(15, params)
      .then((cartas: Carta[]) => {
        this.listaCartas = cartas;
        this.dataSource = new MatTableDataSource<Carta>(this.listaCartas);
        this.dataSource.paginator = this.paginator;
      });
    this.estadoSpinner = false;
  }
  //#endregion

  //#region Cargar la carta seleccionada al store
  public cargarDataCartaParaEditar(carta: Carta) {
    this.estadoSpinner = true;
    this._cargarCabecera(carta.pId);
    this._cargarFormatos(carta.pId);
    this._cargarPersonal(carta.pId);
  }

  private _cargarCabecera(carta_id) {
    let parametros = [];
    parametros.push(carta_id);
    this.cartaTiendaService
      .crudCarta(16, parametros)
      .then((carta: CartaTienda) => {
        this._cargarLosFormulariosDeLaCadena(carta.cadena_id);

        this.store.dispatch(new ReemplazarCartaTienda(carta));
      });
  }

  private _cargarFormatos(carta_id) {
    let parametros = [];
    parametros.push(carta_id);

    this.cartaTiendaService
      .crudCartaFormato(20, parametros, "|")
      .then((formatos: FormatoCartaTienda[]) => {
        this.store.dispatch(new ReemplazarFormatoAFormatoCartaTienda(formatos));

        this._cargarCamposComunesDeLosFormatos(formatos);
      });
  }

  private async _cargarPersonal(carta_id) {
    let parametros = [];
    parametros.push(carta_id);
    await this.cartaTiendaService
      .crudPersonalCampo(26, parametros, "|")
      .then((personalCampoValor: PersonalCampoValor[]) => {
        this._convertirAFormatoPersona(personalCampoValor);
      });
    this.estadoSpinner = false;
  }

  private _cargarCamposComunesDeLosFormatos(
    listaFormatos: FormatoCartaTienda[]
  ) {
    var listaComunes: CampoFormatoCartaTienda[] = [];

    listaFormatos.forEach((formato) => {
      formato.campos.forEach((campo) => {
        if (listaComunes.length === 0) {
          listaComunes.push(campo);
        }
        if (
          listaComunes.find((item) => item.pIdCampo === campo.pIdCampo) ===
          undefined
        ) {
          listaComunes.push(campo);
        }
      });
    });

    this.store.dispatch(new ReemplazarCampoAFormatoCartaTienda(listaComunes));
  }

  private _convertirAFormatoPersona(personalCampoValor: PersonalCampoValor[]) {
    // obteniendo los IDS de los empleados
    let listaIDs: number[] = [];
    personalCampoValor.forEach((personal) => {
      if (listaIDs.find((id) => id === personal.pIdPersonal) === undefined) {
        listaIDs.push(personal.pIdPersonal);
      }
    });

    // obteniendo los campos con su valor de cada empleado
    let camposCadaPersona: any[] = [];
    listaIDs.forEach((id) => {
      camposCadaPersona.push(
        personalCampoValor.filter((personal) => personal.pIdPersonal === id)
      );
    });

    // fusionar campo y valor junto con ID
    let dataNuevaPersonal = [];
    camposCadaPersona.forEach((conjuntoData: PersonalCampoValor[]) => {
      let aux = {};
      conjuntoData.forEach((data) => {
        if (data.nIdTipoCampo == 3) {
          aux[data.pIdCampo] = {
            pId: +data.sValor,
            pIdCampo: data.pIdCampo,
            pValor: data.sValorDesplegable,
          };
          aux["id"] = data.pIdPersonal;
        } else {
          aux[data.pIdCampo] = data.sValor;
          aux["id"] = data.pIdPersonal;
        }
      });
      dataNuevaPersonal.push(aux);
    });

    this.store.dispatch(
      new ReemplazarTodoPersonalFormatoCartaTienda(dataNuevaPersonal)
    );
  }

  private _cargarLosFormulariosDeLaCadena(cadena_id: number) {
    this.store.dispatch(new CargarFormatoBusqueda(cadena_id));
  }
  //#endregion

  //#endregion

  //#region ELIMINAR UNA CARTA
  public eliminarUnaCarta(carta: Carta) {
    Swal.fire({
      title: "¿Estas seguro?",
      text: "No podrás  revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#334d6e",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, eliminar!",
    }).then((result) => {
      if (result.isConfirmed) {
        this._limpiarCartaEliminada();

        var param = [];
        param.push(carta.pId);
        this.cartaTiendaService.crudCarta(19, param).then((id) => {
          this.listaCartas = this.listaCartas.filter((item) => item.pId !== id);
          this.dataSource = new MatTableDataSource<Carta>(this.listaCartas);
          this.dataSource.paginator = this.paginator;
          Swal.fire({
            title: "Eliminado!",
            text: "Tu carta ha sido eliminado.",
            icon: "success",
            confirmButtonColor: "#334d6e",
          });
        });
      }
    });
  }

  private _limpiarCartaEliminada() {}
  //#endregion

  //#region
  public obtenerNombreCadena(id_cadena: number) {
    return this.listaCadenas.find((item) => (item.pId = id_cadena)).pNombre;
  }
  //#endregion
}
