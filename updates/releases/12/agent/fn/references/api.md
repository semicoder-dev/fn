# API reference

Application build: 12

## cards.list

Read durable application interaction cards

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "sessionId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "offset": {
      "default": 0,
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "limit": {
      "default": 50,
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    }
  },
  "required": [
    "sessionId"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "items": {
      "maxItems": 100,
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100
          },
          "sessionId": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100
          },
          "createdAt": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "expiresAt": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "state": {
            "type": "string",
            "enum": [
              "pending",
              "running",
              "completed",
              "failed",
              "cancelled",
              "expired",
              "interrupted"
            ]
          },
          "card": {
            "type": "object",
            "properties": {
              "version": {
                "type": "number",
                "const": 1
              },
              "template": {
                "type": "string",
                "enum": [
                  "approval",
                  "choice",
                  "form"
                ]
              },
              "title": {
                "type": "string",
                "minLength": 1,
                "maxLength": 160
              },
              "summary": {
                "type": "string",
                "maxLength": 512
              },
              "blocks": {
                "maxItems": 30,
                "type": "array",
                "items": {
                  "oneOf": [
                    {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "const": "text"
                        },
                        "text": {
                          "type": "string",
                          "maxLength": 16000
                        }
                      },
                      "required": [
                        "type",
                        "text"
                      ],
                      "additionalProperties": false
                    },
                    {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "const": "fields"
                        },
                        "fields": {
                          "maxItems": 20,
                          "type": "array",
                          "items": {
                            "type": "object",
                            "properties": {
                              "label": {
                                "type": "string",
                                "maxLength": 200
                              },
                              "value": {
                                "type": "string",
                                "maxLength": 2000
                              }
                            },
                            "required": [
                              "label",
                              "value"
                            ],
                            "additionalProperties": false
                          }
                        }
                      },
                      "required": [
                        "type",
                        "fields"
                      ],
                      "additionalProperties": false
                    },
                    {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "const": "divider"
                        }
                      },
                      "required": [
                        "type"
                      ],
                      "additionalProperties": false
                    }
                  ]
                }
              },
              "inputs": {
                "maxItems": 20,
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "id": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 100,
                      "pattern": "^[A-Za-z0-9_.-]+$"
                    },
                    "label": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 200
                    },
                    "type": {
                      "type": "string",
                      "enum": [
                        "text",
                        "number",
                        "boolean",
                        "select",
                        "multiSelect"
                      ]
                    },
                    "required": {
                      "type": "boolean"
                    },
                    "options": {
                      "minItems": 1,
                      "maxItems": 50,
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 100,
                            "pattern": "^[A-Za-z0-9_.-]+$"
                          },
                          "label": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 200
                          }
                        },
                        "required": [
                          "id",
                          "label"
                        ],
                        "additionalProperties": false
                      }
                    },
                    "maxLength": {
                      "type": "integer",
                      "minimum": 1,
                      "maximum": 16000
                    },
                    "minimum": {
                      "type": "number"
                    },
                    "maximum": {
                      "type": "number"
                    }
                  },
                  "required": [
                    "id",
                    "label",
                    "type",
                    "required"
                  ],
                  "additionalProperties": false
                }
              },
              "actions": {
                "minItems": 1,
                "maxItems": 10,
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "id": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 100,
                      "pattern": "^[A-Za-z0-9_.-]+$"
                    },
                    "label": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 80
                    },
                    "style": {
                      "type": "string",
                      "enum": [
                        "normal",
                        "primary",
                        "danger"
                      ]
                    }
                  },
                  "required": [
                    "id",
                    "label"
                  ],
                  "additionalProperties": false
                }
              }
            },
            "required": [
              "version",
              "template",
              "title",
              "summary",
              "blocks",
              "inputs",
              "actions"
            ],
            "additionalProperties": false
          },
          "answer": {
            "type": "object",
            "properties": {
              "actionId": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100,
                "pattern": "^[A-Za-z0-9_.-]+$"
              },
              "values": {
                "type": "object",
                "propertyNames": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 100,
                  "pattern": "^[A-Za-z0-9_.-]+$"
                },
                "additionalProperties": {
                  "anyOf": [
                    {
                      "type": "string",
                      "maxLength": 16000
                    },
                    {
                      "type": "number"
                    },
                    {
                      "type": "boolean"
                    },
                    {
                      "maxItems": 50,
                      "type": "array",
                      "items": {
                        "type": "string",
                        "maxLength": 200
                      }
                    }
                  ]
                }
              }
            },
            "required": [
              "actionId",
              "values"
            ],
            "additionalProperties": false
          },
          "error": {
            "type": "string",
            "maxLength": 1024
          }
        },
        "required": [
          "id",
          "sessionId",
          "createdAt",
          "expiresAt",
          "state",
          "card"
        ],
        "additionalProperties": false
      }
    },
    "nextOffset": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "hasMore": {
      "type": "boolean"
    }
  },
  "required": [
    "items",
    "nextOffset",
    "hasMore"
  ],
  "additionalProperties": false
}
```

## cards.respond

Claim a one-shot card response before invoking its application

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "sessionId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "cardId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "actionId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "values": {
      "type": "object",
      "propertyNames": {
        "type": "string",
        "minLength": 1,
        "maxLength": 100,
        "pattern": "^[A-Za-z0-9_.-]+$"
      },
      "additionalProperties": {
        "anyOf": [
          {
            "type": "string",
            "maxLength": 16000
          },
          {
            "type": "number"
          },
          {
            "type": "boolean"
          },
          {
            "maxItems": 50,
            "type": "array",
            "items": {
              "type": "string",
              "maxLength": 200
            }
          }
        ]
      }
    }
  },
  "required": [
    "sessionId",
    "cardId",
    "actionId",
    "values"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "null"
}
```

## appearance.get

Read appearance preferences

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

Persist colors and native appearance

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

## models.saved

Read selected models

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "offset": {
      "default": 0,
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "limit": {
      "default": 50,
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    }
  }
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "items": {
      "maxItems": 100,
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "minLength": 1,
            "maxLength": 256
          },
          "name": {
            "type": "string",
            "maxLength": 256
          },
          "connectionId": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100
          }
        },
        "required": [
          "id",
          "name",
          "connectionId"
        ],
        "additionalProperties": false
      }
    },
    "nextOffset": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "hasMore": {
      "type": "boolean"
    }
  },
  "required": [
    "items",
    "nextOffset",
    "hasMore"
  ],
  "additionalProperties": false
}
```

## models.select

Add or remove a model from the workspace picker

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "connectionId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "modelId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 256
    },
    "selected": {
      "type": "boolean"
    }
  },
  "required": [
    "connectionId",
    "modelId",
    "selected"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "null"
}
```

## market.list

List Cordis application market sources

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
        "type": [
          "string",
          "null"
        ]
      },
      "count": {
        "type": "number"
      },
      "refreshing": {
        "type": "boolean"
      }
    },
    "required": [
      "id",
      "name",
      "url",
      "enabled",
      "updatedAt",
      "error",
      "count",
      "refreshing"
    ],
    "additionalProperties": false
  }
}
```

## market.add

Add a market source

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
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "null"
}
```

## market.change

Rename or enable a source

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
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
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "null"
}
```

## market.remove

Remove a market source

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    }
  },
  "required": [
    "id"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "null"
}
```

## market.refresh

Refresh catalogs without installing code

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
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

## market.catalog

Search application catalogs

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
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
      "default": 50,
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    }
  }
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "items": {
      "maxItems": 100,
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "icon": {
            "type": "string",
            "minLength": 1,
            "maxLength": 4
          },
          "iconSvg": {
            "type": "string",
            "maxLength": 8192
          },
          "id": {
            "type": "string",
            "pattern": "^[a-z][a-z0-9-]{0,99}$"
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
          "version": {
            "type": "string",
            "pattern": "^\\d+\\.\\d+\\.\\d+(?:-[\\w.-]+)?(?:\\+[\\w.-]+)?$"
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
          "core": {
            "type": "object",
            "propertyNames": {
              "type": "string",
              "maxLength": 214
            },
            "additionalProperties": {
              "type": "string",
              "maxLength": 64
            }
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
          "version",
          "url",
          "sha256",
          "core",
          "marketId",
          "marketName",
          "installedVersion",
          "state"
        ],
        "additionalProperties": false
      }
    },
    "nextOffset": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "hasMore": {
      "type": "boolean"
    }
  },
  "required": [
    "items",
    "nextOffset",
    "hasMore"
  ],
  "additionalProperties": false
}
```

## market.install

Verify a market archive and stage installation

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "marketId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "appId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    }
  },
  "required": [
    "marketId",
    "appId"
  ]
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
    "pending": {
      "type": "boolean"
    },
    "installing": {
      "type": "boolean"
    },
    "phase": {
      "anyOf": [
        {
          "type": "string",
          "enum": [
            "catalog",
            "download",
            "extract",
            "copy",
            "dependencies",
            "verify",
            "preflight"
          ]
        },
        {
          "type": "null"
        }
      ]
    },
    "error": {
      "type": [
        "string",
        "null"
      ]
    }
  },
  "required": [
    "id",
    "pending",
    "installing",
    "phase",
    "error"
  ],
  "additionalProperties": false
}
```

## apps.update

Check the original source and stage an application update

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "appId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    }
  },
  "required": [
    "appId"
  ]
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
    "pending": {
      "type": "boolean"
    },
    "installing": {
      "type": "boolean"
    },
    "phase": {
      "anyOf": [
        {
          "type": "string",
          "enum": [
            "catalog",
            "download",
            "extract",
            "copy",
            "dependencies",
            "verify",
            "preflight"
          ]
        },
        {
          "type": "null"
        }
      ]
    },
    "error": {
      "type": [
        "string",
        "null"
      ]
    }
  },
  "required": [
    "id",
    "pending",
    "installing",
    "phase",
    "error"
  ],
  "additionalProperties": false
}
```

## runtime.status

Read the running kernel and update state

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
    "epoch": {
      "type": "string"
    },
    "seedId": {
      "type": "string"
    },
    "busy": {
      "type": "boolean"
    },
    "generation": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "pending": {
          "type": "boolean"
        },
        "installing": {
          "type": "boolean"
        },
        "phase": {
          "anyOf": [
            {
              "type": "string",
              "enum": [
                "catalog",
                "download",
                "extract",
                "copy",
                "dependencies",
                "verify",
                "preflight"
              ]
            },
            {
              "type": "null"
            }
          ]
        },
        "error": {
          "type": [
            "string",
            "null"
          ]
        }
      },
      "required": [
        "id",
        "pending",
        "installing",
        "phase",
        "error"
      ],
      "additionalProperties": false
    },
    "dataDirectory": {
      "type": "string"
    }
  },
  "required": [
    "epoch",
    "seedId",
    "busy",
    "generation",
    "dataDirectory"
  ],
  "additionalProperties": false
}
```

## runtime.reloadSeed

Restart an idle development backend after a verified seed rebuild

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "epoch": {
      "type": "string"
    },
    "seedId": {
      "type": "string"
    }
  },
  "required": [
    "epoch",
    "seedId"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "accepted": {
      "type": "boolean"
    },
    "reason": {
      "type": "string"
    }
  },
  "required": [
    "accepted"
  ],
  "additionalProperties": false
}
```

## runtime.applyUpdate

Apply a staged runtime when idle

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
    "id": {
      "type": "string"
    },
    "pending": {
      "type": "boolean"
    },
    "installing": {
      "type": "boolean"
    },
    "phase": {
      "anyOf": [
        {
          "type": "string",
          "enum": [
            "catalog",
            "download",
            "extract",
            "copy",
            "dependencies",
            "verify",
            "preflight"
          ]
        },
        {
          "type": "null"
        }
      ]
    },
    "error": {
      "type": [
        "string",
        "null"
      ]
    }
  },
  "required": [
    "id",
    "pending",
    "installing",
    "phase",
    "error"
  ],
  "additionalProperties": false
}
```

## apps.list

List installed Cordis applications

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
      "icon": {
        "type": "string",
        "maxLength": 4
      },
      "iconSvg": {
        "type": "string",
        "maxLength": 8192
      },
      "id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 100
      },
      "name": {
        "type": "string"
      },
      "description": {
        "type": "string"
      },
      "version": {
        "type": "string"
      },
      "packageName": {
        "type": "string"
      },
      "client": {
        "type": "string"
      },
      "clientURL": {
        "type": "string"
      },
      "origin": {
        "type": "object",
        "properties": {
          "source": {
            "type": "string"
          },
          "marketId": {
            "type": "string"
          },
          "marketURL": {
            "type": "string"
          }
        },
        "required": [
          "source"
        ],
        "additionalProperties": false
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
        "type": "string"
      },
      "methods": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "chats": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "minLength": 1,
              "maxLength": 100
            },
            "name": {
              "type": "string"
            },
            "systemPrompt": {
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
    },
    "required": [
      "id",
      "name",
      "version",
      "packageName",
      "enabled",
      "status",
      "methods",
      "chats"
    ],
    "additionalProperties": false
  }
}
```

## apps.install

Stage a trusted npm application archive

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "source": {
      "type": "string",
      "minLength": 1,
      "maxLength": 4096
    }
  },
  "required": [
    "source"
  ]
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
    "pending": {
      "type": "boolean"
    },
    "installing": {
      "type": "boolean"
    },
    "phase": {
      "anyOf": [
        {
          "type": "string",
          "enum": [
            "catalog",
            "download",
            "extract",
            "copy",
            "dependencies",
            "verify",
            "preflight"
          ]
        },
        {
          "type": "null"
        }
      ]
    },
    "error": {
      "type": [
        "string",
        "null"
      ]
    }
  },
  "required": [
    "id",
    "pending",
    "installing",
    "phase",
    "error"
  ],
  "additionalProperties": false
}
```

## apps.remove

Stage application removal

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "appId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    }
  },
  "required": [
    "appId"
  ]
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
    "pending": {
      "type": "boolean"
    },
    "installing": {
      "type": "boolean"
    },
    "phase": {
      "anyOf": [
        {
          "type": "string",
          "enum": [
            "catalog",
            "download",
            "extract",
            "copy",
            "dependencies",
            "verify",
            "preflight"
          ]
        },
        {
          "type": "null"
        }
      ]
    },
    "error": {
      "type": [
        "string",
        "null"
      ]
    }
  },
  "required": [
    "id",
    "pending",
    "installing",
    "phase",
    "error"
  ],
  "additionalProperties": false
}
```

## apps.enable

Enable or drain and disable an application

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "appId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "enabled": {
      "type": "boolean"
    }
  },
  "required": [
    "appId",
    "enabled"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "null"
}
```

## apps.invoke

Invoke an application method

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "appId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "name": {
      "type": "string"
    },
    "args": {
      "$ref": "#/$defs/__schema0"
    }
  },
  "required": [
    "appId",
    "name",
    "args"
  ],
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

## apps.kv.get

Read application KV (up to 256 KiB UTF-8 JSON)

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "appId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "key": {
      "type": "string",
      "minLength": 1,
      "maxLength": 256
    }
  },
  "required": [
    "appId",
    "key"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$ref": "#/$defs/__schema0",
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

## apps.kv.set

Write application KV (up to 256 KiB UTF-8 JSON)

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "appId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "key": {
      "type": "string",
      "minLength": 1,
      "maxLength": 256
    },
    "value": {
      "$ref": "#/$defs/__schema0"
    }
  },
  "required": [
    "appId",
    "key",
    "value"
  ],
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

## apps.kv.delete

Delete application KV

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "appId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "key": {
      "type": "string",
      "maxLength": 256
    }
  },
  "required": [
    "appId",
    "key"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "null"
}
```

## apps.kv.list

Read a bounded page of application KV

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "appId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "offset": {
      "default": 0,
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "limit": {
      "default": 50,
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    }
  },
  "required": [
    "appId"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "items": {
      "maxItems": 100,
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "key": {
            "type": "string"
          },
          "value": {
            "$ref": "#/$defs/__schema0"
          }
        },
        "required": [
          "key",
          "value"
        ],
        "additionalProperties": false
      }
    },
    "nextOffset": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "hasMore": {
      "type": "boolean"
    }
  },
  "required": [
    "items",
    "nextOffset",
    "hasMore"
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

## connections.providers

List Pi authentication methods

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
      "dynamic": {
        "type": "boolean"
      },
      "methods": {
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
            "subscription": {
              "type": "boolean"
            }
          },
          "required": [
            "id",
            "label",
            "subscription"
          ],
          "additionalProperties": false
        }
      }
    },
    "required": [
      "id",
      "name",
      "modelCount",
      "dynamic",
      "methods"
    ],
    "additionalProperties": false
  }
}
```

## connections.presets

Read Pi preset models without credentials

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "provider": {
      "type": "string"
    },
    "offset": {
      "default": 0,
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "limit": {
      "default": 50,
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    }
  },
  "required": [
    "provider"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "items": {
      "maxItems": 100,
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "minLength": 1,
            "maxLength": 256
          },
          "name": {
            "type": "string",
            "maxLength": 256
          }
        },
        "required": [
          "id",
          "name"
        ],
        "additionalProperties": false
      }
    },
    "nextOffset": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "hasMore": {
      "type": "boolean"
    }
  },
  "required": [
    "items",
    "nextOffset",
    "hasMore"
  ],
  "additionalProperties": false
}
```

## connections.refresh

Refresh the selected account catalog

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    }
  },
  "required": [
    "id"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "null"
}
```

## connections.list

Read a bounded page of model connections

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "offset": {
      "default": 0,
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "limit": {
      "default": 50,
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    }
  }
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "items": {
      "maxItems": 100,
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100
          },
          "name": {
            "type": "string"
          },
          "provider": {
            "type": "string"
          },
          "auth": {
            "type": "string",
            "enum": [
              "api-key",
              "oauth"
            ]
          },
          "profile": {
            "type": "object",
            "propertyNames": {
              "type": "string"
            },
            "additionalProperties": {
              "$ref": "#/$defs/__schema0"
            }
          },
          "configured": {
            "type": "boolean"
          },
          "error": {
            "type": "string"
          }
        },
        "required": [
          "id",
          "name",
          "provider",
          "auth",
          "profile",
          "configured"
        ],
        "additionalProperties": false
      }
    },
    "nextOffset": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "hasMore": {
      "type": "boolean"
    }
  },
  "required": [
    "items",
    "nextOffset",
    "hasMore"
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

## connections.create

Create a connection with its own credentials

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
    "provider": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "auth": {
      "type": "string",
      "enum": [
        "api-key",
        "oauth"
      ]
    },
    "profile": {
      "type": "object",
      "propertyNames": {
        "type": "string"
      },
      "additionalProperties": {
        "$ref": "#/$defs/__schema0"
      }
    }
  },
  "required": [
    "name",
    "provider",
    "auth"
  ],
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
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "name": {
      "type": "string"
    },
    "provider": {
      "type": "string"
    },
    "auth": {
      "type": "string",
      "enum": [
        "api-key",
        "oauth"
      ]
    },
    "profile": {
      "type": "object",
      "propertyNames": {
        "type": "string"
      },
      "additionalProperties": {
        "$ref": "#/$defs/__schema0"
      }
    },
    "configured": {
      "type": "boolean"
    },
    "error": {
      "type": "string"
    }
  },
  "required": [
    "id",
    "name",
    "provider",
    "auth",
    "profile",
    "configured"
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

## connections.rename

Rename a model connection

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    }
  },
  "required": [
    "id",
    "name"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "name": {
      "type": "string"
    },
    "provider": {
      "type": "string"
    },
    "auth": {
      "type": "string",
      "enum": [
        "api-key",
        "oauth"
      ]
    },
    "profile": {
      "type": "object",
      "propertyNames": {
        "type": "string"
      },
      "additionalProperties": {
        "$ref": "#/$defs/__schema0"
      }
    },
    "configured": {
      "type": "boolean"
    },
    "error": {
      "type": "string"
    }
  },
  "required": [
    "id",
    "name",
    "provider",
    "auth",
    "profile",
    "configured"
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

## connections.remove

Remove an unused connection

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    }
  },
  "required": [
    "id"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "null"
}
```

## connections.setKey

Set explicit API key for a new connection

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "key": {
      "type": "string",
      "minLength": 1,
      "maxLength": 16384
    }
  },
  "required": [
    "id",
    "key"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "null"
}
```

## connections.models

Read a bounded page of upstream models

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "offset": {
      "default": 0,
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "limit": {
      "default": 50,
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    }
  },
  "required": [
    "id"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "items": {
      "maxItems": 100,
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
    },
    "nextOffset": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "hasMore": {
      "type": "boolean"
    }
  },
  "required": [
    "items",
    "nextOffset",
    "hasMore"
  ],
  "additionalProperties": false
}
```

## auth.start

Start a managed Pi login

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "connectionId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    }
  },
  "required": [
    "connectionId"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "connectionId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
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
    "events": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/__schema0"
      }
    },
    "prompt": {
      "anyOf": [
        {
          "$ref": "#/$defs/__schema1"
        },
        {
          "type": "null"
        }
      ]
    },
    "error": {
      "type": [
        "string",
        "null"
      ]
    }
  },
  "required": [
    "id",
    "connectionId",
    "status",
    "events",
    "prompt",
    "error"
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
    },
    "__schema1": {
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
            "$ref": "#/$defs/__schema1"
          }
        },
        {
          "type": "object",
          "propertyNames": {
            "type": "string"
          },
          "additionalProperties": {
            "$ref": "#/$defs/__schema1"
          }
        }
      ]
    }
  }
}
```

## auth.list

Read active authentication interactions

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
        "type": "string",
        "minLength": 1,
        "maxLength": 100
      },
      "connectionId": {
        "type": "string",
        "minLength": 1,
        "maxLength": 100
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
      "events": {
        "type": "array",
        "items": {
          "$ref": "#/$defs/__schema0"
        }
      },
      "prompt": {
        "anyOf": [
          {
            "$ref": "#/$defs/__schema1"
          },
          {
            "type": "null"
          }
        ]
      },
      "error": {
        "type": [
          "string",
          "null"
        ]
      }
    },
    "required": [
      "id",
      "connectionId",
      "status",
      "events",
      "prompt",
      "error"
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
    },
    "__schema1": {
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
            "$ref": "#/$defs/__schema1"
          }
        },
        {
          "type": "object",
          "propertyNames": {
            "type": "string"
          },
          "additionalProperties": {
            "$ref": "#/$defs/__schema1"
          }
        }
      ]
    }
  }
}
```

## auth.reply

Answer a pending login prompt

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "promptId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "value": {
      "type": "string",
      "maxLength": 16384
    }
  },
  "required": [
    "id",
    "promptId",
    "value"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "null"
}
```

## auth.cancel

Cancel a login and its callback listener

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    }
  },
  "required": [
    "id"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "null"
}
```

## auth.logout

Remove connection credentials

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "connectionId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    }
  },
  "required": [
    "connectionId"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "null"
}
```

## sessions.list

Read a bounded page of application sessions

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "appId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "offset": {
      "default": 0,
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "limit": {
      "default": 50,
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    }
  }
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "items": {
      "maxItems": 100,
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100
          },
          "appId": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100
          },
          "connectionId": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100
          },
          "modelId": {
            "type": "string",
            "minLength": 1,
            "maxLength": 256
          },
          "title": {
            "type": "string"
          },
          "createdAt": {
            "type": "number"
          },
          "updatedAt": {
            "type": "number"
          },
          "archived": {
            "type": "boolean"
          },
          "policy": {
            "type": "string",
            "enum": [
              "controlled",
              "automatic"
            ]
          },
          "cwd": {
            "type": "string"
          },
          "endpointId": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100
          },
          "status": {
            "type": "string",
            "enum": [
              "idle",
              "running",
              "unloaded"
            ]
          }
        },
        "required": [
          "id",
          "appId",
          "connectionId",
          "modelId",
          "title",
          "createdAt",
          "updatedAt",
          "archived",
          "policy",
          "status"
        ],
        "additionalProperties": false
      }
    },
    "nextOffset": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "hasMore": {
      "type": "boolean"
    }
  },
  "required": [
    "items",
    "nextOffset",
    "hasMore"
  ],
  "additionalProperties": false
}
```

## sessions.create

Create a session bound to one connection

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "appId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "connectionId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "modelId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 256
    },
    "title": {
      "type": "string",
      "maxLength": 200
    },
    "cwd": {
      "type": "string",
      "maxLength": 4096
    },
    "endpointId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "policy": {
      "type": "string",
      "enum": [
        "controlled",
        "automatic"
      ]
    }
  },
  "required": [
    "appId",
    "connectionId",
    "modelId"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "appId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "connectionId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "modelId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 256
    },
    "title": {
      "type": "string"
    },
    "createdAt": {
      "type": "number"
    },
    "updatedAt": {
      "type": "number"
    },
    "archived": {
      "type": "boolean"
    },
    "policy": {
      "type": "string",
      "enum": [
        "controlled",
        "automatic"
      ]
    },
    "cwd": {
      "type": "string"
    },
    "endpointId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "status": {
      "type": "string",
      "enum": [
        "idle",
        "running",
        "unloaded"
      ]
    }
  },
  "required": [
    "id",
    "appId",
    "connectionId",
    "modelId",
    "title",
    "createdAt",
    "updatedAt",
    "archived",
    "policy",
    "status"
  ],
  "additionalProperties": false
}
```

## sessions.send

Durably enqueue input; requestId makes retries idempotent

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "text": {
      "type": "string",
      "minLength": 1,
      "maxLength": 262144
    },
    "requestId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    }
  },
  "required": [
    "id",
    "text",
    "requestId"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "appId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "connectionId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "modelId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 256
    },
    "title": {
      "type": "string"
    },
    "createdAt": {
      "type": "number"
    },
    "updatedAt": {
      "type": "number"
    },
    "archived": {
      "type": "boolean"
    },
    "policy": {
      "type": "string",
      "enum": [
        "controlled",
        "automatic"
      ]
    },
    "cwd": {
      "type": "string"
    },
    "endpointId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "status": {
      "type": "string",
      "enum": [
        "idle",
        "running",
        "unloaded"
      ]
    }
  },
  "required": [
    "id",
    "appId",
    "connectionId",
    "modelId",
    "title",
    "createdAt",
    "updatedAt",
    "archived",
    "policy",
    "status"
  ],
  "additionalProperties": false
}
```

## sessions.cancel

Cancel the current agent turn

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    }
  },
  "required": [
    "id"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "null"
}
```

## sessions.model

Select another model on the same connection

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "modelId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 256
    }
  },
  "required": [
    "id",
    "modelId"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "appId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "connectionId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "modelId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 256
    },
    "title": {
      "type": "string"
    },
    "createdAt": {
      "type": "number"
    },
    "updatedAt": {
      "type": "number"
    },
    "archived": {
      "type": "boolean"
    },
    "policy": {
      "type": "string",
      "enum": [
        "controlled",
        "automatic"
      ]
    },
    "cwd": {
      "type": "string"
    },
    "endpointId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "status": {
      "type": "string",
      "enum": [
        "idle",
        "running",
        "unloaded"
      ]
    }
  },
  "required": [
    "id",
    "appId",
    "connectionId",
    "modelId",
    "title",
    "createdAt",
    "updatedAt",
    "archived",
    "policy",
    "status"
  ],
  "additionalProperties": false
}
```

## sessions.archive

Archive or restore a session

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "archived": {
      "type": "boolean"
    }
  },
  "required": [
    "id",
    "archived"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "appId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "connectionId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "modelId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 256
    },
    "title": {
      "type": "string"
    },
    "createdAt": {
      "type": "number"
    },
    "updatedAt": {
      "type": "number"
    },
    "archived": {
      "type": "boolean"
    },
    "policy": {
      "type": "string",
      "enum": [
        "controlled",
        "automatic"
      ]
    },
    "cwd": {
      "type": "string"
    },
    "endpointId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "status": {
      "type": "string",
      "enum": [
        "idle",
        "running",
        "unloaded"
      ]
    }
  },
  "required": [
    "id",
    "appId",
    "connectionId",
    "modelId",
    "title",
    "createdAt",
    "updatedAt",
    "archived",
    "policy",
    "status"
  ],
  "additionalProperties": false
}
```

## sessions.projection

Read a durable, bounded display projection

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "offset": {
      "default": 0,
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "limit": {
      "default": 50,
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    }
  },
  "required": [
    "id"
  ]
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

## approvals.list

Read pending tool approval requests

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
        "type": "string",
        "minLength": 1,
        "maxLength": 100
      },
      "sessionId": {
        "type": "string",
        "minLength": 1,
        "maxLength": 100
      },
      "toolName": {
        "type": "string"
      },
      "reason": {
        "type": "string"
      }
    },
    "required": [
      "id",
      "sessionId",
      "toolName"
    ],
    "additionalProperties": false
  }
}
```

## approvals.reply

Approve once or reject an explicit tool request

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "allow": {
      "type": "boolean"
    }
  },
  "required": [
    "id",
    "allow"
  ]
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "null"
}
```

## chat.status

Read CloudKit synchronization state

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

## chat.connect

Connect Chat to this iCloud account

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

## chat.sync

Synchronize Chat commands and session projections

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

## Event: appearance.changed

Appearance changed in another window
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

## Event: runtime.changed

Ephemeral invalidation; clients reread durable state after reconnect
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "epoch": {
      "type": "string"
    },
    "kind": {
      "type": "string"
    },
    "sessionId": {
      "type": "string"
    },
    "appId": {
      "type": "string"
    },
    "data": {
      "$ref": "#/$defs/__schema0"
    }
  },
  "required": [
    "epoch",
    "kind"
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
