import { Component, OnDestroy, OnInit } from '@angular/core';
import { BroService } from '../../services/bro.service'; 

@Component({
  selector: 'sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.css']
})
export class SensorsComponent implements OnInit, OnDestroy {
  sensors = [];
  
  constructor(private broService : BroService) {
  }
  
  ngOnInit() {
    var subscription = this.broService.pull().subscribe((data) => {
      if(Object.keys(data).length === 0 && data.constructor === Object) {
        return;
      }
        
      this.sensors = data.filter(c => c.channel_type == "sensor");
      
      subscription.unsubscribe();
    });
    
    /*this.update_subscription = this.broService.on_update().subscribe(data => {
       this.sensors = data.filter(c => c.channel_type == "sensor");
    });*/
  }
  
  ngOnDestroy() {
  }
}
