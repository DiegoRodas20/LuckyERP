import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AnyCnameRecord } from 'dns';
import { NgxSpinnerService } from 'ngx-spinner';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { IBanco, IDeposito, IMoneda, ITipoDocumento, ITipoRetencion } from '../../../../Model/Icontrolrj';
import { ControlrjService } from '../../../../Services/controlrj.service';

@Component({
  selector: 'app-controlrj-depositos',
  templateUrl: './controlrj-depositos.component.html',
  styleUrls: ['./controlrj-depositos.component.css'],
  animations: [adminpAnimations]
})
export class ControlrjDepositosComponent implements OnInit {

  @Input() fromParent;

  lstTiposDocumento: Array<ITipoDocumento> = new Array();
  lstBancos: Array<IBanco> = new Array();
  lstMonedas: Array<IMoneda> = new Array();
  lstTiposRetencion: Array<ITipoRetencion> = new Array();

  tieneDeposito: Boolean = false;

  data: Array<IDeposito> = new Array();
  lstDepositos: Array<IDeposito> = new Array();

  aParam = [];

  // Mat Table
  searchBC: string[] = [
    "action", "devengue", "fechaDeposito", "horaDeposito", "importe"
  ];
  searchBS: MatTableDataSource<IDeposito>;
  @ViewChild("searchB", { static: true }) searchB: MatPaginator;
  @ViewChild(MatSort, { static: true }) tableSortB: MatSort;

  expandedMore = null;

  // FormGroup
  fgRetencion: FormGroup;

  // Progress Bar
  pbRetencion: boolean;

  constructor(
    public activeModal: NgbActiveModal,
    private controlrjService: ControlrjService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService) {

    this.expandedMore = null;

    this.searchBS = new MatTableDataSource();
    this.onInitFgRetencion();
  }

  async ngOnInit(): Promise<void> {
    this.spinner.show("spi_retencion");
    this.pbRetencion = true;

    await this.cargarTiposDeDocumento();
    await this.cargarBancos();
    await this.cargarMonedas();

    await this.cargarDepositos();

    this.pbRetencion = false;
    this.spinner.hide("spi_retencion");
  }

  onInitFgRetencion() {

    this.fgRetencion = this.fb.group({
      T1_nIdRetencionj: [{ value: "0" }],
      T1_nIdPersonal: [{ value: "0" }],
      T1_sFileSustento: [{ value: "" }],
      T1_nIdTipoDoc: [
        { value: 0, disabled: true },
      ],
      T1_sDocumento: [
        { value: "", disabled: true }
      ],
      T1_sNombres: [{ value: "", disabled: true }],
      T1_nIdBanco: [
        { value: 0, disabled: true }
      ],
      T1_sNroCuenta: [{ value: "", disabled: true }],
      T1_sNroCuentaI: [{ value: "", disabled: true }],
      T1_nIdMoneda: [
        { value: 0, disabled: true }
      ],
      T1_dFechIni: [{ value: null }],
      T1_dFechFin: [{ value: null, disabled: true }],
      T1_bTipo: [
        { value: "", disabled: true }
      ],
      T1_nMonto: [{ value: "", disabled: true }]
    });
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

  async cargarDepositos() {
    this.pbRetencion = true;

    const retencionId = this.fromParent.retencionId;

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

      this.fgRetencion.get('T1_nIdRetencionj').setValue(retencionId);

      this.searchBS = new MatTableDataSource(lstBeneficiario);
      this.searchBS.paginator = this.searchB;
      this.searchBS.sort = this.tableSortB;

      //this.fgRetencion.get('T1_nIdPersonal').setValue(lstDeposito[0].personalId);

      // this.demandado = lstDeposito[0].demandado;
      // this.tieneDeposito = lstDeposito[0].tieneDeposito;
      // this.urlSustento = lstDeposito[0].urlSustento;

      // this.titulo = "Detalle de retencion - " + this.demandado;

      // this.lstDetalleConceptos = new Array();

      // this.data.forEach(element => {
      //   this.lstDetalleConceptos.push({ id: element.conceptoId, nombre: element.concepto });
      // });

      if (lstBeneficiario.length > 0) {
        //this.tieneDeposito = true;

        this.fgRetencion.get('T1_nIdTipoDoc').setValue(lstBeneficiario[0].tipoDocumentoIdBeneficiario);
        this.fgRetencion.get('T1_sDocumento').setValue(lstBeneficiario[0].nroDocumentoBeneficiario);
        this.fgRetencion.get('T1_sNombres').setValue(lstBeneficiario[0].beneficiario);
        this.fgRetencion.get('T1_nIdBanco').setValue(lstBeneficiario[0].bancoId);
        this.fgRetencion.get('T1_sNroCuenta').setValue(lstBeneficiario[0].nroCuenta);
        this.fgRetencion.get('T1_sNroCuentaI').setValue(lstBeneficiario[0].nroCuentaI);
        // this.fgRetencion.get('T1_nIdMoneda').setValue(lstDeposito[0].monedaId);
        // this.fgRetencion.get('T1_dFechIni').setValue(lstDeposito[0].fechaInicio);
        // this.fgRetencion.get('T1_dFechFin').setValue(lstDeposito[0].fechaTermino);
        // this.fgRetencion.get('T1_bTipo').setValue(lstDeposito[0].tipoRetencionId);
        // this.fgRetencion.get('T1_nMonto').setValue(lstDeposito[0].monto);

        // const pdf = document.getElementById("pdf-sustento") as HTMLIFrameElement;
        // pdf.src = lstDeposito[0].urlSustento;

        //this.fgRetencion.get('T1_sFileSustento').setValue(lstDeposito[0].urlSustento);
      }
      else {
        //this.tieneDeposito = false;
      }
    });

    this.pbRetencion = false;
  }

  // onVisualizarDeposito(row: any) {

  //   debugger

  //   this.pbRetencion = true;

  //   console.log(row);

  //   const pdf = document.getElementById("pdf-sustento") as HTMLIFrameElement;
  //   pdf.src = row.urlSustento;

  //   this.pbRetencion = false;
  // }

  viewDetail(element: IDeposito) {
    // debugger

    this.pbRetencion = true;

    if (element.urlSustento != '') {
      this.tieneDeposito = true;

      const pdf = document.getElementById("pdf-deposito") as HTMLIFrameElement;
      pdf.src = element.urlSustento;
    }
    else {
      this.tieneDeposito = false;
    }

    this.pbRetencion = false;
  }

  // async onClickExpanded(row: any) {

  //   if (this.expandedMore === row) {
  //     this.expandedMore = null;
  //   } else {


  //     this.expandedMore = row;
  //   }
  // }

}
