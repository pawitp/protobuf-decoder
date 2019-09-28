import { bufferToPrettyHex, parseHex } from "./hexUtils";

it("should parse lowercased hex", () => {
  const result = parseHex("aabbcc");

  expect(result.toString("hex")).toEqual("aabbcc");
});

it("should parse uppercased hex", () => {
  const result = parseHex("AABBCC");

  expect(result.toString("hex")).toEqual("aabbcc");
});

it("should parse hex with space", () => {
  const result = parseHex("aa bb\ncc\tdd");

  expect(result.toString("hex")).toEqual("aabbccdd");
});

it("should parse hex with 0x prefix", () => {
  const result = parseHex("0xaa 0xbb 0xcc 0xdd");

  expect(result.toString("hex")).toEqual("aabbccdd");
});

it("should return empty for invalid hex", () => {
  const result = parseHex("zz");

  expect(result.toString("hex")).toEqual("");
});

it("should convert hex to string", () => {
  const result = bufferToPrettyHex(parseHex("000102aa"));

  expect(result).toEqual("00 01 02 aa");
});
