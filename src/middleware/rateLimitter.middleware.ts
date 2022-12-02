import rateLimit from 'express-rate-limit';

const windowMs = 1000; // 1 sec.
const rateLimitterMiddleware = rateLimit({
  windowMs,
  max: 1, // Limit each IP to 1 requests per `window`.
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: `Too many API calls made from this IP, please try again after ${windowMs} milliseconds`,
});

export default rateLimitterMiddleware;
