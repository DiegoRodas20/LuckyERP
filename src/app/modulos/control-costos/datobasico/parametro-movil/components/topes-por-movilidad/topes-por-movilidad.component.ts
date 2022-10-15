import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { ParametroService } from '../../../parametro.service';
import { asistenciapAnimations } from '../../../../../comercial/Asistencia/asistenciap/asistenciap.animations';

@Component({
  selector: 'app-topes-por-movilidad',
  templateUrl: './topes-por-movilidad.component.html',
  styleUrls: ['../../parametro-movil.component.css', './topes-por-movilidad.component.css'],
  animations: [asistenciapAnimations]
})
export class TopesPorMovilidadComponent implements OnInit, AfterViewInit {
  idUser: number;
  pPais: string;
  form: FormGroup;
  listParametro: any;
  isDisabled = true;
  abLista = [];
  tsLista = 'inactive'; 
  fbLista = [
    {icon: 'save', tool: 'Guardar'},
    {icon: 'clear', tool: 'Cancelar'},
  ];
  constructor(private fb: FormBuilder, private parametroService: ParametroService,private spinner: NgxSpinnerService) {
    this.crearFormulario();
  }
  ngAfterViewInit(): void {
    this.isDisabled = true;
  }

  async ngOnInit() {
    this.isDisabled = true;
    let user = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pPais = localStorage.getItem('Pais');
    this.spinner.show();
    this.listParametro = await this.parametroService.obtenerParametrosCRUD(1,'');
    this.spinner.hide();
    this.inicializarFormulario();
    // console.log(this.listParametro);
  }

  save() {
    console.log('save');
  }

  crearFormulario() {
    this.form = this.fb.group({
      form1: this.fb.group({
        item1: [''],
        item2: ['',[Validators.required, Validators.min(1), Validators.max(15)]],
        item3: ['',[Validators.required, Validators.min(1), Validators.max(30)]]
      }),
      form2: this.fb.group({
        item1: [''],
        item2: ['',[Validators.required, Validators.min(1), Validators.max(30)]]
      })
    });
    this.isDisabled= true;
  }

  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }

  inicializarFormulario() {
    this.form.reset({
      'form1': {
        'item1': '',
        'item2': this.listParametro.nParamDia1,
        'item3': this.listParametro.nParamDia2
      },
      'form2': {
        'item1': '',
        'item2': this.listParametro.nParamDia3
      }
    });
    this.isDisabled= true;
  }

  async modificarDatos() {
    // this.isDisabled = false;
    if(this.form.invalid){
      await Swal.fire({
        icon: 'warning',
        title: 'Hay un error con los días, por favor revise sus campos',
        showConfirmButton: false,
        timer: 1500
      });
      return Object.values(this.form.controls).forEach(control => {
        control.markAllAsTouched();
      })
    }
    const param = `${this.listParametro.nIdParam}|${this.form.get('form1.item2').value}|${this.form.get('form1.item3').value}|${this.form.get('form2.item2').value}|${this.idUser}|${this.pPais}`;
    this.spinner.show();
    await this.parametroService.insertOrUpdateParametrosMovil(3, param);
    this.spinner.hide();
    await Swal.fire({
      icon: 'success',
      title: 'Los parametros de actualizaron correctamente',
      showConfirmButton: false,
      timer: 1500
    });
  }

  async cancelarDatos() {
    this.spinner.show();
    this.listParametro = await this.parametroService.obtenerParametrosCRUD(1,'');
    this.inicializarFormulario();
    this.spinner.hide();
  }

  cancelar() {
    console.log(this.isDisabled);
    this.isDisabled = true;
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.modificarDatos();
        break;
      case 1:
        this.cancelarDatos();
        break;
      default:
        break;
    }
  }

  get form1Item2() {
    return this.form.get('form1.item2').invalid && this.form.get('form1.item2').touched;
  }

  get form1Item3() {
    return this.form.get('form1.item3').invalid && this.form.get('form1.item3').touched;
  }

  get form2Item2() {
    return this.form.get('form2.item2').invalid && this.form.get('form2.item2').touched;
  }

}
