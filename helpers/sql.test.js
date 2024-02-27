process.env.NODE_ENV = "test";
const { request } = require("express");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const app = require('../app');
const Company = require("../models/company");
const User = require('../models/user');
const { sqlForPartialUpdate } = require("./sql");



describe("sqlForPartialUpdate", function(){

    test("Updating a user", async () => {
        const dataToUpdate = {
            firstName: 'Aliya',
             age: 32
        }

        const jsToSql = {
            firstName: 'first_name'
        };

        const expectedValue = ['Aliya', 32]

        const res = sqlForPartialUpdate(dataToUpdate, jsToSql);

        expect(res.values).toEqual(expectedValue)
    })
})
