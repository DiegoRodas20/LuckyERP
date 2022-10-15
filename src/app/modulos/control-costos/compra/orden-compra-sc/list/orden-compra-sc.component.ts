import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Utilitarios } from '../repository/utilitarios';
import { MatSort } from '@angular/material/sort';
import { OrdenCompraScDto } from '../models/ordenCompraSc.Dto';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { CompraScService } from '../services/compra-sc.service';
import { SecurityErp } from '../../../../AAHelpers/securityErp.Entity';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-orden-compra-sc',
  templateUrl: './orden-compra-sc.component.html',
  styleUrls: ['./orden-compra-sc.component.css']
})

export class OrdenCompraScComponent implements OnInit, OnDestroy {

  securityErp = new SecurityErp;
  utilitarios = new Utilitarios();
  subRef$: Subscription;
  // Tabla Listado OrdenCompraScList
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ListComprasSc: MatTableDataSource<OrdenCompraScDto>;
  txtFiltroGen = new FormControl();

  constructor(private service: CompraScService, private router: Router,) {
  }
  ngOnInit(): void {
    this.listarComprasSc();
    this.consultaPerfilUsuario();
  }
  ListarContenido() {

  }
  fnFiltrar() {

  }
  listarComprasSc() {
    this.utilitarios.pParametro = [];
    this.utilitarios.pParametro.push(this.securityErp.getEmpresa());
    this.utilitarios.pParametro.push(this.securityErp.getUsuarioId());
    this.subRef$ = this.service.fnListadoComprasSc(this.utilitarios.pParametro).subscribe((data: any) => {
      this.utilitarios.totalfilas = "Total registros: " + data.length.toString();
      this.ListComprasSc = new MatTableDataSource<OrdenCompraScDto>(data);
      this.ListComprasSc.paginator = this.paginator;
      this.ListComprasSc.sort = this.sort;
    })
  }

  editar(e) {

    if (e.subTipoDoc == 'A')
      this.router.navigate(['/controlcostos/compra/orden-sc-aud-edit', e.codigoGastoCosto]);

    else
      this.router.navigate(['/controlcostos/compra/orden-sc-edit', e.codigoGastoCosto]);
  }

  async fnCrearOrdenCompra() {
    if (this.utilitarios.perfil) {

      await Swal.fire({
        title: '¿Desea hacer una OC normal o auditada?',
        showDenyButton: true,
        denyButtonColor: '#d33',
        denyButtonText: `Auditada`,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        confirmButtonText: `Normal`
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/controlcostos/compra/orden-sc-add']);
        } else if (result.isDenied) {
          this.router.navigate(['/controlcostos/compra/orden-sc-aud-add']);
        }
      })
    }
    else {
      this.router.navigate(['/controlcostos/compra/orden-sc-add']);
    }

  }

  consultaPerfilUsuario() {
    this.utilitarios.pParametro = [];
    this.utilitarios.pOpcion = 21
    this.utilitarios.pParametro.push(this.securityErp.getUsuarioId());
    this.subRef$ = this.service.fnDatosOrdenCompras(this.utilitarios.pOpcion, this.utilitarios.pParametro).subscribe(data => {
      this.utilitarios.perfil = data[0].nId;
    })
  }

  value = '';
  actualizarListado() {
    this.value = '';
    this.listarComprasSc();
  };

  applyFilter(event: Event) {

    const filterValue = (event.target as HTMLInputElement).value;
    this.ListComprasSc.filter = (filterValue.trim().toLowerCase());
    if (this.ListComprasSc.paginator) {
      this.ListComprasSc.paginator.firstPage();
    }
  }

  ngOnDestroy(): void {
    if (this.subRef$) { this.subRef$.unsubscribe(); }
  }
}

