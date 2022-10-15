import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import Swal from "sweetalert2";
import { ProveedorModel } from "../../models/proveedor.model";
import { VehiculoModel } from "../../models/vehiculo.model";
import { TransporteService } from "../../transporte.service";
import { NgxSpinnerService } from "ngx-spinner";
import { filter } from "rxjs/operators";
import { isNullOrUndefined } from "util";
import { Router } from "@angular/router";

@Component({
  selector: "app-dialog-gestion-vehiculo",
  templateUrl: "./dialog-gestion-vehiculo.component.html",
  styleUrls: ["./dialog-gestion-vehiculo.component.css"],
})
export class DialogGestionVehiculoComponent implements OnInit {
  proveedores: ProveedorModel[];
  dsVehiculo: MatTableDataSource<VehiculoModel>;
  ProveedorControl = new FormControl();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns: string[];
  sPais: string;
  idUser: number;

  cols: any[] = [
    { header: 'Opción', field: 'opcion', type: 'accion', width: '30', align: 'center' },
    { header: 'Placa', field: 'sPLaca', type: null, width: '60', align: 'left' },
    { header: 'Descripción', field: 'sDescripcion', type: null, width: '250', align: 'left' },
    { header: 'Modelo', field: 'sModelo', type: null, width: '80', align: 'left' },
    { header: 'Tipo', field: 'sTipoVehiculo', type: null, width: '100', align: 'left' },
    { header: 'De Lucky?', field: 'sLucky', type: null, width: '50', align: 'center' }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { nIdGrupo: number, lista: VehiculoModel[], vehiculo: VehiculoModel, isNew: boolean },
    public dialogRef: MatDialogRef<DialogGestionVehiculoComponent>,
    private transporteService: TransporteService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {
    this.displayedColumns = this.cols.map(({ field }) => field);
    this.sPais = localStorage.getItem("Pais");
    let user = localStorage.getItem("currentUser");
    this.idUser = JSON.parse(window.atob(user.split(".")[1])).uid;
  }

  ngOnInit(): void {
    this.changesProveedor();
    this.listarProveedores();
  }

  //#region Lista de Proveedores
  listarProveedores(): void {
    let parameters = [];
    this.transporteService.ArmadoRuta(1, 2, 3, parameters).subscribe(res => {
      this.proveedores = res ? res.lista : [];
      const vIdEmpresaTrans = this.data.isNew ? this.proveedores[0].nId : this.data.vehiculo.nIdEmpresaTrans;
      this.ProveedorControl.setValue(vIdEmpresaTrans);
    });
  }
  //#endregion

  //#region Lista vehículos disponibles según el cambio detectado del FormControl del proveedor.
  changesProveedor(): void {
    this.ProveedorControl.valueChanges.subscribe(value => {
      this.spinner.show();
      this.transporteService.fnArmadoRuta(1, 2, 4, `${value}`).subscribe(res => {
        this.spinner.hide();
        let lst = res ? res.lista as VehiculoModel[] : [];
        lst = lst.map(item => item = { ...item, sLucky: item.bLucky ? 'Sí' : 'No' })
        this.dsVehiculo = new MatTableDataSource(lst);
        this.dsVehiculo.paginator = this.paginator;
        this.dsVehiculo.sort = this.sort;
      });
    });
  }
  //#endregion

  /* #region  Método de filtración del listado */
  applyFilter(filterValue: string) { this.dsVehiculo.filter = filterValue.trim().toLowerCase() }
  /* #endregion */

  //#region Función que agrega el vehículo
  agregarVehiculo(row: VehiculoModel): void {
    this.spinner.show();
    if (this.data.isNew) {
      const parameters = `${this.data.nIdGrupo}|${row.nIdEmpresaTrans}|${row.nIdVehiculo}|${this.idUser}|${this.sPais}`
      this.transporteService.fnArmadoRuta(1, 1, 2, parameters).subscribe(res => {
        if (res.result == 0) {
          Swal.fire({ title: 'Hubo un error en el proceso', icon: 'warning', timer: 2000 });
          this.spinner.hide();
          return;
        } else {
          this.dialogRef.close(res.result);
        }
      });
    } else {
      if (this.data.vehiculo.nIdVehiculo == row.nIdVehiculo) {
        Swal.fire("Atención", "El vehículo " + row.sDescripcion + " ya fue asignado, porfavor escoga otro", "info");
        return;
      }
      const vIdChofer = row.nIdEmpresaTrans != this.data.vehiculo.nIdEmpresaTrans ? '' : this.data.vehiculo.nIdChofer;
      const parameters = `${this.data.vehiculo.nIdDetTransporte}|${row.nIdEmpresaTrans}|${row.nIdVehiculo}|${vIdChofer}|${this.idUser}|${this.sPais}`
      this.transporteService.fnArmadoRuta(1, 1, 6, parameters).subscribe(res => {
        if (res.result == 0) {
          Swal.fire({ title: 'Hubo un error en la actualización', icon: 'warning', timer: 2000 });
          this.spinner.hide();
          return;
        } else {
          this.dialogRef.close(this.data.vehiculo.nIdDetTransporte);
        }
      });
    }
  }
  //#endregion

  fnOpenRegistroVehiculo(): void {
    const url = this.router.createUrlTree(["/almacen/transporte/Mantenimiento/empresa-transporte", this.ProveedorControl.value, true]);
    window.open(url.toString(), '_blank');
    this.dialogRef.close();
  }

  /* #region  Método de limpieza del auto filtrado */
  fnClean(): void { if (this.dsVehiculo) { this.dsVehiculo.filter = '' } }
  /* #endregion */
}
