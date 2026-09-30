require("dotenv").config({ path: require("path").join(__dirname, ".env") }); // appliquer automatiquement les varibel d'environnement du fichier .env
const { Tool } = require("./core");
const fs = require("fs").promises; // manipuler des fichiers
const path = require("path");
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

const CACHE_DIR = path.join(__dirname, "cache"); // répertoire de cache pour les données financières

// comprendre l'entreprise
const compagnyOverviewTools = new Tool("compagnyOverview", async (symbol) => {
  if (!symbol) throw new Error("The ticket is required!");

  const cacheFile = path.join(CACHE_DIR, `${symbol}-overview.json`);
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    // verifie si le cache existe
    const cached = await fs.readFile(cacheFile, "utf8");
    console.log(`[compagnyOverviewTool] ✅ Data fecth from cache`);
    return JSON.parse(cached);
  } catch (err) {
    console.log(`[compagnyOverviewTool] 🌐 Data fetch from API pour ${symbol}`);
    const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${encodeURIComponent(symbol)}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    await fs.writeFile(cacheFile, JSON.stringify(data, null, 2), "utf8");
    return data;
  }
});

// Etat financier - le compte de resultat 
const incomeStatementTool = new Tool('incomeStatement', async (symbol)=>{
    if(!symbol) throw new Error(`Symbol required for income statement`);
    const cacheFile = path.join(CACHE_DIR,`${symbol}-incomeStatement.json`);
    try{
        await fs.mkdir(CACHE_DIR, {recursive:true});
        const cache = await fs.readFile(cacheFile,'utf8');
        console.log(`[incomeStatementTool] ✅ data fetched from cache`);
        return JSON.parse(cache);
    }
    catch(err){
        console.log(`[incomeStatementTool] 🌐 data fecth fron API`);
        const url = `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        const res = await fetch(url);
        const data = await res.json();
        const last3Quarters = Array.isArray(data.quarterlyReports) ? data.quarterlyReports.slice(0,3) : [];
        await fs.writeFile(cacheFile, JSON.stringify(last3Quarters,null,2),'utf8');
        return last3Quarters;
    }
});

// Bilan financier 
const balanceSheetTool = new Tool('balanceSheet', async (symbol)=>{
    if(!symbol) throw new Error(`Symbol required for balance sheet`);
    const cacheFile = path.join(CACHE_DIR,`${symbol}-balanceSheet.json`);
    try{
        await fs.mkdir(CACHE_DIR, {recursive:true});
        const cache = await fs.readFile(cacheFile,'utf8');
        console.log(`[balanceSheetTool] ✅ data fetched from cache`);
        return JSON.parse(cache);
    }
    catch(err){
        console.log(`[balanceSheetTool] 🌐 data fecth fron API`);
        const url = `https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        const res = await fetch(url);
        const data = await res.json();
        const last3Quarters = Array.isArray(data.quarterlyReports) ? data.quarterlyReports.slice(0,3) : [];
        await fs.writeFile(cacheFile, JSON.stringify(last3Quarters,null,2),'utf8');
        return last3Quarters;
    }
});

// Resultat financier 
const earnigTool = new Tool('earnings', async (symbol)=>{
    if(!symbol) throw new Error(`Symbol required for earnings`);
    const cacheFile = path.join(CACHE_DIR,`${symbol}-earnings.json`);
    try{
        await fs.mkdir(CACHE_DIR, {recursive:true});
        const cache = await fs.readFile(cacheFile,'utf8');
        console.log(`[earningsTool] ✅ data fetched from cache`);
        return JSON.parse(cache);
    }
    catch(err){
        console.log(`[earningsTool] 🌐 data fecth fron API`);
        const url = `https://www.alphavantage.co/query?function=EARNINGS&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        const res = await fetch(url);
        const data = await res.json();
        const last3Quarters = Array.isArray(data.quarterlyEarnings) ? data.quarterlyEarnings.slice(0,3) : [];
        await fs.writeFile(cacheFile, JSON.stringify(last3Quarters,null,2),'utf8');
        return last3Quarters;
    }
});

// recuperer les actualites d'une entreprise
const newsSentimentTool = new Tool('newsSentiment', async (symbol)=>{
    if(!symbol) throw new Error(`Symbol required for news sentiment`);
    const cacheFile = path.join(CACHE_DIR,`${symbol}-newsSentiment.json`);
    try{
        await fs.mkdir(CACHE_DIR, {recursive:true});
        const cache = await fs.readFile(cacheFile,'utf8');
        console.log(`[newsSentimentTool] ✅ data fetched from cache`);
        return JSON.parse(cache);
    }
    catch(err){
        console.log(`[newsSentimentTool] 🌐 data fecth fron API`);
        const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        const res = await fetch(url);
        const data = await res.json();

        // extraite le titre et le petit resume 
        const news = Array.isArray(data.feed) ? data.feed.map(item => ({
            title: item.title,
            summary: item.summary,})) : [];
        await fs.writeFile(cacheFile, JSON.stringify(news,null,2),'utf8');
        return news;
    }
});

const appendAnalysisTool = new Tool("appendAnalysis", async ({ticker, analysisType,content}) =>{
    if(!ticker || !analysisType) throw new Error(`ticker and analysisType required!`);
    const filename = `analysis-${ticker.toLowerCase()}.md`;
    const section = `## ${analysisType}\n${content ||''}\n\n`
    await fs.appendFile(filename,section,'utf8');
    return `Section ${analysisType} added to ${filename} `

});

const getAnalysisFileTool = new Tool('getAnalysisFile', async (ticker)=>{
    if(!ticker) throw new Error(`Ticker required for getAnalysisFile`);
    const filename = `analysis-${ticker.toLowerCase()}.md`;
    try{
        const content = await fs.readFile(filename,'utf8');
        return content;
    }
    catch(err){
        console.log(`[getAnalysisFileTool] ❌ File ${filename} not found`);
        return null;
    }
});

module.exports = {
    compagnyOverviewTools,
    incomeStatementTool,
    balanceSheetTool,
    earnigTool,
    newsSentimentTool,
    appendAnalysisTool,
    getAnalysisFileTool
};

