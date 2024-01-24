import JSBI from "jsbi";

export function interpretAsSignedType(n) {
  // see https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/wire_format_lite.h#L857-L876
  // however, this is a simpler equivalent formula
  const isEven = JSBI.equal(JSBI.bitwiseAnd(n, JSBI.BigInt(1)), JSBI.BigInt(0));
  if (isEven) {
    return JSBI.divide(n, JSBI.BigInt(2));
  } else {
    return JSBI.multiply(
      JSBI.BigInt(-1),
      JSBI.divide(JSBI.add(n, JSBI.BigInt(1)), JSBI.BigInt(2))
    );
  }
}

export function interpretAsTwosComplement(n, bits) {
  const isTwosComplement = JSBI.equal(
    JSBI.signedRightShift(n, JSBI.BigInt(bits - 1)),
    JSBI.BigInt(1)
  );
  if (isTwosComplement) {
    return JSBI.subtract(n, JSBI.leftShift(JSBI.BigInt(1), JSBI.BigInt(bits)));
  } else {
    return n;
  }
}
