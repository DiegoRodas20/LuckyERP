import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { informepAnimations } from './informep.animations';
import { InformepService } from './informep.service';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from './../../../../shared/services/AppDateAdapter';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl, FormArray } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { EquipoTrabajo, ListaInforme, ListaResp } from '../model/Iinformep';
import { MatPaginator } from '@angular/material/paginator';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { ErrorStateMatcher } from '@angular/material/core';
import { ValidadoresService } from './validadores.service';

// Utilizar javascript [1]
declare var jQuery: any;

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-informep',
  templateUrl: './informep.component.html',
  styleUrls: ['./informep.component.css', 'informep.component.scss'],
  providers: [ InformepService,
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS , useValue: APP_DATE_FORMATS} ],
  animations: [ informepAnimations ]
})
export class InformepComponent implements OnInit {

  listaDC: string[] = [ 'action', 'sNombres', 'sCodPlla', 'sTipo', 'sDocumento', 'dFechIni' ];
  listaDS: MatTableDataSource<EquipoTrabajo>;
  @ViewChild('listaP', {static: true}) listaP: MatPaginator;

  informeDC: string[] = [ 'action', 'sResponsable', 'sInforme', 'dFechaInforme', 'sMotivo' ];
  informeDS: MatTableDataSource<ListaInforme>;
  @ViewChild('informeP', {static: true}) informeP: MatPaginator;
  expandedObs: null;

  respDC: string[] = [ 'action', 'sNombres' ];
  respDS: MatTableDataSource<ListaResp>;
  @ViewChild('respP', {static: true}) respP: MatPaginator;

  matcher = new MyErrorStateMatcher();

  // Service GET && POST
  url: string;
  aParam = [];

  // Fab
  fbMain = [
    {icon: 'groups', tool: 'Cambiar responsable'},
    {icon: 'history', tool: 'Histórico ( Ex - miembros )'}
  ];
  abMain = [];
  tsMain = 'inactive';
  ifMain = true;

  fbView = [
    {icon: 'add', tool: 'Nuevo informe'},
    {icon: 'close', tool: 'Cerrar'}
  ];
  abView = [];
  tsView = 'inactive';

  fbInforme = [
    {icon: 'save', tool: 'Guardar'},
    {icon: 'cancel', tool: 'Cancelar'}
  ];
  abInforme = [];
  tsInforme = 'inactive';

  fbResp = [
    {icon: 'close', tool: 'Cerrar'}
  ];
  abResp = [];
  tsResp = 'inactive';

  // Progress Bar
  pbMain: boolean;
  pbView: boolean;
  pbInforme: boolean;
  pbResp: boolean;

  fgResp: FormGroup;
  fgPersonal: FormGroup;
  fgSearchResp: FormGroup;

  // Filtro equipo personal
  fgListaP: FormGroup;

  // Informe
  fgInforme_data: FormGroup;
  fgInforme_obs: FormGroup;

  // ComboBox
  cboTipoInforme: any;
  chkPrint = false;
  cboMotivoInforme: any;

  constructor(public service: InformepService, @Inject('BASE_URL') baseUrl: string,
              private fb: FormBuilder, private valid: ValidadoresService,
              private spi: NgxSpinnerService) {

    // SERVICE GET && POST
    this.url = baseUrl;

    this.new_fgResp();
    this.new_fgPersonal();
    this.new_fgListaP();
    this.new_fgInforme_data();
    this.new_fgInforme_obs();
    this.new_fgSearchResp();
  }

  new_fgResp() {
    this.fgResp = this.fb.group({
      nIdResp: 0,
      sNombres: ''
    });
  }

  new_fgPersonal() {
    this.fgPersonal = this.fb.group({
      nIdPersonal: 0,
      sNombres: ''
    });
  }

  new_fgListaP () {
    this.fgListaP = this.fb.group({
      sNombres: ''
    });

    this.fgListaP.valueChanges.subscribe(value => {
      const filter = {...value, name: value.sNombres?.trim().toLowerCase()} as string;
      this.listaDS.filter = filter;

      if (this.listaDS.paginator) {
        this.listaDS.paginator.firstPage();
      }
    });
  }

  new_fgSearchResp () {
    this.fgSearchResp = this.fb.group({
      sNombres: ''
    });

    this.fgSearchResp.valueChanges.subscribe(value => {
      const filter = {...value, name: value.sNombres?.trim().toLowerCase()} as string;
      this.respDS.filter = filter;

      if (this.respDS.paginator) {
        this.respDS.paginator.firstPage();
      }
    });
  }

  new_fgInforme_data() {
    this.fgInforme_data = this.fb.group({
      A1_nIdTipoInforme: [ undefined, [ Validators.required, this.valid.noSelect ] ],
      T1_dFechaInforme: [ { value: null, disabled: true }, [ Validators.required ]],
      A1_nIdMotivoInforme: [ { value: undefined, disabled: true }, [ Validators.required, this.valid.noSelect ] ]
    });
  }

  new_fgInforme_obs() {
    this.fgInforme_obs = this.fb.group({
      T1_sObservacion: ['']
    });
  }

  async getListaInforme () {
    this.pbMain = true;

    const param = [];
    const nIdPersonal = this.fgPersonal.controls['nIdPersonal'].value;
    param.push('0¡A.nIdPersonal!' + nIdPersonal);
    await this.service._loadSP( 3, param, this.url).then( async (value: ListaInforme[]) => {

      this.informeDS = new MatTableDataSource(value);
      this.informeDS.paginator = this.informeP;

      const self = this;
      ( function($) {
        $('#ModalView').modal('show');
        $('#ModalView').on('shown.bs.modal', function () {
          self.onToggleFab(2, 1);
          self.ifMain = false;
        });
      })(jQuery);

      this.pbMain = false;
    });
  }

  async getListaResp () {
    this.pbMain = true;

    const param = [];

    // Usuario
    const user = localStorage.getItem('currentUser');
    const uid = JSON.parse(window.atob(user.split('.')[1])).uid;
    param.push('0¡nIdRegUser!' + uid);
    await this.service._loadSP( 7, param, this.url).then( async (value: ListaResp[]) => {

      this.respDS = new MatTableDataSource(value);
      this.respDS.paginator = this.respP;

      this.respDS.filterPredicate = function(data: ListaResp, filter: string): boolean {
        return data.sNombres.trim().toLowerCase().includes(filter);
      };

      this.respDS.filterPredicate = ((data: EquipoTrabajo, filter: ListaResp ) => {
        // tslint:disable-next-line: max-line-length
        const a = !filter.sNombres || ( data.sNombres.toLowerCase().includes(filter.sNombres.trim().toLowerCase()) );
        return a;
      }) as (PeriodicElement, string) => boolean;

      const self = this;
      ( function($) {
        $('#ModalResp').modal('show');
        $('#ModalResp').on('shown.bs.modal', function () {
          self.onToggleFab(4, 1);
          self.ifMain = false;
        });
      })(jQuery);

      this.pbMain = false;
    });
  }

  async getEquipoTrabajo () {
    await this.service._loadSP( 2, this.aParam, this.url).then( (value: EquipoTrabajo[]) => {

      this.listaDS = new MatTableDataSource(value);
      this.listaDS.paginator = this.listaP;
      this.listaDS.filterPredicate = function(data: EquipoTrabajo, filter: string): boolean {
        return data.sNombres.trim().toLowerCase().includes(filter) || data.sDocumento.trim().toLowerCase().includes(filter);
      };

      this.listaDS.filterPredicate = ((data: EquipoTrabajo, filter: EquipoTrabajo ) => {
        // tslint:disable-next-line: max-line-length
        const a = !filter.sNombres || ( data.sNombres.toLowerCase().includes(filter.sNombres.trim().toLowerCase()) || data.sDocumento.toLowerCase().includes(filter.sNombres.trim().toLowerCase()) );
        return a;
      }) as (PeriodicElement, string) => boolean;

    });
  }

  //#region Combobox

  async getTipoInforme () {
    const param = [];
    param.push('0¡nEleCodDad!2058');

    await this.service._loadSP( 4, param, this.url).then( ( value: any[] ) => {
      this.cboTipoInforme = value;
    });

  }

  changeTipoInforme (pushParam: any) {
    const fGroup = this.fgInforme_data;
    if (pushParam !== undefined ) {

      this.chkPrint =  (pushParam.sDocPrint !== '') ? true : false;
      fGroup.controls['T1_dFechaInforme'].setValue(null);

      switch (pushParam.disFechaInforme) {
        case '0':
          fGroup.controls['T1_dFechaInforme'].enable();
          break;

        case '1':
          fGroup.controls['T1_dFechaInforme'].disable();
          fGroup.controls['T1_dFechaInforme'].setValue(new Date());
          break;

        case '2':
          fGroup.controls['T1_dFechaInforme'].disable();
          fGroup.controls['T1_dFechaInforme'].setValue(new Date());
          break;
      }

      if (pushParam.bStatus === false) {
        fGroup.controls['A1_nIdMotivoInforme'].setValue(undefined);
        fGroup.controls['A1_nIdMotivoInforme'].disable();
      } else {
        fGroup.controls['A1_nIdMotivoInforme'].enable();
      }

    } else {
      this.chkPrint = false;
      fGroup.controls['T1_dFechaInforme'].disable();
      fGroup.controls['T1_dFechaInforme'].setValue(null);
      fGroup.controls['A1_nIdMotivoInforme'].disable();
      fGroup.controls['A1_nIdMotivoInforme'].setValue(undefined);
    }

  }

  async getMotivoInforme () {
    const param = [];
    param.push('0¡nEleCodDad!2063');

    await this.service._loadSP( 5, param, this.url).then( ( value: any[] ) => {
      this.cboMotivoInforme = value;
    });
  }

  //#endregion

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = ( stat === -1 ) ? ( this.abMain.length > 0 ) ? 0 : 1 : stat;
        this.tsMain = ( stat === 0 ) ? 'inactive' : 'active';
        this.abMain = ( stat === 0 ) ? [] : this.fbMain;
        break;
      case 2:
        stat = ( stat === -1 ) ? ( this.abView.length > 0 ) ? 0 : 1 : stat;
        this.tsView = ( stat === 0 ) ? 'inactive' : 'active';
        this.abView = ( stat === 0 ) ? [] : this.fbView;
        break;
      case 3:
        stat = ( stat === -1 ) ? ( this.abInforme.length > 0 ) ? 0 : 1 : stat;
        this.tsInforme = ( stat === 0 ) ? 'inactive' : 'active';
        this.abInforme = ( stat === 0 ) ? [] : this.fbInforme;
        break;
      case 4:
        stat = ( stat === -1 ) ? ( this.abResp.length > 0 ) ? 0 : 1 : stat;
        this.tsResp = ( stat === 0 ) ? 'inactive' : 'active';
        this.abResp = ( stat === 0 ) ? [] : this.fbResp;
        break;
    }
  }

  async showModal(opc: number, item?: EquipoTrabajo) {
    const self = this;

    switch (opc) {
      case 1:
        this.fgPersonal.patchValue({
          nIdPersonal: item.nIdPersonal,
          sNombres: item.sNombres
        });

        this.getListaInforme();
        break;

      case 2:
        ( function($) {
          $('#ModalView').modal('hide');
          $('#ModalView').on('hidden.bs.modal', function () {
            self.onToggleFab(2, -1);
          });

          $('#ModalInforme').modal('show');
          $('#ModalInforme').on('shown.bs.modal', function () {
            self.onToggleFab(3, 1);
          });
        })(jQuery);
        break;

      case 3:
        this.getListaResp();
        break;

      default:
        break;
    }
  }

  hideModal(modal: string, opc?: number) {

    let nToogle: number;
    switch (modal) {
      case '#ModalView':
        this.cleanView();
        nToogle = 2;
        break;
      case '#ModalInforme':
        this.cleanInforme();
        if ( opc !== undefined ) {
          this.getListaInforme();
        }
        nToogle = 3;
        break;
      case '#ModalResp':
        this.cleanResp();
        nToogle = 4;
        break;
    }

    this.onToggleFab(nToogle, 0);

    ( function($) {
      $(modal).modal('hide');
    })(jQuery);
  }

  cleanView() {
    this.ifMain = true;
    this.fgPersonal.reset();
    this.informeDS = new MatTableDataSource([]);
  }

  cleanResp() {
    this.ifMain = true;
    this.fgSearchResp.reset();
    this.respDS = new MatTableDataSource([]);
  }

  async selectResp(pushParam: any) {

    this.getListaP.sNombres.patchValue('');

    this.fgResp.patchValue({
      nIdResp : pushParam.nIdResp,
      sNombres : pushParam.sNombres
    });

    this.pbResp = true;
    this.aParam = [];

    const nIdResp = pushParam.nIdResp;
    this.aParam.push('0¡A.nIdResp!' + nIdResp);
    await this.getEquipoTrabajo();

    this.aParam = [];
    this.pbResp = false;

    this.hideModal('#ModalResp');
  }

  async saveInforme() {

    this.pbInforme = true;

    this.aParam = [];

    if (this.fgInforme_data.invalid) {
      Swal.fire(
        'No se puede guardar',
        'Información incorrecta o incompleta',
        'error'
      );

      this.pbInforme = false;
      return;
    } else {

      // Usuario y Fecha con hora
      const user = localStorage.getItem('currentUser');
      const uid = JSON.parse(window.atob(user.split('.')[1])).uid;
      this.aParam.push('T0¡nIdRegUser!' + uid);
      this.aParam.push('T0¡dtReg!GETDATE()');

      this.aParam.push('T1¡nEstado!0');

      const nIdResp = this.fgResp.controls['nIdResp'].value;
      this.aParam.push('T1¡nIdResp!' + nIdResp);

      const nIdPersonal = this.fgPersonal.controls['nIdPersonal'].value;
      this.aParam.push('T1¡nIdPersonal!' + nIdPersonal);

      this.fnGetParam(this.fgInforme_data.controls);
      this.fnGetParam(this.fgInforme_obs.controls);

      const aResult = new Array();
      const result = await this.service._crudIP(1, this.aParam, this.url);

      Object.keys( result ).forEach ( valor => {
        aResult.push(result[valor]);
      });

      let ftitle = '';
      let ftext = '';
      let ftype = '';
      let r_nIdInforme = '';

      for (const e of aResult) {
        const iResult = aResult.indexOf(e);

        if (e.split('!')[0] !== '00') {
          if (iResult === 0) {

            r_nIdInforme = e.split('!')[1];

            ftitle = 'Registro satisfactorio';
            ftext = 'Informe de personal enviado a RRHH';
            ftype = 'success';
          }
        } else {
          ftitle = 'Inconveniente';
          ftext = e.split('!')[1];
          ftype = 'error';
          break;
        }
      }

      this.aParam = [];

      Swal.fire(
        ftitle,
        ftext,
        (ftype !== 'error') ? 'success' : 'error'
      );

      if ( ftype !== 'error' ) {

        // Cargamos los parametros a enviar al procedimiento de impresión
        const aTipoInforme = this.fgInforme_data.controls['A1_nIdTipoInforme'].value;
        const nIdTipoDocumento = aTipoInforme.sDocPrint;
        const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
        // tslint:disable-next-line: max-line-length
        this.aParam.push('-0¡A.nIdPersonal!' + nIdPersonal + '-0¡nIdInforme!' + r_nIdInforme + '-0¡nIdEmp!' + nIdEmp + '-1¡nIdTipoDocumento!' + nIdTipoDocumento);
        await this.printDoc();

        this.hideModal('#ModalInforme', 0);
      }

      this.pbInforme = false;
      return ;
    }

  }

  cleanInforme() {

    this.fgInforme_data.reset({
      T1_dFechaInforme: { value: null, disabled: true },
      A1_nIdMotivoInforme: { value: undefined, disabled: true }
    });
    this.fgInforme_obs.reset();
    this.chkPrint = false;

    const self = this;
    ( function($) {
      $('#ModalView').modal('show');
      $('#ModalView').on('shown.bs.modal', function () {
        self.onToggleFab(2, 1);
      });
    })(jQuery);
  }

  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms)).then();
  }

  async printDoc() {

    await this.service.print(6, this.aParam, this.url).then( (_result: any) => {
      let objectURL: any = URL.createObjectURL(_result);
      const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;
      pdfFrame.src = '';
      pdfFrame.src = objectURL;
      objectURL = URL.revokeObjectURL(_result);
    });

    this.aParam = [];
  }

  async clickPrint(pushParam: any ) {
    this.pbView = true;
    this.aParam = [];

    const dtReg = '\'' + moment(new Date(pushParam.dtReg)).format('DD/MM/YYYY') + '\'';
    const nIdInforme = pushParam.nIdInforme;
    const nIdPersonal = pushParam.nIdPersonal;
    const nIdTipoDocumento = pushParam.sDocPrint;
    const nIdEmp = JSON.parse(localStorage.getItem('ListaEmpresa'))[0].nIdEmp;
    // tslint:disable-next-line: max-line-length
    this.aParam.push('5¡dtReg!' + dtReg + '-0¡A.nIdPersonal!' + nIdPersonal + '-0¡nIdInforme!' + nIdInforme + '-0¡nIdEmp!' + nIdEmp + '-1¡nIdTipoDocumento!' + nIdTipoDocumento);
    await this.printDoc();
  }

  printLoad() {
    const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;
    if ( pdfFrame.src !== '' ) {
      this.pbInforme = false;
      this.pbView = false;
      pdfFrame.contentWindow.print();
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

  async ngOnInit(): Promise<void> {
    // Utilizar javascript [2]
    // tslint:disable: only-arrow-functions

    this.getTipoInforme();
    this.getMotivoInforme();

    const user = localStorage.getItem('currentUser');
    const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

    const param = [];
    param.push('0¡B.nCodUser!' + uid);

    this.spi.show('spi_lista');

    await this.service._loadSP( 1, param, this.url).then( async (value: any[]) => {

      if ( value.length > 0 ) {

        this.fgResp.patchValue({
          nIdResp: value[0].nIdPersonal,
          sNombres: value[0].sNombres
        });

        const nIdPersonal = value[0].nIdPersonal;
        this.aParam.push('0¡A.nIdResp!' + nIdPersonal);

        await this.getEquipoTrabajo();

        this.aParam = [];
        this.spi.hide('spi_lista');

      } else {
        console.log('Usuario no cuenta con relación de personal');
      }

    });
  }

  // Acceso rápido Lista Personal
  get getResp() { return this.fgResp.controls; }
  get getPersonal() { return this.fgPersonal.controls; }
  get getListaP() { return this.fgListaP.controls; }
  get getInformeData() { return this.fgInforme_data.controls; }
  get getSearchResp() { return this.fgSearchResp.controls; }

  clickFab(opc: number, index: number) {
    switch (opc) {
      case 1:
        switch (index) {
          case 0:
            this.showModal(3);
            break;
          case 1:
            console.log('Histórico ( Ex - miembros )');
            break;
        }
        break;

      case 2:
        switch (index) {
          case -1:
            this.hideModal('#ModalView');
            break;
          case 0:
            this.showModal(2);
            break;
          case 1:
            this.hideModal('#ModalView');
            break;
        }
        break;

      case 3:
        switch (index) {
          case -1:
            this.hideModal('#ModalInforme');
            break;
          case 0:
            this.saveInforme();
            break;
          case 1:
            this.hideModal('#ModalInforme');
            break;
        }
        break;

      case 4:
        this.hideModal('#ModalResp');
        break;
    }
  }

}
