/**
 * Every successful response has the same shape: { data, meta }.
 * Errors use { error: { code, message, details? } } (see middleware/error-handler.js).
 */
function sendData(response, data, meta = {}) {
  response.json({ data, meta: { ...(Array.isArray(data) ? { count: data.length } : {}), ...meta } });
}

module.exports = { sendData };
