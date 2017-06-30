// Include methods
const TelegramBot = require('node-telegram-bot-api')
const jsonfile = require('jsonfile')
const fs = require('fs');
const http = require('http');



// Set up server and files
var htmlFile;
var cssFile;
var jsFile;
var jsonFile;
var mp3File

fs.readFile('./index.html', function(err, data) {
    if (err){
        throw err;
    }
    htmlFile = data;
});

fs.readFile('./style.css', function(err, data) {
    if (err){
        throw err;
    }
    cssFile = data;
});

fs.readFile('./data.json', function(err, data) {
    if (err){
        throw err;
    }
    jsonFile = data;
});

fs.readFile('./index.js', function(err, data) {
    if (err){
        throw err;
    }
    jsFile = data;
});

fs.readFile('./dingdong.mp3', function(err, data) {
    if (err){
        throw err;
    }
    mp3File = data;
});

var server = http.createServer(function (request, response) {
    

    switch (request.url) {
        case "/style.css" :
            response.writeHead(200, {"Content-Type": "text/css"});
            response.write(cssFile);
            break;
        case "/index.js" :
            response.writeHead(200, {"Content-Type": "text/javascript"});
            response.write(jsFile);
            break;
        case "/data.json" :
            response.writeHead(200, {"Content-Type": "application/json"});
            response.write(jsonFile);
            break;
   		case "/req" :
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write("Got it!");
            console.log(request.method);
            break;
        case "/" :
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write(htmlFile);
            break;
        case "/dingdong.mp3" :
            response.writeHead(200, {"Content-Type": "audio/mpeg"});
            response.write(mp3File);
            break;
        case "/favicon.ico" :
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write(htmlFile);
            break;
        default :
            response.writeHead(200, {"Content-Type": "text/html"});
            var clickID = request.url.split("?")[1].split("&")[0].split("=")[1];
            response.write(clickID);
            console.log(clickID);
            dingDong(clickID);
    };
    response.end();
})

server.listen(8080, function(){
	console.log("Now online on 8080")
});

// Set up Telegram Bot
const token = '283166033:AAF17PqUgXpT8yBqRvcP6t31w-K22Cy9eh0'
const bot = new TelegramBot(token, {polling: true})

const defaultKeyboard = {
					reply_markup: {
			            resize_keyboard: false,
			            one_time_keyboard: false,
			            // keyboard: [["/Mute \ud83d\udd15","/Unmute \ud83d\udd14"],["/Show Commands"]]
			            keyboard: [[{text: "\ud83d\udd15 Mute doorbell", callback_data: "mute"}],[{text: "\ud83d\udd14 Unmute doorbell", callback_data: "unmute"}],["\u2753 Show Commands"]]
			        }
				}

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  console.log(msg)
 
  // send a message to the chat acknowledging receipt of their message 
});

// Pulls telegram chat ID from the data JSON file and sends it an alert
var dingDong = function(studioID) {
	var file ='data.json'
	var chatId
	jsonfile.readFile(file, function(err, obj){
		for (var i = 0; i < obj[studioID].people.length; i++) {
			if (obj[studioID].people[i].mute == "false"){
				chatId = obj[studioID].people[i].chatID
				msg = "Hi "+obj[studioID].people[i].name+", there is someone at the door for "+ obj[studioID].studioName+"! Can you open the door? /Yes /No"
				const opts = {
					reply_markup: {
			            resize_keyboard: false,
			            one_time_keyboard: true,
			            keyboard: [["Yes I can open the door!"],["No I cannout open the door"]]
			        }
				} 
				bot.sendMessage(chatId, msg, opts)
			}
		}
	})
}

// adding a new person
bot.onText(/\/start/, (msg) => {
 
	const chatId = msg.chat.id;
	const resp = "Hi Stranger! Nice too meet you, I'm the front door of Voorhaven 57. If you want, I'll alert you when you when there is someone (or something) the door for you. Would you like to register? /Yes /No";
	bot.sendMessage(chatId, resp, defaultKeyboard);
});

// "Mute" command
bot.onText(/\/Mute/, (msg) => {
	var file = 'data.json'
	var i
	var j
	var studio
	var name
	const chatId = msg.chat.id;
	// jsonfile.readFile(file, function(err, obj){
	var data = fs.readFileSync(file)
	var obj = JSON.parse(data)
	for (i = 0; i < obj.length; i++) {
		for(j = 0; j < obj[i].people.length; j++){
			// console.log(obj[i].people[j].chatID)
			if(obj[i].people[j].chatID == chatId){
				name = obj[i].people[j].name
				studio = obj[i].studioName
				if (obj[i].people[j].mute == "false"){
					obj[i].people[j].mute = "true"
					var data = JSON.stringify(obj, null, 2)
					fs.writeFile('data.json', data, finished)
					muteConfirm(name, studio, chatId)
				}
				else if(obj[i].people[j].mute == "true"){
					muteDenial(name, studio, chatId)
				}
				else{
					obj[i].people[j].mute = "false"
					var data = JSON.stringify(obj, null, 2)
					fs.writeFile('data.json', data, finished)
					muteError(name, studio, chatId)
				}					
				break
			}
		}
	}
})

var muteConfirm = function(name, studio, chatId){
	msg = "Hi "+name+" from "+studio+", I'll stop notifying you when there is someone at the door for you. If you want notifications again send me the command /unmute"
	bot.sendMessage(chatId, msg, defaultKeyboard)
}

var muteDenial = function(name, studio, chatId){
	msg = "Hi "+name+" from "+studio+", it seems you are already muted me!"
	bot.sendMessage(chatId, msg, defaultKeyboard)
}

var muteError = function(name, studio, chatId){
	msg = "Hi "+name+" from "+studio+", it seems like something went wrong, please try again by sending /mute"
	bot.sendMessage(chatId, msg, defaultKeyboard)
}


bot.onText(/\/Unmute/, (msg) => {
	var file = 'data.json'
	var i
	var j
	var studio
	var name
	const chatId = msg.chat.id;
	// jsonfile.readFile(file, function(err, obj){
	var data = fs.readFileSync(file)
	var obj = JSON.parse(data)
	for (i = 0; i < obj.length; i++) {
		for(j = 0; j < obj[i].people.length; j++){
			// console.log(obj[i].people[j].chatID)
			if(obj[i].people[j].chatID == chatId){
				name = obj[i].people[j].name
				studio = obj[i].studioName
				if (obj[i].people[j].mute == "true"){
					obj[i].people[j].mute = "false"
					var data = JSON.stringify(obj, null, 2)
					fs.writeFile('data.json', data, finished)
					unmuteConfirm(name, studio, chatId)
				}
				else if(obj[i].people[j].mute == "false"){
					unmuteDenial(name, studio, chatId)
				}
				else{
					obj[i].people[j].mute = "true"
					var data = JSON.stringify(obj, null, 2)
					fs.writeFile('data.json', data, finished)
					unmuteError(name, studio, chatId)
				}					
				break
			}
		}
	}
})

var unmuteConfirm = function(name, studio, chatId){
	msg = "Hi "+name+" from "+studio+", you will now receive notifications from again when there is someone at the door for you! You can mute me again by sending /mute"
	bot.sendMessage(chatId, msg, defaultKeyboard)
}

var unmuteDenial = function(name, studio, chatId){
	msg = "Hi "+name+" from "+studio+", it seems you are already receiving notifications from me!"
	bot.sendMessage(chatId, msg, defaultKeyboard)
}

var unmuteError = function(name, studio, chatId){
	msg = "Hi "+name+" from "+studio+", it seems like something went wrong, please try again by sending /unmute"
	bot.sendMessage(chatId, msg, defaultKeyboard)
}

finished = function(err){
	console.log('all set!')
}

