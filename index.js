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
                    text: "現在地を送ってくだされば私が近くのラブホテルをお探ししますぞ！"
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

            //データが1件以上見つかった場合
            if (body.ResultInfo.Count >= 1) {

                var hotel_name = ["情報なし", "情報なし", "情報なし", "情報なし", "情報なし"];
                var hotel_address = ["情報なし", "情報なし", "情報なし", "情報なし", "情報なし"];
                var hotel_tell = ["情報なし", "情報なし", "情報なし", "情報なし", "情報なし"];
                var hotel_map = ["https://www.google.co.jp/maps", "https://www.google.co.jp/maps", "https://www.google.co.jp/maps", "https://www.google.co.jp/maps", "https://www.google.co.jp/maps"]

                //ホテルの名前や住所を配列にセットする
                //情報を5件以上取得できた場合
                if (body.ResultInfo.Count >= 5) {
                    for( var i=0; i<5; i++) {
                        name = body.Feature[i].Name
                        address = body.Feature[i].Property.Address
                        tell = body.Feature[i].Property.Tel1

                        var uri = "https://www.google.co.jp/maps?q=" + name;
                        var map_uri = encodeURI(uri);
    
                        hotel_name.splice(i, 1, name);
                        hotel_address.splice(i, 1, address);
                        hotel_tell.splice(i, 1, tell);
                        hotel_map.splice(i, 1, map_uri);
                    }
                } else {
                    for( var i=0; i<body.ResultInfo.Count; i++) {
                        name = body.Feature[i].Name
                        address = body.Feature[i].Property.Address
                        tell = body.Feature[i].Property.Tel1
    
                        hotel_name.splice(i, 1, name);
                        hotel_address.splice(i, 1, address);
                        hotel_tell.splice(i, 1, tell);
                    }
                }
                
                // 返信内容
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: 'flex',
                    altText: `5km圏内に${body.ResultInfo.Count}件のホテルがあります。`,
                    contents:
                    {
                        "type": "carousel",
                        "contents": [
                          {
                            "type": "bubble",
                            "body": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": hotel_name[0],
                                  "size": "xl",
                                  "weight": "bold"
                                },
                                {
                                  "type": "box",
                                  "layout": "vertical",
                                  "contents": [
                                    {
                                      "type": "box",
                                      "layout": "baseline",
                                      "contents": [
                                        {
                                          "type": "text",
                                          "text": "住所",
                                          "size": "sm",
                                          "color": "#aaaaaa",
                                          "flex": 1
                                        },
                                        {
                                          "type": "text",
                                          "text": hotel_address[0],
                                          "wrap": true,
                                          "color": "#666666",
                                          "size": "md",
                                          "flex": 5
                                        }
                                      ],
                                      "spacing": "sm"
                                    },
                                    {
                                      "type": "box",
                                      "layout": "baseline",
                                      "contents": [
                                        {
                                          "type": "text",
                                          "text": "電話",
                                          "size": "sm",
                                          "color": "#aaaaaa",
                                          "flex": 1
                                        },
                                        {
                                          "type": "text",
                                          "text": hotel_tell[0],
                                          "wrap": true,
                                          "color": "#666666",
                                          "size": "md",
                                          "flex": 5
                                        }
                                      ],
                                      "spacing": "sm"
                                    }
                                  ],
                                  "margin": "lg",
                                  "spacing": "sm"
                                }
                              ]
                            },
                            "footer": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                {
                                  "type": "button",
                                  "action": {
                                    "type": "uri",
                                    "uri": hotel_map[0],
                                    "label": "MAPを開く"
                                  },
                                  "style": "link",
                                  "height": "sm"
                                }
                              ],
                              "spacing": "sm"
                            }
                          },
                          {
                            "type": "bubble",
                            "body": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": hotel_name[1],
                                  "size": "xl",
                                  "weight": "bold"
                                },
                                {
                                  "type": "box",
                                  "layout": "vertical",
                                  "contents": [
                                    {
                                      "type": "box",
                                      "layout": "baseline",
                                      "contents": [
                                        {
                                          "type": "text",
                                          "text": "住所",
                                          "size": "sm",
                                          "color": "#aaaaaa",
                                          "flex": 1
                                        },
                                        {
                                          "type": "text",
                                          "text": hotel_address[1],
                                          "wrap": true,
                                          "color": "#666666",
                                          "size": "md",
                                          "flex": 5
                                        }
                                      ],
                                      "spacing": "sm"
                                    },
                                    {
                                      "type": "box",
                                      "layout": "baseline",
                                      "contents": [
                                        {
                                          "type": "text",
                                          "text": "電話",
                                          "size": "sm",
                                          "color": "#aaaaaa",
                                          "flex": 1
                                        },
                                        {
                                          "type": "text",
                                          "text": hotel_tell[1],
                                          "wrap": true,
                                          "color": "#666666",
                                          "size": "md",
                                          "flex": 5
                                        }
                                      ],
                                      "spacing": "sm"
                                    }
                                  ],
                                  "margin": "lg",
                                  "spacing": "sm"
                                }
                              ]
                            },
                            "footer": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                {
                                  "type": "button",
                                  "action": {
                                    "type": "uri",
                                    "uri": hotel_map[1],
                                    "label": "MAPを開く"
                                  },
                                  "style": "link",
                                  "height": "sm"
                                }
                              ],
                              "spacing": "sm"
                            }
                          },
                          {
                            "type": "bubble",
                            "body": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": hotel_name[2],
                                  "size": "xl",
                                  "weight": "bold"
                                },
                                {
                                  "type": "box",
                                  "layout": "vertical",
                                  "contents": [
                                    {
                                      "type": "box",
                                      "layout": "baseline",
                                      "contents": [
                                        {
                                          "type": "text",
                                          "text": "住所",
                                          "size": "sm",
                                          "color": "#aaaaaa",
                                          "flex": 1
                                        },
                                        {
                                          "type": "text",
                                          "text": hotel_address[2],
                                          "wrap": true,
                                          "color": "#666666",
                                          "size": "md",
                                          "flex": 5
                                        }
                                      ],
                                      "spacing": "sm"
                                    },
                                    {
                                      "type": "box",
                                      "layout": "baseline",
                                      "contents": [
                                        {
                                          "type": "text",
                                          "text": "電話",
                                          "size": "sm",
                                          "color": "#aaaaaa",
                                          "flex": 1
                                        },
                                        {
                                          "type": "text",
                                          "text": hotel_tell[2],
                                          "wrap": true,
                                          "color": "#666666",
                                          "size": "md",
                                          "flex": 5
                                        }
                                      ],
                                      "spacing": "sm"
                                    }
                                  ],
                                  "margin": "lg",
                                  "spacing": "sm"
                                }
                              ]
                            },
                            "footer": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                {
                                  "type": "button",
                                  "action": {
                                    "type": "uri",
                                    "uri": hotel_map[2],
                                    "label": "MAPを開く"
                                  },
                                  "style": "link",
                                  "height": "sm"
                                }
                              ],
                              "spacing": "sm"
                            }
                          },
                          {
                            "type": "bubble",
                            "body": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": hotel_name[3],
                                  "size": "xl",
                                  "weight": "bold"
                                },
                                {
                                  "type": "box",
                                  "layout": "vertical",
                                  "contents": [
                                    {
                                      "type": "box",
                                      "layout": "baseline",
                                      "contents": [
                                        {
                                          "type": "text",
                                          "text": "住所",
                                          "size": "sm",
                                          "color": "#aaaaaa",
                                          "flex": 1
                                        },
                                        {
                                          "type": "text",
                                          "text": hotel_address[3],
                                          "wrap": true,
                                          "color": "#666666",
                                          "size": "md",
                                          "flex": 5
                                        }
                                      ],
                                      "spacing": "sm"
                                    },
                                    {
                                      "type": "box",
                                      "layout": "baseline",
                                      "contents": [
                                        {
                                          "type": "text",
                                          "text": "電話",
                                          "size": "sm",
                                          "color": "#aaaaaa",
                                          "flex": 1
                                        },
                                        {
                                          "type": "text",
                                          "text": hotel_tell[3],
                                          "wrap": true,
                                          "color": "#666666",
                                          "size": "md",
                                          "flex": 5
                                        }
                                      ],
                                      "spacing": "sm"
                                    }
                                  ],
                                  "margin": "lg",
                                  "spacing": "sm"
                                }
                              ]
                            },
                            "footer": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                {
                                  "type": "button",
                                  "action": {
                                    "type": "uri",
                                    "uri": hotel_map[3],
                                    "label": "MAPを開く"
                                  },
                                  "style": "link",
                                  "height": "sm"
                                }
                              ],
                              "spacing": "sm"
                            }
                          },
                          {
                            "type": "bubble",
                            "body": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": hotel_name[4],
                                  "size": "xl",
                                  "weight": "bold"
                                },
                                {
                                  "type": "box",
                                  "layout": "vertical",
                                  "contents": [
                                    {
                                      "type": "box",
                                      "layout": "baseline",
                                      "contents": [
                                        {
                                          "type": "text",
                                          "text": "住所",
                                          "size": "sm",
                                          "color": "#aaaaaa",
                                          "flex": 1
                                        },
                                        {
                                          "type": "text",
                                          "text": hotel_address[4],
                                          "wrap": true,
                                          "color": "#666666",
                                          "size": "md",
                                          "flex": 5
                                        }
                                      ],
                                      "spacing": "sm"
                                    },
                                    {
                                      "type": "box",
                                      "layout": "baseline",
                                      "contents": [
                                        {
                                          "type": "text",
                                          "text": "電話",
                                          "size": "sm",
                                          "color": "#aaaaaa",
                                          "flex": 1
                                        },
                                        {
                                          "type": "text",
                                          "text": hotel_tell[4],
                                          "wrap": true,
                                          "color": "#666666",
                                          "size": "md",
                                          "flex": 5
                                        }
                                      ],
                                      "spacing": "sm"
                                    }
                                  ],
                                  "margin": "lg",
                                  "spacing": "sm"
                                }
                              ]
                            },
                            "footer": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                {
                                  "type": "button",
                                  "action": {
                                    "type": "uri",
                                    "uri": hotel_map[4],
                                    "label": "MAPを開く"
                                  },
                                  "style": "link",
                                  "height": "sm"
                                }
                              ],
                              "spacing": "sm"
                            }
                          }
                        ]
                      }
                    
                }));

            //データが0件だった場合         
            } else {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "すみません、その周辺でラブホテルを見つけることができませんでした。"
                }));
            }
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
