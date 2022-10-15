import { Component, OnInit, ViewChild, Type, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AsientopllaService } from '../../services/asientoplla.service';
import { AsientoPllaAnimations } from '../../Animations/adminp.animations';
import { MatTableDataSource } from '@angular/material/table';
import { IMantenimiento, IMatriz } from '../../Model/Iasientoplla';
import { MatPaginator } from '@angular/material/paginator';
import { NgbModalOptions, NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { ModalMatrizComponent } from './modalMatriz/modalMatriz.component';

// Modals
const MODALS: { [name: string]: Type<any> } = {
  matriz: ModalMatrizComponent
};

@Component({
  selector: 'app-modalMantenimientos',
  templateUrl: './modalMantenimientos.component.html',
  styleUrls: ['./modalMantenimientos.component.css', './modalMantenimientos.component.scss'],
  providers:[AsientopllaService],
  animations:[AsientoPllaAnimations]
})
export class ModalMantenimientosComponent implements OnInit {

  @Input() fromParent;

  // FormGroup
  fgMant: FormGroup;

  // Fab
  fbNew = [
    {icon: 'list_alt', tool: 'Nuevo'}
  ];
  abMant = [];
  tsMant = 'inactive';

  // Progress Bar
  pbMant: boolean;

  // Opcion Mantenimiento
  aMatriz: IMatriz = new IMatriz(0, '0', '0', false, '0', '');
  aListado: IMantenimiento[] = [];
  opcMantenimiento: number;
  mMantenimiento = 0;

  // MODAL MANTENIMIENTOS
  MantDC: string[] = ['action', 'planilla', 'concepto', 'cuentaContable', 'tipo'];
  MantDS: MatTableDataSource<IMantenimiento> = new MatTableDataSource([]);
  @ViewChild('pagMantenimiento', {static: true}) pagMantenimiento: MatPaginator;

  guardarMantenimiento: number = 1;

  // Combobox
  cboConcepto = new Array();
  cboPlanilla = new Array();

  NgbModalOptions: NgbModalOptions = {
    size: 'md',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };

  constructor(
    public service:AsientopllaService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    public activeModal: NgbActiveModal,
    private _modalService: NgbModal
  ) {
    this.new_fgMant();
  }

  new_fgMant() {
    this.fgMant = this.fb.group({
      concepto: '',
      planilla: '',
      cuentaContable: ''
    });

    this.fgMant.valueChanges.subscribe(value => {
      const filter = { ...value, name: value.cuentaContable } as string;
      this.MantDS.filter = filter;

      if (this.MantDS.paginator) {
        this.MantDS.paginator.firstPage();
      }
    });
  }

  get getMant() { return this.fgMant.controls; }

  async ngOnInit(): Promise<void>  {
    this.spinner.show('spi_mantenimiento');
    await this.cboGetPlanilla();
    await this.cboGetConcepto();
    await this.loadMatriz();
    this.spinner.hide('spi_mantenimiento');
    this.onToggleFab(1, 1);
  }

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = ( stat === -1 ) ? ( this.abMant.length > 0 ) ? 0 : 1 : stat;
        this.tsMant = ( stat === 0 ) ? 'inactive' : 'active';
        this.abMant = ( stat === 0 ) ? [] : this.fbNew;
        break;
    }
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.opcMantenimiento = 1;
        this.openModal('matriz');
        break;
    }
  }

  openModal(name: string) {

    const modalRef = this._modalService.open(MODALS[name], this.NgbModalOptions);
    const obj = new Object();

    switch (name) {
      case 'matriz':
        obj['aMatriz'] = this.aMatriz;
        obj['aListado'] = this.aListado;
        obj['opcMantenimiento'] = this.opcMantenimiento;
        modalRef.componentInstance.fromParent = obj;
        break;
    }

    modalRef.result.then(async (result) => {

      switch (result.modal) {
        case 'matriz':
          if (result.value === 'loadAgain') {
            this.mMantenimiento = this.mMantenimiento + 1;
            await this.loadMatriz();
          }
          break;
      }

    }, (reason) => { });

  }

  viewDetail(element: any) {
    this.opcMantenimiento = 2;
    this.aMatriz = element;
    this.openModal('matriz');
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

  async loadMatriz() {

    const nIdPais = JSON.parse(localStorage.getItem('Pais'));

    await this.service.cargarMatriz(nIdPais).then( (value: any) => {

      Object.values ( value ).forEach( (lista: any, iLista: number) => {
        switch (iLista) {
          // Lista Main
          case 1:
            const aMainMant = lista.data as Array<IMantenimiento>;
            this.aListado = lista.data;
            this.MantDS = new MatTableDataSource<IMantenimiento>(aMainMant);
            this.MantDS.paginator = this.pagMantenimiento;

            this.MantDS.filterPredicate = function(data: IMantenimiento, filter: string): boolean {
              return data.concepto.trim().toLowerCase().includes(filter);
            };

            this.MantDS.filterPredicate = ((data: IMantenimiento, filter: any ) => {
              const a = !filter.planilla || data.planilla === filter.planilla;
              const b = !filter.concepto || data.concepto === filter.concepto;
              const c = !filter.cuentaContable || data.cuentaContable === filter.cuentaContable;
              return a && b && c;
            }) as (PeriodicElement, string) => boolean;
        }
      });

    }, error => {
      console.log(error.error);
      this.spinner.hide('spi_mantenimiento');
    });
  }

  showAlert(data: string, titulo: string, duration: number) {
    this._snackBar.open(data, titulo, {
      duration: duration * 1000,
      verticalPosition: "top"
    });
  }

  closeModal() {
    const oReturn = new Object();
    oReturn['modal'] = 'detail';
    oReturn['value'] = this.mMantenimiento;
    this.activeModal.close(oReturn);
  }
}
