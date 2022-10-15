import { Component, OnInit, Inject } from '@angular/core';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Datos, Puesto, Carnet, Ficha, } from '../../Model/IATC';
import * as jsPDF from 'jspdf'
import * as html2canvas from 'html2canvas'
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-fichatecnica',
  templateUrl: './fichatecnica.component.html',
  styleUrls: ['./fichatecnica.component.css']
})

export class FichatecnicaComponent implements OnInit {
  url: string;
  cont: number;
  acc: number;
  lListaB: any;
  DatosForm: FormGroup;
  vacanteForm: FormGroup;
  formEvaluacion: FormGroup;
  ListForm: FormGroup;
  submitted = false;
  lCboPuesto: any;

  divtxtR: boolean = true;
  btnSave: boolean = true;

  divone: boolean = true;
  divtwo: boolean = false;
  divthree: boolean = false;
  divfour: boolean = false;

  vPersona: string;
  vid: string;
  vPostulacion: string;
  vTipoDoc: string;
  vNumDoc: string;
  vNombre: string;
  vEdad: string;
  vEstCiv: string;
  vEstatura: string;
  vEstado: string;
  vHoraCita: string;
  vHoraAten: string;
  vPuesto: string;
  puntPre: number;
  vpuntPre: string;
  puntHabi: number;
  vpuntHabi: string;
  vFecha: string;
  vCelular: string;
  vCorreo: string;
  vNacionalidad: string;
  vDistrito: string;
  vdia: number;
  vmes: number;
  vanio: number;
  vgenero: string;
  vfuente: string;
  vcontacto: string;
  vcual: string;
  vnHijo: string;
  vchijo: string;
  vReferido: string;
  nNomContac: string;
  vDireccion: string;


  nZona: string;


  nEmpr1: string;
  nsect1: string;
  nCarg1: string;
  nsuel1: string;
  nIni1: string;
  nFin1: string;
  nEmpr2: string;
  nsect2: string;
  nCarg2: string;
  nsuel2: string;
  nIni2: string;
  nFin2: string;
  nEmpr3: string;
  nsect3: string;
  nCarg3: string;
  nsuel3: string;
  nIni3: string;
  nFin3: string;
  nEmpr4: string;
  nsect4: string;
  nCarg4: string;
  nsuel4: string;
  nIni4: string;
  nFin4: string;

  lListaCombo: any;
  lListaComboH: any;
  lListaResul: any;
  lListaFidelizador: any;

  sRutaImagen: string;

  pais: string;
  tituloZona: string;
  primeraZona: string;
  SegundaZona: string;
  TerceraZona: string;
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<FichatecnicaComponent>,
    private spinner: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data: Ficha,
  ) { }

  ngOnInit(): void {

    let lDatos = this.data.lDatos;
    let lCarnet = this.data.lCarnetS;
    let lPuesto = this.data.lPuesto;
    this.pais = localStorage.getItem('Pais');


    this.vPuesto = lDatos[0].pPuesto;
    this.vTipoDoc = lDatos[0].pTipDoc;
    this.vNumDoc = lDatos[0].pNumDoc;
    this.vFecha = lDatos[0].pfecha;
    this.vCelular = lDatos[0].pNumCelular;
    this.vCorreo = lDatos[0].pCorreo;
    this.vNacionalidad = lDatos[0].pNacionalidad;
    this.vDistrito = lDatos[0].pDistrito;
    this.vNombre = lDatos[0].pNom;
    this.vdia = lDatos[0].pdia;
    this.vmes = lDatos[0].pmes;
    this.vanio = lDatos[0].panio;
    this.vgenero = lDatos[0].pGenero;
    this.vfuente = lDatos[0].pFuentePostu;
    this.vDireccion = lDatos[0].pdireccion;
    this.vEstCiv = lDatos[0].pEstCiv;
    this.vnHijo = lDatos[0].pnHijo;
    this.vchijo = lDatos[0].pcHijo;

    this.sRutaImagen = lDatos[0].sRutaImagen;


    if (this.pais === "604") {
      this.tituloZona = "Zona Carnet";
      this.primeraZona = "Lima Metropolitana";
      this.SegundaZona = "San Isidro	";
      this.TerceraZona = "Callao";
    }
    else {
      this.tituloZona = "Regional";
      this.primeraZona = "Santa Cruz";
      this.SegundaZona = "Cochabamba";
      this.TerceraZona = "La Paz";
    }

    for (const x in lPuesto) {
      if (x == '0') {

        this.nEmpr1 = lPuesto[x].nEmpresa;
        this.nsect1 = lPuesto[x].nArea;
        this.nCarg1 = lPuesto[x].nPuesto;
        this.nsuel1 = lPuesto[x].nSalario;
        this.nIni1 = lPuesto[x].nInicio;
        this.nFin1 = lPuesto[x].nFin;
      }
      else if (x == '1') {
        this.nEmpr2 = lPuesto[x].nEmpresa;
        this.nsect2 = lPuesto[x].nArea;
        this.nCarg2 = lPuesto[x].nPuesto;
        this.nsuel2 = lPuesto[x].nSalario;
        this.nIni2 = lPuesto[x].nInicio;
        this.nFin2 = lPuesto[x].nFin;
      }
      else if (x == '2') {
        this.nEmpr3 = lPuesto[x].nEmpresa;
        this.nsect3 = lPuesto[x].nArea;
        this.nCarg3 = lPuesto[x].nPuesto;
        this.nsuel3 = lPuesto[x].nSalario;
        this.nIni3 = lPuesto[x].nInicio;
        this.nFin3 = lPuesto[x].nFin;
      }
      else if (x == '3') {
        this.nEmpr4 = lPuesto[x].nEmpresa;
        this.nsect4 = lPuesto[x].nArea;
        this.nCarg4 = lPuesto[x].nPuesto;
        this.nsuel4 = lPuesto[x].nSalario;
        this.nIni4 = lPuesto[x].nInicio;
        this.nFin4 = lPuesto[x].nFin;
      }

    }

    this.nZona = 'No'
    let nLima = 'no', nSanIsi = 'no', nCallao = 'no';
    for (const c in lCarnet) {
      if (lCarnet[c].ncod == 0) {
        this.nZona = 'No'
      }
      else {
        this.nZona = 'Si'
        if (lCarnet[c].ncod == 532 || lCarnet[c].ncod == 1984) {// san isidro o  Cochabamba
          nSanIsi = lCarnet[c].nOp
        }
        else if (lCarnet[c].ncod == 531 || lCarnet[c].ncod == 1985) {// callao o  La Paz
          nCallao = lCarnet[c].nOp
        }
        else if (lCarnet[c].ncod == 530 || lCarnet[c].ncod == 1983) {// lima o  santa cruz
          nLima = lCarnet[c].nOp
        }
      }

    }

    this.ListForm = this.formBuilder.group({
      inlineLima: new FormControl(nLima),
      inlineSanisidro: new FormControl(nSanIsi),
      inlineCallao: new FormControl(nCallao)
    });
    this.ListForm.disable();



  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  captureScreen = function () {
    this.spinner.show('spi_lista');
    var data = document.getElementById('contentTo');
    html2canvas(data).then(canvas => {
      // Few necessary setting options

      // console.log(canvas.height)
      // console.log(canvas.width)
      var imgWidth = 208;
      var pageHeight = 295;
      var imgHeight = 1350 * imgWidth / 960;
      var heightLeft = imgHeight;
      const contentDataURL = canvas.toDataURL('image/png')
      let pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF  
      var position = 0;
      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight)
      pdf.save(this.vNumDoc + '_cv.pdf'); // Generated PDF  
      this.spinner.hide('spi_lista');
    });
  }
}
