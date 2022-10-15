import { DatePipe, formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ErrorStateMatcher, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { FilecontrolService } from '../../../../../shared/services/filecontrol.service';
import { CompraService } from '../../compra.service';
import { OcDevolverVisorComponent } from './oc-devolver-visor/oc-devolver-visor.component';


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
  selector: 'app-oc-devolver-file',
  templateUrl: './oc-devolver-file.component.html',
  styleUrls: ['./oc-devolver-file.component.css'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_Format },
    DatePipe
  ]
})
export class OcDevolverFileComponent implements OnInit {

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('archivoFile') archivoFile: ElementRef;
  displayedColumns: string[] = ['nId', 'tipo', 'sNombreArchivo', 'emision', 'recepcion', 'vence', 'estado', 'sUsuario', 'sFechaSubio'];


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
  tipoDocumento: [] = []
  //===================================
  pEntidad = 1; //Cabecera del movimiento
  pOpcion = 2;  //CRUD -> Listar
  pParametro = []; //Parametros de campos vacios
  pTipo = 1;       //Listar Solo Guias de ingreso
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
    public dialogRef: MatDialogRef<OcDevolverFileComponent>,
    private datePipe: DatePipe,
    @Inject(LOCALE_ID) private locale: string,
    public dialog: MatDialog
    // @Inject(MAT_DIALOG_DATA) public data: CentroCosto_Asig
  ) { this.url = baseUrl; this.nIdGasto = data }

  ngOnInit(): void {
    let user = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pPais = localStorage.getItem('Pais');

    this.fnListaArchivo();
    this.sNumero = this.nIdGasto.Numero

    this.datePipeString = formatDate(Date.now(), 'yyyy-MM-dd', this.locale);
  }

  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }

  fnListaArchivo() {
    this.pParametro = []
    this.pEntidad = 3
    this.pOpcion = 2
    this.pTipo = 1
    this.pParametro.push(this.nIdGasto.nId)
    this.rutas.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {

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

    this.dialog.open(OcDevolverVisorComponent, dialogConfig);
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

  fnActulizarEstado(event) {
    this.pParametro = []
    this.pEntidad = 3
    this.pOpcion = 3
    this.pTipo = 1;
    this.pParametro.push(event);
    this.rutas.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {

      if (Number(data) > 0) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Se actualizó correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        this.fnListaArchivo()
      }

    })
  }


}
