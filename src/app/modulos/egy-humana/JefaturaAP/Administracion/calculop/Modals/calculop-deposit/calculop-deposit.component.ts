import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { CalculopService } from '../../../../Services/calculop.service';
import { MatTableDataSource } from '@angular/material/table';
import { nsCalculop } from '../../../../Model/Icalculop';
import * as moment from 'moment';
import { MatPaginator } from '@angular/material/paginator';
import { MatExpansionPanel } from '@angular/material/expansion';

@Component({
  selector: 'app-calculop-deposit',
  templateUrl: './calculop-deposit.component.html',
  styleUrls: ['./calculop-deposit.component.css', './calculop-deposit.component.scss'],
  animations: [ adminpAnimations ]
})
export class CalculopDepositComponent implements OnInit {

  @Input() fromParent;

  //#region Variables

  sBancoClick = '';
  sFechaPago = '';
  urlSustento = '';

  // Fab
  fbDeposit = [
    {icon: 'save', tool: 'Guardar', dis: true}
  ];
  abDeposit = [];
  tsDeposit = 'inactive';

  // Progress Bar
  pbDeposit: boolean;

  // FormGroup
  fgDeposit: FormGroup;

  // FormControl
  fcFilter: FormControl;

  // MatTable
  dsDeposit: MatTableDataSource<any> = new MatTableDataSource([]);
  dcDeposit: string[] = [ 'action', 'sBanco', 'nCantPerso', 'nTotal', 'nEstado' ];

  dsLista: MatTableDataSource<any> = new MatTableDataSource([]);
  dcLista: string[] = [ 'sNombres', 'sTipo', 'sDocumento', 'nImporte' ];
  @ViewChild('pagLista', { static: true }) pagLista: MatPaginator;

  // MatExpansionPanel
  @ViewChild('mapSustento', { static: true }) mapSustento: MatExpansionPanel;
  @ViewChild('mapLista', { static: true }) mapLista: MatExpansionPanel;

  // Parent
  nIdDevengue = 0;
  nIdPeriodo = 0;
  nIdPlla = 0;

  //#endregion

  constructor(public activeModal: NgbActiveModal, private spi: NgxSpinnerService,
              public service: CalculopService, private fb: FormBuilder) {

    this.new_fgDeposit();
    this.new_fcFilter();
  }

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_deposit');

    this.nIdDevengue = this.fromParent.objParameter.nIdDevengue;
    this.nIdPeriodo = this.fromParent.objParameter.nIdPeriodo;
    this.nIdPlla = this.fromParent.objParameter.nIdPlla;

    await this.loadDepositInfo();
    await this.loadDepositBank();

    this.spi.hide('spi_deposit');

    this.onToggleFab(1);
  }

  //#region General

  onToggleFab(stat: number) {
    stat = ( stat === -1 ) ? ( this.abDeposit.length > 0 ) ? 0 : 1 : stat;
    this.tsDeposit = ( stat === 0 ) ? 'inactive' : 'active';
    this.abDeposit = ( stat === 0 ) ? [] : this.fbDeposit;
  }

  closeDeposit() {

    const oReturn = new Object();
    oReturn['modal'] = 'deposit';

    this.activeModal.close(oReturn);

  }

  clickFab(opc: number) {
  }

  //#endregion

  //#region FormGroup

  new_fgDeposit() {
    this.fgDeposit = this.fb.group({
      nIdDevengue: 0,
      dDevengue: [{ value: null, disabled: true }],
      nIdPeriodo: 0,
      sPeriodo: [{ value: '', disabled: true }],
      nIdPlla: 0,
      sPlanilla: [{ value: '', disabled: true }],
      sUsuario: [{ value: '', disabled: true }],
      dtReg: [{ value: null, disabled: true }],
      nCantPerso: [{ value: 0, disabled: true }],
      nTotal: [{ value: 0, disabled: true }]
    });
  }

  //#endregion

  //#region FormControl

  new_fcFilter() {
    this.fcFilter = new FormControl('');

    this.fcFilter.valueChanges.subscribe(value => {
      this.dsLista.filter = value;

      if (this.dsLista.paginator) {
        this.dsLista.paginator.firstPage();
      }

    });
  }

  //#endregion

  //#region Load

  async loadDepositInfo() {
    await this.service.GetPeriodDeposit(this.nIdDevengue, this.nIdPeriodo, this.nIdPlla).then((response: any) => {
      if (response?.status === 200) {

        const aData = response.body.response.data as nsCalculop.IDepositInfo[];

        const nEjercicio = aData[0].nEjercicio;
        const sEjercicio = nEjercicio.toString();

        const nMes = aData[0].nMes;
        let sMes = nMes.toString();
        sMes = (sMes.length === 1) ? '0' + sMes : sMes;
        const sFecha = '01/' + sMes + '/' + sEjercicio;

        moment.locale('es');
        const dFecha = moment(sFecha, 'DD/MM/YYYY');

        const dtReg = aData[0].dtReg;
        const sReg = moment(dtReg).format('DD/MM/YYYY hh:mm:ss a');


        this.fgDeposit.patchValue({
          nIdDevengue: aData[0].nIdDevengue,
          dDevengue: dFecha,
          nIdPeriodo: aData[0].nIdPeriodo,
          sPeriodo: aData[0].sPeriodo,
          nIdPlla: aData[0].nIdPlla,
          sPlanilla: aData[0].sPlanilla,
          sUsuario: aData[0].sUsuario,
          dtReg: sReg
        });

      }
    });
  }

  async loadDepositBank() {
    await this.service.GetDepositBank(this.nIdDevengue, this.nIdPeriodo, this.nIdPlla).then((response: any) => {
      if (response?.status === 200) {

        const aData = response.body.response.data as nsCalculop.IDepositBank[];
        this.dsDeposit = new MatTableDataSource(aData);

        let nCantPerso = 0;
        let nTotal = 0;

        aData.forEach(x => {
          nCantPerso = nCantPerso + x.nCantPerso;
          nTotal = nTotal + x.nTotal;

          if (x.nEstado === 0) {
            x.nEstado = (x.bExport === false) ? 1 : x.nEstado;
          }
        });

        this.fgDeposit.controls['nCantPerso'].setValue(nCantPerso);
        this.fgDeposit.controls['nTotal'].setValue(nTotal);

      }
    });
  }

  async ClickBanco(row: nsCalculop.IDepositBank) {
    this.spi.show('spi_deposit');

    this.sBancoClick = row.sBanco;
    this.fcFilter.setValue('');

    await this.loadDepositList(row.nIdDepPer, row.nIdBanco);

    this.mapSustento.close();
    this.mapSustento.disabled = ( row.sFileSustento === null ) ? true : false;
    this.sFechaPago = ( row.dtReg === null ) ? '' : moment(row.dtReg).format('DD/MM/YYYY hh:mm:ss a');
    this.urlSustento = ( row.sFileSustento === null ) ? '' : row.sFileSustento;

    this.spi.hide('spi_deposit');
  }

  async loadDepositList(nIdDepPer: number, nIdBanco: number) {
    await this.service.GetDepositList(nIdDepPer, nIdBanco).then((response: any) => {
      if (response?.status === 200) {

        const aData = response.body.response.data as nsCalculop.IDepositList[];
        this.dsLista = new MatTableDataSource(aData);
        this.dsLista.paginator = this.pagLista;

        this.dsLista.filterPredicate = function(data, filter: string): boolean {
          return data.sNombres.trim().toLowerCase().includes(filter);
        };

        this.dsLista.filterPredicate = ((data: nsCalculop.IDepositList, filter: any ) => {
          // tslint:disable-next-line: max-line-length
          const a = !filter || ( data.sNombres.toLowerCase().includes(filter.toLowerCase()) || data.sDocumento.toLowerCase().includes(filter.toLowerCase()) );
          return a;
        }) as (PeriodicElement, string) => boolean;

      }
    });
  }

  //#endregion

}
