import { Component, Input, OnInit, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { GestioncService } from '../../../../Services/gestionc.service';
import * as moment from 'moment';
import { GestioncIncidenciaComponent } from '../gestionc-incidencia/gestionc-incidencia.component';
import { adminpAnimations } from '../../../../Animations/adminp.animations';

// Modals
const MODALS: { [name: string]: Type<any> } = {
  incidencia: GestioncIncidenciaComponent
};

@Component({
  selector: 'app-gestionc-detail',
  templateUrl: './gestionc-detail.component.html',
  styleUrls: ['./gestionc-detail.component.css', './gestionc-detail.component.scss'],
  animations: [ adminpAnimations ]
})
export class GestioncDetailComponent implements OnInit {

  @Input() fromParent;

  //#region Variables
  mDetail = 0;

  // Fab
  fbDetail = [
    {icon: 'feedback', tool: 'Nueva incidencia', dis: true}
  ];
  abDetail = [];
  tsDetail = 'inactive';

  // Progress Bar
  pbDetail: boolean;

  // Combobox
  cboEstado = new Array();

  // FormGroup
  fgDetail: FormGroup;

  // Mat Table
  DetailDC: string[] = [ 'action', 'dIniCont', 'dFinCont', 'sMotivo', 'more' ];
  DetailDS: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild('pagDetail', {static: true}) pagDetail: MatPaginator;
  expandedMore: null;

  // Modal Config
  ngbModalOptions: NgbModalOptions = {
    size: 'md',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };

  // Array
  aItem: any;
  aIncidencia: any;

  // Opcion Incidencia
  opcIncidencia: number;

  //#endregion

  constructor(public activeModal: NgbActiveModal, private spi: NgxSpinnerService,
              public service: GestioncService, private fb: FormBuilder,
              private _modalService: NgbModal) {

    this.new_fgDetail();
  }

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_detail');

    await this.cboGetEstado();

    this.aItem = this.fromParent.aItem;

    await this.loadDetail();

    this.spi.hide('spi_detail');

    this.onToggleFab(1, 1);

  }

  //#region General

  openModal(name: string) {

    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);
    const obj = new Object();

    switch (name) {
      case 'incidencia':
        obj['aIncidencia'] = this.aIncidencia;
        obj['opcIncidencia'] = this.opcIncidencia;
        obj['sNombres'] = this.fgDetail.controls['sNombres'].value;

        modalRef.componentInstance.fromParent = obj;
        break;
    }

    modalRef.result.then(async (result) => {

      switch (result.modal) {
        case 'incidencia':
          if (result.value === 'loadAgain') {
            this.mDetail = this.mDetail + 1;
            await this.loadIncidencias();
          }
          break;
      }

    }, (reason) => { });

  }

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = ( stat === -1 ) ? ( this.abDetail.length > 0 ) ? 0 : 1 : stat;
        this.tsDetail = ( stat === 0 ) ? 'inactive' : 'active';
        this.abDetail = ( stat === 0 ) ? [] : this.fbDetail;
        break;
    }
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.opcIncidencia = 1;
        this.aIncidencia = this.aItem;
        this.openModal('incidencia');
        break;
    }
  }

  //#endregion

  //#region Combobox

  async cboGetEstado () {
    const param = [];
    param.push('0¡nEleCodDad!2286');

    await this.service._loadSP( 4, param).then( (value: any[]) => {
      this.cboEstado = value;
    });
  }

  getDescEstado(nEleCod: number) {
    let sDesc = '';
    const iArray = this.cboEstado.findIndex( x => x.nEleCod === nEleCod );
    if (iArray > -1) {
      sDesc = this.cboEstado[iArray].cEleNam;
    }
    return sDesc;
  }

  //#endregion

  //#region FormGroup

  new_fgDetail() {
    this.fgDetail = this.fb.group({
      nIdPersonal: 0,
      nIdPerLab: 0,
      nIdPLD: null,
      sNombres: [{ value: '', disabled: true }],
      sCodPlla: [{ value: '', disabled: true }],
      sTipo: [{ value: '', disabled: true }],
      sDocumento: [{ value: '', disabled: true }],
      dFinCont: [{ value: null, disabled: true }],
      nEstado: 0,
      sEstado: [{ value: '', disabled: true }],
      sCiudad: [{ value: '', disabled: true }],
    });
  }

  get getDetail() { return this.fgDetail.controls; }

  //#endregion

  //#region Load

  async loadDetail() {

    this.fgDetail.patchValue({
      nIdPersonal: this.aItem.nIdPersonal,
      nIdPerLab: this.aItem.nIdPerLab,
      nIdPLD: this.aItem.nIdPLD,
      sNombres: this.aItem.sNombres,
      sCodPlla: this.aItem.sCodPlla,
      sTipo: this.aItem.sDscTipo,
      sDocumento: this.aItem.sDocumento,
      dFinCont: this.aItem.dFinCont,
      nEstado: this.aItem.nEstado,
      sEstado: this.getDescEstado(this.aItem.nEstado),
      sCiudad: this.aItem.sCiudad
    });

    await this.loadIncidencias();

  }

  async loadIncidencias() {

    const nIdPerLab = this.fgDetail.controls['nIdPerLab'].value;

    const param = [];
    param.push('0¡nIdPerLab!' + nIdPerLab);

    await this.service._loadSP( 5, param).then( (value: any[]) => {

      this.DetailDS = new MatTableDataSource(value);
      this.DetailDS.paginator = this.pagDetail;

    });

    // Validamos incidencia
    const nEstado = this.fgDetail.controls['nEstado'].value;
    const nIdPLD = this.fgDetail.controls['nIdPLD'].value;
    const nDay = moment().date(); // Pendiente por pruebas

    const aDetail = this.DetailDS.data;
    const iDetail = aDetail.findIndex( x => x.nIdContrato === nIdPLD);

    if ( nEstado === 2289 && nIdPLD !== null && iDetail === -1 ) {
      this.fbDetail[0].dis = false;
    } else {
      this.fbDetail[0].dis = true;
    }

  }

  viewIncidencia(element: any) {
    this.opcIncidencia = 2;
    this.aIncidencia = element;
    this.openModal('incidencia');
  }

  closeDetail() {

    const oReturn = new Object();

    oReturn['modal'] = 'detail';
    oReturn['value'] = this.mDetail;

    this.activeModal.close(oReturn);

  }

  //#endregion

}
