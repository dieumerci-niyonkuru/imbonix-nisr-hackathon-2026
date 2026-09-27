/** An error with an HTTP status and a stable, machine-readable code, turned into JSON by the error handler. */
class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const badRequest = (message, details) => new HttpError(400, "bad_request", message, details);
const notFound = (message = "Not found") => new HttpError(404, "not_found", message);

module.exports = { HttpError, badRequest, notFound };
