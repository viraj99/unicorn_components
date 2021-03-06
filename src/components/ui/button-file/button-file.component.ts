import { Component, ElementRef, EventEmitter, HostBinding, Input, Output, ViewChild } from '@angular/core';

import { UniButtonBaseComponent } from '../../base/button-base/button-base.component';

@Component({
    selector: 'uni-button-file',
    templateUrl: 'button-file.component.html',
    styleUrls: ['button-file.component.scss'],
})
export class UniButtonFileComponent extends UniButtonBaseComponent {

    @HostBinding('class.uni-button-file') componentClass = true;
    @Input() fileType: string;
    @Output() fileChange = new EventEmitter();
    @ViewChild('input') inputElement: ElementRef;

    onClick() {
        if (!this.disabled && this.inputElement && document.createEvent) {
            const evt = document.createEvent('MouseEvents');
            evt.initEvent('click', true, false);
            this.inputElement.nativeElement.dispatchEvent(evt);
        }
    }
}
