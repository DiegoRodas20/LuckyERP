import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ControlcService } from '../../../../Services/controlc.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import printJS from 'print-js';
import { adminpAnimations } from '../../../../Animations/adminp.animations';

@Component({
  selector: 'app-controlc-detail',
  templateUrl: './controlc-detail.component.html',
  styleUrls: ['./controlc-detail.component.css', './controlc-detail.component.scss'],
  animations: [ adminpAnimations ]
})
export class ControlcDetailComponent implements OnInit {

  @Input() fromParent;

  //#region Variables

  // Fab
  fbDetail = [
    {icon: 'print', tool: 'Generar contrato', badge: 0, dis: true}
  ];
  abDetail = [];
  tsDetail = 'inactive';

  // Progress Bar
  pbDetail: boolean;

  // Combobox
  cboPerLab = new Array();

  // FormGroup
  fgDetail: FormGroup;
  fgAdditional: FormGroup;
  fgFilter: FormGroup;

  // Parent
  aItem: any;
  dFechDevengue: Date = null;

  // Mat Table
  DetailDC: string[] = [ 'action', 'sTipoCont', 'dIniCont', 'dFinCont', 'more' ];
  DetailDS: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild('pagDetail', {static: true}) pagDetail: MatPaginator;
  expandedMore: null;

  // Print
  nIdDocumento = 0;

  //#endregion

  constructor(public activeModal: NgbActiveModal, private spi: NgxSpinnerService,
              public service: ControlcService, private fb: FormBuilder) {

    this.new_fgDetail();
    this.new_fgAdditional();
    this.new_fgFilter();
  }

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_detail');

    this.aItem = this.fromParent.aItem;
    this.dFechDevengue = this.fromParent.dFechDevengue;

    await this.loadDetail();
    await this.loadPrint();

    this.spi.hide('spi_detail');

    this.onToggleFab(1, 1);

  }

  //#region General

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = ( stat === -1 ) ? ( this.abDetail.length > 0 ) ? 0 : 1 : stat;
        this.tsDetail = ( stat === 0 ) ? 'inactive' : 'active';
        this.abDetail = ( stat === 0 ) ? [] : this.fbDetail;
        break;
    }
  }

  async clickFab(index: number) {
    switch (index) {
      case 0:

        this.pbDetail = true;

        const nIdPersonal = this.aItem.nIdPersonal;
        const nIdPlla = this.aItem.nIdPlla;
        const nIdTipoDoc = this.aItem.nIdTipoDoc;
        const nIdDocumento = this.nIdDocumento;
        const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

        const param = [];
        param.push('0¡A.nIdPersonal!' + nIdPersonal + '-0¡nIdEmp!' + nIdEmp + '-0¡nIdPlla!' + nIdPlla);
        param.push('0¡nIdTipoDoc!' + nIdTipoDoc + '-0¡nIdPlla!' + nIdPlla + '-1¡A.nIdDocumento!' + nIdDocumento);
        param.push('0¡bVigente!1');

        await this.service.print(3, param).then((result: any) => {
          let objectURL: any = URL.createObjectURL(result);
          const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;
          pdfFrame.src = '';
          pdfFrame.src = objectURL;
          objectURL = URL.revokeObjectURL(result);
        });

        break;
    }
  }

  //#endregion

  //#region FormGroup

  new_fgDetail() {
    this.fgDetail = this.fb.group({
      nIdPersonal: 0,
      nIdPerLab: 0,
      nIdPLD: null,
      sNombres: [{ value: '', disabled: true }],
      sCodPlla: [{ value: '', disabled: true }],
      sTipo: [{ value: '', disabled: true }],
      sDocumento: [{ value: '', disabled: true }],
      dFechIni: [{ value: null, disabled: true }],
      dFechFin: [{ value: null, disabled: true }],
      nEstado: 0,
      sCiudad: [{ value: '', disabled: true }],
    });
  }

  new_fgAdditional() {
    this.fgAdditional = this.fb.group({
      dIniCont: [{ value: null, disabled: true }],
      dFinCont: [{ value: null, disabled: true }],
      nTelMovil: [{ value: 0, disabled: true }],
      sCorreo: [{ value: '', disabled: true }],
      sResponsable: [{ value: '', disabled: true }],
      nTelMovil_Resp: [{ value: 0, disabled: true }],
      sOrganizacion: [{ value: '', disabled: true }],
      sCentroCosto: [{ value: '', disabled: true }]
    });
  }

  new_fgFilter() {
    this.fgFilter = this.fb.group({
      nIdPerLab: 0
    });

    this.fgFilter.valueChanges.subscribe(value => {
      const filter = {...value, name: value.nIdPerLab} as string;
      this.DetailDS.filter = filter;

      if (this.DetailDS.paginator) {
        this.DetailDS.paginator.firstPage();
      }
    });
  }

  get getDetail() { return this.fgDetail.controls; }
  get getAdditional() { return this.fgAdditional.controls; }
  get getFilter() { return this.fgFilter.controls; }

  //#endregion

  //#region Load

  async loadDetail() {

    const nIdPersonal = this.aItem.nIdPersonal;
    const nIdPerLab = this.aItem.nIdPerLab;
    let dFecha = ( ( this.aItem.dFechFin === null ) ? this.dFechDevengue : this.aItem.dFechFin ) as Date;
    dFecha = moment(dFecha).toDate();

    this.fgDetail.patchValue({
      nIdPersonal: this.aItem.nIdPersonal,
      nIdPerLab: this.aItem.nIdPerLab,
      nIdPLD: this.aItem.nIdPLD,
      sNombres: this.aItem.sNombres,
      sCodPlla: this.aItem.sCodPlla,
      sTipo: this.aItem.sDscTipo,
      sDocumento: this.aItem.sDocumento,
      dFechIni: this.aItem.dFechIni,
      dFechFin: this.aItem.dFechFin,
      nEstado: this.aItem.nEstado,
      sCiudad: this.aItem.sCiudad
    });

    this.fgAdditional.patchValue({
      dIniCont: this.aItem.dIniCont,
      dFinCont: this.aItem.dFinCont
    });

    const spFechDevengue = moment(dFecha).format('MM/DD/YYYY');

    const param = [];
    param.push('0¡nIdPersonal!' + nIdPersonal + '-' +
               '6¡spFechDevengue!' + spFechDevengue + '-' +
               '0¡A.nIdPerLab!' + nIdPerLab);

    await this.service._loadSP( 8, param).then( (value: any[]) => {
      Object.values ( value ).forEach( (lista: Array<any>, iLista: number) => {
        switch (iLista) {
          // Periodo Laboral
          case 0:
            this.cboPerLab = lista;
            this.fgFilter.controls['nIdPerLab'].setValue(nIdPerLab);
            break;

          // Histórico
          case 1:

            this.DetailDS = new MatTableDataSource(lista);
            this.DetailDS.paginator = this.pagDetail;

            this.DetailDS.filterPredicate = function(data, filter: string): boolean {
              return data.sTipoCont.trim().toLowerCase().includes(filter);
            };

            this.DetailDS.filterPredicate = ((data: any, filter: any ) => {
              // tslint:disable-next-line: max-line-length
              const a = !filter.nIdPerLab || data.nIdPerLab === filter.nIdPerLab;
              return a;
            }) as (PeriodicElement, string) => boolean;

            break;

          // Información
          case 2:
            if (lista.length > 0) {
              this.fgAdditional.patchValue({
                nTelMovil: lista[0].nTelMovil,
                sCorreo: lista[0].sCorreo,
                sResponsable: lista[0].sResponsable,
                nTelMovil_Resp: lista[0].nTelMovil_Resp,
                sOrganizacion: lista[0].sOrganizacion,
                sCentroCosto: lista[0].sCentroCosto
              });
            }
            break;
        }
      });
    });

  }

  viewDoc(item: any) {

    const sDocumento = item.sDocumento;

    this.spi.show('spi_detail');

    printJS({
      printable: sDocumento,
      type: 'pdf',
      showModal: true,
      modalMessage: 'Recuperando documento',
      onLoadingEnd: () => {
        this.spi.hide('spi_detail');
      }
    });

  }

  async loadPrint() {

    const nIdPlla = this.aItem.nIdPlla;
    const nIdTipoDoc = this.aItem.nIdTipoDoc;
    const nIdPerLab = this.aItem.nIdPerLab;
    const nEstado = this.aItem.nEstado;

    const aDetail = this.DetailDS.data;
    const aFilter = aDetail.filter( x => x.nIdPerLab === nIdPerLab );
    const nModo = ( aFilter.length > 0 ) ? 1 : 0 ;

    const param = [];
    param.push('0¡nIdPlla!' + nIdPlla);
    param.push('0¡nIdTipoDoc!' + nIdTipoDoc);
    param.push('0¡bModo!' + nModo);
    param.push('2¡nTiempo!0');

    await this.service._loadSP( 9, param).then( (value: any[]) => {
      if (value.length > 0 ) {
        this.nIdDocumento = value[0].nIdDocumento;
        this.fbDetail[0].badge = value[0].nRepeat;
      }
    });

    if ( this.nIdDocumento > 0 && nEstado !== 2287 ) {
      this.fbDetail[0].dis = false;
    }

  }

  printDoc() {
    const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;
    if (pdfFrame.src !== '') {
      this.pbDetail = false;
      pdfFrame.contentWindow.print();
    }
  }

  //#endregion

}
