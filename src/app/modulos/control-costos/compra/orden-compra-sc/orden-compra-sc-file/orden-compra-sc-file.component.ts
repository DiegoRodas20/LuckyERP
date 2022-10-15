import { Component, OnInit, Injectable, Inject, ElementRef, ViewChild, ViewChildren, LOCALE_ID } from '@angular/core';
import { DatePipe, formatDate } from '@angular/common';
import { HttpClient, HttpHeaders, HttpEventType } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ErrorStateMatcher, MAT_DATE_FORMATS } from '@angular/material/core';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';

import { ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FilecontrolService } from '../../../../../shared/services/filecontrol.service';
import { CompraService } from '../../compra.service';
import { saveAs } from 'file-saver';
import { OrdenCompraScVisorComponent } from '../orden-compra-sc-visor/orden-compra-sc-visor.component';
import { CompraScService } from '../services/compra-sc.service';
import { Documento } from '../models/general.entity';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}
export const DD_MM_YYYY_Format = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
  selector: 'app-orden-compra-sc-file',
  templateUrl: './orden-compra-sc-file.component.html',
  styleUrls: ['./orden-compra-sc-file.component.css'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_Format },
    DatePipe
  ]
})
export class OrdenCompraScFileComponent implements OnInit {

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('archivoFile') archivoFile: ElementRef;
  @ViewChild('lblName') lblName: ElementRef;
  displayedColumns: string[] = ['nId', 'tipo', 'sNombreArchivo', 'total', 'emision', 'recepcion', 'vence', 'estado', 'sUsuario', 'sFechaSubio'];
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
  formOrdenCompra: FormGroup;
  nombreArchivo: string
  extencion
  nIdGasto
  sNumero
  vNameRutaFile
  tipoDocumento: Documento[];
  //===================================
  pOpcion = 2;  //CRUD -> Listar
  pParametro = []; //Parametros de campos vacios
  pDetalle = []//Parametros de campos vacios
  //===================================
  datePipeString
  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    //private vCentroCostoService: CentroCostoService,
    private cdr: ChangeDetectorRef,
    private vFilecontrolService: FilecontrolService,
    private rutas: CompraService,
    @Inject('BASE_URL') baseUrl: string,
    @Inject(MAT_DIALOG_DATA) private data: any,
    public dialogRef: MatDialogRef<OrdenCompraScFileComponent>,
    private datePipe: DatePipe,
    @Inject(LOCALE_ID) private locale: string,
    public dialog: MatDialog
    // @Inject(MAT_DIALOG_DATA) public data: CentroCosto_Asig
    , private service: CompraScService,
  ) { this.url = baseUrl; this.nIdGasto = data }

  ngOnInit(): void {
    let user = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pPais = localStorage.getItem('Pais');

    this.formArchivo = this.formBuilder.group({
      fileUpload: ['', Validators.required]
    });
    this.formOrdenCompra = this.formBuilder.group({
      snumero: ['',],
      lstTipoDoc: ['', Validators.required],
      nombre: ['', Validators.required],
      fechaEmision: ['', Validators.required],
      fechaRecepcion: ['', Validators.required],
      fechaVencimiento: [],
      total: ['', Validators.required],
    })
    this.fnListaArchivo();
    this.sNumero = this.nIdGasto.Numero
    this.fnCargarTipoDocumento()
    this.datePipeString = formatDate(Date.now(), 'yyyy-MM-dd', this.locale);
  }
  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }

  fnSeleccionarArchivo = function (event, lbl: any) {
    this.vArchivoSeleccioado = event.target.files;
    this.progreso = 0;
    var reader = new FileReader();
    reader.onload = this._handleReaderLoaded.bind(this);
    if (this.vArchivoSeleccioado.length != 0) {
      document.getElementById(lbl).innerHTML = this.vArchivoSeleccioado[0].name;
      let nombre: string = this.vArchivoSeleccioado[0].name.split('.');
      this.nombreArchivo = nombre[0]
      this.formOrdenCompra.controls['nombre'].setValue(nombre[0]);
      this.extencion = nombre[1].toLowerCase();

      if (this.extencion != "pdf") {
        this.vArchivoSeleccioado = '';
        this.progreso = 0;
        this.nombreArchivo = '';
        this.formOrdenCompra.controls['nombre'].setValue('');
        this.archivoFile.nativeElement.value = "";
        this.extencion = '';
        Swal.fire('¡Atencion!', 'Solo es permitodo archivos de formato pdf', 'warning');
        return;
      }
      reader.readAsBinaryString(this.vArchivoSeleccioado[0]);
    }
  }

  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.filestring = btoa(binaryString);
  }
  fnUploadFile(lbl) {
    if (this.formOrdenCompra.invalid) {
      Swal.fire('Atención:', ' Debe completar la información obligatoria!', 'warning');

    }
    if (!this.filestring) {
      Swal.fire('Atención:', 'Debe seleccionar un archivo', 'warning');
    }
    if (this.validarTipoDocumento()) {
      Swal.fire('Atención:', ' la fecha de vencimiento es obligatoria!', 'warning');
      return;
    }

    else {
      if (this.vArchivoSeleccioado.length != 0) {
        if (this.formOrdenCompra.invalid) {
          return Object.values(this.formOrdenCompra.controls).forEach(control => {
            if (control instanceof FormGroup) {
              Object.values(control.controls).forEach(control => control.markAsTouched());
            } else {
              control.markAsTouched();
            }
          });
        }
        this.spinner.show();
        this.vFilecontrolService.fnUploadFile(this.filestring, this.vArchivoSeleccioado[0].type, 3, this.url).subscribe(
          event => {
            if (event.type === HttpEventType.UploadProgress) {
              this.progreso = Math.round((event.loaded / event.total) * 100);
            } else if (event.type === HttpEventType.Response) {

              let res: any = event.body;
              if (res.filename) {
                this.vNameRutaFile = res.filename;

                //Para guardar en la BD 
                this.pParametro = []
                this.pOpcion = 24
                let vValidacionDatos = this.formOrdenCompra.value;
                this.pParametro.push(this.nIdGasto.nId)
                this.pParametro.push(this.vNameRutaFile)
                this.pParametro.push(this.extencion)
                this.pParametro.push(vValidacionDatos.nombre)
                this.pParametro.push(this.idUser)
                this.pParametro.push(vValidacionDatos.lstTipoDoc)
                //datos
                var emision = this.datePipe.transform(vValidacionDatos.fechaEmision, 'yyyy-MM-dd');
                var recepcion = this.datePipe.transform(vValidacionDatos.fechaRecepcion, 'yyyy-MM-dd');
                var vencimiento = this.datePipe.transform(vValidacionDatos.fechaVencimiento, 'yyyy-MM-dd');
                this.pParametro.push(emision)
                this.pParametro.push(recepcion)
                this.pParametro.push(vencimiento)
                this.pParametro.push(this.formOrdenCompra.value.total);
                this.service.fnGuardar(this.pOpcion, this.pParametro).subscribe((data: any) => {
                  if (Number(data) > 0) {
                    Swal.fire({
                      position: 'center',
                      icon: 'success',
                      title: 'Se Subio el archivo correctamente',
                      showConfirmButton: false,
                      timer: 1500
                    });
                    this.fnListaArchivo()
                    this.archivoFile.nativeElement.value = "";
                    this.formOrdenCompra.reset();
                    this.formArchivo.reset();
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

  fnCargarTipoDocumento() {
    this.pParametro = []
    this.pOpcion = 22
    this.service.fnDatosOrdenCompras(this.pOpcion, this.pParametro).subscribe((data: any) => {
      this.tipoDocumento = data;
    })
  }

  fnListaArchivo() {
    this.pParametro = []
    this.pOpcion = 23
    this.pParametro.push(this.nIdGasto.nId)
    this.service.fnDatosOrdenCompras(this.pOpcion, this.pParametro).subscribe((data: any) => {

      let array = data.map(item => {
        return {
          nIdArchivo: item['nIdArchivo'],
          sRutaArchivo: item['sRutaArchivo'],
          sExtencion: item['sExtencion'],
          sArchvo: item['sArchvo'],
          sUsuario: item['sUsuario'],
          sFecha: item['sFecha'],
          sHora: item['sHora'],
          stipoDoc: item['sTipoDoc'],
          fecheEmision: item['dFechaEmision'],
          fecheRecepcion: item['dFechaRecepcion'],
          fechavence: item['dFechaVence'],
          total: item['total'],
          Estado: item['estado'],

        }
      })
      this.dataSource = new MatTableDataSource(array);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

    })
  }


  fnVerFile(a) {
    //window.open(a.sRutaArchivo, '_blank');
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = a.sRutaArchivo
    dialogConfig.width = '900px'

    this.dialog.open(OrdenCompraScVisorComponent, dialogConfig);
  }


  fnDescargar(a): void {
    this.spinner.show();
    let file = a.sRutaArchivo.split('/')[4];
    let type = file.split('.')[1];
    let area = 3 //Por ser proceso de control de costos
    this.vFilecontrolService.fnDownload(file, type, area, this.url).subscribe(
      (res: any) => {

        let file = `reporte_${Math.random()}.pdf`;


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
  validarTipoDocumento(): boolean {
    const x = this.tipoDocumento.filter(x => x.nId == this.formOrdenCompra.value.lstTipoDoc)
    if (x[0].nId == 2113 || x[0].nId == 2114) {
      if (this.formOrdenCompra.get('fechaVencimiento').value == null)
        return true;
    }
  }
}
