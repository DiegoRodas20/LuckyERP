import { Component, Input, OnInit, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { Moment } from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { ControlvService } from '../../../../Services/controlv.service';
import { ControvViewComponent } from '../controv-view/controv-view.component';
import printJS from 'print-js';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';


const MODALS: { [name: string]: Type<any> } = {
  view: ControvViewComponent
};

@Component({
  selector: 'app-controv-detalle',
  templateUrl: './controv-detalle.component.html',
  styleUrls: ['./controv-detalle.component.css', './controv-detalle.component.scss'],
  animations: [adminpAnimations]
})



export class ControvDetalleComponent implements OnInit {

  @Input() fromParent;
  pbDetail: boolean;

  data: any;
  idPlanilla = '';

  cboEstados= new Array();

  ngbModalOptions: NgbModalOptions = {
    size: 'xl',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };
  
  DetailDC: string[] = [ 'action', 'sSupervisor', 'dFechaIni', 'dFechaFin', 'sEstado' ];
  DetailDS: MatTableDataSource<IDetail>;

  fgDetail: FormGroup;
  fgFilter: FormGroup;

  @ViewChild('pagDetail', {static: true}) pagDetail: MatPaginator;
  @ViewChild('epPersonal') epPersonal: MatExpansionPanel;

  constructor(public activeModal: NgbActiveModal,private _modalService: NgbModal,
    public service: ControlvService,
    public fb: FormBuilder,
    private spi: NgxSpinnerService,
    private _snackBar: MatSnackBar,
    public datepipe: DatePipe) {

      this.new_fgDetail();
      this.new_fgFilter();

    }



   async ngOnInit(): Promise<void> {
    const data = this.fromParent.data;
    const tipo = this.fromParent.tipo;
    if (tipo === 1) {
      this.fgDetail.controls['sSolicitante'].setValue(data.sSolicitante);
      this.fgDetail.controls['sSupervisor'].setValue(data.sSupervisor);
      this.fgDetail.controls['sFechaIngreso'].setValue(data.sFechaIngreso);
      this.fgDetail.controls['sFechaCese'].setValue(data.sFechaCese);

    } else {
      this.fgDetail.controls['sSolicitante'].setValue(data.sNombres);
      this.fgDetail.controls['sFechaIngreso'].setValue(this.datepipe.transform(data.dFechIni, 'dd/MM/yyyy'));
      this.fgDetail.controls['sFechaCese'].setValue(this.datepipe.transform(data.dFechFin, 'dd/MM/yyyy'));

    }
    this.fgDetail.controls['nIdPersonal'].setValue(data.nIdPersonal);
    this.fgDetail.controls['nIdReqVac'].setValue(data.nIdReqVac);
    this.fgDetail.controls['nIdResp'].setValue(data.nIdResp);
    this.fgDetail.controls['sTipo'].setValue(data.sTipo);
    this.fgDetail.controls['sDscTipo'].setValue(data.sDscTipo);
    this.fgDetail.controls['sDocumento'].setValue(data.sDocumento);
    this.fgDetail.controls['sCiudad'].setValue(data.sCiudad);
    this.fgDetail.controls['nIdEstado'].setValue(data.nIdEstado);
    this.fgDetail.controls['sDias'].setValue(data.sDias);
    this.fgDetail.controls['sEstado'].setValue(data.sEstado);
    this.fgDetail.controls['sCodPlla'].setValue(data.sCodPlla);
    this.idPlanilla =  data.sCodPlla;
    await this.LoadDetail();
    await this.cboGetEstados();
    // this.idPlanilla = this.fgDetail.controls['sCodPlla'].value;
    }
    get getDetail() { return this.fgDetail.controls; }

    async LoadDetail() {
      const param =  [];
      param.push('0¡TR.nIdPersonal!' + this.fgDetail.controls['nIdPersonal'].value );

      await this.service._loadSP(5, param).then( (value: IDetail[]) => {

        value.forEach(x => {
          if (x.nIdEstado != 2152) {
            x.dis = true;
          } else {
            x.dis = false;
          }
        });

      this.DetailDS = new MatTableDataSource(value);

      this.DetailDS.filterPredicate = function(data, filter: string): boolean {
        return data.sEstado.trim().toLowerCase().includes(filter.toLowerCase());
      };


      this.DetailDS.filterPredicate = ((data: IDetail, filter: any ) => {
        // tslint:disable-next-line: max-line-length
        const a = !filter.sEstado || data.sEstado.toLowerCase().includes(filter.sEstado.toLowerCase());
        const b = !filter.dFecha || ( moment(data.dFechaFin).format('MM/YYYY') === moment(filter.dFecha).format('MM/YYYY') );
        return a && b;
      }) as (PeriodicElement, string) => boolean;

      this.DetailDS.paginator = this.pagDetail;

      });
    }

    new_fgDetail() {
      this.fgDetail = this.fb.group({
        nIdPersonal: 0,
        nIdReqVac: 0,
        sSolicitante:  [{ value: '', disabled: true }],
        nIdResp: 0,
        sSupervisor:  [{ value: '', disabled: true }],
        sCodPlla: [{ value: '', disabled: true }],
        sTipo: [{ value: '', disabled: true }],
        sDscTipo: [{ value: '', disabled: true }],
        sDocumento: [{ value: '', disabled: true }],
        sCiudad: [{ value: '', disabled: true }],
        nIdEstado: 0,
        sDias: 0,
        sEstado: [{ value: '', disabled: true }],
        sFechaIngreso: [{ value: '', disabled: true }],
        sFechaCese: [{ value: '', disabled: true }]
      });
    }

    new_fgFilter() {
      this.fgFilter = this.fb.group({
        dFecha: null,
        nEstado: 0,
        sEstado: ''
      });
      this.fgFilter.valueChanges.subscribe(value => {
      const filter = {...value, name: value.sEstado.trim().toLowerCase()} as string;
        this.DetailDS.filter = filter;
        if (this.DetailDS.paginator) {
          this.DetailDS.paginator.firstPage();
        }
      });
    }

    chosenYearHandler(normalizedYear: Moment) {
      let ctrlValue = this.fgFilter.controls['dFecha'].value;
      ctrlValue = ( ctrlValue === null ) ? moment() : ctrlValue;
      ctrlValue.year(normalizedYear.year());
      this.fgFilter.controls['dFecha'].setValue(ctrlValue);
    }

    chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
      let ctrlValue = this.fgFilter.controls['dFecha'].value;
      ctrlValue = ( ctrlValue === null ) ? moment() : ctrlValue;
      ctrlValue.month(normalizedMonth.month());
      this.fgFilter.controls['dFecha'].setValue(ctrlValue);
      datepicker.close();
    }

    openModal(name: string, data: any) {

      const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);
      const obj = new Object();
  
      switch (name) {
        case 'view':
          const uid_modal = 0;
          obj['data'] = data;
          obj['data2'] = this.fgDetail;
          modalRef.componentInstance.fromParent = obj;
          break;
      }
  
      modalRef.result.then(async (result) => {
  
        switch (result.modal) {
          case 'scan':
            if (result.value === 'loadAgain') {
  
              // this.spinner.show('spi_lista');
              // this.spinner.hide('spi_lista');
  
            }
            break;
        }
  
      }, (reason) => { });
    }

    print( dato: any) {

      Swal.fire({
        title: '¿ Esta seguro de descargar el archivo ?',
        text: 'Documento de sustento.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ff4081',
        confirmButtonText: 'Confirmar !',
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
        const sDocumento = dato.sFileSustento;
        printJS({
        printable: sDocumento,
        type: 'pdf',
        showModal: true,
        modalMessage: 'Recuperando documento',
        onLoadingEnd: () => {
          this.spi.hide('spi_main');
        }
      });
        }
      });

      

    }

    async cboGetEstados() {
      const param = [];
      const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
      param.push('');
      await this.service._loadSP( 7, param).then( (value: any[]) => {
        this.cboEstados = value;
      });
    }

}


interface IDetail {
  nIdReqVac: number;
  nIdPersonal: number;
  nIdResp: number;
  dFechaIni: Date;
  dFechaFin: Date;
  nIdEstado: number;
  sEstado: string;
  sFileSustento: string;
  dis: boolean;
}