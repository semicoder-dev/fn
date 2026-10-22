// Generated from the application's API contract.

export namespace Method0InputTypes {
export interface Method0Input {
  sessionId: string;
  offset?: number;
  limit?: number;
  [k: string]: unknown;
}

}
export namespace Method0OutputTypes {
export interface Method0Output {
  /**
   * @maxItems 100
   */
  items: {
    id: string;
    sessionId: string;
    createdAt: number;
    expiresAt: number;
    state: "pending" | "running" | "completed" | "failed" | "cancelled" | "expired" | "interrupted";
    card: {
      version: 1;
      template: "approval" | "choice" | "form";
      title: string;
      summary: string;
      /**
       * @maxItems 30
       */
      blocks: (
        | {
            type: "text";
            text: string;
          }
        | {
            type: "fields";
            /**
             * @maxItems 20
             */
            fields:
              | []
              | [
                  {
                    label: string;
                    value: string;
                  }
                ]
              | [
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  }
                ]
              | [
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  }
                ]
              | [
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  }
                ]
              | [
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  }
                ]
              | [
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  }
                ]
              | [
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  }
                ]
              | [
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  }
                ]
              | [
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  }
                ]
              | [
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  }
                ]
              | [
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  }
                ]
              | [
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  }
                ]
              | [
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  }
                ]
              | [
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  }
                ]
              | [
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  }
                ]
              | [
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  }
                ]
              | [
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  }
                ]
              | [
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  }
                ]
              | [
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  }
                ]
              | [
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  },
                  {
                    label: string;
                    value: string;
                  }
                ];
          }
        | {
            type: "divider";
          }
      )[];
      /**
       * @maxItems 20
       */
      inputs:
        | []
        | [
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            }
          ]
        | [
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            }
          ]
        | [
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            }
          ]
        | [
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            }
          ]
        | [
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            }
          ]
        | [
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            }
          ]
        | [
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            }
          ]
        | [
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            }
          ]
        | [
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            }
          ]
        | [
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            }
          ]
        | [
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            }
          ]
        | [
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            }
          ]
        | [
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            }
          ]
        | [
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            }
          ]
        | [
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            }
          ]
        | [
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            }
          ]
        | [
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            }
          ]
        | [
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            }
          ]
        | [
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            }
          ]
        | [
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            },
            {
              id: string;
              label: string;
              type: "text" | "number" | "boolean" | "select" | "multiSelect";
              required: boolean;
              /**
               * @minItems 1
               * @maxItems 50
               */
              options?: [
                {
                  id: string;
                  label: string;
                },
                ...{
                  id: string;
                  label: string;
                }[]
              ];
              maxLength?: number;
              minimum?: number;
              maximum?: number;
            }
          ];
      /**
       * @minItems 1
       * @maxItems 10
       */
      actions:
        | [
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            }
          ]
        | [
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            }
          ]
        | [
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            }
          ]
        | [
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            }
          ]
        | [
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            }
          ]
        | [
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            }
          ]
        | [
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            }
          ]
        | [
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            }
          ]
        | [
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            }
          ]
        | [
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            },
            {
              id: string;
              label: string;
              style?: "normal" | "primary" | "danger";
            }
          ];
    };
    answer?: {
      actionId: string;
      values: {
        [k: string]: string | number | boolean | string[];
      };
    };
    error?: string;
  }[];
  nextOffset: number;
  hasMore: boolean;
}

}
export namespace Method1InputTypes {
export interface Method1Input {
  sessionId: string;
  cardId: string;
  actionId: string;
  values: {
    [k: string]: string | number | boolean | string[];
  };
  [k: string]: unknown;
}

}
export namespace Method1OutputTypes {
export type Method1Output = null;

}
export namespace Method2InputTypes {
export interface Method2Input {}

}
export namespace Method2OutputTypes {
export interface Method2Output {
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
export namespace Method3InputTypes {
export interface Method3Input {
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
export namespace Method3OutputTypes {
export interface Method3Output {
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
export namespace Method4InputTypes {
export interface Method4Input {
  offset?: number;
  limit?: number;
  [k: string]: unknown;
}

}
export namespace Method4OutputTypes {
export interface Method4Output {
  /**
   * @maxItems 100
   */
  items: {
    id: string;
    name: string;
    connectionId: string;
  }[];
  nextOffset: number;
  hasMore: boolean;
}

}
export namespace Method5InputTypes {
export interface Method5Input {
  connectionId: string;
  modelId: string;
  selected: boolean;
  [k: string]: unknown;
}

}
export namespace Method5OutputTypes {
export type Method5Output = null;

}
export namespace Method6InputTypes {
export interface Method6Input {}

}
export namespace Method6OutputTypes {
export type Method6Output = {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  updatedAt: number | null;
  error: string | null;
  count: number;
  refreshing: boolean;
}[];

}
export namespace Method7InputTypes {
export interface Method7Input {
  name: string;
  url: string;
  [k: string]: unknown;
}

}
export namespace Method7OutputTypes {
export type Method7Output = null;

}
export namespace Method8InputTypes {
export interface Method8Input {
  id: string;
  name?: string;
  enabled?: boolean;
  [k: string]: unknown;
}

}
export namespace Method8OutputTypes {
export type Method8Output = null;

}
export namespace Method9InputTypes {
export interface Method9Input {
  id: string;
  [k: string]: unknown;
}

}
export namespace Method9OutputTypes {
export type Method9Output = null;

}
export namespace Method10InputTypes {
export interface Method10Input {
  id?: string;
  [k: string]: unknown;
}

}
export namespace Method10OutputTypes {
export type Method10Output = null;

}
export namespace Method11InputTypes {
export interface Method11Input {
  query?: string;
  offset?: number;
  limit?: number;
  [k: string]: unknown;
}

}
export namespace Method11OutputTypes {
export interface Method11Output {
  /**
   * @maxItems 100
   */
  items: {
    icon?: string;
    iconSvg?: string;
    id: string;
    packageName: string;
    name: string;
    description: string;
    version: string;
    url: string;
    sha256: string;
    core: {
      [k: string]: string;
    };
    marketId: string;
    marketName: string;
    installedVersion: string | null;
    state: "available" | "installed" | "update" | "incompatible" | "conflict";
  }[];
  nextOffset: number;
  hasMore: boolean;
}

}
export namespace Method12InputTypes {
export interface Method12Input {
  marketId: string;
  appId: string;
  [k: string]: unknown;
}

}
export namespace Method12OutputTypes {
export interface Method12Output {
  id: string;
  pending: boolean;
  installing: boolean;
  phase: ("catalog" | "download" | "extract" | "copy" | "dependencies" | "verify" | "preflight") | null;
  error: string | null;
}

}
export namespace Method13InputTypes {
export interface Method13Input {
  appId: string;
  [k: string]: unknown;
}

}
export namespace Method13OutputTypes {
export interface Method13Output {
  id: string;
  pending: boolean;
  installing: boolean;
  phase: ("catalog" | "download" | "extract" | "copy" | "dependencies" | "verify" | "preflight") | null;
  error: string | null;
}

}
export namespace Method14InputTypes {
export interface Method14Input {}

}
export namespace Method14OutputTypes {
export interface Method14Output {
  epoch: string;
  seedId: string;
  busy: boolean;
  generation: {
    id: string;
    pending: boolean;
    installing: boolean;
    phase: ("catalog" | "download" | "extract" | "copy" | "dependencies" | "verify" | "preflight") | null;
    error: string | null;
  };
  dataDirectory: string;
}

}
export namespace Method15InputTypes {
export interface Method15Input {
  epoch: string;
  seedId: string;
  [k: string]: unknown;
}

}
export namespace Method15OutputTypes {
export interface Method15Output {
  accepted: boolean;
  reason?: string;
}

}
export namespace Method16InputTypes {
export interface Method16Input {}

}
export namespace Method16OutputTypes {
export interface Method16Output {
  id: string;
  pending: boolean;
  installing: boolean;
  phase: ("catalog" | "download" | "extract" | "copy" | "dependencies" | "verify" | "preflight") | null;
  error: string | null;
}

}
export namespace Method17InputTypes {
export interface Method17Input {}

}
export namespace Method17OutputTypes {
export type Method17Output = {
  icon?: string;
  iconSvg?: string;
  id: string;
  name: string;
  description?: string;
  version: string;
  packageName: string;
  client?: string;
  clientURL?: string;
  origin?: {
    source: string;
    marketId?: string;
    marketURL?: string;
  };
  enabled: boolean;
  status: "active" | "disabled" | "error";
  error?: string;
  methods: string[];
  chats: {
    id: string;
    name: string;
    systemPrompt?: string;
  }[];
}[];

}
export namespace Method18InputTypes {
export interface Method18Input {
  source: string;
  [k: string]: unknown;
}

}
export namespace Method18OutputTypes {
export interface Method18Output {
  id: string;
  pending: boolean;
  installing: boolean;
  phase: ("catalog" | "download" | "extract" | "copy" | "dependencies" | "verify" | "preflight") | null;
  error: string | null;
}

}
export namespace Method19InputTypes {
export interface Method19Input {
  appId: string;
  [k: string]: unknown;
}

}
export namespace Method19OutputTypes {
export interface Method19Output {
  id: string;
  pending: boolean;
  installing: boolean;
  phase: ("catalog" | "download" | "extract" | "copy" | "dependencies" | "verify" | "preflight") | null;
  error: string | null;
}

}
export namespace Method20InputTypes {
export interface Method20Input {
  appId: string;
  enabled: boolean;
  [k: string]: unknown;
}

}
export namespace Method20OutputTypes {
export type Method20Output = null;

}
export namespace Method21InputTypes {
export type _Schema0 =
  | string
  | number
  | boolean
  | null
  | _Schema0[]
  | {
      [k: string]: _Schema0;
    };

export interface Method21Input {
  appId: string;
  name: string;
  args: _Schema0;
  [k: string]: unknown;
}

}
export namespace Method21OutputTypes {
export type Method21Output =
  | string
  | number
  | boolean
  | null
  | Method21Output[]
  | {
      [k: string]: Method21Output;
    };

}
export namespace Method22InputTypes {
export interface Method22Input {
  appId: string;
  key: string;
  [k: string]: unknown;
}

}
export namespace Method22OutputTypes {
export type Method22Output = _Schema0;
export type _Schema0 =
  | string
  | number
  | boolean
  | null
  | _Schema0[]
  | {
      [k: string]: _Schema0;
    };

}
export namespace Method23InputTypes {
export type _Schema0 =
  | string
  | number
  | boolean
  | null
  | _Schema0[]
  | {
      [k: string]: _Schema0;
    };

export interface Method23Input {
  appId: string;
  key: string;
  value: _Schema0;
  [k: string]: unknown;
}

}
export namespace Method23OutputTypes {
export type Method23Output = null;

}
export namespace Method24InputTypes {
export interface Method24Input {
  appId: string;
  key: string;
  [k: string]: unknown;
}

}
export namespace Method24OutputTypes {
export type Method24Output = null;

}
export namespace Method25InputTypes {
export interface Method25Input {
  appId: string;
  offset?: number;
  limit?: number;
  [k: string]: unknown;
}

}
export namespace Method25OutputTypes {
export type _Schema0 =
  | string
  | number
  | boolean
  | null
  | _Schema0[]
  | {
      [k: string]: _Schema0;
    };

export interface Method25Output {
  /**
   * @maxItems 100
   */
  items: {
    key: string;
    value: _Schema0;
  }[];
  nextOffset: number;
  hasMore: boolean;
}

}
export namespace Method26InputTypes {
export interface Method26Input {}

}
export namespace Method26OutputTypes {
export type Method26Output = {
  id: string;
  name: string;
  modelCount: number;
  dynamic: boolean;
  methods: {
    id: string;
    label: string;
    subscription: boolean;
  }[];
}[];

}
export namespace Method27InputTypes {
export interface Method27Input {
  provider: string;
  offset?: number;
  limit?: number;
  [k: string]: unknown;
}

}
export namespace Method27OutputTypes {
export interface Method27Output {
  /**
   * @maxItems 100
   */
  items: {
    id: string;
    name: string;
  }[];
  nextOffset: number;
  hasMore: boolean;
}

}
export namespace Method28InputTypes {
export interface Method28Input {
  id: string;
  [k: string]: unknown;
}

}
export namespace Method28OutputTypes {
export type Method28Output = null;

}
export namespace Method29InputTypes {
export interface Method29Input {
  offset?: number;
  limit?: number;
  [k: string]: unknown;
}

}
export namespace Method29OutputTypes {
export type _Schema0 =
  | string
  | number
  | boolean
  | null
  | _Schema0[]
  | {
      [k: string]: _Schema0;
    };

export interface Method29Output {
  /**
   * @maxItems 100
   */
  items: {
    id: string;
    name: string;
    provider: string;
    auth: "api-key" | "oauth";
    profile: {
      [k: string]: _Schema0;
    };
    configured: boolean;
    error?: string;
  }[];
  nextOffset: number;
  hasMore: boolean;
}

}
export namespace Method30InputTypes {
export type _Schema0 =
  | string
  | number
  | boolean
  | null
  | _Schema0[]
  | {
      [k: string]: _Schema0;
    };

export interface Method30Input {
  name: string;
  provider: string;
  auth: "api-key" | "oauth";
  profile?: {
    [k: string]: _Schema0;
  };
  [k: string]: unknown;
}

}
export namespace Method30OutputTypes {
export type _Schema0 =
  | string
  | number
  | boolean
  | null
  | _Schema0[]
  | {
      [k: string]: _Schema0;
    };

export interface Method30Output {
  id: string;
  name: string;
  provider: string;
  auth: "api-key" | "oauth";
  profile: {
    [k: string]: _Schema0;
  };
  configured: boolean;
  error?: string;
}

}
export namespace Method31InputTypes {
export interface Method31Input {
  id: string;
  name: string;
  [k: string]: unknown;
}

}
export namespace Method31OutputTypes {
export type _Schema0 =
  | string
  | number
  | boolean
  | null
  | _Schema0[]
  | {
      [k: string]: _Schema0;
    };

export interface Method31Output {
  id: string;
  name: string;
  provider: string;
  auth: "api-key" | "oauth";
  profile: {
    [k: string]: _Schema0;
  };
  configured: boolean;
  error?: string;
}

}
export namespace Method32InputTypes {
export interface Method32Input {
  id: string;
  [k: string]: unknown;
}

}
export namespace Method32OutputTypes {
export type Method32Output = null;

}
export namespace Method33InputTypes {
export interface Method33Input {
  id: string;
  key: string;
  [k: string]: unknown;
}

}
export namespace Method33OutputTypes {
export type Method33Output = null;

}
export namespace Method34InputTypes {
export interface Method34Input {
  id: string;
  offset?: number;
  limit?: number;
  [k: string]: unknown;
}

}
export namespace Method34OutputTypes {
export interface Method34Output {
  /**
   * @maxItems 100
   */
  items: {
    id: string;
    name: string;
  }[];
  nextOffset: number;
  hasMore: boolean;
}

}
export namespace Method35InputTypes {
export interface Method35Input {
  connectionId: string;
  [k: string]: unknown;
}

}
export namespace Method35OutputTypes {
export type _Schema0 =
  | string
  | number
  | boolean
  | null
  | _Schema0[]
  | {
      [k: string]: _Schema0;
    };
export type _Schema1 =
  | string
  | number
  | boolean
  | null
  | _Schema1[]
  | {
      [k: string]: _Schema1;
    };

export interface Method35Output {
  id: string;
  connectionId: string;
  status: "running" | "completed" | "failed" | "cancelled";
  events: _Schema0[];
  prompt: _Schema1 | null;
  error: string | null;
}

}
export namespace Method36InputTypes {
export interface Method36Input {}

}
export namespace Method36OutputTypes {
export type _Schema0 =
  | string
  | number
  | boolean
  | null
  | _Schema0[]
  | {
      [k: string]: _Schema0;
    };
export type _Schema1 =
  | string
  | number
  | boolean
  | null
  | _Schema1[]
  | {
      [k: string]: _Schema1;
    };
export type Method36Output = {
  id: string;
  connectionId: string;
  status: "running" | "completed" | "failed" | "cancelled";
  events: _Schema0[];
  prompt: _Schema1 | null;
  error: string | null;
}[];

}
export namespace Method37InputTypes {
export interface Method37Input {
  id: string;
  promptId: string;
  value: string;
  [k: string]: unknown;
}

}
export namespace Method37OutputTypes {
export type Method37Output = null;

}
export namespace Method38InputTypes {
export interface Method38Input {
  id: string;
  [k: string]: unknown;
}

}
export namespace Method38OutputTypes {
export type Method38Output = null;

}
export namespace Method39InputTypes {
export interface Method39Input {
  connectionId: string;
  [k: string]: unknown;
}

}
export namespace Method39OutputTypes {
export type Method39Output = null;

}
export namespace Method40InputTypes {
export interface Method40Input {
  appId?: string;
  offset?: number;
  limit?: number;
  [k: string]: unknown;
}

}
export namespace Method40OutputTypes {
export interface Method40Output {
  /**
   * @maxItems 100
   */
  items: {
    id: string;
    appId: string;
    connectionId: string;
    modelId: string;
    title: string;
    createdAt: number;
    updatedAt: number;
    archived: boolean;
    policy: "controlled" | "automatic";
    cwd?: string;
    endpointId?: string;
    status: "idle" | "running" | "unloaded";
  }[];
  nextOffset: number;
  hasMore: boolean;
}

}
export namespace Method41InputTypes {
export interface Method41Input {
  appId: string;
  connectionId: string;
  modelId: string;
  title?: string;
  cwd?: string;
  endpointId?: string;
  policy?: "controlled" | "automatic";
  [k: string]: unknown;
}

}
export namespace Method41OutputTypes {
export interface Method41Output {
  id: string;
  appId: string;
  connectionId: string;
  modelId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  archived: boolean;
  policy: "controlled" | "automatic";
  cwd?: string;
  endpointId?: string;
  status: "idle" | "running" | "unloaded";
}

}
export namespace Method42InputTypes {
export interface Method42Input {
  id: string;
  text: string;
  requestId: string;
  [k: string]: unknown;
}

}
export namespace Method42OutputTypes {
export interface Method42Output {
  id: string;
  appId: string;
  connectionId: string;
  modelId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  archived: boolean;
  policy: "controlled" | "automatic";
  cwd?: string;
  endpointId?: string;
  status: "idle" | "running" | "unloaded";
}

}
export namespace Method43InputTypes {
export interface Method43Input {
  id: string;
  [k: string]: unknown;
}

}
export namespace Method43OutputTypes {
export type Method43Output = null;

}
export namespace Method44InputTypes {
export interface Method44Input {
  id: string;
  modelId: string;
  [k: string]: unknown;
}

}
export namespace Method44OutputTypes {
export interface Method44Output {
  id: string;
  appId: string;
  connectionId: string;
  modelId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  archived: boolean;
  policy: "controlled" | "automatic";
  cwd?: string;
  endpointId?: string;
  status: "idle" | "running" | "unloaded";
}

}
export namespace Method45InputTypes {
export interface Method45Input {
  id: string;
  archived: boolean;
  [k: string]: unknown;
}

}
export namespace Method45OutputTypes {
export interface Method45Output {
  id: string;
  appId: string;
  connectionId: string;
  modelId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  archived: boolean;
  policy: "controlled" | "automatic";
  cwd?: string;
  endpointId?: string;
  status: "idle" | "running" | "unloaded";
}

}
export namespace Method46InputTypes {
export interface Method46Input {
  id: string;
  offset?: number;
  limit?: number;
  [k: string]: unknown;
}

}
export namespace Method46OutputTypes {
export type Method46Output =
  | string
  | number
  | boolean
  | null
  | Method46Output[]
  | {
      [k: string]: Method46Output;
    };

}
export namespace Method47InputTypes {
export interface Method47Input {}

}
export namespace Method47OutputTypes {
export type Method47Output = {
  id: string;
  sessionId: string;
  toolName: string;
  reason?: string;
}[];

}
export namespace Method48InputTypes {
export interface Method48Input {
  id: string;
  allow: boolean;
  [k: string]: unknown;
}

}
export namespace Method48OutputTypes {
export type Method48Output = null;

}
export namespace Method49InputTypes {
export interface Method49Input {}

}
export namespace Method49OutputTypes {
export type Method49Output =
  | string
  | number
  | boolean
  | null
  | Method49Output[]
  | {
      [k: string]: Method49Output;
    };

}
export namespace Method50InputTypes {
export interface Method50Input {}

}
export namespace Method50OutputTypes {
export type Method50Output = null;

}
export namespace Method51InputTypes {
export interface Method51Input {}

}
export namespace Method51OutputTypes {
export type Method51Output = null;

}
export namespace Event52Types {
export interface Event52 {
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
export namespace Event53Types {
export type _Schema0 =
  | string
  | number
  | boolean
  | null
  | _Schema0[]
  | {
      [k: string]: _Schema0;
    };

export interface Event53 {
  epoch: string;
  kind: string;
  sessionId?: string;
  appId?: string;
  data?: _Schema0;
}

}
export interface FIAApplication {
call(method: "cards.list", input: Method0InputTypes.Method0Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method0OutputTypes.Method0Output>;
call(method: "cards.respond", input: Method1InputTypes.Method1Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method1OutputTypes.Method1Output>;
call(method: "appearance.get", input: Method2InputTypes.Method2Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method2OutputTypes.Method2Output>;
call(method: "appearance.set", input: Method3InputTypes.Method3Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method3OutputTypes.Method3Output>;
call(method: "models.saved", input: Method4InputTypes.Method4Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method4OutputTypes.Method4Output>;
call(method: "models.select", input: Method5InputTypes.Method5Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method5OutputTypes.Method5Output>;
call(method: "market.list", input: Method6InputTypes.Method6Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method6OutputTypes.Method6Output>;
call(method: "market.add", input: Method7InputTypes.Method7Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method7OutputTypes.Method7Output>;
call(method: "market.change", input: Method8InputTypes.Method8Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method8OutputTypes.Method8Output>;
call(method: "market.remove", input: Method9InputTypes.Method9Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method9OutputTypes.Method9Output>;
call(method: "market.refresh", input: Method10InputTypes.Method10Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method10OutputTypes.Method10Output>;
call(method: "market.catalog", input: Method11InputTypes.Method11Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method11OutputTypes.Method11Output>;
call(method: "market.install", input: Method12InputTypes.Method12Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method12OutputTypes.Method12Output>;
call(method: "apps.update", input: Method13InputTypes.Method13Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method13OutputTypes.Method13Output>;
call(method: "runtime.status", input: Method14InputTypes.Method14Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method14OutputTypes.Method14Output>;
call(method: "runtime.reloadSeed", input: Method15InputTypes.Method15Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method15OutputTypes.Method15Output>;
call(method: "runtime.applyUpdate", input: Method16InputTypes.Method16Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method16OutputTypes.Method16Output>;
call(method: "apps.list", input: Method17InputTypes.Method17Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method17OutputTypes.Method17Output>;
call(method: "apps.install", input: Method18InputTypes.Method18Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method18OutputTypes.Method18Output>;
call(method: "apps.remove", input: Method19InputTypes.Method19Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method19OutputTypes.Method19Output>;
call(method: "apps.enable", input: Method20InputTypes.Method20Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method20OutputTypes.Method20Output>;
call(method: "apps.invoke", input: Method21InputTypes.Method21Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method21OutputTypes.Method21Output>;
call(method: "apps.kv.get", input: Method22InputTypes.Method22Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method22OutputTypes.Method22Output>;
call(method: "apps.kv.set", input: Method23InputTypes.Method23Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method23OutputTypes.Method23Output>;
call(method: "apps.kv.delete", input: Method24InputTypes.Method24Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method24OutputTypes.Method24Output>;
call(method: "apps.kv.list", input: Method25InputTypes.Method25Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method25OutputTypes.Method25Output>;
call(method: "connections.providers", input: Method26InputTypes.Method26Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method26OutputTypes.Method26Output>;
call(method: "connections.presets", input: Method27InputTypes.Method27Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method27OutputTypes.Method27Output>;
call(method: "connections.refresh", input: Method28InputTypes.Method28Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method28OutputTypes.Method28Output>;
call(method: "connections.list", input: Method29InputTypes.Method29Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method29OutputTypes.Method29Output>;
call(method: "connections.create", input: Method30InputTypes.Method30Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method30OutputTypes.Method30Output>;
call(method: "connections.rename", input: Method31InputTypes.Method31Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method31OutputTypes.Method31Output>;
call(method: "connections.remove", input: Method32InputTypes.Method32Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method32OutputTypes.Method32Output>;
call(method: "connections.setKey", input: Method33InputTypes.Method33Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method33OutputTypes.Method33Output>;
call(method: "connections.models", input: Method34InputTypes.Method34Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method34OutputTypes.Method34Output>;
call(method: "auth.start", input: Method35InputTypes.Method35Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method35OutputTypes.Method35Output>;
call(method: "auth.list", input: Method36InputTypes.Method36Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method36OutputTypes.Method36Output>;
call(method: "auth.reply", input: Method37InputTypes.Method37Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method37OutputTypes.Method37Output>;
call(method: "auth.cancel", input: Method38InputTypes.Method38Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method38OutputTypes.Method38Output>;
call(method: "auth.logout", input: Method39InputTypes.Method39Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method39OutputTypes.Method39Output>;
call(method: "sessions.list", input: Method40InputTypes.Method40Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method40OutputTypes.Method40Output>;
call(method: "sessions.create", input: Method41InputTypes.Method41Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method41OutputTypes.Method41Output>;
call(method: "sessions.send", input: Method42InputTypes.Method42Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method42OutputTypes.Method42Output>;
call(method: "sessions.cancel", input: Method43InputTypes.Method43Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method43OutputTypes.Method43Output>;
call(method: "sessions.model", input: Method44InputTypes.Method44Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method44OutputTypes.Method44Output>;
call(method: "sessions.archive", input: Method45InputTypes.Method45Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method45OutputTypes.Method45Output>;
call(method: "sessions.projection", input: Method46InputTypes.Method46Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method46OutputTypes.Method46Output>;
call(method: "approvals.list", input: Method47InputTypes.Method47Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method47OutputTypes.Method47Output>;
call(method: "approvals.reply", input: Method48InputTypes.Method48Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method48OutputTypes.Method48Output>;
call(method: "chat.status", input: Method49InputTypes.Method49Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method49OutputTypes.Method49Output>;
call(method: "chat.connect", input: Method50InputTypes.Method50Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method50OutputTypes.Method50Output>;
call(method: "chat.sync", input: Method51InputTypes.Method51Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method51OutputTypes.Method51Output>;
on(event: "appearance.changed", listener: (payload: Event52Types.Event52) => void, options?: {match?: Readonly<Record<string, string | number | boolean | null>>}): () => void;
on(event: "runtime.changed", listener: (payload: Event53Types.Event53) => void, options?: {match?: Readonly<Record<string, string | number | boolean | null>>}): () => void;
onReconnect(listener: () => void): () => void;
close(): void;
}
declare global { const app: FIAApplication; function help(name?: string): string; }
