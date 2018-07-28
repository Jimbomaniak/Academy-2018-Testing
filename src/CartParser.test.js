import CartParser from './CartParser';
import { parse } from 'querystring';
import path from 'path';
import cartJsonFile from '../samples/cart.json';



jest.mock('uuid', () => {
    return {
        v4: jest.fn(() => 1)
    }
})

const cart = {
    "items": [
        {
            "id": 1,
            "name": "Mollis consequat",
            "price": 9,
            "quantity": 2
        },
        {
            "id": 1,
            "name": "Tvoluptatem",
            "price": 10.32,
            "quantity": 1
        },
        {
            "id": 1,
            "name": "Scelerisque lacinia",
            "price": 18.9,
            "quantity": 1
        },
        {
            "id": 1,
            "name": "Consectetur adipiscing",
            "price": 28.72,
            "quantity": 10
        },
        {
            "id": 1,
            "name": "Condimentum aliquet",
            "price": 13.9,
            "quantity": 1
        }
    ],
    "total": 348.32
}
const absolutePath = path.resolve('./samples/cart.csv');

let parser,
    parseFunc,
    validate,
    parseLine,
    calcTotal,
    readFile,
    createError

beforeEach(() => {
    parser = new CartParser();
    parseFunc = parser.parse.bind(parser);
    calcTotal = parser.calcTotal.bind(parser);
    parseLine = parser.parseLine.bind(parser);
    validate = parser.validate.bind(parser);
    readFile = parser.readFile.bind(parser);
    createError = parser.createError.bind(createError);

});

describe("CartParser - unit tests", () => {
    // Add your unit tests here.
    it('should calculate the total price of items added to the cart', () => {
        expect(calcTotal(cart.items)).toBeCloseTo(348.32, 2);
    });

    it('should convert one csv line to one item object', () => {
        const csvLine = 'Mollis consequat,9.00,2';
        const cartItem = {
            "id": 1,
            "name": "Mollis consequat",
            "price": 9,
            "quantity": 2
        };

        expect(parseLine(csvLine)).toEqual(cartItem);
    });

    it('json cart file has properties like in schema', () => {
        expect(cartJsonFile).toHaveProperty('items')
        expect(cartJsonFile).toHaveProperty('total')
    })

    // Integration test  - reads file
    it('should return json object with all fields', () => {
        expect(parseFunc(absolutePath)).toEqual(cart);
    });

    it('should throw error if validation fails', () => {
        parser.validate = jest.fn(() => ['error'])
        expect(() => {parseFunc(absolutePath)}).toThrow()
    })

    it('should return array with error if got wrong header name not like in scheme', () => {
        parser.createError = jest.fn(() => 'wrong header');
        const csvWrongHeader = 'Wrong name,Price,Quantity\nMollis consequat,9.00,2';
        expect(validate(csvWrongHeader)).toEqual(['wrong header']);
    });

    it('should return array with error if got negative number', () => {
        parser.createError = jest.fn(() => 'negative number');
        const csvWrongHeader = 'Product name,Price,Quantity\nTvoluptatem,-2,1';
        expect(validate(csvWrongHeader)).toEqual(['negative number']);
    });

    it('should return array with error if got empty cell', () => {
        parser.createError = jest.fn(() => 'empty cell');
        const csvWrongHeader = 'Product name,Price,Quantity\n , 1, '

        expect(validate(csvWrongHeader)).toEqual(['empty cell']);
    });


    it('should return array with error if got not valid number of cells in a row', () => {
        parser.createError = jest.fn(() => 'not valid number of cells');
        const csvWrongHeader = 'Product name,Price,Quantity\nTvoluptatem,1,1\n1,3\n';

        expect(validate(csvWrongHeader)).toEqual(['not valid number of cells']);
    });

    it('should return empty array if no errors', () => {
        parser.createError = jest.fn();
        const csvWrongHeader = 'Product name,Price,Quantity\nMollis consequat,9.00,2';

        expect(validate(csvWrongHeader)).toEqual([]);
    });

    it('should return error if path is not exist or not absolute', () => {
        const wrongPath = '/samples/cart.csv';

        expect(() => {readFile(wrongPath)}).toThrow()
    })




});

describe("CartParser - integration tests", () => {
    // Add your integration tests here.

});