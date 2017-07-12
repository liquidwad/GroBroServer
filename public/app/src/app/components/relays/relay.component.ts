import { Component, Input, OnChanges, SimpleChange } from '@angular/core';

import { BroService } from '../../services/bro.service'; 
import { Relay } from '../../models/relay.model';

@Component({
  selector: 'relay',
  templateUrl: './relay.component.html',
  styleUrls: ['./relay.component.css']
})
export class RelayComponent implements OnChanges {
  @Input() relay = null;
  @Input() lcds = null;
  
  lcd = null;
  text = null;
  mapping = null;
  prevent = false;
  timer = 0;
  delay = 200;
  
  isEdit = false;
  off_img = "img/relay-off.svg";
  on_img = "img/relay-on.svg";
  auto_img = "img/relay-auto.svg";
  
  img = this.auto_img;
  
  constructor(private broService : BroService) {
    
  }
  
  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    
    if( typeof changes.relay !== 'undefined' ) {
      if(typeof changes.relay.currentValue.data.override !== 'undefined' && changes.relay.currentValue.data.override == true) {
        if(changes.relay.currentValue.data.status) {
          this.img = this.on_img;
        } else {
          this.img = this.off_img;
        }
      }
    }
    
    /* GET RELAY TO LED POSITION */
    this.mapping = Relay.mapping[this.relay.channel_name];
    
    this.lcd = this.lcds[this.mapping.lcd];
    this.text = this.lcd.data[this.mapping.pos];
  }
  
  auto($event) {
    clearTimeout(this.timer);
    this.prevent = true;
    this.relay.data.override = false;
    this.broService.push(this.relay);
     this.img = this.auto_img;
    $event.preventDefault();
  }
  
  toggle($event) {
    this.timer = setTimeout(() => {
      if(!this.prevent) {
        if(this.relay.data.status) {
          this.relay.data.status = false;
          this.img = this.off_img;
        } else {
          this.relay.data.status = true;
          this.img = this.on_img;
        }
        
        this.relay.data.override = true;
        
        this.broService.push(this.relay);
      }
      
      this.prevent = false;
    }, this.delay);
  }
  
  edit($event) {
    this.isEdit = true;
  }
  
  save($event) {
    this.isEdit = false;
    
    this.lcd.data[this.mapping.pos] = this.text;
    
    this.broService.push(this.lcd);
  }
}
