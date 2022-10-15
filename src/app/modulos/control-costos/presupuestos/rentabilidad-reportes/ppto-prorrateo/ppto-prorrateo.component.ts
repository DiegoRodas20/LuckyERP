import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatAccordion, MatExpansionPanel } from "@angular/material/expansion";
import moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import Swal from "sweetalert2";
import { Listas_Rentabilidad } from "../models/rentabilidadPresupuesto.model";
import { E_Listas_Presupuesto } from "../models/rentabilidadProrrateo.model";
import { RentabilidadPresupuestoService } from "../rentabilidad-presupuesto.service";

@Component({
  selector: "app-ppto-prorrateo",
  templateUrl: "./ppto-prorrateo.component.html",
  styleUrls: ["./ppto-prorrateo.component.css"],
  animations: [asistenciapAnimations],
})
export class PptoProrrateoComponent implements OnInit {
  @ViewChild(MatAccordion) matAccordeonProrrateo: MatAccordion;
  @ViewChild('matExpPpto') matExpPpto: MatExpansionPanel;
  @ViewChild('matExpCliente') matExpCliente: MatExpansionPanel;

  // Botones
  tsLista = "inactive";
  fbLista = [
    { icon: "cloud_download", tool: "Descargar", state: true }
  ];
  abLista = [];
  mostrarBotones = true;

  nAccordeon: number = 1;//1 es el exp. ppto, 2 es el exp. cliente
  // Combobox
  cbPresupuestos: E_Listas_Presupuesto[] = [];
  cbMeses: Listas_Rentabilidad[] = [];
  cbAnhos: Listas_Rentabilidad[] = [];
  cbClientes: Listas_Rentabilidad[] = [];

  // Formulario
  formProrrateo: FormGroup;

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual


  constructor(private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    protected _changeDetectorRef: ChangeDetectorRef,
    private rentabilidadService: RentabilidadPresupuestoService,
    @Inject('BASE_URL') baseUrl: string,
  ) {
    this.url = baseUrl;
  }

  async ngOnInit(): Promise<void> {

    let user = localStorage.getItem('currentUser'); //encriptacion del usuario
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');


    this.spinner.show();

    this.onToggleFab(1, -1);

    // Creacion de formulario
    await this.fnCrearFormulario();
    await this.fnListarMeses();
    await this.fnListarAnios();
    await this.fnListarPresupuestos();
    await this.fnListarCliente();

    this.spinner.hide();

    this.fnValoresIniciales();
  }

  //#region Listados
  async fnListarMeses() {

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;

    try {
      const registro = await this.rentabilidadService.fnReporteRentabilidad(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      this.cbMeses = registro;
    } catch (error) {
      console.log(error);
    }
  }

  async fnListarAnios() {

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;

    pParametro.push(this.idEmp);

    try {
      const response = await this.rentabilidadService.fnReporteRentabilidad(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      this.cbAnhos = response;
    } catch (error) {
      console.log(error);
    }
  }

  async fnListarPresupuestos() {

    var pEntidad = 3;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;
    pParametro.push(this.idEmp);

    try {
      const registro = await this.rentabilidadService.fnReporteRentabilidad(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      this.cbPresupuestos = registro;
    } catch (error) {
      console.log(error);
    }
  }

  async fnListarCliente() {

    var pEntidad = 3;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;
    pParametro.push(this.pPais);

    try {
      const registro = await this.rentabilidadService.fnReporteRentabilidad(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      this.cbClientes = registro;
    } catch (error) {
      console.log(error);
    }
  }
  //#endregion

  //#region Botones
  onToggleFab(fab: number, stat: number) {
    stat = stat === -1 ? (this.abLista.length > 0 ? 0 : 1) : stat;
    this.tsLista = stat === 0 ? "inactive" : "active";
    this.abLista = stat === 0 ? [] : this.fbLista;
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnDescargarExcel()
        break;
      default:
        break;
    }
  }
  //#endregion

  async fnDescargarExcel() {

    if (this.nAccordeon == 1 && this.formProrrateo.controls.presupuesto.invalid) {
      Swal.fire('¡Verificar!', 'Seleccione un presupuesto para poder buscar.', 'warning');
      return;
    }

    if (this.nAccordeon == 2 && (this.formProrrateo.controls.mesFinalizacion.invalid ||
      this.formProrrateo.controls.anhoFinalizacion.invalid ||
      this.formProrrateo.controls.cliente.invalid)) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados para poder buscar.', 'warning');
      return;
    }

    var pTipo = 1
    var pParametro = []; //Parametros de campos vacios

    var vDatos = this.formProrrateo.value;
    var mes = Number(vDatos.mesFinalizacion);
    var anho = Number(vDatos.anhoFinalizacion);
    var pTipo = 1;

    pParametro.push(this.nAccordeon);
    pParametro.push(this.idEmp);
    pParametro.push(vDatos.presupuesto);
    pParametro.push(mes);
    pParametro.push(anho);
    pParametro.push(vDatos.cliente);

    this.spinner.show();
    let response
    try {
      response = await this.rentabilidadService.fnDescargarExcelProrrateo(
        pTipo,
        pParametro,
        this.url
      );
    }
    catch (err) {
      if (err.status) {
        if (err.status == 404) {
          //No encontro
          Swal.fire('¡Verificar!', 'No hay registros para los filtros indicados.', 'warning');
        }
      }
      this.spinner.hide();
      return;
    }

    this.spinner.hide();

    // Descargar el Excel
    const data = response;
    const fileName = `Reporte Rentabilidad Prorrateo.xlsx`;
    if (window.navigator && window.navigator['msSaveOrOpenBlob']) {
      window.navigator['msSaveOrOpenBlob'](data, fileName);
      return;
    }
    const objectUrl = window.URL.createObjectURL(data);
    var link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    // Trigger de descarga
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

    Swal.fire({
      title: 'El Excel ha sido generado',
      html: `Si su descarga no ha comenzado, puede descargarlo <a href='${objectUrl}' download="${fileName}">aquí</a>`,
      icon: 'success',
      showCloseButton: true
    })
  }
  //#region Creacion del formulario

  fnCrearFormulario(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.formProrrateo = this.fb.group({
        presupuesto: [null, Validators.required],
        txtCliente: [''],
        anhoFinalizacion: [null, Validators.required],
        mesFinalizacion: [null, Validators.required],
        cliente: [null, Validators.required],
      })
      resolve();
    })
  }

  //#endregion

  fnValoresIniciales() {
    if (this.cbAnhos.length > 0) {
      let anioUltimo = this.cbAnhos[this.cbAnhos.length - 1].sDescripcion;
      this.formProrrateo.controls.anhoFinalizacion.setValue(anioUltimo);
    }
    if (this.cbMeses.length > 0) {

      let mesActual = moment().month() + 1;
      this.formProrrateo.controls.mesFinalizacion.setValue(mesActual);
    }
  }

  fnValorCliente(nIdPresupuesto: number) {
    let pres = this.cbPresupuestos.find(item => item.nId == nIdPresupuesto)
    if (pres) {
      this.formProrrateo.controls.txtCliente.setValue(pres.sCliente);
    }
  }

  fnDarValorAccordeon(idAccordeon: number) {
    this.nAccordeon = idAccordeon;
  }
}
