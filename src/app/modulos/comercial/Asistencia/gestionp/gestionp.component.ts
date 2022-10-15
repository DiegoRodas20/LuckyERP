import { Component, Inject, OnInit, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { adminpAnimations } from 'src/app/modulos/egy-humana/JefaturaAP/Animations/adminp.animations';

import { NgxSpinnerService } from 'ngx-spinner';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import * as moment from 'moment';
import { Moment } from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';
import { GestionpService } from './services/gestionp.service';
import { nsGestionPlanning } from '../gestionap/Models/nsGestionPlanning';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { GestionpDetailComponent } from './Modals/gestionp-detail/gestionp-detail.component';
import { GestionpDetail2Component } from './Modals/gestionp-detail2/gestionp-detail2.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

const MODALS: { [name: string]: Type<any> } = {
  GestionDetalle: GestionpDetail2Component
};

@Component({
  selector: 'app-gestionp',
  templateUrl: './gestionp.component.html',
  styleUrls: ['./gestionp.component.css', './gestionp.component.scss'],
  animations: [adminpAnimations],
  providers: [GestionpService],
})



export class GestionpComponent implements OnInit {
  //#region Variables
  // Generales
  idLoad = 'spi_main'; // Variable que identifica el loading
  user = localStorage.getItem('currentUser');
  nIdUser: number = JSON.parse(window.atob(this.user.split('.')[1])).uid;
  nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
  nPais = JSON.parse(localStorage.getItem('Pais'));

  listaPermitidos: any[] = [];
  // Combos
  clients: nsGestionPlanning.IListClient[];
  centroCosto: nsGestionPlanning.IListCampana[];
  canal: nsGestionPlanning.IListCanal[];
  perfil: nsGestionPlanning.IListPerfil[];
  planning: nsGestionPlanning.IListPlanning[];
  planningDetail: nsGestionPlanning.ILIstPlanningDetail[];

  // Filtros
  person: nsGestionPlanning.IListPersonFilter[] = [];
  filterExpanEfect = false;
  // Animations
  tadaMain = 'inactive';

  // Progress Bar
  pbMain: boolean;

  // Fab
  fbMain = [{ icon: 'request_page', tool: 'Nuevo registro' }];
  tsMain = 'inactive';
  abMain = [];

  // Service GET && POST
  url: string;

  // Table
  MainDC: string[] = [
    'action',
    'dFechIni',
    'dFechFin',
    'sCliente',
    'sCampana',
    'nPersona',
    'more',
  ];
  Maindt: MatTableDataSource<nsGestionPlanning.IListPlanning> =
    new MatTableDataSource([]);
  @ViewChild('pagMain', { static: true }) pagMain: MatPaginator;

  ExpandedDC: string[] = [
    'sPersonal',
    'sPila',
    'sTDoc',
    'sDocumento',
    'sCiudad',
    'sCanal',
    'sPerfil',
    'sIngreso',
    'sCese',
  ];

  ExpandedDS: MatTableDataSource<nsGestionPlanning.ILIstPlanningDetail> =
    new MatTableDataSource([]);
  @ViewChild('pagExpanded', { static: false }) pagExpanded: MatPaginator;
  @ViewChild('mtExpanded', { static: false })
  mtExpanded: MatTable<nsGestionPlanning.ILIstPlanningDetail>;

  expandedMore: nsGestionPlanning.IListPlanning;

  ngbModalOptions: NgbModalOptions = {
    size: 'xl',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder',
  };

  //#endregion

  //#region  Forms

  formInfoUser: FormGroup;
  formFilter: FormGroup;

  initFormFilter(): void {
    this.formFilter = this._fb.group({
      nIdCliente: 0,
      sCentroCosto: [{ value: '', disabled: true }],
      dFecha: null,
      nIdEstado: 0,
      sNombres: '',
      nIdCanal: 0,
      nIdPerfil: 0,
    });

    this.formFilter.valueChanges.subscribe((value) => {
      const filter = {
        ...value,
        name: value.sNombres.trim().toLowerCase(),
      } as string;
      this.Maindt.filter = filter;

      if (this.Maindt.paginator) {
        this.Maindt.paginator.firstPage();
      }
    });
  }

  initFormInfoUser(): void {
    this.formInfoUser = this._fb.group({
      nIdPersonal: 0,
      sNombres: '',
      sTipo: '',
      sDocumento: '',
    });
  }

  get getInfoUser() {
    return this.formInfoUser.controls;
  }

  get getFormFilter() {
    return this.formFilter.controls;
  }

  //#endregion

  constructor(
    public _service: GestionpService,
    private _fb: FormBuilder,
    private _loader: NgxSpinnerService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private _modalService: NgbModal,
    private _spinner: NgxSpinnerService,
    @Inject('BASE_URL') baseUrl: string
  ) {
    this.url = baseUrl;
    this.initFormInfoUser();
    this.initFormFilter();
  }

  async ngOnInit(): Promise<void> {
    this._loader.show(this.idLoad);

    await this.getInfoUsuario();
    await this.getListClient();
    await this.getListCanal();
    await this.getListPerfil();

    await this.getListPlanning();

    this._loader.hide(this.idLoad);
  }

  //#region Combobox

  async getListClient(): Promise<void> {
    const params = [];
    params.push('0¡nIdPais!' + this.nPais);
    params.push('0¡nIdEstado!1');
    params.push('0¡P.bTipo!0');

    await this._service
      ._ServicePlanning(2, params)
      .then((resp: nsGestionPlanning.IListClient[]) => {
        this.clients = resp;
      });
  }

  async getListCampana(idClient: number): Promise<void> {
    const params = [];
    params.push('0¡nIdCliente!' + idClient);
    params.push('0¡P.bTipo!0');

    await this._service
      ._ServicePlanning(3, params)
      .then((resp: nsGestionPlanning.IListCampana[]) => {
        this.centroCosto = resp;
      });
  }

  async getListCanal(): Promise<void> {
    const params = [];

    await this._service
      ._ServicePlanning(4, params)
      .then((resp: nsGestionPlanning.IListCanal[]) => {
        this.canal = resp;
      });
  }

  async getListPerfil(): Promise<void> {
    const params = [];

    await this._service
      ._ServicePlanning(5, params)
      .then((resp: nsGestionPlanning.IListPerfil[]) => {
        this.perfil = resp;
      });
  }

  //#endregion

  //#region General

  async getInfoUsuario(): Promise<void> {
    const params = [];
    params.push('0¡nCodUser!' + this.nIdUser);

    await this._service
      ._ServicePlanning(1, params)
      .then((resp: nsGestionPlanning.IInfoPersona) => {
        this.formInfoUser.reset({
          nIdPersonal: resp.nIdPersonal,
          sNombres: resp.sNombres,
          sTipo: resp.sTipo,
          sDocumento: resp.sDocumento,
        });
      });
  }

  async getListPlanning(): Promise<void> {
    const params = [];
    params.push('0¡P.bTipo!0');

    await this._service.GetPlanning(this.nIdUser).then((response: any) => {
        this.planning = response.body.response.data;
        this.Maindt = new MatTableDataSource(this.planning);
        this.Maindt.paginator = this.pagMain;

        this.Maindt.filterPredicate = function (
          data: nsGestionPlanning.IListPlanning,
          filter: string
        ) {
          return data.sCampana.trim().toLowerCase().includes(filter);
        };

        this.Maindt.filterPredicate = ((
          data: nsGestionPlanning.IListPlanning,
          filter: any
        ) => {
          const a = !filter.nIdCliente || data.nIdCliente === filter.nIdCliente;
          const b =
            !filter.sCentroCosto ||
            data.sCampana
              .trim()
              .toLowerCase()
              .includes(filter.sCentroCosto.trim().toLowerCase());
          const c =
            !filter.dFecha ||
            moment(filter.dFecha).format('YYYYMM') ===
              moment(data.dFechFin).format('YYYYMM');
          const d =
            !filter.dFecha ||
            moment(filter.dFecha).format('YYYYMM') ===
              moment(data.dFechIni).format('YYYYMM');
          // const e = this.cantPerso(data.nIdPlanning) > 0;
          return a && b && c && d;
        }) as (PeriodicElement, string) => boolean;
      });
  }

  async newRegister(): Promise<void> {
    Swal.fire({
      title: 'Registro Planning',
      text: 'Ingresar el N° del centro de costo en donde se cargará el planning.',
      input: 'text',
      inputPlaceholder: 'Escribir centro de costo aquí...',
      showCancelButton: true,
      confirmButtonColor: '#ff4081',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
      inputValidator: (nIdCentroCosto) => {
        if (nIdCentroCosto === undefined || nIdCentroCosto === '') {
          return 'Ingresar centro de costo';
        }
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.pbMain = true;

        const sCodCC: string = result.value as string;

        const resp: nsGestionPlanning.ICentro_Costo = await this.loadCentroCosto(
          sCodCC
        );

        if (resp) {
          await this.ResponsablesPermitidos(resp.nIdCentroCosto);
          const cant =  this.listaPermitidos.filter(x => x === parseInt(this.nIdUser.toString(),  10) ).length;
          if (cant === 0) {
            this._snackBar.open('Responsable no permitido en el Centro de Costo.', 'Cerrar', {
              horizontalPosition: 'right',
              verticalPosition: 'top',
              duration: 2500,
            });
            this.pbMain = false;
            return;
          }

        }

        if (!resp) {
          this._snackBar.open('N° de centro de costo inválido.', 'Cerrar', {
            horizontalPosition: 'right',
            verticalPosition: 'top',
            duration: 2500,
          });
          this.pbMain = false;
          return;
        }

        const respPersona: nsGestionPlanning.ILista_Persona[] =
          await this.loadPersonl(sCodCC);

        if (!respPersona) {
          this._snackBar.open(
            'El responsable no cuenta con personal a su cargo.',
            'Cerrar',
            {
              horizontalPosition: 'right',
              verticalPosition: 'top',
              duration: 2500,
            }
          );
          this.pbMain = false;
          return;
        }

        this.openModal('GestionDetalle', resp, respPersona, 0, 0);

        // const data: object = { centro: resp, personal: respPersona };

        // const dialogConfig = new MatDialogConfig();
        // dialogConfig.disableClose = true;
        // dialogConfig.autoFocus = true;
        // dialogConfig.width = '100%';
        // dialogConfig.data = data;

        // const modalRef = this._modalService.open(
        //   GestionpDetail2Component,
        //   this.ngbModalOptions
        // );
        // modalRef.componentInstance.fromParent = data;
        // modalRef.result.then((result) => {

        //   switch (result.modal) {
        //     case 'detalle':
        //       if (result.value === 'loadAgain') {
        //         this.getListPlanning();
        //       }
        //       break;
        //   }
        // }, (reason) => {});

        // this.dialog.open(GestionpDetailComponent, dialogConfig);
      }
    });
  }

  openModal(name: any , centro: any, personal: any, element: any , editar: any) {
    switch (name) {
      case 'GestionDetalle':
        this.ngbModalOptions.size = 'xl';
        break;
    }

    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);
    const obj = new Object();
    switch (name) {
        case 'GestionDetalle':
        obj['centro'] = centro;
        obj['personal'] = personal;
        obj['element'] = element;
        obj['editar'] = editar;
        modalRef.componentInstance.fromParent = obj;
          break;
    }

    modalRef.result.then((result) => {
      switch (result.modal) {
        case 'GestionDetalle':
          if (result.value === 'loadAgain') {
            this.getListPlanning();
          }
          break;
        case 'view':
          break;
      }
    }, (reason) => {});
  }

  async loadPersonl(
    sCodCC: string
  ): Promise<nsGestionPlanning.ILista_Persona[]> {
    const params = [];
    params.push(this.nIdUser);
    params.push(this.nIdEmp);
    params.push(sCodCC);
    return await this._service
      ._ServicePlanning(9, params)
      .then((resp: nsGestionPlanning.ILista_Persona[]) => resp);
  }

  async loadCentroCosto(sCodCC: string): Promise<nsGestionPlanning.ICentro_Costo> {
    const params = [];
    params.push('0¡A.nIdEmp!' + this.nIdEmp);
    params.push('6¡A.sCodCC!' + sCodCC);
    return await this._service
      ._ServicePlanning(8, params)
      .then((resp: nsGestionPlanning.ICentro_Costo) => resp);
  }

  async ResponsablesPermitidos(nIdCentroCosto: number) {
    await this._service.ResponsablesPermitidos( nIdCentroCosto ).then((response: any) => {
      if (response.status === 200) {
        this.listaPermitidos = response.body.response.data;
      }
    });
  }

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = stat === -1 ? (this.abMain.length > 0 ? 0 : 1) : stat;
        this.tsMain = stat === 0 ? 'inactive' : 'active';
        this.abMain = stat === 0 ? [] : this.fbMain;
        break;
    }
  }

  async view(element: nsGestionPlanning.IListPlanning) {
    this._spinner.show('spi_main');
    const sCodCC = element.sCodCC;
    const resp: nsGestionPlanning.ICentro_Costo = await this.loadCentroCosto(sCodCC);
    this._spinner.hide('spi_main');
    this.openModal('GestionDetalle', resp, 0, element, 1);
  }

  async clickExpanded(row: nsGestionPlanning.IListPlanning) {
    if (this.expandedMore === row) {
      // Limpiar
      this.expandedMore = null;
      this.ExpandedDS = new MatTableDataSource([]);

      if (this.ExpandedDS.paginator) {
        this.ExpandedDS.paginator.firstPage();
      }
    } else {
      const params = [];
      params.push('0¡DP.nIdPlanning!' + row.nIdPlanning);

      await this._service
        ._ServicePlanning(7, params)
        .then((resp: nsGestionPlanning.ILIstPlanningDetail[]) => {
          this.planningDetail = resp;

          this.planningDetail.forEach((x) => {
            this.person.push({
              nIdPlanning: x.nIdPlanning,
              nIdPersonal: x.nIdPersonal,
              sPersonal: x.sPersonal,
              sDocumento: x.sDocumento,
            });
          });

          if (this.formFilter.controls['sNombres'].value !== '') {
            let sFilter = this.formFilter.controls['sNombres'].value as string;
            sFilter = sFilter.trim().toLowerCase();
            this.planningDetail = resp.filter((x) => {
              return (
                x.sPersonal.trim().toLowerCase().includes(sFilter) ||
                x.sDocumento.trim().toLowerCase().includes(sFilter)
              );
            });
          }

          this.ExpandedDS = new MatTableDataSource(this.planningDetail);
          this.ExpandedDS.paginator = this.pagExpanded;
        });

      this.expandedMore = row;
      this.mtExpanded.renderRows();
    }
  }

  //#endregion

  //#region Extra

  chosenYearHandler(normalizedYear: Moment) {
    let ctrlValue = this.formFilter.controls['dFecha'].value;
    ctrlValue = ctrlValue === null ? moment() : ctrlValue;
    ctrlValue.year(normalizedYear.year());
    this.formFilter.controls['dFecha'].setValue(ctrlValue);
  }

  chosenMonthHandler(
    normalizedMonth: Moment,
    datepicker: MatDatepicker<Moment>
  ) {
    let ctrlValue = this.formFilter.controls['dFecha'].value;
    ctrlValue = ctrlValue === null ? moment() : ctrlValue;
    ctrlValue.month(normalizedMonth.month());
    this.formFilter.controls['dFecha'].setValue(ctrlValue);
    datepicker.close();
  }

  MomentDate(pushParam: any) {
    moment.locale('es');
    const tDate = moment(pushParam).format('DD [de] MMMM [del] YYYY');
    return tDate[0].toUpperCase() + tDate.substr(1).toLowerCase();
  }

  async ChangeCliente(pushParam: number) {
    this.formFilter.controls['sCentroCosto'].setValue('');
    this.formFilter.controls['sCentroCosto'].disable();

    if (pushParam !== undefined) {
      await this.getListCampana(pushParam);
      this.formFilter.controls['sCentroCosto'].enable();
    }
  }

  /*cantPerso(nIdPlanning: number) {
    const sText = this.formFilter.controls["sNombres"].value as string;
    const aFilter = this.person.filter((x) => {
      const a = x.nIdPlanning === nIdPlanning;
      // tslint:disable-next-line: max-line-length
      const b =
        !sText ||
        x.sPersonal.toLowerCase().includes(sText.toLowerCase()) ||
        x.sDocumento.toLowerCase().includes(sText.toLowerCase());
      return a && b;
    });
    return aFilter.length;
  }*/

  async clickFab(index: number) {
    switch (index) {
      case 0:
        await this.newRegister();
        break;
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;

    this.ExpandedDS.filter = filterValue.trim().toLowerCase();
  }

  //#endregion
}
