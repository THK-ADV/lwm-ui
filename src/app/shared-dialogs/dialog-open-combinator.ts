import {MatDialog, MatDialogRef} from '@angular/material'
import {EMPTY, Observable, Subscription} from 'rxjs'
import {switchMap} from 'rxjs/operators'
import {CreateUpdateDialogComponent, FormPayload} from './create-update/create-update-dialog.component'
import {ConfirmationResult, ConfirmDialogComponent} from './confirm-dialog/confirm-dialog.component'
import {foldUndefined} from '../utils/functions'
import {DeleteDialogComponent} from './delete/delete-dialog.component'

// TODO use this abstraction everywhere
export const openDialog = <T, R, U>(dialogRef: MatDialogRef<T, R>, andThen: (e: R) => Observable<U>) => {
    return dialogRef.afterClosed().pipe(switchMap(x => x !== undefined ? andThen(x) : EMPTY))
}

export const openDialogFromPayload = <T, U>(
    dialog: MatDialog,
    payload: FormPayload<T>,
    andThen: (e: T) => Observable<U>
): Observable<U> => {
    const dialogRef = CreateUpdateDialogComponent.instance(dialog, payload)
    return openDialog(dialogRef, andThen)
}

const openConfirmationDialog = <A>(
    dialog: MatDialogRef<ConfirmDialogComponent, ConfirmationResult>,
    andThen: () => Observable<A>
): Observable<A> => dialog
    .afterClosed()
    .pipe(switchMap(x => {
        if (x !== undefined && x === ConfirmationResult.ok) {
            return andThen()
        } else {
            return EMPTY
        }
    }))

export const subscribeConfirmationDialog = <A>(
    dialog: MatDialogRef<ConfirmDialogComponent, ConfirmationResult>,
    andThen: () => Observable<A>,
    success: (a: A) => void,
    failure: (e?: Error) => void
): Subscription => openConfirmationDialog(dialog, andThen)
    .subscribe(a => foldUndefined(a, success, failure), failure)

export const subscribeDeleteDialog = (
    dialog: MatDialogRef<DeleteDialogComponent, string>,
    andThen: (id: string) => Observable<unknown>,
    success: () => void,
    failure: (e?: Error) => void
): Subscription => openDialog(dialog, andThen)
    .subscribe(a => foldUndefined(a, success, failure), failure)
