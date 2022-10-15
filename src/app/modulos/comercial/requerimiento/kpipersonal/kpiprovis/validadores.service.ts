import { Injectable } from '@angular/core';
import {FormControl} from '@angular/forms';

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
}
