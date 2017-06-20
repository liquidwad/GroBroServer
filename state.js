var CachemanMongo = require('cacheman-mongo');
var cache = new CachemanMongo();

module.exports = function(app, sessionMiddleware, ormMiddleware) {
    var io = require('socket.io')(app);
    
    io.use(function(socket, next) {
        sessionMiddleware(socket.request, socket.request.res, next);
    });
    
    io.use(function(socket, next) {
        ormMiddleware(socket.request, socket.request.res, next);
    });
    
    //socket.request.session
    var clients = {}
    
    io.on('connection', function(socket) {
        
        /* Register web users */
        if(socket.request.session.user) {
            socket.request.models.Key.find({ id: socket.request.session.user.key_id }, function(err, keys) {
               if(err || keys.length == 0) {
                   console.log("Error happened while retrieving key.");
                   return;
               }
               
               clients[socket.id] = {
                   socket: socket,
                   key: keys[0].hash_key
               }
               
               console.log(socket.id, "web has registed on", keys[0].hash_key);
            });
        } else {
            clients[socket.id] = { socket: socket };
        }
        
        /* When socket hasn't been detected as webclient */
        socket.on('register_device', function(data) {
            if(typeof data !== 'undefined' || 'key' in data) {
                clients[socket.id] = { 
                    socket: socket, 
                    isDevice: true, 
                    key: data.key 
                };
            
                console.log(socket.id, "device has registered on", data.key);
            }
        });
        
        socket.on('push', function(data) {
            /*{ 
                'device_key': 'RASPBERRYPIDEVICEKEY',
                'channel_name': 'Ventilator',
                'data': {
                    'override': false,
                    'status': 'off'
                }
            }*/
            
            //Recieve Data from GroBro -> save in cache + update webapp
            //Recieve Data from Webapp -> save in cache + update grobro
            //Save to cache
            //If it's raspberry pi, send to webusers
            //If it's a webuser, send to other webusers and raspberry pi
        });
        
        socket.on('disconnect', function() {
            delete clients[socket.id];
        });
    });
    
    io.listen(2000);
    
    console.log("SocketIO Started");
};