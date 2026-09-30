require('dotenv').config(); // appliquer automatiquement les varibel d'environnement du fichier .env
const fs = require('fs').promises; // manipuler des fichiers 
const { Tool, Agent, Task } = require('./core.js');

const LM_API_URL = process.env.LM_API_URL;
const LM_MODEL = process.env.LM_MODEL;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

if (!LM_API_URL || !LM_MODEL) {
  throw new Error("LM_API_URL and LM_MODEL must be defined in the .env file");
}

const lmStudioTool = new Tool("lmStudio", async (input, systemPrompt= null) => { // envoyer une requete a l'API de LM Studio
    const messages = []; // historique des messages
    if(systemPrompt){
        messages.push({ role: "system", content: systemPrompt }); // instruction system 
    }
    messages.push({ role: "user", content: input }); // message utilisateur
    console.log(`[LM STUDIO] Prompt sent : ${input}`);

    const response = await fetch(LM_API_URL, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ // convertir en JSON
            model: LM_MODEL,
            messages: messages,
        }),
    });
    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim() || '';
    console.log(`[LM STUDIO] Response received : ${result}`);
    return result;
})

const fetchTool = new Tool("fetch", async (url) => { // recuperer le contenu d'une page web
    console.log(`[FETCH] Calling API: ${url}`);
    const response = await fetch(url,{
        header:{
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        }
    });
    const result = await response.text(); // le text de la reponse 
    console.log(`[FETCH] Response received : ${result}`);
     return result
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim(); // supprimer les balises script et style et les balises HTML
})

const fileWriteTool = new Tool("fileWrite", async (filename, content) => { // ecrire du contenu dans un fichier
    console.log(`[WRITE FILE] Writing to file: ${filename}`);
    console.log(`[WRITE FILE] Content: ${content.substring(0, 100)}...`); // afficher les 100 premiers caractères du contenu
    await fs.writeFile(filename, content, 'utf8');
    const result = `File written successfully: ${filename}`;
    console.log(`[WRITE FILE] Successfully wrote to file: ${filename}`);
    return result;
});

const weatherTool = new Tool('weather', async (location)=>{ // recuperer la meteo d'une ville
    console.log(`[WEATHER] Fetching weather for: ${location}`);
    const url = `${process.env.WEATHER_URL}?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Weather API request failed with status ${response.status}`);
    }
    const data = await response.json();
    const result = `Meteo a ${data.location.name}: ${data.current.temp_c}°C, ${data.current.condition.text}, Ressenti: ${data.current.feelslike_c}°C`;
    console.log(`[WEATHER] Response received: ${result}`);
    return result;
})



module.exports = {lmStudioTool, fetchTool, fileWriteTool, weatherTool};