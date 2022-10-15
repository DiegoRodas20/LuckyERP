import { Component, OnInit, ViewChild } from '@angular/core';
import { RegistroFacturaComponent } from 'src/app/modulos/control-costos/presupuestos/registroFactura/registroFactura.component';

@Component({
  selector: 'app-factura-directa-transporte',
  templateUrl: './factura-directa-transporte.component.html',
  styleUrls: ['./factura-directa-transporte.component.css']
})
export class FacturaDirectaTransporteComponent implements OnInit {

  @ViewChild(RegistroFacturaComponent, { static: true }) compFacturaDirecta: RegistroFacturaComponent;

  constructor() { }

  ngOnInit(): void {
  }

  fnListarFacturas(){
    this.compFacturaDirecta.fnListarFacturas();
  }  

}
