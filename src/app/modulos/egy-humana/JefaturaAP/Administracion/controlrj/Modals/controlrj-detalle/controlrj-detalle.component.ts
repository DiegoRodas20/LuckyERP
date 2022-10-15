import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ValidadoresService } from '../../../../Validators/validadores.service';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { IBanco, IConcepto, IDetalleConcepto, IMoneda, IRetencion, ITipoDocumento, ITipoRetencion } from '../../../../Model/Icontrolrj';
import { ControlrjService } from '../../../../Services/controlrj.service';

// Utilizar javascript [1]
declare var jQuery: any;

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-controlrj-detalle',
  templateUrl: './controlrj-detalle.component.html',
  styleUrls: ['./controlrj-detalle.component.css'],
  animations: [adminpAnimations]
})
export class ControlrjDetalleComponent implements OnInit {
  @Input() fromParent;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  fileSustento: File;

  lstTiposDocumento: Array<ITipoDocumento> = new Array();
  lstBancos: Array<IBanco> = new Array();
  lstMonedas: Array<IMoneda> = new Array();
  lstTiposRetencion: Array<ITipoRetencion> = new Array();
  lstConceptos: Array<IConcepto> = new Array();

  lstDetalleConceptos: Array<IDetalleConcepto> = new Array();

  tieneSustento: Boolean = false;

  aParam = [];
  matcher = new MyErrorStateMatcher();

  fbRegistrarRetencion = [
    { icon: "save", tool: "Guardar" },
    { icon: 'cloud_upload', tool: 'Cargar sustento' },
    { icon: "cancel", tool: "Cancelar" },
  ];
  fbEditarRetencion = [
    { icon: "edit", tool: "Editar" },
    { icon: "delete", tool: "Eliminar" },
  ];
  abRetencion = [];
  tsRetencion = "inactive";

  nuevaRetencion = false;
  seleccionarConceptos = false;

  demandado: string = "";
  tieneDeposito: string = "";
  urlSustento: string = "";
  titulo: string = "";

  cantidadSeleccionados: number = 0;

  data: Array<IRetencion> = new Array();
  lstRetenciones: Array<IRetencion> = new Array();

  // FormGroup
  fgRetencion: FormGroup;

  // Progress Bar
  pbRetencion: boolean;

  minNum = 0;
  maxNum = 100;

  constructor(
    public activeModal: NgbActiveModal,
    private spinner: NgxSpinnerService,
    private valid: ValidadoresService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private controlrjService: ControlrjService
  ) {
    this.onInitFgRetencion();
  }

  async ngOnInit(): Promise<void> {
    this.spinner.show("spi_retencion");
    this.pbRetencion = true;

    this.lstTiposRetencion.push({ id: '0', nombre: 'Importe' });
    this.lstTiposRetencion.push({ id: '1', nombre: 'Porcentaje' });

    await this.cargarConceptos();
    await this.cargarTiposDeDocumento();
    await this.cargarBancos();
    await this.cargarMonedas();

    await this.cargarRetencion();

    this.pbRetencion = false;
    this.spinner.hide("spi_retencion");
  }

  async cargarRetencion() {
    this.pbRetencion = true;

    const retencionId = this.fromParent.retencionId;

    if (retencionId !== 0) {
      this.nuevaRetencion = false;

      const param = [];

      await this.controlrjService._loadSP(3, param).then((data: any) => {
        this.data = data;
        this.lstRetenciones = data;

        let lstRetencion: Array<IRetencion> = new Array();

        lstRetencion = this.data
          .filter(
            (value, index, arr) =>
              arr.findIndex((x) => x.demandado === value.demandado && x.beneficiario === value.beneficiario) === index
          );

        this.fgRetencion.get('T1_nIdRetencionj').setValue(retencionId);
        this.fgRetencion.get('T1_nIdPersonal').setValue(lstRetencion[0].personalId);

        this.demandado = lstRetencion[0].demandado;
        this.tieneDeposito = lstRetencion[0].tieneDeposito;
        this.urlSustento = lstRetencion[0].urlSustento;

        this.titulo = "Detalle de retencion - " + this.demandado;

        this.lstDetalleConceptos = new Array();

        this.data.forEach(element => {
          this.lstDetalleConceptos.push({ id: element.conceptoId, nombre: element.concepto });
        });

        if (lstRetencion.length > 0) {
          this.tieneSustento = true;

          this.fgRetencion.get('T1_nIdTipoDoc').setValue(lstRetencion[0].tipoDocumentoIdBeneficiario);
          this.fgRetencion.get('T1_sDocumento').setValue(lstRetencion[0].nroDocumentoBeneficiario);
          this.fgRetencion.get('T1_sNombres').setValue(lstRetencion[0].beneficiario);
          this.fgRetencion.get('T1_nIdBanco').setValue(lstRetencion[0].bancoId);
          this.fgRetencion.get('T1_sNroCuenta').setValue(lstRetencion[0].nroCuenta);
          this.fgRetencion.get('T1_sNroCuentaI').setValue(lstRetencion[0].nroCuentaI);
          this.fgRetencion.get('T1_nIdMoneda').setValue(lstRetencion[0].monedaId);

          this.fgRetencion.get('T1_dFechIni').setValue(lstRetencion[0].fechaInicio);
          this.fgRetencion.get('T1_dFechFin').setValue(lstRetencion[0].fechaTermino);
          this.fgRetencion.get('T1_bTipo').setValue(lstRetencion[0].tipoRetencionId);
          this.fgRetencion.get('T1_nMonto').setValue(lstRetencion[0].monto);

          const pdf = document.getElementById("pdf-sustento") as HTMLIFrameElement;
          pdf.src = lstRetencion[0].urlSustento;

          this.fgRetencion.get('T1_sFileSustento').setValue(lstRetencion[0].urlSustento);
        }
        else {
          this.tieneSustento = false;
        }
      });

      this.delay(250).then((any) => {
        this.tsRetencion = "active";
        this.abRetencion = this.fbEditarRetencion;
      });
    }
    else {
      this.nuevaRetencion = true;

      this.titulo = "Nueva retencion - " + this.fromParent.nombrePersona;
      this.fgRetencion.get('T1_nIdPersonal').setValue(this.fromParent.codigoPersona);

      this.delay(250).then((any) => {
        this.tsRetencion = "active";
        this.abRetencion = this.fbRegistrarRetencion;
      });
    }

    this.habilitarControles(this.nuevaRetencion);

    this.pbRetencion = false;
  }

  onInitFgRetencion() {

    this.fgRetencion = this.fb.group({
      T1_nIdRetencionj: [{ value: "0" }],
      T1_nIdPersonal: [{ value: "0" }],
      T1_sFileSustento: [{ value: "" }],
      T1_nIdTipoDoc: [
        { value: 0, disabled: true },
        [Validators.required, this.valid.noSelect],
      ],
      T1_sDocumento: [
        { value: "", disabled: true },
        [
          Validators.required,
          Validators.pattern("[0-9]*"),
          Validators.maxLength(11),
        ],
      ],
      T1_sNombres: [{ value: "", disabled: true }, [Validators.required, Validators.pattern('[a-zA-Z áéíóúÁÉÍÓÚñÑ]*')]],
      T1_nIdBanco: [
        { value: 0, disabled: true },
        [Validators.required, this.valid.noSelect],
      ],
      T1_sNroCuenta: [{ value: "", disabled: true }, [Validators.required]],
      T1_sNroCuentaI: [{ value: "", disabled: true }, [Validators.required]],
      T1_nIdMoneda: [
        { value: 0, disabled: true },
        [Validators.required, this.valid.noSelect],
      ],
      T1_dFechIni: [{ value: null }, [Validators.required]],
      T1_dFechFin: [{ value: null, disabled: true }],
      T1_bTipo: [
        { value: "", disabled: true },
        [Validators.required, this.valid.noSelect],
      ],
      T1_nMonto: [{ value: "", disabled: true }, [Validators.required, Validators.min(this.minNum), Validators.max(this.maxNum)]]
    });
  }

  get getRetencion() {
    return this.fgRetencion.controls;
  }

  onChangeConceptos() {
    this.cantidadSeleccionados = this.lstConceptos.filter(x => x.checked == true).length;
  }

  onChangeTipoRetencion() {
    // debugger

    const tipoRetencionId = this.fgRetencion.controls["T1_bTipo"].value;

    this.minNum = 0;

    if (tipoRetencionId == '0') {
      this.maxNum = 10000;
    }
    else {
      this.maxNum = 100;
    }
  }

  onToggleFab(stat: number) {
    // debugger
    stat = stat === -1 ? (this.abRetencion.length > 0 ? 0 : 1) : stat;
    this.tsRetencion = stat === 0 ? "inactive" : "active";
    this.abRetencion = stat === 0 ? [] : this.fbRegistrarRetencion;
  }

  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }

  async actualizarRetencion() {
    this.pbRetencion = true;

    if (this.fgRetencion.invalid) {
      Swal.fire(
        "No se puede actualizar",
        "Por favor, verificar que todos los campos se encuentren correctamente ingresados.",
        "error"
      );

      this.pbRetencion = false;

      return;
    }

    if (this.lstConceptos.filter(x => x.checked == true).length == 0) {
      Swal.fire(
        "No se puede guardar",
        "Debe de seleccionar un concepto como minimo.",
        "error"
      );

      this.pbRetencion = false;

      return;
    }

    this.aParam = [];

    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

    // New - 1 | Edit - 2
    let oModo: number = 2;
    this.fnGetParam(this.fgRetencion.controls, (oModo === 2) ? true : false);

    if (this.fileSustento !== undefined) {
      // Eliminar archivo de sustento anterior
      let sFileName = this.fgRetencion.controls['T1_sFileSustento'].value as string;

      //debugger

      if (sFileName != "") {
        sFileName = sFileName.split('/')[4];
        this.controlrjService._deleteFile(sFileName, 'application/pdf', 8);
      }


      // File Sustento
      const sFile = await this.getStringFromFile(this.fileSustento);
      const iFile = sFile.indexOf(',') + 1;
      const sFileSustento = sFile.substring(iFile, sFile.length);
      const UploadFile: any = await this.controlrjService._uploadFile(sFileSustento, 8, 'retencionJudicial', 'application/pdf');
      this.fgRetencion.controls['T1_sFileSustento'].setValue(UploadFile.fileUrl);
      this.aParam.push("T1¡sFileSustento!" + UploadFile.fileUrl);
    }

    if (this.aParam.length > 0) {

      const retencionId = this.fgRetencion.controls["T1_nIdRetencionj"].value;

      this.aParam.push("T1¡nIdRetencionj!" + retencionId);
      this.aParam.push("T1¡nIdModUser!" + uid);
      this.aParam.push("T1¡dtMod!GETDATE()");

      console.log(this.aParam.join('|'));

      const result = await this.controlrjService._crudRJ(2, this.aParam);

      if (result[0].split("!")[0] !== "00") {

        this.aParam = [];
        this.aParam.push("T1¡nIdRetencionj!" + retencionId);

        // debugger

        await this.controlrjService._crudRJ(5, this.aParam);

        this.lstConceptos.forEach(element => {
          if (element.checked) {
            this.aParam = [];
            this.aParam.push("T1¡nIdRetencionj!" + retencionId);
            this.aParam.push("T1¡nIdConcepto!" + element.id);

            this.controlrjService._crudRJ(4, this.aParam);
          }
        });

        Swal.fire(
          "Actualizacion satisfactoria",
          "La retencion ha sido actualizada correctamente.",
          "success"
        );

        this.delay(250).then((any) => {
          this.tsRetencion = "active";
          this.abRetencion = this.fbEditarRetencion;
        });

        this.habilitarControles(false);
        this.pbRetencion = false;
      }
      else {
        Swal.fire("Inconveniente", result[0].split("!")[1], "error");
        this.pbRetencion = false;
      }
    }
    else {
      this.snackBar.open('No se realizó ningún cambio.', 'Cerrar', {
        duration: 1000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });

      this.pbRetencion = false;

      return;
    }
  }

  fnGetParam(kControls: { [key: string]: AbstractControl }, bDirty?: boolean) {

    Object.keys(kControls).forEach(control => {
      const index = control.indexOf('_');
      let cTable = '', cColum = '', cValue = '', cDirty: boolean;
      if (index > 0) {

        switch (control.substring(0, 1)) {

          case 'A':
            const aControl = kControls[control].value;
            cTable = 'T' + control.substring(1, index);
            cDirty = kControls[control].dirty;

            if (aControl !== undefined) {
              Object.keys(aControl).forEach(eSub => {
                const iSub = eSub.indexOf('_');
                if (iSub > 0) {
                  cColum = eSub.substring(0, iSub);
                  cValue = aControl[eSub];

                  if (bDirty === undefined) {
                    this.aParam.push(cTable + '¡' + cColum + '!' + cValue);
                  } else {
                    if (cDirty === true) {
                      this.aParam.push(cTable + '¡' + cColum + '!' + cValue);
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

            if (kControls[control].value !== null && kControls[control].value !== undefined) {

              // tslint:disable-next-line: max-line-length
              cValue = (cColum.substring(0, 1) === 'd') ? moment(new Date(kControls[control].value)).format('MM/DD/YYYY') : kControls[control].value;

              if (bDirty === undefined) {
                this.aParam.push(cTable + '¡' + cColum + '!' + cValue);
              } else {
                if (cDirty === true) {
                  this.aParam.push(cTable + '¡' + cColum + '!' + cValue);
                }
              }
            }
            break;
        }

      }
    });
  }

  async registrarRetencion() {
    this.pbRetencion = true;

    if (this.fgRetencion.invalid) {
      Swal.fire(
        "No se puede guardar",
        "Por favor, verificar que todos los campos se encuentren correctamente ingresados.",
        "error"
      );

      this.pbRetencion = false;

      return;
    }

    if (this.lstConceptos.filter(x => x.checked == true).length == 0) {
      Swal.fire(
        "No se puede guardar",
        "Debe de seleccionar un concepto como minimo.",
        "error"
      );

      this.pbRetencion = false;

      return;
    }

    // Usuario y Fecha con hora
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

    this.aParam = [];

    //debugger

    const nIdPersonal = this.fgRetencion.controls["T1_nIdPersonal"].value;
    const dFechIni = this.fgRetencion.controls["T1_dFechIni"].value;
    const bTipo = this.fgRetencion.controls["T1_bTipo"].value;
    const nMonto = this.fgRetencion.controls["T1_nMonto"].value;
    const nIdTipoDoc = this.fgRetencion.controls["T1_nIdTipoDoc"].value;
    const sDocumento = this.fgRetencion.controls["T1_sDocumento"].value;
    const sNombres = this.fgRetencion.controls["T1_sNombres"].value;
    const nIdBanco = this.fgRetencion.controls["T1_nIdBanco"].value;
    const sNroCuenta = this.fgRetencion.controls["T1_sNroCuenta"].value;
    const sNroCuentaI = this.fgRetencion.controls["T1_sNroCuentaI"].value;
    const nIdMoneda = this.fgRetencion.controls["T1_nIdMoneda"].value;

    if (this.fileSustento !== undefined) {
      // File Sustento
      const sFile = await this.getStringFromFile(this.fileSustento);
      const iFile = sFile.indexOf(',') + 1;
      const sFileSustento = sFile.substring(iFile, sFile.length);
      const UploadFile: any = await this.controlrjService._uploadFile(sFileSustento, 8, 'retencionJudicial', 'application/pdf');
      this.fgRetencion.controls['T1_sFileSustento'].setValue(UploadFile.fileUrl);
      this.aParam.push("T1¡sFileSustento!" + UploadFile.fileUrl);
    }
    else {
      this.aParam.push("T1¡sFileSustento!");
    }

    this.aParam.push("T1¡nIdPersonal!" + nIdPersonal);
    this.aParam.push("T1¡dFechIni!" + moment(dFechIni).format("YYYY-MM-DD"));
    this.aParam.push("T1¡bTipo!" + bTipo);
    this.aParam.push("T1¡nMonto!" + nMonto);
    this.aParam.push("T1¡nIdTipoDoc!" + nIdTipoDoc);
    this.aParam.push("T1¡sDocumento!" + sDocumento);
    this.aParam.push("T1¡sApePa!-");
    this.aParam.push("T1¡sApeMa!-");
    this.aParam.push("T1¡sPriNom!-");
    this.aParam.push("T1¡sSegNom!-");
    this.aParam.push("T1¡sNombres!" + sNombres);
    this.aParam.push("T1¡nIdBanco!" + nIdBanco);
    this.aParam.push("T1¡sNroCuenta!" + sNroCuenta);
    this.aParam.push("T1¡sNroCuentaI!" + sNroCuentaI);
    this.aParam.push("T1¡nIdMoneda!" + nIdMoneda);

    this.aParam.push("T0¡nIdRegUser!" + uid);
    this.aParam.push("T0¡dtReg!GETDATE()");

    //debugger

    console.log(this.aParam.join('|'));

    const result = await this.controlrjService._crudRJ(1, this.aParam);

    if (result[0].split("!")[0] !== "00") {
      const retencionId = result[0].split("!")[1];
      this.fgRetencion.get("T1_nIdRetencionj").setValue(retencionId);

      //debugger

      this.lstConceptos.forEach(element => {
        if (element.checked) {
          this.aParam = [];
          this.aParam.push("T1¡nIdRetencionj!" + retencionId);
          this.aParam.push("T1¡nIdConcepto!" + element.id);

          this.controlrjService._crudRJ(4, this.aParam);
        }
      });

      Swal.fire(
        "Registro satisfactorio",
        "La retencion ha sido registrada correctamente.",
        "success"
      );

      this.delay(250).then((any) => {
        this.tsRetencion = "active";
        this.abRetencion = this.fbEditarRetencion;
      });

      this.habilitarControles(false);
    } else {
      Swal.fire("Inconveniente", result[0].split("!")[1], "error");
    }

    this.pbRetencion = false;
  }

  habilitarControles(habilitar: boolean) {
    if (habilitar) {
      this.fgRetencion.controls["T1_nIdTipoDoc"].enable();
      this.fgRetencion.controls["T1_sDocumento"].enable();
      this.fgRetencion.controls["T1_sNombres"].enable();
      this.fgRetencion.controls["T1_nIdBanco"].enable();
      this.fgRetencion.controls["T1_sNroCuenta"].enable();
      this.fgRetencion.controls["T1_sNroCuentaI"].enable();
      this.fgRetencion.controls["T1_nIdMoneda"].enable();
      this.fgRetencion.controls["T1_dFechIni"].enable();
      this.fgRetencion.controls["T1_dFechFin"].enable();
      this.fgRetencion.controls["T1_bTipo"].enable();
      this.fgRetencion.controls["T1_nMonto"].enable();
    } else {
      this.fgRetencion.controls["T1_nIdTipoDoc"].disable();
      this.fgRetencion.controls["T1_sDocumento"].disable();
      this.fgRetencion.controls["T1_sNombres"].disable();
      this.fgRetencion.controls["T1_nIdBanco"].disable();
      this.fgRetencion.controls["T1_sNroCuenta"].disable();
      this.fgRetencion.controls["T1_sNroCuentaI"].disable();
      this.fgRetencion.controls["T1_nIdMoneda"].disable();
      this.fgRetencion.controls["T1_dFechIni"].disable();
      this.fgRetencion.controls["T1_dFechFin"].disable();
      this.fgRetencion.controls["T1_bTipo"].disable();
      this.fgRetencion.controls["T1_nMonto"].disable();
    }
  }

  async eliminarRetencion() {
    this.pbRetencion = true;

    if (this.tieneDeposito === "Si") {
      Swal.fire("No se puede eliminar", "La retencion tiene depositos.", "error");
      this.pbRetencion = false;

      return;
    }

    Swal.fire({
      title: 'Confirmar eliminacion de retencion',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Aceptar`,
      cancelButtonText: `Cancelar`
    }).then((result) => {
      if (result.isConfirmed) {
        const retencionId = this.fgRetencion.controls["T1_nIdRetencionj"].value;
        this.eliminarRetencion2(retencionId);

      }
    })

    this.pbRetencion = false;
  }

  async eliminarRetencion2(retencionId: string) {
    // debugger

    const param = [];
    param.push("T1¡nIdRetencionj!" + retencionId);

    const result = await this.controlrjService._crudRJ(5, param);

    if (result[0].split("!")[0] !== "00") {

      await this.controlrjService._crudRJ(3, param);

      // Elimina archivo de sustento de la retencion
      let sFileName = this.fgRetencion.controls['T1_sFileSustento'].value as string;
      sFileName = sFileName.split('/')[4];
      this.controlrjService._deleteFile(sFileName, 'application/pdf', 8);

      Swal.fire(
        "Eliminación satisfactoria",
        "La retención ha sido eliminada correctamente.",
        "success"
      );

      this.activeModal.close();
    } else {
      Swal.fire("Inconveniente", result[0].split("!")[1], "error");
    }
  }

  async onClickMenuRetencion(index: number, tool: string) {
    switch (tool) {
      case "Guardar":
        const retencionId = this.fgRetencion.controls["T1_nIdRetencionj"].value;

        if (retencionId.value !== "" && retencionId.value != 0) {
          await this.actualizarRetencion();
        } else {
          await this.registrarRetencion();
        }

        await this.cargarRetencion();

        break;

      case "Editar":
        this.seleccionarConceptos = true;

        this.habilitarControles(true);

        this.lstConceptos.forEach(x => {
          this.lstDetalleConceptos.forEach(y => {
            if (x.id === y.id) {
              x.checked = true;
            }
          });
        });

        this.cantidadSeleccionados = this.lstConceptos.filter(x => x.checked == true).length;

        this.fbRegistrarRetencion[1].icon = 'change_circle';
        this.fbRegistrarRetencion[1].tool = 'Reemplazar sustento';

        this.delay(250).then((any) => {
          this.tsRetencion = "active";
          this.abRetencion = this.fbRegistrarRetencion;
        });

        break;

      case "Cargar sustento":
      case "Reemplazar sustento":

        (function ($) {
          $('#uploadFile').click();
        })(jQuery);

        break;

      case "Cancelar":
        // debugger
        this.seleccionarConceptos = false;
        await this.cargarRetencion();
        //this.activeModal.close();
        break;

      case "Eliminar":
        this.eliminarRetencion();
        break;

      default:
        break;
    }
  }

  async cargarTiposDeDocumento() {
    this.pbRetencion = true;

    await this.controlrjService._loadSP(4, []).then((data: Array<ITipoDocumento>) => {
      this.lstTiposDocumento = data;
    });

    this.pbRetencion = false;
  }

  async cargarBancos() {
    this.pbRetencion = true;

    await this.controlrjService._loadSP(5, []).then((data: Array<IBanco>) => {
      this.lstBancos = data;
    });

    this.pbRetencion = false;
  }

  async cargarMonedas() {
    this.pbRetencion = true;

    await this.controlrjService._loadSP(6, []).then((data: Array<IMoneda>) => {
      this.lstMonedas = data;
    });

    this.pbRetencion = false;
  }

  async cargarConceptos() {
    this.pbRetencion = true;

    await this.controlrjService._loadSP(2, []).then((data: Array<IConcepto>) => {
      this.lstConceptos = data;
    });

    this.pbRetencion = false;
  }

  uploadFile(event) {
    if (event.target.files[0]) {

      this.fileSustento = event.target.files[0];

    }
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

}
