import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { E_Ajuste_Congelado, IFiltersAjusteCongelado } from '../models/ajusteCongelado';
import { ISelectItem } from '../models/constantes';
import { TransporteService } from '../transporte.service';
import { AjusteCongeladoFiltersComponent } from './componentes/ajuste-congelado-filters/ajuste-congelado-filters.component';
import { AjusteCongeladoGetComponent } from './componentes/ajuste-congelado-get/ajuste-congelado-get.component';
import { AjusteCongeladoTableComponent } from './componentes/ajuste-congelado-table/ajuste-congelado-table.component';

@Component({
  selector: 'app-ajuste-congelado',
  templateUrl: './ajuste-congelado.component.html',
  styleUrls: ['./ajuste-congelado.component.css']
})
export class AjusteCongeladoComponent implements OnInit {
  @ViewChild(AjusteCongeladoFiltersComponent, { static: true }) compFilters: AjusteCongeladoFiltersComponent;
  @ViewChild(AjusteCongeladoTableComponent, { static: true }) compTable: AjusteCongeladoTableComponent;
  empresas: ISelectItem[];
  presupuestos: ISelectItem[];
  listado: E_Ajuste_Congelado[];

  constructor(
    private transporService: TransporteService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    // #region  Inicialización con consumo paralelo de servicios
    this.spinner.show();
    const idPais = localStorage.getItem('Pais');
    const idEmpresa = localStorage.getItem('Empresa');
    forkJoin({
      resEmpresas: this.transporService.fnAjusteCongelado(1, 2, idPais, 2),
      resPresupuestos: this.transporService.fnAjusteCongelado(1, 2, idEmpresa, 3),
      resListado: this.transporService.fnAjusteCongelado(1, 2, '', 1)
    }).subscribe(
      ({ resEmpresas, resPresupuestos, resListado }) => {
        this.spinner.hide();
        this.empresas = resEmpresas ? resEmpresas.lista : [];
        this.presupuestos = resPresupuestos ? resPresupuestos.lista : [];
        this.listado = resListado ? resListado.lista : []
        this.fnBuscar();
      }
    );
    //#endregion
  }

  /* #region  Método de búsqueda con filtros */
  fnBuscar(): void {
    this.spinner.show();
    const filters = this.compFilters.filters as IFiltersAjusteCongelado;

    // Si no hay ningun filtro agregado, no se realizara la busqueda
    if(!filters.dtFecha && !filters.sNroTransporte && !filters.nIdPresupuesto ){
      this.spinner.hide();
      Swal.fire('¡Verificar!', 'Se debe agregar al menos un filtro de busqueda', 'warning')
      return;
    }

    const sFecha = filters.dtFecha ? moment(filters.dtFecha).format("YYYY-MM-DD") : '';
    const parameters = `${filters.nIdEmpresa}|${filters.sNroTransporte || ''}|${filters.nIdPresupuesto || ''}|${sFecha}`
    console.log(parameters);
    this.transporService.fnAjusteCongelado(1, 2, parameters, 1).subscribe(res => {
      this.spinner.hide();
      this.listado = res ? res.lista : [];
    });
  }
  /* #endregion */

  /* #region  Método de obtención de Gasto Congelado */
  fnObtener(id: number): void {
    console.log(id);
    this.spinner.show();
    this.transporService.fnAjusteCongelado(1, 2, `${id}`, 5).subscribe((res) => {
      this.spinner.hide();
      this.dialog.open(AjusteCongeladoGetComponent, {
        width: '80%',
        height: 'auto',
        disableClose: true,
        data: res.obj as E_Ajuste_Congelado
      }).afterClosed().subscribe((res: number) => {
        if (res) {
          this.fnActualizar(id, res);
        }
      });
    },
      (error) => {
        this.spinner.hide();
        console.log(error.message);
      })
  }
  /* #endregion */

  /* #region  Método de actualización de Gasto Congelado */
  fnActualizar(id: number, precio: number): void {
    this.spinner.show();
    const parameters = `${id}|${precio}`;
    this.transporService.fnAjusteCongelado(1, 3, parameters, 1).subscribe(res => {
      this.spinner.hide();
      if (res.result == 1) {
        this.fnBuscar();
        Swal.fire({ title: 'Se actualizó de manera exitosa', icon: 'success', timer: 1500 });
      } else {
        Swal.fire({ title: 'Hubo un error en la actualización', icon: 'warning', timer: 1500 });
      }
    });
  }
  /* #endregion */

  /* #region  Método de limpieza de filtros en general */
  fnClean(): void {
    this.compFilters.fnCleanFilters();
    this.compTable.fnClean();
  }
  /* #endregion */
}
