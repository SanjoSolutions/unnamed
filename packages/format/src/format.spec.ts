import { output as expectedOutput } from "./expected/index.js";
import { format } from "./format.js";
import { input } from "./input/index.js";

describe("format", () => {
  it("formats", () => {
    const output = format(input);
    expect(output).toEqual(expectedOutput);
  });
});
