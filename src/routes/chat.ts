import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { ChatService } from '../services/chatService';
import { authenticateJWT } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { ResponseUtil } from '../utils/response';

const router = Router();
const chatService = new ChatService();

/**
 * @swagger
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         isPrivate:
 *           type: boolean
 *         maxParticipants:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         content:
 *           type: string
 *         type:
 *           type: string
 *           enum: [text, image, file, system]
 *         userId:
 *           type: string
 *         roomId:
 *           type: string
 *         isEdited:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /chat/rooms:
 *   post:
 *     summary: 채팅방 생성
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: 방 이름
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: 방 설명
 *               isPrivate:
 *                 type: boolean
 *                 description: 비공개 방 여부
 *               maxParticipants:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 description: 최대 참여자 수
 *     responses:
 *       200:
 *         description: 방 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 */
// 방 생성
router.post('/rooms', [
  authenticateJWT,
  body('name').isLength({ min: 1, max: 100 }).withMessage('방 이름은 1-100자여야 합니다.'),
  body('description').optional().isLength({ max: 500 }).withMessage('설명은 500자 이하여야 합니다.'),
  body('isPrivate').optional().isBoolean().withMessage('isPrivate는 boolean이어야 합니다.'),
  body('maxParticipants').optional().isInt({ min: 1, max: 100 }).withMessage('최대 참여자 수는 1-100명이어야 합니다.'),
  validate
], async (req, res) => {
  try {
    const room = await chatService.createRoom({
      name: req.body.name,
      description: req.body.description,
      isPrivate: req.body.isPrivate,
      maxParticipants: req.body.maxParticipants,
      creatorId: req.user.id
    });

    res.json(ResponseUtil.success(room, '방이 생성되었습니다.'));
  } catch (error) {
    res.status(400).json(ResponseUtil.error(error.message));
  }
});

/**
 * @swagger
 * /chat/rooms:
 *   get:
 *     summary: 채팅방 목록 조회
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: 페이지당 항목 수
 *     responses:
 *       200:
 *         description: 방 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Room'
 */
// 방 목록 조회
router.get('/rooms', [
  authenticateJWT,
  query('page').optional().isInt({ min: 1 }).withMessage('페이지는 1 이상이어야 합니다.'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('제한은 1-50이어야 합니다.'),
  validate
], async (req, res) => {
  try {
    const rooms = await chatService.getRooms(req.user.id);
    res.json(ResponseUtil.success(rooms, '방 목록을 조회했습니다.'));
  } catch (error) {
    res.status(400).json(ResponseUtil.error(error.message));
  }
});

/**
 * @swagger
 * /chat/rooms/{roomId}:
 *   get:
 *     summary: 방 상세 정보 조회
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 방 ID
 *     responses:
 *       200:
 *         description: 방 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *       404:
 *         description: 방을 찾을 수 없음
 */
// 방 상세 정보 조회
router.get('/rooms/:roomId', [
  authenticateJWT,
  param('roomId').isUUID().withMessage('유효한 방 ID가 필요합니다.'),
  validate
], async (req, res) => {
  try {
    const room = await chatService.roomRepository.findOne({
      where: { id: req.params.roomId },
      relations: ['participants', 'admins', 'messages']
    });

    if (!room) {
      return res.status(404).json(ResponseUtil.error('방을 찾을 수 없습니다.'));
    }

    res.json(ResponseUtil.success(room, '방 정보를 조회했습니다.'));
  } catch (error) {
    res.status(400).json(ResponseUtil.error(error.message));
  }
});

/**
 * @swagger
 * /chat/rooms/{roomId}/join:
 *   post:
 *     summary: 방 참여
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 방 ID
 *     responses:
 *       200:
 *         description: 방 참여 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *       400:
 *         description: 방 참여 실패 (방이 가득 찼거나 존재하지 않음)
 */
// 방 참여
router.post('/rooms/:roomId/join', [
  authenticateJWT,
  param('roomId').isUUID().withMessage('유효한 방 ID가 필요합니다.'),
  validate
], async (req, res) => {
  try {
    const room = await chatService.joinRoom(req.params.roomId, req.user.id);
    res.json(ResponseUtil.success(room, '방에 참여했습니다.'));
  } catch (error) {
    res.status(400).json(ResponseUtil.error(error.message));
  }
});

/**
 * @swagger
 * /chat/rooms/{roomId}/leave:
 *   post:
 *     summary: 방 나가기
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 방 ID
 *     responses:
 *       200:
 *         description: 방 나가기 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: 방 나가기 실패
 */
// 방 나가기
router.post('/rooms/:roomId/leave', [
  authenticateJWT,
  param('roomId').isUUID().withMessage('유효한 방 ID가 필요합니다.'),
  validate
], async (req, res) => {
  try {
    await chatService.leaveRoom(req.params.roomId, req.user.id);
    res.json(ResponseUtil.success(null, '방을 나갔습니다.'));
  } catch (error) {
    res.status(400).json(ResponseUtil.error(error.message));
  }
});

/**
 * @swagger
 * /chat/rooms/{roomId}/messages:
 *   get:
 *     summary: 방의 메시지 조회
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 방 ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: 조회할 메시지 수
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: 건너뛸 메시지 수
 *     responses:
 *       200:
 *         description: 메시지 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 */
// 방의 메시지 조회
router.get('/rooms/:roomId/messages', [
  authenticateJWT,
  param('roomId').isUUID().withMessage('유효한 방 ID가 필요합니다.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('제한은 1-100이어야 합니다.'),
  query('offset').optional().isInt({ min: 0 }).withMessage('오프셋은 0 이상이어야 합니다.'),
  validate
], async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const messages = await chatService.getRoomMessages(req.params.roomId, limit, offset, req.user.id);
    res.json(ResponseUtil.success(messages, '메시지를 조회했습니다.'));
  } catch (error) {
    res.status(400).json(ResponseUtil.error(error.message));
  }
});

/**
 * @swagger
 * /chat/rooms/{roomId}/messages:
 *   post:
 *     summary: 메시지 전송
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 방 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 description: 메시지 내용
 *               type:
 *                 type: string
 *                 enum: [text, image, file, system]
 *                 default: text
 *                 description: 메시지 타입
 *     responses:
 *       200:
 *         description: 메시지 전송 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: 메시지 전송 실패 (방에 참여하지 않음 또는 권한 없음)
 */
// 메시지 전송
router.post('/rooms/:roomId/messages', [
  authenticateJWT,
  param('roomId').isUUID().withMessage('유효한 방 ID가 필요합니다.'),
  body('content').isLength({ min: 1, max: 1000 }).withMessage('메시지는 1-1000자여야 합니다.'),
  body('type').optional().isIn(['text', 'image', 'file', 'system']).withMessage('유효한 메시지 타입이어야 합니다.'),
  validate
], async (req, res) => {
  try {
    const message = await chatService.sendMessage({
      roomId: req.params.roomId,
      userId: req.user.id,
      content: req.body.content,
      type: req.body.type || 'text'
    });
    res.json(ResponseUtil.success(message, '메시지를 전송했습니다.'));
  } catch (error) {
    res.status(400).json(ResponseUtil.error(error.message));
  }
});

/**
 * @swagger
 * /chat/messages/{messageId}:
 *   put:
 *     summary: 메시지 수정
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 메시지 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 description: 수정할 메시지 내용
 *     responses:
 *       200:
 *         description: 메시지 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: 메시지 수정 실패 (권한 없음 또는 메시지 없음)
 */
// 메시지 수정
router.put('/messages/:messageId', [
  authenticateJWT,
  param('messageId').isUUID().withMessage('유효한 메시지 ID가 필요합니다.'),
  body('content').isLength({ min: 1, max: 1000 }).withMessage('메시지는 1-1000자여야 합니다.'),
  validate
], async (req, res) => {
  try {
    const message = await chatService.editMessage(
      req.params.messageId,
      req.user.id,
      req.body.content
    );
    res.json(ResponseUtil.success(message, '메시지를 수정했습니다.'));
  } catch (error) {
    res.status(400).json(ResponseUtil.error(error.message));
  }
});

/**
 * @swagger
 * /chat/messages/{messageId}:
 *   delete:
 *     summary: 메시지 삭제
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 메시지 ID
 *     responses:
 *       200:
 *         description: 메시지 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: 메시지 삭제 실패 (권한 없음 또는 메시지 없음)
 */
// 메시지 삭제
router.delete('/messages/:messageId', [
  authenticateJWT,
  param('messageId').isUUID().withMessage('유효한 메시지 ID가 필요합니다.'),
  validate
], async (req, res) => {
  try {
    await chatService.deleteMessage(req.params.messageId, req.user.id);
    res.json(ResponseUtil.success(null, '메시지를 삭제했습니다.'));
  } catch (error) {
    res.status(400).json(ResponseUtil.error(error.message));
  }
});

export default router; 