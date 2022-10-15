import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { ISelectItem } from '../../../models/constantes';
import { TransporteService } from '../../../transporte.service';

@Component({
  selector: 'app-factura-transporte-asignar',
  templateUrl: './factura-transporte-asignar.component.html',
  styleUrls: ['./factura-transporte-asignar.component.css']
})
export class FacturaTransporteAsignarComponent {
  form: FormGroup;
  fsGenerada: string = '';
  isGenerated: boolean = false;
  longFactura: number = 20;
  idUser: number;

  @Output() actualizarOperaciones: EventEmitter<number> = new EventEmitter<number>();

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private transporService: TransporteService,
    public dialogRef: MatDialogRef<FacturaTransporteAsignarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      sTipoEnvio: string, 
      sEmpresa: string, 
      nPrecio: number, 
      nIdEmpresa: number, 
      operMovIds: string,
      proveedores: ISelectItem[] }
  ) {
    this.form = this.fb.group({
      nIdProveedor: ['', [Validators.required]],
      sFactura: ['', [Validators.required]],
      dFechaEmision: [moment(), [Validators.required]]
    });
    const user = localStorage.getItem('currentUser'); //encriptacion del usuario
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
  }

  get nIdProveedorField(): FormControl { return this.form.get('nIdProveedor') as FormControl; }
  get sFacturaField(): FormControl { return this.form.get('sFactura') as FormControl; }
  get dFechaEmisionField(): FormControl { return this.form.get('dFechaEmision') as FormControl; }

  get nIdProveedorError(): string {
    return this.nIdProveedorField.hasError('required') && this.nIdProveedorField.touched ? '.Obligatorio' : null;
  }
  get sFacturaError(): string {
    return this.sFacturaField.hasError('required') ? '.Obligatorio' : null;
  }
  get dFechaEmisionError(): string {
    return this.dFechaEmisionField.hasError('required') ? '.Obligatorio' : null;
  }

  fnGenerar(): void {
    let concatenado = '';
    const controls = Object.values(this.form.controls);
    if (this.form.invalid) {
      return controls.forEach(control => {
        control.markAllAsTouched();
      });
    }
    controls.forEach(
      (control: FormControl, index) => {
        const vFiltro = index > 1 ? moment(control.value).format("YYYY-MM-DD") : control.value;
        concatenado += (controls.length > index + 1 ? `${vFiltro}|` : vFiltro);
      });
    concatenado = `${this.data.sTipoEnvio}|${localStorage.getItem('Pais')}|${this.data.nIdEmpresa}|${this.idUser}|${concatenado}`;
    this.transporService.fnFacturaTransporte(1, 1, concatenado, 1, this.data.operMovIds).subscribe(res => {
      this.spinner.hide();
      if (res.result == 0) {
        Swal.fire({ title: 'Hubo un error en el registro', icon: 'warning', timer: 2000 });
      } else {
        Swal.fire({ title: 'Se ha generado de manera exitosa', icon: 'success', timer: 2000 });
        this.fnClean();
        this.actualizarOperaciones.emit(1);
      }
      this.fsGenerada = res ? res.result : '';
    },
      (error) => {
        this.spinner.hide();
        console.log(error.message);
      });
  }

  fnClean(): void {
    this.isGenerated = true;
    Object.values(this.form.controls).forEach(
      (control: FormControl, index) => {
        control.disable();
      }
    );
  }

  get title(): string { return `Asignar Factura a ${this.data?.sTipoEnvio}` }
}
