// -----------------------------------------------------------------------------
// モジュールのインポート
require('dotenv').config(); //ローカル用

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

            //jsonの取得
            var request = require('request');

            var options = {
                // 環境変数からAPI_KEYをセットしています
                url: "https://map.yahooapis.jp/search/local/V1/localSearch?appid=" + process.env.API_KEY + "&lat=" + event.message.latitude + "&lon=" + event.message.longitude + "&dist=5" + "&query=%E3%83%A9%E3%83%96%E3%83%9B%E3%83%86%E3%83%AB" + "&output=json&sort=geo&results=10",
                method: 'GET',
                json: true
            }

            request(options, function (error, response, body) { 
                console.log(body.Feature[0].Name);
                var hotel_name = body.Feature[0].Name;
                // 返信内容
                events_processed.push(bot.replyMessage(event.replyToken, {
                    {
                        "type": "carousel",
                        "contents": [
                          {
                            "type": "bubble",
                            "size": "micro",
                            "hero": {
                              "type": "image",
                              "url": "https://scdn.line-apps.com/n/channel_devcenter/img/flexsnapshot/clip/clip10.jpg",
                              "size": "full",
                              "aspectMode": "cover",
                              "aspectRatio": "320:213"
                            },
                            "body": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": hotel_name,
                                  "weight": "bold",
                                  "size": "sm",
                                  "wrap": true
                                },
                                {
                                  "type": "box",
                                  "layout": "baseline",
                                  "contents": [
                                    {
                                      "type": "icon",
                                      "size": "xs",
                                      "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
                                    },
                                    {
                                      "type": "icon",
                                      "size": "xs",
                                      "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
                                    },
                                    {
                                      "type": "icon",
                                      "size": "xs",
                                      "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
                                    },
                                    {
                                      "type": "icon",
                                      "size": "xs",
                                      "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
                                    },
                                    {
                                      "type": "icon",
                                      "size": "xs",
                                      "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gray_star_28.png"
                                    },
                                    {
                                      "type": "text",
                                      "text": "4.0",
                                      "size": "xs",
                                      "color": "#8c8c8c",
                                      "margin": "md",
                                      "flex": 0
                                    }
                                  ]
                                },
                                {
                                  "type": "box",
                                  "layout": "vertical",
                                  "contents": [
                                    {
                                      "type": "box",
                                      "layout": "baseline",
                                      "spacing": "sm",
                                      "contents": [
                                        {
                                          "type": "text",
                                          "text": "東京旅行",
                                          "wrap": true,
                                          "color": "#8c8c8c",
                                          "size": "xs",
                                          "flex": 5
                                        }
                                      ]
                                    }
                                  ]
                                }
                              ],
                              "spacing": "sm",
                              "paddingAll": "13px"
                            }
                          },
                          {
                            "type": "bubble",
                            "size": "micro",
                            "hero": {
                              "type": "image",
                              "url": "https://scdn.line-apps.com/n/channel_devcenter/img/flexsnapshot/clip/clip11.jpg",
                              "size": "full",
                              "aspectMode": "cover",
                              "aspectRatio": "320:213"
                            },
                            "body": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": "Brow&Cony's Restaurant",
                                  "weight": "bold",
                                  "size": "sm",
                                  "wrap": true
                                },
                                {
                                  "type": "box",
                                  "layout": "baseline",
                                  "contents": [
                                    {
                                      "type": "icon",
                                      "size": "xs",
                                      "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
                                    },
                                    {
                                      "type": "icon",
                                      "size": "xs",
                                      "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
                                    },
                                    {
                                      "type": "icon",
                                      "size": "xs",
                                      "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
                                    },
                                    {
                                      "type": "icon",
                                      "size": "xs",
                                      "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
                                    },
                                    {
                                      "type": "icon",
                                      "size": "xs",
                                      "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gray_star_28.png"
                                    },
                                    {
                                      "type": "text",
                                      "text": "4.0",
                                      "size": "sm",
                                      "color": "#8c8c8c",
                                      "margin": "md",
                                      "flex": 0
                                    }
                                  ]
                                },
                                {
                                  "type": "box",
                                  "layout": "vertical",
                                  "contents": [
                                    {
                                      "type": "box",
                                      "layout": "baseline",
                                      "spacing": "sm",
                                      "contents": [
                                        {
                                          "type": "text",
                                          "text": "東京旅行",
                                          "wrap": true,
                                          "color": "#8c8c8c",
                                          "size": "xs",
                                          "flex": 5
                                        }
                                      ]
                                    }
                                  ]
                                }
                              ],
                              "spacing": "sm",
                              "paddingAll": "13px"
                            }
                          },
                          {
                            "type": "bubble",
                            "size": "micro",
                            "hero": {
                              "type": "image",
                              "url": "https://scdn.line-apps.com/n/channel_devcenter/img/flexsnapshot/clip/clip12.jpg",
                              "size": "full",
                              "aspectMode": "cover",
                              "aspectRatio": "320:213"
                            },
                            "body": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": "Tata",
                                  "weight": "bold",
                                  "size": "sm"
                                },
                                {
                                  "type": "box",
                                  "layout": "baseline",
                                  "contents": [
                                    {
                                      "type": "icon",
                                      "size": "xs",
                                      "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
                                    },
                                    {
                                      "type": "icon",
                                      "size": "xs",
                                      "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
                                    },
                                    {
                                      "type": "icon",
                                      "size": "xs",
                                      "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
                                    },
                                    {
                                      "type": "icon",
                                      "size": "xs",
                                      "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
                                    },
                                    {
                                      "type": "icon",
                                      "size": "xs",
                                      "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gray_star_28.png"
                                    },
                                    {
                                      "type": "text",
                                      "text": "4.0",
                                      "size": "sm",
                                      "color": "#8c8c8c",
                                      "margin": "md",
                                      "flex": 0
                                    }
                                  ]
                                },
                                {
                                  "type": "box",
                                  "layout": "vertical",
                                  "contents": [
                                    {
                                      "type": "box",
                                      "layout": "baseline",
                                      "spacing": "sm",
                                      "contents": [
                                        {
                                          "type": "text",
                                          "text": "東京旅行",
                                          "wrap": true,
                                          "color": "#8c8c8c",
                                          "size": "xs",
                                          "flex": 5
                                        }
                                      ]
                                    }
                                  ]
                                }
                              ],
                              "spacing": "sm",
                              "paddingAll": "13px"
                            }
                          }
                        ]
                      }
                }));
            })

            
            
        }
    });

    // すべてのイベント処理が終了したら何個のイベントが処理されたか出力。
    Promise.all(events_processed).then(
        (response) => {
            console.log(`${response.length} event(s) processed.`);
        }
    );
});
