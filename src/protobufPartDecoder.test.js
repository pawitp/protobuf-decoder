import { decodeFixed32 } from "./protobufPartDecoder";
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
