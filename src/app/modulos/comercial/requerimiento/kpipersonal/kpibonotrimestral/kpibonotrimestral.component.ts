import { Component, Inject, OnInit, Type, ViewChild } from '@angular/core';
import {  kpiiAnimations } from './kpibonotrimestral.animations';
import { KpiiService } from './kpibonotrimestral.service';
import { ErrorStateMatcher } from '@angular/material/core';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { Moment } from 'moment';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { AbstractControl, FormBuilder, Validators, FormControl, FormGroup, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { nsBonoT } from '../../model/Ikpibt';
import { NgbModal , NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { KpibtResponsableComponent } from '../Modals/kpibt-responsable/kpibt-responsable.component';
import { KpibtIncentivoComponent } from '../Modals/kpibt-responsable/kpibt-incentivo/kpibt-incentivo/kpibt-incentivo.component';
declare var jQuery: any;

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

const MODALS: { [name: string]: Type<any> } = {
  responsable: KpibtResponsableComponent,
  incentivo: KpibtIncentivoComponent
};

@Component({
  selector: 'app-kpibonotrimestral',
  templateUrl: './kpibonotrimestral.component.html',
  styleUrls: ['./kpibonotrimestral.component.css' , './kpibonotrimestral.component.scss' ],
  providers: [ KpiiService ],
  animations : [ kpiiAnimations ]
})
export class KpibonotrimestralComponent implements OnInit {

 //#region Variables
 matcher = new MyErrorStateMatcher();
 panelOpenState = true;
 panelOpenDis = true;
 expandedMore: nsBonoT.IMain;
 editTable: nsBonoT.IBonoT;
 selectResp: nsBonoT.IListaResp;
 mIncentivo: number;
 fileSustento: File;
 nCrud = 0;
 listaPermitidos = [];
 user = localStorage.getItem('currentUser');
 nIdUser: number = JSON.parse(window.atob(this.user.split('.')[1])).uid;

 //#region ModalOption
 ngbModalOptions: NgbModalOptions = {
  size: 'l',
  centered: true,
  scrollable: true,
  keyboard: false,
  backdrop: 'static',
  windowClass: 'modal-holder'
};
//#endregion

 // Animaciones Tada
 tadaMain = 'inactive';
 tadaIncentivo = 'inactive';

 // Service GET && POST
 url: string;
 aParam = [];
 aParaml = [];

 // Fab
 fbMain = [
   {icon: 'groups', tool: 'Cambiar responsable'},
   {icon: 'request_page', tool: 'Nuevo registro'},
  //  {icon: 'groups', tool: 'Prueba'}
 ];
 abMain = [];
 tsMain = 'inactive';

 abIncentivo = [];
 tsIncentivo = 'active';
 toggleIncentivo = 0;

 fbSustento = [
   {icon: 'cloud_download', tool: 'Descargar'}
 ];
 abSustento = [];
 tsSustento = 'inactive';
 urlSustento: string;

 // Progress Bar
 pbMain: boolean;
 pbIncentivo: boolean;
 pbSustento: boolean;
 pbResp: boolean;

 // Combobox
 cboCliente: any;
 cboCentroCosto = new Array();
 cboEstado: any;


 BonoTrimetralDS: MatTableDataSource<nsBonoT.IBonoT> = new MatTableDataSource([]);
 // Mat Table
 MainDC: string[] = [ 'action', 'sCliente', 'sCentroCosto', 'dDevengue', 'sEstado', 'nCant', 'more' ];
 MainDS: MatTableDataSource<nsBonoT.IMain> = new MatTableDataSource([]);
 @ViewChild('pagMain', {static: true}) pagMain: MatPaginator;

 ExpandedDC: string[] = [ 'position', 'sNombres', 'sCodPlla', 'sDscTipo', 'sDocumento', 'sCiudad', 'nNeto', 'nBruto' ];
 ExpandedDS: MatTableDataSource<nsBonoT.IExpanded> = new MatTableDataSource([]);
 @ViewChild('pagExpanded', {static: false}) pagExpanded: MatPaginator;
 @ViewChild('mtExpanded', {static: false}) mtExpanded: MatTable<nsBonoT.IExpanded>;
 aPerso: Array<nsBonoT.IPerso>;

 aBackup: any;

 // FormGroup
 fgDevengue: FormGroup;
 fgInfoUser: FormGroup;
 fgMain: FormGroup;
 fgBonoT: FormGroup;
 fgSearch: FormGroup;
 fgPerso: FormGroup;
 fgInfoPerso: FormGroup;
 fgFilter: FormGroup;
//  fgResp: FormGroup;

 // FormControl
 fcPartida: FormControl = new FormControl();

 // Array
 aCentroCosto: nsBonoT.ICentroCosto[] = [];
 aPersonal: nsBonoT.ITeamResp[] = [];
 aPlanilla: nsBonoT.IPlanilla[] = [];

 aSaldoCC: nsBonoT.ISaldoCC[] = [];
 aGastoCC: nsBonoT.IGastoCC[] = [];

 // AutoComplete
 foCentroCosto: Observable<any[]>;
 foPersonal: Observable<any[]>;
 saPersonal = false;

 //#endregion


  constructor(public service: KpiiService, @Inject('BASE_URL') baseUrl: string,
  private fb: FormBuilder, private spi: NgxSpinnerService,
  private _snackBar: MatSnackBar, private _modalService: NgbModal) {

    // SERVICE GET && POST
    this.url = baseUrl;

    this.new_fgDevengue();
    this.new_fgInfoUser();
    this.new_fgMain();
    this.new_fgBonoT();
    this.new_fgInfoPerso();
    // this.new_fgResp();


   }

  //#region FormGroup

  new_fgDevengue() {
    this.fgDevengue = this.fb.group({
      nIdDevengue: 0,
      nEjercicio: 0,
      nMes: 0
    });
  }

  new_fgInfoUser() {
    this.fgInfoUser = this.fb.group({
      nIdPersonal: 0,
      sNombres: '',
      sTipo: '',
      sDocumento: '',
    });
  }

  new_fgMain() {
    this.fgMain = this.fb.group({
      nIdCliente: 0,
      sCliente: '',
      sCentroCosto: [{ value: '', disabled: true }],
      dFecha: null,
      nIdEstado: 0,
      sNombres: ''
    });

    this.foCentroCosto = this.fgMain.controls['sCentroCosto'].valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 1))
      );

    this.fgMain.valueChanges.subscribe( value => {
      const filter = {...value, name: value.sNombres.trim().toLowerCase()} as string;
      this.MainDS.filter = filter;

      if (this.MainDS.paginator) {
        this.MainDS.paginator.firstPage();
      }

      this.expandedMore = null;

    });

  }

  new_fgBonoT() {
    this.fgBonoT = this.fb.group({
      T1_nIdBonoT: [ { value: null, disabled: true }, [ Validators. required ] ],
      T1_nIdCentroCosto: [ { value: 0, disabled: true }, [ Validators. required ] ],
      nCentroCosto: [ { value: '', disabled: true } ],
      sCentroCosto: [ { value: '', disabled: true } ],
      sCliente: [ { value: '', disabled: true } ],
      T1_nIdPartida: [ { value: 0, disabled: true }, [ Validators. required ] ],
      T1_nIdResp: [ 0, [ Validators. required ] ],
      sResp: [ { value: '', disabled: true } ],
      T1_nIdPlla: [ 0, [ Validators. required ] ],
      sPlla: [ { value: '', disabled: true } ],
      T1_nIdDevengue: [ { value: 0, disabled: true } ],
      T1_dFecha: [ { value: null, disabled: true }, [ Validators. required ] ],
      T1_nIdEstado: [ 0, [ Validators. required ] ],
      sEstado: [ { value: '', disabled: true } ],
      T1_sFileSustento: [ { value: null, disabled: true} ]
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


  get getInfoUser() { return this.fgInfoUser.controls; }
  get getMain() { return this.fgMain.controls; }
  get getSearch() { return this.fgSearch.controls; }
  get getPerso() { return this.fgPerso.controls; }
  get getInfoPerso() { return this.fgInfoPerso.controls; }
  get getFilter() { return this.fgFilter.controls; }
  // get getResp() { return this.fgResp.controls; }

  //#endregion

  //#region Combobox

  async fnGetEstado () {
    const param = [];
    param.push('0¡nEleCodDad!2192');

    await this.service._loadSP( 2, param, this.url).then( (value: any[]) => {
      this.cboEstado = value;
    });
  }

  ChangeCliente(pushParam: number) {
    const cboCentroCosto = new Array();
    this.fgMain.controls['sCentroCosto'].setValue('');
    this.fgMain.controls['sCentroCosto'].disable();

    if (pushParam !== undefined) {
      this.cboCentroCosto.filter( x => {
        return x.nIdCliente === pushParam;
      }).forEach( x => {
        cboCentroCosto.push(x);
      });

      this.aCentroCosto = cboCentroCosto;
      this.fgMain.controls['sCentroCosto'].enable();
    }
  }

  //#endregion

  //#region General

  fnGetParam (kControls: { [key: string]: AbstractControl }, bDirty?: boolean) {

    let sParam = '';

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

          case 'L':
            cTable = control.substring(0, index);
            cColum = control.substring(index + 1 , control.length);
            this.aParaml.push(cTable + '¡' + cColum + '!');

            const lControl = kControls[control] as FormArray;

            // Recorremos el grupo de elementos del FormArray
            Object.values ( lControl.controls ).forEach( (gcontrol: FormGroup) => {

              sParam = '';

              let count = 0;

              Object.keys ( gcontrol.controls ).forEach( subControl => {

                if ( subControl.substring(0, 1) === 'A' ) {

                  const csControl = gcontrol.controls[subControl];

                  if ( csControl.value !== null && csControl.value !== undefined ) {

                    Object.keys ( csControl.value ).forEach( eSub => {
                      const iSub = eSub.indexOf('_');
                      if ( iSub > 0 ) {
                        count = count + 1;

                        cColum = eSub.substring(0, iSub);
                        cValue = csControl.value[eSub];
                        sParam = sParam + cTable + '¡' + cColum + '!' + cValue + '-';
                      }
                    });

                  }

                } else {
                  if ( subControl.indexOf('_') < 0 ) {

                    cValue = gcontrol.controls[subControl].value;
                    if ( cValue !== '' && cValue.toString() !== '0' ) {
                      count = count + 1;
                      sParam = sParam + cTable + '¡' + subControl + '!' + cValue + '-';
                    }
                  }
                }

              } );

              sParam = sParam.substring(0, sParam.length - 1);

              if ( count > 1 ) {
                this.aParaml.push(sParam);
              }
            });
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
    }
  }

  async clickFab(opc: number, index: number) {
    const self = this;
    const nIdBonoT = this.fgBonoT.controls['T1_nIdBonoT'].value;

    switch (opc) {
      // Fab Main
      case 1:
        switch (index) {
          // Cambiar responsable
          case 0:
            this.showModal(3);
            break;
          case 1:
            const aPlanilla = this.aPlanilla.filter( x => x.sCodPlla === '2' );
            this.fgBonoT.controls['T1_nIdPlla'].setValue(aPlanilla[0].nIdPlla);
            this.fgBonoT.controls['sPlla'].setValue(aPlanilla[0].sDesc);
            this.showModal(1);
            break;
        }
        break;

      // Fab Incentivo ( New 1 )

    }
  }

  openModal(name: string , fgDevengue: any, fgBonoT: any, aPersonal: any, aSaldoCC: any , 
    aGastoCC: any , cboCentroCosto: any, nIdEstado: any, BonoTrimetralDS: any, aVisualizar: any) {
    switch (name) {
      case 'incentivo':
        this.ngbModalOptions.size = 'xl';
        break;
        case 'responsable':
          this.ngbModalOptions.size = 'l';
          break;
    }

    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);
    const obj = new Object();
    switch (name) {
      case 'responsable':
        const uid_modal = 0;
        obj['uid_modal'] = uid_modal;
        modalRef.componentInstance.fromParent = obj;
        break;
        case 'incentivo':
        obj['fgDevengue'] = fgDevengue;
        obj['fgBonoT'] = fgBonoT;
        obj['aPersonal'] = aPersonal;
        obj['aSaldoCC'] = aSaldoCC;
        obj['aGastoCC'] = aGastoCC;
        obj['cboCentroCosto'] = cboCentroCosto;
        obj['nIdEstado'] = nIdEstado;
        obj['BonoTrimetralDS'] = BonoTrimetralDS;
        obj['aVisualizar'] = aVisualizar;
        modalRef.componentInstance.fromParent = obj;
          break;
    }

    modalRef.result.then((result) => {

      switch (result.modal) {
        case 'new':
          if (result.value === 'loadAgain') {
            const nIdResp = this.fgInfoUser.controls['nIdPersonal'].value;
             this.loadMain(nIdResp);
          }
          break;

        case 'view':
          break;
      }

    }, (reason) => {});

  }

  async showModal(opc: number, pushParam?: any, index?: number) {
    const self = this;

    const nIdResp = this.fgInfoUser.controls['nIdPersonal'].value;
    const sResp = this.fgInfoUser.controls['sNombres'].value;

    this.fgBonoT.controls['T1_nIdResp'].setValue(nIdResp);
    this.fgBonoT.controls['sResp'].setValue(sResp);

    switch (opc) {
      // Main
      case 1:
        const param = [];

        // Usuario
        const user = localStorage.getItem('currentUser');
        const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

        Swal.fire({
          title: 'Bono Trimestral [Operaciones]',
          text: 'Ingresar el N° del centro de costo en donde se cargará el Bono Trimestral.',
          input: 'text',
          inputPlaceholder: 'Escribir centro de costo aquí...',
          showCancelButton: true,
          confirmButtonColor: '#ff4081',
          confirmButtonText: 'Aceptar',
          cancelButtonText: 'Cancelar',
          allowOutsideClick: false,
          inputValidator: nIdCentroCosto => {
              if (nIdCentroCosto === undefined || nIdCentroCosto === '') {
                return 'Ingresar centro de costo';
              }
          }
        })
        .then( async resultado => {
          if (resultado.isConfirmed) {

            this.pbMain = true;

            // Validar centro de costo
            let lError = false;
            lError = await this.loadCentroCosto(resultado.value as string);
            const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
            lError  = await this.Validaciones(nIdEmp , resultado.value as string);
            if (lError) {
              return;
            }
            const nIdCentroCosto = this.fgBonoT.controls['T1_nIdCentroCosto'].value;
            await this.ResponsablesPermitidos(nIdCentroCosto);
            const cant =  this.listaPermitidos.filter(x => x.nCodUser === parseInt(this.nIdUser.toString(),  10) ).length;
            if (cant === 0) {
              Swal.fire(
                'Sin acceso al centro de costo.',
                'Responsable no permitido en el Centro de Costo.',
                'info'
              );
              // this._snackBar.open('Responsable no permitido en el Centro de Costo.', 'Cerrar', {
              //   horizontalPosition: 'right',
              //   verticalPosition: 'top',
              //   duration: 2500,
              // });
              this.pbMain = false;
              return;
            }

            // if (lError) {
            //   this._snackBar.open('N° de centro de costo inválido.', 'Cerrar', {
            //     horizontalPosition: 'right',
            //     verticalPosition: 'top',
            //     duration: 2500
            //   });
            //   this.pbMain = false;
            //   return;
            // }

            lError = await this.saldoCentroCosto(nIdCentroCosto);
            if (lError) {
              Swal.fire(
                'N° de centro de costo sin saldo para incentivos.',
                '',
                'info'
              );
              // this._snackBar.open('N° de centro de costo sin saldo para incentivos.', 'Cerrar', {
              //   horizontalPosition: 'right',
              //   verticalPosition: 'top',
              //   duration: 2500
              // });
              this.pbMain = false;
              return;
            }

            await this.gastoCentroCosto(nIdCentroCosto);

            // Cargamos equipo de trabajo
            lError = await this.loadTeamResp(1, nIdResp as number);
            if (lError) {
              // this._snackBar.open('El responsable no cuenta con personal a su cargo.', 'Cerrar', {
              //   horizontalPosition: 'right',
              //   verticalPosition: 'top',
              //   duration: 2500
              // });
              this.pbMain = false;
              return;
            }


            this.fgBonoT.controls['T1_nIdPartida'].setValue(this.fcPartida.value);

            const nEjercicio = this.fgDevengue.controls['nEjercicio'].value as number;
            const nMes = this.fgDevengue.controls['nMes'].value as number;
            const sEjercicio = nEjercicio.toString();
            let sMes = nMes.toString();

            sMes = ( sMes.length === 1 ) ? '0' + sMes : sMes;

            const nIdDevengue = this.fgDevengue.controls['nIdDevengue'].value;
            const sDate = sMes + '/01/' + sEjercicio;
            const dFecha = moment(sDate,'MM/DD/YYYY').toDate();

            this.fgBonoT.controls['T1_nIdDevengue'].setValue(nIdDevengue);
            this.fgBonoT.controls['T1_dFecha'].setValue(dFecha);
            this.fgBonoT.controls['sEstado'].setValue('Temporal');

            this.toggleIncentivo = 2;
            this.mIncentivo = 1;
            // this.fgSearch.controls['sNombres'].enable();
            this.openModal('incentivo', this.fgDevengue, this.fgBonoT, this.aPersonal,
            this.aSaldoCC, this.aGastoCC, this.cboCentroCosto, 0, 0, 0);
            this.pbMain = false;

          }
        });
        break;

      case 2:
        this.pbMain = true;

        const rElement = pushParam as nsBonoT.IMain;

        this.fgBonoT.controls['T1_nIdBonoT'].setValue(rElement.nIdBonoT);
        this.fgBonoT.controls['T1_nIdCentroCosto'].setValue(rElement.nIdCentroCosto);
        this.fgBonoT.controls['nCentroCosto'].setValue(rElement.nCentroCosto);
        this.fgBonoT.controls['sCentroCosto'].setValue(rElement.sCentroCosto);
        this.fgBonoT.controls['sCliente'].setValue(rElement.sCliente);
        this.fgBonoT.controls['T1_nIdPartida'].setValue(rElement.nIdPartida);
        this.fgBonoT.controls['T1_nIdDevengue'].setValue(rElement.nIdDevengue);
        this.fgBonoT.controls['T1_dFecha'].setValue(rElement.dFecha);
        this.fgBonoT.controls['T1_nIdEstado'].setValue(rElement.nIdEstado);
        this.fgBonoT.controls['sEstado'].setValue(rElement.sEstado);
        this.fgBonoT.controls['T1_nIdPlla'].setValue(rElement.nIdPlla);
        this.fgBonoT.controls['sPlla'].setValue(rElement.sPlla);
        this.fgBonoT.controls['T1_sFileSustento'].setValue(rElement.sFileSustento);

        await this.loadTeamResp(1, nIdResp as number);
        await this.loadIncentivo(rElement.nIdBonoT);

        // Backup
        this.aBackup = JSON.stringify(this.BonoTrimetralDS.data);

        this.pbMain = false;

        this.toggleIncentivo = 4;
        this.mIncentivo = 2;

        const nIdEstado = rElement.nIdEstado;

        this.openModal('incentivo', this.fgDevengue, this.fgBonoT, this.aPersonal,
        this.aSaldoCC, this.aGastoCC, this.cboCentroCosto, nIdEstado, this.BonoTrimetralDS , 1);
        this.pbMain = false;
        break;
      case 3:
          this.openModal('responsable', 0, 0, 0, 0, 0, 0, 0, 0, 0);
          break;
    }
  }

  hideModal(modal: string, opc?: number) {

    const self = this;
    let nToogle: number;
    let nTada: number;

    switch (modal) {

      case '#ModalSustento':
        nToogle = 4;
        nTada = 2;
        break;

    }

    this.onToggleFab(nToogle, 0);

    ( function($) {
      $(modal).modal('hide');
      $(modal).on('hidden.bs.modal', function () {
        self.animate(nTada);
      });
    })(jQuery);
  }

  async cleanModal(opc: number) {
    switch (opc) {
      case 1:
        if ( this.nCrud !== 0 ) {

          this.fgMain.patchValue({
            nIdCliente: 0,
            sCliente: '',
            CentroCosto: [{ value: undefined, disabled: true }],
            sCentroCosto: '',
            dFecha: null,
            nIdEstado: 0,
            sNombres: ''
          });

          const nIdResp = this.fgInfoUser.controls['nIdPersonal'].value;
          await this.loadMain(nIdResp);
        }
        this.hideModal('#ModalIncentivo');

        this.fgBonoT.reset();
        this.aPersonal = [];
        this.fgSearch.reset();
        this.fgPerso.reset();
        this.fgInfoPerso.reset();

        this.fgSearch.controls['sNombres'].disable();
        this.fgPerso.controls['nNeto'].setValue(0);
        this.fgPerso.controls['nNeto'].disable();
        this.fgInfoPerso.controls['sCodPlla'].setValue('?');

        this.fgFilter.reset();
        this.aBackup = [];

        this.mIncentivo = 0;
        // this.fbView.forEach( x => { x.dis = false; });

        this.nCrud = 0;
        this.fileSustento = undefined;
        break;

      case 2:
        this.getSearch.sNombres.patchValue(undefined);
        this.getFilter.sNombres.patchValue('');

        this.aPersonal.forEach( x => x.nStat = 0 );

        this.abIncentivo = [];
        this.delay(250).then(any => {
          // this.abIncentivo = this.fbView;
          this.tsIncentivo = 'active';
        });

        this.toggleIncentivo = 4;
        this.mIncentivo = 2;
        this.fgSearch.controls['sNombres'].disable();

        break;
    }
  }

  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms)).then();
  }

  //#endregion

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_main');
    await this.fnGetEstado();

    const user = localStorage.getItem('currentUser');
    const uid = JSON.parse(window.atob(user.split('.')[1])).uid;
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
    const nIdPais = JSON.parse(localStorage.getItem('Pais'));

    let aInfoUser: Array<nsBonoT.IInfoUser>;

    const param = [];
    param.push( '0¡nCodUser!' + uid + '-' + '0¡nIdEmp!' + nIdEmp );
    param.push( '2¡nIdEstado!2-0¡nIdEmp!' + nIdEmp + '-0¡nDadTipEle!135' );
    param.push( '6¡sCod!6002' );
    param.push( '0¡nIdPais!' + nIdPais );

    await this.service._loadSP( 1, param, this.url).then( (value: any[]) => {
      Object.values ( value ).forEach( (lista: Array<any>, iLista: number) => {
        switch (iLista) {

          // Info User
          case 0:
            aInfoUser = lista as Array<nsBonoT.IInfoUser>;

            this.fgInfoUser.patchValue({
              nIdPersonal: aInfoUser[0].nIdPersonal,
              sNombres: aInfoUser[0].sNombres,
              sTipo: aInfoUser[0].sTipo,
              sDocumento: aInfoUser[0].sDocumento,
            });
            break;

          // Devengue
          case 1:
            const aDevengue = lista as Array<nsBonoT.IDevengue>;

            this.fgDevengue.patchValue({
              nIdDevengue: aDevengue[0].nIdDevengue,
              nEjercicio: aDevengue[0].nEjercicio,
              nMes: aDevengue[0].nMes
            });
            break;

          // Planilla
          case 2:
            this.aPlanilla = lista as Array<nsBonoT.IPlanilla>;
            break;

          // Partida
          case 3:
            this.fcPartida.setValue(lista[0].nIdPartida);
            break;
        }
      });
    });

    if (aInfoUser.length > 0) {
      const nIdResp = this.fgInfoUser.controls['nIdPersonal'].value;
      await this.loadMain(nIdResp);
    } else {
      this._snackBar.open('Usuario no cuenta con relación de personal.', 'Cerrar', {
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
    }

    this.spi.hide('spi_main');

    this.animate(1);
  }

  //#region load

  async loadMain(nIdResp: number) {
    const param = [];
    param.push('0¡nIdResp!' + nIdResp + '-0¡B.nIdResp!' + nIdResp);

    await this.service._loadSP( 3, param, this.url).then( (value: any[]) => {
      Object.values ( value ).forEach( (lista: Array<any>, iLista: number) => {
        switch (iLista) {

          // Lista Main
          case 0:
            const aMain = lista as Array<nsBonoT.IMain>;

            this.MainDS = new MatTableDataSource(aMain);
            this.MainDS.paginator = this.pagMain;
            this.MainDS.filterPredicate = function(data, filter: string): boolean {
              return data.sCentroCosto.trim().toLowerCase().includes(filter);
            };

            this.MainDS.filterPredicate = ((data: nsBonoT.IMain, filter: any ) => {
              const a = !filter.nIdCliente || data.nIdCliente === filter.nIdCliente;
              const b = !filter.sCentroCosto || data.sCentroCosto.trim().toLowerCase().includes(filter.sCentroCosto.trim().toLowerCase());
              const c = !filter.dFecha || moment(filter.dFecha).format('YYYYMM') === moment(data.dFecha).format('YYYYMM');
              const d = !filter.nIdEstado || data.nIdEstado === filter.nIdEstado;
              const e = this.cantPerso(data.nIdBonoT) > 0;
              return a && b && c && d && e;
            }) as (PeriodicElement, string) => boolean;

            const aCliente = [];
            const aCentroCosto = [];
            aMain.forEach(x => {
              aCliente.push({
                nIdCliente: x.nIdCliente,
                sCliente: x.sCliente
              });

              aCentroCosto.push({
                nIdCentroCosto: x.nIdCentroCosto,
                sCentroCosto: x.sCentroCosto,
                nIdCliente: x.nIdCliente,
                sCliente: x.sCliente
              });
            });

            this.cboCliente = aCliente.filter(((data, index, array) => array.map(x => x.nIdCliente).indexOf(data.nIdCliente) === index));
            // tslint:disable-next-line: max-line-length
            this.cboCentroCosto = aCentroCosto.filter(((data, index, array) => array.map(x => x.nIdCentroCosto).indexOf(data.nIdCentroCosto) === index));
            break;

          // Lista Expanded
          case 1:
            this.aPerso = lista as Array<nsBonoT.IPerso>;
            break;
        }
      });
    });
  }

  async loadCentroCosto(sCodCC: string) {
    let bReturn = true;

    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
    param.push('0¡nIdEmp!' + nIdEmp);
    param.push('6¡sCodCC!' + sCodCC);

    await this.service._loadSP( 4, param, this.url).then( (value: nsBonoT.ICentroCosto[]) => {
      if (value.length > 0) {

        this.fgBonoT.controls['T1_nIdCentroCosto'].setValue(value[0].nIdCentroCosto);
        this.fgBonoT.controls['nCentroCosto'].setValue(sCodCC);
        this.fgBonoT.controls['sCentroCosto'].setValue(value[0].sCentroCosto);
        this.fgBonoT.controls['sCliente'].setValue(value[0].sCliente);

        bReturn = false;
      }
    });

    return bReturn;
  }

  async saldoCentroCosto(nIdCentroCosto) {
    let bReturn = true;

    const param = [];
    param.push('0¡nIdCentroCosto!' + nIdCentroCosto);

    await this.service._loadSP( 8, param, this.url).then( (value: nsBonoT.ISaldoCC[]) => {
      if (value.length > 0) {
        this.aSaldoCC = value;
        bReturn = false;
      }
    });

    return bReturn;
  }

  async gastoCentroCosto(nIdCentroCosto) {
    const param = [];
    param.push('0¡nIdCentroCosto!' + nIdCentroCosto);

    await this.service._loadSP( 9, param, this.url).then( (value: nsBonoT.IGastoCC[]) => {
      if (value.length > 0) {
        this.aGastoCC = value;
      }
    });
  }

  async loadTeamResp(opc: number, nIdResp: number) {
    let bReturn = true;

    let nEjercicio: number;
    let nMes: number;

    switch (opc) {
      case 1:
        nEjercicio = this.fgDevengue.controls['nEjercicio'].value as number;
        nMes = this.fgDevengue.controls['nMes'].value as number;
        break;

      case 2:
        const dFecha = this.fgBonoT.controls['T1_dFecha'].value as Date;
        nEjercicio = moment(dFecha).year();
        nMes = Number( moment(dFecha).format('MM') );
        break;
    }

    const param = [];
    const sEjercicio = nEjercicio.toString();
    const sMes = nMes.toString();
    const sEjMes = sEjercicio + ( (sMes.length === 1) ? '0' + sMes : sMes );
    // param.push('10¡dFecha!' + sEjMes + '-10¡dFecha!' + sEjMes + '|0¡nIdResp!' + nIdResp);
    // sp_KpiBonoT
    // await this.service._loadSP( 5, param, this.url).then( (value: nsBonoT.ITeamResp[]) => {
    //   if (value.length > 0) {
    //     this.aPersonal = value;
    //     bReturn = false;
    //   }
    // });

    await this.service._loadPersonal(nIdResp, sEjMes).then((response: any) => {
      if (response !== undefined) {
        if (response.status === 200) {
          this.aPersonal = response.body.response.data;
          bReturn = false;
        }
      }
    });
    if (!bReturn) {
      if (this.aPersonal.filter(x => x.sCodPlla === '1' || x.sCodPlla === '2' || x.sCodPlla === '7' ).length > 0 ) {
        this.aPersonal = this.aPersonal.filter(x => x.sCodPlla === '1' || x.sCodPlla === '2' || x.sCodPlla === '7' );
        bReturn = false;
      } else {
        Swal.fire(
          'Personal fuera de planilla asignada.',
          'El personal debe ser de planilla 1,2 o 7.',
          'info'
        );
        bReturn = true;
      }
    } else {
      Swal.fire(
        'Sin personal a cargo.',
        'El responable no tienen ningún personal a su cargo.',
        'info'
      );
      bReturn = true;
    }

    return bReturn;
  }

  async loadIncentivo(nIdBonoT: number) {
    const param = [];
    param.push('0¡A.nIdBonoT!' + nIdBonoT);
    await this.service._loadSP( 7, param, this.url).then( (value: nsBonoT.IBonoT[]) => {
      if (value.length > 0) {

        this.BonoTrimetralDS = new MatTableDataSource(value);

        this.BonoTrimetralDS.filterPredicate = function(data, filter: string): boolean {
          return data.sNombres.trim().toLowerCase().includes(filter) || data.sDocumento.trim().toLowerCase().includes(filter);
        };

        this.BonoTrimetralDS.filterPredicate = ((data: nsBonoT.IBonoT, filter: any ) => {
          // tslint:disable-next-line: max-line-length
          const a = !filter.sNombres || ( data.sNombres.toLowerCase().includes(filter.sNombres.toLowerCase()) || data.sDocumento.toLowerCase().includes(filter.sNombres.toLowerCase()) );
          return a;
        }) as (PeriodicElement: any, string: any) => boolean;
      }
    });
  }

  cantPerso(nIdBonoT: number) {
    const sText = this.fgMain.controls['sNombres'].value as string;
    const aFilter = this.aPerso.filter( x => {
      const a = x.nIdBonoT === nIdBonoT;
      // tslint:disable-next-line: max-line-length
      const b = !sText || ( x.sNombres.toLowerCase().includes(sText.toLowerCase()) || x.sDocumento.toLowerCase().includes(sText.toLowerCase()) );
      return a && b;
    });

    return aFilter.length;
  }

  async clickExpanded(row: nsBonoT.IMain) {

    if ( this.expandedMore === row ) {
      // Limpiar
      this.expandedMore = null;
      this.ExpandedDS = new MatTableDataSource([]);

      if (this.ExpandedDS.paginator) {
        this.ExpandedDS.paginator.firstPage();
      }

    } else {

      const param = [];
      param.push('0¡A.nIdBonoT!' + row.nIdBonoT);

      await this.service._loadSP( 6, param, this.url).then( (value: nsBonoT.IExpanded[]) => {

        let aFilter = value;

        if ( this.fgMain.controls['sNombres'].value !== '' ) {
          let sFilter = this.fgMain.controls['sNombres'].value as string;
          sFilter = sFilter.trim().toLowerCase();
          aFilter = value.filter( x => {
            return  x.sNombres.trim().toLowerCase().includes(sFilter) || x.sDocumento.trim().toLowerCase().includes(sFilter);
          });
        }

        this.ExpandedDS = new MatTableDataSource(aFilter);
        this.ExpandedDS.paginator = this.pagExpanded;
      });

      this.expandedMore = row;
      this.mtExpanded.renderRows();
    }

  }

  async Validaciones(nIdEmp: number , sCodCC: string) {
    let bReturn = true;

    await this.service._ValidarExisteCC(nIdEmp, sCodCC).then((response: any) => {
      if (response !== undefined ) {
        if (response.status === 200) {
          bReturn = false;
        } else {
          Swal.fire(
            'Centro de costo inválido',
            'Verificar si el N° de centro de costo existe.',
            'info'
          );
          // this._snackBar.open('N° de centro de costo inválido.', 'Cerrar', {
          //   horizontalPosition: 'right',
          //   verticalPosition: 'top',
          //   duration: 2500
          // });
          this.pbMain = false;
        }
      } else {
        Swal.fire(
          'Centro de costo inválido',
          'Verificar si el N° de centro de costo existe.',
          'info'
        );
        // this._snackBar.open('N° de centro de costo inválido.', 'Cerrar', {
        //   horizontalPosition: 'right',
        //   verticalPosition: 'top',
        //   duration: 2500
        // });
        this.pbMain = false;
        return;
      }
    });
    if (!bReturn) {
      await this.service._ValidarEstadoCC(nIdEmp, sCodCC).then((response: any) => {
        if (response !== undefined ) {
          if (response.status === 200) {
            bReturn = false;
          } else {
            bReturn = true;
            Swal.fire(
              'Estado incorrecto.',
              'Verificar estado del Centro de Costo.',
              'info'
            );
            // this._snackBar.open('Verificar estado del Centro de Costo.', 'Cerrar', {
            //   horizontalPosition: 'right',
            //   verticalPosition: 'top',
            //   duration: 2500
            // });
            this.pbMain = false;
          }
        } else {
          bReturn = true;
          Swal.fire(
            'Estado incorrecto.',
            'Verificar estado del Centro de Costo.',
            'info'
          );
          // this._snackBar.open('Verificar estado del Centro de Costo.', 'Cerrar', {
          //   horizontalPosition: 'right',
          //   verticalPosition: 'top',
          //   duration: 2500
          // });
          this.pbMain = false;
        }
      });
    }
    if (!bReturn) {
    await this.service._ValidarTipoCC(nIdEmp, sCodCC).then((response: any) => {
      if (response !== undefined ) {
        if (response.status === 200) {
          bReturn = false;
        } else {
          bReturn = true;
          Swal.fire(
            'Tipo incorrecto.',
            'Verificar tipo del centro de costo.',
            'info'
          );
          // this._snackBar.open('Verificar tipo del centro de costo.', 'Cerrar', {
          //   horizontalPosition: 'right',
          //   verticalPosition: 'top',
          //   duration: 2500
          // });
          this.pbMain = false;
          return;
        }
      } else {
        bReturn = true;
        Swal.fire(
          'Tipo incorrecto.',
          'Verificar tipo del centro de costo.',
          'info'
        );
        // this._snackBar.open('Verificar tipo del centro de costo.', 'Cerrar', {
        //   horizontalPosition: 'right',
        //   verticalPosition: 'top',
        //   duration: 2500
        // });
        this.pbMain = false;
        return;
      }
    });
    }
    if (!bReturn) {
    await this.service._ValidarAprobacionCC(nIdEmp, sCodCC).then((response: any) => {
      if (response !== undefined ) {
        if (response.status === 200) {
          const value = response.body.response.data;
        this.fgBonoT.controls['T1_nIdCentroCosto'].setValue(value[0].nIdCentroCosto);
        this.fgBonoT.controls['nCentroCosto'].setValue(sCodCC);
        this.fgBonoT.controls['sCentroCosto'].setValue(value[0].sCentroCosto);
        this.fgBonoT.controls['sCliente'].setValue(value[0].sCliente);
        bReturn = false;
        } else {
          bReturn = true;
          Swal.fire(
            'Falta approbación.',
            'Verificar approbación del centro de costo.',
            'info'
          );
          // this._snackBar.open('Verificar approbación del centro de costo.', 'Cerrar', {
          //   horizontalPosition: 'right',
          //   verticalPosition: 'top',
          //   duration: 2500
          // });
          this.pbMain = false;
          return;
        }
      } else {
        bReturn = true;
        Swal.fire(
          'Falta approbación.',
          'Verificar approbación del centro de costo.',
          'info'
        );
        // this._snackBar.open('Verificar approbación del centro de costo.', 'Cerrar', {
        //   horizontalPosition: 'right',
        //   verticalPosition: 'top',
        //   duration: 2500
        // });
        this.pbMain = false;
        return;
      }
    });
    }
    return bReturn;
  }

  async ResponsablesPermitidos(nIdCentroCosto: number) {
    await this.service._GetPersonalCC( nIdCentroCosto ).then((response: any) => {
      if (response.status === 200) {
        this.listaPermitidos = response.body.response.data;
      }
    });
  }



  checkCC(nIdSucursal: number, nImporte: number, nIdPersonal: number): boolean {
    let bLog = true;
    let nSaldo: number;

    // Saldo CC
    nSaldo = this.aSaldoCC.filter( x => x.nIdSucursal === nIdSucursal )[0].nSaldo;

    // Gasto previo
    const nIdBonoT = this.fgBonoT.controls['T1_nIdBonoT'].value;
    let nGasto = 0;
    this.aGastoCC.filter( x => {
      const a = x.nIdSucursal === nIdSucursal;
      const b = x.nIdBonoT !== nIdBonoT;
      return a && b;
    }).forEach( x => nGasto = nGasto + x.nGasto );
    nSaldo = nSaldo - nGasto;

    // Gasto actual
    let nSuma = 0;
    const aTable = this.BonoTrimetralDS.data;
    aTable.filter( x => {
      const a = x.nIdPersonal !== nIdPersonal;
      const b = x.nIdSucursal === nIdSucursal;
      return a && b;
    }).forEach( x => nSuma = nSuma + x.nBruto);
    nSaldo = nSaldo - nSuma;

    // Saldo restante - Importe
    if ( (nSaldo - nImporte) < 0 ) {
      bLog = false;
    }
    return bLog;
  }
  async clickResp(element: nsBonoT.IListaResp) {

    const nIdResp = this.fgInfoUser.controls['nIdPersonal'].value;

    if ( nIdResp === element.nIdResp ) {

      this._snackBar.open('Responsable actualmente en pantalla.', 'Cerrar', {
        horizontalPosition: 'right',
        verticalPosition: 'top',
        duration: 2500
      });

    } else {

      await this.loadMain(element.nIdResp);

      this.fgInfoUser.patchValue({
        nIdPersonal: element.nIdResp,
        sNombres: element.sNombres,
        sTipo: element.sTipo,
        sDocumento: element.sDocumento,
      });

      this.clickFab(7, -1);
    }
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

  uploadFile(event) {
    if (event.target.files[0]) {

      this.abIncentivo = [];
      this.toggleIncentivo = 3;
      this.delay(250).then(any => {
        this.onToggleFab(this.toggleIncentivo, 1);
      });

      this.fileSustento = event.target.files[0];

    }
  }

  async getStringFromFile(fSustento: File) {
    return new Promise<any>( (resolve, reject) => {

      const reader = new FileReader();
      reader.readAsDataURL(fSustento);
      reader.onload = () => {
        resolve(reader.result);
      };

    });
  }

  MomentDate(pushParam: any) {
    moment.locale('es');
    const tDate = moment(pushParam).format('MMMM [del] YYYY');
    return tDate[0].toUpperCase() + tDate.substr(1).toLowerCase();
  }

  mouseOver(opc: number, element: any) {
    switch (opc) {
      case 1:
        if ( this.mIncentivo === 1 ) {
          this.editTable = element;
        }
        break;

      case 2:
        this.selectResp = element;
        break;
    }
  }

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
        case 1:
          aFilter = this.cboCentroCosto.filter( x => x.sCentroCosto.trim().toLowerCase().includes(filterValue) );
          break;

        case 2:
          aFilter = this.aPersonal.filter( x => {
            const a = x.sNombres.trim().toLowerCase().includes(filterValue);
            const b = x.nStat === 0;
            return a && b;
          }).slice(0, 3);
          break;
      }

    }
    return aFilter;
  }

  displayWith(obj?: any): string {
    return obj ? obj.sNombres : '';
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

  animate(nTada: number) {
    switch (nTada) {
      case 1:
        this.tadaMain = 'active';
        break;

      case 2:
        this.tadaIncentivo = 'active';
        break;
    }

    this.delay(1000).then(any => {
      switch (nTada) {
        case 1:
          this.tadaMain = 'inactive';
          break;

        case 2:
          this.tadaIncentivo = 'inactive';
          break;
      }
    });
  }

  //#endregion


}
