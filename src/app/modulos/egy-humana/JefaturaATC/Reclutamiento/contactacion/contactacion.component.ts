import { Component, OnInit, Injectable, Inject, ElementRef, ViewChild,ChangeDetectorRef  } from '@angular/core';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner'; 
import { SergeneralService } from '../../../../../shared/services/sergeneral.service';  
import { SerContactacionService } from './ser-contactacion.service';
import Swal from 'sweetalert2';
import { Combo,Reclutamiento,Resultado } from '../../Model/IATC';  
import { FichatecnicaComponent } from './../fichatecnica/fichatecnica.component'; 
import { HistoricoComponent } from './../historico/historico.component'; 
import { DialogUbigeoComponent } from './../dialog-ubigeo/dialog-ubigeo.component'; 
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
  
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';  

import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../../../shared/services/AppDateAdapter'; 
import * as moment from 'moment';  

  
@Component({
  selector: 'app-contactacion',
  templateUrl: './contactacion.component.html',
  styleUrls: ['./contactacion.component.css'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ] 
})
export class ContactacionComponent implements OnInit {  
  url: string;  
  pais: string;  
  seasons: Combo[]; 
  estado: Combo[]; 

  lPostulante: any;

  lblUbigeo:any;
  lCboTipoDocumento: any;
  lCboTipoFuente: any;
  lCboMedioCont: any;
  lCboMotNoCita: any;
  lCboMotNoCont: any;
  lCboHorario: any;
  lUltimoEstado: string; 
  nIdPostulacion: number;
  nIdPostulante: number;
  nIdOpcion: number = 1;
 
  diFuente: boolean = false; 
   

  dataSource: MatTableDataSource<Reclutamiento>;
  txtControl  = new FormControl();
  positionFilter  = new FormControl(); 

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;  

  displayedColumns = ['pCodPostulacion','pTipDoc','pNumDoc','pNom','pNumCelular','pCorreo','pPuesto'
  ,'pFechaCita','pHoraCita',  'pTurno','pFuenteCont'
  ,'pCitado','pContactado','pMedioContacto','pMotNoCont','pUltEstCont'
  ]; 
 
  divList: boolean = true;
  divCreate: boolean = false;

  DatosFormGroup: FormGroup;
  ContactoFormGroup: FormGroup;
  CitaFormGroup: FormGroup;

  id:number;

  constructor(
    private spinner: NgxSpinnerService,  
    private formBuilder: FormBuilder,  
    public dialog: MatDialog,
    private vSerGeneral: SergeneralService, 
    private vSerContacto: SerContactacionService,  
    private changeDetectorRefs: ChangeDetectorRef,
    private _adapter: DateAdapter<any>,
    @Inject('BASE_URL') baseUrl: string
    ) { 
      this.url = baseUrl;  
    }

  ngOnInit() {
    
    this._adapter.setLocale('fr');
    this.pais = localStorage.getItem('Pais'); 

    const user = localStorage.getItem('currentUser');
    this.id = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.DatosFormGroup = this.formBuilder.group({
      TipoDoc: ['', Validators.required],
      NumDoc: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern('[0-9]*')]],
      PrimerMombre: ['', [Validators.required,Validators.pattern('[a-zA-Z áéíóúÁÉÍÓÚ \u00F1A]*')]],
      SegundoMombre: ['',[ Validators.pattern('[a-zA-Z áéíóúÁÉÍÓÚ]*') ]],
      PrimerApellido: ['', [Validators.required,Validators.pattern('[a-zA-Z áéíóúÁÉÍÓÚ ñ]*')]],
      SegundoApellido: ['', [Validators.required,Validators.pattern('[a-zA-Z áéíóúÁÉÍÓÚ ñ]*')]],
      Celular:  ['', [Validators.required, Validators.minLength(9), Validators.maxLength(9), Validators.pattern('[0-9]*')]], 
      CelularOpc: ['', [Validators.pattern('[0-9]*')]],  
      Correo: ['', Validators.required, Validators.email] ,  
      Puesto: [{ value:'', disabled: true } ] ,  
      Direccion: ['', Validators.required] ,  
      Distrito:['']   ,
      CodDistrito:['']  
    });
    this.ContactoFormGroup = this.formBuilder.group({
      MedioContactacion: ['', Validators.required],
      Contactado: ['', Validators.required],
      Fuente: ['', Validators.required],
      Referido: ['' , Validators.required], 
      NoContactacion: ['', Validators.required] 
    });
    this.CitaFormGroup = this.formBuilder.group({
      Citado: ['' , Validators.required],
      Fecha: ['', Validators.required],
      Hora: ['' , Validators.required],
      Turno: ['' , Validators.required],
      Nocitado: ['' , Validators.required]  ,
      UltEstCont: ['' , Validators.required] 
    });
     
    this.positionFilter.valueChanges.subscribe((positionFilterValue)        => {  
      this.nIdOpcion = positionFilterValue
     this.fnListaReclutamiento(positionFilterValue);

   });
  
    this.fnGetUbigeo();
    this.fnGetCombo();
    this.fnGetHorario();
    this.fnGetTipoDocumento();
    this.fnGetTipoFuente();
    this.fnGetMedioContacto();
    this.fnGetMotivoNoCita();
    this.fnGetMotivoNoCont(); 
    this.fnListaReclutamiento(1); 
  }  
  

  convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;   
  }

  fnGetCombo  = function () {
    this.seasons =  
      [ 
        { id: '1', valor: 'Todos' ,checked:true},
        { id: '2', valor: 'Contactados' ,checked:false},
        { id: '3', valor: 'No Contactados',checked:false },
        { id: '4', valor: 'Citados',checked:false },
        { id: '5', valor: 'No Citados',checked:false }
      ];

      this.estado =  
      [ 
        { id: '0', valor: 'No' ,checked:false},
        { id: '1', valor: 'Si' ,checked:false}, 
      ];
  }

  async fnListaReclutamiento(a) {
    let pParametro= [];
    pParametro.push(this.pais);
    pParametro.push(a);
    this.spinner.show();
    console.log(pParametro);
    
    await this.vSerContacto.fnReclutamiento( 1, pParametro, this.url).then( (value: any[]) => {
      this.dataSource = new MatTableDataSource(value);
    }, error => {
      console.log(error); 
    }); 

    this.spinner.hide();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;  
  } 
   
  applyFilter = function (filterValue:string) {  
    
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage(); 
    }
  }   
  
  async fnDatos(id) {
    let pParametro= [];
    pParametro.push(this.pais);
    pParametro.push(id);   
 
    this.spinner.show();
    await this.vSerContacto.fnReclutamiento( 2, pParametro, this.url).then( (value: any[]) => {
      this.fnLLenado(value);
    }, error => {
      console.log(error); 
    });  
    this.spinner.hide();
  }

  fnLLenado= function (vOB) {   
    
    this.nIdPostulacion = vOB.pCodPostulacion ;  
    this.nIdPostulante = vOB.pCodPostulante ;  

    
    let fei  = this.convertUTCDateToLocalDate(new Date(vOB.pFechaCita.toString()));

    if(this.pais == '604'){
      this.DatosFormGroup = this.formBuilder.group({
        TipoDoc: new FormControl(vOB.pCodTipDoc.toString(), Validators.required),
        NumDoc: new FormControl(vOB.pNumDoc.toString(), [Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern('[0-9]*')]) ,
        PrimerMombre: new FormControl(vOB.pPrimNom.toString(), [Validators.required,Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ ]*')]) ,
        SegundoMombre: new FormControl(vOB.pSegNom.toString(),[ Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ ]*')]) ,
        PrimerApellido: new FormControl(vOB.pApePat.toString(), [Validators.required,Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ ]*')]) ,
        SegundoApellido: new FormControl(vOB.pApeMat.toString(), [Validators.required,Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ ]*')]) ,
        Celular:  new FormControl(vOB.pNumCelular.toString(), [Validators.required, Validators.minLength(9), Validators.maxLength(9), Validators.pattern('[0-9]*')]) ,
        CelularOpc: new FormControl(vOB.pNumCelularOpc.toString(),[ Validators.minLength(8), Validators.maxLength(11), Validators.pattern('[0-9]*')]) ,  
        Correo: new FormControl(vOB.pCorreo.toString(), [Validators.required,Validators.email]) ,
        Puesto: new FormControl({ value: vOB.pPuesto.toString(), disabled: true }, [Validators.pattern('[0-9]*')]) , 
        Direccion: new FormControl(vOB.pdireccion.toString(), Validators.required) ,
        Distrito: new FormControl(vOB.pDistrito.toString(), Validators.required) ,  
        CodDistrito: new FormControl(vOB.pCodDistrito.toString())  
      });
    }
    else {
      this.DatosFormGroup = this.formBuilder.group({
        TipoDoc: new FormControl(vOB.pCodTipDoc.toString(), Validators.required),
        NumDoc: new FormControl(vOB.pNumDoc.toString(), Validators.required) ,
        PrimerMombre: new FormControl(vOB.pPrimNom.toString(), [Validators.required,Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ ]*')]) ,
        SegundoMombre: new FormControl(vOB.pSegNom.toString(),[ Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ ]*')]) ,
        PrimerApellido: new FormControl(vOB.pApePat.toString(), [Validators.required,Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ ]*')]) ,
        SegundoApellido: new FormControl(vOB.pApeMat.toString() ,[Validators.required,Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ ]*')]) ,
        Celular:  new FormControl(vOB.pNumCelular.toString() ) ,
        CelularOpc: new FormControl(vOB.pNumCelularOpc.toString()) ,  
        Correo: new FormControl(vOB.pCorreo.toString(), Validators.required) ,
        Puesto: new FormControl({ value: vOB.pPuesto.toString(), disabled: true }, Validators.required) , 
        Direccion: new FormControl(vOB.pdireccion.toString(), Validators.required) ,
        Distrito: new FormControl(vOB.pDistrito.toString(), Validators.required) , 
        CodDistrito: new FormControl(vOB.pCodDistrito.toString())     
      });
    }
    
 
    this.ContactoFormGroup = this.formBuilder.group({
      MedioContactacion: new FormControl(vOB.pCodMedioContacto.toString(), Validators.required),
      Contactado: new FormControl(vOB.pCodContactado.toString(), Validators.required),
      Fuente: new FormControl(  vOB.pCodFuentePostu.toString(), Validators.required),
      Referido: new FormControl( vOB.pTextOpc.toString() , Validators.required),
      NoContactacion: new FormControl( vOB.pCodMotNoCont.toString(), Validators.required),
    });
   

 
    this.CitaFormGroup = this.formBuilder.group({
      Citado: new FormControl(  vOB.pCodCCitado.toString(), Validators.required),
      Fecha: new FormControl( fei, Validators.required),
      Hora: new FormControl( vOB.pCodTurno.toString(), Validators.required),
      Turno: new FormControl( vOB.pTurno.toString(), Validators.required), 
      Nocitado: new FormControl(vOB.pCodMotNoCita.toString(), Validators.required),
      UltEstCont: new FormControl('')
    });  

    Swal.fire({
      title: 'Estás seguro de Ingresar a la ficha del postulante "'+ vOB.pNom +'"', 
      showCancelButton: true,
      confirmButtonText: `Ok`, 
    }).then((result) => {
      if (result.isConfirmed){
        this.fnValdidacion();
      }
      /* Read more about isConfirmed, isDenied below */
       
    })
    
  }
 
  fnChange = function (op:number){
    if(op == 1){
      this.divList = false;
      this.divCreate = true;   
    }
    else{ 
      this.divList = true;
      this.divCreate = false; 
    }
  }

  async fnGetHorario() { 
    let pParametro = [];
    await this.vSerContacto.fnReclutamiento( 3, pParametro, this.url).then( (value: any[]) => {  
      this.lCboHorario =  value;
    });
       
  }

  fnGetUbigeo = function () {  
    this.vSerGeneral.fnUbigeos('6',this.pais, this.url).subscribe(
        res => { 
            this.lblUbigeo = res;
             
        },
        err => {
            console.log(err);
        },
        () => {
            // this.spinner.hide();

        }

    )
  }

  fnGetTipoDocumento = function () {  
    this.vSerGeneral.fnSystemElements(2, '1', '1', 'nElecod,cElenam', this.pais, this.url).subscribe(
        res => { 
            this.lCboTipoDocumento = res;
        },
        err => {
            console.log(err);
        },
        () => {
            // this.spinner.hide();

        }

    )
  }

  fnGetTipoFuente = function () {  
    this.vSerGeneral.fnSystemElements(2, '97', '1', 'nElecod,cElenam', this.pais, this.url).subscribe(
        res => { 
            this.lCboTipoFuente = res;
        },
        err => {
            console.log(err);
        },
        () => {
            // this.spinner.hide();

        }

    )
  }


  fnGetMedioContacto = function () { 

    this.vSerGeneral.fnSystemElements(2, '446', '1', 'nElecod,cElenam',  this.pais, this.url).subscribe(
        res => {
            this.lCboMedioCont = res;
        },
        err => {
            console.log(err);
        },
        () => {

        }

    )
  }

  fnGetMotivoNoCita = function () { 

      this.vSerGeneral.fnSystemElements(2, '447', '1', 'nElecod,cElenam',  this.pais, this.url).subscribe(
          res => {
              this.lCboMotNoCita = res;
          },
          err => {
              console.log(err);
          },
          () => {
              //this.spinner.hide();

          }

      )
  }

  fnGetMotivoNoCont = function () { 

      this.vSerGeneral.fnSystemElements(2, '448', '1', 'nElecod,cElenam',  this.pais, this.url).subscribe(
          res => {

              this.lCboMotNoCont = res;
          },
          err => {
              console.log(err);
          },
          () => {
              //this.spinner.hide();

          }

      )
  }

  fnValdidacion = function () {   
    this.fnChange(1);   

    this.CitaFormGroup.get('Turno').disable(); 
    this.CitaFormGroup.get('UltEstCont').disable(); 
    this.fnContactado();   
  }

  fnContactado = function () { 
    let vValidacionContacto = this.ContactoFormGroup.value; 
   
    
    if(vValidacionContacto.Contactado == "0" && vValidacionContacto.MedioContactacion != "")
    { 
      this.ContactoFormGroup.get('NoContactacion').enable();  
      this.CitaFormGroup.disable();
      this.CitaFormGroup.reset();
      if(vValidacionContacto.MedioContactacion == 452)
      {
        this.CitaFormGroup.controls.UltEstCont.setValue('No Contactado - Se envió SMS');
        this.lUltimoEstado = 'No Contactado - Se envió SMS';
      }
      else if(vValidacionContacto.MedioContactacion == 450)
      {
        this.CitaFormGroup.controls.UltEstCont.setValue('No Contactado - Se envió Whatsapp');
        this.lUltimoEstado = 'No Contactado - Se envió Whatsapp';
      }
      else
      {
        this.CitaFormGroup.controls.UltEstCont.setValue('No Contactado');
        this.lUltimoEstado = 'No Contactado';
      } 
    }
    else if(vValidacionContacto.Contactado == "1"){ 
      this.ContactoFormGroup.get('NoContactacion').disable(); 
      this.CitaFormGroup.get('Citado').enable();
      this.ContactoFormGroup.controls.NoContactacion.setValue('');  
      this.lUltimoEstado = '';
      this.fnFuente();
      this.fnCita();
      
    }
    else{ 
      this.ContactoFormGroup.get('NoContactacion').disable(); 
      this.ContactoFormGroup.controls.NoContactacion.setValue('');
      this.lUltimoEstado = '';
      this.CitaFormGroup.disable();
      this.CitaFormGroup.reset();
      this.fnFuente();
    } 
  }

  fnFuente = function () { 
    let vValidacionContacto = this.ContactoFormGroup.value; 
    
    if(vValidacionContacto.Fuente == 104|| vValidacionContacto.Fuente == 109){
      this.ContactoFormGroup.get('Referido').enable();  
    }
    else{ 
      this.ContactoFormGroup.controls.Referido.setValue(''); 
      this.ContactoFormGroup.get('Referido').disable(); 
    }

  }

  fnGetHora  = function () { 
    let vValidacionCita = this.CitaFormGroup.value; 
    const getTurno = this.lCboHorario.find(turno => turno.pIdTurno == vValidacionCita.Hora);
    this.CitaFormGroup.controls.Turno.setValue(getTurno.pTurno);  
  }

  fnCita = function(){ 
    let vValidacionCita = this.CitaFormGroup.value; 
    
    if(vValidacionCita.Citado == "1"){
      this.CitaFormGroup.get('Fecha').enable();
      this.CitaFormGroup.get('Hora').enable(); 
      this.CitaFormGroup.get('Nocitado').disable();
      this.CitaFormGroup.controls.Nocitado.setValue(''); 
      this.CitaFormGroup.controls.UltEstCont.setValue('Citado');
      this.lUltimoEstado = 'Citado';
    }
    else if (vValidacionCita.Citado == "0"){
      this.CitaFormGroup.get('Fecha').disable();
      this.CitaFormGroup.get('Nocitado').enable();
      this.CitaFormGroup.get('Hora').disable(); 
      this.CitaFormGroup.controls.Fecha.setValue('');  
      this.CitaFormGroup.controls.Hora.setValue(''); 
      this.CitaFormGroup.controls.Turno.setValue('');  
      this.fnNoCita();
    } 


  }

  fnNoCita= function(){  
    let vValidacionCita = this.CitaFormGroup.value;
    
    if(vValidacionCita.Nocitado == 455){
      this.CitaFormGroup.controls.UltEstCont.setValue('No Contactado - Trabaja en Lucky');
      this.lUltimoEstado = 'No Contactado - Trabaja en Lucky';
    }
    else if(vValidacionCita.Nocitado == 456){
      this.CitaFormGroup.controls.UltEstCont.setValue('No citado - No Interesado');
      this.lUltimoEstado = 'No citado - No Interesado';
    }
    else if(vValidacionCita.Nocitado == 457){
      this.CitaFormGroup.controls.UltEstCont.setValue('No citado - Numero Equivocado');
      this.lUltimoEstado = 'No citado - Numero Equivocado';
    }
    else if(vValidacionCita.Nocitado == 457){
      this.CitaFormGroup.controls.UltEstCont.setValue('No citado - Numero Equivocado');
      this.lUltimoEstado = 'No citado - Numero Equivocado';
    }
    else if(vValidacionCita.Nocitado == ""){
      this.CitaFormGroup.controls.UltEstCont.setValue('');
      this.lUltimoEstado = '';
    }
    else{ 
      this.CitaFormGroup.controls.UltEstCont.setValue('No citado - No Agendado');
      this.lUltimoEstado = 'No citado - No Agendado';
    }
  }


   fnAction = function(btn,op){ 
    let pParametro =[];
    let vValidacionDatos = this.DatosFormGroup.value;
    let vValidacionContacto = this.ContactoFormGroup.value;
    let vValidacionCita = this.CitaFormGroup.value;

    if(this.CitaFormGroup.invalid ||this.CitaFormGroup.invalid || this.ContactoFormGroup.invalid ){ 
      return;
    } 

    let fecha ;

    if(!vValidacionCita.Fecha){
      fecha = null;
    }
    else{
      fecha = moment( vValidacionCita.Fecha , 'MM-DD-YYYY HH:mm:ss',true).format("YYYY-MM-DD")
    }  

    pParametro.push(this.nIdPostulacion);
    pParametro.push(this.nIdPostulante);
    pParametro.push(vValidacionDatos.TipoDoc);
    pParametro.push(vValidacionDatos.NumDoc);
    pParametro.push(vValidacionDatos.PrimerMombre);
    pParametro.push(vValidacionDatos.SegundoMombre);
    pParametro.push(vValidacionDatos.PrimerApellido);
    pParametro.push(vValidacionDatos.SegundoApellido);
    pParametro.push(vValidacionDatos.Celular);
    pParametro.push(vValidacionDatos.CelularOpc);
    pParametro.push(vValidacionDatos.Correo); 
    pParametro.push(vValidacionDatos.Direccion);
    pParametro.push(vValidacionDatos.CodDistrito);
    pParametro.push(vValidacionContacto.MedioContactacion);
    pParametro.push(vValidacionContacto.Contactado);
    pParametro.push(vValidacionContacto.Fuente);
    pParametro.push(vValidacionContacto.Referido);
    pParametro.push(vValidacionContacto.NoContactacion); 
    pParametro.push(vValidacionCita.Citado);
    pParametro.push(fecha);
    pParametro.push(vValidacionCita.Hora); 
    pParametro.push(vValidacionCita.Nocitado);
    pParametro.push(this.lUltimoEstado ); 
    pParametro.push(this.id );  
    pParametro.push(this.pais );   
     
    this.spinner.show();
     this.vSerContacto.fnReclutamientoCrud(op, pParametro, this.url).subscribe(
       res => { 
         Swal.fire({
           title: res.mensaje,
           showCancelButton: true,
           confirmButtonText: `Ok`,
         }).then((result) => {
          btn.reset();
           this.fnListaReclutamiento(this.nIdOpcion);
           this.txtControl.reset();
           this.fnChange(0);
         })

       },
       err => {
         console.log(err);
         this.spinner.hide();
       },
       () => {
         this.spinner.hide();
       }
     );
 
  }

  async openDialogUbigeo() {     
    let vDatos = this.DatosFormGroup.value;   
    var vData = new Object();
      
    vData["ubigeo"] = this.lblUbigeo;
    vData["pais"] = this.pais;
    vData["primero"] = vDatos.CodDistrito.substring(3,5); 
    vData["segundo"] = vDatos.CodDistrito.substring(5,7);
    vData["tercero"] = vDatos.CodDistrito.substring(7,9);

    const dialogRef = this.dialog.open(DialogUbigeoComponent, {
      width: '300px',
      height: '350px',
      data: vData ,
    });
  
    dialogRef.afterClosed().subscribe(result => { 
      this.DatosFormGroup.controls.Distrito.setValue(result.data.desc); 
      this.DatosFormGroup.controls.CodDistrito.setValue(result.data.cod);
    }); 
 
  }
 
  async openDialogFicha() {    
    let pParametro =[];
    
    pParametro.push(this.pais); 
    pParametro.push(this.nIdPostulacion); 
     
    this.spinner.show();
    await this.vSerContacto.fnReclutamiento( 11, pParametro, this.url).then( (value: any[]) => {
      const dialogRef = this.dialog.open(FichatecnicaComponent, {
        width: '1150px',
        data: value ,
      });
  
      dialogRef.afterClosed().subscribe(result => { 
      });
    }, error => {
      console.log(error); 
    });  
    this.spinner.hide();
 
  }


  async openDialogHistorico() {    
    let pParametro =[];
    
    pParametro.push(this.pais); 
    pParametro.push(this.nIdPostulacion); 
      
      const dialogRef = this.dialog.open(HistoricoComponent, {
        width: '400px', 
      });
  
      dialogRef.afterClosed().subscribe(result => { 
      }); 
 
  }
 
} 
