import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ComboPais, ComboEmpresa, ComboSysEle } from '../../usuario/interface';
import { SecurityErp } from '../../../AAHelpers/securityErp.Entity';
import { UsuarioRepository } from '../../usuario/repostitory/usuario.repository';
import { UsuarioService } from '../../usuario/usuario.service';
import { RepositoryUtilitarios } from '../../../comercial/Asistencia/tareo-staff/repository/repositoryUtilitarios';
import { asistenciapAnimations } from '../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import { TareoStaffService } from '../../../comercial/Asistencia/tareo-staff/services/tareostaff.service';
import { ListaModulo } from '../models/interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RepostitoryPerfilService } from '../services/repository.Service';
import { Observable, pipe, Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { startWith, map } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-perfil-add',
  templateUrl: './perfil-add.component.html',
  styleUrls: ['./perfil-add.component.css'],
  animations: [asistenciapAnimations]
})
export class PerfilAddComponent implements OnInit, OnDestroy {
  comboPais = new Array<ComboPais>();
  comboEmpresa = new Array<ComboEmpresa>();
  comboSysEle = new Array<ComboSysEle>();
  securityErp = new SecurityErp;
  usuarioRepository = new UsuarioRepository;
  repositoryUtilitarios = new RepositoryUtilitarios;

  // variable Modulos => Inicio
  typeModProyecto = 1717; // typeMod Proyecto
  typeModModulo = 1718; // typeMod Modulo
  typeModVista = 1719; // typeMod Vista
  typeModSubVista = 1720; // typeMod SubVista

  // usuarioData: DialogData;
  moduloProyectoDS: MatTableDataSource<ListaModulo>;
  moduloModuloDS: MatTableDataSource<ListaModulo>;
  moduloVistaDS: MatTableDataSource<ListaModulo>;
  moduloSubVistaDS: MatTableDataSource<ListaModulo>;
  moduloDC: string[] = ['nameMod'];
  ruta: string[] = ['', '', '', ''];

  value: boolean = false;
  mensajeBoton: string = "Consultar";
  subRef$: Subscription;
  lCboPerfil = [];
  txtPerfil = new FormControl();
  listaPerfil = new Observable<any>();
  valueEmpresa: any;
  // variable Modulos => Fin
  constructor(
    public service: UsuarioService, @Inject('BASE_URL') baseUrl: string,
    private repostitoryPerfilService: RepostitoryPerfilService,
    private tareoStaffService: TareoStaffService, private _snackBar: MatSnackBar,
    private spinner: NgxSpinnerService,
    private router: Router,
  ) {
    this.securityErp.baseUrl = baseUrl;
  }

  ngOnInit(): void {
    this.usuarioSolicitante();
    this.usuarioRepository.sPais = this.securityErp.getPais();
    this.usuarioRepository.sUsuario = this.securityErp.getUsuarioId();
    this.cboPais();
    this.usuarioRepository.nidEmpresa = 0;
    this.usuarioRepository.sPais = "";
    this.usuarioRepository.nPrivilegio = 0;

    
  }

  async cboPais() {
    const param = [];
    this.subRef$ = this.service.fnUsuario(4, param, this.securityErp.baseUrl).subscribe((value: ComboPais[]) => {
      this.comboPais = value;
    });
    this.usuarioRepository.limpiarMensaje();
  }

  async cboEmpresa(event) {
    const param = [];
    param.push(event.value);//id del pais.    
    this.usuarioRepository.sPais = event.value;
    this.subRef$ = this.service.fnUsuario(5, param, this.securityErp.baseUrl).subscribe((value: ComboEmpresa[]) => {
      this.comboEmpresa = value;
    });
    this.usuarioRepository.limpiarMensaje();
  }

  async cboPrivilegio(event) {
    this.usuarioRepository.nidEmpresa = event.value;
    this.getBuscaPerfil();
    const param = [];
    this.subRef$ = this.service.fnUsuario(7, param, this.securityErp.baseUrl).subscribe((value: ComboSysEle[]) => {
      this.comboSysEle = value;
    });
    this.usuarioRepository.limpiarMensaje();
  }

  async cboPrivilegioId(event) {
    this.usuarioRepository.nPrivilegio = event.value;
    this.usuarioRepository.limpiarMensaje();
  }

  usuarioSolicitante() {
    const params = []
    params.push(this.securityErp.getEmpresa());
    params.push(this.securityErp.getUsuarioId());
    this.subRef$ = this.tareoStaffService.fnTareoStaffService(8, params, this.securityErp.baseUrl).subscribe(res => { this.securityErp.sysUsuario = res[0]["sNombres"] });
  }
  // Modulo =>Inicio

  async listaModulo(typeMod: number, DadMod?: number) {
    var opcion: number;
    const param = [];
    param.push(typeMod);
    // param.push(1);//status_Mod 1

    if (typeMod == this.typeModProyecto) {
      opcion = 28;
      param.push(this.usuarioRepository.sPais)
      param.push(this.usuarioRepository.nidEmpresa)
      param.push(this.usuarioRepository.nPrivilegio);

    } else {
      opcion = 29;
      param.push(DadMod);//status_Mod 1
      param.push(this.usuarioRepository.sPais)
      param.push(this.usuarioRepository.nidEmpresa)
      param.push(this.usuarioRepository.nPrivilegio);
    }
    //param.push(this.usuarioData["nIdEmpUser"]);

    this.subRef$ = this.repostitoryPerfilService.GetAllModulo(opcion, param).subscribe((value: ListaModulo[]) => {
      //console.log(value[0].asignado);
      if (typeMod == this.typeModProyecto) {
        this.moduloProyectoDS = new MatTableDataSource(value);
        this.moduloModuloDS = new MatTableDataSource();
        this.moduloVistaDS = new MatTableDataSource();
        this.moduloSubVistaDS = new MatTableDataSource();

      } else if (typeMod == this.typeModModulo) {
        this.moduloModuloDS = new MatTableDataSource(value);
        this.moduloVistaDS = new MatTableDataSource();
        this.moduloSubVistaDS = new MatTableDataSource();

      } else if (typeMod == this.typeModVista) {
        this.moduloVistaDS = new MatTableDataSource(value);
        this.moduloSubVistaDS = new MatTableDataSource();

      } else if (typeMod == this.typeModSubVista) {
        this.moduloSubVistaDS = new MatTableDataSource(value);
      }
    });
  }

  async chkGrabar(modulo: ListaModulo) {
    if (modulo.asignado)
      this.usuarioRepository.estado = true;
    else
      this.usuarioRepository.estado = false
    this.usuarioRepository.nIdModulo = modulo.idMod
    this.grabarPerfil();
  }

  async grabarPerfil() {
    this.subRef$ = this.repostitoryPerfilService.savePerfil(30, this.usuarioRepository.grabarPerfil()).subscribe(
      res => {
        this.showAlert(res[0].result, "Completado", 5);
      });
  }

  /************************************** */
  btnlistarModulo(lista: ListaModulo) {
    this.listaModulo(this.typeModModulo, lista.idMod);

    this.ruta[0] = '/' + lista.url_mod;
    this.ruta[1] = '';
    this.ruta[2] = '';
    this.ruta[3] = '';
    this.listarRuta();
  }
  btnlistarVista(lista: ListaModulo) {
    this.listaModulo(this.typeModVista, lista.idMod);

    this.ruta[1] = '/' + lista.url_mod;
    this.ruta[2] = '';
    this.ruta[3] = '';
    this.listarRuta();
  }
  btnlistarSubVista(lista: ListaModulo) {
    this.listaModulo(this.typeModSubVista, lista.idMod);
    this.ruta[2] = '/' + lista.url_mod;
    this.ruta[3] = '';
    this.listarRuta();
  }
  mouseOverSubVista(lista: ListaModulo) {
    this.ruta[3] = '/' + lista.url_mod;
    this.listarRuta();
  }

  listarRuta(): string {
    var rutaFinal: string;
    rutaFinal = '';
    for (var r of this.ruta) {
      rutaFinal = rutaFinal + r;
    }
    return rutaFinal;
  }


  showAlert(data: string, titulo: string, duration: number) {
    this._snackBar.open(data, titulo, {
      duration: duration * 1000,
      verticalPosition: "top"
    });
  }



  async getBuscaPerfil() {
    let param = [];
    this.valueEmpresa = await this.service.fnUsuario(7, param, this.securityErp.baseUrl).toPromise()
    this.lCboPerfil = this.valueEmpresa;
    this.listaPerfil = this.txtPerfil.valueChanges
      .pipe(
        startWith(''),
        map(cli => cli ? this._filterPersonal(cli) : this.lCboPerfil.slice())
      );
  }

  private _filterPersonal(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.lCboPerfil.filter(
      cli => cli.cEleNam.toLowerCase().includes(filterValue) //=== 0      
    );
  }


  getIdPerfil($event) {
    const posicion = this.valueEmpresa.filter(x => x.cEleNam === $event.option.value)
    this.usuarioRepository.nPrivilegio = posicion[0].nEleCod;
  }


  ngOnDestroy() {
    if (this.subRef$) {
      this.subRef$.unsubscribe();
    }
  }

  consultaModulos() {
    if (this.usuarioRepository.sPais == "") {
      this.usuarioRepository.mensajeValidacionPais = "Seleccione el Pais";
      return;
    }
    else
      this.usuarioRepository.limpiarMensaje();

    if (this.usuarioRepository.nidEmpresa <= 0) {
      this.usuarioRepository.mensajeValidacionEmpresa = "Seleccione una Empresa";
      return;
    }
    else
      this.usuarioRepository.limpiarMensaje();

    if (this.usuarioRepository.nPrivilegio <= 0) {
      this.usuarioRepository.mensajeValidacionPerfil = "Seleccione el perfil";
      return;
    }
    else
      this.spinner.show();
    this.listaModulo(this.typeModProyecto);
    this.value = true;
    this.usuarioRepository.limpiarMensaje();
    this.mensajeBoton = "Nueva Consulta";
    this.spinner.hide();

  }

  nuevaConsulta() {
    this.spinner.show();
    this.mensajeBoton = "Consultar"
    window.location.reload();
    this.ngOnDestroy();
    this.value = false;
    this.spinner.hide();
  }

  validaBotonConsulta() {
    this.value ? this.nuevaConsulta() : this.consultaModulos();
  }

  salir() {
      // this.router.navigate(['/comercial/asistencia/tareo-list']);    
      this.router.navigate(["/inicio"]);
    }
  }






