import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatRadioGroup } from '@angular/material/radio';
import { MatSelectChange } from '@angular/material/select';
import moment from 'moment';
import { ISelectItem } from '../../../models/constantes';

@Component({
  selector: 'app-factura-transporte-header',
  templateUrl: './factura-transporte-header.component.html',
  styleUrls: ['./factura-transporte-header.component.css']
})
export class FacturaTransporteHeaderComponent implements OnInit {
  @Output() sendTipoEnvio: EventEmitter<string> = new EventEmitter<string>();
  @Output() sendEmpresa: EventEmitter<number> = new EventEmitter<number>();
  @Output() sendOperaciones: EventEmitter<void> = new EventEmitter<void>();
  @Output() sendOpenModal: EventEmitter<void> = new EventEmitter<void>();
  @Input() empresas: ISelectItem[];
  @Input() clientes: ISelectItem[];
  @Input() sucursales: ISelectItem[];
  tiposCCosto: ISelectItem[] = [];
  tiposEnvio: ISelectItem[] = [];
  tiposDestino: ISelectItem[] = [];
  form: FormGroup;

  constructor(
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      dInicio: [moment()],
      dFin: [moment()],
      sTipoCCsto: ['PRES'],
      sTipoEnvio: ['DIST'],
      nIdEmpresa: [Number(localStorage.getItem('Empresa'))],
      nIdCliente: [''],
      sTipoRuta: ['LIPR'],
      nSucCod: ['']
    })
  }

  ngOnInit(): void {
    this.LoadTiposGasto();
    this.LoadTiposEnvio();
    this.LoadTiposRuta();
  }

  LoadTiposGasto(): void {
    this.tiposCCosto.push({ nId: 'PRES', sDescripcion: 'Presupuesto Cliente' });
    this.tiposCCosto.push({ nId: 'COST', sDescripcion: 'Centro de Costo' });
  }
  LoadTiposEnvio(): void {
    this.tiposEnvio.push({ nId: 'DIST', sDescripcion: 'Distribución' });
    this.tiposEnvio.push({ nId: 'COUR', sDescripcion: 'Courier' });
  }
  LoadTiposRuta(): void {
    this.tiposDestino.push({ nId: 'LIPR', sDescripcion: 'Lima a Provincia' });
    this.tiposDestino.push({ nId: 'PRLI', sDescripcion: 'Provincia a Lima' });
  }

  get sTipoCCostoField(): FormControl { return this.form.get('sTipoCCsto') as FormControl; }
  get sTipoEnvioField(): FormControl { return this.form.get('sTipoEnvio') as FormControl; }
  get nSucCodField(): FormControl { return this.form.get('nSucCod') as FormControl; }
  get nIdEmpresaField(): FormControl { return this.form.get('nIdEmpresa') as FormControl; }

  get isCosto(): boolean {
    return this.sTipoCCostoField.value === 'COST' ? true : false;
  }
  get isDistribucion(): boolean {
    return this.sTipoEnvioField.value === 'DIST' ? true : false;
  }

  changeTipoEnvio(e: MatRadioGroup): void {
    this.sendTipoEnvio.emit(e.value);
  }

  changeEmpresa(e: MatSelectChange): void {
    this.nSucCodField.setValue('');
    this.sendEmpresa.emit(e.value);
  }

  fnGetOperaciones(): void {
    this.sendOperaciones.emit();
  }

  fnOpenModal(): void {
    this.sendOpenModal.emit();
  }
}
