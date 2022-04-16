const Booking = require("../models/Booking");
const Company = require("../models/Company");

//@desc     Get all bookings
//@route    GET /api/v1/bookings
//@access   Public
exports.getBookings = async (req, res, next) => {
  let query;

  //General users can see only their bookings
  if (req.user.role !== "admin") {
    if (req.params.companyId) {
      query = Booking.find({
        user: req.user.id,
        company: req.params.companyId,
      }).populate({
        path: "company",
        select: "name tel website province",
      });
    } else {
      query = Booking.find({
        user: req.user.id,
      }).populate({
        path: "company",
        select: "name tel website province",
      });
    }
  } else {
    if (req.params.companyId) {
      query = Booking.find({ company: req.params.companyId }).populate({
        path: "company",
        select: "name tel website province",
      });
    } else {
      query = Booking.find().populate({
        path: "company",
        select: "name tel website province",
      });
    }
  }

  try {
    const bookings = await query;

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find booking" });
  }
};

//@desc     Get single booking
//@route    GET /api/v1/bookings/:id
//@access   Public
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: "company",
      select: "name tel website province",
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }

    if(req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: `This booking is unauthorized for user with the id of ${req.user.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find booking" });
  }
};

//@desc     Add booking
//@route    POST /api/v1/companies/:companyId/booking
//@access   Private
exports.addBooking = async (req, res, next) => {
  try {
    req.body.company = req.params.companyId;

    const company = await Company.findById(req.params.companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: `No company with the id of ${req.params.companyId}`,
      });
    }

    //add user Id to req.body
    req.body.user = req.user.id;

    //check for existed booking
    const existedBookings = await Booking.find({ user: req.user.id });

    //if the user is not an admin, they can only create 3 booking
    if (existedBookings.length >= 3 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: `The user with ID ${req.user.id} has already made 3 bookings`,
      });
    }

    //2021-12-02T17:00:00.000z
    const start = new Date("2022-05-10T00:00:00.000z");
    const end = new Date("2022-05-13T23:59:59.999z");
    const bookingDate = new Date(req.body.bookingDate);

    if (bookingDate < start || bookingDate > end) {
      return res.status(400).json({
        success: false,
        message: `A booking can only be made within May 10th - 13th, 2022.`,
      });
    }

    const booking = await Booking.create(req.body);

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot create booking" });
  }
};

//@desc     Update booking
//@route    PUT /api/v1/bookings/:id
//@access   Private
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this booking`,
      });
    }

    //2021-12-02T17:00:00.000z
    const start = new Date("2022-05-10T00:00:00.000z");
    const end = new Date("2022-05-13T23:59:59.999z");
    const bookingDate = new Date(req.body.bookingDate);

    if (bookingDate < start || bookingDate > end) {
      return res.status(400).json({
        success: false,
        message: `A booking can only be made within May 10th - 13th, 2022`,
      });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot update booking" });
  }
};

//@desc     Delete booking
//@route    DELETE /api/v1/bookings/:id
//@access   Private
exports.deleteBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this booking`,
      });
    }

    await booking.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot delete booking" });
  }
};
