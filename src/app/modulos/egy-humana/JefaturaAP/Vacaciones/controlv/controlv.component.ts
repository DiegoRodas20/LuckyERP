import { Component, Inject, OnInit, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { CalendarDateFormatter, CalendarEvent, CalendarView, DAYS_OF_WEEK } from 'angular-calendar';
import { IList, IMain, IDetail, IVac, IExpanded } from '../../Model/Icontrolv';
import { Subject } from 'rxjs';
import { MatDatepicker } from '@angular/material/datepicker';
import { ControlvService } from '../../Services/controlv.service';
import {DomSanitizer} from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ControvScannerComponent } from './Modals/controv-scanner/controv-scanner.component';
import { ControvDetalleComponent } from './Modals/controv-detalle/controv-detalle.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { adminpAnimations } from '../../Animations/adminp.animations';
import { CustomDateFormatter } from '../../Config/configCalendar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { ErrorStateMatcher } from '@angular/material/core';
import { valHooks } from 'jquery';
import { ControvSearchComponent } from './Modals/controv-search/controv-search.component';

declare var jQuery: any;

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

declare var jQuery: any;

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

const MODALS: { [name: string]: Type<any> } = {
  scan: ControvScannerComponent,
  detail : ControvDetalleComponent,
  search : ControvSearchComponent
};


@Component({
  selector: 'app-controlv',
  templateUrl: './controlv.component.html',
  styleUrls: ['./controlv.component.css', './controlv.component.scss'], providers: [
    { provide: CalendarDateFormatter, useClass: CustomDateFormatter }],
  animations: [adminpAnimations]
})


export class ControlvComponent implements OnInit {
  // Variables
  expandedMore: IMain;


  DevengueBackup = new Array();
  nIdDevengue: number;
  dFechDevengue: Date = null;
  sHeaderDevengue = '';


  i = 0;
  // Service GET && POST
  url: string;
  // Fab
  // boton flotante de opciones de la pantalla principal
  fbMain = [
    {icon: 'find_in_page', tool: 'Seleccionar Archivo'} ,
    { icon: 'person_search', tool: 'Buscar personal' }
    // {icon: 'find_in_page', tool: 'Seleccionar Archivo DNT'}
  ];
  abMain = [];
  tsMain = 'inactive';
  //

  //Boton flotante de opciones de la vista detalle personal
  fbDetail = [
    {icon: 'qr_code_scanner', tool: 'Digitalizar Vacación'},
  ];
  abDetail = [];
  tsDetail = 'inactive';

  //
  abIncentivo = [];
  tsIncentivo = 'active';

  abScan = [];
  tsScan='inactive';
  fbScanNew = [
    {icon: 'scanner', tool: 'scannear', dis: false},
    {icon: 'fast_forward', tool: 'Next Document', dis: false},
    {icon: 'fast_rewind', tool: 'Back Document', dis: false}
    // {icon: 'cancel', tool: 'Cancelar', dis: false}
  ];

  fbNew_2 = [
    { icon: 'change_circle', tool: 'Reemplazar sustento' },
    { icon: 'save', tool: 'Guardar' },
    { icon: 'cancel', tool: 'Cancelar' }
  ];

  // Progress Bar
  pbMain: boolean;
  pbDetail: boolean;


  ngbModalOptions: NgbModalOptions = {
    size: 'xl',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };
  // TextScaner: any;

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


  // Mat Table
  MainDC: string[] = ['action', 'sNombres', 'Plla', 'sTipoDoc', 'sDocumento',
   'sFechaIngreso', 'sFechaCese' , 'sCiudad', 'nCantVac', 'more'];
  MainDS: MatTableDataSource<IMain>;

  DetailDC: string[] = ['action', 'sTipoSub', 'dFechIni', 'dFechFin'];
  DetailDS: Array<IExpanded>;

  ExpandedDC: string[] = [ 'sSupervisor', 'dFechIni', 'dFechFin', 'sDias', 'sEstado'];
  ExpandedDS: MatTableDataSource<IExpanded> = new MatTableDataSource([]);

  @ViewChild('mtExpanded', {static: false}) mtExpanded: MatTable<IExpanded>;


  @ViewChild('pagMain', {static: true}) pagMain: MatPaginator;

  // FormGroup
  fgMain: FormGroup;
  fgFilter: FormGroup;
  fgDetailScan: FormGroup;

  // Combobox
  cboPlanilla = new Array();
  cboCiudad = new Array();

  constructor(public service:ControlvService, @Inject('BASE_URL') baseUrl:string,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder, private _modalService: NgbModal, private _snackBar: MatSnackBar) {

    this.url = baseUrl;
    this.ObtenerDevengue();
    this.new_fgMain();
    // this.new_fgDetail();
    this.new_fgFilter();
  }

  get getMain() { return this.fgMain.controls; }

  async ngOnInit(): Promise<void>  {
     this.spinner.show('spi_main');
    // await this.fnGetScanner();
    await this.LoadMain();
    await this.cboGetPlanilla();
    await this.cboGetCiudad();
     this.spinner.hide('spi_main');
  }

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      //// Configurar boton flotante vista principal
      case 1:
        stat = ( stat === -1 ) ? ( this.abMain.length > 0 ) ? 0 : 1 : stat;
        this.tsMain = ( stat === 0 ) ? 'inactive' : 'active';
        this.abMain = ( stat === 0 ) ? [] : this.fbMain;
        break;

      case 2:
          stat = ( stat === -1 ) ? ( this.abScan.length > 0 ) ? 0 : 1 : stat;
          this.tsScan = ( stat === 0 ) ? 'inactive' : 'active';
          this.abScan = ( stat === 0 ) ? [] : this.fbScanNew;
          break;
    }
  }

  openModal(name: string, data: any) {

    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);
    const obj = new Object();

    switch (name) {
      case 'scan':
        break;
      case 'detail':
        const uid_modal = 0;
        obj['data'] = data;
        obj['tipo'] = 1;
        modalRef.componentInstance.fromParent = obj;
        break;
    }

    modalRef.result.then(async (result) => {

      switch (result.modal) {
        case 'scan':
          if (result.value === 'loadAgain') {

            // this.spinner.show('spi_lista');
            await this.LoadMain();
            // this.spinner.hide('spi_lista');

          }
          break;
      }

    }, (reason) => { });
  }
  async clickFab(opc: number, index: number) {

    switch (opc) {
      // Fab Main
      // Fab Incentivo ( New 2 )
      case 1:
        switch (index) {
          case 0:
            // this.ngbModalOptions.size = 'lg';
            this.openModal('scan', 0);
            break;
          case 1:
              this.openModal('search',0);
          break;
        }
        break;

    //#endregion
    }
  }

  async showModal(opc: number, pushParam?: any, index?: number) {
    const self = this;
    switch (opc) {
      case 2:
        this.pbMain = true;
        const nToggle = ( index === 1 ) ? 2 : 3;
        (function ($) {
          $('#ModalScan').modal('show');
          $('#ModalScan').on('shown.bs.modal', function () {

        this.pbMain = true;
            self.onToggleFab(2, 1);
          });
        })(jQuery);
        this.pbMain = false;
        break;

        case 3:
        this.pbMain = true;
        const nToggles = ( index === 1 ) ? 2 : 3;
        (function ($) {
          $('#ModalScanDNT').modal('show');
          $('#ModalScanDNT').on('shown.bs.modal', function () {

        this.pbMain = true;
            self.onToggleFab(2, 1);
          });
        })(jQuery);
        this.pbMain = false;
        break;
    }
  }


  new_fgFilter() {
    this.fgFilter = this.fb.group({
      nIdPerLab: 0,
      dFecha: null
    });
  }

  new_fgMain(){
    this.fgMain = this.fb.group({
      sSolicitante: '',
      sSupervisor: '',
      nIdEstado: '',
      sCodPlla: '',
      sCiudad: ''
      // sCodigoQR: '',


    });

    this.fgMain.valueChanges.subscribe(value => {
      const filter = { ...value, name: value.sSupervisor.trim().toLowerCase() } as string;
      this.MainDS.filter = filter;

      if (this.MainDS.paginator) {
        this.MainDS.paginator.firstPage();
      }

      this.expandedMore = null;

    });

  }

  async clickExpanded(row: IMain) {
    if (this.expandedMore === row) {
      // Limpiar
      this.expandedMore = null;
      this.ExpandedDS = new MatTableDataSource([]);

      if (this.ExpandedDS.paginator) {
        this.ExpandedDS.paginator.firstPage();
      }

    } else {
      const param = [];
      param.push('0¡TR.nIdPersonal!' + row.nIdPersonal);

      await this.service._loadSP( 4, param).then( (value: IExpanded[]) => {

        let aFilter = value;

        if ( this.fgMain.controls['sSupervisor'].value !== '' ) {
          let sFilter = this.fgMain.controls['sSupervisor'].value as string;
          sFilter = sFilter.trim().toLowerCase();
          aFilter = value.filter( x => {
            return  x.sSupervisor.trim().toLowerCase().includes(sFilter);
          });
        }

        if ( this.fgMain.controls['nIdEstado'].value !== '' ) {
          let sFilter = this.fgMain.controls['nIdEstado'].value as string;
          sFilter = sFilter.trim();
          aFilter = value.filter( x => {
            return  x.nIdEstado === Number(sFilter);
          });
        }
        this.DetailDS = aFilter;
        this.ExpandedDS = new MatTableDataSource(aFilter);
      this.ExpandedDS.paginator = null;
        // this.ExpandedDS.paginator = this.pagExpanded;
      });

      this.expandedMore = row;
      this.mtExpanded.renderRows();

    }
    this.loadVac();

  }

  MomentDate(pushParam: any) {
    moment.locale('es');
    const tDate = moment(pushParam).format('MMMM [del] YYYY');
    return tDate[0].toUpperCase() + tDate.substr(1).toLowerCase();
  }

async LoadMain() {
  const param =  [];
  param.push('');

  await this.service._loadSP(3, param).then( (value: any[]) => {
  this.MainDS = new MatTableDataSource(value);
  this.MainDS.paginator = this.pagMain;

  this.MainDS.filterPredicate = function(data, filter: string): boolean {
    return data.sSupervisor.trim().toLowerCase().includes(filter);
  };

  this.MainDS.filterPredicate = ((data: IMain, filter: any ) => {
    const a = !filter.sSolicitante || data.sSolicitante.toLowerCase().includes(filter.sSolicitante.toLowerCase());
    const b = !filter.sCodPlla || data.sCodPlla === filter.sCodPlla;
    const c = !filter.sCiudad || data.sCiudad.toLowerCase().includes(filter.sCiudad.toLowerCase());
    const d = this.cantPerso(data.nIdPersonal) > 0;

    // const e = !filter.nIdEstado || data.nIdEstado === filter.nIdEstado;

    // const e = !filter.sEstado || data.sEstado.toLowerCase().includes(filter.sEstado.toLowerCase());
    return a && b && c && d ;
  }) as (PeriodicElement, string) => boolean;

  });


  await this.service._loadSP( 6, param).then( (value: IExpanded[]) => {
    this.DetailDS = value as Array<IExpanded>;
  });
}

cantPerso(nIdPersonal: number) {
    const sSupervisor = this.fgMain.controls['sSupervisor'].value as string;
    const nIdEstado = this.fgMain.controls['nIdEstado'].value as string;
  const aFilter = this.DetailDS.filter( x => {
    const a = x.nIdPersonal === nIdPersonal;
    // tslint:disable-next-line: max-line-length
    const b = !sSupervisor || ( x.sSupervisor.toLowerCase().includes(sSupervisor.toLowerCase()));
    const c = !nIdEstado || ( x.nIdEstado === Number(nIdEstado));
    return a && b && c;
  });

  return aFilter.length;
}



  chosenYearHandler(normalizedYear: moment.Moment) {
    let ctrlValue = this.fgFilter.controls['dFecha'].value;
    ctrlValue = ( ctrlValue === null ) ? moment() : ctrlValue;
    ctrlValue.year(normalizedYear.year());
    this.fgFilter.controls['dFecha'].setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth: moment.Moment, datepicker: MatDatepicker<moment.Moment>) {
    let ctrlValue = this.fgFilter.controls['dFecha'].value;
    ctrlValue = ( ctrlValue === null ) ? moment() : ctrlValue;
    ctrlValue.month(moment(normalizedMonth).month());
    this.fgFilter.controls['dFecha'].setValue(ctrlValue);
    datepicker.close();
  }


  // Acceso rapido

  async ObtenerDevengue() {
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

        const sFechDevengeue = '01/' + sMes + '/' + sEjercicio;
        this.dFechDevengue = moment(sFechDevengeue, 'DD/MM/YYYY').toDate();

      } else {
        this._snackBar.open('Usuario no cuenta con relación de personal.', 'Cerrar', {
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      }
    });

    if (this.dFechDevengue !== null) {
      moment.locale('es');
      const tDate = moment(this.dFechDevengue).format('MMMM [del] YYYY');
      this.sHeaderDevengue = tDate[0].toUpperCase() + tDate.substr(1).toLowerCase();

      // await this.fnGetListaAFP();
    }

  }


  loadVac() {
    let calendar = new Date();

    // Eventos
    const events: CalendarEvent[] = [];
    this.eventMain = [];
    this.DetailDS.forEach( x => {

    let sColor: any;
    switch (x.nIdEstado) {
      // Aprobado && Recepcionado
      case 2150:
        sColor = colors.yellow;
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
    this.refreshView();

  }

  refreshView(): void {
    this.refresh.next();
  }

  async cboGetPlanilla() {
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    param.push('0¡nIdEmp!' + nIdEmp);
    param.push('0¡bEstado!1');

    await this.service._loadCombo( 5, param).then( (value: any[]) => {
      this.cboPlanilla = value;
    });
  }

  async cboGetCiudad() {
    const param = [];
    param.push('0¡nDadTipEle!694');
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡nIdPais!' + sIdPais);
    param.push('0¡bEstado!1');

    await this.service._loadCombo( 6, param).then( (value: any[]) => {
      this.cboCiudad = value;
    });
  }

}
