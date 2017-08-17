import { Component, OnDestroy, OnInit } from '@angular/core';
import { BroService } from './services/bro.service'; 

const SENSORS = ['temperature', 'humidity', 'UV', 'IR', 'lumens'];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  
  update_subscription = null;
  
  constructor(private broService : BroService) {

  }
  
  ngOnInit() {
    var subscription = this.broService.pull().subscribe(data => {
      if(Object.keys(data).length === 0 && data.constructor === Object) {
        return;
      }
      
      var sensors = data.filter(c => c.channel_type == "sensor");
      subscription.unsubscribe()
    });
    
    
    this.update_subscription = this.broService.on_update().subscribe(data => {
      var f = data.find(c => c.channel_type === "sensor");
    })
  }
  
  ngOnDestroy() {
    console.log("destroy"); 
    
    if(this.update_subscription != null) {
      this.update_subscription.unsubscribe();
    }
  }
}