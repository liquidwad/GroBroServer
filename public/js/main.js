$(function(){
    var socket = io();
    
   var data = { 
        channel_name: 'Ventilator',
        data: {
        override: false,
            'status': 'off'
        }
    };
    
    socket.emit('push', data);
    
    socket.emit('pull');
    
    socket.on('recieve', function(data) {
        console.log("Recieved pull", data);
    });
    
    socket.on('update', function(data) {
        console.log("Recieved update", data);
    })
});