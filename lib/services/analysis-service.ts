import { streamAnalysis, orchestrateAnalysis } from "@/lib/agents/orchestrator";
import type {
  AgentInput,
  OrchestratorState,
} from "@/lib/agents/orchestrator";

export class AnalysisService {
  static async run(input: AgentInput): Promise<OrchestratorState> {
    return orchestrateAnalysis(input);
  }

  static stream(input: AgentInput) {
    return streamAnalysis(input);
  }
}