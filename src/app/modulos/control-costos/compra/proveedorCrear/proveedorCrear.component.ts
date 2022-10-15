import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { CompraService } from '../compra.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { ProveedorBancoComponent } from './proveedorBanco/proveedorBanco.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
@Component({
  selector: 'app-proveedor-crear',
  templateUrl: './proveedorcrear.component.html',
  styleUrls: ['./proveedorcrear.component.css']
})
export class ProveedorCrearComponent implements OnInit {
  cliente: any[] = []
  contribuyente: any[] = []
  negocio: any[] = []
  banco: any[] = []
  departamento: any[] = []
  provincia: any[] = []
  distrito: any[] = []
  forma = new FormGroup({});

  idParametro: number=0;
  ///===================
  pEntidad = 1; //Cabecera del movimiento
  pOpcion = 2;  //CRUD -> Listar
  pParametro = []; //Parametros de campos vacios
  pTipo = 1;       //Listar Solo Guias de ingreso
  pDetalle = []//Parametros de campos vacios
  //========================

  url: string; //variable de un solo valor
  validar: boolean = false
  //varaible table
  displayedColumns: string[] = ['opciones', 'banco', 'cuenta', 'cuentaInter', 'moneda']
  validarDatos: any[] = [];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(private spinner: NgxSpinnerService, private rutas: CompraService, @Inject('BASE_URL') baseUrl: string,
    private fb: FormBuilder, private route: ActivatedRoute, private dialog: MatDialog, private routeNavegate: Router) { this.url = baseUrl; }

  ngOnInit(): void {
    //crear el formulario
    this.crearFormulario()
    //llamar a  lista
    this.listacliente()
    this.listacontribuyente()
    this.listanegocio()
    this.listabanco()
    this.listaDepartamento()

    //listar campos para editar
    this.route.params.subscribe(params => {

      if (params['id'] != 0) {
        this.idParametro = params['id']
        this.obtenerData(params['id'])
      }

    })
  }


  listacliente() {
    this.pOpcion = 2
    this.pTipo = 2;

    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe((data: any) => {


      this.cliente = data
    })
  }
  listacontribuyente() {
    this.pOpcion = 2
    this.pTipo = 3;
    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe((data: any) => {

      this.contribuyente = data
    })
  }
  listanegocio() {
    this.pOpcion = 2
    this.pTipo = 4;
    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe((data: any) => {
      this.negocio = data
    })
  }
  listabanco() {
    this.pOpcion = 2
    this.pTipo = 5;
    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe((data: any) => {
      this.banco = data
    })
  }

  listaDepartamento() {
    this.pOpcion = 2
    this.pTipo = 6;
    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe((data: any) => {

      this.departamento = data
    })
  }

  listaProvincia(event) {
    this.pParametro = []
    this.pOpcion = 2
    this.pTipo = 7;
    this.pParametro.push(event)

    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe((data: any) => {

      this.provincia = data
    })
  }
  listaDistrito(event) {
    this.pParametro = []
    this.pOpcion = 2
    this.pTipo = 8;
    this.pParametro.push(event)

    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe((data: any) => {

      this.distrito = data
    })
  }


  get clienteNoValido() {

    return this.forma.get('cliente').invalid && this.forma.get('cliente').touched
  }
  get contribuyenteNoValido() {

    return this.forma.get('contribuyente').invalid && this.forma.get('contribuyente').touched
  }
  get negocioNoValido() {

    return this.forma.get('negocio').invalid && this.forma.get('negocio').touched
  }

  get rucNoValido() {

    return this.forma.get('ruc').invalid && this.forma.get('ruc').touched
  }
  get monedaNoValido() {

    return this.forma.get('nMoneda').invalid && this.forma.get('nMoneda').touched
  }
  get razonsocialNoValido() {

    return this.forma.get('razonsocial').invalid && this.forma.get('razonsocial').touched
  }
  get nombreComercialNoValido() {

    return this.forma.get('nombreComercial').invalid && this.forma.get('nombreComercial').touched
  }

  get paginaWebNoValido() {

    return this.forma.get('paginaWeb').invalid
  }
  get telefono1NoValido() {

    return this.forma.get('telefono1').invalid
  }
  get contactoNoValido() {

    return this.forma.get('contacto').invalid && this.forma.get('contacto').touched
  }
  get contactoCorreoNoValido() {

    return this.forma.get('contactoCorreo').invalid && this.forma.get('contactoCorreo').touched
  }
  get plazoPagoNoValido() {

    return this.forma.get('plazoPago').invalid && this.forma.get('plazoPago').touched
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
  get direccionNoValido() {

    return this.forma.get('direccion').invalid && this.forma.get('direccion').touched
  }
  get referenciaNoValido() {

    return this.forma.get('referencia').invalid && this.forma.get('referencia').touched
  }
  get contactoTelefonoNoValido() {

    return this.forma.get('contactoTelefono').invalid && this.forma.get('contactoTelefono').touched
  }
  crearFormulario() {
    this.forma = this.fb.group({
      id: [0],
      cliente: ['', [Validators.required]],
      contribuyente: ['', [Validators.required]],
      negocio: ['', [Validators.required]],
      banco: ['',],
      ruc: ['', [Validators.required, Validators.minLength(1)]],
      razonsocial: ['', [Validators.required, Validators.minLength(1)]],
      nombreComercial: ['', [Validators.required, Validators.minLength(1)]],
      paginaWeb: ['', [Validators.required, Validators.minLength(1)]],
      telefono1: ['', [Validators.required, Validators.minLength(1)]],
      telefono2: ['',],
      contacto: ['', [Validators.required, Validators.minLength(1)]],
      contactoCorreo: ['', [Validators.required, Validators.minLength(1)]],
      contactoTelefono: ['', [Validators.required, Validators.minLength(1)]],
      plazoPago: ['', [Validators.required, Validators.minLength(1)]],
      nCuenta: ['',],
      cuentaInterbancaria: ['',],
      departamento: ['', [Validators.required]],
      provincia: ['', [Validators.required]],
      distrito: ['', [Validators.required]],
      direccion: ['', [Validators.required, Validators.minLength(1)]],
      referencia: ['', [Validators.required, Validators.minLength(1)]],
      estado: ['']
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
    if (this.idParametro > 0) {
      this.pOpcion = 3
    } else {
      this.pOpcion = 1
    }
    this.pParametro = []
    this.pEntidad = 1

    this.pTipo = 0
    let vValidacionDatos = this.forma.value;
    this.pParametro.push(vValidacionDatos.id)
    this.pParametro.push(vValidacionDatos.cliente)
    this.pParametro.push(vValidacionDatos.contribuyente)
    this.pParametro.push(vValidacionDatos.ruc)
    this.pParametro.push(vValidacionDatos.razonsocial)
    this.pParametro.push(vValidacionDatos.nombreComercial)
    this.pParametro.push(vValidacionDatos.paginaWeb)
    this.pParametro.push(vValidacionDatos.telefono1)
    this.pParametro.push(vValidacionDatos.telefono2)
    this.pParametro.push(vValidacionDatos.contacto)
    this.pParametro.push(vValidacionDatos.contactoCorreo)
    this.pParametro.push(vValidacionDatos.contactoTelefono)
    this.pParametro.push(vValidacionDatos.plazoPago)
    this.pParametro.push(vValidacionDatos.negocio)
    this.pParametro.push(1)   // userReg
    this.pParametro.push(vValidacionDatos.estado == true ? 1 : 0)  //estado
    this.pParametro.push(vValidacionDatos.direccion)
    this.pParametro.push(vValidacionDatos.referencia)
    this.pParametro.push(vValidacionDatos.distrito)

    this.spinner.show();
    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe((data: any) => {
      console.log(data)
      if (Number(data) === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'alerta!',
          text: 'Proveedor/Cliente ya esta registrado',
        })
      }
      else if (Number(data) > 0) {
        Swal.fire({
          icon: 'success',
          title: 'Exito',
          text: 'se realizo exitosamente',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'comuniquese con el area de sistema',
        })
      }
    }, err => {
      console.log(err);
      this.spinner.hide();
    },
      () => {
        this.spinner.hide();
      })


  }

  cerrar() {
    this.routeNavegate.navigate(['/compra/proveedor'])
  }
  ///==============================
  ///=======Editar==========
  ///=============================
  obtenerData(id: number) {
    this.spinner.show();
    this.pOpcion = 4
    this.pTipo = 0
    this.pParametro.push(id)
    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe(data => {

      this.forma = this.fb.group({
        id: data['pIdPost'],
        cliente: data['nIdTipoEntidad'],
        contribuyente: data['nIdTipoContribuyente'],
        negocio: data['nIdGiroNegocio'],
        ruc: data['sRuc'],
        razonsocial: data['sRazonSocial'],
        nombreComercial: data['sNombreComercial'],
        paginaWeb: data['sPaginaWeb'],
        telefono1: data['sTelefono1'],
        telefono2: data['sTelefono2'],
        contacto: data['sContacto'],
        contactoCorreo: data['sContactoCorreo'],
        contactoTelefono: data['sContactoTelefono'],
        plazoPago: data['nPlazoPago'],
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
      console.log(data['oDetalle'][0]['nId'])
      if (data['oDetalle'][0]['nId'] != 0) {
        for (let item of data['oDetalle']) {
          this.pDetalle.push(item)
        }
      }

      this.validarDatos = this.pDetalle;
      this.dataSource = new MatTableDataSource(this.pDetalle);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    },
      err => {
        this.spinner.hide();
        console.log(err);
      },
      () => {
        this.spinner.hide();
      })
  }
  agregar() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {"data":0,
    "IdProveedor": this.idParametro}
    const digalogReg = this.dialog.open(ProveedorBancoComponent, dialogConfig);
    digalogReg.componentInstance.oDatos.subscribe(res => {
    
      this.pDetalle.push(res)
      this.dataSource = new MatTableDataSource(this.pDetalle);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
   


    })
  }
  edit(Termino) {
    this.eliminarPorName(Termino)
    const dialogConfig = new MatDialogConfig(); 
    dialogConfig.data = {"data":Termino,
                          "IdProveedor": this.idParametro}
    const digalogReg = this.dialog.open(ProveedorBancoComponent, dialogConfig);
    digalogReg.componentInstance.oDatos.subscribe(res => {
      console.log(res)
      this.pDetalle.push(res)
      this.dataSource = new MatTableDataSource(this.pDetalle);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      console.log(this.pDetalle)
    })
  }
  eliminarPorName(Termino) {
    this.pDetalle = this.pDetalle.filter(function (rest) {
      return rest.nId !== Termino;
    })

    this.dataSource = new MatTableDataSource(this.pDetalle);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }
  eliminar(Termino) {
    Swal.fire({
      title: 'estas seguro de eliminar',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Si`,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    }).then((result) => {
      /* ingresa cuando esta ok*/
      if (result.isConfirmed) {

        this.pParametro = []
        this.pEntidad = 3
        this.pOpcion = 2
        this.pParametro.push(Termino)

        this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe(data => {
          if (Number(data) > 0) {


            this.pDetalle = this.pDetalle.filter(function (rest) {
              return rest.nId !== Termino;
            })

            this.dataSource = new MatTableDataSource(this.pDetalle);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;

            Swal.fire({
              icon: 'success',
              title: 'Exito',
              text: 'se realizo exitosamente',
            })
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'comuniquese con el area de sistema',
            })
          }
        })

      }
    })

  }
  consultar(event) {


    this.spinner.show()
    this.rutas.fnconsultarSunat(event.target.value, this.url).subscribe(rest => {
      console.log(rest)
      if (rest.Tipo ==undefined) {
        this.validar = true
        this.forma.controls['razonsocial'].setValue(rest['razonSocial'])
        this.forma.controls['cliente'].setValue(rest['tipoentidad'])
        this.forma.controls['nombreComercial'].setValue(rest['nombreComercial'])
      } else {
        this.validar = false
        this.forma.controls['razonsocial'].setValue(rest['RazonSocial'])
        // this.forma.controls['cliente'].setValue(rest['tipoentidad'])
        this.forma.controls['nombreComercial'].setValue(rest['NombreComercial'])
        this.forma.controls['direccion'].setValue(rest['Direccion'])
      }
      console.log(this.validar)

    }, err => {
      this.spinner.hide();
      console.log(err);
    },
      () => {
        this.spinner.hide();
      })

  }

}

