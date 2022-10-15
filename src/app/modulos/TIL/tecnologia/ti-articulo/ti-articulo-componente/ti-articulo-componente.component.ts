import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { Question } from 'src/app/modulos/AAHelpers';
import Swal from 'sweetalert2';
import { ComponenteTI } from '../../api/models/articuloDTO';
import { SelecItem } from '../../api/models/tipoElementoDTO';

@Component({
  selector: 'app-ti-articulo-componente',
  templateUrl: './ti-articulo-componente.component.html',
  styleUrls: ['./ti-articulo-componente.component.css']
})
export class TiArticuloComponenteComponent implements OnInit {
  @Output() sendAux: EventEmitter<number> = new EventEmitter<number>();
  @Input() caracteristicas: SelecItem[];
  @Input() componentes: ComponenteTI[];
  @Input() nIdSubFamilia: number;
  @Input() sCodBarra: string;
  @Input() editar: boolean;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  filtrados: SelecItem[];
  removable: boolean = true;
  IdSubFamiliaAux: number;
  
  
  form: FormGroup;

  constructor(
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      sCodBarra: [{ value: '', disabled: true }],
      nIdCaracteristica: [{ value: null, disabled: true }, Validators.required],
      sDescripcion: [{ value: null, disabled: true }, Validators.required]
    });
  }

  ngOnInit(): void {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.nIdSubFamilia && this.nIdSubFamilia) {
      this.filtrarLista();
      this.form.get('sCodBarra').setValue(this.sCodBarra);
      if (!this.editar) {
        if (this.componentes.length > 0 && this.IdSubFamiliaAux != this.nIdSubFamilia) {
          const pregunta = 'Se eliminarán los componentes ingresados. ¿Desea Continuar?';
          Swal.fire(new Question(pregunta) as unknown).then((result) => {
            if (result.isConfirmed) {
              this.IdSubFamiliaAux = this.nIdSubFamilia;
              this.componentes = [];
            } else {
              this.sendAux.emit(this.IdSubFamiliaAux);
            }
          });
        } else {
          this.IdSubFamiliaAux = this.nIdSubFamilia;
        }
      }
      else {
        this.IdSubFamiliaAux = this.nIdSubFamilia;
      }
    }
  }

  get sCodBarraField(): FormControl { return this.form.get('sCodBarra') as FormControl }
  get nIdCaracteristicaField(): FormControl { return this.form.get('nIdCaracteristica') as FormControl }
  get sDescripcionField(): FormControl { return this.form.get('sDescripcion') as FormControl }

  get caracteristicaError(): string {
    return this.nIdCaracteristicaField.hasError('required') && this.nIdCaracteristicaField.touched ? 'Seleccione una característica' : null
  }
  get sDescripcionError(): string {
    return this.sDescripcionField.hasError('required') && this.sDescripcionField.touched ? 'Ingrese una descripción' : null
  }

  add(): void {
    if (this.form.invalid) {
      return Object.values(this.form.controls).forEach(control => { control.markAllAsTouched() })
    }
    const caracteristica = this.filtrados.find(item => item.nId == this.nIdCaracteristicaField.value);
    const descripcion = this.sDescripcionField.value.trim();
    this.componentes.push({
      nIdComponente: caracteristica.nId,
      sDescripcion: descripcion,
      sName: `${caracteristica.sDescripcion}: ${descripcion}`
    });
    
    // Limpiar Errores
    this.filtrarLista();
  }

  remove(row: ComponenteTI): void {
    const index = this.componentes.indexOf(row);
    if (index >= 0) {
      this.componentes.splice(index, 1);
      this.filtrarLista();
    }
  }

  filtrarLista(): void {
    this.form.reset();
    const codigos = this.componentes?.map(item => item.nIdComponente);
    this.filtrados = this.caracteristicas.filter(item => item.nParam == this.nIdSubFamilia && !codigos?.includes(item.nId));
  }
}
