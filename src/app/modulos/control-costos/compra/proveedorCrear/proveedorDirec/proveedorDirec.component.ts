import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompraService } from '../../compra.service';
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

  pEntidad = 1; //Cabecera del movimiento
  pOpcion = 2;  //CRUD -> Listar
  pParametro = []; //Parametros de campos vacios
  pTipo = 1;       //Listar Solo Guias de ingreso
  pDetalle = []//Parametros de campos vacios
  url: string; //variable de un solo valor
  estado
  fecha:Date= new Date();
  usuario
  displayedColumns: string[] = ['opciones', 'direccion', 'referencia', 'departamento', 'provincia', 'distrito','estado']
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private fb: FormBuilder, private rutas: CompraService, @Inject('BASE_URL') baseUrl: string, private dialogRef: MatDialogRef<ProveedorDirecComponent>
    , @Inject(MAT_DIALOG_DATA) private data: any) {
    this.url = baseUrl;
    this.ListarConteniedo(data)
  }

  ngOnInit(): void {  
    this.usuario=localStorage['Name']
    this.crearFormulario();
    this.listaDepartamento()
  }

  listaDepartamento() {
    this.pEntidad = 1
    this.pOpcion = 2
    this.pTipo = 6;
    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe((data: any) => {

      this.departamento = data
    })
  }

  listaProvincia(event) {
    this.pEntidad = 1
    this.pParametro = []
    this.pOpcion = 2
    this.pTipo = 7;
    this.pParametro.push(event)

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
      departamento: ['', Validators.required],
      provincia: ['', Validators.required,],
      distrito: ['', Validators.required],
      estado: []

    })
  };

  ListarConteniedo(termino) {
    this.pEntidad = 2;
    this.pOpcion = 1
    this.pTipo=1
    this.pParametro.push(termino)
    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe(data => {

      let array = data.map(item => {
        return {
          pIdPost: item['nIdDireccion'],
          sDireccion: item['sDireccion'],
          sReferencia: item['sReferencia'],
          sDepartamento: item['sDepartamento'],
          sProvincia: item['sProvincia'],
          sDistrito: item['sDistrito'],
          sEstado: item['sEstado'],
        }
      }) 
      this.dataSource = new MatTableDataSource(array);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    })
  }
  edit(termino) {
    this.pParametro = []
    this.pEntidad = 2;
    this.pOpcion = 2
    this.pParametro.push(termino)
    this.pTipo=0;
    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe(data => {

      this.forma = this.fb.group({
        id: data['nIdDireccion'],
        direccion: data['sDireccion'],
        referencia: data['sReferencia'],
        departamento: Number(data['sDepartamento']),
        provincia: Number(data['sProvincia']),
        distrito: Number(data['sDistrito']),
        estado: data['nIdEstado'],
      })
      let valores = this.forma.value; 
      this.listaProvincia(valores.departamento)
      this.listaDistrito(valores.provincia)

    })
  }
  eliminar(termino) {
    this.pParametro = []
    this.pEntidad = 2;
    this.pOpcion = 1;
    this.pTipo=2
    this.pParametro.push(termino)
    this.pParametro.push(1)
    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe(data=>{
      if (Number(data) > 0) { 
        Swal.fire({
          icon: 'success',
          title: 'Exito',
          text: 'Dirección esta inactiva',
        }) 
      }
      else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'comuniquese con el area de sistema',
        })
      }
    })
  }
  guardar() {
    if (this.forma.invalid) {
      return Object.values(this.forma.controls).forEach(control => {
        if (control instanceof FormGroup) {
          Object.values(control.controls).forEach(control => control.markAsTouched());
          console.log("entro aqui validado")

        } else {
          control.markAsTouched();

        }
      });
    }
    this.pParametro = []
    this.pEntidad = 2;

    let valores = this.forma.value;
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
    this.pParametro.push(this.data);
    this.pParametro.push(valores.id);
    this.pParametro.push(valores.distrito);
    this.pParametro.push(valores.direccion);
    this.pParametro.push(valores.referencia);
    this.pParametro.push(1);
    this.pParametro.push(this.estado);

    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe(data => {

      this.dialogRef.close();
      if (Number(data) > 0) {

        Swal.fire({
          icon: 'success',
          title: 'Exito',
          text: 'se realizo exitosamente',
        })
      }
      else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'comuniquese con el area de sistema',
        })
      }
    })

  }


}
