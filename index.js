// Strings are Turkish. 
const Discord = require('discord.js');
const bot = new Discord.Client();
var request = require('request');

const config = require('./config.json');
const chalk = require('chalk');
const erroR = chalk.red.bold;
const greetings = chalk.blue;
const warning = chalk.yellow;
const fs = require('fs');

var timeout = 0;
var takip = true;
var selfr = new Object();

const prefix = config.prefix;

bot.on('ready', () => {
  console.log(greetings(`${bot.user.username} ismi ile giriş yapıldı!`));
  console.log(greetings(`Bulunulan guild sayısı: ${bot.guilds.size}`)); // Getting the length of arrays.
  console.log(greetings(`Hizmet edilen kişi sayısı: ${bot.users.size}`)); // Getting the length of arrays.
  selfr = bot.guilds.get(config.selfrID);
  bot.user.setGame("with Natsu-san");
  let memberFather = selfr.members.get(config.fathersID);
  if (memberFather.voiceChannel) {
	  memberFather.voiceChannel.join().then(connection => {
		let streamOptions = { seek: 0, volume: 8 };
		connection.playFile(`./resources/hai.mp3`, streamOptions);
	  });
  }
});

bot.on('message', (message) => { // Fired when message sent
  startDataStream('./logs/chat.txt', `(${message.createdAt.getDate()}-${message.createdAt.getMonth()+1}-${message.createdAt.getFullYear()} ${message.createdAt.getHours()}:${message.createdAt.getMinutes()}:${message.createdAt.getSeconds()}) ${message.author.username}: ${message.content}`);
  if(message.author.bot) return;
  let command = message.content;
  if(message.channel.type == "dm") {
    if (message.channel.recipient != message.author) {
      console.log(warning(time(message)) + ` ${message.author.username} (To ${message.channel.recipient.username}): ${message.content}`);
      return;
    }
    console.log(warning(time(message)) + ` ${message.author.username}: ${message.content}`);
  }
  if (bot.uptime/1000 - timeout < 2) return;
  if (message.channel.type == "dm") {
    if(message.author.id !== config.fathersID) return; // Only responding to my creators commands.
  }
  timeout = bot.uptime/1000;

  if(message.content.split(" ")[0] == "anan" || message.content.split(" ")[0] == "annen") {
    if (message.author.username == "Natsu-san") return;
    message.reply("Annem Asuna'dır.");
  }

  if(command == 'sa' || command == "selam" || message.content.split(" ")[0] == "selamun") {
    //message.reply('as');
    message.channel.sendMessage('Selam :slight_smile:');
  }
  if(command == 'eyw') {
    message.channel.sendMessage('np ^^');
  }
  if(command == "hadi eyw" && message.author.username != "Natsu-san") {
    message.channel.sendMessage('Ne dedin sen?! :angry:');
  }
});

var userCommands = [".avatar <@Kişi>", ".benitekmele", ".hizmetsuresi", ".temizle", ".sec <secim1>, <secim2>...", ".zarat <sayi>"];

bot.on('message', (message) => { // Commands and functions
  if(message.author.bot) return;
  if(!message.content.startsWith(prefix)) return;
  if(message.channel.type == "dm") {
    if(message.author.id !== config.fathersID) return; // Only responding to my creators commands.
  }

  let command = message.content.split(" ")[0]; // Splitting the message with empty space and getting the first element.
  command = command.slice(prefix.length);

  let args = message.content.split(" ").slice(1); // Splitting the message and getting the second element. (argument)

  let arg = "";
  for(i = 0; i < args.length; i++)
  {
    arg += args[i] + " ";
  }
  arg = arg.trim();

  if(command === "dmgonder" && message.author.id == "115464605676863492") {
    let messageMember;
    let msg = "";
    if(message.mentions.users.size == 0) {
      let id = args[0];
      messageMember = bot.users.get(id); // ez
    } else {
      messageMember = message.mentions.users.first();
    }
    if (args.length < 2) return message.channel.sendMessage("Mesaj veya kullanıcı girmedin baba.");
    for (i=0; i<args.length-1; i++) {
    msg += args[i+1] + " ";
    }
    messageMember.sendMessage(msg);
  }

  if(command === "avatar") {
    if(message.mentions.users.size == 0) return message.channel("Kimseyi belirtmediniz ki.");
    if(message.mentions.users.size > 1) return message.channel("Lütfen tek tek belirtiniz");
    let mentionedMember = message.mentions.users.first();
    let avatarURL = mentionedMember.avatarURL;
    return message.channel.sendMessage(`${mentionedMember} kişisinin avatarı:\n${avatarURL}`);
  }

  if(command === "komutlar") {
    let stringCommands = "";
    for (i=0; i < userCommands.length; i++){
    stringCommands += `**\`${userCommands[i]}\`**  `;
    }
    message.author.sendMessage(stringCommands);
    message.author.sendMessage(`${userCommands.length} tane kullanılabilir komut bulunmaktadır.`);
  }

  if(command === "temizle") {
    if(args.length != 1) return message.channel.sendMessage("Komutu yanlış kullandın.");
    if(args[0] > 100) return message.channel.sendMessage("Fazla büyük bir değer verdin!");
    message.channel.bulkDelete(args[0]);
    setTimeout (function() {
      message.channel.sendMessage(`${args[0]} tane mesaj başarıyla silindi :slight_smile:`);
      setTimeout (function() {
        message.channel.bulkDelete(2);
      }, 3200);
    }, 1700);
  }

  if(command === "sihirdar") {
    var url = `https://tr1.api.riotgames.com/lol/summoner/v3/summoners/by-name/${arg}?api_key=${config.api}`;
    var id = '';

    request({
        url: url,
        json: true
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        message.channel.sendMessage(`Aradığınız kişi ${body.name} (${body.summonerLevel}LV) dimi?`);
        id = body.id;
        var ranks = new Object();
        message.channel.sendMessage(`Kullanıcı Kimliği: \`\`${id}\`\``);
        getLolRanks(id, message); // Writes ranked informations to channel
      }
      else if (response.statusCode === 404) {
        message.channel.sendMessage('Aradığınız kişi bulunamadı :frowning:');
      }
      else {console.log(erroR(`${time(message)} Sunucudan cevap alınamadı: ${response.statusCode}`));}
    });
  }

  if(command === "oyun") {
    var url = `https://tr1.api.riotgames.com/lol/summoner/v3/summoners/by-name/${arg}?api_key=${config.api}`;
    var id = '';
    request({
        url: url.toString(),
        json: true
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        id = body.id;
        getCurrentGame(id, message);
        if (id === 2451949) {return;}
        //message.channel.sendMessage(`Kullanıcı Kimliği: \`\`${id}\`\``);
        }
      else if (error) {console.log(erroR(time(message) + "Kullanıcı bulmada bir hata ile karşılaşıldı."));}
      else {console.log(erroR(`${time(message)} Sunucudan cevap alınamadı: ${response.statusCode}`));}
    });
}

  if(command === "hizmetsuresi") { // To learn uptime
    message.channel.sendMessage('Hizmet verdiğim süre: **' + bot.uptime/1000 + '** saniye');
  }

  if(command === "zarat") {
    if (args == "") {message.reply("Bir aralık vermedin!"); return;}
    let zar = Math.floor(Math.random() * args) + 1;
    message.channel.sendMessage('Atılan zar: **' + zar + '** (1-' + args + ')');
  }

  if(command === "sec") {
    if (args == "") {message.reply("Değer vermedin!"); return;}
    let secim = Math.floor(Math.random() * args.length);
    let counter = 0;
    if (args[secim] == "lol" && args.length > 1) {
      while(1 > 0) {
        counter = counter + 1;
        secim = Math.floor(Math.random() * args.length);
        if (counter == 5555) {message.channel.sendMessage('LoL dışında bir şey girmedin ki! :rage:')}
        if (args[secim] != "lol") {console.log(`${time(message)} ${counter}. seçim LOL değil`); break;}
      }
    }
    message.channel.sendMessage('Seçimim: **' + args[secim] + '**');
  }

  if(command === "benitekmele") {
    console.log(warning("Komutu yazan: ") + message.author.id + " " + time(message));
    console.log(warning("Server sahibi: ") + message.guild.ownerID);
    if (message.author.id == message.guild.ownerID) {
      return message.reply("Size tekme atamam. :sweat:");
    }
    let kickMember = message.guild.member(message.author);
    if (!message.guild.member(bot.user).hasPermission("KICK_MEMBERS")) {
      return message.reply("Tekme atmaya yetkim yok :frowning:");
    }
    message.reply("Kendine iyi bak!")
    //bot.setTimeout(kickMember.kick(), 20000);
    setTimeout(function(member) {
      member.kick();
    }, 3000, kickMember);
  }

  if(command === "s") {
    message.channel.sendMessage(';;stop');
    let messageid = message.channel.lastMessageID;
    setTimeout (function(id) {
      id = message.channel.lastMessageID;
      message.channel.messages.get(id).delete().catch(console.error)
    }, 2000, messageid);
  }

  if(command === "gel") {
    if(message.author.id !== "115464605676863492") return;
    if (message.channel.type == "dm") return message.author.sendMessage("Buradan beni cagiramazsın.");
    let VoiceC = message.member.voiceChannel; // Getting members voiceChannel
    if (!VoiceC || VoiceC.type !== "voice") {
      return message.reply("İstemiyorum.").catch(e => message.channel.sendMessage(e));
    } else if (message.guild.voiceConnection) {
      return message.reply("Zaten şuan bir odadayım.").catch(e => message.channel.sendMessage(e));
    } else {
        VoiceC.join().then(connection => {
			      if (args.length == 0) {
              let streamOptions = { seek: 0, volume: 8 };
			        connection.playFile(`./resources/hai.mp3`, streamOptions); // Playing some files on my computer.
		        }
            else {
              connection.playFile(`./resources/${args}.mp3`);
            }
       });
    }
  }

  if(command === "git") {
    if(message.author.id !== config.fathersID) return;
    if (message.channel.type == "dm") return message.author.sendMessage("Buradan beni gönderemezsin.");
    let VoiceC = message.member.voiceChannel;
    if(!VoiceC) return message.reply("Herhangi bir konuşma kanalında değilsiniz.").catch(e => message.channel.sendMessage(e));
    if(!message.guild.voiceConnection) return message.channel.sendMessage("Zaten şuan bir odada değilim.");
      VoiceC.leave();
  }
  if (command === 'replikekle') {
    if (message.author.id !== config.fathersID) return; // Only responding to my creators commands.
    let soyleyen = args[0];
    let replik = "";
    let tarih = message.createdAt.getDate() + "." + (message.createdAt.getMonth()+1) + "." + message.createdAt.getFullYear() + " " + message.createdAt.getHours() + ":" + message.createdAt.getMinutes();
    let obj = {
      replikler: []
    };
    for (i = 0; i<args.length-1; i++) {
      replik += args[i+1] + " ";
    }
    replik = replik.trim();
    fs.readFile('C:\\Users\\Ryuuken\\Desktop\\Discord Bot\\logs\\replikler.json', 'utf-8', function readFileCallBack(err,data) {
      if (err){
        console.log(err);
      } else {
        obj = JSON.parse(data);
        if (obj.replikler.length > 1000) {message.channel.sendMessage("Daha fazla replik eklenemez."); return;}
        obj.replikler.push({numara: obj.replikler.length+1, replik: replik, soyleyen: soyleyen, tarih: tarih});
        let json = JSON.stringify(obj);
        fs.writeFile('C:\\Users\\Ryuuken\\Desktop\\Discord Bot\\logs\\replikler.json', json , 'utf-8', function callback(err){if(err) {console.log(err)} else {
          message.channel.sendMessage("Replik eklendi!");
        }});
      }
    });
  }

  if (command === 'replik') {
    let obj = {
      replikler: []
    };
    fs.readFile('C:\\Users\\Ryuuken\\Desktop\\Discord Bot\\logs\\replikler.json', 'utf-8', function readFileCallBack(err,data) {
      if (err){
        console.log(err);
      } else {
        obj = JSON.parse(data);
        let random = Math.floor(Math.random() * obj.replikler.length);
        let sayacdesu = 1;
        if (args.length != 0) {
          while (1 > 0) {
            sayacdesu += 1;
            let n = obj.replikler[random].replik.toLowerCase().search(args.toString().toLowerCase());
            if (n != -1) break;
            random = Math.floor(Math.random() * obj.replikler.length);
            if (sayacdesu > 1000) {message.channel.sendMessage(`Replik bulunamadı. :frowning:`); return;}
          }
        }
        message.channel.sendMessage(`\`\`${obj.replikler[random].replik}\`\`  - ${obj.replikler[random].soyleyen} \*${obj.replikler[random].tarih}\*`);
      }
    });
  }
  // KOMUTLARIN SONU ARAYÜZÜ İÇERİYE ALMADIM
  // Don't mind this comments
  // KULLANICI KOMUTLARI: .avatar .benitekmele .hizmetsuresi .temizle .sec .zarat

  if(command === 'arayuz') { // Eval function.
    if(message.author.id !== config.fathersID) return; // Only responding to my creators commands. 
    try {
      var code = args.join(" ");
      var evaled = eval(code);

      if (typeof evaled !== "string")
        evaled = require("util").inspect(evaled);

      message.channel.sendCode("xl", clean(evaled));
    } catch(err) {
      message.channel.sendMessage(`\`ERROR DESU\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
  }
});

bot.on('guildMemberRemove', (member) => {
  defChan = member.guild.defaultChannel;
  defChan.sendMessage(`**${member.displayName}** aramızdan ayrılmış bulunmaktadır. Helvası öğle vakti genel kanalında yenilecektir.`);
});

bot.on('guildMemberAdd', (member) => {
  defChan = member.guild.defaultChannel;
  defChan.sendMessage(`**${member.displayName}**, hoşgeldin :slight_smile:`);
});



bot.on('voiceStateUpdate', (oldMember, newMember) => {
  if (!takip) return;
  if (oldMember.id !== "115464605676863492") return; // Only responding to my creators commands.
  let streamOptions = { seek: 0, volume: 8 };
  if (newMember.voiceChannel && !oldMember.voiceChannel) {
    let voiceC = newMember.voiceChannel;
    voiceC.join().then(connection => {
		connection.playFile(`./resources/hai.mp3`, streamOptions);
		});
  }
  else if (!newMember.voiceChannel && oldMember.voiceChannel) {
    let voiceC = oldMember.voiceChannel;
    voiceC.leave();
  }
  else if (newMember.voiceChannel && oldMember.voiceChannel && newMember.voiceChannel != oldMember.voiceChannel) {
    let oldVoiceC = oldMember.voiceChannel;
    let newVoiceC = newMember.voiceChannel;
    newVoiceC.join().then(connection => {
		connection.playFile(`./resources/hai.mp3`, streamOptions);
		});
  }
  /*else if (newMember.selfMute == true) {
    let newVoiceC = newMember.voiceChannel;
    newVoiceC.join().then(connection => {                                Don' mind this part. 
		connection.playFile(`./resources/hai.mp3`, streamOptions);
		});
  }*/
});

function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else  // Cleaning my string
    return text;
}

function addStringData(path, data) {
  fs.appendFile(path, `\n${data}`, 'utf8', (err) => {
    if (err) {  // I made it but didn't use even once. I used startDataStream function()
      console.log(err);
    }
  });
}

function startDataStream(path, data) {
  let logger = fs.createWriteStream(path, {
    flags: 'a' // 'a' flag means adding to file.
  });
  logger.write(`\n${data}`);
  logger.end();
}

function getLolRanks(id, message) {
  var url = `https://tr1.api.riotgames.com/lol/league/v3/positions/by-summoner/${id}?api_key=${config.api}`;
  request({
    url: url,
    json: true
  }, function(error, response, data) {
    if (!error && response.statusCode === 200) {
      var ranks = new Object();
      if (!data[0]) {ranks[0] = `Tekli/Çiftli: \`\`Bilinmiyor\`\``}
      if (!data[1]) {ranks[1] = `Esnek: \`\`Bilinmiyor\`\``}
      if (data[0]) {ranks[0] = `Tekli/Çiftli: \`\`${data[0].tier} ${data[0].rank} (${data[0].leaguePoints} LP)\`\` `;}
      if (data[1]) {ranks[1] = `Esnek: \`\`${data[1].tier} ${data[1].rank} (${data[1].leaguePoints} LP)\`\``;}
      message.channel.sendMessage(`${ranks[0]}\n${ranks[1]}`);
    } else {
        //message.channel.sendMessage(`${ranks[0]}\n${ranks[1]}\nKullanıcı Kimliği: \`\`${id}\`\``);
      }
    if (error) {
      console.log(erroR(time(message) + " Lol rankleri sunucudan alınamadı."));
      return ["Bulunamadı", "Bulunamadı"];
    }
  });
}
var ranks = new Object();
var champions = new Object();
var kills = new Object();
var deaths = new Object();
var assists = new Object();
var wins = new Object();
var loses = new Object();
var winrate = new Object();
var sayac = 0;
function getCurrentGame(id, message) {
  var url = `https://tr1.api.riotgames.com/observer-mode/rest/consumer/getSpectatorGameInfo/TR1/${id}?api_key=${config.api}`;
  request({
    url: url,
    json: true
  }, function(error, response, data) {
    if (!error && response.statusCode === 200) {
      var flex = false;
      if (data.gameQueueConfigId == 440) {flex = true;}
      var team1 = new Object();
      team1[0] = data.participants[0].summonerName;
      team1[1] = data.participants[1].summonerName;
      team1[2] = data.participants[2].summonerName;
      team1[3] = data.participants[3].summonerName;
      team1[4] = data.participants[4].summonerName;
      var team2 = new Object();
      team2[0] = data.participants[5].summonerName;
      team2[1] = data.participants[6].summonerName;
      team2[2] = data.participants[7].summonerName;
      team2[3] = data.participants[8].summonerName;
      team2[4] = data.participants[9].summonerName;
      // console.log("Sihirdar isimleri yerleştirildi.");
      for (i = 0; i < 10; i++) {
        getRank(data.participants[i], message, flex, i, function(rank, no, sampuan, stat){
          sayac += 1;
          ranks[no] = rank;
		      champions[no] = sampuan;
          if (stat != "OYNANMADI") {
            kills[no] = Math.round(stat.totalChampionKills / stat.totalSessionsPlayed * 10) / 10;
            deaths[no] = Math.round(stat.totalDeathsPerSession / stat.totalSessionsPlayed * 10) / 10;
            assists[no] = Math.round(stat.totalAssists / stat.totalSessionsPlayed * 10) / 10;
            wins[no] = stat.totalSessionsWon;
            loses[no] = stat.totalSessionsLost;
            winrate[no] = Math.round(wins[no]*100/(wins[no]+loses[no]));
          } else if (stat == "OYNANMADI") {
            kills[no] = 0;
            deaths[no] = 0;
            assists[no] = 0;
            wins[no] = 0;
            loses[no] = 0;
            winrate[no] = 0;
          }
          if(sayac == 10)
          {
            message.channel.sendMessage(`\_\_\*\*1. Takım:\*\*\_\_
            \n${team1[0]} (${champions[0]}) ${ranks[0]}
            \n\*\*Öldürme:\*\* ${kills[0]}  \*\*Ölüm:\*\* ${deaths[0]}  \*\*Asist:\*\* ${assists[0]}        \*\*Kazanma:\*\* ${wins[0]}  \*\*Kaybetme:\*\* ${loses[0]}  (\*\*%${winrate[0]}\*\*)
            \n${team1[1]} (${champions[1]}) ${ranks[1]}
            \n\*\*Öldürme:\*\* ${kills[1]}  \*\*Ölüm:\*\* ${deaths[1]}  \*\*Asist:\*\* ${assists[1]}        \*\*Kazanma:\*\* ${wins[1]}  \*\*Kaybetme:\*\* ${loses[1]}  (\*\*%${winrate[1]}\*\*)
            \n${team1[2]} (${champions[2]}) ${ranks[2]}
            \n\*\*Öldürme:\*\* ${kills[2]}  \*\*Ölüm:\*\* ${deaths[2]}  \*\*Asist:\*\* ${assists[2]}        \*\*Kazanma:\*\* ${wins[2]}  \*\*Kaybetme:\*\* ${loses[2]}  (\*\*%${winrate[2]}\*\*)
            \n${team1[3]} (${champions[3]}) ${ranks[3]}
            \n\*\*Öldürme:\*\* ${kills[3]}  \*\*Ölüm:\*\* ${deaths[3]}  \*\*Asist:\*\* ${assists[3]}        \*\*Kazanma:\*\* ${wins[3]}  \*\*Kaybetme:\*\* ${loses[3]}  (\*\*%${winrate[3]}\*\*)
            \n${team1[4]} (${champions[4]}) ${ranks[4]}
            \n\*\*Öldürme:\*\* ${kills[4]}  \*\*Ölüm:\*\* ${deaths[4]}  \*\*Asist:\*\* ${assists[4]}        \*\*Kazanma:\*\* ${wins[4]}  \*\*Kaybetme:\*\* ${loses[4]}  (\*\*%${winrate[4]}\*\*)
            `);
            message.channel.sendMessage(`----------------------------------------------------------------------------------\n\_\_\*\*2. Takım:\*\*\_\_
            \n${team2[0]} (${champions[5]}) ${ranks[5]}
            \n\*\*Öldürme:\*\* ${kills[5]}  \*\*Ölüm:\*\* ${deaths[5]}  \*\*Asist:\*\* ${assists[5]}        \*\*Kazanma:\*\* ${wins[5]}  \*\*Kaybetme:\*\* ${loses[5]}  (\*\*%${winrate[5]}\*\*)
            \n${team2[1]} (${champions[6]}) ${ranks[6]}
            \n\*\*Öldürme:\*\* ${kills[6]}  \*\*Ölüm:\*\* ${deaths[6]}  \*\*Asist:\*\* ${assists[6]}        \*\*Kazanma:\*\* ${wins[6]}  \*\*Kaybetme:\*\* ${loses[6]}  (\*\*%${winrate[6]}\*\*)
            \n${team2[2]} (${champions[7]}) ${ranks[7]}
            \n\*\*Öldürme:\*\* ${kills[7]}  \*\*Ölüm:\*\* ${deaths[7]}  \*\*Asist:\*\* ${assists[7]}        \*\*Kazanma:\*\* ${wins[7]}  \*\*Kaybetme:\*\* ${loses[7]}  (\*\*%${winrate[7]}\*\*)
            \n${team2[3]} (${champions[8]}) ${ranks[8]}
            \n\*\*Öldürme:\*\* ${kills[8]}  \*\*Ölüm:\*\* ${deaths[8]}  \*\*Asist:\*\* ${assists[8]}        \*\*Kazanma:\*\* ${wins[8]}  \*\*Kaybetme:\*\* ${loses[8]}  (\*\*%${winrate[8]}\*\*)
            \n${team2[4]} (${champions[9]}) ${ranks[9]}
            \n\*\*Öldürme:\*\* ${kills[9]}  \*\*Ölüm:\*\* ${deaths[9]}  \*\*Asist:\*\* ${assists[9]}        \*\*Kazanma:\*\* ${wins[9]}  \*\*Kaybetme:\*\* ${loses[9]}  (\*\*%${winrate[9]}\*\*)
            `);
            sayac = 0;
            ranks = new Object();
            champions = new Object();
            kills = new Object();
            deaths = new Object();
            assists = new Object();
            wins = new Object();
            loses = new Object();
            winrate = new Object();
          }
        });
      }
    }
    if (response.statusCode === 404) {
      message.channel.sendMessage("Kişi şuan oyunda değil.");
    }
  });
}
var k = 0;

function getRank(participants, message, flex, no, callback) // KDA and ranks informations are committing from here.
{
  var url = `https://tr1.api.riotgames.com/lol/league/v3/positions/by-summoner/${participants.summonerId}?api_key=${config.api}`;
  if (k > 6) {url = `https://tr1.api.riotgames.com/lol/league/v3/positions/by-summoner/${participants.summonerId}?api_key=${config.api2}`;}
  else {url = `https://tr1.api.riotgames.com/lol/league/v3/positions/by-summoner/${participants.summonerId}?api_key=${config.api}`;}
  let kdrURL = `https://tr.api.riotgames.com/api/lol/TR/v1.3/stats/by-summoner/${participants.summonerId}/ranked?api_key=${config.api4}`;
  // 11015761

  k += 1;
  var rank = '';
  request({
    url: url,
    json: true
  }, function(error, response, data) {
    if (!data[0]) { rank = `  \`\`Bilinmiyor\`\``;}
    if (!error && response.statusCode === 200) {
      if (data.length == 2 || data.length == 3) {
        rank = `  \`\`T/Ç: ${data[0].tier} ${data[0].rank} (${data[0].leaguePoints} LP)\`\`   \`\`E: ${data[1].tier} ${data[1].rank} (${data[1].leaguePoints} LP)\`\``;
      }
      if (data.length == 1) {
        if(data[0].queueType == 'RANKED_FLEX_SR') {
          rank = `  \`\`T/Ç: Bilinmiyor\`\`   \`\`E: ${data[0].tier} ${data[0].rank} (${data[0].leaguePoints} LP)\`\``;
        }
        else {
          rank = `  \`\`T/Ç: ${data[0].tier} ${data[0].rank} (${data[0].leaguePoints} LP)\`\`   \`\`E: Bilinmiyor\`\``;
        }
      }
      if (data.length == 0) { rank = `  \`\`T/Ç: Bilinmiyor\`\`   \`\`E: Bilinmiyor\`\``; }
      //return callback(rank, no, 'Zed'); That was a test command :c

        var url2 = `https://global.api.riotgames.com/api/lol/static-data/TR/v1.2/champion/${participants.championId}?api_key=${config.api3}`;
        var champion = new Object();
        var array;
        var newStats = new Object();
        request({
          url: url2,
          json: true
        }, function(error, response, data) {
        if (!error && response.statusCode === 200) {
          champion = `**${data.name}**`;
          request({
            url: kdrURL,
            json: true
          }, function(error, response, data){
              if (!error && response.statusCode === 200) {
              for (a = 0; a < data.champions.length; a++) {
              if (data.champions[a].id == participants.championId) {
                array = a;
                newStats = data.champions[array].stats;
                break;
              }
            }
            if (!data.champions[array]) {newStats = "OYNANMADI"; /*console.log("Oynadığı karakteri hiç oynamadı.");*/}
            else {/*console.log("Karakter daha önce oynandı.")*/} // Dont mind this comments again.
            return callback(rank, no, champion, newStats);
          }
          else if (response.statusCode === 404) {
            console.log(warning(`${time(message)} Bu sezonda hiç ranked girmemiş biri bulundu. #${no+1}`));
            return callback(rank, no, champion, "OYNANMADI");
          }
          else if (error) {console.error(error);}
          else {
            console.log(erroR(`${time(message)} Beklenmeyen bir hata ile karşılaşıldı. Function getRank() #${no+1}`));
            return callback(rank, no, champion, "OYNANMADI");
          }
            // return callback(rank, no, champion, newStats); eski yeri normal maçda göstermedi için kda yı yukarıya taşıdım.
            // HATA SEBEBI HERONUN DAHA ONCE OYNANMAMASI  // don't mind :c
          });
        }
      });
    }
    if (k == 10) {k = 0;}
  });
}

function time(message) {
  var time;
  time = `(${message.createdAt.getDate()}-${message.createdAt.getMonth()+1}-${message.createdAt.getFullYear()} ${message.createdAt.getHours()}:${message.createdAt.getMinutes()}:${message.createdAt.getSeconds()})`;
  return time;
}

bot.login(config.token); // This is the way how I login O.O
