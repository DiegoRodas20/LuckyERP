import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmacenParametrosComponent } from './almacen-parametros.component';

describe('AlmacenParametrosComponent', () => {
  let component: AlmacenParametrosComponent;
  let fixture: ComponentFixture<AlmacenParametrosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlmacenParametrosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlmacenParametrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
