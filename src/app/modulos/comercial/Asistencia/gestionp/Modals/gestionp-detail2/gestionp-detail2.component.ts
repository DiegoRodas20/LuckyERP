import { Component, EventEmitter,  Inject,  Input,  OnInit,  Type,  ViewChild } from '@angular/core';
import { adminpAnimations } from 'src/app/modulos/egy-humana/JefaturaAP/Animations/adminp.animations';
import { GestionpService } from '../../services/gestionp.service';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS } from '@angular/material/core';

import { nsGestionPlanning } from '../../../gestionap/Models/nsGestionPlanning';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  DAYS_OF_WEEK,
  CalendarEvent,
  CalendarMonthViewDay,
} from 'angular-calendar';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DeviceDetectorService } from 'ngx-device-detector';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatStepper } from '@angular/material/stepper';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { ValidadoresService } from 'src/app/modulos/comercial/requerimiento/informep/validadores.service';
import { Moment } from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';
import { GestionpRutaComponent } from '../gestionp-ruta/gestionp-ruta.component';

const MODALS: { [name: string]: Type<any> } = {
  GestionRuta: GestionpRutaComponent
};

const colors: any = {
  pink: {
    primary: '#ff4081b0',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ffd1',
    secondary: '#D1E8FF',
  },
};

declare var jQuery: any;
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-gestionp-detail2',
  templateUrl: './gestionp-detail2.component.html',
  styleUrls: [
    './gestionp-detail2.component.css',
    './gestionp-detail2.component.scss',
  ],
  animations: [adminpAnimations],
  providers: [GestionpService],
})
export class GestionpDetail2Component implements OnInit {
  //#region Variables

  @Input() fromParent;
  nIdPlanningStatic = 0;
  nIdCentroCosto = 0;
  maView_dp = -1;
  matcher = new MyErrorStateMatcher();
  centro: any = [];
  selectedMonthViewDay: CalendarMonthViewDay;
  selectedDays: any = [];
  mPlanning: number;
  editTable: any;
  selectResp: any;
  nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
  aPerfil: any[] = [];
  aCanal: any[] = [];
  datosCC: any[] = [];

  FooterSucursal = true;
  FooterPuesto = true;

  //#region  Mat Table
  PlanningRDC: string[] = ['sPersoImg', 'sNombres',  'action'];
  PlanningRDS: MatTableDataSource<any> = new MatTableDataSource([]);
  PlanningRDS2: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild('pagPlanning', {static: false}) pagPlanning: MatPaginator;
  @ViewChild('mtPlanning', {static: false}) mtPlanning: MatTable<any>;
  //#endregion


  ngbModalOptions: NgbModalOptions = {
    size: 'xl',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder',
  };

  panelOpenState = true;

  OpenState = false;
  fechasPanelInfo = '';

  panelOpenState2 = false;
  panelDisabledSeleccion = false;
  saPersonal = false;
  tgSeleccion = true;
  tadaDetail = 'inactive';
  toggleDetail = 0;
  tsDetail = 'active';
  abDetail = [];
  abEdit = [];
  abEdit2 = [];
  abPerso = [];
  tsPerso = 'inactive';
  tsEdit = 'active';
  tsEdit2 = 'active';

  fbEdit = [
    { icon: 'edit', tool: 'Editar', dis: false },
    { icon: 'directions_walk', tool: 'Asignar rutas', dis: false },
    { icon: 'delete', tool: 'Eliminar', dis: false },
  ];

  fbEdit2 = [
    { icon: 'save', tool: 'Guardar', dis: false },
    { icon: 'cancel', tool: 'Cancelar', dis: false },
  ];

  fbPerso = [
    {icon: 'person_add', tool: 'Añadir', dis: false},
    {icon: 'cleaning_services', tool: 'Limpiar', dis: false},
  ];
  // Formularios
  fgPlanning: FormGroup;
  fgPerso: FormGroup;
  fgSearch: FormGroup;
  foPersonal: Observable<any[]>;
  fgInfoPerso: FormGroup;
  fgFilter: FormGroup;
  // Array
  aPersonal: any[] = [];
  sResponsable: any;
  // Variables de uso Temporal

  private _filter(value: any, opc: number): any[] {

    let aFilter = new Array();

    if ( value !== undefined && value !== null ) {
      let filterValue: any;
      if ( value instanceof Object ) {
        filterValue = value.sNombres.trim().toLowerCase();
      } else {
        filterValue = value.trim().toLowerCase();
      }

      switch (opc) {
        case 2:
          aFilter = this.aPersonal.filter( x => {
            const a = x.sNombres.trim().toLowerCase().includes(filterValue);
            // const b = x.nStat === 0;
            return a ;
          }).slice(0, 3);
          break;
      }

    }
    return aFilter;
  }

  //#endregion

  constructor(
    // @Inject(MAT_DIALOG_DATA) private data: any,
    //  public dialogRef: MatDialogRef<GestionpDetailComponent>,
    private deviceService: DeviceDetectorService,
    public activeModal: NgbActiveModal,
    public _service: GestionpService,
    private fb: FormBuilder,
    private _modalService: NgbModal,
    private _snackBar: MatSnackBar,
    private spi: NgxSpinnerService,
    private valid: ValidadoresService
  ) {
    this.initFormPlanning();
    this.new_fgInfoPerso();
    this.new_fgSearch();
    this.new_fgPerso();
    this.new_fgFilter();
  }

  //#region Form-Group
  initFormPlanning(): void {
    this.fgPlanning = this.fb.group({
      sPresupuesto: [{ value: '', disabled: true }],
      sCliente: [{ value: '', disabled: true }],
      sCampania: [{ value: '', disabled: true }],
      sResponsable: [{ value: '', disabled: true }],
      sFechaInicio: [ null, [Validators.required]],
      sFechaTermino: [ null, [Validators.required]],
    });
  }
  new_fgInfoPerso() {
    this.fgInfoPerso = this.fb.group({
      sCodPlla: [{ value: '?', disabled: true }],
      sTipo: [{ value: '', disabled: true }],
      sDocumento: [{ value: '', disabled: true }],
      dFechIni: [{ value: null, disabled: true }],
      dFechFin: [{ value: null, disabled: true }],
      sCiudad: [{ value: '', disabled: true }],
      nMontoRegPen: [{ value: 0, disabled: true}]
    });
  }


  new_fgSearch() {
    this.fgSearch = this.fb.group({
      sNombres: [{ value: '', disabled: true }]
    });

    this.foPersonal = this.fgSearch.controls['sNombres'].valueChanges
      .pipe(
        startWith(''),
        distinctUntilChanged(),
        map(value => this._filter(value, 2))
      );

    this.fgSearch.valueChanges.subscribe( value => {
      this.fgPerso.reset();
      this.fgInfoPerso.reset();
      this.fgInfoPerso.controls['sCodPlla'].setValue('?');

      this.abPerso = [];
      this.tsPerso = 'inactive';
    });
  }

  new_fgPerso() {
    this.fgPerso = this.fb.group({
      nIdPersonal: [ { value: 0, disabled: true }, [ Validators.required ] ],
      nIdSucursal: [ { value: 0, disabled: true }, [ Validators.required ] ],
      nCategoria: [ { value: 0 } , [Validators.required, this.valid.noSelect] ],
      sCategoria: [ { value: '' } , [ Validators.required ] ],
      nCanal: [ { value: 0} , [Validators.required, this.valid.noSelect] ],
      sCanal: [ { value: '' } , [ Validators.required ] ]
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
  //#endregion

  async ngOnInit() {
    this.spi.show('spi_detail2');
    if (this.fromParent.editar === 1) {
      this.panelDisabledSeleccion = true;
      const element = this.fromParent.element;
      this.nIdCentroCosto = element.nIdCentroCosto;
      this.fgPlanning.controls['sFechaInicio'].setValue(element.dFechIni);
      this.fgPlanning.controls['sFechaTermino'].setValue(element.dFechFin);
      this.fgPlanning.controls['sFechaInicio'].disable();
      this.fgPlanning.controls['sFechaTermino'].disable();
      this.fechasPanelInfo = 'DEL ' + moment( new Date(element.dFechIni )).format('DD/MM/YYYY') + ' - HASTA '
      + moment( new Date(element.dFechFin )).format('DD/MM/YYYY') ;
      this.nIdPlanningStatic = element.nIdPlanning;
      await this.GetDetallePersonalPlanning(element.nIdPlanning);
      await this.CargaInicial();
      this.toggleDetail = 0;
      this.mPlanning = 0;
      this.fgSearch.controls['sNombres'].disable();
      await this.onToggleFab(0, 1);
    } else {
      this.panelDisabledSeleccion = false;
      await this.CargaInicial();
      this.toggleDetail = 1;
      this.mPlanning = 1;
      this.fgSearch.controls['sNombres'].enable();
      await this.onToggleFab(0, 2);
    }

    this.spi.hide('spi_detail2');
  }

  openModal(name: any , nIdPlanning: any, dFechaIni: any, dFechaFin: any) {
    switch (name) {
      case 'GestionRuta':
        this.ngbModalOptions.size = 'xl';
        break;
    }

    const _dFechIni = this.fgPlanning.controls['sFechaInicio'].value;
    const _dFechFin = this.fgPlanning.controls['sFechaTermino'].value;
    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);
    const obj = new Object();
    switch (name) {
        case 'GestionRuta':
        obj['nIdCentroCosto'] = this.nIdCentroCosto;
        obj['nIdPlanning'] = nIdPlanning;
        obj['dFechaIni'] = _dFechIni;
        obj['dFechaFin'] = _dFechFin;
        modalRef.componentInstance.fromParent = obj;
          break;
    }

    // modalRef.result.then((result) => {
    //   switch (result.modal) {
    //     case 'GestionDetalle':
    //       if (result.value === 'loadAgain') {
    //         this.getListPlanning();
    //       }
    //       break;
    //     case 'view':
    //       break;
    //   }
    // }, (reason) => {});
  }

  async CargaInicial() {
    await this.GetUsuario();
    await this.GetPersonal( this.sResponsable[0].nCodPer);
    this.centro = this.fromParent.centro;
    this.fgPlanning.controls['sPresupuesto'].setValue(this.centro.sCodCC);
    this.fgPlanning.controls['sCliente'].setValue(this.centro.sCliente);
    this.fgPlanning.controls['sCampania'].setValue(this.centro.sCentroCosto);
    this.fgPlanning.controls['sResponsable'].setValue(this.sResponsable[0].sNombres);
    // await this.GetPerfil(this.nIdEmp, this.centro.sCodCC);
    // await this.GetCanal(this.nIdEmp, this.centro.sCodCC);
  }

  async GetDetallePersonalPlanning(nIdPlanning: number) {
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
        nDias: x.nDias
      });
    });
    this.PlanningRDS.paginator = this.pagPlanning;

    this.PlanningRDS.filterPredicate = function( data1, filter: string): boolean {
      // return data.sNombres.trim().toLowerCase().includes(filter) || data.sDocumento.trim().toLowerCase().includes(filter);
      return data1.sNombres.trim().toLowerCase().includes(filter);
    };

    this.PlanningRDS.filterPredicate = (( data2: any, filter: any ) => {
      const a = !filter.sNombres || ( data2.sNombres.toLowerCase().includes(filter.sNombres.toLowerCase()) );
      // ||  data.sDocumento.toLowerCase().includes(filter.sNombres.toLowerCase()) );
      return a;
    }) as (PeriodicElement: any, string: any) => boolean;

    this.mtPlanning.renderRows();
    this.getSearch.sNombres.patchValue(undefined);

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

  async GetUsuario() {
    const user = localStorage.getItem('currentUser');
      const uid = JSON.parse(window.atob(user.split('.')[1])).uid;
    await this._service.UsuarioLogueo(uid).then((response: any) => {
      if (response.status === 200) {
        this.sResponsable = response.body.response.data;
      }
    });
  }

  async GetPersonal(nidResp: number) {
    await this._service.ListaPlanningPersonal(nidResp).then((response: any) => {
      if (response.status === 200) {
        this.aPersonal = response.body.response.data;
      }
    });
  }
  async GetPerfil(nIdEmp: number, sCodCC: string, nIdSucursal: number, nIdPartida: number) {
    await this._service.GetPerfil( nIdEmp, sCodCC, nIdSucursal, nIdPartida ).then((response: any) => {
      if (response.status === 200) {
        this.aPerfil = response.body.response.data;
      }
    });
  }
  async GetCanal(nIdEmp: number, sCodCC: string, nIdSucursal: number, nIdPartida: number) {
    await this._service.GetCanal(nIdEmp, sCodCC, nIdSucursal, nIdPartida).then((response: any) => {
      if (response.status === 200) {
        this.aCanal = response.body.response.data;
      }
    });
  }

  async removePerso(pushParam: any) {

    if (this.fromParent.editar === 1) {
      let TieneAsistenciaValida = 0;
      await this._service.GetConsultaAsistencia(pushParam.nIdDPP).then((response: any) => {
        if (response.status === 200) {
          const data = response.body.response.data;
          TieneAsistenciaValida = data[0];
        }
      });

      if (TieneAsistenciaValida > 0) {
        this._snackBar.open('Usuario tiene asistencia.', 'Cerrar', {
          horizontalPosition: 'right',
          verticalPosition: 'top',
          duration: 1500
        });
      } else {
        const nIdPersonal = pushParam.nIdPersonal;
        const aData = this.PlanningRDS.data;
        const iData = aData.findIndex( x => x.nIdPersonal === nIdPersonal );
        aData.splice(iData, 1);
        this.PlanningRDS.data = aData;
        this.PlanningRDS.paginator = this.pagPlanning;
        this.mtPlanning.renderRows();
        const iArray = this.aPersonal.findIndex( x => x.nIdPersonal === nIdPersonal );
        this.aPersonal[iArray].nStat = 0;
      }
    } else {
      const nIdPersonal = pushParam.nIdPersonal;
      const aData = this.PlanningRDS.data;
      const iData = aData.findIndex( x => x.nIdPersonal === nIdPersonal );
      aData.splice(iData, 1);
      this.PlanningRDS.data = aData;
      this.PlanningRDS.paginator = this.pagPlanning;
      this.mtPlanning.renderRows();
      const iArray = this.aPersonal.findIndex( x => x.nIdPersonal === nIdPersonal );
      this.aPersonal[iArray].nStat = 0;
    }
  }

  async osPerso(event: any, opc: number) {

    let vEvent: any;
    switch (opc) {
      case 1:
        vEvent = event.option.value.nIdPersonal;
        break;
      case 2:
        vEvent = event;
        break;
    }

    const aFind = this.aPersonal.find( x => x.nIdPersonal === vEvent );

    this.fgSearch.controls['sNombres'].setValue(aFind);
    this.fgPerso.controls['nIdPersonal'].setValue(aFind.nIdPersonal);
    this.fgInfoPerso.controls['sCodPlla'].setValue(aFind.sCodPlla);
    // this.fgPerso.controls['nCategoria'].setValue(aFind.nCategoria);
    // this.fgPerso.controls['sCategoria'].setValue(aFind.sCategoria);
    // this.fgPerso.controls['nCanal'].setValue(aFind.nCanal);
    // this.fgPerso.controls['sCanal'].setValue(aFind.sCanal);
    // this.fgPerso.controls['nIdSucursal'].setValue(aFind.nIdSucursal);
    // this.fgPerso.controls['nNeto'].enable();

    // this.fgInfoPerso.patchValue({
    //   sCodPlla: aFind.sCodPlla,
    //   sDscTipo: aFind.sDscTipo,
    //   sDocumento: aFind.sDocumento,
    //   dFechIni: moment(aFind.dFechIni).toDate(),
    //   dFechFin: moment(aFind.dFechFin).toDate()
    // });

    this.abPerso = this.fbPerso;
    this.tsPerso = 'active';
    await this.GetPerfil(this.nIdEmp, this.centro.sCodCC, aFind.nIdSucursal, aFind.nIdPuesto);
    await this.GetCanal(this.nIdEmp, this.centro.sCodCC, aFind.nIdSucursal, aFind.nIdPuesto);
  }

  editPerso(row: any) {
    if ( this.mPlanning === 1 ) {
      this.osPerso(row.nIdPersonal, 2);
      this.fgPerso.patchValue({
        sDscTipo: row.sDscTipo,
        sDocumento: row.sDocumento
      });
    }
  }

  updatedVal(e) {
    let boolean: boolean;

    if ( e instanceof Object ) {
      boolean = ( e && e.length > 0 ) ? true : false;
    } else {
      boolean = ( e && e.trim().length > 0 ) ? true : false;
    }
    this.saPersonal = boolean;
  }

  clickFlipCard() {
    if ( this.mPlanning === 1 ) {
      ( function($) {
        $('#card_inner2').toggleClass('is-flipped');
      })(jQuery);
    }
  }

  displayWith(obj?: any): string {
    return obj ? obj.sNombres : '';
  }

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

  async addPerso() {
    let lError = false;
    const nIdPersonal = this.fgPerso.controls['nIdPersonal'].value;
    const dFechaini = moment(
      new Date(this.fgPlanning.get('sFechaInicio').value)
    ).format('YYYY/MM/DD');

    const dFechaFin = moment(
      new Date(this.fgPlanning.get('sFechaTermino').value)
    ).format('YYYY/MM/DD');
    const element = this.fromParent.centro;
    this.nIdCentroCosto = element.nIdCentroCosto;
    await this.DatosCentroCosto(element.nIdCentroCosto);
    // const dFechaini = this.fgPlanning.controls['sFechaInicio'].value;
    // const dFechaFin = this.fgPlanning.controls['sFechaTermino'].value;
    const Categoria = this.fgPerso.controls['sCategoria'].value;
    const Canal = this.fgPerso.controls['sCanal'].value;
    let cruce;
    let CrucePlanning = 0;
    // let existeCC = 0;
    await this._service.GetCrucesPlanning( nIdPersonal, dFechaini, dFechaFin).then((response: any) => {
      if (response.status === 200) {
        cruce = response.body.response.data;
        CrucePlanning = cruce[0];
      }
    });

    if (CrucePlanning > 0) {
      lError = true;
    }

    if (dFechaini !== '' && dFechaini !== undefined && dFechaFin !== '' && dFechaFin !== undefined && lError === false ) {
      if (Date.parse(dFechaini) < Date.parse(dFechaFin)) {
        lError = false;
      } else {
        lError = true;
      }
    } else {
      lError = true;
    }

    // const nIdCentroCosto = this.fgBonoR.controls['T1_nIdCentroCosto'].value;
    // lError = await this.saldoCentroCosto(nIdCentroCosto);
    if (nIdPersonal === null || lError === true ) {
      Swal.fire(
        'No se puede agregar el usuario.',
        'Yatiene tiene un planning asignado en un mismo rango de fechas.',
        'info'
      );
      // this._snackBar.open('Fecha inválida.', 'Cerrar', {
      //   horizontalPosition: 'right',
      //   verticalPosition: 'top',
      //   duration: 1500
      // });
    } else {
      let iFind: number;
      const aFind = this.aPersonal.find( (x: any, index: number) => {
        iFind = index;
        return x.nIdPersonal === nIdPersonal;
      });
      const DatosCC = this.datosCC.filter(x => x.nIdSucursal === aFind.nIdSucursal);
      if (DatosCC.length > 0) {
        lError = false;
      } else {
        lError = true;
      }


      if (lError === true) {
        this.FooterSucursal = false;
        this.FooterPuesto = true;
        // this._snackBar.open('Sucursal fuera del centro de costo.', 'Cerrar', {
        //   horizontalPosition: 'right',
        //   verticalPosition: 'top',
        //   duration: 1500
        // });
      } else {
        this.FooterSucursal = true;
        const existe = DatosCC.filter(x => x.nIdPartida === aFind.nIdPuesto);
        if (existe.length > 0 ) {
          lError = false;
        } else {
          lError = true;
        }
        if (lError === true) {
          this.FooterSucursal = true;
          this.FooterPuesto = false;
          // this._snackBar.open('Puesto fuera invalido en sucursal.', 'Cerrar', {
          //   horizontalPosition: 'right',
          //   verticalPosition: 'top',
          //   duration: 1500
          // });
        } else {
          this.FooterPuesto = true;
          const aData = this.PlanningRDS.data;
          const iSplice = aData.findIndex( x => x.nIdPersonal === nIdPersonal);
          if ( iSplice > -1 ) {
            aData.splice(iSplice, 1);
          }

          aData.push({
            nIdPersonal: aFind.nIdPersonal,
            sNombres: aFind.sNombres,
            sCodPlla: aFind.sCodPlla,
            nCategoria: Categoria.nCategoria,
            sCategoria: Categoria.sCategoria,
            nCanal: Canal.nCanal,
            sCanal: Canal.sCanal,
            nDias : 0,
            dFechIni: moment(aFind.dFechIni).toDate(),
            dFechFin: moment(aFind.dFechFin).toDate(),
            nIdCargo: aFind.nIdCargo,
            nIdPuesto: aFind.nIdPuesto,
            nIdSucursal: aFind.nIdSucursal,
          });

          this.PlanningRDS.data = aData;
          this.PlanningRDS.paginator = this.pagPlanning;

          this.PlanningRDS.filterPredicate = function(data, filter: string): boolean {
            // return data.sNombres.trim().toLowerCase().includes(filter) || data.sDocumento.trim().toLowerCase().includes(filter);
            return data.sNombres.trim().toLowerCase().includes(filter);
          };

          this.PlanningRDS.filterPredicate = ((data: any, filter: any ) => {
            const a = !filter.sNombres || ( data.sNombres.toLowerCase().includes(filter.sNombres.toLowerCase()) );
            // ||  data.sDocumento.toLowerCase().includes(filter.sNombres.toLowerCase()) );
            return a;
          }) as (PeriodicElement: any, string: any) => boolean;
          this.mtPlanning.renderRows();
          this.getSearch.sNombres.patchValue(undefined);
        }
      }
      // const nNeto = this.fgPerso.controls['nNeto'].value;
      // const nBruto = this.fgPerso.controls['nBruto'].value as number;
    }
  }

  async onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 0:
        if (stat === -1) {
          if (this.abDetail.length > 0) {
            stat = 0;
          } else {
            stat = this.maView_dp === -1 ? 1 : 2;
          }
        }

        this.tsDetail = stat === 0 ? 'inactive' : 'active2';

        switch (stat) {
          case 0:
            this.abDetail = [];
            break;
          case 1:
              this.abDetail = this.fbEdit;
            break;
          case 2:
              this.abDetail = this.fbEdit2;
            break;
        }
        break;

        // stat = stat === -1 ? (this.abDetail.length > 0 ? 0 : 1) : stat;
        // this.tsDetail = stat === 0 ? 'inactive' : 'active';
        // this.abDetail = stat === 0 ? [] : this.fbView;
        // break;
      case 1:
       stat = ( stat === -1 ) ? ( this.abPerso.length > 0 ) ? 0 : 1 : stat;
       this.tsPerso = ( stat === 0 ) ? 'inactive' : 'active';
       this.abPerso = ( stat === 0 ) ? [] : this.fbPerso;
       break;
    }
  }

  async AgregarPlanning() {
    this.spi.show('spi_detail2');
    const nIdResp = this.sResponsable[0].nCodPer;
    const dFechIni = moment(
      new Date(this.fgPlanning.get('sFechaInicio').value)
    ).format('YYYY/MM/DD');
    const dFechFin = moment(
      new Date(this.fgPlanning.get('sFechaTermino').value)
    ).format('YYYY/MM/DD');
    // const dFechIni = this.fgPlanning.controls['sFechaInicio'].value;
    // const dFechFin = this.fgPlanning.controls['sFechaTermino'].value;
    const nIdCentroCosto = this.centro.nIdCentroCosto;
    const user = localStorage.getItem('currentUser');
    const nIdRegUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    let nIdPlanning = 0;
    let nIdDetPlanning;
    await this._service.InsertPlanning( nIdResp, dFechIni, dFechFin, nIdCentroCosto,  parseInt(nIdRegUser) ).then((response: any) => {
      if (response.status === 200) {
        nIdPlanning = response.body.response.data;
      }
    });
    nIdPlanning = nIdPlanning[0];
    this.nIdPlanningStatic = nIdPlanning;
    await this.PlanningRDS.data.forEach(x => {
      this._service.InsertDetPlanning( nIdPlanning, x.nIdPersonal, x.nCanal, x.nCategoria, parseInt(nIdRegUser),
      x.nIdSucursal , x.nIdCargo , x.nIdPuesto ).then((response: any) => {
        if (response.status === 200) {
          nIdDetPlanning = response.body.response.data;
        }
      });
    });
    this.spi.hide('spi_detail2');
    if ( nIdPlanning > 0) {

      Swal.fire({
        title:
          'Grabación Exitosa!',
        text: 'Se guardó correctamente.',
        icon: 'success',
        showCancelButton: true,
        cancelButtonText: 'Cerrar!',
        confirmButtonColor: '#ff4081',
        confirmButtonText: 'Asignar rutas!',
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          const _dFechIni = moment(
            new Date(this.fgPlanning.controls['sFechaInicio'].value)
          ).format('YYYY/MM/DD');
          const _dFechFin = moment(
            new Date(this.fgPlanning.controls['sFechaTermino'].value)
          ).format('YYYY/MM/DD');
          this.openModal('GestionRuta', this.nIdPlanningStatic, _dFechIni, _dFechFin);
        } else {
          const oReturn = new Object();
          oReturn['nIdCentroCosto'] = this.centro.nIdCentroCosto;
          oReturn['modal'] = 'detalle';
          oReturn['value'] = 'loadAgain';
          this.activeModal.close(oReturn);
        }
      });
      // this.PlanningRDS.data = [];
      // this.fgPlanning.controls['sFechaInicio'].disable();
      // this.fgPlanning.controls['sFechaTermino'].disable();
      // await this.GetDetallePersonalPlanning(nIdPlanning);
      // await this.CargaInicial();
      // this.toggleDetail = 1;
      // this.mPlanning = 0;
      // this.fgSearch.controls['sNombres'].disable();
      // await this.onToggleFab(0, 2);
      // // const oReturn = new Object();
      // // oReturn['modal'] = 'detalle';
      // // oReturn['value'] = 'loadAgain';
      // // this.activeModal.close(oReturn);
    } else {
      Swal.fire(
        'No se puede guardar',
        'Información incorrecta o incompleta en la sección ',
        'error'
      );
    }


  }

  async clickFab(opc: number, index: number) {
    switch (opc) {
      // case 0:
      //   switch (index) {
      //     case 0:
      //       this.closemodal();
      //       break;
      //     case 1:
      //       const cant = this.PlanningRDS.data.length;
      //       Swal.fire({
      //         title:
      //           '¿ Esta seguro de registrar ' + cant + ' usuario(s) para el planning?',
      //         text: 'Centro de costo: ' + this.centro.sCodCC,
      //         icon: 'question',
      //         showCancelButton: true,
      //         cancelButtonText: 'No!',
      //         confirmButtonColor: '#ff4081',
      //         confirmButtonText: 'Si!',
      //         allowOutsideClick: false,
      //       }).then((result) => {
      //         if (result.isConfirmed) {
      //             this.AgregarPlanning();
      //         }
      //       });
      //       break;
      //   }
      //   break;
      case 0:
          switch (index) {
             case 0:
              //  editar
              Swal.fire({
                title:
                  '¿ Esta seguro de editar el planning?',
                text: 'Centro de costo: ' + this.centro.sCodCC,
                icon: 'question',
                showCancelButton: true,
                cancelButtonText: 'No!',
                confirmButtonColor: '#ff4081',
                confirmButtonText: 'Si!',
                allowOutsideClick: false,
              }).then((result) => {
                if (result.isConfirmed) {
                  this.toggleDetail = 1;
                  this.mPlanning = 1;
                  this.fgSearch.controls['sNombres'].enable();
                  this.panelOpenState = false;
                  this.panelOpenState2 = true;
                  this.panelDisabledSeleccion = false;
                  this.onToggleFab(0, -1);
                  this.delay(250).then((any) => {
                  this.onToggleFab(0, 2);
                  });
                }
              });
             break;
             case 1:
              //  crear ruta
              const _dFechIni = (this.fgPlanning.controls['sFechaInicio'].value);
              const dFechIni = moment(new Date(_dFechIni)).format('DD/MM/YYYY');
              const dFechFin = moment(
                new Date(this.fgPlanning.controls['sFechaTermino'].value)
              ).format('DD/MM/YYYY');
              const oReturn = new Object();
              oReturn['modal'] = 'detalle';
              oReturn['value'] = 'loadAgain';
              this.onToggleFab(0, -1);
              // this.activeModal.close(oReturn);
              this.openModal('GestionRuta', this.nIdPlanningStatic, dFechIni, dFechFin);
             break;
             case 2:
              //  eliminar
             break;
              }
      break;
      case 1:
        switch (index) {
           case 0:
            //  guardar
            Swal.fire({
              title:
                '¿ Esta seguro de guardar el planning?',
              text: 'Centro de costo: ' + this.centro.sCodCC,
              icon: 'question',
              showCancelButton: true,
              cancelButtonText: 'No!',
              confirmButtonColor: '#ff4081',
              confirmButtonText: 'Si!',
              allowOutsideClick: false,
            }).then(async (result) => {
              if (result.isConfirmed) {
                if (this.fromParent.editar === 1) {
                } else {
                  await this.AgregarPlanning();
                }
                Swal.fire({
                  title: 'Grabación Exitosa',
                  text: 'Se guardó correctamente',
                  icon: 'success',
                  showCancelButton: false,
                  confirmButtonColor: '#ff4081',
                  confirmButtonText: 'Si!',
                  allowOutsideClick: false,
                }).then((result2) => {
                  if (result2.isConfirmed) {
                    this.toggleDetail = 0;
                    this.panelOpenState = true;
                    this.panelOpenState2 = false;
                    this.panelDisabledSeleccion = true;
                    this.mPlanning = 0;
                    this.fgSearch.controls['sNombres'].disable();
                    this.onToggleFab(0, -1);
                    this.delay(250).then((any) => {
                      this.onToggleFab(0, 1);
                    });
                  }
                });
              }
            });
           break;
           case 1:
            //  cancelar
            this.toggleDetail = 0;
            this.mPlanning = 0;
            this.fgSearch.controls['sNombres'].disable();
            this.spi.show('spi_detail2');
            this.PlanningRDS.data = [];
            await this.GetDetallePersonalPlanning(this.nIdPlanningStatic);
            this.spi.hide('spi_detail2');
            this.panelOpenState = true;
            this.panelOpenState2 = false;
            this.panelDisabledSeleccion = true;

            this.onToggleFab(0, -1);
            this.delay(250).then((any) => {
                this.onToggleFab(0, 1);
            });
           break;
            }
    break;
      case 5:
        switch (index) {
           case 0:
           this.addPerso();
           break;
           case 1:
           this.getSearch.sNombres.patchValue(undefined);
           break;
            }
      break;
    }
  }

  closemodal(): void {
    this.activeModal.close();
  }

  ValidarFechaInicio() {
    let lError = false;
    const hoy             = new Date();
    const dFechIni = moment(
      new Date(this.fgPlanning.controls['sFechaInicio'].value)
    ).format('YYYY/MM/DD');
    const fechaFormulario = new Date(dFechIni);
    const dFechFin = moment(
      new Date(this.fgPlanning.get('sFechaTermino').value)
    ).format('YYYY/MM/DD');

    const dFechIni2 = this.fgPlanning.controls['sFechaInicio'].value;
    const dFechFin2 = this.fgPlanning.controls['sFechaTermino'].value;

      if (dFechFin2 !== '' &&  dFechIni2 !== '' && dFechIni2 !== null && dFechFin2 !== null) {
        if (Date.parse(dFechIni) < Date.parse(dFechFin)) {
          lError = false;
        } else {
          lError = true;
        }
      }

    if (hoy > fechaFormulario) {
      lError = true;
    }

    if (lError) {
      this.fgPlanning.controls['sFechaInicio'].setValue('');
      this._snackBar.open('Fecha inválida.', 'Cerrar', {
        horizontalPosition: 'right',
        verticalPosition: 'top',
        duration: 1500
      });
    }
  }

  ValidarFechaFin() {
    let lError = false;
    const hoy  = new Date();
    const dFechIni = moment(
      new Date(this.fgPlanning.get('sFechaInicio').value)
    ).format('YYYY/MM/DD');
    const dFechFin = moment(
      new Date(this.fgPlanning.get('sFechaTermino').value)
    ).format('YYYY/MM/DD');
    const fechaFormulario = new Date(dFechFin);

    const dFechIni2 = this.fgPlanning.controls['sFechaInicio'].value;
    const dFechFin2 = this.fgPlanning.controls['sFechaTermino'].value;

      if (dFechFin2 !== '' &&  dFechIni2 !== '' && dFechIni2 !== null && dFechFin2 !== null) {
        if (Date.parse(dFechIni) < Date.parse(dFechFin)) {
          lError = false;
        } else {
          lError = true;
        }
      }

      if (hoy > fechaFormulario) {
        lError = true;
      }

    if (lError) {
      this.fgPlanning.controls['sFechaTermino'].setValue('');
      this._snackBar.open('Fecha inválida.', 'Cerrar', {
        horizontalPosition: 'right',
        verticalPosition: 'top',
        duration: 1500
      });
    }
  }

  get getfgPlanning() { return this.fgPlanning.controls; }
  get getPerso() { return this.fgPerso.controls; }
  get getInfoPerso() { return this.fgInfoPerso.controls; }
  get getSearch() { return this.fgSearch.controls; }
  get getFilter() { return this.fgFilter.controls; }

}
