import { Router, Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { ResponseUtil } from '../utils/response';
import { authMiddleware } from '../middleware/auth';
import { validateUserUpdate } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: 내 프로필 조회
 *     tags: [사용자]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 프로필 조회 성공
 */
router.get('/profile', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserService.findById(req.user!.id);
    res.json(ResponseUtil.success(user, '프로필 조회가 완료되었습니다'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: 모든 사용자 조회
 *     tags: [사용자]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 목록 조회가 완료되었습니다
 */
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await UserService.findAll();
    res.json(ResponseUtil.success(users, '사용자 목록 조회가 완료되었습니다'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: 특정 사용자 조회
 *     tags: [사용자]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 사용자 조회 성공
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserService.findById(req.params.id);
    res.json(ResponseUtil.success(user, '사용자 조회가 완료되었습니다'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: 사용자 정보 수정
 *     tags: [사용자]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: 사용자 정보 수정 성공
 */
router.patch('/:id', authMiddleware, validateUserUpdate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserService.updateUser(req.params.id, req.body);
    res.json(ResponseUtil.success(user, '사용자 정보 수정이 완료되었습니다'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: 사용자 삭제
 *     tags: [사용자]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 사용자 삭제 성공
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await UserService.deleteUser(req.params.id);
    res.json(ResponseUtil.success(null, '사용자 삭제가 완료되었습니다'));
  } catch (error) {
    next(error);
  }
});

export default router; 