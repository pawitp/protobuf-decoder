import {
  decodeFixed32,
  decodeFixed64,
  decodeVarintParts,
  decodeStringOrBytes
} from "./protobufPartDecoder";
import { parseInput } from "./hexUtils";

describe("decodeFixed32", () => {
  it("decode float correctly", () => {
    const result = decodeFixed32(parseInput("A4709D3F"));
    const floatResult = result.find(r => r.type === "float");
    expect(floatResult.value).toEqual(1.2300000190734863);
  });

  it("decode int32 correctly", () => {
    const result = decodeFixed32(parseInput("00943577"));
    const intResult = result.find(r => r.type === "int");
    const uintResult = result.find(r => r.type === "uint");
    expect(intResult.value).toEqual(2000000000);

    // Should not return Unsigned Int result when Int is not negative
    expect(uintResult).toBeUndefined();
  });

  it("decode uint32 correctly", () => {
    const result = decodeFixed32(parseInput("006CCA88"));
    const intResult = result.find(r => r.type === "int");
    const uintResult = result.find(r => r.type === "uint");
    expect(intResult.value).toEqual(-2000000000);
    expect(uintResult.value).toEqual(2294967296);
  });
});

describe("decodeFixed64", () => {
  it("decode double correctly", () => {
    const result = decodeFixed64(parseInput("AE47E17A14AEF33F"));
    const floatResult = result.find(r => r.type === "double");
    expect(floatResult.value).toEqual(1.23);
  });

  it("decode int64 correctly", () => {
    const result = decodeFixed64(parseInput("000084E2506CE67C"));
    const intResult = result.find(r => r.type === "int");
    const uintResult = result.find(r => r.type === "uint");
    expect(intResult.value).toEqual("9000000000000000000");

    // Should not return Unsigned Int result when Int is not negative
    expect(uintResult).toBeUndefined();
  });

  it("decode uint64 correctly", () => {
    const result = decodeFixed64(parseInput("00007C1DAF931983"));
    const intResult = result.find(r => r.type === "int");
    const uintResult = result.find(r => r.type === "uint");
    expect(intResult.value).toEqual("-9000000000000000000");
    expect(uintResult.value).toEqual("9446744073709551616");
  });
});

describe("decodeVarintParts", () => {
  it("decode varint parts with sint correctly", () => {
    const result = decodeVarintParts("1642911");
    const intResult = result.find(r => r.type === "uint");
    expect(intResult.value).toEqual("1642911");
    const signedIntResult = result.find(r => r.type === "sint");
    expect(signedIntResult.value).toEqual("-821456");
  });

  it("decode varint parts with int correctly", () => {
    const result = decodeVarintParts("255");
    const intResult = result.find(r => r.type === "uint");
    expect(intResult.value).toEqual("255");
    const signedIntResult = result.find(r => r.type === "int8");
    expect(signedIntResult.value).toEqual("-1");
  });
});

describe("decodeStringOrBytes", () => {
  const TextDecoder = require("util").TextDecoder;
  const emulateBrowser = () => void (global.TextDecoder = TextDecoder);

  it("decode string correctly", () => {
    emulateBrowser();
    const text = "normal ascii input";
    const input = Uint8Array.from(text.split("").map(c => c.charCodeAt(0)));
    const result = decodeStringOrBytes(input);
    expect(result.value).toEqual(text);
    expect(result.type).toEqual("string");
  });

  it("decode bytes correctly", () => {
    emulateBrowser();
    const bytes = new Uint8Array([0, 128, 255]);
    const result = decodeStringOrBytes(bytes);
    expect(result.value).toEqual("00 80 ff");
    expect(result.type).toEqual("bytes");
  });

  it("decode empty string|bytes correctly", () => {
    emulateBrowser();
    const empty = new Uint8Array([]);
    const result = decodeStringOrBytes(empty);
    expect(result.value).toEqual("");
    expect(result.type).toEqual("string|bytes");
  });
});
