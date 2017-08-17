import { Component } from '@angular/core';
import { BroService } from '../../services/bro.service'; 

@Component({
  selector: 'relays',
  templateUrl: './relays.component.html',
  styleUrls: ['./relays.component.css']
})
export class RelaysComponent {
  relays = [];
  lcds = [];
  
  constructor(private broService : BroService) {
    var subscription = this.broService.pull().subscribe(data => {
      if(Object.keys(data).length === 0 && data.constructor === Object) {
        return;
      }
      
      this.relays = data.filter(c => c.channel_subtype == "relay");
      this.lcds = data.filter(c => c.channel_subtype == "lcd");
      
      subscription.unsubscribe();
    });
  }
}
