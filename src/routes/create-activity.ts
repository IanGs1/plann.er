import { FastifyInstance } from "fastify";

import z from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";

export async function createActivity(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips/:tripId/activities",
    {
      schema: {
        params: z.object({
          tripId: z.string(),
        }),
        body: z.object({
          title: z.string().min(4),
          occurs_at: z.coerce.date(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params;
      const { title, occurs_at } = request.body;

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        }
      });

      if (!trip) {
        throw new Error("Trip not found");
      };

      const doesTheActiviyHappensBeforeTheTrip = dayjs(occurs_at).isBefore(new Date());
      const doesTheActiviyHappensAfterTheTrip = dayjs(occurs_at).isAfter(new Date());

      if (doesTheActiviyHappensBeforeTheTrip) {
        throw new Error("Invalid activity date!");
      };

      if (doesTheActiviyHappensAfterTheTrip) {
        throw new Error("Invalid activity date!");
      };

      const activity = await prisma.activity.create({
        data: {
          title,
          occurs_at,
          trip_id: tripId,
        },
      });

      return {
        activity_id: activity.id,
      };
    },
  );
};