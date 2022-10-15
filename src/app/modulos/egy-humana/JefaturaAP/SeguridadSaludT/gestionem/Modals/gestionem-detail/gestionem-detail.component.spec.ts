import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionemDetailComponent } from './gestionem-detail.component';

describe('GestionemDetailComponent', () => {
  let component: GestionemDetailComponent;
  let fixture: ComponentFixture<GestionemDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestionemDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionemDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
