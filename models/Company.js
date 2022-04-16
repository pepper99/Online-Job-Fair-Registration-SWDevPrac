const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxLength: [50, "Name can not be more than 50 characters"],
    },
    website: {
      type: String,
      required: [true, "Please add a website"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    district: {
      type: String,
      required: [true, "Please add a district"],
    },
    province: {
      type: String,
      required: [true, "Please add a province"],
    },
    postalcode: {
      type: String,
      required: [true, "Please add a postalcode"],
      maxLength: [5, "Postal Code can not be more than 5 digits"],
    },
    tel: {
      type: String,
      required: [true, "Please add a telephone number"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: "throw",
  }
);

//Cascade delete with appointments when a company is deleted
CompanySchema.pre("remove", async function (next) {
  console.log(`Bookings being removed from ${this._id}`);
  await this.model("Booking").deleteMany({ company: this._id });
  next();
});

//Reverse populate with virtuals
CompanySchema.virtual("bookings", {
  ref: "Booking",
  localField: "_id",
  foreignField: "company",
  justOne: false,
});

module.exports = mongoose.model("Company", CompanySchema);
