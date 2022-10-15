import { DecimalPipe } from '@angular/common';
import { Component, OnInit, Inject, ViewChild, Type } from '@angular/core';

import { ListaPersonal } from '../../Model/Icontrolp';
import { ControlpService } from '../../Services/controlp.service';

import { FormBuilder, FormGroup } from '@angular/forms';

import { NgxSpinnerService } from 'ngx-spinner';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ControlpNewComponent } from './Modals/controlp-new/controlp-new.component';
import { ControlpReclutComponent } from './Modals/controlp-reclut/controlp-reclut.component';
import { ControlpViewComponent } from './Modals/controlp-view/controlp-view.component';

import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { adminpAnimations } from '../../Animations/adminp.animations';
import { ValidadoresService } from '../../Validators/validadores.service';

// Utilizar javascript [1]
declare var jQuery: any;

interface Isupervisor { nIdResp_: number; sNombres: string; }

// Modals
const MODALS: {[name: string]: Type<any>} = {
  new: ControlpNewComponent,
  reclut: ControlpReclutComponent,
  view: ControlpViewComponent
};

@Component({
  selector: 'app-controlp',
  templateUrl: './controlp.component.html',
  styleUrls: ['./controlp.component.css', './controlp.component.scss'],
  providers: [ ControlpService, DecimalPipe ],
  animations: [ adminpAnimations ]
})

export class ControlpComponent implements OnInit {

  //#region Variables

  listaDC: string[] = [ 'action', 'sNombres', 'sCategoria', 'sCodPlla', 'sTipo', 'sDocumento', 'dFechIni', 'dFechFin' ];
  listaDS: MatTableDataSource<ListaPersonal>;
  @ViewChild('mtLista', {static: false}) mtLista: MatTable<any>;

  @ViewChild(MatPaginator, {static: true}) listaP: MatPaginator;
  @ViewChild(MatSort, {static: true}) listaO: MatSort;

  // Service GET && POST
  aParam = [];
  url: string;

  // Animaciones Tada
  tadaLista = 'inactive';

  // Fab
  fbLista = [
    {icon: 'person_add', tool: 'Nuevo personal'}
  ];
  abLista = [];
  tsLista = 'inactive';

  // Progress Bar
  pbLista: boolean;

  // Combobox
  cboGenero = new Array();
  cboNacion = new Array();
  cboEstadoCivil = new Array();
  cboTipoDoc = new Array();
  aUbigeo = new Array();
  cboPlanilla = new Array();
  cboTipoSP = new Array();
  aAFP = new Array();
  cboTipoCuenta = new Array();
  cboBanco = new Array();
  cboMoneda = new Array();
  cboTipoSalario = new Array();
  aConceptos = new Array();
  cboCargo = new Array();
  cboMotivoC = new Array();
  cboDireccion = new Array();
  cboArea = new Array();
  aArea = new Array();
  cboPuesto = new Array();
  aPuesto = new Array();
  cboEspecialidad = new Array();
  aEspecialidad = new Array();

  objGroup = new Object();

  // FormGroup
  fgListaP: FormGroup;

  // Array
  aSupervisor: Isupervisor[];

  // Modal
  nId: number;
  nIdDetEnv: number;

  // SignalR
  private hubConnection: signalR.HubConnection;
  idConnection: string;

  // Modal Config
  ngbModalOptions: NgbModalOptions = {
    size: 'xl',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };

  //#endregion

  constructor(public service: ControlpService, @Inject('BASE_URL') baseUrl: string,
              private fb: FormBuilder, private valid: ValidadoresService,
              private spi: NgxSpinnerService, private _snackBar: MatSnackBar,
              private _modalService: NgbModal, private snotify: SnotifyService) {

    // SERVICE GET && POST
    this.url = baseUrl;

    this.new_fgListaP();
  }

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_lista');

    await this.cboGetNacion();
    await this.cboGetGenero();
    await this.cboGetEstadoCivil();
    await this.cboGetTipoDoc();
    await this.cboGetUbigeo();
    await this.cboGetPlanilla();
    await this.cboGetCargo();
    await this.cboGetMotivoC();
    await this.cboGetTipoSP();
    await this.cboGetAFP();
    await this.cboGetTipoCuenta();
    await this.cboGetBanco();
    await this.cboGetMoneda();
    await this.cboGetTipoSalario();
    await this.cboGetConcepBase();
    await this.cboGetDireccion();
    await this.cboGetArea();
    await this.cboGetPuesto();
    await this.cboGetEspecialidad();

    this.groupObj();

    // Load
    await this.fnGetListaPersonal();

    this.spi.hide('spi_lista');
    this.animate(1);

    // SignalR
    this.hubConnection = await this.service.startConnection(this.url);
    await this.service.getIdConnection().then( (id) => {
      this.idConnection = id;
    });
    this.AtencionpSignalR();
  }

  //#region FormGroup

  new_fgListaP () {
    this.fgListaP = this.fb.group({
      sNombres: '',
      sCodPlla: '',
      sCategoria: ''
    });

    this.fgListaP.valueChanges.subscribe(value => {
      const filter = {...value, name: value.sNombres.trim().toLowerCase()} as string;
      this.listaDS.filter = filter;

      if (this.listaDS.paginator) {
        this.listaDS.paginator.firstPage();
      }
    });
  }

  get getListaP() { return this.fgListaP.controls; }

  //#endregion

  //#region General

  openModal(name: string) {

    const modalRef = this._modalService.open( MODALS[name], this.ngbModalOptions );

    const aListaPerso = new Array();
    const aListaDS = this.listaDS.data;

    switch (name) {
      case 'new':
        const oNew = new Object();
        oNew['aSupervisor'] = this.aSupervisor;

        aListaDS.forEach( x => {
          aListaPerso.push({
            sTipo: x.sTipo,
            sDocumento: x.sDocumento
          });
        });
        oNew['aPersonal'] = aListaPerso;
        oNew['objGroup'] = this.objGroup;

        modalRef.componentInstance.fromParent = oNew;
        break;

      case 'reclut':
        const oReclut = new Object();
        oReclut['nId'] = this.nId;
        oReclut['nIdDetEnv'] = this.nIdDetEnv;
        oReclut['aSupervisor'] = this.aSupervisor;
        oReclut['objGroup'] = this.objGroup;

        modalRef.componentInstance.fromParent = oReclut;
        break;

      case 'view':
        const oView = new Object();
        oView['nIdPersonal'] = this.nId;

        aListaDS.forEach( x => {
          aListaPerso.push({
            nIdPersonal: x.nId,
            sTipo: x.sTipo,
            sDocumento: x.sDocumento
          });
        });
        oView['aPersonal'] = aListaPerso;
        oView['aSupervisor'] = this.aSupervisor;
        oView['objGroup'] = this.objGroup;

        modalRef.componentInstance.fromParent = oView;
        break;
    }

    modalRef.result.then((result) => {

      switch (result.modal) {
        case 'new':
          if (result.value === 'loadAgain') {
            this.spi.show('spi_lista');
            this.fnGetListaPersonal();
            this.spi.hide('spi_lista');
          }
          break;

        case 'reclut':
          if (result.value === 'loadAgain') {

            this.spi.show('spi_lista');
            this.fnGetListaPersonal();
            this.spi.hide('spi_lista');

            const aLista = this.listaDS.data;
            const iArray = aLista.findIndex( x => x.nId === result.filter );

            if (iArray > -1 ) {
              this.fgListaP.patchValue({
                sNombres: aLista[iArray].sNombres,
                sCodPlla: '',
                sCatergoria: ''
              });
            }
          }

          if (result.value === 'addPos') {
            // Adicionar item en lista
            const nIdEnv = result.nIdEnv;
            this.fnGetAddPostu(nIdEnv);
          }

          break;

        case 'view':
          break;
      }

    }, (reason) => {});
  }

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
        this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
        this.abLista = ( stat === 0 ) ? [] : this.fbLista;
        break;
    }

  }

  clickFab(opc: number, index: number) {
    switch (opc) {
      case 1:
        switch (index) {
          case 0:
            this.openModal('new');
            break;
        }
        break;
    }
  }

  async showModal(item?: ListaPersonal) {

    if ( item !== undefined ) {
      const eCategoria = item.sCategoria;

      if ( eCategoria.toUpperCase() === 'RECLUTAMIENTO' ) {

        this.pbLista = true;

        const user = localStorage.getItem('currentUser');
        const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

        this.aParam.push('T1¡nIdUsuario!' + uid);
        this.aParam.push('T1¡nIdEnv!' + item.nId);
        this.aParam.push('T1¡dFecha!GETDATE()');
        this.aParam.push('T1¡nEstado!2258');

        this.aParam.push('W2¡nIdEnv!' + item.nId);
        this.aParam.push('S2¡nEstado!2258');

        const aResult = new Array();
        const result = await this.service._crudSP(6, this.aParam, this.url);

        Object.keys( result ).forEach ( valor => {
          aResult.push(result[valor]);
        });

        aResult.forEach( x => {
          const p1 = x.split('!')[0];
          const p2 = x.split('!')[1];

          if ( p1 !== '00' ) {
            this.nIdDetEnv = p2;
          }
        });

        this.aParam = [];

        this.nId = item.nId;
        this.openModal('reclut');

        this.pbLista = false;

      } else {
        this.nId = item.nId;
        this.openModal('view');
      }
    }
  }

  //#endregion

  //#region Combobox

  async cboGetGenero() {
    const param = [];
    param.push('0¡nElecodDad!524');
    param.push('0¡bStatus!1');

    await this.service._loadSP(3, param, this.url).then((value: any[]) => {
      this.cboGenero = value;
    });
  }

  async cboGetEstadoCivil() {
    const param = [];
    param.push('0¡nElecodDad!1449');
    param.push('0¡bStatus!1');

    await this.service._loadSP(3, param, this.url).then((value: any[]) => {
      this.cboEstadoCivil = value;
    });
  }

  async cboGetNacion() {
    const param = [];
    param.push('0¡bStatus!0');

    await this.service._loadSP(10, param, this.url).then((value: any[]) => {
      this.cboNacion = value;
    });
  }

  async cboGetTipoDoc() {
    const param = [];
    param.push('0¡bEstado!1');
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡sIdPais!' + sIdPais);

    await this.service._loadSP(13, param, this.url).then((value: any[]) => {
      this.cboTipoDoc = value;
    });
  }

  async cboGetUbigeo() {
    const param = [];
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡LEFT(cEntCod,3)!' + sIdPais);

    await this.service._loadSP(4, param, this.url).then((value: any[]) => {
      this.aUbigeo = value;
    });
  }

  async cboGetPlanilla () {
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    param.push('0¡nIdEmp!' + nIdEmp);
    param.push('0¡bEstado!1');

    await this.service._loadSP( 6, param, this.url).then( (value: any[]) => {
      this.cboPlanilla = value;
    });
  }

  async cboGetCargo() {
    const param = [];
    param.push('0¡nDadTipEle!5');
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡nIdPais!' + sIdPais);
    param.push('0¡bEstado!1');

    await this.service._loadSP(2, param, this.url).then((value: any[]) => {
      this.cboCargo = value;
    });
  }

  async cboGetMotivoC() {
    const param = [];
    param.push('0¡nDadTipEle!485');
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡nIdPais!' + sIdPais);
    param.push('0¡bEstado!1');

    await this.service._loadSP(2, param, this.url).then((value: any[]) => {
      this.cboMotivoC = value;
    });
  }

  async cboGetTipoSP() {
    const param = [];
    param.push('0¡nElecodDad!1968');
    param.push('0¡bStatus!1');

    await this.service._loadSP(3, param, this.url).then((value: any[]) => {
      this.cboTipoSP = value;
    });
  }

  async cboGetAFP() {
    const param = [];
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡sIdPais!' + sIdPais);
    param.push('0¡bEstado!1');

    await this.service._loadSP(5, param, this.url).then((value: any[]) => {
      this.aAFP = value;
    });
  }

  async cboGetTipoCuenta() {
    const param = [];
    param.push('0¡nDadTipEle!425');
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡nIdPais!' + sIdPais);

    await this.service._loadSP(2, param, this.url).then((value: any[]) => {
      this.cboTipoCuenta = value;
    });
  }

  async cboGetBanco() {
    const param = [];
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡sIdPais!' + sIdPais);

    await this.service._loadSP(11, param, this.url).then((value: any[]) => {
      this.cboBanco = value;
    });
  }

  async cboGetMoneda() {
    const param = [];
    param.push('0¡nDadTipEle!442');
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡nIdPais!' + sIdPais);

    await this.service._loadSP(2, param, this.url).then((value: any[]) => {
      this.cboMoneda = value;
    });
  }

  async cboGetTipoSalario() {
    const param = [];
    param.push('0¡nDadTipEle!518');
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡nIdPais!' + sIdPais);

    await this.service._loadSP(12, param, this.url).then((value: any[]) => {
      this.cboTipoSalario = value;
    });
  }

  async cboGetConcepBase() {
    const param = [];
    param.push('0¡nIdTipo!2166');
    param.push('10¡nValor!0');

    await this.service._loadSP(25, param, this.url).then((value: any[]) => {
      value.forEach((x) => {
        this.aConceptos.push({
          nIdConcepto: x.nIdConcepto,
          dsc: x.sDescripcion,
          dis: false,
        });
      });
    });
  }

  async cboGetDireccion () {
    const param = [];
    param.push('0¡nDadTipEle!1125');
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡nIdPais!' + sIdPais);
    param.push('0¡bEstado!1');

    await this.service._loadSP( 2, param, this.url).then( (value: any[]) => {
      this.cboDireccion = value;
    });
  }

  async cboGetArea () {
    const param = [];
    param.push('0¡nDadTipEle!1125');
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡nIdPais!' + sIdPais);
    param.push('0¡bEstado!1');

    await this.service._loadSP( 31, param, this.url).then( (value: any[]) => {
      this.aArea = value;
    });
  }

  async cboGetPuesto () {
    const param = [];
    param.push('0¡nDadTipEle!122');
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡nIdPais!' + sIdPais);

    await this.service._loadSP( 32, param, this.url).then( (value: any[]) => {
      this.aPuesto = value;
    });
  }

  async cboGetEspecialidad () {
    const param = [];
    param.push('0¡nDadTipEle!122');
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡nIdPais!' + sIdPais);

    await this.service._loadSP( 33, param, this.url).then( (value: any[]) => {
      this.aEspecialidad = value;
    });
  }

  groupObj() {
    this.objGroup['cboGenero'] = this.cboGenero;
    this.objGroup['cboEstadoCivil'] = this.cboEstadoCivil;
    this.objGroup['cboNacion'] = this.cboNacion;
    this.objGroup['cboTipoDoc'] = this.cboTipoDoc;
    this.objGroup['aUbigeo'] = this.aUbigeo;
    this.objGroup['cboPlanilla'] = this.cboPlanilla;
    this.objGroup['cboCargo'] = this.cboCargo;
    this.objGroup['cboMotivoC'] = this.cboMotivoC;
    this.objGroup['cboTipoSP'] = this.cboTipoSP;
    this.objGroup['aAFP'] = this.aAFP;
    this.objGroup['cboTipoCuenta'] = this.cboTipoCuenta;
    this.objGroup['cboBanco'] = this.cboBanco;
    this.objGroup['cboMoneda'] = this.cboMoneda;
    this.objGroup['cboTipoSalario'] = this.cboTipoSalario;
    this.objGroup['aConceptos'] = this.aConceptos;
    this.objGroup['cboDireccion'] = this.cboDireccion;
    this.objGroup['aArea'] = this.aArea;
    this.objGroup['aPuesto'] = this.aPuesto;
    this.objGroup['aEspecialidad'] = this.aEspecialidad ;
  }

  //#endregion

  //#region Load

  async fnGetListaPersonal () {
    const param = [];

    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
    param.push('0¡nIdEmp!' + nIdEmp);

    await this.service._loadSP( 1, param, this.url).then( (value: ListaPersonal[]) => {
      this.listaDS = new MatTableDataSource(value);

      this.aSupervisor = [];
      value.filter( x => {
        const a = x.sCodPlla === '1' || x.sCodPlla === '7';
        const b = x.dFechFin === null;
        return a && b;
      }).forEach( x => {
        this.aSupervisor.push({
          nIdResp_: x.nId,
          sNombres: x.sNombres
        });
      });

      this.listaDS.paginator = this.listaP;
      this.listaDS.sort = this.listaO;
      this.listaDS.filterPredicate = function(data, filter: string): boolean {
        return data.sNombres.trim().toLowerCase().includes(filter) || data.sDocumento.trim().toLowerCase().includes(filter);
      };

      this.listaDS.filterPredicate = ((data: ListaPersonal, filter: ListaPersonal ) => {
        // tslint:disable-next-line: max-line-length
        const a = !filter.sNombres || ( data.sNombres.toLowerCase().includes(filter.sNombres.toLowerCase()) || data.sDocumento.toLowerCase().includes(filter.sNombres.toLowerCase()) );
        const b = !filter.sCodPlla || data.sCodPlla.toLowerCase().includes(filter.sCodPlla);
        const c = !filter.sCategoria || data.sCategoria.toLowerCase().includes(filter.sCategoria);
        return a && b && c;
      }) as (PeriodicElement, string) => boolean;
    });

  }

  async fnGetAddPostu (nIdEnv: number) {

    const aParam = [];
    aParam.push('0¡nIdEnv!' + nIdEnv);

    await this.service._loadSP(28, aParam, this.url).then( (value: ListaPersonal[]) => {

      const nId = value[0].nId;

      const aData = this.listaDS.data;
      const iData = aData.findIndex( x => x.nId === nId );
      if ( iData === -1 ) {
        aData.push(value[0]);
      }

      this.listaDS.data = aData;
      this.listaDS.paginator = this.listaP;
      this.mtLista.renderRows();

    });

  }

  //#endregion

  //#region Extra

  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms)).then();
  }

  animate(nTada: number) {
    switch (nTada) {
      case 1:
        this.tadaLista = 'active';
        break;
    }

    this.delay(2000).then(any => {
      switch (nTada) {
        case 1:
          this.tadaLista = 'inactive';
          break;
      }
    });
  }

  //#endregion

  //#region Notificacion

  AtencionpSignalR = () => {
    this.hubConnection.on('Atencionp_To_ControlP', data => {

        const nId = data.nId;
        const sNombres = data.sNombres as string;

        this.snotify.confirm('Trabajador : ' + sNombres.trim(), 'Nuevo ingreso', {
          // timeout: -1,
          // showProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          position: SnotifyPosition.leftBottom,
          buttons: [
            {text: 'Atender', action: async (toast) => {

              this.pbLista = true;

              // Actualizar postulación
              const user = localStorage.getItem('currentUser');
              const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

              this.aParam.push('T1¡nIdUsuario!' + uid);
              this.aParam.push('T1¡nIdEnv!' + nId);
              this.aParam.push('T1¡dFecha!GETDATE()');
              this.aParam.push('T1¡nEstado!2258');

              this.aParam.push('W2¡nIdEnv!' + nId);
              this.aParam.push('S2¡nEstado!2258');

              const aResult = new Array();
              const result = await this.service._crudSP(6, this.aParam, this.url);

              Object.keys( result ).forEach ( valor => {
                aResult.push(result[valor]);
              });

              aResult.forEach( x => {
                const p1 = x.split('!')[0];
                const p2 = x.split('!')[1];

                if ( p1 !== '00' ) {
                  this.nIdDetEnv = p2;
                }
              });

              this.aParam = [];

              this.snotify.remove(toast.id);

              this.nId = nId;
              this.openModal('reclut');

              this.pbLista = false;

            }, bold: true },
            {text: 'Cerrar', action: (toast) => {

              // Adicionar item en lista
              this.fnGetAddPostu(nId);
              this.snotify.remove(toast.id);

            }, bold: false},
          ]
        });

    });
  }

  //#endregion

}
