const fs = require('fs');

async function buildOccitanieCities() {
    console.log('Récupération des communes d\'Occitanie...');

    // Code de la région Occitanie = 76
    const response = await fetch('https://geo.api.gouv.fr/communes?codeRegion=76&fields=nom,centre');
    const data = await response.json();

    const cities = data.map(city => ({
        name: city.nom,
        lat: Number(city.centre.coordinates[1].toFixed(4)),
        lng: Number(city.centre.coordinates[0].toFixed(4))
    }));

    // Trie par ordre alphabétique
    cities.sort((a, b) => a.name.localeCompare(b.name, 'fr'));

    const outputPath = './src/assets/data/occitanie-cities.json';

    // S'assure que le dossier existe
    fs.mkdirSync('./src/assets/data', { recursive: true });

    fs.writeFileSync(outputPath, JSON.stringify(cities, null, 2), 'utf-8');
    console.log(`✅ Succès ! ${cities.length} communes d'Occitanie enregistrées dans ${outputPath}`);
}

buildOccitanieCities().catch(console.error);