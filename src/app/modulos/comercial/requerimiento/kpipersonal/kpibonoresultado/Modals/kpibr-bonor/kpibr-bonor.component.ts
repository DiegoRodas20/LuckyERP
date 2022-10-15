import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { ValidadoresService } from 'src/app/modulos/egy-humana/JefaturaAP/Validators/validadores.service';
import Swal from 'sweetalert2';
import { nsBonoR } from '../../../../model/Ikpibr';
import { KpiiServiceBonoResultado } from 'src/app/modulos/comercial/requerimiento/kpipersonal/kpibonoresultado/kpibonoresultado.service';
import { kpiiAnimations } from './kpibr-bonor.animations';


declare var jQuery: any;
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-kpibr-bonor',
  templateUrl: './kpibr-bonor.component.html',
  styleUrls: ['./kpibr-bonor.component.css', './kpibr-bonor.component.scss' ],
  animations: [kpiiAnimations],
  providers : [KpiiServiceBonoResultado]
})
export class KpibrBonoRComponent implements OnInit {
  @Input() fromParent;


  url: string;
  pbResp: boolean;

  //#region Variables
matcher = new MyErrorStateMatcher();
panelOpenState = true;
panelOpenDis = true;
expandedMore: nsBonoR.IMain;
editTable: nsBonoR.IBonoR;
selectResp: nsBonoR.IListaResp;
mBonoR: number;
fileSustento: File;
nCrud = 0;
aBackup: any;
pbBonoR: boolean;
pbSustento: boolean;

panelDisabledSeleccion = false;

fbSustento = [
  {icon: 'cloud_download', tool: 'Descargar'}
];
abSustento = [];
tsSustento = 'inactive';
urlSustento: string;
//#endregion

aParaml = [];
  aParam = [];
  abBonoR = [];
  tsBonoR = 'active';
  toggleBonoR = 0;

  abPerso = [];
  tsPerso = 'inactive';
  // Card

  BonoTrimetralDS: MatTableDataSource<nsBonoR.IBonoR> = new MatTableDataSource([]);
//#region  Mat Table
  BonoRDC: string[] = ['sPersoImg', 'sNombres',  'action'];
  // BonoRDC: string[] = ['sPersoImg', 'sNombres', 'nNeto', 'nBruto', 'action'];
  BonoRDS: MatTableDataSource<nsBonoR.IBonoR> = new MatTableDataSource([]);
  @ViewChild('pagBono', {static: false}) pagBono: MatPaginator;
  @ViewChild('mtBonoR', {static: false}) mtBonoR: MatTable<any>;
//#endregion

// Array
aPersonal: nsBonoR.ITeamResp[] = [];
aSaldoCC: nsBonoR.ISaldoCC[] = [];
aValidarFechaCC: nsBonoR.IValidarFechaCC[] = [];
aGastoCC: nsBonoR.IGastoCC[] = [];


// Autocomplete
saPersonal = false;
//#region Formulario
  fgBonoR: FormGroup;
  fgPerso: FormGroup;
  fgDevengue: FormGroup;
  fgSearch: FormGroup;
  foPersonal: Observable<any[]>;
  fgInfoPerso: FormGroup;
  fgFilter: FormGroup;
//#endregion
cboCentroCosto = new Array();

//#region  Fab Button
fbView = [
  {icon: 'create', tool: 'Editar', dis: false},
  {icon: 'preview', tool: 'Visualizar sustento', dis: false},
  {icon: 'forward_to_inbox', tool: 'Enviar', dis: false},
  {icon: 'delete_forever', tool: 'Eliminar', dis: false},
];

  fbNew_1 = [
    {icon: 'cloud_upload', tool: 'Cargar sustento', dis: false},
    {icon: 'cancel', tool: 'Cancelar', dis: false}
  ];

  fbNew_2 = [
    {icon: 'change_circle', tool: 'Reemplazar sustento', dis: false},
    {icon: 'save', tool: 'Guardar', dis: false},
    {icon: 'cancel', tool: 'Cancelar', dis: false}
  ];
  fbPerso = [
    {icon: 'person_add', tool: 'Añadir', dis: false},
    {icon: 'cleaning_services', tool: 'Limpiar', dis: false},
  ];
  //#endregion
   // Animaciones Tada
//  tadaMain = 'inactive';
 tadaBonoR = 'inactive';

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder, @Inject('BASE_URL') baseUrl: string,
   private spi: NgxSpinnerService, public service: KpiiServiceBonoResultado,
   private _snackBar: MatSnackBar, private valid: ValidadoresService) { 
    this.url = baseUrl;
    this.new_fgPerso();
    this.new_fgDevengue();
    this.new_fgSearch();
    this.new_fgInfoPerso();
    this.new_fgFilter();
    this.new_fgBonoR();
   }
     //#region  Instanciar FormGroup
  new_fgFilter() {
    this.fgFilter = this.fb.group({
      sNombres: null
    });

    this.fgFilter.valueChanges.subscribe( value => {

      if (value.sNombres !== null) {

        const filter = {...value, name: value.sNombres.trim().toLowerCase()} as string;
        this.BonoRDS.filter = filter;

        if (this.BonoRDS.paginator) {
          this.BonoRDS.paginator.firstPage();
        }

      }
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

  new_fgBonoR() {
    this.fgBonoR = this.fb.group({
      T1_nIdBonoR: [ { value: null, disabled: true }, [ Validators. required ] ],
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

      this.fgPerso.controls['nNeto'].setValue(0);
      this.fgPerso.controls['nNeto'].disable();
      this.fgInfoPerso.controls['sCodPlla'].setValue('?');

      this.abPerso = [];
      this.tsPerso = 'inactive';
    });
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

  new_fgPerso() {
    this.fgPerso = this.fb.group({
      nIdPersonal: [ { value: 0, disabled: true }, [ Validators.required ] ],
      nIdSucursal: [ { value: 0, disabled: true }, [ Validators.required ] ],
      nNeto: [ { value: 0, disabled: true }, [ this.valid.vMonto ] ],
      nBruto: [ { value: 0, disabled: true }, [ this.valid.vMonto ] ]
    });

    this.fgPerso.controls['nNeto'].valueChanges.subscribe( (value: number) => {
      if (value > 0 && value !== null) {
        const nNeto = value;
        const nMontoRegPen = this.fgInfoPerso.controls['nMontoRegPen'].value;
        const nBruto = nNeto / ( ( 100 - nMontoRegPen ) / 100 );
        this.fgPerso.controls['nBruto'].setValue(nBruto.toFixed(2));
      } else {
        this.fgPerso.controls['nBruto'].setValue(0);
      }
    });

  }

  new_fgDevengue() {
    this.fgDevengue = this.fb.group({
      nIdDevengue: 0,
      nEjercicio: 0,
      nMes: 0
    });
  }

//#endregion

async clickFab(opc: number, index: number) {
  const self = this;
  const nIdBonoR = this.fgBonoR.controls['T1_nIdBonoR'].value;
  this.pbBonoR = true;
  switch (opc) {
      case 0:
        switch (index) {
          case 0:
            ( function($) {
              $('#uploadFile2').click();
            })(jQuery);
            break;
          case 1:
          this.activeModal.dismiss();
        break;
        }
        break;

      case 1:
        // this.cleanModal(1);
        break;

      case 2:
        switch (index) {
          case 0:
            ( function($) {
              $('#uploadFile2').click();
            })(jQuery);
            break;
          case 1:
          this.activeModal.dismiss();
        break;
        }
        break;

      case 3:
        switch (index) {
          case 0:
            ( function($) {
              $('#uploadFile2').click();
            })(jQuery);
          break;
          case 1:
            if ( nIdBonoR !== null ) {
              this.updateBonoR();
            } else {
              this.saveBonoR();
            }
          break;
          case 2:
            if ( nIdBonoR !== null ) {
              // this.BonoRDS.data = JSON.parse(this.aBackup);
              this.onToggleFab(2, 1);
              this.fileSustento = undefined;
            } else {
              this.onToggleFab(2, 1);
              this.fileSustento = undefined;
            }
            break;
          }
          break;
      case 4:
            switch (index) {
              // case -1:
              //   this.cleanModal(1);
              //   break;
              case 0:
                Swal.fire({
                  title: '¿ Estas seguro de modificar el bono?',
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonColor: '#ff4081',
                  confirmButtonText: 'Confirmar !',
                  allowOutsideClick: false
                }).then(async (result) => {
                  if (result.isConfirmed) {

                    const nIdResp = this.BonoTrimetralDS.data[0].nIdPersonal;
                    await this.loadTeamResp(2, nIdResp);

                    const aData = this.BonoTrimetralDS.data;
                    aData.forEach( x => {
                      const nIdPersonal = x.nIdPersonal;
                      this.aPersonal.find( y => y.nIdPersonal === nIdPersonal ).nStat = 1;
                    });

                    this.abBonoR = [];
                    this.delay(250).then(any => {
                      this.abBonoR = this.fbNew_2;
                      this.tsBonoR = 'active';
                    });

                    this.toggleBonoR = 3;
                    this.mBonoR = 1;
                    this.fgSearch.controls['sNombres'].enable();
                    return;
                  }
                });

                break;

              case 1:

                this.urlSustento = this.fgBonoR.controls['T1_sFileSustento'].value;

                ( function($) {
                  // $('#ModalIncentivo').modal('hide');
                  $('#ModalSustento').modal('show');
                  $('#ModalSustento').on('shown.bs.modal', function () {
                    self.onToggleFab(6, 1);
                    self.onToggleFab(self.toggleBonoR, 0);
                  });
                })(jQuery);
                break;

              case 2:

                Swal.fire({
                  title: '¿ Estas seguro de enviar el bono?',
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonColor: '#ff4081',
                  confirmButtonText: 'Confirmar !',
                  allowOutsideClick: false
                }).then(async (result) => {
                  if (result.isConfirmed) {

                    this.pbBonoR = true;

                    this.aParam = [];
                    this.aParam.push('T1¡nIdBonoR!' + nIdBonoR);
                    this.aParam.push('T1¡nIdEstado!2194');

                    // Usuario y Fecha con hora
                    const user = localStorage.getItem('currentUser');
                    const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

                    this.aParam.push('T1¡nIdModUser!' + uid);
                    this.aParam.push('T1¡dtMod!GETDATE()');

                    const aResult = new Array();
                    const res = await this.service._crudKI( 3, this.aParam, this.url );

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
                        this.pbBonoR = false;
                        return;
                      }
                    }

                    ftitle = 'Bono enviado';
                    ftext = 'N° de Bono enviado : ' + nIdBonoR;
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

                    this.pbBonoR = false;
                    const oReturn = new Object();
                    oReturn['modal'] = 'new';
                    oReturn['value'] = 'loadAgain';
                    this.activeModal.close(oReturn);
                  }
                });
                break;

              case 3:

                Swal.fire({
                  title: '¿ Estas seguro de eliminar el bono?',
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonColor: '#ff4081',
                  confirmButtonText: 'Confirmar !',
                  allowOutsideClick: false
                }).then(async (result) => {
                  if (result.isConfirmed) {

                    this.pbBonoR = true;

                    this.aParam = [];
                    this.aParam.push('T1¡nIdBonoR!' + nIdBonoR);
                    this.aParam.push('T2¡nIdBonoR!' + nIdBonoR);

                    const aResult = new Array();
                    const res = await this.service._crudKI( 5, this.aParam, this.url );

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
                        this.pbBonoR = false;
                        return;
                      }
                    }

                    ftitle = 'Bono eliminado';
                    ftext = 'N° de bono eliminado : ' + nIdBonoR;
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

                    this.pbBonoR = false;
                    this.activeModal.dismiss();
                  }
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
      case 6: switch (index) {
        case -1:

          this.hideModal('#ModalSustento');
          this.onToggleFab(4, 1);

          this.urlSustento = '';
          break;

        case 0:
          let sFileName = this.fgBonoR.controls['T1_sFileSustento'].value as string;
          sFileName = sFileName.split('/')[4];

          this.pbSustento = true;
          this.service._downloadFile(sFileName,  'application/xlsx', 5, this.url).subscribe(
            (res: any) => {
              const file = `Kpi_Incentivo_${Math.random()}.pdf`;
              saveAs(res, file);
              this.pbSustento = false;
            },
            err => {
              console.log(err);
              this.pbSustento = false;
            },
            () => {}
          );
          break;
      }
      break;
      }
  this.pbBonoR = false;

        // this.cleanModal(1);
  }
  hideModal(modal: string, opc?: number) {

    const self = this;
    let nToogle: number;
    let nTada: number;

    switch (modal) {

      case '#ModalSustento':
        nToogle = 4;
        nTada = 1;
        break;

    }

    this.onToggleFab(nToogle, 0);

    // ( function($) {
    //   $(modal).modal('hide');
    //   $(modal).on('hidden.bs.modal', function () {
    //     self.animate(nTada);
    //   });
    // })(jQuery);
  }

onToggleFab(fab: number, stat: number) {
  switch (fab) {

    case 2:
      stat = ( stat === -1 ) ? ( this.abBonoR.length > 0 ) ? 0 : 1 : stat;
      this.tsBonoR = ( stat === 0 ) ? 'inactive' : 'active';
      this.abBonoR = ( stat === 0 ) ? [] : this.fbNew_1;
      break;

    case 3:
      stat = ( stat === -1 ) ? ( this.abBonoR.length > 0 ) ? 0 : 1 : stat;
      this.tsBonoR = ( stat === 0 ) ? 'inactive' : 'active';
      this.abBonoR = ( stat === 0 ) ? [] : this.fbNew_2;
      break;
   case 4:
      stat = ( stat === -1 ) ? ( this.abBonoR.length > 0 ) ? 0 : 1 : stat;
      this.tsBonoR = ( stat === 0 ) ? 'inactive' : 'active';
      this.abBonoR = ( stat === 0 ) ? [] : this.fbView;
   break;

    case 5:
       stat = ( stat === -1 ) ? ( this.abPerso.length > 0 ) ? 0 : 1 : stat;
       this.tsPerso = ( stat === 0 ) ? 'inactive' : 'active';
       this.abPerso = ( stat === 0 ) ? [] : this.fbPerso;
       break;
    case 6:
      stat = ( stat === -1 ) ? ( this.abSustento.length > 0 ) ? 0 : 1 : stat;
      this.tsSustento = ( stat === 0 ) ? 'inactive' : 'active';
      this.abSustento = ( stat === 0 ) ? [] : this.fbSustento;
      break;

  }
}

clickFlipCard() {
  if ( this.mBonoR === 1 ) {
    ( function($) {
      $('#card_inner2').toggleClass('is-flipped');
    })(jQuery);
  }
}

displayWith(obj?: any): string {
  return obj ? obj.sNombres : '';
}

uploadFile2(event) {
  if (event.target.files[0]) {

    this.abBonoR = [];
    this.toggleBonoR = 3;
    this.delay(250).then(any => {
      this.onToggleFab(this.toggleBonoR, 1);
    });

    this.fileSustento = event.target.files[0];

  }
}

async ngOnInit(): Promise<void> {

  this.pbBonoR = true;

  if (this.fromParent.aVisualizar === 1) {
    this.toggleBonoR = 4;
    this.mBonoR = 2;
    await this.loadBonoR(this.fromParent.fgBonoR.controls['T1_nIdBonoR'].value);
    this.BonoTrimetralDS = this.fromParent.BonoTrimetralDS;
    this.aBackup = JSON.stringify(this.BonoTrimetralDS.data);
    if (this.fromParent.nIdEstado !== 2193) {
      // this.fbView.forEach( (x, i: number) => { x.dis = ( i !== 1 ) ? true : false ; });
      this.fbView[0].dis = true;
      this.fbView[2].dis = true;
      this.fbView[3].dis = true;
      this.panelDisabledSeleccion = true;
    }
    this.onToggleFab(4, 1);
  } else {
    this.mBonoR = 1;
    this.panelDisabledSeleccion = false;
    this.onToggleFab(2, 1);
  }

    this.fgDevengue =  this.fromParent.fgDevengue;
    this.fgBonoR =  this.fromParent.fgBonoR;
    this.aPersonal =  this.fromParent.aPersonal;
    this.aSaldoCC = this.fromParent.aSaldoCC;
    this.aGastoCC = this.fromParent.aGastoCC;
    this.cboCentroCosto = this.fromParent.cboCentroCosto;
    this.fgSearch.controls['sNombres'].enable();

  this.pbBonoR = false;

    // const nIdDevengue = fgDevengue.controls['nIdDevengue'].value;
  }

  async cleanModal(opc: number) {
    switch (opc) {
      //#region Case 1
       case 1:
        this.fgBonoR.reset();
        this.aPersonal = [];
        this.fgSearch.reset();
        this.fgPerso.reset();
        this.fgInfoPerso.reset();

        this.fgSearch.controls['sNombres'].disable();
        this.fgPerso.controls['nNeto'].setValue(0);
        this.fgPerso.controls['nNeto'].disable();
        this.fgInfoPerso.controls['sCodPlla'].setValue('?');

        this.fgFilter.reset();
        this.BonoRDS = new MatTableDataSource([]);
        this.aBackup = [];

        this.mBonoR = 0;
        this.fbView.forEach( x => { x.dis = false; });

        this.nCrud = 0;
        this.fileSustento = undefined;
        break;
      //#endregion

      case 2:
        this.getSearch.sNombres.patchValue(undefined);
        this.getFilter.sNombres.patchValue('');

        this.BonoRDS.paginator = this.pagBono;
        this.mtBonoR.renderRows();

        if (this.BonoRDS.paginator) {
          this.BonoRDS.paginator.firstPage();
        }

        this.aPersonal.forEach( x => x.nStat = 0 );

        this.abBonoR = [];
        this.delay(250).then(any => {
          this.abBonoR = this.fbView;
          this.tsBonoR = 'active';
        });

        this.toggleBonoR = 4;
        this.mBonoR = 2;
        this.fgSearch.controls['sNombres'].disable();

        break;
    }
  }


  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms)).then();
  }

  async loadBonoR(nIdBonoR: number) {
    const param = [];
    param.push('0¡A.nIdBonoR!' + nIdBonoR);
    await this.service._loadSP( 7, param, this.url).then( (value: nsBonoR.IBonoR[]) => {
      if (value.length > 0) {

        this.BonoRDS = new MatTableDataSource(value);
        this.BonoRDS.paginator = this.pagBono;

        this.BonoRDS.filterPredicate = function(data, filter: string): boolean {
          return data.sNombres.trim().toLowerCase().includes(filter) || data.sDocumento.trim().toLowerCase().includes(filter);
        };

        this.BonoRDS.filterPredicate = ((data: nsBonoR.IBonoR, filter: any ) => {
          // tslint:disable-next-line: max-line-length
          const a = !filter.sNombres || ( data.sNombres.toLowerCase().includes(filter.sNombres.toLowerCase()) || data.sDocumento.toLowerCase().includes(filter.sNombres.toLowerCase()) );
          return a;
        }) as (PeriodicElement: any, string: any) => boolean;
      }
    });
  }

  animate(nTada: number) {
    switch (nTada) {
      case 1:
        // this.tadaMain = 'active';
        break;

      case 2:
        this.tadaBonoR = 'active';
        break;
    }

    this.delay(1000).then(any => {
      switch (nTada) {
        case 1:
          // this.tadaMain = 'inactive';
          break;

        case 2:
          this.tadaBonoR = 'inactive';
          break;
      }
    });
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
    this.fgPerso.controls['nNeto'].enable();

    this.fgInfoPerso.patchValue({
      sCodPlla: aFind.sCodPlla,
      sTipo: aFind.sDscTipo,
      sDocumento: aFind.sDocumento,
      dFechIni: moment(aFind.dFechIni).toDate(),
      dFechFin: moment(aFind.dFechFin).toDate(),
      sCiudad: aFind.sCiudad,
      nMontoRegPen: aFind.nMontoRegPen
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

  async addPerso() {
    let lError = false;
    const nIdPersonal = this.fgPerso.controls['nIdPersonal'].value;
    const nIdCentroCosto = this.fgBonoR.controls['T1_nIdCentroCosto'].value;
    lError = await this.saldoCentroCosto(nIdCentroCosto);
    if (this.fgPerso.invalid || nIdPersonal === null) {

      this._snackBar.open('Personal inválido.', 'Cerrar', {
        horizontalPosition: 'right',
        verticalPosition: 'top',
        duration: 1500
      });

    } else {

      const nNeto = this.fgPerso.controls['nNeto'].value;
      const nBruto = this.fgPerso.controls['nBruto'].value as number;
      let iFind: number;

      const aFind = this.aPersonal.find( (x: nsBonoR.ITeamResp, index: number) => {
        iFind = index;
        return x.nIdPersonal === nIdPersonal;
      });

      const bError = this.checkCC(aFind.nIdSucursal, nBruto, nIdPersonal);

      if (!bError) {
        this._snackBar.open('Saldo insuficiente.', 'Cerrar', {
          horizontalPosition: 'right',
          verticalPosition: 'top',
          duration: 2500
        });
        return;
      }
      const fecha_devengue = this.fgBonoR.controls['T1_dFecha'].value as Date;

      let cError = false;
      cError = await this.checkFechaBono(fecha_devengue);

      if (!cError) {
        this._snackBar.open('Bono fuera de fecha.', 'Cerrar', {
          horizontalPosition: 'right',
          verticalPosition: 'top',
          duration: 2500
        });
        return;
      }

      this.aPersonal[iFind].nStat = 1;

      const aData = this.BonoRDS.data;
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
        sTipo: aFind.sTipo,
        nMontoRegPen: aFind.nMontoRegPen,
        nNeto: nNeto,
        nBruto: nBruto
      });

      this.BonoRDS.data = aData;
      this.BonoRDS.paginator = this.pagBono;
      this.mtBonoR.renderRows();

      this.getSearch.sNombres.patchValue(undefined);
    }
  }

  async saldoCentroCosto(nIdCentroCosto) {
    let bReturn = true;

    const param = [];
    param.push('0¡nIdCentroCosto!' + nIdCentroCosto);

    await this.service._loadSP( 8, param, this.url).then( (value: nsBonoR.ISaldoCC[]) => {
      if (value.length > 0) {
        this.aSaldoCC = value;
        bReturn = false;
      }
    });

    return bReturn;
  }

  async checkFechaBono(fecha_devengue)  {
    let bReturn = false;

        const MesLimite =  Number( moment(fecha_devengue).format('MM') );

        if ( MesLimite === 1 || MesLimite === 4 || MesLimite === 7 || MesLimite === 10 ) {
          bReturn = true;
        }
      // }
    // });

    return bReturn;
  }
  checkCC(nIdSucursal: number, nImporte: number, nIdPersonal: number): boolean {
    let bLog = true;
    let nSaldo: number;

    // Saldo CC
    nSaldo = this.aSaldoCC.filter( x => x.nIdSucursal === nIdSucursal )[0].nSaldo;

    // Gasto previo
    const nIdBonoR = this.fgBonoR.controls['T1_nIdBonoR'].value;
    let nGasto = 0;
    this.aGastoCC.filter( x => {
      const a = x.nIdSucursal === nIdSucursal;
      const b = x.nIdBonoR !== nIdBonoR;
      return a && b;
    }).forEach( x => nGasto = nGasto + x.nGasto );
    nSaldo = nSaldo - nGasto;

    // Gasto actual
    let nSuma = 0;
    const aTable = this.BonoRDS.data;
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

  mouseOver(opc: number, element: any) {
    switch (opc) {
      case 1:
        if ( this.mBonoR === 1 ) {
          this.editTable = element;
        }
        break;

      case 2:
        this.selectResp = element;
        break;
    }
  }

  removePerso(pushParam: nsBonoR.ITeamResp) {
    const nIdPersonal = pushParam.nIdPersonal;
    const aData = this.BonoRDS.data;
    const iData = aData.findIndex( x => x.nIdPersonal === nIdPersonal );
    aData.splice(iData, 1);
    this.BonoRDS.data = aData;
    this.BonoRDS.paginator = this.pagBono;
    this.mtBonoR.renderRows();

    const iArray = this.aPersonal.findIndex( x => x.nIdPersonal === nIdPersonal );
    this.aPersonal[iArray].nStat = 0;
  }

  editPerso(row: nsBonoR.IBonoR) {
    if ( this.mBonoR === 1 ) {
      this.osPerso(row.nIdPersonal, 2);
      this.fgPerso.patchValue({
        nBruto: row.nBruto,
        nNeto: row.nNeto
      });
    }
  }

  async updateBonoR() {

    this.pbBonoR = true;

    if ( this.BonoRDS.data.length === 0 ) {
      Swal.fire(
        'No se puede guardar',
        'Información incorrecta o incompleta',
        'error'
      );

      this.pbBonoR = false;
      return;
    }

    this.aParam = [];
    this.aParaml = [];

    // Usuario y Fecha con hora
    const user = localStorage.getItem('currentUser');
    const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

    this.aParam.push('T1¡nIdModUser!' + uid);
    this.aParam.push('T1¡dtMod!GETDATE()');

    if ( this.fileSustento !== undefined ) {

      // Eliminar archivo de sustento anterior
      let sFileName = this.fgBonoR.controls['T1_sFileSustento'].value as string;
      sFileName = sFileName.split('/')[4];
      this.service._deleteFile(sFileName, 'application/xlsx', 5, this.url);

      // File Sustento
      const sFile = await this.getStringFromFile(this.fileSustento);
      const iFile = sFile.indexOf(',') + 1;
      const sFileSustento = sFile.substring(iFile, sFile.length);
      const UploadFile: any = await this.service._uploadFile(sFileSustento, 5, 'KpiBonoR', 'application/xlsx', this.url);
      this.fgBonoR.controls['T1_sFileSustento'].setValue(UploadFile.fileUrl);
    }

    const nIdBonoR = this.fgBonoR.controls['T1_nIdBonoR'].value;
    this.aParam.push('T1¡nIdBonoR!' + nIdBonoR);

    let aResult = new Array();
    let result = await this.service._crudKI( 3, this.aParam, this.url );

    Object.keys( result ).forEach ( valor => {
      aResult.push(result[valor]);
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
        this.pbBonoR = false;
        return;
      }
    }

    ftitle = 'Actualización satisfactoria';
    ftext = 'N° de Bono actualizado : ' + nIdBonoR;
    ftype = 'success';

    // Eliminar lineas con el codigo nIdBonoR
    this.aParam = [];
    this.aParam.push('L1¡nIdBonoR!' + nIdBonoR);

    aResult = new Array();
    result = await this.service._crudKI( 4, this.aParam, this.url );

    Object.keys( result ).forEach ( valor => {
      aResult.push(result[valor]);
    });

    for (const e of aResult) {
      if (e.split('!')[0] === '00') {
        Swal.fire(
          'Inconveniente',
          e.split('!')[1],
          'error'
        );
        this.pbBonoR = false;
        return;
      }
    }

    const aData = this.BonoRDS.data;
    let sParaml = '';

    this.aParaml.push('T1¡nIdBonoR!' + nIdBonoR);
    aData.forEach( x => {
      sParaml = '';
      sParaml = sParaml + 'T1¡nIdPersonal!' + x.nIdPersonal + '-';
      sParaml = sParaml + 'T1¡nIdSucursal!' + x.nIdSucursal + '-';
      sParaml = sParaml + 'T1¡nNeto!' + x.nNeto + '-';
      sParaml = sParaml + 'T1¡nBruto!' + x.nBruto + '-';
      sParaml = sParaml + 'T1¡nIdRegUser!' + uid + '-';
      sParaml = sParaml + 'T1¡dtReg!GETDATE()';
      this.aParaml.push(sParaml);
    });
    await this.service._crudKI(2, this.aParaml, this.url);

    this.aParam = [];
    this.aParaml = [];

    Swal.fire(
      ftitle,
      ftext,
      (ftype !== 'error') ? 'success' : 'error'
    );

    // Recargar modal incentivo
    if ( ftype !== 'error' ) {
      this.nCrud = 1;
      await this.loadBonoR(nIdBonoR);
      this.cleanModal(2);
    }

    this.pbBonoR = false;
    const oReturn = new Object();
    oReturn['modal'] = 'new';
    oReturn['value'] = 'loadAgain';
    this.activeModal.close(oReturn);
  }

  async saveBonoR() {
    if ( this.BonoRDS.data.length === 0 ) {
      Swal.fire(
        'No se puede guardar',
        'Información incorrecta o incompleta',
        'error'
      );

      this.pbBonoR = false;
      return;
    }

    // Validamos centro de costo nuevamente
    this.pbBonoR = true;
    const nIdBonoR = this.fgBonoR.controls['T1_nIdBonoR'].value;
    const nIdCentroCosto = this.fgBonoR.controls['T1_nIdCentroCosto'].value;
    await this.gastoCentroCosto(nIdCentroCosto);

    let fText = '';

    this.aSaldoCC.forEach( val => {

      const nIdSucursal = val.nIdSucursal;
      let nSaldo = val.nSaldo;

      let nGasto = 0;
      this.aGastoCC.filter( x => {
        const a = x.nIdSucursal === nIdSucursal;
        const b = x.nIdBonoR !== nIdBonoR;
        return a && b;
      }).forEach( x => nGasto = nGasto + x.nGasto );
      nSaldo = nSaldo - nGasto;

      let nSuma = 0;
      const aTable = this.BonoRDS.data;
      aTable.filter( x => x.nIdSucursal === nIdSucursal).forEach( x => nSuma = nSuma + x.nBruto);
      nSaldo = nSaldo - nSuma;

      if (nSaldo < 0) {
        fText = fText + val.sCiudad + ',';
        return;
      }

    });

    if (fText !== '') {
      fText = fText.substring(0, fText.length - 1);
      Swal.fire(
        'No se puede guardar',
        'Saldo insuficiente en las ciudades de : ' + fText,
        'error'
      );
      this.pbBonoR = false;
      return;
    }

    this.aParam = [];
    this.aParaml = [];

    // Usuario y Fecha con hora
    const user = localStorage.getItem('currentUser');
    const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

    this.aParam.push('T1¡nIdRegUser!' + uid);
    this.aParam.push('T1¡dtReg!GETDATE()');
    this.fgBonoR.controls['T1_nIdEstado'].setValue(2193);

    // File Sustento
    const sFile = await this.getStringFromFile(this.fileSustento);
    const iFile = sFile.indexOf(',') + 1;
    const sFileSustento = sFile.substring(iFile, sFile.length);
    const UploadFile: any = await this.service._uploadFile(sFileSustento, 5, 'kpiBonoR', 'application/xlsx', this.url);
    this.fgBonoR.controls['T1_sFileSustento'].setValue(UploadFile.fileUrl);

    this.fnGetParam(this.fgBonoR.controls);

    const aData = this.BonoRDS.data;
    let sParaml = '';

    this.aParaml.push('T1¡nIdBonoR!');
    aData.forEach( x => {
      sParaml = '';
      sParaml = sParaml + 'T1¡nIdPersonal!' + x.nIdPersonal + '-';
      sParaml = sParaml + 'T1¡nIdSucursal!' + x.nIdSucursal + '-';
      sParaml = sParaml + 'T1¡nNeto!' + x.nNeto + '-';
      sParaml = sParaml + 'T1¡nBruto!' + x.nBruto + '-';
      sParaml = sParaml + 'T1¡nIdRegUser!' + uid + '-';
      sParaml = sParaml + 'T1¡dtReg!GETDATE()';
      this.aParaml.push(sParaml);
    });

    const aResult = new Array();
    const result = await this.service._crudKI( 1, this.aParam, this.url );

    Object.keys( result ).forEach ( valor => {
      aResult.push(result[valor]);
    });

    let ftitle = '';
    let ftext = '';
    let ftype = '';

    let codParaml;
    for (const e of aResult) {

      const iResult = aResult.indexOf(e);

      if (e.split('!')[0] !== '00') {

        if (iResult === 0) {
          ftitle = 'Registro satisfactorio';
          ftext = 'N° de Bono generado : ' + e.split('!')[1];
          ftype = 'success';
        }

        codParaml = '';
        this.aParaml
        .filter( (pl: string) => pl.substr(pl.length - 1) === '!' && pl.includes(e.split('!')[0]) )
        .forEach( pl => {
          const index = this.aParaml.indexOf(pl);
          this.aParaml[index] =  this.aParaml[index] + e.split('!')[1] ;
          codParaml = this.aParaml[index].substring(0, pl.indexOf('¡'));
        });
        if (codParaml !== '') {
          await this.service._crudKI(2, this.aParaml.filter( (pl: string) => pl.includes(codParaml) ), this.url);
        }
      } else {
        ftitle = 'Inconveniente';
        ftext = e.split('!')[1];
        ftype = 'error';
        break;
      }

    }

    this.aParam = [];
    this.aParaml = [];

    Swal.fire(
      ftitle,
      ftext,
      (ftype !== 'error') ? 'success' : 'error'
    );

    if ( ftype !== 'error' ) {
      this.nCrud = 1;
      this.cleanModal(1);
    }

    this.pbBonoR = false;

    const oReturn = new Object();
    oReturn['modal'] = 'new';
    oReturn['value'] = 'loadAgain';
    this.activeModal.close(oReturn);
    return ;
  }

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

  async getStringFromFile(fSustento: File) {
    return new Promise<any>( (resolve, reject) => {

      const reader = new FileReader();
      reader.readAsDataURL(fSustento);
      reader.onload = () => {
        resolve(reader.result);
      };

    });
  }

  async gastoCentroCosto(nIdCentroCosto) {
    const param = [];
    param.push('0¡nIdCentroCosto!' + nIdCentroCosto);

    await this.service._loadSP( 9, param, this.url).then( (value: nsBonoR.IGastoCC[]) => {
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
        const dFecha = this.fgBonoR.controls['T1_dFecha'].value as Date;
        nEjercicio = moment(dFecha).year();
        nMes = Number( moment(dFecha).format('MM') );
        break;
    }

    const param = [];
    const sEjercicio = nEjercicio.toString();
    const sMes = nMes.toString();
    const sEjMes = sEjercicio + ( (sMes.length === 1) ? '0' + sMes : sMes );
    param.push('10¡dFecha!' + sEjMes +  '|0¡nIdResp!' + nIdResp);
    // '-10¡dFecha!' + sEjMes +

    await this.service._loadSP( 5, param, this.url).then( (value: nsBonoR.ITeamResp[]) => {
      if (value.length > 0) {
        this.aPersonal = value;
        bReturn = false;
      }
    });

    return bReturn;
  }
  get getfgBonoR() { return this.fgBonoR.controls; }
  get getPerso() { return this.fgPerso.controls; }
  get getInfoPerso() { return this.fgInfoPerso.controls; }
  get getSearch() { return this.fgSearch.controls; }
  get getFilter() { return this.fgFilter.controls; }

}
