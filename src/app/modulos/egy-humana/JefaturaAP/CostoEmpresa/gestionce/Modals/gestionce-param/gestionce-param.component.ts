import { Component, OnInit, Type, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { nsGestionce } from '../../../../Model/Igestionce';
import { GestionceService } from '../../../../Services/gestionce.service';
import { GestionceAddParamComponent } from '../gestionce-add-param/gestionce-add-param.component';

// Modals
const MODALS: { [name: string]: Type<any> } = {
  add: GestionceAddParamComponent
};

@Component({
  selector: 'app-gestionce-param',
  templateUrl: './gestionce-param.component.html',
  styleUrls: ['./gestionce-param.component.css', './gestionce-param.component.scss'],
  animations: [ adminpAnimations ]
})
export class GestionceParamComponent implements OnInit {

  //#region Variables

  // Modal Config
  ngbModalOptions: NgbModalOptions = {
    size: 'md',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };

  // Fab
  fbParam = [
    { icon: 'add', tool: 'Nuevo', dis: 'false' }
  ];
  abParam = [];
  tsParam = 'inactive';

  // MatTab
  tabParam = 0;

  // Mat Table
  ParamDC: string[] = ['action', 'sPlanilla', 'sGrupo', 'nPorcentaje', 'more'];
  ParamDS: MatTableDataSource<nsGestionce.IParam> = new MatTableDataSource([]);
  @ViewChild('pagParam', {static: true}) pagParam: MatPaginator;
  expandedMore = null;

  // List
  bkConcepto: nsGestionce.IConcepto[] = [];
  lConcepto: nsGestionce.IConcepto[] = [];
  lGroup: nsGestionce.IGrupo[] = [];

  // Modal Parameter
  nIdParameter: number = null;

  //#endregion

  constructor(public activeModal: NgbActiveModal, private spi: NgxSpinnerService,
              public service: GestionceService, private _modalService: NgbModal) { }

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_param');

    await this.fnGetParameter();
    await this.fnGetGroup();
    await this.fnGetConcept();

    this.spi.hide('spi_param');
    this.onToggleFab(1);
  }

  //#region General

  onToggleFab(stat: number) {
    stat = ( stat === -1 ) ? ( this.abParam.length > 0 ) ? 0 : 1 : stat;
    this.tsParam = ( stat === 0 ) ? 'inactive' : 'active';
    this.abParam = ( stat === 0 ) ? [] : this.fbParam;
  }

  clickFab(opc: number) {
    switch (this.tabParam) {
      // Costo empresa
      case 0:
        this.openModal('add');
        break;

      // Grupo
      case 1:
        break;
    }
  }

  openModal(name: string) {

    this.onToggleFab(-1);

    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);
    const obj = new Object();

    obj['aConcepto'] = this.bkConcepto;
    obj['aGrupo'] = this.lGroup;
    obj['aParameter'] = this.ParamDS.data;
    obj['nIdParameter'] = this.nIdParameter;

    switch (name) {
      case 'add':
        modalRef.componentInstance.fromParent = obj;
        break;
    }

    modalRef.result.then(async (result) => {

      switch (result.modal) {
        case 'add':
          if (result.value === 'loadAgain') {
            this.spi.show('spi_main');
            this.fnGetParameter();
            this.spi.hide('spi_main');
          }
          break;

      }

    }, (reason) => { });

    this.nIdParameter = null;
  }

  //#endregion

  //#region Parametro ( Costo Empresa )

  async fnGetParameter() {
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    await this.service.GetParameter(nIdEmp).then((response: any) => {
      if (response.status === 200) {
        const aParam = response.body.response.data as nsGestionce.IParam[];
        this.ParamDS = new MatTableDataSource(aParam);
        this.ParamDS.paginator = this.pagParam;
      }
    });
  }

  clickRow(row: nsGestionce.IParam) {
    this.nIdParameter = row.nIdPCE;
    this.openModal('add');
  }

  clickExpanded(row: nsGestionce.IParam) {
    this.lConcepto = [];

    if ( this.expandedMore === row ) {
      this.expandedMore = null;
    } else {
      const aConcepto = row.sConcepto.split(',');
      aConcepto.forEach(item => {
        const nIdConcepto = Number(item);
        const index = this.bkConcepto.findIndex(iConcepto => iConcepto.nIdConcepto === nIdConcepto );
        if ( index > -1 ) {
          this.lConcepto.push({
            nIdConcepto: nIdConcepto,
            sConcepto: this.bkConcepto[index].sConcepto
          });
        }
      });

      this.expandedMore = row;
    }
  }

  //#endregion

  //#region Parametro ( Grupo )

  async fnGetGroup() {
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));

    await this.service.GetGroup(sIdPais).then((response: any) => {
      if (response.status === 200) {
        const aGroup = response.body.response.data as nsGestionce.IGrupo[];
        this.lGroup = aGroup;
      }
    });
  }

  async fnGetConcept() {
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));

    await this.service.GetConcept(sIdPais).then((response: any) => {
      if (response.status === 200) {
        const aConcepto = response.body.response.data as nsGestionce.IConcepto[];
        this.bkConcepto = aConcepto;
      }
    });
  }

  //#endregion

}
