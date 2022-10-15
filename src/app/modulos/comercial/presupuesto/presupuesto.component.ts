import { Component, OnInit, ViewChild, ViewChildren, Inject, AfterViewInit,ElementRef, QueryList  } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
 
import { SerPresupuestoService } from './serpresupuesto.service';  
import Swal from 'sweetalert2';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';  
import { NgxSpinnerService } from 'ngx-spinner';  
import { MatDialog } from '@angular/material/dialog'; 
 
import { comercialAnimations } from '../Animations/comercial.animations';  
import { DigcontinuacionComponent } from './digcontinuacion/digcontinuacion.component';  

 

@Component({
  selector: 'app-presupuesto',
  templateUrl: './presupuesto.component.html',
  styleUrls: ['./presupuesto.component.css'], 
  animations: [ comercialAnimations]
})
export class PresupuestoComponent implements OnInit{
  //#region declaracion variable del sistema
  id:number; 
  url: string;  
  pais: string; 
  Empresa:string; 
  menu:string; 
  lPar:number; 
  //#endregion 

  perfil:number;
  permiso:number; 
  control:number; 

  //#region true and false to div
  divList: boolean = true;
  divCreate: boolean = false;
  divCrePre: boolean = true;  
  BtnCreacion: boolean = true;  
  //#endregion 
  abLista = [];
  tsLista = 'inactive';
  fbLista = [
    {icon: 'attach_money', tool: 'Nuevo'},
    {icon: 'grid_on', tool: 'Descarga'}
  ];
   
  listPre: any;  

  //#region declarando las tablas de presupuesto, sucursal, equipo y partidas
  /* tabla lista de presupuesto */
  dataSourcePre: MatTableDataSource<any>;
  displayedColumnsPre: string[] = ['pnIdCC','pCodCC','pDescCC','pdFecIni'
  ,'pdFecFin','pNomCom','pestPpto','pestFactura','ptipo','pApro'];
  @ViewChild('TablePrePaginator', {static: true}) tablePrePaginator: MatPaginator;
  @ViewChild('TablePreSort') tablePreSort: MatSort; 

  
  //#endregion
   
  
  txtControl  = new FormControl();
   
  vPresupuesto = new Object();  
     

  constructor( 
    private spinner: NgxSpinnerService, 
    private formBuilder: FormBuilder,  
    private dialog: MatDialog,
    private vSerPresupuesto: SerPresupuestoService,
    @Inject('BASE_URL') baseUrl: string
    ) { 
      this.url = baseUrl;   
    }
      
  ngOnInit(): void {  
    //hola
    //#region llenado dato del sistema
    this.pais = localStorage.getItem('Pais'); 
    this.Empresa = localStorage.getItem('Empresa');
    this.menu = localStorage.getItem('Menu');
    const user = localStorage.getItem('currentUser');
    this.id = JSON.parse(window.atob(user.split('.')[1])).uid;   
    //#endregion
    this.fnNivel(0,16,0,0,'');
 
    this.fnPPTO();  
    
  } 

  onToggleFab(fab: number, stat: number) {
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
  
  recibirMensaje(mensaje:string){
    this.divList = true ;
    this.divCreate = false;
    this.txtControl.setValue('')
    this.fnPPTO();  
  }
 
  async fnPPTO() {
    let pParametro= []; 
    this.spinner.show();
    pParametro.push(this.Empresa)
    pParametro.push(this.id)
    
    await this.vSerPresupuesto.fnPresupuesto( 5, pParametro, this.url).then( (value: any[]) => { 
      this.listPre = value; 
      this.dataSourcePre = new MatTableDataSource(value);
      this.dataSourcePre.paginator = this.tablePrePaginator;
      this.dataSourcePre.sort = this.tablePreSort;
    }, error => {
      console.log(error); 
    }); 
    this.spinner.hide();
  }


 

  applyFilter = function (filterValue:string) {  
    
    this.dataSourcePre.filter = filterValue.trim().toLowerCase();

    if (this.dataSourcePre.paginator) {
      this.dataSourcePre.paginator.firstPage(); 
    }
  }   
  //#region creacion presupuesto y opcion de cambio
  fnPlantilla = function(){

    Swal.fire({
      title: '¿Qué deseas crear: una cotización o un presupuesto?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: `Cotización`,
      denyButtonText: `Presupuesto`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {   
          this.fnChange( 0,2078);//cotizacion
        } else if (result.isDenied) {
          Swal.fire({
            title: '¿Presupuesto nuevo o continuación?',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: `Nuevo`,
            denyButtonText: `Continuación`,
          }).then((result) => {
            
            if (result.isConfirmed) {  
              this.fnChange( 0,2034);
            }
            else{  
              const dialogRef = this.dialog.open(DigcontinuacionComponent, {
                width: '420px',
                height: '300px',
                disableClose: true,
                data: '' ,
              });
        
              dialogRef.afterClosed().subscribe(result => {     
                  if(!result){ 
                    return;
                  }  
                  if(!result.data){ 
                    return;
                  }   
                  this.fnDatos(result.data)
              });  
            }
          });  
          // this.fnChange( 0,2034); //presupuesto 
        } 
    }) 
  } 

  
  async loadCentroCosto(sCodCC: string) { 
    let bReturn = true;
    const param = [];

    // param.push(this.Empresa);
    // param.push(sCodCC); 
    // param.push(this.id);
    // param.push(this.pais);
    // await this.vSerPresupuesto.fnPresupuesto(32, param, this.url).then((value: any) => { 
    //   console.log(value); 
    // });  
    return bReturn;
  }
   

  fnChange(pre,tipo,Obj){  
    this.vPresupuesto["idPresupuesto"] =  pre;
    this.vPresupuesto["idtipo"] =  tipo  ;
    this.vPresupuesto["permiso"] =  this.permiso ; 
    this.vPresupuesto["control"] =  this.control ; 
    this.vPresupuesto["perfil"] =  this.perfil  ;
    this.vPresupuesto["obj"] =  Obj  ;
    this.divList =false ;
    this.divCreate =true; 
  }

  fnNivel(status,op,pre,tipo,obj){
    let paramentro =[]
    paramentro.push(status);
    paramentro.push(this.id);
    paramentro.push(this.Empresa);
    paramentro.push(pre); 
    
    this.vSerPresupuesto.fnPresupuestoCrud(op, paramentro, this.url).subscribe(
       res => {     
        
        let lComercial =  ['605','613','612','625','2278','2153'];
        let Result = res.cod.split("-"); 
        this.permiso = +Result[0];
        this.control = Result[1];
        this.perfil = res.mensaje ; 

        if(status === 1){
          if(lComercial.includes(this.perfil.toString()) == true){  
            this.permiso = 1
          }
          this.fnChange(pre,tipo,obj);
        }
        else{
          if(lComercial.includes(this.perfil.toString()) == true){ 
            this.BtnCreacion = true; 
            this.permiso = 1
          }
          else{
            this.permiso = 0
            this.BtnCreacion = false; 
          }
        }

       },
       err => {
         console.log(err); 
       },
       () => { 
       }
     );
  }

  async fnDatos(a){ 
    let pParametro= []; 
    pParametro.push(a)
    this.spinner.show();
    await this.vSerPresupuesto.fnPresupuesto( 6, pParametro, this.url).then( (value: any[]) => { 
      this.fnNivel(1,16,a,0,value); 
    }, error => {
      console.log(error); 
    }); 
    this.spinner.hide();
  } 
 
 
  //#endregion
  
  
  async fnActionButton(obj){ 
    if(obj.icon === 'attach_money'){
      this.fnPlantilla();
    }
    else{
      this.fnExcel();
    } 
    
  }
  async fnExcel(){
    
    this.spinner.show();
    this.vSerPresupuesto.exportAsExcelFile(this.listPre , 'historico')  
    this.spinner.hide();
  }

  

}
