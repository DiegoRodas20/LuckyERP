import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RentabilidadPresupuestoService } from '../../rentabilidad-presupuesto.service';

@Component({
    selector: 'app-rentabilidad-detalle',
    templateUrl: './rentabilidad-detalle.component.html',
    styleUrls: ['./rentabilidad-detalle.component.css']
})

export class RentabilidadDetalleComponent implements OnInit {

    url: string
    idEmp: string

    //lista para la tabla 
    lDetalle: any[] = [];

    formRentabilidadDetalle: FormGroup

    dataSource: MatTableDataSource<any>
    displayedColumns = ['presupuesto', 'descripcion', 'base', 'gasto', 'rent']

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    constructor(
        public dialogRef: MatDialogRef<RentabilidadDetalleComponent>,
        private formBuilder: FormBuilder,
        private rentabilidadService: RentabilidadPresupuestoService,

        @Inject('BASE_URL') baseUrl: string,
        @Inject(MAT_DIALOG_DATA) private dialogConfigData,
    ) { this.url = baseUrl, this.inicializarForm() }

    ngOnInit(): void {
        this.idEmp = localStorage.getItem('Empresa');

        this.listarDetalleRentabilidad()
    }

    inicializarForm() {

        this.formRentabilidadDetalle = this.formBuilder.group({
            cliente: [this.dialogConfigData.element.sCliente],
            ejecutivo: [this.dialogConfigData.element.sEjecutivo1],
            directorgen: [this.dialogConfigData.element.sDirGeneral],
            servicio: [this.dialogConfigData.element.sServicio],
            directorcta: [this.dialogConfigData.element.sDirCuenta],
            ciudad: [this.dialogConfigData.element.sSucursal],
            cargopartida: [this.dialogConfigData.element.sPartida]
        })
    }

    async listarDetalleRentabilidad() {

        var element = this.dialogConfigData.element
        var data = this.dialogConfigData.data

        var pEntidad = 2;
        var pOpcion = 2;  //CRUD -> Listar
        var pParametro = []; //Parametros de campos vacios
        var pTipo = 0;

        pParametro.push(this.idEmp);
        pParametro.push(data.mesProceso);
        pParametro.push(data.anhoProceso);
        pParametro.push(data.filtroTablaReporte);
        pParametro.push(element.nIdCliente);
        pParametro.push(element.nIdEjecutivo1);
        pParametro.push(element.nIdDirCuenta);
        pParametro.push(element.nIdDirGeneral);
        pParametro.push(element.nIdServicio);
        pParametro.push(element.nIdSucursal);
        pParametro.push(element.nIdPartida);

        console.log(pParametro)

        try {
            const response = await this.rentabilidadService.fnReporteRentabilidad(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
            this.lDetalle = response;

            this.anadirDatosTabla(this.lDetalle);
        }
        catch (error) {
            console.log(error);
            this.lDetalle = [];
        }
    }
    
    anadirDatosTabla(lDetalle: any[]) {
        this.dataSource = new MatTableDataSource(lDetalle)
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
    }

}