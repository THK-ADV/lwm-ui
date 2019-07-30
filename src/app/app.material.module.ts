import {NgModule} from '@angular/core'
import {
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSidenavModule,
    MatSortModule,
    MatTableModule,
    MatToolbarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatChipsModule
} from '@angular/material'

import {MatDialogModule} from '@angular/material/dialog'
import {MatSnackBarModule} from '@angular/material/snack-bar'

@NgModule({
    exports: [
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatToolbarModule,
        MatSidenavModule,
        MatListModule,
        MatExpansionModule,
        MatTableModule,
        MatSortModule,
        MatDialogModule,
        MatSnackBarModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatTooltipModule,
        MatAutocompleteModule,
        MatChipsModule
    ]
})
export class LWMMaterialModule {
}


/**  Copyright 2019 Google Inc. All Rights Reserved.
 Use of this source code is governed by an MIT-style license that
 can be found in the LICENSE file at http://angular.io/license */
