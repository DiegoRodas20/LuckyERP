import { Component, OnInit, Inject } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { CartaTiendaService } from "../../service/carta-tienda.service";
import { ComboCadena } from "../../shared/ComboCadena";
import { ComboTienda } from "../../shared/ComboTienda";
import { TablaCartasComponent } from "../tabla-cartas/tabla-cartas.component";
import { saveAs } from "file-saver";

import { PrintService } from "../../../../../shared/services/print.service";
import { FilecontrolService } from "../../../../../shared/services/filecontrol.service";
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from "@angular/material/snack-bar";

import { NgxSpinnerService } from "ngx-spinner";

//#region STORE
import { Store, Select, UpdateState } from "@ngxs/store";

//#region BUSQUEDA DE FORMATOS
import { CargarFormatoBusqueda } from "../../store/carta_tienda/formato_busqueda/formato_busqueda.actions";
import { FormatoBusqueda } from "../../store/carta_tienda/formato_busqueda/formato_busqueda.model";
//#endregion

//#region CARTAS
import {
  AgregarFormatoAFormatoCartaTienda,
  EliminarFormatoAFormatoCartaTienda,
  ReemplazarFormatoAFormatoCartaTienda,
} from "../../store/carta_tienda/formato_carta_tienda/formato_carta_tienda.actions";
import {
  AgregarCampoAFormatoCartaTienda,
  EliminarCampoAFormatoCartaTienda,
  ReemplazarCampoAFormatoCartaTienda,
} from "../../store/carta_tienda/campo_carta_tienda/campo_carta_tienda.actions";
//#endregion

//#region BUSQUEDA CAMPOS
import { CampoBusqueda } from "../../store/carta_tienda/campo_busqueda/campo_busqueda.model";
//#endregion

//#region FORMATOS SELECCIONADOS
import {
  CampoFormatoCartaTienda,
  FormatoCartaTienda,
} from "../../store/carta_tienda/formato_carta_tienda/formato_carta_tienda.model";
//#endregion

//#region DATOS CABECERA DE CARTA TIENDA
import { CartaTienda } from "../../store/carta_tienda/carta_tienda/carta_tienda.model";
import { ReemplazarCartaTienda } from "../../store/carta_tienda/carta_tienda/carta_tienda.actions";
//#endregion

//#region REEMPLEZAR PERSONAL
import { ReemplazarTodoPersonalFormatoCartaTienda } from "../../store/carta_tienda/personal_carta_tienda/personal_carta_tienda.actions";
//#endregion

//#region IMPRIMIR
import { ImprimirModel } from "../../store/carta_tienda/imprimir/imprimir.model";
import { SupervisorCombo } from "../../models/SupervisorCombo";
import { OpcionesImprimirFormato } from "../../models/formatos/OpcionesImprimirFormato";
import { ReemplazarDataImprimir } from "../../store/carta_tienda/imprimir/imprimir.actions";
import { data } from "jquery";
//#endregion

//#endregion

interface IArchivoCadena {
  sRuta: string;
  sExtencion: string;
  sNombre: string;
}

@Component({
  selector: "app-carta-tienda",
  templateUrl: "./carta-tienda.component.html",
  styleUrls: ["./carta-tienda.component.css"],
})
export class CartaTiendaComponent implements OnInit {
  url: string;
  //#region Variables

  //#region SNACKBAR
  horizontalPosition: MatSnackBarHorizontalPosition = "start";
  verticalPosition: MatSnackBarVerticalPosition = "bottom";
  //#endregion

  //#region DATA SUPERVISORES
  listaSupervisores: SupervisorCombo[] = [];
  //#endregion

  //#region OPCIONES DE IMPRESION de cada formato ( imprimir - doble cara )
  listaOpcionesImprrimirFormato: OpcionesImprimirFormato[] = [];

  //#region DOCUMENTOS A IMPRIMIR
  listaDocumentosImprimir: ImprimirModel[] = [];
  //#endregion

  //#region DATOS CABECERA DE CARTA TIENDA
  grabadoCarta = false;
  listaCadenas: ComboCadena[] = [];
  listaTiendas: ComboTienda[] = [];

  cartaID: number = 0;
  cadenaSeleccionada = 0;
  tiendaSeleccionada = 0;
  supervisorID: number = 0;
  //#endregion

  //#region  LISTA DE DOCUMENTOS PARA DESCARGAR
  listaDocumentosFijos: IArchivoCadena[] = [];
  //#endregion

  //#region BuscarFormato
  controlBusqueda = new FormControl();
  filtroBusquedaFormatos: Observable<FormatoBusqueda[]>;
  //#endregion

  //#region STORE VARIABLES Lista de Formatos seleccionados,campos comunes entre los formatos, personal agregado a un formato.
  public listaFormatosBusqueda: Observable<FormatoBusqueda[]>;
  public listaFormatosCartaTienda: Observable<FormatoCartaTienda[]>;
  public listaPersonal: Observable<any[]>;
  public listaCamposComunes: Observable<CampoFormatoCartaTienda[]>;
  public cartaCabecera: Observable<CartaTienda>;

  public listaCamposComunesEstaticos: CampoFormatoCartaTienda[];
  public listaFormatosEstaticos: FormatoBusqueda[];
  public listaFormatosCartaTiendaEstatico: FormatoCartaTienda[];
  public listaPersonalEstatica: any[];
  //#endregion

  //#endregion

  //#region Contructor
  constructor(
    private _snackBar: MatSnackBar,
    private store: Store,
    private router: Router,
    private cartaTiendaService: CartaTiendaService,
    public dialog: MatDialog,
    public printService: PrintService,
    public vFilecontrolService: FilecontrolService,
    private spinnerService: NgxSpinnerService,
    @Inject("BASE_URL") baseUrl: string
  ) {
    this.url = baseUrl;
    this.listaCamposComunesEstaticos = new Array();
    this.listaFormatosEstaticos = new Array();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this._cargarDataCadenas();
    this._cargarDatosStoreALosArreglosEstaticos();
    this._filter();
    if (this.cadenaSeleccionada != 0) {
      this.cargarLosFormatosDeLaCadena();
    }

    this._cargarDataSupervisores();
  }
  //#endregion

  //#region DESCARGAR DOCUMENTOS

  private _obtenerListaArchivoCadena() {
    this.cartaTiendaService
      .combos(33, [this.cadenaSeleccionada])
      .then((data: IArchivoCadena[]) => {
        this.listaDocumentosFijos = data;
      });
  }
  fnDownloadFile = function (data: IArchivoCadena) {
    var a = data.sRuta;
    this.spinnerService.show();

    // let file = a.sRutaArchivo.split('/')[4];
    let file = a.split("/")[4];

    let type = file.split(".")[1];
    let area = 6; //Por ser proceso de control de costos

    this.vFilecontrolService
      .fnDownload(file, type.toLowerCase(), area, this.url)
      .subscribe(
        (res: any) => {
          let file = data.sNombre;
          saveAs(res, file);
        },
        (err) => {
          this.spinnerService.hide();
        },
        () => {
          this.spinnerService.hide();
        }
      );
  };
  //#endregion

  //#region CARGA DE DATOS INICIALES

  //#region CARGA DATA SUPERVISORES
  private _cargarDataSupervisores() {
    var pais = localStorage.getItem("Pais");
    var params = [];
    params.push(pais);

    this.cartaTiendaService
      .combos(30, params)
      .then((data: SupervisorCombo[]) => {
        this.listaSupervisores = data;
      });
  }
  //#endregion

  //#region CADENA TIENDAS
  private _cargarDataCadenas() {
    this.cartaTiendaService.combos(31, []).then((data: ComboCadena[]) => {
      this.listaCadenas = data;
    });
  }

  // Carga los todas los formatos de una cadena
  cargarLosFormatosDeLaCadena() {
    this._obtenerListaArchivoCadena();
    this.store.dispatch(new CargarFormatoBusqueda(this.cadenaSeleccionada));
    this.store.dispatch(
      new ReemplazarCartaTienda({
        cadena_id: this.cadenaSeleccionada,
        supervisor_id: this.supervisorID,
        carta_id: this.cartaID,
      })
    );
  }
  //#endregion

  //#region Carga los datos del store
  private _cargarDatosStoreALosArreglosEstaticos() {
    //#region Obtener data
    this.listaFormatosBusqueda = this.store.select(
      (state) => state.formatosCartaTienda.formatosCarta
    );
    this.listaPersonal = this.store.select(
      (state) => state.personalCartaTienda.personalCarta
    );
    this.listaCamposComunes = this.store.select(
      (state) => state.camposCartaTienda.camposCarta
    );
    this.cartaCabecera = this.store.select(
      (state) => state.cartaTienda.cartaTienda
    );
    this.listaFormatosCartaTienda = this.store.select(
      (state) => state.formatosCartaTienda.formatosCarta
    );
    //#endregion

    //#region Mover a data statica
    this.listaCamposComunes.subscribe((campos) => {
      this.listaCamposComunesEstaticos = campos;
    });
    this.listaFormatosBusqueda.subscribe((formatos) => {
      this.listaFormatosEstaticos = formatos;
    });
    this.listaPersonal.subscribe((personal) => {
      this.listaPersonalEstatica = personal;
    });
    this.cartaCabecera.subscribe((data: CartaTienda) => {
      this.cartaID = data.carta_id;
      this.cadenaSeleccionada = data.cadena_id;
      this.supervisorID = data.supervisor_id;
    });
    this.listaFormatosCartaTienda.subscribe((formatos) => {
      this.listaFormatosCartaTiendaEstatico = formatos;

      this.listaOpcionesImprrimirFormato = [];
      formatos.forEach((formato) => {
        this.listaOpcionesImprrimirFormato.push({
          formatoId: formato.pId,
          dobleCara: false,
          imprimir: false,
        });
      });
    });
    //#endregion
  }
  //#endregion

  //#region BUSCADOR DE FORMATOS

  //#region Filtro de le la lista de formatos
  private _filter() {
    this.controlBusqueda.valueChanges.subscribe((val) => {
      // Filtra en base al valor de la @variable=val
      this.filtroBusquedaFormatos = this.store
        .select((state) => state.formatosBusqueda.formatosBusqueda)
        .pipe(
          map((formatos) => {
            return formatos.filter(
              (formato: FormatoBusqueda) =>
                formato.pNombre.toLowerCase().indexOf(val.toLowerCase()) > -1
            );
          })
        );
    });
  }
  //#endregion

  //#region Enter en una opcion del buscador
  enterEventBuscadorFormatos() {
    this.filtroBusquedaFormatos
      .pipe(
        map((formatos) => {
          formatos.forEach((formato) => {
            if (this.controlBusqueda.value === formato.pNombre) {
              this.agregarFormatoListaDeFormatos(formato);
            }
          });
        })
      )
      .subscribe((data) => {});
  }
  //#endregion

  //#region Agregar el formato seleccionado
  async agregarFormatoListaDeFormatos(item: FormatoBusqueda) {
    // verifica si ya esta agregado
    var rspt = this.listaFormatosEstaticos.find((e) => e.pId === item.pId);

    if (rspt === undefined) {
      // Obtener la data completa del formato, con sus campos
      await this.cartaTiendaService
        .crudFormato(9, [item.pId])
        .then((formatoData: FormatoCartaTienda) => {
          this.cartaTiendaService
            .crudFormatoCampo(13, [item.pId])
            .then((camposFormato: CampoFormatoCartaTienda[]) => {
              formatoData.campos = camposFormato;

              this.store.dispatch(
                new AgregarFormatoAFormatoCartaTienda(formatoData)
              );

              var campos = [];
              Object.assign(campos, camposFormato);
              this.agregarCamposDelFormatoACamposComunes(campos);
            });
        });
      this.controlBusqueda.setValue("");
    } else {
      // SnackBar mostrar
    }
  }
  //#endregion

  //#region Agregar los campos a los campos en comun de todos los formatos
  agregarCamposDelFormatoACamposComunes(
    camposFormato: CampoFormatoCartaTienda[]
  ) {
    var aux = [];
    aux = this.listaCamposComunesEstaticos;
    if (this.listaCamposComunesEstaticos.length <= 0) {
      aux = camposFormato;
    } else {
      camposFormato.forEach((x) => {
        if (
          this.listaCamposComunesEstaticos.find(
            (y) => y.pIdCampo === x.pIdCampo
          ) === undefined
        ) {
          aux = [...aux, x];
        }
      });
    }

    this.store.dispatch(new AgregarCampoAFormatoCartaTienda(aux));
  }
  //#endregion

  //#endregion

  //#region LISTA DE FORMATOS

  //#region Elimina un solo formato
  eliminarFormato(item: FormatoCartaTienda) {
    var camposEliminar = [];
    var camposComunes = [];

    // Obteniendo los campos comunes
    this.listaFormatosEstaticos.forEach((formato: FormatoCartaTienda) => {
      if (formato.pId !== item.pId) {
        var campoFormat = [...formato.campos];
        var campoItem = [...item.campos];
        var aux = this._devuelveItemsComunDosArray(campoFormat, campoItem);
        camposComunes = camposComunes.concat(aux);
      }
    });

    // Obteniendo los campos que no son comunes con los demas formatos
    // para que sean eliminados
    camposEliminar = item.campos;
    camposComunes.forEach((x: CampoFormatoCartaTienda) => {
      camposEliminar = camposEliminar.filter((y) => y.pIdCampo !== x.pIdCampo);
    });

    // Eliminar los campos en campos comunes
    this.eliminarCamposDeCamposComunes(camposEliminar);

    // Eliminar en la lista de formatos
    this.store.dispatch(new EliminarFormatoAFormatoCartaTienda(item));
  }
  //#endregion

  //#region Devuelve los items comunes de dos arrays
  private _devuelveItemsComunDosArray(
    array1: CampoFormatoCartaTienda[],
    array2: CampoFormatoCartaTienda[]
  ): CampoFormatoCartaTienda[] {
    var repetidos: CampoFormatoCartaTienda[] = [];
    array1.forEach((x) => {
      array2.forEach((y) => {
        if (x.pIdCampo === y.pIdCampo) {
          repetidos.push(x);
        }
      });
    });
    return repetidos;
  }
  //#endregion

  //#region Eliminar los campos en comun del formato a eliminar
  eliminarCamposDeCamposComunes(camposEliminar: CampoFormatoCartaTienda[]) {
    var aux = [];
    if (this.listaCamposComunesEstaticos.length > 0) {
      aux = this.listaCamposComunesEstaticos.filter((x) => {
        if (
          camposEliminar.find((y) => y.pIdCampo === x.pIdCampo) === undefined
        ) {
          return x;
        }
      });
    }
    this.store.dispatch(new EliminarCampoAFormatoCartaTienda(aux));
  }
  //#endregion

  //#region Acciones de cada formato Imprimir - Doble cara
  public cambiarValorImprimirFormatoDobleCaraActivarDesactivar(
    formato: FormatoCartaTienda
  ) {
    this.listaOpcionesImprrimirFormato = this.listaOpcionesImprrimirFormato.map(
      (item) => {
        if (item.formatoId === formato.pId) {
          item.dobleCara = !item.dobleCara;
          return item;
        }
        return item;
      }
    );
  }

  public cambiarValorImprimirFormatoActivadoDesactivado(
    formato: FormatoCartaTienda
  ) {
    this.listaOpcionesImprrimirFormato = this.listaOpcionesImprrimirFormato.map(
      (item) => {
        if (item.formatoId === formato.pId) {
          item.imprimir = !item.imprimir;
          return item;
        }
        return item;
      }
    );
  }

  public obtenerValorDobleCaraFormato(formato: FormatoCartaTienda): boolean {
    return this.listaOpcionesImprrimirFormato.find(
      (item) => item.formatoId === formato.pId
    ).dobleCara;
  }

  public obtenerValorImprimirFormato(formato: FormatoCartaTienda): boolean {
    return this.listaOpcionesImprrimirFormato.find(
      (item) => item.formatoId === formato.pId
    ).imprimir;
  }
  //#endregion
  //#endregion

  //#region CREAR NUEVO FORMATO
  crearNuevoFormato() {
    this.router.navigateByUrl("comercial/consultas/cartastiendanuevo");
  }
  //#endregion

  //#region CARTA

  //#region Crear o actualizar una carta
  grabarPersonalCarta() {
    //this.grabadoCarta = true;
    if (this.cartaID === 0) {
      this._crearCarta();
    } else {
      this._actualizarCarta();
    }
  }
  //#endregion

  //#region Crear una carta
  private async _crearCarta() {
    this.spinnerService.show();
    var user = localStorage.getItem("currentUser");
    var idUser = JSON.parse(window.atob(user.split(".")[1])).uid;
    var pais = localStorage.getItem("Pais");

    let parametrosCarta = [];
    parametrosCarta.push(this.cadenaSeleccionada);
    parametrosCarta.push(this.supervisorID); // supervisor_id
    parametrosCarta.push(idUser); // user autentificado
    parametrosCarta.push(pais); // pais
    await this.cartaTiendaService
      .crudCarta(17, parametrosCarta)
      .then((idCarta: number) => {
        // Reemplazamos los datos de la cabecera
        this.store.dispatch(
          new ReemplazarCartaTienda({
            carta_id: idCarta,
            cadena_id: this.cadenaSeleccionada,
            supervisor_id: this.supervisorID,
          })
        );

        // Enviando los personales con sus campos
        this._enviarFormatosDeLaCarta(idCarta);
        this._enviarDataPersonal(idCarta);
      });
  }
  //#endregion

  //#region Actualizar una carta
  private async _actualizarCarta() {
    this.spinnerService.show();
    var user = localStorage.getItem("currentUser");
    var idUser = JSON.parse(window.atob(user.split(".")[1])).uid;
    var pais = localStorage.getItem("Pais");

    let parametrosCarta = [];
    parametrosCarta.push(this.cartaID);
    parametrosCarta.push(this.cadenaSeleccionada);
    parametrosCarta.push(this.supervisorID); // supervisor_id
    parametrosCarta.push(idUser); // Id del que iniciosesion
    parametrosCarta.push(pais); // Pais
    await this.cartaTiendaService
      .crudCarta(18, parametrosCarta)
      .then((idCarta: number) => {
        // Reemplazamos los datos de la cabecera
        this.store.dispatch(
          new ReemplazarCartaTienda({
            carta_id: idCarta,
            cadena_id: this.cadenaSeleccionada,
            supervisor_id: this.supervisorID,
          })
        );

        // Enviando los personales con sus campos
        this._enviarFormatosDeLaCarta(idCarta);
        this._enviarDataPersonal(idCarta);
      });
  }
  //#endregion

  //#region  Enviar al backend los formatos de la carta
  private async _enviarFormatosDeLaCarta(carta_id) {
    let parametros = [];
    this.listaFormatosEstaticos.forEach((formato) => {
      parametros.push(carta_id + "|" + formato.pId);
    });

    if (this.listaFormatosEstaticos.length <= 0) {
      parametros.push(carta_id);
    }

    await this.cartaTiendaService
      .crudCartaFormato(21, parametros, "*")
      .then((res) => {});
  }
  //#endregion

  //#region Enviar la data del personal
  private async _enviarDataPersonal(carta_id) {
    let parametros = [];
    this.listaPersonalEstatica.forEach((personal) => {
      parametros.push(carta_id);
    });
    await this.cartaTiendaService
      .crudPersonal(24, parametros, "*")
      .then((listaIDs: number[]) => {
        this._privateAsignandoIDaCadaPersonal(listaIDs, carta_id);
      });
  }
  //#endregion

  //#region Crear la estructura del personal para el store
  private _privateAsignandoIDaCadaPersonal(listaIDs: number[], carta_id) {
    this.listaPersonalEstatica = this.listaPersonalEstatica.map(
      (persona, index) => {
        let nuevoPersonal = {};
        nuevoPersonal = Object.assign(nuevoPersonal, persona);
        nuevoPersonal["id"] = listaIDs[index];
        return nuevoPersonal;
      }
    );

    this.store.dispatch(
      new ReemplazarTodoPersonalFormatoCartaTienda(this.listaPersonalEstatica)
    );

    this._enviarDataCamposCadaPersonal(carta_id);
  }
  //#endregion

  //#region Enviar los datos del personal al backend
  private async _enviarDataCamposCadaPersonal(carta_id: number) {
    let parametros = [];
    this.listaPersonalEstatica.forEach((personal) => {
      var cadena = null;
      var parametroPersona = [];
      this.listaCamposComunesEstaticos.forEach((campo) => {
        var aux = "" + personal[campo.pIdCampo];
        if (
          personal[campo.pIdCampo] !== undefined &&
          personal[campo.pIdCampo].pValor !== undefined
        ) {
          aux = personal[campo.pIdCampo].pId;
        }

        if (personal[campo.pIdCampo] === undefined) {
          aux = "";
        }

        cadena =
          carta_id + "|" + personal["id"] + "|" + campo.pIdCampo + "|" + aux;
        parametroPersona.push(cadena);
      });
      cadena = parametroPersona.join("*");
      if (cadena !== null) {
        parametros.push(cadena);
      }
    });

    if (this.listaPersonalEstatica.length <= 0) {
      parametros.push(carta_id);
    }

    await this.cartaTiendaService
      .crudPersonalCampo(27, parametros, "*")
      .then((data) => {});

    this.spinnerService.hide();
    this.openSnackBar("La carta se guardo correctanente", "Cerrar");
  }
  //#endregion

  //#endregion

  //#region VER LAS IMPRESIONES DE CADA PERSONAL
  imprimirCartasPersonal() {
    //window.print();
    this.router.navigateByUrl("comercial/consultas/cartastiendaimprimir");
  }
  //#endregion

  //#region LIMPIAR TODA LA PANTALLA
  public limpiarTodosLosCampos() {
    // limpiando cabecera
    this.store.dispatch(
      new ReemplazarCartaTienda({
        carta_id: 0,
        cadena_id: 0,
        supervisor_id: 0,
      })
    );

    // limpiando los formatos
    this.store.dispatch(new ReemplazarFormatoAFormatoCartaTienda([]));
    // limpiando los campos
    this.store.dispatch(new ReemplazarCampoAFormatoCartaTienda([]));
    // limpieando personal
    this.store.dispatch(new ReemplazarTodoPersonalFormatoCartaTienda([]));
  }
  //#endregion

  //#region ABRIR MODAL CON UNA TABLA DE CARTAS
  modalTablaCartas() {
    const dialogRef = this.dialog.open(TablaCartasComponent, {
      data: {
        cadena_id: this.cadenaSeleccionada,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      //console.log(`Dialog result: ${result}`);
    });
  }
  //#endregion

  //#region SNACKBAR
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 5000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
  //#endregion

  //#region VALIDACIONES
  public validacionBotonGrabar() {
    return this.cadenaSeleccionada === 0 || this.supervisorID == 0;
  }
  //#endregion

  //#region IMPRIMIR TODO EN UNO

  onPrintDocumento() {
    const documentoIds = [];
    this.printService.printDocument("documento", documentoIds);
    this._obtenerLosFormatosParaImprimir();
  }

  private _obtenerLosFormatosParaImprimir() {
    this.listaDocumentosImprimir = [];
    this.listaFormatosCartaTiendaEstatico.forEach((formato) => {
      var camposFormato = formato.campos;
      this._obtenerELPersonalParaImprimir(formato, camposFormato);
    });

    // Agregando paginas en blanco
    this._agregarPaginasEnBlanco();

    // Enviando al store
    this.store.dispatch(
      new ReemplazarDataImprimir(this.listaDocumentosImprimir)
    );
  }

  private _agregarPaginasEnBlanco() {
    var nuevaData = [];

    this.listaDocumentosImprimir.forEach((documento) => {
      var acciones = this.listaOpcionesImprrimirFormato.find(
        (item) => item.formatoId === documento.formatoId
      );
      if (acciones.imprimir) {
        // En caso de que no sea doble cara
        if (acciones.dobleCara) {
          nuevaData = [...nuevaData, ...this._conDobleCara(documento)];
        }
        // En caso de que no sea doble cara
        else {
          nuevaData = [...nuevaData, ...this._sinDobleCara(documento)];
        }
      }
    });
    this.listaDocumentosImprimir = nuevaData;
  }

  private _conDobleCara(documento: ImprimirModel): ImprimirModel[] {
    var nuevosDocumentos: ImprimirModel[] = [];
    var listaHojas = documento.contenido.split("&lt;&lt;NUEVO&gt;&gt;");
    if (listaHojas.length % 2 !== 0) {
      listaHojas = [...listaHojas, "<br/><br/>"];
    }

    listaHojas.forEach((hoja) => {
      nuevosDocumentos.push({
        formatoId: documento.formatoId,
        contenido: hoja,
      });
    });

    return nuevosDocumentos;
  }

  private _sinDobleCara(documento: ImprimirModel): ImprimirModel[] {
    var nuevosDocumentos: ImprimirModel[] = [];
    var listaHojas = documento.contenido.split("&lt;&lt;NUEVO&gt;&gt;");
    var aux = [];
    listaHojas.forEach((hoja) => {
      nuevosDocumentos.push({
        formatoId: documento.formatoId,
        contenido: hoja,
      });

      nuevosDocumentos.push({
        formatoId: documento.formatoId,
        contenido: "<br/><br/>",
      });
    });
    return nuevosDocumentos;
  }

  private _obtenerELPersonalParaImprimir(
    formato: FormatoCartaTienda,
    campos: CampoFormatoCartaTienda[]
  ) {
    this.listaPersonalEstatica.forEach((persona) => {
      this.listaDocumentosImprimir.push(
        Object.assign(
          {},
          {
            formatoId: formato.pId,
            contenido: this._obtenerCadenaReemplazada(
              formato.pContenido,
              persona,
              campos
            ),
          }
        )
      );
    });
  }

  private _obtenerCadenaReemplazada(
    formato_contenido: string,
    persona: any,
    campos: CampoFormatoCartaTienda[]
  ): string {
    var documentoPersona = formato_contenido;
    campos.forEach((campo) => {
      var find = "#" + campo.pNombre + "#";
      var re = new RegExp(find, "g");
      if (campo.pIdTipoCampo === 3) {
        documentoPersona = documentoPersona.replace(
          re,
          persona[campo.pIdCampo].pValor
        );
      } else {
        documentoPersona = documentoPersona.replace(
          re,
          persona[campo.pIdCampo]
        );
      }
    });
    return documentoPersona;
  }
  //#endregion
}
