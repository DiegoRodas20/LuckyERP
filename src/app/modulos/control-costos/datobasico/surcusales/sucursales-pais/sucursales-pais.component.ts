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
import { Sucursal } from '../../interfaces/sucursal';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-sucursales-pais',
  templateUrl: './sucursales-pais.component.html',
  styleUrls: ['./sucursales-pais.component.css'],
  animations: [asistenciapAnimations]
})
export class SucursalesPaisComponent implements OnInit {
  // Botones Flotantes Pantalla 
  tsLista = 'inactive';  // Inicia la lista visible
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'add', tool: 'Nueva sucursal' },
  ];
  abLista = [];

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  vSucursalSeleccionada: Sucursal;
  lSucursal: Sucursal[] = [];
  txtFiltro = new FormControl();
  formSucursal: FormGroup;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Sucursal>;
  displayedColumns = ['nId', 'sCodigo', 'sDescripcion', 'sEstado'];
  @ViewChild('modalSuc') modalSuc: ElementRef;

  cboEstado = new FormControl();
  title: string;

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

    this.formSucursal = this.formBuilder.group({
      txtCodigo: ['', [Validators.required]],
      txtDescripcion: ['', [Validators.required, Validators.maxLength(50)]]
    })
    this.fnListarSucursal(1);
  }

  fnListarSucursal = function (opcion: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.pPais);


    this.vDatoBasicoService.fndatoBasicoSucursal(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lSucursal = res;
        this.nCodigo = 0;
        this.sCodigo = "";
        this.lSucursal.forEach(item => {
          if (parseInt(item.sCodigo) > this.nCodigo) { this.nCodigo = parseInt(item.sCodigo) }
        })
        this.nCodigo++;
        if (opcion == 1) {
          this.sCodigo = this.nCodigo.toString();
          if (this.sCodigo.length == 1) { this.sCodigo = '00' + this.sCodigo }
          if (this.sCodigo.length == 2) { this.sCodigo = '0' + this.sCodigo }
          this.formSucursal.controls.txtCodigo.setValue(this.sCodigo);
        }
        const sucursal = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k)); 
        this.dataSource = new MatTableDataSource(sucursal);
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

  fnAnadirSucursal = function () {
    if (this.formSucursal.invalid) {
      Swal.fire('¡Verificar!', 'Verificar la descripcion', 'warning')
      return;
    }

    var vDatosCC = this.formSucursal.value;
    var descripcion: string = vDatosCC.txtDescripcion;

    //Verificando si la descripcion ya existe
    if (this.lSucursal.findIndex(item => item.sDescripcion.trim().toUpperCase() == descripcion.trim().toUpperCase()) != -1) {
      Swal.fire('¡Verificar!', 'La sucusal indicada ya existe', 'warning')
      this.formSucursal.controls.txtDescripcion.setValue('');
      return;
    }

    var pEntidad = 1; //Cabecera de la sucursal 
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

    pParametro.push(vDatosCC.txtDescripcion);
    pParametro.push(this.pPais)

    this.spinner.show();

    this.vDatoBasicoService.fndatoBasicoSucursal(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
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
            text: 'Se guardo la sucursal asignada.',
            showConfirmButton: false,
            timer: 1500
          });

          this.formSucursal.controls.txtDescripcion.setValue("");
          this.fnListarSucursal(1);
        }
      },
      err => {
        console.log(err);
        this.spinner.hide();
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnGuardarSucursal = function () {
    if (this.formSucursal.invalid) {
      Swal.fire('¡Verificar!', 'Verificar la descripcion', 'warning')
      return;
    }

    var pEntidad = 1; //Cabecera
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

    var vDatosCC = this.formSucursal.value;

    pParametro.push(this.vSucursalSeleccionada.nId);
    pParametro.push(vDatosCC.txtDescripcion);
    pParametro.push(this.cboEstado.value);

    this.spinner.show();

    this.vDatoBasicoService.fndatoBasicoSucursal(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res == 1) {
          this.spinner.hide();

          Swal.fire({
            icon: 'success',
            title: 'Correcto',
            text: 'Se actualizo de manera correcta el registro',
            showConfirmButton: false,
            timer: 1500
          });

          this.vSucursalSeleccionada.nEstado = this.cboEstado.value;
          this.formSucursal.get('txtDescripcion').disable();
          this.cboEstado.disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.fnListarSucursal(0);
          this.formSucursal.controls.txtCodigo.setValue(this.vSucursalSeleccionada.sCodigo);

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

  fnModificarSucursal() {
    this.pTipo = 2;
    this.formSucursal.get('txtDescripcion').enable();
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

  fnAbrirModal() {
    this.modalSuc.nativeElement.click();
    this.pOpcion = 1;
    this.formSucursal.get('txtDescripcion').enable();
    this.formSucursal.controls.txtCodigo.setValue(this.sCodigo);


    this.title = 'Añadir Sucursal'
    this.cboEstado.disable();
  }

  fnSeleccionarSucursal(row: Sucursal) {
    this.vSucursalSeleccionada = row;

    this.formSucursal.controls.txtCodigo.setValue(this.vSucursalSeleccionada.sCodigo)
    this.formSucursal.controls.txtDescripcion.setValue(this.vSucursalSeleccionada.sDescripcion)

    this.formSucursal.get('txtDescripcion').disable();

    this.pOpcion = 2;
    this.pTipo = 1;
    this.modalSuc.nativeElement.click();
    this.title = 'Modificar Sucursal';
    this.cboEstado.setValue(this.vSucursalSeleccionada.nEstado);
    this.cboEstado.disable();
  }

  fnEvitarEspacios() {
    var vDatosCC = this.formSucursal.value;
    var descripcion = vDatosCC.txtDescripcion;

    this.formSucursal.controls.txtDescripcion.setValue(descripcion.trimLeft())
  }

  fnLimpiarModal() {
    this.formSucursal.controls.txtDescripcion.setValue('');
    this.formSucursal.controls.txtCodigo.setValue('');
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
