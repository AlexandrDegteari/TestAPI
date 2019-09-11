import _ from "lodash";
import chalk from "chalk";
import moment from "moment";
import jwt from "jsonwebtoken";
import UserSchema from "../models/User";
import EventSubscribeSchema from "../models/EventSubscribe";
import UserSubscriptionSchema from "../models/UserSubscription";
import EventsSchema from "../models/Events";
import getAccessToken from "../helpers/getAccessToken";

export const SubscribeToEventController = async (req, res) => {
  console.log(chalk.white.bgBlue(" :: ROUTE :: SUBSCRIBE-TO-EVENTS"));

  if (_.isEmpty(req.params)) {
    return res
      .status(400)
      .send(
        "Parameter list is empty. Please provide all the required parameters!"
      );
  }

  try {
    const { id: userId } = await jwt.decode(getAccessToken(req));

    const { eventId } = req.params;

    const event = await EventsSchema.findById(eventId);

    if (!event) {
      return res.status(404).send("Event not found");
    }

    const user = await UserSchema.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    const eventSubscribeSchema = await EventSubscribeSchema.findOneAndUpdate(
      {
        event_id: event.id,
        "users_subscribed.user_id": { $ne: user.id }
      },
      {
        $push: {
          usersSubscribed: {
            id: user.id,
            subscribedAt: moment().unix()
          }
        }
      }
    );

    const userSubscriptionSchema = await UserSubscriptionSchema.findOneAndUpdate(
      {
        user_id: user.id,
        "events_subscribed.event_id": { $ne: event.id }
      },
      {
        $push: {
          events_subscribed: {
            event_id: event.id,
            subscribed_at: moment().unix()
          }
        }
      }
    );

    if (!eventSubscribeSchema || !userSubscriptionSchema) {
      return res.status(409).send("You are already subscribed.");
    }

    return res.status(200).send("OK");
  } catch (err) {
    return res.status(500).send("Eroare cauzata", err);
  }
};

export const UserSubscriptionsController = async (req, res) => {
  if (_.isEmpty(req.headers)) {
    return res
      .status(400)
      .send(
        "Parameter list is empty. Please provide all the required parameters!"
      );
  }

  try {
    const { id: userId } = await jwt.decode(getAccessToken(req));

    const user = await UserSchema.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    const userSubscriptionSchema = await UserSubscriptionSchema.findOne({
      user_id: userId
    });

    // Duplicated from events -- needs to be removed/refactored
    const eventsId = [];

    userSubscriptionSchema.events_subscribed.map(event => {
      eventsId.push(event.event_id);
    });

    const eventsList = await EventsSchema.find({
      _id: { $in: eventsId.map(id => id) }
    });

    eventsList.sort((a, b) => a.date - b.date);

    // Full info
    return res.status(200).send(eventsList);
  } catch (e) {
    return res.status(500).send(`Error: ${Error}`);
  }
};

export const UserSubscriptionsListOfId = async (req, res) => {
  if (_.isEmpty(req.headers)) {
    return res
      .status(400)
      .send(
        "Parameter list is empty. Please provide all the required parameters!"
      );
  }

  try {
    const { id: userId } = await jwt.decode(getAccessToken(req));

    const user = await UserSchema.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    const userSubscriptionSchema = await UserSubscriptionSchema.findOne({
      user_id: userId
    });

    // Duplicated from events -- needs to be removed/refactored
    const eventsId = [];

    userSubscriptionSchema.events_subscribed.map(event => {
      eventsId.push(event.event_id);
    });

    const eventsList = await EventsSchema.find({
      _id: { $in: eventsId.map(id => id) }
    });

    // Only events id
    const eventsListId = eventsList.map(event => event._id);

    return res.status(200).send(eventsListId);
  } catch (e) {
    return res.status(500).send(`Error: ${Error}`);
  }
};

export const UserSubscriptionsGoogleMaps = async (req, res) => {
  if (_.isEmpty(req.headers)) {
    return res
      .status(400)
      .send(
        "Parameter list is empty. Please provide all the required parameters!"
      );
  }

  try {
    const { id: userId } = await jwt.decode(getAccessToken(req));

    const user = await UserSchema.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    const userSubscriptionSchema = await UserSubscriptionSchema.findOne({
      user_id: userId
    });

    // Duplicated from events -- needs to be removed/refactored
    const eventsId = [];

    userSubscriptionSchema.events_subscribed.map(event => {
      eventsId.push(event.event_id);
    });

    const eventsList = await EventsSchema.find({
      _id: { $in: eventsId.map(id => id) }
    });

    const eventsListMaps = eventsList.map(event => {
      return {
        location: {
          lat: event.location.latitude,
          lng: event.location.longitude
        },
        stopover: true,
        date: event.date
      };
    });

    eventsListMaps.sort((a, b) => a.date - b.date);
    eventsListMaps.map(event => delete event.date);

    console.log("MAPS ::: ", eventsListMaps);

    return res.status(200).send(eventsListMaps);
  } catch (e) {
    return res.status(500).send(`Error: ${Error}`);
  }
};
