import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Sctr, UsuarioNivel } from '../model/Isctr';
import { sctrAnimations } from './sctr.animations';
import { SctrService } from './sctr.service';
import { SerEfectivoService } from './../efectivo/ser-efectivo.service';
import { MatSnackBar } from '@angular/material/snack-bar';

import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-sctr',
  templateUrl: './sctr.component.html',
  styleUrls: ['./sctr.component.css'],
  animations: [sctrAnimations]
})
export class SctrComponent implements OnInit {
  //#region declaracion variable del sistema
  id: number;
  url: string;
  pais: string = localStorage.getItem('Pais');
  Empresa: string = localStorage.getItem('Empresa');
  lPar: number;
  //#endregion

  //#region true and false to div
  divList: boolean = true;
  divCreate: boolean = false;
  //#endregion


  //#region objeto para mandar informacion a un componente
  vSctr = new Object();
  txtControl = new FormControl();
  //#endregion


  //#region objeto para mandar informacion a un componente
  Perfil: number;
  fabButtons = [{ icon: 'description', tool: 'Nuevo R-SCTR' }];
  buttons = [];
  fabTogglerState = 'active';
  @ViewChild(MatPaginator) listSctrPag: MatPaginator;
  @ViewChild(MatSort) listSctrSor: MatSort;
  listSctr = new Array<Sctr>();
  listSctrDS: MatTableDataSource<Sctr>;
  listSctrDC: string[] = ['action', 'sCodCC', 'sDescCC', 'nNumero', 'sTitulo', 'dFechaEnvio', 'mes', 'total', 'cEleNam'];

  usuarioNivel: UsuarioNivel;
  estado: number = 1;
  bPerfilTes: boolean = false;
  //#endregion


  constructor(
    public service: SctrService,
    private vSerEfectivo: SerEfectivoService,
    private _snackBar: MatSnackBar,
    private spinner: NgxSpinnerService,

    @Inject('BASE_URL') baseUrl: string,
  ) {
    const user = localStorage.getItem('currentUser');
    this.url = baseUrl;
    this.id = JSON.parse(window.atob(user.split('.')[1])).uid;

    this.fnGetPerfil();
    this.listTPrincipal();
    this.onToggleFab()
  }

  ngOnInit(): void {
    this.fnGetPerfilUsuario();
  }

  async fnGetPerfil() {
    let pParametro = [];
    pParametro.push(this.id);
    pParametro.push(this.pais);

    await this.vSerEfectivo.fnEfectivo(8, pParametro, this.url).then((value: any) => {
      this.vSctr["idCargo"] = value.nIdCargo;
      this.vSctr["desCargo"] = value.sCargo;
      this.vSctr["monto"] = value.nMonto;
      this.vSctr["sinControl"] = value.sinControl;
    }, error => {
      console.log(error);
    });
  }

  fnPlantilla(op) {
    if (op == 0) {
      this.vSctr["titulo"] = "Registro ";
    }
    else {
      this.vSctr["titulo"] = "Detalle ";
    }
    this.divCreate = true;
    this.divList = false;
  }


  async fnDatos(id) {
    let pParametro = [];
    pParametro.push(id);

    this.spinner.show();
    await this.service.fnSctrV2(31, pParametro, this.url).then((value: any) => {

      this.vSctr["List"] = value;
      this.fnPlantilla(1)

    }, error => {
      console.log(error);
    });

    this.spinner.hide();
  }

  async listTPrincipal() {
    const param = [];
    param.push(this.id);//usuarioLogueado
    param.push(this.Empresa);//empresa en session

    this.spinner.show();
    await this.service.fnSctrV2(22, param, this.url).then((value: any) => {
      this.listSctr = value;
      this.filtrar(this.estado);

    }, error => {
      console.log(error);
    });
    this.spinner.hide();
  }

  filtrar(estado: number, estado2?: number) {
    if (estado != 1) {
      this.listSctrDS = new MatTableDataSource(this.listSctr.filter(sctr => sctr.nEstado == estado || sctr.nEstado == estado2));
      this.listSctrDS.paginator = this.listSctrPag;
      this.listSctrDS.sort = this.listSctrSor;
    } else {
      this.listSctrDS = new MatTableDataSource(this.listSctr);
      this.listSctrDS.paginator = this.listSctrPag;
      this.listSctrDS.sort = this.listSctrSor;
    }
    this.estado = estado;
  }


  exportarExcel() {
    this.service.exportAsExcelFile(this.listSctrDS.data, 'Requerimiento SCTR');
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.listSctrDS.filter = filterValue.trim().toLowerCase();
  }

  onToggleFab() {
    if (this.buttons.length) {
      this.fabTogglerState = 'inactive';
      this.buttons = [];
    } else {
      this.fabTogglerState = 'active';
      this.buttons = this.fabButtons;
    }
  }

  recibirMensaje(mensaje: string) {
    this.divList = true;
    this.divCreate = false;
    this.txtControl.setValue('')
    this.vSctr["List"] = '';
    this.listTPrincipal();
  }

  openEdit(Obj) {

  }

  //#region Listar Perfiles
  async fnGetPerfilUsuario() {
    let pParametro = [];

    pParametro.push(this.Empresa);
    pParametro.push(this.id)

    await this.service.fnSctrV2(38, pParametro, this.url).then((value: any) => {

      if (value.length > 0) {
        for (let i = 0; i < value.length; i++) {
          if (value[i].nIdPerfil == 2631 || value[i].nIdPerfil == 2632) {
            this.bPerfilTes = true;
            
            this.fabButtons = [];
            this.onToggleFab()
            break;
          }
        }
      }

    }, error => {
      console.log(error);
    });

  }
  //#endregion
}
