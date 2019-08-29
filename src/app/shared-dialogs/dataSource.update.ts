import {AlertService} from '../services/alert.service'
import {MatTableDataSource} from '@angular/material'

export function removeFromDataSource<M>
(dataSource: MatTableDataSource<M>, alertService?: AlertService): (model: M, match: (d: M, m: M) => boolean) => void {
    return (m, p) => {
        dataSource.data = dataSource.data.filter(d => !p(d, m))
        if (alertService) {
            alertService.reportAlert('success', 'deleted: ' + JSON.stringify(m))
        }
    }
}

export function addToDataSource<M>
(dataSource: MatTableDataSource<M>, alertService?: AlertService): (m: M[]) => void {
    return models => {
        dataSource.data = dataSource.data.concat(models)
        if (alertService) {
            alertService.reportAlert('success', 'created: ' + models.map(JSON.stringify.bind(this)).join(', '))
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
