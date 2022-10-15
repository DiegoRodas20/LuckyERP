/* tslint:disable:no-trailing-whitespace */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { SolicitudCotizacionService } from '../solicitud-cotizacion.service';
import { Observable, Subject } from 'rxjs';
import { MatTable } from '@angular/material/table';
import { IGeneralData, ITextilData } from '../add-cotizacion/add-cotizacion.component';
import { FormArray, FormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import Swal from 'sweetalert2';
import { distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { speedDialFabAnimations } from '../speed-dial-fab.animations';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { PdfpteService } from '../pdfpte.service';
import { saveAs } from 'file-saver';
import { MatDialog } from '@angular/material/dialog';
import { EstadoefectivoComponent } from '../../efectivo/estadoefectivo/estadoefectivo.component';

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
  selector: 'app-detalle-cotizacion',
  templateUrl: './detalle-cotizacion.component.html',
  styleUrls: ['./detalle-cotizacion.component.css'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_Format },
    DatePipe
  ]
})
export class DetalleCotizacionComponent implements OnInit {

  editarDireccion: boolean;
  today;
  usrImp = {};
  filterListaPptosCiudad: Observable<any>[] = [];
  filterTipoOC: Observable<any>;

  filterListaLugaresEntrega: Observable<any>;
  filterListaMedidas: Observable<any>[] = [];
  filterListaCiudad: Observable<any>[] = [];
  filterListaSexo: Observable<any>[] = [];
  FormArrCiudad = new FormArray([]);
  FormArrMedida = new FormArray([]);
  FormArrSexo = new FormArray([]);
  // controlClienteReadOnly;
  controlMedida = new FormControl();
  ListaMedidasObs: Observable<any>;
  // ListaCiudadAllObs: Observable<any>;
  // controlCiudad = new FormControl('');
  ListaCiudadAll: any[] = [];
  tabla1o2 = null;
  @ViewChild(MatTable) table: MatTable<any>;
  displayedColumns: string[] = ['sCiudad', 'sProductoDescripcion', 'uMedida', 'sMarcaSugerida', 'nCantidad'];
  displayedColumns2: string[] = ['sCiudad', 'sProductoDescripcion', 'sColor', 'sLogo', 'sTipoTela', 'sTalla', 'nIdSexo', 'nCantidad'];
  displayedColumnsX: string[] = ['sCiudad', 'sProductoDescripcion', 'uMedida', 'sMarcaSugerida', 'nCantidad', 'editable'];
  displayedColumns2X: string[] = ['sCiudad', 'sProductoDescripcion', 'sColor', 'sLogo', 'sTipoTela', 'sTalla', 'nIdSexo', 'nCantidad', 'editable'];
  tempData: IGeneralData[] = [];
  tempData2: ITextilData[] = [];
  Privilegio;
  BotonRecibir = false;
  BotonConfirmarRecibir = false;
  BotonImprimirHabilitar = false;
  EnviadoHabilitar = false;
  BotonRechazar = false;
  ICot = {
    id: null,
    sCodCC: null,
    solicitante: null,
    anio: null,
    descPresupuesto: null,
    sObservacion: null,
    correlativo: null,
    fechaCreacion: null,
    fechaDeseada: null,
    cliente: null,
    descrip: null,
    estado: null,
    dRecepFecha: null,
    nRecepIdUsr: null,
    dDevRechFecha: null,
    nDevRechIdUsr: null,
    nIdCentroCosto: null,
    nIdCliente: null,
    nIdLugarEntrega: null,
    sTitulo: null,
    nTipoOC: null,
    nTipoOCName: null,
    sCod: null,
    estadoComponent: false,
    email: null,
    sDireccionOtro: null,
    lugarEntregaOtro: null
  };

  usrRecep = {
    idSolicitante: null,
    idUser: null,
    solicitante: null,
    estado: false
  };

  usrRecha = {
    idSolicitante: null,
    idUser: null,
    solicitante: null,
    estado: false
  };
  usrMod = {
    idSolicitante: null,
    idUser: null,
    solicitante: null,
    estado: false
  };
  controllugarEntregaOtro = new FormControl('', [Validators.required, this.noWhitespaceValidator]);
  controlTitulo = new FormControl('', [Validators.required, this.noWhitespaceValidator]);
  controlTipoCotizacion = new FormControl('', [Validators.required]);
  controlPresupuesto = new FormControl('', [Validators.required]);
  controlCliente = new FormControl('', [Validators.required]);
  controlLugarDeEntrega = new FormControl('', [Validators.required]);
  controlObservacion = new FormControl();
  controlFechaEntrega = new FormControl('', [Validators.required]);
  estadoEnviado = false;
  ListaPptos: any[] = [];
  minDate = new Date();
  selected = null;
  filterListaPptos: Observable<any>;
  filterListaClientes: Observable<any>;
  generalArr;
  textilArr;
  fabButtons = [
    {
      icon: 'close'
    },
    {
      icon: 'save'
    },
    {
      icon: 'check_circle'
    },
    {
      icon: 'list_alt'
    },
  ];
  buttons = [];
  fabTogglerState = 'inactive';
  // ------------------------------------
  fabButtons2 = [
    {
      icon: 'close'
    },
    {
      icon: 'check_circle'
    },
    {
      icon: 'assignment_return'
    },
    {
      icon: 'cancel'
    },
    {
      icon: 'print'
    },
    {
      icon: 'save'
    },
    {
      icon: 'check_circle'
    }
  ];
  buttons2 = [];
  fabTogglerState2 = 'inactive';
  chk;
  idC;
  dataUC;
  verificadorAccess;
  constructor(
    private router: Router, 
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private solicitudCotizacionService: SolicitudCotizacionService,
    private pdf: PdfpteService) {
    this.activatedRoute.params.subscribe(rh => {
      this.CheckGeneralTextil(rh.id).subscribe(chk => {
        this.chk = chk;
        this.idC = rh.id;
        this.dataContadorYunidades().subscribe(resX => {
          this.dataUC = resX;
        });
      });
    });
    // this.dataCompras();
    this.ObtenerPrivilegioUsuario().subscribe(check => {
      if (check === true) {
        this.dataCompras();
      }
    });
    setInterval(() => {
      this.today = Date.now();
    }, 1);
    this.showItems();
    this.showItems2();
    this.ObtenerDetalleImpresion().subscribe(imp => {
      this.usrImp = imp;
    });
    this.reloadGT();
    this.reloadPrincipal();
    this.controls();
  }

  controls() {
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
    /* this.ListaCiudadAllObs = this.controlCiudad.valueChanges
       .pipe(
         startWith(''),
         map(value => this._filter4(value))
       );*/
    /*this.ListaMedidasObs = this.controlMedida.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter3(value))
      );*/
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
      if (this.tabla1o2 === true) {
        this.tempData.map((value, index) => {
          this.FormArrCiudad.controls[index].setValue('', [Validators.required]);
          // this.FormArrMedida.controls[index].setValue('', [Validators.required]);
        });
      } else {
        this.tempData2.map((value, index) => {
          this.FormArrCiudad.controls[index].setValue('', [Validators.required]);
          // this.FormArrSexo.controls[index].setValue('', [Validators.required]);
        });
      }
      if (this.tabla1o2 === true) {
        if (this.controlPresupuesto.invalid) {
          this.tempData.map((value, index) => {
            this.FormArrCiudad.controls[index].setValue('', [Validators.required]);
          });
        } else {
          if (this.controlPresupuesto.invalid) {
            this.tempData2.map((value, index) => {
              this.FormArrCiudad.controls[index].setValue('', [Validators.required]);
            });
          }
        }
      }
      if (rx.toString().length > 0) {
        if (this.ICot.nIdCentroCosto > 0) {
          this.cleanTempArr();
        }
      } else {
        this.controlCliente.setValue('');
        this.ICot.nIdCentroCosto = null;
        this.cleanTempArr();
      }
    });
  }

  dataContadorYunidades(): Observable<any> {
    const response: Observable<any> = this.ObtenerDetallePorGeneral(this.idC).pipe(
      map((value, index) => {
        let total;
        if (value.length > 1) {
          total = value.reduce((sum, valor) => sum.nCantidad + valor.nCantidad);
        } else if (value.length === 1) {
          total = value[index].nCantidad;
        }
        const obj = {
          totalPorItems: total,
          total: value.length
        };
        return obj;
      })
    );
    const textil: Observable<any> = this.ObtenerDetallePorTextil(this.idC).pipe(
      map((value, index) => {
        let total;
        if (value.length > 1) {
          total = value.reduce((sum, valor) => sum.nCantidad + valor.nCantidad);
        } else if (value.length === 1) {
          total = value[index].nCantidad;
        }
        const obj = {
          totalPorItems: total,
          total: value.length
        };
        return obj;
      })
    );
    if (this.chk) {
      return response;
    } else if (!this.chk) {
      return textil;
    }
  }

  dataCompras() {
    this.activatedRoute.params.subscribe(rh => {
      this.CheckGeneralTextil(rh.id).subscribe(chk => {
        if (chk) {
          this.ObtenerDetallePorGeneral(rh.id).subscribe((generalArr) => {
            this.generalArr = generalArr;
            // this.contadorEnGeneral = generalArr.length;
          });
        } else if (!chk) {
          this.ObtenerDetallePorTextil(rh.id).subscribe(textilArr => {
            this.textilArr = textilArr;
            // this.contadorEnTextil = textilArr.length;
          });
        }
      });
    });
  }

  reloadGT() {
    this.activatedRoute.params.subscribe(rh => {
      this.CheckGeneralTextil(rh.id).subscribe(chk => {
        if (chk === true) {
          this.tabla1o2 = true;
          this.ObtenerDetallePorGeneral(rh.id).subscribe((tbl_lineas_general: IGeneralData[]) => {

            this.tempData = tbl_lineas_general;

            this.tempData.map((item, index, array) => {

              this.FormArrCiudad.push(new FormControl(item.sDesc, [Validators.required]));

              this.FormArrMedida.push(new FormControl(item.sDescripcion, [Validators.required]));

              this.filterCiudad(index);

              this.filterCiudadPresupuesto(index);
              
              this.filterMedida(index);
            });

          });
        } else if (chk === false) {
          this.tabla1o2 = false;
          this.ObtenerDetallePorTextil(rh.id).subscribe((tbl_lineas_textil: ITextilData[]) => {
            this.tempData2 = tbl_lineas_textil;
            this.tempData2.map((item, index, array) => {
              this.FormArrCiudad.push(new FormControl(item.sDesc, [Validators.required]));
              this.FormArrSexo.push(new FormControl(item.sSexo, [Validators.required]));
              this.filterCiudad(index);
              this.filterCiudadPresupuesto(index);
              this.filterSexo(index);
            });
          });
        }
      });
    });
  }

  reloadPrincipal() {
    this.activatedRoute.params.subscribe(rh => {
      this.ObtenerInfoPrincipalCotizacion(rh.id).subscribe(
        data => {
          if (data.estado === 'Enviado por Operaciones' ||
            data.estado === 'Rechazado por Compras' ||
            data.estado === 'Recibido por Compras') {
            this.estadoEnviado = true;
            this.displayedColumnsX = ['sCiudad', 'sProductoDescripcion', 'uMedida', 'sMarcaSugerida', 'nCantidad'];
            this.displayedColumns2X = ['sCiudad', 'sProductoDescripcion', 'sColor', 'sLogo', 'sTipoTela', 'sTalla',
              'nIdSexo', 'nCantidad'];
          }
          console.log("ObtenerInfoPrincipalCotizacion");
          console.log(data);
          this.ICot = data;
          this.chkUsrCotEmp();
          this.ICot.estadoComponent = true;
          if (data != null) {
            this.controlTitulo.setValue(this.ICot.sTitulo);
            this.controlTipoCotizacion.setValue(this.ICot.nTipoOCName);
            this.controlPresupuesto.setValue(this.ICot.descPresupuesto);
            this.controlCliente.setValue(this.ICot.cliente);
            this.controlObservacion.setValue(this.ICot.sObservacion);
            this.controlFechaEntrega.setValue(this.ICot.fechaDeseada);
            this.controlLugarDeEntrega.setValue(this.ICot.descrip);
            this.controllugarEntregaOtro.setValue(this.ICot.sCod);
          }
          if (this.ICot.estado === 'Enviado por Operaciones') {
            this.EnviadoHabilitar = true;
          }
          this.ObtenerInformacionUsr(this.ICot.nRecepIdUsr).subscribe(
            usrName => {
              this.usrRecep = usrName;
              this.usrRecep.estado = true;
            }
          );
          if (this.ICot.estado === 'Recibido por Compras') {
            this.EnviadoHabilitar = false;
            this.BotonImprimirHabilitar = true;
          }
          if (this.ICot.nDevRechIdUsr !== 0) {
            this.ObtenerInformacionUsr(this.ICot.nDevRechIdUsr).subscribe(
              usrName => {
                this.usrRecha = usrName;
                this.usrRecha.estado = true;
              }
            );
          }
          if (this.ICot['nModIdUsr'] !== 0) {
            this.ObtenerInformacionUsr(this.ICot['nModIdUsr']).subscribe(info => {
              this.usrMod = info;
              this.usrMod.estado = true;
            });
          }
          this.ObtenerPrivilegioUsuario().subscribe(check => {
            if (check === true) {
              this.Privilegio = true;
            } else {
              this.Privilegio = false;
            }
          });
          this.CargarListasDatos();
        }
      );
    });
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  EliminarElemento(i) {
    if (this.tempData[i].nIdCotizacionDet !== null) {
      this.EliminarElDetalleGeneralDB(this.tempData[i].nIdCotizacionDet).subscribe((res) => res);
    }
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
    if (this.tempData2[i].nIdCotizacionDet !== null) {
      this.EliminarElDetalleGeneralDB(this.tempData2[i].nIdCotizacionDet).subscribe((res) => res);
    }
    if (i !== 0) {
      this.tempData2.splice(i, 1);
      this.FormArrCiudad.controls.splice(i, 1);
      this.FormArrSexo.controls.splice(i, 1);
      this.filterListaCiudad.splice(i, 1);
      this.filterListaPptosCiudad.splice(i, 1);
      this.table.renderRows();
    }
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

  getOptionTextSex(option) {
    if (option.cEleNam === undefined) {
      return option;
    } else {
      return option.cEleNam;
    }
  }

  getOptionTextCit2(option) {
    if (option !== null) {
      if (option.sDesc === undefined) {
        return option;
      } else {
        return option.sDesc;
      }
    }
  }

  ngOnInit(): void {
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

  filterMedida(i) {
    this.filterListaMedidas[i] = this.FormArrMedida.controls[i].valueChanges
      .pipe(
        startWith(''),
        distinctUntilChanged(),
        switchMap(value => this._filter3(value || ''))
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

  _filter8(value: string): Observable<any> {
    const valueConst = value.toString().toLowerCase();
    return this.ObtenerListaSexo().pipe(
      map(response => response.filter(option => {
        return option.cEleNam.toLowerCase().includes(valueConst);
      }))
    );
  }

  tap(i) {
    if (i === 0) {
      this.router.navigateByUrl('comercial/requerimiento/solicitud_cotizacion/ver');
    }
    if (i === 1) {
      if (this.tabla1o2 === true) {
        if (!this.verificarEnUrlGeneral()) {
          this.Touched();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Debe llenar todos los campos.'
          });
        } else {
          this.ActualizarSolicitud();
        }
      }
      if (this.tabla1o2 === false) {
        if (!this.verificarEnUrlTextil()) {
          this.Touched();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Debe llenar todos los campos.'
          });
        } else {
          this.ActualizarSolicitud();
        }
      }
    }
    if (i === 2) {
      this.EnviarSolicitud();
    }
    if (i === 3) {
      this.fnVerEstado()
    }
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

  tapColumns(i: any) {
    if (i === 0) {
      return 'Cancelar';
    }
    if (i === 1) {
      return 'Actualizar';
    }
    if (i === 2) {
      return 'Enviar';
    }
    if (i === 3) {
      return 'Histórico de Estados';
    }
  }

  showItems() {
    this.fabTogglerState = 'inactive';
    this.buttons = this.fabButtons;
  }

  hideItems() {
    /* this.fabTogglerState = 'inactive';
     this.buttons = [];*/
  }

  onToggleFab() {
    this.buttons.length ? this.hideItems() : this.showItems();
  }

  // ...............................-----
  tap2(i) {
    if (i === 0) {
      this.router.navigateByUrl('comercial/requerimiento/solicitud_cotizacion/ver');
    }
    if (i === 1) {
      this.SwalRecibirCotizacion();
    }
    if (i === 2) {
      this.SwalDevolverCotizacion();
    }
    if (i === 3) {
      this.SwalRechazarCotizacion();
    }
    if (i === 5) {
      if (this.tabla1o2 === true) {
        if (!this.verificarEnUrlGeneral()) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Debe llenar todos los campos.'
          });
        } else {
          this.ActualizarSolicitud();
        }
      }
      if (this.tabla1o2 === false) {
        if (!this.verificarEnUrlTextil()) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Debe llenar todos los campos.'
          });
        } else {
          this.ActualizarSolicitud();
        }
      }
    }
    if (i === 6) {
      this.EnviarSolicitud();
    }
  }

  ImprimirPDF(index, imprimir) {
    const idEmpresa = localStorage.getItem('Empresa');
    const tipo = 'SC';
    const sCorrelativo = this.ICot.correlativo;
    const nombre = `${idEmpresa}${tipo}${sCorrelativo}`;
    if (index === 4) {
      const data = btoa(encodeURIComponent(imprimir.innerHTML));
      this.pdf.htmlInsert({ numero: data }).subscribe(res => {
        const pdf = new Blob([res], { type: 'application/pdf' });
        saveAs(pdf, `${nombre}.pdf`);
      });
    }
  }

  tapColumns2(i: any) {
    if (i === 0) {
      return 'Cancelar';
    }
    if (i === 1) {
      return 'Recibir';
    }
    if (i === 2) {
      return 'Devolver';
    }
    if (i === 3) {
      return 'Rechazar';
    }
    if (i === 4) {
      return 'Imprimir';
    }
    if (i === 5) {
      return 'Actualizar';
    }
    if (i === 6) {
      return 'Enviar';
    }
  }

  showItems2() {
    this.fabTogglerState2 = 'inactive';
    this.buttons2 = this.fabButtons2;
  }

  hideItems2() {
    /*this.fabTogglerState2 = 'inactive';
    this.buttons2 = [];*/
  }

  onToggleFab2() {
    this.buttons2.length ? this.hideItems2() : this.showItems2();
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

  CheckGeneralTextil(idCot): Observable<any> {
    const params = [];
    params.push(idCot);
    const subject = new Subject();
    this.solicitudCotizacionService.crudSolicitudCotizacion(24, params, '|').subscribe(res => subject.next(res));
    return subject.asObservable();
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

  ObtenerInfoPrincipalCotizacion(idCot): Observable<any> {
    const user = localStorage.getItem('currentUser');
    const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    const params = [];
    params.push(idCot);
    params.push(idUser);
    const subject = new Subject();
    this.solicitudCotizacionService.crudSolicitudCotizacion(15, params, '|').subscribe(
      res => {
        subject.next(res);
      }
    );
    return subject.asObservable();
  }

  ObtenerInformacionUsr(idUsr): Observable<any> {
    const subject = new Subject();
    const params = [];
    params.push(idUsr);
    this.solicitudCotizacionService.crudSolicitudCotizacion(4, params, '|').subscribe(
      res => {
        subject.next(res);
      }
    );
    return subject.asObservable();
  }

  ObtenerDetallePorTextil(idCot): Observable<any> {
    const params = [];
    const subject = new Subject();
    params.push(idCot);
    this.solicitudCotizacionService.crudSolicitudCotizacion(25, params, '|').subscribe(res => {
      res.forEach(b => {
        b.editable = false;
      });
      subject.next(res);
      return res;
    });
    return subject.asObservable();
  }

  ObtenerDetallePorGeneral(id): Observable<any> {
    const params = [];
    const subject = new Subject();
    params.push(id);
    this.solicitudCotizacionService.crudSolicitudCotizacion(20, params, '|').subscribe(
      res => {
        res.forEach(c => {
          c.editable = false;
        });
        subject.next(res);
      });
    return subject.asObservable();
  }

  ActualizarModCotizacion(): Observable<any> {
    const subject = new Subject();
    const calendar = new Date();
    const date = (calendar.getMonth() + 1) + '-' + calendar.getDate() + '-' + calendar.getFullYear();
    const today = new Date();
    const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    const fechaHora = date + ' ' + time;
    const user = localStorage.getItem('currentUser');
    const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    const params = [];
    params.push(fechaHora);
    params.push(idUser);
    params.push(this.ICot.id);
    this.solicitudCotizacionService.crudSolicitudCotizacion(31, params, '|').subscribe(res => subject.next(res));
    return subject.asObservable();
  }

  RecibirCotizacion(): Observable<any> {
    // this.BotonRecibir = true;
    // this.BotonRechazar = true;
    const calendar = new Date();
    const date = (calendar.getMonth() + 1) + '-' + calendar.getDate() + '-' + calendar.getFullYear();
    const today = new Date();
    const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    const fechaHora = date + ' ' + time;
    const user = localStorage.getItem('currentUser');
    const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    const params = [];
    const subject = new Subject();
    params.push(idUser);
    params.push(fechaHora);
    params.push(this.ICot.id);
    this.solicitudCotizacionService.crudSolicitudCotizacion(16, params, '|').subscribe(
      res => {
        subject.next(res);
      }
    );
    return subject.asObservable();
  }

  RechCotizacion(): Observable<any> {
    const params = [];
    const subject = new Subject();
    // this.BotonRecibir = true;
    // this.BotonRechazar = true;
    const calendar = new Date();
    const date = (calendar.getMonth() + 1) + '-' + calendar.getDate() + '-' + calendar.getFullYear();
    const today = new Date();
    const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    const fechaHora = date + ' ' + time;
    const user = localStorage.getItem('currentUser');
    const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    params.push(idUser);
    params.push(fechaHora);
    params.push(this.ICot.id);
    this.solicitudCotizacionService.crudSolicitudCotizacion(17, params, '|').subscribe(
      res => {
        subject.next(res);
      }
    );
    return subject.asObservable();
  }

  DevCotizacion(): Observable<any> {
    // this.BotonRecibir = true;
    // this.BotonRechazar = true;
    const calendar = new Date();
    const date = (calendar.getMonth() + 1) + '-' + calendar.getDate() + '-' + calendar.getFullYear();
    const today = new Date();
    const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    const fechaHora = date + ' ' + time;
    const user = localStorage.getItem('currentUser');
    const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    const params = [];
    const subject = new Subject();
    params.push(idUser);
    params.push(fechaHora);
    params.push(this.ICot.id);
    this.solicitudCotizacionService.crudSolicitudCotizacion(43, params, '|').subscribe(
      res => {
        subject.next(res);
      }
    );
    return subject.asObservable();
  }

  DeshabilitarEdicion(element): void {
    element.editable = false;
  }

  HabilitarEdicion(element): void {
    element.editable = true;
  }

  InsertarElemento(element): void {
    // element.editable = false;
    this.FormArrCiudad.push(new FormControl('', [Validators.required]));
    this.FormArrMedida.push(new FormControl('', [Validators.required]));
    this.tempData.push({
      nIdCotizacionDet: null, uIdUndMedida: null, sDescripcion: null,
      sProductoDescripcion: '', sMarcaSugerida: '', nCantidad: null, nIdTipEle: null, sCod: null, sDesc: null
      , editable: true, sCodUndMedida: null
    });
    this.table.renderRows();
    this.filterCiudad(this.tempData.length - 1);
    this.filterMedida(this.tempData.length - 1);
  }

  obtenerNombreColumna(valor: string): string {
    switch (valor) {
      case 'sCiudad':
        return 'Ciudad';
      case 'sProductoDescripcion':
        return 'Artículo';
      case 'uMedida':
        return 'U.Medida';
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

  ObtenerPrivilegioUsuario(): Observable<any> {
    const user = localStorage.getItem('currentUser');
    const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    const params = [];
    params.push(idUser);
    const subject = new Subject();
    this.solicitudCotizacionService.crudSolicitudCotizacion(21, params, '|').subscribe(
      res => {
        subject.next(res);
      }
    );
    return subject.asObservable();
  }

  RecepOrRech(): boolean {
    if (this.usrRecha.estado) {
      return true;
    } else if (this.usrMod.estado) {
      return true;
    }
  }

  TipoOCSeleccionado(event: MatAutocompleteSelectedEvent) {
    const seleccionado = event.option.value;
    this.ICot.nTipoOC = seleccionado.nEleCod;
    this.controlTipoCotizacion.setValue(seleccionado.cEleNam);
  }

  presupuestoSeleccionado(event: MatAutocompleteSelectedEvent) {
    const seleccionado = event.option.value;
    this.ICot.nIdCentroCosto = seleccionado.codx;
    this.selected = seleccionado.cod;
    this.controlPresupuesto.setValue(seleccionado.descrip);
    // CLIENTE
    this.ICot.nIdCliente = seleccionado.nIdCliente;
    this.controlCliente.setValue(seleccionado.razonSocial);
    //
  }

  clienteSeleccionado(event: MatAutocompleteSelectedEvent) {
    const seleccionado = event.option.value;
    this.ICot.nIdCliente = seleccionado.idCliente;
    this.controlCliente.setValue(seleccionado.razonSocial);
  }

  lugarDeEntregaSeleccionado(event: MatAutocompleteSelectedEvent) {
    const seleccionado = event.option.value;
    console.log(seleccionado);

    this.ICot.nIdLugarEntrega = seleccionado.idLugar;
    this.ICot.sCod = seleccionado.sCod;
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

  ObtenerDetalleImpresion(): Observable<any> {
    const subject = new Subject();
    const user = localStorage.getItem('currentUser');
    const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    const idEmpresa = localStorage.getItem('Empresa');
    const params = [];
    params.push(idUser);
    params.push(idEmpresa);
    this.solicitudCotizacionService.crudSolicitudCotizacion(42, params, '|').subscribe(res => subject.next(res));
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

  ObtenerListaCiudadesPresupuesto(): Observable<any> {
    const subject = new Subject();
    const idPais = Number(localStorage.getItem('Pais'));
    const params = [];
    params.push(this.ICot.nIdCentroCosto);
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

  async CargarListasDatos() {
    this.ObtenerListaCiudadesPresupuestoAll().subscribe(res => this.ListaCiudadAll = res);
    this.ObtenerListaPresupuesto().subscribe(dt => this.ListaPptos = dt);
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

  ObtenerListaClientes(): Observable<any> {
    const subject = new Subject();
    this.solicitudCotizacionService.crudSolicitudCotizacion(6, [], '|').subscribe(
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
    params.push(this.ICot.id);
    params.push(idPais);
    this.solicitudCotizacionService.crudSolicitudCotizacion(8, params, '|').subscribe(
      (res) => {
        subject.next(res);
      }
    );
    return subject.asObservable();
  }

  verificarPrincipal(): boolean {
    return (this.ICot.sTitulo != null && this.controlTitulo.valid
      && this.ICot.nTipoOC != null && this.controlTipoCotizacion.valid
      && this.ICot.nIdCliente != null && this.controlCliente.valid
      && this.ICot.fechaDeseada != null && this.controlFechaEntrega.valid
      // &&
      //  this.ICot.nIdLugarEntrega >= 0
      // // && this.controlLugarDeEntrega != null
    );
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

  SwalRecibirCotizacion(): void {
    Swal.fire({
      title: '¿Desea recibir la cotización?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: `Aceptar`,
      denyButtonText: `Cancelar`,
    }).then(result => {
      if (result.isConfirmed) {
        this.RecibirCotizacion().subscribe(() => {
          this.reloadPrincipal();
          this.BotonConfirmarRecibir = true;
          this.BotonImprimirHabilitar = true;
          Swal.fire(
            'Recibida la solicitud de cotización',
            '',
            'success'
          );
          this.correoRecibirOP();
        });
      } else if (result.isDenied) {
      }
    });
  }

  SwalRechazarCotizacion(): void {
    Swal.fire({
      title: '¿Desea rechazar la cotización?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: `Continuar`,
      denyButtonText: `Cancelar`,
    }).then(result => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Ingrese el motivo de Rechazo',
          input: 'textarea',
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: `Aceptar`,
          denyButtonText: `Cancelar`
        }).then(response => {
          if (response.isConfirmed) {
            this.RechCotizacion().subscribe(() => {
              this.reloadPrincipal();
              this.BotonConfirmarRecibir = true;
            });
            this.SetMotivoRech(response.value).subscribe(() => {
              this.reloadPrincipal();
              this.correoRechazadoOP();
            });
            Swal.fire(
              'Se rechazó la solicitud de cotización!',
              'Presiona OK para continuar.',
              'success'
            );
          } else if (result.isDenied) {
          }
        });
      } else if (result.isDenied) {
      }
    });
  }

  SwalDevolverCotizacion(): void {
    Swal.fire({
      title: '¿Desea devolver la cotización?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: `Aceptar`,
      denyButtonText: `Cancelar`,
    }).then(result => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Ingrese el motivo de devolución',
          input: 'textarea',
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: `Aceptar`,
          denyButtonText: `Cancelar`
        }).then(response => {
          if (response.isConfirmed) {
            this.DevCotizacion().subscribe(() => {
              this.reloadPrincipal();
              this.BotonConfirmarRecibir = true;
            });
            this.SetMotivoDevYEstado(response.value).subscribe(() => {
              this.reloadPrincipal();
              this.correoDevolverOP();
            });
            Swal.fire(
              'Devuelta la solicitud de cotización',
              '',
              'success'
            );
          } else if (result.isDenied) {
          }
        });
      } else if (result.isDenied) {
      }
    });
  }

  ActualizarSolicitud(): void {
    Swal.fire({
      title: '¿Desea actualizar la cotización?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: `Aceptar`,
      denyButtonText: `Cancelar`,
    }).then(result => {
      if (result.isConfirmed) {
        this.UpdateSolicitudDeCotizacion().subscribe(() => {
          this.ActualizarModCotizacion().subscribe(res => {
            return res;
          });
          if (this.tabla1o2 === true) {
            this.UpdateLinea1SC().subscribe(() => {
              // this.reloadGT();
              //  this.reloadPrincipal();
              this.InsertDetLinea1().subscribe(() => {
                this.reloadGT();
                this.reloadPrincipal();
              });
            });

          } else if (this.tabla1o2 === false) {
            this.UpDATElinea2SC().subscribe(() => {
              //  this.reloadGT();
              //  this.reloadPrincipal();
              this.InsertDetLinea2().subscribe(() => {
                this.reloadGT();
                this.reloadPrincipal();
              });
            });

          }
          Swal.fire(
            'Actualizada la solicitud de cotización',
            '',
            'success'
          );
        });
      } else if (result.isDenied) {
      }
    });
  }

  UpdateLinea1SC(): Observable<any> {
    const params = []; // ``
    const subject = new Subject();
    this.tempData.forEach(linea1 => {
      if (linea1.nIdCotizacionDet != null) {
        params.push(`${linea1.nIdCotizacionDet}|${linea1.sProductoDescripcion}|${linea1.sMarcaSugerida}|${linea1.nCantidad}|${linea1.nIdTipEle}|${linea1.uIdUndMedida}`);
      }
    });
    this.solicitudCotizacionService.crudSolicitudCotizacion(28, params, '*').subscribe(res => subject.next(res));
    return subject.asObservable();
  }

  InsertDetLinea2(): Observable<any> {
    const params = [];
    const subject = new Subject();
    this.tempData2.forEach(res => {
      if (res.nIdCotizacionDet === null) {
        params.push(`${this.ICot.id}|${res.nIdTipEle}|${res.sColor}|${res.sLogo}|${res.sTipoTela}|${null}|${res.sTalla}|${res.nIdSexo}|${res.nCantidad}|${res.sProductoDescripcion}`);
      }
    });
    this.solicitudCotizacionService.crudSolicitudCotizacion(22, params, '*').subscribe(res => subject.next(res));
    return subject.asObservable();
  }

  UpDATElinea2SC(): Observable<any> {
    const params = [];
    const subject = new Subject();
    this.tempData2.forEach(linea2 => {
      if (linea2.nIdCotizacionDet != null) {
        params.push(`${linea2.nIdCotizacionDet}|${linea2.sColor}|${linea2.sLogo}|${linea2.sTipoTela}|${null}|${linea2.sTalla}|${linea2.nIdSexo}|${linea2.nIdTipEle}|${linea2.nCantidad}|${linea2.sProductoDescripcion}`);
      }
    });
    this.solicitudCotizacionService.crudSolicitudCotizacion(29, params, '*').subscribe(res => subject.next(res));
    return subject.asObservable();
  }

  UpdateSolicitudDeCotizacion(): Observable<any> {
    const subject = new Subject();
    this.ICot.sTitulo = this.controlTitulo.value;
    this.ICot.sObservacion = this.controlObservacion.value;
    this.ICot.lugarEntregaOtro = this.controllugarEntregaOtro.value
    const fchdeseada: Date = this.controlFechaEntrega.value;
    const fchEntrega = new Date(fchdeseada).toLocaleDateString();
    const auxfchEntrega: string[] = fchEntrega.split('/');
    const today = new Date();
    const time = today.getHours() + ':' + (today.getMinutes() + 1) + ':' + today.getSeconds();
    this.ICot.fechaDeseada = auxfchEntrega[1] + '-' + auxfchEntrega[0] + '-' + auxfchEntrega[2] + ' ' + time;
    const params = [];
    params.push(this.ICot.nTipoOC);
    params.push(this.ICot.nIdCentroCosto);
    params.push(this.ICot.nIdCliente);
    params.push(this.ICot.nIdLugarEntrega);
    params.push(this.ICot.sTitulo);
    params.push(this.ICot.sObservacion);
    params.push(this.ICot.fechaDeseada);
    params.push(this.ICot.lugarEntregaOtro);
    params.push(this.ICot.id);
    this.solicitudCotizacionService.crudSolicitudCotizacion(19, params, '|').subscribe(res => {
      subject.next(res);
    });
    return subject.asObservable();
  }

  ObtenerListaSexo(): Observable<any> {
    const subject = new Subject();
    this.solicitudCotizacionService.crudSolicitudCotizacion(23, [], '|').subscribe(res => subject.next(res));
    return subject.asObservable();
  }

  InsertarElemento2(element): void {
    element.editable = false;
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
  }

  InsertDetLinea1(): Observable<any> {
    const params = [];
    this.tempData.forEach(r => {
      if (r.nIdCotizacionDet === null) {
        params.push(`${this.ICot.id}|${r.nIdTipEle}|${r.sProductoDescripcion}|${r.sMarcaSugerida}|${r.nCantidad}|${r.uIdUndMedida}`);
      }
    });
    const subject = new Subject();

    this.solicitudCotizacionService.crudSolicitudCotizacion(11, params, '*').subscribe(res => subject.next(res));
    return subject.asObservable();
  }

  CambioEstadoSCEnviado(): Observable<any> {
    const params = [];
    params.push(this.ICot.id);
    const subject = new Subject();
    this.solicitudCotizacionService.crudSolicitudCotizacion(27, params, '|').subscribe(res => subject.next(res));
    return subject.asObservable();
  }

  UdSeleccionado(event: MatAutocompleteSelectedEvent, element) {
    const seleccionado = event.option.value;
    element.uIdUndMedida = seleccionado.uIdUndMedida;
    element.sDescripcion = seleccionado.sDescripcion;
  }

  EnviarSolicitud(): void {
    Swal.fire({
      title: '¿Desea enviar la cotización?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: `Aceptar`,
      denyButtonText: `Cancelar`,
    }).then(result => {
      if (result.isConfirmed) {
        this.CambioEstadoSCEnviado().subscribe(res => {
          this.ICot.estado = res.estado;
          this.estadoEnviado = true;
          this.displayedColumnsX = ['sProductoDescripcion', 'uMedida', 'sMarcaSugerida', 'nCantidad'];
          this.displayedColumns2X = ['sColor', 'sLogo', 'sTipoTela', 'nCantidad', 'sTalla', 'nIdSexo'];
          this.reloadGT();
          this.reloadPrincipal();
          Swal.fire(
            'Enviada la solicitud de cotización',
            '',
            'success'
          );
          this.correoEnviarOP();
        });
      } else if (result.isDenied) {
      }
    });
  }

  DatosLegActual(): Observable<any> {
    const subject = new Subject();
    const params = [];
    const user = localStorage.getItem('currentUser');
    const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    params.push(idUser);
    this.solicitudCotizacionService.crudSolicitudCotizacion(45, params, '|').subscribe(res => {

      subject.next(res);
    });
    return subject.asObservable();
  }

  private SetMotivoRech(value): Observable<any> {
    const params = [];
    params.push(value);
    params.push(this.ICot.id);
    const subject = new Subject();
    this.solicitudCotizacionService.crudSolicitudCotizacion(32, params, '|').subscribe(res => {
      subject.next(res);
    });
    return subject.asObservable();
  }

  private SetMotivoDevYEstado(value): Observable<any> {
    const params = [];
    params.push(value);
    params.push(this.ICot.id);
    const subject = new Subject();
    this.solicitudCotizacionService.crudSolicitudCotizacion(33, params, '|').subscribe(res => {
      subject.next(res);
    });
    return subject.asObservable();
  }

  CiudadPPSeleccionado(event: MatAutocompleteSelectedEvent, element) {
    const seleccionado = event.option.value;
    element.nIdTipEle = seleccionado.nIdTipEle;
    element.sDesc = seleccionado.sDesc;
  }

  cleanTempArr(): void {
    // this.FormArrCiudad.controls.forEach(res => res.setValue(''));
    if (this.tabla1o2) {
      this.tempData.forEach(data => {
        data.nIdTipEle = null;
        // data.sDesc = null;
        data.editable = true;
      });
    }
    if (this.tabla1o2 === false) {
      this.tempData2.forEach(data => {
        data.nIdTipEle = null;
        //   data.sDesc = null;
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
    if (!this.estadoEnviado) {
      th[5].style.textAlign = 'right';
    }

    return true;
  }

  cssTablaGeneralCompras(): boolean {
    const th = Array.from(document.getElementsByTagName('th'));
    th[0].style.textAlign = 'left';
    th[1].style.textAlign = 'center';
    th[2].style.textAlign = 'center';
    th[3].style.textAlign = 'center';
    th[4].style.textAlign = 'center';

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
    if (!this.estadoEnviado) {
      th[8].style.textAlign = 'right';
    }
    return true;
  }

  getOptionTextCity(option) {
    if (option !== null) {
      if (option.sDesc === undefined) {
        return option;
      } else {
        return option.sDesc;
      }
    }
  }

  getOptionTextMedida(option) {
    // console.log(option);
    if (option.sDescripcion === undefined) {
      return option;
    } else {
      return option.sDescripcion;
    }
  }

  private EliminarElDetalleGeneralDB(idDetCot): Observable<any> {
    const params = [];
    params.push(idDetCot);
    const subject = new Subject();
    this.solicitudCotizacionService.crudSolicitudCotizacion(40, params, '|').subscribe((res) => subject.next(res));
    return subject.asObservable();
  }

  correoEnviarOP() {
    this.DatosLegActual().subscribe(data => {
      this.dataContadorYunidades().subscribe(inf => {
        const idPais = Number(localStorage.getItem('Pais'));
        const user = localStorage.getItem('currentUser');
        const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
        const calendar = new Date();
        const date = (calendar.getDate()) + '/' + (calendar.getMonth() + 1) + '/' + calendar.getFullYear();
        const today = new Date();
        const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
        const fechaHora = date + ' ' + time;
        const params = [];
        params.push('LUCKY S.A.C.');
        params.push('#E07171');
        params.push('SOLICITUD DE COTIZACION');
        params.push('ENVIADO POR OPERACIONES');
        params.push(`SC - ${this.ICot.sCodCC} - ${this.ICot.correlativo}`);
        params.push('Operaciones ha generado una nueva solicitud de cotización');
        params.push(`Título: ${this.ICot.sTitulo}`);
        params.push(`Total de artículos: ${inf.total} <br> Total de unidades: ${inf.totalPorItems}`);
        params.push(data.usuario);
        params.push(fechaHora);
        params.push(idPais);
        params.push(this.ICot['nCreaIdUsr']);
        // params.push(`afiestas@bbox.com.pe`); // correos compras  lsalinas@lucky.com.pe; rsanchez@lucky.com.pe; kvaras@lucky.com.pe; Jtello@lucky.com.pe; ypaico@lucky.com.pe
        params.push(`lsalinas@lucky.com.pe; rsanchez@lucky.com.pe; kvaras@lucky.com.pe; Jtello@lucky.com.pe; ypaico@lucky.com.pe`); // correos compras  lsalinas@lucky.com.pe; rsanchez@lucky.com.pe; kvaras@lucky.com.pe; Jtello@lucky.com.pe; ypaico@lucky.com.pe
        params.push(`ERP - Nueva solicitud de cotización - SC - ${this.ICot.sCodCC} - ${this.ICot.correlativo}`);
        // console.log(params.join('|'));
        this.solicitudCotizacionService.crudSolicitudCotizacion(100, params, '|').subscribe(res => res);
      });
    });
  }

  correoRecibirOP() {
    this.DatosLegActual().subscribe(data => {
      this.dataContadorYunidades().subscribe(inf => {
        const idPais = Number(localStorage.getItem('Pais'));
        const user = localStorage.getItem('currentUser');
        const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
        const calendar = new Date();
        const date = (calendar.getDate()) + '/' + (calendar.getMonth() + 1) + '/' + calendar.getFullYear();
        const today = new Date();
        const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
        const fechaHora = date + ' ' + time;
        const params = [];
        params.push('LUCKY S.A.C.');
        params.push('#E07171');
        params.push('SOLICITUD DE COTIZACION');
        params.push('RECIBIDA POR COMPRAS');
        params.push(`SC - ${this.ICot.sCodCC} - ${this.ICot.correlativo}`);
        params.push('Compras ha recibido su solicitud de cotización');
        params.push(`Título: ${this.ICot.sTitulo}`);
        params.push(`Se procederá a cotizar con proveedores.<br>Le llegará un nuevo correo cuando se registren cotizaciones de proveedores`);
        params.push(data.usuario);
        params.push(fechaHora);
        params.push(idPais);
        params.push(this.ICot['nCreaIdUsr']);
        // params.push(`afiestas@bbox.com.pe`); // correo solicitante this.Icot.email
        params.push(`${this.ICot.email}`); // correo solicitante this.Icot.email
        params.push(`ERP - Solicitud de cotización Recibida - SC - ${this.ICot.sCodCC} - ${this.ICot.correlativo}`);
        // console.log(params.join('|'));
        this.solicitudCotizacionService.crudSolicitudCotizacion(100, params, '|').subscribe(res => res);
      });
    });
  }

  correoDevolverOP() {
    this.DatosLegActual().subscribe(data => {
      this.dataContadorYunidades().subscribe(inf => {
        const idPais = Number(localStorage.getItem('Pais'));
        const user = localStorage.getItem('currentUser');
        const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
        const calendar = new Date();
        const date = (calendar.getDate()) + '/' + (calendar.getMonth() + 1) + '/' + calendar.getFullYear();
        const today = new Date();
        const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
        const fechaHora = date + ' ' + time;
        const params = [];
        params.push('LUCKY S.A.C.');
        params.push('#E07171');
        params.push('SOLICITUD DE COTIZACION');
        params.push('DEVUELTA POR COMPRAS');
        params.push(`SC - ${this.ICot.sCodCC} - ${this.ICot.correlativo}`);
        params.push('Compras ha devuelto su solicitud de cotización');
        params.push(`Título: ${this.ICot.sTitulo}`);
        params.push(`Motivo:<br>${this.ICot['sMotivoDevRech']}`);
        params.push(data.usuario);
        params.push(fechaHora);
        params.push(idPais);
        params.push(idUser);
        // params.push(`afiestas@bbox.com.pe`); // correo solicitante this.Icot.email
        params.push(`${this.ICot.email}`); // correo solicitante this.Icot.email
        params.push(`ERP - Solicitud de cotización Devuelta - SC - ${this.ICot.sCodCC} - ${this.ICot.correlativo}`);
        // console.log(params.join('|'));
        this.solicitudCotizacionService.crudSolicitudCotizacion(100, params, '|').subscribe(res => res);
      });
    });
  }

  correoRechazadoOP() {
    this.DatosLegActual().subscribe(data => {
      this.dataContadorYunidades().subscribe(inf => {
        const idPais = Number(localStorage.getItem('Pais'));
        const user = localStorage.getItem('currentUser');
        const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
        const calendar = new Date();
        const date = (calendar.getDate()) + '/' + (calendar.getMonth() + 1) + '/' + calendar.getFullYear();
        const today = new Date();
        const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
        const fechaHora = date + ' ' + time;
        const params = [];
        params.push('LUCKY S.A.C.');
        params.push('#E07171');
        params.push('SOLICITUD DE COTIZACION');
        params.push('RECHAZADO POR COMPRAS');
        params.push(`SC - ${this.ICot.sCodCC} - ${this.ICot.correlativo}`);
        params.push('Compras ha rechazado su solicitud de cotización');
        params.push(`Título: ${this.ICot.sTitulo}`);
        params.push(`Motivo:<br>${this.ICot['sMotivoDevRech']}`);
        params.push(data.usuario);
        params.push(fechaHora);
        params.push(idPais);
        params.push(idUser);
        // params.push(`afiestas@bbox.com.pe`); // correo solicitante this.Icot.email
        params.push(`${this.ICot.email}`); // correo solicitante this.Icot.email
        params.push(`ERP - Solicitud de cotización rechazada - SC - ${this.ICot.sCodCC} - ${this.ICot.correlativo}`);
        // console.log(params.join('|'));
        this.solicitudCotizacionService.crudSolicitudCotizacion(100, params, '|').subscribe(res => res);
      });
    });
  }
  chkUsrCotEmp() {
    const user = localStorage.getItem('currentUser');
    const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    const idEmpresa = localStorage.getItem('Empresa');
    const params = [];
    params.push(this.ICot.id);
    params.push(idUser);
    params.push(idEmpresa);
    // console.log(params);
    this.solicitudCotizacionService.crudSolicitudCotizacion(46, params, '|').subscribe(res => {
      this.verificadorAccess = res;
      if (!this.verificadorAccess) {
        // console.log(this.verificadorAccess);
        Swal.fire(
          'Ocurrió un error!',
          'Presiona OK para continuar.',
          'error'
        );
      }
    });
  }


  async fnVerEstado() {

    let pParametro = [];
    const dialogRef = this.dialog.open(EstadoefectivoComponent, {
      width: '620px'
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  Touched() {
    this.controlTitulo.markAsTouched();
    this.controlTipoCotizacion.markAsTouched();
    this.controlCliente.markAsTouched();
    this.controlLugarDeEntrega.markAsTouched();
    this.controlFechaEntrega.markAsTouched();
  }

}
