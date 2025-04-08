const express = require('express')
const app = express()
const port = process.env.PORT || 54321

// cheerio
const cheerio = require('cheerio');
const htmlparser2 = require("htmlparser2");

console.clear();

const { attachResponseHandler } = require('./utils/responseHandler.js');
app.use(attachResponseHandler);


// to validate the header use `checkHeader` middleware
const checkHeader = require('./utils/headerAuth.js');


const { fetchSnapinstData, getRandomUserAgent, getCsrfTokenAndCookies } = require('./utils/instagramDownloader.js');


app.get('/', async (req, res) => {
    res.handler.success('Hello World!')
})

app.get('/api',async (req, res) => {
    
    if (!req.query.url) {
        return res.handler.error('URL is required');
    }

    var userAgent = getRandomUserAgent();

    var tc = await getCsrfTokenAndCookies({userAgent: userAgent});
    
    const result = await fetchSnapinstData({
        instagramURL: req.query.url,
        token: tc.token,
        userAgent: userAgent,
    });

    // console.log(result);

    if (result == null) {
        return res.handler.notFound('Media not found, [fetchSnapinstData] result is null');
    }

    var data = [];
    const $ = cheerio.load(result);
    // const items = $('div.row').find('div.download-item');
    // for (let i = 0; i < items.length; i++) {
    //     const item = items[i];
    //     const itemUrl = $(item).find('a').attr('href'); 
    //     const a_label = $(item).find('a').text().trim();
    //     const isVideo = a_label == 'Download Photo' ? false : true;        
    //     data.push({
    //       url: itemUrl.replaceAll('&dl=1', ""),
    //       is_video: isVideo,
    //     });
    //   }

    console.log(result);

    const items = $('div.row').find('div.download-item');

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemUrl = $(item).find('a').attr('href'); 
        const a_label = $(item).find('a').text().trim();
    
        const isVideo = a_label == 'Download Photo' ? false : true;
        
        data.push({
          url: itemUrl.replaceAll('&dl=1', ""),
          is_video: isVideo,
        });
      }

      if(data.length == 0){
        return res.handler.error('No results found');
      }

    res.handler.success(data);
})


app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}/api`)
  })