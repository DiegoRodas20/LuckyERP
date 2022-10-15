import { Component, OnInit, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { GestioncService } from '../../Services/gestionc.service';
import * as moment from 'moment';
import { GestioncDetailComponent } from './Modals/gestionc-detail/gestionc-detail.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { adminpAnimations } from '../../Animations/adminp.animations';

// Modals
const MODALS: { [name: string]: Type<any> } = {
  detail: GestioncDetailComponent
};

@Component({
  selector: 'app-gestionc',
  templateUrl: './gestionc.component.html',
  styleUrls: ['./gestionc.component.css', './gestionc.component.scss'],
  providers: [ GestioncService ],
  animations: [ adminpAnimations ]
})
export class GestioncComponent implements OnInit {

  //#region Variables

  // Fab
  fbMain = [
    {icon: 'date_range', tool: 'Visor macro'}
  ];
  abMain = [];
  tsMain = 'inactive';

  // Animaciones Tada
  tadaMain = 'inactive';

  // Progress Bar
  pbMain: boolean;

  // FormGroup
  fgMain: FormGroup;
  fgInfoPerso: FormGroup;

  // Combobox
  cboPlanilla = new Array();
  cboEstado = new Array();

  // Mat Table
  MainDC: string[] = [ 'action', 'sNombres', 'sCodPlla', 'sTipo', 'sDocumento', 'dFinCont', 'sEstado', 'sObservacion' ];
  MainDS: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild('pagMain', {static: true}) pagMain: MatPaginator;

  // Modal Config
  ngbModalOptions: NgbModalOptions = {
    size: 'xl',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };

  // Modal
  aItem: any;

  //#endregion

  constructor(public service: GestioncService, private fb: FormBuilder,
              private spi: NgxSpinnerService, private _snackBar: MatSnackBar,
              private _modalService: NgbModal) {

    this.new_fgInforPerso();
    this.new_fgMain();
  }

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_main');

    await this.cboGetPlanilla();
    await this.cboGetEstado();

    const user = localStorage.getItem('currentUser');
    const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

    const param = [];
    param.push('0¡nCodUser!' + uid);

    await this.service._loadSP( 1, param).then( async (value: any[]) => {
      if ( value.length > 0 ) {

        this.fgInfoPerso.patchValue({
          nIdPersonal: value[0].nIdPersonal,
          sNombres: value[0].sNombres,
          sTipo: value[0].sTipo,
          sDocumento: value[0].sDocumento,
        });

      } else {
        this._snackBar.open('Usuario no cuenta con relación de personal.', 'Cerrar', {
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      }
    });

    await this.loadMain();

    this.spi.hide('spi_main');
    this.animate(1);

  }

  //#region General

  openModal(name: string) {

    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);
    const obj = new Object();

    switch (name) {
      case 'detail':
        obj['aItem'] = this.aItem;
        modalRef.componentInstance.fromParent = obj;
        break;
    }

    modalRef.result.then(async (result) => {

      switch (result.modal) {
        case 'detail':
          if (result.value > 0) {

            this.spi.show('spi_main');
            await this.loadMain();
            this.spi.hide('spi_main');

          }
          break;
      }

    }, (reason) => { });

  }

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = ( stat === -1 ) ? ( this.abMain.length > 0 ) ? 0 : 1 : stat;
        this.tsMain = ( stat === 0 ) ? 'inactive' : 'active';
        this.abMain = ( stat === 0 ) ? [] : this.fbMain;
        break;
    }
  }

  clickFab(opc: number, index: number) {
    switch (opc) {
      case 1:
        break;
    }
  }

  //#endregion

  //#region FormGroup

  new_fgInforPerso() {
    this.fgInfoPerso = this.fb.group({
      nIdPersonal: 0,
      sNombres: '',
      sTipo: '',
      sDocumento: '',
    });
  }

  new_fgMain() {
    this.fgMain = this.fb.group({
      sNombres: '',
      sCodPlla: '',
      nEstado: 0
    });

    this.fgMain.valueChanges.subscribe(value => {
      const filter = {...value, name: value.sNombres.trim().toLowerCase()} as string;
      this.MainDS.filter = filter;

      if (this.MainDS.paginator) {
        this.MainDS.paginator.firstPage();
      }
    });
  }

  get getInfoPerso() { return this.fgInfoPerso.controls; }
  get getMain() { return this.fgMain.controls; }

  //#endregion

  //#region Combobox

  async cboGetPlanilla () {
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    param.push('0¡nIdEmp!' + nIdEmp);
    param.push('0¡bEstado!1');

    await this.service._loadSP( 3, param).then( (value: any[]) => {
      this.cboPlanilla = value;
    });
  }

  async cboGetEstado () {
    const param = [];
    param.push('0¡nEleCodDad!2286');

    await this.service._loadSP( 4, param).then( (value: any[]) => {
      this.cboEstado = value;
    });
  }

  getDescEstado(nEleCod: number) {
    let sDesc = '';
    const iArray = this.cboEstado.findIndex( x => x.nEleCod === nEleCod );
    if (iArray > -1) {
      sDesc = this.cboEstado[iArray].cEleNam;
    }
    return sDesc;
  }

  //#endregion

  //#region Load

  async loadMain() {
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
    const nIdResp = this.fgInfoPerso.controls['nIdPersonal'].value;

    param.push('0¡A.nIdEmp!' + nIdEmp);
    param.push('0¡K.nIdResp!' + nIdResp);

    await this.service._loadSP( 2, param).then( async (value: any[]) => {

      const aMainDS = [];

      value.forEach( x => {
        aMainDS.push({
          nIdPersonal: x.nIdPersonal,
          nIdPerLab: x.nIdPerLab,
          sNombres: x.sNombres,
          sCodPlla: x.sCodPlla,
          sTipo: x.sTipo,
          sDscTipo: x.sDscTipo,
          sDocumento: x.sDocumento,
          dFechIni: x.dFechIni,
          dFechFin: x.dFechFin,
          sCiudad: x.sCiudad,
          dIniCont: x.dIniCont,
          dFinCont: x.dFinCont,
          nEstado: 0,
          nIdPLD: x.nIdPLD,
          sObservacion: x.sObservacion
        });
      });

      // Evaluamos el contrato del personal
      aMainDS.forEach( x => {
        if (x.dIniCont === null) {

          // Sin contrato
          x.nEstado = 2288;

        } else {

          const dIniCont = x.dIniCont as Date;
          const dFinCont = x.dFinCont as Date;

          const nFinCont = Number(moment(dFinCont).format('YYYYMMDD'));

          const dIniMonth = moment().startOf('month').toDate();
          const dFinMonth = moment().endOf('month').add(-1, 'days').toDate();

          const dIniNextMonth = moment(dFinMonth).add(1, 'day').toDate();
          const dFinNextMonth = moment(dIniNextMonth).add(1, 'month').add(-1, 'day').toDate();

          const nIniNextMonth = Number(moment(dIniNextMonth).format('YYYYMMDD'));
          const nFinNextMonth = Number(moment(dFinNextMonth).format('YYYYMMDD'));

          if ( nFinCont >= nIniNextMonth && nFinCont <= nFinNextMonth ) {
            // Por vencer
            x.nEstado = 2289;
          }

          if ( Number(moment().format('YYYYMMDD')) > nFinCont ) {
            // Vencido
            x.nEstado = 2290;
          }

          if (x.nEstado === 0) {
            // Vigente
            x.nEstado = 2287;
          }

        }
      });

      this.MainDS = new MatTableDataSource(aMainDS);
      this.MainDS.paginator = this.pagMain;

      this.MainDS.filterPredicate = function(data, filter: string): boolean {
        return data.sNombres.trim().toLowerCase().includes(filter);
      };

      this.MainDS.filterPredicate = ((data: any, filter: any ) => {
        // tslint:disable-next-line: max-line-length
        const a = !filter.sNombres || ( data.sNombres.toLowerCase().includes(filter.sNombres.toLowerCase()) || data.sDocumento.toLowerCase().includes(filter.sNombres.toLowerCase()) );
        const b = !filter.sCodPlla || data.sCodPlla.toLowerCase().includes(filter.sCodPlla);
        const c = !filter.nEstado || data.nEstado === filter.nEstado;
        return a && b && c;
      }) as (PeriodicElement, string) => boolean;

    });

  }

  viewDetail(element: any) {
    this.aItem = element;
    this.openModal('detail');
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
