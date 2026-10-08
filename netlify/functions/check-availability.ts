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


        // Helper pour générer un timestamp exact au fuseau Europe/Paris (gère heure d'été/hiver automatiquement)
        const getParisTimestamp = (date: string, time: string): number => {
            // Détermine l'offset dynamique de Paris pour la date ciblée
            const sample = new Date(`${date}T12:00:00Z`);
            const tzString = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Europe/Paris',
                timeZoneName: 'shortOffset',
            }).format(sample);

            const match = tzString.match(/GMT([+-]\d+)/);
            const offset = match ? (parseInt(match[1], 10) >= 0 ? `+${String(match[1]).padStart(2, '0')}:00` : `${match[1]}:00`) : '+01:00';

            return new Date(`${date}T${time}${offset}`).getTime();
        };

        // Bornes des trois créneaux horaires
        const morningStart = getParisTimestamp(dateStr, '08:00:00');
        const morningEnd = getParisTimestamp(dateStr, '12:00:00');

        const afternoonStart = getParisTimestamp(dateStr, '14:00:00');
        const afternoonEnd = getParisTimestamp(dateStr, '17:00:00');

        const eveningStart = getParisTimestamp(dateStr, '18:00:00');
        const eveningEnd = getParisTimestamp(dateStr, '21:00:00');

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