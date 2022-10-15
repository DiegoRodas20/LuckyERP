import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { Interface } from 'readline';
import { Subject } from 'rxjs';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { AsistenciaManualService } from '../../asistencia-manual.service';
import { CalendarDateFormatter, CalendarEvent, CalendarMonthViewBeforeRenderEvent, CalendarMonthViewDay, CalendarView, DAYS_OF_WEEK } from 'angular-calendar';
import { CustomDateFormatter } from '../../../../Config/configCalendar';
import moment from 'moment';
import Swal from 'sweetalert2';
import { ErrorStateMatcher } from '@angular/material/core';
import { ValidadoresService } from '../../../../Validators/validadores.service';
import { WeekDay } from '@angular/common';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-asistencia-personal',
  templateUrl: './asistencia-personal.component.html',
  providers: [ {provide: CalendarDateFormatter, useClass: CustomDateFormatter} ],
  animations: [ adminpAnimations ],
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./asistencia-personal.component.css','./asistencia-personal.component.scss'],
})
export class AsistenciaPersonalComponent implements OnInit {

  @Input() fromParent;

  matcher = new MyErrorStateMatcher();
  expandedFechas: IExpandedFechas[];
  ListaCalculoDias: CalculoDias[];

  fgDetail: FormGroup;
  fgSuma: FormGroup;
  fgFilter: FormGroup;
  pbMain: boolean;
  overimage:boolean;
  nIdResp = 0;
  PersonalBackup = new Array();
  PersonalDC: string[] = [ 'sRespImg', 'sResp' ];
  PersonalDS: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild('pagPersonal', {static: true}) pagPersonal: MatPaginator;

  editTable = null;

  toggleAsis = 1;
  tadaAsis = 'inactive';
  TituloModal = '';

  fbAsis = [
    {icon: 'save', tool: 'Grabar', dis: false} ,
    {icon: 'cancel', tool: 'Cancelar', dis: false} ,
  ];

  fbAsis2 = [
    {icon: 'edit', tool: 'Editar', dis: false} ,
    {icon: 'delete', tool: 'Eliminar', dis: false} ,
    {icon: 'cancel', tool: 'Cancelar', dis: false} ,
  ];

  fbAsis3 = [
    {icon: 'save', tool: 'Grabar', dis: false} ,
    {icon: 'cancel', tool: 'Cancelar', dis: false} ,
  ];
  abAsis = [];
  tsAsis = 'inactive';

  nMes: string;
  nEjercicio: string;

   dFechaStatic: Date = null;
   // Devengue
   DevengueBackup = new Array();
   nIdDevengue: number;
   dFechDevengue: Date = null;
   maxDay = 0;
   sHeaderDevengue = '';

  viewDate: Date = new Date();
  eventMain: CalendarEvent[] = [];
  locale = 'es';
  refresh: Subject<any> = new Subject();
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.MONDAY, DAYS_OF_WEEK.SUNDAY];

  view: CalendarView = CalendarView.Month;
  // let fecha: CalendarMonthViewDay;
  ListaFechas: Fechas[] = [];
  selectedMonthViewDay: CalendarMonthViewDay;
  selectedMonthViewDay2: CalendarMonthViewDay;
  selectedDays: any = [];
  cboCiudad: any;

  constructor(public activeModal: NgbActiveModal, public service: AsistenciaManualService, private spi: NgxSpinnerService,
    private fb: FormBuilder, private _modalService: NgbModal, private _snackBar: MatSnackBar, private valid: ValidadoresService) {

      this.new_fgDetail();
      this.new_fgSuma();
      this.new_fgFilter();
     }

     get getFilter() { return this.fgFilter.controls; }
     get getSuma() { return this.fgSuma.controls; }

     new_fgFilter() {
      this.fgFilter = this.fb.group({
        sNombres: '',
        sCiudad: ''
      });

      this.fgFilter.valueChanges.subscribe(value => {
        const filter = { ...value, name: value.sNombres.trim().toLowerCase() } as string;
        this.PersonalDS.filter = filter;
        if (this.PersonalDS.paginator) {
          this.PersonalDS.paginator.firstPage();
        }
      });
     }

    new_fgDetail() {
      this.fgDetail = this.fb.group({
        nIdPersonal: 0,
        nIdCentroCosto: 0,
        sNombres:  [{ value: '', disabled: true }],
        sCodPlla:  [{ value: '', disabled: true }],
        sTipo: [{ value: '', disabled: true }],
        sDscTipo: [{ value: '', disabled: true }],
        sDocumento: [{ value: '', disabled: true }],
        sCiudad: [{ value: '', disabled: true }],
        dFechIni: [{ value: '', disabled: true }],
        dFechFin: [{ value: '', disabled: true }],
        nTelMovil: [{ value: '', disabled: true }],
        sOrganizacion: [{ value: '', disabled: true }],
        sCentroCosto: [{ value: '', disabled: true }],
        sCodPllaBadge: ''
      });
    }

    new_fgSuma() {
      this.fgSuma = this.fb.group({
        nDias: [{ value: 0, disabled: true }],
        nMonto: [{ value: 0, disabled: false } , [ this.valid.vMonto ]],
        nTotal: [{ value: 0, disabled: true }],
      });

      this.fgSuma.valueChanges.subscribe(value => {
        const dias = this.ListaFechas.length;
        const nTotal = dias * value.nMonto;

        const nTotalActual = this.fgSuma.controls['nTotal'].value;

        if(nTotal != nTotalActual){
          this.fgSuma.controls['nTotal'].setValue(nTotal);
        }
        const nIdPersonal = this.fgDetail.controls['nIdPersonal'].value;
      });
    }

    async DeleteAsistencia(nIdDPP: any, nIdPlanning: any){
      const aParamDelete = [];
      aParamDelete.push('T1¡nIdDPP!' + nIdDPP);
      const aParamDelete2 = [];
      aParamDelete2.push('nIdPlanning!' + nIdPlanning);
      await this.service._crudAM(4, aParamDelete);
      await this.service._crudAM(5, aParamDelete);
      await this.service._crudAM(6, aParamDelete2);
      Swal.fire({
        title: 'Eliminación satisfactoria',
        text: 'La actualización se realizo correctamente.',
        icon: 'success',
        confirmButtonText: 'Ok',
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          const oReturn = new Object();
          oReturn['modal'] = 'asispersonal';
          oReturn['value'] = 'loadAgain';
          this.delay(500).then(any => {
            this.activeModal.close(oReturn);
          });
        }
      });
    }

    async clickFab(opc: number, index: number) {

      switch (opc) {
        // Fab Main
        // Fab Incentivo ( New 2 )
        case 1:
          switch (index) {
            case 0:
              await this.SaveFechas();
              break;
          }
          break;
        case 2:
          switch (index) {
            case 0:
               Swal.fire({
                title: '¿ Desea editar el registro ?',
                text: 'Editar asistencia.',
                icon: 'question',
                showCancelButton: true,
                cancelButtonText: 'No',
                confirmButtonColor: '#ff4081',
                confirmButtonText: 'Si, continuar!',
                allowOutsideClick: false
              }).then((result) => {
                if (result.isConfirmed) {
                  const nDias = this.fromParent.nDias;
                  const nTotal = this.fromParent.nImporte;
                  const nMonto = nTotal / nDias;

                  this.fgSuma = this.fb.group({
                    nDias: [{ value: nDias ,  disabled: true }],
                    nMonto: [{ value: nMonto , disabled: false }, [ this.valid.vMonto ]],
                    nTotal : [{ value: nTotal , disabled: true }]
                  });

                  this.fgSuma.valueChanges.subscribe(value => {
                    const dias = this.ListaFechas.length;
                    const nTotal2 = dias * value.nMonto;
                    const nTotalActual = this.fgSuma.controls['nTotal'].value;
                    if (nTotal2 !== nTotalActual) {
                      this.fgSuma.controls['nTotal'].setValue(nTotal2);
                    }
                    const nIdPersonal = this.fgDetail.controls['nIdPersonal'].value;
                  });

                  this.abAsis = [];
                  this.delay(250).then(any => {
                    this.abAsis = this.fbAsis3;
                    this.tsAsis = 'active';
                  });

                  this.toggleAsis = 3;
                } else {
                }
              }
            );
              break;
            case 1:
              const nIdDPP2 = this.fromParent.nIdDPP;
              const nIdPlanning = this.fromParent.nIdPlanning;
              await Swal.fire({
                title: '¿ Desea eliminar el registro ?',
                text: 'Recuerde que esta accion es irrebocable.',
                icon: 'question',
                showCancelButton: true,
                cancelButtonText: 'No',
                confirmButtonColor: '#ff4081',
                confirmButtonText: 'Si, continuar!',
                allowOutsideClick: false
              }).then((result) => {
                if (result.isConfirmed) {
                   this.DeleteAsistencia( nIdDPP2 , nIdPlanning);
            } else {

              }
            }
            );
              break;
            case 2:
              this.activeModal.dismiss();
              break;
          }
          break;
        case 3:
          const nIdDPP = this.fromParent.nIdDPP;
          switch (index) {
            case 0:
              const user = localStorage.getItem('currentUser');
              const uid = JSON.parse(window.atob(user.split('.')[1])).uid;
              const nMonto = this.fgSuma.controls['nMonto'].value;
              if (nMonto > 0) {
                if (this.ListaFechas.length > 0) {
                  const aParamDelete = [];
                  aParamDelete.push('T1¡nIdDPP!' + nIdDPP);
                  await this.service._crudAM(4, aParamDelete);
                 await this.ListaFechas.forEach(x => {
                    const aParam = [];
                    const dtReg = moment(x.date).format('YYYY/MM/DD');
                    aParam.push('T1¡nIdDPP!' + nIdDPP);
                    aParam.push('T1¡dFecha!' + dtReg);
                    aParam.push('T1¡nIdDia!' + 2335);
                    aParam.push('T1¡nImporte!' + nMonto);
                    aParam.push('T1¡nIdRegUser!' + uid);
                    aParam.push('T1¡dtReg!GETDATE()');
                    const aResult = new Array();
                    const result =  this.service._crudAM(1, aParam);
                  });
                  Swal.fire({
                    title: 'Actualización satisfactoria',
                    text: 'La actualización se realizo correctamente.',
                    icon: 'success',
                    confirmButtonText: 'Ok',
                    allowOutsideClick: false
                  }).then((result) => {
                    if (result.isConfirmed) {
                      const oReturn = new Object();
                      oReturn['modal'] = 'asispersonal';
                      oReturn['value'] = 'loadAgain';
                      this.delay(500).then(any => {
                        this.activeModal.close(oReturn);
                      });
                    }
                  });
                } else {
                  Swal.fire(
                    'No se puede editar',
                    'Información incorrecta o incompleta',
                    'error'
                  );
                }
              } else {
                Swal.fire(
                  'No se puede guardar',
                  'Información incorrecta o incompleta',
                  'error'
                );
              };

              // await this.SaveFechas();
              break;
            case 1:
              Swal.fire({
                title: '¿ Desea cancelar el editar registro ?',
                text: 'Cancelar asistencia.',
                icon: 'question',
                showCancelButton: true,
                cancelButtonText: 'No',
                confirmButtonColor: '#ff4081',
                confirmButtonText: 'Si, continuar!',
                allowOutsideClick: false
              }).then((result) => {
                if (result.isConfirmed) {
                  const nDias1 = this.fromParent.nDias;
                  const nTotal1 = this.fromParent.nImporte;
                  const nMonto1 = nTotal1 / nDias1;
                  this.fgSuma = this.fb.group({
                    nDias: [{ value: nDias1 ,  disabled: true }],
                    nMonto: [{ value: nTotal1 , disabled: true }],
                    nTotal : [{ value: nMonto1 , disabled: true }]
                  });
                   this.loadFechas(nIdDPP);
                  this.abAsis = [];
                      this.delay(250).then(any => {
                        this.abAsis = this.fbAsis2;
                        this.tsAsis = 'active';
                      });
                      this.toggleAsis = 2;
                } else {
                }
              }
            );

              break;
          }
      //#endregion
      }
    }

    async ngOnInit(): Promise<void>  {


      if(this.fromParent.edit === 1){
        this.spi.show('spi_personal');
        this.TituloModal = 'Detalle Asistencia';
        this.overimage = false;
        const nIdPersonal = this.fromParent.nIdPersonal;
        const nIdResp = this.fromParent.nIdResp;
        const nIdDPP = this.fromParent.nIdDPP;
        const nDias = this.fromParent.nDias;
        const nTotal = this.fromParent.nImporte;
        const nMonto = nTotal / nDias;
        await this.DevengueActual();
        await this.fnGetCiudad();
        await this.LoadPersonal(1, nIdPersonal);
        await this.selectResp(nIdPersonal, nIdResp );
        await this.loadFechas(nIdDPP);
        await this.ListaFechasTomadas();
        this.fgSuma = this.fb.group({
          nDias: [{ value: nDias ,  disabled: true }],
          nMonto: [{ value: nMonto , disabled: true }],
          nTotal : [{ value: nTotal , disabled: true }]
        });
        this.abAsis = [];
        this.delay(250).then(any => {
          this.abAsis = this.fbAsis2;
          this.tsAsis = 'active';
        });

        this.toggleAsis = 2;
        // this.onToggleFab(2, 1);

        this.spi.hide('spi_personal');

      } else {
        this.spi.show('spi_personal');
        this.TituloModal = 'Registro Asistencia';
        this.overimage = true;
        await this.DevengueActual();
        await this.CalendarioDevengue();
        await this.fnGetCiudad();
        await this.LoadPersonal(0, 0);
        this.onToggleFab(1, 1);
        this.spi.hide('spi_personal');

      }
    }

    onToggleFab(fab: number, stat: number) {
      switch (fab) {
        //// Configurar boton flotante vista principal
        case 1:
          stat = ( stat === -1 ) ? ( this.abAsis.length > 0 ) ? 0 : 1 : stat;
          this.tsAsis = ( stat === 0 ) ? 'inactive' : 'active';
          this.abAsis = ( stat === 0 ) ? [] : this.fbAsis;
          break;
        case 2:
          stat = ( stat === -1 ) ? ( this.abAsis.length > 0 ) ? 0 : 1 : stat;
          this.tsAsis = ( stat === 0 ) ? 'inactive' : 'active';
          this.abAsis = ( stat === 0 ) ? [] : this.fbAsis2;
          break;
        case 3:
          stat = ( stat === -1 ) ? ( this.abAsis.length > 0 ) ? 0 : 1 : stat;
          this.tsAsis = ( stat === 0 ) ? 'inactive' : 'active';
          this.abAsis = ( stat === 0 ) ? [] : this.fbAsis3;
          break;
      }
    }

    async fnGetCiudad () {
      const param = [];
      param.push('0¡nDadTipEle!694');
      const sIdPais = JSON.parse(localStorage.getItem('Pais'));
      param.push('0¡nIdPais!' + sIdPais);
      param.push('0¡bEstado!1');

      await this.service._loadCiudad( 2, param).then( (value: any[]) => {
        this.cboCiudad = value;
      });
    }

    async  CalendarioDevengue(){
      const fecha = this.nMes + '/01/' + this.nEjercicio;
      this.viewDate = new Date(fecha);
    }

    async DevengueActual() {
      const param = [];
      const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

      param.push('0¡nIdEmp!' + nIdEmp);
      await this.service._loadDevengue( 1, param).then((value: any[]) => {
        if ( value.length > 0 ) {

          this.DevengueBackup = value;
          const iDevengue = value.findIndex( x => x.nIdEstado === 0 || x.nIdEstado === 1 );
          this.nIdDevengue = value[iDevengue].nIdDevengue as number;

          const sEjercicio = (value[iDevengue].nEjercicio as number).toString();
          let sMes = (value[iDevengue].nMes as number).toString();
          sMes = (sMes.length === 1) ? '0' + sMes : sMes;

          const a: number = +sMes;
          const b: number = +sEjercicio;
          this.nMes = sMes;
          this.nEjercicio = sEjercicio;
          const sFechDevengeue = '01/' + sMes + '/' + sEjercicio;
          this.dFechDevengue = moment(sFechDevengeue, 'DD/MM/YYYY').toDate();
          const tDate = moment(this.dFechDevengue).format('MMMM [del] YYYY');
          this.sHeaderDevengue = tDate[0].toUpperCase() + tDate.substr(1).toLowerCase();
        } else {
          this._snackBar.open('Usuario no cuenta con relación de personal.', 'Cerrar', {
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        }
      });
    }
    async LoadPersonal(edit: number, nIdPersonal: number) {
      const param = [];
      const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
      const sMes: number = + this.nMes;
      const sEjercicio: number = + this.nEjercicio;
      if ( edit === 1) {
        param.push('0¡bTipo!0');
      } else {
        param.push('0¡MONTH(NN.dFechIni)!' + sMes);
        param.push('0¡YEAR(NN.dFechIni)!' + sEjercicio);
      }

      await this.service._loadSP( 1, param).then( (value: any) => {
        if ( edit === 1) {
         value = value.filter(x => x.nIdPersonal === nIdPersonal);
        }
        this.PersonalDS = new MatTableDataSource(value);
        this.PersonalDS.paginator = this.pagPersonal;

        this.PersonalDS.filterPredicate = function(data, filter: string): boolean {
        return data.sNombres.trim().toLowerCase().includes(filter);
        };

        this.PersonalDS.filterPredicate = ((data: any, filter: any ) => {
        const a = !filter.sNombres || data.sNombres.toLowerCase().includes(filter.sNombres.toLowerCase());
        const b = !filter.sCiudad || data.sCiudad.toLowerCase().includes(filter.sCiudad.toLowerCase());
        return a && b;
        }) as (PeriodicElement, string) => boolean;


     });
    }

    async loadFechas(nIdDPP: number) {
      this.ListaFechas = [];
      const param = [];
      param.push('0¡nIdDPP!' + nIdDPP);
        await this.service._loadSP( 5, param).then( (value: IExpandedFechas[]) => {
        this.expandedFechas = value;
     });
     let calendar = new Date();
     const events: CalendarEvent[] = [];
      this.eventMain = [];
      // this.fechas
      this.expandedFechas.forEach( x => {
        const dFechIni = moment(x.dFecha).toDate();
        this.eventMain = [];
        this.viewDate = dFechIni;
        const nIdAsistencia = x.nIdAsistencia;
        // this.selectedDays.push(dFechIni);
        calendar = dFechIni;
        let fechas: Fechas;
         fechas = {
          date: dFechIni
        };
        this.ListaFechas.push(fechas);
          events.push({
            start: dFechIni,
            end: dFechIni,
            title: 'Inicio : ' + moment(dFechIni).format('DD/MM/YYYY') ,
            allDay: true,
            draggable: false,
            meta: nIdAsistencia,
            cssClass : 'cal-day-selected',
          });
        });
        this.viewDate = calendar;
        this.eventMain = events;
        this.refreshView();

    }

    refreshView(): void {
      this.refresh.next();
    }

    async selectResp(nIdPersonal: number, nIdResp: number) {
      let data;
      const param = [];
      this.nIdResp = nIdResp;
      param.push('0¡A.nIdPersonal!' + nIdPersonal);
      await this.service._loadSP( 2, param).then( (value: any) => {
        data = value;
     });

    this.fgDetail.controls['nIdPersonal'].setValue(data[0].nIdPersonal);
    this.fgDetail.controls['sNombres'].setValue(data[0].sNombres);
    this.fgDetail.controls['sCodPlla'].setValue(data[0].sCodPlla);
    this.fgDetail.controls['sTipo'].setValue(data[0].sTipo);
    this.fgDetail.controls['sDscTipo'].setValue(data[0].sDscTipo);
    this.fgDetail.controls['sDocumento'].setValue(data[0].sDocumento);
    this.fgDetail.controls['sCiudad'].setValue(data[0].sCiudad);
    this.fgDetail.controls['dFechIni'].setValue(data[0].dFechIni);
    this.fgDetail.controls['dFechFin'].setValue(data[0].dFechFin);
    this.fgDetail.controls['nTelMovil'].setValue(data[0].nTelMovil);
    this.fgDetail.controls['sOrganizacion'].setValue(data[0].sOrganizacion);
    this.fgDetail.controls['sCentroCosto'].setValue(data[0].sCentroCosto);
    this.fgDetail.controls['nIdCentroCosto'].setValue(data[0].nIdCentroCosto);

    const nTotalActual = this.fgSuma.controls['nTotal'].value;

    // if(nTotalActual > 0 && nIdPersonal > 0){
    //   this.fbAsis[0].dis = false;
    //   this.onToggleFab(1, 1);
    // }
    this.refreshAll();
    }

    refreshAll() {
      this.refresh.next();
      this.fgSuma.controls['nDias'].setValue(0);
      this.fgSuma.controls['nMonto'].setValue(0);
      this.fgSuma.controls['nTotal'].setValue(0);
      this.ListaFechas = [];
    }

    dayClicked(day: CalendarMonthViewDay): void {
      let valid = true;
      if (this.toggleAsis === 3) {
        valid = this.ValidarEliminacion(day);
      }
      if (valid) {
        if (this.toggleAsis === 1 || this.toggleAsis === 3) {
          this.selectedMonthViewDay = day;
          const mes = this.selectedMonthViewDay.date.getMonth();
          const sMes: number = + this.nMes;
          const events: CalendarEvent[] = [];
          this.eventMain = [];
          if( (mes + 1) === sMes ){
            const leng = this.ListaFechas.filter(x => x.date.getTime() === this.selectedMonthViewDay.date.getTime()).length;
            let dateIndex = -1 ;
            if (leng > 0) {
               dateIndex = this.ListaFechas.findIndex(
                (selectedDay) => selectedDay.date.getTime() === this.selectedMonthViewDay.date.getTime());
              this.ListaFechas.splice(dateIndex, 1);

            } else {
              let fechas: Fechas;
              fechas = {
               date: this.selectedMonthViewDay.date
             };
             this.ListaFechas.push(fechas);
            }

            if (dateIndex > -1) {
              // delete this.selectedMonthViewDay.cssClass;
              // this.selectedDays.splice(dateIndex, 1);
              this.ListaFechas.forEach(x => {
                events.push({
                  start: x.date,
                  end: x.date,
                  title: 'Inicio : ' + moment(x.date).format('DD/MM/YYYY') ,
                  allDay: true,
                  draggable: false,
                  cssClass : 'cal-day-selected',
                });
              });
              this.SumaCalendario();
              this.eventMain = events;
              this.refreshView();
            } else {
              // let fechas: Fechas;
              // fechas.date = this.selectedMonthViewDay.date;
              // this.ListaFechas.push(fechas);
              this.ListaFechas.forEach(x => {
                events.push({
                  start: x.date,
                  end: x.date,
                  title: 'Inicio : ' + moment(x.date).format('DD/MM/YYYY') ,
                  allDay: true,
                  draggable: false,
                  cssClass : 'cal-day-selected',
                });
              });
              // day.cssClass = 'cal-day-selected';
              this.selectedMonthViewDay = day;
              this.SumaCalendario();
              this.eventMain = events;
              this.refreshView();
            }
            } else {
              this._snackBar.open('Fecha fuera del mes de devengue.', 'Cerrar', {
                horizontalPosition: 'right',
                verticalPosition: 'top',
                duration: 3500,
              });
          }
        }
      } else {
        this._snackBar.open('Fecha pagada.', 'Cerrar', {
          horizontalPosition: 'right',
          verticalPosition: 'top',
          duration: 3500,
        });
      }
    }

    dayClicked2(day: CalendarMonthViewDay): void {
      this.selectedMonthViewDay = day;
      const mes = this.selectedMonthViewDay.date.getMonth();
      const sMes: number = + this.nMes;
      if( (mes + 1) === sMes ){

        const selectedDateTime = this.selectedMonthViewDay.date.getTime();
        const dateIndex = this.selectedDays.findIndex(
          (selectedDay) => selectedDay.date.getTime() === selectedDateTime
        );
        if (dateIndex > -1) {
          delete this.selectedMonthViewDay.cssClass;
          this.selectedDays.splice(dateIndex, 1);
          this.SumaCalendario();
        } else {
          this.selectedDays.push(this.selectedMonthViewDay);
          day.cssClass = 'cal-day-selected';
          this.selectedMonthViewDay = day;
          this.SumaCalendario();

        }
        } else {
          this._snackBar.open('Fecha fuera del mes de devengue.', 'Cerrar', {
            horizontalPosition: 'right',
            verticalPosition: 'top',
            duration: 3500,
          });
      }
    }

    SumaCalendario() {
      const dias2 = this.ListaFechas.length;
      const monto2 = this.fgSuma.controls['nMonto'].value;
      const nTotal2 = dias2 * monto2;
      this.fgSuma.controls['nDias'].setValue(dias2);
      this.fgSuma.controls['nTotal'].setValue(nTotal2);
    }

    private getTime(date?: Date) {
      return date != null ? date.getTime() : 0;
    }
    public sortByDueDate(): void {
      this.ListaFechas.sort((a: any, b: any) => {
          return this.getTime(a.date) - this.getTime(b.date);
      });
    }
    async SaveFechas() {
      const nIdPersonal = this.fgDetail.controls['nIdPersonal'].value;
      const nTotal = this.fgSuma.controls['nTotal'].value;

      if (nIdPersonal > 0 ) {

        if (nTotal > 0) {
          this.spi.show('spi_personal');
          this.sortByDueDate();
          const aParamPla = [];
          const aParamDetPla = [];
          const user = localStorage.getItem('currentUser');
          const uid = JSON.parse(window.atob(user.split('.')[1])).uid;
          // this.selectedDays.sort((a, b) => a.date > b.date);
          const minFecha = this.ListaFechas[0].date;
          const ultimo = this.ListaFechas.length - 1;
          const maxFecha = this.ListaFechas[ultimo].date;
          const nIdCentroCosto = this.fgDetail.controls['nIdCentroCosto'].value;
          const nMonto = this.fgSuma.controls['nMonto'].value;
          aParamPla.push('T1¡nIdResp!' + this.nIdResp);
          aParamPla.push('T1¡dFechIni!' + moment(minFecha).format('YYYY/MM/DD'));
          aParamPla.push('T1¡dFechFin!' + moment(maxFecha).format('YYYY/MM/DD') );
          aParamPla.push('T1¡nIdCentroCosto!' + nIdCentroCosto);
          aParamPla.push('T1¡nIdRegUser!' + uid);
          aParamPla.push('T1¡dtReg!GETDATE()');
          aParamPla.push('T1¡bTipo!' + 1);
          const resultpla =  await this.service._crudAM(3, aParamPla);

          aParamDetPla.push('T1¡' + resultpla);
          aParamDetPla.push('T1¡nIdPersonal!' + nIdPersonal);
          aParamDetPla.push('T1¡nIdRegUser!' + uid);
          aParamDetPla.push('T1¡dtReg!GETDATE()');
          const resultdet_pla =  await this.service._crudAM(2, aParamDetPla);

          this.ListaFechas.forEach(x => {
            const aParam = [];
            const dtReg = moment(x.date).format('YYYY/MM/DD');
            aParam.push('T1¡' + resultdet_pla);
            aParam.push('T1¡dFecha!' + dtReg);
            aParam.push('T1¡nIdDia!' + 2335);
            aParam.push('T1¡nImporte!' + nMonto);
            aParam.push('T1¡nIdRegUser!' + uid);
            aParam.push('T1¡dtReg!GETDATE()');
            const aResult = new Array();
            const result =  this.service._crudAM(1, aParam);
          });
          this.spi.hide('spi_personal');

            Swal.fire({
              title: 'Registro Correcto',
              text: 'Asistencia Manual Registrado Correctamente.',
              icon: 'question',
              confirmButtonColor: '#ff4081',
              confirmButtonText: 'Ok!',
              allowOutsideClick: false
            }).then((result) => {
              if (result.isConfirmed) {
                const oReturn = new Object();
                oReturn['modal'] = 'asispersonal';
                oReturn['value'] = 'loadAgain';
              this.activeModal.close(oReturn);
              } else {
                const oReturn = new Object();
                  oReturn['modal'] = 'asispersonal';
                  oReturn['value'] = 'loadAgain';
                this.activeModal.close(oReturn);
                // this.activeModal.dismiss();
              }
            });
        } else {
          Swal.fire(
            'No se puede guardar',
            'Información incorrecta o incompleta',
            'error'
          );
        }

      } else {
        this._snackBar.open('No seleccionó un personal.', 'Cerrar', {
          horizontalPosition: 'right',
          verticalPosition: 'top',
          duration: 3500,
        });
      }


    }

  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms)).then();
  }

  async ListaFechasTomadas() {
    const nIdPersonal = this.fgDetail.controls['nIdPersonal'].value;
    const nIdDevengue = this.nIdDevengue;
    const param = [];
    param.push('0¡nIdDevengue!' + nIdDevengue);
    param.push('0¡nIdPersonal!' + nIdPersonal);
      await this.service._loadSP( 8, param).then( (value: CalculoDias[]) => {
      this.ListaCalculoDias = value;
   });
   if (this.ListaCalculoDias.length > 0) {
     this.fbAsis2[1].dis = true;
     this.toggleAsis = 2;
     this.onToggleFab(2, 1);
   }

  }
  ValidarEliminacion(fecha: any) {
    let valido = true;
    const fechaConvert = moment(fecha.date).format('YYYY/MM/DD');
    if (this.ListaCalculoDias.length > 0) {
      this.ListaCalculoDias.forEach(x => {
        if ((fechaConvert >= moment(x.dIni).format('YYYY/MM/DD')) && (fechaConvert <= moment(x.dFin).format('YYYY/MM/DD'))){
          valido = false;
        }
      });
    }
    return valido;
  }
}

interface IPersonal {
  nIdPersonal: number;
  sNombres: string;
  sTipoDoc: string;
  sDocumento: string;
  sFechaIngreso: string;
  sFechaCese: string;
  sCiudad: string;
}

interface IExpandedFechas {
  nIdAsistencia: number;
  nIdDPP: number;
  dFecha: Date;
  nImporte: number;
}
interface Fechas{
  date: Date;
}

interface CalculoDias{
  nIdDevengue: number;
  nIdPeriodo: number;
  nIdPersonal: number;
  nIdConcepto: number;
  dIni: Date;
  dFin: Date;
}