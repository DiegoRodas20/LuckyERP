import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { ETipoProcesoNota, Question, tipoProcesoName } from "../../models/constantes";
import { GRUPO_DESTINO_CABECERA } from "../../models/grupoDestino-cabecera.model";
import { GRUPO_DESTINO_DETALLE } from "../../models/grupoDestino-detalle.model";
import { E_Nota } from "../../models/notas.model";
import { TransporteService } from "../../transporte.service";
import { DialogSelectPuntoComponent } from "./dialog-select-punto/dialog-select-punto.component";
import { LogDialogSelectNotaComponent } from "./log-dialog-select-nota/log-dialog-select-nota.component";

@Component({
  templateUrl: "./dialog-notas.component.html",
  styleUrls: ["./dialog-notas.component.css"],
})
export class DialogNotasComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[];
  txtFiltro = new FormControl();
  dataSource: MatTableDataSource<E_Nota>;
  hasChanges: boolean = false;

  /* #region   Asignación nombres de campos y columnas*/
  cols: any[] = [
    { header: 'Opción', field: 'opcion', type: 'accion', width: '50', align: 'center' },
    { header: 'Estado', field: 'sEstado', type: 'estado', width: '80', align: 'left' },
    { header: 'Nombre Empresa', field: 'sNombreEmpresa', type: null, width: '120', align: 'left' },
    { header: 'Código Presupuesto', field: 'sCodPresupuesto', type: null, width: '100', align: 'center' },
    { header: 'Nota', field: 'sNota', type: null, width: '80', align: 'center' },
    { header: 'Guía', field: 'sGuia', type: null, width: '100', align: 'center' },
    { header: 'Peso', field: 'nPeso', type: 'deci2', width: '50', align: 'right' },
    { header: 'Volumen', field: 'nVolumen', type: 'deci6', width: '120', align: 'right' },
    { header: 'Distrito Origen', field: 'sDistritoOrigen', type: null, width: '150', align: 'left' },
    { header: 'Punto Origen', field: 'sPuntoOrigen', type: null, width: '200', align: 'left' },
    { header: 'Cadena Origen', field: 'sCadenaOrigen', type: null, width: '150', align: 'left' },
    { header: 'Sucursal Origen', field: 'sSucursalOrigen', type: null, width: '200', align: 'left' },
    { header: 'Distrito', field: 'sDistrito', type: null, width: '100', align: 'left' },
    { header: 'Punto Llegada', field: 'sPuntoLlegada', type: null, width: '200', align: 'left' },
    { header: 'Sucursal Destino', field: 'sSucursalDestino', type: null, width: '200', align: 'left' },
    { header: 'Destinatario', field: 'sDestinatario', type: null, width: '200', align: 'left' },
    { header: 'Supervisor', field: 'sSupervisor', type: null, width: '200', align: 'left' },
    { header: 'Fecha Traslado', field: 'dFechaTranslado', type: null, width: '100', align: 'center' },
    { header: 'Hora', field: 'sHora', type: null, width: '50', align: 'center' },
    { header: 'Ud.', field: 'nUnidades', type: null, width: '50', align: 'center' },
    { header: 'Almacén', field: 'sAlmacen', type: null, width: '100', align: 'left' },
  ];
  /* #endregion */

  constructor(
    private transporteService: TransporteService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogNotasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      notaList: E_Nota[],
      detaGrupo: GRUPO_DESTINO_DETALLE,
      grupoDestino: GRUPO_DESTINO_CABECERA,
      puntoList: GRUPO_DESTINO_DETALLE[],
      isLiquidado: boolean,
      filtro: string;
    },
  ) {
    this.displayedColumns = this.cols.map(({ field }) => field);
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.data.notaList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.txtFiltro.setValue(this.data.filtro);
    this.applyFilter(this.data.filtro);
  }

  fnListarNotas(): void {
    this.spinner.show();
    const parameters = `${this.data.detaGrupo.nIdGrupo}|${this.data.detaGrupo.nPunto}`;
    this.transporteService.fnArmadoRuta(1, 2, 12, parameters).subscribe((res) => {
      this.spinner.hide();
      const lst = res ? res.lista as E_Nota[] : [];
      this.dataSource = new MatTableDataSource(lst);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  getColor(param: boolean): string { return param ? 'red' : 'green' }

  hasContentOrigen(param: string): boolean { return param.toLowerCase().includes('origen') }

  get addMessage(): string { return this.dataSource?.data?.length < 2 ? `El punto actual se eliminará: ${this.data.detaGrupo.sPunto}` : '' }

  //#region Funcion que filta en la tabla en memoria
  applyFilter(filterValue: string): void { this.dataSource.filter = filterValue.trim().toLowerCase() }
  //#endregion

  /* #region  Método de limpieza del auto filtrado */
  fnClean(): void {
    if (this.dataSource) { this.dataSource.filter = '' }
    this.txtFiltro.setValue('');
  }
  /* #endregion */

  fnTranslate(row: E_Nota, index: number): void {
    this.dialog.open(DialogSelectPuntoComponent, {
      disableClose: true, autoFocus: false, width: '450px', data: { 'puntoList': this.data.puntoList, 'message': this.addMessage }
    })
      .afterClosed().subscribe((result: string) => {
        if (result) {
          this.spinner.show();
          const bit = !this.addMessage?.trim() ? 0 : 1;
          const parameters = `${this.data.grupoDestino.nIdGrupo}|${result}|${row.nIdOperMov}|${bit}|${this.data.detaGrupo.nPunto}`;
          this.fnUpdateOrDelete(parameters, index, ETipoProcesoNota.ACTUALIZAR);
        }
      });
  }

  fnDelete(row: E_Nota, index: number): void {
    const pregunta = `Desea eliminar la nota: ${row.sCodPresupuesto} - ${row.sNota}${!row.sGuia?.trim() == true ? '' : ` - ${row.sGuia}`}
                      ${this.addMessage}`;
    Swal.fire(new Question(pregunta) as unknown).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        const bit = !this.addMessage?.trim() ? 0 : 1;
        const parameters = `${this.data.grupoDestino.nIdGrupo}|${this.data.detaGrupo.nPunto}|${row.nIdOperMov}|${bit}`;
        this.fnUpdateOrDelete(parameters, index, ETipoProcesoNota.ELIMINAR);
      }
    });
  }

  fnUpdateOrDelete(parameters: string, index: number, tipo: ETipoProcesoNota): void {
    this.transporteService.fnArmadoRuta(1, 1, tipo, parameters).subscribe(res => {
      this.spinner.hide();
      if (res.result == 0) {
        Swal.fire({ title: `Hubo un error en la ${tipoProcesoName.get(tipo)}ción`, icon: 'warning', timer: 2000 });
      } else {
        Swal.fire({ title: `Se ha ${tipoProcesoName.get(tipo)}do de manera exitosa`, icon: 'success', timer: 2000 });
        this.dataSource.data.splice(index, 1);
        this.dataSource._updateChangeSubscription()
        this.hasChanges = true;
      }
    }, (error) => { this.spinner.hide(); console.log(error) });
  }

  fnAddNotas(): void {
    const fecha = moment(moment(this.data.grupoDestino.dFecha, 'DD/MM/YYYY').toDate()).format("YYYY-MM-DD");
    const parameters = `${fecha}|${this.data.grupoDestino.nIdSucursal}`;
    this.spinner.show();
    this.transporteService.fnArmadoRuta(1, 2, 2, parameters).subscribe(res => {
      this.spinner.hide();
      const lst = res ? res.lista as E_Nota[] : [];
      if (lst.length == 0) {
        Swal.fire({ title: `No se encontraron notas que agregar.`, icon: 'info', timer: 2000 });
        return;
      }
      this.dialog.open(LogDialogSelectNotaComponent, { autoFocus: false, width: '70%', data: { 'notaList': lst } }
      ).afterClosed().subscribe((result: number[]) => {
        if (result) {
          const parameterDet = result.join('|');
          const parameter = `${this.data.grupoDestino.nIdGrupo}|${this.data.detaGrupo.nPunto}|${this.data.detaGrupo.sNroTransporte}`;
          this.transporteService.fnArmadoRuta(1, 1, 11, parameter, parameterDet).subscribe(res => {
            if (res.result == 0) {
              Swal.fire({ title: `Hubo un error en el registro`, icon: 'warning', timer: 2000 });
            } else {
              Swal.fire({ title: `Se ha agregado de manera exitosa`, icon: 'success', timer: 2000 });
              this.fnListarNotas();
              this.hasChanges = true;
            }
          }, (error) => { this.spinner.hide(); console.log(error) })
        }
      });
    });
  }

  fnCheckChanges(): void { this.dialogRef.close(this.hasChanges) }
}
