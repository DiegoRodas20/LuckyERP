import {
  CalendarDateFormatter,
  CalendarEvent,
  CalendarView,
  DAYS_OF_WEEK,
} from "angular-calendar";
import { Subject } from "rxjs";
import Swal from "sweetalert2";

export default class CalendarConfig {
  locale = "es";
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.MONDAY, DAYS_OF_WEEK.SUNDAY];
  view: CalendarView = CalendarView.Month;
  events: CalendarEvent[] = [];

  // Calendar setup
  viewDate: Date = new Date();
  eventMain: CalendarEvent[] = [];

  refresh: Subject<any> = new Subject();

  subDate: Date = new Date();
  eventSub: CalendarEvent[] = [];
  refreshSub: Subject<any> = new Subject();

  constructor() {}
}
