import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  Inject,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { AgregarDataDesplegableComponent } from "./agregar-data-desplegable/agregar-data-desplegable.component";
//#region NUEVA DATA DESPLEGABLE
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
//#endregion

import { CartaTiendaService } from "../../../service/carta-tienda.service";
import { DesplegableCampo } from "../../../models/DesplegableCampo";

@Component({
  selector: "app-desplegable-campo-empleado",
  templateUrl: "./desplegable-campo-empleado.component.html",
  styleUrls: ["./desplegable-campo-empleado.component.css"],
})
export class DesplegableCampoEmpleadoComponent implements OnInit {
  //#region Entra y salida de datos del componente
  @Input() label: String;
  @Input() CampoID: number;
  @Output()
  valorOutput: EventEmitter<DesplegableCampo> = new EventEmitter<DesplegableCampo>();
  @Input() valor: any;
  //#endregion

  //#region Valor que va emitir
  myControl = new FormControl();
  options: DesplegableCampo[] = [];
  filteredOptions: Observable<DesplegableCampo[]>;
  dataFiltradaEstatica: DesplegableCampo[] = [];
  //#endregion

  //#region
  valorModal: DesplegableCampo;
  //#endregion

  //#region  constructor
  constructor(
    private cartaTiendaService: CartaTiendaService,
    public dialog: MatDialog
  ) {}
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this._cargarDatos(this.CampoID);
    this._escucharCambiosBuscador();
    this.filteredOptions.subscribe((data) => {
      this.dataFiltradaEstatica = data;
    });

    this.myControl.setValue(this.valor);
  }
  //#endregion

  //#region API CARGAR DATA
  private _cargarDatos(campo_id) {
    let parametros = [];
    parametros.push(campo_id);
    this.cartaTiendaService
      .crudCampoDesplegable(0, parametros)
      .then((data: DesplegableCampo[]) => {
        this.options = data;
      });
  }
  //#endregion

  //#region Buscador y filtro
  private _escucharCambiosBuscador() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(""),
      map((val) => this._filtro(val))
    );
  }

  private _filtro(valorControl: String): DesplegableCampo[] {
    if (valorControl === undefined || valorControl === null) {
      return this.options;
    }

    const val = valorControl.toLocaleLowerCase();
    return this.options.filter((option) =>
      option.pValor.toLocaleLowerCase().includes(val)
    );
  }
  //#endregion

  /**
   * Cuando se selecciona una opcion se emite este evento al Padre
   */
  enviarEventoData() {
    const data = this.dataFiltradaEstatica.find(
      (item) =>
        item.pValor.toLocaleLowerCase() ===
        this.myControl.value.toLocaleLowerCase()
    );
    if (data != undefined) {
      this.valorOutput.emit(data);
    }
  }

  //#region AGREGAR NUEVA DATA AL DESPLEGABLE
  public abrirModalAgregarData() {
    const dialogRef = this.dialog.open(AgregarDataDesplegableComponent, {
      data: {
        pId: 0,
        pIdCampo: 0,
        pValor: this.myControl.value,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this._enviarData(result);
      }
    });
  }

  public _enviarData(data: DesplegableCampo) {
    let parametros = [];
    parametros.push(this.CampoID);
    parametros.push(data.pValor);
    this.cartaTiendaService
      .crudCampoDesplegable(1, parametros)
      .then((id: number) => {
        data.pId = id;
        data.pIdCampo = this.CampoID;

        this.options = [data, ...this.options];
        this.dataFiltradaEstatica = [data, ...this.dataFiltradaEstatica];
      });
  }
  //#endregion
}
