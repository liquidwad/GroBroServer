import { Component, OnInit, OnDestroy } from '@angular/core';
import { BroService } from '../../services/bro.service'; 

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {
    
    /* Temperature */
    units = ['Celcius', 'Fahrenheit', 'Kelvin'];
    selected_unit = null;
    channel_name = "temperature";
    settings = null;

    constructor(private broService : BroService) {
        var subscription = this.broService.pull().subscribe(data => {
            if(Object.keys(data).length === 0 && data.constructor === Object) {
                return;
            }
            
            var temperature = data.filter(c => c.channel_name == this.channel_name);
            
            if(temperature.length > 0 && typeof temperature[0].settings !== 'undefined') {
                this.settings = temperature[0].settings;
                this.selected_unit = this.units[this.units.indexOf(this.settings.unit)];
            } else {
                this.selected_unit = this.units[0];
                
                this.broService.push({
                   channel_name: this.channel_name,
                   settings: {
                       unit: this.selected_unit,
                   }
                });
            }
            
            subscription.unsubscribe();
        });
    }
    
    changeUnit(unit) {
        this.selected_unit = this.units[this.units.indexOf(unit)];
        
        this.broService.push({ 
            channel_name: this.channel_name, 
            settings: {
                unit: this.selected_unit 
            }
        });
    }
    
    ngOnInit() {

    }
    
    ngOnDestroy() {

    }
}