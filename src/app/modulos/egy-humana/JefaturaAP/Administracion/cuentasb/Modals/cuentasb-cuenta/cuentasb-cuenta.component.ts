import { Component, Inject, Input, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import Swal from "sweetalert2";
import * as moment from "moment";

import { CuentasbService } from "../../../../Services/cuentasb.service";
import { adminpAnimations } from "../../../../Animations/adminp.animations";

import { ValidadoresService } from "../../../../Validators/validadores.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { IDetail } from "../../../../Model/Icuentasb";
import { NgxSpinnerService } from "ngx-spinner";
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}
@Component({
  selector: "app-cuentasb-cuenta",
  templateUrl: "./cuentasb-cuenta.component.html",
  styleUrls: [
    "./cuentasb-cuenta.component.css",
    "./cuentasb-cuenta.component.scss",
  ],
  animations: [adminpAnimations],
})
export class CuentasbCuentaComponent implements OnInit {
  @Input() data: any;
  @Input() fgDetail: FormGroup;
  @Input() DetailDS: IDetail[];
  @Input() DataPerson: any;

  //#region GENERAL
  url: string;
  matcher = new MyErrorStateMatcher();
  aParam = [];
  recargarCerrarModal = false;
  //#endregion

  //#region BOTON OPCIONES
  abCuenta = [];
  tsCuenta = "inactive";
  fbCuenta = [
    { icon: "save", tool: "Guardar" },
    { icon: "cancel", tool: "Cancelar" },
  ];
  fbCuenta2 = [
    { icon: "edit", tool: "Editar" },
    { icon: "delete", tool: "Eliminar" },
  ];
  //#endregion

  pbCuenta: boolean;

  hCuenta: string;
  mCuenta: number;
  countCuenta: number;
  bkCuenta: any;

  //#region COMBOS
  // Tipo Cta
  cboTipoCta: any;
  hTipoCta = "";

  //Banco
  cboBanco: any;

  //Moneda
  cboMoneda: any;

  // Tipo Doc
  cboTipoDoc: any;

  //#endregion

  //#region FORMULARIO
  fgCuenta: FormGroup;
  //#endregion

  constructor(
    public spi: NgxSpinnerService,
    public service: CuentasbService,
    @Inject("BASE_URL") baseUrl: string,
    private fb: FormBuilder,
    private valid: ValidadoresService,
    public activeModal: NgbActiveModal,
    private _snackBar: MatSnackBar
  ) {
    this.url = baseUrl;
  }

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_cuentasb_cuenta");
    await this.new_fgCuenta();
    await this.loadCombos();
    this.spi.hide("spi_cuentasb_cuenta");
  }

  init() {
    if (this.data === undefined) {
      this.mCuenta = 1;
      this.hCuenta = "Nuevo";
      this.fgCuenta.controls["T1_nIdTipoCta"].enable();
      this.fgCuenta.controls["A1_nIdBanco"].enable();
      this.abCuenta = this.fbCuenta;
    } else {
      this.mCuenta = 2;
      this.abCuenta = this.fbCuenta2;
      this.hCuenta = "Detalle";
      this.loadCuenta(this.data);
    }
  }

  //#region BOTON OPCIONES
  clickFab(opc: number, index: number) {
    switch (opc) {
      case 4:
        switch (index) {
          case -1:
            break;

          case 0:
            if (this.mCuenta === 1) {
              this.saveCuenta();
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
              this.activeModal.dismiss();
            } else {
              if (this.mCuenta === 1) {
                this.mCuenta = 2;
                this.loadCuenta(this.data);

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

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
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
  //#endregion

  //#region COMBOS
  async loadCombos() {
    await this.fnGetTipoCta();
    await this.fnGetBanco();
    await this.fnGetMoneda();
    await this.fnGetTipoDoc();
    this.init();
  }

  //#region Tipo Cta
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
  //#endregion

  //#region Banco
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
          Validators.pattern("([0-9]{1,}(-{1})?[0-9]{1,})"),
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
  //#endregion

  //#region Moneda
  async fnGetMoneda() {
    const param = [];
    param.push("0¡nDadTipEle!442");
    const sIdPais = JSON.parse(localStorage.getItem("Pais"));
    param.push("0¡nIdPais!" + sIdPais);

    await this.service._loadSP(2, param, this.url).then((value: any[]) => {
      this.cboMoneda = value;
    });
  }
  //#endregion

  //#region Tipo Doc
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
  //#endregion

  //#region FORMULARIO
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
        [
          Validators.required,
          Validators.pattern("([0-9]{1,}(-{1})?[0-9]{1,})"),
          this.valid.vString,
        ],
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

  async saveCuenta() {
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
        var tipoDeEnvio = 1;
        let fechaMensajeAlerta = new Date();

        // Usuario y Fecha con Hora
        const user = localStorage.getItem("currentUser");
        const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

        if (oModo === 1) {
          this.aParam.push("T1¡sRegUser!" + uid);
          this.aParam.push("T1¡dtReg!GETDATE()");
          this.aParam.push("T1¡nIdPerLab!" + nIdPerLab);

          const nIdTipoCta = this.fgCuenta.controls["T1_nIdTipoCta"].value;

          // Obteniendo el devengue activo
          const paramDevengue = [];
          const nIdEmp = JSON.parse(localStorage.getItem("Empresa"));
          paramDevengue.push("0¡nIdEmp!" + nIdEmp);
          paramDevengue.push("2¡nIdEstado!2");
          const ultimoRevengueActivo: any = await this.service._loadSP(
            8,
            paramDevengue,
            this.url
          );

          const aData = this.DetailDS;
          aData
            .filter((x: IDetail) => {
              const a = x.nIdTipoCta === nIdTipoCta;
              const b = x.dFechFin === null;
              return a && b;
            })
            .forEach((x) => {
              const dFechDevengue = new Date(
                ultimoRevengueActivo.nEjercicio,
                ultimoRevengueActivo.nMes - 1,
                1
              ).toISOString();

              let dFechFin = moment(dFechDevengue)
                .endOf("month")
                .format("MM/DD/YYYY");

              this.aParam.push("W1¡nIdDPLB!" + x.nIdDPLB);
              this.aParam.push("S1¡dFechFin!" + dFechFin);

              new_dFechIni = moment(dFechFin).add(1, "days").toDate();
              fechaMensajeAlerta = new_dFechIni;
              tipoDeEnvio = 4;
            });

          if (tipoDeEnvio === 1) {
            this.aParam.push(
              "T1¡dFechIni!" +
                moment(this.DataPerson.dFechIni).format("MM/DD/YYYY")
            );
          } else {
            this.aParam.push(
              "T1¡dFechIni!" + moment(fechaMensajeAlerta).format("MM/DD/YYYY")
            );
          }
        } else {
          this.aParam.push("T1¡sModUser!" + uid);
          this.aParam.push("T1¡dtMod!GETDATE()");
        }

        // Preguntar si quiere crear la cuenta
        if (
          (tipoDeEnvio === 4 &&
            (await this._validacionCreacionNuevaCuenta(
              oModo,
              moment(fechaMensajeAlerta).format("MM/DD/YYYY")
            ))) == 1
        ) {
          return;
        }

        const aResult = new Array();

        if (oModo === 2) {
          tipoDeEnvio = 2;
        }

        this.spi.show("spi_cuentasb_cuenta");
        const result = await this.service._crudCB(
          tipoDeEnvio,
          this.aParam,
          this.url
        );
        this.spi.hide("spi_cuentasb_cuenta");

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
        }

        this.pbCuenta = false;
        this.recargarCerrarModal = true;
        this.closeModal();
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
    // const nIdPerLab = this.fgDetail.controls["nIdPerLab"].value;

    //if (!(await this.validacionEliminarCuenta(nIdDPLB))) {
    //  return;
    //}
    const aParam = [];

    // Params para eliminar
    aParam.push("T1¡nIdDPLB!" + nIdDPLB);

    // Params para editar la ultima cuenta cerrada
    const idCuentaCerrada = this.ultimaCuentaCerrada(nIdDPLB);
    aParam.push("W1¡nIdDPLB!" + idCuentaCerrada);
    aParam.push("S1¡dFechFin!NULL");

    this.spi.show("spi_cuentasb_cuenta");
    const result = await this.service._crudCB(9, aParam, this.url);
    this.spi.hide("spi_cuentasb_cuenta");

    const aResult = new Array();
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
      //this.loadCuentas(nIdPerLab);
      //this.cleanModal(3);
    }
    this.recargarCerrarModal = true;
    this.closeModal();
  }

  ultimaCuentaCerrada(idDPLB: number): number {
    var data = this.DetailDS.filter(
      (x) => x.nIdDPLB !== idDPLB && x.sTipoCta === this.data.sTipoCta
    );

    if (data.length <= 0) {
      return 0;
    }

    data = data.sort((a, b) => (a.dFechFin < b.dFechFin ? 1 : -1));

    const ultimaCuenta = data[data.length - 1];

    return ultimaCuenta.nIdDPLB;
  }

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

            if (aControl !== undefined && aControl !== null) {
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

  private async _validacionCreacionNuevaCuenta(
    oModo: number,
    fechaInicio: string
  ): Promise<number> {
    var rsp = 1;
    if (oModo === 2) {
      rsp = 2;
    } else {
      await Swal.fire({
        title: "¿Seguro que quiere crear la cuenta?",
        text: "Esta cuenta entrara en vigencia apartir de " + fechaInicio,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#ff4081",
        confirmButtonText: "Confirmar !",
        allowOutsideClick: false,
      }).then(async (result) => {
        if (result.isConfirmed) {
          rsp = 2;
        }
      });

      return rsp;
    }
  }

  private async validacionEliminarCuenta(idCuenta: number) {
    // Obteniendo el ultimo devengue
    const paramDevengue = [];
    const nIdEmp = JSON.parse(localStorage.getItem("Empresa"));
    paramDevengue.push("0¡nIdEmp!" + nIdEmp);
    paramDevengue.push("2¡nIdEstado!2");

    const cuenta = this.DetailDS.find((x) => x.nIdDPLB === idCuenta);
    const ultimoRevengueActivo: any = await this.service._loadSP(
      8,
      paramDevengue,
      this.url
    );
    const date1 = new Date(
      ultimoRevengueActivo.nEjercicio,
      ultimoRevengueActivo.nMes - 1,
      1
    );

    const date2 = new Date(cuenta.dFechIni);

    if (date2 <= date1) {
      Swal.fire({
        title: "Atencion!",
        text: "No se puede eliminar, fecha comprende periodos cerrados.",
        icon: "info",
      });

      return false;
    }

    return true;
  }

  //#endregion

  //#region GENERAL

  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }

  closeModal() {
    const oReturn = new Object();

    oReturn["recargar"] = this.recargarCerrarModal;

    if (this.recargarCerrarModal) {
      const nId = this.fgCuenta.controls.T1_nIdTipoCta.value;
      oReturn["tipo"] = this.cboTipoCta.find(
        (v: any) => v.nIdTipEle === nId
      ).sDesc;
    }

    this.activeModal.close(oReturn);
  }
  //#endregion
}
