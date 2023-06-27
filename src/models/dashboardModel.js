const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  mobileNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  personName: {
    type: String,
    required: true
  },
  emergencyContact: {
    type: String,
    required: true
  },
  emergencyEmail: {
    type: String,
    required: true
  },
  relation: {
    type: String,
    required: true
  }
});

const Dashboard = mongoose.model('Dashboard', dashboardSchema);

module.exports = Dashboard;
