import { Component, Inject, Input, OnInit, Type, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ControlpService } from '../../../../Services/controlp.service';
import { ErrorStateMatcher } from '@angular/material/core';
import Swal from 'sweetalert2';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import * as moment from 'moment';
import { ControlpRemComponent } from '../controlp-rem/controlp-rem.component';
import { MatPaginator } from '@angular/material/paginator';
import { ValidadoresService } from '../../../../Validators/validadores.service';
import { adminpAnimations } from '../../../../Animations/adminp.animations';

// Utilizar javascript [1]
declare var jQuery: any;

interface Iexpanded {
  _FormGroup?: FormGroup;
  _DataSource?: MatTableDataSource<any>;
  cant?: number;
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

// Modals
const MODALS: { [name: string]: Type<any> } = {
  rem: ControlpRemComponent,
};

@Component({
  selector: 'app-controlp-view',
  templateUrl: './controlp-view.component.html',
  styleUrls: [
    './controlp-view.component.css',
    './controlp-view.component.scss',
  ],
  animations: [adminpAnimations],
})
export class ControlpViewComponent implements OnInit {
  @Input() fromParent;

  //#region Variables

  // Service GET && POST
  url: string;
  aParam = [];
  aParaml = [];
  matcher = new MyErrorStateMatcher();

  // Fab
  fbView = [
    { icon: 'add', tool: 'Nuevo', dis: 'false' },
    { icon: 'edit', tool: 'Modificar', dis: 'false' },
    { icon: 'cloud_upload', tool: 'Constancia de alta', dis: 'true' },
  ];
  fbView2 = [
    { icon: 'save', tool: 'Guardar', dis: 'false' },
    { icon: 'cancel', tool: 'Cancelar', dis: 'false' },
  ];
  abView = [];
  tsView = 'inactive';

  // Fab Icon
  tiView = 'default';
  tiView_dp = 'face';
  tiView_pl = 'groups';

  // MatTab
  tabView = 0;
  tabView_dp = new FormControl(0);
  tabView_pl = new FormControl(0);

  // MatExpansion Panel
  maView_dp = -1;
  maView_pl = -1;

  // Combobox
  cboTipoDoc = new Array();
  aUbigeo = new Array();
  cboUbigeo1 = new Array();
  cboUbigeo2 = new Array();
  cboUbigeo3 = new Array();
  cboMotivoC = new Array();
  cboGenero = new Array();
  cboEstadoCivil = new Array();
  cboNacion = new Array();
  cboPlanilla = new Array();
  cboCargo = new Array();
  cboTipoSP = new Array();
  aAFP = new Array();
  cboAFP = new Array();
  cboTipoCuenta = new Array();
  cboBanco = new Array();
  cboMoneda = new Array();
  cboTipoSalario = new Array();
  cboDireccion = new Array();
  cboArea = new Array();
  aArea = new Array();
  cboPuesto = new Array();
  aPuesto = new Array();
  cboEspecialidad = new Array();
  aEspecialidad = new Array();

  //#region FormGroup
  fgView_datos: FormGroup;
  fgView_info: FormGroup;
  fgView_doc: FormGroup;
  fgView_dom: FormGroup;
  fgView_plab: FormGroup;
  fgView_plla: FormGroup;
  fgView_sp: FormGroup;
  fgView_rem: FormGroup;
  fgView_banco: FormGroup;
  fgView_org: FormGroup;
  //#endregion

  //#region MatTable
  dsView_doc: MatTableDataSource<any> = new MatTableDataSource([]);
  dcView_doc: string[] = [
    'action',
    'sDesc',
    'sDocumento',
    'dFechIni',
    'dFechFin',
  ];
  @ViewChild('pagDoc', { static: true }) pagDoc: MatPaginator;

  dsView_dom: MatTableDataSource<any> = new MatTableDataSource([]);
  dcView_dom: string[] = [
    'action',
    'sDireccion',
    'departamento',
    'provincia',
    'distrito',
  ];
  @ViewChild('pagDom', { static: true }) pagDom: MatPaginator;

  dsView_plab: MatTableDataSource<any> = new MatTableDataSource([]);
  dcView_plab: string[] = ['action', 'dFechIniPlab', 'dFechFin', 'sDescPlab'];
  @ViewChild('pagPlab', { static: true }) pagPlab: MatPaginator;

  dsView_plla: MatTableDataSource<any> = new MatTableDataSource([]);
  dcView_plla: string[] = ['action', 'sDesc', 'dFechIni', 'dFechFin'];
  @ViewChild('pagPlla', { static: true }) pagPlla: MatPaginator;

  dsView_sp: MatTableDataSource<any> = new MatTableDataSource([]);
  dcView_sp: string[] = ['action', 'sDesc', 'sCuspp', 'dFechIni', 'dFechFin'];
  @ViewChild('pagSp', { static: true }) pagSp: MatPaginator;

  dsView_rem: MatTableDataSource<any> = new MatTableDataSource([]);
  dcView_rem: string[] = ['action', 'sDesc', 'nMonto', 'dFechIni', 'dFechFin'];
  @ViewChild('pagRem', { static: true }) pagRem: MatPaginator;

  dsView_org: MatTableDataSource<any> = new MatTableDataSource([]);
  dcView_org: string[] = ['action', 'Column_One', 'Column_Two'];
  @ViewChild('pagOrg', { static: true }) pagOrg: MatPaginator;

  dcView_conc: string[] = ['sDesc', 'nImporte'];
  expandedElement: null;

  dsView_banco: MatTableDataSource<any> = new MatTableDataSource([]);
  dcView_banco: string[] = [
    'action',
    'sDescBanco',
    'sNroCuenta',
    'dFechIni',
    'dFechFin',
  ];
  @ViewChild('pagBanco', { static: true }) pagBanco: MatPaginator;

  dsView_documento: MatTableDataSource<any> = new MatTableDataSource([]);
  //#endregion

  // Array
  nIdPersonal: number;
  aResponsable = new Array();
  aListaPerso = new Array();

  // Backup
  aView_backup: any;

  // Progress Bar
  pbLista: boolean;
  pbView: boolean;

  // Periodo Laboral
  nIdPerLab = 0;

  //#region ViewChild
  @ViewChild('tView_doc') tView_doc: MatTable<any>;
  @ViewChild('tView_dom') tView_dom: MatTable<any>;
  @ViewChild('tView_plab') tView_plab: MatTable<any>;
  @ViewChild('tView_plla') tView_plla: MatTable<any>;
  @ViewChild('tView_sp') tView_sp: MatTable<any>;
  @ViewChild('tView_banco') tView_banco: MatTable<any>;
  @ViewChild('tView_rem') tView_rem: MatTable<any>;
  @ViewChild('mtg_view') mtg_view: MatTabGroup;
  @ViewChild('tView_org') tView_org: MatTable<any>;
  //#endregion

  // Modal Config
  ngbModalOptions: NgbModalOptions = {
    size: 'xl',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder',
  };

  // Extra
  nIdPlRem: number;
  nModo: number;

  //#endregion

  constructor(
    public activeModal: NgbActiveModal,
    private spi: NgxSpinnerService,
    public service: ControlpService,
    @Inject('BASE_URL') baseUrl: string,
    private fb: FormBuilder,
    private valid: ValidadoresService,
    private _snackBar: MatSnackBar,
    private _modalService: NgbModal
  ) {
    // SERVICE GET && POST
    this.url = baseUrl;

    this.new_fgView_datos();
    this.new_fgView_info();
    this.new_fgView_doc();
    this.new_fgView_dom();
    this.new_fgView_plab();
    this.new_fgView_plla();
    this.new_fgView_sp();
    this.new_fgView_rem();
    this.new_fgView_banco();
    this.new_fgView_org();
  }

  async ngOnInit(): Promise<void> {
    this.spi.show('spi_view');

    this.nIdPersonal = this.fromParent.nIdPersonal;
    this.aResponsable = this.fromParent.aSupervisor;
    this.aListaPerso = this.fromParent.aPersonal;

    this.fgView_doc.controls['vExiste'].setValue(
      this.aListaPerso.filter((x) => x.nIdPersonal !== this.nIdPersonal)
    );

    // Load
    this.loadCombo();
    this.onToggleFab(1, 1);

    let param = [];
    param.push('0¡A.nIdPersonal!' + this.nIdPersonal);
    await this.service._loadSP(14, param, this.url).then((value: any) => {
      this.aView_backup = value as Array<any>;
      this.loadView(value, -1, 0);
    });

    // Constancia alta T-Registro
    param = [];

    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('6¡sIdPais!' + sIdPais);
    param.push('0¡nIdTipo!2264');

    await this.service._loadSP(29, param, this.url).then((value: any) => {
      if (value.length > 0) {
        const nIdDocumento = value[0].nIdDocumento;

        const aDocumento = this.dsView_documento.data;
        const iDocumento = aDocumento.findIndex((x) => {
          const a = x.nIdDocumento === nIdDocumento;
          const b = x.nIdPerLab === this.nIdPerLab;
          return a && b;
        });

        if (iDocumento < 0) {
          this.fbView[2].dis = 'false';
        }
      }
    });

    this.spi.hide('spi_view');
  }

  //#region General

  openModal(name: string) {
    this.onToggleFab(1, 0);

    const modalRef = this._modalService.open(
      MODALS[name],
      this.ngbModalOptions
    );

    switch (name) {
      case 'rem':
        const oRem = new Object();
        oRem['nIdPlRem'] = this.nIdPlRem;
        oRem['nModo'] = this.nModo;
        oRem['fgRem'] = this.fgView_rem;
        oRem['aBackup'] = this.aView_backup;

        modalRef.componentInstance.fromParent = oRem;
        break;
    }

    modalRef.result.then(
      (result) => {
        switch (result.modal) {
          case 'rem':
            this.onToggleFab(1, 1);

            if (result.value === 'loadAgain') {
              this.viewUpdate(7, 22, 0, 0, 0, false);
              this.viewUpdate(8, 23, 1, 0, 4, true);
            }

            break;
        }
      },
      (reason) => {
        this.onToggleFab(1, 1);
      }
    );
  }

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        if (stat === -1) {
          if (this.abView.length > 0) {
            stat = 0;
          } else {
            stat = this.maView_dp === -1 ? 1 : 2;
          }
        }

        this.tsView = stat === 0 ? 'inactive' : 'active2';

        switch (stat) {
          case 0:
            this.abView = [];
            break;
          case 1:
            this.abView = this.fbView;
            break;
          case 2:
            this.abView = this.fbView2;
            break;
        }
        break;
    }
  }

  clickFab(index: number) {
    if (this.abView.length > 2) {
      switch (index) {
        case -1:
          this.activeModal.dismiss();
          break;
        // New
        case 0:
          this.fabEnable(
            1,
            this.tabView,
            this.tabView_dp.value,
            this.tabView_pl.value
          );
          break;
        // Enabled - Disabled
        case 1:
          this.fabEnable(
            2,
            this.tabView,
            this.tabView_dp.value,
            this.tabView_pl.value
          );
          break;
        // Upload
        case 2:
          Swal.fire({
            title: '¿ Estas seguro de subir el archivo de constancia?',
            text: 'Acción no podrá ser deshecha, por el momento',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ff4081',
            confirmButtonText: 'Confirmar !',
            allowOutsideClick: false,
          }).then(async (result) => {
            (function ($) {
              $('#uploadFile').click();
            })(jQuery);
          });

          break;
      }
    } else {
      switch (index) {
        case -1:
          this.activeModal.dismiss();
          break;
        // Save
        case 0:
          this.fabSave(
            this.tabView,
            this.tabView_dp.value,
            this.tabView_pl.value
          );
          break;
        // Cancel
        case 1:
          this.fabCancel(
            this.tabView,
            this.tabView_dp.value,
            this.tabView_pl.value
          );
          break;
      }
    }
  }

  fnGetParam(kControls: { [key: string]: AbstractControl }, bDirty?: boolean) {
    let sParam = '';

    Object.keys(kControls).forEach((control) => {
      const index = control.indexOf('_');
      let cTable = '',
        cColum = '',
        cValue = '',
        cDirty: boolean;
      if (index > 0) {
        switch (control.substring(0, 1)) {
          case 'A':
            const aControl = kControls[control].value;
            cTable = 'T' + control.substring(1, index);
            cDirty = kControls[control].dirty;

            if (aControl !== undefined) {
              Object.keys(aControl).forEach((eSub) => {
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

              Object.keys(gcontrol.controls).forEach((subControl) => {
                if (subControl.substring(0, 1) === 'A') {
                  const csControl = gcontrol.controls[subControl];

                  if (
                    csControl.value !== null &&
                    csControl.value !== undefined
                  ) {
                    Object.keys(csControl.value).forEach((eSub) => {
                      const iSub = eSub.indexOf('_');
                      if (iSub > 0) {
                        count = count + 1;

                        cColum = eSub.substring(0, iSub);
                        cValue = csControl.value[eSub];
                        sParam =
                          sParam + cTable + '¡' + cColum + '!' + cValue + '-';
                      }
                    });
                  }
                } else {
                  if (subControl.indexOf('_') < 0) {
                    cValue = gcontrol.controls[subControl].value;
                    if (cValue !== '' && cValue.toString() !== '0') {
                      count = count + 1;
                      sParam =
                        sParam + cTable + '¡' + subControl + '!' + cValue + '-';
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

            if (
              kControls[control].value !== null &&
              kControls[control].value !== undefined
            ) {
              // tslint:disable-next-line: max-line-length
              cValue =
                cColum.substring(0, 1) === 'd'
                  ? moment(new Date(kControls[control].value)).format(
                    'MM/DD/YYYY'
                  )
                  : kControls[control].value;

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

  //#endregion

  //#region Combobox

  loadCombo() {
    this.cboGenero = this.fromParent.objGroup.cboGenero;
    this.cboEstadoCivil = this.fromParent.objGroup.cboEstadoCivil;
    this.cboNacion = this.fromParent.objGroup.cboNacion;
    this.cboTipoDoc = this.fromParent.objGroup.cboTipoDoc;
    this.aUbigeo = this.fromParent.objGroup.aUbigeo;
    this.cboPlanilla = this.fromParent.objGroup.cboPlanilla;
    this.cboCargo = this.fromParent.objGroup.cboCargo;
    this.cboMotivoC = this.fromParent.objGroup.cboMotivoC;
    this.cboTipoSP = this.fromParent.objGroup.cboTipoSP;
    this.aAFP = this.fromParent.objGroup.aAFP;
    this.cboTipoCuenta = this.fromParent.objGroup.cboTipoCuenta;
    this.cboBanco = this.fromParent.objGroup.cboBanco;
    this.cboMoneda = this.fromParent.objGroup.cboMoneda;
    this.cboTipoSalario = this.fromParent.objGroup.cboTipoSalario;
    this.cboDireccion = this.fromParent.objGroup.cboDireccion;
    this.aArea = this.fromParent.objGroup.aArea;
    this.aPuesto = this.fromParent.objGroup.aPuesto;
    this.aEspecialidad = this.fromParent.objGroup.aEspecialidad;
  }

  EnabledDoc(pushParam: any, opc?: number) {
    const fGroup = this.fgView_doc;
    const fcDocumento = fGroup.controls['T3_sDocumento'] as FormControl;

    if (opc === undefined) {
      fcDocumento.setValue('');
    }

    if (pushParam !== undefined) {
      fcDocumento.enable();

      const nLongDoc = pushParam.nLongDoc as number;

      if (nLongDoc > 0) {
        // tslint:disable-next-line: max-line-length
        fcDocumento.setValidators([
          Validators.minLength(nLongDoc),
          Validators.required,
          Validators.pattern('[0-9]*'),
          this.valid.vString,
        ]);
      }
      fGroup.updateValueAndValidity();
      return;
    }
    fcDocumento.disable();
  }

  ChangeUbigeo(pushParam: string, opc: number, mod: number) {
    const fGroup = this.fgView_dom;

    const _mod = mod === 1 ? opc - 1 : opc;

    switch (_mod) {
      case 1:
        this.cboUbigeo2 = new Array();
        fGroup.get('codUbigeo2').setValue('0');
        fGroup.get('codUbigeo2').disable();

        this.cboUbigeo3 = new Array();
        fGroup.controls['T9_sIdUbigeo'].setValue('0');
        fGroup.controls['T9_sIdUbigeo'].disable();
        break;

      case 2:
        this.cboUbigeo3 = new Array();
        fGroup.controls['T9_sIdUbigeo'].setValue('0');
        fGroup.controls['T9_sIdUbigeo'].disable();
        break;
    }

    if (pushParam !== undefined) {
      const editParam =
        mod === 0 ? pushParam.substring(0, pushParam.length - 2) : pushParam;
      const lenParam = editParam.length + 2;

      let fArray = new Array();
      fArray = this.aUbigeo.filter((elemento) => {
        const filter1 =
          elemento.cEntCod.substring(0, editParam.length) === editParam;
        const filter2 = elemento.cEntCod.length === lenParam;
        return filter1 && filter2;
      });

      if (fArray.length > 0) {
        switch (opc) {
          case 1:
            this.cboUbigeo1 = fArray;
            fGroup.controls['codUbigeo1'].enable();
            fGroup.controls['codUbigeo1'].setValue(mod === 1 ? '0' : pushParam);
            break;
          case 2:
            this.cboUbigeo2 = fArray;
            fGroup.controls['codUbigeo2'].enable();
            fGroup.controls['codUbigeo2'].setValue(mod === 1 ? '0' : pushParam);
            break;
          case 3:
            this.cboUbigeo3 = fArray;
            fGroup.controls['T9_sIdUbigeo'].enable();
            fGroup.controls['T9_sIdUbigeo'].setValue(
              mod === 1 ? '0' : pushParam
            );
            break;
        }
      }
    }
  }

  EnabledMotFin(pushParam: any) {
    const fGroup = this.fgView_plab;

    if (pushParam !== undefined) {
      fGroup.controls['T2_dFechFin'].enable();
      return;
    }

    fGroup.controls['T2_dFechFin'].disable();
    fGroup.controls['T2_dFechFin'].setValue(null);
  }

  ChangeCargo(pushParam: any) {

    this.fgView_org.controls['T12_nIdPuesto'].setValue(null);
    this.fgView_org.controls['T12_nIdPuesto'].disable();

    this.fgView_org.controls['T12_nIdEspecialidad'].setValue(null);
    this.fgView_org.controls['T12_nIdEspecialidad'].disable();

    this.cboPuesto = new Array();
    if (pushParam !== undefined) {

      const nIdCargo = pushParam.nIdTipEle;
      const iPuesto = this.aPuesto.findIndex( x => x.nParam === nIdCargo );
      if (iPuesto > -1) {
        this.aPuesto.filter( x => x.nParam === nIdCargo ).forEach( x => this.cboPuesto.push(x) );
        this.fgView_org.controls['T12_nIdPuesto'].enable();
      }
    }
  }

  ChangeAFP(pushParam: string) {
    const fGroup = this.fgView_sp;

    this.cboAFP = new Array();
    fGroup.controls['A6_nIdRegPen'].setValue(undefined);
    fGroup.controls['A6_nIdRegPen'].disable();
    fGroup.controls['T6_sCuspp'].setValue('');
    fGroup.controls['T6_sCuspp'].disable();

    if (pushParam !== '0') {
      let fArray = new Array();
      fArray = this.aAFP.filter((elemento) => {
        const filter1 = elemento.nIdTipoRegPen.toString().includes(pushParam);
        return filter1;
      });

      if (fArray.length > 0) {
        this.cboAFP = fArray;
        fGroup.controls['A6_nIdRegPen'].enable();
      }
    }
  }

  EnabledCuspp(pushParam: any) {
    const fGroup = this.fgView_sp;

    if (pushParam !== undefined) {
      if (pushParam.bdisCuspp === true) {
        fGroup.controls['T6_sCuspp'].enable();
        return;
      }
    }

    fGroup.controls['T6_sCuspp'].disable();
    fGroup.controls['T6_sCuspp'].setValue('');
  }

  EnabledBanco(pushParam: any, opc?: number) {
    const fGroup = this.fgView_banco;
    const nroCuenta = 'T8_sNroCuenta';
    const idMoneda = 'T8_nIdMoneda';
    const idTipoDoc = 'A8_nIdTipoDoc';
    const documento = 'T8_sDocumento';

    if (opc === undefined) {
      fGroup.get(nroCuenta).setValue('');
    }

    if (pushParam !== undefined) {
      if (pushParam.bDisBanco === false) {
        fGroup.get(nroCuenta).enable();

        const nLongDoc = pushParam.nLongCta as number;
        fGroup
          .get(nroCuenta)
          .setValidators([
            Validators.minLength(nLongDoc),
            Validators.required,
            this.valid.vString,
          ]);

        fGroup.updateValueAndValidity();

        fGroup.get(idMoneda).enable();
        fGroup.get(idTipoDoc).enable();
        return;
      }
    }

    // Nro Cuenta
    fGroup.get(nroCuenta).disable();

    // Moneda
    fGroup.get(idMoneda).disable();
    fGroup.get(idMoneda).setValue(0);

    // Tipo documento
    fGroup.get(idTipoDoc).disable();
    fGroup.get(idTipoDoc).setValue(undefined);

    // Documento
    fGroup.get(documento).disable();
    fGroup.get(documento).setValue('');
  }

  EnabledBancoDoc(pushParam: any) {
    const fGroup = this.fgView_banco;
    const fcDocumento = fGroup.controls['T8_sDocumento'] as FormControl;

    fcDocumento.setValue('');

    if (pushParam !== undefined) {
      fcDocumento.enable();

      const aNew_tdoc = this.fgView_doc.controls['A3_nIdTipoDoc'].value;
      const cNew_doc = this.fgView_doc.controls['T3_sDocumento'].value;

      if (cNew_doc !== '') {
        if (pushParam.nIdTipoDoc_ === aNew_tdoc.nIdTipoDoc_) {
          Swal.fire({
            title:
              '¿ Desea utilizar el mismo número del documento de identidad ?',
            text: 'N° documento de identidad : ' + cNew_doc,
            icon: 'question',
            showCancelButton: true,
            cancelButtonText: 'No, gracias!',
            confirmButtonColor: '#ff4081',
            confirmButtonText: 'Si, utilizar!',
            allowOutsideClick: false,
          }).then((result) => {
            if (result.isConfirmed) {
              fcDocumento.setValue(cNew_doc);
              fcDocumento.markAsDirty();
            }
          });
        }
      }

      const nLongDoc = pushParam.nLongDoc as number;

      if (nLongDoc > 0) {
        // tslint:disable-next-line: max-line-length
        fcDocumento.setValidators([
          Validators.minLength(nLongDoc),
          Validators.required,
          Validators.pattern('[0-9]*'),
          this.valid.vString,
        ]);
      }
      fGroup.updateValueAndValidity();
      return;
    }
    fcDocumento.disable();
  }

  EnabledMonto(pushParam: any) {
    const fGroup = this.fgView_rem;

    if (pushParam !== undefined) {
      if (pushParam.bDis === true) {
        fGroup.controls['T7_nMonto'].enable();
        return;
      }
    }

    fGroup.controls['T7_nMonto'].disable();
    fGroup.controls['T7_nMonto'].setValue(0);
  }

  ChangeDireccion(pushParam: any) {

    this.fgView_org.controls['T12_nIdArea'].setValue(null);
    this.fgView_org.controls['T12_nIdArea'].disable();

    this.cboArea = new Array();
    if (pushParam !== undefined) {
      this.fgView_org.controls['T12_nIdArea'].enable();
      this.aArea.filter( x => x.nDadTipEle === pushParam.nIdTipEle ).forEach( x => {
        this.cboArea.push(x);
      });
    }
  }

  ChangePuesto(pushParam: any) {

    this.fgView_org.controls['T12_nIdEspecialidad'].setValue(null);
    this.fgView_org.controls['T12_nIdEspecialidad'].disable();

    this.cboEspecialidad = new Array();
    if (pushParam !== undefined) {

      const nIdPuesto = pushParam.nIdTipEle;
      const iPuesto = this.aEspecialidad.findIndex( x => x.nDadTipEle === nIdPuesto );
      if (iPuesto > -1) {
        this.aEspecialidad.filter( x => x.nDadTipEle === nIdPuesto ).forEach( x => this.cboEspecialidad.push(x) );
        this.fgView_org.controls['T12_nIdEspecialidad'].enable();
      }
    }
  }

  //#endregion

  //#region FormGroup

  new_fgView_datos() {
    this.fgView_datos = this.fb.group({
      T0_nIdPersonal: [{ value: 0, disabled: true }, [Validators.required]],
      T0_sNombres: [{ value: '', disabled: true }, [Validators.required]],
    });
  }

  new_fgView_info() {
    this.fgView_info = this.fb.group({
      T1_nIdPersonal: 0,
      T1_sApePa: [
        { value: '', disabled: true },
        [Validators.required, Validators.pattern('[a-zA-Z áéíóúÁÉÍÓÚñÑ]*')],
      ],
      T1_sApeMa: [
        { value: '', disabled: true },
        [Validators.required, Validators.pattern('[a-zA-Z áéíóúÁÉÍÓÚñÑ]*')],
      ],
      T1_sPriNom: [
        { value: '', disabled: true },
        [Validators.required, Validators.pattern('[a-zA-Z áéíóúÁÉÍÓÚñÑ]*')],
      ],
      T1_sSegNom: [
        { value: '', disabled: true },
        [Validators.pattern('[a-zA-Z áéíóúÁÉÍÓÚñÑ]*')],
      ],
      T1_dFechNac: [{ value: null, disabled: true }, [Validators.required]],
      T1_nIdSexo: [
        { value: 0, disabled: true },
        [Validators.required, this.valid.noSelect],
      ],
      T1_nIdEstCiv: [
        { value: 0, disabled: true },
        [Validators.required, this.valid.noSelect],
      ],
      T1_nTelMovil: [
        { value: '', disabled: true },
        [
          Validators.required,
          Validators.pattern('[0-9]*'),
          Validators.maxLength(9),
        ],
      ],
      T1_sCorreo: [
        { value: '', disabled: true },
        [Validators.required, Validators.email],
      ],
      T1_nIdResp: [{ value: null, disabled: true }, [Validators.required]],
      T1_nIdNacion: [
        { value: 0, disabled: true },
        [Validators.required, this.valid.noSelect],
      ],
    });

  }

  new_fgView_doc() {
    this.fgView_doc = this.fb.group(
      {
        T3_nIdDD: 0,
        A3_nIdTipoDoc: [
          { value: undefined, disabled: true },
          [Validators.required, this.valid.noSelect],
        ],
        T3_sDocumento: [
          { value: '', disabled: true },
          [Validators.required, Validators.pattern('[0-9]*')],
        ],
        vExiste: [{ value: new Array() }],
      },
      {
        validator: this.valid.vExiste(
          'A3_nIdTipoDoc',
          'T3_sDocumento',
          'vExiste'
        ),
      }
    );
  }

  new_fgView_dom() {
    this.fgView_dom = this.fb.group({
      T9_nIdDireccion: 0,
      codUbigeo1: [
        { value: '', disabled: true },
        [Validators.required, this.valid.noSelect],
      ],
      codUbigeo2: [
        { value: '', disabled: true },
        [Validators.required, this.valid.noSelect],
      ],
      T9_sIdUbigeo: [
        { value: '', disabled: true },
        [Validators.required, this.valid.noSelect],
      ],
      T9_sDireccion: [{ value: '', disabled: true }, [Validators.required]],
      T9_sReferencia: [{ value: '', disabled: true }],
    });
  }

  new_fgView_plab() {
    this.fgView_plab = this.fb.group({
      T2_nIdPerLab: 0,
      T2_dFechIni: [{ value: null, disabled: true }, [Validators.required]],
      T2_nIdMotFin: [{ value: 0, disabled: true }],
      T2_dFechFin: [{ value: null, disabled: true }, [Validators.required]],
    });
  }

  new_fgView_plla() {
    this.fgView_plla = this.fb.group({
      T4_nIdDPLP: 0,
      T4_nIdPlla: [
        { value: 0, disabled: true },
        [Validators.required, this.valid.noSelect],
      ],
    });
  }

  new_fgView_sp() {
    this.fgView_sp = this.fb.group({
      T6_nIdDPLRP: 0,
      tipoSisPen: [
        { value: 0, disabled: true },
        [Validators.required, this.valid.noSelect],
      ],
      A6_nIdRegPen: [
        { value: undefined, disabled: true },
        [Validators.required, this.valid.noSelect],
      ],
      T6_sCuspp: [
        { value: '', disabled: true },
        [this.valid.vCuspp, Validators.maxLength(12)],
      ],
    });
  }

  new_fgView_rem() {
    this.fgView_rem = this.fb.group(
      {
        nIdPlRem: 0,
        A7_nTipoSalario: [
          { value: 0, disabled: true },
          [Validators.required, this.valid.noSelect],
        ],
        T7_nMonto: [{ value: 0, disabled: true }, [this.valid.vMonto]],
        L1_nIdPlRem: this.fb.array([]),
      },
      {
        validator: this.valid.vLineas('L1_nIdPlRem'),
      }
    );
  }

  new_fgView_banco() {
    this.fgView_banco = this.fb.group({
      T8_nIdDPLB: 0,
      T8_nIdTipoCta: [{ value: 0, disabled: true }, [Validators.required]],
      A8_nIdBanco: [
        { value: undefined, disabled: true },
        [this.valid.noSelect],
      ],
      T8_sNroCuenta: [
        { value: '', disabled: true },
        [Validators.required, this.valid.vString],
      ],
      T8_nIdMoneda: [
        { value: 0, disabled: true },
        [Validators.required, this.valid.noSelect],
      ],
      A8_nIdTipoDoc: [
        { value: undefined, disabled: true },
        [Validators.required, this.valid.noSelect],
      ],
      T8_sDocumento: [
        { value: '', disabled: true },
        [Validators.required, Validators.pattern('[0-9]*'), this.valid.vString],
      ],
    });
  }

  new_fgView_org() {
    this.fgView_org = this.fb.group({
      T12_nIdDPLO: 0,
      T12_nIdDireccion: [{ value: null, disabled: true }, [Validators.required]],
      T12_nIdArea: [{ value: null, disabled: true }, [Validators.required]],
      sArea: '',
      T12_nIdCargo: [{ value: null, disabled: true }, [Validators.required]],
      T12_nIdPuesto: [{ value: null, disabled: true }, [Validators.required]],
      T12_nIdEspecialidad: [{ value: null, disabled: true }]
    });
  }

  get getView_datos() {
    return this.fgView_datos.controls;
  }
  get getView_info() {
    return this.fgView_info.controls;
  }
  get getView_nombres() {
    let sNombres = '';
    sNombres =
      (this.getView_info.T1_sApePa.value as string).trim() +
      ' ' +
      (this.getView_info.T1_sApeMa.value as string).trim() +
      ' ' +
      (this.getView_info.T1_sPriNom.value as string).trim() +
      ' ' +
      (this.getView_info.T1_sSegNom.value as string).trim();
    return sNombres;
  }

  get getView_doc() {
    return this.fgView_doc.controls;
  }
  get getView_dom() {
    return this.fgView_dom.controls;
  }
  get getView_plab() {
    return this.fgView_plab.controls;
  }
  get getView_plla() {
    return this.fgView_plla.controls;
  }
  get getView_pllaDesc() {
    let sPlanilla = '';
    const nIdPlla = this.getView_plla.T4_nIdPlla.value;
    if (nIdPlla !== 0 && nIdPlla !== undefined) {
      const aFilter = this.cboPlanilla.filter((x) => {
        const a = x.nIdPlla === nIdPlla;
        return a;
      });
      sPlanilla = aFilter[0].sDesc;
    }
    return sPlanilla;
  }

  get getView_sp() {
    return this.fgView_sp.controls;
  }
  get getView_spDesc() {
    let sAfp = '';
    const oAfp = this.getView_sp.A6_nIdRegPen.value;
    if (oAfp !== undefined && oAfp !== null) {
      sAfp = oAfp.sDesc;
    }
    return sAfp;
  }

  get getView_rem() {
    return this.fgView_rem.controls;
  }
  get getView_remDesc() {
    let sRem = '';
    const oRem = this.getView_rem.A7_nTipoSalario.value;
    if (oRem !== undefined && oRem !== null) {
      sRem = oRem.sDesc;
    }
    return sRem;
  }

  get getView_banco() {
    return this.fgView_banco.controls;
  }
  get getView_bancoDesc() {
    let sBanco = '';
    const oBanco = this.getView_banco.A8_nIdBanco.value;
    if (oBanco !== undefined && oBanco !== null) {
      sBanco = oBanco.sDesc;
    }
    return sBanco;
  }

  get getView_org() {
    return this.fgView_org.controls;
  }

  get getView_orgDesc() {
    let sOrg = '';
    const oOrg = this.getView_org.sArea.value;
    if (oOrg !== undefined && oOrg !== null) {
      sOrg = oOrg;
    }
    return sOrg;
  }

  //#endregion

  //#region Load

  loadView(Value: any, iValue: number, index: number) {
    Object.values(Value).forEach((lista: Array<any>, iLista: number) => {
      if (lista.length > 0) {
        switch (iLista) {
          case 0:
            if (iValue === -1 || iValue === iLista) {
              this.fgView_datos.patchValue({
                T0_nIdPersonal: lista[index].nIdPersonal,
                T0_sNombres: lista[index].sNombres,
              });

              this.fgView_info.patchValue({
                T1_nIdPersonal: lista[index].nIdPersonal,
                T1_sApePa: lista[index].sApePa,
                T1_sApeMa: lista[index].sApeMa,
                T1_sPriNom: lista[index].sPriNom,
                T1_sSegNom: lista[index].sSegNom,
                T1_dFechNac: lista[index].dFechNac,
                T1_nIdSexo: lista[index].nIdSexo,
                T1_nIdEstCiv: lista[index].nIdEstCiv,
                T1_nTelMovil: lista[index].nTelMovil,
                T1_sCorreo: lista[index].sCorreo,
                T1_nIdNacion: lista[index].nIdNacion,
              });

              const nIdResp = lista[index].nIdResp;
              const iSup = this.aResponsable.findIndex(
                (x) => x.nIdResp_ === nIdResp
              );

              if (iSup > -1) {
                this.fgView_info.controls.T1_nIdResp.setValue(nIdResp);
              }
            }
            break;

          case 1:
            if (iValue === -1 || iValue === iLista) {
              this.fgView_doc.patchValue({
                T3_nIdDD: lista[index].nIdDD,
                T3_sDocumento: lista[index].sDocumento,
                vExiste: this.aListaPerso.filter(
                  (x) => x.nIdPersonal !== this.nIdPersonal
                ),
              });

              const aTipoDoc = this.cboTipoDoc as Array<any>;
              const iTipoDoc = aTipoDoc.findIndex(
                (x) => x.nIdTipoDoc_ === lista[index].nIdTipoDoc
              );

              if (iTipoDoc > -1) {
                const fcTipoDoc = this.fgView_doc.get(
                  'A3_nIdTipoDoc'
                ) as FormControl;
                fcTipoDoc.setValue(aTipoDoc[iTipoDoc]);
              }
              this.dsView_doc = new MatTableDataSource(lista);
              this.dsView_doc.paginator = this.pagDoc;
              this.tView_doc.renderRows();
            }
            break;

          case 2:
            if (iValue === -1 || iValue === iLista) {
              this.fgView_dom.patchValue({
                T9_nIdDireccion: lista[index].nIdDireccion,
                T9_sDireccion: lista[index].sDireccion,
                T9_sReferencia: lista[index].sReferencia,
              });

              // ComboBox Departamento
              const codUbigeo = lista[index].sIdUbigeo as string;
              const codUbigeo1 = codUbigeo.substring(0, 5);
              this.ChangeUbigeo(codUbigeo1, 1, 0);

              const fcCodUbigeo1 = this.fgView_dom.controls[
                'codUbigeo1'
              ] as FormControl;
              fcCodUbigeo1.disable();

              // ComboBox Provincia
              const codUbigeo2 = codUbigeo.substring(0, 7);
              this.ChangeUbigeo(codUbigeo2, 2, 0);

              const fcCodUbigeo2 = this.fgView_dom.controls[
                'codUbigeo2'
              ] as FormControl;
              fcCodUbigeo2.disable();

              // ComboBox Distrito
              const codUbigeo3 = codUbigeo.substring(0, 9);
              this.ChangeUbigeo(codUbigeo3, 3, 0);

              const fcCodUbigeo3 = this.fgView_dom.controls[
                'T9_sIdUbigeo'
              ] as FormControl;
              fcCodUbigeo3.disable();

              this.dsView_dom = new MatTableDataSource(lista);
              this.dsView_dom.paginator = this.pagDom;
              this.tView_dom.renderRows();
            }
            break;

          case 3:
            if (iValue === -1 || iValue === iLista) {
              this.fgView_plab.patchValue({
                T2_nIdPerLab: lista[index].nIdPerLab,
                T2_dFechIni: lista[index].dFechIni,
                T2_nIdMotFin: lista[index].nIdMotFin,
                T2_dFechFin: lista[index].dFechFin,
              });
              this.nIdPerLab = lista[index].nIdPerLab;
              this.dsView_plab = new MatTableDataSource(lista);
              this.dsView_plab.paginator = this.pagPlab;
              this.tView_plab.renderRows();
            }
            break;

          case 4:
            if (iValue === -1 || iValue === iLista) {
              if (this.nIdPerLab === lista[index].nIdPerLab) {
                this.fgView_plla.patchValue({
                  T4_nIdDPLP: lista[index].nIdDPLP,
                  T4_nIdPlla: lista[index].nIdPlla,
                });
                this.dsView_plla = new MatTableDataSource(lista);
                this.dsView_plla.paginator = this.pagPlla;
                this.tView_plla.renderRows();
              }
            }
            break;

          case 5:
            // Cargo > Organización
            break;

          case 6:
            if (iValue === -1 || iValue === iLista) {
              if (this.nIdPerLab === lista[index].nIdPerLab) {
                this.fgView_sp.patchValue({
                  T6_nIdDPLRP: lista[index].nIdDPLRP,
                  tipoSisPen: lista[index].nIdTipoRegPen,
                  T6_sCuspp: lista[index].sCuspp,
                });

                let fArray = new Array();
                fArray = this.aAFP.filter((elemento) => {
                  const filter1 = elemento.nIdTipoRegPen
                    .toString()
                    .includes(lista[index].nIdTipoRegPen);
                  return filter1;
                });
                this.cboAFP = fArray;

                const aRegPen = this.cboAFP;
                const iRegPen = aRegPen.findIndex(
                  (x) => x.nIdRegPen_ === lista[index].nIdRegPen
                );

                if (iRegPen > -1) {
                  const fcRegPen = this.fgView_sp.get(
                    'A6_nIdRegPen'
                  ) as FormControl;
                  fcRegPen.setValue(aRegPen[iRegPen]);
                }

                this.dsView_sp = new MatTableDataSource(lista);
                this.dsView_sp.paginator = this.pagSp;
                this.tView_sp.renderRows();
              }
            }
            break;

          case 7:
            if (iValue === -1 || iValue === iLista) {
              if (this.nIdPerLab === lista[index].nIdPerLab) {
                this.fgView_rem.patchValue({
                  nIdPlRem: lista[index].nIdPlRem,
                  T7_nMonto: lista[index].nMonto,
                });

                const aTipoSalario = this.cboTipoSalario as Array<any>;
                const iTipoSalario = aTipoSalario.findIndex(
                  (x) => x.nTipoSalario_ === lista[index].nTipoSalario
                );

                if (iTipoSalario > -1) {
                  const fcTipoSalario = this.fgView_rem.get(
                    'A7_nTipoSalario'
                  ) as FormControl;
                  fcTipoSalario.setValue(aTipoSalario[iTipoSalario]);
                }

                const faRem = this.fgView_rem.controls.L1_nIdPlRem as FormArray;

                lista.forEach((_element: any, iElement: number) => {
                  faRem.push(
                    this.fb.group({
                      nIdPlRem: [lista[iElement].nIdPlRem],
                      aConcepto: this.fb.array([]),
                    })
                  );
                });

                this.dsView_rem = new MatTableDataSource(lista);
                this.dsView_rem.paginator = this.pagRem;
                this.tView_rem.renderRows();
              }
            }
            break;

          case 8:
            if (iValue === -1 || iValue === iLista) {
              const fRem = this.fgView_rem.controls.L1_nIdPlRem as FormArray;
              const aRem = this.fgView_rem.controls.L1_nIdPlRem
                .value as Array<any>;

              lista.forEach((element: any, iElement: number) => {
                const iArray = aRem.findIndex(
                  (x) => x.nIdPlRem === lista[iElement].nIdPlRem
                );
                if (iArray > -1) {
                  const fConc = fRem.controls[iArray] as FormGroup;
                  const aConc = fConc.controls.aConcepto as FormArray;

                  aConc.push(
                    this.fb.group({
                      nIdDPLR: [lista[iElement].nIdDPLR],
                      nIdConcepto: [lista[iElement].nIdConcepto],
                      sDesc: [lista[iElement].sDesc],
                      nImporte: [lista[iElement].nImporte],
                    })
                  );
                }
              });
            }
            break;

          case 9:
            if (iValue === -1 || iValue === iLista) {
              if (this.nIdPerLab === lista[index].nIdPerLab) {
                this.fgView_banco.patchValue({
                  T8_nIdDPLB: lista[index].nIdDPLB,
                  T8_nIdTipoCta: lista[index].nIdTipoCta,
                  T8_sNroCuenta: lista[index].sNroCuenta,
                  T8_nIdMoneda: lista[index].nIdMoneda,
                  T8_sDocumento: lista[index].sDocumento,
                });

                const aBanco = this.cboBanco as Array<any>;
                const iBanco = aBanco.findIndex(
                  (x) => x.nIdBanco_ === lista[index].nIdBanco
                );
                if (iBanco > -1) {
                  const fcBanco = this.fgView_banco.get(
                    'A8_nIdBanco'
                  ) as FormControl;
                  fcBanco.setValue(aBanco[iBanco]);
                }

                const aTipoDocBanco = this.cboTipoDoc as Array<any>;
                const iTipoDocBanco = aTipoDocBanco.findIndex(
                  (x) => x.nIdTipoDoc_ === lista[index].nIdTipoDoc
                );

                if (iTipoDocBanco > -1) {
                  const fcTipoDocBanco = this.fgView_banco.get(
                    'A8_nIdTipoDoc'
                  ) as FormControl;
                  fcTipoDocBanco.setValue(aTipoDocBanco[iTipoDocBanco]);
                }

                this.dsView_banco = new MatTableDataSource(lista);
                this.dsView_banco.paginator = this.pagBanco;
                this.tView_banco.renderRows();
              }
            }
            break;

          case 10:
            // Centro de Costo > Organización
            break;

          case 11:
            this.dsView_documento = new MatTableDataSource(lista);
            break;

          case 12:
            if (iValue === -1 || iValue === iLista) {
              if (this.nIdPerLab === lista[index].nIdPerLab) {

                this.fgView_org.patchValue({
                  T12_nIdDPLO: lista[index].nIdDPLO,
                  T12_nIdDireccion: lista[index].nIdDireccion,
                  T12_nIdCargo: lista[index].nIdCargo,
                  sArea: lista[index].sArea
                });

                // Area
                this.cboArea = new Array();
                const nIdArea = lista[index].nIdArea;
                const nIdDireccion = lista[index].nIdDireccion;
                this.aArea.filter(x => x.nDadTipEle === nIdDireccion ).forEach( x => {
                  this.cboArea.push(x);
                });
                this.fgView_org.controls['T12_nIdArea'].setValue(nIdArea);

                // Puesto
                this.cboPuesto = new Array();
                const nIdPuesto = lista[index].nIdPuesto;
                const nIdCargo = lista[index].nIdCargo;
                this.aPuesto.filter(x => x.nParam === nIdCargo ).forEach( x => {
                  this.cboPuesto.push(x);
                });
                this.fgView_org.controls['T12_nIdPuesto'].setValue(nIdPuesto);

                // Especialidad
                this.cboEspecialidad = new Array();
                const nIdEspecialidad = lista[index].nIdEspecialidad;
                this.aEspecialidad.filter(x => x.nDadTipEle === nIdPuesto ).forEach( x => {
                  this.cboEspecialidad.push(x);
                });
                this.fgView_org.controls['T12_nIdEspecialidad'].setValue(nIdEspecialidad);

                this.dsView_org = new MatTableDataSource(lista);
                this.dsView_org.paginator = this.pagOrg;
                this.tView_org.renderRows();
              }
            }
            break;
        }
      }
    });
  }

  btnSelect(element: any) {
    let aView: Array<any>;
    let iView: number;

    if (this.tabView === 0) {
      switch (this.tabView_dp.value) {
        case 1:
          aView = this.aView_backup.lDoc as Array<any>;
          iView = aView.findIndex((x) => x.nIdDD === element.nIdDD);
          iView = iView === -1 ? 0 : iView;

          this.loadView(this.aView_backup, 1, iView);
          break;
        case 2:
          aView = this.aView_backup.lDom as Array<any>;
          iView = aView.findIndex(
            (x) => x.nIdDireccion === element.nIdDireccion
          );
          iView = iView === -1 ? 0 : iView;

          this.loadView(this.aView_backup, 2, iView);
          break;
        case 3:
          aView = this.aView_backup.lPlab as Array<any>;
          iView = aView.findIndex((x) => x.nIdPerLab === element.nIdPerLab);
          iView = iView === -1 ? 0 : iView;

          this.nIdPerLab = element.nIdPerLab;

          this.loadView(this.aView_backup, 3, iView);
          break;
      }
    } else {
      switch (this.tabView_pl.value) {
        case 0:
          aView = this.aView_backup.lPlla as Array<any>;
          iView = aView.findIndex((x) => x.nIdDPLP === element.nIdDPLP);
          iView = iView === -1 ? 0 : iView;

          this.loadView(this.aView_backup, 4, iView);
          break;
        case 1:
          aView = this.aView_backup.lOrganizacion as Array<any>;
          iView = aView.findIndex((x) => x.nIdDPLO === element.nIdDPLO);
          iView = iView === -1 ? 0 : iView;

          this.loadView(this.aView_backup, 12, iView);
          break;
        case 2:
          // Cargo > Organización
          break;
        case 3:
          aView = this.aView_backup.lRegPen as Array<any>;
          iView = aView.findIndex((x) => x.nIdDPLRP === element.nIdDPLRP);
          iView = iView === -1 ? 0 : iView;

          this.loadView(this.aView_backup, 6, iView);
          break;
        case 4:
          aView = this.aView_backup.lBanco as Array<any>;
          iView = aView.findIndex((x) => x.nIdDPLB === element.nIdDPLB);
          iView = iView === -1 ? 0 : iView;

          this.loadView(this.aView_backup, 9, iView);
          break;
        case 5:
          aView = this.aView_backup.lRem as Array<any>;
          iView = aView.findIndex((x) => x.nIdPlRem === element.nIdPlRem);
          iView = iView === -1 ? 0 : iView;

          this.loadView(this.aView_backup, 7, iView);
          break;
      }
    }
  }

  fabEnable(
    oModo: number,
    tabView: number,
    panelView_dp: number,
    panelView_pl: number
  ) {
    let sModo: string;
    let tModo: string;
    if (oModo === 1) {
      // New
      sModo = 'añadir';
      tModo =
        'El nuevo registro tendrá como referencia los datos del último registro.';
    } else {
      // Edit
      sModo = 'editar';
      tModo = 'Se inhabilitará los demás controles.';
    }

    let fGroup: FormGroup;
    let fControl: FormControl;
    const lExclude: string[] = [];

    if (tabView === 0) {
      // Datos Personales
      switch (panelView_dp) {
        case 0:
          fGroup = this.fgView_info as FormGroup;
          fControl = fGroup.controls['T1_nIdPersonal'] as FormControl;

          if (oModo === 1) {
            this._snackBar.open('No se puede añadir', 'Cerrar', {
              duration: 1000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
            return;
          }

          break;
        case 1:
          fGroup = this.fgView_doc as FormGroup;
          fControl = fGroup.controls['T3_nIdDD'] as FormControl;

          const fcTipoDoc = this.fgView_doc.get('A3_nIdTipoDoc') as FormControl;
          this.EnabledDoc(fcTipoDoc.value, 0);

          if (oModo === 1) {
            lExclude.push('T3_sDocumento');
          }
          break;
        case 2:
          fGroup = this.fgView_dom as FormGroup;
          fControl = fGroup.controls['T9_nIdDireccion'] as FormControl;

          if (oModo === 1) {
            lExclude.push('codUbigeo2');
            lExclude.push('T9_sIdUbigeo');
          }
          break;
        case 3:
          fGroup = this.fgView_plab as FormGroup;
          fControl = fGroup.controls['T2_nIdPerLab'] as FormControl;

          if (oModo === 2) {
            const nIdMotFin = fGroup.controls['T2_nIdMotFin'] as FormControl;
            if (nIdMotFin.value === 0) {
              lExclude.push('T2_dFechFin');
            }
          } else {
            this._snackBar.open('No se puede añadir', 'Cerrar', {
              duration: 1000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
            return;
          }
          break;
      }
    } else {
      // Periodo laboral
      switch (panelView_pl) {
        case 0:
          fGroup = this.fgView_plla as FormGroup;
          fControl = fGroup.controls['T4_nIdDPLP'] as FormControl;
          break;
        case 1:
          fGroup = this.fgView_org as FormGroup;
          fControl = fGroup.controls['T12_nIdDPLO'] as FormControl;

          if (oModo === 2) {
            if (fControl.value !== 0 && fControl.value !== null) {
              const nIdPuesto = fGroup.controls['T12_nIdPuesto'] as FormControl;
              if (nIdPuesto.value === null) {
                lExclude.push('T12_nIdPuesto');
              }
              const nIdEspecialidad = fGroup.controls['T12_nIdEspecialidad'] as FormControl;
              if (nIdEspecialidad.value === null) {
                lExclude.push('T12_nIdEspecialidad');
              }
            }
          } else {
            lExclude.push('T12_nIdPuesto');
            lExclude.push('T12_nIdEspecialidad');
          }
          break;
        case 2:
          // Cargo > Organización
          break;
        case 3:
          fGroup = this.fgView_sp as FormGroup;
          fControl = fGroup.controls['T6_nIdDPLRP'] as FormControl;

          if (oModo === 2) {
            if (fControl.value !== 0 && fControl.value !== null) {
              const nIdRegPen = fGroup.controls['A6_nIdRegPen'] as FormControl;
              if (nIdRegPen.value.bdisCuspp === false) {
                lExclude.push('T6_sCuspp');
              }
            }
          } else {
            lExclude.push('A6_nIdRegPen');
            lExclude.push('T6_sCuspp');
          }
          break;
        case 4:
          fGroup = this.fgView_banco as FormGroup;
          fControl = fGroup.controls['T8_nIdDPLB'] as FormControl;

          if (oModo === 2) {
            if (fControl.value !== 0 && fControl.value !== null) {
              const nIdBanco = fGroup.controls['A8_nIdBanco'] as FormControl;
              this.EnabledBanco(nIdBanco.value, 0);
              if (nIdBanco.value.bDisBanco === true) {
                lExclude.push('T8_sNroCuenta');
                lExclude.push('T8_nIdMoneda');
                lExclude.push('A8_nIdTipoDoc');
                lExclude.push('T8_sDocumento');
              }
              lExclude.push('T8_nIdTipoCta');
            }
          } else {
            lExclude.push('T8_sNroCuenta');
            lExclude.push('T8_nIdMoneda');
            lExclude.push('A8_nIdTipoDoc');
            lExclude.push('T8_sDocumento');
          }
          break;
        case 5:
          fGroup = this.fgView_rem as FormGroup;
          fControl = fGroup.controls['nIdPlRem'] as FormControl;

          Swal.fire({
            title: '¿ Estas seguro de ' + sModo + '?',
            text: tModo,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ff4081',
            confirmButtonText: this.capitalizeFirstLetter(sModo) + ' !',
            allowOutsideClick: false,
          }).then((result) => {
            if (result.isConfirmed) {
              this.nIdPlRem = fControl.value;
              this.nModo = oModo;
              this.openModal('rem');

              // this.loadRem(fControl.value, oModo);
              return;
            }
          });
          return;
      }
    }

    if (oModo === 2) {
      if (
        fControl.value === 0 ||
        fControl.value === null ||
        fControl.value === undefined
      ) {
        this._snackBar.open('No se puede editar', 'Cerrar', {
          duration: 1000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
        return;
      }
    }

    Swal.fire({
      title: '¿ Estas seguro de ' + sModo + '?',
      text: tModo,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ff4081',
      confirmButtonText: this.capitalizeFirstLetter(sModo) + ' !',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        if (oModo === 1) {
          fGroup.reset();
          if (tabView === 0 && panelView_dp === 2) {
            const sIdPais = JSON.parse(localStorage.getItem('Pais'));
            this.ChangeUbigeo(sIdPais + '00', 1, 0);
            const fc = this.fgView_dom.controls['codUbigeo1'] as FormControl;
            fc.setValue('0');
          }
        }

        this.maView_dp = panelView_dp;
        this.maView_pl = panelView_pl;
        this.abView = [];

        this.delay(250).then((any) => {
          this.abView = this.fbView2;
          this.tsView = 'inactive';
        });

        this.mtg_view._tabs.forEach((element: MatTab, index: number) => {
          element.disabled = index !== tabView ? true : false;
        });

        Object.keys(fGroup.controls).forEach((control) => {
          const iControl = lExclude.findIndex((x) => x === control);
          if (iControl === -1) {
            fGroup.controls[control].enable({ emitEvent: false });
          }
        });

      }
    });
  }

  async fabSave(tabView: number, panelView_dp: number, panelView_pl: number) {
    this.aParam = [];
    let prefix: string;

    let fGroup: FormGroup;
    let fControl: FormControl;
    let sValid: string;
    let iLista: number;
    let iStoreP: number;

    if (tabView === 0) {
      // Datos Personales
      switch (panelView_dp) {
        case 0:
          prefix = 'T1';
          fGroup = this.fgView_info as FormGroup;
          fControl = fGroup.controls['T1_nIdPersonal'] as FormControl;
          sValid = 'información';
          iLista = 0;
          iStoreP = 15;
          break;
        case 1:
          prefix = 'T3';
          fGroup = this.fgView_doc as FormGroup;
          fControl = fGroup.controls['T3_nIdDD'] as FormControl;
          sValid = 'documento de identidad';
          iLista = 1;
          iStoreP = 16;
          break;
        case 2:
          prefix = 'T9';
          fGroup = this.fgView_dom as FormGroup;
          fControl = fGroup.controls['T9_nIdDireccion'] as FormControl;
          sValid = 'domicilio';
          iLista = 2;
          iStoreP = 17;
          break;
        case 3:
          prefix = 'T2';
          fGroup = this.fgView_plab as FormGroup;
          fControl = fGroup.controls['T2_nIdPerLab'] as FormControl;
          sValid = 'periodo laboral';
          iLista = 3;
          iStoreP = 18;
          break;
      }
    } else {
      // Periodo laboral
      switch (panelView_pl) {
        case 0:
          prefix = 'T4';
          fGroup = this.fgView_plla as FormGroup;
          fControl = fGroup.controls['T4_nIdDPLP'] as FormControl;
          sValid = 'planilla';
          iLista = 4;
          iStoreP = 19;
          break;
        case 1:
          prefix = 'T12';
          fGroup = this.fgView_org as FormGroup;
          fControl = fGroup.controls['T12_nIdDPLO'] as FormControl;
          sValid = 'organización';
          iLista = 12;
          iStoreP = 34;
          break;
        case 2:
          // Cargo > Organización
          break;
        case 3:
          prefix = 'T6';
          fGroup = this.fgView_sp as FormGroup;
          fControl = fGroup.controls['T6_nIdDPLRP'] as FormControl;
          sValid = 'sistema pensionario';
          iLista = 6;
          iStoreP = 21;

          // Cuspp
          const fgCuspp = fGroup.controls['T6_sCuspp'] as FormControl;
          if (fgCuspp.disabled === true) {
            this.aParam.push('T6¡sCuspp!' + fgCuspp.value);
          }

          break;
        case 4:
          prefix = 'T8';
          fGroup = this.fgView_banco as FormGroup;
          fControl = fGroup.controls['T8_nIdDPLB'] as FormControl;
          sValid = 'banco';
          iLista = 9;
          iStoreP = 24;
          break;
      }
    }

    this.pbView = true;

    if (fGroup.invalid) {
      Swal.fire(
        'No se puede guardar',
        'Información incorrecta o incompleta en la sección ' + sValid,
        'error'
      );
      this.pbView = false;
    } else {
      // New - 1 | Edit - 2
      let oModo: number;
      oModo = fControl.value === 0 || fControl.value === null || fControl.value === undefined ? 1 : 2;

      fControl.markAsDirty();
      this.fnGetParam(fGroup.controls, oModo === 2 ? true : false);

      if (this.aParam.length > (oModo === 2 ? 1 : 0)) {
        const aResult = new Array();
        let result: Object;

        // Usuario y Fecha con hora
        const user = localStorage.getItem('currentUser');
        const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

        if (oModo === 2) {
          this.aParam.push(prefix + '¡sModUser!' + uid);
          this.aParam.push(prefix + '¡dtMod!GETDATE()');

          result = await this.service._crudSP(3, this.aParam, this.url);
        } else {
          // Actualiza registro anterior y creo uno nuevo
          this.aParam.push(prefix + '¡sRegUser!' + uid);
          this.aParam.push(prefix + '¡dtReg!GETDATE()');

          this.lastItem(iLista, tabView, panelView_dp, panelView_pl, prefix);
          result = await this.service._crudSP(5, this.aParam, this.url);
        }

        Object.keys(result).forEach((valor) => {
          aResult.push(result[valor]);
        });

        let ftitle = '';
        let ftext = '';
        let ftype = '';

        for (const e of aResult) {
          const iResult = aResult.indexOf(e);

          if (e.split('!')[0] !== '00') {
            ftitle =
              oModo === 2
                ? 'Actualización satisfactoria'
                : 'Registro satisfactorio';
            fControl.setValue(Number(e.split('!')[1]));
            ftext = 'Sección : ' + sValid;
            ftype = 'success';
          } else {
            ftitle = 'Inconveniente';
            ftext = e.split('!')[1];
            ftype = 'error';
            break;
          }
        }

        this.aParam = [];

        Swal.fire(ftitle, ftext, ftype !== 'error' ? 'success' : 'error');

        if (ftype !== 'error') {
          // Actualización de la tabla
          this.viewUpdate(
            iLista,
            iStoreP,
            tabView,
            panelView_dp,
            panelView_pl,
            true
          );
        }

        this.pbView = false;
        return;
      } else {
        this._snackBar.open('No se realizó ningún cambio.', 'Cerrar', {
          duration: 1000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });

        this.pbView = false;
        return;
      }
    }
  }

  viewUpdate(
    iLista: number,
    iStoreP: number,
    tabView: number,
    panelView_dp: number,
    panelView_pl: number,
    bCancel: boolean
  ) {
    const nIdPersonal = this.fgView_datos.controls['T0_nIdPersonal'].value;
    const param = [];
    param.push('0¡A.nIdPersonal!' + nIdPersonal.toString());

    Object.values(this.aView_backup).forEach(
      async (lista: Array<any>, index: number) => {
        if (index === iLista) {
          await this.service
            ._loadSP(iStoreP, param, this.url)
            .then((value: any[]) => {
              lista.splice(0, lista.length);
              value.forEach((element: any, iElement: number) => {
                lista.push(value[iElement]);
              });

              if (bCancel === true) {
                this.fabCancel(tabView, panelView_dp, panelView_pl);
              }
            });
        }
      }
    );
  }

  lastItem(
    iLista: number,
    tabView: number,
    panelView_dp: number,
    panelView_pl: number,
    prefix: string
  ) {
    const iTabla = prefix.substring(1, prefix.length);

    let sWhere: string;
    let sSet: string;

    // Bajo la primisa que siempre existe un periodo laboral
    let aLista = this.aView_backup.lPlab as Array<any>;
    const dFechIni_pl: Date = aLista[0].dFechIni;
    const nIdPerLab: number = aLista[0].nIdPerLab;

    Object.values(this.aView_backup).forEach(
      async (lista: Array<any>, index: number) => {
        if (index === iLista) {
          if (tabView === 0) {
            switch (panelView_dp) {
              case 0:
                break;
              case 1:
                let dFechIni: Date;
                let dFechFin: any;
                let newIni: string;

                aLista = this.aView_backup.lDatos as Array<any>;
                const nIdPersonal: number = aLista[0].nIdPersonal;

                if (lista.length > 0) {
                  sWhere = lista[0].nIdDD.toString();
                  this.aParam.push('W' + iTabla + '¡nIdDD!' + sWhere);

                  dFechIni = lista[0].dFechIni;
                  dFechFin = moment(dFechIni)
                    .endOf('month')
                    .format('MM/DD/YYYY');
                  newIni = moment(dFechFin).add(1, 'days').format('MM/DD/YYYY');

                  sSet = dFechFin;
                  this.aParam.push('S' + iTabla + '¡dFechFin!' + sSet);
                } else {
                  newIni = moment(dFechIni_pl).format('MM/DD/YYYY');
                }

                this.aParam.push(
                  prefix + '¡nIdPersonal!' + nIdPersonal.toString()
                );
                this.aParam.push(prefix + '¡dFechIni!' + newIni);
                break;
              case 2:
                aLista = this.aView_backup.lDatos as Array<any>;
                const nIdEntidad: number = aLista[0].nIdEntidad;

                if (lista.length > 0) {
                  sWhere = lista[0].nIdDireccion.toString();
                  this.aParam.push(
                    'W' +
                    (Number(iTabla) + 1).toString() +
                    '¡nIdDireccion!' +
                    sWhere
                  );
                  this.aParam.push(
                    'W' + (Number(iTabla) + 1).toString() + '¡nIdArea!600'
                  );

                  sSet = '0';
                  this.aParam.push(
                    'S' +
                    (Number(iTabla) + 1).toString() +
                    '¡bPrincipal!' +
                    sSet
                  );
                  this.aParam.push(prefix + '¡sDesc!Dirección manual');
                } else {
                  this.aParam.push(prefix + '¡sDesc!Documento de identidad');
                }

                // Campos nuevo registro
                this.aParam.push(
                  prefix + '¡nIdEntidad!' + nIdEntidad.toString()
                );
                this.aParam.push(
                  'T' + (Number(iTabla) + 1).toString() + '¡nIdArea!600'
                );
                this.aParam.push(
                  'T' + (Number(iTabla) + 1).toString() + '¡bEstado!1'
                );
                this.aParam.push(
                  'T' + (Number(iTabla) + 1).toString() + '¡bPrincipal!1'
                );

                const user = localStorage.getItem('currentUser');
                const uid = JSON.parse(window.atob(user.split('.')[1])).uid;
                this.aParam.push(
                  'T' + (Number(iTabla) + 1).toString() + '¡sRegUser!' + uid
                );
                this.aParam.push(
                  'T' + (Number(iTabla) + 1).toString() + '¡dtReg!GETDATE()'
                );
                break;
              case 3:
                break;
            }
          } else {
            let dFechIni: Date;
            let dFechFin: any;
            let newIni: string;

            lista = lista.filter((item) => {
              const filter = item.nIdPerLab === this.nIdPerLab;
              return filter;
            });

            if (lista.length > 0) {
              switch (panelView_pl) {
                case 0:
                  sWhere = lista[0].nIdDPLP.toString();
                  this.aParam.push('W' + iTabla + '¡nIdDPLP!' + sWhere);
                  break;
                case 1:
                  sWhere = lista[0].nIdDPLO.toString();
                  this.aParam.push('W' + iTabla + '¡nIdDPLO!' + sWhere);
                  break;
                case 2:
                  sWhere = lista[0].nIdDPLC.toString();
                  this.aParam.push('W' + iTabla + '¡nIdDPLC!' + sWhere);
                  break;
                case 3:
                  sWhere = lista[0].nIdDPLRP.toString();
                  this.aParam.push('W' + iTabla + '¡nIdDPLRP!' + sWhere);
                  break;
                case 4:
                  sWhere = lista[0].nIdDPLB.toString();
                  this.aParam.push('W' + iTabla + '¡nIdDPLB!' + sWhere);

                  sWhere =
                    this.fgView_banco.controls[
                      'T8_nIdTipoCta'
                    ].value.toString();
                  this.aParam.push('W' + iTabla + '¡nIdTipoCta!' + sWhere);
                  break;
                case 5:
                  sWhere = lista[0].nIdPlRem.toString();
                  this.aParam.push('W' + iTabla + '¡nIdPlRem!' + sWhere);
                  break;
              }

              dFechIni = lista[0].dFechIni;
              dFechFin = moment(dFechIni).endOf('month').format('MM/DD/YYYY');
              newIni = moment(dFechFin).add(1, 'days').format('MM/DD/YYYY');

              sSet = dFechFin;
              this.aParam.push('S' + iTabla + '¡dFechFin!' + sSet);
            } else {
              newIni = moment(dFechIni_pl).format('MM/DD/YYYY');
            }

            this.aParam.push(prefix + '¡nIdPerLab!' + nIdPerLab.toString());
            this.aParam.push(prefix + '¡dFechIni!' + newIni);
          }
        }
      }
    );
  }

  fabCancel(tabView: number, panelView_dp: number, panelView_pl: number) {
    let fGroup: FormGroup;
    let fControl: FormControl;
    let nId: number;
    let aView: Array<any>;
    let iView: number;

    if (tabView === 0) {
      // Datos Personales
      switch (panelView_dp) {
        case 0:
          fGroup = this.fgView_info as FormGroup;
          fControl = fGroup.controls['T1_nIdPersonal'] as FormControl;
          nId = fControl.value;

          this.fgView_datos.reset();
          this.fgView_info.reset();

          aView = this.aView_backup.lDatos as Array<any>;
          iView = aView.findIndex((x) => x.nIdPersonal === nId);
          iView = iView === -1 ? 0 : iView;

          this.loadView(this.aView_backup, 0, iView);
          break;
        case 1:
          fGroup = this.fgView_doc as FormGroup;
          fControl = fGroup.controls['T3_nIdDD'] as FormControl;
          nId = fControl.value;

          this.fgView_doc.reset();

          aView = this.aView_backup.lDoc as Array<any>;
          iView = aView.findIndex((x) => x.nIdDD === nId);
          iView = iView === -1 ? 0 : iView;

          this.loadView(this.aView_backup, 1, iView);
          break;
        case 2:
          fGroup = this.fgView_dom as FormGroup;
          fControl = fGroup.controls['T9_nIdDireccion'] as FormControl;
          nId = fControl.value;

          this.fgView_dom.reset();

          aView = this.aView_backup.lDom as Array<any>;
          iView = aView.findIndex((x) => x.nIdDireccion === nId);
          iView = iView === -1 ? 0 : iView;

          this.loadView(this.aView_backup, 2, iView);
          break;
        case 3:
          fGroup = this.fgView_plab as FormGroup;
          fControl = fGroup.controls['T2_nIdPerLab'] as FormControl;
          nId = fControl.value;

          this.fgView_plab.reset();

          aView = this.aView_backup.lPlab as Array<any>;
          iView = aView.findIndex((x) => x.nIdPerLab === nId);
          iView = iView === -1 ? 0 : iView;

          this.loadView(this.aView_backup, 3, iView);
          break;
      }
    } else {
      // Periodo laboral
      switch (panelView_pl) {
        case 0:
          fGroup = this.fgView_plla as FormGroup;
          fControl = fGroup.controls['T4_nIdDPLP'] as FormControl;
          nId = fControl.value;

          this.fgView_plla.reset();

          aView = this.aView_backup.lPlla as Array<any>;
          iView = aView.findIndex((x) => x.nIdDPLP === nId);
          iView = iView === -1 ? 0 : iView;

          this.loadView(this.aView_backup, 4, iView);
          break;
        case 1:
          fGroup = this.fgView_org as FormGroup;
          fControl = fGroup.controls['T12_nIdDPLO'] as FormControl;
          nId = fControl.value;

          this.fgView_org.reset();

          aView = this.aView_backup.lOrganizacion as Array<any>;
          iView = aView.findIndex((x) => x.nIdDPLO === nId);
          iView = iView === -1 ? 0 : iView;

          this.loadView(this.aView_backup, 12, iView);
          break;
        case 2:
          // Cargo > Organización
          break;
        case 3:
          fGroup = this.fgView_sp as FormGroup;
          fControl = fGroup.controls['T6_nIdDPLRP'] as FormControl;
          nId = fControl.value;

          this.fgView_sp.reset();

          aView = this.aView_backup.lRegPen as Array<any>;
          iView = aView.findIndex((x) => x.nIdDPLRP === nId);
          iView = iView === -1 ? 0 : iView;

          this.loadView(this.aView_backup, 6, iView);
          break;
        case 4:
          fGroup = this.fgView_banco as FormGroup;
          fControl = fGroup.controls['T8_nIdDPLB'] as FormControl;
          nId = fControl.value;

          this.fgView_banco.reset();

          aView = this.aView_backup.lBanco as Array<any>;
          iView = aView.findIndex((x) => x.nIdDPLB === nId);
          iView = iView === -1 ? 0 : iView;

          this.loadView(this.aView_backup, 9, iView);
          break;
        case 5:
          fGroup = this.fgView_rem as FormGroup;
          fControl = fGroup.controls['nIdPlRem'] as FormControl;
          nId = fControl.value;

          this.fgView_rem.reset();

          const faSalario = fGroup.controls['L1_nIdPlRem'] as FormArray;

          Object.values(faSalario.controls).forEach(
            (gcontrol: FormGroup, icontrol: number) => {
              faSalario.removeAt(icontrol);
            }
          );
          faSalario.removeAt(0);

          aView = this.aView_backup.lRem as Array<any>;
          iView = aView.findIndex((x) => x.nIdPlRem === nId);
          iView = iView === -1 ? 0 : iView;

          this.loadView(this.aView_backup, 7, iView);
          this.loadView(this.aView_backup, 8, iView);
          return;
      }
    }

    // this.onToggleFab(4, 0);
    // this.onToggleFab(4, 1);

    this.abView = [];

    this.delay(250).then((any) => {
      this.abView = this.fbView;
      this.tsView = 'active2';
    });

    this.mtg_view._tabs.forEach((element: MatTab, index: number) => {
      element.disabled = false;
    });

    this.maView_dp = -1;
    this.maView_pl = -1;

    Object.keys(fGroup.controls).forEach((control) => {
      fGroup.controls[control].disable({ emitEvent: false });
    });
  }

  //#endregion

  //#region Extra

  changeIndex_View(index: number) {
    this.tabView = index;
    if (index === 0) {
      this.changeIndex_dp(this.tabView_dp.value);
    } else {
      this.changeIndex_pl(this.tabView_pl.value);
    }
  }

  changeIndex_dp(index: number) {
    this.tabView_dp.setValue(index);
    switch (index) {
      case 0:
        this.tiView_dp = 'face';
        break;
      case 1:
        this.tiView_dp = 'fingerprint';
        break;
      case 2:
        this.tiView_dp = 'house';
        break;
      case 3:
        this.tiView_dp = 'date_range';
        break;
    }
  }

  changeIndex_pl(index: number) {
    this.tabView_pl.setValue(index);
    switch (index) {
      case 0:
        this.tiView_pl = 'groups';
        break;
      case 1:
        this.tiView_pl = 'work';
        break;
      case 2:
        this.tiView_pl = 'engineering';
        break;
      case 3:
        this.tiView_pl = 'location_city';
        break;
      case 4:
        this.tiView_pl = 'account_balance';
        break;
      case 5:
        this.tiView_pl = 'monetization_on';
        break;
    }
  }

  getExpanded(cod: number) {
    const faRem = this.fgView_rem.controls.L1_nIdPlRem as FormArray;
    const aRem = this.fgView_rem.controls.L1_nIdPlRem.value as Array<any>;
    let Expanded: Iexpanded = {
      _FormGroup: new FormGroup({}),
      cant: 0,
    };

    if (aRem.length > 0) {
      const iRem = aRem.findIndex((x) => x.nIdPlRem === cod);

      if (iRem > -1) {
        const fgRem = faRem.controls[iRem] as FormGroup;
        const faConcepto = fgRem.controls.aConcepto as FormArray;
        Expanded = {
          _FormGroup: fgRem,
          _DataSource: new MatTableDataSource(faConcepto.value),
          cant: faConcepto.length,
        };
      }
    }
    return Expanded;
  }

  capitalizeFirstLetter(string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }

  async uploadFile(event) {
    if (event.target.files[0]) {
      this.pbView = true;

      const sDocumento = event.target.files[0];

      const sFile = await this.getStringFromFile(sDocumento);
      const iFile = sFile.indexOf(',') + 1;
      const sFileSustento = sFile.substring(iFile, sFile.length);

      const UploadFile: any = await this.service._uploadFile(
        sFileSustento,
        8,
        'documento',
        'application/pdf',
        this.url
      );

      const param = [];
      param.push('T1¡nIdPerLab!' + this.nIdPerLab);
      param.push('T1¡nIdDocumento!4');

      const dFechIni = this.fgView_plab.controls['T2_dFechIni'].value;
      param.push(
        'T1¡dFechIni!' + moment(new Date(dFechIni)).format('MM/DD/YYYY')
      );
      param.push(
        'T1¡dFechFin!' + moment(new Date(dFechIni)).format('MM/DD/YYYY')
      );

      const user = localStorage.getItem('currentUser');
      const uid = JSON.parse(window.atob(user.split('.')[1])).uid;
      param.push('T1¡nIdRegUser!' + uid);
      param.push('T1¡dtReg!GETDATE()');
      param.push('T1¡sDocumento!' + UploadFile.fileUrl);

      await this.service._crudSP(8, param, this.url);

      // Notificar a atencion de personal
      const nIdPersonal = this.fgView_datos.controls['T0_nIdPersonal'].value;
      const sNombres = this.fgView_datos.controls['T0_sNombres'].value;

      this.service.notification(
        nIdPersonal,
        sNombres,
        'ControlP_To_Atencionp',
        this.url
      );

      this._snackBar.open('Se realizó la subida del documento.', 'Cerrar', {
        duration: 1000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });

      this.fbView[2].dis = 'true';
      this.pbView = false;
    }
  }

  async getStringFromFile(fSustento: File) {
    return new Promise<any>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(fSustento);
      reader.onload = () => {
        resolve(reader.result);
      };
    });
  }

  //#endregion
}
