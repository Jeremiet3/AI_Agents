require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const { Agent, Task } = require("../core");
const { lmStudioTool } = require("../tools");
const {
  compagnyOverviewTools,
  incomeStatementTool,
  balanceSheetTool,
  earnigTool,
  newsSentimentTool,
  appendAnalysisTool,
  getAnalysisFileTool,
} = require("../financeTools");

// -- GLOBAL CONFG --
const TICKER = "AAPL"; // symbole de l'entreprise a analyser
const VERBOSE = true; // afficher les resultats dans la console

// -- AGENTS --
const fetcher = new Agent("FinanceFetcher", [
  compagnyOverviewTools,
  incomeStatementTool,
  balanceSheetTool,
  earnigTool,
  getAnalysisFileTool,
  newsSentimentTool,
]);
const analyst = new Agent(
  "FinanceAnalyst",
  [lmStudioTool],
  "Tu es un expert financier. Analyse les donnees financieres fournies et genere un rapport concis et precis sur la sante financiere de l'entreprise, ses forces, faiblesses, opportunites et menaces. Donne un conseil d'investissement (BUY, HOLD, SELL). Utilise un langage clair et accessible.",
);
const writer = new Agent(
  "FinanceWriter",
  [appendAnalysisTool],
  "Tu es un expert en redaction de rapports financiers. Tu dois organiser les analyses et les conclusions dans un fichier markdown structuré et lisible.",
);

const tasks = [
  new Task(TICKER, "compagnyOverview"),
  new Task(
    "Analyse ces donnees et propose un conseil d'investissement (BUY, HOLD, SELL)",
    "lmStudio",
  ),
  new Task(
    { ticker: TICKER, analysisType: "Overview Analysis", content: "" },
    "appendAnalysis",
  ),

  new Task(TICKER, "incomeStatement"),
  new Task(
    "Analyse ces deonnees du compte de resultat (3 derniers trimestres) et propose un conseil d'investissement (BUY, HOLD, SELL)",
    "lmStudio",
  ),
  new Task(
    { ticker: TICKER, analysisType: "Income Statement Analysis", content: "" },
    "appendAnalysis",
  ),

  new Task(TICKER, "balanceSheet"),
  new Task(
    "Analyse ces deonnees du bilan financier (3 derniers trimestres) et propose un conseil d'investissement (BUY, HOLD, SELL)",
    "lmStudio",
  ),
  new Task(
    { ticker: TICKER, analysisType: "Balance Sheet Analysis", content: "" },
    "appendAnalysis",
  ),

  new Task(TICKER, "earnings"),
  new Task(
    "Analyse ces donnees des resultats financiers (3 derniers trimestres) et propose un conseil d'investissement (BUY, HOLD, SELL)",
    "lmStudio",
  ),
  new Task(
    { ticker: TICKER, analysisType: "Earnings Analysis", content: "" },
    "appendAnalysis",
  ),

  new Task(TICKER, "newsSentiment"),
  new Task(
    "Analyse les donnees financieres basées sur les sentiments des actualités et genere un rapport concis et precis sur la sante financiere de l'entreprise, ses forces, faiblesses, opportunites et menaces. Donne un conseil d'investissement (BUY, HOLD, SELL). Utilise un langage clair et accessible.",
    "lmStudio",
  ),
  new Task(
    { ticker: TICKER, analysisType: "News Sentiment Analysis", content: '' },
    "appendAnalysis",
  ),

  new Task(TICKER, "getAnalysisFile"),
  new Task("Voici l'ensemble des analyses et conclusions sur l'entreprise. Organise-les dans un fichier markdown structuré et lisible.", "lmStudio"),
  new Task(
    { ticker: TICKER, analysisType: "Final Report", content: '' },
    "appendAnalysis",
  ),
];

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
            console.log(`🔄 Etape ${i+1}/${tasks.length} (${percent}%) - Running task with tool: ${toolName}`);

            if (toolName === "lmStudio" && i>0 && lastResult) {
                tasks[i].input = `${tasks[i].input}\n\n${typeof lastResult==='string' ? lastResult : JSON.stringify(lastResult)}`;
            }

            if (toolName === "appendAnalysis" && lastResult) {
                tasks[i].input.content = lastResult;
            }
            lastResult = await agent.perform(tasks[i])

            if(VERBOSE){
                console.log(`✅ Task ${i+1}/${tasks.length} completed with tool: ${toolName}`);
            }
            
            result.push(lastResult);
        }
        console.log("🎉 All tasks completed!");
        return result;
    }
}

const myCrew = new Crew([fetcher, analyst, writer]);
myCrew.run(tasks).then(console.log);
