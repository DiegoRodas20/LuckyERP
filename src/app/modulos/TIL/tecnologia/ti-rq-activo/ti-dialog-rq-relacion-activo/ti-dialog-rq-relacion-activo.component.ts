import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';



@Component({
    selector: 'app-ti-dialog-rq-relacion-activo',
    templateUrl: './ti-dialog-rq-relacion-activo.component.html',
    styleUrls: ['./ti-dialog-rq-relacion-activo.component.css']
})

export class TiDialogRqRelacionActivoComponent implements OnInit{

    sTitulo = 'Registrar Activo';
    constructor(
        public dialogRef: MatDialogRef<TiDialogRqRelacionActivoComponent>,
        public dialog: MatDialog,
    ){}


    ngOnInit():void{
        
    }


    
        
}