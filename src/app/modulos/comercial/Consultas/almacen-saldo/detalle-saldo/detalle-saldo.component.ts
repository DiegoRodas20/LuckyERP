import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { asistenciapAnimations } from "../../../Asistencia/asistenciap/asistenciap.animations";
import { AlmacenSaldoService } from "../almacen-saldo.service";
import { MsgVisorAlmacenSaldoComponent } from "./msg-visor-almacen-saldo/msg-visor-almacen-saldo.component";

@Component({
  selector: "app-detalle-saldo",
  templateUrl: "./detalle-saldo.component.html",
  styleUrls: ["./detalle-saldo.component.css"],
  animations: [asistenciapAnimations],
})
export class DetalleSaldoComponent implements OnInit {
  // Tabla
  dataSource: MatTableDataSource<any>;
  listaKardex: [];
  displayedColumns: string[] = [
    "opciones",
    "almacen",
    "codAlmacen",
    "centroCosto",
    "codArticulo",
    "articuloDescripcion",
    "lote",
    "stockAnterior",
    "unidadMedida",
    "cantidadIngreso",
    "fechaIngreso",
    "cantidadSalida",
    "fechaSalida",
    "entidadDestino",
    "destino",
    "stockActual",
  ];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  txtFiltro = new FormControl();

  // Botones
  tsLista = "inactive";
  fbLista = [
    { icon: "text_snippet", tool: "Generar Excel", state: true },
    { icon: "exit_to_app", tool: "Salir", state: true },
  ];
  abLista = [];
  mostrarBotones = true;

  constructor(
    private almacenSaldoService: AlmacenSaldoService,
    @Inject("BASE_URL") private baseUrl: string,
    @Inject(MAT_DIALOG_DATA) public data,
    private dialog: MatDialog, // Declaracion del Dialog
    public dialogRef: MatDialogRef<DetalleSaldoComponent>,
    private spinner: NgxSpinnerService
  ) {
    if (data.modoCliente) {
      const index = this.displayedColumns.indexOf("opciones");
      if (index !== -1) {
        this.displayedColumns.splice(index, 1);
      }
    }
  }

  async ngOnInit(): Promise<void> {
    this.onToggleFab(1, -1);
    // Si el modo satelite esta activado
    if (this.data.modoSatelite) {
      await this.llenarTablaModoSatelite();
    } else if (this.data.modoCliente) {
      await this.llenarTablaModoCliente();
    } else {
      await this.llenarTabla();
    }

    this.spinner.hide();
  }

  //#region Botones
  onToggleFab(fab: number, stat: number) {
    stat = stat === -1 ? (this.abLista.length > 0 ? 0 : 1) : stat;
    this.tsLista = stat === 0 ? "inactive" : "active";
    this.abLista = stat === 0 ? [] : this.fbLista;
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.data.modoSatelite
          ? this.fnGenerarExcelModoSatelite()
          : this.data.modoCliente
          ? this.fnGenerarExcelModoCliente()
          : this.fnGenerarExcel();
        break;
      case 1:
        this.fnCerrarDialog();
        break;
      default:
        break;
    }
  }
  //#endregion

  //#region Tabla

  // Metodo para llenar la tabla con los articulos ingresados al dialog (this.data)
  async llenarTabla() {
    const pEntidad = 2; //Primera entidad
    const pOpcion = 2; //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 1;

    //Inicializar variables
    const empresa = localStorage.getItem("Empresa");
    const registros = this.data.registros;

    // Llenamos los parametros del procedure
    pParametro.push(empresa);

    // Llenamos los parametros para cada registro del kardex
    registros.map((registro) => {
      const { nIdCentroCosto, nIdAlmacen, nIdArticulo, sLote, dFechaVence } =
        registro;
      const pParametroKardex = [];
      pParametroKardex.push(nIdCentroCosto);
      pParametroKardex.push(nIdAlmacen);
      pParametroKardex.push(nIdArticulo);
      pParametroKardex.push(sLote);
      pParametroKardex.push(dFechaVence || "");
      pParametro.push(pParametroKardex.join(","));
    });

    console.log(pParametro.join("|"))

    this.listaKardex = await this.almacenSaldoService.fnAlmacenSaldo(
      pEntidad,
      pOpcion,
      pParametro,
      pTipo,
      this.baseUrl
    );

    // Crear nueva tabla
    this.dataSource = new MatTableDataSource(this.listaKardex);
    this.dataSource.paginator = this.paginator;
  }

  // Metodo para llenar la tabla con los articulos ingresados al dialog (this.data) para el modo satelite
  async llenarTablaModoSatelite() {
    const pEntidad = 4; //Primera entidad
    const pOpcion = 2; //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 1;

    //Inicializar variables
    const empresa = localStorage.getItem("Empresa");
    const registros = this.data.registros;

    // Llenamos los parametros del procedure
    pParametro.push(empresa);

    // Llenamos los parametros para cada registro del kardex
    registros.map((registro) => {
      const { sCentroCosto, sCodAlmacen, sCodArticulo, sLote, dFechaVence } =
        registro;
      const pParametroKardex = [];
      pParametroKardex.push(sCentroCosto);
      pParametroKardex.push(sCodAlmacen);
      pParametroKardex.push(sCodArticulo);
      pParametroKardex.push(sLote);
      pParametroKardex.push(dFechaVence || "");
      pParametro.push(pParametroKardex.join(","));
    });

    this.listaKardex = await this.almacenSaldoService.fnAlmacenSaldo(
      pEntidad,
      pOpcion,
      pParametro,
      pTipo,
      this.baseUrl
    );

    // Crear nueva tabla
    this.dataSource = new MatTableDataSource(this.listaKardex);
    this.dataSource.paginator = this.paginator;
  }

  // Metodo para llenar la tabla con los articulos ingresados al dialog (this.data) del modo cliente
  async llenarTablaModoCliente() {
    const pEntidad = 6; //Primera entidad
    const pOpcion = 2; //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 1;

    //Inicializar variables
    const empresa = localStorage.getItem("Empresa");
    const registros = this.data.registros;

    // Llenamos los parametros del procedure
    pParametro.push(empresa);

    // Llenamos los parametros para cada registro del kardex
    registros.map((registro) => {
      const { nIdCentroCosto, nIdAlmacen, nIdArticulo, sLote, dFechaVence } =
        registro;
      const pParametroKardex = [];
      pParametroKardex.push(nIdCentroCosto);
      pParametroKardex.push(nIdAlmacen);
      pParametroKardex.push(nIdArticulo);
      pParametroKardex.push(sLote);
      pParametroKardex.push(dFechaVence || "");
      pParametro.push(pParametroKardex.join(","));
    });

    this.listaKardex = await this.almacenSaldoService.fnAlmacenSaldo(
      pEntidad,
      pOpcion,
      pParametro,
      pTipo,
      this.baseUrl
    );

    // Crear nueva tabla
    this.dataSource = new MatTableDataSource(this.listaKardex);
    this.dataSource.paginator = this.paginator;
  }

  fnFiltrar(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Metodo para generar y descargar excel de la tabla de Kardex
  async fnGenerarExcel() {
    this.spinner.show();
    const pEntidad = 2; //Primera entidad
    const pOpcion = 2; //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 2;

    //Inicializar variables
    const empresa = localStorage.getItem("Empresa");
    const registros = this.data.registros;

    // Llenamos los parametros del procedure
    pParametro.push(empresa);

    // Llenamos los parametros para cada registro del kardex
    registros.map((registro) => {
      const { nIdCentroCosto, nIdAlmacen, nIdArticulo, sLote, dFechaVence } =
        registro;
      const pParametroKardex = [];
      pParametroKardex.push(nIdCentroCosto);
      pParametroKardex.push(nIdAlmacen);
      pParametroKardex.push(nIdArticulo);
      pParametroKardex.push(sLote);
      pParametroKardex.push(dFechaVence || "");
      pParametro.push(pParametroKardex.join(","));
    });

    const response = await this.almacenSaldoService.fnAlmacenSaldoExcel(
      pEntidad,
      pOpcion,
      pParametro,
      pTipo,
      this.baseUrl
    );

    if(response){
      // Descargar el Excel
      const data = response;
      const fileName = `Reporte Kardex.xlsx`;
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(data, fileName);
        return;
      }
      const objectUrl = window.URL.createObjectURL(data);
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
    }
    else{
      Swal.fire({
        title: 'No se encontró registros. Aplique otros filtros',
        icon: 'warning',
        showCloseButton: true
      })
    }
    this.spinner.hide();
  }

  // Metodo para generar y descargar excel de la tabla de Kardex
  async fnGenerarExcelModoCliente() {
    this.spinner.show();
    const pEntidad = 6; //Sexta entidad
    const pOpcion = 2; //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 2;

    //Inicializar variables
    const empresa = localStorage.getItem("Empresa");
    const registros = this.data.registros;

    // Llenamos los parametros del procedure
    pParametro.push(empresa);

    // Llenamos los parametros para cada registro del kardex
    registros.map((registro) => {
      const { nIdCentroCosto, nIdAlmacen, nIdArticulo, sLote, dFechaVence } =
        registro;
      const pParametroKardex = [];
      pParametroKardex.push(nIdCentroCosto);
      pParametroKardex.push(nIdAlmacen);
      pParametroKardex.push(nIdArticulo);
      pParametroKardex.push(sLote);
      pParametroKardex.push(dFechaVence || "");
      pParametro.push(pParametroKardex.join(","));
    });

    const response = await this.almacenSaldoService.fnAlmacenSaldoExcel(
      pEntidad,
      pOpcion,
      pParametro,
      pTipo,
      this.baseUrl
    );

    if(response){
      // Descargar el Excel
      const data = response;
      const fileName = `Reporte Kardex.xlsx`;
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(data, fileName);
        return;
      }
      const objectUrl = window.URL.createObjectURL(data);
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
    }
    else{
      Swal.fire({
        title: 'No se encontró registros. Aplique otros filtros',
        icon: 'warning',
        showCloseButton: true
      })
    }
    this.spinner.hide();
  }

  // Metodo para generar y descargar excel de la tabla de Kardex de los almacenes satelite
  async fnGenerarExcelModoSatelite() {
    this.spinner.show();
    const pEntidad = 4; //Primera entidad
    const pOpcion = 2; //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 2;

    //Inicializar variables
    const empresa = localStorage.getItem("Empresa");
    const registros = this.data.registros;

    // Llenamos los parametros del procedure
    pParametro.push(empresa);

    // Llenamos los parametros para cada registro del kardex
    registros.map((registro) => {
      const { sCentroCosto, sCodAlmacen, sCodArticulo, sLote, dFechaVence } =
        registro;
      const pParametroKardex = [];
      pParametroKardex.push(sCentroCosto);
      pParametroKardex.push(sCodAlmacen);
      pParametroKardex.push(sCodArticulo);
      pParametroKardex.push(sLote);
      pParametroKardex.push(dFechaVence || "");
      pParametro.push(pParametroKardex.join(","));
    });

    const response = await this.almacenSaldoService.fnAlmacenSaldoExcel(
      pEntidad,
      pOpcion,
      pParametro,
      pTipo,
      this.baseUrl
    );

    if(response){
      // Descargar el Excel
      const data = response;
      const fileName = `Reporte Kardex Satelite.xlsx`;
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(data, fileName);
        return;
      }
      const objectUrl = window.URL.createObjectURL(data);
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
    }
    else{
      Swal.fire({
        title: 'No se encontró registros. Aplique otros filtros',
        icon: 'warning',
        showCloseButton: true
      })
    }
    this.spinner.hide();
  }

  //#endregion

  //#region Registros de la tabla (Items Kardex)

  // Descargar el archivo .msg proveniente de cada item
  fnDescargar(row) {
    const url = row.sRutaCorreoSustento;

    // Verificamos si existe link de descarga
    if (url || url != "") {
      var link = document.createElement("a");
      link.href = url;
      // Trigger de descarga
      link.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );
    } else {
      Swal.fire({
        title: "No hay archivo adjunto",
        html: "Este elemento no cuenta con un archivo .msg",
        icon: "warning",
        showCloseButton: true,
      });
    }
  }

  fnVerMensaje(row) {
    const url = row.sRutaCorreoSustento;

    if (url || url != "") {
      this.spinner.show();

      // Ocultamos los botones del componente padre para que se muestren los botones del modal
      this.mostrarBotones = false;

      const dialogRef = this.dialog.open(MsgVisorAlmacenSaldoComponent, {
        width: "1600px",
        autoFocus: false,
        data: row.sRutaCorreoSustento,
      });

      dialogRef.beforeClosed().subscribe((result) => {
        this.mostrarBotones = true;
      });
    } else {
      Swal.fire({
        title: "No hay archivo adjunto",
        html: "Este elemento no cuenta con un archivo .msg",
        icon: "warning",
        showCloseButton: true,
      });
    }
  }

  // Metodo para ver la imagen
  verImagen(imagenArticulo) {
    // Si tiene imagen muestra la imagen en un SweetAlert
    if (imagenArticulo != "" && imagenArticulo != null) {
      Swal.fire({
        imageUrl: imagenArticulo,
        imageWidth: 250,
        imageHeight: 250,
      });
    }
    // Si no tiene imagen muestra la imagen por defecto en un SweetAlert
    else {
      Swal.fire({
        imageUrl: "/assets/img/SinImagen.jpg",
        imageWidth: 250,
        imageHeight: 250,
      });
    }
  }

  fnCerrarDialog() {
    this.dialogRef.close();
  }

  //#endregion
}
