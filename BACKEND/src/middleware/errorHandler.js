export function notFound(req, res) {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` })
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500
  if (status >= 500) {
    console.error(err)
  }
  res.status(status).json({ error: err.message || 'Internal server error' })
}

/** Wraps an async route handler so rejected promises reach errorHandler via next(). */
export function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next)
}
