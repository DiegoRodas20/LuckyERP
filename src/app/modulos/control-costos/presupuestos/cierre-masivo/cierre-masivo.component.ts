import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
//import { SergeneralService } from '../../../../servicio/sergeneral.service';
import Swal from 'sweetalert2';
import { PresupuestosService } from '../presupuestos.service';

export interface PresCierre {
  nIdCC: number;
  sCodCC: string;
  sDesc: string;
  sRUC: string;
  sCliente: string;
  sServicio: string;
  sEjecutivo: string;
  sDirector: string;
}

export interface PresCierreExport {
  Codigo: string;
  Descripcion: string;
  RUC_Cliente: string;
  Cliente: string;
  Servicio: string;
  Ejecutivo_1: string;
  Director_General: string;
}

@Component({
  selector: 'app-cierre-masivo',
  templateUrl: './cierre-masivo.component.html',
  styleUrls: ['./cierre-masivo.component.css']
})
export class CierreMasivoComponent implements OnInit {

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  nValor = 0;
  nPorcentaje = 0;
  lPres: PresCierre[] = [];

  lAnios = [];
  lMes = [
    { nCod: 1, sDesc: 'Enero' },
    { nCod: 2, sDesc: 'Febrero' },
    { nCod: 3, sDesc: 'Marzo' },
    { nCod: 4, sDesc: 'Abril' },
    { nCod: 5, sDesc: 'Mayo' },
    { nCod: 6, sDesc: 'Junio' },
    { nCod: 7, sDesc: 'Julio' },
    { nCod: 8, sDesc: 'Agosto' },
    { nCod: 9, sDesc: 'Septiembre' },
    { nCod: 10, sDesc: 'Octubre' },
    { nCod: 11, sDesc: 'Noviembre' },
    { nCod: 12, sDesc: 'Diciembre' },

  ]
  cboAnio = new FormControl();
  cboMes = new FormControl();

  nPorcentajeFacturacion = 0;
  nTieneParametro = 0;

  mesAnterior;
  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vPreService: PresupuestosService,
    private cdr: ChangeDetectorRef,

    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; }

  ngOnInit(): void {

    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');
    moment.locale('es');

    this.lAnios.push(Number(new Date().getFullYear()) - 1);
    this.lAnios.push(Number(new Date().getFullYear()));

    this.fnListarPorcentajeFacturacion();
    this.fnMesAnterior();
  }

  fnListarCC() {
    this.spinner.show();

    var pEntidad = 1; //Cabecera del centro de costo 
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.idEmp);
    pParametro.push(this.cboMes.value);
    pParametro.push(this.cboAnio.value);


    this.vPreService.fnCierreMasivo(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lPres = res;
        if (this.lPres.length == 0) {
          Swal.fire('Advertencia!', 'No se encontraron registros en el mes seleccionado.', 'warning');
        } else {
          Swal.fire('Información', 'Se encontraron ' + this.lPres.length + ' registros.', 'info');
        }
      },
      err => {
        this.spinner.hide();
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  async fnListarPorcentajeFacturacion() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;

    pParametro.push(this.idEmp);

    try {
      const { nTieneParametro, nPorcenFacturado } = await this.vPreService.fnCierreMasivo(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise();
      if (nTieneParametro == 0) {
        Swal.fire('Advertencia!', 'La empresa actual no tiene parametro de porcentaje facturación.', 'warning');
      }
      this.nPorcentajeFacturacion = nPorcenFacturado;
      this.nTieneParametro = nTieneParametro;
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnActualizarCC() {

    if (this.lPres.length == 0) {
      Swal.fire('Advertencia!', 'No se encontraron registros en el mes seleccionado.', 'warning');
      return;
    }

    var resp = await Swal.fire({
      title: '¿Desea continuar?',
      html: `Se actualizará el estado de los presupuestos clientes facturados al ${this.nPorcentajeFacturacion}% o mayor`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    })

    if (!resp.isConfirmed) {
      return;
    }

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 3;
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;
    var pPres = [];
    var sPres = '';

    this.lPres.forEach(item => {
      pPres.push(item.nIdCC);
    })
    sPres = pPres.join('-');

    pParametro.push(this.idUser);
    pParametro.push(this.pPais);
    pParametro.push(sPres); //Lista con los id's a actualizar



    try {
      const res = await this.vPreService.fnCierreMasivo(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise();
      if (Number(res) >= 1) {
        Swal.fire({
          icon: 'success',
          title: ('Correcto'),
          text: 'Se actualizo de manera correcta los registros.',
          showConfirmButton: false,
          timer: 1500
        });
        this.spinner.hide();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo realizar la actualización, !Revise su conexión a internet!',
          showConfirmButton: false,
          timer: 1500
        });
        this.spinner.hide();
        return;
      }
    } catch (error) {
      console.log(error);
      this.spinner.hide();
      return;
    }


    //Si actualiza correctamente comenzamos con la descarga del excel
    let empresa = localStorage.getItem("Empresa");
    let listaEmpresa = localStorage.getItem("ListaEmpresa");
    let nEmpresa = JSON.parse(listaEmpresa).find(
      (emp) => emp.nIdEmp == empresa
    );


    let response = await this.vPreService.fnDescargarExcelCierreMasivo(this.lPres, this.url, nEmpresa.sDespEmp).toPromise()

    // Descargar el Excel
    const data = response.filename;
    var link = document.createElement('a');
    link.href = data;
    // Trigger de descarga
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

    Swal.fire({
      title: 'El Excel ha sido generado',
      html: `Si su descarga no ha comenzado, puede descargarlo <a href='${response.filename}' download>aquí</a>`,
      icon: 'success',
      showCloseButton: true
    }).then(r => {
      this.lPres = [];
      this.nValor = 0;
    });


  }

  fnMesAnterior() {
    var mesAnterior = moment().subtract(1, 'month')
    this.cboAnio.setValue(mesAnterior.year());
    this.cboMes.setValue(mesAnterior.month() + 1); //month retorna de 0 a 11
  }
}
