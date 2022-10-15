import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-vehiculo-archivo-visor',
  templateUrl: './vehiculo-archivo-visor.component.html',
  styleUrls: ['./vehiculo-archivo-visor.component.css']
})
export class VehiculoArchivoVisorComponent implements OnInit {

  url;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) private data,
    private domSanitizer: DomSanitizer) {
    this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(data);
  }

  ngOnInit(){
    
  }

}
