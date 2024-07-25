import { FastifyInstance } from "fastify";

import z from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import nodemailer from "nodemailer";

import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mail";
import { dayjs } from "../lib/dayjs";

export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips/:tripId/invites",
    {
      schema: {
        params: z.object({
          tripId: z.string(),
        }),
        body: z.object({
          email: z.string().email(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params;
      const { email } = request.body;

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        }
      });

      if (!trip) {
        throw new Error("Trip not found");
      };

      const participant = await prisma.participant.create({
        data: {
          email,
          trip_id: tripId,
        },
      });

      const mail = await getMailClient();

      const formatedStartDate = dayjs(trip.starts_at).format("LL");
      const formatedEndDate = dayjs(trip.ends_at).format("LL");

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

      return {
        participant_id: participant.id,
      };
    },
  );
};