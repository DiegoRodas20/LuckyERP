import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import Swal from "sweetalert2";
import { IndicadorCobranzaDto } from "../../../repository/models/indicador-cobranza/indicadorCobranzaDto";
import { Anio } from "../../../repository/models/ppto-pendiente-facturar/pptoPendienteFacturarDto";
import { IndicadorCobranzaService } from "../../../repository/services/indicador-cobranza.service";


@Component({
    selector        : "app-indicador-cobranza",
    templateUrl     : "./indicador-cobranza.component.html",
    styleUrls       : ["./indicador-cobranza.component.css"],
    animations      : [asistenciapAnimations]
})

export class IndicadorCobranzaComponent implements OnInit {

    //Botones Flotantes Pptos y estados
    tsLista = 'active'; // Inicia la lista visible
    fbLista = [ // Lista de las opciones que se mostrarán
        { icon: 'search', tool: 'Ver Reporte' },
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

    //Variable para controlar tabla
    tablaEstado: boolean = false

    //Lista ddl
    lAnio       : Anio[] = []

    //lista para la tabla
    lIndicadorCobranza  : IndicadorCobranzaDto[] = []

    //Datos para la tabla 
    dataSource: MatTableDataSource<IndicadorCobranzaDto>;
    displayedColumns = [
        'presupuesto',
        'nombrePresupuesto',
        'cliente',
        'gerenteCuenta',
        'ejecutivo',
        'fechaInicio',
        'fechaFin',
        'fechaPrimerGasto',
        'factura',
        'fechaFactura',
        'montoCuenta',
        'totalFacturado',
        'fechaAbono',
        'dias',];

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;


    formIndicadorCobranza       : FormGroup

    constructor(
        private fb          : FormBuilder,
        private spinner     : NgxSpinnerService,
        private dialog      : MatDialog,
        private servicios   : IndicadorCobranzaService,

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
        this.pPais      = localStorage.getItem('Pais');
        
        this.crearFormIndicadorCobranza()
        this.listaAnio()
        this.onToggleFab(1, -1)
    }

    crearFormIndicadorCobranza() {

        this.formIndicadorCobranza = this.fb.group({
            anio: [null, [Validators.required]]
        })
    }

    listaAnio(){
        this.servicios.getAnios( Number(this.idEmp) ).subscribe(
            data => {
                this.lAnio = data.body.response.data
            }
        )
    }

    verReporteIndicadorCobranza(){

        if (this.formIndicadorCobranza.invalid) {
            return Object.values(this.formIndicadorCobranza.controls).forEach(
                control => {
                    if (control instanceof FormGroup) {
                        Object.values(control.controls).forEach(control => control.markAsTouched())
                    }
                    else {
                        control.markAsTouched()
                        Swal.fire('Atención', 'Debe seleccionar el año', 'warning')
                    }
                }
            )
        }

        this.spinner.show()
        var anio = this.formIndicadorCobranza.get('anio').value

        this.servicios.getIndicadoresCobranza( anio , Number(this.idEmp) ).subscribe(
            data => {
                if(data.body.response.data == null){
                    Swal.fire('Atención', 'No se encontraron registros', 'warning')
                    this.tablaEstado = false
                    this.spinner.hide()
                }
                else{

                    this.lIndicadorCobranza = data.body.response.data
                    this.anadirDatosTabla(this.lIndicadorCobranza)
                    this.tablaEstado = true
                    this.spinner.hide()
                }
            }
        )

    }

    anadirDatosTabla(lIndicadorCobranza: IndicadorCobranzaDto[]) {
        this.dataSource = new MatTableDataSource(lIndicadorCobranza)
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
    }

    descargarReporteIndicadorCobranza(){

        if (this.formIndicadorCobranza.invalid) {
            return Object.values(this.formIndicadorCobranza.controls).forEach(
                control => {
                    if (control instanceof FormGroup) {
                        Object.values(control.controls).forEach(control => control.markAsTouched())
                    }
                    else {
                        control.markAsTouched()
                        Swal.fire('Atención', 'Debe seleccionar el año', 'warning')
                    }
                }
            )
        }

        this.spinner.show()
        const anio = this.formIndicadorCobranza.get('anio').value

        this.servicios.GetIndicadoresCobranzaXLS( anio , Number(this.idEmp) ).subscribe(
            data => {
                this.downloadFile(data)
            }
        )

    }

    downloadFile(response: any){

        let name = 'Reporte Indicador de Cobranza';
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
                this.verReporteIndicadorCobranza()
                break
            case 1: 
                this.descargarReporteIndicadorCobranza()
            default:
                break
        }
    }
}