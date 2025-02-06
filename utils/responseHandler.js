class ApiResponse {
    constructor(res) {
        this.res = res;
    }

    success(data = null, message = 'Success', statusCode = 200) {
        return this.res.status(statusCode).json({
            status: 'success',
            message,
            error: null,
            data
        });
    }

    error(message = 'An error occurred', statusCode = 400, error = null) {
        return this.res.status(statusCode).json({
            status: 'error',
            message,
            error,
            data: null
        });
    }


    notFound(message = 'Not found', statusCode = 404) {
        return this.res.status(statusCode).json({
            status: 'error',
            message,
            error: null,
            data: null
        });
    }
}

// Middleware to attach response handler to each request
const attachResponseHandler = (req, res, next) => {
    res.handler = new ApiResponse(res);
    next();
};

module.exports = {
    ApiResponse,
    attachResponseHandler
};
