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
import { CentroCostoService } from '../../centroCosto.service';
import { Direccion } from '../../Models/centroCostos/ICentroCosto';

// Importante para las validaciones
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-direccion',
  templateUrl: './direccion.component.html',
  styleUrls: ['./direccion.component.css'],
  animations: [asistenciapAnimations]
})
export class DireccionComponent implements OnInit {
  // Botones Flotantes Pantalla 
  tsLista = 'inactive';  // Inicia la lista visible
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'add', tool: 'Nueva dirección' },
  ];
  abLista = [];

  dataSource: MatTableDataSource<Direccion>;
  displayedColumns = ['nIdDireccion', 'sCodigoDireccion', 'sDescripcion', 'sEstado'];
  // Asigancion para Paginar y ordedar las columnas de mi tabla 
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('modalDireccion') modalDireccion: ElementRef;

  lDireccion: Direccion[];
  txtFiltro = new FormControl();
  formDireccion: FormGroup;
  vDireccionSeleccionada: Direccion;
  cboEstado = new FormControl();
  lEstados = [
    { nEstado: 1, sEstado: 'Activo' },
    { nEstado: 0, sEstado: 'Inactivo' },
  ]

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  pOpcion = 1;  //Para actualizar o añadir
  pTipo = 1;  //Para guardar o actualizar
  title = '';
  matcher = new MyErrorStateMatcher();

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vCentroCostoService: CentroCostoService,
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

    this.formDireccion = this.formBuilder.group({
      txtCodigo: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[a-zA-Z\s]*$')]],
      txtDescripcion: ['', [Validators.required, , Validators.minLength(1), Validators.maxLength(50)]]
    })
    this.fnListarDirecciones();
  }

  fnListarDirecciones = function () {
    this.spinner.show();

    var pEntidad = 1; //Cabecera del tarfario
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    var vFiltro = " "

    pParametro.push(this.pPais);
    pParametro.push(vFiltro);

    this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lDireccion = res;
        const direcciones = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k)); 
        this.dataSource = new MatTableDataSource(direcciones);
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

  fnFiltrar() {
    var filtro = "";

    if (this.txtFiltro.value == null) {
      return;
    }
    filtro = this.txtFiltro.value.trim(); // Remove whitespace
    filtro = filtro.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filtro;
  }

  fnAbrirModal() {
    this.modalDireccion.nativeElement.click();
    this.pOpcion = 1;
    this.formDireccion.get('txtCodigo').enable();
    this.formDireccion.get('txtDescripcion').enable();
    this.title = 'Añadir Dirección'
    this.cboEstado.disable();

  }

  fnAnadirDireccion = function () {
    if (this.formDireccion.invalid) {
      Swal.fire('¡Verificar!', 'Existen datos obligatorios para guardar la direccion', 'warning')
      return;
    }
    this.spinner.show();

    var vDatosDir = this.formDireccion.value;

    var pEntidad1 = 1; //Cabecera de la direccion
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 2;       //Listar todos los registros de la tabla

    pParametro1.push(vDatosDir.txtCodigo);
    pParametro1.push(this.pPais);
    this.vCentroCostoService.fnCentroCosto(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).subscribe(
      res => {
        if (res.cod != "0") {
          this.spinner.hide();
          Swal.fire('¡Verificar!', 'El codigo de direccion indicado: ' + res.cod + ', ya se encuentra registrada, indique otro número.', 'warning');
          this.formDireccion.controls.txtCodigo.setValue("");
        }
        if (res.cod == "0") {
          var pEntidad = 1; //Cabecera de la direccion
          var pOpcion = 1;  //CRUD -> Insertar
          var pParametro = []; //Parametros de campos vacios
          var pTipo = 0;       //Listar todos los registros de la tabla

          var vDatosDir1 = this.formDireccion.value;
          pParametro.push(vDatosDir1.txtCodigo);
          pParametro.push(vDatosDir1.txtDescripcion.trim());
          pParametro.push(this.pPais);

          this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
            res => {

              this.spinner.hide();
              if (res == 0) {
                Swal.fire(
                  'Error', //Titulo
                  'No se pudo realizar el ingreso: Verifique su conexion a Internet', //Mensaje html
                  'error' //Tipo de mensaje
                ).then((result) => {
                });
              } else {
                //Registrado
                Swal.fire({
                  icon: 'success',
                  title: 'Correcto',
                  text: 'Se guardo el direccion asignada.',
                  showConfirmButton: false,
                  timer: 1500
                });
                this.formDireccion.controls.txtCodigo.setValue("");
                this.formDireccion.controls.txtDescripcion.setValue("");
                this.fnListarDirecciones();
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


  fnModificarDir() {
    this.formDireccion.get('txtDescripcion').enable();
    this.pTipo = 2;
    this.cboEstado.enable();
  }

  fnGuardarDir = function () {
    if (this.formDireccion.invalid) {
      Swal.fire('¡Verificar!', 'Existen datos obligatorios para guardar la direccion', 'warning')
      return;
    }

    var pEntidad = 1; //Cabecera de direccion
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

    var vDatosDir = this.formDireccion.value;

    pParametro.push(this.vDireccionSeleccionada.nIdDireccion);
    pParametro.push(vDatosDir.txtDescripcion.trim());
    pParametro.push(this.cboEstado.value);
    this.spinner.show();

    this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
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
          this.vDireccionSeleccionada.sDescripcion = vDatosDir.txtDescripcion.trim();
          this.formDireccion.get('txtCodigo').disable();
          this.formDireccion.get('txtDescripcion').disable();
          this.cboEstado.disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.fnListarDirecciones();
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
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );

  }

  fnSeleccionarDireccion(row: Direccion) {
    this.vDireccionSeleccionada = row;
    this.formDireccion.controls.txtCodigo.setValue(this.vDireccionSeleccionada.sCodigoDireccion)
    this.formDireccion.controls.txtDescripcion.setValue(this.vDireccionSeleccionada.sDescripcion)

    this.formDireccion.get('txtCodigo').disable();
    this.formDireccion.get('txtDescripcion').disable();
    this.pOpcion = 2;
    this.pTipo = 1;
    this.modalDireccion.nativeElement.click();
    this.title = 'Modificar Dirección'
    this.cboEstado.setValue(this.vDireccionSeleccionada.bEstado);
    this.cboEstado.disable();

  }

  fnConvertirMay() {
    var vDatosDir = this.formDireccion.value;
    var vCodigo: string = vDatosDir.txtCodigo;
    vCodigo = vCodigo.trim().toUpperCase();
    this.formDireccion.controls.txtCodigo.setValue(vCodigo);
  }

  fnLimpiarModal() {
    this.formDireccion.controls.txtCodigo.setValue('');
    this.formDireccion.controls.txtDescripcion.setValue('');
  }

  fnEvitarEspacios() {
    var vDatosCC = this.formDireccion.value;
    var descripcion = vDatosCC.txtDescripcion;

    this.formDireccion.controls.txtDescripcion.setValue(descripcion.trimLeft())
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
