import { Component, OnInit, OnDestroy } from '@angular/core';
import { BroService } from '../../services/bro.service'; 
import { Modal } from 'angular2-modal/plugins/bootstrap';

@Component({
  selector: 'rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css']
})
export class RulesComponent implements OnInit, OnDestroy {
  /* DATA FROM SERVER */
  rules = [];
  actuators = [];
  sensors = [];
  
  edit_rule = "";
  update_subscription = null;
  
  constructor(private broService : BroService, public modal: Modal) {
    var subscription = this.broService.pull().subscribe((data) => {
      if(Object.keys(data).length === 0 && data.constructor === Object) {
        return;
      }
      
      this.sensors = data.filter(c => c.channel_type == "sensor");
      this.actuators = data.filter(c => c.channel_type == "actuator");
      this.rules = data.filter(c => c.channel_type == "rule");
      
      subscription.unsubscribe();
    });
    
    this.update_subscription = this.broService.on_update().subscribe(data => {
      var rules = data.filter(c => c.channel_type == "rule");
      
      for(var i = 0; i < rules.length; i++) {
        if(typeof rules[i].delete !== 'undefined') {
          rules.splice(i, 1);
        }  
      }
      
      this.rules = rules;
      this.sensors = data.filter(c => c.channel_type == "sensor");
      this.actuators = data.filter(c => c.channel_type == "actuator");
    });
  }
  
  setEdit(name) {
    if(this.edit_rule == name) {
      this.edit_rule = "";
    } else {
      this.edit_rule = name;
    }
  }
  
  clearEdit() {
    this.edit_rule = "";
  }
  
  delete(rule) {
    var f = this.modal.confirm()
      .size('lg')
      .isBlocking(true)
      .showClose(true)
      .keyboard(27)
      .title('Delete rule?')
      .body('Are you sure you want to remove this rule?')
      .okBtn('Remove')
      .cancelBtn('Cancel')
      .open()
      .then((dialog: any) => {
        dialog.result.then(result => {
          if(result) {
            var data = { 
              channel_name: "rules", 
              channel_type: "rules_manager",
              rules: [ 
                {
                  name: rule.channel_name, 
                  action: "delete"
                }]
            };

            this.broService.push(data);
          }
        }).catch(() => {})
      });
  }
  
  ngOnInit() {
    
  }
  
  ngOnDestroy() {
    if(this.update_subscription != null) {
      this.update_subscription.unsubscribe();
    }
  }
  
  save() {
    var subscription = this.broService.pull().subscribe((data) => {
      if(Object.keys(data).length === 0 && data.constructor === Object) {
        return;
      }
      
      this.sensors = data.filter(c => c.channel_type == "sensor");
      this.actuators = data.filter(c => c.channel_type == "actuator");
      this.rules = data.filter(c => c.channel_type == "rule");
      
      subscription.unsubscribe();
    });
  }
}