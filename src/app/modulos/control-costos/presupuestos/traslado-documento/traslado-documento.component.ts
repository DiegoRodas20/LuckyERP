import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { DialogDetalleDocumentoComponent } from './components/dialog-detalle-documento/dialog-detalle-documento.component';
import { TrasladoDocumentoService } from '../traslado-documento.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { saveAs } from 'file-saver';
import { startWith, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { MatSort } from '@angular/material/sort';

interface Documento {
  nIdCentroCosto: number;
  sCodCC: string;
}

@Component({
  selector: 'app-traslado-documento',
  templateUrl: './traslado-documento.component.html',
  styleUrls: ['./traslado-documento.component.css']
})
export class TrasladoDocumentoComponent implements OnInit {
  form: FormGroup;
  displayedColumns: string[] = ['opciones', 'ccosto', 'doc', 'numero', 'titulo', 'solicitante', 'nombreSolicita', 'total', 'year', 'mes', 'nombreEjecutivo'];
  dataSource: MatTableDataSource<any>;
  listaCabeceraDocumento: any;
  listaDocumento: any;
  listaTipoDocumento: any;
  validarDocumento: any;
  datosPresupuesto: any;
  nIdEmpresa: string;
  listaPresupuesto: any;
  existeDocumento: boolean;
  disabledButton = true;
  filteredDocumento: Observable<Documento>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) Sorter: MatSort;

  constructor(private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private cdRef: ChangeDetectorRef,
    public dialog: MatDialog,
    private trasladoService: TrasladoDocumentoService) {
      this.crearFormulario();
    }

  async ngOnInit() {
    this.spinner.show();
    this.nIdEmpresa = localStorage.getItem('Empresa');
    this.listaPresupuesto = await this.trasladoService.listarCabeceraDocumentos(7, `${this.nIdEmpresa}`);
    // console.log('LISTA PRESUPUESTO', this.listaPresupuesto);
    this.listaTipoDocumento = await this.trasladoService.listarCabeceraDocumentos(4, '');
    this.existeDocumento = true;
    this.listaDocumento = await this.trasladoService.listarCabeceraDocumentos(3, '');
    this.filteredDocumento = this.form.controls['documento'].valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.sCodCC),
      map(sCodCC => sCodCC ? this._filterDocumento(sCodCC) : this.listaDocumento.slice())
    );
    this.spinner.hide();
    // Mostramos el primer campo
    // await this.mostrarPrimerResultado();
    this.form.controls.tipo.setValue(this.listaTipoDocumento[0].cEleCod);
  }

  async mostrarPrimerResultado() {
    if ( this.listaDocumento.length > 0 ) {
      this.form.controls.documento.setValue(this.listaDocumento[0].sCodCC);
      this.form.controls.tipo.setValue(this.listaTipoDocumento[1].cEleCod);
      this.listaCabeceraDocumento = await this.trasladoService.listarCabeceraDocumentos(1, `${this.listaDocumento[0].sCodCC}|${this.listaTipoDocumento[1].cEleCod}`);
      await this.llenarCabecera(this.listaDocumento[0].sCodCC);
      this.dataSource = new MatTableDataSource(this.listaCabeceraDocumento);
      this.cdRef.detectChanges();
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.Sorter
      this.cdRef.detectChanges();
    }
  }

  private _filterDocumento(sCodCC: string) {
    const filterValue = sCodCC.toLocaleLowerCase();
    return this.listaDocumento.filter(option => option.sCodCC.toLocaleLowerCase().indexOf(filterValue) === 0);
  }

  crearFormulario() {
    this.form = this.fb.group({
      'documento': [null],
      'tipo': [''],
      'nombre': [''],
      'cliente': [''],
      'estado': ['']
    });
  }


  verDetalle(data): void {
    const dialogRef = this.dialog.open(DialogDetalleDocumentoComponent, {
      width: '100%',
      height: '90%',
      data: {
        'data': data,
        'datosCabecera': this.datosPresupuesto,
      }
    });
    dialogRef.afterClosed().subscribe(async result => {
      if(result === 1) {
        let documento = this.form.get('documento').value === null ? '' : this.form.get('documento').value;
        let tipo = this.form.get('tipo').value;
        this.listaCabeceraDocumento = await this.trasladoService.listarCabeceraDocumentos(1, `${documento}|${tipo}`);
        await this.llenarCabecera(documento);
        this.dataSource = new MatTableDataSource(this.listaCabeceraDocumento);
        this.cdRef.detectChanges();
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.Sorter;
      }
    });
  }

  async buscarDocumento(){
    // let documento = this.form.get('documento').value;
    let documento = this.form.get('documento').value === null ? '' : this.form.get('documento').value;
    let tipo = this.form.get('tipo').value;
    if ( this.existeDocumento && tipo !== 0 ) {
      this.spinner.show();
      this.listaCabeceraDocumento = await this.trasladoService.listarCabeceraDocumentos(1, `${documento}|${tipo}`);
      await this.llenarCabecera(documento);
      if(this.listaCabeceraDocumento.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'No hay documentos a trasladar',
          showConfirmButton: false,
          timer: 1500
        })
      }
      this.dataSource = new MatTableDataSource(this.listaCabeceraDocumento);
      this.cdRef.detectChanges();
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.Sorter;
      this.spinner.hide();
      this.cdRef.detectChanges();
    } else {
      await Swal.fire({
        icon: 'warning',
        title: 'El presupuesto no existe o no ha escogido un tipo de documento',
        showConfirmButton: false,
        timer: 1500
      });
      return;
    }
  }

  async llenarCabecera(documento) {
    this.datosPresupuesto = await this.trasladoService.listarCabeceraDocumentos(5, `${documento}`);
    this.form.controls.nombre.setValue(this.datosPresupuesto.sDesCC);
    this.form.controls.cliente.setValue(this.datosPresupuesto.sRazonSocial);
    this.form.controls.estado.setValue(this.datosPresupuesto.cEleNam);
  }

  cambioTipo(event) {
    this.listaCabeceraDocumento = [];
    this.dataSource = new MatTableDataSource(this.listaCabeceraDocumento);
    this.cdRef.detectChanges();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.Sorter;
    this.spinner.hide();
    this.cdRef.detectChanges();
  }

  validarPresupuesto(event) {
    if (event.length === 6) {
      this.disabledButton = false;
    } else {
      this.disabledButton = true;
      this.listaCabeceraDocumento = [];
      this.dataSource = new MatTableDataSource(this.listaCabeceraDocumento);
      this.cdRef.detectChanges();
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.Sorter;
      this.spinner.hide();
      this.cdRef.detectChanges();
    }
  }

  get documentoNotFound() {
    if ( this.form.get('documento').touched ) {
      // let sCodCC = this.form.get('documento').value;
      let sCodCC = this.form.get('documento').value === null ? '' : this.form.get('documento').value;
      if ( sCodCC.length === 6  ) {
        // this.countValidacion = true;
        // if (this.countValidacion) {
        //   this.spinner.show();
        //   this.validarDocumento = this.trasladoService.listarCabeceraDocumentos(6, `${sCodCC}|`);
        //   this.spinner.hide();
        //   this.countValidacion = false;
        // }
      } else {
        return true;
      }
      // const listaTemp = this.listaDocumento.filter(option => option.sCodCC === sCodCC);
      // if ( listaTemp.length === 0 ) {
      //   this.existeDocumento = false;
      //   return true;
      // } else {
      //   this.existeDocumento = true;
      //   return false;
      // }
    }
    return false;
  }

  obtenerNombreMes(mes): string {
    let sMes: string;
    switch (mes) {
      case '01':
        sMes = 'Enero';
        break;
      case '02':
        sMes = 'Febrero';
        break;
      case '03':
        sMes = 'Marzo';
        break;
      case '04':
        sMes = 'Abril';
        break;
      case '05':
        sMes = 'Mayo';
        break;
      case '06':
        sMes = 'Junio';
        break;
      case '07':
        sMes = 'Julio';
        break;
      case '08':
        sMes = 'Agosto';
        break;
      case '09':
        sMes = 'Septiembre';
        break;
      case '10':
        sMes = 'Octubre';
        break;
      case '11':
        sMes = 'Noviembre';
        break;
      case '12':
        sMes = 'Diciembre';
        break;
      
    
      default:
        sMes = '';
        break;
      
    }
    return sMes;
  }

}
