import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequerimientoRrComponent } from './requerimiento-rr.component';

describe('RequerimientoRrComponent', () => {
  let component: RequerimientoRrComponent;
  let fixture: ComponentFixture<RequerimientoRrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequerimientoRrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequerimientoRrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
