import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAuthorityUpdateDialogComponent } from './user-authority-update-dialog.component';

describe('UserEditDialogComponent', () => {
  let component: UserAuthorityUpdateDialogComponent;
  let fixture: ComponentFixture<UserAuthorityUpdateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserAuthorityUpdateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAuthorityUpdateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
