module.exports = function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      return res.status(400).json({
        message: "Validation failed",
        issues: error.issues || []
      });
    }
  };
};
