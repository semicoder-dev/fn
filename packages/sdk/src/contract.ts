import { z } from "zod";
export { z };
export interface Procedure<
  I extends z.ZodType = z.ZodType,
  O extends z.ZodType = z.ZodType,
> {
  input: I;
  output: O;
  streaming: boolean;
}
export type Contract = Record<string, Procedure>;
export function method<I extends z.ZodType, O extends z.ZodType>(definition: {
  input: I;
  output: O;
}): Procedure<I, O> {
  return { ...definition, streaming: false };
}
export function stream<I extends z.ZodType, O extends z.ZodType>(definition: {
  input: I;
  chunk: O;
}): Procedure<I, O> {
  return { input: definition.input, output: definition.chunk, streaming: true };
}
export function defineContract<const C extends Contract>(contract: C): C {
  return contract;
}
export type Input<P extends Procedure> = z.input<P["input"]>;
export type Output<P extends Procedure> = z.output<P["output"]>;
