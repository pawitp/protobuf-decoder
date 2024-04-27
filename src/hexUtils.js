import { Buffer } from 'buffer'

export function parseInput(input) {
  const normalizedInput = input.replace(/\s/g, "");
  const normalizedHexInput = normalizedInput.replace(/0x/g, "").toLowerCase();
  if (isHex(normalizedHexInput)) {
    return Buffer.from(normalizedHexInput, "hex");
  } else {
    return Buffer.from(normalizedInput, "base64");
  }
}

export function isHex(string) {
  let result = true;
  for (const char of string) {
    if (!((char >= "a" && char <= "f") || (char >= "0" && char <= "9"))) {
      result = false;
    }
  }
  return result;
}

export function bufferLeToBeHex(buffer) {
  let output = "";
  for (const v of buffer) {
    const hex = v.toString(16);
    if (hex.length === 1) {
      output = "0" + hex + output;
    } else {
      output = hex + output;
    }
  }
  return output;
}

export const bufferToPrettyHex = b => [...b].map(c => c.toString(16).padStart(2, '0')).join(' ');
