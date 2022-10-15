import { NgModule } from '@angular/core';
import { YearMonthFormatDirective } from './year-month-format.directive';
import { DateFormatDirective } from './date-format.directive';
import { MesYearFormatDirective } from './mes-year-format.directive';
import { CaracterValidadorDirective } from './caracter-validador.directive';

@NgModule({
  imports: [],
  declarations: [YearMonthFormatDirective, DateFormatDirective, MesYearFormatDirective, CaracterValidadorDirective],
  exports: [YearMonthFormatDirective, DateFormatDirective, MesYearFormatDirective, CaracterValidadorDirective]
})
export class DirectivesModule { }
