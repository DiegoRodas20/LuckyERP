import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import { Numerador, SerieExp, TipoDocumentoFacturacion } from "../../../repository/models/exp-registro-ventas/expRegistroVentaDto";
import { Mes } from "../../../repository/models/objetivos-facturacion/objetivoFacturacionDto";
import { Anio } from "../../../repository/models/ppto-pendiente-facturar/pptoPendienteFacturarDto";
import { ExpRegistroVentasService } from "../../../repository/services/exp-registro-ventas.service";

@Component({
    selector        : "app-exp-registro-ventas",
    templateUrl     : "./exp-registro-ventas.component.html",
    styleUrls       : ["./exp-registro-ventas.component.css"],
    animations      : [asistenciapAnimations]
})

export class ExpRegistroVentasComponent implements OnInit {

    //Botones Flotantes Pptos y estados
    tsLista = 'active'; // Inicia la lista visible
    fbLista = [ // Lista de las opciones que se mostrarán
        { icon: 'cloud_download', tool: 'Descargar Excel' }
    ]
    abLista = [];

    //Declaracion de datos necesarios 
    url         : string
    idUser      : number
    pNom        : string
    idEmp       : string
    pPais       : string
    pNomEmp     : string
    nEmpresa    : string

    //Lista ddl
    lAnio                       : Anio[] = []
    lMeses                      : Mes[] = []
    lTiposDocumentoFacturacion  : TipoDocumentoFacturacion[] = []
    lSeriesExp                  : SerieExp[] = []
    lNumeradoresInicial         : Numerador[] = []
    lNumeradoresFinal           : Numerador[] = []
    
    formExpRegistroVentas   : FormGroup

    constructor(
        private fb          : FormBuilder,
        private spinner     : NgxSpinnerService,
        private servicios   : ExpRegistroVentasService,

        @Inject('BASE_URL') baseUrl: string
    ) {
        this.url = baseUrl
    }


    ngOnInit(): void {

        //Datos del Usuario
        let user        = localStorage.getItem('currentUser');
        this.idUser     = JSON.parse(window.atob(user.split('.')[1])).uid;
        this.pNom       = JSON.parse(window.atob(user.split('.')[1])).uno;
        this.idEmp      = localStorage.getItem('Empresa');

        this.crearFormExpRegistroVentas()
        this.listaAnio() 
        this.onToggleFab(1, -1)
    }

    crearFormExpRegistroVentas(){
        this.formExpRegistroVentas = this.fb.group({
            anio                :    [null, [Validators.required]],
            mes                 :    [null, [Validators.required]],
            tipoDocumento       :    [null, [Validators.required]],
            serie               :    [null, [Validators.required]],
            numeradorInicial    :    [null, [Validators.required]],
            numeradorFinal      :    [null, [Validators.required]],
            correlativo         :    [null, [Validators.required]],
        })
    }

    listaAnio(){
        this.servicios.getAnios( Number(this.idEmp) ).subscribe(
            data => {
                this.lAnio = data.body.response.data
            }
        )
    }

    fnChangeAnio(){
        let fExp = this.formExpRegistroVentas.value; 
        this.servicios.getMeses(Number(fExp.anio),Number(this.idEmp)).subscribe(
            data => {
                this.lMeses = data.body.response.data
            }
        ) 
        
    } 

    listaTiposDocumentoFacturacion(){

        this.formExpRegistroVentas.controls.tipoDocumento.setValue(null)
        this.formExpRegistroVentas.controls.serie.setValue(null)
        this.formExpRegistroVentas.controls.numeradorInicial.setValue(null)
        this.formExpRegistroVentas.controls.numeradorFinal.setValue(null)

        let formExpRegistroVentas = this.formExpRegistroVentas.value

        var anio    = formExpRegistroVentas.anio
        var mes     = formExpRegistroVentas.mes

        this.servicios.getTiposDocumentoFacturacion(Number(anio),Number(mes),Number(this.idEmp)).subscribe(
            data => {
                this.lTiposDocumentoFacturacion = data.body.response.data
            }
        )
    }

    listaSeriesExp(){
        
        this.formExpRegistroVentas.controls.serie.setValue(null)
        this.formExpRegistroVentas.controls.numeradorInicial.setValue(null)
        this.formExpRegistroVentas.controls.numeradorFinal.setValue(null)

        let formExpRegistroVentas = this.formExpRegistroVentas.value

        var idTipoDocumento = formExpRegistroVentas.tipoDocumento
        var anio            = formExpRegistroVentas.anio
        var mes             = formExpRegistroVentas.mes

        this.servicios.getSeriesExp(Number(this.idEmp), idTipoDocumento, anio, mes).subscribe(
            data => {
                this.lSeriesExp = data.body.response.data
            }
        )
    }

    listaNumeradoresInicial(){
        
        this.formExpRegistroVentas.controls.numeradorInicial.setValue(null)
        this.formExpRegistroVentas.controls.numeradorFinal.setValue(null)

        let formExpRegistroVentas = this.formExpRegistroVentas.value

        var idTipoDocumento = formExpRegistroVentas.tipoDocumento
        var idSerie         = formExpRegistroVentas.serie
        var anio            = formExpRegistroVentas.anio
        var mes             = formExpRegistroVentas.mes

        this.servicios.getNumeradores(Number(this.idEmp), idTipoDocumento, idSerie, anio, mes).subscribe(
            data => {
                this.lNumeradoresInicial = data.body.response.data
            }
        )
    }

    listaNumeradoresFinal(){

        this.formExpRegistroVentas.controls.numeradorInicial.setValue(null)
        this.formExpRegistroVentas.controls.numeradorFinal.setValue(null)

        let formExpRegistroVentas = this.formExpRegistroVentas.value

        var idTipoDocumento = formExpRegistroVentas.tipoDocumento
        var idSerie         = formExpRegistroVentas.serie
        var anio            = formExpRegistroVentas.anio
        var mes             = formExpRegistroVentas.mes
        
        this.servicios.getNumeradores(Number(this.idEmp), idTipoDocumento, idSerie, anio, mes).subscribe(
            data => {
                this.lNumeradoresFinal = data.body.response.data
            }
        )
    }

    descargarExpRegistroVentas() {

        let formExpRegistroVentas = this.formExpRegistroVentas.value
         
        if(this.formExpRegistroVentas.invalid){
            return;
        }
        

        this.spinner.show()

        this.servicios.GetExpRegistrosVentaXLS(
            Number(this.idEmp),
            Number(formExpRegistroVentas.anio),
            Number(formExpRegistroVentas.mes),
            Number(formExpRegistroVentas.tipoDocumento),
            Number(formExpRegistroVentas.serie),
            formExpRegistroVentas.numeradorInicial,
            formExpRegistroVentas.numeradorFinal,
            Number(formExpRegistroVentas.correlativo)
            ).subscribe(
            data => {
                this.downloadFile(data)
            }
        )
    }

    downloadFile(response: any){

        let name = 'Exportar Registro de Ventas';
        var blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        saveAs(blob, name + '.xlsx')
        this.spinner.hide();
    }

    //Botones Flotantes

    onToggleFab(fab: number, stat: number) {
        stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
        this.tsLista = (stat === 0) ? 'inactive' : 'active';
        this.abLista = (stat === 0) ? [] : this.fbLista;
    }

    clickFab(index: number) {
        switch (index) {
            case 0:
                this.descargarExpRegistroVentas()
                break
            default:
                break
        }
    }
}
