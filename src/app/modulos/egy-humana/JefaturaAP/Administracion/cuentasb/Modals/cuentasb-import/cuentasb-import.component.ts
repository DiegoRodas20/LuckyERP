import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import {
  NgbActiveModal,
  NgbModal,
  NgbModalOptions,
} from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from "moment";
import Swal from "sweetalert2";

import {
  IPersonalExcelImport,
  IPersonalImportReplace,
} from "../../../../Model/Icuentasb";
import { CuentasbService } from "../../../../Services/cuentasb.service";
import { adminpAnimations } from "../../../../Animations/adminp.animations";
import { CuentasbReplaceComponent } from "../cuentasb-replace/cuentasb-replace.component";
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";

interface IBanco {
  bDisBanco: boolean;
  nIdBanco_: number;
  nLongCta: number;
  sDesc: string;
}

interface IDevengue {
  nIdEmp: number;
  nIdDevengue: number;
  nEjercicio: number;
  nIdEstado: number;
  nMes: number;
}

interface ITipoCuenta {
  nParam: number;
  sDesc: string;
  nIdTipEle: number;
}

class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: "app-cuentasb-import",
  templateUrl: "./cuentasb-import.component.html",
  styleUrls: [
    "./cuentasb-import.component.css",
    "./cuentasb-import.component.scss",
  ],
  animations: [
    adminpAnimations,
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0" })),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      ),
    ]),
  ],
})
export class CuentasbImportComponent implements OnInit {
  //#region GENERALES
  url = "";
  ngbModalOptions: NgbModalOptions = {
    size: "xl",
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: "static",
    windowClass: "modal-holder",
  };

  matcher = new MyErrorStateMatcher();

  urlDocumentoExcelImportado = "";

  dFechaFinCuentasCerrar: Date;
  //#endregion

  //#region STEPPER
  firstStepperFormGroup: FormGroup;
  secondStepperFormGroup: FormGroup;
  isEditableStepper = false;
  //#endregion

  //#region COMBOS
  formCombos: FormGroup = this.fb.group({
    banco: ["", [Validators.required]],
    tipoCuenta: ["", [Validators.required]],
  });
  // Bancos
  dataComboBancos: IBanco[] = [];
  msgValidacionBanco = "Selecciona el banco y tipo de cuenta.";
  // Tipo de Cuenta
  dataComboTipoCuenta: ITipoCuenta[] = [];

  //#endregion

  //#region TABLA VISUALIZACION
  pbDetail = false;
  indexArrarTablaPersonalSeleccionada = 0;

  displayedColumnsTablaPersonal: string[] = [
    "action",
    "sNombres",
    "nIdPlla",
    "sAbrev",
    "sDocumento",
    "dFechaIniCuenta",
    "sNroCuenta",
    "nStatus",
    "more",
  ];
  expandedElement: IPersonalExcelImport | null;

  dataTablaPersonal: IPersonalExcelImport[] = [];
  dataSourceTablaPersonal = new MatTableDataSource<IPersonalExcelImport>(
    this.dataTablaPersonal
  );

  @ViewChild("pagListaPersonal", { static: true })
  pagListaPersonal: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  //#endregion

  //#region IMPORTACION DE EXCEL
  //#endregion

  //#region BOTON FB

  // Activo o inactivo
  estadoBotonFb = true;
  tsImport = "inactive";

  fbImport = [{ icon: "cloud_upload", tool: "Cargar excel" }];
  fbSaveOptions = [
    { icon: "save", tool: "Guardar" },
    { icon: "cleaning_services", tool: "Limpiar" },
  ];

  abImport = [];

  // Tipo de opciones: 0 = importar | 1 = guardar - limpiar
  estadoDelFBOpciones = 0;
  //#endregion

  constructor(
    public activeModal: NgbActiveModal,
    public service: CuentasbService,
    @Inject("BASE_URL") baseUrl: string,
    public fb: FormBuilder,
    private spi: NgxSpinnerService,
    private _snackBar: MatSnackBar,
    private modalService: NgbModal
  ) {
    this.url = baseUrl;
  }

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_cuentasb_import");
    await this._crearFormStepper();
    await this._initCombos();
    this.spi.hide("spi_cuentasb_import");
  }

  ngAfterViewInit() {
    this.dataSourceTablaPersonal.paginator = this.pagListaPersonal;
  }

  //#region GENERALES
  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }

  public cerrarModal() {
    const oReturn = new Object();
    oReturn["status"] = true;
    this.activeModal.close(oReturn);
  }
  //#endregion

  //#region STEPPER
  private _crearFormStepper() {
    this.firstStepperFormGroup = this.fb.group({
      banco: [null, [Validators.required]],
      cuenta: [null, [Validators.required]],
    });
    this.secondStepperFormGroup = this.fb.group({
      secondCtrl: ["", Validators.required],
    });

    this.firstStepperFormGroup.valueChanges.subscribe((value) => {
      if (this.firstStepperFormGroup.valid) {
        this._validarSiExistePlantilla();
      }
    });
  }

  private _activarFormularioStepper() {
    this.firstStepperFormGroup.controls["banco"].enable();
    this.firstStepperFormGroup.controls["cuenta"].enable();
  }

  private _desactivarFormularioStepper() {
    this.msgValidacionBanco = "";
    this.firstStepperFormGroup.controls["banco"].disable();
    this.firstStepperFormGroup.controls["cuenta"].disable();
  }
  //#endregion

  //#region COMBOS

  private async _initCombos() {
    await this._cargarDataComboBancos();
    await this._cargarDataComboTipoCuenta();
  }

  //#region Bancos
  private async _cargarDataComboBancos(): Promise<void> {
    const param = [];
    const sIdPais = JSON.parse(localStorage.getItem("Pais"));
    param.push("0¡sIdPais!" + sIdPais);

    await this.service._loadSP(6, param, this.url).then((value: IBanco[]) => {
      this.dataComboBancos = value;
    });
  }

  private async _validarSiExistePlantilla() {
    const params = [];
    const bancoId = this.firstStepperFormGroup.value.banco;
    params.push("0¡nIdBanco!" + bancoId);
    params.push("0¡bModo!1");
    this.service._loadSP(9, params, this.url).then((value: any) => {
      if (value.nIdBE === 0) {
        this.msgValidacionBanco =
          "El banco y tipo de cuenta no tiene formato de importacion.";
        this.estadoBotonFb = true;
        this.tsImport = "inactive";
        this.abImport = [];
      } else {
        this.msgValidacionBanco = "";
        this.estadoBotonFb = false;
        this.onToggleFab();
      }
    });
  }
  //#endregion

  //#region Tipo de Cuenta
  private async _cargarDataComboTipoCuenta(): Promise<void> {
    const param = [];
    param.push("0¡nDadTipEle!425");
    const sIdPais = JSON.parse(localStorage.getItem("Pais"));
    param.push("0¡nIdPais!" + sIdPais);
    param.push("0¡bEstado!1");

    await this.service
      ._loadSP(2, param, this.url)
      .then((value: ITipoCuenta[]) => {
        this.dataComboTipoCuenta = value;
      });
  }

  //#endregion
  //#endregion

  //#region TABLA VISUALIZACION
  private async _cargarDataPersonal(): Promise<void> {
    const nIdEmp = JSON.parse(localStorage.getItem("Empresa"));
    const nIdTipoCuenta = this.firstStepperFormGroup.value.cuenta;
    const nIdBanco = this.firstStepperFormGroup.value.banco;

    await this.service
      ._importExcel(
        this.urlDocumentoExcelImportado,
        this.url,
        nIdBanco,
        nIdTipoCuenta,
        nIdEmp
      )
      .then((value: IPersonalExcelImport[]) => {
        this.dataSourceTablaPersonal = new MatTableDataSource(value);
        this.dataSourceTablaPersonal.paginator = this.pagListaPersonal;
      });
  }

  public abrirModalEditar(personal: IPersonalExcelImport): void {
    const modalRefReplace = this.modalService.open(
      CuentasbReplaceComponent,
      this.ngbModalOptions
    );

    // Al cerrar el modal se verifica si modifico la data
    modalRefReplace.result.then(
      async (result) => {
        if (result.status) {
          var personalReplace: IPersonalImportReplace = result.data;
          personal.sNombres = personalReplace.sNombres;
          personal.nIdPersonal = personalReplace.nIdPersonal;
          personal.sAbrev = personalReplace.sAbrev;
          personal.nIdPlla = personalReplace.nIdPlla;
          personal.nIdPerLab = personalReplace.nIdPerLab;
          personal.nIdTipoDoc = personalReplace.nIdTipoDoc;
          personal.sDocumento = personalReplace.sDocumento;

          if (personalReplace.sNroCuenta === personal.sNroCuenta) {
            personal.sObservacion =
              "El numero de cuenta extraido del excel '" +
              personal.sNroCuenta +
              "' ya se encuentra registrada en el sistema.";
            personal.nStatus = 0;
          } else {
            // No tiene cuenta
            if (
              personalReplace.sNroCuenta === null ||
              personalReplace.sNroCuenta == ""
            ) {
              personal.dFechaIniCuenta = personalReplace.dFechIni;
              personal.sObservacion =
                "Esta persona no tiene ninguna cuenta registrada";
              personal.nStatus = 1;
            } else {
              // Tiene cuenta
              const nIdEmp = JSON.parse(localStorage.getItem("Empresa"));
              const params = [];
              params.push("0¡nIdEmp!" + nIdEmp);
              await this.service
                ._loadSP(8, params, this.url)
                .then((value: IDevengue) => {
                  var fechIniCuenta = moment(
                    new Date(value.nEjercicio, value.nMes - 1, 1)
                  )
                    .endOf("month")
                    .add(1, "d")
                    .toDate();

                  var fechFinCuenta = moment(
                    new Date(value.nEjercicio, value.nMes - 1, 1)
                  )
                    .endOf("month")
                    .toDate();

                  // Si ya tiene una cuenta registrada en espera
                  if (
                    new Date(personalReplace.dFechIniCuenta) > fechFinCuenta
                  ) {
                    personal.sObservacion =
                      "El personal posee una cuenta en espera, de modo que no puedes registrar una nueva y deberas editar la anterior.";
                    personal.nStatus = 0;
                  }
                  // Si tiene una cuenta que no esta en espera
                  if (
                    new Date(personalReplace.dFechIniCuenta) <= fechFinCuenta
                  ) {
                    personal.dFechaIniCuenta = fechIniCuenta;
                    personal.sObservacion =
                      "Entra en vigencia apartir de la fecha : " +
                      moment(fechIniCuenta).format("DD/MM/YYYY");
                    personal.nStatus = 2;
                    personal.dFechaFinCuenta = fechFinCuenta;
                  }
                });
            }
          }
        }
      },
      (reason) => {}
    );

    modalRefReplace.componentInstance.data = personal;
    modalRefReplace.componentInstance.cuentaId =
      this.firstStepperFormGroup.value.cuenta;
  }

  public formatoFecha(fecha: string): string {
    return fecha === null ? "" : moment(fecha).format("DD/MM/YYYY");
  }

  clickExpanded(row: IPersonalExcelImport) {
    if (this.expandedElement === row) {
      this.expandedElement = null;
    } else {
      this.expandedElement = row;
    }
  }
  //#endregion

  //#region BOTON FB
  public onToggleFab(): void {
    if (this.estadoDelFBOpciones === 0) {
      if (this.estadoBotonFb) {
        this.tsImport = "inactive";
        this.abImport = [];
      } else {
        this.tsImport = "active";
        this.abImport = this.fbImport;
      }
    }

    if (this.estadoDelFBOpciones === 1) {
      if (this.estadoBotonFb) {
        this.tsImport = "inactive";
        this.abImport = [];
      } else {
        this.tsImport = "active";
        this.abImport = this.fbSaveOptions;
      }
    }

    if (this.estadoDelFBOpciones === 0 && this.msgValidacionBanco === "") {
      this.estadoBotonFb = !this.estadoBotonFb;
    }
    if (this.estadoDelFBOpciones === 1) {
      this.estadoBotonFb = !this.estadoBotonFb;
    }
  }

  public async clickFab(opcion: number): Promise<void> {
    // Cuando aun no se importa el excel
    if (this.estadoDelFBOpciones == 0) {
      switch (opcion) {
        case 0:
          //this._ImportarExcel();
          this._inputFileCargarExcel();
          break;

        default:
          break;
      }
    }

    // Cuando se tiene importado el excel y mostrando la data
    if (this.estadoDelFBOpciones == 1) {
      switch (opcion) {
        case 0:
          const hayItemsParaGuardar = this.dataSourceTablaPersonal.data.find(
            (x) => x.nStatus === 1 || x.nStatus === 2
          );
          if (hayItemsParaGuardar === undefined) {
            Swal.fire({
              title: "Atencion!",
              text: "No tiene ninguna cuenta por guardar.",
              icon: "info",
            });

            return;
          }

          Swal.fire({
            title: "¿ Estas seguro de guardar las cuentas. ?",
            text: "Se guardaran todas las cuentas con estado válido ( Se omitiran errores en lista ).",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#ff4081",
            confirmButtonText: "Confirmar !",
            allowOutsideClick: false,
          }).then(async (result) => {
            if (result.isConfirmed) {
              this.spi.show("spi_cuentasb_import");
              await this._guardarInformacionDelExcel();
              this.spi.hide("spi_cuentasb_import");
            }
          });

          break;
        case 1:
          this._limpiandoTodaLaInformacion();
          break;

        default:
          break;
      }
    }
  }

  private _mostrarOpcionesDespuesDeImportar(): void {
    this.abImport = [];
    this.delay(250).then((any) => {
      this.abImport = this.fbSaveOptions;
    });
  }

  private _mostrarOpcionesAntesDeImportar(): void {
    this.abImport = [];
    this.delay(250).then((any) => {
      this.abImport = this.fbImport;
    });
  }

  private _limpiandoTodaLaInformacion(): void {
    this.estadoDelFBOpciones = 0;
    this.tsImport = "inactive";
    this.abImport = [];
    this.estadoBotonFb = true;
    this.msgValidacionBanco = "Selecciona el banco y tipo de cuenta.";

    this.firstStepperFormGroup.reset();
    var x = document.getElementById("stepperResetId");
    x.click();
  }
  //#endregion

  //#region IMPORTACION

  private _inputFileCargarExcel() {
    var x = document.createElement("input");
    x.setAttribute("type", "file");
    x.accept = ".xlsx";
    x.click();

    x.addEventListener(
      "change",
      async () => {
        this.spi.show("spi_cuentasb_import");
        await this._enviarExcel(x.files[0]);
        await this._cargarDataPersonal();
        await this.eliminarExcel();
        this.spi.hide("spi_cuentasb_import");

        this._mostrarOpcionesDespuesDeImportar();
        this.estadoDelFBOpciones = 1;

        // Siguiente stepper
        var btnStepperNext = document.getElementById("btn_siguiente_stepper");
        btnStepperNext.click();
        this.isEditableStepper = false;
      },
      false
    );
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

  private async _enviarExcel(urlFile: File) {
    const sFile = await this.getStringFromFile(urlFile);
    const iFile = sFile.indexOf(",") + 1;
    const sFileSustento = sFile.substring(iFile, sFile.length);

    await this.service
      ._uploadFile(sFileSustento, 8, "BCP", "application/xlsx", this.url)
      .then((value: any) => {
        this.urlDocumentoExcelImportado = value.fileUrl;
      });
  }

  public async eliminarExcel() {
    const urlSplit = this.urlDocumentoExcelImportado.split("/");
    const nombre = urlSplit[urlSplit.length - 1];
    await this.service
      ._eliminarExcel(nombre, "xlsx", this.url)
      .then((valor) => {});
  }
  //#endregion

  //#region GUARDAR DATA
  private async _guardarInformacionDelExcel() {
    const data = this.dataSourceTablaPersonal.data;

    this.pbDetail = true;
    var cantidad = 0;
    await Promise.all(
      data.map(async (personal: IPersonalExcelImport) => {
        // Si no tiene cuenta entonces guardar la nueva cuenta
        if (personal.nStatus == 1) {
          await this._guardarCuenta(personal);
          cantidad++;
        }

        // Si tiene una cuenta entonces cerrar la anterior anterior y agregar la nueva cuenta
        if (personal.nStatus == 2) {
          await this._guardarYCerrarCuenta(personal);
          cantidad++;
        }
      })
    );
    this.pbDetail = false;
    Swal.fire(
      "Guardado",
      "Se guardaron en total  " + cantidad + " cuentas.",
      "success"
    );

    this._limpiandoTodaLaInformacion();
  }

  private async _guardarCuenta(personal: IPersonalExcelImport) {
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;
    const tipoCuentaId = this.firstStepperFormGroup.value.cuenta;
    const bancoId = this.firstStepperFormGroup.value.banco;
    const params = [];

    params.push("T1¡nIdTipoCta!" + tipoCuentaId);
    params.push("T1¡nIdBanco!" + bancoId);
    params.push("T1¡sNroCuenta!" + personal.sNroCuenta);
    params.push("T1¡nIdMoneda!443");
    params.push("T1¡nIdTipoDoc!" + personal.nIdTipoDoc);
    params.push("T1¡sDocumento!" + personal.sDocumento);
    params.push("T1¡sRegUser!" + uid);
    params.push("T1¡dtReg!GETDATE()");
    params.push("T1¡nIdPerLab!" + personal.nIdPerLab);
    params.push(
      "T1¡dFechIni!" + moment(personal.dFechaIniCuenta).format("MM/DD/YYYY")
    );

    await this.service._crudCB(1, params, this.url).then((value) => {
      personal.sObservacion = "Numero de cuenta registrada";
      personal.nStatus = 0;
    });
  }

  private async _guardarYCerrarCuenta(personal: IPersonalExcelImport) {
    // Obtener la ultima cuenta del personal

    const tipoCuentaId = this.firstStepperFormGroup.value.cuenta;
    const bancoId = this.firstStepperFormGroup.value.banco;

    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

    const paramsPerLab = [];
    paramsPerLab.push("0¡PERLAB.nIdPersonal!" + personal.nIdPersonal);
    paramsPerLab.push("0¡DPLB.nIdTipoCta!" + tipoCuentaId);
    this.service
      ._loadSP(19, paramsPerLab, this.url)
      .then(async (value: any) => {
        const params = [];

        params.push("T1¡nIdTipoCta!" + tipoCuentaId);
        params.push("T1¡nIdBanco!" + bancoId);
        params.push("T1¡sNroCuenta!" + personal.sNroCuenta);
        params.push("T1¡nIdMoneda!443");
        params.push("T1¡nIdTipoDoc!" + personal.nIdTipoDoc);
        params.push("T1¡sDocumento!" + personal.sDocumento);
        params.push("T1¡sRegUser!" + uid);
        params.push("T1¡dtReg!GETDATE()");
        params.push("T1¡nIdPerLab!" + personal.nIdPerLab);
        params.push(
          "T1¡dFechIni!" + moment(personal.dFechaIniCuenta).format("MM/DD/YYYY")
        );

        params.push("W1¡nIdDPLB!" + value.nIdDPLB);
        params.push(
          "S1¡dFechFin!" + moment(personal.dFechaFinCuenta).format("MM/DD/YYYY")
        );

        await this.service._crudCB(4, params, this.url).then((value) => {
          personal.sObservacion = "Numero de cuenta registrada";
          personal.nStatus = 0;
        });
      });

    // Obneter ultima cuenta
  }
  //#endregion
}
