import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { CaracteristicaArticuloTIDTO } from '../../../api/models/elementoTIDTO';
import { SubFamiliaCaracteristicaService } from '../../../api/services/sub-familia-caracteristica.service';

export interface inputDialog_SubFamiliaTI {
  caracteristica: CaracteristicaArticuloTIDTO,
  idSubFamilia: number
}

@Component({
  selector: 'app-ti-dialog-sub-famili-caracteristica',
  templateUrl: './ti-dialog-sub-famili-caracteristica.component.html',
  styleUrls: ['./ti-dialog-sub-famili-caracteristica.component.css']
})
export class TiDialogSubFamiliCaracteristicaComponent implements OnInit {

  formCaracteristica: FormGroup;
  inputDialog: inputDialog_SubFamiliaTI;

  lEstado = [
    { estado: true, sDescripcion: 'Activo' },
    { estado: false, sDescripcion: 'Inactivo' },
  ]

  sTitulo = '';

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: inputDialog_SubFamiliaTI,
    public dialogRef: MatDialogRef<TiDialogSubFamiliCaracteristicaComponent>,
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
    if (this.inputDialog.caracteristica) {

      this.formCaracteristica.controls.txtNombre.setValue(this.inputDialog.caracteristica.nombre);
      this.formCaracteristica.controls.cboEstado.setValue(this.inputDialog.caracteristica.bEstado);
      this.sTitulo = 'Modificar característica'
    } else {
      //Para crear
      this.formCaracteristica.controls.cboEstado.setValue(true);
      this.formCaracteristica.controls.cboEstado.disable();
      this.sTitulo = 'Agregar característica'
    }
  }

  fnGuardar() {
    if (this.inputDialog.caracteristica) {
      this.Update();
    } else {
      //Para crear
      this.Save();
    }
  }


  async Save() {
    if (this.formCaracteristica.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Revise los datos ingresados.',
      });
      this.formCaracteristica.markAllAsTouched();
      return;
    }

    let datos = this.formCaracteristica.value;

    let model: CaracteristicaArticuloTIDTO = {
      bEstado: true,
      sEstado: '',
      elementoIdDad: 0,
      idSubFamilia: this.inputDialog.idSubFamilia,
      elementoId: 0,
      codigo: '',
      nombre: datos.txtNombre,
      inicial: '',
      descripcion: ''
    }

    try {
      this.spinner.show();

      let result = await this._subFamiliaCaracteristicaService.InsertCaracteristica(model);
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
    if (this.formCaracteristica.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Revise los datos ingresados.',
      });
      this.formCaracteristica.markAllAsTouched();
      return;
    }

    let datos = this.formCaracteristica.value;

    let model: CaracteristicaArticuloTIDTO = {
      bEstado: datos.cboEstado,
      sEstado: '',
      elementoIdDad: 0,
      idSubFamilia: this.inputDialog.idSubFamilia,
      elementoId: this.inputDialog.caracteristica.elementoId,
      codigo: '',
      nombre: datos.txtNombre,
      inicial: '',
      descripcion: ''
    }

    try {
      this.spinner.show();
      let result = await this._subFamiliaCaracteristicaService.UpdateCaracteristica(model);
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
    this.formCaracteristica = this.formBuilder.group({
      txtNombre: ['', [Validators.required, Validators.maxLength(150)]],
      cboEstado: [''],
    })
  }

  //#region Errores Controles
  get txtNombreError(): string {
    return this.formCaracteristica.controls.txtNombre.hasError('required') ? 'Obligatorio' :
      this.formCaracteristica.controls.txtNombre.hasError('maxlength') ? 'Máximo 150 caractéres' : null;
  }

  get cboEstadoError(): string {
    return this.formCaracteristica.controls.cboEstado.hasError('required') ? 'Obligatorio' : null;
  }
  //#endregion
}
