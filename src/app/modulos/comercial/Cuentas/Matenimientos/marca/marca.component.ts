import { DialogCatalogoComponent } from './marca-dialog.component';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material/dialog";
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { Component, OnInit, Inject, ViewChild } from "@angular/core";
import { SermarcaService } from "./sermarca.service";
import { observable, Observable } from "rxjs";
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

@Component({
  selector: "app-marca",
  templateUrl: "./marca.component.html",
  styleUrls: ["./marca.component.css"],
})
export class MarcaComponent implements OnInit {
  url: string;
  sPais: string;
  id: number;

  lblMarca: any;
  lcboLinea: any;
  lcboCategoria: any;

  //Formularios
  formCategoria: FormGroup;
  formLinea: FormGroup;
  formMarca: FormGroup;

  //Material
  estadoVista: number = 0;
  txtControl = new FormControl();

  //CATEGORIA
  dsCategoria: MatTableDataSource<any>;
  @ViewChild(MatPaginator) categoriaPaginator: MatPaginator;
  @ViewChild(MatSort) categoriaSort: MatSort;
  dcCategoria = ["opcion", "sDescCategoria", "bEstCategoria"];

  //LINEA
  dsLinea: MatTableDataSource<any>;
  @ViewChild("lineaPaginator") lineaPaginator;
  @ViewChild("lineaSort") lineaSort;
  dcLinea = ["opcion", "sDescCategoria", "sDescLinea", "bEstLinea"];

  //MARCA
  dsMarca: MatTableDataSource<any>;
  @ViewChild("marcaPaginator") marcaPaginator;
  @ViewChild("marcaSort", { static: true }) marcaSort;
  dcMarca = ["opcion", "sDescCategoria", "sDescLinea", "sDescMarca", "bEstMarca",];

  constructor(
    private vSerMarca: SermarcaService,
    private fb: FormBuilder,
    @Inject("BASE_URL") baseUrl: string,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService
  ) {
    this.url = baseUrl;
  }

  ngOnInit(): void {

    const user = localStorage.getItem("currentUser");
    this.id = JSON.parse(window.atob(user.split(".")[1])).uid; // id del usuario
    this.sPais = localStorage.getItem("Pais"); // id del pais
    this.fnCatalogo(6, 0);
    this.fnCatalogo(5, 0);
    this.fnCatalogo(0, 0);

  }

  //#region Dialogs

  //#region Dialog Categoria
  dialogCategoria(
    accion: string,
    descripcion: string,
    estado: boolean,
    codCategoria: number
  ): void {

    const dialogRef = this.dialog.open(DialogCatalogoComponent, {
      width: "650px",
      disableClose: true,
      data: {
        accion: accion,
        categoria: {
          descripcion: descripcion,
          estado: estado,
          codCategoria: codCategoria,
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        let tipoAccion;

        if (result.accion == "AGREGAR") tipoAccion = 0;
        else tipoAccion = 1;

        this.insertarCatalogo(
          result.descripcion,
          result.estado,
          2020,
          result.codCategoria,
          tipoAccion,
          '',
          ''
        ).then((res) => {

          this.fnCatalogo(5, 0);
          this.fnCatalogo(0, 0);
          this.fnCatalogo(6, 0);
        });
      }
    });

  }
  //#endregion

  //#region Dialog Linea
  dialogLinea(
    accion: string,
    categoria: number | string,
    descripcion: string,
    estado: boolean,
    codLinea: number,
    codDetCat: number
  ): void {
    const dialogRef = this.dialog.open(DialogCatalogoComponent, {
      width: "650px",
      disableClose: true,
      data: {
        accion: accion,
        linea: {
          categoria: categoria,
          descripcion: descripcion,
          estado: estado,
          codLinea: codLinea,
          codDetCat: codDetCat,
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        let tipoAccion;

        if (result.accion == "AGREGAR") tipoAccion = 0;
        else tipoAccion = 1;
        // 0 Si es insert
        if (tipoAccion == 0) {
          this.insertarCatalogo(
            result.descripcion,
            result.estado,
            2021,
            result.codLinea,
            tipoAccion,
            result.categoria,
            ''
          ).then((idCat) => {

            this.insertarDetalleCatalogo(
              result.categoria,
              idCat,
              0,
              3,
              4,
              result.estado,
              result.codDetCat,
              tipoAccion
            ).then(() => {
              this.fnCatalogo(0, 0);

            });
          });
        }
        // 1 si es actualizar
        else if (tipoAccion == 1) {
          this.insertarCatalogo(
            result.descripcion,
            result.estado,
            2021,
            result.codLinea,
            tipoAccion,
            result.categoria,
            ''
          ).then((res) => {
            if (res != 0) {
              this.insertarDetalleCatalogo(
                result.categoria,
                result.codLinea,
                0,
                3,
                4,
                result.estado,
                result.codDetCat,
                tipoAccion
              ).then((res) => {
                this.fnCatalogo(0, 0);
                this.fnCatalogo(6, 0);
              });
            }
          });
        }
      }
    });
  }
  //#endregion

  //#region Dialog Marca
  dialogMarca(
    accion: string,
    categoria: number | string,
    linea: number | string,
    descripcion: string,
    estado: boolean,
    codMarca: number,
    codDetCat: number
  ): void {
    const dialogRef = this.dialog.open(DialogCatalogoComponent, {
      width: "650px",
      disableClose: true,
      data: {
        accion: accion,
        marca: {
          categoria: categoria,
          linea: linea,
          descripcion: descripcion,
          estado: estado,
          codMarca: codMarca,
          codDetCat: codDetCat,
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        let tipoAccion;

        if (result.accion == "AGREGAR") tipoAccion = 0;
        else tipoAccion = 1;
        // 0 si es insert
        if (tipoAccion == 0) {
          this.insertarCatalogo(
            result.descripcion,
            result.estado,
            2022,
            result.codMarca,
            tipoAccion,
            result.categoria,
            result.linea
          ).then((idMar) => {
            this.insertarDetalleCatalogo(
              result.categoria,
              result.linea,
              idMar,
              3,
              4,
              result.estado,
              idMar,
              tipoAccion
            ).then(() => {
              this.fnCatalogo(6, 0);
            });
          });

        }
        // 1 si es actualizar
        else if (tipoAccion == 1) {

          this.insertarCatalogo(
            result.descripcion,
            result.estado,
            2022,
            result.codMarca,
            tipoAccion,
            result.categoria,
            result.linea
          ).then((nResultado) => {
            if (nResultado != 0) {
              this.insertarDetalleCatalogo(
                result.categoria,
                result.linea,
                result.codMarca,
                3,
                4,
                result.estado,
                result.codDetCat,
                tipoAccion
              ).then((res) => {
                this.fnCatalogo(6, 0);
              });
            }
          });
        }
      }
    });
  }
  //#endregion

  //#endregion

  //#region Filtros
  applyFilterCategoria = function (filterValue: string) {

    this.dsCategoria.filter = filterValue.trim().toLowerCase();

    if (this.dsCategoria.pagiantor) {
      this.dsCategoria.paginator.firstPage();
    }
  }

  applyFilterLinea = function (filterValue: string) {

    this.dsLinea.filter = filterValue.trim().toLowerCase();
    if (this.dsLinea.paginator) {
      this.dsLinea.paginator.firstPage();
    }

  }

  applyFilterMarca = function (filterValue: string) {
    this.dsMarca.filter = filterValue.trim().toLowerCase();

    if (this.dsMarca.paginator) {
      this.dsMarca.paginator.firstPage();
    }

  }
  //#endregion

  //#region Listar Tablas
  async fnCatalogo(opcion: number, pPar: number) {
    let pParametro = [];
    pParametro.push(pPar);

    await this.vSerMarca.fnCatalogoMarca(opcion, pParametro, this.url).then(
      (value: any[]) => {
        if (opcion == 0) {
          this.dsLinea = new MatTableDataSource(value);
          this.dsLinea.sort = this.lineaSort;
          this.dsLinea.paginator = this.lineaPaginator;
        } else if (opcion == 5) {
          this.dsCategoria = new MatTableDataSource(value);
          this.dsCategoria.sort = this.categoriaSort;
          this.dsCategoria.paginator = this.categoriaPaginator;
        } else if (opcion == 6) {
          this.dsMarca = new MatTableDataSource(value);
          this.dsMarca.sort = this.marcaSort;
          this.dsMarca.paginator = this.marcaPaginator;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion

  //#region Insertar Catalogo
  async insertarCatalogo(
    descripcion: string,
    estado: boolean,
    tipoCC: number,
    codCatalogo: number,
    accion: number,
    categoria: string,
    linea: string
  ) {
    //accion = 0 insertar  || accion = 1 actualizar
    let pParametro = [];
    pParametro.push(this.sPais)
    pParametro.push(descripcion);
    pParametro.push(tipoCC);
    pParametro.push(estado);
    pParametro.push(this.id);

    pParametro.push(codCatalogo);
    pParametro.push(accion);
    pParametro.push(categoria);
    pParametro.push(linea);


    let nResultado = 0;
    let msjCategoria
    let msjLinea

    await this.vSerMarca.fnCatalogoMarca(1, pParametro, this.url)
      .then((res: any) => {

        nResultado = res.cod;

        msjCategoria = res.mensaje.split('Categoría')
        

        if (res.cod == 0) {          
          if (tipoCC == 2022) {          
            msjLinea = msjCategoria[1].split('Línea')  
            return Swal.fire({
              icon: 'warning',
              title: `${msjCategoria[0]} </br> Categoría ${msjLinea[0]} </br> Linea ${msjLinea[1]}`,
            });
          }
          else if (tipoCC == 2021) {
            msjLinea = msjCategoria[1].split('Línea')
            return Swal.fire({
              icon: 'warning',
              title: `${msjCategoria[0]} </br> Categoría ${msjLinea[0]}`,
            });

          }
          else if (tipoCC == 2020) {
            return Swal.fire({
              icon: 'warning',
              title: res.mensaje,
            });

          }


        }


        else {
          Swal.fire({
            icon: 'success',
            title: 'Se guardó correctamente.',
            timer: 3000
          });

        }

      }, error => {

        console.log(error);
      });

    return nResultado;

  }
  //#endregion

  //#region Insertar Detalle(Linea/Marca)
  async insertarDetalleCatalogo(
    idcat: number,
    idlin: number,
    idmar: number,
    idfab: number,
    iddis: number,
    estado: boolean,
    codDetCat: number,
    accion: number
  ) {
    let pParametro = [];
    pParametro.push(idcat);
    pParametro.push(idlin);
    pParametro.push(idmar);
    pParametro.push(idfab);
    pParametro.push(iddis);
    pParametro.push(estado);
    pParametro.push(this.id);
    pParametro.push(codDetCat);
    pParametro.push(accion);
    pParametro.push(this.sPais);

    await this.vSerMarca.fnCatalogoMarca(3, pParametro, this.url)
      .then((res: any) => {


      }, error => {
        console.log(error);
      });

    return new Promise<any>((resolve) => {
      resolve(true);
    });
  }
  //#endregion

}
