import { Component, OnInit, OnDestroy } from '@angular/core';
import { BroService } from '../../services/bro.service'; 
declare var d3:any;
import d3TipFactory from 'd3-tip';
const d3Tip = d3TipFactory(d3);

//http://bl.ocks.org/Matthew-Weber/5645518
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
    tooltip = null;
    lines = [];
    points = [];
    paths = [];
    rightBisector = null;
    leftBisector = null;
    channel_name = "led";
    num_chans = 4;
    chan_names = ['ch0', 'ch1', 'ch2', 'ch3' ];
    chan_colors = ["red", "green", "blue", "black"];
    selection = 2;
    copy_chan = 0;
    toggle_mode = null;
    
    constructor(private broService : BroService) {
    }
    
    secondsToHms(d) {
        d = Number(d);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);
        var status = "am";
        
        if(h >= 12) {
          status = "pm";
          h = h - 12;
        }
        
        var hours = h.toString();
        var minutes = m.toString();
        
        if(hours.length == 1) {
          hours = '0' + hours;
          
          if(hours == '00') {
            hours = '12';
          }
        }
        
        if( minutes.length == 1) {
          minutes = '0' + minutes;
        }
        
        return hours + ":" + minutes + " " + status;
    }
    ngOnInit() {
        this.rightBisector = d3.bisector(function(a, b) { return a[0]-b[0]; }).right;
        this.leftBisector = d3.bisector(function(a, b) { return a[0]-b[0]; }).left;
              
        // Set the width, height, and transform of the draw area SVG
        this.svg = d3.select(".profile").append("svg")
            .attr("width", width + margin.left)
            .attr("height", height  + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
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
              /*
        function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    focus.attr("transform", "translate(" + x(d.date) + "," + y(d.close) + ")");
    focus.select("text").text(formatCurrency(d.close));
  }
  */
        const dad = this;
        
        // Set the clickable graph area
        var rect = this.svg.append("rect")
            .attr("fill", "white")
            .attr("width", width-margin.left)
            .attr("height", height)
            .on("mousedown", 
            () => { this.mousedown() } )
            .on('mousemove', function(d) {
              dad.tooltip.show(d, this);
            });
            
        this.tooltip = d3Tip
            .attr('class', 'd3-tip')
            .offset([-10, 50])
            .html(function(d) {
              var x0 = x.invert(d3.mouse(d3.event.currentTarget)[0]);
              
              if(x0 < 0 || x0 > 24) {
                //Nothing to display bruh out of bound
                return "";
              }
              
              var y0 = y.invert(d3.mouse(d3.event.currentTarget)[1]);
              
              var kehb = ((x0 * 60) * 60);

              var brightness = "<strong>Brightness:</strong> <span style='color:red'>" + y0.toPrecision(2) +  "</span>";
              var time = "<strong>Time:</strong> <span style='color:red'>" + dad.secondsToHms(kehb) + "</span>";
              return brightness + "  " + time;
            });
            
        this.svg.call(this.tooltip);
        
        // Add a path and corresponding legend entry for each LED channel to the graph
        for( var i = 0; i < this.num_chans; i++) {
            this.lines.push(d3.line().curve(d3.curveMonotoneX));
            this.points.push([ this.getPoint(0,0.5), this.getPoint(24,0.5)]);
            
            // add path
            this.paths.push(this.svg.append("path")
              .datum(this.points[i])
              .attr("id", this.chan_names[i])
              .attr("stroke", this.chan_colors[i])
              .attr("fill","none")
              .attr("stroke-width", "2")
              .attr("shape-rendering","auto")
              .call(() => { 
                  this.redraw(); 
              }));
            
            const spot = i;
    
            // add legend entry
            this.svg.append("text")
            	.attr("x", i*40 + 20)             
            	.attr("y", 0)    
            	.attr("id", 'legend' + i)
            	.attr("class", "legend")
            	.style("fill", dad.chan_colors[spot])         
            	.on("click", function(){
            	  console.log("ch" + spot + " selected");
            	  
            	  if(dad.toggle_mode == spot) {
            	    for( var j = 0; j < dad.num_chans; j++)
            	  	{
            	  	  d3.select('#' + dad.chan_names[j]).style("opacity", 1.0);
              		  d3.select('#legend' + j).style("opacity", 1.0);
            	  	}
            	  	
            	  	dad.toggle_mode = null;
            	  	
            	  	dad.redraw();
                  dad.redraw();
            	  	return;
            	  }
            	  
            		d3.select('#' + dad.chan_names[spot]).style("opacity", 1.0);
            		d3.select('#legend' + spot).style("opacity", 1.0);
            		dad.selection = spot;
            		dad.toggle_mode = spot;
            		for( var j = 0; j < dad.num_chans; j++)
            		{
            		  if( j != spot )
                  {
              		  d3.select('#' + dad.chan_names[j]).style("opacity", 0.2);
              		  d3.select('#legend' + j).style("opacity", 0.2);
                  }
            		}
            		
                dad.redraw();
                dad.redraw();
            	})
            	.text(this.chan_names[i]);
        }
        
        d3.select(window)
            .on("mousemove", () => {this.mousemove()})
            .on("mouseup", () => {this.mouseup() })
            .on("keydown", () => {this.keydown() });

        this.svg.node().focus();
        this.redraw();
        
        var subscription = this.broService.pull().subscribe(data => {
            if(Object.keys(data).length === 0 && data.constructor === Object) {
                return;
            }
            
            // TODO: change filter to select by channel_type instead
            var led_profile = data.filter(c => c.channel_name == this.channel_name);
            
            if(led_profile.length > 0 && typeof led_profile[0].settings !== 'undefined') {
                this.points = led_profile[0].settings.points;
                
                for( var i = 0; i< this.paths.length; i++) {
                  this.paths[i].datum(this.points[i]).call(() => { this.redraw() });
                }
                
                this.redraw();
            }
            
            subscription.unsubscribe();
        });
    }
    
    ngOnDestroy() {
        
    }
    
    redraw() {
      for( var i = 0; i < this.paths.length; i++) {
        console.log("Redrawing " + i);
        //this.svg.select("path").attr("d", this.lines[i]);
        this.paths[i].attr("d", this.lines[i]);
      }
      
      if( this.selection < this.points.length)
      {
        var circle = this.svg.selectAll("circle")
            .data(this.points[this.selection], function(d) { return d; });
            
        circle.enter().append("circle")
          .attr("r", 1e-6)
          .on("mousedown", (d) => { 
              this.selected = this.dragged = d; 
              this.redraw(); 
          })
          .transition()
          .duration(750)
          //.ease(d3.easeElastic)
          .attr("r", 6.5);
          
        circle
          .classed("selected", (d) => { return d === this.selected; })
          .attr("cx", function(d) { return d[0]; })
          .attr("cy", function(d) { return d[1]; });
    
        circle.exit().remove();
      }
      
      if (d3.event) {
        d3.event.preventDefault();
        d3.event.stopPropagation();
      }
    }
    
    mousedown() {
      this.selected = this.dragged = d3.mouse(this.svg.node());
      var insertionPoint = this.rightBisector(this.points[this.selection], this.selected);
      this.points[this.selection].splice(insertionPoint, 0, this.selected);
      this.redraw();
      this.savePoints();
    }
    
    mousemove() {
      if (!this.dragged) return;
      var m = d3.mouse(this.svg.node());
      
      this.dragged[0] = Math.max(0, Math.min(width-margin.left, m[0]));
      this.dragged[1] = Math.max(0, Math.min(height, m[1]));
      var selectedIndex = this.points[this.selection].indexOf(this.selected);
      var rightIndex = this.rightBisector(this.points[this.selection], this.dragged)-1;
      var leftIndex = this.leftBisector(this.points[this.selection], this.dragged);
      
      var lastIndex = this.points[this.selection].length - 1;
      if(selectedIndex != 0 && selectedIndex != lastIndex){
          if( rightIndex != selectedIndex ){
            this.points[this.selection].splice(selectedIndex, 1);
            this.points[this.selection].splice(rightIndex, 0, this.dragged);
            this.selected = this.dragged;
          }
          else if( leftIndex !=selectedIndex){
            this.points[this.selection].splice(selectedIndex, 1);
            this.points[this.selection].splice(leftIndex, 0, this.dragged);
            this.selected = this.dragged;
          }
      }
        
        selectedIndex = this.points[this.selection].indexOf(this.selected);
        lastIndex = this.points[this.selection].length - 1;
        if( selectedIndex == 0 ) {
          this.selected[0] = this.dragged[0] = this.getPoint(0, 0)[0]
          this.points[this.selection][lastIndex][1] = this.selected[1];
        }else if(selectedIndex == lastIndex) {
          this.selected[0] = this.dragged[0] = this.getPoint(24, 0)[0];
          this.points[this.selection][0][1] = this.selected[1];
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
              var i = this.points[this.selection].indexOf(this.selected);
              this.points[this.selection].splice(i, 1);
              this.selected = this.points[this.selection].length ? this.points[this.selection][i > 0 ? i - 1 : 0] : null;
              this.redraw();
              this.savePoints();
              break;
            }
         }
    }
    
    resetAll() {
        for(var i = 0; i < this.num_chans; i++)
        {
          this.points[i] = [ this.getPoint(0,0.5), this.getPoint(24,0.5)];
          //this.svg.select("path").datum(this.points[i]);
          this.paths[i].datum(this.points[i]);
        }
        this.redraw();
        this.savePoints();
    }
    
    reset() {
        this.points[this.selection] = [ this.getPoint(0,0.5), this.getPoint(24,0.5)];
        this.paths[this.selection].datum(this.points[this.selection]);
        this.redraw();
        this.savePoints();
    }
    
    saveProfiles() {
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
    
    selectChan(ch) {
      this.selection = this.chan_names.indexOf(ch);
      this.redraw();
    }
    
    selectChanToCopy(ch) {
      this.copy_chan = this.chan_names.indexOf(ch);
    }
    
    duplicate() {
      this.points[this.selection] = this.points[this.copy_chan];
      this.paths[this.selection].datum(this.points[this.selection]);
      this.redraw();
      this.savePoints();
    }
    
    save() {
      var samples0 = this.sample(100,this.paths[0]);
      var samples1 = this.sample(100,this.paths[1]);
      var samples2 = this.sample(100,this.paths[2]);
      var samples3 = this.sample(100,this.paths[3]);
      
      console.log(samples0);
      console.log(samples1);
      console.log(samples2);
      console.log(samples3);
      
      this.broService.push({
          channel_name: this.channel_name,
          settings: {
              "@override": true,
              points: this.points
          },
          profiles: {
            ch0: samples0,
            ch1: samples1,
            ch2: samples2,
            ch3: samples3
          }
      });
    }
}