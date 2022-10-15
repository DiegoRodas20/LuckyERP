import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { Location } from "@angular/common";

import { PrintService } from "../../../../../shared/services/print.service";
//#region Store
import { Store, Select, UpdateState } from "@ngxs/store";

//#region Formatos
import {
  CampoFormatoCartaTienda,
  FormatoCartaTienda,
} from "../../store/carta_tienda/formato_carta_tienda/formato_carta_tienda.model";
//#endregion

//#region Cartas
import { CartaTienda } from "../../store/carta_tienda/carta_tienda/carta_tienda.model";
//#endregion

//#region Imprimir
import { ImprimirModel } from "../../store/carta_tienda/imprimir/imprimir.model";
import { ReemplazarDataImprimir } from "../../store/carta_tienda/imprimir/imprimir.actions";

//#endregion
@Component({
  selector: "app-plantilla-imprimir",
  templateUrl: "./plantilla-imprimir.component.html",
  styleUrls: ["./plantilla-imprimir.component.css"],
})
export class PlantillaImprimirComponent implements OnInit {
  //#region  VARIABLES
  //#region STORE
  public listaFormatos: Observable<FormatoCartaTienda[]>;
  public listaCamposComunes: Observable<CampoFormatoCartaTienda[]>;
  public listaPersonal: Observable<any[]>;
  public cartaCabecera: Observable<CartaTienda>;
  //#endregion

  //#region DATA ESTATICA
  public listaFormatosEstatica: FormatoCartaTienda[];
  public listaCamposComunesEstatica: CampoFormatoCartaTienda[];
  public listaPersonalEstatica: any[];
  public cartaCabeceraEstatica: CartaTienda;
  //#endregion

  //#region DATA MOSTRAR
  public htmlRenderizar = "";
  public htmlReserva = "";
  public listaHojasFormato: string[] = [];
  public listaDocumentosImprimir: ImprimirModel[] = [];
  //#endregion

  //#region Variables tipo impresion
  public dobleCara = true;
  //#endregion

  //#endregion

  constructor(
    private store: Store,
    public printService: PrintService,
    private _location: Location
  ) {
    this._cargaDatosStore();
  }

  ngOnInit(): void {}

  //#region CARGA DE DATOS DEL STORE
  private _cargaDatosStore() {
    //#region STORE
    this.cartaCabecera = this.store.select(
      (state) => state.cartaTienda.cartaTienda
    );

    this.listaCamposComunes = this.store.select(
      (state) => state.camposCartaTienda.camposCarta
    );
    this.listaPersonal = this.store.select(
      (state) => state.personalCartaTienda.personalCarta
    );
    this.listaFormatos = this.store.select(
      (state) => state.formatosCartaTienda.formatosCarta
    );
    //#endregion

    //#region ESTATICOS
    this.listaCamposComunes.subscribe((campos) => {
      this.listaCamposComunesEstatica = campos;
    });
    this.listaFormatos.subscribe((formatos) => {
      this.listaFormatosEstatica = formatos;
    });
    this.listaPersonal.subscribe((personal) => {
      this.listaPersonalEstatica = personal;
    });
    this.cartaCabecera.subscribe((data: CartaTienda) => {
      this.cartaCabeceraEstatica = data;
    });
    //#endregion
  }
  //#endregion

  //#region SELECCIONAR UN FORMATO
  public seleccionarFormato(item: FormatoCartaTienda) {
    this._dividirFormato(item.pContenido);
  }

  private _dividirFormato(formato: string) {
    this.listaHojasFormato = formato.split("&lt;&lt;NUEVO&gt;&gt;");
  }
  //#endregion

  //#region SELECCIONAR UNA PERSONA

  //#endregion

  //#region BOTON ABSOLUTO IMPRIMIR
  onPrintDocumento() {
    if (!this.dobleCara) {
      this._sinDobleCaraLosDocumentos();
    }
    this._enviarDocumentosStoreImprimir();
    const documentoIds = [];
    this.printService.printDocument("documento", documentoIds);
  }

  public seleccionarPersona(persona: any) {
    this.listaDocumentosImprimir = [];
    this.listaHojasFormato.forEach((htmlRenderizar) => {
      var aux = htmlRenderizar;
      this.listaCamposComunesEstatica.forEach((campo) => {
        var find = "#" + campo.pNombre + "#";
        var re = new RegExp(find, "g");
        aux = aux.replace(re, persona[campo.pIdCampo]);
      });

      this.listaDocumentosImprimir.push({
        formatoId: 0,
        contenido: aux,
      });
    });
  }

  private _sinDobleCaraLosDocumentos() {
    var nuevaData: ImprimirModel[] = [];
    this.listaDocumentosImprimir.forEach((documento) => {
      nuevaData.push(documento);
      nuevaData.push({
        formatoId: 0,
        contenido: "<br/><br/>",
      });
    });
    this.listaDocumentosImprimir = nuevaData;
  }

  private _enviarDocumentosStoreImprimir() {
    this.store.dispatch(
      new ReemplazarDataImprimir(this.listaDocumentosImprimir)
    );
  }
  //#endregion

  //#region ACCIONES
  public regresarPaginaAnterior() {
    this._location.back();
  }
  //#endregion
}
