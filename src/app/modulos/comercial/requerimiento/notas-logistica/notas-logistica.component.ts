import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from "@angular/router";
import { NgxSpinnerService } from 'ngx-spinner';
import { NotasLogisticaService } from './notas-logistica.service';

@Component({
  selector: 'app-notas-logistica',
  templateUrl: './notas-logistica.component.html',
  styleUrls: ['./notas-logistica.component.css']
})


export class NotasLogisticaComponent implements OnInit {

  url:string
  isDetalleView = false;
  listaTipoDocumento: any;
  form: FormGroup;
  nIdUsuario:number;

 
  //Tipo de Documento
  nTipoDocumento:number;
  sTipoDocumento:string;
  //Cantidad por Documento
  listaCantidadRequerimiento: any;
  nCantidadNS: any;
  nCantidadNU: any;
  nCantidadNR: any;
  nCantidadNT: any;
  nCantidadNI: any;

  constructor(
    private fb:FormBuilder, 
    public dialog: MatDialog, 
    private spinner: NgxSpinnerService,
    @Inject('BASE_URL') baseUrl: string, 
    private notasLogisticaService: NotasLogisticaService, 
    private router:Router) { 
    this.url = baseUrl;
    this.crearFormulario();
    
  }

  ngOnInit(): void {
    this.spinner.show();

    const user = localStorage.getItem('currentUser');
    this.nIdUsuario = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.fnTipoRequerimiento();

    this.obtenerCantidadRequerimiento();
    //Iniciar con Nota de Salida
    this.form.controls.tipo.setValue(1886);
    this.sTipoDocumento='NS'
    //
    
    this.spinner.hide();
  }

  public notaSalida() {
    this.router.navigateByUrl(
      "comercial/requerimiento/notasLogistica/notaSalida"
    );
  }

  async fnTipoRequerimiento(){
    const pParametro=[]
    pParametro.push(this.nIdUsuario)
    this.listaTipoDocumento = await this.notasLogisticaService.fnControlNotaLogistica(11,1,pParametro,this.url);
   
  }

  async cambioTipo(event) {
  this.nTipoDocumento=event;
    if(this.nTipoDocumento==1886){
      this.sTipoDocumento='NS'
    }
    else if(this.nTipoDocumento==1887){
      this.sTipoDocumento='NU'
    }
    else if(this.nTipoDocumento==1888){
      this.sTipoDocumento='NR'
    }
    else if(this.nTipoDocumento==1889){
      this.sTipoDocumento='NT'
    }
    else if(this.nTipoDocumento==2257){
      this.sTipoDocumento='NI'
    }
  

  }

  async obtenerCantidadRequerimiento() {
    //this.listaCantidadRequerimiento = await this.presupuestoService.listarDocumentosParaAprobacion(6, '');
    //this.nCantidadNS = this.listaCantidadRequerimiento.cantidadRE;

   /*  this.cantidadrs = this.listaCantidadRequerimiento.cantidadSCTR;
    this.cantidadrr = this.listaCantidadRequerimiento.cantidadRR; */

   
  }

  crearFormulario() {
    this.form = this.fb.group({
      tipo: [''],
      estado: ['']
    });
  }

  fnAbrirNota(event){
    if(event==0){      
      this.isDetalleView=true
    }
    else{
      this.isDetalleView=false
    }   
  }
    

}
