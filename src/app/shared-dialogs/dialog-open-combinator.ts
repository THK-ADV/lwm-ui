import {MatDialog, MatDialogRef} from '@angular/material'
import {EMPTY, Observable} from 'rxjs'
import {switchMap} from 'rxjs/operators'
import {CreateUpdateDialogComponent, FormPayload} from './create-update/create-update-dialog.component'

// TODO use this abstraction everywhere
export const openDialog = <T, R, U>(dialogRef: MatDialogRef<T, R>, andThen: (e: R) => Observable<U>) => {
    return dialogRef.afterClosed().pipe(switchMap(x => x ? andThen(x) : EMPTY))
}

export const openDialogFromPayload = <T, U>(
    dialog: MatDialog,
    payload: FormPayload<T>,
    andThen: (e: T) => Observable<U>
): Observable<U> => {
    const dialogRef = CreateUpdateDialogComponent.instance(dialog, payload)
    return openDialog(dialogRef, andThen)
}
