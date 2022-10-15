import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { throwToolbarMixedModesError } from '@angular/material/toolbar';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarDateFormatter, CalendarEvent, CalendarMonthViewDay, CalendarView, DAYS_OF_WEEK } from 'angular-calendar';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, Subject } from 'rxjs';
import { ValidadoresService } from 'src/app/modulos/comercial/requerimiento/informep/validadores.service';
import { CustomDateFormatter } from 'src/app/modulos/egy-humana/JefaturaAP/Config/configCalendar';
// import { AsientoPllaAnimations } from 'src/app/modulos/finanzas/Animations/adminp.animations';
import Swal from 'sweetalert2';
import { kpiiAnimations } from '../../gestionp.animations';
import { GestionpService } from '../../services/gestionp.service';

type CalendarPeriod = 'day' | 'week' | 'month';

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
  // pink: {
  //   primary: '#FFFFFF',
  //   secondary: '#FFFFFF',
  // }
  pink: {
    primary: '#ff4081b0',
    secondary: '#FAE3E3',
  },
};



@Component({
  selector: 'app-gestionp-ruta',
  templateUrl: './gestionp-ruta.component.html',
  animations: [kpiiAnimations],
  providers: [GestionpService ,  {provide: CalendarDateFormatter, useClass: CustomDateFormatter}],
  // encapsulation: ViewEncapsulation.None,
  styleUrls: ['./gestionp-ruta.component.css', './gestionp-ruta.component.scss'],
  // styleUrls: ['./gestionp-ruta.component.css', './gestionp-ruta.component.scss'],

})
export class GestionpRutaComponent implements OnInit {
  @Input() fromParent;
  DiaAsignado = false;
  disableCalendario = true;
  disableRutas = true;
  disableHorario = true;
  disableButonAniadir = true;
  disableButtonGrabar = true;
  seleccionMasiva = false;
  disableNgSelect = true;

  accionVisualizar = true;

  expandedCalendario = false;
  expandedRutas = false;
  expandedHorario = false;

  fcToogle = new FormControl(false);
  ToogleActivo = false;

  datosCC: any[] = [];
  mPlanning: number;
  mTiendas: number;
  editTable: any;
  selectResp: any;
  nIdPersonalStatic = 0;
  fgFilter: FormGroup;
  fgUbigeo: FormGroup;
  fgHoras: FormGroup;

  locale = 'es';
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.MONDAY, DAYS_OF_WEEK.SUNDAY];
  viewDate: Date = new Date();
  eventMain: CalendarEvent[] = [];
  eventAsignadas: CalendarEvent[] = [];
  eventBack: CalendarEvent[] = [];
  eventDescanso: CalendarEvent[] = [];
  eventSeleccionadosMasivos: CalendarEvent[] = [];
  eventPendientes: CalendarEvent[] = [];
  refresh: Subject<any> = new Subject();
  selectedMonthViewDay: CalendarMonthViewDay;
  ListaSeleccionadosPendientes: Fechas[] = [];
  ListaSeleccionadosMasivos: Fechas[] = [];
  ListaSeleccionadosUnitarios: Fechas[] = [];
  ListaFechas: Fechas[] = [];
  ListaFechasReemplazar: Fechas[] = [];
  ListPendientesEliminados: Fechas[] = [];
  ListaFechasBack: Fechas[] = [];
  ListaFechasDescanso: Fechas[] = [];
  ListaFechasBackEliminar: Fechas[] = [];
  DiaSeleccionado = '';
  DiaSeleccionadoDate: Date = new Date();
  dFechaIni = '';
  dFechaFin = '';
  dFechaCalendario = '';
  nIdDPP = 0;
  sCodPlla = '';
  nIdCentroCosto = 0;
  PersonalSeleccionado = '';
  distritoIdStatic = '';

  abPerso = [];
  tsPerso = 'inactive';

  abHorario = [];
  tsHorario = 'inactive';

  maView_dp = 2;
  toggleRuta = 0;
  tadaRuta = 'inactive';
  tsRuta = 'active';
  abRuta = [];

  minDate: Date ;

  maxDate: Date ;

  fbRuta = [
    { icon: 'save', tool: 'Guardar', dis: true },
    { icon: 'cancel', tool: 'Cancelar', dis: true },
  ];

  fbRutaEdit = [
    { icon: 'edit', tool: 'Editar', dis: false },
    { icon: 'cancel', tool: 'Cancelar', dis: false },
  ];

  fbPerso = [
    {icon: 'groups', tool: 'Selección masiva', dis: false},
    {icon: 'hotel', tool: 'Descanso', dis: false},
    {icon: 'delete', tool: 'Limpiar', dis: false},
  ];

  fbHorario = [
    {icon: 'save', tool: 'Añadir horario', dis: false},
    {icon: 'cleaning_services', tool: 'Limpiar horario', dis: false},
  ];

  Departamentos = [];
  Provincias = [];
  Distritos = [];

  // getTienda$: Observable<any[]>;
  listaAsistencias: Asistencia[] = [];
  listaDiasUtilizados: any[] = [];
  listaRutas: Ruta[] = [];
  getTienda: Tienda[] = [];
  getTienda2: Tienda[] = [];
  TiendasSeleccionadas: Tienda[] = [];
  TiendaSelected: Tienda;

  PlanningRDC: string[] = ['sPersoImg', 'sNombres'];
  PlanningRDS: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild('pagPlanning', {static: false}) pagPlanning: MatPaginator;
  @ViewChild('mtPlanning', {static: false}) mtPlanning: MatTable<any>;
  @ViewChild('stepRight', { static: true }) stepLeft: MatStepper;

  constructor(
    public activeModal: NgbActiveModal,
    public _service: GestionpService,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private spi: NgxSpinnerService,
    private valid: ValidadoresService) {
      this.new_fgFilter();
      this.new_fgUbigeo();
      this.new_fgHoras();
    }

    //  https://ng-select.github.io/ng-select#/multiselect
     new_fgUbigeo() {
      this.fgUbigeo = this.fb.group({
        departamentoId: '',
        provinciaId: '',
        distritoId: ''
      });
     }

     new_fgHoras() {
      this.fgHoras = this.fb.group({
        sHoraIngreso: [{ value: '', disabled: true }],
        sMinutosIngreso: [{ value: '', disabled: true }],
        sHoraFin: [{ value: '', disabled: true }],
        sMinutosFin: [{ value: '', disabled: true }]
      });
     }

     new_fgFilter() {
      this.fgFilter = this.fb.group({
        sNombres: null
      });
      this.fgFilter.valueChanges.subscribe( value => {
        if (value.sNombres !== null) {
          const filter = {...value, name: value.sNombres.trim().toLowerCase()} as string;
          this.PlanningRDS.filter = filter;
          if (this.PlanningRDS.paginator) {
            this.PlanningRDS.paginator.firstPage();
          }
        }
      });

    }

  async ngOnInit() {
    this.onToggleFab(0, 2);
    this.onToggleFab(0, -1);
    this.nIdCentroCosto = this.fromParent.nIdCentroCosto;
    this.dFechaIni = this.fromParent.dFechaIni;
    this.dFechaFin = this.fromParent.dFechaFin;
    this.dFechaCalendario = 'Del ' + moment( this.dFechaIni , 'YYYY-MM-DD' ).format('DD/MM/YYYY')
    + ' al ' + moment( this.dFechaFin , 'YYYY-MM-DD' ).format('DD/MM/YYYY');
    const nIdPlanning = this.fromParent.nIdPlanning;
    await this.GetDetallePersonalPlanning(nIdPlanning);
    const countryId: string = localStorage.getItem('Pais');
    await this.GetDepartamento(countryId);
    this.mPlanning = 1;
    this.mTiendas = 1;
    this.viewDate = moment(this.dFechaIni).toDate();
    this.refreshView();
  }

   dateIsValid(date: Date): boolean {
    // const _minDate = this.fromParent.dFechaIni;
    // const _maxDate = this.fromParent.dFechaFin;
    this.minDate = new Date(moment( this.dFechaIni , 'YYYY-MM-DD' ).format('MM/DD/YYYY'));
    this.maxDate = new Date(moment(  this.dFechaFin , 'YYYY-MM-DD').format('MM/DD/YYYY'));
    return date >= this.minDate && date <= this.maxDate;
  }

   beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    body.forEach(day => {

      if (this.ListaSeleccionadosMasivos.some(x => this.mDateToString(x.date) === this.mDateToString(day.date))) {
        day.cssClass = 'cal-select';
      } else if (this.ListaSeleccionadosPendientes.some(x => this.mDateToString(x.date) === this.mDateToString(day.date))) {
        day.cssClass = 'cal-select';
      } else if (this.ListaFechas.some(x => this.mDateToString(x.date) === this.mDateToString(day.date))) {
        day.cssClass = 'cal-select-asignado';
      } else if (this.ListaSeleccionadosUnitarios.some(x => this.mDateToString(x.date) === this.mDateToString(day.date))) {
        day.cssClass = 'cal-select';
      } else if (this.ListaFechasBack.some(x => this.mDateToString(x.date) === this.mDateToString(day.date))) {
        const ent = this.ListaFechasBack.filter(x => x.date.getTime() === day.date.getTime())[0];
        if (ent.nIdDia === 2389 ) {
          day.cssClass = 'cal-select-descanso';
        } else {
          day.cssClass = 'cal-select-asignado';
        }
      } else if (this.ListaFechasDescanso.some(x => this.mDateToString(x.date) === this.mDateToString(day.date))) {
        day.cssClass = 'cal-select-descanso';
      } else {
        day.cssClass = 'cal-noSelect';
      }
      if (!this.dateIsValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }

    });
  }

  mDateToString(date: Date): string {
    const nDia = date.getDate();
    const nMes = date.getMonth();
    const nEjercicio = date.getFullYear();
    return nDia.toString() + '/' + nMes.toString() + '/' + nEjercicio.toString();
  }​​​​

  async restarDias(fecha, dias) {
    fecha.setDate(fecha.getDate() - dias);
    return fecha;
  }
  async loadFechasAsignadas() {
    this.eventAsignadas = [];
    this.eventPendientes = [];
    this.eventSeleccionadosMasivos = [];
    this.eventDescanso = [];
    this.eventBack = [];
    this.eventMain = [];
    let faltante = '';

    if ( this.ListaSeleccionadosPendientes.length > 0) {
      this.ListaSeleccionadosPendientes.forEach(x => {
          if (x.nIdsTienda === '') {
            faltante = 'Falta asignar tienda.';
          } else if (x.horaInicio === '') {
            faltante = 'Falta asignar horario.';
          }
          this.eventPendientes.push({
            start: x.date,
            title: faltante,
            allDay: true,
            draggable: false,
            color: colors.yellow,
          });
      });
    }

    if ( this.ListaSeleccionadosMasivos.length > 0) {
      this.ListaSeleccionadosMasivos.forEach(x => {
          this.eventSeleccionadosMasivos.push({
            start: x.date,
            title: 'Seleccionado',
            allDay: true,
            draggable: false,
            color: colors.pink,
          });
      });
    }

    if ( this.ListaFechas.length > 0) {
      this.ListaFechas.forEach(x => {
          this.eventAsignadas.push({
            start: x.date,
            title: 'Asignado',
            allDay: true,
            draggable: false,
            color: colors.green,
          });
      });
    }

    if (this.ListaFechasDescanso.length > 0 ) {
          this.ListaFechasDescanso.forEach(x => {
            this.eventDescanso.push({
              start: x.date,
              end: x.date,
              title: 'Descanso' ,
              allDay: true,
              draggable: false,
              color: colors.blue
            });
          });
    }

    if ( this.ListaFechasBack.length > 0) {
      this.ListaFechasBack.forEach(x => {
        let color;
        if (x.nIdDia === 2389 ) {
          color = colors.blue;
        } else {
          color = colors.green;
        }
          this.eventBack.push({
            start: x.date,
            title: faltante,
            allDay: true,
            draggable: false,
            color: color,
          });
      });
    }

      this.eventMain = this.eventMain.concat(this.eventBack, this.eventSeleccionadosMasivos,
        this.eventDescanso, this.eventPendientes, this.eventAsignadas);

    // if (arrayFecha.length > 0 ) {
    //   arrayFecha.forEach(fecha => {
    //     const index = this.ListaSeleccionadosMasivos.findIndex(
    //       (select) => select.date.getTime() === fecha.getTime());
    //       this.ListaSeleccionadosMasivos.splice(index, 1);
    //   });
    // }

    // if (this.ListaSeleccionadosMasivos.length > 0) {
    //   this.ListaSeleccionadosMasivos.forEach(x => {
    //     if (x.nIdsTienda !== '' && x.horaInicio !== '') {
    //       const ent = this.ListaSeleccionadosMasivos.filter(a => a.date.getTime() === x.date.getTime())[0];
    //       const index = this.ListaSeleccionadosMasivos.findIndex(
    //                     (select) => select.date.getTime() === x.date.getTime());
    //       arrayFecha.push(ent.date);
    //      this.ListaFechas.push(ent);
    //     } else {
    //       if (x.nIdsTienda === '') {
    //         faltante = 'Falta asignar tienda.';
    //       } else if (x.horaInicio === '') {
    //         faltante = 'Falta asignar horario.';
    //       } else {
    //         faltante = 'Seleccionado.';
    //       }
    //       this.eventSeleccionadosMasivos.push({
    //         start: x.date,
    //         title: faltante,
    //         allDay: true,
    //         draggable: false,
    //         color: colors.yellow,
    //       });
    //     }
    //   });
    //   const event = [];
    //   if (this.ListaFechasDescanso.length > 0 ) {
    //     this.ListaFechasDescanso.forEach(x => {
    //       event.push({
    //         start: x.date,
    //         end: x.date,
    //         title: 'Descanso' ,
    //         allDay: true,
    //         draggable: false,
    //         color: colors.blue
    //       });
    //     });
    //     this.eventDescanso = event;
    //   }
    //   this.eventMain = [];
    //   if (this.ListaFechas.length > 0 ) {
    //     this.ListaFechas.forEach(a => {
    //       this.eventAsignadas.push({
    //         start: a.date,
    //         title: 'Asignado',
    //         allDay: true,
    //         draggable: false,
    //         color: colors.green,
    //       });
    //     });
    //   }
    //   this.eventMain = this.eventMain.concat(this.eventBack, this.eventSeleccionadosMasivos, this.eventDescanso, this.eventAsignadas);
    // }
}

async ValidarDias(nIdDPP: number) {
  await this._service.ValidarDias(nIdDPP).then((response: any) => {
    if (response.status === 200) {
      this.listaDiasUtilizados = response.body.response.data;
    }
  });
}

  async clickFab(opc: number, index: number) {
    switch (opc) {
      case 0:
        switch (index) {
          case 0:
            if (this.ListaFechas.length > 0 || this.ListaFechasBackEliminar.length > 0 ) {
              await this.ValidarDias(this.nIdDPP);
              await this.DatosCentroCosto(this.nIdCentroCosto);
              const datosllave = this.listaDiasUtilizados[0];
              const lista = this.listaDiasUtilizados.filter(x => x.nIdDPP !== this.nIdDPP && x.nIdAsistencia !== 0);
              const listadiasPermitidos = this.datosCC.filter(x => x.nIdSucursal === datosllave.nIdSucursal
                && x.nIdPartida === datosllave.nIdPuesto && x.nIdCanal === datosllave.nIdCanal
                && x.nIdCategoria === datosllave.nIdPerfil);
              let diasPermitidos = 0;
              if (listadiasPermitidos.length > 0) {
                diasPermitidos = listadiasPermitidos[0].nCantPersonal * listadiasPermitidos[0].nDiaPla;
              } else {
                this._snackBar.open('No tiene dias asignados.', 'Cerrar', {
                  horizontalPosition: 'right',
                  verticalPosition: 'top',
                  duration: 3500,
                });
                return;

              }
              const cantDias = lista.length + this.ListaFechas.length + this.ListaFechasBack.length;
              const diasRestantes = diasPermitidos - cantDias;
              if (diasRestantes < 0 ) {
                this._snackBar.open('Excede el limite de dias.', 'Cerrar', {
                  horizontalPosition: 'right',
                  verticalPosition: 'top',
                  duration: 3500,
                });
                return;
              }

              Swal.fire({
                title:
                  '¿Esta seguro de guardar el planning?',
                text: 'Esta acción no se puede deshacer.',
                icon: 'question',
                showCancelButton: true,
                cancelButtonText: 'Cerrar!',
                confirmButtonColor: '#ff4081',
                confirmButtonText: 'Si!',
                allowOutsideClick: false,
              }).then( async (result) => {
                if (result.isConfirmed) {
                  const nIdDiaAsistencia = 2335;
                  const nIdDiaDescanso = 2389;
                  const llave = this.listaDiasUtilizados[0];
                  let nImporte = 0;
                  if (this.sCodPlla === '3') {
                    nImporte = this.datosCC.filter(x => x.nIdSucursal === llave.nIdSucursal && x.nIdPartida === llave.nIdPuesto
                      && x.nIdCanal === llave.nIdCanal && x.nIdCategoria === llave.nIdPerfil )[0].dRemxDia;
                  }
                  const user = localStorage.getItem('currentUser');
                  const nIdRegUser = JSON.parse(window.atob(user.split('.')[1])).uid;
                  let nOrden = 0;
                  if (this.nIdDPP > 0) {
                    if (this.ListaFechasBackEliminar.length > 0 ) {
                      this.ListaFechasBackEliminar.forEach(  async x => {
                        await this.DeleteRuta(x.nIdAsistencia);
                      });
                    }

                    if (this.ListaFechasBackEliminar.length > 0 ) {
                      this.ListaFechasBackEliminar.forEach(  async x => {
                        await this.DeleteAsistencia(x.nIdAsistencia);
                      });
                    }
                    // if (this.ListaFechasBackEliminar.length > 0 ) {
                    //   this.ListaFechasBackEliminar.forEach( async x => {
                    //     await this.DeleteAsistencia(x.nIdAsistencia);
                    //   });
                    // }
                    if (this.ListaFechas.length > 0) {
                      if (this.ListaFechasDescanso.length > 0) {
                        this.ListaFechasDescanso.forEach(async xy => {
                          const dia =  moment(  xy.dia.trim(), 'DD/MM/YYYY' ).format('YYYY/MM/DD');
                          await this._service.InsertAsistencia(this.nIdDPP, dia, nIdDiaDescanso,
                            nImporte, parseInt(nIdRegUser, 10), '', '').then((response: any) => {
                              if (response.status === 200) {
                                const nIdAsistencia = response.body.response.data;
                              }
                            });
                        });
                      }

                      this.ListaFechas.forEach(async x => {
                        const tini = x.horaInicio + ':' + x.minInicio;
                        const tfin = x.horaFin + ':' + x.minFin;
                        const nidTiendas = x.nIdsTienda.split(',');
                        const dia =  moment(  x.dia.trim(), 'DD/MM/YYYY' ).format('YYYY/MM/DD');
                        await this._service.InsertAsistencia(this.nIdDPP, dia, nIdDiaAsistencia,
                              nImporte, parseInt(nIdRegUser, 10), tini, tfin).then((response: any) => {
                                if (response.status === 200) {
                                    nOrden = 0;
                                    const nIdAsistencia = response.body.response.data[0];
                                    nidTiendas.forEach(async xx => {
                                    nOrden++;
                                    const nidTienda = parseInt(xx, 10);
                                    const nIdRegUser2 = parseInt(nIdRegUser, 10);
                                     await this._service.InsertRuta(nIdAsistencia, nidTienda, nIdRegUser2 , nOrden)
                                     .then((response2: any) => {
                                        if (response2.status === 200) {
                                          const nidRuta = response.body.response.data;
                                        }
                                      });
                                    });
                                }
                              });
                            });
                    }
                    this.spi.show('spi_ruta');
                     this.delay(2250).then( async (any) => {
                      this.spi.hide('spi_ruta');
                      Swal.fire({
                        title:
                          'Planning Modificado',
                        text: 'Se modificó el planning correctamente.',
                        icon: 'success',
                        showCancelButton: true,
                        cancelButtonText: 'Cerrar!',
                        confirmButtonColor: '#ff4081',
                        confirmButtonText: 'Continuar!',
                        allowOutsideClick: false,
                      }).then( async (result2) => {
                        if (result.isConfirmed) {
                          // this.ListaFechas = [];
                          // this.ListaSeleccionadosMasivos = [];
                          // const nIdPlanning = this.fromParent.nIdPlanning;
                          // await this.GetDetallePersonalPlanning(nIdPlanning);
                          // this.ListaFechasBack = [];
                          // this.eventMain = [];
                          // this.eventSeleccionadosMasivos = [];
                          // this.eventDescanso = [];
                          // await this.RecuperarFechasMarcadas();
                          // await this.MarcarFechas();
                          // this.mTiendas = 0;
                          // this.disableButonAniadir = false;
                          // this.disableNgSelect = false;
                          // this.DesactivarBotonesHorario();
                          this.spi.show('spi_ruta');
                          this.eventMain = [];
                          this.refreshView();
                          this.ListaFechas = [];
                          this.ListaSeleccionadosUnitarios = [];
                          this.ListaSeleccionadosMasivos = [];
                          this.ListaFechasBack = [];
                          this.ListaFechasBackEliminar = [];
                          this.expandedHorario = false;
                          this.expandedRutas = false;
                          this.disableCalendario = false;
                          this.disableHorario = true;
                          this.disableRutas = true;
                          this.toggleRuta = 1;
                          await this.onToggleFab(0, -1);
                          this.delay(250).then((any) => {
                            this.onToggleFab(0, 2);
                            });
                          this.accionVisualizar = true;
                          await this.onToggleFab(1, -1);
                          await this.onToggleFab(1, 0);
                          this.fbRuta[0].dis = false;
                          this.fbRuta[1].dis = false;
                          this.ListaFechasBack = [];
                          this.TiendasSeleccionadas = [];
                          this.fgHoras.controls['sHoraIngreso'].setValue('');
                          this.fgHoras.controls['sMinutosIngreso'].setValue('');
                          this.fgHoras.controls['sHoraFin'].setValue('');
                          this.fgHoras.controls['sMinutosFin'].setValue('');
                          this.DiaSeleccionado = '';
                          this.DiaSeleccionadoDate = new Date();
                          this.eventMain = [];
                          this.ListaFechasDescanso = [];
                          this.ListaFechasReemplazar = [];
                          this.ListaSeleccionadosPendientes = [];
                          await this.RecuperarFechasMarcadas();
                          await this.MarcarFechas();
                          this.spi.hide('spi_ruta');
                        } else {
                          this.activeModal.close();
                        }
                      });
                   });
                  }
                  // this.delay(450).then( async (any) => {
                  //  });
                }
              });
            } else {
              await this.ValidarDias(this.nIdDPP);
              await this.DatosCentroCosto(this.nIdCentroCosto);
              const nIdDiaDescanso = 2389;
              const llave = this.listaDiasUtilizados[0];
              let nImporte = 0;
                  if (this.sCodPlla === '3') {
                    nImporte = this.datosCC.filter(x => x.nIdSucursal === llave.nIdSucursal && x.nIdPartida === llave.nIdPuesto
                      && x.nIdCanal === llave.nIdCanal && x.nIdCategoria === llave.nIdPerfil )[0].dRemxDia;
                  }
              const user = localStorage.getItem('currentUser');
              const nIdRegUser = JSON.parse(window.atob(user.split('.')[1])).uid;
              const cantFechaBack = this.ListaFechasBack.filter(x => x.nIdDia === 2335).length;
              if ( cantFechaBack > 0 && this.ListaFechasDescanso.length > 0 ) {
                  this.ListaFechasDescanso.forEach(async xy => {
                    const dia =  moment(  xy.dia.trim(), 'DD/MM/YYYY' ).format('YYYY/MM/DD');
                    await this._service.InsertAsistencia(this.nIdDPP, dia, nIdDiaDescanso,
                      nImporte, parseInt(nIdRegUser, 10), '', '').then((response: any) => {
                        if (response.status === 200) {
                          const nIdAsistencia = response.body.response.data;
                        }
                      });
                  });
                  this.spi.show('spi_ruta');
                  this.delay(2250).then( async (any) => {
                   this.spi.hide('spi_ruta');
                   Swal.fire({
                     title:
                       'Planning Modificado',
                     text: 'Se modificó el planning correctamente.',
                     icon: 'success',
                     showCancelButton: true,
                     cancelButtonText: 'Cerrar!',
                     confirmButtonColor: '#ff4081',
                     confirmButtonText: 'Continuar!',
                     allowOutsideClick: false,
                   }).then( async (result2) => {
                     if (result2.isConfirmed) {
                      //  this.ListaFechas = [];
                      //  this.ListaSeleccionadosMasivos = [];
                      //  const nIdPlanning = this.fromParent.nIdPlanning;
                      //  await this.GetDetallePersonalPlanning(nIdPlanning);
                      //  this.ListaFechasBack = [];
                      //  this.eventMain = [];
                      //  this.eventSeleccionadosMasivos = [];
                      //  this.eventDescanso = [];
                      //  await this.RecuperarFechasMarcadas();
                      //  await this.MarcarFechas();
                      //  this.mTiendas = 0;
                      //  this.disableButonAniadir = false;
                      //  this.disableNgSelect = false;
                      this.spi.show('spi_ruta');
                      this.eventMain = [];
                      this.refreshView();
                      this.ListaFechas = [];
                      this.ListaSeleccionadosUnitarios = [];
                      this.ListaSeleccionadosMasivos = [];
                      this.ListaFechasBack = [];
                      this.ListaFechasBackEliminar = [];
                      this.expandedHorario = false;
                      this.expandedRutas = false;
                      this.disableCalendario = false;
                      this.disableHorario = true;
                      this.disableRutas = true;
                      this.toggleRuta = 1;
                      await this.onToggleFab(0, -1);
                      this.delay(250).then((any) => {
                        this.onToggleFab(0, 2);
                        });
                      this.accionVisualizar = true;
                      await this.onToggleFab(1, -1);
                      await this.onToggleFab(1, 0);
                      this.fbRuta[0].dis = false;
                      this.fbRuta[1].dis = false;
                      this.ListaFechasBack = [];
                      this.TiendasSeleccionadas = [];
                      this.fgHoras.controls['sHoraIngreso'].setValue('');
                      this.fgHoras.controls['sMinutosIngreso'].setValue('');
                      this.fgHoras.controls['sHoraFin'].setValue('');
                      this.fgHoras.controls['sMinutosFin'].setValue('');
                      this.DiaSeleccionado = '';
                      this.DiaSeleccionadoDate = new Date();
                      this.eventMain = [];
                      this.ListaFechasDescanso = [];
                      this.ListaFechasReemplazar = [];
                      this.ListaSeleccionadosPendientes = [];
                      await this.RecuperarFechasMarcadas();
                      await this.MarcarFechas();
                      this.spi.hide('spi_ruta');
                     } else {
                       this.activeModal.close();
                     }
                   });
                });
              } else {
                this._snackBar.open('Día sin asignaciones.', 'Cerrar', {
                  horizontalPosition: 'right',
                  verticalPosition: 'top',
                  duration: 3500,
                });
              }
            }
            break;
          case 1:
            Swal.fire({
              title:
                'Cancelar cambios.',
              text: 'Esta seguro de cancelar?.',
              icon: 'question',
              showCancelButton: true,
              cancelButtonText: 'Cerrar!',
              confirmButtonColor: '#ff4081',
              confirmButtonText: 'Continuar!',
              allowOutsideClick: false,
            }).then( async (result2) => {
              if (result2.isConfirmed) {
                this.spi.show('spi_ruta');
                this.eventMain = [];
                this.refreshView();
                this.ListaFechas = [];
                this.ListaSeleccionadosUnitarios = [];
                this.ListaSeleccionadosMasivos = [];
                this.ListaFechasBack = [];
                this.ListaFechasBackEliminar = [];
                this.expandedHorario = false;
                this.expandedRutas = false;
                this.disableCalendario = false;
                this.disableHorario = true;
                this.disableRutas = true;
                this.toggleRuta = 1;
                await this.onToggleFab(0, -1);
                this.delay(250).then((any) => {
                  this.onToggleFab(0, 2);
                  });
                this.accionVisualizar = true;
                await this.onToggleFab(1, -1);
                await this.onToggleFab(1, 0);
                this.fbRuta[0].dis = false;
                this.fbRuta[1].dis = false;
                this.ListaFechasBack = [];
                this.TiendasSeleccionadas = [];
                this.fgHoras.controls['sHoraIngreso'].setValue('');
                this.fgHoras.controls['sMinutosIngreso'].setValue('');
                this.fgHoras.controls['sHoraFin'].setValue('');
                this.fgHoras.controls['sMinutosFin'].setValue('');
                this.DiaSeleccionado = '';
                this.DiaSeleccionadoDate = new Date();
                this.eventMain = [];
                this.ListaFechasDescanso = [];
                this.ListaFechasReemplazar = [];
                this.ListaSeleccionadosPendientes = [];
                await this.RecuperarFechasMarcadas();
                await this.MarcarFechas();
                this.spi.hide('spi_ruta');
              } else {
              }
            });
            // await this.onToggleFab(0, -1);
            // await this.onToggleFab(0, 0);
            // this.fbPerso[2].dis = true;
            // this.delay(250).then((any) => {
            //    this.onToggleFab(0, 2);
            // });
            // await this.onToggleFab(1, -1);
            // this.delay(250).then((any) => {
            //   this.onToggleFab(1, 0);
            // });
            // this.ListaFechasBackEliminar = [];
            // this.accionVisualizar = true;
            // this.expandedRutas = false;
            // this.expandedHorario = false;
            // this.disableHorario = true;
            // this.disableRutas = true;
            // this.DiaSeleccionado = '';
            // this.DiaSeleccionadoDate = new Date();
            // this.onToggleFab(2, -1);
            // this.toggleRuta = 1;
            // this.ListaFechasBack = [];
            // await this.RecuperarFechasMarcadas();
            // await this.MarcarFechas();
            break;
        }
        break;
      case 1:
        switch (index) {
          case 0:
              Swal.fire({
                title:
                  '¿Esta seguro de editar el planning?',
                text: '',
                icon: 'question',
                showCancelButton: true,
                cancelButtonText: 'Cerrar!',
                confirmButtonColor: '#ff4081',
                confirmButtonText: 'Si!',
                allowOutsideClick: false,
              }).then((result) => {
                if (result.isConfirmed) {
                  this.toggleRuta = 0;
                  this.accionVisualizar = false;
                  this.onToggleFab(1, 1);

                  if ( this.DiaSeleccionado !== '' ) {
                    const DiaActual = new Date();
                    this.fbPerso[2].dis = false;
                    if ( this.DiaSeleccionadoDate <= DiaActual) {
                      this.DesactivarBotonesHorario();
                    } else {
                        this.ActivarBotonesHorario();
                    }
                    this.onToggleFab(0, -1);
                    this.onToggleFab(0, 0);
                    this.delay(250).then((any) => {
                      this.onToggleFab(0, 1);
                    });
                  } else {
                    this.fbPerso[2].dis = true;
                    // this.onToggleFab(1, 1);
                    this.onToggleFab(0, -1);
                    this.delay(250).then((any) => {
                      this.onToggleFab(0, 1);
                    });
                    // this.ActivarBotonesHorario();
                    this.expandedHorario = false;
                    this.expandedRutas = false;
                    this.disableHorario = true;
                    this.disableRutas = true;
                  }

                }
              });
            break;
          case 1:
            this.activeModal.close();
          break;
        }
        break;
      case 5:
        switch (index) {
          case 0:
            if ( this.accionVisualizar) {
              this.fbPerso[1].dis = true;
              this.fbPerso[2].dis = true;
            }
            this.ListaSeleccionadosMasivos = [];
            this.ListaSeleccionadosUnitarios = [];
            this.eventMain = [];
            // this.eventMain = this.eventMain.concat(this.eventBack, this.eventSeleccionadosMasivos,  
            //   this.eventDescanso, this.eventAsignadas);
            // this.ListaFechas = [];
            // this.eventSeleccionadosMasivos = [];
            // this.eventDescanso = [];
            // this.ListaFechasDescanso = [];
            // // this.eventMain = this.eventMain.concat( this.eventBack, this.eventSeleccionadosMasivos);
            // this.eventMain = this.eventBack;
            // this.refreshView();
            this.disableHorario = true;
            this.disableRutas = true;
            if (this.seleccionMasiva === false) {
              this.seleccionMasiva = true;
              this.fbPerso[0].icon = 'person';
              this.fbPerso[0].tool = 'Selección individual';
              this.fbPerso[1].dis = true;
              this.fbPerso[2].dis = true;
              this.BloquearTiendasHorario();
              // this.onToggleFab(1, -1);
              // this.onToggleFab(1, 0);
              // this.delay(50).then((any) => {
              //   this.fbPerso[1].dis = false;
              //   // this.onToggleFab(1, 1);
              //   });
            } else {
              this.seleccionMasiva = false;
              this.fbPerso[0].icon = 'groups';
              this.fbPerso[0].tool = 'Selección masiva';
              this.fbPerso[1].dis = false;
              this.fbPerso[2].dis = false;
              this.DesactivarBotonesHorario();
              // this.onToggleFab(1, -1);
              // this.onToggleFab(1, 0);
              // this.delay(50).then((any) => {
              //   this.fbPerso[1].dis = false;
              //   // this.onToggleFab(1, 1);
              //   });
            }
            this.loadFechasAsignadas();
            break;
          case 1:
            if ( this.DiaSeleccionado.trim() !== '' ){
              const lengthdescanso = this.ListaFechasDescanso.filter(x => x.date.getTime() === this.DiaSeleccionadoDate.getTime()).length;
              const lengthFecha = this.ListaFechas.filter(x => x.date.getTime() === this.DiaSeleccionadoDate.getTime()).length;
              const lengthfechasBack = this.ListaFechasBack.filter(x => x.date.getTime() === this.DiaSeleccionadoDate.getTime()).length;
              if (lengthdescanso <= 0 && lengthFecha <= 0 && lengthfechasBack <= 0 ) {
                const events = [];
                  let fechas: Fechas;
                  fechas = {
                    nIdAsistencia: 0,
                    date: this.DiaSeleccionadoDate,
                    nIdsTienda: '',
                    horaInicio: '',
                    minInicio: '',
                    horaFin: '',
                    minFin: '',
                    dia: this.DiaSeleccionado,
                    nIdDia : 2389
                 };
              this.ListaFechasDescanso.push(fechas);
              this.ListaFechasDescanso.forEach(x => {
                events.push({
                  start: x.date,
                  end: x.date,
                  title: 'Descanso' ,
                  allDay: true,
                  draggable: false,
                  color: colors.blue
                });
              });
              this.eventDescanso = events;
              this.eventMain = this.eventSeleccionadosMasivos.concat(this.eventBack, this.eventDescanso);
              this._snackBar.open('Se agrego descanso.', 'Cerrar', {
                horizontalPosition: 'right',
                verticalPosition: 'top',
                duration: 3500,
              });
              } else {
                this._snackBar.open('Fecha se encuentra seleccionada.', 'Cerrar', {
                  horizontalPosition: 'right',
                  verticalPosition: 'top',
                  duration: 3500,
                });
              }
            } else {
              this._snackBar.open('Fecha sin seleccionar.', 'Cerrar', {
                horizontalPosition: 'right',
                verticalPosition: 'top',
                duration: 3500,
              });
            }
            break;
          case 2:
            const leng3 = this.ListaFechasBack.filter(x => x.date.getTime() === this.DiaSeleccionadoDate.getTime()).length;
            const leng4 = this.ListaFechas.filter(x => x.date.getTime() === this.DiaSeleccionadoDate.getTime()).length;
            const leng5 = this.ListaFechasDescanso.filter(x => x.date.getTime() === this.DiaSeleccionadoDate.getTime()).length;
            if (leng3 > 0 ) {
              Swal.fire({
                title:
                  '¿Esta seguro de eliminar el planning del dia ' + this.DiaSeleccionado + '?',
                text: 'Esta eliminación no se puede deshacer.',
                icon: 'question',
                showCancelButton: true,
                cancelButtonText: 'Cerrar!',
                confirmButtonColor: '#ff4081',
                confirmButtonText: 'Si!',
                allowOutsideClick: false,
              }).then((result) => {
                if (result.isConfirmed) {
                  const len = this.ListaFechasBack.filter(x => x.date.getTime() === this.DiaSeleccionadoDate.getTime()).length;
                  if (len > 0 ) {
                    let dateIndexBack = -1;
                    dateIndexBack = this.ListaFechasBack.findIndex( (x) =>
                    x.date.getTime() === this.DiaSeleccionadoDate.getTime());
                    this.ListaFechasBackEliminar.push(this.ListaFechasBack[dateIndexBack]);
                    this.ListaFechasBack.splice(dateIndexBack, 1);
                    const indexeventBack = this.eventBack.findIndex( (x) =>
                    x.start.getTime() === this.DiaSeleccionadoDate.getTime());
                    this.eventBack.splice(indexeventBack, 1);
                    this.eventMain = [];
                    this.eventMain = this.eventBack.concat(this.eventSeleccionadosMasivos);
                    Swal.fire(
                      'Eliminación correcta.',
                      'Información eliminada.',
                      'success'
                    );
                  }
                }
              });
            } else if ( leng4 > 0 ) {
              Swal.fire({
                title:
                  '¿Esta seguro de eliminar el planning del dia ' + this.DiaSeleccionado + '?',
                text: 'Esta eliminación no se puede deshacer.',
                icon: 'question',
                showCancelButton: true,
                cancelButtonText: 'Cerrar!',
                confirmButtonColor: '#ff4081',
                confirmButtonText: 'Si!',
                allowOutsideClick: false,
              }).then((result) => {
                if (result.isConfirmed) {
                  const dateIndex3 = this.ListaFechas.findIndex( (selectedDay) =>
                    selectedDay.date.getTime() === this.DiaSeleccionadoDate.getTime());
                  this.ListaFechas.splice(dateIndex3, 1);
                  const dateIndex4 = this.eventSeleccionadosMasivos.findIndex( (selectedDay) =>
                  selectedDay.start.getTime() === this.DiaSeleccionadoDate.getTime());
                  this.eventSeleccionadosMasivos.splice(dateIndex4, 1);
                  this.eventMain = [];
                  this.eventMain = this.eventBack.concat(this.eventSeleccionadosMasivos);
                  Swal.fire(
                    'Eliminación correcta.',
                    'Información eliminada.',
                    'success'
                  );
                }
              });
            } else if (leng5 > 0) {
              Swal.fire({
                title:
                  '¿Esta seguro de eliminar el descanso del dia ' + this.DiaSeleccionado + '?',
                text: 'Esta eliminación no se puede deshacer.',
                icon: 'question',
                showCancelButton: true,
                cancelButtonText: 'Cerrar!',
                confirmButtonColor: '#ff4081',
                confirmButtonText: 'Si!',
                allowOutsideClick: false,
              }).then((result) => {
                if (result.isConfirmed) {
                  const dateIndex4 = this.ListaFechasDescanso.findIndex( (selectedDay) =>
                    selectedDay.date.getTime() === this.DiaSeleccionadoDate.getTime());
                  this.ListaFechasDescanso.splice(dateIndex4, 1);
                  const dateIndex5 = this.eventDescanso.findIndex( (selectedDay) =>
                  selectedDay.start.getTime() === this.DiaSeleccionadoDate.getTime());
                  this.eventDescanso.splice(dateIndex5, 1);
                  this.eventMain = [];
                  this.eventMain = this.eventBack.concat(this.eventSeleccionadosMasivos, this.eventDescanso);
                  Swal.fire(
                    'Eliminación correcta.',
                    'Información eliminada.',
                    'success'
                  );
                }
              });
            } else {
              this._snackBar.open('Día sin asignaciones.', 'Cerrar', {
                horizontalPosition: 'right',
                verticalPosition: 'top',
                duration: 3500,
              });
            }
          break;
        }
        break;
      case 6:
        switch (index) {
          case 0:
            const HoraIngreso = this.fgHoras.controls['sHoraIngreso'].value;
            const MinutosIngreso = this.fgHoras.controls['sMinutosIngreso'].value;
            const HoraFin = this.fgHoras.controls['sHoraFin'].value;
            const MinutosFin = this.fgHoras.controls['sMinutosFin'].value;
            let arrayEliminarPendientes: Fechas[] = [];
            if (this.seleccionMasiva === true) {
              const lengMasivos = this.ListaSeleccionadosMasivos.length;
              const lengPendiente = this.ListaSeleccionadosPendientes.length;
              if ( lengMasivos > 0) {
                this.ListaSeleccionadosMasivos.forEach(x => {
                  x.horaInicio = HoraIngreso;
                  x.minInicio = MinutosIngreso;
                  x.horaFin = HoraFin;
                  x.minFin = MinutosFin;
              });
              }

              if ( lengPendiente > 0) {
                this.ListaSeleccionadosPendientes.forEach(x => {
                  x.horaInicio = HoraIngreso;
                  x.minInicio = MinutosIngreso;
                  x.horaFin = HoraFin;
                  x.minFin = MinutosFin;
              });
              }
              this.ListaSeleccionadosPendientes.forEach(a => {
                const ent = this.ListaSeleccionadosPendientes.filter(b => b.date === a.date)[0];
                if (a.nIdsTienda !== '' && a.horaInicio !== '') {
                  this.ListaFechas.push(ent);
                  arrayEliminarPendientes.push(ent);
                }
              });
              if (arrayEliminarPendientes.length > 0) {
                arrayEliminarPendientes.forEach(c => {
                  const indexx = this.ListaSeleccionadosPendientes.findIndex( (x) =>
                  x.date.getTime() === c.date.getTime());
                  this.ListaSeleccionadosPendientes.splice(indexx, 1);
                });
                arrayEliminarPendientes = [];
              }
              this.loadFechasAsignadas();

              this._snackBar.open('Se agregó el horario correctamente.', 'Cerrar', {
                  horizontalPosition: 'right',
                  verticalPosition: 'top',
                  duration: 3500,
                });
            } else {
              let entHorario: Fechas;

              if (HoraIngreso !== '' && MinutosIngreso !== '' && HoraFin !== '' && MinutosFin !== '' ) {

                const lengBack = this.ListaFechasBack.filter(x => x.date.getTime() === this.DiaSeleccionadoDate.getTime()).length;
                if ( lengBack > 0 ) {
                  const ent = this.ListaFechasBack.filter(x => x.date.getTime() === this.DiaSeleccionadoDate.getTime())[0];
                  const indexBack = this.ListaFechasBack.findIndex( (x) =>
                    x.date.getTime() === this.DiaSeleccionadoDate.getTime());
                  this.ListaFechasBack.splice(indexBack, 1);
                  const indexEvent = this.eventBack.findIndex( (x) =>
                    x.start.getTime() === this.DiaSeleccionadoDate.getTime());
                  this.eventBack.splice(indexEvent, 1);
                  this.ListaSeleccionadosMasivos.push(ent);
                  return;
                }

                const leng2 = this.ListaSeleccionadosMasivos.filter(x => x.date.getTime() === this.DiaSeleccionadoDate.getTime()).length;
                if (leng2 > 0 ) {
                const ent = this.ListaSeleccionadosMasivos.filter(x => x.date.getTime() === this.DiaSeleccionadoDate.getTime())[0];
                  entHorario = {
                    nIdAsistencia: 0,
                    date: this.DiaSeleccionadoDate,
                    nIdsTienda: ent.nIdsTienda,
                    horaInicio: HoraIngreso,
                    minInicio: MinutosIngreso,
                    horaFin: HoraFin,
                    minFin: MinutosFin,
                    dia: this.DiaSeleccionado,
                    nIdDia : 2335
                  };
                  this.ListaSeleccionadosMasivos = [];
                  this.ListaSeleccionadosPendientes.push(entHorario);
                  this._snackBar.open('Se agregó el horario correctamente.', 'Cerrar', {
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                    duration: 3500,
                  });
                  this.loadFechasAsignadas();
                  return;
                }

                const leng3 = this.ListaSeleccionadosPendientes.filter(x => x.date.getTime() === this.DiaSeleccionadoDate.getTime()).length;
                if (leng3 > 0 ) {
                const ent = this.ListaSeleccionadosPendientes.filter(x => x.date.getTime() === this.DiaSeleccionadoDate.getTime())[0];
                const index3 = this.ListaSeleccionadosPendientes.findIndex(
                  (selectedDay) => selectedDay.date.getTime() === this.DiaSeleccionadoDate.getTime());
                this.ListaSeleccionadosPendientes.splice(index3, 1);
                this.ListaSeleccionadosMasivos = [];
                if (ent.nIdsTienda !== '') {
                  entHorario = {
                    nIdAsistencia: 0,
                    date: this.DiaSeleccionadoDate,
                    nIdsTienda: ent.nIdsTienda,
                    horaInicio: HoraIngreso,
                    minInicio: MinutosIngreso,
                    horaFin: HoraFin,
                    minFin: MinutosFin,
                    dia: this.DiaSeleccionado,
                    nIdDia : 2335
                  };
                  this.ListaFechas.push(entHorario);
                  this._snackBar.open('Se agregó el horario correctamente.', 'Cerrar', {
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                    duration: 3500,
                  });
                  this.loadFechasAsignadas();
                  return;
                } else {
                  entHorario = {
                    nIdAsistencia: 0,
                    date: this.DiaSeleccionadoDate,
                    nIdsTienda: ent.nIdsTienda,
                    horaInicio: HoraIngreso,
                    minInicio: MinutosIngreso,
                    horaFin: HoraFin,
                    minFin: MinutosFin,
                    dia: this.DiaSeleccionado,
                    nIdDia : 2335
                  };
                  this.ListaSeleccionadosPendientes.push(entHorario);
                  this._snackBar.open('Se agregó el horario correctamente.', 'Cerrar', {
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                    duration: 3500,
                  });
                  this.loadFechasAsignadas();
                  return;
                }
                }
                  const lenAsignado = this.ListaFechas.filter(x => x.date.getTime()
                                          === this.DiaSeleccionadoDate.getTime()).length;
                  if (lenAsignado > 0 ) {
                    const entAsignado = this.ListaFechas.filter(x => x.date.getTime()
                                          === this.DiaSeleccionadoDate.getTime())[0];
                    const indexAsignado = this.ListaFechas.findIndex(
                          (selectedDay) => selectedDay.date.getTime() === this.DiaSeleccionadoDate.getTime());
                    entHorario = {
                      nIdAsistencia: 0,
                      date: this.DiaSeleccionadoDate,
                      nIdsTienda: entAsignado.nIdsTienda,
                      horaInicio: HoraIngreso,
                      minInicio: MinutosIngreso,
                      horaFin: HoraFin,
                      minFin: MinutosFin,
                      dia: this.DiaSeleccionado,
                      nIdDia : 2335
                    };
                  this.ListaFechas.splice(indexAsignado, 1);
                  this.ListaFechas.push(entHorario);
                  this._snackBar.open('Se agregó el horario correctamente.', 'Cerrar', {
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                    duration: 3500,
                  });
                  this.loadFechasAsignadas();
                  return;
                }
              } else {
                this._snackBar.open('Verifique el horario.', 'Cerrar', {
                  horizontalPosition: 'right',
                  verticalPosition: 'top',
                  duration: 3500,
                });
              }
            }
        break;
          case 1:
            this.fgHoras.get('sHoraIngreso').setValue('');
            this.fgHoras.get('sMinutosIngreso').setValue('');
            this.fgHoras.get('sHoraFin').setValue('');
            this.fgHoras.get('sMinutosFin').setValue('');
            this.fgHoras.controls['sHoraIngreso'].setValue('');
            this.fgHoras.controls['sMinutosIngreso'].setValue('');
            this.fgHoras.controls['sHoraFin'].setValue('');
            this.fgHoras.controls['sMinutosFin'].setValue('');
            // this.expandedHorario = false;
            // this.expandedCalendario = true;
          break;
        }
        break;
      }
  }

  async onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 0:
        if (stat === -1) {
          if (this.abRuta.length > 0) {
            stat = 0;
          } else {
            stat = this.maView_dp === -1 ? 1 : 2;
          }
        }

        this.tsRuta = stat === 0 ? 'inactive' : 'active2';

        switch (stat) {
          case 0:
            this.abRuta = [];
            break;
          case 1:
            // Guardar cambios
            this.abRuta = this.fbRuta;
            break;
          case 2:
            // boton editar
            this.abRuta = this.fbRutaEdit;
            break;
          case 3:
            break;
        }
        break;
      case 1:
        stat = ( stat === -1 ) ? ( this.abPerso.length > 0 ) ? 0 : 1 : stat;
        this.tsPerso = ( stat === 0 ) ? 'inactive' : 'active';
        this.abPerso = ( stat === 0 ) ? [] : this.fbPerso;
        break;
      case 2:
          stat = ( stat === -1 ) ? ( this.abHorario.length > 0 ) ? 0 : 1 : stat;
          this.tsHorario = ( stat === 0 ) ? 'inactive' : 'active';
          this.abHorario = ( stat === 0 ) ? [] : this.fbHorario;
         break;
    }
  }

  //#region "Ubigeo"
  async ChangeDepartamento(event: any) {
    if (event.value !== undefined) {
      const nId = event.value;
      await this.GetProvincia(nId);
    }
  }
  async ChangeProvincia(event: any) {
    if (event.value !== undefined) {
      const nId = event.value;
      await this.GetDistrito(nId);
    }
  }
  async ChangeDistrito(event: any) {
    if (event.value !== undefined) {
      this.distritoIdStatic = event.value;
      await this.GetTienda(this.distritoIdStatic);
    }
  }
  async GetDepartamento(nId: string) {
    const nIdStore = 11;
    await this._service.GetUbigeo(nIdStore, nId).then((response: any) => {
      if (response.status === 200) {
        this.Departamentos = response.body.response.data;
      }
    });
  }

  async GetProvincia(nId: string) {
    const nIdStore = 12;
    await this._service.GetUbigeo(nIdStore, nId).then((response: any) => {
      if (response.status === 200) {
        this.Provincias = response.body.response.data;
      }
    });
  }

  async GetDistrito(nId: string) {
    const nIdStore = 13;
    await this._service.GetUbigeo(nIdStore, nId).then((response: any) => {
      if (response.status === 200) {
        this.Distritos = response.body.response.data;
      }
    });
  }
  //#endregion

  //#region  Delete y Get
  async DeleteAsistencia(nIdAsistencia: number) {
    let respuesta;
    await this._service.DeleteAsistencia(nIdAsistencia).then((response: any) => {
      if (response.status === 200) {
        respuesta = response.body.response.data;
      }
    });
  }

  async DeleteRuta(nIdAsistencia: number) {
    let respuesta;
    await this._service.DeleteRuta(nIdAsistencia).then((response: any) => {
      if (response.status === 200) {
        respuesta = response.body.response.data;
      }
    });
  }

  async GetTienda(sIdUbigeo: string) {
    await this._service.GetTienda(sIdUbigeo).then((response: any) => {
      if (response.status === 200) {
        this.getTienda = response.body.response.data;
        this.getTienda2 = response.body.response.data;
      }
    });
  }

  async GetAsistencias(nIdDPP: number) {
    await this._service.GetAsistencias(nIdDPP).then((response: any) => {
      if (response.status === 200) {
        this.listaAsistencias = response.body.response.data;
      }
    });
  }

  async GetRutas(nIdAsistencia: number) {
    await this._service.GetRutas(nIdAsistencia).then((response: any) => {
      if (response.status === 200) {
        this.listaRutas = response.body.response.data;
      }
    });
  }

  async GetDetallePersonalPlanning(nIdPlanning: number) {
    this.spi.show('spi_ruta');
    this.PlanningRDS.data = [];
    let data;
    await this._service.GetDetallePersonalPlanning(nIdPlanning).then((response: any) => {
      if (response.status === 200) {
        data = response.body.response.data;
      }
    });

    data.forEach(x => {
      this.PlanningRDS.data.push({
        nIdDPP : x.nIdDPP,
        nIdPersonal: x.nIdPersonal,
        sNombres: x.sNombres,
        sCodPlla: x.sCodPlla,
        nCategoria: x.nIdPerfil,
        sCategoria: x.sPerfil,
        nCanal: x.nIdCanal,
        sCanal: x.sCanal,
        nDias: x.nDias,
        sIdUbigeo: x.sIdUbigeo,
      });
    });
    this.PlanningRDS.paginator = this.pagPlanning;

    this.PlanningRDS.filterPredicate = function( data1, filter: string): boolean {
      // return data1.sNombres.trim().toLowerCase().includes(filter) || data.sDocumento.trim().toLowerCase().includes(filter);
      return data1.sNombres.trim().toLowerCase().includes(filter);
    };
    this.PlanningRDS.filterPredicate = (( data2: any, filter: any ) => {
      const a = !filter.sNombres || ( data2.sNombres.toLowerCase().includes(filter.sNombres.toLowerCase()) );
      // ||  data.sDocumento.toLowerCase().includes(filter.sNombres.toLowerCase()) );
      return a;
    }) as (PeriodicElement: any, string: any) => boolean;
    this.mtPlanning.renderRows();
    this.spi.hide('spi_ruta');

  }

  //#endregion

  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }

  async DatosCentroCosto(nIdCentroCosto: number) {
    await this._service.GetDatosCentroCosto( nIdCentroCosto ).then((response: any) => {
      if (response.status === 200) {
        this.datosCC = response.body.response.data;
      }
    });
  }

  async selectPerso(element: any) {
    if (this.mPlanning === 1 ) {
      this.spi.show('spi_ruta');
      this.sCodPlla = element.sCodPlla;
      this.eventMain = [];
      this.refreshView();
      this.ListaFechas = [];
      this.ListaSeleccionadosUnitarios = [];
      this.ListaSeleccionadosMasivos = [];
      this.ListaFechasBack = [];
      this.ListaFechasBackEliminar = [];
      this.PersonalSeleccionado = element.sNombres;
      this.nIdDPP = element.nIdDPP;
      this.expandedHorario = false;
      this.expandedRutas = false;
      this.disableCalendario = false;
      this.disableHorario = true;
      this.disableRutas = true;
      this.nIdPersonalStatic = element.nIdPersonal;
      const sIdUbigeo = element.sIdUbigeo;
      const departamentoId = sIdUbigeo.substring(0, 5);
      const provinciaId = sIdUbigeo.substring(0, 7);
      const distritoId = sIdUbigeo.substring(0, 9);
      this.fgUbigeo.get('departamentoId').setValue(departamentoId);
      await this.GetProvincia(departamentoId);
      this.fgUbigeo.get('provinciaId').setValue(provinciaId);
      await this.GetDistrito(provinciaId);
      this.fgUbigeo.get('distritoId').setValue(distritoId);
      this.fgUbigeo.controls['departamentoId'].setValue(departamentoId);
      this.fgUbigeo.controls['provinciaId'].setValue(provinciaId);
      this.fgUbigeo.controls['distritoId'].setValue(distritoId);
      this.distritoIdStatic = distritoId;
      this.toggleRuta = 1;
      await this.onToggleFab(0, -1);
      this.delay(250).then((any) => {
        this.onToggleFab(0, 2);
        });
      this.accionVisualizar = true;
      // await this.onToggleFab(1, -1);
      await this.onToggleFab(1, -1);
      await this.onToggleFab(1, 0);
      await this.GetTienda(distritoId);
      this.fbRuta[0].dis = false;
      this.fbRuta[1].dis = false;
      // Traer Datos de la asistencia
      this.ListaFechasBack = [];
      this.TiendasSeleccionadas = [];
      this.fgHoras.controls['sHoraIngreso'].setValue('');
      this.fgHoras.controls['sMinutosIngreso'].setValue('');
      this.fgHoras.controls['sHoraFin'].setValue('');
      this.fgHoras.controls['sMinutosFin'].setValue('');
      this.DiaSeleccionado = '';
      this.DiaSeleccionadoDate = new Date();
      this.eventMain = [];
      this.ListaFechasDescanso = [];
      await this.RecuperarFechasMarcadas();
      await this.MarcarFechas();
      this.spi.hide('spi_ruta');
    } else {

    }
  }


  async RecuperarFechasMarcadas() {
    await this.GetAsistencias(this.nIdDPP);
    if (this.listaAsistencias.length > 0) {
     this.listaAsistencias.forEach( x => {
        let entFecha: Fechas;
        const horaInicio = x.tIni.split(':');
        const horaFin = x.tFin.split(':');
        const date = new Date(x.dFecha);
        const dia = moment( x.dFecha, 'MM/DD/YYYY' ).format('DD/MM/YYYY');
        entFecha = {
          nIdAsistencia: x.nIdAsistencia,
          date: date,
          nIdsTienda: '',
          horaInicio: horaInicio[0],
          minInicio: horaInicio[1],
          horaFin: horaFin[0],
          minFin: horaFin[1],
          dia: dia,
          nIdDia : x.nIdDia
        };
        this.ListaFechasBack.push(entFecha);
      });
    }
  }
  async MarcarFechas() {
    this.eventBack = [];
    let colorBack;
    let titulo;
    this.ListaFechasBack.forEach(x => {
      if (x.nIdDia === 2389) {
        colorBack = colors.blue;
        titulo = 'Descanso';
      } else {
        colorBack = colors.green;
        titulo = 'Asignado';
      }
      this.eventBack.push({
        start: x.date,
        end: x.date,
        title: titulo ,
        allDay: true,
        draggable: false,
        color: colorBack,
      });
    });
    this.eventMain = this.eventBack;
    this.refreshView();
  }
  mouseOver(opc: number, element: any) {
    switch (opc) {
      case 1:
        if ( this.mPlanning === 1 ) {
          this.editTable = element;
        }
        break;
      case 2:
        this.selectResp = element;
        break;
    }
  }
  refreshView(): void {
    this.refresh.next();
  }

  SelectedTienda(element: any) {
    if ( element !== undefined) {
      const nIdTienda = element.nIdTienda;
      if (nIdTienda  > 0) {
        this.disableButonAniadir = false;
      }
    } else {
      this.disableButonAniadir = true;
    }
  }

  async GrabarTiendas() {
    if (this.TiendasSeleccionadas.length > 0) {

        const leng = this.ListaSeleccionadosMasivos.filter(x => x.date.getTime() === this.DiaSeleccionadoDate.getTime()).length;
        let entFecha: Fechas;
        let nIdsTienda = '';
          this.TiendasSeleccionadas.forEach(x => {
            nIdsTienda = nIdsTienda + x.nIdTienda + ',';
          });
          nIdsTienda = nIdsTienda.slice(0, -1);

          if (leng > 0) {
          const ent = this.ListaSeleccionadosMasivos.filter(x => x.date.getTime() === this.DiaSeleccionadoDate.getTime());
            entFecha = {
              nIdAsistencia: 0,
              date: this.DiaSeleccionadoDate,
              nIdsTienda: nIdsTienda,
              horaInicio: ent[0].horaInicio,
              minInicio: ent[0].minInicio,
              horaFin: ent[0].horaFin,
              minFin: ent[0].minFin,
              dia: this.DiaSeleccionado,
              nIdDia : 2335
            };
            const dateIndex = this.ListaSeleccionadosMasivos.findIndex(
              (selectedDay) => selectedDay.date.getTime() === this.DiaSeleccionadoDate.getTime());
            this.ListaSeleccionadosMasivos.splice(dateIndex, 1);
          } else {
            entFecha = {
              nIdAsistencia: 0,
              date: this.DiaSeleccionadoDate,
              nIdsTienda: nIdsTienda,
              horaInicio: '',
              minInicio: '',
              horaFin: '',
              minFin: '',
              dia: this.DiaSeleccionado,
              nIdDia : 2335
            };
          }
          Swal.fire(
            'Rutas Agregadas.',
            'Se agregó la ruta correctamente.',
            'success'
          );
          this.ListaSeleccionadosMasivos.push(entFecha);
          await this.loadFechasAsignadas();
      } else {
        this._snackBar.open('No se agregaron rutas.', 'Cerrar', {
          horizontalPosition: 'right',
          verticalPosition: 'top',
          duration: 3500,
        });
      }
  }

  async removeTienda(item: any) {
    const nIdTienda = item.nIdTienda;
    const Index = this.TiendasSeleccionadas.findIndex( (x) =>
    x.nIdTienda === nIdTienda);
    this.TiendasSeleccionadas.splice(Index, 1);
    if (this.TiendasSeleccionadas.length === 0) {
      this.disableButtonGrabar = true;
    }

    const leng = this.ListaFechasBack.filter(x => x.date.getTime() === this.DiaSeleccionadoDate.getTime()).length;
    if ( leng > 0 ) {
      const ent = this.ListaFechasBack.filter(x => x.date.getTime() === this.DiaSeleccionadoDate.getTime())[0];
      this.ListaFechasBackEliminar.push(ent);
      const index = this.ListaFechasBack.findIndex( (x) =>
      x.date.getTime() === this.DiaSeleccionadoDate.getTime());
      this.ListaFechasBack.splice(index, 1);
      const indexEvent = this.eventBack.findIndex( (x) =>
      x.start.getTime() === this.DiaSeleccionadoDate.getTime());
      this.eventBack.splice(indexEvent, 1);
      this.ListaSeleccionadosMasivos.push(ent);
    }
    const leng2 = this.ListaSeleccionadosMasivos.filter(x => x.date.getTime() === this.DiaSeleccionadoDate.getTime()).length;
    if ( leng2 > 0 ) {
      const index2 = this.ListaSeleccionadosMasivos.findIndex( (x) =>
      x.date.getTime() === this.DiaSeleccionadoDate.getTime());

      let nIdsTiendas = '';
      if ( this.TiendasSeleccionadas.length > 0 ) {
        this.TiendasSeleccionadas.forEach(x => {
          nIdsTiendas = nIdsTiendas + x.nIdTienda + ',';
        });
        nIdsTiendas = nIdsTiendas.slice(0, -1);
        this.ListaSeleccionadosMasivos[index2].nIdsTienda = nIdsTiendas;
      } else {
        this.ListaSeleccionadosMasivos[index2].nIdsTienda = nIdsTiendas;
        await this.loadFechasAsignadas();
      }
    }

  }

  async addTienda() {
    const tienda = this.TiendaSelected;
    const Existe = this.TiendasSeleccionadas.filter( (x) =>
    x.nIdTienda === tienda.nIdTienda).length;
    const Index = this.getTienda.findIndex( (x) =>
    x.nIdTienda === tienda.nIdTienda);
    this.getTienda[Index].disabled = true;
    this.getTienda = this.getTienda;
    if ( Existe > 0) {
      this._snackBar.open('Tienda Seleccionada.', 'Cerrar', {
        horizontalPosition: 'right',
        verticalPosition: 'top',
        duration: 3500,
      });
    } else {
      this.TiendasSeleccionadas.push(tienda);
      let nIdsTienda = '';
            this.TiendasSeleccionadas.forEach(x => {
              nIdsTienda = nIdsTienda + x.nIdTienda + ',';
            });
            nIdsTienda = nIdsTienda.slice(0, -1);
      if (this.seleccionMasiva) {
        //#region Seleccion masiva marcada
        const lenM = this.ListaSeleccionadosMasivos.length;
        if ( lenM > 0) {
          let nIdsTiendaM = '';
          let entFecha: Fechas;
            this.TiendasSeleccionadas.forEach(x => {
              nIdsTiendaM = nIdsTiendaM + x.nIdTienda + ',';
            });
            nIdsTiendaM = nIdsTiendaM.slice(0, -1);
            this.ListaSeleccionadosMasivos.forEach(z => {
              entFecha = {
                nIdAsistencia: 0,
                date: z.date,
                nIdsTienda: nIdsTiendaM,
                horaInicio: '',
                minInicio: '',
                horaFin: '',
                minFin: '',
                dia: z.dia,
                nIdDia : 2335
              };
              this.ListaSeleccionadosPendientes.push(entFecha);
            });
            this.ListaSeleccionadosMasivos = [];
            this.loadFechasAsignadas();
            return;
        }
        //#endregion

      } else {
        // Seleccion unitaria marcada
        //#region Agregar tiendas a seleccion
        const lengExiste = this.ListaSeleccionadosMasivos.filter(x => x.date.getTime()
            === this.selectedMonthViewDay.date.getTime()).length;
        if (lengExiste > 0) {
          // const ent = this.ListaSeleccionadosPendientes.filter(x => x.date.getTime() === this.selectedMonthViewDay.date.getTime())[0];
          let entSeleccion: Fechas;
            entSeleccion = {
              nIdAsistencia: 0,
              date: this.DiaSeleccionadoDate,
              nIdsTienda: nIdsTienda,
              horaInicio: '',
              minInicio: '',
              horaFin: '',
              minFin: '',
              dia: this.DiaSeleccionado,
              nIdDia : 2335
           };
           this.ListaSeleccionadosMasivos = [];
           this.ListaSeleccionadosPendientes.push(entSeleccion);
           this.loadFechasAsignadas();
           return;
        }
        const lengPendiente = this.ListaSeleccionadosPendientes.filter(x => x.date.getTime()
            === this.selectedMonthViewDay.date.getTime()).length;
        if (lengPendiente > 0) {
          const ent = this.ListaSeleccionadosPendientes.filter(x => x.date.getTime() === this.selectedMonthViewDay.date.getTime())[0];
          const index = this.ListaSeleccionadosPendientes.findIndex(
            (selectedDay) => selectedDay.date.getTime() === this.DiaSeleccionadoDate.getTime());
          this.ListaSeleccionadosPendientes.splice(index, 1);
          let entSeleccion: Fechas;
            entSeleccion = {
              nIdAsistencia: 0,
              date: this.DiaSeleccionadoDate,
              nIdsTienda: nIdsTienda,
              horaInicio: ent.horaInicio,
              minInicio: ent.minInicio,
              horaFin: ent.horaFin,
              minFin: ent.minFin,
              dia: this.DiaSeleccionado,
              nIdDia : 2335
           };
           this.ListaSeleccionadosPendientes.push(entSeleccion);
           return;
        }
        //#endregion
      }
    }
  }

  ActivarBotonesHorario() {
    if ( this.seleccionMasiva === true ){
      this.fbPerso[2].dis = true;
    } else {
      this.fbPerso[2].dis = false;
    }
    this.mTiendas = 0;
    this.disableNgSelect = false;
    this.disableButonAniadir = false;
    this.fgHoras.controls['sHoraIngreso'].enable();
    this.fgHoras.controls['sMinutosIngreso'].enable();
    this.fgHoras.controls['sHoraFin'].enable();
    this.fgHoras.controls['sMinutosFin'].enable();
    this.onToggleFab(2, 1);
  }

  DesactivarBotonesHorario() {
    this.mTiendas = 1;
    this.disableButonAniadir = true;
    this.disableNgSelect = true;
    this.fgHoras.controls['sHoraIngreso'].disable();
    this.fgHoras.controls['sMinutosIngreso'].disable();
    this.fgHoras.controls['sHoraFin'].disable();
    this.fgHoras.controls['sMinutosFin'].disable();
    this.onToggleFab(2, -1);
    this.onToggleFab(2, 0);
  }

  BloquearTiendasHorario() {
    this.expandedHorario = false;
    this.expandedRutas = false;
    this.disableHorario = true;
    this.disableRutas = true;
  }

  DesbloquearTiendasHoraio() {
    this.expandedHorario = false;
    this.expandedRutas = false;
    this.disableHorario = false;
    this.disableRutas = false;
  }

  LimpiarTiendasHorario() {
    this.TiendasSeleccionadas = [];
    this.fgHoras.controls['sHoraIngreso'].setValue('');
    this.fgHoras.controls['sMinutosIngreso'].setValue('');
    this.fgHoras.controls['sHoraFin'].setValue('');
    this.fgHoras.controls['sMinutosFin'].setValue('');
  }

  EventFechasAsignadas() {
    this.eventAsignadas = [];
    this.ListaFechas.forEach( x => {
      this.eventAsignadas.push({
        start: x.date,
        end: x.date,
        title: 'Asignado ' ,
        allDay: true,
        draggable: false,
        color: colors.green
      });
    });
    this.eventMain = this.eventBack.concat(this.eventAsignadas, this.eventDescanso);
  }

  dayClicked(day: CalendarMonthViewDay): void {
    if (this.nIdPersonalStatic > 0) {
      if (!this.accionVisualizar) {
          // this.EventFechasAsignadas();
          this.DiaSeleccionado = '' + moment( new Date(day.date)).format('DD/MM/YYYY');
          this.DiaSeleccionadoDate = new Date(day.date);
          this.selectedMonthViewDay = day;
          const DiaActual = new Date();
        if ( this.DiaSeleccionadoDate > DiaActual) {
          if (this.seleccionMasiva === true) {
            this.TiendasSeleccionadas = [];
            this.DiaAsignado = false;
            this.ActivarBotonesHorario();
            this.DesbloquearTiendasHoraio();
            const leng1 = this.ListaFechasBack.filter(x => x.date.getTime() === this.selectedMonthViewDay.date.getTime()).length;
            const ent1 = this.ListaFechasBack.filter(x => x.date.getTime() === this.selectedMonthViewDay.date.getTime())[0];
            if (leng1 > 0) {
              this.ListaFechasBackEliminar.push(ent1);
              this.ListaSeleccionadosMasivos.push(ent1);
            }

            const leng2 = this.ListaSeleccionadosMasivos.filter(x => x.date.getTime() === this.selectedMonthViewDay.date.getTime()).length;
            if (leng2 > 0) {
              const index = this.ListaSeleccionadosMasivos.findIndex(
                (selectedDay) => selectedDay.date.getTime() === this.selectedMonthViewDay.date.getTime());
              this.ListaSeleccionadosMasivos.splice(index, 1);
              const lengR = this.ListaFechasReemplazar.filter(x => x.date.getTime() === this.selectedMonthViewDay.date.getTime()).length;
              if ( lengR > 0) {
                const indexR = this.ListaFechasReemplazar.findIndex(
                  (selectedDay) => selectedDay.date.getTime() === this.selectedMonthViewDay.date.getTime());
                const entR = this.ListaFechasReemplazar.filter(x => x.date.getTime() === this.selectedMonthViewDay.date.getTime())[0];
                this.ListaFechasReemplazar.splice(indexR, 1);
                this.ListaFechas.push(entR);
                this.loadFechasAsignadas();
                return;
              }
              const lengRP = this.ListPendientesEliminados.filter(x => x.date.getTime() 
              === this.selectedMonthViewDay.date.getTime()).length;
              if ( lengRP > 0) {
                const indexRP = this.ListPendientesEliminados.findIndex(
                  (selectedDay) => selectedDay.date.getTime() === this.selectedMonthViewDay.date.getTime());
                const entR = this.ListPendientesEliminados.filter(x => x.date.getTime() === this.selectedMonthViewDay.date.getTime())[0];
                this.ListPendientesEliminados.splice(indexRP, 1);
                this.ListaSeleccionadosPendientes.push(entR);
                this.loadFechasAsignadas();
                return;
              }

            }
            const leng3 = this.ListaFechas.filter(x => x.date.getTime() === this.selectedMonthViewDay.date.getTime()).length;
            const ent3 = this.ListaFechas.filter(x => x.date.getTime() === this.selectedMonthViewDay.date.getTime())[0];
            if (leng3 > 0) {
              this.DiaAsignado = true;
              const index3 = this.ListaFechas.findIndex(
                (selectedDay) => selectedDay.date.getTime() === this.selectedMonthViewDay.date.getTime());
              this.ListaFechas.splice(index3, 1);
              this.ListaFechasReemplazar.push(ent3);
              this.ListaSeleccionadosMasivos.push(ent3);

            }

            const leng4 = this.ListaSeleccionadosPendientes.filter(x => x.date.getTime()
            === this.selectedMonthViewDay.date.getTime()).length;
            const ent4 = this.ListaSeleccionadosPendientes.filter(x => x.date.getTime() === this.selectedMonthViewDay.date.getTime())[0];
            if (leng4 > 0) {
              this.DiaAsignado = true;
              const index4 = this.ListaSeleccionadosPendientes.findIndex(
                (selectedDay) => selectedDay.date.getTime() === this.selectedMonthViewDay.date.getTime());
              this.ListaSeleccionadosPendientes.splice(index4, 1);
              this.ListPendientesEliminados.push(ent4);
              this.ListaSeleccionadosMasivos.push(ent4);
            }

            if (leng1 === 0 && leng2 === 0 && leng3 === 0 && leng4 === 0 ) {
              let fechas: Fechas;
                fechas = {
                  nIdAsistencia: 0,
                  date: this.DiaSeleccionadoDate,
                  nIdsTienda: '',
                  horaInicio: '',
                  minInicio: '',
                  horaFin: '',
                  minFin: '',
                  dia: this.DiaSeleccionado,
                  nIdDia : 2335
               };
               this.ListaSeleccionadosMasivos.push(fechas);
            }


            this.loadFechasAsignadas();

          } else {
            // seleccion unitaria
            //#region Si esta en la bd
            const leng1 = this.ListaFechasBack.filter(x => x.date.getTime() === this.selectedMonthViewDay.date.getTime()).length;
            const DiaActual2 = new Date();
            if (leng1 > 0) {
              const ent1 = this.ListaFechasBack.filter(x => x.date.getTime() === this.selectedMonthViewDay.date.getTime());
              // Si esta grabado y es descanso bloquea todo
              if (ent1[0].nIdDia === 2389 ) {
                this.expandedHorario = false;
                this.expandedRutas = false;
                this.disableRutas = true;
                this.disableHorario = true;
                return;
              }
              if ( this.DiaSeleccionadoDate <= DiaActual2) {
                this.DesactivarBotonesHorario();
              } else {
                this.ActivarBotonesHorario();
              }
              this.DesbloquearTiendasHoraio();
              this.MostrarDatosFechaBack(this.selectedMonthViewDay.date);
              this.loadFechasAsignadas();

              return;
            }
            //#endregion
            //#region Si esta en la lista de pendientes.
            const lengPendiente = this.ListaSeleccionadosPendientes.filter(x => x.date.getTime()
            === this.selectedMonthViewDay.date.getTime()).length;
            if (lengPendiente > 0) {
              this.TiendasSeleccionadas = [];
              this.DiaSeleccionado = moment( new Date(day.date)).format('DD/MM/YYYY');
              const ent = this.ListaSeleccionadosPendientes.filter(x => x.date.getTime() === this.selectedMonthViewDay.date.getTime())[0];
              const nIdsTienda = ent.nIdsTienda;
              if (ent.nIdsTienda !== '') {
                const divisiones = nIdsTienda.split(',');
                divisiones.forEach(x => {
                  const datos = this.getTienda2.filter( xx => xx.nIdTienda === Number(x));
                  this.TiendasSeleccionadas.push(datos[0]);
                });
              }
              this.fgHoras.controls['sHoraIngreso'].setValue(ent.horaInicio);
              this.fgHoras.controls['sMinutosIngreso'].setValue(ent.minInicio);
              this.fgHoras.controls['sHoraFin'].setValue(ent.horaFin);
              this.fgHoras.controls['sMinutosFin'].setValue(ent.minFin);
              // Mostrar pintado de seleccionado cuando ya esta pendiente.
              this.ListaSeleccionadosMasivos = [];
              if ( this.DiaSeleccionadoDate <= DiaActual2) {
                this.DesactivarBotonesHorario();
              } else {
                this.ActivarBotonesHorario();
              }
              this.DesbloquearTiendasHoraio();
              // this.ListaSeleccionadosMasivos.push(ent);
              this.loadFechasAsignadas();
              return;
            }
            //#endregion
             //#region Si esta en la lista de fechas.
             const lengFecha = this.ListaFechas.filter(x => x.date.getTime()
             === this.selectedMonthViewDay.date.getTime()).length;
             if (lengFecha > 0) {
              if ( this.DiaSeleccionadoDate <= DiaActual2) {
                this.DesactivarBotonesHorario();
              } else {
                this.ActivarBotonesHorario();
              }
              this.DesbloquearTiendasHoraio();
               this.TiendasSeleccionadas = [];
               const ent = this.ListaFechas.filter(x => x.date.getTime() === this.selectedMonthViewDay.date.getTime())[0];
               const nIdsTienda = ent.nIdsTienda;
               if (ent.nIdsTienda !== '') {
                 const divisiones = nIdsTienda.split(',');
                 divisiones.forEach(x => {
                   const datos = this.getTienda2.filter( xx => xx.nIdTienda === Number(x));
                   this.TiendasSeleccionadas.push(datos[0]);
                 });
               }
               this.fgHoras.controls['sHoraIngreso'].setValue(ent.horaInicio);
               this.fgHoras.controls['sMinutosIngreso'].setValue(ent.minInicio);
               this.fgHoras.controls['sHoraFin'].setValue(ent.horaFin);
               this.fgHoras.controls['sMinutosFin'].setValue(ent.minFin);
               // Mostrar pintado de seleccionado cuando ya esta pendiente.
               this.ListaSeleccionadosMasivos = [];
               // this.ListaSeleccionadosMasivos.push(ent);
               this.loadFechasAsignadas();
               return;
             }
             //#endregion
            //#region Si no esta en la bd se marca , si no esta en la lista de pendientes.
            this.LimpiarTiendasHorario();
            let entSeleccion: Fechas;
            entSeleccion = {
              nIdAsistencia: 0,
              date: this.DiaSeleccionadoDate,
              nIdsTienda: '',
              horaInicio: '',
              minInicio: '',
              horaFin: '',
              minFin: '',
              dia: this.DiaSeleccionado,
              nIdDia : 2335
           };
           this.ListaSeleccionadosMasivos = [];
           this.ListaSeleccionadosMasivos.push(entSeleccion);
           this.loadFechasAsignadas();
           this.DesbloquearTiendasHoraio();
           this.ActivarBotonesHorario();
           //#endregion
          }
        } else {
          const leng1 = this.ListaFechasBack.filter(x => x.date.getTime() === this.selectedMonthViewDay.date.getTime()).length;
            if (leng1 > 0) {
              this.MostrarDatosFechaBack(this.selectedMonthViewDay.date);
              this.fbPerso[2].dis = true;
              // this.onToggleFab(1, 1);
            } else {
              this.expandedHorario = false;
              this.expandedRutas = false;
              this.delay(250).then((any) => {
                this.disableHorario = true;
                this.disableRutas = true;
                });
            }
            this.DesactivarBotonesHorario();

          this._snackBar.open('Día fuera de rango.', 'Cerrar', {
            horizontalPosition: 'right',
            verticalPosition: 'top',
            duration: 3500,
          });
        }
      } else {
        // Visualización true
        this.selectedMonthViewDay = day;
        const leng = this.ListaFechasBack.filter(x => x.date.getTime() === this.selectedMonthViewDay.date.getTime()).length;
        if (leng > 0) {
          const ent = this.ListaFechasBack.filter(x => x.date.getTime() === this.selectedMonthViewDay.date.getTime())[0];
          if ( ent.nIdDia === 2389) {
            this.DiaSeleccionado = moment( ent.date).format('DD/MM/YYYY');
            this.BloquearTiendasHorario();
            return;
          }
          this.DesactivarBotonesHorario();
          this.MostrarDatosFechaBack(this.selectedMonthViewDay.date);
        } else {
          this.LimpiarTiendasHorario();
          this.BloquearTiendasHorario();
          this._snackBar.open('Solo visualización.', 'Cerrar', {
            horizontalPosition: 'right',
            verticalPosition: 'top',
            duration: 3500,
          });
        }
      }
    } else {
    this._snackBar.open('No seleccionó un trabajador.', 'Cerrar', {
      horizontalPosition: 'right',
      verticalPosition: 'top',
      duration: 3500,
    });
  }
}

async MostrarDatosFechaBack(date: any) {

  // this.onToggleFab(1, 1);
  // this.mTiendas = 1;
  this.DiaSeleccionado = moment( new Date(date)).format('DD/MM/YYYY');
  this.DiaSeleccionadoDate = new Date(date);
  // this.disableNgSelect = true;
  this.disableHorario = false;
  this.disableRutas = false;
  this.TiendasSeleccionadas = [];
  let nIdsTienda = '';
  const lista = this.ListaFechasBack.filter(x => x.date.getTime() === date.getTime());
  await this.GetRutas(lista[0].nIdAsistencia);
  this.listaRutas.forEach( xs => {
    nIdsTienda = nIdsTienda + xs.nIdTienda + ',';
  });
  nIdsTienda = nIdsTienda.slice(0, -1);
  if (nIdsTienda !== '') {
    const divisiones = nIdsTienda.split(',');
    divisiones.forEach(x => {
    const datos = this.getTienda2.filter( xx => xx.nIdTienda === Number(x));
    this.TiendasSeleccionadas.push(datos[0]);
    });
  }
  this.fgHoras.controls['sHoraIngreso'].setValue(lista[0].horaInicio);
  this.fgHoras.controls['sMinutosIngreso'].setValue(lista[0].minInicio);
  this.fgHoras.controls['sHoraFin'].setValue(lista[0].horaFin);
  this.fgHoras.controls['sMinutosFin'].setValue(lista[0].minFin);
}

    get getFilter() { return this.fgFilter.controls; }
    get getUbigeo() { return this.fgUbigeo.controls; }
    get getHoras() { return this.fgHoras.controls; }
    get getToogle() { return this.fcToogle.value; }
}

interface Fechas {
  nIdAsistencia: number;
  date: Date;
  nIdsTienda: string;
  horaInicio: string;
  minInicio: string;
  horaFin: string;
  minFin: string;
  dia: string;
  nIdDia: number;
}
interface Tienda {
  nIdTienda: number;
  sDireccion: string;
  sIdUbigeo: string;
  disabled: boolean;
}

interface Asistencia {
  nIdAsistencia: number;
  nIdDPP: number;
  dFecha: string;
  tIni: string;
  tFin: string;
  nIdDia: number;
}

interface Ruta {
  nIdRuta: number;
  nIdAsistencia: number;
  nIdTienda: number;
  nOrden: number;
}
