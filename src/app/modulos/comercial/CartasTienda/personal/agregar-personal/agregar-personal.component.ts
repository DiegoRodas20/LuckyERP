import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { DesplegableCampo } from "../../models/DesplegableCampo";
import { FormControl } from "@angular/forms";

import { CartaTiendaService } from "../../service/carta-tienda.service";

//#region DATA PERSONAL BUSCADOR
import { PersonalDataBuscador } from "../../models/agregar-personal/personal-data-buscador";
//#endregion

//#region STORE
import { Store, Select } from "@ngxs/store";
import { CampoFormatoCartaTienda } from "../../store/carta_tienda/formato_carta_tienda/formato_carta_tienda.model";
import { AgregarPersonalAFormatoCartaTienda } from "../../store/carta_tienda/personal_carta_tienda/personal_carta_tienda.actions";
import { ComboTienda } from "../../shared/ComboTienda";
import { CartaTienda } from "../../store/carta_tienda/carta_tienda/carta_tienda.model";
//#endregion

@Component({
  selector: "app-agregar-personal",
  templateUrl: "./agregar-personal.component.html",
  styleUrls: ["./agregar-personal.component.css"],
})
export class AgregarPersonalComponent implements OnInit {
  //#region VARIABLES STORE
  public listaCamposComunes: Observable<CampoFormatoCartaTienda[]>;
  public listaCamposComunesEstaticos: CampoFormatoCartaTienda[];
  //#endregion

  //#region VARIABLE DATA PERSONA
  dataPersona = {};
  //#endregion

  //#region VARIABLE BUSCADOR
  myControl = new FormControl();
  options: PersonalDataBuscador[] = [];
  filteredOptions: Observable<PersonalDataBuscador[]>;
  //#endregion

  //#region COMBO DE TIENDAS
  listaTiendas: ComboTienda[] = [];
  cartaTiendaObserver: Observable<CartaTienda>;
  cartaTiendaEstatica: CartaTienda;
  tiendaSeleccionada = 0;
  //#endregion
  constructor(
    private store: Store,
    private cartaTiendaService: CartaTiendaService
  ) {}

  //#region ngOnInit
  ngOnInit(): void {
    this._cargarDataStore();
    this.reconstruirFormulario();
    this._escucharCambiosControl();
    this._escucharControlLlamarDataApi();
    this._escucharCambiosCadena();
  }
  //#endregion

  //#region COMBO TIENDAS
  private _escucharCambiosCadena() {
    this.cartaTiendaObserver = this.store.select(
      (state) => state.cartaTienda.cartaTienda
    );
    this.cartaTiendaObserver.subscribe((data) => {
      this.cartaTiendaEstatica = data;
      this._cargarTiendas(data.cadena_id);
    });
  }

  // Obteniendo las tiendas en base a la cadena
  private async _cargarTiendas(cadena_id: number) {
    await this.cartaTiendaService
      .combos(32, [cadena_id])
      .then((data: ComboTienda[]) => {
        this.listaTiendas = data;
      });
  }

  // Tienda seleccionada del combo
  public tiendaSeleccionadaCombo() {
    var tienda: ComboTienda = this.listaTiendas.find(
      (e) => e.pId === this.tiendaSeleccionada
    );

    this.listaCamposComunesEstaticos.find((campo) => {
      if (campo.pNombre.toLocaleLowerCase() === "TiendaId") {
        this.dataPersona[campo.pIdCampo] = tienda.pId;
      }

      if (campo.pNombre.toLocaleLowerCase() === "nombre tienda") {
        this.dataPersona[campo.pIdCampo] = tienda.pNombre;
      }
    });
  }
  //#endregion

  //#region CARGAR DATA DEL STORE
  private _cargarDataStore() {
    this.listaCamposComunes = this.store.select(
      (state) => state.camposCartaTienda.camposCarta
    );

    this.listaCamposComunes.subscribe((campos) => {
      this.listaCamposComunesEstaticos = campos;
    });
  }
  //#endregion

  //#region DATA QUE SE ENVIARA AL DESPLEGABLE
  recibiendoDataDesplegable(id_campo: number, valor: DesplegableCampo) {
    this.dataPersona[id_campo] = valor;
  }
  //#endregion

  //#region AGREGAR UNA NUEVA PERSONA
  agregarPersonal() {
    this.myControl.setValue("");
    this.store.dispatch(
      new AgregarPersonalAFormatoCartaTienda(
        Object.assign({}, this.dataPersona)
      )
    );
    this.dataPersona = {};
  }

  /**
   * Validacion de datos del personal para ser registrado
   */
  validacionDatosPersonal(): boolean {
    var flag = true;
    var aux = null;

    this.listaCamposComunesEstaticos.forEach((campo) => {
      aux = this.dataPersona[campo.pIdCampo];
      if (aux === null || aux === undefined || aux === 0 || aux === "") {
        flag = false;
      }
    });
    return flag;
  }
  //#endregion

  //#region CONSTRUCCION DE FORMULARIO

  reconstruirFormulario() {
    this.listaCamposComunes.subscribe((campos) => {
      campos.forEach((campo) => {
        this.dataPersona[campo.pIdCampo] =
          this._asignandoValoresDefaultDataPersona(campo.pIdTipoCampo);
      });
    });
  }

  private _asignandoValoresDefaultDataPersona(tipo: number): any {
    switch (tipo) {
      case 1: // numero
        return 0;
      case 2: // texto
        return null;
      case 3: //desplegable
        return null;
      case 4: // fecha
        return null;
      default:
        return "Error";
    }
  }
  //#endregion

  //#region BUSCADOR DE PERSONAS

  public dataEnviaComponenteCampo(data) {
    if (data !== null && data !== undefined) {
      return data;
    }
    return "";
  }

  public opcionSeleccionada(item) {
    this.cargarValor(item);
  }

  public opcionEscrita() {
    var aux = null;
    this.options.forEach((persona) => {
      if (this.myControl.value === this.devolverDataPersona(persona)) {
        aux = persona;
      }
    });
    //const dataSeleccionada = this.options.find(
    //  (item) => item.id === +this.myControl.value
    //);
    //
    if (aux !== null) {
      this.cargarValor(aux);
    }
  }

  public cargarValor(dataSeleccionada: PersonalDataBuscador) {
    if (dataSeleccionada !== undefined) {
      this.listaCamposComunesEstaticos.find((campo) => {
        if (campo.pNombre.toLocaleLowerCase() === "primer nombre") {
          this.dataPersona[campo.pIdCampo] = dataSeleccionada.primerNombre;
        }

        if (campo.pNombre.toLocaleLowerCase() === "segundo nombre") {
          this.dataPersona[campo.pIdCampo] = dataSeleccionada.segundoNombre;
        }

        if (campo.pNombre.toLocaleLowerCase() === "apellido paterno") {
          this.dataPersona[campo.pIdCampo] = dataSeleccionada.apellidoPat;
        }

        if (campo.pNombre.toLocaleLowerCase() === "apellido materno") {
          this.dataPersona[campo.pIdCampo] = dataSeleccionada.apellidoMat;
        }

        if (campo.pNombre.toLocaleLowerCase() === "num documento") {
          this.dataPersona[campo.pIdCampo] = dataSeleccionada.numero_doc;
        }

        if (campo.pNombre.toLocaleLowerCase() === "tipo documento") {
          this.dataPersona[campo.pIdCampo] = dataSeleccionada.nombre_doc;
        }

        if (campo.pNombre.toLocaleLowerCase() === "id_personal") {
          this.dataPersona[campo.pIdCampo] = dataSeleccionada.id;
        }

        if (campo.pNombre.toLocaleLowerCase() === "cargo") {
          this.dataPersona[campo.pIdCampo] = dataSeleccionada.cargo;
        }

        if (
          this.tiendaSeleccionada !== 0 &&
          campo.pNombre.toLocaleLowerCase() === "nombre tienda"
        ) {
          this.dataPersona[campo.pIdCampo] = this.listaTiendas.find(
            (v) => v.pId == this.tiendaSeleccionada
          ).pNombre;
        }
      });
    }

    //this.myControl.setValue("");
  }

  private _escucharControlLlamarDataApi() {
    this.myControl.valueChanges.subscribe((val: string) => {
      if (val.length === 3) {
        this._obtenerDataPersona(val);
      }
    });
  }

  private _obtenerDataPersona(val: string) {
    var empresa = localStorage.getItem("Empresa");
    var param = [];
    param.push(val);
    param.push(empresa);
    this.cartaTiendaService
      .consultaRRHH(29, param)
      .then((data: PersonalDataBuscador[]) => {
        this.options = [...data];

        this._escucharCambiosControl();
      });
  }

  private _escucharCambiosControl() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(""),
      map((value) => this._filter(value))
    );
  }

  private _filter(value: string): PersonalDataBuscador[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(
      (option) =>
        option.primerNombre.toLowerCase().indexOf(filterValue) === 0 ||
        option.segundoNombre.toLowerCase().indexOf(filterValue) === 0 ||
        option.apellidoPat.toLowerCase().indexOf(filterValue) === 0 ||
        option.apellidoMat.toLowerCase().indexOf(filterValue) === 0 ||
        (option.numero_doc + "").toLowerCase().indexOf(filterValue) === 0 ||
        (option.numero_doc + " " + option.primerNombre.toLowerCase())
          .toLowerCase()
          .indexOf(filterValue) === 0 ||
        (option.numero_doc + " " + option.apellidoMat.toLowerCase())
          .toLowerCase()
          .indexOf(filterValue) === 0 ||
        (option.numero_doc + " " + option.apellidoPat.toLowerCase())
          .toLowerCase()
          .indexOf(filterValue) === 0
    );
  }

  public devolverDataPersona(data: PersonalDataBuscador): string {
    if (data === undefined) {
      return "";
    }

    return (
      data.primerNombre +
      " " +
      data.segundoNombre +
      " " +
      data.apellidoPat +
      " " +
      data.apellidoMat +
      ""
    );
  }
  //#endregion
}
