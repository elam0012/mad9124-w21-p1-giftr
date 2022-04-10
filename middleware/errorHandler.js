const formatValidationError = function(errors) {
  return Object.values(errors).map(e => ({
    status: '400',
    title: 'Validation Error',
    detail: e.message,
    source: {pointer: `/data/attributes/${e.path}`, value: e.value}
  }))
}

const formatServerError = function (err) {
  return [
    {
      status: '500',
      title: 'Server error',
      description: err.message || 'Please check the logs',
    },
  ]
}


export default function handleError (err, req, res, next) {
  const isValidationError = err?.name === 'ValidationError'
  const code = isValidationError ? 400 : err.code || 500

  let payload = [err]
  if (code === 400) payload = formatValidationError(err.errors)
  if (code === 500) payload = formatServerError(err)

  res.status(code).send({ errors: payload })
}