import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { input_ModalUbic, Lista_Registro_Ingreso } from '../../models/listasIngreso.model';
import { Ubicacion_Articulo } from '../../models/registroIngreso.models';
import { RegistroIngresoService } from '../../registro-ingreso.service';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-articulo-ubicacion',
  templateUrl: './articulo-ubicacion.component.html',
  styleUrls: ['./articulo-ubicacion.component.css'],
  providers: [DecimalPipe]
})
export class ArticuloUbicacionComponent implements OnInit {

  lUbicacion: Lista_Registro_Ingreso[] = [];
  vEmpresaActual: Lista_Registro_Ingreso;
  inputModal: input_ModalUbic;

  lUbicacionArticulo: Ubicacion_Articulo[] = [];

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Ubicacion_Articulo>;
  displayedColumns = ['opcion', 'sEmpresaActual', 'sCliente', 'sUbicacion', 'sArticulo', 'sFechaIngreso', 'sFechaVence',
    'nIngreso'];

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual
  sEmpresa: string; //nombre Empresa

  matcher = new MyErrorStateMatcher();

  nStock: number = 0;

  formArticulo: FormGroup;

  formUbicacion: FormGroup;

  bSoloLecturaPrecioUnitario: boolean = false;

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: input_ModalUbic,
    public dialog: MatDialog,
    private decimalPipe: DecimalPipe,
    @Inject('BASE_URL') baseUrl: string,
    public dialogRef: MatDialogRef<ArticuloUbicacionComponent>,
  ) { this.url = baseUrl; this.inputModal = data; }

  ngOnInit(): void {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formArticulo = this.formBuilder.group({
      txtArticulo: [''],
      txtVolumenUnd: [''],
      txtPesoUnd: [''],
      txtUndMedida: [''],
      txtUnidades: [''],
      txtVolumenTotal: [''],
      txtPesoTotal: [''],
      txtPorUbicar: ['']
    })

    this.formUbicacion = this.formBuilder.group({
      cboUbicacion: ['', Validators.required],
      txtCantidad: ['', [Validators.required, Validators.min(1)]]
    });

    this.lUbicacionArticulo = this.inputModal.lUbicacion;
    this.lUbicacion = this.inputModal.lUbicacionesAlmacen;
    this.vEmpresaActual = this.inputModal.vEmpresaActual;
    this.dataSource = new MatTableDataSource(this.lUbicacionArticulo);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngAfterViewInit() {
    setTimeout(() => {

      //Para que no haya error de ngAfterContentChecked
      if (this.inputModal.bRegistrando) {
        this.displayedColumns = ['opcion', 'sEmpresaActual', 'sUbicacion', 'sCliente', 'sArticulo', 'sFechaIngreso', 'sFechaVence',
          'nIngreso'];
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      } else {
        this.displayedColumns = ['sEmpresaActual', 'sUbicacion', 'sCliente', 'sArticulo', 'sFechaIngreso', 'sFechaVence',
          'nIngreso'];
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
      this.fnLlenarArticulo();
    });
  }

  fnAgregarUbicacion() {
    if (this.formUbicacion.controls.cboUbicacion.invalid) {
      Swal.fire('¡Verificar!', 'Seleccione una ubicación', 'warning')
      return;
    }

    if (this.formUbicacion.controls.txtCantidad.invalid) {
      Swal.fire('¡Verificar!', 'Ingrese una cantidad válida', 'warning')
      return;
    }
    var vDatos = this.formUbicacion.value;

    var vDatosArt = this.formArticulo.value;
    if (vDatos.txtCantidad > vDatosArt.txtPorUbicar) {
      Swal.fire('¡Verificar!', 'Las unidades para ingresar no pueden ser mayores a las unidades por ubicar', 'warning')
      return;
    }

    if (this.lUbicacionArticulo.findIndex(item => item.nIdUbicacion == vDatos.cboUbicacion.nId) != -1) {
      Swal.fire('¡Verificar!', 'La ubicación indicada ya ha sido registrada en este artículo', 'warning');
      this.formUbicacion.controls.cboUbicacion.setValue('');
      return;
    }

    var nIdMax = 0;

    this.lUbicacionArticulo.forEach(item => {
      if (item.nId > nIdMax) { nIdMax = item.nId; }
    })

    var vUbicacion: Ubicacion_Articulo = {
      nId: nIdMax + 1,
      nIdDetalleArticulo: this.inputModal.vArticuloDetalle.nId,
      sEmpresaActual: this.vEmpresaActual.sDescripcion,
      nIdUbicacion: vDatos.cboUbicacion.nId,
      sUbicacion: vDatos.cboUbicacion.sDescripcion.split('-')[0].trim(),
      sCliente: this.inputModal.sCliente,
      sArticulo: this.inputModal.vArticuloDetalle.sArticulo,
      sFechaIngreso: this.inputModal.vArticuloDetalle.sFechaIngreso,
      sFechaVence: this.inputModal.vArticuloDetalle.sFechaExpira,
      nIngreso: Math.round(vDatos.txtCantidad),
    }

    this.formArticulo.controls.txtPorUbicar.setValue(Math.round(vDatosArt.txtPorUbicar - vDatos.txtCantidad));
    this.lUbicacionArticulo.push(vUbicacion);

    this.formUbicacion.controls.cboUbicacion.setValue('');
    this.formUbicacion.controls.txtCantidad.setValue('');

    this.dataSource = new MatTableDataSource(this.lUbicacionArticulo);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  fnGuardar() {
    this.dialogRef.close(
      {
        lUbicacion: this.lUbicacionArticulo,
        nPorUbicar: this.formArticulo.controls.txtPorUbicar.value
      });
  }

  fnLlenarArticulo() {
    this.formArticulo.controls.txtArticulo.setValue(this.inputModal.vArticuloDetalle.sArticulo)
    this.formArticulo.controls.txtVolumenUnd.setValue(this.decimalPipe.transform(this.inputModal.vArticuloDetalle.nVolumenUnd, '1.6-6'))
    this.formArticulo.controls.txtPesoUnd.setValue(this.decimalPipe.transform(this.inputModal.vArticuloDetalle.nPesoUnd, '1.2-2'))
    this.formArticulo.controls.txtUndMedida.setValue(this.inputModal.vArticuloDetalle.sUndMedida)
    this.formArticulo.controls.txtUnidades.setValue(this.inputModal.vArticuloDetalle.nUnidades)
    this.formArticulo.controls.txtVolumenTotal.setValue(this.decimalPipe.transform(this.inputModal.vArticuloDetalle.nVolumenTotal, '1.6-6'))
    this.formArticulo.controls.txtPesoTotal.setValue(this.decimalPipe.transform(this.inputModal.vArticuloDetalle.nPesoTotal, '1.2-2'))
    this.formArticulo.controls.txtPorUbicar.setValue(this.inputModal.vArticuloDetalle.nPorUbicar)
  }

  fnEliminarUbicacion(row: Ubicacion_Articulo) {

    var vDatosArt = this.formArticulo.value;

    this.lUbicacionArticulo = this.lUbicacionArticulo.filter(item => item.nId != row.nId);
    this.formArticulo.controls.txtPorUbicar.setValue(Math.round(vDatosArt.txtPorUbicar + row.nIngreso));

    this.dataSource = new MatTableDataSource(this.lUbicacionArticulo);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }

  fnRedondear(formControlName: string) {

    var valor: number = this.formUbicacion.get(formControlName).value;
    if (valor == null) return;
    this.formUbicacion.get(formControlName).setValue(Math.round(valor));

  }
}


