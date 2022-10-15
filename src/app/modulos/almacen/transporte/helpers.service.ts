import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class HelpersService {

  constructor() { }

  mayorACero(control: AbstractControl): ValidationErrors | null {
    const valid = (Number(control.value) > 0);
    return valid ? null : { mayorACeroValidator: 'Mayor a 0' };
  }
}
