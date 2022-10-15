import { Component, OnInit, Input } from '@angular/core';
import { AsientopllaService } from '../../../services/asientoplla.service';
import { AsientoPllaAnimations } from '../../../Animations/adminp.animations';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ValidadoresService } from '../../../Validators/validadores.service';
import Swal from 'sweetalert2';
import { IMatriz, IMantenimiento } from '../../../Model/Iasientoplla';

export class MyErrorStateMatcher implements ErrorStateMatcher  {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-modalMatriz',
  templateUrl: './modalMatriz.component.html',
  styleUrls: ['./modalMatriz.component.css', './modalMatriz.component.scss'],
  providers: [ AsientopllaService],
  animations: [ AsientoPllaAnimations]
})
export class ModalMatrizComponent implements OnInit {

  @Input() fromParent;

  aParam: IMatriz = new IMatriz(0, '0', '0', false, '1', '');
  matcher = new MyErrorStateMatcher();

  // Progress Bar
  pbMatriz: boolean;

  fbNew = [
    {icon: 'save', tool: 'Guardar'},
    {icon: 'cancel', tool: 'Cancelar'}
  ];
  fbView = [
    {icon: 'edit', tool: 'Editar'},
    {icon: 'delete', tool: 'Eliminar'},
  ];

  abMatriz = [];
  tsMatriz = 'inactive';
  toggleMatriz: number;

  // Combobox
  cboPlanilla = new Array();
  cboConcepto = new Array();

  // FormGroup
  fgMatriz: FormGroup;

  Listado: IMantenimiento[] = [];

  constructor(
    public service:AsientopllaService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private _snackBar: MatSnackBar
  ) {
    this.new_fgMatriz();
  }

  new_fgMatriz() {
    this.fgMatriz = this.fb.group({
      codigo: 0,
      codPlla: ['', [Validators.required]],
      codConcepto: ['', [Validators.required]],
      cuentaContable: ['', [Validators.required]],
      tipo: [''],
      aTipo: ['', [Validators.required]]
    });
  }

  get getMatriz() { return this.fgMatriz.controls; }

  async ngOnInit(): Promise<void>  {
    this.spinner.show('spi_matriz');

    await this.cboGetPlanilla();
    await this.cboGetConcepto();

    const opc = this.fromParent.opcMantenimiento;
    const array = this.fromParent.aMatriz;
    const concepto: boolean = this.fromParent.concepto;
    this.Listado = this.fromParent.aListado;

    if(concepto){
      this.fgMatriz.patchValue({
        codigo: '',
        codPlla: array.codPlla,
        codConcepto: array.codConcepto,
        tipo: '',
        aTipo: '',
        cuentaContable: ''
      });
    }

    this.toggleMatriz = opc;

    // MODIFICAR
    if (opc === 2) {

      this.fgMatriz.controls['codConcepto'].disable({onlySelf: true});
      this.fgMatriz.controls['codPlla'].disable({onlySelf: true});
      this.fgMatriz.controls['aTipo'].disable({onlySelf: true});
      this.fgMatriz.controls['cuentaContable'].disable({onlySelf: true});

      this.fgMatriz.patchValue({
        codigo: array.codigo,
        codPlla: array.codPlla,
        codConcepto: array.codConcepto,
        tipo: array.tipo,
        aTipo: array.tipo == true ? '1' : '0',
        cuentaContable: array.cuentaContable
      });
    }

    this.spinner.hide('spi_matriz');
    this.onToggleFab(this.toggleMatriz, 1);

  }

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = ( stat === -1 ) ? ( this.abMatriz.length > 0 ) ? 0 : 1 : stat;
        this.tsMatriz = ( stat === 0 ) ? 'inactive' : 'active';
        this.abMatriz = ( stat === 0 ) ? [] : this.fbNew;
        break;

      case 2:
        stat = ( stat === -1 ) ? ( this.abMatriz.length > 0 ) ? 0 : 1 : stat;
        this.tsMatriz = ( stat === 0 ) ? 'inactive' : 'active';
        this.abMatriz = ( stat === 0 ) ? [] : this.fbView;
        break;
    }
  }

  clickFab(opc: number, index: number) {
    switch (opc) {
      // Nuevo
      case 1:
        switch (index) {
          // Guardar
          case 0:

            if (this.fgMatriz.invalid) {
              Swal.fire(
                'No se puede guardar',
                'Información incorrecta o incompleta',
                'error'
              );

              this.pbMatriz = false;

            }else{

              Swal.fire({
                title: '¿ Estas seguro de ingresar el registro?',
                text: '',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#ff4081',
                confirmButtonText: 'Confirmar !',
                allowOutsideClick: false
              }).then((result) => {
                if (result.isConfirmed) {

                  this.saveMatriz();
                  this.toggleMatriz = 1;
                }
              });
            }
            break;

          // Cancelar
          case 1:
            this.activeModal.dismiss();
            break;
        }
        break;

      // View
      case 2:
        switch (index) {
          // Editar
          case 0:
            this.fgMatriz.controls['aTipo'].enable();
            this.fgMatriz.controls['cuentaContable'].enable();

            this.abMatriz = [];
            this.delay(250).then(any => {
              this.abMatriz = this.fbNew;
              this.tsMatriz = 'active2';
            });

            this.toggleMatriz = 3;
            break;

          // Eliminar
          case 1:
            Swal.fire({
              title: '¿ Estas seguro de eliminar el registro?',
              text: '',
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#ff4081',
              confirmButtonText: 'Confirmar !',
              allowOutsideClick: false
            }).then(async (result) => {
              if (result.isConfirmed) {

                this.pbMatriz = true;

                await this.deleteMatriz();

                this.pbMatriz = false;

              }
            });
            break;
        }
        break;

      case 3:
        switch (index) {
          case 0:
            Swal.fire({
              title: '¿ Estas seguro de modificar el registro?',
              text: '',
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#ff4081',
              confirmButtonText: 'Confirmar !',
              allowOutsideClick: false
            }).then((result) => {
              if (result.isConfirmed) {

                this.saveMatriz();

                this.toggleMatriz = 1;
              }
            });
            break;

          // Cancelar
          case 1:

            const array = this.fromParent.aMatriz;
            this.fgMatriz.controls['codConcepto'].disable({onlySelf: true});
            this.fgMatriz.controls['codPlla'].disable({onlySelf: true});
            this.fgMatriz.controls['aTipo'].disable({onlySelf: true});
            this.fgMatriz.controls['cuentaContable'].disable({onlySelf: true});

            this.fgMatriz.patchValue({
              codigo: array.codigo,
              codPlla: array.codPlla,
              codConcepto: array.codConcepto,
              tipo: array.tipo,
              aTipo: array.tipo == true ? '1' : '0',
              cuentaContable: array.cuentaContable
            });

            this.abMatriz = [];
            this.delay(250).then(any => {
              this.abMatriz = this.fbView;
              this.tsMatriz = 'active2';
            });

            this.toggleMatriz = 2;
            break;
        }
        break;
    }
  }

  async cboGetPlanilla() {
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    await this.service.cargarPlanilla(nIdEmp).then( (value: any) => {
      if(value.success === true){
        this.cboPlanilla = value.response.data;
      }else{
        Swal.fire('', value.errors[0].message);
        this.spinner.hide('spi_mantenimiento');
      }
    });
  }

  async cboGetConcepto() {
    const nIdPais = JSON.parse(localStorage.getItem('Pais'));

    await this.service.cargarConceptos(nIdPais).then( (value: any) => {
      if(value.success === true){
        this.cboConcepto = value.response.data;
      }else{
        Swal.fire('', value.errors[0].message);
        this.spinner.hide('spi_mantenimiento');
      }
    });
  }

  async deleteMatriz() {

    this.aParam = new IMatriz(0, '0', '0', false, '1', '');
    let vfgMatriz = this.fgMatriz.value;
    this.aParam = vfgMatriz;
    this.aParam.accion = '3';
    this.spinner.show('spi_matriz');

    this.service.agregarMatriz(this.aParam).subscribe(response => {

      if(response.success = true){

        Swal.fire('Registro eliminado','','success');

        const oReturn = new Object();

        oReturn['modal'] = 'matriz';
        oReturn['value'] = 'loadAgain';

        this.spinner.hide('spi_matriz');
        this.activeModal.close(oReturn);

      }else{
        Swal.fire('', response.errors[0].message);
        this.spinner.hide('spi_mantenimiento');
      }
    }, error => {
      Swal.fire('', error.error.errors[0].message);
      this.spinner.hide('spi_mantenimiento');
    });
  }

  async saveMatriz() {

    this.pbMatriz = true;
    this.spinner.show('spi_matriz');

    let vfgMatriz = this.fgMatriz.value;
    let mensaje: string;
    let contador: number = 0;

    this.aParam = vfgMatriz;
    this.aParam.codigo = this.fromParent.opcMantenimiento == 1 ? 0 : vfgMatriz.codigo;
    this.aParam.tipo = vfgMatriz.aTipo == '1' ? true : false;
    this.aParam.accion = this.fromParent.opcMantenimiento;

    if (vfgMatriz.codigo === 0) {
      mensaje = 'Registro satisfactorio';

      this.Listado.filter(x => {
        if(x.codConcepto === this.aParam.codConcepto && x.codPlla === this.aParam.codPlla && x.tipo === this.aParam.tipo){
          contador += 1;
        }
      });

    }else{
      vfgMatriz.codPlla = this.fromParent.aMatriz.codPlla;
      vfgMatriz.codConcepto = this.fromParent.aMatriz.codConcepto;
      vfgMatriz.tipo = this.fromParent.aMatriz.tipo;
      vfgMatriz.cuentaContable = this.fromParent.aMatriz.cuentaContable;
      mensaje = 'Modificación satisfactoria';

      this.Listado.filter(x => {
        if(x.codConcepto === this.aParam.codConcepto && x.codPlla === this.aParam.codPlla && x.tipo === this.aParam.tipo){
          if (parseInt(x.codigo) !== this.aParam.codigo) {
            contador += 1;
          }
        }
      });
    }



    if(contador > 0){
      this.showAlert('Registro existente', "Error", 5);
      this.pbMatriz = false;
      return false;

    }else{

      this.service.agregarMatriz(this.aParam).subscribe(data => {
        if (data.success === true) {
          this.showAlert(mensaje, "Completado", 5);

          const oReturn = new Object();

          oReturn['modal'] = 'matriz';
          oReturn['value'] = 'loadAgain';

          this.spinner.hide('spi_matriz');
          this.activeModal.close(oReturn);
          this.pbMatriz = false;
        }
        else {
          this.showAlert(data, "Error", 5);
        }
      }, err => {
        console.log(err);
        this.spinner.hide('spi_matriz');
      });
    }
  }

  showAlert(data: string, titulo: string, duration: number) {
    this._snackBar.open(data, titulo, {
      duration: duration * 1000,
      verticalPosition: "top"
    });
  }

  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms)).then();
  }
}
