import { Injectable } from '@angular/core';
import { FormControl, FormGroup, FormArray } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidadoresService {

  constructor() { }

  noSelect( control: FormControl ): { [s: string]: boolean } {
    if (control.value) {
      let vControl = control.value;
      vControl = typeof(vControl) === 'string' ? vControl : vControl.tostring ;
      if ( vControl === '0' ) {
        return {
          noSelect: true
        };
      } else {
        return {};
      }
    }

    return {
      noSelect: true
    };
  }

  vCuspp ( control: FormControl ): { [s: string]: boolean } {
    if ( control.disabled === false && control.value !== null && control.value !== undefined ) {
      if ( control.value.trim() === '' ) {
        return {
          vCuspp: true
        };
      }
    } else {
      return {};
    }
  }

  vMonto ( control: FormControl ): { [s: string]: boolean } {
    if ( control.disabled === false && ( control.value === 0 || control.value === null  ) ) {
      return {
        vMonto: true
      };
    } else {
      return {};
    }
  }

  vString ( control: FormControl ): { [s: string]: boolean } {
    if ( control.disabled === false && control.value !== null && control.value !== undefined ) {

      if ( control.value.trim() === '' ) {
        return {
          vString: true
        };
      }
    } else {
      return {};
    }
  }

  vNumber ( control: FormControl ): { [s: string]: boolean } {
    if ( control.disabled === false && ( control.value === 0 || control.value === null  ) ) {
      return {
        vMonto: true
      };
    } else {
      return {};
    }
  }

  vLineas (controlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const aControl = control as FormArray;
      if (aControl.length === 0) {
        control.setErrors({ vLineas: true });
      } else {
        control.setErrors(null);
      }
    };
  }

  vTypeHead (controlName: string ) {
    return (formGroup: FormGroup) => {
      const aControl = formGroup.controls[controlName];
      const vControl = aControl.value;

      if ( vControl === undefined || vControl === null ) {
        aControl.setErrors({ vTypeHead: true });
      } else {
        const cLength = Object.keys ( vControl ).length;
        if (cLength === 0) {
          aControl.setErrors({ vTypeHead: true });
        } else {
          aControl.setErrors(null);
        }
      }
    };
  }

  vAutoComplete(control: FormControl ): { [s: string]: boolean } {
    if ( control.disabled === false && ( control.value === undefined || control.value === null  ) ) {
      return {
        vAutoComplete: true
      };
    } else {
      if ( control.value instanceof Object ) {
        return {};
      } else {
        return {
          vAutoComplete: true
        };
      }
    }
  }

  vExiste(cTipoDoc: string, cDocumento: string, cExiste: string ) {
    return ( formGroup: FormGroup ) => {

      const fcTipoDoc = formGroup.controls[cTipoDoc];
      const fcDocumento = formGroup.controls[cDocumento];
      const fcExiste = formGroup.controls[cExiste];

      if ( fcTipoDoc.value !== undefined && fcTipoDoc.value !== null &&
           fcDocumento.value !== '' ) {

        const aListaPerso = fcExiste.value as Array<any>;

        const iFind = aListaPerso.findIndex( x => {
          const a = x.sTipo === fcTipoDoc.value.sDesc;
          const b = x.sDocumento === fcDocumento.value;
          return a && b;
        });

        if (iFind > 0) {
          fcExiste.setErrors({
            esIgual: true
          });
        } else {
          fcExiste.setErrors(null);
        }

      } else {
        fcExiste.setErrors(null);
      }

    };
  }

}
