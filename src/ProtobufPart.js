import React, { Fragment } from "react";
import { Table } from "semantic-ui-react";
import { decodeProto, TYPES, typeToString } from "./protobufDecoder";
import ProtobufDisplay from "./ProtobufDisplay";

function ProtobufVarintPart(props) {
  const { value } = props;

  return value;
}

function ProtobufStringPart(props) {
  const { value } = props;

  // TODO: Support repeated field

  const decoded = decodeProto(value);
  if (decoded.leftOver.length === 0) {
    return <ProtobufDisplay value={decoded} />;
  } else {
    return value.toString();
  }
}

function ProtobufFixed64Part(props) {
  const { value } = props;
  const floatValue = value.readDoubleLE(0);

  // TODO: Support Int64/UInt64
  return floatValue;
}

function ProtobufFixed32Part(props) {
  const { value } = props;
  const floatValue = value.readFloatLE(0);
  const intValue = value.readInt32BE(0);
  const uintValue = value.readUInt32BE(0);

  if (intValue === uintValue) {
    return (
      <Fragment>
        As Int: {intValue}
        <br />
        As Float: {floatValue}
        <br />
      </Fragment>
    );
  } else {
    return (
      <Fragment>
        As Int: {intValue}
        <br />
        As Unisgned Int: {uintValue}
        <br />
        As Float: {floatValue}
        <br />
      </Fragment>
    );
  }
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
