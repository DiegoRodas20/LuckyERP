import { Component, Input, OnInit, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { ControlapService } from '../../../../Services/controlap.service';
import * as moment from 'moment';
import { Moment } from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';
import { Observable } from 'rxjs';
import { startWith, distinctUntilChanged, map } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ControlapContactpComponent } from '../controlap-contactp/controlap-contactp.component';
import { ControlapContactrComponent } from '../controlap-contactr/controlap-contactr.component';

// Modals
const MODALS: { [name: string]: Type<any> } = {
  contactp: ControlapContactpComponent,
  contactr: ControlapContactrComponent
};

@Component({
  selector: 'app-controlap-detailp',
  templateUrl: './controlap-detailp.component.html',
  styleUrls: ['./controlap-detailp.component.css', './controlap-detailp.component.scss'],
  animations: [ adminpAnimations ]
})
export class ControlapDetailpComponent implements OnInit {

  @Input() fromParent;

  //#region Variables

  // Fab
  fbDetail = [
    {icon: 'add_ic_call', tool: 'Contactar', dis: false}
  ];
  abDetail = [];
  tsDetail = 'inactive';

  // Progress Bar
  pbDetail: boolean;

  // FormGroup
  fgDetail: FormGroup;
  fgFilter: FormGroup;

  // Parent
  aItem: any;
  nDetail: number;
  nIdDevengue: number;
  dFechDevengue: Date;
  aResp: any[];
  aDias: any[];

  // ComboBox
  cboModo = new Array();
  cboMotivo = new Array();
  cboRespuesta = new Array();

  // Array
  aMotivo = new Array();
  aRespuesta = new Array();
  aResult = new Array();

  // AutoComplete
  af_Usuario = new Array();
  foUsuario: Observable<any[]>;
  saUsuario = false;

  // Mat Table
  DetailDC: string[] = [ 'dFechDevengue', 'sModo', 'sMotivo', 'sRespuesta', 'sRegUser', 'dtReg', 'more' ];
  DetailDS: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild('pagDetail', {static: true}) pagDetail: MatPaginator;
  expandedMore = null;

  // Modal Config
  ngbModalOptions: NgbModalOptions = {
    size: 'xl',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };

  //#endregion

  constructor(public activeModal: NgbActiveModal, private spi: NgxSpinnerService,
              public service: ControlapService, private fb: FormBuilder,
              private _modalService: NgbModal) {

    this.new_fgDetail();
    this.new_fgFilter();
  }

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_detail');

    await this.cboGetModo();
    await this.cboGetMotivo();
    await this.cboGetRespuesta();

    this.aItem = this.fromParent.aItem;
    this.nDetail = this.fromParent.nDetail;
    this.aResp = this.fromParent.aResp;
    this.aDias = this.fromParent.aDias;
    this.nIdDevengue = this.fromParent.nIdDevengue;
    this.dFechDevengue = this.fromParent.dFechDevengue;

    this.fgFilter.controls['dFechDevengue'].setValue(moment(this.dFechDevengue));

    // Modo por defecto
    this.fgFilter.controls['nIdModo'].setValue( this.nDetail === 1 ? 2314 : 2315 );
    const nIdModo = this.fgFilter.controls['nIdModo'].value;
    this.ChangeModo(nIdModo);

    await this.loadDetail();

    this.spi.hide('spi_detail');

    this.onToggleFab(1, 1);

  }

  //#region General

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
        this.ngbModalOptions.size = ( this.nDetail === 1 ? 'lg' : 'xl');
        this.openModal( this.nDetail === 1 ? 'contactp' : 'contactr');
        break;
    }
  }

  openModal(name: string) {

    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);
    const obj = new Object();

    obj['nIdDevengue'] = this.nIdDevengue;
    obj['dFechDevengue'] = this.dFechDevengue;

    switch (name) {
      case 'contactp':
        obj['aItem'] = this.aItem;
        obj['aDias'] = this.aDias;
        modalRef.componentInstance.fromParent = obj;
        break;

      case 'contactr':
        obj['aResp'] = this.aResp;
        obj['nIdResp'] = this.aItem;
        modalRef.componentInstance.fromParent = obj;
        break;

    }

    modalRef.result.then(async (result) => {

      if (result.value === 'loadAgain') {

        this.spi.show('spi_detail');

        const nIdPersonal = result.nIdPersonal;
        const nIdContacto = result.nIdContacto;

        await this.loadContact(nIdPersonal);

        this.spi.hide('spi_detail');

        this.aResult = [];
        if (result.modal === 'contactp') {
          this.aResult.push({
            nIdPersonal: nIdPersonal,
            nIdContacto: nIdContacto
          });
        }

      }

    }, (reason) => { });

  }

  closeDetail() {

    const oReturn = new Object();
    oReturn['modal'] = 'detailp';
    oReturn['value'] = ( this.aResult.length > 0 ) ? 'loadAgain' : '';
    oReturn['aResult'] = this.aResult;

    this.activeModal.close(oReturn);

  }

  //#endregion

  //#region FormGroup

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
      dFechDevengue: null,
      nIdModo: 0,
      nIdMotivo: [{ value: 0, disabled: true }],
      nIdRespuesta: [{ value: 0, disabled: true }],
      nIdRegUser: 0,
      sRegUser: ''
    });

    this.fgFilter.valueChanges.subscribe( value => {
      const filter = {...value, name: value.sRegUser.trim().toLowerCase()} as string;
      this.DetailDS.filter = filter;

      if (this.DetailDS.paginator) {
        this.DetailDS.paginator.firstPage();
      }

      this.expandedMore = null;

    });

    this.foUsuario = this.fgFilter.controls['sRegUser'].valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );

  }

  get getDetail() { return this.fgDetail.controls; }
  get getFilter() { return this.fgFilter.controls; }

  //#endregion

  //#region Combobox

  async cboGetModo () {
    const param = [];
    param.push('0¡nEleCodDad!2313');

    await this.service._loadSP( 7, param).then( (value: any[]) => {
      this.cboModo = value;
    });
  }

  ChangeModo(pushParam: any) {

    this.fgFilter.controls['nIdMotivo'].setValue(0);
    this.fgFilter.controls['nIdMotivo'].disable();

    this.fgFilter.controls['nIdRespuesta'].setValue(0);
    this.fgFilter.controls['nIdRespuesta'].disable();

    if (pushParam !== undefined) {

      // Motivo
      this.fgFilter.controls['nIdMotivo'].enable();
      this.cboMotivo = this.aMotivo.filter( x => x.nIdModo === pushParam );

      this.fgFilter.controls['nIdRespuesta'].enable();
      this.cboRespuesta = this.aRespuesta.filter( x => x.nIdModo === pushParam );
    }

  }

  async cboGetMotivo () {
    const param = [];
    param.push('0¡nIdTipo!2311');
    param.push('0¡bUso!0');

    await this.service._loadSP( 9, param).then( (value: any[]) => {
      this.aMotivo = value;
    });
  }

  async cboGetRespuesta () {
    const param = [];
    param.push('0¡nIdTipo!2311');
    param.push('0¡bUso!1');

    await this.service._loadSP( 9, param).then( (value: any[]) => {
      this.aRespuesta = value;
    });
  }

  //#endregion

  //#region Load

  async loadDetail() {

    const aItem = [];
    const param = [];
    let nId = 0;

    if ( this.nDetail === 1 ) {

      nId = this.aItem.nIdPersonal;
      aItem.push(this.aItem);

    } else {

      nId = this.aItem;
      param.push('0¡A.nIdPersonal!' + nId);
      await this.service._loadSP( 11, param).then( (value: any[]) => {
        if ( value.length > 0 ) {
          aItem.push(value[0]);
        }
      });
    }

    this.fgDetail.patchValue({
      sNombres: aItem[0].sNombres,
      sCodPlla: aItem[0].sCodPlla,
      sTipo: aItem[0].sDscTipo,
      sDocumento: aItem[0].sDocumento,
      dFechIni: aItem[0].dFechIni,
      dFechFin: aItem[0].dFechFin,
      sCiudad: aItem[0].sCiudad
    });

    await this.loadContact(nId);

  }

  async loadContact(nIdPersonal: number) {
    const param = [];
    param.push('0¡A.nIdPersonal!' + nIdPersonal);

    await this.service._loadSP( 12, param).then( (value: any[]) => {

      this.DetailDS = new MatTableDataSource(value);
      this.DetailDS.paginator = this.pagDetail;

      this.DetailDS.filterPredicate = function(data, filter: string): boolean {
        return data.sRegUser.trim().toLowerCase().includes(filter);
      };

      this.DetailDS.filterPredicate = ((data: any, filter: any ) => {
        const a = !filter.dFechDevengue || moment(filter.dFechDevengue).format('YYYYMM') === moment(data.dFechDevengue).format('YYYYMM');
        const b = !filter.nIdModo || data.nIdModo === filter.nIdModo;
        const c = !filter.nIdMotivo || data.nIdMotivo === filter.nIdMotivo;
        const d = !filter.nIdRespuesta || data.nIdRespuesta === filter.nIdRespuesta;
        const e = !filter.nIdRegUser || data.nIdRegUser === filter.nIdRegUser;
        return a && b && c && d && e;
      }) as (PeriodicElement, string) => boolean;

    });

    const aDetail = this.DetailDS.data;
    const aUsuario = [];

    aDetail.forEach( x => {

      const nIdRegUser = x.nIdRegUser;
      const sRegUser = x.sRegUser;

      const iArray = aUsuario.findIndex( y => y.nIdRegUser === nIdRegUser);
      if (iArray === -1) {
        aUsuario.push({
          nIdRegUser: nIdRegUser,
          sRegUser: sRegUser
        });
      }

    });
    this.af_Usuario = aUsuario;
  }

  //#endregion

  //#region AutoComplete

  displayUsuario(obj?: any): string {
    return obj ? obj.sRegUser : '';
  }

  osUsuario(event: any) {
    const vEvent = event.option.value.nIdRegUser;
    this.fgFilter.controls['nIdRegUser'].setValue(vEvent);
  }

  updatedVal(e: any) {
    let boolean: boolean;

    if ( e instanceof Object ) {
      boolean = ( e && e.length > 0 ) ? true : false;
    } else {
      boolean = ( e && e.trim().length > 0 ) ? true : false;
    }

    this.saUsuario = boolean;
  }

  private _filter(value: any): any[] {

    let aFilter = new Array();

    if ( value !== undefined && value !== null ) {

      let filterValue: any;
      if ( value instanceof Object ) {
        filterValue = value.sRegUser.trim().toLowerCase();
      } else {
        filterValue = value.trim().toLowerCase();
      }

      this.fgFilter.controls['nIdRegUser'].setValue(undefined);

      aFilter = this.af_Usuario.filter( x => {
        const a = x.sRegUser.trim().toLowerCase().includes(filterValue);
        return a;
      });

    }

    return aFilter;
  }

  //#endregion

  //#region Extra

  chosenYearHandler(normalizedYear: moment.Moment) {
    let ctrlValue = this.fgFilter.controls['dFechDevengue'].value;
    ctrlValue = ( ctrlValue === null ) ? moment() : ctrlValue;
    ctrlValue.year(normalizedYear.year());
    this.fgFilter.controls['dFechDevengue'].setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    let ctrlValue = this.fgFilter.controls['dFechDevengue'].value;
    ctrlValue = ( ctrlValue === null ) ? moment() : ctrlValue;
    ctrlValue.month(moment(normalizedMonth).month());
    this.fgFilter.controls['dFechDevengue'].setValue(ctrlValue);
    datepicker.close();
  }

  MomentDate(pushParam: any) {
    moment.locale('es');
    const tDate = moment(pushParam).format('MMMM [del] YYYY');
    return tDate[0].toUpperCase() + tDate.substr(1).toLowerCase();
  }

  //#endregion

}
