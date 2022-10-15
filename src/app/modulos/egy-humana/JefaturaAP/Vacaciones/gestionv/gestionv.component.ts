import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { GestionvService } from '../../Services/gestionv.service';
import { ErrorStateMatcher } from '@angular/material/core';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { Moment } from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { CustomDateFormatter } from '../../Config/configCalendar';
import { CalendarDateFormatter, CalendarEvent, CalendarView, DAYS_OF_WEEK } from 'angular-calendar';
import { IList, IMain, IDetail, IVac } from '../../Model/Igestionv';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatSort } from '@angular/material/sort';
import { ValidadoresService } from '../../Validators/validadores.service';
import { adminpAnimations } from '../../Animations/adminp.animations';
import { param } from 'jquery';

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
  yellow: {
    primary: '#f9d466',
    secondary: '#f5e4b2',
  },
  blue: {
    primary: '#1e90ffd1',
    secondary: '#D1E8FF',
  },
  green: {
    primary: '#87dea0',
    secondary: '#e8fde7',
  },
  red: {
    primary: '#ffaeae',
    secondary: '#ea6767',
  },
  pink: {
    primary: '#ff4081b0',
    secondary: '#FAE3E3',
  }
};

@Component({
  selector: 'app-gestionv',
  templateUrl: './gestionv.component.html',
  styleUrls: ['./gestionv.component.css', './gestionv.component.scss'],
  providers: [ GestionvService,
    {provide: CalendarDateFormatter, useClass: CustomDateFormatter} ],
  animations: [ adminpAnimations ]
})
export class GestionvComponent implements OnInit {

  //#region Variables
  matcher = new MyErrorStateMatcher();

  // Service GET && POST
  url: string;
  aParam = [];

  // Fab
  fbMain = [
    {icon: 'history', tool: 'Histórico ( Ex - miembros )'}
  ];
  abMain = [];
  tsMain = 'inactive';

  fbDetail = [
    {icon: 'date_range', tool: 'Programar vacaciones'}
  ];
  abDetail = [];
  tsDetail = 'inactive';

  fbNew = [
    {icon: 'save', tool: 'Guardar', dis: false},
    {icon: 'cancel', tool: 'Cancelar', dis: false}
  ];
  fbView = [
    {icon: 'event_available', tool: 'Aprobar', dis: false},
    {icon: 'event_busy', tool: 'Desestimar', dis: false},
  ];
  abVac = [];
  tsVac = 'inactive';

  // Progress Bar
  pbMain: boolean;
  pbDetail: boolean;
  pbVac: boolean;

  // Combobox
  cboPlanilla: any;
  cboEstadoMain: any;
  cboEstado: any;

  // Calendar properties
  locale = 'es';
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.MONDAY, DAYS_OF_WEEK.SUNDAY];
  view: CalendarView = CalendarView.Month;

  // Calendar setup
  vacDate: Date = new Date();
  eventVac: CalendarEvent[] = [];
  refreshVac: Subject<any> = new Subject();

  // Mat Table
  MainDC: string[] = [ 'action', 'sNombres', 'sCodPlla', 'sDscTipo', 'sDocumento', 'nCant' ];
  MainDS: MatTableDataSource<IMain>;
  @ViewChild('pagMain', {static: true}) pagMain: MatPaginator;
  @ViewChild(MatSort, {static: true}) sortMain: MatSort;
  bkList: IList[];

  DetailDC: string[] = [ 'action', 'dFechIni', 'dFechFin', 'sEstado' ];
  DetailDS: MatTableDataSource<IDetail>;
  @ViewChild('pagDetail', {static: true}) pagDetail: MatPaginator;

  VacDC: string[] = [ 'action', 'sNombres', 'sCodPlla', 'sDscTipo', 'sDocumento', 'nCant' ];
  VacDS: MatTableDataSource<IVac>;
  @ViewChild('pagVac', {static: true}) pagVac: MatPaginator;
  indexVac: number;
  arrayVac: IVac[] = [];

  // FormGroup
  fgMain: FormGroup;
  fgInfoPerso: FormGroup;
  fgDetail: FormGroup;
  fgFilter: FormGroup;
  fgVac: FormGroup;

  // Vacacion
  countVacacion: number;
  hVac: string;
  mVac: number;
  bkVac: any;
  toggleVac: number;

  //#endregion

  constructor(public service: GestionvService, @Inject('BASE_URL') baseUrl: string,
              private fb: FormBuilder, private spi: NgxSpinnerService,
              private _snackBar: MatSnackBar, private valid: ValidadoresService) {

    // SERVICE GET && POST
    this.url = baseUrl;
    this.countVacacion = 0;
    this.mVac = 0;
    this.toggleVac = 0;
    this.indexVac = -1;

    this.new_fgInforPerso();
    this.new_fgMain();
    this.new_fgDetail();
    this.new_fgFilter();
    this.new_fgVac();
  }

  //#region General

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

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = ( stat === -1 ) ? ( this.abMain.length > 0 ) ? 0 : 1 : stat;
        this.tsMain = ( stat === 0 ) ? 'inactive' : 'active';
        this.abMain = ( stat === 0 ) ? [] : this.fbMain;
        break;

      case 2:
        stat = ( stat === -1 ) ? ( this.abDetail.length > 0 ) ? 0 : 1 : stat;
        this.tsDetail = ( stat === 0 ) ? 'inactive' : 'active';
        this.abDetail = ( stat === 0 ) ? [] : this.fbDetail;
        break;

      case 3:
        stat = ( stat === -1 ) ? ( this.abVac.length > 0 ) ? 0 : 1 : stat;
        this.tsVac = ( stat === 0 ) ? 'inactive' : 'active';
        this.abVac = ( stat === 0 ) ? [] : this.fbNew;
        break;

      case 4:
        stat = ( stat === -1 ) ? ( this.abVac.length > 0 ) ? 0 : 1 : stat;
        this.tsVac = ( stat === 0 ) ? 'inactive' : 'active';
        this.abVac = ( stat === 0 ) ? [] : this.fbView;
        break;
    }
  }

  async clickFab(opc: number, index: number) {
    switch (opc) {
      // Fab Main
      case 1:
        switch (index) {
          // Historial ( Ex - miembros )
          case 0:
            break;
        }
        break;

      // Fab Detail
      case 2:
        switch (index) {
          // Cerrar
          case -1:
            await this.cleanModal(1);
            break;

          // Programar vacaciones
          case 0:
            this.showModal(2, undefined, 2);
            break;
        }
        break;

      // Fab Vac (New)
      case 3:
        switch (index) {
          // Cerrar
          case -1:
            this.cleanModal(2);
            break;

          // Guardar
          case 0:
            Swal.fire({
              title: '¿ Está seguro de guardar ?',
              text: 'La solicitud de vacación es válida únicamente luego de recepcionar el documento en RRHH.',
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#ff4081',
              confirmButtonText: 'Confirmar !',
              allowOutsideClick: false
            }).then((result) => {
              if (result.isConfirmed) {
                this.saveVac();
              }
            });
            break;

          // Cancelar
          case 1:
            this.cleanModal(2);
            break;
        }
        break;

      // Fab Vac (View)
      case 4:
        switch (index) {
          // Cerrar
          case -1:
            this.cleanModal(2);
            break;

          // Aprobar : 0 | Desestimar : 1
          case 0:
          case 1:
            Swal.fire({
              title: '¿ Está seguro de ' + ( (index === 0) ? 'aprobar' : 'desestimar' )  + ' la solicitud ?',
              text: 'No se podrá deshacer los cambios realizados.',
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#ff4081',
              confirmButtonText: 'Confirmar !',
              allowOutsideClick: false
            }).then((result) => {
              if (result.isConfirmed) {
                this.updateVac(index);
              }
            });
            break;
        }
        break;

    }
  }

  async showModal(opc: number, pushParam?: any, index?: number) {
    const self = this;
    switch (opc) {
      // Main
      case 1:
        this.pbMain = true;

        await this.loadDetail(pushParam);

        ( function($) {
          $('#ModalDetail').modal('show');
          $('#ModalDetail').on('shown.bs.modal', function () {
            self.onToggleFab(2, 1);
          });
        })(jQuery);

        this.pbMain = false;
        break;

      // Detail
      case 2:

        this.pbDetail = true;

        this.fgVac.patchValue({
          sTipo: this.fgDetail.controls['sTipo'].value,
          sDocumento: this.fgDetail.controls['sDocumento'].value,
          sNombres: this.fgDetail.controls['sNombres'].value
        });

        // View : 1 | New : 2
        if (index === 1 ) {
          this.hVac = 'Gestionar';

          this.loadVac(pushParam);
          this.compareVac();

          this.bkVac = pushParam;
          this.toggleVac = 4;
        } else {
          this.hVac = 'Programar';

          this.fgVac.controls['T1_dFechIni'].enable();
          this.fgVac.controls['T1_dFechFin'].enable();

          this.eventVac = [];
          this.toggleVac = 3;
          this.mVac = 1;
        }

        ( function($) {
          $('#ModalDetail').modal('hide');
          $('#ModalVac').modal('show');
          $('#ModalVac').on('shown.bs.modal', function () {
            self.onToggleFab(self.toggleVac, 1);
          });
        })(jQuery);

        this.pbDetail = false;
        break;
    }
  }

  async cleanModal(opc: number) {
    const self = this;

    switch (opc) {
      case 1:
        if (this.countVacacion !== 0) {
          this.fgMain.patchValue({
            sNombres: '',
            sCodPlla: '',
            sCiudad: ''
          });
          await this.loadMain();
          this.countVacacion = 0;
        }

        this.hideModal('#ModalDetail');
        this.fgDetail.reset();
        this.fgFilter.patchValue({
          dFecha: null,
          nEstado: 0
        });
        this.DetailDS = new MatTableDataSource([]);
        break;

      case 2:
        this.hideModal('#ModalVac');

        ( function($) {
          $('#ModalDetail').modal('show');
          $('#ModalDetail').on('shown.bs.modal', function () {
            self.onToggleFab(2, 1);
          });
        })(jQuery);

        this.fgVac.reset();

        this.fgVac.controls['T1_dFechIni'].disable();
        this.fgVac.controls['T1_dFechFin'].disable();

        this.VacDS = new MatTableDataSource([]);

        this.fbView.forEach( x => {
          x.dis = false;
        });

        this.eventVac = [];
        this.vacDate = new Date();
        this.mVac = 0;
        this.hVac = '';
        this.bkVac = null;
        this.toggleVac = 0;
        this.indexVac = -1;
        break;
    }
  }

  hideModal(modal: string) {
    let nToogle: number;
    switch (modal) {

      case '#ModalDetail':
        nToogle = 2;
        break;

      case '#ModalVac':
        nToogle = this.toggleVac;
        break;
    }

    this.onToggleFab(nToogle, 0);

    ( function($) {
      $(modal).modal('hide');
    })(jQuery);
  }

  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms)).then();
  }

  //#endregion

  //#region FormGroup

  new_fgInforPerso() {
    this.fgInfoPerso = this.fb.group({
      nIdPersonal: 0,
      sNombres: '',
      sTipo: '',
      sDocumento: '',
    });
  }

  new_fgMain() {
    this.fgMain = this.fb.group({
      sNombres: '',
      sCodPlla: '',
      bEstado: 0
    });

    this.fgMain.valueChanges.subscribe(value => {
      const filter = {...value, name: value.sNombres.trim().toLowerCase()} as string;
      this.MainDS.filter = filter;

      if (this.MainDS.paginator) {
        this.MainDS.paginator.firstPage();
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
      dFecha: null,
      nEstado: 0,
      sEstado: ''
    });

    this.fgFilter.valueChanges.subscribe(value => {
      const filter = {...value, name: value.sEstado.trim().toLowerCase()} as string;
      this.DetailDS.filter = filter;

      if (this.DetailDS.paginator) {
        this.DetailDS.paginator.firstPage();
      }
    });
  }

  new_fgVac() {
    this.fgVac = this.fb.group({
      T1_nIdReqVac: 0,
      sTipo: [ { value: '', disabled: true } ],
      sDocumento: [ { value: '', disabled: true } ],
      sNombres: [ { value: '', disabled: true } ],
      T1_dFechIni: [{ value: null, disabled: true }, [ Validators.required ]],
      T1_dFechFin: [{ value: null, disabled: true }, [ Validators.required ]]
    });

    this.fgVac.valueChanges.subscribe( value => {

      this.subEvents(value);
      this.subTable(value);

    });
  }

  subEvents(pushParam: any) {

    // Calendario
    let calendar = new Date();

    // Eventos
    const events: CalendarEvent[] = [];
    this.eventVac = [];

    if ( pushParam.T1_dFechIni !== null && pushParam.T1_dFechFin !== null ) {

      const dFechIni = moment(pushParam.T1_dFechIni);
      const dFechFin = moment(pushParam.T1_dFechFin);

      if ( dFechFin.diff(dFechIni, 'days') >= 0 ) {

        const nIdPersonal = this.fgDetail.controls['nIdPersonal'].value;

        calendar = dFechIni.toDate();

        events.push({
          start: dFechIni.toDate(),
          end: dFechFin.toDate(),
          color: colors.green,
          title: '',
          allDay: true,
          draggable: false,
          meta: nIdPersonal
        });

      }

    }

    this.vacDate = calendar;
    this.eventVac = events;
    this.refreshView();
  }

  subTable(pushParam: any) {

    const aResult: IVac[] = [];

    if ( pushParam.T1_dFechIni !== null && pushParam.T1_dFechFin !== null ) {

      const dFechIni = moment(pushParam.T1_dFechIni);
      const nNewIni = Number(dFechIni.format('YYYYMMDD'));

      const dFechFin = moment(pushParam.T1_dFechFin);
      const nNewFin = Number(dFechFin.format('YYYYMMDD'));

      if ( dFechFin.diff(dFechIni, 'days') >= 0 ) {

        const nIdPersonal = this.fgDetail.controls['nIdPersonal'].value;

        const result = this.bkList.filter( x => {

          const a = x.nIdPersonal !== nIdPersonal;
          const b = ( x.nIdEstado === 2150 || x.nIdEstado === 2152 );
          const c = x.dIniVac !== null && x.dFinVac !== null;

          return a && b && c;

        });

        for ( let i = 0; i < result.length; i++ ) {
          const x = result[i];

          const ndFechIni = Number(moment(x.dIniVac).format('YYYYMMDD'));
          const ndFechFin = Number(moment(x.dFinVac).format('YYYYMMDD'));

          const a = between( nNewIni, ndFechIni, ndFechFin );
          const b = between( nNewFin, ndFechIni, ndFechFin );
          const c = between( ndFechIni, nNewIni, nNewFin );
          const d = between( ndFechFin, nNewIni, nNewFin );

          if ( a || b || c || d ) {
            const aIndex = aResult.findIndex( y => y.nIdPersonal === x.nIdPersonal );
            if ( aIndex === -1 ) {
              aResult.push({
                nIdPersonal: x.nIdPersonal,
                sNombres: x.sNombres,
                sCodPlla: x.sCodPlla,
                sDscTipo: x.sDscTipo,
                sDocumento: x.sDocumento,
                nCant: 1,
              });
            } else {
              aResult[aIndex].nCant = aResult[aIndex].nCant + 1;
            }
          }
        }

      }

    }

    this.VacDS = new MatTableDataSource(aResult);
    this.VacDS.paginator = this.pagVac;
  }

  get getInfoPerso() { return this.fgInfoPerso.controls; }
  get getMain() { return this.fgMain.controls; }
  get getDetail() { return this.fgDetail.controls; }
  get getFilter() { return this.fgFilter.controls; }
  get getVac() { return this.fgVac.controls; }

  //#endregion

  //#region Combobox

  async fnGetPlanilla () {
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    param.push('0¡nIdEmp!' + nIdEmp);
    param.push('0¡bEstado!1');

    await this.service._loadSP( 1, param, this.url).then( (value: any[]) => {
      this.cboPlanilla = value;
    });
  }

  async CboEstadoMain () {

    const dato = {
      Value : 1,
      Name : 'Pendiente(s)'
    };

    const dato2 = {
      Value : 2,
      Name : 'Sin novedades'
    };

    const param = [];
    param.push(dato);
    param.push(dato2);
    this.cboEstadoMain = param;
  }

  async fnGetEstado () {
    const param = [];
    param.push('0¡nEleCodDad!2148');

    await this.service._loadSP( 2, param, this.url).then( (value: any[]) => {
      this.cboEstado = value;
    });
  }

  //#endregion

  async ngOnInit(): Promise<void> {
    this.spi.show('spi_main');

    await this.fnGetPlanilla();
    await this.fnGetEstado();
    await this.CboEstadoMain();

    const user = localStorage.getItem('currentUser');
    const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

    const param = [];
    param.push('0¡nCodUser!' + uid);

    await this.service._loadSP( 3, param, this.url).then( async (value: any[]) => {
      if ( value.length > 0 ) {

        this.fgInfoPerso.patchValue({
          nIdPersonal: value[0].nIdPersonal,
          sNombres: value[0].sNombres,
          sTipo: value[0].sTipo,
          sDocumento: value[0].sDocumento,
        });

        await this.loadMain();

        this.spi.hide('spi_main');

      } else {
        this._snackBar.open('Usuario no cuenta con relación de personal.', 'Cerrar', {
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      }
    });

  }

  //#region load

  async loadMain() {
    const param = [];

    const nIdResp = this.fgInfoPerso.controls['nIdPersonal'].value;
    param.push('0¡K.nIdResp!' + nIdResp + '-0¡A.nIdResp!' + nIdResp);

    await this.service._loadSP( 4, param, this.url).then( (value: IList[]) => {

      this.bkList = value;
      const aGroup: IMain[] = [];

      value.forEach( x => {
        const aIndex = aGroup.findIndex( y => y.nIdPersonal === x.nIdPersonal );
        if ( aIndex === -1 ) {
          aGroup.push({
            nIdPersonal: x.nIdPersonal,
            sNombres: x.sNombres,
            sCodPlla: x.sCodPlla,
            sTipo: x.sTipo,
            sDscTipo: x.sDscTipo,
            sDocumento: x.sDocumento,
            dFechIni: x.dFechIni,
            dFechFin: x.dFechFin,
            sCiudad: x.sCiudad,
            nCant: (x.nIdEstado === 2149) ? 1 : 0,
          });
        } else {
          if ( x.nIdEstado === 2149 ) {
            aGroup[aIndex].nCant = aGroup[aIndex].nCant + 1;
          }
        }
      });

      this.MainDS = new MatTableDataSource(aGroup);
      this.MainDS.paginator = this.pagMain;
      // this.MainDS.sort = this.sortMain;

      this.MainDS.filterPredicate = function(data, filter: string): boolean {
        return data.sNombres.trim().toLowerCase().includes(filter);
      };

      this.MainDS.filterPredicate = ((data: IMain, filter: any ) => {
        // tslint:disable-next-line: max-line-length
        const a = !filter.sNombres || ( data.sNombres.toLowerCase().includes(filter.sNombres.toLowerCase()) || data.sDocumento.toLowerCase().includes(filter.sNombres.toLowerCase()) );
        const b = !filter.sCodPlla || data.sCodPlla.toLowerCase().includes(filter.sCodPlla);
        const c = !filter.bEstado  ||  (filter.bEstado === 1  ? data.nCant > 0 : data.nCant === 0);
        // !filter.bEstado  ||  filter.bEstado === '1'  ? data.nCant > 0 : data.nCant === 0;
        return a && b && c;
      }) as (PeriodicElement, string) => boolean;

    });
  }

  async loadDetail(pushParam: IMain) {

    this.fgDetail.patchValue({
      nIdPersonal: pushParam.nIdPersonal,
      sNombres: pushParam.sNombres,
      sCodPlla: pushParam.sCodPlla,
      sTipo: pushParam.sDscTipo,
      sDocumento: pushParam.sDocumento,
      dFechIni: pushParam.dFechIni,
      dFechFin: pushParam.dFechFin,
      sCiudad: pushParam.sCiudad
    });

    await this.loadVacaciones();
  }

  async loadVacaciones() {

    this.pbDetail = true;

    const nIdPersonal = this.fgDetail.controls['nIdPersonal'].value;
    const nIdResp = this.fgInfoPerso.controls['nIdPersonal'].value;

    const param = [];
    param.push('0¡nIdPersonal!' + nIdPersonal);
    param.push('0¡nIdResp!' + nIdResp);

    await this.service._loadSP( 5, param, this.url).then( async (value: IDetail[]) => {

      this.DetailDS = new MatTableDataSource(value);
      this.DetailDS.paginator = this.pagDetail;

      this.DetailDS.filterPredicate = function(data, filter: string): boolean {
        return data.sEstado.trim().toLowerCase().includes(filter.toLowerCase());
      };

      this.DetailDS.filterPredicate = ((data: IDetail, filter: any ) => {
        // tslint:disable-next-line: max-line-length
        const a = !filter.nEstado || data.nIdEstado === filter.nEstado;
        const b = !filter.dFecha || ( moment(data.dFechIni).format('MM/YYYY') === moment(filter.dFecha).format('MM/YYYY') );
        return a && b;
      }) as (PeriodicElement, string) => boolean;

    });

    this.pbDetail = false;
  }

  loadVac(aVac: any) {

    this.fgVac.patchValue({
      T1_nIdReqVac: aVac.nIdReqVac,
      T1_dFechIni: aVac.dFechIni,
      T1_dFechFin: aVac.dFechFin
    });

    let sColor: any;
    switch (aVac.nIdEstado) {
      // Pendiente
      case 2149:
        sColor = colors.yellow;
        break;

      // Aprobado && Recepcionado
      case 2150:
      case 2152:
        this.fbView.forEach( x => {
          x.dis = true;
        });
        sColor = colors.green;
        break;

      // Desestimado
      case 2151:
        this.fbView.forEach( x => {
          x.dis = true;
        });
        sColor = colors.red;
        break;

    }

    this.fgVac.controls['T1_dFechIni'].disable();
    this.fgVac.controls['T1_dFechFin'].disable();

    const dFechIni = moment(aVac.dFechIni).toDate();
    const dFechFin = moment(aVac.dFechFin).toDate();

    const nIdPersonal = this.fgDetail.controls['nIdPersonal'].value;

    this.eventVac = [];
    this.vacDate = dFechIni;
    this.eventVac.push({
      start: dFechIni,
      end: dFechFin,
      color: sColor,
      title: 'Inicio : ' + moment(dFechIni).format('DD/MM/YYYY') + ' - Termino : ' + moment(dFechFin).format('DD/MM/YYYY'),
      allDay: true,
      draggable: false,
      meta: nIdPersonal,
    });
    this.refreshView();
  }

  compareVac() {

    const dFechIni = moment(this.fgVac.controls['T1_dFechIni'].value);
    const nNewIni = Number(dFechIni.format('YYYYMMDD'));

    const dFechFin = moment(this.fgVac.controls['T1_dFechFin'].value);
    const nNewFin = Number(dFechFin.format('YYYYMMDD'));

    const aResult: IVac[] = [];

    if ( dFechFin.diff(dFechIni, 'days') >= 0 ) {

      const nIdPersonal = this.fgDetail.controls['nIdPersonal'].value;

      const result = this.bkList.filter( x => {

        const a = x.nIdPersonal !== nIdPersonal;
        const b = ( x.nIdEstado === 2150 || x.nIdEstado === 2152 );
        const c = x.dIniVac !== null && x.dFinVac !== null;

        return a && b && c;
      });


      for ( let i = 0; i < result.length; i++ ) {
        const x = result[i];

        const ndFechIni = Number(moment(x.dIniVac).format('YYYYMMDD'));
        const ndFechFin = Number(moment(x.dFinVac).format('YYYYMMDD'));

        const a = between( nNewIni, ndFechIni, ndFechFin );
        const b = between( nNewFin, ndFechIni, ndFechFin );
        const c = between( ndFechIni, nNewIni, nNewFin );
        const d = between( ndFechFin, nNewIni, nNewFin );

        if ( a || b || c || d ) {
          const aIndex = aResult.findIndex( y => y.nIdPersonal === x.nIdPersonal );
          if ( aIndex === -1 ) {
            aResult.push({
              nIdPersonal: x.nIdPersonal,
              sNombres: x.sNombres,
              sCodPlla: x.sCodPlla,
              sDscTipo: x.sDscTipo,
              sDocumento: x.sDocumento,
              nCant: 1,
            });
          } else {
            aResult[aIndex].nCant = aResult[aIndex].nCant + 1;
          }
        }
      }

    }

    this.VacDS = new MatTableDataSource(aResult);
    this.VacDS.paginator = this.pagVac;
  }

  async saveVac() {
    this.pbVac = true;

    this.aParam = [];

    if (this.fgVac.invalid) {
      Swal.fire(
        'No se puede guardar',
        'Información incorrecta o incompleta',
        'error'
      );

      this.pbVac = false;
      return;
    } else {

      // Validamos el cruce de fechas
      let nError = 0;

      const newIni = moment(this.fgVac.controls['T1_dFechIni'].value);
      const nNewIni = Number(newIni.format('YYYYMMDD'));

      const newFin = moment(this.fgVac.controls['T1_dFechFin'].value);
      const nNewFin = Number(newFin.format('YYYYMMDD'));

      const aData = this.DetailDS.data;
      const aFilter = aData.filter( x => x.nIdEstado !== 2151 );

      for ( let i = 0; i < aFilter.length; i++ ) {

        const x = aFilter[i];

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
        this.pbVac = false;
        return;
      }

      this.fgVac.controls['T1_nIdReqVac'].setValue(null);
      this.fnGetParam(this.fgVac.controls);

      // Usuario y Fecha con hora
      const user = localStorage.getItem('currentUser');
      const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

      this.aParam.push('T0¡nIdRegUser!' + uid);
      this.aParam.push('T0¡dtReg!GETDATE()');

      // Personal y Responsable
      const nIdPersonal = this.fgDetail.controls['nIdPersonal'].value;
      const nIdResp = this.fgInfoPerso.controls['nIdPersonal'].value;

      this.aParam.push('T1¡nIdEstado!2150');
      this.aParam.push('T1¡nIdPersonal!' + nIdPersonal);
      this.aParam.push('T1¡nIdResp!' + nIdResp);

      const aResult = new Array();
      const result = await this.service._crudGV(1, this.aParam, this.url);

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

            ftitle = 'Registro satisfactorio';
            ftext = 'Las vacaciones fueron programadas correctamente.';
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
        this.countVacacion = this.countVacacion + 1;
        await this.loadVacaciones();
        this.cleanModal(2);
      }

      this.pbVac = false;
      return ;
    }
  }

  async updateVac(opc: number) {
    this.pbVac = true;

    this.aParam = [];

    const nIdReqVac = this.fgVac.controls['T1_nIdReqVac'].value;
    this.aParam.push('T1¡nIdReqVac!' + nIdReqVac);
    this.aParam.push('T1¡nIdEstado!' + ( ( opc === 0 ) ? '2150' : '2151') );

    // Usuario y Fecha con hora
    const user = localStorage.getItem('currentUser');
    const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

    this.aParam.push('T1¡nIdModUser!' + uid);
    this.aParam.push('T1¡dtMod!GETDATE()');

    const aResult = new Array();
    const result = await this.service._crudGV(2, this.aParam, this.url);

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

          ftitle = ( (opc === 0) ? 'Aprobación' : 'Desestimación' ) + ' satisfactorio';
          ftext = 'Las vacaciones fueron ' + ( (opc === 0) ? 'aprobadas' : 'desestimadas' ) + ' correctamente.';
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
      this.countVacacion = this.countVacacion + 1;
      await this.loadVacaciones();
      this.cleanModal(2);
    }

    this.pbVac = false;
    return ;
  }

  viewEvents(pushParam: any) {

    const index = this.VacDS.filteredData.indexOf(pushParam);

    let nIdPersonal = this.fgDetail.controls['nIdPersonal'].value;

    const dFechIni = moment(this.fgVac.controls['T1_dFechIni'].value);
    const nNewIni = Number(dFechIni.format('YYYYMMDD'));

    const dFechFin = moment(this.fgVac.controls['T1_dFechFin'].value);
    const nNewFin = Number(dFechFin.format('YYYYMMDD'));

    const events: CalendarEvent[] = [];
    this.eventVac.filter( x => {
      return x.meta === nIdPersonal;
    }).forEach( x => {
      events.push(x);
    });

    if ( this.indexVac !== index ) {

      nIdPersonal = pushParam.nIdPersonal;
      const result = this.bkList.filter( x => {

        const a = x.nIdPersonal === nIdPersonal;
        const b = ( x.nIdEstado === 2150 || x.nIdEstado === 2152 ) ;
        const c = x.dIniVac !== null && x.dFinVac !== null;

        return a && b && c;

      });

      for ( let i = 0; i < result.length; i++ ) {
        const x = result[i];

        const ndFechIni = Number(moment(x.dIniVac).format('YYYYMMDD'));
        const ndFechFin = Number(moment(x.dFinVac).format('YYYYMMDD'));

        const a = between( nNewIni, ndFechIni, ndFechFin );
        const b = between( nNewFin, ndFechIni, ndFechFin );
        const c = between( ndFechIni, nNewIni, nNewFin );
        const d = between( ndFechFin, nNewIni, nNewFin );

        if ( a || b || c || d ) {

          events.push({
            start: moment(x.dIniVac).toDate(),
            end: moment(x.dFinVac).toDate(),
            color: colors.pink,
            title: 'Inicio : ' + moment(x.dIniVac).format('DD/MM/YYYY') + ' - Termino : ' + moment(x.dFinVac).format('DD/MM/YYYY'),
            allDay: true,
            draggable: false,
            meta: nIdPersonal
          });

        }
      }

      this.indexVac = index;

    } else {
      this.indexVac = -1;
    }

    this.eventVac = events;
    this.refreshView();

  }

  //#endregion

  //#region Extra

  chosenYearHandler(normalizedYear: Moment) {
    let ctrlValue = this.fgFilter.controls['dFecha'].value;
    ctrlValue = ( ctrlValue === null ) ? moment() : ctrlValue;
    ctrlValue.year(normalizedYear.year());
    this.fgFilter.controls['dFecha'].setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    let ctrlValue = this.fgFilter.controls['dFecha'].value;
    ctrlValue = ( ctrlValue === null ) ? moment() : ctrlValue;
    ctrlValue.month(normalizedMonth.month());
    this.fgFilter.controls['dFecha'].setValue(ctrlValue);
    datepicker.close();
  }

  refreshView(): void {
    this.refreshVac.next();
  }

  //#endregion

}


