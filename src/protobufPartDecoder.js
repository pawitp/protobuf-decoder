export function decodeFixed32(value) {
  const floatValue = value.readFloatLE(0);
  const intValue = value.readInt32LE(0);
  const uintValue = value.readUInt32LE(0);

  const result = [];

  result.push({ type: "Int", value: intValue });

  if (intValue !== uintValue) {
    result.push({ type: "Unsigned Int", value: uintValue });
  }

  result.push({ type: "Float", value: floatValue });

  return result;
}
