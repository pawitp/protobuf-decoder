import React, { Fragment, useState } from "react";
import {
  Checkbox,
  Container,
  Divider,
  Form,
  Header,
  TextArea, 
  Input,
} from "semantic-ui-react";
import { parseInput, bufferToPrettyHex } from "./hexUtils";
import "./App.css";
import ProtobufDisplay from "./ProtobufDisplay";
import ProtobufDiffDisplay from "./ProtobufDiffDisplay";
import { decodeProto } from "./protobufDecoder";
import { diffProtos } from "./protobufDiff";

function App() {
  const [hex, setHex] = useState("");
  const [parseDelimited, setParseDelimited] = useState(false);
  const [hexBuffer, setHexBuffer] = useState("");
  const [hexB, setHexB] = useState("");
  const [diffBuffers, setDiffBuffers] = useState(null);

  const onHexChanged = e => {
    setHex(e.target.value);
  };

  const onSubmit = () => {
    const buffer = parseInput(hex);

    // Set pretty hex back to UI
    setHex(bufferToPrettyHex(buffer));

    // Set to hexBuffer which will be sent to render
    setHexBuffer(buffer);
    setDiffBuffers(null);
  };

  const onDiff = () => {
    const buffer = parseInput(hex);
    const bufferB = parseInput(hexB);

    setHex(bufferToPrettyHex(buffer));
    setHexB(bufferToPrettyHex(bufferB));

    setDiffBuffers([buffer, bufferB]);
    setHexBuffer("");
  };

  const fileChange = setter => async e => {
    const file = (e.target.files || [])[0];
    if (file) {
      const b = new Uint8Array(await file.arrayBuffer());
      setter(bufferToPrettyHex(b));
    }
  };

  const result = diffBuffers ? (
    <Fragment>
      <Header as="h2">Diff</Header>
      <ProtobufDiffDisplay value={diffProtos(diffBuffers, parseDelimited)} />
    </Fragment>
  ) : hexBuffer ? (
    <Fragment>
      <Header as="h2">Result</Header>
      <ProtobufDisplay value={decodeProto(hexBuffer, parseDelimited)} />
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
            data-testid="input-hex"
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
            onChange={fileChange(setHex)}
            type='file'
          />
        </Form.Group>
        <label>Second input (B), optional, for Decode &amp; Diff</label>
        <Form.Group>
          <TextArea
            placeholder="Paste a second Protobuf to compare with the first one"
            onChange={e => setHexB(e.target.value)}
            value={hexB}
            data-testid="input-hex-b"
          />
          <Input
            action={{
              icon: 'upload',
              className: 'file-button-provider-icon',
              onClick: () => document.querySelector('#file-input-button-b').click()
            }}
            input={{
              id: 'file-input-button-b',
              hidden: true
            }}
            onChange={fileChange(setHexB)}
            type='file'
          />
        </Form.Group>
        <Form.Group>
          <Checkbox
            label="parse varint length delimited input"
            data-testid="parse-delimited-checkbox"
            onChange={(evt, data) => {
              setParseDelimited(data.checked);
            }}
            checked={parseDelimited}
          />
        </Form.Group>
        <Form.Button primary fluid onClick={onSubmit} data-testid="decode-button">
          Decode
        </Form.Button>
        <Form.Button
          fluid
          onClick={onDiff}
          disabled={!hex.trim() || !hexB.trim()}
          data-testid="diff-button"
        >
          Decode &amp; Diff
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
