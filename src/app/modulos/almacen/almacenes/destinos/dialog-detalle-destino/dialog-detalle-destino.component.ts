import { Component, OnInit, Inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlmacenesService } from '../../almacenes.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dialog-detalle-destino',
  templateUrl: './dialog-detalle-destino.component.html',
  styleUrls: ['./dialog-detalle-destino.component.css'],
  animations: [asistenciapAnimations]
})
export class DialogDetalleDestinoComponent implements OnInit {

  form: FormGroup;
  listaTipoZona: any;
  listaEstado: any;
  abLista = [];
  tsLista = 'inactive';
  fbLista = [
    { icon: 'save', tool: 'Crear' }
  ];
  // Listas para distrito, provincia y distrito
  listaDepartamento: any;
  listaProvincia: any;
  listaDistrito: any;
  idPais: any;
  isEditar: boolean = true;
  isPersonal: boolean = false;
  negocio: number;
  message: string = '.Obligatorio';
  constructor(
    private almacenService: AlmacenesService,
    public diaglogRef: MatDialogRef<DialogDetalleDestinoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) { }

  async ngOnInit() {
    this.isPersonal = false;

    if (this.data.data.idTipo === 2) { //Esta condición es para averiguar si es personal o no.
      this.isPersonal = true;
    }
    this.idPais = localStorage.getItem('Pais');
    this.isEditar = false;
    this.negocio = this.data.negocio;
    if (this.data.tipo === 1) {
      this.isEditar = true;
    }
    this.fnCrearFormulario();
    if (this.data.tipo === 1) {
      await this.inicializarFormulario(this.data);
    } else {
      this.listaDepartamento = await this.almacenService.obtenerInformacionDireccionDestino(4, `${this.idPais}`);
      // Llenamos el campo de cliente para que en el formulario el usuario sepa a qué cliente va a registrar la dirección
      this.form.controls.cliente.setValue(`${this.data.data.codigo} - ${this.data.data.descripcion}`);
    }
    this.listaTipoZona = await this.almacenService.obtenerInformacionDireccionDestino(3, `${this.idPais}`);
    this.listaEstado = [{ idEstado: 1, estado: 'Activo' }, { idEstado: 0, estado: 'Inactivo' }];
    this.onToggleFab(1, -1);
  }

  fnCrearFormulario() {
    const editarPersonalEstado = this.isPersonal === true ? true : this.isEditar === true ? false : true;
    const valTipoZona = this.idPais == '604' ? Validators.required : null;
    this.form = this.fb.group({
      cliente: ['', Validators.required],
      destino: [{ value: '', disabled: (this.isPersonal && this.isEditar) }, [Validators.required, this.caracterValidator]],
      direccion: [{ value: '', disabled: (this.isPersonal && this.isEditar) }, [Validators.required, this.caracterValidator]],
      referencia: [{ value: '', disabled: (this.isPersonal && this.isEditar) }, [Validators.required, this.caracterValidator]],
      ubicacion: [{ value: '', disabled: (this.isPersonal && this.isEditar) }],
      distrito: [{ value: null, disabled: (this.isPersonal && this.isEditar) }, Validators.required],
      departamento: [{ value: null, disabled: (this.isPersonal && this.isEditar) }, Validators.required],
      provincia: [{ value: null, disabled: (this.isPersonal && this.isEditar) }, Validators.required],
      tipoZona: ['', valTipoZona],
      tipoAlmacen: [''],
      email: [''],
      estado: [{ value: 1, disabled: editarPersonalEstado }, Validators.required],
      latitud: [0],
      longitud: [0],
      bModulo: false,
    });
  }

  async inicializarFormulario(data) {
    this.form.reset({
      cliente: `${data.data.codigo} - ${data.data.descripcion}`,
      destino: `${data.dataDetalle.destino}`,
      direccion: `${data.dataDetalle.direccion}`,
      referencia: `${data.dataDetalle.referencia}`,
      ubicacion: `${data.dataDetalle.ubicacion}`,
      distrito: `${data.dataDetalle.ubicacion.substr(0, 9)}`,
      departamento: `${data.dataDetalle.ubicacion.substr(0, 5)}`,
      provincia: `${data.dataDetalle.ubicacion.substr(0, 7)}`,
      tipoZona: data.dataDetalle.idTipoZona,
      tipoAlmacen: ``,
      email: ``,
      estado: data.dataDetalle.estado,
      latitud: data.dataDetalle.latitud,
      longitud: data.dataDetalle.longitud,
      bModulo: data.dataDetalle.bModulo
    })
    await this.llenarLocalizacionModificacion(data);
  }

  async llenarLocalizacionModificacion(data) {
    const idDireccionDestino = data.dataDetalle.ubicacion.substr(0, 5);
    const idPronviciaDestino = data.dataDetalle.ubicacion.substr(0, 7);
    this.listaDepartamento = await this.almacenService.obtenerInformacionDireccionDestino(4, `${this.idPais}`);
    this.listaProvincia = await this.almacenService.obtenerInformacionDireccionDestino(5, `${idDireccionDestino}`);
    this.listaDistrito = await this.almacenService.obtenerInformacionDireccionDestino(6, `${idPronviciaDestino}`);
  }

  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;

  }

  salir() { this.diaglogRef.close() }

  agregarDestino() {
    if (this.form.invalid) {
      return Object.values(this.form.controls).forEach(control => {
        control.markAllAsTouched();
      })
    }
  }

  validarLatitudLongitud() {
    const latitud = this.form.get('latitud').value;
    const longitud = this.form.get('longitud').value;
    if ((latitud === 0 && (longitud < 0 && longitud > 0)) || ((latitud < 0 && latitud > 0) && longitud === 0)) {
      return true;
    }
    return false;
  }

  actualizarDestino() {
    let idTipoZona;
    let tipoZona;
    if (this.form.invalid) {
      return Object.values(this.form.controls).forEach(control => {
        control.markAllAsTouched();
      })
    }
    // Validamos si el negocio es 1, en caso sea así 
    if (this.negocio === 1) {
      const latitud = this.form.get('latitud').value;
      const longitud = this.form.get('longitud').value;
      if (latitud === 0 || longitud === 0) {
        return Swal.fire({ title: 'La latitud y longitud son obligatorias', icon: 'warning' });
      }

      if (latitud === '' || longitud === '' || latitud === null || longitud === null) {
        return Swal.fire({ title: 'La latitud y longitud son obligatorias', icon: 'warning' });
      }
    }
    if (this.validarLatitudLongitud()) {
      return Swal.fire({ title: 'La latitud y longitud son obligatorias', icon: 'warning' });
    }

    const departamento = this.form.get('departamento').value;
    const nombreDepartamento = this.listaDepartamento.find(item => item.codigo === departamento).nombre;
    const provincia = this.form.get('provincia').value;
    const nombreProvincia = this.listaProvincia.find(item => item.codigo === provincia).nombre;
    const distrito = this.form.get('distrito').value;
    const nombreDistrito = this.listaDistrito.find(item => item.codigo === distrito).nombre;
    const ubicacion = this.form.get('ubicacion').value;
    const direccion = this.form.get('direccion').value;
    const idDireccion = this.data.dataDetalle.idDireccion;
    if (this.idPais === '604' || this.idPais === '068') { // Si es Perú
      idTipoZona = this.form.get('tipoZona').value;
      if (!idTipoZona) {
        return Swal.fire({ title: 'El tipo de zona es obligatorio.', icon: 'warning' });
      }
      tipoZona = this.listaTipoZona.find(item => item.nIdTipEle === idTipoZona).sDesc;
    } else {
      idTipoZona = 0;
      tipoZona = '';
    }

    const destino = this.form.get('destino').value;
    const estado = this.form.get('estado').value;
    const referencia = this.form.get('referencia').value;
    const latitud = this.form.get('latitud').value === '' || this.form.get('latitud').value === null ? 0 : this.form.get('latitud').value;
    const longitud = this.form.get('longitud').value === '' || this.form.get('longitud').value === null ? 0 : this.form.get('longitud').value;
    const bModulo = this.form.get('bModulo').value;

    if (this.data.tipo === 0) { //Agregar
      let body = {
        'codigo': 0,
        'departamento': departamento,
        'nombreDepartamento': nombreDepartamento,
        'distrito': distrito,
        'nombreDistrito': nombreDistrito,
        'provincia': provincia,
        'nombreProvincia': nombreProvincia,
        'ubicacion': ubicacion,
        'direccion': direccion,
        'idDireccion': '',
        'idTipoZona': idTipoZona,
        'tipoZona': tipoZona,
        'destino': destino,
        'estado': estado,
        'referencia': referencia,
        'latitud': latitud,
        'longitud': longitud,
        bModulo: bModulo
      }
      this.diaglogRef.close(body);
    } else if (this.data.tipo === 1) { // Actualizar
      let body = {
        'codigo': this.data.dataDetalle.codigo,
        'departamento': departamento,
        'nombreDepartamento': nombreDepartamento,
        'distrito': distrito,
        'nombreDistrito': nombreDistrito,
        'provincia': provincia,
        'nombreProvincia': nombreProvincia,
        'ubicacion': ubicacion,
        'direccion': direccion,
        'idDireccion': idDireccion,
        'idTipoZona': idTipoZona,
        'tipoZona': tipoZona,
        'destino': destino,
        'estado': estado,
        'referencia': referencia,
        'latitud': latitud,
        'longitud': longitud,
        bModulo: bModulo
      }
      this.diaglogRef.close(body);
    }
  }

  async cambioDepartamento(idDepartamento) {
    this.form.controls.provincia.setValue('');
    this.form.controls.distrito.setValue('');
    this.form.controls.ubicacion.setValue('');
    this.listaDistrito = [];

    this.form.controls.tipoZona.setValue('')

    this.listaProvincia = await this.almacenService.obtenerInformacionDireccionDestino(5, `${idDepartamento}`);
  }

  async cambioProvincia(idProvincia) {
    this.form.controls.distrito.setValue('');
    this.form.controls.ubicacion.setValue('');

    this.form.controls.tipoZona.setValue('')

    this.listaDistrito = await this.almacenService.obtenerInformacionDireccionDestino(6, `${idProvincia}`);
  }

  cambioDistrito(event) {
    this.form.controls.ubicacion.setValue(event);
    let distrito = this.listaDistrito.find(item => item.codigo == event);
    this.form.controls.tipoZona.setValue('')

    //Si el tipo de zona es 0, significa que no tiene 
    if (distrito.nIdTipoZona != 0) {
      this.form.controls.tipoZona.setValue(distrito.nIdTipoZona);
    }
  }

  /* #region  FormControls */
  get destinoField(): FormControl { return this.form.get('destino') as FormControl }
  get departamentoField(): FormControl { return this.form.get('departamento') as FormControl }
  get provinciaField(): FormControl { return this.form.get('provincia') as FormControl }
  get distritoField(): FormControl { return this.form.get('distrito') as FormControl }
  get ubicacionField(): FormControl { return this.form.get('ubicacion') as FormControl }
  get direccionField(): FormControl { return this.form.get('direccion') as FormControl }
  get referenciaField(): FormControl { return this.form.get('referencia') as FormControl }
  get tipoZonaField(): FormControl { return this.form.get('tipoZona') as FormControl }
  /* #endregion */

  /* #region   Mensajes de Error*/
  get destinoError(): string {
    return this.destinoField.hasError('required') ? this.message :
      this.destinoField.hasError('caracterValidator') ? this.destinoField.errors.caracterValidator : null;
  }
  get departamentoError(): string {
    return this.departamentoField.hasError('required') && this.departamentoField.touched ? this.message : null;
  }
  get provinciaError(): string {
    return this.provinciaField.hasError('required') && this.departamentoField.valid ? this.message :
      this.provinciaField.hasError('required') && this.departamentoField.invalid && this.provinciaField.touched ? 'Seleccione un departamento' : null;
  }
  get distritoError(): string {
    return this.distritoField.hasError('required') && this.provinciaField.valid ? this.message :
      this.distritoField.hasError('required') && this.provinciaField.invalid && this.distritoField.touched ? 'Seleccione una provincia' : null;
  }
  get direccionError(): string {
    return this.direccionField.hasError('required') ? this.message :
      this.direccionField.hasError('caracterValidator') ? this.direccionField.errors.caracterValidator : null;
  }
  get referenciaError(): string {
    return this.referenciaField.hasError('required') ? this.message :
      this.referenciaField.hasError('caracterValidator') ? this.referenciaField.errors.caracterValidator : null;
  }
  get tipoZonaError(): string {
    return this.tipoZonaField.hasError('required') ? this.message : null;
  }
  /* #endregion */

  caracterValidator(control: AbstractControl): ValidationErrors | null {
    const caracteres = /(\/|\|)$/i;
    const valid = caracteres.exec(control.value);
    return valid ? { caracterValidator: 'El texto no debe contener: "/" ni "|"' } : null;
  }
}
