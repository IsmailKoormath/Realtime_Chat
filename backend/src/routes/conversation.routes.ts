import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { body } from "express-validator";
import {
  getConversations,
  createConversation,
  updateConversation,
  addParticipants,
} from "../controllers/conversation.controller";

const router = Router();

router.use(authenticate);

router.get("/", getConversations);

router.post(
  "/",
  [
    body("participantIds")
      .isArray()
      .withMessage("Participants must be an array"),
    body("participantIds.*").isMongoId().withMessage("Invalid participant ID"),
    body("isGroup").optional().isBoolean(),
    body("groupName").optional().isString().trim(),
  ],
  validate,
  createConversation
);

router.patch(
  "/:conversationId",
  [
    body("groupName").optional().isString().trim(),
    body("groupAvatar").optional().isString(),
  ],
  validate,
  updateConversation
);

router.post(
  "/:conversationId/participants",
  [
    body("participantIds")
      .isArray()
      .withMessage("Participants must be an array"),
    body("participantIds.*").isMongoId().withMessage("Invalid participant ID"),
  ],
  validate,
  addParticipants
);

export default router;
