import { Component, OnInit, Inject, ViewChild } from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { observable, Observable } from "rxjs";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";

import { AtcMatrizGcpService } from "./atc-matriz-gcp.service";
import { AtcMatrizGcpModalComponent } from "./atc-matriz-gcp-modal/atc-matriz-gcp-modal.component";
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material/dialog";

//Animaciones de SCTR(Botón +)
import { btnAnimations } from "./../../../../../../shared/components/animations";

@Component({
  selector: "app-atc-matriz-gcp",
  templateUrl: "./atc-matriz-gcp.component.html",
  animations: [btnAnimations],
  styleUrls: ["./atc-matriz-gcp.component.css"],
})
export class AtcMatrizGcpComponent implements OnInit {
  abMain = [];
  tsMain = "inactive";

  fabNuevo = [
    { icon: "group_add", tool: "Agregar Cargo y Puesto" },
    { icon: "person_add", tool: "Agregar Puesto" },
  ];

  url: string;
  sPais: string;
  nIdUsuario: number;
  txtControl = new FormControl();
  expandedMore: any;

  listaCargos: any;
  listaPuestos: any;
  listaEspecializacion: any;

  //CARGO
  dsCargo: MatTableDataSource<any>;
  @ViewChild("cargoPaginator") cargoPaginator;
  @ViewChild("cargoSort") cargoSort;
  dcCargo = ["opcion", "sNombreGrupo", "sNombreCargo", "bEstado"];

  //PUESTO
  dsPuesto: MatTableDataSource<any>;
  @ViewChild("puestoPaginator") puestoPaginator;
  @ViewChild("puestoSort", { static: true }) puestoSort;
  dcPuesto = [
    "opcion",
    "sNombreGrupo",
    "sNombreCargo",
    "sPuesto",
    "sNombrePuesto",
    "bEstado",
    "more"
  ];

  //ESPECIALIZACIONES
  ExpandedDC: string[] = ["nOpcion", "position", "sNombreEspecializacion", "bEstadoEsp"];
  ExpandedDS: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild('pagExpanded', { static: false }) pagExpanded: MatPaginator;
  @ViewChild('mtExpanded', { static: false }) mtExpanded: MatTable<any>;

 
  constructor(
    private vSerAtcMatrizGcp: AtcMatrizGcpService,
    private form: FormBuilder,
    @Inject("BASE_URL") baseUrl: string,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService
  ) {
    this.url = baseUrl;
  }

  ngOnInit(): void {
    const user = localStorage.getItem('currentUser');
    this.nIdUsuario = JSON.parse(window.atob(user.split('.')[1])).uid;

    this.sPais = JSON.parse(localStorage.getItem('Pais'));

    this.fnListarPuestos();
    
  }

  //#region Filtros
  applyFilterCargo = function (filterValue: string) {
    this.dsCargo.filter = filterValue.trim().toLowerCase();
    if (this.dsCargo.paginator) {
      this.dsCargo.paginator.firstPage();
    }
  };

  applyFilterPuesto = function (filterValue: string) {
    this.dsPuesto.filter = filterValue.trim().toLowerCase();

    if (this.dsPuesto.paginator) {
      this.dsPuesto.paginator.firstPage();
    }
  };
  //#endregion

  //#region Listar Puestos
  async fnListarPuestos() {
    let pParametro = [];
    pParametro.push(this.sPais);

    await this.vSerAtcMatrizGcp.fnMatrizGCP(1, pParametro, this.url).then(
      (value: any[]) => {
        
        this.listaPuestos = value;

        this.dsPuesto = new MatTableDataSource(value);
        this.dsPuesto.paginator = this.puestoPaginator;
        this.dsPuesto.sort = this.puestoSort;
      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion

  //#region Abrir Modal
  async fnAbrirModal(accion, opcion, grupo, cargo, puesto, estado, tipomodal) {
    const dialogRef = this.dialog.open(AtcMatrizGcpModalComponent, {
      width: "40rem",
      disableClose: true,
      data: {
        accion: accion,
        opcion: opcion,
        grupo: grupo,
        cargo: cargo,
        puesto: puesto,
        estado: estado,
        tipomodal: tipomodal,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      
      if (result !== undefined) {
       
        if (tipomodal == 1) {
          this.fnAgregarPuesto(
            result.nIdGrupo,
            result.nIdCargo,
            result.sNombreCargo,
            result.sPuesto,
            result.bEstado,
            result.nIdPuesto
          )
        } else if (tipomodal == 2) {
          this.fnAgregarEspecializacion(
            result.nIdPuesto,
            result.sNombreEspecializacion,
            result.bEstado,
            result.nIdEspecializacion
          )
        }
      }
    });
  }
  //#endregion

  fnOnToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        if (stat === -1) {
          if (this.abMain.length > 0) {
            stat = 0;
          } else {
            stat = 1;
          }
        }

        switch (stat) {
          case 0:
            this.abMain = [];
            break;
          case 1:
            this.abMain = this.fabNuevo;
            break;
        }
        break;
    }
  }

  async clickFab(opc: number, index: number, grupo, cargo) {
    //opc:1 -> Cargo y Puesto, opc: 2 ->Puesto

    switch (opc) {
      case 1:
        switch (index) {
          case 1:
            this.fnAbrirModal(0, index, "", "", "", true, 1);
            break;
          case 2:
            this.fnAbrirModal(0, index, grupo, cargo, "", true, 1);
            break;
       
        }
        break;
    }
  }

  //#region Insertar Puesto
  async fnAgregarPuesto(
    nIdGrupo: number,
    nIdCargo: number,
    sNombreCargo: string,
    sPuesto: string,
    bEstado: boolean,
    nIdPuesto: number
  ) {
    let pOpcion: number; //5: Insertar Puesto, 6:Insertar Puesto y Cargo, 7:Editar Puesto
    let pParametro = [];
    pParametro.push(this.sPais);
    pParametro.push(this.nIdUsuario);
    pParametro.push(bEstado);
    pParametro.push(nIdGrupo);
    pParametro.push(sPuesto);

    if (sNombreCargo == '') {
      pParametro.push(nIdCargo);
      pOpcion = 5
    }
    else {
      pParametro.push(sNombreCargo);
      pOpcion = 6
    }
    pParametro.push(nIdPuesto);

    if (nIdPuesto > 0) {
      pOpcion = 7
    }


    await this.vSerAtcMatrizGcp.fnMatrizGCP(pOpcion, pParametro, this.url).then(
      (res: any) => {

        if (res.cod == 1) {
          Swal.fire({
            icon: "success",
            title: res.mensaje,
          });
          this.fnListarPuestos();
        }
        else {
          return Swal.fire({
            icon: "warning",
            title: res.mensaje,
          });
        }

      },
      (error) => {
        console.log(error);
      }
    );

    return new Promise<any>((resolve) => {
      resolve(true);
    });
  }
  //#endregion

  //#region Insertar Especializacion
  async fnAgregarEspecializacion(
    nIdPuesto: number,
    sNombreEspecializacion: string,
    bEstado:boolean,
    nIdEspecializacion:number
  ) {
    let pOpcion:number = 8  // 8:Insertar
    let pParametro = [];
    pParametro.push(this.sPais)
    pParametro.push(this.nIdUsuario);
    pParametro.push(nIdPuesto);
    pParametro.push(sNombreEspecializacion);
    pParametro.push(bEstado);
    pParametro.push(nIdEspecializacion);
    
    if(nIdEspecializacion>0){
      pOpcion=9 // 9:Actualizar
    }

    await this.vSerAtcMatrizGcp.fnMatrizGCP(pOpcion, pParametro, this.url).then(
      (res: any) => {

        if (res.cod == 1) {
          Swal.fire({
            icon: "success",
            title: res.mensaje,
          });
          //
          this.fnListarEspecializaciones(nIdPuesto);
        }
        else {
          return Swal.fire({
            icon: "warning",
            title: res.mensaje,
          });
        }
      },
      (error) => {
        console.log(error);
      }
    );

    return new Promise<any>((resolve) => {
      resolve(true);
    });
  }
  //#endregion

  async fnListarEspecializaciones(nIdPuesto) {
    let pParametro = [];
    pParametro.push(nIdPuesto);

    await this.vSerAtcMatrizGcp.fnMatrizGCP(10, pParametro, this.url).then(
      (value: any[]) => {
      
        this.listaEspecializacion = value;
        this.ExpandedDS = new MatTableDataSource(value);

      },
      (error) => {
        console.log(error);
      }
    );
  }

  async clickExpanded(row) {

    if (this.expandedMore === row) {
      // Limpiar -> al 2do click en el mismo botón expansivo
      this.expandedMore = null;
      this.ExpandedDS = new MatTableDataSource([]);

      if (this.ExpandedDS.paginator) {
        this.ExpandedDS.paginator.firstPage();
      }

    } else {

      this.fnListarEspecializaciones(row.nIdPuesto);

      this.expandedMore = row;
      this.mtExpanded.renderRows();
    }

  }

}
