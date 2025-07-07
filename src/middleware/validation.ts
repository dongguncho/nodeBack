import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { BadRequestException } from '../utils/exceptions';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg).join(', ');
    throw new BadRequestException(errorMessages);
  }
  
  next();
};

// 회원가입 유효성 검증
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('이름은 1자 이상 50자 이하여야 합니다'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('비밀번호는 최소 6자 이상이어야 합니다'),
  validate,
];

// 로그인 유효성 검증
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요'),
  body('password')
    .notEmpty()
    .withMessage('비밀번호를 입력해주세요'),
  validate,
];

// 사용자 업데이트 유효성 검증
export const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('이름은 1자 이상 50자 이하여야 합니다'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요'),
  validate,
]; 