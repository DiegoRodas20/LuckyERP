import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { Almacen_RI } from '../models/listasIngreso.model';
import { Articulo_NI, Nota_Ingreso_RI } from '../models/notaIngreso.model';
import { RegistroIngresoService } from '../registro-ingreso.service';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}
@Component({
  selector: 'app-nota-ingreso-ri',
  templateUrl: './nota-ingreso-ri.component.html',
  styleUrls: ['./nota-ingreso-ri.component.css'],
  providers: [DecimalPipe]
})
export class NotaIngresoRIComponent implements OnInit {

  sTitulo = 'Agendar Nota Ingreso'
  vNota: Nota_Ingreso_RI;
  lDetalle: Articulo_NI[] = [];

  formIngreso: FormGroup;
  lAlmacen: Almacen_RI[] = [];
  lHoras: { sHora: string }[] = [];

  @ViewChild('matExpPresupuesto') matExpPresupuesto: MatExpansionPanel;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Articulo_NI>;
  displayedColumns = ['sArticulo', 'nCantidad', 'sObservacion'];

  //Variables para interaccion entre componentes
  @Input() pIdRegistro: number;
  @Input() sEstadoNotaIngreso: string;
  @Output() pMostrar = new EventEmitter<number>();

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  matcher = new ErrorStateMatcher();

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vRegIngreso: RegistroIngresoService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    @Inject('BASE_URL') baseUrl: string,
    private decimalPipe: DecimalPipe,
  ) { this.url = baseUrl; }

  async ngOnInit(): Promise<void> {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.lHoras = [
      { sHora: '09:00' },
      { sHora: '10:00' },
      { sHora: '11:00' },
      { sHora: '12:00' },
      { sHora: '13:00' },
      { sHora: '14:00' },
      { sHora: '15:00' },
      { sHora: '16:00' },
      { sHora: '17:00' },
      { sHora: '18:00' },
    ];

    this.formIngreso = this.formBuilder.group({
      txtSolicitante: [''],
      txtPresupuesto: [''],
      txtCliente: [''],
      txtDirector: [''],
      txtCanal: [''],
      txtEjecutivo: [''],
      txtServicios: [''],
      txtFechaInicio: [''],
      txtFechaFin: [''],
      cboAlmacen: ['', Validators.required],
      cboFechaIngreso: [moment(), Validators.required],
      cboHora: ['', Validators.required],
      cboHoraFin: ['', Validators.required],
      txtObservacion: [''],
      txtTotalUnd: [''],

      //Campos de auditoria
      txtEstado: [''],
      txtDocumento: [''],
      txtRegistro: [''],
      txtFechaRegistro: [''],
    })

    await this.fnListarAlmacen();
    await this.fnListarRegistroDetalle(this.pIdRegistro);
    await this.fnListarArticulosDetalle(this.pIdRegistro);

  }

  //#region listados para combos
  async fnListarAlmacen() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 4;

    pParametro.push(this.idUser);
    pParametro.push(this.pPais);

    try {
      this.lAlmacen = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.lAlmacen = this.lAlmacen.filter(item => item.nTipoAlmacen != 1853)
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarRegistroDetalle(nId: number) {
    this.spinner.show();

    var pEntidad = 4;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;

    pParametro.push(nId);

    try {
      const lRegistro = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.vNota = lRegistro[0];

      this.fnLlenarFormDetalle(this.vNota)
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarArticulosDetalle(nId: number) {
    this.spinner.show();

    var pEntidad = 4;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;

    pParametro.push(nId);

    try {
      const lArticulo = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.lDetalle = lArticulo;
      this.dataSource = new MatTableDataSource(this.lDetalle);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.fnLLenarUnidades();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  //#endregion

  //#region Llenado de inputs
  fnLLenarUnidades() {
    let totalUnd = 0;
    this.lDetalle.forEach(item => {
      totalUnd += item.nCantidad;
    })
    this.formIngreso.controls.txtTotalUnd.setValue(totalUnd);
  }

  fnLlenarFormDetalle(vNota: Nota_Ingreso_RI) {
    this.formIngreso.controls.txtPresupuesto.setValue(vNota.sDescripcion)
    this.formIngreso.controls.txtSolicitante.setValue(vNota.sSolicitante)
    this.formIngreso.controls.txtCliente.setValue(vNota.sNombreComercial)
    this.formIngreso.controls.txtDirector.setValue(vNota.sDirector)
    this.formIngreso.controls.txtCanal.setValue(vNota.sSubCanal)
    this.formIngreso.controls.txtEjecutivo.setValue(vNota.sEjecutivo)
    this.formIngreso.controls.txtServicios.setValue(vNota.sServicio)
    this.formIngreso.controls.txtFechaInicio.setValue(vNota.sFechaIni)
    this.formIngreso.controls.txtFechaFin.setValue(vNota.sFechaFin)
    this.formIngreso.controls.txtEstado.setValue(this.sEstadoNotaIngreso)
    this.formIngreso.controls.txtDocumento.setValue(vNota.sDocumento)
    this.formIngreso.controls.txtRegistro.setValue(vNota.sNombreCreador)
    this.formIngreso.controls.txtFechaRegistro.setValue(vNota.sFechaCreado)
    //Si la nota ya esta agendada
    if (vNota.nIdAlmacen != 0) {
      this.formIngreso.controls.cboAlmacen.setValue(vNota.nIdAlmacen)
      this.formIngreso.controls.cboFechaIngreso.setValue(moment(vNota.sFecha, 'DD/MM/YYYY'))
      this.formIngreso.controls.cboHora.setValue(vNota.sHora)
      this.formIngreso.controls.cboHoraFin.setValue(vNota.sHoraFin)
    }
  }

  //#endregion
  async fnGuardar() {
    if (this.formIngreso.invalid) {
      this.formIngreso.markAllAsTouched();
      this.matExpPresupuesto.open();
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados para agendar la nota', 'warning');
      return;
    }

    var vDatos = this.formIngreso.getRawValue();

    if (this.lDetalle.length <= 0) {
      Swal.fire('¡Verificar!', 'El registro tiene que tener por lo menos un articulo', 'warning')
      return;
    }


    var resp = await Swal.fire({
      title: '¿Desea continuar?',
      text: "Una vez que se agregue el registro no se podrán realizar cambios",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    })

    if (!resp.isConfirmed) {
      return;
    }

    this.spinner.show();

    var pEntidad = 4;
    var pOpcion = 1;
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(this.vNota.nId);
    pParametro.push(vDatos.cboAlmacen);
    pParametro.push(vDatos.cboFechaIngreso.format('MM/DD/YYYY'));
    pParametro.push(vDatos.cboHora);
    pParametro.push(vDatos.cboHoraFin);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);

    try {
      var result = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      if (Number(result) == 0) {
        Swal.fire('Error', 'No se pudo realizar el ingreso: Verifique su conexion a Internet', 'error');
        this.spinner.hide();
        return;
      }

      this.matExpPresupuesto.close();
      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se guardo el registro',
        showConfirmButton: false,
        timer: 1500
      });

      this.spinner.hide();
      this.fnRegresar();
    } catch (err) {
      console.log(err);
      this.spinner.hide();
    }
  }

  //#region Funcion de interaccion con componentes
  fnRegresar() {
    this.pMostrar.emit(0);
  }
  //#endregion

  async fnActualizar() {
    if (this.pIdRegistro != 0) {
      var vDatos = this.formIngreso.getRawValue();
      var almacen = vDatos.cboAlmacen;

      await this.fnListarAlmacen();
      var almacenEncontrado = this.lAlmacen.find(item => item.nId == almacen.nId)
      this.formIngreso.controls.cboAlmacen.setValue(almacenEncontrado ?? '');
    }
  }

  //#region Devolver /Rechazar Nota
  async fnDevolverNota() {
    var resp = await Swal.fire({
      title: '¿Desea devolver la nota: ' + this.vNota.sDescripcion.split('-')[0].trim() + '-' + this.vNota.sDocumento + '?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    })

    if (!resp.isConfirmed) {
      return;
    }

    const { value: observacion } = await Swal.fire({
      title: this.vNota.sDescripcion.split('-')[0].trim() + '-' + this.vNota.sDocumento,
      text: 'Ingrese el mensaje',
      input: 'textarea',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Continuar',
      inputValidator: (value) => {
        if (!value) {
          return 'El mensaje es obligatorio';
        }

        if (value.trim() == '') {
          return 'El mensaje es obligatorio';
        }

        if (value.includes('|')) {
          return "El mensaje no puede contener '|'";
        }
      }
    })

    if (!observacion) {
      return;
    }

    this.spinner.show();

    var pEntidad = 6;  //Para actualizar
    var pOpcion = 3;
    var pParametro = [];
    var pTipo = 1;

    pParametro.push(this.vNota.nId);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);
    pParametro.push(observacion);

    try {
      var result = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise()
      if (Number(result) == 1) {
        Swal.fire({
          icon: 'success',
          title: ('Se devolvió de manera correcta la nota: ' + this.vNota.sDescripcion.split('-')[0].trim() + '-' + this.vNota.sDocumento),
          showConfirmButton: false,
          timer: 1500
        });
        this.fnRegresar();

      } else {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo realizar la actualización, !Revise su conexión a internet!',
          showConfirmButton: false,
          timer: 1500
        });
      }
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnRechazarNota() {

    var resp = await Swal.fire({
      title: '¿Desea rechazar la nota: ' + this.vNota.sDescripcion.split('-')[0].trim() + '-' + this.vNota.sDocumento + '?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    })

    if (!resp.isConfirmed) {
      return;
    }

    const { value: observacion } = await Swal.fire({
      title: this.vNota.sDescripcion.split('-')[0].trim() + '-' + this.vNota.sDocumento,
      text: 'Ingrese el mensaje',
      input: 'textarea',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Continuar',
      inputValidator: (value) => {
        if (!value) {
          return 'El mensaje es obligatorio';
        }

        if (value.trim() == '') {
          return 'El mensaje es obligatorio';
        }

        if (value.includes('|')) {
          return "El mensaje no puede contener '|'";
        }
      }
    })

    if (!observacion) {
      return;
    }


    this.spinner.show();

    var pEntidad = 6;  //Para actualizar
    var pOpcion = 3;
    var pParametro = [];
    var pTipo = 2;

    pParametro.push(this.vNota.nId);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);
    pParametro.push(observacion);

    try {
      var result = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise()
      if (Number(result) == 1) {
        Swal.fire({
          icon: 'success',
          title: ('Se rechazó de manera correcta la nota: ' + this.vNota.sDescripcion.split('-')[0].trim() + '-' + this.vNota.sDocumento),
          showConfirmButton: false,
          timer: 1500
        });

        this.fnRegresar();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo realizar la actualización, !Revise su conexión a internet!',
          showConfirmButton: false,
          timer: 1500
        });
      }
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }
  //#endregion 
}
