import fastify from "fastify";
import cors from "@fastify/cors";

import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

import { createTrip } from "./routes/create-trip";
import { confirmTrip } from "./routes/confirm-trip";
import { getTripDetails } from "./routes/get-trip-details";

import { createActivity } from "./routes/create-activity";
import { getActivities } from "./routes/get-activities";
import { updateTrip } from "./routes/update-trip";

import { createLink } from "./routes/create-link";
import { getLinks } from "./routes/get-links";

import { createInvite } from "./routes/create-invite";
import { getParticipants } from "./routes/get-participants";
import { getParticipant } from "./routes/get-participant";

const app = fastify();

app.register(cors, {
  origin: "*",
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip);
app.register(confirmTrip);
app.register(updateTrip);
app.register(getTripDetails);

app.register(createActivity);
app.register(getActivities);

app.register(createLink);
app.register(getLinks);

app.register(createInvite);
app.register(getParticipants);
app.register(getParticipant);

app.listen({ port: 3333 })
  .then(() => {
    console.log("HTTP Server listening on: http://localhost:3333 🚀");
  });