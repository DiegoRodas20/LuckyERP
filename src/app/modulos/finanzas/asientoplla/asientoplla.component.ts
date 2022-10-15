import { Component, OnInit, ViewChild, Type } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { AsientopllaService } from '../services/asientoplla.service';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { IDetail, IDevengue, IList } from '../Model/Iasientoplla';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { DateAdapter } from 'angular-calendar';
import Swal from 'sweetalert2';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AsientoPllaAnimations } from '../Animations/adminp.animations';
import { ModalAsientopllaComponent } from '../Modals/modalAsientoplla/modalAsientoplla.component';
import { ModalMantenimientosComponent } from '../Modals/modalMantenimientos/modalMantenimientos.component';

// Modals
const MODALS: { [name: string]: Type<any> } = {
  asientoplla: ModalAsientopllaComponent,
  mantenimiento: ModalMantenimientosComponent
};

const moment = _rollupMoment || _moment;
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
  selector: 'app-asientoplla',
  templateUrl: './asientoplla.component.html',
  styleUrls: ['./asientoplla.component.css', './asientoplla.component.scss'],
  providers: [AsientopllaService,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  animations: [AsientoPllaAnimations]
})
export class AsientopllaComponent implements OnInit {

  // FormGroup
  fgMain: FormGroup;

  // Fab
  // boton flotante de opciones de la pantalla principal
  fbMain = [
    { icon: 'settings', tool: 'Asientos', disable: false },
    { icon: 'list_alt', tool: 'Mantenimiento', disable: false },
    { icon: 'cloud_download', tool: 'Descargar Excel', disable: false }
  ];
  abMain = [];
  tsMain = 'inactive';

  // Progress Bar
  pbMain: boolean;

  // Combobox
  cboPlanilla = new Array();
  cboTipos = new Array();
  cboCentroCostos = new Array();

  // Modal
  aItem: any;

  // PRINCIPAL
  MainDC: string[] = ['fecha', 'planilla', 'glosa', 'totalHaber', 'totalDebe', 'more'];
  MainDS: MatTableDataSource<IList> = new MatTableDataSource([]);
  @ViewChild('pagMain', { static: true }) pagMain: MatPaginator;

  // DETALLE
  ExpandedDC: string[] = ['centroCosto', 'cuentaContable', 'importe'];
  ExpandedDS: MatTableDataSource<IDetail> = new MatTableDataSource([]);
  @ViewChild('pagExpanded', { static: false }) pagExpanded: MatPaginator;
  @ViewChild('mtExpanded', { static: false }) mtExpanded: MatTable<IDetail>;
  aDetail: Array<IDetail>;

  expandedMore: IList;

  NgbModalOptions: NgbModalOptions = {
    size: 'lg',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };

  private _data: IDevengue[] = [];
  codDevengue: any;
  meses = {
    1: "Enero",
    2: "Febrero",
    3: "Marzo",
    4: "Abril",
    5: "Mayo",
    6: "Junio",
    7: "Julio",
    8: "Agosto",
    9: "Septiembre",
    10: "Octubre",
    11: "Noviembre",
    12: "Diciembre",
  };

  constructor(
    public service: AsientopllaService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private _modalService: NgbModal
  ) {
    this.new_fgMain();
  }

  new_fgMain() {
    this.fgMain = this.fb.group({
      fecha: null,
      planilla: '',
      cuentaContable: '',
      sTipo: '',
      centroCosto: [{ value: '', disabled: true }],
    });

    this.fgMain.valueChanges.subscribe(value => {
      value.planilla === undefined ? value.planilla = '' : value.planilla;
      const filter = { ...value, name: value.planilla.trim().toLowerCase() } as string;
      this.MainDS.filter = filter;

      if (this.MainDS.paginator) {
        this.MainDS.paginator.firstPage();
      }

      this.expandedMore = null;
      this.abMain = this.abMain.map((x, index) => index != 2 ? x : { ...x, disable: !this.hasData });
    });

  }

  get getMain() { return this.fgMain.controls; }
  get hasData(): boolean { return this.MainDS && this.MainDS.filteredData.length > 0 }

  async ngOnInit(): Promise<void> {
    this.spinner.show('spi_main');
    await this.cboGetPlanilla();
    await this.cboGetTipos();
    await this.loadMain();
    this.spinner.hide('spi_main');
  }

  onToggleFab(fab: number, stat: number) {

    switch (fab) {
      case 1:
        stat = (stat === -1) ? (this.abMain.length > 0) ? 0 : 1 : stat;
        this.tsMain = (stat === 0) ? 'inactive' : 'active';
        this.abMain = (stat === 0) ? [] : this.fbMain;
        break;
    }
  }

  async clickFab(opc: number, index: number) {

    switch (index) {
      case 0:
        await this.cargarDevengue();
        this._mostrarDevenguesFb();
        break;
      case 1:
        this.openModal('mantenimiento');
        break;
      case 2:
        this.descargarExcel();
        break;
    }
  }



  openModal(name: string) {

    const modalRef = this._modalService.open(MODALS[name], this.NgbModalOptions);
    const obj = new Object();

    switch (name) {
      case 'asientoplla':
        obj['codDevengue'] = this.codDevengue;
        modalRef.componentInstance.fromParent = obj;
        break;
      case 'mantenimiento':
        obj['aItem'] = this.aItem;
        modalRef.componentInstance.fromParent = obj;
        break;
    }

    modalRef.result.then(async (result) => {

      switch (result.modal) {
        case 'asientoplla':
          if (result.value === 'loadAgain') {

            this.spinner.show('spi_main');
            await this.loadMain();
            this.spinner.hide('spi_main');

          }
          break;
        case 'mantenimiento':
          if (result.value === 'loadAgain') {

            this.spinner.show('spi_main');
            await this.loadMain();
            this.spinner.hide('spi_main');

          }
          break;
      }

    }, (reason) => { });

  }

  async cboGetPlanilla() {
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    await this.service.cargarPlanilla(nIdEmp).then((value: any) => {
      if (value.success === true) {
        this.cboPlanilla = value.response.data;
      } else {
        Swal.fire('', value.errors[0].message);
        this.spinner.hide('spi_main');
      }
    });
  }

  async cboGetTipos() {
    await this.service.cargarTipos().then((value: any) => {
      if (value.success === true) {
        this.cboTipos = value.response.data;
      } else {
        Swal.fire('', value.errors[0].message);
        this.spinner.hide('spi_main');
      }
    });
  }

  async cboGetCentroCosto(codigo: number) {
    if (codigo !== undefined) {
      await this.service.obtenerCentroCostos(codigo).then((value: any) => {
        if (value.success === true) {
          this.fgMain.controls['centroCosto'].enable();
          this.fgMain.controls['centroCosto'].setValue('');
          this.cboCentroCostos = value.response.data;
        } else {
          this.fgMain.controls['centroCosto'].disable();
          Swal.fire('', value.errors[0].message);
          this.spinner.hide('spi_main');
        }
      });
    } else {
      this.cboCentroCostos = [{ value: '', disabled: true }];
      this.fgMain.controls['centroCosto'].setValue('');
      this.fgMain.controls['centroCosto'].disable();
    }
  }

  async loadMain() {

    let nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
    await this.service.cargarTblAsientos(nIdEmp).then((value: any[]) => {

      Object.values(value).forEach((lista: any, iLista: number) => {
        switch (iLista) {
          // Lista Main
          case 1:
            const aMain = lista.data as Array<IList>;
            this.MainDS = new MatTableDataSource<IList>(aMain);
            this.MainDS.paginator = this.pagMain;

            this.MainDS.filterPredicate = function (data: IList, filter: string): boolean {
              return data.planilla.trim().toLowerCase().includes(filter);
            };

            this.MainDS.filterPredicate = ((data: IList, filter: any) => {
              let currentDate = moment(data.fecha).format('YYYYMM');
              const a = !filter.fecha || (currentDate === moment(filter.fecha).format('YYYYMM'));
              const b = !filter.planilla || data.planilla === filter.planilla;
              const e = this.cantPerso(data.codigo) > 0;
              return a && b && e;
            }) as (PeriodicElement, string) => boolean;

            // Lista Expanded
            this.aDetail = lista.detail as Array<IDetail>;
            break;
        }
      });
    });
  }


  cantPerso(idPlanilla: any) {

    const sText = this.fgMain.controls['cuentaContable'].value as string;
    const sText2 = this.fgMain.controls['centroCosto'].value as string;
    let detail: IDetail[] = [];

    Object.values(this.aDetail).forEach((element: any) => {
      if (element.codigo === idPlanilla) {
        detail.push(element);
      }
    });

    const aFilter = detail.filter((x: any) => {
      const b = !sText || x.cuentaContable.toLowerCase().includes(sText.toLowerCase());
      const c = !sText2 || x.centroCosto.toLowerCase().includes(sText2.toLowerCase());
      return b & c;
    });

    return aFilter.length;
  }

  async clickExpanded(row: IList) {
    if (this.expandedMore === row) {
      // Limpiar
      this.expandedMore = null;
      this.ExpandedDS = new MatTableDataSource([]);

      if (this.ExpandedDS.paginator) {
        this.ExpandedDS.paginator.firstPage();
      }

    } else {

      let aFilter: IDetail[] = [];

      Object.values(this.aDetail).forEach((element: any) => {
        if (element.codigo === row.codigo) {
          aFilter.push(element);
        }
      });

      if (this.fgMain.controls['cuentaContable'].value !== '') {
        let sFilter = this.fgMain.controls['cuentaContable'].value as string;
        sFilter = sFilter.trim().toLowerCase();
        aFilter = this.aDetail.filter(x => {
          return x.cuentaContable.trim().toLowerCase().includes(sFilter);
        });
      }

      if (this.fgMain.controls['centroCosto'].value !== '') {
        let sFilter = this.fgMain.controls['centroCosto'].value as string;
        sFilter = sFilter.trim().toLowerCase();
        aFilter = this.aDetail.filter(x => {
          return x.centroCosto.trim().toLowerCase().includes(sFilter);
        });
      }

      this.ExpandedDS = new MatTableDataSource<IDetail>(aFilter);
      this.ExpandedDS.paginator = null;
      // this.ExpandedDS.paginator = this.pagExpanded;

      this.expandedMore = row;
      this.mtExpanded.renderRows();
    }
  }

  //#region Extra

  chosenYearHandler(normalizedYear: Moment) {
    let ctrlValue = this.fgMain.controls['fecha'].value;
    ctrlValue = (ctrlValue === null) ? moment() : ctrlValue;
    ctrlValue.year(normalizedYear.year());
    this.fgMain.controls['fecha'].setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    let ctrlValue = this.fgMain.controls['fecha'].value;
    ctrlValue = (ctrlValue === null) ? moment() : ctrlValue;
    ctrlValue.month(normalizedMonth.month());
    this.fgMain.controls['fecha'].setValue(ctrlValue);
    datepicker.close();
  }

  private _mostrarDevenguesFb() {
    Swal.fire({
      title: "Seleccionar Devengue",
      icon: "info",
      text: "Al cambiar el devengue se mostrará la información relacionada al mes y año en cuestión.",
      input: "select",
      inputOptions: this.opcionSwalDevengue(),
      inputPlaceholder: "Seleccionar",
      showCancelButton: true,
      confirmButtonText: "Seleccionar",
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (value === undefined || value === "") {
          return "Selección no válida.";
        }
      },
    }).then(async (resultado) => {
      if (resultado.isConfirmed) {
        this.codDevengue = resultado.value
        this.openModal('asientoplla');
      }
    });
  }

  public opcionSwalDevengue(): Map<number, any> {
    const map = new Map<number, any>();
    var key = "";
    var listaEjercicios = this._obtenerLosEjerciciosDevengue();

    listaEjercicios.forEach((ejercicio) => {
      var item = new Map();

      this._data.forEach((v) => {
        if (v.nEjercicio === ejercicio) {
          key =
            v.nIdDevengue +
            "|" +
            moment(new Date(v.nEjercicio, v.nMes - 1, 1)).format("MM/DD/YYYY");
          item.set(key, this.meses[v.nMes]);
        }
      });
      map.set(ejercicio, item);
    });
    return map;
  }

  private _obtenerLosEjerciciosDevengue(): number[] {
    var ejercicios: number[] = this._data.map((v) => v.nEjercicio);
    ejercicios = ejercicios.filter(function (value, index) {
      return ejercicios.indexOf(value) == index;
    });
    ejercicios = ejercicios.sort((a, b) => b - a);
    return ejercicios;
  }

  async cargarDevengue() {
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    await this.service.cargarDevengue(nIdEmp).then((value: any) => {
      if (value.success === true) {
        this._data = value.response.data;
      } else {
        Swal.fire('', value.errors[0].message);
        this.spinner.hide('spi_main');
      }
    });
  }

  descargarExcel() {
    let form = this.fgMain.value
    const fecha = form.fecha;
    const sCodPlla = this.cboPlanilla.find(item => item.descripcion == form.planilla)?.numero;
    const nIdCentroCosto = this.cboCentroCostos.find(item => item.descripcion == form.centroCosto)?.codigo;
    const nIdEmpresa = JSON.parse(localStorage.getItem('Empresa'));
    this.spinner.show()
    this.service.GetFileXlsx(fecha, sCodPlla, form.cuentaContable, nIdCentroCosto, nIdEmpresa).subscribe(
      res => {
        this.downloadFile(res)
      },
      () => { this.spinner.hide() }
    );
  }

  downloadFile(response: any) {
    const nIdEmpresa = JSON.parse(localStorage.getItem('Empresa'));
    const listaEmpresa = localStorage.getItem("ListaEmpresa");
    const empresa = JSON.parse(listaEmpresa).find(item => item.nIdEmp == nIdEmpresa);
    const name = `ERP-AsientoPlanilla-${empresa.sDespEmp}`;
    var blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, name + '.xlsx')
    this.spinner.hide();
  }
}
