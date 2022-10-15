import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { asistenciapAnimations } from '../../../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import { AlmacenesService } from '../../../almacenes.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agregar-unidad-medida',
  templateUrl: './agregar-unidad-medida.component.html',
  styleUrls: ['./agregar-unidad-medida.component.css'],
  animations: [asistenciapAnimations]
})
export class AgregarUnidadMedidaComponent implements OnInit {

  form: FormGroup;
  abLista = [];
  tsLista = 'inactive'; 
  isEditar: boolean = true;
  fbLista = [
    {icon: 'save', tool: 'Crear'}
  ];
  message: string = '.Obligatorio';
  constructor(
    private almacenService: AlmacenesService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AgregarUnidadMedidaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.isEditar = false;
    //console.log(this.data);
    if(this.data.tipo === 1) {
      this.isEditar = true;
    }
    this.crearFormulario();
    if(this.data.tipo === 1) {
      this.inicializarFormulario(this.data.data);
    }

    this.onToggleFab(1, -1);
  }

  crearFormulario() {
    this.form = this.fb.group({
      'codigo': [{value: '', disabled: this.isEditar} , [Validators.required,Validators.maxLength(3),this.caracterValidator]],
      'descripcion': [ ,[Validators.required,this.caracterValidator]],
      'codigoInterno': [ ,[Validators.required,Validators.maxLength(3),this.caracterValidator]],
      'descripcionInterna': [, [Validators.required,this.caracterValidator]]
    });
  }

  inicializarFormulario(data) {
    this.form.reset({
      "codigo": data.sCodUndMedida,
      "descripcion": data.sDescripcion,
      "codigoInterno": data.nCodInter,
      "descripcionInterna": data.sDescripInter
    })
  }

  async agregarUnidaMedida() {
    if (this.form.invalid) {
      return Object.values(this.form.controls).forEach(control => {
        control.markAllAsTouched();
      })
    }
    const codigo =               this.form.get('codigo').value ;
    const descripcion =          this.form.get('descripcion').value ;
    const codigoInterno =        this.form.get('codigoInterno').value ;
    const descripcionInterno =   this.form.get('descripcionInterna').value ;
    const validarCodigo: any = await this.almacenService.listarInformacionUnidadMedida(2, `${codigo.toUpperCase()}|`);
    const validarDescripcion: any = await this.almacenService.listarInformacionUnidadMedida(3, `${descripcion}|`);
    if(this.data.data.sCodUndMedida != codigo) {
      if(validarCodigo.resp >= 1) {
        return Swal.fire({
          title: 'El código ingresado ya se encuentra registrado',
          icon: 'warning',
          timer: 2000
        })  
      }
    }
    if(this.data.data.sDescripcion != descripcion) {
      if(validarDescripcion.resp >= 1) {
        return Swal.fire({
          title: 'La descripción ingresada ya se encuentra registrada',
          icon: 'warning',
          timer: 2000
        })  
      }
    }
    
    

    if(this.data.tipo === 0) {
      // Agregamos
      let body = {
        'nCodInter':       codigoInterno.toUpperCase(),
        'nIdUndMedida':     0,
        'sCodUndMedida':    codigo.toUpperCase(),
        'sDescripInter':    descripcionInterno,
        'sDescripcion':     descripcion
      }
      this.dialogRef.close({
        tipo: 0,
        body: body
      });
    } else if(this.data.tipo === 1) {
      // Actualizamos
      let body = {
        'nCodInter':       codigoInterno.toUpperCase(),
        'nIdUndMedida':     0,
        'sCodUndMedida':    codigo.toUpperCase(),
        'sDescripInter':    descripcionInterno,
        'sDescripcion':     descripcion
      }
      this.dialogRef.close({
        tipo: 0,
        body: body
      });
    }
  }

  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }

  salir() {
    this.dialogRef.close();
  }

  get codigoValidator() {
    return this.form.get('codigo').invalid && this.form.get('codigo').touched;
  }

  get descripcionValidator() {
    return this.form.get('descripcion').invalid && this.form.get('descripcion').touched;
  }

  get codigoInternoValidator() {
    return this.form.get('codigoInterno').invalid && this.form.get('codigoInterno').touched;
  }

  get descripcionInternoValidator() {
    return this.form.get('descripcionInterna').invalid && this.form.get('descripcionInterna').touched;
  }

  //  #region FormControls */
  get codigoField() {
    return this.form.get('codigo') as FormControl;
  }

  get descripcionField() {
    return this.form.get('descripcion') as FormControl;
  }

  get codigoInternoField() {
    return this.form.get('codigoInterno') as FormControl;
  }

  get descripcionInternoField() {
    return this.form.get('descripcionInterna') as FormControl;
  }

  /* #region Mensajes de Error */
  get codigoError() {
    return this.codigoField.hasError('required') && this.codigoField.touched ? this.message : this.codigoField.hasError('caracterValidator') ? this.codigoField.errors.caracterValidator : null;
  }

  get descripcionError() {
    return this.descripcionField.hasError('required') && this.descripcionField.touched ? this.message : this.descripcionField.hasError('caracterValidator') ? this.descripcionField.errors.caracterValidator : null;
  }

  get codigoInternoError() {
    return this.codigoInternoField.hasError('required') && this.codigoInternoField.touched ? this.message : this.codigoInternoField.hasError('caracterValidator') ? this.codigoInternoField.errors.caracterValidator : null;
  }

  get descripcionInternoError() {
    return this.descripcionInternoField.hasError('required') && this.descripcionInternoField.touched ? this.message : this.descripcionInternoField.hasError('caracterValidator') ? this.descripcionInternoField.errors.caracterValidator : null;
  }

  caracterValidator(control: AbstractControl): ValidationErrors | null {
    const caracteres = /(\/|\|)$/i;
    const valid = caracteres.exec(control.value);
    return valid ? { caracterValidator: 'El texto no debe contener: "/" ni "|"' } : null;
  }

}
