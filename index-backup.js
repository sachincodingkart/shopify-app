const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const crypto = require('crypto');
const cookie = require('cookie');
const nonce = require('nonce')();
const querystring = require('querystring');
const request = require('request-promise');

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;

const forwardingAddress = "https://a23d8ed6.ngrok.io"; // Replace this with your HTTPS Forwarding address

const scopes = 'read_products,write_script_tags';

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(6000, () => {
  console.log('Example app listening on port 6000!');
});



app.get('/shopify', (req, res) => {
	// console.log("sssssssssss");
  const shop = req.query.shop;
  if (shop) {
    const state = nonce();
    const redirectUri = forwardingAddress + '/shopify/callback';
    const installUrl = 'https://' + shop +
      '/admin/oauth/authorize?client_id=' + apiKey +
      '&scope=' + scopes +
      '&state=' + state +
      '&redirect_uri=' + redirectUri;

    res.cookie('state', state);
    res.redirect(installUrl);
     // res.send('Hello World!');
    // console.log(installUrl);
  } else {
    return res.status(400).send('Missing shop parameter. Please add ?shop=your-development-shop.myshopify.com to your request');
  }
});


app.get('/shopify/callback', (req, res) => {
  const { shop, hmac, code, state } = req.query;
  const stateCookie = cookie.parse(req.headers.cookie).state;

  if (state !== stateCookie) {
    return res.status(403).send('Request origin cannot be verified');
  }

  if (shop && hmac && code) {
   const map = Object.assign({}, req.query);
    delete map['signature'];
    delete map['hmac'];
    const message = querystring.stringify(map);
    const providedHmac = Buffer.from(hmac, 'utf-8');
    const generatedHash = Buffer.from(
      crypto
        .createHmac('sha256', apiSecret)
        .update(message)
        .digest('hex'),
        'utf-8'
      );
    let hashEquals = false;
    // timingSafeEqual will prevent any timing attacks. Arguments must be buffers
    try {
      hashEquals = crypto.timingSafeEqual(generatedHash, providedHmac)
    // timingSafeEqual will return an error if the input buffers are not the same length.
    } catch (e) {
      hashEquals = false;
    };

    if (!hashEquals) {
      return res.status(400).send('HMAC validation failed');
    }

    const accessTokenRequestUrl = 'https://' + shop + '/admin/oauth/access_token';
      const accessTokenPayload = {
        client_id: apiKey,
        client_secret: apiSecret,
        code,
      };


   request.post(accessTokenRequestUrl, { json: accessTokenPayload })
    .then((accessTokenResponse) => {
      const accessToken = accessTokenResponse.access_token;
      // DONE: Use access token to make API call to 'script_tags' endpoint
      // const createScriptTagUrl = 'https://' + shop + '/admin/script_tags.json';
      var shop_data = {};
              let sql_user = "SELECT * FROM user_data WHERE shop_name='"+shop+"' ORDER BY id DESC";
              let query_user = conn.query(sql_user, (err, results) => {
                // console.log(results);
               if (results.rows.length>0) 
                  {
                     shop_data['user_data'] =  results.rows;
                     let sql_pro = "SELECT * FROM product_data WHERE shop_name='"+shop+"' ORDER BY id DESC";
                      let query_pro = conn.query(sql_pro, (err, results) => {
                        // console.log(results);
                       if (results.rows.length>0) 
                          {  
                            shop_data['product_data'] =  results.rows;
                            shop_data['current_time'] = new Date().toISOString();
                            res.render('index' ,{ shop_data : shop_data });
                          } 
                   });
                }
               else {
                    // res.render('home',{ shop_data : err });
                   }
             });
      })
    .catch((error) => {
      res.status(error.statusCode).send(error.error.error_description);
    });

    // TODO
    // Validate request is from Shopify
    // Exchange temporary code for a permanent access token
      // Use access token to make API call to 'shop' endpoint
  } else {
    res.status(400).send('Required parameters missing');
  }
});

app.get('/shopify/callback', (req, res) => {
  const { shop, hmac, code, state } = req.query;
  const stateCookie = cookie.parse(req.headers.cookie).state;

  if (state !== stateCookie) {
    return res.status(403).send('Request origin cannot be verified');
  }

  if (shop && hmac && code) {
    // DONE: Validate request is from Shopify
    const map = Object.assign({}, req.query);
    delete map['signature'];
    delete map['hmac'];
    const message = querystring.stringify(map);
    const providedHmac = Buffer.from(hmac, 'utf-8');
    const generatedHash = Buffer.from(
      crypto
        .createHmac('sha256', apiSecret)
        .update(message)
        .digest('hex'),
        'utf-8'
      );
    let hashEquals = false;

    try {
      hashEquals = crypto.timingSafeEqual(generatedHash, providedHmac)
    } catch (e) {
      hashEquals = false;
    };

    if (!hashEquals) {
      return res.status(400).send('HMAC validation failed');
    }

    // DONE: Exchange temporary code for a permanent access token
    const accessTokenRequestUrl = 'https://' + shop + '/admin/oauth/access_token';
    const accessTokenPayload = {
      client_id: apiKey,
      client_secret: apiSecret,
      code,
    };

    request.post(accessTokenRequestUrl, { json: accessTokenPayload })
    .then((accessTokenResponse) => {
      const accessToken = accessTokenResponse.access_token;
      // DONE: Use access token to make API call to 'shop' endpoint
      // const shopRequestUrl = 'https://' + shop + '/admin/api/2020-04/products.json';
      // const shopRequestHeaders = {
      //   'X-Shopify-Access-Token': accessToken,
      // }; 
      
      // res.render('home',{ shop_data : "hello sachin" });
      // request.get(shopRequestUrl, { headers: shopRequestHeaders })
      // .then((shopResponse) => {
            var shop_data = {};
            let sql_user = "SELECT * FROM user_data WHERE shop_name='"+shop+"' ORDER BY id DESC";
            let query_user = conn.query(sql_user, (err, results) => {
              // console.log(results);
             if (results.rows.length>0) 
                {
                   shop_data['user_data'] =  results.rows;
                   let sql_pro = "SELECT * FROM product_data WHERE shop_name='"+shop+"' ORDER BY id DESC";
                    let query_pro = conn.query(sql_pro, (err, results) => {
                      // console.log(results);
                     if (results.rows.length>0) 
                        {  
                          shop_data['product_data'] =  results.rows;
                          shop_data['current_time'] = new Date().toISOString();
                          res.render('index' ,{ shop_data : shop_data });
                        } 
                 });
              }
             else {
                  // res.render('home',{ shop_data : err });
                 }
           });
        // res.status(200).end(shopResponse);
      // })
      // .catch((error) => {
      //   res.status(error.statusCode).send(error.error.error_description);
      // });
    })
    .catch((error) => {
      res.status(error.statusCode).send(error.error.error_description);
    });

  } else {
    res.status(400).send('Required parameters missing');
  }
});