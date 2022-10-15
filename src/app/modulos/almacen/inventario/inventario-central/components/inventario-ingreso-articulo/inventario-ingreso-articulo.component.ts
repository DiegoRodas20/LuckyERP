import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import { InventarioService } from '../../../inventario.service';
import { Observable, Subscription } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import * as moment from 'moment';
import { DateAdapter } from 'angular-calendar';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Moment } from 'moment';
import Swal from 'sweetalert2';

export interface Articulo {
  nIdArticulo: number;
  sCodArticulo: string;
  sDescripcion: string;
  imagenArticulo: string;
  sCodUndMedida: string;
  nPesoUnd: string;
  nVolumenUnidad: string;
  nPesoEmpac2: string;
  nVolumenEmpac2: string;
  nPesoEmpac3: string;
  nVolumenEmpac3: string;
  nIdControlLote: string;
  sControlLote: string;
  sCodBarra: string;
}


export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
    
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
}

@Component({
  selector: 'app-ingreso-articulo',
  templateUrl: './inventario-ingreso-articulo.component.html',
  styleUrls: ['./inventario-ingreso-articulo.component.css'],
  animations: [asistenciapAnimations],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE,MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]
  
})
export class InventarioIngresoArticuloComponent implements OnInit {
  abLista = [];
  tsLista = 'inactive'; 
  isEditar: boolean = true;
  fbLista = [
    {icon: 'save', tool: 'Crear'}
  ];
  idPais: string;
  idUser: string;
  idEmp: string;  //id de la empresa del grupo Actual
  listaEmpresa: any;
  listaAlmacen: any;
  listaArticulo: any = [];
  listaPresupuesto: any = [];
  ubicacionActual: any;
  idUbicacionActual: any;
  formularioIngreso: FormGroup;
  filterArticulo: Observable<Articulo[]>;
  lote: number;
  tipoAlmacen: number;
  imagen: string = '';
  codigoBarra: string = '';
  idAlmacenBase: number;
  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService,
    public diaglogRef: MatDialogRef<InventarioIngresoArticuloComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) { 
      
    }

  async ngOnInit() {
    this.idPais = localStorage.getItem('Pais');
    let user = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.idEmp = localStorage.getItem('Empresa');
    
    this.ubicacionActual = this.data.ubicacionActual;
    this.idUbicacionActual = this.data.ubicacionId;
    this.idAlmacenBase = this.data.almacenBaseId;
    this.crearFormulario();
    this.listaArticulo = await this.inventarioService.listaInformacionInventario(5,`${this.idPais}`);
    this.listaEmpresa = await this.inventarioService.listaInformacionInventario(2,`${this.idPais}`);
    this.listaAlmacen = await this.inventarioService.listaInformacionInventario(3,`${this.idUser}|${this.idPais}|${this.idAlmacenBase}`);
    this.inicializarEmpresa();
    this.onToggleFab(1, -1)
  }

  inicializarEmpresa() {
    const idEmpresa = Number.parseInt(this.idEmp);
    this.formularioIngreso.controls.empresa.setValue(idEmpresa);
    this.cambioEmpresa(idEmpresa);
  }

  crearFormulario() {
    let date = moment();
    this.formularioIngreso = this.fb.group({
      'empresa': [this.idEmp, Validators.required],
      'ubicacionActual': [this.ubicacionActual],
      'almacen': ['', Validators.required],
      'codigoArticulo': ['',Validators.required],
      'nombreArticulo': [''],
      'loteArticulo': [''], // Este es el id 
      'sLoteArticulo': ['',Validators.required], // Este será el lote
      'presupuesto': ['',Validators.required],
      'cliente': [''],
      'fechaIngreso': [{value: date, disabled: true},Validators.required],
      'fechaVencimiento': [{
        value: '',
        disabled: true
      },Validators.required],
      'cantidad': ['', Validators.required],
      'observacion': ['',[this.caracterValidator]]
    })
  }

  verImagen() {
    const idArticulo = this.formularioIngreso.get('codigoArticulo').value;
    if(idArticulo) {
      const imagen = this.listaArticulo.filter(item => item.nIdArticulo === idArticulo)[0].imagenArticulo;
      if(imagen) {
        Swal.fire({
          imageUrl: imagen,
          imageWidth: 250,
          imageHeight: 250,
        })
      } else {
        Swal.fire({
          icon: 'warning',
          title: '¡Atención!',
          text: 'Este artículo no contiene una imagen',
        });
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'Escoja un artículo',
      });
    }
    
  }

  filtroArticulo(event){
  }

  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }

  private filtrarAutocompleteArticulo() {
    this.filterArticulo = this.formularioIngreso.controls['codigoArticulo'].valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.sDescripcion),
      map(sDescripcion => sDescripcion ? this._filterUbicacion(sDescripcion) : this.listaArticulo.slice())
    );
  }

  private _filterUbicacion(sCodArticulo: string) {
    const filterValue = sCodArticulo.toLocaleLowerCase();
    const filtrando = this.listaArticulo.filter(option => option.sDescripcion.toLocaleLowerCase().indexOf(filterValue) === 0 );
    return filtrando;
  }

  async cambioEmpresa(empresa) {
    this.listaPresupuesto = await this.inventarioService.listaInformacionInventario(4,`${empresa}`);
  }



  salir() {
    this.diaglogRef.close();
  }

  habilitarLotes(idLote: number) {
    if(idLote) {
      this.lote = idLote;
    }
    switch (idLote) {
      case 1946:
        //Limitamos el vencimiento
        this.formularioIngreso.controls.fechaVencimiento.setValue('');
        this.formularioIngreso.controls.fechaVencimiento.disable();
        this.formularioIngreso.controls.sLoteArticulo.setValue('00000000');
        break;
      case 1947:
        this.formularioIngreso.controls.sLoteArticulo.setValue('00000000');
        let valor: Moment = this.formularioIngreso.get('fechaIngreso').value;
        let formato = valor.format('DDMMYYYY');
        this.formularioIngreso.controls.fechaVencimiento.setValue('');
        this.formularioIngreso.controls.fechaVencimiento.disable();
        this.formularioIngreso.controls.sLoteArticulo.setValue(formato);
        break;
      case 1948:
        if(this.tipoAlmacen){ // El almacén tiene que existir
          this.formularioIngreso.controls.fechaVencimiento.enable();
        }
        break;    
      default:
        break;
    }
  }

  cambioAlmacen(idAlmacen){
    const almacen = this.listaAlmacen.filter(almacen => almacen.nIdAlmacen === idAlmacen)[0];
    
    this.tipoAlmacen = almacen.nTipoAlmacen; // 1851 Valorado
    if(this.lote === 1948) {
      if(this.tipoAlmacen === 1851) { // Valorado
        let valor: Moment = this.formularioIngreso.get('fechaIngreso').value;
        let formato = valor.format('DDMMYYYY');
        this.formularioIngreso.controls.sLoteArticulo.setValue(formato);
      } 
      else { // No valorado
        let valor: Moment = this.formularioIngreso.get('fechaVencimiento').value;
        if(valor) {
          let formato = valor.format('DDMMYYYY');
          this.formularioIngreso.controls.sLoteArticulo.setValue(formato);
        }
        
      }
    }
  }

  changeIngreso(type: string, event: MatDatepickerInputEvent<Date>) {
    let valor: Moment = this.formularioIngreso.get('fechaIngreso').value;
    if(this.lote === 1947) {
      this.habilitarLotes(this.lote);
    } else {
      this.formularioIngreso.controls.sLoteArticulo.setValue(valor.format('DDMMYYYY'));
    }
  }

  changeVencimiento(type: string, event: MatDatepickerInputEvent<Date>) {
    if(this.tipoAlmacen === 1851) { // Valorado
      let valor: Moment = this.formularioIngreso.get('fechaIngreso').value;
      let formato = valor.format('DDMMYYYY');
      this.formularioIngreso.controls.sLoteArticulo.setValue(formato);
    } 
    else { // No valorado
      let valor: Moment = this.formularioIngreso.get('fechaVencimiento').value;
      if(valor) {
        let formato = valor.format('DDMMYYYY');
        this.formularioIngreso.controls.sLoteArticulo.setValue(formato);
      }
      
    }
  }

  async agregarArticulo() {
    if (this.formularioIngreso.invalid) {
      return Object.values(this.formularioIngreso.controls).forEach(control => {
        control.markAllAsTouched();
      })
    }
    // Si no tiene imagen o lote no se puede ingresar
    if(this.validarImagenAndLote()) {
      return Swal.fire({
        title: '¡Atención!',
        text: 'No se puede ingresar un artículo sin imagen o código de barras',
        icon: 'warning',
      })
    }
    // Aquí validamos si es que hay una diferencia entre artículo y kardex
    const parametro: string = this.validaUbicacionKardex();
    const validacion: any = await this.inventarioService.listaInformacionInventario(11,parametro);
    
    // if(validacion.id !== 0) {
    //   await Swal.fire({
    //     title: validacion.mensaje,
    //     icon: 'warning',
    //     timer: 3000
    //   })
    // }
    // await Swal.fire({
    //   title: 'El artículo de ingresó correctamente',
    //   text: 'Ojo! ¿Está agregando mercadería que no existe en stock del kardex, desea continuar? ',
    //   icon: 'warning',
    //   timer: 1500
    // });
    let mensajeAlert = '';
    let iconAlert: any; 
    if(validacion.id !== 0) {
      mensajeAlert = 'Está agregando mercadería que no existe en stock del kardex. ¿Desea continuar?';
      iconAlert = 'warning';
    } else {
      mensajeAlert = '';
      iconAlert = 'success';
    }
    
    Swal.fire({
      title: '¿Estás seguro de ingresar este artículo?',
      text: mensajeAlert,
      icon: iconAlert,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if(result.isConfirmed) {
        let now = moment().format('yyyy-MM-DD');
        const empresaId = this.formularioIngreso.get('empresa').value;
        const ubicacionId = this.idUbicacionActual;
        const almacenId = this.formularioIngreso.get('almacen').value;
        const centroCostoId = this.formularioIngreso.get('presupuesto').value;
        const articuloId = this.formularioIngreso.get('codigoArticulo').value;
        const cantidadIngreso = this.formularioIngreso.get('cantidad').value;
        const cantidadSalida = 0;
        const observacion = this.formularioIngreso.get('observacion').value;
        let valorIngreso: Moment = this.formularioIngreso.get('fechaIngreso').value;
        const fechaIngreso = valorIngreso.format('yyyy-MM-DD');
        const tipoOperacion = 0;
        let fechaVencimiento: string;
        let valorVencimiento: Moment = this.formularioIngreso.get('fechaVencimiento').value;
        if(valorVencimiento) {
          fechaVencimiento = valorVencimiento.format('yyyy-MM-DD');
        } else {
          fechaVencimiento = '';
          
        }
        const merma = 0;
        const marcado = 0;
        const lote = this.formularioIngreso.get('sLoteArticulo').value;
        let parametro = `${ubicacionId}|${almacenId}|${centroCostoId}|${articuloId}|${lote}|${fechaIngreso}|${fechaVencimiento}|${observacion}|${cantidadIngreso}|${cantidadSalida}|${this.idUser}|${tipoOperacion}|0|${merma}|${marcado}`;
        const resp = await this.inventarioService.insertOrUpdateArticuloInventario(1,parametro);
        this.diaglogRef.close(resp);
        
      }
    })

    

  }

  validarImagenAndLote(): boolean {
    const imagen = this.imagen;
    const codigoBarras = this.codigoBarra;

    if(imagen === '' || codigoBarras === '') {
      return true;
    } {
      return false;
    }
  }

  validaUbicacionKardex() {
    const empresaId = this.idEmp;
    const nIdPresupuesto = this.formularioIngreso.get('presupuesto').value;
    const nIdAlmacen = this.formularioIngreso.get('almacen').value;
    const nIdArticulo = this.formularioIngreso.get('codigoArticulo').value;
    const sLote = this.formularioIngreso.get('sLoteArticulo').value;
    const cantidad = this.formularioIngreso.get('cantidad').value;
    let valorIngreso: Moment = this.formularioIngreso.get('fechaIngreso').value;
    const sFechaIngreso = valorIngreso.format('yyyy-MM-DD');
    let fechaVencimiento;
    let valorVencimiento: Moment = this.formularioIngreso.get('fechaVencimiento').value;
    if(valorVencimiento) {
      fechaVencimiento = valorVencimiento.format('yyyy-MM-DD');
    } else {
      fechaVencimiento = '';
      
    }

    let parametro  = `${empresaId}|${nIdPresupuesto}|${nIdAlmacen}|${nIdArticulo}|${sLote}|${sFechaIngreso}|${fechaVencimiento}|${cantidad}`;
    
    return parametro;
  }

  get validarArticulo() {
    if(this.formularioIngreso.get('codigoArticulo').touched) {
      const codigo = this.formularioIngreso.get('codigoArticulo').value;
      const listaTemp = this.listaArticulo.filter(option => option.nIdArticulo === codigo);
      if(listaTemp.length === 0) {
        this.formularioIngreso.controls.codigoArticulo.setValue('');
        return true;
      } else{
        this.formularioIngreso.controls.loteArticulo.setValue(`${listaTemp[0].nIdControlLote}` );
        this.imagen = listaTemp[0].imagenArticulo;
        this.codigoBarra = listaTemp[0].sCodBarra;
        this.habilitarLotes(listaTemp[0].nIdControlLote);
        
        // this.formularioIngreso.controls.nombreArticulo.setValue(listaTemp[0].sDescripcion);
        return false;
      }
    }
    return false;
  }

  get validarPresupuesto() {
    if(this.formularioIngreso.get('presupuesto').touched) {
      const codigo = this.formularioIngreso.get('presupuesto').value;
      const listaTemp = this.listaPresupuesto.filter(option => option.nIdPresupuesto === codigo);
      
      if(listaTemp.length === 0){
        this.formularioIngreso.controls.presupuesto.setValue('');
        this.formularioIngreso.controls.cliente.setValue('');
        return true;
      }else {
        this.formularioIngreso.controls.cliente.setValue(listaTemp[0].sCliente);
        return false;
      }
    }
  }

  get empresaNoValido() {
    return this.formularioIngreso.get('empresa').invalid && this.formularioIngreso.get('empresa').touched;
  }

  get almacenNoValido() {
    return this.formularioIngreso.get('almacen').invalid && this.formularioIngreso.get('almacen').touched;
  }
  
  get codigoArticuloNoValido() {
    return this.formularioIngreso.get('codigoArticulo').invalid && this.formularioIngreso.get('codigoArticulo').touched;
  }

  get loteArticuloNoValido() {
    return this.formularioIngreso.get('loteArticulo').invalid && this.formularioIngreso.get('loteArticulo').touched;
  }

  get clienteNoValido() {
    return this.formularioIngreso.get('cliente').invalid && this.formularioIngreso.get('cliente').touched;
  }

  get cantidadNoValido() {
    return this.formularioIngreso.get('cantidad').invalid && this.formularioIngreso.get('cantidad').touched;
  }

  get fechaVencimientoNoValido() {
    return this.formularioIngreso.get('fechaVencimiento').invalid && this.formularioIngreso.get('fechaVencimiento').touched;
  }


  //  #region FormControls */
  get observacionField() {
    return this.formularioIngreso.get('observacion') as FormControl;
  }

  /* #region Mensajes de Error */
  get observacionError() {
    return this.observacionField.touched && this.observacionField.hasError('caracterValidator') ? this.observacionField.errors.caracterValidator : null;
  }

  caracterValidator(control: AbstractControl): ValidationErrors | null {
    const caracteres = /(\/|\|)$/i;
    const valid = caracteres.exec(control.value);
    return valid ? { caracterValidator: 'El texto no debe contener: "/" ni "|"' } : null;
  }

  

}
