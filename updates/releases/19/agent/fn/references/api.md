# API reference

Application build: 19

## platform.command

Manage Fn applications and isolated development instances

Input:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "action": {
      "type": "string"
    },
    "input": {
      "$ref": "#/$defs/__schema0"
    }
  },
  "required": [
    "action"
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

## Event: platform.changed

Application platform changed
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {},
  "additionalProperties": false
}
```
