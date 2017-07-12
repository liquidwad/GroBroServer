import { Component } from '@angular/core';
import { BroService } from '../../services/bro.service'; 

@Component({
  selector: 'temp-settings',
  templateUrl: './temp-settings.component.html',
  styleUrls: ['./temp-settings.component.css']
})
export class TempSettingsComponent {
    min = null
    max = null
    desired = null
    
    units = ['Celcius', 'Fahrenheit', 'Kelvin'];
    selected_unit = null;
    channel_name = "temperature_settings";
    settings = null;
    
    constructor(private broService : BroService) {
        this.broService.pull().subscribe(data => {
            if(Object.keys(data).length === 0 && data.constructor === Object) {
                return;
            }
            
            var settings = data.filter(c => c.channel_name == this.channel_name);
            
            if(settings.length > 0) {
                this.settings = settings[0];
                this.selected_unit = this.units[this.units.indexOf(this.settings.unit)];
                this.max = this.settings.max;
                this.min = this.settings.min;
                this.desired = this.settings.desired;
                
                console.log(settings);
            } else {
                this.selected_unit = this.units[0];
                this.min = 20;
                this.desired = 30;
                this.max = 30;
                
                this.broService.push({
                   channel_name: this.channel_name,
                   unit: this.selected_unit,
                   min: this.min,
                   desired: this.desired,
                   max: this.max
                });
            }
        });
    }
    
    changeUnit(unit) {
        this.selected_unit = this.units[this.units.indexOf(unit)];
        
        this.broService.push({ channel_name: this.channel_name, unit: this.selected_unit });
    }
    
    changeValues() {
        this.broService.push({
            channel_name: this.channel_name,
            min: this.min,
            desired: this.desired,
            max: this.max
        });
    }
}
