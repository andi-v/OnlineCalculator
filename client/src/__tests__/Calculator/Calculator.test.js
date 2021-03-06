import React from 'react'
import configureStore from 'redux-mock-store'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
import Calculator from '../../containers/Calculator'
import { changeCalculationType, setResult, deleteHistorySuccess } from '../../store/actions'

const server = setupServer(
    // Handles a GET request for a result
    rest.get("http://192.168.100.2:8080/server_calculator.js", (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({ result: 72 })
        )
    }),
    rest.get("http://192.168.100.2:8080/server_calculator.js/delHistory", (req, res, ctx) => {
        return res(
            ctx.status(200)
        )
    })
)

// Establish API mocking before all tests
beforeAll(() => server.listen())

// Reset any request handlers added during the tests, so they don't affect other tests
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished.
afterAll(() => server.close())

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const initialState = {
    calc: {
        firstNumber: '3',
        secondNumber: '24',
        operation: 'Multiplication',
        serverCalculation: true,
        result: 0
    }
}
const store = mockStore(initialState)

const wrapper = mount(
    <Provider store={store}>
        <Calculator />
    </Provider>
)

describe("The Calculator component dispatching async actions", () => {
    it("dispatches the right action when changing the server calculation checkbox", () => {
        const checkbox = wrapper.find('input[type="checkbox"]')
        checkbox.props().onChange()
        expect(store.getActions()).toContainEqual(changeCalculationType())
    })

    it("dispatches the right action when pressing Result button", (done) => {
        wrapper.find("Result").find("button").props().onClick()
        .then((action) => {
            expect(action.result).toEqual(72)
            expect(store.getActions()).toContainEqual(setResult(action.result))
            done()
        })
    })

    it("dispatches the right action when pressing Delete history button", (done) => {
        wrapper.find("button#deleteHistory").props().onClick()
        .then(() => {
            expect(store.getActions()).toContainEqual(deleteHistorySuccess())
            done()
        })
    })
})