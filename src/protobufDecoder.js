import { decodeVarint } from "./varintUtils";

class BufferReader {
  constructor(buffer) {
    this.buffer = buffer;
    this.offset = 0;
  }

  readVarInt() {
    const result = decodeVarint(this.buffer, this.offset);
    this.offset += result.length;

    return result.value;
  }

  readBuffer(length) {
    this.checkByte(length);
    const result = this.buffer.slice(this.offset, this.offset + length);
    this.offset += length;

    return result;
  }

  // gRPC has some additional header - remove it
  trySkipGrpcHeader() {
    const backupOffset = this.offset;

    if (this.buffer[this.offset] === 0 && this.leftBytes() >= 5) {
      this.offset++;
      const length = this.buffer.readInt32BE(this.offset);
      this.offset += 4;

      if (length > this.leftBytes()) {
        // Something is wrong, revert
        this.offset = backupOffset;
      }
    }
  }

  leftBytes() {
    return this.buffer.length - this.offset;
  }

  checkByte(length) {
    const bytesAvailable = this.leftBytes();
    if (length > bytesAvailable) {
      throw new Error(
        "Not enough bytes left. Requested: " +
          length +
          " left: " +
          bytesAvailable
      );
    }
  }

  checkpoint() {
    this.savedOffset = this.offset;
  }

  resetToCheckpoint() {
    this.offset = this.savedOffset;
  }
}

export const TYPES = {
  MSG_LEN_DELIMITER: -1,
  VARINT: 0,
  FIXED64: 1,
  LENDELIM: 2,
  FIXED32: 5
};

export function decodeProto(buffer, parseDelimited) {
  const reader = new BufferReader(buffer);
  const parts = [];

  reader.trySkipGrpcHeader();

  var protoBufMsgLength = 0;
  var protoBufMsgEnd = 0;

  try {
    while (reader.leftBytes() > 0) {
      reader.checkpoint();

      if (parseDelimited && protoBufMsgEnd === reader.offset) {
        console.log("found delimiter at " + reader.offset);
        const byteRange = [reader.offset];
        protoBufMsgLength = parseInt(reader.readVarInt().toString());
        protoBufMsgEnd = reader.offset + protoBufMsgLength;
        byteRange.push(reader.offset);
        parts.push({
          byteRange,
          index: -1,
          type: TYPES.MSG_LEN_DELIMITER,
          value: protoBufMsgLength
        });
      }

      const byteRange = [reader.offset];
      const indexType = parseInt(reader.readVarInt().toString());
      const type = indexType & 0b111;
      const index = indexType >> 3;

      let value;
      if (type === TYPES.VARINT) {
        value = reader.readVarInt().toString();
      } else if (type === TYPES.LENDELIM) {
        const length = parseInt(reader.readVarInt().toString());
        value = reader.readBuffer(length);
      } else if (type === TYPES.FIXED32) {
        value = reader.readBuffer(4);
      } else if (type === TYPES.FIXED64) {
        value = reader.readBuffer(8);
      } else {
        throw new Error("Unknown type: " + type);
      }
      byteRange.push(reader.offset);

      parts.push({
        byteRange,
        index,
        type,
        value
      });
    }
  } catch (err) {
    console.log(err);
    reader.resetToCheckpoint();
  }

  return {
    parts,
    leftOver: reader.readBuffer(reader.leftBytes())
  };
}

export function typeToString(type, subType) {
  switch (type) {
    case TYPES.VARINT:
      return "varint";
    case TYPES.LENDELIM:
      return subType || "len_delim";
    case TYPES.FIXED32:
      return "fixed32";
    case TYPES.FIXED64:
      return "fixed64";
    case TYPES.MSG_LEN_DELIMITER:
      return "Message delimiter";
    default:
      return "unknown";
  }
}
