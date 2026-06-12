const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const router = express.Router();

const filePath = path.join(__dirname, "../data/employees.json");

function readEmployees() {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

function writeEmployees(employees) {
  fs.writeFileSync(filePath, JSON.stringify(employees, null, 2));
}

function generateEmployeeCode(employees) {
  const numbers = employees
    .map((employee) => employee.employeeCode)
    .filter((code) => code && code.startsWith("EMP-"))
    .map((code) => Number(code.replace("EMP-", "")))
    .filter((number) => !isNaN(number));

  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

  return `EMP-${String(nextNumber).padStart(3, "0")}`;
}

// Get all employees
router.get("/", (req, res) => {
  const employees = readEmployees();
  res.json(employees);
});

// Add employee
router.post("/", (req, res) => {
  const employees = readEmployees();

  const newEmployee = {
    id: crypto.randomUUID(),
    employeeCode: generateEmployeeCode(employees),
    name: req.body.name,
    email: req.body.email,
    position: req.body.position,
    department: req.body.department,
    salary: req.body.salary,
    joiningDate: req.body.joiningDate,
    status: req.body.status || "Active",
  };

  employees.push(newEmployee);
  writeEmployees(employees);

  res.status(201).json(newEmployee);
});

// Update employee
router.put("/:id", (req, res) => {
  const employees = readEmployees();

  const index = employees.findIndex((employee) => employee.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Employee not found" });
  }

  employees[index] = {
    ...employees[index],
    name: req.body.name,
    email: req.body.email,
    position: req.body.position,
    department: req.body.department,
    salary: req.body.salary,
    joiningDate: req.body.joiningDate,
    status: req.body.status,
  };

  writeEmployees(employees);

  res.json(employees[index]);
});

// Delete employee
router.delete("/:id", (req, res) => {
  let employees = readEmployees();

  const employeeExists = employees.some(
    (employee) => employee.id === req.params.id
  );

  if (!employeeExists) {
    return res.status(404).json({ message: "Employee not found" });
  }

  employees = employees.filter((employee) => employee.id !== req.params.id);

  writeEmployees(employees);

  res.json({ message: "Employee deleted successfully" });
});

module.exports = router;