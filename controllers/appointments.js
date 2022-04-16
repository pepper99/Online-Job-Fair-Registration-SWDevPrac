const Appointment = require("../models/Appointment");
const Hospital = require("../models/Hospital");

//@desc     Get all apppointments
//@route    GET /api/v1/apppointments
//@access   Public
exports.getAppointments = async (req, res, next) => {
  let query;

  //General users can see only their appointments
  if (req.user.role !== "admin") {
    query = Appointment.find({
      user: req.user.id,
    }).populate({
      path: "hospital",
      select: "name province tel",
    });
  } else {
    if (req.params.hospitalId) {
      query = Appointment.find({ hospital: req.params.hospitalId }).populate({
        path: "hospital",
        select: "name province tel",
      });
    } else {
      query = Appointment.find().populate({
        path: "hospital",
        select: "name province tel",
      });
    }
  }

  try {
    const appointments = await query;

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find appointment" });
  }
};

//@desc     Get single apppointment
//@route    GET /api/v1/apppointments/:id
//@access   Public
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate({
      path: "hospital",
      select: "name province tel",
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `No appointment with the id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find appointment" });
  }
};

//@desc     Add apppointment
//@route    POST /api/v1/hospitals/:hospitalId/appointment
//@access   Private
exports.addAppointment = async (req, res, next) => {
  try {
    req.body.hospital = req.params.hospitalId;

    const hospital = await Hospital.findById(req.params.hospitalId);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: `No hospital with the id of ${req.params.hospitalId}`,
      });
    }

    //add user Id to req.body
    req.body.user = req.user.id;

    //check for existed appointment
    const existedAppointments = await Appointment.find({ user: req.user.id });

    //if the user is not an admin, they can only create 3 appointment
    if (existedAppointments.length >= 3 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: `The user with ID ${req.user.id} has already made 3 appointments`,
      });
    }

    const appointment = await Appointment.create(req.body);

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot create appointment" });
  }
};

//@desc     Update apppointment
//@route    PUT /api/v1/appointments/:id
//@access   Private
exports.updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `No appointment with the id of ${req.params.id}`,
      });
    }

    if (
      appointment.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this appointment`,
      });
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot update appointment" });
  }
};

//@desc     Delete apppointment
//@route    DELETE /api/v1/appointments/:id
//@access   Private
exports.deleteAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `No appointment with the id of ${req.params.id}`,
      });
    }

    if (
      appointment.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this appointment`,
      });
    }

    await appointment.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot delete appointment" });
  }
};
