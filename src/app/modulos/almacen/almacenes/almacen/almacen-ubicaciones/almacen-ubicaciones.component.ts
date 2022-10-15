import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { AlmacenesService } from '../../almacenes.service';
import { RegistrarAlmacenUbicacionComponent } from '../registrar-almacen-ubicacion/registrar-almacen-ubicacion.component';
import Swal from 'sweetalert2';
import { asistenciapAnimations } from '../../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import { CompraService } from '../../../../control-costos/compra/compra.service';
import { FilecontrolService } from '../../../../../shared/services/filecontrol.service';
import { HttpEventType } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';

interface ParametroRegistrarAlmacen {
  'idDireccion': number;
  'palabra': string;
  'isUpdate': number;
  'codigo': string;
  'codigoAnterior': string;
  'nombre': string;
  'tipo': number;
  'cantidadMaxima': number;
  'mensajeValidacion': string;
  'breadcrumb': string;
  'idUbicacion': string;
  'peso': number;
  'volumen': number;
}

interface CodigoQR {
  'imagen': string;
  'titulo': string;
}

@Component({
  selector: 'app-almacen-ubicaciones',
  templateUrl: './almacen-ubicaciones.component.html',
  styleUrls: ['./almacen-ubicaciones.component.css'],
  animations: [asistenciapAnimations],
  encapsulation: ViewEncapsulation.None
})
export class AlmacenUbicacionesComponent implements OnInit {
  abLista = [];
  tsLista = 'inactive';
  isEditar: boolean = true;
  fbLista = [
    { icon: 'save', tool: 'Crear' }
  ];
  listaAlmacenBase: any;
  listaDireccionAlmacenBase: any;
  listaPasillo: any;
  listaBloque: any;
  listaColumna: any;
  listaFila: any;
  listaPallet: any;
  listaExtras: any;
  idPais: any;
  idEmpresa: any;
  idDireccion: number;
  nombreAlmacenBase: string;
  form: FormGroup;
  idUser: any;
  listaAlmacenUsuario: any;
  listaAlmacenBaseUsuario: any;
  listaClientes: any;
  txtAlmacenBase = new FormControl();
  listaQR: CodigoQR[] = [];
  mostrarQR: boolean = false;
  urlImagen: string;
  url: string;

  bDialogUbicacionAbierto: boolean = false;

  constructor(
    private rutas: CompraService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    private vFilecontrolService: FilecontrolService,
    @Inject('BASE_URL') baseUrl: string,
    private almacenService: AlmacenesService,
    private fb: FormBuilder,
    public diaglogRef: MatDialogRef<AlmacenUbicacionesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.url = baseUrl;
  }

  async ngOnInit() {
    this.crearFormulario();
    let user = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.idPais = localStorage.getItem('Pais');
    this.idEmpresa = localStorage.getItem('Empresa');
    this.listaAlmacenBase = await this.almacenService.listarInformacionAlmacen(1, `${this.idPais}|0`);
    this.listaDireccionAlmacenBase = await this.almacenService.obtenemosInformacionDireccionDeLaEmpresa(1, `${this.idPais}`)
    this.listaClientes = await this.almacenService.obtenemosInformacionDireccionDeLaEmpresa(4, `${this.idPais}`);
    if (this.listaAlmacenBase.length > 0) {
      this.form.controls.idDireccion.setValue(this.listaAlmacenBase[0].nIdAlmacenBase);

      await this.cambioAlmacenBase()
    }

    this.onToggleFab(1, -1)

  }

  filtrarLista(listaAlmacenBaseUsuario: any[], listaAlmacenUsuario: any[]) {
    let lista: any[] = [];
    listaAlmacenUsuario.forEach(almacenUsuario => {
      let almacen = listaAlmacenBaseUsuario.filter(item => item.nIdDireccion === almacenUsuario.nIdDireccion);
      if (almacen.length > 0) {
        lista.push(almacen[0]);
      }
    })
    return lista;
  }

  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;

  }

  salir() {
    this.diaglogRef.close();
  }

  restarListaAlmacenBaseDeDireccion(listaAlmacenBase: any[], listaDirecciones: any[]) {
    let listaNuevaDirecciones: any[] = [];
    listaDirecciones.forEach(item => {
      const validar = this.listaAlmacenBase.filter(almacen => almacen.nIdDireccion === item.idDireccion);
      if (validar.length < 1) {
        listaNuevaDirecciones.push(item);
      }
    })
    return listaNuevaDirecciones;
  }

  async agregarDireccion() {
    // Este es del almacenBase
    const idDireccionBase = this.form.get('idDireccion').value;
    // Este es de la nueva dirección el que quiero agregar
    const idDireccionNew = this.form.get('addIdDireccion').value;
    // if( !idDireccionBase ){
    //   return Swal.fire({
    //     title: 'Seleccione un almacén base',
    //     icon: 'warning',
    //     timer: 1500
    //   });
    // }
    if (!idDireccionNew) {
      return Swal.fire({
        title: 'Seleccione una direccion para almacén base',
        icon: 'warning',
        timer: 1500
      });
    }
    const idEmpresa = this.idEmpresa;
    const resp = await this.almacenService.obtenemosInformacionDireccionDeLaEmpresa(2, `${idEmpresa}|${idDireccionNew}`);
    this.listaAlmacenBase = await this.almacenService.listarInformacionAlmacen(1, `${this.idPais}|0`);
    this.listaDireccionAlmacenBase = this.listaDireccionAlmacenBase.filter(item => item.idDireccion !== idDireccionNew);
    this.form.controls.idDireccion.setValue(null);
    this.form.controls.addIdDireccion.setValue(null);
    return Swal.fire({
      title: 'La dirección de almacén se agregó correctamente',
      icon: 'success',
      timer: 1500
    })
  }

  async vincularCliente() {
    let cliente = this.form.get('cliente').value === null ? 0 : this.form.get('cliente').value;
    let nIdAlmacenBase = this.form.get('idDireccion').value;
    const almacen = this.listaAlmacenBase.filter(item => item.nIdAlmacenBase === nIdAlmacenBase)[0];
    let almacenCliente = almacen.nIdCliente;
    if (almacenCliente === 0 && cliente === 0) {
      Swal.fire({
        title: 'Es obligatorio un cliente para vincularlo al almacén',
        icon: 'warning',
        timer: 1500
      })
      return;
    }
    this.spinner.show();
    const resp = await this.almacenService.obtenemosInformacionDireccionDeLaEmpresa(5, `${nIdAlmacenBase}|${cliente}`);
    this.spinner.hide();
    if (resp > 0) {
      this.listaAlmacenBase.map(almacen => {
        if (almacen.nIdAlmacenBase === nIdAlmacenBase) {
          almacen.nIdCliente = cliente
        }
        return almacen;
      })

      Swal.fire({
        title: 'El cliente se actuliazó correctamente',
        icon: 'warning',
        timer: 1500
      })
    }


  }

  crearFormulario() {
    this.form = this.fb.group({
      'idDireccion': [],
      'addIdDireccion': [null],
      'pasillo': [''],
      // 'idPasillo': [],
      'bloque': [''],
      // 'idBloque': [],
      'columna': [''],
      // 'idColumna': [],
      'codigo': [''],
      'fila': [''],
      // 'idFila': [],
      'pallet': [''],
      // 'idPallet': [],
      'extra': [''],
      'tipo': ["1"],
      'cliente': [null]
    });
  }

  async cambioAlmacenBase() {
    let almacenBase = this.form.get('idDireccion').value;
    const almacen = this.listaAlmacenBase.filter(item => item.nIdAlmacenBase === almacenBase)[0];
    this.form.controls.cliente.setValue(almacen.nIdCliente > 0 ? almacen.nIdCliente : null);
    this.idDireccion = this.obtenerIdDireccion();
    this.nombreAlmacenBase = almacen.sDesc;
    this.listaQR = [];
    this.form.controls.pasillo.setValue('');
    this.form.controls.bloque.setValue('');
    this.form.controls.columna.setValue('');
    this.form.controls.fila.setValue('');
    this.form.controls.pallet.setValue('');
    this.form.controls.codigo.setValue('');
    this.form.controls.extra.setValue('');
    this.limpiarListas();
    this.listaPasillo = await this.almacenService.obtenerInformacionUbicacionAlmacen(1, `${this.idDireccion}|`);
    this.listaExtras = await this.almacenService.obtenemosInformacionUbicacionExtra(1, `${this.idDireccion}|`);
  }

  async cambioPasillo(idPasillo) {
    const nIdDireccion = this.obtenerIdDireccion();
    this.listaQR = [];
    this.form.controls.bloque.setValue('');
    this.form.controls.columna.setValue('');
    this.form.controls.fila.setValue('');
    this.form.controls.pallet.setValue('');
    this.form.controls.codigo.setValue('');
    this.listaBloque = [];
    this.listaColumna = [];
    this.listaFila = [];
    this.listaPallet = [];

    this.listaBloque = await this.almacenService.obtenerInformacionUbicacionAlmacen(2, `${idPasillo}|${nIdDireccion}`);
  }

  async cambioBloque(idBloque) {
    const nIdDireccion = this.obtenerIdDireccion();
    this.listaQR = [];
    this.form.controls.columna.setValue('');
    this.form.controls.fila.setValue('');
    this.form.controls.pallet.setValue('');
    this.form.controls.codigo.setValue('');

    this.listaColumna = [];
    this.listaFila = [];
    this.listaPallet = [];
    this.listaColumna = await this.almacenService.obtenerInformacionUbicacionAlmacen(3, `${idBloque}|${nIdDireccion}`);
  }


  async cambioColumna(idColumna) {
    const nIdDireccion = this.obtenerIdDireccion();

    this.listaQR = [];
    this.form.controls.fila.setValue('');
    this.form.controls.pallet.setValue('');
    this.form.controls.codigo.setValue('');
    this.listaFila = [];
    this.listaPallet = [];
    this.listaFila = await this.almacenService.obtenerInformacionUbicacionAlmacen(4, `${idColumna}|${nIdDireccion}`);
  }

  async cambioFila(idFila) {
    const nIdDireccion = this.obtenerIdDireccion();
    this.listaQR = [];
    this.form.controls.pallet.setValue('');
    this.form.controls.codigo.setValue('');
    this.listaPallet = [];

    this.spinner.show();
    this.listaPallet = await this.almacenService.obtenerInformacionUbicacionAlmacen(5, `${idFila}|${nIdDireccion}`);
    // Cargar imagenes
    if (this.listaPallet.length > 0) {

      await this.llenarListaQR(this.listaPallet, 1);
    }
    this.spinner.hide();
  }

  async llenarListaQR(listaUbicacion, tipo: number): Promise<void> {
    for (const ubicacion of listaUbicacion) {
      let codigoQR: CodigoQR;
      let imagen: string;
      const idUbicacion = ubicacion.idUbicacion;
      const codigo = ubicacion.codigo;
      imagen = ubicacion.imagen;
      if (imagen === '') { // Si está vacío creará la imagen y actualizará en la bd para luego mostrarla
        imagen = await this.guardarCodigoQR(codigo, idUbicacion);
      }
      codigoQR = {
        titulo: codigo,
        imagen: imagen,
      };
      this.listaQR.push(codigoQR);
    }

  }

  async cambioPallet(idPallet) {
    this.form.controls.codigo.setValue(idPallet);
  }

  limpiarListas() {
    this.listaPasillo = [];
    this.listaBloque = [];
    this.listaColumna = [];
    this.listaFila = [];
    this.listaPallet = [];
  }



  agregarUbicacionExtra() {
    if (!this.idDireccion) {

      return Swal.fire({
        title: 'Por favor seleccione un almacen base',
        icon: 'warning',
      });
    }
    let body: ParametroRegistrarAlmacen;
    body = {
      idDireccion: this.idDireccion,
      palabra: 'Ubicación General ',
      isUpdate: 0,
      codigo: '',
      codigoAnterior: '',
      nombre: '',
      tipo: 0,
      cantidadMaxima: 6,
      mensajeValidacion: 'El código no puede estar vacío y máximo 6 caracteres',
      breadcrumb: '',
      idUbicacion: '',
      peso: 0,
      volumen: 0
    };
    this.bDialogUbicacionAbierto = true;
    const dialogRef = this.dialog.open(RegistrarAlmacenUbicacionComponent, {
      width: '100%',
      height: '40%',
      data: body,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(async result => {
      this.bDialogUbicacionAbierto = false;

      if (result) {
        const validar: any = await this.almacenService.validarExistenciaUbicacion(1, `${result.idDireccion}|${result.codigo}`);
        if (validar.cantidad >= 1) {
          return Swal.fire({
            title: 'La ubicación general que desea ingresar ya se encuentra registrado',
            icon: 'warning',
          });
        } else {
          const resp = await this.almacenService.obtenemosInformacionUbicacionExtra(2, `${result.idDireccion}|${result.codigo}|${result.nombre}`);
          let cuerpo = { idUbicacion: resp, codigo: result.codigo, nombre: result.nombre };
          this.listaExtras.push(cuerpo);
          return Swal.fire({
            title: 'La ubicación general se registró de manera exitosa',
            icon: 'success',
            timer: 1500
          })
        }
      }
    });
  }

  modificarUbicacionExtra() {
    if (!this.idDireccion) {
      return Swal.fire({
        title: 'Por favor seleccione un almacen base',
        icon: 'warning',
      });
    }
    const idExtra = this.form.get('extra').value;
    if (idExtra === '') {
      return Swal.fire({
        title: 'Por favor seleccione una ubicación general',
        icon: 'warning',
      });
    }

    const idUbicacion = this.listaExtras.filter(item => item.codigo === idExtra)[0].idUbicacion;
    const nombreExtra = this.listaExtras.filter(item => item.codigo === idExtra)[0].nombre;
    let body: ParametroRegistrarAlmacen;
    body = {
      idDireccion: this.idDireccion,
      palabra: 'Ubicación General ',
      isUpdate: 1,
      codigo: idExtra,
      codigoAnterior: idExtra,
      nombre: nombreExtra,
      tipo: 0,
      cantidadMaxima: 6,
      mensajeValidacion: 'El código no puede estar vacío y máximo 6 caracter',
      breadcrumb: '',
      idUbicacion: idUbicacion,
      peso: 0,
      volumen: 0
    };
    this.bDialogUbicacionAbierto = true;
    const dialogRef = this.dialog.open(RegistrarAlmacenUbicacionComponent, {
      width: '100%',
      height: '40%',
      data: body,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(async result => {
      this.bDialogUbicacionAbierto = false;
      if (result) {
        const resp = await this.almacenService
          .insertOrUpdateUbicacionAlmacen(12, `${idUbicacion}|${result.codigo}|${result.nombre}`);
        if (resp === 1) {
          // this.listaExtras = this.listaExtras.filter(item => item.idUbicacion !== idUbicacion);
          Swal.fire({
            title: 'La ubicacón se modifico correctamente',
            icon: 'success',
          });
          const idDireccion = this.obtenerIdDireccion();
          this.listaExtras = await this.almacenService.obtenemosInformacionUbicacionExtra(1, `${idDireccion}|`);
        } else {
          Swal.fire({
            title: 'Hubo un error, por favor comuniquese con sistema',
            icon: 'warning',
          });
        }

      }

    });
  }

  eliminarUbicacionExtra() {
    const idExtra = this.form.get('extra').value;
    if (idExtra === '') {
      return Swal.fire({
        title: 'Por favor seleccione una ubicación general',
        icon: 'warning',
      });
    }
    Swal.fire({
      title: '¿Desea Eliminar?',
      text: "Usted eliminará esta ubicación general",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const idUbicacionExtra = this.listaExtras.filter(item => item.codigo === idExtra)[0].idUbicacion;
        // const idUbicacionPasillo = this.listaPasillo.filter(item => item.codigo === codigoPasillo)[0].idUbicacion;
        // const resp = await this.almacenService.insertOrUpdateUbicacionAlmacen(11,`${idUbicacionPasillo}|`);
        const resp = await this.almacenService.insertOrUpdateUbicacionAlmacen(11, `${idUbicacionExtra}|`);

        if (resp === 1) {
          const idDireccion = this.obtenerIdDireccion();
          this.listaExtras = await this.almacenService.obtenemosInformacionUbicacionExtra(1, `${idDireccion}|`);

          Swal.fire({
            title: 'La ubicación general se eliminó satisfactoriamente',
            icon: 'success',
          });
        } else {
          Swal.fire({
            title: 'Hubo un error, por favor comuniquese con sistema',
            icon: 'warning',
          });
        }
      }
    })
  }

  agregarPasillo() {
    if (!this.idDireccion) {

      return Swal.fire({
        title: 'Por favor seleccione un almacen base',
        icon: 'warning',
      });
    }
    let body: ParametroRegistrarAlmacen;
    body = {
      idDireccion: this.idDireccion,
      palabra: 'Pasillo ',
      isUpdate: 0,
      codigo: '',
      codigoAnterior: '',
      nombre: '',
      tipo: 1,
      cantidadMaxima: 1,
      mensajeValidacion: 'El código no puede estar vacío y máximo 1 caracter',
      breadcrumb: `${this.nombreAlmacenBase}`,
      idUbicacion: '',
      peso: 0,
      volumen: 0
    };
    this.bDialogUbicacionAbierto = true;
    const dialogRef = this.dialog.open(RegistrarAlmacenUbicacionComponent, {
      width: '100%',
      height: '40%',
      data: body,
      autoFocus: false,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(async result => {
      this.bDialogUbicacionAbierto = false;

      if (result) {
        // const validar: any = await this.almacenService.validarExistenciaUbicacion(1,`${result.idDireccion}|${result.codigo}`);
        // if(validar.cantidad >= 1){
        //   return Swal.fire({
        //     title: 'El pasillo que desea ingresar ya se encuentra registrado',
        //     icon: 'warning',
        //     timer: 1500
        //   });
        // } else {

        // }
        const resp = await this.almacenService.insertOrUpdateUbicacionAlmacen(1, `${result.idDireccion}|${result.codigo}|${result.nombre}`);
        let cuerpo = { idUbicacion: resp, codigo: result.codigo, nombre: result.nombre };
        this.listaPasillo.push(cuerpo);
        return Swal.fire({
          title: 'El pasillo se registró de manera exitosa',
          icon: 'success',
          timer: 1500
        })

      }
    });
  }

  modificarPasillo() {
    if (!this.idDireccion) {

      return Swal.fire({
        title: 'Por favor seleccione un almacen base',
        icon: 'warning',
      });
    }
    const idPasillo = this.form.get('pasillo').value;
    if (idPasillo === '') {
      return Swal.fire({
        title: 'Por favor seleccione un pasillo',
        icon: 'warning',
      });
    }
    const idUbicacionForm = this.listaPasillo.filter(item => item.codigo === idPasillo)[0].idUbicacion;
    const nombrePasillo = this.listaPasillo.filter(item => item.codigo === idPasillo)[0].nombre;
    let body: ParametroRegistrarAlmacen;
    body = {
      idDireccion: this.idDireccion,
      palabra: 'Pasillo ',
      isUpdate: 1,
      codigo: idPasillo,
      codigoAnterior: idPasillo,
      nombre: nombrePasillo,
      tipo: 1,
      cantidadMaxima: 1,
      mensajeValidacion: 'El código no puede estar vacío y máximo 1 caracter',
      breadcrumb: `${this.nombreAlmacenBase}`,
      idUbicacion: '',
      peso: 0,
      volumen: 0
    };
    this.bDialogUbicacionAbierto = true;

    const dialogRef = this.dialog.open(RegistrarAlmacenUbicacionComponent, {
      width: '100%',
      height: '40%',
      data: body,
      autoFocus: false,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(async result => {
      this.bDialogUbicacionAbierto = false;

      if (result) {

        // const validar: any = await this.almacenService.validarExistenciaUbicacion(1,`${result.idDireccion}|${result.codigo}`);
        // if(validar.cantidad >= 1){
        //   return Swal.fire({
        //     title: 'El pasillo al que desea modificar ya existe',
        //     icon: 'warning',
        //     timer: 1500
        //   });
        // } else {


        // }
        const resp = await this.almacenService.insertOrUpdateUbicacionAlmacen(6, `${result.idDireccion}|${idPasillo}|${result.nombre}|${result.codigo}`);
        if (resp !== 0) {
          // await this.cambioPasillo(result.codigo);
          const almacenBase = this.obtenerIdDireccion();
          this.form.controls.pasillo.setValue('');
          this.form.controls.bloque.setValue('');
          this.form.controls.columna.setValue('');
          this.form.controls.fila.setValue('');
          this.form.controls.pallet.setValue('');
          this.form.controls.codigo.setValue('');
          this.listaBloque = [];
          this.listaColumna = [];
          this.listaFila = [];
          this.listaPallet = [];
          this.listaPasillo = await this.almacenService.obtenerInformacionUbicacionAlmacen(1, `${almacenBase}|`);
          return Swal.fire({
            title: 'El pasillo se modificó correctamente',
            icon: 'success',
            timer: 1500
          })
        }
      }
    });
  }

  async eliminarPasillo() {
    const codigoPasillo = this.form.get('pasillo').value;
    if (codigoPasillo === '') {
      return Swal.fire({
        title: 'Por favor seleccione un pasillo',
        icon: 'warning',
      });
    }
    const cantidadListaBloquePasillo: number = this.listaBloque.length;
    if (cantidadListaBloquePasillo >= 1) {
      return Swal.fire({
        title: 'No puede eliminar el pasillo',
        text: 'Usted tiene bloques dentro del pasillo, por favor elimínelos y luego intente nuevamente',
        icon: 'warning',
      });
    }
    Swal.fire({
      title: '¿Desea Eliminar?',
      text: "Usted eliminará este pasillo",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const idUbicacionPasillo = this.listaPasillo.filter(item => item.codigo === codigoPasillo)[0].idUbicacion;
        const resp = await this.almacenService.insertOrUpdateUbicacionAlmacen(11, `${idUbicacionPasillo}|`);
        if (resp === 1) {
          const almacenBase = this.obtenerIdDireccion();
          // this.listaPasillo = this.listaPasillo.filter(item => item.codigo !== codigoPasillo);
          this.listaPasillo = await this.almacenService.obtenerInformacionUbicacionAlmacen(1, `${almacenBase}|`);
          this.form.controls.bloque.setValue('');
          this.form.controls.columna.setValue('');
          this.form.controls.fila.setValue('');
          this.form.controls.pallet.setValue('');
          this.form.controls.codigo.setValue('');
          this.listaBloque = [];
          this.listaColumna = [];
          this.listaFila = [];
          this.listaPallet = [];
          Swal.fire({
            title: 'El pasillo se eliminó satisfactoriamente',
            icon: 'success',
          });
        } else {
          Swal.fire({
            title: 'Hubo un error, por favor comuniquese con sistema',
            icon: 'warning',
          });
        }
      }
    })


  }

  agregarBloque() {
    const codigoPasillo = this.form.get('pasillo').value;
    if (codigoPasillo === '') {
      return Swal.fire({
        title: 'Por favor seleccione un pasillo',
        icon: 'warning',
      });
    }
    const nombrePasillo = this.listaPasillo.filter(item => item.codigo === codigoPasillo)[0].nombre;
    let body: ParametroRegistrarAlmacen;
    body = {
      idDireccion: this.idDireccion,
      palabra: `Bloque ${codigoPasillo}`,
      isUpdate: 0,
      codigo: '',
      codigoAnterior: codigoPasillo,
      nombre: '',
      tipo: 2,
      cantidadMaxima: 1,
      mensajeValidacion: 'El código no puede estar vacío y máximo 1 caracter',
      breadcrumb: `${this.nombreAlmacenBase} > ${nombrePasillo} `,
      idUbicacion: '',
      peso: 0,
      volumen: 0
    };
    this.bDialogUbicacionAbierto = true;
    const dialogRef = this.dialog.open(RegistrarAlmacenUbicacionComponent, {
      width: '100%',
      height: '40%',
      data: body,
      autoFocus: false,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(async result => {
      this.bDialogUbicacionAbierto = false;

      if (result) {
        const codigoBloque = `${codigoPasillo}${result.codigo}`;
        // const validar: any = await this.almacenService.validarExistenciaUbicacion(1,`${result.idDireccion}|${codigoBloque}`);
        // if(validar.cantidad >= 1 ) {
        //   return Swal.fire({
        //     title: 'El bloque que desea ingresar ya se encuentra registrado',
        //     icon: 'warning',
        //     timer: 1500
        //   });
        // } else{

        // }
        const resp = await this.almacenService.insertOrUpdateUbicacionAlmacen(2, `${result.idDireccion}|${codigoBloque}|${nombrePasillo}|${result.nombre}`);
        let cuerpo = { idUbicacion: resp, codigo: codigoBloque, nombre: result.nombre };
        this.listaBloque.push(cuerpo);
        return Swal.fire({
          title: 'El bloque se registró de manera exitosa',
          icon: 'success',
          timer: 1500
        })

      }
    });
  }

  modificarBloque() {
    if (!this.idDireccion) {

      return Swal.fire({
        title: 'Por favor seleccione un almacen base',
        icon: 'warning',
      });
    }
    const idPasillo = this.form.get('pasillo').value;
    if (idPasillo === '') {
      return Swal.fire({
        title: 'Por favor seleccione un pasillo',
        icon: 'warning',
      });
    }
    const idBloque = this.form.get('bloque').value;
    if (idBloque === '') {
      return Swal.fire({
        title: 'Por favor seleccione un bloque',
        icon: 'warning'
      });
    }

    const nombreBloque = this.listaBloque.filter(item => item.codigo === idBloque)[0].nombre;
    const nombrePasillo = this.listaPasillo.filter(item => item.codigo === idPasillo)[0].nombre;
    let body: ParametroRegistrarAlmacen;
    body = {
      idDireccion: this.idDireccion,
      palabra: 'Bloque ' + idPasillo,
      isUpdate: 1,
      codigo: idBloque.substr(1),
      codigoAnterior: idPasillo,
      nombre: nombreBloque,
      tipo: 2,
      cantidadMaxima: 1,
      mensajeValidacion: 'El código no puede estar vacío y máximo 1 caracter',
      breadcrumb: ` ${this.nombreAlmacenBase} > ${nombrePasillo}`,
      idUbicacion: '',
      peso: 0,
      volumen: 0
    };
    this.bDialogUbicacionAbierto = true;
    const dialogRef = this.dialog.open(RegistrarAlmacenUbicacionComponent, {
      width: '100%',
      height: '40%',
      data: body,
      autoFocus: false,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(async result => {
      this.bDialogUbicacionAbierto = true;

      if (result) {
        const codigoBloque = `${idPasillo}${result.codigo}`;
        const resp = await this.almacenService.insertOrUpdateUbicacionAlmacen(7, `${result.idDireccion}|${idBloque}|${result.nombre}|${codigoBloque}`);
        if (resp !== 0) {
          const idDireccion = this.obtenerIdDireccion();
          this.form.controls.bloque.setValue('');
          this.form.controls.columna.setValue('');
          this.form.controls.fila.setValue('');
          this.form.controls.pallet.setValue('');
          this.form.controls.codigo.setValue('');
          this.listaColumna = [];
          this.listaFila = [];
          this.listaPallet = [];
          this.listaBloque = await this.almacenService.obtenerInformacionUbicacionAlmacen(2, `${idPasillo}|${idDireccion}`);
          return Swal.fire({
            title: 'El bloque se modificó correctamente',
            icon: 'success',
            timer: 1500
          })
        }
      }
    });
  }

  async eliminarBloque() {
    const codigoBloque = this.form.get('bloque').value;
    if (codigoBloque === '') {
      return Swal.fire({
        title: 'Por favor seleccione un bloque',
        icon: 'warning',
      });
    }
    const cantidadListaBloqueColumna: number = this.listaColumna.length;
    if (cantidadListaBloqueColumna >= 1) {
      return Swal.fire({
        title: 'No puede eliminar el bloque',
        text: 'Usted tiene columnas dentro del bloque, por favor elimínelos y luego intente nuevamente',
        icon: 'warning',
      });
    }

    Swal.fire({
      title: '¿Desea Elminar?',
      text: "Usted eliminará el bloque",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const idUbicacionBloque = this.listaBloque.filter(item => item.codigo === codigoBloque)[0].idUbicacion;
        const resp = await this.almacenService.insertOrUpdateUbicacionAlmacen(11, `${idUbicacionBloque}|`);
        if (resp === 1) {
          // this.listaBloque = this.listaBloque.filter(item => item.codigo !== codigoBloque);
          const almacenBase = this.obtenerIdDireccion();
          const idPasillo = this.form.get('pasillo').value;
          this.form.controls.bloque.setValue('');
          this.form.controls.columna.setValue('');
          this.form.controls.fila.setValue('');
          this.form.controls.pallet.setValue('');
          this.form.controls.codigo.setValue('');
          this.listaColumna = [];
          this.listaFila = [];
          this.listaPallet = [];
          this.listaBloque = await this.almacenService.obtenerInformacionUbicacionAlmacen(2, `${idPasillo}|${almacenBase}`);
          Swal.fire({
            title: 'El bloque se eliminó satisfactoriamente',
            icon: 'success',
          });
        } else {
          Swal.fire({
            title: 'Hubo un error, por favor comuniquese con sistema',
            icon: 'warning',
          });
        }
      }
    })


  }

  agregarColumna() {
    const codigoPasillo = this.form.get('pasillo').value;
    const codigoBloque = this.form.get('bloque').value;
    if (codigoBloque === '') {
      return Swal.fire({
        title: 'Por favor seleccione un bloque',
        icon: 'warning',
      });
    }
    const nombrePasillo = this.listaPasillo.filter(item => item.codigo === codigoPasillo)[0].nombre;
    const nombreBloque = this.listaBloque.filter(item => item.codigo === codigoBloque)[0].nombre;

    let body: ParametroRegistrarAlmacen;
    body = {
      idDireccion: this.idDireccion,
      palabra: `Columna `,
      isUpdate: 0,
      codigo: '',
      codigoAnterior: codigoBloque,
      nombre: '',
      tipo: 3,
      cantidadMaxima: 2,
      mensajeValidacion: 'El código no puede estar vacío y máximo 2 caracteres',
      breadcrumb: `${this.nombreAlmacenBase} > ${nombrePasillo}  > ${nombreBloque}`,
      idUbicacion: '',
      peso: 0,
      volumen: 0
    };
    this.bDialogUbicacionAbierto = true;
    debugger;
    const dialogRef = this.dialog.open(RegistrarAlmacenUbicacionComponent, {
      width: '100%',
      height: '40%',
      data: body,
      autoFocus: false,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(async result => {
      this.bDialogUbicacionAbierto = false;

      if (result) {
        const codigoColumna = `${codigoBloque}${result.codigo}`;
        const cadena = `${result.idDireccion}|${codigoColumna}|${nombrePasillo}|${nombreBloque}|${result.nombre}`;
        const resp = await this.almacenService.insertOrUpdateUbicacionAlmacen(3, cadena);
        let cuerpo = { idUbicacion: resp, codigo: codigoColumna, nombre: result.nombre };
        this.listaColumna.push(cuerpo);
        return Swal.fire({
          title: 'La columna se registró de manera exitosa',
          icon: 'success',
          timer: 1500
        })

      }
    });
  }

  modificarColumna() {
    if (!this.idDireccion) {

      return Swal.fire({
        title: 'Por favor seleccione un almacen base',
        icon: 'warning',
      });
    }
    const idPasillo = this.form.get('pasillo').value;
    const idBloque = this.form.get('bloque').value;
    const idColumna = this.form.get('columna').value;
    if (idColumna === '') {
      return Swal.fire({
        title: 'Por favor seleccione una columna',
        icon: 'warning'
      });
    }
    const nombrePasillo = this.listaPasillo.filter(item => item.codigo === idPasillo)[0].nombre;
    const nombreBloque = this.listaBloque.filter(item => item.codigo === idBloque)[0].nombre;
    const nombreColumna = this.listaColumna.filter(item => item.codigo === idColumna)[0].nombre;
    let body: ParametroRegistrarAlmacen;
    body = {
      idDireccion: this.idDireccion,
      palabra: 'Columna ',
      isUpdate: 1,
      codigo: idColumna.substr(2),
      codigoAnterior: idBloque,
      nombre: nombreColumna,
      tipo: 3,
      cantidadMaxima: 2,
      mensajeValidacion: 'El código no puede estar vacío y máximo 2 caracteres',
      breadcrumb: `${this.nombreAlmacenBase}  >  ${nombrePasillo}  >  ${nombreBloque}`,
      idUbicacion: '',
      peso: 0,
      volumen: 0
    };
    this.bDialogUbicacionAbierto = true;

    const dialogRef = this.dialog.open(RegistrarAlmacenUbicacionComponent, {
      width: '100%',
      height: '40%',
      data: body,
      autoFocus: false,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(async result => {
      this.bDialogUbicacionAbierto = false;

      if (result) {
        const codigoColumnaOld = this.form.get('columna').value;
        const codigoColumnaNew = `${this.form.get('bloque').value}${result.codigo}`;
        const cadena = `${result.idDireccion}|${codigoColumnaOld}|${result.nombre}|${codigoColumnaNew}`;
        const resp = await this.almacenService.insertOrUpdateUbicacionAlmacen(8, cadena);
        if (resp !== 0) {
          const almacenBase = this.obtenerIdDireccion();
          this.form.controls.columna.setValue('');
          this.form.controls.fila.setValue('');
          this.form.controls.pallet.setValue('');
          this.form.controls.codigo.setValue('');
          this.listaFila = [];
          this.listaPallet = [];
          this.listaColumna = await this.almacenService.obtenerInformacionUbicacionAlmacen(3, `${idBloque}|${almacenBase}`);
          return Swal.fire({
            title: 'El bloque se modificó correctamente',
            icon: 'success',
            timer: 1500
          })
        }
      }
    });
  }

  async eliminarColumna() {
    const codigoColumna = this.form.get('columna').value;
    if (codigoColumna === '') {
      return Swal.fire({
        title: 'Por favor seleccione un columna',
        icon: 'warning',
      });
    }
    const cantidadListaColumnaFila: number = this.listaFila.length;
    if (cantidadListaColumnaFila >= 1) {
      return Swal.fire({
        title: 'No puede eliminar el columna',
        text: 'Usted tiene filas dentro del columna, por favor elimínelos y luego intente nuevamente',
        icon: 'warning',
      });
    }
    Swal.fire({
      title: '¿Desea Eliminar?',
      text: "Usted eliminará la columna",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const idUbicacionColumna = this.listaColumna.filter(item => item.codigo === codigoColumna)[0].idUbicacion;
        const resp = await this.almacenService.insertOrUpdateUbicacionAlmacen(11, `${idUbicacionColumna}|`);
        if (resp === 1) {
          // this.listaColumna = this.listaColumna.filter(item => item.idUbicacion !== idUbicacionColumna);
          const almacenBase = this.obtenerIdDireccion();
          const idBloque = this.form.get('bloque').value;
          this.form.controls.columna.setValue('');
          this.form.controls.fila.setValue('');
          this.form.controls.pallet.setValue('');
          this.form.controls.codigo.setValue('');
          this.listaFila = [];
          this.listaPallet = [];
          this.listaColumna = await this.almacenService.obtenerInformacionUbicacionAlmacen(3, `${idBloque}|${almacenBase}`);
          Swal.fire({
            title: 'La columna se eliminó satisfactoriamente',
            icon: 'success',
          });
        } else {
          Swal.fire({
            title: 'Hubo un error, por favor comuniquese con sistema',
            icon: 'warning',
          });
        }
      }

    })

  }

  agregarFila() {
    const codigoPasillo = this.form.get('pasillo').value;
    const codigoBloque = this.form.get('bloque').value;
    const codigoColumna = this.form.get('columna').value;
    if (codigoColumna === '') {
      return Swal.fire({
        title: 'Por favor seleccione una columna',
        icon: 'warning',
      });
    }
    const nombrePasillo = this.listaPasillo.filter(item => item.codigo === codigoPasillo)[0].nombre;
    const nombreBloque = this.listaBloque.filter(item => item.codigo === codigoBloque)[0].nombre;
    const nombreColumna = this.listaColumna.filter(item => item.codigo === codigoColumna)[0].nombre;

    let body: ParametroRegistrarAlmacen;
    body = {
      idDireccion: this.idDireccion,
      palabra: `Fila `,
      isUpdate: 0,
      codigo: '',
      codigoAnterior: codigoColumna,
      nombre: '',
      tipo: 4,
      cantidadMaxima: 2,
      mensajeValidacion: 'El código no puede estar vacío y máximo 2 caracteres',
      breadcrumb: `${this.nombreAlmacenBase} > ${nombrePasillo} > ${nombreBloque} > ${nombreColumna}`,
      idUbicacion: '',
      peso: 0,
      volumen: 0
    };
    this.bDialogUbicacionAbierto = true;

    const dialogRef = this.dialog.open(RegistrarAlmacenUbicacionComponent, {
      width: '100%',
      height: '40%',
      data: body,
      autoFocus: false,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(async result => {
      this.bDialogUbicacionAbierto = false;

      if (result) {

        const codigoFila = `${codigoColumna}${result.codigo}`;
        // const validar: any = await this.almacenService.validarExistenciaUbicacion(1,`${result.idDireccion}|${codigoFila}`);
        // if(validar.cantidad >= 1) {
        //   return Swal.fire({
        //     title: 'La fila que desea ingresar ya se encuentra registrada',
        //     icon: 'warning',
        //   });
        // } else {

        // }
        const cadena = `${result.idDireccion}|${codigoFila}|${nombrePasillo}|${nombreBloque}|${nombreColumna}|${result.nombre}`;
        const resp = await this.almacenService.insertOrUpdateUbicacionAlmacen(4, cadena);
        let cuerpo = { idUbicacion: resp, codigo: codigoFila, nombre: result.nombre };
        this.listaFila.push(cuerpo);
        return Swal.fire({
          title: 'La fila se registró de manera exitosa',
          icon: 'success',
          timer: 1500
        })
      }
    });
  }

  modificarFila() {
    const idPasillo = this.form.get('pasillo').value;
    const idBloque = this.form.get('bloque').value;
    const idColumna = this.form.get('columna').value;
    const idFila = this.form.get('fila').value;
    if (idFila === '') {
      return Swal.fire({
        title: 'Por favor seleccione una fila',
        icon: 'warning'
      });
    }
    const nombrePasillo = this.listaPasillo.filter(item => item.codigo === idPasillo)[0].nombre;
    const nombreBloque = this.listaBloque.filter(item => item.codigo === idBloque)[0].nombre;
    const nombreColumna = this.listaColumna.filter(item => item.codigo === idColumna)[0].nombre;
    const nombreFila = this.listaFila.filter(item => item.codigo === idFila)[0].nombre;
    let body: ParametroRegistrarAlmacen;
    body = {
      idDireccion: this.idDireccion,
      palabra: 'Fila ',
      isUpdate: 1,
      codigo: idFila.substr(4),
      codigoAnterior: idColumna,
      nombre: nombreFila,
      tipo: 4,
      cantidadMaxima: 2,
      mensajeValidacion: 'El código no puede estar vacío y máximo 2 caracter',
      breadcrumb: `${this.nombreAlmacenBase} > ${nombrePasillo} > ${nombreBloque} > ${nombreColumna}  `,
      idUbicacion: '',
      peso: 0,
      volumen: 0
    };
    this.bDialogUbicacionAbierto = true;

    const dialogRef = this.dialog.open(RegistrarAlmacenUbicacionComponent, {
      width: '100%',
      height: '40%',
      data: body,
      autoFocus: false,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(async result => {
      this.bDialogUbicacionAbierto = false;

      if (result) {
        const codigoFilaOld = this.form.get('fila').value;
        const codigoFilaNew = `${this.form.get('columna').value}${result.codigo}`;
        const cadena = `${result.idDireccion}|${codigoFilaOld}|${result.nombre}|${codigoFilaNew}`;
        const resp = await this.almacenService.insertOrUpdateUbicacionAlmacen(9, cadena);
        if (resp !== 0) {
          const nIdDireccion = this.obtenerIdDireccion();
          this.form.controls.fila.setValue('');
          this.form.controls.pallet.setValue('');
          this.form.controls.codigo.setValue('');
          this.listaPallet = [];
          this.listaFila = await this.almacenService.obtenerInformacionUbicacionAlmacen(4, `${idColumna}|${nIdDireccion}`);
          return Swal.fire({
            title: 'La fila se modificó correctamente',
            icon: 'success',
            timer: 1500
          })
        }
      }
    });
  }

  async eliminarFila() {
    const codigoFila = this.form.get('fila').value;
    if (codigoFila === '') {
      return Swal.fire({
        title: 'Por favor seleccione un fila',
        icon: 'warning',
      });
    }
    const cantidadListaFilaPallet: number = this.listaPallet.length;
    if (cantidadListaFilaPallet >= 1) {
      return Swal.fire({
        title: 'No puede eliminar el fila',
        text: 'Usted tiene pallets dentro de la fila, por favor elimínelos y luego intente nuevamente',
        icon: 'warning',
      });
    }
    Swal.fire({
      title: '¿Desea Eliminar?',
      text: "Usted eliminará esta fila",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const idUbicacionFila = this.listaFila.filter(item => item.codigo === codigoFila)[0].idUbicacion;
        const resp = await this.almacenService.insertOrUpdateUbicacionAlmacen(11, `${idUbicacionFila}|`);
        if (resp === 1) {
          // this.listaFila = this.listaFila.filter(item => item.idUbicacion !== idUbicacionFila);
          const nIdDireccion = this.obtenerIdDireccion();
          const idColumna = this.form.get('columna').value;
          this.form.controls.fila.setValue('');
          this.form.controls.pallet.setValue('');
          this.form.controls.codigo.setValue('');
          this.listaPallet = [];
          this.listaFila = await this.almacenService.obtenerInformacionUbicacionAlmacen(4, `${idColumna}|${nIdDireccion}`);
          Swal.fire({
            title: 'La fila se eliminó satisfactoriamente',
            icon: 'success',
          });
        } else {
          Swal.fire({
            title: 'Hubo un error, por favor comuniquese con sistema',
            icon: 'warning',
          });
        }
      }

    })
  }

  agregarPallet() {
    const codigoPasillo = this.form.get('pasillo').value;
    const codigoBloque = this.form.get('bloque').value;
    const codigoColumna = this.form.get('columna').value;
    const codigoFila = this.form.get('fila').value;
    if (codigoFila === '') {
      return Swal.fire({
        title: 'Por favor seleccione una Fila',
        icon: 'warning',
      });
    }
    const nombrePasillo = this.listaPasillo.filter(item => item.codigo === codigoPasillo)[0].nombre;
    const nombreBloque = this.listaBloque.filter(item => item.codigo === codigoBloque)[0].nombre;
    const nombreColumna = this.listaColumna.filter(item => item.codigo === codigoColumna)[0].nombre;
    const nombreFila = this.listaFila.filter(item => item.codigo === codigoFila)[0].nombre;
    let body: ParametroRegistrarAlmacen;
    body = {
      idDireccion: this.idDireccion,
      palabra: `Pallet `,
      isUpdate: 0,
      codigo: '',
      codigoAnterior: codigoFila,
      nombre: '',
      tipo: 5,
      cantidadMaxima: 2,
      mensajeValidacion: 'El código no puede estar vacío y máximo 2 caracteres',
      breadcrumb: `${this.nombreAlmacenBase} > ${nombrePasillo} > ${nombreBloque} > ${nombreColumna} > ${nombreFila}`,
      idUbicacion: '',
      peso: 0,
      volumen: 0
    };
    this.bDialogUbicacionAbierto = true;

    const dialogRef = this.dialog.open(RegistrarAlmacenUbicacionComponent, {
      width: '100%',
      height: '40%',
      data: body,
      autoFocus: false,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(async result => {
      this.bDialogUbicacionAbierto = false;

      if (result) {
        const codigoPallet = `${codigoFila}${result.codigo}`;
        // const validar: any = await this.almacenService.validarExistenciaUbicacion(1,`${result.idDireccion}|${codigoPallet}`);
        // if(validar.cantidad >= 1) {
        //   return Swal.fire({
        //     title: 'El pallet que desea ingresar ya se encuentra registrado',
        //     icon: 'warning',
        //     timer: 1500
        //   });
        // } else {

        // }
        const cadena = `${result.idDireccion}|${codigoPallet}|${nombrePasillo}|${nombreBloque}|${nombreColumna}|${nombreFila}|${result.nombre}|${result.peso}|${result.volumen}`;
        const resp = await this.almacenService.insertOrUpdateUbicacionAlmacen(5, cadena);
        let cuerpo = { idUbicacion: resp, codigo: codigoPallet, nombre: result.nombre, peso: result.peso, volumen: result.volumen };
        this.listaPallet.push(cuerpo);
        return Swal.fire({
          title: 'El pallet se registró de manera exitosa',
          icon: 'success',
          timer: 1500
        })

      }
    });
  }

  modificarPallet() {
    const idPasillo = this.form.get('pasillo').value;
    const idBloque = this.form.get('bloque').value;
    const idColumna = this.form.get('columna').value;
    const idFila = this.form.get('fila').value;
    const idPallet = this.form.get('pallet').value;
    if (idPallet === '') {
      return Swal.fire({
        title: 'Por favor seleccione un pallet',
        icon: 'warning'
      });
    }
    const nombrePasillo = this.listaPasillo.filter(item => item.codigo === idPasillo)[0].nombre;
    const nombreBloque = this.listaBloque.filter(item => item.codigo === idBloque)[0].nombre;
    const nombreColumna = this.listaColumna.filter(item => item.codigo === idColumna)[0].nombre;
    const nombreFila = this.listaFila.filter(item => item.codigo === idFila)[0].nombre;
    const nombrePallet = this.listaPallet.filter(item => item.codigo === idPallet)[0].nombre;
    const idUbicacion = this.listaPallet.filter(item => item.codigo === idPallet)[0].idUbicacion;
    const peso = this.listaPallet.filter(item => item.codigo === idPallet)[0].peso;
    const volumen = this.listaPallet.filter(item => item.codigo === idPallet)[0].volumen;
    let body: ParametroRegistrarAlmacen;
    body = {
      idDireccion: this.idDireccion,
      palabra: 'Pallet ',
      isUpdate: 1,
      codigo: idPallet.substr(6),
      codigoAnterior: idFila,
      nombre: nombrePallet,
      tipo: 5,
      cantidadMaxima: 2,
      mensajeValidacion: 'El código no puede estar vacío y máximo 2 caracter',
      breadcrumb: `${this.nombreAlmacenBase} > ${nombrePasillo} > ${nombreBloque} > ${nombreColumna} > ${nombreFila}`,
      idUbicacion: idUbicacion,
      peso: peso,
      volumen: volumen
    };
    this.bDialogUbicacionAbierto = true;

    const dialogRef = this.dialog.open(RegistrarAlmacenUbicacionComponent, {
      width: '100%',
      height: '40%',
      data: body,
      autoFocus: false,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(async result => {
      this.bDialogUbicacionAbierto = false;

      if (result) {
        const codigoOldPallet = this.form.get('pallet').value;
        const codigoNewPallet = `${this.form.get('fila').value}${result.codigo}`
        const cadena = `${result.idDireccion}|${codigoOldPallet}|${result.nombre}|${codigoNewPallet}|${result.peso}|${result.volumen}`;
        const resp = await this.almacenService.insertOrUpdateUbicacionAlmacen(10, cadena);
        if (resp !== 0) {
          const nIdDireccion = this.obtenerIdDireccion();
          this.form.controls.codigo.setValue('');
          this.listaPallet = [];
          this.listaPallet = await this.almacenService.obtenerInformacionUbicacionAlmacen(5, `${idFila}|${nIdDireccion}`);
          return Swal.fire({
            title: 'El pallet se modificó correctamente',
            icon: 'success',
            timer: 1500
          })
        }
      }
    });
  }

  async eliminarPallet() {
    const codigoPallet = this.form.get('pallet').value;
    if (codigoPallet === '') {
      return Swal.fire({
        title: 'Por favor seleccione un pallet',
        icon: 'warning',
      });
    }
    const idUbicacionPallet = this.listaPallet.filter(item => item.codigo === codigoPallet)[0].idUbicacion;
    const validar: any = await this.almacenService.validarExistenciaUbicacion(2, `${idUbicacionPallet}`);
    if (validar.cantidad >= 1) {
      return Swal.fire({
        title: 'Este pallet contiene artículos, no puede eliminarse',
        icon: 'warning',
      });
    }
    Swal.fire({
      title: '¿Desea Eliminar?',
      text: "Usted eliminará el pallet",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const resp = await this.almacenService.insertOrUpdateUbicacionAlmacen(11, `${idUbicacionPallet}|`);
        if (resp === 1) {
          const nIdDireccion = this.obtenerIdDireccion();
          const idFila = this.form.get('fila').value;
          this.form.controls.codigo.setValue('');
          this.listaPallet = [];
          // this.listaPallet = this.listaPallet.filter(item => item.idUbicacion !== idUbicacionPallet);
          this.listaPallet = await this.almacenService.obtenerInformacionUbicacionAlmacen(5, `${idFila}|${nIdDireccion}`);
          Swal.fire({
            title: 'El pallet se eliminó satisfactoriamente',
            icon: 'success',
          });
        } else {
          Swal.fire({
            title: 'Hubo un error, por favor comuniquese con sistema',
            icon: 'warning',
          });
        }
      }
    })

  }

  async imprimirQR() {
    try {
      if (this.listaQR.length > 0) {
        this.printToCart(this.listaQR)
      } else {
        return Swal.fire({
          title: 'Por favor la ubicación tiene que contener pallets, verificar',
          icon: 'warning',
        });
      }



    } catch (error) {
    }
  }

  printToCart(listaImagen: CodigoQR[]) {
    let popupWinindow;
    popupWinindow = window.open('', '_blank', 'scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    if (listaImagen.length === 1) {
      popupWinindow.document.write(`
        '<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head>
          <body onload="window.print()">'
            <div>
              <div style='float: left;margin-right: 100px;text-align-last: center;'>
                <img src='${listaImagen[0].imagen}'  width='200px' heigth='200px'>
                <h1>${listaImagen[0].titulo}</h1>
              </div>
            </div>
          </body>
        '</html>'
      `);
    } else if (listaImagen.length === 2) {
      popupWinindow.document.write(`
        '<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head>
          <body onload="window.print()">'
            <div>
              <div style='float: left;margin-right: 100px;text-align-last: center;'>
                <img src='${listaImagen[0].imagen}'  width='200px' heigth='200px'>
                <h1>${listaImagen[0].titulo}</h1>
              </div>
              <div style='float: left;text-align-last: center;'>
                <img src='${listaImagen[1].imagen}' width='200px' heigth='200px'>
                <h1>${listaImagen[1].titulo}</h1>
              </div>
            </div>
          </body>
        '</html>'
      `);
    }

    popupWinindow.document.close();
  }



  async guardarCodigoQR(codigoUbicacion: string, idUbicacion: number): Promise<string> {
    let vValidacionDatos = codigoUbicacion; // Ubicación Pallet
    let urlAzure: string;
    const pParametro = [];
    const pEntidad = 3;
    const pOpcion = 0;
    const pTipo = 0;
    pParametro.push(vValidacionDatos);
    //Aquí obtenemos el qr en local
    const urlImagen = await this.rutas.fnDatosArticulo(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise();

    //Aquí subimos la url local a azure
    await this.vFilecontrolService.fnUploadFileIMG(null, urlImagen.url, 3, this.url).toPromise().then(
      (event) => {
        if (event.type === HttpEventType.UploadProgress) {
        } else if (event.type === HttpEventType.Response) {
          let res: any = event.body;
          if (res.filename) {
            urlAzure = res.filename // nos devuelve la ruta del contenedor de Azure ejemplo: https://luckyerp.blob.core.windows.net/
          }
        }
      },
      err => {
      },
    )
    const parametro = `${idUbicacion}|${urlAzure}`;
    const agregar = await this.almacenService.insertOrUpdateUbicacionAlmacen(13, parametro)
    return urlAzure;
  }

  async guardarCodigoQRAzure(urlMemoria: string): Promise<string> {
    let urlImagen;
    await this.vFilecontrolService.fnUploadFileIMG(null, urlMemoria, 3, this.url).toPromise().then((event) => {
      if (event.type === HttpEventType.UploadProgress) {
        // this.progreso = Math.round((event.loaded / event.total) * 100);
      } else if (event.type === HttpEventType.Response) {
        let res: any = event.body;
        if (res.filename) {
          urlImagen = res.filename // nos devuelve la ruta del contenedor de Azure ejemplo: https://luckyerp.blob.core.windows.net/

        }
      }
    })
    return urlImagen;
  }

  obtenerIdDireccion(): number {
    const idAlmacenBase = this.form.get('idDireccion').value;
    const idDireccion = this.listaAlmacenBase.filter(item => item.nIdAlmacenBase === idAlmacenBase)[0].nIdDireccion;
    return idDireccion;
  }

  async desactivarAlmacen() {
    this.spinner.show();
    const listaEstado: any = await this.almacenService.listaOpcionesAlmacen(3, '');
    const estado = listaEstado.filter(item => item.cEleNam === 'Inactivo')[0]; // ID DE DESACTIVAR
    const nIdAlmacenBase = this.form.get('idDireccion').value;
    const resp = await this.almacenService.obtenemosInformacionDireccionDeLaEmpresa(3, `${nIdAlmacenBase}|${estado.nEleCod}`);
    if (resp === 1) {
      this.listaAlmacenBase = await this.almacenService.listarInformacionAlmacen(1, `${this.idPais}|0`);
      this.listaDireccionAlmacenBase = await this.almacenService.obtenemosInformacionDireccionDeLaEmpresa(1, `${this.idPais}`)
      // this.listaDireccionAlmacenBase = this.restarListaAlmacenBaseDeDireccion(this.listaAlmacenBase,listaDirecciones as any[]);
      if (this.listaAlmacenBase.length > 0) {
        this.form.controls.idDireccion.setValue(this.listaAlmacenBase[0].nIdAlmacenBase);
        await this.cambioAlmacenBase()
      }
      Swal.fire({
        title: 'El almacén fue inactivado correctamente',
        icon: 'success',
        timer: 1500
      })
    } else {
      Swal.fire({
        title: 'Hubo un error, por favor comunicarse con sistemas',
        icon: 'warning',
      })
    }

    this.spinner.hide();
  }



}
