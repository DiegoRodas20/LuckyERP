import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  DateAdapter,
  ErrorStateMatcher,
  MAT_DATE_FORMATS,
} from "@angular/material/core";
import {
  AppDateAdapter,
  APP_DATE_FORMATS,
} from "../../../../../shared/services/AppDateAdapter";
import { adminpAnimations } from "../..//Animations/adminp.animations";
import { CuentasbService } from "../../Services/cuentasb.service";
import { NgxSpinnerService } from "ngx-spinner";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ValidadoresService } from "../../Validators/validadores.service";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { IDetail, IMain } from "../../Model/Icuentasb";
import { MatAccordion } from "@angular/material/expansion";
import Swal from "sweetalert2";
import * as moment from "moment";
import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CuentasbSearchComponent } from "./Modals/cuentasb-search/cuentasb-search.component";
import { CuentasbDetailComponent } from "./Modals/cuentasb-detail/cuentasb-detail.component";
import { CuentasbExportComponent } from "./Modals/cuentasb-export/cuentasb-export.component";
import { CuentasbImportComponent } from "./Modals/cuentasb-import/cuentasb-import.component";

// Utilizar javascript [1]
declare var jQuery: any;

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: "app-cuentasb",
  templateUrl: "./cuentasb.component.html",
  styleUrls: ["./cuentasb.component.css", "./cuentasb.component.scss"],
  providers: [
    CuentasbService,
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ],
  animations: [adminpAnimations],
})
export class CuentasbComponent implements OnInit {
  //#region GENERALES
  matcher = new MyErrorStateMatcher();
  hTipoCta = "";

  // Service GET && POST
  url: string;
  aParam = [];
  //#endregion

  //#region MAIN
  //#region  Combobox (Filtro de personal)
  cboPlanilla: any;
  cboCiudad: any;
  cboTipoCta: any;
  cboMoneda: any;
  cboTipoDoc: any;
  cboBanco: any;
  //#endregion

  //#region Mat Table (Lista de personal)
  MainDC: string[] = [
    "action",
    "sNombres",
    "sCodPlla",
    "sDscTipo",
    "sDocumento",
    "sTipoCta",
  ];
  fgMain: FormGroup;
  pbMain: boolean;

  MainDS: MatTableDataSource<IMain>;
  @ViewChild("pagMain", { static: true }) pagMain: MatPaginator;
  //#endregion

  //#region Fab Boton desplegable de opciones
  fbMain = [
    {
      icon: "person_search",
      tool: "Buscar personal",
      badge: 0,
      disabled: false,
    },
    {
      icon: "cloud_download",
      tool: "Generar excel",
      badge: 0,
      disabled: false,
    },
    { icon: "cloud_upload", tool: "Cargar excel", badge: 0, disabled: false },
    {
      icon: "person_remove",
      tool: "Personal excluido",
      badge: 3,
      disabled: true,
    },
  ];
  abMain = [];
  tsMain = "inactive";

  //#endregion
  //#endregion

  //#region MODALES
  ngbModalOptions: NgbModalOptions = {
    size: "xl",
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: "static",
    windowClass: "modal-holder",
  };

  //#region MODAL BUSCAR PERSONAL
  pbSearch: boolean;
  SearchDC: string[] = [
    "action",
    "sNombres",
    "sCodPlla",
    "sTipo",
    "sDocumento",
  ];
  SearchDS: MatTableDataSource<IMain>;
  @ViewChild("pagSearch", { static: true }) pagSearch: MatPaginator;
  fgSearch: FormGroup;
  //#endregion

  //#region MODAL DETALLE
  fbDetail = [{ icon: "add", tool: "Nueva cuenta" }];
  abDetail = [];
  tsDetail = "inactive";

  pbDetail: boolean;

  DetailDC: string[] = [
    "action",
    "sBanco",
    "sNroCuenta",
    "dFechIni",
    "sTipoCta",
  ];
  DetailDS: MatTableDataSource<IDetail>;
  @ViewChild("pagDetail", { static: true }) pagDetail: MatPaginator;
  @ViewChild("maDetail") maDetail: MatAccordion;
  fgDetail: FormGroup;
  fgFilter: FormGroup;

  //#endregion

  //#region MODAL CUENTA
  fbCuenta = [
    { icon: "save", tool: "Guardar" },
    { icon: "cancel", tool: "Cancelar" },
  ];
  fbCuenta2 = [
    { icon: "edit", tool: "Editar" },
    { icon: "delete", tool: "Eliminar" },
  ];
  abCuenta = [];
  tsCuenta = "inactive";
  pbCuenta: boolean;

  hCuenta: string;
  mCuenta: number;
  countCuenta: number;
  bkCuenta: any;
  fgCuenta: FormGroup;
  //#endregion
  //#endregion

  constructor(
    public service: CuentasbService,
    @Inject("BASE_URL") baseUrl: string,
    private fb: FormBuilder,
    private spi: NgxSpinnerService,
    private _snackBar: MatSnackBar,
    private valid: ValidadoresService,
    private modalService: NgbModal
  ) {
    // SERVICE GET && POST
    this.url = baseUrl;
    this.countCuenta = 0;

    this.new_fgMain();
    this.new_fgSearch();
    this.new_fgDetail();
    this.new_fgFilter();
    this.new_fgCuenta();
  }

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_main");

    await this.fnGetPlanilla();
    await this.fnGetCiudad();
    await this.fnGetTipoCta();
    await this.fnGetBanco();
    await this.fnGetTipoDoc();
    await this.fnGetMoneda();

    await this.loadMain();

    this.spi.hide("spi_main");
  }

  //#region GENERAL
  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = stat === -1 ? (this.abMain.length > 0 ? 0 : 1) : stat;
        this.tsMain = stat === 0 ? "inactive" : "active";
        this.abMain = stat === 0 ? [] : this.fbMain;
        break;

      case 3:
        stat = stat === -1 ? (this.abDetail.length > 0 ? 0 : 1) : stat;
        this.tsDetail = stat === 0 ? "inactive" : "active";
        this.abDetail = stat === 0 ? [] : this.fbDetail;
        break;

      case 4:
        if (stat === -1) {
          if (this.abCuenta.length > 0) {
            stat = 0;
          } else {
            stat = this.mCuenta === 1 ? 1 : 2;
          }
        }

        this.tsCuenta = stat === 0 ? "inactive" : "active2";

        switch (stat) {
          case 0:
            this.abCuenta = [];
            break;
          case 1:
            this.abCuenta = this.fbCuenta;
            break;
          case 2:
            this.abCuenta = this.fbCuenta2;
            break;
        }
        break;

      default:
        break;
    }
  }

  clickFab(opc: number, index: number) {
    switch (opc) {
      case 1:
        switch (index) {
          case 0:
            this.showModal(1);
            break;
          case 1:
            const modalRefExport = this.modalService.open(
              CuentasbExportComponent,
              this.ngbModalOptions
            );

            modalRefExport.componentInstance.nombresNumeroDocFiltro =
              this.fgMain.controls["sNombres"].value;
            modalRefExport.componentInstance.planillaFiltro =
              this.fgMain.controls["sCodPlla"].value;
            modalRefExport.componentInstance.ciudadFiltro =
              this.fgMain.controls["sCiudad"].value;
            modalRefExport.componentInstance.tipoCuentaFiltro =
              this.fgMain.controls["sTipoCta"].value;
            break;
          case 2:
            const modalRefImport = this.modalService.open(
              CuentasbImportComponent,
              this.ngbModalOptions
            );
            modalRefImport.result.then(
              async (result) => {
                if (result.status) {
                  this.spi.show("spi_main");
                  await this.loadMain();
                  this.spi.hide("spi_main");
                }
              },
              (reason) => {}
            );
            break;
          default:
            break;
        }
        break;

      case 2:
        //this.cleanModal(1);
        break;

      case 3:
        switch (index) {
          case -1:
            this.cleanModal(2);
            break;

          case 0:
            this.showModal(3, undefined, 1);
            break;

          default:
            break;
        }
        break;

      case 4:
        switch (index) {
          case -1:
            this.cleanModal(3);
            break;

          case 0:
            if (this.mCuenta === 1) {
              this.saveCuenta(this.hCuenta === "Nuevo" ? 1 : 2);
            } else {
              const sNombres = this.fgDetail.controls["sNombres"].value;

              Swal.fire({
                title: "¿ Estas seguro de modificar el registro?",
                text: "La cuenta le pertenece a " + sNombres,
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#ff4081",
                confirmButtonText: "Confirmar !",
                allowOutsideClick: false,
              }).then((result) => {
                if (result.isConfirmed) {
                  this.fgCuenta.controls["T1_nIdTipoCta"].enable();
                  this.fgCuenta.controls["A1_nIdBanco"].enable();

                  const nIdBanco = this.fgCuenta.controls[
                    "A1_nIdBanco"
                  ] as FormControl;
                  if (nIdBanco.value.bDisBanco === false) {
                    this.fgCuenta.controls["T1_sNroCuenta"].enable();
                    this.fgCuenta.controls["T1_nIdMoneda"].enable();
                    this.fgCuenta.controls["A1_nIdTipoDoc"].enable();
                    this.fgCuenta.controls["T1_sDocumento"].enable();
                  }

                  this.abCuenta = [];
                  this.delay(250).then((any) => {
                    this.abCuenta = this.fbCuenta;
                    this.tsCuenta = "active2";
                  });

                  this.mCuenta = 1;

                  return;
                }
              });
            }
            break;

          case 1:
            if (this.hCuenta === "Nuevo") {
              this.cleanModal(3);
            } else {
              if (this.mCuenta === 1) {
                this.mCuenta = 2;
                this.loadCuenta(this.bkCuenta);

                this.abCuenta = [];
                this.delay(250).then((any) => {
                  this.abCuenta = this.fbCuenta2;
                  this.tsCuenta = "inactive";
                });
              } else {
                const sNombres = this.fgDetail.controls["sNombres"].value;
                Swal.fire({
                  title: "¿ Estas seguro de eliminar el registro?",
                  text: "La cuenta le pertenece a " + sNombres,
                  icon: "question",
                  showCancelButton: true,
                  confirmButtonColor: "#ff4081",
                  confirmButtonText: "Confirmar !",
                  allowOutsideClick: false,
                }).then(async (result) => {
                  if (result.isConfirmed) {
                    this.pbCuenta = true;

                    const nIdDPLB = this.fgCuenta.controls["T1_nIdDPLB"].value;
                    await this.deleteCuenta(nIdDPLB);

                    this.pbCuenta = false;
                  }
                });
              }
            }
            break;
        }
        break;
    }
  }

  /**
   * Parametros para el envio de data
   */
  fnGetParam(kControls: { [key: string]: AbstractControl }, bDirty?: boolean) {
    Object.keys(kControls).forEach((control) => {
      const index = control.indexOf("_");
      let cTable = "",
        cColum = "",
        cValue = "",
        cDirty: boolean;
      if (index > 0) {
        switch (control.substring(0, 1)) {
          case "A":
            const aControl = kControls[control].value;
            cTable = "T" + control.substring(1, index);
            cDirty = kControls[control].dirty;

            if (aControl !== undefined) {
              Object.keys(aControl).forEach((eSub) => {
                const iSub = eSub.indexOf("_");
                if (iSub > 0) {
                  cColum = eSub.substring(0, iSub);
                  cValue = aControl[eSub];

                  if (bDirty === undefined) {
                    this.aParam.push(cTable + "¡" + cColum + "!" + cValue);
                  } else {
                    if (cDirty === true) {
                      this.aParam.push(cTable + "¡" + cColum + "!" + cValue);
                    }
                  }
                }
              });
            }
            break;

          default:
            cTable = control.substring(0, index);
            cColum = control.substring(index + 1, control.length);
            cDirty = kControls[control].dirty;

            if (
              kControls[control].value !== null &&
              kControls[control].value !== undefined
            ) {
              // tslint:disable-next-line: max-line-length
              cValue =
                cColum.substring(0, 1) === "d"
                  ? moment(new Date(kControls[control].value)).format(
                      "MM/DD/YYYY"
                    )
                  : kControls[control].value;

              if (bDirty === undefined) {
                this.aParam.push(cTable + "¡" + cColum + "!" + cValue);
              } else {
                if (cDirty === true) {
                  this.aParam.push(cTable + "¡" + cColum + "!" + cValue);
                }
              }
            }
            break;
        }
      }
    });
  }

  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }

  //#endregion

  //#region Combobox

  async fnGetPlanilla() {
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem("Empresa"));

    param.push("0¡nIdEmp!" + nIdEmp);
    param.push("0¡bEstado!1");

    await this.service._loadSP(1, param, this.url).then((value: any[]) => {
      this.cboPlanilla = value;
    });
  }

  async fnGetCiudad() {
    const param = [];
    param.push("0¡nDadTipEle!694");
    const sIdPais = JSON.parse(localStorage.getItem("Pais"));
    param.push("0¡nIdPais!" + sIdPais);
    param.push("0¡bEstado!1");

    await this.service._loadSP(2, param, this.url).then((value: any[]) => {
      this.cboCiudad = value;
    });
  }

  async fnGetTipoCta() {
    const param = [];
    param.push("0¡nDadTipEle!425");
    const sIdPais = JSON.parse(localStorage.getItem("Pais"));
    param.push("0¡nIdPais!" + sIdPais);
    param.push("0¡bEstado!1");

    await this.service._loadSP(2, param, this.url).then((value: any[]) => {
      this.cboTipoCta = value;

      value
        .filter((element: any) => {
          return element.nParam === 1;
        })
        .forEach((element: any) => {
          this.hTipoCta = element.sDesc;
        });
    });
  }

  async fnGetMoneda() {
    const param = [];
    param.push("0¡nDadTipEle!442");
    const sIdPais = JSON.parse(localStorage.getItem("Pais"));
    param.push("0¡nIdPais!" + sIdPais);

    await this.service._loadSP(2, param, this.url).then((value: any[]) => {
      this.cboMoneda = value;
    });
  }

  async fnGetBanco() {
    const param = [];
    const sIdPais = JSON.parse(localStorage.getItem("Pais"));
    param.push("0¡sIdPais!" + sIdPais);

    await this.service._loadSP(6, param, this.url).then((value: any[]) => {
      this.cboBanco = value;
    });
  }

  fnEnabledBanco(pushParam: any) {
    this.fgCuenta.controls["T1_sNroCuenta"].setValue("");
    if (pushParam !== undefined) {
      if (pushParam.bDisBanco === false) {
        this.fgCuenta.controls["T1_sNroCuenta"].enable();

        const nLongDoc = pushParam.nLongCta as number;
        this.fgCuenta.controls["T1_sNroCuenta"].setValidators([
          Validators.minLength(nLongDoc),
          Validators.required,
          this.valid.vString,
        ]);

        this.fgCuenta.updateValueAndValidity();

        this.fgCuenta.controls["T1_nIdMoneda"].enable();
        this.fgCuenta.controls["A1_nIdTipoDoc"].enable();
        return;
      }
    }

    // Nro Cuenta
    this.fgCuenta.controls["T1_sNroCuenta"].disable();

    // Moneda
    this.fgCuenta.controls["T1_nIdMoneda"].disable();
    this.fgCuenta.controls["T1_nIdMoneda"].setValue(0);

    // Tipo documento
    this.fgCuenta.controls["A1_nIdTipoDoc"].disable();
    this.fgCuenta.controls["A1_nIdTipoDoc"].setValue(undefined);

    // Documento
    this.fgCuenta.controls["T1_sDocumento"].disable();
    this.fgCuenta.controls["T1_sDocumento"].setValue("");
  }

  async fnGetTipoDoc() {
    const param = [];
    param.push("0¡bEstado!1");
    const sIdPais = JSON.parse(localStorage.getItem("Pais"));
    param.push("0¡sIdPais!" + sIdPais);

    await this.service._loadSP(7, param, this.url).then((value: any[]) => {
      this.cboTipoDoc = value;
    });
  }

  fnEnabledDoc(pushParam: any) {
    const fGroup = this.fgCuenta;
    const fcDocumento = this.fgCuenta.controls["T1_sDocumento"] as FormControl;

    fcDocumento.setValue("");

    if (pushParam !== undefined) {
      fcDocumento.enable();

      const nIdTipoDoc = this.fgDetail.controls["nIdTipoDoc"].value;
      const sDocumento = this.fgDetail.controls["sDocumento"].value;

      if (pushParam.nIdTipoDoc_ === nIdTipoDoc) {
        Swal.fire({
          title:
            "¿ Desea utilizar el mismo número del documento de identidad ?",
          text: "N° documento de identidad : " + sDocumento,
          icon: "question",
          showCancelButton: true,
          cancelButtonText: "No, gracias!",
          confirmButtonColor: "#ff4081",
          confirmButtonText: "Si, utilizar!",
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isConfirmed) {
            fcDocumento.setValue(sDocumento);
            fcDocumento.markAsDirty();
          }
        });
      }

      const nLongDoc = pushParam.nLongDoc as number;

      if (nLongDoc > 0) {
        // tslint:disable-next-line: max-line-length
        fcDocumento.setValidators([
          Validators.minLength(nLongDoc),
          Validators.required,
          Validators.pattern("[0-9]*"),
          this.valid.vString,
        ]);
      }
      fGroup.updateValueAndValidity();
      return;
    }
    fcDocumento.disable();
  }

  //#endregion

  //#region Lista de Personal
  new_fgMain() {
    this.fgMain = this.fb.group({
      sNombres: "",
      sCodPlla: "",
      sCiudad: "",
      sTipoCta: "",
    });

    this.fgMain.valueChanges.subscribe((value) => {});
  }

  get getMain() {
    return this.fgMain.controls;
  }

  async loadMain() {
    const param = [];

    const nIdEmp = JSON.parse(localStorage.getItem("Empresa"));
    param.push("0¡A.nIdEmp!" + nIdEmp);

    await this.service._loadSP(3, param, this.url).then((value: IMain[]) => {
      this.MainDS = new MatTableDataSource(value);
      this.MainDS.paginator = this.pagMain;
      this.fgMain.controls["sTipoCta"].setValue(this.hTipoCta);
      this.filtrar();
    });
  }

  filtrar() {
    this.MainDS.filterPredicate = ((data: IMain, filter: any) => {
      // tslint:disable-next-line: max-line-length
      const a =
        !filter.sNombres ||
        data.sNombres.toLowerCase().includes(filter.sNombres.toLowerCase()) ||
        data.sDocumento.toLowerCase().includes(filter.sNombres.toLowerCase());
      const b =
        !filter.sCodPlla ||
        data.sCodPlla.toLowerCase().includes(filter.sCodPlla);
      const c =
        !filter.sCiudad ||
        !data.sCiudad ||
        data.sCiudad.toLowerCase().includes(filter.sCiudad.toLowerCase());
      const d =
        !filter.sTipoCta ||
        data.sTipoCta.toLowerCase().includes(filter.sTipoCta.toLowerCase());
      return a && b && c && d;
    }) as (IMain, string) => boolean;

    this.MainDS.filter = this.fgMain.value;

    if (this.MainDS.paginator) {
      this.MainDS.paginator.firstPage();
    }
  }

  //#endregion

  //#region ACCIONES PARA LOS MODALES
  async showModal(opc: number, pushParam?: any, index?: number) {
    const self = this;

    switch (opc) {
      case 1:
        /*
        this.pbMain = true;
        await this.loadSearch();
        (function ($) {
          $("#ModalSearch").modal("show");
          $("#ModalSearch").on("shown.bs.modal", function () {
            self.onToggleFab(1, 0);
          });
        })(jQuery);
        this.pbMain = false;
*/

        const modalRef = this.modalService.open(
          CuentasbSearchComponent,
          this.ngbModalOptions
        );

        modalRef.result.then(
          (result) => {
            switch (result.modal) {
              case "search":
                if (result.value === "select") {
                  //this.selectPerson(result.item);
                }
                break;
            }
          },
          (reason) => {}
        );

        break;

      case 2:
        /*
        if (index === 1) {
          this.pbMain = true;
        } else {
          this.pbSearch = true;
        }

        await this.loadDetail(pushParam);

        this.fgFilter.controls["sTipoCta"].setValue(this.hTipoCta);

        if (index !== 1) {
          this.cleanModal(1);
        }

        (function ($) {
          $("#ModalDetail").modal("show");
          $("#ModalDetail").on("shown.bs.modal", function () {
            self.onToggleFab(3, 1);
          });
        })(jQuery);

        if (index === 1) {
          this.pbMain = false;
        } else {
          this.pbSearch = false;
        }
        */

        const modalRefDetail = this.modalService.open(
          CuentasbDetailComponent,
          this.ngbModalOptions
        );
        modalRefDetail.componentInstance.data = pushParam;

        modalRefDetail.result.then(async (result) => {
          if (result.recargar) {
            this.spi.show("spi_main");
            await this.loadMain();
            this.spi.hide("spi_main");
          }
        });

        break;

      case 3:
        this.mCuenta = index;
        if (index === 1) {
          this.hCuenta = "Nuevo";

          this.fgCuenta.controls["T1_nIdTipoCta"].enable();
          this.fgCuenta.controls["A1_nIdBanco"].enable();
        } else {
          this.hCuenta = "Detalle";
          this.loadCuenta(pushParam);
          this.bkCuenta = pushParam;
        }

        (function ($) {
          $("#ModalDetail").modal("hide");
          $("#ModalCuenta").modal("show");
          $("#ModalCuenta").on("shown.bs.modal", function () {
            self.onToggleFab(4, index);
          });
        })(jQuery);
        break;

      default:
        break;
    }
  }

  async cleanModal(opc: number) {
    const self = this;

    switch (opc) {
      case 1:
        this.hideModal("#ModalSearch");
        this.fgSearch.controls["sNombres"].setValue("");
        this.SearchDS = new MatTableDataSource([]);
        break;

      case 2:
        if (this.countCuenta !== 0) {
          this.fgMain.patchValue({
            sNombres: "",
            sCodPlla: "",
            sCiudad: "",
          });
          await this.loadMain();
          this.countCuenta = 0;
        }

        this.hideModal("#ModalDetail");
        this.maDetail.closeAll();
        this.fgDetail.reset();
        this.fgFilter.patchValue({
          sTipoCta: "",
        });
        this.DetailDS = new MatTableDataSource([]);
        break;

      case 3:
        this.hideModal("#ModalCuenta");

        (function ($) {
          $("#ModalDetail").modal("show");
          $("#ModalDetail").on("shown.bs.modal", function () {
            self.onToggleFab(3, 1);
          });
        })(jQuery);

        this.fgCuenta.reset();

        this.fgCuenta.controls["T1_nIdTipoCta"].disable();
        this.fgCuenta.controls["A1_nIdBanco"].disable();
        this.fgCuenta.controls["T1_sNroCuenta"].disable();
        this.fgCuenta.controls["T1_nIdMoneda"].disable();
        this.fgCuenta.controls["A1_nIdTipoDoc"].disable();
        this.fgCuenta.controls["T1_sDocumento"].disable();

        this.mCuenta = 0;
        this.hCuenta = "";
        this.bkCuenta = null;
        break;

      default:
        break;
    }
  }

  hideModal(modal: string) {
    let nToogle: number;
    switch (modal) {
      case "#ModalSearch":
        nToogle = 0;
        break;

      case "#ModalDetail":
        nToogle = 3;
        break;

      case "#ModalCuenta":
        nToogle = 4;
        break;
    }

    this.onToggleFab(nToogle, 0);

    (function ($) {
      $(modal).modal("hide");
    })(jQuery);
  }
  //#endregion

  //#region MODAL BUSCAR PERSONAL

  new_fgSearch() {
    this.fgSearch = this.fb.group({
      sNombres: "",
    });

    this.fgSearch.valueChanges.subscribe((value) => {
      const filter = {
        ...value,
        name: value.sNombres.trim().toLowerCase(),
      } as string;
      this.SearchDS.filter = filter;

      if (this.SearchDS.paginator) {
        this.SearchDS.paginator.firstPage();
      }
    });
  }

  get getSearch() {
    return this.fgSearch.controls;
  }

  async loadSearch() {
    const param = [];

    const nIdEmp = JSON.parse(localStorage.getItem("Empresa"));
    param.push("0¡A.nIdEmp!" + nIdEmp);

    await this.service._loadSP(4, param, this.url).then((value: IMain[]) => {
      this.SearchDS = new MatTableDataSource(value);
      this.SearchDS.paginator = this.pagSearch;
      this.SearchDS.filterPredicate = function (data, filter: string): boolean {
        return (
          data.sNombres.trim().toLowerCase().includes(filter) ||
          data.sDocumento.trim().toLowerCase().includes(filter)
        );
      };

      this.SearchDS.filterPredicate = ((data: IMain, filter: IMain) => {
        // tslint:disable-next-line: max-line-length
        const a =
          !filter.sNombres ||
          data.sNombres.toLowerCase().includes(filter.sNombres.toLowerCase()) ||
          data.sDocumento.toLowerCase().includes(filter.sNombres.toLowerCase());
        return a;
      }) as (PeriodicElement, string) => boolean;
    });
  }
  //#endregion

  //#region MODAL DETALLE

  new_fgDetail() {
    this.fgDetail = this.fb.group({
      nIdPersonal: 0,
      nIdPerLab: 0,
      sNombres: [{ value: "", disabled: true }],
      sCodPlla: [{ value: "", disabled: true }],
      nIdTipoDoc: 0,
      sTipo: [{ value: "", disabled: true }],
      sDocumento: [{ value: "", disabled: true }],
      dFechIni: [{ value: null, disabled: true }],
      dFechFin: [{ value: null, disabled: true }],
      sCiudad: [{ value: "", disabled: true }],
    });
  }

  get getDetail() {
    return this.fgDetail.controls;
  }

  async loadDetail(pushParam: IMain) {
    const nIdPerLab = pushParam.nIdPerLab;

    await this.loadCuentas(nIdPerLab);

    this.fgDetail.patchValue({
      nIdPersonal: pushParam.nIdPersonal,
      nIdPerLab: nIdPerLab,
      sNombres: pushParam.sNombres,
      nIdTipoDoc: pushParam.nIdTipoDoc,
      sTipo: pushParam.sDscTipo,
      sDocumento: pushParam.sDocumento,
      sCiudad: pushParam.sCiudad,
      dFechIni: pushParam.dFechIni,
      dFechFin: pushParam.dFechFin,
      sCodPlla: pushParam.sCodPlla,
    });
  }

  new_fgFilter() {
    this.fgFilter = this.fb.group({
      sTipoCta: "",
    });

    this.fgFilter.valueChanges.subscribe((value) => {
      const filter = {
        ...value,
        name: value.sTipoCta.trim().toLowerCase(),
      } as string;
      this.DetailDS.filter = filter;

      if (this.DetailDS.paginator) {
        this.DetailDS.paginator.firstPage();
      }
    });
  }

  get getFilter() {
    return this.fgFilter.controls;
  }

  //#endregion

  //#region MODAL CUENTA

  new_fgCuenta() {
    this.fgCuenta = this.fb.group({
      T1_nIdDPLB: 0,
      T1_nIdTipoCta: [
        { value: 0, disabled: true },
        [Validators.required, this.valid.noSelect],
      ],
      A1_nIdBanco: [
        { value: undefined, disabled: true },
        [this.valid.noSelect],
      ],
      T1_sNroCuenta: [
        { value: "", disabled: true },
        [Validators.required, this.valid.vString],
      ],
      T1_nIdMoneda: [
        { value: 0, disabled: true },
        [Validators.required, this.valid.noSelect],
      ],
      A1_nIdTipoDoc: [
        { value: undefined, disabled: true },
        [Validators.required, this.valid.noSelect],
      ],
      T1_sDocumento: [
        { value: "", disabled: true },
        [Validators.required, Validators.pattern("[0-9]*"), this.valid.vString],
      ],
    });
  }

  get getCuenta() {
    return this.fgCuenta.controls;
  }

  async loadCuentas(nIdPerLab: number) {
    this.pbDetail = true;

    const param = [];
    param.push("0¡nIdPerLab!" + nIdPerLab);
    await this.service
      ._loadSP(5, param, this.url)
      .then(async (value: IDetail[]) => {
        this.DetailDS = new MatTableDataSource(value);
        this.DetailDS.paginator = this.pagDetail;

        this.DetailDS.filterPredicate = function (
          data,
          filter: string
        ): boolean {
          return data.sTipoCta
            .trim()
            .toLowerCase()
            .includes(filter.toLowerCase());
        };

        this.DetailDS.filterPredicate = ((data: IDetail, filter: any) => {
          // tslint:disable-next-line: max-line-length
          const a =
            !filter.sTipoCta ||
            data.sTipoCta.toLowerCase().includes(filter.sTipoCta.toLowerCase());
          return a;
        }) as (PeriodicElement, string) => boolean;
      });

    this.pbDetail = false;
  }

  loadCuenta(aCuenta: any) {
    this.fgCuenta.reset();
    this.fgCuenta.patchValue({
      T1_nIdDPLB: aCuenta.nIdDPLB,
      T1_nIdTipoCta: aCuenta.nIdTipoCta,
      T1_sNroCuenta: aCuenta.sNroCuenta,
      T1_nIdMoneda: aCuenta.nIdMoneda,
      T1_sDocumento: aCuenta.sDocumento,
    });

    const aBanco = this.cboBanco as Array<any>;
    const iBanco = aBanco.findIndex((x) => x.nIdBanco_ === aCuenta.nIdBanco);
    if (iBanco > -1) {
      this.fgCuenta.controls["A1_nIdBanco"].setValue(aBanco[iBanco]);
    }

    const aTipoDoc = this.cboTipoDoc as Array<any>;
    const iTipoDoc = aTipoDoc.findIndex(
      (x) => x.nIdTipoDoc_ === aCuenta.nIdTipoDoc
    );
    if (iTipoDoc > -1) {
      this.fgCuenta.controls["A1_nIdTipoDoc"].setValue(aTipoDoc[iTipoDoc]);
    }

    this.fgCuenta.controls["T1_nIdTipoCta"].disable();
    this.fgCuenta.controls["A1_nIdBanco"].disable();
    this.fgCuenta.controls["T1_sNroCuenta"].disable();
    this.fgCuenta.controls["T1_nIdMoneda"].disable();
    this.fgCuenta.controls["A1_nIdTipoDoc"].disable();
    this.fgCuenta.controls["T1_sDocumento"].disable();
  }

  async saveCuenta(opc: number) {
    this.pbCuenta = true;

    this.aParam = [];

    if (this.fgCuenta.invalid) {
      Swal.fire(
        "No se puede guardar",
        "Información incorrecta o incompleta",
        "error"
      );

      this.pbCuenta = false;
      return;
    } else {
      const nIdPerLab = this.fgDetail.controls["nIdPerLab"].value;
      const dFechIng = moment(
        this.fgDetail.controls["dFechIni"].value
      ).toDate();
      const fControl = this.fgCuenta.controls["T1_nIdDPLB"] as FormControl;

      let new_dFechIni = dFechIng;

      // New - 1 | Edit - 2
      let oModo: number;
      oModo =
        fControl.value === 0 ||
        fControl.value === null ||
        fControl.value === undefined
          ? 1
          : 2;

      if (oModo === 1) {
        fControl.setValue(null);
      }
      fControl.markAsDirty();

      this.fnGetParam(this.fgCuenta.controls, oModo === 2 ? true : false);

      if (this.aParam.length > (oModo === 2 ? 1 : 0)) {
        // Usuario y Fecha con Hora
        const user = localStorage.getItem("currentUser");
        const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

        if (oModo === 1) {
          this.aParam.push("T1¡sRegUser!" + uid);
          this.aParam.push("T1¡dtReg!GETDATE()");
          this.aParam.push("T1¡nIdPerLab!" + nIdPerLab);

          const nIdTipoCta = this.fgCuenta.controls["T1_nIdTipoCta"].value;
          const aData = this.DetailDS.data;
          aData
            .filter((x) => {
              const a = x.nIdTipoCta === nIdTipoCta;
              const b = x.dFechFin === null;
              return a && b;
            })
            .forEach((x) => {
              // Encontro el ultimo registro del mismo tipo de cuenta
              this.aParam.push("W1¡nIdDPLB!" + x.nIdDPLB);

              const dFechIni = x.dFechIni;
              let dFechFin = moment(dFechIni)
                .endOf("month")
                .format("MM/DD/YYYY");

              const dFechNow = moment(new Date()).startOf("month").toDate();

              if (dFechNow > moment(dFechFin).toDate()) {
                dFechFin = moment(dFechNow)
                  .subtract(1, "days")
                  .format("MM/DD/YYYY");
              }

              this.aParam.push("S1¡dFechFin!" + dFechFin);

              new_dFechIni = moment(dFechFin).add(1, "days").toDate();
            });

          this.aParam.push(
            "T1¡dFechIni!" + moment(new_dFechIni).format("MM/DD/YYYY")
          );
        } else {
          this.aParam.push("T1¡sModUser!" + uid);
          this.aParam.push("T1¡dtMod!GETDATE()");
        }

        const aResult = new Array();
        const result = await this.service._crudCB(oModo, this.aParam, this.url);

        Object.keys(result).forEach((valor) => {
          aResult.push(result[valor]);
        });

        let ftitle = "";
        let ftext = "";
        let ftype = "";

        for (const e of aResult) {
          const iResult = aResult.indexOf(e);

          if (e.split("!")[0] !== "00") {
            ftitle =
              oModo === 2
                ? "Actualización satisfactoria"
                : "Registro satisfactorio";
            ftext =
              "La cuenta sirve para los pagos de la empresa al trabajador.";
            ftype = "success";
          } else {
            ftitle = "Inconveniente";
            ftext = e.split("!")[1];
            ftype = "error";
            break;
          }
        }

        this.aParam = [];

        Swal.fire(ftitle, ftext, ftype !== "error" ? "success" : "error");

        if (ftype !== "error") {
          this.countCuenta = this.countCuenta + 1;
          this.loadCuentas(nIdPerLab);
          this.cleanModal(3);
        }

        this.pbCuenta = false;
        return;
      } else {
        this._snackBar.open("No se realizó ningún cambio.", "Cerrar", {
          duration: 1000,
          horizontalPosition: "right",
          verticalPosition: "top",
        });
        return;
      }
    }
  }

  async deleteCuenta(nIdDPLB: number) {
    const nIdPerLab = this.fgDetail.controls["nIdPerLab"].value;

    const aParam = [];
    aParam.push("T1¡nIdDPLB!" + nIdDPLB);

    const aResult = new Array();
    const result = await this.service._crudCB(3, aParam, this.url);

    Object.keys(result).forEach((valor) => {
      aResult.push(result[valor]);
    });

    let ftitle = "";
    let ftext = "";
    let ftype = "";

    for (const e of aResult) {
      const iResult = aResult.indexOf(e);

      if (e.split("!")[0] !== "00") {
        if (iResult === 0) {
          ftitle = "Registro eliminado";
          ftext = "Deberá de calcular para reflejar el cambio en planilla .";
          ftype = "success";
        }
      } else {
        ftitle = "Inconveniente";
        ftext = e.split("!")[1];
        ftype = "error";
        break;
      }
    }

    Swal.fire(ftitle, ftext, ftype !== "error" ? "success" : "error");

    if (ftype !== "error") {
      this.countCuenta = this.countCuenta + 1;
      this.loadCuentas(nIdPerLab);
      this.cleanModal(3);
    }
  }
  //#endregion
}
