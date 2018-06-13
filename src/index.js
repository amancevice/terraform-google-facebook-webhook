const config = require('./config.json');

/**
 * Log event info.
 *
 * @param {object} req Cloud Function request context.
 */
function logEvent(req) {
  console.log(`HEADERS ${JSON.stringify(req.headers)}`);
  console.log(`EVENT ${JSON.stringify(req.body.event)}`);
  return req;
}

/**
 * Verify request contains proper validation token.
 *
 * @param {object} req Cloud Function request context.
 */
function verifyToken(req) {
  // Verify token
  if (!req.query || req.query['hub.verify_token'] !== config.facebook.verification_token) {
    const error = new Error('Invalid Credentials');
    error.code = 401;
    throw error;
  }
  return req;
}

/**
 * Send OK HTTP response back to requester.
 *
 * @param {object} req Cloud Function request context.
 * @param {object} res Cloud Function response context.
 */
function sendResponse(req, res) {
  if (req.query['hub.mode'] === 'subscribe') {
    console.log('CHALLENGE');
    res.send(req.query['hub.challenge']);
  } else {
    console.log('OK');
    res.send();
  }
  return req;
}

/**
 * Send Error HTTP response back to requester.
 *
 * @param {object} err The error object.
 * @param {object} req Cloud Function request context.
 */
function sendError(err, res) {
  console.error(err);
  res.status(err.code || 500).send(err);
  return Promise.reject(err);
}

/**
 * Responds to any HTTP request that can provide a "message" field in the body.
 *
 * @param {object} req Cloud Function request context.
 * @param {object} res Cloud Function response context.
 */
exports.webhook = (req, res) => {
  Promise.resolve(req)
    .then(logEvent)
    .then(verifyToken)
    .then((req) => sendResponse(req, res))
    .catch((err) => sendError(err, res));
}
