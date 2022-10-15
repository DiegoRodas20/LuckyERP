import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { SolicitudvService } from '../../Services/solicitudv.service';
import { ErrorStateMatcher } from '@angular/material/core';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { Moment } from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { CustomDateFormatter } from '../../Config/configCalendar';
import { CalendarDateFormatter, CalendarEvent, CalendarView, DAYS_OF_WEEK } from 'angular-calendar';
import { IMain } from '../../Model/Isolicitudv';
import { MatDatepicker } from '@angular/material/datepicker';
import { ValidadoresService } from '../../Validators/validadores.service';
import { adminpAnimations } from '../../Animations/adminp.animations';

// Utilizar javascript [1]
declare var jQuery: any;

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
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
  darkred: {
    primary: '#b71c1c',
    secondary: '#880e4f',
  },
  red: {
    primary: '#ffaeae',
    secondary: '#ea6767',
  },
  orange: {
    primary: '#ff9800',
    secondary: '#f57c00',
  }
};

@Component({
  selector: 'app-solicitudv',
  templateUrl: './solicitudv.component.html',
  styleUrls: ['./solicitudv.component.css', './solicitudv.component.scss'],
  providers: [ SolicitudvService,
    {provide: CalendarDateFormatter, useClass: CustomDateFormatter} ],
  animations: [ adminpAnimations ]
})
export class SolicitudvComponent implements OnInit {

  //#region Variables
  matcher = new MyErrorStateMatcher();

  // Service GET && POST
  url: string;
  aParam = [];

  // Fab
  fbMain = [
    {icon: 'flight_takeoff', tool: 'Nueva solicitud'}
  ];
  abMain = [];
  tsMain = 'inactive';

  fbNew = [
    {icon: 'save', tool: 'Guardar', dis: false},
    {icon: 'cancel', tool: 'Cancelar', dis: false}
  ];
  fbView = [
    {icon: 'edit', tool: 'Editar', dis: false},
    {icon: 'delete', tool: 'Eliminar', dis: false},
    {icon: 'check_box', tool: 'Confirmar', dis: false},
    {icon: 'disabled_by_default', tool: 'Rechazar', dis: false}
  ];
  abVac = [];
  tsVac = 'inactive';

  // Progress Bar
  pbMain: boolean;
  pbVac: boolean;

  // Combobox
  cboEstado: any;

  // Calendar properties
  locale = 'es';
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.MONDAY, DAYS_OF_WEEK.SUNDAY];
  view: CalendarView = CalendarView.Month;

  // Calendar setup
  viewDate: Date = new Date();
  eventMain: CalendarEvent[] = [];
  refresh: Subject<any> = new Subject();

  vacDate: Date = new Date();
  eventVac: CalendarEvent[] = [];
  refreshVac: Subject<any> = new Subject();

  // Mat Table
  MainDC: string[] = [ 'action', 'sResp', 'dFechIni', 'dFechFin', 'sEstado' ];
  MainDS: MatTableDataSource<IMain>;
  MainDS2: IMain[];
  @ViewChild('pagMain', {static: true}) pagMain: MatPaginator;
  selectedRowIndex: any;

  // FormGroup
  fgMain: FormGroup;
  fgInfoPerso: FormGroup;
  fgVac: FormGroup;

  // Vacacion
  countVacacion: number;
  hVac: string;
  mVac: number;
  bkVac: any;
  toggleVac: number;

  //#endregion

  constructor(public service: SolicitudvService, @Inject('BASE_URL') baseUrl: string,
              private fb: FormBuilder, private spi: NgxSpinnerService,
              private _snackBar: MatSnackBar, private valid: ValidadoresService) {

    // SERVICE GET && POST
    this.url = baseUrl;
    this.countVacacion = 0;

    this.new_fgInforPerso();
    this.new_fgMain();
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
        stat = ( stat === -1 ) ? ( this.abVac.length > 0 ) ? 0 : 1 : stat;
        this.tsVac = ( stat === 0 ) ? 'inactive' : 'active';
        this.abVac = ( stat === 0 ) ? [] : this.fbNew;
        break;

      case 3:
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
          // Nueva solicitud
          case 0:
            this.showModal(1, undefined, 1);
            break;
        }
        break;

      // Fab Vac (New)
      case 2:
        switch (index) {

          // Cerrar
          case -1:
            this.cleanModal(1);
            break;

          // Grabar
          case 0:
            this.saveVac(this.mVac);
            break;

          // Cancelar
          case 1:

            if ( this.mVac === 1 ) {

              this.cleanModal(1);

            } else {

              this.mVac = 0;
              this.toggleVac = 3;

              this.loadVac(this.bkVac);

              this.abVac = [];
              this.delay(250).then(any => {
                this.abVac = this.fbView;
                this.tsVac = 'inactive';
              });
            }
            break;
        }

        break;

      // Fab Vac (View)
      case 3:

        const nIdReqVac = this.fgVac.controls['T1_nIdReqVac'].value;

        switch (index) {

          // Cerrar
          case -1:
            this.cleanModal(1);
            break;

          // Editar
          case 0:
            Swal.fire({
              title: '¿ Estas seguro de modificar el registro?',
              text: 'La solicitud de vacación es válida únicamente luego de recepcionar el documento en RRHH.',
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#ff4081',
              confirmButtonText: 'Confirmar !',
              allowOutsideClick: false
            }).then((result) => {
              if (result.isConfirmed) {

                this.fgVac.controls['T1_dFechIni'].enable();
                this.fgVac.controls['T1_dFechFin'].enable();

                this.abVac = [];
                this.delay(250).then(any => {
                  this.abVac = this.fbNew;
                  this.tsVac = 'active2';
                });

                this.mVac = 2;
                this.toggleVac = 2;
                return;
              }
            });
            break;

          // Eliminar
          case 1:
            Swal.fire({
              title: '¿ Estas seguro de eliminar el registro?',
              text: 'Esta acción no se puede deshacer.',
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#ff4081',
              confirmButtonText: 'Confirmar !',
              allowOutsideClick: false
            }).then(async (result) => {
              if (result.isConfirmed) {

                this.pbVac = true;

                await this.deleteVac(nIdReqVac);

                this.pbVac = false;
              }
            });
            break;

          // Imprimir
          case 2:


            Swal.fire({
              title: '¿ Estas seguro de confirmar el registro?',
              text: 'Esta acción no se puede deshacer.',
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#ff4081',
              confirmButtonText: 'Confirmar !',
              allowOutsideClick: false
            }).then(async (result) => {
              if (result.isConfirmed) {
                this.pbVac = true;
                const fecha_ini = this.fgVac.controls['T1_dFechIni'].value;
                const fechafin = this.fgVac.controls['T1_dFechFin'].value;
                const nIdPerLab = this.fgVac.controls['nIdPerLab'].value;
                this.aParam = [];
                this.aParam.push('T1¡nIdPerLab!' + nIdPerLab);
                this.aParam.push('T1¡nIdReqVac!' + nIdReqVac);
                this.aParam.push('T1¡dFechIni!' + fecha_ini);
                this.aParam.push('T1¡dFechFin!' + fechafin);
                this.aParam.push('T1¡bEstado!' + 1);
                const user = localStorage.getItem('currentUser');
                const uid = JSON.parse(window.atob(user.split('.')[1])).uid;
                this.aParam.push('T1¡nIdRegUser!' + uid);
                this.aParam.push('T1¡dtReg!GETDATE()');

                this.aParam.push('W2¡nIdReqVac!' + nIdReqVac);
                this.aParam.push('S2¡nIdEstado!2152');
                await this.service._ConfirmarSolicitudV(6, this.aParam, this.url).then( (value: any[]) => {
                  // rspta = value;
                });
                await this.loadMain();
                this.pbVac = false;
                this.cleanModal(1);
                Swal.fire(
                  'Registro satisfactorio',
                  'Se confirmo la solicitud. Disfrute sus vacaciones.',
                  'success'
                );
              }
            });
            // this.aParam.push('W1¡nIdReqVac!' + nIdReqVac + '-0¡nIdEmp!' + nIdEmp + '-1¡nIdTipoDocumento!1159');
            // await this.printVac();

            break;

            case 3:
            let Obeservacionsv;
              Swal.fire({
                title: 'Detallar el porque de su decisión',
                input: 'textarea',
                inputPlaceholder: 'Escribir el detalle aquí...',
                showCancelButton: true,
                confirmButtonColor: '#ff4081',
                confirmButtonText: 'Guardar',
                cancelButtonText: 'Cancelar',
                allowOutsideClick: false,
                inputValidator: observacion => {
                  if (observacion === undefined || observacion === '') {
                    return 'Ingresar detalle';
                  } else {
                    Obeservacionsv = observacion;
                  }
              }
              }).then(async (result) => {
                if (result.isConfirmed) {
                  this.pbVac = true;
                  let rspta;
                  this.aParam = [];
                  this.aParam.push('T1¡nIdReqVac!' + nIdReqVac);
                  this.aParam.push('T1¡nIdEstado!2280');
                  this.aParam.push('T1¡sObervacion!' + Obeservacionsv);
                  await this.service._ConfirmarSolicitudV(3, this.aParam, this.url).then( (value: any[]) => {
                    rspta = value;
                  });
                  await this.loadMain();
                  this.cleanModal(1);
                  this.pbVac = false;
                  Swal.fire(
                    'Registro satisfactorio',
                    'Se cancelo la solicitud.',
                    'success'
                  );
                }
              });
        }
        break;
    }
  }

  async showModal(opc: number, pushParam?: any, index?: number) {
    const self = this;

    switch (opc) {
      case 1:
        if (index === 1) {
          this.fgVac.patchValue({
            T1_nIdPersonal: this.fgInfoPerso.controls['nIdPersonal'].value,
            T1_nIdResp: this.fgInfoPerso.controls['nIdResp'].value,
            sResp: this.fgInfoPerso.controls['sResp'].value
          });

          this.hVac = 'Nueva';
          this.fgVac.controls['T1_dFechIni'].enable();
          this.fgVac.controls['T1_dFechFin'].enable();

          this.eventVac = [];
          this.toggleVac = 2;
          this.mVac = 1;

        } else {
          this.hVac = 'Detalle';

          this.loadVac(pushParam);
          if (pushParam.nIdEstado === 2149) {
            this.fbView[3].dis = true;
          }
          this.bkVac = pushParam;
          this.toggleVac = 3;
        }

        const nToggle = ( index === 1 ) ? 2 : 3;

        ( function($) {
          $('#ModalVac').modal('show');
          $('#ModalVac').on('shown.bs.modal', function () {
            self.onToggleFab(nToggle, 1);
            $(document).off('focusin.modal');
          });
        })(jQuery);

        break;
    }
  }

  async cleanModal(opc: number) {
    const self = this;

    switch (opc) {
      case 1:
        if (this.countVacacion !== 0) {
          this.fgMain.patchValue({
            dFecha: null,
            nEstado: 0
          });
          this.eventMain = [];
          await this.loadMain();
          
          this.countVacacion = 0;
        }

        this.hideModal('#ModalVac');
        this.fgVac.reset();

        this.fgVac.controls['T1_dFechIni'].disable();
        this.fgVac.controls['T1_dFechFin'].disable();

        this.fbView.forEach( x => {
          x.dis = false;
        });

        this.eventVac = [];
        this.vacDate = new Date();
        this.mVac = 0;
        this.hVac = '';
        this.bkVac = null;
        break;
    }
  }

  hideModal(modal: string, opc?: number) {
    let nToogle: number;
    switch (modal) {
      case '#ModalVac':
        nToogle = 2;
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
      nIdResp: 0,
      sResp: ''
    });
  }

  new_fgMain() {
    this.fgMain = this.fb.group({
      dFecha: null,
      nEstado: 0,
      sEstado: ''
    });

    this.fgMain.valueChanges.subscribe(value => {
      const filter = {...value, name: value.sEstado} as string;
      this.MainDS.filter = filter;

      if (this.MainDS.paginator) {
        this.MainDS.paginator.firstPage();
      }
    });
  }

  new_fgVac() {
    this.fgVac = this.fb.group({
      T1_nIdReqVac: 0,
      T1_nIdPersonal: 0,
      T1_nIdResp: 0,
      sResp: [{ value: '', disabled: true }, [ Validators.required ]],
      T1_dFechIni: [{ value: null, disabled: true }, [ Validators.required ]],
      T1_dFechFin: [{ value: null, disabled: true }, [ Validators.required ]],
      sEstado : '',
      sObservacion: [{ value: '', disabled: true }],
      nIdPerLab : [{ value: '', disabled: true }],
    });

    this.fgVac.valueChanges.subscribe(value => {
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
            color: colors.blue,
            title: '',
            allDay: true,
            draggable: false
          });

        }
      }

      this.vacDate = calendar;
      this.eventVac = events;
      this.refreshView(2);
    });
  }

  get getMain() { return this.fgMain.controls; }
  get getInfoPerso() { return this.fgInfoPerso.controls; }
  get getVac() { return this.fgVac.controls; }

  //#endregion

  //#region Combobox

  async fnGetEstado () {
    const param = [];
    param.push('0¡nEleCodDad!2148');

    await this.service._loadSP( 1, param, this.url).then( (value: any[]) => {
      this.cboEstado = value;
    });
  }

  //#endregion

  async ngOnInit(): Promise<void> {
    this.spi.show('spi_main');

    await this.fnGetEstado();

    const user = localStorage.getItem('currentUser');
    // const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

    const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    const pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    // const uid = JSON.parse(window.atob(user.split('.')[1])).uid;
    const uid = idUser;
    // const uid = '57';

    const param = [];
    param.push('0¡nCodUser!' + uid);

    await this.service._loadSP( 2, param, this.url).then( async (value: any[]) => {
      if ( value.length > 0 ) {

        this.fgInfoPerso.patchValue({
          nIdPersonal: value[0].nIdPersonal,
          sNombres: value[0].sNombres,
          sTipo: value[0].sTipo,
          sDocumento: value[0].sDocumento,
          nIdResp: value[0].nIdResp,
          sResp: value[0].sResp
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

  async loadMain() {
    const param = [];

    const nIdPersonal = this.fgInfoPerso.controls['nIdPersonal'].value;
    param.push('0¡A.nIdPersonal!' + nIdPersonal);

    await this.service._loadSP( 3, param, this.url).then( (value: IMain[]) => {

      // var fini = value[0].dFechIni.getMonth();
      // value.sort((a, b) => a.dFechIni.getMonth() - b.dFechIni.getMonth());
      this.MainDS2 = value;
      this.MainDS = new MatTableDataSource(value);
      this.MainDS.paginator = this.pagMain;
      this.MainDS.filterPredicate = function(data, filter: string): boolean {
        return data.sEstado.trim().toLowerCase().includes(filter);
      };

      this.MainDS.filterPredicate = ((data: IMain, filter: any ) => {
        // tslint:disable-next-line: max-line-length
        const a = !filter.nEstado || data.nIdEstado === filter.nEstado;
        const b = !filter.dFecha || ( moment(data.dFechIni).format('MM/YYYY') === moment(filter.dFecha).format('MM/YYYY') );
        return a && b;
      }) as (PeriodicElement, string) => boolean;

      const dFecha = new Date();
      const nFecha = Number(moment(dFecha).format('YYYYMM'));

      this.eventMain = [];
      value.filter( x => {
        const a = x.nIdEstado === 2150 || x.nIdEstado === 2152;
        const b = ( nFecha >= Number(moment(x.dFechIni).format('YYYYMM')) && nFecha <= Number(moment(x.dFechFin).format('YYYYMM')) );
        return a && b;
      }).forEach( x => {

        let colora;
        if (x.nIdEstado == 2150){
          colora = colors.orange;
        } else {
          colora = colors.green;

        }

        this.eventMain.push({
          start: moment(x.dFechIni).toDate(),
          end: moment(x.dFechFin).toDate(),
          color: colora,
          title: '',
          allDay: true,
          draggable: false
        });
      });

    });

    await this.loadVacMain();

  }

  async saveVac(opc: number) {

    // Insert - 1 | Update - 2
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
      const ReqVac = this.fgVac.controls['T1_nIdReqVac'].value;
      const newIni = moment(this.fgVac.controls['T1_dFechIni'].value);
      const newFin = moment(this.fgVac.controls['T1_dFechFin'].value);

      const aData = this.MainDS.data;
      aData.filter( x => {
        const a = x.nIdEstado === 2149 || x.nIdEstado === 2150 || x.nIdEstado === 2152;
        const b = x.nIdReqVac !== ReqVac;
        return a && b;
      }).forEach( x => {
        // tslint:disable-next-line: no-debugger
        // debugger;

        const dFechIni = moment(x.dFechIni);
        const dFechFin = moment(x.dFechFin);

        if ( newIni.isBetween(dFechIni, dFechFin, null, '[]') || newFin.isBetween(dFechIni, dFechFin, null, '[]') ) {
          nError = nError + 1;
        }

        if ( dFechIni.isBetween(newIni, newFin, null, '[]') || dFechFin.isBetween(newIni, newFin, null, '[]') ) {
          nError = nError + 1;
        }

      });


      if ( nError > 0 ) {
        this._snackBar.open('Las fechas se cruzan con registros existentes.', 'Cerrar', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
        this.pbVac = false;
        return;
      }

      const fControl = this.fgVac.controls['T1_nIdReqVac'] as FormControl;

      let oModo: boolean;

      if (opc === 1) {
        fControl.setValue(null);
        oModo = undefined;
      } else {
        fControl.markAsDirty();
        oModo = true;
      }

      this.fnGetParam(this.fgVac.controls, oModo);

      if ( this.aParam.length > ( ( opc === 2 ) ? 1 : 0 ) ) {

        // Usuario y Fecha con hora
        const user = localStorage.getItem('currentUser');
        const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

        if (opc === 1) {
          this.aParam.push('T0¡nIdRegUser!' + uid);
          this.aParam.push('T0¡dtReg!GETDATE()');
          this.aParam.push('T1¡nIdEstado!2149');
        } else {
          this.aParam.push('T1¡nIdModUser!' + uid);
          this.aParam.push('T1¡dtMod!GETDATE()');
        }

        const aResult = new Array();
        const result = await this.service._crudSV(opc, this.aParam, this.url);

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
              ftext = 'Se registro la solicitud, queda a espera de confirmacion del jefe.';
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
          await this.loadMain();
          this.cleanModal(1);
        }

        this.pbVac = false;
        return ;

      } else {
        this._snackBar.open('No se realizó ningún cambio.', 'Cerrar', {
          duration: 1000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });

        this.pbVac = false;
        return;
      }

    }
  }

  loadVac(aVac: any) {
    this.fgVac.reset();
    this.fgVac.patchValue({
      T1_nIdReqVac: aVac.nIdReqVac,
      T1_nIdPersonal: aVac.nIdPersonal,
      T1_nIdResp: aVac.nIdResp,
      sResp: aVac.sResp,
      T1_dFechIni: aVac.dFechIni,
      T1_dFechFin: aVac.dFechFin,
      sEstado : aVac.sEstado,
      sObservacion :  aVac.sObervacion,
      nIdPerLab : aVac.nIdPerLab
    });

    const prueba = this.fgVac.controls['sObservacion'].value;
    let sColor: any;
    switch (aVac.nIdEstado) {
      // Pendiente
      case 2149:
        this.fbView[2].dis = true;
        sColor = colors.yellow;
        break;

      // Aprobado
      case 2150:
        this.fbView[0].dis = true;
        this.fbView[1].dis = true;
        sColor = colors.orange;
        break;

      // Desestimado
      case 2151:
        this.fbView.forEach( x => {
          x.dis = true;
        });
        sColor = colors.darkred;
        break;

      // Recepcionado
      case 2152:
        this.fbView.forEach( x => {
          x.dis = true;
        });
        sColor = colors.green;
        break;
        case 2280:
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

    this.eventVac = [];
    this.vacDate = dFechIni;
    this.eventVac.push({
      start: dFechIni,
      end: dFechFin,
      color: sColor,
      title: '',
      allDay: true,
      draggable: false
    });
    this.refreshView(2);

  }

  async deleteVac( nIdReqVac: number ) {
    const aParam = [];
    aParam.push('T1¡nIdReqVac!' + nIdReqVac);

    const aResult = new Array();
    const result = await this.service._crudSV(3, aParam, this.url);

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

          ftitle = 'Registro eliminado';
          ftext = 'Favor de verificar correctamente las fechas antes de realizar cualquier registro.';
          ftype = 'success';
        }
      } else {
        ftitle = 'Inconveniente';
        ftext = e.split('!')[1];
        ftype = 'error';
        break;
      }
    }

    Swal.fire(
      ftitle,
      ftext,
      (ftype !== 'error') ? 'success' : 'error'
    );

    if ( ftype !== 'error' ) {
      this.countVacacion = this.countVacacion + 1;
      await this.loadMain();
      this.cleanModal(1);
    }
  }

  //#region Extra

  async printVac() {
    await this.service.print( 4, this.aParam, this.url).then( (result: any) => {
      let objectURL: any = URL.createObjectURL(result);
      const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;
      pdfFrame.src = '';
      pdfFrame.src = objectURL;
      objectURL = URL.revokeObjectURL(result);
    });
    this.aParam = [];
  }

  printDoc() {
    const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;
    if ( pdfFrame.src !== '' ) {
      this.pbMain = false;
      pdfFrame.contentWindow.print();
    }
  }

  chosenYearHandler(normalizedYear: Moment) {
    let ctrlValue = this.fgMain.controls['dFecha'].value;
    ctrlValue = ( ctrlValue === null ) ? moment() : ctrlValue;
    ctrlValue.year(normalizedYear.year());
    this.fgMain.controls['dFecha'].setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    let ctrlValue = this.fgMain.controls['dFecha'].value;
    ctrlValue = ( ctrlValue === null ) ? moment() : ctrlValue;
    ctrlValue.month(normalizedMonth.month());
    this.fgMain.controls['dFecha'].setValue(ctrlValue);
    datepicker.close();
  }


async loadVacMain() {
  let calendar = new Date();

  // Eventos
  const events: CalendarEvent[] = [];
  this.eventMain = [];
  this.MainDS2.forEach( x => {

    let sColor: any;
    switch (x.nIdEstado) {
      // Aprobado && Recepcionado
      case 2149:
        this.fbView[2].dis = true;
        sColor = colors.yellow;
        break;
      case 2150:
        sColor = colors.orange;
        break;
      case 2152:
        sColor = colors.green;
        break;
    }
    const dFechIni = moment(x.dFechIni).toDate();
    const dFechFin = moment(x.dFechFin).toDate();
    this.eventMain = [];
    this.viewDate = dFechIni;
    const nIdPersonal = x.nIdPersonal;

    calendar = dFechIni;

    events.push({
      start: dFechIni,
      end: dFechFin,
      color: sColor,
      title: 'Inicio : ' + moment(dFechIni).format('DD/MM/YYYY') + ' - Termino : ' + moment(dFechFin).format('DD/MM/YYYY'),
      allDay: true,
      draggable: false,
      meta: nIdPersonal,
    });
    });

    this.viewDate = calendar;
    this.eventMain = events;
    this.refreshView(1);

}

  refreshView(opc: number): void {
    switch (opc) {
      case 1:
        this.refresh.next();
        break;

      case 2:
        this.refreshVac.next();
        break;
    }
  }

  //#endregion

}
