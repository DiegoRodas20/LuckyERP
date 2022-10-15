import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCotizacionComponent } from './add-cotizacion.component';

describe('AddCotizacionComponent', () => {
  let component: AddCotizacionComponent;
  let fixture: ComponentFixture<AddCotizacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCotizacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCotizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
