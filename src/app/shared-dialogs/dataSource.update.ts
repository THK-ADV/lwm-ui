import {UniqueEntity} from '../models/unique.entity.model'
import {AlertService} from '../services/alert.service'
import {MatTableDataSource} from '@angular/material'

export function removeFromDataSource<D, M extends UniqueEntity>
(alertService: AlertService, dataSource: MatTableDataSource<D>): (model: M, match: (d: D, m: M) => boolean) => void {
    return (m, p) => {
        dataSource.data = dataSource.data.filter(d => !p(d, m))
        alertService.reportAlert('success', 'deleted: ' + JSON.stringify(m))
    }
}

export function addToDataSource<M extends UniqueEntity>
(alertService: AlertService, dataSource: MatTableDataSource<M>): (m: M[]) => void {
    return models => {
        dataSource.data = dataSource.data.concat(models)
        alertService.reportAlert('success', 'created: ' + models.map(JSON.stringify.bind(this)).join(', '))
    }
}

// export function updateDataSource<M extends UniqueEntity>
// (alertService: AlertService, dataSource: MatTableDataSource<M>): (model: M, match: (lhs: M, rhs: M) => boolean) => void {
//     return (m, p) => {
//         dataSource.data = dataSource.data.map(d => {
//             return p(d, m) ? m : d
//         })
//
//         this.alertService.reportAlert('success', 'updated: ' + JSON.stringify(m))
//     }
// }
