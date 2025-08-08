import { render, screen } from '@testing-library/react';
import ProtobufDisplay from "./ProtobufDisplay";
import { TYPES } from './protobufDecoder';

describe('ProtobufDisplay', () => {
    it('renders the ProtobufDisplay component without crashing', () => {
        const mockValue = {
            parts: [],
            leftOver: ""
        }
        render(<ProtobufDisplay value={mockValue} />)
    })

    it('renders a non length delimited message', async() => {
        const mockValue = {
            parts: [
                {
                    byteRange: [0, 2],
                    type: TYPES.VARINT,
                    value: 1,
                    index: 1
                }
            ],
            leftOver: ""
        }
        render(<ProtobufDisplay value={mockValue} />)

        const table = await screen.findByRole('table')

        // check that we have 2 rows including the header
        expect(table.rows.length).toBe(2)
        const dataRow = table.rows[1]
        expect(dataRow.cells[0].textContent).toBe('0-2')
        expect(dataRow.cells[1].textContent).toBe('1')
        expect(dataRow.cells[2].textContent).toBe('varint')
    })

    it('renders a single length delimited message', async() => {
        const mockValue = {
            parts: [
                {
                    byteRange: [0,1],
                    type: TYPES.MSG_LEN_DELIMITER,
                    value: 2,
                    index: -1
                },
                {
                    byteRange: [1, 3],
                    type: TYPES.VARINT,
                    value: 1,
                    index: 1
                }
            ],
            leftOver: ""
        }
        render(<ProtobufDisplay value={mockValue} />)

        const table = await screen.findByRole('table')

        // check that we have 2 rows including the header
        expect(table.rows.length).toBe(3)
        const dataRow1 = table.rows[1]
        expect(dataRow1.cells[0].textContent).toBe('0-1')
        expect(dataRow1.cells[1].textContent).toBe('-1')
        expect(dataRow1.cells[2].textContent).toBe('Message delimiter')
        expect(dataRow1.cells[3].textContent).toBe('Message length: 2 bytes')

        const dataRow2 = table.rows[2]
        expect(dataRow2.cells[0].textContent).toBe('1-3')
        expect(dataRow2.cells[1].textContent).toBe('1')
        expect(dataRow2.cells[2].textContent).toBe('varint')
    })

    it('renders a multiple length delimited messages', async() => {
        const mockValue = {
            parts: [
                {
                    byteRange: [0,1],
                    type: TYPES.MSG_LEN_DELIMITER,
                    value: 2,
                    index: -1
                },
                {
                    byteRange: [1, 3],
                    type: TYPES.VARINT,
                    value: 1,
                    index: 1
                },
                {
                    byteRange: [3, 4],
                    type: TYPES.MSG_LEN_DELIMITER,
                    value: 2,
                    index: -1
                },
                {
                    byteRange: [4, 6],
                    type: TYPES.VARINT,
                    value: 3,
                    index: 5
                }
            ],
            leftOver: ""
        }
        render(<ProtobufDisplay value={mockValue} />)

        const tables = await screen.findAllByRole('table')

        expect(tables.length).toBe(2)
 
        // message 1
        const table1 = tables[0]
        expect(table1.rows.length).toBe(3)

        expect(table1.rows[0].cells[0].textContent).toBe('Byte Range')
        expect(table1.rows[0].cells[1].textContent).toBe('Field Number')
        expect(table1.rows[0].cells[2].textContent).toBe('Type')
        expect(table1.rows[0].cells[3].textContent).toBe('Content')

        expect(table1.rows[1].cells[0].textContent).toBe('0-1')
        expect(table1.rows[1].cells[1].textContent).toBe('-1')
        expect(table1.rows[1].cells[2].textContent).toBe('Message delimiter')
        expect(table1.rows[1].cells[3].textContent).toBe('Message length: 2 bytes')

        expect(table1.rows[2].cells[0].textContent).toBe('1-3')
        expect(table1.rows[2].cells[1].textContent).toBe('1')
        expect(table1.rows[2].cells[2].textContent).toBe('varint')

        // message 2
        const table2 = tables[1]
        expect(table2.rows.length).toBe(3)

        expect(table2.rows[0].cells[0].textContent).toBe('Byte Range')
        expect(table2.rows[0].cells[1].textContent).toBe('Field Number')
        expect(table2.rows[0].cells[2].textContent).toBe('Type')
        expect(table2.rows[0].cells[3].textContent).toBe('Content')
        
        expect(table2.rows[1].cells[0].textContent).toBe('3-4')
        expect(table2.rows[1].cells[1].textContent).toBe('-1')
        expect(table2.rows[1].cells[2].textContent).toBe('Message delimiter')
        expect(table2.rows[1].cells[3].textContent).toBe('Message length: 2 bytes')

        expect(table2.rows[2].cells[0].textContent).toBe('4-6')
        expect(table2.rows[2].cells[1].textContent).toBe('5')
        expect(table2.rows[2].cells[2].textContent).toBe('varint')

    })
    
  })
