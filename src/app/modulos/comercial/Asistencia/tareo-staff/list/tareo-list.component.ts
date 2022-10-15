import { Component, OnInit, ViewChild, Inject, AfterViewInit } from '@angular/core';
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { MatSort } from "@angular/material/sort";
import { TareoStaffService } from '../services/tareostaff.service';
import { TareoStaff } from '../models/tareoStaff.Entity';
import { RepositoryUtilitarios } from '../repository/repositoryUtilitarios';
import { NgxSpinnerService } from 'ngx-spinner';
import { comercialAnimations } from '../../../Animations/comercial.animations';

@Component({
  selector: "app-tareo-list.component",
  templateUrl: "./tareo-list.component.html",
  styleUrls: ["./tareo-list.component.css"],
  animations: [comercialAnimations]
})
export class TareoListComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  // listadoTareoStaff: MatTableDataSource<TareoStaff>;
  listadoAniosTareoStaff: TareoStaff[];
  repositoryUtilitarios = new RepositoryUtilitarios;

  url: string;
  usuarioId: string;
  searchKey: string;

  nIdUsuario: number;
  nIdEmpresa: any;


  displayedColumns: string[] = ['action', 'nro', 'anio', 'mes', 'personal', 'descripcion', 'estado'];
  dataSource = new MatTableDataSource();
  constructor(
    private spinner: NgxSpinnerService,
    private router: Router,
    @Inject('BASE_URL') baseUrl: string,
    private tareoStaffService: TareoStaffService,
  ) {
    this.url = baseUrl;
    const user = localStorage.getItem("currentUser");
    this.nIdUsuario = JSON.parse(window.atob(user.split(".")[1])).uid;
    this.nIdEmpresa = localStorage.getItem("Empresa");

  }

  // ngAfterViewInit() {
  //   this.dataSource.paginator = this.paginator;
  //   this.dataSource.sort = this.sort;
  // }

  ngOnInit(): void {

    this.ListaTareos();

  }

  //#region Listar Tareos
  private async ListaTareos() {

    var params = [];
    params.push(this.nIdEmpresa);
    params.push(this.nIdUsuario);
    this.spinner.show('spi_lista');
    await this.tareoStaffService
      .fnTareoStaffService(5, params, this.url)
      .subscribe((data: TareoStaff[]) => {
        const ELEMENT_DATA = data;
        this.listadoAniosTareoStaff = data;

        this.dataSource = new MatTableDataSource<TareoStaff>(ELEMENT_DATA);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        let x = {};
        this.listadoAniosTareoStaff = this.listadoAniosTareoStaff.filter(o => x[o.anio] ? false : x[o.anio] = true);
        this.spinner.hide('spi_lista');
      },
        err => {
          console.log('Error al recuperar los Tareos', err);
        }
      );

  }
  //#endregion


  //#region Filtrar por Años
  async fnFilterTareoAnios(event) {
    if (event === undefined) {
      await this.ListaTareos();
    }
    else {
      var params = [];
      let list = [this.nIdUsuario, event];

      for (let i of list) {
        params.push(i);
      }
      await this.tareoStaffService
        .fnTareoStaffService(7, params, this.url)
        .subscribe((data: TareoStaff[]) => {
          this.dataSource = new MatTableDataSource<TareoStaff>(data);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
          err => {
            console.log('Error al recuperar los Tareos', err)
          });
    }
  }
  //#endregion


  //#region Filtrar Tabla
  fnFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = (filterValue.trim().toLowerCase());
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  //#endregion


  //#region Añadir tareo
  fnAddNew() {
    this.router.navigate(['/comercial/asistencia/tareo-add']);
  }
  //#endregion


  //#region Editar Tareo
  fnEdit(e) {
    this.router.navigate(['/comercial/asistencia/tareo-edit', e.idPersonal, e.idCargo, e.idTareo]);
  }
  //#endregion



}
