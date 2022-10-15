import { AfterContentChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ISelectItem, Question, SecurityErp } from 'src/app/modulos/AAHelpers';
import Swal from 'sweetalert2';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { DevengueQuery, EDevengue, IPersonalDto, PeriodoDev } from '../../../../Model/lcalculop-devengue';
import { CalculopDevengueService } from '../../../../Services/calculop-devengue.service';

@Component({
  templateUrl: './calculop-devengue.component.html',
  styleUrls: ['./calculop-devengue.component.css', "./calculop-devengue.component.scss"],
  animations: [adminpAnimations],
})
export class CalculopDevengueComponent implements OnInit, AfterContentChecked {
  @ViewChild('input') sNombre: ElementRef;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataSource: MatTableDataSource<IPersonalDto>;
  personas: IPersonalDto[];
  planillas: ISelectItem[];
  remuTipos: ISelectItem[];
  regPensiones: ISelectItem[];
  sucursales: ISelectItem[];
  displayedColumns: string[];
  detailColumns: string[];
  form: FormGroup;
  storageData: SecurityErp = new SecurityErp();
  optionsSwal = new Map();
  expandedMore = null;
  sPeriodo: string;
  isInactive: boolean = true;
  nIdDevengue: number;

  /* #region  fab container */
  tsNew: string = 'inactive';
  fbNew = [
    { icon: 'calendar_today', tool: 'Cambiar Devengue', disable: false },
    { icon: 'lock', tool: 'Cerrar Devengue', disable: this.isInactive }
  ];
  abNew = [];
  /* #endregion */

  /* #region   Asignación nombres de campos y columnas*/
  cols: any[] = [
    { header: 'Opción', field: 'accion', type: 'accion', width: '70', align: 'center', hide: false },
    { header: 'Nombres y Apellidos', field: 'sNombre', type: 'font', width: '300', align: 'left', hide: true },
    { header: 'Documento', field: 'sDocumento', type: 'font', width: '80', align: 'center', hide: true },
    { header: 'Planilla', field: 'nIdPlanilla', type: null, width: '50', align: 'center', hide: true },
    { header: 'Régimen Pensionario', field: 'sRegPension', type: null, width: '120', align: 'left', hide: true },
    { header: 'Remuneración', field: 'sTipoRemu', type: null, width: '100', align: 'left', hide: true },
    { header: 'Sucursal', field: 'sSucursal', type: null, width: '100', align: 'left', hide: true },
    { header: 'Total Ingreso', field: 'nTotalIngreso', type: 'deci2', width: '70', align: 'right', hide: false },
    { header: 'Total Descuento', field: 'nTotalDescuento', type: 'deci2', width: '70', align: 'right', hide: false },
    { header: 'Total Neto', field: 'nTotalNeto', type: 'deci2', width: '70', align: 'right', hide: false },
    { header: '', field: 'dropdown', type: 'dropdown', width: '50', align: 'right', hide: false },
  ];

  colsDetail: any[] = [
    { header: '', field: 'sConcepto', type: null, width: '400', align: 'left' },
    { header: '', field: 'nUnidad', type: null, width: '100', align: 'right' },
    { header: '', field: 'nImporte', type: 'deci2', width: '100', align: 'right' }
  ];
  /* #endregion */

  constructor(
    private fb: FormBuilder,
    private calculopDevengueService: CalculopDevengueService,
    private spinner: NgxSpinnerService,
    private activeModal: NgbActiveModal,
    private cdref: ChangeDetectorRef
  ) {
    this.displayedColumns = this.cols.map(col => col.field);
    this.detailColumns = this.colsDetail.map(col => col.field);
  }

  ngOnInit(): void {
    this.initForm();
    this.onToggleFab(1, 1);
    this.loadCombos();
    this.loadPeriodos();
    this.changeForm();
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  /* #region  Inicialización del form */
  initForm(): void {
    this.form = this.fb.group({
      nIdPlla: [''],
      nIdRemu: [''],
      nIdRegPen: [''],
      nIdSuc: ['']
    });
  }
  /* #endregion */

  get hideMessageEmpty(): boolean { return this.dataSource && this.dataSource.filteredData.length > 0 }

  /* #region  Subcripsción de cambios en los valores del form */
  changeForm(): void {
    this.form.valueChanges
      .subscribe((filter: DevengueQuery) => {
        const lstFiltered = this.personas.filter(item => {
          const f1 = !filter.nIdPlla || item.nIdPlanilla === filter.nIdPlla;
          const f2 = !filter.nIdRemu || item.nIdTipoRemu === filter.nIdRemu;
          const f3 = !filter.nIdRegPen || item.nRegimen === filter.nIdRegPen;
          const f4 = !filter.nIdSuc || item.nIdSucursal === filter.nIdSuc;
          return f1 && f2 && f3 && f4;
        });
        this.dataSource = new MatTableDataSource<IPersonalDto>(lstFiltered);
        this.applyFilter(this.sNombre.nativeElement.value);
      })
  }
  /* #endregion */

  /* #region  ToogleButton */
  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = stat === -1 ? (this.abNew.length > 0 ? 0 : 1) : stat;
        this.tsNew = stat === 0 ? "inactive" : "active";
        this.abNew = stat === 0 ? [] : this.fbNew;
        break;
    }
  }
  /* #endregion */

  /* #region  Método de filtración del nombre o documento */
  applyFilter(filterValue: string) { this.dataSource.filter = filterValue.trim().toLowerCase() }
  /* #endregion */

  /* #region  Método de limpieza del auto filtrado */
  fnClean(): void { this.dataSource.filter = ''; this.sNombre.nativeElement.value = ''; }
  /* #endregion */

  /* #region  Carga de filtros en combo */
  async loadCombos() {
    this.spinner.show('spi_new');
    const sIdPais = this.storageData.getPais();
    const nIdEmpresa = Number(this.storageData.getEmpresa());
    await this.calculopDevengueService.getAllItems(EDevengue.PLANILLA, nIdEmpresa, sIdPais).then(
      res => { this.planillas = res.data });
    await this.calculopDevengueService.getAllItems(EDevengue.REMUNERACION_TIPO, nIdEmpresa, sIdPais).then(
      res => { this.remuTipos = res.data });
    await this.calculopDevengueService.getAllItems(EDevengue.REGIMEN_PENSIONARIO, nIdEmpresa, sIdPais).then(
      res => { this.regPensiones = res.data });
    await this.calculopDevengueService.getAllItems(EDevengue.SUCURSAL, nIdEmpresa, sIdPais).then(
      res => { this.sucursales = res.data });
  }
  /* #endregion */

  /* #region  Eventos de botones en fab */
  clickFab(index: number) {
    switch (index) {
      case 0: this.changeDate()//Cambiar fecha de devengue
        break;
      case 1: this.closeAccrue()// Cerrar devengue
        break;
      default: this.activeModal.dismiss()//Cancelar
    }
  }
  /* #endregion */

  /* #region  Listar personal */
  loadPersonal(nIdDevengue: number): void {
    this.spinner.show('spi_new');
    this.calculopDevengueService.getAllSearch(nIdDevengue).then(
      res => {
        this.personas = res ? res.data : [];
        this.dataSource = new MatTableDataSource<IPersonalDto>(this.personas);
        this.dataSource.paginator = this.paginator;
        this.loadFilters();
      }).finally(() => { this.spinner.hide('spi_new') });
  }
  /* #endregion */

  /* #region  método que retorna un total depende del campo para el footer */
  sumTotal(field: string): string {
    if (this.dataSource) {
      switch (field) {
        case 'nTotalIngreso':
          return this.dataSource.filteredData.map(t => t.nTotalIngreso).reduce((acc, value) => acc + value, 0).toFixed(2);
        case 'nTotalDescuento':
          return this.dataSource.filteredData.map(t => t.nTotalDescuento).reduce((acc, value) => acc + value, 0).toFixed(2);
        case 'nTotalNeto':
          return this.dataSource.filteredData.map(t => t.nTotalNeto).reduce((acc, value) => acc + value, 0).toFixed(2);
      }
    }
  }
  /* #endregion */

  /* #region  Designación de predicados para el filtro */
  loadFilters(): void {
    this.dataSource.filterPredicate = (data, filter) => {
      return !filter || data.sNombre.toLowerCase().includes(filter) || data.sDocumento.includes(filter);
    };
  }
  /* #endregion */

  /* #region  Listar periodos activos */
  async loadPeriodos() {
    this.spinner.show('spi_new');
    const nIdEmpresa = Number(this.storageData.getEmpresa());
    await this.calculopDevengueService.getAllPeriodos(nIdEmpresa).then(
      res => {
        this.sPeriodo = res ? `${res.data.sMes} del ${res.data.nAnio}` : this.sPeriodo;
        this.loadPersonal(res.data.nIdDevengue);
        const lst = res ? res.data.periodos : [];
        this.buildOptionsSwal(lst);
      }).finally(() => { this.spinner.hide('spi_new') });
  }
  /* #endregion */

  /* #region  Método de expandir detalle */
  clickExpanded(row: IPersonalDto): void { this.expandedMore = this.expandedMore == row ? null : row }
  /* #endregion */

  /* #region  Selección de fecha de devengue */
  changeDate(): void {
    Swal.fire({
      title: "Seleccionar Devengue",
      icon: "info",
      text: "Al cambiar el devengue se mostrará la información relacionada al mes y año en cuestión.",
      input: "select",
      inputOptions: this.optionsSwal,
      inputPlaceholder: "Seleccionar",
      showCancelButton: true,
      confirmButtonText: "Seleccionar",
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (value === undefined || value === "") {
          return "Selección no válida.";
        }
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const datos = `${result.value}`?.split('|');
        this.sPeriodo = datos ? `${datos[1]} del ${datos[2]}` : this.sPeriodo;
        this.abNew[1].disable = datos[3];
        this.nIdDevengue = Number(datos[0]);
        this.loadPersonal(this.nIdDevengue);
      }
    });
  }
  /* #endregion */

  /* #region  Armado de opciones para el comobo del swal */
  buildOptionsSwal(lst: PeriodoDev[]): void {
    lst.map(periodo => {
      const meses = new Map();
      periodo.detail.map(x => {
        const flag = !(x.nIdEstado == 0 && x.dFechaInicio == null);
        const key = `${x.nIdDevengue}|${x.sMes}|${periodo.nAnio}|${flag}`;
        meses.set(key, x.sMes)
      });
      this.optionsSwal.set(periodo.nAnio, meses);
    });
  }
  /* #endregion */

  /* #region  Método que cierra un devengue activo */
  closeAccrue(): void {
    const pregunta = 'Iniciará el cierre de devengue. ¿Desea Continuar?';
    Swal.fire(new Question(pregunta) as unknown).then((result) => {
      if (result.isConfirmed) {
        const sIdPais = this.storageData.getPais();
        const nIdUsuario = Number(this.storageData.getUsuarioId());
        this.spinner.show('spi_new');
        this.calculopDevengueService.closeAccrue(nIdUsuario, sIdPais, this.nIdDevengue).then(res => {
          if(res){
            this.loadPeriodos();
            this.abNew[1].disable = true;
            Swal.fire({
              icon: 'success', title: 'Correcto', text: 'Transacción exitosa', showConfirmButton: false, timer: 2000
            });
          }else{
            Swal.fire({
              icon: 'error', title: 'Error', text: 'Hubo un error en la transacción', showConfirmButton: false, timer: 2000
            });
          }
        }).finally(() => this.spinner.hide('spi_new'));
      }
    });
  }
  /* #endregion */

  showModal(row: any) { }

  clickPersonal(item: any) { }
}
