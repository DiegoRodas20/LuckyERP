import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
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
import { Partida, Planilla, PlanillaPartida } from '../../interfaces/matriz';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-planilla-partida-detalle',
  templateUrl: './planilla-partida-detalle.component.html',
  styleUrls: ['./planilla-partida-detalle.component.css'],
  animations: [asistenciapAnimations]
})
export class PlanillaPartidaDetalleComponent implements OnInit {

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

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<PlanillaPartida>;
  displayedColumns = ['nId', 'sCodigo', 'sDescripcion', 'sEstado'];
  @ViewChild('modalPlanPart') modalPlanPart: ElementRef;

  lPlanillaPartida: PlanillaPartida[] = [];
  lPartida: Partida[];
  @Input() pPlanilla: Planilla;
  @Output() pMostrar = new EventEmitter<number>();

  txtFiltro = new FormControl();
  txtPartida = new FormControl();
  cboEstado = new FormControl();
  title: string;

  vPlanPartSeleccionada: PlanillaPartida;
  formPlanillaPartida: FormGroup;
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

    this.formPlanillaPartida = this.formBuilder.group({
      txtPlanilla: [''],
      cboPartida: ['', Validators.required]
    })
    this.fnListarPlanillaPartida(this.pPlanilla);
    this.fnListarPartida();
  }

  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }

  fnListarPlanillaPartida = function (p: Planilla) {

    this.spinner.show();

    var pEntidad = 5;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(p.nId);

    this.vDatoBasicoService.fnDatoMatriz(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lPlanillaPartida = res;
        const planillaPartida = res;
        this.dataSource = new MatTableDataSource(planillaPartida);
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

  fnAnadir = function () {
    if (this.formPlanillaPartida.invalid) {
      Swal.fire('¡Verificar!', 'Seleccione una partida para guardar', 'warning')
      return;
    }
    this.spinner.show();

    var vDatos = this.formPlanillaPartida.value;

    var pEntidad1 = 5; //Cabecera 
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 2;       //Listar un registro

    pParametro1.push(vDatos.cboPartida);
    pParametro1.push(this.pPlanilla.nId);

    this.vDatoBasicoService.fnDatoMatriz(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).subscribe(
      res => {
        if (res.cod != "0") {
          this.spinner.hide();
          Swal.fire('¡Verificar!', 'La partida indicada ya se encuentra registrada, indique otra partida', 'warning');

          this.formPlanillaPartida.controls.cboPartida.setValue("");
        }
        if (res.cod == "0") {
          var pEntidad = 5; //Cabecera 
          var pOpcion = 1;  //CRUD -> Insertar
          var pParametro = []; //Parametros de campos vacios
          var pTipo = 0;

          var vDatos1 = this.formPlanillaPartida.value;
          pParametro.push(this.pPlanilla.nId);
          pParametro.push(vDatos1.cboPartida);

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
                  text: 'Se guardo la partida asignada.',
                  showConfirmButton: false,
                  timer: 1500
                });

                this.formPlanillaPartida.controls.cboPartida.setValue("");
                this.fnListarPlanillaPartida(this.pPlanilla);
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
        console.log(err);
      }
    )
  }

  fnGuardar = function () {

    var pEntidad = 5; //Cabecera
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

    pParametro.push(this.vPlanPartSeleccionada.nId);
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
          this.vPlanPartSeleccionada.nEstado = this.cboEstado.value;
          this.cboEstado.disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.fnListarPlanillaPartida(this.pPlanilla);
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

  fnRegresar() {
    this.pMostrar.emit(0);
  }

  fnLimpiarModal() {
    this.formPlanillaPartida.controls.txtPlanilla.setValue('');
    this.formPlanillaPartida.controls.cboPartida.setValue('');
  }

  fnSeleccionarPartidaPlanilla(row: PlanillaPartida) {
    this.vPlanPartSeleccionada = row;

    this.pOpcion = 2;
    this.pTipo = 1;
    this.modalPlanPart.nativeElement.click();
    this.title = 'Modificar Partida Personal';
    this.formPlanillaPartida.controls.txtPlanilla.setValue(this.pPlanilla.sDescripcion);
    this.txtPartida.setValue(this.vPlanPartSeleccionada.sDescPartida);
    this.cboEstado.setValue(this.vPlanPartSeleccionada.nEstado);
    this.cboEstado.disable();
  }

  fnAbrirModal() {
    this.modalPlanPart.nativeElement.click();
    this.pOpcion = 1;
    this.formPlanillaPartida.controls.txtPlanilla.setValue(this.pPlanilla.sDescripcion);

    this.title = 'Añadir Partida Personal'
    this.cboEstado.disable();
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
      case 1:
        this.fnRegresar()
        break
      default:
        break
    }
  }
}
