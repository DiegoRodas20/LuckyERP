import { HttpEventType } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FilecontrolService } from 'src/app/shared/services/filecontrol.service';
import Swal from 'sweetalert2';
import { Listas_RT } from '../models/listasTraslado.model';
import { Archivo_Traslado } from '../models/registroTraslado.model';
import { RegistroTrasladoService } from '../registro-traslado.service';
import { MsgVisorComponent } from './msg-visor/msg-visor.component';
const IMG_FORMATO = 'image/*'
const CUALQ_FORMATO = 'application/pdf, image/*, .msg, .docx, .doc, .xlsx'
@Component({
  selector: 'app-traslado-file',
  templateUrl: './traslado-file.component.html',
  styleUrls: ['./traslado-file.component.css']
})
export class TrasladoFileComponent implements OnInit {

  @ViewChild('archivoFile') archivoFile: ElementRef;
  @ViewChild('lblName') lblName: ElementRef;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Archivo_Traslado>;
  displayedColumns = ['nId', 'sTipoDoc', 'sNombreArchivo', 'sExtension', 'sUser', 'sFechaSubio', 'sHoraSubio'];

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual
  filestring: string;
  progreso: number;
  vArchivoSeleccioado = File;
  formArchivo: FormGroup;
  formArchivoRegistro: FormGroup;
  nombreArchivo: string
  extension = '';

  lTipoDocumento: Listas_RT[] = []
  lArchivo: Archivo_Traslado[] = [];
  vRegistro: Listas_RT;
  sNumero
  vNameRutaFile;
  sFormato: string = CUALQ_FORMATO;

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private vFilecontrolService: FilecontrolService,
    private vRegTraslado: RegistroTrasladoService,
    @Inject('BASE_URL') baseUrl: string,
    @Inject(MAT_DIALOG_DATA) private data: Listas_RT,
    public dialogRef: MatDialogRef<TrasladoFileComponent>,
    @Inject(LOCALE_ID) private locale: string,
    public dialog: MatDialog
  ) { this.url = baseUrl; this.vRegistro = data }

  ngOnInit(): void {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formArchivo = this.formBuilder.group({
      fileUpload: ['', Validators.required]
    });
    this.formArchivoRegistro = this.formBuilder.group({
      cboTipo: ['', Validators.required],
      txtNombre: ['', [Validators.required, Validators.maxLength(50), this.caracterValidator]]
    })

  }

  ngAfterViewInit() {
    setTimeout(() => {

      //Para que no haya error de ngAfterContentChecked
      this.fnListarArchivos();
      this.fnListarTiposDoc();
    });
  }

  fnListarArchivos() {
    this.spinner.show();

    var pEntidad = 4;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;       //Listar todos los registros de la tabla

    pParametro.push(this.vRegistro.nId);

    this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).subscribe(
      res => {
        this.lArchivo = res;
        this.dataSource = new MatTableDataSource(this.lArchivo);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnListarTiposDoc() {
    this.spinner.show();

    var pEntidad = 4;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).subscribe(
      res => {
        this.lTipoDocumento = res;
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnSubirArchivo(lblName) {
    if (this.formArchivoRegistro.invalid) {
      Swal.fire('Atención:', ' Debe completar la información obligatoria!', 'warning');
      return;
    }
    if (!this.filestring) {
      Swal.fire('Atención:', 'Debe seleccionar un archivo', 'warning');
      return;
    }

    if (this.sFormato == IMG_FORMATO) {
      if (this.extension != 'jpeg' && this.extension != 'jpg' && this.extension != 'png' && this.extension != '') {
        this.archivoFile.nativeElement.value = "";
        this.formArchivo.reset();
        document.getElementById(lblName).innerHTML = '';
        Swal.fire('Atención:', 'El archivo seleccionado solo puede ser una imagen para este tipo de archivo!', 'warning');
        return;
      }
    }

    if (this.vArchivoSeleccioado.length != 0) {

      var tipoArchivo = this.extension == 'msg' ? 'msg' : this.vArchivoSeleccioado[0].type

      this.spinner.show();
      this.vFilecontrolService.fnUploadFile(this.filestring, tipoArchivo, 3, this.url).subscribe(
        event => {

          if (event.type === HttpEventType.UploadProgress) {
            this.progreso = Math.round((event.loaded / event.total) * 100);
          } else if (event.type === HttpEventType.Response) {

            let res: any = event.body;
            if (res.filename) {
              this.vNameRutaFile = res.filename;

              //Para guardar en la BD 
              var pParametro = [];
              var pEntidad = 4;
              var pOpcion = 1;
              var pTipo = 0;
              let vValidacionDatos = this.formArchivoRegistro.value;

              pParametro.push(this.vRegistro.nId)
              pParametro.push(vValidacionDatos.cboTipo)
              pParametro.push(this.vNameRutaFile)
              pParametro.push(vValidacionDatos.txtNombre)
              pParametro.push(this.extension)
              pParametro.push(this.idUser)
              pParametro.push(this.pPais)

              this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).subscribe((data: any) => {
                const { result } = data;
                if (Number(result) > 0) {
                  Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Se Subio el archivo correctamente',
                    showConfirmButton: false,
                    timer: 1500
                  });
                  this.fnListarArchivos()
                  this.archivoFile.nativeElement.value = "";
                  this.formArchivoRegistro.reset();
                  this.formArchivo.reset();
                  document.getElementById(lblName).innerHTML = '';
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

  fnDescargar(row) {
    this.spinner.show();
    let file = row.sRuta.split('/')[4];
    let type = file.split('.')[1];
    let area = 3 //Por ser proceso de almacen
    this.vFilecontrolService.fnDownload(file, type, area, this.url).subscribe(
      (res: any) => {

        let file = `ERP_Documento_${Math.random()}.${type}`;
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

  fnSeleccionarArchivo(event, lbl: any) {
    this.vArchivoSeleccioado = event.target.files;
    this.progreso = 0;

    var reader = new FileReader();
    reader.onload = this._handleReaderLoaded.bind(this);

    if (this.vArchivoSeleccioado.length != 0) {
      document.getElementById(lbl).innerHTML = this.vArchivoSeleccioado[0].name;
      var nombre = this.vArchivoSeleccioado[0].name.split('.');
      this.nombreArchivo = nombre[0]
      this.extension = nombre[nombre.length - 1]
      reader.readAsBinaryString(this.vArchivoSeleccioado[0]);
    }
  }

  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.filestring = btoa(binaryString);
  }

  fnVerFile(row: Archivo_Traslado) {
    window.open(row.sRuta, '_blank');
  }

  fnVerMensaje(row: Archivo_Traslado) {
    this.dialog.open(MsgVisorComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: row
    });
  }
  //Funciones de validacion
  fnEvitarEspacios(formControlName: string) {

    var valor = this.formArchivoRegistro.get(formControlName).value;
    if (valor == null) return;
    this.formArchivoRegistro.get(formControlName).setValue(valor.trimLeft());

  }

  //#region Funcion de validacion
  caracterValidator(control: AbstractControl): ValidationErrors | null {
    const caracteres = /^[^|?/]*$/;   // /[^|?/]/
    const valid = caracteres.test(control.value);
    return !valid ? { caracterValidator: 'El texto no debe contener: "/", "|", "?"' } : null;
  }
  //#endregion

  async fnEliminar(row: Archivo_Traslado) {
    var resp = await Swal.fire({
      title: '¿Desea eliminar el archivo? seleccionado',
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


    this.spinner.show();

    var pEntidad = 4;  //Para actualizar
    var pOpcion = 3;
    var pParametro = [];
    var pTipo = 0;

    pParametro.push(row.nId);

    try {
      var { result } = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise()
      if (Number(result) == 1) {
        Swal.fire({
          icon: 'success',
          title: ('Se elimino el archivo'),
          showConfirmButton: false,
          timer: 1500
        });
        this.fnListarArchivos();

      } else {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo realizar la actualización, !Revise su conexión a internet!',
          showConfirmButton: false,
          timer: 1500
        });
      }
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  fnCambiarFormato(nIdTipoDoc: number, lblName) {
    if (nIdTipoDoc == 2429) {//01-Foto
      this.sFormato = IMG_FORMATO;

      if (this.extension != 'jpeg' && this.extension != 'jpg' && this.extension != 'png' && this.extension != '') {
        this.archivoFile.nativeElement.value = "";
        this.formArchivo.reset();
        document.getElementById(lblName).innerHTML = '';
      }
    } else {
      this.sFormato = CUALQ_FORMATO;

    }

  }
}
