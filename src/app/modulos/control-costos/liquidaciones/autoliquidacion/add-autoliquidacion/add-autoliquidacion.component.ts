import { Component, OnInit, Input, Inject, ViewChild, EventEmitter, Output } from '@angular/core';

import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';  
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';  
 
import { LiquidacionesService } from '../../liquidaciones.service';  
import { nsAutoLiquidacion } from '../../models/IAutoLiquidacion.model';   
import { saveAs } from 'file-saver';
import { comercialAnimations } from '../../../../comercial/Animations/comercial.animations';  
import moment from 'moment';

@Component({
  selector: 'app-add-autoliquidacion',
  templateUrl: './add-autoliquidacion.component.html',
  styleUrls: ['./add-autoliquidacion.component.css'], 
  animations: [ comercialAnimations] 
})
export class AddAutoliquidacionComponent implements OnInit { 
  sPais : string; 
  uid: number  ;
  nIdEmp:string;  
  url: string;
 

  //#region input and output
  @Input() pAutoL: any;

  @Output()
  enviar: EventEmitter<string> = new EventEmitter<string>();
  //#endregion

  
  //#region Input Combo
  lblanio: nsAutoLiquidacion.I_anio[] = []; 
  lblmes: nsAutoLiquidacion.I_mes[] = [];  
  lblquin: nsAutoLiquidacion.I_quincena[] = []; 
  lblestado: nsAutoLiquidacion.I_Opcion[] = [];  
  //#endregion
 
  //#region Formulario
  fgBusqueda: FormGroup; 
  //#endregion

   //#region  tabla lista de presupuesto  
   dataSourceAL: MatTableDataSource<any>;
   displayedColumnsAL: string[] = [
     'plla','nroDoc','nombreCompleto','dias','importe' ,'estado'  ]; 
   @ViewChild('TableALSort') tableALSort: MatSort; 
   //#endregion

  abLista = [];
  tsLista = 'inactive'; 
  fbLista = [
    {icon: 'exit_to_app ', tool: 'Cancelar'},
    {icon: 'search', tool: 'Buscar'}, 
    {icon: 'bug_report', tool: 'Error'},
    {icon: 'extension', tool: 'Exportar'},
    {icon: 'local_atm', tool: 'AutoLiquidar'}
  ];
 

  constructor(
    private spinner: NgxSpinnerService, 
    @Inject('BASE_URL') baseUrl: string,
    private fb: FormBuilder,
    private liquiservice:LiquidacionesService
  ) { 
    this.newBusqueda();
    this.fnComboEstado();
    this.url = baseUrl
  }

  ngOnInit(): void {
    this.sPais = localStorage.getItem('Pais');  
    const user = localStorage.getItem('currentUser'); 
    this.uid  = JSON.parse(window.atob(user.split('.')[1])).uid
    this.nIdEmp  = localStorage.getItem('Empresa'); 
    this.fnCombo();
  }

  //#region form group, toggle y change button
  newBusqueda(){
    this.fgBusqueda = this.fb.group({
      anio: ['', Validators.required],
      mes:['', Validators.required],
      quincena : ['', Validators.required],
      estado: ['', Validators.required]
    });
  }


  async onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
        this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
        this.abLista = ( stat === 0 ) ? [] : this.fbLista;
        break;
 
      default:
        break;
    }

  }
  
  async fnButtonFloat(obj){  
    if(obj.icon === 'search'){
      this.fnBusqueda();
    }
    else if(obj.icon === 'bug_report'){
      this.fnReporte();
    }
    else if(obj.icon === 'extension'){
      this.fnExportar();
    }

    else if(obj.icon === 'local_atm'){
      this.fnAutoliquidar();
    }

    else if(obj.icon === 'close'){
      this.enviar.emit('salir'); 
    }  
  }

  //#endregion
  
  //#region combo
  async fnComboEstado(){
    this.lblestado = [
      { nOpcion:0,sOpcion:"Inconsistencia"},
      { nOpcion:1,sOpcion:"Correcto"} ,
      { nOpcion:2,sOpcion:"Todos"} 
    ]
  }

  async fnCombo(){
    const param = [];
    param.push(this.nIdEmp);
    
    this.spinner.show();
    await this.liquiservice._loadAutoLiquidacion(1, param, this.url).then((value: nsAutoLiquidacion.I_anio[]) => { 
      this.lblanio = value;    
    }); 
    this.spinner.hide();
  }

  async changeAnio(){
    let fnbus = this.fgBusqueda.value;
    let anio:number = +fnbus.anio 
    this.lblanio.map((e)=>{ 
      if(e.sYear === anio){ 
        this.lblmes = e.lmes
        this.lblquin = [];
        this.fgBusqueda.controls.mes.setValue('');  
        this.fgBusqueda.controls.quincena.setValue('');  
      }
    }) 
  }

  async changeMes(){
    let fnbus = this.fgBusqueda.value;
    let mes:string = fnbus.mes 
    this.lblmes.map((e)=>{   
      if(e.nMes === mes){ 
        this.lblquin = e.lquincena; 
        this.fgBusqueda.controls.quincena.setValue(''); 
      }
    }) 
  } 
  //#endregion
  
  
  async fnBusqueda(){
    let fgBus = this.fgBusqueda.value;
    const param = [];

    if(this.fgBusqueda.invalid){
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar datos del personal' 
      });
    }

    param.push(this.nIdEmp);
    param.push(fgBus.anio);
    param.push(fgBus.mes);
    param.push(fgBus.quincena);
    param.push(fgBus.estado);
    param.push(this.sPais);
 
    this.spinner.show();
    await this.liquiservice._loadAutoLiquidacion(4, param, this.url).then((value: any) => { 
      
      this.dataSourceAL = new MatTableDataSource(value); 
      this.dataSourceAL.sort = this.tableALSort; 
    });
    this.spinner.hide(); 
  }

  async fnExportar(){
    let fgBus = this.fgBusqueda.value;
    let lError = false;
    let flag = true;
    let error = true;
    const param = []; 
    param.push(this.nIdEmp);
    param.push(fgBus.anio);
    param.push(fgBus.mes);
    param.push(fgBus.quincena);
    param.push(fgBus.estado);
    
    if(this.fgBusqueda.invalid){
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar datos del personal' 
      });
    }

    Swal.fire({
      title: '¿Deseas Exportar?',  
      showCancelButton: true,
      confirmButtonText: `Ok`, 
    }).then(async (result) => { 
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {  
        param.push(1);
        param.push(this.uid);
        param.push(this.sPais);
        this.spinner.show();
        lError = await this.fnIngresarInfo(param);  
        
        this.fnGetDescarga(5,param,'exportar')
      }  
          
    }) 

  }

  async fnIngresarInfo(param){
    let bReturn = false;
    // this.spinner.show(); 
    await this.liquiservice._loadAutoLiquidacion(2, param, this.url).then((value: any) => {
      if(value.cod === "1"){
        bReturn = true;
      } 
    }); 
    return bReturn; 
  }

  async fnReporte(){
    let fgBus = this.fgBusqueda.value;
    const param = [];

    if(this.fgBusqueda.invalid){
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar datos del personal' 
      });
    }

    param.push(this.nIdEmp);
    param.push(fgBus.anio);
    param.push(fgBus.mes);
    param.push(fgBus.quincena);
    param.push(fgBus.estado);
    param.push(this.sPais);

    Swal.fire({
      title: '¿Deseas descargar?', 
      showCancelButton: true,
      confirmButtonText: `Ok`, 
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */  
        if (result.isConfirmed) {    
          this.spinner.show();
          this.fnGetDescarga(6,param,'Error') 
        }  
    })  
  }

  fnGetDescarga(op,para,name){
     
    this.liquiservice.fnExcelDownload(op,para,this.url).subscribe(
      (res: any) => {  
        this.downloadFile(res,name); 
      },
      err => {
        console.log(err);
        this.spinner.hide();

      },
      () => { 
      }
    )
  } 

  
  public downloadFile(response: any,name) { 

    let fecha =  moment(new Date()).format('YYYYMMDD') ;
    let hora =  moment(new Date()).format('HHmmss') ; 

    var blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    saveAs(blob, name+fecha+hora + '.xlsx');
    this.spinner.hide(); 
     
  } 

  async  fnAutoliquidar(){
    let fgBus = this.fgBusqueda.value; 
    let lError = false;
    const param = []; 
    param.push(this.nIdEmp);
    param.push(fgBus.anio);
    param.push(fgBus.mes);
    param.push(fgBus.quincena);
    param.push(fgBus.estado); 
    
    if(this.fgBusqueda.invalid){
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar datos del personal' 
      });
    }

    if(fgBus.estado != 2){
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El estado debe estar seleccionado en "todos"' 
      });
    }

    let mensaje = await this.fnValidar(param)

    Swal.fire({
      title: mensaje,  
      showCancelButton: true,
      confirmButtonText: `Ok`, 
    }).then(async (result) => { 
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {  
        param.push(2);
        param.push(this.uid);
        param.push(this.sPais); 
        this.spinner.show(); 
        lError = await this.fnIngresarInfo(param); 
        this.spinner.hide(); 
        if(lError){
          return Swal.fire({
            icon: 'success',
            title: 'Error',
            text: 'se autoliquido correctamente' 
          }); 
        }
        else{
          return Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'no hay para autoliquidar' 
          });
        }
        

      }  
          
    }) 

  }

  async fnValidar (param): Promise<string> {  
    let bReturn = '';
    // this.spinner.show(); 
    await this.liquiservice._loadAutoLiquidacion(7, param, this.url).then((value: any) => { 
       bReturn = value.pMensaje
       
    }); 
    return bReturn; 
  }
}
