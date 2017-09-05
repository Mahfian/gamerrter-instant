var Twitter = require('twit');
var twit = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

var express = require('express');
var app = express();

app.get('/', function(req, res){
  res.send('Intel is currently staring through your window. Look behind you.');
});

var port = process.env.PORT || 3000;
app.listen(port);
console.log("Express is running on port " + port);

var userStream = twit.stream('user', { with: 'user', replies: 'all' });

userStream.on('tweet', function(tweet) {
  console.log('Received mention! id: ' + tweet.id_str + '..reply status id:' + tweet.in_reply_to_status_id_str + '..user_id: ' + tweet.user.screen_name);
  var tweep = tweet.user.screen_name;
  var rtCheck = tweet.text.indexOf('RT');
    if (rtCheck > 0 || rtCheck == -1) {
      console.log('Received mention id: ' + tweet.id_str + ' .user_id: ' + tweet.user.screen_name);
      twit.get('friendships/show', {source_screen_name: process.env.USERNAME, target_screen_name: tweet.user.screen_name}, function(err, reply) {
        console.log('looking up user:' + tweet.user.screen_name);
        err;
        derpCheckFriendship(tweet, reply, tweep);
      });
    }
    else {
    } 
});

var derpCheckFriendship = function(tweet, reply, tweep){
	if (tweet.in_reply_to_user_id == null) {
    if (reply.relationship.target.following == true){
        retweetById(tweet.id_str);
    }
    else if(reply.relationship.target.following == false)
      {console.log('nope. user does not follow');} 
	  }
	else {
	}
};

var retweetById = function(idStr) {
  var randy = Math.random();
  if (randy <.99) {
    twit.post('statuses/retweet/:id', {id: idStr}, function(err, reply) {
      console.log("retweeted id:" + idStr);
      err;
    });
  }
  else {
  }
};

var http = require("http");
setInterval(function() {
    http.get("http://gamer-rter-instant.herokuapp.com");
}, 600000);