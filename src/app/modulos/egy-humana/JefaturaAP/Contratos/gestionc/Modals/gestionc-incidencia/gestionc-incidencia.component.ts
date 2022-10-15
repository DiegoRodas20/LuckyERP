import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { GestioncService } from '../../../../Services/gestionc.service';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { ValidadoresService } from '../../../../Validators/validadores.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-gestionc-incidencia',
  templateUrl: './gestionc-incidencia.component.html',
  styleUrls: ['./gestionc-incidencia.component.css'],
  animations: [ adminpAnimations ]
})
export class GestioncIncidenciaComponent implements OnInit {

  @Input() fromParent;

  //#region Variables
  aParam = [];
  matcher = new MyErrorStateMatcher();

  // Progress Bar
  pbIncidencia: boolean;

  // Fab
  fbNew = [
    {icon: 'save', tool: 'Guardar', dis: false},
    {icon: 'cancel', tool: 'Cancelar', dis: false}
  ];
  fbView = [
    {icon: 'edit', tool: 'Editar', dis: true},
    {icon: 'delete', tool: 'Eliminar', dis: true},
  ];

  abIncidencia = [];
  tsIncidencia = 'inactive';
  toggleIncidencia: number;

  // Combobox
  cboMotivo = new Array();

  // FormGroup
  fgIncidencia: FormGroup;

  //#endregion

  constructor(public activeModal: NgbActiveModal, private spi: NgxSpinnerService,
              public service: GestioncService, private fb: FormBuilder,
              private valid: ValidadoresService, private _snackBar: MatSnackBar) {

    this.new_fgIncidencia();
  }

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_incidencia');

    await this.cboGetMotivo();

    const opc = this.fromParent.opcIncidencia;
    const array = this.fromParent.aIncidencia;

    this.toggleIncidencia = opc;

    // Nuevo
    if (opc === 1) {

      const dFechIni = array.dFinCont as Date;
      const dIniCont = moment(dFechIni).add(1, 'days').toDate();
      const dFinCont = moment(dIniCont).add(1, 'month').add(-1, 'days').toDate();

      this.fgIncidencia.patchValue({
        T1_nIdContrato: array.nIdPLD,
        T1_dFechIni: dIniCont,
        T1_dFechFin: dFinCont,
        dFechIni: array.dIniCont,
        dFechFin: array.dFinCont
      });

      this.fgIncidencia.controls['T1_nIdMotivo'].enable();
      this.fgIncidencia.controls['T1_sObservacion'].enable();

    } else {

      this.fgIncidencia.patchValue({
        T1_nIdIC: array.nIdIC,
        T1_nIdContrato: array.nIdContrato,
        T1_nIdMotivo: array.nIdMotivo,
        T1_sObservacion: array.sObservacion,
        T1_dFechIni: array.dIniCont,
        T1_dFechFin: array.dFinCont,
        dFechIni: array.dFechIni,
        dFechFin: array.dFechFin
      });

      const dFechFin = array.dFechFin as Date;
      const dFinMonth = moment(dFechFin).startOf('month').add(-1, 'days').toDate();
      const dIniMonth = moment(dFinMonth).startOf('month').toDate();
      const dMaxDate = moment(dIniMonth).add(14, 'days').toDate();

      const nIniMonth = Number(moment(dIniMonth).format('YYYYMMDD'));
      const nMaxDate = Number(moment(dMaxDate).format('YYYYMMDD'));

      const dToday = moment().toDate();
      const nToday = Number(moment(dToday).format('YYYYMMDD'));

      if ( nToday >= nIniMonth && nToday <= nMaxDate ) {
        this.fbView[0].dis = false;
        this.fbView[1].dis = false;
      }

    }

    this.spi.hide('spi_incidencia');

    this.onToggleFab(this.toggleIncidencia, 1);
  }

  //#region General

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = ( stat === -1 ) ? ( this.abIncidencia.length > 0 ) ? 0 : 1 : stat;
        this.tsIncidencia = ( stat === 0 ) ? 'inactive' : 'active';
        this.abIncidencia = ( stat === 0 ) ? [] : this.fbNew;
        break;

      case 2:
        stat = ( stat === -1 ) ? ( this.abIncidencia.length > 0 ) ? 0 : 1 : stat;
        this.tsIncidencia = ( stat === 0 ) ? 'inactive' : 'active';
        this.abIncidencia = ( stat === 0 ) ? [] : this.fbView;
        break;
    }
  }

  clickFab(opc: number, index: number) {
    switch (opc) {
      // Nuevo
      case 1:
        const opcIncidencia = this.fromParent.opcIncidencia;
        switch (index) {
          // Guardar
          case 0:
            this.saveIncidencia();
            break;

          // Cancelar
          case 1:
            if (opcIncidencia === 1) {
              this.activeModal.dismiss();
            } else {

              const array = this.fromParent.aIncidencia;

              this.fgIncidencia.patchValue({
                T1_nIdMotivo: array.nIdMotivo,
                T1_sObservacion: array.sObservacion
              });

              this.fgIncidencia.controls['T1_nIdMotivo'].disable({ emitEvent: false });
              this.fgIncidencia.controls['T1_sObservacion'].disable({ emitEvent: false });

              this.abIncidencia = [];
              this.delay(250).then(any => {
                this.abIncidencia = this.fbView;
                this.tsIncidencia = 'active2';
              });

              this.toggleIncidencia = 2;

            }
            break;
        }
        break;

      // View
      case 2:
        const sNombres = this.fromParent.sNombres;
        switch (index) {
          // Editar
          case 0:
            Swal.fire({
              title: '¿ Estas seguro de modificar el registro?',
              text: 'La incidencia le pertenece a ' + sNombres,
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#ff4081',
              confirmButtonText: 'Confirmar !',
              allowOutsideClick: false
            }).then((result) => {
              if (result.isConfirmed) {

                this.fgIncidencia.controls['T1_nIdMotivo'].enable({ emitEvent: false });
                this.fgIncidencia.controls['T1_sObservacion'].enable({ emitEvent: false });

                this.abIncidencia = [];
                this.delay(250).then(any => {
                  this.abIncidencia = this.fbNew;
                  this.tsIncidencia = 'active2';
                });

                this.toggleIncidencia = 1;

              }
            });
            break;

          // Eliminar
          case 1:
            Swal.fire({
              title: '¿ Estas seguro de eliminar el registro?',
              text: 'La incidencia le pertenece a ' + sNombres,
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#ff4081',
              confirmButtonText: 'Confirmar !',
              allowOutsideClick: false
            }).then(async (result) => {
              if (result.isConfirmed) {

                this.pbIncidencia = true;

                const nIdIC = this.fgIncidencia.controls['T1_nIdIC'].value;
                await this.deleteIncidencia(nIdIC);

                this.pbIncidencia = false;

              }
            });
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

  //#endregion

  //#region FormGroup

  new_fgIncidencia() {
    this.fgIncidencia = this.fb.group({
      T1_nIdIC: 0,
      T1_nIdContrato: 0,
      T1_nIdMotivo: [{ value: 0, disabled: true }, [ Validators.required, this.valid.noSelect ]],
      T1_sObservacion: [{ value: '', disabled: true }, [ Validators.maxLength(200) ]],
      T1_dFechIni: [{ value: null, disabled: true }, [ Validators.required ]],
      T1_dFechFin: [{ value: null, disabled: true }, [ Validators.required ]],
      dFechIni: [{ value: null, disabled: true }],
      dFechFin: [{ value: null, disabled: true }]
    });
  }

  get getIncidencia() { return this.fgIncidencia.controls; }

  //#endregion

  //#region Combobox

  async cboGetMotivo () {
    const param = [];
    param.push('0¡nEleCodDad!2291');

    await this.service._loadSP( 4, param).then( (value: any[]) => {
      this.cboMotivo = value;
    });
  }

  //#endregion

  //#region Load

  async saveIncidencia() {

    this.pbIncidencia = true;

    this.aParam = [];

    if (this.fgIncidencia.invalid) {
      Swal.fire(
        'No se puede guardar',
        'Información incorrecta o incompleta',
        'error'
      );

      this.pbIncidencia = false;
      return;
    } else {

      // Usuario y Fecha con hora
      const user = localStorage.getItem('currentUser');
      const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

      const fControl = this.fgIncidencia.controls['T1_nIdIC'] as FormControl;
      const opcIncidencia = this.fromParent.opcIncidencia;

      let oModo: any;

      // Nuevo
      if ( opcIncidencia === 1 ) {

        this.aParam.push('T1¡bEstado!1');
        this.aParam.push('T1¡nIdRegUser!' + uid);
        this.aParam.push('T1¡dtReg!GETDATE()');

        fControl.setValue(null);
        oModo = undefined;

      } else {

        this.aParam.push('T1¡nIdModUser!' + uid);
        this.aParam.push('T1¡dtMod!GETDATE()');
        fControl.markAsDirty();
        oModo = true;

      }

      this.fnGetParam(this.fgIncidencia.controls, oModo);

      if ( this.aParam.length > ( ( oModo ) ? 1 : 0 ) ) {

        const aResult = new Array();
        const result = await this.service._crudGC(opcIncidencia, this.aParam);

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

              ftitle = (opcIncidencia === 1) ? 'Registro satisfactorio' : 'Modificación satisfactoria';
              ftext = 'La incidencia se contempla en la renovación de contrato del personal.';
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
          const oReturn = new Object();

          oReturn['modal'] = 'incidencia';
          oReturn['value'] = 'loadAgain';

          this.activeModal.close(oReturn);
        }

        this.pbIncidencia = false;
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

  async deleteIncidencia(nIdIC: number) {
    const aParam = [];
    aParam.push('T1¡nIdIC!' + nIdIC);

    const aResult = new Array();
    const result = await this.service._crudGC(3, aParam);

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
          ftext = 'Se le renovará el contrato de personal de manera regular.';
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
      const oReturn = new Object();

      oReturn['modal'] = 'incidencia';
      oReturn['value'] = 'loadAgain';

      this.activeModal.close(oReturn);
    }
  }

  //#endregion

  //#region Extra

  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms)).then();
  }

  //#endregion

}
