import { Component, OnInit, Inject, Input, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { PresupuestosService } from '../../presupuestos.service';
import { asistenciapAnimations } from '../../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import moment from 'moment';

@Component({
  selector: 'app-dialog-informe-gasto',
  templateUrl: './dialog-informe-gasto.component.html',
  styleUrls: ['./dialog-informe-gasto.component.css'],
  animations: [asistenciapAnimations]
})
export class DialogInformeGastoComponent implements OnInit {

  @Input() tipoPresupuesto: number; // Presupuesto: 1/ Costo Fijo: 2

  // Variables localstorage
  nIdEmpresa: string;
  nIdPais: string;
  nombreEmpresa: string;
  listaEmpresa: any[];

  // Formulario
  formInforme: FormGroup;

  // Combobox
  listaCliente: any[];
  listaPresupuesto: any[];
  listaPartidas: any[];
  listaSucursal: any[];
  listaDepositario: any[];

  // Variables chiplist
  elementsUsuarioCreacion = [];
  chipElementsUsuarioCreacion = [];
  filteredUsuarioCreacion: Observable<any[]>;
  @ViewChild("usuarioInput") usuarioInput: ElementRef<HTMLInputElement>;
  @ViewChild("autoUsuarioCreacion") matAutocompleteUsuarioCreacion: MatAutocomplete;
  separatorKeysCodesUsuario: number[] = [ENTER, COMMA];

  // Variables para las opciones
  tsLista = 'active';
  fbLista = [
    {icon: 'cloud_download', tool: 'Generar Reporte Excel', color:'white', state: true}
  ];
  abLista = [];
  mostrarBotones = true;


  constructor(
    // public dialogRef: MatDialogRef<DialogInformeGastoComponent>,
    // @Inject(MAT_DIALOG_DATA) private data: any,
    @Inject('BASE_URL') private baseUrl: string,
    private fb: FormBuilder,
    private presupuestoService: PresupuestosService,
    private spinner: NgxSpinnerService
  ) {
    this.crearFormulario();
  }

  async ngOnInit() {
    this.nIdEmpresa = localStorage.getItem('Empresa');
    this.nIdPais = localStorage.getItem('Pais');
    this.nombreEmpresa = localStorage.getItem('NomEmpresa');
    console.log('TIPOpresupuesto',this.tipoPresupuesto);
    this.onToggleFab(1, -1);


    await this.obtenerListaClientes();
    await this.obtenerListaPresupuesto(this.tipoPresupuesto);
    await this.obtenerListaSucursales();
    await this.obtenerListaDepositario();
    await this.obtenerListaEmpresa();
    await this.obtenerListaPartidas();
    await this.obtenerListaUsuarios();
    if(this.tipoPresupuesto === 2) {
      this.formInforme.controls.empresa.setValue(Number.parseInt(this.nIdEmpresa));
    }

    this.filterUsuarioCreacionPipe();

    console.log(this.formInforme.value);
  }

  crearFormulario() {
    this.formInforme = this.fb.group({
      'cliente': [null],
      'presupuesto': [null],
      'partida': [null],
      'depositario': [null],
      'sucursal': [null],
      'empresa': [],
      'tipoGasto': ['2'],
      'usuarioCreacion': [null],
      'rangoFechasFechaInicio': [new Date()], // Filtrado por fechas - Inicio
      'rangoFechasFechaFin':  [new Date()] // Filtrado por fechas - Fin
    },
    {
      validator: [
        this.dateRangeValidator(
          "rangoFechasFechaInicio",
          "rangoFechasFechaFin"
        )
      ],
    });
  }

  async generarReporteExcel() {
    if(this.formInforme.valid){
      this.spinner.show();

      const pEntidad = 1;
      const pOpcion = 2;
      const pParametro = []; //Parametros de campos
      const pTipo = this.tipoPresupuesto === 1 ? 1 : 2; // En la consulta, si el tipo de presupuesto es 1, en el pTipo se manda 1, si no, se manda 2

      const nIdEmpresa = this.formInforme.get('empresa').value || 0;
      const nIdCliente = this.formInforme.get('cliente').value || 0;
      const nIdCentroCosto = this.formInforme.get('presupuesto').value || 0;
      const nIdSucursal = this.formInforme.get('sucursal').value || 0;
      const nIdDepositario = this.formInforme.get('depositario').value || 0;
      const nTipoGasto = this.formInforme.get('tipoGasto').value;
      const nIdPartida = this.formInforme.get('partida').value || 0;
      const fechaInicio = this.formInforme.get('rangoFechasFechaInicio').value || '';
      const fechaFin = this.formInforme.get('rangoFechasFechaFin').value || '';
      const listaUsuarios = [];

      // Llenar la lista de usuarios
      this.chipElementsUsuarioCreacion.map((usuario)=>listaUsuarios.push(usuario.id));

      // Si el tipo de presupuesto es 1, es la empresa actual, si no, es la empresa del formulario
      pParametro.push(this.tipoPresupuesto === 1 ? this.nIdEmpresa : nIdEmpresa);

      pParametro.push(nIdCliente);
      pParametro.push(nIdCentroCosto);
      pParametro.push(nIdSucursal);
      pParametro.push(nIdDepositario);
      pParametro.push(nTipoGasto);
      pParametro.push(nIdPartida);
      pParametro.push(listaUsuarios.join(",")); // La lista de usuarios es mandada separada por comas
      pParametro.push(moment(fechaInicio).format("YYYY-MM-DD"));
      pParametro.push(moment(fechaFin).format("YYYY-MM-DD"));

      const response = await this.presupuestoService.fnGenerarExcelInformeGasto(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl)

      this.spinner.hide();
      if(!response) {
        Swal.fire({
          title: 'No existen registros con las especificaciones puestas',
          icon: 'warning',
          timer: 1500
        })
        return;
      } else {
        // Descargar el Excel
        const data = response;
        console.log(data);
        const fileName = `Reporte Informe Gasto.xlsx`;
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(data, fileName);
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
    }

    else{
      this.formInforme.markAllAsTouched();
    }

  }

  async cambioEmpresa(idEmpresa) {
    this.nIdEmpresa = idEmpresa;
    this.formInforme.controls.presupuesto.setValue(null);
    await this.obtenerListaPresupuesto(this.tipoPresupuesto);
  }

  // salir() {
  //   this.dialogRef.close();
  // }

  onToggleFab(fab: number, stat: number) {

    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;

  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.generarReporteExcel();
        break;
      default:
        break;
    }
  }

  async obtenerListaClientes() {
    this.listaCliente = await this.presupuestoService.obtenerInformacionInformeGasto(1,`${this.nIdPais}`);
  }

  async obtenerListaPresupuesto(tipoPresupuesto: number) {
    this.listaPresupuesto = await this.presupuestoService.obtenerInformacionInformeGasto(2,`${this.nIdEmpresa}|${tipoPresupuesto}`);
  }

  async obtenerListaSucursales() {
    this.listaSucursal = await this.presupuestoService.obtenerInformacionInformeGasto(3,`${this.nIdEmpresa}`);
  }

  async obtenerListaDepositario() {
    this.listaDepositario = await this.presupuestoService.obtenerInformacionInformeGasto(4,`${this.nIdEmpresa}`);
  }

  async obtenerListaEmpresa() {
    this.listaEmpresa = await this.presupuestoService.obtenerInformacionInformeGasto(5,`${this.nIdPais}`);
  }

  async obtenerListaPartidas() {
    this.listaPartidas = await this.presupuestoService.obtenerInformacionInformeGasto(6,`${this.nIdPais}`);
  }

  async obtenerListaUsuarios() {
    this.elementsUsuarioCreacion = await this.presupuestoService.obtenerInformacionInformeGasto(7,`${this.nIdPais}`);
  }

  //#region Chiplist Usuarios
  fnAgregarUsuarioChipList(event): void {
    const input = event.input;
    const value = event.value;
    // Agregamos si es que tiene un Id
    if (value.id) {
      // Validamos que el presupuesto no se haya agregado
      if (this.chipElementsUsuarioCreacion.findIndex((item) => item.id == value.id) == -1) {
        this.chipElementsUsuarioCreacion.push(value);
      }
    }

    // Reseteamos el input
    if (input) {
      input.value = "";
    }
    this.formInforme.patchValue({ usuarioCreacion: "" });
  }

  fnSeleccionarUsuarioCreacion(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value;
    if (value.id) {
      //Validamos que el presupuesto no se haya agregado
      if (this.chipElementsUsuarioCreacion.findIndex((item) => item.id == value.id) == -1) {
        this.chipElementsUsuarioCreacion.push(value);
      }
    }
    this.usuarioInput.nativeElement.value = "";
    this.formInforme.patchValue({ usuarioCreacion: "" });
  }

  filterUsuarioCreacionPipe() {
    this.filteredUsuarioCreacion = this.formInforme.get("usuarioCreacion").valueChanges.pipe(
      startWith(""),
      map((value) => (typeof value === "string" ? value : value?.descripcion)),
      map((usuario) =>
      usuario ? this._filterUsuarioCreacion(usuario) : this.elementsUsuarioCreacion.slice()
      )
    );
  }

  private _filterUsuarioCreacion(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.elementsUsuarioCreacion.filter((usuario) =>
    usuario.descripcion.toLowerCase().includes(filterValue)
    );
  }

  fnEliminarUsuarioCreacion(chipElement): void {
    this.chipElementsUsuarioCreacion = this.chipElementsUsuarioCreacion.filter(
      (item) => item.id != chipElement.id
    );
  }

  fnDisplayUsuarioCreacion(usuario): string {
    return usuario && usuario.descripcion ? usuario.descripcion : "";
  }
  //#endregion

  //#region Validaciones personalizadas

  dateRangeValidator(fechaMinima: string, fechaMaxima: string): ValidatorFn {
    return (formGroup: FormGroup) => {
      let fMin = formGroup.controls[fechaMinima];
      let tMax = formGroup.controls[fechaMaxima];
      if (fMin.value != null && tMax.value != null) {
        if (moment(fMin.value).toDate() > moment(tMax.value).toDate()) {
          fMin.setErrors({ dateRangeValidator: true });
          tMax.setErrors({ dateRangeValidator: true });
        }
        else{
          fMin.setErrors(null);
          tMax.setErrors(null);
        }
      }
      else if (fMin.value != null && tMax.value == null) {
        tMax.setValidators([Validators.required]);
        tMax.setErrors({ required: true });
        console.log("Maximo requerido");
        console.log(tMax);
      }
      else if (fMin.value == null && tMax.value != null) {
        fMin.setValidators([Validators.required])
        fMin.setErrors({ required: true });
        console.log("Minimo requerido");
        console.log(fMin);
      }
      else{
        fMin.clearValidators();
        tMax.clearValidators();
      }
      return {};
    };
  }

  //#endregion


}
