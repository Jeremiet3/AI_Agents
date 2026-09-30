require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const { Tools, Agent, Task } = require("../core");
const { weatherTool, lmStudioTool } = require("../tools");

const CITY = "Netanya, Israel"; // ville pour laquelle on veut la meteo
const VERBOSE = true;

// Agent
const weatherFetcher = new Agent("weaherFetcher", [weatherTool]);
const weatherAnalyst = new Agent(
  "weatherAnalyst",
  [lmStudioTool],
  "Tu es un expert meteorologue. Analyse les donnees meteo fourni et donne des conseils pratiques pour la journee (vetements,activites, precautions) ",
); // analyser les donnees meteo avec LM Studio

// TASKS

const tasks = [
  new Task(CITY, "weather"),
  new Task(
    "Analyse ces donnees meteo et donne des conseils pratiques pour la journee. Sois concis et precis.",
    "lmStudio",
  ),
];

// CREW 

class Crew{
    constructor(agents =[]){
        this.agents = agents;
    }
    async run(tasks=[]){
        const result = [];
        let lastResult = null ;

        for(let i=0;i<tasks.length;i++)
        {
            const agent = this.agents[i%this.agents.length];
            const toolName = tasks[i].toolName;
            const percent = Math.round(((i+1)/tasks.length)*100);
            console.log(`🔄 ${percent}% - Running task with tool: ${toolName}`);

            if (toolName === "lmStudio" && i>0 && lastResult) {
                tasks[i].input = `${tasks[i].input}\n\nDonnées météo: ${lastResult}`;
            }
            lastResult = await agent.perform(tasks[i])

            if(VERBOSE){
                console.log(`✅ Task completed with tool: ${toolName}`);
                console.log(`Result: ${lastResult}`);
            }
            
            result.push(lastResult);
        }
        console.log("🎉 All tasks completed!");
        return result;
    }
}

const myCrew = new Crew([weatherFetcher, weatherAnalyst]);
myCrew.run(tasks).then(console.log);
