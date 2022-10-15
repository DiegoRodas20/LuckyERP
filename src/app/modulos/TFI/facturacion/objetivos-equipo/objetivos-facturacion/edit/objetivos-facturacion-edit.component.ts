import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import { ClienteGrupo, ObjetivoEjecutivo, ObjetivoMensual } from "src/app/modulos/TFI/repository/models/objetivos-facturacion/objetivoFacturacionDto";
import { ObjetivosFacturacionService } from "src/app/modulos/TFI/repository/services/objetivos-facturacion.service";
import Swal from "sweetalert2";
import { ClientesDialogComponent } from "./clientes-dialog/clientes-dialog.component";
import { EjecutivosDialogComponent } from "./ejecutivos-dialog/ejecutivos-dialog.component";
import { ObjetivosDialogComponent } from "./objetivos-dialog/objetivos-dialog.component";

@Component({
    selector: "app-objetivos-facturacion-edit.component",
    templateUrl: "./objetivos-facturacion-edit.component.html",
    styleUrls: ["./objetivos-facturacion-edit.component.css"],
    animations: [asistenciapAnimations]
})

export class ObjetivosFacturacionEditComponent implements OnInit {

    //Botones Flotantes
    tsLista = 'active'; // Inicia la lista visible
    fbLista = [ // Lista de las opciones que se mostrarán
        // { icon: 'cloud_download', tool: 'Exportar a XLS' },
        { icon: 'exit_to_app', tool: 'Salir' }
    ]
    abLista = [];

    //Datos necesarios
    url         : string
    idUser      : number
    pNom        : string
    idEmp       : string
    pPais       : string
    pNomEmp     : string
    nEmpresa    : string

    date: Date = new Date()
    anio: number

    //Variables para controlar tabla Cliente
    lCliente
    nombreClienteGrupo  : string
    codigoObjGrupo      : number
    codigoIdCliente     : number
    nClienteEstado      : number

    //Variables para controlar tabla Ejecutivos
    lEjecutivo
    nombreObjetivoEjecutivo : string
    codigoObjCliente        : number
    nEjecutivoEstado        : number

    //Parametros
    pOpcion     = 1
    pParametro  = []

    //Listas para la Tablas
    lGrpObjMensual      : ObjetivoMensual[]
    lClientexGrupo      : ClienteGrupo[]
    lObjetivoxEjecutivo : ObjetivoEjecutivo[]

    //Datos para la tabla Grupos Objetivos Mensuales
    dataSource: MatTableDataSource<ObjetivoMensual>
    displayedColumns = ['seleccionar', 'direccion', 'cliente', 'mes', 'objetivo', 'regularizacion', 'motivo', 'objetivocovid', 'opciones']

    //Datos para la tabla Clientes
    dataSourceClientes: MatTableDataSource<ClienteGrupo>
    displayedColumnsClientes = ['seleccionar', 'cliente', 'razonsocial', 'objetivo', 'objetivocovid', 'opciones']

    //Datos para la tabla Objetivos Ruc
    dataSourceEjecutivos: MatTableDataSource<ObjetivoEjecutivo>
    displayedColumnsEjecutivos = ['ejecutivo', 'nombre', 'objetivo', 'regularizacion', 'motivo', 'objetivocovid', 'opciones']

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator
    @ViewChild(MatPaginator, { static: false }) paginatorClientes: MatPaginator
    @ViewChild(MatPaginator, { static: false }) paginatorEjecutivos: MatPaginator

    @ViewChild(MatSort, { static: false }) sort: MatSort
    @ViewChild(MatSort, { static: false }) sortClientes: MatSort
    @ViewChild(MatSort, { static: false }) sortEjecutivos: MatSort

    constructor(
        private spinner     : NgxSpinnerService,
        private router      : Router,
        private route       : ActivatedRoute,
        private dialog      : MatDialog,
        private formBuilder : FormBuilder,
        private servicios   : ObjetivosFacturacionService,

        @Inject('BASE_URL') baseUrl: string) { this.url = baseUrl }

    ngOnInit(): void {

        //Datos del Usuario
        let user        = localStorage.getItem('currentUser')
        this.idUser     = JSON.parse(window.atob(user.split('.')[1])).uid
        this.pNom       = JSON.parse(window.atob(user.split('.')[1])).uno
        this.idEmp      = localStorage.getItem('Empresa')
        this.pPais      = localStorage.getItem('Pais')

        this.route.params.subscribe(params => {
            this.anio = + params.anio
        })
        
        this.onToggleFab(1, -1)
        this.consultarObjMensualesxAnio(this.anio)
    }

    //Funciones Grupos Objetivos mensuales
 
    consultarObjMensualesxAnio(anio: number) {

        this.spinner.show()
        this.pOpcion = 6
        this.pParametro = []
        this.pParametro.push(anio)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getGruposMensuales( param ).subscribe(
            data => {
                this.lGrpObjMensual = data.body.response.data
                this.anadirDatosTabla(this.lGrpObjMensual)
                this.spinner.hide()
            })
    }

    anadirDatosTabla(lGrpObjMensual: ObjetivoMensual[]) {

        this.dataSource = new MatTableDataSource(lGrpObjMensual)
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        
    }

    get objetivosSuma() {
        if (this.dataSource == null) { return 0 }
        return this.fnRedondear(this.dataSource.data.reduce((sum, current) => sum + Number(current.montoObjetivo), 0))
    }

    get objetivosCovidSuma() {
        if (this.dataSource == null) { return 0 }
        return this.fnRedondear(this.dataSource.data.reduce((sum, current) => sum + Number(current.montoObjCovid), 0))
    }

    agregarObjetivoMensual() {

        const dialogConfig = new MatDialogConfig()
        var anio = this.anio

        dialogConfig.data = { anio }
        dialogConfig.maxWidth = '100vw'
        dialogConfig.width = '800px'

        const dialogReg = this.dialog.open(ObjetivosDialogComponent, dialogConfig)
        dialogReg.afterClosed().subscribe(result => {
            this.consultarObjMensualesxAnio(this.anio)
        })
    }

    eliminarObjetivoMensual(codigoObjGrupo: number) {

        this.spinner.show()
        this.pOpcion = 10
        this.pParametro = []
        this.pParametro.push(codigoObjGrupo)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.DeleteObjetivoMensual( param ).subscribe(
            data => {
                if (Number(data.body.response.data[0].valorRetorno) == 1) {
                    Swal.fire('Exito', 'Se elimino con exito.', 'success')
                    this.consultarObjMensualesxAnio(this.anio)
                    this.nClienteEstado = 0
                    this.nEjecutivoEstado = 0
                    this.spinner.hide()
                }
                else {
                    Swal.fire('Error', 'Comuniquese con el area de sistema', 'error')
                    this.spinner.hide()
                }
            })
    }

    editarObjetivoMensual(codigoObjGrupo: number) {

        var data = codigoObjGrupo
        const dialogConfig = new MatDialogConfig()

        dialogConfig.data = { data }
        dialogConfig.maxWidth = '100vw'
        dialogConfig.width = '800px'

        const dialogReg = this.dialog.open(ObjetivosDialogComponent, dialogConfig)
        dialogReg.afterClosed().subscribe(result => {
            this.consultarObjMensualesxAnio(this.anio)
        })
    }

    //Funciones Clientes x Grupo

    listarClientexGrupo(row) {

        this.lCliente = row
        this.nombreClienteGrupo = row.direccion + ' / ' + row.cliente + ' / ' + row.mes
        this.codigoObjGrupo = row.codigoObjGrupo

        this.spinner.show()
        this.pOpcion = 11
        this.pParametro = []
        this.pParametro.push(this.codigoObjGrupo)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getClientesGrupos( param ).subscribe(
            data => {
                if (data.body.response.data.length == 0) {

                    this.lClientexGrupo = data.body.response.data
                    this.anadirDatosTablaClientes(this.lClientexGrupo)
                    this.nClienteEstado = 1
                    this.nEjecutivoEstado = 0
                    this.spinner.hide()
                    return
                }
                else {
                    this.lClientexGrupo = data.body.response.data
                    this.anadirDatosTablaClientes(this.lClientexGrupo)
                    this.nClienteEstado = 1
                    this.nEjecutivoEstado = 0
                    this.spinner.hide()
                }
            })

    }

    anadirDatosTablaClientes(lClientexGrupo: ClienteGrupo[]) {

        this.dataSourceClientes = new MatTableDataSource(lClientexGrupo)
        this.dataSourceClientes.paginator = this.paginatorClientes;
        this.dataSourceClientes.sort = this.sortClientes;

    }

    get objetivosCliente() {
        if (this.dataSourceClientes == null) { return 0 }
        return this.fnRedondear(this.dataSourceClientes.data.reduce((sum, current) => sum + Number(current.montoObjetivo), 0))
    }

    get objetivosCovidCliente() {
        if (this.dataSourceClientes == null) { return 0 }
        return this.fnRedondear(this.dataSourceClientes.data.reduce((sum, current) => sum + Number(current.montoObjCovid), 0))
    }

    agregarClientexGrupo() {
        
        var dialogConfigData = this.codigoObjGrupo
        const dialogConfig = new MatDialogConfig()

        dialogConfig.data = dialogConfigData
        dialogConfig.maxWidth = '100vw'
        dialogConfig.width = '800px'

        const dialogReg = this.dialog.open(ClientesDialogComponent, dialogConfig)

        dialogReg.afterClosed().subscribe(result => {
            this.listarClientexGrupo(this.lCliente)
        })
    }

    eliminarClientexGrupo(codigoObjCliente: number) {
        
        this.spinner.show()
        this.pOpcion = 13
        this.pParametro = []
        this.pParametro.push(codigoObjCliente)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.DeleteClienteGrupo( param ).subscribe(
            data => {
                if (Number(data.body.response.data[0].valorRetorno) > 0) {
                    Swal.fire('Exito', 'Se elimino con exito.', 'success')
                    this.listarClientexGrupo(this.lCliente)
                    this.spinner.hide()
                }
                else {
                    Swal.fire('Error', 'Comuniquese con el area de sistema', 'error')
                    this.spinner.hide()
                }
            })
    }

    //Funciones Objetivo x Ejecutivo

    listarObjetivoxEjecutivo(row) {

        this.lEjecutivo = row
        this.nombreObjetivoEjecutivo = this.nombreClienteGrupo + ' / ' + row.razonSocial
        this.codigoObjCliente = row.codigoObjCliente
        this.codigoIdCliente = row.codigoIdCliente

        this.spinner.show()
        this.pOpcion = 14
        this.pParametro = []
        this.pParametro.push(this.codigoObjCliente)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getObjetivosEjecutivo( param ).subscribe(
            data => {
                if (data.body.response.data.length == 0) {
                    this.lObjetivoxEjecutivo = data.body.response.data
                    this.anadirDatosTablaEjecutivos(this.lObjetivoxEjecutivo)
                    this.nEjecutivoEstado = 1
                    this.spinner.hide()
                    return
                }
                else {
                    this.lObjetivoxEjecutivo = data.body.response.data
                    this.anadirDatosTablaEjecutivos(this.lObjetivoxEjecutivo)
                    this.nEjecutivoEstado = 1
                    this.spinner.hide()
                }
            }
        )
    }

    anadirDatosTablaEjecutivos(lObjetivoxEjecutivo: ObjetivoEjecutivo[]) {

        this.dataSourceEjecutivos = new MatTableDataSource(lObjetivoxEjecutivo)
        this.dataSourceEjecutivos.paginator = this.paginatorEjecutivos
        this.dataSourceEjecutivos.sort = this.sortEjecutivos

    }

    get objetivosEjecutivo() {
        if (this.dataSourceEjecutivos == null) { return 0 }
        return this.fnRedondear(this.dataSourceEjecutivos.data.reduce((sum, current) => sum + Number(current.montoObjetivo), 0))
    }

    get objetivosCovidEjecutivo() {
        if (this.dataSourceEjecutivos == null) { return 0 }
        return this.fnRedondear(this.dataSourceEjecutivos.data.reduce((sum, current) => sum + Number(current.montoObjCovid), 0))
    }

    agregarObjetivoxEjecutivo() {

        const dialogConfig = new MatDialogConfig()

        var data = this.codigoObjGrupo
        var data1 = this.codigoObjCliente
        var data2 = this.codigoIdCliente
        var dialogConfigData = { data , data1 , data2}

        dialogConfig.data = dialogConfigData
        dialogConfig.maxWidth = '100vw'
        dialogConfig.width = '800px'

        const dialogReg = this.dialog.open(EjecutivosDialogComponent, dialogConfig)

        dialogReg.afterClosed().subscribe(result => {
            this.listarClientexGrupo(this.lCliente)
            this.listarObjetivoxEjecutivo(this.lEjecutivo)
        })
    }

    eliminarObjetivoxEjecutivo(codigoObjEjecutivo: number) {

        this.spinner.show()
        this.pOpcion = 18
        this.pParametro = []
        this.pParametro.push(codigoObjEjecutivo)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.DeleteObjetivoEjecutivo( param ).subscribe(
            data => {

                if (Number(data.body.response.data[0].valorRetorno) == 1) {
                    Swal.fire('Exito', 'Se elimino con exito.', 'success')
                    this.listarClientexGrupo(this.lCliente)
                    this.listarObjetivoxEjecutivo(this.lEjecutivo)
                    this.spinner.hide()
                }
                else {
                    Swal.fire('Error', 'Comuniquese con el area de sistema', 'error')
                    this.spinner.hide()
                }
            })
    }

    editarObjetivoxEjecutivo(codigoObjEjecutivo: number) {      
        const dialogConfig = new MatDialogConfig()
        
        var data = this.codigoObjGrupo
        var data1 = this.codigoObjCliente
        var data2 = this.codigoIdCliente
        var data3 = codigoObjEjecutivo
        
        var dialogConfigData = { data, data1, data2 , data3}
        dialogConfig.data = dialogConfigData
        dialogConfig.maxWidth = '100vw'
        dialogConfig.width = '800px'

        const dialogReg = this.dialog.open(EjecutivosDialogComponent, dialogConfig)

        dialogReg.afterClosed().subscribe(result => {
            this.listarClientexGrupo(this.lCliente)
            this.listarObjetivoxEjecutivo(this.lEjecutivo)
        })
    }

    //Funciones Descarga Excel

    descargarExcelGeneral() {
    }

    descargarExcelDetalle() {
    }

    descargarExcelDashBoard() {
    }

    descargarExcelObjetivos() {

        this.spinner.show()
        this.pOpcion = 21
        this.pParametro = []
        
        this.pParametro.push(this.anio)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.GetObjetivosMensualesExcel(param).subscribe(
            data => {
                
                if (data.size == 14) {
                    Swal.fire('Atención', 'No se encontraron presupuestos', 'warning')
                    this.spinner.hide();
                    return;
                }
                else {
                    this.downloadFile(data);
                }
            }
        )
    }

    public downloadFile(response: any) {
        let name = 'Excel Objetivos';
        var blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, name + '.xlsx');
        this.spinner.hide();
        return
    }

    cerrarVentana() {
        this.router.navigate(['/tfi/facturacion/Objetivos/fact_objetivos'])
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
                this.cerrarVentana()
                break
            default:
                break
        }
    }

    //Funciones Generales

    fnRedondear(num) {
        var pow = Math.pow(10, 2);
        return Math.round(num * pow) / pow;
    }
}
