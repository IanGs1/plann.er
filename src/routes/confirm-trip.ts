import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { z } from "zod";

import nodemailer from "nodemailer";

import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";

export async function confirmTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get("/trips/:tripId/confirm", {
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      }),
    },
  }, async (request, reply) => {
    const { tripId } = request.params;

    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        participants: {
          where: {
            is_owner: false,
          },
        },
      },
    });

    if (!trip) {
      throw new Error("Trip not found!");
    };

    if (trip.is_confirmed) {
      // Redirecting to the Front End page;
      return reply.redirect("http://localhost:3000");
    };

    await prisma.trip.update({
      where: {
        id: tripId,
      },
      data: {
        is_confirmed: true,
      },
    });

    const formatedStartDate = dayjs(trip.starts_at).format("LL")
    const formatedEndDate = dayjs(trip.ends_at).format("LL")
      
    const mail = await getMailClient();

    await Promise.all(
      trip.participants.map(async (participant) => {
        const confirmationLink = `http://localhost:3333/trips/${trip.id}/confirm/${participant.id}`;

        const message = await mail.sendMail({
          from: {
            name: "Equipe plann.er",
            address: "oi@plann.er",
          },
          to: participant.email,
          subject: `Confirme sua presença na viagem para ${trip.destination} em ${formatedStartDate}`,
          html: `
            <div style="font-family: sans-serif; font-size: 16px; line-height: 160%">
              <p>Você foi convidado para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formatedStartDate}</strong> até <strong>${formatedEndDate}</strong></strong></p>
              <p></p>
              <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
              <p></p>
              <p>
                <a href=${confirmationLink}>Confirmar viagem</a>
              </p>
              <p></p>
              <p>Caso você não saiba do que se trata esse e-mail, apenas ignore-o</p>
            </div>
          `.trim(),
        });
    
        console.log(nodemailer.getTestMessageUrl(message));
      }),
    );

    return reply.redirect("http://localhost:3000");
  });
};