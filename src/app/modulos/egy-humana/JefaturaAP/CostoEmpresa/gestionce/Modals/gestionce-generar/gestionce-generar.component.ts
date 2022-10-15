import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { nsGestionce } from '../../../../Model/Igestionce';
import { GestionceService } from '../../../../Services/gestionce.service';
import * as moment from 'moment';

@Component({
  selector: 'app-gestionce-generar',
  templateUrl: './gestionce-generar.component.html',
  styleUrls: ['./gestionce-generar.component.css', './gestionce-generar.component.scss'],
  providers: [ GestionceService ],
  animations: [ adminpAnimations ]
})
export class GestionceGenerarComponent implements OnInit {

  @Input() fromParent;

  //#region Variables

  sHeaderDevengue = '';
  nIdDevengue: number;
  nIdEstado: number;
  dFechaDevengue: Date;

  // FormGroup
  fgModal: FormGroup;

  // Fab
  fbModal = [
    {icon: 'save', tool: 'Guardar', dis: true},
    {icon: 'backup', tool: 'Temporal', dis: true},
    {icon: 'cancel', tool: 'Cancelar', dis: false}
  ];
  abModal = [];
  tsModal = 'inactive';

  // Progress Bar
  pbModal = false;

  // Main
  MainDC: string[] = ['sCentroCosto', 'sConcepto', 'nUnidad', 'nImporte', 'more'];
  MainDS: MatTableDataSource<nsGestionce.IMain> = new MatTableDataSource([]);
  @ViewChild('pagMain', {static: true}) pagMain: MatPaginator;
  expandedMore: nsGestionce.IMain = null;

  // Expanded
  ExpandedDC: string[] = ['action', 'sSucursal', 'sCargo', 'sPuesto', 'sPerfil', 'sCanal', 'nUnidad', 'nImporte'];
  ExpandedDS: MatTableDataSource<nsGestionce.IExpanded> = new MatTableDataSource([]);
  @ViewChild('mtExpanded', {static: false}) mtExpanded: MatTable<nsGestionce.IExpanded>;

  ResultDS: MatTableDataSource<nsGestionce.IHistory> = new MatTableDataSource([]);

  aCostoEmpresa: nsGestionce.ICostoEmpresa[] = [];
  aDetailCostoEmpresa: nsGestionce.IDetailCostoEmpresa[] = [];

  // Array
  aCentroCosto = new Array();
  cboConcepto = new Array();
  cboSucursal = new Array();
  cboCargo = new Array();
  cboPuesto = new Array();
  cboPerfil = new Array();
  cboCanal = new Array();
  cboPlanilla = new Array();
  aPersonal = new Array();
  aDevengue = new Array();

  //#endregion

  constructor(
    public service: GestionceService,
    private spi: NgxSpinnerService,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    public activeModal: NgbActiveModal
  ) {
    this.new_fgModal();
  }

  async ngOnInit(): Promise<void>  {
    this.spi.show('spi_modal');

    this.nIdDevengue = this.fromParent.objParameter.nIdDevengue;
    this.nIdEstado = this.fromParent.objParameter.nIdEstado;
    this.dFechaDevengue = this.fromParent.objParameter.dFechaDevengue;

    moment.locale('es');
    const tDate = moment(this.dFechaDevengue, 'DD/MM/YYYY').format('MMMM [del] YYYY');
    this.sHeaderDevengue = tDate[0].toUpperCase() + tDate.substr(1).toLowerCase();

    await this.fnGetCostoEmpresa();
    this.fnGetLoad();

    // Evaluanmos el estado del devengue
    if (this.nIdEstado === 2) {
      this.fbModal[0].dis = false;
    } else {
      this.fbModal[1].dis = false;
    }

    this.spi.hide('spi_modal');

    this.onToggleFab(1);
  }

  //#region FormGroup

  new_fgModal() {
    this.fgModal = this.fb.group({
      default: '',
      nIdCentroCosto: null,
      nIdConcepto: null,
      nIdSucursal: null,
      nIdCargo: null,
      nIdPuesto: null,
      nIdPerfil: null,
      nIdCanal: null,
      nIdPlla: null,
      nIdPersonal: null
    });

    this.fgModal.valueChanges.subscribe(value => {
      const filter = { ...value, name: value.default.trim().toLowerCase() } as string;
      this.ResultDS.filter = filter;

      this.loadMain();

      if (this.MainDS.paginator) {
        this.MainDS.paginator.firstPage();
      }

      this.expandedMore = null;
    });

  }

  get getModal() { return this.fgModal.controls; }

  //#endregion

  //#region General

  onToggleFab(stat: number) {
    stat = ( stat === -1 ) ? ( this.abModal.length > 0 ) ? 0 : 1 : stat;
    this.tsModal = ( stat === 0 ) ? 'inactive' : 'active';
    this.abModal = ( stat === 0 ) ? [] : this.fbModal;
  }

  async clickFab(opc: number) {

    switch (opc) {
      case 0:
        Swal.fire({
          title: '¿ Estas seguro de procesar el mes de ' + this.sHeaderDevengue + '?',
          text: 'Este proceso es de manera permanente.',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#ff4081',
          confirmButtonText: 'Confirmar !',
          allowOutsideClick: false
        }).then(async (result) => {
          if (result.isConfirmed) {
            this.spi.show('spi_modal');
            await this.saveCostoEmpresa();
            this.spi.hide('spi_modal');
          }
        });
        break;

      case 2:
        this.activeModal.dismiss();
        break;
    }
  }

  showAlert(data: string, titulo: string, duration: number) {
    this._snackBar.open(data, titulo, {
      duration: duration * 10000,
      verticalPosition: 'top'
    });
  }

  closeModal() {
    const oReturn = new Object();
    oReturn['modal'] = 'generarce';
    oReturn['value'] = 'loadAgain';
    oReturn['nIdDevengue'] = this.nIdDevengue;
    this.activeModal.close(oReturn);
  }

  fnGetLoad() {
    this.loadMain();
    this.loadCentroCosto();
    this.loadConcepto();
    this.loadSucursal();
    this.loadCargo();
    this.loadPuesto();
    this.loadPerfil();
    this.loadCanal();
    this.loadPlla();
    this.loadPersonal();
  }

  //#endregion

  //#region Costo Empresa

  async fnGetCostoEmpresa() {
    await this.service.GetCompanyCost(this.nIdDevengue).then((response: any) => {
      if (response?.status === 200) {
        this.ResultDS = new MatTableDataSource(response.body.data.main as nsGestionce.IHistory[]);
        this.aDetailCostoEmpresa = response.body.data.detail as nsGestionce.IDetailCostoEmpresa[];

        this.ResultDS.filterPredicate = function(data, filter: string): boolean {
          return data.sNombres.trim().toLowerCase().includes(filter);
        };

        this.ResultDS.filterPredicate = ((data: nsGestionce.IHistory, filter: any ) => {
          const a = !filter.nIdCentroCosto || data.nIdCentroCosto === filter.nIdCentroCosto;
          const b = !filter.nIdConcepto || data.nIdConcepto === filter.nIdConcepto;
          const c = !filter.nIdSucursal || data.nIdSucursal === filter.nIdSucursal;
          const d = !filter.nIdCargo || data.nIdCargo === filter.nIdCargo;
          const e = !filter.nIdPuesto || data.nIdPuesto === filter.nIdPuesto;
          const f = !filter.nIdPerfil || data.nIdPerfil === filter.nIdPerfil;
          const g = !filter.nIdCanal || data.nIdCanal === filter.nIdCanal;
          const h = !filter.nIdPlla || data.nIdPlla === filter.nIdPlla;
          const i = !filter.nIdPersonal || data.nIdPersonal === filter.nIdPersonal;
          return a && b && c && d && e && f && g && h && i;
        }) as (PeriodicElement, string) => boolean;
      }
    });
  }

  async saveCostoEmpresa() {
    const user = localStorage.getItem('currentUser');
    const uid = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.ResultDS.data.forEach(x => x.nIdRegUser = Number(uid));

    this.ResultDS.data.forEach(iResult => {
      this.aCostoEmpresa.push({
        nIdCostoEmpresa: iResult.nIdCostoEmpresa,
        nIdDevengue: iResult.nIdDevengue,
        nIdPersonal: iResult.nIdPersonal,
        nIdPlla: iResult.nIdPlla,
        nIdCentroCosto: iResult.nIdCentroCosto,
        nIdConcepto: iResult.nIdConcepto,
        nIdSucursal: iResult.nIdSucursal,
        nIdCargo: iResult.nIdCargo,
        nIdPuesto: iResult.nIdPuesto,
        nIdPerfil: iResult.nIdPerfil,
        nIdCanal: iResult.nIdCanal,
        nUnidad: iResult.nUnidad,
        nImporte: iResult.nImporte,
        nIdRegUser: iResult.nIdRegUser,
        dtReg: iResult.dtReg
      });
    });

    const obj = new Object();
    obj['main'] = this.aCostoEmpresa;
    obj['detail'] = this.aDetailCostoEmpresa;

    await this.service.PostInsertCompanyCost(obj).then((response: any) => {
      const ftitle = 'Registro satisfactorio';
      const ftext = 'Costo empresa procesado : ' + this.sHeaderDevengue;
      const ftype = 'success';
      Swal.fire(ftitle, ftext, ftype);

      this.closeModal();
    });
  }

  //#endregion

  //#region Main

  loadMain() {

    const aResult = this.ResultDS.filteredData;
    const aMain: nsGestionce.IMain[] = [];

    aResult.forEach(iResult => {
      const dFechDevengue = iResult.dFechDevengue;
      const nIdCentroCosto = iResult.nIdCentroCosto;
      const nIdConcepto = iResult.nIdConcepto;

      const indexMain = aMain.findIndex(iMain => {
        const a = moment(iMain.dFechDevengue).format('YYYYMM') === moment(dFechDevengue).format('YYYYMM');
        const b = iMain.nIdCentroCosto === nIdCentroCosto;
        const c = iMain.nIdConcepto === nIdConcepto;
        return a && b && c;
      });

      if (indexMain === -1) {

        aMain.push({
          dFechDevengue: dFechDevengue,
          nIdCentroCosto: nIdCentroCosto,
          sCentroCosto: iResult.sCentroCosto,
          nIdConcepto: nIdConcepto,
          sConcepto: iResult.sConcepto,
          nUnidad: iResult.nUnidad,
          nImporte: iResult.nImporte
        });

      } else {
        aMain[indexMain].nUnidad = aMain[indexMain].nUnidad + iResult.nUnidad;
        aMain[indexMain].nImporte = aMain[indexMain].nImporte + iResult.nImporte;
      }

    });

    this.MainDS = new MatTableDataSource(aMain);
    this.MainDS.paginator = this.pagMain;

  }

  clickExpanded(row: nsGestionce.IMain) {

    if ( this.expandedMore === row ) {
      this.expandedMore = null;
      this.ExpandedDS = new MatTableDataSource([]);
    } else {

      const aResult = this.ResultDS.filteredData;
      const aExpanded: nsGestionce.IExpanded[] = [];

      const dFechDevengue = row.dFechDevengue;
      const nIdCentroCosto = row.nIdCentroCosto;
      const nIdConcepto = row.nIdConcepto;

      aResult.filter(iResult => {
        const a = moment(iResult.dFechDevengue).format('YYYYMM') === moment(dFechDevengue).format('YYYYMM');
        const b = iResult.nIdCentroCosto === nIdCentroCosto;
        const c = iResult.nIdConcepto === nIdConcepto;
        return a && b && c;
      }).forEach(iResult => {

        const nIdSucursal = iResult.nIdSucursal;
        const nIdCargo = iResult.nIdCargo;
        const nIdPuesto = iResult.nIdPuesto;
        const nIdPerfil = iResult.nIdPerfil;
        const nIdCanal = iResult.nIdCanal;

        const indexExpanded = aExpanded.findIndex(iExpanded => {
          const a = !nIdSucursal || iExpanded.nIdSucursal === nIdSucursal;
          const b = !nIdCargo || iExpanded.nIdCargo === nIdCargo;
          const c = !nIdPuesto || iExpanded.nIdPuesto === nIdPuesto;
          const d = !nIdPerfil || iExpanded.nIdPerfil === nIdPerfil;
          const e = !nIdCanal || iExpanded.nIdCanal === nIdCanal;
          return a && b && c && d && e;
        });

        if (indexExpanded === -1) {

          aExpanded.push({
            nIdSucursal: nIdSucursal,
            sSucursal: iResult.sSucursal,
            nIdCargo: nIdCargo,
            sCargo: iResult.sCargo,
            nIdPuesto: nIdPuesto,
            sPuesto: iResult.sPuesto,
            nIdPerfil: nIdPerfil,
            sPerfil: iResult.sPerfil,
            nIdCanal: nIdCanal,
            sCanal: iResult.sCanal,
            nUnidad: iResult.nUnidad,
            nImporte: iResult.nImporte
          });

        } else {
          aExpanded[indexExpanded].nUnidad = aExpanded[indexExpanded].nUnidad + iResult.nUnidad;
          aExpanded[indexExpanded].nImporte = aExpanded[indexExpanded].nImporte + iResult.nImporte;
        }

      });

      this.ExpandedDS = new MatTableDataSource(aExpanded);

      this.expandedMore = row;
      this.mtExpanded.renderRows();
    }

  }

  getTotal() {
    let nTotal = 0;
    const aResult = this.ResultDS.filteredData;
    aResult.forEach(iResutl => nTotal = nTotal + iResutl.nImporte);
    return nTotal;
  }

  //#endregion

  //#region Array

  loadCentroCosto() {
    const aCentroCosto = [];
    const aHistory = this.ResultDS.data;
    aHistory.forEach(iHistory => {
      const nIdCentroCosto = iHistory.nIdCentroCosto;
      const index = aCentroCosto.findIndex(item => item?.nIdCentroCosto === nIdCentroCosto);
      if (index === -1) {
        aCentroCosto.push({
          nIdCentroCosto: nIdCentroCosto,
          sCentroCosto: iHistory.sCentroCosto,
          sTipoCC: iHistory.sTipoCC
        });
      }
    });
    this.aCentroCosto = aCentroCosto;
  }

  loadConcepto() {
    const aConcepto = [];
    const aHistory = this.ResultDS.data;
    aHistory.forEach(iHistory => {
      const nIdConcepto = iHistory.nIdConcepto;
      const index = aConcepto.findIndex(item => item?.nIdConcepto === nIdConcepto);
      if (index === -1) {
        aConcepto.push({
          nIdConcepto: nIdConcepto,
          sConcepto: iHistory.sConcepto
        });
      }
    });
    this.cboConcepto = aConcepto;
  }

  loadSucursal() {
    const aSucursal = [];
    const aHistory = this.ResultDS.data;
    aHistory.forEach(iHistory => {
      const nIdSucursal = iHistory.nIdSucursal;
      const index = aSucursal.findIndex(item => item?.nIdSucursal === nIdSucursal);
      if (index === -1) {
        aSucursal.push({
          nIdSucursal: nIdSucursal,
          sSucursal: iHistory.sSucursal
        });
      }
    });
    this.cboSucursal = aSucursal;
  }

  loadCargo() {
    const aCargo = [];
    const aHistory = this.ResultDS.data;
    aHistory.forEach(iHistory => {
      const nIdCargo = iHistory.nIdCargo;
      const index = aCargo.findIndex(item => item?.nIdCargo === nIdCargo);
      if (index === -1) {
        aCargo.push({
          nIdCargo: nIdCargo,
          sCargo: iHistory.sCargo
        });
      }
    });
    this.cboCargo = aCargo;
  }

  loadPuesto() {
    const aPuesto = [];
    const aHistory = this.ResultDS.data;
    aHistory.forEach(iHistory => {
      const nIdPuesto = iHistory.nIdPuesto;
      const index = aPuesto.findIndex(item => item?.nIdPuesto === nIdPuesto);
      if (index === -1) {
        aPuesto.push({
          nIdPuesto: nIdPuesto,
          sPuesto: iHistory.sPuesto
        });
      }
    });
    this.cboPuesto = aPuesto;
  }

  loadPerfil() {
    const aPerfil = [];
    const aHistory = this.ResultDS.data;
    aHistory.forEach(iHistory => {
      const nIdPerfil = iHistory.nIdPerfil;
      const index = aPerfil.findIndex(item => item?.nIdPerfil === nIdPerfil);
      if (index === -1) {
        aPerfil.push({
          nIdPerfil: nIdPerfil,
          sPerfil: iHistory.sPerfil
        });
      }
    });
    this.cboPerfil = aPerfil;
  }

  loadCanal() {
    const aCanal = [];
    const aHistory = this.ResultDS.data;
    aHistory.forEach(iHistory => {
      const nIdCanal = iHistory.nIdCanal;
      const index = aCanal.findIndex(item => item?.nIdCanal === nIdCanal);
      if (index === -1) {
        aCanal.push({
          nIdCanal: nIdCanal,
          sCanal: iHistory.sCanal
        });
      }
    });
    this.cboCanal = aCanal;
  }

  loadPlla() {
    const aPlla = [];
    const aHistory = this.ResultDS.data;
    aHistory.forEach(iHistory => {
      const nIdPlla = iHistory.nIdPlla;
      const index = aPlla.findIndex(item => item?.nIdPlla === nIdPlla);
      if (index === -1) {
        aPlla.push({
          nIdPlla: nIdPlla,
          sPlanilla: iHistory.sPlanilla
        });
      }
    });
    this.cboPlanilla = aPlla;
  }

  loadPersonal() {
    const aPersonal = [];
    const aHistory = this.ResultDS.data;
    aHistory.forEach(iHistory => {
      const nIdPersonal = iHistory.nIdPersonal;
      const index = aPersonal.findIndex(item => item?.nIdPersonal === nIdPersonal);
      if (index === -1) {
        aPersonal.push({
          nIdPersonal: nIdPersonal,
          sNombres: iHistory.sNombres
        });
      }
    });
    this.aPersonal = aPersonal;
  }

  //#endregion

  //#region Extra

  onChange($event) {
    this.fgModal.updateValueAndValidity();
  }

  //#endregion

}
