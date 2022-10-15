import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { Question } from '../../../models/constantes';
import { GRUPO_DESTINO_DETALLE } from '../../../models/grupoDestino-detalle.model';

@Component({
  templateUrl: './dialog-select-punto.component.html',
  styleUrls: ['./dialog-select-punto.component.css']
})
export class DialogSelectPuntoComponent implements OnInit {
  nPuntoField = new FormControl('', [Validators.required]);
  grupoDestino: GRUPO_DESTINO_DETALLE;

  constructor(
    public dialogRef: MatDialogRef<DialogSelectPuntoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { puntoList: GRUPO_DESTINO_DETALLE[], message: string },
  ) { }

  ngOnInit(): void {
    this.nPuntoField.valueChanges.subscribe(value => {
      this.grupoDestino = this.data.puntoList.find(x => x.nPunto == value);
    });
  }

  get nPuntoError(): string {
    return this.nPuntoField.hasError('required') ? 'Seleccione punto de traslado' : null;
  }

  fnGuardar(): void {
    if (this.nPuntoField.invalid) {
      return this.nPuntoField.markAllAsTouched();
    }
    const parameters = `${this.grupoDestino.nPunto}|${this.grupoDestino.sNroTransporte}`
    if (!this.data.message?.trim()) {
      this.dialogRef.close(parameters);
    } else {
      const pregunta = `${this.data.message}\n¿Desea continuar?`;
      Swal.fire(new Question(pregunta) as unknown).then((result) => {
        if (result.isConfirmed) {
          this.dialogRef.close(parameters);
        }
      });
    }
  }
}
