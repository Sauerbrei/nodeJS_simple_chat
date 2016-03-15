$(document).ready(function(){
	
	var socket = io.connect(),
		myRoom = 'room1';
	
	// Set Username on Connect
	socket.on('connect', function() {
		socket.emit('newUser', prompt("Please enter your Username!"));
	});
	
	
	// Send Message
	socket.on('updateChat', function(user,data) {
		var zeit = new Date(data.zeit);
		
		if (user === 'System') {
			$('#content').append('<li class="system_says">' + data.text + '</li>');
		} else if (data.text.length > 0) {
			escapedText = escapeHtml(data.text);
			$('#content').append('<li>' + 
				" [" + 
					pad(zeit.getHours(),2) + ':' + 
					pad(zeit.getMinutes(),2) + ':' + 
					pad(zeit.getSeconds(),2) + 
				'] ' +
				'<b>' + user + '</b> - ' + 
				escapedText + 
			'</li>');
		}
		$("body").animate({scrollTop: $(document).height()}, 'slow');
		$('body').animate({scrollTop: $(document).height()}, "slow");
	});
	
	
	// Update Users
	socket.on('updateUsers', function(users) {
		var userArr = "";
		$.each(users[myRoom], function(k,v) {
			userArr += '<li>' + v + '</li>';
		});
		$('#users').html(userArr);
	});
	
	
	// Typing
	socket.on('updateTyping', function(me, isTyping) {
		if (isTyping === true) {
			$('#typing').html(me + ' is typing...');
		} else {
			$('#typing').html('');
		}
	});
	
	
	// Change Room
	$('.room').click(function() {
		var myId = $(this).attr('id');
		socket.emit('changeRoom', myId);
		myRoom = myId;
	});
	
	
	// Button Send Message
	$('#send').click(send);
	$('#text').keyup(function(e) {
		if (e.which === 13) {
			socket.emit('typing', false);
			send();
		} else if ($('#text').val() !== '') {
			socket.emit('typing', true);
		} else {
			socket.emit('typing', false);
		}
	});
	
	
	
	
	function send() {
		var text = $('#text').val();
		socket.emit('sendChat', {text: text});
		$('#text').val('');
	}
	
	
	function pad(num, size) {
		var s = num+"";
		while (s.length < size) s = "0"+s;
		return s;
	}
	
	function escapeHtml(unsafe) {
		return unsafe
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

});