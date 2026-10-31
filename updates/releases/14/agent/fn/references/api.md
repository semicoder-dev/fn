# API reference

Application build: 14

## host.ready

Confirm the current composition after its root UI rendered

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "epoch": {
      "type": "string"
    },
    "generationId": {
      "type": "string"
    },
    "clientId": {
      "type": "string"
    }
  },
  "required": [
    "epoch",
    "generationId",
    "clientId"
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

## host.updateFailed

Report a failed page composition during live activation

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "epoch": {
      "type": "string"
    },
    "generationId": {
      "type": "string"
    },
    "clientId": {
      "type": "string"
    },
    "error": {
      "type": "string",
      "maxLength": 2000
    }
  },
  "required": [
    "epoch",
    "generationId",
    "clientId",
    "error"
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

## host.status

Read host readiness

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {}
}
```
Output:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "ready": {
      "type": "boolean"
    },
    "epoch": {
      "type": "string"
    },
    "error": {
      "type": [
        "string",
        "null"
      ]
    },
    "namespaces": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "required": [
    "ready",
    "epoch",
    "error",
    "namespaces"
  ],
  "additionalProperties": false
}
```

## host.recover

Restart with previous or default plugin composition

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "mode": {
      "type": "string",
      "enum": [
        "previous",
        "default"
      ]
    }
  },
  "required": [
    "mode"
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

## Event: host.composition

A new plugin composition is ready for incremental client activation
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "generationId": {
      "type": "string"
    }
  },
  "required": [
    "generationId"
  ],
  "additionalProperties": false
}
```

## Event: host.apis

Available plugin API namespaces changed
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "namespaces": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "required": [
    "namespaces"
  ],
  "additionalProperties": false
}
```
