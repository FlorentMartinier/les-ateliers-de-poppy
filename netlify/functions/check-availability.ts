import { Handler } from '@netlify/functions';
import { google } from 'googleapis';

export const handler: Handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const dateStr = event.queryStringParameters?.['date'];
    const calendarId = "process.env['GOOGLE_CALENDAR_ID']";
    const credentialsJson = process.env['GOOGLE_SERVICE_ACCOUNT_CREDENTIALS'];

    if (!dateStr || !calendarId || !credentialsJson) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Paramètres ou variables manquants.' }),
        };
    }

    try {
        const credentials = JSON.parse(credentialsJson);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
        });

        const calendar = google.calendar({ version: 'v3', auth });

        // Recherche sur toute la journée
        const timeMin = new Date(`${dateStr}T00:00:00Z`).toISOString();
        const timeMax = new Date(`${dateStr}T23:59:59Z`).toISOString();

        const response = await calendar.freebusy.query({
            requestBody: {
                timeMin,
                timeMax,
                items: [{ id: calendarId }],
            },
        });

        const busySlots = response.data.calendars?.[calendarId]?.busy || [];
        console.log('Créneaux occupés:', busySlots);

        // Créneaux horaires (fuseau Europe/Paris +02:00 / +01:00 selon la saison)
        const morningStart = new Date(`${dateStr}T08:00:00+02:00`).getTime();
        const morningEnd = new Date(`${dateStr}T13:00:00+02:00`).getTime();
        const afternoonStart = new Date(`${dateStr}T14:00:00+02:00`).getTime();
        const afternoonEnd = new Date(`${dateStr}T18:00:00+02:00`).getTime();

        let isMorningFree = true;
        let isAfternoonFree = true;

        for (const slot of busySlots) {
            if (!slot.start || !slot.end) continue;

            const start = new Date(slot.start).getTime();
            const end = new Date(slot.end).getTime();

            if (start < morningEnd && end > morningStart) {
                isMorningFree = false;
            }
            if (start < afternoonEnd && end > afternoonStart) {
                isAfternoonFree = false;
            }
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                morningAvailable: isMorningFree,
                afternoonAvailable: isAfternoonFree,
            }),
        };
    } catch (error) {
        console.error('Erreur Google Calendar:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Impossible de vérifier la disponibilité.' }),
        };
    }
};