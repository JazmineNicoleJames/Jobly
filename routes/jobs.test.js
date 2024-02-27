"use strict";

const request = require("supertest");
const db = require("../db.js");
const app = require("../app");
const Job = require("../models/job");
let floristJob;

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u3Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

beforeEach(async function () {
    await db.query("DELETE FROM jobs");

    floristJob = await Job.create({
        id: 1,
        title: "Florist",
        salary: 90000,
        equity: 0,
        company_handle: "c2",
    });
})

/************************************** POST /jobs */

describe("POST /jobs", function () {
  test("works for jobs", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "barback",
          salary: 50000,
          equity: 0,
          company_handle: "c1"
        })
        .set("authorization", `Bearer ${u3Token}`);
    expect(resp.statusCode).toEqual(201);
  });
});

describe("GET /jobs", function () {
    test("works for getting all jobs", async function () {
        const resp = await request(app)
            .get("/jobs")
            .set("authorization", `Bearer ${u3Token}`);
        expect(resp.statusCode).toBe(200);
    });
});

describe("GET /jobs/:id", function () {
    test("get a job by id - auth required", async function() {
        const createdJob = await Job.create({
            title: "Florist",
            salary: "85000",
            equity: 0,
            company_handle: "c3"
        });
        const id = createdJob.id;
        const res = await request(app)
            .get(`/jobs/${id}`)
            .set("authorization", `Bearer ${u3Token}`);

        expect(res.statusCode).toBe(200);
    });
    test("unauthorized to get job by id", async function () {
        const createdJob = await Job.create({
            title: "Florist",
            salary: "85000",
            equity: 0,
            company_handle: "c3"
        });
        const id = createdJob.id;
        const res = await request(app)
            .get(`/jobs/${id}`);
        expect(res.statusCode).toBe(401);
    });
});

describe("PATCH /jobs/:id", function () {
    test("update job by title, salary, equity", async function () {
        const res = await request(app)
            .patch(`/jobs/${floristJob.id}`)
            .send({ 
                title: "Florist Intern",
                salary: 50000,
                equity: 0})
            .set("authorization", `Bearer ${u3Token}`);
        expect(res.statusCode).toBe(200);
    });
    test("unauthorized to update job", async function () {
        const res = await request(app)
            .patch(`/jobs/${floristJob.id}`)
            .send({ 
                title: "Florist Intern",
                salary: 50000,
                equity: 0});
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({ message: "User unauthorized"});
    });
});

describe("DELETE /jobs/:id", function () {
    test("delete a job - auth required: login or isAdmin", async function () {
        const res = await request(app)
            .delete(`/jobs/${floristJob.id}`)
            .set("authorization", `Bearer ${u3Token}`);
        expect(res.statusCode).toBe(200);
    });
    test("unauthorized to delete job", async function () {
        const res = await request(app)
            .delete(`/jobs/${floristJob.id}`)
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({ message: "User unauthorized"});
    });
});