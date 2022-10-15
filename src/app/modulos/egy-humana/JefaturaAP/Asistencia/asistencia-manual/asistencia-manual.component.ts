import { Component, Input, OnInit, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { CalendarDateFormatter, CalendarEvent, CalendarView, DAYS_OF_WEEK } from 'angular-calendar';
import moment from 'moment';
import { Moment } from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CustomDateFormatter } from '../../Config/configCalendar';
import { adminpAnimations } from '../../Animations/adminp.animations';
import { AsistenciaManualService } from './asistencia-manual.service';
import { AsistenciaPersonalComponent } from './Modals/asistencia-personal/asistencia-personal.component';


const MODALS: { [name: string]: Type<any> } = {
  asispersonal: AsistenciaPersonalComponent
};


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
  selector: 'app-asistencia-manual',
  templateUrl: './asistencia-manual.component.html',
  styleUrls: ['./asistencia-manual.component.css', './asistencia-manual.component.scss' ],
  providers: [    { provide: CalendarDateFormatter, useClass: CustomDateFormatter }],
  animations: [adminpAnimations]
})
export class AsistenciaManualComponent implements OnInit {

  selectedRowIndex = null;

  ngbModalOptions: NgbModalOptions = {
    size: 'xl',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };

  fgMain: FormGroup;

  tadaMain = 'inactive';

  expandedFechas: IExpandedFechas[];
  // expandedMore: IMain;
  expandedMore: IListaPersonal;
  MainDC: string[] = [ 'fechaDevengue', 'CentroCosto', 'direccion', 'nroPersonal', 'total', 'more'  ];
  MainDS: MatTableDataSource<IListaPersonal>;

  ExpandedDC: string[] = [ 'action', 'sNombres', 'sResponsable', 'planilla', 'tipoDoc', 'nroDoc', 'nroDias',  'monto'];
  ExpandedDS: MatTableDataSource<IExpanded>;
  @ViewChild('pagMain', {static: true}) pagMain: MatPaginator;

  @ViewChild('pagExpanded', {static: false}) pagExpanded: MatPaginator;
  @ViewChild('mtExpanded', {static: false}) mtExpanded: MatTable<IExpanded>;
  fbMain = [
    {icon: 'add', tool: 'Nueva Asistencia'} ,
  ];
  abMain = [];
  tsMain = 'inactive';

  nMes: string;
  nEjercicio: string;


   // Devengue
   DevengueBackup = new Array();
   nIdDevengue: number;
   dFechDevengue: Date = null;
   maxDay = 0;
   sHeaderDevengue = '';

  view: CalendarView = CalendarView.Month;
  locale = 'es';
  viewDate: Date = new Date();
  eventMain: CalendarEvent[] = [];
  refresh: Subject<any> = new Subject();
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.MONDAY, DAYS_OF_WEEK.SUNDAY];

  cboCentroCosto: any;
  cboOrganizacion: any;

// Autocomplete
  myControl = new FormControl();
  // options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<any[]>;

  // myControlDireccion = new FormControl();
  // // options: string[] = ['One', 'Two', 'Three'];
  // filteredOptionsDireccion: Observable<any[]>;

  constructor(public service:AsistenciaManualService, private spinner: NgxSpinnerService,private spi: NgxSpinnerService,
  private fb: FormBuilder, private _modalService: NgbModal, private _snackBar: MatSnackBar) {
    this.new_fgMain();
  }

  get getMain() { return this.fgMain.controls; }

  new_fgMain() {
    this.fgMain = this.fb.group({
      dFecha: null,
      sCentroCosto: '',
      sDireccion: ''
    });

    this.fgMain.valueChanges.subscribe(value => {
      const filter = { ...value, name: value.sCentroCosto.trim().toLowerCase() } as string;
      this.MainDS.filter = filter;

      if (this.MainDS.paginator) {
        this.MainDS.paginator.firstPage();
      }

      this.expandedMore = null;

    });
  }


  async clickFab(opc: number, index: number) {

    switch (opc) {
      // Fab Main
      // Fab Incentivo ( New 2 )
      case 1:
        switch (index) {
          case 0:
            this.openModal('asispersonal', 0,0);
            break;
        }
        break;
    //#endregion
    }
  }

  openModal(name: string, edit: any, row: any) {

    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);
    const obj = new Object();

    switch (name) {
      case 'asispersonal':
      obj['edit'] = edit;
      if ( edit === 1) {
        obj['nIdPersonal'] = row.nIdPersonal;
        obj['nIdResp'] = row.nIdResp;
        obj['nIdDPP'] = row.nIdDPP;
        obj['nDias'] = row.nDias;
        obj['nImporte'] = row.nImporte;
        obj['nIdPlanning'] = row.nIdPlanning;
      }

        modalRef.componentInstance.fromParent = obj;
        break;
      // case 'detail':
      //   const uid_modal = 0;
      //   obj['data'] = data;
      //   modalRef.componentInstance.fromParent = obj;
      //   break;
    }

    modalRef.result.then(async (result) => {

      switch (result.modal) {
        case 'asispersonal':
          if (result.value === 'loadAgain') {

            // this.spinner.show('spi_lista');
            await this.LoadAsistenciaManual();
            // this.spinner.hide('spi_lista');

          }
          break;
      }

    }, (reason) => { });
  }

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      //// Configurar boton flotante vista principal
      case 1:
        stat = ( stat === -1 ) ? ( this.abMain.length > 0 ) ? 0 : 1 : stat;
        this.tsMain = ( stat === 0 ) ? 'inactive' : 'active';
        this.abMain = ( stat === 0 ) ? [] : this.fbMain;
        break;
    }
  }

  async ngOnInit(): Promise<void>  {
    await this.LoadAsistenciaManual();
    await this.DevengueActual();
    await this.fnGetCentroCosto();
    await this.fnGetOrganizacion();
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );

    // this.filteredOptionsDireccion = this.myControlDireccion.valueChanges.pipe(
    //   startWith(''),
    //   map(value => this._filterDireccion(value))
    // );
    // await this.fnGetScanner();
  }

  private _filter(value: string): any[] {
    const filterValue = value.toLocaleLowerCase();
    return this.cboCentroCosto.filter(option => option.sDescCC.toLocaleLowerCase().indexOf(filterValue) === 0);
  }

  // private _filterDireccion(value: string): any[] {
  //   const filterValue = value.toLocaleLowerCase();
  //   return this.cboOrganizacion.filter(Direccion => Direccion.sOrganizacion.toLocaleLowerCase().indexOf(filterValue) === 0);
  // }

  MomentDate2(nMes: any , nAnio: any) {
    moment.locale('es');
    let sMes = (nMes as number).toString();
    sMes = (sMes.length === 1) ? '0' + nMes : nMes;
    const date = '01/' + nMes + '/' + nAnio;
    const tDate1 = moment(date, 'DD/MM/YYYY').toDate();
    const tDate = moment(tDate1).format('MMMM [del] YYYY');
    return tDate[0].toUpperCase() + tDate.substr(1).toLowerCase();
  }

  async LoadAsistenciaManual() {
    this.spi.show('spi_lista');
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
    param.push('0¡nIdEmp!' + nIdEmp);
    await this.service._loadSP( 3, param).then( (value: any) => {
      this.MainDS = new MatTableDataSource(value);
      this.MainDS.paginator = this.pagMain;

      this.MainDS.filterPredicate = function(data, filter: string): boolean {
      return data.sCentroCosto.trim().toLowerCase().includes(filter);
      };

      this.MainDS.filterPredicate = ((data: any, filter: any ) => {

        const mes: number = + moment(filter.dFecha).format('MM');
        const anio: number = +  moment(filter.dFecha).format('YYYY');
      const a = !filter.sDireccion || data.sDireccion.toLowerCase().includes(filter.sDireccion.toLowerCase());
      const b = !filter.sCentroCosto || data.sCentroCosto.toLowerCase().includes(filter.sCentroCosto.toLowerCase());
      const c = !filter.dFecha || data.nMes ===  mes && data.nEjercicio === anio ;
      return a && b && c;
      }) as (PeriodicElement, string) => boolean;


   });
   this.spi.hide('spi_lista');
  }


  async clickExpanded(row: IListaPersonal) {
  //   const calendar = new Date();
  //  const events: CalendarEvent[] = [];
  //  this.viewDate = calendar;
  //  this.eventMain = events;
  //   this.refreshView();
    if (this.expandedMore === row) {
      // Limpiar
      this.expandedMore = null;
      this.ExpandedDS.paginator = null;
      this.ExpandedDS = new MatTableDataSource([]);

      if (this.ExpandedDS.paginator) {
        this.ExpandedDS.paginator.firstPage();
      }

    } else {
      
       let calendar = new Date();
       const events: CalendarEvent[] = [];
       this.viewDate = calendar;
       this.eventMain = events;
       this.eventMain = [];
      this.refreshView();
      const param = [];
      param.push('0¡C.nIdCentroCosto!' + row.nIdCentroCosto);
      param.push('0¡C.bTipo!1');
      param.push('0¡MONTH(C.dFechIni)!' + row.nMes );
      param.push('0¡YEAR(C.dFechIni )!' + row.nEjercicio);

      await this.service._loadSP( 4, param).then( (value: IExpanded[]) => {

        // let aFilter = value;

        // if ( this.fgMain.controls['sSupervisor'].value !== '' ) {
        //   let sFilter = this.fgMain.controls['sSupervisor'].value as string;
        //   sFilter = sFilter.trim().toLowerCase();
        //   aFilter = value.filter( x => {
        //     return  x.sSupervisor.trim().toLowerCase().includes(sFilter);
        //   });
        // }

        // if ( this.fgMain.controls['nIdEstado'].value !== '' ) {
        //   let sFilter = this.fgMain.controls['nIdEstado'].value as string;
        //   sFilter = sFilter.trim();
        //   aFilter = value.filter( x => {
        //     return  x.nIdEstado === Number(sFilter);
        //   });
        // }
        // this.DetailDS = new MatTableDataSource(aFilter);
        this.ExpandedDS = new MatTableDataSource(value);
        this.ExpandedDS.paginator = null;
        this.ExpandedDS.paginator = this.pagExpanded;
      });

      this.expandedMore = row;
      // this.mtExpanded.renderRows();
    }
    // this.loadVac();

  }
  async loadFechas(element: IExpanded) {
    const param = [];
    param.push('0¡nIdDPP!' + element.nIdDPP);
      await this.service._loadSP( 5, param).then( (value: IExpandedFechas[]) => {
      this.expandedFechas = value;

   });

   let calendar = new Date();
   const events: CalendarEvent[] = [];
    this.eventMain = [];

    this.expandedFechas.forEach( x => {

      const dFechIni = moment(x.dFecha).toDate();
      this.eventMain = [];
      this.viewDate = dFechIni;
      const nIdAsistencia = x.nIdAsistencia;

      calendar = dFechIni;

        events.push({
          start: dFechIni,
          end: dFechIni,
          color: colors.green,
          title: 'Inicio : ' + moment(dFechIni).format('DD/MM/YYYY') ,
          allDay: true,
          draggable: false,
          meta: nIdAsistencia,
        });
      });

      this.viewDate = calendar;
      this.eventMain = events;
      this.refreshView();

  }

  async fnGetCentroCosto() {
    const param = [];
    param.push('0¡C.bTipo!1');

    await this.service._loadSP( 6, param).then( (value: any[]) => {
      this.cboCentroCosto = value;
    });
  }

  async fnGetOrganizacion() {
    const param = [];
    param.push('0¡C.bTipo!1');

    await this.service._loadSP( 7, param).then( (value: any[]) => {
      this.cboOrganizacion = value;
    });
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

      } else {
        this._snackBar.open('Usuario no cuenta con relación de personal.', 'Cerrar', {
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      }
    });
  }

  refreshView(): void {
    this.refresh.next();
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
    // ctrlValue.month(normalizedMonth.month());
    this.fgMain.controls['dFecha'].setValue(normalizedMonth);
    const a = moment(normalizedMonth).format('MM');
    const b =  moment(normalizedMonth).format('YYYY');
    const y: number = +a;
    const z: number = +b;
    // const lista = this.ListaTemporalDS.filter(x => x.nMes == y && x.nEjercicio == z);
    // this.MainDS = new MatTableDataSource(lista);
    datepicker.close();
  }

}

interface IListaPersonal{
  nIdCentroCosto: number;
  sCentroCosto: string;
  sDireccion: string;
  nNumPersonas: number;
  nTotal: number;
  nMes: number;
  nEjercicio: number;
}

interface IExpanded{
  nIdDPP: number;
  nIdCentroCosto: number;
  nIdPersonal: number;
  sNombres: string;
  nIdResp: number;
  sResponsable: string;
  sCodPlla: string;
  sTipoDocumento: string;
  sDocumento: string;
  nDias: number;
  nImporte: number;
}


interface IExpandedFechas{
  nIdAsistencia: number;
  nIdDPP: number;
  dFecha: Date;
  nImporte: number;
}

interface ICentroCosto{
  nIdCentroCosto: number;
  sDescCC: string;
}