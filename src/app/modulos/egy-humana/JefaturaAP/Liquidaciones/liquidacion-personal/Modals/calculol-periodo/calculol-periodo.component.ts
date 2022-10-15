import { Component, Input, OnInit, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import moment, { Moment } from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { LiquidacionPersonalService } from '../../liquidacion-personal.service';
import { CalculogPeriodoComponent } from '../calculog-periodo/calculog-periodo.component';

const MODALS: { [name: string]: Type<any> } = {
  calculog: CalculogPeriodoComponent
};

@Component({
  selector: 'app-calculol-periodo',
  templateUrl: './calculol-periodo.component.html',
  styleUrls: ['./calculol-periodo.component.css', './calculol-periodo.component.scss'],
  animations: [ adminpAnimations ]
})
export class CalculolPeriodoComponent implements OnInit {

  @Input() fromParent;

  selectedRowIndex = null;
  ngbModalOptions: NgbModalOptions = {
    size: 'xl',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };

  expandedMore: ICalculoPersonal;

  _nMes = 0;
  _nAnio = 0;

  cboCiudad: any;
  cboPlanilla: any;
  sNombrePersonal: any;

  toggleCalculo = 1;
  tadaCalculo = 'inactive';

  fbCalculo = [
    {icon: 'manage_accounts', tool: 'Calcular liquidación', dis: false} ,
    {icon: 'cancel', tool: 'Cancelar', dis: false} ,
  ];

  abCalculo = [];
  tsCalculo = 'inactive';


  fgFilter: FormGroup;
  pbMain: boolean;
  nIdPerLab = 0;
  PersonalBackup = new Array();
  PersonalDC: string[] = [ 'action', 'Devengue', 'Planilla', 'NroPersonas', 'Estado', 'TotalIngresos', 'TotalDescuento',
  'TotalNeto', 'more' ];
  PersonalDS: MatTableDataSource<ICalculoPersonal> = new MatTableDataSource([]);
  ExpandedDC: string[] = [  'sNombres', 'sCiudad',  'fecCese', 'nNeto' ];
  // 'fecIngreso',
  ExpandedDS: MatTableDataSource<IExpanded> = new MatTableDataSource([]);
  aPerso: IExpanded[];

  @ViewChild('pagPersonal', {static: true}) pagPersonal: MatPaginator;
  @ViewChild('mtExpanded', {static: false}) mtExpanded: MatTable<IExpanded>;

  ConceptoDC: string[] = [ 'sCodConcepto', 'sConcepto', 'nUnidad', 'nImporte' ];
  ConceptoDS: MatTableDataSource<IConcepto> = new MatTableDataSource([]);

  constructor(public activeModal: NgbActiveModal, public service: LiquidacionPersonalService, private spi: NgxSpinnerService,
    private fb: FormBuilder, private _modalService: NgbModal, private _snackBar: MatSnackBar) {

      this.new_fgFilter();

     }

  new_fgFilter() {
    this.fgFilter = this.fb.group({
      dFecha: '',
      sNombres: '',
      sCiudad: '',
      scodplla: '',
    });

    this.fgFilter.valueChanges.subscribe(value => {
      const filter = { ...value , name: value.sNombres.trim().toLowerCase()} as string;
      this.PersonalDS.filter = filter;
      if (this.PersonalDS.paginator) {
        this.PersonalDS.paginator.firstPage();
      }
      this.expandedMore = null;
    });
   }

  get getFilter() { return this.fgFilter.controls; }



   async ngOnInit(): Promise<void>  {
    this.spi.show('spi_personal');
     await this.cboGetPlanilla();
     await this.cboGetCiudad();
     await this.ListaPersonal();
    this.spi.hide('spi_personal');
    this.onToggleFab(1, 1);

  }

  
  openModal(name: string, edit: any, row: any) {

    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);
    const obj = new Object();

    switch (name) {
      case 'calculog':
      // obj['edit'] = edit;
      // if ( edit === 1) {
        obj['_nMes'] = this._nMes;
        obj['_sCodplla'] = row;
        // obj['_nIdDevengue']  = this.nIdDevengue;
      //   obj['nIdDPP'] = row.nIdDPP;
      //   obj['nDias'] = row.nDias;
      //   obj['nImporte'] = row.nImporte;
      // }
        modalRef.componentInstance.fromParent = obj;
        break;
    }

    modalRef.result.then(async (result) => {

      switch (result.modal) {
        case 'calculog':
          if (result.value === 'loadAgain') {

            // this.spinner.show('spi_lista');
            // await this.ListaPersonal();
            // this.spinner.hide('spi_lista');

          }
          break;
      }

    }, (reason) => { });
  }


  async clickFab(opc: number, index: number) {

    switch (opc) {
      // Fab Main
      // Fab Incentivo ( New 2 )
      case 1:
        switch (index) {
          case 0:
            // this.activeModal.dismiss();
            this.SwalPlanilla();
            // this.openModal('calculog', 0, 0);
            // await this.SaveFechas();
            break;
        }
        break;
      }
    }

    onToggleFab(fab: number, stat: number) {
      switch (fab) {
        //// Configurar boton flotante vista principal
        case 1:
          stat = ( stat === -1 ) ? ( this.abCalculo.length > 0 ) ? 0 : 1 : stat;
          this.tsCalculo = ( stat === 0 ) ? 'inactive' : 'active';
          this.abCalculo = ( stat === 0 ) ? [] : this.fbCalculo;
          break;
      }
    }

    showModal(element: any) {}

    async cboGetPlanilla() {
      const param = [];
      const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
      param.push('0¡nIdEmp!' + nIdEmp);
      param.push('0¡bEstado!1');
      await this.service._loadCombo( 5, param).then( (value: any[]) => {
        this.cboPlanilla = value;
      });
    }

    async cboGetCiudad() {
      const param = [];
      param.push('0¡nDadTipEle!694');
      const sIdPais = JSON.parse(localStorage.getItem('Pais'));
      param.push('0¡nIdPais!' + sIdPais);
      param.push('0¡bEstado!1');
      await this.service._loadCombo( 6, param).then( (value: any[]) => {
        this.cboCiudad = value;
      });
    }

    MomentDate2(nMes: any , nAnio: any) {
      moment.locale('es');
      let sMes = (nMes as number).toString();
      sMes = (sMes.length === 1) ? '0' + nMes : nMes;
      const date = '01/' + nMes + '/' + nAnio;
      const tDate1 = moment(date, 'DD/MM/YYYY').toDate();
      const tDate = moment(tDate1).format('MMMM [del] YYYY');
      return tDate[0].toUpperCase() + tDate.substr(1).toLowerCase();
    }

    cantPerso(nMes: number, nEjercicio: number , scodplla:string) {
      const sNombres = this.fgFilter.controls['sNombres'].value as string;
      const sCiudad = this.fgFilter.controls['sCiudad'].value as string;
      const aFilter = this.aPerso.filter( x => {
        const a = x.nMes === nMes;
        const b = x.nEjercicio === nEjercicio;
        const c = x.scodplla.toLowerCase().includes(scodplla.toLowerCase()) 
        // tslint:disable-next-line: max-line-length
        const d = !sNombres || ( x.sNombres.toLowerCase().includes(sNombres.toLowerCase()) );
        const e = !sCiudad || ( x.sCiudad.toLowerCase().includes(sCiudad.toLowerCase()) );
        return a && b && c && d && e;
      });
  
      return aFilter.length;
    }

    async ListaPersonal() {
      const param = [];
        param.push('');
        const param2 = [];
        param2.push('');
      await this.service._loadSP( 4, param).then( (value: ICalculoPersonal[]) => {

        this.PersonalDS = new MatTableDataSource(value);
        this.PersonalDS.paginator = this.pagPersonal;


        this.PersonalDS.filterPredicate = function(data, filter: string): boolean {
        return data.estado.trim().toLowerCase().includes(filter);
        };
        this.PersonalDS.filterPredicate = ((data: any, filter: any ) => {

          const mes: number = + moment(filter.dFecha).format('MM');
          const anio: number = +  moment(filter.dFecha).format('YYYY');
          const a = !filter.dFecha || data.nMes ===  mes && data.nEjercicio === anio;
          const b = !filter.scodplla || data.scodplla.trim().toLowerCase().includes(filter.scodplla);
          const c = this.cantPerso(data.nMes, data.nEjercicio, data.scodplla) > 0;
        return a && b && c;
        }) as (PeriodicElement, string) => boolean;
      });
      await this.service._loadSP( 7, param2).then( (value: IExpanded[]) => {
        this.aPerso = value;
      });
    }

    async clickExpanded(row: ICalculoPersonal) {
      if (this.expandedMore === row) {
        // Limpiar
        this.expandedMore = null;
        this.ExpandedDS = new MatTableDataSource([]);
        this.ConceptoDS = new MatTableDataSource([]);
        if (this.ExpandedDS.paginator) {
          this.ExpandedDS.paginator.firstPage();
        }

      } else {
        this.ConceptoDS = new MatTableDataSource([]);
        const param = [];
        param.push('0¡D.nEjercicio!' + row.nEjercicio);
        param.push('0¡D.nMes!' + row.nMes);

        await this.service._loadSP( 7, param).then( (value: IExpanded[]) => {

          let aFilter = value;

          if ( this.fgFilter.controls['sCiudad'].value !== '' && this.fgFilter.controls['sCiudad'].value !== undefined ) {
            let sFilter = this.fgFilter.controls['sCiudad'].value as string;
            sFilter = sFilter.trim().toLowerCase();
            aFilter = value.filter( x => {
              return  x.sCiudad.trim().toLowerCase().includes(sFilter);
            });
          }

          if ( this.fgFilter.controls['sNombres'].value !== '' ) {
            let sFilter = this.fgFilter.controls['sNombres'].value as string;
            sFilter = sFilter.trim().toLowerCase();
            aFilter = value.filter( x => {
              return  x.sNombres.trim().toLowerCase().includes(sFilter);
            });
          }

        // if ( this.fgFilter.controls['sCiudad'].value !== '' || this.fgFilter.controls['sNombres'].value !== ''  ) {
        //   let sCiudad = this.fgFilter.controls['sCiudad'].value as string;
        //   let sNombres = this.fgFilter.controls['sNombres'].value as string;
        //   sCiudad = sCiudad.trim().toLowerCase();
        //   sNombres = sNombres.trim().toLowerCase();
        //   aFilter = value.filter( x => {
        //       // const a = !nIdRegPen_ || ( x.nIdRegPen === nIdRegPen_);
        //       const a =  x.sNombres.trim().toLowerCase().includes(sNombres);
        //       const b =  x.sCiudad.trim().toLowerCase().includes(sCiudad);
        //     return a && b;
        //   });
        // }
          // this.DetailDS = aFilter;
          this.ExpandedDS = new MatTableDataSource(aFilter);
          this.ExpandedDS.paginator = null;
          // this.ExpandedDS.paginator = this.pagExpanded;
          // this.ExpandedDS = new MatTableDataSource(value);
          // this.ExpandedDS.paginator = null;
        });

        this.expandedMore = row;
        // this.mtExpanded.renderRows();

      }
      // this.loadVac();

    }
  // chosenYearHandler(normalizedYear: Moment) {
  //   let ctrlValue = this.fgFilter.controls['dFecha'].value;
  //   ctrlValue = ( ctrlValue === null ) ? moment() : ctrlValue;
  //   ctrlValue.year(normalizedYear.year());
  //   this.fgFilter.controls['dFecha'].setValue(ctrlValue);
  // }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    let ctrlValue = this.fgFilter.controls['dFecha'].value;
    ctrlValue = ( ctrlValue === null ) ? moment() : ctrlValue;
    // ctrlValue.month(normalizedMonth.month());
    this.fgFilter.controls['dFecha'].setValue(normalizedMonth);
    const a = moment(normalizedMonth).format('MM');
    const b =  moment(normalizedMonth).format('YYYY');
    const y: number = +a;
    const z: number = +b;
    // const lista = this.ListaTemporalDS.filter(x => x.nMes == y && x.nEjercicio == z);
    // this.MainDS = new MatTableDataSource(lista);
    datepicker.close();
  }
  // async selectPersonal(nIdPerLab: number, sNombres: string) {
  //   this.sNombrePersonal = sNombres;
  //   await this.ConceptoxPersonal(nIdPerLab);
  // }

    // TODO Parametros para concepto por periodo laboral
    // WHERE A.nIdPerLab = 140 AND D.nIdDevengue=7
  async ConceptoxPersonal(element: any ) {
    this.sNombrePersonal = element.sNombres;
    const param = [];
    param.push('0¡nIdPerLab!' + element.nIdPerLab);
    param.push('0¡nIdDevengue!' + this.fromParent._nIdDevengue);
    // param.push('0¡MONTH(B.dFechFin)!' + mes);
    await this.service._loadSP( 3, param).then( (value: IConcepto[]) => {
      this.ConceptoDS = new MatTableDataSource(value);
    });

  }

  SwalPlanilla() {
    const iOptions: { [inputValue: number]: string; } = {};
        const iOption: {
          nIdPlanilla: number;
          sDescPlla: string;
        }[] = [];
        this.cboPlanilla.forEach( x => {
          iOption.push({
            nIdPlanilla: x.sCodPlla,
            sDescPlla: x.sCodPlla + '-' + x.sDesc
          });

        });

        $.map(iOption, function (o) {
          iOptions[o.nIdPlanilla] = o.sDescPlla;
        });
    Swal.fire({
      title: 'Seleccionar Planilla',
      icon: 'info',
      text: 'Al cambiar la planilla se mostrará su información relacionada.',
      input: 'select',
      inputOptions: iOptions,
      // inputOptions: devengue.opcionSwal(),
      inputPlaceholder: 'Seleccionar',
      showCancelButton: true,
      confirmButtonText: 'Seleccionar',
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (value === undefined || value === '') {
          return 'Selección no válida.';
        }
      }
    }).then(async resultado => {
      const nIdNewD = Number(resultado.value);
      if (nIdNewD > 0) {
        this.openModal('calculog', 0, nIdNewD);

      } else {
        // this.activeModal. ();
      }

    });
  }

}


interface IConcepto {
  nIdPerLab: number;
  sCodConcepto: number;
  sConcepto: string;
  nUnidad: number;
  nImporte: number;
}

interface ICalculoPersonal {

  nEjercicio: number;
  nMes: number;
  nroPersonas: number;
  scodplla: string;
  estado: string;

  TotalDescuento: number;
  TotalIngresos: number;
  TotalNeto: number;
}

interface IExpanded {
  nIdPerLab: number;
  sNombres: string;
  sCiudad: string;
  sFechaIngreso: string;
  sFechaCese: string;
  nNeto: number;
  scodplla: string;
  nEjercicio: number;
  nMes: number;
}
