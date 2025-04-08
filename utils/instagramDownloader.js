// utils/instagramDownloader.js

// axios
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Decodes a string using a custom base conversion algorithm
 * @param {string} d - Input string to decode
 * @param {number} e - Source base
 * @param {number} f - Target base
 * @returns {string} Decoded string
 */
function decode(d, e, f) {
    const charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/";
    const baseChars = charset.split('').slice(0, e);
    const targetChars = charset.split('').slice(0, f);
    
    const num = d.split('')
        .reverse()
        .reduce((acc, char, idx) => {
            const charIndex = baseChars.indexOf(char);
            return charIndex !== -1 ? acc + (charIndex * Math.pow(e, idx)) : acc;
        }, 0);
    
    if (num === 0) return '0';
    
    let result = '';
    let remaining = num;
    
    while (remaining > 0) {
        result = targetChars[remaining % f] + result;
        remaining = Math.floor(remaining / f);
    }
    
    return result;
}

/**
 * Deobfuscates encoded content
 * @param {string} h - Encoded content
 * @param {number} u - Parameter 1
 * @param {string} n - Key string
 * @param {number} t - Offset
 * @param {number} e - Base
 * @param {number} r - Parameter 2
 * @returns {string} Deobfuscated content
 */
function deobfuscate(h, u, n, t, e, r) {
    let result = '';
    
    for (let i = 0; i < h.length; i++) {
        let segment = '';
        while (i < h.length && h[i] !== n[e]) {
            segment += h[i];
            i++;
        }
        
        for (let j = 0; j < n.length; j++) {
            segment = segment.replace(new RegExp(n[j], 'g'), j);
        }
        
        const decodedValue = decode(segment, e, 10) - t;
        result += String.fromCharCode(decodedValue);
    }
    
    return decodeURIComponent(escape(result));
}

/**
 * Processes obfuscated code from response
 * @param {string} response - Raw response from server
 * @returns {string} Processed code
 */
function processObfuscatedCode(response) {
    const regex = /eval\s*\(\s*function\s*\(\w+,\w+,\w+,\w+,\w+,\w+\)\s*\{\s*.*?\}\s*\(\s*("[^"]+"),\s*(\d+),\s*"([^"]+)",\s*(\d+),\s*(\d+),\s*(\d+)\s*\)\s*\)/s;
    const match = response.match(regex);

    if (match) {
        const [_, obfuscatedString, num1, keyString, num2, num3, num4] = match;
        const cleanString = obfuscatedString.replace(/^"|"$/g, '');
        
        try {
            return deobfuscate(cleanString, parseInt(num1), keyString, parseInt(num2), parseInt(num3), parseInt(num4));
        } catch (error) {
            return `Deobfuscation error: ${error.message}`;
        }
    }
    
    return 'No obfuscated code found to process';
}

/**
 * Extracts innerHTML from processed code
 * @param {string} code - Processed code
 * @returns {string|null} Extracted HTML content
 */
function extractInnerHTML(code) {
    const regex = /document\.getElementById\("download"\)\.innerHTML\s*=\s*("([^"\\]|\\.)*"|'([^'\\]|\\.)*')/;
    const match = code.match(regex);
    
    if (match) {
        return match[1]
            .slice(1, -1)
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            .replace(/\\\\/g, "\\");
    }
    
    return null;
}

/**
 * Fetches and processes Instagram post data
 * @param {string} instagramURL - Instagram post URL
 * @param {string} token - Authentication token
 * @param {string} cfTurnstileResponse - Cloudflare turnstile response
 * @returns {Promise<string|null>} Processed result
 */
async function fetchSnapinstData({instagramURL, token, cfTurnstileResponse = '', userAgent = null} = {}) {
    try {
        const formData = new FormData();
        formData.append("url", instagramURL);
        formData.append("action", "post");
        formData.append("lang", "");
        formData.append("cf-turnstile-response", cfTurnstileResponse);
        formData.append("token", token);

        // const response = await fetch("https://snapinst.app/action2.php", {
        //     method: "POST",
        //     headers: {
        //         "Accept": "*/*",
        //         "Referer": "https://snapinst.app/",
        //         "Referrer-Policy": "strict-origin-when-cross-origin",
        //         "User-Agent": userAgent || getRandomUserAgent(),
        //     },
        //     body: formData
        // });

        const response = await fetch("https://snapins.ai/action2.php", {
            method: "POST",
            headers: {
                "Accept": "*/*",
                "Referer": "https://snapins.ai/",
                "Referrer-Policy": "strict-origin-when-cross-origin",
                "User-Agent": userAgent || getRandomUserAgent(),
            },
            body: formData
        });

        // console.log(`userAgent: ${userAgent}`);
        const result = await response.text();
        // console.log(result);
        const resultJavaScript = processObfuscatedCode(result);
        return extractInnerHTML(resultJavaScript);
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}



const userAgents = [
    // Chrome on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    
    // Firefox on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:118.0) Gecko/20100101 Firefox/118.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:117.0) Gecko/20100101 Firefox/117.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:116.0) Gecko/20100101 Firefox/116.0',
    
    // Safari on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15',
    
    // Chrome on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    
    // Mobile Chrome on Android
    'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.163 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.163 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36',
    
    // Samsung Browser
    'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/22.0 Chrome/111.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/22.0 Chrome/111.0.0.0 Mobile Safari/537.36',
    
    // Mobile Safari on iOS
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 17_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    
    // Microsoft Edge
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.91',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.2151.97',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.2088.76',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.91',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.2151.97',
    
    // Opera
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
    
    // UC Browser
    'Mozilla/5.0 (Linux; U; Android 13; en-US; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/78.0.3904.108 UCBrowser/13.4.0.1306 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; U; Android 12; en-US; SM-A525F) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/78.0.3904.108 UCBrowser/13.4.0.1306 Mobile Safari/537.36',
    
    // Brave Browser
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Brave/120.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Brave/120.0.0.0',
    
    // Vivaldi
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Vivaldi/6.5.3206.53',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Vivaldi/6.5.3206.53',
    
    // DuckDuckGo Browser
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 DuckDuckGo/7 Mobile/15E148 Safari/605.1.15',
    'Mozilla/5.0 (iPad; CPU OS 17_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 DuckDuckGo/7 Mobile/15E148 Safari/605.1.15',
    
    // Firefox Focus
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/120.0 Mobile/15E148 Safari/605.1.15',
    'Mozilla/5.0 (iPad; CPU OS 17_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/120.0 Mobile/15E148 Safari/605.1.15'
];

function getRandomUserAgent() {
    const randomIndex = Math.floor(Math.random() * userAgents.length);
    return userAgents[randomIndex];
}


async function getCsrfTokenAndCookies({userAgent = null, host = 'snapins.ai',  selector = 'input[name="token"]', attribute = 'value'} = {}) {
    const headers = {
        'Host': host,
        'User-Agent': userAgent || getRandomUserAgent(),
    };
    // console.log(`userAgent: ${userAgent}`);
    try {
      // Make an HTTP GET request to the webpage
      const response = await axios.get(`https://${host}`, { headers });
      const html = response.data;
      // const serverTime = response.headers['date'];
      // const timestamp = new Date(serverTime).getTime();
      // Use cheerio to parse the HTML
      const $ = cheerio.load(html);
      // Extract the CSRF token from meta tags
      // Adjust the selector as needed based on the meta tag's name or property
      const csrfToken = $(selector).attr(attribute);
      const cookies = response.headers['set-cookie'];
      return { 'token': csrfToken, 'cookies': cookies };
    } catch (error) {
      console.error('Error fetching CSRF Token:', error);
      return null;
    }
  }

module.exports = { fetchSnapinstData, getRandomUserAgent, getCsrfTokenAndCookies };
