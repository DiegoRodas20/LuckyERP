import { Component, OnInit, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { Moment } from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { adminpAnimations } from '../../../egy-humana/JefaturaAP/Animations/adminp.animations';
import { BancoDto, DepositoDto, ElementoDto, EmpresaDto, RetencionJudicialDto, TipoElementoDto } from '../Model/controld';
import { ControldService } from '../Services/controld.service';
import { ControldDepositoComponent } from './Modals/controld-deposito/controld-deposito.component';

// Modals
const MODALS: { [name: string]: Type<any> } = {
  realizarDeposito: ControldDepositoComponent
};

export const FORMAT = {
  parse: {
      dateInput: 'MM/YYYY',
  },
  display: {
      dateInput: 'MM/YYYY',
      monthYearLabel: 'MMM YYYY',
      dateA11yLabel: 'LL',
      monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-controld',
  templateUrl: './controld.component.html',
  styleUrls: ['./controld.component.css', './controld.component.scss'],
  providers: [    { provide: MAT_DATE_FORMATS, useValue: FORMAT }],
  animations: [adminpAnimations]
})
export class ControldComponent implements OnInit {

  public data: Array<DepositoDto> = new Array();
  public lstEmpresas: Array<EmpresaDto>;
  public lstBancos: Array<BancoDto>;
  public lstUsuarios: Array<UsuariosDTO>;
  public lstDirecciones: Array<TipoElementoDto>;
  public lstAreas: Array<TipoElementoDto>;
  public lstEstados: Array<ElementoDto>;
  public lstTiposDeposito: Array<TipoElementoDto>;
  public lstDepositos: Array<DepositoDto>;

  public lstRetencionesJudiciales: Array<RetencionJudicialDto>;
  public lstDetalleDepositos: Array<DetalleDepositosDTO>;
  public lstBancosFiltro: Array<any>;
  // // Fab
  // fbMain = [
  //   { icon: 'file_present', tool: 'Generar depósito' }
  // ];
  // abMain = [];
  // tsMain = 'inactive';

  // Animation
  tadaMain = 'inactive';
  MontoFiltrado = 0;
  // Progress Bar
  pbMain: boolean;
  hiddenFooter: boolean;

  // FormGroup
  fgMain: FormGroup;
  fgTrabajador: FormGroup;

  // Modal Config
  ngbModalOptions: NgbModalOptions = {
    size: 'xl',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };

  // Mat Table
  MainDC: string[] = ['sPersoImg', 'nombreUsuario', 'nOtros', 'action'];
  searchBS: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild('searchB', { static: true }) searchB: MatPaginator;
  @ViewChild('pagDetDeposito', { static: true }) pagDetDeposito: MatPaginator;
  expandedMore = null;

  ExpandedDC1: string[] = ['trabajador', 'tipoDocumento', 'nroDocumento', 'banco', 'importe'];
  ExpandedDS1: MatTableDataSource<RetencionJudicialDto> = new MatTableDataSource([]);
  ExpandedDS2: MatTableDataSource<any> = new MatTableDataSource([]);

  constructor(
    private fb: FormBuilder,
    private spi: NgxSpinnerService,
    private _modalService: NgbModal,
    private _snackBar: MatSnackBar,
    private _controldService: ControldService
  ) {

    this.expandedMore = null;

    this.InitFormPrincipal();
    this.InitFormTrabajador();
  }

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_main');

    this.searchBS = new MatTableDataSource();
    this.ExpandedDS1 = new MatTableDataSource();
    this.ExpandedDS2 = new MatTableDataSource();

    const countryId: string = localStorage.getItem('Pais');

    await this.GetEmpresas(countryId);

    const empresaId: number = Number(localStorage.getItem('Empresa'));
    this.fgMain.get('empresaId').setValue(empresaId);
    this.fgMain.get('estadoId').setValue(2357);
    await this.GetBancos(countryId);
    await this.GetDirecciones(countryId, 1125);
    await this.GetEstados(2356);
    // await this.GetTiposDeDeposito(countryId, 1369, 0);
    await this.GetDepositos(countryId);
    await this.GetUsuarios();
    this.fgMain.controls['estadoId'].setValue(2357);


    this.spi.hide('spi_main');
  }

  InitFormPrincipal() {
    this.fgMain = this.fb.group({
      empresaId: [{ value: 0 , disabled: true }],
      direccionId: 0,
      areaId: 0,
      estadoId: 0,
      dFecha: null,
      usuarioId: 0,
      tipoDepositoId: 0
    });

    this.fgMain.valueChanges.subscribe((value) => {
      this.ExpandedDS2 = new MatTableDataSource();
      this.MontoFiltrado > 0 ? this.hiddenFooter = false : this.hiddenFooter = true;
      const filter = { ...value, name: value.estadoId } as string;
      this.searchBS.filter = filter;
      if (this.searchBS.paginator) {
        this.searchBS.paginator.firstPage();
      }
    });
  }

  InitFormTrabajador() {
    this.fgTrabajador = this.fb.group({
      trabajadorId: 0,
      bancoId: 0
    });
    this.fgTrabajador.valueChanges.subscribe((value) => {
      const filter = { ...value } as string;
      this.ExpandedDS2.filter = filter;
      if (this.ExpandedDS2.paginator) {
        this.ExpandedDS2.paginator.firstPage();
      }
      this.MontoFiltrado > 0 ? this.hiddenFooter = false : this.hiddenFooter = true;
    });

  }

  async GetEmpresas(countryId: string) {
    await this._controldService.GetEmpresas(countryId).then((response: any) => {
      if (response.status === 200) {
        this.lstEmpresas = response.body.response.data;
      }
    });
  }

  async GetBancos(countryId: string) {
    await this._controldService.GetBancos(countryId).then((response: any) => {
      if (response.status === 200) {
        this.lstBancos = response.body.response.data;
      }
    });
  }

  async ChangeDireccion(event: any) {
    if(event.value !== undefined){
      const countryId: string = localStorage.getItem('Pais');
      const tableId = event.value;
      await this.GetAreas(countryId, tableId);
    } else {
      this.lstAreas = null;
    }
  }
  async ChangeArea(event: any) {
    if (event.value !== undefined) {
      const countryId: string = localStorage.getItem('Pais');
      const nParam = event.value;
      await this.GetTiposDeDeposito(countryId, 1369 , nParam);
    } else {
      this.lstAreas = null;
    }
  }

  async GetDirecciones(countryId: string, tableId: number) {
    await this._controldService.GetTiposDeElementos(countryId, tableId, 0).then((response: any) => {
      if (response.status === 200) {
        this.lstDirecciones = response.body.response.data;
      }
    });
  }

  async GetAreas(countryId: string, tableId: number) {
    await this._controldService.GetTiposDeElementos(countryId, tableId, 0).then((response: any) => {
      if (response.status === 200) {
        this.lstAreas = response.body.response.data;
      }
    });
  }

  async GetEstados(tableId: number) {

    await this._controldService.GetElementos(tableId).then((response: any) => {
      if (response.status === 200) {
        this.lstEstados = response.body.response.data;
      }
    });
  }

  SumarFiltrado() {
    this.MontoFiltrado = 0 ;
     this.ExpandedDS2.filteredData.forEach(
      (detalle) => {
          this.MontoFiltrado += detalle.monto;
      });
      this.MontoFiltrado > 0 ? this.hiddenFooter = false : this.hiddenFooter = true;
      return this.MontoFiltrado;
  }

  async DetDeposito(element: any) {
    this.spi.show('spi_main');
    this.MontoFiltrado = 0 ;
    let param2Tabla = 0;
    let res;
    await this._controldService.GetnParamTabla(element.tipoDepositoId).then((response: any) => {
      if (response.status === 200) {
        res = response.body.response.data;
        param2Tabla = res[0];
      }
    });

    await this._controldService.DetalleDepositos(param2Tabla, element.historicoDepositoId).then((response: any) => {
      if (response === undefined) {
        this.lstTiposDeposito = null;

      } else {
        if (response.status === 200) {
          this.lstDetalleDepositos = response.body.response.data;
          // this.lstDetalleDepositos = this.lstDetalleDepositos.filter(x => x.nIdTipoDeposito === element.tipoDepositoId
          //   && x.nId === element.historicoDepositoId);
            this.ExpandedDS2.filterPredicate = function(data, filter: string): boolean {
              return data.trabajadorId.trim().toLowerCase().includes(filter);
            };
            this.ExpandedDS2 = new MatTableDataSource(this.lstDetalleDepositos);
            this.ExpandedDS2.paginator = this.pagDetDeposito;
            this.ExpandedDS2.filterPredicate = ((
              data: DetalleDepositosDTO,
              filter: any
            ) => {
              const a = !filter.trabajadorId || data.trabajadorId === filter.trabajadorId;
              const b = !filter.bancoId || data.bancoId === filter.bancoId;
              return a && b;
            }) as (PeriodicElement, string) => boolean;
            this.lstBancosFiltro = this.lstDetalleDepositos.filter(z => z.bancoId > 0);
            const unicos = this.lstDetalleDepositos.filter((valor, indice) => {
            return this.lstDetalleDepositos.indexOf(valor) === indice;
          }
        );
            // this.SumarFiltrado();
        } else {
          this.lstTiposDeposito = null;
        }
      }
      this.spi.hide('spi_main');
    });
  }

  async GetTiposDeDeposito(countryId: string, tableId: number , nParam: number) {
    await this._controldService.GetTiposDeElementos(countryId, tableId, nParam).then((response: any) => {
      if (response.status === 200) {
        this.lstTiposDeposito = response.body.response.data;
      } else {
        this.lstTiposDeposito = null;
      }
    });
  }

  async GetDepositos(countryId: string) {
    this.pbMain = true;
    await this._controldService.GetDepositos(countryId).then((response: any) => {
      if (response.status === 200) {
        this.data = response.body.response.data;
        this.lstDepositos = response.body.response.data;

        this.searchBS.filterPredicate = function(data, filter: string): boolean {
          return data.empresaId.trim().toLowerCase().includes(filter);
        };

        this.searchBS = new MatTableDataSource(this.lstDepositos);
        this.searchBS.paginator = this.searchB;
         this.searchBS.filterPredicate = ((
          data: DepositoDto,
          filter: any
        ) => {
          const mes: number = + moment(filter.dFecha).format('MM');
          const anio: number = +  moment(filter.dFecha).format('YYYY');
          const a = !filter.empresaId || data.empresaId === filter.empresaId;
          const b = !filter.direccionId || data.direccionId === filter.direccionId;
          const c = !filter.areaId || data.areaId === filter.areaId;
          const d = !filter.estadoId || data.estadoId === filter.estadoId;
          const e = !filter.usuarioId || data.usuarioId === filter.usuarioId;
          const f = !filter.tipoDepositoId || data.tipoDepositoId === filter.tipoDepositoId;
          const g = !filter.dFecha || data.nMes ===  mes && data.nEjercicio === anio ;
          return a && b && c && d && e && f && g;
        }) as (PeriodicElement, string) => boolean;

      }
    });


    this.pbMain = false;
  }

  get getMain() { return this.fgMain.controls; }
  get getTrabajador() { return this.fgTrabajador.controls; }

  onClickRealizarDeposito(element: any) {
    this.ngbModalOptions.size = 'xl';
  }

  openModal(name: string, element: any) {
    const countryId: string = localStorage.getItem('Pais');
    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);
    const obj = new Object();

    const NombreUsuario = this.lstUsuarios.filter(x => x.nCodUser === element.usuarioId);
    switch (name) {
      case 'realizarDeposito':
        obj['element'] = element;
        obj['NombreUsuario'] = NombreUsuario[0].nNombreCompleto;
        modalRef.componentInstance.fromParent = obj;
        break;
    }
    modalRef.result.then(async (result) => {

      switch (result.modal) {
        case 'realizarDeposito':
          if (result.value === 'loadAgain') {
           this.spi.show('spi_main');
           await this.GetDepositos(countryId);
           this.fgMain.controls['estadoId'].setValue(2357);
           this.spi.hide('spi_main');
          }
          break;
      }

    }, (reason) => { });

  }

  async GetUsuarios() {
    await this._controldService.GetUsuariosControlD().then((response: any) => {
      if (response.status === 200) {
        this.lstUsuarios = response.body.response.data;
      }
    });

    // this.searchBS = new MatTableDataSource(this.lstDepositos);
    // this.searchBS.paginator = this.searchB;
  }

  chosenYearHandler(normalizedYear: Moment) {
    let ctrlValue = this.fgMain.controls['dFecha'].value;
    ctrlValue = ( ctrlValue === null ) ? moment() : ctrlValue;
    ctrlValue.year(normalizedYear.year());
    // this.fgMain.controls['dFecha'].setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    let ctrlValue = this.fgMain.controls['dFecha'].value;
    ctrlValue = ( ctrlValue === null ) ? moment() : ctrlValue;
    // ctrlValue.month(normalizedMonth.month());
    this.fgMain.controls['dFecha'].setValue(normalizedMonth);
    const a = moment(normalizedMonth).format('MM');
    const b =  moment(normalizedMonth).format('YYYY');
    // this.fgMain.controls['dFecha'].setValue(a + '/' + b);

    const y: number = +a;
    const z: number = +b;
    // const lista = this.ListaTemporalDS.filter(x => x.nMes == y && x.nEjercicio == z);
    // this.MainDS = new MatTableDataSource(lista);
    datepicker.close();
  }
}

interface UsuariosDTO{
  nCodUser: number;
  nameUser: string;
  nNombreCompleto: string;
}

interface DetalleDepositosDTO{
  nId: number;
  nIdTipoDeposito: number;
  tipoDocumento: string;
  nroDocumento: string;
  trabajadorId: number;
  trabajador: string;
  bancoId: number;
  banco: string;
  nImporte: number;
  Monto: number;
}

