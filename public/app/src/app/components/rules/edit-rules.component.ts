import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { BroService } from '../../services/bro.service'; 

declare var $: any;

@Component({
  selector: 'edit-rules',
  templateUrl: './edit-rules.component.html',
  styleUrls: ['./edit-rules.component.css']
})
export class EditRulesComponent implements OnInit {
  @Output() close: EventEmitter<any> = new EventEmitter();
  @Output() onSave: EventEmitter<any> = new EventEmitter();

  
  editMode = false;

  /* DATA FROM SERVER */
  @Input() actuators = [];
  @Input() sensors = [];
  @Input() rule = null;
  
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
  
  setEditMode(value) {
    this.close.emit();
    this.editMode = value;
  }
  
  save(group) {
    if(!group.hasChildren())  {
      alert("NIGGER WHORE YOU GOT NO CHILDREN!!");
      return;
    }
    
    if(this.dragged_actuators.length == 0) { 
      alert("NIGGER WHORE YOU GOT NO ACTUATORS!!");
      return;
    }
    
    var actionList = []
    for(var i = 0; i < this.dragged_actuators.length; i++) {
      var a = this.dragged_actuators[i];
      var v = "";
      if( a.value == "Off" )
        v = "False";
      else if( a.value == "On")
        v = "True";
      else
        v = a.value;
        
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
          name: this.rule.channel_name, 
          action: "edit", 
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
    
    this.onSave.emit();
    this.close.emit();
  }
  
  ngOnInit() {
    for(var i = 0; i < this.rule.actions.length; i++) {
      var actuator = this.actuators.find(c => c.channel_name == this.rule.actions[i].actuator);
      var value = this.rule.actions[i].value;
      
      if( value == "False" ) {
        value = "Off";
      }
      else if( value == "True" ) {
        value = "On";
      }
      
      this.dragged_actuators.push({ actuator: actuator, value: value });
    }
  }
}
