import { decodeVarint, interpretAsSignedType } from "./varintUtils";
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

describe("interpretAsSignedType", () => {
  // taken from https://developers.google.com/protocol-buffers/docs/encoding#signed_integers
  const testCases = [
    ["0", "0"],
    ["1", "-1"],
    ["2", "1"],
    ["3", "-2"],
    ["4294967294", "2147483647"],
    ["4294967295", "-2147483648"],
    ["1642911", "-821456"] // this one is from the GitHub issues
  ];
  testCases.forEach(testCase => {
    const input = testCase[0];
    const expected = testCase[1];
    it("should return " + expected + " for input " + input, () => {
      expect(interpretAsSignedType(JSBI.BigInt(input))).toEqual(
        JSBI.BigInt(expected)
      );
    });
  });
});
