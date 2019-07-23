import { TestBed } from '@angular/core/testing';

import { AbstractCRUDService } from './abstract-crud.service';

describe('AbstractCRUDService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AbstractCRUDService = TestBed.get(AbstractCRUDService);
    expect(service).toBeTruthy();
  });
});
