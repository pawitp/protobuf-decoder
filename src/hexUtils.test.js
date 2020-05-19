import { bufferLeToBeHex, bufferToPrettyHex, parseInput } from "./hexUtils";

it("should parse lowercased hex", () => {
  const result = parseInput("aabbcc");

  expect(result.toString("hex")).toEqual("aabbcc");
});

it("should parse uppercased hex", () => {
  const result = parseInput("AABBCC");

  expect(result.toString("hex")).toEqual("aabbcc");
});

it("should parse hex with space", () => {
  const result = parseInput("aa bb\ncc\tdd");

  expect(result.toString("hex")).toEqual("aabbccdd");
});

it("should parse hex with 0x prefix", () => {
  const result = parseInput("0xaa 0xbb 0xcc 0xdd");

  expect(result.toString("hex")).toEqual("aabbccdd");
});

it("should convert hex to string", () => {
  const result = bufferToPrettyHex(parseInput("000102aa"));

  expect(result).toEqual("00 01 02 aa");
});

it("should convert hex to string with opposite endian", () => {
  const result = bufferLeToBeHex(parseInput("000102aa"));

  expect(result).toEqual("aa020100");
});

it("should parse as base64 if not hex", () => {
  const result = parseInput("qgIBAA==");
  expect(result.toString("hex")).toEqual("aa020100");
});
