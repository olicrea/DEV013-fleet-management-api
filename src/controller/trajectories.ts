import { PrismaClient } from '@prisma/client'
import express, { Request, Response } from 'express';

const prisma = new PrismaClient();

export const historialTaxi = async (req: Request, resp: Response) => {
  try {
    // id y date del req se convierten a los tipos correctos
    const id = Number(req.params.id);
    const day = new Date(req.params.day); // sumar n día para usar con lte: menor que 
    console.log('id:', id);
    console.log('day:', day)

    const historial = await prisma.trajectories.findMany({
      where: {
        taxi_id: id,
        date: { gte: day }, // greater than or equal to” (mayor que o igual a)
        // usar lte para establecer límite de búsqueda: https://www.prisma.io/docs/orm/reference/prisma-client-reference#get-all-post-records-where-date_created-is-greater-than-march-19th-2020
        // podría no usar lte y gte?
      },
      orderBy: {
        date: 'asc',
      },
      select: {
        latitude: true,
        longitude: true,
        date: true,
      },
      take: 10,
      skip: 20,
    });

    resp.status(200).json(historial);
  } catch (error) {
    console.error(error);
    return resp.status(500).send("Error getting taxi's locations");
  } finally {
    // Desconexión de Prisma
    await prisma.$disconnect();
}};
