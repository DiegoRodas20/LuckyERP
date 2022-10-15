import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { nsCalculop } from '../../../../Model/Icalculop';
import { CalculopService } from '../../../../Services/calculop.service';
import * as moment from 'moment';

@Component({
  selector: 'app-calculop-result',
  templateUrl: './calculop-result.component.html',
  styleUrls: ['./calculop-result.component.css', './calculop-result.component.scss'],
  animations: [ adminpAnimations ]
})
export class CalculopResultComponent implements OnInit {

  @Input()   fromParent;

  //#region Variables
  sInfoPeriodo = '';
  mpdEstructuraSalarial = '';
  nTotalDeposito = 0;
  nTotalSalario = 0;

  // Fab
  fbResult = [
    {icon: 'save', tool: 'Guardar', dis: true}
  ];
  abResult = [];
  tsResult = 'inactive';

  // Progress Bar
  pbResult: boolean;

  // FormGroup
  fgInfoPeriodo: FormGroup;
  fgInfoPersoFront: FormGroup;
  fgInfoPersoBack: FormGroup;

  // FormControl
  fcPersonal: FormControl;

  // NgSelect
  aPersonal = new Array();

  // Mat Table
  ConceptoDC: string[] = ['sConcepto', 'nUnidad', 'nImporte'];
  ConceptoDS: MatTableDataSource<nsCalculop.IPersonConcept> = new MatTableDataSource([]);

  SalarioDC: string[] = ['sConcepto', 'nImporte'];
  SalarioDS: MatTableDataSource<nsCalculop.IPersonSalary> = new MatTableDataSource([]);

  DepositoDC: string[] = ['action', 'sPeriodo', 'nImporte'];
  DepositoDS: MatTableDataSource<nsCalculop.IPersonDeposit> = new MatTableDataSource([]);

  // Expansion Panel
  @ViewChild('mapPersonal', { static: true }) mapPersonal: MatExpansionPanel;
  @ViewChild('mapSalario', { static: true }) mapSalario: MatExpansionPanel;
  @ViewChild('mapDeposito', { static: true }) mapDeposito: MatExpansionPanel;

  // Parent
  nIdDevengue = 0;
  nIdPeriodo = 0;
  nIdPlla = 0;
  aInfoPerso: Array<nsCalculop.IMain> = [];

  //#endregion

  constructor(public activeModal: NgbActiveModal, private spi: NgxSpinnerService,
              public service: CalculopService, private fb: FormBuilder) {

    this.new_fgInfoPeriodo();
    this.new_fcPersonal();
    this.new_fgInfoPersoFront();
    this.new_fgInfoPersoBack();

  }

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_result');

    console.log(this.fromParent.objParameter);

    this.nIdDevengue = this.fromParent.objParameter.nIdDevengue;
    this.nIdPeriodo = this.fromParent.objParameter.nIdPeriodo;
    this.nIdPlla = this.fromParent.objParameter.nIdPlla;
    this.aInfoPerso = this.fromParent.aInfoPerso;

    await this.loadPeriodInfo();
    await this.loadPeriodList();

    this.spi.hide('spi_result');

  }

  //#region General

  onToggleFab(stat: number) {
    stat = ( stat === -1 ) ? ( this.abResult.length > 0 ) ? 0 : 1 : stat;
    this.tsResult = ( stat === 0 ) ? 'inactive' : 'active';
    this.abResult = ( stat === 0 ) ? [] : this.fbResult;
  }

  clickFab(opc: number) {
  }

  closeResult() {

    const oReturn = new Object();
    oReturn['modal'] = 'result';

    this.activeModal.close(oReturn);

  }

  cleanPersonal() {
    this.fgInfoPersoFront.reset({
      nAlert: 0
    });
    this.fgInfoPersoBack.reset();

    this.ConceptoDS = new MatTableDataSource([]);
    this.SalarioDS = new MatTableDataSource([]);
    this.nTotalSalario = 0;

    this.DepositoDS = new MatTableDataSource([]);
    this.nTotalDeposito = 0;

    this.mapPersonal.close();
    this.mapSalario.close();
    this.mapDeposito.close();

    this.mapPersonal.disabled = true;

    this.mpdEstructuraSalarial = '';
    this.mapSalario.disabled = true;
    this.mapDeposito.disabled = true;
  }

  clickFlipCard() {
    ( function($) {
      $('#card_inner').toggleClass('is-flipped');
    })(jQuery);
  }

  //#endregion

  //#region FormGroup

  new_fgInfoPeriodo() {
    this.fgInfoPeriodo = this.fb.group({
      dDevengue: [{ value: null, disabled: true }],
      nEjercicio: 0,
      nMes: 0,
      sPeriodo: [{ value: '', disabled: true }],
      sPlanilla: [{ value: '', disabled: true }],
      sUsuario: [{ value: '', disabled: true }],
      dtIni: [{ value: null, disabled: true }],
      dtFin: [{ value: null, disabled: true }],
    });
  }

  new_fgInfoPersoFront() {
    this.fgInfoPersoFront = this.fb.group({
      sNombres: [{ value: '', disabled: true }],
      sCodPlla: [{ value: '', disabled: true }],
      dFechIni: [{ value: null, disabled: true }],
      dFechFin: [{ value: null, disabled: true }],
      sTipoSalario: [{ value: '', disabled: true }],
      nMonto: [{ value: 0, disabled: true }],
      nAlert: [{ value: 0, disabled: true }]
    });
  }

  new_fgInfoPersoBack() {
    this.fgInfoPersoBack = this.fb.group({
      sTipo: [{ value: '', disabled: true }],
      sDocumento: [{ value: '', disabled: true }],
      sCiudad: [{ value: '', disabled: true }],
      sRegPen: [{ value: '', disabled: true }]
    });
  }

  get getInfoPeriodo() { return this.fgInfoPeriodo.controls; }
  get getInfoPersoFront() { return this.fgInfoPersoFront.controls; }
  get getInfoPersoBack() { return this.fgInfoPersoBack.controls; }

  //#endregion

  //#region FormControl

  new_fcPersonal() {
    this.fcPersonal = new FormControl(null);
    this.fcPersonal.valueChanges.subscribe(value => {
      if ( value !== null ) {
        const eFind = this.aPersonal.find( x => x.nIdDetDP === value );
        this.loadPersonal(value, eFind.nIdPersonal);
      } else {
        this.cleanPersonal();
      }
    });
  }

  //#endregion

  //#region Load

  async loadPeriodInfo() {
    await this.service.GetPeriodInfo(this.nIdDevengue, this.nIdPeriodo, this.nIdPlla).then((response: any) => {
      if (response?.status === 200) {

        const aData = response.body.response.data as nsCalculop.IPeriodInfo[];

        const nEjercicio = aData[0].nEjercicio;
        const sEjercicio = nEjercicio.toString();

        const nMes = aData[0].nMes;
        let sMes = nMes.toString();
        sMes = (sMes.length === 1) ? '0' + sMes : sMes;
        const sFecha = '01/' + sMes + '/' + sEjercicio;

        moment.locale('es');
        const dFecha = moment(sFecha, 'DD/MM/YYYY');

        const dtIni = aData[0].dtIni;
        const sIni = moment(dtIni).format('DD/MM/YYYY hh:mm:ss a');

        const dtFin = aData[0].dtFin;
        const sFin = moment(dtFin).format('DD/MM/YYYY hh:mm:ss a');

        this.fgInfoPeriodo.patchValue({
          dDevengue: dFecha,
          nEjercicio: nEjercicio,
          nMes: nMes,
          sPeriodo: aData[0].sPeriodo,
          sPlanilla: aData[0].sPlanilla,
          sUsuario: aData[0].sUsuario,
          dtIni: sIni,
          dtFin: sFin
        });

      }
    });
  }

  async loadPeriodList() {
    await this.service.GetPeriodList(this.nIdDevengue, this.nIdPeriodo, this.nIdPlla).then((response: any) => {
      if (response?.status === 200) {

        const aData = response.body.response.data as nsCalculop.IPeriodList[];
        this.aPersonal = aData;
      }
    });
  }

  async loadPersonal(nIdDetDP: number, nIdPersonal: number) {

    this.spi.show('spi_result');

    console.log(nIdPersonal);

    // Información personal
    const eInfoPerso = this.aInfoPerso.find( x => x.nIdPersonal === nIdPersonal );

    this.fgInfoPersoFront.patchValue({
      sNombres: eInfoPerso.sNombres,
      sCodPlla: eInfoPerso.sCodPlla,
      dFechIni: eInfoPerso.dFechIni,
      dFechFin: eInfoPerso.dFechFin,
      sTipoSalario: eInfoPerso.sTipoSalario,
      nMonto: eInfoPerso.nMonto,
      nAlert: 1
    });

    this.fgInfoPersoBack.patchValue({
      sTipo: eInfoPerso.sTipo,
      sDocumento: eInfoPerso.sDocumento,
      sCiudad: eInfoPerso.sCiudad,
      sRegPen: eInfoPerso.sRegPen
    });

    this.mapPersonal.disabled = false;
    this.mapPersonal.open();

    // Conceptos
    await this.service.GetPersonConcept(nIdDetDP).then((response: any) => {
      if (response?.status === 200) {

        const aData = response.body.response.data as nsCalculop.IPersonConcept[];
        this.ConceptoDS = new MatTableDataSource(aData);

      }
    });

    // Estructura salarial
    this.mpdEstructuraSalarial = eInfoPerso.sTipoSalario + ' [ ' + eInfoPerso.nMonto.toFixed(2) + ' ]';

    const sEjMes = moment(this.fgInfoPeriodo.controls['dDevengue'].value).format('YYYYMM');
    await this.service.GetPersonSalary(nIdPersonal, sEjMes).then((response: any) => {
      if (response?.status === 200) {

        const aData = response.body.response.data as nsCalculop.IPersonSalary[];
        this.SalarioDS = new MatTableDataSource(aData);

        aData.forEach( x => this.nTotalSalario = this.nTotalSalario + x.nImporte);

      }
    });
    this.mapSalario.disabled = false;

    // Depositos
    await this.service.GetPersonDeposit(nIdPersonal, this.nIdDevengue).then((response: any) => {
      if (response?.status === 200) {

        const aData = response.body.response.data as nsCalculop.IPersonDeposit[];

        aData.forEach( x => this.nTotalDeposito = this.nTotalDeposito + x.nImporte);

      }
    });
    this.mapDeposito.disabled = false;

    this.spi.hide('spi_result');

  }

  getIngresos() {
    let nIngresos = 0;
    const aConceptos = this.ConceptoDS.data;
    aConceptos.filter(x => x.nValor === 1).forEach(x => nIngresos = nIngresos + x.nImporte);
    return nIngresos;
  }

  getDescuentos() {
    let nDescuentos = 0;
    const aConceptos = this.ConceptoDS.data;
    aConceptos.filter(x => x.nValor < 0).forEach(x => nDescuentos = nDescuentos + x.nImporte);
    return nDescuentos;
  }

  getTotal() {
    let nTotal = 0;
    const aConceptos = this.ConceptoDS.data;
    aConceptos.forEach(x => nTotal = nTotal + ( x.nImporte * x.nValor ));
    return nTotal;
  }

  //#endregion

}
