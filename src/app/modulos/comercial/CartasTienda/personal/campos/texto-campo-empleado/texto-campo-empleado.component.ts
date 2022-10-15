import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-texto-campo-empleado',
  templateUrl: './texto-campo-empleado.component.html',
  styleUrls: ['./texto-campo-empleado.component.css'],
})
export class TextoCampoEmpleadoComponent implements OnInit {
  /**
   * Entra y salida de datos del componente
   */
  @Input() label: String;
  @Output() valorOutput = new EventEmitter<string>();
  @Input() valor: string;

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
