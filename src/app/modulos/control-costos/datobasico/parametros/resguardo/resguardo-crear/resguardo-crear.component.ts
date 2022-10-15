import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { asistenciapAnimations } from '../../../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import { PresupuestosService } from '../../../../presupuestos/presupuestos.service';
import { Ppto } from '../../resguardo/resguardo.component';

export interface EntityBase {
  pId: number;
  sDescripcion:string;
  sParametro: string;
}

@Component({
  selector: 'app-resguardo-crear',
  templateUrl: './resguardo-crear.component.html',
  styleUrls: ['./resguardo-crear.component.css'],
  animations: [asistenciapAnimations]
})
export class ResguardoCrearComponent implements OnInit {
  @Output() newEvent: EventEmitter<any>; // Para enviarle datos al Padre
  
  @Input() pPpto: Ppto;
  @Input() pOpcion: number; //variable para interaccion de pantallas

  filteredCentroCosto: Observable<EntityBase[]>;

  url: string;
  idUser :number; //id del usuario
  pNom:string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  vPptoAct: number = 0;

  presupuestoForm: FormGroup;
  habilitado: true;
  value: any;
  lCboCentroCosto = []
  abLista = [];
  tsLista = 'active'; 
  fbLista = [
    {icon: 'save', tool: 'Crear'},
    {icon: 'clear', tool: 'Cancelar'},
  ];

  constructor(
    private spinner: NgxSpinnerService,
    private vPresupuestosService: PresupuestosService, 
    private formBuilder: FormBuilder,
    @Inject('BASE_URL') baseUrl: string,) 
    { this.url = baseUrl; this.newEvent = new EventEmitter(); }

  ngOnInit(): void {
    let user    = localStorage.getItem('currentUser'); 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid; 
    this.pNom   = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp  = localStorage.getItem('Empresa'); 
    this.pPais  = localStorage.getItem('Pais');  
    this.onToggleFab(1,-1);
    this.presupuestoForm = this.formBuilder.group({
      txtPresupuesto: [],
      nId_Presupuesto:[''],
      txtCliente: ['',Validators.required],
      txtDirector: [''],
      txtEjecutivo: [''],
      txtServicio: [''],
      txtEstado: [''],
      txtMoneda: [''],
      txtResguardo: ['',Validators.required]
    })

    if (this.pOpcion == 1) { 
      this.fnObtenerData(this.pPpto); //Esta mostrando un ppto seleccionado
      this.habilitado = true
    }else{
      this.fnNuevo()    
    }

    this.fnController()
  }

  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }


  async fnController() {
    let pParametro= [];
    pParametro.push(this.idEmp);
    pParametro.push(2034);
    
    //Metodo que devuelve la lista de busqueda sensitiva para Cetro de Costo
    this.value = await this.vPresupuestosService.fnPresupuesto2(2, 2, pParametro, 2, this.url); 
    this.lCboCentroCosto = this.value;   
    this.filteredCentroCosto = this.presupuestoForm.get("txtPresupuesto").valueChanges
    .pipe( 
      startWith(''),
      map(cli => cli ? this._filterCentroCosto(cli) :  this.lCboCentroCosto.slice() )
    );
    
  } 

  private _filterCentroCosto(value: string): any[] {
    const filterValue = value.toLowerCase(); 
    return this.lCboCentroCosto.filter(
      cli => cli.sDescripcion.toLowerCase().includes(filterValue) //=== 0 
      );
  }

  get CentroCostoNotFound() {
    let name = this.presupuestoForm.get('txtPresupuesto').value;
    if (this.presupuestoForm.get('txtPresupuesto').touched) {
      const listaTemp = this.lCboCentroCosto.filter(option => option.sDescripcion === name );
      if ( listaTemp.length === 0 ) {
        this.presupuestoForm.controls.nId_Presupuesto.setValue(''); 
        this.presupuestoForm.controls.txtCliente.setValue(''); 
        this.presupuestoForm.controls.txtDirector.setValue(''); 
        this.presupuestoForm.controls.txtResguardo.setValue(''); 
        this.presupuestoForm.controls.txtEjecutivo.setValue(''); 
        this.presupuestoForm.controls.txtEstado.setValue(''); 
        this.presupuestoForm.controls.txtMoneda.setValue(''); 
        this.presupuestoForm.controls.txtServicio.setValue(''); 

        this.vPptoAct = 0;
        return true;
      } else {
        this.presupuestoForm.controls.nId_Presupuesto.setValue(listaTemp[0].nId);  
        //console.log(listaTemp[0].nId);
        this.vPptoAct = listaTemp[0].nId;
        return false;
      }
    }
    return false;
  }

  fnObtenerData = function(vPpto: any){
    this.spinner.show('spiDialog')    
    // Traemos todos los datos de la cabecera de la factura
    var pParametro = []; 
    pParametro.push(vPpto);
    
    this.vPresupuestosService.fnMargenGeneral(1, 2, pParametro, 2, this.url).subscribe(
          res => {
            //Mostrar en formulario 
            this.fnCargarControles(res)
            this.spinner.hide('spiDialog');
        },
        err => {
            this.spinner.hide('spiDialog');
            console.log(err);
        },
        () => {
            this.spinner.hide('spiDialog');
        }
    );
    this.spinner.hide('spiDialog')  

  }  

  fnNuevo = function(){
    this.habilitado = false
    this.presupuestoForm.controls.txtPresupuesto.setValue('');   
    this.presupuestoForm.controls.txtCliente.setValue('')
    this.presupuestoForm.controls.txtServicio.setValue('')
    this.presupuestoForm.controls.txtDirector.setValue('')
    this.presupuestoForm.controls.txtEjecutivo.setValue('')
    this.presupuestoForm.controls.txtEstado.setValue('')
    this.presupuestoForm.controls.txtMoneda.setValue('')
    this.presupuestoForm.controls.txtResguardo.setValue('')
  }

  fnCargarControles = function(res){
    this.vPpto = res[0].nIdCentroCosto
    this.vPptoAct = res[0].nIdCentroCosto 
    this.presupuestoForm.controls.txtPresupuesto.setValue(res[0].sPresupuesto)
    this.presupuestoForm.controls.txtCliente.setValue(res[0].sCliente)
    this.presupuestoForm.controls.txtServicio.setValue(res[0].sServicio)
    this.presupuestoForm.controls.txtDirector.setValue(res[0].sDirector)
    this.presupuestoForm.controls.txtEjecutivo.setValue(res[0].sEjecutivo)
    this.presupuestoForm.controls.txtEstado.setValue(res[0].sEstado)
    this.presupuestoForm.controls.txtMoneda.setValue(res[0].sMoneda)
    this.presupuestoForm.controls.txtResguardo.setValue(res[0].nResguardoGeneral==0 ? '': res[0].nResguardoGeneral)
  }

  fnSalir = function(){
    this.newEvent.emit(1);
  }

  fnActualizar = function(){
    var pParametro  = []; 
    let vPorcentaje = this.presupuestoForm.value.txtResguardo 

    if(this.vPptoAct == 0)
    {
      Swal.fire('¡Verificar!','Debe buscar el presupuesto para asignar el nuevo porcentaje de resguardo general','warning')
      return;  
    }

    if (this.presupuestoForm.invalid) { 
      Swal.fire('¡Verificar!','Debe buscar los datos del presupuesto e indicar un porcentaje de resguardo.','warning')
      return;  
    }

    if (vPorcentaje > 100 || vPorcentaje < 0) { 
      Swal.fire('¡Verificar!','El porcentaje de resguardo debe estar comprendido entre (0 - 100).','warning')
      return;  
    }


    if (vPorcentaje == 0) { 
      Swal.fire({
        title: '¡Atencion!',
        text: "El porcentaje de resguardo es cero, significa que no aplicara ningun resguardo general a este presupuesto.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
        
          this.spinner.show('spiDialog')    
          pParametro.push(this.vPptoAct);
          pParametro.push(vPorcentaje);
          
          this.vPresupuestosService.fnMargenGeneral(1, 3, pParametro, 2, this.url).subscribe(
                res => {
                  if(res == 0)
                  {
                    Swal.fire('¡Verificar!','No cuenta con saldo suficiente para aplicar el porcentaje de resguardo general: '+vPorcentaje+', el presupuesto ya cuenta con registro de gastos','warning')
                    return;  
                  }
                  else
                  {
                    Swal.fire({
                      position: 'center',
                      icon: 'success',
                      title: 'Se actualizo el procentaje',
                      showConfirmButton: false,
                      timer: 1500
                    })

                  }

              },
              err => {
                  this.spinner.hide('spiDialog');
                  console.log(err);
              },
              () => {
                  this.spinner.hide('spiDialog');
              }
          );
        
        }
        
      })
    
    }
    else 
    {
      this.spinner.show('spiDialog')    
    
      pParametro.push(this.vPptoAct);
      pParametro.push(vPorcentaje);
      
      this.vPresupuestosService.fnMargenGeneral(1, 3, pParametro, 2, this.url).subscribe(
            res => {
              if(res == 0)
              {
                Swal.fire('¡Verificar!','No cuenta con saldo suficiente para aplicar el porcentaje de resguardo general: '+vPorcentaje+', el presupuesto ya cuenta con registro de gastos','warning')
                return;  
              }
              else
              {
                Swal.fire({
                  position: 'center',
                  icon: 'success',
                  title: 'Se actualizo el procentaje',
                  showConfirmButton: false,
                  timer: 1500
                })

              }

          },
          err => {
              this.spinner.hide('spiDialog');
              console.log(err);
          },
          () => {
              this.spinner.hide('spiDialog');
          }
      );
    
    }

  }

  fnValidarSaldo = function(){

    var pParametro = [];
    var vPorcentaje = this.presupuestoForm.value.txtResguardo 
    
    pParametro.push(this.pPpto);
    pParametro.push(vPorcentaje);
    console.log(pParametro)
    this.vPresupuestosService.fnMargenGeneral(1, 4, pParametro, 0, this.url).subscribe(
          res => {
            if(res < 0)
            {
              Swal.fire('¡Verificar!','No cuenta con saldo suficiente para aplicar el porcentaje de resguardo general: '+vPorcentaje+', el presupuesto ya cuenta con registro de gastos','warning')
              return;  
            }
            
            this.spinner.hide('spiDialog');
        },
        err => {
            this.spinner.hide('spiDialog');
            console.log(err);
        },
        () => {
            this.spinner.hide('spiDialog');
        }
    );

  }

  fnBuscarDatos = function(){
    if(this.vPptoAct != 0 && this.vPptoAct != undefined && !isNaN(this.vPptoAct) ){
      this.spinner.show('spiDialog')   
      this.fnObtenerData(this.vPptoAct)
      this.spinner.hide('spiDialog')   
    }
    else{
      Swal.fire('¡Verificar!','Debe buscar un presupuesto para traer sus datos','warning')
      return;  
    }
    

  }

  cambioPresupuesto(presupuesto) {
    const presu = this.lCboCentroCosto.filter(option => option.sDescripcion === presupuesto);
    if(presu.length > 0) {
      this.presupuestoForm.controls.nId_Presupuesto.setValue(presu[0].nId)
      this.vPptoAct = presu[0].nId;
    } else {
      this.vPptoAct = 0;
      
    }
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnActualizar();
        break;
      case 1:
        this.fnSalir();
        break;
      default:
        break;
    }
  }

}
