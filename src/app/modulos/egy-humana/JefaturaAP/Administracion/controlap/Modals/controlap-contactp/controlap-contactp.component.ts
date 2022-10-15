import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { ControlapService } from '../../../../Services/controlap.service';
import * as moment from 'moment';
import { CalendarDateFormatter, CalendarEvent, CalendarView, DAYS_OF_WEEK } from 'angular-calendar';
import { Subject } from 'rxjs';
import { CustomDateFormatter } from '../../../../Config/configCalendar';
import { ErrorStateMatcher } from '@angular/material/core';
import { ValidadoresService } from '../../../../Validators/validadores.service';
import Swal from 'sweetalert2';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

const colors: any = {
  // Subsididio
  pink: {
    primary: '#ff4081b0',
    secondary: '#FAE3E3',
  },
  // Asistencia
  blue: {
    primary: '#1e90ffd1',
    secondary: '#D1E8FF',
  },
  // Vacaciones
  green: {
    primary: '#2EFE2E',
    secondary: '#0B610B',
  },
};

@Component({
  selector: 'app-controlap-contactp',
  templateUrl: './controlap-contactp.component.html',
  styleUrls: ['./controlap-contactp.component.css'],
  providers: [ {provide: CalendarDateFormatter, useClass: CustomDateFormatter} ],
  animations: [ adminpAnimations ]
})
export class ControlapContactpComponent implements OnInit {

  @Input() fromParent;

  //#region Variables
  matcher = new MyErrorStateMatcher();
  aParam = [];

  // Fab
  fbDetail = [
    {icon: 'save', tool: 'Guardar', dis: false},
    {icon: 'cancel', tool: 'Cancelar', dis: false}
  ];
  abDetail = [];
  tsDetail = 'inactive';

  // Progress Bar
  pbDetail: boolean;

  // Parent
  aItem: any;
  nIdDevengue: number;
  dFechDevengue: Date;
  aDias: any[];

  // FormGroup
  fgDetail: FormGroup;
  fgContacto: FormGroup;

  // Combobox
  cboMotivo = new Array();
  cboRespuesta = new Array();

  // Calendar properties
  locale = 'es';
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.MONDAY, DAYS_OF_WEEK.SUNDAY];
  view: CalendarView = CalendarView.Month;
  events: CalendarEvent[] = [];

  // Calendar setup
  viewDate: Date = new Date();
  eventContact: CalendarEvent[] = [];
  refresh: Subject<any> = new Subject();

  //#endregion

  constructor(public activeModal: NgbActiveModal, private spi: NgxSpinnerService,
              public service: ControlapService, private fb: FormBuilder,
              private valid: ValidadoresService) {

    this.new_fgDetail();
    this.new_fgContacto();
  }

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_contactp');

    await this.cboGetMotivo();
    await this.cboGetRespuesta();

    this.aItem = this.fromParent.aItem;
    this.nIdDevengue = this.fromParent.nIdDevengue;
    this.dFechDevengue = this.fromParent.dFechDevengue;
    this.aDias = this.fromParent.aDias;

    this.viewDate = this.dFechDevengue;

    await this.loadDetail();

    this.spi.hide('spi_contactp');

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
        this.saveContacto();
        break;

      case 1:
        this.activeModal.dismiss();
        break;
    }
  }

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

  //#endregion

  //#region Combobox

  async cboGetMotivo () {
    const param = [];
    param.push('0¡nIdTipo!2311');
    param.push('0¡nIdModo!2314');
    param.push('0¡bUso!0');

    await this.service._loadSP( 9, param).then( (value: any[]) => {
      this.cboMotivo = value;
    });
  }

  async cboGetRespuesta () {
    const param = [];
    param.push('0¡nIdTipo!2311');
    param.push('0¡nIdModo!2314');
    param.push('0¡bUso!1');

    await this.service._loadSP( 9, param).then( (value: any[]) => {
      this.cboRespuesta = value;
    });
  }

  //#endregion

  //#region FormGroup

  new_fgDetail() {
    this.fgDetail = this.fb.group({
      nIdPersonal: 0,
      nIdPerLab: 0,
      sNombres: [{ value: '', disabled: true }],
      sCodPlla: [{ value: '', disabled: true }],
      sTipo: [{ value: '', disabled: true }],
      sDocumento: [{ value: '', disabled: true }],
      sOrganizacion: [{ value: '', disabled: true }],
      sCentroCosto: [{ value: '', disabled: true }],
      sCiudad: [{ value: '', disabled: true }],
      nTelMovil: [{ value: 0, disabled: true }],
      dFechIni: [{ value: null, disabled: true }],
      dFechFin: [{ value: null, disabled: true }]
    });
  }

  new_fgContacto() {
    this.fgContacto = this.fb.group({
      T1_nIdDevengue: 0,
      T1_nIdPersonal: 0,
      T1_nIdMotivo: [{ value: 0, disabled: false }, [ Validators.required, this.valid.noSelect ]],
      T1_nIdRespuesta: [{ value: 0, disabled: false }, [ Validators.required, this.valid.noSelect ]],
      T1_sObservacion: [ { value: '', disabled: false } ],
    });
  }

  get getDetail() { return this.fgDetail.controls; }
  get getContacto() { return this.fgContacto.controls; }

  //#endregion

  //#region Load

  async loadDetail() {

    const nIdPerLab = this.aItem.nIdPerLab;
    let dFecha = ( ( this.aItem.dFechFin === null ) ? this.dFechDevengue : this.aItem.dFechFin ) as Date;
    dFecha = moment(dFecha).toDate();

    this.fgDetail.patchValue({
      nIdPersonal: this.aItem.nIdPersonal,
      nIdPerLab: this.aItem.nIdPerLab,
      sNombres: this.aItem.sNombres,
      sCodPlla: this.aItem.sCodPlla,
      sTipo: this.aItem.sDscTipo,
      sDocumento: this.aItem.sDocumento,
      dFechIni: this.aItem.dFechIni,
      dFechFin: this.aItem.dFechFin,
      sCiudad: this.aItem.sCiudad
    });

    this.fgContacto.patchValue({
      T1_nIdPersonal: this.aItem.nIdPersonal,
      T1_nIdDevengue: this.nIdDevengue
    });

    const spFechDevengue = moment(dFecha).format('MM/DD/YYYY');

    const param = [];
    param.push('6¡spFechDevengue!' + spFechDevengue + '-' +
               '0¡A.nIdPerLab!' + nIdPerLab);

    await this.service._loadSP( 8, param).then( (value: any[]) => {
      if ( value.length > 0 ) {
        this.fgDetail.patchValue({
          nTelMovil: value[0].nTelMovil,
          sOrganizacion: value[0].sOrganizacion,
          sCentroCosto: value[0].sCentroCosto
        });
      }
    });

    const aDias = this.aDias;
    const events = [];
    aDias.forEach( x => {

      let tColor: any;
      switch (x.sTipo) {
        case 'Asistencia':
          tColor = colors.blue;
          break;
        case 'Subsidio':
          tColor = colors.pink;
          break;
        case 'Vacacion':
          tColor = colors.green;
          break;
      }

      events.push({
        start: moment(x.dFechIni).toDate(),
        end: moment(x.dFechFin).toDate(),
        color: tColor,
        title: x.sTipo,
        allDay: true,
        draggable: false
      });
    });

    this.eventContact = events;
    this.refresh.next();

  }

  get getTotalDias() {
    let nTotal = 0;
    if (this.aDias !== undefined) {
      const aDias = this.aDias;
      aDias.forEach( x => nTotal = nTotal + x.nDias);
    }
    return 'Días en total : ' + nTotal;
  }

  async saveContacto() {
    this.pbDetail = true;

    this.aParam = [];

    if (this.fgContacto.invalid) {

      Swal.fire(
        'No se puede guardar',
        'Información incorrecta o incompleta',
        'error'
      );

      this.pbDetail = false;
      return;

    } else {

      // Usuario y Fecha con Hora
      const user = localStorage.getItem('currentUser');
      const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

      this.aParam.push('T1¡nIdRegUser!' + uid);
      this.aParam.push('T1¡dtReg!GETDATE()');
      this.aParam.push('T1¡nIdModo!2314');

      this.fnGetParam(this.fgContacto.controls);

      const nIdPersonal = this.fgContacto.controls['T1_nIdPersonal'].value;

      const aResult = new Array();
      const result = await this.service._crudCA(1, this.aParam);

      Object.keys( result ).forEach ( valor => {
        aResult.push(result[valor]);
      });

      let ftitle = '';
      let ftext = '';
      let ftype = '';

      let nIdContacto: number;

      for (const e of aResult) {
        const iResult = aResult.indexOf(e);

        if (e.split('!')[0] !== '00') {
          if (iResult === 0) {

            nIdContacto = e.split('!')[1];

            ftitle = 'Registro satisfactorio';
            ftext = 'El contacto fue registro en el histórico del personal.';
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
        const oReturn = new Object();

        oReturn['modal'] = 'contactp';
        oReturn['value'] = 'loadAgain';
        oReturn['nIdPersonal'] = nIdPersonal;
        oReturn['nIdContacto'] = nIdContacto;

        this.activeModal.close(oReturn);
      }

      this.pbDetail = false;
      return;

    }

  }

  //#endregion

}
