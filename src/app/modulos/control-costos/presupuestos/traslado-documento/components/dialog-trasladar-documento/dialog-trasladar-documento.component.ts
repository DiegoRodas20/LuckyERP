import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { TrasladoDocumentoService } from '../../../traslado-documento.service';
import { startWith, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { asistenciapAnimations } from '../../../../../comercial/Asistencia/asistenciap/asistenciap.animations';

interface Documento {
  nIdCentroCosto: number;
  sCodCC: string;
}
@Component({
  selector: 'app-dialog-trasladar-documento',
  templateUrl: './dialog-trasladar-documento.component.html',
  styleUrls: ['./dialog-trasladar-documento.component.css', '../../traslado-documento.component.css'],
  animations: [asistenciapAnimations]
})
export class DialogTrasladarDocumentoComponent implements OnInit {

  form: FormGroup;
  listaPresupuesto: any;
  abLista = [];
  tsLista = 'inactive'; 
  fbLista = [
    {icon: 'save', tool: 'Crear'}
  ];
  filteredDocumento: Observable<Documento>;
  disabledButton = true;
  datosPresupuestoNuevo: any;
  titulo: string;
  nIdEmpresa: string;
  oldPresupuesto: string;
  listaPresupuestoClienteDestino: any;
  constructor(private fb: FormBuilder,
    private trasladoService: TrasladoDocumentoService,
    public dialogRef: MatDialogRef<DialogTrasladarDocumentoComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {
        this.crearFormulario();
     }

  async ngOnInit() {
    this.titulo = this.data.titulo;
    this.nIdEmpresa = localStorage.getItem('Empresa');
    this.listaPresupuestoClienteDestino = await this.trasladoService.listarCabeceraDocumentos(7, `${this.nIdEmpresa}`);
    
    this.listaPresupuesto = await this.trasladoService.listarCabeceraDocumentos(3, '');
    this.listaPresupuesto = this.listaPresupuesto.filter(item => item.sCodCC !== this.data.data.sCodCC);
    // this.filteredDocumento = this.form.controls['presupuesto'].valueChanges.pipe(
    //   startWith(''),
    //   map(value => typeof value === 'string' ? value : value.sCodCC),
    //   map(sCodCC => sCodCC ? this._filterDocumento(sCodCC) : this.listaPresupuesto.slice())
    // );
    this.inicializarFormulario();
  }

  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }

  private _filterDocumento(sCodCC: string) {
    const filterValue = sCodCC.toLocaleLowerCase();
    return this.listaPresupuesto.filter(option => option.sCodCC.toLocaleLowerCase().indexOf(filterValue) === 0);
  }

  crearFormulario() {
    this.form = this.fb.group({
      total: [
        {value: '', disabled: true}, Validators.required],
      presupuesto: ['', Validators.required],
      documento: ['', Validators.required],
      oldDocumento: [''],
      oldNombre: [''],
      oldCliente: [''],
      oldEstado: [''],
      oldEjecutivo: [''],
      newNombre: [''],
      newCliente: [''],
      newEstado: [''],
      newEjecutivo: [''],
    });
  }

  inicializarFormulario() {
    this.oldPresupuesto = this.data.data.sCodCC;
    this.form.reset({
      total: Number(this.data.data.total).toFixed(2),
      oldDocumento: this.data.data.sCodCC + ' - ' + this.data.datosCabecera.sDesCC,
      oldNombre: this.data.datosCabecera.sDesCC,
      oldCliente: this.data.datosCabecera.sRazonSocial,
      oldEstado: this.data.datosCabecera.cEleNam,
      oldEjecutivo: this.data.data.nombreEjecutivo
    });
  }

  async trasladarDocumento() {
    const nuevoPresupuesto = this.form.get('presupuesto').value;
    const viejoPresupuesto = this.oldPresupuesto;
    const pres: string = this.form.get('presupuesto').value;
    const newNombre = this.form.get('newNombre').value;
    const newCliente = this.form.get('newCliente').value;
    const newEstado = this.form.get('newEstado').value;
    if((newNombre === null || newNombre === '') || (newCliente === null || newCliente === '') || (newEstado === null || newEstado === '')) {
      return Swal.fire({
        title: 'Los campos del presupuesto de destino son obligatorios',
        icon: 'warning',
        timer: 1500
      });
    }
    if(nuevoPresupuesto === viejoPresupuesto) {
      return Swal.fire({
        title: 'Los presupuesto de origen y destino no pueden ser iguales, por favor verificar',
        icon: 'warning',
        timer: 1500
      });
    }
    if(this.form.get('presupuesto').value) {
      if(this.form.get('newEstado').value === 'Cerrado') {
        return Swal.fire({
          title: 'El presupuesto de destino se encuentra cerrado',
          icon: 'warning',
          timer: 1500
        });
      }
      const user = localStorage.getItem('currentUser');
      const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
      const pPais = localStorage.getItem('Pais');
      const pEmpresa = localStorage.getItem('Empresa');
      const total = this.sumarPrecioDetalle();
      Swal.fire({
        title: '¿Está seguro de trasladar el documento?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, actualizar'
      }).then( async (result) => {
        if (result.isConfirmed) {
          const nuevoPresupuesto = this.form.get('presupuesto').value;
          const viejoPresupuesto = this.oldPresupuesto;
          const valor = this.listaPresupuesto.filter(item => item.sCodCC === this.form.get('presupuesto').value);
          const newNIdCentroCosto = valor[0].nIdCentroCosto;
          const cadenaPadre = `${this.data.data.nIdGastoCosto}|${this.data.data.sTipoDoc}|${newNIdCentroCosto}|${total}|${pPais}|${idUser}|${pEmpresa}|${nuevoPresupuesto}|${viejoPresupuesto}`;
          const cadenaDetalle = this.generarCadenaDetalle();
          const resp: any = await this.trasladoService.actualizarPresupuesto(1, cadenaPadre, cadenaDetalle);
          const codigoResp = resp.mensaje.toString().split('|')[0];
          const mensajeResp = resp.mensaje.toString().split('|')[1];
          if ( codigoResp === '0') {
            Swal.fire({
              title: mensajeResp,
              icon: 'warning'
            });
          } else {
            Swal.fire({
              title: mensajeResp,
              icon: 'success',
              timer: 1500
            });
            this.dialogRef.close(1);
          }
        }
      });
    } else {
      Swal.fire({
        title: 'Error, el presupuesto no existe',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        timer: 1500
      })
    }
    
  }

  sumarPrecioDetalle() {
    let total = 0;
    this.data.listaDetalle.forEach((data) => {
      total += data.nCantidad * data.nPrecio;
    });
    return total;
  }

  validarPresupuesto(event) {
    let documento = this.form.get('oldDocumento').value;
    if (event.length === 6 && event !== documento ) {
      this.disabledButton = false;
      
    } else {
      this.form.controls.newNombre.setValue('');
      this.form.controls.newCliente.setValue('');
      this.form.controls.newEstado.setValue('');
      this.disabledButton = true;
      
    }
  }

  async buscarDocumento() {
    let documento = this.form.get('presupuesto').value;
    if ( documento ) {
      this.datosPresupuestoNuevo = await this.trasladoService.listarCabeceraDocumentos(5, `${documento}`);
      if(this.datosPresupuestoNuevo.nIdCentroCostoDestino === 0) {
        return Swal.fire({
          icon: 'warning',
          title: 'El presupuesto no existe',
          timer: 1500
        });
      }
      this.form.controls.newNombre.setValue(this.datosPresupuestoNuevo.sDesCC);
      this.form.controls.newCliente.setValue(this.datosPresupuestoNuevo.sRazonSocial);
      this.form.controls.newEstado.setValue(this.datosPresupuestoNuevo.cEleNam);
      this.form.controls.newEjecutivo.setValue(this.datosPresupuestoNuevo.nombreEjecutivo);
    } else {
      await Swal.fire({
        icon: 'warning',
        title: 'El presupuesto no existe',
        timer: 1500
      });
      return;
    }
  }

  generarCadenaDetalle() {
    let mensaje = '';
    this.data.listaDetalle.forEach((data) => {
      mensaje += `${data.nIdCentroCosto}|${data.nIdSucursal}|${data.nIdPartida}|${data.nPrecio}|${data.nCantidad}/`;
    });
    return mensaje.substring(0, mensaje.length - 1);
  }

  get presupuesto() {
    return this.form.get('presupuesto').invalid && this.form.get('presupuesto').touched;
  }

  get documento() {
    return this.form.get('documento').invalid && this.form.get('documento').touched;
  }

}
