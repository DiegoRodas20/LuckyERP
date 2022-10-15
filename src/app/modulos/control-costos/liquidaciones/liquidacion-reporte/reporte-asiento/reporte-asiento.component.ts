import { Component, Inject, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import {ReporteSmComponent} from '../../liquidacionEfectivo/liquidacion/reporte/reporte-sm/reporte-sm.component';
import { LiquidacionesService } from '../../liquidaciones.service';

@Component({
  selector: 'app-reporte-asiento',
  templateUrl: './reporte-asiento.component.html',
  styleUrls: ['./reporte-asiento.component.css']
})
export class ReporteAsientoComponent implements OnInit {

  url: string;
  impresionIndividualForm: FormGroup;
  impresionMasivaForm: FormGroup;

  // Combobox
  nAnio: any[]

  // Variables de impresion
  vVerReporte: boolean = false;
  vVerReporteSM: boolean = false;
  @Input() nIdGastoCosto: any;

  // Variables de impresion masiva
  impresionMasiva = false; // Cuando la impresion masiva se activa, se crean los reportes
  impresionMasivaResult; // La lista de ids de los reportes a generar
  cantidadReportes = 0; // La cantidad de reportes ya cargados. Si estan cargados todos (el valor es igual al length de impresionMasivaResult) recien imprime
  impresionesMaximas = 50; // La cantidad de registros maximos a imprimir
  nAsiento; // Numero de asiento para impresiones individuales

  constructor(
    private liquidacionesService: LiquidacionesService,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    @Inject('BASE_URL') baseUrl: string,
  ) { this.url = baseUrl;}

  async ngOnInit(): Promise<void> {


    this.impresionIndividualForm  = this.formBuilder.group({
      nAnio: [null, [Validators.required]],
      txtNumeroAsiento: [null],
    })

    this.impresionMasivaForm = this.formBuilder.group({
      nAnio: [null, [Validators.required]],
      txtNumeroAsientoInicial: [null, [Validators.minLength(8), Validators.maxLength(8), Validators.required]],
      txtNumeroAsientoFinal: [null, [Validators.minLength(8), Validators.maxLength(8), Validators.required]]
    })

    await this.fnRecuperarAnio();
  }

  async fnRecuperarAnio(){
    const pEntidad = 1;
    const pOpcion = 2;
    const pTipo = 3;
    const pParametro = [];

    // Listar los anios disponibles en los documentos
    this.nAnio = await this.liquidacionesService.fnImpresionPorAsiento(pEntidad, pOpcion, pParametro, pTipo, this.url);
    // Ponemos el primer valor encontrado por defecto en el combobox
    this.impresionIndividualForm.get("nAnio").setValue(this.nAnio[0].nId);
    this.impresionMasivaForm.get("nAnio").setValue(this.nAnio[0].nId);
  }

  // Metodo para buscar el formato de impresion deseado (tipoReporte: 1 = Requerimiento de efectivo, 2 = Solicitud de movilidad)
  async fnBuscarLiquidacion(tipoReporte: number){

    this.spinner.show();

    const pEntidad = 1;
    const pOpcion = 2;
    const pTipo = 1;
    const pParametro = [];

    // Recuperar numero del asiento
    const numberoAsiento = this.impresionIndividualForm.get("txtNumeroAsiento").value;
    const anio = this.impresionIndividualForm.get("nAnio").value;
    pParametro.push(numberoAsiento);
    pParametro.push(anio);

    // Listar el id del reporte y el tipo de documento
    const result = await this.liquidacionesService.fnImpresionPorAsiento(pEntidad, pOpcion, pParametro, pTipo, this.url);

    // Si devuelve un id que no sea 0
    if(result[0].IdGastoCosto !== 0){
      this.nIdGastoCosto = result[0].nIdGastoCosto;

      // Si el reporte es el formato de impresion del reporte de requerimiento
      if (tipoReporte === 1) {

        // Si existe el reporte de requerimiento
        if (this.nIdGastoCosto !== 0) {//Verifica que exista reporte de requerimiento
            this.fnMostrar();

            //Se espera para que el componente hijo tome el valor IdGastoCosto
            setTimeout(() => {
              this.fnImprimirReporteRQ();
              this.vVerReporte = false;
            }, 1000);
        }
        else{
          Swal.fire('¡Verificar!','No se encontro Reporte para la liquidación o asiento','warning')
        }
      }
      // Si el reporte es el formato de impresion del reporte de movilidad
      else {

        // Si existe el reporte de movilidad
        if (result[0].sTipoDoc == 'SM') {
          this.fnMostrarSM();

          //Se espera para que el componente hijo tome el valor IdGastoCosto
          setTimeout(() => {
            this.fnImprimirReporteSM();
            this.vVerReporteSM = false;
          }, 1000);
        }
        else{
          Swal.fire('¡Verificar!','No se encontro Reporte de Movilidad para la liquidación o asiento','warning')
        }
      }
    }
    else{
      Swal.fire('¡Verificar!','No se encontro Reporte para la liquidación o asiento','warning')
    }

    this.spinner.hide();
  }

  // Recupera todos los ids de los reportes para luego realizar la impresion masiva en base al rango de numero de documentos ingresados
  async fnRecuperarParaImpresionMasiva(){

    if(this.impresionMasivaForm.valid){

      this.spinner.show();

      const pEntidad = 1;
      const pOpcion = 2;
      const pTipo = 2;
      const pParametro = [];

      // Recuperar numero del asiento
      const numeroAsientoInicial = this.impresionMasivaForm.get("txtNumeroAsientoInicial").value;
      const numeroAsientoFinal = this.impresionMasivaForm.get("txtNumeroAsientoFinal").value;
      const anio = this.impresionMasivaForm.get("nAnio").value;


      // Validamos que los cuatro primeros digitos sean iguales
      if(numeroAsientoInicial.substr(0,4) != numeroAsientoFinal.substr(0,4)){
        this.spinner.hide();
        Swal.fire('¡Verificar!', 'Los 4 primeros digitos deben de ser iguales', 'warning');
        return;
      }
      // Validamos que el valor inicial sea menor o igual al valor final
      else if(parseInt(numeroAsientoInicial.substr(4,4)) > parseInt(numeroAsientoFinal.substr(4,4))){
        this.spinner.hide();
        Swal.fire('¡Verificar!', 'El valor inicial es mayor al valor final', 'warning');
        return;
      }

      pParametro.push(numeroAsientoInicial);
      pParametro.push(numeroAsientoFinal);
      pParametro.push(anio);

      // Listar el id del reporte y el tipo de documento
      const result = await this.liquidacionesService.fnImpresionPorAsiento(pEntidad, pOpcion, pParametro, pTipo, this.url);

      if(result.length == 0){
        this.spinner.hide();
        Swal.fire('¡Verificar!', 'Los valores ingresados no devolvieron ningun valor', 'warning');
        return;
      }

      // Validamos que los registros no superen las impresiones maximas permitidas
      else if(result.length > this.impresionesMaximas){
        this.spinner.hide();
        Swal.fire('¡Verificar!', 'Solo se puede imprimir ' + this.impresionesMaximas + ' a la vez', 'warning');
        return;
      }

      this.impresionMasiva = true;
      this.impresionMasivaResult = result;
      this.cantidadReportes = 0;

    }
  }

  // Ya que los reportes se han cargado, se agregan al iframe para hacer una sola impresion
  fnAgregarReporteAlIFrame(){

    const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;

    this.cantidadReportes++;

    if(this.cantidadReportes == this.impresionMasivaResult.length * 2){
      setTimeout(()=> {
        const reportes = document.querySelectorAll('.print-impresion-masiva');

        pdfFrame.contentWindow.document.open();

        // Agregar todos los requerimientos de efectivos listados
        reportes.forEach(function(reporte) {
          const reporteUnidad = reporte.innerHTML;
          pdfFrame.contentWindow.document.write(reporteUnidad);
        });

        pdfFrame.contentWindow.document.close();
        this.fnImpresionMasiva();
      },1500)
    }

  }

  // Se realiza la impresion, agregando estilos CSS
  fnImpresionMasiva(){
    setTimeout(()=> {
      const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;

      const doc = pdfFrame.contentDocument;
      doc.body.innerHTML = doc.body.innerHTML +`
      <style>
        @media print {
          .rompePaginas {page-break-after: always;}
        }
      </style>`;
      this.spinner.hide();
      pdfFrame.contentWindow.print();
      this.impresionMasiva = false;
    },1000)
  }

  // Imprime la solicitud de movilidad cargada en el iframe
  fnImprimirReporteSM (){
    const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;
    const reporte = document.getElementById('print-reporte-sm').innerHTML;
    pdfFrame.contentWindow.document.open();
    pdfFrame.contentWindow.document.write(reporte);
    pdfFrame.contentWindow.document.close();
    pdfFrame.contentWindow.print();
  }

  // Imprime el requerimiento de efectivo cargado en el iframe
  fnImprimirReporteRQ (){
    const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;
    const reporte = document.getElementById('print-reporte-rq').innerHTML;
    pdfFrame.contentWindow.document.open();
    pdfFrame.contentWindow.document.write(reporte);
    pdfFrame.contentWindow.document.close();
    pdfFrame.contentWindow.print();
  }

  // Booleanos para cargar los reportes (Solicitud de movilidad y requerimiento de efectivo)
  fnMostrarSM = () => {
    this.nAsiento = this.impresionIndividualForm.get("txtNumeroAsiento").value;
    this.vVerReporteSM = true;
  }

  fnMostrar = () => {
    this.nAsiento = this.impresionIndividualForm.get("txtNumeroAsiento").value;
    this.vVerReporte = true;
  }

}
