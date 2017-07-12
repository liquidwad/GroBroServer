import { Component } from '@angular/core';
import { BroService } from '../../services/bro.service'; 

@Component({
  selector: 'sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.css']
})
export class SensorsComponent {
  sensors = [];
    
  constructor(private broService : BroService) {
    this.broService.pull().subscribe(data => {
      if(Object.keys(data).length === 0 && data.constructor === Object) {
        return;
      }
          
      this.sensors = data.filter(c => c.channel_type == "sensor");
    });
  }
}
