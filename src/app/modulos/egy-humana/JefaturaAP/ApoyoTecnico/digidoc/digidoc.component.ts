import { Component, OnInit, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { DigidocService } from '../../Services/digidoc.service';
import { DigidocSearchComponent } from './Modals/digidoc-search/digidoc-search.component';
import { DigidocScannerComponent } from './Modals/digidoc-scanner/digidoc-scanner.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import * as moment from 'moment';
import { adminpAnimations } from '../../Animations/adminp.animations';

// Modals
const MODALS: { [name: string]: Type<any> } = {
  search: DigidocSearchComponent,
  scanner: DigidocScannerComponent
};

@Component({
  selector: 'app-digidoc',
  templateUrl: './digidoc.component.html',
  styleUrls: ['./digidoc.component.css', './digidoc.component.scss'],
  providers: [ DigidocService ],
  animations: [ adminpAnimations ]
})
export class DigidocComponent implements OnInit {

  //#region Variables
  expandedMore: any = null;

  // Fab
  fbMain = [
    {icon: 'person_search', tool: 'Buscar personal'},
    {icon: 'qr_code_scanner', tool: 'Digitalizar'}
  ];
  abMain = [];
  tsMain = 'inactive';

  // Animation
  tadaMain = 'inactive';

  // Progress Bar
  pbMain: boolean;

  // FormGroup
  fgMain: FormGroup;
  fgFilter: FormGroup;

  // Periodo laboral
  nIdPerLab: number;

  // Mat Table
  DocDC: string[] = [ 'view', 'sDocumento', 'more' ];
  DocDS: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild('pagDoc', {static: true}) pagDoc: MatPaginator;

  PerLabDC: string[] = [ 'action', 'dFechIni', 'dFechFin' ];
  PerLabDS: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild('pagPerLab', {static: true}) pagPerLab: MatPaginator;

  ExpandedDC: string[] = [ 'position', 'dFechIni', 'dFechFin', 'action' ];
  ExpandedDS: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild('mtExpanded', {static: false}) mtExpanded: MatTable<any>;
  @ViewChild('pagExpanded', {static: true}) pagExpanded: MatPaginator;

  BackupDS: MatTableDataSource<any> = new MatTableDataSource([]);

  // Combobox
  cboTipoDoc = new Array();

  // Modal Config
  ngbModalOptions: NgbModalOptions = {
    size: 'xl',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };

  // Expansion panel
  disabled_Filtro = true;
  @ViewChild('maMain', {static: true}) maMain: MatAccordion;
  @ViewChild('mep_filtro') mep_filtro: MatExpansionPanel;

  // Url
  urlDocumento = '';

  // Titulo
  sDocumento = '';

  //#endregion

  constructor(public service: DigidocService, private fb: FormBuilder,
              private spi: NgxSpinnerService, private _modalService: NgbModal,
              private _snackBar: MatSnackBar) {

    this.new_fgMain();
    this.new_fgFilter();

  }

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_main');

    await this.cboGetTipoDoc();
    await this.loadDocumentos();

    this.spi.hide('spi_main');

    this.animate(1);

  }

  //#region FormGroup

  new_fgMain() {
    this.fgMain = this.fb.group({
      nIdPersonal: 0,
      nIdPerLab: 0,
      sNombres: [{ value: '', disabled: true }],
      sCodPlla: [{ value: '-', disabled: true }],
      sTipo: [{ value: '', disabled: true }],
      sDocumento: [{ value: '', disabled: true }],
      dFechIni: [{ value: null, disabled: true }],
      dFechFin: [{ value: null, disabled: true }],
      sCiudad: [{ value: '', disabled: true }],
    });
  }

  new_fgFilter() {
    this.fgFilter = this.fb.group({
      nIdTipo: 0,
      sDocumento: ''
    });

    this.fgFilter.valueChanges.subscribe(value => {
      const filter = {...value, name: value.sDocumento} as string;
      this.DocDS.filter = filter;

      if (this.DocDS.paginator) {
        this.DocDS.paginator.firstPage();
      }
    });
  }

  get getMain() { return this.fgMain.controls; }
  get getFilter() { return this.fgFilter.controls; }

  get getPerLab() {
    let sPerLab = '';

    const aPerLab = this.PerLabDS.data;
    const iArray = aPerLab.findIndex( x => x.nIdPerLab === this.nIdPerLab );

    if (iArray > -1 ) {

      const sFechIni = moment(aPerLab[iArray].dFechIni).format('DD/MM/YYYY');

      const dFechFin = aPerLab[iArray].dFechFin;
      const sFechFin = ( dFechFin === null ) ? 'Actualidad' : moment(dFechFin).format('DD/MM/YYYY') ;

      sPerLab = 'Desde : ' + sFechIni + ' - Hasta : ' + sFechFin;
    }

    return sPerLab;
  }

  //#endregion

  //#region Combobox

  async cboGetTipoDoc () {
    const param = [];
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));

    param.push('6¡sIdPais!' + sIdPais);

    await this.service._loadSP( 1, param).then( (value: any[]) => {
      this.cboTipoDoc = value;
    });
  }

  //#endregion

  //#region General

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = ( stat === -1 ) ? ( this.abMain.length > 0 ) ? 0 : 1 : stat;
        this.tsMain = ( stat === 0 ) ? 'inactive' : 'active';
        this.abMain = ( stat === 0 ) ? [] : this.fbMain;
        break;
    }
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.ngbModalOptions.size = 'lg';
        this.openModal('search');
        break;

      case 1:
        this.openModal('scanner');
        break;
    }
  }

  openModal(name: string) {

    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);

    modalRef.result.then((result) => {

      switch (result.modal) {
        case 'search':
          if (result.value === 'select') {
            this.selectPerson(result.item);
            this.onToggleFab(1, 0);
          }
          break;
      }

    }, (reason) => { });

  }

  //#endregion

  //#region Load

  async loadDocumentos() {
    const param = [];
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));

    param.push('6¡sIdPais!' + sIdPais);

    await this.service._loadSP( 2, param).then( (value: any[]) => {
      this.DocDS = new MatTableDataSource(value);
      this.DocDS.paginator = this.pagDoc;

      this.DocDS.filterPredicate = function(data, filter: string): boolean {
        return data.sDocumento.trim().toLowerCase().includes(filter);
      };

      this.DocDS.filterPredicate = ((data: any, filter: any ) => {
        // tslint:disable-next-line: max-line-length
        const a = !filter.nIdTipo || data.nIdTipo === filter.nIdTipo;
        const b = !filter.sDocumento || data.sDocumento.toLowerCase().includes(filter.sDocumento);
        return a && b;
      }) as (PeriodicElement, string) => boolean;

    });
  }

  async selectPerson(item: any) {

    this.fgMain.patchValue({
      nIdPersonal: item.nIdPersonal,
      nIdPerLab: item.nIdPerLab,
      sNombres: item.sNombres,
      sCodPlla: item.sCodPlla,
      sTipo: item.sDscTipo,
      sDocumento: item.sDocumento,
      dFechIni: item.dFechIni,
      dFechFin: item.dFechFin,
      sCiudad: item.sCiudad,
    });

    this.nIdPerLab = item.nIdPerLab;

    const param = [];
    param.push('0¡nIdPersonal!' + item.nIdPersonal);

    await this.service._loadSP( 6, param).then( (value: any[]) => {
      Object.values ( value ).forEach( (lista: Array<any>, iLista: number) => {
        switch (iLista) {

          // Periodo Laboral
          case 0:
            this.PerLabDS = new MatTableDataSource(lista);
            this.PerLabDS.paginator = this.pagPerLab;
            break;

          // Documentos
          case 1:
            this.BackupDS = new MatTableDataSource(lista);
            break;

        }
      });
    });

    this.disabled_Filtro = false;
    this.maMain.openAll();
    this.mep_filtro.open();

    this.sDocumento = '';
    this.urlDocumento = '';
  }

  btnPerLab(nIdPerLab: number) {
    this.nIdPerLab = nIdPerLab;
  }

  btnViewDoc(item: any, index: number) {

    this.pbMain = true;

    let nId = 0;
    let sUrl = '';

    const aDoc = this.DocDS.data;
    const iDoc = aDoc.findIndex( x => x.nIdDocumento === item.nIdDocumento );
    this.sDocumento = aDoc[iDoc].sDocumento;

    switch (item.nIdDocumento) {
      case 30:
        nId = this.fgMain.controls['nIdPersonal'].value;
        break;

      default:
        nId = this.nIdPerLab;
        break;
    }

    const aData = this.BackupDS.data;

    const aFilter = aData.filter( x => {
      const a = x.nIdDocumento === item.nIdDocumento;
      const b = x.nIdPerLab === nId;
      return a && b;
    });

    if (aFilter[index] !== undefined) {
      sUrl = aFilter[index].sDocumento;
    } else {
      this._snackBar.open('No se encuentra documento.', 'Cerrar', {
        horizontalPosition: 'right',
        verticalPosition: 'top',
        duration: 2500
      });
    }

    this.urlDocumento = sUrl;

    this.pbMain = false;

  }

  clickExpanded(row: any) {
    if ( this.expandedMore === row ) {
      // Limpiar
      this.expandedMore = null;
      this.ExpandedDS = new MatTableDataSource([]);

      if (this.ExpandedDS.paginator) {
        this.ExpandedDS.paginator.firstPage();
      }

    } else {

      let nId = 0;
      switch (row.nIdDocumento) {
        case 30:
          nId = this.fgMain.controls['nIdPersonal'].value;
          break;

        default:
          nId = this.nIdPerLab;
          break;
      }

      const aData = this.BackupDS.data;
      const aFilter = aData.filter( x => {
        const a = x.nIdPerLab === nId;
        const b = x.nIdDocumento === row.nIdDocumento;
        return a && b;
      });

      this.ExpandedDS = new MatTableDataSource(aFilter);
      this.ExpandedDS.paginator = this.pagExpanded;

      this.expandedMore = row;
      this.mtExpanded.renderRows();
    }
  }

  //#endregion

  //#region Extra

  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms)).then();
  }

  animate(nTada: number) {
    switch (nTada) {
      case 1:
        this.tadaMain = 'active';
        break;
    }

    this.delay(2000).then(any => {
      switch (nTada) {
        case 1:
          this.tadaMain = 'inactive';
          break;
      }
    });
  }

  //#endregion

}
