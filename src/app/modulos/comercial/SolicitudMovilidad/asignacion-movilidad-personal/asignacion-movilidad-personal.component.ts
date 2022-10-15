import { Component, EventEmitter, OnInit, Output, Input } from "@angular/core";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";

import { INuevaSolicitudMovilidad } from "../../Models/SolicitudMovilidad/nueva_solicitud_movilidad/INuevaSolicitudMovilidad";
import { ICabeceraNuevaSolicitudMovilidad } from "../../Models/SolicitudMovilidad/nueva_solicitud_movilidad/ICabeceraNuevaSolicitudMovilidad";
import { ICiudad } from "../../Models/SolicitudMovilidad/nueva_solicitud_movilidad/ICiudad";
import { FormControl, FormBuilder, FormGroup, Validators} from "@angular/forms";

import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { ICargo } from "../../Models/SolicitudMovilidad/nueva_solicitud_movilidad/ICargo";
import { IFecha } from "../../Models/SolicitudMovilidad/nueva_solicitud_movilidad/IFecha";

import { SolicitudMovilidadService } from "../solicitud-movilidad.service";

import { IResponseCampania } from "../../Models/SolicitudMovilidad/nueva_solicitud_movilidad/IResponseCampania";
import { IPartida } from "../../Models/SolicitudMovilidad/nueva_solicitud_movilidad/IPartida";

import { IPersonalRegistro } from "../../Models/SolicitudMovilidad/solicitud_movilidad/IPersonalRegistro";
import { IPersonalBuscador } from "../../Models/SolicitudMovilidad/solicitud_movilidad/IPersonalBuscador";

import { EstadoDocumentoEnum } from "../../Shared/SolicitudMovilidad/estado_documento.emun";
import { Router } from "@angular/router";

import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";

import {MatTableDataSource} from '@angular/material/table';  

import { DateAdapter, MAT_DATE_FORMATS } from "@angular/material/core";
import {
  AppDateAdapter,
  APP_DATE_FORMATS,
} from "../../../../shared/services/AppDateAdapter";
import { Log } from "oidc-client";


import { comercialAnimations } from "../../Animations/comercial.animations";

@Component({
  selector: "app-asignacion-movilidad-personal",
  templateUrl: "./asignacion-movilidad-personal.component.html",
  styleUrls: ["./asignacion-movilidad-personal.component.css"],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ],   
  animations: [ comercialAnimations]
})
export class AsignacionMovilidadPersonalComponent implements OnInit {
  //#region declaracion variable del sistema
  id:number; 
  url: string;  
  pais: string; 
  Empresa:string; 
  lPar:number; 
  //#endregion 

  abLista = [];
  tsLista = 'inactive'; 
  fbLista = [
    {icon: 'person_add', tool: 'Nuevo personal'}
  ];

  //#region CABECERA
  //#region VARIABLES DIAS CHECKBOX
  valorDias = false;
  //#endregion 

  listaCiudades: ICiudad[];
  listaCiudadesTotal: ICiudad[];
  lCboPartida:any;
  lCboCargo:any;
  lcboSucursal:any;
  FechaIni:string;
  FechaFin:string;

  bTodosDias=new FormControl();
  PPTOFormGroup: FormGroup;

  //#region CARGO AUTOCOMPLETABLE 
  listaCargos: ICargo[] = []; 
  listaPlanillasPermitidas: number[] = [];
  //#endregion

  //#region VARIABLES NUEVA SOLICITUD
  cabeceraNuevaSolicitudMovilidad: ICabeceraNuevaSolicitudMovilidad;
  //#endregion

  //#region CONTROL FECHA
  fechaDelControl = new FormControl(new Date()); 
  //#endregion

  //#region PARTIDA COMBO
  listaPartidas: IPartida[] = [];
  //#endregion

  estadoDocumento = EstadoDocumentoEnum;

  //#endregion

  //#region TABLA AGREGAR PERSONAL
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

  //#region BUSCADOR PERSONA EDITAR PERSONA 
  //#endregion
 
  //#endregion

  lCboModena:any

  fecha_hoy:Date;
  fecha_inicio:Date;
  fecha_fin:Date;

  constructor(
    private solicitudMovilidadService: SolicitudMovilidadService,
    private router: Router,
    private formBuilder: FormBuilder,
    private spinnerService: NgxSpinnerService
  ) {
    this.pais = localStorage.getItem('Pais'); 
    this.obteniendoFecha(this.pais);
  }

  ngOnInit(): void {
    this.Empresa = localStorage.getItem('Empresa');
    const user = localStorage.getItem('currentUser');  
    this.id = JSON.parse(window.atob(user.split('.')[1])).uid;  

    var aux: Date = this.fechaDelControl.value; 
    this.FechaIni = aux.toLocaleDateString(); 
    this.bTodosDias.setValue(false);

    this.PPTOFormGroup = this.formBuilder.group({ 
      solicitante_id: [{value: '', disabled: true} , Validators.required],
      solicitante: [{value: '', disabled: true} , Validators.required],
      idPPTO: [{value: '', disabled: false} , Validators.required],
      NroPPTO: [{value: '', disabled: false} , Validators.required],
      PPTO: [{value: '', disabled: true}, Validators.required],
      partida: [{value: '', disabled: false}, Validators.required],
      cargo: [{value: '', disabled: false} , Validators.required],
      anio: [{value: '', disabled: true} , Validators.required],
      del: [aux], 
      al: [{value: '', disabled: true}]  ,
      zona: [{value: '', disabled: true} , Validators.required]  
    });  


    //#region CABECERA
    this.inicializandoNuevaSolicitud(aux); 
    this.obteniendoDataSolicitante();
    //#endregion  
    
  }

  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }



  //#region CABECERA

  private obteniendoFecha(pais) {
    this.solicitudMovilidadService
      .crudSolicitudesMovilidad(24, [pais], "|")
      .then((data: IFecha) => {
        this.fecha_hoy     = new Date(data.fechahoy);
        this.fecha_inicio  = new Date(data.fechaini);
        this.fecha_fin     =  this.convertUTCDateToLocalDate(new Date(data.fechafin));
      });
  }

  //#region BUSCANDO CAMPANIA
  public async buscarCampania() {
    let vPPTO = this.PPTOFormGroup.value; 
    var param = [];
    var codigo = vPPTO.NroPPTO;
    const user = localStorage.getItem("currentUser");
    var idUser = JSON.parse(window.atob(user.split(".")[1])).uid;
    param.push(idUser); // user_id // user_id
    param.push(this.Empresa); 
    param.push(codigo); //codigo de la camapania 

    this.listaCiudades = [];
    this.listaCiudadesTotal = [];
    this.listaCargos = [];
    this.listaPartidas = []; 
    this.listaPlanillasPermitidas = [];  
    this.cabeceraNuevaSolicitudMovilidad.cargo_id = null;
    this.cabeceraNuevaSolicitudMovilidad.cargo = null;
    this.cabeceraNuevaSolicitudMovilidad.cargo_codigo = null;
    this.cabeceraNuevaSolicitudMovilidad.campania = null;
    this.cabeceraNuevaSolicitudMovilidad.campania_id = null;
    this.cabeceraNuevaSolicitudMovilidad.campania_numero = null;
    this.cabeceraNuevaSolicitudMovilidad.zona = null;

    this.cabeceraNuevaSolicitudMovilidad.partida_id = null;
    this.cabeceraNuevaSolicitudMovilidad.partida = null;
    this.cabeceraNuevaSolicitudMovilidad.partida_codigo = null; 
    this.PPTOFormGroup.get('zona').disable();
    this.PPTOFormGroup.controls.zona.setValue(""); 
    this.PPTOFormGroup.controls.partida.setValue(""); 

    this.fnLimpiarDetalle();
    
    this.spinnerService.show();
    this.validandoBusquedaCampania(param).then(async (value) => { 
      if (value) { 
        await this.solicitudMovilidadService
          .combos(0, param)
          .then((data: any) => {  
            if (data !== null) { 
              this.cabeceraNuevaSolicitudMovilidad.campania_id = data.id;
              this.cabeceraNuevaSolicitudMovilidad.campania_numero = data.codigo;
              this.cabeceraNuevaSolicitudMovilidad.campania = data.nombre_campania;
              this.PPTOFormGroup.controls.idPPTO.setValue(data.id);     
              this.PPTOFormGroup.controls.PPTO.setValue(data.nombre_campania); 
              this.cargarDataPartida(param);
              // this.cargarDataCiudad(codigo);
 
            }
          });

      }
      else{ 
        this.PPTOFormGroup.controls.idPPTO.setValue('');     
        this.PPTOFormGroup.controls.PPTO.setValue('');  
        this.PPTOFormGroup.controls.partida.setValue('');  
        this.PPTOFormGroup.controls.cargo.setValue(''); 
      } 
      
      this.spinnerService.hide(); 
    });
  } 

  fnCiudadChange(i){
    this.dataSource.data[i].personal_id = ''; 
    this.dataSource.data[i].banco_id = ''; 
    this.dataSource.data[i].banco = ''; 
    this.dataSource.data[i].cargo_id = ''; 
    this.dataSource.data[i].cargo = '';    
    this.dataSource.data[i].pasaje_por_dia = ''; 
  }

  fnLimpiarDetalle(){ 
    let tGestor = new Array<any>();   
    // tGestor.push({
    //   id: "",
    //   ciudad:"",
    //   personal_id:"", 
    //   cargo_id: "",
    //   cargo: "",
    //   banco_id: "",
    //   banco:"",
    //   f_inicio: this.FechaIni,
    //   f_fin: this.FechaFin,
    //   pasaje_por_dia:""
    // })
       
      this.dataSource = new MatTableDataSource(tGestor); 
  }

  public async validandoBusquedaCampania(params) {
    var flag: boolean = false;
    await this.solicitudMovilidadService
      .combos(16, params)
      .then((data: any) => {
        if (data.status) {
          var contenido = data.data.split("|");

          if (contenido[0] === "0") {
            Swal.fire({
              title: "Atención!",
              text: contenido[1],
              icon: "warning",
              confirmButtonText: "Ok",
            });
          }

          if (contenido[0] === "1") {
            flag = true;
          }
          if (contenido[0] === "-1") {
            Swal.fire({
              title: "Atención!",
              html:contenido[1], 
              icon: "warning",
              confirmButtonText: "Ok",
            });
            flag = true;
          }
        }
      });
    return flag;
  }
  //#endregion

  private async cargarDataPartida(param: any) {
    await this.solicitudMovilidadService
    .combos(1, param)
    .then((data: any[]) => {
      this.listaPartidas = data;
    });
  
  }
 

  //#region CARGO AUTOCOMPLETABLE
  private cargarDataCargo(codigo_campania: string, id_partida: number) { 
    var params = [];
    params.push(this.id); // user_id
    params.push(this.Empresa);
    params.push(codigo_campania);
    params.push(id_partida); 
    
    this.solicitudMovilidadService.combos(2, params).then((data: ICargo[]) => {
      this.listaCargos = data;
      if (this.validandoCargoPersonal(this.listaCargos)) { 
      }
    });
    this.spinnerService.hide();
  }
 
  CargoSeleccionada(evento){
    let vPPTO = this.PPTOFormGroup.value; 
    var codigo = vPPTO.NroPPTO;

    var cargo: ICargo = this.listaCargos.find(
      (e) => e.id === evento.value
    );

    this.cabeceraNuevaSolicitudMovilidad.cargo_id = cargo.id;
    this.cabeceraNuevaSolicitudMovilidad.cargo_codigo = cargo.codigo;
    this.cabeceraNuevaSolicitudMovilidad.cargo = cargo.nombre_cargo;

    var params = [];
    params.push(cargo.id);

    this.spinnerService.show();
    this.solicitudMovilidadService
      .crudSolicitudesMovilidad(15, params, "|")
      .then((data: number[]) => {
        this.listaPlanillasPermitidas = data; 
      }); 

    
    var param = [];
    param.push(this.id);
    param.push(this.Empresa);
    param.push(codigo);
    param.push(vPPTO.partida);
    param.push(vPPTO.cargo);  
    this.solicitudMovilidadService.combos(3, param).then((data: any[]) => { 
      //console.log(data);
      
      this.listaCiudadesTotal = data ;  
      this.PPTOFormGroup.get('zona').enable();  
      this.cargarDataPersonalBuscador();
        // if (this.validandoCargoPersonal(this.listaCargos)) { 
        // }
    }); 
    this.fnLimpiarDetalle();
  } 

  public textoPlanillasPermitidasPorCargo() {
    if (this.listaPlanillasPermitidas.length > 0) {
      return (
        "El personal que se indique en el detalle solo debe pertenecer a las planillas (" +
        this.listaPlanillasPermitidas.toString() +
        ")"
      );
    } else {
      ("");
    }
  }

  public validandoCargoPersonal(data) {
    if (data.length <= 0) {
      Swal.fire({
        title: "Atención!",
        text: "La ciudad no posee cargos, seleccione otra ciudad",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return false;
    }
    return true;
  }
  //#endregion

  //#region CAMPO FECHA DEL
  public fechaSeleccionada(date: Date) { 
    var datea = new Date(); 
    var ultimoDia = new Date(datea.getFullYear(), datea.getMonth() + 1, 0); 


    this.cabeceraNuevaSolicitudMovilidad.fecha_del = date.toLocaleDateString();
    this.FechaIni = date.toLocaleDateString();
    
    var dia_mes_anio: string[] = date.toLocaleDateString().split("/");
    dia_mes_anio[0] = 15 < +dia_mes_anio[0] ? ultimoDia.getDate() + "" : 15 + ""; 
    this.FechaFin = new Date(
      dia_mes_anio[1] + "/" + dia_mes_anio[0] + "/" + dia_mes_anio[2]
    ).toLocaleDateString();
    this.cabeceraNuevaSolicitudMovilidad.fecha_al = this.FechaFin; 
    this.PPTOFormGroup.controls.al.setValue(this.FechaFin); 
      
    this.dataSource.data.map(e =>{
      e.f_inicio = date.toLocaleDateString() ,
      e.f_fin = this.FechaFin
    }) 
  }

  //#region validador de fecha
  convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;   
  }
  //#endregion

  bloquearFechaNoValidas = (d: Date | null): boolean => { 
    
    //var fecha_actual = new Date('11/1/2020'); 
    
    const fecha_datepicker: Date = new Date(d);   
    //console.log(fecha_datepicker);
    
    // this.PPTOFormGroup.controls.del.setValue(""); 
    return (
      fecha_datepicker >=  this.fecha_inicio  &&
      fecha_datepicker <=  this.fecha_fin 
    );
     
  };
  //#endregion

  //#region CAMPO PARTIDA 

  public partidaSeleccionada(evento) {
    let vPPTO = this.PPTOFormGroup.value; 
    var codigo = vPPTO.NroPPTO;
    this.spinnerService.show();
    var partida: IPartida = this.listaPartidas.find(
      (e) => e.id === evento.value
    );
    this.cabeceraNuevaSolicitudMovilidad.partida_id = partida.id;
    this.cabeceraNuevaSolicitudMovilidad.partida = partida.nombre;
    this.cabeceraNuevaSolicitudMovilidad.partida_codigo = partida.codigo;
    this.PPTOFormGroup.controls.cargo.setValue(''); 
    this.cargarDataCargo(codigo,partida.id)
    this.fnLimpiarDetalle();
    this.PPTOFormGroup.get('zona').disable();
    this.PPTOFormGroup.controls.zona.setValue(""); 
 
  }
  //#endregion

  public fncontrol(evento) { 
    let ciudad
    if(evento.value === 1){   
      this.cabeceraNuevaSolicitudMovilidad.zona = "001";
      this.listaCiudades = this.listaCiudadesTotal.filter((e) =>e.codigo === "001") 
    }
    else{  
      this.cabeceraNuevaSolicitudMovilidad.zona = "002";
      this.listaCiudades  = this.listaCiudadesTotal.filter((e) =>e.codigo !== "001")  
    }  

    if (this.cabeceraCompletada()) { 
      this.fnLimpiarDetalle();
    } else { 
    } 

  }

  //#region NUEVA SOLICITUD
  private inicializandoNuevaSolicitud(aux:Date) {
    var nombres_apellidos_solicitante = null;  
    

    var datea = new Date(); 
    var ultimoDia = new Date(datea.getFullYear(), datea.getMonth() + 1, 0); 

    var fecha_actual: Date = new Date();
    var dia_mes_anio: string[] = fecha_actual.toLocaleDateString().split("/");
    dia_mes_anio[0] = 15 < +dia_mes_anio[0] ? ultimoDia.getDate() + "" : 15 + "";

    this.FechaFin = new Date(
      dia_mes_anio[1] + "/" + dia_mes_anio[0] + "/" + dia_mes_anio[2]
    ).toLocaleDateString();
 
    this.PPTOFormGroup.controls.solicitante.setValue(nombres_apellidos_solicitante); 
    this.PPTOFormGroup.controls.anio.setValue(dia_mes_anio[2]);  
    this.PPTOFormGroup.controls.al.setValue(this.FechaFin);  

    this.cabeceraNuevaSolicitudMovilidad = {
      numero_movilidad: null,
      solicitante_id: null,
      solicitante: nombres_apellidos_solicitante,
      campania_id: 0,
      campania: null,
      campania_numero: null, 
      cargo_id: null,
      cargo_codigo: null,
      cargo: null,
      zona: null,
      anio: dia_mes_anio[2],
      fecha_del: aux.toLocaleDateString(),
      fecha_al: this.FechaFin,
      partida_id: null,
      partida: null,
      partida_codigo: null,
      estado_id: null,
      estado: null,
      creado_por: null,
      enviado_por: null,
      aprobado_por: null,
      terminado_por: null,
    }; 
    this.fnLimpiarDetalle(); 

  }

  private obteniendoDataSolicitante() {
    const user = localStorage.getItem("currentUser");
    var idUser = JSON.parse(window.atob(user.split(".")[1])).uid;
    this.solicitudMovilidadService
      .crudSolicitudesMovilidad(21, [idUser], "|")
      .then((data: any) => {
        this.cabeceraNuevaSolicitudMovilidad.solicitante_id = idUser;
        this.cabeceraNuevaSolicitudMovilidad.solicitante = data.datos;
        this.PPTOFormGroup.controls.solicitante_id.setValue(idUser); 
        this.PPTOFormGroup.controls.solicitante.setValue(data.datos); 
      });
  }
  //#endregion

  //#endregion

  //#region TABLA AGREGAR PERSONAL 

  //#region BUSCADOR DE PERSONA
  
  private async cargarDataPersonalBuscador() {
    var params = [];
      
    params.push(this.cabeceraNuevaSolicitudMovilidad.cargo_id);
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
      }); 
    this.spinnerService.hide(); 
  }
 
  //#endregion

  //#region  AGREGAR NUEVO PERSONAL
  public agregarPersonal(i:number,nuevoP:IPersonalRegistro) { 
    let vObj = this.PPTOFormGroup.value;

    if(this.PPTOFormGroup.invalid){
      return;
    }   

    this.validacionAgregarEditarPersonal(nuevoP).then((valor) => {  
 
      let tGestor = new Array<IPersonalRegistro>();
      tGestor =  this.dataSource.data ; 
      
      if (valor) {  
      }
      else{
        this.dataSource.data[i].pasaje_por_dia = '';
      }
    });
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

  //#region EDITAR PERSONAL
  public enviandoDataEditada(data) {
    if (data.pasaje_por_dia === null) {
      data.pasaje_por_dia = 0;
    }

    this.validacionAgregarEditarPersonal(data).then((valor) => {
      if (valor) {
        data.editable = false;
      }
    });
  }
  
  //#endregion 

  //#endregion

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


  //#region ACCIONES LIMPIAR - ELIMINAR

  public async registrarNuevaAsignacion() {
    this.cabeceraNuevaSolicitudMovilidad.estado_id = this.estadoDocumento.Incompleto;

    const user = localStorage.getItem("currentUser");
    var idUser = JSON.parse(window.atob(user.split(".")[1])).uid;
    var idEmpresa = localStorage.getItem("Empresa");
    var pais = localStorage.getItem("Pais");

    var params = [];
    params.push(idEmpresa); // empresa
    params.push(this.cabeceraNuevaSolicitudMovilidad.campania_id); // id del presupuesto
    params.push(idUser); // persona logeada id - debido a un error en el procedimiento

    var aux = [];
    var fecha_inicio = "";
    var fecha_fin = "";
    aux = this.cabeceraNuevaSolicitudMovilidad.fecha_del.split("/");
    fecha_inicio = aux[2] + "-" + aux[1] + "-" + aux[0];

    aux = this.cabeceraNuevaSolicitudMovilidad.fecha_al.split("/");
    fecha_fin = aux[2] + "-" + aux[1] + "-" + aux[0];

    params.push(fecha_inicio); // fecha inicio
    params.push(fecha_fin); // fecha fin
    params.push(pais); // pais
    params.push(this.cabeceraNuevaSolicitudMovilidad.cargo_id); // cargo
    params.push(this.cabeceraNuevaSolicitudMovilidad.zona); // zona
 
    let val = 1;
    this.dataSource.data.forEach((personal:IPersonalRegistro) => {
      if(personal.pasaje_por_dia === 0) {
        val = 0
        return;
      } 
      else if(personal.pasaje_por_dia.toString() === ""){
        val = 0
        return; 
      }
      
    });


    if(this.dataSource.data.length === 0){ 
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, ingrese a una persona' 
      });
    }
    /* console.log(this.dataSource.data.length);
    console.log(val); */
    
    if(val == 1){ 
      this.spinnerService.show();
      await this.solicitudMovilidadService
        .crudSolicitudesMovilidad(6, params, "|")
        .then((id: number) => {
          this.registrarPersonal(id);
        });
    }
  }

  private async registrarPersonal(id_gasto_costo) {
    var params = [];
   

    this.dataSource.data.forEach((personal:IPersonalRegistro) => {
      if(personal.pasaje_por_dia >= 0){
        params.push(
          id_gasto_costo +
            "|" +
            personal.ciudad +
            "|" +
            this.cabeceraNuevaSolicitudMovilidad.partida_id +
            "|" +
            personal.cargo_id +
            "|" +
            personal.personal_id +
            "|" +
            personal.pasaje_por_dia +
            "|" +
            personal.banco_id+
            "|"+
            this.bTodosDias.value
        );
      }
      
    });

    await this.solicitudMovilidadService
      .crudSolicitudesMovilidad(7, params, "*")
      .then((data) => {
        this.router.navigateByUrl(
          "comercial/requerimiento/solicitud_movilidad/detalle/" +
            id_gasto_costo
        );
    });

    this.spinnerService.hide();
  } 
  
  public AgregarPersonalDeLaTabla() {
    let val = 1;
    let tGestor = new Array<IPersonalRegistro>();
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
          f_inicio: this.FechaIni,
          f_fin: this.FechaFin,
          pasaje_por_dia: 0, 
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

  public cancelar() {
    this.router.navigateByUrl(
      "comercial/requerimiento/solicitud_movilidad/ver"
    );
  }
  //#endregion

  //#region VALIDACION PARA ACTIVACION DE BOTONES O CAMPOS 
  public cabeceraCompletada(): boolean {  
    return (
      this.cabeceraNuevaSolicitudMovilidad.solicitante !== null &&
      this.cabeceraNuevaSolicitudMovilidad.solicitante_id !== null &&
      this.cabeceraNuevaSolicitudMovilidad.campania !== null &&
      this.cabeceraNuevaSolicitudMovilidad.campania_numero !== null && 
      this.cabeceraNuevaSolicitudMovilidad.cargo !== null &&
      this.cabeceraNuevaSolicitudMovilidad.cargo_codigo !== null &&
      this.cabeceraNuevaSolicitudMovilidad.anio !== null &&
      this.cabeceraNuevaSolicitudMovilidad.zona !== null &&
      this.cabeceraNuevaSolicitudMovilidad.fecha_del !== null &&
      this.cabeceraNuevaSolicitudMovilidad.fecha_al !== null &&
      this.cabeceraNuevaSolicitudMovilidad.partida_id !== null
    );
  }
  
 
  private async validacionAgregarEditarPersonal(personal:IPersonalRegistro) {
    var params = [];
    let vPPTO = this.PPTOFormGroup.value; 
    var flag: boolean = false; 

    params.push(personal.personal_id); // personal id
    //params.push(146); // personal id

    params.push(personal.cargo_id); // cargo planilla id
    //params.push(42); // cargo planilla id

    params.push(this.cabeceraNuevaSolicitudMovilidad.campania_id); // id_centro_costos
    params.push(vPPTO.zona);  
    params.push(personal.ciudad); 
    params.push(vPPTO.partida);
    
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

  private verificarMismoBanco(banco_id: number) {
    var flag = false;
    // this.dataSource.forEach((item) => {
    //   if (item.banco_id === banco_id) {
    //     flag = true;
    //   }
    // });

    return flag;
  }
  //#endregion

  setDays(event){
    this.valorDias=event;
  }
}
