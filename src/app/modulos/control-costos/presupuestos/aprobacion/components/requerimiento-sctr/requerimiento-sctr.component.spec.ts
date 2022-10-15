import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequerimientoSctrComponent } from './requerimiento-sctr.component';

describe('RequerimientoSctrComponent', () => {
  let component: RequerimientoSctrComponent;
  let fixture: ComponentFixture<RequerimientoSctrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequerimientoSctrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequerimientoSctrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
