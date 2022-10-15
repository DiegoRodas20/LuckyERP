import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { FormControl } from "@angular/forms";

@Component({
  selector: "app-fecha-campo-empleado",
  templateUrl: "./fecha-campo-empleado.component.html",
  styleUrls: ["./fecha-campo-empleado.component.css"],
})
export class FechaCampoEmpleadoComponent implements OnInit {
  // FORMATO DIA/MES/ANIO
  /**
   * Entra y salida de datos del componente
   */
  @Input() label: String;
  @Input() valorEntrada: String;
  @Output() valorOutput = new EventEmitter<string>();

  /**
   * Valor que va emitir
   */
  date = new FormControl(new Date());
  constructor() {}

  ngOnInit(): void {
    this._cambiarFormatoDataEntrada();
  }

  /**
   * Convertir fecha entrada
   */

  private _cambiarFormatoDataEntrada() {
    if (this.valorEntrada !== null) {
      var fecha = this.valorEntrada.split("/"); // dia/mes/anio
      this.date = new FormControl(
        new Date(+fecha[2], +fecha[1] - 1, +fecha[0])
      );
    } else {
      var dataActual = new Date();
      this.date = new FormControl(dataActual);
      this.valorOutput.emit(dataActual.toLocaleDateString());
    }
  }
  /**
   * Cada vez que se digita en el campo, se ejecuta esta
   * funcion, emitiendo en cada momento el valor interno.
   */
  registrarEscritura() {
    var fecha: Date = this.date.value;
    this.valorOutput.emit(fecha.toLocaleDateString());
  }
}
