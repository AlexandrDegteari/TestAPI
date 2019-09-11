import router from "../helpers/routes";
import { uploadImages } from "../middleware/uploads";
import authChecker from "../middleware/auth";
import ownerEventChecker from "../middleware/event";

import {
  GetAllEvents,
  GetEvent,
  GetAllEventsCreatedBy,
  CreateEventController,
  EventsSubscribedController,
  DeleteEventController,
  GetAllEventsDay
} from "../controllers/events";

router.get("/events", GetAllEvents);
router.get("/events-day/", GetAllEventsDay);
router.get("/events/:id", GetEvent);
router.get("/events/created-by/:userId", GetAllEventsCreatedBy);
router.post("/event", uploadImages.single("images"), CreateEventController);
router.post("/events/subscribed", EventsSubscribedController);
router.delete(
  "/events/:id",
  authChecker,
  ownerEventChecker,
  DeleteEventController
);

module.exports = router;
