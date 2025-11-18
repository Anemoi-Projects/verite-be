const { default: mongoose } = require("mongoose");
const {
  sendErrorResponse,
} = require("../../handlers/errorHandler/errorHandler");
const FAQ = require("../../models/FAQ");

const getAllFAQ = async (req, res) => {
  try {
    const agg = [
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
            from: "categories",
            localField: "tag",
            foreignField: "_id",
            as: "categories",
          },
      },
      {
        $project: {
          question: 1,
          answer: 1,
          tag: 1,
          categories: "$categories.name",
        },
      },
    ];

    const faq = await FAQ.aggregate(agg);
    return res.status(200).json({ success: true, data: faq });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

const getFAQ = async (req, res) => {
  try {
    const { id } = req.query;

    const agg = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
            from: "categories",
            localField: "tag",
            foreignField: "_id",
            as: "categories",
          },
      },
      {
        $project: {
          question: 1,
          answer: 1,
          tag: 1,
          categories: "$categories.name",
        },
      },
    ];

    const faq = await FAQ.aggregate(agg);
    return res.status(200).json({ success: true, data: faq[0] });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

const createFAQ = async (req, res) => {
  try {
    const { question, answer, tag } = req.body;

    if (!question) return sendErrorResponse(res, 400, "Question is required");
    if (!answer) return sendErrorResponse(res, 400, "Answer is required");

    let categories = [];
    if (tag) {
      try {
        tag.forEach((tagID) => {
          categories.push(tagID);
        });
      } catch (err) {
        console.log(err);
        return res.status(400).json({ error: "Invalid categories JSON" });
      }
    }

    const faqData = {
      question: question,
      answer: answer,
      tag: categories,
    };

    const newfaq = await FAQ.create(faqData);

    return res.status(200).json({ success: true, data: newfaq });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return sendErrorResponse(res, 400, "id is required");

    const faq = await FAQ.findByIdAndDelete(id);
    if (!faq) return sendErrorResponse(res, 404, "FAQ not found");

    return res
      .status(200)
      .json({ success: true, data: "Successfully deleted FAQ" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

const editFAQ = async (req, res) => {
  try {
    const { id } = req.query;
    const { question, answer, tag } = req.body;

    if (!id) return sendErrorResponse(res, 400, "id is required");

    if (!question) return sendErrorResponse(res, 400, "question is required");
    if (!answer) return sendErrorResponse(res, 400, "answer is required");

    let categories = [];
    if (tag) {
      try {
        tag.forEach((tagID) => {
          categories.push(tagID);
        });
      } catch (err) {
        console.log(err);
        return res.status(400).json({ error: "Invalid categories JSON" });
      }
    }

    const updateData = {
      question: question,
      answer: answer,
      tag: categories,
    };

    const faqData = await FAQ.findByIdAndUpdate(id, updateData, { new: true });

    return res.status(200).json({ success: true, data: faqData });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

module.exports = { getAllFAQ, getFAQ, createFAQ, deleteFAQ, editFAQ };
