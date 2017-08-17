import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'conditionfilter',
    pure: false
})
export class ConditionFilter implements PipeTransform {
    transform(items: any[], filter: Object): any {
        if (!items || !filter) {
            return items;
        }
        
        if(filter == 'sensors') {
            return items.filter(item => typeof item.conditions === 'undefined');
        } else if(filter == 'groups') {
            return items.filter(item => typeof item.conditions !== 'undefined');
        }
    }
}