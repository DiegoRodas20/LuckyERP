import { Component, OnInit, Inject,ElementRef, ViewChild } from '@angular/core';
import { LiquidacionesService } from '../liquidaciones.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {ErrorStateMatcher} from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ControlVisorComponent } from '../control-aval/control-visor/control-visor.component'
import { PendienteLiquidarComponent } from '../control-aval/pendiente-liquidar/pendiente-liquidar.component'
import { Router } from '@angular/router';
import {map, startWith} from 'rxjs/operators';
import {Observable, BehaviorSubject} from 'rxjs';
import Swal from 'sweetalert2';
import { OverlayContainer } from '@angular/cdk/overlay';

export interface Aval{
  nIdAval: number;
}

export interface EntityBase {
  pId: number;
  sDescripcion:string;
  sParametro: string;
}

// Importante para las validaciones
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-control-aval',
  templateUrl: './control-aval.component.html',
  styleUrls: ['./control-aval.component.css']
})
export class ControlAvalComponent implements OnInit {

  //Tabla material PPto
  dsControlAval: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns: string[] = ['nIdControlAval', 'sDocumento', 'sDescripcion','sPlanilla', 'sLiminte', 'nTotalFirmado', 'nTotalLiquidar','nTotalDisponible'];

  @ViewChild('modalPersonal') modalPersonal: ElementRef;
  matcher = new MyErrorStateMatcher();
  txtFiltro= new FormControl();

  url: string;
  idUser :number; // id del usuario
  pNom:string;    // Nombre Usr
  idEmp: string;  // id de la empresa del grupo Actual
  pPais: string;  // Codigo del Pais de la empresa Actual
  pOpcion: number // variable para el cambio de pantalla

  vPrincipal: boolean = true;
  vSecundario: boolean = false;
  vModificar: boolean = false;

  personalForm: FormGroup;
  value3: any;

  lisAval = [];
  lCboSolcitante = [];
  filteredSolicitante: Observable<EntityBase[]>;

  constructor(
    private spinner: NgxSpinnerService,
    private vLiquidacionSer: LiquidacionesService,
    private formBuilder: FormBuilder,
    @Inject('BASE_URL') baseUrl: string,
    public dialog: MatDialog,
    private route:Router,
    private overlayContainer: OverlayContainer){
      this.overlayContainer.getContainerElement().classList.add("multiDialog");
      this.url = baseUrl;
    }


  ngOnInit(): void {

    //Obtener Variables Generales del proyecto .
    let user    = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom   = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp  = localStorage.getItem('Empresa');
    this.pPais  = localStorage.getItem('Pais');

    this.personalForm  = this.formBuilder.group({
      txtPersonal: ['', Validators.required],
      nId_Personal: ['', Validators.required],
      txtPlanilla: [''],
      nLimite: [''],
      txtTotalFirmado: [0],
      txtTotPorLiquidar: [0],
      txtTotDisponible: [0]
    });

    this.fnListarAval();
    this.fnController();
  }

  ngOnDestroy(){
    this.overlayContainer.getContainerElement().classList.remove("multiDialog");
  }

  fnListarAval = function(){
    this.spinner.show();
    //let vFiltro: any  = '';
    var pParametro = []; //Parametros de campos vacios
    pParametro.push(this.idEmp);

    this.vLiquidacionSer.fnControlAval(1, 2, pParametro, 1, this.url).subscribe(
        res => {
          //console.log(res)
          this.lisAval = res
          this.dsControlAval = new MatTableDataSource(res);
          this.dsControlAval.paginator = this.paginator;
          this.dsControlAval.sort = this.sort;

          //Si tenemos algun valor en filtro, se debe filtrar para no quitar el foco al usuario
          const filterValue = this.txtFiltro.value == null? '':this.txtFiltro.value ;
          if(filterValue != "")
          {
            this.dsControlAval.filter = filterValue.trim().toLowerCase();

            if (this.dsControlAval.paginator) {
              this.dsControlAval.paginator.firstPage();
            }
          }

          this.spinner.hide();
      },
      err => {
          this.spinner.hide();
          console.log(err);
      },
      () => {
          this.spinner.hide();
      }
    );

  }

  fnFiltrar(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsControlAval.filter = filterValue.trim().toLowerCase();

    if (this.dsControlAval.paginator) {
      this.dsControlAval.paginator.firstPage();
    }
  }

  async fnController() {
    let pParametro= [];
    pParametro.push(this.pPais);

    //Metodo que devuelve la lista de busqueda sensitiva para Solicitante
    pParametro= [];
    pParametro.push(this.idEmp);
    pParametro.push(this.personalForm.get('txtPersonal').value); //

    this.value3 = await this.vLiquidacionSer.fnControlAval2(1, 2, pParametro, 2, this.url);

    this.lCboSolcitante = this.value3;
    this.filteredSolicitante = this.personalForm.get("txtPersonal").valueChanges
    .pipe(
      startWith(''),
      map(cli => cli ? this._filterSolicitante(cli) :  this.lCboSolcitante.slice() )
    );

  }

  private _filterSolicitante(value: string): any[] {

    const filterValue = value.toLowerCase();
    return this.lCboSolcitante.filter(
      cli => cli.sDescripcion.toLowerCase().includes(filterValue) //=== 0
      );
  }

  get SolictanteNotFound() {
    let name = this.personalForm.get('txtPersonal').value;
    if (this.personalForm.get('txtPersonal').touched) {
      const listaTemp = this.lCboSolcitante.filter(option => option.sDescripcion === name );

      if ( listaTemp.length === 0 )
      {
        this.personalForm.controls.nId_Personal.setValue('');
        return true;
      }
      else
      {
        this.personalForm.controls.nId_Personal.setValue(listaTemp[0].nId);
        this.personalForm.controls.txtPlanilla.setValue(listaTemp[0].sParametro);
        return false;
      }
    }
    return false;
  }

  fnVerPendientes = function(p){
    const dialogRef = this.dialog.open(PendienteLiquidarComponent, {
      width: '80%',
      data: p //.nIdPersonal
    });
  }

  fnArchivosAval (data: any){

    //Creamos el objeto para referenciar el dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = data;
    dialogConfig.autoFocus = false;
    dialogConfig.backdropClass = 'backdropBackground'

    //A la hora de cerrar taremos nuevamente la lista y si hay filtro de busqueda se aplica en el metodo
    const digalogReg = this.dialog.open(ControlVisorComponent, dialogConfig);
    digalogReg.afterClosed().subscribe(data => {

      this.fnListarAval();
    })

  }

  fnNuevo = function(){
    this.pOpcion = 1; //Nuevo
    this.vModificar = false;
    this.personalForm.controls.txtPersonal.setValue('');
    this.personalForm.controls.txtPlanilla.setValue('');
    this.personalForm.controls.txtTotalFirmado.setValue(0);
    this.personalForm.controls.txtTotPorLiquidar.setValue(0);
    this.personalForm.controls.txtTotDisponible.setValue(0);
    this.personalForm.controls.nLimite.setValue(0);
  }

  VerDetalle = function(vAval){
    //console.log(vAval);
    this.pOpcion = 2; //Modificar
    this.vModificar = true;
    this.personalForm.controls.txtPersonal.setValue(vAval.sDocumento+' - '+vAval.sDescripcion);
    this.personalForm.controls.txtPlanilla.setValue(vAval.sCodPlanilla + ' - '+ vAval.sPlanilla);
    this.personalForm.controls.txtTotalFirmado.setValue(vAval.nTotalFirmado);
    this.personalForm.controls.txtTotPorLiquidar.setValue(vAval.nTotalLiquidar);
    this.personalForm.controls.txtTotDisponible.setValue(vAval.nTotalDisponible);
    this.personalForm.controls.nLimite.setValue(vAval.bSinLimite);
  }

  fnGuardarPersonal = function(){
    var pParametro = []; //Parametros de campos vacios
    let vPersonal = this.personalForm.value.nId_Personal;
    let vLimite =  this.personalForm.value.nLimite == true ? 1 : 0;
    let vAccion: number = 0;
    if (this.personalForm.invalid) {
      //Si aun hay datos Obligatorios muestra mensaje y corta el proceso
      Swal.fire('¡Verificar!','Existen datos obligatorios para registrar al personal.','warning')
      return;
    }

    for (let index = 0; index < this.lisAval.length; index++) {
      if(vPersonal == this.lisAval[index].nIdPersonal)
      {
        Swal.fire('¡Verificar!','El personal indicado ya esta presente en la relación de control Aval, vafor de verificar.','warning')
      return;
      }
    }

    this.spinner.show();
    pParametro.push(vPersonal);
    pParametro.push(vLimite);
    console.log(pParametro)

    vAccion = this.pOpcion==1 ? 1 : 3
    this.vLiquidacionSer.fnControlAval(1, vAccion, pParametro, 0, this.url).subscribe(
        res => {
          // console.log(res)
          if(res == 0)
          {
            Swal.fire('Error','Se detecto un problema de conexión, vuelva a intentar','warning')
          }
          else
          {
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Se registro correctamente',
              showConfirmButton: false,
              timer: 1500
            })

            this.fnListarAval();

          }

          this.spinner.hide();
      },
      err => {
          this.spinner.hide();
          console.log(err);
      },
      () => {
          this.spinner.hide();
      }
    );


    this.modalPersonal.nativeElement.click();
  }

}
