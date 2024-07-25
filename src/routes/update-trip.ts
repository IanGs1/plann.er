import { FastifyInstance } from "fastify";

import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { dayjs } from "../lib/dayjs";

import { prisma } from "../lib/prisma";

export async function updateTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/trips/:tripId/", 
    {
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      }),
      body: z.object({
        destination: z.string().min(4),
        starts_at: z.coerce.date(),
        ends_at: z.coerce.date(),
      }),
    },
  }, async (request, reply) => {
    const { tripId } = request.params;
    const { destination, starts_at, ends_at } = request.body;

    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
      },
    });

    if (!trip) {
      throw new Error("Trip not found");
    }

    const startsAtDateIsInvalid = dayjs(starts_at).isBefore(new Date());
    if (startsAtDateIsInvalid) {
      throw new Error("Invalid Trip Start Date");
    };

    const endsAtDateIsInvalid = dayjs(ends_at).isBefore(starts_at);
    if (endsAtDateIsInvalid) {
      throw new Error("Invalid Trip End Date");
    };

    await prisma.trip.update({
      where: {
        id: tripId,
      },
      data: {
        destination,
        starts_at,
        ends_at,
      },
    });

    return {
      tripId: trip.id,
    };
  });
};