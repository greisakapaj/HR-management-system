import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [loginError, setLoginError] = useState("");

  const [employees, setEmployees] = useState([]);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
    salary: "",
    joiningDate: "",
    status: "Active",
  });

  const departmentOptions = [
    "Human Resources",
    "Finance",
    "IT",
    "Marketing",
    "Operations",
    "Sales",
    "Administration",
  ];

  useEffect(() => {
    if (isLoggedIn) {
      fetchEmployees();
    }
  }, [isLoggedIn]);

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (loginData.username === "admin" && loginData.password === "admin123") {
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");
      setLoginError("");
    } else {
      setLoginError("Invalid username or password.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  const fetchEmployees = () => {
    fetch("http://localhost:5000/api/employees")
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch((error) => console.log("Error fetching employees:", error));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (Number(formData.salary) <= 0) {
      alert("Salary must be greater than 0.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    if (formData.joiningDate > today) {
      alert("Joining date cannot be in the future.");
      return;
    }

    const duplicateEmail = employees.some(
      (employee) =>
        employee.email.toLowerCase() === formData.email.toLowerCase() &&
        employee.id !== editId
    );

    if (duplicateEmail) {
      alert("An employee with this email already exists.");
      return;
    }

    const url = editId
      ? `http://localhost:5000/api/employees/${editId}`
      : "http://localhost:5000/api/employees";

    const method = editId ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then(() => {
        fetchEmployees();
        resetForm();
      })
      .catch((error) => console.log("Error saving employee:", error));
  };

  const handleEdit = (employee) => {
    setEditId(employee.id);

    setFormData({
      name: employee.name || "",
      email: employee.email || "",
      position: employee.position || "",
      department: employee.department || "",
      salary: employee.salary || "",
      joiningDate: employee.joiningDate || "",
      status: employee.status || "Active",
    });
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmDelete) {
      return;
    }

    fetch(`http://localhost:5000/api/employees/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        fetchEmployees();
      })
      .catch((error) => console.log("Error deleting employee:", error));
  };

  const resetForm = () => {
    setEditId(null);

    setFormData({
      name: "",
      email: "",
      position: "",
      department: "",
      salary: "",
      joiningDate: "",
      status: "Active",
    });
  };

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active"
  ).length;

  const onLeaveEmployees = employees.filter(
    (employee) => employee.status === "On Leave"
  ).length;

  const inactiveEmployees = employees.filter(
    (employee) => employee.status === "Inactive"
  ).length;

  const totalSalary = employees.reduce((total, employee) => {
    return total + Number(employee.salary || 0);
  }, 0);

  const averageSalary =
    employees.length > 0 ? Math.round(totalSalary / employees.length) : 0;

  const departments = [
    "All",
    ...new Set(employees.map((employee) => employee.department).filter(Boolean)),
  ];

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      selectedDepartment === "All" ||
      employee.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  const exportToCSV = () => {
    if (employees.length === 0) {
      alert("No employees to export.");
      return;
    }

    const headers = [
      "Employee ID",
      "Name",
      "Email",
      "Position",
      "Department",
      "Salary",
      "Joining Date",
      "Status",
    ];

    const rows = employees.map((employee) => [
      employee.employeeCode || "N/A",
      employee.name,
      employee.email,
      employee.position,
      employee.department,
      employee.salary,
      employee.joiningDate || "N/A",
      employee.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "employees.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <div className="login-box">
          <h1>HR Management System</h1>
          <h2>Admin Login</h2>

          <form className="login-form" onSubmit={handleLogin}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={loginData.username}
              onChange={handleLoginChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={handleLoginChange}
              required
            />

            {loginError && <p className="login-error">{loginError}</p>}

            <button type="submit">Login</button>
          </form>

          <p className="login-hint">Username: admin | Password: admin123</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="top-bar">
        <h1>HR Management System</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="dashboard">
        <div className="card">
          <h3>Total Employees</h3>
          <p>{totalEmployees}</p>
        </div>

        <div className="card">
          <h3>Active</h3>
          <p>{activeEmployees}</p>
        </div>

        <div className="card">
          <h3>On Leave</h3>
          <p>{onLeaveEmployees}</p>
        </div>

        <div className="card">
          <h3>Inactive</h3>
          <p>{inactiveEmployees}</p>
        </div>

        <div className="card">
          <h3>Total Salary Cost</h3>
          <p>{totalSalary.toLocaleString()} €</p>
        </div>

        <div className="card">
          <h3>Average Salary</h3>
          <p>{averageSalary.toLocaleString()} €</p>
        </div>
      </div>

      <h2>{editId ? "Edit Employee" : "Add Employee"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Employee name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Employee email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="position"
          placeholder="Position"
          value={formData.position}
          onChange={handleChange}
          required
        />

        <select
          name="department"
          value={formData.department}
          onChange={handleChange}
          required
        >
          <option value="">Select Department</option>
          {departmentOptions.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="salary"
          placeholder="Salary"
          value={formData.salary}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="joiningDate"
          value={formData.joiningDate}
          onChange={handleChange}
          required
        />

        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Inactive">Inactive</option>
        </select>

        <button type="submit">
          {editId ? "Update Employee" : "Add Employee"}
        </button>

        {editId && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      <h2>Employees</h2>

      <div className="table-actions">
        <button onClick={exportToCSV}>Export Employees</button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by ID, name, email, position, or department"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          {departments.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
      </div>

      {filteredEmployees.length === 0 ? (
        <p className="empty-message">No employees found.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Position</th>
                <th>Department</th>
                <th>Salary</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.employeeCode || "N/A"}</td>
                  <td>{employee.name}</td>
                  <td>{employee.email}</td>
                  <td>{employee.position}</td>
                  <td>{employee.department}</td>
                  <td>{Number(employee.salary || 0).toLocaleString()} €</td>
                  <td>{employee.joiningDate || "N/A"}</td>
                  <td>
                    <span
                      className={`status-badge ${employee.status
                        ?.toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {employee.status}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleEdit(employee)}>Edit</button>
                    <button onClick={() => handleDelete(employee.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    
    </div>
  );
}

export default App;