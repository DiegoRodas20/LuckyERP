import { Component, OnInit, Type, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import * as moment from 'moment';
import { Moment } from 'moment';
import { GestionceGenerarComponent } from './Modals/gestionce-generar/gestionce-generar.component';
import { adminpAnimations } from '../../Animations/adminp.animations';
import { MatDatepicker } from '@angular/material/datepicker';
import { nsGestionce } from '../../Model/Igestionce';
import { GestionceService } from '../../Services/gestionce.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { GestionceParamComponent } from './Modals/gestionce-param/gestionce-param.component';

// Modals
const MODALS: { [name: string]: Type<any> } = {
  generarce: GestionceGenerarComponent,
  param: GestionceParamComponent
};

@Component({
  selector: 'app-gestionce',
  templateUrl: './gestionce.component.html',
  styleUrls: ['./gestionce.component.css', './gestionce.component.scss'],
  providers: [ GestionceService ],
  animations: [adminpAnimations]
})
export class GestionceComponent implements OnInit {

  //#region Variables

  // Array
  aCentroCosto = new Array();
  cboConcepto = new Array();
  cboSucursal = new Array();
  cboCargo = new Array();
  cboPuesto = new Array();
  cboPerfil = new Array();
  cboCanal = new Array();
  cboPlanilla = new Array();
  aPersonal = new Array();
  aDevengue = new Array();

  // Objeto
  objParameter = new Object();

  // FormGroup
  fgMain: FormGroup;

  // Fab
  fbMain = [
    { icon: 'calendar_today', tool: 'Procesar Devengue', dis: false },
    { icon: 'filter_alt', tool: 'Filtro', dis: true },
    { icon: 'tune', tool: 'Parametros', dis: false }
  ];
  abMain = [];
  tsMain = 'inactive';

  // Progress Bar
  pbMain: boolean;

  // Mat Table
  MainDC: string[] = ['dFechDevengue', 'sCentroCosto', 'sConcepto', 'nUnidad', 'nImporte', 'more'];
  MainDS: MatTableDataSource<nsGestionce.IMain> = new MatTableDataSource([]);
  @ViewChild('pagMain', {static: true}) pagMain: MatPaginator;
  expandedMore = null;

  ExpandedDC: string[] = ['action', 'sSucursal', 'sCargo', 'sPuesto', 'sPerfil', 'sCanal', 'nUnidad', 'nImporte'];
  ExpandedDS: MatTableDataSource<nsGestionce.IExpanded> = new MatTableDataSource([]);
  @ViewChild('mtExpanded', { static: false }) mtExpanded: MatTable<any>;

  HistoryDS: MatTableDataSource<nsGestionce.IHistory> = new MatTableDataSource([]);

  // Modal Config
  ngbModalOptions: NgbModalOptions = {
    size: 'lg',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };

  //#endregion

  constructor(
    public service: GestionceService,
    private spinner: NgxSpinnerService,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder,
    private _modalService: NgbModal
  ) {
    this.new_fgMain();
  }

  async ngOnInit(): Promise<void>  {
    this.spinner.show('spi_main');

    await this.fnGetAccrue();
    await this.fnGetAccrualPending();
    await this.fnGetHistory();

    this.fnGetLoad();

    this.spinner.hide('spi_main');
  }

  //#region FormGroup

  new_fgMain() {
    this.fgMain = this.fb.group({
      default: '',
      dInicio: [{ value: null, disabled: true }],
      dTermino: [{ value: null, disabled: true }],
      nIdCentroCosto: [{ value: null, disabled: false }],
      nIdConcepto: [{ value: null, disabled: false }],
      nIdSucursal: [{ value: null, disabled: false }],
      nIdCargo: [{ value: null, disabled: false }],
      nIdPuesto: [{ value: null, disabled: false }],
      nIdPerfil: [{ value: null, disabled: false }],
      nIdCanal: [{ value: null, disabled: false }],
      nIdPlla: [{ value: null, disabled: false }],
      nIdPersonal: [{ value: null, disabled: false }]
    });

    this.fgMain.valueChanges.subscribe(value => {
      const filter = { ...value, name: value.default.trim().toLowerCase() } as string;
      this.HistoryDS.filter = filter;

      this.loadMain();

      if (this.MainDS.paginator) {
        this.MainDS.paginator.firstPage();
      }

      this.expandedMore = null;
    });

  }

  get getMain() { return this.fgMain.controls; }

  //#endregion

  //#region General

  onToggleFab(stat: number) {
    stat = ( stat === -1 ) ? ( this.abMain.length > 0 ) ? 0 : 1 : stat;
    this.tsMain = ( stat === 0 ) ? 'inactive' : 'active';
    this.abMain = ( stat === 0 ) ? [] : this.fbMain;
  }

  async clickFab(index: number) {

    switch (index) {
      case 0:
        Swal.fire({
          title: 'Seleccionar Devengue',
          icon: 'info',
          text: 'Se muestran los devengues no procesados.',
          input: 'select',
          inputOptions: this.SwalDevengue(),
          inputPlaceholder: 'Seleccionar',
          showCancelButton: true,
          confirmButtonText: 'Seleccionar',
          allowOutsideClick: false,
          inputValidator: (value) => {
            if (value === undefined || value === '') {
              return 'Selección no válida.';
            }
          },
        }).then((resultado) => {
          if (resultado.isConfirmed) {

            const sResult = resultado.value as string;

            this.objParameter['nIdDevengue'] = Number(sResult.split('|')[0]);
            this.objParameter['nIdEstado'] = Number(sResult.split('|')[1]);
            this.objParameter['dFechaDevengue'] = moment(sResult.split('|')[2], 'DD/MM/YYYY').toDate();

            this.ngbModalOptions.size = 'xl';
            this.openModal('generarce');
          }
        });
        break;

      case 1:
        this.openModal('filtro');
        break;
      case 2:
        this.openModal('param');
        break;
    }
  }

  openModal(name: string) {

    this.onToggleFab(-1);

    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);
    const obj = new Object();

    obj['objParameter'] = this.objParameter;

    switch (name) {
      case 'generarce':
        modalRef.componentInstance.fromParent = obj;
        break;
      case 'filtro':
        modalRef.componentInstance.fromParent = obj;
        break;
    }

    modalRef.result.then(async (result) => {

      switch (result.modal) {
        case 'generarce':
          if (result.value === 'loadAgain') {

            this.spinner.show('spi_main');

            const nIdDevengue = result.nIdDevengue;
            const indexDevengue = this.aDevengue.findIndex(iDevengue => iDevengue.nIdDevengue === nIdDevengue);

            this.aDevengue.splice(indexDevengue, 1);
            this.fbMain[0].dis = ( this.aDevengue.length > 0 ) ? false : true ;

            await this.fnGetHistory();
            this.fnGetLoad();

            this.spinner.hide('spi_main');

          }
          break;

        case 'filtro':
          break;
      }

    }, (reason) => { });

    this.ngbModalOptions.size = 'lg';
  }

  fnGetLoad() {
    this.loadMain();
    this.loadCentroCosto();
    this.loadConcepto();
    this.loadSucursal();
    this.loadCargo();
    this.loadPuesto();
    this.loadPerfil();
    this.loadCanal();
    this.loadPlla();
    this.loadPersonal();
  }

  //#endregion

  //#region History

  async fnGetHistory() {
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
    await this.service.GetHistory(nIdEmp).then((response: any) => {
      if (response.status === 200) {
        const aHistory = response.body.response.data as nsGestionce.IHistory[];
        this.HistoryDS = new MatTableDataSource(aHistory);

        this.HistoryDS.filterPredicate = function(data, filter: string): boolean {
          return data.sNombres.trim().toLowerCase().includes(filter);
        };

        this.HistoryDS.filterPredicate = ((data: nsGestionce.IHistory, filter: any ) => {
          const a = !filter.nIdCentroCosto || data.nIdCentroCosto === filter.nIdCentroCosto;
          const b = !filter.nIdConcepto || data.nIdConcepto === filter.nIdConcepto;
          const c = !filter.nIdSucursal || data.nIdSucursal === filter.nIdSucursal;
          const d = !filter.nIdCargo || data.nIdCargo === filter.nIdCargo;
          const e = !filter.nIdPuesto || data.nIdPuesto === filter.nIdPuesto;
          const f = !filter.nIdPerfil || data.nIdPerfil === filter.nIdPerfil;
          const g = !filter.nIdCanal || data.nIdCanal === filter.nIdCanal;
          const h = !filter.nIdPlla || data.nIdPlla === filter.nIdPlla;
          const i = !filter.nIdPersonal || data.nIdPersonal === filter.nIdPersonal;
          return a && b && c && d && e && f && g && h && i;
        }) as (PeriodicElement, string) => boolean;

      }
    });
  }

  //#endregion

  //#region Main

  loadMain() {

    const aHistory = this.HistoryDS.filteredData;
    const aMain: nsGestionce.IMain[] = [];

    aHistory.forEach(iHistory => {
      const dFechDevengue = iHistory.dFechDevengue;
      const nIdCentroCosto = iHistory.nIdCentroCosto;
      const nIdConcepto = iHistory.nIdConcepto;

      const indexMain = aMain.findIndex(iMain => {
        const a = moment(iMain.dFechDevengue).format('YYYYMM') === moment(dFechDevengue).format('YYYYMM');
        const b = iMain.nIdCentroCosto === nIdCentroCosto;
        const c = iMain.nIdConcepto === nIdConcepto;
        return a && b && c;
      });

      if (indexMain === -1) {

        aMain.push({
          dFechDevengue: dFechDevengue,
          nIdCentroCosto: nIdCentroCosto,
          sCentroCosto: iHistory.sCentroCosto,
          nIdConcepto: nIdConcepto,
          sConcepto: iHistory.sConcepto,
          nUnidad: iHistory.nUnidad,
          nImporte: iHistory.nImporte
        });

      } else {
        aMain[indexMain].nUnidad = aMain[indexMain].nUnidad + iHistory.nUnidad;
        aMain[indexMain].nImporte = aMain[indexMain].nImporte + iHistory.nImporte;
      }

    });

    this.MainDS = new MatTableDataSource(aMain);
    this.MainDS.paginator = this.pagMain;

  }

  clickExpanded(row: nsGestionce.IMain) {

    if ( this.expandedMore === row ) {
      this.expandedMore = null;
      this.ExpandedDS = new MatTableDataSource([]);
    } else {

      const aHistory = this.HistoryDS.filteredData;
      const aExpanded: nsGestionce.IExpanded[] = [];

      const dFechDevengue = row.dFechDevengue;
      const nIdCentroCosto = row.nIdCentroCosto;
      const nIdConcepto = row.nIdConcepto;

      aHistory.filter(iHistory => {
        const a = moment(iHistory.dFechDevengue).format('YYYYMM') === moment(dFechDevengue).format('YYYYMM');
        const b = iHistory.nIdCentroCosto === nIdCentroCosto;
        const c = iHistory.nIdConcepto === nIdConcepto;
        return a && b && c;
      }).forEach(iHistory => {

        const nIdSucursal = iHistory.nIdSucursal;
        const nIdCargo = iHistory.nIdCargo;
        const nIdPuesto = iHistory.nIdPuesto;
        const nIdPerfil = iHistory.nIdPerfil;
        const nIdCanal = iHistory.nIdCanal;

        const indexExpanded = aExpanded.findIndex(iExpanded => {
          const a = !nIdSucursal || iExpanded.nIdSucursal === nIdSucursal;
          const b = !nIdCargo || iExpanded.nIdCargo === nIdCargo;
          const c = !nIdPuesto || iExpanded.nIdPuesto === nIdPuesto;
          const d = !nIdPerfil || iExpanded.nIdPerfil === nIdPerfil;
          const e = !nIdCanal || iExpanded.nIdCanal === nIdCanal;
          return a && b && c && d && e;
        });

        if (indexExpanded === -1) {

          aExpanded.push({
            nIdSucursal: nIdSucursal,
            sSucursal: iHistory.sSucursal,
            nIdCargo: nIdCargo,
            sCargo: iHistory.sCargo,
            nIdPuesto: nIdPuesto,
            sPuesto: iHistory.sPuesto,
            nIdPerfil: nIdPerfil,
            sPerfil: iHistory.sPerfil,
            nIdCanal: nIdCanal,
            sCanal: iHistory.sCanal,
            nUnidad: iHistory.nUnidad,
            nImporte: iHistory.nImporte
          });

        } else {
          aExpanded[indexExpanded].nUnidad = aExpanded[indexExpanded].nUnidad + iHistory.nUnidad;
          aExpanded[indexExpanded].nImporte = aExpanded[indexExpanded].nImporte + iHistory.nImporte;
        }

      });

      this.ExpandedDS = new MatTableDataSource(aExpanded);

      this.expandedMore = row;
      this.mtExpanded.renderRows();
    }

  }

  getTotal() {
    let nTotal = 0;
    const aHistory = this.HistoryDS.filteredData;
    aHistory.forEach(iHistory => nTotal = nTotal + iHistory.nImporte);
    return nTotal;
  }

  //#endregion

  //#region Devengue

  async fnGetAccrue() {
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    await this.service.GetAccrue(nIdEmp).then((response: any) => {
      if (response.status === 200) {

        const aDevengue = response.body.response.data as any[];

        if ( aDevengue.length > 0 ) {

          // Recupero último devengeue
          const sEjercicio = (aDevengue[0].nEjercicio as number).toString();
          let sMes = (aDevengue[0].nMes as number).toString();
          sMes = (sMes.length === 1) ? '0' + sMes : sMes;

          const sFechDevengeue = '01/' + sMes + '/' + sEjercicio;
          const dFechDevengue = moment(sFechDevengeue, 'DD/MM/YYYY').toDate();

          // Fecha inicio y termino
          const dInicio = moment(dFechDevengue).add(-1 , 'months').toDate();
          const dTermino = moment(dFechDevengue).endOf('month').toDate();

          this.fgMain.controls['dInicio'].setValue(dInicio, { emitEvent: false });
          this.fgMain.controls['dTermino'].setValue(dTermino, { emitEvent: false });

        } else {

          this.fbMain[0].dis = true;

          this._snackBar.open('La empresa no presenta devengue.', 'Cerrar', {
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        }

      }
    });
  }

  async fnGetAccrualPending() {
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    await this.service.GetAccrualPending(nIdEmp).then((response: any) => {
      if (response.status === 200) {

        const aDevengue = response.body.response.data as any[];
        this.aDevengue = aDevengue;

        this.fbMain[0].dis = ( aDevengue.length > 0 ) ? false : true ;

      }
    });
  }

  //#endregion

  //#region Swal

  public SwalDevengue(): Map<number, any> {
    const map = new Map<number, any>();

    let lEjercicio: number[] = this.aDevengue.map((v) => v.nEjercicio);
    lEjercicio = lEjercicio.sort((a, b) => b - a);

    moment.locale('es');
    lEjercicio.forEach(nEjercicio => {
      const item = new Map();
      const sEjercicio = nEjercicio.toString();

      this.aDevengue.filter( x => x.nEjercicio === nEjercicio).forEach( x => {
        let sMes = (x.nMes as number).toString();
        sMes = (sMes.length === 1) ? '0' + sMes : sMes;
        const sFecha = '01/' + sMes + '/' + sEjercicio;

        const dFecha = moment(sFecha, 'DD/MM/YYYY');
        const key = x.nIdDevengue + '|' + x.nIdEstado + '|' + dFecha.format('DD/MM/YYYY');

        const Mes = dFecha.format('MMMM');
        item.set(key, Mes[0].toUpperCase() + Mes.substr(1).toLowerCase());
      });
      map.set(nEjercicio, item);
    });

    return map;
  }

  //#endregion

  //#region Array

  loadCentroCosto() {
    const aCentroCosto = [];
    const aHistory = this.HistoryDS.data;
    aHistory.forEach(iHistory => {
      const nIdCentroCosto = iHistory.nIdCentroCosto;
      const index = aCentroCosto.findIndex(item => item?.nIdCentroCosto === nIdCentroCosto);
      if (index === -1) {
        aCentroCosto.push({
          nIdCentroCosto: nIdCentroCosto,
          sCentroCosto: iHistory.sCentroCosto,
          sTipoCC: iHistory.sTipoCC
        });
      }
    });
    this.aCentroCosto = aCentroCosto;
  }

  loadConcepto() {
    const aConcepto = [];
    const aHistory = this.HistoryDS.data;
    aHistory.forEach(iHistory => {
      const nIdConcepto = iHistory.nIdConcepto;
      const index = aConcepto.findIndex(item => item?.nIdConcepto === nIdConcepto);
      if (index === -1) {
        aConcepto.push({
          nIdConcepto: nIdConcepto,
          sConcepto: iHistory.sConcepto
        });
      }
    });
    this.cboConcepto = aConcepto;
  }

  loadSucursal() {
    const aSucursal = [];
    const aHistory = this.HistoryDS.data;
    aHistory.forEach(iHistory => {
      const nIdSucursal = iHistory.nIdSucursal;
      const index = aSucursal.findIndex(item => item?.nIdSucursal === nIdSucursal);
      if (index === -1) {
        aSucursal.push({
          nIdSucursal: nIdSucursal,
          sSucursal: iHistory.sSucursal
        });
      }
    });
    this.cboSucursal = aSucursal;
  }

  loadCargo() {
    const aCargo = [];
    const aHistory = this.HistoryDS.data;
    aHistory.forEach(iHistory => {
      const nIdCargo = iHistory.nIdCargo;
      const index = aCargo.findIndex(item => item?.nIdCargo === nIdCargo);
      if (index === -1) {
        aCargo.push({
          nIdCargo: nIdCargo,
          sCargo: iHistory.sCargo
        });
      }
    });
    this.cboCargo = aCargo;
  }

  loadPuesto() {
    const aPuesto = [];
    const aHistory = this.HistoryDS.data;
    aHistory.forEach(iHistory => {
      const nIdPuesto = iHistory.nIdPuesto;
      const index = aPuesto.findIndex(item => item?.nIdPuesto === nIdPuesto);
      if (index === -1) {
        aPuesto.push({
          nIdPuesto: nIdPuesto,
          sPuesto: iHistory.sPuesto
        });
      }
    });
    this.cboPuesto = aPuesto;
  }

  loadPerfil() {
    const aPerfil = [];
    const aHistory = this.HistoryDS.data;
    aHistory.forEach(iHistory => {
      const nIdPerfil = iHistory.nIdPerfil;
      const index = aPerfil.findIndex(item => item?.nIdPerfil === nIdPerfil);
      if (index === -1) {
        aPerfil.push({
          nIdPerfil: nIdPerfil,
          sPerfil: iHistory.sPerfil
        });
      }
    });
    this.cboPerfil = aPerfil;
  }

  loadCanal() {
    const aCanal = [];
    const aHistory = this.HistoryDS.data;
    aHistory.forEach(iHistory => {
      const nIdCanal = iHistory.nIdCanal;
      const index = aCanal.findIndex(item => item?.nIdCanal === nIdCanal);
      if (index === -1) {
        aCanal.push({
          nIdCanal: nIdCanal,
          sCanal: iHistory.sCanal
        });
      }
    });
    this.cboCanal = aCanal;
  }

  loadPlla() {
    const aPlla = [];
    const aHistory = this.HistoryDS.data;
    aHistory.forEach(iHistory => {
      const nIdPlla = iHistory.nIdPlla;
      const index = aPlla.findIndex(item => item?.nIdPlla === nIdPlla);
      if (index === -1) {
        aPlla.push({
          nIdPlla: nIdPlla,
          sPlanilla: iHistory.sPlanilla
        });
      }
    });
    this.cboPlanilla = aPlla;
  }

  loadPersonal() {
    const aPersonal = [];
    const aHistory = this.HistoryDS.data;
    aHistory.forEach(iHistory => {
      const nIdPersonal = iHistory.nIdPersonal;
      const index = aPersonal.findIndex(item => item?.nIdPersonal === nIdPersonal);
      if (index === -1) {
        aPersonal.push({
          nIdPersonal: nIdPersonal,
          sNombres: iHistory.sNombres
        });
      }
    });
    this.aPersonal = aPersonal;
  }

  //#endregion

  //#region Extra

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

  onChange($event) {
    this.fgMain.updateValueAndValidity();
  }

  MomentDate(pushParam: any) {
    moment.locale('es');
    const tDate = moment(pushParam).format('MMMM [del] YYYY');
    return tDate[0].toUpperCase() + tDate.substr(1).toLowerCase();
  }

  //#endregion

}
