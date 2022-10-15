import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { ActivoDescuentosPersonalDTO, ActivoSelectItemDTO } from '../../api/models/activoDTO';
import { ActivoService } from '../../api/services/activo.service';

@Component({
  selector: 'app-ti-activo-descuentos-personal',
  templateUrl: './ti-activo-descuentos-personal.component.html',
  styleUrls: ['./ti-activo-descuentos-personal.component.css'],
  animations: [asistenciapAnimations]
})
export class TiActivoDescuentosPersonalComponent implements OnInit {

  // Local Storage
  storageData: SecurityErp = new SecurityErp();

  // Formulario
  formDescuentoExcel: FormGroup;

  // Combobox
  listaPersonal: ActivoSelectItemDTO[] = [];

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'cloud_download', tool: 'Generar Excel', state: true},
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto
  
  constructor(
    private spinner: NgxSpinnerService,
    private activoService: ActivoService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TiActivoDescuentosPersonalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.fnCrearFormulario();
  }

  async ngOnInit(): Promise<void> {

    this.onToggleFab(1, -1);

    // Llenar los combobox
    await this.fnLlenarComboboxPersonal();

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
    this.formDescuentoExcel = this.fb.group(
      {
        personal: [null],
        fechaInicio: [new Date(), Validators.compose([Validators.required])],
        fechaFin: [new Date(), Validators.compose([Validators.required])],
      },
      {
        validator: [
          this.dateRangeValidator(
            "fechaInicio",
            "fechaFin"
          )
        ]
      }
    );
  }

  //#endregion

  //#region Controles

  async fnLlenarComboboxPersonal(){

    const result = await this.activoService.GetAllPersonal();

    this.listaPersonal = result.response.data;
  }

  //#endregion

  //#region Acciones

  async fnGenerarExcel(){

    if(this.formDescuentoExcel.valid){

      this.spinner.show();

      const formulario = this.formDescuentoExcel.value;

      const model: ActivoDescuentosPersonalDTO = {
        nIdPersonal: Number(formulario.personal),
        dFechaInicio: formulario.fechaInicio,
        dFechaFin: formulario.fechaFin
      }

      const result = await this.activoService.GenerarExcelDescuentosPersonalActivos(model);

      if(result == null){
        this.spinner.hide();
        Swal.fire("Alerta","No se han encontrado registros basados en los filtros ingresados", "warning");
        return;
      }
      else{
        saveAs(result, 'Lista de descuentos.xlsx');
        this.spinner.hide();
        Swal.fire("Correcto", "Se ha generado el Excel", "success");
      }


    }
  }

  //#endregion

  //#region Validador

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
      return {};
    };
  }

  //#endregion

  fnSalir(){
    this.dialogRef.close();
  }

}
