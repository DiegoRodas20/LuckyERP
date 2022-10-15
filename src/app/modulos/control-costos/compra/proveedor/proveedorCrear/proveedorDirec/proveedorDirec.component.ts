import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompraService } from '../../../compra.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-proveedorDirec',
  templateUrl: './proveedorDirec.component.html',
  styleUrls: ['./proveedorDirec.component.css']
})
export class ProveedorDirecComponent implements OnInit {

  banco: any[] = []
  departamento: any[] = []
  provincia: any[] = []
  distrito: any[] = []
  forma = new FormGroup({});

  detalleSeleccionado;
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  nombreEmpresa: string;
  pEntidad = 1; //Cabecera del movimiento
  pOpcion = 2;  //CRUD -> Listar
  pParametro = []; //Parametros de campos vacios
  pTipo = 1;       //Listar Solo Guias de ingreso
  pDetalle = []//Parametros de campos vacios
  url: string; //variable de un solo valor
  estado
  fecha: Date = new Date();
  usuario
  displayedColumns: string[] = ['opciones', 'sDepartamento', 'sProvincia', 'sDistrito', 'sDireccion', 'sPrincipal', 'sEstado']
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataTraida;

  constructor(
    private fb: FormBuilder,
    private rutas: CompraService,
    @Inject('BASE_URL') baseUrl: string,
    private dialogRef: MatDialogRef<ProveedorDirecComponent>
    , @Inject(MAT_DIALOG_DATA) private data: any) {
    this.url = baseUrl;
    this.ListarConteniedo(data.id)
    this.nombreEmpresa = data.nombre;
  }

  ngOnInit(): void {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');
    this.dataTraida = this.data;

    this.usuario = localStorage['Name']
    this.crearFormulario();
    this.listaDepartamento()
  }

  listaDepartamento() {
    this.pEntidad = 1
    this.pOpcion = 2
    this.pTipo = 6;
    this.pParametro = [];
    this.pParametro.push(this.pPais)
    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe((data: any) => {

      this.departamento = data
    })
    this.forma.controls.provincia.setValue(null);
    this.forma.controls.distrito.setValue(null);
  }

  listaProvincia(event) {
    this.pEntidad = 1
    this.pParametro = []
    this.pOpcion = 2
    this.pTipo = 7;
    this.pParametro.push(event)
    
    this.distrito = []
    this.provincia = []
    this.forma.controls.distrito.setValue(null);
    this.forma.controls.provincia.setValue(null);

    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe((data: any) => {

      this.provincia = data
    })

  }

  listaDistrito(event) {
    this.pEntidad = 1
    this.pParametro = []
    this.pOpcion = 2
    this.pTipo = 8;
    this.pParametro.push(event)

    this.distrito = []
    this.forma.controls.distrito.setValue(null);

    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe((data: any) => {

      this.distrito = data
    })
  }

  get direccionNoValido() {

    return this.forma.get('direccion').invalid && this.forma.get('direccion').touched
  }
  get referenciaNoValido() {

    return this.forma.get('referencia').invalid && this.forma.get('referencia').touched
  }
  get departamentoNoValido() {

    return this.forma.get('departamento').invalid && this.forma.get('departamento').touched
  }
  get provinciaNoValido() {

    return this.forma.get('provincia').invalid && this.forma.get('provincia').touched
  }
  get distritoNoValido() {

    return this.forma.get('distrito').invalid && this.forma.get('distrito').touched
  }

  crearFormulario() {
    this.forma = this.fb.group({
      id: [0],
      direccion: ['', [Validators.required, Validators.minLength(3)]],
      referencia: ['', [Validators.required, Validators.minLength(3)]],
      departamento: [null, Validators.required],
      provincia: [null, Validators.required,],
      distrito: [null, Validators.required],
      nPrincipal: [],
      estado: [],

      //Para filtrar
      filtro: ['']
    })
  };

  ListarConteniedo(termino) {
    this.pParametro = []
    this.pEntidad = 2;
    this.pOpcion = 1
    this.pTipo = 1
    this.pParametro.push(termino)

    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe(data => {

      // let array = data.map(item => {
      //   return {
      //     pIdPost: item['nIdDireccion'],
      //     sDireccion: item['sDireccion'],
      //     sReferencia: item['sReferencia'],
      //     sDepartamento: item['sDepartamento'],
      //     sProvincia: item['sProvincia'],
      //     sDistrito: item['sDistrito'],
      //     sEstado: item['sEstado'],
      //     sPrincipal: item['sPrincipal'],
      //     nPrincipal: item['nPrincipal']
      //   }
      // })

      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    })
  }

  edit(termino) {
    this.pParametro = []
    this.pEntidad = 2;
    this.pOpcion = 2
    this.pTipo = 0;
    this.pParametro.push(termino)

    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe(data => {
      // debugger;
      this.forma.controls.id.setValue(data['nIdDireccion']);

      this.forma.controls.departamento.setValue(data['sDepartamento']);
      this.forma.controls.provincia.setValue(data['sProvincia']);
      this.forma.controls.distrito.setValue(data['sDistrito']);

      this.forma.controls.direccion.setValue(data['sDireccion']);
      this.forma.controls.referencia.setValue(data['sReferencia']);
      this.forma.controls.nPrincipal.setValue(data['nPrincipal']);

      let valores = this.forma.value;
      this.detalleSeleccionado = valores;

      this.listaProvincia(valores.departamento)
      this.listaDistrito(valores.provincia)
      this.forma.controls.provincia.setValue(data['sProvincia']);
      this.forma.controls.distrito.setValue(data['sDistrito']);

    })
  }

  activar(termino, estado) {
    this.pParametro = []
    this.pEntidad = 2;
    this.pOpcion = 1;
    this.pTipo = 2
    this.pParametro.push(termino)
    this.pParametro.push(this.idUser)
    this.pParametro.push(estado)
    this.pParametro.push(this.pPais)

    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe(data => {
      if (Number(data) > 0) {
        Swal.fire({
          icon: 'success',
          title: 'Exito',
          text: 'Dirección cambio de estado!',
          showConfirmButton: false,
          timer: 1500
        }).then(r => {
          this.ListarConteniedo(this.dataTraida.id);
          this.crearFormulario();
        })
      }
      else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'comuniquese con el area de sistema',
        }).then(r => {
          this.ListarConteniedo(this.dataTraida.id);
          this.crearFormulario();
        })
      }

    })
  }

  guardar() {
    if (this.forma.invalid) {
      return Object.values(this.forma.controls).forEach(control => {
        if (control instanceof FormGroup) {
          Object.values(control.controls).forEach(control => control.markAsTouched());

        } else {
          control.markAsTouched();

        }
      });
    }
    this.pParametro = []
    this.pEntidad = 2;

    let valores = this.forma.getRawValue();
    let valores1 = this.forma.value
    if (valores.id != 0) {
      this.pOpcion = 4
    } else {
      this.pOpcion = 3
    }
    if (valores.estado == true) {
      this.estado = 1
    } else {
      this.estado = 0
    }

    this.pTipo = 0
    let principal = valores.nPrincipal == true ? 1 : 0
    this.pParametro.push(this.data.id);
    this.pParametro.push(valores.id);
    this.pParametro.push(valores.distrito);
    this.pParametro.push(valores.direccion);
    this.pParametro.push(valores.referencia);
    this.pParametro.push(this.idUser);
    this.pParametro.push(this.estado);
    this.pParametro.push(principal);
    this.pParametro.push(this.pPais);

    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe(data => {
      if (Number(data) > 0) {

        Swal.fire({
          icon: 'success',
          title: 'Exito',
          text: 'se realizo exitosamente',
          showConfirmButton: false,
          timer: 1500
        }).then(r => {
          this.ListarConteniedo(this.dataTraida.id);
          this.crearFormulario();

        })
      }
      else {
        Swal.fire({
          icon: 'error',
          title: 'Problemas',
          text: 'comuniquese con el area de sistema',
        }).then(r => {
          this.ListarConteniedo(this.dataTraida.id);
          this.crearFormulario();

        })
      }
    })

  }


  fnFiltrar() {
    var filtro = "";

    if (this.forma.controls.filtro.value == null) {
      return;
    }
    filtro = this.forma.controls.filtro.value.trim(); // Remove whitespace
    filtro = filtro.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filtro;
  }

}
