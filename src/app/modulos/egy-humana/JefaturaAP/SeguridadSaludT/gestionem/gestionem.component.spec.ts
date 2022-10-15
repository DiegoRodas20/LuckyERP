import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionemComponent } from './gestionem.component';

describe('GestionemComponent', () => {
  let component: GestionemComponent;
  let fixture: ComponentFixture<GestionemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestionemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
