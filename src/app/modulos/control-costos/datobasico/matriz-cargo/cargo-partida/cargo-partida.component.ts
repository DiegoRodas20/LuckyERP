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
import { DatoBasicoService } from '../../datobasico.service';
import { Cargo, CargoPartida, Partida } from '../../interfaces/matriz';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-cargo-partida',
  templateUrl: './cargo-partida.component.html',
  styleUrls: ['./cargo-partida.component.css'],
  animations: [asistenciapAnimations]
})
export class CargoPartidaComponent implements OnInit {

  // Botones Flotantes Pantalla 
  tsLista = 'inactive';  // Inicia la lista visible
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'add', tool: 'Nuevo cargo partida' },
  ];
  abLista = [];

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual


  lCargoPartida: CargoPartida[] = [];
  vCargoPartSeleccionada: CargoPartida;
  lPartida: Partida[] = [];
  lCargo: Cargo[] = [];
  txtFiltro = new FormControl();
  formCargoPart: FormGroup;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<CargoPartida>;
  displayedColumns = ['nId', 'sCodCargo', 'sDescCargo', 'sCodPartida', 'sDescPartida', 'sEstado'];
  @ViewChild('modalCargoPart') modalCargoPart: ElementRef;

  cboEstado = new FormControl();
  title: string;
  txtCargo = new FormControl();
  txtPartida = new FormControl();

  //Se genera despues de escoger el maximo codigo y se le aumenta 1
  nCodigo: number = 0;
  sCodigo: string = "";
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
    this.onToggleFab(1, -1);

    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formCargoPart = this.formBuilder.group({
      cboPartida: ['', Validators.required],
      cboCargo: ['', Validators.required]
    });

    this.fnListarCargo();
    this.fnListarPartida();
    this.fnListarCargoPartida();
  }

  fnListarCargo = function () {
    this.spinner.show();

    var pEntidad = 7;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.pPais);

    this.vDatoBasicoService.fnDatoMatriz(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lCargo = res;
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnListarPartida = function () {
    this.spinner.show();

    var pEntidad = 4;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.pPais);

    this.vDatoBasicoService.fnDatoMatriz(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lPartida = res;
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnListarCargoPartida = function () {
    this.spinner.show();

    var pEntidad = 6;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.pPais);

    this.vDatoBasicoService.fnDatoMatriz(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lCargoPartida = res;
        const cargoPartida = res;
        this.dataSource = new MatTableDataSource(cargoPartida);
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

  fnAnadir = function () {
    if (this.formCargoPart.invalid) {
      Swal.fire('¡Verificar!', 'Verifique los datos para guardar el registro', 'warning')
      return;
    }
    this.spinner.show();

    var vDatos = this.formCargoPart.value;

    var pEntidad1 = 6; //Cabecera 
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 2;       //Listar un registro

    pParametro1.push(vDatos.cboPartida);
    pParametro1.push(vDatos.cboCargo);

    this.vDatoBasicoService.fnDatoMatriz(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).subscribe(
      res => {
        if (res.cod != "0") {
          this.spinner.hide();
          Swal.fire('¡Verificar!', 'El cargo indicado ya se encuentra registrado en la partida, indique otro cargo', 'warning');

          this.formCargoPart.controls.cboCargo.setValue("");
        }
        if (res.cod == "0") {
          var pEntidad = 6; //Cabecera 
          var pOpcion = 1;  //CRUD -> Insertar
          var pParametro = []; //Parametros de campos vacios
          var pTipo = 0;

          var vDatos1 = this.formCargoPart.value;
          pParametro.push(vDatos1.cboPartida);
          pParametro.push(vDatos1.cboCargo);

          this.vDatoBasicoService.fnDatoMatriz(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
            res => {
              if (res == 0) {
                this.spinner.hide();
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
                this.formCargoPart.controls.cboPartida.setValue("");
                this.formCargoPart.controls.cboCargo.setValue("");

                this.fnListarCargoPartida();
              }
            },
            err => {
              console.log(err);
            },
            () => {
              //this.spinner.hide();
            }
          );

        }
      },
      err => {
        console.log(err);
      }
    )
  }

  fnGuardar = function () {

    var pEntidad = 6; //Cabecera
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

    pParametro.push(this.vCargoPartSeleccionada.nId);
    pParametro.push(this.cboEstado.value);
    this.spinner.show();

    this.vDatoBasicoService.fnDatoMatriz(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
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
          this.vCargoPartSeleccionada.nEstado = this.cboEstado.value;
          this.cboEstado.disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.fnListarCargoPartida();
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

  fnModificar() {
    this.pTipo = 2;
    this.cboEstado.enable();
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

  fnSeleccionarCargoPartida(row: CargoPartida) {
    this.vCargoPartSeleccionada = row;

    this.formCargoPart.get('cboPartida').disable();
    this.formCargoPart.get('cboCargo').disable();

    this.pOpcion = 2;
    this.pTipo = 1;
    this.modalCargoPart.nativeElement.click();
    this.title = 'Modificar Cargo Partida';
    this.txtCargo.setValue(this.vCargoPartSeleccionada.sDescCargo)
    this.txtPartida.setValue(this.vCargoPartSeleccionada.sDescPartida)

    this.cboEstado.setValue(this.vCargoPartSeleccionada.nEstado);
    this.cboEstado.disable();
  }

  fnAbrirModal() {
    this.modalCargoPart.nativeElement.click();
    this.pOpcion = 1;
    this.formCargoPart.get('cboPartida').enable();
    this.formCargoPart.get('cboCargo').enable();
    this.title = 'Añadir Cargo Partida'
    this.cboEstado.disable();
  }

  fnLimpiarModal() {
    this.formCargoPart.controls.cboPartida.setValue('');
    this.formCargoPart.controls.cboCargo.setValue('');
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
