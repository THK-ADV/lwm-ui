import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from "@angular/core"
import { CourseAtom } from "../models/course.model"
import { MatDialog } from "@angular/material/dialog"
import {
  DialogMode,
  dialogSubmitTitle,
  dialogTitle,
} from "../shared-dialogs/dialog.mode"
import { FormPayload } from "../shared-dialogs/create-update/create-update-dialog.component"
import {
  emptyCourseProtocol,
  fullCourseFormInputData,
  getInitials,
} from "../utils/component.utils"
import { UserService } from "../services/user.service"
import { Subscription } from "rxjs"
import { subscribe } from "../utils/functions"
import { CourseProtocol, CourseService } from "../services/course.service"
import { AlertService } from "../services/alert.service"
import { CourseAuthorityUpdateDialogComponent } from "../course-authority-dialog/course-authority-dialog.component"
import { withCreateProtocol } from "../models/protocol.model"
import { openDialogFromPayload } from "../shared-dialogs/dialog-open-combinator"

@Component({
  selector: "lwm-course-detail",
  templateUrl: "./course-detail.component.html",
  styleUrls: ["./course-detail.component.scss"],
  standalone: false,
})
export class CourseDetailComponent implements OnDestroy {
  @Input() course: Readonly<CourseAtom>
  @Input() hasPermission: Readonly<boolean>

  @Output() courseUpdateEmitter: EventEmitter<Readonly<CourseAtom>>

  private readonly subs: Subscription[]

  constructor(
    private readonly dialog: MatDialog,
    private readonly userService: UserService,
    private readonly courseService: CourseService,
    private readonly alertService: AlertService,
  ) {
    this.subs = []
    this.courseUpdateEmitter = new EventEmitter<Readonly<CourseAtom>>()
  }

  getInitials_(): string {
    return getInitials(this.course.lecturer)
  }

  editAuthorites() {
    const dialogRef = CourseAuthorityUpdateDialogComponent.instance(
      this.dialog,
      this.course,
    )
  }

  onEdit() {
    const inputData = fullCourseFormInputData(this.userService)(
      this.course,
      true,
    )
    const mode = DialogMode.edit

    const payload: FormPayload<CourseProtocol> = {
      headerTitle: dialogTitle(mode, "Modul"),
      submitTitle: dialogSubmitTitle(mode),
      data: inputData,
      makeProtocol: (output) => {
        // TODO maybe we should merge withCreateProtocol with makeProtocol and give the user the chance to catch up with disabled updates. since they are always used together. don't they?
        return withCreateProtocol(output, emptyCourseProtocol(), (p) => {
          p.lecturer = this.course.lecturer.id
          p.label = this.course.label
        })
      },
    }

    const dialog$ = openDialogFromPayload(this.dialog, payload, (p) =>
      this.courseService.update(p, this.course.id),
    )

    const s = subscribe(dialog$, (c) => this.courseUpdateEmitter.emit(c))
    this.subs.push(s)
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe())
  }
}
