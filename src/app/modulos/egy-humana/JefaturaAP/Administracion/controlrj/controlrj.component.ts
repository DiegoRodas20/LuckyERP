import { importExpr } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { adminpAnimations } from '../../Animations/adminp.animations';
import { IConcepto, IConceptosPorPersona, IDetalleBeneficiario, IDetalleConcepto, IRetencion } from '../../Model/Icontrolrj';
import { ControlrjService } from '../../Services/controlrj.service';
import { ControlrjDepositosComponent } from './Modals/controlrj-depositos/controlrj-depositos.component';
import { ControlrjDetalleComponent } from './Modals/controlrj-detalle/controlrj-detalle.component';
import { ControlrjGenerardComponent } from './Modals/controlrj-generard/controlrj-generard.component';
import { ControlrjPersonalComponent } from './Modals/controlrj-personal/controlrj-personal.component';
import { ControlrjSearchComponent } from './Modals/controlrj-search/controlrj-search.component';

// Modals
const MODALS: { [name: string]: Type<any> } = {
  search: ControlrjSearchComponent,
  personal: ControlrjPersonalComponent,
  generar: ControlrjGenerardComponent,
  detalle: ControlrjDetalleComponent,
  deposito: ControlrjDepositosComponent
};

@Component({
  selector: 'app-controlrj',
  templateUrl: './controlrj.component.html',
  styleUrls: ['./controlrj.component.css', './controlrj.component.scss'],
  animations: [adminpAnimations],
})
export class ControlrjComponent implements OnInit {

  data: Array<IRetencion> = new Array();
  lstRetenciones: Array<IRetencion> = new Array();
  lstRetencionesAgrupadas: Array<IRetencion> = new Array();
  lstConceptos: Array<IConcepto> = new Array();

  lstDetalleConceptos: Array<IDetalleConcepto> = new Array();

  aParam = [];

  // Parent
  aItem: any;

  retencionId: number = 0;

  // Datos del beneficiario
  tipoDocumento: string = "";
  nroDocumento: string = "";
  beneficiario: string = "";
  banco: string = "";
  nroCuenta: string = "";
  nroCuentaI: string = "";
  moneda: string = "";

  // Fab
  fbMain = [
    { icon: 'person_search', tool: 'Buscar personal' },
    { icon: 'receipt', tool: 'Depósitos' }
    //{ icon: 'settings_brightness', tool: 'Generar depósitos' }
  ];
  abMain = [];
  tsMain = 'inactive';

  // Animation
  tadaMain = 'inactive';

  // Progress Bar
  pbMain: boolean;

  // Devenge
  dFechDevengue: Date = null;

  // FormGroup
  fgMain: FormGroup;

  // Modal Config
  ngbModalOptions: NgbModalOptions = {
    size: 'xl',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };

  // Mat Table
  MainDC: string[] = ['acciones', 'demandado', 'tipoDocumentoDemandado', 'nroDocumentoDemandado', 'fechaIngreso', 'fechaCese', 'fechaInicio', 'fechaTermino', 'tipoRetencion', 'monto', 'more'];
  searchBS: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild('searchB', { static: true }) searchB: MatPaginator;
  expandedMore = null;

  constructor(private fb: FormBuilder,
    private spi: NgxSpinnerService,
    private _modalService: NgbModal,
    private _snackBar: MatSnackBar,
    private controlrjService: ControlrjService
  ) {


    this.expandedMore = null;

    this.onInitFrmGrpPrincipal();
  }

  async ngOnInit(): Promise<void> {
    this.spi.show('spi_main');

    this.searchBS = new MatTableDataSource();

    await this.onCargarConceptos();
    await this.onCargarRetenciones();

    this.spi.hide('spi_main');
  }

  onInitFrmGrpPrincipal() {
    this.fgMain = this.fb.group({
      demandado: '',
      tipoRetencion: 0,
      beneficiario: '',
      concepto: ''
    });

    this.fgMain.valueChanges.subscribe((value) => {
      const filter = { ...value, name: value.demandado } as string;

      this.searchBS.filter = filter;

      if (this.searchBS.paginator) {
        this.searchBS.paginator.firstPage();
      }
    });
  }

  async onCargarRetenciones() {
    this.pbMain = true;

    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    await this.controlrjService._loadSP(1, param).then((data: any) => {
      this.data = data;
      this.lstRetenciones = data;
    });

    this.lstRetencionesAgrupadas = new Array();

    this.lstRetencionesAgrupadas = this.data
      .filter(
        (value, index, arr) =>
          arr.findIndex((x) => x.retencionId === value.retencionId) === index
      );

    this.searchBS = new MatTableDataSource(this.lstRetencionesAgrupadas);
    this.searchBS.paginator = this.searchB;

    this.searchBS.filterPredicate = function (
      data: IRetencion,
      filter: string
    ): boolean {
      return data.demandado.trim().toLowerCase().includes(filter);
    };

    this.searchBS.filterPredicate = ((
      data: IRetencion,
      filter: IRetencion
    ) => {
      const a = !filter.demandado || (data.demandado.toLowerCase().includes(filter.demandado.toLowerCase()) || data.nroDocumentoDemandado.toLowerCase().includes(filter.demandado.toLowerCase()));
      const b = !filter.tipoRetencion || data.tipoRetencionId === filter.tipoRetencion;
      const c = !filter.beneficiario || (data.beneficiario.toLowerCase().includes(filter.beneficiario.toLowerCase()) || data.nroDocumentoBeneficiario.toLowerCase().includes(filter.beneficiario.toLowerCase()));
      const d = !filter.concepto || data.conceptoId === filter.concepto;
      return a && b && c && d;
    }) as (PeriodicElement, string) => boolean;

    // Carga de detalle de remuneración
    // this.data.filter(x => x.retencionId == row.retencionId).forEach(element => {
    //   this.lstDetalleConceptos.push({ nombre: element.concepto });
    // });

    //this.ExpandedDS = new MatTableDataSource(this.lstDetalleConceptos);

    this.pbMain = false;
  }

  async onClickExpanded(row: IRetencion) {

    if (this.expandedMore === row) {
      this.expandedMore = null;
    } else {

      // Carga de detalle de remuneración
      //let lstDetalle: Array<IDetalleConcepto> = new Array();

      this.lstDetalleConceptos = [];

      this.data.filter(x => x.retencionId == row.retencionId).forEach(element => {
        this.lstDetalleConceptos.push({ id: element.conceptoId, nombre: element.concepto });
      });

      let lstDetalleBeneficiario: Array<IDetalleBeneficiario> = new Array();

      this.data
        .filter(
          (value, index, arr) =>
            arr.findIndex((x) => x.demandado === value.demandado && x.beneficiario === value.beneficiario) === index
        ).filter(x => x.retencionId == row.retencionId).forEach(elem => {
          lstDetalleBeneficiario.push({
            tipoDocumento: elem.tipoDocumentoBeneficiario,
            nroDocumento: elem.nroDocumentoBeneficiario,
            beneficiario: elem.beneficiario,
            banco: elem.banco,
            nroCuenta: elem.nroCuenta,
            nroCuentaI: elem.nroCuentaI,
            moneda: elem.moneda
          });
        });;

      this.tipoDocumento = lstDetalleBeneficiario[0].tipoDocumento;
      this.nroDocumento = lstDetalleBeneficiario[0].nroDocumento;
      this.beneficiario = lstDetalleBeneficiario[0].beneficiario;
      this.banco = lstDetalleBeneficiario[0].banco;
      this.nroCuenta = lstDetalleBeneficiario[0].nroCuenta;
      this.nroCuentaI = lstDetalleBeneficiario[0].nroCuentaI;
      this.moneda = lstDetalleBeneficiario[0].moneda;

      this.expandedMore = row;
    }
  }

  onChangeTipoRetencion(tipoRetencionId: string) {

    this.pbMain = true;

    this.lstRetenciones = this.data.filter(
      x => x.tipoRetencionId === tipoRetencionId || tipoRetencionId == ""
    );

    let conceptoId = this.fgMain.controls['concepto'].value;

    this.lstRetenciones = this.lstRetenciones.filter(
      x => x.conceptoId === conceptoId || conceptoId == ""
    );

    let lstRetencionesAgrupadas: Array<IRetencion> = new Array();

    lstRetencionesAgrupadas = this.lstRetenciones
      .filter(
        (value, index, arr) =>
          arr.findIndex((x) => x.demandado === value.demandado && x.beneficiario === value.beneficiario) === index
      );

    this.searchBS = new MatTableDataSource(lstRetencionesAgrupadas);
    this.searchBS.paginator = this.searchB;

    this.searchBS.filterPredicate = function (
      data: IRetencion,
      filter: string
    ): boolean {
      return data.demandado.trim().toLowerCase().includes(filter);
    };

    this.searchBS.filterPredicate = ((
      data: IRetencion,
      filter: IRetencion
    ) => {
      const a = !filter.demandado || (data.demandado.toLowerCase().includes(filter.demandado.toLowerCase()) || data.nroDocumentoDemandado.toLowerCase().includes(filter.demandado.toLowerCase()));
      const b = !tipoRetencionId || data.tipoRetencionId === tipoRetencionId;
      const c = !filter.beneficiario || (data.beneficiario.toLowerCase().includes(filter.beneficiario.toLowerCase()) || data.nroDocumentoBeneficiario.toLowerCase().includes(filter.beneficiario.toLowerCase()));
      const d = !conceptoId || data.conceptoId === conceptoId;
      return a && b && c && d;
    }) as (PeriodicElement, string) => boolean;

    this.pbMain = false;
  }

  onChangeConcepto(conceptoId: string) {

    this.pbMain = true;

    this.lstRetenciones = this.data.filter(
      x => x.conceptoId === conceptoId || conceptoId == ""
    );

    let tipoRetencionId = this.fgMain.controls['tipoRetencion'].value

    this.lstRetenciones = this.lstRetenciones.filter(
      x => x.tipoRetencionId === tipoRetencionId || tipoRetencionId == ""
    );

    let lstRetencionesAgrupadas: Array<IRetencion> = new Array();

    lstRetencionesAgrupadas = this.lstRetenciones
      .filter(
        (value, index, arr) =>
          arr.findIndex((x) => x.demandado === value.demandado && x.beneficiario === value.beneficiario) === index
      );

    this.searchBS = new MatTableDataSource(lstRetencionesAgrupadas);
    this.searchBS.paginator = this.searchB;

    this.searchBS.filterPredicate = function (
      data: IRetencion,
      filter: string
    ): boolean {
      return data.demandado.trim().toLowerCase().includes(filter);
    };

    this.searchBS.filterPredicate = ((
      data: IRetencion,
      filter: IRetencion
    ) => {
      const a = !filter.demandado || (data.demandado.toLowerCase().includes(filter.demandado.toLowerCase()) || data.nroDocumentoDemandado.toLowerCase().includes(filter.demandado.toLowerCase()));
      const b = !tipoRetencionId || data.tipoRetencionId === tipoRetencionId;
      const c = !filter.beneficiario || (data.beneficiario.toLowerCase().includes(filter.beneficiario.toLowerCase()) || data.nroDocumentoBeneficiario.toLowerCase().includes(filter.beneficiario.toLowerCase()));
      const d = !conceptoId || data.conceptoId === conceptoId;
      return a && b && c && d;
    }) as (PeriodicElement, string) => boolean;

    this.pbMain = false;
  }

  async onCargarConceptos() {
    const param = [];

    await this.controlrjService._loadSP(2, param).then((value: any[]) => {
      this.lstConceptos = value;
    });
  }

  get getMain() { return this.fgMain.controls; }

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = (stat === -1) ? (this.abMain.length > 0) ? 0 : 1 : stat;
        this.tsMain = (stat === 0) ? 'inactive' : 'active';
        this.abMain = (stat === 0) ? [] : this.fbMain;
        break;
    }
  }

  clickFab(index: number, tool: string) {
    switch (tool) {
      case "Buscar personal":
        this.openModal('search');
        break;
      // case 1:
      //   this.verDepositos();
      //   break;
      case "Depósitos":
        this.ngbModalOptions.size = 'xl';
        this.openModal('generar');
        break;
    }
  }

  openModal(name: string) {

    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);

    const obj = new Object();

    switch (name) {
      case 'detalle':
      case 'deposito':
        obj['retencionId'] = this.retencionId;

        modalRef.componentInstance.fromParent = obj;
        break;
      case 'personal':
        obj['aItem'] = this.aItem;

        modalRef.componentInstance.fromParent = obj;
        break;
    }

    modalRef.result.then((result) => {
      switch (result.modal) {
        case 'search':
          if (result.value === 'select') {
            //this.selectPerson(result.item);
            this.onToggleFab(1, 0);
          }
          break;
      }

    }, (reason) => { });

  }

  onVerDetalle(row: IRetencion) {
    this.ngbModalOptions.size = 'xl';
    this.retencionId = row.retencionId;
    this.openModal('detalle');
  }

  onVerDepositos(row: IRetencion) {
    this.ngbModalOptions.size = 'xl';
    this.retencionId = row.retencionId;
    this.openModal('deposito');
  }

  clickPersonal(element: any) {
    this.aItem = element;
    this.ngbModalOptions.size = 'xl';
    this.openModal('personal');
  }
}
