import { Component, OnInit, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { CalculopService } from '../../Services/calculop.service';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { nsCalculop } from '../../Model/Icalculop';
import { adminpAnimations } from '../../Animations/adminp.animations';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { CalculopDevengueComponent } from './Modals/calculop-devengue/calculop-devengue.component';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { MatSelectionList } from '@angular/material/list';
import { NgSelectComponent } from '@ng-select/ng-select';
import { CalculopResultComponent } from './Modals/calculop-result/calculop-result.component';
import { CalculopDepositComponent } from './Modals/calculop-deposit/calculop-deposit.component';

// Modals
const MODALS: { [name: string]: Type<any> } = {
  result: CalculopResultComponent,
  deposit: CalculopDepositComponent,
  devengue: CalculopDevengueComponent
};

// Utilizar javascript [1]
declare var jQuery: any;

@Component({
  selector: 'app-calculop',
  templateUrl: './calculop.component.html',
  styleUrls: ['./calculop.component.css', './calculop.component.scss'],
  providers: [CalculopService],
  animations: [adminpAnimations]
})
export class CalculopComponent implements OnInit {

  //#region Variables

  // Service GET && POST
  url: string;
  aParam = [];

  // Fab
  fbMain = [
    { icon: 'calendar_today', tool: 'Cambiar devengue', badge: 0, dis: false },
    { icon: 'inventory_2', tool: 'Cierre de nómina', badge: 0, dis: false },
    { icon: 'person', tool: 'Cambios pendientes', badge: 0, dis: true}
  ];
  abMain = [];
  tsMain = 'inactive';

  fbPer = [
    {icon: 'calculate', tool: 'Calcular'},
    {icon: 'list', tool: 'Resultado'},
    {icon: 'payments', tool: 'Depósito'},
  ];
  abPer = this.fbPer;
  tsPer = 'active';

  // Animaciones Tada
  tadaMain = 'inactive';
  nIdPeriodo: number = null;

  // Progress Bar
  pbMain: boolean;

  // Array
  aPeriodos = new Array();
  @ViewChild('mslPeriodos', { static: true }) mslPeriodos: MatSelectionList;
  aMain: nsCalculop.IMain[] = [];
  aConceptos = new Array();
  @ViewChild('ngsConceptos', { static: true }) ngsConceptos: NgSelectComponent;
  aDetail: nsCalculop.IDetail[] = [];
  aParameter = new Array();
  aDevengue = new Array();

  // Combobox
  cboPlanilla = new Array();
  cboCiudad = new Array();
  cboRegPen = new Array();
  cboTipoSalario = new Array();
  cboPeriodo = new Array();

  // Mat Table
  MainDC: string[] = ['action', 'sNombres', 'sCodPlla', 'sDocumento', 'dFechIni', 'dFechFin', 'nIngreso', 'nDescuento', 'nTotal', 'more'];
  MainDS: MatTableDataSource<nsCalculop.IMain> = new MatTableDataSource([]);
  @ViewChild('pagMain', { static: true }) pagMain: MatPaginator;
  @ViewChild('mtMain', { static: true }) mtMain: MatTable<any>;
  expandedMore = null;

  ExpandedDC: string[] = ['sConcepto', 'nUnidad', 'nImporte'];
  ExpandedDS: MatTableDataSource<nsCalculop.IExpanded> = new MatTableDataSource([]);
  @ViewChild('mtExpanded', { static: false }) mtExpanded: MatTable<any>;

  DetaiDC: string[] = ['sCodConcepto', 'sConcepto', 'nUnidad', 'nImporte'];
  DetailDS: MatTableDataSource<nsCalculop.IDetail> = new MatTableDataSource([]);

  // FormGroup
  fgFilter: FormGroup;
  bTrue = true;
  bFalse = false;

  // FormControl
  fcToogle = new FormControl(false);

  // Devengue
  nIdDevengue: number;
  dFechDevengue: Date = null;
  sHeaderNomina = '';

  // Modal Config
  ngbModalOptions: NgbModalOptions = {
    size: 'xl',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };

  // Objeto
  objParameter = new Object();

  //#endregion

  constructor(
    public service: CalculopService,
    private fb: FormBuilder,
    private spi: NgxSpinnerService,
    private _snackBar: MatSnackBar,
    private _modalService: NgbModal) {

    this.new_fgFilter();
  }

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_main');

    await this.fnGetAccrue();
    await this.fnGetPlanilla();
    await this.fnGetCiudad();
    await this.fnGetTipoSalario();
    await this.fnGetPeriod();
    await this.fnGetRegPen();

    if (this.dFechDevengue !== null) {
      await this.fnGetDetail();
      await this.fnGetMain();
    }

    this.spi.hide('spi_main');
    this.animate();
  }

  //#region FormGroup

  new_fgFilter() {
    this.fgFilter = this.fb.group({
      sNombres: '',
      nIdPlla: 0,
      nIdCiudad: 0,
      nIdRegPen: 0,
      nIdTipoSalario: 0,
      bCalculo: null,
      bConcepto: [{ value: null, disabled: true }]
    });

    this.fgFilter.valueChanges.subscribe(value => {
      const filter = { ...value, name: value.sNombres.trim().toLowerCase() } as string;
      this.MainDS.filter = filter;

      if (this.MainDS.paginator) {
        this.MainDS.paginator.firstPage();
      }
      this.expandedMore = null;
    });

    this.fcToogle.valueChanges.subscribe(value => {
      if ( value === false ) {
        this.fgFilter.controls['bConcepto'].disable();
        this.fgFilter.controls['bConcepto'].setValue(true);
      } else {
        this.fgFilter.controls['bConcepto'].enable();
      }
    });

  }

  get getFilter() { return this.fgFilter.controls; }
  get getToogle() { return this.fcToogle.value; }

  //#endregion

  //#region List

  onSelection(e: any, v: any[]) {

    const lPeriodos = [];
    v.forEach(element => {
      lPeriodos.push({
        nIdPeriodo: element.value
      });
    });

    let nPeriodo: number;
    let optPeriodo = 0;
    this.aPeriodos.forEach(element => {
      const nIdPeriodo = element.nIdPeriodo;
      const bCheck = element.bCheck;
      const bFound = lPeriodos.some( x => x.nIdPeriodo === nIdPeriodo );
      const bIntegrado = element.bIntegrado;

      if (bFound) {
        if (bCheck !== bFound) {
          optPeriodo = ( bIntegrado ) ? 1 : 2;
          nPeriodo = nIdPeriodo;
        }
      }

      element.bCheck = bFound;
    });

    switch (optPeriodo) {
      case 1:
        this.mslPeriodos.options.forEach(x => {
          const nItem = x.value;
          const iItem = this.aPeriodos.findIndex(y => y.nIdPeriodo === nItem);
          const bIntegrado = this.aPeriodos[iItem].bIntegrado;
          if ( bIntegrado === false) {
            x.selected = false;
            this.aPeriodos[iItem].bCheck = false;
          }
        });
        break;

      case 2:
        this.mslPeriodos.deselectAll();
        this.aPeriodos.forEach(x => x.bCheck = false);
        let iPeriodo = this.mslPeriodos.options.toArray().findIndex( x => x.value === nPeriodo);
        this.mslPeriodos.options.toArray()[iPeriodo].selected = true;
        iPeriodo = this.aPeriodos.findIndex(x => x.nIdPeriodo === nPeriodo);
        this.aPeriodos[iPeriodo].bCheck = true;
        break;
    }

    // Limpiamos conceptos seleccionados
    this.ngsConceptos.handleClearClick();

    const aPeriodos = [];
    this.mslPeriodos.selectedOptions.selected.forEach(x => aPeriodos.push(x.value));
    this.calcMain(aPeriodos);
  }

  async clickPeriod(index: number, row: any) {

    this.mslPeriodos.disabled = true;

    const nIdPeriodo = row.nIdPeriodo as number;
    const sPeriodo = row.sDescripcion as string;

    const iOptions: { [inputValue: number]: string; } = {};
    const iOption: {
      nIdPlla: number;
      sPlla: string;
    }[] = [];

    const aResponse = await this.service.GetOptionPeriod(index + 1, nIdPeriodo, this.nIdDevengue) as any;
    let sText = '';
    let sName = '';

    switch (index) {
      // Calcular
      case 0:
        sName = 'result';
        sText = 'Se procederá con el cálculo del periodo ' + sPeriodo + ' según la selección.';
        break;

      // Resultado
      case 1:
        sName = 'result';
        sText = 'Se mostrará el cálculo del periodo ' + sPeriodo + ' según la selección.';
        break;

      // Deposito
      case 2:
        sName = 'deposit';
        sText = 'Se visualizará el depósito del periodo ' + sPeriodo + ' según la selección.';
        break;
    }

    if (aResponse?.status === 200) {

      const aResult = aResponse.body.response.data as [];
      aResult.forEach( (x: any) => {
        iOption.push({
          nIdPlla: x.nIdPlla,
          sPlla: x.sCodPlla + ' - ' + x.sDesc
        });
      });

      $.map(iOption, function (o) {
        iOptions[o.nIdPlla] = o.sPlla;
      });

      if (aResult.length > 0) {

        Swal.fire({
          title: 'Seleccionar Planilla',
          icon: 'info',
          text: sText,
          input: 'select',
          inputOptions: iOptions,
          inputPlaceholder: 'Seleccionar',
          showCancelButton: true,
          confirmButtonText: 'Seleccionar',
          allowOutsideClick: false,
          inputValidator: (value) => {
            if (value === undefined || value === '') {
              return 'Selección no válida.';
            }
          },
        }).then(async (resultado) => {
          if (resultado.isConfirmed) {

            const nIdPlla = Number(resultado.value as string);

            this.objParameter['nIdPlla'] = nIdPlla;
            this.objParameter['nIdPeriodo'] = nIdPeriodo;
            this.objParameter['nIdDevengue'] = this.nIdDevengue;

            // Calcular
            if (index === 0) {
              this.spi.show('spi_main');
              await this.service.GetPeriodCalculate(nIdPlla, nIdPeriodo, this.nIdDevengue).then((response: any) => {
                if (response?.status === 200) {
                  const aCalculate = response.body.response.data as any[];
                  console.log(aCalculate);
                }
              });
              this.spi.hide('spi_main');
            }

            this.openModal(sName);
          }
        });

      } else {

        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });

        Toast.fire({
          icon: 'info',
          title: 'Sin planillas vigentes'
        });

      }

    }

    this.mslPeriodos.disabled = false;

  }

  //#endregion

  //#region Combobox

  async fnGetPlanilla() {
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
    const state = 'true';

    await this.service.GetPlanilla(nIdEmp, state).then((response: any) => {
      if (response.status === 200) {
        this.cboPlanilla = response.body.response.data;
      }
    });
  }

  async fnGetAccrue() {
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    await this.service.GetAccrue(nIdEmp).then((response: any) => {
      if (response.status === 200) {

        const aDevengue = response.body.response.data as any[];
        this.aDevengue = aDevengue;

        if ( aDevengue.length > 0 ) {

          // Almacenando el devengue actual
          const iDevengue = aDevengue.findIndex( x => x.nIdEstado !== 2 );
          this.nIdDevengue = aDevengue[iDevengue].nIdDevengue as number;

          const sEjercicio = (aDevengue[iDevengue].nEjercicio as number).toString();
          let sMes = (aDevengue[iDevengue].nMes as number).toString();
          sMes = (sMes.length === 1) ? '0' + sMes : sMes;

          const sFechDevengeue = '01/' + sMes + '/' + sEjercicio;
          this.dFechDevengue = moment(sFechDevengeue, 'DD/MM/YYYY').toDate();

          moment.locale('es');
          const tDate = moment(this.dFechDevengue).format('MMMM [del] YYYY');
          this.sHeaderNomina = tDate[0].toUpperCase() + tDate.substr(1).toLowerCase();

        } else {
          this._snackBar.open('La empresa no presenta devengue activo.', 'Cerrar', {
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        }

      }
    });
  }

  async fnGetCiudad() {
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    const tableId = 694;
    const state = 'true';

    await this.service.GetElementType(sIdPais, tableId, state).then((response: any) => {
      if (response.status === 200) {
        this.cboCiudad = response.body.response.data;
      }
    });
  }

  async fnGetTipoSalario() {
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    const tableId = 518;
    const state = 'true';

    await this.service.GetElementType(sIdPais, tableId, state).then((response: any) => {
      if (response.status === 200) {
        this.cboTipoSalario = response.body.response.data;
      }
    });
  }

  async fnGetPeriod() {
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));

    await this.service.GetPeriod(sIdPais).then((response: any) => {
      if (response.status === 200) {
        this.cboPeriodo = response.body.response.data;

        this.cboPeriodo.forEach(x => {

          const nMesDevengue = moment(this.dFechDevengue).month();
          let nMes = x.nMes;
          nMes = ( nMes === null ) ? nMesDevengue : nMes;

          if ( nMesDevengue === nMes ) {
            this.aPeriodos.push({
              nIdPeriodo: x.nIdPeriodo,
              sDescripcion: x.sDescripcion,
              bIntegrado: x.bIntegrado,
              bCheck: false,
              bDisabled: true,
              clase: (x.bIntegrado === false) ? 'pIntegrado' : 'pIntegrado_no'
            });
          }

        });

      }
    });
  }

  async fnGetRegPen() {
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    const state = 'true';

    await this.service.GetRegPen(sIdPais, state).then((response: any) => {
      if (response.status === 200) {
        this.cboRegPen = response.body.response.data;
      }
    });
  }

  //#endregion

  //#region General

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = (stat === -1) ? (this.abMain.length > 0) ? 0 : 1 : stat;
        this.tsMain = (stat === 0) ? 'inactive' : 'active';
        this.abMain = (stat === 0) ? [] : this.fbMain;
        break;
    }
  }

  clickMain(index: number) {
    switch (index) {
      // Calcular
      case 0:
        Swal.fire({
          title: 'Seleccionar Devengue',
          icon: 'info',
          text: 'Al cambiar el devengue se mostrará la información relacionada al mes y año en cuestión.',
          input: 'select',
          inputOptions: this.SwalDevengue(),
          inputPlaceholder: 'Seleccionar',
          showCancelButton: true,
          confirmButtonText: 'Seleccionar',
          allowOutsideClick: false,
          inputValidator: (value) => {
            if (value === undefined || value === '') {
              return 'Selección no válida.';
            }
          },
        }).then((resultado) => {
          if (resultado.isConfirmed) {
            console.log('ok');
          }
        });
        break;
      case 1:
        this.openModal('devengue');
        break;
    }
  }

  openModal(name: string) {

    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);
    const obj = new Object();

    obj['objParameter'] = this.objParameter;

    switch (name) {
      case 'result':
        obj['aInfoPerso'] = this.MainDS.data;
        modalRef.componentInstance.fromParent = obj;
        break;

      case 'deposit':
        modalRef.componentInstance.fromParent = obj;
        break;

      case 'devengue':
        modalRef.componentInstance.fromParent = obj;
        break;
    }

    modalRef.result.then(async (result) => {
      switch (result.modal) {
        case 'result':
          break;

        case 'deposit':
          break;

        case 'devengue':
          break;
      }
    }, (reason) => {});

  }

  //#endregion

  //#region Load

  async fnGetMain() {
    const sEjMes = moment(this.dFechDevengue).format('YYYYMM');
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    await this.service.GetMain(nIdEmp, sEjMes).then((response: any) => {
      if (response.status === 200) {

        const aData = response.body.response.data as nsCalculop.IMain[];
        this.aMain = aData;

        this.MainDS = new MatTableDataSource(aData);
        this.MainDS.paginator = this.pagMain;

        this.MainDS.filterPredicate = function(data, filter: string): boolean {
          return data.sNombres.trim().toLowerCase().includes(filter);
        };

        this.MainDS.filterPredicate = ((data: nsCalculop.IMain, filter: any ) => {
          // tslint:disable-next-line: max-line-length
          const a = !filter.sNombres || ( data.sNombres.toLowerCase().includes(filter.sNombres.toLowerCase()) || data.sDocumento.toLowerCase().includes(filter.sNombres.toLowerCase()) );
          const b = !filter.nIdPlla || data.nIdPlla === filter.nIdPlla;
          const c = !filter.nIdCiudad || data.nSucCod === filter.nIdCiudad;
          const d = !filter.nIdRegPen || data.nIdRegPen === filter.nIdRegPen;
          const e = !filter.nIdTipoSalario || data.nTipoSalario === filter.nIdTipoSalario;
          const f = !filter.bCalculo || data.bExpand === filter.bCalculo;
          const g =  this.cantConcepto(filter.bConcepto, data.nIdPersonal);
          return a && b && c && d && e && f && g;
        }) as (PeriodicElement, string) => boolean;

        const lPeriodo = [];
        this.aPeriodos.filter(x => x.bCheck === true).forEach( x => lPeriodo.push(x.nIdPeriodo));

        this.calcMain(lPeriodo);

      }
    });
  }

  onChange($event) {
    this.fgFilter.updateValueAndValidity();
  }

  cantConcepto(bOption: boolean, nIdPersonal: number) {
    let bReturn: boolean;

    const fc = this.fgFilter.controls['bConcepto'].enabled;

    if (fc) {
      const aConceptos = this.ngsConceptos.selectedItems as any[];
      const aLength = aConceptos.length as number;
      const aDetail = this.aDetail.filter(x => x.nIdPersonal === nIdPersonal);

      let nCant = 0;
      aConceptos.forEach(x => {
        const nIdConcepto = x.value.nIdConcepto;
        nCant = nCant + ( aDetail.some(item => item.nIdConcepto === nIdConcepto) ? 1 : 0 );
      });

      if (bOption) {
        bReturn = ( nCant === aLength ) ? true : false ;
      } else {
        bReturn = ( nCant === 0 ) ? true : false ;
      }
    } else {
      bReturn = true;
    }

    return bReturn;
  }

  clickExpanded(row: nsCalculop.IMain) {
    if ( this.expandedMore === row ) {
      this.expandedMore = null;
      this.ExpandedDS = new MatTableDataSource([]);
    } else {

      const aExpanded: nsCalculop.IExpanded[] = [];
      if (row.bExpand === true) {
        const aFilter = this.aDetail.filter(x => x.nIdPersonal === row.nIdPersonal);
        aFilter.forEach(x => {
          const nIdConcepto = x.nIdConcepto;
          const iArray = aExpanded.findIndex( item => item.nIdConcepto === nIdConcepto);
          if ( iArray === -1 ) {
            aExpanded.push({
              nIdConcepto: x.nIdConcepto,
              sCodConcepto: x.sCodConcepto,
              sConcepto: x.sConcepto,
              nUnidad: x.nUnidad,
              nImporte: x.nImporte
            });
          } else {
            aExpanded[iArray].nUnidad = aExpanded[iArray].nUnidad + x.nUnidad;
            aExpanded[iArray].nImporte = aExpanded[iArray].nImporte + x.nImporte;
          }
        });

        aExpanded.sort(function(a, b) {
          return Number(a.sCodConcepto) - Number(b.sCodConcepto);
        });
      }

      this.ExpandedDS = new MatTableDataSource(aExpanded);

      this.expandedMore = row;
      this.mtExpanded.renderRows();
    }
  }

  async fnGetDetail() {
    const accrueId = this.nIdDevengue;

    await this.service.GetDetail(accrueId).then((response: any) => {
      if (response.status === 200) {
        const aDetail = response.body.response.data as nsCalculop.IDetail[];
        this.DetailDS = new MatTableDataSource(aDetail);

        this.aPeriodos.forEach( x => {
          const nIdPeriodo = x.nIdPeriodo;
          const bCheck = aDetail.some( y => y.nIdPeriodo === nIdPeriodo);
          x.bCheck = bCheck;
          x.bDisabled = !bCheck;
        });
      }
    });
  }

  calcMain(lPeriodos: number[]) {

    const aDetail = this.DetailDS.data.filter(x => lPeriodos.some( per => per === x.nIdPeriodo ));
    this.aDetail = aDetail;

    // Ingresos, Descuentos y Total
    this.MainDS.data.forEach(element => {
      element.nIngreso = 0.00;
      element.nDescuento = 0.00;
      element.nTotal = 0.00;

      const nIdPersonal = element.nIdPersonal;
      const bFound = aDetail.some(x => x.nIdPersonal === nIdPersonal);
      element.bExpand = bFound;

      if ( bFound ) {

        // Suma Ingreso
        let nIngreso = 0;
        aDetail.filter( x => {
          const a = x.nValor === 1;
          const b = x.nIdPersonal === nIdPersonal;
          return a && b;
        }).forEach( x => {
          nIngreso = nIngreso + x.nImporte;
        });
        element.nIngreso = nIngreso;

        // Suma Descuento
        let nDescuento = 0;
        aDetail.filter( x => {
          const a = x.nValor === -1;
          const b = x.nIdPersonal === nIdPersonal;
          return a && b;
        }).forEach( x => {
          nDescuento = nDescuento + x.nImporte;
        });
        element.nDescuento = nDescuento;

        // Suma Total
        let nTotal = 0;
        aDetail.filter( x => x.nIdPersonal === nIdPersonal )
               .forEach( x => nTotal = nTotal + ( x.nImporte * x.nValor ) );
        element.nTotal = nTotal;
      }

    });

    // Conceptos
    const aConceptos = [];
    aDetail.forEach(x => {
      if ( !aConceptos.some(item => item?.nIdConcepto === x.nIdConcepto) ) {
        aConceptos.push({
          nIdConcepto: x.nIdConcepto,
          sValor: x.sValor,
          sCodConcepto: x.sCodConcepto,
          sConcepto: x.sConcepto
        });
      }
    });
    aConceptos.sort(function(a, b) {
      return Number(a.sCodConcepto) - Number(b.sCodConcepto);
    });
    this.aConceptos = aConceptos;

    // Toogle
    if (aConceptos.length === 0) {
      this.fcToogle.disable();
      this.fcToogle.setValue(false);
    } else {
      this.fcToogle.enable();
    }
  }

  //#endregion

  //#region Extra

  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms)).then();
  }

  animate() {
    this.tadaMain = 'active';

    this.delay(2000).then(any => {
      this.tadaMain = 'inactive';
    });
  }

  //#endregion

  //#region Swal

  public SwalDevengue(): Map<number, any> {
    const map = new Map<number, any>();

    let lEjercicio: number[] = this.aDevengue.map((v) => v.nEjercicio);
    lEjercicio = lEjercicio.sort((a, b) => b - a);

    moment.locale('es');
    lEjercicio.forEach(nEjercicio => {
      const item = new Map();
      const sEjercicio = nEjercicio.toString();

      this.aDevengue.filter( x => x.nEjercicio === nEjercicio).forEach( x => {
        let sMes = (x.nMes as number).toString();
        sMes = (sMes.length === 1) ? '0' + sMes : sMes;
        const sFecha = '01/' + sMes + '/' + sEjercicio;

        const dFecha = moment(sFecha, 'DD/MM/YYYY');
        const key = x.nIdDevengue + '|' + dFecha.format('MM/DD/YYYY');

        const Mes = dFecha.format('MMMM');
        item.set(key, Mes[0].toUpperCase() + Mes.substr(1).toLowerCase());
      });
      map.set(nEjercicio, item);
    });

    return map;
  }

  //#endregion

}
