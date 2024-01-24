import { decodeVarint } from "./varintUtils";
import { parseInput } from "./hexUtils";
import JSBI from "jsbi";

describe("decodeVarint", () => {
  it("should decode valid varint", () => {
    const result = decodeVarint(parseInput("AC 02"), 0);

    expect(result).toEqual({
      value: JSBI.BigInt(300),
      length: 2
    });
  });

  it("should decode valid varint with offset", () => {
    const result = decodeVarint(parseInput("AC 02"), 1);
    expect(result).toEqual({
      value: JSBI.BigInt(2),
      length: 1
    });
  });

  it("should throw error on invalid varint", () => {
    expect(() => {
      decodeVarint(parseInput("AC AC"), 1);
    }).toThrow();
  });
});
