import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatListOption } from '@angular/material/list';
import { MatSelect } from '@angular/material/select';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ISelectItem } from 'src/app/modulos/AAHelpers';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { EEsquema, Esquema, EsquemaColumn, Ubigeo } from '../../../../Model/esquemas';
import { EsquemasService } from '../../../../Services/esquemas.service';

@Component({
  selector: 'app-esquema-infopersonal',
  templateUrl: './esquema-infopersonal.component.html',
  styleUrls: ['./esquema-infopersonal.component.css'],
  animations: [adminpAnimations]
})
export class EsquemaInfopersonalComponent implements OnInit {
  @Input() data: {
    nroEsquema: number;
    seleccionados: string[],
    fgFilter: unknown
  };
  depas: Ubigeo.DepaDto[];
  provs: Ubigeo.ProvDto[];
  dists: Ubigeo.DistDto[];
  personas: ISelectItem[];
  planillas: ISelectItem[];
  sucursales: ISelectItem[];
  generos: ISelectItem[];
  estCiviles: ISelectItem[];
  nacionalidades: ISelectItem[];
  jefesInmediato: ISelectItem[];
  regPensionarios: ISelectItem[];
  direcciones: ISelectItem[];
  areas: ISelectItem[];
  haberBancos: ISelectItem[];
  ctsBancos: ISelectItem[];
  fieldsCtrl = new FormControl('');
  form: FormGroup;

  /* #region  Fab */
  fbDetail = [
    { icon: 'search', tool: 'Buscar', dis: false },
    { icon: 'cancel', tool: 'Cancelar', dis: false }
  ];
  abDetail = [];
  tsDetail = 'inactive';
  /* #endregion */

  fields: EsquemaColumn[] = [
    { header: 'Apellidos y Nombres', field: 'sNombreCompleto', type: 'title', width: 250, align: 'left' },
    { header: 'Fecha Nac.', field: 'sFechaNacimiento', type: null, width: 100, align: 'center' },
    { header: 'Género', field: 'sSexo', type: null, width: 80, align: 'left' },
    { header: 'Est. Civil', field: 'sEstCivil', type: null, width: 80, align: 'left' },
    { header: 'Celular', field: 'sNroCelular', type: null, width: 80, align: 'center' },
    { header: 'Correo', field: 'sCorreo', type: null, width: 250, align: 'left' },
    { header: 'Jefe Inmediato', field: 'sResponsable', type: null, width: 250, align: 'left' },
    {
      header: 'Documento', field: 'sDocumento',
      columns: [
        { header: 'Tipo', field: 'sTipoDocumento', type: null, width: 50, align: 'left' },
        { header: 'Nro.', field: 'sNroDocumento', type: null, width: 80, align: 'center' }
      ]
    },
    {
      header: 'Domicilio', field: 'sDomicilio',
      columns: [
        { header: 'Dirección', field: 'sDireccion', type: null, width: 200, align: 'left' },
        { header: 'Departamento', field: 'sDepartamento', type: null, width: 100, align: 'left' },
        { header: 'Provincia', field: 'sProvincia', type: null, width: 100, align: 'left' },
        { header: 'Distrito', field: 'sDistrito', type: null, width: 150, align: 'left' },
        { header: 'Referencia', field: 'sReferencia', type: null, width: 150, align: 'left' }
      ]
    },
    { header: 'Cod. Ubigeo', field: 'sCodUbigeo', type: null, width: 80, align: 'center' },
    {
      header: 'Periodo Laboral', field: 'sPeriodo',
      columns: [
        { header: 'F. Ingreso', field: 'sFechaIni', type: null, width: 80, align: 'center' },
        { header: 'F. Cese', field: 'sFechaFin', type: null, width: 80, align: 'center' },
        { header: 'Motivo', field: 'sMotivo', type: null, width: 80, align: 'left' }
      ]
    },
    { header: 'Planilla', field: 'sPlanilla', type: null, width: 250, align: 'left' },
    {
      header: 'Organización', field: 'sOrganizacion',
      columns: [
        { header: 'Dirección', field: 'sOrgDir', type: null, width: 200, align: 'left' },
        { header: 'Área', field: 'sOrgArea', type: null, width: 200, align: 'left' },
        { header: 'Cargo', field: 'sOrgCargo', type: null, width: 200, align: 'left' },
        { header: 'Puesto', field: 'sOrgPuesto', type: null, width: 200, align: 'left' },
        { header: 'Especialidad', field: 'sOrgEspec', type: null, width: 200, align: 'left' }
      ]
    },
    {
      header: 'Sistema Pensionario', field: 'sSistemaPensionario',
      columns: [
        { header: 'Tipo', field: 'sRegTipo', type: null, width: 80, align: 'left' },
        { header: 'Nombre', field: 'sRegPensionario', type: null, width: 120, align: 'left' },
        { header: 'Cuspp', field: 'sRegCuspp', type: null, width: 80, align: 'center' }
      ]
    },
    {
      header: 'Cuenta Haberes', field: 'sCuentaHaberes',
      columns: [
        { header: 'Banco', field: 'sHaberesBanco', type: null, width: 120, align: 'left' },
        { header: 'Cuenta', field: 'sHaberesCuenta', type: null, width: 100, align: 'center' },
        { header: 'Moneda', field: 'sHaberesMoneda', type: null, width: 80, align: 'center' },
        { header: 'Documento', field: 'sHaberesDocumento', type: null, width: 80, align: 'center' }
      ]
    },
    {
      header: 'Cuenta CTS', field: 'sCuentaCts',
      columns: [
        { header: 'Banco', field: 'sCTSBanco', type: null, width: 120, align: 'left' },
        { header: 'Cuenta', field: 'sCTSCuenta', type: null, width: 100, align: 'left' },
        { header: 'Moneda', field: 'sCTSMoneda', type: null, width: 80, align: 'center' },
        { header: 'Documento', field: 'sCTSDocumento', type: null, width: 80, align: 'center' }
      ]
    },
    {
      header: 'Sueldo', field: 'sSueldo',
      columns: [
        { header: 'Tipo', field: 'sSueldoTipo', type: null, width: 80, align: 'left' },
        { header: 'Concepto', field: 'sSueldoBasico', type: null, width: 120, align: 'left' }
      ]
    },
    { header: 'Sucursal', field: 'sSucursal', type: null, width: 100, align: 'left' },
    {
      header: 'Contrato', field: 'sContrato',
      columns: [
        { header: 'Tipo', field: 'sContratoTipo', type: null, width: 80, align: 'center' },
        { header: 'F. Inicio', field: 'sContratoIni', type: null, width: 80, align: 'center' },
        { header: 'F. Fin', field: 'sContratoFin', type: null, width: 80, align: 'center' }
      ]
    },
  ]

  constructor(
    private activeModal: NgbActiveModal,
    private spi: NgxSpinnerService,
    private fb: FormBuilder,
    private esquemaService: EsquemasService
  ) {
    this.form = this.fb.group({
      nPersonas: [null],
      nGenero: [1681],
      nEstadosCivil: [null],
      nNacionalidades: [null],
      nJefes: [null],
      nIdPlanillas: [null],
      nIdSucursales: [null],
      nIdRegPensiones: [null],
      sCuspp: [null],
      sDepa: [0],
      sProv: [{ value: 0, disabled: true }],
      sDist: [{ value: 0, disabled: true }],
      nIdDirecciones: [null],
      nIdAreas: [null],
      nIdBancosHaber: [null],
      nIdBancosCts: [null],
    });
  }

  ngOnInit(): void {
    this.onToggleFab(1, 1);
    this.loadCombos();
    this.changeDepa();
    this.changeProv();
    const lst = this.data.seleccionados?.length > 0 ? this.fields.filter(item => this.data.seleccionados.includes(item.field)) : this.fields.filter(item => item.disable);
    this.fieldsCtrl.setValue(lst, { emitEvent: false });
  }

  changeDepa(): void {
    this.form.get('sDepa').valueChanges.subscribe(value => {
      if (value == 0) {
        this.form.get('sProv').setValue(0);
        this.form.get('sProv').disable({ emitEvent: false });
      } else {
        this.form.get('sProv').enable({ emitEvent: false });
        this.provs = this.depas.find(item => item.sCodDepa = value).provincias;
      }
    });
  }

  changeProv(): void {
    this.form.get('sProv').valueChanges.subscribe(value => {
      if (value == 0) {
        this.form.get('sDist').setValue(0);
        this.form.get('sDist').disable({ emitEvent: false });
      } else {
        this.form.get('sDist').enable({ emitEvent: false });
        this.dists = this.provs.find(item => item.sCodProv = value).distritos;
      }
    });
  }

  loadCombos(): void {
    const p01 = this.esquemaService.getAllItems(this.data.nroEsquema, EEsquema.InfoPersonal.PERSONAL);
    const p02 = this.esquemaService.getAllItems(this.data.nroEsquema, EEsquema.InfoPersonal.PLANILLA);
    const p03 = this.esquemaService.getAllItems(this.data.nroEsquema, EEsquema.InfoPersonal.SUCURSAL);
    const p04 = this.esquemaService.getAllItems(this.data.nroEsquema, EEsquema.InfoPersonal.GENERO);
    const p05 = this.esquemaService.getAllItems(this.data.nroEsquema, EEsquema.InfoPersonal.ESTADO_CIVIL);
    const p06 = this.esquemaService.getAllItems(this.data.nroEsquema, EEsquema.InfoPersonal.NACIONALIDAD);
    const p07 = this.esquemaService.getAllItems(this.data.nroEsquema, EEsquema.InfoPersonal.JEFE_INMEDIATO);
    const p08 = this.esquemaService.GetAllUbigeo();
    const p09 = this.esquemaService.getAllItems(this.data.nroEsquema, EEsquema.InfoPersonal.DIRECCION);
    const p10 = this.esquemaService.getAllItems(this.data.nroEsquema, EEsquema.InfoPersonal.AREA);
    const p11 = this.esquemaService.getAllItems(this.data.nroEsquema, EEsquema.InfoPersonal.BANCO, EEsquema.TipoBanco.HABERES);
    const p12 = this.esquemaService.getAllItems(this.data.nroEsquema, EEsquema.InfoPersonal.BANCO, EEsquema.TipoBanco.CTS);
    const p13 = this.esquemaService.getAllItems(this.data.nroEsquema, EEsquema.InfoPersonal.REGIMEN_PENSIONARIO);

    const grupo1 = Promise.all([p01, p02, p03, p04, p05, p06, p07, p08, p09, p10]);
    const grupo2 = Promise.all([p11, p12, p13]);

    this.spi.show('spi_new');
    Promise.all([grupo1, grupo2]).then(([res1, res2]) => {
      this.personas = res1[0];
      this.planillas = res1[1];
      this.sucursales = res1[2];
      this.generos = res1[3];
      this.estCiviles = res1[4];
      this.nacionalidades = res1[5];
      this.jefesInmediato = res1[6];
      this.depas = res1[7];
      this.direcciones = res1[8];
      this.areas = res1[9];
      this.haberBancos = res2[0];
      this.ctsBancos = res2[1];
      this.regPensionarios = res2[2];
    }).finally(() => { this.spi.hide('spi_new') });
  }

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = (stat === -1) ? (this.abDetail.length > 0) ? 0 : 1 : stat;
        this.tsDetail = (stat === 0) ? 'inactive' : 'active';
        this.abDetail = (stat === 0) ? [] : this.fbDetail;
        break;
    }
  }

  toggleAllSelectionField(allSelected: MatListOption) {
    if (allSelected.selected) {
      this.fieldsCtrl.patchValue([0, ...this.fields]);
    } else {
      const vFields = this.fields.filter(item => item.disable);
      this.fieldsCtrl.patchValue(vFields);
    }
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnSearch();
        break;
      case 1:
        this.activeModal.dismiss();
        break;
    }
  }

  toggleAllSelection(matSelect: MatSelect) {
    const isSelected = matSelect.options.filter((item: MatOption) => item.value === 0).map((item: MatOption) => item.selected)[0];
    if (isSelected) {
      matSelect.options.map((item: MatOption) => item.select());
    } else {
      matSelect.options.map((item: MatOption) => item.deselect());
    }
  }

  fnSearch(): void {
    if (this.form.invalid) {
      return Object.values(this.form.controls).forEach(control => { control.markAllAsTouched() })
    }
    const vFields = this.fieldsCtrl.value;
    isNaN(vFields[0]) ? null : vFields.splice(0, 1);
    this.spi.show('spi_new');
    const filter: Esquema.InfoPersonalFilter = {}
    this.esquemaService.GetSearchEsquemaInfoPersonal(filter).then(
      res => {
        const result = { 'fields': vFields, 'data': res ?? [], 'fgFilter': this.form.value }
        this.activeModal.close(result);
      }
    ).finally(() => this.spi.hide('spi_new'));
  }

  fnCloseModal(): void {
    this.activeModal.dismiss();
  }
}
