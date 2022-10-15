import { Component, Input, OnInit, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { IAnio, IEstado, IMes, IRetencion } from '../../../../Model/Icontrolrj';
import { ControlapService } from '../../../../Services/controlap.service';
import { ControlrjService } from '../../../../Services/controlrj.service';
import { ControlrjDetalleComponent } from '../controlrj-detalle/controlrj-detalle.component';

// Modals
const MODALS: { [name: string]: Type<any> } = {
  nuevo: ControlrjDetalleComponent,
  detalle: ControlrjDetalleComponent
};

@Component({
  selector: 'app-controlrj-personal',
  templateUrl: './controlrj-personal.component.html',
  styleUrls: ['./controlrj-personal.component.css', './controlrj-personal.component.scss'],
  animations: [adminpAnimations]
})
export class ControlrjPersonalComponent implements OnInit {

  @Input() fromParent;

  data: Array<IRetencion> = new Array();
  lstRetenciones: Array<IRetencion> = new Array();

  retencionId: number = 0;

  // Fab
  fbDetail = [
    { icon: 'money', tool: 'Nueva retencion', dis: false }
  ];
  abDetail = [];
  tsDetail = 'inactive';

  lstEstados: Array<IEstado> = new Array();
  lstAnios: Array<IAnio> = new Array();
  lstMeses: Array<IMes> = new Array();

  // Progress Bar
  pbDetail: boolean;

  // FormGroup
  fgDetail: FormGroup;
  fgFilter: FormGroup;

  // Parent
  aItem: any;

  // Modal Config
  ngbModalOptions: NgbModalOptions = {
    size: 'xl',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };

  // Mat Table
  MainDC: string[] = ['acciones', 'beneficiario', 'fechaInicio', 'tipoRetencion', 'monto'];
  searchBS: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild('searchB', { static: true }) searchB: MatPaginator;

  constructor(public activeModal: NgbActiveModal, private spinner: NgxSpinnerService,
    public controlrjService: ControlrjService, private fb: FormBuilder,
    private _modalService: NgbModal,
    public service: ControlapService) {

    this.new_fgDetail();
    this.new_fgFilter();
  }

  async ngOnInit(): Promise<void> {

    this.spinner.show('spi_detail');

    this.lstEstados.push({ id: '1', nombre: 'Vigente' });
    this.lstEstados.push({ id: '2', nombre: 'Caducado' });

    this.lstAnios.push({ id: '2020', nombre: '2020' });
    this.lstAnios.push({ id: '2021', nombre: '2021' });

    this.lstMeses.push({ id: '1', nombre: 'Enero' });
    this.lstMeses.push({ id: '2', nombre: 'Febrero' });


    //await this.cboGetModo();
    //await this.cboGetMotivo();
    //await this.cboGetRespuesta();

    //debugger
    this.aItem = this.fromParent.aItem;

    await this.onCargarRetencionesHistoricas();

    this.spinner.hide('spi_detail');

    this.onToggleFab(1, 1);
  }

  new_fgDetail() {
    this.fgDetail = this.fb.group({
      sNombres: [{ value: '', disabled: true }],
      sCodPlla: [{ value: '', disabled: true }],
      sTipo: [{ value: '', disabled: true }],
      sDocumento: [{ value: '', disabled: true }],
      dFechIni: [{ value: null, disabled: true }],
      dFechFin: [{ value: null, disabled: true }],
      sCiudad: [{ value: '', disabled: true }],
    });
  }

  new_fgFilter() {

    this.fgFilter = this.fb.group({
      selEstado: [{ value: 0, disabled: false }],
      selAnio: [{ value: 0, disabled: false }],
      selMes: [{ value: 0, disabled: false }]
    });

    // this.fgFilter.valueChanges.subscribe(value => {
    //   const filter = { ...value, name: value.sRegUser.trim().toLowerCase() } as string;
    //   this.DetailDS.filter = filter;

    //   if (this.DetailDS.paginator) {
    //     this.DetailDS.paginator.firstPage();
    //   }

    //   this.expandedMore = null;

    // });


  }

  get getDetail() { return this.fgDetail.controls; }
  get getFilter() { return this.fgFilter.controls; }

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = (stat === -1) ? (this.abDetail.length > 0) ? 0 : 1 : stat;
        this.tsDetail = (stat === 0) ? 'inactive' : 'active';
        this.abDetail = (stat === 0) ? [] : this.fbDetail;
        break;
    }
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.ngbModalOptions.size = 'xl';
        this.openModal('nuevo');
        break;
    }
  }

  async onCargarRetencionesHistoricas() {

    //debugger

    const nIdPersonal = this.aItem.nIdPersonal;

    this.fgDetail.patchValue({
      sNombres: this.aItem.sNombres,
      sCodPlla: this.aItem.sCodPlla,
      sTipo: this.aItem.sDscTipo,
      sDocumento: this.aItem.sDocumento,
      dFechIni: this.aItem.dFechIni,
      dFechFin: this.aItem.dFechFin,
      sCiudad: this.aItem.sCiudad
    });

    const param = [];

    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    param.push('0¡A.nIdPersonal!' + nIdPersonal);

    await this.controlrjService._loadSP(7, param).then((data: any) => {
      this.data = data;
      this.lstRetenciones = data;
    });

    let lstRetencionesAgrupadas: Array<IRetencion> = new Array();

    lstRetencionesAgrupadas = this.data
      .filter(
        (value, index, arr) =>
          arr.findIndex((x) => x.demandado === value.demandado && x.beneficiario === value.beneficiario) === index
      );

    this.searchBS = new MatTableDataSource(lstRetencionesAgrupadas);
    this.searchBS.paginator = this.searchB;

    this.searchBS.filterPredicate = function (
      data: IRetencion,
      filter: string
    ): boolean {
      return data.demandado.trim().toLowerCase().includes(filter);
    };

    this.searchBS.filterPredicate = ((
      data: IRetencion,
      filter: IRetencion
    ) => {
      const a = !filter.demandado || (data.demandado.toLowerCase().includes(filter.demandado.toLowerCase()) || data.nroDocumentoDemandado.toLowerCase().includes(filter.demandado.toLowerCase()));
      const b = !filter.tipoRetencion || data.tipoRetencionId === filter.tipoRetencion;
      const c = !filter.beneficiario || (data.beneficiario.toLowerCase().includes(filter.beneficiario.toLowerCase()) || data.nroDocumentoBeneficiario.toLowerCase().includes(filter.beneficiario.toLowerCase()));
      const d = !filter.concepto || data.conceptoId === filter.concepto;
      return a && b && c && d;
    }) as (PeriodicElement, string) => boolean;
  }

  openModal(name: string) {

    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);
    const obj = new Object();

    switch (name) {
      case 'nuevo':
        obj['retencionId'] = 0;
        obj['nombrePersona'] = this.fgDetail.controls["sNombres"].value;
        obj['codigoPersona'] = this.aItem.nIdPersonal;

        modalRef.componentInstance.fromParent = obj;
        break;

      case 'detalle':
        obj['retencionId'] = this.retencionId;
        obj['nombrePersona'] = this.fgDetail.controls["sNombres"].value;
        obj['codigoPersona'] = this.aItem.nIdPersonal;

        modalRef.componentInstance.fromParent = obj;
        break;
    }
  }

  closeDetail() {

    const oReturn = new Object();


    this.activeModal.close(oReturn);

  }

  onVerDetalle(row: IRetencion) {
    this.ngbModalOptions.size = 'xl';
    //debugger
    this.retencionId = row.retencionId;
    this.openModal('detalle');
  }

}