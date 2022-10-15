
import { Component, Inject, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SolicitudCotizacionService } from '../../../solicitud-cotizacion.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { AzureSCService } from '../../../azure-sc.service';
import { ScVisorComponent } from '../sc-visor/sc-visor.component';
import Swal from 'sweetalert2';
import { map } from 'rxjs/operators';
import { SecurityErp } from 'src/app/modulos/AAHelpers/securityErp.Entity';

@Component({
  selector: 'app-visor',
  templateUrl: './sc-file.component.html',
  styleUrls: ['./sc-file.component.css']
})
export class ScFileComponent implements OnInit {
  contadorObservable: Observable<any>;
  displayedColumns: string[] = ['opcion', 'sNombreArchivo', 'cUser', 'dFechaCarga', 'bAprobOper'];
  dataSourceObservable: Observable<any>;
  Privilegio;
  filestring: string;
  codPresupuesto: any;
  vArchivoSeleccionado;
  securityErp = new SecurityErp;
  codigoPerfil: boolean;
  codigoCliente: number;
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
    email: null
  };
  formControlFileUpload: FormControl = new FormControl('', [Validators.required]);
  test;
  constructor(private solicitudCotizacionService: SolicitudCotizacionService, @Inject(MAT_DIALOG_DATA) public data,
    private azureSCService: AzureSCService, public dialog: MatDialog) {
    this.CheckAprobado();
    this.ObtenerInfoPrincipalCotizacion(data.idCot).subscribe(res => {
      this.ICot = res;
      this.codPresupuesto = data.codPresupuesto;
      this.codigoCliente = data.codigoCliente;      
    });
  }

  ngOnInit(): void {
    this.ObtenerPrivilegioUsuario().subscribe(check => {
      if (check === true) {
        this.Privilegio = true;
      } else {
        this.Privilegio = false;
      }      
    });
    this.validaPerfilUsuario();
    this.dataSourceObservable = this.CargarDataDetCP();
    this.contadorObservable = this.CargarDataDetCP().pipe(
      map(res => res.length)
    );





  }

  CheckAprobado() {
    this.CargarDataDetCP().pipe(
      map((res) => {
        const rpta = res.some(value => value.bAprobOper === true);
        return rpta;
      }
      )).subscribe(rx => {
        this.test = rx;
      });
  }
  openDialog(sRutaArchivo): void {
    const dialogRef = this.dialog.open(ScVisorComponent, {
      width: '80%',
      data: { sRutaArchivo }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
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
  correoCotizacionAdjuntadaOP(Nombre) {
    this.DatosLegActual().subscribe(data => {
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
      params.push('NUEVA COTIZACION DE PROVEEDOR');
      params.push('ADJUNTADA POR COMPRAS');
      params.push(`SC - ${this.ICot.sCodCC} - ${this.ICot.correlativo}`);
      params.push('Compras ha cargado una cotización de proveedor a su solicitud de cotización:');
      params.push(`Título: ${this.ICot.sTitulo}`);
      params.push(`Archivo : ${Nombre}<br>Por favor revísela`);
      params.push(data.usuario);
      params.push(fechaHora);
      params.push(idPais);
      params.push(this.ICot['nCreaIdUsr']);
      // params.push(`afiestas@bbox.com.pe`); // correo solicitante this.Icot.email
      params.push(`${this.ICot.email}`); // correo solicitante this.Icot.email
      params.push(`ERP - Nueva CP adjuntada a su solicitud de cotización - SC - ${this.ICot.sCodCC} - ${this.ICot.correlativo}`);      
      this.solicitudCotizacionService.crudSolicitudCotizacion(100, params, '|').subscribe(res => res);
    });
  }
  correoElegidoOP(sNombreArchivo) {
    this.DatosLegActual().subscribe(data => {
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
      params.push('COTIZACION DE PROVEEDOR');
      params.push('ELEGIDA POR OPERACIONES');
      params.push(`SC - ${this.ICot.sCodCC} - ${this.ICot.correlativo}`);
      params.push('Operaciones a elegido una cotización de proveedor:');
      params.push(`Título: ${this.ICot.sTitulo}`);
      params.push(`Archivo: ${sNombreArchivo}<br>Por favor revísela`);
      params.push(data.usuario);
      params.push(fechaHora);
      params.push(idPais);
      params.push(this.ICot['nCreaIdUsr']);
      // params.push(`afiestas@bbox.com.pe`); // correo compras  lsalinas@lucky.com.pe; rsanchez@lucky.com.pe; kvaras@lucky.com.pe; Jtello@lucky.com.pe; ypaico@lucky.com.pe
      params.push(`lsalinas@lucky.com.pe; rsanchez@lucky.com.pe; kvaras@lucky.com.pe; Jtello@lucky.com.pe; ypaico@lucky.com.pe`); // correo compras  lsalinas@lucky.com.pe; rsanchez@lucky.com.pe; kvaras@lucky.com.pe; Jtello@lucky.com.pe; ypaico@lucky.com.pe
      params.push(`ERP - Operaciones ha elegido una CP para la atención de su - SC - ${this.ICot.sCodCC} - ${this.ICot.correlativo}`);
      // console.log(params.join('|'));
      this.solicitudCotizacionService.crudSolicitudCotizacion(100, params, '|').subscribe(res => res);
    });
  }

  CargarDataDetCP(): Observable<any> {
    const params = [];
    params.push(this.data.idCot);
    const subject = new Subject();
    this.solicitudCotizacionService.crudSolicitudCotizacion(36, params, '|').subscribe(res => subject.next(res));
    return subject.asObservable();
  }

  ultimoInsert(): Observable<any> {
    const subject = new Subject();
    const params = [];
    params.push(this.data.idCot);
    this.solicitudCotizacionService.crudSolicitudCotizacion(41, params, '|').subscribe(res => {
      subject.next(res);
    });
    return subject.asObservable();
  }

  InsertDetPdfSc(urlArchivo, name): Observable<any> {
    const subject = new Subject();
    const params = [];
    const idEmpresa = localStorage.getItem('Empresa');
    const user = localStorage.getItem('currentUser');
    const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    params.push(idEmpresa);
    params.push(this.data.idCot);
    if (!this.Privilegio) {
      params.push(1);
    }
    if (this.Privilegio) {
      params.push(2);
    }
    params.push(urlArchivo);
    params.push(name);
    params.push(idUser);
    this.solicitudCotizacionService.crudSolicitudCotizacion(37, params, '|').subscribe(res => {
      subject.next(res);
      this.dataSourceObservable = this.CargarDataDetCP();
      this.contadorObservable = this.CargarDataDetCP().pipe(
        map(X => X.length)
      );
    });
    return subject.asObservable();
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

  EliminarCot(nIdDetCP, sRutaArchivo) {
    const subject = new Subject();
    const params = [];
    Swal.fire({
      title: '¿Desea eliminar el documento seleccionado?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: `Aceptar`,
      denyButtonText: `Cancelar`,
    }).then(result => {
      if (result.isConfirmed) {
        params.push(nIdDetCP);
        this.solicitudCotizacionService.crudSolicitudCotizacion(38, params, '|').subscribe(res => {
          subject.next(res);
          this.dataSourceObservable = this.CargarDataDetCP();
          this.CheckAprobado();
          this.EliminarSCAzure(sRutaArchivo).subscribe(() => {
            Swal.fire(
              'Se eliminó el documento seleccionado!',
              'Presiona OK para continuar.',
              'success'
            );
          });
          this.contadorObservable = this.CargarDataDetCP().pipe(
            map(D => D.length)
          );
        });
      } else if (result.isDenied) {
      }
    });
    return subject.asObservable();
  }

  EliminarSCAzure(url): Observable<any> {
    const subject = new Subject();
    this.azureSCService.fnDeleteFile(url).subscribe(res => {
      subject.next(res);
    });
    return subject.asObservable();
  }

  SeleccionarArchivo($event, lblName) {
    document.getElementById(lblName).innerHTML = 'Seleccione un archivo:';
    this.vArchivoSeleccionado = $event.target.files;
    if ($event.target.files.length > 0) {
      document.getElementById(lblName).innerHTML = this.vArchivoSeleccionado[0].name;
      const reader = new FileReader();
      reader.onload = this._handleReaderLoaded.bind(this);
      reader.readAsBinaryString(this.vArchivoSeleccionado[0]);
    }
  }

  _handleReaderLoaded(readerEvt) {
    const binaryString = readerEvt.target.result;
    this.filestring = btoa(binaryString);
  }

  NombreCotizacion(): Observable<string> {
    const subject = new Subject<string>();
    this.ultimoInsert().pipe(
      map(r => {
        const idEmpresa = localStorage.getItem('Empresa');
        const tipoDocumento = 'SC';
        const correlativo = this.data.correlativo;
        const CP = 'CP';
        const cantidad = r;
        const NombreFF = `${idEmpresa}${tipoDocumento}${correlativo}${CP}${cantidad}`;
        return NombreFF;
      })
    ).subscribe(Fi => subject.next(Fi));
    return subject.asObservable();
  }

  UploadFile() {
    if (this.formControlFileUpload.valid) {
      this.NombreCotizacion().subscribe(Nombre => {
        this.azureSCService.fnUploadFile(this.filestring, this.vArchivoSeleccionado[0].type, Nombre).subscribe((res) => {
          this.InsertDetPdfSc(res['filename'], Nombre).subscribe(() => {
            ///this.CheckAprobado();
            this.formControlFileUpload.reset();
            Swal.fire(
              'Se subió el PDF',
              '',
              'success'
            );
            // this.correoCotizacionAdjuntadaOP(Nombre);
            document.getElementById('lblName').innerHTML = 'Seleccione un archivo:';
          });
        });
      });
    }
  }

  async AprobarSC(nIdDetCP: any, sNombreArchivo: any) {
    let param = [];
    if (this.codPresupuesto == null || this.codPresupuesto <= 0) {
      const { value: nroppto } = await Swal.fire({
        title: 'Ingrese el número de presupuesto',
        input: 'text',
        inputValue: this.codPresupuesto,
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return '¡El número de presupuesto es requerido!'
          }
        }
      })
      if (nroppto) {
        param.push(this.securityErp.getEmpresa());
        param.push(this.securityErp.getUsuarioId());
        param.push(nroppto);
        this.solicitudCotizacionService.crudSolicitudCotizacion(47, param, '|').subscribe(res => {
          if (res <= 0) {
            Swal.fire(`Número de presupuesto Invàlido: ${nroppto}`)
            return;
          }
          else {
            Swal.fire({
              title: '¿Desea aprobar el documento seleccionado?',
              showDenyButton: true,
              showCancelButton: false,
              confirmButtonText: `Aceptar`,
              denyButtonText: `Cancelar`,
            }).then(result => {

              if (result.isConfirmed) {
                let pParam = [];
                pParam.push(nIdDetCP);
                pParam.push(this.ICot.id);
                pParam.push(res);
                this.solicitudCotizacionService.crudSolicitudCotizacion(39, pParam, '|').subscribe(() => {
                  this.dataSourceObservable = this.CargarDataDetCP();
                  this.CheckAprobado();
                  Swal.fire(
                    'Se aprobó el documento seleccionado!',
                    'Presiona OK para continuar.',
                    'success'
                  );
                  this.correoElegidoOP(sNombreArchivo);
                });
              }
            });
          }
        });

      }
    }
    else {
      let params = [];
      params.push(nIdDetCP);
      params.push(this.ICot.id);
      params.push(0);
      Swal.fire({
        title: '¿Desea aprobar el documento seleccionado?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: `Aceptar`,
        denyButtonText: `Cancelar`,
      }).then(result => {
        if (result.isConfirmed) {
          this.solicitudCotizacionService.crudSolicitudCotizacion(39, params, '|').subscribe(() => {
            this.dataSourceObservable = this.CargarDataDetCP();
            this.CheckAprobado();
            Swal.fire(
              'Se aprobó el documento seleccionado!',
              'Presiona OK para continuar.',
              'success'
            );
            this.correoElegidoOP(sNombreArchivo);
          });
        }
      });
    }
  }


  validaPerfilUsuario() {
    const user = localStorage.getItem('currentUser');
    const idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    const params = [];
    params.push(idUser);
    this.solicitudCotizacionService.crudSolicitudCotizacion(48, params, '|').subscribe(
      res => {
        this.codigoPerfil = res[0].nId === 1 ? true : false;        
      }
    );
  }

  // los clientes Auditados con codigo 1 y 38
  // Con perfil(CP) 605:true
  validarVerPdfCP(): boolean {
    if (this.codigoPerfil) {
      if (this.codigoCliente == 1 || this.codigoCliente == 38)
        return true;
    }
    else
      return false
  }

  // Sin perfil(SP)
  validarVerPdfSP(): boolean {
    if ((this.codigoCliente > 1 && this.codigoCliente <= 37) || this.codigoCliente > 38)
      return true;
    else
      return false
  }

}

