import {Component,OnInit,ViewChild,Inject,ChangeDetectorRef,Input} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { ParametroLogisticaService } from "../../parametro-logistica.service";
import { PresupuestoParametros } from "../../models/parametro.model";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import Swal from "sweetalert2";

@Component({
  selector: "app-presupuesto-parametros",
  templateUrl: "./presupuesto-parametros.component.html",
  styleUrls: ["./presupuesto-parametros.component.css"],
})
export class PresupuestoParametrosComponent implements OnInit {
  // Variables
  pPais: string;  //Codigo del Pais de la empresa Actual
  idEmp: string;
  isAddAlmacenModalOpen = false; // Mostrar los botones
  idUser: number; //id del usuario

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  displayedColumns = ["nId","sPresupuesto","sDescripcion","sCliente","sEstado",];
  dataSource: MatTableDataSource<PresupuestoParametros >;
  ListaPresupuestoCierreAutomatico: PresupuestoParametros[] = [];

  // Combobox Presupuesto y Modal
  combobox: FormGroup;
  listaPresupuestosCombobox = [];
  modal: NgbModalRef;

  // Id del parametro
  @Input() data;

  constructor(
    private vParLogisticaService: ParametroLogisticaService,
    private spinner: NgxSpinnerService,
    private ref: ChangeDetectorRef,
    private fb: FormBuilder,
    @Inject("BASE_URL") private url: string,
    private modalService: NgbModal // Manipular el modal de bootstrap
  ) {
    this.crearFormularioCombobox();
  }

  async ngOnInit(): Promise<void> {
    //Cargando datos locales del usuarios en variables.
    this.pPais = localStorage.getItem('Pais'); //Pais del usuario
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid; //id del usuario
    this.idEmp = localStorage.getItem('Empresa');

    // Llenar campos
    await this.fnListarComboboxPresupuestos();
    await this.fnListarPresupuestosPermitidos();
    this.spinner.hide(); // Cierre del spinner proveniente de la ventana principal
  }

  ngAfterContentChecked() {
    this.ref.detectChanges();
  }

  //#region Mantenimiento Tabla

  // Listar presupuestos
  async fnListarPresupuestosPermitidos() {
    var pEntidad = 2; // Detalle
    var pOpcion = 2; //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2; // Listar todos los registros de la tabla mostrando los presupuestos

    pParametro.push(this.idEmp);
    this.ListaPresupuestoCierreAutomatico = await this.vParLogisticaService.fnParametro(pEntidad,pOpcion,pParametro,pTipo,this.url);
    // console.log(this.ListaPresupuestoCierreAutomatico);
    this.dataSource = new MatTableDataSource(this.ListaPresupuestoCierreAutomatico);
    this.dataSource.paginator = this.paginator;
  }

  // Agregar Presupuestos
  openModal(content) {
    this.isAddAlmacenModalOpen = true;
    this.modal = this.modalService.open(content, { // Abriendo el modal del combobox
      windowClass: 'custom-modal-parametros',
      container: ".combobox-modal-container",
      backdrop: "static",
      keyboard: false,
    });
    this.modal.result.then(() => {});
  }

  closeModal() {
    this.isAddAlmacenModalOpen = false;
    this.modal.close();
  }

  crearFormularioCombobox() {
    this.combobox = this.fb.group({
      cbPresupuesto: [null, Validators.required],
    });
  }

  async fnListarComboboxPresupuestos() {
    var pEntidad = 2; // Detalle
    var pOpcion = 2; //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3; //Listar todos los presupuestos en el combobox

    pParametro.push(this.idEmp);
    this.listaPresupuestosCombobox = await this.vParLogisticaService.fnParametro(
      pEntidad,
      pOpcion,
      pParametro,
      pTipo,
      this.url
    );
    console.log(this.listaPresupuestosCombobox);
  }

  async agregarPresupuesto() {
    if (this.combobox.valid) {
      let pEntidad = 2; // Detalle
      let pOpcion = 1; //CRUD -> Insertar
      let pParametro = []; //Parametros de campos vacios
      let pTipo = 2; // Insert para los presupuestos

      let presupuesto = this.combobox.get("cbPresupuesto").value;

      pParametro.push(this.data.nIdParametro); // Id del parametro
      pParametro.push(presupuesto);

      // Si ya esta agregado el presupuesto, no se agrega
      const presupuestoAgregado = this.ListaPresupuestoCierreAutomatico.find(
        (presupuestoAgregado) =>
          presupuestoAgregado.nIdCentroCosto == presupuesto
      );

      if (!presupuestoAgregado) {
        this.spinner.show();
        await this.vParLogisticaService.fnParametro(
          pEntidad,
          pOpcion,
          pParametro,
          pTipo,
          this.url
        );

        this.fnListarPresupuestosPermitidos();
        this.isAddAlmacenModalOpen = false;
        this.modal.close();
        this.spinner.hide();
      } else {
        Swal.fire("Este presupuesto ya está agregado", "", "warning");
      }
    }
  }

  // Actualizar almacen
  async fnActualizarPresupuesto(id: number) {
    this.spinner.show();
    let pEntidad = 2; // Detalle
    let pOpcion = 3; //CRUD -> Actualizar
    let pParametro = []; //Parametros de campos vacios
    let pTipo = 1; // Actualizar presupuesto de la tabla (Cambiar estado)
    pParametro.push(id);

    await this.vParLogisticaService.fnParametro(
      pEntidad,
      pOpcion,
      pParametro,
      pTipo,
      this.url
    );
    this.fnListarPresupuestosPermitidos();
    this.spinner.hide();
  }

  // Eliminar almacen
  async fnEliminarPresupuesto(id: number) {
    let pEntidad = 2; // Detalle
    let pOpcion = 4; //CRUD -> Eliminar
    let pParametro = []; //Parametros de campos vacios
    let pTipo = 1; // Eliminar presupuesto de la tabla
    pParametro.push(id);

    Swal.fire({
      title: "¿Está seguro que desea eliminar este almacén?",
      showDenyButton: true,
      confirmButtonText: `Eliminar`,
      denyButtonText: `Cancelar`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        await this.vParLogisticaService.fnParametro(
          pEntidad,
          pOpcion,
          pParametro,
          pTipo,
          this.url
        );
        this.fnListarPresupuestosPermitidos();
        this.spinner.hide();
      }
    });
  }
  //#endregion
}
