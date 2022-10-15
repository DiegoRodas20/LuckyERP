import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro-cantidad-articulo',
  templateUrl: './registro-cantidad-articulo.component.html',
  styleUrls: ['./registro-cantidad-articulo.component.css'],
  animations: [asistenciapAnimations]
})
export class RegistroCantidadArticuloComponent implements OnInit {
  abLista = [];
  tsLista = 'inactive';
  isEditar: boolean = true;
  fbLista = [
    { icon: 'save', tool: 'Crear' }
  ];
  cantidadMaxima: number;
  formCantidad: FormGroup;
  titulo: string;
  constructor(private fb: FormBuilder,
    public diaglogRef: MatDialogRef<RegistroCantidadArticuloComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.crearFormulario();
    this.cantidadMaxima = this.data.cantidadMaxima;
    this.titulo = this.data.titulo;
    this.onToggleFab(1, -1)
  }


  crearFormulario() {
    this.formCantidad = this.fb.group({
      'cantidad': [, [Validators.required, Validators.min(0), Validators.pattern(/^-?(?:\d+(?:,\d*)?)$/)]]
    })
  }

  anadirCantidad() {
    if (this.formCantidad.invalid) {
      return Object.values(this.formCantidad.controls).forEach(control => {
        control.markAllAsTouched();
      })
    }
    const cantidadTrasladar = this.formCantidad.get('cantidad').value;
    if (this.cantidadMaxima > 0 && cantidadTrasladar > this.cantidadMaxima) {
      return Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'La cantidad que desea sacar supera a la existente',
      });
    }
    this.diaglogRef.close(cantidadTrasladar);
  }

  salir() {
    this.diaglogRef.close();
  }

  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;

  }

  get cantidadNoValido() {
    return this.formCantidad.get('cantidad').invalid && this.formCantidad.get('cantidad').touched;
  }

}
