const checkHeader = (req, res, next) => {
    const headerValue = req.headers['x-insta-header'];
    
    if (!headerValue) {
        return res.handler.error('Unauthorized - Missing required Token', 401);
    }
    
    // Optional: You can also validate the header value
    const validHeaderValue = 'fa_223344';
    if (headerValue !== validHeaderValue) {
        return res.handler.error('Unauthorized - Invalid header value', 401);
    }
    
    next();
};

module.exports = checkHeader;