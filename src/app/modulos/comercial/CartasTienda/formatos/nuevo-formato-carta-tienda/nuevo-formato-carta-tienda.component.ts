import { Component, OnInit } from "@angular/core";
import { map, startWith } from "rxjs/operators";
import { Location } from "@angular/common";

import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import { AngularEditorConfig } from "@kolkov/angular-editor";

import { NgxSpinnerService } from "ngx-spinner";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from "@angular/material/snack-bar";
import { NuevoCampoFormatoCartaTiendaComponent } from "../../campos/nuevo-campo-formato-carta-tienda/nuevo-campo-formato-carta-tienda.component";
import { TablaFormatosComponent } from "../tabla-formatos/tabla-formatos.component";
import { TablaCamposComponent } from "../../campos/tabla-campos/tabla-campos.component";

import { MatDialog } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { CartaTiendaService } from "../../service/carta-tienda.service";
import { ComboCadena } from "../../shared/ComboCadena";

//#region Store
import { CampoBusqueda } from "../../store/carta_tienda/campo_busqueda/campo_busqueda.model";
import { CargarCamposBusqueda } from "../../store/carta_tienda/campo_busqueda/campo_busqueda.actions";
import { Store, Select } from "@ngxs/store";

import { AgregarFormatoBusqueda } from "../../store/carta_tienda/formato_busqueda/formato_busqueda.actions";
//#endregion

@Component({
  selector: "app-nuevo-formato-carta-tienda",
  templateUrl: "./nuevo-formato-carta-tienda.component.html",
  styleUrls: ["./nuevo-formato-carta-tienda.component.css"],
})
export class NuevoFormatoCartaTiendaComponent implements OnInit {
  //#region VARIABLES
  //#region Variables General
  horizontalPosition: MatSnackBarHorizontalPosition = "start";
  verticalPosition: MatSnackBarVerticalPosition = "bottom";
  panelOpenState = false;
  //#endregion

  //#region Variables Crear formato
  nombreFormato: string = null;
  contenido: string = "";
  //'<p>Se&#241;ores:</p><p></p><p>SUPERMERCADOS PERUANOS S.A. (SPSA)</p><p>Tienda: Plaza Bre&#241;a</p><p>Presente. -</p><p></p><p>Atenci&#243;n. - Gerente de Tiendas &#8211; Representante Legal</p><p></p><p>De nuestra Consideraci&#243;n.</p><p>Tenemos el agrado de dirigirnos a usted con el fin de solicitar el acceso a las instalaciones de la tienda PLAZA VEA BRE&#209;A al personal que se detalla a continuaci&#243;n, a efectos de que puedan prestar su apoyo como MERCADERISTA PERMANENTE representante de la marca COLGATE. Nos comprometemos a asumir cualquier responsabilidad frente a las labores desempe&#241;adas por los referidos colaboradores, igualmente garantizamos que el pago de los beneficios de los referidos, colaboradores se realiza de manera oportuna, no existiendo ning&#250;n riesgo que pudiera generar alguna contingencia para SPSA.</p>';
  listaCampos: CampoBusqueda[];
  verificar = true;

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: "300px",
    minHeight: "0",
    maxHeight: "auto",
    width: "auto",
    minWidth: "0",
    translate: "yes",
    showToolbar: true,
    placeholder: "Enter text here...",
    defaultParagraphSeparator: "",
    defaultFontName: "",
    defaultFontSize: "",
    fonts: [
      { class: "arial", name: "Arial" },
      { class: "times-new-roman", name: "Times New Roman" },
      { class: "calibri", name: "Calibri" },
      { class: "comic-sans-ms", name: "Comic Sans MS" },
    ],
    //customClasses: [
    //  {
    //    name: 'quote',
    //    class: 'quote',
    //  },
    //  {
    //    name: 'redText',
    //    class: 'redText',
    //  },
    //  {
    //    name: 'titleText',
    //    class: 'titleText',
    //    tag: 'h1',
    //  },
    //],
    uploadUrl: "v1/image",
    uploadWithCredentials: false,
    sanitize: false,
    toolbarPosition: "top",
    toolbarHiddenButtons: [
      [],
      [
        //"textColor",
        //"backgroundColor",
        "link",
        "unlink",
        "insertImage",
        "insertVideo",
      ],
    ],
  };
  //#endregion

  //#region Variables cadena
  listaCadenas: ComboCadena[] = [];
  cadenaSeleccionada = null;
  //#endregion

  //#region Variables Buscador de campos
  myControl = new FormControl();
  filtroBusquedaCampos: Observable<CampoBusqueda[]>;
  //#endregion
  //#endregion

  //#region constructor
  constructor(
    public dialog: MatDialog,
    private store: Store,
    private _snackBar: MatSnackBar,
    private cartaTiendaService: CartaTiendaService,
    private spinnerService: NgxSpinnerService,
    private sanitizer: DomSanitizer,
    private _location: Location
  ) {}
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.cargarDataCadena();
    this._filter();
    this.listaCampos = new Array();
  }
  //#endregion

  //#region DATOS
  public async cargarDataCadena() {
    await this.cartaTiendaService.combos(31, []).then((data: ComboCadena[]) => {
      this.listaCadenas = data;
    });
  }

  //#region METODOS Y FUNCIONES
  //#region VERFICIAR CONTENIDO DEL NUEVO FORMATO
  /**
   * Lee todo el texto del formato y los campos identificados
   * cambian su apareciencia.
   */
  btnVerificarContenido() {
    var auxContenido = this.contenido;
    this.listaCampos.forEach((campo) => {
      this.contenido = this.contenido.replace(
        "//" + campo.pNombre + "//",
        "<b>#" + campo.pNombre + "#</b>"
      );
    });
    //this.contenido = auxContenido;
    this.verificar = false;
  }
  //#endregion

  //#region GUARDAR FORMATO
  /**
   * Se envia la data para ser almancenada en la DB
   * Se agrega al store de formato_busqueda
   */
  public guardarFormato() {
    this.spinnerService.show();
    var user = localStorage.getItem("currentUser");
    var idUser = JSON.parse(window.atob(user.split(".")[1])).uid;
    var pais = localStorage.getItem("Pais");
    //<===============================================>//
    // ENVIANDO A LA API
    let parametrosCampos = [];
    let parametrosFormato = [];

    parametrosFormato.push(this.cadenaSeleccionada);
    parametrosFormato.push(this.nombreFormato);
    parametrosFormato.push(this.contenido);
    parametrosFormato.push(idUser);
    parametrosFormato.push(pais);

    this.cartaTiendaService
      .crudFormato(10, parametrosFormato)
      .then((idFormato) => {
        this.listaCampos.forEach((campo) => {
          parametrosCampos.push(idFormato + "|" + campo.pId);
        });

        //this.store.dispatch(
        //  new AgregarFormatoBusqueda({
        //    pId: +idFormato,
        //    pNombre: this.nombreFormato,
        //  })
        //);

        this.cartaTiendaService
          .crudFormatoCampo(14, parametrosCampos)
          .then((res) => {
            this.spinnerService.hide();
            this._openSnackBar("Formato creado correctanente", "Cerrar");
          });
      });

    //<===============================================>//
  }

  public validacionCampos() {
    return (
      this.cadenaSeleccionada == null ||
      this.nombreFormato == null ||
      this.nombreFormato.trim() === "" ||
      this.verificar
    );
  }

  public limpiarTodosLosCampos() {
    this.listaCampos = [];
    this.nombreFormato = null;
    this.contenido = "";
    this.cadenaSeleccionada = null;
  }

  private _openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 5000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
  //#endregion

  //#region BUSCADOR DE CAMPOS
  /**
   * En caso de que escriba la N letra , entonces llamara a la APi y guardara
   * en el store y se devolvera toda la informacion para mostrar en el select
   *
   * Se obtiene la data del store filtrada o completa
   */
  private _filter() {
    this.myControl.valueChanges.subscribe((val) => {
      // LLamando a la api
      if (val != null && val.length == 3) {
        this.store.dispatch(new CargarCamposBusqueda("hola"));
      }

      // Filtra en base al valor de la @variable=val
      this.filtroBusquedaCampos = this.store
        .select((state) => state.camposBusqueda.camposBusqueda)
        .pipe(
          map((campo) => {
            return campo.filter(
              (e: CampoBusqueda) =>
                e.pNombre.toLowerCase().indexOf(val.toLowerCase()) > -1
            );
          })
        );
    });
  }

  /**
   *
   * Al encontrar el campo en la lista, al presionar ENTER, el item
   * se agrega a la lista de campos
   */
  enterEventBuscadorCampos() {
    this.filtroBusquedaCampos
      .pipe(
        map((campos) => {
          campos.forEach((campo) => {
            if (this.myControl.value === campo.pNombre) {
              this.agregarCampoSeleccionadoAlFormato(campo);
            }
          });
        })
      )
      .subscribe((data) => {});
  }

  /**
   * Agrega un nuevo campo que sera utilizado en el
   * formato actual
   */
  agregarCampoSeleccionadoAlFormato(item: CampoBusqueda) {
    //this.filtroBusquedaCampos=null;

    // verifica si ya esta agregado
    var rspt = this.listaCampos.find((e) => e.pId === item.pId);

    if (rspt === undefined) {
      this.listaCampos.push(item);
    } else {
      // SnackBar mostrar
    }
  }
  //#endregion

  //#region ELIMINAR CAMPO AGREGADO
  /**
   * Elimina el campo agregado de la lista de campos
   * que se utilizaran en el formato
   */
  eliminarCampoLista(item: CampoBusqueda) {
    this.listaCampos = this.listaCampos.filter((e) => e !== item);
  }
  //#endregion

  //#region MODAL AGREGAR NUEVO CAMPO
  /**
   * Permite abrir una ventana de dialogo, para crear un nuevo
   * campo en caso de que no exista en la lista seleccionable.
   */
  dialogAgregarNuevoCampo() {
    const dialogRef = this.dialog.open(NuevoCampoFormatoCartaTiendaComponent);

    dialogRef.afterClosed().subscribe((result) => {
      //console.log(`Dialog result: ${result}`);
    });
  }
  //#endregion
  //#endregion

  //#region MODAL VER TODOS LOS FORMATOS
  dialogVerTodosLosFormatos() {
    const dialog = this.dialog.open(TablaFormatosComponent, {
      data: {
        cadena_id: this.cadenaSeleccionada,
      },
    });
    dialog.afterClosed().subscribe((res) => {
      //console.log(`Dialog result: ${res}`);
    });
  }
  //#endregion

  //#region MODAL TABLA CAMPOS
  dialogVerTodosLosCampos() {
    const dialog = this.dialog.open(TablaCamposComponent);
    dialog.afterClosed().subscribe((res) => {
      //console.log(`Dialog result: ${res}`);
    });
  }
  //#endregion

  //#region renderizarHTMLPrevisualizar
  renderizarHTMLPrevisualizar(): SafeHtml {
    var html: SafeHtml;
    html = this.sanitizer.bypassSecurityTrustHtml(this.contenido);
    //console.log(this.contenido);

    return html;
  }
  //#endregion

  //#region ACCIONES
  public regresarPaginaAnterior() {
    this._location.back();
  }
  //#endregion
}
