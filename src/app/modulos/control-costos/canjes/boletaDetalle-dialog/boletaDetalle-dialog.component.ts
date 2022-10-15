import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import Swal from "sweetalert2";
import { BoletaDetalle } from "../Models/boleta_detalle.model";

@Component({
    selector: "app-boletadetalle-dialog",
    templateUrl: "./boletaDetalle-dialog.component.html",
    styleUrls: ["./boletaDetalle-dialog.component.css"],

})
export class BoletaDetalleDialogComponent implements OnInit {

    dsBoletaDetalle: MatTableDataSource<BoletaDetalle>;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    displayedColumnsDetalle: string[] = ['nIdBoleta', 'sNombreProducto', 'sCodArticulo', 'nCantidad', 'nPrecioUnidad', 'sRutaArchivo'];

    constructor(
        public dialogRef: MatDialogRef<BoletaDetalleDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit(): void {
        this.dsBoletaDetalle = new MatTableDataSource(this.data);
        this.dsBoletaDetalle.sort = this.sort;
    }

    fnVerImagen(sArticulo: string, sRutaArchivo: string) {
        if (sRutaArchivo != '' && sRutaArchivo != null) {
            Swal.fire({
                text: sArticulo,
                imageUrl: sRutaArchivo,
                imageWidth: 250,
                imageHeight: 250,
            })
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Este artículo no contiene una imagen',
                showConfirmButton: false,
                timer: 1500
            });
        }
    }

}