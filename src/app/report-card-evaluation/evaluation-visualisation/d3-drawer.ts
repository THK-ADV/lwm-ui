import {groupBy, toTupleArray} from '../../utils/group-by'
import {ReportCardEntry} from '../../models/report-card-entry.model'
import {EntryType} from '../../models/entry-type'

interface LineData {
    x: number
    xLabel: string
    yp: number
    ya: number
    total: number
    label: string
}

interface AreaData {
    x: number
    xLabel: string
    y0p: number
    y0a: number
    y1p: number
    y1a: number
    total: number
}

type ReportCardEntryByAssignmentIndex = [number, ReportCardEntry[]][]

const groupByAssignmentIndex = (data: Readonly<ReportCardEntry[]>): ReportCardEntryByAssignmentIndex =>
    toTupleArray(groupBy(data, _ => _.assignmentIndex))
        .sort((a, b) => a[0][0] - b[0][0])

const accIfEntryType = (entryType: EntryType): (acc: number, x: ReportCardEntry) => number => {
    return (acc, x) => {
        const hasPassed = x.entryTypes.some(_ => _.entryType === entryType && (_.bool || false))
        if (hasPassed) {
            return acc + 1
        } else {
            return acc
        }
    }
}

const toLineData = (data: ReportCardEntryByAssignmentIndex, entryType: EntryType): LineData[] => {
    return data.map(([index, xs]) => {
        const sum = xs.reduce(accIfEntryType(entryType), 0)

        const total = xs.length
        const percent = 100 / total * sum

        return {x: index + 1, xLabel: xs[0].label, yp: percent, ya: sum, total: total, label: entryType}
    })
}

const toAreaData = (data: ReportCardEntryByAssignmentIndex): AreaData[] => {
    return data.map(([index, xs]) => {
        const sumAtt = xs.reduce(accIfEntryType('Anwesenheitspflichtig'), 0)
        const sumCert = xs.reduce(accIfEntryType('Testat'), 0)

        const total = xs.length
        const certPercent = 100 / total * sumCert
        const attPercent = 100 / total * sumAtt

        return {
            x: index + 1,
            xLabel: xs[0].label,
            y0p: certPercent,
            y0a: sumCert,
            y1p: attPercent,
            y1a: sumAtt,
            total: total
        }
    })
}

export function jsonDrawer(d3, svg, container, scaleX, scaleY) {
    const allCircles = svg.selectAll('circle')

    const drawLine = (data, color) => {
        const line = d3.line()
            .curve(d3.curveCardinal.tension(0.8))
            .defined(d => d.yp > 0)
            .x(function (d) {
                return scaleX(d.x)
            })
            .y(function (d) {
                return scaleY(d.yp)
            })

        svg
            .append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 1.5)
            .attr('d', line)
    }

    const drawArea = (data, color) => {
        const area = d3.area()
            .defined(d => d.y0p > 0.0 && d.y1p > 0.0)
            .x(d => scaleX(d.x))
            .y0(d => scaleY(d.y0p))
            .y1(d => scaleY(d.y1p))

        svg.append('path')
            .datum(data)
            .attr('fill', color)
            .attr('stroke', 'none')
            .attr('d', area)
            .style('opacity', '0.5')
            .style('mix-blend-mode', 'multiply')
    }

    const drawCircle = (dataset, itemColor) => {
        const data = dataset.filter(d => d.yp > 0.0)

        allCircles
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', d => scaleX(d.x))
            .attr('cy', d => scaleY(d.yp))
            .attr('r', 3)
            .attr('fill', itemColor)
            .on('mouseover', function (d) {
                const x = parseFloat(d3.select(this).attr('cx')) + 5 / 2
                const y = parseFloat(d3.select(this).attr('cy')) + 14

                showTooltip(x, y, d)
            })
            .on('mouseout', function (_) {
                removeTooltip()
            })
    }

    const drawJson = (data: Readonly<ReportCardEntry[]>, itemColor: string) => {
        const grouped = groupByAssignmentIndex(data)
        const attendanceData = toLineData(grouped, 'Anwesenheitspflichtig')
        const certificateData = toLineData(grouped, 'Testat')
        const bothData = toAreaData(grouped)

        drawArea(bothData, itemColor)

        drawLine(attendanceData, itemColor)
        drawLine(certificateData, itemColor)

        drawCircle(attendanceData.concat(certificateData), itemColor)
    }

    const showTooltip = (x, y, d) => {
        const body = d.ya + ' / ' + d.total + ' (' + parseFloat(d.yp).toFixed(2) + '%)'
        const head = d.label

        const tt = d3.select('#tooltip')
            .style('left', x + 'px')
            .style('top', y + 'px')

        tt.select('#bodyValue')
            .text(body)

        tt.select('#headlineValue')
            .text(head)

        d3.select('#tooltip').classed('hidden', false)
    }

    const removeTooltip = () => d3.select('#tooltip').classed('hidden', true)

    return Object.freeze(drawJson)
}
