"use strict";

/** Routes for jobs. */
const jsonschema = require("jsonschema");
const express = require("express");
const Job = require("../models/job");
const jobNewSchema = require("../schemas/jobNew.json");
const { ensureLoggedIn, isAdmin, ensureLoggedInOrAdmin } = require("../middleware/auth");

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: login, isAdmin
 */

router.post("/", ensureLoggedIn, isAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    };
    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  };
});

/** GET /  =>
 *   { jobs: [ { id, title, salary, equity, companyHandle }, ...] }
 *
 * Can filter on provided search filters:
 * - hasEquity
 * - minSalary
 * - titleLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {

  try {
    /* If there is anything in the request query, 
    save the data and respond with it */ 

    let jobs;
    if(Object.keys(req.query).length !== 0){
      
      let title = req.query.title;
      let minSalary = req.query.minSalary;
      let hasEquity = req.query.hasEquity;

      jobs = await Job.filter(title, minSalary, hasEquity);
 
      if(jobs.length === 0){
        return res.status(404).json({message: "No jobs matching that filter"})
      }
      return res.json({ jobs })
    }

    /*  find all jobs without a filter*/
    jobs = await Job.findAll();
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});


/** GET /[id] => { id }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: login
 **/

router.get("/:id", ensureLoggedInOrAdmin, async function (req, res, next) {
    try {
        const { id } = req.params;
        const job = await Job.get(id);
        return res.json({ job });
      } catch (err) {
        return next(err);
      };
});

/** PATCH /[id] { id } => { id }
 *
 * Data can include:
 *   { title, salary, equity }
 *
 * Returns { id,title, salary, equity, company_handle }
 *
 * Authorization required: login or isAdmin
 **/

router.patch("/:id", ensureLoggedInOrAdmin, async function (req, res, next) {
    try {  
      const job = await Job.update(req.params.id, req.body);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });
  
  
  /** DELETE /[id]  =>  { deleted: id }
   *
   * Authorization required: login or isAdmin
   **/
  
  router.delete("/:id", ensureLoggedInOrAdmin, async function (req, res, next) {
    try {
      const { id } = req.params;
      await Job.remove(id);
      return res.json({ deleted: req.params });
    } catch (err) {
      return next(err);
    };
  });
  


module.exports = router;