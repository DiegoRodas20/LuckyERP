import { Component, OnInit, ViewChild } from '@angular/core';
import { observable, Observable, Subject, of, pipe } from 'rxjs';
import { Router } from '@angular/router';
import { SolicitudCotizacionService } from '../solicitud-cotizacion.service';
import { AbstractControl, AsyncValidatorFn, FormArray, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap, tap } from 'rxjs/operators';
import { speedDialFabAnimations } from '../speed-dial-fab.animations';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { DatePipe } from '@angular/common';


export const DD_MM_YYYY_Format = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  animations: [speedDialFabAnimations],
  selector: 'app-add-cotizacion',
  templateUrl: './add-cotizacion.component.html',
  styleUrls: ['./add-cotizacion.component.css'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_Format },
    DatePipe
  ]
})
export class AddCotizacionComponent implements OnInit {

  editarDireccion: boolean;
  FormArrCiudad = new FormArray([]);
  FormArrMedida = new FormArray([]);
  FormArrSexo = new FormArray([]);
  controlClienteReadOnly;
  controlCiudad = new FormControl('');
  selected = null;
  estadoEnviado = false;
  urlParamTextil = false;
  urlParamGeneral = false;
  @ViewChild(MatTable) table: MatTable<any>;
  displayedColumns: string[] = ['sCiudad', 'sProductoDescripcion', 'uMedida', 'sMarcaSugerida', 'nCantidad', 'editable'];
  displayedColumns2: string[] = ['sCiudad', 'sProductoDescripcion', 'sColor', 'sLogo', 'sTipoTela', 'sTalla', 'nIdSexo', 'nCantidad', 'editable'];
  tempData: IGeneralData[] = [{
    nIdCotizacionDet: null, uIdUndMedida: null, sDescripcion: null,
    sProductoDescripcion: '', sMarcaSugerida: '', nCantidad: null, nIdTipEle: null, sCod: null, sDesc: null
    , editable: true, sCodUndMedida: null
  }];
  tempData2: ITextilData[] = [{
    nIdCotizacionDet: null,
    sColor: '',
    sLogo: '',
    sTipoTela: '',
    sTalla: null,
    nIdSexo: null,
    nCantidad: null,
    sSexo: null,
    sProductoDescripcion: null,
    nIdTipEle: null,
    sCod: null,
    sDesc: null,
    editable: true
  }];
  solicitudCotizacion: ISolicitudCotizacion = {
    sTipoDoc: null, nIdEmpresaFK: null, sCorrelativo: null, nEj: null,
    nIdSolicitanteFK: null, nIdCentroCostoFK: null, nIdClienteFK: null, nIdLugarEntregaFK: null,
    dFchEntregaDeseada: null, sObservacion: null, dCreaFecha: null, nCreaIdUsrFK: null, nEstadoFK: null,
    sTitulo: null, nTipoOC: null, nIdCotizacion: null, sCod: null, lugarEntregaOtro: null
  };
  detSolicitudCotizacion: IDetSolicitudCotizacion = {
    nIdCotizacion: null, nIdSucursal: null, sProductoDescripcion: null,
    sMarcaSugerida: null, nCantidad: null
  };

  Solicitante: any = {};
  filterListaPptos: Observable<any>;
  filterListaPptosCiudad: Observable<any>[] = [];
  filterListaClientes: Observable<any>;
  filterListaLugaresEntrega: Observable<any>;
  filterListaSexo: Observable<any>[] = [];
  filterTipoOC: Observable<any>;
  controlLugarDeEntrega = new FormControl('', [Validators.required]);
  controlTipoCotizacion = new FormControl('', [Validators.required]);
  controlCliente = new FormControl('', [Validators.required]);
  controlSex = new FormControl('');
  controlPresupuesto = new FormControl('');
  controlObservacion = new FormControl('');
  controlFechaEntrega = new FormControl('', [Validators.required]);
  controlTitulo = new FormControl('', [Validators.required, this.noWhitespaceValidator]);
  controllugarEntregaOtro = new FormControl('', [Validators.required, this.noWhitespaceValidator]);
  minDate = new Date();
  fechaElegida: Date;
  tempSCAft = { nIdCotizacion: null, sCorrelativo: null, dCreaFecha: null, cEleNam: null };
  filterListaMedidas: Observable<any>[] = [];
  filterListaCiudad: Observable<any>[] = [];
  botonSolicitud: boolean;
  fabButtons = [
    {
      icon: 'close'
    },
    {
      icon: 'check_circle'
    }
  ];
  buttons = [];
  fabTogglerState = 'inactive';

  constructor(private router: Router, private solicitudCotizacionService: SolicitudCotizacionService,
    public dialog: MatDialog, private activatedRoute: ActivatedRoute) {
    this.showItems();
    this.activatedRoute.params.subscribe(res => {
      if (res.id === 'general') {
        this.urlParamGeneral = true;
        if (this.urlParamGeneral) {
          this.tempData.forEach((value, index, array) => {
            this.FormArrCiudad.push(new FormControl('', [Validators.required]));
            this.FormArrMedida.push(new FormControl('', [Validators.required]));
            this.filterCiudad(index);
            this.filterCiudadPresupuesto(index);
            this.filterMedida(index);
          });
        }
      } else if (res.id === 'textil') {
        this.urlParamTextil = true;
        if (this.urlParamTextil) {
          this.tempData2.forEach((value, index, array) => {
            this.FormArrCiudad.push(new FormControl('', [Validators.required]));
            this.FormArrSexo.push(new FormControl('', [Validators.required]));
            this.filterCiudad(index);
            this.filterCiudadPresupuesto(index);
            this.filterSexo(index);
          });
        }
      }
    });
  }
  ngOnInit(): void {
    this.CargarListasDatos();
    this.filterListaPptos = this.controlPresupuesto.valueChanges
      .pipe(
        startWith(''),
        distinctUntilChanged(),
        switchMap(value => {
          return this._filter(value || '');
        })
      );
    this.filterListaClientes = this.controlCliente.valueChanges
      .pipe(
        startWith(''),
        distinctUntilChanged(),
        switchMap(value => this._filter2(value || ''))
      );
    this.filterListaLugaresEntrega = this.controlLugarDeEntrega.valueChanges
      .pipe(
        startWith(''),
        distinctUntilChanged(),
        switchMap(value => this._filter6(value || ''))
      );
    this.filterTipoOC = this.controlTipoCotizacion.valueChanges
      .pipe(
        startWith(''),
        distinctUntilChanged(),
        switchMap(value => this._filter7(value || ''))
      );
    this.controlPresupuesto.valueChanges.subscribe(rx => {
      if (rx.toString().length > 0) {
        this.controlClienteReadOnly = true;
        if (this.solicitudCotizacion.nIdCentroCostoFK > 0) {
          /* this.filterListaPptosCiudad = this.controlCiudad.valueChanges.pipe(
             startWith(''),
             distinctUntilChanged(),
             switchMap(value => this._filter5(value || ''))
           );*/
          this.cleanTempArr();
        }
      } else {
        this.controlCliente.setValue('');
        this.controlCiudad.setValue('');
        this.solicitudCotizacion.nIdClienteFK = null;
        this.solicitudCotizacion.nIdCentroCostoFK = null;
        this.controlClienteReadOnly = false;
        this.cleanTempArr();
      }
    });
    this.escucharTitulo().subscribe(() => this.solicitudCotizacion.sTitulo = this.controlTitulo.value);
    this.escucharObservacion().subscribe(() => this.solicitudCotizacion.sObservacion = this.controlObservacion.value);
    this.escucharFechaEntrega().subscribe(() => this.solicitudCotizacion.dFchEntregaDeseada = this.controlFechaEntrega.value);
    this.escucharLugarEntregaOtro().subscribe(() => this.solicitudCotizacion.lugarEntregaOtro = this.controllugarEntregaOtro.value);
  }

  ControlsCiudad(i): any {
    return (this.FormArrCiudad.controls[i]);
  }

  ControlsSexo(i): any {
    return (this.FormArrSexo.controls[i]);
  }

  ControlsMedida(i): any {
    return (this.FormArrMedida.controls[i]);
  }

  filterCiudad(i) {
    this.filterListaCiudad[i] = this.FormArrCiudad.controls[i].valueChanges
      .pipe(
        startWith(''),
        distinctUntilChanged(),
        switchMap(value => this._filter4(value || ''))
      );
  }
  filterCiudadPresupuesto(i) {
    this.filterListaPptosCiudad[i] = this.FormArrCiudad.controls[i].valueChanges
      .pipe(
        startWith(''),
        distinctUntilChanged(),
        switchMap(value => this._filter5(value || ''))
      );
  }

  filterSexo(i) {
    this.filterListaSexo[i] = this.FormArrSexo.controls[i].valueChanges
      .pipe(
        startWith(''),
        distinctUntilChanged(),
        switchMap(value => this._filter8(value || ''))
      );
  }

  filterMedida(i) {
    this.filterListaMedidas[i] = this.FormArrMedida.controls[i].valueChanges
      .pipe(
        startWith(''),
        distinctUntilChanged(),
        switchMap(value => this._filter3(value || ''))
      );
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  _filter(value: string): Observable<any> {
    const valueConst = value.toString().toLowerCase();
    return this.ObtenerListaPresupuesto().pipe(
      map(response => response.filter(option => {
        return option.descripFull.toLowerCase().includes(valueConst);
      }))
    );
  }

  _filter2(value: string): Observable<any> {
    const valueConst = value.toString().toLowerCase();
    return this.ObtenerListaClientes().pipe(
      map(response => response.filter(option => {
        return option.razonSocial.toLowerCase().includes(valueConst);
      }))
    );
  }

  _filter3(value: string): Observable<any> {
    const valueConst = value.toString().toLowerCase();
    return this.ObtenerInfoMedidas().pipe(
      map(response => response.filter(option => {
        return option.sDescripcion.toLowerCase().includes(valueConst) ||
          option.sCodUndMedida.toLowerCase().includes(valueConst);
      }))
    );
  }

  _filter4(value: string): Observable<any> {
    const valueConst = value.toString().toLowerCase();
    return this.ObtenerListaCiudadesPresupuestoAll().pipe(
      map(response => response.filter(option => {
        return option.sDesc.toLowerCase().includes(valueConst) ||
          option.sCod.toLowerCase().includes(valueConst);
      }))
    );
  }

  _filter5(value: string): Observable<any> {
    const valueConst = value.toString().toLowerCase();
    return this.ObtenerListaCiudadesPresupuesto().pipe(
      map(response => response.filter(option => {
        return option.sDesc.toLowerCase().includes(valueConst) ||
          option.sCod.toLowerCase().includes(valueConst);
      }))
    );
  }

  _filter6(value: string): Observable<any> {
    const valueConst = value.toString().toLowerCase();
    return this.ObtenerListaLugaresEntrega().pipe(
      map(response => response.filter(option => {
        return option.descrip.toLowerCase().includes(valueConst)
        //  || option.sCod.toLowerCase().includes(valueConst);
      }))
    );
  }

  _filter7(value: string): Observable<any> {
    const valueConst = value.toString().toLowerCase();
    return this.ObtenerListaTipoOC().pipe(
      map(response => response.filter(option => {
        return option.cEleNam.toLowerCase().includes(valueConst);
      }))
    );
  }

  _filter8(value: string): Observable<any> {
    const valueConst = value.toString().toLowerCase();
    return this.ObtenerListaSexo().pipe(
      map(response => response.filter(option => {
        return option.cEleNam.toLowerCase().includes(valueConst);
      }))
    );
  }

  tapColumns(i) {
    if (i === 0) {
      return 'Cancelar';
    }
    if (i === 1) {
      return 'Guardar';
    }
  }

  showItems() {
    this.fabTogglerState = 'inactive';
    this.buttons = this.fabButtons;
  }

  hideItems() {
    /*this.fabTogglerState = 'inactive';
    this.buttons = [];*/
  }

  onToggleFab() {
    this.buttons.length ? this.hideItems() : this.showItems();
  }

  tap(i) {
    if (i === 0) {
      this.Regresar();
    }
    if (i === 1) {
      if (this.urlParamGeneral) {
        if (!this.verificarEnUrlGeneral()) {
          this.Touched();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Debe llenar todos los campos.'
          });
        } else {
          this.SwalFusionSolicitud();
        }
      }
      if (this.urlParamTextil) {
        if (!this.verificarEnUrlTextil()) {
          this.Touched();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Debe llenar todos los campos.'
          });
        } else {
          this.SwalFusionSolicitud();
        }
      }
    }
  }

  cleanTempArr(): void {
    this.FormArrCiudad.controls.forEach(res => res.setValue(''));
    if (this.urlParamGeneral) {
      this.tempData.forEach(data => {
        data.nIdTipEle = null;
        data.sDesc = null;
        data.editable = true;
      });
    }
    if (this.urlParamTextil) {
      this.tempData2.forEach(data => {
        data.nIdTipEle = null;
        data.sDesc = null;
        data.editable = true;
      });
    }
  }

  cssTablaGeneral(): boolean {
    const th = Array.from(document.getElementsByTagName('th'));
    th[0].style.textAlign = 'left';
    th[1].style.textAlign = 'center';
    th[2].style.textAlign = 'center';
    th[3].style.textAlign = 'center';
    th[4].style.textAlign = 'center';
    th[5].style.textAlign = 'center';
    return true;
  }

  cssTablaTextil(): boolean {
    const th = Array.from(document.getElementsByTagName('th'));
    th[0].style.textAlign = 'left';
    th[1].style.textAlign = 'center';
    th[2].style.textAlign = 'center';
    th[3].style.textAlign = 'center';
    th[4].style.textAlign = 'center';
    th[5].style.textAlign = 'center';
    th[6].style.textAlign = 'center';
    th[7].style.textAlign = 'center';
    th[8].style.textAlign = 'center';
    return true;
  }

  async CargarListasDatos() {
    this.solicitudCotizacion.nEj = new Date().getFullYear();
    this.ObtenerSolicitante().subscribe(res => {
      this.Solicitante = res;
      this.solicitudCotizacion.nIdSolicitanteFK = res.idSolicitante;
      this.solicitudCotizacion.nCreaIdUsrFK = res.idUser;
    });
  }

  InsertarSolicitudDeCotizacion(): Observable<any> {
    const subject = new Subject();
    this.solicitudCotizacion.sTipoDoc = 'SC';
    this.solicitudCotizacion.nIdEmpresaFK = Number(localStorage.getItem('Empresa'));
    this.solicitudCotizacion.sCorrelativo = '9prueba';
    this.solicitudCotizacion.sObservacion = this.controlObservacion.value;
    this.solicitudCotizacion.sTitulo = this.controlTitulo.value;
    this.solicitudCotizacion.lugarEntregaOtro = this.controllugarEntregaOtro.value;
    const fchEntrega = new Date(this.fechaElegida).toLocaleDateString();
    const auxfchEntrega: string[] = fchEntrega.split('/');
    const today = new Date();
    const time = today.getHours() + ':' + (today.getMinutes() + 1) + ':' + today.getSeconds();
    this.solicitudCotizacion.dFchEntregaDeseada = auxfchEntrega[1] + '-' + auxfchEntrega[0] + '-' + auxfchEntrega[2] + ' ' + time;
    const dCreaFecha = new Date().toLocaleDateString();
    const auxdCreaFecha: string[] = dCreaFecha.split('/');
    this.solicitudCotizacion.dCreaFecha = auxdCreaFecha[1] + '-' + auxdCreaFecha[0] + '-' + auxdCreaFecha[2] + ' ' + time;
    this.solicitudCotizacion.nEstadoFK = 2178; // Estado pendiente
    // if (this.solicitudCotizacion.nIdClienteFK == 0) {
    //   this.solicitudCotizacion.lugarEntregaOtro
    // }
    // else {
    //   this.solicitudCotizacion.lugarEntregaOtro = 'NULL';
    // }
    const params = [];
    params.push(this.solicitudCotizacion.sTipoDoc);
    params.push(this.solicitudCotizacion.nIdEmpresaFK);
    params.push(this.solicitudCotizacion.sCorrelativo);
    params.push(this.solicitudCotizacion.nEj);
    params.push(this.solicitudCotizacion.nIdSolicitanteFK);
    params.push(this.solicitudCotizacion.nIdCentroCostoFK);
    params.push(this.solicitudCotizacion.nIdClienteFK);
    params.push(this.solicitudCotizacion.nIdLugarEntregaFK);
    params.push(this.solicitudCotizacion.dFchEntregaDeseada);
    params.push(this.solicitudCotizacion.sObservacion);
    params.push(this.solicitudCotizacion.dCreaFecha);
    params.push(this.solicitudCotizacion.nCreaIdUsrFK);
    params.push(this.solicitudCotizacion.nEstadoFK);
    params.push(this.solicitudCotizacion.sTitulo);
    params.push(this.solicitudCotizacion.nTipoOC);
    params.push(this.solicitudCotizacion.lugarEntregaOtro);
    console.log(params);


    this.solicitudCotizacionService.crudSolicitudCotizacion(2, params, '|').subscribe(
      (res) => {
        subject.next(res);
      }
    );
    return subject.asObservable();
  }


  ObtenerSolicitante(): Observable<any> {
    const subject = new Subject();
    const user = localStorage.getItem('currentUser');
    const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    const params = [];
    params.push(idUser);
    this.solicitudCotizacionService.crudSolicitudCotizacion(4, params, '|').subscribe(
      (res) => {
        subject.next(res);
      }
    );
    return subject.asObservable();
  }

  ObtenerListaClientes(): Observable<any> {
    const subject = new Subject();
    this.solicitudCotizacionService.crudSolicitudCotizacion(6, [], '|').subscribe(
      (res) => {
        subject.next(res);
      }
    );
    return subject.asObservable();
  }

  ObtenerListaTipoOC(): Observable<any> {
    const subject = new Subject();
    this.solicitudCotizacionService.crudSolicitudCotizacion(18, [], '|').subscribe(
      (res) => {
        subject.next(res);
      }
    );
    return subject.asObservable();
  }

  ObtenerListaLugaresEntrega(): Observable<any> {
    const subject = new Subject();
    const idPais = Number(localStorage.getItem('Pais'));
    const params = [];
    params.push(0);
    params.push(idPais);
    this.solicitudCotizacionService.crudSolicitudCotizacion(8, params, '|').subscribe(
      (res) => {
        subject.next(res);
      }
    );
    return subject.asObservable();
  }


  ObtenerListaPresupuesto(): Observable<any> {
    const subject = new Subject();
    const user = localStorage.getItem('currentUser');
    const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    const idEmpresa = localStorage.getItem('Empresa');
    const params = [];
    params.push(idEmpresa);
    params.push(idUser);
    this.solicitudCotizacionService.crudSolicitudCotizacion(5, params, '|').subscribe(
      (res) => {
        subject.next(res);
      }
    );
    return subject.asObservable();
  }

  ObtenerListaSexo(): Observable<any> {
    const subject = new Subject();
    this.solicitudCotizacionService.crudSolicitudCotizacion(23, [], '|').subscribe(res => subject.next(res));
    return subject.asObservable();
  }

  ObtenerListaCiudadesPresupuesto(): Observable<any> {
    const subject = new Subject();
    const idPais = Number(localStorage.getItem('Pais'));
    const params = [];
    params.push(this.solicitudCotizacion.nIdCentroCostoFK);
    params.push(idPais);
    this.solicitudCotizacionService.crudSolicitudCotizacion(34, params, '|').subscribe(rx => subject.next(rx));
    return subject.asObservable();
  }

  ObtenerListaCiudadesPresupuestoAll(): Observable<any> {
    const subject = new Subject();
    const idPais = Number(localStorage.getItem('Pais'));
    const params = [];
    params.push(idPais);
    this.solicitudCotizacionService.crudSolicitudCotizacion(35, params, '|').subscribe(rx => subject.next(rx));
    return subject.asObservable();
  }

  InsertDetSolicitudCotizacion(): Observable<any> {
    const subject = new Subject();
    const params = [];
    let pOpcion = null;
    if (this.urlParamGeneral) {
      pOpcion = 11;
      this.tempData.forEach((detalle) => {
        params.push(this.detSolicitudCotizacion.nIdCotizacion + '|' + detalle.nIdTipEle
          + '|' + detalle.sProductoDescripcion + '|' +
          detalle.sMarcaSugerida + '|' + detalle.nCantidad + '|' + detalle.uIdUndMedida);
      });
    } else if (this.urlParamTextil) {
      pOpcion = 22;
      this.tempData2.forEach((detalle) => {
        params.push(this.detSolicitudCotizacion.nIdCotizacion + '|' + detalle.nIdTipEle
          + '|' + detalle.sColor + '|' +
          detalle.sLogo + '|' + detalle.sTipoTela + '|' + null + '|' + detalle.sTalla + '|' + detalle.nIdSexo + '|' + detalle.nCantidad + '|' + detalle.sProductoDescripcion);
      });
    }
    if (params.length > 0) {
      this.solicitudCotizacionService.crudSolicitudCotizacion(pOpcion, params, '*').subscribe(
        (res) => {
          subject.next(res);
        }
      );
    }
    return subject.asObservable();
  }

  SwalFusionSolicitud(): void {
    Swal.fire({
      title: '¿Desea guardar la cotización?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: `Aceptar`,
      denyButtonText: `Cancelar`,
    }).then(result => {
      if (result.isConfirmed) {
        this.FusionSolicitud();
      } else if (result.isDenied) {
      }
    });
  }

  FusionSolicitud(): any {
    this.InsertarSolicitudDeCotizacion().subscribe(res => {
      this.botonSolicitud = true;
      this.solicitudCotizacion.nIdCotizacion = res.nIdCotizacion;
      this.detSolicitudCotizacion.nIdCotizacion = res.nIdCotizacion;
      this.tempSCAft.sCorrelativo = res.sCorrelativo;
      this.tempSCAft.dCreaFecha = res.dCreaFecha;
      this.tempSCAft.cEleNam = res.cEleNam;
      this.InsertDetSolicitudCotizacion().subscribe(() => this.router.navigateByUrl
        ('comercial/requerimiento/solicitud_cotizacion/detalle/' + this.solicitudCotizacion.nIdCotizacion));
    });
  }

  Regresar() {
    this.router.navigateByUrl('comercial/requerimiento/solicitud_cotizacion/ver');
  }

  presupuestoSeleccionado(event: MatAutocompleteSelectedEvent) {
    const seleccionado = event.option.value;
    this.solicitudCotizacion.nIdCentroCostoFK = seleccionado.codx;
    // CLIENTE
    this.solicitudCotizacion.nIdClienteFK = seleccionado.nIdCliente;
    this.controlCliente.setValue(seleccionado.razonSocial);
    //
    this.selected = seleccionado.cod;
    this.controlPresupuesto.setValue(seleccionado.descrip);
  }

  clienteSeleccionado(event: MatAutocompleteSelectedEvent) {
    const seleccionado = event.option.value;
    this.solicitudCotizacion.nIdClienteFK = seleccionado.idCliente;
    this.controlCliente.setValue(seleccionado.razonSocial);
  }

  lugarDeEntregaSeleccionado(event: MatAutocompleteSelectedEvent) {

    const seleccionado = event.option.value;
    this.solicitudCotizacion.nIdLugarEntregaFK = seleccionado.idLugar;
    this.solicitudCotizacion.sCod = seleccionado.sCod;
    this.controlLugarDeEntrega.setValue(seleccionado.descrip);
    this.editarDireccion = true
    if (seleccionado.sCod == "")
      this.editarDireccion = false
    this.controllugarEntregaOtro.setValue(seleccionado.sCod);


  }

  SexoSeleccionado(event: MatAutocompleteSelectedEvent, element) {
    const seleccionado = event.option.value;
    element.nIdSexo = seleccionado.nEleCod;
    element.sSexo = seleccionado.cEleNam;
  }

  TipoOCSeleccionado(event: MatAutocompleteSelectedEvent) {
    const seleccionado = event.option.value;
    this.solicitudCotizacion.nTipoOC = seleccionado.nEleCod;
    this.controlTipoCotizacion.setValue(seleccionado.cEleNam);
  }

  DeshabilitarEdicion(element): void {
    element.editable = false;
  }

  HabilitarEdicion(element): void {
    element.editable = true;
  }

  InsertarElemento(element): void {
    // element.editable = false;
    this.FormArrCiudad.push(new FormControl('', [Validators.required]
    ));
    this.FormArrMedida.push(new FormControl('', [Validators.required]));
    this.tempData.push({
      nIdCotizacionDet: null, uIdUndMedida: null, sDescripcion: null, sProductoDescripcion: '', sMarcaSugerida: '',
      nCantidad: null, nIdTipEle: null, sCod: null, sDesc: null, editable: true, sCodUndMedida: null
    });
    this.table.renderRows();
    this.filterCiudad(this.tempData.length - 1);
    this.filterCiudadPresupuesto(this.tempData.length - 1);
    this.filterMedida(this.tempData.length - 1);
  }

  InsertIntoArr() {
    this.FormArrCiudad.push(new FormControl('', [Validators.required]
    ));
    this.FormArrMedida.push(new FormControl('', [Validators.required]));
    this.tempData.push({
      nIdCotizacionDet: null, uIdUndMedida: null, sDescripcion: null, sProductoDescripcion: '', sMarcaSugerida: '',
      nCantidad: null, nIdTipEle: null, sCod: null, sDesc: null, editable: true, sCodUndMedida: null
    });
    this.table.renderRows();
    this.filterCiudad(this.tempData.length - 1);
    this.filterCiudadPresupuesto(this.tempData.length - 1);
    this.filterMedida(this.tempData.length - 1);
  }

  InsertIntoArr2() {
    this.FormArrCiudad.push(new FormControl('', [Validators.required]));
    this.FormArrSexo.push(new FormControl('', [Validators.required]));
    this.tempData2.push({
      nIdCotizacionDet: null,
      sColor: '',
      sLogo: '',
      sTipoTela: '',
      sTalla: null,
      nIdSexo: null,
      nCantidad: null,
      sSexo: null,
      sProductoDescripcion: null,
      nIdTipEle: null,
      sCod: null,
      sDesc: null,
      editable: true
    });
    this.table.renderRows();
    this.filterCiudad(this.tempData2.length - 1);
    this.filterCiudadPresupuesto(this.tempData2.length - 1);
    this.filterSexo(this.tempData2.length - 1);
  }

  InsertarElemento2(element): void {
    element.editable = false;
    this.FormArrSexo.push(new FormControl('', [Validators.required]));
    this.FormArrCiudad.push(new FormControl('', [Validators.required]
    ));
    this.tempData2.push({
      nIdCotizacionDet: null,
      sColor: '',
      sLogo: '',
      sTipoTela: '',
      sTalla: null,
      nIdSexo: null,
      nCantidad: null,
      sSexo: null,
      sProductoDescripcion: null,
      nIdTipEle: null,
      sCod: null,
      sDesc: null,
      editable: true
    });
    this.table.renderRows();
    this.filterCiudad(this.tempData2.length - 1);
    this.filterCiudadPresupuesto(this.tempData2.length - 1);
    this.filterSexo(this.tempData2.length - 1);
  }

  obtenerNombreColumna(valor: string): string {
    switch (valor) {
      case 'sCiudad':
        return 'Ciudad';
      case 'sProductoDescripcion':
        return 'Artículo';
      case 'uMedida':
        return 'Ud. Medida';
      case 'sMarcaSugerida':
        return 'Marca';
      case 'nCantidad':
        return 'Cantidad';
      case 'editable':
        return '';
    }
  }

  obtenerNombreColumna2(valor: string): string {
    switch (valor) {
      case 'sCiudad':
        return 'Ciudad';
      case 'sProductoDescripcion':
        return 'Artículo';
      case 'sColor':
        return 'Color';
      case 'sLogo':
        return 'Logo';
      case 'sTipoTela':
        return 'Tipo tela';
      case 'nCantidad':
        return 'Cantidad';
      case 'sTalla':
        return 'Talla';
      case 'nIdSexo':
        return 'Sexo';
      case 'editable':
        return '';
    }
  }

  ObtenerInfoMedidas(): Observable<any> {
    const subject = new Subject();
    this.solicitudCotizacionService.crudSolicitudCotizacion(30, [], '|').subscribe(
      res => {
        subject.next(res);
      }
    );
    return subject.asObservable();
  }

  verificarEnUrlGeneral(): boolean {
    if (this.verificarPrincipal() && this.verificarDetalleGeneral()) {
      return true;
    }
  }
  verificarEnUrlTextil(): boolean {
    if (this.verificarPrincipal() && this.verificarDetalleTextil()) {
      return true;
    }
  }
  verificarPrincipal(): boolean {
    return (this.solicitudCotizacion.sTitulo != null && this.controlTitulo.valid
      && this.solicitudCotizacion.nTipoOC != null && this.controlTipoCotizacion.valid
      && this.solicitudCotizacion.nIdClienteFK != null && this.controlCliente.valid
      && this.solicitudCotizacion.nIdLugarEntregaFK != null && this.controlLugarDeEntrega.valid
      && this.solicitudCotizacion.dFchEntregaDeseada != null && this.controlFechaEntrega.valid);
  }

  escucharTitulo(): Observable<boolean> {
    const subject = new Subject<boolean>();
    this.controlTitulo.valueChanges.subscribe(
      res => {
        if (res.length > 0) {
          return subject.next(true);
        } else if (res.length === 0) {
          return subject.next(false);
        }
      }
    );
    return subject.asObservable();
  }

  escucharLugarEntregaOtro(): Observable<boolean> {
    const subject = new Subject<boolean>();
    this.controllugarEntregaOtro.valueChanges.subscribe(
      res => {
        if (res.length > 0) {
          return subject.next(true);
        } else if (res.length === 0) {
          return subject.next(false);
        }
      }
    );
    return subject.asObservable();
  }


  escucharLugarEntrega(): Observable<boolean> {
    const subject = new Subject<boolean>();
    this.controlLugarDeEntrega.valueChanges.subscribe(
      res => {
        if (res.length > 0) {
          return subject.next(true);
        } else if (res.length === 0) {
          // this.solicitudCotizacion.nIdLugarEntregaFK = null;
          return subject.next(false);
        }
      }
    );
    return subject.asObservable();
  }

  escucharObservacion(): Observable<boolean> {
    const subject = new Subject<boolean>();
    this.controlObservacion.valueChanges.subscribe(
      res => {
        if (res.length > 0) {
          return subject.next(true);
        } else if (res.length === 0) {
          return subject.next(false);
        }
      }
    );
    return subject.asObservable();
  }

  escucharFechaEntrega(): Observable<boolean> {
    const subject = new Subject<boolean>();
    this.controlFechaEntrega.valueChanges.subscribe(
      res => {
        if (res != null) {
          return subject.next(true);
        }
      }
    );
    return subject.asObservable();
  }

  UdSeleccionado(event: MatAutocompleteSelectedEvent, element) {
    const seleccionado = event.option.value;
    element.uIdUndMedida = seleccionado.uIdUndMedida;
    element.sDescripcion = seleccionado.sDescripcion;
  }

  CiudadPPSeleccionado(event: MatAutocompleteSelectedEvent, element) {
    const seleccionado = event.option.value;
    element.nIdTipEle = seleccionado.nIdTipEle;
    element.sDesc = seleccionado.sDesc;
  }

  getOptionTextCity(option) {
    if (option !== null) {
      return option.sDesc;
    }
  }

  getOptionTextMedida(option) {
    if (option != null) {
      return option.sDescripcion;
    }
  }

  getOptionTextCit2(option) {
    if (option !== null) {
      return option.sDesc;
    }
  }

  getOptionTextSex(option) {
    return option.cEleNam;
  }

  EliminarElemento(i) {
    if (i !== 0) {
      this.tempData.splice(i, 1);
      this.FormArrCiudad.controls.splice(i, 1);
      this.filterListaCiudad.splice(i, 1);
      this.filterListaPptosCiudad.splice(i, 1);
      this.FormArrMedida.controls.splice(i, 1);
      this.filterListaMedidas.splice(i, 1);
      this.table.renderRows();
    }
  }

  EliminarElemento2(i) {
    if (i !== 0) {
      this.tempData2.splice(i, 1);
      this.FormArrCiudad.controls.splice(i, 1);
      this.FormArrSexo.controls.splice(i, 1);
      this.filterListaCiudad.splice(i, 1);
      this.filterListaPptosCiudad.splice(i, 1);
      this.table.renderRows();
    }
  }


  verificarDetalleGeneral(): boolean {
    const result = this.tempData.every(res => res.nIdTipEle > 0 && res.sProductoDescripcion.length > 0
      && res.uIdUndMedida > 0 && res.sMarcaSugerida.length > 0 && res.nCantidad > 0);
    return result;
  }
  verificarDetalleTextil(): boolean {
    const result = this.tempData2.every(res => res.nIdTipEle > 0 && res.sColor.length > 0
      && res.sLogo.length > 0 && res.sTipoTela.length > 0 && res.nIdSexo > 0 && res.nCantidad > 0);
    return result;
  }

  Touched() {
    this.controlTitulo.markAsTouched();
    this.controlTipoCotizacion.markAsTouched();
    this.controlCliente.markAsTouched();
    this.controlLugarDeEntrega.markAsTouched();
    this.controlFechaEntrega.markAsTouched();
    this.FormArrCiudad.markAsTouched();
  }
}

export interface ISolicitudCotizacion {
  nIdCotizacion: number;
  sTipoDoc: string;
  nIdEmpresaFK: number;
  sCorrelativo: string;
  nEj: number;
  nIdSolicitanteFK: number;
  nIdCentroCostoFK: number;
  nIdClienteFK: number;
  nIdLugarEntregaFK: number;
  dFchEntregaDeseada: string;
  sObservacion: string;
  dCreaFecha: string;
  nCreaIdUsrFK: number;
  /*dModFecha: Date;
  dModIdUsrFK: number;
  */
  nEstadoFK: number;
  sTitulo: string;
  nTipoOC: number;
  sCod: string;
  lugarEntregaOtro: string;
}

export interface IDetSolicitudCotizacion {
  nIdCotizacion: number;
  nIdSucursal: number;
  sProductoDescripcion: string;
  sMarcaSugerida: string;
  nCantidad: number;
}

export interface IGeneralData {
  nIdCotizacionDet: number;
  sProductoDescripcion: string;
  sMarcaSugerida: string;
  nCantidad: number;
  uIdUndMedida: number;
  sDescripcion: string;
  editable: boolean;
  nIdTipEle: number;
  sCod: string;
  sDesc: string;
  sCodUndMedida: string;
}

export interface ITextilData {
  nIdCotizacionDet: number;
  sColor: string;
  sLogo: string;
  sTipoTela: string;
  sTalla: string;
  nIdSexo: number;
  sSexo: string;
  nCantidad: number;
  sProductoDescripcion: string;
  nIdTipEle: number;
  sCod: string;
  sDesc: string;
  editable: boolean;
}
