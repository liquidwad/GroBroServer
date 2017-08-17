import { Component, Input, OnChanges, SimpleChange, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { BroService } from '../../services/bro.service'; 

declare var JustGage: any;

@Component({
  selector: 'sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.css']
})
export class SensorComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {
  @Input() sensor: any = null;
  gauge = null;
  update_subscription = null;
  
  constructor(private broService : BroService) {
  }
  
  convertToSettings() {
    if(this.sensor.channel_name == 'temperature') {
      if(this.sensor.settings.unit == 'Celcius') {
        //DO NOTHING
      }
      
      if(this.sensor.settings.unit == 'Fahrenheit') {
        this.sensor.data.status = this.sensor.data.status * 9/5 + 32;
        this.sensor.range.min = this.sensor.range.min * 9/5 + 32;
        this.sensor.range.max = this.sensor.range.max * 9/5 + 32;
      }
      
      if(this.sensor.settings.unit == 'Kelvin') {
        this.sensor.data.status = (this.sensor.data.status + 273.15);
        this.sensor.range.min = this.sensor.range.min + 273.15;
        this.sensor.range.max = this.sensor.range.max + 273.15;
      }
      
      //console.log(this.sensor.data.status);
    }
  }
  
  initGauge() {
    if(this.sensor.available) {
      
      this.convertToSettings();
      
      this.gauge = new JustGage({
        id: this.sensor.channel_name,
        value: this.sensor.data.status,
        min: this.sensor.range.min,
        max: this.sensor.range.max,
        title: this.sensor.channel_name,
        levelColorsGradient: true
      });
    }
  }
  
  ngAfterViewInit() {
    this.update_subscription = this.broService.on_update().subscribe(data => {
      var notAvailable = !this.sensor.available;
      
      var sensor = data.find(c => c.channel_name == this.sensor.channel_name);
      
      if(this.sensor == sensor) {
        return;
      }
      
      this.sensor = sensor;

      setTimeout(() => {
        if(notAvailable && this.sensor.available) {
           this.initGauge();
         } else {
           if(!this.gauge) {
             this.initGauge()
           } else {
            this.convertToSettings();
            this.gauge.refresh(this.sensor.data.status);
           }
         }
      }, 2000);
    });
    
    this.initGauge();
  }
  
  ngOnInit() {
  }
  
  ngOnDestroy() {
    if(this.update_subscription != null) {
      this.update_subscription.unsubscribe();
    }
  }
  
  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
  }
}
