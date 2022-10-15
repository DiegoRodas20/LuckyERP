import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import Swal from "sweetalert2";
import { RegistroVentaDto } from "../../../repository/models/registro-venta/registroVentaDto";
import { RegistroVentasService } from "../../../repository/services/registro-ventas.service";


@Component({
    selector        : "app-registro-ventas",
    templateUrl     : "./registro-ventas.component.html",
    styleUrls       : ["./registro-ventas.component.css"],
    animations      : [asistenciapAnimations]
})

export class RegistroVentasComponent implements OnInit {

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

    //Variables para el año actual
    date            : Date = new Date()
    fechaActual     : number
    
    //Variable para controlar Radio Button
    opcionSeleccionada  : number

    //Variable para controlar la tabla
    tablaEstado: boolean = false

    //Lista para la tabla
    lRegistroVentas  : RegistroVentaDto[] = []

    //Datos para la tabla 
    dataSourceRegistroVenta: MatTableDataSource<RegistroVentaDto>;
    displayedColumns = ['tipoServicio',
        'estadoComprobante',
        'documento',
        'comprobanteAfectado',
        'ordenCompra',
        'aceptacion',
        'ordenServicio',
        'fechaDocumento',
        'presupuesto',
        'nombrePresupuesto',
        'fechaInicio',
        'fechaFin',
        'directoraGeneral',
        'gerenteCuentas',
        'ejecutivo',
        'cliente',
        'servicio',
        'marca',
        'oficinaOrdenante',
        'totalPresupuesto',
        'aCuenta',
        'redondeo',
        'subTotal',
        'igv',
        'totalFactura',
        'ciudad',
        'facturacionCiudad'
    ];

    @ViewChild(MatPaginator, { static: false }) paginatorRegistroVentas: MatPaginator;
    @ViewChild(MatSort, { static: false }) sortRegistroVentas: MatSort;

    formRegistroVentas  : FormGroup

    constructor(
        private fb          : FormBuilder,
        private spinner     : NgxSpinnerService,
        private dialog      : MatDialog,
        private servicios   : RegistroVentasService,

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
        
        this.fechaActual    = this.date.getFullYear()
        this.crearFormRegistroVentas()
        this.onToggleFab(1, -1)
        this.cambiarOpcion(1)
    }

    crearFormRegistroVentas(){
        this.formRegistroVentas = this.fb.group({
            rbRegistroVentas    : true,
            anio                : [this.fechaActual, [Validators.required]],
            fechaInicio         : [null, [Validators.required]],
            fechaFin            : [null, [Validators.required]],
        })
    }

    cambiarOpcion(opcion: number){
        if ( opcion == 1 ){
            this.formRegistroVentas.controls.anio.enable()
            this.formRegistroVentas.controls.fechaInicio.disable()
            this.formRegistroVentas.controls.fechaFin.disable()
            this.formRegistroVentas.controls.fechaInicio.setValue(null)
            this.formRegistroVentas.controls.fechaFin.setValue(null)
            this.opcionSeleccionada = 1
            this.tablaEstado = false
        }
        else if ( opcion == 2 ){
            this.formRegistroVentas.controls.anio.disable()
            this.formRegistroVentas.controls.fechaInicio.enable()
            this.formRegistroVentas.controls.fechaFin.enable()
            this.opcionSeleccionada = 2
            this.tablaEstado = false
        }
    }

    verReporteRegistroVentas(){

        if (this.formRegistroVentas.invalid) {
            return Object.values(this.formRegistroVentas.controls).forEach(
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

        if( this.opcionSeleccionada == 1 ){

            var fechaInicio     =  this.fechaActual + '-01-01'
            var fechaFin        =  this.fechaActual + '-12-31' 
    
            this.servicios.getRegistrosVenta( Number(this.idEmp) , fechaInicio, fechaFin).subscribe(
                data => {
                    if(data.body.response.data == null){
                        
                        Swal.fire('Atención', 'No se encontraron registros', 'warning')
                        this.tablaEstado = false
                        this.spinner.hide()
                    }
                    else{
    
                        this.lRegistroVentas = data.body.response.data
                        this.anadirDatosTabla(this.lRegistroVentas)
                        this.tablaEstado = true
                        this.spinner.hide()
                    }
                }
            )
        }

        if( this.opcionSeleccionada == 2 ) {
            let formRegistroVentas = this.formRegistroVentas.value

            var fechaI = formRegistroVentas.fechaInicio
            var fechaF = formRegistroVentas.fechaFin

            if (fechaI > fechaF) {
                Swal.fire('Atención', 'La fecha final debe ser mayor a la fecha inicial', 'warning')
                this.spinner.hide()
                return
            }
            else {

                var fechaInicio = fechaI._i.year + '-' + (fechaI._i.month + 1) + '-' + fechaI._i.date
                var fechaFin = fechaF._i.year + '-' + (fechaF._i.month + 1) + '-' + fechaF._i.date

                this.servicios.getRegistrosVenta(Number(this.idEmp), fechaInicio, fechaFin).subscribe(
                    data => {
                        if (data.body.response.data == null) {

                            Swal.fire('Atención', 'No se encontraron registros', 'warning')
                            this.tablaEstado = false
                            this.spinner.hide()
                        }
                        else {

                            this.lRegistroVentas = data.body.response.data
                            this.anadirDatosTabla(this.lRegistroVentas)
                            this.tablaEstado = true
                            this.spinner.hide()
                        }
                    }
                )
            }  
        }

    }

    anadirDatosTabla(lRegistroVentas: RegistroVentaDto[]) {
        this.dataSourceRegistroVenta = new MatTableDataSource(lRegistroVentas)
        this.dataSourceRegistroVenta.paginator = this.paginatorRegistroVentas
        this.dataSourceRegistroVenta.sort = this.sortRegistroVentas
    }

    descargarReporteRegistroVentas(){

        if (this.formRegistroVentas.invalid) {
            return Object.values(this.formRegistroVentas.controls).forEach(
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

        if( this.opcionSeleccionada == 1 ){

            var fechaInicio     =  this.fechaActual + '-01-01'
            var fechaFin        =  this.fechaActual + '-12-31'
    
            this.servicios.GetRegistrosVentaXLS( Number(this.idEmp) , fechaInicio , fechaFin).subscribe(
                data => {
                    this.downloadFile(data)
                }
            )
        }
        if( this.opcionSeleccionada == 2 ){

            let formRegistroVentas = this.formRegistroVentas.value

            var fechaI = formRegistroVentas.fechaInicio
            var fechaF = formRegistroVentas.fechaFin

            if (fechaI > fechaF) {
                Swal.fire('Atención', 'La fecha final debe ser mayor a la fecha inicial', 'warning')
                this.spinner.hide()
                return
            }
            else{
    
                var fechaInicio     = fechaI._i.year + '-' + (fechaI._i.month + 1) + '-' + fechaI._i.date
                var fechaFin        = fechaF._i.year + '-' + (fechaF._i.month + 1) + '-' + fechaF._i.date
                
                this.servicios.GetRegistrosVentaXLS( Number(this.idEmp) , fechaInicio , fechaFin).subscribe(
                    data => {
                        this.downloadFile(data)
                    }
                )
            }
        }
        
    }

    downloadFile(response: any){

        let name = 'Reporte Registro de Ventas';
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
                this.verReporteRegistroVentas()
                break
            case 1:
                this.descargarReporteRegistroVentas()
                break
            default:
                break
        }
    }


}