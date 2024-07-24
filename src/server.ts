import fastify from "fastify";
import cors from "@fastify/cors";

import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

import { createTrip } from "./routes/create-trip";
import { confirmTrip } from "./routes/confirm-trip";

import { createActivity } from "./routes/create-activity";
import { getActivities } from "./routes/get-activities";

const app = fastify();

app.register(cors, {
  origin: "*",
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip);
app.register(confirmTrip);

app.register(createActivity);
app.register(getActivities);

app.listen({ port: 3333 })
  .then(() => {
    console.log("HTTP Server listening on: http://localhost:3333 🚀");
  });