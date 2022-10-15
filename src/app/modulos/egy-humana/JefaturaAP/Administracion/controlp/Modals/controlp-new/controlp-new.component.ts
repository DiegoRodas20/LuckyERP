import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ControlpService } from '../../../../Services/controlp.service';
import Swal from 'sweetalert2';
import { MatTable } from '@angular/material/table';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatExpansionPanel } from '@angular/material/expansion';
import * as moment from 'moment';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { ValidadoresService } from '../../../../Validators/validadores.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-controlp-new',
  templateUrl: './controlp-new.component.html',
  styleUrls: ['./controlp-new.component.css', './controlp-new.component.scss'],
  animations: [adminpAnimations],
})
export class ControlpNewComponent implements OnInit {
  @Input() fromParent;

  //#region Variables

  // Service GET && POST
  url: string;
  aParam = [];
  aParaml = [];
  matcher = new MyErrorStateMatcher();

  // Fab
  fbNew = [
    { icon: 'save', tool: 'Guardar' },
    { icon: 'close', tool: 'Cerrar' },
  ];
  abNew = [];
  tsNew = 'inactive';

  // Tab
  tabNew = 0;

  // Progresbar
  pbNew: boolean;

  // FormGroup
  fgNew_info: FormGroup;
  fgNew_doc: FormGroup;
  fgNew_dom: FormGroup;
  fgNew_plla: FormGroup;
  fgNew_sp: FormGroup;
  fgNew_banco: FormGroup;
  fgNew_plab: FormGroup;
  fgNew_rem: FormGroup;
  fgNew_select: FormGroup;
  fgNew_org: FormGroup;

  // Combobox
  cboGenero = new Array();
  cboNacion = new Array();
  cboEstadoCivil = new Array();
  cboTipoDoc = new Array();
  aUbigeo = new Array();
  cboUbigeo1 = new Array();
  cboUbigeo2 = new Array();
  cboUbigeo3 = new Array();
  cboPlanilla = new Array();
  cboTipoSP = new Array();
  aAFP = new Array();
  cboAFP = new Array();
  cboTipoCuenta = new Array();
  cboBanco = new Array();
  cboMoneda = new Array();
  cboTipoSalario = new Array();
  aConceptos = new Array();
  cboCargo = new Array();
  cboDireccion = new Array();
  cboArea = new Array();
  aArea = new Array();
  cboPuesto = new Array();
  aPuesto = new Array();
  cboEspecialidad = new Array();
  aEspecialidad = new Array();

  // Mat Table
  dcNew_rem: string[] = ['position', 'dsc_', 'nImporte', 'action'];
  dsNew_rem = new Array();
  @ViewChild('tNew_rem') tNew_rem: MatTable<any>;

  // Mat Expansion Panel
  @ViewChild('epNew_info') epNew_info: MatExpansionPanel;
  @ViewChild('epNew_doc') epNew_doc: MatExpansionPanel;
  @ViewChild('epNew_dom') epNew_dom: MatExpansionPanel;
  @ViewChild('epNew_plla') epNew_plla: MatExpansionPanel;
  @ViewChild('epNew_org') epNew_org: MatExpansionPanel;
  @ViewChild('epNew_sp') epNew_sp: MatExpansionPanel;
  @ViewChild('epNew_banco') epNew_banco: MatExpansionPanel;
  @ViewChild('epNew_plab') epNew_plab: MatExpansionPanel;

  // Array
  aResponsable = new Array();
  aListaPerso = new Array();

  //#endregion

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private valid: ValidadoresService,
    public service: ControlpService,
    @Inject('BASE_URL') baseUrl: string,
    private spi: NgxSpinnerService
  ) {
    // SERVICE GET && POST
    this.url = baseUrl;

    this.new_fgNew_info();
    this.new_fgNew_doc();
    this.new_fgNew_dom();
    this.new_fgNew_plla();
    this.new_fgNew_sp();
    this.new_fgNew_banco();
    this.new_fgNew_plab();
    this.new_fgNew_rem();
    this.new_fgNew_select();
    this.new_fgNew_org();
  }

  async ngOnInit(): Promise<void> {
    this.spi.show('spi_new');

    this.aResponsable = this.fromParent.aSupervisor;
    this.aListaPerso = this.fromParent.aPersonal;

    this.fgNew_doc.controls['vExiste'].setValue(this.aListaPerso);

    this.loadCombo();

    // Load
    this.onToggleFab(1, 1);
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    this.ChangeUbigeo(sIdPais + '00', 1, 0);
    const fc = this.fgNew_dom.controls['codUbigeo1'] as FormControl;
    fc.setValue(null);
    this.panelBanco();

    this.spi.hide('spi_new');
  }

  //#region General

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = stat === -1 ? (this.abNew.length > 0 ? 0 : 1) : stat;
        this.tsNew = stat === 0 ? 'inactive' : 'active';
        this.abNew = stat === 0 ? [] : this.fbNew;
        break;
    }
  }

  clickFab(index: number) {
    switch (index) {
      // Guardar
      case 0:
        this.submitNew();
        break;

      // Cancelar
      case 1:
        this.activeModal.dismiss();
        break;
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

  //#region FormGroup

  new_fgNew_info() {
    this.fgNew_info = this.fb.group({
      T1_sApePa: [
        '',
        [Validators.required, Validators.pattern('[a-zA-Z áéíóúÁÉÍÓÚñÑ]*')],
      ],
      T1_sApeMa: [
        '',
        [Validators.required, Validators.pattern('[a-zA-Z áéíóúÁÉÍÓÚñÑ]*')],
      ],
      T1_sPriNom: [
        '',
        [Validators.required, Validators.pattern('[a-zA-Z áéíóúÁÉÍÓÚñÑ]*')],
      ],
      T1_sSegNom: ['', [Validators.pattern('[a-zA-Z áéíóúÁÉÍÓÚñÑ]*')]],
      T1_dFechNac: [null, [Validators.required]],
      T1_nIdSexo: [0, [Validators.required, this.valid.noSelect]],
      T1_nIdEstCiv: [0, [Validators.required, this.valid.noSelect]],
      T1_nTelMovil: [
        '',
        [
          Validators.required,
          Validators.pattern('[0-9]*'),
          Validators.maxLength(9),
        ],
      ],
      T1_sCorreo: ['', [Validators.required, Validators.email]],
      T1_nIdResp: [null, [Validators.required]],
      T1_nIdNacion: [0, [Validators.required, this.valid.noSelect]],
    });
  }

  new_fgNew_doc() {
    this.fgNew_doc = this.fb.group(
      {
        A3_nIdTipoDoc: [undefined, [Validators.required, this.valid.noSelect]],
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

  new_fgNew_dom() {
    this.fgNew_dom = this.fb.group({
      codUbigeo1: [{ value: null, disabled: false }, [Validators.required]],
      codUbigeo2: [{ value: null, disabled: true }, [Validators.required]],
      T9_sIdUbigeo: [{ value: null, disabled: true }, [Validators.required]],
      T9_sDireccion: ['', [Validators.required]],
      T9_sReferencia: [''],
    });
  }

  new_fgNew_plla() {
    this.fgNew_plla = this.fb.group({
      T4_nIdPlla: [0, [Validators.required, this.valid.noSelect]],
    });
  }

  new_fgNew_sp() {
    this.fgNew_sp = this.fb.group({
      tipoSisPen: [0, [Validators.required, this.valid.noSelect]],
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

  new_fgNew_banco() {
    this.fgNew_banco = this.fb.group(
      {
        L2_nIdPerLab: this.fb.array([]),
      },
      {
        validator: this.valid.vLineas('L2_nIdPerLab'),
      }
    );
  }

  panelBanco() {
    const faBanco = this.fgNew_banco.get('L2_nIdPerLab') as FormArray;
    this.cboTipoCuenta.forEach((element, index) => {
      faBanco.push(
        this.fb.group({
          nIdTipoCta: [{ value: 0, disabled: false }, [Validators.required]],
          A_nIdBanco:
            index === 0 ? [undefined, [this.valid.noSelect]] : [undefined],
          sNroCuenta: [
            { value: '', disabled: true },
            [Validators.required, this.valid.vString],
          ],
          nIdMoneda: [
            { value: 0, disabled: true },
            [Validators.required, this.valid.noSelect],
          ],
          A_nIdTipoDoc: [
            { value: undefined, disabled: true },
            [Validators.required, this.valid.noSelect],
          ],
          sDocumento: [
            { value: '', disabled: true },
            [
              Validators.required,
              Validators.pattern('[0-9]*'),
              this.valid.vString,
            ],
          ],
          nIndex_: [0],
        })
      );

      let vIndex = 0;
      const vTipoCta = this.cboTipoCuenta[index].nIdTipEle;

      Object.values(faBanco.controls).forEach((fgBanco: FormGroup) => {
        vIndex = fgBanco.value.nIdTipoCta === vTipoCta ? 1 : vIndex;
      });

      const eArray = faBanco.controls[faBanco.controls.length - 1] as FormGroup;
      eArray.controls['nIdTipoCta'].setValue(vTipoCta);
      eArray.controls['nIndex_'].setValue(vIndex);
    });

    Object.values(faBanco.controls).forEach((fgBanco: FormGroup) => {
      fgBanco.controls['nIdTipoCta'].disable({ onlySelf: true });
    });
  }

  new_fgNew_plab() {
    this.fgNew_plab = this.fb.group({
      T0_dFechIni: [null, [Validators.required]],
    });
  }

  new_fgNew_rem() {
    this.fgNew_rem = this.fb.group(
      {
        A7_nTipoSalario: [0, [Validators.required, this.valid.noSelect]],
        T7_nMonto: [{ value: 0, disabled: true }, [this.valid.vMonto]],
        L1_nIdPlRem: this.fb.array([]),
      },
      {
        validator: this.valid.vLineas('L1_nIdPlRem'),
      }
    );
  }

  new_fgNew_select() {
    this.fgNew_select = this.fb.group({
      nIdConcepto: [null, [Validators.required]],
      dsc: [''],
      nImporte: [null, [this.valid.vMonto]],
    });
  }

  new_fgNew_org() {
    this.fgNew_org = this.fb.group({
      T12_nIdDireccion: [null, [Validators.required]],
      T12_nIdArea: [{ value: null, disabled: true }, [Validators.required]],
      T12_nIdCargo: [null, [Validators.required]],
      T12_nIdPuesto: [{ value: null, disabled: true }, [Validators.required]],
      T12_nIdEspecialidad: [{ value: null, disabled: true }]
    });

  }

  get getNew_info() {
    return this.fgNew_info.controls;
  }
  get getNew_nombres() {
    let sNombres = '';
    sNombres =
      (this.getNew_info.T1_sApePa.value as string).trim() +
      ' ' +
      (this.getNew_info.T1_sApeMa.value as string).trim() +
      ' ' +
      (this.getNew_info.T1_sPriNom.value as string).trim() +
      ' ' +
      (this.getNew_info.T1_sSegNom.value as string).trim();
    return sNombres;
  }

  get getNew_doc() {
    return this.fgNew_doc.controls;
  }
  get getNew_dom() {
    return this.fgNew_dom.controls;
  }

  get getNew_plla() {
    return this.fgNew_plla.controls;
  }
  get getNew_pllaDesc() {
    let sPlanilla = '';
    const nIdPlla = this.getNew_plla.T4_nIdPlla.value;
    if (nIdPlla !== 0 && nIdPlla !== undefined) {
      const aFilter = this.cboPlanilla.filter((x) => {
        const a = x.nIdPlla === nIdPlla;
        return a;
      });
      sPlanilla = aFilter[0].sCodPlla + ' - ' + aFilter[0].sDesc;
    }
    return sPlanilla;
  }

  get getNew_sp() {
    return this.fgNew_sp.controls;
  }
  get getNew_spDesc() {
    let sAfp = '';
    const oAfp = this.getNew_sp.A6_nIdRegPen.value;
    if (oAfp !== undefined) {
      sAfp = oAfp.sDesc;
    }
    return sAfp;
  }

  get getNew_banco() {
    return this.fgNew_banco.controls;
  }
  get getNew_banco_fa() {
    return this.fgNew_banco.get('L2_nIdPerLab') as FormArray;
  }
  get getNew_bancoDesc() {
    let sBanco = '';
    const faBanco = this.fgNew_banco.get('L2_nIdPerLab') as FormArray;

    Object.values(faBanco.controls).forEach((fgBanco: FormGroup) => {
      const nIdTipoCta = fgBanco.controls['nIdTipoCta'].value;
      const oBanco = fgBanco.controls['A_nIdBanco'].value;
      if (oBanco !== undefined && oBanco !== null) {
        const aFilter = this.cboTipoCuenta.filter((x) => {
          const a = x.nIdTipEle === nIdTipoCta;
          return a;
        });
        sBanco = sBanco + aFilter[0].sDesc + ', ';
      }
    });

    return sBanco.length > 1 ? sBanco.substring(0, sBanco.length - 2) : '';
  }

  get getNew_plab() {
    return this.fgNew_plab.controls;
  }
  get getNew_rem() {
    return this.fgNew_rem.controls;
  }
  get getNew_select() {
    return this.fgNew_select.controls;
  }

  get getNew_org() {
    return this.fgNew_org.controls;
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
    this.cboTipoSP = this.fromParent.objGroup.cboTipoSP;
    this.aAFP = this.fromParent.objGroup.aAFP;
    this.cboTipoCuenta = this.fromParent.objGroup.cboTipoCuenta;
    this.cboBanco = this.fromParent.objGroup.cboBanco;
    this.cboMoneda = this.fromParent.objGroup.cboMoneda;
    this.cboTipoSalario = this.fromParent.objGroup.cboTipoSalario;
    this.aConceptos = this.fromParent.objGroup.aConceptos;
    this.cboDireccion = this.fromParent.objGroup.cboDireccion;
    this.aArea = this.fromParent.objGroup.aArea;
    this.aPuesto = this.fromParent.objGroup.aPuesto;
    this.aEspecialidad = this.fromParent.objGroup.aEspecialidad;
  }

  EnabledDoc(pushParam: any) {
    const fGroup = this.fgNew_doc;
    const fcDocumento = fGroup.controls['T3_sDocumento'] as FormControl;
    fcDocumento.setValue('');

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
    const fGroup = this.fgNew_dom as FormGroup;

    const _mod = mod === 1 ? opc - 1 : opc;

    switch (_mod) {
      case 1:
        this.cboUbigeo2 = new Array();
        fGroup.get('codUbigeo2').setValue(null);
        fGroup.get('codUbigeo2').disable();

        this.cboUbigeo3 = new Array();
        fGroup.controls['T9_sIdUbigeo'].setValue(null);
        fGroup.controls['T9_sIdUbigeo'].disable();
        break;

      case 2:
        this.cboUbigeo3 = new Array();
        fGroup.controls['T9_sIdUbigeo'].setValue(null);
        fGroup.controls['T9_sIdUbigeo'].disable();
        break;

      default:
        break;
    }

    if (pushParam !== null && pushParam !== undefined) {
      const editParam =
        mod === 0 ? pushParam.substring(0, pushParam.length - 2) : pushParam;
      const lenParam = editParam.length + 2;

      let fArray = new Array();
      fArray = this.aUbigeo.filter((elemento) => {
        // tslint:disable-next-line: max-line-length
        const filter1 =
          elemento.cEntCod.substring(0, editParam.length) === editParam;
        const filter2 = elemento.cEntCod.length === lenParam;
        return filter1 && filter2;
      });

      if (fArray.length > 0) {
        switch (opc) {
          case 1:
            this.cboUbigeo1 = fArray.sort((a: any, b: any) =>
              a.cEntNamSecond.localeCompare(b.cEntNamSecond)
            );
            fGroup.controls['codUbigeo1'].enable();
            fGroup.controls['codUbigeo1'].setValue(
              mod === 1 ? null : pushParam
            );
            break;
          case 2:
            this.cboUbigeo2 = fArray.sort((a: any, b: any) =>
              a.cEntNamThird.localeCompare(b.cEntNamThird)
            );
            fGroup.controls['codUbigeo2'].enable();
            fGroup.controls['codUbigeo2'].setValue(
              mod === 1 ? null : pushParam
            );
            break;
          case 3:
            this.cboUbigeo3 = fArray.sort((a: any, b: any) =>
              a.cEntNamFourth.localeCompare(b.cEntNamFourth)
            );
            fGroup.controls['T9_sIdUbigeo'].enable();
            fGroup.controls['T9_sIdUbigeo'].setValue(
              mod === 1 ? null : pushParam
            );
            break;
          default:
            break;
        }
      }
    }
  }

  ChangeCargo(pushParam: any) {

    this.fgNew_org.controls['T12_nIdPuesto'].setValue(null);
    this.fgNew_org.controls['T12_nIdPuesto'].disable();

    this.fgNew_org.controls['T12_nIdEspecialidad'].setValue(null);
    this.fgNew_org.controls['T12_nIdEspecialidad'].disable();

    this.cboPuesto = new Array();
    if (pushParam !== undefined) {

      const nIdCargo = pushParam.nIdTipEle;
      const iPuesto = this.aPuesto.findIndex( x => x.nParam === nIdCargo );
      if (iPuesto > -1) {
        this.aPuesto.filter( x => x.nParam === nIdCargo ).forEach( x => this.cboPuesto.push(x) );
        this.fgNew_org.controls['T12_nIdPuesto'].enable();
      }
    }
  }

  ChangeAFP(pushParam: string) {
    const fGroup = this.fgNew_sp;

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
    const fGroup = this.fgNew_sp;

    if (pushParam !== undefined) {
      if (pushParam.bdisCuspp === true) {
        fGroup.controls['T6_sCuspp'].enable();
        return;
      }
    }

    fGroup.controls['T6_sCuspp'].disable();
    fGroup.controls['T6_sCuspp'].setValue('');
  }

  EnabledBanco(pushParam: any, index: number) {
    const aBanco = this.getNew_banco_fa.controls as Array<any>;
    const fGroup = aBanco[index] as FormGroup;
    const nroCuenta = 'sNroCuenta';
    const idMoneda = 'nIdMoneda';
    const idTipoDoc = 'A_nIdTipoDoc';
    const documento = 'sDocumento';

    fGroup.get(nroCuenta).setValue('');

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

  EnabledBancoDoc(pushParam: any, index: number) {
    const fGroup = this.fgNew_banco;
    const faBanco = fGroup.get('L2_nIdPerLab') as FormArray;
    const aBanco = faBanco.controls as Array<any>;
    const fcBanco = aBanco[index] as FormGroup;
    const fcDocumento = fcBanco.get('sDocumento') as FormControl;

    fcDocumento.setValue('');

    if (pushParam !== undefined) {
      fcDocumento.enable();

      const aNew_tdoc = this.fgNew_doc.controls['A3_nIdTipoDoc'].value;
      const cNew_doc = this.fgNew_doc.controls['T3_sDocumento'].value;

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
    const fGroup = this.fgNew_rem;

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

    this.fgNew_org.controls['T12_nIdArea'].setValue(null);
    this.fgNew_org.controls['T12_nIdArea'].disable();

    this.cboArea = new Array();
    if (pushParam !== undefined) {
      this.fgNew_org.controls['T12_nIdArea'].enable();
      this.aArea.filter( x => x.nDadTipEle === pushParam.nIdTipEle ).forEach( x => {
        this.cboArea.push(x);
      });
    }
  }

  ChangePuesto(pushParam: any) {

    this.fgNew_org.controls['T12_nIdEspecialidad'].setValue(null);
    this.fgNew_org.controls['T12_nIdEspecialidad'].disable();

    this.cboEspecialidad = new Array();
    if (pushParam !== undefined) {

      const nIdPuesto = pushParam.nIdTipEle;
      const iPuesto = this.aEspecialidad.findIndex( x => x.nDadTipEle === nIdPuesto );
      if (iPuesto > -1) {
        this.aEspecialidad.filter( x => x.nDadTipEle === nIdPuesto ).forEach( x => this.cboEspecialidad.push(x) );
        this.fgNew_org.controls['T12_nIdEspecialidad'].enable();
      }
    }
  }

  //#endregion

  //#region Concepto

  dropConcepto(event: CdkDragDrop<any>) {
    const fRem = this.fgNew_rem.controls.L1_nIdPlRem as FormArray;
    const ds = this.dsNew_rem;
    const t = this.tNew_rem;

    moveItemInArray(ds, event.previousIndex, event.currentIndex);

    t.renderRows();
    fRem.markAsDirty();
  }

  editConcepto(item: any) {
    const fg = this.fgNew_select;
    fg.controls['nIdConcepto'].setValue(item.nIdConcepto);
    fg.controls['dsc'].setValue(item.dsc_);
    fg.controls['nImporte'].setValue(item.nImporte);
  }

  removeConcepto(item: any) {
    const fg = this.fgNew_rem;

    const faSalario = fg.controls.L1_nIdPlRem as FormArray;

    Object.values(faSalario.controls).forEach(
      (gcontrol: FormGroup, icontrol: number) => {
        if (gcontrol.controls['nIdConcepto'].value === item.nIdConcepto) {
          faSalario.removeAt(icontrol);
        }
      }
    );

    this.dsNew_rem = faSalario.value;
    const iArray = this.aConceptos.findIndex(
      (x) => x.nIdConcepto === item.nIdConcepto
    );
    if (iArray > -1) {
      this.aConceptos[iArray].dis = false;
    }
  }

  selectConcepto(item: any, modo: number) {
    const fg = this.fgNew_select;
    fg.controls['nImporte'].setValue(null);
    if (modo > 0) {
      fg.controls['nIdConcepto'].setValue(item.nIdConcepto);
      fg.controls['dsc'].setValue(item.dsc);
    } else {
      fg.reset();
    }
  }

  addConcepto() {
    const fg = this.fgNew_rem;
    const id = this.getNew_select.nIdConcepto.value;
    const dsc = this.getNew_select.dsc.value;
    const imp = this.getNew_select.nImporte.value;

    const faSalario = fg.controls.L1_nIdPlRem as FormArray;

    Object.values(faSalario.controls).forEach(
      (gcontrol: FormGroup, icontrol: number) => {
        if (gcontrol.controls['nIdConcepto'].value === id) {
          faSalario.removeAt(icontrol);
        }
      }
    );

    faSalario.push(
      this.fb.group({
        nIdConcepto: ['', Validators.required],
        dsc_: ['', Validators.required],
        nImporte: [0, Validators.required],
      })
    );

    const lSalario = faSalario.controls[
      faSalario.controls.length - 1
    ] as FormGroup;
    lSalario.patchValue({
      nIdConcepto: id,
      dsc_: dsc,
      nImporte: imp,
    });

    this.dsNew_rem = faSalario.value;

    const iArray = this.aConceptos.findIndex((x) => x.nIdConcepto === id);
    if (iArray > -1) {
      this.aConceptos[iArray].dis = true;
    }

    this.selectConcepto('', 0);
  }

  //#endregion

  //#region Load

  async submitNew() {
    this.pbNew = true;

    this.aParam = [];
    this.aParaml = [];

    let sText = '';
    sText = this.fgNew_rem.invalid ? 'remuneración' : sText;
    sText = this.fgNew_plab.invalid ? 'periodo laboral' : sText;
    sText = this.fgNew_banco.invalid ? 'banco' : sText;
    sText = this.fgNew_sp.invalid ? 'sistema pensionario' : sText;
    sText = this.fgNew_plla.invalid ? 'planilla' : sText;
    sText = this.fgNew_org.invalid ? 'organización' : sText;
    sText = this.fgNew_dom.invalid ? 'domicilio' : sText;
    sText = this.fgNew_doc.invalid ? 'documento de identidad' : sText;
    sText = this.fgNew_info.invalid ? 'información' : sText;

    if (sText.length > 0) {
      Swal.fire(
        'No se puede guardar',
        'Información incorrecta o incompleta en la sección ' + sText,
        'error'
      );

      this.tabNew = sText === 'remuneración' ? 1 : 0;

      switch (sText) {
        case 'información':
          this.epNew_info.open();
          break;
        case 'documento de identidad':
          this.epNew_doc.open();
          break;
        case 'domicilio':
          this.epNew_dom.open();
          break;
        case 'planilla':
          this.epNew_plla.open();
          break;
        case 'organización':
          this.epNew_org.open();
          break;
        case 'sistema pensionario':
          this.epNew_sp.open();
          break;
        case 'banco':
          this.epNew_banco.open();
          break;
        case 'periodo laboral':
          this.epNew_plab.open();
          break;
      }

      this.pbNew = false;
      return;
    } else {
      // Usuario y Fecha con hora
      const user = localStorage.getItem('currentUser');
      const uid = JSON.parse(window.atob(user.split('.')[1])).uid;
      this.aParam.push('T0¡sRegUser!' + uid);
      this.aParam.push('T0¡dtReg!GETDATE()');

      // Empresa
      const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
      this.aParam.push('T1¡nIdEmp!' + nIdEmp);

      this.fnGetParam(this.fgNew_info.controls);
      this.aParam.push('T1¡bDiscapacidad!0');

      this.fnGetParam(this.fgNew_doc.controls);

      this.fnGetParam(this.fgNew_dom.controls);
      this.aParam.push('T9¡sDesc!Documento de identidad');
      this.aParam.push('T10¡nIdArea!600');
      this.aParam.push('T10¡bEstado!1');
      this.aParam.push('T10¡bPrincipal!1');

      this.fnGetParam(this.fgNew_plab.controls);
      this.fnGetParam(this.fgNew_plla.controls);
      this.fnGetParam(this.fgNew_sp.controls);
      this.fnGetParam(this.fgNew_banco.controls);
      this.fnGetParam(this.fgNew_org.controls);

      const dFechIni = moment(
        new Date(this.fgNew_plab.get('T0_dFechIni').value)
      ).format('MM/DD/YYYY');

      this.aParaml
        .filter(
          (pl: string) => pl.substr(0, 2) === 'L2' && !pl.includes('nIdPerLab')
        )
        .forEach((pl) => {
          const index = this.aParaml.indexOf(pl);
          this.aParaml[index] =
            this.aParaml[index] +
            '-L2¡dFechIni!' +
            dFechIni +
            '-L2¡sRegUser!' +
            uid +
            '-L2¡dtReg!GETDATE()';
        });

      this.fnGetParam(this.fgNew_rem.controls);

      const aResult = new Array();
      const result = await this.service._crudSP(1, this.aParam, this.url);

      Object.keys(result).forEach((valor) => {
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
            ftext = 'N° de Ficha generado : ' + e.split('!')[1];
            ftype = 'success';
          }

          codParaml = '';
          this.aParaml
            .filter(
              (pl: string) =>
                pl.substr(pl.length - 1) === '!' && pl.includes(e.split('!')[0])
            )
            .forEach((pl) => {
              const index = this.aParaml.indexOf(pl);
              this.aParaml[index] = this.aParaml[index] + e.split('!')[1];
              codParaml = this.aParaml[index].substring(0, pl.indexOf('¡'));
            });

          if (codParaml !== '') {
            const resultl = await this.service._crudSP(
              2,
              this.aParaml.filter((pl: string) => pl.includes(codParaml)),
              this.url
            );
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

      Swal.fire(ftitle, ftext, ftype !== 'error' ? 'success' : 'error');

      this.pbNew = false;

      if (ftype !== 'error') {
        const oReturn = new Object();

        oReturn['modal'] = 'new';
        oReturn['value'] = 'loadAgain';

        this.activeModal.close(oReturn);
      }
      return;
    }
  }

  //#endregion

}
