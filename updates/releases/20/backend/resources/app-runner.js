// @bun
// packages/sdk/src/types.ts
class FnError extends Error {
  code;
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "FnError";
  }
}

// packages/sdk/src/openresponses/schemas.ts
var schemas = {
  IncompleteDetails: {
    type: "object",
    required: ["reason"],
    properties: { reason: { type: "string" } }
  },
  MessageStatus: {
    type: "string",
    enum: ["in_progress", "completed", "incomplete"]
  },
  MessageRole: {
    type: "string",
    enum: ["user", "assistant", "system", "developer"]
  },
  InputTextContent: {
    type: "object",
    required: ["type", "text"],
    properties: {
      type: { type: "string", enum: ["input_text"] },
      text: { type: "string" }
    }
  },
  UrlCitationBody: {
    type: "object",
    required: ["type", "url", "start_index", "end_index", "title"],
    properties: {
      type: { type: "string", enum: ["url_citation"] },
      url: { type: "string" },
      start_index: { type: "integer" },
      end_index: { type: "integer" },
      title: { type: "string" }
    }
  },
  Annotation: { $ref: "#/components/schemas/UrlCitationBody" },
  TopLogProb: {
    type: "object",
    required: ["token", "logprob", "bytes"],
    properties: {
      token: { type: "string" },
      logprob: { type: "number" },
      bytes: { type: "array", items: { type: "integer" } }
    }
  },
  LogProb: {
    type: "object",
    required: ["token", "logprob", "bytes", "top_logprobs"],
    properties: {
      token: { type: "string" },
      logprob: { type: "number" },
      bytes: { type: "array", items: { type: "integer" } },
      top_logprobs: {
        type: "array",
        items: { $ref: "#/components/schemas/TopLogProb" }
      }
    }
  },
  OutputTextContent: {
    type: "object",
    required: ["type", "text", "annotations"],
    properties: {
      type: { type: "string", enum: ["output_text"] },
      text: { type: "string" },
      annotations: {
        type: "array",
        items: { $ref: "#/components/schemas/Annotation" }
      },
      logprobs: {
        type: "array",
        items: { $ref: "#/components/schemas/LogProb" }
      }
    }
  },
  TextContent: {
    type: "object",
    required: ["type", "text"],
    properties: {
      type: { type: "string", enum: ["text"] },
      text: { type: "string" }
    }
  },
  SummaryTextContent: {
    type: "object",
    required: ["type", "text"],
    properties: {
      type: { type: "string", enum: ["summary_text"] },
      text: { type: "string" }
    }
  },
  ReasoningTextContent: {
    type: "object",
    required: ["type", "text"],
    properties: {
      type: { type: "string", enum: ["reasoning_text"] },
      text: { type: "string" }
    }
  },
  RefusalContent: {
    type: "object",
    required: ["type", "refusal"],
    properties: {
      type: { type: "string", enum: ["refusal"] },
      refusal: { type: "string" }
    }
  },
  ImageDetail: { type: "string", enum: ["low", "high", "auto"] },
  InputImageContent: {
    type: "object",
    required: ["type", "image_url", "detail"],
    properties: {
      type: { type: "string", enum: ["input_image"] },
      image_url: { anyOf: [{ type: "string" }, { type: "null" }] },
      detail: { $ref: "#/components/schemas/ImageDetail" }
    }
  },
  InputFileContent: {
    type: "object",
    required: ["type"],
    properties: {
      type: { type: "string", enum: ["input_file"] },
      filename: { type: "string" },
      file_url: { type: "string" }
    }
  },
  InputVideoContent: {
    type: "object",
    required: ["type", "video_url"],
    properties: {
      type: { type: "string", enum: ["input_video"] },
      video_url: { type: "string" }
    }
  },
  Message: {
    type: "object",
    required: ["type", "id", "status", "role", "content"],
    properties: {
      type: { type: "string", enum: ["message"] },
      id: { type: "string" },
      status: { $ref: "#/components/schemas/MessageStatus" },
      role: { $ref: "#/components/schemas/MessageRole" },
      content: {
        type: "array",
        items: {
          oneOf: [
            { $ref: "#/components/schemas/InputTextContent" },
            { $ref: "#/components/schemas/OutputTextContent" },
            { $ref: "#/components/schemas/TextContent" },
            { $ref: "#/components/schemas/SummaryTextContent" },
            { $ref: "#/components/schemas/ReasoningTextContent" },
            { $ref: "#/components/schemas/RefusalContent" },
            { $ref: "#/components/schemas/InputImageContent" },
            { $ref: "#/components/schemas/InputFileContent" },
            { $ref: "#/components/schemas/InputVideoContent" }
          ]
        }
      },
      phase: { type: "string", enum: ["commentary", "final_answer"] }
    }
  },
  FunctionCallStatus: {
    type: "string",
    enum: ["in_progress", "completed", "incomplete"]
  },
  FunctionCall: {
    type: "object",
    required: ["type", "id", "call_id", "name", "arguments", "status"],
    properties: {
      type: { type: "string", enum: ["function_call"] },
      id: { type: "string" },
      call_id: { type: "string" },
      name: { type: "string" },
      arguments: { type: "string" },
      status: { $ref: "#/components/schemas/FunctionCallStatus" }
    }
  },
  FunctionCallOutputStatusEnum: {
    type: "string",
    enum: ["in_progress", "completed", "incomplete"]
  },
  FunctionCallOutput: {
    type: "object",
    required: ["type", "id", "call_id", "output", "status"],
    properties: {
      type: { type: "string", enum: ["function_call_output"] },
      id: { type: "string" },
      call_id: { type: "string" },
      output: {
        oneOf: [
          { type: "string" },
          {
            type: "array",
            items: {
              oneOf: [
                { $ref: "#/components/schemas/InputTextContent" },
                { $ref: "#/components/schemas/InputImageContent" },
                { $ref: "#/components/schemas/InputFileContent" }
              ]
            }
          }
        ]
      },
      status: { $ref: "#/components/schemas/FunctionCallOutputStatusEnum" }
    }
  },
  ReasoningBody: {
    type: "object",
    required: ["type", "id", "summary"],
    properties: {
      type: { type: "string", enum: ["reasoning"] },
      id: { type: "string" },
      content: {
        type: "array",
        items: {
          oneOf: [
            { $ref: "#/components/schemas/InputTextContent" },
            { $ref: "#/components/schemas/OutputTextContent" },
            { $ref: "#/components/schemas/TextContent" },
            { $ref: "#/components/schemas/SummaryTextContent" },
            { $ref: "#/components/schemas/ReasoningTextContent" },
            { $ref: "#/components/schemas/RefusalContent" },
            { $ref: "#/components/schemas/InputImageContent" },
            { $ref: "#/components/schemas/InputFileContent" }
          ]
        }
      },
      summary: {
        type: "array",
        items: {
          oneOf: [
            { $ref: "#/components/schemas/InputTextContent" },
            { $ref: "#/components/schemas/OutputTextContent" },
            { $ref: "#/components/schemas/TextContent" },
            { $ref: "#/components/schemas/SummaryTextContent" },
            { $ref: "#/components/schemas/ReasoningTextContent" },
            { $ref: "#/components/schemas/RefusalContent" },
            { $ref: "#/components/schemas/InputImageContent" },
            { $ref: "#/components/schemas/InputFileContent" }
          ]
        }
      },
      encrypted_content: { type: "string" }
    }
  },
  CompactionBody: {
    type: "object",
    required: ["type", "id", "encrypted_content"],
    properties: {
      type: { type: "string", enum: ["compaction"] },
      id: { type: "string" },
      encrypted_content: { type: "string" },
      created_by: { type: "string" }
    }
  },
  ItemField: {
    oneOf: [
      { $ref: "#/components/schemas/Message" },
      { $ref: "#/components/schemas/FunctionCall" },
      { $ref: "#/components/schemas/FunctionCallOutput" },
      { $ref: "#/components/schemas/ReasoningBody" },
      { $ref: "#/components/schemas/CompactionBody" }
    ]
  },
  Error: {
    type: "object",
    required: ["code", "message"],
    properties: { code: { type: "string" }, message: { type: "string" } }
  },
  FunctionTool: {
    type: "object",
    required: ["type", "name", "description", "parameters", "strict"],
    properties: {
      type: { type: "string", enum: ["function"] },
      name: { type: "string" },
      description: { anyOf: [{ type: "string" }, { type: "null" }] },
      parameters: {
        anyOf: [{ type: "object", additionalProperties: {} }, { type: "null" }]
      },
      strict: { anyOf: [{ type: "boolean" }, { type: "null" }] }
    }
  },
  Tool: { $ref: "#/components/schemas/FunctionTool" },
  FunctionToolChoice: {
    type: "object",
    required: ["type"],
    properties: {
      type: { type: "string", enum: ["function"] },
      name: { type: "string" }
    }
  },
  ToolChoiceValueEnum: { type: "string", enum: ["none", "auto", "required"] },
  AllowedToolChoice: {
    type: "object",
    required: ["type", "tools", "mode"],
    properties: {
      type: { type: "string", enum: ["allowed_tools"] },
      tools: {
        type: "array",
        items: { $ref: "#/components/schemas/FunctionToolChoice" }
      },
      mode: { $ref: "#/components/schemas/ToolChoiceValueEnum" }
    }
  },
  TruncationEnum: { type: "string", enum: ["auto", "disabled"] },
  TextResponseFormat: {
    type: "object",
    required: ["type"],
    properties: { type: { type: "string", enum: ["text"] } }
  },
  JsonObjectResponseFormat: {
    type: "object",
    required: ["type"],
    properties: { type: { type: "string", enum: ["json_object"] } }
  },
  JsonSchemaResponseFormat: {
    type: "object",
    required: ["type", "name", "description", "schema", "strict"],
    properties: {
      type: { type: "string", enum: ["json_schema"] },
      name: { type: "string" },
      description: { anyOf: [{ type: "string" }, { type: "null" }] },
      schema: { type: "null" },
      strict: { type: "boolean" }
    }
  },
  VerbosityEnum: { type: "string", enum: ["low", "medium", "high"] },
  TextField: {
    type: "object",
    required: ["format"],
    properties: {
      format: {
        oneOf: [
          { $ref: "#/components/schemas/TextResponseFormat" },
          { $ref: "#/components/schemas/JsonObjectResponseFormat" },
          { $ref: "#/components/schemas/JsonSchemaResponseFormat" }
        ]
      },
      verbosity: { $ref: "#/components/schemas/VerbosityEnum" }
    }
  },
  ReasoningEffortEnum: {
    type: "string",
    enum: ["none", "low", "medium", "high", "xhigh"]
  },
  ReasoningSummaryEnum: {
    type: "string",
    enum: ["concise", "detailed", "auto"]
  },
  Reasoning: {
    type: "object",
    required: ["effort", "summary"],
    properties: {
      effort: {
        anyOf: [
          { $ref: "#/components/schemas/ReasoningEffortEnum" },
          { type: "null" }
        ]
      },
      summary: {
        anyOf: [
          { $ref: "#/components/schemas/ReasoningSummaryEnum" },
          { type: "null" }
        ]
      }
    }
  },
  InputTokensDetails: {
    type: "object",
    required: ["cached_tokens"],
    properties: { cached_tokens: { type: "integer" } }
  },
  OutputTokensDetails: {
    type: "object",
    required: ["reasoning_tokens"],
    properties: { reasoning_tokens: { type: "integer" } }
  },
  Usage: {
    type: "object",
    required: [
      "input_tokens",
      "output_tokens",
      "total_tokens",
      "input_tokens_details",
      "output_tokens_details"
    ],
    properties: {
      input_tokens: { type: "integer" },
      output_tokens: { type: "integer" },
      total_tokens: { type: "integer" },
      input_tokens_details: { $ref: "#/components/schemas/InputTokensDetails" },
      output_tokens_details: {
        $ref: "#/components/schemas/OutputTokensDetails"
      }
    }
  },
  ResponseResource: {
    type: "object",
    required: [
      "id",
      "object",
      "created_at",
      "completed_at",
      "status",
      "incomplete_details",
      "model",
      "previous_response_id",
      "instructions",
      "output",
      "error",
      "tools",
      "tool_choice",
      "truncation",
      "parallel_tool_calls",
      "text",
      "top_p",
      "presence_penalty",
      "frequency_penalty",
      "top_logprobs",
      "temperature",
      "reasoning",
      "usage",
      "max_output_tokens",
      "max_tool_calls",
      "store",
      "background",
      "service_tier",
      "metadata",
      "safety_identifier",
      "prompt_cache_key"
    ],
    properties: {
      id: { type: "string" },
      object: { type: "string", enum: ["response"] },
      created_at: { type: "integer" },
      completed_at: { anyOf: [{ type: "integer" }, { type: "null" }] },
      status: { type: "string" },
      incomplete_details: {
        anyOf: [
          { $ref: "#/components/schemas/IncompleteDetails" },
          { type: "null" }
        ]
      },
      model: { type: "string" },
      previous_response_id: { anyOf: [{ type: "string" }, { type: "null" }] },
      instructions: { anyOf: [{ type: "string" }, { type: "null" }] },
      output: {
        type: "array",
        items: { $ref: "#/components/schemas/ItemField" }
      },
      error: {
        anyOf: [{ $ref: "#/components/schemas/Error" }, { type: "null" }]
      },
      tools: { type: "array", items: { $ref: "#/components/schemas/Tool" } },
      tool_choice: {
        oneOf: [
          { $ref: "#/components/schemas/FunctionToolChoice" },
          { $ref: "#/components/schemas/ToolChoiceValueEnum" },
          { $ref: "#/components/schemas/AllowedToolChoice" }
        ]
      },
      truncation: { $ref: "#/components/schemas/TruncationEnum" },
      parallel_tool_calls: { type: "boolean" },
      text: { $ref: "#/components/schemas/TextField" },
      top_p: { type: "number" },
      presence_penalty: { type: "number" },
      frequency_penalty: { type: "number" },
      top_logprobs: { type: "integer" },
      temperature: { type: "number" },
      reasoning: {
        anyOf: [{ $ref: "#/components/schemas/Reasoning" }, { type: "null" }]
      },
      usage: {
        anyOf: [{ $ref: "#/components/schemas/Usage" }, { type: "null" }]
      },
      max_output_tokens: { anyOf: [{ type: "integer" }, { type: "null" }] },
      max_tool_calls: { anyOf: [{ type: "integer" }, { type: "null" }] },
      store: { type: "boolean" },
      background: { type: "boolean" },
      service_tier: { type: "string" },
      metadata: {},
      safety_identifier: { anyOf: [{ type: "string" }, { type: "null" }] },
      prompt_cache_key: { anyOf: [{ type: "string" }, { type: "null" }] }
    }
  },
  ResponseCreatedStreamingEvent: {
    type: "object",
    required: ["type", "sequence_number", "response"],
    properties: {
      type: { type: "string", enum: ["response.created"] },
      sequence_number: { type: "integer" },
      response: { $ref: "#/components/schemas/ResponseResource" }
    }
  },
  ResponseQueuedStreamingEvent: {
    type: "object",
    required: ["type", "sequence_number", "response"],
    properties: {
      type: { type: "string", enum: ["response.queued"] },
      sequence_number: { type: "integer" },
      response: { $ref: "#/components/schemas/ResponseResource" }
    }
  },
  ResponseInProgressStreamingEvent: {
    type: "object",
    required: ["type", "sequence_number", "response"],
    properties: {
      type: { type: "string", enum: ["response.in_progress"] },
      sequence_number: { type: "integer" },
      response: { $ref: "#/components/schemas/ResponseResource" }
    }
  },
  ResponseCompletedStreamingEvent: {
    type: "object",
    required: ["type", "sequence_number", "response"],
    properties: {
      type: { type: "string", enum: ["response.completed"] },
      sequence_number: { type: "integer" },
      response: { $ref: "#/components/schemas/ResponseResource" }
    }
  },
  ResponseFailedStreamingEvent: {
    type: "object",
    required: ["type", "sequence_number", "response"],
    properties: {
      type: { type: "string", enum: ["response.failed"] },
      sequence_number: { type: "integer" },
      response: { $ref: "#/components/schemas/ResponseResource" }
    }
  },
  ResponseIncompleteStreamingEvent: {
    type: "object",
    required: ["type", "sequence_number", "response"],
    properties: {
      type: { type: "string", enum: ["response.incomplete"] },
      sequence_number: { type: "integer" },
      response: { $ref: "#/components/schemas/ResponseResource" }
    }
  },
  ResponseOutputItemAddedStreamingEvent: {
    type: "object",
    required: ["type", "sequence_number", "output_index", "item"],
    properties: {
      type: { type: "string", enum: ["response.output_item.added"] },
      sequence_number: { type: "integer" },
      output_index: { type: "integer" },
      item: {
        anyOf: [{ $ref: "#/components/schemas/ItemField" }, { type: "null" }]
      }
    }
  },
  ResponseOutputItemDoneStreamingEvent: {
    type: "object",
    required: ["type", "sequence_number", "output_index", "item"],
    properties: {
      type: { type: "string", enum: ["response.output_item.done"] },
      sequence_number: { type: "integer" },
      output_index: { type: "integer" },
      item: {
        anyOf: [{ $ref: "#/components/schemas/ItemField" }, { type: "null" }]
      }
    }
  },
  ResponseReasoningSummaryPartAddedStreamingEvent: {
    type: "object",
    required: [
      "type",
      "sequence_number",
      "item_id",
      "output_index",
      "summary_index",
      "part"
    ],
    properties: {
      type: { type: "string", enum: ["response.reasoning_summary_part.added"] },
      sequence_number: { type: "integer" },
      item_id: { type: "string" },
      output_index: { type: "integer" },
      summary_index: { type: "integer" },
      part: {
        oneOf: [
          { $ref: "#/components/schemas/InputTextContent" },
          { $ref: "#/components/schemas/OutputTextContent" },
          { $ref: "#/components/schemas/TextContent" },
          { $ref: "#/components/schemas/SummaryTextContent" },
          { $ref: "#/components/schemas/ReasoningTextContent" },
          { $ref: "#/components/schemas/RefusalContent" },
          { $ref: "#/components/schemas/InputImageContent" },
          { $ref: "#/components/schemas/InputFileContent" }
        ]
      }
    }
  },
  ResponseReasoningSummaryPartDoneStreamingEvent: {
    type: "object",
    required: [
      "type",
      "sequence_number",
      "item_id",
      "output_index",
      "summary_index",
      "part"
    ],
    properties: {
      type: { type: "string", enum: ["response.reasoning_summary_part.done"] },
      sequence_number: { type: "integer" },
      item_id: { type: "string" },
      output_index: { type: "integer" },
      summary_index: { type: "integer" },
      part: {
        oneOf: [
          { $ref: "#/components/schemas/InputTextContent" },
          { $ref: "#/components/schemas/OutputTextContent" },
          { $ref: "#/components/schemas/TextContent" },
          { $ref: "#/components/schemas/SummaryTextContent" },
          { $ref: "#/components/schemas/ReasoningTextContent" },
          { $ref: "#/components/schemas/RefusalContent" },
          { $ref: "#/components/schemas/InputImageContent" },
          { $ref: "#/components/schemas/InputFileContent" }
        ]
      }
    }
  },
  ResponseContentPartAddedStreamingEvent: {
    type: "object",
    required: [
      "type",
      "sequence_number",
      "item_id",
      "output_index",
      "content_index",
      "part"
    ],
    properties: {
      type: { type: "string", enum: ["response.content_part.added"] },
      sequence_number: { type: "integer" },
      item_id: { type: "string" },
      output_index: { type: "integer" },
      content_index: { type: "integer" },
      part: {
        oneOf: [
          { $ref: "#/components/schemas/InputTextContent" },
          { $ref: "#/components/schemas/OutputTextContent" },
          { $ref: "#/components/schemas/TextContent" },
          { $ref: "#/components/schemas/SummaryTextContent" },
          { $ref: "#/components/schemas/ReasoningTextContent" },
          { $ref: "#/components/schemas/RefusalContent" },
          { $ref: "#/components/schemas/InputImageContent" },
          { $ref: "#/components/schemas/InputFileContent" }
        ]
      }
    }
  },
  ResponseContentPartDoneStreamingEvent: {
    type: "object",
    required: [
      "type",
      "sequence_number",
      "item_id",
      "output_index",
      "content_index",
      "part"
    ],
    properties: {
      type: { type: "string", enum: ["response.content_part.done"] },
      sequence_number: { type: "integer" },
      item_id: { type: "string" },
      output_index: { type: "integer" },
      content_index: { type: "integer" },
      part: {
        oneOf: [
          { $ref: "#/components/schemas/InputTextContent" },
          { $ref: "#/components/schemas/OutputTextContent" },
          { $ref: "#/components/schemas/TextContent" },
          { $ref: "#/components/schemas/SummaryTextContent" },
          { $ref: "#/components/schemas/ReasoningTextContent" },
          { $ref: "#/components/schemas/RefusalContent" },
          { $ref: "#/components/schemas/InputImageContent" },
          { $ref: "#/components/schemas/InputFileContent" }
        ]
      }
    }
  },
  ResponseOutputTextDeltaStreamingEvent: {
    type: "object",
    required: [
      "type",
      "sequence_number",
      "item_id",
      "output_index",
      "content_index",
      "delta"
    ],
    properties: {
      type: { type: "string", enum: ["response.output_text.delta"] },
      sequence_number: { type: "integer" },
      item_id: { type: "string" },
      output_index: { type: "integer" },
      content_index: { type: "integer" },
      delta: { type: "string" },
      logprobs: {
        type: "array",
        items: { $ref: "#/components/schemas/LogProb" }
      },
      obfuscation: { type: "string" }
    }
  },
  ResponseOutputTextDoneStreamingEvent: {
    type: "object",
    required: [
      "type",
      "sequence_number",
      "item_id",
      "output_index",
      "content_index",
      "text"
    ],
    properties: {
      type: { type: "string", enum: ["response.output_text.done"] },
      sequence_number: { type: "integer" },
      item_id: { type: "string" },
      output_index: { type: "integer" },
      content_index: { type: "integer" },
      text: { type: "string" },
      logprobs: {
        type: "array",
        items: { $ref: "#/components/schemas/LogProb" }
      }
    }
  },
  ResponseRefusalDeltaStreamingEvent: {
    type: "object",
    required: [
      "type",
      "sequence_number",
      "item_id",
      "output_index",
      "content_index",
      "delta"
    ],
    properties: {
      type: { type: "string", enum: ["response.refusal.delta"] },
      sequence_number: { type: "integer" },
      item_id: { type: "string" },
      output_index: { type: "integer" },
      content_index: { type: "integer" },
      delta: { type: "string" }
    }
  },
  ResponseRefusalDoneStreamingEvent: {
    type: "object",
    required: [
      "type",
      "sequence_number",
      "item_id",
      "output_index",
      "content_index",
      "refusal"
    ],
    properties: {
      type: { type: "string", enum: ["response.refusal.done"] },
      sequence_number: { type: "integer" },
      item_id: { type: "string" },
      output_index: { type: "integer" },
      content_index: { type: "integer" },
      refusal: { type: "string" }
    }
  },
  ResponseReasoningDeltaStreamingEvent: {
    type: "object",
    required: [
      "type",
      "sequence_number",
      "item_id",
      "output_index",
      "content_index",
      "delta"
    ],
    properties: {
      type: { type: "string", enum: ["response.reasoning.delta"] },
      sequence_number: { type: "integer" },
      item_id: { type: "string" },
      output_index: { type: "integer" },
      content_index: { type: "integer" },
      delta: { type: "string" },
      obfuscation: { type: "string" }
    }
  },
  ResponseReasoningDoneStreamingEvent: {
    type: "object",
    required: [
      "type",
      "sequence_number",
      "item_id",
      "output_index",
      "content_index",
      "text"
    ],
    properties: {
      type: { type: "string", enum: ["response.reasoning.done"] },
      sequence_number: { type: "integer" },
      item_id: { type: "string" },
      output_index: { type: "integer" },
      content_index: { type: "integer" },
      text: { type: "string" }
    }
  },
  ResponseReasoningSummaryDeltaStreamingEvent: {
    type: "object",
    required: [
      "type",
      "sequence_number",
      "item_id",
      "output_index",
      "summary_index",
      "delta"
    ],
    properties: {
      type: { type: "string", enum: ["response.reasoning_summary_text.delta"] },
      sequence_number: { type: "integer" },
      item_id: { type: "string" },
      output_index: { type: "integer" },
      summary_index: { type: "integer" },
      delta: { type: "string" },
      obfuscation: { type: "string" }
    }
  },
  ResponseReasoningSummaryDoneStreamingEvent: {
    type: "object",
    required: [
      "type",
      "sequence_number",
      "item_id",
      "output_index",
      "summary_index",
      "text"
    ],
    properties: {
      type: { type: "string", enum: ["response.reasoning_summary_text.done"] },
      sequence_number: { type: "integer" },
      item_id: { type: "string" },
      output_index: { type: "integer" },
      summary_index: { type: "integer" },
      text: { type: "string" }
    }
  },
  ResponseOutputTextAnnotationAddedStreamingEvent: {
    type: "object",
    required: [
      "type",
      "sequence_number",
      "item_id",
      "output_index",
      "content_index",
      "annotation_index",
      "annotation"
    ],
    properties: {
      type: { type: "string", enum: ["response.output_text.annotation.added"] },
      sequence_number: { type: "integer" },
      item_id: { type: "string" },
      output_index: { type: "integer" },
      content_index: { type: "integer" },
      annotation_index: { type: "integer" },
      annotation: {
        anyOf: [{ $ref: "#/components/schemas/Annotation" }, { type: "null" }]
      }
    }
  },
  ResponseFunctionCallArgumentsDeltaStreamingEvent: {
    type: "object",
    required: ["type", "sequence_number", "item_id", "output_index", "delta"],
    properties: {
      type: {
        type: "string",
        enum: ["response.function_call_arguments.delta"]
      },
      sequence_number: { type: "integer" },
      item_id: { type: "string" },
      output_index: { type: "integer" },
      delta: { type: "string" },
      obfuscation: { type: "string" }
    }
  },
  ResponseFunctionCallArgumentsDoneStreamingEvent: {
    type: "object",
    required: [
      "type",
      "sequence_number",
      "item_id",
      "output_index",
      "arguments"
    ],
    properties: {
      type: { type: "string", enum: ["response.function_call_arguments.done"] },
      sequence_number: { type: "integer" },
      item_id: { type: "string" },
      output_index: { type: "integer" },
      arguments: { type: "string" }
    }
  },
  ErrorPayload: {
    type: "object",
    required: ["type", "code", "message", "param"],
    properties: {
      type: { type: "string" },
      code: { anyOf: [{ type: "string" }, { type: "null" }] },
      message: { type: "string" },
      param: { anyOf: [{ type: "string" }, { type: "null" }] },
      headers: { type: "object", additionalProperties: { type: "string" } }
    }
  },
  ErrorStreamingEvent: {
    type: "object",
    required: ["type", "sequence_number", "error"],
    properties: {
      type: { type: "string", enum: ["error"] },
      sequence_number: { type: "integer" },
      error: { $ref: "#/components/schemas/ErrorPayload" }
    }
  },
  ItemReferenceParam: {
    type: "object",
    required: ["id"],
    properties: {
      type: {
        anyOf: [{ type: "string", enum: ["item_reference"] }, { type: "null" }]
      },
      id: { type: "string" }
    }
  },
  ReasoningSummaryContentParam: {
    type: "object",
    required: ["type", "text"],
    properties: {
      type: { type: "string", enum: ["summary_text"] },
      text: { type: "string", maxLength: 10485760 }
    }
  },
  ReasoningItemParam: {
    type: "object",
    required: ["type", "summary"],
    properties: {
      id: { anyOf: [{ type: "string" }, { type: "null" }] },
      type: { type: "string", enum: ["reasoning"] },
      summary: {
        type: "array",
        items: { $ref: "#/components/schemas/ReasoningSummaryContentParam" }
      },
      content: { type: "null" },
      encrypted_content: { anyOf: [{ type: "string" }, { type: "null" }] }
    }
  },
  CompactionSummaryItemParam: {
    type: "object",
    required: ["type", "encrypted_content"],
    properties: {
      id: { anyOf: [{ type: "string" }, { type: "null" }] },
      type: { type: "string", enum: ["compaction"] },
      encrypted_content: { type: "string", maxLength: 10485760 }
    }
  },
  InputTextContentParam: {
    type: "object",
    required: ["type", "text"],
    properties: {
      type: { type: "string", enum: ["input_text"] },
      text: { type: "string", maxLength: 10485760 }
    }
  },
  InputImageContentParamAutoParam: {
    type: "object",
    required: ["type"],
    properties: {
      type: { type: "string", enum: ["input_image"] },
      image_url: {
        anyOf: [{ type: "string", maxLength: 20971520 }, { type: "null" }]
      },
      detail: {
        anyOf: [{ $ref: "#/components/schemas/ImageDetail" }, { type: "null" }]
      }
    }
  },
  InputFileContentParam: {
    type: "object",
    required: ["type"],
    properties: {
      type: { type: "string", enum: ["input_file"] },
      filename: { anyOf: [{ type: "string" }, { type: "null" }] },
      file_data: {
        anyOf: [{ type: "string", maxLength: 33554432 }, { type: "null" }]
      },
      file_url: { anyOf: [{ type: "string" }, { type: "null" }] }
    }
  },
  UserMessageItemParam: {
    type: "object",
    required: ["type", "role", "content"],
    properties: {
      id: { anyOf: [{ type: "string" }, { type: "null" }] },
      type: { type: "string", enum: ["message"] },
      role: { type: "string", enum: ["user"] },
      content: {
        oneOf: [
          {
            type: "array",
            items: {
              oneOf: [
                { $ref: "#/components/schemas/InputTextContentParam" },
                {
                  $ref: "#/components/schemas/InputImageContentParamAutoParam"
                },
                { $ref: "#/components/schemas/InputFileContentParam" }
              ]
            }
          },
          { type: "string", maxLength: 10485760 }
        ]
      },
      status: { anyOf: [{ type: "string" }, { type: "null" }] }
    }
  },
  SystemMessageItemParam: {
    type: "object",
    required: ["type", "role", "content"],
    properties: {
      id: { anyOf: [{ type: "string" }, { type: "null" }] },
      type: { type: "string", enum: ["message"] },
      role: { type: "string", enum: ["system"] },
      content: {
        oneOf: [
          {
            type: "array",
            items: { $ref: "#/components/schemas/InputTextContentParam" }
          },
          { type: "string", maxLength: 10485760 }
        ]
      },
      status: { anyOf: [{ type: "string" }, { type: "null" }] }
    }
  },
  DeveloperMessageItemParam: {
    type: "object",
    required: ["type", "role", "content"],
    properties: {
      id: { anyOf: [{ type: "string" }, { type: "null" }] },
      type: { type: "string", enum: ["message"] },
      role: { type: "string", enum: ["developer"] },
      content: {
        oneOf: [
          {
            type: "array",
            items: { $ref: "#/components/schemas/InputTextContentParam" }
          },
          { type: "string", maxLength: 10485760 }
        ]
      },
      status: { anyOf: [{ type: "string" }, { type: "null" }] }
    }
  },
  UrlCitationParam: {
    type: "object",
    required: ["type", "start_index", "end_index", "url", "title"],
    properties: {
      type: { type: "string", enum: ["url_citation"] },
      start_index: { type: "integer", minimum: 0 },
      end_index: { type: "integer", minimum: 0 },
      url: { type: "string" },
      title: { type: "string" }
    }
  },
  OutputTextContentParam: {
    type: "object",
    required: ["type", "text"],
    properties: {
      type: { type: "string", enum: ["output_text"] },
      text: { type: "string", maxLength: 10485760 },
      annotations: {
        type: "array",
        items: { $ref: "#/components/schemas/UrlCitationParam" }
      }
    }
  },
  RefusalContentParam: {
    type: "object",
    required: ["type", "refusal"],
    properties: {
      type: { type: "string", enum: ["refusal"] },
      refusal: { type: "string", maxLength: 10485760 }
    }
  },
  AssistantMessageItemParam: {
    type: "object",
    required: ["type", "role", "content"],
    properties: {
      id: { anyOf: [{ type: "string" }, { type: "null" }] },
      type: { type: "string", enum: ["message"] },
      role: { type: "string", enum: ["assistant"] },
      content: {
        oneOf: [
          {
            type: "array",
            items: {
              oneOf: [
                { $ref: "#/components/schemas/OutputTextContentParam" },
                { $ref: "#/components/schemas/RefusalContentParam" }
              ]
            }
          },
          { type: "string", maxLength: 10485760 }
        ]
      },
      phase: { type: "string", enum: ["commentary", "final_answer"] },
      status: { anyOf: [{ type: "string" }, { type: "null" }] }
    }
  },
  FunctionCallItemParam: {
    type: "object",
    required: ["call_id", "type", "name", "arguments"],
    properties: {
      id: { anyOf: [{ type: "string" }, { type: "null" }] },
      call_id: { type: "string", minLength: 1, maxLength: 64 },
      type: { type: "string", enum: ["function_call"] },
      name: {
        type: "string",
        minLength: 1,
        maxLength: 64,
        pattern: "^[a-zA-Z0-9_-]+$"
      },
      arguments: { type: "string" },
      status: {
        anyOf: [
          { $ref: "#/components/schemas/FunctionCallStatus" },
          { type: "null" }
        ]
      }
    }
  },
  FunctionCallOutputItemParam: {
    type: "object",
    required: ["call_id", "type", "output"],
    properties: {
      id: { anyOf: [{ type: "string" }, { type: "null" }] },
      call_id: { type: "string", minLength: 1, maxLength: 64 },
      type: { type: "string", enum: ["function_call_output"] },
      output: {
        oneOf: [
          { type: "string", maxLength: 10485760 },
          {
            type: "array",
            items: {
              oneOf: [
                { $ref: "#/components/schemas/InputTextContentParam" },
                {
                  $ref: "#/components/schemas/InputImageContentParamAutoParam"
                },
                { $ref: "#/components/schemas/InputFileContentParam" },
                { $ref: "#/components/schemas/InputVideoContent" }
              ]
            }
          }
        ]
      },
      status: {
        anyOf: [
          { $ref: "#/components/schemas/FunctionCallStatus" },
          { type: "null" }
        ]
      }
    }
  },
  ItemParam: {
    oneOf: [
      { $ref: "#/components/schemas/ItemReferenceParam" },
      { $ref: "#/components/schemas/ReasoningItemParam" },
      { $ref: "#/components/schemas/CompactionSummaryItemParam" },
      { $ref: "#/components/schemas/UserMessageItemParam" },
      { $ref: "#/components/schemas/SystemMessageItemParam" },
      { $ref: "#/components/schemas/DeveloperMessageItemParam" },
      { $ref: "#/components/schemas/AssistantMessageItemParam" },
      { $ref: "#/components/schemas/FunctionCallItemParam" },
      { $ref: "#/components/schemas/FunctionCallOutputItemParam" }
    ]
  },
  IncludeEnum: {
    type: "string",
    enum: ["reasoning.encrypted_content", "message.output_text.logprobs"]
  },
  EmptyModelParam: { type: "object" },
  FunctionToolParam: {
    type: "object",
    required: ["name", "type"],
    properties: {
      name: {
        type: "string",
        minLength: 1,
        maxLength: 64,
        pattern: "^[a-zA-Z0-9_-]+$"
      },
      description: { anyOf: [{ type: "string" }, { type: "null" }] },
      parameters: {
        anyOf: [
          { $ref: "#/components/schemas/EmptyModelParam" },
          { type: "null" }
        ]
      },
      strict: { type: "boolean" },
      type: { type: "string", enum: ["function"] }
    }
  },
  ResponsesToolParam: { $ref: "#/components/schemas/FunctionToolParam" },
  SpecificFunctionParam: {
    type: "object",
    required: ["type", "name"],
    properties: {
      type: { type: "string", enum: ["function"] },
      name: { type: "string" }
    }
  },
  SpecificToolChoiceParam: {
    $ref: "#/components/schemas/SpecificFunctionParam"
  },
  AllowedToolsParam: {
    type: "object",
    required: ["type", "tools"],
    properties: {
      type: { type: "string", enum: ["allowed_tools"] },
      tools: {
        type: "array",
        items: { $ref: "#/components/schemas/SpecificToolChoiceParam" },
        minItems: 1,
        maxItems: 128
      },
      mode: { $ref: "#/components/schemas/ToolChoiceValueEnum" }
    }
  },
  ToolChoiceParam: {
    oneOf: [
      { $ref: "#/components/schemas/SpecificToolChoiceParam" },
      { $ref: "#/components/schemas/ToolChoiceValueEnum" },
      { $ref: "#/components/schemas/AllowedToolsParam" }
    ]
  },
  MetadataParam: {
    type: "object",
    maxProperties: 16,
    additionalProperties: { type: "string", maxLength: 512 }
  },
  JsonSchemaResponseFormatParam: {
    type: "object",
    properties: {
      type: { type: "string", enum: ["json_schema"] },
      description: { type: "string" },
      name: { type: "string" },
      schema: { type: "object", additionalProperties: {} },
      strict: { anyOf: [{ type: "boolean" }, { type: "null" }] }
    }
  },
  TextFormatParam: {
    oneOf: [
      { $ref: "#/components/schemas/TextResponseFormat" },
      { $ref: "#/components/schemas/JsonSchemaResponseFormatParam" }
    ]
  },
  TextParam: {
    type: "object",
    properties: {
      format: {
        oneOf: [
          { $ref: "#/components/schemas/TextFormatParam" },
          { type: "null" }
        ]
      },
      verbosity: { $ref: "#/components/schemas/VerbosityEnum" }
    }
  },
  StreamOptionsParam: {
    type: "object",
    properties: { include_obfuscation: { type: "boolean" } }
  },
  ReasoningParam: {
    type: "object",
    properties: {
      effort: {
        anyOf: [
          { $ref: "#/components/schemas/ReasoningEffortEnum" },
          { type: "null" }
        ]
      },
      summary: {
        anyOf: [
          { $ref: "#/components/schemas/ReasoningSummaryEnum" },
          { type: "null" }
        ]
      }
    }
  },
  ServiceTierEnum: {
    type: "string",
    enum: ["auto", "default", "flex", "priority"]
  },
  CreateResponseBody: {
    type: "object",
    properties: {
      model: { anyOf: [{ type: "string" }, { type: "null" }] },
      input: {
        anyOf: [
          {
            oneOf: [
              { type: "string", maxLength: 10485760 },
              {
                type: "array",
                items: { $ref: "#/components/schemas/ItemParam" }
              }
            ]
          },
          { type: "null" }
        ]
      },
      previous_response_id: { anyOf: [{ type: "string" }, { type: "null" }] },
      include: {
        type: "array",
        items: { $ref: "#/components/schemas/IncludeEnum" }
      },
      tools: {
        anyOf: [
          {
            type: "array",
            items: { $ref: "#/components/schemas/ResponsesToolParam" }
          },
          { type: "null" }
        ]
      },
      tool_choice: {
        anyOf: [
          { $ref: "#/components/schemas/ToolChoiceParam" },
          { type: "null" }
        ]
      },
      metadata: {
        anyOf: [
          { $ref: "#/components/schemas/MetadataParam" },
          { type: "null" }
        ]
      },
      text: {
        anyOf: [{ $ref: "#/components/schemas/TextParam" }, { type: "null" }]
      },
      temperature: { anyOf: [{ type: "number" }, { type: "null" }] },
      top_p: { anyOf: [{ type: "number" }, { type: "null" }] },
      presence_penalty: { anyOf: [{ type: "number" }, { type: "null" }] },
      frequency_penalty: { anyOf: [{ type: "number" }, { type: "null" }] },
      parallel_tool_calls: { anyOf: [{ type: "boolean" }, { type: "null" }] },
      stream: { type: "boolean" },
      stream_options: {
        anyOf: [
          { $ref: "#/components/schemas/StreamOptionsParam" },
          { type: "null" }
        ]
      },
      background: { type: "boolean" },
      max_output_tokens: {
        anyOf: [{ type: "integer", minimum: 16 }, { type: "null" }]
      },
      max_tool_calls: {
        anyOf: [{ type: "integer", minimum: 1 }, { type: "null" }]
      },
      reasoning: {
        anyOf: [
          { $ref: "#/components/schemas/ReasoningParam" },
          { type: "null" }
        ]
      },
      safety_identifier: {
        anyOf: [{ type: "string", maxLength: 64 }, { type: "null" }]
      },
      prompt_cache_key: {
        anyOf: [{ type: "string", maxLength: 64 }, { type: "null" }]
      },
      truncation: { $ref: "#/components/schemas/TruncationEnum" },
      instructions: { anyOf: [{ type: "string" }, { type: "null" }] },
      store: { type: "boolean" },
      service_tier: { $ref: "#/components/schemas/ServiceTierEnum" },
      top_logprobs: {
        anyOf: [{ type: "integer", minimum: 0, maximum: 20 }, { type: "null" }]
      }
    }
  },
  CompactResource: {
    type: "object",
    required: ["id", "object", "output", "created_at", "usage"],
    properties: {
      id: { type: "string" },
      object: { type: "string", enum: ["response.compaction"] },
      output: {
        type: "array",
        items: { $ref: "#/components/schemas/ItemField" }
      },
      created_at: { type: "integer" },
      usage: { $ref: "#/components/schemas/Usage" }
    }
  },
  CompactResponseMethodPublicBody: {
    type: "object",
    required: ["model"],
    properties: {
      model: { type: "string" },
      input: {
        anyOf: [
          {
            oneOf: [
              { type: "string", maxLength: 10485760 },
              {
                type: "array",
                items: { $ref: "#/components/schemas/ItemParam" }
              }
            ]
          },
          { type: "null" }
        ]
      },
      previous_response_id: { anyOf: [{ type: "string" }, { type: "null" }] },
      instructions: { anyOf: [{ type: "string" }, { type: "null" }] },
      prompt_cache_key: {
        anyOf: [{ type: "string", maxLength: 64 }, { type: "null" }]
      }
    }
  },
  WebSocketResponseCreateEvent: {
    allOf: [
      {
        type: "object",
        properties: {
          type: { type: "string", enum: ["response.create"] },
          stream: { type: "string", maxLength: 0, minLength: 1 },
          stream_options: { type: "string", maxLength: 0, minLength: 1 },
          background: { type: "string", maxLength: 0, minLength: 1 }
        },
        required: ["type"]
      },
      { $ref: "#/components/schemas/CreateResponseBody" }
    ]
  },
  WebSocketErrorEvent: {
    type: "object",
    required: ["type", "status", "error"],
    properties: {
      type: { type: "string", enum: ["error"] },
      status: { type: "integer" },
      error: {
        type: "object",
        properties: {
          type: { type: "string" },
          code: { type: "string" },
          message: { type: "string" },
          param: { anyOf: [{ type: "string" }, { type: "null" }] }
        },
        required: ["code", "message"],
        additionalProperties: {}
      }
    }
  },
  DetailEnum: { type: "string", enum: ["low", "high", "auto"] },
  FunctionCallItemStatus: {
    type: "string",
    enum: ["in_progress", "completed", "incomplete"]
  }
};
var eventSchemas = {
  "response.created": "ResponseCreatedStreamingEvent",
  "response.queued": "ResponseQueuedStreamingEvent",
  "response.in_progress": "ResponseInProgressStreamingEvent",
  "response.completed": "ResponseCompletedStreamingEvent",
  "response.failed": "ResponseFailedStreamingEvent",
  "response.incomplete": "ResponseIncompleteStreamingEvent",
  "response.output_item.added": "ResponseOutputItemAddedStreamingEvent",
  "response.output_item.done": "ResponseOutputItemDoneStreamingEvent",
  "response.reasoning_summary_part.added": "ResponseReasoningSummaryPartAddedStreamingEvent",
  "response.reasoning_summary_part.done": "ResponseReasoningSummaryPartDoneStreamingEvent",
  "response.content_part.added": "ResponseContentPartAddedStreamingEvent",
  "response.content_part.done": "ResponseContentPartDoneStreamingEvent",
  "response.output_text.delta": "ResponseOutputTextDeltaStreamingEvent",
  "response.output_text.done": "ResponseOutputTextDoneStreamingEvent",
  "response.refusal.delta": "ResponseRefusalDeltaStreamingEvent",
  "response.refusal.done": "ResponseRefusalDoneStreamingEvent",
  "response.reasoning.delta": "ResponseReasoningDeltaStreamingEvent",
  "response.reasoning.done": "ResponseReasoningDoneStreamingEvent",
  "response.reasoning_summary_text.delta": "ResponseReasoningSummaryDeltaStreamingEvent",
  "response.reasoning_summary_text.done": "ResponseReasoningSummaryDoneStreamingEvent",
  "response.output_text.annotation.added": "ResponseOutputTextAnnotationAddedStreamingEvent",
  "response.function_call_arguments.delta": "ResponseFunctionCallArgumentsDeltaStreamingEvent",
  "response.function_call_arguments.done": "ResponseFunctionCallArgumentsDoneStreamingEvent",
  error: "ErrorStreamingEvent"
};

// packages/sdk/src/openresponses/schema.ts
function validateSchema(schema, value, schemas, path = "$", depth = 0) {
  const fail = (message) => ({ path, message });
  if (depth > 128)
    return fail("Maximum protocol nesting exceeded");
  const check = (next, item = value, at = path) => validateSchema(next, item, schemas, at, depth + 1);
  if (schema.$ref) {
    const target = schemas[schema.$ref.split("/").at(-1)];
    if (!target)
      return fail("Unknown protocol reference");
    const issue = check(target);
    if (issue)
      return issue;
  }
  for (const [key, exactlyOne] of [
    ["anyOf", false],
    ["oneOf", true]
  ]) {
    const variants = schema[key];
    if (variants) {
      const issues = variants.map((variant) => check(variant));
      const matches = issues.filter((issue) => !issue).length;
      if (!matches || exactlyOne && matches !== 1)
        return fail(`Expected ${exactlyOne ? "exactly one" : "a"} protocol variant`);
    }
  }
  for (const variant of schema.allOf ?? []) {
    const issue = check(variant);
    if (issue)
      return issue;
  }
  if (schema.enum && !schema.enum.some((item) => Object.is(item, value)))
    return fail("Invalid enum value");
  switch (schema.type) {
    case "null":
      if (value !== null)
        return fail("Expected null");
      break;
    case "boolean":
      if (typeof value !== "boolean")
        return fail("Expected boolean");
      break;
    case "string": {
      if (typeof value !== "string")
        return fail("Expected string");
      const length = Array.from(value).length;
      if (schema.minLength !== undefined && length < schema.minLength)
        return fail("String too short");
      if (schema.maxLength !== undefined && length > schema.maxLength)
        return fail("String too long");
      if (schema.pattern && !new RegExp(schema.pattern, "u").test(value))
        return fail("String does not match pattern");
      break;
    }
    case "number":
    case "integer":
      if (typeof value !== "number" || !Number.isFinite(value) || schema.type === "integer" && !Number.isInteger(value))
        return fail("Expected finite " + schema.type);
      if (schema.minimum !== undefined && value < schema.minimum)
        return fail("Number below minimum");
      if (schema.maximum !== undefined && value > schema.maximum)
        return fail("Number above maximum");
      break;
    case "array":
      if (!Array.isArray(value))
        return fail("Expected array");
      if (schema.minItems !== undefined && value.length < schema.minItems)
        return fail("Too few items");
      if (schema.maxItems !== undefined && value.length > schema.maxItems)
        return fail("Too many items");
      for (let i = 0;i < value.length; i++) {
        const issue = check(schema.items ?? {}, value[i], `${path}[${i}]`);
        if (issue)
          return issue;
      }
      break;
    case "object": {
      if (!value || typeof value !== "object" || Array.isArray(value))
        return fail("Expected object");
      const object = value;
      if (schema.maxProperties !== undefined && Object.keys(object).length > schema.maxProperties)
        return fail("Too many properties");
      for (const name of schema.required ?? [])
        if (!Object.hasOwn(object, name) || object[name] === undefined)
          return {
            path: `${path}.${name}`,
            message: "Required property missing"
          };
      for (const [name, item] of Object.entries(object)) {
        if (item === undefined)
          continue;
        const property = Object.hasOwn(schema.properties ?? {}, name) ? schema.properties[name] : undefined;
        if (!property && schema.additionalProperties === false)
          return { path: `${path}.${name}`, message: "Unknown property" };
        const shape = property ?? (typeof schema.additionalProperties === "object" ? schema.additionalProperties : undefined);
        if (shape) {
          const issue = check(shape, item, `${path}.${name}`);
          if (issue)
            return issue;
        }
      }
    }
  }
}

// packages/sdk/src/responses.ts
var unsupportedResponseParameters = [
  "background",
  "conversation",
  "max_output_tokens",
  "max_tool_calls",
  "metadata",
  "moderation",
  "multi_agent",
  "prompt",
  "prompt_cache_retention",
  "safety_identifier",
  "temperature",
  "top_logprobs",
  "top_p",
  "truncation",
  "user",
  "previous_response_id"
];
var streamErrorBrand = Symbol.for("@semicoder/fn-sdk/ResponseStreamError");

class ResponseStreamError extends FnError {
  event;
  [streamErrorBrand] = true;
  static [Symbol.hasInstance](value) {
    return !!value && typeof value === "object" && value[streamErrorBrand] === true;
  }
  constructor(event) {
    const detail = event.type === "error" ? event.error : event.response.error;
    super(detail?.code ?? event.type, detail?.message ?? (event.type === "response.incomplete" ? "Model response is incomplete" : "Model response failed"));
    this.event = event;
    this.name = "ResponseStreamError";
  }
}
function validateResponseRequest(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new FnError("invalid_request", "Expected Responses request object");
  const input = value;
  for (const key of unsupportedResponseParameters)
    if (Object.hasOwn(input, key) && input[key] !== undefined)
      throw new FnError("unsupported_parameter", key + " is not supported by this connection");
  for (const key of Object.keys(input))
    if (!Object.hasOwn(schemas.CreateResponseBody.properties, key) && input[key] !== undefined)
      throw new FnError("unsupported_parameter", "Unknown Responses parameter: " + key);
  if (typeof input.model !== "string" || !input.model.trim() || !Array.isArray(input.input) || input.store !== false || input.stream !== true)
    throw new FnError("invalid_request", "Responses requires model, input array, store:false and stream:true");
  if (Array.isArray(input.tools))
    for (const tool of input.tools) {
      if (tool && typeof tool === "object" && typeof tool.type === "string" && tool.type !== "function")
        throw new FnError("unsupported_parameter", "Unsupported tool: " + tool.type);
    }
  const issue = validateSchema(schemas.CreateResponseBody, value, schemas);
  if (issue)
    throw new FnError("invalid_request", `${issue.path}: ${issue.message}`);
  if (input.input.some((item) => item.type === "message" && item.role === "system"))
    throw new FnError("unsupported_parameter", "Use instructions or developer messages");
  return value;
}
function parseResponseEvent(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new FnError("invalid_event", "Expected Responses event object");
  const event = value;
  if (typeof event.type !== "string" || !Number.isSafeInteger(event.sequence_number) || event.sequence_number < 0)
    throw new FnError("invalid_event", "Responses requires type and nonnegative sequence_number");
  if (Object.hasOwn(eventSchemas, event.type)) {
    const name = eventSchemas[event.type];
    const issue = validateSchema(schemas[name], value, schemas);
    if (issue)
      throw new FnError("invalid_event", `${name} ${issue.path}: ${issue.message}`);
    return value;
  }
  if (/^[a-z][a-z0-9_-]*:[a-zA-Z0-9_.-]+$/.test(event.type))
    return value;
  throw new FnError("invalid_event", "Unknown core Responses event: " + event.type);
}
function isProviderResponseEvent(event) {
  return event.type.includes(":");
}

// packages/sdk/src/runner.ts
import { pathToFileURL } from "url";

// packages/sdk/src/sse.ts
async function* readSSE(response, signal, options = {}) {
  signal?.throwIfAborted();
  if (!response.ok) {
    const value = await response.json().catch(() => ({ message: response.statusText }));
    throw new FnError(value.code ?? "http_error", value.message ?? value.error?.message ?? response.statusText);
  }
  if (!response.body)
    throw new FnError("interrupted", "Missing response body");
  const reader = response.body.getReader();
  const abort = () => {
    reader.cancel(signal?.reason).catch(() => {});
  };
  signal?.addEventListener("abort", abort, { once: true });
  const decoder = new TextDecoder;
  let buffer = "";
  try {
    while (true) {
      signal?.throwIfAborted();
      const next = await reader.read();
      signal?.throwIfAborted();
      buffer += decoder.decode(next.value, { stream: !next.done });
      let match;
      while (match = /\r?\n\r?\n/.exec(buffer)) {
        if (match.index > 2 * 1024 * 1024)
          throw new FnError("resource_limit", "SSE frame limit exceeded");
        const block = buffer.slice(0, match.index);
        buffer = buffer.slice(match.index + match[0].length);
        let event = "message";
        const data = [];
        for (const line of block.split(/\r?\n/)) {
          if (line.startsWith("event:"))
            event = line.slice(6).trim();
          if (line.startsWith("data:"))
            data.push(line.slice(5).trimStart());
        }
        if (data.length) {
          const raw = data.join(`
`);
          if (raw === "[DONE]") {
            if (options.preserveDone)
              yield { event, data: undefined, done: true };
            continue;
          }
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch {
            throw new FnError("invalid_event", "Invalid SSE JSON");
          }
          yield { event, data: parsed };
        }
      }
      if (buffer.length > 2 * 1024 * 1024)
        throw new FnError("resource_limit", "SSE frame limit exceeded");
      if (next.done)
        break;
    }
    if (buffer.trim())
      throw new FnError("interrupted", "Incomplete SSE frame");
  } finally {
    signal?.removeEventListener("abort", abort);
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
async function* readResponses(response, signal) {
  let completed = false;
  let done = false;
  let sequence = -1;
  let responseId;
  for await (const frame of readSSE(response, signal, { preserveDone: true })) {
    if (frame.done) {
      if (!completed || done)
        throw new FnError("invalid_event", "Unexpected Responses [DONE]");
      done = true;
      continue;
    }
    if (completed)
      throw new FnError("invalid_event", "Responses event after terminal response");
    const event = parseResponseEvent(frame.data);
    if (frame.event !== event.type)
      throw new FnError("invalid_event", "SSE event does not match body type");
    if (event.sequence_number <= sequence)
      throw new FnError("invalid_event", "Responses sequence_number must increase");
    sequence = event.sequence_number;
    if (isProviderResponseEvent(event))
      continue;
    if (event.type === "response.created" || event.type === "response.queued" || event.type === "response.in_progress" || event.type === "response.completed" || event.type === "response.failed" || event.type === "response.incomplete") {
      if (responseId !== undefined && event.response.id !== responseId)
        throw new FnError("invalid_event", "Response identity changed within stream");
      responseId = event.response.id;
      const expected = event.type.slice("response.".length);
      if (["completed", "failed", "incomplete", "in_progress", "queued"].includes(expected) && event.response.status !== expected)
        throw new FnError("invalid_event", "Response status does not match event");
    }
    if (event.type === "response.failed" || event.type === "response.incomplete" || event.type === "error")
      throw new ResponseStreamError(event);
    if (event.type === "response.completed")
      completed = true;
    yield event;
  }
  if (!completed)
    throw new FnError("interrupted", "Model stream ended before completion");
}

// packages/sdk/src/runner.ts
var config = JSON.parse(process.env.FN_RUNTIME_CONFIG ?? "null");
if (!config || !/^http:\/\/127\.0\.0\.1:\d+$/.test(config.origin))
  throw new Error("Missing Fn runtime configuration");
delete process.env.FN_RUNTIME_CONFIG;
var lifetime = new AbortController;
async function request(path, body, signal, extraHeaders = {}) {
  const response = await fetch(config.origin + "/api/fn/v1" + path, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      authorization: "Bearer " + config.token,
      "content-type": "application/json",
      ...extraHeaders
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.any([lifetime.signal, ...signal ? [signal] : []])
  });
  if (!response.ok) {
    const value = await response.json().catch(() => ({ message: response.statusText }));
    throw new FnError(value.code ?? "request_failed", value.message ?? response.statusText);
  }
  return response;
}
var host = {
  paths: config.paths,
  preferences: async () => (await request("/preferences")).json(),
  models: {
    list: async () => (await request("/models")).json(),
    default: async () => (await request("/models/default")).json(),
    async* responses(body, options) {
      validateResponseRequest(body);
      const signal = AbortSignal.any([
        lifetime.signal,
        ...options.signal ? [options.signal] : []
      ]);
      const response = await request("/responses", body, signal, {
        "x-fn-connection": options.connectionId
      });
      yield* readResponses(response, signal);
    }
  },
  application: {
    setSummary: async (snapshot) => {
      await request("/apps/summary", { snapshot });
    },
    notifyDataChanged: async () => {
      await request("/apps/data-changed", {});
    }
  },
  ui: {
    toast: async (text, options) => {
      await request("/ui/toast", { text, ...options });
    },
    confirm: async (text, options) => (await request("/ui/confirm", { text, ...options })).json()
  }
};
var socket = new WebSocket(config.origin.replace(/^http/, "ws") + "/api/fn/v1/runtime", {
  headers: { authorization: "Bearer " + config.token }
});
var calls = new Map;
var implementation;
var definition;
var stopping = false;
var send = (value) => {
  const text = JSON.stringify(value);
  if (Buffer.byteLength(text) > 1024 * 1024 || socket.bufferedAmount > 2 * 1024 * 1024)
    throw new Error("Runtime transport limit");
  socket.send(text);
};
var stop = async () => {
  if (stopping)
    return;
  stopping = true;
  lifetime.abort();
  for (const call of calls.values()) {
    call.controller.abort();
    call.resume?.();
  }
  await implementation?.stop?.();
  try {
    send({ type: "stopped" });
  } catch {}
  socket.close();
  process.exitCode = 0;
};
socket.onopen = async () => {
  try {
    definition = (await import(pathToFileURL(config.entry).href)).default;
    implementation = await definition.setup({ host });
    send({ type: "ready", methods: Object.keys(definition.api) });
  } catch {
    send({ type: "fatal", message: "Application initialization failed" });
    await stop();
  }
};
socket.onmessage = async (event) => {
  let message;
  try {
    message = JSON.parse(String(event.data));
  } catch {
    await stop();
    return;
  }
  if (message.type === "stop") {
    await stop();
    return;
  }
  const existing = calls.get(message.id);
  if (message.type === "cancel") {
    existing?.controller.abort();
    existing?.resume?.();
    return;
  }
  if (message.type === "credit") {
    if (existing) {
      existing.credits++;
      existing.resume?.();
    }
    return;
  }
  if (message.type !== "call" || stopping || !implementation)
    return;
  if (calls.size >= 64 || calls.has(message.id)) {
    send({
      type: "error",
      id: message.id,
      code: "busy",
      message: "Application call limit"
    });
    return;
  }
  const call = {
    controller: new AbortController,
    credits: 16,
    resume: undefined
  };
  calls.set(message.id, call);
  const signal = AbortSignal.any([call.controller.signal, lifetime.signal]);
  try {
    const context = { signal, requestId: message.id, viewId: message.viewId };
    if (message.chat) {
      const handler = implementation.chat?.[message.method];
      if (!handler)
        throw new FnError("not_found", "Chat entry not found");
      await handler({
        ...context,
        message: message.input,
        reply: {
          complete: async (value) => {
            await request("/relay/reply", { messageId: message.input.id, text: value.text }, signal);
          }
        }
      });
    } else {
      const procedure = definition.api[message.method];
      if (!procedure)
        throw new FnError("not_found", "Method not found");
      const output = await implementation.handlers[message.method](procedure.input.parse(message.input), context);
      if (procedure.streaming) {
        if (!output || !(Symbol.asyncIterator in Object(output)))
          throw new Error("Streaming method must return an AsyncIterable");
        for await (const value of output) {
          while (call.credits <= 0 && !signal.aborted)
            await new Promise((resolve) => {
              call.resume = resolve;
            });
          signal.throwIfAborted();
          call.credits--;
          send({
            type: "yield",
            id: message.id,
            value: procedure.output.parse(value)
          });
        }
      } else {
        signal.throwIfAborted();
        send({
          type: "result",
          id: message.id,
          value: procedure.output.parse(output)
        });
      }
    }
    signal.throwIfAborted();
    send({ type: "done", id: message.id });
  } catch (error) {
    try {
      send({
        type: "error",
        id: message.id,
        code: signal.aborted ? "cancelled" : error instanceof FnError ? error.code : "application_error",
        message: signal.aborted ? "Cancelled" : String(error instanceof Error ? error.message : error).slice(0, 1000)
      });
    } catch {
      await stop();
    }
  } finally {
    calls.delete(message.id);
  }
};
socket.onclose = () => {
  stop();
};
socket.onerror = () => {
  stop();
};
process.on("SIGTERM", () => {
  stop();
});
process.on("SIGINT", () => {
  stop();
});
