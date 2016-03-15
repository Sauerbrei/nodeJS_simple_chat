
var		express = require('express'),				// Express Framework
		app = express(),							// ??
		server = require('http').createServer(app),	// HTTP Server Creation
		io = require('socket.io').listen(server),	// Socket-Listening on Server
		conf = require('./config.json'),			// Config Data
		users = {},
		rooms = ['room1', 'room2']
;

// Set Port
server.listen(conf.port);

// Show Files in Public to User
app.use(express.static(__dirname + '/public'));

// Root View
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});


/*
 *	On Connect-Functions
 */
io.sockets.on('connection', function(socket) {
	
	// Add a new User
	socket.on('newUser', function(user) {
		socket.user = user;
		socket.room = 'room1';
		if (!users[socket.room]) {
			users[socket.room] = {};
		}
		users[socket.room][user] = user;
		socket.join(socket.room);
		socket.emit('updateChat', 'System',
			{ zeit: new Date(), text: 'Connected to the Server!' }
		);
		socket.broadcast.to(socket.room).emit('updateChat', "System", 
			{ zeit: new Date(), text: user + ' is now online!' }
		);
		io.sockets.emit('updateUsers', users);
		console.log(user + " connected.");
	});
	
	
	// Messages
	socket.on('sendChat', function(input) {
		// Send to all (to the complete socket.room)
		io.sockets.in(socket.room).emit('updateChat', socket.user, {
			zeit: new Date(),
			text: input.text
		});
		console.log(new Date() + " - " + socket.user + ": " + input.text);
	});
	
	
	// is Typing
	socket.on('typing', function(isTyping) {
		io.sockets.in(socket.room).emit('updateTyping', socket.user, isTyping);
	});
	
	
	// Change Room
	socket.on('changeRoom', function(inputRoom) {
		rooms.forEach(function(availableRoom, usersInRoom) {
			if (availableRoom === inputRoom) {
				socket.broadcast.to(socket.room).emit('updateChat', "System", 
					{ zeit: new Date(), text: socket.user + ' left!' }
				);
				delete users[socket.room][socket.user];
				io.sockets.emit('updateUsers', users);
				socket.leave(socket.room);
				
				socket.room = inputRoom;
				socket.join(socket.room);
				if (!users[socket.room]) {
					users[socket.room] = {};
				}
				users[socket.room][socket.user] = socket.user;
				io.sockets.emit('updateUsers', users);
				socket.emit('updateChat', 'System',
					{ zeit: new Date(), text: 'You are now in Room ' + socket.room + '!' }
				);
				socket.broadcast.to(socket.room).emit('updateChat', "System", 
					{ zeit: new Date(), text: socket.user + ' joined!' }
				);
				console.log(users);
			}
		});
	});
	
	
	
	// Disconnecting
	socket.on('disconnect', function() {
		delete users[socket.room][socket.user];
		io.sockets.emit('updateUsers', users);
		socket.broadcast.to(socket.room).emit('updateChat', 'System', {
			zeit: new Date(), text: socket.user + ' is now offline.'
		});
		console.log(socket.user + " disconnected.");
	});
	
});

console.log("Server is running on Port: " + conf.port + " ...!");
