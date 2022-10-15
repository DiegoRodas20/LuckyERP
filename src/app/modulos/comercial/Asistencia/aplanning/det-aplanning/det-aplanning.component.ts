import { Component, Inject, Input, OnInit, Type, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS } from '@angular/material/core';
import { adminpAnimations } from 'src/app/modulos/egy-humana/JefaturaAP/Animations/adminp.animations';

import { AplanningServiceService } from './../services/aplanning-service.service'

import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CalendarDateFormatter, CalendarView, DAYS_OF_WEEK, CalendarEvent } from 'angular-calendar';
import { Observable, Subject } from 'rxjs';
import { nsPlanningT } from './../Models/nsPlanning';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { fi } from 'date-fns/locale';
import Swal from 'sweetalert2';


import { MatTable, MatTableDataSource } from '@angular/material/table';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
} 


@Component({
  selector: 'app-det-aplanning',
  templateUrl: './det-aplanning.component.html',
  styleUrls: ['./det-aplanning.component.css','./det-aplanning.component.scss'],
  animations: [adminpAnimations],
  providers: [AplanningServiceService]
})
export class DetAplanningComponent implements OnInit {
  sPais = JSON.parse(localStorage.getItem('Pais')); 
  url: string;

  @Input() fromParent;

  tadaIncentivo = 'inactive';

  aCentroCosto: nsPlanningT.IMain;
  lPersonal: nsPlanningT.IPersonal[];
  lCategoria: nsPlanningT.IPerfil[]; 
  lCanal: nsPlanningT.IPerfil[]; 

  abIncentivo = [];
  abPdv =   [
    {icon: 'person_add', tool: 'Añadir'},
    {icon: 'cleaning_services', tool: 'Lista'},
  ];
  abPerso = [];
  toggleIncentivo = 0;
  tsIncentivo = 'active';
  tsPerso = 'inactive';
  tsPdv = 'active';
  
  fbView = [
    { icon: 'cancel', tool: 'Cancelar', dis: false },
    { icon: 'save', tool: 'Guardar', dis: false }
  ]; 

  fbPerso = [
    {icon: 'person_add', tool: 'Añadir'},
    {icon: 'cleaning_services', tool: 'Limpiar'},
  ];

  // fbPdv = [
  //   {icon: 'person_add', tool: 'Añadir'},
  //   {icon: 'cleaning_services', tool: 'Lista'},
  // ];
  
  tgSeleccion = true;
  tgPersonal = false;
  tglistapdv =true;
  tgagregarpdv =false;

  viewDate: Date = new Date();
  locale = 'es';
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.MONDAY, DAYS_OF_WEEK.SUNDAY];
  refresh: Subject<any> = new Subject();
  events: CalendarEvent[] = [
    {
      start: new Date(),
      end: new Date(),
      title: 'sss'
    }
  ];
  //#region Formulario
  fgPresupuesto: FormGroup;
  fgFecha: FormGroup;
  fgInfoPerso: FormGroup; 
  fgDocumento: FormGroup; 
  fgDetalle: FormGroup; 
  //#endregion

  matcher = new MyErrorStateMatcher();

  expandedMore: nsPlanningT.IPlanning;

  IncentivoDC: string[] = ['sNombres'  , 'sCodPlla', 'sTipoDoc', 'sDocumento', 
  'sCiudad', 'inicio', 'cese', 'sCanal', 'sPerfil', 'pdv', 'more'];
  IncentivoDS: MatTableDataSource<nsPlanningT.IPlanning> = new MatTableDataSource([]);

  ListaPDVDC: string[] = ['sNro'  , 'sPdv' ];
  ListaPDVDS: MatTableDataSource<nsPlanningT.IL_PDV> = new MatTableDataSource([]); 


  AgregarPDVDC: string[] = ['sNro'  , 'sPdv', 'sDepartamento', 'sProvincia', 
  'sDistrito' ,'sAgregar'];
  AgregarPDVDS: MatTableDataSource<nsPlanningT.IPla_PDV> = new MatTableDataSource([]); 


  zoom = 18;
  optionsMap: google.maps.MapOptions = {
    zoomControl: true,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    streetViewControl: false,
    mapTypeControl: false
  };
 
  nlat:number;
  nlon:number;

  constructor(
    public service: AplanningServiceService, 
    public activeModal: NgbActiveModal,
    @Inject('BASE_URL') baseUrl: string,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar
    ) { 
      this.url = baseUrl
    }

  ngOnInit(): void {  
    this.aCentroCosto = this.fromParent.fgCentroCosto;
    this.lPersonal = this.aCentroCosto.lPersonal; 
    
    this.newCentroCosto();
    this.newFecha();
    this.new_fgInfoPerso();
    this.new_fgDocumento();
    this.new_fgDetalle();
    this.new_PDV(); 
    
  }

  //#region form

  newCentroCosto(){ 
    this.fgPresupuesto = this.fb.group({
      nIdPptos: [{ value: this.aCentroCosto.nCentroCosto }],
      nPptos: [{ value: this.aCentroCosto.sCodCentroCosto, disabled: true }],
      sCampania : [{ value: this.aCentroCosto.sCentroCosto, disabled: true }],
      sCliente: [{ value: this.aCentroCosto.sCliente, disabled: true }]
    });

    this.nlat = this.aCentroCosto.nlat;
    this.nlon = this.aCentroCosto.nlon;
  }

  new_fgDocumento(){
    this.fgDocumento = this.fb.group({
      sTipo: [{ value: '' , disabled: true}],
      documento: [{ value: '' , disabled: true}]
    });
  }
  new_fgDetalle(){
    this.fgDetalle = this.fb.group({
      ciudad: [{ value: '' , disabled: true}],
      Ingreso: [{ value: '' , disabled: true}],
      Cese: [{ value: '' , disabled: true}]
    });
  }
  newFecha(){
    this.fgFecha = this.fb.group({
      sFechaIni: [{ value: '' }, Validators.required],
      sFechaFin: [{ value: '' }, Validators.required]
    });
  }

  new_fgInfoPerso() {
    this.fgInfoPerso = this.fb.group({
      cliente: [{ value: '' }, Validators.required],
      Perfil: [{ value: '' }, Validators.required],
      Canal:  [{ value: '' }, Validators.required]
    }); 
  } 

  //#endregion
 
  //#region Toggle
  onToggleFab(fab: number, stat: number) {
    switch (fab) {
 
      case 0:
        stat = (stat === -1) ? (this.abIncentivo.length > 0) ? 0 : 1 : stat;
        this.tsIncentivo = (stat === 0) ? 'inactive' : 'active';
        this.abIncentivo = (stat === 0) ? [] : this.fbView;
        break; 
      case 1:
        stat = ( stat === -1 ) ? ( this.abPerso.length > 0 ) ? 0 : 1 : stat;
        this.tsPerso = ( stat === 0 ) ? 'inactive' : 'active';
        this.abPerso = ( stat === 0 ) ? [] : this.fbPerso;
        break;
    }
  }
  async clickFab(opc: number, index: number) {
    console.log(index);
    
    switch (opc) {
      case 0:
        switch (index) {
          case 0: 
            this.activeModal.dismiss();
            break;
        }
        break;
      case 1:
        switch (index) {
          case 0: 
            this.addPerso();
            break;
          case 1: 
            this.fnLimpiar(0);
            this.onToggleFab(1,0);
            break;
        }
        break;
      case 2:
        switch (index) {
          case 0: 
            this.tglistapdv = false;
            this.tgagregarpdv = true;
            break;
          case 1:  
            this.tglistapdv = true;
            this.tgagregarpdv = false;
            break;
        }
        break;
    }
  }  

  //#endregion
  
  
  //#region Validacion y cambios
  clickFlipCard() {  
    let Infoper = this.fgInfoPerso.value;
    let Iper = Infoper.cliente  

    if(Iper === null || Iper.value === "")
    {
      this.onToggleFab(1,0);
    }
    else
    {  
      this.tgSeleccion = (this.tgSeleccion === true ? false: true);
      (function ($) {
        $('#card_inner2').toggleClass('is-flipped');
      })(jQuery); 
    } 
  }
 

  getCliente(){
    let Infoper = this.fgInfoPerso.value;
    let Iper = Infoper.cliente  

    if(Iper === null || Iper.value === "")
    {
      this.onToggleFab(1,0);
      this.fnLimpiar(0)
      this.tgPersonal = false
    }
    else
    {
      console.log(this.tgPersonal);
      
      if(!this.tgPersonal)
      {
        this.onToggleFab(1,-1); 
      }
      this.tgPersonal = true
      this.fgDocumento.controls.sTipo.setValue(Iper.sTDoc); 
      this.fgDocumento.controls.documento.setValue(Iper.sDoc); 
      this.fgDetalle.controls.ciudad.setValue(Iper.sSuc); 
      this.fgDetalle.controls.Ingreso.setValue(Iper.sIngreso); 
      this.fgDetalle.controls.Cese.setValue(Iper.sCese); 
      
      this.lCategoria = Iper.lCategoria;  
      this.fgInfoPerso.controls.Perfil.setValue(''); 
      this.lCanal = [];
    }
  }

  fnGetPerfil(){
    let Infoper = this.fgInfoPerso.value; 
    let Iper = Infoper.Perfil; 
    this.lCanal = Iper.lDet; 
  }

  fnLimpiar(op:number){
    if(op === 0){
      this.fgDocumento.reset();
      this.fgDetalle.reset();
      this.fgInfoPerso.reset();
      this.lCategoria = [];
      this.lCanal = [];
       
      if(!this.tgSeleccion){
        this.tgSeleccion = (this.tgSeleccion === true ? false: true);
        (function ($) {
          $('#card_inner2').toggleClass('is-flipped');
        })(jQuery); 
      } 
    }
    else{ 
      this.fgDocumento.reset();
      this.fgDetalle.reset();
      this.fgInfoPerso.controls.Perfil.setValue(''); 
      this.fgInfoPerso.controls.Canal.setValue(''); 
    }
  }

  
  //#endregion
  
  
  //#region agregando el personal
  addPerso(){
    let Infoper = this.fgInfoPerso.value;
    let InfoFecha = this.fgFecha.value;

    let lPersona:nsPlanningT.IPlanning[] = [];
    let IPersona:nsPlanningT.IPlanning;
    let IPdv:nsPlanningT.IL_PDV;
    let DatosPer:nsPlanningT.IPersonal = Infoper.cliente;
    let DatosCat:nsPlanningT.IPerfil = Infoper.Perfil;
    let DatosPCan:nsPlanningT.IPerfil = Infoper.Canal;

    if(this.fgFecha.invalid){
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar fecha del planning' 
      });
    }
    else if(this.fgInfoPerso.invalid){
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta ingresar datos del personal' 
      });
    } 

    IPdv = {
      nLatitud:this.nlat,
      nLongitud:this.nlon 
    }
    IPersona = {
      nDet: 0,
      nPersona: DatosPer.nPersonal,
      sNombres: DatosPer.sNombre, 
      sCodPlla: DatosPer.sCodPla, 
      sTipoDoc: DatosPer.sTDoc, 
      sDocumento: DatosPer.sDoc, 
      sCiudad: DatosPer.sSuc, 
      inicio: DatosPer.sIngreso, 
      cese: DatosPer.sCese,
      nCanal: DatosPCan.nDet,
      sCanal: DatosPCan.sDet,
      nPerfil: DatosCat.nDet, 
      sPerfil: DatosCat.sDet,
      Lpdv: [], 
      Ipdv: IPdv, 
      estado: ''
    }
    
    if(typeof this.IncentivoDS.data === "undefined")
    {
      lPersona.push(IPersona);    
    } 
    else{
      lPersona = this.IncentivoDS.data;
      lPersona.push(IPersona);   
    }
    
    

    this.fgInfoPerso.controls.cliente.setValue(''); 
    this.getCliente()
    this.IncentivoDS = new MatTableDataSource(lPersona);  

  }

  async clickExpanded(row:nsPlanningT.IPlanning) {
    this.expandedMore = row; 
  }
  //#endregion

  //#region Pdv
  async new_PDV(){
    console.log(this.sPais);
    const param = [];
    param.push(this.sPais);
    param.push('');
    param.push('');
    param.push('');

    await this.service._loadPlanning(2, param, this.url).then((value: nsPlanningT.IPla_PDV[]) => { 
       this.AgregarPDVDS = new MatTableDataSource(value);  
    });
    
  }

  showMap(pushParam: nsPlanningT.IL_PDV) {
    const position = {
      lat: pushParam.nLatitud,
      lng: pushParam.nLongitud
    };
    return position;
  }

  AgregarPDv(obj:nsPlanningT.IPla_PDV,pri:nsPlanningT.IPlanning){ 

    let ipdv : nsPlanningT.IL_PDV;
    let nPdv:nsPlanningT.IL_PDV; 


    

    this.IncentivoDS.data.map((ele)=>{
      if(ele.nPersona === pri.nPersona){

        if(ele.Lpdv.length === 0){
          nPdv = {
            nLatitud:obj.nLatitud,
            nLongitud:obj.nLongitud
          } 
          ele.Ipdv = nPdv;
        }
        ipdv = {
          sNro : obj.nIdPDV,
          sPdv : obj.sDireccion,
          nLatitud : obj.nLatitud,
          nLongitud : obj.nLongitud
    
        }   
        
        ele.Lpdv.push(ipdv);
        this.ListaPDVDS =   new MatTableDataSource(ele.Lpdv);  
      }
    });  
    
  }

  //#endregion


}
