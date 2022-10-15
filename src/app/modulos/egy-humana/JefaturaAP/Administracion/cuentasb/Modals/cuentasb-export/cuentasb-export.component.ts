import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { SelectionModel } from "@angular/cdk/collections";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import Swal from "sweetalert2";
import * as moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import * as fileSaver from "file-saver";

import { IDetail, IMain } from "../../../../Model/Icuentasb";
import { CuentasbService } from "../../../../Services/cuentasb.service";
import { adminpAnimations } from "../../../../Animations/adminp.animations";
import PersonalSeleccionadoHandler from "./validaciones/handlers/PersonalSeleccionadoHandler";
import DatosEmpresaHandler from "./validaciones/handlers/DatosEmpresaHandler";
import DatosContactoHandler from "./validaciones/handlers/DatosContactoHandler";
import BancoSeleccionadoHandler from "./validaciones/handlers/BancoSeleccionadoHandler";
import TieneFormatoHandler from "./validaciones/handlers/TieneFormatoHandler";
import { ErrorStateMatcher } from "@angular/material/core";
import { MatSnackBar } from "@angular/material/snack-bar";

interface TipoCuenta {
  nParam: number;
  sDesc: string;
}

interface IPlanilla {
  nIdPlla: number;
  sCodPlla: string;
  sDesc: string;
}

interface ICiudad {
  nDadTipEle: number;
  nIdTipEle: number;
  nParam: number;
  sAbrev?: number;
  sCod: string;
  sDesc: string;
}

interface IBanco {
  bDisBanco: boolean;
  nIdBanco_: number;
  nLongCta: number;
  sDesc: string;
}

interface ITipoDoc {
  nIdTipoDoc: number;
  sAbrev: string;
  sCodTipoDoc: string;
  sDesc: string;
}

class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: "app-cuentasb-export",
  templateUrl: "./cuentasb-export.component.html",
  styleUrls: [
    "./cuentasb-export.component.css",
    "./cuentasb-export.component.scss",
  ],
  animations: [adminpAnimations],
})
export class CuentasbExportComponent implements OnInit {
  //#region GENERAL
  @Input() nombresNumeroDocFiltro: string;
  @Input() planillaFiltro: string;
  @Input() ciudadFiltro: string;
  @Input() tipoCuentaFiltro: string;

  panelOpenState = true;
  deshabilitarPanels = true;
  bancoPoseeFormatoAlert = false;
  url = "";
  matcher = new MyErrorStateMatcher();
  pbDetail = false;
  //#endregion

  //#region LISTA DE PERSONAL
  //#region Filtro
  // Tipo cuenta
  formFiltro: FormGroup;
  dataComboTipoCuenta: TipoCuenta[] = [];

  // Ciudad
  selectedCiudad: string;
  dataComboCiudad: ICiudad[] = [];

  // Planilla
  selectedPlanilla: string;
  dataComboPlanilla: IPlanilla[] = [];

  // Tipo documento
  selectedTipoDocumento: string;
  dataComboTipoDocumento: ITipoDoc[];
  //#endregion

  //#region Tabla
  displayedColumnsTablaPersonal: string[] = [
    "select",
    "sNombres",
    "sCodPlla",
    "sTipo",
    "sTipoCta",
    "dFechIni",
  ];
  dataTablaPersonal: IMain[] = [];
  dataSourceTablaPersonal = new MatTableDataSource<IMain>(
    this.dataTablaPersonal
  );
  selectionTablaPersonal = new SelectionModel<IMain>(true, []);

  @ViewChild("pagListaPersonal", { static: true })
  pagListaPersonal: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  //#endregion
  //#endregion

  //#region DATOS DE LA EMPRESA
  formDatosEmpresa: FormGroup;
  //#endregion

  //#region DATOS DEL CONTACTO
  formDatosContacto: FormGroup;
  //#endregion

  //#region COMBO BANCOS
  dataComboBancos: IBanco[] = [];
  selectedComboBanco = 0;
  //#endregion

  //#region BOTON DE ACCIONES
  estadoBotonFb = false;
  tsExport = "inactive";
  fbExport = [{ icon: "cloud_download", tool: "Generar excel" }];
  abExport = [];
  //#endregion

  constructor(
    public activeModal: NgbActiveModal,
    public service: CuentasbService,
    @Inject("BASE_URL") baseUrl: string,
    public fb: FormBuilder,
    private spi: NgxSpinnerService,
    private _snackBar: MatSnackBar
  ) {
    this.url = baseUrl;
  }

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_cuentasb_export");
    this._crearFormFiltro();
    this._crearFormDataEmpresa();
    this._crearFormDataContacto();

    await this._cargarDataComboBancos();
    await this._cargarDataComboCiudad();
    await this._cargarDataComboPlanilla();
    await this._cargarDataComboTipoDocumento();

    await this._cargarDataComboTipoCuenta();
    await this._cargarDataListaPersonal();
    this.spi.hide("spi_cuentasb_export");
  }

  ngAfterViewInit() {
    this.dataSourceTablaPersonal.paginator = this.pagListaPersonal;
    this.delay(500).then((any) => {
      this.onToggleFab();
    });
  }

  //#region LISTA DE PERSONAL
  //#region Filtro
  private _crearFormFiltro() {
    this.formFiltro = this.fb.group({
      cuentaFiltro: this.tipoCuentaFiltro,
      ciudadFiltro: null,
      planillaFiltro: this.planillaFiltro,
      tipoDocumentoFiltro: "",
      nombresNumeroDocumentoFiltro: this.nombresNumeroDocFiltro,
    });

    this.formFiltro.valueChanges.subscribe((data) => {});
  }

  // Tipo de cuenta
  private async _cargarDataComboTipoCuenta(): Promise<void> {
    const param = [];
    param.push("0¡nDadTipEle!425");
    const sIdPais = JSON.parse(localStorage.getItem("Pais"));
    param.push("0¡nIdPais!" + sIdPais);
    param.push("0¡bEstado!1");

    await this.service
      ._loadSP(2, param, this.url)
      .then((value: TipoCuenta[]) => {
        this.dataComboTipoCuenta = value;

        //value
        //  .filter((element: any) => {
        //    return element.nParam === 1;
        //  })
        //  .forEach((element: any) => {
        //    this.formFiltro.controls["cuentaFiltro"].setValue(element.sDesc);
        //  });
      });
  }

  //Ciudad
  private async _cargarDataComboCiudad(): Promise<void> {
    const param = [];
    param.push("0¡nDadTipEle!694");
    const sIdPais = JSON.parse(localStorage.getItem("Pais"));
    param.push("0¡nIdPais!" + sIdPais);
    param.push("0¡bEstado!1");

    await this.service._loadSP(2, param, this.url).then((value: ICiudad[]) => {
      this.dataComboCiudad = value;
    });
  }

  //Planilla
  private async _cargarDataComboPlanilla(): Promise<void> {
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem("Empresa"));
    param.push("0¡nIdEmp!" + nIdEmp);
    param.push("0¡bEstado!1");

    await this.service
      ._loadSP(1, param, this.url)
      .then((value: IPlanilla[]) => {
        this.dataComboPlanilla = value;
      });
  }

  private async _cargarDataComboTipoDocumento(): Promise<void> {
    const param = [];
    param.push("0¡bEstado!1");

    await this.service
      ._loadSP(15, param, this.url)
      .then((value: ITipoDoc[]) => {
        this.dataComboTipoDocumento = value;
      });
  }
  //#endregion

  //#region Tabla
  private async _cargarDataListaPersonal(): Promise<void> {
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem("Empresa"));
    param.push("0¡A.nIdEmp!" + nIdEmp);

    await this.service._loadSP(3, param, this.url).then((value: IMain[]) => {
      this.dataSourceTablaPersonal = new MatTableDataSource(value);
      this.dataSourceTablaPersonal.paginator = this.pagListaPersonal;
      this.filtrarDataListaPersonal();
    });
  }

  public filtrarDataListaPersonal(): void {
    this.dataSourceTablaPersonal.filterPredicate = ((
      data: IMain,
      filter: any
    ) => {
      // tslint:disable-next-line: max-line-length
      // Filtrando por tipo de cuenta
      const a =
        !filter.cuentaFiltro ||
        data.sTipoCta.toLowerCase().includes(filter.cuentaFiltro.toLowerCase());

      // Filtrando por ciudad
      const b =
        !filter.ciudadFiltro ||
        !data.sCiudad ||
        data.sCiudad.toLowerCase().includes(filter.ciudadFiltro.toLowerCase());

      // Filtrando por planilla
      const c =
        !filter.planillaFiltro ||
        data.sCodPlla
          .toLowerCase()
          .includes(filter.planillaFiltro.toLowerCase());

      // Filtrando por nombre o numero de documento de identidad
      const d =
        !filter.nombresNumeroDocumentoFiltro ||
        data.sNombres
          .toLowerCase()
          .includes(filter.nombresNumeroDocumentoFiltro.toLowerCase());

      // Filtrando por tipo de documento
      const e =
        !filter.tipoDocumentoFiltro ||
        data.sTipo
          .toLowerCase()
          .includes(filter.tipoDocumentoFiltro.toLowerCase());
      return a && b && c && d && e;
    }) as (IMain, string) => boolean;

    this.dataSourceTablaPersonal.filter = this.formFiltro.value;

    if (this.dataSourceTablaPersonal.paginator) {
      this.dataSourceTablaPersonal.paginator.firstPage();
    }
  }

  isAllSelected() {
    const numSelected = this.selectionTablaPersonal.selected.length;
    const numRows = this.dataSourceTablaPersonal.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selectionTablaPersonal.clear()
      : this.dataSourceTablaPersonal.data.forEach((row) =>
          this.selectionTablaPersonal.select(row)
        );
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: IMain): string {
    if (!row) {
      return `${this.isAllSelected() ? "select" : "deselect"} all`;
    }
    return `${
      this.selectionTablaPersonal.isSelected(row) ? "deselect" : "select"
    } row ${row.nIdPerLab + 1}`;
  }

  public formatoFecha(fecha: string): string {
    return moment(fecha).format("MM/DD/YYYY");
  }
  //#endregion
  //#endregion

  //#region DATOS DE LA EMPRESA
  private _crearFormDataEmpresa(): void {
    this.formDatosEmpresa = this.fb.group({
      nRuc: [{ value: null, disabled: true }],
      sRazonSocial: [{ value: null, disabled: true }],
      sDireccion: [{ value: null, disabled: true }],
    });
  }

  private async _obtenerDataEmpresaPorBanco(): Promise<void> {
    this.formDatosEmpresa.reset();

    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem("Empresa"));
    param.push("0¡EMP.nIdBanco!" + this.selectedComboBanco);
    param.push("0¡EMP.nIdEmp!" + nIdEmp);

    await this.service._loadSP(12, param, this.url).then((value: any) => {
      if (value.nIdBanco !== 0) {
        // El banco tiene un formato
        this.formDatosEmpresa.patchValue({
          nRuc: value.sRuc,
          sRazonSocial: value.sRazonSocial,
          sDireccion: value.sDireccion,
        });
        this.deshabilitarPanels = false;
        this.bancoPoseeFormatoAlert = false;
      } else {
        // El banco no tiene un formato
        this.deshabilitarPanels = true;
        this.bancoPoseeFormatoAlert = true;
      }
    });
  }
  //#endregion

  //#region DATOS DEL CONTACTO
  private _crearFormDataContacto(): void {
    this.formDatosContacto = this.fb.group({
      nIdBC: [0, [Validators.required]],
      sNombres: [null, [Validators.required, Validators.minLength(2)]],
      sCorreo: [null, [Validators.required, Validators.email]],
      nCelular: [
        null,
        [Validators.required, Validators.min(0), Validators.minLength(5)],
      ],
    });
  }

  private async _envioDataContacto() {
    /**
     * Enviando la data del contacto para ser actualizada en caso de que
     * tenga modificacion o no exista
     */

    if (this.formDatosContacto.value.nIdBC === 0) {
      //Registra nuevo el contacto para el banco y se ingresa el id al form
      const data = this.formDatosContacto.value;
      const user = localStorage.getItem("currentUser");
      const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

      const paramNuevoContacto = [];
      paramNuevoContacto.push("T1¡nIdBanco!" + this.selectedComboBanco);
      paramNuevoContacto.push("T1¡sNombres!" + data.sNombres);
      paramNuevoContacto.push("T1¡sCorreo!" + data.sCorreo);
      paramNuevoContacto.push("T1¡nCelular!" + data.nCelular);
      paramNuevoContacto.push("T1¡nIdRegUser!" + uid);
      paramNuevoContacto.push("T1¡dtReg!GETDATE()");

      const result = await this.service._crudCB(
        5,
        paramNuevoContacto,
        this.url
      );

      Object.keys(result).forEach((valor) => {
        const res = result[valor].split("!")[1];
        this.formDatosContacto.controls["nIdBC"].setValue(+res);
      });
      this._snackBar.open("Se creó un nuevo contacto.", "Cerrar", {
        duration: 1000,
        horizontalPosition: "right",
        verticalPosition: "top",
      });
    } else {
      var sendData = this._construccionEnvioDatosContacto();

      if (sendData !== null) {
        // Envia al servicio para actuailizar la data
        await this.service._crudCB(6, sendData, this.url).then((value) => {
          this.formDatosContacto.markAsPristine();

          this._snackBar.open(
            "Informacion actualizada del contacto.",
            "Cerrar",
            {
              duration: 1000,
              horizontalPosition: "right",
              verticalPosition: "top",
            }
          );
        });
        //this.formDatosContacto.disable({ emitEvent: false });
      }
    }
  }

  private _construccionEnvioDatosContacto(): any[] {
    const sNombres = this.formDatosContacto.controls["sNombres"];
    const sCorreo = this.formDatosContacto.controls["sCorreo"];
    const nCelular = this.formDatosContacto.controls["nCelular"];
    const data = this.formDatosContacto.value;
    const params = [];

    if (sNombres.dirty) {
      params.push("T1¡sNombres!" + data.sNombres);
    }

    if (sCorreo.dirty) {
      params.push("T1¡sCorreo!" + data.sCorreo);
    }

    if (nCelular.dirty) {
      params.push("T1¡nCelular!" + data.nCelular);
    }

    if (params.length > 0) {
      params.push("T1¡nIdBC!" + data.nIdBC);
      return params;
    }

    return null;
    // envio 6
  }

  private async _obtenerDataContactoPorBanco(): Promise<void> {
    this.formDatosContacto.reset();

    // Si no tiene formato el banco
    if (this.deshabilitarPanels) {
      this.formDatosContacto.controls["sNombres"].disable();
      this.formDatosContacto.controls["sCorreo"].disable();
      this.formDatosContacto.controls["nCelular"].disable();
      return;
    } else {
      this.formDatosContacto.controls["sNombres"].enable();
      this.formDatosContacto.controls["sCorreo"].enable();
      this.formDatosContacto.controls["nCelular"].enable();
    }

    const param2 = [];
    param2.push("0¡nIdBanco!" + this.selectedComboBanco);
    await this.service
      ._loadSP(13, param2, this.url)
      .then(async (value: any) => {
        if (value.nIdBC === 0) {
          // Obtener la informacion del usuario logeado
          const user = localStorage.getItem("currentUser");
          const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

          const paramUser = [];
          paramUser.push("0¡nCodUser!" + uid);
          await this.service
            ._loadSP(14, paramUser, this.url)
            .then((value: any) => {
              this.formDatosContacto.patchValue({
                nIdBC: 0,
                sNombres: value.sNombres,
                sCorreo: value.sCorreo,
                nCelular: value.nCelular,
              });
            });
        } else {
          this.formDatosContacto.reset();
          this.formDatosContacto.patchValue({
            nIdBC: value.nIdBC,
            sNombres: value.sNombres,
            sCorreo: value.sCorreo,
            nCelular: value.nCelular,
          });
        }
      });
  }
  //#endregion

  //#region COMBO BANCOS
  private async _cargarDataComboBancos(): Promise<void> {
    const param = [];
    const sIdPais = JSON.parse(localStorage.getItem("Pais"));
    param.push("0¡sIdPais!" + sIdPais);

    await this.service._loadSP(6, param, this.url).then((value: IBanco[]) => {
      this.dataComboBancos = value;
    });
  }

  public async bancoSeleccionado(): Promise<void> {
    // Obtener la data de la empresa
    await this._obtenerDataEmpresaPorBanco();

    // Obtener la data del contacto
    await this._obtenerDataContactoPorBanco();
  }
  //#endregion

  //#region BOTON DE ACCIONES
  public onToggleFab(): void {
    if (this.estadoBotonFb) {
      this.tsExport = "inactive";
      this.abExport = [];
      this.estadoBotonFb = false;
    } else {
      this.tsExport = "active";
      this.abExport = this.fbExport;
      this.estadoBotonFb = true;
    }
  }

  public clickFab(opcion: number): void {
    switch (opcion) {
      case 0:
        this._exportarExcel();
        break;
      case 1:
        this._subirPlantilla();
        break;

      default:
        break;
    }
  }

  //#endregion

  //#region EXCEL

  private async _exportarExcel(): Promise<void> {
    const tieneFormatoH = new TieneFormatoHandler(this.deshabilitarPanels);
    const personalSeleccionadoH = new PersonalSeleccionadoHandler(
      this.selectionTablaPersonal.selected
    );
    const datosContactoH = new DatosContactoHandler(this.formDatosContacto);
    const bancoSeleccionadoH = new BancoSeleccionadoHandler(
      this.selectedComboBanco
    );

    tieneFormatoH
      .setNext(personalSeleccionadoH)
      .setNext(datosContactoH)
      .setNext(bancoSeleccionadoH);

    const resp = tieneFormatoH.handle();
    if (resp !== null) {
      Swal.fire("No se puede generar el excel", resp, "warning");
      return;
    }

    this.pbDetail = true;
    await this._envioDataContacto();
    await this._envioDataExcel();
    this.pbDetail = false;
  }

  private async _envioDataExcel() {
    /**
     * Enviando para generar excel
     */
    const nIdEmp = JSON.parse(localStorage.getItem("Empresa"));
    const data = {
      empresaId: nIdEmp,
      bancoId: this.selectedComboBanco,
      listaPersonal: this.selectionTablaPersonal.selected
        .map((item) => item.nIdPersonal)
        .join(),
    };

    await this.service._excel(1, data, this.url).then(async (data: any) => {
      fileSaver.saveAs(data.filename);

      this.delay(1000).then(async (any) => {
        this.eliminarExcel(data.filename);
      });
    });
  }

  public async eliminarExcel(urlDocumentoExcel: string) {
    const urlSplit = urlDocumentoExcel.split("/");
    const nombre = urlSplit[urlSplit.length - 1];
    await this.service
      ._eliminarExcel(nombre, "xlsm", this.url)
      .then((valor) => {});
  }

  // SUBIR PLANTILLLA
  private async _subirPlantilla() {
    var x = document.createElement("input");
    x.setAttribute("type", "file");
    x.accept = ".xlsm";
    x.click();

    x.addEventListener(
      "change",
      async () => {
        this.spi.show("spi_cuentasb_import");
        await this._enviarExcel(x.files[0]);
        this.spi.hide("spi_cuentasb_import");
      },
      false
    );
  }

  private async _enviarExcel(urlFile: File) {
    const sFile = await this.getStringFromFile(urlFile);
    const iFile = sFile.indexOf(",") + 1;
    const sFileSustento = sFile.substring(iFile, sFile.length);

    await this.service
      ._uploadFile(sFileSustento, 8, "BCP", "application/xlsm", this.url)
      .then((value: any) => {
        alert(value);
        console.log(value);
      });
  }

  async getStringFromFile(fSustento: File) {
    return new Promise<any>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(fSustento);
      reader.onload = () => {
        resolve(reader.result);
      };
    });
  }

  //#endregion

  //#region GENERALES
  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }
  //#endregion
}
