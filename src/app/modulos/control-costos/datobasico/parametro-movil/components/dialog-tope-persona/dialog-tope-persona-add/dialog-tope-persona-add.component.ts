import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ParametroService } from '../../../../parametro.service';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
// import { Personal } from 'src/app/erp/controlcostos/centroCosto/centroCostos/Data';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { Personal } from 'src/app/modulos/control-costos/centroCosto/Models/centroCostos/ICentroCosto';
import { asistenciapAnimations } from '../../../../../../comercial/Asistencia/asistenciap/asistenciap.animations';

interface Estado {
  value: number;
  viewValue: string;
}

@Component({
  selector: 'app-dialog-tope-persona-add',
  templateUrl: './dialog-tope-persona-add.component.html',
  styleUrls: ['./dialog-tope-persona-add.component.css'],
  animations: [asistenciapAnimations]
})
export class DialogTopePersonaAddComponent implements OnInit {

  form: FormGroup;
  listaPersonal: any;
  listaPersonalTable: any;
  listaPersonalLocal: any;
  lista: any[];
  abLista = [];
  tsLista = 'inactive'; 
  fbLista = [
    {icon: 'save', tool: 'Crear'}
  ];
  noExistCargo: boolean;
  filteredNombrePersonal: Observable<Personal[]>;
  listEstados: Estado[] = [
    {value: 1, viewValue: 'Aplica'},
    {value: 0, viewValue: 'No aplica'},
  ];
  idEmp: any;


  constructor(private fb: FormBuilder, public diaglogRef: MatDialogRef<DialogTopePersonaAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any , private parametroMovilService: ParametroService, private spinner: NgxSpinnerService) {
      this.crearFormulario();
  }

  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }

  crearFormulario() {
    this.form = this.fb.group({
      dni: [, [Validators.required]],
      nombre: [ , [Validators.required]],
      mensual: [ , [Validators.required, Validators.min(1)]],
      diario: [, [Validators.required, Validators.min(1)]],
      aplica: [1 ,Validators.required],
      id: [, Validators.required]
    });
  }

  async agregarEmpleado() {
    const diario = this.form.get('diario').value;
    const mensual = this.form.get('mensual').value;
    if (this.form.invalid){
      await Swal.fire({
        icon: 'warning',
        title: 'Hay un error con los campos, por favor revise sus campos',
        showConfirmButton: false,
        timer: 1500
      });
      return Object.values(this.form.controls).forEach(control => {
        control.markAllAsTouched();
      });
    }
    if (this.noExistCargo) {
      await Swal.fire({
        icon: 'warning',
        title: 'El campo de cargo no existe, por favor seleccione uno de la lista',
        showConfirmButton: false,
        timer: 1500
      });
      return;
    }
    if (diario > mensual){
      await Swal.fire({
        icon: 'warning',
        title: 'El monto del tope diario no puede ser mayor al mensual',
        showConfirmButton: false,
        timer: 1500
      });
      return;
    }
    this.diaglogRef.close(this.form);
  }
  
  get montoDiario() {
    return this.form.get('diario').invalid && this.form.get('diario').touched;
  }
  get montoMensual() {
    return this.form.get('mensual').invalid && this.form.get('mensual').touched;
  }

  async ngOnInit() {
    // this.spinner.show();
    this.idEmp  = localStorage.getItem('Empresa');
    this.listaPersonal = await this.parametroMovilService.obtenerParametrosCRUD(2, `${this.idEmp}|`);
    this.listaPersonalTable = await this.parametroMovilService.obtenerParametrosCRUD(5,`${this.idEmp}`);
    this.quitarListaExistente();
    this.filteredNombrePersonal = this.form.controls['nombre'].valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.sDescripcion),
      map(sDescripcion => sDescripcion ? this._filterNombrePersonal(sDescripcion) : this.listaPersonal.slice() )
    );
    // this.spinner.hide();
  }

  quitarListaExistente() {
    this.listaPersonal.forEach((resp) => {
      const obj = this.listaPersonalTable.filter(item => item.dni === resp.sCodPartida);
      if ( obj.length > 0 ) {
        this.listaPersonal =  this.listaPersonal.filter(item => item.sCodPartida !== obj[0].dni);
      }
    });
  }


  private _filterNombrePersonal(descripcion: string) {
    const filterValue = descripcion.toLocaleLowerCase();
    return this.listaPersonal.filter(option => option.sDescripcion.toLocaleLowerCase().indexOf(filterValue) === 0);
  }

  async agregarPersonal() {
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
  }

  onNoClick(): void {
    this.diaglogRef.close();
  }

  save() {
    // this.parametroMovilService.insertOrUpdateParametrosMovil(2, param)
  }

  limpiarListaPersonal() {
    this.form.controls.dni.setValue('');
    this.form.controls.id.setValue('');
  }

  get empleadoNotFound() {
    // console.log('nombre',name);
    if ( this.form.get('nombre').touched) {
      let name = this.form.get('nombre').value;
      const listaTemp = this.listaPersonal.filter(option => option.sDescripcion === name);
      if( listaTemp.length === 0 ) {
        this.limpiarListaPersonal();
        // console.log(false);
        this.noExistCargo = true;
        return true;
      } else {
        this.form.controls.dni.setValue(listaTemp[0].sCodPartida);
        this.form.controls.id.setValue(listaTemp[0].nIdPartida);
        this.noExistCargo = false;
        return false;
      }
    }
    return false;
  }

}
