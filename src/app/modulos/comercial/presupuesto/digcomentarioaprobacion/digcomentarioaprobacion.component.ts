import { Component, OnInit, Injectable, Inject, ElementRef, ViewChild,ChangeDetectorRef  } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { SerPresupuestoService } from './../serpresupuesto.service';  
import { PersonalService } from './../../requerimiento/personal/personal.service';  
import { NgxSpinnerService } from 'ngx-spinner'; 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-digcomentarioaprobacion',
  templateUrl: './digcomentarioaprobacion.component.html',
  styleUrls: ['./digcomentarioaprobacion.component.css']
})
export class DigcomentarioaprobacionComponent implements OnInit {
  //#region declaracion variable del sistema
  id:number; 
  url: string;  
  pais: string; 
  Empresa:string;  
  //#endregion
  idPresupuesto:number; 
  perfil:number; 
  opcion:number; 
  historico:any;
  estado:string; 
  titulo:string; 
  
  local_data:any;

  divValPresupuesto : boolean = false; 
  divVal  : boolean = true; 

  
  PrimeraFormGroup: FormGroup;

  constructor(
    private spinner: NgxSpinnerService, 
    private vSerPresupuesto: SerPresupuestoService,
    private vPersonalService: PersonalService,
    public dialogRef: MatDialogRef<DigcomentarioaprobacionComponent>,
    private formBuilder: FormBuilder, 
    @Inject(MAT_DIALOG_DATA) public data: any,  
    @Inject('BASE_URL') baseUrl: string
    ) { 
      dialogRef.disableClose = true;
      this.url = baseUrl;  
      this.local_data = {...data}; 
      this.idPresupuesto = this.local_data.idPresupuesto;
      this.perfil = this.local_data.perfil;
    }

  ngOnInit(): void {  
    let lPresupuesto =  ['625','2278','2153'];
    
    if(this.perfil.toString() === '1'){ 
      this.divValPresupuesto = true;
      this.divVal = false;
      this.opcion = 11
      this.titulo = 'Requerimiento de Personal'
      this.fnBuscarComentariocomercial(10);  
    }
    else if(this.perfil.toString() === '0'){  
      this.titulo = 'Requerimiento de Personal'
      this.opcion = 11
      this.fnBuscarComentariocomercial(10);  
    }
    else if(lPresupuesto.includes(this.perfil.toString()) == true){ 
      this.titulo = 'Presupuesto'
      this.opcion = 13
      this.divValPresupuesto = true;
      this.divVal = false;
      this.fnBuscarComentario(14);
    } 
    else{
      this.titulo = 'Presupuesto'
      this.opcion = 13
      this.fnBuscarComentario(14); 
    }
    
    //#region llenado dato del sistema
    this.pais = localStorage.getItem('Pais'); 
    this.Empresa = localStorage.getItem('Empresa');
    const user = localStorage.getItem('currentUser');
    this.id = JSON.parse(window.atob(user.split('.')[1])).uid; 
    //#endregion

    this.PrimeraFormGroup = this.formBuilder.group({ 
      comentario: [{value: '', disabled: this.divVal} , Validators.required] 
    });

    
  }

  onNoClick(){  
    this.dialogRef.close({data: this.estado});
  }

  fnBuscarComentariocomercial(op){

    let paramentro = [];
    paramentro.push(this.idPresupuesto); 
    
    this.spinner.show('spi_lista'); 
    this.vPersonalService.fnRequerimientoPersonal(op, paramentro, this.url).then(
      (res) => { 
        this.historico=res;  
      },
      (err) => {
        console.log(err);
        this.spinner.hide('spi_lista');
      }, 
    );
    this.spinner.hide('spi_lista');
     
  }


  fnBuscarComentario(op){

    let paramentro = [];
    paramentro.push(this.idPresupuesto); 
    
    this.spinner.show('spi_lista'); 
    this.vSerPresupuesto.fnPresupuestoCrud(op, paramentro, this.url).subscribe(
      res => {  
        this.historico=res;  
      },
      err => {
        console.log(err);
        this.spinner.hide('spi_lista');
      },
      () => {
        this.spinner.hide('spi_lista');
      }
    );
    this.spinner.hide('spi_lista');
     
  }

  fnGuardarComentario(op){
    let paramentro = [];
    let vValidacionPri = this.PrimeraFormGroup.value;  
    
    paramentro.push(this.id);
    paramentro.push(this.idPresupuesto); 
    paramentro.push(vValidacionPri.comentario);
    paramentro.push(this.pais); 

    

    if(this.PrimeraFormGroup.invalid   ){  
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar el comentario' 
      });
    }  

    Swal.fire({
      title: '¿Desea devolver el '+this.titulo+'?', 
      showCancelButton: true,
      confirmButtonText: `Si`, 
      cancelButtonText: `No`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        if(this.perfil.toString() === '1'){ 
          this.divValPresupuesto = true;
          this.divVal = false;
          this.fnGuardarComentariocomercial(op,paramentro);  
        }
        else if(this.perfil.toString() === '0'){  
          this.fnGuardarComentariocomercial(op,paramentro);  
        }
        else{ 
          this.fnGuardar(op,paramentro);
        }
      } else{ 
      }
    }) 
  }


  async fnGuardarComentariocomercial(op, paramentro){
    this.spinner.show('spi_lista');
    await this.vPersonalService.fnRequerimientoPersonal(op, paramentro, this.url).then(
      (res: any) => {   
        let Result = res.cod.split("-");  
        this.estado = Result[1];
        this.fnBuscarComentariocomercial(10);  
      },
      (err) => {
        console.log(err);
        this.spinner.hide('spi_lista');
      }, 
    );
    this.spinner.hide('spi_lista');
  }
  fnGuardar(op, paramentro){
    this.spinner.show('spi_lista');
    this.vSerPresupuesto.fnPresupuestoCrud(op, paramentro, this.url).subscribe(
      res => {   
        let Result = res.cod.split("-");  
        this.estado = Result[1]
        this.fnBuscarComentario(14);
        

      },
      err => {
        console.log(err);
        this.spinner.hide('spi_lista');
      },
      () => {
        this.spinner.hide('spi_lista');
      }
    );
    this.spinner.hide('spi_lista');
  }

}
