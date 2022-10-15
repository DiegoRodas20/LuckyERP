import { HttpEventType } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver';
import { NgxSpinnerService } from 'ngx-spinner';
import { TransporteService } from 'src/app/modulos/almacen/transporte/transporte.service';
import Swal from 'sweetalert2';
import { FilecontrolService } from '../../../../../../../../shared/services/filecontrol.service';
import { Chofer_Empresa } from '../../../../models/Chofer.model';
import { ListasTransporte } from '../../../../models/EmpresaTransporte.model';
import { Archivo_Vehiculo } from '../../../../models/Vehiculo.model';
import { ChoferArchivoVisorComponent } from './chofer-archivo-visor/chofer-archivo-visor.component';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}
@Component({
  selector: 'app-chofer-archivo',
  templateUrl: './chofer-archivo.component.html',
  styleUrls: ['./chofer-archivo.component.css']
})
export class ChoferArchivoComponent implements OnInit {

  componentVisor: ChoferArchivoVisorComponent;

  @ViewChild('archivoFile') archivoFile: ElementRef;
  @ViewChild('lblName') lblName: ElementRef;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Archivo_Vehiculo>;
  displayedColumns = ['nId', 'sTipoDoc', 'sNombreArchivo', 'sExtension', 'sUser', 'sFechaSubio', 'sEstado'];

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual
  filestring: string;
  progreso: number;
  matcher = new MyErrorStateMatcher();
  vArchivoSeleccioado = File;
  formArchivo: FormGroup;
  formArchivoChofer: FormGroup;
  nombreArchivo: string
  extension;

  lTipoDocumento: ListasTransporte[] = []
  lArchivo: Archivo_Vehiculo[] = [];
  pChofer: Chofer_Empresa;
  sNumero
  vNameRutaFile;

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    //private vCentroCostoService: CentroCostoService,
    private cdr: ChangeDetectorRef,
    private vFilecontrolService: FilecontrolService,
    private vTransporteService: TransporteService,
    @Inject('BASE_URL') baseUrl: string,
    @Inject(MAT_DIALOG_DATA) private data: Chofer_Empresa,
    public dialogRef: MatDialogRef<ChoferArchivoComponent>,
    @Inject(LOCALE_ID) private locale: string,
    public dialog: MatDialog
  ) { this.url = baseUrl; this.pChofer = data }

  ngOnInit(): void {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formArchivo = this.formBuilder.group({
      fileUpload: ['', Validators.required]
    });
    this.formArchivoChofer = this.formBuilder.group({
      cboTipo: ['', Validators.required],
      txtNombre: ['', [Validators.required, Validators.maxLength(50), this.caracterValidator]]
    })
  }

  ngAfterViewInit() {
    setTimeout(() => {

      //Para que no haya error de ngAfterContentChecked
      this.fnListarArchivosChofer();
      this.fnListarTipoDoc();
    });
  }

  fnListarTipoDoc() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 7;       //Listar todos los registros de la tabla

    this.vTransporteService.fnEmpresaTransporte(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
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

  fnListarArchivosChofer() {
    this.spinner.show();

    var pEntidad = 5;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;       //Listar todos los registros de la tabla

    pParametro.push(this.pChofer.nIdChofer);

    this.vTransporteService.fnEmpresaTransporte(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
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

  fnSubirArchivo(lblName) {
    if (this.formArchivoChofer.invalid) {
      Swal.fire('Atención:', ' Debe completar la información obligatoria!', 'warning');
      return;
    }
    if (!this.filestring) {
      Swal.fire('Atención:', 'Debe seleccionar un archivo', 'warning');
      return;
    }
    if (this.vArchivoSeleccioado.length != 0) {

      this.spinner.show();
      this.vFilecontrolService.fnUploadFile(this.filestring, this.vArchivoSeleccioado[0].type, 4, this.url).subscribe(
        event => {

          if (event.type === HttpEventType.UploadProgress) {
            this.progreso = Math.round((event.loaded / event.total) * 100);
          } else if (event.type === HttpEventType.Response) {

            let res: any = event.body;
            if (res.filename) {
              this.vNameRutaFile = res.filename;

              //Para guardar en la BD 
              var pParametro = [];
              var pEntidad = 5;
              var pOpcion = 1;
              var pTipo = 2;
              let vValidacionDatos = this.formArchivoChofer.value;

              pParametro.push(this.pChofer.nIdChofer)
              pParametro.push(vValidacionDatos.cboTipo)
              pParametro.push(this.vNameRutaFile)
              pParametro.push(vValidacionDatos.txtNombre)
              pParametro.push(this.extension)
              pParametro.push(this.idUser)
              pParametro.push(this.pPais)

              this.vTransporteService.fnEmpresaTransporte(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe((data: any) => {
                if (Number(data) > 0) {
                  Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Se Subio el archivo correctamente',
                    showConfirmButton: false,
                    timer: 1500
                  });
                  this.fnListarArchivosChofer()
                  this.archivoFile.nativeElement.value = "";
                  this.formArchivoChofer.reset();
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

  fnDescargar(row: Archivo_Vehiculo) {
    this.spinner.show();
    let file = row.sRuta.split('/')[4];
    let type = file.split('.')[1];
    let area = 4 //Por ser proceso de control de costos
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
      this.formArchivoChofer.controls['txtNombre'].setValue(nombre[0]);
      this.extension = nombre[1]
      reader.readAsBinaryString(this.vArchivoSeleccioado[0]);
    }
  }

  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.filestring = btoa(binaryString);
  }

  fnVerFile(row: Archivo_Vehiculo) {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = row.sRuta;
    dialogConfig.width = '900px'
    this.dialog.open(ChoferArchivoVisorComponent, dialogConfig);
  }

  //Funciones de validacion
  fnEvitarEspacios(formControlName: string) {

    var valor = this.formArchivoChofer.get(formControlName).value;
    if (valor == null) return;
    this.formArchivoChofer.get(formControlName).setValue(valor.trimLeft());

  }

  //#region Funcion de validacion
  caracterValidator(control: AbstractControl): ValidationErrors | null {
    const caracteres = /^[^|?/]*$/;   // /[^|?/]/
    const valid = caracteres.test(control.value);
    return !valid ? { caracterValidator: 'El texto no debe contener: "/", "|", "?"' } : null;
  }
  //#endregion

}
