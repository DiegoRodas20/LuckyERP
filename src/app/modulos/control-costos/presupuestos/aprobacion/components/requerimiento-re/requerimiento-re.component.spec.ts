import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequerimientoReComponent } from './requerimiento-re.component';

describe('RequerimientoReComponent', () => {
  let component: RequerimientoReComponent;
  let fixture: ComponentFixture<RequerimientoReComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequerimientoReComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequerimientoReComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
