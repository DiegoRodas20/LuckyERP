import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs'; 
import { Cargo } from '../../../../centroCosto/Models/centroCostos/ICentroCosto';
import { ParametroService } from '../../../parametro.service';
import { startWith, map } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { asistenciapAnimations } from '../../../../../comercial/Asistencia/asistenciap/asistenciap.animations';


interface Estado {
  value: any;
  viewValue: string;
}
@Component({
  selector: 'app-dialog-tope-cargo',
  templateUrl: './dialog-tope-cargo.component.html',
  styleUrls: ['./dialog-tope-cargo.component.css'],
  animations: [asistenciapAnimations]
})
export class DialogTopeCargoComponent implements OnInit {

  form: FormGroup;
  listaCargo: any;
  filteredCargo: Observable<Cargo[]>;
  existCargo: boolean;
  abLista = [];
  tsLista = 'inactive'; 
  fbLista = [
    {icon: 'save', tool: 'Crear'}
  ];
  listEstados: Estado[] = [
    {value: 1, viewValue: 'Aplica'},
    {value: 0, viewValue: 'No aplica'},
  ];
  idPais: any;
  constructor(private fb: FormBuilder,
              private cdRef: ChangeDetectorRef,
              public dialogRef: MatDialogRef<DialogTopeCargoComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, private parametroService: ParametroService, private spinner: NgxSpinnerService) { 
                this.crearFormulario();
              }

  async ngOnInit() {
      // this.spinner.show();
      this.idPais = localStorage.getItem('Pais');
      this.listaCargo = await this.parametroService.obtenerParametrosCRUD(3, `${this.idPais}|`);
      this.quitarListaExistente();
      this.filteredCargo = this.form.controls['cargo'].valueChanges.pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.sDescripcion ),
        map(sDescripcion => sDescripcion ? this._filterCargo(sDescripcion) : this.listaCargo.slice() )
        );
      // this.spinner.hide();
      // this.cdRef.detectChanges();
  }

  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }

  quitarListaExistente() {
    this.listaCargo.forEach((resp) => {
      const obj = this.data.filter(item => item.sCod === resp.sCodPartida );
      if( obj.length > 0 ) {
        this.listaCargo = this.listaCargo.filter(item => item.sCodPartida !== obj[0].sCod );
      }
    });
   // console.log('Lista Terminada', this.listaCargo);
  }

  private _filterCargo(descripcion: string) {
    const filterValue = descripcion.toLocaleLowerCase();
    return this.listaCargo.filter(option => option.sDescripcion.toLocaleLowerCase().indexOf(filterValue) === 0 );
  }

  crearFormulario() {
    this.form = this.fb.group({
      'cargo': [, Validators.required],
      'codigo': [ , Validators.required],
      'mensual': [, [Validators.required, Validators.min(0)]],
      'diario': [, [Validators.required, Validators.min(0)]],
      'aplica': [1, Validators.required],
      'id': [ , Validators.required],
    });
  }

  async guardarCambios() {
    if(this.form.invalid){
      await Swal.fire({
        icon: 'warning',
        title: 'Hay un error en los campos, por favor revise sus campos',
        showConfirmButton: false,
        timer: 1500
      });
      return Object.values(this.form.controls).forEach(control => {
        control.markAllAsTouched();
      });
    }
    const diario = this.form.get('diario').value;
    const mensual = this.form.get('mensual').value;
   // console.log('d',diario,'m',mensual);
    if(diario > mensual){
      await Swal.fire({
        icon: 'warning',
        title: 'El monto del tope diario no puede ser mayor al mensual',
        showConfirmButton: false,
        timer: 1500
      });
      return;
    }
    // console.log('que fue');
    this.dialogRef.close(this.form);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  save() {
  }

  limpiarCargo() {
    this.form.controls.id.setValue('');
    this.form.controls.codigo.setValue('');
  }

  get montoDiario() {
    return this.form.get('diario').invalid && this.form.get('diario').touched;
  }

  get montoMensual() {
    return this.form.get('mensual').invalid && this.form.get('mensual').touched;
  }

  get cargoNotFound() {
    if ( this.form.get('cargo').touched ) {
      const name = this.form.get('cargo').value;
      const listaTemp = this.listaCargo.filter(option => option.sDescripcion === name);
      if ( listaTemp.length === 0 ) {
        this.limpiarCargo();
        this.existCargo = true;
        return true;
      } else {
        this.form.controls.id.setValue(listaTemp[0].nIdPartida);
        this.form.controls.codigo.setValue(listaTemp[0].sCodPartida);
        this.existCargo = true;
        return false;
      }
    }
    return false;
  }

}
