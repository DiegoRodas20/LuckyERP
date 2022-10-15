import { AfterContentInit, ChangeDetectorRef, Component, DoCheck, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { ParametroProcedureInterface } from '../../../interfaces/parametroProcedure';
import { ParametroService } from '../../../parametro.service';

@Component({
  selector: 'app-table-partida',
  templateUrl: './table-partida.component.html',
  styleUrls: ['./table-partida.component.css'],
  animations: [asistenciapAnimations]
})
export class TablePartidaComponent implements OnInit, OnChanges, DoCheck, AfterContentInit {

  // Botones Flotantes Pantalla 
  tsLista = 'inactive';  // Inicia la lista visible
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'post_add', tool: 'Nuevo' },
  ];
  abLista = [];

  @Input() datos: any[];
  @Input() readOnly: boolean;
  @Input() isDelete: boolean;
  @Input() nombreGrupoPadre: any = []; // Este campo se envía
  @Output() partidaSeleccionada: EventEmitter<any>;
  @Output() addButtonAction: EventEmitter<any>;
  @Output() nombreGrupo: EventEmitter<any>;
  tipoCrud = true; // 1 = CRUD
  displayedColumns: string[];
  dataTemp: any;
  dataSource: MatTableDataSource<any>;
  message: string = '.Obligatorio';
  form: FormGroup;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private controlcostoService: ParametroService,
    private fb: FormBuilder, private route: Router, private spinner: NgxSpinnerService, private cdRef: ChangeDetectorRef) {
    this.partidaSeleccionada = new EventEmitter();
    this.addButtonAction = new EventEmitter();
    this.nombreGrupo = new EventEmitter();
    this.crearFormulario();
  }
  ngAfterContentInit(): void {

  }

  ngDoCheck(): void {
    if (this.datos) {
      if (this.dataTemp !== this.datos.length) {
        this.dataSource = new MatTableDataSource(this.datos);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataTemp = this.dataSource.data.length;
      }
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.dataSource = new MatTableDataSource(this.datos);
    this.cdRef.detectChanges();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataTemp = this.dataSource.data.length;
    if (this.nombreGrupoPadre) {
      if (this.nombreGrupoPadre.length > 0) {
        this.form.reset({
          nombre: this.nombreGrupoPadre[0].descripcion
        });
      }
    }

  }

  ngOnInit() {
    this.onToggleFab(1, -1);

    // Si la tabla está habilitada para eliminar
    if (this.isDelete) {
      // Aquí son las columnas predeterminadas
      this.displayedColumns = ['opciones', 'id', 'codigo', 'descripcion', 'estado'];
    } else {
      if (this.readOnly) {
        this.displayedColumns = ['id', 'codigo', 'descripcion', 'tipo', 'estado'];
      } else {
        this.displayedColumns = ['opciones', 'id', 'descripcion', 'tipo', 'estado'];
      }
    }

  }

  crearFormulario() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]]
    });
  }

  editarGrupoPartida(id) {
    this.route.navigateByUrl(`controlcostos/parametro/grupoPartidas/${id}`);
  }

  async inactivarGrupo(id) {
    this.spinner.show();
    let model: ParametroProcedureInterface;
    const parametros = `${id}|0`;
    model = {
      pEntidad: 1,
      pOpcion: 6,
      pParametro: parametros.toString(),
      pTipo: 1,
      pParametroDet: ''
    };
    const resp = await this.controlcostoService.listarPartidasGenericas(model);
    this.datos.map(element => {
      if (element.idTipEle === id) {
        element.estado = 0;
      }
      return element;
    })
    this.dataSource = new MatTableDataSource(this.datos);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.spinner.hide();
    await Swal.fire({
      icon: 'success',
      title: 'La partida se desactivo correctamente',
      showConfirmButton: false,
      timer: 1500
    });
  }

  eliminarElemento(id: number) {
    this.partidaSeleccionada.emit(id);
    this.datos = this.datos.filter(item => item.idTipEle !== id);
    this.dataSource = new MatTableDataSource(this.datos);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLocaleLowerCase();
  }

  tipearGrupo(event) {
    this.nombreGrupo.emit(this.form.get('nombre').value);
  }

  addButton() {
    if (this.isDelete) {
      this.addButtonAction.emit(1); // Agregar items detalles
    } else {
      if (this.readOnly) {
        this.addButtonAction.emit(2); // No hay acción
      } else {
        this.addButtonAction.emit(3); // Agregar grupo detalle
      }
    }
  }

  //  #region FormControls */
  get nombreField() {
    return this.form.get('nombre') as FormControl;
  }

  /* #region Mensajes de Error */
  get nombreError() {
    return this.nombreField.hasError('required') && this.nombreField.touched ? this.message : this.nombreField.hasError('caracterValidator') ? this.nombreField.errors.caracterValidator : null;
  }

  /* caracterValidator(control: AbstractControl): ValidationErrors | null {
    const caracteres = /(\/|\|)$/i;
    const valid = caracteres.exec(control.value);
    return valid ? { caracterValidator: 'El texto no debe contener: "/" ni "|"' } : null;
  } */


  //Botones Flotantes 
  onToggleFab(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.addButton()
        break
      default:
        break
    }
  }
}