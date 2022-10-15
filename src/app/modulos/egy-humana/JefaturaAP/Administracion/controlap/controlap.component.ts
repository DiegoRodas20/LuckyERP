import { Component, OnInit, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { adminpAnimations } from '../../Animations/adminp.animations';
import { ControlapService } from '../../Services/controlap.service';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { startWith, distinctUntilChanged, map } from 'rxjs/operators';
import { ControlapContactpComponent } from './Modals/controlap-contactp/controlap-contactp.component';
import { ControlapDetailpComponent } from './Modals/controlap-detailp/controlap-detailp.component';
import { ControlapContactrComponent } from './Modals/controlap-contactr/controlap-contactr.component';
import { ControlapRejectionComponent } from './Modals/controlap-rejection/controlap-rejection.component';
import Swal from 'sweetalert2';

// Modals
const MODALS: { [name: string]: Type<any> } = {
  contactp: ControlapContactpComponent,
  detailp: ControlapDetailpComponent,
  contactr: ControlapContactrComponent,
  reject: ControlapRejectionComponent
};

function between(x: number, min: number, max: number) {
  return x >= min && x <= max;
}

@Component({
  selector: 'app-controlap',
  templateUrl: './controlap.component.html',
  styleUrls: ['./controlap.component.css', './controlap.component.scss'],
  animations: [ adminpAnimations ],
  providers: [ ControlapService ]
})
export class ControlapComponent implements OnInit {

  //#region Variables

  // Fab
  fbMain = [
    {icon: 'calendar_today', tool: 'Cambiar devengue', badge: 0, dis: false},
    {icon: 'person', tool: 'Desestimaciones', badge: 0, dis: true}
  ];
  abMain = [];
  tsMain = 'inactive';

  fbResp = [
    {icon: 'add_ic_call', tool: 'Contactar'},
    {icon: 'visibility', tool: 'Visualizar'},
  ];
  abResp = [];
  tsResp = 'active';

  // Animaciones Tada
  tadaMain = 'inactive';

  // Progress Bar
  pbMain: boolean;

  // FormGroup
  fgMain: FormGroup;
  fgResp: FormGroup;

  // Combobox
  cboPlanilla = new Array();
  cboCiudad = new Array();
  cboTipoCC = new Array();

  // AutoComplete
  af_Responsable = new Array();
  foResponsable: Observable<any[]>;
  saResponsable = false;

  af_Organizacion = new Array();
  foOrganizacion: Observable<any[]>;
  saOrganizacion = false;

  // Devengue
  nIdDevengue: number;
  dFechDevengue: Date = null;
  maxDay = 0;
  sHeaderDevengue = '';

  // Mat Table
  RespBackup = new Array();
  RespDC: string[] = [ 'sRespImg', 'sResp' ];
  RespDS: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild('pagResp', {static: true}) pagResp: MatPaginator;
  editTable = null;

  MainBackup = new Array();
  MainDC: string[] = [ 'action', 'sNombres', 'sCodPlla', 'dFechIni', 'dFechFin', 'nDias', 'sEstado', 'more' ];
  MainDS: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild('pagMain', {static: true}) pagMain: MatPaginator;
  expandedMore = null;

  // Contacto
  fcDateTime: FormControl = new FormControl({value: '', disabled: true});
  fcMotivo: FormControl  = new FormControl({value: '', disabled: true});
  fcRespuesta: FormControl  = new FormControl({value: '', disabled: true});
  fcObservacion: FormControl  = new FormControl({value: '', disabled: true});

  // Responsable
  nIdResp: number;
  sResp: string;

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
  itemPersonal: number;
  aItem: any;
  nDetail: number;

  // Array
  DiasBackup = new Array();
  DevengueBackup = new Array();

  //#endregion

  constructor(public service: ControlapService, private fb: FormBuilder,
              private spi: NgxSpinnerService, private _snackBar: MatSnackBar,
              private _modalService: NgbModal) {

    this.new_fgMain();
  }

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_main');

    await this.cboGetPlanilla();
    await this.cboGetCiudad();
    await this.cboGetTipoCC();

    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    param.push('0¡nIdEmp!' + nIdEmp);
    // param.push('2¡nIdEstado!2');

    await this.service._loadSP( 1, param).then((value: any[]) => {
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

      await this.loadMain();
    }

    if (this.RespDS.data.length > 0) {
      this.selectResp(0);
    }

    await this.loadObs();

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

      case 2:
        stat = ( stat === -1 ) ? ( this.abResp.length > 0 ) ? 0 : 1 : stat;
        this.tsResp = ( stat === 0 ) ? 'inactive' : 'active';
        this.abResp = ( stat === 0 ) ? [] : this.fbResp;
    }
  }

  async clickFab(index: number) {
    switch (index) {
      // Cambiar Devengue
      case 0:

        const iOptions: { [inputValue: number]: string; } = {};
        const iOption: {
          nIdDevengue: number;
          sDevengue: string;
        }[] = [];

        moment.locale('es');
        this.DevengueBackup.forEach( x => {

          const sEjercicio = (x.nEjercicio as number).toString();
          let sMes = (x.nMes as number).toString();
          sMes = (sMes.length === 1) ? '0' + sMes : sMes;

          const sFechDevengeue = '01/' + sMes + '/' + sEjercicio;
          const tDate = moment(sFechDevengeue, 'DD/MM/YYYY').format('MMMM [del] YYYY');
          const sDate = tDate[0].toUpperCase() + tDate.substr(1).toLowerCase();

          iOption.push({
            nIdDevengue: x.nIdDevengue,
            sDevengue: sDate
          });

        });

        $.map(iOption, function (o) {
          iOptions[o.nIdDevengue] = o.sDevengue;
        });

        Swal.fire({
          title: 'Seleccionar Devengue',
          icon: 'info',
          text: 'Al cambiar el devengue se mostrará la información relacionada al mes y año en cuestión.',
          input: 'select',
          inputOptions: iOptions,
          inputPlaceholder: 'Seleccionar',
          showCancelButton: true,
          confirmButtonText: 'Seleccionar',
          allowOutsideClick: false,
          inputValidator: (value) => {
            if (value === undefined || value === '') {
              return 'Selección no válida.';
            }
          }
        }).then(async resultado => {
          const nIdNewD = Number(resultado.value);

          if ( this.nIdDevengue === nIdNewD ) {
            this._snackBar.open('No se realizó ningún cambio.', 'Cerrar', {
              duration: 1000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
          } else {

            const aDevengue = this.DevengueBackup;
            const iDevengue = aDevengue.findIndex( x => x.nIdDevengue === nIdNewD );
            this.nIdDevengue = aDevengue[iDevengue].nIdDevengue as number;

            const sEjercicio = (aDevengue[iDevengue].nEjercicio as number).toString();
            let sMes = (aDevengue[iDevengue].nMes as number).toString();
            sMes = (sMes.length === 1) ? '0' + sMes : sMes;

            const sFechDevengeue = '01/' + sMes + '/' + sEjercicio;
            this.dFechDevengue = moment(sFechDevengeue, 'DD/MM/YYYY').toDate();

            const tDate = moment(this.dFechDevengue).format('MMMM [del] YYYY');
            this.sHeaderDevengue = tDate[0].toUpperCase() + tDate.substr(1).toLowerCase();

            this.spi.show('spi_main');
            await this.loadMain();
            this.spi.hide('spi_main');

          }
        });
        break;

      // Desestimaciones
      case 1:
        this.ngbModalOptions.size = 'xl';
        this.openModal('reject');
        break;
    }
  }

  openModal(name: string) {

    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);
    const obj = new Object();

    obj['nIdDevengue'] = this.nIdDevengue;
    obj['dFechDevengue'] = this.dFechDevengue;

    const aResp = this.MainBackup.filter( x => x.nIdResp === this.nIdResp );

    let aDias = [];
    if (this.aItem !== undefined) {
      aDias = this.DiasBackup.filter( x => x.nIdPersonal === this.aItem.nIdPersonal );
    }

    switch (name) {
      case 'contactp':
        obj['aDias'] = aDias;
        obj['aItem'] = this.aItem;
        modalRef.componentInstance.fromParent = obj;
        break;

      case 'contactr':
        obj['aResp'] = aResp;
        obj['nIdResp'] = this.nIdResp;
        modalRef.componentInstance.fromParent = obj;
        break;

      case 'detailp':
        obj['aResp'] = aResp;
        obj['aDias'] = aDias;
        obj['aItem'] = this.aItem;
        obj['nDetail'] = this.nDetail;
        modalRef.componentInstance.fromParent = obj;
        break;

      case 'reject':
        modalRef.componentInstance.fromParent = obj;
        break;

    }

    modalRef.result.then(async (result) => {

      switch (result.modal) {
        case 'contactp':
          if (result.value === 'loadAgain') {

            this.spi.show('spi_main');

            const nIdPersonal = result.nIdPersonal;
            const nIdContacto = result.nIdContacto;

            const iBackup = this.MainBackup.findIndex( x => x.nIdPersonal === nIdPersonal );

            this.MainBackup[iBackup].nIdContacto = nIdContacto;
            this.MainBackup[iBackup].sEstado = 'Contactado';
            this.MainBackup[iBackup].nEstado = 1;

            this.MainDS = new MatTableDataSource(this.MainBackup);

            this.spi.hide('spi_main');

          }
          break;

        case 'detailp':
          if (result.value === 'loadAgain') {

            const aReturn = result.aReturn as Array<any>;
            aReturn.forEach( x => {

              const iArray = this.MainBackup.findIndex( y => y.nIdPersonal === x.nIdPersonal );
              this.MainBackup[iArray].nIdContacto = x.nIdContacto;
              this.MainBackup[iArray].sEstado = 'Contactado';
              this.MainBackup[iArray].nEstado = 1;

            });

            this.MainDS = new MatTableDataSource(this.MainBackup);

          }
          break;

        case 'reject':
          if (result.value === 'loadAgain') {
            await this.loadObs();
          }
          break;
      }

    }, (reason) => { });

  }

  //#endregion

  //#region FormGroup

  new_fgMain() {
    this.fgMain = this.fb.group({
      sNombres: '',
      sCodPlla: '',
      sCiudad: '',
      nIdResp: 0,
      nTipoCC: 0,
      sOrganizacion: [{ value: '', disabled: true }],
      nIdOrganizacion: undefined,
      nDias: undefined,
      nEstado: undefined
    });

    this.fgMain.valueChanges.subscribe(value => {

      const aResp = [];
      const aMain = this.MainBackup.filter( x => {

        // tslint:disable-next-line: max-line-length
        const a = !value.sNombres || ( x.sNombres.toLowerCase().includes(value.sNombres.toLowerCase()) || x.sDocumento.toLowerCase().includes(value.sNombres.toLowerCase()) );
        const b = !value.sCodPlla || x.sCodPlla.toLowerCase().includes(value.sCodPlla);
        const c = !value.nEstado || x.nEstado === Number(value.nEstado);
        const d = !value.sCiudad || x.sCiudad.toLowerCase().includes(value.sCiudad.toLowerCase());
        const e = !value.nIdOrganizacion || x.nIdTipoCC === value.nTipoCC && x.nIdOrganizacion === value.nIdOrganizacion;
        const f = !value.nDias || x.nDias <= value.nDias;
        return a && b && c && d && e && f;

      });

      aMain.forEach( x => {
        const nIdResp = x.nIdResp;
        const iResp = aResp.findIndex( y => y.nIdResp === nIdResp);
        if (iResp === -1) { aResp.push( this.RespBackup.find( y => y.nIdResp === nIdResp) ); }
      });

      this.RespDS = new MatTableDataSource(aResp);
      this.RespDS.paginator = this.pagResp;

      if (this.RespDS.paginator) {
        this.RespDS.paginator.firstPage();
      }

      const filter = {...value, name: value.sNombres.trim().toLowerCase()} as string;
      this.MainDS.filter = filter;

      if (this.MainDS.paginator) {
        this.MainDS.paginator.firstPage();
      }

    });

    this.foOrganizacion = this.fgMain.controls['sOrganizacion'].valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 2))
      );

  }

  new_fgResp() {
    this.fgResp = this.fb.group({
      sResponsable: '',
      nIdResponsable : 0,
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

    if (pushParam !== undefined) {
      this.fgMain.controls['sOrganizacion'].enable();
    }

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
    this.fgMain.controls['nIdOrganizacion'].setValue(vEvent);
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

          const nIdTipoCC = this.fgMain.controls['nTipoCC'].value;
          aFilter = this.af_Organizacion.filter( x => {
            const a = x.sOrganizacion.trim().toLowerCase().includes(filterValue);
            const b = x.nIdTipoCC === nIdTipoCC;
            return a && b;
          });
          break;

      }

    }

    return aFilter;
  }

  //#endregion

  //#region Load

  async loadMain() {
    let param = [];

    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
    const nIdDevengue = this.nIdDevengue;
    const spFechDevengue = moment(this.dFechDevengue).format('MM/DD/YYYY');
    param.push('6¡spFechDevengue!' + spFechDevengue + '-0¡nIdDevengue!' + nIdDevengue + '-0¡A.nIdEmp!' + nIdEmp);
    param.push('1¡sCodPlla!2,3');

    const aIdPersonal = [];
    const aIdPerLab = [];
    const aIdCentroCosto = [];
    const aIdResp = [];

    let sIdPersonal = '';
    let sIdPerLab = '';
    let sIdCentroCosto = '';
    let sIdResp = '';

    const aMainDS = [];

    await this.service._loadSP( 2, param).then( async (value: any[]) => {
      value.forEach( x => {

        // ALmacenamos la lista principal
        aMainDS.push({
          nIdPersonal: x.nIdPersonal,
          nIdPerLab: x.nIdPerLab,
          sNombres: x.sNombres,
          sCodPlla: x.sCodPlla,
          sTipo: x.sTipo,
          sDscTipo: x.sDscTipo,
          sDocumento: x.sDocumento,
          dFechIni: x.dFechIni,
          dFechFin: x.dFechFin,
          sCiudad: x.sCiudad,
          nIdResp: x.nIdResp,
          nIdCentroCosto: x.nIdCentroCosto,
          nIdTipoCC: x.nIdTipoCC,
          nIdOrganizacion: x.nIdOrganizacion,
          nDias: 0,
          nIdContacto: x.nIdContacto,
          sEstado: ( x.nIdContacto !== null ) ? 'Contactado' : 'Sin contactar',
          nEstado: ( x.nIdContacto !== null ) ? 1 : 0
        });

        // Almacenamos Id's Personal
        const nIdPersonal = x.nIdPersonal;
        const iArrayP = aIdPersonal.findIndex( y => y === nIdPersonal );
        if (iArrayP === -1) { aIdPersonal.push(nIdPersonal); }

        // Almacenamos Id's PerLab
        const nIdPerLab = x.nIdPerLab;
        const iArrayPL = aIdPerLab.findIndex( y => y === nIdPerLab );
        if (iArrayPL === -1) { aIdPerLab.push(nIdPerLab); }

        // Almacenamos Id's CentroCosto
        const nIdCentroCosto = x.nIdCentroCosto;
        const iArrayC = aIdCentroCosto.findIndex( y => y === nIdCentroCosto );
        if (iArrayC === -1) { aIdCentroCosto.push(nIdCentroCosto); }

        // Almacenamos Id's Resp
        const nIdResp = x.nIdResp;
        const iArrayR = aIdResp.findIndex( y => y === nIdResp);
        if (iArrayR === -1) { aIdResp.push(nIdResp); }

      });

      this.MainBackup = aMainDS;
    });

    // Personal
    aIdPersonal.forEach( x => {
      sIdPersonal = sIdPersonal + x + ',';
    });
    if ( aIdPersonal.length > 0 ) { sIdPersonal = sIdPersonal.substring(0, sIdPersonal.length - 1); }

    // PerLab
    aIdPerLab.forEach( x => {
      sIdPerLab = sIdPerLab + x + ',';
    });
    if ( aIdPerLab.length > 0 ) { sIdPerLab = sIdPerLab.substring(0, sIdPerLab.length - 1); }

    if (sIdPersonal !== '' && sIdPerLab !== '') {

      param = [];
      param.push('1¡nIdPersonal!' + sIdPersonal);

      const sEjMes = moment(this.dFechDevengue).format('YYYYMM');
      param.push('0¡CONVERT(VARCHAR(6),dFecha,112)!' + sEjMes + '-1¡A.nIdPerLab!' + sIdPerLab);
      param.push('7¡A.dFechIni!' + sEjMes);
      param.push('8¡A.dFechFin!' + sEjMes);

      const dIniMonth = moment(this.dFechDevengue).startOf('month').toDate();
      const dFinMonth = moment(this.dFechDevengue).endOf('month').add(-1, 'days').toDate();

      const ndIniMonth = Number(moment(dIniMonth).format('YYYYMMDD'));
      const ndFinMonth = Number(moment(dFinMonth).format('YYYYMMDD'));

      await this.service._loadSP( 13, param).then( async (value: any[]) => {

        value.forEach( x => {

          let nDias = 0;

          const dFechIni = x.dFechIni as Date;
          const dFechFin = x.dFechFin as Date;

          const ndFechIni = Number(moment(dFechIni).format('YYYYMMDD'));
          const ndFechFin = Number(moment(dFechFin).format('YYYYMMDD'));

          const nDif = ( ndFechFin - ndFechFin ) + 1;

          for ( let i = 0; i < nDif; i++ ) {
            const dFechNew = moment(dFechIni).add(i, 'days').toDate();
            const nFechNew = Number(moment(dFechNew).format('YYYYMMDD'));
            if (between( nFechNew, ndIniMonth, ndFinMonth )) {
              nDias = nDias + 1;
            }
          }

          this.DiasBackup.push({
            nIdPersonal: x.nIdPersonal,
            dFechIni: x.dFechIni,
            dFechFin: x.dFechFin,
            sTipo: x.sTipo,
            nDias: nDias
          });

          const nIdPersonal = x.nIdPersonal;
          const iBackup = this.MainBackup.findIndex( y => y.nIdPersonal === nIdPersonal );

          const bkDias = this.MainBackup[iBackup].nDias;
          this.MainBackup[iBackup].nDias = bkDias + nDias;
        });

      });

    }

    // CentroCosto
    aIdCentroCosto.forEach( x => {
      sIdCentroCosto = sIdCentroCosto + x + ',';
    });
    if ( aIdCentroCosto.length > 0 ) { sIdCentroCosto = sIdCentroCosto.substring(0, sIdCentroCosto.length - 1); }

    if (sIdCentroCosto !== '') {

      param = [];
      param.push('1¡nIdCentroCosto!' + sIdCentroCosto);

      const aOrganizacion = [];

      await this.service._loadSP( 3, param).then( async (value: any[]) => {
        value.forEach( x => {

          const nIdTipoCC = x.nIdTipoCC;
          const nIdOrganizacion = x.nIdOrganizacion;

          const iArray = aOrganizacion.findIndex( y => {
            const a = y.nIdTipoCC === nIdTipoCC;
            const b = y.nIdOrganizacion === nIdOrganizacion;
            return a && b;
          });
          if (iArray === -1) { aOrganizacion.push(x); }

        });
      });

      this.af_Organizacion = aOrganizacion;

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
        this.RespBackup = value;

        this.RespDS = new MatTableDataSource(value);
        this.RespDS.paginator = this.pagResp;

      });
    }

    this.MainDS = new MatTableDataSource(aMainDS);
    this.MainDS.paginator = this.pagMain;

    this.MainDS.filterPredicate = function(data, filter: string): boolean {
      return data.sNombres.trim().toLowerCase().includes(filter);
    };

    // const filter = {...value, name: value.sNombres.trim().toLowerCase()} as string;
    //   this.MainDS.filter = filter;

    this.MainDS.filterPredicate = ((data: any, filter: any ) => {
      // tslint:disable-next-line: max-line-length
      const a = !filter.sNombres || ( data.sNombres.toLowerCase().includes(filter.sNombres.toLowerCase()) || data.sDocumento.toLowerCase().includes(filter.sNombres.toLowerCase()) );
      const b = !filter.sCodPlla || data.sCodPlla.toLowerCase().includes(filter.sCodPlla);
      const c = !filter.nEstado || data.nEstado === Number(filter.nEstado);
      const d = !filter.sCiudad || data.sCiudad.toLowerCase().includes(filter.sCiudad.toLowerCase());
      const e = !filter.nIdOrganizacion || data.nIdTipoCC === filter.nTipoCC && data.nIdOrganizacion === filter.nIdOrganizacion;
      const f = !filter.nIdResp || data.nIdResp === filter.nIdResp;
      const g = !filter.nDias || data.nDias <= filter.nDias;
      return a && b && c && d && e && f && g;
    }) as (PeriodicElement, string) => boolean;

  }

  selectResp(nIndex: number) {
    const aResp = this.RespDS.data;

    this.nIdResp = aResp[nIndex].nIdResp;
    this.sResp = aResp[nIndex].sResp;

    this.onToggleFab(2, 1);

    this.fgMain.controls['nIdResp'].setValue(this.nIdResp);
  }

  async clickExpanded(row: any) {

    if ( this.expandedMore === row ) {
      this.expandedMore = null;
    } else {

      if (row.nIdContacto !== null ) {
        const param = [];
        param.push('0¡nIdContacto!' + row.nIdContacto);

        await this.service._loadSP( 10, param).then( (value: any[]) => {
          if (value.length > 0) {

            const dtReg = moment(value[0].dtReg).format('DD/MM/YYYY hh:mm:ss a');
            this.fcDateTime.setValue(dtReg);
            this.fcMotivo.setValue(value[0].sMotivo);
            this.fcRespuesta.setValue(value[0].sRespuesta);
            this.fcObservacion.setValue(value[0].sObservacion);
          }
        });
      }

      this.expandedMore = row;
    }

  }

  clickPersonal(nOpc: number, item: any) {

    this.aItem = item;

    switch (nOpc) {
      // Contactar
      case 1:
        this.ngbModalOptions.size = 'lg';
        this.openModal('contactp');
        break;

      // Detalle
      case 2:
        this.ngbModalOptions.size = 'xl';
        this.nDetail = 1;
        this.openModal('detailp');
        break;
    }

  }

  clickResp(nOpc: number) {
    switch (nOpc) {
      // Contactar
      case 0:
        this.ngbModalOptions.size = 'xl';
        this.openModal('contactr');
        break;

      // Detalle
      case 1:
        this.ngbModalOptions.size = 'xl';

        this.aItem = this.nIdResp;
        this.nDetail = 2;
        this.openModal('detailp');
        break;
    }
  }

  async loadObs() {
    const param = [];
    param.push('0¡A.nIdEstado!2329');

    await this.service._loadSP( 14, param).then( (value: any[]) => {
      if (value.length > 0 ) {
        this.fbMain[1].badge = value[0].nCant;
        this.fbMain[1].dis = ( value[0].nCant > 0 ) ? false : true;
      }
    });
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
