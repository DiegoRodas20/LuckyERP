import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { ISelectItem, Question } from '../../../models/constantes';
import { E_Liquidacion_Transporte, E_Liquidacion_Transporte_Prorrateo } from '../../../models/liquidacionTransporte';
import { TransporteService } from '../../../transporte.service';
import { LogDialogValidacionesComponent } from '../log-dialog-validaciones/log-dialog-validaciones.component';

@Component({
  templateUrl: './log-dialog-prorrateo-presupuesto.component.html',
  styleUrls: ['./log-dialog-prorrateo-presupuesto.component.css']
})
export class LogDialogProrrateoPresupuestoComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dsProrrateos: MatTableDataSource<E_Liquidacion_Transporte_Prorrateo>
  displayedColumns: string[];
  form: FormGroup;

  /* #region   Asignación nombres de campos y columnas*/
  cols: any[] = [
    { header: 'Empresa', field: 'sEmpresa', type: null, width: '80', align: 'left' },
    { header: 'Presupuesto', field: 'sCodPresupuesto', type: null, width: '60', align: 'center' },
    { header: 'Descripción', field: 'sPresupuesto', type: null, width: '200', align: 'left' },
    { header: 'Peso', field: 'nPeso', type: 'deci2', width: '50', align: 'left' },
    { header: 'Volumen', field: 'nVolumen', type: 'deci6', width: '70', align: 'left' },
    { header: 'Costo traslado', field: 'nCostoTraslado', type: 'reactivo', width: '70', align: 'right' }
  ];
  /* #endregion */

  constructor(
    private spinner: NgxSpinnerService,
    private transporteService: TransporteService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<LogDialogProrrateoPresupuestoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { list: E_Liquidacion_Transporte_Prorrateo[], nPrecioTotal: number, liquidacion: E_Liquidacion_Transporte, sIdPais: string, sCodTransporte: string }
  ) {
    this.displayedColumns = this.cols.map(({ field }) => field);
    const sumaCostos = this.data.list.reduce((acc, valor) => acc + valor.nCostoTraslado, 0);
    this.form = this.fb.group({
      nPrecioTotal: [this.data.nPrecioTotal],
      calculado: [sumaCostos.toFixed(4)],
      costos: this.fb.array([]),
      auxiliares: this.fb.array([])
    });
  }

  /* #region  Foprm Control y Form Arrays */
  get nCalculadoField(): FormControl { return this.form.get('calculado') as FormControl }
  get prorrateosArray(): FormArray { return this.form.get('costos') as FormArray }
  get auxiliaresArray(): FormArray { return this.form.get('auxiliares') as FormArray }
  /* #endregion */

  indicePaginado(indice: number): number { return indice + 1 + this.paginator.pageIndex * this.paginator.pageSize }

  ngOnInit(): void {
    this.dsProrrateos = new MatTableDataSource<E_Liquidacion_Transporte_Prorrateo>(this.data.list);
    this.dsProrrateos.paginator = this.paginator;
    this.dsProrrateos.sort = this.sort;
    this.buildFormArray(this.data.list);
  }

  /* #region  Método que construye los formArray para su posterior manipulación de datos */
  private buildFormArray(data: E_Liquidacion_Transporte_Prorrateo[]): void {
    data.forEach(item => {
      this.prorrateosArray.push(this.fb.group({
        nIdEmp: item.nIdEmp,
        nIdCentroCosto: item.nIdCentroCosto,
        nIdTipoAuxCC: item.nIdTipoAuxCC,
        nPeso: item.nPeso,
        nVolumen: item.nVolumen,
        nCostoTraslado: [Number(item.nCostoTraslado.toFixed(4)), [Validators.required, Validators.pattern('^[0-9]*(\\.[0-9]{1,4})?$')]]
      }));

      this.auxiliaresArray.push(this.fb.group({
        nIdCentroCosto: item.nIdCentroCosto,
        sEmpresa: item.sEmpresa,
        sCodPresupuesto: item.sCodPresupuesto,
        nCostoTraslado: '',
        nIdTipoCC: item.nIdTipoCC
      }));
    });
  }
  /* #endregion */

  /* #region  Método de filtración del listado */
  applyFilter(filterValue: string) { this.dsProrrateos.filter = filterValue.trim().toLowerCase() }
  /* #endregion */

  /* #region  Método de sumado de los  */
  fnPlusValues(): void {
    const suma = this.prorrateosArray.controls.reduce((acc, control) =>
      acc + (control.invalid ? 0 : Number(control.get('nCosto').value))
      , 0);
    this.nCalculadoField.setValue(suma.toFixed(4));
  }
  /* #endregion */

  /* #region  validación de cada  */
  nCostoError(indice: number): string {
    return this.prorrateosArray.controls.find((item, index) => index === indice).get('nCostoTraslado').hasError('pattern') ? 'Formato Incorrecto' : null;
  }
  /* #endregion */

  /* #region  Método que comienza el proceso de terminar */
  fnTerminar(): void {
    Swal.fire(new Question() as unknown).then((result) => {
      if (result.isConfirmed) {
        const item = this.data.liquidacion;
        const fecha = moment(moment(item.sFecha, 'DD/MM/YYYY').toDate()).format("YYYY-MM-DD");
        const parameters = `${this.data.sIdPais}|${this.data.sCodTransporte}|${fecha}|${item.nIdSucursal}|${item.sSucursal}`;

        const vProrrateos = this.prorrateosArray.value as E_Liquidacion_Transporte_Prorrateo[];

        const concatenados = this.auxiliaresArray.controls.reduce((acc, form: FormGroup, index) => {
          form.get('nCostoTraslado').setValue(vProrrateos[index].nCostoTraslado);
          acc.push(this.fnConcactValues(form)); return acc
        }, []);

        this.fnValidarPresupuestos(parameters, concatenados.join('/'))
      }
    });
  }
  /* #endregion */

  /* #region  Método que valida los presupuestos ingresados */
  fnValidarPresupuestos(parameters: string, parametersDet: string): void {
    this.spinner.show();
    this.transporteService.fnLiquidacionTransporte(1, 2, parameters, 10, parametersDet).subscribe(res => {
      const lst = res ? res.data as ISelectItem[] : [];
      if (lst.length > 0) {
        this.spinner.hide();
        this.dialog.open(LogDialogValidacionesComponent, {
          //disableClose: true, 
          autoFocus: false, width: '700px', height: 'auto', data: { 'validaciones': lst }
        });
        return;
      }
      this.fnSendValues();
    });
  }
  /* #endregion */

  /* #region  Método que concatena las filas concatenadas con '/' y envía para su registro */
  fnSendValues(): void {
    const concatenados = this.prorrateosArray.controls.reduce((acc, form: FormGroup) => {
      acc.push(this.fnConcactValues(form)); return acc
    }, []);
    this.dialogRef.close(concatenados.join('/'));
  }
  /* #endregion */

  /* #region  Método que concatena los valores de cada fila con '|' */
  fnConcactValues(form: FormGroup): string {
    const values = Object.values(form.controls).reduce((acc, control: FormControl) => {
      acc.push(control.value); return acc
    }, []);
    return values.join('|');
  }
  /* #endregion */
}
