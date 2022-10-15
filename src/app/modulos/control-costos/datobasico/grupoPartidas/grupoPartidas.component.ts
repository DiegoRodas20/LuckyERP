import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { asistenciapAnimations } from '../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import { ParametroProcedureInterface } from '../interfaces/parametroProcedure';
import { ParametroService } from '../parametro.service';
import { DialogComponent } from './dialog.component';
@Component({
  selector: 'app-grupoPartidas',
  templateUrl: './grupoPartidas.component.html',
  styleUrls: ['./grupoPartidas.component.css'],
  animations: [asistenciapAnimations]
})
export class GrupoPartidasComponent implements OnInit {
  listaItems: any;
  listaItemsEliminados: any[];
  listaGrupoPartida: any;
  listaTipoGrupoPartida: any;
  form: FormGroup;
  listar = true;
  listaPartidaDetalle: any[];
  pais: any;
  animal: string;
  name: string;
  nombreGrupoPartida: string;
  abLista = [];
  tsLista = 'inactive'; 
  fbLista = [
    {icon: 'save', tool: 'Crear'}
  ];
  idEmp: any;
  idUser: any;


  constructor(private fb: FormBuilder,
              private ruta: ActivatedRoute,
              private router: Router,
              private controlcostoService: ParametroService,
              public dialog: MatDialog, private cdRef: ChangeDetectorRef, private spinner: NgxSpinnerService) { 
                this.listaPartidaDetalle = [];
                this.crearFormulario();
              }

  async ngOnInit() {
    this.pais = localStorage.getItem('Pais');
    this.idEmp  = localStorage.getItem('Empresa');
    let user    = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid; 
    let model: ParametroProcedureInterface;
    let modelTipoPartida: ParametroProcedureInterface;
    const parametros = `${this.pais}|${this.idUser}|${this.idEmp}`;
    model = {
      pEntidad: 1,
      pOpcion: 1,
      pParametro: parametros.toString(),
      pTipo: 2,
      pParametroDet: ''
    };
    // Lista grupo tipo partida
    this.spinner.show();
    modelTipoPartida = {
      pEntidad: 1,
      pOpcion: 5,
      pParametro: `${this.idUser}|${this.idEmp}`,
      pTipo: 2,
      pParametroDet: ''
    };
    this.listaItems = await this.controlcostoService.listarPartidasGenericas(model);
    this.listaTipoGrupoPartida = await this.controlcostoService.listarPartidasGenericas(modelTipoPartida
      );
    this.onToggleFab(1, -1);
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
        this.listaPartidaDetalle.push(result.hijo);
        this.cdRef.reattach();
      }
    });
    this.cdRef.reattach();
  }

  crearFormulario() {
    this.form = this.fb.group({
      descripcion: ['', Validators.required],
      tipo: ['', Validators.required]
    });
  }

  agregarGrupoPartida() {
    this.listar = false;
    // this.router.navigateByUrl( `controlcostos/parametro/grupoPartidas` );
  }

  eliminarPartidaDetalle(event) {
    this.listaPartidaDetalle = this.listaPartidaDetalle.filter(item => item.idTipEle !== event);
  }

  

  addButtonActionTable(event) {
    if (event === 1) {
      this.anadirPartidaDetalle();
    } else if (event === 2) {
      // No se hace nada
    } else {
      this.agregarGrupoPartida();
    }
  }

  obtenerNombre(event) {
    this.nombreGrupoPartida = event;
  }

  cancelar() {
    this.listar = true;
    this.listaPartidaDetalle = [];
    this.form.reset({
      'descripcion': '',
      'tipo': ''
    });
    // this.cdRef.reattach();
    // window.location.reload();
    // this.listar = true;
  }

  async crearGrupo() {
    const descripcion = this.nombreGrupoPartida;
    const tipoPartida = this.form.get('tipo').value;
    if ( descripcion === undefined) {
      Swal.fire({
        icon: 'warning',
        title: 'Alerta',
        text: 'El campo de descripción no puede estar vacío'
      });
      return ;
    } else if ( this.listaPartidaDetalle.length === 0  ) {
      Swal.fire({
        icon: 'warning',
        title: 'Alerta',
        text: 'Usted no ha agregado ninguna partida, por favor ingrese mínimo una'
      });
      return ;
    } else if ( tipoPartida === '' || tipoPartida === undefined ) {
      Swal.fire({
        icon: 'warning',
        title: 'Alerta',
        text: 'Usted no ha agregado ningun tipo de grupo de partida, elija el tipo por favor'
      });
      return ;
    }
    let model: ParametroProcedureInterface;
    const parametros = `|${this.pais}|||${descripcion}|${tipoPartida}`;
    const detalle = this.generarDetallePartida();
    model = {
      pEntidad: 1,
      pOpcion: 4,
      pParametro: parametros.toString(),
      pTipo: 0,
      pParametroDet: detalle
    };
    this.spinner.show();
    const resp = await this.controlcostoService.insertarGrupoPartida(model);
    this.listaItems.push({
      cEleNam: tipoPartida,
      descripcion: descripcion,
      estado: 1,
      idDadTipEle: 521,
      idPais: this.pais,
      idTipEle: resp,
      listaDetalle: null,
      nParam: -1,
      sCode: ""
    });
    this.spinner.hide();
    await Swal.fire({
      icon: 'success',
      title: 'El grupo se creó correctamente',
      showConfirmButton: false,
      timer: 1500
    });
    this.cancelar();
  }

  generarDetallePartida(): string {
    let resp = '';
    this.listaPartidaDetalle.forEach( (data) => {
      resp += `${data.descripcion}|${this.pais}|${data.sCode}|${data.idTipEle}/`;
    });
    return resp.substring(0, resp.length - 1);
  }
}