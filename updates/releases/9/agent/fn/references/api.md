# API reference

Application build: 9

## web.search

Start an independent web search. Returns a short-lived task; read web.get for results.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "pluginId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "input": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "minLength": 1,
          "maxLength": 4000
        },
        "engines": {
          "minItems": 1,
          "maxItems": 4,
          "type": "array",
          "items": {
            "type": "string",
            "enum": [
              "baidu",
              "wechat",
              "toutiao",
              "duckduckgo"
            ]
          }
        },
        "limit": {
          "type": "integer",
          "exclusiveMinimum": 0,
          "maximum": 30
        },
        "timeRange": {
          "type": "string",
          "enum": [
            "day",
            "week",
            "month",
            "year"
          ]
        },
        "site": {
          "type": "string",
          "minLength": 1,
          "maxLength": 253
        },
        "timeoutMs": {
          "type": "integer",
          "exclusiveMinimum": 0,
          "maximum": 120000
        }
      },
      "required": [
        "query"
      ],
      "additionalProperties": false
    }
  },
  "required": [
    "pluginId",
    "input"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "pluginId": {
      "type": "string"
    },
    "kind": {
      "type": "string",
      "enum": [
        "search",
        "fetch"
      ]
    },
    "status": {
      "type": "string",
      "enum": [
        "running",
        "completed",
        "failed",
        "cancelled"
      ]
    },
    "result": {
      "anyOf": [
        {
          "anyOf": [
            {
              "type": "object",
              "properties": {
                "text": {
                  "type": "string"
                },
                "results": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer",
                        "exclusiveMinimum": 0,
                        "maximum": 9007199254740991
                      },
                      "title": {
                        "type": "string"
                      },
                      "url": {
                        "type": "string"
                      },
                      "snippet": {
                        "type": "string"
                      },
                      "score": {
                        "type": "number"
                      },
                      "engines": {
                        "type": "array",
                        "items": {
                          "type": "string",
                          "enum": [
                            "baidu",
                            "wechat",
                            "toutiao",
                            "duckduckgo"
                          ]
                        }
                      },
                      "meta": {
                        "type": "object",
                        "propertyNames": {
                          "type": "string"
                        },
                        "additionalProperties": {
                          "type": "string"
                        }
                      },
                      "fetched": {
                        "type": "boolean"
                      }
                    },
                    "required": [
                      "id",
                      "title",
                      "url",
                      "snippet",
                      "score",
                      "engines",
                      "meta",
                      "fetched"
                    ],
                    "additionalProperties": false
                  }
                },
                "engines": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "engine": {
                        "type": "string",
                        "enum": [
                          "baidu",
                          "wechat",
                          "toutiao",
                          "duckduckgo"
                        ]
                      },
                      "status": {
                        "type": "string",
                        "enum": [
                          "success",
                          "no_results",
                          "invalid_results",
                          "error"
                        ]
                      },
                      "ok": {
                        "type": "boolean"
                      },
                      "count": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 9007199254740991
                      },
                      "rawCount": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 9007199254740991
                      },
                      "error": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "engine",
                      "status",
                      "ok",
                      "count",
                      "rawCount"
                    ],
                    "additionalProperties": false
                  }
                }
              },
              "required": [
                "text",
                "results",
                "engines"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "url": {
                  "type": "string"
                },
                "finalUrl": {
                  "type": "string"
                },
                "status": {
                  "type": "integer",
                  "minimum": -9007199254740991,
                  "maximum": 9007199254740991
                },
                "contentType": {
                  "type": "string"
                },
                "title": {
                  "type": "string"
                },
                "format": {
                  "type": "string",
                  "enum": [
                    "markdown",
                    "text",
                    "html"
                  ]
                },
                "text": {
                  "type": "string"
                },
                "truncated": {
                  "type": "boolean"
                },
                "redirect": {
                  "type": "object",
                  "properties": {
                    "from": {
                      "type": "string"
                    },
                    "to": {
                      "type": "string"
                    },
                    "status": {
                      "type": "integer",
                      "minimum": -9007199254740991,
                      "maximum": 9007199254740991
                    }
                  },
                  "required": [
                    "from",
                    "to",
                    "status"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "url",
                "finalUrl",
                "status",
                "contentType",
                "title",
                "format",
                "text",
                "truncated"
              ],
              "additionalProperties": false
            }
          ]
        },
        {
          "type": "null"
        }
      ]
    },
    "error": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "code": {
              "type": "string"
            },
            "message": {
              "type": "string"
            }
          },
          "required": [
            "code",
            "message"
          ],
          "additionalProperties": false
        },
        {
          "type": "null"
        }
      ]
    },
    "createdAt": {
      "type": "number"
    },
    "updatedAt": {
      "type": "number"
    }
  },
  "required": [
    "id",
    "pluginId",
    "kind",
    "status",
    "result",
    "error",
    "createdAt",
    "updatedAt"
  ],
  "additionalProperties": false
}
```

## web.fetch

Start an independent page fetch. HTTP error pages and redirects retain structured metadata.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "pluginId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "input": {
      "type": "object",
      "properties": {
        "url": {
          "type": "string",
          "maxLength": 2000,
          "format": "uri"
        },
        "format": {
          "type": "string",
          "enum": [
            "markdown",
            "text",
            "html"
          ]
        },
        "maxBytes": {
          "type": "integer",
          "exclusiveMinimum": 0,
          "maximum": 1000000
        },
        "timeoutMs": {
          "type": "integer",
          "exclusiveMinimum": 0,
          "maximum": 120000
        }
      },
      "required": [
        "url"
      ],
      "additionalProperties": false
    }
  },
  "required": [
    "pluginId",
    "input"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "pluginId": {
      "type": "string"
    },
    "kind": {
      "type": "string",
      "enum": [
        "search",
        "fetch"
      ]
    },
    "status": {
      "type": "string",
      "enum": [
        "running",
        "completed",
        "failed",
        "cancelled"
      ]
    },
    "result": {
      "anyOf": [
        {
          "anyOf": [
            {
              "type": "object",
              "properties": {
                "text": {
                  "type": "string"
                },
                "results": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer",
                        "exclusiveMinimum": 0,
                        "maximum": 9007199254740991
                      },
                      "title": {
                        "type": "string"
                      },
                      "url": {
                        "type": "string"
                      },
                      "snippet": {
                        "type": "string"
                      },
                      "score": {
                        "type": "number"
                      },
                      "engines": {
                        "type": "array",
                        "items": {
                          "type": "string",
                          "enum": [
                            "baidu",
                            "wechat",
                            "toutiao",
                            "duckduckgo"
                          ]
                        }
                      },
                      "meta": {
                        "type": "object",
                        "propertyNames": {
                          "type": "string"
                        },
                        "additionalProperties": {
                          "type": "string"
                        }
                      },
                      "fetched": {
                        "type": "boolean"
                      }
                    },
                    "required": [
                      "id",
                      "title",
                      "url",
                      "snippet",
                      "score",
                      "engines",
                      "meta",
                      "fetched"
                    ],
                    "additionalProperties": false
                  }
                },
                "engines": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "engine": {
                        "type": "string",
                        "enum": [
                          "baidu",
                          "wechat",
                          "toutiao",
                          "duckduckgo"
                        ]
                      },
                      "status": {
                        "type": "string",
                        "enum": [
                          "success",
                          "no_results",
                          "invalid_results",
                          "error"
                        ]
                      },
                      "ok": {
                        "type": "boolean"
                      },
                      "count": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 9007199254740991
                      },
                      "rawCount": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 9007199254740991
                      },
                      "error": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "engine",
                      "status",
                      "ok",
                      "count",
                      "rawCount"
                    ],
                    "additionalProperties": false
                  }
                }
              },
              "required": [
                "text",
                "results",
                "engines"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "url": {
                  "type": "string"
                },
                "finalUrl": {
                  "type": "string"
                },
                "status": {
                  "type": "integer",
                  "minimum": -9007199254740991,
                  "maximum": 9007199254740991
                },
                "contentType": {
                  "type": "string"
                },
                "title": {
                  "type": "string"
                },
                "format": {
                  "type": "string",
                  "enum": [
                    "markdown",
                    "text",
                    "html"
                  ]
                },
                "text": {
                  "type": "string"
                },
                "truncated": {
                  "type": "boolean"
                },
                "redirect": {
                  "type": "object",
                  "properties": {
                    "from": {
                      "type": "string"
                    },
                    "to": {
                      "type": "string"
                    },
                    "status": {
                      "type": "integer",
                      "minimum": -9007199254740991,
                      "maximum": 9007199254740991
                    }
                  },
                  "required": [
                    "from",
                    "to",
                    "status"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "url",
                "finalUrl",
                "status",
                "contentType",
                "title",
                "format",
                "text",
                "truncated"
              ],
              "additionalProperties": false
            }
          ]
        },
        {
          "type": "null"
        }
      ]
    },
    "error": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "code": {
              "type": "string"
            },
            "message": {
              "type": "string"
            }
          },
          "required": [
            "code",
            "message"
          ],
          "additionalProperties": false
        },
        {
          "type": "null"
        }
      ]
    },
    "createdAt": {
      "type": "number"
    },
    "updatedAt": {
      "type": "number"
    }
  },
  "required": [
    "id",
    "pluginId",
    "kind",
    "status",
    "result",
    "error",
    "createdAt",
    "updatedAt"
  ],
  "additionalProperties": false
}
```

## web.get

Read a plugin-owned network task. Results expire after 10 minutes or capacity eviction.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "pluginId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "taskId": {
      "type": "string"
    }
  },
  "required": [
    "pluginId",
    "taskId"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "pluginId": {
      "type": "string"
    },
    "kind": {
      "type": "string",
      "enum": [
        "search",
        "fetch"
      ]
    },
    "status": {
      "type": "string",
      "enum": [
        "running",
        "completed",
        "failed",
        "cancelled"
      ]
    },
    "result": {
      "anyOf": [
        {
          "anyOf": [
            {
              "type": "object",
              "properties": {
                "text": {
                  "type": "string"
                },
                "results": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer",
                        "exclusiveMinimum": 0,
                        "maximum": 9007199254740991
                      },
                      "title": {
                        "type": "string"
                      },
                      "url": {
                        "type": "string"
                      },
                      "snippet": {
                        "type": "string"
                      },
                      "score": {
                        "type": "number"
                      },
                      "engines": {
                        "type": "array",
                        "items": {
                          "type": "string",
                          "enum": [
                            "baidu",
                            "wechat",
                            "toutiao",
                            "duckduckgo"
                          ]
                        }
                      },
                      "meta": {
                        "type": "object",
                        "propertyNames": {
                          "type": "string"
                        },
                        "additionalProperties": {
                          "type": "string"
                        }
                      },
                      "fetched": {
                        "type": "boolean"
                      }
                    },
                    "required": [
                      "id",
                      "title",
                      "url",
                      "snippet",
                      "score",
                      "engines",
                      "meta",
                      "fetched"
                    ],
                    "additionalProperties": false
                  }
                },
                "engines": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "engine": {
                        "type": "string",
                        "enum": [
                          "baidu",
                          "wechat",
                          "toutiao",
                          "duckduckgo"
                        ]
                      },
                      "status": {
                        "type": "string",
                        "enum": [
                          "success",
                          "no_results",
                          "invalid_results",
                          "error"
                        ]
                      },
                      "ok": {
                        "type": "boolean"
                      },
                      "count": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 9007199254740991
                      },
                      "rawCount": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 9007199254740991
                      },
                      "error": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "engine",
                      "status",
                      "ok",
                      "count",
                      "rawCount"
                    ],
                    "additionalProperties": false
                  }
                }
              },
              "required": [
                "text",
                "results",
                "engines"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "url": {
                  "type": "string"
                },
                "finalUrl": {
                  "type": "string"
                },
                "status": {
                  "type": "integer",
                  "minimum": -9007199254740991,
                  "maximum": 9007199254740991
                },
                "contentType": {
                  "type": "string"
                },
                "title": {
                  "type": "string"
                },
                "format": {
                  "type": "string",
                  "enum": [
                    "markdown",
                    "text",
                    "html"
                  ]
                },
                "text": {
                  "type": "string"
                },
                "truncated": {
                  "type": "boolean"
                },
                "redirect": {
                  "type": "object",
                  "properties": {
                    "from": {
                      "type": "string"
                    },
                    "to": {
                      "type": "string"
                    },
                    "status": {
                      "type": "integer",
                      "minimum": -9007199254740991,
                      "maximum": 9007199254740991
                    }
                  },
                  "required": [
                    "from",
                    "to",
                    "status"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "url",
                "finalUrl",
                "status",
                "contentType",
                "title",
                "format",
                "text",
                "truncated"
              ],
              "additionalProperties": false
            }
          ]
        },
        {
          "type": "null"
        }
      ]
    },
    "error": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "code": {
              "type": "string"
            },
            "message": {
              "type": "string"
            }
          },
          "required": [
            "code",
            "message"
          ],
          "additionalProperties": false
        },
        {
          "type": "null"
        }
      ]
    },
    "createdAt": {
      "type": "number"
    },
    "updatedAt": {
      "type": "number"
    }
  },
  "required": [
    "id",
    "pluginId",
    "kind",
    "status",
    "result",
    "error",
    "createdAt",
    "updatedAt"
  ],
  "additionalProperties": false
}
```

## web.cancel

Cancel a plugin-owned network task and wait for its terminal state.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "pluginId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "taskId": {
      "type": "string"
    }
  },
  "required": [
    "pluginId",
    "taskId"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "pluginId": {
      "type": "string"
    },
    "kind": {
      "type": "string",
      "enum": [
        "search",
        "fetch"
      ]
    },
    "status": {
      "type": "string",
      "enum": [
        "running",
        "completed",
        "failed",
        "cancelled"
      ]
    },
    "result": {
      "anyOf": [
        {
          "anyOf": [
            {
              "type": "object",
              "properties": {
                "text": {
                  "type": "string"
                },
                "results": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer",
                        "exclusiveMinimum": 0,
                        "maximum": 9007199254740991
                      },
                      "title": {
                        "type": "string"
                      },
                      "url": {
                        "type": "string"
                      },
                      "snippet": {
                        "type": "string"
                      },
                      "score": {
                        "type": "number"
                      },
                      "engines": {
                        "type": "array",
                        "items": {
                          "type": "string",
                          "enum": [
                            "baidu",
                            "wechat",
                            "toutiao",
                            "duckduckgo"
                          ]
                        }
                      },
                      "meta": {
                        "type": "object",
                        "propertyNames": {
                          "type": "string"
                        },
                        "additionalProperties": {
                          "type": "string"
                        }
                      },
                      "fetched": {
                        "type": "boolean"
                      }
                    },
                    "required": [
                      "id",
                      "title",
                      "url",
                      "snippet",
                      "score",
                      "engines",
                      "meta",
                      "fetched"
                    ],
                    "additionalProperties": false
                  }
                },
                "engines": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "engine": {
                        "type": "string",
                        "enum": [
                          "baidu",
                          "wechat",
                          "toutiao",
                          "duckduckgo"
                        ]
                      },
                      "status": {
                        "type": "string",
                        "enum": [
                          "success",
                          "no_results",
                          "invalid_results",
                          "error"
                        ]
                      },
                      "ok": {
                        "type": "boolean"
                      },
                      "count": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 9007199254740991
                      },
                      "rawCount": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 9007199254740991
                      },
                      "error": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "engine",
                      "status",
                      "ok",
                      "count",
                      "rawCount"
                    ],
                    "additionalProperties": false
                  }
                }
              },
              "required": [
                "text",
                "results",
                "engines"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "url": {
                  "type": "string"
                },
                "finalUrl": {
                  "type": "string"
                },
                "status": {
                  "type": "integer",
                  "minimum": -9007199254740991,
                  "maximum": 9007199254740991
                },
                "contentType": {
                  "type": "string"
                },
                "title": {
                  "type": "string"
                },
                "format": {
                  "type": "string",
                  "enum": [
                    "markdown",
                    "text",
                    "html"
                  ]
                },
                "text": {
                  "type": "string"
                },
                "truncated": {
                  "type": "boolean"
                },
                "redirect": {
                  "type": "object",
                  "properties": {
                    "from": {
                      "type": "string"
                    },
                    "to": {
                      "type": "string"
                    },
                    "status": {
                      "type": "integer",
                      "minimum": -9007199254740991,
                      "maximum": 9007199254740991
                    }
                  },
                  "required": [
                    "from",
                    "to",
                    "status"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "url",
                "finalUrl",
                "status",
                "contentType",
                "title",
                "format",
                "text",
                "truncated"
              ],
              "additionalProperties": false
            }
          ]
        },
        {
          "type": "null"
        }
      ]
    },
    "error": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "code": {
              "type": "string"
            },
            "message": {
              "type": "string"
            }
          },
          "required": [
            "code",
            "message"
          ],
          "additionalProperties": false
        },
        {
          "type": "null"
        }
      ]
    },
    "createdAt": {
      "type": "number"
    },
    "updatedAt": {
      "type": "number"
    }
  },
  "required": [
    "id",
    "pluginId",
    "kind",
    "status",
    "result",
    "error",
    "createdAt",
    "updatedAt"
  ],
  "additionalProperties": false
}
```

## appearance.get

Read the saved application theme preference.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {},
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "theme": {
      "type": "string",
      "enum": [
        "system",
        "light",
        "dark"
      ]
    },
    "colorTheme": {
      "type": "object",
      "properties": {
        "preset": {
          "type": "string",
          "enum": [
            "default",
            "github",
            "custom"
          ]
        },
        "custom": {
          "type": "object",
          "properties": {
            "light": {
              "type": "object",
              "properties": {
                "accent": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                },
                "background": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                },
                "foreground": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                }
              },
              "required": [
                "accent",
                "background",
                "foreground"
              ],
              "additionalProperties": false
            },
            "dark": {
              "type": "object",
              "properties": {
                "accent": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                },
                "background": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                },
                "foreground": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                }
              },
              "required": [
                "accent",
                "background",
                "foreground"
              ],
              "additionalProperties": false
            }
          },
          "required": [
            "light",
            "dark"
          ],
          "additionalProperties": false
        }
      },
      "required": [
        "preset",
        "custom"
      ],
      "additionalProperties": false
    }
  },
  "required": [
    "theme",
    "colorTheme"
  ],
  "additionalProperties": false
}
```

## appearance.set

Save appearance changes. Mode controls native windows; colorTheme controls host and plugin content only. Omitted fields are retained.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "theme": {
      "type": "string",
      "enum": [
        "system",
        "light",
        "dark"
      ]
    },
    "colorTheme": {
      "type": "object",
      "properties": {
        "preset": {
          "type": "string",
          "enum": [
            "default",
            "github",
            "custom"
          ]
        },
        "custom": {
          "type": "object",
          "properties": {
            "light": {
              "type": "object",
              "properties": {
                "accent": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                },
                "background": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                },
                "foreground": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                }
              },
              "required": [
                "accent",
                "background",
                "foreground"
              ],
              "additionalProperties": false
            },
            "dark": {
              "type": "object",
              "properties": {
                "accent": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                },
                "background": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                },
                "foreground": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                }
              },
              "required": [
                "accent",
                "background",
                "foreground"
              ],
              "additionalProperties": false
            }
          },
          "required": [
            "light",
            "dark"
          ],
          "additionalProperties": false
        }
      },
      "required": [
        "preset",
        "custom"
      ],
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "theme": {
      "type": "string",
      "enum": [
        "system",
        "light",
        "dark"
      ]
    },
    "colorTheme": {
      "type": "object",
      "properties": {
        "preset": {
          "type": "string",
          "enum": [
            "default",
            "github",
            "custom"
          ]
        },
        "custom": {
          "type": "object",
          "properties": {
            "light": {
              "type": "object",
              "properties": {
                "accent": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                },
                "background": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                },
                "foreground": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                }
              },
              "required": [
                "accent",
                "background",
                "foreground"
              ],
              "additionalProperties": false
            },
            "dark": {
              "type": "object",
              "properties": {
                "accent": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                },
                "background": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                },
                "foreground": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                }
              },
              "required": [
                "accent",
                "background",
                "foreground"
              ],
              "additionalProperties": false
            }
          },
          "required": [
            "light",
            "dark"
          ],
          "additionalProperties": false
        }
      },
      "required": [
        "preset",
        "custom"
      ],
      "additionalProperties": false
    }
  },
  "required": [
    "theme",
    "colorTheme"
  ],
  "additionalProperties": false
}
```

## chatgpt.status

Read saved ChatGPT connection summaries without credentials.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {},
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "available": {
      "type": "boolean"
    },
    "activeProfileId": {
      "type": [
        "string",
        "null"
      ]
    },
    "profiles": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "label": {
            "type": "string"
          },
          "email": {
            "type": [
              "string",
              "null"
            ]
          },
          "connected": {
            "type": "boolean"
          },
          "sharing": {
            "type": "boolean"
          },
          "welcomeSeen": {
            "type": "boolean"
          },
          "incomplete": {
            "type": "boolean"
          },
          "removalBlockedReason": {
            "type": [
              "string",
              "null"
            ]
          }
        },
        "required": [
          "id",
          "label",
          "email",
          "connected",
          "sharing",
          "welcomeSeen",
          "incomplete",
          "removalBlockedReason"
        ],
        "additionalProperties": false
      }
    },
    "attempt": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "profileId": {
              "type": [
                "string",
                "null"
              ]
            },
            "stage": {
              "type": "string",
              "enum": [
                "waiting",
                "exchanging",
                "completed",
                "failed",
                "cancelled"
              ]
            },
            "message": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "profileId",
            "stage",
            "message"
          ],
          "additionalProperties": false
        },
        {
          "type": "null"
        }
      ]
    },
    "message": {
      "type": "string"
    }
  },
  "required": [
    "available",
    "activeProfileId",
    "profiles",
    "attempt",
    "message"
  ],
  "additionalProperties": false
}
```

## chatgpt.signIn

Start official ChatGPT OAuth in the system browser; returns promptly. Omit profileId only to register a new account.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "profileId": {
      "type": "string"
    },
    "consent": {
      "type": "boolean"
    }
  },
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "available": {
      "type": "boolean"
    },
    "activeProfileId": {
      "type": [
        "string",
        "null"
      ]
    },
    "profiles": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "label": {
            "type": "string"
          },
          "email": {
            "type": [
              "string",
              "null"
            ]
          },
          "connected": {
            "type": "boolean"
          },
          "sharing": {
            "type": "boolean"
          },
          "welcomeSeen": {
            "type": "boolean"
          },
          "incomplete": {
            "type": "boolean"
          },
          "removalBlockedReason": {
            "type": [
              "string",
              "null"
            ]
          }
        },
        "required": [
          "id",
          "label",
          "email",
          "connected",
          "sharing",
          "welcomeSeen",
          "incomplete",
          "removalBlockedReason"
        ],
        "additionalProperties": false
      }
    },
    "attempt": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "profileId": {
              "type": [
                "string",
                "null"
              ]
            },
            "stage": {
              "type": "string",
              "enum": [
                "waiting",
                "exchanging",
                "completed",
                "failed",
                "cancelled"
              ]
            },
            "message": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "profileId",
            "stage",
            "message"
          ],
          "additionalProperties": false
        },
        {
          "type": "null"
        }
      ]
    },
    "message": {
      "type": "string"
    }
  },
  "required": [
    "available",
    "activeProfileId",
    "profiles",
    "attempt",
    "message"
  ],
  "additionalProperties": false
}
```

## chatgpt.cancel

Cancel an outstanding ChatGPT sign-in attempt.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "available": {
      "type": "boolean"
    },
    "activeProfileId": {
      "type": [
        "string",
        "null"
      ]
    },
    "profiles": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "label": {
            "type": "string"
          },
          "email": {
            "type": [
              "string",
              "null"
            ]
          },
          "connected": {
            "type": "boolean"
          },
          "sharing": {
            "type": "boolean"
          },
          "welcomeSeen": {
            "type": "boolean"
          },
          "incomplete": {
            "type": "boolean"
          },
          "removalBlockedReason": {
            "type": [
              "string",
              "null"
            ]
          }
        },
        "required": [
          "id",
          "label",
          "email",
          "connected",
          "sharing",
          "welcomeSeen",
          "incomplete",
          "removalBlockedReason"
        ],
        "additionalProperties": false
      }
    },
    "attempt": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "profileId": {
              "type": [
                "string",
                "null"
              ]
            },
            "stage": {
              "type": "string",
              "enum": [
                "waiting",
                "exchanging",
                "completed",
                "failed",
                "cancelled"
              ]
            },
            "message": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "profileId",
            "stage",
            "message"
          ],
          "additionalProperties": false
        },
        {
          "type": "null"
        }
      ]
    },
    "message": {
      "type": "string"
    }
  },
  "required": [
    "available",
    "activeProfileId",
    "profiles",
    "attempt",
    "message"
  ],
  "additionalProperties": false
}
```

## chatgpt.select

Select a saved ChatGPT registration for the settings picker; models retain their original account binding.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "profileId": {
      "type": "string"
    }
  },
  "required": [
    "profileId"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "available": {
      "type": "boolean"
    },
    "activeProfileId": {
      "type": [
        "string",
        "null"
      ]
    },
    "profiles": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "label": {
            "type": "string"
          },
          "email": {
            "type": [
              "string",
              "null"
            ]
          },
          "connected": {
            "type": "boolean"
          },
          "sharing": {
            "type": "boolean"
          },
          "welcomeSeen": {
            "type": "boolean"
          },
          "incomplete": {
            "type": "boolean"
          },
          "removalBlockedReason": {
            "type": [
              "string",
              "null"
            ]
          }
        },
        "required": [
          "id",
          "label",
          "email",
          "connected",
          "sharing",
          "welcomeSeen",
          "incomplete",
          "removalBlockedReason"
        ],
        "additionalProperties": false
      }
    },
    "attempt": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "profileId": {
              "type": [
                "string",
                "null"
              ]
            },
            "stage": {
              "type": "string",
              "enum": [
                "waiting",
                "exchanging",
                "completed",
                "failed",
                "cancelled"
              ]
            },
            "message": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "profileId",
            "stage",
            "message"
          ],
          "additionalProperties": false
        },
        {
          "type": "null"
        }
      ]
    },
    "message": {
      "type": "string"
    }
  },
  "required": [
    "available",
    "activeProfileId",
    "profiles",
    "attempt",
    "message"
  ],
  "additionalProperties": false
}
```

## chatgpt.rename

Rename a saved account without changing its identity or model bindings.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "profileId": {
      "type": "string"
    },
    "label": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    }
  },
  "required": [
    "profileId",
    "label"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "available": {
      "type": "boolean"
    },
    "activeProfileId": {
      "type": [
        "string",
        "null"
      ]
    },
    "profiles": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "label": {
            "type": "string"
          },
          "email": {
            "type": [
              "string",
              "null"
            ]
          },
          "connected": {
            "type": "boolean"
          },
          "sharing": {
            "type": "boolean"
          },
          "welcomeSeen": {
            "type": "boolean"
          },
          "incomplete": {
            "type": "boolean"
          },
          "removalBlockedReason": {
            "type": [
              "string",
              "null"
            ]
          }
        },
        "required": [
          "id",
          "label",
          "email",
          "connected",
          "sharing",
          "welcomeSeen",
          "incomplete",
          "removalBlockedReason"
        ],
        "additionalProperties": false
      }
    },
    "attempt": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "profileId": {
              "type": [
                "string",
                "null"
              ]
            },
            "stage": {
              "type": "string",
              "enum": [
                "waiting",
                "exchanging",
                "completed",
                "failed",
                "cancelled"
              ]
            },
            "message": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "profileId",
            "stage",
            "message"
          ],
          "additionalProperties": false
        },
        {
          "type": "null"
        }
      ]
    },
    "message": {
      "type": "string"
    }
  },
  "required": [
    "available",
    "activeProfileId",
    "profiles",
    "attempt",
    "message"
  ],
  "additionalProperties": false
}
```

## chatgpt.remove

Remove selected local registrations atomically. Requires signed-out accounts with no bound models or active login. Does not revoke remote registrations.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "profileIds": {
      "minItems": 1,
      "maxItems": 10,
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "required": [
    "profileIds"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "available": {
      "type": "boolean"
    },
    "activeProfileId": {
      "type": [
        "string",
        "null"
      ]
    },
    "profiles": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "label": {
            "type": "string"
          },
          "email": {
            "type": [
              "string",
              "null"
            ]
          },
          "connected": {
            "type": "boolean"
          },
          "sharing": {
            "type": "boolean"
          },
          "welcomeSeen": {
            "type": "boolean"
          },
          "incomplete": {
            "type": "boolean"
          },
          "removalBlockedReason": {
            "type": [
              "string",
              "null"
            ]
          }
        },
        "required": [
          "id",
          "label",
          "email",
          "connected",
          "sharing",
          "welcomeSeen",
          "incomplete",
          "removalBlockedReason"
        ],
        "additionalProperties": false
      }
    },
    "attempt": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "profileId": {
              "type": [
                "string",
                "null"
              ]
            },
            "stage": {
              "type": "string",
              "enum": [
                "waiting",
                "exchanging",
                "completed",
                "failed",
                "cancelled"
              ]
            },
            "message": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "profileId",
            "stage",
            "message"
          ],
          "additionalProperties": false
        },
        {
          "type": "null"
        }
      ]
    },
    "message": {
      "type": "string"
    }
  },
  "required": [
    "available",
    "activeProfileId",
    "profiles",
    "attempt",
    "message"
  ],
  "additionalProperties": false
}
```

## chatgpt.signOut

Revoke the renewable session and clear local tokens, retaining the registration.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "profileId": {
      "type": "string"
    }
  },
  "required": [
    "profileId"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "available": {
      "type": "boolean"
    },
    "activeProfileId": {
      "type": [
        "string",
        "null"
      ]
    },
    "profiles": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "label": {
            "type": "string"
          },
          "email": {
            "type": [
              "string",
              "null"
            ]
          },
          "connected": {
            "type": "boolean"
          },
          "sharing": {
            "type": "boolean"
          },
          "welcomeSeen": {
            "type": "boolean"
          },
          "incomplete": {
            "type": "boolean"
          },
          "removalBlockedReason": {
            "type": [
              "string",
              "null"
            ]
          }
        },
        "required": [
          "id",
          "label",
          "email",
          "connected",
          "sharing",
          "welcomeSeen",
          "incomplete",
          "removalBlockedReason"
        ],
        "additionalProperties": false
      }
    },
    "attempt": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "profileId": {
              "type": [
                "string",
                "null"
              ]
            },
            "stage": {
              "type": "string",
              "enum": [
                "waiting",
                "exchanging",
                "completed",
                "failed",
                "cancelled"
              ]
            },
            "message": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "profileId",
            "stage",
            "message"
          ],
          "additionalProperties": false
        },
        {
          "type": "null"
        }
      ]
    },
    "message": {
      "type": "string"
    }
  },
  "required": [
    "available",
    "activeProfileId",
    "profiles",
    "attempt",
    "message"
  ],
  "additionalProperties": false
}
```

## chatgpt.acknowledge

Dismiss the first connected-plan welcome message.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "profileId": {
      "type": "string"
    }
  },
  "required": [
    "profileId"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "available": {
      "type": "boolean"
    },
    "activeProfileId": {
      "type": [
        "string",
        "null"
      ]
    },
    "profiles": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "label": {
            "type": "string"
          },
          "email": {
            "type": [
              "string",
              "null"
            ]
          },
          "connected": {
            "type": "boolean"
          },
          "sharing": {
            "type": "boolean"
          },
          "welcomeSeen": {
            "type": "boolean"
          },
          "incomplete": {
            "type": "boolean"
          },
          "removalBlockedReason": {
            "type": [
              "string",
              "null"
            ]
          }
        },
        "required": [
          "id",
          "label",
          "email",
          "connected",
          "sharing",
          "welcomeSeen",
          "incomplete",
          "removalBlockedReason"
        ],
        "additionalProperties": false
      }
    },
    "attempt": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "profileId": {
              "type": [
                "string",
                "null"
              ]
            },
            "stage": {
              "type": "string",
              "enum": [
                "waiting",
                "exchanging",
                "completed",
                "failed",
                "cancelled"
              ]
            },
            "message": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "profileId",
            "stage",
            "message"
          ],
          "additionalProperties": false
        },
        {
          "type": "null"
        }
      ]
    },
    "message": {
      "type": "string"
    }
  },
  "required": [
    "available",
    "activeProfileId",
    "profiles",
    "attempt",
    "message"
  ],
  "additionalProperties": false
}
```

## chatgpt.catalog

Fetch the current account-specific ChatGPT model catalog using its OAuth token.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "profileId": {
      "type": "string"
    }
  },
  "required": [
    "profileId"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "name": {
        "type": "string"
      }
    },
    "required": [
      "id",
      "name"
    ],
    "additionalProperties": false
  }
}
```

## chatgpt.addModel

Add a model available to the selected ChatGPT account. Does not generate text or switch billing paths.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "profileId": {
      "type": "string"
    },
    "modelId": {
      "type": "string"
    }
  },
  "required": [
    "profileId",
    "modelId"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "provider": {
      "type": "string"
    },
    "model": {
      "type": "string"
    },
    "baseURL": {
      "type": "string"
    },
    "kind": {
      "type": "string",
      "enum": [
        "openai-compatible",
        "pi",
        "chatgpt"
      ]
    },
    "configured": {
      "type": "boolean"
    },
    "preset": {
      "type": [
        "string",
        "null"
      ]
    },
    "hasApiKey": {
      "type": "boolean"
    },
    "chatgptProfileId": {
      "type": "string"
    },
    "options": {
      "type": "object",
      "propertyNames": {
        "type": "string",
        "maxLength": 60
      },
      "additionalProperties": {
        "type": "string",
        "maxLength": 300
      }
    }
  },
  "required": [
    "id",
    "name",
    "provider",
    "model",
    "baseURL",
    "kind",
    "configured",
    "preset",
    "hasApiKey",
    "options"
  ],
  "additionalProperties": false
}
```

## chatgpt.manageUsage

Open ChatGPT Settings Usage in the system browser.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {},
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "null"
}
```

## models.list

List host-configured models. Credentials are never returned.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {},
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "name": {
        "type": "string"
      },
      "provider": {
        "type": "string"
      },
      "model": {
        "type": "string"
      },
      "baseURL": {
        "type": "string"
      },
      "kind": {
        "type": "string",
        "enum": [
          "openai-compatible",
          "pi",
          "chatgpt"
        ]
      },
      "configured": {
        "type": "boolean"
      },
      "preset": {
        "type": [
          "string",
          "null"
        ]
      },
      "hasApiKey": {
        "type": "boolean"
      },
      "chatgptProfileId": {
        "type": "string"
      },
      "options": {
        "type": "object",
        "propertyNames": {
          "type": "string",
          "maxLength": 60
        },
        "additionalProperties": {
          "type": "string",
          "maxLength": 300
        }
      }
    },
    "required": [
      "id",
      "name",
      "provider",
      "model",
      "baseURL",
      "kind",
      "configured",
      "preset",
      "hasApiKey",
      "options"
    ],
    "additionalProperties": false
  }
}
```

## models.providers

List all Pi provider presets and their configuration requirements.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {},
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "name": {
        "type": "string"
      },
      "modelCount": {
        "type": "number"
      },
      "apiKeySupported": {
        "type": "boolean"
      },
      "keyLabel": {
        "type": "string"
      },
      "notice": {
        "type": "string"
      },
      "fields": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "key": {
              "type": "string"
            },
            "label": {
              "type": "string"
            },
            "placeholder": {
              "type": "string"
            },
            "required": {
              "type": "boolean"
            }
          },
          "required": [
            "key",
            "label",
            "placeholder",
            "required"
          ],
          "additionalProperties": false
        }
      }
    },
    "required": [
      "id",
      "name",
      "modelCount",
      "apiKeySupported",
      "keyLabel",
      "notice",
      "fields"
    ],
    "additionalProperties": false
  }
}
```

## models.catalog

Read the bundled Pi chat model catalog for one provider.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "providerId": {
      "type": "string"
    }
  },
  "required": [
    "providerId"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "name": {
        "type": "string"
      },
      "api": {
        "type": "string"
      },
      "baseURL": {
        "type": "string"
      },
      "contextWindow": {
        "type": "number"
      },
      "reasoning": {
        "type": "boolean"
      }
    },
    "required": [
      "id",
      "name",
      "api",
      "baseURL",
      "contextWindow",
      "reasoning"
    ],
    "additionalProperties": false
  }
}
```

## models.save

Save a Pi preset or custom OpenAI-compatible model. Omitted keys are retained only when provider and endpoint are unchanged.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "provider": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "model": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200
    },
    "baseURL": {
      "type": "string",
      "maxLength": 2000
    },
    "apiKey": {
      "type": "string",
      "maxLength": 2000
    },
    "clearApiKey": {
      "type": "boolean"
    },
    "preset": {
      "type": [
        "string",
        "null"
      ]
    },
    "options": {
      "type": "object",
      "propertyNames": {
        "type": "string",
        "maxLength": 60
      },
      "additionalProperties": {
        "type": "string",
        "maxLength": 300
      }
    }
  },
  "required": [
    "name",
    "provider",
    "model",
    "baseURL"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "provider": {
      "type": "string"
    },
    "model": {
      "type": "string"
    },
    "baseURL": {
      "type": "string"
    },
    "kind": {
      "type": "string",
      "enum": [
        "openai-compatible",
        "pi",
        "chatgpt"
      ]
    },
    "configured": {
      "type": "boolean"
    },
    "preset": {
      "type": [
        "string",
        "null"
      ]
    },
    "hasApiKey": {
      "type": "boolean"
    },
    "chatgptProfileId": {
      "type": "string"
    },
    "options": {
      "type": "object",
      "propertyNames": {
        "type": "string",
        "maxLength": 60
      },
      "additionalProperties": {
        "type": "string",
        "maxLength": 300
      }
    }
  },
  "required": [
    "id",
    "name",
    "provider",
    "model",
    "baseURL",
    "kind",
    "configured",
    "preset",
    "hasApiKey",
    "options"
  ],
  "additionalProperties": false
}
```

## models.remove

Remove a configured model; active calls prevent removal.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "null"
}
```

## models.generate

Start a background text generation. Poll runs.get or subscribe to runs.changed.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "pluginId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "modelId": {
      "type": "string"
    },
    "prompt": {
      "type": "string",
      "minLength": 1,
      "maxLength": 16000
    },
    "system": {
      "type": "string",
      "maxLength": 16000
    },
    "title": {
      "type": "string",
      "maxLength": 100
    }
  },
  "required": [
    "pluginId",
    "modelId",
    "prompt"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "pluginId": {
      "type": "string"
    },
    "modelId": {
      "type": "string"
    },
    "title": {
      "type": "string"
    },
    "input": {
      "type": "string"
    },
    "output": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "running",
        "completed",
        "cancelled",
        "failed"
      ]
    },
    "error": {
      "type": [
        "string",
        "null"
      ]
    },
    "createdAt": {
      "type": "number"
    },
    "updatedAt": {
      "type": "number"
    },
    "revision": {
      "type": "number"
    },
    "demo": {
      "type": "boolean"
    }
  },
  "required": [
    "id",
    "pluginId",
    "modelId",
    "title",
    "input",
    "output",
    "status",
    "error",
    "createdAt",
    "updatedAt",
    "revision",
    "demo"
  ],
  "additionalProperties": false
}
```

## runs.list

Read the latest 30 run summaries (input/output truncated to 300 characters). Use runs.get for full content.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "pluginId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    }
  },
  "required": [
    "pluginId"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "pluginId": {
        "type": "string"
      },
      "modelId": {
        "type": "string"
      },
      "title": {
        "type": "string"
      },
      "input": {
        "type": "string"
      },
      "output": {
        "type": "string"
      },
      "status": {
        "type": "string",
        "enum": [
          "running",
          "completed",
          "cancelled",
          "failed"
        ]
      },
      "error": {
        "type": [
          "string",
          "null"
        ]
      },
      "createdAt": {
        "type": "number"
      },
      "updatedAt": {
        "type": "number"
      },
      "revision": {
        "type": "number"
      },
      "demo": {
        "type": "boolean"
      }
    },
    "required": [
      "id",
      "pluginId",
      "modelId",
      "title",
      "input",
      "output",
      "status",
      "error",
      "createdAt",
      "updatedAt",
      "revision",
      "demo"
    ],
    "additionalProperties": false
  }
}
```

## runs.get

Read the authoritative state of a plugin run, also after event reconnection.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "pluginId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "runId": {
      "type": "string"
    }
  },
  "required": [
    "pluginId",
    "runId"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "pluginId": {
      "type": "string"
    },
    "modelId": {
      "type": "string"
    },
    "title": {
      "type": "string"
    },
    "input": {
      "type": "string"
    },
    "output": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "running",
        "completed",
        "cancelled",
        "failed"
      ]
    },
    "error": {
      "type": [
        "string",
        "null"
      ]
    },
    "createdAt": {
      "type": "number"
    },
    "updatedAt": {
      "type": "number"
    },
    "revision": {
      "type": "number"
    },
    "demo": {
      "type": "boolean"
    }
  },
  "required": [
    "id",
    "pluginId",
    "modelId",
    "title",
    "input",
    "output",
    "status",
    "error",
    "createdAt",
    "updatedAt",
    "revision",
    "demo"
  ],
  "additionalProperties": false
}
```

## runs.cancel

Cancel an active run and wait until its terminal state is saved.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "pluginId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "runId": {
      "type": "string"
    }
  },
  "required": [
    "pluginId",
    "runId"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "pluginId": {
      "type": "string"
    },
    "modelId": {
      "type": "string"
    },
    "title": {
      "type": "string"
    },
    "input": {
      "type": "string"
    },
    "output": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "running",
        "completed",
        "cancelled",
        "failed"
      ]
    },
    "error": {
      "type": [
        "string",
        "null"
      ]
    },
    "createdAt": {
      "type": "number"
    },
    "updatedAt": {
      "type": "number"
    },
    "revision": {
      "type": "number"
    },
    "demo": {
      "type": "boolean"
    }
  },
  "required": [
    "id",
    "pluginId",
    "modelId",
    "title",
    "input",
    "output",
    "status",
    "error",
    "createdAt",
    "updatedAt",
    "revision",
    "demo"
  ],
  "additionalProperties": false
}
```

## plugins.list

List installed applications and their activation state.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {},
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "name": {
        "type": "string"
      },
      "description": {
        "type": "string"
      },
      "icon": {
        "type": "string"
      },
      "color": {
        "type": "string"
      },
      "version": {
        "type": "string"
      },
      "packageName": {
        "type": "string"
      },
      "source": {
        "type": "string"
      },
      "market": {
        "anyOf": [
          {
            "type": "object",
            "properties": {
              "marketId": {
                "type": "string"
              },
              "marketURL": {
                "type": "string",
                "maxLength": 2000,
                "format": "uri"
              }
            },
            "required": [
              "marketId",
              "marketURL"
            ],
            "additionalProperties": false
          },
          {
            "type": "null"
          }
        ]
      },
      "enabled": {
        "type": "boolean"
      },
      "status": {
        "type": "string",
        "enum": [
          "active",
          "disabled",
          "error"
        ]
      },
      "error": {
        "type": [
          "string",
          "null"
        ]
      },
      "clientURL": {
        "type": "string"
      },
      "styleURL": {
        "type": [
          "string",
          "null"
        ]
      },
      "keepAlive": {
        "type": "boolean"
      },
      "methods": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "inputSchema": {
              "$ref": "#/$defs/__schema0"
            }
          },
          "required": [
            "name",
            "description",
            "inputSchema"
          ],
          "additionalProperties": false
        }
      }
    },
    "required": [
      "id",
      "name",
      "description",
      "icon",
      "color",
      "version",
      "packageName",
      "source",
      "market",
      "enabled",
      "status",
      "error",
      "clientURL",
      "styleURL",
      "keepAlive",
      "methods"
    ],
    "additionalProperties": false
  },
  "$defs": {
    "__schema0": {
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "number"
        },
        {
          "type": "boolean"
        },
        {
          "type": "null"
        },
        {
          "type": "array",
          "items": {
            "$ref": "#/$defs/__schema0"
          }
        },
        {
          "type": "object",
          "propertyNames": {
            "type": "string"
          },
          "additionalProperties": {
            "$ref": "#/$defs/__schema0"
          }
        }
      ]
    }
  }
}
```

## plugins.invoke

Call a plugin method. Discover method names and input schemas with plugins.list.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "pluginId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "method": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "input": {
      "$ref": "#/$defs/__schema0"
    }
  },
  "required": [
    "pluginId",
    "method",
    "input"
  ],
  "additionalProperties": false,
  "$defs": {
    "__schema0": {
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "number"
        },
        {
          "type": "boolean"
        },
        {
          "type": "null"
        },
        {
          "type": "array",
          "items": {
            "$ref": "#/$defs/__schema0"
          }
        },
        {
          "type": "object",
          "propertyNames": {
            "type": "string"
          },
          "additionalProperties": {
            "$ref": "#/$defs/__schema0"
          }
        }
      ]
    }
  }
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "anyOf": [
    {
      "type": "string"
    },
    {
      "type": "number"
    },
    {
      "type": "boolean"
    },
    {
      "type": "null"
    },
    {
      "type": "array",
      "items": {
        "$ref": "#"
      }
    },
    {
      "type": "object",
      "propertyNames": {
        "type": "string"
      },
      "additionalProperties": {
        "$ref": "#"
      }
    }
  ]
}
```

## plugins.install

Install a trusted, prebuilt plugin from an npm spec, Git URL or absolute local .tgz path. Returns an installation job.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "source": {
      "type": "string",
      "minLength": 1,
      "maxLength": 2000
    }
  },
  "required": [
    "source"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "operation": {
      "type": "string",
      "enum": [
        "install",
        "update"
      ]
    },
    "targetVersion": {
      "type": [
        "string",
        "null"
      ]
    },
    "id": {
      "type": "string"
    },
    "source": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "installing",
        "completed",
        "failed"
      ]
    },
    "message": {
      "type": "string"
    },
    "pluginId": {
      "type": [
        "string",
        "null"
      ]
    },
    "createdAt": {
      "type": "number"
    }
  },
  "required": [
    "operation",
    "targetVersion",
    "id",
    "source",
    "status",
    "message",
    "pluginId",
    "createdAt"
  ],
  "additionalProperties": false
}
```

## marketplaces.list

List configured market sources and cache status.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {},
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "name": {
        "type": "string",
        "minLength": 1,
        "maxLength": 100
      },
      "url": {
        "type": "string",
        "maxLength": 2000,
        "format": "uri"
      },
      "enabled": {
        "type": "boolean"
      },
      "updatedAt": {
        "type": [
          "number",
          "null"
        ]
      },
      "error": {
        "anyOf": [
          {
            "type": "string",
            "maxLength": 1000
          },
          {
            "type": "null"
          }
        ]
      },
      "refreshing": {
        "type": "boolean"
      },
      "count": {
        "type": "number"
      }
    },
    "required": [
      "id",
      "name",
      "url",
      "enabled",
      "updatedAt",
      "error",
      "refreshing",
      "count"
    ],
    "additionalProperties": false
  }
}
```

## marketplaces.add

Add an HTTPS plugin market index.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "url": {
      "type": "string",
      "maxLength": 2000,
      "format": "uri"
    }
  },
  "required": [
    "name",
    "url"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "url": {
      "type": "string",
      "maxLength": 2000,
      "format": "uri"
    },
    "enabled": {
      "type": "boolean"
    },
    "updatedAt": {
      "type": [
        "number",
        "null"
      ]
    },
    "error": {
      "anyOf": [
        {
          "type": "string",
          "maxLength": 1000
        },
        {
          "type": "null"
        }
      ]
    },
    "refreshing": {
      "type": "boolean"
    },
    "count": {
      "type": "number"
    }
  },
  "required": [
    "id",
    "name",
    "url",
    "enabled",
    "updatedAt",
    "error",
    "refreshing",
    "count"
  ],
  "additionalProperties": false
}
```

## marketplaces.update

Rename, enable or disable a source; its URL is immutable.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "enabled": {
      "type": "boolean"
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "url": {
      "type": "string",
      "maxLength": 2000,
      "format": "uri"
    },
    "enabled": {
      "type": "boolean"
    },
    "updatedAt": {
      "type": [
        "number",
        "null"
      ]
    },
    "error": {
      "anyOf": [
        {
          "type": "string",
          "maxLength": 1000
        },
        {
          "type": "null"
        }
      ]
    },
    "refreshing": {
      "type": "boolean"
    },
    "count": {
      "type": "number"
    }
  },
  "required": [
    "id",
    "name",
    "url",
    "enabled",
    "updatedAt",
    "error",
    "refreshing",
    "count"
  ],
  "additionalProperties": false
}
```

## marketplaces.remove

Remove a source without uninstalling its plugins.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "null"
}
```

## marketplaces.refresh

Refresh enabled sources; failures retain cached catalogs.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "name": {
        "type": "string",
        "minLength": 1,
        "maxLength": 100
      },
      "url": {
        "type": "string",
        "maxLength": 2000,
        "format": "uri"
      },
      "enabled": {
        "type": "boolean"
      },
      "updatedAt": {
        "type": [
          "number",
          "null"
        ]
      },
      "error": {
        "anyOf": [
          {
            "type": "string",
            "maxLength": 1000
          },
          {
            "type": "null"
          }
        ]
      },
      "refreshing": {
        "type": "boolean"
      },
      "count": {
        "type": "number"
      }
    },
    "required": [
      "id",
      "name",
      "url",
      "enabled",
      "updatedAt",
      "error",
      "refreshing",
      "count"
    ],
    "additionalProperties": false
  }
}
```

## marketplaces.catalog

Search cached catalogs with installation and update status.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "marketId": {
      "type": "string"
    },
    "query": {
      "default": "",
      "type": "string",
      "maxLength": 200
    },
    "offset": {
      "default": 0,
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "limit": {
      "default": 20,
      "type": "integer",
      "minimum": 1,
      "maximum": 50
    }
  },
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "pattern": "^[a-z][a-z0-9-]{1,63}$"
          },
          "packageName": {
            "type": "string",
            "maxLength": 214,
            "pattern": "^(?:@[a-z0-9._-]+\\/)?[a-z0-9][a-z0-9._-]*$"
          },
          "name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100
          },
          "description": {
            "type": "string",
            "maxLength": 1000
          },
          "icon": {
            "type": "string",
            "minLength": 1,
            "maxLength": 16
          },
          "color": {
            "type": "string",
            "pattern": "^#[0-9a-fA-F]{6}$"
          },
          "version": {
            "type": "string",
            "pattern": "^(0|[1-9]\\d{0,8})\\.(0|[1-9]\\d{0,8})\\.(0|[1-9]\\d{0,8})$"
          },
          "sdkVersion": {
            "type": "string",
            "maxLength": 20
          },
          "url": {
            "type": "string",
            "maxLength": 2000,
            "format": "uri"
          },
          "sha256": {
            "type": "string",
            "pattern": "^[a-f0-9]{64}$"
          },
          "marketId": {
            "type": "string"
          },
          "marketName": {
            "type": "string"
          },
          "installedVersion": {
            "type": [
              "string",
              "null"
            ]
          },
          "state": {
            "type": "string",
            "enum": [
              "available",
              "installed",
              "update",
              "incompatible",
              "conflict"
            ]
          }
        },
        "required": [
          "id",
          "packageName",
          "name",
          "description",
          "icon",
          "color",
          "version",
          "sdkVersion",
          "url",
          "sha256",
          "marketId",
          "marketName",
          "installedVersion",
          "state"
        ],
        "additionalProperties": false
      }
    },
    "total": {
      "type": "number"
    },
    "nextOffset": {
      "type": [
        "number",
        "null"
      ]
    }
  },
  "required": [
    "items",
    "total",
    "nextOffset"
  ],
  "additionalProperties": false
}
```

## plugins.installFromMarket

Revalidate and install a trusted market archive; returns a job.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "marketId": {
      "type": "string"
    },
    "pluginId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    }
  },
  "required": [
    "marketId",
    "pluginId"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "operation": {
      "type": "string",
      "enum": [
        "install",
        "update"
      ]
    },
    "targetVersion": {
      "type": [
        "string",
        "null"
      ]
    },
    "id": {
      "type": "string"
    },
    "source": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "installing",
        "completed",
        "failed"
      ]
    },
    "message": {
      "type": "string"
    },
    "pluginId": {
      "type": [
        "string",
        "null"
      ]
    },
    "createdAt": {
      "type": "number"
    }
  },
  "required": [
    "operation",
    "targetVersion",
    "id",
    "source",
    "status",
    "message",
    "pluginId",
    "createdAt"
  ],
  "additionalProperties": false
}
```

## plugins.update

Update from the original market, or an explicit source for manually installed plugins. Returns a job.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "pluginId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "source": {
      "type": "string",
      "minLength": 1,
      "maxLength": 2000
    }
  },
  "required": [
    "pluginId"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "operation": {
      "type": "string",
      "enum": [
        "install",
        "update"
      ]
    },
    "targetVersion": {
      "type": [
        "string",
        "null"
      ]
    },
    "id": {
      "type": "string"
    },
    "source": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "installing",
        "completed",
        "failed"
      ]
    },
    "message": {
      "type": "string"
    },
    "pluginId": {
      "type": [
        "string",
        "null"
      ]
    },
    "createdAt": {
      "type": "number"
    }
  },
  "required": [
    "operation",
    "targetVersion",
    "id",
    "source",
    "status",
    "message",
    "pluginId",
    "createdAt"
  ],
  "additionalProperties": false
}
```

## plugins.jobs

Read recent installation job outcomes and progress.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {},
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "operation": {
        "type": "string",
        "enum": [
          "install",
          "update"
        ]
      },
      "targetVersion": {
        "type": [
          "string",
          "null"
        ]
      },
      "id": {
        "type": "string"
      },
      "source": {
        "type": "string"
      },
      "status": {
        "type": "string",
        "enum": [
          "installing",
          "completed",
          "failed"
        ]
      },
      "message": {
        "type": "string"
      },
      "pluginId": {
        "type": [
          "string",
          "null"
        ]
      },
      "createdAt": {
        "type": "number"
      }
    },
    "required": [
      "operation",
      "targetVersion",
      "id",
      "source",
      "status",
      "message",
      "pluginId",
      "createdAt"
    ],
    "additionalProperties": false
  }
}
```

## plugins.setEnabled

Enable or disable a plugin. Active runs must finish or be cancelled first.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "pluginId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "enabled": {
      "type": "boolean"
    }
  },
  "required": [
    "pluginId",
    "enabled"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "icon": {
      "type": "string"
    },
    "color": {
      "type": "string"
    },
    "version": {
      "type": "string"
    },
    "packageName": {
      "type": "string"
    },
    "source": {
      "type": "string"
    },
    "market": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "marketId": {
              "type": "string"
            },
            "marketURL": {
              "type": "string",
              "maxLength": 2000,
              "format": "uri"
            }
          },
          "required": [
            "marketId",
            "marketURL"
          ],
          "additionalProperties": false
        },
        {
          "type": "null"
        }
      ]
    },
    "enabled": {
      "type": "boolean"
    },
    "status": {
      "type": "string",
      "enum": [
        "active",
        "disabled",
        "error"
      ]
    },
    "error": {
      "type": [
        "string",
        "null"
      ]
    },
    "clientURL": {
      "type": "string"
    },
    "styleURL": {
      "type": [
        "string",
        "null"
      ]
    },
    "keepAlive": {
      "type": "boolean"
    },
    "methods": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "inputSchema": {
            "$ref": "#/$defs/__schema0"
          }
        },
        "required": [
          "name",
          "description",
          "inputSchema"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "id",
    "name",
    "description",
    "icon",
    "color",
    "version",
    "packageName",
    "source",
    "market",
    "enabled",
    "status",
    "error",
    "clientURL",
    "styleURL",
    "keepAlive",
    "methods"
  ],
  "additionalProperties": false,
  "$defs": {
    "__schema0": {
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "number"
        },
        {
          "type": "boolean"
        },
        {
          "type": "null"
        },
        {
          "type": "array",
          "items": {
            "$ref": "#/$defs/__schema0"
          }
        },
        {
          "type": "object",
          "propertyNames": {
            "type": "string"
          },
          "additionalProperties": {
            "$ref": "#/$defs/__schema0"
          }
        }
      ]
    }
  }
}
```

## plugins.uninstall

Remove a plugin and its managed package files. KV and run history are retained.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "pluginId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    }
  },
  "required": [
    "pluginId"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "null"
}
```

## kv.get

Read a plugin-scoped JSON value; absent keys return null.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "pluginId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "key": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200
    }
  },
  "required": [
    "pluginId",
    "key"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "anyOf": [
    {
      "type": "string"
    },
    {
      "type": "number"
    },
    {
      "type": "boolean"
    },
    {
      "type": "null"
    },
    {
      "type": "array",
      "items": {
        "$ref": "#"
      }
    },
    {
      "type": "object",
      "propertyNames": {
        "type": "string"
      },
      "additionalProperties": {
        "$ref": "#"
      }
    }
  ]
}
```

## kv.set

Persist a plugin-scoped JSON value (maximum 64 KiB).

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "pluginId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "key": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200
    },
    "value": {
      "$ref": "#/$defs/__schema0"
    }
  },
  "required": [
    "pluginId",
    "key",
    "value"
  ],
  "additionalProperties": false,
  "$defs": {
    "__schema0": {
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "number"
        },
        {
          "type": "boolean"
        },
        {
          "type": "null"
        },
        {
          "type": "array",
          "items": {
            "$ref": "#/$defs/__schema0"
          }
        },
        {
          "type": "object",
          "propertyNames": {
            "type": "string"
          },
          "additionalProperties": {
            "$ref": "#/$defs/__schema0"
          }
        }
      ]
    }
  }
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "null"
}
```

## kv.delete

Delete a plugin-scoped key.

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "pluginId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "key": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200
    }
  },
  "required": [
    "pluginId",
    "key"
  ],
  "additionalProperties": false
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "null"
}
```

## Event: web.changed

A network task changed. Reread web.get; notifications have no replay.
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "pluginId": {
      "type": "string"
    },
    "id": {
      "type": "string"
    },
    "kind": {
      "type": "string",
      "enum": [
        "search",
        "fetch"
      ]
    },
    "status": {
      "type": "string",
      "enum": [
        "running",
        "completed",
        "failed",
        "cancelled"
      ]
    }
  },
  "required": [
    "pluginId",
    "id",
    "kind",
    "status"
  ],
  "additionalProperties": false
}
```

## Event: appearance.changed

Theme preference changed. Reread appearance.get on reconnect.
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "theme": {
      "type": "string",
      "enum": [
        "system",
        "light",
        "dark"
      ]
    },
    "colorTheme": {
      "type": "object",
      "properties": {
        "preset": {
          "type": "string",
          "enum": [
            "default",
            "github",
            "custom"
          ]
        },
        "custom": {
          "type": "object",
          "properties": {
            "light": {
              "type": "object",
              "properties": {
                "accent": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                },
                "background": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                },
                "foreground": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                }
              },
              "required": [
                "accent",
                "background",
                "foreground"
              ],
              "additionalProperties": false
            },
            "dark": {
              "type": "object",
              "properties": {
                "accent": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                },
                "background": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                },
                "foreground": {
                  "type": "string",
                  "pattern": "^#[0-9a-f]{6}$"
                }
              },
              "required": [
                "accent",
                "background",
                "foreground"
              ],
              "additionalProperties": false
            }
          },
          "required": [
            "light",
            "dark"
          ],
          "additionalProperties": false
        }
      },
      "required": [
        "preset",
        "custom"
      ],
      "additionalProperties": false
    }
  },
  "required": [
    "theme",
    "colorTheme"
  ],
  "additionalProperties": false
}
```

## Event: runs.changed

A run changed. Read its current snapshot; notifications have no replay.
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "pluginId": {
      "type": "string"
    },
    "runId": {
      "type": "string"
    },
    "revision": {
      "type": "number"
    },
    "status": {
      "type": "string",
      "enum": [
        "running",
        "completed",
        "cancelled",
        "failed"
      ]
    }
  },
  "required": [
    "pluginId",
    "runId",
    "revision",
    "status"
  ],
  "additionalProperties": false
}
```

## Event: marketplaces.changed

Market sources or cached catalogs changed; reread snapshots.
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "revision": {
      "type": "number"
    }
  },
  "required": [
    "revision"
  ],
  "additionalProperties": false
}
```

## Event: plugins.changed

Plugin registry or installation jobs changed. Reread their current state.
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "revision": {
      "type": "number"
    }
  },
  "required": [
    "revision"
  ],
  "additionalProperties": false
}
```

## Event: chatgpt.changed

ChatGPT connection or login changed. Reread chatgpt.status.
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "revision": {
      "type": "number"
    }
  },
  "required": [
    "revision"
  ],
  "additionalProperties": false
}
```

## Event: models.changed

Host model configurations changed.
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "revision": {
      "type": "number"
    }
  },
  "required": [
    "revision"
  ],
  "additionalProperties": false
}
```
