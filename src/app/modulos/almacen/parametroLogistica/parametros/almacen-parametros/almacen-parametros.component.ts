import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  Inject,
  ChangeDetectorRef,
  Input,
} from "@angular/core";
import { NgxSpinnerService } from "ngx-spinner";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { ParametroLogisticaService } from "../../parametro-logistica.service";
import { AlmacenParametros } from "../../models/parametro.model";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import Swal from "sweetalert2";
@Component({
  selector: "app-almacen-parametros",
  templateUrl: "./almacen-parametros.component.html",
  styleUrls: ["./almacen-parametros.component.css"],
})
export class AlmacenParametrosComponent implements OnInit {
  // Variables
  pPais: string; //Codigo del Pais de la empresa Actual
  isAddAlmacenModalOpen = false; // Mostrar los botones

  // Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  displayedColumns = ["nId", "sCodigo", "sDescripcion", "sEstado"];
  dataSource: MatTableDataSource<AlmacenParametros>;
  listaAlmacenesCierreAutomatico: AlmacenParametros[] = [];

  // Combobox Almacen y Modal
  listaAlmacenesCombobox = [];
  modal: NgbModalRef;
  combobox: FormGroup;

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
    this.pPais = localStorage.getItem("Pais");
    await this.fnListarComboboxAlmacen();
    await this.fnListarAlmacenesPermitidos();
    this.spinner.hide(); // Cierre del spinner proveniente de la ventana principal
  }

  ngAfterContentChecked() {
    this.ref.detectChanges();
  }

  //#region Mantenimiento Tabla

  // Listar almacenes
  async fnListarAlmacenesPermitidos() {
    var pEntidad = 2; // Detalle
    var pOpcion = 2; //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1; // Listar todos los registros de la tabla mostrando los almacenes

    pParametro.push(this.pPais);
    this.listaAlmacenesCierreAutomatico = await this.vParLogisticaService.fnParametro(
      pEntidad,
      pOpcion,
      pParametro,
      pTipo,
      this.url
    );
    this.dataSource = new MatTableDataSource(
      this.listaAlmacenesCierreAutomatico
    );
    this.dataSource.paginator = this.paginator;
  }

  // Agregar Almacenes
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
      cbAlmacen: [null, Validators.compose([Validators.required])],
    });
  }

  async fnListarComboboxAlmacen() {
    let pEntidad = 2; // Detalle
    let pOpcion = 2; //CRUD -> Listar
    let pParametro = []; //Parametros de campos vacios
    let pTipo = 4; //Listar todos los almacenes en el combobox

    pParametro.push(this.pPais);

    this.listaAlmacenesCombobox = await this.vParLogisticaService.fnParametro(
      pEntidad,
      pOpcion,
      pParametro,
      pTipo,
      this.url
    );
    console.log(this.listaAlmacenesCombobox);
  }

  async agregarAlmacen() {
    if (this.combobox.valid) {
      let pEntidad = 2; // Detalle
      let pOpcion = 1; //CRUD -> Insertar
      let pParametro = []; //Parametros de campos vacios
      let pTipo = 1; // Insert para los almacenes

      let almacen = this.combobox.get("cbAlmacen").value;

      pParametro.push(this.data.nIdParametro);
      pParametro.push(almacen);

      // Si ya esta agregado el almacen, no se agrega
      const almacenAgregado = this.listaAlmacenesCierreAutomatico.find(
        (almacenAgregado) => almacenAgregado.nIdAlmacen == almacen
      );

      if (!almacenAgregado) {
        this.spinner.show();
        await this.vParLogisticaService.fnParametro(
          pEntidad,
          pOpcion,
          pParametro,
          pTipo,
          this.url
        );

        this.fnListarAlmacenesPermitidos();
        this.isAddAlmacenModalOpen = false;
        this.modal.close();
        this.spinner.hide();
      } else {
        Swal.fire("Este almacén ya está agregado", "", "warning");
      }
    }
  }

  // Actualizar almacen
  async fnActualizarAlmacen(id: number) {
    this.spinner.show();
    let pEntidad = 2; // Detalle
    let pOpcion = 3; // CRUD -> Actualizar
    let pParametro = []; // Parametros de campos vacios
    let pTipo = 1; // Actualizar almacenes de la tabla (Cambiar estado)
    pParametro.push(id);

    await this.vParLogisticaService.fnParametro(
      pEntidad,
      pOpcion,
      pParametro,
      pTipo,
      this.url
    );
    this.fnListarAlmacenesPermitidos();
    this.spinner.hide();
  }

  // Eliminar almacen
  async fnEliminarAlmacen(id: number) {
    let pEntidad = 2; // Detalle
    let pOpcion = 4; // CRUD -> Eliminar
    let pParametro = []; // Parametros de campos vacios
    let pTipo = 1; // Eliminar almacenes de la tabla (Cambiar estado)

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
        this.fnListarAlmacenesPermitidos();
        this.spinner.hide();
      }
    });
  }

  //#endregion
}
