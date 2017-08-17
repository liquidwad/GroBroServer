var query = require('array-query');
var _ = require('lodash');
var json_merger = require('json_merger');

module.exports = function(app, server, sessionMiddleware, ormMiddleware) {
    var io = require('socket.io')(server);

    var cache = app.cache;
    
    io.use(function(socket, next) {
        sessionMiddleware(socket.request, socket.request.res, next);
    });

    io.use(function(socket, next) {
        ormMiddleware(socket.request, socket.request.res, next);
    });

    //socket.request.session
    var clients = {};

    io.on('connection', function(socket) {
        
        var push = function(data) {

            var client = clients[socket.id];
            
            if(typeof client.key === 'undefined') {
                return;
            }

            var value = cache.getSync(client.key);

            /* Cache new GroBro */
            if (!value) {
                var grobro = [];
                grobro.push(data);
                cache.putSync(client.key, grobro);
                console.log("client", client.key, "has been added to cache");
            }
            else if (value) {
                /* Update existing cache */
                
                /* Find and replace channel */
                var channels = query('channel_name').is(data.channel_name).on(value);
                
                if(channels.length > 0) {
                    var index = value.indexOf(channels[0]);
                
                    if(index != -1) {
                        console.log("New update", data);
                        value[index] = json_merger.merge(channels[0], data);
                        console.log("Merged", value[index]);
                        
                        if(typeof data.delete !== 'undefined') {
                            value.splice(index, 1);
                        }
                    }
                } else {
                    value.push(data);
                }
                
                cache.putSync(client.key, value);
                        
                console.log("Device", client.key, "has been updated");
                
                /* Get other users and send the data to them */
                var grobro_users = _.filter(clients, function(value, key) {
                    return value.key == client.key && value.socket.id != socket.id;
                });
                
                _.forEach(grobro_users, function(value, key) {
                    value.socket.emit("update", data);
                });
                
                console.log(grobro_users.length + " user(s) have been notified of update.");
            }
        }
        
        console.log("Client connected");
        
        /* Register web users */
        if (socket.request.session.user) {
            socket.request.models.Key.find({
                id: socket.request.session.user.key_id
            }, function(err, keys) {
                if (err || keys.length == 0) {
                    console.log("Error happened while retrieving key.");
                    return;
                }

                clients[socket.id] = {
                    socket: socket,
                    key: keys[0].hash_key
                }

                console.log("Client", socket.id, "has registed through web on device", keys[0].hash_key);
            });
        }
        else {
            clients[socket.id] = {
                socket: socket
            };
        }

        /* When socket hasn't been detected as webclient */
        socket.on('register_device', function(data) {
            if (typeof data !== 'undefined' || 'key' in data) {
                
                push({ 'channel_name': 'device', 'state': 'connected' });
                
                clients[socket.id] = {
                    socket: socket,
                    isDevice: true,
                    key: data.key
                };
                
                console.log("Device", socket.id, "has registered on device", data.key);
            }
        });

        /* Send device data to user */
        socket.on('pull', function(cb) {
            var client = clients[socket.id];
            
            //console.log(client);
            
            if(typeof client.key === 'undefined') {
                return;
            }

            var data = cache.getSync(client.key);
            
            if(typeof cb === 'undefined' || typeof cb !== 'function') {
                return;
            }
            
            if(data) {
                cb(data);
            } else {
                cb({});
            }
        });
        
        /* Save device data */
        socket.on('push', push);

        socket.on('disconnect', function() {
            push({ 'channel_name': 'device', 'state': 'disconnected' });
            delete clients[socket.id];
            console.log("Client disconnected");
        });
    });

   //io.listen(2000);

    console.log("SocketIO Started");
};
