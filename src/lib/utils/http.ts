import { constants } from 'http2';

export const {
  HTTP_STATUS_OK,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_UNAUTHORIZED,
  HTTP_STATUS_FORBIDDEN,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_CONFLICT,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_SERVICE_UNAVAILABLE,
  HTTP_STATUS_TOO_MANY_REQUESTS
} = constants;

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class HttpBadRequestError extends HttpError {
  constructor(message = 'Bad Request') {
    super(HTTP_STATUS_BAD_REQUEST, message);
  }
}

export class HttpUnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(HTTP_STATUS_UNAUTHORIZED, message);
  }
}

export class HttpForbiddenError extends HttpError {
  constructor(message = 'Forbidden') {
    super(HTTP_STATUS_FORBIDDEN, message);
  }
}

export class HttpNotFoundError extends HttpError {
  constructor(message = 'Not Found') {
    super(HTTP_STATUS_NOT_FOUND, message);
  }
}

export class HttpConflictError extends HttpError {
  constructor(message = 'Conflict') {
    super(HTTP_STATUS_CONFLICT, message);
  }
}

export class HttpRateLimitError extends HttpError {
  constructor(message = 'Rate Limit Exceeded') {
    super(HTTP_STATUS_TOO_MANY_REQUESTS, message);
  }
}

export class HttpInternalServerError extends HttpError {
  constructor(message = 'Internal Server Error') {
    super(HTTP_STATUS_INTERNAL_SERVER_ERROR, message);
  }
}

export class HttpServiceUnavailableError extends HttpError {
  constructor(message = 'Service Unavailable') {
    super(HTTP_STATUS_SERVICE_UNAVAILABLE, message);
  }
}

