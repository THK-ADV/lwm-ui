import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateDialogComponent } from './create-update-dialog.component';

describe('CreateUpdateDialogComponent', () => {
  let component: CreateUpdateDialogComponent;
  let fixture: ComponentFixture<CreateUpdateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateUpdateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateUpdateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should emitter', () => {
    expect(component).toBeTruthy();
  });
});
