import { decodeProto, TYPES } from "./protobufDecoder";
import { decodeLenDelim } from "./protobufPartDecoder";

function allEqual(values) {
  return values.every(value => value === values[0]);
}

function toCell(part) {
  const decoded =
    part.type === TYPES.LENDELIM ? decodeLenDelim(part.value) : null;
  return { part, decoded };
}

function cellKey(cell) {
  const { part, decoded } = cell;
  const value =
    part.type === TYPES.VARINT ? part.value : part.value.toString("hex");
  return [part.type, decoded ? decoded.type : "", value].join(":");
}

function childrenStatus(children) {
  return children.every(row => row.status === "same") ? "same" : "changed";
}

function fieldRow(cells) {
  const index = cells.find(Boolean).part.index;

  if (cells.some(cell => !cell)) {
    return { index, status: "missing", cells, children: null };
  }

  if (cells.every(cell => cell.decoded && cell.decoded.type === "protobuf")) {
    const children = alignParts(cells.map(cell => cell.decoded.value.parts));
    return { index, status: childrenStatus(children), cells, children };
  }

  const status = allEqual(cells.map(cellKey)) ? "same" : "changed";
  return { index, status, cells, children: null };
}

export function alignParts(partLists) {
  const keys = new Set();
  const partsByKey = partLists.map(parts => {
    const counts = {};
    const map = new Map();
    for (const part of parts) {
      const occurrence = counts[part.index] || 0;
      counts[part.index] = occurrence + 1;
      const key = part.index + ":" + occurrence;
      map.set(key, part);
      keys.add(key);
    }
    return map;
  });

  return [...keys].map(key =>
    fieldRow(
      partsByKey.map(map => (map.has(key) ? toCell(map.get(key)) : null))
    )
  );
}

function splitMessages(parts) {
  const messages = [];
  for (const part of parts) {
    if (part.type === TYPES.MSG_LEN_DELIMITER || messages.length === 0) {
      messages.push([]);
    }
    messages[messages.length - 1].push(part);
  }
  return messages;
}

function alignMessages(partLists) {
  const messageLists = partLists.map(splitMessages);
  const count = Math.max(...messageLists.map(messages => messages.length));
  const rows = [];

  for (let i = 0; i < count; i++) {
    const messages = messageLists.map(messageList => messageList[i]);
    const cells = messages.map(message =>
      message ? toCell(message[0]) : null
    );
    const children = alignParts(
      messages.map(message => (message ? message.slice(1) : []))
    );

    let status = "missing";
    if (cells.every(Boolean)) {
      const sameLength = allEqual(cells.map(cell => cell.part.value));
      status = sameLength ? childrenStatus(children) : "changed";
    }
    rows.push({ index: -1, status, cells, children });
  }

  return rows;
}

export function diffProtos(buffers, parseDelimited) {
  const decoded = buffers.map(buffer => decodeProto(buffer, parseDelimited));
  const partLists = decoded.map(result => result.parts);
  const leftOvers = decoded.map(result => result.leftOver);
  const hasDelimiters = partLists.some(parts =>
    parts.some(part => part.type === TYPES.MSG_LEN_DELIMITER)
  );

  return {
    rows: hasDelimiters ? alignMessages(partLists) : alignParts(partLists),
    leftOvers,
    leftOverChanged: !leftOvers.every(leftOver => leftOver.equals(leftOvers[0]))
  };
}
