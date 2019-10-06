export function parseHex(input) {
  const normalizedInput = input.replace(/\s/g, "").replace(/0x/g, "");
  return Buffer.from(normalizedInput, "hex");
}

export function bufferToPrettyHex(buffer) {
  let output = "";
  for (const v of buffer) {
    if (output !== "") {
      output += " ";
    }

    const hex = v.toString(16);
    if (hex.length === 1) {
      output += "0" + hex;
    } else {
      output += hex;
    }
  }
  return output;
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
