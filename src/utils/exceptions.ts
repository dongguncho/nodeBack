export class CustomException extends Error {
  public statusCode: number;
  public errorCode: string;

  constructor(message: string, statusCode: number = 400, errorCode?: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode || 'CUSTOM_ERROR';
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedException extends CustomException {
  constructor(message = '인증이 필요합니다') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenException extends CustomException {
  constructor(message = '접근 권한이 없습니다') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundException extends CustomException {
  constructor(message = '리소스를 찾을 수 없습니다') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictException extends CustomException {
  constructor(message = '리소스 충돌이 발생했습니다') {
    super(message, 409, 'CONFLICT');
  }
}

export class BadRequestException extends CustomException {
  constructor(message = '잘못된 요청입니다') {
    super(message, 400, 'BAD_REQUEST');
  }
} 