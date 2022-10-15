import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { asistenciapAnimations } from '../../../../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import { ParametroService } from '../../../../parametro.service';

interface Cliente {
  nId: number;
  ruc: string;
  sDescripcion: string;
}

@Component({
  selector: 'app-dialog-cuenta-cargo-cliente',
  templateUrl: './dialog-cuenta-cargo-cliente.component.html',
  styleUrls: ['./dialog-cuenta-cargo-cliente.component.css'],
  animations: [asistenciapAnimations]
})
export class DialogCuentaCargoClienteComponent implements OnInit {

  form: FormGroup;
  listaClientes: any;
  listaCargosCliente: any;
  nameButton: any;
  titulo = 'Editar';
  abLista = [];
  tsLista = 'inactive'; 
  fbLista = [
    {icon: 'save', tool: 'Crear'}
  ];
  filterCliente: Observable<Cliente[]>;
  constructor(private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogCuentaCargoClienteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private parametroService: ParametroService) { 
      this.crearFormulario();
    }

  async ngOnInit() {
    const pais = localStorage.getItem('Pais');
    this.listaClientes = await this.parametroService.obtenerParametrosCRUD(4, `${pais}|`);
    this.listaCargosCliente = await  this.parametroService.obtenerParametrosCRUD(7, `${this.data.nId}|`);
    this.quitarListaExistente();
    this.filterCliente = this.form.controls['cliente'].valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.sDescripcion ),
      map(sDescripcion => sDescripcion ? this._filterCliente(sDescripcion) : this.listaClientes.slice() )

    );
  }

  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }

  quitarListaExistente() {
    this.listaClientes.forEach((resp) => {
      const obj = this.listaCargosCliente.filter(item => item.ruc === resp.ruc);
      if ( obj.length > 0 ) {
        this.listaClientes = this.listaClientes.filter(item => item.ruc !== obj[0].ruc );
      }
    });
  }

  private _filterCliente(descripcion: string) {
    const filterValue = descripcion.toLocaleLowerCase();
    return this.listaClientes.filter(option => option.sDescripcion.toLocaleLowerCase().indexOf(filterValue) === 0 );
  }

  onNoClick() {
    this.dialogRef.close();
  }

  crearFormulario() {
    this.form = this.fb.group({
      idCliente: [ , Validators.required],
      cliente: [ , Validators.required],
      diario: [ , [Validators.required, Validators.min(1)]],
      mensual: [ , [Validators.required, Validators.min(1)]],
      idDepartment: [this.data.nId],
      ruc: [ ,]
    });
    this.nameButton = 'Agregar';
    this.titulo = 'Agregar';
    if( this.data.nIdDetMovCli ) {
      this.inicializarLista();
      this.nameButton = 'Guardar';
      this.titulo = 'Editar';
      console.log('existe al editar');
    }
  }

  inicializarLista() {
    this.form.reset({
      'idCliente': this.data.nId,
      'cliente': this.data.sDescripcion,
      'diario': this.data.diario,
      'mensual': this.data.mensual,
    });
  }

  limpiarCargo() {
    this.form.controls.idCliente.setValue('');
  }

  async agregarCliente() {
    console.log('presionando');
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
    if(diario > mensual){
      await Swal.fire({
        icon: 'warning',
        title: 'El monto del tope diario no puede ser mayor al mensual',
        showConfirmButton: false,
        timer: 1500
      });
      return;
    }
    this.dialogRef.close(this.form);
  }

  get clienteNotFound() {
    if ( this.form.get('cliente').touched ) {
      const name = this.form.get('cliente').value;
      const listaTemp = this.listaClientes.filter(option => option.sDescripcion === name);
      if ( listaTemp.length === 0 ) {
        this.limpiarCargo();
        return true;
      } else {
        this.form.controls.idCliente.setValue(listaTemp[0].nId);
        this.form.controls.ruc.setValue(listaTemp[0].ruc);
        // this.form.controls.codigo.setValue(listaTemp[0].sCodPartida);
        return false;
      }
    }
    return false;
  }

  get montoDiario() {
    return this.form.get('diario').invalid && this.form.get('diario').touched;
  }

  get montoMensual() {
    return this.form.get('mensual').invalid && this.form.get('mensual').touched;
  }

}
