import { Component, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { BroService } from '../../services/bro.service'; 

@Component({
  selector: 'group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent {
    
    @Input() 
    removeable = false;
    
    conditions = [
        'Less than', 
        'Less than or equal to', 
        'Not equal to',
        'Equals',
        'Greater than',
        'Greater than or equal to'
    ];
    
    operations = ['AND', 'OR'];
    
    data = { op: 'AND', conditions: [] };
    
    @Output() remove: EventEmitter<any> = new EventEmitter();
    
    @Input()
    get _data() {
        return this.data;
    }
    
    set _data(value) {
        this.data = value;
    }
    
    constructor() {
        
    }
    
    addGroup() {
        this.data.conditions.push({ op: 'AND', conditions: [] });
    }
    
    addSensor($event) {
        this.data.conditions.push({ sensor: $event.dragData.channel_name, value: 0, op: 'Equals' });    
    }
    
    removeCondition(condition) {
        var index = this.data.conditions.indexOf(condition);
        if (index > -1) {
            this.data.conditions.splice(index, 1);
        }
    }
    
    getData() {
        return this.data
    }
    
    reset() {
        this.data = { op: 'AND', conditions: [] };
    }
    
    hasChildren() {
        return (this.data.conditions.length > 0);
    }
}
