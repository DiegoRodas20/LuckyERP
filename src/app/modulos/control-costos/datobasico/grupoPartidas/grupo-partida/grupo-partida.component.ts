import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { asistenciapAnimations } from '../../../../comercial/Asistencia/asistenciap/asistenciap.animations';
// Componentes e Interfaces
import { ParametroProcedureInterface } from '../../interfaces/parametroProcedure';
import { ParametroService } from '../../parametro.service';
import { DialogComponent } from '../dialog.component';


@Component({
  selector: 'app-grupo-partida',
  templateUrl: './grupo-partida.component.html',
  styleUrls: ['./grupo-partida.component.css'],
  animations: [asistenciapAnimations]
})
export class GrupoPartidaComponent implements OnInit {
  listaItems: any;
  listaInicial: any;
  cabecera: any;
  tsLista = 'active'; 
  fbLista = [
    {icon: 'save', tool: 'Guardar'},
    {icon: 'close', tool: 'Cancelar'},
    {icon: 'check_circle', tool: 'Activar'},
    {icon: 'exit_to_app', tool: 'Salir'},
  ];
  abLista = [];
  nombreGrupo: any;
  pais: any;
  nombreGrupoPartida: string;
  tipoGrupoPartida: string = '';
  count = 0 ;
  listaItemsEliminados: any[] = [];
  idEmp: any;
  idUser: any;
  estado: number;
  constructor(private route: Router,
              private cdRef: ChangeDetectorRef,
              public dialog: MatDialog,
              private ruta: ActivatedRoute,
              private controlcostoService: ParametroService, 
              private spinner: NgxSpinnerService) { }

  async ngOnInit() {
    await this.iniciarVista();
  }

  async iniciarVista() {
    this.pais = localStorage.getItem('Pais');
    this.idEmp  = localStorage.getItem('Empresa');
    let user    = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid; 
    let model: ParametroProcedureInterface;
    const parametros = `|${this.pais}|${this.ruta.snapshot.params.id}|`;
    model = {
      pEntidad: 1,
      pOpcion: 2,
      pParametro: parametros.toString(),
      pTipo: 2,
      pParametroDet: ''
    };
    //Modelo 2
   
    let model2: ParametroProcedureInterface;
    const parametros2 = `${this.pais}|${this.idUser}|${this.idEmp}|`;
    model2 = {
      pEntidad: 1,
      pOpcion: 1,
      pParametro: parametros2.toString(),
      pTipo: 2,
      pParametroDet: ''
    };
    this.spinner.show();
    this.cabecera = await this.controlcostoService.listarPartidasGenericas(model2);
    this.cabecera = this.cabecera.filter(data => data.idTipEle == this.ruta.snapshot.params.id );
    this.listaItems = await this.controlcostoService.listarItemsPartidaGenericaById(model);
    this.listaInicial = this.listaItems;
    this.estado = this.cabecera[0].estado;
    this.nombreGrupoPartida = this.cabecera[0].descripcion;
    this.tipoGrupoPartida = this.cabecera[0].cEleNam;
    this.onToggleFab(1,-1);
    this.spinner.hide();
  }

  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }

  anadirPartidaDetalle() {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      height: '350px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if ( result ) {
        const listaVerificarInicial = this.listaInicial.filter(item => item.nParam === result.hijo.idTipEle);
        if(listaVerificarInicial.length > 0) {
          return Swal.fire({
            title:'Esta partida ya se encuentra registrada',
            icon: 'warning',
            timer: 1500
          });
        }
        const listaVerificar = this.listaItems.filter(item => item.idTipEle === result.hijo.idTipEle);
        if(listaVerificar.length > 0) {
          return Swal.fire({
            title:'Esta partida ya se encuentra registrada',
            icon: 'warning',
            timer: 1500
          });
        }
        this.listaInicial = this.listaInicial.filter(item => item.idTipEle !== result.hijo.idTipEle);
        this.listaItems.push(result.hijo);
        this.cdRef.reattach();
      }
    });
    this.cdRef.reattach();
  }

  addItemsTable(event) {
    if(event === 2 || event == 1) {
      this.anadirPartidaDetalle();
    }
  }

  obtenerNombre(event) {
    this.nombreGrupoPartida = event;
  }

  async cancelar() {
    await this.iniciarVista();
  }

  async editarGrupo() {
    const descripcion = this.nombreGrupoPartida;
    let model: ParametroProcedureInterface;
    const parametros = `${this.ruta.snapshot.params.id}|${this.pais}|||${descripcion}`;
    if ( descripcion === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Alerta',
        text: 'El campo de descripción no puede estar vacío'
      });
      return;
    }
    const detalle = this.generarDetallePartida();
    model = {
      pEntidad: 1,
      pOpcion: 3, // Update
      pParametro: parametros.toString(),
      pTipo: 0,
      pParametroDet: detalle
    };
    const resp = await this.controlcostoService.insertarGrupoPartida(model);
    Swal.fire({
      icon: 'success',
      title: 'Actualización exitosa',
      text: '',
      timer: 2000
    });
    this.salir();
  }

  generarDetallePartida(): string {
    let resp = '';
    this.listaItems.forEach( (data) => {
      const value = this.listaItemsEliminados.find(element => element === data.idTipEle);
      if( value !== undefined ) { // Existe un valor dentro de los elementos de los elementos eliminados y se coloca 1 al final
        resp += `${data.descripcion}|${this.pais}|${data.sCode}|${data.idTipEle}|1/`;
      } else {
        resp += `${data.descripcion}|${this.pais}|${data.sCode}|${data.idTipEle}|0/`;
      }
    });
    return resp.substring(0, resp.length - 1);
  }

  eliminarPartidaDetalle(event) {
    // Esto me trae el modelo completo
    // Si está en la lista inicial  lo mandamos a los elementos a eliminar para la bd
    const inicial = this.listaInicial.find(element => element.idTipEle === event);
    if (inicial) {
      const value = this.listaItemsEliminados.find(element => element === event);
      if ( value === undefined ) {
        this.listaItemsEliminados.push(event);
      }
    } else {
      this.listaItems = this.listaItems.filter(element => element.idTipEle !== event );
    }
  }

  async activarPartida() {
    if(this.estado === 1) {
      return Swal.fire({
        icon: 'warning',
        title: 'La partida ya se encuentra activada',
        showConfirmButton: false,
        timer: 1500
      });
    }
    let model: ParametroProcedureInterface;
    const parametros = `${this.ruta.snapshot.params.id}|1`;
    model = {
      pEntidad: 1,
      pOpcion: 6,
      pParametro: parametros.toString(),
      pTipo: 1,
      pParametroDet: ''
    };
    const resp = await this.controlcostoService.listarPartidasGenericas(model);
    await Swal.fire({
      icon: 'success',
      title: 'La partida se activó satisfactoriamente',
      showConfirmButton: false,
      timer: 1500
    });
  }

  salir() {
    this.route.navigateByUrl( `controlcostos/datobasico/grupoPartidas` );
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.editarGrupo();
        break;
      case 1:
        this.cancelar();
        break;
      case 2:
        this.activarPartida();
        break;
      case 3:
        this.salir();
        break;
      default:
        break;
    }
  }

}
