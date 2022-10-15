import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import Swal from "sweetalert2";
import { Anio, PptoPendienteFacturarDto } from "../../../repository/models/ppto-pendiente-facturar/pptoPendienteFacturarDto";
import { PptoPendienteFacturarService } from "../../../repository/services/ppto-pendiente-facturar.service";


@Component({
    selector        : "app-ppto-pendiente-facturar",
    templateUrl     : "./ppto-pendiente-facturar.component.html",
    styleUrls       : ["./ppto-pendiente-facturar.component.css"],
    animations      : [asistenciapAnimations]
})

export class PptoPendienteFacturarComponent implements OnInit {

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
    lPptoPendienteFacturar  : PptoPendienteFacturarDto[] = []

    //Datos para la tabla 
    dataSource: MatTableDataSource<PptoPendienteFacturarDto>;
    displayedColumns = ['anio',
        'directoraGeneral',
        'gerenteCuentas',
        'ejecutivo',
        'presupuesto',
        'nombrePresupuesto',
        'estadoPpto',
        'fechaInicio',
        'fechaFin',
        'cliente',
        'subTotal',
        'descuento',
        'totalFee',
        'totalPresupuesto',
        'ciudad',
        'totalCiudad',
        'pendientefacturar',
        'importePendiente'];

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    formPendienteFacturar   : FormGroup

    constructor(
        private fb          : FormBuilder,
        private spinner     : NgxSpinnerService,
        private dialog      : MatDialog,
        private servicios   : PptoPendienteFacturarService,

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
        
        this.crearFormPendienteFactuar()
        this.listaAnio()
        this.onToggleFab(1, -1)

    }

    crearFormPendienteFactuar() {

        this.formPendienteFacturar = this.fb.group({
            anio: [null, [Validators.required]]
        })
    }

    listaAnio(){
        this.servicios.getAnios( this.idEmp ).subscribe(
            data => {
                console.log(data)
                this.lAnio = data.body.response.data
            }
        )
    }
    
    verReportePendienteFacturar(){

        if (this.formPendienteFacturar.invalid) {
            return Object.values(this.formPendienteFacturar.controls).forEach(
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
        var anio = this.formPendienteFacturar.get('anio').value
 
        this.servicios.getPresupuestoPendienteFacturar( anio , Number(this.idEmp) ).subscribe(
            data => {
                if(data.body.response.data == null){
                    Swal.fire('Atención', 'No se encontraron registros', 'warning')
                    this.tablaEstado = false
                    this.spinner.hide()
                }
                else{
                    this.lPptoPendienteFacturar = data.body.response.data
                    this.anadirDatosTabla(this.lPptoPendienteFacturar)
                    this.tablaEstado = true
                    this.spinner.hide()
                }
            }
        )

    }

    anadirDatosTabla(lPptoPendienteFacturar: PptoPendienteFacturarDto[]) {
        this.dataSource = new MatTableDataSource(lPptoPendienteFacturar)
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
    }

    descargarReportePendienteFacturar(){

        if (this.formPendienteFacturar.invalid) {
            return Object.values(this.formPendienteFacturar.controls).forEach(
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
        const anio = this.formPendienteFacturar.get('anio').value

        this.servicios.GetPresupuestoPendienteFacturarXLS( anio , Number(this.idEmp) ).subscribe(
            data => {
                this.downloadFile(data)
            }
        )
    }

    downloadFile(response: any){

        let name = 'Reporte Ppto Pendiente Facturar';
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
                this.verReportePendienteFacturar()
                break
            case 1: 
                this.descargarReportePendienteFacturar()
            default:
                break
        }
    }

}