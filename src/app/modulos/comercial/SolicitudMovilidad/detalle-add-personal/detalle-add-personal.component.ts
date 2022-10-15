import { Component, OnInit, Input, Inject, ViewChild, EventEmitter, Output } from '@angular/core';

import {MatTableDataSource} from '@angular/material/table';  
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { SolicitudMovilidadService } from "../solicitud-movilidad.service";

import { IPersonalRegistro } from "../../Models/SolicitudMovilidad/solicitud_movilidad/IPersonalRegistro";
import { ICiudad } from "../../Models/SolicitudMovilidad/nueva_solicitud_movilidad/ICiudad";
import { Router } from "@angular/router"; 
 
import { comercialAnimations } from "../../Animations/comercial.animations";
@Component({
  selector: 'app-detalle-add-personal',
  templateUrl: './detalle-add-personal.component.html',
  styleUrls: ['./detalle-add-personal.component.css'],   
  animations: [ comercialAnimations]
})
export class DetalleAddPersonalComponent implements OnInit { 
  //#region declaracion variable del sistema
  id:number; 
  url: string;  
  pais: string; 
  Empresa:string; 
  lPar:number; 
  //#endregion 

  listaCiudades: ICiudad[];
  listaCiudadesTotal: ICiudad[];

  
  @Output()
  enviar: EventEmitter<string> = new EventEmitter<string>();

  abLista = [];
  tsLista = 'inactive'; 
  fbLista = [
    {icon: 'person_add', tool: 'Nuevo personal'}
  ];
  //#region VARIABLE DATA TABLA 

  displayedColumns: string[] = [
    "id",
    "ciudad",
    "personal_id",
    "cargo_id",
    "banco_id",
    "f_inicio",
    "f_fin",
    "pasaje_por_dia",
  ];
  dataSource: MatTableDataSource<any>;
  //#endregion
  //#region VARIABLE BUSCADOR DE PERSONA 
  arrayPersonal = new Object();
  arrayPersonalTotal = new Object();
  arrayCiudad:any = [];
  //#endregion

  cabecera: any;
  idGasto: number;
  
  @Input() pMovilidad: any;


  constructor(
    private solicitudMovilidadService: SolicitudMovilidadService,
    private router: Router,
    private spinnerService: NgxSpinnerService) { 
      this.pais = localStorage.getItem('Pais'); 
      this.Empresa = localStorage.getItem('Empresa');
      const user = localStorage.getItem('currentUser');  
      this.id = JSON.parse(window.atob(user.split('.')[1])).uid;  
    }

  ngOnInit(): void { 
    this.cabecera = this.pMovilidad.cabecera; 
    this.idGasto =  this.pMovilidad.idGasto; 
    this.CargoSeleccionada(); 
    
  } 

  //#region traer data de la tabla

  private CargoSeleccionada(){ 
    this.spinnerService.show(); 
    var param = [];
    param.push(this.id);
    param.push(this.Empresa);
    param.push(this.cabecera.codigo_presupuesto);
    param.push(this.cabecera.partida_id);
    param.push(this.cabecera.nCargo);  
    this.solicitudMovilidadService.combos(3, param).then((data: any[]) => { 
      this.listaCiudadesTotal = data ;   
      this.cargarDataPersonalBuscador(); 
    });
  }

  private async cargarDataPersonalBuscador() {
    var params = [];
      
    params.push(this.cabecera.nCargo);
    params.push(this.pais);
    params.push(this.Empresa);
    await this.solicitudMovilidadService
      .combos(13, params)
      .then((data: any[]) => { 
        data.forEach(element => {
          this.arrayCiudad.push(element.sucursal_id);
          this.arrayPersonal[element.sucursal_id] = element.lPersonal 
          this.arrayPersonalTotal[element.sucursal_id] = element.lPersonal 
        });  
        this.fncontrol();
        this.cargarDetalle();
      }); 
  }

  public fncontrol() {  
    if(this.cabecera.zona === "Central"){    
      this.listaCiudades = this.listaCiudadesTotal.filter((e) =>e.codigo === "001") 
    }
    else{   
      this.listaCiudades  = this.listaCiudadesTotal.filter((e) =>e.codigo !== "001")  
    }  
  }

  private  cargarDetalle() {
    let params = []; 
    params.push(this.idGasto); //user1
    
    
    this.solicitudMovilidadService
      .crudSolicitudesMovilidad(25, params, "|")
      .then((data:any) => { 
        this.dataSource = new MatTableDataSource(data); 
      });
      
    this.spinnerService.hide(); 

  }

  //#endregion

  
  //#region limpia las columas al momento que hacen un cambio en la ciudad
  fnCiudadChange(i){
    this.dataSource.data[i].personal_id = ''; 
    this.dataSource.data[i].banco_id = ''; 
    this.dataSource.data[i].banco = ''; 
    this.dataSource.data[i].cargo_id = ''; 
    this.dataSource.data[i].cargo = '';    
    this.dataSource.data[i].pasaje_por_dia = ''; 
  }
  //#endregion

  //#region limpia las columas al momento que hacen un cambio en el depositario
  fnChangeBanco(i:number,nuevoP:IPersonalRegistro){ 
    let banco ; 

    if(i === 0 ){
      this.arrayPersonal[nuevoP.ciudad].forEach(element => { 
        
        if(element.personal_id === nuevoP.personal_id){    
          
          this.dataSource.data[i].banco_id = element.banco_id;  
          this.dataSource.data[i].banco = element.banco_nombre;  
          this.dataSource.data[i].cargo_id = element.cargo_id;  
          this.dataSource.data[i].cargo = element.cargo;    
          this.dataSource.data[i].pasaje_por_dia = ''; 
          banco = element.banco_nombre; 
        }
      }); 
      this.fnUnico(1,banco)
    }
    else{
      let dep = this.dataSource.data[i].personal_id    
      let va = 1;

      this.dataSource.data.forEach((ele, ii) => { 

        if(ii != i){
          if(ele.personal_id === dep){
            return va = 0;
          }
        } 
        
      });

      if(va === 0){
        this.dataSource.data[i].personal_id = 0
        this.dataSource.data[i].banco = ''
        this.dataSource.data[i].cargo = ''
        this.dataSource.data[i].cargo_id = ''
        this.dataSource.data[i].banco_id = '' 
        this.dataSource.data[i].banco = ''
        this.dataSource.data[i].pasaje_por_dia = ''
        return Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'La persona que ha indicado ya se encuentra registrada en la lista, por favor verifíque.' 
        });
      } 
      else{
        this.arrayPersonal[nuevoP.ciudad].forEach(element => { 
        
          if(element.personal_id === nuevoP.personal_id){    
            
            this.dataSource.data[i].banco_id = element.banco_id;  
            this.dataSource.data[i].banco = element.banco_nombre;  
            this.dataSource.data[i].cargo_id = element.cargo_id;  
            this.dataSource.data[i].cargo = element.cargo;      
            this.dataSource.data[i].pasaje_por_dia = '';
          }
        }); 
      }
    }
    
  }

  
  fnUnico(op,banco){ 

    if(op === 1){
      this.listaCiudades.forEach(element => {  
        if(typeof this.arrayPersonalTotal[element.id] === "undefined"){

        }
        else{
          this.arrayPersonal[element.id] = this.arrayPersonalTotal[element.id].filter(filtro => filtro.banco_nombre === banco); 
          this.arrayPersonal[element.id].push({
            banco_id: "",
            banco_nombre: "",
            cargo: "",
            cargo_id: null,
            dni: "",
            nombre: "",
            personal_id: 0,
        })
        }
        
      }); 
    }
    else
    {
      
      this.listaCiudades.forEach(element => { 
        if(typeof this.arrayPersonalTotal[element.id] === "undefined"){ 
        }
        else{ 
          this.arrayPersonal[element.id] = this.arrayPersonalTotal[element.id].filter(filtro => filtro.dni !== banco);  
          this.arrayPersonal[element.id].push({
            banco_id: "",
            banco_nombre: "",
            cargo: "",
            cargo_id: null,
            dni: "",
            nombre: "",
            personal_id: 0,
          })
        } 

        
      });  
    }
    
  }
  //#endregion

  //#region validando si tiene saldo 
  public agregarPersonal(i:number,nuevoP:IPersonalRegistro) {  

    this.validacionAgregarEditarPersonal(nuevoP).then((valor) => {  
 
      let tGestor = new Array<IPersonalRegistro>();
      tGestor =  this.dataSource.data ; 
      
      if (valor) {  
      }
      else{
        this.dataSource.data[i].pasaje_por_dia = '';
        this.dataSource.data[i].estado = 0;
      }
    });
  }

  private async validacionAgregarEditarPersonal(personal:IPersonalRegistro) {
    var params = [];
    let zona 
    var flag: boolean = false; 
    
    if(this.cabecera.zona === "Central"){   
      zona = 1
    }
    else{
      zona = 0
    }

    params.push(personal.personal_id); // personal id
    //params.push(146); // personal id

    params.push(personal.cargo_id); // cargo planilla id
    //params.push(42); // cargo planilla id

    params.push(this.cabecera.centro_costo_id); // id_centro_costos
    params.push(zona);  
    params.push(personal.ciudad); 
    params.push(this.cabecera.partida_id);
    
    this.spinnerService.show();
    await this.solicitudMovilidadService
      .crudSolicitudesMovilidad(19, params, "|")
      .then((data: any) => { 
        let valor = data.monto.split('|')
        let pasaje = valor[0];
        let monto  = valor[1];
        flag = true;
        if (data !== null) {
          let total = 0;
          this.dataSource.data.forEach(element => {
            if(personal.ciudad === element.ciudad ){
              total += element.pasaje_por_dia
            }
          });

          if(total > +monto){
            flag = false;
            this.spinnerService.hide();
            return Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'la partida movilidad no tiene  saldo suficiente'
            }); 

          }

          if (+pasaje >= personal.pasaje_por_dia) {
            flag = true;
          } 
          else if(+pasaje === -1)
          {
            flag = false;
            Swal.fire({
              title: "Atención!",
              text: "El cargo de la persona indicada no tiene movilidad por dia en la matriz.",
              icon: "info",
              confirmButtonText: "Ok",
            });
          }
          else {
            flag = false;
            Swal.fire({
              title: "Atención!",
              text: "Excede el monto establecido",
              icon: "info",
              confirmButtonText: "Ok",
            });
          }
        } else {
          flag = false;
          Swal.fire({
            title: "Atención!",
            text: "El cargo de la persona indicada no tiene movilidad por dia en la matriz.",
            icon: "info",
            confirmButtonText: "Ok",
          });
        }
      });

    this.spinnerService.hide();
    return flag;
  }
  //#endregion

  //#region validando si tiene saldo
  public AgregarPersonalDeLaTabla() {
    let val = 1;
    let tGestor = new Array<any>();
    tGestor = this.dataSource.data;

    if(tGestor.length === 0){
       
    }
    else{
      tGestor.forEach(element => {
        if(element.pasaje_por_dia === 0) {
          val = 0
          return;
        }
        else if(element.pasaje_por_dia.toString() === ""){
          val = 0
          return; 
        }
        else if(element.estado === 0){
          val = 0
          return; 
        }
      });
    }

    if(val == 1){
      tGestor.push(
        {
          id: null,
          ciudad:null,
          personal_id: null,  
          cargo_id: null,
          cargo: null,
          banco_id: null,
          banco: null,
          f_inicio: this.cabecera.fecha_del,
          f_fin: this.cabecera.fecha_al,
          pasaje_por_dia: null, 
          estado: null, 
        }
      )
      
      this.dataSource =  new MatTableDataSource(tGestor);  
    }
    

  }
  public eliminarUnPersonalDeLaTabla(personal:IPersonalRegistro) {
    let tGestor = new Array<IPersonalRegistro>();
    tGestor = this.dataSource.data.filter((item) => item !== personal); 
    this.dataSource = new MatTableDataSource(tGestor);  
    if(tGestor.length === 0){
      this.fnUnico(0,'')
    }

  }

  
  //#endregion
  
  //#region Guardar / validando si tiene saldo
  public async registrarNuevaAsignacion(){
    var param = [];
    var paramEstado = [];
    var params = [];
    this.dataSource.data.forEach((personal:IPersonalRegistro) => {
      if(personal.pasaje_por_dia >= 0){
        param.push(
          this.idGasto +
            "," +
            personal.ciudad +
            "," +
            this.cabecera.partida_id +
            "," +
            personal.cargo_id +
            "," +
            personal.personal_id +
            "," +
            personal.pasaje_por_dia +
            "," +
            personal.banco_id
        );
      } 
    });
    //param.push(params);

    //console.log(param)

    paramEstado.push(this.id)
    paramEstado.push(this.pais)
    paramEstado.push(this.idGasto)
    

    await this.solicitudMovilidadService
      .crudSolicitudesMovilidad(26, param, "/")
      .then((data) => { 

        //CAMBIO DE ESTADO

        this.solicitudMovilidadService
        .crudSolicitudesMovilidad(28, paramEstado, "|")
        .then((data:any) => { 
          
        });

        this.enviar.emit('guardar');
    })

  }

  cancelar(){  
    this.enviar.emit('salir');
  }
  //#endregion

  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }

}
