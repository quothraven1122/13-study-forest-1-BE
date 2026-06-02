export class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.isOperational = true;
  }
}

export class InvalidPasswordError extends HttpError {
  constructor(message = '비밀번호가 일치하지 않습니다') {
    super(message, 400);
  }
}
