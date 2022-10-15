import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlemComponent } from './controlem.component';

describe('ControlemComponent', () => {
  let component: ControlemComponent;
  let fixture: ComponentFixture<ControlemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
