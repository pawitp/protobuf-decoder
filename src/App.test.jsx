import { fireEvent, render, screen, getByRole } from '@testing-library/react';
import App from "./App";

describe('App', () => {
    it('renders the App component without crashing', () => {
      render(<App />)
    })

    it('renders ProtobufDisplay component if valid input is provided and decode button is clicked', async() => {
        render(<App />)
        const input = screen.getByTestId('input-hex')
        fireEvent.change(input, { target: { value: '0x0801' } })
        const decodeButton = screen.getByTestId('decode-button')
        fireEvent.click(decodeButton)
        await screen.getByText('Result')
    })

    it('renders ProtobufDisplay with delimited input when decode button is clicked', async() => {
        render(<App />)
        const input = screen.getByTestId('input-hex')
        fireEvent.change(input, { target: { value: '0x020801' } })
        
        const delimitedReactCheckbox = await screen.getByTestId('parse-delimited-checkbox')
        const checkboxInput = getByRole(delimitedReactCheckbox, 'checkbox')
        fireEvent.click(checkboxInput)
        expect(checkboxInput.checked).toBe(true)
        
        const decodeButton = await screen.getByTestId('decode-button')
        fireEvent.click(decodeButton)
        
        await screen.getByText('Result')
    })

    it('labels the second input', () => {
        render(<App />)
        screen.getByText('Second input (B), optional, for Decode & Diff')
    })

    it('disables diff button until both inputs are filled', () => {
        render(<App />)
        const diffButton = screen.getByTestId('diff-button')
        expect(diffButton.disabled).toBe(true)

        fireEvent.change(screen.getByTestId('input-hex'), { target: { value: '0801' } })
        expect(diffButton.disabled).toBe(true)

        fireEvent.change(screen.getByTestId('input-hex-b'), { target: { value: '0802' } })
        expect(diffButton.disabled).toBe(false)
    })

    it('renders diff table when both inputs are given', () => {
        const { container } = render(<App />)
        fireEvent.change(screen.getByTestId('input-hex'), { target: { value: '0801' } })
        fireEvent.change(screen.getByTestId('input-hex-b'), { target: { value: '0802' } })
        fireEvent.click(screen.getByTestId('diff-button'))

        screen.getByText('Diff')
        expect(container.querySelectorAll('tr.warning')).toHaveLength(1)
        expect(screen.getByTestId('input-hex-b').value).toBe('08 02')
    })

    it('renders diff with an invalid second input', () => {
        render(<App />)
        fireEvent.change(screen.getByTestId('input-hex'), { target: { value: '0801' } })
        fireEvent.change(screen.getByTestId('input-hex-b'), { target: { value: 'ffff' } })
        fireEvent.click(screen.getByTestId('diff-button'))

        screen.getByText('Left over bytes (B): ff ff')
    })

    it('shows single result when decoding after a diff', () => {
        render(<App />)
        fireEvent.change(screen.getByTestId('input-hex'), { target: { value: '0801' } })
        fireEvent.change(screen.getByTestId('input-hex-b'), { target: { value: '0802' } })
        fireEvent.click(screen.getByTestId('diff-button'))
        fireEvent.click(screen.getByTestId('decode-button'))

        screen.getByText('Result')
        expect(screen.queryByText('Diff')).toBeNull()
    })
  })
