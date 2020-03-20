import {AlertService} from '../services/alert.service'
import {MatTableDataSource} from '@angular/material'

export const removeFromDataSource = <M>(
    ds: MatTableDataSource<M>,
    alert?: AlertService
): (removeIf: (m: M) => boolean) => void => p => {
    let removed

    ds.data = ds.data.filter(m => {
        const shouldRemove = p(m)

        if (shouldRemove) {
            removed = m
        }

        return !shouldRemove
    })

    if (alert && removed) {
        alert.reportAlert('success', 'deleted: ' + JSON.stringify(removed))
    }
}

export const addToDataSource = <M>(
    ds: MatTableDataSource<M>,
    alert?: AlertService
): (m: M) => void => model => {
    ds.data = ds.data.concat(model)
    if (alert) {
        alert.reportAlert('success', 'created: ' + JSON.stringify(model))
    }
}

export const updateDataSource = <M>(
    ds: MatTableDataSource<M>,
    alert?: AlertService
): (model: M, match: (lhs: M, rhs: M) => boolean) => void => (m, p) => {
    ds.data = ds.data.map(d => {
        return p(d, m) ? m : d
    })

    if (alert) {
        alert.reportAlert('success', 'updated: ' + JSON.stringify(m))
    }
}
