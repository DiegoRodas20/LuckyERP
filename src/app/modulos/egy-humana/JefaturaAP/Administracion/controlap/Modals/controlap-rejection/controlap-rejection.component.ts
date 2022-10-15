import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import { adminpAnimations } from "../../../../Animations/adminp.animations";
import { ControlapService } from "../../../../Services/controlap.service";
import * as moment from "moment";
import { Moment } from "moment";
import { MatDatepicker } from "@angular/material/datepicker";
import Swal from "sweetalert2";
import { IEstadoRutaCombo, IRejectionRuta } from "../../../../Model/Icontrolap";

@Component({
  selector: "app-controlap-rejection",
  templateUrl: "./controlap-rejection.component.html",
  styleUrls: [
    "./controlap-rejection.component.css",
    "./controlap-rejection.component.scss",
  ],
  animations: [adminpAnimations],
})
export class ControlapRejectionComponent implements OnInit {
  @Input() fromParent;

  //#region Variables

  // Progress Bar
  pbReject: boolean;

  // FormGroup
  fgReject: FormGroup = this.fb.group({
    sNombres: "",
    sResponsable: "",
    sCliente: "",
    dFecha: null,
    nIdEstado: 2329,
  });

  // ComboBox
  cboEstado: IEstadoRutaCombo[] = [];

  // Mat Table
  RejectDC: string[] = [
    "sNombres",
    "dFecha",
    "sResponsable",
    "sCliente",
    "sEstado",
    "more",
  ];
  RejectDS: MatTableDataSource<IRejectionRuta> = new MatTableDataSource([]);
  @ViewChild("mtReject") mtReject: MatTable<any>;
  @ViewChild("pagReject", { static: true }) pagReject: MatPaginator;
  expandedMore = null;

  // Parent
  dFecha: Date;

  // Modal Close
  mClose = 0;

  //#endregion

  constructor(
    public activeModal: NgbActiveModal,
    private spi: NgxSpinnerService,
    public service: ControlapService,
    private fb: FormBuilder
  ) {}

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_reject");

    await this.cboGetEstado();
    await this.loadReject();

    this.dFecha = this.fromParent.dFechDevengue;
    this.fgReject.controls["dFecha"].setValue(moment(this.dFecha));
    this.filtroReject();
    this.spi.hide("spi_reject");
  }

  //#region GENERAL
  private async confirmAlert(sTitle: string): Promise<boolean> {
    const res = await Swal.fire({
      title: "¿ Estas seguro de " + sTitle + " la desestimación ?",
      text: "La actualización forma parte de la asistencia del personal.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ff4081",
      confirmButtonText: "Confirmar !",
      allowOutsideClick: false,
    });
    return res.isConfirmed;
  }
  //#endregion

  //#region Combobox

  async cboGetEstado() {
    const param = [];
    param.push("0¡nEleCodDad!2326");
    param.push("10¡nEleCod!2329");
    this.cboEstado = await this.service._loadSP(7, param);
  }

  //#endregion

  //#region Load

  async loadReject() {
    const param = [];
    param.push("10¡RUTA.nIdEstado!2329");

    const data = await this.service._loadSP(15, param);
    this.RejectDS = new MatTableDataSource(data);
    this.RejectDS.paginator = this.pagReject;

    this.filtroReject();
  }

  public filtroReject() {
    this.RejectDS.filterPredicate = ((data: any, filter: any) => {
      const a =
        !filter.sNombres ||
        data.sNombres.toLowerCase().includes(filter.sNombres.toLowerCase());

      const b =
        !filter.sResponsable ||
        data.sResponsable
          .toLowerCase()
          .includes(filter.sResponsable.toLowerCase());

      const c =
        !filter.sCliente ||
        data.sCliente.toLowerCase().includes(filter.sCliente.toLowerCase());

      const d =
        !filter.dFecha ||
        moment(filter.dFecha).format("YYYYMM") ===
          moment(data.dFecha).format("YYYYMM");

      const e = !filter.nIdEstado || data.nIdEstado === filter.nIdEstado;

      return a && b && c && d && e;
    }) as (IRejectionRuta, string) => boolean;

    this.RejectDS.filter = this.fgReject.value;

    if (this.RejectDS.paginator) {
      this.RejectDS.paginator.firstPage();
    }
  }

  public async confirmarDesestimacion(item: IRejectionRuta) {
    if (!(await this.confirmAlert("confirmar"))) return;

    this.updateDetP(2330, item.nIdRuta, "Estado confirmada");
  }

  public async invalidarDesestimacion(item: IRejectionRuta) {
    if (!(await this.confirmAlert("invalidar"))) return;

    this.updateDetP(2331, item.nIdRuta, "Estado invalidado");
  }

  async updateDetP(nIdEstado: number, nIdRuta: number, sText: string) {
    // Usuario y Fecha con Hora
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

    const param = [];
    param.push("T1¡nIdRuta!" + nIdRuta);
    param.push("T1¡nIdUser!" + uid);
    param.push("T1¡dtReg!GETDATE()");
    param.push("T1¡nIdEstado!" + nIdEstado);
    param.push("T1¡sTexto!" + sText);

    param.push("W2¡nIdRuta!" + nIdRuta);
    param.push("S2¡nIdEstado!" + nIdEstado);

    this.pbReject = true;
    const result = await this.service._crudCA(2, param);
    const { ftitle, ftext, ftype } = this.analizandoRespuestaServicio(result);
    Swal.fire(ftitle, ftext, ftype !== "error" ? "success" : "error");

    // Actualizar tabla
    if (ftype !== "error") {
      const aReject = this.RejectDS.data;
      const iEstado = this.cboEstado.findIndex((x) => x.nEleCod === nIdEstado);
      const iArray = aReject.findIndex((x) => x.nIdRuta === nIdRuta);
      aReject[iArray].nIdEstado = nIdEstado;
      aReject[iArray].sEstado = this.cboEstado[iEstado].cEleNam;

      this.RejectDS = new MatTableDataSource(aReject);
      this.mtReject.renderRows();
      this.expandedMore = null;
      this.mClose = this.mClose + 1;
    }

    this.pbReject = false;
  }

  private analizandoRespuestaServicio(result: any): any {
    var aResult = new Array();
    let ftitle = "";
    let ftext = "";
    let ftype = "";

    Object.keys(result).forEach((valor) => {
      aResult.push(result[valor]);
    });

    for (const e of aResult) {
      const iResult = aResult.indexOf(e);
      if (e.split("!")[0] !== "00") {
        if (iResult === 0) {
          ftitle = "Actualización satisfactoria";
          ftext = "Punto de asistencia actualizado";
          ftype = "success";
        }
      } else {
        ftitle = "Inconveniente";
        ftext = e.split("!")[1];
        ftype = "error";
        break;
      }
    }

    return { ftitle, ftext, ftype };
  }

  closeReject() {
    const oReturn = new Object();
    oReturn["modal"] = "reject";
    oReturn["value"] = this.mClose > 0 ? "loadAgain" : "";
    this.activeModal.close(oReturn);
  }

  //#endregion

  //#region FormGroup

  new_fgReject() {
    this.fgReject = this.fb.group({
      sNombres: "",
      sResponsable: "",
      sCliente: "",
      dFecha: null,
      nIdEstado: 2329,
    });

    this.fgReject.valueChanges.subscribe((value) => {
      const filter = {
        ...value,
        name: value.sNombres.trim().toLowerCase(),
      } as string;
      this.RejectDS.filter = filter;

      if (this.RejectDS.paginator) {
        this.RejectDS.paginator.firstPage();
      }

      this.expandedMore = null;
    });
  }

  get getReject() {
    return this.fgReject.controls;
  }

  //#endregion

  //#region Extra

  chosenYearHandler(normalizedYear: moment.Moment) {
    let ctrlValue = this.fgReject.controls["dFecha"].value;
    ctrlValue = ctrlValue === null ? moment() : ctrlValue;
    ctrlValue.year(normalizedYear.year());
    this.fgReject.controls["dFecha"].setValue(ctrlValue);
  }

  chosenMonthHandler(
    normalizedMonth: Moment,
    datepicker: MatDatepicker<Moment>
  ) {
    let ctrlValue = this.fgReject.controls["dFecha"].value;
    ctrlValue = ctrlValue === null ? moment() : ctrlValue;
    ctrlValue.month(moment(normalizedMonth).month());
    this.fgReject.controls["dFecha"].setValue(ctrlValue);
    this.filtroReject();
    datepicker.close();
  }

  MomentDate(pushParam: any) {
    moment.locale("es");
    const tDate = moment(pushParam).format("MMMM [del] YYYY");
    return tDate[0].toUpperCase() + tDate.substr(1).toLowerCase();
  }

  //#endregion
}
