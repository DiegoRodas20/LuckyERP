import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { asistenciapAnimations } from '../../Asistencia/asistenciap/asistenciap.animations';
import { UsuarioNivel } from '../model/lreembolso';
import { Reembolso, Usuario } from '../model/lreembolso';
import { DialogReembolsoComponent } from './dialog/dialog.component';
import { ReembolsoService } from './reembolso.service';

@Component({
  selector: 'app-reembolso',
  templateUrl: './reembolso.component.html',
  styleUrls: ['./reembolso.component.css'],
  animations: [asistenciapAnimations]
})
export class ReembolsoComponent implements OnInit {

  // Botones Flotantes
  tsLista = 'active';  // Inicia la lista visible
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'text_snippet', tool: 'Descargar Excel' },
  ];
  abLista = [];


  usuariologueado: Usuario;
  url: string;
  fabButtons = [{ icon: 'personal_add', tool: 'Nuevo usuario' }];
  buttons = [];
  fabTogglerState = 'inactive';
  @ViewChild(MatPaginator) listReemPag: MatPaginator;
  @ViewChild(MatSort) listReemSor: MatSort;
  listReem = new Array<Reembolso>();
  listReemDS: MatTableDataSource<Reembolso>;
  listReemDC: string[] = ['action', 'sCodCC', 'sDescCC', 'nNumero', 'sTitulo', 'dFechaIni', 'nReembolsable', 'cEleNam',];
  pais = localStorage.getItem('Pais');
  empresa = localStorage.getItem('Empresa');
  userObject = localStorage.getItem('currentUser');
  usuarioNivel: UsuarioNivel;

  constructor(
    public service: ReembolsoService, @Inject('BASE_URL') baseUrl: string,
    private _snackBar: MatSnackBar, public dialog: MatDialog) {
    this.url = baseUrl;
    this.obtenerPerfil();
    this.onToggleFab(1, -1)
  }

  ngOnInit(): void {
  }

  async obtenerPerfil() {
    const param = [];
    param.push(JSON.parse(window.atob(this.userObject.split('.')[1])).uid);;//usuario Logeado
    param.push(this.pais);
    //param.push(1)//
    this.service.fnSctr(100, param, this.url).subscribe((value: UsuarioNivel[]) => {
      console.log(value);
      this.usuarioNivel = value[0];
      if (this.usuarioNivel.nMonto != '') {
        this.usuarioNivel.aprobador = true;
      } else {
        this.usuarioNivel.aprobador = false;
      }
      /************************************************************* */
      /************************************************************* */
      /************************************************************* */
      /************************************************************* */
      /*this.usuarioNivel.nMonto = '1000';
      this.usuarioNivel.aprobador = true;*/
      this.listTPrincipal();
    });
  }

  async listTPrincipal() {
    const param = [];
    param.push(this.usuarioNivel.nCodUser);
    param.push(this.empresa);
    this.service.fnSctr(1, param, this.url).subscribe((value: Reembolso[]) => {
      this.listReemDS = new MatTableDataSource(value);
      this.listReemDS.paginator = this.listReemPag;
      this.listReemDS.sort = this.listReemSor;
    });
  }

  openDialogEdit(element: Reembolso) {
    const dialogRef = this.dialog.open(DialogReembolsoComponent, {
      panelClass: 'myapp-no-padding-dialog',
      width: '100%',
      data: { reembolso: element, usuarioNivel: this.usuarioNivel }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.listTPrincipal();
    });
  }



  /****************************************************************************** */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.listReemDS.filter = filterValue.trim().toLowerCase();
  }

  filtrar(filtro: string) {

  }

  // onToggleFab() {
  //   if (this.buttons.length) {
  //     this.fabTogglerState = 'inactive';
  //     this.buttons = [];
  //   } else {
  //     this.fabTogglerState = 'active';
  //     this.buttons = this.fabButtons;
  //   }
  // }

  //Botones Flotantes
  onToggleFab(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;
  }
  clickFab(index: number) {
    switch (index) {
      case 0:
        this.exportarExcel()
        break
      default:
        break
    }
  }

  exportarExcel() {
    this.service.exportAsExcelFile(this.listReemDS.data, 'Requerimiento Reembolso');
  }

}
