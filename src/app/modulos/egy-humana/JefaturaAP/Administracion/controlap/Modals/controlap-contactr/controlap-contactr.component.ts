import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { ControlapService } from '../../../../Services/controlap.service';
import { ValidadoresService } from '../../../../Validators/validadores.service';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-controlap-contactr',
  templateUrl: './controlap-contactr.component.html',
  styleUrls: ['./controlap-contactr.component.css', './controlap-contactr.component.scss'],
  animations: [ adminpAnimations ]
})
export class ControlapContactrComponent implements OnInit {

  @Input() fromParent;

  //#region Variables
  matcher = new MyErrorStateMatcher();
  aParam = [];

  // Fab
  fbDetail = [
    {icon: 'save', tool: 'Guardar', dis: false},
    {icon: 'cancel', tool: 'Cancelar', dis: false}
  ];
  abDetail = [];
  tsDetail = 'inactive';

  // Progress Bar
  pbDetail: boolean;

  // Parent
  nIdResp: number;
  aResp: any[];
  nIdDevengue: number;

  // FormGroup
  fgDetail: FormGroup;
  fgContacto: FormGroup;

  // Combobox
  cboMotivo = new Array();
  cboRespuesta = new Array();

  // Mat Table
  TeamDC: string[] = [ 'sNombres', 'sCodPlla', 'dFechIni', 'dFechFin', 'nDias', 'sEstado', 'more' ];
  TeamDS: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild('pagTeam', {static: true}) pagTeam: MatPaginator;
  expandedMore = null;

  // Contacto
  fcDateTime: FormControl = new FormControl({value: '', disabled: true});
  fcMotivo: FormControl  = new FormControl({value: '', disabled: true});
  fcRespuesta: FormControl  = new FormControl({value: '', disabled: true});
  fcObservacion: FormControl  = new FormControl({value: '', disabled: true});

  //#endregion

  constructor(public activeModal: NgbActiveModal, private spi: NgxSpinnerService,
              public service: ControlapService, private fb: FormBuilder,
              private valid: ValidadoresService) {

    this.new_fgDetail();
    this.new_fgContacto();
  }

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_contactr');

    await this.cboGetMotivo();
    await this.cboGetRespuesta();

    this.nIdResp = this.fromParent.nIdResp;
    this.aResp = this.fromParent.aResp;

    this.nIdDevengue = this.fromParent.nIdDevengue;

    await this.loadDetail();

    this.spi.hide('spi_contactr');

    this.onToggleFab(1, 1);

  }

  //#region General

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = ( stat === -1 ) ? ( this.abDetail.length > 0 ) ? 0 : 1 : stat;
        this.tsDetail = ( stat === 0 ) ? 'inactive' : 'active';
        this.abDetail = ( stat === 0 ) ? [] : this.fbDetail;
        break;
    }
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.saveContacto();
        break;

      case 1:
        this.activeModal.dismiss();
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

  new_fgDetail() {
    this.fgDetail = this.fb.group({
      sNombres: [{ value: '', disabled: true }],
      sCodPlla: [{ value: '', disabled: true }],
      sTipo: [{ value: '', disabled: true }],
      sDocumento: [{ value: '', disabled: true }],
      sOrganizacion: [{ value: '', disabled: true }],
      sCentroCosto: [{ value: '', disabled: true }],
      sCiudad: [{ value: '', disabled: true }],
      nTelMovil: [{ value: 0, disabled: true }],
      dFechIni: [{ value: null, disabled: true }],
      dFechFin: [{ value: null, disabled: true }]
    });
  }

  new_fgContacto() {
    this.fgContacto = this.fb.group({
      T1_nIdDevengue: 0,
      T1_nIdPersonal: 0,
      T1_nIdMotivo: [{ value: 0, disabled: false }, [ Validators.required, this.valid.noSelect ]],
      T1_nIdRespuesta: [{ value: 0, disabled: false }, [ Validators.required, this.valid.noSelect ]],
      T1_sObservacion: [ { value: '', disabled: false } ],
    });
  }

  get getDetail() { return this.fgDetail.controls; }
  get getContacto() { return this.fgContacto.controls; }

  //#endregion

  //#region Combobox

  async cboGetMotivo () {
    const param = [];
    param.push('0¡nIdTipo!2311');
    param.push('0¡nIdModo!2315');
    param.push('0¡bUso!0');

    await this.service._loadSP( 9, param).then( (value: any[]) => {
      this.cboMotivo = value;
    });
  }

  async cboGetRespuesta () {
    const param = [];
    param.push('0¡nIdTipo!2311');
    param.push('0¡nIdModo!2315');
    param.push('0¡bUso!1');

    await this.service._loadSP( 9, param).then( (value: any[]) => {
      this.cboRespuesta = value;
    });
  }

  //#endregion

  //#region Load

  async loadDetail() {

    this.fgContacto.patchValue({
      T1_nIdPersonal: this.nIdResp,
      T1_nIdDevengue: this.nIdDevengue
    });

    const param = [];
    param.push('0¡A.nIdPersonal!' + this.nIdResp);

    await this.service._loadSP( 11, param).then( (value: any[]) => {
      if ( value.length > 0 ) {
        this.fgDetail.patchValue({
          sNombres: value[0].sNombres,
          sCodPlla: value[0].sCodPlla,
          sTipo: value[0].sDscTipo,
          sDocumento: value[0].sDocumento,
          dFechIni: value[0].dFechIni,
          dFechFin: value[0].dFechFin,
          sOrganizacion: value[0].sOrganizacion,
          sCentroCosto: value[0].sCentroCosto,
          sCiudad: value[0].sCiudad,
          nTelMovil: value[0].nTelMovil
        });
      }
    });

    this.TeamDS = new MatTableDataSource(this.aResp);
    this.TeamDS.paginator = this.pagTeam;

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

  async saveContacto() {
    this.pbDetail = true;

    this.aParam = [];

    if (this.fgContacto.invalid) {

      Swal.fire(
        'No se puede guardar',
        'Información incorrecta o incompleta',
        'error'
      );

      this.pbDetail = false;
      return;

    } else {

      // Usuario y Fecha con Hora
      const user = localStorage.getItem('currentUser');
      const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

      this.aParam.push('T1¡nIdRegUser!' + uid);
      this.aParam.push('T1¡dtReg!GETDATE()');
      this.aParam.push('T1¡nIdModo!2315');

      this.fnGetParam(this.fgContacto.controls);

      const nIdPersonal = this.fgContacto.controls['T1_nIdPersonal'].value;

      const aResult = new Array();
      const result = await this.service._crudCA(1, this.aParam);

      Object.keys( result ).forEach ( valor => {
        aResult.push(result[valor]);
      });

      let ftitle = '';
      let ftext = '';
      let ftype = '';

      let nIdContacto: number;

      for (const e of aResult) {
        const iResult = aResult.indexOf(e);

        if (e.split('!')[0] !== '00') {
          if (iResult === 0) {

            nIdContacto = e.split('!')[1];

            ftitle = 'Registro satisfactorio';
            ftext = 'La contactación fue registrada en el histórico del responsable.';
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

        oReturn['modal'] = 'contactr';
        oReturn['value'] = 'loadAgain';
        oReturn['nIdPersonal'] = nIdPersonal;
        oReturn['nIdContacto'] = nIdContacto;

        this.activeModal.close(oReturn);
      }

      this.pbDetail = false;
      return;

    }

  }

  //#endregion

}
