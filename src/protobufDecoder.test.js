import { decodeProto, TYPES, typeToString } from "./protobufDecoder";
import { parseInput } from "./hexUtils";
import { expect } from "vitest";

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


it("convert type to string", () => {
    expect(typeToString(TYPES.VARINT)).toEqual("varint");
    expect(typeToString(TYPES.LENDELIM)).toEqual("len_delim");
    expect(typeToString(TYPES.FIXED32)).toEqual("fixed32");
    expect(typeToString(TYPES.FIXED64)).toEqual("fixed64");
    expect(typeToString(TYPES.MSG_LEN_DELIMITER)).toEqual("Message delimiter");
    expect(typeToString(-2)).toEqual("unknown");
    expect(typeToString(3)).toEqual("unknown");
    expect(typeToString(4)).toEqual("unknown");
    expect(typeToString(6)).toEqual("unknown");
})

it("decode logs error on unknown type", () => {
    const consoleMock = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const result = decodeProto(parseInput("0B"));
    expect(result.parts).toHaveLength(0);
    expect(result.leftOver.toString("hex")).toEqual("0b");
    expect(consoleMock).toHaveBeenCalledWith(new Error("Unknown type: 3"));
    consoleMock.mockRestore();
})


it("decode length delimited - single message", () => {
    const result = decodeProto(parseInput("0408011802"), true);

    expect(result.parts).toHaveLength(3);
    expect(result.leftOver.toString("hex")).toEqual("");

    // length delimiter
    expect(result.parts[0]).toEqual({
        byteRange: [0, 1],
        index: -1,
        type: TYPES.MSG_LEN_DELIMITER,
        value: 4
    });
     // field 1: varint
     expect(result.parts[1]).toEqual({
        byteRange: [1, 3],
        index: 1,
        type: TYPES.VARINT,
        value: "1"
    });   
    // field 2: varint
    expect(result.parts[2]).toEqual({
        byteRange: [3, 5],
        index: 3,
        type: TYPES.VARINT,
        value: "2"
    });  
})

it("decode length delimited - single message with leftover", () => {
    const result = decodeProto(parseInput("0408011802123456"), true);

    expect(result.parts).toHaveLength(4);

    // length delimiter
    expect(result.parts[0]).toEqual({
        byteRange: [0, 1],
        index: -1,
        type: TYPES.MSG_LEN_DELIMITER,
        value: 4
    });
     // field 1: varint
     expect(result.parts[1]).toEqual({
        byteRange: [1, 3],
        index: 1,
        type: TYPES.VARINT,
        value: "1"
    });   
    // field 2: varint
    expect(result.parts[2]).toEqual({
        byteRange: [3, 5],
        index: 3,
        type: TYPES.VARINT,
        value: "2"
    });

    // length delimiter in leftover data 
    // (there is no way to know if this is a delimiter or not except if we assume that the message must be complete)
    expect(result.parts[3]).toEqual({
        byteRange: [5, 6],
        index: -1,
        type: TYPES.MSG_LEN_DELIMITER,
        value: 18
    });

    expect(result.leftOver.toString("hex")).toEqual("123456");
})

it("decode length delimited - multiple message", () => {
    const result = decodeProto(parseInput("04 08 01 18 02 02 28 07"), true);

    expect(result.parts).toHaveLength(5);
    expect(result.leftOver.toString("hex")).toEqual("");

    // length delimiter
    expect(result.parts[0]).toEqual({
        byteRange: [0, 1],
        index: -1,
        type: TYPES.MSG_LEN_DELIMITER,
        value: 4
    });
     // field num 1: varint
     expect(result.parts[1]).toEqual({
        byteRange: [1, 3],
        index: 1,
        type: TYPES.VARINT,
        value: "1"
    });   
    // field 2: varint
    expect(result.parts[2]).toEqual({
        byteRange: [3, 5],
        index: 3,
        type: TYPES.VARINT,
        value: "2"
    }); 

    // length delimiter 2
    expect(result.parts[3]).toEqual({
        byteRange: [5, 6],
        index: -1,
        type: TYPES.MSG_LEN_DELIMITER,
        value: 2
    });
     // field 1: varint
     expect(result.parts[4]).toEqual({
        byteRange: [6, 8],
        index: 5,
        type: TYPES.VARINT,
        value: "7"
    });
})

