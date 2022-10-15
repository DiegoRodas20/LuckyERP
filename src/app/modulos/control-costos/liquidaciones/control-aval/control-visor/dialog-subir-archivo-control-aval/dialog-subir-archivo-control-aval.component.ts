import { HttpEventType } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { FilecontrolService } from 'src/app/shared/services/filecontrol.service';
import Swal from 'sweetalert2';
import { LiquidacionesService } from '../../../liquidaciones.service';

@Component({
  selector: 'app-dialog-subir-archivo-control-aval',
  templateUrl: './dialog-subir-archivo-control-aval.component.html',
  styleUrls: ['./dialog-subir-archivo-control-aval.component.css']
})
export class DialogSubirArchivoControlAvalComponent implements OnInit {

  // Formulario
  formArchivo: FormGroup;

  // Variables para subida de archivos
  fileBinaryString: string = null;
  vArchivoSeleccionado: any = null;
  private nombreRutaArchivo: string;
  archivoDocumentoLbl:string = "Seleccione un archivo"; // Label del Input File

  // Variables del Local Storage
  idUser :number; //id del usuario
  pPais: string;
  idEmp: string;  // id de la empresa del usuario

  constructor(private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    @Inject('BASE_URL') private baseUrl: string,
    public dialogRef: MatDialogRef<DialogSubirArchivoControlAvalComponent>,
    private vFilecontrolService: FilecontrolService,
    private vLiquidacionesService: LiquidacionesService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {

    // Asignacion de variables
    let user    = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pPais  = localStorage.getItem('Pais');
    this.idEmp  = localStorage.getItem('Empresa');

    this.formArchivo = this.formBuilder.group({
      fileUpload: ['', Validators.required]
    });
  }

  fnSeleccionarArchivo (event) {
    this.vArchivoSeleccionado = event.target.files;

    var reader = new FileReader();
    reader.onload = this._handleReaderLoaded.bind(this);

    if(this.vArchivoSeleccionado.length != 0)
    {
      console.log(this.vArchivoSeleccionado[0].name);
      this.archivoDocumentoLbl = this.vArchivoSeleccionado[0].name;
      reader.readAsBinaryString(this.vArchivoSeleccionado[0]);
    }
  }

  _handleReaderLoaded(readerEvt) {
    const binaryString = readerEvt.target.result;
    this.fileBinaryString = btoa(binaryString);
  }

  async fnGuardarArchivo(){

    this.spinner.show();

    if (!this.fileBinaryString) {
      Swal.fire('Verificar:', 'Debe seleccionar un archivo', 'warning');
      this.spinner.hide();
      return;
    }

    const response = await this.vFilecontrolService.fnUploadFile(this.fileBinaryString, this.vArchivoSeleccionado[0].type, 2, this.baseUrl).toPromise()

    if (response.type === HttpEventType.Response) {

      const result: any = response.body;

      this.nombreRutaArchivo = result.filename;

      console.log(result.filename);

      if(result.filename) {
        await this.fnActualizarDetalleArchivo();
      }

      this.spinner.hide();
    }

    this.spinner.hide();
  }

  async fnActualizarDetalleArchivo(){

    const pEntidad = 2;
    const pOpcion = 3;
    const pParametro = [];
    const pTipo = 1;

    pParametro.push(this.data.nIdDetControlAval);
    pParametro.push(this.nombreRutaArchivo);
    pParametro.push(this.vArchivoSeleccionado[0].name.split('.')[0]);
    pParametro.push(this.vArchivoSeleccionado[0].name.split('.')[1]);
    pParametro.push(this.idUser);
    pParametro.push(this.pPais)

    const result = await this.vLiquidacionesService.fnControlAval(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl).toPromise();

    if(result){

      // Reiniciar el input file
      this.archivoDocumentoLbl = "Seleccione un archivo"
      this.fileBinaryString = null;
      this.vArchivoSeleccionado = null;

      Swal.fire({
        icon: 'success',
        title: '¡Correcto!',
        text: 'El archivo se ha subido correctamente'
      });

      // Cerrar dialog
      this.dialogRef.close();
    }
    else{
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El archivo no se ha podido subir al servidor. Inténtelo más tarde'
      });
    }

  }
  //nIdDetControlAval
}
