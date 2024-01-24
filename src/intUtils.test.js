import { interpretAsSignedType, interpretAsTwosComplement } from "./intUtils";
import JSBI from "jsbi";

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

describe("interpretAsTwosComplement", () => {
  const testCases = [
    ["0", "0"], // not 2-complement
    ["127", "127"], // not 2-complement
    ["128", "-128"],
    ["129", "-127"],
    ["255", "-1"],
    ["256", "256"] // no longer 8-bit
  ];
  testCases.forEach(testCase => {
    const input = testCase[0];
    const expected = testCase[1];
    it("should return " + expected + " for input " + input, () => {
      expect(interpretAsTwosComplement(JSBI.BigInt(input), 8)).toEqual(
        JSBI.BigInt(expected)
      );
    });
  });
});
