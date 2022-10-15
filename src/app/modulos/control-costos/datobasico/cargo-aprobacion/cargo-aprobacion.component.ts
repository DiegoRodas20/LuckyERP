import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { DatoBasicoService } from '../datobasico.service';

export interface Cargo {
  nId: number;
  sCodigo: string;
  sDesc: string;
}

export interface CargoAprobacion {
  nId: number;
  nIdPais: number;
  nIdCargo: number;
  nMonto: number;
  nLibre: number;
  sLibre: string;
  sCodCargo: string;
  sDescCargo: string;
  nEstado: string;
  sEstado: string;
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-cargo-aprobacion',
  templateUrl: './cargo-aprobacion.component.html',
  styleUrls: ['./cargo-aprobacion.component.css'],
  animations: [asistenciapAnimations]
})
export class CargoAprobacionComponent implements OnInit {

  // Botones Flotantes Pantalla 
  tsLista = 'inactive';  // Inicia la lista visible
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'add', tool: 'Nuevo usuario presupuesto' },
  ];
  abLista = [];

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  formCargoAprobacion: FormGroup;
  txtFiltro = new FormControl();
  cboEstado = new FormControl();

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('modalCA') modalCA: ElementRef;


  lCargoA: CargoAprobacion[] = [];
  lCargo: Cargo[] = [];
  vCargoASeleccionado: CargoAprobacion;
  dataSource: MatTableDataSource<CargoAprobacion>;
  displayedColumns = ['nId', 'sCodCargo', 'sDescCargo', 'nMonto', 'sLibre', 'sEstado'];

  title: string;

  pOpcion = 1;  //Para actualizar o añadir
  pTipo = 1;  //Para guardar o actualizar

  lEstados = [
    { nEstado: 1, sEstado: 'Activo' },
    { nEstado: 0, sEstado: 'Inactivo' },
  ]

  matcher = new ErrorStateMatcher();

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vDatoBasicoService: DatoBasicoService,
    private cdr: ChangeDetectorRef,

    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; }

  ngOnInit(): void {
    this.onToggleFab(1, -1)

    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formCargoAprobacion = this.formBuilder.group({
      txtMonto: ['', [Validators.required, Validators.min(1), Validators.max(9999999999)]],
      cboCargo: ['', [Validators.required]],
      cbLibre: [false]
    })
    this.fnListarCargoAprobacion();
    this.fnListarCargos();
  }

  fnListarCargoAprobacion = function () {
    this.spinner.show();

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla


    pParametro.push(this.pPais);

    this.vDatoBasicoService.fnCargoAprobacion(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lCargoA = res;

        const cargosA = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k)); 
        this.dataSource = new MatTableDataSource(cargosA);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnListarCargos = function () {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla


    pParametro.push(this.pPais);

    this.vDatoBasicoService.fnCargoAprobacion(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lCargo = res;
        //console.log('CARGO',res);
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnFiltrar() {
    var filtro = "";

    if (this.txtFiltro.value == null) {
      return;
    }
    filtro = this.txtFiltro.value.trim(); // Remove whitespace
    filtro = filtro.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filtro;
  }

  fnAnadirCA = function () {

    if (this.formCargoAprobacion.invalid) {
      Swal.fire('¡Verificar!', 'Existen datos obligatorios para guardar el cargo', 'warning')
      return;
    }

    var vDatosCA = this.formCargoAprobacion.value;

    var pEntidad1 = 2; //Cabecera 
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 2;       //Listar uno
    this.spinner.show();

    pParametro1.push(vDatosCA.cboCargo);
    pParametro1.push(this.pPais);

    //Se verifica si el cargo ya existe en este pais
    this.vDatoBasicoService.fnCargoAprobacion(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).subscribe(
      res => {
        if (res.cod != "0") {
          this.spinner.hide();
          Swal.fire('¡Verificar!', 'El cargo indicado ya se encuentra registrado, indique otro cargo', 'warning');
          this.formCargoAprobacion.controls.cboCargo.setValue("");
        }
        if (res.cod == "0") {
          var pEntidad = 2; //Cabecera de la direccion
          var pOpcion = 1;  //CRUD -> Insertar
          var pParametro = []; //Parametros de campos vacios
          var pTipo = 0;       //Listar todos los registros de la tabla

          var vDatosCA1 = this.formCargoAprobacion.value;
          pParametro.push(vDatosCA1.cboCargo);
          pParametro.push(this.pPais);
          pParametro.push(vDatosCA1.txtMonto);
          pParametro.push((vDatosCA1.cbLibre == true ? 1 : 0));
          pParametro.push(this.idUser);

          this.vDatoBasicoService.fnCargoAprobacion(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
            res => {
              if (res == 0) {
                Swal.fire(
                  'Error', //Titulo
                  'No se pudo realizar el ingreso: Verifique su conexion a Internet', //Mensaje html
                  'error' //Tipo de mensaje
                ).then((result) => {
                });
              } else {
                //Registrado
                this.spinner.hide();
                Swal.fire({
                  icon: 'success',
                  title: 'Correcto',
                  text: 'Se guardo el cargo asignado.',
                  showConfirmButton: false,
                  timer: 1500
                });

                this.formCargoAprobacion.controls.cboCargo.setValue("");
                this.formCargoAprobacion.controls.txtMonto.setValue("");
                this.formCargoAprobacion.controls.cbLibre.setValue(false)
                this.fnListarCargoAprobacion();
              }
            },
            err => {
              this.spinner.hide();
              console.log(err);
            },
            () => {
              this.spinner.hide();
            }
          );

        }
      },
      err => {
        this.spinner.hide();
        console.log(err);
      }
    )
  }

  fnModificarCA() {
    this.formCargoAprobacion.get('txtMonto').enable();
    this.formCargoAprobacion.get('cbLibre').enable();
    this.pTipo = 2;
    this.cboEstado.enable();
  }

  fnGuardarCA = function () {
    if (this.formCargoAprobacion.invalid) {
      Swal.fire('¡Verificar!', 'Existen datos obligatorios para guardar el cargo', 'warning')
      return;
    }

    var pEntidad = 2; //Cabecera
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

    var vDatosCA = this.formCargoAprobacion.value;

    pParametro.push(this.vCargoASeleccionado.nId);
    pParametro.push(vDatosCA.txtMonto);
    pParametro.push((vDatosCA.cbLibre == true ? 1 : 0));
    pParametro.push(this.cboEstado.value);
    pParametro.push(this.idUser);
    pParametro.push(this.pPais);
    this.spinner.show();

    this.vDatoBasicoService.fnCargoAprobacion(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res == 1) {
          this.spinner.hide();
          Swal.fire({
            icon: 'success',
            title: 'Correcto',
            text: 'Se actualizo de manera correcta el registro.',
            showConfirmButton: false,
            timer: 1500
          });
          this.vCargoASeleccionado.nMonto = vDatosCA.txtMonto;
          this.formCargoAprobacion.get('cboCargo').disable();
          this.formCargoAprobacion.get('txtMonto').disable();
          this.formCargoAprobacion.get('cbLibre').disable();
          this.cboEstado.disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.fnListarCargoAprobacion();
        } else {
          this.spinner.hide();
          Swal.fire(
            'Error', //Titulo
            'No se pudo realizar la actualizacion: Verifique su conexion a Internet', //Mensaje html
            'error' //Tipo de mensaje
          )
        }
      },
      err => {
        this.spinner.hide();
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnSeleccionarCargoAprobacion(row: CargoAprobacion) {
    this.vCargoASeleccionado = row;
    this.formCargoAprobacion.controls.cboCargo.setValue(this.vCargoASeleccionado.nIdCargo)
    this.formCargoAprobacion.controls.txtMonto.setValue(this.vCargoASeleccionado.nMonto)
    this.formCargoAprobacion.controls.cbLibre.setValue((this.vCargoASeleccionado.nLibre == 1 ? true : false))

    this.formCargoAprobacion.get('cboCargo').disable();
    this.formCargoAprobacion.get('txtMonto').disable();
    this.formCargoAprobacion.get('cbLibre').disable();

    this.pOpcion = 2;
    this.pTipo = 1;
    this.modalCA.nativeElement.click();
    this.title = 'Modificar cargo';
    this.cboEstado.setValue(this.vCargoASeleccionado.nEstado);
    this.cboEstado.disable();
  }

  fnAbrirModal() {
    this.modalCA.nativeElement.click();
    this.pOpcion = 1;
    this.formCargoAprobacion.get('cboCargo').enable();
    this.formCargoAprobacion.get('txtMonto').enable();
    this.formCargoAprobacion.get('cbLibre').enable();

    this.title = 'Añadir Cargo'
    this.cboEstado.disable();
  }

  fnLimpiarModal() {
    this.formCargoAprobacion.controls.cboCargo.setValue('')
    this.formCargoAprobacion.controls.txtMonto.setValue(0)
    this.formCargoAprobacion.controls.cbLibre.setValue(false)

  }

  fnRedondearMonto() {
    var vDatosCA = this.formCargoAprobacion.value;
    var nMonto = vDatosCA.txtMonto;
    this.formCargoAprobacion.controls.txtMonto.setValue(this.fnRedondear(nMonto));
  }

  fnRedondear(num) {
    var pow = Math.pow(10, 2);
    return Math.round(num * pow) / pow;
  }


  //Botones Flotantes 
  onToggleFab(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnAbrirModal()
        break
      default:
        break
    }
  }
}
