import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequerimientoSmComponent } from './requerimiento-sm.component';

describe('RequerimientoSmComponent', () => {
  let component: RequerimientoSmComponent;
  let fixture: ComponentFixture<RequerimientoSmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequerimientoSmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequerimientoSmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
