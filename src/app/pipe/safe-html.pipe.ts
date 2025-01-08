import {Pipe, PipeTransform, SecurityContext} from '@angular/core'
import {DomSanitizer} from '@angular/platform-browser'

@Pipe({
    name: 'safeHtml',
    standalone: false
})
export class SafeHtmlPipe implements PipeTransform {

    constructor(private dom: DomSanitizer) {
    }

    transform(value) {
        // NOTE: Consider using DomSanitizer#sanitize instead of DomSanitizer#bypassSecurityTrustHtml, which executes code in `<script>` tags
        return this.dom.sanitize(SecurityContext.HTML, value)
    }

}
