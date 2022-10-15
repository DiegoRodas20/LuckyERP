import { Component, OnInit, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import moment, { Moment } from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { IAnio, IDeposito, IEstado } from '../../../../Model/Icontrolrj';
import { ControlrjService } from '../../../../Services/controlrj.service';
import { ControlrjDetalleComponent } from '../controlrj-detalle/controlrj-detalle.component';
import { ControlrjRegistrardComponent } from '../controlrj-registrard/controlrj-registrard.component';

// Modals
const MODALS: { [name: string]: Type<any> } = {
  detalle: ControlrjDetalleComponent,
  registrard: ControlrjRegistrardComponent
};

@Component({
  selector: 'app-controlrj-generard',
  templateUrl: './controlrj-generard.component.html',
  styleUrls: ['./controlrj-generard.component.css'],
  animations: [adminpAnimations]
})
export class ControlrjGenerardComponent implements OnInit {

  tieneDeposito: Boolean = false;

  fbMain = [
    { icon: 'settings_brightness', tool: 'Generar depósitos' }
  ];
  abMain = [];
  tsMain = "inactive";

  data: Array<IDeposito> = new Array();
  lstDepositos: Array<IDeposito> = new Array();
  lstDetalleDepositos: Array<IDeposito> = new Array();

  aParam = [];

  retencionId: number = 0;

  devengueId: string = "";
  devengue: string = "";

  // Mat Table
  searchBC: string[] = [
    "action", "devengue", "fechaDeposito", "importe", "cancel", "more"
  ];
  searchBS: MatTableDataSource<IDeposito>;
  @ViewChild("searchB", { static: true }) searchB: MatPaginator;
  @ViewChild(MatSort, { static: true }) tableSortB: MatSort;

  ExpandedDC: string[] = ["action", "trabajador", "tipoRetencion", "beneficiario", "importe"];
  ExpandedDS: MatTableDataSource<IDeposito> = new MatTableDataSource(
    []
  );

  expandedMore = null;

  // FormGroup
  fgFilter: FormGroup;

  // Progress Bar
  pbRetencion: boolean;

  lstAnios: Array<IAnio> = new Array();
  lstEstados: Array<IEstado> = new Array();

  // Modal Config
  ngbModalOptions: NgbModalOptions = {
    size: 'xl',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };

  constructor(
    public activeModal: NgbActiveModal,
    private _modalService: NgbModal,
    private controlrjService: ControlrjService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private _snackBar: MatSnackBar
  ) {
    this.expandedMore = null;

    this.searchBS = new MatTableDataSource();
    this.onInitFgRetencion();
  }

  async ngOnInit(): Promise<void> {
    this.spinner.show("spi_retencion");
    this.pbRetencion = true;

    this.ExpandedDS = new MatTableDataSource();

    //const fechaDevengue = this.data[0].fechaDevengue;
    //this.fgFilter.controls['fechaDevengue'].setValue(moment(fechaDevengue));

    await this.cargarEstados();
    await this.cargarDepositos();

    this.onVisualizarDeposito(this.data[0]);

    // const anio = this.data[0].anio;

    // this.fgFilter.get("anio").setValue(anio);
    // this.onChangeAnio(anio);

    // debugger

    this.pbRetencion = false;
    this.spinner.hide("spi_retencion");

  }

  onInitFgRetencion() {

    this.fgFilter = this.fb.group({
      // anio: "",
      // mes: "",
      fechaDevengue: null,
      estado: "",
      trabajador: "",
      beneficiario: ""
    });

    this.fgFilter.valueChanges.subscribe((value) => {
      const filter = { ...value, name: value.mes } as string;

      this.searchBS.filter = filter;

      if (this.searchBS.paginator) {
        this.searchBS.paginator.firstPage();
      }
    });

  }

  chosenYearHandler(normalizedYear: moment.Moment) {
    let ctrlValue = this.fgFilter.controls['fechaDevengue'].value;
    ctrlValue = (ctrlValue === null) ? moment() : ctrlValue;
    ctrlValue.year(normalizedYear.year());
    this.fgFilter.controls['fechaDevengue'].setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    let ctrlValue = this.fgFilter.controls['fechaDevengue'].value;
    ctrlValue = (ctrlValue === null) ? moment() : ctrlValue;
    ctrlValue.month(moment(normalizedMonth).month());
    this.fgFilter.controls['fechaDevengue'].setValue(ctrlValue);
    datepicker.close();
  }

  openModal(name: string) {

    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);

    const obj = new Object();

    switch (name) {
      case 'detalle':
        obj['retencionId'] = this.retencionId;

        modalRef.componentInstance.fromParent = obj;
        break;
      case 'registrard':
        obj['devengueId'] = this.devengueId;
        obj['devengue'] = this.devengue;

        modalRef.componentInstance.fromParent = obj;
        break;
    }

  }

  async cargarEstados() {
    this.pbRetencion = true;

    await this.controlrjService._loadSP(10, []).then((data: Array<IEstado>) => {
      this.lstEstados = data;
    });

    this.pbRetencion = false;
  }

  async cargarDepositos() {
    this.pbRetencion = true;

    const param = [];

    await this.controlrjService._loadSP(8, param).then((data: any) => {
      this.data = data;
      this.lstDepositos = data;

      let lstBeneficiario: Array<IDeposito> = new Array();

      lstBeneficiario = this.data
        .filter(
          (value, index, arr) =>
            arr.findIndex((x) => x.retencionId === value.retencionId) === index
        );

      this.devengue = lstBeneficiario[0].devengue;
      this.devengueId = lstBeneficiario[0].devengueId;

      this.searchBS = new MatTableDataSource(lstBeneficiario);
      this.searchBS.paginator = this.searchB;
      this.searchBS.sort = this.tableSortB;

      this.lstAnios = new Array();

      let lstAniosUnicos: Array<IDeposito> = new Array();

      lstAniosUnicos = this.data
        .filter(
          (value, index, arr) =>
            arr.findIndex((x) => x.anio === value.anio) === index
        );

      lstAniosUnicos.forEach((elem) => {
        this.lstAnios.push({
          id: elem.anio,
          nombre: elem.anio
        });
      });
    });

    this.searchBS.filterPredicate = function (
      data: IDeposito,
      filter: string
    ): boolean {
      return data.mes.trim().toLowerCase().includes(filter);
    };

    this.searchBS.filterPredicate = ((
      data: IDeposito,
      filter: IDeposito
    ) => {
      // tslint:disable-next-line: max-line-length
      const a = !filter.fechaDevengue || moment(filter.fechaDevengue).format('YYYYMM') === moment(data.fechaDevengue).format('YYYYMM');
      //const b = !filter.mes || data.mes.toLowerCase().includes(filter.mes);
      const c = !filter.trabajador || data.trabajador.toLowerCase().includes(filter.trabajador) || data.nroDocumentoTrabajador.toLowerCase().includes(filter.trabajador);
      const d = !filter.beneficiario || data.beneficiario.toLowerCase().includes(filter.beneficiario) || data.nroDocumentoBeneficiario.toLowerCase().includes(filter.beneficiario);
      const e = !filter.estado || data.estado.toLowerCase().includes(filter.estado);

      return a && c && d && e;
    }) as (PeriodicElement, string) => boolean;

    this.pbRetencion = false;
  }

  get getFilter() {
    return this.fgFilter.controls;
  }

  onVisualizarDeposito(element: IDeposito) {
    this.pbRetencion = true;

    if (element.urlSustento != '') {
      this.tieneDeposito = true;

      this.devengue = element.devengue;

      const pdf = document.getElementById("pdf-deposito") as HTMLIFrameElement;
      pdf.src = element.urlSustento;
    }
    else {
      this.tieneDeposito = false;
      this.devengue = "";
    }

    this.pbRetencion = false;
  }

  onVisualizarRetencion(element: IDeposito) {
    this.ngbModalOptions.size = 'xl';
    this.retencionId = element.retencionId;
    this.openModal('detalle');
  }

  onToggleFab(stat: number) {
    // debugger
    stat = stat === -1 ? (this.abMain.length > 0 ? 0 : 1) : stat;
    this.tsMain = stat === 0 ? "inactive" : "active";
    this.abMain = stat === 0 ? [] : this.fbMain;
  }

  async cancelarDeposito(element: IDeposito) {
    // Usuario y Fecha con hora
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

    this.aParam = [];

    this.aParam.push("T1¡nIdFK!" + element.depositoId);
    this.aParam.push("T1¡nIdEstado!2359");
    this.aParam.push("T1¡nIdModUser!" + uid);
    this.aParam.push("T1¡dtMod!GETDATE()");

    // debugger

    const result = await this.controlrjService._crudRJ(10, this.aParam);

    if (result[0].split("!")[0] !== "00") {
      this._snackBar.open('El deposito ha sido cancelado correctamente.', 'Cerrar', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
    }
  }

  async cancelar(element: IDeposito) {
    // debugger

    Swal.fire({
      title: 'Información',
      text: '¿Esta seguro de cancelar el deposito?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Aceptar`,
      cancelButtonText: `Cancelar`
    }).then((result) => {
      if (result.isConfirmed) {

        this.pbRetencion = true;

        // debugger

        this.cancelarDeposito(element);

        this.pbRetencion = false;
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
        this._snackBar.open('Acción cancelada por el usuario.', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      }
    })
  }

  async generarDepositos() {

    // if (this.lstRetencionesAgrupadas.length == 0) {
    //   Swal.fire("Error:", "No existen retenciones vigentes para generar depositos.", "error");
    //   return;
    // }

    Swal.fire({
      title: 'Información',
      text: '¿Desea generar registros de deposito?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Aceptar`,
      cancelButtonText: `Cancelar`
    }).then((result) => {
      if (result.isConfirmed) {

        this.pbRetencion = true;

        this.registrarDeposito();

        this.pbRetencion = false;
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
        this._snackBar.open('Acción cancelada por el usuario.', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      }
    })
  }

  async onClickMenu(tool: string) {
    switch (tool) {
      case "Generar depósitos":
        //await this.generarDepositos();
        this.ngbModalOptions.size = 'lg';
        this.openModal('registrard');

        break;

      default:
        break;
    }
  }

  // onChangeAnio(anio: string) {
  //   debugger

  //   this.pbRetencion = true;

  //   let lstBeneficiario: Array<IDeposito> = new Array();

  //   lstBeneficiario = this.data.filter(x => x.anio === anio)
  //     .filter(
  //       (value, index, arr) =>
  //         arr.findIndex((x) => x.retencionId === value.retencionId) === index
  //     );

  //   this.searchBS = new MatTableDataSource(lstBeneficiario);
  //   this.searchBS.paginator = this.searchB;
  //   this.searchBS.sort = this.tableSortB;

  //   this.searchBS.filterPredicate = function (
  //     data: IDeposito,
  //     filter: string
  //   ): boolean {
  //     return data.mes.trim().toLowerCase().includes(filter);
  //   };

  //   this.searchBS.filterPredicate = ((
  //     data: IDeposito,
  //     filter: IDeposito
  //   ) => {
  //     // tslint:disable-next-line: max-line-length
  //     const a = !filter.fechaDevengue || moment(filter.fechaDevengue).format('YYYYMM') === moment(data.fechaDevengue).format('YYYYMM');
  //     // const a = !filter.anio || data.anio.toLowerCase().includes(filter.anio);
  //     // const b = !filter.mes || data.mes.toLowerCase().includes(filter.mes);
  //     const c = !filter.trabajador || data.trabajador.toLowerCase().includes(filter.trabajador) || data.nroDocumentoTrabajador.toLowerCase().includes(filter.trabajador);
  //     const d = !filter.beneficiario || data.beneficiario.toLowerCase().includes(filter.beneficiario) || data.nroDocumentoBeneficiario.toLowerCase().includes(filter.beneficiario);
  //     const e = !filter.estado || data.estado.toLowerCase().includes(filter.estado);

  //     return a && c && d && e;
  //   }) as (PeriodicElement, string) => boolean;

  //   this.pbRetencion = false;
  // }

  onChangeEstado(estadoId: string) {
    // debugger

    this.pbRetencion = true;

    let lstBeneficiario: Array<IDeposito> = new Array();

    lstBeneficiario = this.data.filter(x => x.estadoId === estadoId)
      .filter(
        (value, index, arr) =>
          arr.findIndex((x) => x.retencionId === value.retencionId) === index
      );

    this.searchBS = new MatTableDataSource(lstBeneficiario);
    this.searchBS.paginator = this.searchB;
    this.searchBS.sort = this.tableSortB;

    this.searchBS.filterPredicate = function (
      data: IDeposito,
      filter: string
    ): boolean {
      return data.mes.trim().toLowerCase().includes(filter);
    };

    this.searchBS.filterPredicate = ((
      data: IDeposito,
      filter: IDeposito
    ) => {
      // tslint:disable-next-line: max-line-length
      const a = !filter.fechaDevengue || moment(filter.fechaDevengue).format('YYYYMM') === moment(data.fechaDevengue).format('YYYYMM');
      //const b = !filter.mes || data.mes.toLowerCase().includes(filter.mes);
      const c = !filter.trabajador || data.trabajador.toLowerCase().includes(filter.trabajador) || data.nroDocumentoTrabajador.toLowerCase().includes(filter.trabajador);
      const d = !filter.beneficiario || data.beneficiario.toLowerCase().includes(filter.beneficiario) || data.nroDocumentoBeneficiario.toLowerCase().includes(filter.beneficiario);
      const e = !filter.estado || data.estado.toLowerCase().includes(filter.estado);

      return a && c && d && e;
    }) as (PeriodicElement, string) => boolean;

    this.pbRetencion = false;
  }

  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }

  // async calcularImporte(personalId: string) {
  //   debugger

  //   let importe: number = 0;

  //   let lstConceptosPorPersona: Array<IConceptosPorPersona> = new Array();

  //   const param = [];
  //   param.push("T1¡nIdPersonal!" + personalId);

  //   await this.controlrjService._loadSP(9, param).then((data: any) => {
  //     lstConceptosPorPersona = data;
  //   });

  //   this.lstRetenciones.filter(x => x.personalId == personalId).forEach(element => {
  //     lstConceptosPorPersona.filter(x => x.conceptoId == element.conceptoId).forEach(concepto => {

  //       if (element.tipoRetencionId == '0') { // Importe
  //         importe = + element.monto;
  //       }

  //       if (element.tipoRetencionId == '1') { // Porcentaje
  //         importe = +  concepto.importe * ((element.monto) / 100);
  //       }
  //     });
  //   });

  //   return importe;
  // }


  async registrarDeposito() {
    // Usuario y Fecha con hora
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

    this.aParam = [];

    this.aParam.push("T0¡nIdRegUser!" + uid);
    this.aParam.push("T0¡dtReg!GETDATE()");

    this.aParam.push("T1¡nIdDevengue!7");

    // debugger

    const result = await this.controlrjService._crudRJ(6, this.aParam);

    let lstBeneficiario: Array<IDeposito> = new Array();

    lstBeneficiario = this.data
      .filter(
        (value, index, arr) =>
          arr.findIndex((x) => x.retencionId === value.retencionId) === index
      );

    if (result[0].split("!")[0] !== "00") {
      const depositoId = result[0].split("!")[1];

      for (let index = 0; index < lstBeneficiario.length; index++) {
        const element = lstBeneficiario[index];

        const importe = 0;//this.calcularImporte(element.personalId);

        this.aParam = [];
        this.aParam.push("T1¡nIdDRJ!" + depositoId);
        this.aParam.push("T1¡nIdRetencionj!" + element.retencionId);
        this.aParam.push("T1¡nImporte!" + importe);

        const result2 = await this.controlrjService._crudRJ(7, this.aParam);
      }

      this.aParam = [];

      this.aParam.push("T1¡nIdFK!" + depositoId);
      this.aParam.push("T1¡nIdDireccion!1128");
      this.aParam.push("T1¡nIdArea!1137");
      this.aParam.push("T1¡nIdTipoDeposito!1375");
      this.aParam.push("T1¡sFileSustento!-");
      this.aParam.push("T1¡nIdEstado!2357");
      this.aParam.push("T0¡nIdRegUser!" + uid);
      this.aParam.push("T0¡dtReg!GETDATE()");

      const result3 = await this.controlrjService._crudRJ(8, this.aParam);

      if (result[0].split("!")[0] !== "00") {
        this._snackBar.open('Depositos generados correctamente.', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      }
    } else {
      Swal.fire("Inconveniente", result[0].split("!")[1], "error");
    }
  }

  async onClickExpanded(row: IDeposito) {

    if (this.expandedMore === row) {
      this.expandedMore = null;
      this.ExpandedDS = new MatTableDataSource([]);
    } else {

      // debugger

      this.lstDetalleDepositos = new Array();

      this.lstDetalleDepositos = this.data
        .filter(x => x.depositoId == row.depositoId)
        .filter(
          (value, index, arr) =>
            arr.findIndex((x) => x.trabajador === value.trabajador && x.beneficiario === value.beneficiario) === index
        );

      this.ExpandedDS = new MatTableDataSource(this.lstDetalleDepositos);

      this.expandedMore = row;
    }
  }

}
