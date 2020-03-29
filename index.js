// -----------------------------------------------------------------------------
// モジュールのインポート
const server = require("express")();
const line = require("@line/bot-sdk"); // Messaging APIのSDKをインポート

// -----------------------------------------------------------------------------
// パラメータ設定
const line_config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN, // 環境変数からアクセストークンをセットしています
    channelSecret: process.env.LINE_CHANNEL_SECRET // 環境変数からChannel Secretをセットしています
};

// -----------------------------------------------------------------------------
// Webサーバー設定
server.listen(process.env.PORT || 3000);


// APIコールのためのクライアントインスタンスを作成
const bot = new line.Client(line_config);

// -----------------------------------------------------------------------------
// ルーター設定
server.post('/bot/webhook', line.middleware(line_config), (req, res, next) => {
    // 先行してLINE側にステータスコード200でレスポンスする。
    res.sendStatus(200);

    // すべてのイベント処理のプロミスを格納する配列。
    let events_processed = [];

    // イベントオブジェクトを順次処理。
    req.body.events.forEach((event) => {
        // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
        if (event.type == "message" && event.message.type == "text"){
                // replyMessage()で返信し、そのプロミスをevents_processedに追加。
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "現在地を送ってくだされば私が良いホテルをお探ししますぞ！"
                }));
        }
        //現在地が送られてきた場合
        else if (event.type == "message" && event.message.type == "location") {
            events_processed.push(bot.replyMessage(event.replyToken, {
                type: "text",
                text: `住所が${event.message.address}, そこの緯度は${event.message.latitude}, 経度は${event.message.longitude}です。`
            }));

            var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyB1xac5VrFPOAPvUTV14Th1nCYzgWNZk44" + "&location=" + `${event.message.latitude},${event.message.longitude}` + "&radius=1000" + "&keyword=ラブホテル";
            const https = require('https');
            // 近くのホテルを取得
            https.get(url, function (res) {
                var body = '';
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    body += chunk;
                });
                res.on('data', function (chunk) {
                    // body の値を json としてパースしている
                    res = JSON.parse(body);
                })
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "json",
                    text: res
                }));
            }).on('error', function (e) {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: e.message
                }));
            });
        }
    });

    // すべてのイベント処理が終了したら何個のイベントが処理されたか出力。
    Promise.all(events_processed).then(
        (response) => {
            console.log(`${response.length} event(s) processed.`);
        }
    );
});
