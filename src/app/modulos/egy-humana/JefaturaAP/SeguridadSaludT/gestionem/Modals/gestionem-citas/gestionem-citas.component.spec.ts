import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionemCitasComponent } from './gestionem-citas.component';

describe('GestionemCitasComponent', () => {
  let component: GestionemCitasComponent;
  let fixture: ComponentFixture<GestionemCitasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestionemCitasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionemCitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
