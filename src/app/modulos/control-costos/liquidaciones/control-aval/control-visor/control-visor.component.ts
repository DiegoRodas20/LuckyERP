import { Component, OnInit,Inject,ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { LiquidacionesService } from '../../liquidaciones.service';
import { FilecontrolService } from '../../../../../shared/services/filecontrol.service';

import { Aval } from '../control-aval.component';
import { HttpClient, HttpHeaders, HttpEventType } from '@angular/common/http';
import { saveAs } from 'file-saver';
import { isNull } from '@angular/compiler/src/output/output_ast';
import { DialogSubirArchivoControlAvalComponent } from './dialog-subir-archivo-control-aval/dialog-subir-archivo-control-aval.component';

@Component({
  selector: 'app-control-visor',
  templateUrl: './control-visor.component.html',
  styleUrls: ['./control-visor.component.css']
})
export class ControlVisorComponent implements OnInit {
  //Tabla material
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  txtFiltro = new FormControl(); // Filtro de busqueda de la tabla

  displayedColumns: string[] = ['nIdDetControlAval','sNumDocumento','nMonto','sUsuarioSubio', 'sFechaSubio', 'sUsuarioCreacion', 'sFechaCreacion'];
  nombrePersonal: string;

  // Variables del Local Storage
  url: string;  //variable de ruta un solo valor
  idUser :number; //id del usuario
  pPais: string;
  idEmp: string;  // id de la empresa del usuario

  formArchivo: FormGroup;
  btnAdd: boolean = true;

  filestring: string;
  vArchivoSeleccioado = File;
  lArchivos: any = [];

  constructor(
    private vLiquidacionesService: LiquidacionesService,
    private vFilecontrolService: FilecontrolService,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    @Inject('BASE_URL') baseUrl: string,
    public dialogRef: MatDialogRef<ControlVisorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any)
    { this.url = baseUrl; }

  async ngOnInit(): Promise<void> {

    let user    = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pPais  = localStorage.getItem('Pais');
    this.idEmp  = localStorage.getItem('Empresa');

    this.formArchivo = this.formBuilder.group({
      txtTotalFirmado: [null],
      txtMontoNuevoAval: [null, Validators.required]
    });

    // console.log(this.data)
    // console.log(this.data.data.nIdControlAval)

    this.nombrePersonal = this.data.sDescripcion;

    // Se usa setTimeout para que no salten errores de validacion
    setTimeout(async ()=>{await this.fnListarFile(this.data.nIdControlAval);})
  }

  async fnListarFile (vAval: any){

    this.spinner.show();

    var pParametro = []; //Parametros de campos vacios
    pParametro.push(vAval);

    const res = await this.vLiquidacionesService.fnControlAval(2, 2, pParametro, 1, this.url).toPromise()

    // Crear la mat-table
    this.lArchivos = res
    this.dataSource = new MatTableDataSource(this.lArchivos);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Sumar el total
    let vTotal: number = 0;
    for (let index = 0; index < this.lArchivos.length; index++) {
      if(this.lArchivos[index].sRutaArchivo || this.lArchivos[index].bProcesado){
        vTotal = vTotal + this.lArchivos[index].nMonto;
      }
    }

    vTotal = isNaN(vTotal) ? 0 : vTotal;

    this.formArchivo.get('txtTotalFirmado').setValue(vTotal.toFixed(2));

    this.spinner.hide();
  }

  // Filtrado de la tabla
  fnFiltrar(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

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

  // fnRegistrarArchivoDetalle () {

  //   if(this.formArchivo.valid){

  //     const {txtMontoNuevoAval, txtDocumento} = this.formArchivo.value


  //     this.spinner.show();

  //     this.vFilecontrolService.fnUploadFile(this.filestring, this.vArchivoSeleccioado[0].type, 2, this.url).subscribe(
  //       event => {
  //         //console.log(event)
  //         if (event.type === HttpEventType.UploadProgress) {
  //           this.progreso = Math.round((event.loaded / event.total) * 100);
  //         } else if (event.type === HttpEventType.Response) {

  //           let res: any = event.body;

  //           if (res.filename) {

  //             this.vNameRutaFile = res.filename;

  //             //Para guardar en la BD
  //             this.spinner.hide()
  //             this.fnSaveFile()
  //           }
  //         }

  //       },
  //       err => {
  //         console.log(err);
  //       },
  //       () => {
  //         this.spinner.hide();
  //       }
  //     )

  //   }
  // }

  // Metodo para descargar el archivo
  async fnDownloadFile (a) {
    this.spinner.show();

    // Si el documento firmado ha sido subido, se descarga ese documento
    if(a.sRutaArchivo){
      let file = a.sRutaArchivo.split('/')[4];
      let type = file.split('.')[1];
      let area = 2 //Por ser proceso de Liquidacion

      const res = await this.vFilecontrolService.fnDownload(file, type, area, this.url).toPromise();

      // Descargar el archivo
      const fileName = `AD-${a.nIdAuthDesc}.pdf`;
      saveAs(res, fileName);

      this.spinner.hide();
    }

    // Si el documento aun no se ha subido, se descarga el formato vacio
    else{

      // Verificar si el registro esta enlazado a un descuento
      if(a.nIdAuthDesc){
        await this.fnDescargarPDFLiquidacion(a.nIdAuthDesc);
        this.spinner.hide();
      }
      else{
        this.spinner.hide();
        Swal.fire({
          icon: 'warning',
          title: '¡Verificar!',
          text: 'Este registro no cuenta con un descuento'
        })
      }
    }
  }

  fnUploadFile(row){

    //Creamos el objeto para referenciar el dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = row;
    dialogConfig.width = "900px";

    //A la hora de cerrar taremos nuevamente la lista y si hay filtro de busqueda se aplica en el metodo
    const dialogReg = this.dialog.open(DialogSubirArchivoControlAvalComponent, dialogConfig);
    dialogReg.afterClosed().subscribe(data => {
      this.fnListarFile(this.data.nIdControlAval);
    })
  }

  async fnUpdateFile(row){

    const result = await Swal.fire({
      title: `¿Desea subir nuevamente el documento firmado?`,
      text: 'El documento anterior será remplazado por el nuevo',
      showCancelButton: true,
      confirmButtonText: `Actualizar`,
      cancelButtonText: `Cancelar`,
      icon: 'question',
      showCloseButton: true,
    })

    if (result.isConfirmed) {

      //Creamos el objeto para referenciar el dialog
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = row;
      dialogConfig.width = "900px";

      //A la hora de cerrar taremos nuevamente la lista y si hay filtro de busqueda se aplica en el metodo
      const dialogReg = this.dialog.open(DialogSubirArchivoControlAvalComponent, dialogConfig);
      dialogReg.afterClosed().subscribe(data => {
        this.fnListarFile(this.data.nIdControlAval);
      })
    }
  }

  // Metodo para inhabilitar un registro
  async fnInhabilitar(row){
    const result = await Swal.fire({
      title: `¿Desea eliminar el registro de Aval?`,
      text: 'Esta acción no se puede revertir',
      showCancelButton: true,
      confirmButtonText: `Eliminar`,
      cancelButtonText: `Cancelar`,
      cancelButtonColor: '#d33',
      icon: 'question',
      showCloseButton: true,
    })

    if (result.isConfirmed) {

      this.spinner.show();

      const pEntidad = 2;
      const pOpcion = 3;
      const pParametro = [];
      const pTipo = 2;

      pParametro.push(row.nIdDetControlAval);

      const result = await this.vLiquidacionesService.fnControlAval(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise();

      this.fnListarFile(this.data.nIdControlAval);

      // Si el registro se ha inhabilitado
      if(result != 0){
        Swal.fire({
          icon: 'success',
          title: '¡Correcto!',
          text: 'El registro se ha eliminado correctamente'
        });
      }
      else{
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'El registro no se ha podido eliminar. Inténtelo más tarde'
        });
      }

      this.spinner.hide();
    }
  }

  async fnCrearDescuento(){

    if(this.formArchivo.valid){

      const montoIngreso = Number(this.formArchivo.get("txtMontoNuevoAval").value);

      const result = await Swal.fire({
        title: `¿Desea generar el descuento con el monto de ${montoIngreso.toFixed(2)}?`,
        showCancelButton: true,
        confirmButtonText: `Generar Descuento`,
        cancelButtonText: `Cancelar`,
        icon: 'question',
        showCloseButton: true,
      })

      if (result.isConfirmed) {

          const pEntidad = 2;
          const pOpcion = 1;
          const pParametro = [];
          const pTipo = 2;

          pParametro.push(this.data.nIdPersonal);
          pParametro.push(montoIngreso);
          pParametro.push(this.idUser);
          pParametro.push(this.pPais);

          // Registrar el descuento en la tabla descuento (nIdDescuento)
          const result = await this.vLiquidacionesService.fnControlAval(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise();

          if(result){
            // Registrar el detalle del archivo vacío para futuras modificaciones
            await this.fnRegistrarArchivoDetalle(result);

              // Imprimir el documento de descuento correspondiente (nIdDescuento = result)
            await this.fnDescargarPDFLiquidacion(result);
          }
          else{

          }
      }
    }
    else {

      Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'Se debe ingresar un monto'
      })
      this.formArchivo.markAllAsTouched();
    }
  }

  async fnRegistrarArchivoDetalle (nIdDescuento) {

    if (this.formArchivo.valid) {

      this.spinner.show();
      const {txtMontoNuevoAval} = this.formArchivo.value

      const pEntidad = 2;
      const pOpcion = 1;
      const pParametro = [];
      const pTipo = 1;

      pParametro.push(this.data.nIdControlAval);
      pParametro.push(this.idUser)
      pParametro.push(this.pPais)
      pParametro.push(txtMontoNuevoAval)
      pParametro.push(nIdDescuento);

      // Registrar el detalle del archivo
      const response = await this.vLiquidacionesService.fnControlAval(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise();
      if (response) {

        // Limpiar el formulario
        this.formArchivo.patchValue({
          txtMontoNuevoAval: (0).toFixed(2)
        })
        this.formArchivo.markAsUntouched();

        //Mostrar Lista actualizada
        this.fnListarFile(this.data.nIdControlAval);

      }
      else {
        Swal.fire({
          icon: 'error',
          title: 'Problemas con la conexión',
          text: 'Su documento no se guardo. Actualice y vuelva intentar'
        })
      }

      this.spinner.hide();

    } else {
      this.formArchivo.markAllAsTouched();
      this.spinner.hide();
    }
  }

  async fnDescargarPDFLiquidacion(nIdDescuento) {

    this.spinner.show();

    const pEntidad = 4;
    const pOpcion = 2;
    const pParametro = [];
    const pTipo = 1;

    pParametro.push(nIdDescuento);
    pParametro.push(this.idEmp)

    const result = await this.vLiquidacionesService.print(pEntidad, pOpcion, pParametro, pTipo, this.url);

    // Descargar pdf
    const data = result;
    const fileName = `AD-${nIdDescuento}.pdf`; // Formato del nombre de la plantilla de descuento vacia

    saveAs(data, fileName);

    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(data, fileName);
      return;
    }
    const objectUrl = window.URL.createObjectURL(data);
    // const link = document.createElement('a');
    // link.href = objectUrl;
    // link.download = fileName;
    // // Trigger de descarga
    // link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

    this.spinner.hide();

    Swal.fire({
      title: 'El documento ha sido generado',
      html: `Si su descarga no ha comenzado, puede descargarlo <a href='${objectUrl}' download="${fileName}">aquí</a>`,
      icon: 'success',
      showCloseButton: true
    })
  }

  // Metodo para mostrar el archivo en una nueva pestanha
  fnVerFile = function(a) {

    // Validar que exista archivo
    if(a.sRutaArchivo){
      window.open(a.sRutaArchivo, '_blank');
    }
    else{
      this.spinner.hide();
      Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'Este registro no cuenta con un archivo, ingrese uno'
      })
    }
  }

}
