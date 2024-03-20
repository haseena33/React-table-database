import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  Modal,
  TextField,
  Button,
} from "@mui/material";
import { MoreVert, Close } from "@mui/icons-material";
import axios from "axios"; // for making HTTP requests
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled from "styled-components";

const StyledTextField = styled(TextField)`
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type="number"] {
    -moz-appearance: textfield;
  }
`;

function UserTable() {
  const [users, setUsers] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openViewDetailsModal, setOpenViewDetailsModal] = useState(false);
  const [editedUserData, setEditedUserData] = useState({});
  const [openEditEmailModal, setOpenEditEmailModal] = useState(false);
  const [editedEmail, setEditedEmail] = useState("");
  const [errors, setErrors] = useState({
    firstNameError: "",
    lastNameError: "",
    emailError: "",
    phoneError: "",
    editedEmailError: "",
  });

  useEffect(() => {
    axios
      .get("http://localhost:3000/users/all")
      .then((response) => {
        // Set status for each user based on the status field from the backend
        const initialUsers = response.data.map((user) => ({
          ...user,
          status: user.status ? "active" : "inactive",
        }));
        setUsers(initialUsers);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, []);

  // const handleStatusChange = (event, user) => {
  //   const updatedUsers = users.map((u) => {
  //     if (u.employeeId === user.employeeId) {
  //       return { ...u, status: u.status === "active" ? "inactive" : "active" };
  //     }
  //     return u;
  //   });
  //   setUsers(updatedUsers);
  // };

  // Update the handleStatusChange function in UserTable component

  const handleStatusChange = (event, user) => {
    const newStatus = user.status === "active" ? "inactive" : "active";

    // Update status locally
    const updatedUsers = users.map((u) =>
      u.employeeId === user.employeeId ? { ...u, status: newStatus } : u
    );
    setUsers(updatedUsers);

    // Send request to update status in backend
    axios
      .put(`http://localhost:3000/users/updateStatus/${user.employeeId}`, {
        status: newStatus === "active" ? true : false, // Convert status to boolean
      })
      .then((response) => {
        console.log("Status updated successfully");
        toast.success("Status updated successfully");
      })
      .catch((error) => {
        console.error("Error updating status:", error);
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.employeeId === user.employeeId ? { ...u, status: user.status } : u
          )
        );
        toast.error("Error updating status");
      });
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDetails = (user) => {
    setEditedUserData({ ...user });
    setOpenViewDetailsModal(true);
    handleMenuClose();
  };

  const handleCloseViewDetailsModal = () => {
    setOpenViewDetailsModal(false);
  };

  const handleEditEmail = () => {
    setEditedEmail(selectedUser.email);
    setOpenEditEmailModal(true);
    handleMenuClose();
  };

  const handleCloseEditEmailModal = () => {
    setOpenEditEmailModal(false);
  };

  const handleSaveEmail = () => {
    // Validate email
    if (!editedEmail) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        editedEmailError: "Email is required",
      }));
      return;
    }

    const updatedUsers = users.map((u) =>
      u.employeeId === selectedUser.employeeId
        ? { ...u, email: editedEmail }
        : u
    );
    setUsers(updatedUsers);

    // Send request to update email to backend
    axios
      .put(
        `http://localhost:3000/users/updateEmail/${selectedUser.employeeId}`,
        {
          email: editedEmail,
        }
      )
      .then((response) => {
        console.log("Email updated successfully");
        toast.success("Email updated successfully");
      })
      .catch((error) => {
        console.error("Error updating email:", error);
        toast.error("Error updating email");
      });

    handleCloseEditEmailModal();
  };

  const handleSave = () => {
    // Validate fields
    const { firstName, lastName, email, phone } = editedUserData;
    const errors = {};
    if (!firstName) {
      errors.firstNameError = "First Name is required";
    }
    if (!lastName) {
      errors.lastNameError = "Last Name is required";
    }
    if (!email) {
      errors.emailError = "Email is required";
    }
    if (!phone) {
      errors.phoneError = "Phone is required";
    }
    setErrors(errors);

    // If there are errors, stop saving
    if (Object.keys(errors).length > 0) {
      return;
    }

    const updatedUsers = users.map((u) =>
      u.employeeId === editedUserData.employeeId ? editedUserData : u
    );
    setUsers(updatedUsers);

    // Send request to update backend data
    axios
      .put(
        `http://localhost:3000/users/updateDetails/${editedUserData.employeeId}`,
        editedUserData
      )
      .then((response) => {
        console.log("Backend data updated successfully");
        toast.success("Updated successfully");
      })
      .catch((error) => {
        console.error("Error updating backend data:", error);
        toast.error("Error updating backend data");
      });

    handleCloseViewDetailsModal();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let error = "";

    if (name === "firstName" || name === "lastName") {
      // Validate first name and last name (allow only alphabets)
      if (!/^[a-zA-Z]*$/.test(value)) {
        error = `Please enter a valid ${
          name === "firstName" ? "first" : "last"
        } name (only alphabets are allowed)`;
      }
    } else if (name === "phone") {
      // Validate phone number (allow 10 digits only)
      if (value && !/^\d{10}$/.test(value)) {
        error = "Phone number allows up to 10 digits only";
      }
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [`${name}Error`]: error, // Store error message specific to the field
    }));

    setEditedUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleEditedEmailChange = (e) => {
    const { value } = e.target;
    setEditedEmail(value);

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        editedEmailError: "Invalid email format",
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        editedEmailError: "",
      }));
    }
  };

  return (
    <>
      <ToastContainer />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#301934" }}>
              <TableCell style={{ color: "white", fontSize: "medium" }}>
                <strong>Employee ID</strong>
              </TableCell>
              <TableCell style={{ color: "white", fontSize: "medium" }}>
                <strong>First Name</strong>
              </TableCell>
              <TableCell style={{ color: "white", fontSize: "medium" }}>
                <strong>Last Name</strong>
              </TableCell>
              <TableCell>
                <strong style={{ color: "white", fontSize: "medium" }}>
                  Email
                </strong>
              </TableCell>
              <TableCell style={{ color: "white", fontSize: "medium" }}>
                <strong>Phone</strong>
              </TableCell>
              <TableCell style={{ color: "white", fontSize: "medium" }}>
                <strong>Status</strong>
              </TableCell>
              <TableCell style={{ color: "white", fontSize: "medium" }}>
                <strong>Action</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.employeeId}
                style={{
                  backgroundColor:
                    user.status === "inactive" ? "#bfbdbd" : "inherit",
                }} // Change background color for inactive rows
              >
                <TableCell>{user.employeeId}</TableCell>
                <TableCell>{user.firstName}</TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>
                  {user.status === "active" ? "Active" : "Inactive"}
                  <Switch
                    checked={user.status === "active"}
                    onChange={(event) => handleStatusChange(event, user)}
                    color="primary"
                    // disabled={user.status === "inactive"}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    aria-label="more"
                    aria-controls="long-menu"
                    aria-haspopup="true"
                    onClick={(event) => handleMenuOpen(event, user)}
                    disabled={user.status === "inactive"}
                  >
                    <MoreVert />
                  </IconButton>
                  {user.status === "active" && (
                    <Menu
                      id="long-menu"
                      anchorEl={anchorEl}
                      open={Boolean(
                        anchorEl &&
                          selectedUser &&
                          selectedUser.employeeId === user.employeeId
                      )}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={handleEditEmail}>Edit Email</MenuItem>
                      <MenuItem onClick={() => handleViewDetails(user)}>
                        View/Edit Details
                      </MenuItem>
                    </Menu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={openViewDetailsModal} onClose={handleCloseViewDetailsModal}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
            width: "450px",
          }}
        >
          <h2>Edit Details</h2>
          <IconButton
            style={{ position: "absolute", top: 15, right: 10 }}
            onClick={handleCloseViewDetailsModal}
          >
            <Close />
          </IconButton>
          <TextField
            name="firstName"
            type="text"
            label="First Name"
            value={editedUserData.firstName}
            onChange={handleInputChange}
            fullWidth
            error={!!errors.firstNameError}
            helperText={errors.firstNameError}
          />
          <br />
          <br />
          <TextField
            name="lastName"
            type="text"
            label="Last Name"
            value={editedUserData.lastName}
            onChange={handleInputChange}
            fullWidth
            error={!!errors.lastNameError}
            helperText={errors.lastNameError}
          />
          <br />
          <br />
          <TextField
            name="email"
            type="email"
            label="Email"
            value={editedUserData.email}
            onChange={handleInputChange}
            fullWidth
            disabled
            error={!!errors.emailError}
            helperText={errors.emailError}
          />
          <br />
          <br />
          <StyledTextField
            name="phone"
            type="number"
            label="Phone"
            value={editedUserData.phone}
            onChange={handleInputChange}
            fullWidth
            error={!!errors.phoneError}
            helperText={errors.phoneError}
          />
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            style={{ margin: "10px" }}
          >
            Save
          </Button>
        </div>
      </Modal>
      <Modal open={openEditEmailModal} onClose={handleCloseEditEmailModal}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          <h2>Edit Email</h2>
          <IconButton
            style={{ position: "absolute", top: 15, right: 10 }}
            onClick={handleCloseEditEmailModal}
          >
            <Close />
          </IconButton>
          <TextField
            label="Email"
            type="email"
            value={editedEmail}
            onChange={handleEditedEmailChange}
            fullWidth
            error={!!errors.editedEmailError}
            helperText={errors.editedEmailError}
          />
          <Button
            onClick={handleSaveEmail}
            variant="contained"
            color="primary"
            style={{ margin: "10px" }}
          >
            Save
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default UserTable;
