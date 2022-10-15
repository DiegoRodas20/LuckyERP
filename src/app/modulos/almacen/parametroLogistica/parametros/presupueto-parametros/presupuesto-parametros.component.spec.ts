import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PresupuestoParametrosComponent } from './presupuesto-parametros.component';

describe('PresupuestoParametrosComponent', () => {
  let component: PresupuestoParametrosComponent;
  let fixture: ComponentFixture<PresupuestoParametrosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PresupuestoParametrosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PresupuestoParametrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
