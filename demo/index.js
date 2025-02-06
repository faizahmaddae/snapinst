
// async function fetchSnapinstData(instagramURL, token, cfTurnstileResponse = '') {
//     try {
//         // Construct FormData
//         const formData = new FormData();
//         formData.append("url", instagramURL);
//         formData.append("action", "post");
//         formData.append("lang", "");
//         formData.append("cf-turnstile-response", cfTurnstileResponse);
//         formData.append("token", token);

//         // Send the POST request
//         const response = await fetch("https://snapinst.app/action2.php", {
//             method: "POST",
//             headers: {
//                 "Accept": "*/*",
//                 "Referer": "https://snapinst.app/",
//                 "Referrer-Policy": "strict-origin-when-cross-origin",
//                 // "Cookie": "_ga=GA1.1.238697687.1738796831; __gads=ID=8ac1aec0e5ded34c:T=1738796830:RT=1738796830:S=ALNI_Mb-GjLN5bCBNzWo96FTPKd2jGeLeA; __gpi=UID=00000fe2ec60505f:T=1738796830:RT=1738796830:S=ALNI_MZfRQuzuoM7-kI6jrnAWdhZ0a1LfA; __eoi=ID=e094c09ee4a62301:T=1738796830:RT=1738796830:S=AA-AfjYVQhyLSw7iNBRnECy5dzPo; _ga_KRGK6ZLJ70=GS1.1.1738796830.1.0.1738796871.0.0.0"
//             },
//             body: formData
//         });

//         // Parse response
//         const result = await response.text();
//         // console.log("Response:", result);
//         const resultJavaScript = processObfuscatedCode(result);
//         // console.log(result);
//         const html = extractInnerHTML(resultJavaScript);
//         console.log(html);
//         return result;
//     } catch (error) {
//         console.error("Error fetching data:", error);
//     }
// }

// // Example usage
// fetchSnapinstData(
//     "https://www.instagram.com/p/C77O7JmO4PI/?img_index=1",
//     "e8MTczODc5NjQ3OA==c"
// );



// function extractInnerHTML(code) {
//     // Find the innerHTML assignment
//     const regex = /document\.getElementById\("download"\)\.innerHTML\s*=\s*("([^"\\]|\\.)*"|'([^'\\]|\\.)*')/;
//     const match = code.match(regex);
    
//     if (match) {
//         // Get the string value (including quotes)
//         const htmlString = match[1];
        
//         // Remove the outer quotes and unescape the string
//         const unescaped = htmlString
//             .slice(1, -1) // Remove first and last quotes
//             .replace(/\\"/g, '"') // Replace \" with "
//             .replace(/\\'/g, "'") // Replace \' with '
//             .replace(/\\\\/g, "\\"); // Replace \\ with \
            
//         return unescaped;
//     }
    
//     return null;
// }


// // Fixed deobfuscation implementation
// function decode(d, e, f) {
//     // Create character set for encoding/decoding
//     const charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/";
    
//     // Get subsets of charset based on parameters
//     const baseChars = charset.split('').slice(0, e);
//     const targetChars = charset.split('').slice(0, f);
    
//     // Convert input string to number using custom base
//     const num = d.split('')
//         .reverse()
//         .reduce((acc, char, idx) => {
//             const charIndex = baseChars.indexOf(char);
//             if (charIndex !== -1) {
//                 return acc + (charIndex * Math.pow(e, idx));
//             }
//             return acc;
//         }, 0);
    
//     // Convert number back to string in target base
//     let result = '';
//     let remaining = num;
    
//     if (remaining === 0) return '0';
    
//     while (remaining > 0) {
//         result = targetChars[remaining % f] + result;
//         remaining = Math.floor(remaining / f);
//     }
    
//     return result;
// }

// function deobfuscate(h, u, n, t, e, r) {
//     let result = '';
    
//     for (let i = 0; i < h.length; i++) {
//         let segment = '';
        
//         // Collect characters until delimiter is found
//         while (i < h.length && h[i] !== n[e]) {
//             segment += h[i];
//             i++;
//         }
        
//         // Replace each character in the key with its index
//         for (let j = 0; j < n.length; j++) {
//             segment = segment.replace(new RegExp(n[j], 'g'), j);
//         }
        
//         // Decode the segment and convert to character
//         const decodedValue = decode(segment, e, 10) - t;
//         result += String.fromCharCode(decodedValue);
//     }
    
//     // Final decoding of URI-encoded characters
//     return decodeURIComponent(escape(result));
// }

// // Example usage:
// function processObfuscatedCode(response) {
//     const regex = /eval\s*\(\s*function\s*\(\w+,\w+,\w+,\w+,\w+,\w+\)\s*\{\s*.*?\}\s*\(\s*("[^"]+"),\s*(\d+),\s*"([^"]+)",\s*(\d+),\s*(\d+),\s*(\d+)\s*\)\s*\)/s;
//     const match = response.match(regex);

//     if (match) {
//         const [_, obfuscatedString, num1, keyString, num2, num3, num4] = match;
        
//         // Remove quotes from string
//         const cleanString = obfuscatedString.replace(/^"|"$/g, '');
        
//         try {
//             const result = deobfuscate(cleanString, parseInt(num1), keyString, parseInt(num2), parseInt(num3), parseInt(num4));
//             return result;
//         } catch (error) {
//             return `Deobfuscation error: ${error.message}`;
//         }
//     }
    
//     return 'No obfuscated code found to process';
// }