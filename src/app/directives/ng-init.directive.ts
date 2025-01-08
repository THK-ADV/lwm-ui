import {Directive, EventEmitter, Input, OnInit, Output} from '@angular/core'

@Directive({
    selector: '[appNgInit]',
    standalone: false
})
export class NgInitDirective implements OnInit {

    @Input() toggle: boolean

    @Output('appNgInit') initEvent: EventEmitter<any> = new EventEmitter()

    ngOnInit() {
        if (this.toggle) {
            setTimeout(() => this.initEvent.emit(), 10)
        }
    }
}
