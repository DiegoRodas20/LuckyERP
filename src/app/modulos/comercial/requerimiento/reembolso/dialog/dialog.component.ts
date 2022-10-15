import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Detalle, Reembolso, Usuario, Partida, Campana, UsuarioNivel } from '../../model/lreembolso';
import { ReembolsoService } from '../reembolso.service';
import Swal from "sweetalert2";
import { DialogAprobacionesComponent } from '../../sctr/dialog-aprobaciones/dialog-aprobaciones.component';
import { EstadoefectivoComponent } from '../../efectivo/estadoefectivo/estadoefectivo.component';
import { Estado } from './../../model/IEfectivo';  
import { SerEfectivoService } from './../../efectivo/ser-efectivo.service';   

@Component({
  selector: 'app-dialog-reembolso',
  templateUrl: './dialog.component.html',
  styleUrls: ['../reembolso.component.css']
})
export class DialogReembolsoComponent implements OnInit {
  url: string;
  usuarioNivel: UsuarioNivel
  reemSelec: Reembolso = {};
  campana: Campana = {};
  detaSelec: Detalle = {};
  @ViewChild(MatPaginator) listDetallePag: MatPaginator;
  @ViewChild(MatSort) listDetalleSor: MatSort;
  listDetalleDC: string[] = ['ciudad', 'partida', 'nomBeneficiario'];
  listDetalleDS: MatTableDataSource<Detalle>;
  listDetalle = new Array<Detalle>();
  listPartida = new Array<Partida>();
  reemFG: FormGroup;
  pais = localStorage.getItem('Pais');
  disableTitulo: boolean;
  disableAprobaciones: boolean;
  hiddenGrabar: boolean;
  hiddenEnviar: boolean; 
  btnEnviar: boolean;

  constructor(
    public dialogRef: MatDialogRef<DialogReembolsoComponent>,
    private vSerEfectivo: SerEfectivoService,
    public service: ReembolsoService, @Inject('BASE_URL') baseUrl: string,
    private fb: FormBuilder, private _snackBar: MatSnackBar, public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.reemFG = this.fb.group({
      titulo: ['', [Validators.required]],
      precio: ['', [Validators.required, Validators.pattern(/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/)]],
    });
    
    this.url = baseUrl;
    this.usuarioNivel = data["usuarioNivel"];
    this.reemSelec = data["reembolso"];// reembolso seleccionado desde pagina padre


    this.getCampana();
    this.listTDetalle();

    this.esEnviar();
    this.esGrabar();
    this.validarTodo();
  }

  ngOnInit(): void { 
  }

  /****************************************LISTADO DE DATO************************************** */
  async getCampana() {
    const param = [];
    param.push(this.usuarioNivel.nCodUser)
    param.push(this.reemSelec.nIdCentroCosto);
    this.service.fnSctr(2, param, this.url).subscribe((value: Campana[]) => {
      if (value.length > 0) this.campana = value[0];

    });
  }

  async listTDetalle() {
    const param = [];
    param.push(this.reemSelec.nIdGastoCosto);
    this.service.fnSctr(3, param, this.url).subscribe((value: Detalle[]) => {  
      
      this.listDetalleDS = new MatTableDataSource(value);
      this.listDetalleDS.paginator = this.listDetallePag;
      this.listDetalleDS.sort = this.listDetalleSor;
      if (value.length > 0) {
        this.detaSelec = value[0];
        this.detaSelec.nPrecio = this.detaSelec.nPrecio.replace(",", ".");
        this.reemFG.get('titulo').setValue(this.detaSelec.sTitulo);
        this.reemFG.get('precio').setValue(this.detaSelec.nPrecio);
        if(this.detaSelec.partida != ''){
          this.btnEnviar = false;
        }
        else{
          this.btnEnviar = true; 
        } 
        this.listTPartida();
      }


    });
  }

  async listTPartida() {
    const param = [];
    param.push(this.reemSelec.nIdGastoCosto);
    param.push(this.pais);
    param.push(this.detaSelec.nIdSucursal);
    param.push(this.detaSelec.nIdDepositario);
    this.service.fnSctr(5, param, this.url).subscribe((value: Partida[]) => {
      this.listPartida = value;//cboCiudad por Partida

      if (this.listPartida.length == 0) {
        Swal.fire('La Campaña no tiene partida, Solicite a su ejecutivo')
      } 
      /*this.reemFG.get('partida').setValue(this.detaSelec.nIdPartida);
      this.detaSelec.nIdPartida = this.detaSelec.nIdPartida;*/
    });
  }

  /****************************************BOTONES WEB************************************** */

  btnGrabarSin(conDetalle?: boolean) {
    if (conDetalle == true) {
      this.btnGrabar(2051, conDetalle);//estado Pendiente
    } else {
      this.btnGrabar(2051);//estado Pendiente
    }
  }

  async btnGrabar(estado?: number, conDetalle?: boolean) {


    if (this.validarDetalle() == false) {
      return;
    }
    this.grabar(estado);
  } 

  async grabar(estado: number) {
    let vReemFG = this.reemFG.value;
    const param = [];

    param.push(this.reemSelec.nIdGastoCosto);
    param.push(this.usuarioNivel.nCodUser);
    param.push(this.detaSelec.nIdGastoDet);
    param.push(this.detaSelec.nIdPartida);
    param.push(vReemFG.precio);
    param.push(vReemFG.titulo);
    param.push(estado);
    param.push(this.pais);

    this.service.fnSctr(101, param, this.url).subscribe(value => {
      if (value[0] == '01') {
        this.reemSelec.dFechaModifico = value[2];
        this.reemSelec.nEstado = estado + '';
        this.reemSelec.cEleNam = value[3];

        Swal.fire('Requerimiento grabado');
        this.listTDetalle();
        this.esEnviar();
        this.esGrabar();
        this.validarTodo();
      } else {
        Swal.fire('Error al Grabado') 
      }
    });
  }

  btnGrabarEnv() {
    if (this.usuarioNivel.aprobador) {
      this.btnGrabarEstado(2053, 2052);//estado Aprobado por operaciones
    } else {
      this.btnGrabarEstado(2052);//estado Enviado
    }
  }

  btnGrabarOperacionRechazo() {
    this.btnGrabarEstado(2095);
  }

  btnGrabarOperacionDevuelto() {
    this.btnGrabarEstado(2054);
  }

  btnGrabarOperacionAprovado() {
    this.btnGrabarEstado(2053);
  }

  async btnGrabarEstado(estado?: number, estado2?: number) {
    const param = [];
    let vReemFG = this.reemFG.value;

    if (this.validarDetalle() == false) {
      return;
    }

    if (estado == 2053) {//estado Aprobado Operaciones
      if (vReemFG.precio > Number(this.usuarioNivel.nMonto)) {
        Swal.fire('El requerimiento supera su importe máximo de aprobación');
        return;
      }
    }

    param.push(this.usuarioNivel.nCodUser);
    param.push(estado);
    param.push(this.reemSelec.nIdGastoCosto);
    param.push(this.pais)
    if (estado2 != null) {
      param.push(estado2);
    } 
    this.service.fnSctr(102, param, this.url).subscribe(value => {
      if (value[0] == '01') {
        if (estado = 2052) {
          this.reemSelec.dFechaEnvio = value[2];
        }
        if (estado2 != null) {
          this.reemSelec.dFechaEnvio = value[2];
        }
        this.reemSelec.nEstado = estado + '';
        this.reemSelec.cEleNam = value[3];
        this.esEnviar();
        this.esGrabar();
        this.validarTodo();
        Swal.fire('Requerimiento ha sido ' + this.reemSelec.cEleNam.toLowerCase());

      } else {
        Swal.fire('Error al actualizar estado ' + this.reemSelec.cEleNam); 
      }
    });
  }

  /*******************************VALIDACIONES BOTONES****************************** */

  validarTodo() {
    this.disableTitulo = this.validarTitulo();
    this.disableAprobaciones = this.validarAprobaciones();

  }

  validarTitulo() { //logica igual para ciudad, partida, botones detalle
    var disable: boolean = false;
    if (this.usuarioNivel.nCodPer + '' != this.reemSelec.nIdSolicitante) {//usuario distinto al solicitante
      disable = true;
      this.reemFG.disable();
    } else if (this.reemSelec.nEstado != '2051' && this.reemSelec.nEstado != '2054') {//estado distinto a pendiente o devuelto
      disable = true;
      this.reemFG.disable();
    }

    return disable;
  }

  validarAprobaciones() {
    var disable: boolean = false;
    if (this.reemSelec.nIdGastoCosto == 0) {//nuevo 
      disable = true;
    } else {
      if (this.reemSelec.nEstado == '2051') {//estado es pendiente 
        disable = true;
      }
    }
    return disable;
  }









  /******************************************************* */
  esCreador(): boolean {
    var res: boolean = true;
    return res;
  }

  esValidadorOperativo(): boolean {
    var res: boolean = false;
    if (this.usuarioNivel.nMonto != '' && this.reemSelec.nIdSolicitante != this.usuarioNivel.nCodPer + '') {
      res = true;
      this.reemFG.disable();
    }
    return res;
  }

  esEnviar() {
    var res: boolean = true;
    if (this.reemSelec.nIdSolicitante == this.usuarioNivel.nCodPer + '' && (this.reemSelec.nEstado == '2051' || this.reemSelec.nEstado == '2054')) {//PENDIENTE - DEVUELTO POR OPERACIONES
      res = false;

    }
    console.log('esEnviar: ' + res);
    this.hiddenEnviar = res;
  }

  esGrabar() {
    var res: boolean = true;
    if (this.reemSelec.nIdSolicitante == this.usuarioNivel.nCodPer + '' && (this.reemSelec.nEstado == '2051' || this.reemSelec.nEstado == '2054')) {//PENDIENTE - DEVUELTO POR OPERACIONES
      res = false;

    }
    console.log('esGrabar: ' + res);
    this.hiddenGrabar = res;
  }



  obtenerUsarioLogueado(): Usuario {
    var userObject = localStorage.getItem('currentUser');
    var logueado: Usuario = {
      id: (JSON.parse(window.atob(userObject.split('.')[1])).uid),
      nombre: (JSON.parse(window.atob(userObject.split('.')[1])).uno)
    };

    return logueado;
  }

  showAlert(data: string, titulo: string, duration: number) {
    this._snackBar.open(data, titulo, {
      duration: duration * 1000,
      verticalPosition: "top"
    });
  }

  btnCerrar() {
    this.dialogRef.close();
  }

  validarDetalle() {
    let vReemFG = this.reemFG.value;

    if (vReemFG.titulo == '') {
      Swal.fire('Título es requerimiento ')
      return false;
    }
    if (this.reemFG.invalid) {
      Swal.fire('El monto debe ser número')
      return false;
    }
    if (this.detaSelec.nIdPartida == null) {
      Swal.fire('Seleccione Partida')
      return false;
    }
    if (Number(vReemFG.precio) > Number(this.reemSelec.nReembolsable.replace(",", "."))) {
      Swal.fire('El total solicitado supera el reembolso establecido de S/.' + this.reemSelec.nReembolsable);
      return false;
    }
  }




  openDialogAprobacion() {
    const dialogRef = this.dialog.open(DialogAprobacionesComponent, {
      panelClass: 'myapp-no-padding-dialog',
      width: '100%',
      data: { nIdGastoCosto: this.reemSelec.nIdGastoCosto }
    });
  }

  async fnVerEstado(){ 
    let pParametro= [];
    pParametro.push(this.reemSelec.nIdGastoCosto); 
   
    await this.vSerEfectivo.fnEfectivo( 10, pParametro, this.url).then( (value: Estado[]) => {  
         
    const dialogRef = this.dialog.open(EstadoefectivoComponent, {
      width: '620px',
      data: value ,
    });
    
    dialogRef.afterClosed().subscribe(result => { 
      }); 
    }, error => {
      console.log(error); 
    });   
    
    
  }

}
