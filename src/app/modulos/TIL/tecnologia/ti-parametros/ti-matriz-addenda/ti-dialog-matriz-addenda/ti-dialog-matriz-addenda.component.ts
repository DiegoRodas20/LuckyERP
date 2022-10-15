import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { DispositivoMatrizDTO } from '../../../api/models/dispositivoMatrizDTO';
import { ElementoTIDTO } from '../../../api/models/elementoTIDTO';
import { SubFamiliaCaracteristicaService } from '../../../api/services/sub-familia-caracteristica.service';

@Component({
  selector: 'app-ti-dialog-matriz-addenda',
  templateUrl: './ti-dialog-matriz-addenda.component.html',
  styleUrls: ['./ti-dialog-matriz-addenda.component.css']
})
export class TiDialogMatrizAddendaComponent implements OnInit {

  lEstado = [
    { estado: true, sDescripcion: 'Activo' },
    { estado: false, sDescripcion: 'Inactivo' },
  ]

  lTipoDispositivo: ElementoTIDTO[] = [];
  sTitulo = '';

  formMatriz: FormGroup

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DispositivoMatrizDTO,
    public dialogRef: MatDialogRef<TiDialogMatrizAddendaComponent>,
    public dialog: MatDialog,
    private _subFamiliaCaracteristicaService: SubFamiliaCaracteristicaService,
  ) {
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

  async fnLLenarForm() {

    this.spinner.show();
    await this.GetAllDispositivo()
    this.spinner.hide();

    //Para modificar
    if (this.data) {

      this.formMatriz.controls.cboTipoDispositivo.setValue(this.data.nIdDispositivo);
      this.formMatriz.controls.cboTipoDispositivo.disable();
      this.formMatriz.controls.cboDispositivoParte.setValue(this.data.nIdDispositivoParte);
      this.formMatriz.controls.cboEstado.setValue(this.data.bEstado);
      this.formMatriz.controls.stOpcional.setValue(this.data.bOpcional);
      this.formMatriz.controls.stDescuento.setValue(this.data.bAplicaDescuento);
      this.sTitulo = 'Modificar Dispositivo Parte'
    } else {
      //Para crear
      this.formMatriz.controls.cboEstado.setValue(true);
      this.formMatriz.controls.cboEstado.disable();
      this.sTitulo = 'Agregar Dispositivo Parte'
    }
  }

  async GetAllDispositivo() {

    let response = await this._subFamiliaCaracteristicaService.GetAllDispositivo()
    this.lTipoDispositivo = response.response.data
  }

  fnGuardar() {
    if (this.data) {
      this.Update();
    } else {
      //Para crear
      this.Save();
    }
  }

  async Update() {
    if (this.formMatriz.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Revise los datos ingresados.',
      });
      this.formMatriz.markAllAsTouched();
      return;
    }

    let datos = this.formMatriz.value;

    if (datos.cboDispositivoParte == datos.cboTipoDispositivo) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'El dispositivo parte y tipo dispositivo no pueden ser iguales.',
      });
      return;
    }

    let model: DispositivoMatrizDTO = {
      nIdDispositivoMatriz: this.data.nIdDispositivoMatriz,
      nIdDispositivo: this.data.nIdDispositivo,
      sDispositivo: '',
      nIdDispositivoParte: datos.cboDispositivoParte,
      sDispositivoParte: '',
      bEstado: datos.cboEstado,
      sEstado: '',
      bOpcional: datos.stOpcional,
      bAplicaDescuento: datos.stDescuento,
      sOpcional: ''
    }

    try {
      this.spinner.show();

      let result = await this._subFamiliaCaracteristicaService.UpdateMatriz(model);
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

  async Save() {
    if (this.formMatriz.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Revise los datos ingresados.',
      });
      this.formMatriz.markAllAsTouched();
      return;
    }

    let datos = this.formMatriz.value;

    if (datos.cboDispositivoParte == datos.cboTipoDispositivo) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'El dispositivo parte y tipo dispositivo no pueden ser iguales.',
      });
      return;
    }

    let model: DispositivoMatrizDTO = {
      nIdDispositivoMatriz: 0,
      nIdDispositivo: datos.cboTipoDispositivo,
      sDispositivo: '',
      nIdDispositivoParte: datos.cboDispositivoParte,
      sDispositivoParte: '',
      bEstado: true,
      sEstado: '',
      bOpcional: datos.stOpcional,
      bAplicaDescuento: datos.stDescuento,
      sOpcional: ''
    }

    try {
      this.spinner.show();

      let result = await this._subFamiliaCaracteristicaService.InsertMatriz(model);
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

  fnInicializarForm() {
    this.formMatriz = this.formBuilder.group({
      cboTipoDispositivo: [null, [Validators.required]],
      cboDispositivoParte: [null, [Validators.required]],
      cboEstado: [''],
      stOpcional: [false],
      stDescuento: [false]
    })
  }

  //#region Errores Controles
  get cboTipoDispositivoError(): string {
    return (this.formMatriz.controls.cboTipoDispositivo.hasError('required') && this.formMatriz.controls.cboTipoDispositivo.touched)
      ? 'Obligatorio' : null;
  }

  get cboDispositivoParteError(): string {
    return (this.formMatriz.controls.cboDispositivoParte.hasError('required') && this.formMatriz.controls.cboDispositivoParte.touched)
      ? 'Obligatorio' : null;
  }

  get cboEstadoError(): string {
    return this.formMatriz.controls.cboEstado.hasError('required') ? 'Obligatorio' : null;
  }
  //#endregion
}
