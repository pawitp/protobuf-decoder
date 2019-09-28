import React, { Fragment, useState } from "react";
import { Container, Divider, Form, Header, TextArea } from "semantic-ui-react";
import { parseHex, bufferToPrettyHex } from "./hexUtils";
import "./App.css";
import ProtobufDisplay from "./ProtobufDisplay";
import { decodeProto } from "./protobufDecoder";

function App() {
  const [hex, setHex] = useState("");
  const [hexBuffer, setHexBuffer] = useState("");

  const onHexChanged = e => {
    setHex(e.target.value);
  };

  const onSubmit = () => {
    const buffer = parseHex(hex);

    // Set pretty hex back to UI
    setHex(bufferToPrettyHex(buffer));

    // Set to hexBuffer which will be sent to render
    setHexBuffer(buffer);
  };

  const result = hexBuffer ? (
    <Fragment>
      <Header as="h2">Result</Header>
      <ProtobufDisplay value={decodeProto(hexBuffer)} />
    </Fragment>
  ) : null;

  return (
    <Container>
      <Header as="h1">Protobuf Decoder</Header>
      <p>
        Tool to decode Protobuf without having the original .proto files. All
        decoding is done via locally via JavaScript.
      </p>
      <Form>
        <Form.Group>
          <TextArea
            placeholder="Paste Protobuf or gRPC request as hex"
            onChange={onHexChanged}
            value={hex}
          />
        </Form.Group>
        <Form.Button primary fluid onClick={onSubmit}>
          Decode
        </Form.Button>
      </Form>
      {result}
      <Divider />
      <p>
        Made by pawitp. Contribute on{" "}
        <a href="https://github.com/pawitp/protobuf-decoder">GitHub</a>.
      </p>
    </Container>
  );
}

export default App;
