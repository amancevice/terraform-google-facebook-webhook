const config = require('./config.json');
const service = require('./client_secret.json');
const { google } = require('googleapis');
const pubsub = google.pubsub({
    version: 'v1',
    auth: new google.auth.JWT(
      service.client_email,
      './client_secret.json',
      null,
      ['https://www.googleapis.com/auth/pubsub'])
  });

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
 * Publish event to PubSub topic (if it's not a retry).
 *
 * @param {object} req Cloud Function request context.
 */
function publishEvent(req) {
  // Publish event to PubSub unless it is a `subscribe` event
  if (req.query['hub.mode'] !== 'subscribe') {
    return pubsub.projects.topics.publish({
        topic: `projects/${config.google.project}/topics/${config.google.topic}`,
        resource: {
          messages: [
            {
              data: Buffer.from(JSON.stringify(req.body)).toString('base64')
            }
          ]
        }
      })
      .then((pub) => {
        console.log(`PUB/SUB ${JSON.stringify(pub.data)}`);
        return req;
      });
  }

  // Resolve request without publishing
  return Promise.resolve(req);
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
