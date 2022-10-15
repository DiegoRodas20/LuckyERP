import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

import { MatTableDataSource } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";
import { MatDialog } from "@angular/material/dialog";

import { EditarPersonalComponent } from "../editar-personal/editar-personal.component";
import { DesplegableCampo } from "../../models/DesplegableCampo";
// store
import { Store, Select } from "@ngxs/store";
import { CampoBusqueda } from "../../store/carta_tienda/campo_busqueda/campo_busqueda.model";

import { FormatoCartaTienda } from "../../store/carta_tienda/formato_carta_tienda/formato_carta_tienda.model";
import { CampoFormatoCartaTienda } from "../../store/carta_tienda/formato_carta_tienda/formato_carta_tienda.model";
import { EliminarPersonalAFormatoCartaTienda } from "../../store/carta_tienda/personal_carta_tienda/personal_carta_tienda.actions";

//----------------------------------------------------

@Component({
  selector: "app-tabla-personal",
  templateUrl: "./tabla-personal.component.html",
  styleUrls: ["./tabla-personal.component.css"],
})
export class TablaPersonalComponent implements OnInit {
  // Data tabla
  displayedColumns: CampoFormatoCartaTienda[];
  displayColumnsDef: string[] = ["0"];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);

  public listaCamposComunes: Observable<CampoFormatoCartaTienda[]>;
  public listaPersonal: Observable<any[]>;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.listaCamposComunes = this.store.select(
      (state) => state.camposCartaTienda.camposCarta
    );
    this.listaPersonal = this.store.select(
      (state) => state.personalCartaTienda.personalCarta
    );
    this.cargarNuevasColumnasTabla();

    this.listaPersonal.subscribe((val) => {
      var valJson = JSON.parse(JSON.stringify(val));
      this.dataSource = new MatTableDataSource<any>(valJson);
    });
  }

  modificandoData(data: any) {
    if (data === "") {
      return "Vacio";
    }
    if (data !== null && data !== undefined && data.pValor !== undefined) {
      return data.pValor;
    }
    return data;
  }

  /**
   * Crea un evento el cual se mantiene a la escucha de los cambios
   * en las columnas comunes. Si se produce un cambio en el store, automaticamente
   * se reconstruye la tabla del personal registrado.
   */
  cargarNuevasColumnasTabla() {
    this.listaCamposComunes.subscribe((res) => {
      this.displayedColumns = res.map((e) => e);
      this.displayedColumns = this.displayedColumns.concat({
        pIdCampo: 0,
        pNombre: "Acciones",
        pIdTipoCampo: 1,
        pIdFormatoCampo: 1,
      });

      this.displayColumnsDef = res.map((e) => e.pIdCampo + "");
      this.displayColumnsDef = this.displayColumnsDef.concat("0");
    });
  }

  /**
   *
   */
  obtenerNombreColumnaPorElID(id: number): string {
    return this.displayedColumns.find((e) => e.pIdCampo === id).pNombre;
  }

  //#region ACCIONES EN TABLA
  editarRegistro(persona) {
    const dialogRef = this.dialog.open(EditarPersonalComponent, {
      data: persona,
    });
    dialogRef.afterClosed().subscribe((result) => {
      //console.log(`Dialog result: ${result}`);
    });
  }

  eliminarRegistro(item) {
    this.store.dispatch(new EliminarPersonalAFormatoCartaTienda(item));
  }
  //#endregion
}
