const Discord = require('discord.js');
const propetyJson = require('./bot_property.json');
const client = new Discord.Client({ intents: Object.values(Discord.Intents.FLAGS) });
const token = propetyJson.Token;
const prefix = "!";
let targetChannel = propetyJson.targetChannnel;

client.on('ready', () => {
    console.log('ready...');
    if(propetyJson.debug){
        targetChannel = propetyJson.debugChannnel;
    }
});

client.on('messageCreate', message => {
    if(message.author.bot) return; //BOTのメッセージには反応しない

    if(!message.content.startsWith(prefix)) return; // prefix以外で始まっている場合反応しない

    if(message.channelId.toString() != targetChannel) return; // ターゲットチャンネル以外反応しない

    // spaceでコマンドを区切る
    const word  = message.content.split(' ');
    const id    = word[0];
    const cmd   = word[1];

    // ユーザ名、UUID、役職のjsonを読み込み
    const userJson = require('./userlist.json');

    /*
    引数が必要なコマンド実装時に追加予定
    const argv  = word[2];
    */

    try{
        // "!mc"で始まる場合
        if(id === `${prefix}mc`){

            // サーバーの開始
            if(cmd === "start"){
                let permitted = false;
                
                // JSON読み込み
                for(var i in userJson){
                    if(message.author.id == userJson[i].UUID){
                        permitted = true;
                        break;
                    }
                }

                // 許可されたユーザーか判別
                if(!permitted){
                    message.channel.send("許可がないからダメ。");
                    return;
                }

                const { exec } = require('child_process');
                var isRunning = false;

                // shellスクリプトの実行
                exec('bash ../shell/check_server_status.sh', (err, stdout, stderr) => {
            
                    // shell実行時エラーが発生した場合
                    if (err) {
                        console.log(`${stderr}`);
                        message.channel.send("エラー発生 : " + stderr);
                        return;
                    }

                    // pidofの結果が1文字以上だった場合(空白文字以外の場合)
                    if(stdout.toString().length > 1){
                        message.channel.send("もうサーバー起動してますよ。");
                        isRunning = true;
                        return;
                    }

                    if(!isRunning){
                        // サーバー開始のshellスクリプト実行
                        exec('gnome-terminal --tab -e "bash ../shell/start_minecraft_server.sh"', (err, stdout, stderr) => {
                    
                            // shell実行時エラーが発生した場合
                            if (err) {
                                console.log(`${stderr}`);
                                message.channel.send("エラー発生 : " + stderr);
                                return;
                            }
    
                            // サーバーのコンソールに呼び出したユーザー名を表示
                            console.log(`start is called by ${message.author.username}`);
    
                            message.channel.send("サーバー起動しました！");
    
                        })
    
                        /*adminに起動通知をDMで送信する*/
                    }
                })
            }

            // サーバー稼働状況表示
            else if(cmd === "status"){         
                const { exec } = require('child_process');

                // shellスクリプトの実行
                exec('bash ../shell/check_server_status.sh', (err, stdout, stderr) => {
 
                    // shell実行時エラーが発生した場合
                    if (err) {
                        console.log(`${stderr}`);
                        message.channel.send(`${stderr}`);
                        return;
                    }

                    // サーバーのコンソールに呼び出したユーザー名を表示
                    console.log(`status is called by ${message.author.username}`);

                    // pidofの結果が1文字以上だった場合(空白文字以外の場合)
                    if(stdout.toString().length > 1){
                        message.channel.send("サーバー稼働中！");
                    }

                    else{
                        message.channel.send("サーバー今起動してないっぽい。");
                    }
                })
            }

            // サーバー停止
            else if(cmd === "stop"){
                let permitted = false;
                
                // JSON読み込み
                for(var i in userJson){
                    if(message.author.id == userJson[i].UUID && userJson[i].ROLE === "admin"){
                        permitted = true;
                        break;
                    }
                }

                // 許可されたユーザーか判別
                if(!permitted){
                    message.channel.send("こら！管理者以外このコマンド使っちゃだめだぞー！！！");
                    return;
                }
                
                const { exec } = require('child_process');

                // shellスクリプトの実行
                exec('bash ../shell/stop_minecraft_server.sh', (err, stdout, stderr) => {
        
                    // shell実行時エラーが発生した場合
                    if (err) {
                        console.log(`${stderr}`);
                        return;
                    }
                    message.channel.send("サーバーを終了しました。");
                })
            }

            // ヘルプの表示
            else if(cmd === "help"){
                message.channel.send({
                    embeds: [{
                    "title": "Usage",
                    "description": "This is command list as belows. ```\nPREFIX : !\n\nNAME   : mc\n\nCOMMAND\n\n      start  : launch Minecraft Server\n               admin or guest user can use this command\n\n      status : show currrent server status\n\n      stop   : shutdown server\n               admin user can only use this command\n\n      help   : shows help\n\nEx) !mc start -> サーバーの開始```"
                    }]
                });
            }

            // グローバルipの表示
            else if(cmd === "ip"){
                const { exec } = require('child_process');

                // shellスクリプトの実行
                exec('bash ../shell/show_ip.sh', (err, stdout, stderr) => {
        
                    // shell実行時エラーが発生した場合
                    if (err) {
                        console.log(`${stderr}`);
                        return;
                    }
                    else{
                        message.channel.send("IP: "+`${stdout}`);
                    }
                })
            }

            // 不正なコマンドが入力された場合
            else{
                message.channel.send("無効なコマンド : " + cmd);
            }
        }
    }
    catch(err){
        message.channel.send("[Error] Unexpected Error: " + err);
    }
});

// Discordへの接続
client.login(token);