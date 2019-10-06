import { decodeFixed32, decodeFixed64 } from "./protobufPartDecoder";
import { parseHex } from "./hexUtils";

describe("decodeFixed32", () => {
  it("decode float correctly", () => {
    const result = decodeFixed32(parseHex("A4709D3F"));
    const floatResult = result.find(r => r.type === "Float");
    expect(floatResult.value).toEqual(1.2300000190734863);
  });

  it("decode int32 correctly", () => {
    const result = decodeFixed32(parseHex("00943577"));
    const intResult = result.find(r => r.type === "Int");
    const uintResult = result.find(r => r.type === "Unsigned Int");
    expect(intResult.value).toEqual(2000000000);

    // Should not return Unsigned Int result when Int is not negative
    expect(uintResult).toBeUndefined();
  });

  it("decode uint32 correctly", () => {
    const result = decodeFixed32(parseHex("006CCA88"));
    const intResult = result.find(r => r.type === "Int");
    const uintResult = result.find(r => r.type === "Unsigned Int");
    expect(intResult.value).toEqual(-2000000000);
    expect(uintResult.value).toEqual(2294967296);
  });
});

describe("decodeFixed64", () => {
  it("decode double correctly", () => {
    const result = decodeFixed64(parseHex("AE47E17A14AEF33F"));
    const floatResult = result.find(r => r.type === "Double");
    expect(floatResult.value).toEqual(1.23);
  });

  it("decode int64 correctly", () => {
    const result = decodeFixed64(parseHex("000084E2506CE67C"));
    const intResult = result.find(r => r.type === "Int");
    const uintResult = result.find(r => r.type === "Unsigned Int");
    expect(intResult.value).toEqual("9000000000000000000");

    // Should not return Unsigned Int result when Int is not negative
    expect(uintResult).toBeUndefined();
  });

  it("decode uint64 correctly", () => {
    const result = decodeFixed64(parseHex("00007C1DAF931983"));
    const intResult = result.find(r => r.type === "Int");
    const uintResult = result.find(r => r.type === "Unsigned Int");
    expect(intResult.value).toEqual("-9000000000000000000");
    expect(uintResult.value).toEqual("9446744073709551616");
  });
});
