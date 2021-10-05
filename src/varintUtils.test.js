import { decodeVarint } from "./varintUtils";
import { parseInput } from "./hexUtils";
import JSBI from "jsbi";

describe("decodeVarint", () => {
  it("should decode valid varint", () => {
    const result = decodeVarint(parseInput("AC 02"), 0);
    const intResult = result.find(r => r.type === "Int");

    expect(intResult).toEqual({
      value: JSBI.BigInt(300),
      type: "Int",
      length: 2
    });
  });

  it("should decode valid varint with a signed integer possibility", () => {
    const result = decodeVarint(parseInput("9F A3 64"), 0);
    const intResult = result.find(r => r.type === "Int");
    expect(intResult).toEqual({
      value: JSBI.BigInt(1642911),
      type: "Int",
      length: 3
    });

    const signedIntResult = result.find(r => r.type === "Signed Int");
    expect(signedIntResult).toEqual({
      value: JSBI.BigInt(-821456),
      type: "Signed Int",
      length: 3
    });
  });

  it("should decode valid varint with offset", () => {
    const result = decodeVarint(parseInput("AC 02"), 1);
    const intResult = result.find(r => r.type === "Int");
    expect(intResult).toEqual({
      value: JSBI.BigInt(2),
      type: "Int",
      length: 1
    });
  });

  it("should throw error on invalid varint", () => {
    expect(() => {
      decodeVarint(parseInput("AC AC"), 1);
    }).toThrow();
  });
});
