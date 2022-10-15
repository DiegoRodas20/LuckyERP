import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-numero-campo-empleado',
  templateUrl: './numero-campo-empleado.component.html',
  styleUrls: ['./numero-campo-empleado.component.css'],
})
export class NumeroCampoEmpleadoComponent implements OnInit {
  /**
   * Entra y salida de datos del componente
   */
  @Input() label: String;
  @Output() valorOutput = new EventEmitter<number>();
  @Input() valor: number;
  /**
   * Valor que va emitir
   */

  constructor() {}

  ngOnInit(): void {}

  /**
   * Cada vez que se digita en el campo, se ejecuta esta
   * funcion, emitiendo en cada momento el valor interno.
   */
  registrarEscritura() {
    this.valorOutput.emit(this.valor);
  }
}
