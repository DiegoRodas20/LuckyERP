import { Component, Input, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { nsAtencionp } from '../../../../Model/Iatencionp';
import { AtencionpService } from '../../../../Services/atencionp.service';
import { ValidadoresService } from '../../../../Validators/validadores.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: "app-atencionp-renuncia",
  templateUrl: "./atencionp-renuncia.component.html",
  styleUrls: ["./atencionp-renuncia.component.css"],
  providers: [AtencionpService],
  animations: [adminpAnimations],
})
export class AtencionpRenunciaComponent implements OnInit {
  @Input() fromParent;

  //#region Variables
  aParam = [];
  matcher = new MyErrorStateMatcher();

  fbRegistrarRenuncia = [
    { icon: "save", tool: "Guardar e imprimir" },
    { icon: "cancel", tool: "Cancelar" },
  ];
  fbEditarRenuncia = [
    { icon: "edit", tool: "Editar" },
    { icon: "delete", tool: "Eliminar" },
  ];
  abRenuncia = [];
  tsRenuncia = "inactive";

  nuevaRenuncia = false;
  fechaInicioContrato: Date;
  fechaFinContrato: Date;

  documentos = [
    { name: "Carta de renuncia", checked: true },
    { name: "Encuesta", checked: true },
    { name: "Alta Sunat", checked: true },
    // { name: 'Acumulado', checked: true },
    { name: "Contrato", checked: true },
    // { name: 'Boletas pendientes', checked: false }
  ];

  dataRenuncia: nsAtencionp.IRenunciaPersonal;
  lstMotivos: Array<nsAtencionp.IMotivoRenuncia> = new Array();

  minFechaCese: Date;
  maxFechaCese: Date;

  // FormGroup
  fgRenunciaPersonal: FormGroup;

  // Progress Bar
  pbRenuncia: boolean;

  constructor(
    public activeModal: NgbActiveModal,
    private spi: NgxSpinnerService,
    private valid: ValidadoresService,
    private fb: FormBuilder,
    private atencionService: AtencionpService
  ) {
    this.onInitFrmGrpRenunciaPersonal();
  }

  onInitFrmGrpRenunciaPersonal() {
    this.fgRenunciaPersonal = this.fb.group({
      txtRenunciaId: [{ value: "" }],
      txtPeriodoLaboralId: [{ value: "" }],
      txtSupervisorId: [{ value: "" }],
      txtCentroCostoId: [{ value: "" }],
      txtTrabajador: [{ value: "", disabled: true }],
      txtSupervisor: [{ value: "", disabled: true }],
      txtFechaCese: [{ value: "" }, [Validators.required]],
      txtTelefonoMovil: [
        { value: "", disabled: true },
        [
          Validators.required,
          Validators.pattern("[0-9]*"),
          Validators.maxLength(9),
        ],
      ],
      txtCliente: [{ value: "", disabled: true }],
      selMotivoCese: [
        { value: 0, disabled: true },
        [Validators.required, this.valid.noSelect],
      ],
      txtCampania: [{ value: "", disabled: true }],
      txtMotivoCese: [
        { value: "", disabled: true },
        [Validators.maxLength(255)],
      ],
      chkProvis: false,
      chkPasajes: false,
      chkFeriado: false,
      chkIncentivo: false,
      chkSueldo: false,
      chkBono: false,
      chkOtro: false,
      chkCartaRenuncia: true,
      chkEncuesta: true,
      chkAltaSunat: true,
      chkContrato: true,
    });
  }

  get getRenunciaPersonal() {
    return this.fgRenunciaPersonal.controls;
  }

  onToggleFab(stat: number) {
    // debugger

    stat = stat === -1 ? (this.abRenuncia.length > 0 ? 0 : 1) : stat;
    this.tsRenuncia = stat === 0 ? "inactive" : "active";
    this.abRenuncia = stat === 0 ? [] : this.fbRegistrarRenuncia;
  }

  async cargarRenunciaDePersonal() {
    // debugger

    this.pbRenuncia = true;

    const param = [];

    const nIdPersonal = this.fromParent.nIdPersonal;
    // let nIdPersonal = this.fgInfo.controls['nIdPersonal'].value;
    // let nIdPersonal = 171;

    param.push(
      "0¡pla.nIdPersonal!" +
      nIdPersonal +
      "|5¡pla.dFecha!CAST(GETDATE() AS DATE)-0¡pla.nIdPersonal!" +
      nIdPersonal +
      "-0¡nEleCodDad!2244"
    );

    await this.atencionService._loadSP(6, param).then((data: any) => {
      console.log(data);

      this.dataRenuncia = data;

      // debugger
      console.log(this.dataRenuncia);

      if (this.dataRenuncia.renunciaVigente.personalId !== 0) {
        this.nuevaRenuncia = false;

        console.log(this.dataRenuncia.renunciaVigente.adeuda.split(","));

        this.fgRenunciaPersonal.patchValue({
          txtRenunciaId: this.dataRenuncia.renunciaVigente.renunciaId,
          txtPeriodoLaboralId: this.dataRenuncia.renunciaVigente
            .periodoLaboralId,
          txtSupervisorId: this.dataRenuncia.renunciaVigente.supervisorId,
          txtCentroCostoId: this.dataRenuncia.renunciaVigente.centroCostoId,
          txtTrabajador: this.dataRenuncia.renunciaVigente.personal,
          txtSupervisor: this.dataRenuncia.renunciaVigente.supervisor,
          txtCliente: this.dataRenuncia.renunciaVigente.nombreComercial,
          txtCampania: this.dataRenuncia.renunciaVigente.campania,

          txtFechaCese: this.dataRenuncia.renunciaVigente.fechaRenuncia,
          txtTelefonoMovil: this.dataRenuncia.renunciaVigente.telefonoMovil,
          selMotivoCese: this.dataRenuncia.renunciaVigente.motivoId,
          txtMotivoCese: this.dataRenuncia.renunciaVigente.observacion,
          chkProvis:
            this.dataRenuncia.renunciaVigente.adeuda.split(",")[0] === "1",
          chkPasajes:
            this.dataRenuncia.renunciaVigente.adeuda.split(",")[1] === "1",
          chkFeriado:
            this.dataRenuncia.renunciaVigente.adeuda.split(",")[2] === "1",
          chkIncentivo:
            this.dataRenuncia.renunciaVigente.adeuda.split(",")[3] === "1",
          chkSueldo:
            this.dataRenuncia.renunciaVigente.adeuda.split(",")[4] === "1",
          chkBono:
            this.dataRenuncia.renunciaVigente.adeuda.split(",")[5] === "1",
          chkOtro:
            this.dataRenuncia.renunciaVigente.adeuda.split(",")[6] === "1",
        });

        this.fechaInicioContrato = this.dataRenuncia.renunciaVigente.fechaInicioContrato;
        this.fechaFinContrato = this.dataRenuncia.renunciaVigente.fechaFinContrato;
      } else {
        this.nuevaRenuncia = true;

        this.fgRenunciaPersonal.patchValue({
          txtPeriodoLaboralId: this.dataRenuncia.personal.periodoLaboralId,
          txtSupervisorId: this.dataRenuncia.personal.supervisorId,
          txtCentroCostoId: this.dataRenuncia.personal.centroCostoId,
          txtTrabajador: this.dataRenuncia.personal.personal,
          txtSupervisor: this.dataRenuncia.personal.supervisor,
          txtCliente: this.dataRenuncia.personal.nombreComercial,
          txtCampania: this.dataRenuncia.personal.campania,
        });

        this.fechaInicioContrato = this.dataRenuncia.personal.fechaInicioContrato;
        this.fechaFinContrato = this.dataRenuncia.personal.fechaFinContrato;
      }

      this.minFechaCese = this.fechaInicioContrato;

      const currentDate = new Date();
      this.maxFechaCese = new Date(
        currentDate.setMonth(currentDate.getMonth() + 1)
      );

      this.lstMotivos = this.dataRenuncia.motivosRenuncia;

      // Carga de opciones de boton

      if (this.nuevaRenuncia === true) {
        this.delay(250).then((any) => {
          this.tsRenuncia = "active";
          this.abRenuncia = this.fbRegistrarRenuncia;
        });
      } else {
        this.delay(250).then((any) => {
          this.tsRenuncia = "active";
          this.abRenuncia = this.fbEditarRenuncia;
        });
      }

      this.habilitarControles(this.nuevaRenuncia);
    });

    this.pbRenuncia = false;
  }

  habilitarControles(habilitar: boolean) {
    if (habilitar) {
      // this.fgRenunciaPersonal.controls['txtFechaCese'].enable();
      this.fgRenunciaPersonal.controls["txtTelefonoMovil"].enable();
      this.fgRenunciaPersonal.controls["selMotivoCese"].enable();
      this.fgRenunciaPersonal.controls["txtMotivoCese"].enable();
      this.fgRenunciaPersonal.controls["chkProvis"].enable();
      this.fgRenunciaPersonal.controls["chkPasajes"].enable();
      this.fgRenunciaPersonal.controls["chkFeriado"].enable();
      this.fgRenunciaPersonal.controls["chkIncentivo"].enable();
      this.fgRenunciaPersonal.controls["chkSueldo"].enable();
      this.fgRenunciaPersonal.controls["chkBono"].enable();
      this.fgRenunciaPersonal.controls["chkOtro"].enable();
    } else {
      this.fgRenunciaPersonal.controls["txtFechaCese"].disable();
      this.fgRenunciaPersonal.controls["txtTelefonoMovil"].disable();
      this.fgRenunciaPersonal.controls["selMotivoCese"].disable();
      this.fgRenunciaPersonal.controls["txtMotivoCese"].disable();
      this.fgRenunciaPersonal.controls["chkProvis"].disable();
      this.fgRenunciaPersonal.controls["chkPasajes"].disable();
      this.fgRenunciaPersonal.controls["chkFeriado"].disable();
      this.fgRenunciaPersonal.controls["chkIncentivo"].disable();
      this.fgRenunciaPersonal.controls["chkSueldo"].disable();
      this.fgRenunciaPersonal.controls["chkBono"].disable();
      this.fgRenunciaPersonal.controls["chkOtro"].disable();
    }
  }

  async onClickMenuRenuncia(index: number, tool: string) {
    switch (index) {
      case 0:
        if (tool === "Guardar e imprimir") {
          const renunciaId = this.fgRenunciaPersonal.controls["txtRenunciaId"]
            .value;

          if (renunciaId.value !== "") {
            this.actualizarRenuncia();
          } else {
            this.registrarRenuncia();
          }

          this.delay(250).then((any) => {
            this.tsRenuncia = "active";
            this.abRenuncia = this.fbEditarRenuncia;
          });
        }
        if (tool === "Editar") {
          this.habilitarControles(true);

          this.delay(250).then((any) => {
            this.tsRenuncia = "active";
            this.abRenuncia = this.fbRegistrarRenuncia;
          });
        }

        break;

      case 1:
        if (tool === "Cancelar") {
          if (this.dataRenuncia.renunciaVigente.personalId !== 0) {
            this.cargarRenunciaDePersonal();
          } else {
            this.activeModal.close();
            // this.activeModal.dismiss();
          }
        }

        if (tool === "Eliminar") {
          this.eliminarRenuncia();
          this.activeModal.close();
        }

        break;

      default:
        break;
    }
  }

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_renuncia");

    await this.cargarRenunciaDePersonal();

    this.spi.hide("spi_renuncia");
  }

  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }

  async actualizarRenuncia() {
    // debugger

    this.pbRenuncia = true;

    if (this.fgRenunciaPersonal.invalid) {
      Swal.fire(
        "No se puede actualizar",
        "Por favor, verificar que todos los campos se encuentren correctamente ingresados.",
        "error"
      );

      this.pbRenuncia = false;

      return;
    }

    this.aParam = [];

    // Usuario y Fecha con hora
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;
    const renunciaId = this.fgRenunciaPersonal.controls["txtRenunciaId"].value;
    const periodoLaboralId = this.fgRenunciaPersonal.controls[
      "txtPeriodoLaboralId"
    ].value;
    const fechaCese = this.fgRenunciaPersonal.controls["txtFechaCese"].value;
    const motivoCeseId = this.fgRenunciaPersonal.controls["selMotivoCese"]
      .value;
    const motivoCese = this.fgRenunciaPersonal.controls["txtMotivoCese"].value;
    const supervisorId = this.fgRenunciaPersonal.controls["txtSupervisorId"]
      .value;
    const centroCostoId = this.fgRenunciaPersonal.controls["txtCentroCostoId"]
      .value;
    const telefonoMovil = this.fgRenunciaPersonal.controls["txtTelefonoMovil"]
      .value;
    let adeuda =
      this.fgRenunciaPersonal.controls["chkProvis"].value === true ? "1" : "0";
    adeuda +=
      "," +
      (this.fgRenunciaPersonal.controls["chkPasajes"].value === true
        ? "1"
        : "0");
    adeuda +=
      "," +
      (this.fgRenunciaPersonal.controls["chkFeriado"].value === true
        ? "1"
        : "0");
    adeuda +=
      "," +
      (this.fgRenunciaPersonal.controls["chkIncentivo"].value === true
        ? "1"
        : "0");
    adeuda +=
      "," +
      (this.fgRenunciaPersonal.controls["chkSueldo"].value === true
        ? "1"
        : "0");
    adeuda +=
      "," +
      (this.fgRenunciaPersonal.controls["chkBono"].value === true ? "1" : "0");
    adeuda +=
      "," +
      (this.fgRenunciaPersonal.controls["chkOtro"].value === true ? "1" : "0");

    this.aParam.push("T1¡nIdModUser!" + uid);
    this.aParam.push("T1¡dtMod!GETDATE()");
    this.aParam.push("T1¡nIdRenuncia!" + renunciaId);
    this.aParam.push("T1¡nIdPerLab!" + periodoLaboralId);
    this.aParam.push("T1¡dFecha!" + moment(fechaCese).format("YYYY-MM-DD"));
    this.aParam.push("T1¡nIdMotRenuncia!" + motivoCeseId);
    this.aParam.push("T1¡sObservacion!" + motivoCese);
    this.aParam.push("T1¡nIdSupervisor!" + supervisorId);
    this.aParam.push("T1¡nIdCentroCosto!" + centroCostoId);
    this.aParam.push("T1¡nTelMovil!" + telefonoMovil);
    this.aParam.push("T1¡sAdeuda!" + adeuda);

    // debugger;

    const result = await this.atencionService._crudAP(2, this.aParam);

    if (result[0].split("!")[0] !== "00") {
      Swal.fire(
        "Actualización satisfactoria",
        "La renuncia ha sido actualizada correctamente.",
        "success"
      );

      this.habilitarControles(false);
    } else {
      Swal.fire("Inconveniente", result[0].split("!")[1], "error");
    }

    this.pbRenuncia = false;
  }

  async eliminarRenuncia() {
    // debugger

    this.pbRenuncia = true;

    this.aParam = [];

    const renunciaId = this.fgRenunciaPersonal.controls["txtRenunciaId"].value;

    this.aParam.push("T1¡nIdRenuncia!" + renunciaId);

    const result = await this.atencionService._crudAP(3, this.aParam);

    if (result[0].split("!")[0] !== "00") {
      Swal.fire(
        "Eliminación satisfactoria",
        "La renuncia ha sido eliminada correctamente.",
        "success"
      );
    } else {
      Swal.fire("Inconveniente", result[0].split("!")[1], "error");
    }

    this.pbRenuncia = false;
  }

  cargarDocumentos() {
    // debugger

    const param = [];
    const tipo = [];

    if (this.fgRenunciaPersonal.controls["chkCartaRenuncia"].value) {
      tipo.push("2");
    }
    if (this.fgRenunciaPersonal.controls["chkEncuesta"].value) {
      tipo.push("3");
    }
    if (this.fgRenunciaPersonal.controls["chkAltaSunat"].value) {
      tipo.push("4");
    }
    if (this.fgRenunciaPersonal.controls["chkContrato"].value) {
      tipo.push("5");
    }

    if (tipo.length > 0) {
      param.push("0¡nIdEmp!1-1¡nIdFormato!" + tipo.join(","));

      // param.push('0¡nIdEmp!1-1¡nIdFormato!2,3');

      this.atencionService.print(10, param).then((result: any) => {
        let objectURL: any = URL.createObjectURL(result);
        const pdf = document.getElementById(
          "pdf-renuncia"
        ) as HTMLIFrameElement;
        pdf.src = "";
        pdf.src = objectURL;
        objectURL = URL.revokeObjectURL(result);
      });
    }
  }

  onLoadDocumento() {
    // debugger

    const pdf = document.getElementById("pdf-renuncia") as HTMLIFrameElement;
    if (pdf.src !== "") {
      this.pbRenuncia = false;
      pdf.contentWindow.print();
    }
  }

  async registrarRenuncia() {
    // debugger

    this.pbRenuncia = true;

    if (this.fgRenunciaPersonal.invalid) {
      Swal.fire(
        "No se puede guardar",
        "Por favor, verificar que todos los campos se encuentren correctamente ingresados.",
        "error"
      );

      this.pbRenuncia = false;

      return;
    }

    this.aParam = [];

    // Usuario y Fecha con hora
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;
    const periodoLaboralId = this.fgRenunciaPersonal.controls[
      "txtPeriodoLaboralId"
    ].value;
    const fechaCese = this.fgRenunciaPersonal.controls["txtFechaCese"].value;
    const motivoCeseId = this.fgRenunciaPersonal.controls["selMotivoCese"]
      .value;
    const motivoCese = this.fgRenunciaPersonal.controls["txtMotivoCese"].value;
    const supervisorId = this.fgRenunciaPersonal.controls["txtSupervisorId"]
      .value;
    const centroCostoId = this.fgRenunciaPersonal.controls["txtCentroCostoId"]
      .value;
    const telefonoMovil = this.fgRenunciaPersonal.controls["txtTelefonoMovil"]
      .value;
    let adeuda =
      this.fgRenunciaPersonal.controls["chkProvis"].value === true ? "1" : "0";
    adeuda +=
      "," +
      (this.fgRenunciaPersonal.controls["chkPasajes"].value === true
        ? "1"
        : "0");
    adeuda +=
      "," +
      (this.fgRenunciaPersonal.controls["chkFeriado"].value === true
        ? "1"
        : "0");
    adeuda +=
      "," +
      (this.fgRenunciaPersonal.controls["chkIncentivo"].value === true
        ? "1"
        : "0");
    adeuda +=
      "," +
      (this.fgRenunciaPersonal.controls["chkSueldo"].value === true
        ? "1"
        : "0");
    adeuda +=
      "," +
      (this.fgRenunciaPersonal.controls["chkBono"].value === true ? "1" : "0");
    adeuda +=
      "," +
      (this.fgRenunciaPersonal.controls["chkOtro"].value === true ? "1" : "0");

    this.aParam.push("T0¡nIdRegUser!" + uid);
    this.aParam.push("T0¡dtReg!GETDATE()");
    this.aParam.push("T1¡nIdPerLab!" + periodoLaboralId);
    this.aParam.push("T1¡dFecha!" + moment(fechaCese).format("YYYY-MM-DD"));
    this.aParam.push("T1¡nIdMotRenuncia!" + motivoCeseId);
    this.aParam.push("T1¡sObservacion!" + motivoCese);
    this.aParam.push("T1¡nIdSupervisor!" + supervisorId);
    this.aParam.push("T1¡nIdCentroCosto!" + centroCostoId);
    this.aParam.push("T1¡nTelMovil!" + telefonoMovil);
    this.aParam.push("T1¡sAdeuda!" + adeuda);

    // debugger;

    const result = await this.atencionService._crudAP(1, this.aParam);

    if (result[0].split("!")[0] !== "00") {
      Swal.fire(
        "Registro satisfactorio",
        "La renuncia ha sido registrada correctamente.",
        "success"
      );

      this.fgRenunciaPersonal
        .get("txtRenunciaId")
        .setValue(result[0].split("!")[1]);

      this.habilitarControles(false);

      this.cargarDocumentos();
    } else {
      Swal.fire("Inconveniente", result[0].split("!")[1], "error");
    }

    this.pbRenuncia = false;
  }

  onDateInputFechaCese(value) {
    // debugger
    // console.log('onDateInputFechaCese');
    // console.log(moment().format('YYYY-MM-DD'));
    // console.log(moment(value).format('YYYY-MM-DD'));
    // const txtFechCese = moment(value);
    // if (this.nuevaRenuncia && txtFechCese.toDate() > this.fechaFinContrato) {
    //   console.log('se activa el check contrato');
    //   this.fgRenunciaPersonal.get('chkProvis').setValue(true);
    // } else {
    //   console.log('else');
    //   this.fgRenunciaPersonal.get('chkProvis').setValue(false);
    // }
  }

  onDateChangeFechaCese(value) {
    // debugger

    console.log("onDateChangeFechaCese");

    const fechaCese = moment(
      new Date(this.fgRenunciaPersonal.get("txtFechaCese").value)
    ).format("MM/DD/YYYY");
    const fechaFinContrato = moment(new Date(this.fechaFinContrato)).format(
      "MM/DD/YYYY"
    );

    if (this.nuevaRenuncia) {
      if (Date.parse(fechaCese) > Date.parse(fechaFinContrato)) {
        this.fgRenunciaPersonal.get("chkContrato").setValue(true);
      } else {
        this.fgRenunciaPersonal.get("chkContrato").setValue(false);
      }
    }
  }

  onImprimirDocumento(tipo: string) {
    this.pbRenuncia = true;

    const param = [];

    switch (tipo) {
      case "CartaDeRenuncia":
        param.push("0¡nIdEmp!1-0¡nIdFormato!2");
        break;

      case "Encuesta":
        param.push("0¡nIdEmp!1-0¡nIdFormato!3");
        break;

      case "AltaSunat":
        param.push("0¡nIdEmp!1-0¡nIdFormato!4");
        break;

      case "Contrato":
        param.push("0¡nIdEmp!1-0¡nIdFormato!5");
        break;

      default:
        break;
    }

    this.atencionService.print(10, param).then((result: any) => {
      let objectURL: any = URL.createObjectURL(result);
      const pdf = document.getElementById("pdf-renuncia") as HTMLIFrameElement;
      pdf.src = "";
      pdf.src = objectURL;
      objectURL = URL.revokeObjectURL(result);
    });

    this.pbRenuncia = false;
  }
}
