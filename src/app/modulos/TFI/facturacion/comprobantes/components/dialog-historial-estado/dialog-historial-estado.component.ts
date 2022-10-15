import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';  
import { ComprobanteHistorialEstado } from 'src/app/modulos/TFI/repository/models/comprobante/comprobanteHistorial.entity';
import { FacturacionService } from 'src/app/modulos/TFI/repository/services/facturacion.service';

import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-dialog-historial-estado',
  templateUrl: './dialog-historial-estado.component.html',
  styleUrls: ['./dialog-historial-estado.component.css']
})
export class DialogHistorialEstadoComponent implements OnInit {  
  nombre; 
   
  displayedColumns: string[] = ['usuario', 'estado', 'fecha', 'ver','descargar'];
  listaHistorialCambio: ComprobanteHistorialEstado[] = [];
  dataSource = new MatTableDataSource<ComprobanteHistorialEstado>([]);
  comprobanteId: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(
    private spinner: NgxSpinnerService, 
    private _facturacionService: FacturacionService,
    public dialogRef: MatDialogRef<DialogHistorialEstadoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  async ngOnInit() {
    this.comprobanteId = this.data.comprobanteId;
    
    await this.obtenerHistorialEstado(this.comprobanteId);
  }

  async obtenerHistorialEstado(comprobanteId: number) {
    this.spinner.show('spi_lista'); 
    const resp: any = await this._facturacionService.getHistorialEstadoComprobante(20,comprobanteId);
    this.listaHistorialCambio = resp.body.response.data;
    await this.llenarTablaHistorial(this.listaHistorialCambio);
    
  }

  async llenarTablaHistorial(listaHitorial: ComprobanteHistorialEstado[]) { 
    
    this.dataSource = new MatTableDataSource<ComprobanteHistorialEstado>(listaHitorial);
    this.dataSource.paginator = this.paginator;
    this.spinner.hide('spi_lista'); 
  }
 

  async DescargarUrl(url){
    let cadena = url.split('/') 
    this.nombre = cadena[4];   
    this._fnURL(url,1);
  } 

  async VerUrl(url) {  
    let cadena = url.split('/') 
    this.nombre = cadena[4];   
    this._fnURL(url,0);
  }
 
  async _fnURL(url,op:number){
    this.spinner.show('spi_lista'); 
    var reader = new FileReader();  
    const response = await fetch(url);
    const data = await response.blob();  
    let a =  new File([data],this.nombre, {
      type: 'text/csv;charset=utf-8;',
    });    
    
    if(op === 0){ 
      reader.onload = function(e) {
        var contenido = e.target.result;
        mostrarContenido(contenido);
      };
      reader.readAsText(a);  
    }
    else{
      const link = document.createElement('a');
      if (link.download !== undefined) {
        // Browsers that support HTML5 download attribute
        const url = URL.createObjectURL(a); 
        
        link.setAttribute('href', url);
        link.setAttribute('download', this.nombre); 
        
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } 
    } 
    
    this.spinner.hide('spi_lista');  
    
  }
   

}
function mostrarContenido(contenido) { 
  Swal.fire({  
    // html: true,
    text: contenido , 
    customClass:{ 
      popup:'swal-wide',
      content:'swal-letra'
    }
  })
}


