import { Component, OnInit, ViewChild, Input, Type } from '@angular/core';
import { AsientopllaService } from '../../services/asientoplla.service';
import { AsientoPllaAnimations } from '../../Animations/adminp.animations';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { Icalcular, ICalcDetalle } from '../../Model/Iasientoplla';
import { MatPaginator } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbModal, NgbActiveModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { startWith, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ModalConceptoComponent } from '../modalConcepto/modalConcepto.component';

// Modals
const MODALS: { [name: string]: Type<any> } = {
  concepto: ModalConceptoComponent
};

@Component({
  selector: 'app-modalAsientoplla',
  templateUrl: './modalAsientoplla.component.html',
  styleUrls: ['./modalAsientoplla.component.css', './modalAsientoplla.component.scss'],
  providers: [ AsientopllaService],
  animations: [ AsientoPllaAnimations ]
})
export class ModalAsientopllaComponent implements OnInit {

  @Input() fromParent;

  // FormGroup
  fgCalcular: FormGroup;

  // Fab
  fbCalcular = [
    {icon: 'save', dis: false, tool: 'Generar Asientos'},
    {
      icon: "list_alt",
      tool: "Conceptos sin cuenta contable",
      badge: 3
    }
  ];
  abCalcular = [];
  tsCalcular = 'inactive';

  // Progress Bar
  pbCal: boolean;

  // Combobox
  cboPlanilla = new Array();
  cboTipos = new Array();
  cboCentroCostosCalc = new Array();
  sHeaderDevengue: string = '';
  inEstado: number = 0;

   // MODAL CALCULAR
  // PRINCIPAL
  CalcDC: string[] = ['planilla', 'glosa', 'totalHaber', 'totalDebe', 'more'];
  CalcDS: MatTableDataSource<Icalcular> = new MatTableDataSource([]);
  @ViewChild('pagCalc', {static: true}) pagCalc: MatPaginator;

  // DETALLE
  ExpandedCalcDC: string[] = [ 'centroCosto', 'cuentaContable', 'importe'];
  ExpandedCalcDS: MatTableDataSource<ICalcDetalle> = new MatTableDataSource([]);
  @ViewChild('pagExpandedCalc', {static: false}) pagExpandedCalc: MatPaginator;
  @ViewChild('mtExpandedCalc', {static: false}) mtExpandedCalc: MatTable<ICalcDetalle>;
  aDetailCalc: Array<ICalcDetalle>;
  expandedMoreCalc: Icalcular;

  // AutoComplete
  foCentroCosto: Observable<any[]>;

  codDevengue: string = '';

  lista: Icalcular[] = [];

  NgbModalOptions: NgbModalOptions = {
    size: 'lg',
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
    this.new_fgCalcular();
  }

  new_fgCalcular() {
    this.fgCalcular = this.fb.group({
      planilla: '',
      cuentaContable: '',
      sTipo: '',
      centroCosto: [{ value: '', disabled: true }],
    });

    this.foCentroCosto = this.fgCalcular.controls['centroCosto'].valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, 1))
      );

    this.fgCalcular.valueChanges.subscribe(value => {
      const filter = { ...value, name: value.cuentaContable } as string;
      this.CalcDS.filter = filter;

      if (this.CalcDS.paginator) {
        this.CalcDS.paginator.firstPage();
      }

      this.expandedMoreCalc = null;
    });
  }

  get getCalcular() { return this.fgCalcular.controls; }

  async ngOnInit(): Promise<void>  {
    this.spinner.show('spi_calcular');
    this.codDevengue = this.fromParent.codDevengue.split('|')[0];
    await this.cboGetPlanilla();
    await this.cboGetTipos();
    await this.loadCalcular(this.codDevengue);
    this.spinner.hide('spi_calcular');
    this.onToggleFab(1, 1);
  }

  onToggleFab(fab: number, stat: number) {

    switch (fab) {
      case 1:
        stat = ( stat === -1 ) ? ( this.abCalcular.length > 0 ) ? 0 : 1 : stat;
        this.tsCalcular = ( stat === 0 ) ? 'inactive' : 'active';
        this.abCalcular = ( stat === 0 ) ? [] : this.fbCalcular;
        break;
    }
  }

  async clickFab(opc: number, index: number) {

    switch (opc) {
      case 0:
        Swal.fire({
          title: '¿ Estas seguro de guardar los asientos?',
          text: '',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#ff4081',
          confirmButtonText: 'Confirmar !',
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {

           this.saveAsientos();
          }
        });
        break;

      case 1:

        this.openModal('concepto');
        break;
    }
  }

  openModal(name: string) {

    const modalRef = this._modalService.open(MODALS[name], this.NgbModalOptions);
    const obj = new Object();

    switch (name) {
      case 'concepto':
        obj['codDevengue'] = this.codDevengue;
        modalRef.componentInstance.fromParent = obj;
        this.onToggleFab(1, -1);
        break;
    }

    modalRef.result.then(async (result) => {

      switch (result.modal) {
        case 'concepto':
          if (result.value === 'loadAgain') {
            await this.loadCalcular(this.codDevengue);
            this.onToggleFab(1, 1);
          }
          break;
      }

    }, (reason) => { });

  }

  async cboGetPlanilla() {
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    await this.service.cargarPlanilla(nIdEmp).then( (value: any) => {
      if(value.success === true){
        this.cboPlanilla = value.response.data;
      }else{
        Swal.fire('', value.errors[0].message);
        this.spinner.hide('spi_calcular');
      }
    });
  }

  async cboGetTipos() {
    await this.service.cargarTipos().then( (value: any) => {
      if(value.success === true){
        this.cboTipos = value.response.data;
      }else{
        Swal.fire('', value.errors[0].message);
        this.spinner.hide('spi_calcular');
      }
    });
  }

  async saveAsientos(){
    this.spinner.show('spi_calcular');

    if(this.inEstado < 2){



    }else{

    let cabecera: any[] = [];
    this.lista.forEach(element => {
      cabecera.push({
        nIdDevengue: this.codDevengue,
        nIdPlla: element.codigo,
        nAsiento: element.asiento,
        sGlosa: element.glosa
      })
    });

    let detalles: any[] = [];
    this.aDetailCalc.forEach(element => {
      detalles.push({
        nIdAsiPlla: 0,
        nIdCentroCosto: element.codCentroCosto,
        nCuenta: element.cuentaContable,
        nImporte: element.importe
      });
    });

      this.service.guardarAsientoPlla(cabecera, detalles).subscribe(data => {
        if (data.success === true) {
          this.showAlert('Asientos agregados', "Completado", 5);

          const oReturn = new Object();

          oReturn['modal'] = 'asientoplla';
          oReturn['value'] = 'loadAgain';

          this.spinner.hide('spi_matriz');
          this.activeModal.close(oReturn);
          this.pbCal = false;

          this.spinner.hide('spi_calcular');

        }
        else {
          this.showAlert(data, "Error", 5);
          this.spinner.hide('spi_calcular');
        }
      }, err => {
        console.log(err);
        this.spinner.hide('spi_calcular');
      });
    }
  }

  generarFechaLocal(fecha: Date) {
    const year = fecha.getFullYear();
    const month = (fecha.getMonth() + 1) < 10 ? '0' + (fecha.getMonth() + 1) : fecha.getMonth() + 1;
    const day = (fecha.getDate() < 10 ? '0' + (fecha.getDate()) : (fecha.getDate()));

    return year + '-' + month + '-' + day;
  }

  async loadCalcular(devengue: string) {

    this.codDevengue = devengue.split('|')[0];
    let nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    await this.service.cargarAsientos(this.codDevengue, nIdEmp).then( (value: any) => {

      Object.values ( value ).forEach( (lista: any, iLista: number) => {
        switch (iLista) {
          // Lista Main
          case 1:
            if(lista.data.length > 0){

              this.sHeaderDevengue = lista.data[0].devengue;
              this.inEstado = lista.data[0].nIdEstado;

              if(this.inEstado < 2){
                this.fbCalcular[0].dis = true;
                this.fbCalcular[0].tool = 'Guardar Temporalmente';
              }

              this.service.cargarContador(this.codDevengue).then((result: any) => {
                this.fbCalcular[1].badge = result.response.data[0].contador;
              });

              const aMain = lista.data as Array<Icalcular>;
              this.lista = lista.data;
              this.CalcDS = new MatTableDataSource<Icalcular>(aMain);
              this.CalcDS.paginator = this.pagCalc;

              this.CalcDS.filterPredicate = function(data: Icalcular, filter: string): boolean {
                return data.planilla.trim().toLowerCase().includes(filter);
              };

              this.CalcDS.filterPredicate = ((data: Icalcular, filter: any ) => {
                const a = !filter.planilla || data.planilla === filter.planilla;
                const b = this.cantPersoCalcular(data.codigo) > 0;
                return a && b;
              }) as (PeriodicElement, string) => boolean;

              // Lista Expanded
              this.aDetailCalc = lista.detail as Array<ICalcDetalle>;
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

  cantPersoCalcular(idPlanilla: any) {

    const sTextCalc = this.fgCalcular.controls['cuentaContable'].value as string;
    const sTextCalc2 = this.fgCalcular.controls['centroCosto'].value as string;
    let detail: ICalcDetalle[] = [];

    Object.values(this.aDetailCalc).forEach((element: any) => {
      if (element.codigo === idPlanilla ) {
        detail.push(element);
      }
    });

      const aFilterCalc = detail.filter( (x: any) => {
      const b = !sTextCalc || x.cuentaContable.toLowerCase().includes(sTextCalc.toLowerCase());
      const c = !sTextCalc2 || x.centroCosto.toLowerCase().includes(sTextCalc2.toLowerCase());
      return b & c;
    });

    return aFilterCalc.length;
  }

  async clickExpandedCalcular(row: Icalcular) {

    if ( this.expandedMoreCalc === row ) {
      // Limpiar
      this.expandedMoreCalc = null;
      this.ExpandedCalcDS = new MatTableDataSource([]);

      if (this.ExpandedCalcDS.paginator) {
        this.ExpandedCalcDS.paginator.firstPage();
      }

    } else {

      let aFilter: ICalcDetalle[] = [];

      Object.values(this.aDetailCalc).forEach((element: any) => {
        if (element.codigo === row.codigo ) {
          aFilter.push(element);
        }
      });

      if ( this.fgCalcular.controls['cuentaContable'].value !== '' ) {
        let sFilter = this.fgCalcular.controls['cuentaContable'].value as string;
        sFilter = sFilter.trim().toLowerCase();
        aFilter = this.aDetailCalc.filter( x => {
          return  x.cuentaContable.trim().toLowerCase().includes(sFilter);
        });
      }

      if ( this.fgCalcular.controls['centroCosto'].value !== '' ) {
        let sFilter = this.fgCalcular.controls['centroCosto'].value as string;
        sFilter = sFilter.trim().toLowerCase();
        aFilter = this.aDetailCalc.filter( x => {
          return  x.centroCosto.trim().toLowerCase().includes(sFilter);
        });
      }


      this.ExpandedCalcDS = new MatTableDataSource<ICalcDetalle>(aFilter);
      this.ExpandedCalcDS.paginator = null;
      // this.ExpandedCalcDS.paginator = this.pagExpandedCalc;

      this.expandedMoreCalc = row;
      this.mtExpandedCalc.renderRows();
    }
  }

  async cboGetCentroCostoCalcular(codigo: number) {
    const cboCentroCostoCalcular = new Array();
    this.fgCalcular.controls['centroCosto'].setValue('');
    this.fgCalcular.controls['centroCosto'].disable();

    if (codigo !== undefined) {
      await this.service.obtenerCentroCostos(codigo).then( (value: any) => {
        this.cboCentroCostosCalc = value.response.data;

        this.cboCentroCostosCalc.forEach( x => {
          cboCentroCostoCalcular.push(x);
        });

        this.cboCentroCostosCalc = cboCentroCostoCalcular;
        this.fgCalcular.controls['centroCosto'].enable();
      });
    }
  }

  private _filter(value: any, opc: number): any[] {

    let aFilter = new Array();

    if ( value !== undefined && value !== null ) {
      let filterValue: any;
      if ( value instanceof Object ) {
        filterValue = value.cuentaContable.trim().toLowerCase();
      } else {
        filterValue = value.trim().toLowerCase();
      }

      switch (opc) {
        case 1:
          aFilter = this.cboCentroCostosCalc.filter( x => x.descripcion.trim().toLowerCase().includes(filterValue) );
          break;

        case 2:
          aFilter = this.aDetailCalc.filter( x => {
            const a = x.cuentaContable.trim().toLowerCase().includes(filterValue);
            return a;
          }).slice(0, 3);
          break;
      }

    }
    return aFilter;
  }

  showAlert(data: string, titulo: string, duration: number) {
    this._snackBar.open(data, titulo, {
      duration: duration * 10000,
      verticalPosition: "top"
    });
  }

  closeModal() {
    const oReturn = new Object();
    this.codDevengue = '0';
    this.activeModal.close(oReturn);
  }

}
