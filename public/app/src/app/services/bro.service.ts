import { Injectable } from '@angular/core';
import { Socket } from 'ng-socket-io';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/operator/map'

@Injectable()
export class BroService {
    data = null;
    
    private subject = new Subject<any>();
    
    constructor(private socket: Socket) {
        this.socket.on('update', (data) => {
           if(data != null && this.data != null) {
               var idx = this.data.findIndex(c => c.channel_name == data.channel_name);

               if(idx >= 0) {
                   this.data[idx] = { 
                       ...this.data[idx], 
                       ...data
                   };
               }
               
               this.subject.next(this.data);
           }
        });
    }
    
    pull() {
        this.socket.emit('pull', (data) => {
            this.data = data;
            this.subject.next(this.data);
        });
        
        return this.subject.asObservable();
    }
    
    push(data) {
        this.socket.emit('push', data);
    }
}