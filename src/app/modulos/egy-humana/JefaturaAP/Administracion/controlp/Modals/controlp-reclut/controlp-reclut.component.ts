import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatStepper } from '@angular/material/stepper';
import { ControlpService } from '../../../../Services/controlp.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { DatosPostulante } from '../../../../Model/Icontrolp';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { ValidadoresService } from '../../../../Validators/validadores.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-controlp-reclut',
  templateUrl: './controlp-reclut.component.html',
  styleUrls: [
    './controlp-reclut.component.css',
    './controlp-reclut.component.scss',
  ],
  animations: [adminpAnimations],
  providers: [
    { provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true } },
  ],
})
export class ControlpReclutComponent implements OnInit {
  @Input() fromParent;

  //#region Variables

  @ViewChild('stepper') private myStepper: MatStepper;

  // Service GET && POST
  url: string;
  aParam = [];
  aParaml = [];
  matcher = new MyErrorStateMatcher();
  documentoPorDefecto = null;

  fbReclut = [
    { icon: 'save', tool: 'Guardar' },
    { icon: 'close', tool: 'Cerrar' },
  ];
  abReclut = [];
  tsReclut = 'inactive';

  // FormGroup
  fgReclut_postu: FormGroup;
  fgReclut_rq: FormGroup;
  fgReclut_rem: FormGroup;

  // Combobox
  cboTipoDoc = new Array();
  cboGenero = new Array();
  cboEstadoCivil = new Array();
  cboUbigeo1 = new Array();
  cboUbigeo2 = new Array();
  cboUbigeo3 = new Array();
  aUbigeo = new Array();
  cboDocPostu = new Array();
  cboPlanilla = new Array();
  cboCargo = new Array();
  cboTipoSP = new Array();
  aAFP = new Array();
  cboAFP = new Array();
  cboTipoSalario = new Array();
  cboDireccion = new Array();
  cboArea = new Array();
  aArea = new Array();
  cboPuesto = new Array();
  aPuesto = new Array();
  cboEspecialidad = new Array();
  aEspecialidad = new Array();

  // Progress Bar + others
  pbReclut: boolean;
  urlDocPostu = '';

  // MatTable
  dcReclut_rem: string[] = ['action', 'dsc', 'nImporte'];
  dsReclut_rem = new Array();

  // FromParent
  nId: number;
  nIdDetEnv: number;
  aResponsable = new Array();

  //#endregion

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private spi: NgxSpinnerService,
    public service: ControlpService,
    @Inject('BASE_URL') baseUrl: string,
    private valid: ValidadoresService
  ) {
    this.url = baseUrl;

    this.new_fgReclut_postu();
    this.new_fgReclut_rq();
    this.new_fgReclut_rem();
  }

  async ngOnInit(): Promise<void> {
    this.spi.show('spi_reclut');

    this.nId = this.fromParent.nId;
    this.nIdDetEnv = this.fromParent.nIdDetEnv;
    this.aResponsable = this.fromParent.aSupervisor;

    // Load
    this.loadCombo();

    const param = [];
    param.push('1¡nIdEnv!' + this.nId);
    await this.service._loadSP(9, param, this.url).then((value: DatosPostulante[]) => {
      this.loadPostulante(value[0]);
    });

    this.onToggleFab(1, 1);
    this.spi.hide('spi_reclut');
  }

  //#region General

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = stat === -1 ? (this.abReclut.length > 0 ? 0 : 1) : stat;
        this.tsReclut = stat === 0 ? 'inactive' : 'active';
        this.abReclut = stat === 0 ? [] : this.fbReclut;
        break;
    }
  }

  clickFab(index: number) {
    switch (index) {
      // Guardar
      case 0:
        this.submitReclut();
        break;

      // Cancelar
      case 1:
        this.closeReclut();
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

  new_fgReclut_postu() {
    this.fgReclut_postu = this.fb.group({
      T1_nPerCod: [0, [Validators.required]],
      A3_nIdTipoDoc: [undefined, [Validators.required, this.valid.noSelect]],
      T3_sDocumento: ['', [Validators.required, Validators.pattern('[0-9]*')]],
      T1_sApePa: ['', [Validators.required, Validators.pattern('[a-zA-Z áéíóúÁÉÍÓÚñÑ]*')]],
      T1_sApeMa: ['', [Validators.required, Validators.pattern('[a-zA-Z áéíóúÁÉÍÓÚñÑ]*')]],
      T1_sPriNom: ['', [Validators.required, Validators.pattern('[a-zA-Z áéíóúÁÉÍÓÚñÑ]*')]],
      T1_sSegNom: ['', [Validators.pattern('[a-zA-Z áéíóúÁÉÍÓÚñÑ]*')]],
      T1_dFechNac: [null, [Validators.required]],
      T1_nIdSexo: [0, [Validators.required, this.valid.noSelect]],
      T1_nIdEstCiv: [0, [Validators.required, this.valid.noSelect]],
      T1_nTelMovil: ['', [Validators.required, Validators.pattern('[0-9]*'), Validators.maxLength(9)]],
      T1_sCorreo: ['', [Validators.required, Validators.email]],
      codUbigeo1: [{ value: '', disabled: false }, [Validators.required, this.valid.noSelect]],
      codUbigeo2: [{ value: '', disabled: false }, [Validators.required, this.valid.noSelect]],
      T9_sIdUbigeo: [{ value: '', disabled: false }, [Validators.required, this.valid.noSelect]],
      T9_sDireccion: ['', [Validators.required]],
      T9_sReferencia: [''],
      T1_nIdNacion: [0]
    });
  }

  new_fgReclut_rq() {
    this.fgReclut_rq = this.fb.group({
      T12_nIdDireccion: [null, [Validators.required]],
      T12_nIdArea: [null, [Validators.required]],
      T12_nIdCargo: [null, [Validators.required]],
      T12_nIdPuesto: [null, [Validators.required]],
      T12_nIdEspecialidad: [null],
      T1_nIdResp: [null, [Validators.required]],
      T4_nIdPlla: [0, [Validators.required, this.valid.noSelect]],
      T0_dFechIni: [null, [Validators.required]],
      sCliente: [null]
    });
  }


  new_fgReclut_rem() {
    this.fgReclut_rem = this.fb.group({
      tipoSisPen: [0, [Validators.required, this.valid.noSelect]],
      A6_nIdRegPen: [{ value: undefined, disabled: true }, [Validators.required, this.valid.noSelect]],
      T6_sCuspp: [{ value: '', disabled: true }, [this.valid.vCuspp, Validators.maxLength(12)]],
      A7_nTipoSalario: [0, [Validators.required, this.valid.noSelect]],
      T7_nMonto: [{ value: 0, disabled: true }, [this.valid.vMonto]],
      L1_nIdPlRem: this.fb.array([])
    }, {
      validator: this.valid.vLineas('L1_nIdPlRem')
    });
  }

  get getReclut_postu() { return this.fgReclut_postu.controls; }
  get getReclut_rq() { return this.fgReclut_rq.controls; }
  get getReclut_rem() { return this.fgReclut_rem.controls; }

  //#endregion

  //#region Combobox

  loadCombo() {
    this.cboGenero = this.fromParent.objGroup.cboGenero;
    this.cboEstadoCivil = this.fromParent.objGroup.cboEstadoCivil;
    this.cboTipoDoc = this.fromParent.objGroup.cboTipoDoc;
    this.aUbigeo = this.fromParent.objGroup.aUbigeo;
    this.cboPlanilla = this.fromParent.objGroup.cboPlanilla;
    this.cboCargo = this.fromParent.objGroup.cboCargo;
    this.cboTipoSP = this.fromParent.objGroup.cboTipoSP;
    this.aAFP = this.fromParent.objGroup.aAFP;
    this.cboTipoSalario = this.fromParent.objGroup.cboTipoSalario;
    this.cboDireccion = this.fromParent.objGroup.cboDireccion;
    this.aArea = this.fromParent.objGroup.aArea;
    this.aPuesto = this.fromParent.objGroup.aPuesto;
    this.aEspecialidad = this.fromParent.objGroup.aEspecialidad;
  }

  EnabledDoc(pushParam: any) {
    const fGroup = this.fgReclut_postu;
    const fcDocumento = fGroup.controls['T3_sDocumento'] as FormControl;

    fcDocumento.setValue('');

    if (pushParam !== undefined) {
      const nLongDoc = pushParam.nLongDoc as number;

      fcDocumento.enable();
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
    const fGroup = this.fgReclut_postu;

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
    }

    if (pushParam !== null && pushParam !== undefined) {
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
            fGroup.controls['codUbigeo1'].setValue(
              mod === 1 ? null : pushParam
            );
            break;
          case 2:
            this.cboUbigeo2 = fArray;
            fGroup.controls['codUbigeo2'].enable();
            fGroup.controls['codUbigeo2'].setValue(
              mod === 1 ? null : pushParam
            );
            break;
          case 3:
            this.cboUbigeo3 = fArray;
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

  async cboGetDocPostu(pushParam: number) {
    const param = [];
    param.push('0¡nPerCod!' + pushParam);

    await this.service._loadSP(7, param, this.url).then((value: any[]) => {
      this.cboDocPostu = value;

      this.documentoPorDefecto = value.find((v) => v.nIdDoc === 956);
      if (
        this.documentoPorDefecto !== null &&
        this.documentoPorDefecto !== undefined
      ) {
        const pdfFrame = document.getElementById(
          'iframe-reclut'
        ) as HTMLIFrameElement;
        pdfFrame.src = this.documentoPorDefecto.cFilRou;
      }
    });
  }

  ChangeDocPostu(item: any) {
    const pdfFrame = document.getElementById(
      'iframe-reclut'
    ) as HTMLIFrameElement;
    pdfFrame.src = '';
    if (item.cFilRou !== undefined) {
      pdfFrame.src = item.cFilRou;
    }
  }

  ChangeAFP(pushParam: string) {
    const fGroup = this.fgReclut_rem;

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
    const fGroup = this.fgReclut_rem;

    if (pushParam !== undefined) {
      if (pushParam.bdisCuspp === true) {
        fGroup.controls['T6_sCuspp'].enable();
        return;
      }
    }

    fGroup.controls['T6_sCuspp'].disable();
    fGroup.controls['T6_sCuspp'].setValue('');
  }

  EnabledMonto(pushParam: any) {
    const fGroup = this.fgReclut_rem;

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

    this.fgReclut_rq.controls['T12_nIdArea'].setValue(null);
    this.fgReclut_rq.controls['T12_nIdArea'].disable();

    this.cboArea = new Array();
    if (pushParam !== undefined) {
      this.fgReclut_rq.controls['T12_nIdArea'].enable();
      this.aArea.filter( x => x.nDadTipEle === pushParam.nIdTipEle ).forEach( x => {
        this.cboArea.push(x);
      });
    }
  }

  ChangeCargo(pushParam: any) {

    this.fgReclut_rq.controls['T12_nIdPuesto'].setValue(null);
    this.fgReclut_rq.controls['T12_nIdPuesto'].disable();

    this.fgReclut_rq.controls['T12_nIdEspecialidad'].setValue(null);
    this.fgReclut_rq.controls['T12_nIdEspecialidad'].disable();

    this.cboPuesto = new Array();
    if (pushParam !== undefined) {

      const nIdCargo = pushParam.nIdTipEle;
      const iPuesto = this.aPuesto.findIndex( x => x.nParam === nIdCargo );
      if (iPuesto > -1) {
        this.aPuesto.filter( x => x.nParam === nIdCargo ).forEach( x => this.cboPuesto.push(x) );
        this.fgReclut_rq.controls['T12_nIdPuesto'].enable();
      }
    }
  }

  ChangePuesto(pushParam: any) {

    this.fgReclut_rq.controls['T12_nIdEspecialidad'].setValue(null);
    this.fgReclut_rq.controls['T12_nIdEspecialidad'].disable();

    this.cboEspecialidad = new Array();
    if (pushParam !== undefined) {

      const nIdPuesto = pushParam.nIdTipEle;
      const iPuesto = this.aEspecialidad.findIndex( x => x.nDadTipEle === nIdPuesto );
      if (iPuesto > -1) {
        this.aEspecialidad.filter( x => x.nDadTipEle === nIdPuesto ).forEach( x => this.cboEspecialidad.push(x) );
        this.fgReclut_rq.controls['T12_nIdEspecialidad'].enable();
      }
    }
  }

  //#endregion

  //#region Load

  async loadPostulante(post: DatosPostulante) {

    this.fgReclut_postu.patchValue({
      T1_nPerCod: post.nPerCod,
      T3_sDocumento: post.cIdeNum,
      T1_sApePa: post.cFirLasNam,
      T1_sApeMa: post.cSecLasNam,
      T1_sPriNom: post.cFirNam,
      T1_sSegNom: post.cSecNam,
      T1_dFechNac: post.dBirDay,
      T1_nIdSexo: post.nGenCod,
      T1_nIdEstCiv: post.nMsCod,
      T1_nTelMovil: post.cPhoneCel,
      T1_sCorreo: post.cEmailMain,
      T9_sDireccion: post.cAddress,
      T9_sReferencia: post.cRef,
      T1_nIdNacion: post.nNatCode
    });

    const aTipoDoc = this.cboTipoDoc as Array<any>;
    const iTipoDoc = aTipoDoc.findIndex(x => x.nIdTipoDoc_ === post.nIdTipoDoc);

    const fcTipoDoc = this.fgReclut_postu.get('A3_nIdTipoDoc') as FormControl;
    fcTipoDoc.setValue(aTipoDoc[iTipoDoc]);

    // ComboBox Departamento
    const codUbigeo1 = post.cAddGeoLoc.substring(0, 5);
    this.ChangeUbigeo(codUbigeo1, 1, 0);

    // ComboBox Provincia
    const codUbigeo2 = post.cAddGeoLoc.substring(0, 7);
    this.ChangeUbigeo(codUbigeo2, 2, 0);

    // ComboBox Distrito
    const codUbigeo3 = post.cAddGeoLoc.substring(0, 9);
    this.ChangeUbigeo(codUbigeo3, 3, 0);

    this.fgReclut_rq.patchValue({
      T1_nIdResp: post.nIdSupervisor,
      T4_nIdPlla: post.nIdPlla,
      T0_dFechIni: post.dFecha,
      sCliente: post.sCliente
    });

    this.loadConceptos();

    // ComboBox Documentos
    await this.cboGetDocPostu(post.nPerCod);

  }

  loadConceptos() {
    // const nIdPlla = this.fgReclut_rq.controls['T4_nIdPlla'].value;
    // const nIdCargo = this.fgReclut_rq.controls['T5_nIdCargo'].value;
    // const codCentroCosto = this.fgReclut_rq.controls['dscCentroCosto'].value;

    const aConceptos = new Array();
    aConceptos.push(
      { nIdConcepto: 1, dsc: 'Sueldo Basico', nImporte: 930 },
      { nIdConcepto: 2, dsc: 'Asignación Familiar', nImporte: 93 }
    );

    const faConcepto = this.fgReclut_rem.controls.L1_nIdPlRem as FormArray;
    faConcepto.controls = [];

    // Reemplazar CONCEPTOS con una consulta SQL , donde se obtenga los conceptos
    // de acuerdo a nIdPlla, nIdCargo, codCentroCosto ( nIdTarifa )

    aConceptos.forEach(x => {

      faConcepto.push(this.fb.group({
        nIdConcepto: [0, Validators.required],
        nImporte: [0, Validators.required],
      }));

      const lconcepto = faConcepto.controls[faConcepto.controls.length - 1] as FormGroup;
      lconcepto.patchValue({
        nIdConcepto: x.nIdConcepto,
        nImporte: x.nImporte
      });

    });

    this.dsReclut_rem = aConceptos;

  }

  async submitReclut() {
    this.pbReclut = true;

    this.aParam = [];
    this.aParaml = [];

    let sText = '';
    let nPage: number;

    const lp3 = this.fgReclut_rem.invalid;
    if (lp3) {
      sText = 'remuneración';
      nPage = 2;
    }

    const lp2 = this.fgReclut_rq.invalid;
    if (lp2) {
      sText = 'requerimiento';
      nPage = 1;
    }

    const lp1 = this.fgReclut_postu.invalid;
    if (lp1) {
      sText = 'postulante';
      nPage = 0;
    }

    if (sText.length > 0) {
      this.myStepper.selectedIndex = nPage;
      document.querySelector('#stepper').scrollTop = 0;

      Swal.fire(
        'No se puede guardar',
        'Información incorrecta o incompleta en la sección ' + sText,
        'error'
      );

      this.pbReclut = false;
      return;
    } else {
      this.fnGetParam(this.fgReclut_postu.controls);
      this.aParam.push('T1¡bDiscapacidad!0');
      this.aParam.push('T9¡sDesc!Documento de identidad');
      this.aParam.push('T10¡nIdArea!600');
      this.aParam.push('T10¡bEstado!1');
      this.aParam.push('T10¡bPrincipal!1');

      this.fnGetParam(this.fgReclut_rq.controls);
      this.fnGetParam(this.fgReclut_rq.controls);

      // Usuario y Fecha con hora
      const user = localStorage.getItem('currentUser');
      const uid = JSON.parse(window.atob(user.split('.')[1])).uid;
      this.aParam.push('T0¡sRegUser!' + uid);
      this.aParam.push('T0¡dtReg!GETDATE()');

      // Empresa
      const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
      this.aParam.push('T1¡nIdEmp!' + nIdEmp);

      const aResult = new Array();
      const result = await this.service._crudSP(1, this.aParam, this.url);

      Object.keys(result).forEach((valor) => {
        aResult.push(result[valor]);
      });

      let ftitle = '';
      let ftext = '';
      let ftype = '';

      let nIdPersonal = 0;

      let codParaml;
      for (const e of aResult) {
        const iResult = aResult.indexOf(e);

        if (e.split('!')[0] !== '00') {
          if (iResult === 0) {
            ftitle = 'Registro satisfactorio';
            ftext = 'N° de Ficha generado : ' + e.split('!')[1];
            ftype = 'success';

            nIdPersonal = e.split('!')[1];
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
            await this.service._crudSP(
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

      if (ftype !== 'error') {
        // Registra el nuevo estado del postulante
        this.aParam.push('T1¡nIdUsuario!' + uid);
        this.aParam.push('T1¡nIdEnv!' + this.nId);
        this.aParam.push('T1¡dFecha!GETDATE()');
        this.aParam.push('T1¡nEstado!2259');

        this.aParam.push('W2¡nIdEnv!' + this.nId);
        this.aParam.push('S2¡nEstado!2259');

        await this.service._crudSP(6, this.aParam, this.url);

        const oReturn = new Object();

        oReturn['modal'] = 'reclut';
        oReturn['value'] = 'loadAgain';
        oReturn['filter'] = nIdPersonal;

        this.activeModal.close(oReturn);
      }

      this.pbReclut = false;
      return;
    }
  }

  async closeReclut() {
    this.pbReclut = true;

    // Eliminar registro anterior y actualizar registro padre
    this.aParam.push('T1¡nIdDetEnv!' + this.nIdDetEnv);

    this.aParam.push('W2¡nIdEnv!' + this.nId);
    this.aParam.push('S2¡nEstado!2188');

    await this.service._crudSP(7, this.aParam, this.url);

    this.pbReclut = false;

    const oReturn = new Object();

    oReturn['modal'] = 'reclut';
    oReturn['value'] = 'addPos';
    oReturn['nIdEnv'] = this.nId;

    this.activeModal.close(oReturn);
  }

  //#endregion
}
