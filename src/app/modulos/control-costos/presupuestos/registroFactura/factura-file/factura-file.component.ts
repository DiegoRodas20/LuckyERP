import { Component, OnInit,Inject,ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { PresupuestosService } from '../../presupuestos.service';
import { FilecontrolService } from '../../../../../shared/services/filecontrol.service';

import { Factura } from '../registroFactura.component'
// import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders, HttpEventType } from '@angular/common/http';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-factura-file',
  templateUrl: './factura-file.component.html',
  styleUrls: ['./factura-file.component.css']
})
export class FacturaFileComponent implements OnInit {

  //Tabla material
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['nIdDetGastoArchivo','sNombreArchivo', 'sExtencion','sUsuario', 'sFechaSubio', 'sHoraSubio'];

  url: string; //variable de ruta un solo valor
  idUser: number; //id del usuario
  vNumFactura: string; //Numero de factura

  formArhivo: FormGroup;
  btnAdd: boolean = true;

  filestring: string;
  private vNameRutaFile: string;
  vArchivoSeleccioado = File;
  lArchivosSoporte: any = [];

  constructor(
    private vPresupuestosService: PresupuestosService,
    private vFilecontrolService: FilecontrolService,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    @Inject('BASE_URL') baseUrl: string,
    public dialogRef: MatDialogRef<FacturaFileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {this.url = baseUrl;  }

  ngOnInit(): void {

    let user    = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;

    this.formArhivo = this.formBuilder.group({
      // cboTipoArchivo: ['', Validators.required],
      fileUpload: ['', Validators.required]
    });

    this.fnListarFile(this.data);
  }

  fnListarFile = function(vFact: any){
    var pParametro = []; //Parametros de campos vacios
    pParametro.push(vFact);

    //traemos el documento de FS
    this.vPresupuestosService.fnPresupuesto(3, 2, pParametro, 9, 0, this.url).subscribe(
        res => {
          this.vNumFactura = res.mensaje;
        },
        err => {
            this.spinner.hide();
            console.log(err);
        },
        () => {
            this.spinner.hide();
        }
    );


    this.vPresupuestosService.fnPresupuesto(3, 2, pParametro, 1, 0, this.url).subscribe(
        res => {
            this.dataSource = new MatTableDataSource(res);
            this.spinner.hide()
        },
        err => {
            this.spinner.hide();
            console.log(err);
        },
        () => {
            this.spinner.hide();
        }
    );


  }

  // **************************

  fnSeleccionarArchivo = function(event,lbl:any) {

    this.vArchivoSeleccioado = event.target.files;
    this.progreso = 0;

    var reader = new FileReader();
    reader.onload = this._handleReaderLoaded.bind(this);

    if(this.vArchivoSeleccioado.length != 0)
    {
      document.getElementById(lbl).innerHTML = this.vArchivoSeleccioado[0].name;
      reader.readAsBinaryString(this.vArchivoSeleccioado[0]);
    }
  }

  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.filestring = btoa(binaryString);
  }

  fnUploadFile = function() {

    if (!this.filestring) {
      Swal.fire('¡Verificar!', 'Debe seleccionarse un archivo', 'warning');
    }
    else
    {
      if(this.vArchivoSeleccioado.length != 0)
      {
        this.spinner.show();
        this.vFilecontrolService.fnUploadFile(this.filestring, this.vArchivoSeleccioado[0].type, 1, this.url).subscribe(
          event => {
            //console.log(event)
            if (event.type === HttpEventType.UploadProgress) {
              this.progreso = Math.round((event.loaded / event.total) * 100);
            } else if (event.type === HttpEventType.Response) {

              let res: any = event.body;

              if (res.filename) {
                // Swal.fire({
                //   position: 'center',
                //   icon: 'success',
                //   title: 'Se Subio el archivo correctamente',
                //   showConfirmButton: false,
                //   timer: 1500
                // });
                this.vNameRutaFile = res.filename;

                //Para guardar en la BD
                this.spinner.hide()
                this.fnSaveFile()
              }
            }

          },
          err => {
            console.log(err);
          },
          () => {
            this.spinner.hide();
          }
        )
      }
    }
  }

  fnSaveFile = function() {

    let user;
    let id;
    let pParametro = [];
    let vDataFiles;

    this.submitted = true;

    if (this.formArhivo.invalid) {
      return;
    } else {
      user = localStorage.getItem('currentUser');
      if (user) {
        if (!this.vNameRutaFile) {
          Swal.fire('Advertencia','Primero tiene que subir un archivo','warning');
        } else {

          this.spinner.show();
          vDataFiles = this.formArhivo.value;

          pParametro.push(this.data);
          pParametro.push(this.vNameRutaFile);
          pParametro.push(this.vArchivoSeleccioado[0].name.split('.')[0]);
          pParametro.push(this.vArchivoSeleccioado[0].name.split('.')[1]);
          pParametro.push(this.idUser)

          this.vPresupuestosService.fnPresupuesto(3, 1, pParametro, 0, 0, this.url).subscribe(
            res => {
              if (res!=0) {
                //Mostra Lista actualizada
                this.fnListarFile(this.data);

                Swal.fire({
                  position: 'center',
                  icon: 'success',
                  title: 'Se registró el archivo correctamente',
                  showConfirmButton: false,
                  timer: 1500
                }).then((result) => {
                  if (result.value) {
                    this.progreso = 0;
                    this.filestring = "";

                    this.formArhivo = this.formBuilder.group({
                      fileUpload: ['', Validators.required]
                    });

                    this.submitted = false;
                  }
                });
              }
              else
              {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Ocurrieron problemas con la conexion, su documento no se guardo, actualice y vuelva intentar!'
                })
              }
            },
            err => {
              this.spinner.hide();
            },
            () => {
              this.spinner.hide();
            }
          );
        }
      }
    }
  }

  fnDownloadFile = function(a) {
    this.spinner.show();

    let file = a.sRutaArchivo.split('/')[4];
    let type = file.split('.')[1];
    let area = 1 //Por ser proceso de control de costos

    this.vFilecontrolService.fnDownload(file, type, area, this.url).subscribe(
      (res: any) => {
        let file = a.vNomFile;
        saveAs(res, file);
      },
      err => {
        console.log(err);
        this.spinner.hide();
      },
      () => {
        this.spinner.hide();
      }
    )
  }

  fnVerFile = function(a) {
    window.open(a.sRutaArchivo, '_blank');
  }
}
