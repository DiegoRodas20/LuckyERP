import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from '../../../../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import { ParametroService } from '../../../../parametro.service';

interface Estado {
  value: any;
  viewValue: string;
}
@Component({
  selector: 'app-dialog-tope-cargo-edit',
  templateUrl: './dialog-tope-cargo-edit.component.html',
  styleUrls: ['./dialog-tope-cargo-edit.component.css'],
  animations: [asistenciapAnimations]
})
export class DialogTopeCargoEditComponent implements OnInit {
  form: FormGroup;
  listEstados: Estado[] = [
    {value: 1, viewValue: 'Aplica'},
    {value: 0, viewValue: 'No aplica'},
  ];
  abLista = [];
  tsLista = 'inactive'; 
  fbLista = [
    {icon: 'save', tool: 'Crear'}
  ];
  constructor(private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogTopeCargoEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private parametroService: ParametroService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.crearFormulario();
    this.inicializarFormulario();
    console.log('DATA', this.data);
  }

  crearFormulario() {
    this.form = this.fb.group({
      cargo: [{disabled: true}],
      codigo: [{disabled: true}],
      mensual: [],
      diario: [],
      aplica: [],
      id: []
    });
  }

  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }

  inicializarFormulario() {
    this.form.reset({
      'cargo': this.data.sDescripcion,
      'codigo': this.data.sCode,
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
