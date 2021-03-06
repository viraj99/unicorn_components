import {
    Directive,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';

declare var Chart: any;

export const CHART_COLORS: Array<number[]> = [
    [72, 176, 247],
    [248, 208, 83],
    [16, 207, 189],
    [245, 87, 83],
    [158, 255, 177],
    [145, 81, 142],
    [151, 187, 205],
    [148, 159, 177],
    [77, 83, 96]
];
/* tslint:disable-next-line */
@Directive({ selector: 'canvas[baseChart]', exportAs: 'base-chart' })
export class UniBaseChartDirective implements OnDestroy, OnChanges, OnInit {

    @Input() public data: number[] | Array<number[]>;
    @Input() public datasets: any[];
    @Input() public labels: Array<any> = [];
    @Input() public options: any = {};
    @Input() public chartType: string;
    @Input() public colors: Array<any>;
    @Input() public legend: boolean;

    @Output() public chartClick: EventEmitter<any> = new EventEmitter();
    @Output() public chartHover: EventEmitter<any> = new EventEmitter();

    public ctx: any;
    public chart: any;
    private cvs: any;
    private initFlag = false;

    private element: ElementRef;

    public constructor(element: ElementRef) {
        this.element = element;
    }

    public ngOnInit(): any {
        this.ctx = this.element.nativeElement.getContext('2d');
        this.cvs = this.element.nativeElement;
        this.initFlag = true;
        if (this.data || this.datasets) {
            this.refresh();
        }
    }

    public ngOnChanges(changes: SimpleChanges): any {
        if (this.initFlag) {
            // Check if the changes are in the data or datasets
            if (
                changes.hasOwnProperty('data')
                || changes.hasOwnProperty('datasets')
                || changes.hasOwnProperty('labels')
            ) {
                this.chart.data.datasets = this.getDatasets();
                this.chart.data.labels = this.labels;
                this.chart.update();
            } else {
                this.refresh();
            }
        }
    }

    public ngOnDestroy(): any {
        if (this.chart) {
            this.chart.destroy();
            this.chart = void 0;
        }
    }

    public getChartBuilder(ctx/*, data:Array<any>, options:any*/) {
        const datasets = this.getDatasets();
        const options = Object.assign({}, this.options);

        if (this.legend === false) {
            options.legend = { display: false };
        }
        // hock for onHover and onClick events
        options.hover = options.hover || {};
        if (!options.hover.onHover) {
            options.hover.onHover = (active: Array<any>) => {
                if (active && !active.length) {
                    return;
                }
                this.chartHover.emit({ active });
            };
        }

        if (!options.onClick) {
            options.onClick = (event, active: Array<any>) => {
                this.chartClick.emit({ event, active });
            };
        }

        const opts = {
            type: this.chartType,
            data: {
                labels: this.labels,
                datasets: datasets
            },
            options: options
        };

        if (typeof Chart === 'undefined') {
            throw new Error('ng2-charts configuration issue: Embedding Chart.js lib is mandatory');
        }

        return new Chart(ctx, opts);
    }

    private getDatasets(): any {
        let datasets: any = void 0;
        // in case if datasets is not provided, but data is present
        if (!this.datasets || !this.datasets.length && (this.data && this.data.length)) {
            if (Array.isArray(this.data[0])) {
                datasets = (this.data as Array<number[]>).map((data: number[], index: number) => {
                    return { data, label: this.labels[index] || `Label ${index}` };
                });
            } else {
                datasets = [{ data: this.data, label: `Label 0` }];
            }
        }

        if (this.datasets && this.datasets.length ||
            (datasets && datasets.length)) {
            datasets = (this.datasets || datasets)
                .map((elm: number, index: number) => {
                    const newElm: any = Object.assign({}, elm);
                    if (this.colors && this.colors.length) {
                        Object.assign(newElm, this.colors[index]);
                    } else {
                        Object.assign(newElm, getColors(this.chartType, index, newElm.data.length));
                    }
                    return newElm;
                });
        }

        if (!datasets) {
            throw new Error(`ng-charts configuration error,
      data or datasets field are required to render char ${this.chartType}`);
        }

        return datasets;
    }

    private refresh(): any {
        // if (this.options && this.options.responsive) {
        //   setTimeout(() => this.refresh(), 50);
        // }

        // todo: remove this line, it is producing flickering
        this.ngOnDestroy();
        this.chart = this.getChartBuilder(this.ctx/*, data, this.options*/);
    }
}

// private helper functions
export interface Color {
    backgroundColor?: string | string[];
    borderWidth?: number | number[];
    borderColor?: string | string[];
    borderCapStyle?: string;
    borderDash?: number[];
    borderDashOffset?: number;
    borderJoinStyle?: string;

    pointBorderColor?: string | string[];
    pointBackgroundColor?: string | string[];
    pointBorderWidth?: number | number[];

    pointRadius?: number | number[];
    pointHoverRadius?: number | number[];
    pointHitRadius?: number | number[];

    pointHoverBackgroundColor?: string | string[];
    pointHoverBorderColor?: string | string[];
    pointHoverBorderWidth?: number | number[];
    pointStyle?: string | string[];

    hoverBackgroundColor?: string | string[];
    hoverBorderColor?: string | string[];
    hoverBorderWidth?: number;
}

// pie | doughnut
export interface Colors extends Color {
    data?: number[];
    label?: string;
}

/**
 * Generate colors for pie|doughnut charts
 * @param count
 * @returns {Colors}
 */
export function generateColors(count: number): Array<number[]> {
    const colorsArr: Array<number[]> = new Array(count);
    for (let i = 0; i < count; i++) {
        colorsArr[i] = CHART_COLORS[i] || getRandomColor();
    }
    return colorsArr;
}

export function arrToRgba(colour: Array<number>, alpha = 1): string {
    return 'rgba(' + colour.concat(alpha).join(',') + ')';
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatLineColor(colors: Array<number>): Color {
    return {
        backgroundColor: arrToRgba(colors, 0.4),
        borderColor: arrToRgba(colors, 1),
        pointBackgroundColor: arrToRgba(colors, 1),
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: arrToRgba(colors, 0.8)
    };
}

function formatBarColor(colors: Array<number>): Color {
    return {
        backgroundColor: arrToRgba(colors, 0.6),
        borderColor: arrToRgba(colors, 1),
        hoverBackgroundColor: arrToRgba(colors, 0.8),
        hoverBorderColor: arrToRgba(colors, 1)
    };
}

function formatPieColors(colors: Array<number[]>): Colors {
    return {
        backgroundColor: colors.map((color: number[]) => arrToRgba(color, 0.6)),
        borderColor: colors.map(() => '#fff'),
        pointBackgroundColor: colors.map((color: number[]) => arrToRgba(color, 1)),
        pointBorderColor: colors.map(() => '#fff'),
        pointHoverBackgroundColor: colors.map((color: number[]) => arrToRgba(color, 1)),
        pointHoverBorderColor: colors.map((color: number[]) => arrToRgba(color, 1))
    };
}

function formatPolarAreaColors(colors: Array<number[]>): Color {
    return {
        backgroundColor: colors.map((color: number[]) => arrToRgba(color, 0.6)),
        borderColor: colors.map((color: number[]) => arrToRgba(color, 1)),
        hoverBackgroundColor: colors.map((color: number[]) => arrToRgba(color, 0.8)),
        hoverBorderColor: colors.map((color: number[]) => arrToRgba(color, 1))
    };
}

function getRandomColor(): number[] {
    return [getRandomInt(0, 255), getRandomInt(0, 255), getRandomInt(0, 255)];
}

/**
 * Generate colors for line|bar charts
 * @param index
 * @returns {number[]|Color}
 */
function generateColor(index: number): number[] {
    return CHART_COLORS[index] || getRandomColor();
}

/**
 * Generate colors by chart type
 * @param chartType
 * @param index
 * @param count
 * @returns {Color}
 */
function getColors(chartType: string, index: number, count: number): Color | number[] {
    if (chartType === 'pie' || chartType === 'doughnut') {
        return formatPieColors(generateColors(count));
    }

    if (chartType === 'polarArea') {
        return formatPolarAreaColors(generateColors(count));
    }

    if (chartType === 'line' || chartType === 'radar') {
        return formatLineColor(generateColor(index));
    }

    if (chartType === 'bar' || chartType === 'horizontalBar') {
        return formatBarColor(generateColor(index));
    }
    return generateColor(index);
}
