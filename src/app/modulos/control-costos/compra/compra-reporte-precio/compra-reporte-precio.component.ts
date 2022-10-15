import { DecimalPipe } from "@angular/common";
import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { resetFakeAsyncZone } from "@angular/core/testing";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { tr } from "date-fns/locale";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import Swal from "sweetalert2";
import { CompraService } from "../compra.service";


export interface ReportePreciosHistorico {
    fechaOc: Date;
    nCantidad: number;
    nIdArticulo: number;
    nIdProveedor: number;
    nPrecio: string;
    nroOC: string;
    sCentroCosto: string;
    sCodArticulo: string;
    sNombreProducto: string;
    sRazonSocial: string;
    sRuc: string;
    sTipoDoc: string;
}

export interface Anio {
    sDesc: string;
}

export interface ListaProveedor {
    nIdProveedor: number;
    sRuc: string;
    sRazonSocial: string;
}

export interface ListaArticulo {
    nIdArticulo: number;
    sCodArticulo: string;
    sNombreProducto: string;
}

@Component({
    selector: "app-compra-reporte-precio.component",
    templateUrl: "./compra-reporte-precio.component.html",
    styleUrls: ["./compra-reporte-precio.component.css"],
    animations: [asistenciapAnimations]
})


export class CompraReportePrecioComponent implements OnInit {

    //Botones Flotantes
    tsLista = 'active'; // Inicia la lista visible
    fbLista = [ // Lista de las opciones que se mostrarán
        { icon: 'search', tool: 'Buscar' },
        { icon: 'cloud_download', tool: 'Descargar Archivo' }
    ]
    abLista = [];

    url: string;
    idUser: number;
    pNom: string;
    idEmp: string;
    pPais: string;
    pNomEmp: string;
    nEmpresa: string

    lAnio: Anio[] = [];
    lProveedor: ListaProveedor[] = [];
    lArticulo: ListaArticulo[] = [];
    lReportePrecios: ReportePreciosHistorico[] = [];

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;
    dataSource: MatTableDataSource<ReportePreciosHistorico>;
    displayedColumns = ['fechaOc', 'sCentroCosto', 'sTipoDoc', 'nroOC', 'sRuc', 'sRazonSocial', 'sCodArticulo', 'sNombreProducto', 'nCantidad', 'nPrecio'];
    nMostrar: number;
    formReportePrecios: FormGroup;

    constructor(
        private spinner: NgxSpinnerService,
        private formBuilder: FormBuilder,
        private router: Router,
        private vCompraService: CompraService,
        @Inject('BASE_URL') baseUrl: string
    ) {
        this.url = baseUrl;
        this.nMostrar = 0;
    }

    ngOnInit(): void {
        let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
        localStorage.removeItem('NamEmpresa');

        this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
        this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
        this.idEmp = localStorage.getItem('Empresa');
        this.pPais = localStorage.getItem('Pais');
        //this.nEmpresa = "Lucky S.A.C.";

        var lista = [];
        lista = JSON.parse(localStorage.ListaEmpresa)
        for (let index = 0; index < lista.length; index++) {
            if (lista[index].nIdEmp == this.idEmp) {
                this.nEmpresa = lista[index].sDespEmp;
            }
        }

        this.formReportePrecios = this.formBuilder.group({
            cboAnio: [''],
            rbProveedor: [0],
            cboProveedor: null,
            rbArticulo: [0],
            cboArticulo: null
        })

        this.formReportePrecios.controls.cboProveedor.disable();
        this.formReportePrecios.controls.cboArticulo.disable();

        this.fnListarAnios();
        this.fnListarProveedores();
        this.fnListarArticulos();
        this.onToggleFab(1,-1)
    }

    fnListarAnios = function () {
        this.spinner.show();
        var pEntidad = 1;
        var pOpcion = 2;
        var pParametro = [];
        pParametro.push(2);
        var pTipo = 2;

        pParametro.push(this.idEmp);
        this.vCompraService.fnCompraReporteHistorico(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
            res => {
                this.lAnio = res;
            },
            err => {
                console.log(err);
            },
            () => {
                this.spinner.hide();
            }
        );
    }
    fnListarProveedores = function () {
        this.spinner.show();
        var pEntidad = 1;
        var pOpcion = 2;
        var pParametro = [];
        pParametro.push(2);
        var pTipo = 3;

        this.vCompraService.fnCompraReporteHistorico(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
            res => {
                this.lProveedor = res;
            },
            err => {
                console.log(err);
            },
            () => {
                this.spinner.hide();
            }
        );
    }

    fnGenerarReportePreciosOC = function () {
        this.spinner.show();
        let pEntidad = 1;
        let pOpcion = 2;
        let pTipo = 1;
        var pParametro = [];
        // Obtenemos la data del formulario
        const empresa = this.idEmp;
        const year = this.formReportePrecios.get('cboAnio').value;
        const proveedor = this.formReportePrecios.get('cboProveedor').value;
        const articulo = this.formReportePrecios.get('cboArticulo').value;
        pParametro.push(empresa);
        pParametro.push(year);
        pParametro.push(proveedor);
        pParametro.push(articulo);

        this.vCompraService.fnCompraReporteHistorico(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
            res => {
                this.lReportePrecios = res;
                this.anadirDatosTabla(this.lReportePrecios);
                if (this.lReportePrecios.length == 0) {

                    Swal.fire('¡Verificar!', 'Debe seleccionar el año', 'warning')
                    const reporteprecios = res;
                    this.anadirDatosTabla(this.lReportePrecios);
                    this.nMostrar = 0;
                }
                if (this.lReportePrecios.length > 0) {
                    const reporteprecios = res;

                    this.anadirDatosTabla(this.lReportePrecios);
                    this.nMostrar = 1;
                }
            },
            err => {
                console.log(err);
            },
            () => {
                this.spinner.hide();
            }
        );
    }

    fnListarArticulos = function () {
        this.spinner.show();
        var pEntidad = 1;
        var pOpcion = 2;
        var pParametro = [];
        pParametro.push(2);
        var pTipo = 4;

        this.vCompraService.fnCompraReporteHistorico(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
            res => {
                this.lArticulo = res;
            },
            err => {
                console.log(err);
            },
            () => {
                this.spinner.hide();
            }
        );

    }

    anadirDatosTabla(lista: ReportePreciosHistorico[]) {
        this.dataSource = new MatTableDataSource(lista);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    fnCambiarProveedor(opcion: number) {
        if (opcion == 0) {
            this.formReportePrecios.controls.cboProveedor.setValue('');
            this.formReportePrecios.controls.cboProveedor.disable();
        }
        if (opcion == 1) {
            this.formReportePrecios.controls.cboProveedor.enable();
        }
    }

    fnCambiarArticulo(opcion: number) {
        if (opcion == 0) {
            this.formReportePrecios.controls.cboArticulo.setValue('');
            this.formReportePrecios.controls.cboArticulo.disable();
        }
        if (opcion == 1) this.formReportePrecios.controls.cboArticulo.enable();
    }

    fnDescargarExcel() {
        if (this.lReportePrecios.length > 0) {
            Swal.fire({
                title: '¿Desea continuar?',
                text: "Se descargarán los archivos adjuntos",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                cancelButtonText: 'Cancelar',
            }).then((result) => {
                if (result.isConfirmed) {
                    this.vCompraService.fnDescargarExcelReporteHistorico(this.lReportePrecios, this.url, this.nEmpresa).subscribe((resp) => {
                        window.open(resp.rutaAzure);
                    });
                    Swal.fire('Correcto', 'Se descargo el archivo', 'success'); 
                }
                else {
                    Swal.fire('Atención', 'El archivo no ha sido descargado', 'warning'); 
                }
            });
        }

        else { Swal.fire('¡Verificar!', 'No se encontraron registros', 'warning') }
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
                this.fnGenerarReportePreciosOC()
                break
            case 1:
                this.fnDescargarExcel()
                break
            default:
                break
        }
    }

}