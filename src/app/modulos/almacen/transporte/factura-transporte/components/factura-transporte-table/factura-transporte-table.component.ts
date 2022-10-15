import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { E_Factura_Transporte } from '../../../models/facturaTransporte';

@Component({
  selector: 'app-factura-transporte-table',
  templateUrl: './factura-transporte-table.component.html',
  styleUrls: ['./factura-transporte-table.component.css']
})
export class FacturaTransporteTableComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @Input() operaciones: E_Factura_Transporte[];
  form: FormGroup;
  dataSource: MatTableDataSource<E_Factura_Transporte>;
  displayedColumns: string[] = [];
  isDistribucion: boolean = true;
  maxCodTransporte: number = 7;
  sumaPrecio: number = 0;

  /* #region   Asignación nombres de campos y columnas*/
  cols: any[] = [
    { header: 'Fecha Traslado', field: 'sFechaTranslado', type: 'none' },
    { header: 'Transporte', field: 'sCodTransporte', type: 'none' },
    { header: 'Presupuesto', field: 'sPresupuesto', type: 'none' },
    { header: 'Tipo Envío', field: 'sTipoEnvio', type: 'none' },
    { header: 'Guía Remisión', field: 'sGuia', type: 'none' },
    { header: 'Destino', field: 'sDestino', type: 'none' },
    { header: 'Peso Total', field: 'nPeso', type: 'decimal2' },
    { header: 'Volumen Total', field: 'nVolumen', type: 'decimal6' },
    { header: 'Precio', field: 'nPrecio', type: 'decimal2' },
    //{ header: 'Nro. Factura', field: 'sFactura', type: 'none' },
  ];
  /* #endregion */

  constructor(
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      txtFiltro: [''],
      txtCodTransporte: ['', [Validators.minLength(7), Validators.pattern('^\\d+$')]],
      txtSumaPrecio: [0],
      txtCodConcatenado: [''],
      concatIdOperMov: [''],
      operaciones: this.fb.array([])
    });
    this.displayedColumns.push('accion');
    this.cols.forEach(res => {
      this.displayedColumns.push(res.field);
    })
  }

  ngOnInit(): void {
    /* #region  Personalización de la paginación*/
    this.paginator._intl.itemsPerPageLabel = 'Registros por página';
    this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      return `${page * pageSize + 1} - ${(page + 1) * pageSize} de ${length}`;
    };
    /* #endregion */
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.operaciones && this.operaciones) {
      this.form.reset();
      this.form.controls.operaciones = this.fb.array([]);
      this.txtSumaPrecioField.setValue(0);
      this.buildFormArray(this.operaciones);
      this.dataSource = new MatTableDataSource<E_Factura_Transporte>(this.operaciones);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  /* #region  FormControls */
  get txtFiltroField(): FormControl { return this.form.get('txtFiltro') as FormControl; }
  get txtCodTransporteField(): FormControl { return this.form.get('txtCodTransporte') as FormControl; }
  get txtSumaPrecioField(): FormControl { return this.form.get('txtSumaPrecio') as FormControl; }
  get txtCodConcatenadoField(): FormControl { return this.form.get('txtCodConcatenado') as FormControl; }
  get concatIdOperMovField(): FormControl { return this.form.get('concatIdOperMov') as FormControl; }
  get operacionesArray(): FormArray { return this.form.get('operaciones') as FormArray; }
  /* #endregion */

  getIndex(index: number) {
    return index + this.paginator.pageSize * this.paginator.pageIndex;
  }

  hideColumn(): void {
    this.displayedColumns.splice(2, 1);
  }

  addColumn(): void {
    this.displayedColumns.splice(2, 0, 'sCodTransporte');
  }

  fnSelect(): void {
    this.fnCalculateFields();
  }

  fnSelectMultiple(): void {
    if (this.txtCodTransporteField.invalid) {
      return this.txtCodTransporteField.markAllAsTouched();
    }
    const array = this.form.get('operaciones') as FormArray;
    let encontro = false; //Si encuentra al menos uno limpiamos el input
    array.controls.forEach((form: FormGroup) => {
      const item = form.value as E_Factura_Transporte;
      if (item.sCodTransporte == this.txtCodTransporteField.value) {
        form.get('isCheck').setValue(true);
        encontro = true;
      }
    });

    if (encontro) {
      this.txtCodTransporteField.setValue('');
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'No se encontro ningun registro con el codigo transporte indicado',
        showConfirmButton: false,
        timer: 1500
      });
    }
    this.fnCalculateFields();
  }

  private buildFormArray(data: E_Factura_Transporte[]): void {
    const array = this.form.get('operaciones') as FormArray;
    data.forEach(item => {
      array.push(this.fb.group({
        isCheck: [false],
        nIdOperMov: item.nIdOperMov,
        sCodTransporte: item.sCodTransporte,
        nPrecio: item.nPrecio
      }));
    });
  }

  get txtCodTransporteError(): string {
    return this.txtCodTransporteField.hasError('pattern') ? 'Solo números' :
      this.txtCodTransporteField.hasError('minlength') ? '7 dígitos requeridos' : null;
  }

  fnCalculateFields() {
    let suma = 0;
    let concatOperMov = '';
    let listAux: string[] = [];

    this.txtCodConcatenadoField.setValue('');
    this.operacionesArray.controls.forEach((form: FormGroup) => {
      const item = form.value as E_Factura_Transporte;
      if (Boolean(item.isCheck)) {
        suma += Number(item.nPrecio);
        concatOperMov += `${item.nIdOperMov}|`
        const codigo = listAux.find(x => x == item.sCodTransporte);
        if (!codigo) {
          listAux.push(item.sCodTransporte);
        }
      }
    });
    this.form.patchValue({
      txtSumaPrecio: suma.toFixed(2),
      txtCodConcatenado: listAux.join(", ")?.trim(),
      concatIdOperMov: concatOperMov.substring(0, concatOperMov.length - 1),
    })
    this.sumaPrecio = Number(suma.toFixed(2));
  }

  /* #region  Método de filtración del listado */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  /* #endregion */

  /* #region  Método de limpieza del auto filtrado */
  fnClean(): void {
    if (this.dataSource) {
      this.dataSource.filter = '';
    }
    this.txtFiltroField.setValue('');
  }
  /* #endregion */

  /* #region  Método de limpieza del filtro de código de transporte */
  fnCleanCodTransporte(): void {
    this.txtCodTransporteField.setValue('');
  }
  /* #endregion */
}
