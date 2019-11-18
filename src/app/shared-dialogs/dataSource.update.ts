import {AlertService} from '../services/alert.service'
import {MatTableDataSource} from '@angular/material'

export function removeFromDataSource<M>
(dataSource: MatTableDataSource<M>, alertService?: AlertService): (removeIf: (m: M) => boolean) => void {
    return p => {
        let removed

        dataSource.data = dataSource.data.filter(m => {
            const shouldRemove = p(m)

            if (shouldRemove) {
                removed = m
            }

            return !shouldRemove
        })

        if (alertService && removed) {
            alertService.reportAlert('success', 'deleted: ' + JSON.stringify(removed))
        }
    }
}

export function addToDataSource<M>
(dataSource: MatTableDataSource<M>, alertService?: AlertService): (m: M) => void {
    return model => {
        dataSource.data = dataSource.data.concat(model)
        if (alertService) {
            alertService.reportAlert('success', 'created: ' + JSON.stringify(model))
        }
    }
}

export function updateDataSource<M>
(dataSource: MatTableDataSource<M>, alertService?: AlertService): (model: M, match: (lhs: M, rhs: M) => boolean) => void {
    return (m, p) => {
        dataSource.data = dataSource.data.map(d => {
            return p(d, m) ? m : d
        })

        if (alertService) {
            alertService.reportAlert('success', 'updated: ' + JSON.stringify(m))
        }
    }
}
