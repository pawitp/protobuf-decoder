import React, { Fragment } from "react";
import ProtobufPart from "./ProtobufPart";
import { Table } from "semantic-ui-react";
import { bufferToPrettyHex } from "./hexUtils";
import { v4 } from "uuid";

function ProtobufDisplay(props) {
  const { value } = props;

  const parts = value.parts.map(part => {
    return <ProtobufPart key={v4()} part={part} />;
  });

  const leftOver = value.leftOver.length ? (
    <p>Left over bytes: {bufferToPrettyHex(value.leftOver)}</p>
  ) : null;

  return (
    <Fragment>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Field Number</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>Content</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{parts}</Table.Body>
      </Table>
      {leftOver}
    </Fragment>
  );
}

export default ProtobufDisplay;
