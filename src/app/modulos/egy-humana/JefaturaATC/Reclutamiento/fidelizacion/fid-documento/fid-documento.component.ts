import { Component, OnInit, Injectable, Inject, ElementRef, ViewChild } from '@angular/core'; 
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import {MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Combo,Reclutamiento,ValDocumento  } from '../../../Model/IATC'; 
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';  
import { NgxSpinnerService } from 'ngx-spinner';
import { SerfidelizacionService   } from './../serfidelizacion.service';
import { saveAs } from 'file-saver';
import { FidVisorComponent } from '../fid-visor/fid-visor.component';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-fid-documento',
  templateUrl: './fid-documento.component.html',
  styleUrls: ['./fid-documento.component.css']
})
export class FidDocumentoComponent implements OnInit {
  url: string; 
  sPais:string
  nIdUsuario:number
  nIdPostulacion:number
  sUsuarioReviso:string
  sFechaReviso:string
  bTodoValido:boolean=false;
  bNuevaValidacion:boolean=true;
  bValidacionConfirm:boolean=false;

  dataSource: MatTableDataSource<ValDocumento>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort; 
  displayedColumns = ['Opcion','psDescDoc','pnomfile' ,'prequerido', 'nFileError'
  ]; 

  constructor(
    private spinner: NgxSpinnerService,    
    private vFidelizadorService: SerfidelizacionService, 
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<FidDocumentoComponent>,    
    @Inject('BASE_URL') baseUrl: string,
    @Inject(MAT_DIALOG_DATA) public data: ValDocumento[]) {
      this.url = baseUrl;
    }

  ngOnInit(): void { 
    this.dataSource = new MatTableDataSource(this.data);   
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;  

    this.sPais = localStorage.getItem('Pais'); 
    let user = localStorage.getItem('currentUser');    
    this.nIdUsuario = JSON.parse(window.atob(user.split('.')[1])).uid; 
    
    this.nIdPostulacion=this.data[0].nIdPostulacion

    this.fnValidarGrupoDoc();
  }


  onNoClick(): void {
    this.dialogRef.close({ data: this.bValidacionConfirm });
  }

  fnDatos(a){
    this.spinner.show('spi_lista');

    
    let file = a.pextension.split('/')[4];
    let type = file.split('.')[1];

    this.vFidelizadorService.fnDownload(file, type, this.url).subscribe(
      (res: any) => {
        let file = a.vNomFile;
        saveAs(res, file);
      },
      err => {
        console.log(err);
        this.spinner.hide('spi_lista');

      },
      () => {
        this.spinner.hide('spi_lista');
      }
    ) 
    
  }

  //#region Evento Validación Doc. Individual
  async fnChangeValidIndiv(row,event){
  
    let nFileError; //0: Revisión, 1: Correcto | 2: Volver a Cargar
    if(event.checked==true){
      nFileError=2; 
    }
    else{
      nFileError=1;
    }

    var nTipoDoc=row.pid_TipDoc;


    let pParametro= [];
    pParametro.push(this.nIdPostulacion); 
    pParametro.push(nTipoDoc); 
    pParametro.push(nFileError); 

    await this.vFidelizadorService.fnReclutamiento( 21, pParametro, this.url)
    .then( (value: any[] ) => {
      
    }, error => {
      console.log(error); 
    });  

    //Checkear Individual
    for (let i = 0; i < this.data.length; i++) { 
      if(this.data[i].pid_TipDoc==row.pid_TipDoc){
        this.data[i].nFileError=nFileError     
      }   
    }
    
    this.fnValidarGrupoDoc();
   
  }
  //#endregion

  //#region Evento Validación Doc. Grupal
  async fnValidarGrupoDoc(){
    let bValidacionConfirmada=false;

    //0: Revisión, 1: Correcto | 2: Volver a Cargar
  
      for (let i = 0; i < this.data.length; i++) { 
        //Si es requerido y no hay archivo =>no es valido
        //Si es requerido / si hay archivo y el file error:2 => no es valido
        if(this.data[i].prequerido==1 && ((this.data[i].pextension=='') || (this.data[i].pextension!='' && this.data[i].nFileError==2))  ){        
          this.bTodoValido=false;
          break;
        }            
        else{
          this.bTodoValido=true;
        }
      }

      if(this.bTodoValido==true && this.bNuevaValidacion==true){
        for (let i = 0; i < this.data.length; i++) {       
          if(this.data[i].nFileError==1 ){
            bValidacionConfirmada=true
          }  
          else {
            bValidacionConfirmada=false
            break;
          }       
        }
        if(bValidacionConfirmada==true){
          this.bValidacionConfirm=true;
          this.fnObtenerUsuarioValid();
        }
      }
      if(this.data[0].bDocumentosValidos==true){
        this.bValidacionConfirm=true
        this.fnObtenerUsuarioValid();
      }

  
    this.bNuevaValidacion=false;
  }
  //#endregion

  //#region Validar Todos los Documentos
  async fnValidarDocumentos(){

    var resp = await Swal.fire({
      title: '¿Desea validar los documentos revisados?',      
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText:'Cancelar'
    })

    if (!resp.isConfirmed) {
      return;
    }

    let pParametro= [];
    pParametro.push(this.sPais); 
    pParametro.push(this.nIdPostulacion); 
    pParametro.push(this.nIdUsuario); 
   
    this.vFidelizadorService.fnReclutamiento( 20, pParametro, this.url)
      .then( (value: any[] ) => {
        
      Swal.fire({
        title: 'Se validaron los documentos correctamente',
        icon: 'success',
        timer: 1500
      })

      this.bValidacionConfirm=true;
      this.fnObtenerUsuarioValid();

    }, error => {
      console.log(error); 
    });  

  }
  //#endregion

  //#region Vista Previa
  fnVistaPrevia(row){


    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = row.pextension
    dialogConfig.width = '1000px'
 
     this.dialog.open(FidVisorComponent, dialogConfig); 

  }
  //#endregion

  //#region  Obtener Usuarios que Validaron
  async fnObtenerUsuarioValid(){
    const pParametro = [];     
    pParametro.push(this.nIdPostulacion);
    
    var vValidador = await this.vFidelizadorService.fnReclutamiento( 22, pParametro, this.url)
    
   
    this.sUsuarioReviso=vValidador[0].sUsuarioReviso
    this.sFechaReviso=vValidador[0].sFechaReviso

  }
  //#endregion

  
}
