import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appCaracterValidador]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: CaracterValidadorDirective,
    multi: true
  }]
})
export class CaracterValidadorDirective implements Validator{

  validate(control: AbstractControl): ValidationErrors | null {
    const caracteres = /^[^|?/]*$/;   // /[^|?/]/
    const valid = caracteres.test(control.value);
    return !valid ? { 'caracterValidator': true } : null;
  }

}
