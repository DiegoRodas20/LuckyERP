import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SecurityErp } from 'src/app/modulos/AAHelpers/securityErp.Entity';
import { DialogData } from '../../../egy-humana/JefaturaATC/Model/IATC';
import { ListaEmpresa, ComboPais, ComboEmpresa, ListaUsuario, UsuarioEmpresa, ComboSysEle, ListaNivel } from '../interface';
import { UsuarioService } from '../usuario.service';
import { UsuarioRepository } from '../repostitory/usuario.repository';
import { EmpresaEntity } from '../models/empresa.Entity';
import { PersonalEntity } from '../models/personal.Entity';
import { Observable } from 'rxjs';
import { debounceTime, startWith, map } from 'rxjs/operators';
import { RepostitoryService } from '../services/repository.Service';
import { RepositoryEnum } from '../repostitory/repositoryEnum';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['../usuario.component.css']
})
export class DialogComponent implements OnInit {
  @ViewChild(MatPaginator) nivelPag: MatPaginator;
  @ViewChild(MatSort) nivelSor: MatSort;
  url: string;
  comboPais = new Array<ComboPais>();
  comboEmpresa = new Array<ComboEmpresa>();
  comboSysEle = new Array<ComboSysEle>();
  empresas = new Array<ListaEmpresa>();
  UsuarioFG: FormGroup;
  NivelFG: FormGroup;
  nivelDC: string[] = ['cUser', 'sRazonSocial', 'cEntNamFirst', 'cEleNam', 'colEliminar'];
  nivelDS: MatTableDataSource<ListaNivel>;
  usuarioEmpresa = new UsuarioEmpresa(); //se recogeran los id de usuario, empresa, usuarioempresa, 
  UsuarioSelecc: DialogData;//se capturar usuario seleccionado

  // Inicio de Modificacion
  securityErp = new SecurityErp;
  usuarioRepository = new UsuarioRepository;
  empresaList = new EmpresaEntity;
  personalList: PersonalEntity[];
  listaPersonal = new Observable<any>();
  lCboPersonal = [];
  value: any;

  constructor(public dialogRef: MatDialogRef<DialogComponent>,
    public service: UsuarioService, @Inject('BASE_URL') baseUrl: string,
    private fb: FormBuilder, private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private repostitoryService: RepostitoryService) {

    // Inicio Modificado
    setTimeout(() => {
      this.UsuarioFG.controls.cUser.valueChanges
        .pipe(
          debounceTime(500)
        )
        .subscribe(value => {
          this.usuarioRepository.sUsuario = value;
          if (this.usuarioRepository.sUsuario == undefined || this.usuarioRepository.sUsuario == null)
            return;
          else
            this.getNombreUsuario();
        });
      this.getEmpresaPersonalVinculada();
    }, 2000);
    //FinModificado

    this.url = baseUrl;
    this.UsuarioSelecc = data;
    this.listaNivel(+(data["nCodUser"] + ""));//listar en blanco
    this.cboPais();
    this.cboSysEle();
    this.usuarioEmpresa.nCodUser = +(data["nCodUser"] + "");//capturar id enviado desde pagina padre
    //Modificado
    this.usuarioRepository.sPais = this.securityErp.getPais();
  }

  ngOnInit(): void {
    this.UsuarioFG = this.fb.group({
      cUser: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      txtPersonal: ['', Validators.required],
    });
    this.capturarUsuarioSelec(this.UsuarioSelecc);
    this.NivelFG = this.fb.group({
      empresa: ['', Validators.required],
      nivel: ['', Validators.required],
    });

    //Modificado
    this.getEmpresas();
  }

  //Modificado
  async btnGuardar() {
    const param = [];
    var accion: number;
    var mensaje: string;
    let vUsuarioFG = this.UsuarioFG.value;

    if (this.UsuarioFG.invalid) {
      this.showAlert('Datos faltantes o mal formato de Correo', "Alerta", 5);
      return;
    }

    param.push(vUsuarioFG.cUser);//param.push('admin test');
    param.push(vUsuarioFG.email);//param.push('test@bbox.com.pe');
    param.push(vUsuarioFG.password);//param.push('12345678');

    //Modificado
    param.push(this.usuarioRepository.nPersonal)
    param.push(this.securityErp.getUsuarioId());


    if (this.usuarioEmpresa.nCodUser == 0) {
      accion = 1;
      mensaje = 'Usuario Agregado'
      param.push(589);//dato generado por default para columna status_Mod
    } else {
      accion = 2
      mensaje = 'Usuario Actualizado'
      param.push(this.UsuarioSelecc['status_Mod']);//dato capturado para columna status_Mod
      param.push(this.usuarioEmpresa.nCodUser)//5to parametro, requerido para update
    }

    this.service.fnUsuario(accion, param, this.url).subscribe(data => {//retorna array ["01","@codigo"]
      if (data[0] == '01') {
        this.usuarioEmpresa.nCodUser = data[1];
        this.showAlert(mensaje, "Completado", 5);
        this.isNew();
      }
      else {
        this.showAlert(data, "Error", 5); 
      }
    }, err => {
      console.log(err)
    });
  }

  //Boton Agregar Perfil, => cuando es nuevo.
  async btnAgregar() {
    const param = [];
    let vNivelFG = this.NivelFG.value;

    if (this.NivelFG.invalid) {
      this.showAlert('Seleccione Empresa y Privilegio', "Alerta", 5);
      return;
    }
    this.usuarioEmpresa.nIdEmp = vNivelFG.empresa

    param.push(this.usuarioEmpresa.nCodUser);//parametro nCodUser de usuario insertado o seleccionado
    param.push(this.usuarioEmpresa.nIdEmp);// parametro @pNIdEmp desde <select>
    param.push(1);

    this.service.fnUsuario(6, param, this.url).subscribe(data => {//retorna array ["01","@codigo"]
      if (data[0] == '01') {
        this.usuarioEmpresa.nIdEmpUser = data[1];
        this.agregarNivel();
      }
      else {
        this.showAlert(data, "Error", 5); 
      }
    }, err => {
      console.log(err)
    });
  }

  async agregarNivel() {
    const param = [];
    let vNivelFG = this.NivelFG.value;

    param.push(this.usuarioEmpresa.nIdEmpUser);//parametro nIdEmpUser de EmpUsu insertado o seleccionado
    param.push(vNivelFG.nivel);// parametro @pNIdEmp desde <nivel>
    param.push(1);

    this.service.fnUsuario(8, param, this.url).subscribe(data => {//retorna array ["01","@codigo"]
      if (data[0] == '01') {
        this.showAlert(data[1], "Completado", 5);
        this.listaNivel(this.usuarioEmpresa.nCodUser);
      }
      else {
        this.showAlert(data, "Error", 5); 
      }
    }, err => {
      console.log(err)
    });
  }

  async listaNivel(nCodUser: number) {
    const param = [];
    param.push(nCodUser);
    param.push(1);//estado 1
    this.service.fnUsuario(9, param, this.url).subscribe((value: ListaNivel[]) => {
      this.nivelDS = new MatTableDataSource(value);
      this.nivelDS.paginator = this.nivelPag;
      this.nivelDS.sort = this.nivelSor;
    });
  }

  async btnEliminar(nIdNivel: number) {
    const param = [];
    param.push(nIdNivel);
    param.push(0);//estado 0
    this.service.fnUsuario(10, param, this.url).subscribe(data => {//retorna array ["01","@codigo"]
      if (data[0] == '01') {
        this.showAlert('Privilegio Eliminado', "Completado", 5);
        this.listaNivel(this.usuarioEmpresa.nCodUser);
      }
      else {
        this.showAlert(data, "Error", 5); 
      }
    }, err => {
      console.log(err)
    });
  }

  async cboPais() {
    const param = [];
    this.service.fnUsuario(4, param, this.url).subscribe((value: ComboPais[]) => {
      this.comboPais = value;
    });
  }

  async cboSysEle() {
    const param = [];
    this.service.fnUsuario(7, param, this.url).subscribe((value: ComboSysEle[]) => {
      this.comboSysEle = value;
    });
  }

  async cboEmpresa(sIdPais: number) {
    const param = [];
    this.NivelFG = this.fb.group({
      empresa: ['', Validators.required],
      nivel: ['', Validators.required],
    });
    let vNivelFG = this.NivelFG.value;
    param.push(sIdPais);

    this.service.fnUsuario(5, param, this.url).subscribe((value: ComboEmpresa[]) => {

      //vNivelFG.get('empresa').setValue('');
      this.comboEmpresa = value;
      //vNivelFG.get('empresa').setValue('');
    });
  }

  /************************** metodos sin usar backend **************************/
  showAlert(data: string, titulo: string, duration: number) {
    this._snackBar.open(data, titulo, {
      duration: duration * 1000,
      verticalPosition: "top"
    });
  }

  btnCerrar() {
    this.dialogRef.close();
  }

  capturarUsuarioSelec(data: DialogData) {
    if (data["nCodUser"] != 0) {
      this.UsuarioFG.get('cUser').setValue(data["cUser"]);
      this.UsuarioFG.get('email').setValue(data["email"]);
      this.UsuarioFG.get('password').setValue(data["cPassword"]);

      //Modificado.
      this.consultaEmpleadoEditar(data["nIdPersonal"]);

    }
  }

  isNew(): boolean {

    //if (this.UsuarioSelecc['nCodUser'] == 0) {
    if (this.usuarioEmpresa.nCodUser == 0) {
      return true;
    } else {
      return false;
    }
  }


  // InicioModificacion
  async getEmpresaPersonalVinculada() {
    this.value = await this.repostitoryService.GetAllPersonal(RepositoryEnum.ConsultaPersonal, this.usuarioRepository.ConsultaPersonal()).toPromise();
    this.lCboPersonal = this.value;
    this.listaPersonal = this.UsuarioFG.get("txtPersonal").valueChanges
      .pipe(
        startWith(''),
        map(cli => cli ? this._filterPersonal(cli) : this.lCboPersonal.slice())
      );
  }

  private _filterPersonal(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.lCboPersonal.filter(
      cli => cli.sPersonal.toLowerCase().includes(filterValue) //=== 0      
    );
  }

  getNombreUsuario() {
    this.repostitoryService.GetByUser(RepositoryEnum.ConsultaUsuario, this.usuarioRepository.ConsultaUsuario()).subscribe(res => { this.usuarioRepository.sUsuarioValidado = res[0].result });
  }

  getIdEmpleado($event) {
    const posicion = this.value.filter(x => x.sPersonal === $event.option.value)
    this.usuarioRepository.nPersonal = posicion[0].nIdPersonal;
  }

  getEmpresas() { this.repostitoryService.GetAllEmpresa(RepositoryEnum.ConsultaEmpresa, this.usuarioRepository.ConsultaEmpresa()).subscribe(res => { this.empresaList.sRazonSocial = res[0].sRazonSocial }) }

  async consultaEmpleadoEditar(id: number) {

    this.value = await this.repostitoryService.GetAllPersonal(RepositoryEnum.ConsultaPersonal, this.usuarioRepository.ConsultaPersonal()).toPromise();
    this.usuarioRepository.nPersonal = id;
    const posicion = this.value.filter(x => x.nIdPersonal == id)
    this.usuarioRepository.sPersonal = posicion[0].sPersonal;
    this.UsuarioFG.get('txtPersonal').setValue(this.usuarioRepository.sPersonal);

  }

}


