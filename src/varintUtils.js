import JSBI from "jsbi";

const BIGINT_1 = JSBI.BigInt(1);
const BIGINT_2 = JSBI.BigInt(2);

export function interpretAsSignedType(n) {
  // see https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/wire_format_lite.h#L857-L876
  // TODO: does this handle sint64 as well?
  return JSBI.bitwiseXor(
    JSBI.signedRightShift(n, BIGINT_1),
    JSBI.add(JSBI.bitwiseNot(JSBI.bitwiseAnd(n, BIGINT_1)), BIGINT_1)
  );
}

export function decodeVarint(buffer, offset) {
  let res = JSBI.BigInt(0);
  let shift = 0;
  let byte = 0;
  //let sint32Res = JSBI.BigInt(0);

  do {
    if (offset >= buffer.length) {
      throw new RangeError("Index out of bound decoding varint");
    }

    byte = buffer[offset++];

    const multiplier = JSBI.exponentiate(BIGINT_2, JSBI.BigInt(shift));
    const thisByteValue = JSBI.multiply(JSBI.BigInt(byte & 0x7f), multiplier);
    shift += 7;
    res = JSBI.add(res, thisByteValue);
  } while (byte >= 0x80);

  return {
    value: res,
    signedIntValue: interpretAsSignedType(res),
    length: shift / 7
  };
}
