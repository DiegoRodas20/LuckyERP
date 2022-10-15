import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { CaracteristicaArticuloTIDTO, TipoDispositivoTIDTO } from '../../../api/models/elementoTIDTO';
import { SubFamiliaCaracteristicaService } from '../../../api/services/sub-familia-caracteristica.service';
import { TiDialogSubFamiliCaracteristicaComponent } from '../ti-dialog-sub-famili-caracteristica/ti-dialog-sub-famili-caracteristica.component';

export interface inputDialog_TipoDispTI {
  tipoDispositivo: TipoDispositivoTIDTO,
  idSubFamilia: number
}

@Component({
  selector: 'app-ti-dialog-tipo-dispositivo',
  templateUrl: './ti-dialog-tipo-dispositivo.component.html',
  styleUrls: ['./ti-dialog-tipo-dispositivo.component.css']
})
export class TiDialogTipoDispositivoComponent implements OnInit {

  formTipoDisp: FormGroup;
  inputDialog: inputDialog_TipoDispTI;

  lEstado = [
    { estado: true, sDescripcion: 'Activo' },
    { estado: false, sDescripcion: 'Inactivo' },
  ]

  sTitulo = '';

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: inputDialog_TipoDispTI,
    public dialogRef: MatDialogRef<TiDialogTipoDispositivoComponent>,
    public dialog: MatDialog,
    private _subFamiliaCaracteristicaService: SubFamiliaCaracteristicaService,

  ) {
    //this.fnInicializarForm();
    this.inputDialog = this.data;
  }

  ngOnInit(): void {
    this.fnInicializarForm();
  }

  ngAfterViewInit() {
    //Para que no haya error de ngAfterContentChecked
    setTimeout(() => {
      this.fnLLenarForm();
    });

  }

  fnLLenarForm() {
    //Para modificar
    if (this.inputDialog.tipoDispositivo) {

      this.formTipoDisp.controls.txtNombre.setValue(this.inputDialog.tipoDispositivo.nombre);
      this.formTipoDisp.controls.cboEstado.setValue(this.inputDialog.tipoDispositivo.bEstado);
      this.formTipoDisp.controls.stPartNumber.setValue(this.inputDialog.tipoDispositivo.bPartNumber);

      this.sTitulo = 'Modificar Tipo Dispositivo'
    } else {
      //Para crear
      this.formTipoDisp.controls.cboEstado.setValue(true);
      this.formTipoDisp.controls.cboEstado.disable();
      this.sTitulo = 'Agregar Tipo Dispositivo'
    }
  }

  fnGuardar() {
    if (this.inputDialog.tipoDispositivo) {
      this.Update();
    } else {
      //Para crear
      this.Save();
    }
  }


  async Save() {
    if (this.formTipoDisp.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Revise los datos ingresados.',
      });
      this.formTipoDisp.markAllAsTouched();
      return;
    }

    let datos = this.formTipoDisp.value;

    let model: TipoDispositivoTIDTO = {
      bEstado: true,
      sEstado: '',
      elementoIdDad: 0,
      idSubFamilia: this.inputDialog.idSubFamilia,
      elementoId: 0,
      codigo: '',
      nombre: datos.txtNombre,
      inicial: '',
      descripcion: '',
      bPartNumber: datos.stPartNumber
    }

    try {
      this.spinner.show();

      let result = await this._subFamiliaCaracteristicaService.InsertTipoDispositivo(model);
      this.spinner.hide();

      if (!result.success) {
        let mensaje = result.errors.map(item => {
          return item.message
        })
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: mensaje.join(', '),
        });
        return;
      }
      await Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se inserto el registro',
        showConfirmButton: false,
        timer: 1500
      });

      this.dialogRef.close();
    }
    catch (err) {
      this.spinner.hide();
      console.log(err);
    }
  }

  async Update() {
    if (this.formTipoDisp.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Revise los datos ingresados.',
      });
      this.formTipoDisp.markAllAsTouched();
      return;
    }

    let datos = this.formTipoDisp.value;

    let model: TipoDispositivoTIDTO = {
      bEstado: datos.cboEstado,
      sEstado: '',
      elementoIdDad: 0,
      idSubFamilia: this.inputDialog.idSubFamilia,
      elementoId: this.inputDialog.tipoDispositivo.elementoId,
      codigo: '',
      nombre: datos.txtNombre,
      inicial: '',
      descripcion: '',
      bPartNumber: datos.stPartNumber
    }

    try {
      this.spinner.show();
      let result = await this._subFamiliaCaracteristicaService.UpdateTipoDispositivo(model);
      this.spinner.hide();

      if (!result.success) {
        let mensaje = result.errors.map(item => {
          return item.message
        })
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: mensaje.join(', '),
        });
        return;
      }
      await Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se actualizo el registro',
        showConfirmButton: false,
        timer: 1500
      });
      this.dialogRef.close();

    }
    catch (err) {
      console.log(err);
    }
  }



  fnInicializarForm() {
    this.formTipoDisp = this.formBuilder.group({
      txtNombre: ['', [Validators.required, Validators.maxLength(30)]],
      cboEstado: [''],
      stPartNumber: [false]
    })
  }

  //#region Errores Controles
  get txtNombreError(): string {
    return this.formTipoDisp.controls.txtNombre.hasError('required') ? 'Obligatorio' :
      this.formTipoDisp.controls.txtNombre.hasError('maxlength') ? 'Máximo 30 caractéres' : null;
  }

  get cboEstadoError(): string {
    return this.formTipoDisp.controls.cboEstado.hasError('required') ? 'Obligatorio' : null;
  }
  //#endregion
}
