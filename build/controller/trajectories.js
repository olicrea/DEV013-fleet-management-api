"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lastLocation = exports.historialTaxi = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// https://www.prisma.io/docs/orm/prisma-client/queries/crud#read
let skipHistorial = 0; // Variable para rastrear cuántos registros se han omitido
const historialTaxi = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // id y date del req se convierten a los tipos correctos
        const id = Number(req.params.id);
        // Sobre objeto Date: https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Date
        const day = new Date(req.params.day); // sumar n día para usar con lte: menor que 
        console.log('id:', id);
        console.log('day:', day);
        const historial = yield prisma.trajectories.findMany({
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
            skip: skipHistorial,
        });
        // Incrementa el valor de "skip" en 10 para la próxima solicitud
        skipHistorial += 10;
        // Invierte el orden de los elementos en el array de historial
        const historialInvertido = historial.reverse();
        resp.status(200).json(historialInvertido);
    }
    catch (error) {
        console.error(error);
        return resp.status(500).send("Error getting taxi's locations");
    }
});
exports.historialTaxi = historialTaxi;
// select da más control que include(porque traería todas las propiedades de la tabla relacionada)
let skipLocation = 0;
const lastLocation = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const locations = yield prisma.trajectories.findMany({
            orderBy: {
                date: 'desc',
            },
            select: {
                taxis: {
                    select: {
                        plate: true,
                    }
                },
                taxi_id: true,
                latitude: true,
                longitude: true,
                date: true,
            },
            distinct: ['taxi_id'],
            take: 10,
            skip: skipLocation,
        });
        skipHistorial += 10;
        resp.status(200).json(locations);
    }
    catch (error) {
        console.error(error);
        return resp.status(500).send("Error getting taxies's last locations");
    }
});
exports.lastLocation = lastLocation;
