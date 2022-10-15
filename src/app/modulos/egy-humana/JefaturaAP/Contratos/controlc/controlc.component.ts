import { Component, OnInit, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ControlcService } from '../../Services/controlc.service';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { startWith, distinctUntilChanged, map } from 'rxjs/operators';
import { ControlcDetailComponent } from './Modals/controlc-detail/controlc-detail.component';
import { ControlcSearchComponent } from './Modals/controlc-search/controlc-search.component';
import { adminpAnimations } from '../../Animations/adminp.animations';

// Modals
const MODALS: { [name: string]: Type<any> } = {
  detail: ControlcDetailComponent,
  search: ControlcSearchComponent
};

@Component({
  selector: 'app-controlc',
  templateUrl: './controlc.component.html',
  styleUrls: ['./controlc.component.css', './controlc.component.scss'],
  providers: [ ControlcService ],
  animations: [ adminpAnimations ]
})
export class ControlcComponent implements OnInit {

  //#region Variables

  // Fab
  fbMain = [
    {icon: 'date_range', tool: 'Visor macro', dis: true},
    {icon: 'person_search', tool: 'Buscar personal', dis: false}
  ];
  abMain = [];
  tsMain = 'inactive';

  // Animaciones Tada
  tadaMain = 'inactive';

  // FormGroup
  fgMain: FormGroup;

  // Progress Bar
  pbMain: boolean;

  // Devenge
  dFechDevengue: Date = null;

  // Combobox
  cboPlanilla = new Array();
  cboCiudad = new Array();
  cboTipoCC = new Array();
  cboEstado = new Array();

  // Mat Table
  MainDC: string[] = [ 'action', 'sNombres', 'sCodPlla', 'sTipo', 'sDocumento', 'dFechIni', 'dFechFin', 'dIniCont', 'dFinCont', 'sEstado', 'sObservacion' ];
  MainDS: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild('pagMain', {static: true}) pagMain: MatPaginator;

  // AutoComplete
  af_Responsable = new Array();
  foResponsable: Observable<any[]>;
  saResponsable = false;

  af_Organizacion = new Array();
  foOrganizacion: Observable<any[]>;
  saOrganizacion = false;

  af_CentroCosto = new Array();
  foCentroCosto: Observable<any[]>;
  saCentroCosto = false;

   // Modal Config
   ngbModalOptions: NgbModalOptions = {
    size: 'xl',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };

  // Modal
  aItem: any;

  //#endregion

  constructor(public service: ControlcService, private fb: FormBuilder,
              private spi: NgxSpinnerService, private _snackBar: MatSnackBar,
              private _modalService: NgbModal) {

    this.new_fgMain();
  }

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_main');

    await this.cboGetPlanilla();
    await this.cboGetCiudad();
    await this.cboGetTipoCC();
    await this.cboGetEstado();

    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    param.push('0¡nIdEmp!' + nIdEmp);
    param.push('2¡nIdEstado!2');

    await this.service._loadSP( 1, param).then( async (value: any[]) => {
      if ( value.length > 0 ) {

        const sEjercicio = (value[0].nEjercicio as number).toString();
        let sMes = (value[0].nMes as number).toString();
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
      await this.loadMain();
    }

    this.spi.hide('spi_main');
    this.animate(1);

  }

  //#region General

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = ( stat === -1 ) ? ( this.abMain.length > 0 ) ? 0 : 1 : stat;
        this.tsMain = ( stat === 0 ) ? 'inactive' : 'active';
        this.abMain = ( stat === 0 ) ? [] : this.fbMain;
        break;
    }
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        break;

      case 1:
        this.openModal('search');
        break;
    }
  }

  openModal(name: string) {

    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);
    const obj = new Object();

    switch (name) {
      case 'detail':
        obj['aItem'] = this.aItem;
        obj['dFechDevengue'] = this.dFechDevengue;
        modalRef.componentInstance.fromParent = obj;
        break;

      case 'search':
        obj['dFechDevengue'] = this.dFechDevengue;
        modalRef.componentInstance.fromParent = obj;
        break;
    }

  }

  //#endregion

  //#region FormGroup

  new_fgMain() {
    this.fgMain = this.fb.group({
      sNombres: '',
      sCodPlla: '',
      sCiudad: '',
      sResponsable: '',
      nIdResponsable : 0,
      nTipoCC: 0,
      sOrganizacion: [{ value: '', disabled: true }],
      nIdOrganizacion: 0,
      sCentroCosto: [{ value: '', disabled: true }],
      nIdCentroCosto: 0,
      nEstado: 0
    });

    this.foResponsable = this.fgMain.controls['sResponsable'].valueChanges
      .pipe(
        startWith(''),
        distinctUntilChanged(),
        map(value => this._filter(value, 1))
      );

    this.foOrganizacion = this.fgMain.controls['sOrganizacion'].valueChanges
      .pipe(
        startWith(''),
        distinctUntilChanged(),
        map(value => this._filter(value, 2))
      );

    this.foCentroCosto = this.fgMain.controls['sCentroCosto'].valueChanges
      .pipe(
        startWith(''),
        distinctUntilChanged(),
        map(value => this._filter(value, 3))
      );

    this.fgMain.valueChanges.subscribe(value => {
      const filter = {...value, name: value.sNombres.trim().toLowerCase()} as string;
      this.MainDS.filter = filter;

      if (this.MainDS.paginator) {
        this.MainDS.paginator.firstPage();
      }
    });
  }

  get getMain() { return this.fgMain.controls; }

  //#endregion

  //#region Combobox

  async cboGetPlanilla () {
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    param.push('0¡nIdEmp!' + nIdEmp);
    param.push('0¡bEstado!1');

    await this.service._loadSP( 5, param).then( (value: any[]) => {
      this.cboPlanilla = value;
    });
  }

  async cboGetCiudad () {
    const param = [];
    param.push('0¡nDadTipEle!694');
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡nIdPais!' + sIdPais);
    param.push('0¡bEstado!1');

    await this.service._loadSP( 6, param).then( (value: any[]) => {
      this.cboCiudad = value;
    });
  }

  async cboGetTipoCC () {
    const param = [];
    param.push('0¡nElecodDad!2032');
    param.push('0¡bStatus!1');
    param.push('2¡cEleCod!3');

    await this.service._loadSP( 7, param).then( (value: any[]) => {
      this.cboTipoCC = value;
    });
  }

  ChangeTipoCC(pushParam: any) {

    this.fgMain.controls['nIdOrganizacion'].setValue(0);
    this.fgMain.controls['sOrganizacion'].setValue('');
    this.fgMain.controls['sOrganizacion'].disable();

    this.fgMain.controls['nIdCentroCosto'].setValue(0);
    this.fgMain.controls['sCentroCosto'].setValue('');
    this.fgMain.controls['sCentroCosto'].disable();

    if (pushParam !== undefined) {
      this.fgMain.controls['sOrganizacion'].enable();
    }

  }

  async cboGetEstado () {
    const param = [];
    param.push('0¡nEleCodDad!2286');

    await this.service._loadSP( 7, param).then( (value: any[]) => {
      this.cboEstado = value;
    });
  }

  getDescEstado(nEleCod: number) {
    let sDesc = '';
    const iArray = this.cboEstado.findIndex( x => x.nEleCod === nEleCod );
    if (iArray > -1) {
      sDesc = this.cboEstado[iArray].cEleNam;
    }
    return sDesc;
  }

  //#endregion

  //#region Load

  async loadMain() {
    let param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    const spFechDevengue = moment(this.dFechDevengue).format('MM/DD/YYYY');
    param.push( '6¡spFechDevengue!' + spFechDevengue + '-0¡A.nIdEmp!' + nIdEmp);

    const aIdCentroCosto = [];
    let sIdCentroCosto = '';

    const aIdResp = [];
    let sIdResp = '';

    await this.service._loadSP( 2, param).then( async (value: any[]) => {

      const aMainDS = [];

      value.forEach( x => {

        // ALmacenamos la lista principal
        aMainDS.push({
          nIdPersonal: x.nIdPersonal,
          nIdPerLab: x.nIdPerLab,
          sNombres: x.sNombres,
          nIdPlla: x.nIdPlla,
          sCodPlla: x.sCodPlla,
          nIdTipoDoc: x.nIdTipoDoc,
          sTipo: x.sTipo,
          sDscTipo: x.sDscTipo,
          sDocumento: x.sDocumento,
          dFechIni: x.dFechIni,
          dFechFin: x.dFechFin,
          sCiudad: x.sCiudad,
          dIniCont: x.dIniCont,
          dFinCont: x.dFinCont,
          nIdResp: x.nIdResp,
          nIdCentroCosto: x.nIdCentroCosto,
          nEstado: 0,
          nIdPLD: x.nIdPLD,
          sObservacion: x.sObservacion
        });

        // Almacenamos Id's CentroCosto
        const nIdCentroCosto = x.nIdCentroCosto;
        const iArrayC = aIdCentroCosto.findIndex( y => y === nIdCentroCosto );
        if (iArrayC === -1) { aIdCentroCosto.push(nIdCentroCosto); }

        // Almacenamos Id's Resp
        const nIdResp = x.nIdResp;
        const iArrayR = aIdResp.findIndex( y => y === nIdResp);
        if (iArrayR === -1) { aIdResp.push(nIdResp); }

      });

      // Evaluamos el contrato del personal
      aMainDS.forEach( x => {
        if (x.dIniCont === null) {

          // Sin contrato
          x.nEstado = 2288;

        } else {

          const dIniCont = x.dIniCont as Date;
          const dFinCont = x.dFinCont as Date;

          const nFinCont = Number(moment(dFinCont).format('YYYYMMDD'));

          const dIniMonth = moment().startOf('month').toDate();
          const dFinMonth = moment().endOf('month').add(-1, 'days').toDate();

          const dIniNextMonth = moment(dFinMonth).add(1, 'day').toDate();
          const dFinNextMonth = moment(dIniNextMonth).add(1, 'month').add(-1, 'day').toDate();

          const nIniNextMonth = Number(moment(dIniNextMonth).format('YYYYMMDD'));
          const nFinNextMonth = Number(moment(dFinNextMonth).format('YYYYMMDD'));

          if ( nFinCont >= nIniNextMonth && nFinCont <= nFinNextMonth ) {
            // Por vencer
            x.nEstado = 2289;
          }

          if ( Number(moment().format('YYYYMMDD')) > nFinCont ) {
            // Vencido
            x.nEstado = 2290;
          }

          if (x.nEstado === 0) {
            // Vigente
            x.nEstado = 2287;
          }

        }
      });

      this.MainDS = new MatTableDataSource(aMainDS);
      this.MainDS.paginator = this.pagMain;

      this.MainDS.filterPredicate = function(data, filter: string): boolean {
        return data.sNombres.trim().toLowerCase().includes(filter);
      };

      this.MainDS.filterPredicate = ((data: any, filter: any ) => {
        // tslint:disable-next-line: max-line-length
        const a = !filter.sNombres || ( data.sNombres.toLowerCase().includes(filter.sNombres.toLowerCase()) || data.sDocumento.toLowerCase().includes(filter.sNombres.toLowerCase()) );
        const b = !filter.sCodPlla || data.sCodPlla.toLowerCase().includes(filter.sCodPlla);
        const c = !filter.nEstado || data.nEstado === filter.nEstado;
        const d = !filter.sCiudad || data.sCiudad.toLowerCase().includes(filter.sCiudad.toLowerCase());
        const e = !filter.nIdResponsable || data.nIdResp === filter.nIdResponsable;
        const f = !filter.nIdCentroCosto || data.nIdCentroCosto === filter.nIdCentroCosto;
        return a && b && c && d && e && f;
      }) as (PeriodicElement, string) => boolean;

    });

    // CentroCosto
    aIdCentroCosto.forEach( x => {
      sIdCentroCosto = sIdCentroCosto + x + ',';
    });
    if ( aIdCentroCosto.length > 0 ) { sIdCentroCosto = sIdCentroCosto.substring(0, sIdCentroCosto.length - 1); }

    if (sIdCentroCosto !== '') {
      param = [];
      param.push('1¡nIdCentroCosto!' + sIdCentroCosto);

      const aOrganizacion = [];
      const aCentroCosto = [];

      await this.service._loadSP( 3, param).then( async (value: any[]) => {
        value.forEach( x => {

          aOrganizacion.push({
            nIdTipoCC: x.nIdTipoCC,
            nIdOrganizacion: x.nIdOrganizacion,
            sOrganizacion: x.sOrganizacion
          });

          aCentroCosto.push({
            nIdOrganizacion: x.nIdOrganizacion,
            nIdCentroCosto: x.nIdCentroCosto,
            sCentroCosto: x.sCentroCosto
          });

        });
      });

      // tslint:disable-next-line: max-line-length
      this.af_Organizacion = aOrganizacion.filter(((data, index, array) => array.map(x => x.nIdOrganizacion).indexOf(data.nIdOrganizacion) === index));
      // tslint:disable-next-line: max-line-length
      this.af_CentroCosto = aCentroCosto.filter(((data, index, array) => array.map(x => x.nIdCentroCosto).indexOf(data.nIdCentroCosto) === index));

    }

    // Responsable
    aIdResp.forEach( x => {
      sIdResp = sIdResp + x + ',';
    });
    if ( aIdResp.length > 0 ) { sIdResp = sIdResp.substring(0, sIdResp.length - 1); }

    if (sIdResp !== '') {
      param = [];
      param.push('1¡nIdPersonal!' + sIdResp);

      await this.service._loadSP( 4, param).then( async (value: any[]) => {
        this.af_Responsable = value;
      });
    }
  }

  viewDetail(element: any) {
    this.aItem = element;
    this.openModal('detail');
  }

  //#endregion

  //#region AutoComplete

  displayResponsable(obj?: any): string {
    return obj ? obj.sResp : '';
  }

  osResponsable(event: any) {
    const vEvent = event.option.value.nIdResp;
    this.fgMain.controls['nIdResponsable'].setValue(vEvent);
  }

  displayOrganizacion(obj?: any): string {
    return obj ? obj.sOrganizacion : '';
  }

  osOrganizacion(event: any) {
    const vEvent = event.option.value.nIdOrganizacion;
    this.fgMain.controls['sCentroCosto'].enable();
    this.fgMain.controls['nIdOrganizacion'].setValue(vEvent);
  }

  displayCentroCosto(obj?: any): string {
    return obj ? obj.sCentroCosto : '';
  }

  osCentroCosto(event: any) {
    const vEvent = event.option.value.nIdCentroCosto;
    this.fgMain.controls['nIdCentroCosto'].setValue(vEvent);
  }

  updatedVal(e: any, opc: number) {
    let boolean: boolean;

    if ( e instanceof Object ) {
      boolean = ( e && e.length > 0 ) ? true : false;
    } else {
      boolean = ( e && e.trim().length > 0 ) ? true : false;
    }

    switch (opc) {
      case 1:
        this.saResponsable = boolean;
        break;

      case 2:
        this.saOrganizacion = boolean;
        break;

      case 3:
        this.saCentroCosto = boolean;
        break;
    }
  }

  private _filter(value: any, opc: number): any[] {

    let aFilter = new Array();

    if ( value !== undefined && value !== null ) {

      let filterValue: any;
      if ( value instanceof Object ) {

        switch (opc) {
          case 1:
            filterValue = value.sResp.trim().toLowerCase();
            break;

          case 2:
            filterValue = value.sOrganizacion.trim().toLowerCase();
            break;

          case 3:
            filterValue = value.sCentroCosto.trim().toLowerCase();
            break;
        }

      } else {
        filterValue = value.trim().toLowerCase();
      }

      switch (opc) {
        case 1:
          this.fgMain.controls['nIdResponsable'].setValue(undefined);

          aFilter = this.af_Responsable.filter( x => {
            const a = x.sResp.trim().toLowerCase().includes(filterValue);
            return a;
          }).slice(0, 10);
          break;

        case 2:
          this.fgMain.controls['nIdOrganizacion'].setValue(undefined);
          this.fgMain.controls['nIdCentroCosto'].setValue(undefined);
          this.fgMain.controls['sCentroCosto'].disable();

          const nIdTipoCC = this.fgMain.controls['nTipoCC'].value;
          aFilter = this.af_Organizacion.filter( x => {
            const a = x.sOrganizacion.trim().toLowerCase().includes(filterValue);
            const b = x.nIdTipoCC === nIdTipoCC;
            return a && b;
          }).slice(0, 10);
          break;

        case 3:
          this.fgMain.controls['nIdCentroCosto'].setValue(undefined);

          const nIdOrganizacion = this.fgMain.controls['nIdOrganizacion'].value;
          aFilter = this.af_CentroCosto.filter( x => {
            const a = x.sCentroCosto.trim().toLowerCase().includes(filterValue);
            const b = x.nIdOrganizacion === nIdOrganizacion;
            return a && b;
          }).slice(0, 10);
          break;
      }

    }

    return aFilter;
  }

  //#endregion

  //#region Extra

  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms)).then();
  }

  animate(nTada: number) {
    switch (nTada) {
      case 1:
        this.tadaMain = 'active';
        break;
    }

    this.delay(2000).then(any => {
      switch (nTada) {
        case 1:
          this.tadaMain = 'inactive';
          break;
      }
    });
  }

  //#endregion

}
