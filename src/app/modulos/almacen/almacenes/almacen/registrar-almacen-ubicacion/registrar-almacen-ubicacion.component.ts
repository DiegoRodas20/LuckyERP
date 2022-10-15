import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { AlmacenesService } from '../../almacenes.service';
import Swal from 'sweetalert2';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-registrar-almacen-ubicacion',
  templateUrl: './registrar-almacen-ubicacion.component.html',
  styleUrls: ['./registrar-almacen-ubicacion.component.css'],
  animations: [asistenciapAnimations]
})
export class RegistrarAlmacenUbicacionComponent implements OnInit {
  abLista = [];
  tsLista = 'inactive'; 
  isEditar: boolean = true;
  fbLista = [
    {icon: 'save', tool: 'Crear'}
  ];
  form: FormGroup;
  title: string;
  tipo: number;
  isUpdate: number;
  cantidadMaxima: number;
  mensajeValidacion: string;
  codigoAnterior: string;
  breadcrumb: string;
  contieneArticulo: any;
  idUbicacion: any;
  antiguoCodigo: string;
  antiguoNombre: string;
  message: string = '.Obligatorio';
  
  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private almacenService: AlmacenesService,
    public diaglogRef: MatDialogRef<RegistrarAlmacenUbicacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  async ngOnInit() {
    let cantidadArticulo;
    let cantidad = 0;
    this.tipo = this.data.tipo;
    this.breadcrumb = this.data.breadcrumb;
    this.title = this.data.palabra;
    this.isUpdate = this.data.isUpdate;
    this.cantidadMaxima = this.data.cantidadMaxima;
    this.mensajeValidacion = this.data.mensajeValidacion;
    this.codigoAnterior = this.data.codigoAnterior;
    this.idUbicacion = this.data.idUbicacion;
    this.antiguoCodigo = this.data.codigo;
    this.antiguoNombre = this.data.nombre;
    this.crearFormulario();
    this.onToggleFab(1, -1)
    
    
    if(this.data.isUpdate === 1) {
      if(this.idUbicacion !== '') {
        cantidadArticulo = await this.almacenService.validarExistenciaUbicacion(2,`${this.idUbicacion}|`);
        cantidad = cantidadArticulo.cantidad;
      }
      this.inicializarFormulario(this.data,cantidad);
    }
  }

  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }


  crearFormulario() {
    if(this.tipo !== 0)  {
      if(this.tipo === 5) { // Cuando sea pallet
        this.form = this.fb.group({
          'codigo': ['',[Validators.required,Validators.maxLength(this.cantidadMaxima),this.caracterValidator]],
          'nombre': [{value: '', disabled: true},[Validators.required, this.caracterValidator]],
          'peso': [,[Validators.required, Validators.min(1)]],
          'volumen': [,[Validators.required, Validators.min(1)]]
        })  
      } else { // Pasillo, bloque,columna,fila
        this.form = this.fb.group({
          'codigo': ['',[Validators.required,Validators.maxLength(this.cantidadMaxima),this.caracterValidator]],
          'nombre': [{value: '', disabled: true},[Validators.required, this.caracterValidator]],
          'peso': [, ],
          'volumen': [, ]
        })
      }
      
    } else { // Cuando es ubicación general
      
      this.form = this.fb.group({
        'codigo': ['',[Validators.required,Validators.maxLength(this.cantidadMaxima),this.caracterValidator]],
        'nombre': [{value: '', disabled: false},[Validators.required,this.caracterValidator]],
        'peso': [, ],
        'volumen': [, ]
      })
    }
  }

  inicializarFormulario(data, cantidad: number) {
    this.form.reset({
      'codigo': data.codigo,
      'nombre': data.nombre,
      'peso': data.peso,
      'volumen': data.volumen
    });
    if(cantidad > 0 ) {
      this.form.controls.codigo.disable();
    }
  }

  escribirNombre(event: string) {
    // const $coment = document.getElementById("codigo");
    // let timeout;


    const palabra = this.data.palabra;
    if(this.tipo !== 0) {
      this.form.controls.nombre.setValue(`${palabra}${event.toUpperCase()}`);
    }
    if(this.tipo === 3 || this.tipo === 4) {
      if(event.length === 1) {
        this.form.controls.codigo.setValue(`0${event}`);
        const cod = this.form.get('codigo').value;
        this.form.controls.nombre.setValue(`${palabra}0${event.toUpperCase()}`);
      } else {
        this.form.controls.nombre.setValue(`${palabra}${event.toUpperCase()}`);
      }
    }
    if(this.tipo === 5) {
      if(event.length === 1) {
        this.form.controls.codigo.setValue(`P${event}`);
        const cod = this.form.get('codigo').value;
        this.form.controls.nombre.setValue(`${palabra}0${event.toUpperCase()}`);
      } else {
        if(event.length > 2) {
          this.form.controls.nombre.setValue(`${palabra}${event.toUpperCase().substring(1)}`);
        } else {
          this.form.controls.nombre.setValue(`${palabra}0${event.toUpperCase().substring(1)}`);
          
        }
      }
    }
  }

  async agregar() {
    if (this.form.invalid) {
      return Object.values(this.form.controls).forEach(control => {
        control.markAllAsTouched();
      })
    }
    const codigo = this.form.get('codigo').value;
    const nombre = this.form.get('nombre').value;
    const peso = this.form.get('peso').value;
    const volumen = this.form.get('volumen').value;
    let body = {
      'codigo': this.form.get('codigo').value.toUpperCase(),
      'nombre': this.form.get('nombre').value,
      'idDireccion': this.data.idDireccion,
      'peso': peso,
      'volumen': volumen
    }
    if(this.tipo === 5) {
      const codigo = body.codigo;
      if(codigo.substr(0,1) !== 'P') {
        return Swal.fire({
          title:`El código del pallet tiene que empezar con P` ,
          icon: 'warning',
        });
      }
    }
    
    let validar;
    if(this.tipo !== 0) {
      validar = await this.campoExiste(body.idDireccion,body.codigo,this.codigoAnterior);
      if(validar.cantidad > 0) {
        return Swal.fire({
          title:`El ${body.nombre} ya existe` ,
          icon: 'warning',
        });
      } else {
        this.diaglogRef.close(body);
      }
    } else { // Validar cuando SEA ubicación general
      if(this.isUpdate === 0) { // Cuando se va a agregar
        validar = await this.campoExisteUbicacionExtra(body.idDireccion,body.codigo,this.codigoAnterior);
        if(validar) {
          return Swal.fire({
            title:`El ${body.nombre} ya existe` ,
            icon: 'warning',
          });
        } else {
          this.diaglogRef.close(body);
        }
      } else {
        // Si movió el código
        if(this.antiguoCodigo !== codigo) {
          const validarExistenciaCodigo = await this.campoExisteUbicacionExtra(body.idDireccion,body.codigo,this.codigoAnterior);
          if(validarExistenciaCodigo) { // Si existe
            return Swal.fire({
              title:`El ${body.nombre} ya existe en la misma dirección` ,
              icon: 'warning',
            });
          } else { //Sino
            if(this.antiguoNombre !== nombre) { // Si movió el nombre
              const validarNombre: any = await this.almacenService.validarExistenciaUbicacion(1,`${body.idDireccion}|${body.nombre}`);
              if(validarNombre.cantidad > 0) {
                return Swal.fire({
                  title:`El ${body.nombre} ya existe en este almacén` ,
                  icon: 'warning',
                });
              } else {
                this.diaglogRef.close(body);  
              }
            } else { // Sino movió el nombre
              this.diaglogRef.close(body);
            }
          }
        } else{ // Sino movió el código
          if(this.antiguoNombre !== nombre) { // Si movió el nombre
            const validarNombre: any = await this.almacenService.validarExistenciaUbicacion(4,`${body.idDireccion}|${body.nombre}`);
            if(validarNombre.cantidad > 0) {
              return Swal.fire({
                title:`El ${body.nombre} ya existe en este almacén` ,
                icon: 'warning',
              });
            } else {
              this.diaglogRef.close(body);
            }
          } else { // Sino movió el nombre
            this.diaglogRef.close(body);
          }
        }
      }
    }
    
    
  }

  async campoExiste(idDireccion: number, codigo: string, codigoAnterior: string): Promise<boolean> {
    const validar: any = await this.almacenService.validarExistenciaUbicacion(1,`${idDireccion}|${codigoAnterior}${codigo}`);
    if( validar.cantidad >= 1 ) {
      return true;
    }
    return false;
  }

  async campoExisteUbicacionExtra(idDireccion: number, codigo: string, codigoAnterior: string): Promise<boolean> {
    const validar: any = await this.almacenService.validarExistenciaUbicacion(1,`${idDireccion}|${codigo}`);
    if( validar.cantidad >= 1 ) {
      return true;
    }
    return false;
  }

  cerrar() {
    this.diaglogRef.close();
  }

  get codigoValidator() {
    return this.form.get('codigo').invalid && this.form.get('codigo').touched;
  }

  get nombreValidator() {
    return this.form.get('nombre').invalid && this.form.get('nombre').touched;
  }

  get pesoValidator() {
    return this.form.get('peso').invalid && this.form.get('peso').touched;
  }

  get volumenValidator() {
    return this.form.get('volumen').invalid && this.form.get('volumen').touched;
  }


  /* #region FormControls */
  get codigoField() {
    return this.form.get('codigo') as FormControl;
  }

  get nombreField() {
    return this.form.get('nombre') as FormControl;
  }

  /* #region Mensajes de Error */
  get codigoError() {
    return this.codigoField.hasError('required') && this.codigoField.touched ? this.message : this.codigoField.hasError('caracterValidator') ? this.codigoField.errors.caracterValidator : null;
  }

  get nombreError() {
    return this.nombreField.hasError('required') && this.nombreField.touched ? this.message : this.nombreField.hasError('caracterValidator') ? this.nombreField.errors.caracterValidator : null;
  }



  caracterValidator(control: AbstractControl): ValidationErrors | null {
    const caracteres = /(\/|\|)$/i;
    const valid = caracteres.exec(control.value);
    return valid ? { caracterValidator: 'El texto no debe contener: "/" ni "|"' } : null;
  }

}
