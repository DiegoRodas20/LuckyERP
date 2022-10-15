import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarDataDesplegableComponent } from './agregar-data-desplegable.component';

describe('AgregarDataDesplegableComponent', () => {
  let component: AgregarDataDesplegableComponent;
  let fixture: ComponentFixture<AgregarDataDesplegableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgregarDataDesplegableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarDataDesplegableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
