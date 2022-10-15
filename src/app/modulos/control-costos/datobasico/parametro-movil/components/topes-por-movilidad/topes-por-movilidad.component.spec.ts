import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopesPorMovilidadComponent } from './topes-por-movilidad.component';

describe('TopesPorMovilidadComponent', () => {
  let component: TopesPorMovilidadComponent;
  let fixture: ComponentFixture<TopesPorMovilidadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopesPorMovilidadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopesPorMovilidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
