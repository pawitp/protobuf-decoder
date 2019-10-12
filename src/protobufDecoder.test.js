import { decodeProto, TYPES } from "./protobufDecoder";
import { parseHex } from "./hexUtils";
import JSBI from "jsbi";

it("decode empty protobuf", () => {
  const result = decodeProto(parseHex(""));

  expect(result.parts).toHaveLength(0);
  expect(result.leftOver).toHaveLength(0);
});

it("decode empty gRPC", () => {
  const result = decodeProto(parseHex("00 00000000"));

  expect(result.parts).toHaveLength(0);
  expect(result.leftOver).toHaveLength(0);
});

it("decode int", () => {
  const result = decodeProto(parseHex("089601"));

  expect(result.parts).toHaveLength(1);
  expect(result.parts[0]).toEqual({
    index: 1,
    type: TYPES.VARINT,
    value: "150"
  });
  expect(result.leftOver).toHaveLength(0);
});

it("decode string", () => {
  const result = decodeProto(parseHex("12 07 74 65 73 74 69 6e 67"));

  expect(result.parts).toHaveLength(1);
  expect(result.parts[0]).toEqual({
    index: 2,
    type: TYPES.STRING,
    value: Buffer.from("testing")
  });
  expect(result.leftOver).toHaveLength(0);
});

it("decode int and string", () => {
  const result = decodeProto(parseHex("08 96 01 12 07 74 65 73 74 69 6e 67"));

  expect(result.parts).toHaveLength(2);
  expect(result.parts[0]).toEqual({
    index: 1,
    type: TYPES.VARINT,
    value: "150"
  });
  expect(result.parts[1]).toEqual({
    index: 2,
    type: TYPES.STRING,
    value: Buffer.from("testing")
  });
  expect(result.leftOver).toHaveLength(0);
});

it("decode 64-bit value", () => {
  const result = decodeProto(parseHex("11 AB AA AA AA AA AA 20 40"));

  expect(result.parts).toHaveLength(1);
  expect(result.parts[0]).toEqual({
    index: 2,
    type: TYPES.FIXED64,
    value: parseHex("AB AA AA AA AA AA 20 40")
  });
  expect(result.leftOver).toHaveLength(0);
});

it("decode 32-bit value", () => {
  const result = decodeProto(parseHex("15 AB AA 20 40"));

  expect(result.parts).toHaveLength(1);
  expect(result.parts[0]).toEqual({
    index: 2,
    type: TYPES.FIXED32,
    value: parseHex("AB AA 20 40")
  });
  expect(result.leftOver).toHaveLength(0);
});

it("decode int in gRPC", () => {
  const result = decodeProto(parseHex("00 00000003 089601"));

  expect(result.parts).toHaveLength(1);
  expect(result.parts[0]).toEqual({
    index: 1,
    type: TYPES.VARINT,
    value: "150"
  });
  expect(result.leftOver).toHaveLength(0);
});

it("decode int larger than maximum allowed by JavaScript", () => {
  const result = decodeProto(parseHex("20FFFFFFFFFFFFFFFF7F"));

  expect(result.parts).toHaveLength(1);
  expect(result.parts[0]).toEqual({
    index: 4,
    type: TYPES.VARINT,
    value: "9223372036854775807"
  });
  expect(result.leftOver).toHaveLength(0);
});

it("put undecodable values into leftover", () => {
  const result = decodeProto(parseHex("123456"));

  expect(result.parts).toHaveLength(0);
  expect(result.leftOver.toString("hex")).toEqual("123456");
});
