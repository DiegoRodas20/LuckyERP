import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-articulo-imagen',
  templateUrl: './articulo-imagen.component.html',
  styleUrls: ['./articulo-imagen.component.css']
})
export class ArticuloImagenComponent implements OnInit {

  url;
  sArticulo: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data,
    public dialogRef: MatDialogRef<ArticuloImagenComponent>,
  ) {
    
    this.url = data.url;
    this.sArticulo = data.sArticulo;
    
  }

  ngOnInit() {
  }

}



