const { HttpError, notFound } = require("../utils/http-error");

function notFoundHandler(request, _response, next) {
  next(notFound(`No endpoint at ${request.method} ${request.path}`));
}

/** Turn any error into the standard JSON error shape. Internal details are logged, never sent to the client. */
function errorHandler(logger) {
  // Express recognises error handlers by their four arguments.
  // eslint-disable-next-line no-unused-vars
  return (error, request, response, _next) => {
    // Express gives client mistakes it detects itself (e.g. a malformed URL) a 4xx status. Their messages are shown only
    // when marked safe with `expose`.
    const clientError = !(error instanceof HttpError) && error.status >= 400 && error.status < 500 && error.expose !== false;
    const known =
      error instanceof HttpError
        ? error
        : clientError
          ? new HttpError(error.status, "bad_request", error.expose ? error.message : "The request could not be understood.")
          : null;
    if (!known) logger.error("unhandled error", { requestId: request.id, error: error.message, stack: error.stack });
    // Never let a proxy or browser cache an error, e.g. a 429 or a 500 from a bad deploy.
    response.set("Cache-Control", "no-store");
    response.status(known ? known.status : 500).json({
      error: {
        code: known ? known.code : "internal_error",
        message: known ? known.message : "Something went wrong on our side. Please try again later.",
        ...(known?.details ? { details: known.details } : {}),
        requestId: request.id,
      },
    });
  };
}

module.exports = { notFoundHandler, errorHandler };
