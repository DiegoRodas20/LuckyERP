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
import { CompraService } from '../../compra.service';

export interface GiroNegocio {
  nId: number;
  sCodigo: string;
  sDescripcion: string;
  nEstado: number;
  sEstado: string;
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-giro-negocio',
  templateUrl: './giro-negocio.component.html',
  styleUrls: ['./giro-negocio.component.css'],
  animations: [asistenciapAnimations]
})
export class GiroNegocioComponent implements OnInit {
  // Botones Flotantes Pantalla 
  tsLista = 'inactive';  // Inicia la lista visible
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'add', tool: 'Nuevo Giro Negocio' },
  ];
  abLista = [];

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  vGiroNSeleccionado: GiroNegocio;
  lGiroNeg: GiroNegocio[] = [];
  txtFiltro = new FormControl();
  formGiroNegocio: FormGroup

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<GiroNegocio>;
  @ViewChild('modalGN') modalGiroNeg: ElementRef;

  displayedColumns = ['nId', 'sCodigo', 'sDescripcion', 'sEstado'];
  lEstados = [
    { nEstado: 1, sEstado: 'Activo' },
    { nEstado: 0, sEstado: 'Inactivo' },
  ]

  cboEstado = new FormControl();
  title: string;

  //Se genera despues de escoger el maximo codigo y se le aumenta 1
  nCodigo: number = 0;
  sCodigo: string = "";
  pOpcion = 1;  //Para actualizar o añadir
  pTipo = 1;  //Para guardar o actualizar

  matcher = new ErrorStateMatcher();

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vCompraService: CompraService,
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

    this.formGiroNegocio = this.formBuilder.group({
      txtCodigo: ['', [Validators.required]],
      txtDescripcion: ['', [Validators.required, Validators.maxLength(50)]]
    })
    this.fnListarGiroNeg(1);
  }


  //Funciones para conectar con la BD
  fnListarGiroNeg = function (opcion: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.pPais);


    this.vCompraService.fnDatosBasicosCompras(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lGiroNeg = res;
        this.nCodigo = 0;
        this.sCodigo = "";
        this.lGiroNeg.forEach(item => {
          if (parseInt(item.sCodigo) > this.nCodigo) { this.nCodigo = parseInt(item.sCodigo) }
        })
        this.nCodigo++;
        if (opcion == 1) {
          this.sCodigo = this.nCodigo.toString();
          this.formGiroNegocio.controls.txtCodigo.setValue(this.sCodigo);
        }
        const categoriaC = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k)); 
        this.dataSource = new MatTableDataSource(categoriaC);
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

  fnAnadirGiroNeg = function () {
    if (this.formGiroNegocio.invalid) {
      Swal.fire('¡Verificar!', 'Verificar la descripcion', 'warning')
      return;
    }

    var vDatosGN = this.formGiroNegocio.value;
    var descripcion: string = vDatosGN.txtDescripcion;

    //Verificando si la descripcion ya existe
    if (this.lGiroNeg.findIndex(item => item.sDescripcion.trim().toUpperCase() == descripcion.trim().toUpperCase()) != -1) {
      Swal.fire('¡Verificar!', 'El giro de negocio indicado ya existe', 'warning')
      this.formGiroNegocio.controls.txtDescripcion.setValue('');
      return;
    }
    this.spinner.show();

    var pEntidad = 1; //Cabecera del giro negocio
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

    pParametro.push(vDatosGN.txtDescripcion);

    this.vCompraService.fnDatosBasicosCompras(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
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
            text: 'Se guardo el giro de negocio asignado.',
            showConfirmButton: false,
            timer: 1500
          });
          //Swal.fire('Correcto', 'Se guardo el giro de negocio asignado.', 'success');
          this.formGiroNegocio.controls.txtDescripcion.setValue("");
          this.fnListarGiroNeg(1);
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

  fnGuardarGiroNeg = function () {
    if (this.formGiroNegocio.invalid) {
      Swal.fire('¡Verificar!', 'Verificar la descripcion', 'warning')
      return;
    }

    var pEntidad = 1; //Cabecera
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    var vDatosCC = this.formGiroNegocio.value;

    pParametro.push(this.vGiroNSeleccionado.nId);
    pParametro.push(vDatosCC.txtDescripcion);
    pParametro.push(this.cboEstado.value);

    this.spinner.show();

    this.vCompraService.fnDatosBasicosCompras(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
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
          // Swal.fire('Correcto', 'Se actualizo de manera correcta el registro', 'success')
          this.vGiroNSeleccionado.nEstado = this.cboEstado.value;
          this.formGiroNegocio.get('txtDescripcion').disable();
          this.cboEstado.disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.fnListarGiroNeg(0);
          this.formGiroNegocio.controls.txtCodigo.setValue(this.vGiroNSeleccionado.sCodigo);

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

  //Funciones de interaccion
  fnModificarGiroNeg() {
    this.pTipo = 2;
    this.formGiroNegocio.get('txtDescripcion').enable();
    this.cboEstado.enable();
  }

  fnSeleccionarGiroNeg(row: GiroNegocio) {
    this.vGiroNSeleccionado = row;

    this.formGiroNegocio.controls.txtCodigo.setValue(this.vGiroNSeleccionado.sCodigo)
    this.formGiroNegocio.controls.txtDescripcion.setValue(this.vGiroNSeleccionado.sDescripcion)

    this.formGiroNegocio.get('txtDescripcion').disable();

    this.pOpcion = 2;
    this.pTipo = 1;
    this.modalGiroNeg.nativeElement.click();
    this.title = 'Modificar Giro negocio';
    this.cboEstado.setValue(this.vGiroNSeleccionado.nEstado);
    this.cboEstado.disable();
  }

  fnAbrirModal() {
    this.modalGiroNeg.nativeElement.click();
    this.pOpcion = 1;
    this.formGiroNegocio.get('txtDescripcion').enable();
    this.formGiroNegocio.controls.txtCodigo.setValue(this.sCodigo);

    this.title = 'Añadir Giro de negocio'
    this.cboEstado.disable();
  }

  fnLimpiarModal() {
    this.formGiroNegocio.controls.txtDescripcion.setValue('');
    this.formGiroNegocio.controls.txtCodigo.setValue('');
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

  fnEvitarEspacios() {
    var vDatosGN = this.formGiroNegocio.value;
    var descripcion = vDatosGN.txtDescripcion;

    this.formGiroNegocio.controls.txtDescripcion.setValue(descripcion.trimLeft())
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
