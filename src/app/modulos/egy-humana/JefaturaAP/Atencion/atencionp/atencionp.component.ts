import { Component, OnInit, Type } from '@angular/core';
import { AtencionpService } from '../../Services/atencionp.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { nsAtencionp } from '../../Model/Iatencionp';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AtencionpSearchComponent } from './Modals/atencionp-search/atencionp-search.component';
import { AtencionpBoletasComponent } from './Modals/atencionp-boletas/atencionp-boletas.component';
import { AtencionpRenunciaComponent } from './Modals/atencionp-renuncia/atencionp-renuncia.component';

import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { AtencionpRemuneracionesComponent } from './Modals/atencionp-remuneraciones/atencionp-remuneraciones.component';
import { AtencionpDescuentosComponent } from './Modals/atencionp-descuentos/atencionp-descuentos.component';
import { adminpAnimations } from '../../Animations/adminp.animations';
import { ValidadoresService } from '../../Validators/validadores.service';

declare var jQuery: any;

// Modals
const MODALS: { [name: string]: Type<any> } = {
  search: AtencionpSearchComponent,
  boletas: AtencionpBoletasComponent,
  renuncia: AtencionpRenunciaComponent,
  remuneraciones: AtencionpRemuneracionesComponent,
  descuentos: AtencionpDescuentosComponent
};

@Component({
  selector: 'app-atencionp',
  templateUrl: './atencionp.component.html',
  styleUrls: ['./atencionp.component.css', './atencionp.component.scss'],
  providers: [AtencionpService],
  animations: [adminpAnimations]
})
export class AtencionpComponent implements OnInit {

  //#region Variables
  aParam = [];

  // Animaciones Tada
  tadaMain = 'inactive';

  // Fab
  fbMain = [
    { icon: 'person_search', tool: 'Buscar personal' }
  ];
  fbMain2 = [
    { icon: 'print', tool: 'Imprimir' },
    { icon: 'monetization_on', tool: 'Remuneración' },
    { icon: 'info', tool: 'Descuentos' },
    { icon: 'receipt_long', tool: 'Boletas' },
    { icon: 'person_remove', tool: 'Renuncia' },
    { icon: 'cleaning_services', tool: 'Limpiar' },
  ];
  abMain = [];
  tsMain = 'inactive';

  // Progress Bar
  pbSearch: boolean;
  pbMain: boolean;

  // FormGroup
  fgInfo: FormGroup;

  // Array
  aDocuments = new Array();

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

  constructor(private atencionService: AtencionpService,
    private fb: FormBuilder, private spi: NgxSpinnerService,
    private valid: ValidadoresService, private _modalService: NgbModal,
    private snotify: SnotifyService) {

    this.new_fgInfo();
  }

  //#region FormGroup

  new_fgInfo() {
    this.fgInfo = this.fb.group({
      nIdPersonal: 0,
      nIdTipoDoc: [{ value: 0 }],
      sTipoDoc: [{ value: '', disabled: true }],
      sDocumento: [{ value: '', disabled: true }],
      sNombres: [{ value: '', disabled: true }],
      nIdPlla: [{ value: 0 }],
      sCodPlla: [{ value: '', disabled: true }],
      dFechIni: [{ value: null, disabled: true }],
      dFechFin: [{ value: null, disabled: true }]
    });
  }

  //#endregion

  //#region General

  openModal(name: string) {

    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);

    const obj = new Object();
    const nIdPersonal = this.fgInfo.controls['nIdPersonal'].value;
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    switch (name) {
      case 'search':
        break;

      case 'boletas':
        obj['nIdPersonal'] = nIdPersonal;
        obj['nIdEmp'] = nIdEmp;

        modalRef.componentInstance.fromParent = obj;
        break;

      case 'renuncia':
        obj['nIdPersonal'] = nIdPersonal;

        modalRef.componentInstance.fromParent = obj;
        break;

      case 'remuneraciones':
        obj['nIdPersonal'] = nIdPersonal;
        obj['nIdEmp'] = nIdEmp;

        modalRef.componentInstance.fromParent = obj;
        break;

      case 'descuentos':
        obj['nIdPersonal'] = nIdPersonal;
        obj['nIdEmp'] = nIdEmp;

        modalRef.componentInstance.fromParent = obj;
        break;
    }

    modalRef.result.then((result) => {

      switch (result.modal) {
        case 'search':
          if (result.value === 'select') {
            this.selectPerson(result.item);
          }
          break;
      }

    }, (reason) => { });
  }

  onToggleFab(fab: number, stat: number) {
    // debugger

    switch (fab) {
      case 1:

        if (stat === -1) {
          if (this.abMain.length > 0) {
            stat = 0;
          } else {
            const nIdPersonal = this.fgInfo.controls['nIdPersonal'].value;
            stat = (nIdPersonal === 0 || nIdPersonal === null) ? 1 : 2;
          }
        }

        this.tsMain = (stat === 0) ? 'inactive' : 'active';

        switch (stat) {
          case 0:
            this.abMain = [];
            break;
          case 1:
            this.abMain = this.fbMain;
            break;
          case 2:
            this.abMain = this.fbMain2;
            break;
        }
        break;
    }
  }

  async clickFab(opc: number, index: number) {

    const self = this;
    switch (opc) {
      case 1:

        if (this.abMain.length === 1) {
          this.ngbModalOptions.size = 'lg';
          this.openModal('search');
        } else {
          switch (index) {
            // Imprimir
            case 0:
              this.pbMain = true;

              const param = [];

              // Obtener tipos de documento a imprimir
              // debugger

              let nIdDocumento = '';
              this.aDocuments.forEach((value: any, _index: number) => {
                if (this.aDocuments[_index].nCheckDoc === 1) {
                  nIdDocumento = nIdDocumento + this.aDocuments[_index].nIdDocumento + ',';
                }
              });
              nIdDocumento = nIdDocumento.substring(0, nIdDocumento.length - 1);

              const nIdPersonal = this.fgInfo.controls['nIdPersonal'].value;
              const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
              const nIdPlla = this.fgInfo.controls['nIdPlla'].value;
              const nIdTipoDoc = this.fgInfo.controls['nIdTipoDoc'].value;

              param.push('0¡A.nIdPersonal!' + nIdPersonal + '-0¡nIdEmp!' + nIdEmp + '-0¡nIdPlla!' + nIdPlla);
              param.push('0¡nIdTipoDoc!' + nIdTipoDoc + '-0¡nIdPlla!' + nIdPlla + '-1¡A.nIdDocumento!' + nIdDocumento);
              param.push('0¡bVigente!1');

              await this.atencionService.print(3, param).then((result: any) => {
                let objectURL: any = URL.createObjectURL(result);
                const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;
                pdfFrame.src = '';
                pdfFrame.src = objectURL;
                objectURL = URL.revokeObjectURL(result);
              });

              break;

            // Remuneración
            case 1:
              console.log('remuneración');

              this.delay(250).then(any => {
                this.abMain = [];
                this.tsMain = 'inactive';
              });

              this.ngbModalOptions.size = 'xl';
              this.openModal('remuneraciones');

              break;

            // Descuentos
            case 2:
              console.log('descuentos');

              this.delay(250).then(any => {
                this.abMain = [];
                this.tsMain = 'inactive';
              });

              this.ngbModalOptions.size = 'xl';
              this.openModal('descuentos');

              break;

            // Consulta de boletas
            case 3:
              console.log('Consulta de boletas');

              this.delay(250).then(any => {
                this.abMain = [];
                this.tsMain = 'inactive';
              });

              this.ngbModalOptions.size = 'xl';
              this.openModal('boletas');

              break;

            // Renuncia de personal
            case 4:
              console.log('Renuncia de personal');

              this.delay(250).then(any => {
                this.abMain = [];
                this.tsMain = 'inactive';
              });

              this.openModal('renuncia');
              break;

            // Limpiar
            case 5:

              this.fgInfo.reset();
              this.aDocuments.forEach(x => x.nCheckDoc = 0);
              const aTrue = this.aDocuments.filter(x => x.bRequerido === true);
              this.aDocuments = aTrue;

              this.abMain = [];

              this.delay(250).then(any => {
                this.abMain = this.fbMain;
                this.tsMain = 'active';
              });

              break;
          }
        }

        break;
    }
  }

  //#endregion

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_main');

    await this.listDocuments();

    // SignalR
    this.hubConnection = await this.atencionService.startConnection();
    await this.atencionService.getIdConnection().then((id) => {
      this.idConnection = id;
    });
    this.ControlpSignalR();

    this.spi.hide('spi_main');
    this.animate(1);
  }

  //#region Load

  async listDocuments() {
    const param = [];
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('6¡sIdPais!' + sIdPais);
    param.push('0¡bRequerido!1');

    await this.atencionService._loadSP(2, param).then((value: Array<any>) => {
      this.aDocuments = value;
    });
  }

  async selectPerson(item: nsAtencionp.SearchPerson) {
    this.fgInfo.patchValue({
      nIdPersonal: item.nId,
      nIdTipoDoc: item.nIdTipoDoc,
      sTipoDoc: item.sDscTipo,
      sDocumento: item.sDocumento,
      sNombres: item.sNombres,
      nIdPlla: item.nIdPlla,
      sCodPlla: item.sCodPlla,
      dFechIni: item.dFechIni,
      dFechFin: item.dFechFin
    });

    const nIdPlla = item.nIdPlla;
    const nIdTipoDoc = item.nIdTipoDoc;
    const nModo = item.nModo;

    const param = [];
    param.push('0¡nIdPlla!' + nIdPlla + '-0¡nIdPlla!' + nIdPlla);
    param.push('0¡nIdTipoDoc!' + nIdTipoDoc);
    param.push('0¡bModo!' + nModo);
    await this.atencionService._loadSP(9, param).then((value: any[]) => {

      Object.values(value).forEach((lista: Array<any>) => {
        lista.forEach(x => {
          this.aDocuments.push(x);
        });
      });

    });

    this.aDocuments.forEach((value: any, index: number) => {
      this.aDocuments[index].nCheckDoc = 1;
    });

    this.abMain = [];

    this.delay(250).then(any => {
      this.abMain = this.fbMain2;
      this.tsMain = 'active';
    });
  }

  transferPerson(item: nsAtencionp.SearchPerson) {
    this.atencionService.notification(item.nId, item.sNombres, 'Atencionp_To_ControlP');
  }


  //#endregion

  //#region Extra

  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms)).then();
  }

  printDoc() {
    const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;
    if (pdfFrame.src !== '') {
      this.pbMain = false;
      pdfFrame.contentWindow.print();
    }
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

  //#region Notificacion

  ControlpSignalR = () => {
    this.hubConnection.on('ControlP_To_Atencionp', data => {

      const nId = data.nId;
      const sNombres = data.sNombres as string;

      this.snotify.confirm('Trabajador : ' + sNombres.trim(), 'Nuevo ingreso', {
        // timeout: -1,
        // showProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        position: SnotifyPosition.leftBottom,
        buttons: [
          {
            text: 'Atender', action: async (toast) => {

              this.pbMain = true;

              const aParam = [];
              aParam.push('0¡A.nIdPersonal!' + nId);
              await this.atencionService._loadSP(8, aParam).then((value: Array<any>) => {
                this.selectPerson(value[0]);
              });

              this.pbMain = false;

            }, bold: true
          },
          { text: 'Cerrar', action: (toast) => { this.snotify.remove(toast.id); }, bold: false },
        ]
      });

    });
  }

  //#endregion

}
