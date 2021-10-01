import React from "react";
import { Table } from "semantic-ui-react";
import { decodeProto, TYPES, typeToString } from "./protobufDecoder";
import { decodeFixed32, decodeFixed64 } from "./protobufPartDecoder";
import { interpretAsSignedType } from "./varintUtils";
import JSBI from "jsbi";
import ProtobufDisplay from "./ProtobufDisplay";

function ProtobufVarintPart(props) {
  const { value } = props;

  const asSigned = function(n) {
    if (n) {
      let asInt = JSBI.BigInt(n);
      return (
        "As signed (zig zag encoded): " +
        interpretAsSignedType(asInt).toString()
      );
    } else {
      return "";
    }
  };

  return (
    <span>
      {value}
      <br />
      {asSigned(value)}
    </span>
  );
}

function ProtobufStringPart(props) {
  const { value } = props;

  // TODO: Support repeated field

  const decoded = decodeProto(value);
  if (value.length > 0 && decoded.leftOver.length === 0) {
    return <ProtobufDisplay value={decoded} />;
  } else {
    return value.toString();
  }
}

function ProtobufFixed64Part(props) {
  const { value } = props;
  const decoded = decodeFixed64(value);

  return decoded.map(d => (
    <span>
      As {d.type}: {d.value}
      <br />
    </span>
  ));
}

function ProtobufFixed32Part(props) {
  const { value } = props;
  const decoded = decodeFixed32(value);

  return decoded.map(d => (
    <span>
      As {d.type}: {d.value}
      <br />
    </span>
  ));
}

function getProtobufPart(part) {
  switch (part.type) {
    case TYPES.VARINT:
      return <ProtobufVarintPart value={part.value} />;
    case TYPES.STRING:
      return <ProtobufStringPart value={part.value} />;
    case TYPES.FIXED64:
      return <ProtobufFixed64Part value={part.value} />;
    case TYPES.FIXED32:
      return <ProtobufFixed32Part value={part.value} />;
    default:
      return "Unknown type";
  }
}

function ProtobufPart(props) {
  const { part } = props;

  const stringType = typeToString(part.type);

  return (
    <Table.Row>
      <Table.Cell>{part.index}</Table.Cell>
      <Table.Cell>{stringType}</Table.Cell>
      <Table.Cell>{getProtobufPart(part)}</Table.Cell>
    </Table.Row>
  );
}

export default ProtobufPart;
