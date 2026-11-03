import { diffProtos } from "./protobufDiff";
import { parseInput } from "./hexUtils";

const exampleHex =
  "0a 2f 0a 08 4a 6f 68 6e 20 44 6f 65 10 01 1a 10 6a 6f 68 6e 40 65 78 61 6d 70 6c 65 2e 63 6f 6d 22 0f 0a 0b 31 31 31 2d 32 32 32 2d 33 33 33 10 01 0a 1e 0a 08 4a 61 6e 65 20 44 6f 65 10 02 1a 10 6a 61 6e 65 40 65 78 61 6d 70 6c 65 2e 63 6f 6d";
const a = parseInput(exampleHex);
// Same as a, but the id of the first person changed from 1 to 7
const b = parseInput(exampleHex.replace("10 01", "10 07"));

function allRows(rows) {
  return rows.flatMap(row => [row, ...allRows(row.children || [])]);
}

describe("diffProtos", () => {
  it("identical inputs are all same", () => {
    const result = diffProtos([a, a], false);

    expect(result.rows).toHaveLength(2);
    for (const row of allRows(result.rows)) {
      expect(row.status).toEqual("same");
    }
    expect(result.leftOverChanged).toBe(false);
  });

  it("marks changed varint and its ancestors", () => {
    const result = diffProtos([a, b], false);
    const person = result.rows[0];
    const name = person.children.find(row => row.index === 1);
    const id = person.children.find(row => row.index === 2);

    expect(person.status).toEqual("changed");
    expect(name.status).toEqual("same");
    expect(id.status).toEqual("changed");
    expect(id.cells.map(cell => cell.part.value)).toEqual(["1", "7"]);
    expect(result.rows[1].status).toEqual("same");
  });

  it("repeated field count differs", () => {
    const result = diffProtos(
      [parseInput("080108020803"), parseInput("08010802")],
      false
    );

    expect(result.rows).toHaveLength(3);
    expect(result.rows[0].status).toEqual("same");
    expect(result.rows[2].status).toEqual("missing");
    expect(result.rows[2].cells[1]).toBeNull();
  });

  it("field only in second input is appended", () => {
    const result = diffProtos(
      [parseInput("0801"), parseInput("08011002")],
      false
    );

    expect(result.rows).toHaveLength(2);
    expect(result.rows[1].index).toEqual(2);
    expect(result.rows[1].status).toEqual("missing");
    expect(result.rows[1].cells[0]).toBeNull();
  });

  it("type mismatch is changed without children", () => {
    const result = diffProtos(
      [parseInput("0a020801"), parseInput("0a02ffff")],
      false
    );

    expect(result.rows[0].status).toEqual("changed");
    expect(result.rows[0].children).toBeNull();
    expect(result.rows[0].cells.map(cell => cell.decoded.type)).toEqual([
      "protobuf",
      "bytes"
    ]);
  });

  it("garbage input", () => {
    const result = diffProtos([a, parseInput("ffff")], false);

    expect(result.rows).toHaveLength(2);
    for (const row of result.rows) {
      expect(row.status).toEqual("missing");
      expect(row.cells[1]).toBeNull();
    }
    expect(result.leftOvers[1]).toHaveLength(2);
    expect(result.leftOverChanged).toBe(true);
  });

  it("delimited with different message counts", () => {
    const result = diffProtos(
      [parseInput("020801020802"), parseInput("020801")],
      true
    );

    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].index).toEqual(-1);
    expect(result.rows[0].status).toEqual("same");
    expect(result.rows[0].children).toHaveLength(1);
    expect(result.rows[1].status).toEqual("missing");
    expect(result.rows[1].cells[1]).toBeNull();
  });

  it("delimited gRPC input without delimiters is diffed by field", () => {
    const grpc = parseInput("0000000004 0a020801");
    const result = diffProtos([grpc, grpc], true);

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].index).toEqual(1);
    expect(result.rows[0].status).toEqual("same");
  });
});
