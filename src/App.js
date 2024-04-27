import React, { Fragment, useState } from "react";
import { Container, Divider, Form, Header, TextArea, Input } from "semantic-ui-react";
import { parseInput, bufferToPrettyHex } from "./hexUtils";
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
    const buffer = parseInput(hex);

    // Set pretty hex back to UI
    setHex(bufferToPrettyHex(buffer));

    // Set to hexBuffer which will be sent to render
    setHexBuffer(buffer);
  };

  const fileChange = async e => {
    const file = (e.target.files || [])[0];
    if (file) {
      const b = new Uint8Array(await file.arrayBuffer());
      setHex(bufferToPrettyHex(b));
    }
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
        decoding is done locally via JavaScript.
      </p>
      <Form>
        <Form.Group>
          <TextArea
            placeholder="Paste Protobuf or gRPC request as hex or base64"
            onChange={onHexChanged}
            value={hex}
          />
          <Input
            action={{
              icon: 'upload',
              className: 'file-button-provider-icon',
              onClick: () => document.querySelector('#file-input-button').click()
            }}
            input={{
              id: 'file-input-button',
              hidden: true
            }}
            onChange={fileChange}
            type='file'
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
