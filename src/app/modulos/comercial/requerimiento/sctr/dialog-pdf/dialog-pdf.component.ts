import { HttpEventType } from '@angular/common/http';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { FilecontrolService } from 'src/app/shared/services/filecontrol.service';
import { Observable, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { DialogPdfVisorComponent } from '../dialog-pdf-visor/dialog-pdf-visor.component';
import { SctrService } from '../sctr.service';

@Component({
  selector: 'app-dialog-pdf',
  templateUrl: './dialog-pdf.component.html',
  styleUrls: ['./dialog-pdf.component.css']
})
export class DialogPdfComponent implements OnInit {

  url: string;
  nIdUsuario: number;
  sPais: string;
  nIdEmpresa: string;
  nAreaBlob: number;

  nIdGastoCosto: number;
  nTipoModal: number;
  NroPPTO: string;

  sNombreRS: string;
  vArchivoSeleccionado = File;
  nombreArchivo: string;
  sNombreArchivoNuevo: string

  fileUpload = new FormControl();
  filestring: string;
  extension: any;

  progreso: number;
  vNameRutaFile: any;

  @ViewChild('archivoFile') archivoFile: ElementRef;
  @ViewChild('lblName') lblName: ElementRef;

  displayedColumns: string[] = ['opcion', 'usuario', 'fecha'];
  dataSource = new MatTableDataSource([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private spinner: NgxSpinnerService,
    @Inject('BASE_URL') baseUrl: string,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private vFilecontrolService: FilecontrolService,
    public dialogRef: MatDialogRef<DialogPdfComponent>,
    public dialog: MatDialog,
    public vSCTRservice: SctrService,
  ) {
    this.url = baseUrl;
    this.nAreaBlob = 13 //Area de Blob para SCTR
  }

  ngOnInit(): void {
    let user = localStorage.getItem('currentUser');
    this.nIdUsuario = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.sPais = localStorage.getItem('Pais');
    this.nIdEmpresa = localStorage.getItem('Empresa');


    this.nIdGastoCosto = this.data.nIdGastoCosto;
    this.sNombreRS = this.data.NroRQ;
    this.nTipoModal = this.data.nTipo;
    this.NroPPTO = this.data.NroPPTO

    this.fnListarArchivos();

  }

  //#region Seleccionar Archivo
  fnSeleccionarArchivo = function (event, lbl: any) {

    this.vArchivoSeleccionado = event.target.files;
    this.progreso = 0;

    var reader = new FileReader();
    reader.onload = this._handleReaderLoaded.bind(this);

    if (this.vArchivoSeleccionado.length != 0) {
      document.getElementById(lbl).innerHTML = this.vArchivoSeleccionado[0].name;
      let nombre: string = this.vArchivoSeleccionado[0].name.split('.');
      this.nombreArchivo = nombre[0]
      //this.formOrdenCompra.controls['nombre'].setValue(nombre[0]);
      this.extension = nombre[1].toLowerCase();

      if (this.extension != "pdf") {
        this.vArchivoSeleccionado = '';
        this.progreso = 0;
        this.nombreArchivo = '';

        this.archivoFile.nativeElement.value = "";
        this.extension = '';
        Swal.fire('¡Atencion!', 'Solo es permitido archivos de formato pdf', 'warning');
        return;
      }

      reader.readAsBinaryString(this.vArchivoSeleccionado[0]);
    }
  }


  fnSelectArchivo(event, lbl: any) {
    this.vArchivoSeleccionado = event.target.files;
    this.progreso = 0;

    var reader = new FileReader();
    reader.onload = this._handleReaderLoaded.bind(this);

    if (this.vArchivoSeleccionado.length != 0) {
      document.getElementById(lbl).innerHTML = this.vArchivoSeleccionado[0].name;
      let nombre: string = this.vArchivoSeleccionado[0].name.split('.');

      this.nombreArchivo = nombre[0]
      this.extension = nombre[1].toLowerCase();

      if (this.extension != "pdf") {
        /* this.vArchivoSeleccionado = ''; */
        this.progreso = 0;
        this.nombreArchivo = '';
        this.archivoFile.nativeElement.value = "";
        this.extension = '';
        Swal.fire('¡Atencion!', 'Solo es permitido archivos de formato pdf', 'warning');
        return;
      }

      reader.readAsBinaryString(this.vArchivoSeleccionado[0]);
    }
  }


  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.filestring = btoa(binaryString);
  }
  //#endregion


  //#region Subir PDF
  async fnUploadFile(lbl) {

    if (!this.filestring) {
      Swal.fire('Atención:', 'Debe seleccionar un archivo', 'warning');
    }
    else {
      if (this.vArchivoSeleccionado.length != 0) {


        this.spinner.show();
        this.vSCTRservice.fnUploadFile(this.sNombreArchivoNuevo, this.filestring, this.vArchivoSeleccionado[0].type, 13, this.url).subscribe(
          event => {

            if (event.type === HttpEventType.UploadProgress) {
              this.progreso = Math.round((event.loaded / event.total) * 100);
            } else if (event.type === HttpEventType.Response) {

              let res: any = event.body;
              if (res.filename) {
                this.vNameRutaFile = res.filename;

                //Para guardar en la BD 
                const pParametro = [];
                pParametro.push(this.sPais)
                pParametro.push(this.nIdUsuario)
                pParametro.push(this.nIdEmpresa)
                pParametro.push(this.nIdGastoCosto)
                pParametro.push(this.vNameRutaFile)
                pParametro.push(this.extension)


                this.vSCTRservice.fnSctr(36, pParametro, this.url).subscribe((data: any) => {

                  if (data[0] == "01") {
                    Swal.fire({
                      position: 'center',
                      icon: 'success',
                      title: 'Se Subió el archivo correctamente',
                      showConfirmButton: false,
                      timer: 1500
                    });

                    this.fnEnviarCorreo();
                    this.fnListarArchivos();
                    this.archivoFile.nativeElement.value = "";

                    this.fileUpload.setValue('');
                    document.getElementById(lbl).innerHTML = '';

                  }
                })
                this.spinner.hide()
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
  //#endregion


  //#region Listar Archivos PDF's
  async fnListarArchivos() {
    let pParametro = [];
    pParametro.push(this.nIdGastoCosto);

    this.vSCTRservice.fnSctr(37, pParametro, this.url).subscribe(
      data => {

        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        //this.dataSource.sort = this.sort;

      }
    )

  }
  //#endregion


  //#region Nombre Archivo
  async fnNombreArchivo(lbl) {
    let pParametro = [];
    pParametro.push(this.nIdEmpresa)
    pParametro.push(this.nIdGastoCosto);

    this.vSCTRservice.fnSctr(42, pParametro, this.url).subscribe(
      data => {

        this.sNombreArchivoNuevo = data.datos

        this.fnUploadFile(lbl)
      }
    )

  }
  //#endregion


  //#region Descargar PDF
  fnDescargar(a): void {
    this.spinner.show();
    let file = a.sRutaArchivo.split('/')[4];
    let type = file.split('.')[1];
    this.vFilecontrolService.fnDownload(file, type, this.nAreaBlob, this.url).subscribe(
      (res: any) => {

        let file = `${a.sNombreArchivo}.pdf`;


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
  //#endregion


  //#region Vista Previa
  fnVistaPrevia(row) {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = row.sRutaArchivo
    dialogConfig.width = '1000px'

    this.dialog.open(DialogPdfVisorComponent, dialogConfig);

  }
  //#endregion


  //#region Eliminar Archivo PDF de Azure
  EliminarSCAzure(urlFile): Observable<any> {

    const subject = new Subject();
    this.vSCTRservice.fnDeleteFileAzure(this.url, urlFile, this.nAreaBlob).subscribe(res => {
      subject.next(res);
    });
    return subject.asObservable();
  }
  //#endregion


  //#region Eliminar Pdf de Tabla
  async fnEliminarPDF(element) {

    var resp = await Swal.fire({
      title: '¿Desea eliminar el archivo?',
      text: "Una vez que se elimine el registro no se podrá recuperar el archivo",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    })

    if (!resp.isConfirmed) {
      return;
    }

    let urlFile = element.sRutaArchivo

    let pParametro = [];
    pParametro.push(this.nIdGastoCosto);
    pParametro.push(urlFile)

    this.vSCTRservice.fnSctr(43, pParametro, this.url).subscribe(
      data => {

        this.fnListarArchivos();
        this.EliminarSCAzure(urlFile);


      }
    )
  }

  //#endregion


  //#region Enviar Correo
  async fnEnviarCorreo() {

    let nIdGastoCosto = this.nIdGastoCosto

    let pParametro = [];

    pParametro.push(this.sPais);
    pParametro.push(this.nIdEmpresa);
    pParametro.push(this.nIdUsuario)
    pParametro.push(nIdGastoCosto)

    await this.vSCTRservice.fnSctrV2(41, pParametro, this.url).then((value: any) => {

      console.log('Parametros para correo')
      console.log(pParametro)
      console.log('Estado que se envio el correo')


    }, error => {
      console.log(error);
    });

  }
  //#endregion

}
