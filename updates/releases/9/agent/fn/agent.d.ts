// Generated from the application's API contract.

export namespace Method0InputTypes {
export interface Method0Input {
  pluginId: string;
  input: {
    query: string;
    /**
     * @minItems 1
     * @maxItems 4
     */
    engines?:
      | ["baidu" | "wechat" | "toutiao" | "duckduckgo"]
      | ["baidu" | "wechat" | "toutiao" | "duckduckgo", "baidu" | "wechat" | "toutiao" | "duckduckgo"]
      | [
          "baidu" | "wechat" | "toutiao" | "duckduckgo",
          "baidu" | "wechat" | "toutiao" | "duckduckgo",
          "baidu" | "wechat" | "toutiao" | "duckduckgo"
        ]
      | [
          "baidu" | "wechat" | "toutiao" | "duckduckgo",
          "baidu" | "wechat" | "toutiao" | "duckduckgo",
          "baidu" | "wechat" | "toutiao" | "duckduckgo",
          "baidu" | "wechat" | "toutiao" | "duckduckgo"
        ];
    limit?: number;
    timeRange?: "day" | "week" | "month" | "year";
    site?: string;
    timeoutMs?: number;
  };
}

}
export namespace Method0OutputTypes {
export interface Method0Output {
  id: string;
  pluginId: string;
  kind: "search" | "fetch";
  status: "running" | "completed" | "failed" | "cancelled";
  result:
    | (
        | {
            text: string;
            results: {
              id: number;
              title: string;
              url: string;
              snippet: string;
              score: number;
              engines: ("baidu" | "wechat" | "toutiao" | "duckduckgo")[];
              meta: {
                [k: string]: string;
              };
              fetched: boolean;
            }[];
            engines: {
              engine: "baidu" | "wechat" | "toutiao" | "duckduckgo";
              status: "success" | "no_results" | "invalid_results" | "error";
              ok: boolean;
              count: number;
              rawCount: number;
              error?: string;
            }[];
          }
        | {
            url: string;
            finalUrl: string;
            status: number;
            contentType: string;
            title: string;
            format: "markdown" | "text" | "html";
            text: string;
            truncated: boolean;
            redirect?: {
              from: string;
              to: string;
              status: number;
            };
          }
      )
    | null;
  error: {
    code: string;
    message: string;
  } | null;
  createdAt: number;
  updatedAt: number;
}

}
export namespace Method1InputTypes {
export interface Method1Input {
  pluginId: string;
  input: {
    url: string;
    format?: "markdown" | "text" | "html";
    maxBytes?: number;
    timeoutMs?: number;
  };
}

}
export namespace Method1OutputTypes {
export interface Method1Output {
  id: string;
  pluginId: string;
  kind: "search" | "fetch";
  status: "running" | "completed" | "failed" | "cancelled";
  result:
    | (
        | {
            text: string;
            results: {
              id: number;
              title: string;
              url: string;
              snippet: string;
              score: number;
              engines: ("baidu" | "wechat" | "toutiao" | "duckduckgo")[];
              meta: {
                [k: string]: string;
              };
              fetched: boolean;
            }[];
            engines: {
              engine: "baidu" | "wechat" | "toutiao" | "duckduckgo";
              status: "success" | "no_results" | "invalid_results" | "error";
              ok: boolean;
              count: number;
              rawCount: number;
              error?: string;
            }[];
          }
        | {
            url: string;
            finalUrl: string;
            status: number;
            contentType: string;
            title: string;
            format: "markdown" | "text" | "html";
            text: string;
            truncated: boolean;
            redirect?: {
              from: string;
              to: string;
              status: number;
            };
          }
      )
    | null;
  error: {
    code: string;
    message: string;
  } | null;
  createdAt: number;
  updatedAt: number;
}

}
export namespace Method2InputTypes {
export interface Method2Input {
  pluginId: string;
  taskId: string;
}

}
export namespace Method2OutputTypes {
export interface Method2Output {
  id: string;
  pluginId: string;
  kind: "search" | "fetch";
  status: "running" | "completed" | "failed" | "cancelled";
  result:
    | (
        | {
            text: string;
            results: {
              id: number;
              title: string;
              url: string;
              snippet: string;
              score: number;
              engines: ("baidu" | "wechat" | "toutiao" | "duckduckgo")[];
              meta: {
                [k: string]: string;
              };
              fetched: boolean;
            }[];
            engines: {
              engine: "baidu" | "wechat" | "toutiao" | "duckduckgo";
              status: "success" | "no_results" | "invalid_results" | "error";
              ok: boolean;
              count: number;
              rawCount: number;
              error?: string;
            }[];
          }
        | {
            url: string;
            finalUrl: string;
            status: number;
            contentType: string;
            title: string;
            format: "markdown" | "text" | "html";
            text: string;
            truncated: boolean;
            redirect?: {
              from: string;
              to: string;
              status: number;
            };
          }
      )
    | null;
  error: {
    code: string;
    message: string;
  } | null;
  createdAt: number;
  updatedAt: number;
}

}
export namespace Method3InputTypes {
export interface Method3Input {
  pluginId: string;
  taskId: string;
}

}
export namespace Method3OutputTypes {
export interface Method3Output {
  id: string;
  pluginId: string;
  kind: "search" | "fetch";
  status: "running" | "completed" | "failed" | "cancelled";
  result:
    | (
        | {
            text: string;
            results: {
              id: number;
              title: string;
              url: string;
              snippet: string;
              score: number;
              engines: ("baidu" | "wechat" | "toutiao" | "duckduckgo")[];
              meta: {
                [k: string]: string;
              };
              fetched: boolean;
            }[];
            engines: {
              engine: "baidu" | "wechat" | "toutiao" | "duckduckgo";
              status: "success" | "no_results" | "invalid_results" | "error";
              ok: boolean;
              count: number;
              rawCount: number;
              error?: string;
            }[];
          }
        | {
            url: string;
            finalUrl: string;
            status: number;
            contentType: string;
            title: string;
            format: "markdown" | "text" | "html";
            text: string;
            truncated: boolean;
            redirect?: {
              from: string;
              to: string;
              status: number;
            };
          }
      )
    | null;
  error: {
    code: string;
    message: string;
  } | null;
  createdAt: number;
  updatedAt: number;
}

}
export namespace Method4InputTypes {
export interface Method4Input {}

}
export namespace Method4OutputTypes {
export interface Method4Output {
  theme: "system" | "light" | "dark";
  colorTheme: {
    preset: "default" | "github" | "custom";
    custom: {
      light: {
        accent: string;
        background: string;
        foreground: string;
      };
      dark: {
        accent: string;
        background: string;
        foreground: string;
      };
    };
  };
}

}
export namespace Method5InputTypes {
export interface Method5Input {
  theme?: "system" | "light" | "dark";
  colorTheme?: {
    preset: "default" | "github" | "custom";
    custom: {
      light: {
        accent: string;
        background: string;
        foreground: string;
      };
      dark: {
        accent: string;
        background: string;
        foreground: string;
      };
    };
  };
}

}
export namespace Method5OutputTypes {
export interface Method5Output {
  theme: "system" | "light" | "dark";
  colorTheme: {
    preset: "default" | "github" | "custom";
    custom: {
      light: {
        accent: string;
        background: string;
        foreground: string;
      };
      dark: {
        accent: string;
        background: string;
        foreground: string;
      };
    };
  };
}

}
export namespace Method6InputTypes {
export interface Method6Input {}

}
export namespace Method6OutputTypes {
export interface Method6Output {
  available: boolean;
  activeProfileId: string | null;
  profiles: {
    id: string;
    label: string;
    email: string | null;
    connected: boolean;
    sharing: boolean;
    welcomeSeen: boolean;
    incomplete: boolean;
    removalBlockedReason: string | null;
  }[];
  attempt: {
    id: string;
    profileId: string | null;
    stage: "waiting" | "exchanging" | "completed" | "failed" | "cancelled";
    message: string;
  } | null;
  message: string;
}

}
export namespace Method7InputTypes {
export interface Method7Input {
  profileId?: string;
  consent?: boolean;
}

}
export namespace Method7OutputTypes {
export interface Method7Output {
  available: boolean;
  activeProfileId: string | null;
  profiles: {
    id: string;
    label: string;
    email: string | null;
    connected: boolean;
    sharing: boolean;
    welcomeSeen: boolean;
    incomplete: boolean;
    removalBlockedReason: string | null;
  }[];
  attempt: {
    id: string;
    profileId: string | null;
    stage: "waiting" | "exchanging" | "completed" | "failed" | "cancelled";
    message: string;
  } | null;
  message: string;
}

}
export namespace Method8InputTypes {
export interface Method8Input {
  id: string;
}

}
export namespace Method8OutputTypes {
export interface Method8Output {
  available: boolean;
  activeProfileId: string | null;
  profiles: {
    id: string;
    label: string;
    email: string | null;
    connected: boolean;
    sharing: boolean;
    welcomeSeen: boolean;
    incomplete: boolean;
    removalBlockedReason: string | null;
  }[];
  attempt: {
    id: string;
    profileId: string | null;
    stage: "waiting" | "exchanging" | "completed" | "failed" | "cancelled";
    message: string;
  } | null;
  message: string;
}

}
export namespace Method9InputTypes {
export interface Method9Input {
  profileId: string;
}

}
export namespace Method9OutputTypes {
export interface Method9Output {
  available: boolean;
  activeProfileId: string | null;
  profiles: {
    id: string;
    label: string;
    email: string | null;
    connected: boolean;
    sharing: boolean;
    welcomeSeen: boolean;
    incomplete: boolean;
    removalBlockedReason: string | null;
  }[];
  attempt: {
    id: string;
    profileId: string | null;
    stage: "waiting" | "exchanging" | "completed" | "failed" | "cancelled";
    message: string;
  } | null;
  message: string;
}

}
export namespace Method10InputTypes {
export interface Method10Input {
  profileId: string;
  label: string;
}

}
export namespace Method10OutputTypes {
export interface Method10Output {
  available: boolean;
  activeProfileId: string | null;
  profiles: {
    id: string;
    label: string;
    email: string | null;
    connected: boolean;
    sharing: boolean;
    welcomeSeen: boolean;
    incomplete: boolean;
    removalBlockedReason: string | null;
  }[];
  attempt: {
    id: string;
    profileId: string | null;
    stage: "waiting" | "exchanging" | "completed" | "failed" | "cancelled";
    message: string;
  } | null;
  message: string;
}

}
export namespace Method11InputTypes {
export interface Method11Input {
  /**
   * @minItems 1
   * @maxItems 10
   */
  profileIds:
    | [string]
    | [string, string]
    | [string, string, string]
    | [string, string, string, string]
    | [string, string, string, string, string]
    | [string, string, string, string, string, string]
    | [string, string, string, string, string, string, string]
    | [string, string, string, string, string, string, string, string]
    | [string, string, string, string, string, string, string, string, string]
    | [string, string, string, string, string, string, string, string, string, string];
}

}
export namespace Method11OutputTypes {
export interface Method11Output {
  available: boolean;
  activeProfileId: string | null;
  profiles: {
    id: string;
    label: string;
    email: string | null;
    connected: boolean;
    sharing: boolean;
    welcomeSeen: boolean;
    incomplete: boolean;
    removalBlockedReason: string | null;
  }[];
  attempt: {
    id: string;
    profileId: string | null;
    stage: "waiting" | "exchanging" | "completed" | "failed" | "cancelled";
    message: string;
  } | null;
  message: string;
}

}
export namespace Method12InputTypes {
export interface Method12Input {
  profileId: string;
}

}
export namespace Method12OutputTypes {
export interface Method12Output {
  available: boolean;
  activeProfileId: string | null;
  profiles: {
    id: string;
    label: string;
    email: string | null;
    connected: boolean;
    sharing: boolean;
    welcomeSeen: boolean;
    incomplete: boolean;
    removalBlockedReason: string | null;
  }[];
  attempt: {
    id: string;
    profileId: string | null;
    stage: "waiting" | "exchanging" | "completed" | "failed" | "cancelled";
    message: string;
  } | null;
  message: string;
}

}
export namespace Method13InputTypes {
export interface Method13Input {
  profileId: string;
}

}
export namespace Method13OutputTypes {
export interface Method13Output {
  available: boolean;
  activeProfileId: string | null;
  profiles: {
    id: string;
    label: string;
    email: string | null;
    connected: boolean;
    sharing: boolean;
    welcomeSeen: boolean;
    incomplete: boolean;
    removalBlockedReason: string | null;
  }[];
  attempt: {
    id: string;
    profileId: string | null;
    stage: "waiting" | "exchanging" | "completed" | "failed" | "cancelled";
    message: string;
  } | null;
  message: string;
}

}
export namespace Method14InputTypes {
export interface Method14Input {
  profileId: string;
}

}
export namespace Method14OutputTypes {
export type Method14Output = {
  id: string;
  name: string;
}[];

}
export namespace Method15InputTypes {
export interface Method15Input {
  profileId: string;
  modelId: string;
}

}
export namespace Method15OutputTypes {
export interface Method15Output {
  id: string;
  name: string;
  provider: string;
  model: string;
  baseURL: string;
  kind: "openai-compatible" | "pi" | "chatgpt";
  configured: boolean;
  preset: string | null;
  hasApiKey: boolean;
  chatgptProfileId?: string;
  options: {
    [k: string]: string;
  };
}

}
export namespace Method16InputTypes {
export interface Method16Input {}

}
export namespace Method16OutputTypes {
export type Method16Output = null;

}
export namespace Method17InputTypes {
export interface Method17Input {}

}
export namespace Method17OutputTypes {
export type Method17Output = {
  id: string;
  name: string;
  provider: string;
  model: string;
  baseURL: string;
  kind: "openai-compatible" | "pi" | "chatgpt";
  configured: boolean;
  preset: string | null;
  hasApiKey: boolean;
  chatgptProfileId?: string;
  options: {
    [k: string]: string;
  };
}[];

}
export namespace Method18InputTypes {
export interface Method18Input {}

}
export namespace Method18OutputTypes {
export type Method18Output = {
  id: string;
  name: string;
  modelCount: number;
  apiKeySupported: boolean;
  keyLabel: string;
  notice: string;
  fields: {
    key: string;
    label: string;
    placeholder: string;
    required: boolean;
  }[];
}[];

}
export namespace Method19InputTypes {
export interface Method19Input {
  providerId: string;
}

}
export namespace Method19OutputTypes {
export type Method19Output = {
  id: string;
  name: string;
  api: string;
  baseURL: string;
  contextWindow: number;
  reasoning: boolean;
}[];

}
export namespace Method20InputTypes {
export interface Method20Input {
  id?: string;
  name: string;
  provider: string;
  model: string;
  baseURL: string;
  apiKey?: string;
  clearApiKey?: boolean;
  preset?: string | null;
  options?: {
    [k: string]: string;
  };
}

}
export namespace Method20OutputTypes {
export interface Method20Output {
  id: string;
  name: string;
  provider: string;
  model: string;
  baseURL: string;
  kind: "openai-compatible" | "pi" | "chatgpt";
  configured: boolean;
  preset: string | null;
  hasApiKey: boolean;
  chatgptProfileId?: string;
  options: {
    [k: string]: string;
  };
}

}
export namespace Method21InputTypes {
export interface Method21Input {
  id: string;
}

}
export namespace Method21OutputTypes {
export type Method21Output = null;

}
export namespace Method22InputTypes {
export interface Method22Input {
  pluginId: string;
  modelId: string;
  prompt: string;
  system?: string;
  title?: string;
}

}
export namespace Method22OutputTypes {
export interface Method22Output {
  id: string;
  pluginId: string;
  modelId: string;
  title: string;
  input: string;
  output: string;
  status: "running" | "completed" | "cancelled" | "failed";
  error: string | null;
  createdAt: number;
  updatedAt: number;
  revision: number;
  demo: boolean;
}

}
export namespace Method23InputTypes {
export interface Method23Input {
  pluginId: string;
}

}
export namespace Method23OutputTypes {
export type Method23Output = {
  id: string;
  pluginId: string;
  modelId: string;
  title: string;
  input: string;
  output: string;
  status: "running" | "completed" | "cancelled" | "failed";
  error: string | null;
  createdAt: number;
  updatedAt: number;
  revision: number;
  demo: boolean;
}[];

}
export namespace Method24InputTypes {
export interface Method24Input {
  pluginId: string;
  runId: string;
}

}
export namespace Method24OutputTypes {
export interface Method24Output {
  id: string;
  pluginId: string;
  modelId: string;
  title: string;
  input: string;
  output: string;
  status: "running" | "completed" | "cancelled" | "failed";
  error: string | null;
  createdAt: number;
  updatedAt: number;
  revision: number;
  demo: boolean;
}

}
export namespace Method25InputTypes {
export interface Method25Input {
  pluginId: string;
  runId: string;
}

}
export namespace Method25OutputTypes {
export interface Method25Output {
  id: string;
  pluginId: string;
  modelId: string;
  title: string;
  input: string;
  output: string;
  status: "running" | "completed" | "cancelled" | "failed";
  error: string | null;
  createdAt: number;
  updatedAt: number;
  revision: number;
  demo: boolean;
}

}
export namespace Method26InputTypes {
export interface Method26Input {}

}
export namespace Method26OutputTypes {
export type _Schema0 =
  | string
  | number
  | boolean
  | null
  | _Schema0[]
  | {
      [k: string]: _Schema0;
    };
export type Method26Output = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  version: string;
  packageName: string;
  source: string;
  market: {
    marketId: string;
    marketURL: string;
  } | null;
  enabled: boolean;
  status: "active" | "disabled" | "error";
  error: string | null;
  clientURL: string;
  styleURL: string | null;
  keepAlive: boolean;
  methods: {
    name: string;
    description: string;
    inputSchema: _Schema0;
  }[];
}[];

}
export namespace Method27InputTypes {
export type _Schema0 =
  | string
  | number
  | boolean
  | null
  | _Schema0[]
  | {
      [k: string]: _Schema0;
    };

export interface Method27Input {
  pluginId: string;
  method: string;
  input: _Schema0;
}

}
export namespace Method27OutputTypes {
export type Method27Output =
  | string
  | number
  | boolean
  | null
  | Method27Output[]
  | {
      [k: string]: Method27Output;
    };

}
export namespace Method28InputTypes {
export interface Method28Input {
  source: string;
}

}
export namespace Method28OutputTypes {
export interface Method28Output {
  operation: "install" | "update";
  targetVersion: string | null;
  id: string;
  source: string;
  status: "installing" | "completed" | "failed";
  message: string;
  pluginId: string | null;
  createdAt: number;
}

}
export namespace Method29InputTypes {
export interface Method29Input {}

}
export namespace Method29OutputTypes {
export type Method29Output = {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  updatedAt: number | null;
  error: string | null;
  refreshing: boolean;
  count: number;
}[];

}
export namespace Method30InputTypes {
export interface Method30Input {
  name: string;
  url: string;
}

}
export namespace Method30OutputTypes {
export interface Method30Output {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  updatedAt: number | null;
  error: string | null;
  refreshing: boolean;
  count: number;
}

}
export namespace Method31InputTypes {
export interface Method31Input {
  id: string;
  name?: string;
  enabled?: boolean;
}

}
export namespace Method31OutputTypes {
export interface Method31Output {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  updatedAt: number | null;
  error: string | null;
  refreshing: boolean;
  count: number;
}

}
export namespace Method32InputTypes {
export interface Method32Input {
  id: string;
}

}
export namespace Method32OutputTypes {
export type Method32Output = null;

}
export namespace Method33InputTypes {
export interface Method33Input {
  id?: string;
}

}
export namespace Method33OutputTypes {
export type Method33Output = {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  updatedAt: number | null;
  error: string | null;
  refreshing: boolean;
  count: number;
}[];

}
export namespace Method34InputTypes {
export interface Method34Input {
  marketId?: string;
  query?: string;
  offset?: number;
  limit?: number;
}

}
export namespace Method34OutputTypes {
export interface Method34Output {
  items: {
    id: string;
    packageName: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    version: string;
    sdkVersion: string;
    url: string;
    sha256: string;
    marketId: string;
    marketName: string;
    installedVersion: string | null;
    state: "available" | "installed" | "update" | "incompatible" | "conflict";
  }[];
  total: number;
  nextOffset: number | null;
}

}
export namespace Method35InputTypes {
export interface Method35Input {
  marketId: string;
  pluginId: string;
}

}
export namespace Method35OutputTypes {
export interface Method35Output {
  operation: "install" | "update";
  targetVersion: string | null;
  id: string;
  source: string;
  status: "installing" | "completed" | "failed";
  message: string;
  pluginId: string | null;
  createdAt: number;
}

}
export namespace Method36InputTypes {
export interface Method36Input {
  pluginId: string;
  source?: string;
}

}
export namespace Method36OutputTypes {
export interface Method36Output {
  operation: "install" | "update";
  targetVersion: string | null;
  id: string;
  source: string;
  status: "installing" | "completed" | "failed";
  message: string;
  pluginId: string | null;
  createdAt: number;
}

}
export namespace Method37InputTypes {
export interface Method37Input {}

}
export namespace Method37OutputTypes {
export type Method37Output = {
  operation: "install" | "update";
  targetVersion: string | null;
  id: string;
  source: string;
  status: "installing" | "completed" | "failed";
  message: string;
  pluginId: string | null;
  createdAt: number;
}[];

}
export namespace Method38InputTypes {
export interface Method38Input {
  pluginId: string;
  enabled: boolean;
}

}
export namespace Method38OutputTypes {
export type _Schema0 =
  | string
  | number
  | boolean
  | null
  | _Schema0[]
  | {
      [k: string]: _Schema0;
    };

export interface Method38Output {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  version: string;
  packageName: string;
  source: string;
  market: {
    marketId: string;
    marketURL: string;
  } | null;
  enabled: boolean;
  status: "active" | "disabled" | "error";
  error: string | null;
  clientURL: string;
  styleURL: string | null;
  keepAlive: boolean;
  methods: {
    name: string;
    description: string;
    inputSchema: _Schema0;
  }[];
}

}
export namespace Method39InputTypes {
export interface Method39Input {
  pluginId: string;
}

}
export namespace Method39OutputTypes {
export type Method39Output = null;

}
export namespace Method40InputTypes {
export interface Method40Input {
  pluginId: string;
  key: string;
}

}
export namespace Method40OutputTypes {
export type Method40Output =
  | string
  | number
  | boolean
  | null
  | Method40Output[]
  | {
      [k: string]: Method40Output;
    };

}
export namespace Method41InputTypes {
export type _Schema0 =
  | string
  | number
  | boolean
  | null
  | _Schema0[]
  | {
      [k: string]: _Schema0;
    };

export interface Method41Input {
  pluginId: string;
  key: string;
  value: _Schema0;
}

}
export namespace Method41OutputTypes {
export type Method41Output = null;

}
export namespace Method42InputTypes {
export interface Method42Input {
  pluginId: string;
  key: string;
}

}
export namespace Method42OutputTypes {
export type Method42Output = null;

}
export namespace Event43Types {
export interface Event43 {
  pluginId: string;
  id: string;
  kind: "search" | "fetch";
  status: "running" | "completed" | "failed" | "cancelled";
}

}
export namespace Event44Types {
export interface Event44 {
  theme: "system" | "light" | "dark";
  colorTheme: {
    preset: "default" | "github" | "custom";
    custom: {
      light: {
        accent: string;
        background: string;
        foreground: string;
      };
      dark: {
        accent: string;
        background: string;
        foreground: string;
      };
    };
  };
}

}
export namespace Event45Types {
export interface Event45 {
  pluginId: string;
  runId: string;
  revision: number;
  status: "running" | "completed" | "cancelled" | "failed";
}

}
export namespace Event46Types {
export interface Event46 {
  revision: number;
}

}
export namespace Event47Types {
export interface Event47 {
  revision: number;
}

}
export namespace Event48Types {
export interface Event48 {
  revision: number;
}

}
export namespace Event49Types {
export interface Event49 {
  revision: number;
}

}
export interface FIAApplication {
call(method: "web.search", input: Method0InputTypes.Method0Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method0OutputTypes.Method0Output>;
call(method: "web.fetch", input: Method1InputTypes.Method1Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method1OutputTypes.Method1Output>;
call(method: "web.get", input: Method2InputTypes.Method2Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method2OutputTypes.Method2Output>;
call(method: "web.cancel", input: Method3InputTypes.Method3Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method3OutputTypes.Method3Output>;
call(method: "appearance.get", input: Method4InputTypes.Method4Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method4OutputTypes.Method4Output>;
call(method: "appearance.set", input: Method5InputTypes.Method5Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method5OutputTypes.Method5Output>;
call(method: "chatgpt.status", input: Method6InputTypes.Method6Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method6OutputTypes.Method6Output>;
call(method: "chatgpt.signIn", input: Method7InputTypes.Method7Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method7OutputTypes.Method7Output>;
call(method: "chatgpt.cancel", input: Method8InputTypes.Method8Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method8OutputTypes.Method8Output>;
call(method: "chatgpt.select", input: Method9InputTypes.Method9Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method9OutputTypes.Method9Output>;
call(method: "chatgpt.rename", input: Method10InputTypes.Method10Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method10OutputTypes.Method10Output>;
call(method: "chatgpt.remove", input: Method11InputTypes.Method11Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method11OutputTypes.Method11Output>;
call(method: "chatgpt.signOut", input: Method12InputTypes.Method12Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method12OutputTypes.Method12Output>;
call(method: "chatgpt.acknowledge", input: Method13InputTypes.Method13Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method13OutputTypes.Method13Output>;
call(method: "chatgpt.catalog", input: Method14InputTypes.Method14Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method14OutputTypes.Method14Output>;
call(method: "chatgpt.addModel", input: Method15InputTypes.Method15Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method15OutputTypes.Method15Output>;
call(method: "chatgpt.manageUsage", input: Method16InputTypes.Method16Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method16OutputTypes.Method16Output>;
call(method: "models.list", input: Method17InputTypes.Method17Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method17OutputTypes.Method17Output>;
call(method: "models.providers", input: Method18InputTypes.Method18Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method18OutputTypes.Method18Output>;
call(method: "models.catalog", input: Method19InputTypes.Method19Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method19OutputTypes.Method19Output>;
call(method: "models.save", input: Method20InputTypes.Method20Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method20OutputTypes.Method20Output>;
call(method: "models.remove", input: Method21InputTypes.Method21Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method21OutputTypes.Method21Output>;
call(method: "models.generate", input: Method22InputTypes.Method22Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method22OutputTypes.Method22Output>;
call(method: "runs.list", input: Method23InputTypes.Method23Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method23OutputTypes.Method23Output>;
call(method: "runs.get", input: Method24InputTypes.Method24Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method24OutputTypes.Method24Output>;
call(method: "runs.cancel", input: Method25InputTypes.Method25Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method25OutputTypes.Method25Output>;
call(method: "plugins.list", input: Method26InputTypes.Method26Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method26OutputTypes.Method26Output>;
call(method: "plugins.invoke", input: Method27InputTypes.Method27Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method27OutputTypes.Method27Output>;
call(method: "plugins.install", input: Method28InputTypes.Method28Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method28OutputTypes.Method28Output>;
call(method: "marketplaces.list", input: Method29InputTypes.Method29Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method29OutputTypes.Method29Output>;
call(method: "marketplaces.add", input: Method30InputTypes.Method30Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method30OutputTypes.Method30Output>;
call(method: "marketplaces.update", input: Method31InputTypes.Method31Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method31OutputTypes.Method31Output>;
call(method: "marketplaces.remove", input: Method32InputTypes.Method32Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method32OutputTypes.Method32Output>;
call(method: "marketplaces.refresh", input: Method33InputTypes.Method33Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method33OutputTypes.Method33Output>;
call(method: "marketplaces.catalog", input: Method34InputTypes.Method34Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method34OutputTypes.Method34Output>;
call(method: "plugins.installFromMarket", input: Method35InputTypes.Method35Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method35OutputTypes.Method35Output>;
call(method: "plugins.update", input: Method36InputTypes.Method36Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method36OutputTypes.Method36Output>;
call(method: "plugins.jobs", input: Method37InputTypes.Method37Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method37OutputTypes.Method37Output>;
call(method: "plugins.setEnabled", input: Method38InputTypes.Method38Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method38OutputTypes.Method38Output>;
call(method: "plugins.uninstall", input: Method39InputTypes.Method39Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method39OutputTypes.Method39Output>;
call(method: "kv.get", input: Method40InputTypes.Method40Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method40OutputTypes.Method40Output>;
call(method: "kv.set", input: Method41InputTypes.Method41Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method41OutputTypes.Method41Output>;
call(method: "kv.delete", input: Method42InputTypes.Method42Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method42OutputTypes.Method42Output>;
on(event: "web.changed", listener: (payload: Event43Types.Event43) => void, options?: {match?: Readonly<Record<string, string | number | boolean | null>>}): () => void;
on(event: "appearance.changed", listener: (payload: Event44Types.Event44) => void, options?: {match?: Readonly<Record<string, string | number | boolean | null>>}): () => void;
on(event: "runs.changed", listener: (payload: Event45Types.Event45) => void, options?: {match?: Readonly<Record<string, string | number | boolean | null>>}): () => void;
on(event: "marketplaces.changed", listener: (payload: Event46Types.Event46) => void, options?: {match?: Readonly<Record<string, string | number | boolean | null>>}): () => void;
on(event: "plugins.changed", listener: (payload: Event47Types.Event47) => void, options?: {match?: Readonly<Record<string, string | number | boolean | null>>}): () => void;
on(event: "chatgpt.changed", listener: (payload: Event48Types.Event48) => void, options?: {match?: Readonly<Record<string, string | number | boolean | null>>}): () => void;
on(event: "models.changed", listener: (payload: Event49Types.Event49) => void, options?: {match?: Readonly<Record<string, string | number | boolean | null>>}): () => void;
onReconnect(listener: () => void): () => void;
close(): void;
}
declare global { const app: FIAApplication; function help(name?: string): string; }
