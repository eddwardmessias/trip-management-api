import dayjs from 'dayjs';
import { prisma } from './../lib/prisma';
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z, { email } from "zod";
import id from 'zod/v4/locales/id.js';


export async function getParticipants(app: FastifyInstance) {

  app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/participants', {
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      })
    }

  }, 
  async (request, reply) => {

    const {tripId} = request.params;


    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: { 
        participants: {
          select:{
            id: true,
            name: true,
            email: true,
            is_confirmed: true,
          }  
        }
      }
    })

    if(!trip){
      return new Error('Trip not found'  );
    }


    return {participants: trip.participants };
  },
  )
}
