// Les classes principales de l'application

// Classe représentant un outil pouvant être utilisé par un agent
class Tool {
  constructor(name, func) {
    this.name = name;
    this.func = func;
  }

  async execute(input) {
    return await this.func(input);
  }
}

// Classe représentant un agent capable d'exécuter des tâches en utilisant des outils
class Agent {
  constructor(name, tools = [], prompt = "") {
    this.name = name;
    this.tools = tools;
    this.prompt = prompt;
  }

  async perform(task, onProgress = null) {
    // rechercher l'outil approprié pour la tâche
    const tool = this.tools.find((t) => t.name === task.toolName);
    if (!tool) {
      const error = `Tool ${task.toolName} not found for agent ${this.name}`;
      if (onProgress)
        onProgress({
          type: "log",
          level: "error",
          message: error,
        });
      throw new Error(error);
    }

    if (onProgress)
      onProgress({
        type: "log",
        level: "info",
        message: `Agent ${this.name} is executing tool ${tool.name}`,
      });

    try {
      // executer l'outil
      const result = await tool.execute(task.input);
      return result;
    } catch (error) {
      if (onProgress)
        onProgress({
          type: "log",
          level: "error",
          message: `Error executing tool ${tool.name}: ${error.message}`,
        });
      throw error;
    }
  }
}

// Classe représentant une tâche à exécuter par un agent
class Task {
  constructor(input, toolName) {
    this.input = input;
    this.toolName = toolName;
  }

}

module.exports = {
  Tool,
  Agent,
  Task,
}; 