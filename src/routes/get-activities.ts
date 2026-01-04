import dayjs from 'dayjs';
import { prisma } from './../lib/prisma';
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";


export async function getActivities(app: FastifyInstance) {

  app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/activities', {
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
        activities: {// include: { activities: true,} 
          orderBy: { 
            occours_at: 'asc' 
          }
        }
      }
    })

    if(!trip){
      return new Error('Trip not found'  );
    }

    const differenceInDaysBetweenTripStartAndNow   = dayjs(trip.ends_at).diff(trip.starts_at, 'day');

    const activities = Array.from({length: differenceInDaysBetweenTripStartAndNow + 1}).map((_, index) => {
      const  date = dayjs(trip.starts_at).add(index, 'day').format('YYYY-MM-DD');

      return {
        date: date.toString(),
        activities: trip.activities.filter(activity => {
          return dayjs(activity.occours_at).isSame(date, 'day')
        })
      }
    })
    

    return {activities };
  },
  )
}
