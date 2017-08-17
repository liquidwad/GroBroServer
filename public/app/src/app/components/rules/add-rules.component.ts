import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BroService } from '../../services/bro.service'; 

declare var $: any;

@Component({
  selector: 'add-rules',
  templateUrl: './add-rules.component.html',
  styleUrls: ['./add-rules.component.css']
})
export class AddRulesComponent {

  @Output() onSave: EventEmitter<any> = new EventEmitter();
  
  addMode = false;
  name = "";
  
  /* DATA FROM SERVER */
  @Input() rules = [];
  @Input() actuators = [];
  @Input() sensors = [];
  
  /* FROM WEB */
  dragged_actuators = [];
  
  constructor(private broService : BroService) {
      $(window).scroll(function(){
        var marginTop = $(window).scrollTop();
        var limit = $(".group:first-child").height() - $(".sensors").height();
        if(marginTop < limit )
            $(".sensors").css("margin-top" ,marginTop);
      });
  }
  
  addActuator($event) {
    this.dragged_actuators.push({ actuator: $event.dragData, value: "" });
  }
  
  removeActuator(actuator) {
    var index = this.dragged_actuators.indexOf(actuator);
    if (index > -1) {
      this.dragged_actuators.splice(index, 1);
    }
  }
  
  setAddMode(value) {
    this.addMode = value;
    if(!value) { this.dragged_actuators = [] };
  }
  
  save(group) {
    if(!group.hasChildren() || this.dragged_actuators.length == 0 || this.name.length == 0)  {
      return;
    }
    
    var actionList = []
    
    for(var i = 0; i < this.dragged_actuators.length; i++) {
      var a = this.dragged_actuators[i];
      var v = "";
      
      if( a.value == "Off" ) {
        v = "False";
      }
      else if( a.value == "On") {
        v = "True";
      }
      else {
        v = a.value;
      }
      
      actionList.push( {
        actuator: a.actuator.channel_name,
        value: v
      });
    }
    
    var data = { 
      channel_name: "rules", 
      channel_type: "rule_manager",
      rules: [ 
        {
          name: this.name, 
          action: "add", 
          rule: { 
            condition: group.getData(), 
            actions: actionList
          }
        }]
    };

    this.broService.push(data);
    
    for( var i=0; i< data.rules.length; i++) {
      var r = data.rules[i]
      var chan = {
        channel_name: r.name,
        channel_type: "rule",
        condition: r.rule.condition,
        actions: r.rule.actions
      }
      
      this.broService.push(chan)
    }
    
    this.setAddMode(false);
    
    //reset maingroup
    group.reset();
    
    this.onSave.emit();
  }
}
