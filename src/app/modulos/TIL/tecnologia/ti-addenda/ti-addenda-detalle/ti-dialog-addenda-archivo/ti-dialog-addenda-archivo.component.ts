import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import Swal from 'sweetalert2';
import { AddendaArchivoDTO } from '../../../api/models/addendaTIDTO';
import { AddendaService } from '../../../api/services/addenda.service';

@Component({
  selector: 'app-ti-dialog-addenda-archivo',
  templateUrl: './ti-dialog-addenda-archivo.component.html',
  styleUrls: ['./ti-dialog-addenda-archivo.component.css']
})
export class TiDialogAddendaArchivoComponent implements OnInit {

  formArchivo: FormGroup;
  formArchivoRegistro: FormGroup;
  vArchivoSeleccionado: File[] = [];
  fileString = '';
  extension = '';

  @ViewChild('archivoFile') archivoFile: ElementRef;


  storageData: SecurityErp;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<AddendaArchivoDTO>;
  displayedColumns = ['opcion', 'sNombreArchivo', 'sUsrSubio', 'sFechaSubio', 'sHoraSubio'];

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TiDialogAddendaArchivoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      nIdAddenda: number, sNumero: string
    },
    private spinner: NgxSpinnerService,
    private _addendaService: AddendaService,
  ) { }

  ngOnInit(): void {
    this.formArchivo = this.formBuilder.group({
      fileUpload: ['', Validators.required]
    });
    this.formArchivoRegistro = this.formBuilder.group({
      txtNombre: ['', [Validators.required, Validators.maxLength(50)]]
    })

    this.storageData = new SecurityErp();
  }

  ngAfterViewInit() {
    setTimeout(async () => {

      //Para que no haya error de ngAfterContentChecked
      this.spinner.show();
      await this.GetArchivoAddenda();
      this.spinner.hide();
    });
  }

  async GetArchivoAddenda(){
    let response = await this._addendaService.GetArchivoAddenda(this.data.nIdAddenda)
    this.dataSource = new MatTableDataSource(response.response.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async fnSeleccionarArchivo(event, lbl: any) {
    this.vArchivoSeleccionado = event.target.files;
    var reader = new FileReader();
    reader.onload = this._handleReaderLoaded.bind(this);

    if (this.vArchivoSeleccionado.length != 0) {
      document.getElementById(lbl).innerHTML = this.vArchivoSeleccionado[0].name;
      var nombre = this.vArchivoSeleccionado[0].name.split('.');
      this.extension = nombre.pop();
      reader.readAsBinaryString(this.vArchivoSeleccionado[0]);
    }
  }

  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.fileString = btoa(binaryString);
  }

  async fnSubirArchivo(lblName) {
    if (this.formArchivoRegistro.invalid) {
      Swal.fire('Atención', 'Debe completar la información obligatoria', 'warning');
      return;
    }

    if(this.formArchivoRegistro.controls.txtNombre.value.trim()==''){
      Swal.fire('Atención', 'Debe completar la información obligatoria', 'warning');
      return;
    }

    if (!this.fileString) {
      Swal.fire('Atención', 'Debe seleccionar un archivo', 'warning');
      return;
    }

    if (this.vArchivoSeleccionado.length == 0) {
      Swal.fire('Atención', 'Debe seleccionar un archivo', 'warning');
      return;
    }

    let model: AddendaArchivoDTO = {
      nIdDetAddendaArchivo: 0,
      nIdAddenda: this.data.nIdAddenda,
      sRutaArchivo: '',
      sNombreArchivo: this.formArchivoRegistro.controls.txtNombre.value,
      nIdUsrSubio: Number(this.storageData.getUsuarioId()),
      sUsrSubio: '',
      dFechaSubio: null,
      fileString: this.fileString,
      extension: this.extension,
      sIdPais: this.storageData.getPais(),
      type: this.vArchivoSeleccionado[0].type
    }
    
    this.spinner.show();

    try {
      let result = await this._addendaService.InsertArchivo(model);
      if (!result.success) {
        let mensaje = result.errors.map(item => {
          return item.message
        })
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: mensaje.join(', '),
        });
        return;
      }

      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se guardo el registro',
        showConfirmButton: false,
        timer: 1500
      });
      this.spinner.hide();

      await this.GetArchivoAddenda();
      this.archivoFile.nativeElement.value = "";
      this.formArchivoRegistro.reset();
      this.formArchivo.reset();
      document.getElementById(lblName).innerHTML = '';
    }
    catch (err) {
      console.log(err);
    }
  }

  fnDescargar(row: AddendaArchivoDTO) {
    window.open(row.sRutaArchivo, '_blank');
  }

}
