import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { nsGestionce } from '../../../../Model/Igestionce';
import { GestionceService } from '../../../../Services/gestionce.service';
import { ValidadoresService } from '../../../../Validators/validadores.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-gestionce-add-param',
  templateUrl: './gestionce-add-param.component.html',
  styleUrls: ['./gestionce-add-param.component.css', './gestionce-add-param.component.scss'],
  animations: [ adminpAnimations ]
})
export class GestionceAddParamComponent implements OnInit {

  @Input() fromParent;

  //#region Variables

  showFooter = false;
  matcher = new MyErrorStateMatcher();

  // Fab
  fbAdd = [
    { icon: 'save', tool: 'Guardar' },
    { icon: 'cancel', tool: 'Cancelar' }
  ];

  fbView = [
    { icon: 'edit', tool: 'Editar' },
    { icon: 'delete', tool: 'Eliminar' }
  ];

  abAdd = [];
  tsAdd = 'inactive';

  // Modal
  modalOpc: number = null;
  nIdParameter: number = null;

  // Array
  aParameter: nsGestionce.IParam[] = [];
  aConcepto: nsGestionce.IConcepto[] = [];
  aGrupo: nsGestionce.IGrupo[] = [];
  aPlanilla: nsGestionce.IPlanilla[] = [];

  // FormGroup
  fgParameter: FormGroup;

  //#endregion

  constructor(public activeModal: NgbActiveModal, private spi: NgxSpinnerService,
              public service: GestionceService, private fb: FormBuilder,
              private valid: ValidadoresService) {
    this.new_fgParameter();
  }

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_add');

    this.nIdParameter = this.fromParent.nIdParameter;
    this.aParameter = this.fromParent.aParameter;
    this.aConcepto = this.fromParent.aConcepto;
    this.aGrupo = this.fromParent.aGrupo;

    await this.fnGetSpreadSheet();

    if (this.nIdParameter === null) {
      this.modalOpc = 0;

      this.fgParameter.controls['nIdPlla'].enable();
      this.fgParameter.controls['nIdGroup'].enable();
      this.fgParameter.controls['nPorcentaje'].enable();
      this.fgParameter.controls['aConcepto'].enable();

    } else {
      this.modalOpc = 1;
      this.ReadParam();
    }

    this.spi.hide('spi_add');

    this.onToggleFab(1);

  }

  //#region General

  onToggleFab(stat: number) {
    stat = ( stat === -1 ) ? ( this.abAdd.length > 0 ) ? 0 : 1 : stat;
    this.tsAdd = ( stat === 0 ) ? 'inactive' : 'active';

    switch (this.modalOpc) {
      // Nuevo
      case 0:
        this.abAdd = ( stat === 0 ) ? [] : this.fbAdd;
        break;

      // Visualizar
      case 1:
        this.abAdd = ( stat === 0 ) ? [] : this.fbView;
        break;
    }
  }

  async clickFab(opc: number) {
    switch (this.modalOpc) {
      // Nuevo
      case 0:

        switch (opc) {
          // Guardar
          case 0:

            if (this.fgParameter.invalid || this.showFooter ) {
              Swal.fire(
                'No se puede guardar',
                'Información incorrecta o incompleta',
                'error'
              );
            } else {
              this.spi.show('spi_param');
              if ( this.nIdParameter === null) {
                await this.CreateParam();
              } else {
                await this.UpdateParam();
              }
              this.spi.hide('spi_param');
            }

            break;

          // Cancelar
          case 1:
            if ( this.nIdParameter === null) {
              this.activeModal.dismiss();
            } else {

              this.ReadParam();

              this.fgParameter.controls['nIdPlla'].disable();
              this.fgParameter.controls['nIdGroup'].disable();
              this.fgParameter.controls['nPorcentaje'].disable();
              this.fgParameter.controls['aConcepto'].disable();

              this.abAdd = [];
              this.delay(250).then(any => {
                this.abAdd = this.fbView;
                this.tsAdd = 'active';
              });

              this.modalOpc = 1;
            }
            break;
        }

        break;

      // Visualizar
      case 1:

        switch (opc) {
          // Editar
          case 0:
            Swal.fire({
              title: '¿ Estas seguro de modificar el registro?',
              text: 'Deberá guardar los cambios para prevalecer la información.',
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#ff4081',
              confirmButtonText: 'Confirmar !',
              allowOutsideClick: false
            }).then((result) => {
              if (result.isConfirmed) {

                this.fgParameter.controls['nPorcentaje'].enable();
                this.fgParameter.controls['aConcepto'].enable();

                this.abAdd = [];
                this.delay(250).then(any => {
                  this.abAdd = this.fbAdd;
                  this.tsAdd = 'active';
                });

                this.modalOpc = 0;
              }
            });
            break;

          // Eliminar
          case 1:
            Swal.fire({
              title: '¿ Estas seguro de eliminar el registro?',
              text: 'Esta acción no se podrá revertir.',
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#ff4081',
              confirmButtonText: 'Confirmar !',
              allowOutsideClick: false
            }).then(async (result) => {
              if (result.isConfirmed) {
                this.spi.show('spi_param');
                await this.DeleteParam();
                this.spi.hide('spi_param');
              }
            });
            break;
        }

        break;
    }
  }

  closeModal() {
    const oReturn = new Object();
    oReturn['modal'] = 'add';
    oReturn['value'] = 'loadAgain';
    this.activeModal.close(oReturn);
  }

  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms)).then();
  }

  //#endregion

  //#region FormGroup

  new_fgParameter() {
    this.fgParameter = this.fb.group({
      nIdPlla: [ { value: null, disabled: true }, [Validators.required, this.valid.noSelect]],
      nIdGroup: [ { value: null, disabled: true }, [Validators.required, this.valid.noSelect]],
      // tslint:disable-next-line: max-line-length
      nPorcentaje: [ { value: null, disabled: true }, [ Validators.required, Validators.pattern('[0-9]*'), Validators.max(100), Validators.min(1) ]],
      aConcepto: [{ value: null, disabled: true }, [Validators.required]]
    });

    this.fgParameter.valueChanges.subscribe(fg => {
      const nIdPlla = fg.nIdPlla;
      const nIdGroup = fg.nIdGroup;

      let index = -1;

      if ( nIdPlla !== null && nIdGroup !== null ) {
        index = this.aParameter.filter(iParameter => {
          return ( this.nIdParameter !== null ) ? iParameter.nIdPCE !== this.nIdParameter : true;
        }).findIndex(iParameter => {
          const a = iParameter.nIdPlla === nIdPlla;
          const b = iParameter.nIdGrupo === nIdGroup;
          return a && b;
        });
      }

      this.showFooter = (index > -1) ? true : false;

    });

  }

  get getParameter() {
    return this.fgParameter.controls;
  }

  //#endregion

  //#region Combobox

  async fnGetSpreadSheet() {
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    await this.service.GetSpreadSheet(nIdEmp).then((response: any) => {
      if (response.status === 200) {
        const aPlanilla = response.body.response.data as nsGestionce.IPlanilla[];
        this.aPlanilla = aPlanilla;
      }
    });
  }

  //#endregion

  //#region CRUD

  async CreateParam() {

    const nIdPlla = this.fgParameter.controls['nIdPlla'].value;
    const nIdGrupo = this.fgParameter.controls['nIdGroup'].value;
    const nPorcentaje = this.fgParameter.controls['nPorcentaje'].value / 100;
    const sConcepto = (this.fgParameter.controls['aConcepto'].value as Array<any>).toString();

    const paramCostoEmpresa: nsGestionce.IParamCostoEmpresa[] = [];
    paramCostoEmpresa.push({
      nIdPCE: null,
      nIdPlla: nIdPlla,
      nIdGrupo: nIdGrupo,
      nPorcentaje: nPorcentaje,
      sFormula: '',
      sConcepto: sConcepto
    });

    const obj = new Object();
    obj['main'] = paramCostoEmpresa;

    await this.service.PostInsertParameter(obj).then((response: any) => {
      if (response?.error !== null) {
        const ftitle = 'Registro satisfactorio';
        const ftext = 'Parametro registrados correctamente!';
        const ftype = 'success';
        Swal.fire(ftitle, ftext, ftype);
        this.closeModal();
      }
    });

  }

  ReadParam() {
    const aParam = this.aParameter.find(iParam => iParam.nIdPCE === this.nIdParameter);

    this.fgParameter.controls['nIdPlla'].setValue(aParam.nIdPlla);
    this.fgParameter.controls['nIdGroup'].setValue(aParam.nIdGrupo);
    this.fgParameter.controls['nPorcentaje'].setValue(aParam.nPorcentaje * 100);

    const aConcepto = aParam.sConcepto.split(',').map(Number);
    this.fgParameter.controls['aConcepto'].setValue(aConcepto);
  }

  async UpdateParam() {

    const fcPlla = this.fgParameter.controls['nIdPlla'] as FormControl;
    const fcGrupo = this.fgParameter.controls['nIdGroup'] as FormControl;
    const fcPorcentaje = this.fgParameter.controls['nPorcentaje'] as FormControl;
    const fcConcepto = this.fgParameter.controls['aConcepto'] as FormControl;

    const paramCostoEmpresa: nsGestionce.IParamCostoEmpresa[] = [];
    paramCostoEmpresa.push({
      nIdPCE: this.nIdParameter,
      nIdPlla: ( fcPlla.dirty ) ? fcPlla.value : null,
      nIdGrupo: ( fcGrupo.dirty ) ? fcGrupo.value : null,
      nPorcentaje: ( fcPorcentaje.dirty ) ? fcPorcentaje.value / 100 : null,
      sFormula: null,
      sConcepto: ( fcConcepto.dirty ) ? (fcConcepto.value as Array<any>).toString() : null
    });

    const obj = new Object();
    obj['main'] = paramCostoEmpresa;

    await this.service.PostUpdateParameter(obj).then((response: any) => {
      if (response?.error !== null) {
        const ftitle = 'Actualización satisfactoria';
        const ftext = 'Parametro actualizado correctamente!';
        const ftype = 'success';
        Swal.fire(ftitle, ftext, ftype);
        this.closeModal();
      }
    });

  }

  async DeleteParam() {

    await this.service.DeleteParameter(this.nIdParameter).then((response: any) => {
      if (response?.status === 200) {
        const ftitle = 'Eliminación satisfactoria';
        const ftext = 'Parametro eliminado correctamente!';
        const ftype = 'success';
        Swal.fire(ftitle, ftext, ftype);
        this.closeModal();
      }
    });

  }

  //#endregion

}
