import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CompraService } from '../../compra.service';

@Component({
  selector: 'app-visor-imagen',
  templateUrl: './visor-imagen.component.html',
  styleUrls: ['./visor-imagen.component.css']
})
export class VisorImagenComponent implements OnInit {
  url
  pParametro=[]
  imagen
  codigo
  nombre
  constructor(@Inject(MAT_DIALOG_DATA) private data: any, private vDatoBasicoService: CompraService,@Inject('BASE_URL') baseUrl: string, ) {
   
    this.url = baseUrl;
    //console.log(data.data)
    this.MostrarImenge(data.data)
   }

  ngOnInit(): void {
  }

  MostrarImenge(imagen){
    this.pParametro.push(imagen)

    this.vDatoBasicoService.fnDatosArticulo(1, 1, this.pParametro, 5, this.url).subscribe(data=>{ 
      
        if(data.sRutaArchivo==""){
          this.imagen="../../../../../../assets/img/SinImagen.jpg"
          this.codigo="Imagen no Encontrado";
          this.nombre="Imagen no Encontrado";
        }else {

          this.imagen=data.sRutaArchivo;
          this.codigo=data.sCodArticulo;
          this.nombre=data.sNombreProducto;
           
        }
        
    })
  }
}
