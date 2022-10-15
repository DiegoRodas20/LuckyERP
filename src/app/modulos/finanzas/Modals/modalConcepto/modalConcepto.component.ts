import { Component, OnInit, Input, ViewChild, Type } from '@angular/core';
import { AsientopllaService } from '../../services/asientoplla.service';
import { AsientoPllaAnimations } from '../../Animations/adminp.animations';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { IConcepto, IDetConcepto, IMatriz, IMantenimiento } from '../../Model/Iasientoplla';
import Swal from 'sweetalert2';
import { ModalMatrizComponent } from '../modalMantenimientos/modalMatriz/modalMatriz.component';

// Modals
const MODALS: { [name: string]: Type<any> } = {
  matriz: ModalMatrizComponent
};

@Component({
  selector: 'app-modalConcepto',
  templateUrl: './modalConcepto.component.html',
  styleUrls: ['./modalConcepto.component.css', './modalConcepto.component.scss'],
  providers: [ AsientopllaService],
  animations: [ AsientoPllaAnimations ]
})
export class ModalConceptoComponent implements OnInit {

  @Input() fromParent;

  // Progress Bar
  pbCal: boolean;

  // Combobox
  cboPlanilla = new Array();
  cboConcepto = new Array();

  aMatriz: IMatriz = new IMatriz(0, '0', '0', false, '0', '');
  aListado: IMantenimiento[] = [];
  opcMantenimiento: number;

  NgbModalOptions: NgbModalOptions = {
    size: 'md',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };

  // PRINCIPAL
  ConceptoDC: string[] = ['planilla', 'totalConcepto', 'totalImporte', 'more'];
  ConceptoDS: MatTableDataSource<IConcepto> = new MatTableDataSource([]);
  @ViewChild('pagConcepto', {static: true}) pagConcepto: MatPaginator;

  // DETALLE
  ExpandedConceptoDC: string[] = ['agregar', 'concepto', 'importe'];
  ExpandedConceptoDS: MatTableDataSource<IDetConcepto> = new MatTableDataSource([]);
  @ViewChild('pagExpandedConcepto', {static: false}) pagExpandedConcepto: MatPaginator;
  @ViewChild('mtExpandedConcepto', {static: false}) mtExpandedConcepto: MatTable<IDetConcepto>;
  aDetailConcepto: Array<IDetConcepto>;
  expandedMoreConcepto: IConcepto;

  constructor(
    public service:AsientopllaService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private _snackBar: MatSnackBar,
    private _modalService: NgbModal
  ) { }


  async ngOnInit(): Promise<void>  {
    this.spinner.show('spi_conceptos');
    await this.cboGetPlanilla();
    await this.cboGetConcepto();
    await this.loadConcepto();
    this.spinner.hide('spi_conceptos');
  }

  async loadConcepto() {

    let codDevengue = this.fromParent.codDevengue;
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    await this.service.cargarConceptosSinCuenta(codDevengue, nIdEmp).then( (value: any) => {

      Object.values ( value ).forEach( (lista: any, iLista: number) => {
        switch (iLista) {
          // Lista Main
          case 1:
            if(lista.data.length > 0){

              const aMain = lista.data as Array<IConcepto>;
              this.ConceptoDS = new MatTableDataSource<IConcepto>(aMain);
              this.ConceptoDS.paginator = this.pagConcepto;

              // Lista Expanded
              this.aDetailConcepto = lista.detail as Array<IDetConcepto>;
            }else{
              this.showAlert('Sin registros encontrados', 'Alerta', 5);
              this.closeModal();
            }
            break;
        }
      });

    }, error => {
      this._snackBar.open(error.error.errors[0].message, "Cerrar", {
        duration: 1000,
        horizontalPosition: "right",
        verticalPosition: "top",
      });
    });
  }

  async clickExpandedConcepto(row: IConcepto) {

    if ( this.expandedMoreConcepto === row ) {
      // Limpiar
      this.expandedMoreConcepto = null;
      this.ExpandedConceptoDS = new MatTableDataSource([]);

      if (this.ExpandedConceptoDS.paginator) {
        this.ExpandedConceptoDS.paginator.firstPage();
      }

    } else {

      let aFilter: IDetConcepto[] = [];

      Object.values(this.aDetailConcepto).forEach((element: any) => {
        if (element.codPlla === row.codPlla ) {
          aFilter.push(element);
        }
      });

      this.ExpandedConceptoDS = new MatTableDataSource<IDetConcepto>(aFilter);
      this.ExpandedConceptoDS.paginator = null;
      // this.ExpandedConceptoDS.paginator = this.pagExpandedConcepto;

      this.expandedMoreConcepto = row;
      this.mtExpandedConcepto.renderRows();
    }
  }

  showAlert(data: string, titulo: string, duration: number) {
    this._snackBar.open(data, titulo, {
      duration: duration * 10000,
      verticalPosition: "top"
    });
  }

  closeModal() {
    const oReturn = new Object();
    oReturn['modal'] = 'concepto';
    oReturn['value'] = 'loadAgain';
    this.activeModal.close(oReturn);
  }

  async cboGetPlanilla() {
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    await this.service.cargarPlanilla(nIdEmp).then( (value: any) => {
      if(value.success === true){
        this.cboPlanilla = value.response.data;
      }else{
        Swal.fire('', value.errors[0].message);
        this.spinner.hide('spi_mantenimiento');
      }
    });
  }

  async cboGetConcepto() {
    const nIdPais = JSON.parse(localStorage.getItem('Pais'));

    await this.service.cargarConceptos(nIdPais).then( (value: any) => {
      if(value.success === true){
        this.cboConcepto = value.response.data;
      }else{
        Swal.fire('', value.errors[0].message);
        this.spinner.hide('spi_mantenimiento');
      }
    });
  }

  viewDetail(element: any) {
    this.opcMantenimiento = 1;
    this.aMatriz.codPlla = element.codPlla;
    this.aMatriz.codConcepto = element.codConcepto;

    const nIdPais = JSON.parse(localStorage.getItem('Pais'));
    this.service.cargarMatriz(nIdPais).then( (value: any) => {
      this.aListado = value.response.data;
      this.openModal('matriz', this.aListado);
    });

  }

  openModal(name: string, aListado: IMantenimiento[]) {

    const modalRef = this._modalService.open(MODALS[name], this.NgbModalOptions);
    const obj = new Object();

    switch (name) {
      case 'matriz':
        obj['aMatriz'] = this.aMatriz;
        obj['aListado'] = aListado;
        obj['opcMantenimiento'] = this.opcMantenimiento;
        obj['concepto'] = true;
        modalRef.componentInstance.fromParent = obj;
        break;
    }

    modalRef.result.then(async (result) => {

      switch (result.modal) {
        case 'matriz':
          if (result.value === 'loadAgain') {
            await this.loadConcepto();
          }
          break;
      }

    }, (reason) => { });

  }

}
