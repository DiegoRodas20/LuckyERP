import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatTable, MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {Observable} from 'rxjs';
import {distinctUntilChanged, map, startWith} from 'rxjs/operators';
import {Moment} from 'moment';
import * as moment from 'moment';
import {MatDatepicker} from '@angular/material/datepicker';
import Swal from 'sweetalert2';
import {NgxSpinnerService} from 'ngx-spinner';
import {MatSnackBar} from '@angular/material/snack-bar';
import {KpipService} from './kpiprovis.service';
import {ValidadoresService} from './validadores.service';
import {kpipAnimations} from './kpiprovis.animations';
import { nsProvis } from '../../model/Ikpip';

// Utilizar javascript [1]
declare var jQuery: any;

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-kpiprovis',
  templateUrl: './kpiprovis.component.html',
  styleUrls: ['./kpiprovis.component.css', './kpiprovis.component.scss'],
  providers: [KpipService],
  animations: [kpipAnimations]
})
export class KpiprovisComponent implements OnInit {

  //#region Variables
  matcher = new MyErrorStateMatcher();
  panelOpenState = true;
  panelOpenDis = true;
  expandedMore: nsProvis.IMain;
  editTable: nsProvis.IProvis;
  selectResp: nsProvis.IListaResp;
  mProvis: number;
  nCrud = 0;
  listaPermitidos = [];
  user = localStorage.getItem('currentUser');
  nIdUser: number = JSON.parse(window.atob(this.user.split('.')[1])).uid;

  // Animaciones Tada
  tadaMain = 'inactive';

  // Service GET && POST
  url: string;
  aParam = [];
  aParaml = [];

  // Fab
  fbMain = [
    {icon: 'groups', tool: 'Cambiar responsable'},
    {icon: 'request_page', tool: 'Nuevo registro'}
  ];
  abMain = [];
  tsMain = 'inactive';

  fbNew = [
    {icon: 'save', tool: 'Guardar'},
    {icon: 'cancel', tool: 'Cancelar'}
  ];
  fbView = [
    {icon: 'create', tool: 'Editar', dis: false},
    {icon: 'forward_to_inbox', tool: 'Enviar', dis: false},
    {icon: 'delete_forever', tool: 'Eliminar', dis: false},
  ];

  abProvis = [];
  tsProvis = 'inactive';
  toggleProvis = 0;

  fbPerso = [
    {icon: 'person_add', tool: 'Añadir'},
    {icon: 'cleaning_services', tool: 'Limpiar'},
  ];
  abPerso = [];
  tsPerso = 'inactive';

  // Progress Bar
  pbMain: boolean;
  pbProvis: boolean;
  pbResp: boolean;

  // Combobox
  cboCliente: any;
  cboCentroCosto = new Array();
  cboEstado: any;

  // Mat Table
  MainDC: string[] = ['action', 'sCliente', 'sCentroCosto', 'dDevengue', 'sEstado', 'nCant', 'more'];
  MainDS: MatTableDataSource<nsProvis.IMain> = new MatTableDataSource([]);
  @ViewChild('pagMain', {static: true}) pagMain: MatPaginator;

  ExpandedDC: string[] = ['position', 'sNombres', 'sCodPlla', 'sDscTipo', 'sDocumento', 'sCiudad', 'nImporte'];
  ExpandedDS: MatTableDataSource<nsProvis.IExpanded> = new MatTableDataSource([]);
  @ViewChild('pagExpanded', {static: false}) pagExpanded: MatPaginator;
  aPerso: Array<nsProvis.IPerso>;
  tsMore = 'inactive';

  ProvisDC: string[] = ['sPersoImg', 'sNombres',  'action'];
  ProvisDS: MatTableDataSource<nsProvis.IProvis> = new MatTableDataSource([]);
  @ViewChild('pagProvis', {static: true}) pagProvis: MatPaginator;
  @ViewChild('mtProvis') mtProvis: MatTable<any>;
  aBackup: any;

  ResponsableDC: string[] = ['sPersoImg', 'sNombres'];
  ResponsableDS: MatTableDataSource<nsProvis.IListaResp> = new MatTableDataSource([]);
  @ViewChild('pagResp', {static: false}) pagResp: MatPaginator;

  // FormGroup
  fgDevengue: FormGroup;
  fgInfoUser: FormGroup;
  fgMain: FormGroup;
  fgProvis: FormGroup;
  fgSearch: FormGroup;
  fgPerso: FormGroup;
  fgInfoPerso: FormGroup;
  fgFilter: FormGroup;
  fgResp: FormGroup;

  // FormControl
  fcPartida: FormControl = new FormControl();

  // Array
  aCentroCosto: nsProvis.ICentroCosto[] = [];
  aPersonal: nsProvis.ITeamResp[] = [];
  aPlanilla: nsProvis.IPlanilla[] = [];

  aSaldoCC: nsProvis.ISaldoCC[] = [];
  aGastoCC: nsProvis.IGastoCC[] = [];
  aGastoP: nsProvis.IGastoP[] = [];

  // AutoComplete
  foCentroCosto: Observable<any[]>;
  foPersonal: Observable<any[]>;
  saPersonal = false;

  //#endregion

  constructor(public service: KpipService, @Inject('BASE_URL') baseUrl: string,
              private fb: FormBuilder, private spi: NgxSpinnerService,
              private _snackBar: MatSnackBar, private valid: ValidadoresService) {

    // SERVICE GET && POST
    this.url = baseUrl;

    this.new_fgDevengue();
    this.new_fgInfoUser();
    this.new_fgMain();
    this.new_fgProvis();
    this.new_fgSearch();
    this.new_fgPerso();
    this.new_fgInfoPerso();
    this.new_fgFilter();
    this.new_fgResp();

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

    this.fgMain.valueChanges.subscribe(value => {
      const filter = {...value, name: value.sNombres.trim().toLowerCase()} as string;
      this.MainDS.filter = filter;

      if (this.MainDS.paginator) {
        this.MainDS.paginator.firstPage();
      }

      this.expandedMore = null;
    });

  }

  new_fgProvis() {
    this.fgProvis = this.fb.group({
      T1_nIdProvis: [{value: null, disabled: true}, [Validators.required]],
      T1_nIdCentroCosto: [{value: 0, disabled: true}, [Validators.required]],
      nCentroCosto: [{value: '', disabled: true}],
      sCentroCosto: [{value: '', disabled: true}],
      sCliente: [{value: '', disabled: true}],
      T1_nIdPartida: [{value: 0, disabled: true}, [Validators.required]],
      T1_nIdResp: [0, [Validators.required]],
      sResp: [{value: '', disabled: true}],
      T1_nIdPlla: [0, [Validators.required]],
      sPlla: [{value: '', disabled: true}],
      T1_nIdDevengue: [{value: 0, disabled: true}],
      T1_dFecha: [{value: null, disabled: true}, [Validators.required]],
      T1_nIdEstado: [0, [Validators.required]],
      sEstado: [{value: '', disabled: true}]
    });
  }

  new_fgSearch() {
    this.fgSearch = this.fb.group({
      sNombres: [{value: null, disabled: true}]
    });

    this.foPersonal = this.fgSearch.controls['sNombres'].valueChanges
      .pipe(
        startWith(''),
        distinctUntilChanged(),
        map(value => this._filter(value, 2))
      );

    this.fgSearch.valueChanges.subscribe(value => {
      this.fgPerso.reset();
      this.fgInfoPerso.reset();

      this.fgPerso.controls['nImporte'].setValue(0);
      this.fgPerso.controls['nImporte'].disable();
      this.fgInfoPerso.controls['sCodPlla'].setValue('?');

      this.abPerso = [];
      this.tsPerso = 'inactive';
    });
  }

  new_fgPerso() {
    this.fgPerso = this.fb.group({
      nIdPersonal: [{value: 0, disabled: true}, [Validators.required]],
      nIdSucursal: [{value: 0, disabled: true}, [Validators.required]],
      nImporte: [{value: 0, disabled: true}, [this.valid.vMonto]],
    });

    this.fgPerso.controls['nImporte'].valueChanges.subscribe((value: number) => {
      if (value > 0 && value !== null) {
        const nImporte = value;
        const nMontoMax = this.fgInfoPerso.controls['nMontoMax'].value as number;
        // validar que no sobrepase el 20 % de su remuneración bruta
        this.fgPerso.controls['nImporte'].setValidators([Validators.max(nMontoMax), this.valid.vMonto]);
        // this.fgPerso.controls['nImporte'].updateValueAndValidity();
      }
    });

  }

  new_fgInfoPerso() {
    this.fgInfoPerso = this.fb.group({
      sCodPlla: [{value: '?', disabled: true}],
      sTipo: [{value: '', disabled: true}],
      sDocumento: [{value: '', disabled: true}],
      dFechIni: [{value: null, disabled: true}],
      dFechFin: [{value: null, disabled: true}],
      sCiudad: [{value: '', disabled: true}],
      nMontoMax: [{value: 0, disabled: true}]
    });
  }

  new_fgFilter() {
    this.fgFilter = this.fb.group({
      sNombres: null
    });

    this.fgFilter.valueChanges.subscribe(value => {

      if (value.sNombres !== null) {

        const filter = {...value, name: value.sNombres.trim().toLowerCase()} as string;
        this.ProvisDS.filter = filter;

        if (this.ProvisDS.paginator) {
          this.ProvisDS.paginator.firstPage();
        }

      }
    });

  }

  new_fgResp() {
    this.fgResp = this.fb.group({
      sNombres: null
    });

    this.fgResp.valueChanges.subscribe( value => {

      if (value.sNombres !== null) {

        const filter = {...value, name: value.sNombres.trim().toLowerCase()} as string;
        this.ResponsableDS.filter = filter;

        if (this.ResponsableDS.paginator) {
          this.ResponsableDS.paginator.firstPage();
        }

      }
    });
  }

  get getInfoUser() { return this.fgInfoUser.controls; }
  get getMain() { return this.fgMain.controls; }
  get getProvis() { return this.fgProvis.controls; }
  get getSearch() { return this.fgSearch.controls; }
  get getPerso() { return this.fgPerso.controls; }
  get getInfoPerso() { return this.fgInfoPerso.controls; }
  get getFilter() { return this.fgFilter.controls; }
  get getResp() { return this.fgResp.controls; }

  //#endregion

  //#region Combobox

  async fnGetEstado() {
    const param = [];
    param.push('0¡nEleCodDad!2192');

    await this.service._loadSP(2, param, this.url).then((value: any[]) => {
      this.cboEstado = value;
    });
  }

  ChangeCliente(pushParam: number) {
    const cboCentroCosto = new Array();
    this.fgMain.controls['sCentroCosto'].setValue('');
    this.fgMain.controls['sCentroCosto'].disable();

    if (pushParam !== undefined) {
      this.cboCentroCosto.filter(x => {
        return x.nIdCliente === pushParam;
      }).forEach(x => {
        cboCentroCosto.push(x);
      });

      this.aCentroCosto = cboCentroCosto;
      this.fgMain.controls['sCentroCosto'].enable();
    }
  }

  //#endregion

  //#region General

  fnGetParam(kControls: { [key: string]: AbstractControl }, bDirty?: boolean) {

    let sParam = '';

    Object.keys(kControls).forEach(control => {
      const index = control.indexOf('_');
      let cTable = '', cColum = '', cValue = '', cDirty: boolean;
      if (index > 0) {

        switch (control.substring(0, 1)) {

          case 'A':
            const aControl = kControls[control].value;
            cTable = 'T' + control.substring(1, index);
            cDirty = kControls[control].dirty;

            if (aControl !== undefined) {
              Object.keys(aControl).forEach(eSub => {
                const iSub = eSub.indexOf('_');
                if (iSub > 0) {
                  cColum = eSub.substring(0, iSub);
                  cValue = aControl[eSub];

                  if (bDirty === undefined) {
                    this.aParam.push(cTable + '¡' + cColum + '!' + cValue);
                  } else {
                    if (cDirty === true) {
                      this.aParam.push(cTable + '¡' + cColum + '!' + cValue);
                    }
                  }
                }
              });
            }
            break;

          case 'L':
            cTable = control.substring(0, index);
            cColum = control.substring(index + 1, control.length);
            this.aParaml.push(cTable + '¡' + cColum + '!');

            const lControl = kControls[control] as FormArray;

            // Recorremos el grupo de elementos del FormArray
            Object.values(lControl.controls).forEach((gcontrol: FormGroup) => {

              sParam = '';

              let count = 0;

              Object.keys(gcontrol.controls).forEach(subControl => {

                if (subControl.substring(0, 1) === 'A') {

                  const csControl = gcontrol.controls[subControl];

                  if (csControl.value !== null && csControl.value !== undefined) {

                    Object.keys(csControl.value).forEach(eSub => {
                      const iSub = eSub.indexOf('_');
                      if (iSub > 0) {
                        count = count + 1;

                        cColum = eSub.substring(0, iSub);
                        cValue = csControl.value[eSub];
                        sParam = sParam + cTable + '¡' + cColum + '!' + cValue + '-';
                      }
                    });

                  }

                } else {
                  if (subControl.indexOf('_') < 0) {

                    cValue = gcontrol.controls[subControl].value;
                    if (cValue !== '' && cValue.toString() !== '0') {
                      count = count + 1;
                      sParam = sParam + cTable + '¡' + subControl + '!' + cValue + '-';
                    }
                  }
                }

              });

              sParam = sParam.substring(0, sParam.length - 1);

              if (count > 1) {
                this.aParaml.push(sParam);
              }
            });
            break;

          default:
            cTable = control.substring(0, index);
            cColum = control.substring(index + 1, control.length);
            cDirty = kControls[control].dirty;

            if (kControls[control].value !== null && kControls[control].value !== undefined) {

              // tslint:disable-next-line: max-line-length
              cValue = (cColum.substring(0, 1) === 'd') ? moment(new Date(kControls[control].value)).format('MM/DD/YYYY') : kControls[control].value;

              if (bDirty === undefined) {
                this.aParam.push(cTable + '¡' + cColum + '!' + cValue);
              } else {
                if (cDirty === true) {
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
        stat = (stat === -1) ? (this.abMain.length > 0) ? 0 : 1 : stat;
        this.tsMain = (stat === 0) ? 'inactive' : 'active';
        this.abMain = (stat === 0) ? [] : this.fbMain;
        break;

      case 2:
        stat = (stat === -1) ? (this.abProvis.length > 0) ? 0 : 1 : stat;
        this.tsProvis = (stat === 0) ? 'inactive' : 'active';
        this.abProvis = (stat === 0) ? [] : this.fbNew;
        break;

      case 3:
        stat = (stat === -1) ? (this.abProvis.length > 0) ? 0 : 1 : stat;
        this.tsProvis = (stat === 0) ? 'inactive' : 'active';
        this.abProvis = (stat === 0) ? [] : this.fbView;
        break;

      case 4:
        stat = ( stat === -1 ) ? ( this.abPerso.length > 0 ) ? 0 : 1 : stat;
        this.tsPerso = ( stat === 0 ) ? 'inactive' : 'active';
        this.abPerso = ( stat === 0 ) ? [] : this.fbPerso;
        break;
    }
  }

  async clickFab(opc: number, index: number) {

    const nIdProvis = this.fgProvis.controls['T1_nIdProvis'].value;

    switch (opc) {
      // Fab Main
      case 1:
        switch (index) {
          // Cambiar responsable
          case 0:
            this.showModal(3);
            break;

          // Nuevo registro ( operaciones )
          case 1:
            const aPlanilla = this.aPlanilla.filter(x => x.sCodPlla === '2');
            this.fgProvis.controls['T1_nIdPlla'].setValue(aPlanilla[0].nIdPlla);
            this.fgProvis.controls['sPlla'].setValue(aPlanilla[0].sDesc);
            this.showModal(1);
            break;
        }
        break;

      // Fab Provis ( New )
      case 2:
        switch (index) {
          case -1:
            this.cleanModal(1);
            break;

          case 0:
            this.saveProvis();
            break;

          case 1:
            if ( nIdProvis !== null ) {
              this.ProvisDS.data = JSON.parse(this.aBackup);
              this.cleanModal(2);
            } else {
              this.cleanModal(1);
            }
            break;
        }
        break;

      // Fab Provis ( View )
      case 3:
        switch (index) {
          case -1:
            this.cleanModal(1);
            break;

          case 0:
            Swal.fire({
              title: '¿ Estas seguro de modificar la provis?',
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#ff4081',
              confirmButtonText: 'Confirmar !',
              allowOutsideClick: false
            }).then(async (result) => {
              if (result.isConfirmed) {

                const nIdResp = this.fgInfoUser.controls['nIdPersonal'].value;
                const nIdDevengue = this.fgProvis.controls['T1_nIdDevengue'].value;

                await this.loadTeamResp(2, nIdResp);
                await this.gastoPersonal(nIdResp, nIdDevengue);

                const aData = this.ProvisDS.data;
                aData.forEach( x => {
                  const nIdPersonal = x.nIdPersonal;
                  this.aPersonal.find( y => y.nIdPersonal === nIdPersonal ).nStat = 1;
                });

                this.abProvis = [];
                this.delay(250).then(any => {
                  this.abProvis = this.fbNew;
                  this.tsProvis = 'active';
                });

                this.toggleProvis = 2;
                this.mProvis = 1;
                this.fgSearch.controls['sNombres'].enable();
                return;
              }
            });
            break;

          case 1:
            Swal.fire({
              title: '¿ Estas seguro de enviar la provis?',
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#ff4081',
              confirmButtonText: 'Confirmar !',
              allowOutsideClick: false
            }).then(async (result) => {
              if (result.isConfirmed) {

                this.pbProvis = true;

                this.aParam = [];
                this.aParam.push('T1¡nIdProvis!' + nIdProvis);
                this.aParam.push('T1¡nIdEstado!2194');

                // Usuario y Fecha con hora
                const user = localStorage.getItem('currentUser');
                const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

                this.aParam.push('T1¡nIdModUser!' + uid);
                this.aParam.push('T1¡dtMod!GETDATE()');

                const aResult = new Array();
                const res = await this.service._crudKP( 3, this.aParam, this.url );

                Object.keys( res ).forEach ( valor => {
                  aResult.push(res[valor]);
                });

                let ftitle = '';
                let ftext = '';
                let ftype = '';

                for (const e of aResult) {
                  if (e.split('!')[0] === '00') {
                    Swal.fire(
                      'Inconveniente',
                      e.split('!')[1],
                      'error'
                    );
                    this.pbProvis = false;
                    return;
                  }
                }

                ftitle = 'Provis enviada';
                ftext = 'N° de Provis enviada : ' + nIdProvis;
                ftype = 'success';

                this.aParam = [];
                Swal.fire(
                  ftitle,
                  ftext,
                  (ftype !== 'error') ? 'success' : 'error'
                );

                if ( ftype !== 'error' ) {
                  this.nCrud = 1;
                  this.cleanModal(1);
                }

                this.pbProvis = false;

              }
            });
            break;

          case 2:
            Swal.fire({
              title: '¿ Estas seguro de eliminar la provis?',
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#ff4081',
              confirmButtonText: 'Confirmar !',
              allowOutsideClick: false
            }).then(async (result) => {
              if (result.isConfirmed) {

                this.pbProvis = true;

                this.aParam = [];
                this.aParam.push('T1¡nIdProvis!' + nIdProvis);
                this.aParam.push('T2¡nIdProvis!' + nIdProvis);

                const aResult = new Array();
                const res = await this.service._crudKP( 5, this.aParam, this.url );

                Object.keys( res ).forEach ( valor => {
                  aResult.push(res[valor]);
                });

                let ftitle = '';
                let ftext = '';
                let ftype = '';

                for (const e of aResult) {
                  if (e.split('!')[0] === '00') {
                    Swal.fire(
                      'Inconveniente',
                      e.split('!')[1],
                      'error'
                    );
                    this.pbProvis = false;
                    return;
                  }
                }

                ftitle = 'Provis eliminada';
                ftext = 'N° de Provis eliminada : ' + nIdProvis;
                ftype = 'success';

                this.aParam = [];
                Swal.fire(
                  ftitle,
                  ftext,
                  (ftype !== 'error') ? 'success' : 'error'
                );

                if ( ftype !== 'error' ) {
                  this.nCrud = 1;
                  this.cleanModal(1);
                }

                this.pbProvis = false;

              }
            });
            break;
        }
        break;

      // Fab Perso
      case 4:
        switch (index) {
          case 0:
            this.addPerso();
            break;

          case 1:
            this.getSearch.sNombres.patchValue(undefined);
            break;
        }
        break;

      // Responsable
      case 5:
        switch (index) {
          case -1:
            // Limpiar modal
            this.cleanModal(3);
            this.hideModal('#ModalResponsable');
            break;
        }

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
        this.fgProvis.controls['T1_nIdCentroCosto'].setValue(value[0].nIdCentroCosto);
        this.fgProvis.controls['nCentroCosto'].setValue(sCodCC);
        this.fgProvis.controls['sCentroCosto'].setValue(value[0].sCentroCosto);
        this.fgProvis.controls['sCliente'].setValue(value[0].sCliente);
        bReturn = false;
        } else {
          bReturn = true;
          Swal.fire(
            'Falta approbación.',
            'Verificar approbación del centro de costo.',
            'info'
          );
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

  async showModal(opc: number, pushParam?: any, index?: number) {
    const self = this;

    const nIdResp = this.fgInfoUser.controls['nIdPersonal'].value;
    const sResp = this.fgInfoUser.controls['sNombres'].value;

    this.fgProvis.controls['T1_nIdResp'].setValue(nIdResp);
    this.fgProvis.controls['sResp'].setValue(sResp);

    switch (opc) {
      // Main
      case 1:

        Swal.fire({
          title: 'Provis [Operaciones]',
          text: 'Ingresar el N° del centro de costo en donde se cargará la prestación alimentaria.',
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
        .then(async resultado => {
          if (resultado.isConfirmed) {

            this.pbMain = true;

            // Validar centro de costo
            let lError = false;
            lError = await this.loadCentroCosto(resultado.value as string);

            if (lError) {
              this._snackBar.open('N° de centro de costo inválido.', 'Cerrar', {
                horizontalPosition: 'right',
                verticalPosition: 'top',
                duration: 2500
              });
              this.pbMain = false;
              return;
            }

            const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
            lError  = await this.Validaciones(nIdEmp , resultado.value as string);
            if (lError) {
              return;
            }
          const nIdCentroCosto = this.fgProvis.controls['T1_nIdCentroCosto'].value;
          await this.ResponsablesPermitidos(nIdCentroCosto);
          const cant =  this.listaPermitidos.filter(x => x.nCodUser === parseInt(this.nIdUser.toString(),  10) ).length;
          if (cant === 0) {
            Swal.fire(
              'Responsable inválido.',
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

            lError = await this.saldoCentroCosto(nIdCentroCosto);
            if (lError) {
              Swal.fire(
                'Centro de costo sin saldo.',
                'N° de centro de costo sin saldo para provis.',
                'info'
              );
              // this._snackBar.open('N° de centro de costo sin saldo para provis.', 'Cerrar', {
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
              Swal.fire(
                'Sin personal a cargo.',
                'El responsable no cuenta con personal a su cargo.',
                'info'
              );
              // this._snackBar.open('El responsable no cuenta con personal a su cargo.', 'Cerrar', {
              //   horizontalPosition: 'right',
              //   verticalPosition: 'top',
              //   duration: 2500
              // });
              this.pbMain = false;
              return;
            }

            const nIdDevengue = this.fgDevengue.controls['nIdDevengue'].value;

            await this.gastoPersonal(nIdResp, nIdDevengue);

            this.fgProvis.controls['T1_nIdPartida'].setValue(this.fcPartida.value);

            const nEjercicio = this.fgDevengue.controls['nEjercicio'].value as number;
            const nMes = this.fgDevengue.controls['nMes'].value as number;
            const sEjercicio = nEjercicio.toString();
            let sMes = nMes.toString();

            sMes = ( sMes.length === 1 ) ? '0' + sMes : sMes;

            const sDate = sMes + '/01/' + sEjercicio;
            const dFecha = moment(sDate).toDate();

            this.fgProvis.controls['T1_nIdDevengue'].setValue(nIdDevengue);
            this.fgProvis.controls['T1_dFecha'].setValue(dFecha);
            this.fgProvis.controls['sEstado'].setValue('Temporal');

            this.toggleProvis = 2;
            this.mProvis = 1;
            this.fgSearch.controls['sNombres'].enable();

            ( function($) {
              $('#ModalProvis').modal('show');
              $('#ModalProvis').on('shown.bs.modal', function () {
                self.onToggleFab(self.toggleProvis, 1);
                self.onToggleFab(1, 0);
              });
            })(jQuery);

            this.pbMain = false;

          }
        });
        break;

      case 2:
        this.pbMain = true;

        const rElement = pushParam as nsProvis.IMain;

        this.fgProvis.controls['T1_nIdProvis'].setValue(rElement.nIdProvis);
        this.fgProvis.controls['T1_nIdCentroCosto'].setValue(rElement.nIdCentroCosto);
        this.fgProvis.controls['nCentroCosto'].setValue(rElement.nCentroCosto);
        this.fgProvis.controls['sCentroCosto'].setValue(rElement.sCentroCosto);
        this.fgProvis.controls['sCliente'].setValue(rElement.sCliente);
        this.fgProvis.controls['T1_nIdPartida'].setValue(rElement.nIdPartida);
        this.fgProvis.controls['T1_nIdDevengue'].setValue(rElement.nIdDevengue);
        this.fgProvis.controls['T1_dFecha'].setValue(rElement.dFecha);
        this.fgProvis.controls['T1_nIdEstado'].setValue(rElement.nIdEstado);
        this.fgProvis.controls['sEstado'].setValue(rElement.sEstado);
        this.fgProvis.controls['T1_nIdPlla'].setValue(rElement.nIdPlla);
        this.fgProvis.controls['sPlla'].setValue(rElement.sPlla);

        await this.loadProvis(rElement.nIdProvis);

        // Backup
        this.aBackup = JSON.stringify(this.ProvisDS.data);

        this.pbMain = false;

        this.toggleProvis = 3;
        this.mProvis = 2;

        const nIdEstado = rElement.nIdEstado;
        if (nIdEstado !== 2193) {
          this.fbView.forEach( (x, i: number) => { x.dis = ( i !== 1 ) ? true : false ; });
        }

        ( function($) {
          $('#ModalProvis').modal('show');
          $('#ModalProvis').on('shown.bs.modal', function () {
            self.onToggleFab(self.toggleProvis, 1);
          });
        })(jQuery);

        break;

      case 3:
        this.pbMain = true;

        const param = [];

        // Usuario
        const user = localStorage.getItem('currentUser');
        const uid = JSON.parse(window.atob(user.split('.')[1])).uid;
        param.push('0¡nIdRegUser!' + uid);
        await this.service._loadSP( 10, param, this.url).then( (value: nsProvis.IListaResp[]) => {

          this.ResponsableDS = new MatTableDataSource(value);
          this.ResponsableDS.paginator = this.pagResp;

          this.ResponsableDS.filterPredicate = function(data: nsProvis.IListaResp, filter: string): boolean {
            return data.sNombres.trim().toLowerCase().includes(filter);
          };
    
          this.ResponsableDS.filterPredicate = ((data: nsProvis.IListaResp, filter: any ) => {
            // tslint:disable-next-line: max-line-length
            const a = !filter.sNombres || ( data.sNombres.toLowerCase().includes(filter.sNombres.trim().toLowerCase()) );
            return a;
          }) as (PeriodicElement, string) => boolean;

        });

        ( function($) {
          $('#ModalResponsable').modal('show');
        })(jQuery);

        this.pbMain = false;
        break;
    }
  }

  hideModal(modal: string, opc?: number) {

    const self = this;
    let nToogle: number;
    let nTada: number;

    switch (modal) {
      case '#ModalProvis':
        nToogle = this.toggleProvis;
        nTada = 1;
        break;

      case '#ModalResponsable':
        nToogle = 0;
        nTada = 0;
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
        this.hideModal('#ModalProvis');

        this.fgProvis.reset();
        this.aPersonal = [];
        this.fgSearch.reset();
        this.fgPerso.reset();
        this.fgInfoPerso.reset();

        this.fgSearch.controls['sNombres'].disable();
        this.fgPerso.controls['nImporte'].setValue(0);
        this.fgPerso.controls['nImporte'].disable();
        this.fgInfoPerso.controls['sCodPlla'].setValue('?');

        this.fgFilter.reset();
        this.ProvisDS = new MatTableDataSource([]);
        this.aBackup = [];

        this.mProvis = 0;
        this.fbView.forEach( x => { x.dis = false; });

        this.nCrud = 0;
        break;

      case 2:
        this.getSearch.sNombres.patchValue(undefined);
        this.getFilter.sNombres.patchValue('');

        this.ProvisDS.paginator = this.pagProvis;
        this.mtProvis.renderRows();

        if (this.ProvisDS.paginator) {
          this.ProvisDS.paginator.firstPage();
        }

        this.aPersonal.forEach( x => x.nStat = 0 );

        this.abProvis = [];
        this.delay(250).then(any => {
          this.abProvis = this.fbView;
          this.tsProvis = 'active';
        });

        this.toggleProvis = 3;
        this.mProvis = 2;
        this.fgSearch.controls['sNombres'].disable();

        break;

      case 3:
        this.fgResp.reset();
        this.ResponsableDS = new MatTableDataSource([]);
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

    let aInfoUser: Array<nsProvis.IInfoUser>;

    const param = [];
    param.push('0¡nCodUser!' + uid + '-' + '0¡nIdEmp!' + nIdEmp );
    param.push('2¡nIdEstado!2-0¡nIdEmp!' + nIdEmp + '-0¡nDadTipEle!135');
    param.push('6¡sCod!6001');
    param.push('0¡nIdPais!' + nIdPais);

    await this.service._loadSP( 1, param, this.url).then( async (value: any[]) => {
      Object.values ( value ).forEach( (lista: Array<any>, iLista: number) => {
        switch (iLista) {

          // Info User
          case 0:
            aInfoUser = lista as Array<nsProvis.IInfoUser>;

            this.fgInfoUser.patchValue({
              nIdPersonal: aInfoUser[0].nIdPersonal,
              sNombres: aInfoUser[0].sNombres,
              sTipo: aInfoUser[0].sTipo,
              sDocumento: aInfoUser[0].sDocumento,
            });
            break;

          // Devengue
          case 1:
            const aDevengue = lista as Array<nsProvis.IDevengue>;

            this.fgDevengue.patchValue({
              nIdDevengue: aDevengue[0].nIdDevengue,
              nEjercicio: aDevengue[0].nEjercicio,
              nMes: aDevengue[0].nMes
            });
            break;

          // Planilla
          case 2:
            this.aPlanilla = lista as Array<nsProvis.IPlanilla>;
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
            const aMain = lista as Array<nsProvis.IMain>;

            this.MainDS = new MatTableDataSource(aMain);
            this.MainDS.paginator = this.pagMain;
            this.MainDS.filterPredicate = function(data, filter: string): boolean {
              return data.sCentroCosto.trim().toLowerCase().includes(filter);
            };

            this.MainDS.filterPredicate = ((data: nsProvis.IMain, filter: any ) => {
              const a = !filter.nIdCliente || data.nIdCliente === filter.nIdCliente;
              const b = !filter.sCentroCosto || data.sCentroCosto.trim().toLowerCase().includes(filter.sCentroCosto.trim().toLowerCase());
              const c = !filter.dFecha || moment(filter.dFecha).format('YYYYMM') === moment(data.dFecha).format('YYYYMM');
              const d = !filter.nIdEstado || data.nIdEstado === filter.nIdEstado;
              const e = this.cantPerso(data.nIdProvis) > 0;
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
            this.aPerso = lista as Array<nsProvis.IPerso>;
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

    await this.service._loadSP( 4, param, this.url).then( (value: nsProvis.ICentroCosto[]) => {
      if (value.length > 0) {

        this.fgProvis.controls['T1_nIdCentroCosto'].setValue(value[0].nIdCentroCosto);
        this.fgProvis.controls['nCentroCosto'].setValue(sCodCC);
        this.fgProvis.controls['sCentroCosto'].setValue(value[0].sCentroCosto);
        this.fgProvis.controls['sCliente'].setValue(value[0].sCliente);

        bReturn = false;
      }
    });

    return bReturn;
  }

  async saldoCentroCosto(nIdCentroCosto) {
    let bReturn = true;

    const param = [];
    param.push('0¡nIdCentroCosto!' + nIdCentroCosto);

    await this.service._loadSP( 8, param, this.url).then( (value: nsProvis.ISaldoCC[]) => {
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

    await this.service._loadSP( 9, param, this.url).then( (value: nsProvis.IGastoCC[]) => {
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
        const dFecha = this.fgProvis.controls['T1_dFecha'].value as Date;
        nEjercicio = moment(dFecha).year();
        nMes = Number( moment(dFecha).format('MM') );
        break;
    }

    const param = [];
    const sEjercicio = nEjercicio.toString();
    const sMes = nMes.toString();
    const sEjMes = sEjercicio + ( (sMes.length === 1) ? '0' + sMes : sMes );
    // param.push('10¡dFecha!' + sEjMes + '-10¡dFecha!' + sEjMes + '|0¡nIdResp!' + nIdResp);

    // await this.service._loadSP( 5, param, this.url).then( (value: nsProvis.ITeamResp[]) => {
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

    return bReturn;
  }

  async gastoPersonal(nIdResp: number, nIdDevengue: number) {
    const param = [];
    param.push('0¡nIdResp!' + nIdResp + '-0¡nIdDevengue!' + nIdDevengue);

    await this.service._loadSP( 11, param, this.url).then( (value: nsProvis.IGastoP[]) => {
      if (value.length > 0) {
        this.aGastoP = value;
      }
    });
  }

  async loadProvis(nIdProvis: number) {
    const param = [];
    param.push('0¡A.nIdProvis!' + nIdProvis);
    await this.service._loadSP( 7, param, this.url).then( (value: nsProvis.IProvis[]) => {
      if (value.length > 0) {

        this.ProvisDS = new MatTableDataSource(value);
        this.ProvisDS.paginator = this.pagProvis;

        this.ProvisDS.filterPredicate = function(data, filter: string): boolean {
          return data.sNombres.trim().toLowerCase().includes(filter) || data.sDocumento.trim().toLowerCase().includes(filter);
        };

        this.ProvisDS.filterPredicate = ((data: nsProvis.IProvis, filter: any ) => {
          // tslint:disable-next-line: max-line-length
          const a = !filter.sNombres || ( data.sNombres.toLowerCase().includes(filter.sNombres.toLowerCase()) || data.sDocumento.toLowerCase().includes(filter.sNombres.toLowerCase()) );
          return a;
        }) as (PeriodicElement: any, string: any) => boolean;
      }
    });
  }

  cantPerso(nIdProvis: number) {
    const sText = this.fgMain.controls['sNombres'].value as string;
    const aFilter = this.aPerso.filter(x => {
      const a = x.nIdProvis === nIdProvis;
      // tslint:disable-next-line: max-line-length
      const b = !sText || (x.sNombres.toLowerCase().includes(sText.toLowerCase()) || x.sDocumento.toLowerCase().includes(sText.toLowerCase()));
      return a && b;
    });

    return aFilter.length;
  }

  async clickExpanded(row: nsProvis.IMain, element) {

    if (this.expandedMore === row) {
      // Limpiar
      this.expandedMore = null;
      this.ExpandedDS = new MatTableDataSource([]);

      if (this.ExpandedDS.paginator) {
        this.ExpandedDS.paginator.firstPage();
      }

      this.tsMore = 'inactive';

    } else {

      const param = [];
      param.push('0¡A.nIdProvis!' + row.nIdProvis);

      await this.service._loadSP(6, param, this.url).then((value: nsProvis.IExpanded[]) => {

        this.ExpandedDS = new MatTableDataSource(value);
        this.ExpandedDS.paginator = this.pagExpanded;

      });

      this.expandedMore = row;
      this.tsMore = 'active3';
    }

  }

  addPerso() {
    const nIdPersonal = this.fgPerso.controls['nIdPersonal'].value;

    if (this.fgPerso.invalid || nIdPersonal === null) {

      this._snackBar.open('Personal inválido.', 'Cerrar', {
        horizontalPosition: 'right',
        verticalPosition: 'top',
        duration: 1500
      });

    } else {

      const nImporte = this.fgPerso.controls['nImporte'].value as number;
      let iFind: number;

      const aFind = this.aPersonal.find((x: nsProvis.ITeamResp, index: number) => {
        iFind = index;
        return x.nIdPersonal === nIdPersonal;
      });

      const bError = this.checkCC(aFind.nIdSucursal, nImporte, nIdPersonal);

      if(!bError) {
        this._snackBar.open('Saldo insuficiente.', 'Cerrar', {
          horizontalPosition: 'right',
          verticalPosition: 'top',
          duration: 2500
        });
        return;
      }

      this.aPersonal[iFind].nStat = 1;

      const aData = this.ProvisDS.data;
      const iSplice = aData.findIndex( x => x.nIdPersonal === nIdPersonal);
      if ( iSplice > -1 ) {
        aData.splice(iSplice, 1);
      }

      aData.push({
        nIdPersonal: aFind.nIdPersonal,
        sNombres: aFind.sNombres,
        sCodPlla: aFind.sCodPlla,
        sDscTipo: aFind.sDscTipo,
        sDocumento: aFind.sDocumento,
        dFechIni: moment(aFind.dFechIni).toDate(),
        dFechFin: moment(aFind.dFechFin).toDate(),
        nIdSucursal: aFind.nIdSucursal,
        sCiudad: aFind.sCiudad,
        sTipo: '',
        nMontoMax: 0,
        nImporte: nImporte,
      });

      this.ProvisDS.data = aData;
      this.ProvisDS.paginator = this.pagProvis;
      this.mtProvis.renderRows();

      this.getSearch.sNombres.patchValue(undefined);
    }
  }

  checkCC(nIdSucursal: number, nImporte: number, nIdPersonal: number) : boolean {
    let bLog = true;
    let nSaldo: number;

    // Saldo CC
    nSaldo = this.aSaldoCC.filter( x => x.nIdSucursal === nIdSucursal )[0].nSaldo;

    // Gasto previo
    const nIdProvis = this.fgProvis.controls['T1_nIdProvis'].value;
    let nGasto = 0;
    this.aGastoCC.filter( x => {
      const a = x.nIdSucursal === nIdSucursal;
      const b = x.nIdProvis !== nIdProvis;
      return a && b;
    }).forEach( x => nGasto = nGasto + x.nGasto );
    nSaldo = nSaldo - nGasto;

    // Gasto actual
    let nSuma = 0;
    const aTable = this.ProvisDS.data;
    aTable.filter( x => {
      const a = x.nIdPersonal !== nIdPersonal;
      const b = x.nIdSucursal === nIdSucursal;
      return a && b;
    }).forEach( x => nSuma = nSuma + x.nImporte);
    nSaldo = nSaldo - nSuma;

    // Saldo restante - Importe
    if ( (nSaldo - nImporte) < 0 ) {
      bLog = false;
    }
    return bLog;
  }

  removePerso(pushParam: nsProvis.ITeamResp) {
    const nIdPersonal = pushParam.nIdPersonal;
    const aData = this.ProvisDS.data;
    const iData = aData.findIndex( x => x.nIdPersonal === nIdPersonal );
    aData.splice(iData, 1);
    this.ProvisDS.data = aData;
    this.ProvisDS.paginator = this.pagProvis;
    this.mtProvis.renderRows();

    const iArray = this.aPersonal.findIndex( x => x.nIdPersonal === nIdPersonal );
    this.aPersonal[iArray].nStat = 0;
  }

  editPerso(row: nsProvis.IProvis) {
    if ( this.mProvis === 1 ) {
      this.osPerso(row.nIdPersonal, 2);
      this.fgPerso.patchValue({
        nImporte: row.nImporte
      });
    }
  }

  async clickResp(element: nsProvis.IListaResp) {

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

  async saveProvis() {

    this.pbProvis = true;

    if ( this.ProvisDS.data.length === 0 ) {
      Swal.fire(
        'No se puede guardar',
        'Información incorrecta o incompleta',
        'error'
      );

      this.pbProvis = false;
      return;
    }

    const fControl = this.fgProvis.controls['T1_nIdProvis'] as FormControl;
    const nIdCentroCosto = this.fgProvis.controls['T1_nIdCentroCosto'].value;
    await this.gastoCentroCosto(nIdCentroCosto);

    let fText = '';

    this.aSaldoCC.forEach( x => {

      const nIdSucursal = x.nIdSucursal;
      let nSaldo = x.nSaldo;

      let nGasto = 0;
      this.aGastoCC.filter( x => {
        const a = x.nIdSucursal === nIdSucursal;
        const b = x.nIdProvis !== fControl.value;
        return a && b;
      }).forEach( x => nGasto = nGasto + x.nGasto );
      nSaldo = nSaldo - nGasto;

      let nSuma = 0;
      const aTable = this.ProvisDS.data;
      aTable.filter( x => x.nIdSucursal === nIdSucursal).forEach( x => nSuma = nSuma + x.nImporte);
      nSaldo = nSaldo - nSuma;

      if (nSaldo < 0) {
        fText = fText + x.sCiudad + ','
        return;
      }

    });

    if (fText !=='') {
      fText = fText.substring(0, fText.length - 1);
      Swal.fire(
        'No se puede guardar',
        'Saldo insuficiente en las ciudades de : ' + fText,
        'error'
      );
      this.pbProvis = false;
      return;
    }

    this.aParam = [];
    this.aParaml = [];

    // Usuario y Fecha con hora
    const user = localStorage.getItem('currentUser');
    const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

    // New - 1 | Edit - 2
    let oModo: number;
    oModo = ( fControl.value === 0 || fControl.value === null || fControl.value === undefined ) ? 1 : 2;

    if (oModo === 1) {
      fControl.setValue(null);

      this.aParam.push('T1¡nIdRegUser!' + uid);
      this.aParam.push('T1¡dtReg!GETDATE()');
      this.fgProvis.controls['T1_nIdEstado'].setValue(2193);
    } else {
      this.aParam.push('T1¡nIdModUser!' + uid);
      this.aParam.push('T1¡dtMod!GETDATE()');
    }
    fControl.markAsDirty();

    this.fnGetParam(this.fgProvis.controls, ( oModo === 2 ) ? true : undefined );

    let aResult = new Array();
    let result = await this.service._crudKP( ( oModo === 1 ) ? 1 : 3 , this.aParam, this.url);

    Object.keys( result ).forEach ( valor => {
      aResult.push(result[valor]);
    });

    let nIdProvis: number;
    let ftitle = '';
    let ftext = '';
    let ftype = '';

    if ( aResult.length > 0 ) {
      for (const e of aResult) {
        const iResult = aResult.indexOf(e);
        if (e.split('!')[0] !== '00') {
          nIdProvis = Number(e.split('!')[1]);
        } else {
          Swal.fire(
            'Inconveniente',
            e.split('!')[1],
            'error'
          );
          this.pbProvis = false;
          return;
        }
      }
    }
    nIdProvis = ( oModo === 2 ) ? fControl.value : nIdProvis;

    ftitle = ( oModo === 2 ) ? 'Actualización satisfactoria' : 'Registro satisfactorio';
    ftext = 'N° de Provis' + ( ( oModo === 2 ) ? 'modificado ' : 'generado ' ) + ' : ' + nIdProvis;
    ftype = 'success';

    if ( oModo === 2 ) {
      // Eliminar lineas con el codigo nIdProvis
      this.aParam = [];
      this.aParam.push('L1¡nIdProvis!' + nIdProvis);

      aResult = new Array();
      result = await this.service._crudKP(4, this.aParam, this.url);

      Object.keys( result ).forEach ( valor => {
        aResult.push(result[valor]);
      });

      for (const e of aResult) {
        const iResult = aResult.indexOf(e);
        if (e.split('!')[0] === '00') {
          Swal.fire(
            'Inconveniente',
            e.split('!')[1],
            'error'
          );
          this.pbProvis = false;
          return;
        }
      }
    }

    const aData = this.ProvisDS.data;
    let sParaml = '';

    this.aParaml.push('L1¡nIdProvis!' + nIdProvis);
    aData.forEach( x => {
      sParaml = '';
      sParaml = sParaml + 'L1¡nIdPersonal!' + x.nIdPersonal + '-';
      sParaml = sParaml + 'L1¡nIdSucursal!' + x.nIdSucursal + '-';
      sParaml = sParaml + 'L1¡nImporte!' + x.nImporte + '-';
      sParaml = sParaml + 'L1¡nIdRegUser!' + uid + '-';
      sParaml = sParaml + 'L1¡dtReg!GETDATE()';
      this.aParaml.push(sParaml);
    });
    await this.service._crudKP(2, this.aParaml, this.url);

    this.aParam = [];
    this.aParaml = [];

    Swal.fire(
      ftitle,
      ftext,
      (ftype !== 'error') ? 'success' : 'error'
    );

    // Recargar modal provis
    if ( ftype !== 'error' ) {
      this.nCrud = 1;
      await this.loadProvis(nIdProvis);
      this.cleanModal( oModo );
    }

    this.pbProvis = false;

  }

  //#endregion

  //#region Extra

  chosenYearHandler(normalizedYear: Moment) {
    let ctrlValue = this.fgMain.controls['dFecha'].value;
    ctrlValue = (ctrlValue === null) ? moment() : ctrlValue;
    ctrlValue.year(normalizedYear.year());
    this.fgMain.controls['dFecha'].setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    let ctrlValue = this.fgMain.controls['dFecha'].value;
    ctrlValue = (ctrlValue === null) ? moment() : ctrlValue;
    ctrlValue.month(normalizedMonth.month());
    this.fgMain.controls['dFecha'].setValue(ctrlValue);
    datepicker.close();
  }

  clickFlipCard() {
    if ( this.mProvis === 1 ) {
      ( function($) {
        $('#card_inner').toggleClass('is-flipped');
      })(jQuery);
    }
  }

  MomentDate(pushParam: any) {
    moment.locale('es');
    const tDate = moment(pushParam).format('MMMM [del] YYYY');
    return tDate[0].toUpperCase() + tDate.substr(1).toLowerCase();
  }

  mouseOver(opc: number, element: any) {
    switch (opc) {
      case 1:
        if ( this.mProvis === 1 ) {
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

  osPerso(event: any, opc: number) {

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
    this.fgPerso.controls['nIdSucursal'].setValue(aFind.nIdSucursal);
    this.fgPerso.controls['nImporte'].enable();

    const nIdProvis = this.fgProvis.controls['T1_nIdProvis'].value;
    let nGastoP = 0;
    this.aGastoP.filter( x => {
      const a = x.nIdProvis !== nIdProvis;
      const b = x.nIdPersonal === vEvent;
      return a && b;
    }).forEach( x => nGastoP = nGastoP + x.nSuma );

    this.fgInfoPerso.patchValue({
      sCodPlla: aFind.sCodPlla,
      sTipo: aFind.sDscTipo,
      sDocumento: aFind.sDocumento,
      dFechIni: moment(aFind.dFechIni).toDate(),
      dFechFin: moment(aFind.dFechFin).toDate(),
      sCiudad: aFind.sCiudad,
      nMontoMax: aFind.nMontoMax - nGastoP
    });

    this.abPerso = this.fbPerso;
    this.tsPerso = 'active';
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
    }

    this.delay(1000).then(any => {
      switch (nTada) {
        case 1:
          this.tadaMain = 'inactive';
          break;
      }
    });
  }

  //#endregion
}
