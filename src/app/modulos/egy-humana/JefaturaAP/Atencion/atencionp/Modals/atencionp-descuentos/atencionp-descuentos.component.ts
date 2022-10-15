import { Component, Input, OnInit, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from "@angular/material/table";
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { nsAtencionp } from '../../../../Model/Iatencionp';
import { AtencionpService } from '../../../../Services/atencionp.service';
//import { AtencionpRemuneracionesComponent } from '../atencionp-remuneraciones/atencionp-remuneraciones.component';

// Modals
//const MODALS: { [name: string]: Type<any> } = {
//remuneraciones: AtencionpRemuneracionesComponent
//};

@Component({
  selector: 'app-atencionp-descuentos',
  templateUrl: './atencionp-descuentos.component.html',
  styleUrls: ['./atencionp-descuentos.component.css'],
  animations: [adminpAnimations]
})
export class AtencionpDescuentosComponent implements OnInit {
  @Input() fromParent: { nIdPersonal: any; nIdEmp: any };

  fbDetail = [{ icon: "monetization_on", tool: "Ir a remuneraciones", disabled: "false" }];
  abDetail = [];
  tsDetail = "inactive";

  // FormGroup
  frmGrpDevengue: FormGroup;

  // Mat Table
  searchBC: string[] = [
    "descripcion",
    "fechaPrestamo",
    "importe",
    "cuotas",
    "nroCuota",
    "importePagado",
    "saldo"
  ];
  searchBS: MatTableDataSource<nsAtencionp.IDescuento>;
  @ViewChild("searchB", { static: true }) searchB: MatPaginator;

  lstDescuentos: Array<nsAtencionp.IDescuento> = new Array();
  lstDescuentosFiltrado: Array<nsAtencionp.IDescuento> = new Array();

  // Progress Bar
  pbDescuentos: boolean;

  data: nsAtencionp.IRemuneracion;

  lstAnios: Array<nsAtencionp.IAnio> = new Array();
  lstMeses: Array<nsAtencionp.IMes> = new Array();
  lstTiposPeriodo: Array<nsAtencionp.ITipoPeriodo> = new Array();
  lstAniosUnicos: Array<nsAtencionp.IDescuento> = new Array();

  // Modal Config
  ngbModalOptions: NgbModalOptions = {
    size: 'xl',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };


  constructor(public activeModal: NgbActiveModal, private atencionService: AtencionpService, private fb: FormBuilder, private spi: NgxSpinnerService,
    private _modalService: NgbModal) {

    this.searchBS = new MatTableDataSource();
    this.onInitFrmGrpDevengue();
  }

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_descuentos");
    this.pbDescuentos = true;

    await this.cargarPeriodosCalculadosDePersonal();
    this.frmGrpDevengue.get("selTipoPeriodo").setValue("1");

    const anio = this.lstDescuentos[0].anio;
    this.frmGrpDevengue.get("selAnio").setValue(anio);
    this.onChangeAnio(anio);

    const nroMes = this.lstDescuentos[0].nroMes;
    this.frmGrpDevengue.get("selMes").setValue(parseInt(nroMes));
    this.onChangeMes(nroMes.toString());

    this.pbDescuentos = false;
    this.spi.hide("spi_descuentos");

    this.delay(250).then((any) => {
      this.tsDetail = "active";
      this.abDetail = this.fbDetail;
    });
  }

  onInitFrmGrpDevengue() {
    this.frmGrpDevengue = this.fb.group({
      selAnio: "",
      selMes: "",
      selTipoPeriodo: ""
    });
  }

  async cargarPeriodosCalculadosDePersonal() {
    // // // debugger;

    const param = [];

    // let nIdEmp = JSON.parse(localStorage.getItem('ListaEmpresa'))[0].nIdEmp;
    // let nIdPersonal = this.fgInfo.controls['nIdPersonal'].value;

    const nIdPersonal = this.fromParent.nIdPersonal;
    const nIdEmp = this.fromParent.nIdEmp;

    param.push(
      "0¡nIdPersonal!" +
      nIdPersonal +
      "-0¡dev.nIdEmp!" +
      nIdEmp +
      "|0¡dev.nIdEstado!2"
    );

    // param.push('0¡nIdPersonal!171-0¡dev.nIdEmp!1|0¡dev.nIdEstado!2');

    // this.pbMain = true;

    await this.atencionService._loadSP(13, param).then((data: any) => {
      // // // debugger

      console.log(data);

      this.lstDescuentos = data;

      this.lstAnios = new Array();

      this.lstAniosUnicos = this.lstDescuentos
        .filter(
          (value, index, arr) =>
            arr.findIndex((x) => x.anio === value.anio) === index
        );

      this.lstAniosUnicos.forEach((elem) => {
        this.lstAnios.push({
          value: elem.anio,
          text: elem.anio,
          periodoLaboralId: 0
        });
      });

      // this.data.periodosLaborales.forEach((elem) => {
      //   console.log(elem.sFechIni);
      //   this.lstPeriodosLaborales.push({
      //     periodoLaboralId: elem.periodoLaboralId,
      //     fechaInicio: elem.sFechIni,
      //     fechaFin: elem.sFechFin,
      //   });
      // });

      this.lstTiposPeriodo = new Array();
      this.lstTiposPeriodo = [
        { id: "1", descripcion: "Primera quincena" },
        { id: "2", descripcion: "Fin de mes" }];
    });

    // this.pbMain = false;
  }

  onChangeAnio(anio: string) {
    this.pbDescuentos = true;

    this.lstMeses = new Array();

    let lstMesesUnicos: Array<nsAtencionp.IDescuento> = new Array();

    //const periodoLaboralId = this.frmGrpPeriodoLaboral.get("selPeriodoLaboral").value;

    lstMesesUnicos = this.lstDescuentos
      //.filter((x) => x.periodoLaboralId === periodoLaboralId && x.anio === anio)
      .filter(
        (value, index, arr) =>
          arr.findIndex((x) => x.nroMes === value.nroMes) === index
      );

    lstMesesUnicos.forEach((elem) => {
      this.lstMeses.push({
        value: parseInt(elem.nroMes),
        text: elem.mes,
        anio: elem.anio
      });
    });

    const mes = this.frmGrpDevengue.get("selMes").value;
    const tipo = this.frmGrpDevengue.get("selTipoPeriodo").value;

    this.onCargarDescuentos(anio, mes, tipo);

    this.pbDescuentos = false;
  }

  onChangeMes(mes: string) {
    this.pbDescuentos = true;

    const anio = this.frmGrpDevengue.get("selAnio").value;
    const tipo = this.frmGrpDevengue.get("selTipoPeriodo").value;

    this.onCargarDescuentos(anio, mes, tipo);

    this.pbDescuentos = false;
  }

  onChangeTipoPeriodo(tipoPeriodo: string) {
    this.pbDescuentos = true;

    const anio = this.frmGrpDevengue.get("selAnio").value;
    const mes = this.frmGrpDevengue.get("selMes").value;

    this.onCargarDescuentos(anio, mes, tipoPeriodo);

    this.pbDescuentos = false;
  }

  async onCargarDescuentos(anio: string, mes: string, tipoPeriodo: string) {
    const param = [];
    const nIdPersonal = this.fromParent.nIdPersonal;
    const nIdEmp = this.fromParent.nIdEmp;

    // // // // debugger

    // param.push('0¡nIdPersonal!171-0¡dev.nIdEmp!1|0¡dev.nIdEstado!2');

    // await this.atencionService._loadSP(13, param).then((data: any) => {
    //   this.lstDescuentos = data;
    // });

    this.lstDescuentosFiltrado = this.lstDescuentos.filter(x => x.anio == anio && parseInt(x.nroMes) >= parseInt(mes) && x.tipoPeriodo == tipoPeriodo)

    this.searchBS = new MatTableDataSource(this.lstDescuentosFiltrado);

    this.searchBS.paginator = this.searchB;
  }

  onToggleFab(stat: number) {
    // // // // debugger
    stat = stat === -1 ? (this.abDetail.length > 0 ? 0 : 1) : stat;
    this.tsDetail = stat === 0 ? "inactive" : "active";
    this.abDetail = stat === 0 ? [] : this.fbDetail;
  }

  async clickFab(index: number) {
    switch (index) {
      case 0:
        console.log("Ir a remuneraciones");

        this.onVisualizarRemuneraciones();

        break;
    }
  }

  onVisualizarRemuneraciones() {
    this.delay(250).then((any) => {
      this.abDetail = [];
      this.tsDetail = "inactive";
    });

    // (function ($) {
    //   $('#ModalSearch').modal('hide');
    // })(jQuery);
    //this.activeModal.close();
    this.activeModal.dismiss();

    this.ngbModalOptions.size = 'xl';
    this.openModal('remuneraciones');
  }

  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }

  openModal(name: string) {

    //const modalRef = this._modalService.open(AtencionpRemuneracionesComponent, this.ngbModalOptions);

    //   const obj = new Object();
    //   const nIdPersonal = 171;//this.fgInfo.controls['nIdPersonal'].value; TODO
    //   const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    //   switch (name) {
    //     case 'remuneraciones':
    //       obj['nIdPersonal'] = nIdPersonal;
    //       obj['nIdEmp'] = nIdEmp;

    //       modalRef.componentInstance.fromParent = obj;
    //       break;
    //   }
  }

}
