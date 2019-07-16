import {NgModule} from '@angular/core';
import {
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatExpansionModule
} from '@angular/material';

@NgModule({
  exports: [
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatExpansionModule
  ]
})
export class LWMMaterialModule {}


/**  Copyright 2019 Google Inc. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */