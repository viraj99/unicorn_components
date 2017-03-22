import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'sort'
})
export class NtsSortPipe implements PipeTransform {

    transform(input: any, config: Array<string> | string = '+'): any {
        if (!Array.isArray(input)) { return input; }
        if (!config || config === '+') { return [...input.sort()]; }
        if (config === '-') { return [...input.sort().reverse()]; }

        if (Array.isArray(config) && config.length > 1) {
            const sortedInput = input.sort((a, b) => {
                for (const rawProp of config) {
                    const desc = this.isDesc(rawProp);
                    const prop = this.cleanProp(rawProp);
                    const comparison = this.compare(a[prop], b[prop], desc);

                    if (comparison !== 0) { return comparison; }
                }
                return 0;
            });
            return [...sortedInput];
        }
        const rawProp = !Array.isArray(config) ? config : config[0];
        const desc = this.isDesc(rawProp);
        const prop: string = this.cleanProp(rawProp);
        const sortedInput = input.sort((a, b) => {
            return this.compare(a[prop], b[prop], desc);
        });
        return [...sortedInput];
    }
    private cleanProp(key: string) {
        return key.startsWith('+') || key.startsWith('-') ? key.substr(1) : key;
    }
    private isDesc(key: string) {
        return key.substr(0, 1) === '-';
    }
    private compare(a, b, desc = false): number {
        if ((isNaN(parseFloat(a)) || !isFinite(a)) || (isNaN(parseFloat(b)) || !isFinite(b))) {
            if (a.toLowerCase() < b.toLowerCase()) { return desc ? -1 : 1; }
            if (a.toLowerCase() > b.toLowerCase()) { return desc ? 1 : -1; }
        } else {
            if (parseFloat(a) < parseFloat(b)) { return desc ? -1 : 1; }
            if (parseFloat(a) > parseFloat(b)) { return desc ? 1 : -1; }
        }
        return 0;
    }
}