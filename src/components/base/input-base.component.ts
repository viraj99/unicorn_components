import { EventEmitter, Input, OnInit, Output } from '@angular/core';

export abstract class NtsInputBaseComponent implements OnInit {

    @Input() ntsModel;
    @Output() ntsModelChange = new EventEmitter();
    @Output() ntsFocus = new EventEmitter();
    @Output() ntsBlur = new EventEmitter();

    @Input() name: string = '';
    @Input() label: string = '';
    @Input() value: string = '';
    @Input() required = false;
    @Input() debounce = 0;

    debounceTimer;

    ngOnInit() {
        if (!this.ntsModel) {
            this.ntsModel = this.value;
        } else {
            this.value = this.ntsModel;
        }
    }
    onNgModelChange(ev) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(
            _ => this.ntsModelChange.emit(ev), this.debounce || 0
        );
    }
}