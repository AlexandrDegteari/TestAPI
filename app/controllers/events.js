import _ from "lodash";
import moment from "moment";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import EventsSchema from "../models/Events";
import getAccessToken from "../helpers/getAccessToken";
import UserSchema from "../models/User";
import EventSubscribeSchema from "../models/EventSubscribe";
import UserSubscriptionSchema from "../models/UserSubscription";

//Delete event
export const DeleteEventController = async (req, res) => {
  const { id: eventId } = req.params;

  try {
    //should be fix for send error message
    await EventsSchema.findByIdAndRemove(eventId, () => {});

    return res.status(204).send();
  } catch (err) {
    console.log(`${err}`);
    return res
      .status(500)
      .send("Something is not ok! in DeleteEventController");
  }
};

export const CreateEventController = async (req, res) => {
  if (_.isEmpty(req.body)) {
    return res.status(400).send("Body is empty. Please provide all values !");
  }

  const {
    userId,
    title,
    tags,
    description,
    location,
    date,
    images,
    amount
  } = req.body;

  const user = await UserSchema.find({ userId });

  if (!user) {
    return res.status(404).send("User Not found");
  }

  try {
    const eventSchema = new EventsSchema({
      userId,
      title,
      tags,
      description,
      date,
      images,
      amount,
      //images: `http://localhost:8080/uploads/${req.file.filename}`, // the full path is indicated on the front-end side
      created: moment().unix(),
      updated: moment().unix(),
      location
    });

    await eventSchema.save((err, doc) => {
      const eventId = doc.id;

      UserSubscriptionSchema.findOneAndUpdate(
        {
          user_id: userId,
          "events_subscribed.event_id": { $ne: eventId }
        },
        {
          $push: {
            events_subscribed: {
              event_id: eventId,
              subscribed_at: moment().unix()
            }
          }
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        },
        err => {
          if (err) {
            console.log("Something wrong when updating data!");
          }
        }
      );

      const createEventSubscribe = new EventSubscribeSchema({
        event_id: eventId,
        users_subscribed: [
          {
            user_id: userId,
            subscribed_at: moment().unix()
          }
        ]
      });

      createEventSubscribe.save();
    });

    return res.status(201).send("Event was created with success");
  } catch (err) {
    console.log(`${err}`);
    return res.status(500).send("Something is not ok!");
  }
};

//Get all events
export const GetAllEvents = async (req, res) => {
  try {
    const events = await EventsSchema.find({});
    return res.status(200).send(events);
  } catch (err) {
    console.log(`${err}`);
    return res.status(500).send("Something is not ok!");
  }
};

//Get based on time
export const GetAllEventsDay = async (req, res) => {
  try {
    const events = await EventsSchema.find({});

    events.sort((a, b) => a.date - b.date);

    return res.status(200).send(events);
  } catch (err) {
    console.log(`${err}`);
    return res.status(500).send("Something is not ok!");
  }
};

//Get event by id
export const GetEvent = async (req, res) => {
  try {
    // Check if the provided ID is legit
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw "Provided ID is not actually an ID.";
      }
    } catch (e) {
      return res.status(400).send(e);
    }

    const events = await EventsSchema.findById(req.params.id);
    const user = await UserSchema.findById(events.userId);

    return res.status(200).send([events, user]);
  } catch (error) {
    return res.status(500).send("ERROR ::: ", error);
  }
};

//Get all events created by a specific user
export const GetAllEventsCreatedBy = async (req, res) => {
  try {
    const eventsCreatedBy = await EventsSchema.find({
      userId: req.params.userId
    });
    return res.status(200).send(eventsCreatedBy);
  } catch (err) {
    console.log(`${err}`);
    return res.status(500).send("Something is not ok!");
  }
};

export const EventsSubscribedController = async (req, res) => {
  if (_.isEmpty(req.headers) || _.isEmpty(req.headers)) {
    return res
      .status(400)
      .send("Header or body is empty. Please provide all values !");
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

    const eventsSchema = await EventsSchema.find(
      {
        _id: {
          $in: userSubscriptionSchema.events_subscribed.map(event => {
            console.info(event.event_id);
            return mongoose.Types.ObjectId(event.event_id);
          })

          // mongoose.Types.ObjectId('4ed3ede8844f0f351100000c'),
          // mongoose.Types.ObjectId('4ed3f117a844e0471100000d'),
          // mongoose.Types.ObjectId('4ed3f18132f50c491100000e')
        }
      },
      function(err, docs) {
        console.log("ARRAY-UL", docs);
      }
    );

    return res.status(200).send(eventsSchema);
  } catch (e) {
    return res
      .status(500)
      .send(`Error at getting user's subscribed events: ${e}`);
  }
};
