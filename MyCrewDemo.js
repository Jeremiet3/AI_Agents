const { weatherTool } = require('./tools');

require('dotenv').config(); // appliquer automatiquement les varibel d'environnement du fichier .env

const LM_API_URL = process.env.LM_API_URL;
const LM_MODEL = process.env.LM_MODEL;

// async function test(){
//      const messages = []; // historique des messages
    
//     messages.push({ role: "user", content: '1+1?' }); // message utilisateur

//     const response = await fetch(LM_API_URL, {
//         method: "POST",

//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ // convertir en JSON
//             model: LM_MODEL,
//             messages: messages,
//         }),
//     });

//     const data = await response.json();
//     const result = data.choices?.[0].message?.content || '';
//     console.log(`[LM STUDIO] Response received : ${result}`);
// }



weatherTool.execute('Paris')

