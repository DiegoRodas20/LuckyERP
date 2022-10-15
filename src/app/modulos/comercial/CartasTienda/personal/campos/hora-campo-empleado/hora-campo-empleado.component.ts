import { Component, OnInit,Output,EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-hora-campo-empleado',
  templateUrl: './hora-campo-empleado.component.html',
  styleUrls: ['./hora-campo-empleado.component.css']
})
export class HoraCampoEmpleadoComponent implements OnInit {

  /**
   * Entra y salida de datos del componente
   */
  @Input() label:String;
  @Output() valorOutput=new EventEmitter<string>();
  
  /**
   * Valor que va emitir
   */
  @Input() valor:string;

  constructor() { }

  ngOnInit(): void { 
  }

  /**
   * Cada vez que se digita en el campo, se ejecuta esta 
   * funcion, emitiendo en cada momento el valor interno.
   */
  registrarEscritura(){
    this.valorOutput.emit(this.valor);
  }

}
