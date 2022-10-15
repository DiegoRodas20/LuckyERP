import { ControldService } from '../../Services/controld.service';
import { Component, Inject, OnInit, Type, ViewChild } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { Moment } from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IDescuento, IDetail, IMain } from '../../Model/Icontrold';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepicker } from '@angular/material/datepicker';
import { adminpAnimations } from '../../Animations/adminp.animations';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ControldScannerComponent } from './Modals/controld-scanner/controld-scanner.component';
import { ValidadoresService } from '../../Validators/validadores.service';

// Utilizar javascript [1]
declare var jQuery: any;

interface Iexpanded { _String: string; _DataSource?: MatTableDataSource<any>; _Number: number; }

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

const MODALS: { [name: string]: Type<any> } = {
  scanner: ControldScannerComponent
};

@Component({
  selector: 'app-controld',
  templateUrl: './controld.component.html',
  styleUrls: ['./controld.component.css', './controld.component.scss'],
  providers: [ ControldService ],
  animations: [ adminpAnimations ]
})
export class ControldComponent implements OnInit {

  //#region Variables
  matcher = new MyErrorStateMatcher();
  panelOpenState = true;
  expandedMore: null;

  // Service GET && POST
  url: string;
  aParam = [];

  // Fab
  fbMain = [
    {icon: 'person_search', tool: 'Buscar personal'},
    {​​​​​​​​icon: 'qr_code_scanner', tool: 'Digitalizar'}​​​​​​​​
  ];
  abMain = [];
  tsMain = 'inactive';

  fbDetail = [
    {icon: 'add', tool: 'Nuevo descuento'}
  ];
  abDetail = [];
  tsDetail = 'inactive';

  fbDescuento = [
    {icon: 'save', tool: 'Guardar'},
    {icon: 'cancel', tool: 'Cancelar'}
  ];
  fbDescuento2 = [
    {icon: 'edit', tool: 'Editar'},
    {icon: 'delete', tool: 'Eliminar'},
    {icon: 'print', tool: 'Imprimir'}
  ];
  abDescuento = [];
  tsDescuento = 'inactive';

  // Progress Bar
  pbMain: boolean;
  pbSearch: boolean;
  pbDetail: boolean;
  pbDescuento: boolean;

  // Combobox
  cboPlanilla: any;
  cboCiudad: any;
  cboDirec: any;
  cboArea: any;
  cboMotivo: any;
  aArea = new Array();
  aMotivo = new Array();

  // Mat Table
  MainDC: string[] = [ 'action', 'sNombres', 'sCodPlla', 'sDscTipo', 'sDocumento','sCiudad','sFechaIngreso','sFechaCese' ];
  MainDS: MatTableDataSource<IMain>;
  @ViewChild('pagMain', {static: true}) pagMain: MatPaginator;

  SearchDC: string[] = [ 'action', 'sNombres', 'sCodPlla', 'sTipo', 'sDocumento' ];
  SearchDS: MatTableDataSource<IMain>;
  @ViewChild('pagSearch', {static: true}) pagSearch: MatPaginator;

  DetailDC: string[] = [ 'action', 'sMotivo', 'sDireccion', 'sArea', 'dFechIni', 'dFechFin', 'nImporte', 'sCuotas', 'nSaldo', 'more' ];
  DetailDS: MatTableDataSource<IDetail>;
  @ViewChild('pagDetail', {static: true}) pagDetail: MatPaginator;

  DescuentoDC: string[] = [ 'position', 'dFecha', 'nImporte' ];
  DescuentoDS: MatTableDataSource<IDescuento>;
  @ViewChild('pagDescuento', {static: true}) pagDescuento: MatPaginator;

  ngbModalOptions: NgbModalOptions = {
    size: 'xl',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };

  // FormGroup
  fgMain: FormGroup;
  fgSearch: FormGroup;
  fgDetail: FormGroup;
  fgFilter: FormGroup;
  fgDescuento: FormGroup;

  // Descuento
  countDescuento: number;
  hDescuento: string;
  mDescuento: number;
  bkDescuento: any;

  //#endregion

  constructor(public service: ControldService, @Inject('BASE_URL') baseUrl: string,
              private fb: FormBuilder, private spi: NgxSpinnerService,
              private _snackBar: MatSnackBar, private valid: ValidadoresService, private _modalService: NgbModal,) {

    // SERVICE GET && POST
    this.url = baseUrl;
    this.countDescuento = 0;

    this.new_fgMain();
    this.new_fgSearch();
    this.new_fgDetail();
    this.new_fgFilter();
    this.new_fgDescuento();

  }

  //#region General

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = ( stat === -1 ) ? ( this.abMain.length > 0 ) ? 0 : 1 : stat;
        this.tsMain = ( stat === 0 ) ? 'inactive' : 'active';
        this.abMain = ( stat === 0 ) ? [] : this.fbMain;
        break;

      case 3:
        stat = ( stat === -1 ) ? ( this.abDetail.length > 0 ) ? 0 : 1 : stat;
        this.tsDetail = ( stat === 0 ) ? 'inactive' : 'active';
        this.abDetail = ( stat === 0 ) ? [] : this.fbDetail;
        break;

      case 4:
        if ( stat === -1 ) {
          if (this.abDescuento.length > 0) {
            stat = 0;
          } else {
            stat = ( this.mDescuento === 1 ) ? 1 : 2;
          }
        }

        this.tsDescuento = ( stat === 0 ) ? 'inactive' : 'active2';

        switch (stat) {
          case 0:
            this.abDescuento = [];
            break;
          case 1:
            this.abDescuento = this.fbDescuento;
            break;
          case 2:
            this.abDescuento = this.fbDescuento2;
            break;
        }
        break;

      default:
        break;
    }
  }
  openModal(name: string) {

    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);
  }

  async clickFab(opc: number, index: number) {
    switch (opc) {
      // Fab Main
      case 1:
        switch (index) {
          // Buscar persona
          case 0:
            this.showModal(1);
            break;

          // AD x Area
          case 1:
          this.openModal('scanner');
          break;

          default:
            break;
        }
        break;

      // Search close
      case 2:
        this.cleanModal(1);
        break;

      // Fab Detail
      case 3:
        switch (index) {
          case -1:
            this.cleanModal(2);
            break;

          case 0:
            this.showModal(3, undefined, 1);
            break;
        }
        break;

      // Fab Descuento
      case 4:

        const nIdDescuento = this.fgDescuento.controls['T2_nIdDescuento'].value;

        switch (index) {
          case -1:
            this.cleanModal(3);
            break;

          case 0:
            if (this.mDescuento === 1) {
              this.saveDescuento( (this.hDescuento === 'Nuevo') ? 1 : 2);
            } else {

              const sNombres = this.fgDetail.controls['sNombres'].value;

              Swal.fire({
                title: '¿ Estas seguro de modificar el registro?',
                text: 'El descuento le pertenece a ' + sNombres,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#ff4081',
                confirmButtonText: 'Confirmar !',
                allowOutsideClick: false
              }).then((result) => {
                if (result.isConfirmed) {

                  this.fgDescuento.controls['T1_nIdDireccion'].enable();
                  this.fgDescuento.controls['T1_nIdArea'].enable();
                  this.fgDescuento.controls['T1_nIdMotivo'].enable();
                  this.fgDescuento.controls['T0_nImporte'].enable();
                  this.fgDescuento.controls['T2_nCuota'].enable();
                  this.fgDescuento.controls['T2_dFechIni'].enable();
                  this.fgDescuento.controls['T2_sDescripcion'].enable();

                  this.abDescuento = [];
                  this.delay(250).then(any => {
                    this.abDescuento = this.fbDescuento;
                    this.tsDescuento = 'active2';
                  });

                  this.mDescuento = 1;

                  return;
                }
              });
            }
            break;

          case 1:
            if (this.hDescuento === 'Nuevo') {
              this.cleanModal(3);
            } else {

              if (this.mDescuento === 1) {
                this.mDescuento = 2;
                this.loadDescuento(this.bkDescuento);

                this.abDescuento = [];
                this.delay(250).then(any => {
                  this.abDescuento = this.fbDescuento2;
                  this.tsDescuento = 'inactive';
                });
              } else {

                const sNombres = this.fgDetail.controls['sNombres'].value;
                Swal.fire({
                  title: '¿ Estas seguro de eliminar el registro?',
                  text: 'El descuento le pertenece a ' + sNombres,
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonColor: '#ff4081',
                  confirmButtonText: 'Confirmar !',
                  allowOutsideClick: false
                }).then(async (result) => {
                  if (result.isConfirmed) {

                    this.pbDescuento = true;

                    const nIdAuthDesc = this.fgDescuento.controls['T1_nIdAuthDesc'].value;
                    await this.deleteDescuento(nIdDescuento, nIdAuthDesc);

                    this.pbDescuento = false;
                  }
                });

              }

            }
            break;

          case 2:
            this.pbDescuento = true;

            this.aParam = [];
            const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

            this.aParam.push('0¡nIdDescuento!' + nIdDescuento + '-0¡nIdEmp!' + nIdEmp + '-0¡nIdDocumento!30');
            await this.printDescuento();

            this.pbDescuento = false;
            break;
        }
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

  async showModal(opc: number, pushParam?: any, index?: number) {
    const self = this;

    switch (opc) {
      case 1:
        this.pbMain = true;

        await this.loadSearch();
        ( function($) {
          $('#ModalSearch').modal('show');
          $('#ModalSearch').on('shown.bs.modal', function () {
            self.onToggleFab(1, 0);
          });
        })(jQuery);

        this.pbMain = false;
        break;

      case 2:
        if (index === 1) {
          this.pbMain = true;
        } else {
          this.pbSearch = true;
        }

        await this.loadDetail(pushParam);

        if (index !== 1) {
          this.cleanModal(1);
        }

        ( function($) {
          $('#ModalDetail').modal('show');
          $('#ModalDetail').on('shown.bs.modal', function () {
            self.onToggleFab(3, 1);
            self.panelState(false);
          });
        })(jQuery);

        if (index === 1) {
          this.pbMain = false;
        } else {
          this.pbSearch = false;
        }
        break;

      case 3:
        this.mDescuento = index;
        if (index === 1) {

          this.hDescuento = 'Nuevo';

          this.fgDescuento.controls['T1_nIdDireccion'].enable();
          this.fgDescuento.controls['T1_nIdArea'].enable();
          this.fgDescuento.controls['T1_nIdMotivo'].enable();
          this.fgDescuento.controls['T0_nImporte'].enable();
          this.fgDescuento.controls['T2_nCuota'].enable();
          this.fgDescuento.controls['T2_dFechIni'].enable();
          this.fgDescuento.controls['T2_sDescripcion'].enable();

        } else {

          this.hDescuento = 'Detalle';
          this.loadDescuento(pushParam);
          this.bkDescuento = pushParam;

        }

        ( function($) {
          $('#ModalDetail').modal('hide');
          $('#ModalDescuento').modal('show');
          $('#ModalDescuento').on('shown.bs.modal', function () {
            self.onToggleFab(4, index);
          });
        })(jQuery);
        break;
    }
  }

  async cleanModal(opc: number) {
    const self = this;

    switch (opc) {
      case 1:
        this.hideModal('#ModalSearch');
        this.fgSearch.controls['sNombres'].setValue('');
        this.SearchDS = new MatTableDataSource([]);
        break;

      case 2:
        if (this.countDescuento !== 0) {
          this.fgMain.patchValue({
            sNombres: '',
            sCodPlla: '',
            sCiudad: ''
          });
          await this.loadMain();
          this.countDescuento = 0;
        }

        this.hideModal('#ModalDetail');

        this.fgDetail.reset();
        this.fgFilter.patchValue({
          nDirec: 0,
          nArea: 0,
          nMotivo: 0,
          sDescripcion: '',
          dFecha: null,
          bEstado: 1
        });
        this.DetailDS = new MatTableDataSource([]);
        this.panelState(true);
        break;

      case 3:
        this.hideModal('#ModalDescuento');

        ( function($) {
          $('#ModalDetail').modal('show');
          $('#ModalDetail').on('shown.bs.modal', function () {
            self.onToggleFab(3, 1);
          });
        })(jQuery);

        this.fgDescuento.reset();

        this.fgDescuento.controls['T1_nIdDireccion'].disable();
        this.fgDescuento.controls['T1_nIdArea'].disable();
        this.fgDescuento.controls['T1_nIdMotivo'].disable();
        this.fgDescuento.controls['T0_nImporte'].disable();
        this.fgDescuento.controls['T2_nCuota'].disable();
        this.fgDescuento.controls['T2_dFechIni'].disable();
        this.fgDescuento.controls['T2_sDescripcion'].disable();

        this.mDescuento = 0;
        this.hDescuento = '';
        this.bkDescuento = null;
        break;
    }
  }

  hideModal(modal: string) {
    let nToogle: number;
    switch (modal) {
      case '#ModalSearch':
        nToogle = 0;
        break;

      case '#ModalDetail':
        nToogle = 3;
        break;

      case '#ModalDescuento':
        nToogle = 4;
        break;
    }

    this.onToggleFab(nToogle, 0);

    ( function($) {
      $(modal).modal('hide');
    })(jQuery);
  }

  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms)).then();
  }

  //#endregion

  //#region FormGroup

  new_fgMain() {
    this.fgMain = this.fb.group({
      sNombres: '',
      sCodPlla: '',
      sCiudad: '',
      sTipoCta: ''
    });

    this.fgMain.valueChanges.subscribe(value => {
      const filter = {...value, name: value.sNombres.trim().toLowerCase()} as string;
      this.MainDS.filter = filter;

      if (this.MainDS.paginator) {
        this.MainDS.paginator.firstPage();
      }
    });
  }

  new_fgSearch() {
    this.fgSearch = this.fb.group({
      sNombres: ''
    });

    this.fgSearch.valueChanges.subscribe(value => {
      const filter = {...value, name: value.sNombres.trim().toLowerCase()} as string;
      this.SearchDS.filter = filter;

      if (this.SearchDS.paginator) {
        this.SearchDS.paginator.firstPage();
      }
    });
  }

  new_fgDetail() {
    this.fgDetail = this.fb.group({
      nIdPersonal: 0,
      sNombres: [{ value: '', disabled: true }],
      sCodPlla: [{ value: '', disabled: true }],
      nIdTipoDoc: 0,
      sTipo: [{ value: '', disabled: true }],
      sDocumento: [{ value: '', disabled: true }],
      dFechIni: [{ value: null, disabled: true }],
      dFechFin: [{ value: null, disabled: true }],
      sCiudad: [{ value: '', disabled: true }],

    });
  }

  new_fgFilter() {
    this.fgFilter = this.fb.group({
      nDirec: 0,
      nArea: 0,
      nMotivo: 0,
      sDescripcion: '',
      dFecha: null,
      bEstado: 1
    });

    this.fgFilter.valueChanges.subscribe(value => {
      const filter = {...value, name: value.sDescripcion.trim().toLowerCase()} as string;
      this.DetailDS.filter = filter;

      if (this.DetailDS.paginator) {
        this.DetailDS.paginator.firstPage();
      }
    });
  }

  new_fgDescuento() {
    this.fgDescuento = this.fb.group({
      T1_nIdAuthDesc: 0,
      T1_nIdDireccion: [ { value: 0, disabled: true }, [ Validators.required, this.valid.noSelect ]],
      T1_nIdArea: [ { value: 0, disabled: true }, [ Validators.required, this.valid.noSelect ]],
      T1_nIdMotivo: [ { value: 0, disabled: true }, [ Validators.required, this.valid.noSelect ]],
      T2_nIdDescuento: 0,
      T2_sDescripcion: [ { value: '', disabled: true } ],
      T2_dFechIni: [ { value: null, disabled: true }, [ Validators.required ]],
      dFechFin: [ { value: null, disabled: true }, [ Validators.required ]],
      T2_nCuota: [ { value: 0, disabled: true}, [ Validators.required, this.valid.vMonto, Validators.min(1), Validators.max(12) ] ],
      T0_nImporte: [ { value: 0, disabled: true}, [ Validators.required, this.valid.vMonto ] ]
    });
  }

  get getMain() { return this.fgMain.controls; }
  get getSearch() { return this.fgSearch.controls; }
  get getDetail() { return this.fgDetail.controls; }
  get getFilter() { return this.fgFilter.controls; }
  get getDescuento() { return this.fgDescuento.controls; }

  //#endregion

  //#region Combobox

  async fnGetPlanilla () {
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    param.push('0¡nIdEmp!' + nIdEmp);
    param.push('0¡bEstado!1');

    await this.service._loadSP( 1, param, this.url).then( (value: any[]) => {
      this.cboPlanilla = value;
    });
  }

  async fnGetCiudad () {
    const param = [];
    param.push('0¡nDadTipEle!694');
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡nIdPais!' + sIdPais);
    param.push('0¡bEstado!1');

    await this.service._loadSP( 2, param, this.url).then( (value: any[]) => {
      this.cboCiudad = value;
    });
  }

  async fnGetDirec () {
    const param = [];
    param.push('0¡nDadTipEle!1125');
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡nIdPais!' + sIdPais);
    param.push('0¡bEstado!1');

    await this.service._loadSP( 2, param, this.url).then( (value: any[]) => {
      this.cboDirec = value;
    });
  }

  ChangeDirec(pushParam: string) {
    this.cboArea = new Array();
    if (pushParam !== undefined) {
      this.aArea.filter( x => {
        const a = x.nDadTipEle === pushParam;
        return a;
      }).forEach( x => {
        this.cboArea.push(x);
      });
    }
  }

  async fnGetArea () {
    const param = [];
    param.push('0¡nDadTipEle!1125');
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡nIdPais!' + sIdPais);
    param.push('0¡bEstado!1');

    await this.service._loadSP( 3, param, this.url).then( (value: any[]) => {
      this.aArea = value;
    });
  }

  ChangeArea(pushParam: string) {
    this.cboMotivo = new Array();
    if (pushParam !== undefined) {
      this.aMotivo.filter( x => {
        const a = ( x.nParam === pushParam || x.nParam === 0 );
        return a;
      }).forEach( x => {
        this.cboMotivo.push(x);
      });
    }
  }

  async fnGetMotivo() {
    const param = [];
    param.push('0¡nDadTipEle!1154');
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡nIdPais!' + sIdPais);
    param.push('0¡bEstado!1');

    await this.service._loadSP( 2, param, this.url).then( (value: any[]) => {
      this.aMotivo = value;
    });
  }

  //#endregion

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_main');

    await this.fnGetPlanilla();
    await this.fnGetCiudad();
    await this.fnGetDirec();
    await this.fnGetArea();
    await this.fnGetMotivo();

    await this.loadMain();

    this.spi.hide('spi_main');

  }

  async loadMain() {
    const param = [];
    param.push('9¡A.nIdPersonal![RRHH].[TBL_DESCUENTO] AS A WHERE bEstado = 1');
    await this.service._loadSP( 4, param, this.url).then( (value: IMain[]) => {

      this.MainDS = new MatTableDataSource(value);
      this.MainDS.paginator = this.pagMain;
      this.MainDS.filterPredicate = function(data, filter: string): boolean {
        return data.sNombres.trim().toLowerCase().includes(filter) || data.sDocumento.trim().toLowerCase().includes(filter);
      };

      this.MainDS.filterPredicate = ((data: IMain, filter: any ) => {
        // tslint:disable-next-line: max-line-length
        const a = !filter.sNombres || ( data.sNombres.toLowerCase().includes(filter.sNombres.toLowerCase()) || data.sDocumento.toLowerCase().includes(filter.sNombres.toLowerCase()) );
        const b = !filter.sCodPlla || data.sCodPlla.toLowerCase().includes(filter.sCodPlla);
        const c = !filter.sCiudad || data.sCiudad.toLowerCase().includes(filter.sCiudad.toLowerCase());
        return a && b && c;
      }) as (PeriodicElement, string) => boolean;

    });
  }

  async loadSearch() {
    const param = [];
    await this.service._loadSP( 4, param, this.url).then( (value: IMain[]) => {
      this.SearchDS = new MatTableDataSource(value);
      this.SearchDS.paginator = this.pagSearch;
      this.SearchDS.filterPredicate = function(data, filter: string): boolean {
        return data.sNombres.trim().toLowerCase().includes(filter) || data.sDocumento.trim().toLowerCase().includes(filter);
      };

      this.SearchDS.filterPredicate = ((data: IMain, filter: IMain ) => {
        // tslint:disable-next-line: max-line-length
        const a = !filter.sNombres || ( data.sNombres.toLowerCase().includes(filter.sNombres.toLowerCase()) || data.sDocumento.toLowerCase().includes(filter.sNombres.toLowerCase()) );
        return a;
      }) as (PeriodicElement, string) => boolean;
    });
  }

  async loadDetail(pushParam: IMain) {
    const nIdPersonal = pushParam.nIdPersonal;

    await this.loadDescuentos(nIdPersonal);

    this.fgDetail.patchValue({
      nIdPersonal: nIdPersonal,
      sNombres: pushParam.sNombres,
      nIdTipoDoc: pushParam.nIdTipoDoc,
      sTipo: pushParam.sDscTipo,
      sDocumento: pushParam.sDocumento,
      sCiudad: pushParam.sCiudad,
      dFechIni: pushParam.dFechIni,
      dFechFin: pushParam.dFechFin,
      sCodPlla: pushParam.sCodPlla
    });
  }

  async loadDescuentos(nIdPersonal: number) {
    this.pbDetail = true;

    const param = [];
    param.push('0¡A.nIdPersonal!' + nIdPersonal);
    await this.service._loadSP( 5, param, this.url).then( async (value: IDetail[]) => {

      this.DetailDS = new MatTableDataSource(value);
      this.DetailDS.paginator = this.pagDetail;

      this.DetailDS.filterPredicate = function(data, filter: string): boolean {
        return data.sDescripcion.trim().toLowerCase().includes(filter.toLowerCase());
      };

      this.DetailDS.filterPredicate = ((data: IDetail, filter: any ) => {
        // tslint:disable-next-line: max-line-length
        const a = !filter.sDescripcion || data.sDescripcion.toLowerCase().includes(filter.sDescripcion.toLowerCase());
        const b = !filter.nDirec || ( data.nIdDireccion === filter.nDirec );
        const c = !filter.nArea || ( data.nIdArea === filter.nArea );
        const d = !filter.nMotivo || ( data.nIdMotivo === filter.nMotivo );
        const e = !filter.dFecha || ( moment(data.dFechIni).format('MM/YYYY') === moment(filter.dFecha).format('MM/YYYY') );
        // const f = !filter.bEstado || ( data.bEstado === filter.bEstado );
        const f = !filter.bEstado || ( filter.bEstado === 1 ? data.nSaldo > 0 : data.nSaldo === 0 );
        return a && b && c && d && e && f;
      }) as (PeriodicElement, string) => boolean;

      this.DescuentoDS = new MatTableDataSource([]);

    });

    this.pbDetail = false;
  }

  loadDescuento(aDescuento: any) {
    this.fgDescuento.reset();
    this.fgDescuento.patchValue({
      T1_nIdAuthDesc: aDescuento.nIdAuthDesc,
      T2_nIdDescuento: aDescuento.nIdDescuento,
      T1_nIdDireccion: aDescuento.nIdDireccion,
      T0_nImporte: aDescuento.nImporte,
      T2_nCuota: aDescuento.nCuota,
      T2_dFechIni: aDescuento.dFechIni,
      dFechFin: aDescuento.dFechFin,
      T2_sDescripcion: aDescuento.sDescripcion
    });

    this.cboArea = new Array();
    this.aArea.filter( x => {
      const a = x.nDadTipEle === aDescuento.nIdDireccion;
      return a;
    }).forEach( x => {
      this.cboArea.push(x);
    });

    this.fgDescuento.controls['T1_nIdArea'].setValue(aDescuento.nIdArea);

    this.cboMotivo = new Array();
    this.aMotivo.filter( x => {
      const a = ( x.nParam === aDescuento.nIdArea || x.nParam === 0 );
      return a;
    }).forEach( x => {
      this.cboMotivo.push(x);
    });

    this.fgDescuento.controls['T1_nIdMotivo'].setValue(aDescuento.nIdMotivo);

    this.fgDescuento.controls['T1_nIdDireccion'].disable();
    this.fgDescuento.controls['T1_nIdArea'].disable();
    this.fgDescuento.controls['T1_nIdMotivo'].disable();
    this.fgDescuento.controls['T0_nImporte'].disable();
    this.fgDescuento.controls['T2_nCuota'].disable();
    this.fgDescuento.controls['T2_dFechIni'].disable();
    this.fgDescuento.controls['T2_sDescripcion'].disable();
  }

  async saveDescuento( opc: number ) {
    this.pbDescuento = true;

    this.aParam = [];

    if (this.fgDescuento.invalid) {

      Swal.fire(
        'No se puede guardar',
        'Información incorrecta o incompleta',
        'error'
      );

      this.pbDescuento = false;
      return;
    } else {

      const nIdPersonal = this.fgDetail.controls['nIdPersonal'].value;
      const fc_nIdAuthDesc = this.fgDescuento.controls['T1_nIdAuthDesc'] as FormControl;
      const fc_nIdDescuento = this.fgDescuento.controls['T2_nIdDescuento'] as FormControl;

      // New - 1 | Edit - 2
      let oModo: number;
      oModo = ( fc_nIdAuthDesc.value === 0 || fc_nIdAuthDesc.value === null || fc_nIdAuthDesc.value === undefined ) ? 1 : 2;

      if (oModo === 1) {
        fc_nIdAuthDesc.setValue(null);
        fc_nIdDescuento.setValue(null);
      }
      fc_nIdAuthDesc.markAsDirty();
      fc_nIdDescuento.markAsDirty();

      this.fnGetParam(this.fgDescuento.controls, ( oModo === 2 ) ? true : false );

      if ( this.aParam.length > ( ( oModo === 2 ) ? 1 : 0 ) ) {

        // Usuario y Fecha con Hora
        const user = localStorage.getItem('currentUser');
        const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

        if ( oModo === 1 ) {
          this.aParam.push('T0¡nIdRegUser!' + uid);
          this.aParam.push('T0¡dtReg!GETDATE()');
          this.aParam.push('T0¡nIdPersonal!' + nIdPersonal);
          this.aParam.push('T0¡bEstado!1');
        } else {
          this.aParam.push('T0¡nIdModUser!' + uid);
          this.aParam.push('T0¡dtMod!GETDATE()');
        }

        const aResult = new Array();
        const result = await this.service._crudCD(oModo, this.aParam);

        Object.keys( result ).forEach ( valor => {
          aResult.push(result[valor]);
        });

        this.aParam = [];
        let ftype = '';

        for (const e of aResult) {
          const iResult = aResult.indexOf(e);

          if (e.split('!')[0] !== '00') {
            ftype = 'success';

            if ( oModo === 1 ) {

              Swal.fire({
                title: 'Registro satisfactorio',
                text: '¿ Desea imprimir el documento de autorización de descuento ?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#ff4081',
                confirmButtonText: 'Confirmar !',
                allowOutsideClick: false
              }).then(async (_result) => {
                if (_result.isConfirmed) {

                  const nIdDescuento = e.split('!')[1];
                  const nIdEmp = JSON.parse(localStorage.getItem('ListaEmpresa'))[0].nIdEmp;

                  
                  // this.aParam.push('0¡nIdDescuento!' + nIdDescuento + '-0¡nIdEmp!' + nIdEmp + '-1¡nIdTipoDocumento!1158');
                  this.aParam.push('0¡nIdDescuento!' + nIdDescuento + '-0¡nIdEmp!' + nIdEmp + '-0¡nIdDocumento!30');
                  await this.printDescuento();
                }
              });

            } else {
              Swal.fire({
                title: 'Actualización satisfactoria',
                text: 'El descuento será tomado según la fecha de inicio.',
                icon: 'success'
              });
            }

          } else {

            Swal.fire({
              title: 'Inconveniente',
              text: e.split('!')[1],
              icon: 'error'
            });
            ftype = 'error';
            break;
          }
        }

        if ( ftype !== 'error' ) {
          this.countDescuento = this.countDescuento + 1;
          this.loadDescuentos(nIdPersonal);
          this.cleanModal(3);
        }

        this.pbDescuento = false;
        return;

      } else {
        this._snackBar.open('No se realizó ningún cambio.', 'Cerrar', {
          duration: 1000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
        return;
      }

    }
  }

  async deleteDescuento( nIdDescuento: number, nIdAuthDesc: number ) {
    const nIdPersonal = this.fgDetail.controls['nIdPersonal'].value;

    const aParam = [];
    aParam.push('T1¡nIdDescuento!' + nIdDescuento);
    aParam.push('T2¡nIdAuthDesc!' + nIdAuthDesc);

    const aResult = new Array();
    const result = await this.service._crudCD(3, aParam);

    Object.keys( result ).forEach ( valor => {
      aResult.push(result[valor]);
    });

    let ftitle = '';
    let ftext = '';
    let ftype = '';

    for (const e of aResult) {
      const iResult = aResult.indexOf(e);

      if (e.split('!')[0] !== '00') {
        if (iResult === 0) {

          ftitle = 'Registro eliminado';
          ftext = 'Deberá de calcular para reflejar el cambio en planilla.';
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
      this.countDescuento = this.countDescuento + 1;
      this.loadDescuentos(nIdPersonal);
      this.cleanModal(3);
    }
  }

  async printDescuento() {
    await this.service.print(6, this.aParam, this.url).then( (result: any) => {
      let objectURL: any = URL.createObjectURL(result);
      const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;
      pdfFrame.src = '';
      pdfFrame.src = objectURL;
      objectURL = URL.revokeObjectURL(result);
    });
    this.aParam = [];
  }

  printDoc() {
    const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;
    if ( pdfFrame.src !== '' ) {
      this.pbMain = false;
      pdfFrame.contentWindow.print();
    }
  }

  chosenYearHandler(normalizedYear: Moment) {
    let ctrlValue = this.fgFilter.controls['dFecha'].value;
    ctrlValue = ( ctrlValue === null ) ? moment() : ctrlValue;
    ctrlValue.year(normalizedYear.year());
    this.fgFilter.controls['dFecha'].setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    let ctrlValue = this.fgFilter.controls['dFecha'].value;
    ctrlValue = ( ctrlValue === null ) ? moment() : ctrlValue;
    ctrlValue.month(normalizedMonth.month());
    this.fgFilter.controls['dFecha'].setValue(ctrlValue);
    datepicker.close();
  }

  panelState(log: boolean) {
    this.panelOpenState = log;
  }

}
