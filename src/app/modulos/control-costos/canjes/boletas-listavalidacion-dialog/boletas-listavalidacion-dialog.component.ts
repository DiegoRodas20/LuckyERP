import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    selector: "app-boletas-listavalidacion-dialog",
    templateUrl: "./boletas-listavalidacion-dialog.component.html",
    styleUrls: ["./boletas-listavalidacion-dialog.component.css"],
     
})
export class BoletaListaValidacionDialogComponent implements OnInit {

    validacion: string[];

    constructor(
        public dialogRef: MatDialogRef<BoletaListaValidacionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ){}

    ngOnInit(): void {
        //console.log(this.data);
    }


}


