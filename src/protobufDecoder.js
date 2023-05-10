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
  VARINT: 0,
  FIXED64: 1,
  LENDELIM: 2,
  FIXED32: 5
};

export function decodeProto(buffer) {
  const reader = new BufferReader(buffer);
  const parts = [];

  reader.trySkipGrpcHeader();

  try {
    while (reader.leftBytes() > 0) {
      reader.checkpoint();

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
    default:
      return "unknown";
  }
}
