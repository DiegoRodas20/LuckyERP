import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { ControlsService } from '../../Services/controls.service';
import { CustomDateFormatter } from '../../Config/configCalendar';
import { CalendarDateFormatter, CalendarEvent, CalendarView, DAYS_OF_WEEK } from 'angular-calendar';
import { Subject } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { Moment } from 'moment';
import { IDetail, IMain } from '../../Model/Icontrols';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { adminpAnimations } from '../../Animations/adminp.animations';
import { ValidadoresService } from '../../Validators/validadores.service';

// Utilizar javascript [1]
declare var jQuery: any;

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

function between(x: number, min: number, max: number) {
  return x >= min && x <= max;
}

const colors: any = {
  pink: {
    primary: '#ff4081b0',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ffd1',
    secondary: '#D1E8FF',
  }
};

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.css', './controls.component.scss'],
  providers: [ ControlsService,
    {provide: CalendarDateFormatter, useClass: CustomDateFormatter}],
  animations: [ adminpAnimations ]
})
export class ControlsComponent implements OnInit {

  //#region Variables
  matcher = new MyErrorStateMatcher();

  // Service GET && POST
  url: string;
  aParam = [];

  // Fab
  fbMain = [
    {icon: 'person_search', tool: 'Buscar personal'}
  ];
  abMain = [];
  tsMain = 'inactive';

  fbDetail = [
    {icon: 'add', tool: 'Nuevo subsidio'}
  ];
  abDetail = [];
  tsDetail = 'inactive';

  fbSub = [
    {icon: 'save', tool: 'Guardar'},
    {icon: 'cancel', tool: 'Cancelar'}
  ];
  fbSub2 = [
    {icon: 'edit', tool: 'Editar'},
    {icon: 'delete', tool: 'Eliminar'}
  ];
  abSub = [];
  tsSub = 'inactive';

  // Properties Sub
  hSub: string; // Nuevo o Detalle
  mSub: number;
  countSub: number;
  bkSub: any;

  // Progress Bar
  pbMain: boolean;
  pbSearch: boolean;
  pbDetail: boolean;
  pbSub: boolean;

  // Combobox
  cboPlanilla: any;
  cboTipoSub: any;
  cboCiudad: any;
  cboPerLab: any;

  // Calendar properties
  locale = 'es';
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.MONDAY, DAYS_OF_WEEK.SUNDAY];
  view: CalendarView = CalendarView.Month;
  events: CalendarEvent[] = [];

  // Calendar setup
  viewDate: Date = new Date();
  eventMain: CalendarEvent[] = [];
  refresh: Subject<any> = new Subject();

  subDate: Date = new Date();
  eventSub: CalendarEvent[] = [];
  refreshSub: Subject<any> = new Subject();

  // Mat Table
  MainDC: string[] = [ 'action', 'sNombres', 'sCodPlla', 'sTipo', 'sDocumento' ];
  MainDS: MatTableDataSource<IMain>;
  @ViewChild('pagMain', {static: true}) pagMain: MatPaginator;
  selectedRowIndex: any;

  SearchDC: string[] = [ 'action', 'sNombres', 'sCodPlla', 'sTipo', 'sDocumento' ];
  SearchDS: MatTableDataSource<IMain>;
  @ViewChild('pagSearch', {static: true}) pagSearch: MatPaginator;

  DetailDC: string[] = [ 'action', 'sTipoSub', 'dFechIni', 'dFechFin' ];
  DetailDS: MatTableDataSource<IDetail>;
  @ViewChild('pagDetail', {static: true}) pagDetail: MatPaginator;

  // FormGroup
  fgMain: FormGroup;
  fgSearch: FormGroup;
  fgDetail: FormGroup;
  fgFilter: FormGroup;
  fgSub: FormGroup;

  //#endregion

  constructor(public service: ControlsService, @Inject('BASE_URL') baseUrl: string,
              private fb: FormBuilder, private spi: NgxSpinnerService,
              private _snackBar: MatSnackBar, private valid: ValidadoresService) {

    // SERVICE GET && POST
    this.url = baseUrl;
    this.countSub = 0;

    this.new_fgMain();
    this.new_fgSearch();
    this.new_fgDetail();
    this.new_fgFilter();
    this.new_fgSub();
  }

  //#region General

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = ( stat === -1 ) ? ( this.abMain.length > 0 ) ? 0 : 1 : stat;
        this.tsMain = ( stat === 0 ) ? 'inactive' : 'active';
        this.abMain = ( stat === 0 ) ? [] : this.fbMain;
        break;

      case 3:
        stat = ( stat === -1 ) ? ( this.abDetail.length > 0 ) ? 0 : 1 : stat;
        this.tsDetail = ( stat === 0 ) ? 'inactive' : 'active';
        this.abDetail = ( stat === 0 ) ? [] : this.fbDetail;
        break;

      case 4:
        if ( stat === -1 ) {
          if (this.abSub.length > 0) {
            stat = 0;
          } else {
            stat = ( this.mSub === 1 ) ? 1 : 2;
          }
        }

        this.tsSub = ( stat === 0 ) ? 'inactive' : 'active2';

        switch (stat) {
          case 0:
            this.abSub = [];
            break;
          case 1:
            this.abSub = this.fbSub;
            break;
          case 2:
            this.abSub = this.fbSub2;
            break;
        }
        break;

      default:
        break;
    }
  }

  clickFab(opc: number, index: number) {
    switch (opc) {
      case 1:
        this.showModal(2);
        break;

      case 2:
        this.cleanModal(2);
        break;

      case 3:
        switch (index) {
          case -1:
            this.cleanModal(3);
            break;

          case 0:
            this.showModal(3, undefined, 1);
            break;
        }

        break;

      case 4:
        switch (index) {
          case -1:
            this.cleanModal(4);
            break;

          case 0:
            if (this.mSub === 1) {
              this.saveSub( (this.hSub === 'Nuevo') ? 1 : 2);
            } else {

              const sNombres = this.fgDetail.controls['sNombres'].value;

              Swal.fire({
                title: '¿ Estas seguro de modificar el registro?',
                text: 'El subsidio le pertenece a ' + sNombres,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#ff4081',
                confirmButtonText: 'Confirmar !',
                allowOutsideClick: false
              }).then((result) => {
                if (result.isConfirmed) {

                  this.fgSub.controls['T1_nTipoSub'].enable();
                  this.fgSub.controls['T1_dFechIni'].enable();
                  this.fgSub.controls['T1_dFechFin'].enable();
                  this.fgSub.controls['T1_sCITT'].enable();

                  this.abSub = [];
                  this.delay(250).then(any => {
                    this.abSub = this.fbSub;
                    this.tsSub = 'active2';
                  });

                  this.mSub = 1;

                  return;
                }
              });
            }
            break;

          case 1:
            if (this.hSub === 'Nuevo') {
              this.cleanModal(4);
            } else {

              if (this.mSub === 1 ) {
                this.mSub = 2;
                this.loadSub(this.bkSub);

                this.abSub = [];
                this.delay(250).then(any => {
                  this.abSub = this.fbSub2;
                  this.tsSub = 'inactive';
                });
              } else {

                const nIdPersonal = this.fgDetail.controls['nIdPersonal'].value;
                const nIdPerLab = this.fgDetail.controls['nIdPerLab'].value;
                const sNombres = this.fgDetail.controls['sNombres'].value;

                Swal.fire({
                  title: '¿ Estas seguro de eliminar el registro?',
                  text: 'El subsidio le pertenece a ' + sNombres,
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonColor: '#ff4081',
                  confirmButtonText: 'Confirmar !',
                  allowOutsideClick: false
                }).then(async (result) => {
                  if (result.isConfirmed) {

                    this.pbSub = true;

                    this.aParam = [];

                    const nIdSub = this.fgSub.controls['T1_nIdSub'].value;
                    this.aParam.push('T1¡nIdSub!' + nIdSub);

                    const aResult = new Array();
                    const _result = await this.service._crudCS(3, this.aParam, this.url);

                    Object.keys( _result ).forEach ( valor => {
                      aResult.push(_result[valor]);
                    });

                    let ftitle = '';
                    let ftext = '';
                    let ftype = '';

                    for (const e of aResult) {
                      const iResult = aResult.indexOf(e);

                      if (e.split('!')[0] !== '00') {
                        if (iResult === 0) {

                          ftitle = 'Registro eliminado';
                          ftext = 'Deberá de calcular para reflejar el cambio en planilla .';
                          ftype = 'success';
                        }
                      } else {
                        ftitle = 'Inconveniente';
                        ftext = e.split('!')[1];
                        ftype = 'error';
                        break;
                      }
                    }

                    this.aParam = [];

                    Swal.fire(
                      ftitle,
                      ftext,
                      (ftype !== 'error') ? 'success' : 'error'
                    );

                    if ( ftype !== 'error' ) {
                      this.countSub = this.countSub + 1;
                      await this.loadEventSub(nIdPerLab, nIdPersonal);
                      this.cleanModal(4);
                    }

                    this.pbSub = false;
                  }
                });

              }
            }
            break;
        }
        break;

      default:
        break;
    }
  }

  async showModal(opc: number, pushParam?: any, index?: number) {
    const self = this;

    switch (opc) {
      case 1:
        if (index === 1) {
          this.pbMain = true;
        } else {
          this.pbSearch = true;
        }

        await this.loadDetail(pushParam);

        if (index !== 1) {
          this.cleanModal(2);
        }

        ( function($) {
          $('#ModalDetail').modal('show');
          $('#ModalDetail').on('shown.bs.modal', function () {
            self.onToggleFab(3, 1);
          });
        })(jQuery);

        if (index === 1) {
          this.pbMain = false;
        } else {
          this.pbSearch = false;
        }
        break;

      case 2:
        this.pbMain = true;

        await this.loadSearch();
        ( function($) {
          $('#ModalSearch').modal('show');
        })(jQuery);

        this.pbMain = false;
        break;

      case 3:
        this.mSub = index;
        if ( index === 1) {

          this.hSub = 'Nuevo';

          this.fgSub.controls['T1_nTipoSub'].enable();
          this.fgSub.controls['T1_dFechIni'].enable();
          this.fgSub.controls['T1_dFechFin'].enable();
          this.fgSub.controls['T1_sCITT'].enable();

        } else {

          this.hSub = 'Detalle';

          this.loadSub(pushParam);

          this.bkSub = pushParam;
        }

        ( function($) {
          $('#ModalDetail').modal('hide');
          $('#ModalSub').modal('show');
          $('#ModalSub').on('shown.bs.modal', function () {
            self.onToggleFab(4, index);
          });
        })(jQuery);
        break;

      default:
        break;
    }
  }

  hideModal(modal: string, opc?: number) {

    let nToogle: number;
    switch (modal) {
      case '#ModalDetail':
        nToogle = 3;
        break;

      case '#ModalSearch':
        nToogle = 0;
        break;

      case '#ModalSub':
        nToogle = 4;
        break;
    }

    this.onToggleFab(nToogle, 0);

    ( function($) {
      $(modal).modal('hide');
    })(jQuery);
  }

  async cleanModal(opc: number) {
    const self = this;

    switch (opc) {
      case 2:
        this.hideModal('#ModalSearch');
        this.fgSearch.controls['sNombres'].setValue('');
        this.SearchDS = new MatTableDataSource([]);
        break;

      case 3:
        if (this.countSub !== 0) {
          this.fgMain.patchValue({
            sNombres: '',
            sCodPlla: '',
            sCiudad: ''
          });
          this.eventMain = [];
          await this.loadMain();
          this.countSub = 0;
          this.selectedRowIndex = null;
        }

        this.hideModal('#ModalDetail');
        this.fgDetail.reset();
        this.DetailDS = new MatTableDataSource([]);
        this.fgFilter.patchValue({
          nIdPerLab: 0,
          dFecha: null
        });
        this.cboPerLab = [];
        break;

      case 4:
        this.hideModal('#ModalSub');

        ( function($) {
          $('#ModalDetail').modal('show');
          $('#ModalDetail').on('shown.bs.modal', function () {
            self.onToggleFab(3, 1);
          });
        })(jQuery);

        this.fgSub.reset();

        this.fgSub.controls['T1_nTipoSub'].disable();
        this.fgSub.controls['T1_dFechIni'].disable();
        this.fgSub.controls['T1_dFechFin'].disable();
        this.fgSub.controls['T1_sCITT'].disable();

        this.eventSub = [];
        this.subDate = new Date();
        this.mSub = 0;
        this.hSub = '';
        this.bkSub = null;

        break;

      default:
        break;
    }
  }

  new_fgMain() {
    this.fgMain = this.fb.group({
      sNombres: '',
      sCodPlla: '',
      sCiudad: ''
    });

    this.fgMain.valueChanges.subscribe(value => {
      const filter = {...value, name: value.sNombres.trim().toLowerCase()} as string;
      this.MainDS.filter = filter;
      this.eventMain = [];
      this.selectedRowIndex = null;

      if (this.MainDS.paginator) {
        this.MainDS.paginator.firstPage();
      }
    });
  }

  new_fgSearch() {
    this.fgSearch = this.fb.group({
      sNombres: ''
    });

    this.fgSearch.valueChanges.subscribe(value => {
      const filter = {...value, name: value.sNombres.trim().toLowerCase()} as string;
      this.SearchDS.filter = filter;

      if (this.SearchDS.paginator) {
        this.SearchDS.paginator.firstPage();
      }
    });
  }

  new_fgDetail() {
    this.fgDetail = this.fb.group({
      nIdPersonal: 0,
      nIdPerLab: 0,
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
      nIdPerLab: 0,
      dFecha: null
    });

    this.fgFilter.valueChanges.subscribe(value => {
      const filter = {...value, name: value.nIdPerLab} as string;
      this.DetailDS.filter = filter;

      if (this.DetailDS.paginator) {
        this.DetailDS.paginator.firstPage();
      }
    });
  }

  new_fgSub() {
    this.fgSub = this.fb.group({
      T1_nIdSub: 0,
      T1_nTipoSub: [{ value: 0, disabled: true }, [ Validators.required, this.valid.noSelect ]],
      T1_dFechIni: [{ value: null, disabled: true }, [ Validators.required ]],
      T1_dFechFin: [{ value: null, disabled: true }, [ Validators.required ]],
      T1_sCITT: [{ value: '', disabled: true }, [ Validators.required ]]
    });

    this.fgSub.valueChanges.subscribe(value => {
      const events = [];
      let calendar = new Date();

      if ( value.T1_dFechIni !== null && value.T1_dFechFin !== null ) {
        const dFechIni = moment(value.T1_dFechIni);
        const dFechFin = moment(value.T1_dFechFin);
        if ( dFechFin.diff(dFechIni, 'days') >= 0 ) {

          calendar = dFechIni.toDate();

          events.push({
            start: dFechIni.toDate(),
            end: dFechFin.toDate(),
            color: ( value.T1_nTipoSub === 1070 ) ? colors.pink : colors.blue,
            title: '',
            allDay: true,
            draggable: false
          });

        }
      }

      this.subDate = calendar;
      this.eventSub = events;
      this.refreshView(2);
    });

  }

  get getMain() { return this.fgMain.controls; }
  get getSearch() { return this.fgSearch.controls; }
  get getDetail() { return this.fgDetail.controls; }
  get getFilter() { return this.fgFilter.controls; }
  get getSub() { return this.fgSub.controls; }

  fnGetParam (kControls: { [key: string]: AbstractControl }, bDirty?: boolean) {

    Object.keys( kControls ).forEach( control => {
      const index = control.indexOf('_');
      let cTable = '', cColum = '', cValue = '', cDirty: boolean;
      if ( index > 0 ) {

        switch (control.substring(0, 1)) {

          case 'A':
            const aControl = kControls[control].value;
            cTable = 'T' + control.substring(1, index);
            cDirty = kControls[control].dirty;

            if ( aControl !== undefined ) {
              Object.keys ( aControl ).forEach( eSub => {
                const iSub = eSub.indexOf('_');
                if ( iSub > 0 ) {
                  cColum = eSub.substring(0, iSub);
                  cValue = aControl[eSub];

                  if ( bDirty === undefined ) {
                    this.aParam.push(cTable + '¡' + cColum + '!' + cValue);
                  } else {
                    if ( cDirty === true ) {
                      this.aParam.push(cTable + '¡' + cColum + '!' + cValue);
                    }
                  }
                }
              });
            }
            break;

          default:
            cTable = control.substring(0, index);
            cColum = control.substring(index + 1 , control.length);
            cDirty = kControls[control].dirty;

            if ( kControls[control].value !== null && kControls[control].value !== undefined ) {

              // tslint:disable-next-line: max-line-length
              cValue = ( cColum.substring(0, 1) === 'd' ) ? moment(new Date(kControls[control].value)).format('MM/DD/YYYY') : kControls[control].value ;

              if ( bDirty === undefined ) {
                this.aParam.push(cTable + '¡' + cColum + '!' + cValue);
              } else {
                if ( cDirty === true ) {
                  this.aParam.push(cTable + '¡' + cColum + '!' + cValue);
                }
              }
            }
            break;
        }

      }
    });
  }

  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms)).then();
  }

  //#endregion

  //#region Control subsidio

  async fnGetPlanilla () {
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    param.push('0¡nIdEmp!' + nIdEmp);
    param.push('0¡bEstado!1');

    await this.service._loadSP( 1, param, this.url).then( (value: any[]) => {
      this.cboPlanilla = value;
    });
  }

  async fnGetCiudad () {
    const param = [];
    param.push('0¡nDadTipEle!694');
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡nIdPais!' + sIdPais);
    param.push('0¡bEstado!1');

    await this.service._loadSP( 2, param, this.url).then( (value: any[]) => {
      this.cboCiudad = value;
    });
  }

  async fnGetTipoSub () {
    const param = [];
    param.push('0¡nDadTipEle!1069');
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡nIdPais!' + sIdPais);

    await this.service._loadSP( 2, param, this.url).then( (value: any[]) => {
      this.cboTipoSub = value;
    });
  }

  //#endregion

  async ngOnInit(): Promise<void> {

    this.fnGetPlanilla();
    this.fnGetCiudad();
    this.fnGetTipoSub();

    this.spi.show('spi_main');
    await this.loadMain();
    this.spi.hide('spi_main');
  }

  async loadMain() {

    const param = [];
    const nEjMes = moment(new Date()).format('YYYYMM');
    param.push('7¡dFechIni!' + nEjMes + '|8¡dFechFin!0');
    await this.service._loadSP( 5, param, this.url).then( (value: any[]) => {

      Object.values ( value ).forEach( (lista: Array<any>, iLista: number) => {

        switch (iLista) {
          case 0:
            this.MainDS = new MatTableDataSource(lista);
            this.MainDS.paginator = this.pagMain;
            this.MainDS.filterPredicate = function(data, filter: string): boolean {
              return data.sNombres.trim().toLowerCase().includes(filter) || data.sDocumento.trim().toLowerCase().includes(filter);
            };

            this.MainDS.filterPredicate = ((data: IMain, filter: any ) => {
              // tslint:disable-next-line: max-line-length
              const a = !filter.sNombres || ( data.sNombres.toLowerCase().includes(filter.sNombres.toLowerCase()) || data.sDocumento.toLowerCase().includes(filter.sNombres.toLowerCase()) );
              const b = !filter.sCodPlla || data.sCodPlla.toLowerCase().includes(filter.sCodPlla);
              const c = !filter.sCiudad || data.sCiudad.toLowerCase().includes(filter.sCiudad.toLowerCase());
              return a && b && c;
            }) as (PeriodicElement, string) => boolean;
            break;

          case 1:
            this.events = [];
            lista.forEach( (_value: IDetail) => {
              this.events.push({
                id: _value.nIdPerLab,
                start: moment(_value.dFechIni).toDate(),
                end: moment(_value.dFechFin).toDate(),
                color: ( _value.nTipoSub === 1070 ) ? colors.pink : colors.blue,
                title: '',
                allDay: true,
                draggable: false
              });
            });
            break;
        }

      });

    });

  }

  showEvent(pushParam: any) {
    this.selectedRowIndex = pushParam;
    this.eventMain = [];
    this.events.filter( (value: any) => {
      return value.id === pushParam.nIdPerLab;
    }).forEach( (value: any) => {
      this.eventMain.push(value);
    });
    this.refreshView(1);
  }

  async loadSearch() {
    const param = [];
    await this.service._loadSP( 3, param, this.url).then( (value: IMain[]) => {
      this.SearchDS = new MatTableDataSource(value);
      this.SearchDS.paginator = this.pagSearch;
      this.SearchDS.filterPredicate = function(data, filter: string): boolean {
        return data.sNombres.trim().toLowerCase().includes(filter) || data.sDocumento.trim().toLowerCase().includes(filter);
      };

      this.SearchDS.filterPredicate = ((data: IMain, filter: IMain ) => {
        // tslint:disable-next-line: max-line-length
        const a = !filter.sNombres || ( data.sNombres.toLowerCase().includes(filter.sNombres.toLowerCase()) || data.sDocumento.toLowerCase().includes(filter.sNombres.toLowerCase()) );
        return a;
      }) as (PeriodicElement, string) => boolean;
    });
  }

  async loadDetail(pushParam: IMain) {

    const nIdPerLab = pushParam.nIdPerLab;
    const nIdPersonal = pushParam.nIdPersonal;

    await this.loadEventSub(nIdPerLab, nIdPersonal);

    this.fgDetail.patchValue({
      nIdPersonal: nIdPersonal,
      nIdPerLab: nIdPerLab,
      sNombres: pushParam.sNombres,
      sTipo: pushParam.sDscTipo,
      sDocumento: pushParam.sDocumento,
      sCiudad: pushParam.sCiudad,
      dFechIni: pushParam.dFechIni,
      dFechFin: pushParam.dFechFin,
      sCodPlla: pushParam.sCodPlla
    });

  }

  loadSub(aSub: any) {
    this.fgSub.reset();
    this.fgSub.patchValue({
      T1_nIdSub: aSub.nIdSub,
      T1_nTipoSub: aSub.nTipoSub,
      T1_dFechIni: aSub.dFechIni,
      T1_dFechFin: aSub.dFechFin,
      T1_sCITT: aSub.sCITT
    });

    this.fgSub.controls['T1_nTipoSub'].disable();
    this.fgSub.controls['T1_dFechIni'].disable();
    this.fgSub.controls['T1_dFechFin'].disable();
    this.fgSub.controls['T1_sCITT'].disable();

    const dFechIni = moment(aSub.dFechIni).toDate();
    const dFechFin = moment(aSub.dFechFin).toDate();

    this.eventSub = [];
    this.subDate = dFechIni;
    this.eventSub.push({
      start: dFechIni,
      end: dFechFin,
      color: ( aSub.nTipoSub === 1070 ) ? colors.pink : colors.blue,
      title: '',
      allDay: true,
      draggable: false
    });
    this.refreshView(2);
  }

  async loadEventSub(nIdPerLab: number, nIdPersonal: number) {

    this.pbDetail = true;

    const param = [];
    param.push('0¡nIdPersonal!' + nIdPersonal);
    await this.service._loadSP( 4, param, this.url).then( (value: any[]) => {

      Object.values ( value ).forEach( (lista: Array<any>, iLista: number) => {

        switch (iLista) {
          case 0:
            this.DetailDS = new MatTableDataSource(lista);
            this.DetailDS.paginator = this.pagDetail;
            this.DetailDS.filterPredicate = function(data, filter: string): boolean {
              return data.sCITT.trim().toLowerCase().includes(filter);
            };

            this.DetailDS.filterPredicate = ((data: IDetail, filter: any ) => {
              const a = !filter.nIdPerlab || data.nIdPerLab === filter.nIdPerlab;
              const b = !filter.dFecha || between( Number(moment(filter.dFecha).format('YYYYMMDD')), Number(moment(data.dFechIni).format('YYYYMMDD')), Number(moment(data.dFechFin).format('YYYYMMDD')) );
              // console.log(b);
              return a && b;
            }) as (PeriodicElement, string) => boolean;
            break;

          case 1:
            this.cboPerLab = lista;
            this.fgFilter.controls['nIdPerLab'].setValue(nIdPerLab);
            break;
        }

      });

    });

    this.pbDetail = false;
  }

  async saveSub(opc: number) {

    this.pbSub = true;

    this.aParam = [];

    if (this.fgSub.invalid) {
      Swal.fire(
        'No se puede guardar',
        'Información incorrecta o incompleta',
        'error'
      );

      this.pbSub = false;
      return;
    } else {

      // Validamos cruce de fechas
      const fControl = this.fgSub.controls['T1_nIdSub'] as FormControl;
      let nError = 0;

      const newIni = moment(this.fgSub.controls['T1_dFechIni'].value);
      const nNewIni = Number(newIni.format('YYYYMMDD'));

      const newFin = moment(this.fgSub.controls['T1_dFechFin'].value);
      const nNewFin = Number(newFin.format('YYYYMMDD'));

      const aData = this.DetailDS.data.filter( x => {
        return x.nIdSub !== fControl.value;
      } );

      for ( let i = 0; i < aData.length; i++ ) {

        const x = aData[i];

        const ndFechIni = Number(moment(x.dFechIni).format('YYYYMMDD'));
        const ndFechFin = Number(moment(x.dFechFin).format('YYYYMMDD'));

        const a = between( nNewIni, ndFechIni, ndFechFin );
        const b = between( nNewFin, ndFechIni, ndFechFin );
        const c = between( ndFechIni, nNewIni, nNewFin );
        const d = between( ndFechFin, nNewIni, nNewFin );

        nError = ( ( a || b || c || d ) ) ? nError + 1 : nError;

      }

      if ( nError > 0 ) {
        this._snackBar.open('Las fechas se cruzan con registros existentes.', 'Cerrar', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
        this.pbSub = false;
        return;
      }

      // Usuario y Fecha con hora
      const user = localStorage.getItem('currentUser');
      const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

      const nIdPerLab = this.fgDetail.controls['nIdPerLab'].value;
      const nIdPersonal = this.fgDetail.controls['nIdPersonal'].value;

      let oModo: boolean;

      if (opc === 1) {
        this.aParam.push('T0¡nIdRegUser!' + uid);
        this.aParam.push('T0¡dtReg!GETDATE()');
        this.aParam.push('T1¡nIdPerLab!' + nIdPerLab);

        fControl.setValue(null);
        oModo = false;
      } else {
        this.aParam.push('T1¡nIdModUser!' + uid);
        this.aParam.push('T1¡dtMod!GETDATE()');
        fControl.markAsDirty();
        oModo = true;
      }

      this.fnGetParam(this.fgSub.controls, oModo);

      const aResult = new Array();
      const result = await this.service._crudCS(opc, this.aParam, this.url);

      Object.keys( result ).forEach ( valor => {
        aResult.push(result[valor]);
      });

      let ftitle = '';
      let ftext = '';
      let ftype = '';

      for (const e of aResult) {
        const iResult = aResult.indexOf(e);

        if (e.split('!')[0] !== '00') {
          if (iResult === 0) {

            ftitle = (opc === 1) ? 'Registro satisfactorio' : 'Modificación satisfactoria';
            ftext = 'El subsidio sirve de base para el cálculo de planilla.';
            ftype = 'success';
          }
        } else {
          ftitle = 'Inconveniente';
          ftext = e.split('!')[1];
          ftype = 'error';
          break;
        }
      }

      this.aParam = [];

      Swal.fire(
        ftitle,
        ftext,
        (ftype !== 'error') ? 'success' : 'error'
      );

      if ( ftype !== 'error' ) {
        this.countSub = this.countSub + 1;
        await this.loadEventSub(nIdPerLab, nIdPersonal);
        this.cleanModal(4);
      }

      this.pbSub = false;
      return ;

    }


  }

  refreshView(opc: number): void {
    switch (opc) {
      case 1:
        this.refresh.next();
        break;

      case 2:
        this.refreshSub.next();
        break;
    }
  }

  chosenYearHandler(normalizedYear: moment.Moment) {
    let ctrlValue = this.fgFilter.controls['dFecha'].value;
    ctrlValue = ( ctrlValue === null ) ? moment() : ctrlValue;
    ctrlValue.year(normalizedYear.year());
    this.fgFilter.controls['dFecha'].setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    let ctrlValue = this.fgFilter.controls['dFecha'].value;
    ctrlValue = ( ctrlValue === null ) ? moment() : ctrlValue;
    ctrlValue.month(moment(normalizedMonth).month());
    this.fgFilter.controls['dFecha'].setValue(ctrlValue);
    datepicker.close();
  }

}
