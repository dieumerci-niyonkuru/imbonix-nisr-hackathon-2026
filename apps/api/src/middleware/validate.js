const { badRequest } = require("../utils/http-error");

/**
 * Validate route params and the query string with zod schemas. Valid, parsed values are placed on
 * `request.valid`; anything else becomes a 400 listing each problem.
 */
function validate(schemas) {
  return (request, _response, next) => {
    const valid = {};
    const problems = [];
    for (const part of ["params", "query"]) {
      if (!schemas[part]) continue;
      const result = schemas[part].safeParse(request[part] ?? {});
      if (result.success) valid[part] = result.data;
      else {
        for (const issue of result.error.issues) {
          problems.push({ in: part, field: issue.path.join(".") || null, message: issue.message });
        }
      }
    }
    if (problems.length) return next(badRequest("The request is not valid.", problems));
    request.valid = valid;
    next();
  };
}

module.exports = { validate };
