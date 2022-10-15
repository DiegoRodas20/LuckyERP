import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Form, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';
import { AlmacenesService } from '../../../almacenes.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from '../../../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agregar-almacen-fisico',
  templateUrl: './agregar-almacen-fisico.component.html',
  styleUrls: ['./agregar-almacen-fisico.component.css', '../../almacen.component.css'],
  animations: [asistenciapAnimations]
})
export class AgregarAlmacenFisicoComponent implements OnInit {

  form: FormGroup;
  listaAlmacenBase: any;
  listaTipoUso: any;
  listaTipoAlmacen: any;
  listanEstado: any;
  abLista = [];
  tsLista = 'inactive';
  isEditar: boolean = true;
  fbLista = [
    { icon: 'save', tool: 'Crear' }
  ];
  listaUbicacion: any;
  message: string = '.Obligatorio';
  // breadcrumb: string;
  constructor(
    private spinner: NgxSpinnerService,
    private almacenService: AlmacenesService,
    public diaglogRef: MatDialogRef<AgregarAlmacenFisicoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder) {
  }

  async ngOnInit() {
    this.isEditar = false;
    if (this.data.tipo === 1) {
      this.isEditar = true;
    }
    this.crearFormulario();
    if (this.data.tipo === 1) {
      this.inicializarFormulario(this.data.data);
    }
    // this.spinner.show();
    this.listaTipoUso = await this.almacenService.listaOpcionesAlmacen(1, '');
    this.listaTipoAlmacen = await this.almacenService.listaOpcionesAlmacen(2, '');
    this.listanEstado = await this.almacenService.listaOpcionesAlmacen(3, '');
    this.listaUbicacion = await this.almacenService.listaOpcionesAlmacen(4, '');
    // this.spinner.hide();
    
    this.onToggleFab(1, -1)
  }

  crearFormulario() {
    this.form = this.fb.group({
      'id': [],
      // 'codigo': [{value: '', disabled: this.isEditar},Validators.required],
      'codigo': [{ value: '', disabled: this.isEditar }, [Validators.required, this.caracterValidator]],
      'descripcion': ['', [Validators.required, this.caracterValidator]],
      'idTipoUso': ['', Validators.required],
      'idTipoAlmacen': ['', Validators.required],
      'idEstado': [{ value: 589, disabled: !this.isEditar }, Validators.required],
      'idUbicacion': ['', Validators.required],
      'operativo': [false]
    })
  }

  inicializarFormulario(data) {
    this.form.reset({
      'id': data.nIdAlmacen,
      "codigo": data.sCodAlmacen,
      "descripcion": data.sDescripcion,
      "idTipoUso": data.nTipoUso,
      "idTipoAlmacen": data.nTipoAlmacen,
      "idEstado": data.nIdEstado,
      "idUbicacion": data.nIdVerUbicacion,
      'operativo': data.operativo === 1 ? true : false
    })
  }


  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;

  }

  async agregarAlmacen() {
    if (this.form.invalid) {
      return Object.values(this.form.controls).forEach(control => {
        control.markAllAsTouched();
      })
    }
    const codigo = this.form.get('codigo').value;
    const descripcion = this.form.get('descripcion').value;
    const idTipoUso = this.form.get('idTipoUso').value;
    let sTipoUso = this.listaTipoUso.filter(item => item.nEleCod === idTipoUso)[0];
    const idTipoAlmacen = this.form.get('idTipoAlmacen').value;
    let sTipoAlmacen = this.listaTipoAlmacen.filter(item => item.nEleCod === idTipoAlmacen)[0];
    const idEstado = this.form.get('idEstado').value;
    let sEstado = this.listanEstado.filter(item => item.nEleCod === idEstado)[0];
    const idUbicacion = this.form.get('idUbicacion').value;
    let sUbicacion = this.listaUbicacion.filter(item => item.nEleCod === idUbicacion)[0];
    const bloqueadoComercial = this.form.get('operativo').value;
    const validar: any = await this.almacenService.listarInformacionAlmacen(5, `${this.data.cabecera}|${codigo}`);
    if (this.data.data.sCodAlmacen != codigo) {
      if (validar.resp >= 1) {
        return Swal.fire({
          title: 'El código ingresado ya se encuentra registrado',
          icon: 'warning',
        })
      }
    }

    if (this.data.tipo === 0) {
      let body = {
        'estado': sEstado.cEleNam,
        'nIdAlmacen': 0,
        'nIdEstado': idEstado,
        'nIdVerUbicacion': idUbicacion,
        'nTipoAlmacen': idTipoAlmacen,
        'nTipoUso': idTipoUso,
        'sCodAlmacen': codigo.toUpperCase(),
        'sDescripcion': descripcion,
        'tipoAlmacen': sTipoAlmacen.cEleNam,
        'tipoUso': sTipoUso.cEleNam,
        'ubicacion': sUbicacion.cEleNam,
        'operativo': (bloqueadoComercial === true) ? 1 : 0,
      }
      this.diaglogRef.close({
        tipo: 0,
        body: body
      });
    } else if (this.data.tipo === 1) {
      let body = {
        'estado': sEstado.cEleNam,
        'nIdAlmacen': this.data.data.nIdAlmacen,
        'nIdEstado': idEstado,
        'nIdVerUbicacion': idUbicacion,
        'nTipoAlmacen': idTipoAlmacen,
        'nTipoUso': idTipoUso,
        'sCodAlmacen': codigo.toUpperCase(),
        'sDescripcion': descripcion,
        'tipoAlmacen': sTipoAlmacen.cEleNam,
        'tipoUso': sTipoUso.cEleNam,
        'ubicacion': sUbicacion.cEleNam,
        'operativo': (bloqueadoComercial === true) ? 1 : 0,
      }
      this.diaglogRef.close({
        tipo: 1,
        body: body
      });
    }

  }

  salir() {
    this.diaglogRef.close();
  }

  validarExistenciaCodigo(codigo: string): boolean {
    const listaAlmacenFisico: any[] = this.data.lalmacenFisico;
    const almacenFisico = listaAlmacenFisico.filter(item => item.sCodAlmacen.toUpperCase() === codigo.toUpperCase());
    if (almacenFisico.length > 1) {
      return true;
    }
    return false;
  }

  get codigoValidator() {
    return this.form.get('codigo').invalid && this.form.get('codigo').touched;
  }

  get descripcionValidator() {
    return this.form.get('descripcion').invalid && this.form.get('descripcion').touched;
  }

  get tipoUsoValidator() {
    return this.form.get('idTipoUso').invalid && this.form.get('idTipoUso').touched;
  }

  get tipoAlmacenValidator() {
    return this.form.get('idTipoAlmacen').invalid && this.form.get('idTipoAlmacen').touched;
  }

  get estadoValidator() {
    return this.form.get('idEstado').invalid && this.form.get('idEstado').touched;
  }

  get ubicacionValidator() {
    return this.form.get('idUbicacion').invalid && this.form.get('idUbicacion').touched;
  }


  //  #region FormControls */
  get codigoField() {
    // return this.form.get('codigo').invalid && this.form.get('codigo').touched;
    return this.form.get('codigo') as FormControl;
  }

  get descripcionField() {
    // return this.form.get('descripcion').invalid && this.form.get('descripcion').touched;
    return this.form.get('descripcion') as FormControl;
  }

  get tipoUsoField() {
    // return this.form.get('idTipoUso').invalid && this.form.get('idTipoUso').touched;
    return this.form.get('idTipoUso') as FormControl;
  }

  get tipoAlmacenField() {
    // return this.form.get('idTipoAlmacen').invalid && this.form.get('idTipoAlmacen').touched;
    return this.form.get('idTipoAlmacen') as FormControl;
  }

  get estadoField() {
    // return this.form.get('idEstado').invalid && this.form.get('idEstado').touched;
    return this.form.get('idEstado') as FormControl;
  }

  get ubicacionField() {
    // return this.form.get('idUbicacion').invalid && this.form.get('idUbicacion').touched;
    return this.form.get('idUbicacion') as FormControl;
  }


  /* #region Mensajes de Error */
  get codigoError() {
    // return this.form.get('codigo').invalid && this.form.get('codigo').touched;
    return this.codigoField.hasError('required') && this.codigoField.touched ? this.message : this.codigoField.hasError('caracterValidator') ? this.codigoField.errors.caracterValidator : null;
  }

  get descripcionError() {
    // return this.form.get('descripcion').invalid && this.form.get('descripcion').touched;
    return this.descripcionField.hasError('required') && this.descripcionField.touched ? this.message : this.descripcionField.hasError('caracterValidator') ? this.descripcionField.errors.caracterValidator : null;
  }

  get tipoUsoError() {
    // return this.form.get('idTipoUso').invalid && this.form.get('idTipoUso').touched;
    return this.tipoUsoField.hasError('required') && this.tipoUsoField.touched ? this.message : this.tipoUsoField.hasError('caracterValidator') ? this.tipoUsoField.errors.caracterValidator : null;
  }

  get tipoAlmacenError() {
    // return this.form.get('idTipoAlmacen').invalid && this.form.get('idTipoAlmacen').touched;
    return this.tipoAlmacenField.hasError('required') && this.tipoAlmacenField.touched ? this.message : this.tipoAlmacenField.hasError('caracterValidator') ? this.tipoAlmacenField.errors.caracterValidator : null;
  }

  get estadoError() {
    // return this.form.get('idEstado').invalid && this.form.get('idEstado').touched;
    return this.estadoField.hasError('required') && this.estadoField.touched ? this.message : this.estadoField.hasError('caracterValidator') ? this.estadoField.errors.caracterValidator : null;
  }

  get ubicacionError() {
    // return this.form.get('idUbicacion').invalid && this.form.get('idUbicacion').touched;
    return this.ubicacionField.hasError('required') && this.ubicacionField.touched ? this.message : this.ubicacionField.hasError('caracterValidator') ? this.ubicacionField.errors.caracterValidator : null;
  }





  caracterValidator(control: AbstractControl): ValidationErrors | null {
    const caracteres = /(\/|\|)$/i;
    const valid = caracteres.exec(control.value);
    return valid ? { caracterValidator: 'El texto no debe contener: "/" ni "|"' } : null;
  }

  fnDarValor(nId: number) {
    //Solo si es almacen satelite
    if (nId == 1856) {
      this.form.controls.operativo.setValue(true);

      //Solo si existe el elemento le damos valor
      let inventario = this.listaUbicacion.find(item => item.nEleCod == 1981)
      if (inventario) {
        this.form.controls.idUbicacion.setValue(1981);
      }
    } else {
      this.form.controls.operativo.setValue(false);
      this.form.controls.idUbicacion.setValue(null);
    }
  }
}
