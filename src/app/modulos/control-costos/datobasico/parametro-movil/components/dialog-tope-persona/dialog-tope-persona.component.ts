import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CuentasCargoComponent } from '../cuentas-cargo/cuentas-cargo.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { asistenciapAnimations } from '../../../../../comercial/Asistencia/asistenciap/asistenciap.animations';

interface Estado {
  value: any;
  viewValue: string;
}

@Component({
  selector: 'app-dialog-tope-persona',
  templateUrl: './dialog-tope-persona.component.html',
  styleUrls: ['./dialog-tope-persona.component.css'],
  animations: [asistenciapAnimations]
})
export class DialogTopePersonaComponent implements OnInit {
  form: FormGroup;
  abLista = [];
  tsLista = 'inactive'; 
  fbLista = [
    {icon: 'save', tool: 'Crear'}
  ];
  listEstados: Estado[] = [
    {value: 1, viewValue: 'Aplica'},
    {value: 0, viewValue: 'No aplica'},
  ];
  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<CuentasCargoComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.crearFormulario();
    this.inicializarFormulario();
    console.log('DATA', this.data);
  }

  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }

  crearFormulario() {
    this.form = this.fb.group({
      dni: [{disabled: true}],
      nombre: [{disabled: true}],
      mensual: [],
      diario: [],
      aplica: [],
      id: []
    });
  }

  inicializarFormulario() {
    this.form.reset({
      'dni': this.data.dni,
      'nombre': this.data.sDescripcion,
      'mensual': this.data.mensual,
      'diario': this.data.diario,
      'aplica': this.data.bAplica,
      'id': this.data.nId
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  update() {

  }

}
