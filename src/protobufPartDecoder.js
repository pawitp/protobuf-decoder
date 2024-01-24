import JSBI from "jsbi";
import { bufferLeToBeHex, bufferToPrettyHex } from "./hexUtils";
import { interpretAsSignedType, interpretAsTwosComplement } from "./intUtils";

export function decodeFixed32(value) {
  const floatValue = value.readFloatLE(0);
  const intValue = value.readInt32LE(0);
  const uintValue = value.readUInt32LE(0);

  const result = [];

  result.push({ type: "int", value: intValue });

  if (intValue !== uintValue) {
    result.push({ type: "uint", value: uintValue });
  }

  result.push({ type: "float", value: floatValue });

  return result;
}

export function decodeFixed64(value) {
  const floatValue = value.readDoubleLE(0);
  const uintValue = JSBI.BigInt("0x" + bufferLeToBeHex(value));
  const intValue = interpretAsTwosComplement(uintValue, 64);

  const result = [];

  result.push({ type: "int", value: intValue.toString() });

  if (intValue !== uintValue) {
    result.push({ type: "uint", value: uintValue.toString() });
  }

  result.push({ type: "double", value: floatValue });

  return result;
}

export function decodeVarintParts(value) {
  const result = [];
  const uintVal = JSBI.BigInt(value);
  result.push({ type: "uint", value: uintVal.toString() });

  for (const bits of [8, 16, 32, 64]) {
    const intVal = interpretAsTwosComplement(uintVal, bits);
    if (intVal !== uintVal) {
      result.push({ type: "int" + bits, value: intVal.toString() });
    }
  }

  const signedIntVal = interpretAsSignedType(uintVal);
  if (signedIntVal !== uintVal) {
    result.push({ type: "sint", value: signedIntVal.toString() });
  }

  return result;
}

export function decodeStringOrBytes(value) {
  if (!value.length) {
    return { type: "string|bytes", value: "" };
  }
  const td = new TextDecoder("utf-8", { fatal: true });
  try {
    return { type: "string", value: td.decode(value) };
  } catch (e) {
    return { type: "bytes", value: bufferToPrettyHex(value) };
  }
}
