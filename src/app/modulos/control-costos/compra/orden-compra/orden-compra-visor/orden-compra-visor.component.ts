import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-orden-compra-visor',
  templateUrl: './orden-compra-visor.component.html',
  styleUrls: ['./orden-compra-visor.component.css']
})
export class OrdenCompraVisorComponent implements OnInit {
  url
  constructor(
    @Inject(MAT_DIALOG_DATA) private data,
    private domSanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<OrdenCompraVisorComponent>,
    ) {

    this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(data);
  }

  ngOnInit(): void {
  }

  MostrarImenge() {

  }
}
