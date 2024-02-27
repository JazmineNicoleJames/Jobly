"use strict";

const {
  NotFoundError,
  BadRequestError,
} = require("../expressError");

const db = require("../db.js");
const Job = require("./job.js");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

let floristJob;

beforeEach(async function () {
    await db.query("DELETE FROM jobs");
    floristJob = await Job.create({
        id: 1,
        title: "Florist",
        salary: 90000,
        equity: 0,
        company_handle: "c2",
    });
});

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** create */

describe("create", function () {
  test("works", async function () {
    const newJob = {
        title: "newJob",
        salary: 10000,
        equity: 0.1,
        company_handle: "c1"
    };

    let job = await Job.create({
      ...newJob
    });

    const found = await db.query("SELECT * FROM jobs WHERE title = 'newJob'");
    expect(found.rows[0]).toEqual(job)
    expect(found.rows.length).toEqual(1);

    const res = await db.query(`
        SELECT id,  
            title, 
            salary, 
            equity, 
            company_handle
        FROM jobs
        WHERE id = ${job.id}`);

    expect(res.rows[0]).toEqual({
        id: parseInt(job.id),
        title: "newJob",
        salary: 10000,
        equity: "0.1",
        company_handle: "c1"
    });
  });
});

describe("findAll", function () {
    test("works", async function () {
        const jobs = await Job.findAll();

        expect(jobs).toEqual([{
            id: floristJob.id,
            title: "Florist",
            salary: 90000,
            equity: "0",
            company_handle: "c2"
        }]);
    });
  });

describe("filter", function () {
    test("works", async function () {
        const cosmo = await Job.create({
            id: 1,
            title: "cosmetologist",
            salary: 90000,
            equity: 0,
            company_handle: "c2",
        });
        const title = "c"
        const jobs = await Job.filter(title);

        expect(jobs.every(j => j.title.toLowerCase().includes(title.toLowerCase())));
    });
});

describe("get by id", function () {
    test("works", async function () {
        const job = await Job.get(floristJob.id);
        expect(job).toEqual({company_handle: "c2",
           equity: "0",
           id: floristJob.id,
           salary: 90000,
           title: "Florist"
        });
    });
    test("fails for invalid id", async function () {
        try {
            const job = await Job.get(0);
            fail();
        } catch (err) {
          expect(err instanceof NotFoundError).toBeTruthy();
        };
    });
});

describe("update", function () {
    const updatedJob = {
        title: "Florist Assistant",
        salary: 40000
    };

    test("works", async function () {
        let job = await Job.update(floristJob.id, updatedJob);

        expect(job).toEqual({ 
            title: "Florist Assistant",
            salary: 40000,
            company_handle: "c2",
            equity: "0",
            id: floristJob.id
        });
    });
    test("bad data", async function () {
        try {
            await Job.update(floristJob.id, {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        };
    });
});

describe("delete", function () {
    test("works", async function () {
        await Job.remove(floristJob.id);
        const res = await db.query(
            `SELECT id FROM jobs WHERE id=${floristJob.id}`);
        expect(res.rows.length).toEqual(0);
      });
/*       test("invalid id", async function () {
        try {
            const fakeId = random.id;
            await Job.remove(fakeId);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    }); */
});

