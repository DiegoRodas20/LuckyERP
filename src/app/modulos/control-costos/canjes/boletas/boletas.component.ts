import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { BoletaService } from "../boletas.service";
import Swal from "sweetalert2";
import { Sucursal } from "../Models/sucursal.model";
import { CabeceraBoletaModel } from "../Models/boleta_cabecera.model";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { BoletaDetalle } from "../Models/boleta_detalle.model";
import { DateAdapter, MAT_DATE_FORMATS } from "@angular/material/core";
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/shared/services/AppDateAdapter';
import { ProductoRequest } from "../Models/productos_request.model";
import { ListaProducto } from "../Models/listaproducto.model";

import { saveAs } from 'file-saver';
import { MatDialog } from "@angular/material/dialog";
import { BoletaDetalleDialogComponent } from "../boletaDetalle-dialog/boletaDetalle-dialog.component";
import { PresupuestoModel } from "../Models/presupuesto.model";
import { BoletaListaValidacionDialogComponent } from "../boletas-listavalidacion-dialog/boletas-listavalidacion-dialog.component";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";

declare var $: any;//JQuery

@Component({
  selector: "app-boletas",
  templateUrl: "./boletas.component.html",
  styleUrls: ["./boletas.component.css"],
  providers: [
    {
      provide: DateAdapter, useClass: AppDateAdapter
    },
    {
      provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
  ],
  animations: [asistenciapAnimations]
})
export class BoletasComponent implements OnInit {

  tsLista = 'active';  // Inicia la lista abierta
  abLista = 0;

  tsListaExcel = 'active';  // Inicia la lista abierta
  abListaExcel = 2;

  @ViewChild("modalBoleta") modalTS: ElementRef;

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string; //Nombre Usr
  idEmp: string; //id de la empresa del grupo Actual
  pPais: string; //Codigo del Pais de la empresa Actual
  nEmpresa: string; // Nombre de la Empresa Actual
  formArhivo: FormGroup;
  vArchivoSeleccioado: File;
  filestring: string = '';
  hide: boolean = false;
  hidetable: boolean = false;
  archivoexcel: string;
  cboSucursalValue: number;
  ListaPresupuesto: PresupuestoModel[];

  sucursal: Sucursal[]; // Lista de sucursales por empresa
  boleta_cabecera: CabeceraBoletaModel[] // Lista de todas las cabeceras de boleta
  boleta_detalle: BoletaDetalle[] // Lista de todos los detalle de boleta
  productoRequest: ProductoRequest[];
  ListaProducto: ListaProducto[];
  fechaInicio = new FormControl(new Date());
  fechaFin = new FormControl(new Date());
  nIdPresupuesto = new FormControl('Presupuesto', Validators.required);
  //Tabla material Cabecera Boleta
  dsBoleta: MatTableDataSource<CabeceraBoletaModel>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  txtFiltro = new FormControl();
  txtCliente = new FormControl();
  // Tabla material Lista Producto
  dsProducto: MatTableDataSource<ProductoRequest>

  displayedColumns: string[] = ['dFecha', 'sBoleta_Electronica', 'sDNI', 'sNombreCompleto', 'sCorreo', 'sCodCC', 'nTotalBoleta'];

  productoColumns: string[] = ['Codigo', 'imagen', 'Producto'];
  excelbutton: boolean = false;
  listaFilas: number;

  constructor(
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    @Inject("BASE_URL") baseUrl: string,
    private vBoletaService: BoletaService,
    private fb: FormBuilder
  ) {
    this.url = baseUrl;
  }

  ngOnInit(): void {
    let user = localStorage.getItem("currentUser"); //encriptacion del usuario
    this.idUser = JSON.parse(window.atob(user.split(".")[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split(".")[1])).uno;
    this.idEmp = localStorage.getItem("Empresa");
    this.pPais = localStorage.getItem("Pais");
    this.nEmpresa = "Lucky S.A.C.";
    this.fnListarboleta();
    this.fnListarSucursal();
    this.formArhivo = this.fb.group({
      fileUpload: ["", Validators.required],
      cboSucursal: ["", Validators.required],
    });

    this.onToggleFab(1, -1)

  }

  applyFilter(): void {
    var filtro = "";

    if (this.txtFiltro.value == null) {
      return;
    }
    filtro = this.txtFiltro.value.trim(); // Remove whitespace
    filtro = filtro.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dsBoleta.filter = filtro;
  }

  fnListarSucursal(): void {
    var pEntidad = 1; //Cabecera del tarfario
    var pOpcion = 2; //CRUD -> Listar
    var pTipo = 3; //Listar todos los registros de la tabla Sucursal
    let pParametroPush = []; //Parametros de campos vacios

    pParametroPush.push(this.idUser);
    pParametroPush.push(this.idEmp);

    this.vBoletaService
      .CrudBoleta(
        pEntidad,
        pOpcion,
        pParametroPush,
        pTipo,
        this.url,
        this.nEmpresa
      ).subscribe((resp) => {
        this.sucursal = resp;
      });
  }

  fnListarProducto(): void {
    var pEntidad = 1; //Cabecera del tarfario
    var pOpcion = 2; //CRUD -> Listar
    var pTipo = 4; //Listar todos los registros de la tabla Sucursal
    let pParametroPush = []; //Parametros de campos vacios

    pParametroPush.push(this.idUser);
    pParametroPush.push(this.idEmp);
    pParametroPush.push('');
    pParametroPush.push('');
    pParametroPush.push(this.pPais);

    this.vBoletaService
      .CrudBoleta(
        pEntidad,
        pOpcion,
        pParametroPush,
        pTipo,
        this.url,
        this.nEmpresa
      ).subscribe((resp) => {

        this.ListaProducto = resp;
      });
  }

  fnListarPresupuesto(): void {
    var pEntidad = 1; //Cabecera del tarfario
    var pOpcion = 2; //CRUD -> Listar
    var pTipo = 7; //Listar todos los registros para obttner presupuesto
    let pParametroPush = []; //Parametros de campos vacios

    pParametroPush.push(this.idUser);
    pParametroPush.push(this.idEmp);

    this.vBoletaService
      .CrudBoleta(
        pEntidad,
        pOpcion,
        pParametroPush,
        pTipo,
        this.url,
        this.nEmpresa
      ).subscribe((resp) => {

        this.ListaPresupuesto = resp;
      });
  }

  fnListarboleta(): void {

    this.spinner.show();

    var pEntidad = 1; //Cabecera del tarfario
    var pOpcion = 2; //CRUD -> Listar
    var pTipo = 1; //Listar todos los registros de la tabla Boleta Cabecera
    let pParametroPush = []; //Parametros de campos vacios
    let nIdDocumEle = 0;

    let fechaInicio = this.fechaInicio.value.getDate() + "/" + (("0" + (this.fechaInicio.value.getMonth() + 1)).slice(-2)) + "/" + this.fechaInicio.value.getFullYear();
    let fechaFin = this.fechaFin.value.getDate() + "/" + (("0" + (this.fechaFin.value.getMonth() + 1)).slice(-2)) + "/" + this.fechaFin.value.getFullYear();

    pParametroPush.push(this.idUser);
    pParametroPush.push(this.idEmp);
    pParametroPush.push(nIdDocumEle);
    pParametroPush.push(fechaInicio);
    pParametroPush.push(fechaFin);
    pParametroPush.push(this.pPais);


    this.vBoletaService
      .CrudBoleta(
        pEntidad,
        pOpcion,
        pParametroPush,
        pTipo,
        this.url,
        this.nEmpresa
      ).subscribe((resp) => {
        this.boleta_cabecera = resp;
        this.dsBoleta = new MatTableDataSource(this.boleta_cabecera);
        this.dsBoleta.paginator = this.paginator;
        this.dsBoleta.sort = this.sort;

        if (this.dsBoleta.data.length > 0) {
          this.excelbutton = true;
        } else {
          this.excelbutton = false;
        }

        this.spinner.hide();
      }, (err) => this.spinner.hide());

  }

  fnAbrirModal(lbl: any): void {

    document.getElementById(lbl).innerHTML = "Seleccione Archivo:";
    this.modalTS.nativeElement.click();
    this.fnLimpiarModal();
  }

  fnSeleccionarArchivo(file: File, lbl: any): void {


    if (file != null) {
      let ext = file.name.split(".").pop();

      if (ext === "xlsx") {
        this.vArchivoSeleccioado = file;
        var reader = new FileReader();
        reader.onload = this._handleReaderLoaded.bind(this);
        document.getElementById(lbl).innerHTML = this.vArchivoSeleccioado.name;
        reader.readAsBinaryString(this.vArchivoSeleccioado);

      } else {
        Swal.fire(
          "Error:",
          "Solo son permitidos archivos con la extension xlsx",
          "error"
        );
      }
    } else {
      document.getElementById(lbl).innerHTML = "";
    }

  }

  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.filestring = btoa(binaryString);
  }

  fnLimpiarModal(): void {
    this.formArhivo.reset();
    this.vArchivoSeleccioado = null;
    $('#modalBoleta').modal('hide');
  }

  fnUploadFile(): void {

    if (this.formArhivo.invalid) {
      return Object.values(this.formArhivo.controls).forEach((controls) => {
        controls.markAllAsTouched();
      });
    }

    if (!this.vArchivoSeleccioado) {
      Swal.fire("Error:", "No selecciono ningun archivo excel", "error");
    } else {

      this.hide = false;
      this.hidetable = false;
      this.spinner.show();
      this.productoRequest = null;
      this.vBoletaService
        .fnBoleta(
          this.vArchivoSeleccioado,
          this.url
        )
        .then((resp) => {

          this.cboSucursalValue = this.formArhivo.get('cboSucursal').value;
          $('#modalBoleta').modal('hide');
          this.spinner.hide();
          this.listaFilas = 0;

          if (resp.codigo == 0) {

            if (resp.productos.codigo == 1) {

              this.vBoletaService.ArchivoValidacionProducto(this.url, 'archivoTemp', resp.productos.productosError).subscribe(data => {

                saveAs(data, 'Validaciones Productos.txt');
              });

              Swal.fire("!Alerta!", "El archivo se encuentra con algunas observaciones, Porfavor revisar el txt para tener mayor informacion.", "warning");
            } else {

              this.listaFilas = resp.productos.totalFilas;

              let productoRequest: ProductoRequest[] = resp.productos.productos;
              this.productoRequest = productoRequest.map(item => {
                return {
                  nCode: null,
                  sNombreProducto: item.sNombreProducto,
                  sRutaArchivo: ''
                }
              })
              this.archivoexcel = resp.fileName;
              this.fnListarPresupuesto();
              this.fnListarProducto();
              this.dsProducto = new MatTableDataSource(this.productoRequest);

              this.hide = true;
              this.nIdPresupuesto.setValue(null);
              this.txtCliente.setValue('');
            }

          } if (resp.codigo == 2) {

            if (resp.productos.codigo == 1) {

              this.vBoletaService.ArchivoValidacionProducto(this.url, 'archivoTemp', resp.productos.productosError).subscribe(data => {

                saveAs(data, 'Validaciones Productos.txt');
              });

              Swal.fire("!Alerta!", "El archivo se encuentra con algunas observaciones, Porfavor revisar el txt para tener mayor informacion.", "warning");
            } else {

              this.listaFilas = resp.productos.totalFilas;

              let productoRequest: ProductoRequest[] = resp.productos.productos;
              this.productoRequest = productoRequest.map(item => {
                return {
                  nCode: null,
                  sNombreProducto: item.sNombreProducto,
                  sRutaArchivo: ''
                }
              })

              //this.productoRequest = resp.productos.productos;
              this.archivoexcel = resp.fileName;
              this.fnListarPresupuesto();
              this.fnListarProducto();
              this.dsProducto = new MatTableDataSource(this.productoRequest);
              this.hide = true;
              this.nIdPresupuesto.setValue(null);
              this.txtCliente.setValue('');
              this.vBoletaService.ArchivoValidacionProducto(this.url, 'archivoTemp', resp.listaObservacion).subscribe(data => {

                saveAs(data, 'Observacion excel.txt');
              });

              Swal.fire({
                title: '!Atención!',
                text: 'Se encontraron algunos números de documentos que sus digitos son mayores a 8 y serán pasados como carnet de extranjería',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                cancelButtonText: 'Cancelar'
              }).then((result) => {
                if (result.isConfirmed) {
                  this.nIdPresupuesto.setValue(null);
                  this.txtCliente.setValue('');

                  this.hide = true;
                } else {
                  this.hide = false;
                  this.hidetable = false;
                  this.productoRequest = null;
                }
              });

            }

          } else {

            this.dialog.open(BoletaListaValidacionDialogComponent, {
              data: resp.listaErrores
            });

          }


        });
    }
  }


  guardarExcel() {

    let validado: boolean;

    if (this.nIdPresupuesto.value == null || this.nIdPresupuesto.value == null) {
      Swal.fire("!Alerta!", "El presupuesto es necesario para poder guardar.", "warning");
      return;
    }

    this.dsProducto.data.forEach((resp) => {
      if (resp.nCode == 0 || resp.nCode == null) {
        Swal.fire("!Alerta!", "Es necesario que seleccione todos los codigo de productos", "warning");
        validado = false;
      } else {

        if (this.nIdPresupuesto.value == "Presupuesto") {
          Swal.fire("!Alerta!", "Es necesario que seleccione un Presupuesto", "warning");
          validado = false;
        } else {
          validado = true;
        }

      }
    });

    if (validado) {

      let ruta = this.archivoexcel;
      let listaproducto = this.dsProducto.data;
      var pEntidad = 1; //Cabecera del tarfario
      var pOpcion = 1; //CRUD -> Listar
      var pTipo = 1; //Listar todos los registros de la tabla Boleta Cabecera
      let pParametroPush = []; //Parametros de campos vacios
      let nIdDocumEle = this.cboSucursalValue;
      let nIdPresupuesto = this.nIdPresupuesto.value;

      pParametroPush.push(this.idUser);
      pParametroPush.push(this.idEmp);
      pParametroPush.push(nIdDocumEle);
      pParametroPush.push(nIdPresupuesto);
      pParametroPush.push(this.pPais);

      if (this.listaFilas > 99) {

        Swal.fire({
          title: 'Atención',
          text: 'Estas apunto de registrar ' + this.listaFilas + ' datos en una carga masiva de boletas. Este proceso puede demorar unos minutos.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Si, !Registrar!'
        }).then((result) => {
          if (result.isConfirmed) {

            this.spinner.show();
            this.vBoletaService
              .fnDescargarZip(
                pEntidad,
                pOpcion,
                pParametroPush,
                pTipo,
                this.url,
                this.nEmpresa,
                ruta,
                listaproducto,
                this.filestring
              ).subscribe((resp) => {
                this.hide = false;
                this.hidetable = false;
                this.productoRequest = null;
                this.fnListarboleta();
                this.spinner.hide();
                const fileName = `Exportacion Boleta.zip`;

                const objectUrl = window.URL.createObjectURL(resp);
                var link = document.createElement('a');
                link.href = objectUrl;
                link.download = fileName;
                // Trigger de descarga
                link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

                Swal.fire({
                  title: 'El Zip ha sido generado',
                  html: `Si su descarga no ha comenzado, puede descargarlo <a href='${objectUrl}' download="${fileName}">aquí</a>`,
                  icon: 'success',
                  showCloseButton: true
                })

              }, (err) => {
                this.hide = false;
                this.productoRequest = null;
                this.spinner.hide();

              });
          } else {
            this.hide = false;
            this.productoRequest = null;
            this.fnListarboleta();
            this.spinner.hide();
          }
        });

      } else {
        this.spinner.show();
        this.vBoletaService
          .fnDescargarZip(
            pEntidad,
            pOpcion,
            pParametroPush,
            pTipo,
            this.url,
            this.nEmpresa,
            ruta,
            listaproducto,
            this.filestring
          ).subscribe((resp) => {
            this.hide = false;
            this.hidetable = false;
            this.productoRequest = null;
            this.fnListarboleta();
            const fileName = `Exportacion Boleta.zip`;
            const objectUrl = window.URL.createObjectURL(resp);
            var link = document.createElement('a');
            link.href = objectUrl;
            link.download = fileName;
            // Trigger de descarga
            link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

            Swal.fire({
              title: 'El Zip ha sido generado',
              html: `Si su descarga no ha comenzado, puede descargarlo <a href='${objectUrl}' download="${fileName}">aquí</a>`,
              icon: 'success',
              showCloseButton: true
            })

            this.spinner.hide();
          }, (err) => {
            this.hide = false;
            this.productoRequest = null;
            this.spinner.hide();

          });
      }

    }
  }

  obtenerDetalle(row) {

    this.hide = false;
    this.hidetable = true;
    this.productoRequest = null;
    this.spinner.show();

    var pEntidad = 1; //Cabecera del tarfario
    var pOpcion = 2; //CRUD -> Listar
    var pTipo = 2; //Listar todos los registros de la tabla Boleta Cabecera
    let pParametroPush = []; //Parametros de campos vacios
    let nIdDocumEle = 0;

    pParametroPush.push(this.idUser);
    pParametroPush.push(this.idEmp);
    pParametroPush.push(nIdDocumEle);
    pParametroPush.push(row.nIdBoleta);

    this.vBoletaService
      .CrudBoleta(
        pEntidad,
        pOpcion,
        pParametroPush,
        pTipo,
        this.url,
        this.nEmpresa
      ).subscribe((resp) => {
        this.boleta_detalle = resp;
        this.boleta_detalle.forEach(item => {
          item.nIdBoleta = row.sBoleta_Electronica
        })
        const dialogRef = this.dialog.open(BoletaDetalleDialogComponent, {
          width: '850px',
          maxWidth: '90vw',
          data: this.boleta_detalle
        });

        window.scrollBy(0, document.body.scrollHeight);
        this.spinner.hide();
      }, (err) => this.spinner.hide());


  }

  cancelarExcel(): void {
    this.hide = false;
    this.productoRequest = null;
  }

  fnDescargarExcel(): void {

    this.spinner.show();

    var pEntidad = 1; //Cabecera del tarfario
    var pOpcion = 2; //CRUD -> Listar
    var pTipo = 8; //Listar todos los registros de la tabla Boleta Cabecera
    let pParametroPush = []; //Parametros de campos vacios
    let nIdDocumEle = 0;

    let fechaInicio = this.fechaInicio.value.getDate() + "/" + (("0" + (this.fechaInicio.value.getMonth() + 1)).slice(-2)) + "/" + this.fechaInicio.value.getFullYear();
    let fechaFin = this.fechaFin.value.getDate() + "/" + (("0" + (this.fechaFin.value.getMonth() + 1)).slice(-2)) + "/" + this.fechaFin.value.getFullYear();

    pParametroPush.push(this.idUser);
    pParametroPush.push(this.idEmp);
    pParametroPush.push(nIdDocumEle);
    pParametroPush.push(fechaInicio);
    pParametroPush.push(fechaFin);
    pParametroPush.push(this.pPais);

    this.vBoletaService
      .DescargarExcel(
        pEntidad,
        pOpcion,
        pParametroPush,
        pTipo,
        this.url,
        this.nEmpresa
      ).subscribe((resp) => {
        this.spinner.hide();

        const fileName = `Exportacion boleta.xlsx`;
        const objectUrl = window.URL.createObjectURL(resp);
        var link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName;
        // Trigger de descarga
        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

        Swal.fire({
          title: 'El Excel ha sido generado',
          html: `Si su descarga no ha comenzado, puede descargarlo <a href='${objectUrl}' download="${fileName}">aquí</a>`,
          icon: 'success',
          showCloseButton: true
        })

      }, (err) => this.spinner.hide());


  }

  fnDarValorRowImagen(row: ProductoRequest, nIdArticulo: number) {
    let articulo = this.ListaProducto.find(item => item.nIdArticulo == nIdArticulo)
    if (articulo) {
      row.sRutaArchivo = articulo.sRutaArchivo;
    }
  }

  fnDarValorCliente(nIdPres: number) {
    let pres = this.ListaPresupuesto.find(item => item.nIdCentroCosto == nIdPres)
    if (pres) {
      this.txtCliente.setValue(pres.sCliente);
    }
  }

  verImagen(imagenArticulo) {
    if (imagenArticulo) {
      Swal.fire({
        imageUrl: imagenArticulo,
        imageWidth: 250,
        imageHeight: 250,
      })
    } else {
      Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'Este artículo no contiene una imagen',
      });
    }

  }

  // Funcionalidad de los botones laterales
  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? 0 : 3;

  }

  onToggleFabExcel(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abListaExcel > 0) ? 0 : 1 : stat;
    this.tsListaExcel = (stat === 0) ? 'inactive' : 'active';
    this.abListaExcel = (stat === 0) ? 0 : 3;

  }

}
