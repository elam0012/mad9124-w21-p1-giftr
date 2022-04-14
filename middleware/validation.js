
export default function (req, res, next) {
  const header = req.header('x-api-key')
  if (!header) {
    return res.status(401).send({
      errors: [
        {
          status: '401',
          title: 'validation failed',
          description: 'Missing important header',
        },
      ],
    })
  } else if (header === "yelamin & nikunj") next()
  else {res.status(400).send({
      errors: [
        {
          status: '400',
          title: 'Validation Error',
          description: 'Invalid important header',
        },
      ],
    })
  }
}