import router from "../helpers/routes";

import {
  SubscribeToEventController,
  UserSubscriptionsController,
  UserSubscriptionsListOfId,
  UserSubscriptionsGoogleMaps
} from "../controllers/subscribe";

router.post("/subscribe-to-event/:eventId", SubscribeToEventController);
router.post("/user-subscribed-events-ids", UserSubscriptionsListOfId);
router.post("/user-subscribed-events", UserSubscriptionsController);
router.post("/user-subscribed-events-maps", UserSubscriptionsGoogleMaps);

module.exports = router;
