import {Component, Inject, OnDestroy, OnInit} from '@angular/core'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog'
import {ReportCardEntryAtom} from '../models/report-card-entry.model'
import {DIALOG_WIDTH} from '../shared-dialogs/dialog-constants'
import {Annotation, AnnotationAtom} from '../models/annotation'
import {FormControl, FormGroup, Validators} from '@angular/forms'
import {Observable, Subscription} from 'rxjs'
import {fullUserName} from '../utils/component.utils'
import {AnnotationService} from '../services/annotation.service'
import {dateOrderingASC, first, partitionWith, subscribe} from '../utils/functions'
import {format} from '../utils/lwmdate-adapter'
import {User} from '../models/user.model'

export enum AnnotationDialogAction {
    create, update, delete
}

@Component({
    selector: 'lwm-annotation',
    templateUrl: './annotation.component.html',
    styleUrls: ['./annotation.component.scss']
})
export class AnnotationComponent implements OnInit, OnDestroy {

    readonly title: string
    readonly formGroup: FormGroup
    readonly messageControl: FormControl

    otherAnnotations: AnnotationAtom[]
    ownAnnotation: AnnotationAtom | undefined
    private subs: Subscription[]

    static instance(
        dialog: MatDialog,
        e: ReportCardEntryAtom,
        user: User
    ): MatDialogRef<AnnotationComponent, [Annotation, AnnotationDialogAction]> {
        return dialog.open<AnnotationComponent>(AnnotationComponent, {
            minWidth: DIALOG_WIDTH,
            data: [e, user],
            panelClass: 'lwmAnnotationDialog'
        })
    }

    constructor(
        private dialogRef: MatDialogRef<AnnotationComponent, [Annotation, AnnotationDialogAction]>,
        private readonly service: AnnotationService,
        @Inject(MAT_DIALOG_DATA) public payload: [ReportCardEntryAtom, User]
    ) {
        this.title = `Annotationen für Termin ${this.reportCardEntry().assignmentIndex + 1} (${this.reportCardEntry().label}) von ${fullUserName(this.reportCardEntry().student)}`
        this.subs = []
        this.messageControl = new FormControl(undefined, Validators.required)
        this.otherAnnotations = []
        this.ownAnnotation = undefined
        this.formGroup = new FormGroup({
            'message': this.messageControl,
        })
    }

    ngOnInit() {
        this.subs.push(subscribe(
            this.service.fromReportCardEntry(this.courseId(), this.reportCardEntry().id),
            annotations => {
                const [own, others] = partitionWith(annotations, a => a.author.id === this.user().id ? a : undefined)
                this.ownAnnotation = first(own)

                if (this.ownAnnotation) {
                    this.messageControl.setValue(this.ownAnnotation.message)
                }

                this.otherAnnotations = others.sort((lhs, rhs) => dateOrderingASC(lhs.lastModified, rhs.lastModified))
            }
        ))
    }

    private user = () =>
        this.payload[1]

    private reportCardEntry = () =>
        this.payload[0]

    private courseId = () =>
        this.reportCardEntry().labwork.course

    private makeProtocol = () => ({
        reportCardEntry: this.reportCardEntry().id,
        author: this.user().id,
        message: this.messageControl.value as string
    })

    private finishDialog = (annotation$: Observable<Annotation>, action: AnnotationDialogAction) =>
        this.subs.push(subscribe(annotation$, a => this.dialogRef.close([a, action])))

    ngOnDestroy() {
        this.subs.forEach(_ => _.unsubscribe())
    }

    showAnnotationData = (a: AnnotationAtom) =>
        a.message

    showAnnotationMetadata = (a: AnnotationAtom) =>
        `${format(a.lastModified, 'dd.MM.yyyy - HH:mm')}: ${fullUserName(a.author)}`

    onCancel = () =>
        this.dialogRef.close(undefined)

    onUpdate = () =>
        this.formGroup.valid &&
        this.ownAnnotation &&
        this.finishDialog(
            this.service.update(
                this.courseId(),
                this.makeProtocol(),
                this.ownAnnotation.id
            ),
            AnnotationDialogAction.update
        )

    onCreate = () =>
        this.formGroup.valid &&
        this.finishDialog(
            this.service.create(
                this.courseId(),
                this.makeProtocol()
            ),
            AnnotationDialogAction.create
        )

    onDelete = () =>
        this.ownAnnotation &&
        this.finishDialog(
            this.service.delete(
                this.courseId(),
                this.ownAnnotation.id
            ),
            AnnotationDialogAction.delete
        )

    hasOwnAnnotation = () =>
        this.ownAnnotation !== undefined
}
