import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/shared/services/AppDateAdapter';
import Swal from 'sweetalert2';
import { PresupuestosService } from '../presupuestos.service';
import { HostListener } from '@angular/core';

export interface ListaUsuarios {
  nIdUsrRegistro: number;
  nameUser: string;
}
export interface ListaReporte {
  nIdGastoCosto: number;
  sCodCC: string;
  sDescCC: string;
  sNumero: number;
  sTipoDoc: string;
  dFechaRegistro: string;
  nIdUsrRegistro: number;
  nameUser: string;
  dFechaIni: string;
  dFechaFin: string;
  sTitulo: string;
  sRuc: string;
  sNombreComercial: string;
  nIdMoneda: number;
  sMoneda: string;
  nTotal: number;
  UsuarioAprobo: string;
  sFechaAprobo: string;
  sHoraAprobo: string;
}

@Component({
  selector: 'app-informe-rq',
  templateUrl: './informe-rq.component.html',
  styleUrls: ['./informe-rq.component.css'],
  providers: [
    {
        provide: DateAdapter, useClass: AppDateAdapter
    },
    {
        provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
  ]
})
export class InformeRqComponent implements OnInit {

  listaUsuario: ListaUsuarios[] = [];
  listaReporte: ListaReporte[] = [];
  url: string; //variable de un solo valor
  form: FormGroup;
  idEmp: string; //id de la empresa del grupo Actual
  nEmpresa: string; // Nombre de la Empresa Actual
  hide: boolean = false;
  mobile: any;
  public innerWidth: any;

  listaHora = [
    { hora: '06' },
    { hora: '07' },
    { hora: '08' },
    { hora: '09' },
    { hora: '10' },
    { hora: '11' },
    { hora: '12' },
    { hora: '13' },
    { hora: '14' },
    { hora: '15' },
    { hora: '16' },
    { hora: '17' },
    { hora: '18' },
    { hora: '19' },
    { hora: '20' },
    { hora: '21' },
    { hora: '22' },
    { hora: '23' }
  ]

  listaMinuto = [
    { minuto: '00' },
    { minuto: '01' },
    { minuto: '02' },
    { minuto: '03' },
    { minuto: '04' },
    { minuto: '05' },
    { minuto: '06' },
    { minuto: '07' },
    { minuto: '08' },
    { minuto: '09' },
    { minuto: '10' },
    { minuto: '11' },
    { minuto: '12' },
    { minuto: '13' },
    { minuto: '14' },
    { minuto: '15' },
    { minuto: '16' },
    { minuto: '17' },
    { minuto: '18' },
    { minuto: '19' },
    { minuto: '20' },
    { minuto: '21' },
    { minuto: '22' },
    { minuto: '23' },
    { minuto: '24' },
    { minuto: '25' },
    { minuto: '26' },
    { minuto: '27' },
    { minuto: '28' },
    { minuto: '29' },
    { minuto: '30' },
    { minuto: '31' },
    { minuto: '32' },
    { minuto: '33' },
    { minuto: '34' },
    { minuto: '35' },
    { minuto: '36' },
    { minuto: '37' },
    { minuto: '38' },
    { minuto: '39' },
    { minuto: '40' },
    { minuto: '41' },
    { minuto: '42' },
    { minuto: '43' },
    { minuto: '44' },
    { minuto: '45' },
    { minuto: '46' },
    { minuto: '47' },
    { minuto: '48' },
    { minuto: '49' },
    { minuto: '50' },
    { minuto: '51' },
    { minuto: '52' },
    { minuto: '53' },
    { minuto: '54' },
    { minuto: '55' },
    { minuto: '56' },
    { minuto: '57' },
    { minuto: '58' },
    { minuto: '59' }
  ]

  fecha: Date = new Date();
  fechareporte;
  FechaAnterior: any = this.fecha.setDate(this.fecha.getDate() - 1);
  fechaControl = new Date(this.FechaAnterior);

  dsreporte: MatTableDataSource<ListaReporte>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  // displayedColumns: string[] = ['sCodCC', 'sDescCC','nNumero','sTipoDoc', 'dFechaRegistro','nameUser','dFechaIni','dFechaFin','sTitulo','sRuc','sNombreComercial','sMoneda','nTotal', 'UsuarioAprobo','sFechaAprobo','sHoraAprobo'];
  displayedColumns: string[] = ['sCodCC','nNumero', 'dFechaRegistro','nameUser','dFechaIni','dFechaFin','sTitulo','sRuc','sMoneda','nTotal', 'UsuarioAprobo','sFechaAprobo'];

  // Booleano para ver la impresion del reporte
  vVerReporte = false;

  // Booleano para ver si se esta usando en celular
  vDispEsCelular = false;

  initForm(): void {
    this.form = this.fs.group({
      tipoRQ: ['', Validators.required],
      creado: ['', Validators.required],
      fecha: [this.fechaControl],
      check:[false],
      hora:[false],
      cbohora:[{ value: '', disabled:true }],
      cbominuto:[{ value: '', disabled:true }],
      usuario: [{ value: '', disabled:true }]
    })
  }

  constructor(
    private service: PresupuestosService,
    @Inject("BASE_URL") baseUrl: string,
    private fs: FormBuilder,
    private spinner: NgxSpinnerService,
  ) { this.url = baseUrl; this.initForm(); }

  ngOnInit(): void {
    // Detectamos el dispositivo (Mobile o PC)
    this.fnDetectarDispositivo();

    this.idEmp = localStorage.getItem("Empresa");
    this.nEmpresa = "Lucky S.A.C.";

    this.form.controls.tipoRQ.setValue('RE');
    this.form.controls.creado.setValue('0');
    this.listarUsuarios();
  }

   // Lo usamos para detectar cambios en la pantalla
   @HostListener('window:resize', ['$event'])
   onResize(event) {
     this.innerWidth = window.innerWidth;
     if (this.innerWidth <= 768) {
       this.mobile = true;
     } else {
       this.mobile = false;
     }
   }
  activarUsuario(): void {

    let activo =  this.form.get('check').value;

    activo = !activo;

    if (activo) {
      this.form.get('usuario').enable();
    } else {
      this.form.get('usuario').disable();
      this.form.get('usuario').setValue('');
    }

  }

  activarHora(): void {
    let activo =  this.form.get('hora').value;

    activo = !activo;

    if (activo) {
      this.form.get('cbohora').enable();
      this.form.get('cbominuto').enable();
    } else {
      this.form.get('cbohora').disable();
      this.form.get('cbominuto').disable();
      this.form.get('cbohora').setValue('');
      this.form.get('cbominuto').setValue('');
    }
  }

  listarUsuarios(): void {

    let sTipoDoc = this.form.get('tipoRQ').value;
    let pParametro = [];
    pParametro.push(sTipoDoc);
    //console.log(pParametro)
    this.service.gestionRQInforme(1,2,pParametro,1,this.url).subscribe( (resp) => {
      this.listaUsuario = resp;
      //console.log(this.listaUsuario)
    })

  }

  generarInforme(): void {

    if ( this.form.invalid ) {
      return Object.values( this.form.controls ).forEach( controls => {
        controls.markAllAsTouched();
      });
    }

    this.spinner.show();
    this.hide = false;
    let sTipoDoc = this.form.get('tipoRQ').value;
    let nIdTipoUsr = this.form.get('creado').value;

    let fechacontrol = this.form.get('fecha').value

    let fecha = fechacontrol.getDate() + "/" + (("0" + (fechacontrol.getMonth() + 1)).slice(-2)) + "/" + fechacontrol.getFullYear();

    let hora = this.form.get('cbohora').value;
    let minuto = this.form.get('cbominuto').value;

    let horaCompleta = hora + ':' + minuto;

    let pParametro = [];

    pParametro.push(this.idEmp);
    pParametro.push(sTipoDoc);
    pParametro.push(nIdTipoUsr);
    pParametro.push(this.form.get('usuario').value)
    pParametro.push(fecha);
    pParametro.push(horaCompleta);

    this.service.gestionRQInforme(1,1,pParametro,1,this.url).subscribe( (resp) => {
      this.listaReporte = resp;

      //console.log(this.listaReporte)
      this.dsreporte = new MatTableDataSource(this.listaReporte);
      this.dsreporte.paginator = this.paginator;
      this.dsreporte.sort = this.sort

      this.fechareporte = this.fecha.getDate() + "/" + (("0" + (this.fecha.getMonth() + 1)).slice(-2)) + "/" + this.fecha.getFullYear();

      this.spinner.hide();

      if(this.listaReporte.length > 0) {
        this.hide = true;
      } else {
        Swal.fire('¡Atención!', 'No se encontraron registros', 'warning')
      }
    })

  }

  // async fnReporte(){
  //   this.spinner.hide();
  //   this.vVerReporte = true;
  //   // Agregar nombre al documento
  //   const tempTitle = document.title;
  //   document.title = 'Informe de (RE, RR, SM) autorizados o generados';
  //   // Impresion
  //   setTimeout(()=>{
  //     window.print();
  //     this.vVerReporte = false;
  //   })
  //   document.title = tempTitle;
  //   return;
  // }

  async fnImprimirReporte(){
    const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;
    const reporte = document.getElementById('print-prueba').innerHTML;
    pdfFrame.contentWindow.document.open();
    pdfFrame.contentWindow.document.write(reporte);
    pdfFrame.contentWindow.document.close();
    pdfFrame.contentWindow.print();
  }

  async fnImprimirCelularReporte(){
    const divText = document.getElementById("print-prueba").outerHTML;
    const myWindow = window.open('','','width=985,height=1394');
    const doc = myWindow.document;
    doc.open();
    doc.write(divText);
    doc.close();
    doc.title = 'Informe de (RE, RR, SM) autorizados o generados';
  }

  // Detectar el dispositivo
  fnDetectarDispositivo(){
    const dispositivo = navigator.userAgent;
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(dispositivo)){
      this.vDispEsCelular = true;
    }
    else{
      this.vDispEsCelular = false;
    }
  }

}
