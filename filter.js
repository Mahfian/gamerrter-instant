var Twitter = require('twit');
var redis = require('redis');
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


var url = require('url');
var redisURL = url.parse(process.env.REDISCLOUD_URL || 'redis://127.0.0.1:6379');
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
if (process.env.REDISCLOUD_URL) {
    client.auth(redisURL.auth.split(":")[1]);
}

var REDIS_KEY = 'screenNameCooldown';
var REDIS_KEY_COOLDOWN_DM = 'cooldownDMs';

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
        retweetById(tweet.id_str, tweet.user.screen_name);
    }
    else if(reply.relationship.target.following == false)
      {console.log('nope. user does not follow');} 
	  }
	else {
	}
};

var retweetById = function(idStr, screenName) {
    client.sadd(REDIS_KEY, screenName, function(err, reply) {
        if (err) {
            console.log(err);
        } else if (reply == 1 || screenName == process.env.TWITTER_DEBUG_USER) {
            console.log('This is a new user OR it is the debug user');
                      
                      twit.post('statuses/retweet/:id', {id: idStr}, function(err, reply) {
                      console.log("retweeted id:" + idStr);
                      err;
                      });
                      
        } else {
          cooldownNotify(screenName);
          console.log('User is on cooldown');
        }
    });
};

var cooldownNotify = function(screenName) {
  client.sadd(REDIS_KEY_COOLDOWN_DM, screenName, function(err, reply) {
        if (err) {
            console.log(err);
        } else if (reply == 1 || screenName == process.env.TWITTER_DEBUG_USER) {
            console.log('This is a new user OR it is the debug user (DM)');
                      
                      twit.post('direct_messages/new', {screen_name: screenName, text: 'Hey ' + screenName + ', your account is on cooldown! Try tagging us again in an hour.'}, function(err, data, reply) {
                      console.log("DM sent to :" + screenName);
                      err;
    });
                      
        } else {
          console.log('User has already been notified');
        }
    });
};

setInterval(function() {
    client.del(REDIS_KEY);
    console.log("database cleared");
}, 3000000);

var http = require("http");
setInterval(function() {
    http.get("http://gamer-rter-instant.herokuapp.com");
}, 600000);