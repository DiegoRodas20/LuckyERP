import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { ActivoTipoDTO } from '../../api/models/activoDTO';
import { ActivoService } from '../../api/services/activo.service';

@Component({
  selector: 'app-ti-activo-asignacion-excel',
  templateUrl: './ti-activo-asignacion-excel.component.html',
  styleUrls: ['./ti-activo-asignacion-excel.component.css'],
  animations: [asistenciapAnimations]
})
export class TiActivoAsignacionExcelComponent implements OnInit {

  // Local Storage
  storageData: SecurityErp = new SecurityErp();

  // Variables de ayuda
  estaCargado: boolean = false; // Flag para ver cuando la pagina este completamente cargada

  // Formulario
  formExcelAsignaciones: FormGroup;

  // Combobox
  listaTipoActivos: ActivoTipoDTO[] = [];

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'cloud_download', tool: 'Generar Excel', state: true},
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  constructor(
    private spinner: NgxSpinnerService,
    private _activoService: ActivoService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TiActivoAsignacionExcelComponent>,
  ) {

    // Crear formulario
    this.fnCrearFormulario();

  }

  async ngOnInit(): Promise<void> {

    this.onToggleFab(1, -1);

    // Llenamos los controles
    await this.fnLlenarComboboxTipoActivos();

    this.spinner.hide();

  }

  //#region Botones

  // Metodo para abrir/cerrar menu de botones
  onToggleFab(fab: number, stat: number) {
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
  }

  // Metodo para utilizar las funciones del menu de botones
  async clickFab(index: number) {
    switch (index) {
      case 0:
        await this.fnGenerarExcel();
        break;
      default:
        break;
    }
  }

  // Metodo para actualizar el estado de los botones
  fnControlFab(){
    this.fbLista[0].state = true; 
    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }
  //#region Formulario

  fnCrearFormulario(){
    this.formExcelAsignaciones = this.fb.group({
      tipoActivo: null,
    })
  }

  //#endregion

  //#region Controles

  async fnLlenarComboboxTipoActivos(){
    try{
      const result = await this._activoService.GetAllTipos();
      this.listaTipoActivos = result.response.data;
    }
    catch(err){
      console.log(err);
    }
  }

  //#endregion

  //#region Acciones

  async fnGenerarExcel(){

    this.spinner.show();

    const nIdTipo = Number(this.formExcelAsignaciones.get("tipoActivo").value);

    const result = await this._activoService.GenerarExcelAsignaciones(nIdTipo);

    if(result == null){
      this.spinner.hide();
      Swal.fire("Alerta","No se han encontrado registros basados en los filtros ingresados", "warning");
      return;
    }
    else{
      saveAs(result, 'Lista de asignaciones.xlsx');
      this.spinner.hide();
      Swal.fire("Correcto", "Se ha generado el Excel", "success");
    }

  }

  //#endregion

  fnSalir(){
    this.dialogRef.close();
  }
}
