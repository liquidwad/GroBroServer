import { Component, OnInit, OnDestroy } from '@angular/core';
import { BroService } from '../../services/bro.service'; 
declare var d3:any;

var width = 720,
    height = 410;

var margin = { top: 30, right: 30, bottom: 30, left: 30 };

@Component({
  selector: 'led-settings',
  templateUrl: './led-settings.component.html',
  styleUrls: ['./led-settings.component.css']
})
export class LedSettingsComponent implements OnInit, OnDestroy {
    svg = null;
    dragged = null;
    selected = null;
    line = null;
    points = [];
    rightBisector = null;
    leftBisector = null;
    channel_name = "led";
    
    constructor(private broService : BroService) {
    }
    
    savePoints() {
        this.broService.push({ 
            channel_name: this.channel_name, 
            settings: {
                "@override": true,
                points: this.points 
            }
        });
    }
    
    
    apply() {
      var path = this.svg.select("path");
      var samples0 = this.sample(100,path);
      this.broService.push({
          channel_name: this.channel_name,
          settings: {
              "@override": true,
              points: this.points
          },
          profiles: {
            ch0: samples0
          }
      });
    }
    
    
    ngOnInit() {
        this.rightBisector = d3.bisector(function(a, b) { return a[0]-b[0]; }).right;
        this.leftBisector = d3.bisector(function(a, b) { return a[0]-b[0]; }).left;
        
        this.line = d3.line().curve(d3.curveMonotoneX);

        this.svg = d3.select(".profile").append("svg")
            .attr("width", width + margin.left)
            .attr("height", height  + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        this.points = [ this.getPoint(0,0.5), this.getPoint(24,0.5)];
        
        this.svg.append("rect")
            .attr("fill", "white")
            .attr("width", width-margin.left)
            .attr("height", height)
            .on("mousedown", 
            () => { this.mousedown() } );
            
        this.svg.append("path")
            .datum(this.points)
            .attr("class", "line")
            .call(() => { 
                this.redraw(); 
            });
    
        /* Time */
        var x = d3.scaleLinear().domain([0, 24]).range([0, (width-margin.left)]);
        
        /* Other */
        var y  = d3.scaleLinear().range([height, 0]);
        // Add the X Axis
        
        this.svg.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(0," + height + ")")
              .call(d3.axisBottom(x));
        
        // Add the Y Axis
        this.svg.append("g")
              .attr("class", "axis")
              .call(d3.axisLeft(y));
        
        d3.select(window)
            .on("mousemove", () => {this.mousemove() })
            .on("mouseup", () => {this.mouseup() })
            .on("keydown", () => {this.keydown() });

        this.svg.node().focus();
        
        this.redraw();
        
        var subscription = this.broService.pull().subscribe(data => {
            if(Object.keys(data).length === 0 && data.constructor === Object) {
                return;
            }
            
            var led_profile = data.filter(c => c.channel_name == this.channel_name);
            
            if(led_profile.length > 0 && typeof led_profile[0].settings !== 'undefined') {
                this.points = led_profile[0].settings.points;
                
                this.svg.select("path")
                    .datum(this.points).call(() => { this.redraw() });
                this.redraw();
            }
            
            subscription.unsubscribe();
        });
    }
    
    ngOnDestroy() {
        
    }
    
    redraw() {
      this.svg.select("path").attr("d", this.line);
    
      var circle = this.svg.selectAll("circle")
          .data(this.points, function(d) { return d; });
    
      circle.enter().append("circle")
          .attr("r", 1e-6)
          .on("mousedown", (d) => { this.selected = this.dragged = d; this.redraw(); })
        .transition()
          .duration(750)
          //.ease(d3.easeElastic)
          .attr("r", 6.5);
    
      circle
          .classed("selected", (d) => { return d === this.selected; })
          .attr("cx", function(d) { return d[0]; })
          .attr("cy", function(d) { return d[1]; });
    
      circle.exit().remove();
    
      if (d3.event) {
        d3.event.preventDefault();
        d3.event.stopPropagation();
      }
    }
    
    mousedown() {
      this.selected = this.dragged = d3.mouse(this.svg.node());
      var insertionPoint = this.rightBisector(this.points, this.selected);
      this.points.splice(insertionPoint, 0, this.selected);
      this.redraw();
      this.savePoints();
    }
      
    // Get canvas coord given a time t and led value v
    getPoint(x, y){
      return [(x/24.0)*(width-margin.left), y*height];
    }
    
    
    // Generate n equally spaced points from the path
    sample(n, path) {
        var l = path.node().getTotalLength();
        var samples = []; //TODO: pre-allocate since we already know size (efficiency)
        for( var i = 0.0; i<n; i+=1.0) {
            var p = path.node().getPointAtLength((i/n) * l);
            samples.push(+(1.0 - (p.y)/height).toFixed(2));
        }
        
        return samples;
    }
    
    mousemove() {
      if (!this.dragged) return;
      var m = d3.mouse(this.svg.node());
      
      this.dragged[0] = Math.max(0, Math.min(width-margin.left, m[0]));
      this.dragged[1] = Math.max(0, Math.min(height, m[1]));
      var selectedIndex = this.points.indexOf(this.selected);
      var rightIndex = this.rightBisector(this.points, this.dragged)-1;
      var leftIndex = this.leftBisector(this.points, this.dragged);
      
      var lastIndex = this.points.length - 1;
      if(selectedIndex != 0 && selectedIndex != lastIndex){
          if( rightIndex != selectedIndex ){
            this.points.splice(selectedIndex, 1);
            this.points.splice(rightIndex, 0, this.dragged);
            this.selected = this.dragged;
          }
          else if( leftIndex !=selectedIndex){
            this.points.splice(selectedIndex, 1);
            this.points.splice(leftIndex, 0, this.dragged);
            this.selected = this.dragged;
          }
      }
        
        selectedIndex = this.points.indexOf(this.selected);
        lastIndex = this.points.length - 1;
        if( selectedIndex == 0 ) {
          this.selected[0] = this.dragged[0] = this.getPoint(0, 0)[0]
          this.points[lastIndex][1] = this.selected[1];
        }else if(selectedIndex == lastIndex) {
          this.selected[0] = this.dragged[0] = this.getPoint(24, 0)[0];
          this.points[0][1] = this.selected[1];
        }
        this.redraw();
        this.savePoints();
    }
    
    mouseup() {
      if (!this.dragged) return;
      this.mousemove();
      this.dragged = null;
    }
    
    keydown() {
        if (!this.selected) return;
          switch (d3.event.keyCode) {
            case 8: // backspace
            case 46: { // delete
              var i = this.points.indexOf(this.selected);
              this.points.splice(i, 1);
              this.selected = this.points.length ? this.points[i > 0 ? i - 1 : 0] : null;
              this.redraw();
              this.savePoints();
              break;
            }
         }
    }
    
    resetPoints() {
        console.log("Henek");
        this.points = [ this.getPoint(0,0.5), this.getPoint(24,0.5)];
        this.svg.select("path").datum(this.points);
        this.redraw();
        this.savePoints();
    }
    
    saveProfiles() {
    }
}