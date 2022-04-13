import jwt from 'jsonwebtoken'

const jwtPrivateKey = 'superSecureSecret'

const parseToken = function (headerValue) {
  if (headerValue) {
    const [type, token] = headerValue.split(' ')
    if (type === 'Bearer' && typeof token !== 'undefined') {
      return token
    }
    return undefined
  }
}

export default function (req, res, next) {
  const token = parseToken(req.header('Authorization'))
  if (!token) {
    return res.status(401).send({
      errors: [
        {
          status: '401',
          title: 'Authentication failed',
          description: 'Missing bearer token',
        },
      ],
    })
  }

  try {
    const payload = jwt.verify(token, jwtPrivateKey, {algorithms: ['HS256']})
    req.user = { _id: payload.uid }
    next()
  } catch (err) {
    res.status(400).send({
      errors: [
        {
          status: '400',
          title: 'Validation Error',
          description: 'Invalid bearer token',
        },
      ],
    })
  }
}