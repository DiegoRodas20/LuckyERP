import { Component, OnInit, Injectable, Inject, ElementRef, ViewChild } from '@angular/core';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Combo,Reclutamiento,Ficha,Puesto,Carnet } from '../../Model/IATC';  
import { SergeneralService }  from '../../../../../shared/services/sergeneral.service';  
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';   
import { SerevaluacionService } from './serevaluacion.service';
import { FichatecnicaComponent } from './../fichatecnica/fichatecnica.component';
import { HistoricoComponent } from './../historico/historico.component'; 
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table'; 

import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../../../shared/services/AppDateAdapter'; 
import * as moment from 'moment';  


@Component({
  selector: 'app-evaluacion',
  templateUrl: './evaluacion.component.html',
  styleUrls: ['./evaluacion.component.css'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ] 
})
export class EvaluacionComponent implements OnInit {
  url: string;  
  pais: string; 
  estado: Combo[];
  submitted:false;

  dataSource: MatTableDataSource<Reclutamiento>;

  txtControl  = new FormControl(); 


  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;  

  displayedColumns = ['pCodPostulacion','pTipDoc','pNumDoc','pNom','pNumCelular','pCorreo','pPuesto'
  ,'pFechaCita','pHoraCita',  'pTurno','pEvaluador'
  ]; 

  lListaCombo: any;
  lListaComboH: any;
  lListaResul: any;

  listado:any;

  lCboTipoDocumento: any;
  lCboTipoFuente: any;
  lCboMedioCont: any;
  lCboMotNoCita: any;
  lCboMotNoCont: any;
  lCboHorario: any;
  lCboPuesto:any

  lListaFidelizador: any;

  nIdPostulacion: number;
  nIdPostulante: number;
  cont: number;
  acc: number;

  puntPre: number;
  vpuntPre: string;
  puntHabi: any;
  vpuntHabi: string; 

  lFecha: string;
  lFechaVal: string;

  divList: boolean = true;
  divCreate: boolean = false;

  CambioCitaFormGroup: FormGroup;
  DatosFormGroup: FormGroup;
  ContactoFormGroup: FormGroup;
  CitaFormGroup: FormGroup;
  formEvaluacion: FormGroup;
  
  id:number;

  constructor(
    private spinner: NgxSpinnerService,
    private _adapter: DateAdapter<any>,
    private vSerGeneral: SergeneralService, 
    private formBuilder: FormBuilder  ,
    public dialog: MatDialog,
    private vSerEvaluacion: SerevaluacionService,
    @Inject('BASE_URL') baseUrl: string) 
    { 
      this.url = baseUrl;  
    }

  ngOnInit(): void {
    this._adapter.setLocale('fr');
    this.pais = localStorage.getItem('Pais'); 
    
    const user = localStorage.getItem('currentUser');
    this.id = JSON.parse(window.atob(user.split('.')[1])).uid;

    this.DatosFormGroup = this.formBuilder.group({
      TipoDoc: ['', Validators.required],
      NumDoc: ['', Validators.required],
      PrimerMombre: ['', Validators.required],
      SegundoMombre: [''],
      PrimerApellido: ['', Validators.required],
      SegundoApellido: ['', Validators.required],
      Celular:  ['', Validators.required], 
      CelularOpc: ['', Validators.required],  
      Correo: ['', Validators.required] ,  
      Puesto: [{ value:'', disabled: true } ] ,  
      Direccion: ['', Validators.required] ,  
      Distrito:['']   
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
     
    this.CambioCitaFormGroup = this.formBuilder.group({
      PuestoConsi: [''],
      Motivo: [''], 
    });

    this.formEvaluacion = this.formBuilder.group({
      cboContextura: ['', Validators.required],
      cboSonrisa: ['', Validators.required],
      cboImagen: ['', Validators.required],
      cboComunicacion: ['', Validators.required],
      cboOrientacion: ['', Validators.required],
      cboNegociacion: ['', Validators.required],
      cboFlexibilidad: ['', Validators.required],
      cboExperiencia: ['', Validators.required],
      cboEstEva: ['', Validators.required],
      cboFil: ['', Validators.required]
    });

    this.DatosFormGroup.disable();
    this.ContactoFormGroup.disable();
    this.CitaFormGroup.disable();

    this.fnGetCombo();
    this.fnGetHorario();
    this.fnGetTipoDocumento();
    this.fnGetTipoFuente();
    this.fnGetMedioContacto();
    this.fnGetMotivoNoCita();
    this.fnGetMotivoNoCont();
    this.fnGetPuesto();
    this.fnGetFidelizador();
    
    this.fnListaReclutamiento(); 
     
  }

  fnGetFidelizador = function () {
    this.vSerGeneral.fnSystemElements(1, '1', '1', 'nElecod,cElenam', 'FIDELIZADOR', this.url).subscribe(
        res => { 
          this.lListaFidelizador=res;            
        },
        err => {
            console.log(err);
        },
        () => {
            // this.spinner.hide();
        }
    )
  }

  //#region Obtener Puestos de Evaluacion
  fnGetPuesto = function () {

    let pParametro= [];
    pParametro.push(''); 
   
    this.vSerEvaluacion.fnReclutamiento( 19, pParametro, this.url)
      .then( (value: any[] ) => {
        this.lCboPuesto = value;
    }, error => {
      console.log(error); 
    });  

  }
  //#endregion 
  
  fnGetCombo  = function () { 
      this.estado =  
      [ 
        { id: '0', valor: 'No' },
        { id: '1', valor: 'Si' }, 
      ];

      this.lListaCombo =
        [
          { id: '', valor: 'Seleccione' },
          { id: '1', valor: '1' },
          { id: '2', valor: '2' },
          { id: '3', valor: '3' },
          { id: '4', valor: '4' },
          { id: '5', valor: '5' }
        ]
        this.lListaComboH =
        [
          { id: '', valor: 'Seleccionar' },
          { id: '1', valor: 1 },
          { id: '2', valor: 2 },
          { id: '3', valor: 3 },
          { id: '4', valor: 4 },
          { id: '5', valor: 5 },
          { id: '6', valor: 6 },
          { id: '7', valor: 7 },
          { id: '8', valor: 8 },
          { id: '9', valor: 9 },
          { id: '10', valor: 10 }
        ]

      this.lListaResul =
        [
          { id: '', valor: 'Seleccione' },
          { id: '1', valor: 'No Apto' },
          { id: '2', valor: 'En Desarrollo' },
          { id: '3', valor: 'Apto por Potenciar' },
          { id: '4', valor: 'Apto' },
          { id: '5', valor: 'Apto con Excelencia' }
        ]
  }
  
  get f() {
    return this.formEvaluacion.controls;
  }

  async fnListaReclutamiento() {
    let pParametro= [];
    pParametro.push(this.pais); 
    this.spinner.show(); 
    await this.vSerEvaluacion.fnReclutamiento( 5, pParametro, this.url).then( (value: any[]) => {
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
    this.spinner.show();
    await this.vSerEvaluacion.fnReclutamiento( 3, pParametro, this.url).then( (value: any[]) => {
      this.lCboHorario =  value; 
    }, error => {
      console.log(error); 
    });  
    this.spinner.hide();  
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

  async fnDatos(id) {
    let pParametro= [];
    pParametro.push(this.pais);
    pParametro.push(id);   
    
    this.spinner.show();
    await this.vSerEvaluacion.fnReclutamiento( 6, pParametro, this.url).then( (value: any[]) => {
      this.listado =  value;
      this.fnLLenado(value); 
     
      
    }, error => {
      console.log(error); 
    });  
    this.spinner.hide(); 
  }

  convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;   
  }

  fnLLenado= function (vOB) {

    this.acc = 0; 
    this.cont = 0;
    this.x = setInterval(() => { 
      if(this.acc == 0){
        this.cont +=1; 
      }else{
        this.cont = 0; 
        clearInterval(this.x);   
      } 
    }, 1000); 

    this.nIdPostulacion = vOB.pCodPostulacion ;  
    this.nIdPostulante = vOB.pCodPostulante ;  

    if(this.pais == '604'){
      this.DatosFormGroup = this.formBuilder.group({
        TipoDoc: new FormControl(vOB.pCodTipDoc.toString(), Validators.required),
        NumDoc: new FormControl(vOB.pNumDoc.toString(), Validators.required) ,
        PrimerMombre: new FormControl(vOB.pPrimNom.toString(), Validators.required) ,
        SegundoMombre: new FormControl(vOB.pSegNom.toString()) ,
        PrimerApellido: new FormControl(vOB.pApePat.toString(), Validators.required) ,
        SegundoApellido: new FormControl(vOB.pApeMat.toString(), Validators.required) ,
        Celular:  new FormControl(vOB.pNumCelular.toString(), Validators.required) ,
        CelularOpc: new FormControl(vOB.pNumCelularOpc.toString()) ,  
        Correo: new FormControl(vOB.pCorreo.toString(), Validators.required) ,
        Puesto: new FormControl({ value: vOB.pPuesto.toString(), disabled: true }, Validators.required) , 
        Direccion: new FormControl(vOB.pdireccion.toString(), Validators.required) ,
        Distrito: new FormControl(vOB.pDistrito.toString()) ,  
      });
    }
    else {
      this.DatosFormGroup = this.formBuilder.group({
        TipoDoc: new FormControl(vOB.pCodTipDoc.toString(), Validators.required),
        NumDoc: new FormControl(vOB.pNumDoc.toString(), Validators.required) ,
        PrimerMombre: new FormControl(vOB.pPrimNom.toString(), Validators.required) ,
        SegundoMombre: new FormControl(vOB.pSegNom.toString()) ,
        PrimerApellido: new FormControl(vOB.pApePat.toString(), Validators.required) ,
        SegundoApellido: new FormControl(vOB.pApeMat.toString()) ,
        Celular:  new FormControl(vOB.pNumCelular.toString(), Validators.required) ,
        CelularOpc: new FormControl(vOB.pNumCelularOpc.toString()) ,  
        Correo: new FormControl(vOB.pCorreo.toString(), Validators.required) ,
        Puesto: new FormControl({ value: vOB.pPuesto.toString(), disabled: true }, Validators.required) , 
        Direccion: new FormControl(vOB.pdireccion.toString(), Validators.required) ,
        Distrito: new FormControl(vOB.pDistrito.toString()) ,  
      });
    }
    
 
    this.ContactoFormGroup = this.formBuilder.group({
      MedioContactacion: new FormControl(vOB.pCodMedioContacto.toString(), Validators.required),
      Contactado: new FormControl(vOB.pCodContactado.toString(), Validators.required),
      Fuente: new FormControl(  vOB.pCodFuentePostu.toString(), Validators.required),
      Referido: new FormControl( vOB.pTextOpc.toString() , Validators.required),
      NoContactacion: new FormControl( vOB.pCodMotNoCont.toString(), Validators.required),
    });
   
    this.lFecha= vOB.pFechaCita.toString();
    this.lFechaVal = vOB.pFechaCita.toString();

    
    let fei  = this.convertUTCDateToLocalDate(new Date(vOB.pFechaCita.toString()));

    this.CitaFormGroup = this.formBuilder.group({
      Citado: new FormControl(  vOB.pCodCCitado.toString(), Validators.required),
      Fecha: new FormControl( fei, Validators.required),
      Hora: new FormControl( vOB.pCodTurno.toString(), Validators.required),
      Turno: new FormControl( vOB.pTurno.toString(), Validators.required), 
      Nocitado: new FormControl(vOB.pCodMotNoCita.toString(), Validators.required),
      UltEstCont: new FormControl(vOB.pUltEstCont.toString(), Validators.required)
    });  
    
    this.CambioCitaFormGroup = this.formBuilder.group({
      PuestoConsi: new FormControl(typeof vOB.codPuestoCon=="undefined"?  '':vOB.codPuestoCon.toString()),
      Motivo: new FormControl(typeof vOB.motivo=="undefined"?  '':vOB.motivo.toString()) 
    });

    
    this.formEvaluacion = this.formBuilder.group({ 
      cboContextura: new FormControl(vOB.nContextura.toString(), Validators.required), 
      cboSonrisa: new FormControl(vOB.nSonrisa.toString(), Validators.required), 
      cboImagen: new FormControl(vOB.nImagen.toString(), Validators.required), 
      cboComunicacion: new FormControl(vOB.nComunicacion.toString(), Validators.required), 
      cboOrientacion: new FormControl(vOB.nOrientacion.toString(), Validators.required), 
      cboNegociacion: new FormControl(vOB.nNegociacion.toString(), Validators.required), 
      cboFlexibilidad: new FormControl(vOB.nReflexion.toString(), Validators.required), 
      cboExperiencia: new FormControl(typeof vOB.codIdExperiencia==="undefined"?  '':vOB.codIdExperiencia.toString()  , Validators.required), 
      cboEstEva: new FormControl(typeof vOB.codEstadoEvaluacion==="undefined"?  '':vOB.codEstadoEvaluacion.toString(), Validators.required), 
      cboFil: new FormControl(typeof vOB.codUsuFid==="undefined"?  '':vOB.codUsuFid.toString(), Validators.required), 
    });   

    this.fnChangeEva(vOB.nContextura.toString(),vOB.nSonrisa.toString(),vOB.nImagen.toString(),0,0)
    this.fnChangeEva(vOB.nComunicacion.toString(),vOB.nOrientacion.toString(),vOB.nNegociacion.toString(),vOB.nReflexion.toString(),1)
    this.vpuntPre = vOB.resPre;
    this.vpuntHabi = typeof vOB.resHab==="undefined"?  '':vOB.resHab;

    Swal.fire({
      title: 'Estás seguro de evaluar al postulante "'+ vOB.pNom +'"', 
      showCancelButton: true,
      confirmButtonText: `Ok`, 
    }).then((result) => {
      if (result.isConfirmed){
        this.fnValdidacion();
      }
      /* Read more about isConfirmed, isDenied below */
       
    })
    
  }

  fnValdidacion = function () {   
    this.fnChange(1);   
    this.DatosFormGroup.disable();
    this.ContactoFormGroup.disable(); 
    
    this.CitaFormGroup.get('Fecha').disable();   
    this.CitaFormGroup.get('Hora').disable();   
    this.CitaFormGroup.get('Turno').disable();   
    this.CitaFormGroup.get('Nocitado').disable();  
    this.CitaFormGroup.get('UltEstCont').disable(); 
    this.CitaFormGroup.get('Citado').disable();  

  }

  fnChangeEva = function (a, b, c, d, op) {
    if(a == ''){a=0}
    if(b == ''){b=0}
    if(c == ''){c=0}
    if(d == ''){d=0}
    if (op == 1) {  
      let punto = (parseInt(a) + parseInt(b) + parseInt(c) + parseInt(d))/4*10
      this.puntHabi = punto +' %'; 
      

      if (punto < 50) {
        this.vpuntHabi = 'No Apto';
      }
      else if (punto < 70) {
        this.vpuntHabi = 'En Desarrollo';
      }
      else if (punto < 85) {
        this.vpuntHabi = 'Apto con Observación';
      }
      else if (punto < 99.5) {
        this.vpuntHabi = 'Apto';
      }
      else {
        this.vpuntHabi = 'Apto con Excelencia';
      }
    }
    else if (op == 0) { 
      this.puntPre = parseInt(a) + parseInt(b) + parseInt(c)

      if (this.puntPre < 5) {
        this.vpuntPre = 'No Apto';
      }
      else if (this.puntPre < 6) {
        this.vpuntPre = 'En Desarrollo';
      }
      else if (this.puntPre < 7) {
        this.vpuntPre = 'Apto con Observacion';
      }
      else if (this.puntPre < 9) {
        this.vpuntPre = 'Apto';
      }
      else {
        this.vpuntPre = 'Apto con Excelencia';
      }
    }
  }

  first(v: string ) { 
    this.lFecha =  v 
  }

  fnAction = function (btn) { 
    this.submitted =true;
    let pParametro =[];
    let vValidacionCita = this.CitaFormGroup.value; 
    let vDatosEvaluador = this.formEvaluacion.value; 
    let vValidacionCam  = this.CambioCitaFormGroup.value; 

    if(this.CitaFormGroup.invalid ||this.formEvaluacion.invalid ){ 
      return;
    } 
 
    if(this.lFechaVal != this.lFecha && vValidacionCam.Motivo == ""){ 
      Swal.fire({
        icon: 'error',
        title: 'error',
        text: 'Si ha cambiado la fecha de la cita por favor indique cual es el motivo' 
      })
      return;
    }

    if(vValidacionCam.PuestoConsi!=''){
      if(vValidacionCam.Motivo == '' || vValidacionCam.Motivo == undefined){
        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: 'El campo Motivo, de la pestaña Evaluación es obligatorio al seleccionar un puesto' 
        })
        return;
      }
    }
    
     
    pParametro.push(this.nIdPostulacion);
    pParametro.push(this.nIdPostulante);
    pParametro.push(moment( vValidacionCita.Fecha , 'MM-DD-YYYY HH:mm:ss',true).format("YYYY-MM-DD"));
    pParametro.push(vValidacionCita.Hora); 
    pParametro.push(vValidacionCam.PuestoConsi);
    pParametro.push(vValidacionCam.Motivo);
    pParametro.push(vDatosEvaluador.cboContextura);
    pParametro.push(vDatosEvaluador.cboSonrisa);
    pParametro.push(vDatosEvaluador.cboImagen);
    pParametro.push(vDatosEvaluador.cboComunicacion);
    pParametro.push(vDatosEvaluador.cboOrientacion);
    pParametro.push(vDatosEvaluador.cboNegociacion);
    pParametro.push(vDatosEvaluador.cboFlexibilidad);
    pParametro.push(vDatosEvaluador.cboExperiencia);
    pParametro.push(vDatosEvaluador.cboEstEva);
    pParametro.push(vDatosEvaluador.cboFil);
    pParametro.push(this.vpuntHabi) ;
    pParametro.push(this.vpuntPre) ;
    pParametro.push(this.cont);
    pParametro.push(this.id );  
    pParametro.push(this.pais ); 
    this.acc=1;

    this.vSerEvaluacion.fnReclutamientoCrud(7, pParametro, this.url).subscribe(
      res => {    
        Swal.fire({
          title: res.mensaje, 
          showCancelButton: true,
          confirmButtonText: `Ok`, 
        }).then((result) => {
          btn.reset();
          this.fnListaReclutamiento();
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

  async openDialogFicha() {    
    let pParametro =[];
    
    pParametro.push(this.pais); 
    pParametro.push(this.nIdPostulacion); 
    
    this.spinner.show();
    await this.vSerEvaluacion.fnReclutamiento( 11, pParametro, this.url).then( (value: any[]) => {
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
        data: {op:0,titulo:'Historico'}
      });
  
      dialogRef.afterClosed().subscribe(result => { 
      }); 
 
  }

  fnLimpiarPuestoCons(){
    this.CambioCitaFormGroup.controls.PuestoConsi.setValue('');     
  }

  
}
 