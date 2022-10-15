import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerInsideComponent } from './container-inside.component';

describe('ContainerInsideComponent', () => {
  let component: ContainerInsideComponent;
  let fixture: ComponentFixture<ContainerInsideComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContainerInsideComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerInsideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
