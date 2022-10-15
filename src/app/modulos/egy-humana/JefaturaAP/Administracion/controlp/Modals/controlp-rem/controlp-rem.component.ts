import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatTable } from '@angular/material/table';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ControlpService } from '../../../../Services/controlp.service';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { ValidadoresService } from '../../../../Validators/validadores.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-controlp-rem',
  templateUrl: './controlp-rem.component.html',
  styleUrls: ['./controlp-rem.component.css', './controlp-rem.component.scss'],
  animations: [ adminpAnimations ]
})
export class ControlpRemComponent implements OnInit {

  @Input() fromParent;

  //#region Variables

  // Service GET && POST
  url: string;
  aParam = [];
  aParaml = [];
  matcher = new MyErrorStateMatcher();

  // Fab
  fbRem = [
    {icon: 'save', tool: 'Guardar'},
    {icon: 'cancel', tool: 'Cancelar'},
  ];
  abRem = [];
  tsRem = 'inactive';

  // Progress Bar
  pbRem: boolean;

  // FormGroup
  fgRem: FormGroup;
  fgRem_select: FormGroup;

  // Combobox
  cboTipoSalario = new Array();

  // MatTable
  dcRem: string[] = [ 'position', 'dsc_', 'nImporte', 'action'];
  dsRem = new Array();

  // ViewChild
  @ViewChild('tRem') tRem: MatTable<any>;

  // Array
  aConceptos = new Array();

  // Modal Parent
  fgView_rem: FormGroup;
  aBackup = new Array();

  //#endregion

  constructor(public activeModal: NgbActiveModal, private spi: NgxSpinnerService,
              private fb: FormBuilder, private valid: ValidadoresService,
              public service: ControlpService, @Inject('BASE_URL') baseUrl: string) {

    // SERVICE GET && POST
    this.url = baseUrl;

    this.new_fgRem();
    this.new_fgRem_select();

  }

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_rem');

    this.fgView_rem = this.fromParent.fgRem;
    this.aBackup = this.fromParent.aBackup;

    await this.cboGetTipoSalario();
    await this.cboGetConcepBase();

    // Load
    this.onToggleFab(1, 1);

    this.loadRem(this.fromParent.nIdPlRem, this.fromParent.nModo);

    this.spi.hide('spi_rem');

  }

  //#region General

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:

        stat = ( stat === -1 ) ? ( this.abRem.length > 0 ) ? 0 : 1 : stat;
        this.tsRem = ( stat === 0 ) ? 'inactive' : 'active2';
        this.abRem = ( stat === 0 ) ? [] : this.fbRem;
        break;
    }

  }

  clickFab(opc: number, index: number) {
    switch (opc) {
      case 1:
        switch (index) {
          case 0:
              this.saveRem();
              break;
            case 1:
              this.activeModal.dismiss();
              break;
        }
        break;
    }
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

  //#endregion

  //#region Combobox

  async cboGetTipoSalario () {
    const param = [];
    param.push('0¡nDadTipEle!518');
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡nIdPais!' + sIdPais);

    await this.service._loadSP( 12, param, this.url).then( ( value: any[] ) => {
      this.cboTipoSalario = value;
    });
  }

  EnabledMonto (pushParam: any ) {

    const fGroup = this.fgRem;

    if (pushParam !== undefined ) {
      if ( pushParam.bDis === true ) {
        fGroup.controls['T7_nMonto'].enable();
        return ;
      }
    }

    fGroup.controls['T7_nMonto'].disable();
    fGroup.controls['T7_nMonto'].setValue(0);
  }

  async cboGetConcepBase () {
    const param = [];
    param.push('0¡nIdTipo!2166');
    param.push('10¡nValor!0');

    await this.service._loadSP( 25, param, this.url).then( (value: any[]) => {

      value.forEach( x => {
        this.aConceptos.push({
          nIdConcepto: x.nIdConcepto,
          dsc: x.sDescripcion,
          dis: false,
        });
      });

    });
  }

  //#endregion

  //#region FormGroup

  new_fgRem() {
    this.fgRem = this.fb.group({
      T7_nIdPlRem: 0,
      A7_nTipoSalario: [0, [ Validators.required, this.valid.noSelect ]],
      T7_nMonto: [ { value: 0, disabled: true}, [ this.valid.vMonto ] ],
      L1_nIdPlRem: this.fb.array([])
    }, {
      validator: this.valid.vLineas('L1_nIdPlRem')
    });
  }

  new_fgRem_select() {
    this.fgRem_select = this.fb.group({
      nIdConcepto: [ null , [ Validators.required ]],
      dsc: [''],
      nImporte: [ null , [this.valid.vMonto]],
    });
  }

  get getRem() { return this.fgRem.controls; }
  get getRem_select() { return this.fgRem_select.controls; }

  //#endregion

  //#region Load

  loadRem(nId: number, oModo: number) {

    if ( oModo === 2 ) {

      const nIdPlRem = this.fgView_rem.controls['nIdPlRem'].value;
      const nTipoSalario = this.fgView_rem.controls['A7_nTipoSalario'].value;
      const bDis = nTipoSalario.bDis;
      const nMonto = this.fgView_rem.controls['T7_nMonto'].value;

      this.fgRem.controls['T7_nIdPlRem'].setValue(nIdPlRem);

      const aTipoSalario = this.cboTipoSalario as Array<any>;
      const iTipoSalario = aTipoSalario.findIndex( x => x.nTipoSalario_ === nTipoSalario.nTipoSalario_ );

      if ( iTipoSalario > -1 ) {
        const fcTipoSalario = this.fgRem.get('A7_nTipoSalario') as FormControl;
        fcTipoSalario.setValue(aTipoSalario[iTipoSalario]);
      }

      this.fgRem.controls['T7_nMonto'].setValue(nMonto);
      if ( bDis === true ) {
        this.fgRem.controls['T7_nMonto'].enable();
      } else {
        this.fgRem.controls['T7_nMonto'].disable();
      }

      const faRem = this.fgRem.controls['L1_nIdPlRem'] as FormArray;

      const faSalario = this.fgView_rem.controls['L1_nIdPlRem'] as FormArray;
      const aSalario = faSalario.value as Array<any>;
      const iSalario = aSalario.findIndex( x => x.nIdPlRem === nId );

      if ( iSalario > -1 ) {
        const fConcepto = faSalario.controls[iSalario] as FormGroup;
        const aConcepto = fConcepto.controls['aConcepto'].value as Array<any>;

        aConcepto.forEach( (element: any, iElement: number) => {
          faRem.push(this.fb.group({
            nIdConcepto: ['', Validators.required],
            dsc_: ['', Validators.required],
            nImporte: [0, Validators.required],
          }));

          const fgRem = faRem.controls[faRem.controls.length - 1] as FormGroup;
          fgRem.patchValue({
            nIdConcepto: aConcepto[iElement].nIdConcepto ,
            dsc_: aConcepto[iElement].sDesc,
            nImporte: aConcepto[iElement].nImporte
          });

          const iArray = this.aConceptos.findIndex( x => x.nIdConcepto === aConcepto[iElement].nIdConcepto );
          if ( iArray > -1 ) {
            this.aConceptos[iArray].dis = true;
          }
        });
      }

      this.dsRem = faRem.value;
    } else {
      this.fgRem.reset();
      this.dsRem = new Array();
    }

  }

  async saveRem() {
    this.pbRem = true;

    this.aParam = [];
    this.aParaml = [];

    const fgRem = this.fgRem as FormGroup;
    const fcRem = fgRem.controls['T7_nIdPlRem'] as FormControl;

    if ( fgRem.invalid ) {
      Swal.fire(
        'No se puede guardar',
        'Información incorrecta o incompleta en la sección remuneración',
        'error'
      );
      this.pbRem = false;
    } else {

      // New - 1 | Edit - 2
      let oModo: number;
      oModo = ( fcRem.value === 0 || fcRem.value === null || fcRem.value === undefined ) ? 1 : 2;

      fcRem.markAsDirty();
      this.fnGetParam(fgRem.controls, ( oModo === 2 ) ? true : false );

      let aResult = new Array();
      let result: Object;

      if ( this.aParam.length > ( ( oModo === 2 ) ? 1 : 0 ) ) {
        // Usuario y Fecha con hora
        const user = localStorage.getItem('currentUser');
        const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

        if ( oModo === 2 ) {
          this.aParam.push('T7¡sModUser!' + uid);
          this.aParam.push('T7¡dtMod!GETDATE()');

          result = await this.service._crudSP(3, this.aParam, this.url);
        } else {
          // Actualiza registro anterior y creo uno nuevo
          this.aParam.push('T7¡sRegUser!' + uid);
          this.aParam.push('T7¡dtReg!GETDATE()');

          // this.lastItem(7, this.tabView, 0, this.tabView_pl.value, 'T7');
          result = await this.service._crudSP(5, this.aParam, this.url);
        }

        // Storage result
        Object.keys( result ).forEach ( valor => {
          aResult.push(result[valor]);
        });
      } else {
        this.aParam = [];
      }

      let nIdPlRem: number;
      let ftitle = '';
      let ftext = '';
      let ftype = '';

      if ( aResult.length > 0 ) {
        for (const e of aResult) {
          const iResult = aResult.indexOf(e);
          if (e.split('!')[0] !== '00') {
            nIdPlRem = Number(e.split('!')[1]);
          } else {
            Swal.fire(
              'Inconveniente',
              e.split('!')[1],
              'error'
            );
            this.pbRem = false;
            return;
          }
        }
      } else {
        nIdPlRem = fcRem.value;
      }

      ftitle = ( oModo === 2 ) ? 'Actualización satisfactoria' : 'Registro satisfactorio';
      ftext = 'Sección : remuneración';
      ftype = 'success';

      if ( oModo === 2 ) {
        // Eliminar lineas con el codigo nIdPlRem
        this.aParam = [];
        this.aParam.push('L1¡nIdPlRem!' + nIdPlRem.toString());

        aResult = new Array();
        result = await this.service._crudSP(4, this.aParam, this.url);

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
            this.pbRem = false;
            return;
          }
        }
      }

      let codParaml: string;
      this.aParaml
      .filter( (pl: string) => pl.substr(pl.length - 1) === '!' && pl.includes('nIdPlRem') )
      .forEach( pl => {
        const index = this.aParaml.indexOf(pl);
        this.aParaml[index] =  this.aParaml[index] + nIdPlRem.toString() ;
        codParaml = this.aParaml[index].substring(0, pl.indexOf('¡'));
      });
      if (codParaml !== '') {
        await this.service._crudSP(2, this.aParaml.filter( (pl: string) => pl.includes(codParaml) ), this.url);
      }

      this.aParam = [];
      this.aParaml = [];

      Swal.fire(
        ftitle,
        ftext,
        (ftype !== 'error') ? 'success' : 'error'
      );

      if ( ftype !== 'error' ) {
        const oReturn = new Object();

        oReturn['modal'] = 'rem';
        oReturn['value'] = 'loadAgain';

        this.activeModal.close(oReturn);
      }

      this.pbRem = false;
    }
  }

  selectConcepto(item: any, modo: number) {

    const fg = this.fgRem_select;

    fg.controls['nImporte'].setValue(null);
    if ( modo > 0 ) {
      fg.controls['nIdConcepto'].setValue( item.nIdConcepto );
      fg.controls['dsc'].setValue( item.dsc );
    } else {
      fg.reset();
    }

  }

  addConcepto() {

    const fg = this.fgRem;
    const id = this.getRem_select.nIdConcepto.value;
    const dsc = this.getRem_select.dsc.value;
    const imp = this.getRem_select.nImporte.value;

    const faSalario = fg.controls.L1_nIdPlRem as FormArray;

    Object.values ( faSalario.controls ).forEach( (gcontrol: FormGroup, icontrol: number) => {
      if (gcontrol.controls['nIdConcepto'].value === id ) {
        faSalario.removeAt(icontrol);
      }
    });

    faSalario.push(this.fb.group({
      nIdConcepto: ['', Validators.required],
      dsc_: ['', Validators.required],
      nImporte: [0, Validators.required],
    }));

    const lSalario = faSalario.controls[faSalario.controls.length - 1] as FormGroup;
    lSalario.patchValue({
      nIdConcepto: id ,
      dsc_: dsc,
      nImporte: imp
    });

    this.dsRem = faSalario.value;

    const iArray = this.aConceptos.findIndex( x => x.nIdConcepto === id );
    if ( iArray > -1 ) {
      this.aConceptos[iArray].dis = true;
    }

    this.selectConcepto('', 0);
  }

  removeConcepto(item: any) {

    const fg = this.fgRem;

    const faSalario = fg.controls.L1_nIdPlRem as FormArray;

    Object.values ( faSalario.controls ).forEach( (gcontrol: FormGroup, icontrol: number) => {
      if (gcontrol.controls['nIdConcepto'].value === item.nIdConcepto ) {
        faSalario.removeAt(icontrol);
      }
    });

    this.dsRem = faSalario.value;

    const iArray = this.aConceptos.findIndex( x => x.nIdConcepto === item.nIdConcepto );
    if ( iArray > -1 ) {
      this.aConceptos[iArray].dis = false;
    }

  }

  editConcepto(item: any) {

    const fg = this.fgRem_select;

    fg.controls['nIdConcepto'].setValue( item.nIdConcepto );
    fg.controls['dsc'].setValue( item.dsc_ );
    fg.controls['nImporte'].setValue( item.nImporte );
  }

  dropConcepto(event: CdkDragDrop<any>) {

    const fRem = this.fgRem.controls.L1_nIdPlRem as FormArray;
    const ds = this.dsRem;
    const t = this.tRem;

    moveItemInArray(ds, event.previousIndex, event.currentIndex);
    t.renderRows();
    fRem.markAsDirty();
  }

  //#endregion

}
