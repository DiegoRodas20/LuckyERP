import { DatePipe } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { take } from 'rxjs/operators';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import { FilecontrolService } from 'src/app/shared/services/filecontrol.service';
import Swal from 'sweetalert2';
import { CompraService } from '../../compra.service';
import { ProveedorBancoComponent } from './proveedorBanco/proveedorBanco.component';
import { ProveedorDocumentoPdfComponent } from './proveedorDocumentoPdf/proveedorDocumentoPdf.component';

export interface TipoDocumento {
  nEleCod: number;
  cEleNam: string;
}

@Component({
  selector: 'app-proveedor-crear',
  templateUrl: './proveedorcrear.component.html',
  styleUrls: ['./proveedorcrear.component.css'],
  providers: [DatePipe],
  animations: [asistenciapAnimations]
})
export class ProveedorCrearComponent implements OnInit {
  cliente: any[] = []
  contribuyente: any[] = []
  negocio: any[] = []
  banco: any[] = []
  departamento: any[] = []
  provincia: any[] = []
  distrito: any[] = []
  listaTipoDoc: any[] = [];
  listaTipoDocStatica: any[] = [];
  forma = new FormGroup({});
  formArchivo = new FormGroup({});
  formDatosPdf = new FormGroup({});

  idParametro: number = 0;
  ///===================
  pEntidad = 1; //Cabecera del movimiento
  pOpcion = 2;  //CRUD -> Listar
  pParametro = []; //Parametros de campos vacios
  pTipo = 1;       //Listar Solo Guias de ingreso
  pDetalle = []//Parametros de campos vacios
  //========================

  nEstado;

  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  url: string; //variable de un solo valor
  validar: boolean = false
  nIdArea: number;

  //SubirArchivo PDF
  vArchivoSeleccionado = File;
  progreso: number;
  fileString: string;
  extencion
  vNameRutaFile
  tipoDocumento: TipoDocumento[] = []
  nMostrar: number;

  sRucActual: string = "";
  nLongitud: number = 0;
  nLongitudMax: number = 0;
  //varaible table
  displayedColumns: string[] = ['opciones', 'sBanco', 'tipoCuenta', 'sCuenta', 'sCuentaInter', 'sMoneda']
  displayedColumnsPdf: string[] = ['opciones', 'sTipoDoc', 'sNombre', 'sFechaDocumento', 'sUsuario', 'sFechaSubio']
  personaJuridica: boolean;
  validarDatos: any[] = [];
  dataSource: MatTableDataSource<any>;
  dataSourceProveedor: MatTableDataSource<any>;

  // Botones
  tsLista = 'inactive';
  fbLista = [
    { icon: 'save', tool: 'Grabar', state: true, color: 'secondary' },
    { icon: 'check', tool: 'Activar', state: true, color: 'secondary' },
    { icon: 'block', tool: 'Inactivar', state: true, color: 'secondary' },
    { icon: 'exit_to_app', tool: 'Salir', state: true, color: 'warn' },
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto


  @ViewChild('paginatorDocumentos', { static: true }) paginatorDocumentos: MatPaginator;
  @ViewChild('sortDocumentos', { static: true }) sortDocumentos: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('archivoFile') archivoFile: ElementRef;

  constructor(
    private spinner: NgxSpinnerService,
    private rutas: CompraService, @Inject('BASE_URL') baseUrl: string,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private routeNavegate: Router,
    private vFilecontrolService: FilecontrolService,
    private datePipe: DatePipe
  ) {
    this.url = baseUrl;
    this.nMostrar = 0;
  }

  async ngOnInit(): Promise<void> {
    this.onToggleFab(1, -1);
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.routeNavegate.routeReuseStrategy.shouldReuseRoute = () => false;
    this.routeNavegate.onSameUrlNavigation = 'reload';

    //crear el formulario
    this.crearFormulario()
    //llamar a  lista
    this.listacliente()
    this.listacontribuyente()
    this.listanegocio()
    this.listarTipoDocumento(this.pPais);
    this.listabanco()
    this.listaDepartamento()

    this.fnCargarTipoDocumento()


    this.areaUsuario()



    //listar campos para editar
    this.route.params.subscribe(params => {

      if (params['id'] != 0) {
        this.idParametro = params['id']
        this.obtenerData(params['id'])
      }

    })
    //Trayendo la longitud y updateando los validators del length
    // await this.traerLongitudRuc();
    // this.forma.controls.ruc.setValidators([Validators.minLength(this.nLongitud), Validators.maxLength(this.nLongitud), Validators.required, Validators.pattern(/^[0-9]\d*$/)])
    this.fnListarArchivo();

    this.fnControlFab();
  }

  //#region Botones

  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;
  }

  async clickFab(index: number) {
    switch (index) {
      case 0:
        this.guardar();
        break;
      case 1:
        this.activar();
        break;
      case 2:
        this.inactivar();
        break;
      case 3:
        this.cerrar();
        break;
      default:
        break;
    }
  }

  fnControlFab() {

    this.fbLista[0].state = this.forma ? true : false; // Grabar
    this.fbLista[1].state = this.idParametro != 0 && this.nEstado == 0 && this.forma ? true : false; // Activar
    this.fbLista[2].state = this.idParametro != 0 && this.nEstado == 1 && this.forma ? true : false; // Inactivar
    this.fbLista[3].state = this.forma ? true : false; // Salir

    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion

  areaUsuario() {

    this.pParametro = [];
    this.pParametro.push(this.idUser)

    this.rutas.fnDatoBasico(1, 1, this.pParametro, 2, this.url, this.pDetalle).subscribe(data => {
      this.nIdArea = data;

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

  listarTipoDocumento(sPais: string) {
    const nEntidad = 1;
    const nOpcion = 2;
    const nTipo = 12;
    this.pParametro = [];
    this.pParametro.push(sPais)

    this.rutas.fnDatoBasico(nEntidad, nOpcion, this.pParametro, nTipo, this.url, this.pDetalle).subscribe((data: any) => {
      this.listaTipoDoc = data;
      this.listaTipoDocStatica = data;
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
    this.pParametro = [];
    this.pParametro.push(this.pPais);
    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe((data: any) => {

      this.departamento = data
    })

    this.forma.controls.provincia.setValue(null);
    this.forma.controls.distrito.setValue(null);

  }

  listaProvincia(event) {
    this.pOpcion = 2
    this.pTipo = 7;
    this.pParametro = [];
    this.pParametro.push(event)
    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe((data: any) => {
      this.provincia = data
    })

    this.distrito = [];
    this.forma.controls.provincia.setValue('');
    this.forma.controls.distrito.setValue('');
  }

  listaDistrito(event) {
    this.pParametro = []
    this.pOpcion = 2
    this.pTipo = 8;
    this.pParametro.push(event)

    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe((data: any) => {
      this.distrito = data
    })
    this.forma.controls.distrito.setValue('');
  }

  fnCargarTipoDocumento() {
    let pEntidad = 4
    let pOpcion = 1
    let pTipo = 1
    let pParametro = []

    this.rutas.fnDatoBasico(pEntidad, pOpcion, pParametro, pTipo, this.url, null).subscribe(
      (data: any) => { this.tipoDocumento = data; }
    );
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

  get contactoCargoNoValido() {

    return this.forma.get('contactoCargo').invalid && this.forma.get('contactoCargo').touched
  }


  get nTipDocNoValido() {
    return this.forma.get('tipDoc').invalid && this.forma.get('tipDoc').touched
  }

  crearFormulario() {
    this.forma = this.fb.group({
      id: [0],
      cliente: ['', [Validators.required]],
      contribuyente: ['', [Validators.required]],
      negocio: ['', [Validators.required]],
      banco: ['',],
      ruc: [''],
      razonsocial: ['', [Validators.required, Validators.minLength(4)]],
      nombreComercial: ['', [Validators.required, Validators.minLength(4)]],
      paginaWeb: ['', [Validators.required, Validators.minLength(1)]],
      telefono1: ['', [Validators.required, Validators.minLength(1)]],
      telefono2: ['',],
      contacto: ['', [Validators.required, Validators.minLength(2)]],
      contactoCorreo: ['', [Validators.required, Validators.minLength(5)]],
      contactoTelefono: ['', [Validators.required, Validators.minLength(1)]],
      contactoCargo: ['', [Validators.required, Validators.minLength(3)]],
      plazoPago: ['', [Validators.required, Validators.minLength(1), Validators.min(1)]],
      nCuenta: ['',],
      cuentaInterbancaria: ['',],
      departamento: [null, [Validators.required]],
      provincia: [null, [Validators.required]],
      distrito: [null, [Validators.required]],
      direccion: ['', [Validators.required, Validators.minLength(1)]],
      referencia: ['', [Validators.required, Validators.minLength(1)]],
      estado: ['Activo'],
      txtCreado: [''],
      txtModificado: [''],
      tipDoc: [null]
    })

    this.formArchivo = this.fb.group({
      fileUpload: ['', Validators.required]
    })

    this.formDatosPdf = this.fb.group({
      lstTipoDoc: ['', Validators.required],
      nombre: ['', Validators.required],
      fechaDoc: ['', Validators.required],
    })
  }



  guardar() {

    if (this.forma.invalid) {
      return Object.values(this.forma.controls).forEach(control => {
        if (control instanceof FormGroup) {
          Object.values(control.controls).forEach(control => control.markAsTouched());


        } else {
          control.markAsTouched();
          Swal.fire('¡Atención!', 'Existen datos pedientes por completar, verificar datos del proveedor, contacto, dirección ', 'warning')

        }
      });
    }

    var vtipDoc = this.forma.controls.tipDoc.value
    this.cambioTipoDocumento(vtipDoc);

    let nDocumento = this.forma.get('ruc').value;
    if (nDocumento.length < this.nLongitud || nDocumento.length > this.nLongitudMax) {
      return Swal.fire('¡Atención!', 'El número de documento no contiene la cantidad de dígitos correctos, revisar por favor ', 'warning');
    }


    let vDepartamento = this.forma.controls.departamento.value;
    let vProvincia = this.forma.controls.provincia.value;
    let vDistrito = this.forma.controls.distrito.value;

    if (this.idParametro > 0) {
      this.pOpcion = 3
    } else {
      this.pOpcion = 1
    }
    this.pParametro = []
    this.pEntidad = 1
    this.pTipo = 1

    let vValidacionDatos = this.forma.value;
    this.pParametro.push(vValidacionDatos.id)                 //1
    this.pParametro.push(vValidacionDatos.cliente)            //2
    this.pParametro.push(vValidacionDatos.contribuyente)      //3
    this.pParametro.push(vValidacionDatos.ruc)                //4
    this.pParametro.push(vValidacionDatos.razonsocial)        //5
    this.pParametro.push(vValidacionDatos.nombreComercial)    //6
    this.pParametro.push(vValidacionDatos.paginaWeb)          //7
    this.pParametro.push(vValidacionDatos.telefono1)          //8
    this.pParametro.push(vValidacionDatos.telefono2)          //9
    this.pParametro.push(vValidacionDatos.contacto)           //10
    this.pParametro.push(vValidacionDatos.contactoCorreo)     //11
    this.pParametro.push(vValidacionDatos.contactoTelefono)   //12
    this.pParametro.push(vValidacionDatos.plazoPago)          //13
    this.pParametro.push(vValidacionDatos.negocio)            //14
    this.pParametro.push(this.idUser)   // userReg            //15
    this.pParametro.push(1)  //estado                         //16
    this.pParametro.push(vValidacionDatos.direccion)          //17
    this.pParametro.push(vValidacionDatos.referencia)         //18
    this.pParametro.push(vValidacionDatos.distrito)           //19
    this.pParametro.push(vValidacionDatos.contactoCargo)      //20
    this.pParametro.push(this.pPais)                          //21
    this.pParametro.push(this.nIdArea)                        //22
    this.pParametro.push(vValidacionDatos.tipDoc)             //23

    //Zona de confirmacion de guardado
    Swal.fire({
      title: '¿Desea guardar el Proveedor?',
      text: "Se guardará el registro",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        //Ejedutando los cambios a BD

        this.spinner.show();
        this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe((data: any) => {
          if (Number(data) === 0) {
            Swal.fire({
              icon: 'warning',
              title: '¡Atención!',
              text: 'Proveedor/Cliente ya esta registrado, no puede registrarlo nuevamente',
            })
          }
          else if (Number(data) > 0) {
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: 'Se guardó el registro',
              showConfirmButton: false,
              timer: 1500
            }).then(r => {
              if (this.idParametro != 0) {
                this.routeNavegate.navigate(['/controlcostos/compra/proveedor/', this.idParametro])
              } else {
                this.routeNavegate.navigate(['/controlcostos/compra/proveedor/', data])
              }
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
    })
  }

  cerrar() {
    this.routeNavegate.navigate(['/controlcostos/compra/proveedor'])
  }
  ///==============================
  ///=======Editar==========
  ///=============================
  obtenerData(id: number) {
    this.nMostrar = 1;
    this.spinner.show();
    this.pOpcion = 4
    this.pTipo = 0
    this.pParametro = [];
    this.pParametro.push(id)
    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe(data => {
      this.sRucActual = data['sRuc'];

      this.forma = this.fb.group({
        id: [data['pIdPost'],],
        cliente: [data['nIdTipoEntidad'], [Validators.required]],
        contribuyente: [data['nIdTipoContribuyente'], [Validators.required]],
        negocio: [data['nIdGiroNegocio'], [Validators.required]],
        ruc: [data['sRuc']],
        razonsocial: [data['sRazonSocial'], [Validators.required, Validators.minLength(3)]],
        nombreComercial: [data['sNombreComercial'], [Validators.required, Validators.minLength(3)]],
        paginaWeb: [data['sPaginaWeb'], [Validators.required, Validators.minLength(1)]],
        telefono1: [data['sTelefono1'], [Validators.required, Validators.minLength(1)]],
        telefono2: data['sTelefono2'],
        contacto: [data['sContacto'], [Validators.required, Validators.minLength(2)]],
        contactoCorreo: [data['sContactoCorreo'], [Validators.required, Validators.minLength(5)]],
        contactoCargo: [data['sContactoCargo'], [Validators.required, Validators.minLength(3)]],
        contactoTelefono: [data['sContactoTelefono'], [Validators.required, Validators.minLength(4)]],
        plazoPago: [data['nPlazoPago'], [Validators.required, Validators.minLength(1)]],
        direccion: [data['sDireccion'], [Validators.required, Validators.minLength(5)]],
        referencia: [data['sReferencia'], [Validators.required, Validators.minLength(5)]],

        departamento: [data['sDepartamento'], [Validators.required]],
        provincia: [data['sProvincia'], Validators.required],
        distrito: [data['sDistrito'], Validators.required],

        estado: (data['nIdEstado'] == 1 ? 'Activo' : 'Inactivo'),
        txtCreado: data['sCreado'],
        txtModificado: data['sModificado'],
        tipDoc: [data['nIdTipoDocumento'], Validators.required]
      })

      let valores = this.forma.value;
      this.nEstado = data['nIdEstado'];
      this.listaProvincia(valores.departamento)
      this.listaDistrito(valores.provincia)
      this.forma.controls.distrito.setValue(data['sDistrito']); //Asignando el distritro del la direccion principal

      if (data['oDetalle'][0]['nId'] != 0) {
        for (let item of data['oDetalle']) {
          this.pDetalle.push(item)
        }
      }

      this.forma.controls.departamento.setValue(data['sDepartamento']);
      this.forma.controls.provincia.setValue(data['sProvincia']);
      this.forma.controls.distrito.setValue(data['sDistrito']);

      this.validarDatos = this.pDetalle;
      this.dataSource = new MatTableDataSource(this.pDetalle);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      this.fnControlFab();
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
    dialogConfig.data = {
      "data": null,
      "IdProveedor": this.idParametro
    }
    const digalogReg = this.dialog.open(ProveedorBancoComponent, dialogConfig);
    digalogReg.componentInstance.oDatos.pipe(take(1)).subscribe(res => {

      this.pParametro = [];
      this.pParametro.push(this.idParametro);
      this.pParametro.push(res.nId); // Id nIdClienteBanco
      this.pParametro.push(res.nBanco);
      this.pParametro.push(res.sCuenta);
      this.pParametro.push(res.sCuentaInter);
      this.pParametro.push(res.nMoneda);
      this.pParametro.push(res.nIdTipoCuenta);

      //Se pone null para que el backend no mapee erroneamente el detalle
      this.rutas.fnDatoBasico(3, 1, this.pParametro, 1, this.url, null).subscribe((respuesta) => {
        let body = {
          'nId': Number.parseInt(respuesta),
          'nBanco': res.nBanco,
          'sBanco': res.sBanco,
          'sCuenta': res.sCuenta,
          'sCuentaInter': res.sCuentaInter,
          'nMoneda': res.nMoneda,
          'sMoneda': res.sMoneda,
          'tipoCuenta': res.tipoCuenta,
          'nIdTipoCuenta': res.nIdTipoCuenta
        }

        this.pDetalle.push(body)
        this.dataSource = new MatTableDataSource(this.pDetalle);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        Swal.fire({
          title: 'La cuenta se registró de manera exitosa',
          icon: 'success',
          timer: 1500
        })
      })

    })
    digalogReg.afterClosed().subscribe(result => {
    });
  }
  edit(Termino) {

    this.eliminarPorName(Termino.nId)
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      "data": Termino,
      "IdProveedor": this.idParametro
    }

    //Se pone null para que el backend no mapee erroneamente el detalle
    const digalogReg = this.dialog.open(ProveedorBancoComponent, dialogConfig);
    digalogReg.componentInstance.oDatos.pipe(take(1)).subscribe(res => {
      this.pDetalle.push(res)
      this.dataSource = new MatTableDataSource(this.pDetalle);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.pParametro = [];
      this.pParametro.push(this.idParametro);
      this.pParametro.push(res.nId); // Id nIdClienteBanco
      this.pParametro.push(res.nBanco);
      this.pParametro.push(res.sCuenta);
      this.pParametro.push(res.sCuentaInter);
      this.pParametro.push(res.nMoneda);
      this.pParametro.push(res.nIdTipoCuenta);
      this.rutas.fnDatoBasico(3, 1, this.pParametro, 1, this.url, null).subscribe((resp) => {
        Swal.fire({
          title: 'Se actualizó de manera exitosa',
          icon: 'success',
          timer: 1500
        })
      });

    })
    digalogReg.afterClosed().subscribe(result => {
      if (result == null) {
        this.pDetalle.push(Termino)
        this.dataSource = new MatTableDataSource(this.pDetalle);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

      }
    });

  }
  BuscarDetalleEnTabla(nId) {
    var bFound = false;
    this.pDetalle.forEach((index, item) => {
      if (index["nId"] == nId) {
        bFound = true;
        return false;
      }
    });
    return bFound;
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

    //cuando el registro esta en bd
    if (Termino != 0) {
      Swal.fire({
        title: '¿Estas seguro de eliminar al cuenta bancaria?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
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
                showConfirmButton: false,
                timer: 1500
              });
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
    } else {

      this.pDetalle = this.pDetalle.filter(function (rest) {
        return rest.nId !== Termino;
      })

      this.dataSource = new MatTableDataSource(this.pDetalle);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

    }


  }
  consultar(event) {


    this.spinner.show()

    // consulta la pagina de publicada en Api para datos del proveedor
    this.rutas.fnconsultarSunat(event.target.value, this.url).subscribe(rest => {
      if (rest.Tipo == undefined) //siempre debe botar string, si sale indefinido es por que ya existe en BD y muestro los datos, anuncio que ya estan registrados
      {
        // this.validar = true
        Swal.fire({ icon: 'warning', title: '¡Atención!', text: 'Proveedor/Cliente ya esta registrado, no puede registrarlo nuevamente' })

        this.forma.controls['razonsocial'].setValue(rest['razonSocial'])
        this.forma.controls['cliente'].setValue(rest['tipoentidad'])
        this.forma.controls['nombreComercial'].setValue(rest['nombreComercial'])
      } else { //en caso que si tenga un string, muestro los datos traidos del api
        this.validar = false
        this.forma.controls['razonsocial'].setValue(rest['RazonSocial'])
        this.forma.controls['nombreComercial'].setValue(rest['NombreComercial'])
        this.forma.controls['direccion'].setValue(rest['Direccion'])
      }

    }, err => {
      this.spinner.hide();
      console.log(err);
    },
      () => {
        this.spinner.hide();
      })

  }

  async validarRUC() {
    let ruc: string = this.forma.get("ruc").value;
    if (ruc == null) {
      return;
    }

    // if (ruc.length != this.nLongitud) {
    //   return;
    // }

    if (ruc.length < this.nLongitud || ruc.length > this.nLongitudMax) {
      return;
    }

    if (this.idParametro != 0 && ruc == this.sRucActual) {
      return;
    }

    try {
      var pEntidad = 1;
      var pOpcion = 2;  //CRUD -> Actualizar
      var pParametro = []; //Parametros de campos vacios
      var pTipo = 10;

      pParametro.push(this.pPais)
      pParametro.push(ruc);
      const nIdCliente = await this.rutas.fnDatoBasico(pEntidad, pOpcion, pParametro, pTipo, this.url, null).toPromise();
      if (nIdCliente == 0) {//Si el nId es 0 no existe el RUC
        return;
      } else if (nIdCliente > 0) {
        const resp = await Swal.fire({
          title: '¿Desea Continuar?',
          text: "Ya existe un proveedor con el RUC indicado ¿Desea traer sus datos?",
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Si',
          cancelButtonText: 'No',
          allowOutsideClick: true
        })

        if (!resp.isConfirmed) {
          this.forma.controls.ruc.setValue('');
          return;
        }

        this.routeNavegate.navigate(['/controlcostos/compra/proveedor/', nIdCliente])

      }
    } catch (err) {
      console.log(err);
    }

  }

  async traerLongitudRuc() {
    try {
      var pEntidad = 1;
      var pOpcion = 2;  //CRUD -> Actualizar
      var pParametro = []; //Parametros de campos vacios
      var pTipo = 11;

      pParametro.push(this.pPais)
      const nLongitud = await this.rutas.fnDatoBasico(pEntidad, pOpcion, pParametro, pTipo, this.url, null).toPromise();
      if (nLongitud <= 0) {
        this.routeNavegate.navigate(['/controlcostos/compra/proveedor'])
        return;
      }
      this.nLongitud = Number(nLongitud);

    } catch (err) {
      console.log(err);
      this.routeNavegate.navigate(['/controlcostos/compra/proveedor'])
      return;
    }

  }
  //para activar o inactivar

  activar() {
    Swal.fire({
      title: '¿Desea Continuar?',
      text: "Se activará el proveeedor ¿Desea continuar?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        var pEntidad = 1;
        var pOpcion = 5;  //CRUD -> Actualizar
        var pParametro = []; //Parametros de campos vacios
        var pTipo = 0;

        let vValidacionDatos = this.forma.value;

        pParametro.push(vValidacionDatos.id)
        pParametro.push(1)
        pParametro.push(this.idUser)
        pParametro.push(this.pPais)
        this.spinner.show();

        this.rutas.fnDatoBasico(pEntidad, pOpcion, pParametro, pTipo, this.url, this.pDetalle).subscribe((data: any) => {
          if (Number(data) > 0) {

            Swal.fire({
              icon: 'success',
              title: 'Exito',
              text: 'Se realizo exitosamente',
              showConfirmButton: false,
              timer: 1500
            }).then(r => {
              if (this.idParametro != 0) {
                this.routeNavegate.navigate(['/controlcostos/compra/proveedor/', this.idParametro])
              }
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
    })

  }

  inactivar() {
    Swal.fire({
      title: '¿Desea Continuar?',
      text: "Se inactivará el proveeedor ¿Desea continuar?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        var pEntidad = 1;
        var pOpcion = 5;  //CRUD -> Actualizar
        var pParametro = []; //Parametros de campos vacios
        var pTipo = 0;

        let vValidacionDatos = this.forma.value;

        pParametro.push(vValidacionDatos.id)
        pParametro.push(0)
        pParametro.push(this.idUser)
        pParametro.push(this.pPais)
        this.spinner.show();

        this.rutas.fnDatoBasico(pEntidad, pOpcion, pParametro, pTipo, this.url, this.pDetalle).subscribe((data: any) => {
          if (Number(data) > 0) {
            Swal.fire({
              icon: 'success',
              title: 'Exito',
              text: 'Se realizo exitosamente',
              showConfirmButton: false,
              timer: 1500
            }).then(r => {
              if (this.idParametro != 0) {
                this.routeNavegate.navigate(['/controlcostos/compra/proveedor/', this.idParametro])
              }
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
    })

  }


  //Subir Documento Pdf
  fnSeleccionarArchivo = function (event, lbl: any) {

    this.vArchivoSeleccionado = event.target.files;
    this.progreso = 0;

    var reader = new FileReader();
    reader.onload = this._handleReaderLoaded.bind(this);

    if (this.vArchivoSeleccionado.length != 0) {
      document.getElementById(lbl).innerHTML = this.vArchivoSeleccionado[0].name;
      let nombre: string = this.vArchivoSeleccionado[0].name.split('.');
      this.nombreArchivo = nombre[0]
      this.formDatosPdf.controls['nombre'].setValue(nombre[0]);
      this.extencion = nombre[1].toLowerCase();

      if (this.extencion != "pdf") {
        this.vArchivoSeleccionado = '';
        this.progreso = 0;
        this.nombreArchivo = '';
        this.formDatosPdf.controls['nombre'].setValue('');
        this.archivoFile.nativeElement.value = '';
        this.extencion = '';
        Swal.fire('Atencion', 'Solo es permitido archivos de formato pdf', 'warning');
        return;
      }
      reader.readAsBinaryString(this.vArchivoSeleccionado[0]);

    }
  }

  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.fileString = btoa(binaryString);
  }

  fnUploadFile(lbl) {
    if (this.formDatosPdf.invalid) {
      Swal.fire('Atencion', 'Debe completar la información obligatoria!', 'warning');
    }
    if (!this.fileString) {
      Swal.fire('Atención', 'Debe seleccionar un archivo', 'warning');
    }
    else {
      if (this.vArchivoSeleccionado.length != 0) {
        if (this.formDatosPdf.invalid) {
          return Object.values(this.formDatosPdf.controls).forEach(control => {
            if (control instanceof FormGroup) {
              Object.values(control.controls).forEach(control => control.markAsTouched());
            } else {
              control.markAsTouched();
            }
          });
        }
        this.spinner.show();
        this.vFilecontrolService.fnUploadFile(this.fileString, this.vArchivoSeleccionado[0].type, 9, this.url).subscribe(
          event => {
            if (event.type === HttpEventType.UploadProgress) {
              this.progreso = Math.round((event.loaded / event.total) * 100);
            }
            else if (event.type === HttpEventType.Response) {
              let res: any = event.body;
              if (res.filename) {
                this.vNameRutaFile = res.filename;

                let pEntidad = 4
                let pOpcion = 1
                let pTipo = 2
                this.pParametro = [];
                let vValidacionDatos = this.formDatosPdf.value;
                let fechaDoc = this.datePipe.transform(vValidacionDatos.fechaDoc, 'yyyy-MM-dd');

                this.pParametro.push(this.idParametro)
                this.pParametro.push(vValidacionDatos.lstTipoDoc)
                this.pParametro.push(vValidacionDatos.nombre)
                this.pParametro.push(fechaDoc)
                this.pParametro.push(this.vNameRutaFile)
                this.pParametro.push(this.extencion)
                this.pParametro.push(this.idUser)
                this.pParametro.push(this.pPais)

                this.rutas.fnDatoBasico(pEntidad, pOpcion, this.pParametro, pTipo, this.url, null).subscribe((data: any) => {
                  if (Number(data) > 0) {

                    Swal.fire({
                      icon: 'success',
                      title: 'Exito',
                      text: 'Se subio el archivo correctamentee',
                      showConfirmButton: false,
                      timer: 1500
                    });


                    this.fnListarArchivo()
                    this.archivoFile.nativeElement.value = "";
                    this.formDatosPdf.reset();
                    this.formArchivo.reset();
                    document.getElementById(lbl).innerHTML = '';
                  }
                })
                this.spinner.hide()
              }
            }
          },
          err => { console.log(err); },
          () => { this.spinner.hide(); }
        )
      }

    }
  }

  fnListarArchivo() {

    let pParametro = []
    let pEntidad = 4
    let pOpcion = 1
    let pTipo = 3
    pParametro.push(this.idParametro)

    this.rutas.fnDatoBasico(pEntidad, pOpcion, pParametro, pTipo, this.url, null).subscribe((data: any) => {

      let array = data.map(item => {
        return {
          nIdClienteFile: item['nIdClienteFile'],
          sRutaArchivo: item['sRutaArchivo'],
          cEleNam: item['cEleNam'],
          sNombreArchivo: item['sNombreArchivo'],
          dFechaFile: item['dFechaFile'],
          nameUser: item['nameUser'],
          dFechaCarga: item['dFechaCarga'],
        }

      })

      this.dataSourceProveedor = new MatTableDataSource(array);
      this.dataSourceProveedor.paginator = this.paginatorDocumentos;
      this.dataSourceProveedor.sort = this.sortDocumentos;
    })


  }

  fnVerFile(a) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = a.sRutaArchivo
    dialogConfig.width = '900px'

    this.dialog.open(ProveedorDocumentoPdfComponent, dialogConfig);
  }

  fnDescargar(a): void {
    this.spinner.show();
    let file = a.sRutaArchivo.split('/')[4];
    let type = file.split('.')[1];
    let area = 9

    this.vFilecontrolService.fnDownload(file, type, area, this.url).subscribe(
      (res: any) => {

        let file = `reporte_${Math.random()}.pdf`;
        saveAs(res, file);
      },
      err => {
        console.log(err);
        this.spinner.hide();
      },
      () => {
        this.spinner.hide();
      }
    )
  }

  // Cada vez que cambia el tipo de documento moveremos la longitud
  cambioTipoDocumento(event) {
    const longitud = this.listaTipoDoc.filter(item => item.nIdTipEle === event)[0];
    this.nLongitud = longitud.nLongitudMin;
    this.nLongitudMax = longitud.nLongitudMax;
    this.forma.controls.ruc.setValidators([Validators.minLength(this.nLongitud), Validators.maxLength(this.nLongitudMax), Validators.required, Validators.pattern(/^[0-9]\d*$/)])
  }

  cambioTipoPersona(idTipoPersona) {
    this.personaJuridica = (idTipoPersona === 2029) ? true : false;
    if (this.personaJuridica) {
      this.listaTipoDoc = this.listaTipoDoc.filter(item => item.nPerJuridica === 1);
    } else {
      this.listaTipoDoc = this.listaTipoDocStatica;
    }
    this.forma.controls.tipDoc.setValue(null);
  }



}

