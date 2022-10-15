import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinoValidacionesComponent } from './destino-validaciones.component';

describe('DestinoValidacionesComponent', () => {
  let component: DestinoValidacionesComponent;
  let fixture: ComponentFixture<DestinoValidacionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DestinoValidacionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DestinoValidacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
