import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { DateAdapter, MAT_DATE_FORMATS } from "@angular/material/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import {
  AppDateAdapter,
  APP_DATE_FORMATS,
} from "src/app/shared/services/AppDateAdapter";
import Swal from "sweetalert2";
import { E_Armado_Rutas } from "../../models/rutaModal.model";
import { E_Sucursales } from "../../models/surcursales.model";
import { TransporteService } from "../../transporte.service";

@Component({
  selector: "app-dialog-armado-rutas",
  templateUrl: "./dialog-armado-rutas.component.html",
  styleUrls: ["./dialog-armado-rutas.component.css"],
  providers: [
    {
      provide: DateAdapter,
      useClass: AppDateAdapter,
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: APP_DATE_FORMATS,
    },
  ],
})
export class DialogArmadoRutasComponent implements OnInit {
  searchKey = new FormControl();
  listaPrincipal: E_Armado_Rutas[];
  dFechaField = new FormControl(new Date());
  hide: boolean = false;
  sPais: string;
  nIdUser: number;
  listaSucursales: E_Sucursales[];
  nIdSucursalField = new FormControl();
  dsRuta: MatTableDataSource<E_Armado_Rutas>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = [
    "opcion",
    "sNombreEmpresa",
    "sNota",
    "sCodPresupuesto",
    "sGuia",
    "sCodAlmacen",
    "nCantidad",
    "nPeso",
    "nVolumen",
    "sPuntoLLegada",
    "sDistrito",
    "sFechaEntrega",
    "sHora",
  ];

  constructor(
    private _service: TransporteService,
    private spinner: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) private data: any,
    public dialogRef: MatDialogRef<DialogArmadoRutasComponent>
  ) {
    this.nIdSucursalField.setValue(this.data.idSucursal);
  }

  ngOnInit(): void {
    this.sPais = localStorage.getItem("Pais");
    let user = localStorage.getItem("currentUser");
    this.nIdUser = JSON.parse(window.atob(user.split(".")[1])).uid;
    this.ListarTabla();
    this.ListarSucursales();
  }

  //#region Funcion que filta en la tabla en memoria
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsRuta.filter = filterValue.trim().toLowerCase();
  }
  //#endregion

  //#region Lista la tabla Principal
  ListarTabla() {
    const fecha = moment(this.dFechaField.value).format("YYYY-MM-DD");
    const parameters = `${fecha}|${this.nIdSucursalField.value}`
    this._service.fnArmadoRuta(1, 2, 2, parameters).subscribe(res => {
      const lst = res ? res.lista as E_Armado_Rutas[] : [];
      if (lst.length == 0) {
        return Swal.fire({ title: 'No se encontraron notas para generar armado.', icon: 'info', timer: 2000 });
      }
      this.searchKey.setValue("");
      this.listaPrincipal = lst;
      this.listaPrincipal.length > 0 ? (this.hide = true) : (this.hide = false);
      this.dsRuta = new MatTableDataSource(this.listaPrincipal);
      this.dsRuta.paginator = this.paginator;
      this.dsRuta.sort = this.sort;
    });
  }
  //#endregion

  //#region Generar Agrupacion
  GenerarArmado() {
    const fecha = moment(this.dFechaField.value).format("YYYY-MM-DD");
    const parameters = `${fecha}|${this.nIdUser}|${this.sPais}|${this.nIdSucursalField.value}`;
    this.spinner.show();
    this._service.fnArmadoRuta(1, 1, 1, parameters).subscribe(res => {
      this.spinner.hide();
      this.dialogRef.close(res.result);
    });
  }
  //#endregion

  ListarSucursales(): void {
    let parameters = [];
    parameters.push(this.sPais);
    this._service.ArmadoRuta(1, 2, 9, parameters).subscribe((resp) => {
      this.listaSucursales = resp.lista;
    });
  }

  CambiarEstado(nIdOperMov: number, estado: number): void {
    let estadoString: string = '';
    estado === 2230 ? estadoString = 'Devolver' : estadoString = 'Rechazar'
    let mensaje: string = '';

    Swal.fire({
      title: `¿Desea ${estadoString} la Nota?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { value: observacion } = await Swal.fire({
          title: 'Ingrese el motivo',
          input: 'textarea',
          showCancelButton: true,
          inputValidator: (value) => {
            mensaje = value;
            if (!value) {
              return 'El motivo es obligatorio';

            }
          }
        })

        if (observacion) {
          let parameters = [];
          parameters.push(nIdOperMov);
          parameters.push(this.nIdUser);
          parameters.push(this.sPais);
          parameters.push(estado);
          parameters.push(mensaje);
          this._service.ArmadoRuta(1, 1, 8, parameters).subscribe((resp) => {
            this.ListarTabla();
          });
        }
      }
    });
  }
}
