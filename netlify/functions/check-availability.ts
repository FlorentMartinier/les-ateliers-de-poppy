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
    const calendarId = process.env['GOOGLE_CALENDAR_ID'];
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

        // Recherche sur la plage de la journée complète en UTC
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

        // Bornes des trois créneaux horaires
        const morningStart = new Date(`${dateStr}T08:00:00+02:00`).getTime();
        const morningEnd = new Date(`${dateStr}T12:00:00+02:00`).getTime();

        const afternoonStart = new Date(`${dateStr}T14:00:00+02:00`).getTime();
        const afternoonEnd = new Date(`${dateStr}T17:00:00+02:00`).getTime();

        const eveningStart = new Date(`${dateStr}T18:00:00+02:00`).getTime();
        const eveningEnd = new Date(`${dateStr}T21:00:00+02:00`).getTime();

        let isMorningFree = true;
        let isAfternoonFree = true;
        let isEveningFree = true;

        for (const slot of busySlots) {
            if (!slot.start || !slot.end) continue;

            const start = new Date(slot.start).getTime();
            const end = new Date(slot.end).getTime();

            // Chevauchement Matin (8h - 12h)
            if (start < morningEnd && end > morningStart) {
                isMorningFree = false;
            }
            // Chevauchement Après-midi (14h - 17h)
            if (start < afternoonEnd && end > afternoonStart) {
                isAfternoonFree = false;
            }
            // Chevauchement Soir (18h - 21h)
            if (start < eveningEnd && end > eveningStart) {
                isEveningFree = false;
            }
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                morningAvailable: isMorningFree,
                afternoonAvailable: isAfternoonFree,
                eveningAvailable: isEveningFree,
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