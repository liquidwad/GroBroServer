import { Component } from '@angular/core';
import { BroService } from '../../services/bro.service'; 
import { BaseChartDirective } from '../../ng2-charts/ng2-charts';

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
    @ViewChild('chartA') chartA : BaseChartDirective;
    units = ['Celcius', 'Fahrenheit', 'Kelvin'];
    selected_unit = null;
    channel_name = "temperature";
    settings = null;
    movingPoint = null;
    
    lineChartData:Array<any> = [ {data: [{ x: 0, y: 0.5 }, { x: 24, y: 0.5 }], label: 'WhiteLED'} ];
    lineChartOptions:any = {
        responsive: true,
        cubicInterpolationMode: 'monotone',
        scales: {
            xAxes: [{
                display: true,
                type: 'linear',
                position: 'bottom',
                ticks: {
                    min: 0,
                    max: 24
                }
            }],
            yAxes: [{
                display: true,
                type: 'linear',
                ticks: {
                    min: 0,
                    max: 1
                }
            }]
        },
        events: ['mousedown', 'mouseup', 'mousemove', 'touchstart', 'touchend', 'touchmove', 'mouseout', 'click' ],
        hover: { 
            onHover: (event, active) => { 
                // Mouse button pressed for first time
                if(event.type == "mousedown"){
                    // An existing point was pressed, so select it for moving
                    if(active && active.length){
                        console.log("Moving existing point: ")
                        this.movingPoint = active[0];
                        console.log(this.movingPoint);
                    }
                    // A new spot on the graph was pressed, so add a new point
                    else {
                        console.log("Adding new point");
                        
                        //var element = chartA.getElementAtEvent(event);
                        //console.log("Zob");
                        var chart = this.chartA.chart;
                        /*
                        // Figure out the x and y based on chart size and click location
                        var canvas = event.target;
                        var rect = canvas.getBoundingClientRect();
                        
                        var newPoint = {
                          x: ((event.clientX - rect.left)/canvas.width)*24, // TODO: use the range of the graph instead of 24 (for zoom?)
                          y: 1.0 - ((event.clientY - rect.top)/canvas.height)*1   // TODO: ditto
                        };
                        
                        
                        var newPoint = {
                          x: event.clientX - rect.left,
                          y: event.clientY - rect.top
                        };
                        */
                        
                        //console.log("New point added at (" + newPoint.x + "," + newPoint.y + ")"); 
                    }
                }

            }
            
        }
    };
  
    lineChartLegend:boolean = true;
    lineChartType:string = 'line';
    
    constructor(private broService : BroService) {
        this.broService.pull().subscribe(data => {
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
    
      // events
    chartClicked(e:any):void {
        console.log(e);
        //var series = 0;
        //this.lineChartData[series].data.append({x: 12, y: 1});
        if (e.active.length > 0 ){
            
        }
    }
    
    chartHovered(e:any):void {
        console.log(e);
    }
    
    
    getPoint(event) {
        return null;
        /*
        if( !(event.target && event.target instanceof HTMLCanvasElement))
            return null;
        if( !event.clientX || !event.clientY )
            return null;
        
        var canvas = event.target;
        var rect = canvas.getBoundingClientRect();

        return {
          x: ((event.clientX - rect.left)/canvas.width)*24, // TODO: use the range of the graph instead of 24 (for zoom?)
          y: ((event.clientY - rect.top)/canvas.height)*1   // TODO: ditto
        };
        */
    }
    
}