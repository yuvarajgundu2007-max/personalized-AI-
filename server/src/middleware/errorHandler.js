const errorHandler = (err, req, res, next) => {
  // Don't leak error details in production
  const isDev = process.env.NODE_ENV === 'development';

  console.error('[Error]', {
    message: err.message,
    path: req.path,
    method: req.method,
    ...(isDev && { stack: err.stack }),
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Resource already exists' });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Resource not found' });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: statusCode === 500
      ? 'Internal server error'
      : err.message || 'An error occurred',
    ...(isDev && { details: err.message }),
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };
