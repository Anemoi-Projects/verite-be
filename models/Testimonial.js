const { Schema, default: mongoose } = require("mongoose");

const TestimonialSchema = new Schema(
    {
    customerName: {
        type: String
    },
    customerDesignation: {
        type: String
    },
    customerReview : {
        type: String,
    },
    backgroundImage: {
        type: String
    },
    public_id: {
        type: String
    }
},
{timestamps: true}
);

const Testimonial = mongoose.model('testimonial', TestimonialSchema);
module.exports = Testimonial;