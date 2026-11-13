// The Pendo agent is loaded by the Pendo install snippet, so it may be missing at runtime.
interface PendoAgentMetadata {
  agentId: string;
  conversationId: string;
  messageId: string;
  content: string;
  modelUsed?: string;
  suggestedPrompt?: boolean;
  toolsUsed?: string[];
  fileUploaded?: boolean;
}

interface Window {
  pendo?: {
    trackAgent?: (
      eventType: "prompt" | "agent_response" | "user_reaction",
      metadata: PendoAgentMetadata,
    ) => void;
  };
}
