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
  })
