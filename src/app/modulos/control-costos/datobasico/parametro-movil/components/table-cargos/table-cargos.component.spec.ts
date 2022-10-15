import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCargosComponent } from './table-cargos.component';

describe('TableCargosComponent', () => {
  let component: TableCargosComponent;
  let fixture: ComponentFixture<TableCargosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableCargosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCargosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
