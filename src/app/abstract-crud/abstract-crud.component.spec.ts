import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbstractCRUDComponent } from './abstract-crud.component';

describe('AbstractCRUDComponent', () => {
  let component: AbstractCRUDComponent;
  let fixture: ComponentFixture<AbstractCRUDComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AbstractCRUDComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbstractCRUDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
