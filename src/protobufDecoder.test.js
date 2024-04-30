import { decodeProto, TYPES } from "./protobufDecoder";
import { parseInput } from "./hexUtils";

const te = new TextEncoder();

it("decode empty protobuf", () => {
  const result = decodeProto(parseInput(""));

  expect(result.parts).toHaveLength(0);
  expect(result.leftOver).toHaveLength(0);
});

it("decode empty gRPC", () => {
  const result = decodeProto(parseInput("00 00000000"));

  expect(result.parts).toHaveLength(0);
  expect(result.leftOver).toHaveLength(0);
});

it("decode int", () => {
  const result = decodeProto(parseInput("089601"));

  expect(result.parts).toHaveLength(1);
  expect(result.parts[0]).toEqual({
    byteRange: [0, 3],
    index: 1,
    type: TYPES.VARINT,
    value: "150"
  });
  expect(result.leftOver).toHaveLength(0);
});

it("decode string", () => {
  const result = decodeProto(parseInput("12 07 74 65 73 74 69 6e 67"));

  expect(result.parts[0].byteRange).toEqual([0, 9]);
  expect(result.parts[0].index).toEqual(2);
  expect(result.parts[0].type).toEqual(TYPES.LENDELIM);
  expect([...result.parts[0].value]).toEqual([...te.encode("testing")]);
  expect(result.leftOver).toHaveLength(0);
});

it("decode int and string", () => {
  const result = decodeProto(parseInput("08 96 01 12 07 74 65 73 74 69 6e 67"));

  expect(result.parts).toHaveLength(2);
  expect(result.parts[0]).toEqual({
    byteRange: [0, 3],
    index: 1,
    type: TYPES.VARINT,
    value: "150"
  });

  expect(result.parts[1].byteRange).toEqual([3, 12]);
  expect(result.parts[1].index).toEqual(2);
  expect(result.parts[1].type).toEqual(TYPES.LENDELIM);
  expect([...result.parts[1].value]).toEqual([...te.encode("testing")]);


  expect(result.leftOver).toHaveLength(0);
});

it("decode 64-bit value", () => {
  const result = decodeProto(parseInput("11 AB AA AA AA AA AA 20 40"));

  expect(result.parts).toHaveLength(1);
  expect(result.parts[0]).toEqual({
    byteRange: [0, 9],
    index: 2,
    type: TYPES.FIXED64,
    value: parseInput("AB AA AA AA AA AA 20 40")
  });
  expect(result.leftOver).toHaveLength(0);
});

it("decode 32-bit value", () => {
  const result = decodeProto(parseInput("15 AB AA 20 40"));

  expect(result.parts).toHaveLength(1);
  expect(result.parts[0]).toEqual({
    byteRange: [0, 5],
    index: 2,
    type: TYPES.FIXED32,
    value: parseInput("AB AA 20 40")
  });
  expect(result.leftOver).toHaveLength(0);
});

it("decode int in gRPC", () => {
  const result = decodeProto(parseInput("00 00000003 089601"));

  expect(result.parts).toHaveLength(1);
  expect(result.parts[0]).toEqual({
    byteRange: [5, 8],
    index: 1,
    type: TYPES.VARINT,
    value: "150"
  });
  expect(result.leftOver).toHaveLength(0);
});

it("decode int larger than maximum allowed by JavaScript", () => {
  const result = decodeProto(parseInput("20FFFFFFFFFFFFFFFF7F"));

  expect(result.parts).toHaveLength(1);
  expect(result.parts[0]).toEqual({
    byteRange: [0, 10],
    index: 4,
    type: TYPES.VARINT,
    value: "9223372036854775807"
  });
  expect(result.leftOver).toHaveLength(0);
});

it("put undecodable values into leftover", () => {
  const result = decodeProto(parseInput("123456"));

  expect(result.parts).toHaveLength(0);
  expect(result.leftOver.toString("hex")).toEqual("123456");
});
